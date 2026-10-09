// A number family is right in ANY order (owner 2026-10-04: "The order of the number family should not
// be counted wrong"). Each row of a family is one fact with its sign printed; the pupil may write any
// fact of the family that row's sign makes (3 × 8 = 24 or 8 × 3 = 24; 24 ÷ 8 = 3 or 24 ÷ 3 = 8), as
// long as no two rows repeat the same fact. A number the row prints is part of the fact it must be.
// Pure: no DOM, no state. Used by the card, the online worksheet, the quiz and the live box marks.

const _num = (v) => {
    const s = String(v == null ? '' : v).trim().replace(/,/g, '');
    if (s === '') return null;
    return /^-?\d+(\.\d+)?$/.test(s) ? Number(s) : NaN;
};

/**
 * The facts each sign of the family allows: { op: [[x, y, z], ...] }, from the family's own rows. A
 * fact the family prints twice (4 + 4 = 8 in a doubles family) is listed twice: two rows may hold it.
 */
export function familyFacts(data) {
    const out = {};
    (data && Array.isArray(data.equations) ? data.equations : []).forEach((eq) => {
        (out[eq.op] || (out[eq.op] = [])).push(eq.nums.map(Number));
    });
    return out;
}

/**
 * The family's rows with the pupil's values: values[r][p] is the number at row r, place p (a printed
 * number is filled in from the family). Returns [{ op, vals: [n|null|NaN, ...], given: [bool, ...] }].
 */
export function familyRows(data, values) {
    const miss = (data && data.missingPositions) || [];
    return data.equations.map((eq, r) => {
        const given = [0, 1, 2].map((p) => !(miss[r] || [0, 1, 2]).includes(p));
        const vals = [0, 1, 2].map((p) => (given[p] ? Number(eq.nums[p]) : _num(values[r] && values[r][p])));
        return { op: eq.op, vals, given };
    });
}

const _fits = (f, vals) => vals.every((v, p) => v === null || v === f[p]);
const _full = (vals) => vals.every((v) => v !== null);

/**
 * verdicts[r][p]: true (right for this row), false (wrong), null (empty, or a printed number).
 * A whole row is right when it is a fact of the family that no other row already holds.
 */
export function judgeFamily(data, values) {
    const facts = familyFacts(data);
    const rows = familyRows(data, values);
    // claim[r]: the fact (by its place in facts[op]) that finished row r holds
    const claim = rows.map(() => null);
    const taken = new Set();
    // pass 1: every finished row that is a fact claims it. A row whose printed numbers leave it fewer
    // facts claims first (critic D2), then rows top to bottom: of two rows holding the same fact, the
    // lower one on the page is the repeat that turns red.
    const order = rows.map((row, r) => r).sort((x, y) => rows[y].given.filter(Boolean).length - rows[x].given.filter(Boolean).length || x - y);
    order.forEach((r) => {
        const row = rows[r];
        if (!_full(row.vals)) return;
        const i = (facts[row.op] || []).findIndex((x, k) => _fits(x, row.vals) && !taken.has(row.op + '|' + k));
        if (i >= 0) { claim[r] = i; taken.add(row.op + '|' + i); }
    });
    return rows.map((row, r) => {
        if (claim[r] !== null) return row.given.map((g) => (g ? null : true));
        // the facts still free for this row (another row's claim is not)
        const all = facts[row.op] || [];
        const free = all.filter((f, k) => !rows.some((o, j) => j !== r && o.op === row.op && claim[j] === k));
        const pool = free.length ? free : all;
        if (!_full(row.vals) && pool.some((f) => _fits(f, row.vals))) {
            return row.vals.map((v, p) => (row.given[p] || v === null ? null : true));
        }
        // the nearest fact decides which boxes are wrong; it must keep the numbers the row prints
        let best = pool[0], hits = -1;
        pool.forEach((f) => {
            const h = row.vals.reduce((n, v, p) => n + (v === f[p] ? (row.given[p] ? 10 : 1) : 0), 0);
            if (h > hits) { hits = h; best = f; }
        });
        return row.vals.map((v, p) => (row.given[p] || v === null ? null : (best && v === best[p])));
    });
}

/** The number this box is nearest to being (for the wrong-digit marks), or null. */
export function familyWant(data, values, r, p) {
    const facts = familyFacts(data)[data.equations[r].op] || [];
    const row = familyRows(data, values)[r];
    const f = facts.find((x) => _fits(x, row.vals)) || facts.find((x) => row.vals.every((v, k) => k === p || v === null || v === x[k])) || facts[0];
    return f ? f[p] : null;
}

/** Is the whole family right? values as for judgeFamily; every blank must be filled. */
export function familyAllRight(data, values) {
    const v = judgeFamily(data, values);
    const rows = familyRows(data, values);
    return rows.every((row, r) => row.given.every((g, p) => g || v[r][p] === true));
}

/** values[r][p] from a family's input boxes (data-eq, data-pos). */
export function familyValuesFromInputs(inputs) {
    const values = [];
    Array.from(inputs).forEach((el) => {
        const r = Number(el.getAttribute('data-eq')), p = Number(el.getAttribute('data-pos'));
        if (!Number.isInteger(r) || !Number.isInteger(p)) return;
        (values[r] || (values[r] = []))[p] = String(el.value == null ? '' : el.value);
    });
    return values;
}

/** The verdict for one input box of a family (true / false / null). */
export function familyBoxVerdict(data, inputs, el) {
    const r = Number(el.getAttribute('data-eq')), p = Number(el.getAttribute('data-pos'));
    if (!Number.isInteger(r) || !Number.isInteger(p) || !data.equations[r]) return null;
    const v = judgeFamily(data, familyValuesFromInputs(inputs));
    return v[r] ? v[r][p] : null;
}

/** Can this family be judged in any order? (a number family with its rows and blanks recorded) */
export function isOrderFreeFamily(q) {
    const d = q && q.numberFamilyData;
    return !!(d && Array.isArray(d.equations) && d.equations.length && Array.isArray(d.missingPositions)
        && d.equations.every((e) => Array.isArray(e.nums) && e.nums.length === 3 && e.op));
}

/**
 * A quiz composes the family's boxes in reading order, joined ", " (wireDrawnAnswers). Reading order
 * is row by row, place by place, the order the blanks are drawn in.
 */
export function familyComposedRight(data, composed) {
    const parts = String(composed == null ? '' : composed).split(/\s*,\s*/);
    const miss = data.missingPositions || [];
    const values = [];
    let k = 0;
    // rows are drawn in the family's order except the four-operation family, drawn +/− rows then ×/÷ rows
    const order = data.equations.map((e, r) => r);
    if (data.operationType === 'all_four') order.sort((x, y) => _group(data.equations[x]) - _group(data.equations[y]) || x - y);
    for (const r of order) {
        values[r] = [];
        for (const p of [0, 1, 2]) if ((miss[r] || []).includes(p)) { values[r][p] = parts[k] == null ? '' : parts[k]; k++; }
    }
    if (k !== parts.length) return false;
    return familyAllRight(data, values);
}
const _group = (eq) => (eq.type === 'add' || eq.type === 'sub' ? 0 : 1);
