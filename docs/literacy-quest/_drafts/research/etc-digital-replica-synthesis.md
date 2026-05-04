# Explode the Code Digital Replica — Synthesis

**Source document:** "Explode the Code (EtC) — Comprehensive Reverse-Engineering Brief for a Digital Replica (ELL/SPED, K–5)"  
**Synthesized:** 2026-05-03  
**Purpose:** Inform Literacy Quest widget design, skill atom catalog, and Practice mode session loop.

---

## 1. Document Overview

The brief is a reverse-engineered design specification produced for an internal Literacy Quest planning session. It draws on EPS Learning's published sample lesson (Book 1, Lesson 3, pp. 18–25), EPS product pages, the EPS Knowledge Base scope-and-sequence entry, and long-form third-party reviews (Cathy Duffy, Rainbow Resource, Treehouse Schoolhouse, Eclectic Homeschooling, The HomeSchoolMom) to reconstruct the full structure of the ETC series without requiring direct purchase of all 17 books.

**Target audience:** The brief is addressed to Literacy Quest developers and content architects. It is not a pedagogical overview for teachers — it is an implementation spec.

**Scope:** 17 phonics workbooks (Primers A/B/C + Books 1–8, half-books 1½–6½, no 7½ or 8½) + 4 Beyond the Code comprehension books. The brief also covers ETC Online (EPS's existing digital product) as a UX reference and a catalog of weaknesses to deliberately surpass.

**Authors/publisher of ETC:** Nancy M. Hall and Rena Price (core books); Hall and Hugh Price (Beyond the Code). Published by Educators Publishing Service (EPS), current edition 2nd Edition (©2016).

---

## 2. The ETC Series Structure

### The Three Sub-Series

**Get Ready for the Code (Primers A, B, C — PreK through Grade 1)**

Each primer covers a consonant subset, progressing through fine-motor tracking, visual discrimination, and phonemic-awareness pre-literacy skills. No reading yet — the primers establish the sound-letter correspondence scaffold.

| Primer | Consonants | Grade |
|---|---|---|
| A — Get Ready for the Code | b, f, k, m, r, t | PreK–K |
| B — Get Set for the Code | d, h, j, n, p, s | PreK–K |
| C — Go for the Code | c, g, l, q, v, w, x, y, z (9 letters) | PreK–1 |

**Explode the Code — Main Books (Books 1–8 + half-step books)**

Each book = one skill level. Each lesson = exactly 8 student pages. Each lesson targets one skill (e.g., "short a with final consonants"). The half-books (1½–6½) are not new pedagogy — they reuse the same 19 exercise archetypes with fresh items. Books 7 and 8 add decodable stories with comprehension questions and crossword/word-find puzzles. There are no 7½ or 8½ books.

| Book | Core Skills | Grade |
|---|---|---|
| 1 | Short vowels (a, i, u, e, o); CVC blending | 1 |
| 1½ | Same short vowels, fresh items; 10 lessons | 1 |
| 2 | L-blends, S-blends, R-blends, tw; final blends (mp, sk, st, ft, lt, nt, lf, lp, nd, nk) | 1–2 |
| 2½ | Same blends, additional practice | 1–2 |
| 3 | y as vowel; silent-e (CVCe) for a-e, i-e, o-e, u-e, e-e; digraphs sh, ch, th, wh, ck, ng, tch; vowel digraphs ee/ea, ai/ay, oa/ow | 1–2 |
| 3½ | Same skills, additional items | 1–2 |
| 4 | Compound words; suffixes -ful, -ing, -est, -ed, -ness; syllable types and syllabication | 2 |
| 4½ | Same skills | 2 |
| 5 | Three sounds of -ed (/t/, /d/, /əd/); -ey; word families (all/alk, old/olt/oll, ild/ind); digraph qu; 3-letter blends (thr, shr, scr, str, spr, spl) | 2–3 |
| 5½ | Same skills | 2–3 |
| 6 | R-controlled vowels (ar, or, er, ir, ur, war, wor); silent -igh; diphthongs/vowel teams (oo, ea, ie, oi, oy, ou, ow, au, aw, ew, ui, ue) | 2–3 |
| 6½ | Same skills | 2–3 |
| 7 | Soft c, soft g; silent-letter patterns (-dge, -mb, kn, wr, silent t, silent h); digraph ph; sounds of ear; ei, eigh; adds stories + comprehension + crosswords | 3–4 |
| 8 | Advanced suffixes (-ness, -less, -ous, -or, -ist, -ity, -ture, -ment, -able, -ible, -sion/-tion, -ance/-ence, -tive/-sive, -ify, -ize, -ti-/-ci-); antonyms/synonyms; multisyllabic word building; stories + crosswords | 3–4 |

Every book includes mid-sequence review lesson(s) and a posttest. Book 1 also has a pretest (consonant prerequisite check). Books 6, 7, and 8 each contain three review lessons.

**Beyond the Code (BTC 1–4 — Comprehension track)**

BTC is a parallel comprehension strand, not a continuation of the phonics sequence. EPS markets it as aligning with ETC Books 1–4, but Rainbow Resource notes BTC 1 actually starts at ETC Book 3's long-vowel level. Literacy Quest should treat BTC as a comprehension track gated by ETC skill mastery, not by book number.

Each BTC book centers on decodable short stories followed by vocabulary and comprehension work. The "Think About It!" prompt — inferential, comparison, and personal-connection questions requiring written responses — is the signature exercise.

| BTC Book | Stories | Notable Skills |
|---|---|---|
| BTC 1 | Zack the Dog; Six Kids Jog; Help! 911 | Long+short vowels, word-family warm-ups |
| BTC 2 | 7 stories including Plum, The Camp Out, Lost in the City | Spelling patterns, sight words, sequencing, categorizing, inferential thinking, rhyming, multi-syllabic words |
| BTC 3 | 5 stories including Kids Need Pets, A Fish That Can Fly! | Story recall, critical thinking |
| BTC 4 | 6 stories including The Treasure Hunt, A Wild Ride | Vocabulary development, drawing-based comprehension |

BTC sight word examples: BTC 1 — *why, door, they*; BTC 2 — *backpack, asleep, light, could, spaghetti*; BTC 3 — *doesn't, bluefish, together, skateboard, school*.

---

## 3. Pedagogical Approach

ETC is explicitly Orton-Gillingham–based: structured, sequential, cumulative, synthetic phonics. The approach is bottom-up — sound → letter → word → phrase → sentence → paragraph → story. The 2nd Edition product page states: "Activities build in difficulty level, starting with context appearing at word level (relating word to picture), then sentence level, short paragraphs, and ending with denser text passages."

**What makes ETC effective for ELL/SPED:**

1. **Minimal cognitive load.** Approximately 6–8 items per page, never more than 12. The low density is one of the program's most-cited strengths for SPED and struggling readers.
2. **Instruction icons before words.** Each page uses a tiny icon (hand pointing, pencil, X, circle) plus a 1- to 5-word imperative. ELL students learn the icons before they can decode the instruction words — this is critical scaffolding.
3. **Three and only three response types per page.** Circle, cross-out, write on a line. Students are never surprised by a novel response mechanic within a lesson.
4. **Repetition with variation.** The same 19 exercise archetypes appear across all books. Only the content changes — the procedure is always familiar.
5. **Multisensory components.** Visual (page), auditory (teacher dictation, peer flashcards), kinesthetic (letter tiles, finger-tracing stroke-order arrows, Wall Chart felt pieces).

**The OG Lesson Routine** (from the Teacher's Guide front cover — every lesson, every book):

1. Quick Review — auditory ending-sound discrimination (thumbs-up/down for word lists)
2. Phonemic Awareness — phoneme blending and segmenting
3. Phonics Review — Code Card + Wall Chart key-word; choral repetition ("a says /ă/ as in apple")
4. Vocabulary — define unfamiliar items on the student page (e.g., *tag, sap, pal, cap, bass*)
5. Completing the Student Pages — model one item, then independent work
6. Fluency — word-family flashcards against a partner (timed)
7. Comprehension — open questions, demonstrations (show what *wag* means), category questions
8. Writing — word-clue dictation
9. Differentiation — Visual / Auditory / Kinesthetic tracks; ½-book reference for extra practice; ETC Online unit numbers

---

## 4. Catalog of Question/Answer Types

The brief identifies 19 distinct exercise archetypes reverse-engineered from the print books. Every type except #17–19 appears in Books 1–6; archetypes #17 and #18 are Book 7+ and all BTC only.

### Type 1 — Find-the-Picture-That-Begins-with-the-Sound ("Circle it.")

**Stem template:** "a says /ă/ as in [apple icon]. Find the picture that begins with the sound of the letter below. ⃝ it."  
**Answer mechanic:** `mc-image` (3-column grid of line-art pictures; tap to circle; correct picture pulses, others fade)  
**Skill:** Initial sound–symbol matching  
**K-2 vs 3-5:** K-2 only (Primers A/B/C and Book 1); Grade 3+ does not use this format  

### Type 2 — Same-Word Match ("⃝ the same word.")

**Stem template:** Three near-identical words per row (e.g., *bag / gab / bag*); student circles the two identical words.  
**Answer mechanic:** `mc-multi-select` (must select exactly 2; show circle outlines on tap)  
**Skill:** Visual word discrimination, orthographic memory  
**K-2 vs 3-5:** Books 1–3; most intensive in Books 1–2; decreases as decoding strengthens  

### Type 3 — Letter Tracing

**Stem template:** Numbered stroke arrows on a dotted letter.  
**Answer mechanic:** `ink-draw` (drawing canvas with stroke-order detection; numbered start dots)  
**Skill:** Letter formation, fine-motor  
**K-2 vs 3-5:** Primers only  

### Type 4 — Listening / Yes-No Follow-Direction (Primer auditory)

**Stem template:** Teacher narrates a riddle ("hot dog at a baseball game"); student marks the matching picture.  
**Answer mechanic:** TTS narrates riddle → `mc-image` or `tap-hotspot` for picture selection  
**Skill:** Listening comprehension, vocabulary, following directions  
**K-2 vs 3-5:** Primers only  

### Type 5 — X-Out the Wrong Word or Picture ("X it.")

**Stem template:** Picture + two words (e.g., *bad / bag*) OR word + two pictures; student crosses out the wrong one.  
**Answer mechanic:** `tap-hotspot` or `two-button-binary` (tap applies an animated X-strikethrough; tap again to toggle off)  
**Skill:** Word-meaning matching, forced choice  
**K-2 vs 3-5:** All books 1–8 and all half-books; the most ubiquitous single archetype  

### Type 6 — Read, Copy, and X It.

**Stem template:** Word + writing line + picture row; student writes the word then X-es the matching picture.  
**Answer mechanic:** `fib-auto` (type the word) + `tap-hotspot` (X the picture); two-step  
**Skill:** Encoding and decoding linked; orthographic–semantic bridge  
**K-2 vs 3-5:** Books 1–6; the "copy" step is dropped in Books 7–8 (morphology focus)  

### Type 7 — Spell. Write. (Column-letter Word Build)

**Stem template:** Picture + three vertical columns of letter choices (e.g., b/c/j · a/n/o · g/p/t) + writing line. "Spell. Write."  
**Answer mechanic:** `letter-tile-spell` (tap one tile per column; assembled word auto-displays; type or auto-fill the word)  
**Skill:** Phoneme-grapheme mapping, phoneme segmentation  
**K-2 vs 3-5:** Books 1–6; in Books 5–8 columns expand to 4+ letters for longer words  

### Type 8 — Word-Bank Match and Write ("Match and write it.")

**Stem template:** 8-word bank (2 rows × 4 columns at top of page) + 8 pictures with writing lines.  
**Answer mechanic:** `match-pairs` or `dnd-linked` (drag word onto picture; word locks to writing line)  
**Skill:** Vocabulary + spelling reinforcement  
**K-2 vs 3-5:** All books; word bank grows from 8 words (Book 1) to 12+ (Books 6–8)  

### Type 9 — Sentence-to-Picture X-It ("X it.")

**Stem template:** Picture + two sentences (e.g., *A rat naps in a cap. / The man pats a cat.*); student X-es the wrong sentence.  
**Answer mechanic:** `two-button-binary` or `tap-hotspot` on sentence chips  
**Skill:** Sentence-level reading comprehension  
**K-2 vs 3-5:** Books 1–8; sentence complexity and length scale with book level  

### Type 10 — Yes-No with Picture ("Read & check the picture / Yes-No")

**Stem template:** Sentence + Y/N choice OR picture + Y/N choice.  
**Answer mechanic:** `two-button-binary` (two-button tap)  
**Skill:** Inferential meaning; common-sense world knowledge integrated with decoding  
**K-2 vs 3-5:** Books 2–8; Cathy Duffy calls out "ridiculous yes/no questions in most lessons" as a hallmark  

### Type 11 — Cloze with Word Bank or Picture Choices

**Stem template:** Sentence with blank + 2–3 picture/word options. "Circle correct fill."  
**Answer mechanic:** `drop-down-inline` or `mc-text` (tap to select)  
**Skill:** Vocabulary in context; EPS explicitly cites: "Cloze activities help promote vocabulary development by presenting words in context"  
**K-2 vs 3-5:** Books 4–8; picture options for Books 4–5, word options for Books 6–8  

### Type 12 — Word-Family Ladder / Word Build

**Stem template:** Ladder of -an, -am, -ad, -at, -ap, -ag with rotating onset; student writes each new word.  
**Answer mechanic:** `fib-auto` (type) or `build-with-tiles` (drag-tile letters; "letter tiles" mode for kinesthetic)  
**Skill:** Onset–rime, decoding by analogy  
**K-2 vs 3-5:** Books 1, 2, 5 (heaviest); grade 2–3 variant uses 3-letter blends  

### Type 13 — Compound-Word Build

**Stem template:** Picture-pair → equation: cup + cake = ?; student writes compound word.  
**Answer mechanic:** `dnd-linked` or `sentence-build` (drag two word-tiles together; system fuses them)  
**Skill:** Morphology, compounding  
**K-2 vs 3-5:** Book 4 only  

### Type 14 — Suffix / Prefix Build

**Stem template:** Base word + suffix tile → new word; meaning gloss shown.  
**Answer mechanic:** `sort-into-bins` or `dnd-linked` (drag suffix to base; MC meaning choice)  
**Skill:** Morphology, vocabulary expansion  
**K-2 vs 3-5:** Books 4, 5, 8; Book 8 uses advanced suffixes (-tion, -sion, -ance, -ence, -able, -ible, -ize, -ify)  

### Type 15 — Syllable Division

**Stem template:** Multisyllabic word; student marks the division point.  
**Answer mechanic:** `tap-hotspot` (tap between letters to insert divider)  
**Skill:** Syllabication rules  
**K-2 vs 3-5:** Books 4–8  

### Type 16 — Write It / Draw-and-Label (Every lesson's final page)

**Stem template:** Pictures with writing lines; sometimes an empty box marked "Draw it."  
**Answer mechanic:** `fib-auto` (type the word from a picture) + `ink-draw` (drawing canvas with caption box)  
**Skill:** Spelling production, creative output  
**K-2 vs 3-5:** All books, all lessons — the final page of every lesson; the "draw your own picture" box is the program's defining creative-output convention  

### Type 17 — Decodable Short Story + Comprehension Questions

**Stem template:** 1–2 pages of story + literal, vocabulary, sequencing, and inferential questions; "Think About It!" open-response.  
**Answer mechanic:** Audio-supported text (highlight-as-read via `chain-images` or passage rendering), `mc-text` (literal), `mc-multi-select` (multi-detail), `sequence-events`, `fib-auto` (short answer), `ink-draw` (drawing response for "Think About It!")  
**Skill:** Reading comprehension, inferential thinking, vocabulary in context  
**K-2 vs 3-5:** Books 7–8 only for ETC; all of BTC 1–4; BTC chapter template = 12-question set covering 12 skill types (spelling patterns, sight words, vocabulary, sequencing, categorizing, following directions, critical thinking, story recall, inferential thinking, rhyming, multi-syllabic words, sentence-picture matching)  

### Type 18 — Crossword and Word-Find

**Stem template:** Standard puzzle grids with phonetically-controlled clues.  
**Answer mechanic:** `fib-auto` (cell-tap grid input); `tap-hotspot` (word-find tap-and-drag selection)  
**Skill:** Spelling, vocabulary review  
**K-2 vs 3-5:** Books 7–8 only; not in MVP build  

### Type 19 — Pretest / Posttest

**Stem template:** Mixed-format criterion-referenced assessment; some teacher-dictated.  
**Answer mechanic:** Untimed assessment mode; auto-scoring across mixed types  
**Skill:** Mastery check; adaptive branching signal  
**K-2 vs 3-5:** Pretest in Book 1 only; posttest in all books; six-tier placement test is onboarding  

---

## 5. Visual Design Conventions

**Illustration style:** Black-and-white line art is the program's signature aesthetic. EPS uses approximately 2pt black stroke with no fill for all pictorial items. The brief recommends SVG line art replicating this style. Cover art intentionally scales in sophistication — Book 1 looks like a 5-year-old drew it; Book 8 looks like a 9-year-old's work — mirroring the student's developmental stage.

**Layout grid:** Typically 3 columns × 6–8 rows per page. Items are surrounded by ample white space. The low density is a deliberate design choice for SPED/ELL accessibility. Never more than 12 items per page; 6–8 is the target.

**Instruction icon + imperative:** Every page has a tiny icon (pencil, hand pointing, X, circle) followed by a 1- to 5-word imperative in large print. The exact verbatim phrasings shipped with the digital app must be: "X it." · "Circle it." · "Match and write it." · "Spell. Write." · "Read, copy, and X it." · "Write it." · "Think About It!" Students learn the icon before they can decode the words — this is a critical ELL/SPED accessibility pattern, not a decoration.

**Response mechanics in print:** Exactly three — circle, cross-out, write on a line. The digital equivalent must expose only those three response types per item type and not introduce novel widgets mid-lesson.

**Word banks:** 2-row × 4-column tables at the top of word-bank pages. Eight words total is the standard count for Books 1–5.

**Writing lines:** Simple horizontal black lines under or beside each item; not dashes, not dotted lines.

**Typography:** Primary-grade humanist sans-serif with single-story 'a' and 'g' (Sassoon Primary or Century Schoolbook style). Capital letters introduced in a small corner of letter pages for awareness only; lowercase-first throughout.

**"Draw your own picture" prompt:** Final page of nearly every lesson. A labeled blank box where students draw their own decoded sentence. The brief identifies this as a key creative-output convention that must be preserved in the digital app via a drawing canvas with optional save-to-gallery.

---

## 6. Lesson Structure / Pacing

**Standard pacing:** 1 page per day = 8 days per lesson. Approximately 8 weeks per book. Students complete 2–3 books per year.

**A typical 8-page lesson (verified from Book 1, Lesson 3, pp. 18–25):**

| Page | Archetype | Student Task |
|---|---|---|
| 1 | Initial-sound match (Type 1) | Circle the picture in each row that begins with the target letter sound |
| 2 | Same-word match (Type 2) | Circle the two identical words in each row |
| 3 | Read, copy, and X it (Type 6) | Copy the word on the line; X the matching picture |
| 4 | Spell. Write. (Type 7) | Circle one letter per column to build the word; write it on the line |
| 5 | X-it choice (Type 5) | X-out the word that names the picture |
| 6 | Match and write it (Type 8) | Pick from the word bank; write under the matching picture |
| 7 | Sentence X-it (Type 9) | X-out the sentence that does NOT match the picture |
| 8 | Write it / draw-it (Type 16) | Write the word naming the picture; draw your own picture |

Books 7–8 add pages 9–10 (decodable story + comprehension questions, crossword/word-find).

The lesson is internally a single skill. The page sequence is not arbitrary — it follows a concrete-to-abstract trajectory: picture recognition (Page 1) → visual discrimination (Page 2) → encoding + decoding linked (Pages 3–4) → forced choice (Pages 5) → recall and production (Pages 6–8).

---

## 7. The Reverse-Engineering Brief's Specific Digital Recommendations

**Question types to prioritize (MVP — highest frequency):** Types 1, 2, 5, 6, 7, 8, 9, 16. These eight archetypes cover the vast majority of Book 1–6 pages. Type 10 (yes-no) is also very high-frequency and trivially implemented. Types 17–19 (stories, crosswords, posttests) are lower-priority and appear only in Books 7–8 and BTC.

**What to skip in the initial build:** Type 3 (letter tracing — high implementation cost, motor-skill context assumed by digital), Type 18 (crossword/word-find — Books 7–8 only), Type 4 (Primer-only teacher-read riddles — requires specific teacher-flow scaffolding).

**Visual patterns to mirror:**
- The instruction icon + short imperative as a permanent page element, not a tooltip
- 3-column picture grids with generous whitespace
- The drawing-canvas placeholder at the end of every lesson
- Black-and-white SVG line art for all pictorial items (no clip art, no color fills on item images)

**Audio scaffolding to add for ELL/SPED beyond the print original:**
- TTS narration of all instructions, word pronunciations, and feedback
- Per-element audio buttons on every image and text item
- Slow-audio mode (50% playback rate) for phoneme-by-phoneme modeling
- L1-translation audio for the top 8 ELL home languages on vocabulary-introduction pages
- Optional ASR read-aloud mode (behind a toggle; does not block progression)

**What EPS Online got wrong (to surpass):**
- Too speed-focused; EPS's badge system rewards speed over accuracy — Literacy Quest should offer an accuracy-first mode
- Typing requirements penalize children whose typing lags reading (offer tap-the-letter mode as default for K-2)
- Does not distinguish vowel errors from consonant errors — Literacy Quest error feedback must categorize the error type
- Some pictures are visually ambiguous — all images must be pretested for interpretability with ELL students

---

## 8. Implications for Literacy Quest's Design

### Which existing widgets already cover ETC patterns

- **`mc-image`** handles Type 1 (initial-sound match, picture grid) and Type 4 (listening riddle → picture selection). Ready as-is; needs 3-column layout option for grid presentation.
- **`fib-auto`** covers the "Write it" half of Type 6 (copy+X), Type 12 (word-family ladder typed response), and the recall portion of Type 16. Needs no changes.
- **`two-button-binary`** directly implements Type 10 (yes-no with picture) and Type 9 (sentence X-it as a two-sentence forced choice). Ready as-is.
- **`sentence-build`** covers Type 13 (compound-word build) and Type 12 (word-family tile assembly). Ready with minor content variation.
- **`tap-hotspot`** covers Type 5 (X-out the wrong word), Type 9 (sentence X-it where sentences are inline chips), and Type 15 (syllable division tap-to-insert). Ready as-is; needs X-strikethrough animation variant.
- **`sort-into-bins`** covers Type 14 (suffix build with meaning sort). Ready as-is.
- **`mc-multi-select`** covers Type 2 (same-word match; must select exactly 2). Works as-is if configured with `expected_count: 2`.

### ETC patterns that need new widgets not yet built

- **`picture-match-row`** (new): Type 1 rendered as a 3-column × 6-row picture grid, not a flat list of image tiles. Each row is a self-contained sub-question. The current `mc-image` is a single question; ETC Page 1 has 6 sub-rows on one screen. A new `picture-match-row` widget renders the full page as one unit, submits per-row independently, and accumulates row scores. Maps to Types 1 and 4.
- **`word-picture-choice`** (new): Type 5 in its "picture + two words" form. The current `two-button-binary` assumes two text buttons; this variant shows a picture with two word-label buttons below it. The picture must render prominently in the card center. Trivially derived from `two-button-binary` with an image slot; worth a named variant.
- **`write-from-picture`** (new): Type 16, production-only path. A picture is shown; the student types the word that names it. Different from `fib-auto` (which shows a sentence with a blank) — no sentence frame. The entire prompt IS the picture. Grading checks the `acceptable_answers` list for the depicted word. This also drives the Type 7 "write the word after building it" step.
- **`column-letter-build`** (new): Type 7 rendered authentically. Three columns of letter tiles arranged vertically (b/c/j · a/n/o · g/p/t); the student picks exactly one letter from each column. The chosen letters slot into an assembly row that forms the word. This is distinct from `letter-tile-spell` (which gives a flat bank of individual letters) — the column structure is pedagogically significant because it maps to phoneme position. Can be implemented as a variant flag on `letter-tile-spell` or as a named widget.
- **`x-strikethrough-sentence`** (new): Type 9 rendered as a picture + two full sentences side by side, where tapping applies a crossed-out visual to the whole sentence rather than a color change. The X strikethrough is the ETC signature response and must be visually faithful — not just a red border.

### New `question_type` IDs to add to QUESTION_TYPES.md

```
picture-match-row       — multi-row image grid; per-row scoring; ETC Types 1 and 4
word-picture-choice     — image + two-word forced choice; ETC Type 5 (picture variant)
write-from-picture      — type the word that names the picture; ETC Type 16
column-letter-build     — 3-column letter picker; ETC Type 7 (authentic layout)
x-strikethrough-choice  — two-option choice rendered with animated X strike; ETC Types 5, 9
```

### How ETC's lesson structure should shape the Practice mode session loop

ETC's 8-page lesson sequence maps naturally onto Literacy Quest's deck-of-10 model. The suggested mapping for a single-skill ETC-aligned practice session is:

1. Cards 1–2: `picture-match-row` (Type 1 — picture recognition; warm-up)
2. Cards 3–4: `mc-multi-select` (Type 2 — visual discrimination; orthographic memory)
3. Cards 5–6: `column-letter-build` + `write-from-picture` (Types 7 and 16 — encoding)
4. Cards 7–8: `word-picture-choice` or `x-strikethrough-choice` (Type 5 — forced-choice decoding)
5. Cards 9–10: `fib-auto` cloze or `two-button-binary` yes-no (Type 11 or 10 — contextual meaning)

This concrete → pictorial → abstract progression directly mirrors ETC's page sequence and the OG lesson routine. The session-loop engine should respect this ordering rather than randomizing card types within a session.

### `etc_book` field to add to SkillAtom

Every skill atom in `/data/literacy-skills/reading/phonics.js` and `/data/literacy-skills/reading/phonemic-awareness.js` that aligns to an ETC book should carry an `etc_book` field identifying the book number (string, e.g., `"1"`, `"3"`, `"4"`, `"BTC2"`) and optionally `etc_lesson` (the lesson number within that book). This field serves two purposes: content authors can cross-reference ETC physical books during item writing, and the adaptive engine can branch to ETC half-book content when a student scores below 70% on that skill.

Example addition to an existing atom:
```js
{
  skill_id: 'reading_phonics_short_a_medial',
  // ... existing fields ...
  etc_book: '1',
  etc_lesson: 3,    // Book 1, Lesson 3, pp. 18-25
}
```

### Existing skill atoms that should reference ETC books

Existing atoms in `/data/literacy-skills/reading/phonics.js` that map cleanly to ETC books:

| Existing atom (partial skill_id) | ETC book | Notes |
|---|---|---|
| `reading_phonics_letter_sound_consonant_basic` | Primer A, B, C | b, m, t, s, p, n covered in A+B |
| `reading_phonics_short_a_initial` | Book 1, Lesson 1 | |
| `reading_phonics_short_a_medial` | Book 1, Lesson 3 | The verified verbatim lesson |
| `reading_phonics_short_i_*` | Book 1, Lesson 2 | |
| `reading_phonics_short_u_*` | Book 1, Lesson 3 | |
| Any blend atom | Book 2 | |
| Any silent_e / long vowel atom | Book 3 | |
| Any digraph atom (sh, ch, th, wh, ck, ng) | Book 3 | |
| Any compound-word atom | Book 4 | |
| Any suffix atom (-ing, -ed, -est, -ful, -ness) | Book 4 | |
| Any syllable-type atom | Book 4 | |
| Any r-controlled atom | Book 6 | |
| Any diphthong atom (oi, oy, ou, ow) | Book 6 | |
| Any soft-c / soft-g atom | Book 7 | |
| Any advanced-suffix atom (-tion, -sion, -ance) | Book 8 | |

### New skill atoms ETC covers that the current catalog may not yet have

The current phonics.js catalog focuses on sound-letter correspondence and decoding. ETC introduces several skill atoms not yet explicitly represented:

1. **`reading_phonics_same_word_discrimination`** — visual word discrimination (identical vs. near-identical word pairs); Type 2; CCSS RF.K.3, grade K-1. Targets orthographic memory specifically, not just decoding.
2. **`reading_phonics_word_family_onset_rime`** — word-family ladder completion (-an, -am, -ad, -at, -ap, -ag families); Type 12; RF.1.3b; Book 1 and 2.
3. **`reading_phonics_three_sounds_ed`** — the three morphophonological realizations of the -ed suffix (/t/ as in *walked*, /d/ as in *played*, /əd/ as in *wanted*); RF.2.3; Book 5. Not currently in the phonics atom list.
4. **`reading_phonics_word_family_ild_ind_old`** — word families ild/ind, old/olt/oll, all/alk; Book 5; RF.2.3.
5. **`reading_phonics_silent_e_arrow`** — the specific visual-phonological connection between silent-e and vowel lengthening (the "magic e arrow" concept); Book 3; RF.1.3c. Can be targeted with a `chain-images` demonstration card plus `two-button-binary` forced-choice practice.
6. **`reading_comprehension_yes_no_sentence`** — inferential yes/no questions about simple sentences (not passage-level); Books 2–8; aligns to RL/RI.1-2 at a sentence level. Currently missing from comprehension atoms because the current comprehension atoms assume passage-level text.
7. **`reading_phonics_sentence_picture_match`** — matching a sentence to its corresponding picture (Type 9); RF.1.4a, RL.1.1; distinct from word-level matching because the skill tested is sentence-level decoding and meaning-check simultaneously.
8. **`reading_spelling_production_from_picture`** — produce the correct spelling of a pictured CVC/CCVC/CVCe word without a sentence frame (Type 16); L.1.2d; pairs with encoding skills but tests spelling production independently from decoding.

---

*End of synthesis.*
