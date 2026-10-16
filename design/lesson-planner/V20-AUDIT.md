# Atomisation Lesson Planner V20: design audit against the MathQuest lesson profile

Auditor: critic profile (Opus, medium effort), 2026-10-16. Owner request (Tim, 2026-10-16): redesign the V20 lesson
guide so its printouts match the site's lesson and worksheet design, built for SPED pupils.

**What was read.** All 6,018 lines of `design/lesson-planner/Atomisation_Lesson_Planner_V20.md`.
`WORKSHEET_DESIGN_STANDARD.md` §1–14 (WDS). `PEDAGOGY_STANDARD.md` §0–5, 7, 8 and 10 (PED).
`design/PAGE_TYPES.md` §1, §2.1–2.3 and §7 (PT). `design/PROBLEM_TYPES.md` §0.3. `design/LESSONS_VISION.md`.
`design/LESSON_LIBRARY_PLAN.md` (§8a–8f). `design/audit/LESSONS_LEARNED.md`. `design/audit/RUBRIC.md`.
`design/LESSON_RULES.md` LR-1 to LR-18, from `origin/claude/sweet-newton-c8wrv1-wip-lessons`. The kit files
`js/modules/sheet/{tokens,frame,lesson-css,lesson-icons}.js`, `roles/lesson.js` (exports) and `css/sheet-kit.css`
(class list).

**What was looked at.** The passed sample PNGs in `design/lesson-samples/{subtract-2-digit-regroup,round-nearest-10}/`.
A fresh render of the add-within-10 lesson at L on this branch: `node tests/scripts/ws-lesson-samples.cjs --sizes L`,
saved to the scratchpad. That render confirms what the profile prints today: the page is A4 (594.96 × 841.92 pt), key
answers are reddish orange #C2410C, the © line sits under the footer, and step marks are purple #5B2A86. The script then
stopped at its rasterise step because PyMuPDF is missing, so the PDFs were rasterised with `pdftoppm`. The sub and round
lessons were not re-rendered; their committed PNGs predate INK-31 and the © line.

---

## 1. Verdict

The pedagogy in V20 is strong and compatible with the site. That covers atomisation, the six atom types, the Critical
Atom, Rosenshine, CLT, I Do / We Do / You Do, the DO / SAY / ASK script, data loops, the No Opt-Out and Say It Again
scripts, the 60-minute budget and the ELL/SPED baseline. All of it should be kept almost word for word.

The visual system is the problem. V20 lines 2199–3095, 5310–5389, 5397–5522, 5610–5804 and 5819–6018 are a different
design family from the site:
- colour bands and pastel boxes instead of black, white and one grey;
- Arial at 11 pt instead of Andika with 28 pt digits;
- rounded flex cards with dashed workspaces instead of a ruled, shared-border cell grid (on the site, dashed means
  "cut");
- emoji headers;
- KaTeX in a serif face;
- red #D32F2F list answer keys instead of facsimile keys in #C2410C;
- US Letter by default;
- full pages for a single exit question.

The pupil-response design also breaks site rules in several places. Pupils write "because…" reasons, "Explain", "Prove"
and "Write a word problem", and frames have three blanks. PED P-13 and P-LG-4 forbid these for this pupil group.

**Recommendation.** Do not repaint V20. Rebuild the print layer of V21 on the site's page grammar: the frame, bands, cells,
slots, fade, keys and the one lesson size L. Keep V20's teaching content and teacher scripts. Re-express the teacher pages
in the same black, white and one grey family (§4). Where the site already has a passed lesson for the skill, V21 should
use the site's Lesson paper for the pupil pages (Q1).

## 1a. The site's lesson design profile on one page (rules a planner can follow)

| # | Rule | Value | Source |
|---|---|---|---|
| D1 | Paper | A4 by default (210 × 297 mm). Margins 12 / 12 / 12 / 14 mm. Live area 186 × 271 mm. Body 236 mm under a full header. US Letter keeps the 186 mm live width by widening the side margins (body 218 mm). Portrait. Print at 100 %. | WDS 2.1, PG-1, PG-5 |
| D2 | One size for the lesson | Every page of a lesson packet prints at size **L**: working digits 28 pt, title 18 pt, instruction and band label 15 pt, text the pupil must read 15 pt, zone labels 12 pt, quiet letters 10 pt, footer 7 pt. Writing height Hw = 10 mm. Nothing a pupil reads is under 11 pt. Grade does not change type size. | LR-10, §8a, WDS 3.2, TY-10/11 |
| D3 | Font | **Andika** 400 and 700 only, self-hosted from `css/fonts/andika.css` (never Google Fonts). `font-synthesis: none`, so there is no italic. Digits use `cv04` (open 4). True operator glyphs + − × ÷. Fractions are always stacked, never written with a slash. | TY-1…7 |
| D4 | Ink | Black #000, paper #FFF, and **one grey #949494**. Grey is used only for shaded parts, trace or model digits, and faded scaffolds. No gradients, shadows, emoji or clip-art. | INK-1…7, SC-7 |
| D5 | Lesson accent | Purple **#5B2A86** (`--mq-lesson-accent`), used only on step numerals, their 1 pt circles and the step icons. Each always has a second cue (shape or numeral). | INK-30, LR-12 |
| D6 | Key colour | Answers on keys are reddish orange **#C2410C** (`--ws-key-ink`), Andika 700, written in the pupil's slot, only on `[data-ws-key-ans]` marks. Everything else on the key stays black and white. | INK-31, AK-2 |
| D7 | Strokes | The closed set is {0.5, 0.75, 1, 1.5, 2.25} pt. 2.25 pt for the header rule and band top rules. 1.5 pt for the outer frame, sum rules and outlines of objects. 0.75 pt for I Can cell borders and every writing place. | INK-10 |
| D8 | Line meaning | Solid lines are structure. Dotted lines are trace or model. **Dashed means cut** (the only exception is the missing-digit box). Square corners are structure. Writing slots use a 1.5 mm radius at L. Read or think containers (story, Steps, vocabulary, chant) use a 3 mm radius. | LS-1…8, SL-11 |
| D9 | Header (page 1) | Max 26 mm. Name / Date / Score `__/N` fields with 0.75 pt rules. **Strand tab** at top right: 30 × 14 mm, 1.5 pt outline, three lines (`Level N` / strand / page id). One centred bold title **"I Can <verb> <object> (<constraint>)"**, identical on every page of the packet. Then a 2.25 pt rule. Continuation pages use a 12 mm header. | WDS 8.1–8.4, PT-FRM-1…9 |
| D10 | Footer | 6 mm, 7 pt, outside the body. Left: skill id · grade · CCSS · EE. Centre: page n/N. Right: form · seed. Under it, in the margin: **"© <year> Cultivating the Digital. All rights reserved."** (6.5 pt, centred). Grade and CCSS appear only here. | HD-30, PT-FRM-7a, `frame.js copyrightLine` |
| D11 | Bands | Fixed vocabulary, sentence case, bold, ending in a colon: `What's New:` `Vocabulary:` `Rule:` `Remember:` `Warm-up:` `Steps:` `Model:` `Say:` `Guided Practice:` `Independent Practice:` `More Practice:` `Mixed Review:` `Workspace:`. Band strip 8 mm at L under a 2.25 pt rule. No capitals and no reversed-out labels. | BD-1…3 |
| D12 | Say: band | A full-width strip under the Model (Hw + 3 = 13 mm at L). Bold `Say:` then the oral frame in curly quotes, from the PED 10.5 library. Its blanks are said, not written. | BD-8, P-17, P-LC-15 |
| D13 | Cells | One 1.5 pt outer frame. Cells share 0.75 pt borders (I Can look). No gutters, no floating or rounded cards. Equal cells in a section, computed once. The problem sits in the top half. At least 40 % of each cell is free. Spare height goes to the answer or work zone. Quiet letters `a.` `b.` in the top-left. Model and Guided cells are unlabelled. | CL-1…14, PG-10…14 |
| D14 | Answer slots | The shape tells the answer type. Line = a number after `=`. Box = a number inside an expression. Digit strip = a row of digits. Circle = a sign. Check box = a decision. Fraction bar. Time and money boxes. Width is B(n) (L: 14 / 17 / 25 / 33 mm for 1–4 digits), one width per section. Never underscores. The unit word is pre-printed. | WDS 6, SL-1…12 |
| D15 | Fade | Hint scaffolds (trace, cues, Steps, captions, word bank) fade Model (black) → Guided (grey) → Independent (first cell only) → Test (none). Structural scaffolds (digit grid, regroup boxes, H T O, frames, unit word) stay. | WDS 13.1, PED 4 |
| D16 | Icons | In-house line art at 1.5 pt in the accent, one distinct icon per step. They come from `lesson-icons.js` (`look start count write regroup subtract subOnes subTens ends decide check say`) and are 5.8 mm at L. Never emoji. | LR-3, INK-7 |
| D17 | The packet | **Prerequisite Check** (3–4 questions, most basic first, each tagged "If missed → Lesson …"). Then the **Anchor chart** (worked example in 2–5 step panels, other cases drawn, `Say:`, `Rule:`/chant, no Name or Score, wall poster). Then the **Lesson sheet** (`Vocabulary:` match-to-picture ≤ 3, `Remember:`, `Guided Practice:` 2–3 varied cells beside `Steps:`, cell 1 step 1 in grey). Then **Practice** pages (step strip on top, one frame, 2 × 3). Then optional **Mixed** (earlier skills only, lesson skill ≥ half). Every page has a facsimile key. | LR-1…18, LESSONS_VISION r1–r4, §8b, §8e |
| D18 | Capacity at L | Opener 1–2 Model + 2–3 Guided. Guided page 3–6. Independent 6 (4 for long procedures; one-symbol answers up to 16). Wide-visual rows 3. Word problem v1 1 per page, v2 2 per page. Mixed 5 rows. No page under 50 % used; no lone item; no cell band ≥ 30 % empty (H5, H13). | WDS 12.1, RUBRIC H5/H13 |
| D19 | Never shrinks | Type, Hw, B(n) and minimum visual sizes never shrink. Drop a row, drop a column or paginate instead. The one exception is the anchor chart: it is a poster, its panels enlarge to fill the page, and they never go below 0.8× (other examples ≥ 0.85×). | PG-20, LR-15, PT-ANC-1 |
| D20 | Language | One instruction per section: ≤ 12 words, 1–3 sentences, each starting with a print verb (PED 10.2), taken word for word from the library (PED 10.1). Never: explain, describe, justify, discuss, prove, "in your own words". Pupils never compose sentences. A frame has ≤ 2 blanks, each a number or a word from a bank of ≤ 4 words. ≤ 3 vocabulary terms, each with a mini-diagram. "Level N", never "Grade". | P-13, P-14, P-15, P-LG-1/4/12, SC-5 |

---

## 2. Section-by-section verdicts (every heading of V20)

Verdicts:
- **KEEP**: unchanged except stale cross-references.
- **REVISE**: content kept, the named rule changed.
- **REPLACE**: section rewritten to the given spec.
- **REMOVE**: deleted.
- **PAUSE**: kept in the file but switched off, matching an owner pause on the site.

| V20 heading | Lines | Verdict | Reason and exact fix |
|---|---|---|---|
| YAML front matter | 1–19 | REVISE | Change `All printed materials designed for 8.5x11 US Letter paper` to `Printed on A4 by default (US Letter optional, same 186 mm live width); the pupil pages follow the MathQuest worksheet design standard`. Set `version: '21.0'` and `last_updated: '2026-10-..'`. Replace `changes` with the V21 summary. Keep the trigger phrases and drop "worksheet" (Practice papers belong to the site). |
| Title + intro | 21–31 | KEEP | — |
| The Presupposed Student | 33–43 | KEEP | — |
| What this means in practice | 44–147 | REVISE | Keep the readability rule (one verb, ≤ 8 words per line) and add: "each sentence starts with a print verb from PED 10.2; the whole instruction is ≤ 12 words and comes from the instruction library (PED 10.1)". Change "Work space is generous…never compress" to "writing space is fixed by size L (Hw 10 mm, B(n)); content never shrinks (PG-20)". Change the "Star ratings are honest" bullet to the fade-level wording (C-14). Replace the 🧱 MANIPULATIVE block at 125–130 with `Manipulative: <tool>` and the line-art icon (C-07). Keep the teacher-facing bullets (99–106, 135–143). |
| When to Use This Skill | 148–163 | REVISE | Remove "worksheet" and "student-facing lesson sheets" as triggers for stand-alone use. Add "a teacher lesson pack (teacher pages + pupil lesson packet)". |
| Evidence Base (all ### 166–491) | 164–491 | KEEP | The pedagogy is consistent with PED §1–5. Three wording fixes: (a) **Faded Worked Examples** 243–259: "★ = first steps pre-filled + text hint, ★★ final step blank, ★★★ blank" → "Model = traced (grey) worked item; Guided = first step in grey, hints in grey; Independent = hint on the first cell only; structural scaffolds stay" (C-14). (b) **Chunked Flow** 310–322: add "first ask whether the routine should be two lessons (PED P-1, one new thing per step)" (C-20). (c) **Mathematical Writing** 484–491: add "written responses are numbers, signs, check boxes or words from a bank; sentences are said, not written (P-13)". |
| Teaching Strategy Reference Library (515–675) | 492–675 | KEEP | Teacher-facing only, nothing printed for pupils. Note: 1.5 Diagnostic Questions (MC) is fine on the board and on mini whiteboards, but a printed pupil item stays production (P-29). |
| Research & Learning Theory Library | 676–748 | KEEP | — |
| Myths & Misconceptions Library, Pedagogical / Student / Equity | 749–814 | KEEP | — |
| Language Standards for Delivery Scripts | 815–844 | REVISE | Reconcile the sentence cap: line 836 says "under 12 words" and line 5756 says "longer than 15 words". Use **≤ 12 words** in both places, matching P-LG-12. |
| Educational Research Reminder Spec | 845–880 | REVISE | Change the box from "`.research-tip` blue-left-border, `--blue-light` background" to the B&W Research box in §4 (T-BOX-4). Remove 🔬 and use the `research` line-art icon. |
| Number Sense Practice Bank (intro) | 881–910 | REVISE | Fix "15 categories" vs the heading "12". Replace "Easy left column TRY THIS / Hard right column CHALLENGE on S1" with the Number sense part (C-11). Replace "blanks…answer lines…circles for choices" with D14 slot shapes. |
| The 12 Number Sense Categories (empty heading) | 911–914 | REMOVE | An empty, wrong duplicate heading. |
| The 12 Number Sense Categories — Format Specifications | 915–1982 | REVISE | Keep all 15 categories and their rationale. Apply four rules to every format. (1) `___` is drawn as a slot: a line after `=` or a box mid-expression (SL-3, SL-6); B(n) is set per item set. (2) Every free-writing prompt is converted, as listed in C-12: "Explain", "Why?", "Proof:", "Because:", "How do you know?", "I notice:", "Write a word problem", "Write your own true sentence", "Name the property", Cat 15 D. (3) Images described in brackets are drawn to WDS §11: ten frame RP-10/11, counters solid vs hollow (never "red / blue", INK-6), number line RP-50, array, bond, clock, base-10. (4) Cat 10 Format B "4 red dots + 3 blue dots" becomes "4 solid + 3 hollow counters". |
| Number Sense Question Generation Rules | 1983–2124 | REVISE | Keep the selection, rotation, counting-first and Easy/Hard number tables (2083–2092). Replace the S1 layout spec (2098–2121) with C-11. Delete the Q4 "A: B: C: Circle" estimation line (2114); it contradicts the bank's own "avoid multiple choice" rule (1357). |
| ★ Star Rating System | 2125–2136 | REVISE | Stars stay as a **teacher** label for the fade level. On pupil pages there are no ★ glyphs (INK-7; the band names the level). See C-14. |
| Lesson Time Budget (60 min) | 2137–2160 | REVISE | Keep 60 minutes as the owner's timing; it prints on teacher pages only (P-LC-14). Change rows 1a/1b/2 to: Prerequisite Check 4 min · Number sense 5 min · Spaced retrieval 3 min (mini whiteboards) · Chaining Bridge 1 min (C-10, C-11). Fix the contradiction between the header "You Do 20 min" (4517) and the budget's 15 min. |
| Chunked Flow table | 2161–2198 | KEEP | Add the C-20 note. |
| VISUAL STYLE & DESIGN SPECIFICATION (heading) | 2199–2200 | REPLACE | New section "Print design: the MathQuest lesson profile" = §1a D1–D20 of this audit, as V21 text. |
| Abbreviations | 2201–2229 | REVISE | Keep the rule. Delete lines 2227–2228 ("emoji-only section headers (📖 🔵 📐 ✏️ ✅) are fine"): emoji are banned (INK-7). |
| Color System | 2230–2250 | REPLACE | Tokens: `--ws-ink #000`, `--ws-paper #FFF`, `--ws-grey #949494`, `--mq-lesson-accent #5B2A86` (step marks only), `--ws-key-ink #C2410C` (answers on keys and in teacher scripts only). Delete all 13 V20 tokens. |
| Typography | 2251–2302 | REPLACE | Pupil pages: D2. Teacher pages: §4 T-TYPE. Delete `.t1-lesson-title` (30 pt, blue, uppercase), `.t1-lag-heading` and `.section-heading-lg` (uppercase). |
| Readability Rules | 2303–2309 | REPLACE | Teacher pages: no alternating shaded bands; numbered steps divided by 0.75 pt hairlines. No blue script border; use the §4 T-SCRIPT layout. Callout colours are replaced by the four B&W box types (T-BOX). Keep "no section > ⅓ page without a break" and "bold for labels and cue words only". |
| CRITICAL RULE — NO WORKSPACE ON TEACHER MATERIALS | 2310–2313 | KEEP | Write the board reference as `Board: teacher models here` (sentence case, no capitals or brackets). |
| Student Material Key Components | 2314–2447 | REPLACE | Replace with the V21 "Pupil pages" spec (§5 outline, part P). Specific removals: `.prob-page` / `.prob-card` flex cards; "4–8 problems"; dashed workspace; the "SHOW WORK BELOW:" and "FINAL ANS" capitals; `.ans-line` 180 px / 90 px; grey self-check strip; purple word-bank chips; the `.wp-page` emoji grid; "👁 WATCH → ✏️ FILL IN"; sentence frames "First, I ___ because ___". Their replacements are C-03 to C-09, C-12, C-13 and C-16. Keep the `.ns-stack` alignment idea: on the site it is the equation template's aligned `=` column. |
| Delivery Page Script Format | 2448–2498 | REVISE | Keep the numbering, DO / SAY / ASK / NOTE, CHECK folded into NOTE, plain-language rules and data-loop wording. Replace "**The italic rule**" with the T-SCRIPT rule (C-19): Andika has no italic in the site's font set, so italics would silently print upright. |
| HTML CSS | 2499–2955 | REPLACE | Delete all of it. V21 ships an appendix "House stylesheet" with: (1) a subset of `css/sheet-kit.css` (`.ws-page .ws-head .ws-rowA .ws-field .ws-tabbox .ws-title .ws-headrule .ws-body .ws-band .ws-strip .ws-grid .ws-cell .ws-letter .ws-line .ws-box .ws-check .ws-circle .ws-steps .ws-story .ws-band--say .ws-sayframe .ws-foot .ws-copy .ws-key .ws-trace`); (2) `LESSON_CSS` from `js/modules/sheet/lesson-css.js` (`.mq-lnum .mq-lstrip .mq-lsteps .mq-licon .mq-cchant .mq-lvocab`); (3) the §4 teacher classes (`.mq-t*`); (4) `@page { size: A4; margin: 12mm 12mm 14mm 12mm }` and the Andika `@font-face` from `css/fonts/andika.css`. Prefer embedded woff2 as base64; next, `https://math.cultivatingthedigital.org/css/fonts/andika.css`; never Google Fonts (TY-3). |
| Page Structure | 2956–2994 | REPLACE | New page table: T1–T6 (§4) and P0–P6 (§5). Keep the "page counts are targets; never squeeze" principle, restated as PG-20. |
| COMPONENT-TO-COLOR MAPPING (all four ###) | 2995–3095 | REMOVE | The whole pastel mapping, including the hinge-option colours and the developer JS. Its job is done by D4–D6 and T-BOX. |
| Word Problem Framework (RCDWS) | 3096–3109 | REVISE | Keep the five steps as the owner's word-problem routine. Render them as the SF-53 right-hand check-box panel (one problem per page) with line-art icons instead of emoji. "Colour-coded highlighting" becomes "Circle the numbers. Underline the question." Details in C-13. |
| Scaffolded Math Writing Types | 3110–3124 | REVISE | Keep the rows for teacher-side and oral use. Pupil-page rows: "Cloze sentence" (≤ 2 blanks, words from a bank of ≤ 4 words) and "Fill-in notes" (number blanks only). "Explain your thinking", "Error analysis writing", "Math journal" become **oral frames** (said to a partner, printed on teacher pages only) (P-13, P-LG-4). |
| Must-Do Techniques | 3125–3135 | KEEP | — |
| PDF / Image Source Workflow (heading) | 3136–3143 | KEEP | — |
| STEP 1, STEP 2 | 3144–3183 | KEEP | Add: "CCSS and EE codes appear only on teacher pages and in the pupil footer (SC-5, HD-30)". |
| STEP 3 — I Can statement | 3184–3198 | REVISE | Change to "I Can <verb> <object> (<constraint>)": "I Can" capitalised, sentence case, no period, ≤ 60 characters (HD-10). It is the title on every page of the pack (HD-11). |
| STEP 4 — Classify and Extract | 3199–3342 | REVISE | Method A "EXTRACT verbatim": for third-party (publisher) material, rewrite in MathQuest's own words or use Method E. A page that carries the © Cultivating the Digital line must not reprint someone else's text (P-33; CLAUDE.md "never copy wording"). Owner decision Q6. Method B "KaTeX" becomes "Andika HTML: true glyphs, stacked fractions" (C-15). Method C SVG follows WDS §11 (C-15). Method E: the pupil-page reference is a 3 mm rounded box with 0.75 pt outline and no grey fill. |
| STEP 5, STEP 6 | 3343–3450 | REVISE | Drop the stale "V14 / V16" names (3296, 3345, 3417, 3420, 3446, 5291). The STEP 6 table rows "Check Question = 3-option MC" and "Exit ticket + reflection frame" follow C-17 and C-18. Remove "Common Student Responses T6b". |
| STEP 7 — Quality Check | 3451–3472 | REVISE | Add the V21 print checks: A4, Andika, three paints plus accent and key colour, no emoji, B(n) slots, facsimile keys, © line, every page ≥ 50 % used, no cell band ≥ 30 % empty. |
| PDF Problem Method — Quick Decision Guide + KaTeX block | 3473–3589 | REVISE | Keep the decision table. Delete the KaTeX cheat sheet and CDN block (3502–3563). Replace the "Answer Key Red Text #D32F2F" line (3585–3586) with D6 and AK-1. |
| Output Structure (heading) | 3590–3593 | KEEP | — |
| PART 0 Lesson at a Glance (T1) | 3594–3650 | REPLACE | §4 T1 layout. The content order (title → I Can/CCSS → tips → flow → materials → vocabulary) is kept. Removed: blue title, `.ican-box` and `.lag-box` colour, purple chips. |
| Top Tips Specification | 3651–3749 | REVISE | Keep the two tiers, "≤ 3 on T1", the memorable-title rule and the banned generic labels. Replace emoji title prefixes (⚡ 🌐 🧠 🔑 🚫 💡) with line-art icons (`key`, `language`, `why`), or with no icon. Replace "amber background / left border #F9A825" with T-BOX-1. |
| PART 1 Atomisation Template (T2) | 3750–3756 | KEEP | — |
| Key Vocabulary (T2) | 3757–3775 | REVISE | Change "purple grid, coloured word, grey example" to: a rounded 3 mm, 1.5 pt vocabulary box (SF-42), each term bold with a gloss of ≤ 8 words and a mini-diagram (P-LG-7). Mark the ≤ 3 terms that reach the pupil page with a check box. The pupil page shows ≤ 3 terms (P-15); the teacher page may list up to 6. |
| Sections 1–4 (T2 tables) | 3776–3876 | REVISE | Tables: 0.75 pt rules, header row Andika 700 black on white under a 1.5 pt rule, no fills, no zebra grey (INK-3). `.atom-type` / `.step-name` / `.mistake-name` become bold black, not blue. Mistake names change from ALL CAPS to bold sentence case, e.g. **Zero drop** (TY-5). ⚡ becomes the `key` icon. Keep all content rules. |
| PART 2 Reference Key (T2b) | 3877–3962 | REVISE | Same table treatment as T2. Delete the abbreviation row "Student sheet emoji headers: 📖 🔵 📐 ✏️ ✅". Change "Check Question = multiple-choice question shown to the class" to "…on the board and mini whiteboards (never printed for pupils)". Keep "print once per unit". |
| PART 3 Lesson Plan (heading) | 3963–3966 | KEEP | — |
| Lesson Plan Header (T3) | 3967–3980 | REVISE | The I CAN blue box becomes the shared title (§4 T-HEAD). Standard tag: plain text `CCSS 2.NBT.B.5 · EE M.EE.2.NBT.5` at 11 pt. Materials: "Student worksheets (5 pages)" becomes "Pupil lesson packet (Prerequisite Check, Anchor chart, Lesson sheet, Practice ×n)". |
| Section 1a Number Sense (5 min) | 3981–4094 | REVISE | Keep the delivery steps 0–3 and the choral NOTE. Format: C-11. Teacher answers use `.ws-key-ink` (#C2410C), not "red". |
| Section 1b Spaced Retrieval (5 min) | 4095–4182 | REVISE | Keep the domain rotation and Q6 sentence rules. Delivery: mini whiteboards only, nothing printed (C-10). Domain labels: grey text is not allowed for words to read (INK-3), so print them as plain 11 pt in brackets on the teacher page only. Fix the Option B band: 4109 says "0–1 grade below" but the bank table says "1–2". |
| Section 2 Prerequisite Check (3 min) | 4183–4248 | REVISE | It becomes the **printed** Prerequisite Check (LR-17): 3–4 items, most basic first, each tagged "If missed → Lesson <id> <title>". The teacher still runs it "3-2-1 Show me" in the same order. Keep the data loop with 🔴🟡🟢 replaced by T-LOOP. The key carries the routing table. |
| Section ②b Chaining Bridge | 4249–4272 | KEEP | — |
| Section 3 I Do (12 min) | 4273–4379 | REVISE | Keep Steps 0–5 exactly. Step 1 "display the visual model alongside" becomes: the **anchor chart** is the board copy (Board = Paper, 2.9). Each step panel = one step state drawn in the skill's own cell, newest marks grey (P-LC-9, LR-1). "CRA stage in a green callout" becomes a plain `CRA stage: Pictures` line. "Label it ❌ WRONG" on the board stays (it is board work), but V21 adds "never printed on pupil pages" (Find the mistake is paused, §8d). |
| Section 4 We Do (8 min) | 4380–4459 | REVISE | Keep the pairing, think-aloud and partner talk. The sentence frame "purple box" becomes `Say:` frame lines on the teacher page. The expected answer is in #C2410C. Pupil page = `Guided Practice:` band, 2–3 cells beside `Steps:` (LR-4). |
| Section 5 Check Question (3 min) | 4460–4516 | REVISE | Keep it as a board / mini-whiteboard hinge, not printed for pupils (C-17). Correct / wrong option colours (green / pink) become a ✓ check-box mark beside the right option and the mistake name in bold beside each wrong one. |
| Section 6 You Do | 4517–4640 | REVISE | Header "20 Minutes" → 15 (C-21). "Grades 3–5 target 8–10" becomes "two Practice pages at L = 12 items (6 per page, 4 for long procedures)". ★ / ★★ / ★★★ → fade levels (C-14). Keep the circulation, peer-tutoring and early-finisher scripts. Early-finisher Option C ("Write one sentence that explains WHY") becomes an oral frame (P-13). |
| Section 6b Word Problem | 4641–4688 | REVISE | The pupil page follows C-13. "Problem statement in an italic bordered box" becomes a story box (TY-2: no italic). Drop "2×2 grid of emoji sections". Keep delivery steps 1–5. |
| Section 7 Plenary | 4689–4734 | REVISE | Exit question on mini whiteboards: keep. Written reflection page S5 is replaced by the exit slip in C-18. The thumbs check is oral: keep. |
| PART 4 Answer Key (T6) + inline answers | 4735–4792 | REPLACE | Inline teacher answers: #C2410C, Andika 700. T6 = **facsimile keys of every pupil page** (AK-1…4), plus the Prerequisite routing table and the word-problem accepted equations (PT-KEY-5). Delete: the red banner, list layout ("✅ YOU DO — ANSWERS ★ Q1…"), `.ak-sf` underline styling and the stray "Teal signals…" sentence (4744–4745). |
| PART 5 Embedded Teaching and Feedback Boxes | 4793–4914 | REVISE | Keep the four types and their decision rules. Change the rendering to T-BOX-1…4 (no colour, no emoji). NOTE stays plain text as `Note:`. |
| Optional Enhancements 1–5 + guide + logic | 4915–5037 | REVISE | Keep 1, 3, 4 and 5 as teacher-side. Enhancement 2, the Variation set on the pupil page, uses "✓ or ✗? ___ Why? ___" — rewrite as check boxes `Works` / `Does not work` with no Why line (P-13), and print it only if the owner un-pauses thinking pages (§8e: Reason It paused). PAUSE the pupil-printed part; keep the oral use. Marzano student box ("In my own words: ___", "My drawing") becomes: word + a drawing zone (Workspace: band), with no "own words" (P-LG-4). Enhancement 5 (Academic Controversy) is oral; keep. |
| Comprehensive Teacher Wording Reference | 5038–5270 | KEEP | Item 7 "Label it ❌ WRONG" becomes "write the word Wrong beside it" (board). Item 10 "purple box on teacher and student pages" becomes "the `Say:` frame". The trailing vocabulary-strategy list (5258–5267) needs its heading restored ("Vocabulary strategies"). |
| Gathering Requirements | 5271–5309 | REVISE | Item 7 output format: HTML + PDF by default (DOCX / PPTX only on request, best effort, Andika embedded). Add item 13 "Paper: A4 (default) or US Letter". Add item 14 "Does a MathQuest lesson already exist for this skill? If yes, use its pupil packet" (Q1). Item 12 grade band no longer changes type size (C-22). |
| Grade Band Student Material Spec (+ PK–2, 3–5) | 5310–5388 | REPLACE | Type sizes, workspace inches and `.grade-pk2` CSS are deleted: one lesson size L (D2). Kept as a **counts table**: PK–2 Guided 2, Practice 4–6 per page, word problem v1 / K picture version (≤ 2 per page, SF-52), sentences ≤ 10 words. Grades 3–5: Guided 3, Practice 6 per page (2 pages), sentences ≤ 12 words (story lines ≤ 60 characters, SF-54). |
| Mandatory Rules (heading) | 5389–5396 | KEEP | — |
| BEFORE THE LESSON — Page Layout & Planning | 5397–5522 | REVISE | Footer format (5406–5413) becomes D10 for pupil pages and T-FOOT for teacher pages. T1 visual treatment (5415–5421) becomes T-TYPE. "All pages 8.5 × 11 inches" (5479) becomes A4 / Letter. Starter rules (5512–5519) become C-10 and C-11. Keep the page order, the T2 structure and the ELL baseline. |
| DURING THE LESSON — Delivery Rules | 5523–5609 | REVISE | "Alternating light-shaded bands" and "colour-coded callouts" are deleted (T-BOX). "Student Mastery Practice cards: 2-column grid…'SHOW WORK BELOW:'… dashed-border Extension… 'FINAL ANS'" becomes the Practice page spec (C-04, C-05). Everything else is kept. |
| ALWAYS / NEVER | 5610–5803 | REVISE | Delete the ALWAYS bullets that encode the old look: lines 5620, 5651–5655, 5676–5679, 5690–5695, 5698–5700, 5706–5708, 5726–5727. Delete the matching NEVER bullets: 5742–5743, 5745–5751, 5776–5777, 5789–5796. Add the twelve V21 print rules (§5 R1–R12). Keep all pedagogy bullets. Fix the internal contradiction: 2119 / 2366 say "no workspace boxes" for the warm-up, but 5676 / 5742 require them. C-11 settles it: slots sized by B(n), no workspace box. |
| OPTIONAL ENHANCEMENTS table | 5804–5818 | KEEP | Mark Variation Theory "pupil set paused" (above). |
| Math Visual & Rendering Specification (heading) | 5819–5826 | REPLACE | Becomes "Maths on the page: Andika and the drawing rules". |
| Math Notation — KaTeX | 5827–5906 | REPLACE | C-15. No KaTeX. Digits and operators in Andika HTML; stacked fractions as an HTML / SVG fraction (1.5 pt bar, fraction digits 20 pt at L); `−` U+2212, `×`, `÷`. Fallback for chat output: Unicode, as V20 says. |
| Math Visual Models — Inline SVG | 5907–5976 | REVISE | Keep "inline SVG, viewBox, never PNG, never decoration, beside the example". Replace the style block (Arial 12 px, blue / amber / green fills) with: SVG text Andika at zone size 12 pt (labels) or working size 28 pt (printed targets) (RP-6); strokes from the closed set; shaded = #949494; two sets = solid vs hollow. viewBox in mm, sized to WDS 11.2 minimums at L, e.g. number line pitch 8 mm and length ≥ 160 mm, ten-frame 50 × 20, fraction bar 56 × 18. Delete the px dimension guidelines (5955–5962). |
| Worked Example Format — KaTeX + SVG | 5977–6006 | REPLACE | Steps beside the Model (BD-4: Steps 40–45 % of the band, step numerals in accent circles), or steps underneath when the column would be < 55 mm (L11). Each step is a panel of the anchor chart (D17). |
| Platform Notes | 6007–6018 | REVISE | Keep the Claude / Gemini notes. Replace "KaTeX via CDN" with "Andika embedded; no math library needed". |

---

## 3. Conflicts with the site profile

Each conflict lists where it is (V20 lines and site source), what V20 says against what the site requires, the V21 text,
and whether the owner must decide. Where a decision is needed, the recommended answer is given.

| # | Where | V20 says / site requires | V21 rule | Owner? |
|---|---|---|---|---|
| C-01 | Paper: front matter 12, 2510, 5479 / WDS 2.1, PG-1 | V20: US Letter, 0.5 in margins, `.page` 7.5 × 10 in plus extra padding (double margins). Site: A4 default, Letter optional, 186 mm live width. | "Paper is A4 (210 × 297, margins 12 / 12 / 12 / 14 mm) unless the teacher asks for US Letter (side margins 14.95 mm, same 186 mm live width). `@page` is set once; no extra page padding." | Q2: recommend A4 (the site default, which the passed samples print on). |
| C-02 | Font: 2511, 5947 / TY-1…3 | V20: Arial / Helvetica, KaTeX serif. Site: Andika everywhere, self-hosted. | "Every character (pupil and teacher pages, SVG text) is Andika 400 / 700. Embed the woff2; never Google Fonts." | No. |
| C-03 | Type size: 2269–2282, 5321–5331, 5369 / D2, LR-10 | V20: problem text 11 pt (14 pt PK–2), title 18 pt, star 9 pt, work label 8 pt. Site: lesson at L, digits 28 pt, text 15 pt, title 18 pt, zone 12 pt, nothing a pupil reads < 11 pt. | "Pupil pages print at size L for every grade: digits 28 pt, text 15 pt, title 18 pt, labels 12 pt." | No. |
| C-04 | Cards: 2316–2343, 2570–2625 / CL-1…5, PG-10, LS-2 | V20: separate rounded (10 px) grey-bordered flex cards, dashed workspace, `.ext-box` dashed. Site: one 1.5 pt frame, shared 0.75 pt borders, square corners, equal fixed cells; dashed = cut. | "Practice cells form one ruled grid (2 × 3 at L; 2 × 2 for long procedures); the answer or work zone is the open part of the cell, unbordered; no dashed lines." | No. |
| C-05 | Count per page: 2321–2325, 4530–4534, 5577 / WDS 12.1, PED 2.2 caps | V20: 4–8 per page, You Do target 8–10 (no upper limit from a PDF). Site at L: Independent 6 (4 long), Guided 3–6, word problem v1 = 1. | "Practice pages hold 6 at L (4 for long procedures; up to 16 one-symbol answers on 2 × 8); a lesson prints 1–2 Practice pages, as many as the teacher asks for (LESSONS_VISION #4)." Extra PDF problems go onto More Practice pages. | No. |
| C-06 | Colour on pupil pages: 2248, 3029–3054 / SC-7, INK-1 | V20: purple word-bank chips, blue `.ican-box` with white text, grey `#F5F5F5` self-check strip, `#BDBDBD` borders, `#555` labels. Site: black, white and #949494 only (plus accent on step marks). | "No colour on pupil pages except the purple step marks. The title is plain bold black (HD-15). The word bank is a 3 mm rounded box with a 0.75 pt outline." | No. |
| C-07 | Emoji: 2227, 2412, 3100–3104, 4649, 125, 4811–4862, 3611–3746 / INK-7, H4 | V20: 📖🔵📐✏️✅ 👁✏️ 🧱 💡💬🔔⚠️🔬📌 ⚡🌐🧠🔑🚫 ❌ 🔴🟡🟢. Site: no emoji or pictographic code points on any sheet. | "Icons are in-house line art. Pupil steps use `lesson-icons.js` in the accent. Teacher boxes use the black icons proposed in §4 T-ICON. Status uses shapes (T-LOOP)." | No. |
| C-08 | Key colour and form: 2237, 2444, 3585, 4772–4789 / INK-31, AK-1…4, H10 | V20: red #D32F2F; T6 is a list of answers with a red banner. Site: #C2410C, facsimile of each page, "Answer Key" on tab and Name line. | "Every pupil page has a facsimile key: the same page with answers in #C2410C Andika 700 in the slots; tab line 3 `Answer Key`. T6 = the keys, in page order, plus the prerequisite routing table." | No. |
| C-09 | Answer lines: 2339–2341, 2734–2740, 5678 / WDS 6, SL-1…6 | V20: 180 px or 90 px underlines for every blank; `___` characters in the bank. Site: B(n) per section (L: 14 / 17 / 25 / 33 mm); line after `=`, box mid-expression; never underscores. | As D14. | No. |
| C-10 | Warm-up vs prerequisite check: 2137–2150, 2398–2402, 4095–4248, 5512–5519 / §8b, LR-17 | V20: Section 1b, 6 cross-domain questions printed on S1, plus Section 2 prerequisite check on mini whiteboards only. Site: every lesson opens with a **printed** Prerequisite Check of 3–4 routed questions; it replaces the Warm-up. | "Part P0 Prerequisite Check: 3–4 items, most basic first, each from one prerequisite skill, teacher tag 'If missed → Lesson …', key with routing table. Spaced retrieval (old 1b) is mini whiteboards only, from the teacher page." | Q3: recommend yes (the prerequisite check absorbs §2; 1b goes to mini whiteboards). |
| C-11 | Number sense on S1: 2098–2121, 2359–2373 / §8b, §8e, PED 7, P-13 | V20: two columns TRY THIS / CHALLENGE, 5 mixed types each, on the lesson's first page. Site: no number-sense band in the lesson packet; the closest are Today's Number and Daily 4 (Daily look, black number tabs). | Recommended: "Part P1 Number sense (optional, default on): its own page in the Daily look. Band `Number sense: A` (5 items, black tabs 1–5) over band `Number sense: B` (the same 5 types, harder numbers, tabs 6–10). Each item in its own cell type (count-row, equation, bond, pv, number line), slots per D14, no multiple choice." The band label "Number sense" is new to the BD-1 vocabulary; the owner rules (Q4). | Q4: recommend a separate optional page in the Daily look. Alternative: drop it from the packet and run it orally. |
| C-12 | Composed writing: 1068, 1129–1147, 1158, 1367–1392, 1429–1441, 1454–1498, 1524, 1546–1549, 1652–1687, 1722–1727, 1771, 1786, 1817, 1846–1898, 1912–1974, 2424–2427, 3121, 4955, 4979–4983 / P-13, P-LG-4, PT-G-07 | V20: "Explain", "Why?", "Proof:", "Because:", "How do you know?", "I notice:", "Write a word problem", "Write your own true sentence", "Name the property", "First, I ___ because ___", 3-blank reflections. Site: pupils never compose; a frame has ≤ 2 blanks, each a number or a bank word (bank ≤ 4). | "Convert each: (a) a reason becomes a check box between two printed reasons, or the oral `Say:` frame; (b) 'name the property' becomes words to circle from a bank of 3; (c) 'write a word problem' becomes 'Check the story that fits' (2 printed stories) or oral; (d) I Do fill-in frames become digit / number slots in the traced states; (e) 'proof' becomes the equation frame `__ × __ = __`." | No. These are standards rules, not owner taste. |
| C-13 | Word-problem page: 2345–2357, 2633–2685, 3096–3106, 4641–4656 / SF-50…54, P-WP-6…16, H12/H13 | V20: full-page 2 × 2 emoji grid; "Draw it" empty half page; italic story; purple word bank; check strip. Site: v1 = story box (rounded, one sentence per line, ≤ 4 lines, unit word pre-printed), schema diagram, decision check boxes, equation frame or work grid, `Say:` "The answer is __ {unit}." The keyword-checklist panel (SF-53) is an allowed alternative. | Recommended: "Part P5 Word problem, one per page: story box top-left (⅔ width); right ⅓ the RCDWS panel of five check-box lines, each with a line-art icon: 'Read it two times.' 'Circle the numbers. Underline the question.' 'Draw it.' 'Write the equation.' 'Solve. Check.'; `Workspace:` band (the Draw it zone, ≥ 60 mm tall at L); equation frame `__ ○ __ = __`; answer line with unit word; `Say:` 'The answer is __ {unit}.' Word bank (≤ 4 words) only on the Guided form." | Q5: recommend the RCDWS panel (the owner's routine, fits SF-53). The default schema diagram is the alternative. |
| C-14 | ★ / ★★ / ★★★ on pupil cards: 2125–2133, 2330–2337, 4538–4549, 5580–5582 / INK-7, WDS 13, P-7, §8e (Stretch paused), P-28 | V20: star glyphs on every card; ★ = pre-filled steps + text hint; ★★ = final step blank; ★★★ = multi-step, reversed or cross-topic, dashed box. Site: the band names the level; hints fade Model → Guided (grey) → Independent (first cell only); no mixing of types in a section; Stretch is paused. | "Pupil pages print no stars. ★ = `Guided Practice:` cells (first step in grey, hints grey). ★★ = `Independent Practice:` (hint on the first cell only). ★★★ = the last row of the Practice page: the lesson's edge cases (P-10) in the SAME cell format. Cross-topic or 'reversed' items appear only if the lesson taught them. Stars stay on teacher pages as the fade label." | Q7: recommend no stars on pupil pages (stars kept teacher-side). |
| C-15 | KaTeX + SVG style: 3209–3214, 3502–3535, 5827–5962 / TY-1, TY-6, TY-7, INK-1, WDS 11 | V20: KaTeX (serif face), SVG Arial 12 px, blue / amber / green fills, px viewBoxes. Site: Andika digits and true glyphs, stacked fractions, representation minimums in mm, grey only. | As in §2 rows 5827–6006. | No. |
| C-16 | I Do model on S1: 2404–2442 / LR-1, LR-3, LR-15, PT-ANC, P-LC-6 | V20: "👁 WATCH → ✏️ FILL IN" grey box; a two-column worked example with sentence frames. Site: the anchor chart (its own page, no Name / Score): step panels with accent numerals and icons, newest marks grey, other cases drawn, `Say:`, `Rule:`/chant. The lesson sheet's Guided band repeats the Steps. | "Part P2 Anchor chart (one page, L poster). The pupil follows the board copy; the two-icon cue becomes the `look` and `write` step icons inside the panels." | No. |
| C-17 | Check Question MC: 4468–4474, 3432 / P-29, SP-3 | A 3-option MC hinge. On the board / mini whiteboards it is fine (Diagnostic Questions). It must never be printed as a pupil item. | "The Check Question is delivered on the board and mini whiteboards only." | No. |
| C-18 | Exit ticket full page: 2686–2732, 3046–3049, 5698–5700, 5750 / H5, P-13, SC-6 | V20: one ★★ problem + a 3-blank reflection filling a whole page. Site: a page < 50 % used or holding a lone item is capped (H5); no composed reflection; no tracking artefacts. | Recommended: "Part P6 Exit slip, 2-up half page (two pupils per A4, dashed cut line, PG-5): one problem in the lesson's cell, its slot, `Say:` frame, and two check boxes 'I can do this.' / 'I need one more day.' (no score record)." | Q8: recommend the 2-up slip. Also confirm the two check boxes are not a "tracker" under SC-6. |
| C-19 | Italic SAY rule: 2466–2469, 5528–5529 / TY-2, TY-3 | V20: spoken words in italics. Site: Andika is loaded at 400 / 700 upright with `font-synthesis: none`, so italics print upright and the rule silently fails. | T-SCRIPT (§4): spoken words follow a bold `Say:` / `Ask:` label, inside curly quotes, at 13 pt (2 pt larger than the 11 pt body), with the `say` icon at the step's left. | Q9: recommend the quotes + size + label rule. Alternative: the site self-hosts Andika Italic for teacher pages only (a kit change). |
| C-20 | Chunked Flow, 4+ new atoms: 2161–2187 / P-1, P-AT | V20 teaches 4+ new atoms in one lesson (two I Do cycles). Site: one new thing per step; procedures with sub-skills get decide-only or notate-only steps first (P-9). | "With 4+ new atoms, first propose splitting into two lessons (two steps). Use Chunked Flow only when the teacher keeps one lesson." | No (advice). |
| C-21 | Internal contradictions | "12 categories" vs 15 (911, 2154). You Do 20 min vs 15 (4517 vs 2147). Option B "0–1" vs "1–2 grades below" (4109, 5515 vs 2085). Warm-up workspace "none" vs "required" (2119 vs 5676). SAY cap 12 vs 15 words (836 vs 5756). Q4 estimation MC vs "avoid MC" (2114 vs 1357). "Teal signals" with red (4744). Stale V14 / V16 / T6b references. | Fix each as in §2. | No. |
| C-22 | Grade band changes type: 5310–5388 | V20: PK–2 gets 14 pt and bigger boxes; 3–5 gets 11 pt. Site: one size L for every grade (already larger than V20's PK–2 spec); grade changes counts and number ranges only; age-neutral pages (P-18). | As the §2 counts table. | No. |
| C-23 | Teacher page names and footer: 2908–2929, 5406–5413 / HD-30, HD-5 | V20: uppercase "MATH LESSON \| TITLE \| TEACHER MATERIALS \| PAGE T3", grey #888. Site: strand tab with the page id; 7 pt black footer of tags; © line. | T-HEAD / T-FOOT (§4). | No. |
| C-24 | Paused page types / Find the mistake: 3119, 1670–1687, 1454–1464, 958, 4348–4358 / §8d, §8e | V20 prints error-analysis items (Cat 8 D Error Hunt, Cat 11 C, ★★★ error-analysis writing) and Variation / Controversy sets for pupils. Site: Find the mistake, True or False?, Reason It and Stretch are paused for new worksheets. | "No error-analysis, true-or-false or reasoning items on pupil pages. The Wrong Example stays on the board in the I Do (teacher-only). Number-sense 'circle the mistake in a sequence' (Cat 1 C, Cat 8 D) is kept only as a count-row with the wrong term to cross out and the right one to write (a production item, not a page type)." | Q10: confirm the sequence-mistake items may stay (recommend yes: they are counting items). |
| C-25 | Copyright and verbatim extraction: 3205–3207 / PT-FRM-7a, P-33 | V20: copy third-party word problems verbatim. Site: every page carries "© Cultivating the Digital"; content is our own. | "Rewrite third-party items in our own words (same numbers and structure); verbatim only for the teacher's own material or via Method E (use the printed sheet)." | Q6: recommend rewrite. |

---

## 3a. The owner's proposed V21 layout rules

Verdicts on the coordinator's three proposed rules. The goal behind all three, no wasted space, is right: it is
LESSONS_LEARNED L2 and RUBRIC H5 / H13. The lead's reading is **confirmed**, with one addition: the anchor chart is the
place where (a) and (c) are already the rule.

| Proposed rule | Verdict | Why | Exact V21 rule instead |
|---|---|---|---|
| (a) "Every page grows its pictures, then its text, until the page is full." | **Conflicts as written; the goal fits.** | Text and digit size are fixed by the lesson's one size L and never change from page to page (§8a, LR-10, DN-10). Sizes are computed once per section (PG-11, PT-ENG-6); cells are equal (CL-3). Spare height goes to the answer or work zone, never to the problem (PG-14, PT-ENG-5). Growing text page by page would also make the Practice page differ from its key and from screen parity. | "**Fill the page with work, not with bigger print.** Type and digits are fixed at size L on every page. A page is filled in this order: (1) more items, up to the role's ceiling (WDS 12.1); (2) the answer or work zone of every cell gets the spare height; (3) banded pages give each band row up to 8 mm (PT-ENG-3). A page must be ≥ 50 % used, with no cell band ≥ 30 % empty (H5, H13). **Exception, the anchor chart:** it is a wall poster, so its step drawings DO enlarge until the page is full, never below 0.8× (other examples ≥ 0.85×) (LR-15, PT-ANC-1)." |
| (b) "We Do and You Do pages hold 4–6 problems each." | **Mostly fits; set it per page part.** | You Do: Independent ceiling 6 at L (2 × 3) and 4 for long procedures (12.1, PED 2.2), so 4–6 is right. We Do in the packet is the `Guided Practice:` band beside `Steps:`, 2–3 cells (opener at L: 2–3, LR-4), not a full page. A stand-alone Guided page holds 3–6 at L. Exceptions: word problems 1 per page (v1) or 2 (v2); wide visuals (number lines, base-10 over 100, coin rows) 3 rows at L; one-symbol answers (facts, "27 → __") up to 15–16 per page (2 × 8 grid, LESSONS_VISION #3); K picture problems ≤ 2. | "**We Do: 2–3 Guided cells** on the lesson sheet (a separate Guided page holds 3–6). **You Do: 6 per Practice page** (2 × 3); **4** for long procedures (regrouping, long multiplication or division); **3 rows** for wide visuals; **up to 15** for one-line answers; **1** scaffolded or **2** faded word problems. Never fewer than the page can hold." |
| (c) "Each picture grows until it fills its own card." | **Conflicts, except where the pupil works on the picture.** | A visual may grow to at most 1.25× its minimum and is never distorted (RP-3). It must be the same size in every cell of a section (CL-3, TY-26). Its size must not hint at the answer (L-LEAK: bars not proportional to values; constant track and box counts). It must leave ≥ 40 % of the cell free (CL-5). Exception: when the pupil works ON the picture (shade, partition, mark a number line, plot, draw hands, draw counters), the picture is the answer zone and takes the spare height (CL-4 exception, CL-5 "draw / shade visual counts as workspace"). | "**Pictures are drawn at their size-L minimum, up to 1.25×, the same size in every cell of a section, never distorted and never sized to hint at the answer.** The spare height in the cell goes to the answer zone. **Exception:** a picture the pupil marks (shade, partition, mark, plot, draw) is the answer zone and grows to fill its cell (same size in every cell). **Anchor chart:** step drawings enlarge to fill the poster (rule a)." |

---

### Owner rulings (2026-10-16): these replace (a)–(c) in V21, word for word

- **OR-a** "Every page is full. Spare height goes first to each card's work/answer space. Pictures may grow up to 1.25×
  their minimum, the same size in every card of the section. Text and digit sizes are fixed by the lesson size and never
  change from page to page. If space is still left, add a problem (up to the page's ceiling) — never enlarge the
  content."
- **OR-b** "We Do and You Do pages hold 4–6 problems: 6 by default (2 × 3), 4 for long procedures. Exceptions: word
  problems 1–2 per page, full-width visuals (number lines, coin rows) 3–5."
- **OR-c** "A picture is the same size in every card of a page, up to 1.25× its minimum. When the pupil works ON the
  picture (shade, partition, mark, plot, draw), the picture is the answer zone and takes the spare height."

- **OR-b revised (owner, 2026-10-16):** "The We Do and You Do can have as many problems as make sense and will be clear
  according to our design specifications." The fixed 4–6 is replaced by the site's capacity rules (WDS 12.1 / 12.3
  ceilings by page role at L, ≥ 40 % free per cell, no page < 50 % used, no lone item, no band ≥ 30 %, content never
  shrinks); V21 §8.11 and §8.12.1 carry it.

Builder notes. These do not change the rulings; they say how to apply them consistently with the site:
- OR-a's "add a problem" comes after the work zones are filled. It stops at the role ceiling (WDS 12.1).
- The anchor chart is a poster and keeps LR-15: its drawings fill the page, never below 0.8×. State this in V21 as the
  one exception to OR-a's "never enlarge".
- OR-b covers a We Do *page*. The lesson sheet's `Guided Practice:` band beside `Steps:` stays 2–3 cells (LR-4). V21
  should say which applies where.
- One-symbol fact rows (up to 15–16 per page) are not named in OR-b. Ask the owner whether they are a further exception
  (recommended: yes, as the site does).

## 4. Teacher pages: one family with the pupil pages

The site has no teacher page yet. T1–T6 should look like the anchor chart and keys: same frame, same Andika, black,
white and one grey. They must still be scannable mid-lesson. All teacher pages are A4, portrait, live area 186 mm.

**T-HEAD.**
- The header reflows to "fields off, tab on, title on". There is no Name / Date / Score (not a pupil page). The title is
  lifted into row A when ≤ 118 mm wide: H = 17 mm (WDS 8.3).
- Strand tab: 30 × 14 mm, 1.5 pt, three lines. `Level 2` / `Subtraction` / page id `Teacher 1`…`Teacher 5`, then
  `Answer Key` for T6. This needs PT-FRM-9 to add the ids `Teacher n` (owner sign-off with Q9).
- Title: the same I Can title as every pupil page, 18 pt bold, then the 2.25 pt rule.
- Continuation pages: the 12 mm header (HD-20).

**T-FOOT.**
- 7 pt black.
- Left: skill id · Grade · CCSS · EE.
- Centre: `n/N`.
- Right: `Teacher · Form A · seed`.
- Under it: the © line.
- There is no "TEACHER USE ONLY" banner. The tab id and the footer mark the page.

**T-TYPE.**

| Element | Size | Weight | Notes |
|---|---|---|---|
| Section heads, e.g. `Section 3 · I Do (12 min)` | 15 pt | 700 | Under a 2.25 pt rule, like a band (8 mm strip). Sentence case, no capitals. |
| Sub-heads | 13 pt | 700 | — |
| Body | 11 pt | 400 | Line-height 1.3. |
| Spoken lines | 13 pt | 400 | — |
| Table text | 10 pt | — | Teacher-facing; TY-11 floor is 8 pt. |
| Footer | 7 pt | — | — |

T1's title is the shared 18 pt title. V20's 30 pt blue title is dropped: the site uses one title size.

**T-SCRIPT (replaces the italic rule).**
- Each numbered step is a row: the numeral in a 6.4 mm accent circle (`.mq-lnum`, the same mark as the pupil Steps, so
  "step 3" looks the same to teacher and pupil), then lines labelled `Do:` / `Say:` / `Ask:`.
- The labels are bold 11 pt in a fixed 14 mm label column.
- `Say:` / `Ask:` text is 13 pt inside curly quotes “…”, so spoken words are found by quote marks, size and label, not
  italics.
- Rows are divided by 0.75 pt hairlines. There are no shaded bands.

**T-BOX-1…4.** Each is a 3 mm rounded box (a container to read). Inside: a bold label word + colon at 11 pt, then a
2–5 word memorable title, then text at 11 pt. The types are told apart by the word, a 5.8 mm black line-art icon (new
`teacher-icons.js` in the `lesson-icons.js` style) and the border weight:

| Box | Border | Icon |
|---|---|---|
| `Tip:` (lesson tip) | 0.75 pt | a lightbulb |
| `Feedback:` | 0.75 pt | a speech bubble with a tick; correction scripts use `Fix:` |
| `Watch:` (misconception) | **1.5 pt** (the only heavy box: an alert) | an eye with a mark |
| `Research:` | 0.75 pt | a book |

`Note:` is plain text, no box. Black only: purple is reserved for steps.

**T-LOOP (data loops).** Three rows with shape icons drawn in black. The words carry the meaning; the shapes repeat it
(INK-6):
- `Most:` a solid circle;
- `About half:` a half-filled circle;
- `Fewer than half:` a hollow circle.

**T-ICON.** No emoji. Line-art icons in black for:
- Critical atom: a key.
- Language barrier: a speech bubble with "Aa".
- Why it works: a lightbulb with a line.
- Manipulative: cubes.
- Board: a rectangle on legs.
- Mini whiteboard: a small board.

**Colour on teacher pages.** Two colours are kept, each with the same meaning it has on pupil pages, and each with a
second cue:
1. Accent purple #5B2A86 on step numerals and step icons. It ties the script's step 3 to the chart's step 3.
2. Key #C2410C on every answer and expected response in the scripts and on T6. The teacher sees "answer" at a glance,
   it is the colour of the key the teacher marks with, and it prints dark grey on a photocopier.

Everything else is black, white and one grey. Grey is used only for trace digits where a teacher page reproduces a pupil
item.

**Page by page.**

| Page | Layout (A4, body 245 mm after the 17 mm header) |
|---|---|
| **T1 Lesson at a glance** | Row 1: title (header) + one 11 pt line `CCSS 2.NBT.B.5 · EE M.EE.2.NBT.5 · CRA: Pictures · Flow: Standard`. Band `Lesson guidance:` with ≤ 3 T-BOX Tips. Band `Lesson flow:`: a two-column table of the 8–10 sections (accent-free numerals 1–7, minutes right-aligned, 0.75 pt rules). Band `Materials:`: check-box list (5 mm check boxes). Band `Vocabulary:`: ≤ 3 cards as on the pupil page (mini-diagram + word) + a gloss line. One page; the order is fixed as V20. |
| **T2 Atomisation template** | Bands `Vocabulary:` (≤ 6 cards, the pupil 3 checked) · `What students need to know:` (table) · `What students do:` (table; Critical Atom row marked with the key icon and bold) · `How to teach:` · `Common mistakes:`. Tables per §2 row 3776. May continue (12 mm header). |
| **T2b Reference key** | Two columns of 91 mm with a 4 mm gutter and 0.75 pt tables. Tab id `Reference`. Footer note "Print once per unit". |
| **T3–T5 Delivery** | One `Section n · Name (min)` band per section; a T-BOX Tip at its top; then T-SCRIPT rows. Where the pupil page is used, a **thumbnail of that pupil page** (the real cell, at 50 % scale, black and white, no answers) sits right of the band title (55 mm wide), so "Board = Paper" is visible. Inline answers in #C2410C. |
| **T6 Answer key** | The facsimile key of every pupil page in order (each its own page, tab `Answer Key`), then one routing page: table `Question · Prerequisite · If missed → Lesson`, and word-problem accepted equations. |

---

## 5. V21 outline and the builder's deliverables

**V21 heading list.**

1. Front matter (A4 / Letter, MathQuest lesson profile)
2. The presupposed student (kept; print-verb and library rule added)
3. When to use
4. Evidence base (kept; three wording fixes)
5. Teaching strategy library · Research library · Myths library (kept)
6. Number sense bank (kept content; slots, conversions C-12, Part P1 layout C-11)
7. Fade levels (★ as teacher labels; pupil bands, C-14) · Lesson time budget (60 min, revised rows) · Chunked flow
8. **Print design: the MathQuest lesson profile** (D1–D20, §1a, as full token values), including **owner rulings
   OR-a, OR-b, OR-c** (§3a) word for word, plus the decision tables and pseudocode (§5 item 5.3)
9. **Pupil pages** (the packet):
   - P0 Prerequisite Check
   - P1 Number sense (optional)
   - P2 Anchor chart
   - P3 Lesson sheet (Vocabulary / Remember / Guided Practice + Steps)
   - P4 Practice ×n (+ optional Mixed)
   - P5 Word problem (RCDWS panel)
   - P6 Exit slip (2-up)
   - Each part: anatomy diagram in mm, capacity at L, slot shapes, and key
10. **Teacher pages**:
    - T-HEAD, T-FOOT, T-TYPE, T-SCRIPT, T-BOX, T-LOOP, T-ICON
    - T1, T2, T2b, T3–T5, T6
11. Output structure: T1 · T2 · T2b · T3 (Prerequisite Check, Number sense, Retrieval, Bridge) · T4 (I Do, We Do) ·
    T5 (Check Question, You Do, Word problem, Plenary) · T6
12. Embedded boxes (four types, B&W)
13. Optional enhancements (Variation pupil set paused)
14. Teacher wording reference
15. Gathering requirements (+ paper, + "does a MathQuest lesson exist?")
16. Grade bands (counts only)
17. Mandatory rules: before / during / always–never, with the print rules R1–R12 below
18. PDF / image source workflow (rewrite rule, Andika recreation)
19. Maths on the page: Andika notation, drawing rules (WDS §11 minimums at L)
20. Appendix A: House stylesheet (kit subset + lesson CSS + teacher classes + Andika `@font-face`)
21. Appendix B: Icon library (the 12 `lesson-icons.js` paths + the proposed teacher icons)
22. Appendix C: Instruction strings and oral frames used (from PED 10.1 / 10.5)
23. Appendix D: SVG representation recipes (mm, Andika, minimum sizes at L)
24. Appendix E: Pre-output self-check (measurable pass / fail)
25. Appendix F: Fully worked example pack spec (every T and P page)

**ALWAYS / NEVER print rules R1–R12** for V21:
- R1 A4.
- R2 Andika only.
- R3 Three paints, plus the accent on step marks and the key colour on answers.
- R4 No emoji.
- R5 One title per pack.
- R6 Strand tab + D10 footer + © line on every page.
- R7 Ruled cell grids, no cards, no dashed lines.
- R8 D14 slots at B(n), no underscores.
- R9 Facsimile keys.
- R10 No composed writing on pupil pages.
- R11 Every page ≥ 50 % used, no cell band ≥ 30 % empty.
- R12 Content never shrinks; the size is L.

**The builder must produce:**
1. `design/lesson-planner/Atomisation_Lesson_Planner_V21.md`, written from V20 with every §2 verdict and §3 fix applied.
   Pedagogy text is unchanged except where named.
2. One rendered sample lesson pack made by following V21 literally:
   - recommended topic: subtract within 100 with regrouping (Level 2), so it can be compared with the passed site
     sample;
   - files: HTML + PDF + PNGs of every page (T1–T6 and P0–P6, keys included);
   - location: `design/lesson-planner/v21-sample/`;
   - rasterise with `pdftoppm -r 110` (PyMuPDF is not installed here; `ws-lesson-samples.cjs` fails at its rasterise
     step).
3. Proof checks on the sample, reported with numbers:
   - every computed font is Andika (`document.fonts.check('700 28px Andika')`);
   - the only colours are #000 / #FFF / #949494 / #5B2A86 (step marks) / #C2410C (answers);
   - no emoji code points;
   - `@page` is A4;
   - working digits measure 28 pt;
   - every page ≥ 50 % used and no cell band ≥ 30 % empty;
   - each key has the same slot count as its page;
   - the © line is on every page;
   - pupil instruction word counts ≤ 12, each sentence starting with a PED 10.2 verb.
4. **Acceptance bar (owner, 2026-10-16).** The site is the gold standard. V21 is iterated until an independent critic
   scores **≥ 8 on all four RUBRIC.md criteria (C1–C4) on every T page and every S / P page** of the rendered sample
   pack, keys included. One 7 anywhere is a fail. Teacher pages are graded with RUBRIC C1–C4, reading "pupil" as
   "teacher mid-lesson", plus the §4 specs of this audit.
5. **Self-contained for another AI (owner, 2026-10-16).** An AI with no access to this repo must be able to build the
   pack from V21 alone, with full fidelity. Every rule is stated in V21 itself; the source doc is cited in brackets only.
   V21 must contain:
   1. **Complete design tokens as values.**
      - Andika 400 / 700 loading: an embedded base64 woff2 `@font-face`; fallback `Andika, sans-serif` only to make a
        failed load visible; `cv04`; `font-synthesis: none`.
      - Every type size per element at L, and the teacher sizes.
      - Stroke set {0.5, 0.75, 1, 1.5, 2.25} pt with uses.
      - #000 / #FFF / #949494 / #5B2A86 / #C2410C with their allowed uses.
      - A4 and Letter geometry in mm (margins, live area, header ≤ 26 / 12 mm, footer 6 mm, gap 3 mm, body 236 mm).
      - Strand tab 30 × 14 mm. Title grammar and size. © line text and size.
      - Cell geometry (pads, label box, 40 % free).
      - The full answer-slot table with B(n) values and slot radii.
   2. **Copy-ready HTML + CSS + SVG.**
      - `@page` rules and the page / body / grid structure.
      - The fixed-height grid fill.
      - `break-inside: avoid` on cells and keep-together units.
      - Continuation headers.
      - Inline SVG recipes in mm viewBoxes with Andika text, for: number line + hops, ten frame, base-ten, place-value
        chart, bar model / tape, array, equal groups, number bond, analog clock, fraction bar, fraction circle,
        hundredths grid, column stack with regroup strip.
      - Each recipe carries its WDS §11 minimum size at L and its drawing rules (never draw the answer, solid vs hollow
        sets, grey only for shaded parts).
   3. **Decision rules as if/then tables or pseudocode.**
      - Problems per page by role and procedure length (OR-b, WDS 12.1).
      - When a picture takes the spare height (OR-c).
      - Page-fill order (OR-a).
      - Pagination and last-page rebalancing (PG-20…24).
      - Scaffold fade per star level (C-14), and structural vs hint lists (WDS 13.1).
      - Slot choice (line, box, circle, check box).
      - Key layout and colour (AK-1…4, INK-31).
      - Prerequisite routing.
   4. **A pre-output self-check** with measurable pass / fail items mirroring the site's lints:
      - ≥ 40 % free per cell; no cell band ≥ 30 % empty; page ≥ 50 % used;
      - equal cell size across a section;
      - no text below its size (pupil ≥ 11 pt, digits 28 pt);
      - only the five allowed paints, accent only on step marks, #C2410C only on key answers;
      - no emoji; Andika on every node;
      - no dashed line except cut / missing-digit;
      - slot widths = B(n) per section; no underscores;
      - instructions ≤ 12 words with print verbs; frames ≤ 2 blanks;
      - key slot count = page slot count;
      - © line and strand tab on every page.
   5. **One fully worked example pack spec**: every T and P page of the sample lesson, its items, its numbers and its key
      values, written out.

---

## 6. Owner questions (with recommended answers)

| Q | Question | Recommended answer |
|---|---|---|
| Q1 | Where MathQuest already has a passed lesson for the skill, should V21 use the site's pupil packet and generate only the teacher pages? | **Yes.** The pupil pages already pass 8/10, and the pack stays consistent with what pupils see online. |
| Q2 | Paper. | **A4 default**, US Letter on request. |
| Q3 | Replace the warm-up and mini-whiteboard prerequisite check with the printed, routed Prerequisite Check, and move spaced retrieval to mini whiteboards? | **Yes.** |
| Q4 | Number sense practice: a separate optional Daily-look page (two bands A / B), or oral only? | **Separate optional page, default on.** This needs a new band label "Number sense:" in BD-1. |
| Q5 | Word problem: keep RCDWS as a check-box panel, or switch to the site's schema diagram? | **RCDWS panel.** |
| Q6 | Third-party problems: rewrite in our words, or keep verbatim without our © line? | **Rewrite.** |
| Q7 | Stars on pupil pages? | **No.** Stars stay on teacher pages. |
| Q8 | Exit ticket as a 2-up half-page slip with "I can do this / I need one more day" check boxes? | **Yes.** |
| Q9 | The SAY rule without italics (quotes + 13 pt + `Say:` label), and new tab ids `Teacher n`? | **Yes.** |
| Q10 | Keep the "circle the mistake in a sequence" number-sense items while Find the mistake is paused? | **Yes,** as count-row production items. |
