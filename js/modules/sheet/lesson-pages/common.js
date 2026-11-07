// js/modules/sheet/lesson-pages/common.js
// LESSON PAGE BUILDER "common" (design/LESSON_LIBRARY_PLAN.md §8c): the pieces every lesson page shares - the band
// arithmetic, the item signatures, the step groups, names and numerals.
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz paper; the skill
// supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved verbatim from roles/lesson.js (lessons-phase0 0.5: the
// sample lessons and the detailed lessons render byte-identical). Pure module (SCC-01): no window, no DOM, no Math.random.

import { operandsOf } from '../roles/compose.js';
import { workedStepsOf } from '../anchors.js';
import { iconForText } from '../lesson-icons.js';

export const PT_MM = 25.4 / 72;

/** The lesson data's other-example keys, in chart order. */
export const EXAMPLE_KEYS = ['second', 'third', 'fourth'];

/**
 * Does this across equation cell change form at `cols` - its answer line going under the sentence
 * (cells/equation.js, a column too narrow for the line beside)? Read from its measurement: the
 * cell is markedly taller at `cols` than at one column. A page that keeps one across look (critic
 * R3 N-2 / R-3) does not take that column count.
 */
export const reflowsAt = (it, cols) => {
    const m = (it && it.measured) || {};
    const a = m[1], b = m[cols];
    return !!it && it.template === 'equation' && !!a && !!b && Number.isFinite(a.hMm) && Number.isFinite(b.hMm) && b.hMm > a.hMm * 1.25;
};

/** CL-8: the least space (mm) a problem keeps from its cell's side borders. */
export const CL8_MM = 3;

export const warmPools = (input) => ((input.pools || []).map((p) => p.id)).filter((id) => /^w\d$/.test(id));

export const sigOf = (it) => {
    const q = (it && it.q) || {};
    return `${String(q.text || '')}|${JSON.stringify(q.ans)}|${JSON.stringify((q.cell && q.cell.payload) || {})}`;
};
export const digitsOfOps = (it) => operandsOf((it && it.q) || {}).map((v) => String(Math.abs(Math.trunc(v))).length).join(',');

/**
 * The step groups of the Model: one state per worked step; a closing check (a step that marks
 * nothing, after the last mark) rides with the state before it; at most 4 states.
 */
export function stateGroups(steps) {
    const marked = (i) => ((steps[i] && steps[i].marks) || []).length > 0;
    const lastMark = steps.map((_, i) => i).filter(marked).pop();
    let groups = [];
    steps.forEach((_, i) => {
        if (groups.length && lastMark !== undefined && i > lastMark && !marked(i)) groups[groups.length - 1].push(i);
        else groups.push([i]);
    });
    while (groups.length > 4) {
        // Merge the shortest adjacent pair whose first group marks nothing (a "look" step joins
        // the step it prepares).
        let best = 0;
        for (let i = 0; i < groups.length - 1; i++) if (!groups[i].some(marked)) { best = i; break; }
        groups.splice(best, 2, groups[best].concat(groups[best + 1]));
    }
    groups = groups.filter((g) => g.length);
    return groups.map((g) => ({ steps: g, marks: g.flatMap((i) => (steps[i] && steps[i].marks) || []) }));
}

/**
 * The lesson's own step names and icons, aligned with the example's worked steps: step n of the
 * lesson data IS worked step n (the data is written that way); a skill without lesson data takes
 * the provider's words and the icon of their first verb.
 */
/** An item's worked steps with their numbers masked: two items of one kind work the same steps. */
export const kindOf = (it) => workedStepsOf(it).map((s) => String(s.text || '').replace(/^(Write the answer)\b.*$/, '$1').replace(/\d[\d,.]*/g, '#')).join('|');
/** The same, with the story's key words dropped too: the same sign(s) and the same moves. */
export const opKindOf = (it) => workedStepsOf(it).map((s) => generalStep(s.text)).filter((t) => !/^Look at the key words/.test(t)).join('|').replace(/\d[\d,.]*/g, '#');

/**
 * A worked step said for ANY problem of the kind (the Steps beside the Guided cells and the
 * practice pages' strip): the example's own numbers, key words and answer stay on the chart; a
 * Steps list beside another problem never reads "Write 34 and 51" next to 54 and 11.
 */
export function generalStep(text) {
    const t = String(text || '');
    const pre = (t.match(/^Step \d+: /) || [''])[0];
    const body = t.slice(pre.length);
    if (/^Look at the key words?\b/i.test(body)) return `${pre}Look at the key words.`;
    if (!/\d/.test(body)) return t;
    if (/^Write .* in the boxes\.?$/i.test(body)) return `${pre}Write the numbers in the boxes.`;
    if (/^Write the answer\b/i.test(body)) return `${pre}Write the answer and its label word.`;
    if (/^[\d,.\s]+[-+×÷−*/][\d,.\s]+=\s*[\d,.]+(\s*R\s*\d+)?\.?$/.test(body)) return `${pre}Work it out.`;
    return t;
}

export function namedSteps(steps, data, { general = false } = {}) {
    const own = data && Array.isArray(data.steps) && data.steps.length === steps.length ? data.steps : null;
    // The provider's words in the lesson's own terms (`words`: [{from, to}] regex rewrites).
    const rules = data && Array.isArray(data.words) ? data.words : [];
    const say = (t) => rules.reduce((w, r) => w.replace(new RegExp(r.from), r.to), String(t || ''));
    return steps.map((s, i) => ({
        name: own ? own[i].text : general ? generalStep(s.text) : s.text,
        icon: own ? (own[i].icon || iconForText(own[i].text)) : iconForText(s.text),
        words: own ? say(s.text) : '',
        // Lessons r3: a rule the step needs for another case ("0 tens? Leave it empty.").
        note: data && data.notes && data.notes[i] ? String(data.notes[i]) : '',
    }));
}

/** A step marker: the outlined circle and its numeral in the lesson accent (INK-30, BD-4). */
export const stepMarker = (n) => `<em class="mq-lnum" data-mq-accent>${n}</em>`;

/** A band of a banded page, with its height. */
export const band = (h, section, grow = null) => ({ h, sections: Array.isArray(section) ? section : [section], grow });
/** The tallest measured cell of a set at `cols` (mm, + 1 for the grid rules); 0 when unmeasured. */
export const hAt = (items, cols) => Math.max(0, ...items.map((it) => (it && it.measured && it.measured[cols] && Number.isFinite(it.measured[cols].hMm) ? it.measured[cols].hMm + 1 : 0)));
/** Do these items fit a cell as wide as a `cols`-column page's (measured; a word problem never shares)? */
export const fitsWidth = (items, cols) => items.every((it) => {
    const m = it.measured && it.measured[cols];
    return (m ? m.fits !== false : true) && !(cols > 1 && (it.fclass === 'word' || it.fclass === 'wide'));
});
export const hOf = (x, cols) => (x && x.measured && x.measured[cols] && Number.isFinite(x.measured[cols].hMm) ? x.measured[cols].hMm + 1 : 0);

export default { PT_MM, EXAMPLE_KEYS, reflowsAt, CL8_MM, warmPools, sigOf, digitsOfOps, stateGroups, kindOf, generalStep, namedSteps, stepMarker, band, hAt, fitsWidth, hOf };
