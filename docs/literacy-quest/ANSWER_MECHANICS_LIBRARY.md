# Literacy Quest — Answer Mechanics Library

A comprehensive, pedagogy-tagged catalog of every answer mechanic Literacy Quest uses or could use. Reference this file when:

- Designing a new generator: pick the mechanic that best assesses the *underlying* skill, not the most convenient one. Default to mc-text only for items where multiple-choice is the genuine match.
- Enforcing the **Variety Rule**: across a 10-card deck, no single mechanic should appear more than 3× in a row, and at least 4 distinct mechanics should be used.
- Adding a new widget: avoid duplicates by checking the catalog first; many "new" ideas reduce to existing widgets with different content.

Sources: NWEA MAP item-type taxonomy, IXL interactive types, Boom Learning task cards, Khan Academy Kids, Lexia Core5, Reading Plus, Explode the Code (EPS), UFLI Foundations, Heggerty PA, IXL standards items, EBLI (Evidence-Based Literacy Instruction), and the four design-document example images (Image 11–14, in `Tim's Documents/Literacy Quest/Design Documents/`).

Hard rule: **every mechanic listed here must produce a 100% auto-gradable result** (the core constraint of Literacy Quest). Mechanics that need teacher review are listed in §10 with `auto_gradable: false` and are excluded from generators.

---

## How this catalog is organized

Mechanics are grouped by the *cognitive action* the student performs. Within each group, the table columns are:

| Column | Meaning |
|---|---|
| **Mechanic** | Canonical name (kebab-case for widgets, plain for input modes). |
| **Widget** | Existing `LITERACY_WIDGETS` entry that implements it, or `[proposed]` if not yet built. |
| **Cognitive load** | low / medium / high — how much working-memory the mechanic itself consumes (separate from the content). Used to balance scaffolding for ELL/SPED. |
| **Best for** | Skill types this mechanic is the genuine match for. |
| **Avoid for** | Skill types where this mechanic is a poor fit (despite being technically possible). |
| **Auto-grade** | yes / partial / no. `partial` means the mechanic auto-grades a sub-component (e.g., word selection) but leaves another (e.g., explanation) ungraded — Literacy Quest only ships `yes`. |
| **Variety bucket** | The bucket the Variety Rule uses; mechanics in the same bucket count as one for variety purposes. |

Variety buckets: **SELECT**, **HIGHLIGHT**, **DRAG**, **SORT**, **MATCH**, **TYPE**, **SEQUENCE**, **CONSTRUCT**, **AUDIO**, **TIMED**.

---

## 1. Selection mechanics — point at the right answer (variety bucket: SELECT)

Cognitive baseline. The student chooses 1 or more options from a closed set. Lowest cognitive load; highest accessibility for ELL / pre-readers when paired with audio.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **mc-text** | `mc-text` | low | Definitions, classifications, single-best-answer items where 4 short text options are sufficient (theme, author's purpose, tone, sentence type). | Tasks where reading the options *is* the assessment (defeats the purpose). | yes |
| **mc-image** | `mc-image` | low | Pre-reader items: "Which picture starts with /m/?", "Which picture is the cat?". | Skills where picture interpretation is ambiguous (abstract concepts, idioms). | yes |
| **mc-audio** | `mc-audio` | low | Listening discrimination: "Which word did you hear?", phoneme isolation. | Atoms where the audio is too long to replay quickly. | yes |
| **mc-mixed** | `mc-text` w/ images embedded | low | Vocab in context with picture distractors, syllable matching. | Pure-text comprehension. | yes |
| **mc-multi-select** | `mc-multi-select` | medium | "Pick the **two** supporting details", "Pick all the nouns", "Which of these are facts?". | Single-answer MC (use mc-text instead — multi-select forces students to second-guess). | yes |
| **two-button-binary** | `two-button-binary` | very low | Yes/No, Fact/Opinion, Real-word/Nonsense, Rhymes/Doesn't, Complete/Fragment, Same/Different. | Skills with >2 categories (use sort-into-bins instead). | yes |
| **n-way-binary** | [proposed] | low | 3-way classifications: declarative/interrogative/exclamatory. Currently use mc-text 3-option. | Pure binary. | yes |
| **likert-confidence** | [proposed] | low | After-answer confidence rating: "How sure were you?" 1–5. Used for diagnostic, not scored. | Primary assessment. | n/a |

---

## 2. Tap-to-find mechanics — point at the target inside content (variety bucket: HIGHLIGHT)

The student selects a *region of the content itself*, not an external option. Stronger evidence of decoding/finding skill than passive MC.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **tap-hotspot** | `tap-hotspot` | low | "Tap the picture that starts with /b/", "Tap the silent letter", "Tap the digraph in this word", initial-sound match for primers. | Long passages (use hot-text-word instead — better screen handling). | yes |
| **hot-text-word** | shared `hot-text-passage.js` w/ `granularity: 'word'` | medium | "Highlight every word with the short-a sound", "Tap each adjective", word-level evidence selection. | When the *count* of correct words is tiny (1) — use tap-hotspot instead. | yes |
| **hot-text-sentence** | same w/ `granularity: 'sentence'` | medium | "Highlight the sentence that states the main idea", "Tap the sentence that gives the strongest evidence", citing-evidence atoms. | Word-level patterns. | yes |
| **hot-text-paragraph** | same w/ `granularity: 'paragraph'` | medium | "Tap the paragraph that introduces the problem", text-structure analysis. | Single-paragraph passages. | yes |
| **x-strikethrough-choice** | `x-strikethrough-choice` | low | EPS-authentic "X out the wrong word/picture/sentence" — Books 1–8 use it on every page. Strong negative-evidence signal. | When 'wrong' is ambiguous (better to ask 'right'). | yes |
| **word-tagger** | `word-tagger` | medium | Tag each word with its part of speech (color-coded chips). Strongest grammar-ID signal. | Unambiguous single-tag (use tap-hotspot). | yes |
| **picture-match-row** | `picture-match-row` | low | EPS Primer-style "Circle the picture in this row that begins with /b/" — 3 pictures across, choose 1 per row. | Long passages. | yes |
| **circle-the-target** | [proposed: shape-overlay] | medium | EPS-authentic 'circle' response — same data shape as tap-hotspot but renders a circle overlay. | Skip if tap-hotspot already covers the case. | yes |
| **underline-pattern** | [proposed; subset of word-tagger] | medium | Underline every digraph in the sentence. | When multi-tag (use word-tagger). | yes |

---

## 3. Drag-and-drop mechanics (variety bucket: DRAG)

Higher cognitive load but powerful for tactile / kinesthetic learners. Critical for SPED / OT-aligned populations.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **dnd-linked** | `dnd-linked` | medium | 1-to-1 link from pool to slot: drag a sound to its grapheme, drag a definition to a word, drag a label to a diagram region. | Many-to-many or 1-to-many. | yes |
| **drop-down-inline** | `drop-down-inline` | low | Closed-set cloze: "Mary _____ to the store." → [go / goes / going / gone]. Lower kinesthetic cost than drag. | When the pool is large (>5) — UI breaks. | yes |
| **fill-in-cloze-bank** | [proposed: drag variant of drop-down-inline] | medium | Same task as drop-down-inline but with kinesthetic drag — more engaging for K-2. | Single-blank items. | yes |
| **label-the-diagram** | [proposed] | medium | Drag labels onto image regions. Useful for syllable-type diagrams, story-mountain plot diagrams. | Items without a diagram. | yes |
| **timeline-place** | [proposed] | medium | Drag events onto a horizontal timeline (Sequence of Events with absolute positions). | Cause/effect (logical, not temporal). | yes |
| **venn-sort** | [proposed: 3-region sort] | high | Compare/contrast: drag items into "X only" / "Y only" / "Both" regions. | Single-category sort (use sort-into-bins). | yes |
| **tree-fill** | [proposed] | high | Drag morphemes onto a word-tree (root + prefix + suffix slots). | When the structure is flat. | yes |

---

## 4. Sort mechanics (variety bucket: SORT)

Categorization. The student moves items into 2+ named bins.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **sort-into-bins** | `sort-into-bins` | medium | "Sort by short-a vs short-i", "Common vs proper noun", "Fact vs opinion", "Past vs present tense", divisible/not-divisible style. | When item placement is gradient (use likert). | yes |
| **divisibility-sort** | [reuses sort-into-bins; math-side ref] | medium | Already in math; pattern is the canonical 2-bin sort. | n/a (math). | yes |
| **3-bin-sort** | [proposed: parameterized sort-into-bins] | high | "Sort into noun / verb / adjective". | Use 4+ bins only with audio support. | yes |

---

## 5. Match mechanics (variety bucket: MATCH)

Pair items 1-to-1.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **match-pairs** | `match-pairs` | medium | Word ↔ definition, picture ↔ word, synonyms, prefix ↔ meaning, cause ↔ effect, phoneme ↔ grapheme. | When the items aren't paired (use sort instead). | yes |
| **memory-pairs** | [proposed: face-down match-pairs] | high | Engaging review of known pairs (sight words ↔ pictures); slower but more durable retention. | First-exposure introduction. | yes |
| **heading-match** | [proposed: variant of match-pairs] | medium | Match each heading to the paragraph it describes (text-structure assessment). | Single-paragraph passages. | yes |

---

## 6. Type / spell mechanics (variety bucket: TYPE)

Free-text entry, auto-graded against a closed set of accepted_answers.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **fib-auto** | `fib-auto` | medium | Single fill-in-blank with a small known answer set: "The plural of *fox* is _____". | Open-ended sentence construction. | yes (with accepted_answers) |
| **fib-multi** | [proposed: fib-auto array] | high | Multi-blank cloze. | Single-blank items. | yes |
| **column-letter-build** | `column-letter-build` | medium | EPS Book 1+ "Spell. Write." — pick one letter per column to build a CVC word. Tactile decoding. | Words >5 letters. | yes |
| **letter-tile-spell** | `letter-tile-spell` | medium | Drag letter tiles to spell from audio prompt. SPED-friendly alternative to typing. | Long words. | yes |
| **anagram-build** | [proposed] | medium | Unscramble letters to form a target word. | When letter order is the assessment focus (use column-letter-build). | yes |
| **crossword** | [proposed; pixel-grid] | high | Phonics review crossword (Books 7+ in EPS). | K-1. | yes |
| **word-search** | [proposed; grid scan] | medium | "Find every short-a word in the grid". Lexia-style. | When time is a factor (use code-fluency-timer instead). | yes |
| **spell-from-audio** | [proposed: combo of mc-audio + fib-auto] | high | Heggerty / dictation-style: hear the word, type it. | Pre-readers. | yes |
| **type-the-rhyme** | [proposed: fib-auto with rhyme corpus] | high | Generate a word that rhymes — closed corpus (rhyme set). | Open creative response. | yes |

---

## 7. Sequence / order mechanics (variety bucket: SEQUENCE)

Establish a correct order — temporal, logical, or grammatical.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **sequence-events** | `sequence-events` | medium | Story sequence (beginning/middle/end), instructional steps. | Word order within a sentence (use sentence-build). | yes |
| **sentence-build** | `sentence-build` | medium | Drag word tiles to build a grammatically correct sentence. | When word choice (not order) is the focus. | yes |
| **paragraph-order** | [proposed; variant of sequence-events] | high | Order the paragraphs of a passage. Text-structure deep-dive. | Single-paragraph items. | yes |
| **word-chain** | `word-chain` | medium | UFLI HomePractice chains: change one letter to make a new word, walk the chain. | Static items. | yes |
| **rebuild-broken-sentence** | [proposed: shuffled sentence-build] | medium | Sentence is shown shuffled; student reconstructs. | When original isn't shown (use construct mechanics). | yes |

---

## 8. Construct mechanics (variety bucket: CONSTRUCT)

Build a correct artifact (sentence, word, segmented sound) from primitives. Higher level than sequence — student produces, not just orders.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **sound-box** | `sound-box` | medium | Phoneme segmentation: "Push a chip into each box for each sound in *cat*". Heggerty / Elkonin-box authentic. | Words >4 phonemes. | yes |
| **word-build-from-sounds** | [proposed; combo of sound-box + letter-tile] | high | After segmenting, spell each phoneme. | Pre-segmenting students. | yes |
| **word-picture-choice** | `word-picture-choice` | low | EPS Primer matching: "Tap the word that names the picture." | Multi-word phrases. | yes |
| **picture-to-word-spell** | [proposed; fib-auto + image] | medium | Look at picture, type the word. | Pre-readers (use word-picture-choice). | yes |

---

## 9. Audio / listening mechanics (variety bucket: AUDIO)

Aural input replaces or supplements visual.

| Mechanic | Widget | Cognitive load | Best for | Avoid for | Auto-grade |
|---|---|---|---|---|---|
| **mc-audio** | `mc-audio` | low | "Which word starts with /m/?" with audio-only options. | Print-anchored skills. | yes |
| **listen-and-pick-image** | [proposed: mc-audio variant w/ images] | low | Pre-reader audio comprehension. | Adv. readers. | yes |
| **listen-segment** | [proposed: sound-box driven by audio] | medium | Hear a word, push chips for each sound. | Pre-PA students. | yes |
| **rhyme-from-audio** | [proposed: mc-audio + closed rhyme set] | medium | Heggerty rhyme. | Open generation. | yes |

---

## 10. Mechanics excluded from Literacy Quest (for the record)

These appear in some references (and in a few of our widget files) but **violate the auto-grading hard constraint**. Listed here so future contributors know why we don't ship them.

| Mechanic | Widget | Reason excluded |
|---|---|---|
| **voice-memo** | `voice-memo` | Recording is captured but no auto-transcription / fluency-WCPM scoring. Useful for self-listen only; not a graded answer. |
| **write-from-picture** | `write-from-picture` | Free-text canvas: open-ended sentences. No deterministic grade. |
| **draw-the-picture** | (none — EPS Books) | Drawing canvas; subjective. |
| **think-about-it / open-response** | (none) | BTC's "Think About It!" inferential write — needs teacher review. |
| **handwriting-trace** | (none) | Stroke-order detection is auto, but pedagogical value is in formation, not correctness. Keep for math but not as a graded literacy mechanic. |
| **explain-your-thinking** | (none) | Constructed-response. |
| **summarize-in-your-own-words** | (none) | Constructed-response. Replace with mc-text 4-option summary. |
| **use-this-word-in-a-sentence** | (none) | Constructed-response. Replace with sentence-build (closed). |

---

## 11. Time-/format-based variants (variety bucket: TIMED)

These wrap any base mechanic in a different presentation context. Useful for fluency/automaticity skills.

| Variant | Wraps | Pedagogical purpose |
|---|---|---|
| **timed-mc** | mc-text | Word-recognition fluency (Code Fluency Timer in EPS Image 11). Deck advances on correct or timeout. |
| **race-format** | any select | Two-student head-to-head (or vs. CPU); same items, faster wins. |
| **boss-battle** | any select | Health-bar gamification on the same item bank — purely UX wrapper. |
| **infinity-mode** | any select | 3-min unlimited round; tracks total correct. |
| **spaced-review** | any select | Items pulled from Leitner boxes (already in `gamification.js`). |
| **branched-on-error** | any select | Wrong answer routes to a scaffolded re-teach card before re-trying. |

---

## 12. Mapping the design-document image legends to this catalog

The four design-document images (`Tim's Documents/Literacy Quest/Design Documents/Example Image 11–14.png`) show explicit "Ways to Interact" footers per card. Every footer maps to a mechanic in this catalog:

| Image-footer label | Catalog mechanic | Variety bucket |
|---|---|---|
| Multiple Choice | mc-text / mc-image / mc-audio | SELECT |
| Multiple Select | mc-multi-select | SELECT |
| Tap & Select | tap-hotspot / two-button-binary | SELECT / HIGHLIGHT |
| Pick from Choices | mc-text | SELECT |
| Yes/No | two-button-binary | SELECT |
| Highlight | hot-text-word / hot-text-sentence / word-tagger | HIGHLIGHT |
| Sort | sort-into-bins | SORT |
| Drag and Drop | dnd-linked | DRAG |
| Pick & Drop / Click & Drop | dnd-linked / drop-down-inline | DRAG |
| Match | match-pairs | MATCH |
| Sequence | sequence-events | SEQUENCE |
| Reorder | sentence-build | SEQUENCE |
| Type | fib-auto | TYPE |
| Type & Spell | column-letter-build / letter-tile-spell | TYPE |
| Fill in Blank | drop-down-inline (closed) / fib-auto (open) | DRAG / TYPE |
| Audio | mc-audio | AUDIO |
| Audio Match | mc-audio + match-pairs | AUDIO + MATCH |
| Listen and Repeat | (excluded — voice-memo, no auto-grade) | — |

---

## 13. The Variety Rule (enforcement)

Every generator's `buildXxxDeck(skillAtom, count, options)` must respect:

1. **Per-deck variety**: across `count` cards, use **at least 4 distinct variety buckets** (or all available buckets if the atom has fewer than 4 in `question_types`).
2. **Sliding-window**: no single mechanic appears more than **3× in any rolling window of 4 cards**.
3. **No mc-text dominance**: at most **50%** of cards may be plain `mc-text`. The rest must use other mechanics from the atom's `question_types` list.
4. **Pedagogical fit overrides variety**: if an atom's skill genuinely demands one mechanic (e.g., sequence-of-events demands `sequence-events`), variety can drop to 1 bucket. Document the exception in a code comment.

The existing fluency / phonemic-awareness / phonics generators already implement a 3-window slide. Apply the bucket-distinct check on top.

---

## 14. Roadmap — proposed mechanics worth building next

Ordered by pedagogical ROI ÷ implementation cost:

1. **`venn-sort`** (compare/contrast) — high ROI for comprehension. Wraps `sort-into-bins` with 3-region UI. **Est: 1 day.**
2. **`label-the-diagram`** (syllable-type diagrams, parts-of-speech tree) — wraps `dnd-linked` with image-anchored slots. **Est: 1 day.**
3. **`paragraph-order`** (text structure) — wraps `sequence-events` with paragraph chunks. **Est: 0.5 day.**
4. **`spell-from-audio`** (Heggerty dictation) — combo of `mc-audio` + `fib-auto`. **Est: 0.5 day.**
5. **`anagram-build`** (sight-word spelling review) — wraps `letter-tile-spell`. **Est: 0.5 day.**
6. **`heading-match`** (informational comprehension) — wraps `match-pairs`. **Est: 0.5 day.**
7. **`word-search`** (Lexia-style review) — new grid widget. **Est: 2 days.**
8. **`crossword`** (Books 7+ EPS) — new grid widget. **Est: 3 days.**
9. **`memory-pairs`** (face-down match) — wraps `match-pairs`. **Est: 1 day.**
10. **`timeline-place`** (sequence with positions) — new component. **Est: 2 days.**

Stop when fewer than 80% of new atoms genuinely benefit; mechanic count is not a goal in itself.
