// js/modules/sheet/lesson-css.js
// The stylesheet of the lesson pages (roles/lesson.js): the anchor chart's step panels, the
// vocabulary match, the Warm-up halves, the Guided band's Steps zone and the practice pages' step
// strip. It travels in the engine stylesheet (practice.js SHEET_ENGINE_CSS), so a page and the
// host's off-screen measurement draw a lesson block with the same rules. Every selector is a
// lesson class (`mq-l*`, `mq-c*`): no other page is touched.
//
// INK-30 (owner ruling 2026-09-25, lesson pages only): the accent `--mq-lesson-accent` (the
// LESSON_ACCENT token) colours the step numerals, their circles and the step icons - nothing
// else. Pure module (SCC-01).

import { LESSON_ACCENT } from './tokens.js';
import { ICON_CSS } from './lesson-icons.js';

export const LESSON_CSS = `
:is(.ws-page,.ws-sheet){--mq-lesson-accent:${LESSON_ACCENT}}
:is(.ws-page,.ws-sheet) svg :is(text,tspan)[data-ws-ink="trace"]{fill:#949494!important}
${ICON_CSS}
:is(.ws-page,.ws-sheet) .mq-lnum{flex:none;font-style:normal;box-sizing:border-box;width:6.4mm;height:6.4mm;border:1pt solid var(--mq-lesson-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:max(11pt,var(--ws-zone));font-weight:700;color:var(--mq-lesson-accent);line-height:1}
:is(.ws-page,.ws-sheet) .mq-lstrip{flex:none;display:flex;align-items:flex-start;gap:3mm;padding:1.6mm 0 2mm;border-bottom:var(--ws-hair) solid var(--ws-ink);margin-bottom:1mm;font-size:max(11pt,var(--ws-zone));line-height:1.2}
:is(.ws-page,.ws-sheet) .mq-lstrip-l{flex:none;font-weight:700;font-size:var(--ws-text);padding-top:.6mm}
:is(.ws-page,.ws-sheet) .mq-lstrip ol{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:1.5mm 5mm;flex:1;min-width:0}
:is(.ws-page,.ws-sheet) .mq-lstrip li{display:flex;align-items:center;gap:1.4mm}
:is(.ws-page,.ws-sheet) .ws-cell.mq-lstripcell{padding:0;justify-content:flex-start;align-items:stretch}
:is(.ws-page,.ws-sheet) .mq-lsteps{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2.2mm;font-size:max(11pt,calc(var(--ws-text) - 2pt));line-height:1.2;text-align:left}
:is(.ws-page,.ws-sheet) .mq-lsteps li{display:flex;gap:1.8mm;align-items:center}
:is(.ws-page,.ws-sheet) .mq-lsteps li>span{min-width:0}
:is(.ws-page,.ws-sheet) .mq-lstepszone{padding:2.5mm 3mm 0 3mm}
:is(.ws-page,.ws-sheet) .ws-cell.mq-lstepscell{padding:0;justify-content:flex-start;align-items:stretch}
:is(.ws-page,.ws-sheet) .mq-lstepsbox{display:flex;flex-direction:column}
:is(.ws-page,.ws-sheet) .mq-lstepsbox>.mq-lstepszone{flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-evenly;padding-bottom:2.5mm}
:is(.ws-page,.ws-sheet) .mq-lstepsbox .mq-lsteps{flex:1 1 auto;justify-content:space-evenly}
:is(.ws-page,.ws-sheet) .mq-lwedotop>.mq-lstrip{padding-left:3mm;padding-right:3mm;margin-bottom:0}
:is(.ws-page,.ws-sheet) .mq-lstripchant{flex:none;display:flex;align-items:center;gap:3mm;padding:0 3mm;font-size:max(11pt,calc(var(--ws-text) - 2pt));line-height:1.2;border-bottom:var(--ws-hair) solid var(--ws-ink)}
:is(.ws-page,.ws-sheet) .mq-lstripchant>span{font-weight:700}
:is(.ws-page,.ws-sheet) .mq-lchant{margin:3mm 0 0;font-size:max(11pt,calc(var(--ws-text) - 2pt));font-weight:700;line-height:1.2}
:is(.ws-page,.ws-sheet) .ws-cell.mq-cstatecell{justify-content:center;align-items:stretch;padding:3mm 4mm}
:is(.ws-page,.ws-sheet) .mq-cstate{width:100%;min-height:0;display:flex}
:is(.ws-page,.ws-sheet) .mq-cstate-col{flex:none;flex-direction:column;align-items:stretch;gap:3mm}
:is(.ws-page,.ws-sheet) .mq-cstate-row{flex:1 1 auto;flex-direction:row;align-items:stretch;gap:8mm}
:is(.ws-page,.ws-sheet) .mq-cstate-row>.mq-cdraw{flex:0 0 42%;display:flex;justify-content:center;align-items:center}
:is(.ws-page,.ws-sheet) .mq-cside{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-around;gap:3mm}
:is(.ws-page,.ws-sheet) .mq-cheads{display:flex;flex-direction:column;gap:1.5mm}
:is(.ws-page,.ws-sheet) .mq-chead{display:flex;align-items:center;gap:2.5mm;font-size:var(--ws-title);line-height:1.2}
:is(.ws-page,.ws-sheet) .mq-chead>.mq-lnum{width:10mm;height:10mm;border-width:1.5pt;font-size:var(--ws-title)}
:is(.ws-page,.ws-sheet) .mq-chead>b{font-weight:700}
:is(.ws-page,.ws-sheet) .mq-cdraw{display:flex;justify-content:center;align-items:flex-start}
:is(.ws-page,.ws-sheet) .mq-cstate-col>.mq-cdraw{flex:none;align-items:center}
:is(.ws-page,.ws-sheet) .ws-cell.mq-ctailcell{justify-content:center;align-items:stretch;padding:2mm 4mm}
:is(.ws-page,.ws-sheet) .mq-ctail{display:flex;flex-direction:column;gap:1.5mm}
:is(.ws-page,.ws-sheet) .mq-ctailw{margin-left:6mm;font-size:var(--ws-text);font-weight:400}
:is(.ws-page,.ws-sheet) .ws-cell.mq-c2cell{justify-content:center;align-items:center;padding:2mm 2mm}
:is(.ws-page,.ws-sheet) .mq-c2{display:flex;flex-direction:column;align-items:center;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-c2nums{display:flex;gap:1.5mm}
:is(.ws-page,.ws-sheet) .mq-cwords{font-size:var(--ws-text);line-height:1.3;display:flex;flex-direction:column;gap:.8mm}
:is(.ws-page,.ws-sheet) .mq-cstate-col>.mq-cwords{text-align:center}
:is(.ws-page,.ws-sheet) .mq-cwords>.mq-cnote{font-weight:700}
:is(.ws-page,.ws-sheet) .mq-hopwrap{display:flex;flex-direction:column;align-items:center}
:is(.ws-page,.ws-sheet) .mq-chops>.mq-hops{margin:0!important}
:is(.ws-page,.ws-sheet) :is(.mq-cfinal-h,.mq-cnote,.mq-cstate-n .mq-chead>b){text-wrap:balance}
:is(.ws-page,.ws-sheet) .mq-cstate-n{gap:2mm}
:is(.ws-page,.ws-sheet) .mq-cstate-n .mq-chead{font-size:var(--ws-text);gap:1mm 1.8mm;flex-wrap:wrap;justify-content:center}
:is(.ws-page,.ws-sheet) .mq-cstate-n .mq-chead>b{flex:1 1 100%;text-align:center}
:is(.ws-page,.ws-sheet) .mq-cstate-n .mq-chead>.mq-lnum{width:8.5mm;height:8.5mm;font-size:var(--ws-text)}
:is(.ws-page,.ws-sheet) .ws-cell.mq-cfinalcell{justify-content:center;align-items:stretch;padding:1.5mm 3mm}
:is(.ws-page,.ws-sheet) .mq-cfinal{width:100%;display:flex;flex-direction:column;align-items:center;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-cfinal-h{font-size:var(--ws-text);line-height:1.25;text-align:center}
:is(.ws-page,.ws-sheet) .mq-cfinal-h>b{font-weight:700;display:block}
:is(.ws-page,.ws-sheet) .mq-cfinal>.mq-cdraw{align-items:center}
:is(.ws-page,.ws-sheet) .ws-cell.mq-cdrawcell{padding:0;justify-content:flex-start;align-items:flex-start}
:is(.ws-page,.ws-sheet) .ws-band.mq-cchantband{flex:none;display:flex;align-items:center}
:is(.ws-page,.ws-sheet) .mq-cchant{display:flex;align-items:center;gap:5mm;padding:0 3mm;width:100%}
:is(.ws-page,.ws-sheet) .mq-cchant>b{font-size:var(--ws-text);font-weight:700}
:is(.ws-page,.ws-sheet) .mq-cchant>span{flex:1;border:1.5pt solid var(--ws-ink);border-radius:3mm;padding:1.2mm 5mm;font-size:var(--ws-title);font-weight:700;line-height:1.25;text-align:center}
:is(.ws-page,.ws-sheet) .mq-lround{display:flex;flex-direction:column;align-items:center;gap:2mm}
:is(.ws-page,.ws-sheet) .mq-lround-top{display:flex;align-items:flex-end;gap:1mm;white-space:nowrap}
:is(.ws-page,.ws-sheet) .mq-lring{outline:var(--ws-hair) solid var(--ws-ink);outline-offset:.06em;border-radius:50%}
:is(.ws-page,.ws-sheet) .mq-lring.mq-lring-t{outline:1pt solid #949494}
:is(.ws-page,.ws-sheet) .mq-luline{border-bottom:1pt solid #949494;display:inline-block;line-height:1}
:is(.ws-page,.ws-sheet) .ws-cell.mq-lvocabcell{justify-content:center;align-items:stretch;padding:2.5mm 3mm}
:is(.ws-page,.ws-sheet) .mq-lvocab{width:100%;display:flex;flex-direction:column}
:is(.ws-page,.ws-sheet) .mq-lvrow{display:grid;grid-template-columns:repeat(var(--n),1fr)}
:is(.ws-page,.ws-sheet) .mq-lvpic{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:1.5mm}
:is(.ws-page,.ws-sheet) .mq-lvpic-in{min-height:12mm;display:flex;align-items:center;justify-content:center;font-weight:700;line-height:1}
:is(.ws-page,.ws-sheet) .mq-lvword{display:flex;flex-direction:column;align-items:center;gap:1.5mm;font-size:var(--ws-text)}
:is(.ws-page,.ws-sheet) .mq-lvword b{font-weight:700}
:is(.ws-page,.ws-sheet) .mq-ldot{display:block;width:2mm;height:2mm;border-radius:50%;background:#000}
:is(.ws-page,.ws-sheet) .mq-lvgap{position:relative;height:calc(var(--ws-hw) * 1.05)}
:is(.ws-page,.ws-sheet) .mq-lvgap>svg{position:absolute;left:0;top:-1mm;width:100%;height:calc(100% + 2mm);overflow:visible}
:is(.ws-page,.ws-sheet) .mq-lwarmrow .mq-rowcol+.mq-rowcol{border-left:var(--ws-hair) solid var(--ws-ink)}
:is(.ws-page,.ws-sheet) .mq-lwarmcol{display:flex;flex-direction:column;min-width:0}
:is(.ws-page,.ws-sheet) .ws-cell.mq-lvcenter{justify-content:center}
:is(.ws-page,.ws-sheet) .mq-lwarmcol>.ws-instrline{padding-left:3mm;padding-right:2mm}
:is(.ws-page,.ws-sheet) .mq-lwarmcol.mq-lwarm2>.ws-instrline{height:calc(var(--ws-instr) * 1.75);line-height:1.2;align-items:center}
:is(.ws-page,.ws-sheet) .mq-lwarmrow .mq-rowcol+.mq-rowcol .ws-grid{border-left-width:0}
`;

export default { LESSON_CSS };
