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

## Later — intervention lessons (owner, 2026-09-25: "record it for later")
An **intervention lesson for every White Rose Maths small step**, using the same lesson system (warm-up on
prerequisites, minimal-words worked example, we-do, massed practice, optional mixed), tagged to the small
step, CCSS and EE. Starts after the sample lessons are approved and the WRM small-step inventory
(`design/WRM_ALIGNMENT_PLAN.md` phase 1) exists.
