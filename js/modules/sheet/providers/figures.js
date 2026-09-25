// js/modules/sheet/providers/figures.js
// Skill providers for the figure and data cells of O6 lane AP2, round 3 (sheet/cells/figures.js):
// measurement:temperature (thermometer), measurement:reading_ruler / reading_ruler_hard (ruler),
// graphs:bar_graph and measurement:bar_graph_intro (bar-graph), graphs:pictograph and
// measurement:pictograph_intro (pictograph), graphs:tally_chart (tally-chart),
// area_perimeter:perimeter_intro (perimeter-shape). Every member reads the item's kit payload (`q.cell.payload`, plain data the
// generator wrote), never the drawing.
//
// THE MISCONCEPTION BANK. The error-analysis lane's legacy-wrong.js ids are kept (M-TM1, M-TM2,
// M-P1 ... M-P3, M-D1 ... M-D4); the ones for items that no longer exist are not: M-TM3 (the
// thermometer reads no temperature below zero now) and M-TC1 / M-TC2 (conversions left the skill,
// critic round 4). New ones, each a real, computable error:
//   M-TM4 counted the small marks up from the numbered line ABOVE the column
//   M-RL1 read the small mark next to the arrow       M-RL2 a half inch too far
//   M-RL3 read the next inch number after the arrow   M-RL4 counted the marks, not the spaces
//   M-D5  read the next number up the scale           M-D6  wrote the taller bar, not how many more
//   M-PG1 counted the pictures, not what each stands for   M-TL1 counted a bundle of five as four
//   M-D7  counted one mark or picture twice
//   M-P4  added only one length and one width
//
// Pure module (SCC-01): no window, no DOM, no Math.random.

import { registerSkill } from '../contract.js';
import { chooseWrong, strings, step, clampSteps, countList } from './util.js';

const payloadOf = (q) => (q && q.cell && q.cell.payload) || {};
const sum = (a) => a.reduce((s, v) => s + v, 0);

/* ============================================================================ temperature */

function tempWrong(q) {
    const p = payloadOf(q);
    const t = Number(p.temp), every = Number(p.every) || 5;
    if (!Number.isFinite(t)) return null;
    const below = Math.floor(t / every) * every, above = below + every;
    const c = [];
    // M-TM1: read the nearest numbered line, not the small marks
    c.push({ value: Math.round(t / every) * every, misconception: 'M-TM1', explain: 'Read the nearest numbered line, not the small marks.' });
    // M-TM4: started at the number above the column and counted the marks the wrong way
    if (t !== below) c.push({ value: above + (above - t), misconception: 'M-TM4', explain: `Counted the small marks up from ${above}, not up from ${below}.` });
    // M-TM2: counted the numbered line as the first mark
    c.push({ value: t + 1, misconception: 'M-TM2', explain: 'Counted the numbered line as the first mark: one degree too many.' });
    return chooseWrong(q, c);
}

function tempSteps(q) {
    const p = payloadOf(q);
    const t = Number(p.temp), every = Number(p.every) || 5;
    const below = Math.floor(t / every) * every, k = t - below;
    return [
        step(k ? `The dark column stops between ${below} and ${below + every}.` : `The dark column stops at the ${t} line.`),
        k ? step(`Start at ${below}. Count up ${k} small mark${k > 1 ? 's' : ''}: ${countList(below + 1, t)}.`)
            : step(`${t} has a number on the scale.`),
        step(`Write ${t} in the box.`, [{ slot: 'answer', value: String(t) }]),
    ];
}

registerSkill('measurement:temperature', {
    strings: strings({
        iCan: 'I Can read a thermometer',
        instructionKey: 'read-thermometer',
        steps: ['Find the top of the dark column.', 'Find the numbered line just below it.', 'Count up the small marks, one degree each.'],
        say: 'The temperature is __ degrees.',
        sayValues: (q) => [Number(payloadOf(q).temp)],
    }),
    misconceptions: ['M-TM1', 'M-TM2', 'M-TM4'],
    workedSteps: (q) => clampSteps(tempSteps(q)),
    wrongAnswer: tempWrong,
});

/* ============================================================================ ruler */

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
/** A length in inches as a pupil writes it: 3, 1/2, 2 3/4 (halves never 2/4). */
export function inchText(x, res = 4) {
    const total = Math.round(x * res);
    const w = Math.floor(total / res), r = total % res;
    if (!r) return String(w);
    const g = gcd(r, res);
    const f = `${r / g}/${res / g}`;
    return w ? `${w} ${f}` : f;
}
const mixedSlots = (text) => {
    const m = /^\s*(\d+)?\s*(?:(\d+)\/(\d+))?\s*$/.exec(text) || [];
    return { w: m[1] || '', n: m[2] || '', d: m[3] || '' };
};

function rulerWrong(q) {
    const p = payloadOf(q);
    const meas = Number(p.meas), res = Number(p.res) || 1, len = Number(p.len) || 6;
    if (!Number.isFinite(meas)) return null;
    const c = [];
    // (M-RL4 may pass the ruler's end: 6 inches has 7 long marks, 0 to 6, and a pupil who counts
    // the marks, not the spaces, writes 7.)
    const add = (x, misconception, explain) => { if (x > 0 && (x <= len || misconception === 'M-RL4')) c.push({ x, misconception, explain }); };
    if (res === 4) add(meas + (meas % 1 === 0.75 ? -0.25 : 0.25), 'M-RL1', 'Read the small mark next to the arrow, not the one it points to.');
    if (res >= 2) add(meas + 0.5, 'M-RL2', 'Counted a half inch too far.');
    if (meas % 1) add(Math.ceil(meas), 'M-RL3', 'Read the next inch number after the arrow, not the one before it.');
    add(meas + 1, 'M-RL4', 'Counted the long marks, not the spaces between them: one too many.');
    return chooseWrong(q, c.map(({ x, misconception, explain }) => {
        const text = inchText(x, res === 1 ? 1 : 4);
        return res === 1
            ? { value: x, misconception, explain }
            : { value: text, misconception, explain, slot: mixedSlots(text).n ? 'n' : 'w', slots: mixedSlots(text) };
    }));
}

function rulerSteps(q) {
    const p = payloadOf(q);
    const meas = Number(p.meas), res = Number(p.res) || 1;
    const ans = inchText(meas, res === 1 ? 1 : 4);
    if (res === 1) {
        return [
            step('Find the arrow. Follow it down to the ruler.'),
            step(`The arrow points to the long mark with ${meas} under it.`),
            step(`Write ${meas}.`, [{ slot: 'answer', value: String(meas) }]),
        ];
    }
    const w = Math.floor(meas), k = Math.round((meas - w) * res);
    const parts = mixedSlots(ans);
    const marks = [];
    if (parts.w) marks.push({ slot: 'w', value: parts.w });
    if (parts.n) marks.push({ slot: 'n', value: parts.n }, { slot: 'd', value: parts.d });
    return [
        step(k ? `The arrow is after the ${w} inch mark.` : `The arrow points to the long mark with ${w} under it.`),
        k ? step(`Each small space is 1/${res} inch. Count ${k} space${k > 1 ? 's' : ''} after ${w}.`) : step('There are no small spaces to count.'),
        step(`Write ${ans}.`, marks),
    ];
}

const rulerStrings = (iCan) => strings({
    iCan,
    instructionKey: 'read-ruler',
    steps: ['Find the arrow. Follow it down to the ruler.', 'Find the inch number just before it.', 'Count the small spaces after that number.'],
    say: 'The arrow points to __ inches.',
    sayValues: (q) => { const p = payloadOf(q); return [inchText(Number(p.meas), Number(p.res) === 1 ? 1 : 4)]; },
});
registerSkill('measurement:reading_ruler', {
    strings: rulerStrings('I Can read a ruler to the inch'),
    misconceptions: ['M-RL1', 'M-RL2', 'M-RL3', 'M-RL4'],
    workedSteps: (q) => clampSteps(rulerSteps(q)),
    wrongAnswer: rulerWrong,
});
registerSkill('measurement:reading_ruler_hard', {
    strings: rulerStrings('I Can read a ruler to the quarter inch'),
    misconceptions: ['M-RL1', 'M-RL2', 'M-RL3', 'M-RL4'],
    workedSteps: (q) => clampSteps(rulerSteps(q)),
    wrongAnswer: rulerWrong,
});

/* ============================================================================ bar graph, pictograph, tally chart */

/** Which display an item draws: 'bar-graph', 'pictograph' or 'tally-chart'. */
const displayOf = (q) => (q && q.cell && q.cell.template) || 'bar-graph';

function barWrong(q) {
    const p = payloadOf(q);
    const a = p.ask || {};
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    const kind = displayOf(q);
    const step1 = Number(p.step) || 1;
    const scale = Number(p.scale) || 1;
    if (!vals.length) return null;
    const c = [];
    const long = kind === 'bar-graph' ? 'bar' : 'row';
    switch (a.kind) {
        case 'value': {
            const i = a.i;
            // M-D1: read the bar (row) next to the one asked
            if (i + 1 < vals.length) c.push({ value: vals[i + 1], misconception: 'M-D1', explain: `Read the ${long} next to the one asked.` });
            if (i > 0) c.push({ value: vals[i - 1], misconception: 'M-D1', explain: `Read the ${long} next to the one asked.` });
            // M-D5: read the next number up the scale (a bar graph)
            if (kind === 'bar-graph') c.push({ value: vals[i] + step1, misconception: 'M-D5', explain: 'Read the next number up the scale, past the end of the bar.' });
            // M-PG1: counted the pictures, not what each one stands for (a pictograph with a key past 1)
            if (kind === 'pictograph' && scale > 1) c.push({ value: vals[i] / scale, misconception: 'M-PG1', explain: `Counted the pictures, not ${scale} for each one.` });
            // M-TL1: counted a bundle of five as four (the line across not counted)
            // M-D7: counted one mark or picture twice
            if (kind !== 'bar-graph' && scale === 1) c.push({ value: vals[i] + 1, misconception: 'M-D7', explain: 'Counted one mark twice: one too many.' });
            if (kind === 'tally-chart' && vals[i] >= 5) c.push({ value: vals[i] - Math.floor(vals[i] / 5), misconception: 'M-TL1', explain: 'Did not count the line across: each bundle is 5, not 4.' });
            break;
        }
        case 'total': {
            const tot = sum(vals);
            c.push({ value: tot - vals[vals.length - 1], misconception: 'M-D2', explain: `Left the last ${long} out of the total.` });
            c.push({ value: tot - vals[0], misconception: 'M-D2', explain: `Left the first ${long} out of the total.` });
            break;
        }
        case 'most':
            // M-D3: picked the wrong end
            c.push({ value: cats[vals.indexOf(Math.min(...vals))], misconception: 'M-D3', explain: `Picked the shortest ${long}, not the longest.` });
            break;
        case 'least':
            c.push({ value: cats[vals.indexOf(Math.max(...vals))], misconception: 'M-D3', explain: `Picked the longest ${long}, not the shortest.` });
            break;
        case 'more': {
            const vi = vals[a.i], vj = vals[a.j];
            // M-D4: added the two; M-D6: wrote the bigger one, not how many more
            c.push({ value: vi + vj, misconception: 'M-D4', explain: `Added the two ${long}s instead of finding how many more.` });
            c.push({ value: Math.max(vi, vj), misconception: 'M-D6', explain: `Wrote the longer ${long}, not how many more it has.` });
            break;
        }
        default: break;
    }
    return chooseWrong(q, c);
}

/** How a pupil reads one value off the display, in words. */
function readText(q, i) {
    const p = payloadOf(q);
    const v = Number((p.values || [])[i]);
    const kind = displayOf(q);
    if (kind === 'pictograph') {
        const scale = Number(p.scale) || 1;
        return scale === 1 ? `Count the pictures: ${countList(1, v)}.` : `Count the pictures by ${scale}s: ${countList(scale, v, scale)}.`;
    }
    if (kind === 'tally-chart') {
        const b = Math.floor(v / 5), r = v % 5;
        if (!b) return `Count the marks: ${countList(1, v)}.`;
        return r ? `Count the bundles by 5s to ${b * 5}, then count on ${r}: ${v}.` : `Count the bundles by 5s: ${countList(5, v, 5)}.`;
    }
    return `Follow the end of the bar to the scale. It is at ${v}.`;
}

function barSteps(q) {
    const p = payloadOf(q);
    const a = p.ask || {};
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    const kind = displayOf(q);
    const unit = kind === 'bar-graph' ? 'bar' : 'row';
    const long = kind === 'bar-graph' && p.orientation !== 'horizontal' ? 'tallest' : 'longest';
    const mark = (v) => [{ slot: 'answer', value: String(v) }];
    switch (a.kind) {
        case 'value': return [
            step(`Find the ${unit} for ${cats[a.i]}.`),
            step(readText(q, a.i)),
            step(`Write ${vals[a.i]}.`, mark(vals[a.i])),
        ];
        case 'most': case 'least': {
            const v = a.kind === 'most' ? Math.max(...vals) : Math.min(...vals);
            const cat = cats[vals.indexOf(v)];
            return [
                step(`Look at all the ${unit}s.`),
                step(`The ${a.kind === 'most' ? long : 'shortest'} ${unit} is ${cat}.`),
                step(`Check the box for ${cat}.`, mark(cat)),
            ];
        }
        case 'more': {
            const vi = vals[a.i], vj = vals[a.j];
            return [
                step(`${cats[a.i]} has ${vi}. ${cats[a.j]} has ${vj}.`),
                step(`Subtract: ${vi} − ${vj} = ${vi - vj}.`),
                step(`Write ${vi - vj}.`, mark(vi - vj)),
            ];
        }
        case 'total': {
            const tot = sum(vals);
            return [
                step(`Read every ${unit}: ${vals.join(', ')}.`),
                step(`Add: ${vals.join(' + ')} = ${tot}.`),
                step(`Write ${tot}.`, mark(tot)),
            ];
        }
        default: return [step('Read the title.'), step(`Find the ${unit}.`), step(`Write ${p.answer}.`, mark(p.answer))];
    }
}

function barSay(q) {
    const p = payloadOf(q);
    const a = p.ask || {};
    const cats = (p.categories || []).map(String);
    const vals = (p.values || []).map(Number);
    switch (a.kind) {
        case 'value': return `${cats[a.i]} has ${vals[a.i]}.`;
        case 'most': return `${p.answer} has the most.`;
        case 'least': return `${p.answer} has the least.`;
        case 'more': return `${cats[a.i]} has ${p.answer} more than ${cats[a.j]}.`;
        case 'total': return `They make ${p.answer} in all.`;
        default: return `The answer is ${p.answer}.`;
    }
}

const DATA_MISCONCEPTIONS = ['M-D1', 'M-D2', 'M-D3', 'M-D4', 'M-D5', 'M-D6'];
const dataProvider = (iCan, instructionKey, steps, extra = []) => ({
    strings: strings({ iCan, instructionKey, steps, say: 'The graph shows __.', sayValues: barSay }),
    misconceptions: DATA_MISCONCEPTIONS.concat(extra),
    workedSteps: (q) => clampSteps(barSteps(q)),
    wrongAnswer: barWrong,
});
const BAR_STEPS = ['Read the title and the words on each side.', 'Find the bar the question names.', 'Follow the end of the bar to the scale.'];
registerSkill('graphs:bar_graph', dataProvider('I Can read a bar graph', 'graph', BAR_STEPS));
registerSkill('measurement:bar_graph_intro', dataProvider('I Can read a bar graph', 'graph', BAR_STEPS));
registerSkill('graphs:pictograph', dataProvider('I Can read a pictograph', 'graph',
    ['Read the key: what one picture stands for.', 'Find the row the question names.', 'Count the pictures by the key number.'], ['M-PG1']));
registerSkill('measurement:pictograph_intro', dataProvider('I Can read a picture graph', 'graph',
    ['Read the title and the words at the top.', 'Find the row the question names.', 'Count the pictures. One picture is one.'], ['M-D7']));
registerSkill('graphs:tally_chart', dataProvider('I Can read a tally chart', 'tally',
    ['A bundle with a line across is 5.', 'Count the bundles by 5s.', 'Count on the single marks.'], ['M-TL1', 'M-D7']));

/* ============================================================================ perimeter */

function perimeterWrong(q) {
    const p = payloadOf(q);
    const sides = (p.sides || []).map(Number);
    if (!sides.length) return null;
    const show = p.show || sides.map(() => true);
    const labelled = sides.filter((_, i) => show[i]);
    const c = [];
    // M-P1: added only the sides with a number on them
    if (labelled.length < sides.length) c.push({ value: sum(labelled), misconception: 'M-P1', explain: 'Added only the sides with numbers on them.' });
    // M-P2: multiplied length by width, found the area
    if (p.shape !== 'triangle') c.push({ value: sides[0] * sides[1], misconception: 'M-P2', explain: 'Multiplied: found the area, not the distance around.' });
    // M-P4: one length and one width
    if (p.shape !== 'triangle' && labelled.length === sides.length) c.push({ value: sides[0] + sides[1], misconception: 'M-P4', explain: 'Added one length and one width, not all four sides.' });
    // M-P3: left one side out
    c.push({ value: sum(sides) - sides[sides.length - 1], misconception: 'M-P3', explain: 'Left one side out.' });
    return chooseWrong(q, c);
}

function perimeterSteps(q) {
    const p = payloadOf(q);
    const sides = (p.sides || []).map(Number);
    const show = p.show || sides.map(() => true);
    const tot = sum(sides);
    const out = [];
    if (show.some((v) => !v)) out.push(step('A side with no number is as long as the side opposite it.'));
    out.push(step(`Go all the way round: ${sides.length} sides, ${sides.join(', ')}.`));
    out.push(step(`Add: ${sides.join(' + ')} = ${tot}.`));
    out.push(step(`Write ${tot} in the box.`, [{ slot: 'answer', value: String(tot) }]));
    return out;
}

registerSkill('area_perimeter:perimeter_intro', {
    strings: strings({
        iCan: 'I Can find the perimeter by adding the sides',
        instructionKey: 'add-sides',
        steps: ['Start at one corner. Go all the way round.', 'Find the length of every side.', 'Add all the sides.'],
        say: 'The perimeter is __.',
        sayValues: (q) => { const p = payloadOf(q); return [`${p.ans} ${p.unit || ''}`.trim()]; },
    }),
    misconceptions: ['M-P1', 'M-P2', 'M-P3', 'M-P4'],
    workedSteps: (q) => clampSteps(perimeterSteps(q)),
    wrongAnswer: perimeterWrong,
});

/** The skills this module gives a real provider (the error-analysis lane's legacy-wrong.js skips them). */
export const FIGURE_PROVIDER_IDS = Object.freeze([
    'measurement:temperature', 'measurement:reading_ruler', 'measurement:reading_ruler_hard',
    'graphs:bar_graph', 'measurement:bar_graph_intro', 'graphs:pictograph', 'measurement:pictograph_intro', 'graphs:tally_chart',
    'area_perimeter:perimeter_intro',
]);
