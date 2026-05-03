# QUESTION_SKILL_MATRIX.md — Literacy Quest Canonical Skill-to-Mechanic Mapping

**Version:** Phase 1  
**Last updated:** 2026-05-03  
**Status:** Authoritative — content authors, widget developers, and the deck-composition engine all reference this document.

---

## Table of Contents

1. [The Variety Rule](#1-the-variety-rule)
2. [Deck-Composition Algorithm](#2-deck-composition-algorithm)
3. [Cross-Reference Matrix: Pedagogical Category x Technical Mechanic](#3-cross-reference-matrix)
4. [Per-Skill question_types Tables](#4-per-skill-question_types-tables)
   - [Part 1 — Phonemic Awareness](#41-phonemic-awareness)
   - [Part 2 — Phonics](#42-phonics)
   - [Part 3 — Fluency](#43-fluency)
   - [Part 4 — Vocabulary](#44-vocabulary)
   - [Part 5A-B — Comprehension Literature](#45-comprehension--literature)
   - [Part 5C-D — Comprehension Informational](#46-comprehension--informational)
   - [Part 6 — Grammar](#47-grammar)
   - [Part 7 — Sentence Structure](#48-sentence-structure)
   - [Part 8 — Mechanics](#49-mechanics)
   - [Part 9 — Writing](#410-writing)
5. [Worked Examples: Three Explicit Deck Plans](#5-worked-examples)
6. [Mechanic Priorities by Build Stage](#6-mechanic-priorities-by-build-stage)
7. [Deck-Loader Configuration Knobs](#7-deck-loader-configuration-knobs)
8. [Conflict Resolution: Variety Rule vs Single-Skill Decks](#8-conflict-resolution-variety-rule-vs-single-skill-decks)

---

## 1. The Variety Rule

> **Rule 1.6a (Authoritative)**
>
> Within a single skill, vary mechanics whenever pedagogically appropriate.
>
> **Rationale:**
> - **Multi-modal encoding** (Ehri/Moats, LETRS Module 4): Students consolidate learning faster when they see-it, hear-it, build-it, sort-it, and type-it. Each mechanic encodes the same skill target via a different cognitive pathway, building more robust orthographic mapping and meaning networks.
> - **Misconception coverage**: Different mechanics surface different misconceptions. A student who scores 100% on `mc-text` (recognition) may fail `fib-auto` (recall) or `letter-tile-spell` (production). Only variety exposes these gaps.
> - **Engagement and attention**: ELL and SPED learners fatigue faster on monotonous decks. Mechanic rotation sustains on-task behavior and reduces the habituation effect that flattens response quality in late-deck cards.
> - **Rule of thumb**: Every skill in the catalog MUST have **at least 3 mechanics** in its `question_types` array. A typical 10-card practice deck pulls **at least 3 distinct mechanics** across its cards. The only exception is a deliberate fluency-drill deck, where mechanic monotony is intentional (timed repetition builds automaticity).

---

## 2. Deck-Composition Algorithm

The deck loader calls `buildPracticeDeck(skill, count, options)` before rendering any cards.

```js
/**
 * Build an ordered array of question_type strings for a practice deck.
 *
 * @param {SkillAtom} skill      - The skill atom; must have question_types[] with ≥ 3 entries.
 * @param {number}   count      - Total cards to generate (default 10).
 * @param {object}   options    - Deck configuration knobs from DeckConfig / user settings.
 * @param {boolean}  options.fluency_drill     - If true, repeat one mechanic throughout.
 * @param {string[]} options.mechanics_filter  - If non-empty, restrict to these mechanic IDs only.
 * @param {boolean}  options.adaptive_ramp     - If true, order mechanics easy-to-hard.
 * @returns {string[]} Ordered mechanic IDs, one per card slot.
 */
function buildPracticeDeck(skill, count = 10, options = {}) {
  const { fluency_drill = false, mechanics_filter = [], adaptive_ramp = false } = options;

  // --- FLUENCY DRILL MODE ---
  // Repeat one mechanic by design (timed repetition builds automaticity).
  if (fluency_drill || skill.strand === "fluency") {
    const drillMechanic = skill.question_types[0];
    return Array(count).fill(drillMechanic);
  }

  // --- APPLY MECHANICS FILTER (Custom Play Setting — Stage 2) ---
  // User may restrict to specific mechanics (e.g., dyslexic student prefers letter-tile-spell over fib-auto).
  let available = skill.question_types.filter(
    m => mechanics_filter.length === 0 || mechanics_filter.includes(m)
  );

  // Fallback: if filter leaves fewer than 2 mechanics, drop the filter.
  if (available.length < 2) {
    console.warn(`Mechanics filter too restrictive for ${skill.skill_id}. Falling back to full list.`);
    available = skill.question_types;
  }

  if (available.length < 3) {
    console.warn(`Skill ${skill.skill_id} has fewer than 3 question_types. Variety rule cannot be fully met.`);
  }

  // --- ADAPTIVE RAMP (easy → hard mechanic ordering) ---
  // For multi-passage skills (item sets), each passage is one "card slot" containing 3-5 sub-items.
  // Sub-items within an item set can also vary mechanic; the passage is the anchoring unit.
  if (adaptive_ramp) {
    // MECHANIC_DIFFICULTY_RANK: lower = easier (recognition), higher = harder (production/analysis).
    // Defined globally in deck-loader.js; content authors classify each mechanic.
    available = [...available].sort(
      (a, b) => (MECHANIC_DIFFICULTY_RANK[a] ?? 5) - (MECHANIC_DIFFICULTY_RANK[b] ?? 5)
    );
  }

  // --- ROUND-ROBIN WITH NO-REPEAT WINDOW ---
  // Core rule: no mechanic repeats within any 3-card window.
  const result = [];
  const recentWindow = []; // last 3 mechanics used

  for (let i = 0; i < count; i++) {
    // Pick next mechanic not in the recency window.
    const eligible = available.filter(m => !recentWindow.includes(m));
    const pick = eligible.length > 0
      ? eligible[i % eligible.length]       // round-robin through eligible
      : available[i % available.length];    // fallback if all mechanics in window

    result.push(pick);
    recentWindow.push(pick);
    if (recentWindow.length > 3) recentWindow.shift();
  }

  return result;
}
```

**Multi-passage item sets:** When a skill uses `passage-mc-set`, `passage-multi-select`, or `passage-hot-text`, each passage is treated as one "card slot." The sub-items within that slot (3-5 questions per passage) can vary mechanic internally. The deck loader generates a `PassageSession` for each such slot rather than a flat question. The outer round-robin still applies at the slot level.

**Mechanics filter interaction:** The `options.mechanics_filter` array is populated from the user's "Mechanics filter" Custom Play Setting (Stage 2). When a teacher creates a deck for a dyslexic student, they might exclude `fib-auto` (typing-dependent) and `letter-tile-spell` (drag-dependent) and include only `mc-text`, `mc-image`, and `two-button-binary`. The filter respects this without crashing the deck.

---

## 3. Cross-Reference Matrix

Rows = 11 ELA strands. Columns = the 23 question-type IDs from QUESTION_TYPES.md plus the two DATA_MODEL `audio_drag_spell` and `tap_classify` Stage 2 types.

**Legend:** P = Primary (default mechanic for this strand), S = Secondary (commonly used), R = Rarely used, blank = not applicable.

| Strand | mc-text | mc-image | mc-multi | tap-hs | dnd-linked | fib-auto | 2btn-bin | sound-box | build-tiles | ltr-tile | word-tagger | hw-word | hw-sent | hw-para | dd-inline | sent-build | sort-bins | match-pairs | seq-evts | dd-cloze | open-fib | passage-mc | claim-ev |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Phonemic Awareness** | S | P | | P | S | R | S | P | | | | | | | | | S | | S | | | | |
| **Phonics** | S | P | | P | P | S | S | P | S | P | | P | | | | | P | | | | | | |
| **Sight Words** | S | P | | P | P | P | S | | P | P | | P | | | | | | | | | | | |
| **Vocabulary** | P | S | S | S | S | S | | | | | | P | | | S | | P | P | | S | S | S | |
| **Fluency** | | | | | S | | | | | | | | | | | P | | | S | | | | |
| **Comp — Lit** | P | S | P | S | S | R | | | | | | P | P | S | | | S | S | P | | S | P | P |
| **Comp — Info** | P | | P | S | S | R | | | | | | P | P | P | | | S | | P | | S | P | P |
| **Grammar** | P | | P | P | S | S | R | | | | P | P | S | | P | P | P | S | | P | R | | |
| **Sentence Structure** | P | | S | S | P | P | S | | | | | | P | | P | P | | | S | P | S | | |
| **Mechanics** | P | | S | P | | P | P | | | | | P | | | P | | S | | | P | R | | |
| **Spelling** | S | | | S | P | P | R | P | P | P | | P | | | | | P | | | | | | |
| **Writing** | S | | S | | P | P | | | | | | | P | | P | P | S | | P | P | P | | S |

*Column key: tap-hs = tap-hotspot, hw = hot-text, dd = drop-down, 2btn-bin = two-button-binary, ltr-tile = letter-tile-spell, seq-evts = sequence-events, sent-build = sentence-build, sort-bins = sort-into-bins, dd-cloze = dropdown-cloze, open-fib = open-response-fib, passage-mc = passage-mc-set, claim-ev = claim-evidence*

---

## 4. Per-Skill question_types Tables

Tables use these columns:

| Column | Meaning |
|---|---|
| Skill ID | snake_case identifier for the `SkillAtom` |
| Skill Statement | One-sentence teachable goal |
| Band | Developmental band (K-1 / 2-3 / 4-5+) |
| RIT | MAP-aligned RIT band, or "n/a" |
| question_types | ≥ 3 mechanic IDs (variety rule) |
| Example prompts | One per mechanic; illustrates how the mechanic manifests |

---

### 4.1 Phonemic Awareness

> Part 1 of the K-5 ELA scope. Auditory-only — no print. Primary MAP family: Reading K-2. Primary SPED tool: Elkonin sound boxes + Heggerty routines. K-2 variant mandatory on all items.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `pa_word_awareness_count` | Count the number of words in a spoken sentence. | K-1 | 131-140 | `mc-text`, `two-button-binary`, `sort-into-bins` | (mc-text) "I hear the cat. How many words?" A) 2 B) 3 C) 4 / (2btn-bin) "Does 'fly away' have 2 words or 3 words?" / (sort-bins) Sort sentences by word count: 2 words / 3 words |
| `pa_syllable_blend` | Blend spoken syllable chunks into a whole word. | K-1 | 135-145 | `mc-text`, `mc-image`, `two-button-binary`, `dnd-linked` | (mc-text) "What word? /kit/ + /ten/ =" A) kitten / (mc-image) Tap the picture for /rain/ + /bow/ / (2btn-bin) Is this a real word? /pen/ + /cil/ / (dnd-linked) Drag syllable tiles together |
| `pa_rhyme_identify` | Identify whether two spoken words rhyme. | K-1 | 136-148 | `mc-image`, `two-button-binary`, `sort-into-bins`, `tap-hotspot` | (mc-image) Tap the picture that rhymes with "cat" / (2btn-bin) Do "hat" and "bat" rhyme? Yes / No / (sort-bins) Sort pictures: Rhymes with "cat" / Does NOT rhyme / (tap-hs) Tap all rhyming words in the row |
| `pa_phoneme_isolation_initial` | Isolate the first sound in a spoken word. | K-1 | 140-152 | `mc-text`, `mc-image`, `tap-hotspot`, `sound-box` | (mc-text) "What is the first sound in 'sit'?" A) /s/ B) /i/ C) /t/ / (mc-image) Tap the picture whose name starts with /m/ / (tap-hs) Tap the letter that shows the first sound / (sound-box) Drag one chip into the first box for "map" |
| `pa_phoneme_isolation_medial` | Isolate the middle (vowel) sound in a CVC word. | K-1 | 145-158 | `mc-text`, `mc-image`, `two-button-binary`, `sound-box` | (mc-text) "What is the middle sound in 'hot'?" A) /h/ B) /o/ C) /t/ / (mc-image) Tap the picture with /ĭ/ in the middle / (2btn-bin) Is the middle sound /ă/ or /ĕ/? / (sound-box) Place chip in middle box for "sit" |
| `pa_phoneme_blend` | Blend 3-4 separately spoken phonemes into a word. | K-1 | 148-160 | `mc-text`, `mc-image`, `dnd-linked`, `two-button-binary` | (mc-text) "/d/ /o/ /g/ — what word?" A) dog B) log / (mc-image) Tap the picture for /sh/ /i/ /p/ / (dnd-linked) Drag phoneme chips into order to blend / (2btn-bin) Is /m/ /ă/ /p/ the word "map"? Yes / No |
| `pa_phoneme_segment_cvc` | Segment a CVC word into its 3 individual phonemes using sound boxes. | K-1 | 150-163 | `sound-box`, `mc-text`, `tap-hotspot`, `dnd-linked` | (sound-box) Drag a chip for each sound in "cap" / (mc-text) "How many sounds in 'fun'?" A) 2 B) 3 C) 4 / (tap-hs) Tap the sound box that holds /ŭ/ / (dnd-linked) Drag phoneme tokens into 3 boxes |
| `pa_phoneme_manipulate_substitute` | Substitute one phoneme in a word to make a new word. | 2-3 | 160-175 | `mc-text`, `fib-auto`, `sort-into-bins`, `mc-image` | (mc-text) "Change /h/ in 'hat' to /b/. What is the new word?" / (fib-auto) "Change the first sound in 'sit' to /f/: ___" / (sort-bins) Sort new words by the changed phoneme position / (mc-image) Tap the picture that shows the new word |

**K-2 vs 2-3 note:** All `pa_` skills in K-1 band use audio auto-speak, 3 choices max, and large pill buttons. The `pa_phoneme_manipulate_*` skills (2-3 band, RIT 160+) may use outlined buttons; audio remains on by default per Qatar ELL context.

---

### 4.2 Phonics

> Part 2. The largest strand (~300+ atoms). Primary build priority (PHASE_0_DECISIONS §1). Spans CVC through multisyllabic decoding. All K-1 band skills use audio-first design with `mc-image` and `letter-tile-spell` as default primary mechanics.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `phonics_short_a_cvc` | Decode and spell CVC words with short /ă/ (at, am, an, ap, ax, ad). | K-1 | 141-152 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `sound-box`, `tap-hotspot`, `fib-auto` | (mc-image) Tap the picture that has the short /ă/ sound / (ltr-tile) Hear the word "map," drag letters to spell it / (sort-bins) Sort: has short /ă/ / does NOT / (sound-box) Segment "cat" into 3 boxes / (tap-hs) Tap every short-a word in the row / (fib-auto) "The ___ sat on the mat." |
| `phonics_short_e_cvc` | Decode and spell CVC words with short /ĕ/ (ed, en, et, eg). | K-1 | 143-154 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `two-button-binary`, `fib-auto` | (mc-image) Tap the picture for /ĕ/ + /g/ + /g/ / (ltr-tile) Spell "bed" by dragging tiles / (sort-bins) Sort: short-e / short-a / (2btn-bin) Is this a real short-e word: "peb"? / (fib-auto) "She ___ the red hen." |
| `phonics_short_i_cvc` | Decode and spell CVC words with short /ĭ/ (it, in, ig, ip, ix). | K-1 | 143-154 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `sound-box`, `two-button-binary` | (mc-image) Tap the picture that ends with short /ĭ/ + /n/ / (ltr-tile) Drag tiles to spell "sit" / (sort-bins) Sort words: short-i / not short-i / (sound-box) Place chips for each sound in "pig" / (2btn-bin) Real word or nonsense? "wib" |
| `phonics_short_o_cvc` | Decode and spell CVC words with short /ŏ/ (ot, op, og, ob, ox). | K-1 | 143-154 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `fib-auto`, `tap-hotspot` | (mc-image) Tap the dog / fox / hop picture / (ltr-tile) Spell "log" from audio cue / (sort-bins) Sort: short-o / other vowel / (fib-auto) "The ___ is in the box." / (tap-hs) Tap the word with short /ŏ/ in the sentence |
| `phonics_short_u_cvc` | Decode and spell CVC words with short /ŭ/ (ut, un, ug, up, us). | K-1 | 143-154 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `sound-box`, `fib-auto` | (mc-image) Tap the cup / bug / sun / (ltr-tile) Hear "mud," drag m-u-d / (sort-bins) Sort: short-u / not short-u / (sound-box) Segment "fun" into 3 boxes / (fib-auto) "The ___ ran under the rug." |
| `phonics_consonant_digraph_sh` | Decode and spell words with the digraph sh (ship, fish, shop). | K-1 | 150-162 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `fib-auto`, `two-button-binary` | (mc-image) Tap the picture that starts with /sh/ / (ltr-tile) Hear "shell," drag s-h-e-l-l / (sort-bins) Sort: sh-initial / sh-final / other / (fib-auto) "I saw a ___ in the ocean." / (2btn-bin) Does "chip" start with sh? Yes / No |
| `phonics_consonant_digraph_ch_th_wh` | Decode words with digraphs ch, th (voiced/voiceless), wh. | K-1 | 152-165 | `mc-image`, `sort-into-bins`, `letter-tile-spell`, `tap-hotspot`, `fib-auto` | (mc-image) Tap the picture for "chair" / "whale" / "thumb" / (sort-bins) Sort by digraph: ch / th / wh / (ltr-tile) Hear "cheese," drag letters / (tap-hs) Tap every digraph word in the row / (fib-auto) "The ___ is very thick." |
| `phonics_consonant_blend_initial_l` | Decode words with initial l-blends (bl, cl, fl, gl, pl, sl). | 1-2 | 155-168 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `fib-auto`, `two-button-binary` | (mc-image) Tap the clam / flag / globe / (ltr-tile) Hear "plant," drag p-l-a-n-t / (sort-bins) Sort by blend: bl / cl / fl / pl / (fib-auto) "The ___ flew away." / (2btn-bin) Does "clap" start with cl? Yes / No |
| `phonics_consonant_blend_initial_r` | Decode words with initial r-blends (br, cr, dr, fr, gr, pr, tr). | 1-2 | 155-168 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `fib-auto`, `tap-hotspot` | (mc-image) Tap crab / drum / frog / (ltr-tile) Hear "trip," drag t-r-i-p / (sort-bins) Sort: br / cr / dr / other / (fib-auto) "The ___ hopped over the log." / (tap-hs) Tap every r-blend word in the list |
| `phonics_long_a_vce` | Decode words with long /ā/ in the VCe pattern (cake, late, name). | 1-2 | 158-172 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `fib-auto`, `two-button-binary`, `mc-text` | (mc-image) Tap the cake / (ltr-tile) Drag tiles to spell "cape" after hearing it / (sort-bins) Sort: long-a VCe / short-a CVC / (fib-auto) "She ___ a mistake." (made) / (2btn-bin) Long-a or short-a: "game" / (mc-text) Choose the word with long /ā/ |
| `phonics_vowel_team_ai_ay` | Decode words with vowel teams ai and ay (rain, sail, day, play). | 2-3 | 163-178 | `mc-image`, `sort-into-bins`, `letter-tile-spell`, `fib-auto`, `tap-hotspot`, `mc-text` | (mc-image) Tap rain / snail / tray / (sort-bins) Sort by spelling pattern: ai / ay / (ltr-tile) Hear "train," spell it / (fib-auto) "It will ___ all day." / (tap-hs) Tap every ai/ay word in the passage / (mc-text) Which word uses the ay spelling? |
| `phonics_r_controlled_ar` | Decode words with r-controlled vowel /ar/ (car, star, park). | 2-3 | 165-180 | `mc-image`, `letter-tile-spell`, `sort-into-bins`, `fib-auto`, `two-button-binary`, `mc-text` | (mc-image) Tap the jar / star / barn / (ltr-tile) Hear "cart," drag c-a-r-t / (sort-bins) Sort by r-controlled vowel: ar / er / other / (fib-auto) "The ___ shone in the dark." / (2btn-bin) Does "harm" have /ar/? / (mc-text) Pick the word with /ar/ |
| `phonics_r_controlled_er_ir_ur` | Decode words where er, ir, ur represent the same /er/ sound (fern, bird, burn). | 2-3 | 168-183 | `sort-into-bins`, `mc-text`, `letter-tile-spell`, `fib-auto`, `tap-hotspot` | (sort-bins) Sort by spelling: er / ir / ur / (mc-text) Which word has the /er/ sound? / (ltr-tile) Hear "shirt," drag tiles / (fib-auto) "The ___ sat on a branch." (bird) / (tap-hs) Tap every /er/ word in the sentence |
| `phonics_syllable_types_closed` | Identify and decode closed syllables (VC, CVC — short vowel). | 2-3 | 168-182 | `mc-text`, `two-button-binary`, `sort-into-bins`, `tap-hotspot`, `fib-auto` | (mc-text) "Which syllable is closed?" A) me B) sit C) day / (2btn-bin) Closed or open? "pan" / (sort-bins) Sort syllables: Closed / Open / (tap-hs) Tap every closed syllable in the word list / (fib-auto) "A closed syllable has a ___ vowel sound." (short) |
| `phonics_syllable_types_open` | Identify and decode open syllables (CV — long vowel: me, go, ba/by). | 2-3 | 170-183 | `mc-text`, `two-button-binary`, `sort-into-bins`, `tap-hotspot`, `fib-auto` | (mc-text) Which syllable is open? A) cat B) be C) flip / (2btn-bin) Open or closed? "no" / (sort-bins) Sort: Open (long vowel) / Closed (short vowel) / (tap-hs) Tap the open syllable in "robot" / (fib-auto) An open syllable ends in a ___ vowel. (long) |
| `phonics_syllable_division_vccv` | Divide two-syllable words at the VC/CV pattern (rab/bit, pil/low). | 2-3 | 172-185 | `mc-text`, `dnd-linked`, `sort-into-bins`, `fib-auto`, `tap-hotspot` | (mc-text) Where does "basket" divide? A) bas/ket B) bask/et / (dnd-linked) Drag division marker between syllables / (sort-bins) Sort by division pattern: VC/CV / V/CV / (fib-auto) Divide "tunnel": ___/___ / (tap-hs) Tap the letter where the syllable break happens |
| `phonics_heart_words_tier1` | Read and spell the most frequent irregular heart words (the, said, was, of, to, do, come, some). | K-1 | 141-155 | `mc-text`, `two-button-binary`, `build-with-tiles`, `fib-auto`, `tap-hotspot` | (mc-text) Tap the word "said" from the group / (2btn-bin) Is the highlighted letter the "heart" (irregular part)? / (build-tiles) Tap letters in order to spell "said" / (fib-auto) "___ cat ran away." (The) / (tap-hs) Tap every heart word in the sentence |
| `phonics_multisyllabic_decode` | Apply known syllable patterns to decode 3-syllable academic words. | 4-5+ | 185-205 | `mc-text`, `fib-auto`, `dnd-linked`, `sort-into-bins`, `tap-hotspot` | (mc-text) Which is the correct pronunciation of "umbrella"? / (fib-auto) Divide "fantastic" into syllables: ___/___/___ / (dnd-linked) Drag division markers into "transparent" / (sort-bins) Sort multisyllabic words by syllable count: 3 / 4 / (tap-hs) Tap the stressed syllable |

**K-2 vs 2-5 note on phonics:** K-1 band skills always lead with `mc-image` (picture-supported) and `letter-tile-spell` (audio-cued production). 2-3 band skills shift toward `sort-into-bins`, `fib-auto`, and `mc-text`. 4-5+ band skills use `mc-text`, `dnd-linked`, and `fib-auto` exclusively.

---

### 4.3 Fluency

> Part 3. The fluency strand is the only strand where `is_fluency_drill = true` is computed automatically (skill.strand === "fluency"), overriding the variety rule. Repeated reading of the same mechanic builds the automaticity that fluency drills target.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `fluency_lnf` | Name the 26 letters (upper and lower case) rapidly by sight. | K-1 | 131-140 | `mc-text`, `two-button-binary`, `tap-hotspot` | (mc-text) "What letter is this? B" / (2btn-bin) Capital or lowercase? "d" / (tap-hs) Tap every lowercase letter in the row — **Note: LNF is timed; fluency drill override applies in timed mode.** |
| `fluency_psf` | Segment all phonemes in a spoken word within a time limit (Phoneme Segmentation Fluency). | K-1 | n/a | `sound-box`, `mc-text`, `fib-auto` | (sound-box) Drag chips for each sound in "chip" — timed / (mc-text) How many phonemes in "string"? / (fib-auto) Type all phonemes in "split" separated by / — drill mode repeats sound-box |
| `fluency_nwf` | Read consonant-vowel-consonant nonsense words to demonstrate decoding skill (NWF). | K-2 | 141-162 | `two-button-binary`, `mc-text`, `fib-auto` | (2btn-bin) Is "mip" a real word or nonsense? — timed / (mc-text) Which nonsense word matches /vot/? / (fib-auto) Type the nonsense word you hear — drill mode repeats two-button-binary |
| `fluency_orf_grade2` | Read a Grade 2 passage aloud at 87-100+ WCPM (Hasbrouck-Tindal 50th percentile, winter). | 2-3 | n/a | `mc-text`, `mc-multi-select`, `sequence-events` | Fluency strand: drill override applies. Companion comprehension cards after oral reading use these mechanics. (mc-text) "What was the passage mostly about?" / (mc-multi-select) Select all details you remember / (seq-evts) Put 3 events in order |
| `fluency_prosody_phrasing` | Group words into meaningful phrases using punctuation and syntax cues. | 2-3 | n/a | `sentence-build`, `mc-text`, `dnd-linked` | (sent-build) Drag scoop-mark tokens under phrase groups / (mc-text) Which reading has the best phrasing? [audio options] / (dnd-linked) Drag phrase cards into reading order |

---

### 4.4 Vocabulary

> Part 4. Variety of mechanics is especially important here — recognition (mc-text) surfaces different knowledge than production (fib-auto) or relational reasoning (match-pairs, sort-into-bins).

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `vocab_tier2_context_clues` | Use context clues in a sentence to determine the meaning of an unfamiliar Tier 2 word. | 2-3 | 180-195 | `mc-text`, `fib-auto`, `hot-text-word`, `match-pairs`, `sort-into-bins` | (mc-text) "'She was famished after the hike.' Famished means..." / (fib-auto) "Use context: 'The enormous elephant was ___.' Type what enormous means." / (hw-word) Tap the context clue word that helps define "ancient" / (match-pairs) Match word to definition / (sort-bins) Sort words by context clue type: example / contrast |
| `vocab_synonyms_grade3` | Identify and use synonyms for common Tier 2 adjectives and verbs. | 2-3 | 183-198 | `mc-text`, `match-pairs`, `sort-into-bins`, `fib-auto`, `mc-multi-select` | (mc-text) "Which word means the same as 'furious'?" / (match-pairs) Match happy·angry·tired·large to synonyms / (sort-bins) Sort: positive / negative connotation / (fib-auto) "Another word for 'enormous' is ___." / (mc-multi-select) Select all synonyms for "said" |
| `vocab_antonyms_grade3` | Identify antonyms for common Tier 2 adjectives, verbs, and adverbs. | 2-3 | 183-198 | `mc-text`, `match-pairs`, `two-button-binary`, `fib-auto`, `sort-into-bins` | (mc-text) "What is the opposite of 'courageous'?" / (match-pairs) Match words to antonyms / (2btn-bin) Antonyms or synonyms: "brave / fearless" / (fib-auto) "The opposite of 'ancient' is ___." / (sort-bins) Sort word pairs: antonyms / synonyms |
| `vocab_prefix_un_re_pre` | Use knowledge of prefixes (un-, re-, pre-) to determine word meaning. | 2-3 | 185-200 | `mc-text`, `fib-auto`, `match-pairs`, `hot-text-word`, `sort-into-bins` | (mc-text) "What does 'unhappy' mean?" / (fib-auto) "Pre- means ___." (before) / (match-pairs) Match prefixed word to definition / (hw-word) Tap the prefix in "rebuild" / (sort-bins) Sort by prefix: un- / re- / pre- |
| `vocab_suffix_er_est_ly` | Use knowledge of suffixes (-er, -est, -ly) to interpret comparative and adverb forms. | 2-3 | 185-200 | `mc-text`, `fib-auto`, `match-pairs`, `sort-into-bins`, `two-button-binary` | (mc-text) "Which word means 'most tall'?" / (fib-auto) "Add -er to 'bright': ___." / (match-pairs) Match word + suffix to new meaning / (sort-bins) Sort by suffix: -er / -est / -ly / (2btn-bin) Does "slowly" describe how? Yes / No |
| `vocab_multiple_meaning` | Identify the correct meaning of a multiple-meaning word based on context. | 2-3 | 188-202 | `mc-text`, `drop-down-inline`, `fib-auto`, `sort-into-bins`, `hot-text-word` | (mc-text) "'She hit the nail.' Which meaning of nail?" / (dd-inline) "She hit the [nail/right answer] with a hammer." / (fib-auto) "In 'the bark of the tree,' bark means ___." / (sort-bins) Sort sentences: meaning A / meaning B / (hw-word) Tap the context word that signals which meaning of "bank" |
| `vocab_figurative_simile_metaphor` | Distinguish simile from metaphor and interpret both in context. | 3-5 | 192-207 | `two-button-binary`, `mc-text`, `fib-auto`, `sort-into-bins`, `hot-text-sentence` | (2btn-bin) Simile or metaphor: "Her voice is music." / (mc-text) "Life is a journey" compares life to... / (fib-auto) "The comparison in 'He ran like the wind' shows ___." / (sort-bins) Sort: Simile / Metaphor / (hw-sent) Tap the sentence containing a simile |
| `vocab_shades_of_meaning` | Order adjectives and verbs on a nuance scale (cold-cool-warm-hot; whisper-say-shout). | 3-5 | 190-205 | `sequence-events`, `mc-text`, `sort-into-bins`, `match-pairs`, `dnd-linked` | (seq-evts) Order: freezing · cool · warm · scorching from mildest to most intense / (mc-text) Which word is strongest: annoyed / angry / furious? / (sort-bins) Sort by intensity: mild / strong / (match-pairs) Match shades-of-meaning pairs / (dnd-linked) Drag words into the intensity scale |

---

### 4.5 Comprehension — Literature

> Part 5A-B. Dominant mechanic for grades 3-5 is `passage-mc-set` and `claim-evidence`. K-2 uses individual cards with `mc-image` + `mc-text`. Variety rule is especially important here because the same skill (e.g., "main idea") can be assessed as recognition, selection, production, and citation.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `comp_lit_character_identify` | Identify the main character(s) in a story. | K-1 | 151-165 | `mc-image`, `mc-text`, `tap-hotspot`, `fib-auto` | (mc-image) Tap the picture of the main character / (mc-text) "Who is the story mostly about?" / (tap-hs) Tap the word in the title that names the main character / (fib-auto) "The main character's name is ___." |
| `comp_lit_character_traits` | Describe a character's traits using evidence from the text. | 2-3 | 180-198 | `mc-text`, `mc-multi-select`, `hot-text-sentence`, `fib-auto`, `claim-evidence` | (mc-text) "Which word best describes the fox?" / (mc-multi-select) Select all words that describe the main character / (hw-sent) Tap the sentence that shows the character is brave / (fib-auto) "One trait that describes the character is ___." / (claim-ev) Choose the trait; then tap the text evidence |
| `comp_lit_setting_identify` | Identify the setting (time and place) of a story. | K-2 | 158-172 | `mc-image`, `mc-text`, `tap-hotspot`, `fib-auto` | (mc-image) Tap the picture showing where the story takes place / (mc-text) "When does this story take place?" / (tap-hs) Tap the sentence that describes the setting / (fib-auto) "The story takes place in ___." |
| `comp_lit_story_sequence` | Sequence the major events in a story (beginning, middle, end). | K-2 | 160-178 | `sequence-events`, `mc-text`, `sort-into-bins`, `hot-text-sentence` | (seq-evts) Put 3 events in the correct order / (mc-text) "What happened FIRST in the story?" / (sort-bins) Sort events: Beginning / Middle / End / (hw-sent) Tap the sentence that describes what happens last |
| `comp_lit_theme` | Identify the theme or central message of a story. | 3-5 | 190-207 | `mc-text`, `hot-text-sentence`, `claim-evidence`, `fib-auto`, `mc-multi-select` | (mc-text) "What is the theme of this story?" / (hw-sent) Tap the sentence that best states the theme / (claim-ev) Choose the theme; tap the best supporting sentence / (fib-auto) "The theme of this story is ___." / (mc-multi-select) Select all statements that support the theme |
| `comp_lit_inference` | Make inferences about character feelings or plot using text clues plus background knowledge. | 2-3 | 183-200 | `mc-text`, `hot-text-word`, `claim-evidence`, `fib-auto`, `passage-mc-set` | (mc-text) "How does Maya probably feel? The text says she cried." / (hw-word) Tap the word that tells us how the character feels / (claim-ev) Choose the inference; tap the text that supports it / (fib-auto) "We can infer that the character feels ___ because ___." / (passage-mc-set) 3-item set with inference items |
| `comp_lit_compare_contrast` | Compare and contrast two characters, settings, or events within a text. | 3-5 | 193-207 | `mc-text`, `sort-into-bins`, `mc-multi-select`, `hot-text-sentence`, `fib-auto` | (mc-text) "How are the two characters ALIKE?" / (sort-bins) Sort traits: Character A only / Both / Character B only / (mc-multi-select) Select all traits shared by both characters / (hw-sent) Tap the sentence that shows how the settings differ / (fib-auto) "One way the characters are different is ___." |
| `comp_lit_summarize` | Summarize the key events of a literary text (SWBST frame). | 3-5 | 195-210 | `sequence-events`, `mc-text`, `mc-multi-select`, `fib-auto`, `open-response-fib` | (seq-evts) Order 5 key events / (mc-text) "Which is the best summary of this story?" / (mc-multi-select) Select only the IMPORTANT events (not details) / (fib-auto) "The problem in the story is ___ and the solution is ___." / (open-fib) Write a 2-sentence summary (teacher-graded) |

---

### 4.6 Comprehension — Informational

> Part 5C-D. Informational text dominates NWEA Reading 2-5 (30% informational / 30% literary split). `passage-mc-set` and `claim-evidence` are the dominant mechanics for grades 3-5.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `comp_info_main_idea` | Identify the main idea and distinguish it from supporting details. | 2-3 | 183-200 | `passage-mc-set`, `hot-text-sentence`, `mc-multi-select`, `fib-auto`, `sort-into-bins` | (passage-mc-set) 3 MC items including main idea / (hw-sent) Tap the sentence that BEST states the main idea / (mc-multi-select) Select all SUPPORTING details (not the main idea) / (fib-auto) "The main idea of this paragraph is ___." / (sort-bins) Sort sentences: Main Idea / Supporting Detail |
| `comp_info_supporting_details` | Identify details that support the main idea of an informational paragraph. | 2-3 | 181-198 | `mc-text`, `mc-multi-select`, `hot-text-sentence`, `sort-into-bins`, `fib-auto` | (mc-text) "Which detail BEST supports the main idea?" / (mc-multi-select) Select all sentences that support the main idea / (hw-sent) Tap a sentence that is a supporting detail / (sort-bins) Sort: Main Idea / Detail / Off-topic / (fib-auto) "One detail that supports the main idea is ___." |
| `comp_info_text_features` | Use text features (headings, captions, bold print, diagrams) to locate information. | 2-3 | 178-194 | `tap-hotspot`, `mc-text`, `fib-auto`, `sort-into-bins`, `mc-multi-select` | (tap-hs) Tap the text feature that helps you find definitions / (mc-text) "What does the caption under the photo tell you?" / (fib-auto) "The heading 'Ocean Animals' tells me this section is about ___." / (sort-bins) Sort features: Tell you where to look / Explain a picture / Show order of events / (mc-multi-select) Select all text features present in this passage |
| `comp_info_text_structure_sequence` | Identify sequential/chronological text structure and use signal words (first, next, then, finally). | 2-3 | 181-196 | `sequence-events`, `mc-text`, `hot-text-word`, `sort-into-bins`, `fib-auto` | (seq-evts) Order 4 steps in the procedure / (mc-text) "What is the text structure?" / (hw-word) Tap a signal word that shows sequence / (sort-bins) Sort signal words: Sequence / Cause-Effect / Compare-Contrast / (fib-auto) "The signal word '___ ' shows this is a sequence text." |
| `comp_info_authors_purpose_pie` | Identify the author's purpose as Persuade, Inform, or Entertain (PIE). | 3-5 | 190-205 | `three-button-binary`, `mc-text`, `hot-text-sentence`, `fib-auto`, `claim-evidence` | Use `mc-text` with 3 options for PIE. (mc-text) "Why did the author write this?" A) persuade B) inform C) entertain / (hw-sent) Tap the sentence that best shows the author's purpose / (fib-auto) "The author's purpose is to ___ because ___." / (claim-ev) Choose the purpose; tap the strongest evidence / Note: use `tap-hotspot` for image-based PIE icons as alternative to mc-text |
| `comp_info_fact_opinion` | Distinguish between statements of fact (verifiable) and opinion (belief/judgment). | 3-5 | 188-203 | `two-button-binary`, `sort-into-bins`, `mc-text`, `hot-text-sentence`, `tap-hotspot` | (2btn-bin) Fact or Opinion: "The Amazon is the largest rainforest." / (sort-bins) Sort 6 statements: Fact / Opinion / (mc-text) "Which sentence is an opinion?" / (hw-sent) Tap all opinion sentences in the paragraph / (tap-hs) Tap the clue word that signals an opinion |
| `comp_info_citing_evidence` | Cite specific text evidence to support an answer or claim. | 3-5 | 195-210 | `claim-evidence`, `hot-text-sentence`, `hot-text-paragraph`, `mc-text`, `passage-mc-set` | (claim-ev) Choose the best answer; tap the sentence that proves it / (hw-sent) Tap the sentence that BEST supports: "The author thinks bees are important." / (hw-para) Tap the paragraph that provides the most evidence for the claim / (mc-text) "Which sentence from the text BEST supports the answer?" / (passage-mc-set) 4-item set with evidence-based items |
| `comp_info_paired_passages` | Compare information across two related informational texts on the same topic. | 4-5+ | 200-215 | `mc-multi-select`, `sort-into-bins`, `hot-text-sentence`, `fib-auto`, `claim-evidence` | (mc-multi-select) Select ideas found in BOTH passages / (sort-bins) Sort details: Passage 1 only / Both / Passage 2 only / (hw-sent) Tap the sentence in Passage 2 that adds new information / (fib-auto) "One detail in Passage 1 but NOT in Passage 2 is ___." / (claim-ev) Both-passage synthesis question |

---

### 4.7 Grammar

> Part 6. The Language Usage strand (2-12). `word-tagger` and `hot-text-word` are the signature mechanics for grammar. `drop-down-inline` is the primary NWEA Language Usage mechanic.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `grammar_noun_common_proper` | Distinguish common nouns from proper nouns; capitalize proper nouns correctly. | 1-2 | 163-180 | `two-button-binary`, `tap-hotspot`, `sort-into-bins`, `hot-text-word`, `fib-auto` | (2btn-bin) Common or proper: "library" / (tap-hs) Tap the proper noun in the sentence / (sort-bins) Sort: Common Noun / Proper Noun / (hw-word) Tap every proper noun in the paragraph / (fib-auto) "The name of a specific place is a ___ noun." |
| `grammar_pronoun_antecedent` | Match pronouns to their correct antecedents in a sentence. | 2-3 | 178-195 | `drop-down-inline`, `mc-text`, `tap-hotspot`, `fib-auto`, `hot-text-word` | (dd-inline) "Maria said [she/he/they] was tired." / (mc-text) "Which pronoun replaces 'the children'?" / (tap-hs) Tap the noun that the underlined pronoun replaces / (fib-auto) "'The dog wagged ___ tail.' Fill in the correct pronoun." / (hw-word) Tap the antecedent for "their" |
| `grammar_verb_tense_regular` | Use and identify regular past, present, and future verb tenses. | 2-3 | 175-192 | `drop-down-inline`, `sort-into-bins`, `mc-text`, `fib-auto`, `hot-text-word` | (dd-inline) "Yesterday she [walk/walked] to school." / (sort-bins) Sort sentences: Past / Present / Future / (mc-text) "Which sentence uses the correct tense?" / (fib-auto) "Add -ed to 'jump': ___." / (hw-word) Tap the verb in the sentence |
| `grammar_verb_tense_irregular` | Use and identify irregular past-tense verbs (went, saw, ran, knew, brought). | 2-3 | 180-198 | `drop-down-inline`, `mc-text`, `fib-auto`, `sort-into-bins`, `mc-multi-select` | (dd-inline) "She [goed/went] to the store." / (mc-text) "What is the past tense of 'bring'?" / (fib-auto) "Yesterday I ___ to the park." (went) / (sort-bins) Sort: Regular past-tense / Irregular past-tense / (mc-multi-select) Select all irregular verbs from the list |
| `grammar_subject_verb_agreement` | Ensure subjects and verbs agree in number (singular/plural). | 2-3 | 178-195 | `drop-down-inline`, `two-button-binary`, `mc-text`, `fib-auto`, `word-tagger` | (dd-inline) "The dogs [run/runs] in the park." / (2btn-bin) Correct or incorrect: "The children runs." / (mc-text) "Which sentence has correct subject-verb agreement?" / (fib-auto) "The flock of birds ___ south." (flies) / (word-tagger) Tag subject and verb; decide if they agree |
| `grammar_adjectives_osascomp` | Order multiple adjectives using the OSASCOMP sequence (Opinion-Size-Age-Shape-Color-Origin-Material-Purpose). | 4-5+ | 198-210 | `mc-text`, `sentence-build`, `two-button-binary`, `fib-auto`, `sort-into-bins` | (mc-text) "Which adjective order is correct: 'a small old wooden box' or 'an old small wooden box'?" / (sent-build) Drag adjective tiles into correct OSASCOMP order / (2btn-bin) Correct or incorrect order / (fib-auto) "Reorder: 'a plastic big red ball' correctly: ___." / (sort-bins) Sort adjectives into OSASCOMP categories |
| `grammar_conjunctions_fanboys` | Use coordinating conjunctions (for, and, nor, but, or, yet, so) to join clauses. | 3-5 | 188-203 | `drop-down-inline`, `mc-text`, `fib-auto`, `sentence-build`, `sort-into-bins` | (dd-inline) "I wanted to go [but/and/so] it was raining." / (mc-text) "Which conjunction shows contrast?" / (fib-auto) "I was tired, ___ I went to bed." (so) / (sent-build) Build a compound sentence using the correct FANBOYS / (sort-bins) Sort by function: addition / contrast / result |
| `grammar_prepositions` | Identify prepositions and prepositional phrases in sentences. | 3-5 | 190-205 | `tap-hotspot`, `mc-text`, `word-tagger`, `hot-text-word`, `fib-auto` | (tap-hs) Tap the preposition in the sentence / (mc-text) "Which word is a preposition?" / (word-tagger) Tag nouns, verbs, and prepositions in different colors / (hw-word) Tap every prepositional phrase in the passage / (fib-auto) "The cat sat ___ the table." (under) |
| `grammar_adverbs` | Identify adverbs and distinguish them from adjectives; recognize adverbs of time, place, and manner. | 3-5 | 190-205 | `tap-hotspot`, `sort-into-bins`, `mc-text`, `word-tagger`, `drop-down-inline` | (tap-hs) Tap the adverb in "She sings beautifully." / (sort-bins) Sort words: Adjective / Adverb / (mc-text) "Which word modifies the verb?" / (word-tagger) Tag adjectives orange / adverbs purple / (dd-inline) "He ran [quick/quickly] to the exit." |
| `grammar_compound_sentence_comma` | Form compound sentences using a comma + coordinating conjunction. | 3-5 | 190-205 | `mc-text`, `sentence-build`, `two-button-binary`, `fib-auto`, `drop-down-inline` | (mc-text) "Which sentence is correctly written as a compound sentence?" / (sent-build) Drag 2 independent clauses and a conjunction into order / (2btn-bin) Correct or incorrect comma placement? / (fib-auto) "She was tired___ she kept reading." (,but) / (dd-inline) "I was hungry[,/;] so I ate a snack." |

---

### 4.8 Sentence Structure

> Part 7. The bridge between grammar and writing. Fragment/run-on identification uses `two-button-binary` as a fast drill mechanic; complex sentence construction uses `sentence-build` and `drop-down-inline`.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `ss_fragment_vs_sentence` | Distinguish complete sentences from fragments. | 2-3 | 178-194 | `two-button-binary`, `mc-text`, `tap-hotspot`, `fib-auto`, `sort-into-bins` | (2btn-bin) Sentence or Fragment: "Running to school." / (mc-text) "Which is a complete sentence?" / (tap-hs) Tap the fragment in the list / (fib-auto) "Add a subject to fix: '___ran to the store.'" / (sort-bins) Sort: Complete Sentence / Fragment |
| `ss_run_on_sentence` | Identify run-on sentences and correct them using punctuation or conjunctions. | 2-3 | 181-196 | `two-button-binary`, `mc-text`, `drop-down-inline`, `fib-auto`, `hot-text-sentence` | (2btn-bin) Run-on or correct: "I ran fast I won the race." / (mc-text) "How can this run-on be fixed?" / (dd-inline) "I ran fast[,/;/.] I won the race." / (fib-auto) "Fix the run-on: I was tired I went to bed. Answer: ___" / (hw-sent) Tap the run-on sentence in the paragraph |
| `ss_simple_compound_complex` | Classify sentences as simple, compound, or complex. | 3-5 | 190-207 | `mc-text`, `three-way-sort`, `tap-hotspot`, `fib-auto`, `sort-into-bins` | Use `sort-into-bins` with 3 bins. (mc-text) "Which is a complex sentence?" / (sort-bins) Sort: Simple / Compound / Complex / (tap-hs) Tap the dependent clause / (fib-auto) "A complex sentence has ___ independent and ___ dependent clause(s)." |
| `ss_sentence_combining` | Combine two simple sentences into a compound or complex sentence. | 3-5 | 193-207 | `sentence-build`, `drop-down-inline`, `fib-auto`, `mc-text`, `open-response-fib` | (sent-build) Drag words and conjunction to build a combined sentence / (dd-inline) "I was cold. I put on a coat. → I was cold [because/so/but] I put on a coat." / (fib-auto) "Combine: 'She was late. She ran.' Answer: ___" / (mc-text) "Which combined sentence is correct?" / (open-fib) Combine 2 sentences in your own words (teacher-graded) |
| `ss_parallel_structure` | Identify and correct errors in parallel structure within a list or compound predicate. | 4-5+ | 200-212 | `mc-text`, `two-button-binary`, `drop-down-inline`, `fib-auto`, `hot-text-word` | (mc-text) "Which sentence uses parallel structure?" / (2btn-bin) Parallel or not parallel? "She likes running, to swim, and dancing." / (dd-inline) "She likes running, swimming, and [to dance/dancing]." / (fib-auto) "Fix: I like hiking and to swim. Answer: ___" / (hw-word) Tap the non-parallel element |
| `ss_dependent_clause` | Identify dependent clauses and the subordinating conjunctions that introduce them. | 4-5+ | 197-212 | `tap-hotspot`, `mc-text`, `sort-into-bins`, `fib-auto`, `word-tagger` | (tap-hs) Tap the dependent clause in the sentence / (mc-text) "Which word makes this a dependent clause: 'Although she was tired'?" / (sort-bins) Sort: Independent Clause / Dependent Clause / (fib-auto) "The word '___ ' in 'because I was tired' is a subordinating conjunction." / (word-tagger) Tag independent clauses blue / dependent clauses green |

---

### 4.9 Mechanics

> Part 8. Language Usage 2-12. Capitalization drill decks use `two-button-binary` (fast-tap, up to 50 cards). Punctuation uses `drop-down-inline` as primary for NWEA alignment. Spelling uses `letter-tile-spell` and `fib-auto`.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `mech_capitalize_sentence` | Capitalize the first word of every sentence. | K-1 | 153-168 | `two-button-binary`, `tap-hotspot`, `fib-auto`, `mc-text`, `hot-text-word` | (2btn-bin) Capital or no capital: "the dog barked." (first word) / (tap-hs) Tap the word that needs a capital / (fib-auto) "Fix: 'the sun is bright.' Answer: ___" / (mc-text) "Which sentence is correctly capitalized?" / (hw-word) Tap every word that needs a capital letter |
| `mech_capitalize_proper_noun` | Capitalize proper nouns: names, cities, countries, days, months, titles. | 2-3 | 170-188 | `two-button-binary`, `hot-text-word`, `sort-into-bins`, `fib-auto`, `drop-down-inline` | (2btn-bin) Should "london" be capitalized? / (hw-word) Tap every word that needs a capital letter / (sort-bins) Sort: Needs Capital / No Capital Needed / (fib-auto) "Fix: 'I live in paris, france.': ___" / (dd-inline) "We went to [london/London]." |
| `mech_end_punctuation` | Use periods, question marks, and exclamation points correctly at the end of sentences. | K-1 | 155-170 | `mc-text`, `drop-down-inline`, `two-button-binary`, `tap-hotspot`, `fib-auto` | (mc-text) "What punctuation ends a question?" / (dd-inline) "Where are you going[?/./ !]" / (2btn-bin) Period or question mark: "She is running" / (tap-hs) Tap the sentence that is missing end punctuation / (fib-auto) "Add the correct mark: 'Stop right now___'" |
| `mech_comma_series` | Use commas to separate three or more items in a series. | 2-3 | 175-192 | `drop-down-inline`, `mc-text`, `two-button-binary`, `fib-auto`, `hot-text-word` | (dd-inline) "I bought apples[,] oranges[,] and grapes." / (mc-text) "Which sentence uses commas correctly in a list?" / (2btn-bin) Correct or incorrect comma use? / (fib-auto) "Add commas: 'We need eggs milk and butter.': ___" / (hw-word) Tap every place a comma is missing |
| `mech_comma_compound_sentence` | Use a comma before a coordinating conjunction in a compound sentence. | 3-5 | 185-200 | `drop-down-inline`, `mc-text`, `two-button-binary`, `fib-auto`, `hot-text-word` | (dd-inline) "I was tired[,] but I kept going." / (mc-text) "Where does the comma go?" / (2btn-bin) Is the comma in the right place? "I ran fast, and I won." / (fib-auto) "Add the comma: 'She sang well but she was nervous.': ___" / (hw-word) Tap where the comma belongs |
| `mech_apostrophe_contraction` | Use apostrophes correctly in contractions (can't, won't, it's, they're). | 2-3 | 175-192 | `drop-down-inline`, `mc-text`, `fib-auto`, `two-button-binary`, `sort-into-bins` | (dd-inline) "I [can't/cant] find my shoes." / (mc-text) "Which is the correct contraction for 'do not'?" / (fib-auto) "Write the contraction for 'they are': ___" / (2btn-bin) Contraction or possessive: "it's" / (sort-bins) Sort: Contraction / Possessive |
| `mech_apostrophe_possessive` | Use apostrophes correctly to show possession (dog's, children's, teachers'). | 3-5 | 183-198 | `drop-down-inline`, `mc-text`, `two-button-binary`, `fib-auto`, `sort-into-bins` | (dd-inline) "The [dog's/dogs] bone was buried." / (mc-text) "Which shows that the bone belongs to the dog?" / (2btn-bin) Correct or incorrect: "the childrens' books" / (fib-auto) "Write the possessive: the books that belong to two teachers: ___" / (sort-bins) Sort: Singular possessive / Plural possessive |
| `mech_spelling_floss_rule` | Apply the FLOSS rule (double f, l, s, z after a short vowel at word end: off, bell, pass, buzz). | 2-3 | 175-190 | `two-button-binary`, `fib-auto`, `sort-into-bins`, `letter-tile-spell`, `mc-text` | (2btn-bin) Correct spelling: "ful" or "full"? / (fib-auto) "Spell the word /kĭs/ using the FLOSS rule: ___" (kiss) / (sort-bins) Sort: Follows FLOSS rule / Does not / (ltr-tile) Hear "cliff," drag tiles to spell it / (mc-text) "Which word is spelled correctly: 'of' or 'off'?" |

---

### 4.10 Writing

> Part 9. The most complex strand; requires the most mechanic variety to avoid monotonous "choose the best paragraph" decks. `open-response-fib` and `sentence-build` are the signature production mechanics. Build last per PHASE_0_DECISIONS.

| Skill ID | Skill Statement | Band | RIT | question_types | Example prompts (one per mechanic) |
|---|---|---|---|---|---|
| `writing_topic_sentence` | Identify and write a strong topic sentence that introduces the main idea of a paragraph. | 2-3 | 183-198 | `mc-text`, `hot-text-sentence`, `fib-auto`, `sort-into-bins`, `open-response-fib` | (mc-text) "Which is the best topic sentence for a paragraph about recycling?" / (hw-sent) Tap the topic sentence in the paragraph / (fib-auto) "A topic sentence should tell the ___." (main idea) / (sort-bins) Sort sentences: Topic Sentence / Supporting Detail / Concluding Sentence / (open-fib) Write a topic sentence for a paragraph about dolphins (teacher-graded) |
| `writing_supporting_details` | Add relevant supporting details that elaborate on the topic sentence. | 2-3 | 183-198 | `mc-text`, `mc-multi-select`, `sort-into-bins`, `sentence-build`, `open-response-fib` | (mc-text) "Which sentence would BEST support: 'Penguins are amazing birds.'" / (mc-multi-select) Select all sentences that belong in a paragraph about penguins / (sort-bins) Sort: On-topic / Off-topic / (sent-build) Drag word tiles to build a supporting detail sentence / (open-fib) Write a detail sentence to support the topic |
| `writing_transitions` | Use transitional words and phrases to connect ideas (first, next, also, however, in conclusion). | 3-5 | 188-203 | `drop-down-inline`, `mc-text`, `fib-auto`, `sort-into-bins`, `sentence-build` | (dd-inline) "[However/Therefore/First], the weather was warm." / (mc-text) "Which transition shows contrast?" / (fib-auto) "To show a sequence of steps, use '___' then '___'." / (sort-bins) Sort transitions by function: Order / Contrast / Result / (sent-build) Build a sentence using the correct transition word |
| `writing_conclusion` | Write or identify an effective concluding sentence that restates the main idea. | 3-5 | 190-205 | `mc-text`, `hot-text-sentence`, `two-button-binary`, `fib-auto`, `open-response-fib` | (mc-text) "Which conclusion BEST wraps up the paragraph?" / (hw-sent) Tap the concluding sentence in the paragraph / (2btn-bin) Strong or weak conclusion? / (fib-auto) "A conclusion should ___ the main idea, not add new information." (restate) / (open-fib) Write a conclusion for the paragraph (teacher-graded) |
| `writing_voice_audience` | Recognize and adjust writing for purpose and audience (formal vs. informal register). | 4-5+ | 195-210 | `two-button-binary`, `mc-text`, `sort-into-bins`, `drop-down-inline`, `open-response-fib` | (2btn-bin) Formal or informal: "Hey, wanna help me?" / (mc-text) "Which version is appropriate for a letter to the principal?" / (sort-bins) Sort sentences: Formal register / Informal register / (dd-inline) "Dear [Mr. Smith/Hey dude], I am writing about..." / (open-fib) Rewrite this informal sentence for a formal audience |
| `writing_opinion_vs_informational` | Distinguish opinion writing (claim + reasons) from informational writing (facts + explanation). | 3-5 | 190-205 | `two-button-binary`, `sort-into-bins`, `mc-text`, `hot-text-sentence`, `fib-auto` | (2btn-bin) Opinion or informational: "Cats are the best pets." / (sort-bins) Sort sentences: Opinion (claim) / Informational (fact) / (mc-text) "Which opening line is an opinion?" / (hw-sent) Tap the opinion statement in the paragraph / (fib-auto) "In an opinion piece, the writer states a ___ and gives ___." (claim / reasons) |

---

## 5. Worked Examples

### 5.1 Short /a/ in CVC — 10-Card Deck

**Skill:** `phonics_short_a_cvc` | Band: K-1 | RIT: 141-152

This worked deck follows the exact 10-mechanic sequence described in the variety rule specification, demonstrating how a single CVC phonics skill covers all five multi-modal learning modes (see-it, hear-it, build-it, sort-it, type-it) across 10 cards.

| Card | Mechanic | Prompt |
|---|---|---|
| 1 | `mc-image` | (3 pictures: bat / cat / bed) "Tap the picture that has the short /ă/ sound." |
| 2 | `letter-tile-spell` | "Listen: [TTS plays 'map']. Drag the letters to spell the word." Tiles: m · a · p · t · b (distractors). |
| 3 | `sort-into-bins` | "Sort each word into the right column." Bins: Short-A / Not Short-A. Words: bat · pet · cap · sit · ran · hot. |
| 4 | `sound-box` | (Picture of a cat) "How many sounds does 'cat' have? Drag a chip for each sound." 3 boxes shown. |
| 5 | `mc-image` | (3 audio icons + pictures) "Tap the picture whose name has the short /ă/ sound in the MIDDLE." Options: fan · fox · hen. |
| 6 | `build-with-tiles` | "Tap the letters in order to spell 'sad'." Tiles: s · a · d · e · t · r. |
| 7 | `tap-hotspot` | "Tap every word with the short /ă/ sound." Row: cat · hit · pan · log · ham · bus · cap. |
| 8 | `mc-text` | "Which word has the short /ă/ sound?" A) cake B) cat C) kite |
| 9 | `dnd-linked` | "Drag each word to the correct column." Columns: CVC short-a / CVC other vowel. Words: bat · big · cap · hop · map · ten. |
| 10 | `two-button-binary` | "Short /ă/ or NOT short /ă/?" Word shown: "game." Auto-speak on card load. |

**Deck analysis:** 7 distinct mechanics across 10 cards. No mechanic repeats in any 3-card window. Covers: recognition (mc-image, mc-text), auditory production (letter-tile-spell), tactile production (build-with-tiles), categorization (sort-into-bins), segmentation (sound-box), scanning (tap-hotspot), matching (dnd-linked), binary judgment (two-button-binary). Multi-modal coverage: see-it (cards 1, 5, 8), hear-it (cards 2, 5), build-it (cards 2, 6), sort-it (cards 3, 9), type-it / judge-it (cards 7, 10).

---

### 5.2 Capitalize Proper Nouns — 7-Card Deck

**Skill:** `mech_capitalize_proper_noun` | Band: 2-3 | RIT: 170-188 | Language Usage 2-12

| Card | Mechanic | Prompt |
|---|---|---|
| 1 | `two-button-binary` | "Should this word be capitalized?" Word shown: "doha." Buttons: Capitalize / No Capital. Auto-advance on selection. |
| 2 | `hot-text-word` | "Tap every word that needs a capital letter." Passage: "my friend lives in paris, france and she visits london every summer." |
| 3 | `mc-text` | "Which sentence is correctly capitalized?" A) We visited the amazon river. B) We visited the Amazon River. C) we visited the Amazon river. |
| 4 | `sort-into-bins` | "Sort each word." Bins: Needs a Capital Letter / No Capital Needed. Words: tuesday · table · january · mountain · africa · pencil. |
| 5 | `fib-auto` | "Fix the sentence: 'i went to school on monday.' Rewrite it correctly: ___" `acceptable_answers: ["I went to school on Monday."]` `case_sensitive: true` |
| 6 | `drop-down-inline` | "Choose the correctly capitalized option: The [amazon/Amazon] river is in [south america/South America]." |
| 7 | `mc-multi-select` | "Select ALL words that should be capitalized in this sentence: 'last tuesday, ms. chen visited rome, italy.'" Options: last · tuesday · ms · chen · rome · italy. |

**Deck analysis:** 7 distinct mechanics across 7 cards. No mechanic repeats (all 7 are different). Covers: binary judgment (2btn-bin), scanning passage (hw-word), recognition (mc-text), categorization (sort-bins), production (fib-auto), inline editing (drop-down-inline), multi-target identification (mc-multi-select). Misconceptions surfaced: card 3 surfaces the "capitalize the generic noun but not the proper noun" error; card 7 surfaces the "capitalize articles/prepositions" error.

---

### 5.3 Identify the Main Idea — 5-Card Deck

**Skill:** `comp_info_main_idea` | Band: 2-3 | RIT: 183-200 | Reading 2-5

| Card | Mechanic | Prompt |
|---|---|---|
| 1 | `passage-mc-set` | Passage: 150-word informational text about honeybees. 3 MC sub-items: (a) "What is this passage mostly about?" (b) "Which detail BEST supports the main idea?" (c) "What would be a good title for this passage?" |
| 2 | `hot-text-sentence` | Same passage re-displayed. "Tap the sentence that BEST states the main idea of the passage." Full passage shown; sentences individually selectable. |
| 3 | `sequence-events` | "Put these ideas in order from most general (main idea) to most specific (detail)." Cards: "Honeybees make honey" / "Bees gather nectar from flowers" / "Honeybees are important insects" / "Nectar is stored in the hive." |
| 4 | `claim-evidence` | Part A: "What is the main idea?" (mc-text, 4 options). Part B: "Tap the sentence in the passage that BEST supports this main idea." (passage-hot-text). Both parts must be correct for full credit. |
| 5 | `open-response-fib` | "In your own words, write the main idea of the passage in one sentence." (Teacher-graded; purple speech bubble.) |

**Deck analysis:** 5 distinct mechanics across 5 cards. All 5 are different — maximum variety possible in a 5-card deck. Covers: multi-item comprehension (passage-mc-set), sentence-level selection (hw-sent), hierarchical ordering (seq-evts), two-part claim + evidence (claim-ev), constructed response (open-fib). Misconceptions surfaced: card 3 distinguishes students who confuse supporting details with main ideas; card 4 requires both claim selection AND text evidence; card 5 reveals production gaps not visible in recognition mechanics.

---

## 6. Mechanic Priorities by Build Stage

Cross-reference with QUESTION_TYPES.md staging.

### Stage 1 Widgets — Coverage

Stage 1 widgets (`mc-text`, `mc-image`, `mc-multi-select`, `tap-hotspot`, `dnd-linked`, `fib-auto`) cover at least 3 mechanics for approximately **50% of all skills** in the catalog directly. Specifically:

- All Vocabulary skills can ship with 3+ of: `mc-text`, `mc-image`, `mc-multi-select`, `tap-hotspot`, `dnd-linked`, `fib-auto`.
- All Comprehension skills (Lit + Info, grades 2-5) can ship with 3+ of: `mc-text`, `mc-multi-select`, `tap-hotspot`, `dnd-linked`, `fib-auto`.
- Basic Grammar skills (identify noun, identify verb) can ship with 3+ Stage 1 mechanics.
- K-2 Phonemic Awareness skills can ship with `mc-image`, `tap-hotspot`, `fib-auto`.

**Limitation of Stage 1 only:** Phonics production mechanics (`letter-tile-spell`, `sound-box`) are Stage 2 but are highest-priority for the MVP build order (phonics-first). Stage 1 covers phonics recognition but NOT phonics production.

### Stage 2 Widgets — Unlock Remaining ~40%

Stage 2 widgets expand coverage to roughly **90% of all skills**:

| Stage 2 Widget | Skills it unlocks |
|---|---|
| `sound-box` | All K-2 Phonemic Awareness + Phonics production (segmentation, phoneme counting) |
| `letter-tile-spell` | All K-2 Phonics/Spelling audio-cued production items |
| `two-button-binary` | Capitalization drill decks (50 cards), real/nonsense word, fragment/sentence judgment |
| `word-tagger` | Parts-of-speech grammar (Grade 3+) — enables sentence-level analysis in one card |
| `hot-text-word` / `hot-text-sentence` | Grammar scanning, mechanics error detection, comprehension evidence |
| `drop-down-inline` | All Language Usage 2-12 NWEA-style items (grammar, mechanics, word choice) |
| `sentence-build` | Writing (sentence construction), fluency (phrase grouping), grammar |
| `sort-into-bins` | Phonics sorting (vowel patterns), vocabulary (categories), grammar (POS sort) |
| `match-pairs` | Vocabulary (synonym/antonym pairs), grammar (word ↔ POS label) |
| `sequence-events` | Comprehension (story events, procedural text steps), writing (paragraph organization) |

### Stage 3 Widgets — Last ~10%

| Stage 3 Widget | Skills it unlocks |
|---|---|
| `passage-mc-set` | Full Reading 2-5 comprehension mode (dominant NWEA format) |
| `passage-multi-select` | Multi-select comprehension items anchored to shared passage |
| `passage-hot-text` | Evidence-citing items in passage context |
| `claim-evidence` | Two-part claim + evidence items (RIT 195+, highest-order comprehension) |
| `open-response-fib` | Writing production, constructed-response comprehension, grammar correction |
| `dropdown-cloze` | Multi-slot Language Usage editing items (grammar + mechanics combined) |

---

## 7. Deck-Loader Configuration Knobs

These user-facing settings interact directly with the variety rule and the `buildPracticeDeck()` algorithm.

| Setting | Default | What it does |
|---|---|---|
| **Mix mechanics** toggle | ON | When ON, `buildPracticeDeck()` runs the round-robin algorithm (≥3 mechanics, no repeat in 3-card window). When OFF, the deck repeats a single mechanic — deliberate fluency-drill mode. Maps to `options.fluency_drill = !mixMechanics`. |
| **Mechanics filter** multi-select | (all enabled) | Custom Play Setting (Stage 2). Student or teacher selects which of the 23 mechanics to include. Use case: dyslexic students may exclude `fib-auto` (typing-heavy) and include only `mc-text`, `mc-image`, `two-button-binary`, `tap-hotspot`. The deck loader restricts `available` mechanics to the selected subset, with a ≥2 minimum fallback. |
| **Deck size** | 10 | Options: 5 (quick review), 10 (default practice), 15 (extended), 20 (assessment-style), 50 (drill mode). `count` parameter in `buildPracticeDeck()`. At deck size 5, only 3 distinct mechanics appear — the variety rule is still met (≥3). At deck size 50 in drill mode (`fluency_drill = true`), all 50 cards use the same mechanic intentionally. |
| **Adaptive ramp** toggle | OFF | When ON, mechanics are ordered by `MECHANIC_DIFFICULTY_RANK` (recognition → production → analysis). Example ramp: card 1 `mc-image` → card 4 `sort-into-bins` → card 7 `fib-auto` → card 10 `open-response-fib`. Ensures early success before harder production modes. Maps to `options.adaptive_ramp = true`. |
| **ELL scaffold** toggle | OFF | When ON, every card adds L1 cognate display (Arabic + Spanish), audio auto-speaks on load, pacing is 1.5x slower (TTS `rate: 0.7`), answer choices include image support where available. Does not change the mechanics list but does affect how each mechanic renders. |
| **SPED scaffold** toggle | OFF | When ON, deck size is capped at 5-8 items, `sound-box` is preferred as first mechanic for phonics skills, 3-attempt corrective feedback is enabled, and response time is doubled. Does not change the mechanics list for non-fluency skills. |

---

## 8. Conflict Resolution: Variety Rule vs Single-Skill Decks

> Re-stated from STUDY_NOTES.md §8 Tension 1.

**The apparent conflict:** The Boom Cards catalog (and good instructional design) says "keep decks single-skill — one ELA atom per deck." The variety rule says "use ≥3 mechanics per skill per deck." These sound contradictory at first.

**The resolution:** They are orthogonal rules that apply simultaneously.

- **"Single-skill deck"** means the deck targets exactly ONE skill atom (e.g., `phonics_short_a_cvc`). Every card in the deck assesses the same learning target. No multi-skill "mixed" decks in practice mode.
- **"Variety of mechanics"** means the CARDS within that single-skill deck use 3+ different interaction mechanics (mc-image, letter-tile-spell, sort-into-bins, etc.). Each card assesses the same target via a different cognitive pathway.

Both rules apply simultaneously: every deck is single-skill AND multi-mechanic.

The only exception is the fluency drill override: when `is_fluency_drill = true`, the deck is single-skill AND single-mechanic, because timed repetition of the same response type is the deliberate instructional goal (automaticity, not variety).

**Implementation rule:** The `skill_id` field on every `Question` object is always exactly one skill atom — it never holds multiple IDs in practice mode. The `question_type` field varies across cards within the deck. This is what the variety rule requires and what the `buildPracticeDeck()` algorithm enforces.

---

*End of QUESTION_SKILL_MATRIX.md — v1.0, 2026-05-03*
