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
- function-table card (design/cards/function-table/function-table.md, unsigned; 35 PROPOSED decisions, accepted by signing):
  1. Write the rule IN the machine box at S/M, under the table at L? Suggested: yes (one rule place).
  2. x 6 on a 3-row table at band 20 for lesson #5? Suggested: yes (rows are table facts; ftFactors restricts).
  3. Check rows and 5-row tables count as "adds a drawing" (capacity)? Suggested: yes.
  4. Two-step rules stay offered on easy, off by default? Suggested: yes.
- patterns card (design/cards/patterns/patterns.md, unsigned; 15 PROPOSED decisions, accepted by signing):
  1. "True or false about a times-table" (patTask truefalse) its own preset skill too? Suggested: no for now (same 3.OA.D.9
     lesson as parity); a preset only if a lesson page deals it alone.
  2. Parity items: print the product (6 x 7 = 42, "is 42 even or odd?") or keep it hidden (decide from the factors)?
     Suggested: hidden (with the product printed it is 2.OA.C.3, not 3.OA.D.9's "explain why").
  3. Growing patterns on screen: a 7 x 7 tap grid as the "draw Term 4" working space (never graded)? Suggested: yes; the
     graded answer is the number on paper and screen.
  4. WRM tags notice_patterns -> Y4.B4.S6 (partial), pattern_features -> Y5.B12.S9 (partial), growing_shape_patterns ->
     Y6.B7.S1 (partial); the build list's Y3.B3.S13 / Y4.B4.S15 were wrong. Suggested: accept.
  5. The fading hint (patShow) on by default for both skills? Suggested: on (teacher turns it off for the next page).
  6. Word answers in card rulings: extend ws-card-rulings with a payload reader so notice rulings are machine-checked?
     Suggested: yes (this lane does it).
- number_patterns_rule (goes on the patterns card): preset skill "Follow a given rule" = rule:false (lesson #20)? Suggested: yes.

## Times
Times: builder r1 notice_patterns + growing_shape_patterns (new), start 2026-11-07T06:53Z, end 2026-11-07T08:31Z, profile mq-opus-medium
Times: builder r1 function_table_easy + number_patterns_rule (fix), start 2026-11-07T07:16Z, end 2026-11-07T08:27Z, profile mq-opus-medium

## Baseline precritic (head 9398c3a, --skill function_table_easy,number_patterns_rule --strict): 6 FAIL
- print-lint lesson L/S: function_table_easy L-TOPSTART CL-4b, L-ANSAREA SL-6, L-DENSITY DN-2; number_patterns_rule L-OVERFLOW PG-12 (x8)
- grade-render gate: 60 overflow (number_patterns_rule lesson-S count-row train leaves its cell) + 8 small screen targets
- sibling-compare: function_table_easy DN-2 / PAGEFILL / PG-23 at S/M/L, no approved sibling
- node-lint LESSON-DATA: no prereqs.js lesson data for either skill
- options-verify --render: 22 values worse than default (ftTask values / ftTable 51-52 lose capacity, H13; ftTask=rule L CL40-INK)
- card-rulings SKIPPED / spec-card N/A: no card yet

## Log
- 2026-11-07: r1 build merged (e59e2bf3). New: patterns:notice_patterns (patTask parity / feature / truefalse, band, patShow),
  preset patterns:pattern_features (patTask feature, lesson #19), patterns:growing_shape_patterns (patTask next / rule / far,
  growShape, band); files gen-patterns-notice.js, cells/notice.js, cells/growing-pattern.js, providers/patterns.js; card
  design/cards/patterns (unsigned); manifest design/lanes/lf-algebra/manifest.json (ws-integrate applied); share codes ZW ZX ZY
  (lead: check against other lanes). build-list patterns_notice deleted as built, new entry addition_table_patterns (3.OA.D.9
  addition-table clause); standards-audit 4.OA.C.5 -> full. Links edits: Y4 lesson G3|-|patternsonthemultiplicationtable
  (direct += notice_patterns parity, verdict direct, pre += composing:odd_even), Y4 step Y4.B4.S6 (partial += notice_patterns),
  Y4 proposals.patterns_notice deleted; Y5 lessons G4|-|findemergentfeaturesegunitsdigitcycle (direct += pattern_features) and
  G4|-|extendgrowingshapepatterns (direct += growing_shape_patterns), step Y5.B12.S9 (partial += pattern_features), Y5 proposals
  patterns_notice / growing_shape_patterns deleted. Proposal: Y6.B7.S1 should list growing_shape_patterns as partial (Y6.json not
  edited). r1 precritic still red: lesson anchor overflow (new cells taller than the ~50 mm anchor), dealer-uniform (growing read
  as op '?'), sibling-compare (new templates), options-verify --render (task values), card-rulings INCOMPLETE (word answers).
- 2026-11-07: lf-ops accepted count-row requests 1-3 (train wraps to cell, shaped tiles at box pitch, >= 44 px screen boxes);
  they land on claude/sweet-newton-c8wrv1-lf-ops, lf-ops sends the commit.
- 2026-11-07: composing:number_word_form (BUILD lesson #1) handed to lf-placevalue (session_013pHDnMCXcY6kXV15KHf4Yp): they own only
  its blocks in gen-algebraic.js (the WHICH WAY ROUND comment ~l.45-60 and the number_word_form branch ~l.2469); their precritic r0
  findings (LESSON-DATA, lesson S H13/PAGEFILL, answerSlot=hto weight 900, to_words capacity) are theirs to fix.
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
