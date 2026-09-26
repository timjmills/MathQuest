// js/modules/sheet/frame.js
// Everything outside the cells: the sheet, the header fields, the strand tab, the "I Can"
// title, the teacher footer, the instruction block and the bands (including the `Say:` band).
//
// Rules: section 2 (page), section 8 (header, HD-1..HD-32), section 9 (bands, BD-1..BD-17).
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`.

import { DEFAULT_LOOK, DEFAULT_SIZE, blankWidth } from './tokens.js';
import { esc } from './cell.js';

/* --------------------------------------------------------------- header parts (HD-1) */

/**
 * The five header parts are each a teacher check box in the print dialog; default all on
 * (HD-1). Score always prints with its denominator (HD-2). Field positions never move (HD-16).
 * @param {{name?: boolean, date?: boolean, time?: boolean, goal?: boolean, score?: number|false}} h
 */
export function headerFields(h = {}) {
    return [
        h.name ? `<div class="ws-field name">Name<i></i></div>` : '',
        !h.name ? '<div class="ws-spacer"></div>' : '',
        h.date ? `<div class="ws-field date">Date<i></i></div>` : '',
        h.time ? `<div class="ws-field time">Time<i></i></div>` : '',
        h.goal ? `<div class="ws-field goal">Goal<i></i></div>` : '',
        h.score ? `<div class="ws-field score">Score<i></i><b>/${h.score}</b></div>` : '',
    ].join('');
}

/**
 * The strand tab: up to three lines, "Level N / Strand / Phase". SC-5 - it says Level, never
 * Grade. Lines 1-2 are weight 700, line 3 is 400 (section 3.2).
 * @param {string[]|false} lines
 */
export const strandTab = (lines) =>
    (lines ? `<div class="ws-tabbox">${lines.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` : '');

/**
 * The "I Can" title (HD-10, HD-15): plain bold Andika, one line, no banner, no icon.
 * `note` is the optional trailing detail set at weight 400 on the same baseline.
 */
export const pageTitle = (text, note = '') =>
    (text ? `<div class="ws-title">${esc(text)}${note ? `<small>${esc(note)}</small>` : ''}</div>` : '');

/**
 * The teacher footer (HD-30): the ONLY place grade and CCSS codes appear. Left skill ids,
 * grade and standards; centre page n/N; right form letter, seed or week/day code.
 */
export const pageFooter = (f = {}) =>
    `<footer class="ws-foot"><span>${esc(f.left || '')}</span><b>${esc(f.center || '1/1')}</b><span>${esc(f.right || '')}</span>` +
    `<small class="ws-copy">${esc(copyrightLine(f.year))}</small></footer>`;

/**
 * The owner's copyright line, printed on EVERY sheet, key and lesson page (owner ruling 2026-09-26).
 * It shares the footer's 6 mm band as a second line, so no page loses body height. The year is the
 * print year unless a caller pins it (`footer.year`) for reproducible renders.
 */
export const COPYRIGHT_HOLDER = 'Cultivating the Digital';
export const copyrightLine = (year) => `© ${year || new Date().getFullYear()} ${COPYRIGHT_HOLDER}. All rights reserved.`;

/* ------------------------------------------------------------------- the sheet (PG) */

/**
 * One printed sheet. The body is a flex column: instruction block, then the grid or bands,
 * which own all remaining height (PG-10).
 *
 * @param {Object} o
 * @param {'ican'|'daily'} [o.look]
 * @param {'S'|'M'|'L'} [o.size]
 * @param {number} [o.tab]        the tab step 6 / 5 / 4 from CL-31 (tokens.factTab)
 * @param {Object} [o.header]     {name, date, time, goal, score, tab, title, titleNote}
 * @param {Object} [o.footer]     {left, center, right}
 * @param {string} o.body
 * @param {string} [o.cls]
 * @param {string} [o.note]       reviewer note; screen only, hidden by @media print
 */
export function page({ look = DEFAULT_LOOK, size = DEFAULT_SIZE, tab = 6, header = {}, footer = {}, body, cls = '', note = '' }) {
    const h = { name: true, date: true, score: false, tab: false, title: '', ...header };
    const fields = headerFields(h);
    const tabBox = strandTab(h.tab);
    const title = pageTitle(h.title, h.titleNote);
    return `${note ? `<div class="ws-note">${note}</div>` : ''}
<section class="ws-page ws-${size} ws-${look} ws-tab${tab} ${cls}" data-ws-look="${look}" data-ws-size="${size}">
  <header class="ws-head"><div class="ws-rowA${h.tab ? '' : ' notab'}">${fields}${tabBox}</div>${title}<div class="ws-headrule"></div></header>
  <main class="ws-body">${body}</main>
  ${pageFooter(footer)}
</section>`;
}

/** A whole standalone document, for the gallery and the mock-up parity harness. */
export function doc(title, pages, css = '', href = '../kit/sheet-kit.css') {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${href}">${css ? `<style>${css}</style>` : ''}</head>
<body>${pages.join('\n')}</body></html>`;
}

/* ---------------------------------------------------------- instruction block (BD-10) */

/**
 * One instruction per section: at most 12 words in one to three short imperative sentences,
 * directly above the cells it governs, never inside a cell. Wording comes from the controlled
 * library in PEDAGOGY_STANDARD.md - page code never composes it (BD-14).
 */
export const instruction = (text) => `<div class="ws-instrline">${esc(text)}</div>`;

/* ------------------------------------------------------------------- bands (section 9) */

// BD-1: the fixed band vocabulary of the I Can look. No other band label may be printed.
export const BAND_LABELS = Object.freeze([
    'Model:', 'Steps:', 'Say:', 'Vocabulary:', 'Guided Practice:', 'Independent Practice:',
    'More Practice:', 'Review:', 'Check:', 'Stretch:', 'Word Problems:', 'Rule:',
]);

/**
 * A band: a strip carrying its bold label and instruction, then its content.
 * BD-2 label spec, BD-3 strip height. `grow` gives the band the body's spare height.
 */
export const band = (labelText, instr, content, { grow = false, extra = '' } = {}) =>
    `<div class="ws-band${grow ? ' grow' : ''}"><div class="ws-strip"><b>${esc(labelText)}</b><span>${esc(instr || '')}</span>${extra}</div>${content}</div>`;

/**
 * BD-8 - the `Say:` band. A full-width strip closing the Model band: bold `Say:` at cell-text
 * size, then one oral frame from the library inside curly double quotes. Its blanks are ruled
 * lines of width B(n), never under 14 mm; they are SAID, not written, so the band is
 * unlabelled, unscored and carries no instruction line.
 *
 * @param {string} frame  an oral frame using `__` for each blank, e.g. '__ plus __ equals __.'
 * @param {{size?: string, digits?: number}} [opts]
 */
export function sayBand(frame, { size = DEFAULT_SIZE, digits = 2 } = {}) {
    const w = blankWidth(digits, size);
    const parts = String(frame).split('__');
    let inner = '';
    parts.forEach((part, i) => {
        if (i) inner += `<span class="ws-line" style="--w:${w}mm" data-ws-slot="say-${i}" data-ws-shape="line" data-ws-graded="0"></span>`;
        if (part) inner += `<span>${esc(part)}</span>`;
    });
    return `<div class="ws-band ws-band--say" data-ws-band="say"><div class="ws-strip ws-strip--say">`
        + `<b>Say:</b><span class="ws-sayframe"><span class="ws-q">“</span>${inner}<span class="ws-q">”</span></span>`
        + `</div></div>`;
}

/**
 * BD-4 - the Steps band: numbered imperatives in outlined circles, sitting BESIDE the Model
 * cell so each step reads next to the mark it produces. Never solid numerals.
 */
export const steps = (items) =>
    `<ol class="ws-steps">${items.map((s, i) => `<li><em>${i + 1}</em><span>${s}</span></li>`).join('')}</ol>`;

/** A story box: rounded (LS - something to read), 1.5 pt outline, underline marks the relation. */
export const story = (html) => `<div class="ws-story">${html}</div>`;

/* -------------------------------------------------------------------- page-side strips */

/**
 * A page-side strip (skip-count, multiples, number track). PG-13: it reduces the grid width;
 * the caller passes the reduced width to the layout, never assuming 186 mm.
 */
export function sideStrip(values, { width = 12, pitch = 10.5, grey = false } = {}) {
    return `<div class="ws-sidestrip${grey ? ' grey' : ''}" style="--sw:${width}mm;--pitch:${pitch}mm">${values.map((v) => `<span>${v}</span>`).join('')}</div>`;
}

export const withStrip = (main, strip) => `<div class="ws-withstrip"><div class="ws-col">${main}</div>${strip}</div>`;
