# Critic brief template — COPY-LIGHT (narrow) review of one skill on an already-passed template

Owner rule (2026-11-13, CLAUDE.md "Fastest-implementation plan" item 2): the FIRST skill on a template gets the full critic.
Every later skill on an ALREADY-PASSED template gets the machine gates plus a NARROW critic on its own content only, on a
sample of pages. This is that narrow critic. RUBRIC.md "How a page counts as graded" → "Copy-light route" is the rule.

The lead or lane fills the `<…>` fields and pastes the brief whole. The critic is a fresh `mq-opus-medium` sub-agent
(`model: "opus"`) that did not build the work.

---

**You are an independent critic (Opus 5.5, medium), copy-light route.** Skill: `<cat:skill>` (`<label>`), grade `<G>`.
Template: `<template>`. Anchor: `<anchor cat:skill>`, which passed this template at ≥ 8 (`js/modules/redesign-passed.js`:
`<evidence line>`). Lane `<lane>`, round `<n>`.

## Before you grade — the route must be valid

1. `node tests/scripts/ws-precritic.cjs --skill <cat:skill> --copy-light --strict` ran on the lane branch merged with the
   integration branch, and its table is green; the `ws-copy-light` row reads ELIGIBLE and names the anchor above. If the row
   reads NOT ELIGIBLE, or is missing, STOP: this skill needs the full critic.
2. The sample is `<logs>/copy-light-sample.json` (written by that run). Grade EXACTLY its pages: each entry
   `{n, role, size, seed, host, width, option, value, opts}` is one page (print: `role` at `size` with `seed`, `opts`; a screen
   host: `host` at `width` px with `opts`). Render with `node tests/scripts/ws-grade-render.cjs` (or the lane's render
   command) on those values. Each page's key is part of the page.

## What you grade — the skill's OWN content only

Layout and drawing are INHERITED from the anchor: cell geometry, type sizes, stroke widths, the frame, the slot shapes, the
host chrome. Do not re-grade them unless you see a defect in them (below). Grade:

- **Answers.** Every item's answer and every key entry is correct; the key matches the page item for item; no item gives
  its answer away (the stem, a picture, a bank, a singular word).
- **Ladder / one new thing.** Across the roles of the sample the skill teaches one new thing per step (PEDAGOGY P-1): the
  model shows what the guided page asks, hint scaffolds fade, structural ones stay, the test asks what was taught.
- **Words.** The "I Can" title, the instruction strings, the `Say:` band, error-analysis and reason-it wording, story
  wording: plain, true to the skill's name ("within N" bounds the answer), ELL-friendly, no wording the pupil cannot read.
- **Option behaviour.** Each sampled option value does what its label says on that page (band, support, form …), and the
  page with it still matches the skill's name.

## The four criteria and the bar

Score each sampled page 1–10 on the four RUBRIC criteria (C1 correct maths and answers, C2 teaches one thing at a time,
C3 matches the design contract, C4 works for the pupil on print and screen). For C3 and C4 the inherited layout scores
as the anchor's grade unless you file a defect. **8 or more on all four criteria on every sampled page; one 7 is a FAIL.**

> **Legibility is scored.** Anything you notice that is small, hard to read, cramped, faint or thin (dots, digits, labels,
> strokes, a tall narrow drawing in a wide cell) is a numbered defect with its criterion and hard cap, never an "unscored note".
> A page or host carrying one does not pass. (Owner, 2026-11-13; LESSONS_LEARNED process rule 10; RUBRIC "How a page counts as
> graded".)

## Escalation to a full critic

**Any layout or drawing defect you find → this skill goes to a FULL critic** (RUBRIC route 1 at every size, role and host).
A layout defect is anything the anchor's pass should have covered: overflow or a clipped cell, an empty band, a wrong size,
stroke or grey, a slot shape, a host that cuts content, a legibility defect. File it with its criterion and cap, write
`ESCALATE: full critic (<defect ids>)` at the top of the report, and still grade the content you saw. If the same defect is
on the anchor's own renders, say so: the anchor's certificate may need re-grading (RUBRIC "a page below 8 fails the batch").

## Report

One table, a row per sampled page: `n | role or host | size or width | option=value | C1 | C2 | C3 | C4 | defects`. Then the
numbered defects (id, page, criterion, cap, what you saw, the fix), the verdict `PASS` (every page ≥ 8 on all four) /
`FAIL` / `ESCALATE: full critic`, and the two rule-00 lists: the automatic checks that would have caught each finding,
and the speed-ups the round revealed.
