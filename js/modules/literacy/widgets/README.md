# js/modules/literacy/widgets/

Literacy-specific interactive widgets. Each widget follows Math Quest's widget pattern: a single ES module exporting `render*()` (mounts the widget into a container with side effects only) and `check*()` (extracts the user response and returns `{correct, submitted, feedback?}`).

See `/docs/literacy-quest/QUESTION_TYPES.md` for the canonical list of 20+ widgets, their question_type IDs, and the pedagogical-by-mechanic cross-reference matrix.

## Stage 1 — Minimum viable interaction set (build first)

- `mc-text.js` — Multiple choice with text options
- `mc-image.js` — Multiple choice with image options (K-2 default)
- `mc-audio.js` — Multiple choice with audio prompts (phonemic awareness)
- `mc-multi-select.js` — Multiple choice with multi-select + Submit gate
- `tap-hotspot.js` — Tap any flagged element (hotspot)
- `dnd-linked.js` — Drag-and-drop with linked drop zones (accept-any / accept-all / accept-specific)
- `fib-auto.js` — Fill-in-the-blank with auto-grading (case-sensitivity toggle, normalize-whitespace, "any one of" matching)

## Stage 2 — Differentiation widgets

- `two-button-binary.js` — Capitalize / No Capital style (Image 8)
- `sound-box.js` — Elkonin segmenting boxes (K-2 phonics + SPED)
- `build-with-tiles.js` — CVC word building, sight words
- `letter-tile-spell.js` — Audio-cued drag-to-spell (Image 6 custom widget)
- `word-tagger.js` — Color-coded part-of-speech labeling (Image 4 custom widget — the standout innovation)
- `hot-text-word.js` — Tap a word in a sentence/passage
- `hot-text-sentence.js` — Tap a sentence in a passage
- `hot-text-paragraph.js` — Tap a paragraph in a passage
- `drop-down-inline.js` — In-sentence `<select>` for Language Usage
- `sentence-build.js` — Drag word tiles into order
- `sort-into-bins.js` — N-column drag-to-categorize
- `match-pairs.js` — Column-line matching (vocab/synonyms)
- `sequence-events.js` — Drag events into chronological order
- `dropdown-cloze.js` — Passage with multiple inline dropdowns

## Stage 3 — High-value additions

- `open-response-fib.js` — Manual graded with purple speech bubble pattern
- `passage-mc-set.js` — Item-set with 3-5 MC items anchored to one passage
- `passage-multi-select.js` — Item-set with multi-select on passage
- `passage-hot-text.js` — Item-set with hot-text on passage
- `claim-evidence.js` — Two-part: choose claim + highlight supporting evidence
- `tap-to-reveal.js` — Mystery picture (engagement layer)
- `chain-images.js` — Sequence display (letter formation strokes)

## Stage 4 — Differentiators (deferred)

- `ai-assisted-short-answer.js` (future)
- `ink-draw.js` (future)
- ~~Voice Memo~~ — explicitly NOT built (per PHASE_0_DECISIONS).

## Widget contract (Math Quest pattern)

Every widget exports two functions:

```js
export function renderXxx(q, container) {
    // Mount widget into container; wire listeners; side effects only.
    // Return nothing.
}

export function checkXxx(q, container) {
    // Extract user response from widget state.
    // Return { correct: boolean, submitted: any, feedback?: string }.
}
```

Optional retry hooks (`unlockForRetry`, `applyPartialCorrectAndUnlock`) are attached as methods on the container after `render*()`.
