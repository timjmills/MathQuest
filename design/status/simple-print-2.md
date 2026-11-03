# Lane simple-print-2 — Aim / Exactly columns, Quick prints, Highest number + fact sets (owner design list items 4–7)

- **Lane:** simple-print-2 (builder, Opus medium: first build of a new screen area + new options)
- **Branch:** `claude/sweet-newton-c8wrv1-simple-print-2` (from cd81c8e, live simple print 844ecfaa1). Not pushed.
- **Spec:** `design/status/simple-print.md` "Owner design list" items 4–7 (owner, 2026-11-03).
- **State:** critic r1 FAIL (A: C2 6, C3 7; B × 6–8: C2 7) -> all six findings fixed with a check each (r1 fixes below); waiting for critic r2. Item 7 (decimals) NOT built: gap recorded below.

## Files owned
`js/modules/simple-print.js`, `css/simple-print.css` (additive block at the end), `tests/scripts/ws-simple-print.cjs`
(new checks), one line each in `js/modules/teacher-library.js` (Quick prints row on the Skills page) and `js/modules/init.js`
(`?qp=` link import, a dynamic import: startup does not grow), `index.html` (ws-stamp-assets only).

## What is built
| Item | Built |
|---|---|
| 4 Columns | Columns Auto or a number. A number shows **Aim for n** (default) · **Exactly n**. 7–10 are listed only when the set has fact-sized problems (`isFactSkill`); without them an asked 7+ is read as 6. Each part asks min(n, its cap: 10 fast facts / 6 any larger cell); the engine clamps to what fits at the size and the part is rebuilt at the clamp. Exactly: the summary marks every part at its own max "(max)" (`Facts 4–6 across (max) · Missing Numbers 6 across (max) …`); Aim: the most that fit, no mark. Request fields (agreed with mixed-m2): `sections[i].columns` + `sections[i].columnsMode` ('aim' / 'exact'), and on Mixed up `req.columns` + `req.columnsMode` + `sections[0].columns`. Mixed up that the engine falls back to sections is re-planned part by part when a number is asked or a non-fact part would be 7+ across (today's engine gave 8 across for missing-number cells at S). |
| 5 Quick prints | Teacher mode: a Quick prints row at the top of the simple print and on the teacher Skills page (same cards). Card = whole setup (skills + options + amounts, Problems/Pages + n, sets, size, columns + mode, key, arrange). "★ Save as quick print" saves and opens the name for typing; ⋯ Rename / Copy link / Delete; tap opens the dialog filled in and ready. Built-in read-only **Fast facts**: + facts, − facts, × facts, ÷ facts, Mixed facts (add_facts, sub_facts, mult_facts, div_facts). Stored in localStorage `mq_quick_prints` (like My sets' `mq_teacher_sets`); share code `QP1.<base64url JSON>`, link `?qp=` (init.js imports it into Quick prints, de-duplicated). All in lazily loaded modules (simple-print.js is in deferred.js). |
| 6 Highest number + fact sets | Per skill in the simple print ("Highest number 100 · tables: 6–8" disclosure under the skill): Highest number = the skill's own `band` option (only the values it declares), fact sets / tables = the `constant` set of the `*_facts` ids (0–12, 0–13 for + / −), tick chips + All. Several chosen skills with a band: "Highest number (all)" sets each skill to its largest own value at or below the choice (never above: "within N" bounds the answer). The options are the existing skill-options.js schemas, so print, practice, quiz and share codes already carry them (ws-share-options round trips them). |
| 7 Decimals | **Not built — gap below.** |

## Critic r1 fixes (2026-11-03)
| # | Finding | Fix | Check |
|---|---|---|---|
| 1 | Exactly n printed the same page as Aim n | Aim for n may take ONE column fewer on a part when that ends the part on a full row and the pages do not grow (25 problems asked 6: Aim 5 × 5, Exactly 6 + 6 + 6 + 6 + 1); Exactly never rebalances | EXACT: one set in both modes, FAILS when the plans are identical |
| 2 | × / ÷ facts' "Tables to" band shown as "Highest number 100 / 144" | a band is "Highest number" only when its values are plain numbers (answer bounds); otherwise its own label and words ("Tables to 10 × 10 / 12 × 12"); the shared Highest number skips it | WITHIN: a band shown as Highest number N on × / ÷ facts must deal a 12 (1 × 12 <= N); `--backtest-options` shows it on mult_facts @100 |
| 3 | × 6–8 dealt 8, 7, 6 in a fixed cycle (every column one table at M) | gen-operations.js factConstantFor: for 2–6 ticked values each cycle is seed-shuffled (each value still once a cycle, no cycle opens with the value that closed the last); mult_facts swaps the factor order on about half the items | FACTPATTERN on × 6–8 at S/M/L (old generator FAILs: whole columns at M, whole diagonals at S/L). A run-free deal for every column count 5–10 and both diagonals does not exist for 3 values (pigeonhole; simulated), and the generator cannot know the column count, so the check allows a 3-row run in at most half the columns |
| 4 | Footer = bare label | `footerName`: "within N" follows Highest number, a non-answer band in its own words, ticked sets replace "(1-12)" ("Multiplication Facts: tables 6–8", "Add within 50") | FOOTER |
| 5 | Column addition named "Facts"; options took 3 rows a skill | only *_facts ids are "Facts"; the band select sits ON the skill row, fact sets / tables in one disclosure under it | SUMMARY |
| 6 | Key PNGs captured the app | the evidence script renders every page in a tall frame and asserts the last page is `.ws-key` with "Answer Key" | (evidence script) |

## Option-vs-preset judgment (CLAUDE.md "a distinct option is also a findable skill")
Highest number and fact sets are **plain options, not preset skills**. A smaller Highest number is a number-size step of the
same task ("Add within 20" is already its own skill; choosing 10 inside it is the rung below, and every band value that is
its own lesson already exists as its own ranged skill id, e.g. add_10_mixed … add_1m_mixed). A fact set is a choice of which
facts to drill inside the same task (the owner's "× tables 6–8" is a page of mult_facts, not a new lesson). Neither adds a new
task kind, representation or difficulty class, so no preset skill, label, search terms or share code is added.

## Gaps
- **Item 7 and the existing decimal skills.** `decimals:add_decimal`, `sub_decimal`, `mult_decimal`, `div_decimal` (with the
  presets `div_decimal_by_whole`, `div_by_decimal`) already teach 5.NBT.B.7 / 6.NS.B.3 with their own generators, standards and
  search terms. A Decimals option on the + − × ÷ operation skills should ROUTE to them (like a band routes a ranged id to its
  sibling), never replace them: one decimal generator, one kit drawing. Judged against "a distinct option is also a findable
  skill": tenths / hundredths / thousandths in column + and − are a distinct difficulty and a distinct lesson each (WRM Y4
  "add/subtract decimals with one decimal place", Y5 "… with up to 3 decimal places"; 5.NBT.B.7), so each needs a PRESET skill
  as well as the option: e.g. "Add decimals: tenths", "… hundredths", "… thousandths" and the same for −, presets of
  add_decimal / sub_decimal with SKILL_STANDARDS (5.NBT.B.7 + M.EE.5.NBT.7), SKILL_WRM, search terms and appended share codes.
  × and ÷ by decimals are already split (mult_decimal, the div_decimal presets); their places would be presets too. So item 7
  is: decimal places as an option on add_decimal / sub_decimal / mult_decimal / div_decimal (+ the presets above), and on the
  operation skills an option that routes to them.
- **Item 7 decimals (exact gap).** (a) Generators: of the + − × ÷ operation skills only `addition:add` and `subtraction:subtract`
  honour `decimals` (state.decimalPlaces), and they then drop the kit cell (legacy no-cell item) and break their band: `add`
  "within 20" dealt 11.59 + 13.85 = 25.44. The 48 ranged ids (`add_100_mixed` …), `multiply`, `divide` ignore it. (b) The kit
  stack (`sheet/cells/stack.js`) has no decimal point: it would need a point separator track (like the thousands-comma
  `seps` track, `stackSeps`) printed in the operand rows and the answer strip, digits right-padded to the same places.
  (c) Screen: the stack's digit slots compose an integer; answer-check would need the point track. (d) ×/÷ by decimals
  is its own algorithm (decimal × whole, dividing a decimal), not a flag. Proposed: an engine lane (stack point track +
  ranged-id generators in tenths/hundredths/thousandths with "within N" on the answer + slot composition), then the option.
- **Highest number values 120 and 500** are not declared by any + − × ÷ skill today (bands are 10 · 20 · 50 · 100 · 1,000 ·
  10,000 …; facts 5 · 10 · 12 · 15 · 20; tables 100 · 144), so they are not offered. `multiply` and `divide` size by
  "Digits × digits" (tiles), not a band, so they show no Highest number. Adding values means routing new band codes in
  gen-operations.js `_routeByOptions`: the all-families options lane.
- The add / sub stack items count as fact-sized (`isFactSkill` via the kit's `isFact`), so a set of column additions is
  offered 7–10 columns; the engine clamps them (5–6 at S). Kept: it is the kit's definition.

## Gates (this branch)
ws-simple-print OK (new: COLS7, EXACT, QUICK, WITHIN over 86 + − × ÷ skills / 4,432 items); `--backtest` OK; `--backtest-options`
OK (old behaviour FAILs COLS7: Mixed up 8 across at S, and WITHIN); ws-share-options OK; ws-presets-unit OK; ws-content-audit
OK (addition, subtraction, multiplication, division); ws-teacher-shell, -library, -quiz, -tokens, -preview OK; ws-pdf-preview
OK; ws-screen-answer OK; ws-chromebook-perf OK; ws-code-snapshot OK (731 codes, none moved); ws-boot-smoke OK.

## Log
- 2026-11-03: critic r1 FAIL; six findings fixed with checks (table above).
- 2026-11-03: built items 4–6; item 7 recorded as a gap; screenshots for the critic in the session scratchpad `sp2/`.
