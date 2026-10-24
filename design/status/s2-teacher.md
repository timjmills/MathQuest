# Lane S2 — Teacher site 2.0 (mock-up finish + build T2–T6)

Lane lead: this session · branch `claude/sweet-newton-c8wrv1-wip-s2-teacher` · reports to lead session_01HVwpAE3g6EZH8idgErP6LP.

Owns: `js/modules/teacher-*.js`, `css/teacher-*.css`, the teacher parts of `index.html`, `js/modules/skill-codes.js`
(append-only), `design/mockups/teacher-2/*`, this file. Not owned (report needed changes to the lead): `js/modules/sheet/*`,
`print-sheet.js`, generators, `tests/scripts/*`.

Owner pre-approved the build (STATUS 2026-10-23 22:15). Light only on the teacher site; the pupil app keeps dark mode.

| Date | Step | Who (profile) | Result |
|---|---|---|---|
| 2026-10-24 | Lane opened; merged T1 mock-up (e4b8da2d) | lane lead | — |
| 2026-10-24 | Step 1: fix round r6 (critic-r6 items 1–6): fa05d5a (check first), 3c13453, f6018b5. All six fixed; new `views-check.cjs` (186 states) OK; tokens OK; 24 flows in plan. Left: thumbs-check 3 faint-ink fails (thin-line shapes, symmetry); SVG labels may shrink to 8/7/6 px; 139 windows below 60 % drawn-area (best window shown). Not gated (owner ruling) | mq-opus-low | done |
| 2026-10-24 | Owner ruling via lead: no 8/10 gate and no critic loop for the teacher site. Step 1 = r6 fixes then the build brief (no further mock-up critic). Each build stage = ONE independent check (mq-opus-medium; findings, not scores: bugs, broken flows, step counts over plan, layout at 1366/390, regressions); clear bugs fixed in the stage; automatic gates must pass; push + report each stage | lead | — |

## Build brief (Teacher site 2.0, T2–T6)

The mock-up `design/mockups/teacher-2/` is the signed spec: its screens, words, counts and checks are SETTLED. Builders copy
its decisions, not re-decide them. The README there lists each round's decisions; the summary:

**Settled**
- Four places: **Skills** (opens here) · **Lessons** · **Classes** · profile menu (Settings, Switch to pupil view, Teacher
  help). Below 820 px a labelled bottom bar (icon + word, ≥ 44 px) with the tray bar directly above it; sheets open full
  screen; one column, the preview never first.
- Board C (Awsaj style): warm stone page `#EFECE8`, white cards, ink side menu; bold colour = maths area ONLY (eight areas
  + dashed slate for No standard / Mixed / Words); the action is bold ink, one rank-1 fill per screen; grade = a neutral
  numbered ink circle in a fixed first slot (never colour), said once on a one-grade header; area word + icon on every
  chip and card (or a stack legend); selected = fill + ✓ + ring with a gap token. **Light only** on the teacher site
  (no dark tokens used; the pupil app keeps dark mode). Tokens from `tokens.css` (type 12·14·16·20·28·36, weights
  500·700, spacing 4·8·16·24·32·48, radii 8/16, 2 shadows, controls ≥ 44 px); `ws-teacher-tokens` is the gate.
- Skills: one big search through `skill-finder.js` (never label-only); Browse by Maths area · White Rose step · Standard
  (covered / not yet) · MAP strand · My sets; Grade chips; Big 3 / Medium 4 / Small 5 thumbnails or List, 60 per page,
  filtered by grade; tick → tray; Add whole grade / Add whole area / Add all N (standard) with Undo.
- Thumbnails show the skill's REAL item, drawn by the app (`buildSheet` at the card seed), cropped to the drawn content
  box, scaled no lower than Big 12 / Medium 11 / Small 9 px; no strand-tab box (HD-5a); number tabs only (CL-11a). Cache
  drawn cells per skill + seed (page weight noted by r6: first screen 7.4 s).
- Tray: fixed at the bottom of Skills, always visible (empty → Quiz opens "Build from", Print/Share greyed "Tick skills
  first"); ≤ 8 skills one row of chips (never "+N more" alone), > 8 one summary bar "Grade 3 · 64 skills · 6 areas ▸" with
  one segment per area (+N beside the named one); height ≤ 96 px ≥ 1100 px, ≤ 120 px below, ≤ 15 % of the screen at
  1–563 skills. Popup `#tray` = area → grade → skill, List (default) · Chips · Thumbnails; search; select + bulk bar (How
  often, Set weight, Options…, Remove); How often per area / grade / whole grade; Detailed weights (0–10, share, ≈ n, %
  lock, split evenly / keep proportions, > 100 % refused; a held item shows "40 % 🔒", never "Equal", and asks before
  release); counts by largest remainder area → grade → skill; Clear tray with Undo. Three buttons **Print · Quiz ·
  Share**. The tray saves itself (`mq_teacher_sets`) and appears under My sets.
- Worksheet sheet: three kinds **Single skill · Sections · Mixed practice**, each showing only its options (§2.5 table);
  defaults per §2.5; Each page: New problems · Same problems, new numbers · Same page again (one key "Key for all N
  copies"); one-line summary = preview counts (`plan().perPage`); small preview of page 1 (or 1–3 when they differ);
  Print = the PDF via `buildSheet` + `sheetDocument`; New numbers re-deals; More options (prerequisites, header fields,
  key placement, number line, columns); a big tray samples and says so; Single skill + lock raises pages or warns; kept
  settings across close/open.
- Quiz: the same sheet with scoring, Build from (skills / CCSS / EE / WRM unit or step / lesson), How many questions,
  versions 1–6 (own order and key, no letters), Save (`saveTest`) and Share with pupils (`compressTestForURL` → `?quiz=`).
- Share: code + link at once, **Copy** primary, **Show on the board** secondary; mode, timer, count, lock in More options;
  whole-grade code is a PROPOSAL until `skill-codes.js` decodes it (append-only; `ws-code-snapshot` count may only rise).
- Lessons: the 2026-10-17 layout (Grade → area → lessons in order → side panel), opens where the teacher was last with
  "Next"; search by name or code; Print lesson (primary) · Print practice · Share practice · Practise pre-skills; Skills
  to be made folded into lessons and areas, collapsed.
- Classes: tabs Board · Quizzes (results on this device, said so) · MAP tests · Progress; each in ≤ 2 actions.

**Queued design list (owner, folded into this build)**
1. Multi-lesson practice sets (§2.4): tick skills per lesson → **Add to tray** as a group named after the lesson, **Next
   lesson** arrow; Print offers one worksheet per lesson (own pages + key) / one for all (Mixed or a section per lesson) /
   both; **Print all** = one PDF in lesson order, only the added lessons and ticked skills; Save as set keeps groups;
   Share = one short code.
2. Print and Share sheets: above 5 skills a **list** grouped area → grade (no chips), each row opening a popup preview.
3. A chip tap opens that skill's **options sheet, led by a live preview** that updates as options change; hover on desktop
   shows a quick preview.
4. Light only (done by the mock-up; keep).

**Stages** (each its own commit, one independent check, gates green on the branch merged with
`origin/claude/sweet-newton-c8wrv1`; builders on mq-opus-medium for each new screen):
- **T2** Shell + tokens: four places, profile menu, bottom bar < 820 px, light tokens, `areaOf()` (`teacher-areas.js`),
  `css/teacher-*.css`; old screens reachable.
- **T3** Skills gallery + Browse by + tray + popup + chip options sheet + worksheet sheet + Quiz + Share (+ queued 2, 3).
- **T4** Lessons (+ queued 1: multi-lesson sets).
- **T5** Classes.
- **T6** Redirects / aliases (`?code=`, `?c=`, `?quiz=`, `#wrm/…`, `#map/…`, `#todo/…`, `mq_teacher_screen`,
  `mq_teacher_sets`, `tvGo`, `tvOpenPrintWith`, `?board=1`), retire old entry points; teacher gates.
- Acceptance: the §2.6 flows, counted in actions, at 1366 and 390 (the mock-up's `flows.js` rows are the list).
- Not owned (report to the lead if needed): `sheet/*` (e.g. `roles/test.js` Quiz layer, new anchors modes `top`/`first`),
  `print-sheet.js`, generators, `tests/scripts/*` (so new teacher gates such as `ws-teacher-flows` are proposed to the
  lead; lane checks live in `design/mockups/teacher-2/` meanwhile).
| 2026-10-24 | Owner (direct): "have an exact count for the how often equal OR a %" → How often per skill = Less · Equal · More, OR an exact count of problems (`count`, "6 🔒"), OR a % (`lockPct`); counts come off the total first, then %, then weights; over-total refused; built in T3 (planCounts + popup/chip/bulk bar) | lane lead → T3a, T3b | in T3 |
| 2026-10-24 | Owner (direct): "another option can be how many problems of each — print should ask as an option for total amount of pages, total amount of problems etc." → worksheet / Quiz "How much?": Pages · Problems in all · Problems of each skill; summary always gives pages · problems · about n of each; per-skill count / % still win | lane lead → T3b | in T3 |
| 2026-10-24 | Owner (direct, two images in `design/mockups/teacher-2/owner-2026-10-24/`): "make each grade a different color as well. here are the colors. ALSO use this visual hierarchy as its better". Grade colours sampled: PK4 #E2BD96 · K #E6BD5E · G1 #D56455 · G2 #96AE82 · G3 #7E9AC4 · G4 #B589AF · G5 #8579B8 · G6 teal #5E9E9A (owner confirmed via lead). Supersedes "grade never colour" (badge keeps its number/label so it is not colour-only; text colour chosen for ≥ 4.5 : 1). Skills hierarchy from the image: title + subtitle + "Grade 2 • 99 skills", search top right; ONE white filter card (Grade row K…6 + Mixed levels; divider; Browse by + Size); "+ Add whole grade" with helper text; area band (icon tile, title, n skills, Thumbnail · List · Chip, + Add whole area); cards with grade pill + tick + title + preview; tray "Tray / n skills selected", chip, +N more, "Review n skills", Quiz, Share, Print. Primary and selected = indigo fill #3438C6 (soft selected #E9EBFC), side-menu active = indigo | lane lead → T3a (Skills, shell), T3b (sheet primaries) | in T3 |
| 2026-10-24 | Owner (via lead, confirmed): per-skill exact % OR exact count, mixable (rest share what's left), or one total split by How often; **Versions**: any number of versions of the same set, each with new problems (seed + v), same mix and layout, all in ONE PDF, keys after each (default) or all at the end; summary "3 versions · 24 problems each · 9 pages + keys"; check: N versions → N different first pages, identical per-skill counts | lane lead → T3b | in T3 |
| 2026-10-24 | Owner clarification (via lead): counts at three levels that combine — one skill (count or %), a chosen group of selected skills (one total split by How often; bulk bar "Problems for these: N"), all skills (overall total); specific wins; summary shows per-skill result; impossible sums are said plainly with a fix offered, never silently rescaled | lane lead → T3a, T3b | in T3 |
| 2026-10-24 | Owner addition (via lead): "OR the same with percentage options": every level (skill, group, all) takes a count OR a % of the whole set; >100 % or over-total warned with a fix; % rounded to whole problems; summary shows per-skill counts | lane lead → T3a, T3b | in T3 |
| 2026-10-24 | Owner (direct): indigo primary clashed with OA #5155BC (ΔE 8.5) → "Move Operations colour"; then chose **olive green #729C00** (tint #EDEED7, soft #D2DCA7, deep #3F5600, ink text). No colour clears every rule once indigo is the primary: owner accepted the olive's colour-blind closeness to key orange (8.3) and error red as a recorded exception in ws-teacher-tokens (still measured, floor 8); all other checks unchanged and green | lane lead | done |
| 2026-10-24 | T3 built: T3a (3fc8d5a, 2ceebe6, 64a9571) Skills gallery, tray bar/popup, chip options; T3b (c3961f0 … dd2f89c) teacher-plan + Worksheet/Quiz/Share sheets, Versions. Flows in plan at 1366/390 | mq-opus-medium ×2 | built |
| 2026-10-24 | T3 independent check (f3ee1c7): clear bugs — whole grade Print freezes ~188 s and numbers disagree; >5-skill list 0 px at 1366; tray checks counts vs a fixed 8; PDF counts ≠ plan; preset key mismatch; word-problem quiz link > 8000 (Copy disabled); Share/Print open jank 6–11 s; versions footer "Form A"; chip badge spill. Clean: layout, colours, links, codes, dark mode, no console errors. Gates OK except preview (the gate's own tap) and tokens (since fixed, 76af7ba) | mq-opus-medium | fixes running (same builders) |

### Per-round lists (rule 00), T3 check

| Finding | Check that would have caught it |
|---|---|
| Whole-grade Print freezes 188 s | a time budget: tray of 89 skills → sheet first paint < 2 s, in sheet-flows.cjs |
| Stepper / summary / PDF disagree; printed counts ≠ plan | PDF per-skill item counts == planCounts for several settings (incl. groups, 6 Equal, whole grade) |
| >5 list 0 px at 1366 | every visible list container has height > 0 at every width (views-check style matrix over the sheets) |
| Tray refuses counts > 8 | popup validation uses the same total the sheet will use (one source) |
| Word-problem quiz link > 8000 | quiz-online flow run for a word-problem skill as well as a fact skill |

| Cost | Smallest change |
|---|---|
| Two builders split one feature at the plan/tray boundary; field names drifted (groups, locks, total) | define the shared state module + its API in the brief before splitting |
| Owner changes arrived mid-build (6 in one session) | fold them in at once but re-run the number checks after each, not only at the end |
| 2026-10-24 | T3 fixed (64150b2, f77d44b, 991ceca, f8793e0) and merged with base (1ca4554); all 8 gates OK; reported to lead | lane lead | done |
| 2026-10-24 | T4 built (dd51903, d3770d6, 7db3d1f, 9006b52): Lessons in the T3 look, lesson panel, multi-lesson sets with Print all | mq-opus-medium | built |
| 2026-10-24 | T4 check (9006b52): clear bugs — loose skills dropped from a lesson-group print; summary false with lesson groups (says 3 pages · 12, PDFs 5–18 pages · 22–25); detailed Print lesson detours to the old print screen (6–7 actions, plan 4); pre-skills leaves a tray group. Clean: order, keys, ticked-only, #wrm, opens-where-last, no console errors; 8 gates OK | mq-opus-medium | fixes running (same builder) |

### Per-round lists (rule 00), T4 check

| Finding | Check that would have caught it |
|---|---|
| Summary false with lesson groups | summary numbers == PDF pages/problems for every Print option (same rule as T3's plan-pdf-check, extended to batches) |
| Loose skills dropped | tray-in == skills-printed set equality for mixed trays (groups + loose) |
| Detailed lesson detour | flow table runs every Lessons row incl. a detailed lesson, not only the standard maker |
| Repeat of T3's class (summary ≠ output) | every new print path must be added to plan-pdf-check in the same commit (brief rule for T5/T6) |
| 2026-10-24 | Owner (direct): "T5 we don't need classes right now" → T5 skipped. Classes keeps T2's tabs onto today's screens (Run on the board, Quizzes, MAP tests, Progress), all reachable; no new Classes build. Next after T4: T6 | lane lead | T5 skipped |
| 2026-10-24 | T4 fixed (756e8cf, 6f045e9, d709a7f), merged with base (5dfb551), 8 gates OK; PR #17 (T2–T4) merged by the lead | lane lead | done |
| 2026-10-24 | T6 built (57f7bbb, da96fd3): menus = Skills · Lessons · Classes(4 tabs) · Me; redirects for ?code/?c, ?quiz, #wrm, #map, #todo/<entry>, mq_teacher_screen, mq_teacher_sets, tvGo, tvOpenPrintWith, ?board=1; shell gate rows. Draft PR #20 | mq-opus-low | built |
| 2026-10-24 | T6 check (da96fd3): all redirects and 12 jobs work at 1366/390, no regressions; clear bugs: ws-teacher-shell's new visit() aborts CSS loads (gate bug); text still names removed tabs. Owner notes: teacher hash links land on the pupil home unless Settings › "Open the site in" = Last view; whole-grade print still slow (Grade 1: ~26 s sheet, ~118 s document) | mq-opus-medium | fixes running |

### Per-round lists (rule 00), T6 check

| Finding | Check that would have caught it |
|---|---|
| Gate's own navigation aborts loads | gate helper rule: every visit waits for `load` before leaving; a gate's console check runs 3× before commit |
| Text names a removed tab | grep the teacher JS/HTML for every retired tab label when a tab is retired (same commit) |
| Whole-grade print 118 s | a time budget on Print (not only on first render): 47-skill tray → document < 20 s |

## Speed reflection (lane S2, 2026-10-24)

**Agent spend** (subagent tokens): r6 fix 0.30 M · T2 0.32 M + check 0.19 M · T3a 0.66 M + T3b 0.46 M + check 0.24 M · T4 0.42 M +
check 0.18 M · T6 0.14 M + check 0.18 M ≈ **3.1 M** (limit 20 M). Wall time ≈ 14 h, much of it waiting on slow gates
(ws-teacher-wrm 15 min a run) and on builders' long verify loops (r6 fixer 2.6 h).

| What cost time | Cause | Change for next time |
|---|---|---|
| r6 mock-up fixer ran 2.6 h after its fixes were committed | open-ended "run every check" loop on a gate that times out | give builders a time box and the exact final command list; stop at the first green run |
| Gates run on a tree another agent was editing → false FAILs (wrm, boot) twice | parallel builders share one working tree | gates and checks always run in a frozen `git worktree` at a commit (adopted from T3 on) |
| T3 split in two builders → field-name drift (groups / locks / total), one builder committed the other's WIP | no shared-state API fixed before the split | write the shared module's API in the brief first, or give the shared file to one builder only; never `git add` outside own paths |
| Summary ≠ PDF found twice (T3, T4) | each new print path added without a summary=PDF check | rule: every print path is added to plan-pdf-check in the same commit |
| Six owner design changes mid-T3 | owner saw screenshots and refined | worth it (owner wanted them); fold in at once, re-run the number checks after each |
| Colour clash (indigo primary vs OA) found only by the token gate after the build | owner's new primary not run through the palette check when given | run `colour.py`-style check the moment an owner gives a new colour, before briefing builders |
| Check-then-fix by resuming the same builder (SendMessage) | — | kept context, cheapest fix rounds of the lane; keep doing it |
