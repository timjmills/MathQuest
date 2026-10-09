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
    if (key === false) return { on: false, placement: 'end', style: 'copy' };
    if (!key || typeof key !== 'object') return { on: true, placement: 'end', style: 'copy' };
    return {
        on: key.on !== false,
        placement: key.placement === 'after-page' ? 'after-page' : 'end',
        style: key.style === 'short' ? 'short' : 'copy',
    };
}

/* ------------------------------------------------------------------ INK-31: which marks are answers */

const OPEN_TAG = /<([a-zA-Z][\w-]*)\b([^>]*)>/g;
const attrOf = (attrs, name) => { const m = new RegExp(`\\s${name}="([^"]*)"`).exec(attrs); return m ? m[1] : ''; };
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
    const pool = new Map();
    let cell = 0;
    String(pupilHtml || '').replace(OPEN_TAG, (m, tag, attrs) => {
        if (/\sdata-ws-cell="/.test(attrs)) cell++;
        if (/\sdata-ws-ink="solid"/.test(attrs)) { const s = solidSig(cell, tag, attrs); pool.set(s, (pool.get(s) || 0) + 1); }
        return m;
    });
    cell = 0;
    return String(keyHtml || '').replace(OPEN_TAG, (m, tag, attrs) => {
        if (/\sdata-ws-cell="/.test(attrs)) cell++;
        if (/\sdata-ws-key-ans\b/.test(attrs)) return m;
        const words = /\sdata-ws-key="(?:words|short)"/.test(attrs);
        if (!words && !/\sdata-ws-ink="solid"/.test(attrs)) return m;
        if (!words) {
            const s = solidSig(cell, tag, attrs);
            const n = pool.get(s) || 0;
            if (n > 0) { pool.set(s, n - 1); return m; }           // the pupil page prints it: a given
            if (/\bmq-pupil\b/.test(attrOf(attrs, 'class'))) return m;   // the made-up pupil's work
        }
        return `<${tag} data-ws-key-ans${attrs}>`;
    });
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
        const walk = (part) => {
            if (!part) return;
            if (part.kind === 'grid') {
                const list = part.items || [];
                const start = part.start !== undefined ? part.start : report.label;
                let k = start;
                list.forEach((item, i) => {
                    const ord = ++cellNo;
                    if (item.nolabel || (part.unlabelled || []).includes(i)) return;
                    const n = k++;
                    if (plan.nothingToAnswer) return;
                    const key = item.key || (item.q ? cellAnswerKey(item.q) : null);
                    items.push({ label: labelText(part.labels, n), cell: ord, key, words: answerWords(item, key), skill: item.skill || '', payload: (item.q && item.q.cell && item.q.cell.payload) || null });
                });
                if (part.start === undefined) report.label += k - start;
                return;
            }
            if (part.content) walk(part.content);
            if (Array.isArray(part.contents)) part.contents.forEach(walk);
            if (Array.isArray(part.parts)) part.parts.forEach(walk);
        };
        for (const part of pg.sections || []) walk(part);
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
        for (const it of grp.items) {
            const span = Math.min(cols, it.span);
            if (row.units + span > cols) { rows.push(row); row = { units: 0, tall: false, items: [], lines: 1 }; }
            row.units += span; row.items.push(it); row.tall = row.tall || it.tall;
            row.lines = Math.max(row.lines || 1, entryLines(it.text, g, span));
        }
        if (row.items.length || !rows.length) rows.push(row);
        const rowH = (r) => (r.tall ? g.line * 1.6 : g.line) * (r.lines || 1);
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
            const items = sl.items.map((it) => `<div class="ws-skey-it" data-ws-short-page="${grp.page}" data-ws-short-cell="${it.cell}"${it.span > 1 ? ` style="grid-column:span ${Math.min(cols, it.span)}"` : ''}>`
                + `<b class="ws-skey-lab">${esc(it.label)}</b><span class="ws-skey-ans" data-ws-key-ans data-ws-ink="solid" data-ws-key="short">${answerHtml(it.text)}</span></div>`).join('');
            return `<section class="ws-skey-group">${h}<div class="ws-skey-grid" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${items}</div></section>`;
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
