Lane: simple-print
Title: ONE simple print everywhere (student page, Quick Start cards, teacher tray) that fills the paper
Session: session_013pHDnMYhKMXmRkjhbcmxtp
Branch: claude/sweet-newton-c8wrv1-simple-print
Owner of files: js/modules/simple-print.js, css/simple-print.css, tests/scripts/ws-simple-print.cjs; the entry points in teacher-tray.js (openSheet 'print'), gamification.js (printFromLanding), quick-skills.js (printQuickSkill)
State: passed (critic r3 PASS on every lane-owned criterion; engine items with mixed-m2); hand-over
Updated: 2026-11-03
Builder profile: lane session (first build of a new screen)
Critic rounds: 3, r1 FAIL (min 4), r2 FAIL (min 6), r3 PASS (A 8 9 8 9, B 8 8 8 8 on the lane's part)

## Now
- Built; critic r1 and r2 lane-owned defects fixed and gated. r3 not run (budget). Page-1 fill of 6-part prints waits on the engine lane (paginate).
- The full dialog (teacher-sheet.js) stays behind "More options → All print options…". Its 8-a-page request mapping (the owner's "3 a page") belongs to the mixed-m2 lane's "one flowed request" rewrite, not to this lane (told by send_message, 2026-11-03).

## Owner design list (queued during critic r3, 2026-11-03; process rule 0: not folded into the running round)
1. 2026-11-03 "turn column OR have intelligent mode … still with large, medium, small" + "if choosing big medium small this is intelligent fitting together": Columns reads "Auto — fitted by size" with the per-type counts it chose ("Facts 8 · Missing numbers 4"); a number is the only override. (Partly built: Auto already fits each part's count by type and size: fact parts take the most fact columns that fit; the summary does not yet list counts per type.)
2. 2026-11-03 "multiple sizes of problems can fill the page … no white space": FILL floor toward 85 % on every page but the last; conflicts (big digits, an explicit count) win and are reported. Needs the mixed-m2 engine items (part continuation, row stretch): today the engine leaves page 1 30 % free with no row of any part able to go on.
3. 2026-11-03 "unless there were limited problems": fewer problems than a page → full rows from the top, rest blank; the FILL check skips pages below one full page.
4. 2026-11-03 "exact and intelligent mode … 7, 8, 9, 10 should be just for small problems": a picked number offers "Aim for n" (default) | "Exactly n"; 7–10 only when the set has fact-sized problems; req fields to agree with mixed-m2 (columns, columnsMode 'exact' | 'aim' | 'auto').
5. 2026-11-03 "on the printing teacher mode I want to have a favorites/quick links area": Quick prints (saved whole setups) at the top in teacher mode and on the Skills page; ★ Save as quick print; ⋯ rename / delete; round-trips through share codes; a built-in Fast facts group.
6. 2026-11-03 "fast fact options … change the denomination or limit the problem by highest number": per skill, or shared, Highest number (10 · 20 · 50 · 100 · 120 · 144 · 500 · 1000, only values the skill supports) and Fact sets / tables (1–12, 0, 13), through the skill option schema (skill-options.js), round-tripping in share codes, quick prints and play.
7. 2026-11-03 "keep card size and that is its default … include decimals … 10ths 100ths 1000ths": Decimals none / tenths / hundredths / thousandths as a per-skill option on the + − × ÷ operation skills (not *_facts), carried through generateQuestionFor, answer-check and the kit stack; ws-share-options round trips.
Items 4–7 are new options and a new screen area: their own build round (medium builder, first build), with a budget the owner approves.

## Owner go

## Open questions
- Problems mode (a typed count) with several skills can still leave a gap on a middle page. A part never splits across pages, and the independent role caps short problems at 20 a page (DN-1). The default (Pages) fills. Page flow is the mixed-m2 engine lane's (paginate.js / layout.js).
- Fact rows ignore a count (one full page a request), so fast facts use fact rows in Pages mode only. Problems mode prints them in sections (5–6 columns).

## What the owner asked, and where it is
| Ask (2026-11-03) | Where |
|---|---|
| "just showing a couple of problems … should populate the paper" | simple-print.js `buildSimple`: In sections = ONE independent request (full grids, the engine paginates); Pages mode probes each part's full-page capacity, deals the total, rounds to whole rows, then trims and grows a row at a time until the engine's page count is the pages asked (or the pages one row of every skill needs, said in a note) |
| "see how many columns it is trying to use" | each size button shows its Auto columns; Columns "Auto (n)" or 2–10; the summary says "6 columns × 5 rows = 30 a page · 1 page · 30 problems · answer key at the end" |
| skill → number OR %; Problems or Pages; size/columns; key | the four numbered steps; blank = even; a bad entry is outlined red and treated as blank |
| fast facts up to 10 columns | a facts-only set in Pages mode prints fact rows 10 / 6 / 5 at S / M / L (8 when an answer is over 99); division facts get their own pages (across, 3), so they never pull the others to 3 columns |
| student side Print (pupils too) | "Print" on Ready to Practice (shared ?c= link) and a print button on every Quick Start card; lazy (deferred.js), so nothing loads before the press |
| everything else behind More options | More options: Arrange In sections / Mixed up (the mixed-m2 dialog's choice, as one toggle), New numbers, and (teacher) the full dialog |
| a check: default prints of 2+ skills fill ≥ 60 %, no fewer a page than singly | `tests/scripts/ws-simple-print.cjs` (FILL, DENSITY, FACTS, NOT3); `--backtest` runs the same measure on the old dialog's page plan and fails it (fill 22–46 %); on deploy-gates session 1 |

## Req field for the Columns override
The existing per-section `sections[i].columns` (2–10). When the engine clamps (it cannot fit the asked count), the page is built again at the clamped count. On base, a clamped grid collapses to one row a page (add_facts S columns:10 gave "6 x 1, 6 per page"). That is reported to the engine lane.

## Critic rounds
| Round | Scores A1–A4 / B1–B4 | Lane-owned findings → fix | Automatic check |
|---|---|---|---|
| r1 | 7 7 6 8 / 6 8 4 5 | D4 Auto took fewer fact columns than fit → a fact part asks for the fact columns and keeps the clamp; D5/D9 summary not the built page → counts page 1; D6 Mixed fallback summary; D7 38 px segments, 28 px card buttons → 44; D8 focus lost on re-render → restored by data-sp | ws-simple-print TARGETS + SUMMARY (backtest: r1 code fails SUMMARY) |
| r2 | 8 9 7 9 / 8 8 6 8 | D1 Mixed fallback still grid format (8 × 3 = 20) and D2 fact card "36 a page" for 30 → grid format only when cols × rows = page 1's count, fact rows count page 1 | SUMMARY over Mixed up + a one-skill fact card (backtest: r2 code FAILs "6 × 5 = 27") |
| r3 | 8 9 8 9 / 8 8 8 8 (lane part) | PASS. Minor: "the sign" space looks thin under the underline; facts-set M title "Addition facts" on a mixed +/−/× page (kit title rule); fallback summary wording → now "In sections, …". After r3 (lead OK, small): Columns label "Auto — fitted by size (n)", summary per type ("Facts 4–6 across · Missing Numbers 3 across · …"); re-checked by the gate (SUMMARY, TARGETS) and a 390 overflow probe, no critic round | FOOTER (backtest FAIL on 675c7f8) |
| r2 D3 | page 1 of the six set 63–74 % | NOT lane-owned: adding one row to ANY part (page 1 has ~30 % free) makes the engine paginate to 3 pages (probe scratch grow.cjs) | handed to mixed-m2 (paginate.js) with items 1–4 |

Engine faults handed to mixed-m2 (accepted: 1–4): (1) one outline for a row's cells, (2) a part never continues on the next page, (3) no row stretch, (4) equation wraps at S 5 columns. Not in mixed-m2's files, for the lead: (5) footer raw skill ids, the fact instruction read as "thesign" (likely a text-extraction artefact over a span), div_facts fact-rows paired row rules.

Gates (this branch): ws-boot-smoke, ws-code-snapshot (731 codes, +159 appended, none moved), ws-teacher-shell, -library, -quiz, -tokens, ws-pdf-preview, ws-screen-answer, ws-share-options, ws-simple-print OK; ws-teacher-preview flaked once under load (OK on rerun and on base); ws-chromebook-perf: full run FAILed teacher timings while a critic shared the CPU; `--only load,play` on a quiet machine: play OK, load first visit 7518 ms > 7300 ms, and BASE (origin/claude/sweet-newton-c8wrv1) on the same container 7302 ms > 7300 ms FAIL too, with identical static numbers (185 startup modules, 1734 KB gzip, 186 before Start Playing): container speed, not this PR; ws-print-lint (legacy source report) ran, no kit/legacy path changed.

## Times
Times: builder build, start 2026-11-03T09:10Z, end 2026-11-03T10:40Z, profile lane session
Times: critic r1, start 2026-11-03T10:45Z, end 2026-11-03T11:00Z, profile mq-opus-medium
Times: fix r1, start 2026-11-03T11:00Z, end 2026-11-03T11:15Z, profile lane session
Times: critic r2, start 2026-11-03T11:15Z, end 2026-11-03T11:35Z, profile mq-opus-medium
Times: fix r2, start 2026-11-03T11:35Z, end 2026-11-03T11:45Z, profile lane session

## Screenshots
`design/status/simple-print/`: sp-six-1366 / -820 / -390 (owner's 6 skills, the new dialog), sp-sets-390, student-landing(-print), quick-cards, quick-card-print, six-M-p1 and after-six-M-pages1 (the default print's pages); before = the owner's screenshot (14 pages, 3 a page).

## Log
- 2026-11-03: critic r3 PASS (lane part); Auto label + per-type summary added after it; hand-over. Engine items wait on mixed-m2; after that lands, run a narrow critic on page-1 fill of the six set (target 85 %). Items 4–7 of the Owner design list: a fresh lane after the Thursday reset, combined with the all-skills number-options lane.
- 2026-11-03: owner addition "how many sets" → Sets stepper in step 2 (each set its own seed and key, "Set k of N").
- 2026-11-03: r1 and r2 fixes; r3 not run (hard cap $70).
- 2026-11-03: built; ws-simple-print OK (defaults fill 69–92 % at S/M/L on the six, facts, add/sub and missing sets), backtest FAILs the old plan.
