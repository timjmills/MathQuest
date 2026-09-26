// js/modules/sheet/lesson-pages/common.js
// LESSON PAGE BUILDER "common" (design/LESSON_LIBRARY_PLAN.md §8c): the pieces every lesson page shares - the pools and
// their packet keys, the band arithmetic, the step names and numerals.
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz
// paper; the skill supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved from roles/lesson.js
// (phase 0: the sample lessons render byte-identical). Pure module (SCC-01).

import { poolItems, operandsOf } from '../roles/compose.js';
import { itemKey } from '../lesson-rules.js';
import { iconForText } from '../lesson-icons.js';

export const PT_MM = 25.4 / 72;

/** The lesson data's other-example keys, in chart order. */
export const EXAMPLE_KEYS = ['second', 'third', 'fourth'];

/** An item's packet key (sheet/lesson-rules.js itemKey: a sum and its turnaround are one item). */
export const keyOfItem = (it) => itemKey((it && it.q && it.q.text) || '', it && it.q ? it.q.ans : '', it && it.q && it.q.cell && it.q.cell.payload ? it.q.cell.payload.n : undefined);

/**
 * The lesson skill's pool without an item the Warm-up already asks (LR-5, lessons r5: a number-bond
 * Warm-up item "6 + 3 = ?" came back as a Guided fact). The chart, the Guided and the Independent
 * cells all draw from it.
 */
export function mainPool(input) {
    const main = poolItems(input, 'main');
    if (((input.lesson && input.lesson.rulesOff) || []).includes('LR-5')) return main;
    const warm = new Set(warmPools(input).flatMap((id) => poolItems(input, id)).map(keyOfItem));
    return warm.size ? main.filter((it) => !warm.has(keyOfItem(it))) : main;
}

export const warmPools = (input) => ((input.pools || []).map((p) => p.id)).filter((id) => /^w\d$/.test(id));

export const sigOf = (it) => {
    const q = (it && it.q) || {};
    return `${String(q.text || '')}|${JSON.stringify(q.ans)}|${JSON.stringify((q.cell && q.cell.payload) || {})}`;
};

export const digitsOfOps = (it) => operandsOf((it && it.q) || {}).map((v) => String(Math.abs(Math.trunc(v))).length).join(',');

/** An item as the lesson rules read it (sheet/lesson-rules.js): words, answer, numbers, case data. */
export function plainItem(it) {
    const q = (it && it.q) || {};
    const p = (q.cell && q.cell.payload) || {};
    return { skill: it.skill || `${q.categoryId || ''}:${q.skillId || ''}`, text: String(q.text || ''), ans: q.ans, ops: operandsOf(q), kind: p.kind, n: p.n, place: p.place };
}

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
export function namedSteps(steps, data) {
    const own = data && Array.isArray(data.steps) && data.steps.length === steps.length ? data.steps : null;
    // The provider's words in the lesson's own terms (`words`: [{from, to}] regex rewrites).
    const rules = data && Array.isArray(data.words) ? data.words : [];
    const say = (t) => rules.reduce((w, r) => w.replace(new RegExp(r.from), r.to), String(t || ''));
    return steps.map((s, i) => ({
        name: own ? own[i].text : s.text,
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

export default { PT_MM, EXAMPLE_KEYS, keyOfItem, mainPool, warmPools, sigOf, digitsOfOps, plainItem, stateGroups, namedSteps, stepMarker, band, hAt, fitsWidth, hOf };
