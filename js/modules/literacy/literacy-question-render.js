// literacy-question-render.js — Literacy Quest question renderer.
//
// Dispatches to the correct widget module based on q.question_type.
// Mirrors the Math Quest dispatcher pattern in generate-question.js.
//
// Exports:
//   renderLiteracyQuestion(q, container) — mounts the widget for question q
//   checkLiteracyAnswer(q, container)    — returns { correct, submitted, feedback }
//   LITERACY_WIDGETS                     — widget map (for tests)

import { renderMcText,         checkMcText }         from './widgets/mc-text.js';
import { renderMcImage,        checkMcImage }        from './widgets/mc-image.js';
import { renderMcAudio,        checkMcAudio }        from './widgets/mc-audio.js';
import { renderMcMultiSelect,  checkMcMultiSelect }  from './widgets/mc-multi-select.js';
import { renderTapHotspot,     checkTapHotspot }     from './widgets/tap-hotspot.js';
import { renderDndLinked,      checkDndLinked }      from './widgets/dnd-linked.js';
import { renderFibAuto,        checkFibAuto }        from './widgets/fib-auto.js';
import { renderTwoButtonBinary, checkTwoButtonBinary } from './widgets/two-button-binary.js';

// ─── Widget registry ──────────────────────────────────────────────────────────
//
// Keys are the exact question_type identifiers used in Question objects and
// SkillAtom.question_types arrays (kebab-case per QUESTION_TYPES.md §11).
// Each entry exposes a render + check pair following the Math Quest widget
// contract: render(q, container) → void; check(q, container) → { correct, submitted, feedback }.

export const LITERACY_WIDGETS = Object.freeze({
    'mc-text':            { render: renderMcText,          check: checkMcText          },
    'mc-image':           { render: renderMcImage,         check: checkMcImage         },
    'mc-audio':           { render: renderMcAudio,         check: checkMcAudio         },
    'mc-multi-select':    { render: renderMcMultiSelect,   check: checkMcMultiSelect   },
    'tap-hotspot':        { render: renderTapHotspot,      check: checkTapHotspot      },
    'dnd-linked':         { render: renderDndLinked,       check: checkDndLinked       },
    'fib-auto':           { render: renderFibAuto,         check: checkFibAuto         },
    'two-button-binary':  { render: renderTwoButtonBinary, check: checkTwoButtonBinary },
});

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Mount the correct widget for a Literacy Quest question.
 *
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Question} q
 * @param {HTMLElement} container  — DOM element to render into (cleared first)
 */
export function renderLiteracyQuestion(q, container) {
    if (!container) return;
    container.innerHTML = '';            // clear previous widget
    if (!q) {
        container.innerHTML = '<div class="lq-error">No question provided.</div>';
        return;
    }

    const w = LITERACY_WIDGETS[q.question_type];
    if (!w) {
        container.innerHTML =
            `<div class="lq-error">No widget for question type: ${q.question_type}</div>`;
        return;
    }

    // Clear any previous answer stored by the outgoing widget
    container._lqLastResult = null;

    w.render(q, container);
}

/**
 * Check the current answer state of the mounted widget.
 *
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Question} q
 * @param {HTMLElement} container
 * @returns {{ correct: boolean, submitted: any, feedback: string }}
 */
export function checkLiteracyAnswer(q, container) {
    if (!container || !q) {
        return { correct: false, submitted: null, feedback: 'No question or container.' };
    }

    const w = LITERACY_WIDGETS[q.question_type];
    if (!w) {
        return { correct: false, submitted: null, feedback: `No widget for type: ${q.question_type}` };
    }

    return w.check(q, container);
}
