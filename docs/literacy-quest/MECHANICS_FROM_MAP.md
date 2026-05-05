# MAP-Review Mechanics — Research Findings

Mined from: `Tim's Documents/Literacy Quest/Litearcy Resource Materials/MAP Reading and Language Review-20240512T052430Z-001/MAP Reading and Language Review/`

PDFs sampled (text-bearing):
- `SET1NWEAMAPTestPrepELAReadingPracticeWorksheetsRITBand161170-1.pdf` (1623 lines)
- `SET1NWEAMAPTestPrepELAReadingPracticeWorksheetsRITBand171180-1.pdf` (1939 lines)
- `SET1NWEAMAPTestPrepELAReadingPracticeWorksheetsRITBand181190-1.pdf` (1930 lines)
- `SET1NWEAMAPTestPrepELAReadingPracticeWorksheetsRITBand191200-1.pdf` (2253 lines)
- `SET1NWEAMAPTestPrepELAReadingPracticeWorksheetsRITBand201210-1.pdf` (3196 lines)
- `SET1NWEAMAPTestPrepELAReadingPracticeWorksheetsRITBand211220-1.pdf` (2910 lines)
- `SET1NWEAMAPTestPrepELAReadingPracticeWorksheetsRITBand221230-1.pdf` (2830 lines)
- `TextStructuresAnchorChartProblemandSolutionTextStructureTaskCards-1.pdf` (278 lines)

PDFs skipped (image-only / 0–10 text lines): `Character Traits Task Cards.pdf`, `KEY Theme Task Cards.pdf`, `KEY Character Traits.pdf` (corrupted xref), most figurative-language and main-idea task-card decks. The seven RIT-band PDFs and the text-structure deck are the text-bearing core; everything else inferred from those plus NWEA's published item-type docs.

The RIT-band corpus is structured as a **passage + 6–7 anchored items per page**, repeated across grade-equivalent RIT bands 161–230. The same passage recurs across multiple pages with different item subsets — confirming the passage-anchored item-set pattern that `item-set-controller.js` already supports.

---

## Mechanics already in library (confirmed by MAP corpus)

These appear repeatedly in the MAP review corpus and are already cataloged. Listed with the exact NWEA item-type name where it differs from our canonical name.

| MAP-corpus example | NWEA item-type name | Library mechanic |
|---|---|---|
| "What does the word painful mean? [4 options]" | 4-option mc | `mc-text` |
| "Circle the CHARACTERS of the story." (single sentence) | hot-text (word) | `hot-text-word` |
| "Circle the ROOT in the following words: recharged, painter, …" | hot-text (word, single-target) | `hot-text-word` w/ single-select |
| "Circle the intensive pronoun in the sentence below: *Kyle himself is the only one who knows the truth.*" | hot-text (word, inline) | `hot-text-word` (single-sentence scope) |
| "Choose the best synonym for *sick*: healthy / ill / dangerous" | 4-option mc | `mc-text` |
| "Choose the word to complete the sentence: The Little Red hen was _______ when …" | inline-choice (cloze) | `drop-down-inline` |
| "Draw lines to put the story events in order: beginning / middle / end" | match (3-row × 3-event) | `match-pairs` (or `sequence-events`) |
| "Create a STORY MAP by numbering the events to show the order…" | order/sequence | `sequence-events` |
| "Read the passage. What is the theme? [4 options]" anchored to passage | passage-with-multiple-items | `mc-text` inside `item-set-controller.js` |
| "Which is the largest / thickest / weakest? [3 options of same set]" | 4-option mc with gradient distractors | `mc-text` |
| "Which phrase uses alliteration? [4 options]" | 4-option mc | `mc-text` |
| "Which sentence is written in active voice? [3 options]" | 4-option mc | `mc-text` |
| "Sort by [Cause / Effect / Compare / Sequence]" task-card sorter | classify-into-table | `sort-into-bins` |
| "Which passage contains an anecdote? Passage 1 / Passage 2" | 2-option mc / two-button-binary | `two-button-binary` |
| "Choose the best definition for *unify* [4 options]" | 4-option mc | `mc-text` |
| "Real or Nonsense" implicit in vocab items | two-button-binary | `two-button-binary` |
| Multi-select theme/detail items in higher RIT bands | multi-select | `mc-multi-select` |

The corpus does **not** contain explicit hot-spot (image-with-regions) items, table-match (rows × cols matrix), or hierarchical-display (expand-to-reveal) items in the text-bearing pages sampled. Those are NWEA item types but appear primarily on the digital-only MAP Growth platform; they are noted under "NEW mechanics proposed" below to the extent they fit the corpus's item style.

---

## NEW mechanics proposed

10 new mechanics surfaced by mining the MAP corpus. None require teacher review — all are 100% auto-gradable.

### 1. dictionary-guide-word-pick

- **Source / verbatim instruction:** "Below are the guide words for four dictionary pages. Which set would contain the word *yodel*. → `yonder - yowl` / `yogurt - yoke` / `yesterday - yoga` / `yolk - yon`" (RIT 211, pg.1).
- **What student does:** Sees a target word + 4 candidate guide-word ranges (each shown as `start - end`); taps the range whose alphabetical span contains the target.
- **Widget:** [proposed: `dictionary-guide-word-pick`] — reduces to specialized 4-option `mc-text` with two-string range option labels and a deterministic "is target between A and Z alphabetically" check.
- **Auto-gradable:** yes (string-compare against guide-word range).
- **Variety bucket:** SELECT.
- **Cognitive load:** medium — alphabetical reasoning across 4 ranges.
- **Best for:** Grade 3–5 dictionary skills, alphabetization, reference-skills atoms.
- **Avoid for:** K–2 (alphabetization not yet automatic).

### 2. thesaurus-entry-pick

- **Source / verbatim instruction:** "Use the thesaurus to find the word that has the opposite meaning as the following word. → [Thesaurus card showing `solid` adj., synonyms list, antonyms list] → solid / hard / compact / **flexible**" (RIT 201).
- **What student does:** Sees a thesaurus-entry card (headword + part of speech + synonyms list + antonyms list), then 4 word options; taps the one that satisfies the prompt ("synonym of …" / "antonym of …" / "NOT a synonym of …").
- **Widget:** [proposed: `thesaurus-entry-pick`] — a small read-only card widget paired with `mc-text`.
- **Auto-gradable:** yes.
- **Variety bucket:** SELECT.
- **Cognitive load:** medium.
- **Best for:** Grade 3–6 vocabulary atoms, especially shades-of-meaning and antonym/synonym precision.
- **Avoid for:** Pre-readers; atoms where the thesaurus card defeats decoding practice.

### 3. glossary-lookup-pick

- **Source / verbatim instruction:** "Use the glossary to find the meaning of the word. *We have no absolute record. We have to make inferences.* → [Glossary card: inferences / interpret / relic with definitions] → to explain / **educated guesses** / an old object" (RIT 201, pg.20).
- **What student does:** A glossary card (3–6 entries) is shown; student picks the option that matches the bolded passage word's glossary definition.
- **Widget:** [proposed: `glossary-lookup-pick`] — sister of `thesaurus-entry-pick`. Same widget shape, different reference card.
- **Auto-gradable:** yes.
- **Variety bucket:** SELECT.
- **Cognitive load:** medium.
- **Best for:** Informational-text comprehension, science/social-studies vocabulary atoms.
- **Avoid for:** Items where the word can be inferred without the reference (defeats the purpose).

### 4. precision-word-gradient (most-precise / strongest / weakest)

- **Source / verbatim instructions:**
  - "Which word is the thickest? trunk / stick / twig" (RIT 181)
  - "Choose the most powerful word or phrase from the options below: laughed / snickered / grinned / guffawed" (RIT 211)
  - "The __________ prowls across the field. → big cat / predator / feline / mountain lion" (RIT 221)
- **What student does:** Sees 3–4 near-synonyms or related words; picks the one that best fits a gradient prompt (most powerful, most precise, smallest, weakest, strongest).
- **Widget:** [proposed: `precision-word-gradient`] — `mc-text` with strict ordered ranking; the correct answer is the option at the requested gradient extreme.
- **Auto-gradable:** yes (single correct ranked option).
- **Variety bucket:** SELECT.
- **Cognitive load:** medium-high — semantic gradient reasoning.
- **Best for:** Grade 3–6 vocabulary precision, shades-of-meaning, word-choice atoms.
- **Avoid for:** Atoms where the gradient is debatable; corpus must guarantee a defensible single answer.

### 5. connotation-pick (positive / negative / neutral)

- **Source / verbatim instruction:** "Which answer choice suggests a positive meaning? → The string around the box was tied with a tangle. / The string around the box was tied with a **bow**. / The string around the box was tied with a knot." (RIT 201).
- **What student does:** Three sentences differ only in one word (synonyms or near-synonyms). Student taps the sentence whose key word carries the requested connotation (positive / negative / neutral / most-positive / most-negative).
- **Widget:** [proposed: `connotation-pick`] — `mc-text` with sentence-level options + connotation labeling rule.
- **Auto-gradable:** yes.
- **Variety bucket:** SELECT.
- **Cognitive load:** medium.
- **Best for:** Grade 4–6 nuanced-vocabulary atoms; bridges to "author's word choice" comprehension atoms.
- **Avoid for:** When the three sentences carry equivalent connotation (then it's a guess).

### 6. ordered-fragments (rearrange-into-story 4-option position)

- **Source / verbatim instruction:** "Read all of the answer choices below. If they were rearranged into a story, which section would come **first**? → A / B / C" (RIT 211, pg.1) — repeated for second, last, etc. across the band.
- **What student does:** Sees 3–4 unordered text fragments (sentences); answers "which fragment goes 1st / 2nd / 3rd / last".
- **Widget:** [proposed: `ordered-fragments`] — narrower than `sequence-events` (no full reorder; just one positional pick). 4-option `mc-text` where each option is a fragment.
- **Auto-gradable:** yes.
- **Variety bucket:** SELECT (not SEQUENCE — student doesn't construct full order).
- **Cognitive load:** medium.
- **Best for:** Grade 3–5 sequencing atoms, transitional-word atoms; lighter cognitive load than full `sequence-events`. Useful for short-passage RIT items.
- **Avoid for:** When the item genuinely requires producing the full order — use `sequence-events`.

### 7. sentence-fragment-fix

- **Source / verbatim instruction:** "Which answer choice correctly revises the fragment below? *Ringing in the clock tower.* → **The bells were ringing in the clock tower.** / The bells in the clock tower. / Ringing in the clock tower at midnight." (RIT 201, pg.7).
- **What student does:** Sees a sentence fragment + 3 candidate revisions; taps the option that is a complete, grammatically correct sentence.
- **Widget:** [proposed: `sentence-fragment-fix`] — domain-specific `mc-text` flavored as a grammar-mechanics atom; can share rendering with `mc-text` but the generator enforces "exactly one option is a complete sentence".
- **Auto-gradable:** yes.
- **Variety bucket:** SELECT.
- **Cognitive load:** medium.
- **Best for:** Grade 2–5 grammar / sentence-completeness atoms; pairs with sentence-vs-fragment two-button-binary.
- **Avoid for:** Multi-clause complex revision — use a `sentence-build` instead.

### 8. punctuation-rule-pick (correctly punctuated list / dialogue / sentence)

- **Source / verbatim instruction:** "Which list is punctuated correctly? → The restaurant offered tea, coffee, juice, milk, and, soda. / **The restaurant offered tea, coffee, juice, milk, and soda.** / The restaurant offered tea, coffee juice, milk and soda." (RIT 201).
- **What student does:** 3 candidate sentences differ only in punctuation; student picks the correctly-punctuated one.
- **Widget:** [proposed: `punctuation-rule-pick`] — same widget shape as `sentence-fragment-fix` but the correctness rule is punctuation, not completeness.
- **Auto-gradable:** yes.
- **Variety bucket:** SELECT.
- **Cognitive load:** medium.
- **Best for:** Grade 2–5 punctuation atoms (commas in series, dialogue tags, end punctuation).
- **Avoid for:** Items that need student to fix the sentence (use `correct-the-mistake` from §14b).

### 9. spelling-rule-pick (which word is spelled correctly)

- **Source / verbatim instruction:** "Which of these is correct? → carryer / carryed / **carrying** / carriying" (RIT 211, pg.1) — and "shapeed / fryed / fadded / **planned**" (pg.2).
- **What student does:** Sees a base word (implicit in the variants) + 4 spellings differing in inflection rule application (-ed, -ing, doubling, drop-e, change-y-to-i); taps the correct one.
- **Widget:** [proposed: `spelling-rule-pick`] — `mc-text` with a spelling-rule generator that produces 1 correct + 3 rule-violation distractors. **Closely related to** `code-transfer` in §14a, but the student picks rather than types.
- **Auto-gradable:** yes.
- **Variety bucket:** SELECT.
- **Cognitive load:** medium.
- **Best for:** Grade 2–5 inflection-spelling atoms, especially the "doubling rule", "drop-the-e rule", "y→i rule".
- **Avoid for:** When `code-transfer` (TYPE) is the better assessment — typing produces stronger evidence than picking.

### 10. dual-passage-compare (2-passage anchored item set)

- **Source / verbatim instruction:** "Read Passage One. Who is the narrator? Read Passage Two. Who is the narrator?" repeated across "Passage 1 / Passage 2" pairs (RIT 211, RIT 221 *Lincoln's Yarns and Stories*, *Stamp Collecting for Beginners*).
- **What student does:** Two short passages are shown side-by-side; each item references one specific passage or asks a comparison ("Which passage contains an anecdote?", "If you were just starting to learn …, which passage would be most useful?", "What is the audience and purpose of each passage?"). Each individual item is a standard `mc-text` or `two-button-binary`.
- **Widget:** [proposed: `dual-passage-controller`] — extension of `item-set-controller.js`. Stores TWO passage objects, each item references one passage by id (or "both"). UI shows both passages stacked or side-by-side; the active item highlights its referenced passage.
- **Auto-gradable:** yes (delegates to underlying `mc-text` / `two-button-binary`).
- **Variety bucket:** inherits from underlying mechanic (mostly SELECT).
- **Cognitive load:** high — student holds two passages in working memory.
- **Best for:** Grade 4–6 compare/contrast comprehension, author's-purpose contrast, audience analysis (a high-frequency item-bank pattern in MAP RIT 211–230).
- **Avoid for:** K–2 (working-memory load too high); single-passage items (use plain `item-set-controller`).

---

## Item-set / passage-anchored patterns

The MAP RIT-band corpus is **the** canonical example of passage-anchored item sets. Patterns observed:

1. **One passage → 6–7 items per worksheet page**, repeated across multiple pages with different item subsets. Items 1–7 on every page hit a fixed mix:
   - Item 1: literal-recall or sequencing of a main event (always early in spoiler order)
   - Item 2: theme / main-idea / character classification (placed late in spoiler order)
   - Item 3: word-choice / vocabulary in the passage
   - Item 4: language-mechanics applied to a passage sentence (active/passive voice, fragment fix, etc.)
   - Item 5: word-parts / morphology (root, prefix, suffix, share-a-root)
   - Item 6: figurative-language identification (alliteration, hyperbole, onomatopoeia)
   - Item 7: writing-mechanics or sentence-revision

   This maps well to the existing `item-set-controller.js` anti-spoiler `spoilerWeight()`: literal-recall = 1, vocab/morphology = 2, voice/figurative = 3, theme/main-idea = 4. The corpus validates the existing weights.

2. **Same passage recurs across pages (1–10) with different items** — confirms the design pattern that one passage + a *bank* of items can be sampled into multiple sessions. This is already supported by separating `passages` and `items` in the data model.

3. **"Same set" item sequencing** (RIT 161–170): on every page items 1–7 follow a near-identical sequence with content rotated. Implication for our generators: the **per-deck variety** rule (§13 of ANSWER_MECHANICS_LIBRARY.md) is consistent with MAP — every passage-anchored deck mixes 4+ buckets across its items.

4. **Dual-passage item sets** (RIT 211, 221): the corpus shows *two-passage* anchored items (`Passage 1` and `Passage 2`). This is **NOT yet supported** by `item-set-controller.js` — it stores a single passage. Mechanic #10 above (`dual-passage-compare`) proposes the extension.

5. **Constraint MAP corpus implies for our `item-set-controller.js`:**
   - Items can reference *parts* of the passage by chapter/paragraph but **not by line number** — corpus uses "first paragraph", "second paragraph", "the third paragraph", and "the last line" rather than numeric line refs. Implementation: support paragraph-anchored items but don't require line-numbered passages.
   - **Vocabulary-in-context items are NOT always first** — they can appear anywhere. Spoiler-weight 2 for them (already correct).
   - The corpus pattern of "Read Passage One." / "Read Passage Two." stems implies our renderer should **explicitly tag each item with its passage reference** in dual-passage mode and visually highlight the referenced passage.
   - **Definition cards** (e.g., "Narrative Point of View: the viewpoint from which a story is told") sometimes appear *as part of the item stem*, not the passage — these are a separate "definition-callout" widget element that an item can reference. Worth adding a tagged `definition_callout` field to the item schema.

---

## Summary (100 words)

Sampled 7 RIT-band PDFs (161–230, ~16,700 lines of text) plus the text-structure deck. Identified 10 net-new mechanics not in the existing library: dictionary-guide-word-pick, thesaurus-entry-pick, glossary-lookup-pick, precision-word-gradient, connotation-pick, ordered-fragments, sentence-fragment-fix, punctuation-rule-pick, spelling-rule-pick, and dual-passage-compare. The corpus also validates the existing item-set anti-spoiler ordering and surfaces a dual-passage extension to `item-set-controller.js`.

**Top 3 ROI:**
1. **precision-word-gradient** — high-frequency MAP item, atomically reusable for any vocabulary skill, ~0.5 day to build.
2. **dual-passage-compare** — unlocks compare/contrast & author's-purpose item banks; reuses existing item-set machinery, ~1 day.
3. **connotation-pick** — bridges vocab to author's-craft analysis; closes the largest pedagogical gap in the current library, ~0.5 day.
