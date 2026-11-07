# Teacher follow-ups: triage of two old audits (work order item 13)

Lane: teacher follow-ups · 2026-10-30 · builder (Opus, low)
Audits: `design/audit/TEACHER-SCREENS-AUDIT-R2.md` (2026-09-25) and `design/audit/OPTIONS-CRITIC-R2.md` §2, §5, §6.
Method: the live app served by the ws harness and driven with Playwright Chromium at 1366 / 820 / 390, as a teacher
(`setUserRole('teacher')`, `tvGo(...)`); registry checked through `offeredOptionsFor()` in the page; code read where a
screen has been rebuilt. Options were sampled per family, not per skill.

Verdicts: **FIXED-ALREADY** (evidence) · **DROPPED** (screen gone or rebuilt, or not a defect) · **FIX NOW** (fixed in this
change) · **HAND-OFF** (a skill-family or tool lane) · **LEAD** (needs a file this lane may not edit, or a lead decision).

## Counts

| Verdict | Teacher screens R2 | Options critic R2 | Total |
|---|---|---|---|
| FIXED-ALREADY | 52 | 17 | 69 |
| DROPPED | 2 | 0 | 2 |
| FIX NOW | 4 | 1 | 5 |
| HAND-OFF | 1 (+1 new defect, H1) | 4 | 6 |
| LEAD | 1 | 3 | 4 |
| **Items** | 60 | 25 | 85 |

## A. TEACHER-SCREENS-AUDIT-R2

| Id | Screen | Item | Verdict | Evidence / fix |
|---|---|---|---|---|
| T1.1 | Quizzes list | Row ⋯ menu never opens | FIXED-ALREADY | Click opens it: `aria-expanded="true"`, items Copy share link / Print / Export JSON / Delete. Outside-click listener ignores detached targets (`teacher-shell.js` ~823) |
| T1.2 | Quizzes list | Esc closes, focus back on ⋯ | FIXED-ALREADY | Esc: menu gone, focus on `[data-q=menu]` |
| T1.3 | Quizzes list | No way to delete a quiz | FIXED-ALREADY | Delete in the row menu (follows from T1.1) |
| T2.1 | MAP session | Legacy pupil chrome for a teacher | FIXED-ALREADY | `launch-chrome.js` + `css/play-teacher.css` restyle End / Audio / tool row under `body.teacher-mode #mapSessionView` |
| T2.2 | MAP session | Audio covers the mode badge | FIXED-ALREADY | Audio and End sit in `.map-session-banner` (play-teacher.css:24), not fixed over the header |
| T2.3 | MAP session | "Now: NO" | FIXED-ALREADY | `map-engine.js:19`: the banner names the domain in words |
| T3.1 | Game view | "Show me how" opens itself over Q1 | FIXED-ALREADY | Launched from Run → Practice: no dialog open; "Show me how" is a button (`game-control.js:810`, `launch-chrome.js:85`) |
| T3.2 | Game view | Column script for 6 + 2 | FIXED-ALREADY | Opt-in only now (T3.1); the script choice belongs to the worked-steps providers |
| T3.3 | Game view | Badge "M · Add ≤20 NR" | FIXED-ALREADY | `plainSkillLabel()` in launch-chrome.js; no emoji found in the launched view |
| T3.4 | Game view | Board display looks like Practice | FIXED-ALREADY | `launch-chrome.js` `syncBoard()` draws the board stage (Show me how · Show answer · Next) under `body.tv-bigboard` |
| T3.5 | Game view | Emoji, orange 3-D CHECK, "New Skill" | FIXED-ALREADY | Buttons now: Exit · Hint · Show me how · Read aloud · Check; no emoji in the view |
| T4.1 | Online worksheet | 60 coloured per-cell buttons | FIXED-ALREADY | Read / Hint show on the focused cell only (launched from Run → Online worksheet at 1366) |
| T4.2 | Online worksheet | Orange CHECK ALL, emoji header | FIXED-ALREADY | Toolbar: Back · Worksheet · skill name · primary "Check answers" · New sheet |
| T5.1 | Google Forms modal | No focus trap, page behind not inert | FIXED-ALREADY | `google-classroom.js:569-603` inerts body children, traps Tab |
| T5.2 | Google Forms modal | Esc does not close | FIXED-ALREADY | `google-classroom.js:589` |
| T5.3 | Google Forms modal | Title defaults to "Quiz" | FIXED-ALREADY | `defaultTitle = named || …` (`:496`) |
| T5.4 | Google Forms modal | "1 of 1 problems" | FIXED-ALREADY | Plural only when needed (`:542`) |
| T5.5 | Google Forms modal | Step "Render" | FIXED-ALREADY | Step reads "Prepare" (`:513`) |
| T6.1 | Quiz monitor | ON switch is a black block | FIXED-ALREADY | Track painted on `.tv-switch::before` (`teacher-brand.css:106-113`), `.tvq-switch-btn .tv-switch` pointer-events none; ws-teacher-quiz clicks it green |
| T7.1 | Print | 16 page-type cards above the skills | FIXED-ALREADY | Chosen type card + "Change"; Skills of the section come first |
| T7.2 | Print | Preview far down at < 900 px | FIXED-ALREADY | 390: Preview heading at y = 119, controls below |
| T7.3 | Print | "Fits:" engine dump | FIXED-ALREADY | One line ("24 problems on 2 pages · 3 columns") + "Why?" disclosure (`teacher-print.js:964`) |
| T7.4 | Print | Anchor "beside each problem" promise | FIXED-ALREADY | Caption now "Worked examples, step by step, on Independent, More Practice and Mixed practice pages. Not scored." |
| T7.5 | Print | Anchor control live where it does nothing | FIXED-ALREADY | Disabled with its reason (`teacher-print.js:773-780`, `aria-disabled` + `tvAnchorWhy`) |
| T7.6 | Print | Score "/8" on a 6-item page | FIXED-ALREADY | Preview page 1: 12 items, "Score ___ /12" |
| T7.7 | Print | "Mixed practice" title with 3 skills | FIXED-ALREADY | Title comes from the skill / fact set (`print-sheet.js:1921`, `factSetTitle`) |
| T7.8 | Print | Operator spacing "+ 5" vs "+7" | FIXED-ALREADY | Kit stack cell: one operator column ("+ 8", "+ 10" aligned in the preview) |
| T8.1 | Options popover | Sample at the bottom | FIXED-ALREADY | `.tv-sko-sample.is-pinned` at the top (74 px under the title, 191 px tall) on every sampled skill |
| T8.2 | Options popover | Native selects | FIXED-ALREADY | Every select is `.tv-select` |
| T8.3 | Options popover | Uppercase section heads | FIXED-ALREADY | "Harder / easier" sentence case |
| T8.4 | Options popover | Regrouping offered on "No Regrouping" | FIXED-ALREADY | `_opsRegroup` only on `*_mixed` ids (`skill-options.js` ~1144); `sub_100_no_regroup` panel: Number lengths + Support only |
| T8.5 | Options popover | "?" tip buttons 28 × 28 | FIX NOW | 44 px hit area on `.tv-sko .sko-tip::after` (look unchanged) — `css/teacher.css` |
| T9.1 | Quiz builder | Three filter mechanisms | FIXED-ALREADY | Search + Level select + Domain select (the Library row) |
| T9.2 | Quiz builder | Four skill pickers across the product | DROPPED | Send / Print / Library pickers were rebuilt into the T6 Skills screen and the tray (IMPROVEMENT_PLAN §2.3-2.4) |
| T9.3 | Quiz builder | "3 Qs 2-col" | FIXED-ALREADY | Teacher path: "3 questions" (`quiz-builder.js:1052-1054`) |
| T9.4 | Quiz builder | Questions drop below at 820 | FIXED-ALREADY | Sticky "Questions · 0 questions ↓" bar at 820 |
| T9.5 | Quiz builder | Two toasts overlap | FIXED-ALREADY | Builder notes go through the tv toast (`teacher-quiz-ui.js:17`) |
| T10.1 | Library | List / Thumbnails 116 × 36 | FIXED-ALREADY | Both 44 px tall |
| T10.2 | Library | Sidebar re-opens Coverage | FIXED-ALREADY | After Standards coverage, `tvGo('library')` shows "Skills library" (`teacher-library.js:106`) |
| T10.3 | Library | "3546221971" digits run together | FIXED-ALREADY | Thumbnail shows 3 · 54 · 62 / 21 · 9 · 71 in a grid. NEW: its instruction reads "Tap the even numbers. Tap the odd numbers." (two contradicting tasks, screen verb) → HAND-OFF H1 |
| T10.4 | Library | Coloured even / odd words | FIXED-ALREADY | Thumbnail is black and white |
| T10.5 | Library | Base-10 / place-value thumbnails unreadable | LEAD | Still small: the instruction line and table heads render at about 6 px at thumbnail scale (`audit` probe of "base ten blocks"). Needs a decision on the thumbnail crop (first item / larger crop) in `teacher-preview.js`, which is shared with the preview lane |
| T11.1 | Standards coverage | Two counts (238 vs 177) | FIXED-ALREADY | One count: "177 standards · 166 covered" |
| T11.2 | Standards coverage | Related skills run together | FIXED-ALREADY | One `<li>` per skill (`teacher-standards.js:116`) |
| T11.3 | Standards coverage | "Range" links 40 × 44 | FIXED-ALREADY | No control under 44 px on the screen |
| T11.4 | Standards coverage | K.CC.3 "Not covered" | FIXED-ALREADY | K.CC.3 is tagged in `standards.js` / `standards-db.js` |
| T12.1 | MAP setup | Adaptive "Change" 52 × 24 that leaves for Settings | FIXED-ALREADY | Inline Adaptive switch on the MAP screen (`teacher-map.js:261-300`); MAP is now a tab of Classes |
| T12.2 | MAP setup | RIT 181–190 sample "3 × 3" | FIXED-ALREADY | Sample taken from the middle of the band's list (`teacher-map.js:168-175`) |
| T13.1 | Run practice | "Pupil start screen" on Run | FIXED-ALREADY | Moved to Settings (`teacher-shell.js` `pupilStartHTML()` in Settings); Run headings: Run practice / What to practise / How to play / Settings |
| T13.2 | Run practice | Mode preview covers the primary button | FIXED-ALREADY | Preview placement rules + ws-teacher-preview "covers" checks (pass) |
| T14.1 | Send a set | "Print" link 28 × 44 | FIXED-ALREADY | `min-width:44px` (`teacher-sets.js:160`) |
| T14.2 | Send a set | "Clear all" small link text | FIX NOW | The inline `font-size:12px` dropped: 16 px, 44 px tall — `js/modules/teacher-sets.js`. Shots `audit-send-clearall-{before,after}-{1366,390}.png` |
| T14.3 | Send a set | 12 px grey helper lines | FIXED-ALREADY | Helper is `.tv-cap` (token size); Send is retired from the menus (T6) and reachable by `tvGo('sets')` only |
| T15.1 | Board code | QR code for tablets | DROPPED | A feature request, not a defect; the overlay passed |
| T16.1 | Auto-layout | "Score /21" for 20 problems | FIXED-ALREADY | `sheetHeadHTML(title, count)` takes the problem count (HD-2, `print-generate.js:4718-4724`) |
| T18.1 | Quiz results | Populated view not re-graded | HAND-OFF | Needs seeded submissions; belongs to the quiz-results grade in the Classes (T6) lane |
| T19.1 | Progress | "open Quizzes ." stray space | FIXED-ALREADY | No " ." on the Progress screen |
| T20.1 | Settings | "Reset adaptive difficulty" native `confirm()` with shouty copy | FIX NOW | Teacher Settings now resets at once and shows a tv toast "Every skill is back to level 3." with a 44 px **Undo** that restores the levels and storage. New `toastAction()` in `teacher-ui.js`, used by `teacher-shell.js`; CSS additive in `teacher.css`. Shots `audit-settings-reset-{before,after}-{1366,390}.png` |
| T21.1 | Home | Toast over the sticky bar on Send | FIXED-ALREADY | `.tv-toast` lifts above the bars (`teacher-shell.css:160-164`, `teacher-wrm.css:213-228`) |
| T-new | Tray (Lessons) | Tray "×" 28 × 28 (found by the 44 px sweep) | FIX NOW | 44 px hit area on `#teacherApp .tt-x::after` — `css/teacher-tray.css` |

Sweep: every visible teacher control on Home, Skills, Sets, Print, Run, Library, Quizzes, MAP, Settings, Progress, Lessons and
Todo at 1366 is ≥ 44 px tall except the tray "×" (fixed) and the inputs inside the Skills-screen sample cells (pupil
preview content, not teacher controls). No console errors.

## B. OPTIONS-CRITIC-R2 (§2, §5, §6)

| Id | File | Item | Verdict | Evidence / fix |
|---|---|---|---|---|
| §2.1 / §5.6 / §5.16 / §6.10 | registry, gen-time-money | `money_count` notes kinds and two size controls | FIXED-ALREADY | Five controls: currency · What to count (coins / two / mixed / notes / both) · Totals to · coin set · Coins set out; "Count the money" for notes (`gen-time-money.js:690`); retired controls hidden (`_mcFold`) |
| §2.2 / §5.24 | ws-options-verify | 605 values on seed-blind skills never difference-checked | LEAD | A gate change (seed the generators, fail "not reproducible"). A tool change passes only with its own critic (CLAUDE.md); give it to the options-gate owner |
| §2.3 / §5.12 / §6.4 | derive + registry | Measured "Up to N" does not bound the answer (52 skills) | LEAD | The verifier still logs it as a warning. Fix belongs in `ws-options-derive.cjs` (drop values whose seeded answers exceed them, or relabel "Largest number used") — a tool re-derivation, same owner as §2.2 |
| §2.4 / §5.15 / §6.6 | print-sheet.js | Sheet title ignores the fact set (P-31) | FIXED-ALREADY | `buildSheet` titles from `factSetTitle()` (`print-sheet.js:1921, 1943`). Listed as LEAD for any follow-up because this lane may not edit print-sheet.js |
| §2.5 | registry | Combinations: Across zeros × Never; Totals × Notes 500 | FIXED-ALREADY | `appliesTo: cur => cur.regroup !== 'none'` (`skill-options.js` ~1160); money size now one control |
| §5.1 / §6.3 | registry | + / − bands above the id's own | FIXED-ALREADY | `bands = … filter(b => b <= max)` (~1136); `add_50_regroup` offers 20 / 50 |
| §5.2 / §6.3 | registry | Regrouping contradicts the id | FIXED-ALREADY | Only on `*_mixed` ids |
| §5.3 / §6.12 | registry | Dead Across zeros | FIXED-ALREADY | See §2.5 |
| §5.4 / §6.1 | registry + generators | Support absent on most panels | HAND-OFF | Each family's support draws in its generator / provider: fractions, decimals (PV grid), division, composing, graphs, number theory, patterns, OoO, vocabulary lanes. Sampled: `fractions:identify_fraction`, `integers:add_integers` still Calculator / Skip only |
| §5.5 / §6.8 | registry + generators | Forms-only skills need a size ladder (104) | HAND-OFF | Vocabulary, integers, geometry, graphs, OoO family lanes (each ladder needs the generator to honour it) |
| §5.7 / §6.11 | registry | Function tables 9 controls | FIXED-ALREADY | Folded (`_ftFold`, ~1925): Task · Rules · … ≤ 5 resting |
| §5.8 / §5.17 / §6.13 | registry | `multiply` / `divide` show Digits and Max Number | FIXED-ALREADY | `multiply`: notation · tiles only; `divide`: notation · tiles · regroup (no measured range) |
| §5.9 / §6.9 | registry / UI | Decimals null label "now whole numbers" | FIXED-ALREADY | "Tenths and hundredths (this skill's own)" (`skill-options.js` `_measuredOptions` nullLabel). Place-value-grid support: HAND-OFF to the decimals lane (in §5.4) |
| §5.10 | registry | `number_bonds` "Bonds to 20" | FIXED-ALREADY | Bonds to 5 / 10 |
| §5.11 / §6.14 | registry | `make_ten` / `teen_compose` only Support | FIXED-ALREADY | Make 5 / 10 / 20; Teen numbers to 15 / 19 |
| §5.13 / §6.7 | registry + generators | 39 measured-only skills need own options | HAND-OFF | Family lanes (the option must change the generator's items) |
| §5.14 | registry | Measured Decimal places on `number_ops_mixed:mixed`, `solve_unknown`, `evaluate_expression` | FIX NOW | `NO_MEASURED_DECIMALS` in `skill-options.js`: the control is hidden there (kept, hidden, so old share codes decode). Verifier: mixed 20 → 16 values, all pass; solve_unknown, evaluate_expression pass |
| §5.18 | gen-operations | `sub_across_zeros` "Up to 100" deals 408 − 89 | FIXED-ALREADY | Control is now a band 500 / 1,000 / 10,000 (`skill-options.js:1109`), no measured "Up to 100" |
| §5.19 / §6.5 | pools | Pool labels are category ids | FIXED-ALREADY | `_CAT_NAMES` from `DOMAINS` (`skill-options-pools.js:80-90`) |
| §5.20 / §6.5 | pools | Pools offer only Which skills | FIXED-ALREADY | `poolSize` (easier / set / harder) and `poolSupport` (2 / 1 / 0) on every pool (e.g. `counting_all`) |
| §5.21 / §6.11 | UI | Clipped select at 420 | FIXED-ALREADY | The chosen value's full text shows under the select when it overflows (390 shot of `function_table_easy`) |
| §5.22 | registry | Generic band help on single-op skills | FIXED-ALREADY | `_OPS_BAND_HELP[op]` per operation |
| §5.23 | UI | Sample overflows (`placevalue:expand`); `add_decimal` stack upside down | FIXED-ALREADY | Frame scrollWidth = clientWidth (396 at 1366, 346 at 390); `add_decimal` sample: carry boxes, addends, rule, answer row (`audit-options-add_decimal-*.png`) |
| §6.2 | registry + generators | Vocabulary word-set size + picture / word-bank support | HAND-OFF | Vocabulary lane (in §5.4 / §5.5) |
| §6.15 | ws-options-verify | Harden the verifier | LEAD | Same as §2.2 |

## HAND-OFF list (by lane)

- **H1 number sense / patterns (`gen-algebraic.js`, `select_even_odd`)**: the item instruction reads "Tap the even numbers.
  Tap the odd numbers." — two contradicting tasks in one item, and a screen verb on a skill named "Circle …".
- **Family support and size ladders** (§5.4, §5.5, §5.13, §6.2): fractions, decimals, division, composing, graphs, number
  theory, patterns, order of operations, vocabulary, integers, geometry.
- **Classes (T6) lane**: re-grade Quiz results with real submissions (T18.1).

## LEAD list

- **Options gate / derive tool** (§2.2, §2.3, §5.12, §5.24, §6.4, §6.15): seed the seed-blind generators, promote "Up to N
  but the answer reaches M" to a failure, add a combination pass, re-derive Max Number from answers. A tool change needs its
  own critic.
- **print-sheet.js** (P-31, §5.15): verified fixed; any follow-up is in a file this lane may not edit.
- **Library thumbnails** (T10.5): choose a crop rule for table-type thumbnails in `teacher-preview.js`.

## Screenshots

`design/status/teacher-followups/`:
`audit-settings-reset-{before,after}-{1366,390}.png`, `audit-send-clearall-{before,after}-{1366,390}.png`,
`audit-options-{expand,add_decimal,function_table_easy}-{1366,390}.png` (after: pinned sample, tv selects, 44 px "?"),
`audit-print-current-{1366,390}.png`.

## Gates (this change)

ws-boot-smoke OK · ws-teacher-shell OK (first run) · ws-teacher-library OK · ws-teacher-preview OK · ws-teacher-quiz OK ·
ws-teacher-tokens OK · ws-code-snapshot OK (723 codes, nothing moved) · ws-options-verify `--skill mixed` / `solve_unknown` /
`evaluate_expression` OK. `--category number_ops_mixed` FAILS on `word_problems_mixed_plain` (poolSupport) and
`number_families_mixed` (skipAfter): pre-existing, the base tree fails the same way (`--skill number_families_mixed`: 2 fail on
the unchanged tree); not touched here — HAND-OFF to the number_ops_mixed / pupil-play owner.
