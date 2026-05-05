// literacy-question-render.js — Literacy Quest question renderer.
//
// Dispatches to the correct widget module based on q.question_type.
// Mirrors the Math Quest dispatcher pattern in generate-question.js.
//
// Exports:
//   renderLiteracyQuestion(q, container) — mounts the widget for question q
//   checkLiteracyAnswer(q, container)    — returns { correct, submitted, feedback }
//   LITERACY_WIDGETS                     — widget map (for tests)

// Stage 1 widgets
import { renderMcText,          checkMcText }          from './widgets/mc-text.js';
import { renderMcImage,         checkMcImage }         from './widgets/mc-image.js';
import { renderMcAudio,         checkMcAudio }         from './widgets/mc-audio.js';
import { renderMcMultiSelect,   checkMcMultiSelect }   from './widgets/mc-multi-select.js';
import { renderTapHotspot,      checkTapHotspot }      from './widgets/tap-hotspot.js';
import { renderDndLinked,       checkDndLinked }       from './widgets/dnd-linked.js';
import { renderFibAuto,         checkFibAuto }         from './widgets/fib-auto.js';
import { renderTwoButtonBinary, checkTwoButtonBinary } from './widgets/two-button-binary.js';

// Stage 2 widgets — Wave 3
import { renderVoiceMemo,       checkVoiceMemo }       from './widgets/voice-memo.js';
import { renderWordChain,       checkWordChain }       from './widgets/word-chain.js';
import { renderSoundBox,        checkSoundBox }        from './widgets/sound-box.js';
import { renderLetterTileSpell, checkLetterTileSpell } from './widgets/letter-tile-spell.js';
import { renderSortIntoBins,    checkSortIntoBins }    from './widgets/sort-into-bins.js';
import { renderMatchPairs,      checkMatchPairs }      from './widgets/match-pairs.js';
import { renderWordTagger,      checkWordTagger }      from './widgets/word-tagger.js';
import { renderHotTextPassage,  checkHotTextPassage }  from './widgets/hot-text-passage.js';
import { renderDropDownInline,  checkDropDownInline }  from './widgets/drop-down-inline.js';
import { renderSentenceBuild,   checkSentenceBuild }   from './widgets/sentence-build.js';
import { renderSequenceEvents,  checkSequenceEvents }  from './widgets/sequence-events.js';

// Stage 2 widgets — Wave 4 (ETC-derived)
import { renderPictureMatchRow,       checkPictureMatchRow }       from './widgets/picture-match-row.js';
import { renderWordPictureChoice,     checkWordPictureChoice }     from './widgets/word-picture-choice.js';
import { renderWriteFromPicture,      checkWriteFromPicture }      from './widgets/write-from-picture.js';
import { renderColumnLetterBuild,     checkColumnLetterBuild }     from './widgets/column-letter-build.js';
import { renderXStrikethroughChoice,  checkXStrikethroughChoice }  from './widgets/x-strikethrough-choice.js';
import { renderBijectiveJoin,         checkBijectiveJoin }         from './widgets/bijective-join.js';

// Spectrum/MAP weekly comprehension staple — tap-the-feature mechanic
import { renderTextFeatureTag,        checkTextFeatureTag }        from './widgets/text-feature-tag.js';

// ─── Widget registry ──────────────────────────────────────────────────────────
//
// Keys are the exact question_type identifiers used in Question objects and
// SkillAtom.question_types arrays (kebab-case per QUESTION_TYPES.md §11).
// Each entry exposes a render + check pair following the Math Quest widget
// contract: render(q, container) → void; check(q, container) → { correct, submitted, feedback }.

export const LITERACY_WIDGETS = Object.freeze({
    // Stage 1 — minimum viable interaction set
    'mc-text':            { render: renderMcText,          check: checkMcText          },
    'mc-image':           { render: renderMcImage,         check: checkMcImage         },
    'mc-audio':           { render: renderMcAudio,         check: checkMcAudio         },
    'mc-multi-select':    { render: renderMcMultiSelect,   check: checkMcMultiSelect   },
    'tap-hotspot':        { render: renderTapHotspot,      check: checkTapHotspot      },
    'dnd-linked':         { render: renderDndLinked,       check: checkDndLinked       },
    'fib-auto':           { render: renderFibAuto,         check: checkFibAuto         },
    'two-button-binary':  { render: renderTwoButtonBinary, check: checkTwoButtonBinary },
    // Stage 2 — differentiation widgets
    'voice-memo':         { render: renderVoiceMemo,       check: checkVoiceMemo       },
    'word-chain':         { render: renderWordChain,       check: checkWordChain       },
    'sound-box':          { render: renderSoundBox,        check: checkSoundBox        },
    'letter-tile-spell':  { render: renderLetterTileSpell, check: checkLetterTileSpell },
    'sort-into-bins':     { render: renderSortIntoBins,    check: checkSortIntoBins    },
    'match-pairs':        { render: renderMatchPairs,      check: checkMatchPairs      },
    'word-tagger':        { render: renderWordTagger,      check: checkWordTagger      },
    'hot-text-word':      { render: renderHotTextPassage,  check: checkHotTextPassage  }, // shared widget; q.granularity controls
    'hot-text-sentence':  { render: renderHotTextPassage,  check: checkHotTextPassage  },
    'hot-text-paragraph': { render: renderHotTextPassage,  check: checkHotTextPassage  },
    'drop-down-inline':   { render: renderDropDownInline,  check: checkDropDownInline  },
    'sentence-build':     { render: renderSentenceBuild,   check: checkSentenceBuild   },
    'sequence-events':    { render: renderSequenceEvents,  check: checkSequenceEvents  },
    // Stage 2 — Wave 4 (ETC-derived)
    'picture-match-row':      { render: renderPictureMatchRow,      check: checkPictureMatchRow      },
    'word-picture-choice':    { render: renderWordPictureChoice,    check: checkWordPictureChoice    },
    'write-from-picture':     { render: renderWriteFromPicture,     check: checkWriteFromPicture     },
    'column-letter-build':    { render: renderColumnLetterBuild,    check: checkColumnLetterBuild    },
    'x-strikethrough-choice': { render: renderXStrikethroughChoice, check: checkXStrikethroughChoice },
    // Bijective two-column join (every left pairs with exactly one right)
    'syllable-join':          { render: renderBijectiveJoin,         check: checkBijectiveJoin         },
    'compound-builder':       { render: renderBijectiveJoin,         check: checkBijectiveJoin         },
    // Spectrum/MAP weekly comprehension staple — tap a marked-up text feature
    'text-feature-tag':       { render: renderTextFeatureTag,        check: checkTextFeatureTag        },
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

    // Graceful coming-soon intercept — no widget needed, no console.error.
    if (q.question_type === '__coming_soon__') {
        import('./coming-soon.js').then(m => {
            m.renderComingSoonCard(q.skill_atom, container);
        });
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

    // Coming-soon questions are auto-acknowledged so the deck can advance.
    if (q.question_type === '__coming_soon__') {
        return { correct: true, submitted: 'coming-soon-acknowledged', feedback: 'Practice coming soon!' };
    }

    const w = LITERACY_WIDGETS[q.question_type];
    if (!w) {
        return { correct: false, submitted: null, feedback: `No widget for type: ${q.question_type}` };
    }

    return w.check(q, container);
}
