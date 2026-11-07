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

## Log
- 2026-11-07 r1 build (Opus medium, first redesign on uncertified pairs): function_table_easy + number_patterns_rule.
  function-table: find-the-rule frame IN the machine box (S/M), short machine arrows (CL40 at L), note tightened, top-aligned
  root (L-TOPSTART), >= 1.25 em screen boxes (44 px), provider steps 4 (lesson chart), "+ -6" step fixed, title from ftTask;
  skill-options addsDrawingValues (Check rows, 5-row tables); gen q.a / q.b for the card rulings. Lesson data for both
  skills (prereqs.js, lf-algebra block; number_patterns_rule chartWide). number_patterns_rule: find-the-rule worked steps
  no longer state the rule first; Max Number obeyed on x 10 rows; a three-term row keeps one number to write.
  Card design/cards/function-table (unsigned, 4 open questions). ws-card-rulings reads list-answer items (listAns).
  Asked lf-ops (count-row.js): train wraps to its cell; shaped tiles at box pitch; >= 44 px screen boxes.
- 2026-11-07: lf-ops agreed (session_013pHDnQ7sfFBg45rrEDgLdJ): lf-algebra owns ONLY genNumberPatterns + its dispatch line in
  gen-mult-patterns.js and the registerSkill('patterns:number_patterns_rule') block in providers/countby.js; count-row.js stays
  lf-ops' (ask for changes, its 'train' look is number_patterns_rule's track); read-only use of the mult-grid payload is fine.
- 2026-11-07: lane started; branch from origin/claude/sweet-newton-c8wrv1 @ 9398c3a; re-aim recorded; asked lf-ops about
  number_patterns_rule file ownership (gen-mult-patterns.js, providers/countby.js, cells/count-row.js).
