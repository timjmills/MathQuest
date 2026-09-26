// js/modules/sheet/lesson-pages/practice.js
// LESSON PAGE BUILDER "practice" (design/LESSON_LIBRARY_PLAN.md §8c): the lesson PRACTICE page - the skill's massed
// practice on the Independent frame with the chart's step strip (one frame, rows sized to their
// content; min-size floors, LR-16), and the strip itself.
// Shared by the lesson packet and, through the role lane's adapters, by any skill's Practice / Quiz
// paper; the skill supplies the data (design/SKILL_CELL_CONTRACT.md §3.9). Moved from roles/lesson.js
// (phase 0: the sample lessons render byte-identical). Pure module (SCC-01).

import { resolveCtx } from '../index.js';
import { stepIcon } from '../lesson-icons.js';
import { esc } from '../roles/compose.js';
import { namedSteps, stepMarker } from './common.js';

/**
 * The step reminder of a practice page: the chart's numerals, icons and step names in one strip,
 * so every later problem points back to the anchor chart. Carries its own styles (a practice page
 * does not load the lesson stylesheet).
 */
export function stripHtml(data, steps, size = 'L') {
    const named = namedSteps(steps, data);
    if (!named.length) return '';
    return `<div class="mq-lstrip" data-mq-lesson-strip><b class="mq-lstrip-l">Steps:</b><ol>${named.map((s, i) => `<li>${stepMarker(i + 1)}${stepIcon(s.icon, size)}<span>${esc(s.name)}</span></li>`).join('')}</ol></div>`;
}

/** The strip as a host-shaped item, so the host measures its height at the full width. */
export function stripItem(data, steps) {
    return {
        q: null, render: (c) => stripHtml(data, steps, c.size), key: { value: '', display: '', slots: {} }, drawsAnswer: true, visual: false,
        cellCls: 'mq-lstripcell', footprint: { wMm: 186, hMm: null, measure: true, maxCols: 1 }, fclass: 'wide', measureLevel: 1,
        template: 'lesson-strip', skill: '', pool: 'extra', lessonStrip: true,
    };
}

/**
 * The practice section of a lesson packet (moved from print-sheet.js buildLesson, phase 0).
 * One-line answers (facts, rounding): the engine fills the page (PAGE FILL, DN-1) - one frame, no
 * row gaps, because the count is the page's own. Taller problems: 12.1's six a page, 2 x 3, each
 * cell with its working space and Check line. Lessons r2-r3: a rounding cell ("27 -> ___") is
 * short and narrow: M prints three across like L, and the lesson's own 15 at every size (never
 * 12.1's 16 ceiling passed).
 */
export function practiceSection({ skill, facts, rounding }) {
    return facts ? { skills: [skill], pages: 0, noCap: true, dense: rounding ? { S: 15, M: 15, L: 15 } : { S: 16, M: 16, L: 15 } } : { skills: [skill], count: 0, columns: 2, noCap: true };
}

/** Taller problems: 12.1's six a page (2 x 3) at every size (the shapes a practice page tries). */
export const PRACTICE_STACK_SHAPES = Object.freeze([[6, 2]]);

/**
 * The buildSheet request of a lesson practice page (moved from print-sheet.js buildLesson):
 * Independent role, the packet's frame (`common`), the step strip when `withStrip` (at L type the
 * strip's words are a point bigger: 2 mm more for it).
 */
export function practiceRequest({ common, size, practiceSize, lessonNo, section, facts, pages, withStrip, shape, seed, strip, stripH, stripHtml: html }) {
    return Object.assign({}, common, {
        size: practiceSize,
        role: 'independent', tabId: `Practice ${lessonNo}`,
        sections: [facts ? Object.assign({}, section, { pages }) : Object.assign({}, section, { count: shape[0] * pages, columns: shape[1] })],
        seed,
        stepStrip: withStrip && html ? (practiceSize === size ? { html, hMm: stripH }
            : { html: strip.render(resolveCtx({ size: practiceSize, look: 'ican', mode: 'print' })), hMm: stripH + 2 }) : undefined,
    });
}

export default { stripHtml, stripItem, practiceSection, PRACTICE_STACK_SHAPES, practiceRequest };
