# MathQuest master plan — waves (owner, 2026-10-02)

The owner's order of importance:

1. correct the program;
2. catalogue and tag, finding the skills still needed so every WRM small step, CCSS standard (and lettered part)
   and EE is fully met;
3. a simple teacher side with a WRM page;
4. only three worksheets: skill, mixed, quiz;
5. existing skills redone to 8/10;
6. new skills to 8/10;
7. lessons.

Every item from the owner's to-do list, the MAP Math Skills guide and the decimal-worksheet picture is sorted in
below. "Today" says what the code does now (checked 2026-10-02 on `claude/sweet-newton-c8wrv1`, which matches the
deployed tree for these files). **The owner orders the waves before work starts.**

**Standing rules:**
- An independent critic scores ≥ 8 before anything merges. **Critic feedback must be actionable (owner 2026-10-02):** every defect names where (file:line or PNG + item), what is wrong (observed vs expected, measured), which criterion it costs, and the exact fix plus the check that proves it; every criterion below 10 says what would raise it to 10. No vague items.
- Full gates, stamp, then deploy. **Check economy (owner 2026-10-02):** while building, a lane runs only targeted browser gates (`--skills` / `--category` for what it touched, or a ~20-skill cross-family sample for a global change) plus `ws-boot-smoke` and the non-browser unit gates; the full sweeps (`ws-screen-answer`, `ws-screen-slots`, `ws-share-options`, `ws-content-audit`, `ws-print-lint --source kit`) run once on the merged tree before each deploy. Nothing is skipped: every full gate still runs before anything ships.
- At most 8 agents. Browser gates: **two at a time** (owner trial 2026-10-02; back to one if the machine is overloaded) via `/tmp/mq-browser-run.sh <cmd>`; stress/load tests run `--exclusive`; `echo 1 > /tmp/mq-browser-slots` reverts to one. Builders run on **Opus 5.5 low**, critics on **Opus 5.5 medium** (owner, 2026-10-02, latest); escalate a builder to Opus medium at most, only for a persistent unsolved issue (see CLAUDE.md "Agents").
- `design/STATUS.md` is updated after each wave.
- The paused lane branches (`claude/sweet-newton-c8wrv1-wip-*`) are reused where their work fits.

**WRM reference (read-only, never write to it):** repo `timjmills/awsajacademymath`, site
https://timjmills.github.io/awsajacademymath/. It is the source for grades → units → small steps, refreshed with
`tests/scripts/ws-wrm-extract.cjs --site <index.html>`.

## Owner answers (2026-10-02)

| Topic | Answer |
|---|---|
| Key answer colour | **Reddish orange** (replaces the red recorded 2026-09-27; INK-31 to be updated when built) |
| MAP skills | Built as normal skills (tagged, 8/10, usable on any worksheet); the MAP screen picks from them by strand |
| Digital worksheets → Seesaw / Google Classroom | Experimental; after everything else, before lessons |
| Atomised Lesson V20 | The owner supplies it when the lesson wave starts |
| Skip | A teacher option; appears only after N wrong tries (default 5) |
| Calculator | Per skill, teacher option, off by default |
| Faded supports | A skill-worksheet option that fades supports all → mixed → none, in three modes: **Faded problems** (every N problems, e.g. 3), **Faded page** (across one page), **Faded packet** (across 2, 3, 4, 5 … pages) (owner 2026-10-03) |
| WRM page | Teacher-facing only; from a small step or unit: print a worksheet, send a practice code, make a quiz |
| Deploy | Each Wave 1 lane deploys (push to master) as soon as it passes critic ≥ 8 + full gates + stamp (owner 2026-10-02) |
| Skip setting | Per skill, default 5 wrong tries; travels with the skill (skill option) |
| money_count default | Mixed coins by default; "all the same coin" stays a teacher choice |
| Practice map tile | Opens a **MAP strand picker**: each strand lists its MAP skills; from a strand or skill the teacher can print practice or send a practice link (MAP skills only) |
| MAP representations | MAP keeps moving between two representations (picture → equation, model → number, graph → sentence, story → operation…). Build **more practice skills of this two-representation kind** (see 6.4) |

## Wave 1 — Correct the program

| # | Item | Today | Size |
|---|---|---|---|
| 1.1 | Answer squares get a box or light shading so pupils see where to write (screen and paper) | slots exist but are faint in places | small to medium |
| 1.2 | Active answer box highlighted and pulsing (flashing yellow), moving to each next problem; on the online worksheet the whole current problem and its box pulse, then it moves to the next problem when finished; steady highlight under reduced motion | no pulse anywhere (the focus ring was turned off by rule R3-3, `css/screen-cell.css`); `worksheet.js advanceToNextProblem()` focuses but does not highlight | small (additive CSS + class) |
| 1.3 | Skip: a teacher option, shown only after N wrong tries (default 5) | hard-coded: 3 free skips, then every other question (`game-control.js:381-414`); a second "Next" appears after wrong tries | small (`state.currentQAttempts` already counts tries) |
| 1.4 | Calculator: per-skill teacher option, off by default | per skill or question via `q.calculatorAllowed` and a skill list in `data.js`; no teacher toggle; `state.calculatorEnabled` unused | small |
| 1.5 | Audio button on hints | hint modal has no speak button; text-to-speech exists (`hints-speech.js _safeSpeak`) | small |
| 1.6 | Student home: replace "Start game" with Start practice / Start boss battle / Start car race / Start worksheet; MAP stays at the bottom | mode cards + "🚀 Start Game" + MAP K-2 / 3-5 / K-5 buttons (`index.html:718-832`) | small |
| 1.7 | Skip-counting number lines: first two filled, to 12 or 15, or 50 % filled; number grid redone (owner-dated, overdue) | `count_by_tables` has "% blank" (first number always prints); no "first N filled"; grids have empty-box counts | medium, critic ≥ 8 |
| 1.8 | Print-check backlog: 33 of 191 documents fail `ws-print-lint --source kit` | listed by lane in `design/audit/BACKLOG.md` | medium |
| 1.9 | Settle the `ws-screen-answer` load flake | fails under heavy load only | small |
| 1.10 | Student load on math.cultivatingthedigital.org | purely static GitHub Pages, no back end; pupil data stays in the browser; no per-pupil external calls. Check asset sizes and CDN fonts, and record | small (check + note) |

## Wave 2 — Catalogue, tag, find the missing skills (records first, no UI)

| # | Item |
|---|---|
| 2.1 | Tag every skill with its WRM small step(s), **pre-skills** (prerequisites) and related skills, plus its CCSS (and lettered part) and EE. Work Reception → Y6, early units first. Today steps have no prerequisite links; `lessons/prereqs.js` covers only 3 lessons, and `prerequisite-skills.js` exists on the teacher-UI branch only. |
| 2.2 | For each small step / standard / EE: is it fully met by one or more skills, with several support options (Reception included)? Verdicts go in `WRM_COVERAGE.md`, `STANDARDS_COVERAGE.md` and `standards-audit.js`. |
| 2.3 | Gap list in `BUILD_LIST.md`: every missing skill or option, by WRM block, including the MAP gaps (Wave 6 table). |
| 2.4 | Gates: `ws-wrm` and `ws-standards` report the gaps; a new pre-skill check (every step lists its skills and pre-skills); a critic audits a sample of tags (≥ 8). |

## Wave 3 — Teacher side, simple (builds on the paused teacher-UI branch)

| # | Item |
|---|---|
| 3.1 | Home: six large tiles (Make skill sheet, Make mixed review, Make quiz, Make lesson — hidden until Wave 8, Send practice code, Practice map) and a small secondary menu. **Practice map** opens the MAP strand picker (strands → their MAP skills → print practice / send practice link; MAP skills only). |
| 3.2 | Gallery picker by default wherever skills are chosen: Big 3 / Medium 4 / Small 5 across plus a list view; search, Grade, Domain, Topic; select many at once. |
| 3.3 | Sets auto-save in the browser until deleted; a Sets area lists every set for any paper, quiz or code. |
| 3.4 | **WRM page** (new, teacher-facing): grades → units → small steps with a grade filter and search. Opening a step shows its skills, pre-skills and related skills. From a step or unit: print a worksheet, send a practice code, make a quiz — for the step's own skills **or its pre-skills** (owner list: "students can practise the pre-skills or the actual skill for the chosen lesson"). Data comes from Wave 2 and the WRM reference site. Today there is no WRM screen. |
| 3.5 | Critic teacher-r1 at 1280 / 820 / 390, every action clicked. |

## Wave 4 — Three worksheets: skill, mixed, quiz

| # | Item | Today |
|---|---|---|
| 4.1 | Skill worksheet: one skill with its I Can line, Daily look; option **Fade supports** (all → mixed → none), three named modes (owner 2026-10-03): **Faded problems** — a support is removed every N problems (e.g. every 3); **Faded page** — the fade runs across one page; **Faded packet** — the fade runs across 2, 3, 4, 5 … pages | the print screen offers about 16 page types (Practice / Teach / Check / Facts / Thinking) |
| 4.2 | Mixed worksheet: per-skill weights (equal by default) and "Mix in prerequisite skills" (all listed, none ticked) | built on the teacher-UI branch, not live |
| 4.3 | Quiz worksheet: mixed with points (each / by type / per question), built from CCSS / EE / WRM step or unit, standards breakdown on the key | built on the teacher-UI branch, not live |
| 4.4 | Answer key: at the end **or** after each page; **short** (answer list) **or** mirror layout; answers in **reddish orange** | one on/off switch; keys always after all pages; mirror only; black (`--ws-ink`) |
| 4.5 | Other page types leave the UI; old codes and printouts still decode | — |
| 4.6 | Critic on the three papers and their keys | — |

## Wave 5 — Redo existing skills to 8/10

| # | Item |
|---|---|
| 5.1 | Resume the paused lanes from their backup branches: place value, figures, geometry, K-2, operations, fractions, worked examples. Order by WRM, early units first; each goes fix → critic ≥ 8 → merge. |
| 5.2 | Steps and Number line as support options on every skill where they fit (the decimal-worksheet picture: a steps box plus a number line). Today both exist in `SUPPORT_LABELS` ("Step checklist", "Number line 0 to 20") but only some skills offer them, and the line is 0–20 only. **Custom number line at the top of the page (owner 2026-10-03):** a support option on every skill where a number line helps (add/sub, counting, skip counting, rounding, fractions, decimals, integers, measurement): a reference line printed once at the top of the page (and above the card on screen), with the teacher setting start, end, step (whole, fraction or decimal ticks), which ticks are labelled, and optional jump arrows; sensible defaults come from the skill's own range. |
| 5.3 | Same skill with and without supports: add a skill twice with different supports and weight them, or show a different support each wrong try. Today the support ladder (`support-ladder.js`) already varies supports by wrong try; adding a skill twice with different supports is missing. |
| 5.4 | Remaining families: measurement, data, algebra, number theory. |

## Wave 6 — New skills to 8/10

**6.1 WRM / CCSS / EE gap skills** from the Wave 2 list, early units first, each tagged and critic ≥ 8.

**6.2 MAP task types** (built as normal skills; MAP #1 and the MAP guide):

| MAP task | Today | Work |
|---|---|---|
| One-step equations (x + 9 = 13) | exists `solve_eq_addsub` | re-grade |
| Order whole numbers and decimals mixed | partial (`order_decimals`, `order_least_to_greatest`) | add a mixed pool |
| Ratios from pictures | partial (`ratio_intro`, `equiv_ratios` are text only) | add a picture form |
| Symmetry: compare shapes' numbers of lines | partial (`symmetry`, `place_symmetry_lines`) | add a compare form |
| Symmetry: is this proposed line correct? | missing | new form |
| Equal sharing from a visual ("share N among M") | partial (`share_into_groups`, groups-of only) | add sharing |
| Division by making equal groups (drag) | partial (count or circle) | add drag on screen |
| Picture ↔ multiplication equation | exists `arrays_groups`, `dot_array_mult` | re-grade |
| Compare numbers: pick the lesser / greater | partial (`compare`) | add a pick form |
| Compare / order decimals | exists | re-grade |
| Area: pick the picture with area N | partial (`area_unit_squares` counts) | add a pick form |
| Order of operations, e.g. 47 − (2 × 8) | exists `oop_medium`, `paren_simple` | re-grade |
| Nets of 3-D solids | exists `net_identify` | re-grade |
| Missing angle in a triangle | missing | new skill |
| Volume by unit cubes | partial (formula and composite only) | add a cube-count form |
| Multi-digit addition | exists | re-grade |
| Perimeter | exists | re-grade |
| Base-ten model → number | exists `tens_foundation_visual`, `place_value_disks` | re-grade |
| >, <, = | exists `compare`, `compare_int` | re-grade |
| Compare expressions without computing | partial `compare_expressions` | extend |
| Fraction multiplication with visual models | exists `mult_frac_frac`, `mult_frac_whole` | re-grade |
| Reading clocks | exists | re-grade |
| Minutes → hours (90 min = 1.5 h = 1 ½ h) | partial (hours → minutes only) | add the reverse, with decimal and mixed hours |
| Line / dot plots | exists `line_plot*` | re-grade |
| Adding decimals | exists `add_decimal` | re-grade |
| Two-step change problems: start → more/less → more/less again → final (add-add, add-sub, sub-add, sub-sub) | exists `multi_step_word` | re-grade, and add a teacher option choosing which of the four change patterns (default all four, equally) |
| Ordering times / a time between two times | exists `order_clocks_*`, `elapsed_*` | re-grade |
| Equal groups total | exists | re-grade |
| Meaning of a coordinate point in context | missing | new skill |

The emphasis throughout is moving between representations: picture → equation, equation → meaning, graph →
sentence, model → number, story → operation, shape → property.

**6.4 Two-representation skills (owner 2026-10-02):** audit every MAP strand for the representation pairs MAP tests
(picture ↔ equation, model ↔ number, graph ↔ sentence, story ↔ operation, shape ↔ property, number line ↔ number,
clock ↔ time words, array ↔ multiplication) and build a "match the two" form for each pair that has none, as options
on existing skills where the content fits and new skills where it does not; each tagged and critic ≥ 8.

**6.3 MAP practice set:** seven strands (Number & place value, Operations & algebra, Multiplication & division,
Fractions & decimals, Measurement, Geometry, Data & graphing), picking from these skills. Today the MAP engine uses
4 domains (OA, NO, MD, G) and RIT-band skill lists (`data.js`, `map-engine.js`, `teacher-map.js`). The MAP buttons
stay at the bottom of the student home.

## Wave 7 — Experimental and extras (after everything else, before lessons)

| # | Item | Today |
|---|---|---|
| 7.1 | Digital worksheets pupils fill in on screen, then send to Seesaw or Google Classroom (share buttons) — a trial | `google-classroom.js` exports images to a Google Form / Classroom assignment (needs a teacher OAuth client ID); no Seesaw; no fillable export |
| 7.2 | Car race and boss battle made more interesting | emoji hero vs dinosaur on a timer; two-lane race vs a timed computer car (`boss-race.js`, 116 lines) |

## Wave 8 — Lessons

The intervention lesson library uses the owner's **Atomised Lesson V20** format (he supplies it). It covers every WRM
small step, CCSS standard / part and EE; each lesson is tagged and tied to a skill that practises it the same way.
It includes the prerequisite check and per-part new numbers, and builds on the paused lessons-engine branch. The
record is `LESSON_COVERAGE.md`.
