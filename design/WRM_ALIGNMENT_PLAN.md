# White Rose Maths alignment — owner direction (captured 2026-09-25)

## Goal (owner)
Exhaustively check the White Rose Maths (WRM) curriculum the school uses so that:
1. **Every WRM small step has at least one skill** that gets at its key lesson, concept, skill and vocabulary.
2. **Every WRM lesson, CCSS standard and Wisconsin EE that no skill fully covers gets its own skill**,
   built to our skill / print specifications (WORKSHEET_DESIGN_STANDARD, PEDAGOGY_STANDARD, the sheet kit,
   the 8/10 critic gate).
3. **Two-way tagging:** every skill/lesson is tagged to its WRM small step(s), and every WRM small step has at
   least one skill attached — exactly as CCSS and EE work today (`js/modules/standards.js`).
4. **Visuals:** the representations WRM uses in its lesson PDFs are replicated in our skills — as an option
   within a skill (O6 appearance / O3 support) or as a skill of its own — redrawn in our black-and-white
   Andika style (never copied artwork; copy the grammar, per CLAUDE.md).

## Sources (access confirmed, read-only)
- **Shared drive** "White Rose Maths Primary" (Google Drive connector): `Reception`, `Year 1` … `Year 6`,
  each with block folders (e.g. `Year 3 / 01 Autumn Block 1 - Place value`) holding the lesson files;
  plus `White Rose Guidance`, `Printable Pacing Guides`, `Printable Teaching Handbooks`,
  `Termly Assessments`, `Training`, and two existing mapping sheets:
  `WRM_to_CCSS_Mapping_v3` and `WRM_to_CCSS_Mapping_v3 (with Beyond CCSS)` — the starting crosswalk.
- **The school curriculum site** https://timjmills.github.io/awsajacademymath/ — repo
  `timjmills/awsajacademymath`, one self-contained `index.html` with all pacing, blocks, small steps and
  EE data inline (machine-readable).
- WRM lesson decks are largely images: visuals must be analysed by looking at the pages, not by text
  extraction (same lesson as the White Rose teaching-guide skills).

## Proposed phases (to plan when the owner is ready)
1. **Inventory** — extract every year → block → small step from the site data and the drive, with the
   existing WRM→CCSS mapping, into `data/curriculum/wrm-steps.json`.
2. **Crosswalk** — map each small step to existing skills (and CCSS/EE), extending `standards.js` with
   `wrm` tags and a `ws-wrm.cjs` coverage gate + `design/WRM_COVERAGE.md` gap report (like
   `ws-standards.cjs`).
3. **Visual catalogue** — per block, page through the lesson PDFs, catalogue each WRM representation
   (bar model, part-whole, place-value counters, ten frames, number lines, arrays, …), and map each to an
   existing template/option or a gap.
4. **Build the gaps** — new skills and new options/templates, each to the 8/10 critic gate, in agent lanes
   by family.
5. **Ties into** the lessons vision (`design/LESSONS_VISION.md`): WRM small steps give the lesson
   sequence and the vertical-alignment spine.
