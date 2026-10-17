// teacher-label.js — a skill's label on the teacher screens (fix round 6). Pure.
// (The Print worksheets screen keeps the app label; ws-teacher-wrm reads the slash form back when it compares.)

/**
 * A skill's label as the teacher screens show it: the app's label, with the few shorthands in it written out
 * ("OoO" → "Order of operations", "(Visual, MC)" → "(Visual)", "Q1" → "first quadrant", "AND" → "and", "B&W" → "black and white", "A/B/C" → "A, B, C"), so every
 * line on these screens passes the plain-English check (plain-words.js). The pupil screens keep the label as is.
 */
export function teacherLabel(label) {
    return String(label || '').replace(/\bOoO\b/g, 'Order of operations').replace(/,\s*MC\)/g, ')').replace(/\s*\(MC\)/g, '')
        .replace(/,\s*Q1\)/g, ', first quadrant)').replace(/\bQ1\b/g, 'first quadrant').replace(/\bAND\b/g, 'and')
        .replace(/\(B&W\)/g, '(black and white)').replace(/\bB&W\b/g, 'black-and-white')
        // round 7: three or more words joined by slashes never break on a phone ("Above/Below/Beside" -> "Above, Below, Beside")
        .replace(/\b[A-Za-z]{2,}(?:\/[A-Za-z]{2,}){2,}\b/g, (m) => m.split('/').join(', '));
}
