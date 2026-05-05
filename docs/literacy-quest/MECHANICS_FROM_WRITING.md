# Writing-Book Mechanics — Research Findings

Mined from (text-bearing PDFs in `Tim's Documents/Literacy Quest/Litearcy Resource Materials/Writing Books/`):

- Spectrum Language Arts Workbook K (5,491 lines extracted)
- Spectrum Language Arts Workbook 1 (6,896)
- Spectrum Language Arts Workbook 2 (8,805)
- Spectrum Language Arts Workbook 3 / "Spectrum Language Arts 3" (8,459 / 8,116)
- Spectrum Language Arts Workbook 4 (9,631)
- Spectrum Language Arts Workbook 6 (8,544)
- Spectrum Writing 2 / Workbook 1 / Workbook 2 (2,265 / 1,720 / 2,265)
- Reading Comprehension Grade 3 (Scholastic) (1,490)
- Read and Understand Grade 3 (cross-reference, 6,715)

Hard rule observed: every mechanic below produces a 100% auto-gradable result. The Spectrum Writing series is dominated by open-response prompts ("Write your own story", "Now write a paragraph...") — for each one I encountered, a closed-form auto-gradable equivalent is proposed in the final section.

---

## Mechanics already in library (confirmed in writing books)

The following catalog entries are already a tight match for items I found:

- **mc-text** — Spectrum LA 6 §1.32 "Which sentence would make the best topic sentence?" (a/b/c); LA 6 §1.32 "Which is most likely from a persuasive paragraph?"; LA 4 review "Which is the best title?"
- **two-button-binary** — Spectrum LA 4 §1.16 (Complete sentence vs. Sentence Fragment, write C or F); Spectrum Writing 2 §3.1 "Fact / Opinion: write F or O".
- **n-way-binary** — Spectrum LA 6 §1.18 "Coordinate / Correlative / Subordinate" three-way classification (CD / CR / S); Spectrum LA 4 review "F / RO / C" (Fragment, Run-On, Complete).
- **hot-text-word** — Spectrum LA every chapter "Circle the verbs / nouns / pronouns / adjectives / adverbs / prepositions in this paragraph"; "Circle the linking words"; "Circle the helping verbs and underline the main verbs".
- **hot-text-sentence** — Reading Comp G3 "What a Nose!": "Find the sentence that is the main idea (M.I.) and the details (D); two sentences do NOT belong — leave those blank." This is hot-text-sentence with a multi-select.
- **sort-into-bins** — Spectrum LA 4 review "Common vs. Proper noun" two-bin sort; "Adjective / Adverb / Preposition / Article" multi-bin sort.
- **match-pairs** — Spectrum LA 3 §2.6 "Match the abbreviation: Oct. 2 ↔ a. Oct. 2 b. Octob. 2"; LA 6 §1.31 "Match the combined sentence to the part-of-speech that was combined".
- **drop-down-inline** — Spectrum LA 1–4 every "Complete It" exercise: "__________ wanted us to research" with pronoun bank `[I, you, he, she, We, They, His, Her]`; LA 4 §1.4 helping-verb cloze with closed bank `[is, are, have, will, had, were]`.
- **fib-auto** — Spectrum LA 4 §1.3 "Write the verb from each sentence on the lines" with deterministic single answer; LA 3 §3 plural-form cloze.
- **sentence-build** — Spectrum LA 6 review "Rewrite the exclamatory sentence as an imperative"; Reading Comp G3 "Wagon Train" — *"wagon dangerous on a Life hard and was train"* unscramble.
- **word-tagger** — Spectrum LA 6 §1.6 "Identify articles (A), adjectives (ADJ), adverbs (ADV), conjunctions (C), prepositions (P) in this paragraph; write the abbreviation next to each word".
- **sequence-events** — Spectrum Writing 2 §1.8 "Label the pictures: First / Next / Last".
- **x-strikethrough-choice** — Spectrum LA K "Cross out lowercase letters"; Spectrum LA 3 §2.6 "Cross out words that can be abbreviated".

Confirms that ~70 % of the closed-form items in writing books reduce to mechanics already in §1–§9 of the library. The remainder are listed below.

---

## NEW mechanics proposed

### N1. best-topic-sentence-pick

- **Source**: Spectrum LA 6 §1.32, problem 3 — *"Which sentence would make the best topic sentence? a) Babe Ruth's given name was George Herman Ruth. b) Babe Ruth is one of the greatest athletes in the history of baseball. c) Babe Ruth joined the Baltimore Orioles in 1914."* Also referenced in the Read and Understand G3 paragraph-rewrite tasks.
- **Verbatim instruction**: "Which sentence would make the best topic sentence?"
- **What student does**: Reads a 3- or 4-line paragraph minus its first sentence; picks the sentence that *generalizes* the supporting details. Distractors are real sentences from the paragraph that are too narrow / too broad / off-topic.
- **Widget**: `mc-text` (4 options, paragraph as stimulus).
- **Auto-gradable**: yes — single best answer.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium (requires generalization from details).
- **Best for**: Paragraph-structure atoms, main-idea atoms, expository writing prep.
- **Avoid for**: Single-sentence stimuli (too easy); narrative stories (topic sentence concept doesn't apply).

### N2. best-concluding-sentence-pick

- **Source**: Spectrum LA 6 §1.32 *"Each paragraph ends with a summary sentence"*; Spectrum Writing 2 *"Does the story have a beginning, middle, and an end?"*; the Reading Comp G3 "ending of the story" item *"Find the ending of the story; circle it."*
- **Verbatim instruction**: "Which sentence would make the best ending for this paragraph?"
- **What student does**: Reads a paragraph minus the last sentence; picks the wrap-up sentence. Distractors include "introduces a new topic", "adds a new fact", "asks a question instead of summarizing".
- **Widget**: `mc-text` (4 options).
- **Auto-gradable**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: G3-G6 paragraph atoms.
- **Avoid for**: K-1 (concept too abstract).

### N3. transition-cloze (drop-down)

- **Source**: Spectrum LA 6 §1.18 conjunctions; Spectrum Writing 2 §1.8 "Use time-order words: First, Next, Then, After that, Finally"; Spectrum Writing 2 §2.1 "Use linking words to join your reasons".
- **Verbatim instruction**: "Choose the transition word that best joins these sentences." (or "Choose the time-order word that fits.")
- **What student does**: Sees two sentences with a blank between (or a multi-sentence paragraph with one missing connector); picks from a 4-item bank of transitions (`first / next / then / finally`, or `because / so / however / for example`, or `and / but / or / so`).
- **Widget**: `drop-down-inline` (existing).
- **Auto-gradable**: yes.
- **Variety bucket**: DRAG.
- **Cognitive load**: low.
- **Best for**: Cohesion atoms, sequence writing, opinion writing (because/so), compare-contrast (however/also).
- **Avoid for**: Items where multiple transitions are pragmatically valid — only use when one is clearly best.

### N4. find-the-sentence-that-doesnt-belong

- **Source**: Reading Comp G3 "What a Nose!": *"Be careful! There are two sentences that do not belong in this story — leave them blank."* Spectrum Writing 2 §1.13 *"Are there any ideas or sentences that don't belong?"*
- **Verbatim instruction**: "One sentence does NOT belong in this paragraph. Tap it."
- **What student does**: Reads a 4-7-sentence paragraph; taps the one off-topic sentence (the "intruder"). Designed for paragraph-coherence assessment.
- **Widget**: `hot-text-sentence` with `granularity: 'sentence'`, `select_count: 1`.
- **Auto-gradable**: yes.
- **Variety bucket**: HIGHLIGHT.
- **Cognitive load**: medium.
- **Best for**: Coherence / unity atoms (G3-G6).
- **Avoid for**: Narrative stories where digressions are intentional; passages shorter than 4 sentences.

### N5. revise-mc (pick-the-better-revised-sentence)

- **Source**: Spectrum LA 4 §1.19-1.21 "Combining Sentences" rewrites; Spectrum LA 6 §1.31 "Combine these short choppy sentences". The exercise *"He created the most popular comic strip ever. He wrote the most popular comic strip ever: Peanuts."* asks the student to combine — closed-form version is a 4-option pick.
- **Verbatim instruction (closed-form)**: "Which sentence is the BEST revision of these two?"
- **What student does**: Sees two short sentences. Picks the best single-sentence combination from 4 options. Distractors include grammatically-correct-but-awkward, redundant, comma-splice, and the correct compound/complex sentence.
- **Widget**: `mc-text` (4 options).
- **Auto-gradable**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: Sentence-combining atoms G3-G6, revision skill.
- **Avoid for**: When deterministic combine is possible — use `sentence-build` (rebuild-from-tiles) instead since it is a stronger signal.

### N6. capitalization-tap-the-error

- **Source**: Spectrum LA 3 §2.5 *"Find the nine mistakes in capitalization. To capitalize a letter, underline it three times. Then, write the capital letter above it."* Spectrum LA 2 §2.1 same pattern. Spectrum LA 4 has "Use proofreaders' marks to capitalize the letter."
- **Verbatim instruction**: "Tap each letter that should be capitalized."
- **What student does**: Reads a passage in which proper nouns, sentence-starters, days, holidays, titles have been lowercased. Taps each character (or word) that needs capitalization. Counter shown ("X of Y found").
- **Widget**: `hot-text-word` (multi-select, granularity: word). For finer-grained letter-level a new `hot-text-character` granularity could be added, but word-level is enough for auto-grade.
- **Auto-gradable**: yes (closed set of expected words).
- **Variety bucket**: HIGHLIGHT.
- **Cognitive load**: medium (because count is variable).
- **Best for**: Capitalization rule mastery G2-G5.
- **Avoid for**: Single-rule items where two-button-binary (Capitalize? Y/N) gives faster feedback.

### N7. punctuation-cloze-end-mark

- **Source**: Spectrum LA 2 §2.7 *"1. Isabel and her family drove to Florida___ 2. Do you know how long it took them to get there___"*. Spectrum LA 6 §2.7 redwood passage with 10 missing end marks. Spectrum LA 3 §2.6 same pattern.
- **Verbatim instruction**: "Choose the correct end mark."
- **What student does**: Per sentence, picks `.` / `?` / `!` from a 3-button row. (Could be 4 options if a colon/semicolon variant is added at G6.)
- **Widget**: `drop-down-inline` (3-option) or a tiny custom 3-button mc.
- **Auto-gradable**: yes.
- **Variety bucket**: DRAG (or SELECT if rendered as 3-button mc).
- **Cognitive load**: low.
- **Best for**: G1-G3 punctuation; sentence-type identification.
- **Avoid for**: Compound punctuation (use N12 below).

### N8. dialogue-punctuation-fix (multi-step closed)

- **Source**: Spectrum LA 3 §2.12 "Punctuating Dialogue"; LA 6 §2.13 quotation marks; LA 4 §2.10 *"Add quotation marks, commas, and end marks to this dialogue."*
- **Verbatim instruction**: "Where do the quotation marks go?"
- **What student does**: Sees a sentence like `Lauren said look at those`. Picks from 4 multiple-choice options that show different placements: `Lauren said, "Look at those!"` / `"Lauren said look at those!"` / `Lauren said "look at those!"` / `Lauren said, "look at those!"`. The closed-form version assesses placement of comma, opening/closing marks, capitalization of first quoted word, and end mark inside-vs-outside the closing quote.
- **Widget**: `mc-text` (4 options).
- **Auto-gradable**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: high (multi-rule).
- **Best for**: G3-G6 punctuation atoms.
- **Avoid for**: Pre-G3 (concept density too high).

### N9. paragraph-purpose-tag (4-way classify)

- **Source**: Spectrum LA 6 §1.32 *"A few of the most common paragraphs include the following types: Descriptive, Narrative, Expository, Persuasive."* Item: *"Which sentence would most likely be found in a persuasive paragraph?"*
- **Verbatim instruction**: "What kind of paragraph is this?" Options: Narrative / Descriptive / Expository / Persuasive.
- **What student does**: Reads a 3-5 sentence paragraph; picks one of 4 purpose tags.
- **Widget**: `mc-text` (4-option). Could also use `n-way-binary` 4-way variant.
- **Auto-gradable**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: G4-G6 writing-purpose / author's-purpose atoms; cross-walks to reading comprehension Author's Purpose (PIE / PIES taxonomy).
- **Avoid for**: Mixed-purpose paragraphs (rare — most exemplars are clean).

### N10. parallel-structure-repair-cloze

- **Source**: Spectrum LA 6 §1.31 combining-sentences items; LA 4 §1.21 *"Combine sentences using adjectives in a series — remember to use commas after each item except the last."* Implicit in *"green, shiny, and large"* exemplars.
- **Verbatim instruction**: "Choose the word that makes the list parallel."
- **What student does**: Sees a sentence like `She likes swimming, biking, and ___`. Picks from `[run / to run / running / ran]` — only the gerund (`running`) is parallel.
- **Widget**: `drop-down-inline` with 4-option closed bank.
- **Auto-gradable**: yes.
- **Variety bucket**: DRAG.
- **Cognitive load**: medium.
- **Best for**: G5-G6 grammar revision.
- **Avoid for**: Pre-G4.

### N11. comma-splice-/-run-on-fix-pick

- **Source**: Spectrum LA 4 §1.18 *"Run-on: Darcy speaks Spanish her friend Logan speaks French."* Two correct fixes are shown in the book. Closed-form pick: which of these 4 sentences correctly fixes the run-on?
- **Verbatim instruction**: "Which sentence correctly fixes the run-on?"
- **What student does**: Sees a run-on. Picks from 4 options: (a) the original (still wrong), (b) comma-splice (still wrong), (c) two correct sentences with period, (d) compound sentence with comma + conjunction. Either (c) or (d) is correct — distractors include incorrect punctuation choices.
- **Widget**: `mc-text` (4 options) — or `mc-multi-select` if both (c) and (d) are flagged correct.
- **Auto-gradable**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: G3-G6 sentence-type and revision atoms.
- **Avoid for**: G1-G2 (run-on concept not yet introduced).

### N12. conjunction-pick (FANBOYS / subordinator)

- **Source**: Spectrum LA 6 §1.18 conjunction lessons; LA 4 §1.10 *"Conjunctions are and, but, or, so, because, when, while, after, before."*
- **Verbatim instruction**: "Choose the conjunction that best joins these sentences."
- **What student does**: Sees two clauses with a blank between; picks from a 4-option bank tuned to the relationship (`and`/`but`/`or`/`so` for coordinating; `because`/`when`/`although`/`if` for subordinating). The pragmatic distinction is testable (e.g., "I was tired ___ I went to bed" → `so`, not `but`).
- **Widget**: `drop-down-inline` (4 options).
- **Auto-gradable**: yes (with carefully designed stems where one option is unambiguously better).
- **Variety bucket**: DRAG.
- **Cognitive load**: low-medium.
- **Best for**: G2-G6 sentence-combining.
- **Avoid for**: Stems where two conjunctions are equally valid pragmatically.

### N13. paragraph-order (drag paragraphs into correct order)

- **Source**: Spectrum LA 6 §1.32 *"The sentences in the following paragraph are out of order. Rewrite the paragraph placing the topic sentence first, the summary sentence last, and the body sentences in between."* — closed-form is sentence-order drag.
- **Verbatim instruction**: "Drag the sentences into the correct order to form a coherent paragraph."
- **What student does**: 4-6 shuffled sentence tiles arranged top-to-bottom in random order; student drags them into the canonical paragraph order. Auto-graded against a single deterministic order.
- **Widget**: `paragraph-order` (already in roadmap §15.3) / `sequence-events` with sentence-sized tokens.
- **Auto-gradable**: yes.
- **Variety bucket**: SEQUENCE.
- **Cognitive load**: high.
- **Best for**: G4-G6 paragraph-structure mastery.
- **Avoid for**: Paragraphs where multiple orders are valid (rare — Spectrum's items are tightly authored to have one canonical order).

---

## Open-response items in books, with auto-gradable adaptations

For each "Write your own ___" prompt I encountered, here is the proposed closed-form equivalent. These are the highest-leverage adaptations because they convert ~80 % of the writing-book corpus into usable practice items.

| Open-response prompt (verbatim) | Source | Closed-form auto-gradable adaptation |
|---|---|---|
| "Write a topic sentence about your topic." | Spectrum LA 6 §1.32; Spectrum Writing 2 Ch. 2 | **mc-text best-topic-sentence-pick** (N1): show 4 candidate topic sentences for a given supporting-detail set, pick the best. |
| "Write a paragraph about your favorite book; use linking verbs." | Spectrum LA 4 §1.5 | **drop-down-inline cloze**: pre-write the paragraph with linking-verb blanks; student fills each blank from a 4-word linking-verb bank. |
| "Combine these two sentences into one." | Spectrum LA 3 §1.15-1.17, LA 4 §1.19-1.21, LA 6 §1.31 | **revise-mc** (N5) for difficult cases; **sentence-build** (rearrange word tiles into the canonical combined order) when only one combination is valid. |
| "Add a transition word to connect these ideas." | Spectrum Writing 2 Ch. 2 | **transition-cloze drop-down** (N3): student picks from `[because / so / however / for example]`. |
| "Write a sentence using these words; circle the verb." | Spectrum LA every chapter | **word-tagger** on a pre-written sentence: tag each word as N/V/Adj/Adv. Stronger signal than open construction. |
| "Rewrite this run-on as two sentences." | Spectrum LA 3 §1.14, LA 4 §1.18 | **comma-splice-fix-pick** (N11): mc-text with 4 fix candidates. |
| "Add quotation marks and commas to this dialogue." | Spectrum LA 3 §2.12, LA 4 §2.10 | **dialogue-punctuation-fix** (N8): pick the correctly-punctuated version from 4. |
| "Write three sentence fragments; then turn them into complete sentences." | Spectrum LA 3 §1.14 | **two-button-binary** (Complete vs. Fragment) on a pre-built bank, plus a `drop-down-inline` "Add the missing part" with closed bank `[subject / predicate / both]`. |
| "Write your own descriptive paragraph." | Spectrum Writing 2 Ch. 1 | **paragraph-order** (N13): order pre-authored descriptive sentences into a coherent paragraph; OR **paragraph-purpose-tag** (N9) on a pre-authored paragraph. |
| "Continue this fairy tale." | Spectrum Writing 2 Lesson 11 | **sequence-events**: order 5 plot-event tiles into the correct sequence (book-grounded). |
| "Find and circle them in Chase's first draft." (revision) | Spectrum Writing 2 Ch. 1 | **find-the-sentence-that-doesnt-belong** (N4): mark the off-topic sentence. |
| "Add a describing word to this sentence." | Spectrum Writing 2 Ch. 1 Lesson 4 | **drop-down-inline**: fill the blank with the best descriptive word from a 4-word bank tuned to the noun. |
| "Capitalize this paragraph correctly." | Spectrum LA 2/3/4 capitalization reviews | **capitalization-tap-the-error** (N6): tap each word that needs capitalization. |
| "Put end marks on these sentences." | Spectrum LA 2 §2.7, LA 6 §2.7 | **punctuation-cloze-end-mark** (N7): per-sentence 3-button pick from `. ? !`. |

---

## 100-word summary

**PDFs sampled**: Spectrum LA Workbooks K, 1, 2, 3, 4, 6; Spectrum LA 3 (separate edition); Spectrum Writing 2 + Workbooks 1, 2; Reading Comprehension G3 (Scholastic); Read & Understand G3. All text-bearing (1.5K–9.6K extracted lines each).

**Mechanics proposed**: 13 net-new (N1–N13) plus confirmation that 13 existing library mechanics already cover ~70 % of writing-book closed-form items. 14 open-response prompts mapped to closed-form adaptations.

**Top 3 ROI**: (1) **N1 best-topic-sentence-pick** — directly assesses the central goal of K-6 paragraph writing using mc-text. (2) **N3 transition-cloze** — converts every "use linking words" prompt into auto-gradable drop-down. (3) **N4 find-the-sentence-that-doesn't-belong** — the cleanest signal of paragraph-coherence understanding, leveraging existing hot-text-sentence widget.
