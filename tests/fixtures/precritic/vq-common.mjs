// Shared items of the ws-visual-quality backtest fixtures (design/audit/VISUAL_QUALITY.md §1, the two owner examples).
// A fixture module's default export is {skills: [{key, label, grade, ccss, iCan, items: [q, ...]}]}; the items are drawn
// by THIS tree's kit, exactly as generateQuestionFor's items are. Each vq-<rule>.fail.mjs / .pass.mjs pair runs as
//   node tests/scripts/ws-visual-quality.mjs --fixture <file> --rules VQ-<RULE>
const story = (a, b) => ({ lines: [`Ben has ${a} shells.`, `Lena has ${b} shells.`, 'How many shells do they have in all?'], steps: [{ a, b, op: '+', ans: a + b, top: a, bottom: b }], ans: a + b, unit: 'shells', schema: 'join', inRow: true, tracks: 2, hl: false, kb: false, bar: false, barKind: 'whole', pic: null });
export const WP = [[9, 3], [8, 5], [12, 6], [7, 7], [13, 2], [6, 9]];
/** add_wp_20_plain on the base: the default word-work cell (four signs, the column grid, the filler bank). */
export const wpBase = (a, b) => ({ text: '', ans: a + b, cell: { template: 'word-work', payload: { ...story(a, b), bank: ['shells', 'boxes', 'days'] } } });
/** The shape of the fix: no sign choices (the sign is WRITTEN), no column grid, the unit word printed (the frames cell). */
export const wpFixed = (a, b) => ({ text: '', ans: a + b, cell: { template: 'word-work', payload: { ...story(a, b), bank: [], layout: 'frames' } } });

const say = '<span style="display:inline-block;width:2.2em;border-bottom:0.75pt solid #000000;vertical-align:baseline;">&nbsp;</span>';
const tick = (l) => `<div style="display:flex;align-items:center;gap:10px;margin:4px 0;font-size:1rem;"><span style="min-width:5.5em;">${l}</span><span style="display:inline-block;width:1.1em;height:1.1em;border:1.5px solid #000000;border-radius:0.18em;"></span></div>`;
const ffsCell = (a, b, withSay) => `<div class="ws-v2-cell" style="text-align:center;color:#000000;font-family:'Andika','Open Sans',sans-serif;"><div style="display:inline-block;border:1.5px solid #000000;border-radius:10px;padding:5px 12px;">Two parts make the whole.</div><div style="font-size:2rem;font-weight:700;letter-spacing:0.15em;">${a}&nbsp;&nbsp;${b}&nbsp;&nbsp;${a + b}</div><div style="display:inline-block;text-align:left;margin-top:8px;">${tick('Yes')}${tick('No')}</div>`
    + (withSay ? `<div style="margin-top:10px;font-size:0.95rem;line-height:1.4;">Say: ${say} and ${say} make ${say} .</div>` : '') + '</div>';
/** fact_family_sort on the base: the legacy _wsCell (rule box, bare numbers, Yes / No tick list, a Say frame with blanks). */
export const ffsBase = (a, b) => ({ text: 'Is it a fact family?', ans: 'Yes', visual: ffsCell(a, b, true) });
/** The same legacy cell with the Say frame taken out: one response area (the ticks). */
export const ffsNoSay = (a, b) => ({ text: 'Is it a fact family?', ans: 'Yes', visual: ffsCell(a, b, false) });
/** The shape of the fix: a kit cell that DRAWS the family (fact-family is registered in every tree), no Say frame. */
export const ffsFixed = (a, b) => ({ text: 'Is it a fact family?', ans: 'Yes', cell: { template: 'fact-family', v: 1, payload: { a, b } } });
export const FF = [[12, 8], [3, 4], [9, 6], [5, 5], [7, 2], [10, 4]];
export const FFS = { key: 'fixture:fact_family_sort', label: 'Is It a Fact Family? (+/−)', grade: '1', ccss: ['1.OA.B.3'] };
export const WPS = { key: 'fixture:add_wp_20_plain', label: 'Addition Word Problems (within 20, No Pictures)', grade: '1', ccss: ['1.OA.A.1'], iCan: 'I Can solve addition stories (sums to 20)' };
export const GOOD_TITLE = 'I Can tell if three numbers make a fact family';
