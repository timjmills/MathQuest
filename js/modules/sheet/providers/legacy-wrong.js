// js/modules/sheet/providers/legacy-wrong.js
// Misconception-based wrong answers (SCC 3.8 `wrongAnswer`) for skills whose cells are still the
// legacy print path, so their Error analysis ("Check it") page can be printed (critic round 4:
// fractions:compare, area_perimeter:perimeter_intro, measurement:temperature and graphs:bar_graph
// had no page at all, H11).
//
// Only `wrongAnswer` and `misconceptions` are supplied; everything else comes from the default
// adapters. A skill that gains a full provider elsewhere keeps it: this module registers a key
// only when no provider exists yet, and it is imported LAST by providers/index.js.
//
// Each wrong answer is a named error a pupil really makes, never a near miss, and never the
// right answer (chooseWrong drops a candidate equal to it). An item with no single written answer
// (a multi-select, a sort) returns null, and the page deals another item.
//
// Pure module (SCC-01).

import { registerSkill, hasProvider } from '../contract.js';
import { chooseWrong } from './util.js';

const FRAC2 = /(\d+)\s*\/\s*(\d+)\D+?(\d+)\s*\/\s*(\d+)/;

/** The two fractions an item compares, [[n1, d1], [n2, d2]], or null. */
function fractionsOf(q) {
    const f = q.fractionData;
    if (f && Number.isFinite(f.num1)) return [[f.num1, f.denom1], [f.num2, f.denom2]];
    const m = FRAC2.exec(String(q.text || ''));
    return m ? [[+m[1], +m[2]], [+m[3], +m[4]]] : null;
}

/** fractions:compare - whole-number thinking about fractions (EXTENSION_PLAYBOOK fractions). */
function fractionCompareWrong(q) {
    const fr = fractionsOf(q);
    if (!fr) return null;
    const [[n1, d1], [n2, d2]] = fr;
    const ans = String(q.ans);
    const cmp = (x, y) => (x > y ? 1 : x < y ? -1 : 0);
    // M-F1: the bigger denominator is the bigger fraction (1/8 > 1/3); M-F3: compared only the
    // numerators (2/4 > 1/2); M-F2: the sign the wrong way round.
    const byDen = cmp(d1, d2);
    const byNum = cmp(n1, n2);
    const truth = cmp(n1 * d2, n2 * d1);
    const cands = [];
    const add = (c, misconception, explain) => { if (c !== null && c !== truth) cands.push({ c, misconception, explain }); };
    if (d1 !== d2) add(byDen, 'M-F1', 'Thought a bigger bottom number makes a bigger fraction.');
    add(byNum, 'M-F3', 'Compared only the top numbers.');
    if (truth !== 0) add(-truth, 'M-F2', 'Wrote the sign the wrong way round.');
    const sign = { 1: '>', '-1': '<', 0: '=' };
    const word = { 1: 'greater than', '-1': 'less than', 0: 'equal to' };
    const f1 = `${n1}/${d1}`;
    const f2 = `${n2}/${d2}`;
    const asAnswer = (c) => {
        if (/^[<>=]$/.test(ans)) return sign[c];
        if (/than|equal to/.test(ans)) return word[c];
        // "Which is greater: a or b? (or equal)"
        return c === 0 ? 'equal' : c > 0 ? f1 : f2;
    };
    return chooseWrong(q, cands.map((x) => ({ value: asAnswer(x.c), misconception: x.misconception, explain: x.explain })));
}

/** area_perimeter:perimeter_intro - adding only some sides, or finding the area. */
function perimeterWrong(q) {
    const p = q.perimeterIntroData;
    if (!p || !Array.isArray(p.sides) || !p.sides.length) return null;
    const sides = p.sides.map(Number);
    const labelled = Object.values(p.sideLabels || {}).map(Number).filter(Number.isFinite);
    const sum = (a) => a.reduce((s, v) => s + v, 0);
    const c = [];
    // M-P1: added only the sides with a number on them (a rectangle's length and width).
    if (labelled.length && labelled.length < sides.length) c.push({ value: sum(labelled), misconception: 'M-P1', explain: 'Added only the sides with numbers on them.' });
    // M-P2: multiplied length by width - found the area, not the distance around.
    if (p.shape === 'rectangle' || p.shape === 'square') c.push({ value: sides[0] * sides[1], misconception: 'M-P2', explain: 'Multiplied: found the area, not the distance around.' });
    // M-P3: left one side out.
    if (sides.length >= 3) c.push({ value: sum(sides) - sides[sides.length - 1], misconception: 'M-P3', explain: 'Left one side out.' });
    return chooseWrong(q, c);
}

/** measurement:temperature - reading the scale, and converting. */
function temperatureWrong(q) {
    const m = q.measurementData;
    if (!m || typeof q.ans === 'object') return null;
    const c = [];
    if (m.temp !== undefined) {
        const t = Number(m.temp);
        const every = Number(m.every) || 5;
        // M-TM1: read the nearest numbered line, not the small marks.
        c.push({ value: Math.round(t / every) * every, misconception: 'M-TM1', explain: 'Read the nearest numbered line, not the small marks.' });
        // M-TM3: below zero read as above zero.
        if (t < 0) c.push({ value: -t, misconception: 'M-TM3', explain: 'Read a temperature below zero as above zero.' });
        // M-TM2: counted the numbered line as the first mark - one degree too many.
        c.push({ value: t + 1, misconception: 'M-TM2', explain: 'Counted the numbered line as the first mark: one degree too many.' });
    } else if (m.direction === 'c_to_f') {
        const C = Number(m.celsius);
        c.push({ value: Math.round(C * 9 / 5), misconception: 'M-TC1', explain: 'Multiplied by 9/5 but forgot to add 32.' });
        c.push({ value: C + 32, misconception: 'M-TC2', explain: 'Only added 32.' });
    } else if (m.direction === 'f_to_c') {
        const F = Number(m.fahrenheit);
        c.push({ value: F - 32, misconception: 'M-TC2', explain: 'Only took away 32.' });
        c.push({ value: Math.round(F * 5 / 9), misconception: 'M-TC1', explain: 'Multiplied by 5/9 without taking away 32 first.' });
    }
    return chooseWrong(q, c);
}

/** graphs:bar_graph - reading the wrong bar, or the wrong end. */
function barGraphWrong(q) {
    const d = q.dataData;
    if (!d || !Array.isArray(d.values) || typeof q.ans === 'object') return null;
    const cats = (d.categories || []).map(String);
    const vals = d.values.map(Number);
    const text = String(q.text || '');
    const c = [];
    const idxIn = (re) => { const m = re.exec(text); return m ? cats.indexOf(m[1]) : -1; };
    switch (d.questionType) {
        case 'specific_value': {
            const i = idxIn(/How many chose (.+?)\?/);
            if (i < 0) break;
            // M-D1: read the bar next to the one asked.
            if (i + 1 < vals.length) c.push({ value: vals[i + 1], misconception: 'M-D1', explain: 'Read the bar next to the one asked.' });
            if (i > 0) c.push({ value: vals[i - 1], misconception: 'M-D1', explain: 'Read the bar next to the one asked.' });
            break;
        }
        case 'total': {
            // M-D2: left one bar out of the total.
            const tot = vals.reduce((s, v) => s + v, 0);
            c.push({ value: tot - vals[vals.length - 1], misconception: 'M-D2', explain: 'Left the last bar out of the total.' });
            c.push({ value: tot - vals[0], misconception: 'M-D2', explain: 'Left the first bar out of the total.' });
            break;
        }
        case 'which_highest':
            // M-D3: picked the wrong end - the shortest bar for "most".
            c.push({ value: cats[vals.indexOf(Math.min(...vals))], misconception: 'M-D3', explain: 'Picked the shortest bar, not the tallest.' });
            break;
        case 'which_lowest':
            c.push({ value: cats[vals.indexOf(Math.max(...vals))], misconception: 'M-D3', explain: 'Picked the tallest bar, not the shortest.' });
            break;
        case 'difference': {
            const m = /between (.+?) and (.+?)\?/.exec(text);
            const a = m ? cats.indexOf(m[1]) : -1;
            const b = m ? cats.indexOf(m[2]) : -1;
            // M-D4: added the two bars instead of finding the difference.
            if (a >= 0 && b >= 0) c.push({ value: vals[a] + vals[b], misconception: 'M-D4', explain: 'Added the two bars instead of finding how many more.' });
            break;
        }
        default: break;
    }
    return chooseWrong(q, c);
}

const ENTRIES = [
    ['fractions:compare', fractionCompareWrong, ['M-F1', 'M-F2', 'M-F3']],
    ['area_perimeter:perimeter_intro', perimeterWrong, ['M-P1', 'M-P2', 'M-P3']],
    ['measurement:temperature', temperatureWrong, ['M-TM1', 'M-TM2', 'M-TM3', 'M-TC1', 'M-TC2']],
    ['graphs:bar_graph', barGraphWrong, ['M-D1', 'M-D2', 'M-D3', 'M-D4']],
];

for (const [key, wrongAnswer, misconceptions] of ENTRIES) {
    const [cat, id] = key.split(':');
    if (!hasProvider(cat, id)) registerSkill(key, { wrongAnswer, misconceptions });
}

export const LEGACY_WRONG_IDS = Object.freeze(ENTRIES.map(([k]) => k));

