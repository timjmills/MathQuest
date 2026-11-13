// js/modules/sheet/near-twins.js
// THE NEAR-TWIN RULES of every lesson page (LESSON_RULES LR-6; lf-engine PC critic r4 N4 / N5, IMPROVEMENT_PLAN §1.7 root
// cause: three near-twin definitions - practice.js nearNum (within 2 / reversed), pre-skill-check.js nearNumbers / nearKeys
// (within 2 / reversed / one place), lesson-rules nearTwins (two-number take-aways) - each held on some pages only, so the
// round packet's Practice and Mixed printed 11 / 12, 97 / 98, four items in the 60s and one answer three times while the
// check and the sheet were clean). ONE module, ONE threshold set, read by the Prerequisite Check, the lesson sheet (Guided and
// Independent together), Practice and Mixed, and by the gate (tests/scripts/ws-lesson-samples.cjs PG-LR6).
// Pure module (SCC-01): no window, no DOM, no state, no Math.random.

/**
 * The thresholds (one set, documented). Two one-number items (a rounding / place-value item's number, 10 or more) are near
 * twins when
 *   - they are within `within` of each other (47 / 49),
 *   - they are the same digits turned round (27 / 72),
 *   - inside ONE question of the check (`sameQ`), one place differs and they share a digit that is not 0 (77 / 71; not 30 / 90).
 * A page also holds at most `perTen` one-number items in one ten (61, 64, 67 is three) and uses one numeric answer at most
 * `perAnswer` times (three items rounding to 60). Two take-aways (a − b) are near twins when they take the same number away or
 * both numbers are within `subWithin` (51 − 44 / 53 − 45) - LR-6 as lesson-rules.js always read it.
 */
export const NEAR = Object.freeze({ minNum: 10, within: 2, perTen: 2, perAnswer: 2, subWithin: 3 });

/** Two numbers a pupil would do the same way (see NEAR). */
export function nearNumbers(x, y, sameQ = false) {
    x = Number(x); y = Number(y);
    if (!(x >= NEAR.minNum && y >= NEAR.minNum) || x === y) return false;
    if (Math.abs(x - y) <= NEAR.within) return true;
    const a = String(x), b = String(y);
    if (a.length !== b.length) return false;
    if (a.split('').sort().join('') === b.split('').sort().join('')) return true;
    if (!sameQ) return false;
    let d = 0, z = true;
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) d++; else if (a[i] !== '0') z = false; }
    return d === 1 && !z;
}

/** Two items' number keys ("12,27": their given numbers, sorted) are near twins: the same numbers but ONE, and that pair near. */
export function nearKeys(k1, k2, sameQ = false) {
    const A = String(k1).split(',').filter(Boolean).map(Number), B = String(k2).split(',').filter(Boolean).map(Number);
    if (!A.length || A.length !== B.length) return false;
    const a = A.slice(), b = B.slice();
    for (let i = a.length - 1; i >= 0; i--) { const j = b.indexOf(a[i]); if (j >= 0) { b.splice(j, 1); a.splice(i, 1); } }
    return a.length === 1 && b.length === 1 && nearNumbers(a[0], b[0], sameQ);
}

/** Two take-aways [a, b] a pupil would do the same way (LR-6): the same number taken away, or both numbers within 3. */
export function nearSubs(x, y) {
    const [a1, b1] = x, [a2, b2] = y;
    if (b1 === b2) return true;
    return Math.abs(a1 - a2) <= NEAR.subWithin && Math.abs(b1 - b2) <= NEAR.subWithin;
}

/** A one-number item's number (its kit payload's `n`, 10 or more), else null. Items are host items ({q}) or generated q's. */
export function oneNumOf(it) {
    const q = it && it.q ? it.q : it;
    const v = Number(((q && q.cell && q.cell.payload) || {}).n);
    return Number.isFinite(v) && v >= NEAR.minNum ? v : null;
}
/** A one-number item's numeric answer (rounding: the ten it rounds to), else null. */
export function oneAnsOf(it) {
    const q = it && it.q ? it.q : it;
    const a = q ? q.ans : null;
    const s = a === null || a === undefined || typeof a === 'object' ? '' : String(a).replace(/,/g, '').trim();
    return /^\d+$/.test(s) ? Number(s) : null;
}
const tenOf = (v) => Math.floor(v / 10);

/**
 * May a one-number item (n, answer `ans`) join a page that holds `taken` [{n, ans}]? Never a near twin of one of them, never
 * a third in one ten, never a third use of one answer. An item with no number (null n) always may.
 */
export function oneNumFits(n, ans, taken, { twinsOnly = false } = {}) {
    if (n === null || n === undefined) return true;
    for (const t of taken) if (t && t.n !== null && nearNumbers(t.n, n)) return false;
    // (`twinsOnly`: a dealer's last tier before its floors go - the pairs still held, the ten and answer caps given up)
    if (twinsOnly) return true;
    if (taken.filter((t) => t && t.n !== null && tenOf(t.n) === tenOf(n)).length >= NEAR.perTen) return false;
    if (ans !== null && ans !== undefined && taken.filter((t) => t && t.ans === ans).length >= NEAR.perAnswer) return false;
    return true;
}

/**
 * The near-twin violations of ONE page's one-number items [{n, ans, text?}] (the gate's reading). Returns messages.
 */
export function pageOneNumViolations(items) {
    const its = (items || []).filter((x) => x && Number.isFinite(Number(x.n)) && Number(x.n) >= NEAR.minNum);
    const out = [];
    for (let i = 0; i < its.length; i++) for (let j = i + 1; j < its.length; j++) {
        if (nearNumbers(its[i].n, its[j].n)) out.push(`${its[i].n} and ${its[j].n} are near twins (within ${NEAR.within} or the digits turned round)`);
    }
    const tens = new Map();
    for (const x of its) tens.set(tenOf(x.n), [...(tens.get(tenOf(x.n)) || []), x.n]);
    for (const [t, v] of tens) if (v.length > NEAR.perTen) out.push(`${v.length} items in the ${t * 10}s (${v.join(', ')}; at most ${NEAR.perTen} a page)`);
    const ans = new Map();
    for (const x of its) if (x.ans !== null && x.ans !== undefined && Number.isFinite(Number(x.ans))) ans.set(Number(x.ans), (ans.get(Number(x.ans)) || 0) + 1);
    for (const [a, c] of ans) if (c > NEAR.perAnswer) out.push(`the answer ${a} ${c} times (at most ${NEAR.perAnswer} a page)`);
    return out;
}

/**
 * A pool split for one page: {clean, later} - every one-number item that does not fit the items taken before it (or `taken`,
 * the page's items already placed) goes to `later`, in order; `keep` never moves. Pure.
 */
export function nearSplit(pool, taken = [], keep = null) {
    const held = taken.map((it) => ({ n: oneNumOf(it), ans: oneAnsOf(it) })).filter((x) => x.n !== null);
    const clean = [], later = [];
    for (const it of pool) {
        const n = oneNumOf(it);
        if (n !== null && it !== keep && !oneNumFits(n, oneAnsOf(it), held)) later.push(it);
        else { clean.push(it); if (n !== null) held.push({ n, ans: oneAnsOf(it) }); }
    }
    return { clean, later };
}

export default { NEAR, nearNumbers, nearKeys, nearSubs, oneNumOf, oneAnsOf, oneNumFits, pageOneNumViolations, nearSplit };
