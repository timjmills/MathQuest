// js/modules/sheet/roles/key-short.js
// The SHORT answer key (owner, Wave 4.4, 2026-10-03): a compact answers-only page beside the
// facsimile key (answer-key.js). It lists each item's label and answer in a dense grid, grouped
// by pupil page under a "Page N" heading, so the answers of many pupil pages fit on one sheet.
//
// It reads the SAME plan the pupil page and the facsimile key render from, and the SAME answer
// data (`item.key` or `cellAnswerKey(q)`, the `answerWords` fallback), so a short key can never
// disagree with the facsimile. Labels follow the pupil page exactly: the grid's label style
// (letter a., b. / tab 1, 2 / none -> position number), its running counter and its `start`.
//
// Fractions print stacked, a multi-part answer stays together on one entry, a tick / choice answer
// prints the chosen label, and a pictorial answer (clock hands, shading, a placed point) prints the
// short text form its template's `display` gives ("7:30", "3/4 shaded", "(2, 5)").
//
// Every entry carries `data-ws-short-page` / `data-ws-short-cell` (the pupil page and the cell's
// ordinal on it) so ws-print-lint can prove the short key covers every item exactly once.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import.

import { page, cellAnswerKey, esc } from '../index.js';
import { keyTab, answerWords } from './answer-key.js';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

/** The key options a request may carry, normalised. `true` / `false` / missing keep today's key. */
export function normKeyOptions(key) {
    if (key === false) return { on: false, placement: 'end', style: 'copy', newSheet: false };
    if (!key || typeof key !== 'object') return { on: true, placement: 'end', style: 'copy', newSheet: false };
    return {
        on: key.on !== false,
        placement: key.placement === 'after-page' ? 'after-page' : 'end',
        style: key.style === 'short' ? 'short' : 'copy',
        // owner 2026-10-09: double-sided printing - each key after a page starts on a fresh sheet
        newSheet: key.placement === 'after-page' && key.newSheet === true,
    };
}

/* ------------------------------------------------------------------ INK-31: which marks are answers */

const attrOf = (attrs, name) => { const m = new RegExp(`\\s${name}="([^"]*)"`).exec(attrs); return m ? m[1] : ''; };
// an open tag and the text right after it (up to the next tag)
const OPEN_TAG_TEXT = /<([a-zA-Z][\w-]*)\b([^>]*)>([^<]*)/g;
const IGNORED = /\s(?:data-ws-key-ans|data-ws-key-add|data-ws-key-model|data-ws-ink|data-ws-key)(?:="[^"]*")?/g;
const markSig = (cell, tag, attrs, text) => `${cell}|${tag.toLowerCase()}|${attrs.replace(IGNORED, '').replace(/\s+/g, ' ').trim()}|${text.replace(/\s+/g, ' ').trim()}`;
// the same element up to its paint: a shape by its geometry, anything else by its class, slot and text
const SHAPE = /^(rect|circle|ellipse|line|path|polyline|polygon)$/i;
const GEOM_ATTRS = ['x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'x1', 'y1', 'x2', 'y2', 'transform'];
const looseSig = (cell, tag, attrs, text) => (SHAPE.test(tag)
    ? `${cell}|${tag.toLowerCase()}|${GEOM_ATTRS.map((a) => attrOf(attrs, a)).join(',')}`
    : `${cell}|${tag.toLowerCase()}|${attrOf(attrs, 'data-ws-slot')}|${text.replace(/\s+/g, ' ').trim()}`);
// R3-1: the element's build without its text and its colours (a write-on line, a box, a chart cell)
const structSig = (tag, attrs) => `${tag.toLowerCase()}|${attrOf(attrs, 'class').replace(/\s+/g, ' ').trim()}|${attrOf(attrs, 'data-ws-slot')}|${attrOf(attrs, 'data-ws-shape')}|${attrOf(attrs, 'style').split(';').map((d) => d.trim()).filter((d) => d && !/^(color|fill|stroke)\s*:/i.test(d)).map((d) => d.replace(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\b(?:black|white|transparent)\b/gi, 'C')).join(';')}`;
const solidSig = (cell, tag, attrs) => `${cell}|${tag.toLowerCase()}|${attrOf(attrs, 'data-ws-slot')}|${attrOf(attrs, 'class').replace(/\s+/g, ' ').trim()}`;

/**
 * INK-31 (critic r1, B1): mark the ANSWERS of one facsimile key page with `data-ws-key-ans`, and
 * nothing else. An element is an answer when it is written in solid ink on the key and the pupil
 * page does not already print it: a given claim (True or False's "5 + 7 = 2"), the made-up
 * pupil's work on Error Analysis ("Sam wrote 0", class `mq-pupil`), a worked example, any printed
 * number keeps its ink. The pupil twin is matched cell by cell (the n-th `data-ws-cell` on both
 * pages), by the element's tag, slot id and classes. The key's own written words
 * (`data-ws-key="words"`) are answers. Only the key ink colours `[data-ws-key-ans]`.
 *
 * @param {string} pupilHtml  the pupil page the key page copies ('' when there is none)
 * @param {string} keyHtml    the key page
 * @returns {string} the key page with its answers tagged
 */
export function tagKeyAnswers(pupilHtml, keyHtml) {
    const pupil = String(pupilHtml || '');
    const key = String(keyHtml || '');
    const pTok = tokens(pupil), kTok = tokens(key);
    const pool = new Map();
    for (const t of pTok) if (/\sdata-ws-ink="solid"/.test(t.attrs)) pool.set(solidSig(t.cell, t.tag, t.attrs), (pool.get(solidSig(t.cell, t.tag, t.attrs)) || 0) + 1);
    const take = (k) => { const n = pool.get(k) || 0; if (n > 0) { pool.set(k, n - 1); return true; } return false; };
    // critic r3 (N-1, lead ruling on Q1): a MODEL cell (`data-ws-key-model`, set by the key render)
    // whose pupil twin traces its answer is the worked example: everything on it is given, black.
    // On Guided Practice the traced answer is the pupil's to go over: the answer, key ink.
    const modelCells = new Set(kTok.filter((t) => /\sdata-ws-key-model\b/.test(t.attrs)).map((t) => t.cell));
    const tracedCells = new Set(pTok.filter((t) => t.inCells && t.trace).map((t) => t.cell));
    const worked = (c) => modelCells.has(c) && tracedCells.has(c);
    // R2-1: align each key cell with its pupil twin, in order - first by the whole open tag and its
    // text, then what is left by the element up to its paint (a shape's geometry; else class, slot
    // and text), then (R3-1) what is left by its build alone (tag, class, slot, shape, uncoloured
    // style): an element that differs from its twin ONLY in its text is a given whose text is the
    // answer - its line, box or border keeps its ink. What still has no twin is a mark the key ADDS.
    const verdict = new Map();   // key token index -> 'same' | 'given' | 'ans' | 'text' | 'add' | 'fill' | 'mark'
    if (pupil.length) {
        const byCell = (list) => list.reduce((m, t, i) => { if (t.inCells) (m.get(t.cell) || m.set(t.cell, []).get(t.cell)).push(i); return m; }, new Map());
        const pc = byCell(pTok), kc = byCell(kTok);
        for (const [c, ks] of kc) {
            const ps = pc.get(c) || [];
            const exact = align(ps.map((i) => pTok[i].sig), ks.map((i) => kTok[i].sig));
            const kLeft = ks.filter((_, j) => !exact.has(j));
            const pUsed = new Set(exact.values());
            const pLeft = ps.filter((_, j) => !pUsed.has(j));
            const lo = align(pLeft.map((i) => pTok[i].loose), kLeft.map((i) => kTok[i].loose));
            const loUsed = new Set(lo.values());
            const kLeft2 = kLeft.map((ki, j) => (lo.has(j) ? -1 : ki)).filter((ki) => ki >= 0 && (!kTok[ki].svg || /^(text|tspan)$/i.test(kTok[ki].tag)));
            const pLeft2 = pLeft.filter((_, j) => !loUsed.has(j));
            const st = align(pLeft2.map((i) => pTok[i].struct), kLeft2.map((i) => kTok[i].struct));
            const structTwin = new Map(kLeft2.map((ki, j) => [ki, st.has(j) ? pTok[pLeft2[st.get(j)]] : null]));
            // the pupil page traces it and the key inks it solid (a Guided Practice hop, a traced
            // digit): on a worked Model a given, elsewhere the answer the pupil goes over
            const overTrace = (t) => (t.svg ? (/^(text|tspan)$/i.test(t.tag) ? 'ans' : 'add') : 'text');
            ks.forEach((ki, j) => {
                if (!exact.has(j)) return;
                const t = kTok[ki], twin = pTok[ps[exact.get(j)]];
                verdict.set(ki, twin.trace && !t.trace && !modelCells.has(c) && t.text.replace(/&nbsp;|\s/g, '') + (t.svg ? 'x' : '') ? (/\sdata-ws-ink="solid"/.test(t.attrs) ? 'ans' : overTrace(t)) : 'same');
            });
            kLeft.forEach((ki, j) => {
                const t = kTok[ki];
                if (/\sdata-ws-cell="/.test(t.attrs) || /\bmq-pupil\b/.test(attrOf(t.attrs, 'class'))) return;
                const solid = /\sdata-ws-ink="solid"/.test(t.attrs);
                const twin = lo.has(j) ? pTok[pLeft[lo.get(j)]] : structTwin.get(ki) || null;
                if (!twin) {
                    // a ring the key draws round printed content (a coin, a letter): only the ring
                    const ringOnly = solid && !t.text.trim() && ring(t.attrs) && !attrOf(t.attrs, 'data-ws-slot');
                    verdict.set(ki, ringOnly ? 'mark' : 'add');
                    return;
                }
                // the pupil page traces it: on a worked Model a given (black); on a Guided Practice
                // item the answer the pupil goes over (key ink) - its text only on a printed line or box
                if (twin.trace) {
                    if (modelCells.has(c)) verdict.set(ki, 'given');
                    else verdict.set(ki, solid ? 'ans' : overTrace(t));
                    return;
                }
                // the same element with new text (a filled write-on line, a sign box, an answer-row
                // chart cell): only its text is the answer (R3-1)
                if (!lo.has(j)) { verdict.set(ki, solid ? 'ans' : (t.svg ? (/^(text|tspan)$/i.test(t.tag) ? 'ans' : 'same') : 'text')); return; }
                // the pupil page prints the same element, restyled on the key: a given whose answer is
                // only its new paint - a part shaded (its fill), a choice ringed (its border)
                if (solid && !SHAPE.test(t.tag)) { verdict.set(ki, 'mark'); return; }
                if (SHAPE.test(t.tag)) {
                    const fill = attrOf(t.attrs, 'fill').toLowerCase();
                    if (fill && fill !== attrOf(twin.attrs, 'fill').toLowerCase() && !/^(none|#fff|#ffffff|white|transparent)$/.test(fill)) verdict.set(ki, 'fill');
                } else if (!/^(svg|g|defs|text|tspan)$/i.test(t.tag)) {
                    // R3-2: a ring the pupil page holds in transparent ink is not drawn there
                    const ringed = (a) => ring(a) || /\sdata-ws-chosen\b/.test(a);
                    if (ringed(t.attrs) && !ringed(twin.attrs)) verdict.set(ki, 'mark');
                }
            });
        }
    }
    let n = -1;
    return key.replace(OPEN_TAG_TEXT, (m, tag, attrs, text) => {
        n++;
        const tagged = (extra) => `<${tag} data-ws-key-ans${extra}${attrs}>${text}`;
        if (/\sdata-ws-key-ans\b/.test(attrs)) return m;
        const t = kTok[n];
        if (t.inCells && worked(t.cell)) return m;
        const words = /\sdata-ws-key="(?:words|short)"/.test(attrs);
        const v = verdict.get(n);
        if (/\sdata-ws-ink="solid"/.test(attrs) || words) {
            if (!words) {
                // the pupil page prints the very same mark (a worked example's traced answer): a given
                if (v === 'same' || v === 'given') { take(solidSig(t.cell, tag, attrs)); return m; }
                // a printed choice the key rings (a letter, a coin, a word): only the ring is the answer
                if (v === 'mark') { take(solidSig(t.cell, tag, attrs)); return tagged(' data-ws-key-mark'); }
                if (v === 'ans') { take(solidSig(t.cell, tag, attrs)); return tagged(''); }
                if (take(solidSig(t.cell, tag, attrs))) return m;           // the pupil page prints it: a given
                if (/\bmq-pupil\b/.test(attrOf(attrs, 'class'))) return m;     // the made-up pupil's work
            }
            return tagged('');
        }
        if (v === 'ans') return tagged('');
        // R3-1: only the text is the answer - the element's own line, box or border keeps its ink
        if (v === 'text') return text.replace(/&nbsp;|\s/g, '') ? `<${tag}${attrs}><span data-ws-key-ans data-ws-key-text>${text}</span>` : m;
        if (v === 'add') return tagged(' data-ws-key-add');   // owner 2026-10-09: a drawn answer is fully orange
        if (v === 'fill') return tagged(' data-ws-key-fill');
        if (v === 'mark') return tagged(' data-ws-key-mark');
        return m;
    });
}

/** A border or outline drawn in visible ink (inline style); `transparent` / `none` / 0 width is no ring. */
function ring(attrs) {
    const style = attrOf(attrs, 'style');
    const re = /(?:^|;)\s*(?:border|outline)(?:-(?:top|right|bottom|left))?\s*:\s*([^;]*)/gi;
    let m;
    while ((m = re.exec(style))) {
        const v = m[1].toLowerCase();
        if (/\bsolid\b/.test(v) && !/\btransparent\b|rgba\([^)]*,\s*0\)/.test(v) && !/(?:^|\s)0(?:px|pt|mm)?(?:\s|$)/.test(v)) return true;
    }
    return false;
}

const VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;

/**
 * Every open tag of a page with its cell ordinal, whether it sits in the cells (not the header or
 * footer), whether it or an ancestor is traced (`data-ws-ink="trace"`) or inside an SVG, and its
 * signatures. The open tags are listed in the order OPEN_TAG_TEXT walks them.
 */
function tokens(html) {
    const out = [];
    let cell = 0, inCells = false;
    const stack = [];   // {tag, trace, svg}
    const TAG = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*)>([^<]*)/g;
    let m;
    while ((m = TAG.exec(html))) {
        const [, close, tag, attrs, text] = m;
        const low = tag.toLowerCase();
        if (close) {
            const i = stack.map((s) => s.tag).lastIndexOf(low);
            if (i >= 0) stack.length = i;
            continue;
        }
        if (/\sdata-ws-cell="/.test(attrs)) { cell++; inCells = true; } else if (/^(footer|header)$/i.test(tag)) inCells = false;
        const top = stack[stack.length - 1] || { trace: false, svg: false };
        const trace = top.trace || /\sdata-ws-ink="trace"/.test(attrs);
        const svg = top.svg || low === 'svg';
        out.push({ tag, attrs, text, cell, inCells, trace, svg, sig: markSig(0, tag, attrs, text), loose: looseSig(0, tag, attrs, text), struct: structSig(tag, attrs) });
        if (!VOID.test(tag) && !/\/\s*$/.test(attrs)) stack.push({ tag: low, trace, svg });
    }
    return out;
}

/** Longest common subsequence of two signature lists: Map key position -> pupil position. */
function align(a, b) {
    const n = a.length, m = b.length;
    const got = new Map();
    if (!n || !m) return got;
    const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    let i = 0, j = 0;
    while (i < n && j < m) { if (a[i] === b[j]) { got.set(j, i); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
    return got;
}

/* ------------------------------------------------------------------ rows (data only) */

const labelText = (style, k) => (style === 'letter' ? `${LETTERS[(k - 1) % 26]}.` : `${k}.`);

/** One plan's pages -> [{items: [{label, cell, key, words}]}], in renderPages' own walk order. */
function planPageRows(plan) {
    const pages = plan.pages && plan.pages.length ? plan.pages : [{ sections: plan.sections || [] }];
    const report = { label: 1 };
    return pages.map((pg) => {
        const items = [];
        let cellNo = 0;
        const gp = {};
        const walk = (part, guided) => {
            if (!part) return;
            // critic r2 (R2-2): the Guided Practice band's cells are unlabelled but answered; the short
            // key lists them under a "Guided Practice" sub-heading (owner ruling 2026-10-09)
            if (part.kind === 'band' && /^Guided Practice/i.test(String(part.label || ''))) guided = true;
            if (part.kind === 'grid') {
                const list = part.items || [];
                const start = part.start !== undefined ? part.start : report.label;
                let k = start;
                list.forEach((item, i) => {
                    const ord = ++cellNo;
                    if (item.nolabel || (part.unlabelled || []).includes(i)) {
                        const band = item.keyList || (guided && !item.model ? 'Guided Practice' : '');
                        if (!band || plan.nothingToAnswer) return;
                        const key = item.key || (item.q ? cellAnswerKey(item.q) : null);
                        const words = answerWords(item, key);
                        if (!key && !words) return;
                        gp[band] = (gp[band] || 0) + 1;
                        items.push({ label: `${gp[band]}.`, cell: ord, key, words, guided: band, skill: item.skill || '', payload: (item.q && item.q.cell && item.q.cell.payload) || null });
                        return;
                    }
                    const n = k++;
                    if (plan.nothingToAnswer) return;
                    const key = item.key || (item.q ? cellAnswerKey(item.q) : null);
                    items.push({ label: labelText(part.labels, n), cell: ord, key, words: answerWords(item, key), skill: item.skill || '', payload: (item.q && item.q.cell && item.q.cell.payload) || null });
                });
                if (part.start === undefined) report.label += k - start;
                return;
            }
            if (part.content) walk(part.content, guided);
            if (Array.isArray(part.contents)) part.contents.forEach((x) => walk(x, guided));
            if (Array.isArray(part.parts)) part.parts.forEach((x) => walk(x, guided));
        };
        for (const part of pg.sections || []) walk(part, false);
        // Guided Practice first (it comes first on the page), then the labelled items
        items.sort((a, b) => (b.guided ? 1 : 0) - (a.guided ? 1 : 0));
        return { items, selfKey: !!plan.nothingToAnswer };
    });
}

/**
 * Every pupil page of a printout, in print order, with its items' labels and answers.
 * `plans` is the list of plans the printout rendered (a More Practice plan's letter sheets are
 * expanded here, exactly as renderPlan expands them).
 */
export function shortKeyRows(plans) {
    const out = [];
    for (const plan of plans || []) {
        if (!plan) continue;
        const sheets = plan.sheets && plan.sheets.length ? plan.sheets : [plan];
        for (const s of sheets) for (const r of planPageRows(s)) out.push(Object.assign({ page: out.length + 1 }, r));
    }
    return out;
}

/* ------------------------------------------------------------------ answer text */

const FRAC = /(^|[^\d/])(-?\d+)\s*\/\s*(\d+)(?![\d/])/g;
const frac = (a, b) => `<span class="ws-skey-frac"><span>${esc(a)}</span><span>${esc(b)}</span></span>`;

/** Plain answer text with every a/b set as a stacked fraction (a mixed number keeps its whole). */
export function answerHtml(text) {
    const s = String(text === undefined || text === null ? '' : text);
    let out = '';
    let last = 0;
    s.replace(FRAC, (m, pre, a, b, at) => {
        out += esc(s.slice(last, at) + pre) + frac(a, b);
        last = at + m.length;
        return m;
    });
    return out + esc(s.slice(last));
}

const scalar = (v) => (v === undefined || v === null || typeof v === 'object' ? '' : String(v));

/** What a short key prints for one item: plain text (fractions stacked by answerHtml). */
export function answerText(row) {
    const key = row.key;
    let t = '';
    // shade the model: how many of how many parts (critic r1, B2: "1 part shaded" had no whole)
    const p = row.payload;
    let shade = '';
    if (p && p.task === 'shade' && p.answer && p.show && Number(p.show.d) > 0) {
        const n = Number(p.answer.shade), d = Number(p.show.d);
        shade = n <= d ? `${n} of ${d} ${d === 1 ? 'part' : 'parts'} shaded` : `${p.show.n}/${d} shaded`;
    }
    // a role's own short line (True or False, Error Analysis, Stretch: the choice and the value);
    // a bare shaded count at its end reads as the parts of the whole
    if (key && typeof key === 'object' && scalar(key.short)) {
        const s = String(key.short).trim();
        return shade ? s.replace(new RegExp(`([:;]\\s*)${Number(p.answer.shade)}$`), `$1${shade}`) : s;
    }
    if (shade && (!key || typeof key !== 'object' || /^\d+ parts? shaded$/.test(scalar(key.display)) || !scalar(key.display))) return shade;
    if (key && typeof key === 'object') {
        t = scalar(key.display) || scalar(key.value);
        if (!t && Array.isArray(key.value)) t = key.value.map(String).join(', ');
        // a multi-part answer with no single display: its graded slots, kept together
        if (!t && key.slots) {
            const vals = Object.values(key.slots).filter((s) => s && s.graded !== false && s.value !== undefined && s.value !== null && s.value !== '').map((s) => String(s.value));
            t = vals.join(', ');
        }
    } else if (key !== null && key !== undefined) t = String(key);
    if (!t) t = String(row.words || '').replace(/^Answer:\s*/, '');
    t = t.replace(/^Answer:\s*/, '').replace(/\b1 parts\b/g, '1 part').trim();
    if (shade) t = t.replace(new RegExp(`([:;]\\s*)${Number(p.answer.shade)}$`), `$1${shade}`);
    return t || '-';
}

/* ------------------------------------------------------------------ layout */

// Entry geometry per size (mm): the column width and the height of one line of answers. Andika at
// the size's text point; the heading is a line and a half. Measured on the S and L proofs.
const GEOM = {
    S: { col: 30, line: 5.6, head: 7.5, pt: 11 },
    M: { col: 36, line: 6.6, head: 8.5, pt: 13 },
    L: { col: 42, line: 7.6, head: 9.5, pt: 15 },
};
const LIVE_W = { A4: 186, Letter: 192 };
const BODY_H = { A4: 228, Letter: 210 };

const charsOf = (text) => text.replace(/\d+\s*\/\s*\d+/g, 'xx').length + 3;
const perColOf = (g) => Math.floor(g.col / (g.pt * 0.3528 * 0.55));
const entrySpan = (text, g) => {
    // a long answer takes more columns (a Stretch list: the whole row), never shrinks (DN-10)
    return Math.min(6, Math.max(1, Math.ceil(charsOf(text) / perColOf(g))));
};
/** How many lines an entry wraps to at `span` columns (a long list wraps inside its row). */
const entryLines = (text, g, span) => Math.max(1, Math.ceil(charsOf(text) / (perColOf(g) * span)));

/**
 * Lay the groups out on short-key pages. Returns [[{group, items, cont}]] - each page a list of
 * group slices. A group never splits unless it alone is taller than a page.
 */
function paginateGroups(groups, size, paper) {
    const g = GEOM[size] || GEOM.L;
    const cols = Math.max(2, Math.floor((LIVE_W[paper] || LIVE_W.A4) / g.col));
    const bodyH = BODY_H[paper] || BODY_H.A4;
    const pages = [];
    let cur = [];
    let used = 0;
    const flush = () => { if (cur.length) pages.push(cur); cur = []; used = 0; };
    for (const grp of groups) {
        // pack entries into rows of `cols` units; a row with a fraction is 1.8 lines tall
        const rows = [];
        let row = { units: 0, tall: false, items: [], lines: 1 };
        let prevGuided = '';
        for (const it of grp.items) {
            const span = Math.min(cols, it.span);
            const sub = (it.guided || '') !== prevGuided;
            prevGuided = it.guided || '';
            if (sub && row.items.length) { rows.push(row); row = { units: 0, tall: false, items: [], lines: 1 }; }
            if (sub) row.sub = true;
            if (row.units + span > cols) { rows.push(row); row = { units: 0, tall: false, items: [], lines: 1 }; }
            row.units += span; row.items.push(it); row.tall = row.tall || it.tall;
            row.lines = Math.max(row.lines || 1, entryLines(it.text, g, span));
        }
        if (row.items.length || !rows.length) rows.push(row);
        const rowH = (r) => (r.tall ? g.line * 1.6 : g.line) * (r.lines || 1) + (r.sub ? g.line : 0);
        let slice = { group: grp, items: [], cont: false };
        let need = g.head;
        if (used + g.head + rowH(rows[0]) > bodyH) flush();
        used += g.head;
        for (const r of rows) {
            if (used + rowH(r) > bodyH) {
                cur.push(slice); flush();
                slice = { group: grp, items: [], cont: true };
                used = g.head;
            }
            slice.items.push(...r.items);
            used += rowH(r);
            need += rowH(r);
        }
        cur.push(slice);
        used += 2;   // the gap under a group
    }
    flush();
    return { pages, cols };
}

/**
 * Render short-key pages for some groups.
 *
 * @param {Object[]} groups   rows from shortKeyRows (or a subset: one page's, for "after each page")
 * @param {Object} o          {size, look, paper, header, footer, seed, form, pageLabel(page)}
 * @returns {string[]}        one html string per short-key page (not yet decorated)
 */
export function renderShortKey(groups, o = {}) {
    const size = ['S', 'M', 'L'].includes(o.size) ? o.size : 'L';
    const paper = /letter/i.test(String(o.paper || '')) ? 'Letter' : 'A4';
    const g = GEOM[size];
    const prepared = groups.map((grp) => Object.assign({}, grp, {
        items: grp.items.map((it) => {
            const text = answerText(it);
            return Object.assign({}, it, { text, span: entrySpan(text, g), tall: /\d\s*\/\s*\d/.test(text) });
        }),
    }));
    const { pages, cols } = paginateGroups(prepared, size, paper);
    const head = o.header || {};
    const tab = head.tab === false ? false : keyTab(head.tab && head.tab.length ? head.tab : ['Answer Key']);
    const label = o.pageLabel || ((p) => `Page ${p}`);
    return pages.map((slices, i) => {
        const body = slices.map((sl) => {
            const grp = sl.group;
            const h = `<div class="ws-skey-h" data-ws-short-group="${grp.page}">${esc(label(grp.page))}${sl.cont ? ' (continued)' : ''}</div>`;
            if (grp.selfKey || !grp.items.length) {
                return `<section class="ws-skey-group">${h}<p class="ws-skey-none">Nothing to mark on this page.</p></section>`;
            }
            const one = (it) => `<div class="ws-skey-it" ${it.guided ? 'data-ws-short-gpage' : 'data-ws-short-page'}="${grp.page}" ${it.guided ? 'data-ws-short-gcell' : 'data-ws-short-cell'}="${it.cell}"${it.span > 1 ? ` style="grid-column:span ${Math.min(cols, it.span)}"` : ''}>`
                + `<b class="ws-skey-lab">${esc(it.label)}</b><span class="ws-skey-ans" data-ws-key-ans data-ws-ink="solid" data-ws-key="short">${answerHtml(it.text)}</span></div>`;
            const grid = (list) => `<div class="ws-skey-grid" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${list.map(one).join('')}</div>`;
            const bands = [...new Set(sl.items.filter((it) => it.guided).map((it) => it.guided))];
            const rest = sl.items.filter((it) => !it.guided);
            const body2 = bands.length
                ? bands.map((b) => `<div class="ws-skey-sub">${esc(b)}</div>${grid(sl.items.filter((it) => it.guided === b))}`).join('') + (rest.length ? `<div class="ws-skey-sub">Practice</div>${grid(rest)}` : '')
                : grid(rest);
            return `<section class="ws-skey-group">${h}${body2}</section>`;
        }).join('');
        const footer = Object.assign({}, o.footer || {}, { center: `Key ${i + 1}/${pages.length}` });
        const html = page({
            look: o.look || 'ican', size, tab: 6,
            header: { name: false, date: false, score: false, tab, title: o.title || 'Answer Key' },
            footer, body: `<div class="ws-skey" style="font-size:${g.pt}pt">${body}</div>`,
            cls: 'ws-key ws-key-short',
        });
        return html.replace('<section class="ws-page ', '<section data-ws-key-style="short" class="ws-page ');
    });
}

export default { normKeyOptions, shortKeyRows, answerText, answerHtml, renderShortKey, tagKeyAnswers };
