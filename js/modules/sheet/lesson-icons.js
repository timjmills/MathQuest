// js/modules/sheet/lesson-icons.js
// THE STEP ICONS of a lesson (design/LESSONS_VISION.md: "the same icon per step"): one small
// in-house line-art picture per ACTION, so a pupil who cannot yet read "Subtract the ones" still
// knows which kind of step it is - an eye to look, a pencil to write, a check mark to check.
// Every lesson uses the same icon for the same action.
//
// Drawing rules (WORKSHEET_DESIGN_STANDARD): line art in the lesson accent (INK-30), never emoji (INK-7),
// lines (INK-10: 1.5 pt since lessons r1 - a 1 pt hairline printed mid-grey; `vector-effect: non-scaling-stroke` keeps the stroke 1 pt at any icon
// size), solid fills only on marks under 7 mm (INK-5), no text inside an icon.
//
// Pure module (SCC-01).

/** 10 x 10 viewBox drawings. `f` = a small solid mark, everything else is a 0.75 pt line. */
const DRAW = {
    // an eye: look at / find
    look: '<path d="M0.8 5 Q5 0.6 9.2 5 Q5 9.4 0.8 5 Z"/><circle cx="5" cy="5" r="1.9"/><circle cx="5" cy="5" r="0.9" class="f"/>',
    // a flag at a start line: start with / begin at
    start: '<path d="M2.2 9.6 V0.8"/><path d="M2.2 1.2 L8.8 3.3 L2.2 5.4 Z"/><path d="M0.8 9.6 H4.6"/>',
    // dots counted along an arc: count on
    count: '<circle cx="1.8" cy="7.6" r="0.9" class="f"/><circle cx="5" cy="7.6" r="0.9" class="f"/><circle cx="8.2" cy="7.6" r="0.9" class="f"/>'
        + '<path d="M1.8 5.2 Q3.4 1.6 5 5.2 Q6.6 1.6 8.2 5.2"/><path d="M7 4.3 L8.2 5.3 L8.6 3.8"/>',
    // a pencil: write
    write: '<path d="M2.4 9.4 L1 9.9 L1.5 8.5 Z" class="f"/><path d="M1.5 8.5 L7.4 2.6 L8.8 4 L2.9 9.9 Z"/><path d="M7.4 2.6 L8.4 1.6 Q9 1 9.6 1.6 Q10 2.2 9.8 2.6 L8.8 4"/>',
    // a ten rod traded for ones: regroup
    regroup: '<rect x="0.8" y="0.8" width="2" height="8.4"/><path d="M0.8 2.5 H2.8 M0.8 4.2 H2.8 M0.8 5.9 H2.8 M0.8 7.6 H2.8"/>'
        + '<path d="M3.8 5 H6"/><path d="M5.2 4.1 L6.2 5 L5.2 5.9"/>'
        + '<rect x="6.8" y="2.6" width="1.3" height="1.3"/><rect x="8.4" y="2.6" width="1.3" height="1.3"/>'
        + '<rect x="6.8" y="4.3" width="1.3" height="1.3"/><rect x="8.4" y="4.3" width="1.3" height="1.3"/>'
        + '<rect x="6.8" y="6" width="1.3" height="1.3"/><rect x="8.4" y="6" width="1.3" height="1.3"/>',
    // a minus sign in a ring: subtract / take away
    subtract: '<circle cx="5" cy="5" r="4.2"/><path d="M2.6 5 H7.4"/>',
    // lessons r1: one icon per STEP - the ring's minus beside a ones cube: subtract the ones
    subOnes: '<circle cx="3.4" cy="5" r="2.9"/><path d="M1.9 5 H4.9"/><rect x="7" y="3.6" width="2.6" height="2.6"/>',
    // ... and beside a ten rod: subtract the tens
    subTens: '<circle cx="3.4" cy="5" r="2.9"/><path d="M1.9 5 H4.9"/><rect x="7.4" y="0.6" width="2" height="8.8"/><path d="M7.4 2.4 H9.4 M7.4 4.1 H9.4 M7.4 5.8 H9.4 M7.4 7.5 H9.4"/>',
    // a short number line with its two end ticks marked: find the two tens
    ends: '<path d="M0.8 6.4 H9.2"/><path d="M0.8 3.6 V9.2 M9.2 3.6 V9.2"/><path d="M3.1 5.4 V7.4 M5 5.4 V7.4 M6.9 5.4 V7.4"/>'
        + '<circle cx="0.8" cy="1.5" r="1" class="f"/><circle cx="9.2" cy="1.5" r="1" class="f"/>',
    // an up arrow and a down arrow: decide, round up or down
    decide: '<path d="M3 9.2 V1.2"/><path d="M1.4 2.9 L3 1 L4.6 2.9"/><path d="M7 0.8 V8.8"/><path d="M5.4 7.1 L7 9 L8.6 7.1"/>',
    // a check mark in a box: check the work
    check: '<rect x="0.9" y="0.9" width="8.2" height="8.2" rx="1"/><path d="M2.6 5.2 L4.4 7 L7.6 2.9"/>',
    // a speech bubble: say it
    say: '<path d="M1.5 1.4 H8.5 Q9.3 1.4 9.3 2.2 V6 Q9.3 6.8 8.5 6.8 H4.4 L2.2 9 L2.6 6.8 H1.5 Q0.7 6.8 0.7 6 V2.2 Q0.7 1.4 1.5 1.4 Z"/>',
};

export const ICON_IDS = Object.freeze(Object.keys(DRAW));

/** The icon side at each preset (mm): about the cap height of the step text plus a margin. */
export const ICON_MM = Object.freeze({ S: 4.4, M: 5, L: 5.8 });

/**
 * The action of a step from its first words, for a step the lesson data does not name:
 * the print verb decides (PEDAGOGY_STANDARD 10.2).
 */
export function iconForText(text) {
    const t = String(text || '').trim().toLowerCase();
    if (/^(look|find|ones:|tens:|is |which)/.test(t)) return 'look';
    if (/^(start|begin)/.test(t)) return 'start';
    if (/^count/.test(t)) return 'count';
    if (/^(write|leave)/.test(t)) return 'write';
    if (/^regroup|trade/.test(t)) return 'regroup';
    if (/^(subtract|take)/.test(t) || /^\d+\s*[−-]\s*\d+/.test(t)) return 'subtract';
    if (/^(round|decide|5 or more|it is exactly)/.test(t) || /round (up|down)/.test(t)) return 'decide';
    if (/^check/.test(t)) return 'check';
    if (/^say/.test(t)) return 'say';
    return 'look';
}

/** One icon as inline SVG, `size` = the preset (S / M / L). */
export function stepIcon(id, size = 'L', { mm: sideMm } = {}) {
    const body = DRAW[id] || DRAW.look;
    const mm = sideMm || ICON_MM[size] || ICON_MM.L;
    // The icon is drawn in the lesson accent (INK-30, `--mq-lesson-accent`): its SHAPE is the cue,
    // the colour only a second one, so a black-and-white copy loses nothing (INK-6).
    return `<svg class="mq-licon" data-mq-accent data-mq-icon="${id}" viewBox="0 0 10 10" width="${mm}mm" height="${mm}mm" aria-hidden="true">`
        + `<g fill="none" stroke="currentColor" stroke-width="1.5pt" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
}

/** The stylesheet the icons need (a solid mark is `.f`). */
export const ICON_CSS = `
:is(.ws-page,.ws-sheet) .mq-licon{flex:none;display:block;overflow:visible;color:var(--mq-lesson-accent)}
:is(.ws-page,.ws-sheet) .mq-licon .f{fill:currentColor;stroke:none}
:is(.ws-page,.ws-sheet) .mq-licon *{vector-effect:non-scaling-stroke}
`;

export default { ICON_IDS, ICON_MM, iconForText, stepIcon, ICON_CSS };
