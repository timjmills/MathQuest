// js/modules/sheet/cells/rcdws.js
// The `rcdws` template: the word-problem ROUTINE PANEL of the detailed lesson maker (V22 §9.6,
// owner default Q5): six check boxes, one action each, one line each - Read it two times, Circle
// the numbers, Underline the question, Draw it, Write the equation, Solve. Check. Each row: a 7 mm
// check box, the accent line-art icon (teacher-icons.js routineIcon: the icons are step marks),
// the action at 13 pt (the Steps-box size), row height <= 9 mm (self-check E16b).
//
// The boxes are the pupil's own tick list, so they are UNGRADED slots (`data-ws-graded="0"`): the
// key draws them empty, exactly as the pupil page (AK-1), and the page's Score never counts them.
//
// payload: {rows?: [{icon, text}]}  (default: the six V22 rows)
//
// Pure module (SCC-01).

import { register } from '../registry.js';
import { esc } from '../cell.js';
import { routineIcon } from '../teacher-icons.js';

/** V22 §9.6 / Appendix C: the six routine rows, one action each. */
export const RCDWS_ROWS = Object.freeze([
    { icon: 'read', text: 'Read it two times.' },
    { icon: 'ringnum', text: 'Circle the numbers.' },
    { icon: 'underline', text: 'Underline the question.' },
    { icon: 'draw', text: 'Draw it.' },
    { icon: 'write', text: 'Write the equation.' },
    { icon: 'check', text: 'Solve. Check.' },
]);

const rowsOf = (p) => (Array.isArray(p && p.rows) && p.rows.length ? p.rows : RCDWS_ROWS);

register('rcdws', {
    render(p) {
        const rows = rowsOf(p).map((r, i) => `<div class="dl-rrow" data-panel-row>`
            + `<span class="ws-check" style="width:7mm;height:7mm" data-ws-slot="r${i}" data-ws-shape="check" data-ws-graded="0"></span>`
            + `${routineIcon(r.icon, 5.8)}<span>${esc(r.text)}</span></div>`).join('');
        return `<div class="dl-rcdws" data-read>${rows}</div>`;
    },
    // The tick list is the pupil's own (ungraded): the key leaves it empty.
    answerKey() { return { value: '', display: '', slots: {} }; },
    footprint() { return { wMm: 78, hMm: 60, measure: false, factLike: false, maxCols: 1 }; },
    inputs(p) { return rowsOf(p).map((r, i) => ({ id: `r${i}`, kind: 'check', shape: 'check', graded: false, order: i, scopes: ['full'] })); },
    layout() { return { card: 'card-medium-visual', checker: 'none' }; },
});

/** The template's stylesheet (additive; `dl-*` classes exist only on detailed-lesson pages). */
export const RCDWS_CSS = `
.ws-page .dl-rcdws{display:flex;flex-direction:column;justify-content:space-evenly;height:100%;gap:1mm}
.ws-page .dl-rrow{display:flex;align-items:center;gap:2.5mm;height:9mm;max-height:9mm;font-size:13pt;line-height:1.1;white-space:nowrap}
.ws-page .dl-rrow>.ws-check{flex:none;border:1.5pt solid #000;display:inline-block}
`;

export default { RCDWS_ROWS, RCDWS_CSS };
