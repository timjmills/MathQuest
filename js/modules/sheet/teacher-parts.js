// js/modules/sheet/teacher-parts.js
// THE TEACHER-PAGE PARTS of the detailed lesson maker (V22 Part 10, Appendix I): the page with the
// lifted (17 mm) or continuation (12 mm) header, the teacher band, T-BOX (Tip / Feedback / Watch /
// Research), T-SCRIPT rows (Do / Say / Ask / Note), T-LOOP, tables, check-box lists, vocabulary
// cards and the pupil-page thumbnail at 26.2 %. Every page is built from frame.js's own parts
// (headerFields, strandTab, pageTitle, pageFooter, band), so the teacher pages and the pupil pages
// are one family: the same tab, title, footer and © line.
//
// V22's hand-written HTML/CSS (Appendix A, G) is the SPEC these parts are checked against
// (tests/scripts/ws-detailed-lesson.cjs --check), not code copied here. Values come from tokens.js
// (LESSON_ACCENT, INK) or are V22 §10 constants named below.
//
// The stylesheet `TEACHER_CSS` is ADDITIVE: every selector is a `dl-*` class that exists only on a
// detailed-lesson page, so no other sheet changes (saved quizzes keep their HTML).
//
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

import { strandTab, pageTitle, pageFooter, band, headerFields } from './frame.js';
import { esc } from './cell.js';
import { INK, LESSON_ACCENT } from './tokens.js';
import { teacherIcon, TEACHER_ICON_CSS } from './teacher-icons.js';
import { stepIcon } from './lesson-icons.js';

/** V22 §8.1 / §10: body heights (A4) under each header kind. */
export const TEACHER_BODY_MM = Object.freeze({ lifted: 245, full: 236, cont: 250 });
/**
 * V22 §8.7: the title is lifted into row A only when it fits beside the tab on one line
 * (<= 118 mm at 18 pt: about 34 characters); a longer title takes its own row (26 mm header).
 */
export const LIFT_MAX_CHARS = 34;
/** V22 §10.9: a thumbnail is the real page scaled to 26.2 % (55 x 77.8 mm). */
export const THUMB_SCALE = 0.262;
export const THUMB_MM = Object.freeze({ w: 55, h: 77.8 });
/** The key colour of expected answers (V22 §10.8, INK-31). */
export const KEY_INK = '#C2410C';

/* ------------------------------------------------------------------------- the page */

/**
 * A teacher (or lifted pupil) page. `head`: 'lifted' (title in row A beside the tab, 17 mm) or
 * 'cont' (12 mm: a one-line tab "Level 2 · Number · Teacher 3"). The footer is frame.js's.
 *
 * @param {{tab: string[], title: string, head?: 'lifted'|'cont', footer: {left, center, right, year?},
 *          body: string, cls?: string, id?: string, kind?: 'teacher'|'pupil'|'key'}} o
 */
export function teacherPage({ tab, title, head = 'lifted', footer = {}, body, cls = '', id = '', kind = 'teacher' }) {
    const lines = (tab || []).filter(Boolean);
    const header = head === 'full'
        ? `<header class="ws-head dl-full"><div class="ws-rowA">${headerFields({})}${strandTab(lines)}</div>${pageTitle(title)}<div class="ws-headrule"></div></header>`
        : head === 'cont'
        ? `<header class="ws-head dl-cont"><div class="ws-rowA"><div class="ws-spacer"></div>`
            + `<div class="ws-tabbox dl-tabline"><span>${esc(lines.join(' · '))}</span></div></div><div class="ws-headrule"></div></header>`
        : `<header class="ws-head dl-lift"><div class="ws-rowA">${headerFields({})}${pageTitle(title)}${strandTab(lines)}</div><div class="ws-headrule"></div></header>`;
    return `<section class="ws-page ws-L ws-ican dl-page dl-${kind} ${cls}" data-ws-look="ican" data-ws-size="L" data-dl-page="${esc(id)}" data-dl-kind="${kind}">`
        + `${header}<main class="ws-body dl-body">${body}</main>${pageFooter(footer)}</section>`;
}

/* ------------------------------------------------------------------------ the parts */

/** A teacher band (V22 §8.8 teacher labels): the kit band, its content after the strip. */
export const tBand = (label, content, { grow = false, instr = '' } = {}) =>
    band(label, instr, `<div class="dl-bandin">${content}</div>`, { grow }).replace('<div class="ws-band', '<div class="ws-band dl-band');

/** One 11 pt line of text (the T1 standards line, plain notes). */
export const tLine = (html, cls = '') => `<div class="dl-tline ${cls}">${html}</div>`;

const BOX = {
    tip: { label: 'Tip:', icon: 'tip' },
    language: { label: 'Tip:', icon: 'language' },
    why: { label: 'Tip:', icon: 'why' },
    feedback: { label: 'Feedback:', icon: 'feedback' },
    watch: { label: 'Watch:', icon: 'watch' },
    research: { label: 'Research:', icon: 'research' },
};
export const BOX_KINDS = Object.freeze(Object.keys(BOX));

/** T-BOX-1..4 (V22 §10.5): icon column, bold label, bold 2-5 word title, 11 pt text. */
export function tBox(kind, title, text) {
    const b = BOX[kind] || BOX.tip;
    // V22 §10.5: the bold memorable title is a sentence of its own ("Big first, every time.").
    title = /[.!?]$/.test(String(title).trim()) ? String(title).trim() : `${String(title).trim()}.`;
    return `<div class="dl-box dl-box-${kind === 'watch' ? 'watch' : 'plain'}">${teacherIcon(b.icon)}`
        + `<div class="dl-boxtext"><b>${esc(b.label)}</b> <b>${esc(title)}</b> ${text}</div></div>`;
}

/** Spoken words: bold label, curly quotes, 13 pt (V22 §8.16, Q9: no italics). */
const spoken = (s) => `<span class="dl-spoken">“${esc(s)}”</span>`;

/** Expected answers in the key colour, bold (V22 §10.8). `[[...]]` in a Note marks one. */
export const keyMark = (s) => `<b class="dl-ka" data-ka>${esc(s)}</b>`;
const noteHtml = (s) => esc(s).replace(/\[\[(.+?)\]\]/g, (m, a) => `<b class="dl-ka" data-ka>${a}</b>`);

/**
 * T-SCRIPT (V22 §8.16): numbered steps, each a grid of the accent numeral (6.4 mm, the pupil
 * Steps mark), a 14 mm label column and the text; 0.75 pt hairlines between steps.
 * @param {{n: number, icon?: string, do?: string, say?: string, ask?: string, note?: string}[]} rows
 */
export function tScript(rows) {
    return `<div class="dl-script">${rows.map((r) => {
        const lines = [];
        if (r.do) lines.push(`<b>Do:</b><span>${esc(r.do)}</span>`);
        if (r.say) lines.push(`<b>Say:</b><span>${spoken(r.say)}</span>`);
        if (r.ask) lines.push(`<b>Ask:</b><span>${spoken(r.ask)}</span>`);
        if (r.note) lines.push(`<b>Note:</b><span>${noteHtml(r.note)}</span>`);
        return `<div class="dl-srow"><em class="mq-lnum" data-mq-accent>${r.n}</em><div class="dl-slines">${lines.join('')}</div></div>`;
    }).join('')}</div>`;
}

/** T-LOOP (V22 §10.6): Most / About half / Fewer than half, with solid / half / hollow circles. */
export function tLoop({ most, half, fewer }) {
    const dot = (k) => `<svg class="dl-loopdot" viewBox="0 0 10 10" width="5mm" height="5mm" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="${k === 'most' ? '#000' : '#fff'}" stroke="#000" stroke-width="1.5pt" vector-effect="non-scaling-stroke"/>${k === 'half' ? '<path d="M5 1 A4 4 0 0 1 5 9 Z" fill="#000"/>' : ''}</svg>`;
    const row = (k, label, text) => `<div class="dl-looprow">${dot(k)}<b>${label}</b><span>${noteHtml(text)}</span></div>`;
    return `<div class="dl-loop">${row('most', 'Most:', most)}${row('half', 'About half:', half)}${row('fewer', 'Fewer than half:', fewer)}</div>`;
}

/**
 * A teacher table (V22 §10.4): head row bold under a 1.5 pt rule, 0.75 pt rules under rows,
 * 10 pt, no fills. Cells are HTML (callers escape their own text; `cellText` helps).
 */
export function tTable(head, rows, { cls = '', widths = [] } = {}) {
    const col = widths.length ? `<colgroup>${widths.map((w) => `<col style="width:${w}">`).join('')}</colgroup>` : '';
    // (head null: a table continued from the block above, no header row)
    return `<table class="tt dl-table ${cls}">${col}${head ? `<thead><tr>${head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>` : ''}`
        + `<tbody>${rows.map((r) => `<tr${r.cls ? ` class="${r.cls}"` : ''}>${(r.cells || r).map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
export const cellText = (s) => esc(s);
/** "Key name: rest" -> bold key name (V22 §10.9 T2: each Skill cell starts with a bold key name). */
export const keyNamed = (s) => { const m = String(s).match(/^([^:]+):\s*(.*)$/); return m ? `<b>${esc(m[1])}:</b> ${esc(m[2])}` : esc(s); };

/** A two-column check-box list (5 mm boxes; the one sanctioned box on a teacher page, §8.15). */
export const checkList = (items) =>
    `<ul class="dl-checks">${items.map((t) => `<li><span class="dl-cbox"></span><span>${esc(t)}</span></li>`).join('')}</ul>`;

/** A vocabulary card (V22 §10.9 T1): mini-diagram, word 13 pt bold, gloss <= 8 words. */
export const vocabCard = (word, gloss, diagram) =>
    `<div class="dl-vcard"><div class="dl-vdiag">${diagram || ''}</div><b>${esc(word)}</b><span>${esc(gloss)}</span></div>`;
export const vocabCards = (cards) => `<div class="dl-vcards">${cards.join('')}</div>`;

/** The black `board` line (V22 §8.15): one text line, never a box. */
export const boardLine = (text = 'Board: teacher models here') =>
    `<div class="dl-board">${teacherIcon('board', 5)}<span>${esc(text)}</span></div>`;

/** A Critical Atom mark (the `key` icon). */
export const keyIcon = () => teacherIcon('key', 4.5);
/** A step mark exactly as on the pupil Steps: accent numeral and step icon. */
export const stepMark = (n, icon) => `<span class="dl-stepmark"><em class="mq-lnum" data-mq-accent>${n}</em>${icon ? stepIcon(icon, 'L', { mm: 5 }) : ''}</span>`;

/**
 * A pupil-page thumbnail (V22 §10.9): the REAL pupil page (its pupil state, no answers) scaled to
 * 26.2 %, 55 x 77.8 mm, 0.75 pt border.
 */
export const thumb = (pageHtml, caption = '') =>
    `<figure class="thumb dl-thumb" data-dl-thumb><div class="dl-thumbin">${pageHtml}</div>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;

/** Content beside a thumbnail (the first rows of the section that uses that page longest). */
export const besideThumb = (left, thumbHtml) => `<div class="dl-beside"><div class="dl-besidel">${left}</div>${thumbHtml}</div>`;

/** Two columns (T2b reference key: 1fr 1fr, 4 mm gap). */
export const twoCols = (a, b) => `<div class="dl-2col"><div>${a}</div><div>${b}</div></div>`;
/** A 13 pt bold sub-head. */
export const subHead = (s) => `<div class="dl-sub">${esc(s)}</div>`;

/* ------------------------------------------------------------------ the stylesheet */

/**
 * ADDITIVE teacher CSS (V22 §10.2 type: section heads 15 pt bold, sub-heads 13 pt, body 11 pt,
 * spoken 13 pt, tables 10 pt; §10.4 rules; §10.5 boxes; §10.6 loops; §10.9 thumbnails).
 * Also the landscape page of the 2-up exit slip (§8.1 PG-5) and the RCDWS word-problem page.
 */
export const TEACHER_CSS = `
${TEACHER_ICON_CSS}
@page dlland { size: A4 landscape; margin: 0; }
.ws-page.dl-page{--mq-lesson-accent:${LESSON_ACCENT}}
.ws-page.dl-teacher{font-size:11pt;line-height:1.3}
.ws-page .dl-lift .ws-rowA{height:14mm;align-items:center;gap:4mm}
.ws-page .dl-lift .ws-rowA>.ws-spacer{flex:0 0 30mm}
.ws-page .dl-lift .ws-title{flex:1;min-width:0;margin:0;height:auto;white-space:normal;text-align:center;line-height:1.15;align-self:center}
.ws-page .dl-lift .ws-tabbox{margin-left:0}
.ws-page .dl-cont .ws-rowA{height:8mm;align-items:flex-start}
.ws-page .dl-cont .ws-tabbox.dl-tabline{width:auto;height:8mm;padding:0 3mm;margin-left:auto;font-size:9pt}
.ws-page .dl-cont .ws-tabbox.dl-tabline span{font-weight:700}
.ws-page .dl-body{gap:0}
.ws-page.dl-teacher .ws-band.dl-band{flex:none;display:flex;flex-direction:column}
.ws-page.dl-teacher .ws-band.dl-band.grow{flex:1 1 auto}
.ws-page.dl-teacher .ws-band.dl-band>.ws-strip{flex:none}
.ws-page.dl-teacher .ws-band.dl-band>.ws-strip>b{font-size:15pt}
.ws-page .dl-bandin{padding:1.5mm 3mm 2mm;display:flex;flex-direction:column;gap:2mm;font-size:11pt;flex:1 1 auto}
.ws-page .dl-tline{font-size:11pt;line-height:1.3;padding:1mm 0 2mm}
.ws-page .dl-list{margin:0;padding-left:6mm;display:flex;flex-direction:column;gap:.6mm}
.ws-page .dl-sub{font-size:13pt;font-weight:700;margin-top:1mm}
.ws-page .dl-box{display:grid;grid-template-columns:5.8mm 1fr;gap:2.5mm;align-items:start;border:0.75pt solid ${INK.ink};border-radius:3mm;padding:1.1mm 3mm;font-size:11pt;line-height:1.22}
.ws-page .dl-box.dl-box-watch{border-width:1.5pt}
.ws-page .dl-boxtext b{font-weight:700}
.ws-page .dl-spoken{font-size:13pt}
.ws-page .dl-ka{color:${KEY_INK};font-weight:700}
.ws-page .dl-script{display:flex;flex-direction:column}
.ws-page .dl-srow{display:grid;grid-template-columns:8mm 1fr;gap:1.5mm;padding:.55mm 0;border-bottom:0.75pt solid #000}
.ws-page .dl-srow:last-child{border-bottom:0}
.ws-page .dl-srow>.mq-lnum{margin-top:.3mm}
.ws-page .dl-slines{display:grid;grid-template-columns:14mm 1fr;row-gap:.2mm;align-items:baseline;font-size:11pt;line-height:1.22}
.ws-page .dl-slines>b{font-weight:700}
.ws-page .dl-loop{display:flex;flex-direction:column;gap:.4mm;padding:.3mm 0}
.ws-page .dl-looprow{display:grid;grid-template-columns:5mm 36mm 1fr;gap:2mm;align-items:center;font-size:11pt}
.ws-page .dl-loopdot{display:block}
.ws-page table.dl-table{width:100%;border-collapse:collapse;font-size:10pt;line-height:1.25}
.ws-page table.dl-table th{font-weight:700;text-align:left;border-bottom:1.5pt solid #000;padding:.6mm 1.2mm;vertical-align:bottom}
.ws-page table.dl-table td{border-bottom:0.75pt solid #000;padding:.5mm 1.2mm;vertical-align:top}
.ws-page table.dl-table td.num{text-align:right}
.ws-page table.dl-table tr.dl-crit td{font-weight:700}
.ws-page .dl-checks{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:1.6mm 6mm;font-size:11pt}
.ws-page .dl-checks li{display:flex;gap:2mm;align-items:center}
.ws-page .dl-cbox{flex:none;width:5mm;height:5mm;border:1.5pt solid #000}
.ws-page .dl-vcards{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
/* a growing last band's vocabulary cards take its height (V22 §8.12.2: fill with content, not blank) */
.ws-page .ws-band.grow .dl-bandin>.dl-vcards{flex:1 1 auto}
.ws-page .ws-band.grow .dl-vcard{justify-content:space-evenly}
.ws-page .ws-band.grow .dl-vdiag{transform:scale(1.25)}
.ws-page .dl-vcard{border:1.5pt solid #000;border-radius:3mm;padding:2.5mm;display:flex;flex-direction:column;align-items:center;gap:1.2mm;text-align:center}
.ws-page .dl-vcard>b{font-size:13pt;font-weight:700}
.ws-page .dl-vcard>span{font-size:11pt}
.ws-page .dl-vdiag{min-height:14mm;display:flex;align-items:center;justify-content:center;font-size:15pt;font-weight:700}
.ws-page .dl-vdiag .dl-pv{display:inline-grid;grid-template-columns:repeat(3,8mm);border:1.5pt solid #000}
.ws-page .dl-vdiag .dl-pv>span{border-left:0.75pt solid #000;text-align:center;font-size:11pt;line-height:6mm}
.ws-page .dl-vdiag .dl-pv>span:nth-child(-n+3){border-bottom:0.75pt solid #000;font-weight:700}
.ws-page .dl-vdiag .dl-pv>span:nth-child(3n+1){border-left:0}
.ws-page .dl-vdiag .dl-digit{display:inline-flex;width:10mm;height:10mm;border:1.5pt solid #000;align-items:center;justify-content:center;font-size:18pt}
.ws-page .dl-board{display:flex;gap:2mm;align-items:center;font-size:11pt}
.ws-page .dl-stepmark{display:inline-flex;gap:1mm;align-items:center;vertical-align:middle}
.ws-page .dl-beside{display:grid;grid-template-columns:1fr ${THUMB_MM.w}mm;gap:4mm;align-items:start}
.ws-page .dl-besidel{min-width:0;display:flex;flex-direction:column;gap:2mm}
.ws-page .dl-thumb{margin:0;width:${THUMB_MM.w}mm;height:${THUMB_MM.h}mm;border:0.75pt solid #000;overflow:hidden;position:relative;flex:none}
/* zoom, not transform: a transformed 210 mm box still counts as layout overflow and Chrome would shrink every printed page */
.ws-page .dl-thumbin{width:210mm;height:297mm;zoom:${THUMB_SCALE}}
.ws-page .dl-thumbin>.ws-page{margin:0!important;outline:0!important}
.ws-page .dl-2col{display:grid;grid-template-columns:1fr 1fr;gap:4mm;align-items:start}
.ws-page .dl-2col>div{display:flex;flex-direction:column;gap:2.5mm;min-width:0}
/* the 2-up exit slip (V22 §9.7, PG-5): A4 landscape, margins 12 / 13 / 12 mm, live 271 x 186 mm */
.ws-page.dl-land{--ws-paper-w:297mm;--ws-paper-h:210mm;--ws-margin-top:12mm;--ws-margin-side:13mm;--ws-margin-bottom:12mm;page:dlland}
.ws-page.dl-land>.ws-head{display:none}
/* print: a landscape page takes its own page's width (a fixed 297 mm would overflow the portrait flow and Chrome would shrink every page) */
@media print{.ws-page.dl-land{width:auto}}
.ws-page.dl-land .mq-row.dl-halves{flex:1 1 auto;height:auto!important;display:grid;align-items:stretch}
.ws-page.dl-land .mq-row.dl-halves>.mq-rowcol{display:flex;flex-direction:column;min-width:0;min-height:0}
.ws-page .dl-half{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
.ws-page .dl-halfhead .ws-rowA{height:14mm;gap:4mm}
.ws-page .dl-halfhead .ws-title{white-space:normal;height:auto;min-height:8mm;line-height:1.15;text-align:center}
.ws-page .dl-halfhead .ws-headrule{margin-bottom:1.5mm}
.ws-page .dl-cut{position:relative;height:100%;display:flex;justify-content:center}
.ws-page .dl-cut>i{display:block;width:0;height:100%;border-left:0.75pt dashed #000}
.ws-page .dl-cut>.mq-ticon{position:absolute;top:17mm;left:50%;transform:translateX(-50%) rotate(90deg);background:#fff}
.ws-page .dl-selfrow{flex:none;display:flex;gap:10mm;align-items:center;padding:2mm 3mm 0;font-size:15pt}
.ws-page .dl-selfrow>span{display:flex;gap:2.5mm;align-items:center}
.ws-page .dl-selfrow .dl-cbox{width:7mm;height:7mm}
/* the word-problem page (V22 §9.6) */
.ws-page .dl-wptop{flex:none;display:grid;grid-template-columns:58fr 42fr;border:1.5pt solid #000;border-top-width:2.25pt}
.ws-page .dl-wptop>div{min-width:0;display:flex;flex-direction:column;justify-content:center;padding:3mm}
.ws-page .dl-wptop>div+div{border-left:1.5pt solid #000}
.ws-page .dl-wptop .ws-story{flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-evenly;font-size:15pt;line-height:1.45}
.ws-page .dl-wpwork{flex:1 1 auto;display:flex;flex-direction:column;margin-top:-1.5pt}
.ws-page .dl-wpwork>.ws-band{flex:1 1 auto}
.ws-page .dl-eqrow{flex:none;display:flex;justify-content:center;align-items:center;gap:3mm;padding:4mm 0;border:1.5pt solid #000;border-top-width:2.25pt;margin-top:-1.5pt;font-size:28pt;font-weight:400}
`;

export default {
    TEACHER_BODY_MM, THUMB_SCALE, THUMB_MM, KEY_INK, teacherPage, tBand, tLine, tBox, BOX_KINDS, tScript, tLoop, tTable,
    cellText, keyNamed, checkList, vocabCard, vocabCards, boardLine, keyIcon, stepMark, keyMark, thumb, besideThumb, twoCols,
    subHead, TEACHER_CSS,
};
