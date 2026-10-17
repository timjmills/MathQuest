// js/modules/sheet/teacher-icons.js
// THE TEACHER-PAGE ICONS of the detailed lesson maker (V22 Appendix B, Part 10.5 / 10.7) and the
// word-problem routine icons (V22 §9.6: read, ringnum, underline, draw, write, check). Beside
// lesson-icons.js, drawn with the same rules: 10 x 10 viewBox line art, 1.5 pt strokes, no text
// inside an icon, never emoji (INK-7).
//
// Colour (V22 §10.7 / §10.8): the teacher box icons are BLACK (`teacherIcon`); a word-problem
// routine icon is a step mark and takes the lesson accent like the pupil Steps (`routineIcon`,
// `data-mq-accent`, INK-30).
//
// Pure module (SCC-01).

import { stepIcon } from './lesson-icons.js';

/** 10 x 10 drawings. `f` = a small solid mark. */
const DRAW = {
    // a lightbulb: Tip
    tip: '<path d="M3.3 6.4 Q1.4 4.8 2 2.9 Q2.7 0.8 5 0.8 Q7.3 0.8 8 2.9 Q8.6 4.8 6.7 6.4 V7.6 H3.3 Z"/><path d="M3.6 8.6 H6.4 M4.2 9.6 H5.8"/>',
    // a speech bubble with a check mark: Feedback
    feedback: '<path d="M1.5 1.2 H8.5 Q9.3 1.2 9.3 2 V6 Q9.3 6.8 8.5 6.8 H4.4 L2.2 9 L2.6 6.8 H1.5 Q0.7 6.8 0.7 6 V2 Q0.7 1.2 1.5 1.2 Z"/><path d="M3 4 L4.5 5.4 L7 2.6"/>',
    // an eye with an alert mark: Watch
    watch: '<path d="M0.8 6 Q5 2 9.2 6 Q5 10 0.8 6 Z"/><circle cx="5" cy="6" r="1.4"/><path d="M5 0.6 V2.6"/><path d="M2.2 1.4 L3 3 M7.8 1.4 L7 3"/>',
    // an open book: Research
    research: '<path d="M5 2.2 Q3 1 0.8 1.4 V8.4 Q3 8 5 9.2 Q7 8 9.2 8.4 V1.4 Q7 1 5 2.2 Z"/><path d="M5 2.2 V9.2"/>',
    // a key: the Critical Atom
    key: '<circle cx="3" cy="5" r="2.2"/><path d="M5.2 5 H9.4 M8 5 V6.8 M9.4 5 V6.4"/>',
    // a speech bubble with Aa drawn as strokes: language barrier / ELL tip
    language: '<path d="M1.5 1.2 H8.5 Q9.3 1.2 9.3 2 V6 Q9.3 6.8 8.5 6.8 H4.4 L2.2 9 L2.6 6.8 H1.5 Q0.7 6.8 0.7 6 V2 Q0.7 1.2 1.5 1.2 Z"/><path d="M2.4 5.6 L3.6 2.4 L4.8 5.6 M2.9 4.4 H4.3"/><path d="M7.4 3.6 Q5.8 3.4 5.8 4.6 Q5.8 5.8 7.4 5.4 V3.4"/>',
    // a question mark in a circle drawn as a path: why it works
    why: '<circle cx="5" cy="5" r="4.2"/><path d="M3.5 3.8 Q3.6 2.4 5 2.4 Q6.5 2.4 6.5 3.7 Q6.5 4.6 5 5.2 V6.2"/><circle cx="5" cy="7.6" r="0.6" class="f"/>',
    // three cubes: manipulatives
    cubes: '<rect x="0.8" y="5.2" width="4" height="4"/><rect x="5.2" y="5.2" width="4" height="4"/><rect x="3" y="0.9" width="4" height="4"/>',
    // a board on an easel: board
    board: '<rect x="0.8" y="0.9" width="8.4" height="5.8"/><path d="M3 6.7 L1.8 9.4 M7 6.7 L8.2 9.4 M5 6.7 V8.6"/>',
    // a small whiteboard with a pen: mini whiteboards
    mwb: '<rect x="0.8" y="1.6" width="7" height="6.4" rx="0.6"/><path d="M2.2 4 H6.2 M2.2 5.8 H5"/><path d="M8.4 2.2 L9.6 3.4 L8.4 8.6 L7.9 8.1 Z"/>',
    // scissors: the cut line
    scissors: '<circle cx="2.2" cy="2.6" r="1.6"/><circle cx="2.2" cy="7.4" r="1.6"/><path d="M3.6 3.4 L9.4 7.6 M3.6 6.6 L9.4 2.4"/>',
    // routine icons (accent; Appendix H: one idea each, open line art, no letters, no fills)
    read: '<path d="M5 2.4 Q3.2 1.2 1 1.6 V8.4 Q3.2 8 5 9 Q6.8 8 9 8.4 V1.6 Q6.8 1.2 5 2.4 Z"/><path d="M5 2.4 V9"/>',
    ringnum: '<ellipse cx="5" cy="5" rx="4.2" ry="3.2"/><path d="M4.4 3.4 L5.4 2.8 V7.2"/>',
    underline: '<path d="M1.5 3.5 H8.5"/><path d="M1.5 5.5 H6.5"/><path d="M1 8.6 H9" stroke-width="2pt"/>',
    draw: '<rect x="1" y="1" width="5.2" height="5.2" rx="0.4"/><path d="M5.8 9.2 L9.2 5.8 L8.2 4.8 L4.8 8.2 Z"/>',
};

export const TEACHER_ICON_IDS = Object.freeze(Object.keys(DRAW));
/** V22 §10.5: the T-BOX icon column is 5.8 mm; the T-LOOP icon 5 mm. */
export const TEACHER_ICON_MM = 5.8;

const svg = (id, mm, accent) => {
    const body = DRAW[id] || DRAW.tip;
    return `<svg class="mq-ticon"${accent ? ' data-mq-accent' : ''} data-mq-icon="${id}" viewBox="0 0 10 10" width="${mm}mm" height="${mm}mm" aria-hidden="true">`
        + `<g fill="none" stroke="currentColor" stroke-width="1.5pt" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
};

/** A black teacher icon (T-BOX, T-ICON). */
export const teacherIcon = (id, mm = TEACHER_ICON_MM) => svg(id, mm, false);

/**
 * A routine icon of the word-problem panel, in the accent (a step mark). `write` and `check`
 * are the pupil step icons of lesson-icons.js, so the same action has the same picture.
 */
export function routineIcon(id, mm = 5.8) {
    if (id === 'write' || id === 'check') return stepIcon(id, 'L', { mm });
    return svg(id, mm, true);
}

/** The stylesheet the icons need (a solid mark is `.f`; black on teacher pages). */
export const TEACHER_ICON_CSS = `
:is(.ws-page,.ws-sheet) .mq-ticon{flex:none;display:block;color:#000}
:is(.ws-page,.ws-sheet) .mq-ticon[data-mq-accent]{color:var(--mq-lesson-accent)}
:is(.ws-page,.ws-sheet) .mq-ticon .f{fill:currentColor;stroke:none}
`;

export default { TEACHER_ICON_IDS, teacherIcon, routineIcon, TEACHER_ICON_CSS };
