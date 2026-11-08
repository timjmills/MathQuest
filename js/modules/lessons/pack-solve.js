// js/modules/lessons/pack-solve.js
// THE WHOLE-PACK FACT SOLVER of a detailed lesson whose story facts come from one small pool (lesson 2 E24b, owner ruling
// 2026-11-08). A pack of + stories - the chart, Guided, Practice, the word problem, the exit slip, the Check Question - all
// draw from the lesson's pool (lesson 2: crossing-ten facts, parts 2 to 9: 20 facts) under LR-5 (one fact a pack, either
// order) and LR-6 (on a page: no near twins - both numbers within 2, place by place -, no first addend twice, no whole twice).
// Solving ONE page at a time (attempt 2: Practice 1 after the chart, Guided and the reserved items; attempt 3: Practice 1
// first) left another place short. This module models EVERY place that draws from the pool, as the description declares
// it, and solves them together; the dealer then takes Practice 1's part of a whole-pack solution. A Prerequisite Check never
// draws from the lesson's own pool (owner ruling 2026-11-08): `prereqPoolDraws` names a prerequisite ref that would.
// Pure: no DOM, no state, no Math.random (the search order is seeded).

/** The + facts of a `pool: {kind: 'plus', partMin, noPart, crossTen}` rule, unordered [a, b] with a <= b; null for any other pool. */
export function poolFacts(pool) {
    if (!pool || pool.kind !== 'plus') return null;
    const pm = Number(pool.partMin) || 1, no = (pool.noPart || []).map(Number), out = [];
    for (let a = pm; a <= 9; a++) for (let b = a; b <= 9; b++) {
        if (no.includes(a) || no.includes(b)) continue;
        if (pool.crossTen && a + b < 11) continue;
        if (pool.maxSum !== undefined && a + b > Number(pool.maxSum)) continue;
        out.push([a, b]);
    }
    return out;
}

// The case tests a pool place may declare (roles/lesson.js CASE_TESTS, read on the two numbers as written). A place
// that is not the equal-parts edge never takes equal parts (edgeOnly: equal parts only on Practice's last row).
const CLEAN = (a, b) => a !== Math.abs(a - b) && b !== Math.abs(a - b);
const CASES = {
    wpBridgeSmallFirst: (a, b) => a < b, wpBridgeSmallFirstAT: (a, b) => a < b, wpBridgeBigFirst: (a, b) => a > b,
    wpBridgeHigh: (a, b) => a + b >= 14, wpClean: CLEAN, wpEqual: (a, b) => a === b,
    wpBridgePT: () => true, wpPutTogether: () => true, wpAddTo: () => true, wpAddToAny: () => true,
};
const wantsOf = (w) => (Array.isArray(w) ? w : w ? [w] : []);
function caseTest(wants, ref) {
    const ws = wantsOf(wants);
    for (const w of ws) if (!CASES[w]) throw new Error(`pack-solve: no model of the case "${w}"`);
    const eqp = ws.includes('wpEqual');
    const lo = ref && ref.minNum !== undefined ? Number(ref.minNum) : -Infinity, hi = ref && ref.maxNum !== undefined ? Number(ref.maxNum) : Infinity;
    return (a, b) => (eqp ? a === b : a !== b) && a + b >= lo && a + b <= hi && ws.every((w) => CASES[w](a, b));
}

/** The + facts of the lesson's pool a prerequisite ref can deal (unordered keys "a+b", a <= b); [] when it can deal none. */
export function prereqPoolDraws(ref, pool) {
    const facts = poolFacts(pool);
    if (!facts || !ref || ref.categoryId !== 'addition') return [];
    const o = ref.opts || {};
    const band = Number(o.band) || 20, lo = ref.minNum !== undefined ? Number(ref.minNum) : 0, hi = ref.maxNum !== undefined ? Number(ref.maxNum) : band;
    const pm = ref.partMin !== undefined ? Number(ref.partMin) : 0, no = (ref.noPart || []).map(Number);
    const cs = Array.isArray(o.constant) && o.constant.length ? o.constant.map(Number) : null;
    return facts.filter(([a, b]) => a >= pm && !no.includes(a) && !no.includes(b) && a + b >= lo && a + b <= Math.min(hi, band)
        && (!cs || cs.includes(a) || cs.includes(b))).map(([a, b]) => `${a}+${b}`);
}

/**
 * Every place of a detailed lesson description `d` that draws from its pool, in the description's own terms: {id, page,
 * test(a, b)} with the numbers as written. Chart (example, second, third), Guided (guidedWants), Practice 1 (its places above
 * the last row, then the equal-parts edge), the word problem, the exit slip, the Check Question and - only while a ref of it
 * can deal a pool fact - the Prerequisite Check. Returns null when `d` has no + pool.
 */
export function packPlaces(d) {
    if (!d || !poolFacts(d.pool)) return null;
    const L = d.lessonData || {}, out = [];
    const add = (id, page, wants, ref) => out.push({ id, page, test: caseTest(wants, ref) });
    if (L.example) add('chart.0', 'chart', L.example.test, null);
    if (L.second) add('chart.1', 'chart', L.second.test, null);
    if (L.third) add('chart.2', 'chart', L.third.test, null);
    (L.guidedWants || []).forEach((w, i) => add(`guided.${i}`, 'guided', w, null));
    const ps = (d.practiceSheets || [])[0];
    if (ps) {
        const el = ps.edgeLast || {};
        const n = Number(el.per || (L.practiceShape || [6, 2])[0]) - Number(el.cols || (L.practiceShape || [6, 2])[1]);
        for (let i = 0; i < n; i++) add(`practice.${i}`, 'practice', [], ps.skill);
        if ((el.wants || []).includes('wpEqual')) add('practice.edge', 'practice', 'wpEqual', null);
    }
    if (d.wordProblem) add('wp', 'wp', d.wordProblem.want, d.wordProblem.ref);
    (d.exit || []).forEach((e, i) => add(`exit.${i}`, 'exit', e.want, e.ref));
    if (d.checkQuestion) add('cq', 'cq', d.checkQuestion.want, d.checkQuestion.ref || d.skill);
    (d.prerequisites || []).forEach((p, j) => {
        const can = new Set(prereqPoolDraws(p.ref, d.pool));
        if (!can.size) return;
        for (let i = 0; i < (p.items || 2); i++) out.push({ id: `p0.${j}.${i}`, page: 'p0', test: (a, b) => can.has(`${Math.min(a, b)}+${Math.max(a, b)}`) });
    });
    return out;
}

/**
 * One whole-pack assignment: every place of `places` a pool fact (as written), LR-5 across the pack (no fact twice in either
 * order, none in `avoid`), LR-6 on each page. Most-constrained place first; facts in a seeded order, so seeds differ. Returns
 * {byId: {id: 'a+b'}, nodes} or null (none within `cap` search nodes, or none at all).
 */
export function solvePack(pool, places, avoid = [], seed = 1, cap = 3000, restarts = 300) {
    // (seeded restarts, each a short search: one long search from a bad first choice thrashes - 200 000 nodes found
    // nothing at most seeds - while the pack has thousands of solutions)
    for (let r = 0; r < restarts; r++) {
        const got = solvePack1(pool, places, avoid, (Number(seed) + 7919 * r) >>> 0, cap);
        if (got) return Object.assign(got, { restart: r });
    }
    return null;
}
function solvePack1(pool, places, avoid, seed, cap) {
    const facts = poolFacts(pool);
    if (!facts || !places) return null;
    const spent = new Set(avoid || []);
    let s = (Number(seed) >>> 0) || 1;
    const rnd = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return s / 4294967296; };
    const order = facts.filter(([a, b]) => !spent.has(`${a}+${b}`) && !spent.has(`${b}+${a}`)).map((f) => [f, rnd()]).sort((x, y) => x[1] - y[1]).map((x) => x[0]);
    const forms = order.flatMap(([a, b]) => (a === b ? [[a, b]] : rnd() < 0.5 ? [[a, b], [b, a]] : [[b, a], [a, b]]));
    const twin = (x, y) => Math.abs(x[0] - y[0]) <= 2 && Math.abs(x[1] - y[1]) <= 2;
    const pick = new Array(places.length).fill(null), used = new Set();
    let nodes = 0;
    const fits = (i, x) => {
        if (used.has(`${Math.min(x[0], x[1])}+${Math.max(x[0], x[1])}`) || !places[i].test(x[0], x[1])) return false;
        for (let j = 0; j < places.length; j++) {
            const y = pick[j];
            if (!y || places[j].page !== places[i].page) continue;
            if (twin(x, y) || x[0] === y[0] || x[0] + x[1] === y[0] + y[1]) return false;
        }
        return true;
    };
    const rec = (left) => {
        if (!left) return true;
        if (++nodes > cap) return false;
        let best = -1, bestC = null;
        for (let i = 0; i < places.length; i++) {
            if (pick[i]) continue;
            const c = forms.filter((x) => fits(i, x));
            if (!c.length) return false;
            if (!bestC || c.length < bestC.length) { best = i; bestC = c; }
        }
        for (const x of bestC) {
            const k = `${Math.min(x[0], x[1])}+${Math.max(x[0], x[1])}`;
            pick[best] = x; used.add(k);
            if (rec(left - 1)) return true;
            pick[best] = null; used.delete(k);
            if (nodes > cap) return false;
        }
        return false;
    };
    if (!rec(places.length)) return null;
    const byId = {};
    places.forEach((p, i) => { byId[p.id] = `${pick[i][0]}+${pick[i][1]}`; });
    return { byId, nodes };
}

/**
 * Practice 1's solved set from a whole-pack solution, in the form print-sheet.js `solveStoryFacts` returns: {at, edge} -
 * `at` the places above the last row, `edge` the equal-parts fact, then every edge whole (`rule.sums`) in both orders that is
 * no near twin of them (parts from rule.partMin, never a noPart, the pack's spent keys left out). null when no solution.
 */
export function solvePracticeFromPack(d, rule, avoid, seed) {
    const places = packPlaces(d);
    const sol = places ? solvePack(d.pool, places, avoid, seed) : null;
    if (!sol) return null;
    const at = places.filter((p) => /^practice\.\d+$/.test(p.id)).map((p) => sol.byId[p.id]);
    const sq = sol.byId['practice.edge'];
    if (!sq) return null;
    const pm = Number(rule.partMin) || 1, no = (rule.noPart || []).map(Number), spent = new Set(avoid || []);
    const two = (k) => String(k).split('+').map(Number);
    const twin = (x, y) => Math.abs(x[0] - y[0]) <= 2 && Math.abs(x[1] - y[1]) <= 2;
    const edge = [sq];
    for (const w of (rule.sums || []).map(Number)) for (let a = pm; a <= w - pm; a++) {
        const x = [a, w - a];
        if (a === w - a || no.includes(a) || no.includes(w - a) || spent.has(`${a}+${w - a}`)) continue;
        if (!twin(x, two(sq)) && at.every((k) => !twin(x, two(k)))) edge.push(`${a}+${w - a}`);
    }
    return { at, edge, pack: sol.byId };
}
