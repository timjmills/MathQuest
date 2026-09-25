// js/modules/sheet/roles/index.js
// The barrel for page-role composers.
//
// A page role turns configured skills into a PagePlan (plain data), and the plan is rendered
// once for the pupil and once for the key. Nothing here renders a page a second way: the
// facsimile answer key of `design/PAGE_TYPES.md` 7.1 only holds if both come from one plan.
//
// Import path for the rest of the app: `js/modules/sheet/roles/index.js`.
// Pure modules (SCC-01): no `window`, no DOM, no `Math.random`.
//
// ROLES PRESENT TODAY
//   answer-key       the base companion of every role, for every skill (PT-KEY-7, PT-CMP-5)
//   independent      the Independent page (PAGE_TYPES 2.4)               roles/independent.js
//   more-practice    More Practice A to J (2.5)                          roles/more-practice.js
//                    both composed by roles/practice.js over sheet/layout.js + sheet/paginate.js
//   opener           2.1   scripted-model 2.2   guided 2.3   error-analysis 2.7   review 2.8
//   test (A / B)     2.9   pre-skill-check 2.10  word-problems 3.7   fact-rows 4.1
//   fact-probe       4.2   mixed-practice 5.2    true-false 6.1   reason-it 6.2   stretch 6.3
//                    each over the shared vocabulary of roles/compose.js, and each speaking the
//                    host protocol documented there (sources / prepare / measureCols / counts /
//                    plan). `renderAnswerKey(plan)` works for every one of them without the
//                    role opting in - that is the whole point of PT-KEY-7.
//
// Still owed: the lesson packet (a bundle of these), the Computation and Visual grids, Daily 4,
// the Daily spiral and the Sub-skill / decision page.

export {
    /* page ids and header marking (AK-3, HD-5, PT-KEY-3) */
    KEY_ID_LINE, keyTab, keyHeader, keyFooterRight, markKeyName,
    /* drawing the answers in (AK-2) */
    fillSlots, workBox, workingHtml, keyStamp, answerWords,
    /* the render pair - ONE plan, two states (AK-1, AK-4) */
    renderPages, renderSource, renderAnswerKey, renderPageAndKey, answerKeyPlan,
    /* companions and lints (PT-KEY-1, PT-KEY-5, PT-CMP-5) */
    answerListRows, skillItemMap, keyCoverage,
} from './answer-key.js';

/* the practice roles (P7.2) */
export {
    SHEET_ENGINE_CSS, STRAND_BY_CATEGORY, levelLine, skillWords, sectionInstructionKey, instructionHtml,
    estimateTitleLines, letterSeed, composePractice, decorate, renderPlan,
} from './practice.js';
export { plan as independentPlan } from './independent.js';
export { plan as morePracticePlan } from './more-practice.js';

/* the P7.2b roles: each a module speaking the host protocol of compose.js */
import * as opener from './opener.js';
import * as scriptedModel from './scripted-model.js';
import * as guided from './guided.js';
import * as errorAnalysis from './error-analysis.js';
import * as review from './review.js';
import * as test from './test.js';
import * as preSkillCheck from './pre-skill-check.js';
import * as wordProblems from './word-problems.js';
import * as factRows from './fact-rows.js';
import * as factProbe from './fact-probe.js';
import * as mixedPractice from './mixed-practice.js';
import * as trueFalse from './true-false.js';
import * as reasonIt from './reason-it.js';
import * as stretch from './stretch.js';

/** role id -> module. The host (`print-sheet.js` buildSheet) routes every id here. */
export const ROLE_MODULES = Object.freeze({
    opener, 'scripted-model': scriptedModel, guided, 'error-analysis': errorAnalysis, review, test,
    'pre-skill-check': preSkillCheck, 'word-problems': wordProblems, 'fact-rows': factRows,
    'fact-probe': factProbe, 'mixed-practice': mixedPractice, 'true-false': trueFalse,
    'reason-it': reasonIt, stretch,
});

/** The names the print screens use for some roles. */
export const ROLE_ALIASES = Object.freeze({
    'lesson-opener': 'opener', model: 'scripted-model', 'pre-skill': 'pre-skill-check', mixed: 'mixed-practice',
    reason: 'reason-it', 'check-it': 'error-analysis', 'test-a': 'test', 'test-b': 'test',
});

/** Role ids this build carries. A role is added here the day its composer lands. */
export const ROLE_IDS = ['answer-key', 'independent', 'more-practice', ...Object.keys(ROLE_MODULES)];
