// js/modules/print-sheet.js
// THE APP BRIDGE to the sheet engine: generate the items, measure the cells the kit cannot size
// on its own, hand everything to a page role, render the pupil sheet and its facsimile key.
//
//   buildSheet(req)            -> {pupilHtml, keyHtml, pageCount, keyPageCount, fits, items, plan}
//   sheetDocument(html, title) -> a standalone printable HTML document (A4, margins 0, Andika)
//
// WHY THIS LAYER EXISTS. The kit (`js/modules/sheet/`) is pure: it cannot call the generators,
// read `data.js` or touch the DOM. Three things need the app, and all three live here:
//   1. GENERATION through `generateQuestionFor` - seeded, the skill's own options honoured - never
//      bare `generateQuestion`. Duplicates are retried under a new seed.
//   2. MEASUREMENT (SKILL_CELL_CONTRACT.md SCC-A6). A skill that has no registered cell template
//      prints through the kit's `legacy` template, which wraps the app's existing per-item print
//      HTML; its height cannot be known statically, so every cell is rendered once off-screen at
//      each column count the layout may choose, in the real stylesheets, and its height and
//      whether it fits (no overflow, no clipping, no picture shrunk to fit - DN-10) go into the
//      layout. The layout itself stays measure-free (`sheet/layout.js`).
//   3. The skill METADATA the frame prints: label, level, strand, instruction key.
//
// Layer 6 (print-*): imports generate-question.js, data.js, print-generate.js and the kit.
// Importing print-generate.js also installs the kit's legacy adapters (it calls
// `installLegacyAdapters` at module load), which is what lets the `legacy` template reach the
// app's print branches.

import { generateQuestionFor } from './generate-question.js';
import { getSkillGrade, getSkillPrintSize, SKILL_FULL_LABELS } from './data.js';
import { kitCellSpec } from './print-generate.js';
import { renderCell, cellAnswerKey, cellFootprint, resolveCtx, SIZES } from './sheet/index.js';
import { plan as independentPlan } from './sheet/roles/independent.js';
import { plan as morePracticePlan, letterSeed } from './sheet/roles/more-practice.js';
import { renderPlan, SHEET_ENGINE_CSS, skillWords } from './sheet/roles/practice.js';
import { resolveSectionLayout, cellWidthMm, LIVE_W_MM } from './sheet/layout.js';
import { paginate } from './sheet/paginate.js';

/* ======================================================================== constants */

const PX_PER_MM = 96 / 25.4;
const ROLES = new Set(['independent', 'more-practice']);
const LETTERS = 'ABCDEFGHIJ';
const MAX_ITEMS = 160;            // ten More Practice pages of 16 one-symbol items
const RETRIES = 12;               // duplicate retries per item before a duplicate is accepted

/** The stylesheets a sheet document renders with, in the app's cascade order. */
const SHEET_STYLESHEETS = Object.freeze([
    'css/variables.css', 'css/base.css', 'css/ui-components.css', 'css/word-problem-visuals.css',
    'css/print-worksheet.css', 'css/fonts/andika.css', 'css/sheet-kit.css',
]);

/* ================================================================ request normalising */

const clampInt = (v, lo, hi, d) => { const n = Math.floor(Number(v)); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : d; };

function normaliseRequest(req = {}) {
    const role = ROLES.has(req.role) ? req.role : 'independent';
    const size = ['S', 'M', 'L'].includes(req.size) ? req.size : 'L';
    // PT-LOOK-1: both roles default to the I Can look; the dialog may choose Daily.
    const look = req.look === 'daily' ? 'daily' : 'ican';
    const paper = /letter/i.test(String(req.paper || '')) ? 'Letter' : 'A4';
    const seed = Number.isFinite(Number(req.seed)) && req.seed !== null && req.seed !== ''
        ? (Number(req.seed) >>> 0) : (Math.floor(Math.random() * 900000) + 100000);
    const sections = (Array.isArray(req.sections) ? req.sections : [])
        .map((s) => ({
            skills: (s && Array.isArray(s.skills) ? s.skills : []).filter((k) => k && k.categoryId && k.skillId),
            count: s && s.count !== undefined && s.count !== null && s.count !== 'auto' ? clampInt(s.count, 1, MAX_ITEMS, null) : null,
            pages: s && s.pages ? clampInt(s.pages, 1, 10, 1) : null,
            columns: s && s.columns && s.columns !== 'auto' ? clampInt(s.columns, 1, 10, 'auto') : 'auto',
            instructionKey: s && s.instructionKey,
        }))
        .filter((s) => s.skills.length);
    return {
        role, size, look, paper, seed, sections,
        form: req.form || 'A',
        key: req.key !== false,
        header: Object.assign({}, req.header || {}),
        labels: req.labels,
        lesson: req.lesson || (req.header && req.header.lesson),
        letters: Array.isArray(req.letters) ? req.letters.map((l) => String(l).toUpperCase()).filter((l) => LETTERS.includes(l)) : null,
        photocopySafe: !!req.photocopySafe,
    };
}

/* ======================================================================= generation */

/** A question's identity for de-duplication: what the pupil would see as "the same problem". */
function signature(q) {
    const payload = q.cell && q.cell.payload ? JSON.stringify(q.cell.payload) : '';
    const ans = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans);
    return `${String(q.text || '').replace(/\s+/g, ' ').trim()}|${ans}|${payload}`;
}

/**
 * The skills of a section, dealt into `count` slots by weight (largest remainder), grouped in
 * the order the teacher listed them (DN-34: one type per run, never silently mixed).
 */
function dealSkills(skills, count) {
    const w = skills.map((s) => Math.max(0, Number(s.weight || s.percent) || 0));
    const total = w.reduce((a, b) => a + b, 0);
    const shares = total > 0 ? w.map((x) => (x / total) * count) : skills.map(() => count / skills.length);
    const base = shares.map(Math.floor);
    let left = count - base.reduce((a, b) => a + b, 0);
    const order = shares.map((s, i) => [s - Math.floor(s), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of order) { if (left <= 0) break; base[i]++; left--; }
    const out = [];
    skills.forEach((s, i) => { for (let k = 0; k < base[i]; k++) out.push(s); });
    return out;
}

/**
 * Generate `count` items for one run. Item i is generated under `baseSeed + i` (the same seed
 * reprints the same page); a duplicate retries under `baseSeed + i + 7919 * k`. `itemIndex`
 * counts only the items of that skill that were KEPT (generateQuestionFor's contract).
 */
function generateRun(skills, count, baseSeed, { startIndex = 0, seen = new Set(), kept = new Map() } = {}) {
    const slots = dealSkills(skills, startIndex + count).slice(startIndex);
    const out = [];
    slots.forEach((sk, j) => {
        const i = startIndex + j;
        const key = `${sk.categoryId}:${sk.skillId}`;
        const itemIndex = kept.get(key) || 0;
        let q = null;
        for (let k = 0; k <= RETRIES; k++) {
            const seed = (baseSeed + i + 7919 * k) >>> 0;
            let cand = null;
            try { cand = generateQuestionFor({ category: sk.categoryId, skill: sk.skillId, opts: sk.opts, seed, itemIndex }); } catch (e) { cand = null; }
            if (!cand) continue;
            q = cand;
            if (!seen.has(signature(cand))) break;
        }
        if (!q) return;
        seen.add(signature(q));
        kept.set(key, itemIndex + 1);
        out.push({ q, skill: sk });
    });
    return out;
}

/* =================================================================== the cell of one item */

const FACT_FORMAT_RE = /-facts-(vertical|horizontal|fraction|long)$/;

/**
 * The instruction a skill's section prints (BD-13), while the skill's provider still has only
 * the default strings: computation formats take "Add." / "Subtract." / "Multiply." / "Divide.",
 * counting takes "Count. Write the number.", a ten frame to fill takes "Draw counters to show
 * the number.". Every key is from the controlled library; nothing is composed here.
 */
function instructionKeyFor(q, words) {
    if (words && words.instructionKey && !/^default-/.test(words.instructionKey)) return words.instructionKey;
    const f = String(q.printFormat || '');
    const cat = String(q.categoryId || '');
    if (/^column-add|add-facts/.test(f)) return 'add';
    if (/^column-sub|sub-facts/.test(f)) return 'subtract';
    if (/^column-mult|mult-facts/.test(f)) return 'multiply';
    if (/long-div|div-facts|bracket/.test(f)) return 'divide';
    if (q.answerType === 'ten-frame-build' || /ten-frame-build/.test(f)) return 'draw-count';
    if (cat === 'counting' && /^count_/.test(String(q.skillId || '')) && q.answerType === 'number') return 'count-write';
    // An item that prints its own "Check one box" is answered with a check mark, so a "Write the
    // answer." line above it would contradict it. The library has no bare "Check one box.", so
    // the neutral default holds the place until the skill's provider names its own key.
    if (/check one box/i.test(`${q.text || ''} ${q.printText || ''} ${q.visual || ''}`)) return 'default-solve';
    return (words && words.instructionKey) || 'default-write';
}

/** PT 2.4 footprint classes: long procedures, one-symbol answers, word problems. */
function footprintClass(q, template, size) {
    const f = String(q.printFormat || '');
    if (size === 'spacious' || /word/.test(f)) return 'word';
    const operands = (q.cell && q.cell.payload && q.cell.payload.operands) || [q.a, q.b];
    if (/long-div|long_div/.test(f) || template === 'division') return 'long';
    if (/^column-mult/.test(f) && Number(operands[1]) >= 10) return 'long';
    const stacked = template === 'stack' || template === 'fact' || /column|stack|facts|division/.test(f) || FACT_FORMAT_RE.test(f);
    const ans = String(typeof q.ans === 'object' ? '' : q.ans).trim();
    const oneSymbol = /^(?:\d{1,2}|[<>=]|[A-Za-z]|yes|no|true|false)$/i.test(ans);
    const written = ['number', 'text', 'multiple-choice', ''].includes(String(q.answerType || ''));
    if (!stacked && oneSymbol && written) return 'short';
    return 'standard';
}

/* ------------------------------------------------------------- the legacy cell's key */

const STAMP_RE = /<div class="ws-legacy-answer" data-ws-stamp="1"[^>]*>[\s\S]*?<\/span><\/div>/;
const INK_STYLE = 'font-weight:700;color:#000;';

/**
 * AK-1 / AK-2 for a LEGACY cell: write the answer into the slot the pupil writes in, the way a
 * pupil would, instead of the stamp under the cell. The legacy markup has a handful of slot
 * shapes shared by many print branches; each is filled only when the cell holds EXACTLY ONE of
 * them and the answer has the matching shape, and nothing about any box, rule or width changes.
 * Anything else keeps the adapter's stamp (answer-key.js reports it as a gap), which is honest.
 * This is a bridge until the family's registered template draws its own key (P8).
 *
 * @returns {string|null} the filled html, or null when no slot could be filled with certainty
 */
export function legacyKeyFill(html, q, key) {
    const raw = key && key.value !== undefined && key.value !== null && typeof key.value !== 'object' ? String(key.value) : '';
    const display = key && key.display !== undefined ? String(key.display) : raw;
    if (!raw && !display) return null;
    const digits = raw.replace(/,/g, '').trim();

    // 1. A stacked answer row: one `.blank` per digit track, filled right-aligned (VA-3).
    const stacks = html.match(/<div class="stack-answer"[^>]*>[\s\S]*?<\/div>/g) || [];
    if (stacks.length === 1 && /^\d+$/.test(digits)) {
        const row = stacks[0];
        const blanks = row.match(/<span class="blank"[^>]*><\/span>/g) || [];
        if (blanks.length >= digits.length) {
            let k = 0;
            const skip = blanks.length - digits.length;
            const filled = row.replace(/<span class="blank"([^>]*)><\/span>/g, (m, attrs) => {
                const d = k >= skip ? digits[k - skip] : '';
                k++;
                return d ? `<span class="blank"${attrs} data-ws-ink="solid" style="${INK_STYLE}">${d}</span>` : m;
            });
            return html.replace(row, filled);
        }
    }

    // 2. A vertical fact's open write row: three tracks under the rule, digits right-aligned.
    const factRows = html.match(/<span class="ws-fact-write" style="([^"]*)"><\/span>/g) || [];
    if (factRows.length === 1 && /^\d{1,3}$/.test(digits)) {
        const style = /style="([^"]*)"/.exec(factRows[0])[1];
        const h = (/height:\s*([\d.]+mm)/.exec(style) || [])[1] || '8mm';
        const cells = digits.padStart(3, ' ').split('').map((d) => `<span data-ws-ink="solid" style="height:${h};line-height:${h};display:flex;align-items:center;justify-content:center;${INK_STYLE}">${d.trim()}</span>`).join('');
        return html.replace(factRows[0], cells);
    }

    // 3. One "Answer:" line: a label, then a ruled blank that stretches (28+ print branches).
    const lineRe = /(Answer:\s*<\/span>\s*<span style="[^"]*border-bottom:[^"]*">)(?:&nbsp;|\s)*(<\/span>)/g;
    const lines = html.match(lineRe) || [];
    if (lines.length === 1 && display) {
        return html.replace(lineRe, (m, open, close) => `${open}<b data-ws-ink="solid" style="${INK_STYLE}">${escText(display)}</b>${close}`);
    }

    // 4. The K-2 check-box list: the box beside the answer's label gets a check mark (AK-2).
    const want = [q && q.printAnswer, raw, `Group ${raw}`].filter(Boolean).map((s) => String(s).trim().toLowerCase());
    const tickRe = /(<span style="min-width:6\.5em;">)([^<]+)(<\/span><span style="display:inline-block;width:1\.15em;height:1\.15em;[^"]*")(><\/span>)/g;
    const ticks = [...html.matchAll(tickRe)];
    const hits = ticks.filter((m) => want.includes(m[2].trim().toLowerCase()));
    if (ticks.length >= 2 && hits.length === 1) {
        const target = hits[0][0];
        const checked = target.replace(tickRe, (m, a, label, b, c) =>
            `${a}${label}${b.replace(/"$/, `;display:inline-flex;align-items:center;justify-content:center;line-height:1;${INK_STYLE}"`)} data-ws-ink="solid">✓</span>`);
        return html.replace(target, checked);
    }
    return null;
}

/**
 * Turn one generated question into a host item: the question carrying its cell spec, a draw
 * function (the SAME one for the pupil page, the key and the measurement), the key, and the
 * class tokens the role writes onto the cell.
 */
function hostItem(g, sectionIndex, size) {
    const q0 = g.q;
    const resolved = kitCellSpec(q0);                 // a registered template, or null -> legacy
    const q = Object.assign({}, q0);
    let template;
    if (resolved) {
        template = resolved.template;
        q.cell = { template, payload: resolved.payload, v: 1 };
    } else {
        template = 'legacy';
        const cls = getSkillPrintSize(q0.skillId || '', q0.printFormat || '');
        q.cell = { template: 'legacy', v: 1 };
        q.__sizeCategory = cls;
        q.__factLike = FACT_FORMAT_RE.test(String(q0.printFormat || '')) || /^(add|sub|mult|div)_facts$/.test(String(q0.skillId || ''));
    }
    const legacy = template === 'legacy';
    const printSize = getSkillPrintSize(q0.skillId || '', q0.printFormat || '');
    // The draw function. `cols` is the section's final column count, handed in by the role:
    // the legacy template picks its size class from it, the fact ladder its digit size.
    const key = cellAnswerKey(q);
    const render = (c, { cols = 2 } = {}) => {
        const ctx = Object.assign({}, c, { columns: cols, options: Object.assign({}, c.options || {}, { factColumns: cols }) });
        const html = renderCell(q, ctx);
        if (!legacy || ctx.state !== 'answered') return html;
        // The legacy key: the answer in the pupil's own slot when there is one, else the stamp.
        const filled = legacyKeyFill(html.replace(STAMP_RE, ''), q0, key);
        return filled === null ? html : filled;
    };
    let fp;
    try { fp = cellFootprint(q, resolveCtx({ mode: 'print', size, look: 'ican' })); } catch (e) { fp = { wMm: 93, hMm: null, measure: true, maxCols: 2 }; }
    if (legacy) {
        // SCC-A6: a legacy cell is sized by measurement. Its size class caps the columns only for
        // word problems (PT-WPR-1); everything else is decided by what the measurement shows.
        fp = Object.assign({}, fp, { measure: true, hMm: null, maxCols: printSize === 'spacious' ? 1 : 6, size: printSize });
    }
    return {
        q, render, template, legacy,
        section: sectionIndex,
        skill: `${q.categoryId || ''}:${q.skillId || ''}`,
        answerType: q.answerType || '',
        visual: !!q.visual,
        footprint: fp,
        fclass: footprintClass(q, template, printSize),
        cellCls: legacy ? 'mq-legacy' : '',
        key,
    };
}

/* ======================================================================= measurement */

function ensureEngineStyle(doc) {
    if (!doc || doc.querySelector('style[data-mq-sheet-engine-host]')) return;
    const st = doc.createElement('style');
    st.setAttribute('data-mq-sheet-engine-host', '');
    st.textContent = SHEET_ENGINE_CSS;
    (doc.head || doc.documentElement).appendChild(st);
}

/**
 * SCC-A6: measure every item at every column count the layout may choose. The cell is drawn in
 * a hidden `.ws-sheet` root at the exact inner width it will have in the printed grid, with its
 * label, in both states (the key's answer stamp costs no layout, but its height is reserved so
 * it never covers the problem). Records, per column count:
 *   hMm   the whole cell's height (pads, label and stamp reserve included)
 *   fits  false when anything overflows the cell's content box, is clipped by an ancestor,
 *         or is a picture drawn narrower than it is at one column (DN-10: content never shrinks
 *         with columns)
 */
function measureItems(items, { size, look, colsList }) {
    if (typeof document === 'undefined' || !document.body || !items.length) return;
    ensureEngineStyle(document);
    const s = SIZES[size] || SIZES.L;
    const host = document.createElement('div');
    host.setAttribute('aria-hidden', 'true');
    host.style.cssText = 'position:absolute;left:-10000px;top:0;width:220mm;visibility:hidden;pointer-events:none;contain:layout;';
    host.innerHTML = `<div class="ws-sheet ws-${size} ws-${look} ws-tab${s.tabMm}" style="display:block;max-width:none;width:220mm;overflow:visible"></div>`;
    document.body.appendChild(host);
    const root = host.firstChild;
    const cols = [...new Set([1, ...colsList])].sort((a, b) => a - b);
    const baseW = new Map();          // item -> Map(svg index -> width at 1 column)
    try {
        for (const c of cols) {
            const { inner } = cellWidthMm(c, LIVE_W_MM, look);
            for (const it of items) {
                let best = { hMm: 0, fits: true };
                for (const state of ['blank', 'answered']) {
                    const ctx = resolveCtx({ mode: 'print', look, size, paper: 'A4', scaffoldLevel: 1, state });
                    let body = '';
                    try { body = it.render(ctx, { cols: c }); } catch (e) { body = ''; }
                    root.innerHTML = `<div class="ws-cell ${it.cellCls || ''}" style="width:${inner}mm;height:auto;min-height:0;">`
                        + `<span class="ws-letter">m.</span>${body}</div>`;
                    const cell = root.firstChild;
                    const r = cell.getBoundingClientRect();
                    const cs = getComputedStyle(cell);
                    const padL = parseFloat(cs.paddingLeft) || 0;
                    const padR = parseFloat(cs.paddingRight) || 0;
                    let hPx = r.height;
                    let fits = true;
                    let contentBottom = r.top;
                    let stampH = 0;
                    const pics = [];
                    for (const el of cell.querySelectorAll('*')) {
                        const er = el.getBoundingClientRect();
                        if (!er.width && !er.height) continue;
                        const ecs = getComputedStyle(el);
                        if (ecs.position === 'absolute') {
                            if (el.classList.contains('ws-legacy-answer')) stampH = Math.max(stampH, er.height);
                            continue;
                        }
                        if (el.closest('.ws-legacy-answer')) continue;
                        contentBottom = Math.max(contentBottom, er.bottom);
                        if (er.right > r.right - padR + 1 || er.left < r.left + padL - 1) fits = false;
                        if ((ecs.overflowX === 'hidden' || ecs.overflowX === 'clip') && el.scrollWidth > el.clientWidth + 1) fits = false;
                        if ((ecs.overflowY === 'hidden' || ecs.overflowY === 'clip') && el.scrollHeight > el.clientHeight + 1) fits = false;
                        if (el.tagName === 'svg' || el.tagName === 'IMG' || el.tagName === 'CANVAS') pics.push(er.width);
                    }
                    // The key's answer stamp sits at the foot of the cell and costs no layout
                    // (AK-1); its line is reserved under the content so it never covers it.
                    if (stampH) hPx = Math.max(hPx, contentBottom - r.top + 1 * PX_PER_MM + stampH + 1.5 * PX_PER_MM);
                    if (state === 'blank') {
                        if (c === cols[0]) baseW.set(it, pics);
                        else {
                            // DN-10: a picture never shrinks to fit a narrower column. A registered
                            // visual is held to that exactly; a legacy picture declares no minimum
                            // size (RP-3's minimums belong to the templates that replace it), so a
                            // scale-down of up to 10% is read as the same picture.
                            const tol = it.legacy ? 0.9 : 0.98;
                            const b = baseW.get(it) || [];
                            if (pics.some((w, k) => b[k] && w < b[k] * tol - 0.5)) fits = false;
                        }
                    }
                    best = { hMm: Math.max(best.hMm, hPx / PX_PER_MM), fits: best.fits && fits };
                }
                it.measured = it.measured || {};
                it.measured[c] = { hMm: Math.ceil(best.hMm * 10) / 10, fits: best.fits };
            }
        }
    } finally {
        host.remove();
    }
}

/** HD-14: how many lines the title takes at the preset size, measured in Andika 700. */
function measureTitleLines(text, size) {
    if (!text || typeof document === 'undefined' || !document.body) return 1;
    const s = SIZES[size] || SIZES.L;
    const span = document.createElement('span');
    span.style.cssText = `position:absolute;left:-10000px;top:0;visibility:hidden;white-space:nowrap;font-family:'Andika',sans-serif;font-weight:700;font-size:${s.titlePt}pt;font-feature-settings:"cv04" 1;`;
    span.textContent = text;
    document.body.appendChild(span);
    const wMm = span.getBoundingClientRect().width / PX_PER_MM;
    span.remove();
    return wMm <= LIVE_W_MM - 0.6 ? 1 : 2;
}

/* ==================================================================== the one entry point */

async function fontsReady() {
    try { if (typeof document !== 'undefined' && document.fonts) await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 3000))]); } catch (e) { /* print anyway */ }
}

/** The column counts a section's layout may choose, so each gets measured. */
function candidateCols(columns) {
    if (columns === 'auto') return [1, 2];
    return Array.from({ length: Math.max(1, columns) }, (_, i) => i + 1);
}

/** Skill metadata the frame prints: label, level, and the strings the role reads. */
function skillMeta(sk, q) {
    const label = SKILL_FULL_LABELS[sk.skillId] || (q && q.skillLabel) || sk.skillId;
    let grade = null;
    try { grade = getSkillGrade(sk.skillId, sk.categoryId); } catch (e) { grade = null; }
    const meta = { categoryId: sk.categoryId, skillId: sk.skillId, label, grade: grade === null || grade === undefined ? '' : String(grade), ccss: sk.ccss || '' };
    const words = skillWords(Object.assign({ answerType: q && q.answerType, printFormat: q && q.printFormat }, meta));
    meta.iCan = sk.iCan || words.iCan;
    meta.instructionKey = q ? instructionKeyFor(q, words) : words.instructionKey;
    return meta;
}

/** One-section layout for a set of host items, exactly as the role will compute it. */
function layoutOf(role, section, items, n, ctx) {
    return resolveSectionLayout({ role, columns: section.columns, count: items.length, floor: section.floor }, items, ctx.paper, LIVE_W_MM, {
        size: n.size, look: n.look, header: ctx.header,
    });
}

/** The measured worst case of a set of items, per column count: the tallest cell, and whether all fit. */
function floorOf(items) {
    const out = {};
    for (const it of items) {
        for (const [c, m] of Object.entries(it.measured || {})) {
            const f = out[c] || (out[c] = { hMm: 0, fits: true });
            f.hMm = Math.max(f.hMm, m.hMm || 0);
            f.fits = f.fits && m.fits !== false;
        }
    }
    return out;
}

/**
 * Build a sheet.
 *
 * @param {Object} req
 * @param {'independent'|'more-practice'} req.role
 * @param {{skills: {categoryId, skillId, opts?, weight?}[], count?: number|'auto', pages?: number,
 *          columns?: 'auto'|number, instructionKey?: string}[]} req.sections
 * @param {'S'|'M'|'L'} [req.size]           default 'L'
 * @param {'auto'|'ican'|'daily'} [req.look] default 'auto' (= I Can on these roles)
 * @param {'A4'|'Letter'} [req.paper]        default 'A4'
 * @param {Object} [req.header]              {name, date, score, tab, title, lesson}; false hides a part
 * @param {number} [req.seed]                the same seed reprints the same sheet
 * @param {string} [req.form]                'A'
 * @param {boolean} [req.key]                default true
 * @param {string[]} [req.letters]           More Practice: which letters (default from the count)
 * @returns {Promise<{pupilHtml, keyHtml, pageCount, keyPageCount, fits, items, plan, seed, notes}>}
 */
export async function buildSheet(req = {}) {
    const n = normaliseRequest(req);
    if (!n.sections.length) throw new Error('buildSheet: no section has a skill');
    await fontsReady();
    const paper = n.paper;

    // The frame words decide the header height, which decides gridH (HD-12 / HD-14): resolve the
    // title first, from the first item of each skill.
    const firstQ = new Map();
    const metaOf = (sk) => {
        const key = `${sk.categoryId}:${sk.skillId}`;
        if (!firstQ.has(key)) {
            let q = null;
            try { q = generateQuestionFor({ category: sk.categoryId, skill: sk.skillId, opts: sk.opts, seed: n.seed, itemIndex: 0 }); } catch (e) { q = null; }
            firstQ.set(key, skillMeta(sk, q));
        }
        return firstQ.get(key);
    };
    const skills = n.sections.flatMap((s) => s.skills.map(metaOf));
    const titles = [...new Set(skills.map((s) => s.iCan))];
    const title = typeof n.header.title === 'string' && n.header.title.trim() ? n.header.title.trim()
        : titles.length === 1 ? titles[0] : 'Mixed practice';
    const header = Object.assign({}, n.header, { titleLines: n.header.title === false ? 0 : measureTitleLines(title, n.size) });
    const layoutHeader = { tab: n.header.tab === false ? false : ['Level', 'Strand', 'Id'], title: n.header.title === false ? '' : title, titleLines: header.titleLines };
    const lctx = { paper, header: layoutHeader };

    const build = (sectionIdx, sec, count, baseSeed, extra = {}) => {
        const gen = generateRun(sec.skills, count, baseSeed, extra);
        return gen.map((g) => hostItem(g, sectionIdx, n.size));
    };

    const notes = [];
    let hostItems = [];
    const measure = (items, sec) => measureItems(items, { size: n.size, look: n.look, colsList: candidateCols(sec.columns) });
    const PROBE = 16;

    /**
     * A page of a skill is sized by the SKILL, not by the handful of items that end up on it
     * (PT-ENG-9): PROBE items are measured first and their worst case becomes the section's
     * floor. Items are then generated for the FINAL count, because a section of several skills
     * is dealt by weight for the count it prints - a slice of a larger deal would drop the last
     * skill. A single-skill run is deterministic item by item (seed + i), so its probe is simply
     * the start of the run and is reused.
     */
    const probeRun = (sec, si, base) => {
        const seen = new Set();
        const kept = new Map();
        const items = build(si, sec, PROBE, base, { seen, kept });
        measure(items, sec);
        return { items, seen, kept };
    };
    const finalRun = (sec, si, base, count, probe) => {
        if (sec.skills.length === 1) {
            if (count <= probe.items.length) return probe.items.slice(0, count);
            const more = build(si, sec, count - probe.items.length, base, { startIndex: probe.items.length, seen: probe.seen, kept: probe.kept });
            measure(more, sec);
            probe.items = probe.items.concat(more);
            return probe.items.slice(0, count);
        }
        const items = build(si, sec, count, base);
        measure(items, sec);
        return items;
    };

    if (n.role === 'independent') {
        n.sections.forEach((sec, si) => {
            const base = (n.seed + si * 100003) >>> 0;
            const probe = probeRun(sec, si, base);
            sec.floor = floorOf(probe.items);
            const pagesWanted = sec.pages || 1;
            // "A page" (or N pages) when no count is given: the page decides the count. The floor
            // only grows as items are added, so the capacity can only fall; the loop settles.
            let want = sec.count || Math.min(MAX_ITEMS, layoutOf(n.role, sec, probe.items, n, lctx).perPage * pagesWanted);
            let items = [];
            for (let pass = 0; pass < 3; pass++) {
                items = finalRun(sec, si, base, want, probe);
                sec.floor = floorOf(probe.items.concat(items));
                if (sec.count) break;
                const again = Math.min(MAX_ITEMS, layoutOf(n.role, sec, items, n, lctx).perPage * pagesWanted);
                if (again >= want) break;
                want = again;
            }
            hostItems = hostItems.concat(items);
        });
    } else {
        // MORE PRACTICE: each letter under its own seed (PT-MPR-2). The first letter's probe fixes
        // the page capacity; the requested count is spread over the letters like a paginated run
        // (PG-23), and each letter is generated under `letterSeed(seed, letter)`. Once every
        // letter is measured, the floor covers them all and a letter the capacity no longer
        // holds is regenerated for the smaller count, so no letter spills onto a second side.
        n.sections.forEach((sec, si) => {
            const letterBase = (L) => ((letterSeed(n.seed, L) + si * 100003) >>> 0);
            const firstL = (n.letters && n.letters[0]) || 'A';
            const probes = new Map([[firstL, probeRun(sec, si, letterBase(firstL))]]);
            const probeOf = (L) => { if (!probes.has(L)) probes.set(L, { items: [], seen: new Set(), kept: new Map() }); return probes.get(L); };
            sec.floor = floorOf(probes.get(firstL).items);
            const L0 = layoutOf(n.role, sec, probes.get(firstL).items, n, lctx);
            let letters;
            let perLetter;
            if (n.letters && n.letters.length) {
                letters = n.letters;
                perLetter = letters.map(() => (sec.count ? Math.min(sec.count, L0.perPage) : L0.perPage));
            } else if (sec.count) {
                const chunks = paginate(sec.count, L0).slice(0, LETTERS.length);
                letters = chunks.map((_, i) => LETTERS[i]);
                perLetter = chunks.map((c) => c.count);
            } else {
                const pages = Math.min(LETTERS.length, sec.pages || 1);
                letters = LETTERS.slice(0, pages).split('');
                perLetter = letters.map(() => L0.perPage);
            }
            let byLetter = letters.map((L, k) => finalRun(sec, si, letterBase(L), perLetter[k], probeOf(L)));
            sec.floor = floorOf([...probes.values()].flatMap((p) => p.items).concat(...byLetter));
            const cap = layoutOf(n.role, sec, byLetter.flat(), n, lctx).perPage;
            if (perLetter.some((c) => c > cap)) {
                byLetter = letters.map((L, k) => (perLetter[k] > cap ? finalRun(sec, si, letterBase(L), cap, probeOf(L)) : byLetter[k]));
            }
            byLetter.forEach((items, k) => items.forEach((it) => { it.letter = letters[k]; }));
            for (const items of byLetter) hostItems = hostItems.concat(items);
        });
    }

    const input = {
        items: hostItems,
        skills,
        sections: n.sections.map((s) => ({ columns: s.columns, instructionKey: s.instructionKey, floor: s.floor })),
        ctx: { size: n.size, look: n.look, paper, photocopySafe: n.photocopySafe },
        header,
        form: n.form,
        seed: n.seed,
        labels: n.labels,
        lesson: n.lesson,
    };
    const plan = n.role === 'more-practice' ? morePracticePlan(input) : independentPlan(input);
    const out = renderPlan(plan, { key: n.key });
    const fitsList = (plan.meta && plan.meta.fits) || [];
    const f0 = fitsList[0] || {};
    const pageCount = out.pupilPages.length;
    notes.push(...new Set((plan.meta && plan.meta.notes) || []));
    // DN-21: the dialog's "Fits:" line (it already carries the layout's own clamp note, DN-14),
    // then any note the layout line does not already say.
    const line = f0.line || '';
    const fits = {
        cols: f0.cols, rows: f0.rows, perPage: f0.perPage, pages: pageCount,
        note: [line, ...notes.filter((t) => !line.includes(t))].filter(Boolean).join(' '),
        sections: fitsList,
    };
    return {
        pupilHtml: out.pupilHtml,
        keyHtml: n.key ? out.keyHtml : '',
        pageCount,
        keyPageCount: n.key ? out.keyPages.length : 0,
        fits,
        items: hostItems.map((it) => ({
            skill: it.skill, section: it.section, letter: it.letter, template: it.template,
            text: String(it.q.text || ''), ans: it.q.ans, fclass: it.fclass, measured: it.measured,
        })),
        gaps: out.gaps,
        floors: n.sections.map((s) => s.floor || null),
        seed: n.seed,
        role: n.role,
        title: plan.meta && plan.meta.title,
        notes,
        plan,
    };
}

/* ===================================================================== standalone document */

const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * A standalone printable document for sheet HTML: the app's stylesheets (the legacy cells are
 * drawn against them), Andika self-hosted, the kit's stylesheet, the engine rules, and a page
 * box of the chosen paper with no margins (the sheet carries its own margins, PG-1). The
 * universal `@page` of css/print-worksheet.css adds a running "Maths Quest Pro" footer and
 * 12 mm margins for the legacy worksheets; both are switched off here, because a kit sheet has
 * its own teacher footer (HD-30).
 *
 * `<html data-ws-fonts="ready">` is set once the web fonts have loaded, so a printer (or the
 * test harness) waits for Andika instead of rasterising the fallback face.
 *
 * @param {string} html
 * @param {string} [title]
 * @param {{paper?: 'A4'|'Letter', base?: string}} [opts]  `base`: where relative hrefs resolve
 */
export function sheetDocument(html, title = 'Worksheet', opts = {}) {
    const letter = /letter/i.test(String(opts.paper || '')) || /mq-paper-letter/.test(String(html));
    const base = opts.base || (typeof document !== 'undefined' ? document.baseURI : '');
    const abs = (p) => { try { return base ? new URL(p, base).href : p; } catch (e) { return p; } };
    const links = SHEET_STYLESHEETS.map((h) => `<link rel="stylesheet" href="${abs(h)}">`).join('\n');
    return `<!doctype html>
<html lang="en"${letter ? ' class="mq-paper-letter"' : ''}>
<head>
<meta charset="utf-8">
<title>${escText(title)}</title>
${links}
<style data-mq-sheet-engine>${SHEET_ENGINE_CSS}</style>
<style>
@page { size: ${letter ? 'Letter' : 'A4'}; margin: 0; @top-left { content: none; } @top-right { content: none; } @bottom-left { content: none; } @bottom-right { content: none; } @bottom-center { content: none; } }
@page mqsheet { size: A4; margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
@page mqsheetletter { size: Letter; margin: 0; @bottom-left { content: none; } @bottom-right { content: none; } }
html { color-scheme: light; }
html, body { margin: 0; padding: 0; background: #fff; color: #000; font-family: 'Andika', sans-serif; }
body.mq-sheet { min-height: 0; overflow: visible; }
.mq-sheet > .ws-page:last-child { break-after: auto; }
@media screen { body.mq-sheet { background: #d9d9d9; padding: 6mm 0; } }
@media print { body.mq-sheet { background: #fff; padding: 0; } }
</style>
</head>
<body class="mq-sheet">
${html}
<script>(function(){var d=document;function done(){d.documentElement.setAttribute('data-ws-fonts','ready');}
try{if(d.fonts&&d.fonts.ready){d.fonts.ready.then(done,done);}else{done();}}catch(e){done();}})();</script>
</body>
</html>`;
}

export default { buildSheet, sheetDocument };
