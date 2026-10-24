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
