Lane: lf-algebra
Title: Lessons-first wave 1: the patterns and algebra skills of the CCSS BUILD lessons
Session: session_013pHDnKpNaW4JzSJ8QNo1H7
Branch: claude/sweet-newton-c8wrv1-lf-algebra
Owner of files: gen-algebraic.js, gen-function-table.js, gen-patterns-notice.js (new), sheet/cells/{function-table,growing-pattern}.js, sheet/providers/{function-table,patterns}.js, design/cards/{function-table,patterns}/
State: building
Updated: 2026-11-07
Builder profile: mq-opus-medium
Critic rounds: 0, none

## Now
- Re-aimed by the owner (2026-11-07, decision 1): only the 64 CCSS BUILD lessons, in the order of
  `data/curriculum/ccss-build-lessons.json`. This lane's lessons, in order: #3 Patterns on the multiplication table
  (3.OA.D.9; lf-ops owns the multiplication-chart drawing), #5 Find the rule in an input-output table (3.OA.D.9),
  #19 Find emergent features (4.OA.C.5), #20 Follow a given rule to extend a number pattern (4.OA.C.5), #21 Extend growing
  shape patterns (4.OA.C.5); then the later BUILD lessons in teach-week order (#7 two-step, #25/#26 expressions, #30/#31 …).
- Skills these lessons need: `patterns:notice_patterns` (new, build entry patterns_notice: #3, #19),
  `algebra:function_table_easy` (#5), `patterns:number_patterns_rule` (#19, #20, #21; files are lf-ops': asked),
  `patterns:growing_shape_patterns` (new, links proposal: #21).
- The brief's G3 lesson-7 two-step scope (two_step_*, multi_step_word) moves after these, by teach week.

## Owner go

## Open questions
- (cards' undecided lines are listed here as they are drafted)

## Times
Times: builder r1 notice_patterns + growing_shape_patterns (new), start 2026-11-07T06:53Z, end —, profile mq-opus-medium
Times: builder r1 function_table_easy + number_patterns_rule (fix), start 2026-11-07T07:16Z, end —, profile mq-opus-medium

## Baseline precritic (head 9398c3a, --skill function_table_easy,number_patterns_rule --strict): 6 FAIL
- print-lint lesson L/S: function_table_easy L-TOPSTART CL-4b, L-ANSAREA SL-6, L-DENSITY DN-2; number_patterns_rule L-OVERFLOW PG-12 (x8)
- grade-render gate: 60 overflow (number_patterns_rule lesson-S count-row train leaves its cell) + 8 small screen targets
- sibling-compare: function_table_easy DN-2 / PAGEFILL / PG-23 at S/M/L, no approved sibling
- node-lint LESSON-DATA: no prereqs.js lesson data for either skill
- options-verify --render: 22 values worse than default (ftTask values / ftTable 51-52 lose capacity, H13; ftTask=rule L CL40-INK)
- card-rulings SKIPPED / spec-card N/A: no card yet

## Log
- 2026-11-07: composing:number_word_form (BUILD lesson #1) handed to lf-placevalue (session_013pHDnMCXcY6kXV15KHf4Yp): they own only
  its blocks in gen-algebraic.js (the WHICH WAY ROUND comment ~l.45-60 and the number_word_form branch ~l.2469); their precritic r0
  findings (LESSON-DATA, lesson S H13/PAGEFILL, answerSlot=hto weight 900, to_words capacity) are theirs to fix.
- 2026-11-07: lf-ops agreed (session_013pHDnQ7sfFBg45rrEDgLdJ): lf-algebra owns ONLY genNumberPatterns + its dispatch line in
  gen-mult-patterns.js and the registerSkill('patterns:number_patterns_rule') block in providers/countby.js; count-row.js stays
  lf-ops' (ask for changes, its 'train' look is number_patterns_rule's track); read-only use of the mult-grid payload is fine.
- 2026-11-07: lane started; branch from origin/claude/sweet-newton-c8wrv1 @ 9398c3a; re-aim recorded; asked lf-ops about
  number_patterns_rule file ownership (gen-mult-patterns.js, providers/countby.js, cells/count-row.js).
