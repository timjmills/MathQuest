# Boom Cards basic catalog — synthesis

## Document Overview

This catalog ("Boom Cards Question & Answer Types for K-5 Literacy") is a **foundational reference** describing every interaction primitive Boom Learning supports and how those primitives map onto nine literacy skill areas. It is organized in three parts: core mechanics, domain-by-domain question types, and a mechanics-to-skills mapping table. It also includes a short ELL/SPED design notes section.

**How it differs from the comprehensive catalog**: This document is more concise and prescriptive — it lists question types per skill domain without extended rationale, difficulty progressions, or explicit Literacy Quest implementation guidance. The comprehensive catalog (studied separately) expands on implementation priorities, difficulty sequencing, and specific skill-level design patterns. Where the two conflict, the comprehensive catalog takes precedence. This document should be treated as the first-draft foundation to be subsumed.

---

## Question Types by Skill Area

### Phonological & Phonemic Awareness (K-2)
Word counting (tap number / drag counters), syllable counting (tap, drag, syllable boxes), syllable blending (tap picture/word), syllable segmenting (drag into boxes), rhyme identification (tap picture), rhyme production (MC or fill-in-blank), onset isolation (tap letter/sound icon), final sound isolation (tap letter), medial vowel isolation (tap vowel button), phoneme blending (tap picture/word), phoneme segmenting with Elkonin boxes (drag counter/letter), phoneme manipulation/add/delete/substitute (tap resulting word/picture), sound categorization odd-one-out (tap).

### Phonics & Decoding (K-3)
Letter-sound matching (tap), letter case matching (drag), letter formation (ink), CVC word building (drag letters into Elkonin boxes), CVC word reading (tap picture), word family sorting (drag-drop columns), phonics pattern sort (2- or 3-column drag), digraph identification (tap), blend identification (tap/highlight), long vs short vowel sort (drag), silent letter identification (tap), syllable type sort (6 types), syllable division (drag divider or tap), decoding multisyllabic words (tap), nonsense word reading (MC options), word chains/phoneme substitution (sequential card format).

### Sight Words & High-Frequency Words (K-2)
Tap the word you hear (audio-driven), find/hotspot the word in a passage, spell by dragging scrambled letters or fill-in-blank, sight word in context (fill sentence blank), sight word vs distractor sort (drag-drop), speed read deck (lesson card with audio).

### Vocabulary (K-5)
Picture-to-word matching, definition matching (tap or drag), synonyms/antonyms (tap or sort into buckets), categories/classification (drag into bins or "which doesn't belong"), attributes (drag to objects), function questions (picture MC), multiple-meaning words/homonyms (tap meaning in context), context clues (passage + MC), word relationships/analogies (MC), prefix/suffix/root (tap or drag affixes onto roots), Tier 2 vocabulary in context, shades of meaning (drag onto continuum), figurative language identification (tap label, grades 3–5).

### Grammar & Mechanics (K-5)
Hotspot tap parts of speech, parts of speech sort (drag columns), common vs proper noun sort, singular/plural sort or fill-in-blank, verb tense sort or conjugation fill-in-blank, subject-verb agreement (MC), pronoun replacement (tap/drag), sentence type identification with end-mark selection, end mark/punctuation tap or drag, capitalization correction (hotspot or fill-in-blank), contractions match or build, subject vs predicate split (drag divider or tap), conjunctions choice (fill-in-blank), sentence vs fragment vs run-on (tap label), sentence unscramble (drag words into order), editing passages (hotspot or MC "which sentence is correct"), articles fill-in-blank or tap, possessives/apostrophes (tap correct form).

### Spelling (K-5)
Audio spelling test (type), visual spelling from picture (type), drag scrambled letters into order, choose correct spelling (MC), spelling pattern sort by rule, hangman-style fill in missing letter(s), word search tap-in-order.

### Writing & Composition (Grades 1–5)
Sentence building (drag words/phrases), sentence expansion (MC or drag), sentence combining (conjunction/relative pronoun fill or drag), topic/supporting detail/conclusion sort (drag into paragraph slots), paragraph order (drag), story element identification or construction (drag into slots), transition word selection (fill-in-blank), genre identification (tap), open-ended writing prompt (fill-in-blank, teacher-reviewed), voice memo composition (oral, self-review only), editing/revising (hotspot or MC), show-don't-tell selection (MC), opinion/persuasive reason drag to claim, informational text feature labeling (drag-drop).

### Reading Comprehension — Fiction/Literary (K-5)
WH-question MC, WH with picture support (K-1/ELL), story sequencing (drag), story element identification (drag or MC), character traits (tap or drag evidence), character feelings/motivation (MC or picture), cause and effect (drag or MC), compare and contrast (drag into Venn buckets), inference (MC), main idea/theme (MC with distractor testing), summarizing (MC or drag key events into frame), author's purpose PIE'D (MC), point of view identification, highlight/drag text evidence, predict next event (MC), retelling with story map drag, vocabulary in context embedded in passages.

### Reading Comprehension — Nonfiction/Informational (K-5)
Text features identification (tap), text structure identification (MC), key details extraction (WH or multi-select hotspot), main idea + supporting details drag mapping, fact vs opinion sort (drag), paired passage comparison (MC), map/diagram reading (tap), graphs and charts reading (MC), glossary/dictionary skills (drag alphabetical order, pronunciation key MC, entry-word tap), citing evidence (highlight or drag sentence).

### Fluency (Grades 1–5)
Speed-read lesson-card decks (one item per card, self-pacing), voice memo read-aloud (self-review), phrasing/prosody tap (mark natural pause), punctuation-as-prosody tap with follow-up explanation.

---

## Unique Question Types — Deduplicated Master List

- Single-select multiple choice (text or picture)
- Multi-response multiple choice (tap all that apply, text or picture)
- Hotspot tap (word, letter, region, image object)
- True/False or Yes/No binary tap
- Fill in the blank (auto-graded typed)
- Fill in the blank (open-ended, teacher-reviewed)
- Drag-drop single zone (one correct draggable)
- Drag-drop multi-zone sort (categorize, e.g. word family, syllable type, fact/opinion)
- Drag-drop sequence/order (chronological, paragraph, alphabetical)
- Drag-drop build/arrange (sentence unscramble, CVC word building, Elkonin boxes)
- Drag continuum/shades of meaning (ordered scale)
- Drag paragraph/story element into labeled slots
- Drag text evidence / highlight overlay
- Audio tap-to-hear (speaker icon on card)
- Voice memo (student self-records; not teacher-retrievable)
- Ink / stylus drawing (letter formation, annotation, underlining)
- Lesson/instruction card (no response required)
- Flow Magic branching (adaptive path, remediation loop)
- Star-to-notebook (metacognitive save; not a scored interaction)
- Speed-read deck (lesson-card format for fluency pacing)

---

## Implications for Literacy Quest's Design

- **Audio is not optional for K-2.** Every phonemic awareness task requires audio output; without it, tasks collapse into letter-recognition exercises rather than sound-based assessment. Literacy Quest must implement a TTS or audio-clip system for all K-2 phonological/phonics skills at minimum.
- **Drag-drop is the dominant interaction for sorting tasks.** Word family sorts, phonics pattern sorts, fact/opinion sorts, story sequencing, and paragraph ordering all rely on drag-drop with multiple zones. The MathQuest drag infrastructure (T-chart, divisibility sort) provides a pattern, but literacy will need more flexible n-column sort templates.
- **Do not carry forward the voice memo / ink primitives initially.** Both are non-auto-gradable and not teacher-retrievable in Boom's implementation. Defer until Stage 3+; they add complexity without assessable output. The comprehensive catalog should confirm this priority.
- **Hotspot tap is high-value for grammar and evidence tasks.** Tapping parts of speech in a sentence or citing text evidence are authentically distinct from multiple choice. Implementing a "tap words in a passage" interaction (similar to odd-even-select in MathQuest) would unlock a large class of grammar and comprehension skills.
- **Keep decks single-skill; avoid mixed-skill cards.** The ELL/SPED notes explicitly warn against mixing phonics patterns or grammar concepts across a deck. Literacy Quest's skill-selection UI should enforce or at least strongly encourage single-skill practice sessions, consistent with MathQuest's existing per-skill practice model.
- **Treat this catalog as a floor, not a ceiling.** The document describes what Boom supports; it does not specify what Literacy Quest should prioritize. Skill-level difficulty sequencing, visual design quality, and question-type weighting should be driven by the comprehensive catalog and reference-site research, not by this list alone.
