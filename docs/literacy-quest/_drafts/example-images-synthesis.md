# Example Images — visual baseline synthesis

## Per-image analysis

### Example Image 1 — Boom-style deck thumbnail grid
36 card thumbnails in 6 columns spanning a full K-5 deck: comprehension, vocabulary, phonics, grammar, mechanics, writing. Multiple mechanics visible: MC (colored buttons), drag-and-drop (word→category), FIB, image hotspot, T/F. Confirms ~6-8 distinct mechanic types per typical professional deck. Cards rotate background colors so no two adjacent cards share a hue. **Implication: deck-overview UI must show structural variety at a glance.**

### Example Image 2 — 8-mechanic Boom primitives sheet
Eight named primitives: (1) MC, (2) FIB, (3) Drag and Drop (Noun/Verb columns), (4) Build a Sentence (word tiles), (5) True/False, (6) Matching (column lines), (7) Sequencing, (8) Audio Response (microphone). All use the same "magic tree / Lily" passage to isolate mechanic. Each card carries "Question X of 15" counter and feedback labels ("Great job!", "Nice work!"). Pill-shaped colored buttons (blue/green/purple) for MC. **The 8 primitives shown here are the floor for Literacy Quest's interaction set.**

### Example Image 3 — 16-mechanic extended sheet
Adds: Highlight the Text, Choose the Picture, Drop-down Answer, Short Answer, Sort the Items, Find the Error, Find the Item (word search), Compare & Contrast. Drop-down mechanic embeds a `<select>` widget inline within a sentence — critical for Language Usage 2-12. Highlight uses yellow/teal text overlay. Compare & Contrast uses Venn-diagram-style structured input. **The 16 mechanics here cover ELA Parts 2 (phonics/spelling), 4 (vocab), 5-6 (comp), 7 (grammar), 8 (writing) — Literacy Quest should aim for ≥ 16 widgets.**

### Example Image 4 — "Grammar Detective" color-coded word tagging
Skill: parts of speech labeling within a sentence. Sentence "The big cat sleeps" with each word in a colored badge (orange/teal/green) matching the assigned part-of-speech category button. Compound mechanic: click word → click category button → word turns that color. NOT a standard Boom primitive — a hybrid hotspot + categorization widget. Read Aloud button (yellow w/ speaker icon), Check Answers button (red w/ checkmark). Score badge top-right (purple pill, "Score: 0/15"). Card 1 of 15. **This is the single most innovative mechanic across all 8 images. Build as a custom Stage 2 widget.**

### Example Image 5 — "Story Elements Quiz" three-option MC
Skill: identifying main character (literary comprehension). Bold title "The Magic Tree". Light-blue passage box with 3-4 sentences. Bold stem "Who is the main character of this story?" Three large full-width pill buttons in distinct colors (blue/green/purple). Wide orange "Read Aloud" button below choices — visually equal in importance to the answer buttons. Previous / Question 1 of 15 / Next at bottom. Score badge top-right (red pill). **Lean K-2 design: 3 (not 4) options, prominent audio, large pill buttons.**

### Example Image 6 — Audio-cued drag-to-spell
Skill: consonant digraph spelling. "Listen to the word and drag the letters to spell it correctly!" Status pills: Score, Correct, Level. Content box shows "Current Word: sh" (digraph in purple). "Play Word" (purple, speaker) and "Hint" (orange, lightbulb) buttons. Drop zone with 4 dashed-border slots. Available letter tiles M/H/S/A in blue squares. Check Answer (green) / Clear (red). NOT a standard Boom primitive — combines audio cue with ordered tile placement. **Build as a custom Stage 2 widget for phonics/spelling.**

### Example Image 7 — Conflict types four-option MC (2x2 grid)
Skill: literary conflict identification. Purple gradient bg. Score badge top-center (white pill w/ target emoji, "Score: 0/12"). Pink passage box with "Read Story" inline button. Bold stem "What type of conflict is this?" Four answer options in 2x2 grid, OUTLINED style (white fill + thin purple border, dark text — NOT vivid pill colors). Single "Next →" button bottom-right. **Lean 2-5 design: 4 options in 2x2 grid, outlined buttons, smaller inline audio.**

### Example Image 8 — "Capitalize or No Capital?" two-button binary
Skill: capitalization rules (proper noun "doha"). Word centered, prompt "Should this word be capitalized?" Two compact outlined buttons: Capitalize / No Capital. Bottom: Previous | "1 / 50" counter | Next. NO score badge, NO audio button, NO image. Most stripped-down design across all 8 images. 50-card drill deck. **The binary two-button pattern is the simplest mechanic; 50-card decks need fast tap-and-go pacing.**

---

## Synthesis: visual baseline for Literacy Quest

### Common chrome elements
Every card has: (1) progress counter ("X of N"), (2) score display (pill badge corner/top-center), (3) Previous/Next nav buttons at bottom, (4) white card frame floating on colored/gradient background. Feedback is INLINE within card after submission, not modal/separate screen.

### Common color/typography patterns
Backgrounds: saturated but not dark — purple-to-blue gradients (4, 5, 7), white (6, 8), light neutral (3). Cards always white. Two button styles:
- **K-2 style**: large pill, solid color fill, bold white text (vivid blue/green/purple)
- **2-5 style**: large rounded-rectangle, white fill, thin colored border, dark text (restrained)

Color semantics: blue=neutral/default, green=correct/action, orange=audio/utility, red=submit/check/stop, purple=next/navigation. Typography is rounded friendly sans-serif; large stems (~1.1-1.4rem); answer text ~1rem.

### K-2 patterns
- 3 answer choices (not 4)
- Full-width pill buttons, vivid solid colors
- Prominent "Read Aloud" / "Play Word" — wide, orange, equal to answer choices
- Large letter/word tiles for spelling/phonics
- Image-based answer options where possible
- Short passages (3-4 sentences) or single-word prompts
- Audio-first: hearing prompt is presented as equal to reading

### 2-5 patterns
- 4 answer choices in 2x2 grid
- Outlined/neutral button style (white fill + thin border)
- Audio button smaller, inline/secondary
- Longer passages, denser stems
- Higher-order skills (conflict types, compare/contrast, evidence, editing)
- Compound analytical mechanics (hot-text, drop-down inline, sort-the-items)

### The 4-6 most common mechanics (Stage 1 priority)
1. **Multiple choice** (3 K-2 / 4 2-5 grid) — 6 of 8 images
2. **Drag-and-drop to category** — 3 of 8 images
3. **Fill in the blank with word bank** — 2 of 8 images
4. **True/False binary** — 3 of 8 images (incl. Capitalize/No Capital)
5. **Build/Sequence (word tiles or events)** — 2 of 8 images
6. **Hot-text / highlight** — 1 of 8 (essential for grades 3-5 evidence)

### Patterns suggesting fresh widget designs
- **Image 4's color-coded word-tagging** — hybrid hotspot + categorization, no standard Boom primitive. Enables sentence-level grammar analysis in one card vs 3 separate MC questions.
- **Image 6's audio-cued drag-to-spell** — combines phonemic awareness (hear it) with orthographic production (build it). No single Boom widget handles cleanly. Critical for K-2 phonics/spelling.

---

## Implications for Literacy Quest's design

- **The card is the atom.** Every interaction lives inside a single white rounded-rectangle card floating on gradient/colored background. Never feels like a "page" — feels like a physical flashcard. Build the design system around this card-centric metaphor from the start.
- **Score + progress counter are persistent chrome.** "Score: X/N" and "Question X of N" appear on every card. Build into the card frame, not the outer shell.
- **Audio is a first-class element.** K-2: "Read Aloud" button as large as answer buttons. 3-5: shrinks to inline utility inside passage box. Design must support both placements; TTS activation is one tap max.
- **Button style communicates grade level.** Vivid solid pill = K-2; outlined neutral = 3-5. Adopt this as a design rule rather than varying by skill.
- **Three answer choices for K-2, four for 3-5.** Layout constant: 3-option stacks vertically (full width); 4-option uses 2x2 grid.
- **Feedback is inline, not modal.** Correct/incorrect appears as text within card (green "Great job!" or color change on selected button). Student stays on card until "Next."
- **Navigation is always Previous / Counter / Next at the bottom.** No exceptions. Counter is plain text, not a progress bar. Simpler than MathQuest's approach; adopt for Literacy Quest's mobile-first card view.
- **Drag-and-drop, MC, and FIB cover 80% of skills.** Build these three to production quality first.
- **Color-coded word-tagging widget** (Image 4) is the standout innovation — prioritize as a custom Stage 2 widget for grammar.
- **Audio-cued drag-to-spell** (Image 6) for K-2 phonics/spelling — Stage 2 priority.
- **Decks run 12-50 cards.** Comprehension decks 12-15; drill decks (capitalization, spelling) up to 50. Engine must handle both scales without performance degradation.
