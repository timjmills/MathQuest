# Lane lf-vocab — the lesson vocabulary part (the owner's vocabulary redesign, for the pilot and round 1)

**Launch only after the owner answers yes to Q7** (`design/LESSONS_FIRST_PLAN.md` §8). If the answer is "later", the pilot is
graded with today's vocabulary band and this brief waits.

**Model and effort: Opus 5.5, MEDIUM** (`mq-opus-medium`, `model: "opus"`). Step: first build of a new drawing family (the
vocabulary pictures) and a new lesson part.

**Read first:** `design/lessons-first/briefs/README.md`; `design/IMPROVEMENT_PLAN.md` "Vocabulary redesign and the graphic
library" (the owner's design: Match 3 pictures, 1 picture 3 words, per-page counts by grade, one shared picture set, the graphic
library rule, the order "one grade first"); `design/GRAPHIC_LIBRARY.md`; `design/audit/VISUAL_QUALITY.md`;
`design/catalogue/vocabulary.md`; `data/curriculum/wrm-vocab.json` (each step's pre-teach words, meanings, stems);
`js/modules/sheet/roles/lesson.js` (today's vocabulary band, `vocabPicture`, `vocabOrder`); the phase 0 decision D2 (vocabulary
pages register as a part in `sheet/lesson-pages/index.js`, no edit of `roles/lesson.js`) in
`design/status/lessons-phase0.md` on `origin/claude/sweet-newton-c8wrv1-lessons-phase0`; `design/lesson-planner/wip-2026-10-17/
vocab-letters.uncommitted.patch` (the owner's 10-17 change: words labelled A B C, a letter box under each picture).

**Branch:** `claude/sweet-newton-c8wrv1-lf-vocab` from `origin/claude/sweet-newton-c8wrv1`; rebase onto lf-engine's branch
once its parts registry (D18) is pushed, then register the part there.

**Files owned:** `js/modules/sheet/cells/vocab-*.js` (new cell templates), the vocabulary picture entries of the graphic library
(`js/modules/sheet/` drawing functions + `design/GRAPHIC_LIBRARY.md` rows, append), `js/modules/sheet/lesson-pages/vocab-*.js`
(new part, registered through the registry lf-engine owns: send the one registration line to lf-engine through the lead if the
registry file is not yet merged), the vocabulary category's generator branch and providers (`vocabulary:*` skills, 50 today)
for the two new problem types, `design/cards/vocabulary/` (new card). Shared registries append-only; the two problem types are
distinct task kinds, so each is also a preset skill (owner rule 2026-10-17) with standards, WRM, search terms and share codes.

## Scope
1. The card: the two problem types, per-page counts (Match 3 pictures = 4 a page; 1 picture 3 words: K–1 4, grades 2–3 6,
   grades 4–6 8), the picture rules (black and white, drawn by the app, one shared set), the screen responses (choose the
   letter per word; tap the word onto the line). To the lead on day 1 for the owner's one sitting.
2. Pictures for the words of the **pilot unit G3-Y4.B4** first (from `wrm-vocab.json` for Y4.B4 and the four BUILD lessons'
   detailed descriptions), then round 1's other five units; each picture passes ≥ 8 and joins the graphic library.
3. The lesson part: the vocabulary band of the short packet and the long pack (T-page vocabulary cards stay as they are unless
   the card says otherwise) drawn from the same picture set.
4. The vocabulary practice skills for those words (the same drawings), each a preset.

## Gates
`ws-spec-card --check-signed`, `ws-precritic --skill <the vocabulary presets> --strict`, `ws-visual-quality --skill` each,
`ws-precritic --role lesson --strict`, `ws-detailed-lesson --check --repeats` for lessons 1–6 (no passed lesson changes unless
the card says so; if it does, the lead schedules their re-grade), `ws-presets-unit`, `ws-standards`, `ws-search-terms`,
`ws-code-snapshot`, `ws-redesign-passed`, `ws-backtest`, `ws-boot-smoke`, `node --input-type=module --check` on every touched
module. One independent critic: the pictures (every one at the sizes it is approved for), the two problem types on every
page type and screen host, and the pilot's lesson vocabulary band.

## Hand-over
`design/status/lf-vocab.md`. **Cap: $150** (≈ 7.5 %). Stop rules: README rule 11.
