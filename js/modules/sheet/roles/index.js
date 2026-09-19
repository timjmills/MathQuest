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
//   answer-key   the base companion of every role, for every skill (PT-KEY-7, PT-CMP-5)
//
// Every other role (opener, scripted model, guided, independent, more practice, daily and
// mixed review, test A/B, error analysis, reasoning, stretch) lands beside this file and
// exports a `plan(...)` that returns a PagePlan. `renderAnswerKey(plan)` then works for it
// without the role opting in - that is the whole point of PT-KEY-7.

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

/** Role ids this build carries. A role is added here the day its composer lands. */
export const ROLE_IDS = ['answer-key'];
