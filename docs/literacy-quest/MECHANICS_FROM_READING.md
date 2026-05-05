# Reading-Book Mechanics — Research Findings

Mined from (text-bearing PDFs sampled with `pdftotext`):

- Spectrum Reading 1, 2, 4, 6, 7 (Carson Dellosa)
- Daily Reading Comprehension Grade 1, 2, 3 (Evan-Moor EMC 3451 / 3452 / 3453)
- Read and Understand with Leveled Texts, Grade K (Evan-Moor EMC 3440)
- 1. My First Phonics Passages CVC + Digraphs (A Teachable Teacher)
- 1. Phonics Reading Passages — Short Vowels, Long Vowels, Digraphs

PDFs **skipped** (image-only / 0 text bytes after `pdftotext -l 8`): Beginning to Read Grade K Part 1 + Part 2, Reading Practice Book, Reading Comprehension and Fluency Grade 1–2 (the latter two were checked and returned 12 bytes, all metadata). Format inferred from neighboring Evan-Moor books in the same series and from the cover/page-1 text we could extract.

Daily Reading Comprehension Grade 4 was specified in the brief but is **not present** in the corpus folder (`MAP Reading and Language Review/` only includes Grades 1–3). The brief's other items were located in `Writing Books/` (Spectrum Reading) and `Reading Books/Daily Reading Comprehension Grade 1–3` — both folders mined.

---

## Mechanics already in library (confirmed by reading-book observation)

These appeared repeatedly in the corpus and are already cataloged in `ANSWER_MECHANICS_LIBRARY.md`. No action needed beyond noting that the reading materials validate the existing widget choices.

- **mc-text** (4-option) — used in nearly every Spectrum / DRC item: main idea, author's purpose ("entertain / inform / persuade / explain"), best-summary-of-paragraph, best-title-for-passage, character-trait pick, "which sentence is true", inference items.
- **two-button-binary** — fact/opinion ("F before facts, O before opinions"), true/false ("T before true, F before false"), real/make-believe ("What can really happen? / What is make-believe?"), first-person/third-person ("Mark F or T"), positional ("Circle up or down").
- **n-way-binary / 3-way classification** — "Write C before … and G before …" (character-tag), "Write J before … and T before …" (Jacks vs Tangram source-attribution).
- **mc-multi-select** — "Check the words that describe Estéban: responsible / kind / competitive / funny / thoughtful" (multi-trait pick); "List three characteristics of manatees".
- **sequence-events** — "Number the events from 1 to 5 to show the order they happened" (every Spectrum grade), "Number the steps in this recipe", "Cut and glue to show what happened" (RUK).
- **match-pairs** — "Read each word, write the letter of its abbreviation in the space beside it" (a/b/c/d code pairing), "Whose Shoes? Draw lines to show who the shoes belong to" (RUK).
- **fib-auto** — "Write the words from the story that have the meanings below" (with paragraph hint), "Write the entry word you would look for in a dictionary".
- **drop-down-inline** — "Circle the word that best completes each sentence and write it on the line" (3-option inline cloze), "Circle the homophone that correctly completes each sentence" (homophones).
- **hot-text-word** / underline-pattern — "Underline the compound word in each sentence", "Circle the word that does not belong" (odd-one-out), "Circle four describing words that helped you picture Fabio".
- **sort-into-bins** — "F-fact / O-opinion" per sentence, "first-person / third-person" per sentence (when ≥3 items, this is sort rather than binary).
- **picture-match-row / mc-image** — "Look at each picture and circle the sentence that goes with it" (Sp 2), "Circle the pictures that answer the questions" (RUK).
- **column-letter-build / letter-tile-spell** — phonics passages with "fill the blank" CVC choice (small 2-3 option) — already covered by drop-down-inline at this scope.
- **timed-mc / fluency wrapper** — phonics passages have "JJJ" boxes asking the student to read the passage **3 times** as a fluency tally. Auto-grade equivalent: tap a box per read (or use existing TIMED variant).

The variety rule (§13) holds up well against this corpus — no single mechanic dominates a Spectrum unit.

---

## NEW mechanics proposed

### N1. dialogue-tag-attribution (who-said-it)

- **Source**: Spectrum Reading 4, "Grandpa's Light Show" (pp. 6–7) — "Write C before the groups of words that describe Cameron and G before the groups of words that describe Grandpa." Same shape repeated in Sp 4 "Birthday Breakfast" (Madison/Malaika/Dad), Sp 6 "Yakyu" (Godfreys/Itos), and many DRC items.
- **Verbatim instruction example**: "Write C before the groups of words that describe Cameron and G before the groups of words that describe Grandpa. 1. _____ said that spring and fall are better times for seeing the northern lights 2. _____ thought the northern lights were a spaceship 3. _____ started a fire in the fire pit on the beach"
- **What the student does**: For each statement / quote / action description, picks which of 2–3 named characters it belongs to.
- **Maps to existing widget?**: yes — `sort-into-bins` parameterized with 2-3 character-name bins. Conceptually distinct enough to track as a named pedagogical use case.
- **Auto-gradable?**: yes (closed answer set per item).
- **Variety bucket**: SORT (or SELECT if 2-character binary).
- **Cognitive load**: medium.
- **Best for**: character analysis, multi-character story comprehension, fact-from-passage recall. The strongest grades-2-7 Spectrum/DRC mechanic for assessing whose-action-is-this without writing.
- **Avoid for**: single-character stories; passages where attribution is ambiguous on purpose (mystery genre).

### N2. character-traits-multi-select

- **Source**: Spectrum Reading 4 "A Big Decision" (p. 23), Spectrum Reading 6 "A Schoolyard Garden" (p. 11) — "Check the words that describe Alice Waters: _ generous _ unfriendly _ talented _ ambitious _ stingy".
- **Verbatim instruction example**: "Check the words that describe Estéban: _____ responsible _____ kind _____ competitive _____ funny _____ thoughtful"
- **What the student does**: Picks the 3 (or N) traits that genuinely describe the character from a 5-option list mixing positives and antonyms (decoys are not just absent traits — they're opposites of cited traits, which is harder).
- **Maps to existing widget?**: yes — `mc-multi-select` with the constraint that distractors are antonym pairs (decoy generation rule, not a new widget).
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: character analysis, inference from action, vocabulary-trait integration.
- **Avoid for**: action-only passages where no trait is established; flat / didactic passages.

### N3. text-feature-source-attribution

- **Source**: Daily Reading Comprehension Grade 3 — "Where do you find Welsh's final score? $ in the picture % in the caption & in the passage ' in the title"; "Which of these tells you that the boys took part in the finals? $ the passage % the picture & the caption for the picture ' the picture and the caption". Spectrum Reading 2 (`What Is an Art Museum?` p. 24) — "Write one idea that you find under each heading: Food / Water / Other Needs."
- **Verbatim instruction example**: "Where do you find Welsh's final score? in the picture / in the caption / in the passage / in the title"
- **What the student does**: For a fact pulled from a multi-feature article, identifies WHICH text feature (passage body / heading / caption / sidebar / table / chart / title) is the source.
- **Maps to existing widget?**: no — proposed widget **`text-feature-tag`** (variant of `mc-text` whose render shows the full document with features visually labeled, then asks one question per fact).
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: nonfiction text-features atom (CCSS RI.K.5–RI.5.5), informational reading where the visual / structural feature literacy is the assessment goal.
- **Avoid for**: fiction passages without nonfiction features.

### N4. heading-content-fill (write-fact-under-heading)

- **Source**: Spectrum Reading 2 "Cats Every Day" (p. 32) — "Write one idea that you find under each heading. Food _____ Water _____ Other Needs _____".
- **Verbatim instruction example**: "Write one idea that you find under each heading."
- **What the student does**: Reads an article with sub-headings; for each heading, identifies the one fact that belongs under it.
- **Maps to existing widget?**: yes — **`heading-match`** (already in roadmap, §15 #6 of `ANSWER_MECHANICS_LIBRARY.md`). This is the closed-set version: instead of typing a fact, the student drops 4–6 facts onto 3 headings.
- **Auto-gradable?**: yes (closed match).
- **Variety bucket**: MATCH (or DRAG when implemented as drag-fact-onto-heading).
- **Cognitive load**: medium.
- **Best for**: informational / expository structure, content-organization comprehension.
- **Avoid for**: passages without explicit headings.

### N5. analogy-completion (closed)

- **Source**: Spectrum Reading 7 "The Future of Food Today" (p. 13) — "Complete the analogy. Ink tanks are to traditional printers as ___ are to 3-D food printers." Spectrum 6 also has "An analogy is a comparison… What are they?".
- **Verbatim instruction example**: "Complete the analogy. Ink tanks are to traditional printers as ___ are to 3-D food printers."
- **What the student does**: Picks the missing relational pair from 4 closed options (or types from a small accepted-answer list).
- **Maps to existing widget?**: yes — `mc-text` 4-option (when closed) or `fib-auto` with accepted_answers.
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT or TYPE.
- **Cognitive load**: high.
- **Best for**: vocabulary / morphology / categorical-relationship atoms grade 5+. Strong CCSS L.5.5b alignment.
- **Avoid for**: K-2 (cognitive load too high without scaffolding).

### N6. negative-option-select (which-is-NOT)

- **Source**: Spectrum Reading 7 "Welcome to the Days of Olde" (p. 15) — "Which of the following is NOT included in the story as something Madison and her family saw at the Renaissance Fair? _ a group of medieval singers _ a tightrope walker _ a fire eater _ fake weapons". Repeated in Sp 7 "A Feast Fit for a King" (NOT a detail described).
- **Verbatim instruction example**: "Which of the following was NOT a detail described in the text?"
- **What the student does**: Of 4 options, picks the one that is *not* mentioned / *not* true. Inverse logical move from standard mc-text.
- **Maps to existing widget?**: yes — `mc-text` with prompt explicitly framed as negative-attribution. Worth a flag because variety/decoy rules differ (3 decoys must be **true** statements, 1 answer is **false/unmentioned**).
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium-high (negation increases load by ~1 step).
- **Best for**: detail-checking on dense passages, distinguishing similar facts.
- **Avoid for**: K-1 (negation comprehension unreliable); short passages where 4 true distractors aren't extractable.

### N7. dual-element-retrieval (setting place + time)

- **Source**: Spectrum Reading 7 "Take a Bow" (p. 21) — "What is the story's setting? place: ________________ time: ________________". Sp 4 "A Big Decision" — "What is the setting for this story?" Sp 6 multiple settings questions split into where/when.
- **Verbatim instruction example**: "What is the story's setting? place: _____ time: _____"
- **What the student does**: Fills two short blanks (place and time) — both auto-graded against accepted-answer arrays.
- **Maps to existing widget?**: yes — **`fib-multi`** (proposed in §6 `ANSWER_MECHANICS_LIBRARY.md`). This pins one canonical use case for it: setting-element extraction.
- **Auto-gradable?**: yes (with accepted_answers per blank, including synonyms — "the farm"/"Uncle Pete's farm"/"a farm").
- **Variety bucket**: TYPE.
- **Cognitive load**: medium.
- **Best for**: story-element recall (CCSS RL.K.3 → RL.5.3), narrative comprehension.
- **Avoid for**: passages with no explicit setting; expository pieces.

### N8. paragraph-source-locator (find-which-paragraph)

- **Source**: Spectrum Reading 4 (p. 21), Sp 6, Sp 7 — vocabulary items repeatedly use a paragraph hint: "Write the words from the story that have the meanings below. 6. in a state of great confusion ____ Par. 2  7. something that fits around an animal's upper body ____ Par. 5". Sp 7 "Maria Merian" — "Identify the sentence in the first paragraph that presents the main idea of the text."
- **Verbatim instruction example**: "Identify the sentence in the first paragraph that presents the main idea of the text. Write the sentence below."
- **What the student does**: Given a paragraph reference (or asked to identify which paragraph), selects the target sentence within the named paragraph.
- **Maps to existing widget?**: yes — `hot-text-sentence` scoped to a single paragraph (paragraph-bounded selection). Worth flagging because the **scope-narrowing UX** is a distinct rendering concern (highlight-able paragraph indicated; other paragraphs greyed).
- **Auto-gradable?**: yes.
- **Variety bucket**: HIGHLIGHT.
- **Cognitive load**: medium.
- **Best for**: cite-evidence, main-idea-of-paragraph, vocabulary-in-paragraph atoms — every grade 3+ Spectrum unit uses this.
- **Avoid for**: passages shorter than 2 paragraphs.

### N9. compound-decompose (split-into-parts)

- **Source**: Spectrum Reading 6 "Experimental Appetites" (p. 7) — "Underline the compound word in each sentence. Then, write the two words that make up each compound. 4. Emily likes some types of seafood. ___ ___". Spectrum 6 (multiple weeks) — same pattern with morpheme decomposition (`mis-` + behave, `un-` + interested).
- **Verbatim instruction example**: "Underline the compound word in each sentence. Then, write the two words that make up each compound."
- **What the student does**: Two-step: (1) tap-hotspot the compound word in the sentence, (2) type the two component words (or drag from a small bank).
- **Maps to existing widget?**: yes — composition of `tap-hotspot` + `fib-multi` (or `tree-fill` already proposed in §3). The compound case is simpler than tree-fill: only 2 slots (left + right), no prefix/suffix.
- **Auto-gradable?**: yes (closed accepted answers).
- **Variety bucket**: HIGHLIGHT + TYPE (compound mechanic).
- **Cognitive load**: medium.
- **Best for**: compound-words / morphology atoms grades 1–4.
- **Avoid for**: when the word can be decomposed multiple valid ways (`somewhere` → some+where, but `somebody` → some+body all valid); use single-target words only.

### N10. syllable-divide-mark

- **Source**: Spectrum Reading 6 "A Growing Plan" (p. 13) — "Words that have two middle consonants are divided into syllables between the consonants. For example, pic/ture. Divide the words below into syllables using a slash (/). 11. g a r d e n  12. b a s k e t  13. p i c n i c".
- **Verbatim instruction example**: "Divide the words below into syllables using a slash (/)."
- **What the student does**: Taps the boundary position(s) between letters of a word. Letters render as separate tile-positions; tapping between two letters places a divider.
- **Maps to existing widget?**: no — proposed widget **`syllable-tap-divider`**: shows a word as a sequence of letter tiles with tappable gaps between them; taps toggle dividers; auto-grade against a fixed division pattern.
- **Auto-gradable?**: yes.
- **Variety bucket**: HIGHLIGHT (subset of in-content tap).
- **Cognitive load**: medium.
- **Best for**: VC/CV, V/CV, VC/V syllable-pattern atoms grades 2–4. Strong CCSS RF.2.3c / RF.3.3c match.
- **Avoid for**: K-1; words >3 syllables (UI breaks).

### N11. odd-one-out (which-doesn't-belong)

- **Source**: Spectrum Reading 6 "Yakyu" (p. 5) — "In each row, circle the word that does not belong. 1. popular famous encouraged legendary  2. recognize continue acknowledge notice  3. establish incredible amazing astounding".
- **Verbatim instruction example**: "In each row, circle the word that does not belong."
- **What the student does**: From a 4-word row, picks the one that doesn't share the relationship of the other 3 (synonyms / category / part-of-speech).
- **Maps to existing widget?**: yes — `mc-text` 4-option with a specific decoy-construction rule (3 are synonyms / category-mates, 1 is the outlier). Worth flagging as a named mechanic because it's a distinct cognitive operation: students must INFER the category before picking.
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: synonyms / antonyms / category atoms, vocabulary class-membership, grades 3+.
- **Avoid for**: when the "category" is ambiguous (e.g., political/connotative groupings); concrete categories only.

### N12. dictionary-entry-decode

- **Source**: Spectrum Reading 6 "Bonsai" (p. 9) — "Read the dictionary entry below, and answer the questions that follow. patient (pā́ shənt) adj. able to put up with things that are annoying without complaining n. someone who is receiving medical treatment. 1. What part of speech is patient when it is used to mean able to put up with things…?  2. What is the definition of patient when it is used as a noun?  3. Which syllable is stressed in patient?"
- **Verbatim instruction example**: "Read the dictionary entry below, and answer the questions that follow."
- **What the student does**: Reads a multi-part dictionary entry; answers a small bank of structured questions (part of speech for definition X, definition for sense Y, stressed syllable, pronunciation cue).
- **Maps to existing widget?**: no — proposed compound widget **`dictionary-entry-question`**: renders a fixed entry layout (headword / pronunciation / part-of-speech / numbered senses), then poses 1–3 mc-text or fib-auto items with the entry as the stimulus.
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT (per item) or TYPE.
- **Cognitive load**: medium.
- **Best for**: dictionary-skills atoms grades 3–6 (CCSS L.3.4d, L.4.4c, L.5.4c). Cross-applicable to glossary-use atoms in nonfiction.
- **Avoid for**: K-2 (no dictionary skills yet).

### N13. idiom-find-and-attach

- **Source**: Spectrum Reading 6 "A Schoolyard Garden" (p. 11) — "Write the idiom from paragraph 2 on the line next to its meaning. 10. goes together _____". Sp 6 "A Growing Plan" — "Write the idiom from paragraph 6 on the line next to its meaning."
- **Verbatim instruction example**: "Write the idiom from paragraph 6 on the line next to its meaning. 10. to start something _____"
- **What the student does**: Locate the idiomatic phrase inside the named paragraph; pair it to the literal-meaning gloss provided.
- **Maps to existing widget?**: yes — composition of `hot-text-word` (paragraph-scoped, multi-word region) + `match-pairs` to attach to gloss. Or simpler: `mc-text` with 4 candidate phrases from the paragraph.
- **Auto-gradable?**: yes.
- **Variety bucket**: HIGHLIGHT (or MATCH).
- **Cognitive load**: medium-high (figurative comprehension).
- **Best for**: figurative-language atoms grades 4–7 (CCSS L.4.5b, L.5.5b).
- **Avoid for**: passages with no idiomatic content; literal-only nonfiction.

### N14. simile-extract-and-tag

- **Source**: Spectrum Reading 4 "Birthday Breakfast" (p. 17) — "Paragraph 6 contains a simile, a comparison that uses like or as. Write the simile on the line, and then tell what two things are being compared." Sp 6 "A simile compares two things using the words like or as. Find the simile in paragraph 4 and write it on the line below."
- **Verbatim instruction example**: "Find the simile in paragraph 4 and write it on the line below."
- **What the student does**: (1) Tap the simile inside the paragraph (hot-text-sentence scoped to one paragraph); (2) drop / select the two things being compared.
- **Maps to existing widget?**: yes — composition of `hot-text-sentence` (locate) + `dnd-linked` or `mc-text` 2-of-4 (the two items compared).
- **Auto-gradable?**: yes.
- **Variety bucket**: HIGHLIGHT + DRAG.
- **Cognitive load**: medium-high.
- **Best for**: figurative-language atoms grades 3+. Also works for metaphor (drop "like/as" requirement) and hyperbole.
- **Avoid for**: passages with no figurative language; primer texts.

### N15. genre-identification

- **Source**: Spectrum Reading 7 "Julia Child" (p. 5) — "Which genre of nonfiction best describes the text? _ autobiography _ biography _ historical nonfiction _ essay". Sp 7 also "fiction / informational text / tall tale" pickers.
- **Verbatim instruction example**: "Which genre of nonfiction best describes the text? autobiography / biography / historical nonfiction / essay"
- **What the student does**: Picks the genre label that best fits the just-read passage from a closed list (3–5 options).
- **Maps to existing widget?**: yes — `mc-text` 4-option. The named-mechanic value is having a **canonical genre option-set** (fiction subgenres: realistic / fantasy / fairy tale / fable / tall tale / mystery / poetry / drama; nonfiction subgenres: biography / autobiography / informational / persuasive / historical / how-to / memoir).
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: genre / text-type atoms grades 2+. Strong CCSS RL.K.5–RL.5.5 alignment. Pairs well with N16 below.
- **Avoid for**: ambiguous-genre passages (creative nonfiction, narrative nonfiction).

### N16. text-purpose-classification

- **Source**: Spectrum Reading 7 "Julia's Famous French Bread" (p. 7) — "Identify the author's main purpose for writing the text. _ entertain _ inform _ convince _ explain". DRC 3 has same pattern.
- **Verbatim instruction example**: "Identify the author's main purpose for writing the text. entertain / inform / convince / explain"
- **What the student does**: Picks the author's primary purpose from the canonical 4-option set (entertain / inform / persuade-or-convince / explain-or-teach).
- **Maps to existing widget?**: yes — `mc-text` 4-option with a fixed canonical option set.
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: low-medium.
- **Best for**: author's-purpose atoms (Spectrum + DRC use this every week). Closed canonical set = generators can construct mechanically.
- **Avoid for**: hybrid-purpose texts (e.g., Common Core narrative-with-information). Disambiguation note for atom designers.

### N17. procedural-step-locator (next-step / which-step / which-step-after)

- **Source**: Spectrum Reading 7 "Julia's Famous French Bread" (p. 7) — "Which step occurs immediately after the third and final rising of the dough? _ Shape the dough into loaves. _ Place the loaves into the oven. _ Slash the loaves diagonally. _ Spray the loaves with water." Sp 4 banana akara recipe — "Number the sentences below to show the order in which you should do each step."
- **Verbatim instruction example**: "Which step occurs immediately after the third and final rising of the dough?"
- **What the student does**: After reading a procedure / recipe / how-to, identifies the step that comes immediately before / after / between named anchor steps.
- **Maps to existing widget?**: yes — `mc-text` 4-option with the constraint that the 4 options are all real steps from the procedure. Distinct enough from generic mc-text to track because **decoy generation comes from the procedure itself**.
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium.
- **Best for**: procedural / how-to / recipe / instructional reading; works alongside `sequence-events` (N17 is the MC alternative when the full sequence is too long to render as drag).
- **Avoid for**: non-procedural texts; texts with implicit ordering.

### N18. one-true-statement-pick (true-from-list)

- **Source**: Spectrum Reading 7 "Julia Child" (p. 5) — "Which of the following statements is true? Place a checkmark on the line of the true statement. _ From the time she was young, Julia always dreamed of being a famous chef. _ Julia worked as a spy for the CIA during WWII. _ Mastering the Art of French Cooking inspired Julia to become a chef. _ Julia's first television show was The French Chef."
- **Verbatim instruction example**: "Which of the following statements is true?"
- **What the student does**: Of 4 statements, picks the only true one (3 are false based on the passage).
- **Maps to existing widget?**: yes — `mc-text` 4-option. Canonical inverse of N6 (negative-option-select). Worth flagging because the **decoy rule is that 3 statements must be plausibly false but each contradict the passage in a different way** (wrong fact, wrong cause, wrong attribution, etc.).
- **Auto-gradable?**: yes.
- **Variety bucket**: SELECT.
- **Cognitive load**: medium-high.
- **Best for**: detail-recall, fact-checking, distinguishing-fine-detail atoms.
- **Avoid for**: short passages where 3 distinct false-but-plausible decoys can't be constructed.

---

## Mechanics rejected (and their auto-gradable adaptations)

These appeared in the corpus but violate the auto-grade hard rule. Each is listed with its closest auto-gradable substitute.

| Reading-book mechanic | Why excluded | Closest auto-gradable substitute |
|---|---|---|
| **Strategy Practice — sentence stem completion** ("I would like to have Sparky as a pet because _____", "When I learned something new, I felt like Evan because _____") — DRC 3 every week. | Open-response constructed-write. | **mc-text** with 4 reasoning-style options modeling typical student answers; or **drop-down-inline** at the end of the stem with 4 closed completions. |
| **"Describe a time when you…"** / **"What is your favorite…?"** / **"Have you ever…? Tell about it"** — Spectrum every grade, every passage. | Free-response personal connection. | Skip entirely (no auto-grade possible). For "make connections" pedagogy use **likert-confidence** or **mc-text** 4-option ("Which of these is most like Evan's experience?" — Sp 4 Day 2 of DRC3 actually has this form). |
| **"How do you know…?" / "Explain your answer."** | Open-response justification. | **mc-text** with 4 evidence-citing options (each option *is* a piece of evidence — student picks the one that supports the claim). This is the existing **persuasive-choice** mechanic from §14b. |
| **"Tell a partner…"** / **"With a partner, describe…"** — DRC strategy practice. | Verbal collaborative (not gradable, not even capturable). | Convert to **likert-confidence** post-answer self-rating, OR drop. |
| **"Draw and then color a puffin's feet and a penguin's feet"** — DRC 3 W2D3. | Drawing canvas (subjective, draw-quality not graded). | **mc-image** showing 4 puffin/penguin foot images, student picks the matching pair. |
| **"Cut and glue to show what happened"** — RUK every story. | Physical paper craft, not gradable digitally. | Already covered by **sequence-events** (drag-card ordering). |
| **"Write a creative short story using…"** — Spectrum 6 "Afternoon Art". | Constructed-write, multi-paragraph. | Skip — out of Literacy Quest scope. |
| **"Read it Aloud — read the passage three times"** (the JJJ tally on phonics passages). | Fluency check that needs ASR for true assessment. | Already excluded in §10; non-graded **TIMED** wrapper that just records taps. Consider a future **ASR-fluency** integration but not required for v1. |
| **"What did the headings tell?"** / **"Why do you think the author used italics?"** | Open inferential. | **mc-text** with 4 plausible reasons — already covered by N3 (text-feature-source-attribution). |
| **"Write one cause and one effect from the story. Cause: _____ Effect: _____"** | Free-response generation. | **match-pairs** with 4 cause-cards and 4 effect-cards from the passage; student pairs them. Already in library as cause-and-effect-match (§14b). |

---

## 100-word summary

Sampled 11 text-bearing PDFs across Spectrum Reading 1/2/4/6/7 and Daily Reading Comprehension 1/2/3 plus Read & Understand K and three phonics-passage sets; skipped scanned K-grade beginner PDFs. Identified 18 NEW mechanics worth adding (most as named-canonical refs over existing widgets, four genuinely new widgets: `text-feature-tag`, `syllable-tap-divider`, `dictionary-entry-question`, and the `dialogue-tag-attribution` parameterization of sort-into-bins). Rejected 9 open-response patterns with auto-gradable substitutes mapped. **Top-3 ROI**: (1) **N1 dialogue-tag-attribution** — appears in every Spectrum unit grades 2–7, near-zero implementation cost. (2) **N3 text-feature-source-attribution** — one fresh widget unlocks all CCSS RI.K.5–5.5 atoms. (3) **N15+N16 genre + author-purpose canonical option sets** — closed-form replacement for the Spectrum/DRC weekly staple, mechanically generatable.
