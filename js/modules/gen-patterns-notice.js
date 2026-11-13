// gen-patterns-notice.js — lane lf-algebra (2026-11-07): two new patterns skills on two new kit cells.
//
//   patterns:notice_patterns       "What Do You Notice?" (3.OA.D.9, 4.OA.C.5) on the `notice` cell
//                                  (sheet/cells/notice.js). One task a page, the skill's `patTask` option:
//       parity      "6 × 7: is the product even or odd?" - circle Even / Odd (lesson G3 "Patterns on the
//                   multiplication table", B5). Even and odd products dealt 1 : 1 (P-10: the odd product is the
//                   non-example); the even ones split between even × even, even × odd and odd × even.
//       feature     "Start at 5. Add 5 each time." and its first six numbers: check the ONE true sentence of
//                   three (lesson G4 "Find emergent features"): every number even / odd, the numbers go odd,
//                   even ..., the ones digits repeat 5, 0 ... Exactly one of the three is true - each sentence is
//                   tested against the first twelve numbers of the rule, never asserted (L4).
//       truefalse   "Every product in the 5 times-table ends in 0 or 5." - circle True / False. True and false
//                   dealt 1 : 1; the truth is computed from the printed row.
//   patterns:growing_shape_patterns "Growing Shape Patterns" (4.OA.C.5) on the `growing-pattern` cell
//                                  (sheet/cells/growing-pattern.js): Terms 1-3 of a growing pattern of dots or
//                                  squares in boxes, an empty box to draw Term 4, a count row. `patTask`:
//       next        write how many Term 4 has (the drawing is working space, never graded)
//       rule        write how many Term 4 has AND the rule (+ 2)
//       far         write how many Term 10 has (Term 4's count is working space)
//
// Options (skill-options.js, lane lf-algebra block): patTask, band (the highest product / number / count:
// "within N" bounds the answer), patShow (the fading hint: factor labels, the printed numbers, the printed row,
// the counts of Terms 1-3), growShape (dots / squares / mixed). Every choice is dealt from the seeded rng through
// page-deal.js (L10: never from the item's position), so a seeded page reproduces and answers never cycle.
import { state } from './state.js';
import { randInt, shuffle } from './utils.js';
import { dealIndex, dealPick, freshDeal } from './page-deal.js';
import { optionsFor, normalizeOptions } from './skill-options.js';
import { k2Twin, noticeStatements, NOTICE_TEMPLATE, growthCells, growCount, GROW_TEMPLATE } from './sheet/index.js';

export const NOTICE_SKILLS = Object.freeze(['notice_patterns', 'growing_shape_patterns']);

/** The skill's option values (the set's / caller's choice, else the default; a preset's values via normalizeOptions). */
function optsOf(skillId) {
    const mine = state.skill === skillId && state.skillOptions && typeof state.skillOptions === 'object' ? state.skillOptions : {};
    try { return normalizeOptions('patterns', skillId, mine); } catch (e) { /* fall through */ }
    const out = {};
    try { for (const d of optionsFor('patterns', skillId)) out[d.id] = d.default; } catch (e) { /* none */ }
    return out;
}

const BANDS = [25, 50, 100, 144];

/* ================================================================== notice_patterns */

/** The largest factor a band allows: 5 to 25, 10 to 50 and 100 (the tables to 10 × 10), 12 to 144. */
const factorMax = (band) => (band <= 25 ? 5 : band <= 100 ? 10 : 12);

function noticeParity(q, o) {
    const band = BANDS.includes(Number(o.band)) ? Number(o.band) : 100;
    const top = factorMax(band);
    // P-10: half the products odd (the non-example), dealt; the even half split three ways
    const wantEven = dealIndex('notice:parity:even', 2) === 0;
    const kind = wantEven ? dealIndex('notice:parity:kind', 3) : 3;   // 0 E×E, 1 E×O, 2 O×E, 3 O×O
    const ev = [], od = [];
    for (let n = 2; n <= top; n++) (n % 2 ? od : ev).push(n);
    let a = 2, b = 3;
    for (let t = 0; t < 80; t++) {
        const pa = kind === 0 || kind === 1 ? ev : od;
        const pb = kind === 0 || kind === 2 ? ev : od;
        a = pa[randInt(0, pa.length - 1)];
        b = pb[randInt(0, pb.length - 1)];
        if (a * b <= band) break;
    }
    const product = a * b;
    const even = product % 2 === 0;
    const payload = {
        task: 'parity', a, b, product, operands: [a, b], labels: ['Even', 'Odd'], correct: even ? 0 : 1,
        show: o.patShow !== false,
    };
    q.text = 'Is the product even or odd?';
    // (r5: the answer is written as its label - Even / Odd - so every page shows one case; the screen check folds case)
    q.ans = even ? 'Even' : 'Odd';
    q.acceptedAnswers = even ? ['even', 'e'] : ['odd', 'o'];
    q.printAnswer = even ? 'Even' : 'Odd';
    q.printText = 'Is the product even or odd? Circle one.';
    q.screenInstr = 'Is the product even or odd? Tap one.';
    q.hint = even
        ? `${a % 2 === 0 ? a : b} is even, so ${a} × ${b} is groups of an even number - two equal halves. The product is even.`
        : `${a} and ${b} are both odd. Odd × odd leaves one over: the product is odd.`;
    q.dupKey = `notice:parity:${Math.min(a, b)}x${Math.max(a, b)}`;
    return payload;
}

/** The first `n` numbers of "start s, add d". */
const termsOf = (s, d, n) => Array.from({ length: n }, (_, i) => s + i * d);

function noticeFeature(q, o) {
    const band = BANDS.includes(Number(o.band)) ? Number(o.band) : 100;
    // what the true sentence is about, dealt 1 : 1: odd / even, or the ones digits
    const about = dealIndex('notice:feature:about', 2) === 0 ? 'parity' : 'ones';
    const steps = about === 'ones' ? [2, 4, 5, 10, 20].filter((d) => 1 + 5 * d <= band) : [1, 2, 3, 4, 5, 10].filter((d) => 1 + 5 * d <= band);
    let s = 1, d = 2, picked = null;
    for (let t = 0; t < 120 && !picked; t++) {
        d = steps.length ? steps[randInt(0, steps.length - 1)] : 2;
        const sMax = Math.max(1, Math.min(d === 10 || d === 20 ? 9 : 12, band - 5 * d));
        s = randInt(1, sMax);
        const all = noticeStatements(termsOf(s, d, 12));
        const trues = all.filter((x) => x.truth && x.about === about);
        if (!trues.length) continue;
        const target = trues[randInt(0, trues.length - 1)];
        // the distractors: false sentences only (never the other TRUE sentence), one of each kind where the
        // skill has one, the misconception first (a pattern read off the first number: "every number is odd")
        const falseP = shuffle(all.filter((x) => !x.truth && x.about === 'parity'));
        const falseO = shuffle(all.filter((x) => !x.truth && x.about === 'ones'));
        const firstRead = (x) => x.firstRead ? 0 : 1;
        falseP.sort((x, y) => firstRead(x) - firstRead(y));
        const pool = about === 'parity' ? [falseP[0], falseO[0] || falseP[1]] : [falseO[0] || falseP[1], falseP[0]];
        if (pool.some((x) => !x)) continue;
        picked = { target, wrong: pool };
    }
    if (!picked) {
        s = 5; d = 5;
        const all = noticeStatements(termsOf(5, 5, 12));
        picked = { target: all.find((x) => x.truth && x.about === about) || all.find((x) => x.truth), wrong: all.filter((x) => !x.truth).slice(0, 2) };
    }
    const at = dealIndex('notice:feature:at', 3);
    const choices = picked.wrong.slice();
    choices.splice(at, 0, picked.target);
    const terms = termsOf(s, d, 6);
    const payload = {
        task: 'feature', start: s, step: d, terms, operands: [s, d],
        choices: choices.map((c) => c.text), kinds: choices.map((c) => c.id), correct: at, about,
        show: o.patShow !== false,
    };
    q.text = 'Read the pattern. Which sentence is true?';
    q.ans = picked.target.text;
    // (r8, lead: the three sentences ARE the choices - hosts and checks that read q.options see them, in printed order)
    q.options = payload.choices.slice();
    q.acceptedAnswers = [picked.target.text.toLowerCase()];
    q.printAnswer = picked.target.text;
    q.printText = 'Read the pattern. Check the sentence that is true.';
    q.screenInstr = 'Read the pattern. Tap the sentence that is true.';
    q.hint = `Look at every number, not just the first one: ${terms.join(', ')}.`;
    q.dupKey = `notice:feature:${s}+${d}:${picked.target.id}`;
    return payload;
}

/** The times-table sentences: each one's truth is computed from the printed row (never asserted). */
export function rowStatements(n, products) {
    const ones = products.map((v) => v % 10);
    const S = [];
    const add = (id, text, truth) => S.push({ id, text, truth: !!truth });
    add('all-even', `Every product in the ${n} times-table is even.`, products.every((v) => v % 2 === 0));
    add('all-odd', `Every product in the ${n} times-table is odd.`, products.every((v) => v % 2 === 1));
    add('alt', `The products in the ${n} times-table go odd, even, odd, even.`, products.every((v, i) => v % 2 === (i % 2 === 0 ? 1 : 0)));
    add('ends05', `Every product in the ${n} times-table ends in 0 or 5.`, ones.every((x) => x === 0 || x === 5));
    add('ends0', `Every product in the ${n} times-table ends in 0.`, ones.every((x) => x === 0));
    if (products.length <= 10) {
        add('down1', `In the ${n} times-table, the ones digit goes down by 1 each time.`, ones.every((x, i) => i === 0 || x === ones[i - 1] - 1));
    }
    return S;
}

function noticeTrueFalse(q, o) {
    const band = BANDS.includes(Number(o.band)) ? Number(o.band) : 100;
    // the row printed: n × 1 to n × len, every product inside the band (25: the 2-5 tables to × 5; 50: the 2-5
    // tables to × 10; 100: the 2-10 tables to × 10; 144: the 2-12 tables to × 12)
    const len = band <= 25 ? 5 : band >= 144 ? 12 : 10;
    const usable = [];
    for (let n = 2; n <= 12; n++) if (n * len <= band) usable.push(n);
    const wantTrue = dealIndex('notice:tf:truth', 2) === 0;
    const rowOf = (m) => Array.from({ length: len }, (_, i) => m * (i + 1));
    // the KIND of sentence is dealt first (L10: not one kind on every true item), then a table where the sentence
    // has the truth wanted. The 9s sentence is offered on the 9 table (true) and the 8 table (false) only.
    const byKind = new Map();
    for (const m of usable) {
        for (const x of rowStatements(m, rowOf(m))) {
            if (x.truth !== wantTrue) continue;
            if (x.id === 'down1' && m !== 9 && m !== 8) continue;
            if (!byKind.has(x.id)) byKind.set(x.id, []);
            byKind.get(x.id).push(m);
        }
    }
    const kinds = [...byKind.keys()];
    let n = 5, st = null, products = [];
    if (kinds.length) {
        const kind = dealPick(`notice:tf:kind:${wantTrue ? 't' : 'f'}`, kinds);
        const ns = byKind.get(kind);
        n = ns[randInt(0, ns.length - 1)];
        products = rowOf(n);
        st = rowStatements(n, products).find((x) => x.id === kind) || null;
    }
    if (!st) { n = 5; products = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]; st = rowStatements(5, products).find((x) => x.id === 'ends05'); }
    const payload = {
        task: 'truefalse', table: n, products, statement: st.text, kind: st.id, isTrue: st.truth,
        operands: [n, products.length], labels: ['True', 'False'], correct: st.truth ? 0 : 1,
        show: o.patShow !== false,
    };
    q.text = 'Is the sentence true or false?';
    q.ans = st.truth ? 'True' : 'False';
    q.acceptedAnswers = st.truth ? ['true', 't'] : ['false', 'f'];
    q.printAnswer = st.truth ? 'True' : 'False';
    q.printText = 'Read the sentence. Circle True or False.';
    q.screenInstr = 'Read the sentence. Tap True or False.';
    q.hint = `Check every product: ${products.join(', ')}.`;
    q.dupKey = `notice:tf:${n}:${st.id}`;
    return payload;
}

function generateNotice(q) {
    const o = optsOf('notice_patterns');
    const task = ['parity', 'feature', 'truefalse'].includes(o.patTask) ? o.patTask : 'parity';
    const payload = task === 'feature' ? noticeFeature(q, o) : task === 'truefalse' ? noticeTrueFalse(q, o) : noticeParity(q, o);
    q.answerType = 'text';
    q.skillLabel = 'What Do You Notice?';
    q.selfAnswering = true;
    q.cell = { template: NOTICE_TEMPLATE, v: 1, payload };
    try { q.visual = k2Twin(NOTICE_TEMPLATE, payload); } catch (e) { q.visual = ''; }
    q.printFormat = 'notice-pattern';
}

/* ================================================================== growing_shape_patterns */

/** The pattern families: count(t) = start + (t - 1) × step, every one drawn inside 7 × 7 units at Term 4. */
const FAMILIES = ['line', 'rows2', 'rows2p', 'rows3', 'rows3p', 'rows4', 'rows4p', 'rows5', 'L', 'T', 'plus'];

/**
 * Every family and shift a page of the task may draw: the answer (Term 4's count, or Term 10's) inside the band and
 * Term 4 inside its box. The ONE source of the valid set: the dealer below draws from it, and the item declares the
 * distinct (start, step) pairs it makes (`q.dealSet`, read by ws-dealer-uniform: the page caps and the uniform check
 * are judged against the real set, not against an arithmetic one).
 */
export function growingCandidates(ask, band) {
    const at = ask === 'far' ? 10 : 4;
    const cands = [];
    for (const fam of FAMILIES) {
        for (let e = 0; e <= 3; e++) {
            if (growthCells(fam, e, 4) === null) continue;
            const ans = growCount(fam, e, at);
            if (!Number.isFinite(ans) || ans > band || growCount(fam, e, 1) < 1) continue;
            cands.push({ fam, e, start: growCount(fam, e, 1), step: growCount(fam, e, 2) - growCount(fam, e, 1), ans });
        }
    }
    return cands;
}

function generateGrowing(q) {
    const o = optsOf('growing_shape_patterns');
    const ask = ['next', 'rule', 'far'].includes(o.patTask) ? o.patTask : 'next';
    const band = [10, 20, 50].includes(Number(o.band)) ? Number(o.band) : (ask === 'far' ? 50 : 20);
    const cands = growingCandidates(ask, band);
    // the (start, step) pair is drawn UNIFORMLY over every distinct pair the band allows, FRESH on the page
    // (page-deal.js freshDeal: no pair twice in the last 19 items while the band has 24 or more; a smaller band keeps
    // only half its pairs out, since a window of size - 1 would force one fixed cycle, L10); the family and shift that draw it are then picked from those that make that pair
    const sigs = [...new Set(cands.map((c) => `${c.start}+${c.step}`))];
    const k = freshDeal(`grow:sig:${ask}:${band}`, () => randInt(0, sigs.length - 1), { sig: (v) => String(v), window: sigs.length >= 24 ? 19 : Math.max(1, Math.floor(sigs.length / 2)) });
    const mine = cands.filter((c) => `${c.start}+${c.step}` === sigs[k]);
    const pick = mine[randInt(0, mine.length - 1)] || cands[0];
    const shapeOpt = ['dots', 'squares', 'mixed'].includes(o.growShape) ? o.growShape : 'dots';
    const shape = shapeOpt === 'mixed' ? (dealIndex('grow:shape', 2) === 0 ? 'dots' : 'squares') : shapeOpt;
    const counts = [1, 2, 3, 4].map((t) => growCount(pick.fam, pick.e, t));
    const c10 = growCount(pick.fam, pick.e, 10);
    const unit = shape === 'dots' ? 'dots' : 'squares';
    const payload = {
        fam: pick.fam, e: pick.e, shape, ask, step: pick.step, counts, count10: c10,
        operands: [counts[0], pick.step], show: o.patShow !== false, unit,
    };
    q.cell = { template: GROW_TEMPLATE, v: 1, payload };
    if (ask === 'rule') {
        q.ans = `${counts[3]}, ${pick.step}`;
        q.text = `Look at Terms 1, 2 and 3. How many ${unit} does Term 4 have? What is the rule?`;
        q.printText = 'Draw Term 4. Write how many it has. Write the rule.';
        q.screenInstr = 'Make Term 4 on the grid. Type how many it has. Type the rule.';
        q.answerType = 'text';
    } else if (ask === 'far') {
        q.ans = String(c10);
        q.text = `Look at Terms 1, 2 and 3. How many ${unit} does Term 10 have?`;
        q.printText = 'Find the rule. Write how many Term 10 has.';
        q.screenInstr = 'Find the rule. Type how many Term 10 has.';
        q.answerType = 'number';
    } else {
        q.ans = String(counts[3]);
        q.text = `Look at Terms 1, 2 and 3. How many ${unit} does Term 4 have?`;
        q.printText = 'Draw Term 4. Write how many it has.';
        q.screenInstr = 'Make Term 4 on the grid. Type how many it has.';
        q.answerType = 'number';
    }
    q.skillLabel = 'Growing Shape Patterns';
    q.hint = `Each term has ${pick.step} more ${unit} than the one before.`;
    q.dupKey = `grow:${pick.fam}:${pick.e}:${ask}`;
    // the declared valid set (not enumerable: a saved quiz never stores it): every (start, step) pair equally likely
    const seen = new Set();
    const set = [];
    for (const c of cands) { const s = `${c.start}+${c.step}`; if (!seen.has(s)) { seen.add(s); set.push([c.start, c.step, c.ans]); } }
    Object.defineProperty(q, 'dealSet', { value: { of: 'start, step', items: set }, enumerable: false, configurable: true, writable: true });
    try { q.visual = k2Twin(GROW_TEMPLATE, payload); } catch (e) { q.visual = ''; }
    q.printFormat = 'growing-pattern';
}

/** Fill `q` for one of NOTICE_SKILLS. Returns true when it handled the skill. */
export function generatePatternsNotice(q, skillId) {
    if (skillId === 'notice_patterns') { generateNotice(q); return true; }
    if (skillId === 'growing_shape_patterns') { generateGrowing(q); return true; }
    return false;
}
