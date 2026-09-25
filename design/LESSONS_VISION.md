# Lessons — owner vision (captured 2026-09-25, not yet planned)

Owner, verbatim intent: "We don't need to plan this now." This note records the direction so a later
planning session starts from it. It is a vision, not a spec.

## Lesson types, sorted by tags
Every skill gets a **Lesson** section. There will be several lesson types, sorted by **tags**. The first
type is **one lesson per skill**.

## Type 1 — the per-skill lesson
Order of the lesson:

1. **Warm-up (about ½ page) — prerequisites.** The lesson names the skill's prerequisites — the
   **skills**, **concepts** and **vocabulary** it depends on — and the warm-up reviews them.
2. **Worked example (½–1 page).** Step-by-step, with as few words as possible, explaining the concept
   simply for SPED / ELL pupils. The steps should be in as **memorable a format** as possible (a short
   numbered routine, a chant/mnemonic, the same icon per step).
3. **We do** — a couple of guided problems.
4. **Massed initial practice** — as long as the teacher wants.
5. **Mixed practice** (optional) — with other skills.

Every lesson is **tagged** to:
- its specific **skill**;
- its **CCSS** standard (except Pre-Kindergarten skills, which have none);
- its **Wisconsin Essential Element (EE)** where appropriate.

## What it needs first — vertical alignment
To name prerequisites, the app needs a **vertical alignment map** across all skills: how each skill
relates to every other (prerequisite / builds on / leads to), with concepts and vocabulary as nodes too.

## Existing pieces to build on (when this is planned)
- Standards database and skill tags: `data/standards/*.json`, `js/modules/standards.js`
  (`SKILL_STANDARDS`, `standardsFor`, `skillsForStandard`), `design/STANDARDS_COVERAGE.md`.
- CCSS progressions (the standards' own cluster/grade order) as the first draft of the prerequisite graph.
- Page roles already built in the sheet kit: model / guided ("we do"), independent and more practice
  (massed), mixed practice, anchors (S5/S6 worked step states), the `Say:` band, providers'
  `workedSteps` and `strings` (`design/PAGE_TYPES.md`, `design/SKILL_CELL_CONTRACT.md`).
- Pedagogy rules: `PEDAGOGY_STANDARD.md` (one new thing per step, scaffold fade, instruction library).
- The quality bar: every lesson page is graded like every other page — ≥ 8 on `design/audit/RUBRIC.md`
  by an independent critic.

## Owner rulings recorded 2026-09-25 (first sample lessons)
- **The I Do example is an ANCHOR CHART** the pupil keeps beside every later page: one worked
  problem step by step (its own cell drawn at each step, newest marks grey, earlier ones black), big
  numbered step headers each with the same icon, a chant where it helps, the `Say:` line, minimal
  words, and it prints on its own (a wall chart too). The same step names and icons repeat beside the
  We-do cells and as a step strip on every practice page.
- **One accent colour on lesson pages** (INK-30 in `WORKSHEET_DESIGN_STANDARD.md`): purple
  `#5B2A86`, chosen over reddish orange because it prints darker in greyscale; only for step numerals,
  their circles and step icons, always with a second cue; never for answers or decoration.

## First build (2026-09-25): the `lesson` page role
`buildSheet({role: 'lesson', sections: [{skills: [skill]}], practicePages, mixed})` prints the packet
(`js/modules/sheet/roles/lesson.js`, host `buildLesson` in `js/modules/print-sheet.js`):
1. **Anchor chart** (no Name / Score; its own key): the worked example in 2-4 step panels, `Say:`, `Rule:`.
2. **Lesson sheet**: `Vocabulary:` match (word to picture, key draws the lines), `Remember:` (the key
   concept), `Warm-up:` (the prerequisite skills' own generators, lettered and scored), `Guided Practice:`
   2-3 cells beside the chart's `Steps:` (cell 1 with the first step traced), then `Independent
   Practice:` rows filling the page.
3. **Practice pages** (Independent, the teacher's count) with the chart's step strip. One-line,
   one-number items (facts, "27 → ___") take the dense grid at the most a page holds within the 12.1
   ceiling (16 at S, else 12); taller items (column subtraction) print six a page, three across,
   grown to at most 1.3 × their own height (H13), so a short grid stops above the footer rather
   than drawing empty bands in every cell. The strip stays only when it keeps the page's columns
   and capacity.
4. **Mixed practice** (optional) with the lesson's earlier skills.
Every sheet's teacher footer carries the tags: skill id, grade, primary CCSS, EEs (`standards.js`).
The per-lesson data (prerequisite skills, concepts, vocabulary with pictures, the steps with their
icons, the chant and why) lives in `js/modules/lessons/prereqs.js`, shaped to grow into the
vertical-alignment map. Samples: `design/lesson-samples/`.
