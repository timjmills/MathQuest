# QUESTION_TYPES.md — Literacy Quest Canonical Question-Type Registry

**Version:** Phase 1 draft  
**Last updated:** 2026-05-03  
**Status:** Authoritative — all content authoring, widget build plans, and skill generators must reference this document.

---

## 1. Overview

This registry maps every `question_type` ID to its vanilla JS module, the ELA skills it serves, K-2 vs 2-5 behavioral variants, and accessibility requirements. It is the single source of truth for:

- Content authors populating the `question_types` array on a skill atom.
- Widget developers building or modifying a widget module.
- The deck-composition engine selecting mechanics to meet the "≥ 3 mechanics per 10-card deck" rule.

**A note on naming:** although this document uses "component" as shorthand in conceptual diagrams, Literacy Quest uses vanilla JS modules — not React components. Each widget is a plain ES module exporting a `render*` function and a `check*` function following the Math Quest widget pattern.

**Anchoring:** The registry is grounded in three sources:
1. The Boom Cards comprehensive catalog (Stage 1–4 build order + cross-reference matrix).
2. The seven NWEA MAP Growth item types (item-set architecture, selectable-text tokenizer, etc.).
3. Two custom widgets surfaced by the example images (color-coded word tagger, audio-cued drag-to-spell).

**Voice Memo is excluded** per PHASE_0_DECISIONS.md (§4). All audio uses the Web Speech API (`hints-speech.js`) — no pre-rendered assets.

---

## 2. Stage 1 — Minimum Viable Widget Library (Build First)

The six Stage 1 widgets cover 80 % of K-5 ELA interactions. Do not begin Stage 2 until Stage 1 is complete and tested.

---

### `mc-text`

| Field | Value |
|---|---|
| **Question type ID** | `mc-text` |
| **JS module** | `js/modules/literacy/widgets/mc-text.js` |
| **Exports** | `renderMcText(container, question)` · `checkMcText(response, question)` |

**What it is.** A single-select multiple-choice question where all answer choices are text strings. The student taps or clicks exactly one option; feedback is inline (green/red color swap on the chosen button). Retries until correct unless a surrender limit is configured.

**Skills it suits.** Vocabulary (synonym/antonym selection, context clues), comprehension (main idea, story elements, author's purpose), grammar (identify the correct sentence), mechanics (choose correctly punctuated option). Mirrors Boom's MC-single primitive and NWEA item type 1.

**K-2 variant.** 3 options max, rendered as full-width vivid-pill buttons (solid blue / green / purple fill, bold white text, min-height 56 px). Stem font 1.3 rem. Audio button (orange, wide) sits above the choices and auto-speaks the stem on card load.

**2-5 variant.** 4 options in a 2×2 grid, rendered as outlined rounded-rectangle buttons (white fill, thin 2 px colored border, dark text). Stem font 1.1 rem. Audio button is a small inline speaker icon; does not auto-speak.

**Accessibility.** Arrow keys cycle options; Enter selects. `role="radio"` on each choice; `aria-checked` reflects state. `aria-live="polite"` announces feedback text. Audio button has a visible label ("Listen") not just an icon. Minimum tap target 60×60 px for K-2.

**Example.** Skill: `vocab_context_clues_grade2`. Prompt: "Read the sentence. 'She was famished after the long hike.' What does famished mean?" Options: A) very tired · B) very hungry · C) very happy.

---

### `mc-image`

| Field | Value |
|---|---|
| **Question type ID** | `mc-image` |
| **JS module** | `js/modules/literacy/widgets/mc-image.js` |
| **Exports** | `renderMcImage(container, question)` · `checkMcImage(response, question)` |

**What it is.** Single-select MC where answer choices are images (each with an `alt` text label). A thin caption below each image optionally shows a word. Used heavily for K-2 phonics, phonological awareness, and vocabulary where reducing English text load supports ELL learners.

**Skills it suits.** Phonological awareness (rhyming picture identification), phonics (initial sound picture sort), vocabulary (picture-to-word match), sight words (tap the word that matches the picture), comprehension (K-2 character/setting identification with illustrated answers). Primary mechanic in NWEA Reading K-2 for image-choice items.

**K-2 variant.** 3 large image tiles, each 140×140 px min, vivid solid-color border on hover/select. Audio button auto-speaks stem. Image ALT text is spoken by TTS when the audio button for that choice is tapped.

**2-5 variant.** 4 image tiles in 2×2 grid, 120×120 px min, thin outlined border. Audio is secondary.

**Accessibility.** Every `<img>` carries an `alt` attribute (never empty for informational images). Per-choice audio button speaks the `alt` text. `role="radio"` on each tile wrapper. Keyboard: Tab moves between tiles; Space/Enter selects.

**Example.** Skill: `phonics_initial_consonant_b`. Prompt: "Which picture begins with the /b/ sound?" Image choices: bat · cat · dog.

---

### `mc-multi-select`

| Field | Value |
|---|---|
| **Question type ID** | `mc-multi-select` |
| **JS module** | `js/modules/literacy/widgets/mc-multi-select.js` |
| **Exports** | `renderMcMultiSelect(container, question)` · `checkMcMultiSelect(response, question)` |

**What it is.** Multi-select MC gated by a Submit button. Student selects all correct options (1–N). Feedback highlights correct choices green and incorrect choices red. Partial-credit logic: `score = correct_selected / total_correct` — all required for full credit. Mirrors NWEA item type 2.

**Skills it suits.** Comprehension (select all details that support the main idea), grammar (select all nouns in the list), vocabulary (select all words that mean the same as "big"), mechanics (select all sentences with correct capitalization), spelling (select all correctly spelled words). Reading 2-5 and Language Usage primary use case.

**K-2 variant.** Use sparingly — high cognitive load. Max 4 choices; no 2×2 grid — stack vertically. Include a helper banner "Pick ALL the right answers" at the top of the card.

**2-5 variant.** 4–6 choices in a 2×3 or 2×2 grid depending on count. "Submit" button activates only after ≥ 1 choice is selected.

**Accessibility.** `role="checkbox"` on each option; `aria-checked` reflects state. `aria-live="assertive"` announces score after submit. Keyboard: Tab/Shift+Tab between options; Space toggles; Enter submits when Submit is focused.

**Example.** Skill: `grammar_identify_nouns`. Prompt: "Select ALL the nouns." Options: run · table · quickly · pencil · the · mountain.

---

### `tap-hotspot`

| Field | Value |
|---|---|
| **Question type ID** | `tap-hotspot` |
| **JS module** | `js/modules/literacy/widgets/tap-hotspot.js` |
| **Exports** | `renderTapHotspot(container, question)` · `checkTapHotspot(response, question)` |

**What it is.** Any element on the card (image region, word, picture, icon) is flagged as correct or incorrect. Student taps to select; green/red feedback on the element itself. Supports single-correct (auto-advance) and multi-correct (Submit-gated) variants. Mirrors Boom's Tap-the-Element primitive and the NWEA hot-text mechanic at the word level.

**Skills it suits.** Phonics (tap the word with the short-a sound), grammar (tap the verb in the sentence), proofreading/mechanics (tap the word with the spelling error), comprehension (tap the picture showing the main character), sight words (tap the sight word from a group). The `hot-text-word` and `hot-text-sentence` Stage 2 widgets are specializations of this primitive.

**K-2 variant.** Elements are larger (min 60×60 px for image, min 2 rem font for words). Red "Try again" nudge replaces green/red if SPED errorless mode is active.

**2-5 variant.** Can operate on dense passage text at word or sentence level; elements are sentence-rendered spans.

**Accessibility.** Each tappable element is a `<button>` or has `role="button"` with `tabindex="0"`. `aria-pressed` reflects selection state. `aria-label` describes the element for screen readers. Keyboard: Tab moves between hotspots; Enter/Space taps.

**Example.** Skill: `mechanics_find_spelling_error`. Prompt: "Tap the word that is spelled incorrectly." Sentence: "She recieved a gift on her birthday."

---

### `dnd-linked`

| Field | Value |
|---|---|
| **Question type ID** | `dnd-linked` |
| **JS module** | `js/modules/literacy/widgets/dnd-linked.js` |
| **Exports** | `renderDndLinked(container, question)` · `checkDndLinked(response, question)` |

**What it is.** Drag-and-drop with linked drop zones. Each draggable is wired to one or more valid targets via an `accept_map` object in the question data. Drop zones support `accept_any` (any draggable), `accept_all` (all specific items), or `accept_specific` (a named list). A draggable must be > 50 % inside a zone to register. Keyboard-accessible equivalent is required (WCAG 2.1 AA). Mirrors Boom's Drag-and-Drop primitive and NWEA item type 4.

**Skills it suits.** Phonics (drag letters into Elkonin boxes), phonological awareness (drag syllable tokens), sight words (drag scrambled letters into order), vocabulary (drag word into correct category), comprehension (drag events into sequence), grammar/writing (drag word tiles to build a sentence), spelling (sort words by pattern into bins). The `sort-into-bins` and `sentence-build` Stage 2 widgets derive from this primitive.

**K-2 variant.** Tiles are large squares (80×80 px min), vivid solid fill, high-contrast text. Snap animation on drop.

**2-5 variant.** Tiles are smaller text chips (min 44 px height). Multi-column target zones for sorting.

**Accessibility.** Keyboard mode: Tab enters drag mode on a tile; arrow keys move it; Enter drops onto the focused zone. `aria-grabbed`, `aria-dropeffect` used for screen readers. Each drop zone has an `aria-label` describing what belongs there.

**Example.** Skill: `phonics_cvc_word_build`. Prompt: "Drag the letters to build the word 'map'." Three labeled drop slots: [_] [_] [_]. Letter tiles: m, a, p, s, t (with extra distractors).

---

### `fib-auto`

| Field | Value |
|---|---|
| **Question type ID** | `fib-auto` |
| **JS module** | `js/modules/literacy/widgets/fib-auto.js` |
| **Exports** | `renderFibAuto(container, question)` · `checkFibAuto(response, question)` |

**What it is.** Fill-in-the-blank with auto-grading. Student types a word or short phrase into a text input embedded in the sentence. Grading uses the `acceptable_answers` array (any one of the listed values counts as correct), with configurable `case_sensitive` and `normalize_whitespace` flags. This directly surpasses Boom's FIB limitation (Boom requires ALL listed answers; Literacy Quest uses any-one-of). Mirrors NWEA item type 6.

**Skills it suits.** Vocabulary (fill in the missing definition word), spelling (type the word you hear), grammar (fill in the correct verb form), mechanics (type the correctly capitalized word), reading comprehension (fill in the missing story detail — short answer). Language Usage 2-12 primary mechanic for spelling items.

**K-2 variant.** Input field is 2.5 rem height, 1.2 rem font. On-screen keyboard shown automatically on mobile. Audio button auto-speaks the prompt sentence; TTS reads aloud what the student typed on demand.

**2-5 variant.** Standard input field; virtual keyboard hidden unless touch device. Shows character count for longer phrase items.

**Accessibility.** `<label>` wraps the input with a text description. `aria-describedby` links to the prompt sentence. Incorrect feedback announces via `aria-live="assertive"`. Enter submits. Tab exits to navigation.

**Example.** Skill: `spelling_short_vowel_a`. Prompt: "Type the missing word: The cat sat on the ___." `acceptable_answers: ["mat","hat","bat","rat","flat","map","cap"]`, `case_sensitive: false`, `normalize_whitespace: true`.

#### FIB data shape

```js
{
  question_type: "fib-auto",
  prompt: "The cat sat on the ___.",
  blank_index: 5,             // word position, 0-based; -1 = end of sentence
  acceptable_answers: ["mat", "hat", "bat"],
  case_sensitive: false,
  normalize_whitespace: true,
  audio_prompt: true          // auto-speak prompt in K-2
}
```

---

### Primitive: `per-element-audio`

Not a standalone question type — a behavioral flag applied to any widget. When `audio_per_element: true` is set on a question, every text node and image on the card receives a small orange speaker button. Tapping it speaks that element's text (or `alt` text for images) via the Web Speech API. Default `true` for all K-2 content; default `false` for 2-5 (can be toggled on as accommodation). Implemented in `js/modules/literacy/widgets/audio-primitives.js`.

### Primitive: `self-checking-feedback`

Not a question type — a system layer applied to every widget. On answer submission: correct → green border + ding sound + "+1 Score" counter increment; incorrect → red border + "whoops" sound + attempt counter increment. `attempt_count` is stored per card in session state and included in the per-card answer log for reports. Implemented in `js/modules/literacy/feedback-system.js`.

---

## 3. Stage 2 — Differentiation Widgets

---

### `two-button-binary`

**ID:** `two-button-binary` | **Module:** `js/modules/literacy/widgets/two-button-binary.js`

**What it is.** Two mutually exclusive option buttons (e.g., Capitalize / No Capital, True / False, Real Word / Nonsense Word). Fastest possible mechanic — one tap, instant inline feedback, auto-advance. Ideal for high-volume drill decks (up to 50 cards). From Image 8.

**Skills it suits.** Mechanics (capitalization rules), phonics (real word vs. nonsense word discrimination), grammar (correct / incorrect sentence), phonological awareness (rhyme: yes/no).

**K-2 variant.** Two full-width pill buttons; vivid colors. Auto-speak the word/prompt on card load.

**2-5 variant.** Two compact outlined buttons side-by-side. No auto-speak.

**Accessibility.** `role="radiogroup"` with two `role="radio"` children. Arrow keys switch between the two; Enter selects. `aria-live="polite"` announces result.

**Example.** Skill: `mechanics_capitalization_proper_nouns`. Prompt: "Should this word be capitalized?" Word: "doha". Buttons: Capitalize / No Capital.

---

### `sound-box`

**ID:** `sound-box` | **Module:** `js/modules/literacy/widgets/sound-box.js`

**What it is.** Elkonin sound-box segmenting widget. A row of dashed boxes (one per phoneme) is displayed below the target word image. The student taps a chip and then taps the target box to place it, segmenting the word phoneme by phoneme. Implements the OG/Wilson "say-it-and-move-it" routine digitally. Required for K-2 phonics per ELL/SPED scaffolds (STUDY_NOTES §2).

**Skills it suits.** Phonemic awareness (phoneme segmentation, phoneme counting), phonics (CVC phoneme isolation, onset-rime), spelling preparation, ELL articulation support.

**K-2 variant.** Chips are large colored circles (64 px). Box count equals the phoneme count for the word. Audio plays the whole word on load; each placed chip "pops" with a short sound.

**2-5 variant.** Used only for SPED differentiation; tiles are smaller, multi-syllable words extend to 7 boxes.

**Accessibility.** Each chip has `role="button"`. Each box has `role="cell"` with `aria-label`. Keyboard: Tab to chip, Enter picks it up, arrow keys select target box, Enter drops.

**Example.** Skill: `phonics_phoneme_segment_cvc`. Prompt: "How many sounds does 'map' have? Drag a chip for each sound." 3 boxes displayed.

---

### `build-with-tiles`

**ID:** `build-with-tiles` | **Module:** `js/modules/literacy/widgets/build-with-tiles.js`

**What it is.** Student taps letter or word tiles from a bank and they assemble into an answer row in the order tapped (no physical drag — tap-to-place). Tapping a placed tile returns it to the bank. Submit-gated grading checks the sequence. Implements NWEA's "Click-and-Pop" mechanic (item type 5).

**Skills it suits.** Sight words (build the word from scrambled letters), CVC phonics, sentence building from word bank (writing), spelling, phonological awareness (syllable reassembly).

**K-2 variant.** Large tiles (80×56 px), single-letter focus. Audio speaks the target word on load.

**2-5 variant.** Word-level tiles for sentence construction or morpheme assembly.

**Accessibility.** Tiles are `<button>` elements. Screen reader announces the placement row as a live region. Keyboard: Tab to tile, Enter places it; Tab to a placed tile, Backspace or Delete returns it.

**Example.** Skill: `sight_words_grade1`. Prompt: "Tap the letters in order to spell 'said'." Bank: d · a · s · i · b. Answer row: [_][_][_][_].

---

### `letter-tile-spell`

**ID:** `letter-tile-spell` | **Module:** `js/modules/literacy/widgets/letter-tile-spell.js`

**What it is.** Audio-cued drag-to-spell custom widget (Image 6). A "Play Word" button speaks the target word via TTS. The student drags lettered tiles into ordered slots. Includes a "Hint" button that highlights the first unplaced tile. Grading checks both identity and sequence of placed letters. The standout K-2 phonics/spelling mechanic unique to Literacy Quest.

**Skills it suits.** Phonics (CVC, CCVC, consonant digraphs, blends), phonemic awareness (sound-to-letter mapping), spelling (phonetically regular patterns), ELL orthographic mapping.

**K-2 variant.** Large square tiles (72×72 px), color-coded by consonant vs. vowel (blue vs. orange). 4–6 slots. "Play Word" button is wide and orange. "Hint" is a small lightbulb button.

**2-5 variant.** Smaller tiles, 6–8 slots, used for complex spelling patterns. No color-coding.

**Accessibility.** Drag is keyboard-accessible (same pattern as `dnd-linked`). "Play Word" is `aria-label="Play the target word"`. Each slot is labeled with its position number.

**Example.** Skill: `phonics_consonant_digraph_sh`. Prompt: "Listen to the word and drag the letters to spell it." TTS speaks "ship". Available tiles: s · h · i · p · a · t. Slots: [_][_][_][_].

---

### `word-tagger`

**ID:** `word-tagger` | **Module:** `js/modules/literacy/widgets/word-tagger.js`

**What it is.** Color-coded part-of-speech labeling widget (Image 4, "Grammar Detective"). A sentence is rendered as individual word chips. The student clicks a word chip, then clicks a category button (e.g., Noun, Verb, Adjective) — the word turns the category's color. Can require all words to be tagged, or only a subset. The standout innovation across all example images; enables full sentence-level grammar analysis in one card vs 3 separate MC questions.

**Skills it suits.** Grammar (parts of speech identification — nouns, verbs, adjectives, adverbs, pronouns, prepositions), sentence structure analysis, advanced grammar (RIT 195+), editing for word choice.

**K-2 variant.** Not recommended; replace with `tap-hotspot` for single-word identification. If used at all, limit to 2 categories (noun/verb) with 3–4 word sentences.

**2-5 variant.** Full implementation. Up to 5 categories. Each category button shows its color chip + label. Sentence up to 12 words.

**Accessibility.** Word chips are `<button>` elements. After selecting a word (`aria-pressed="true"`), Tab moves to category buttons. Selecting a category announces "Word tagged as [category]" via `aria-live`. Keyboard: full traversal without mouse.

**Example.** Skill: `grammar_parts_of_speech_mixed`. Prompt: "Tag each word with its part of speech." Sentence: "The quick fox runs silently." Categories: Noun (blue) / Verb (green) / Adjective (orange) / Adverb (purple) / Article (grey).

---

### `hot-text-word`

**ID:** `hot-text-word` | **Module:** `js/modules/literacy/widgets/hot-text-word.js`

**What it is.** A passage rendered as individually selectable word tokens. Student taps/clicks a word to select it as the answer (or all matching words for multi-select variant). Green highlight on selection; Submit-gated. Implements NWEA hot-text at word granularity (item type 3). Derives from `tap-hotspot` but operates on passage text.

**Skills it suits.** Grammar (tap every noun/verb), mechanics (tap the misspelled word), vocabulary (tap the word that best completes the meaning), comprehension (tap the word that shows the character's feeling), phonics (tap every word with the long-e vowel pattern).

**K-2 variant.** Minimum 1.2 rem word font; wide click target per word (padding 4 px horizontal). Max passage 50 words.

**2-5 variant.** Standard 1 rem passage font. Passages up to 300 words; scrollable.

**Accessibility.** Each word span is `role="button"` with `tabindex="0"`. `aria-pressed` reflects selection. Tab order follows reading order.

**Example.** Skill: `mechanics_capitalization_error_detect`. Prompt: "Tap every word that needs a capital letter." Passage: "my friend lives in paris, france."

---

### `hot-text-sentence`

**ID:** `hot-text-sentence` | **Module:** `js/modules/literacy/widgets/hot-text-sentence.js`

**What it is.** Same as `hot-text-word` but sentence-granularity selection. Full sentences highlight on click. Used in comprehension and writing revision tasks.

**Skills it suits.** Comprehension (tap the sentence that states the main idea), writing (tap the sentence that does NOT belong in this paragraph), grammar (tap the sentence that is a fragment).

**Example.** Skill: `comprehension_main_idea_lit`. Prompt: "Tap the sentence that best states the main idea." Passage: 3-paragraph informational text.

---

### `hot-text-paragraph`

**ID:** `hot-text-paragraph` | **Module:** `js/modules/literacy/widgets/hot-text-paragraph.js`

**What it is.** Paragraph-level hot text. Used for RIT 191+ citation tasks and writing revision (select the paragraph that needs a topic sentence). Paragraph numbers shown for citation reference.

**Skills it suits.** Comprehension (select the paragraph that supports the claim), writing (tap the paragraph with the weakest evidence), advanced informational reading (RIT 195+).

**Example.** Skill: `comprehension_text_evidence_info`. Prompt: "Tap the paragraph that BEST supports the answer to: Why do bears hibernate?" Passage: 4-paragraph informational text, numbered.

---

### `drop-down-inline`

**ID:** `drop-down-inline` | **Module:** `js/modules/literacy/widgets/drop-down-inline.js`

**What it is.** A sentence (or multi-sentence passage) containing one or more `<select>` dropdowns inline at `{{slot:N}}` positions. The student chooses the best option from each dropdown. Derived from `dropdown-cloze` at single-slot. Required for Language Usage 2-12. Seen in Image 3's "Drop-down Answer" mechanic.

**Skills it suits.** Grammar (subject-verb agreement, pronoun-antecedent agreement, verb tense), mechanics (choose the correct punctuation mark), writing (select the best transitional word), vocabulary (choose the word that fits context).

**K-2 variant.** Not used.

**2-5 variant.** One or two inline dropdowns per card. `<select>` has `aria-label` matching the slot position. Focused `<select>` is highlighted.

**Accessibility.** Native `<select>` is inherently keyboard-accessible. `aria-label` describes what is being selected. Screen reader reads the surrounding sentence context.

**Example.** Skill: `grammar_subject_verb_agreement`. Prompt: "Choose the correct form: The children [run / runs] to the park." Inline `<select>` at the bracket position.

---

### `sentence-build`

**ID:** `sentence-build` | **Module:** `js/modules/literacy/widgets/sentence-build.js`

**What it is.** Student drags word tiles from a bank into an ordered sentence row. Blank word-shaped slots (dashes) indicate the target sentence length. Grading checks the canonical word order from the `correct_order` array (allows alternative correct orderings if `alternate_orders` is provided). Implements Boom's "Build a Sentence" primitive (Image 2, mechanic 4) and NWEA item type 4.

**Skills it suits.** Writing (sentence construction from a word bank), grammar (unscramble words into a grammatical sentence), syntax (sentence complexity — compound vs. simple), reading fluency (phrase grouping awareness).

**K-2 variant.** 4–5 word tiles, large (72×48 px), color-alternating tiles.

**2-5 variant.** 6–10 word tiles for complex sentences; punctuation tile included.

**Accessibility.** Same keyboard drag pattern as `dnd-linked`. Each word slot is labeled "Position [N]".

**Example.** Skill: `writing_sentence_structure`. Prompt: "Drag the words to build a sentence." Tiles: "quickly · ran · the · fox · away". Slots: [_][_][_][_][_].

---

### `sort-into-bins`

**ID:** `sort-into-bins` | **Module:** `js/modules/literacy/widgets/sort-into-bins.js`

**What it is.** N-column drag-to-categorize widget (2–4 columns/bins). Draggable word or image tiles are sorted into labeled bins. All tiles must be placed before Submit activates. Grading uses `accept_specific` per bin. Derives from `dnd-linked` but with named category bins as the target model.

**Skills it suits.** Phonics (sort by vowel sound: short-a / long-a / other), vocabulary (sort by word category: actions / objects), phonological awareness (sort by syllable count), grammar (sort words: noun / verb / adjective), spelling (sort by pattern: -ight words / -ite words).

**K-2 variant.** 2 bins max. Large tiles. Bin labels read aloud on load.

**2-5 variant.** Up to 4 bins. Tighter tile sizing.

**Accessibility.** Each bin is `role="listbox"` with `aria-label`. Dropped tiles appear in the bin's list, announced by screen reader. Keyboard equivalent as per `dnd-linked`.

**Example.** Skill: `phonics_long_short_vowel_sort`. Prompt: "Sort each word into the correct column." Bins: Short-A / Long-A. Tiles: bat · cake · sad · late · cap · game.

---

### `match-pairs`

**ID:** `match-pairs` | **Module:** `js/modules/literacy/widgets/match-pairs.js`

**What it is.** Two-column matching. Student draws a line (or clicks item A then item B) to connect matching pairs. Used for vocabulary, synonyms, antonyms, definitions, word-image pairs. Mirrors Boom's Matching primitive (Image 2, mechanic 6).

**Skills it suits.** Vocabulary (word ↔ definition, synonym pairs, antonym pairs), phonics (word ↔ picture), grammar (word ↔ part-of-speech label), comprehension (character ↔ action/description).

**K-2 variant.** Image-left / word-right pairs (4 pairs max). Line drawing simplified: click left item, then click right item — a line animates.

**2-5 variant.** Word-left / word-right (up to 6 pairs). Lines styled as thin colored arcs.

**Accessibility.** Keyboard: Tab navigates left-column items; Enter selects one; Tab moves to right column; Enter connects. Selected pair announced as "Matched: [A] with [B]". `aria-live="polite"`.

**Example.** Skill: `vocab_synonyms_grade3`. Prompt: "Match each word to its synonym." Left: happy · angry · tired · large. Right: enormous · furious · joyful · exhausted.

---

### `sequence-events`

**ID:** `sequence-events` | **Module:** `js/modules/literacy/widgets/sequence-events.js`

**What it is.** Student drags numbered event cards into chronological or logical order (1st, 2nd, 3rd...). Numbered position slots are displayed; cards snap into slots. Grading compares to `correct_sequence` array. Mirrors Boom's Sequencing primitive (Image 2, mechanic 7) and NWEA drag-and-drop sequencing.

**Skills it suits.** Comprehension (story event sequencing — beginning / middle / end), informational text (sequence of steps in a process), writing (paragraph organization), grammar (compound sentence part ordering).

**K-2 variant.** 3 events max. Each card can include an image + short caption. Cards are large (140×100 px).

**2-5 variant.** Up to 5 events. Text-only cards allowed.

**Accessibility.** Keyboard drag pattern as per `dnd-linked`. Each slot announces "Position [N]". After submit, correct order is read aloud in sequence via `aria-live`.

**Example.** Skill: `comprehension_story_sequence`. Prompt: "Put the events in the correct order." Cards: "The wolf blew down the house." / "The pig built a house of straw." / "The pig ran to his brother's house."

---

### `dropdown-cloze`

**ID:** `dropdown-cloze` | **Module:** `js/modules/literacy/widgets/dropdown-cloze.js`

**What it is.** A multi-sentence passage with multiple inline `<select>` dropdowns at `{{slot:N}}` positions — the multi-slot extension of `drop-down-inline`. Student fills every slot before Submit activates. Primarily for Language Usage 2-12 editing items. Seen in Image 3.

**Skills it suits.** Grammar (multi-slot agreement and tense correction), mechanics (multiple punctuation decisions in one passage), writing revision (select best word/phrase at each blank), vocabulary in context (choose from confusable pairs: affect/effect, than/then).

**2-5 variant only.** Not used for K-2.

**Accessibility.** Each `<select>` labeled by slot number and surrounding context. Tab order follows reading order through the passage.

**Example.** Skill: `grammar_mixed_errors`. Prompt: "Choose the correct word for each blank." Passage: "The students [was/were] excited when [there/their/they're] teacher announced a field trip."

---

## 4. Stage 3 — High-Value Additions

---

### `open-response-fib`

**ID:** `open-response-fib` | **Module:** `js/modules/literacy/widgets/open-response-fib.js`

**What it is.** An open-ended FIB that cannot be auto-graded — routes to the teacher's manual grading queue. The student types a longer response (sentence, phrase, or multi-word answer). A purple speech bubble badge (`class="pending-grading"`) appears on the report row for this card until the teacher grades it. Partial credit (0 / 0.5 / 1.0) is supported. Differs from `fib-auto` in that no `acceptable_answers` array is used.

**Skills it suits.** Writing (complete the sentence in your own words), reading comprehension (short constructed response — describe in one sentence), vocabulary (write a sentence using the target word), grammar (rewrite the sentence correctly).

**Accessibility.** `<textarea>` with `aria-label`. Character limit shown if set. Submit button activates on any content. No auto-grading feedback — student sees "Submitted! Your teacher will review this."

**Grading queue.** Items aggregate in the teacher dashboard under "Needs Grading." Teacher scores: Correct / Partial / Incorrect. Score is retroactively logged to the session record.

---

### `passage-mc-set`

**ID:** `passage-mc-set` | **Module:** `js/modules/literacy/widgets/passage-mc-set.js`

**What it is.** Item-set widget: one passage displayed persistently while 3–5 `mc-text` items navigate beneath it. Implements NWEA item type 7. The passage is fetched once and cached; items navigate without page reload. Anti-spoiler sequencing is enforced: later items that might reveal answers to earlier items are not shown until earlier items are submitted. Passage includes line numbers and paragraph numbers.

**Skills it suits.** Reading comprehension (all sub-skills: main idea, details, author's purpose, text structure, vocabulary in context), informational text (RIT 180+), literary text analysis (RIT 185+). Dominant format for Reading 2-5.

**K-2 variant.** Not used (K-2 uses single items).

**2-5 variant.** Full implementation. Passage left / items right (split view) or passage top / items below (stacked on mobile).

**Accessibility.** Passage is a scrollable `<article>` with `aria-label="Reading passage"`. Navigation buttons between items are clearly labeled. `aria-live` announces "Question [N] of [N]".

---

### `passage-multi-select`

**ID:** `passage-multi-select` | **Module:** `js/modules/literacy/widgets/passage-multi-select.js`

**What it is.** Item-set variant where items are `mc-multi-select` questions anchored to a shared passage. Same passage-caching and anti-spoiler rules as `passage-mc-set`.

---

### `passage-hot-text`

**ID:** `passage-hot-text` | **Module:** `js/modules/literacy/widgets/passage-hot-text.js`

**What it is.** Item-set variant where items are selectable-text (word, sentence, or paragraph) questions anchored to a shared passage. The passage itself is the interactive element — student selects tokens in the passage rather than choosing from a list. Implements NWEA item type 3 in item-set context.

---

### `claim-evidence`

**ID:** `claim-evidence` | **Module:** `js/modules/literacy/widgets/claim-evidence.js`

**What it is.** Two-part item: Part A is an `mc-text` question (choose the best claim); Part B is `passage-hot-text` (highlight the sentence(s) that best support the chosen claim). Scored as a unit — full credit only if both parts are correct. Implements NWEA's two-part item scoring rule.

**Skills it suits.** Reading comprehension (evidence-based claims), informational text analysis (RIT 195+), literary analysis (author's purpose + textual support), argument writing preparation.

---

### `tap-to-reveal`

**ID:** `tap-to-reveal` | **Module:** `js/modules/literacy/widgets/tap-to-reveal.js`

**What it is.** A mystery-picture engagement layer. An image is hidden behind tiled cover squares; each correct answer on a preceding set of cards reveals one tile. After all tiles are cleared, the full image is shown with a celebration animation. Not a standalone question type — it wraps another mechanic. Implements Boom's Tap-to-Reveal / mystery picture pattern. No scored answer; used as a motivational reward layer.

---

### `chain-images`

**ID:** `chain-images` | **Module:** `js/modules/literacy/widgets/chain-images.js`

**What it is.** An image element linked to a sequence of subsequent images that cycle on tap. Used for letter formation stroke-order demonstrations, step-by-step process visuals, and phoneme mouth-position diagrams. Not scored; lesson-card format.

**Skills it suits.** Phonics (letter formation, mouth articulation diagrams), handwriting, phonological awareness (step-by-step segmentation), phonics (digraph formation).

---

## 5. Stage 4 — Differentiators

---

### `ai-assisted-short-answer`

**ID:** `ai-assisted-short-answer` | **Module:** `js/modules/literacy/widgets/ai-assisted-short-answer.js` *(future)*

**What it is.** An extended open-response text input where the student writes a paragraph-length answer. The response is sent to a teacher-defined AI rubric for preliminary scoring (0–4 scale with rationale). The teacher reviews the AI score + rationale and confirms or overrides. Surpasses Boom's manual queue by providing AI-assisted rubric alignment. Requires a server-side AI endpoint (out of scope until server infrastructure is confirmed).

**Note.** Do not build until server-side AI endpoint and data residency policy are confirmed.

---

### `ink-draw`

**ID:** `ink-draw` | **Module:** `js/modules/literacy/widgets/ink-draw.js` *(future)*

**What it is.** A free-draw `<canvas>` overlay on the card. Student can trace letters, draw editing marks, underline phrases, or illustrate a response. Always manual-graded (purple speech bubble). Routes to the same Needs Grading queue as `open-response-fib`.

**Note.** Voice Memo is dropped per PHASE_0_DECISIONS.md. `ink-draw` is the only remaining Stage 4 widget requiring manual grading.

---

## 6. Pedagogical-by-Mechanic Cross-Reference Matrix

Rows = ELA domains. Columns = question type IDs (abbreviated). Use this as the deck-creation lookup.

Legend: **P** = Primary (build first for this domain) · **S** = Secondary · **R** = Rarely used · *(blank)* = Not applicable.

| Domain | mc-text | mc-image | mc-multi | tap-hs | dnd-linked | fib-auto | 2btn-bin | sound-box | build-tiles | ltr-tile | word-tagger | hw-word | hw-sent | hw-para | dd-inline | sent-build | sort-bins | match-pairs | seq-evts | dd-cloze | open-fib | passage-mc | claim-ev |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Phonemic Awareness** | S | P | | P | S | R | S | P | | | | | | | | | S | | S | | | | |
| **Phonics** | S | P | | P | P | S | S | P | S | P | | P | | | | | P | | | | | | |
| **Sight Words** | S | P | | P | P | P | S | | P | P | | P | | | | | | | | | | | |
| **Vocabulary** | P | S | S | S | S | S | | | | | | P | | | S | | P | P | | S | S | S | |
| **Fluency** | | | | | S | | | | | | | | | | | P | | | S | | | | |
| **Comprehension — Lit** | P | S | P | S | S | R | | | | | | P | P | S | | | S | S | P | | S | P | P |
| **Comprehension — Info** | P | | P | S | S | R | | | | | | P | P | P | | | S | | P | | S | P | P |
| **Grammar** | P | | P | P | S | S | R | | | | P | P | S | | P | P | P | S | | P | R | | |
| **Mechanics** | P | | S | P | | P | P | | | | | P | | | P | | S | | | P | R | | |
| **Spelling** | S | | | S | P | P | R | P | P | P | | P | | | | | P | | | | | | |
| **Writing** | S | | S | | P | P | | | | | | | P | | P | P | S | | P | P | P | | S |

*(hw = hot-text, dd = drop-down, sent = sentence, seq-evts = sequence-events, ltr-tile = letter-tile-spell, 2btn-bin = two-button-binary)*

---

## 7. K-2 vs 2-5 Design Rules

| Property | K-2 | 2-5 |
|---|---|---|
| **Answer-choice count** | 3 max (2 for RIT < 141) | 4, in 2×2 grid |
| **Button style** | Vivid solid pill, bold white text, 56 px min-height | Outlined rounded-rectangle, white fill, dark text |
| **Button colors** | Blue · Green · Purple · Orange | Neutral with thin 2 px colored border |
| **Audio button** | Wide, orange, equal prominence to answer buttons; auto-speaks on card load | Small inline speaker icon; no auto-speak |
| **Font size — stem** | 1.3 rem min | 1.1 rem |
| **Font size — choices** | 1.1 rem, bold | 1.0 rem |
| **Tile size (drag)** | 80×56 px min; large squares for letters | 44 px height standard chips |
| **Tap target min** | 60×60 px | 44×44 px |
| **Passage length** | 30–100 words max | Up to 400 words |
| **Chrome** | Score pill, question counter, wide Previous/Next; no item set navigation | Score pill, question counter, item-set navigation (passage-mc-set), inline audio optional |
| **Feedback** | Inline color-swap + spoken feedback via TTS | Inline color-swap only; no audio feedback by default |
| **Image use** | Required for answer choices where possible | Optional; text-only choices acceptable |
| **Confirmation step** | Yes — "Are you sure?" before final submit on any multi-item set | No |

---

## 8. Accessibility Primitives Shared Across All Widgets

Every widget module must implement or inherit these primitives.

### Keyboard Navigation
- All interactive elements reachable by Tab / Shift+Tab in DOM order.
- Drag interactions have keyboard equivalents: Tab to item → arrow keys to move → Enter to drop.
- Enter or Space activates buttons and selects options.
- Escape cancels a drag in progress and returns the tile to its origin.

### Screen Reader Announcements
- `aria-live="polite"` on feedback zones; `aria-live="assertive"` for correct/incorrect outcomes.
- `aria-pressed` on toggle-style buttons; `aria-checked` on radio/checkbox-style choices.
- `role="group"` with `aria-labelledby` on any choice set.
- DOM order matches visual reading order (no `tabindex > 1`).

### Alt Text
- Every `<img>` carries a non-empty `alt` attribute.
- Decorative images use `alt=""` and `role="presentation"`.
- Answer-choice images: `alt` = the word/concept the image represents (not a description).

### One-Tap Audio Affordance (Web Speech API)
- Implemented via the shared `speakText(text, rate)` function in `js/modules/shared/quest-core/hints-speech.js`.
- K-2: audio auto-speaks the stem on card load (`audio_per_element: true` default).
- 2-5: audio is a per-element tap affordance; does not auto-speak.
- Voice warming (pre-speak empty string) called once per session to prevent stall on first use.

### OpenDyslexic Font Toggle
- CSS class `font-dyslexic` on `<html>` swaps `font-family` to `OpenDyslexic, Arial, sans-serif` (loaded via CDN).
- Toggled by a persistent button in the session chrome. Persisted in localStorage key `lq_font_dyslexic`.

### High-Contrast Theme
- CSS variable set `--lq-hc-*` applied via class `theme-high-contrast` on `<html>`.
- Toggled in settings panel. Persisted in localStorage `lq_high_contrast`.

### Line Reader
- A semi-opaque horizontal mask that the student can position over the passage to isolate one line at a time.
- Draggable vertically; arrow keys move it one line up/down. Toggle on/off from session chrome.
- Especially valuable for K-2 and ELL passage reading.

### Font Scaling
- Four levels: 50 % / 100 % (default) / 150 % / 200 %. Applied as `font-size` on `:root` via CSS variable `--lq-font-scale`.
- Controlled from a settings button in session chrome. Persisted in localStorage `lq_font_scale`.

---

## 9. Boom Limitations to Surpass — Implementation Notes Per Widget

### FIB case-sensitivity and any-of matching (`fib-auto`)

Boom's FIB requires ALL listed answers to be satisfied. Literacy Quest uses any-one-of. The question data shape:

```js
{
  acceptable_answers: ["colour", "color"],  // any one of these is correct
  case_sensitive: false,                    // "Colour" == "colour"
  normalize_whitespace: true               // leading/trailing space stripped
}
```

`checkFibAuto()` runs `normalizeText(input)` (strips whitespace), applies `toLowerCase()` if `case_sensitive: false`, then checks `acceptable_answers.some(a => normalizeText(a) === normalized_input)`.

### Manual grading queue for `open-response-fib` and `ink-draw`

When a card uses `open-response-fib` or `ink-draw`, the session record flags that card as `grading_status: "pending"`. In the teacher dashboard, a "Needs Grading" section shows all cards with `grading_status: "pending"` from the current session, each with the purple speech bubble badge (`class="pending-grading"` per the Boom pattern). Teacher clicks to review, then selects Correct / Partial / Incorrect:

```js
{
  card_id: "card_042",
  question_type: "open-response-fib",
  student_response: "The fox wanted to find food for winter.",
  grading_status: "pending",   // → "graded" after teacher reviews
  teacher_score: null,         // → 0 | 0.5 | 1.0
  points_possible: 1
}
```

Because Literacy Quest is anonymous (no roster — PHASE_0_DECISIONS §7), the "Needs Grading" queue is scoped to the current browser session. There is no cross-student aggregation unless a login/roster system is added in a future phase.

---

## 10. The Variety Rule — Applied Examples

The deck-composition rule requires ≥ 3 distinct mechanics for any 10-card skill deck unless it is an explicit fluency drill (repetition is intentional in that mode).

### `phonics_short_a_initial` (Phonics · K-1)

```js
question_types: ["mc-image", "letter-tile-spell", "sort-into-bins", "sound-box", "mc-audio"]
```

- Cards 1-3: `mc-image` — tap the picture that starts with /æ/.
- Cards 4-5: `sound-box` — segment "ant", "apple", "ax" into phoneme boxes.
- Cards 6-7: `letter-tile-spell` — hear the word, drag letters to spell it.
- Cards 8-9: `sort-into-bins` — sort pictures: starts with /æ/ / does not start with /æ/.
- Card 10: `mc-image` — cumulative review.

---

### `sight_words_grade1_dolch` (Sight Words · Grade 1)

```js
question_types: ["tap-hotspot", "build-with-tiles", "fib-auto", "mc-text"]
```

- Cards 1-3: `tap-hotspot` — tap the word "said" from a group of 4 words.
- Cards 4-5: `build-with-tiles` — tap letters in order to build the sight word.
- Cards 6-7: `fib-auto` — complete the sentence with the sight word.
- Cards 8-10: `mc-text` — choose the correctly spelled sight word.

---

### `vocab_synonyms_grade3` (Vocabulary · Grade 3)

```js
question_types: ["mc-text", "match-pairs", "sort-into-bins", "fib-auto"]
```

- Cards 1-3: `mc-text` — choose the synonym from 4 options.
- Cards 4-5: `match-pairs` — match 4 word pairs by meaning.
- Cards 6-7: `sort-into-bins` — sort words: positive connotation / negative connotation.
- Cards 8-10: `fib-auto` — fill in the sentence with the correct synonym.

---

### `grammar_parts_of_speech_grade4` (Grammar · Grade 4)

```js
question_types: ["word-tagger", "mc-multi-select", "hot-text-word", "sort-into-bins"]
```

- Cards 1-3: `word-tagger` — tag all words in the sentence by POS.
- Cards 4-5: `mc-multi-select` — select all the adjectives in the word list.
- Cards 6-7: `hot-text-word` — tap every verb in the passage.
- Cards 8-10: `sort-into-bins` — sort words: Noun / Verb / Adjective / Adverb.

---

### `comprehension_main_idea_informational_grade3` (Comprehension · Grade 3)

```js
question_types: ["passage-mc-set", "hot-text-sentence", "mc-multi-select", "sequence-events"]
```

- Cards 1-4: `passage-mc-set` — 4 MC items anchored to a 150-word informational passage.
- Cards 5-6: `hot-text-sentence` — tap the sentence that states the main idea.
- Cards 7-8: `mc-multi-select` — select all supporting details.
- Cards 9-10: `sequence-events` — put 3 key events in order.

---

## 11. Naming Conventions

| Context | Convention | Example |
|---|---|---|
| **question_type ID** (in data, routing, JSON) | kebab-case | `mc-text`, `letter-tile-spell`, `drop-down-inline` |
| **JS export name** (function exported from module) | camelCase | `renderMcText`, `checkLetterTileSpell`, `renderDropDownInline` |
| **"Component" label** (conceptual diagrams, comments only) | PascalCase | `McText`, `LetterTileSpell`, `DropDownInline` |
| **Module file path** | kebab-case `.js` | `js/modules/literacy/widgets/mc-text.js` |
| **CSS class names** | kebab-case with `lq-` prefix | `lq-mc-text`, `lq-word-tagger-chip` |
| **State / data keys** | camelCase | `questionType`, `acceptableAnswers`, `caseSensitive` |

Note: Literacy Quest uses vanilla JS ES modules, not React. The PascalCase "component name" convention is documentation shorthand only — it does not imply a framework.
