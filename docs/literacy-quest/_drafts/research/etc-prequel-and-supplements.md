# ETC Prequels and Supplementary Series — Research Synthesis

**Sources examined:** Get Ready for the Code A/B/C (image-only scans; structure reconstructed from existing synthesis in `etc-digital-replica-synthesis.md`); Basic Phonics Skills Level A PK-K (Evan-Moor EMC 3318, full text extracted); Beginning to Read Grade K Part 1 (image-only scan); Beyond the Code series (not present in Reading Books folder — covered via prior ETC synthesis).  
**Date:** 2026-05-03  
**Purpose:** Identify K-readiness skills and pedagogical patterns to inform new Literacy Quest skill atoms and widget designs.

---

## 1. Get Ready for the Code (Primers A, B, C)

### Scope

The three Get Ready for the Code (GRC) primers are published by Educators Publishing Service (EPS) as the PreK–K entry point into the Explode the Code (ETC) series. They cover no reading whatsoever — their sole purpose is to establish letter-sound scaffolding through fine-motor work, visual discrimination, and phonemic pre-literacy tasks, before ETC Book 1 begins formal CVC decoding.

| Primer | Consonant Subset | Target Grade |
|---|---|---|
| A — Get Ready | b, f, k, m, r, t (6 letters) | PreK–K |
| B — Get Set | d, h, j, n, p, s (6 letters) | PreK–K |
| C — Go | c, g, l, q, v, w, x, y, z (9 letters) | PreK–1 |

Each primer is approximately 48 student pages organized into per-letter units of 6–8 pages.

### Page Templates (per letter unit)

Every letter unit in GRC follows the same five-page arc:

1. **Tracing the letter form** — the target letter is displayed in a large guide font with directional arrows; the student traces it repeatedly across the line. Both uppercase and lowercase forms are practiced. This is pure fine-motor and letter-shape encoding.

2. **Identifying the beginning sound** — a picture page with 6–9 illustrated objects. Students circle or color only the pictures whose names begin with the target sound. Teacher reads each picture name aloud. This is auditory phoneme isolation at the initial position.

3. **Matching the letter to a picture** — students draw lines connecting isolated letters to pictures that start with that letter's sound, or cut and paste pictures into correct letter columns. Tests both letter recognition and sound-symbol pairing.

4. **Finding the letter in a word environment** — students circle the target letter within short printed words or strings of letters. Tests visual discrimination of the letter form in context.

5. **Review page** — a mixed page recycling 2–3 previously-taught letters, requiring the student to write the correct letter beneath each picture. Functions as a cumulative spiral review.

### Mapping to Existing Literacy Quest Widgets

| GRC Template Type | Closest Existing Widget | Notes |
|---|---|---|
| Tracing the letter form | None — deferred to Stage 4 ink-draw widget | Letter formation tracing is the primary gap. The ink-draw widget exists in design but is unimplemented. |
| Identifying beginning sound | `mc-image` + `tap-hotspot` | `reading_pa_phoneme_isolation_initial` already covers the auditory side; GRC adds a **visual letter-to-sound** layer not yet represented. |
| Matching letter to picture | `tap-hotspot`, `sort-into-bins` | Covered well by existing PA atoms if the letter is shown alongside the audio. |
| Finding letter in word | None — visual letter discrimination widget needed | No existing question type scans a letter string to find a target grapheme. Would require a new `letter-scan` type. |
| Review / write correct letter | `letter-tile-spell` (one tile, constrained) | Partial match; full free-write not yet supported. |

---

## 2. Basic Phonics Skills Level A (PK-K)

**Publisher:** Evan-Moor Educational Publishers (EMC 3318), 2003/2004 edition.  
**Full text was extractable** — this section draws directly from the book.

### Scope

Basic Phonics Skills Level A is a 290-page teacher-reproducible workbook organized into four progressive strands, all explicitly targeting PreK–K readiness:

1. **Emergent Skills** (pp. 7–46) — pre-literacy readiness that predates phonemic awareness
2. **Phonemic Awareness** (pp. 47–112) — auditory-only phonological work
3. **Alphabetic Awareness** (pp. 113–172) — letter identification and formation (all 26 letters, uppercase and lowercase)
4. **Sound-Symbol Association A–Z** (pp. 173–252) — initial phoneme to letter mapping for every letter of the alphabet

A fifth section adds 26 **Little Alphabet Readers** — reproducible mini-books, one per letter.

### Emergent Skills Strand — Page Templates

The Emergent Skills strand is the most distinctive contribution of this book relative to our current skill catalog. It covers skills that exist before any phonemic awareness work begins:

| Skill Covered | Activity Type | Literacy Quest Equivalent |
|---|---|---|
| Recognizing environmental print (signs, labels) | Identify words in photos of real signs; match sign pairs | **Not cataloged** — no PA or phonics atom covers print awareness |
| Distinguishing left and right | Trace left hand yellow / right hand red; circle left/right object | **Not cataloged** — directional orientation atom absent |
| Tracing left-to-right directionality | Trace a line from animal to food, left to right across the page | **Not cataloged** — concept of print (reading direction) atom absent |
| Distinguishing top and bottom | Color top object red, bottom object blue | **Not cataloged** — spatial orientation atom absent |
| Identifying same vs. different objects | Circle which of four objects matches the model | Partially covered by visual discrimination in letter recognition, but no standalone atom |
| Adding the missing part | Complete a partially-drawn picture | **Not cataloged** |
| Identifying beginning, middle, and end of a sequence | Three-frame picture sequence: mark first / middle / last frame | Partially related to narrative sequencing, but this is a spatial concept not a comprehension atom |
| Recognizing reversed objects | Pick the correctly-oriented object from a set | **Not cataloged** — no letter reversal discrimination atom |
| Identifying objects that do not belong | Four pictures: circle the one that does not fit the category | Category sorting; no standalone atom for pre-literacy category exclusion |
| Distinguishing words from pictures | Given a mixed page of text and images, circle only the words | **Not cataloged** — concept of print (word vs. picture) atom absent |

### Phonemic Awareness Strand — Page Templates

This strand runs from syllable counting through phoneme counting and reinforces skills our catalog already covers. The templates are:

- **Syllable counting (1–3 syllables):** say-and-clap with pictures; circle the correct number; sort into columns; "3-in-a-row" game board. Maps to `reading_pa_syllable_count` and `reading_pa_syllable_clap_count`.
- **Rhyme identification (13 rime families covered: /at/, /ake/, /ip/, /ite-ight/, /oat-ote/, /op/, /ed/, /eep-eap/, /ug/, /um/, /ack/, /ick/, /ock/):** color-if-rhymes; circle rhymers in a row; rhyme pair yes/no decision; cut-and-sort into rime family bins. Maps to `reading_pa_rhyme_identify` and `reading_pa_rhyme_produce`.
- **Beginning sound identification:** circle pictures that start with the same sound as the target picture. Maps to `reading_pa_phoneme_isolation_initial`.
- **Ending sound identification:** parallel structure. Maps to `reading_pa_phoneme_isolation_final`.
- **Phoneme counting (2–4 phonemes):** fill in circles to show how many sounds are heard; circle the number. Maps to `reading_pa_phoneme_count_cvc`.

The phoneme counting pages explicitly count phonemes in words like *can* (3), *pie* (2), *nest* (4), *boat* (3), *bus* (3) — this matches the Elkonin-box discipline of our existing atoms.

### Alphabetic Awareness Strand — Page Templates

Each letter (A–Z) receives two pages, one in traditional manuscript and one in modern manuscript:

- Trace uppercase and lowercase forms (large guide + repetition lines)
- Circle uppercase among distractors; circle lowercase among distractors
- Match uppercase to lowercase (draw lines)
- Fill in missing letters of the alphabet (A_C_E progression)
- Copy a short word (cat, dog, hat, fan) as handwriting practice

The "Circle the one that matches" template — where the target letter is shown first, then 4–5 distractors include similar-looking letters (B/R/E/A for the letter B) — is a clean visual discrimination exercise that directly targets reversal confusion. The letter pairs most exploited as distractors: b/d/p/q, n/m, h/k, v/w, a/o, c/e/G.

### Sound-Symbol Association A–Z Strand — Page Templates

Three pages per letter:
1. "Listen for the Sound" — Color only the pictures that begin with the target sound (6 pictures, ~3–4 correct). Teacher reads picture names aloud. Audio-first phoneme isolation, then letter connection.
2. "Cut and Sort" — Cut 6 pictures; sort them under the target letter vs. an "X" (non-matching) column. Introduces the sorting/categorization mechanic.
3. "What Do You See?" — A busy scene illustration containing multiple hidden objects that begin with the target letter. Students find and count them. Novelty engagement; also tests sustained attention on the letter's initial sound.

### Comparison to Get Ready for the Code

BPS Level A and GRC share the same goal but approach it differently. GRC is EPS-branded and tightly scoped to ETC's letter-set sequencing (subset of consonants per primer). BPS Level A covers all 26 letters in a single volume and adds the Emergent Skills strand (pre-phonemic readiness) that GRC does not explicitly isolate. For Literacy Quest, BPS Level A is the more comprehensive reference for K-readiness skill coverage — GRC is the better reference for ETC-aligned letter sequencing and fine-motor tracing pedagogy.

---

## 3. Beginning to Read Grade K (Part 1)

**Publisher:** Not extractable (image-only scan). Format reconstructed from title and grade level.

The book targets the earliest part of Grade K — essentially late PreK through the start of formal reading instruction. Based on the grade level and publisher conventions for Grade K readers, the expected content structure is:

- **Letter naming and identification** — isolated uppercase and lowercase letter matching, alphabet sequence work
- **Simple word recognition** — high-frequency word flash exposure (the, a, I, is, to, and) alongside picture cues
- **Simple sentence reading** — one-line sentences with picture clues, building concept-of-print awareness (left-to-right, word-by-word reading, return sweep)
- **Directionality reinforcement** — tracking print from left to right on the line, top to bottom on the page

This places "Beginning to Read" squarely in the phonemic awareness / print awareness transition zone — before phonics decoding begins, but after letter naming is established. The skills addressed sit between our existing PA atoms and the earliest phonics atoms.

---

## 4. Beyond the Code Series

No Beyond the Code files were found in the Reading Books folder. However, complete coverage of the BTC series is already documented in `etc-digital-replica-synthesis.md` (Section 2.3 and the BTC table). Key points for cross-reference:

- BTC is a **comprehension track**, not a phonics extension. It runs parallel to ETC Books 1–4 but actually requires decoding skill closer to ETC Book 3 (long vowel level).
- Each BTC book is structured around 5–7 decodable short stories followed by vocabulary work, sequencing questions, and inferential "Think About It!" written-response prompts.
- BTC 1–4 sight words escalate from *why/door/they* (BTC 1) to *doesn't/bluefish/together/skateboard/school* (BTC 3).
- No new widget types are indicated by BTC beyond what comprehension strand atoms already require (sequencing, inference, vocabulary in context).

---

## 5. Synthesis: How K-Foundation Books Complement the ETC Main Series

ETC Book 1 opens with a **consonant pretest** that assumes students already know the letter names and their primary sounds for all consonants — it is a prerequisite check, not instruction. This is the gap the prequels fill.

The pedagogical progression across the full series is:

```
Emergent Skills          (BPS Level A, pp. 7-46)
  ↓ pre-literacy: print direction, spatial orientation, visual discrimination
Phonemic Awareness       (GRC A/B/C + BPS Level A, pp. 47-112)
  ↓ auditory only: rhyme, syllable, initial/final sound isolation
Alphabetic Awareness     (GRC A/B/C + BPS Level A, pp. 113-172)
  ↓ letter form tracing, uppercase/lowercase matching, sequence
Sound-Symbol Association (GRC A/B/C + BPS Level A, pp. 173-252)
  ↓ initial phoneme → letter pairing, per-letter sort-and-find
ETC Book 1               (main series, CVC decoding begins)
  ↓ full consonant prerequisite assumed
```

The structural implication for Literacy Quest is that our current skill atom catalog begins at "Phonemic Awareness" and treats the skills above it as pre-existing. In practice, the student population we serve (K, ELL, SPED) will include learners who need instruction at the Emergent Skills and Alphabetic Awareness levels. Those skills are currently uncatalogued.

---

## 6. K-Readiness Skills Inventory

The following K-readiness skills appear across the prequels and supplements but are **not currently represented** as atoms in `phonemic-awareness.js` or `phonics.js`. Our existing catalog has 35 PA atoms and 151 phonics atoms.

### Pre-Literacy: Concept of Print (entirely absent from current catalog)

| Skill | Source | Suggested Home File |
|---|---|---|
| Distinguish words from pictures on a page | BPS Level A, p. 46 | `phonemic-awareness.js` — new domain: `print_awareness` |
| Track print left-to-right on a line | BPS Level A, pp. 11–12; BTR Grade K | `phonemic-awareness.js` — domain: `print_awareness` |
| Identify top vs. bottom of a page | BPS Level A, p. 13 | `phonemic-awareness.js` — domain: `print_awareness` |
| Recognize left vs. right directionality | BPS Level A, p. 10 | `phonemic-awareness.js` — domain: `print_awareness` |
| Recognize environmental print (signs, labels) | BPS Level A, pp. 8–9 | `phonemic-awareness.js` — domain: `print_awareness` |
| Understand word boundaries (spaces between words) | BTR Grade K | `phonemic-awareness.js` — domain: `print_awareness` |

### Pre-Literacy: Visual Discrimination (partially absent)

| Skill | Source | Suggested Home File |
|---|---|---|
| Match identical letter shapes (uppercase) | BPS Level A, pp. 116–166 (per-letter matching) | `phonics.js` — domain: `letter_recognition`, new sub-domain: `letter_matching` |
| Match uppercase to lowercase (same letter) | BPS Level A, pp. 120–166 (draw-lines-to-match) | `phonics.js` — domain: `letter_recognition`, new sub-domain: `case_matching` |
| Identify a letter among visually similar distractors (b/d/p/q etc.) | BPS Level A, per-letter pages | `phonics.js` — domain: `letter_recognition`, new sub-domain: `visual_discrimination` |
| Find target letter hidden in a busy scene | BPS Level A, "What Do You See?" pp. 176–251 | `phonics.js` — new atom |
| Identify reversed or mirror-image letters as different | BPS Level A, p. 35 | `phonics.js` — domain: `letter_recognition` |

### Pre-Literacy: Letter Formation (deferred — already noted)

| Skill | Source | Suggested Home File |
|---|---|---|
| Trace uppercase letter forms (A–Z) | GRC A/B/C; BPS Level A, pp. 116–166 | `phonics.js` — domain: `letter_formation`; gated to Stage 4 ink-draw widget |
| Trace lowercase letter forms (a–z) | GRC A/B/C; BPS Level A, pp. 116–166 | Same |

### Phonemic Awareness (mostly covered — small gaps)

| Skill | Current Atom? | Gap Note |
|---|---|---|
| Rhyme identification | `reading_pa_rhyme_identify` — YES | Covered |
| Rhyme production | `reading_pa_rhyme_produce` — YES | Covered |
| Syllable counting (1–2) | `reading_pa_syllable_count` — YES | Covered |
| Syllable counting (1–3) | `reading_pa_syllable_clap_count` — YES | Covered |
| Initial phoneme isolation | `reading_pa_phoneme_isolation_initial` — YES | Covered |
| Final phoneme isolation | `reading_pa_phoneme_isolation_final` — YES | Covered |
| Phoneme counting (2–4 phonemes) | `reading_pa_phoneme_count_cvc` — YES | Covered |
| Beginning-sound picture sort (per letter) | `reading_pa_initial_sound_match` — YES | Covered; GRC reinforces this is the core pre-ETC PA drill |

### Letter-Sound Correspondence: Pre-ETC Gap

Our earliest phonics atom (`reading_phonics_letter_sound_consonant_basic`) covers b, m, t, s, p, n — exactly the "basic consonants" from GRC Book A + B. However, it assumes auditory phoneme isolation is already mastered. The missing link is:

| Skill | Current Atom? | Gap Note |
|---|---|---|
| Given a letter, say its primary sound (letter → sound direction) | No dedicated atom; our atoms go picture→letter or sound→letter | New atom: `reading_phonics_letter_to_sound_consonant` needed for the full GRC arc |
| Given a picture, write/choose the first letter (sound → letter encoding) | `reading_pa_initial_sound_match` partially; no write variant | `reading_phonics_initial_letter_write` |

---

## 7. Implications for Literacy Quest

- **Concept of Print is entirely unrepresented.** Six atoms covering left-right directionality, top-bottom orientation, word-vs.-picture discrimination, word boundary awareness, left-to-right tracking, and environmental print recognition should be added to `phonemic-awareness.js` under a new domain `print_awareness`. These are RF.K.1 standards (print concepts) and serve as true developmental prerequisites to all PA work. They are the first atoms a Pre-K student would encounter.

- **Letter recognition and visual discrimination need a new sub-domain in `phonics.js`.** Three atoms are needed: (a) match uppercase to lowercase for the same letter (`case_matching`), (b) identify a target letter among visually similar distractors — specifically addressing the notorious b/d/p/q and n/m reversal families (`visual_discrimination`), and (c) find-and-count a target letter in a scene-illustration style (`letter_scan`). These map to BPS Level A's Alphabetic Awareness strand and are prerequisites to `reading_phonics_letter_sound_consonant_basic`.

- **Letter formation tracing remains deferred to Stage 4 (ink-draw widget), but should be formally cataloged as atoms.** Adding skeleton atom entries to `phonics.js` now — with `question_types: ["letter-trace"]` and a note that this type is unimplemented — will allow the skill sequence graph to show the correct prerequisite chain when the widget ships.

- **The "Get Ready" prequel atoms (~10–15) belong primarily in `phonics.js`, not `phonemic-awareness.js`.** Concept-of-print atoms belong in PA (they are auditory/cognitive, not code-based). Visual letter discrimination, letter-to-sound direction, and letter formation atoms belong in phonics (they require print knowledge). Adding ~6 print-awareness atoms to PA and ~9 letter-knowledge atoms to phonics would accurately represent GRC's full scope.

- **BPS Level A's "What Do You See?" scene template** (finding all objects in a busy illustration that begin with the target letter) is a strong engagement format not represented by any current widget. It could be implemented as a specialized `tap-hotspot` question variant where multiple correct taps exist on a rich illustration and the student must find all targets. This format is high-value for PreK-K engagement and worth adding to `QUESTION_TYPES.md` as a future type.

- **The "daily practice" session structure** — 5 quick items per day on one skill, as used by BPS Level A's per-page format — aligns well with a "Drill Mode" session option in `literacy-game-control`. Each BPS page = exactly one skill × approximately 6 stimulus items. Concretely: a `sessionLength: "micro"` (6 items) option in the session config, alongside the existing standard session, would let teachers assign one BPS-style skill page per day. This is worth a feature flag in the literacy game-control session settings.

- **The cut-and-sort mechanic** from BPS Level A (cut pictures, glue under the correct letter) is the physical antecedent of our `sort-into-bins` question type. The digitized version is fully covered by that type — but note that BPS uses two bins (target letter vs. "X/other"), which maps cleanly to the binary sort variant of `sort-into-bins`. Existing atoms already specify this type; no new widget needed.

- **Beyond the Code is a comprehension track, not a phonics extension, and requires no new atoms at the K-readiness level.** BTC 1 actually requires ETC Book 3 decoding skill (long vowels), so it sits well above K-readiness. The comprehension-strand atoms in `comprehension-literature.js` and `comprehension-informational.js` are the correct home for BTC-derived skills. The only Literacy Quest implication is that BTC-style "Think About It!" inferential prompts — open-ended written responses — represent a future written-response widget that does not yet exist. This is already deferred to a later phase and does not affect the K-readiness atom catalog.
