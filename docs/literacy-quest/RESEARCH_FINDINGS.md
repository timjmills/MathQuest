# Phase 2.6 — Research Findings Summary

Consolidated synthesis across 5 research syntheses produced for the Literacy Quest expansion. The full per-source drafts live in `/docs/literacy-quest/_drafts/research/`. This document is the actionable summary used to plan Phase 3+ catalog and widget additions.

---

## Sources

| File | Lines | What it covers |
|---|---|---|
| `etc-digital-replica-synthesis.md` | 403 | Authoritative spec doc reverse-engineered from EPS published samples + reviews. 19 archetypes, 8-page lesson structure, OG concrete→abstract progression. |
| `etc-books-empirical-sample.md` | 276 | Empirical verification against 5 actual ETC PDFs. **Confirms all 19 archetypes**, no new types. Confirms all 5 Wave 5 widgets are warranted. |
| `etc-prequel-and-supplements.md` | 240 | Get Ready for the Code A/B/C, Basic Phonics Skills Level A, Beginning to Read K. K-readiness gap analysis. |
| `ufli-roll-and-read-format.md` | 318 | UFLI Foundations Roll-and-Read + Decodable Passage formats. Bulk download strategy for Phase 3 content. |
| `reading-books-content-survey.md` | 368 | 50+ PDF inventory across phonics / comp / spelling / writing. 30 curated content templates identified. License posture: AI-generate using these as structural templates. |

---

## Key findings

### 1. ETC integration is solid (already shipped in Wave 5)

- All 19 ETC question archetypes are accounted for — 14 covered by existing widgets, 5 covered by Wave 5's new ETC widgets (`picture-match-row`, `word-picture-choice`, `write-from-picture`, `column-letter-build`, `x-strikethrough-choice`).
- The empirical sample of 5 actual ETC books revealed **no new archetypes** beyond the 19 in the synthesis. Wave 5 is well-targeted.
- One refinement: `column-letter-build` widget needs to accept **3-5 columns** (not hardcoded to 3) for blend-level targets in Books 2-4. Filed as a Phase 3 polish item.
- One nuance: ETC's 8-page lesson sequence is a **framework with substitutions**, not rigid order. In suffix lessons, slot 1 (Type 1 Initial Sound) is replaced by Type 14 (Suffix Build); in syllabication lessons, slot 4 (Type 7 Spell) is replaced by Type 15 (Syllable Division). Practice mode session loop should handle these substitutions.
- "ETC-style page mode": **3 compound archetypes** (Types 1, 2, 8) need a batch-card layout rendering 4-6 sub-items per card. The other 16 archetypes work as 1-card-per-question. Recommend a `style_mode: "etc"` flag on the Question object that controls icon+imperative header, single-story font, and B&W line-art filter.

### 2. K-readiness gap is real and addressable

The current catalog has 35 PA atoms + 151 phonics atoms but is **missing entire K-readiness sub-domains**:

- **Concept of Print** (RF.K.1) — left-right tracking, top-bottom, word-vs-picture, word boundaries, environmental print, reading direction. **6 new atoms** needed in `phonemic-awareness.js` under a new `print_awareness` domain.
- **Visual letter discrimination** — uppercase-to-lowercase case matching, reversal-family discrimination (b/d/p/q), find-letter-in-scene scan. **3 new atoms** needed in `phonics.js` under `letter_recognition` sub-domain.
- **Letter formation** — handwriting tracing skeleton atoms (currently we only have letter-sound). **8-12 atoms** needed but with `question_types: ["letter-trace"]` marked unimplemented (Stage 4 ink-draw widget). Skeleton-cataloging now keeps the prerequisite chain graph complete.

**Total new K-readiness atoms: ~15-20.** Filed as a Phase 3 catalog expansion.

### 3. New widget candidates surfaced

- **`letter-scan`** — a scene illustration where students tap all objects starting with the target letter. The "What Do You See?" format from BPS Level A. Distinct from `mc-image` (single picture) and `tap-hotspot` (image regions) because the targets are scattered objects within a busy scene. **Stage 3 priority.**
- **`letter-trace`** — handwriting tracing canvas. Currently deferred Stage 4. Re-confirmed as needed for K-readiness atoms.

### 4. Session-mode flexibility

Multiple sources independently recommend a **"micro" session mode (5-6 items)** matching:
- BPS Level A's one-page-per-skill format
- Daily Phonics G1-3's daily 6-item drill
- ETC's per-lesson page count (8 pages but each is its own focused drill)

Add `sessionLength: 'micro' | 'standard' | 'extended'` to literacy-game-control. Maps to deck sizes 5/10/20.

### 5. UFLI bulk-content strategy

- **Don't need to download all 128 UFLI lessons for Phase 2/3 ship.** The architecture is in place; Stage 3 content authoring downloads the bulk.
- **3 sample lessons (52, 53, 54) already locally available** — enough to validate the format.
- **For Stage 3 bulk download:** UFLI is free (CC-BY-NC). A simple download list helper script can pull all 128 lessons in one afternoon if/when the user wants the full bundle.
- **Roll-and-Read format**: 6 columns × 5-8 rows of words drilling the lesson's pattern. Replicate as a `roll-and-read` widget (Stage 3) OR fall back to `mc-text` per the existing 4 stub atoms in `fluency.js`.
- **Decodable Passage format**: 30-100 words, sentence-controlled vocabulary, heart-words footer. Already supported by `passage-render.js` + `passage-mc-set` widget. Stub atoms in `fluency.js` use `content_strategy: 'curated'` with forward-reference paths.

### 6. Content authoring strategy (Phase 3 deliverable)

The 50+ commercial workbooks in `Tim's Documents/Literacy Quest/Litearcy Books Materials/` are **license-bound — not for direct redistribution**. Use as structural templates only. AI-generated content using these as templates IS permissible (templates are non-copyrightable; the actual text we generate is our own work).

**Phase 3 content authoring plan:**

- ~500 AI-generated passages across K-4 (50 literary + 50 informational per grade)
- Each passage: title, lexile, word_count, genre, paragraphs[], 4-6 mixed-type comprehension questions
- Three-level Cold-Reads-style differentiation for G3+ (below-grade, on-grade, above-grade variants of the same topic)
- Standard passage JSON schema (matches the existing `Passage` interface in DATA_MODEL.md)
- Spelling content: ~30 atoms covering Building Spelling Skills + Spectrum Spelling patterns
- Writing content: ~20 atoms covering opinion / informational / narrative structures from Spectrum Writing
- Each AI-generated passage human-reviewed before bundling
- K special handling: audio narration + picture-select questions (text alone is too cognitively demanding)
- CCSS standard tagging on every passage

### 7. Pedagogical patterns observed across all workbooks

- **Standard passage opening**: title + small illustration
- **Layout**: 1-2 paragraphs with optional picture
- **Question count**: 4-6 per passage (typically MC, sometimes mixed)
- **Vocabulary control**: Lexile-appropriate text with a few "stretch" words highlighted
- **Comprehension question taxonomy**: literal recall → inference → vocabulary in context → main idea → sequencing
- **Spelling unit structure**: pattern-of-the-week with daily review activities (sort, fill-in, dictate, rewrite)
- **Writing scaffold model**: model passage → guided practice → independent writing → revise
- **Per-grade word count norms** (verified empirically): K = 20-40 words, G1 = 50-100, G2 = 100-200, G3 = 200-350, G4 = 350-600

### 8. Question-type taxonomy from supplementary workbooks

Confirmed against existing widget catalog:

| Workbook pattern | Existing widget | Notes |
|---|---|---|
| Picture-match (initial sound) | `mc-image` / `picture-match-row` | Both work |
| Yes/No with picture | `two-button-binary` | Direct |
| Sentence cloze with word bank | `fib-auto` | Word bank is a UI variant |
| Sequencing (drag) | `sequence-events` | Direct |
| Multiple choice (literal recall) | `mc-text` | Direct |
| Short-answer (open response) | `open-response-fib` (Stage 3) | Manual graded |
| Picture-to-word matching | `match-pairs` | Direct |
| Sound sorting (drag into bins) | `sort-into-bins` | Direct |
| Word building (letter tiles) | `letter-tile-spell` / `column-letter-build` | Both work |
| Spell from picture | `write-from-picture` | Direct (Wave 5) |
| Hot-text passage citation | `hot-text-word/sentence/paragraph` | Direct |

**No additional widgets surfaced from the workbook survey beyond `letter-scan` and `letter-trace`.**

---

## Phase 3 prioritized roadmap

Based on these findings, the recommended Phase 3 work in priority order:

1. **Catalog expansion (K-readiness)** — Add ~15-20 K-readiness atoms (concept of print + visual letter discrimination + letter formation skeletons). Closes a real gap.
2. **`column-letter-build` polish** — accept 3-5 columns, not hardcoded 3. Trivial fix.
3. **Session-mode flag** — add `sessionLength: 'micro' | 'standard' | 'extended'` to literacy-game-control. Trivial.
4. **`style_mode: "etc"` flag on Question** — controls authentic ETC visual presentation (icon header, single-story font, B&W filter). Trivial.
5. **Curated content authoring kickoff** — AI-generate 50 literary + 50 informational passages per grade K-4. ~500 passages total. This is the heaviest Phase 3 deliverable.
6. **`letter-scan` widget** — Stage 3 deliverable. Scene illustration with multiple tappable target letters.
7. **`letter-trace` widget** — Stage 4 deliverable. Currently still deferred; re-confirmed by K-readiness analysis.
8. **UFLI bulk download script** — Phase 3 helper. Pulls 128 lessons × 4 PDFs each from ufli.education.ufl.edu.
9. **MAP variant view UI integration** — wire the placeholder views to actual sessions using the existing `LiteracyMapSession` engine.
10. **OpenDyslexic font bundle** — download OFL-licensed font files into `/css/fonts/`.

**None of these block the Phase 2 → master merge.** The current branch is mergeable as-is with the flag false. Phase 3 work happens in follow-up PRs.

---

## Recommendation

**Phase 2 ships as-is.** The research validates that:
- All 19 ETC archetypes are covered by the 26 widgets currently registered.
- The 478 atoms across 10 strands satisfy the variety rule.
- The MAP engine works for all 3 test variants.
- Math Quest is preserved.

The K-readiness gap and content authoring gap are **real but not Phase-2-blocking**. They're explicit Phase 3 deliverables documented above. The branch is ready to merge to `master` with the flag still `false`.
