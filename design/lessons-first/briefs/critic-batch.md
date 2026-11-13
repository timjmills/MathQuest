# Critic brief template — BATCH critic: 3–6 skills on ONE already-passed template

Owner rule (2026-11-13, CLAUDE.md "Fastest-implementation plan" item 3): batch critics, 3–6 same-template skills per
critic run. Each skill in the batch is on the copy-light route (item 2), so this brief is `critic-copy-light.md` run once
for several skills: read that brief whole; this one only adds what changes. RUBRIC.md "How a page counts as graded" →
"Batch route" is the rule. **A batch never holds a template's FIRST skill** (that one gets the full critic).

The lead or lane fills the `<…>` fields and pastes both briefs. The critic is a fresh `mq-opus-medium` sub-agent
(`model: "opus"`) that did not build the work.

---

**You are an independent critic (Opus 5.5, medium), batch route.** Skills: `<cat:skill 1>`, …, `<cat:skill n>` (3–6).
Template: `<template>`. Anchor(s): `<anchor cat:skill>` (`js/modules/redesign-passed.js`). Lane `<lane>`, round `<n>`.

## Before you grade — the batch must be valid

1. `node tests/scripts/ws-precritic.cjs --batch <k1,k2,…> --strict` ran on the lane branch merged with the integration
   branch; its table is green and its `ws-copy-light` row reads `BATCH OK … on template <template>` (every skill ELIGIBLE,
   one shared passed template). A `BATCH FAIL` row (mixed templates, an ineligible skill, fewer than 3 or more than 6
   skills) means no batch: each skill goes on its own route.
2. The sample is `<logs>/copy-light-batch-sample.json`: ONE shared sample budget for the whole batch. Each role is graded
   once in the batch (on one of the skills that offers it), every skill has at least one screen host, all of its own option
   values and at least two pages; the screen pages cover every width 1280 / 1366 / 820 / 1024 across the batch. Grade
   exactly those pages: `node tests/scripts/ws-grade-render.cjs --sample <logs>/copy-light-batch-sample.json --out <dir>`
   renders each with its own role, size, seed, host, width and opts.

## What you grade

The same as `critic-copy-light.md`: each skill's OWN content only (answers, ladder / one new thing, words and instruction
strings, option behaviour) on its sampled pages; layout and drawing are inherited from the anchor. The four criteria are
RUBRIC's, by name (**C1 Ease of use**, **C2 Educational value**, **C3 Spacing and layout**, **C4 Standard fidelity**), and
the bar is unchanged: **8 or more on all four criteria on every sampled page of a skill; one 7 fails that skill.**

> **Legibility is scored.** Anything you notice that is small, hard to read, cramped, faint or thin (dots, digits, labels,
> strokes, a tall narrow drawing in a wide cell) is a numbered defect with its criterion and hard cap, never an "unscored note".
> A page or host carrying one does not pass. (Owner, 2026-11-13; LESSONS_LEARNED process rule 10; RUBRIC "How a page counts as
> graded".)

## Verdicts are per skill

- **A skill failing does not fail the others.** Each skill gets its own PASS / FAIL from its own pages only. A role graded
  once in the batch counts for the skill it was dealt to; a defect in a page of skill A is filed on skill A.
- **A defect that is the template's, not the skill's** (it would show on any skill of the template) is filed once, on
  every skill whose sampled page shows it, and escalates as below.
- **Escalation:** any layout or drawing defect → that skill goes to a FULL critic (`critic-copy-light.md` "Escalation"); a
  defect that is the template's sends every skill of the batch whose pages show it, and the anchor's certificate is
  re-checked (RUBRIC: a page below 8 withdraws the pair's certificate).

## Report — one run, one report

1. **Per-skill verdict table:** `skill | pages graded | lowest C1 | C2 | C3 | C4 | verdict (PASS / FAIL / ESCALATE) | defect ids`.
2. Per skill, the per-page table of `critic-copy-light.md` and its numbered defects (ids prefixed by the skill id).
3. The two rule-00 lists (automatic checks, speed-ups) once for the batch.

A skill that PASSES goes into `js/modules/redesign-passed.js` with the evidence line naming this batch report, the round
and the anchor; the lane adds it in the same change.
