# Status and handover — paused 2026-09-26 (owner: "stop our work for now, keep track of what is done")

Read this first when work resumes. It records what is live, what each work lane had done when it paused, what the
independent critics last found, and the next step for each lane. Owner rulings are recorded in the design docs named
below; this file only points to them.

## 1. What is live

- **master = `2e434cd`** (deployed to math.cultivatingthedigital.org). Branch `claude/sweet-newton-c8wrv1` = same tree
  plus this handover.
- Live since the last update: the copyright line on every printed page, key and lesson page (and on every web page);
  the guided / paginator round (one spare-height rule, min-size floors, answer-free hints, Model working, Review
  sections — one section per skill); Error analysis / Find-the-mistake paused; the three sample lessons (add within 10,
  subtract 2-digit regrouping, round to nearest 10) at 48/48 critic passes.
- Deploy gates on `2e434cd`: all unit gates, content-audit, standards, codes (608), share-options, teacher
  library / preview / quiz / shell OK. `ws-screen-answer` failed once on the base10_build online worksheet in a full run
  under heavy load and passed alone and in sequence (recorded as a load flake).
- A full `ws-print-lint --source kit` over every skill (never a deploy gate before): 33 of 191 documents fail, 463
  findings — mostly legacy operations and a few K-2 / fraction skills. List by lane in `design/audit/BACKLOG.md`.

## 2. Owner rulings this cycle (where they are written)

| Ruling | Recorded in |
|---|---|
| Lessons one size; Practice / Mixed honour S/M/L, an item that can't shrink keeps its size | `LESSON_LIBRARY_PLAN.md` §8a |
| Every lesson opens with a 3–4 question prerequisite check that routes a struggling pupil to the prerequisite lesson | §8b |
| Stand-alone page types merge into the lesson designs | §8c |
| Find-the-mistake paused for all future worksheets (may return later) | §8d, `LESSONS_VISION.md` "Later" |
| Three papers: Practice, Quiz, Lesson. Thinking pages paused. Fact rows/probes are column options. Word problems are skills. Lesson parts all required, teacher ticks parts to print and refreshes any part with new numbers. Per-skill weights (equal by default in mixed review). "Mix in prerequisite skills" lists all, none ticked. | §8e |
| Practice worked example: one example on top of each block only | §8f |
| Quiz by CCSS domain / standard / EE / WRM / lesson, tagged questions, custom scoring, same Practice engine; six-tile home; thumbnails 3 across + list view everywhere | `design/TEACHER_SCREENS.md` |
| Copyright "© <year> Cultivating the Digital. All rights reserved." on every print and web page | `WORKSHEET_DESIGN_STANDARD.md` §8.5, `PAGE_TYPES.md` PT-FRM-7a |
| Retire the I Can look; Daily look everywhere, single-skill pages keep an I Can line | `PAGE_TYPES.md` (on the teacher-UI lane branch) |
| Rounding: plain rounding with a written answer, and one number rounded to 2+ places | met (critic pv-r3) |
| Per-part "New numbers" for the built lessons; per-section refresh noted as a later option | `LESSON_LIBRARY_PLAN.md` §8e |

Open questions for the owner: (1) "Practice map" tile — the UI lane wired it to the existing MAP tests screen; confirm
or say what it should open. (2) money_count defaults to "all the same coin", so its worked example can't show two kinds
of coin unless the teacher changes it — keep the default?

## 3. Work lanes at pause (not merged, not deployed)

Each lane is a git worktree at `.claude/worktrees/agent-<id>` on branch `worktree-agent-<id>`; every tree was clean
(WIP-committed) at pause. **These branches exist only in this container** unless pushed — see §6.

| Lane | Branch head | Done | Next |
|---|---|---|---|
| Lessons engine (a77a1a3e) | `ea22a97` WIP | Round 5 + `LESSON_RULES.md` + `ws-lesson-check`; Phase 0 steps 1–9 (library lessons, `sheet/lesson-pages/*`, `prerequisiteSkillsFor`, seed / coverage / build-list tools, browser lock); per-part seeds (`lessonPartSeed`, `req.lessonSeeds`); Prerequisite Check (4 questions, teacher tags, routing table on the key; replaces Warm-up; 11 missing prerequisite lessons recorded) | Fix 1 seed failure (refreshed add chart repeats a Practice fact 4 + 3), rerun 25-seed gate, re-stamp + re-render samples, critic lessons-r5; then tell UI lane parts + New numbers are ready; then anchor-chart cell overflows (16, `ws-anchor-steps`) and near-empty Mixed pages; then Phase 1 archetype pilots |
| Teacher UI / papers (aadfac31) | `c9fd46d` done | Daily look (`ef45aac`); three papers + `sheet/papers.js` + per-skill weights (also on screen) + prerequisite mix (`prerequisite-skills.js`); Quiz paper (build by CCSS/EE/WRM/lesson, scoring, key summary with standard subtotals); six-tile home, shared search `teacher-find.js`, thumbnails 3/2/1 | Critic teacher-r1 (was started, nothing graded — restart from scratch); allocate a codec-registry range for Quiz source/scoring in share codes; per-part New numbers once lessons lane lands |
| Worked examples / anchors (a8143d27) | `8efc257` done | anchor-r2 fixes (per-template ease + real move, choice items never examples, one-state facts, function-table footprint, page filling, generator fixes, add_fractions answer shape) | Fix the partial anchor-r3 findings (§4), finish grading r3 (seed b, Mixed set, lint) or run r4 |
| Place value / rounding (a0588074) | `8d968fa` WIP | Merged 2e434cd; pv-r3 fixes coded (cell sizing, per-page balance, models, screen expand / disks / supports, quiz no longer prints the answer, wording, ladder parser) — only `ws-pv-deal` run | Re-render S/L + pixel scan; guided pages still 37–55 % empty and 2 pages for disks / build / number line; gates; critic pv-r4. Entry 5 vis_pv_exchange on hold |
| Figures / data (a5485dd3) | `fb2c296` WIP | figures-r8 fixes A (kind dealt per item, check-box section), B (no repeats), C (S floors), D (card targets 45 px), G, F; gates green on merged tree | Screenshot the worksheet graph row fix, rerun gates once, report → critic figures-r9 |
| Geometry (a7a96a9d) | `032a27d` WIP | Merged sweet-newton + geometry-r2 grades; guided Steps on page 1 only; perimeter / area 8 at S, 6 at L; aligned answer boxes | Apply `design/audit/runs/geometry-r2/pending-p60.py` (volume solid beside answers); area_perimeter + perimeter_intro S; coord / fill / compose footprints; fixes 3–6 (screen, labels, dealing, panels); gates; delete committed `tests/scripts/tmp-*.cjs/mjs`; critic geometry-r3 |
| K-2 (a19dcb87) | `99eca66` WIP | k2-r3 fixes (screen digits 56/48/40 px, targets ≥ 44, sort at 390, mixed spill, count_sequence test, make_ten "Drawn as"); lint list: parity + frac-wall cells | mixed_composing S 32 % band; mixed-pool test pages one column (shared layout); gates; critic k2-r4 |
| Operations (a507ccc1) | `1ce8868` WIP | Step 1 backlog; build-list entries count_through_zero, share_and_group_early, add_sub_patterns, long_multiplication (+ short division) — ready for a critic; lint list partly moved to kit cells | Re-gate the 5 moved skills; rest of the lint list (AK-4 legacy slots, fonts, mixed density); shared layout PAGEFILL (2-column pages can't stretch rows); entry 5 add_next_10; critic ops-r1 on the 4 entries |
| Fractions (ac31945a) | `af4963f` WIP | 4 files of fractions-r1 fixes started (never resumed after the restarts) | Resume fractions-r1 fixes (62/242 at r1) + lint list (fraction_number_line, whole_as_fraction) |

## 4. Critic results (grades in `design/audit/runs/<run>/grades.jsonl`)

| Run | Tree | Result | Top open defects |
|---|---|---|---|
| lessons-r4 | f7ead37 | 48/48 at seed 4242 | seed-proofing (now covered by `ws-lesson-check`) |
| figures-r8 | a01d539 | 75/120 (r7 66); in scope 74/100; 4/10 skills pass | kind per page (fixed on lane), repeats, S shrinking, build_pictograph card |
| geometry-r2 | edbc048 | 84/220 comparable (r1 47); 106/300; panels 7/20 | guided page geometry, footprints (too few items, empty bands at S), transform screens at 390, label clustering, dealing |
| pv-r3 | 0dfed8e | 72/123 (r2 31/155); 0/13 skills; panels 1/13; both owner rounding requests met | cell sizing at S / Plain / guided, per-page balance, guided models, expand screen, quiz prints answer |
| anchor-r2 | 162bb13 | 20/90 (r1 0/44); count_by_tables and time_5min pass | example choice, state merge, function-table overlap, page filling (fixed on lane, awaiting r3) |
| anchor-r3 (partial) | 8efc257 | 21/53 graded (default seeds S+L, part of seed a); count_by_tables 5/5, mult_facts 5/5, time_5min 3/3, sub_50 4/5; money_count, make_change, function_table, add_mixed 0 | no-zero rule broken (39+23+31+7=100, 27−17=10); 3–4 problems a page at L / S = L on 6 skills; add_mixed drops its example at L; money_count b = c and "Start with the biggest" meaningless under the all-same default; make_change "Make 25"; add_fractions key simplifies inconsistently; sub_50 seed a spills to a 60 % empty page. Not graded: seed b, Mixed set, lint |
| teacher-r1 | c9fd46d | not graded (paused before any grade) | restart |
| k2-r3, fractions-r1, guided-r1, pv-r1/r2, figures-r7, geometry-r1, anchor-r1 | — | earlier rounds, kept for comparison | — |

## 5. The goal still open (owner, 2026-09-26)

Lessons in the sample format for every WRM small step, skill, CCSS standard / part and EE, in a lesson library, each
tagged WRM / CCSS / EE and tied to a skill that practises it the same way; a record of lessons to make, when each
standard is fully hit by lessons and by skills, skills and options still to make; everything critic ≥ 8 before commit.
Plan: `design/LESSON_LIBRARY_PLAN.md` (phases 0–4, archetypes A1–A13, `ws-lesson-coverage` → `LESSON_COVERAGE.md`).
Skill / standard records: `design/STANDARDS_COVERAGE.md`, `design/WRM_COVERAGE.md`, `design/BUILD_LIST.md`.
Phase 0 is on the lessons lane (above); Phase 1 (archetype pilots) is next.

## 6. How to resume

**Backup branches on origin** (owner-approved, 2026-09-26; WIP, never merged or deployed):

| Branch | Head | Lane |
|---|---|---|
| claude/sweet-newton-c8wrv1-wip-lessons | ea22a97 | lessons engine |
| claude/sweet-newton-c8wrv1-wip-teacher-ui | c9fd46d | teacher UI / three papers / quiz / home |
| claude/sweet-newton-c8wrv1-wip-anchors | 8efc257 | worked examples |
| claude/sweet-newton-c8wrv1-wip-placevalue | 8d968fa | place value / rounding |
| claude/sweet-newton-c8wrv1-wip-figures | fb2c296 | figures / data |
| claude/sweet-newton-c8wrv1-wip-geometry | 032a27d | geometry |
| claude/sweet-newton-c8wrv1-wip-k2 | 99eca66 | K-2 |
| claude/sweet-newton-c8wrv1-wip-operations | 1ce8868 | operations |
| claude/sweet-newton-c8wrv1-wip-fractions | af4963f | fractions |

To recreate a lane: `git worktree add .claude/worktrees/<lane> -b <local-name> origin/<branch>`.

1. The lane branches are local to this container. If the container was reclaimed, only what is on `origin` survives:
   master / sweet-newton (this file, all critic grades above, the backlog) — the lane work in §3 is lost unless it was
   pushed. Check `git branch -a` first.
2. If the worktrees survive: resume each lane with "resumed after owner pause; your tree is WIP-committed; continue
   from the Next column", at most 8 agents, browser gates one at a time.
3. Critic every lane before merge; merge + full gates + stamp (`ws-stamp-assets`) + deploy what passes.
