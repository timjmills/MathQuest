# Lane simple-print-2 — Aim / Exactly columns, Quick prints, Highest number + fact sets (owner design list items 4–7)

- **Lane:** simple-print-2 (builder, Opus medium: first build of a new screen area + new options)
- **Branch:** `claude/sweet-newton-c8wrv1-simple-print-2` (from cd81c8e, live simple print 844ecfaa1). Not pushed.
- **Spec:** `design/status/simple-print.md` "Owner design list" items 4–7 (owner, 2026-11-03).
- **State:** built, gates green; waiting for its independent critic. Item 7 (decimals) NOT built: gap recorded below.

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

## Option-vs-preset judgment (CLAUDE.md "a distinct option is also a findable skill")
Highest number and fact sets are **plain options, not preset skills**. A smaller Highest number is a number-size step of the
same task ("Add within 20" is already its own skill; choosing 10 inside it is the rung below, and every band value that is
its own lesson already exists as its own ranged skill id, e.g. add_10_mixed … add_1m_mixed). A fact set is a choice of which
facts to drill inside the same task (the owner's "× tables 6–8" is a page of mult_facts, not a new lesson). Neither adds a new
task kind, representation or difficulty class, so no preset skill, label, search terms or share code is added.

## Gaps
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
- mult_facts with a fact set deals the ticked tables in turn (8, 7, 6, 8, 7, 6 … down the page): a generator pattern (L10
  look-alike) seen in the × 6–8 renders; pre-existing, for the facts family.

## Gates (this branch)
ws-simple-print OK (new: COLS7, EXACT, QUICK, WITHIN over 86 + − × ÷ skills / 4,432 items); `--backtest` OK; `--backtest-options`
OK (old behaviour FAILs COLS7: Mixed up 8 across at S, and WITHIN); ws-share-options OK; ws-presets-unit OK; ws-content-audit
OK (addition, subtraction, multiplication, division); ws-teacher-shell, -library, -quiz, -tokens, -preview OK; ws-pdf-preview
OK; ws-screen-answer OK; ws-chromebook-perf OK; ws-code-snapshot OK (731 codes, none moved); ws-boot-smoke OK.

## Log
- 2026-11-03: built items 4–6; item 7 recorded as a gap; screenshots for the critic in the session scratchpad `sp2/`.
