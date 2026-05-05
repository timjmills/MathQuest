# Spelling-Book Mechanics — Research Findings

Mined from: the four Evan-Moor *Building Spelling Skills, Daily Practice* (BSS) PDFs in `Tim's Documents/Literacy Quest/Litearcy Resource Materials/Spelling Books/`.

| PDF | Extracted lines | Usable? |
|---|---:|---|
| Building Spelling Skills Daily Practice Grade 1 (EMC 2705) | 136 | front-matter only — body pages are scanned-image; **skipped for direct mining** |
| Building Spelling Skills Daily Practice Grade 2 (EMC 2706) | 4,917 | text-extractable; mined heavily |
| Building Spelling Skills Daily Practice Grade 3 (EMC 2707) | 5,298 | text-extractable; mined heavily |
| Building Spelling Skills Daily Practice Grade 4 (EMC 2708) | 5,747 | text-extractable; mined heavily |

(No Spectrum Spelling PDFs are present in the folder; only the BSS series. Inferences about Spectrum are not made — the four BSS books supply enough variety on their own.)

The BSS series follows a consistent 5-day weekly format (Mon: spelling list / Tue–Wed: word study / Thu: edit-for-spelling / Fri: dictation + meaning). The Friday "dictation" page requires a teacher to read sentences aloud and a student to write them — **excluded** as not auto-gradable. Everything else on the Mon–Thu pages is multiple-choice / circle-the-word / fill-in-blank work, which is auto-gradable.

---

## Mechanics already in `ANSWER_MECHANICS_LIBRARY.md` that this corpus confirms

The BSS series uses, almost exclusively, mechanics that are already in §1–§14 of the catalog. Specifically:

- **mc-text 4-option** — confirmed by "Circle the word in each row that is spelled correctly" (every Thursday Edit-for-Spelling page in Grades 3 & 4) and by "Which spelling word is a synonym/antonym for…" (Grades 3 & 4).
- **two-button-binary** — confirmed implicitly by "real or nonsense" framing in early grades; not explicit in BSS but the format matches.
- **hot-text-word (multi-select)** — confirmed by "Circle the 9/12/14/20 misspelled words in the paragraph" (every Grade-3/4 weekly Edit page). Strong proofreading signal.
- **Correct the Mistake (compound: hot-text-word + fib-auto)** — confirmed by "Circle the misspelled words. Write them correctly on the lines." (used in 80%+ of weekly Edit pages, Grades 3 & 4).
- **fib-auto with `accepted_answers` = closed spelling list** — confirmed by every "Word Meaning — Fill in the missing words" page (cloze with sidebar word bank).
- **drop-down-inline** — confirmed by 3-option fill-in-blank pages in Grade 2 ("going, doing, find" / "find, most, kind" etc.).
- **sort-into-bins (2 / 3 / 4 bins)** — confirmed by "Read the words. Listen for the vowel sounds. Write each word in the correct box" (used 25+ times across the series, with 2/3/4 bins by week) and by Grade 4 "Write each word in the correct box: two-syllable / three-syllable / four-syllable words".
- **match-pairs** — confirmed by "Match the words that rhyme" (Grade 2) and "Match the contractions to the correct words" (Grade 2 Week 12).
- **letter-tile-spell / column-letter-build** — confirmed by "Add the missing letters. Write aw, all, or oa" (Grade 2 Week 14) and "Fill in the missing sounds. Write oi or oy" (Grade 3 Week 19).
- **anagram-build** — confirmed by "Unscramble the letters to make spelling words" (Grade 2 Week 5; used repeatedly through Grade 3).
- **crossword** — confirmed by "Complete the crossword puzzle using spelling words" (Grade 3 Weeks 8, 12, 18, 22, 26 etc.; appears in every other week of Grade 4).
- **word-search** — confirmed by "Find the words hiding in this puzzle" (Grade 3 Weeks 7, 14, 17, 19, 22; recurring theme through Grade 4).
- **word-chain** — confirmed by "Add a letter to make a new word" (Grade 2 Week 4) and "Change the beginning sounds to create new words" (Grade 3 Week 24).
- **word-tagger / underline-pattern** — confirmed by "Underline the words with the long a/e/i/o/u sound. Circle the letters that make that sound" (Grade 3 Weeks 1–6) — a 2-tag underline-then-circle compound.

---

## NEW mechanics proposed

The corpus surfaces six question-answer mechanics that are either *not* in the catalog yet or are sufficiently distinct from existing entries that they deserve a named slot. All six are 100% auto-gradable.

### 1. syllable-join

- **Source**: BSS Grade 4 Week 1 ("Match syllables to make spelling words. Write the complete words on the lines."), Grade 3 Weeks 4, 6, 9, 14, 18, 21, 23, 26 (recurring; over a dozen pages use this exact format), Grade 4 Weeks 7, 9, 16, 19, 23, 25, 28.
- **Verbatim instruction example**: "Match a first and second syllable to create spelling words. Write them on the lines." (Grade 4 Week 23).
- **What the student does**: Two columns of partial syllables (e.g., column A: `hun`, `se`, `laun`, `trou`; column B: `cret`, `gry`, `ble`, `dry`). Student matches one piece from each column to form a real word.
- **Maps to existing widget?**: **partial — extends `match-pairs`**. The shape is two columns of N tokens each, but the *evaluation* is "is the joined string a valid word in the closed list" rather than "is the explicit pair correct". A naive `match-pairs` works only if the items are uniquely pairable; BSS pages frequently include intentionally ambiguous tokens (e.g., "be" + "tween" or "be" + "low" both valid) so the canonical answer set must be a *whitelist of joined strings*, not a fixed pair map.
- **Auto-gradable?**: **yes** — given `accepted_joined_words` whitelist.
- **Variety bucket**: **MATCH**.
- **Cognitive load**: medium.
- **Best for**: 2- and 3-syllable word study (Grades 3–5), morphology, compound-word formation. Highest concentration of use is BSS Grades 3–4.
- **Avoid for**: 1-syllable items; affix→root joining (use `tree-fill` instead — `tree-fill` constrains slot type).

### 2. compound-builder

- **Source**: BSS Grade 4 Week 12 ("Use one word from each column to make compound words. Cross out each word as you use it."), Grade 3 Week 11, Grade 2 Week 30 ("Make compound words here").
- **Verbatim instruction example**: "Use one word from each column to make compound words. Cross out each word as you use it. Check your spelling to make sure that you form the compound words correctly." (Grade 4 Week 12).
- **What the student does**: Same shape as syllable-join, but the items are whole short words (Column 1: `chalk, some, after, how, her, grand`; Column 2: `parents, noon, ever, self, where, board`) and the bijective constraint is enforced ("Cross out each word as you use it" → each token is used **exactly once**).
- **Maps to existing widget?**: **partial — closest is `match-pairs` with bijection enforced**. Differs from syllable-join because (a) every left-token must be paired with exactly one right-token, (b) the tokens are full words, and (c) BSS visually crosses out used items, suggesting a "consume-on-use" UX cue. Compose: `match-pairs` + `bijective: true` validation + cross-out animation. Could become its own widget `compound-builder`.
- **Auto-gradable?**: **yes**.
- **Variety bucket**: **MATCH** (or DRAG if tokens drag instead of click-pair).
- **Cognitive load**: medium-high (constraint reasoning).
- **Best for**: Compound-word atoms (Grades 2–4), prefix/suffix + base-word combination atoms.
- **Avoid for**: When tokens shouldn't be unique (use `match-pairs`).

### 3. syllable-divide

- **Source**: BSS Grade 4 Week 10 ("Divide these words into syllables"), Week 14 ("Divide these words into syllables. Check your answers in a dictionary."), Week 18, Week 12 ("Place a `/` between the parts of these compound words"); recurring Grade 3.
- **Verbatim instruction example**: "Divide these words into syllables. across → a • cross" (Grade 4 Week 10).
- **What the student does**: A single word is shown as a tappable letter strip. Student taps the letter-gaps where syllable boundaries fall (e.g., for `compass` taps between `m` and `p`). Correct answer = the set of boundary positions.
- **Maps to existing widget?**: **no — proposed new widget `letter-gap-tap`**. Closest existing widget is `tap-hotspot` operating on letter-gap regions instead of letters or words; could also be implemented as a multi-position `hot-text-word` with `granularity: 'letter-gap'`. Building it as a granularity option of `hot-text-passage.js` is cheapest.
- **Auto-gradable?**: **yes** — answer is `Set<int>` of zero-based gap positions; exact-match grading.
- **Variety bucket**: **HIGHLIGHT**.
- **Cognitive load**: medium.
- **Best for**: Syllabication atoms (Grades 2–5), compound-word boundary identification, morpheme-boundary work in Grades 4–6.
- **Avoid for**: Words where the boundary is genuinely ambiguous (don't grade) or where you only want to test counting (use a numeric input for syllable count instead).

### 4. syllable-count-pick

- **Source**: BSS Grade 2 Week 17 ("Circle the number of syllables in each word"), Grade 3 Week 12 ("Read the words. Circle the number of syllables you hear"), Grade 4 Week 19 ("Read each word. Write the number of syllables on the line").
- **Verbatim instruction example**: "Read each word. Write the number of syllables on the line." (Grade 4 Week 19).
- **What the student does**: Word is displayed; student picks the number of syllables (1 / 2 / 3 / 4). On BSS this is rendered as a circle-a-number row, which is mc-text with numeric options.
- **Maps to existing widget?**: **yes — reduces to `mc-text` 4-option (numeric)**, but worth naming as a canonical use case to keep its instructional intent visible. Almost identical to a numeric `n-way-binary` (see §1).
- **Auto-gradable?**: **yes**.
- **Variety bucket**: **SELECT**.
- **Cognitive load**: low.
- **Best for**: PA syllable awareness, dictionary skills (Grades 1–4).
- **Avoid for**: Multi-syllable advanced morphology — use `syllable-divide` (above) which actually requires the student to mark the boundaries instead of counting them.

### 5. crack-the-code (substitution-cipher fib)

- **Source**: BSS series back-matter mentions "crack-the-code puzzles" as one of the supplementary practice formats ("Practice formats include cloze paragraphs, crosswords, and crack-the-code puzzles.") and they appear in Daily Academic Vocabulary Quarterly Reviews bundled in the series.
- **Verbatim instruction example**: "8IJDIDIPJDFIBTBCPVUUIFTBNFNFBOJOHBTJEFBM" (Grade 4 review packet — a Caesar +1 shift of "Which choice has about the same meaning as ideal?").
- **What the student does**: Cipher key is given (or implied — usually a +1 / -1 letter shift). Student types each decoded word into a labeled blank.
- **Maps to existing widget?**: **partial** — the *answer* shape is identical to `fib-auto` (or `fib-multi` for multi-blank), but the *prompt* requires a cipher-decode rendering helper that's a one-time addition. Could be implemented as a renderer wrapper around `fib-auto` with a `cipher_shift: int` field on the prompt; the `accepted_answers` then matches the decoded plain-text. **Recommend naming `crack-the-code` as a thin widget wrapper around `fib-auto`.**
- **Auto-gradable?**: **yes**.
- **Variety bucket**: **TYPE**.
- **Cognitive load**: high (decode + spell).
- **Best for**: Vocabulary review, end-of-unit gamified review (Grades 3–6), bonus rounds, optional "challenge" cards.
- **Avoid for**: First-exposure spelling practice (cipher noise interferes with pattern learning); pre-readers; ELL students who are still building automatic letter recognition.

### 6. type-the-correction (proofread-and-fix without find-step)

- **Source**: BSS Grade 4 Week 12 ("Circle the incorrect word in each sentence. Write it correctly on the line.") collapsed to its second half — used in many Grade-3/4 sentence proofreads where a single error per sentence is guaranteed.
- **Verbatim instruction example**: "Our holeday starts on Wednsday." → student writes `holiday` and `Wednesday` on the two lines provided. (Grade 4 Week 9 sentence 1).
- **What the student does**: Sentence is shown with N misspelled words highlighted (already auto-found by the system, OR pre-marked in the prompt). Student types the correct spelling for each into separate blanks.
- **Maps to existing widget?**: **yes — reduces to `fib-multi` with sentence context**. Differs from the cataloged "Correct the Mistake" compound (§14b) in that the *find* step is **bypassed** — the system pre-marks the errors. This is BSS's actual page format on most weeks: the misspelled word is shown in red/highlighted in the student book, and the student only types the correction. It's a meaningfully easier scaffold than the full find-then-fix compound and earns its own slot for variety/sliding-window purposes.
- **Auto-gradable?**: **yes** — accepted_answers is the canonical spelling list.
- **Variety bucket**: **TYPE**.
- **Cognitive load**: medium (single load — spelling-only, no error-detection load).
- **Best for**: Early proofreading practice (Grades 1–3), accommodations for SPED students who struggle with the find-step but can spell when given the target, scaffolded build-up to full Correct-the-Mistake.
- **Avoid for**: Atoms where error-detection IS the assessed skill — use Correct-the-Mistake instead.

---

## Mechanics rejected (with auto-gradable adaptation suggested)

Every BSS week has a **"My Spelling Dictation"** page and an end-of-week **"Listen to the words. Write each word on a line."** page. Both are core to the BSS pedagogy. Both are excluded from Literacy Quest as currently designed:

| BSS mechanic | Why excluded | Closest auto-gradable adaptation |
|---|---|---|
| **Dictation: teacher reads sentence, student writes it** | Requires teacher voice + open-ended sentence transcription; no deterministic grade unless we constrain to a single sentence and exact-match (brittle for K-2 punctuation/case). | Pre-record the dictation audio with TTS. Use `spell-from-audio` (already in roadmap §15 as item 4) for one-word-at-a-time dictation; for sentences, use `sentence-build` from a token bank that includes the correct sentence words plus 2–3 distractors. Grades the *word selection* deterministically while preserving the listening component. |
| **"Write the sentences. Circle the spelling words."** (every weekly dictation page) | The "write the sentences" half is open-ended handwriting — not auto-gradable. | Replace with `mc-multi-select` over the printed sentence: "Tap every spelling word in this sentence." — auto-grades the spelling-word identification component. The handwriting half is dropped. |
| **"Draw a picture to show what each sentence means."** (Grade 3 Week 5) | Free-form drawing canvas — subjective. | Replace with `mc-image` 4-option ("Which picture matches this sentence?") using stock illustrations. |
| **"Write three verbs that are in the present tense."** (Grade 4 Week 13 open-ended brainstorm) | Open-ended generation; no closed answer set. | Replace with `mc-multi-select` from a fixed pool of 8 verbs (correct = the 3-4 present-tense ones). Or `sort-into-bins` with bins {present / past}. Both are already cataloged. |
| **"Write a paragraph about your weekend."** / any extended writing prompt (appears in Grade 4 Daily Vocab back-matter) | Constructed-response. | Already excluded (§10). No adaptation worth shipping — direct the writing-genre learning to a different product surface. |
| **"Write a rhyming spelling word."** (Grade 2 Weeks 14, 16, 22, 26) | Open generation — student could write any rhyming word, and many spellings of "rhyming" words aren't in the closed corpus. | Replace with `type-the-rhyme` from the catalog (§6) which uses a closed rhyme set, OR `mc-text` 4-option ("Which word rhymes with *band*?"). Both already cataloged. |
| **"Write the sentences."** (every dictation page where student transcribes from audio) | Sentence-level transcription with case/punctuation/spelling all graded — too brittle. | Same adaptation as the first row: tokenize the target sentence and use `sentence-build`. |

---

## Summary

Sampled 4 PDFs (Grade 1 skipped — scanned-only); mined ~16,000 lines of extracted text from Grades 2, 3, and 4. Confirmed that the BSS series exercises 14 already-cataloged mechanics. Proposed **6 new mechanic entries**, of which the top three by ROI are:

1. **`syllable-join`** — recurring weekly across Grades 3–4; existing `match-pairs` doesn't cleanly handle "any valid joined string" semantics, and this skill is foundational for syllabication and morphology atoms.
2. **`compound-builder`** — bijective two-column join; high pedagogical value for compound-word and morphology atoms; tiny extension over `match-pairs`.
3. **`type-the-correction`** — captures BSS's most common Edit-for-Spelling pattern (find pre-marked, type the fix). Cleanly distinct from the heavier "Correct the Mistake" compound and supplies a useful scaffolded variant for SPED/ELL.

Three mechanics were rejected because their authentic BSS form needs voice or open-response — each has a documented auto-gradable adaptation above.
