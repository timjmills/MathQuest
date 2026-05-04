# Literacy Quest — Live-Iteration Roadmap

**Status:** Phase 2 shipped to `master` and deployed to `math.cultivatingthedigital.org`. Quest Hub is live. Math Quest preserved end-to-end.

**The reality of what's live right now:**
- 478 skill atoms in the catalog
- 26 widgets registered in the dispatcher
- BUT only **3 of 478 atoms** (~0.6%) have real procedural generators: `reading_phonics_short_a_initial`, `language_mechanics_capitalize_proper_noun_person`, `language_mechanics_capitalize_proper_noun_place`.
- Every other atom falls back to a placeholder card reading **"[skill statement] — generator coming in Phase 2."**
- Skill browser doesn't exist yet — Reading / Language home views only have ONE Practice button hardwired to a single skill each. Users can't reach any of the other 477 atoms.
- MAP variant views are placeholders. Engine works; UI integration not done.

This document orders the live iteration work to maximize student value while keeping risk bounded.

---

## Sequencing principle

**Each iteration should:** (a) fix a live user-visible issue OR add live user-visible value, (b) leave Math Quest untouched, (c) ship in hours not days, (d) be revertable if it breaks.

**Order is risk-then-value:**

1. **Risk audit + graceful fallbacks** — find and fix every "click → error or dead end" path before students hit them.
2. **Skill browser** — unblock student access to the catalog.
3. **Generator expansion in priority order** — Phonics → Mechanics → Grammar → Sentence Structure → Vocabulary → Comprehension → Spelling → Writing.
4. **MAP UI integration** — wire the engine to playable adaptive sessions.
5. **Curated content authoring** — comprehension passages, ORF passages, writing prompts.
6. **Polish** — ETC page mode, K-readiness atoms, letter-trace widget, OpenDyslexic font bundle.

---

## Phase A — Risk audit (research, 30-60 min)

**Goal:** Document every live-broken path so we know what to fix first.

**Research tasks (agent-sized):**

- **A.1 Generator coverage map.** For each of the 478 atoms in `/data/literacy-skills/`, what does `gen-<strand>.js` actually return when called? Categorize: real generator | placeholder | error/throws.
- **A.2 Widget-coverage map.** For each `question_type` referenced by any atom's `question_types[]` array, is the widget actually registered in `LITERACY_WIDGETS`? Catch any references to widgets we never built.
- **A.3 Curated path audit.** Atoms with `content_strategy: 'curated'` have `curated_content_path` pointing into `/data/literacy-content/` which doesn't exist. What happens when a student lands on one? (Probably an error — needs a graceful fallback.)
- **A.4 MAP entry-point audit.** What happens when a student clicks "MAP Quest — K-2/2-5/Language Usage"? The placeholder views are static text but the navigation function `goToMapReadingK2()` sets `state.mapMode = true` — does anything in Math Quest's existing game-control / answer-check pipeline accidentally activate?
- **A.5 Inline-handler audit.** Every onclick in index.html literacy views — verify the function exists on `window` when the flag is on.
- **A.6 Console-error sweep.** Open the live page with literacy flag ON, click through every hub path. Capture every console error.

**Output:** `docs/literacy-quest/LIVE_RISK_AUDIT.md` — list of broken paths with severity and fix recommendations.

**Time estimate:** 60 minutes (one agent in parallel with B.1).

---

## Phase B — Graceful fallback + skill browser (build, 2-4 hr)

### B.1 Graceful fallback for atoms without generators (1 hr)

The current placeholder card just shows "generator coming in Phase 2" as MC text. Replace with a more useful screen:

- A friendly card stating "This skill is in our roadmap — coming soon!"
- Show the skill statement, RIT band, and prerequisite skills
- Offer "Try a related skill" buttons that route to atoms with real generators
- Don't let students get stuck — every "no generator" path has a clear next action

### B.2 Skill browser view (2 hr)

A new view between Reading/Language Home and Practice:

- **Search bar** at top
- **Filters:** Grade (K-5), Strand (PA / Phonics / Fluency / Vocab / Comp Lit / Comp Info), RIT band, ETC book, UFLI lesson
- **Grid of skill cards** — one per atom matching filters. Each card shows:
  - Skill statement (one sentence)
  - Mastery level chip (not started / introducing / developing / approaching mastery / mastered)
  - "Play" button (or "Coming soon" if no generator yet)
- Reuse the existing `skills-organizer.js` pattern from Math Quest if possible.

**Output:** Reading + Language Home views now have a working "Practice" → Skill Browser → individual skills flow.

### B.3 MAP placeholder polish (30 min)

Replace the bare "coming soon" cards with:
- A teaser explaining what MAP Quest will do
- A "Notify me when available" cookie flag (so we know who's interested)
- Link to a published Phase 3 timeline

---

## Phase C — Phonics generator expansion (build, 8-16 hr)

**The biggest live-value win.** Tim's class is phonics-first; we have 151 atoms but only 1 has a real generator. Cover the highest-frequency UFLI Set 1-9 atoms first.

### C.1 Short vowels (~15 atoms) — 2 hr
Generators for short_a_medial/final, short_e/i/o/u (all positions), mixed_short_vowels. Reuse the 5-mechanic template from short_a_initial: mc-image, fib-auto (letter-tile-spell fallback), dnd-linked sort-bins, dnd-linked sound-box, mc-audio. Word banks per vowel.

### C.2 Digraphs (~8 atoms) — 1.5 hr
sh, ch, th, wh, ck, ng, ph, tch. Same template, swap word banks. Add `picture-match-row` (Wave 5 widget) for variety.

### C.3 Blends (~10 atoms) — 1.5 hr
l-blends, r-blends, s-blends, final blends. Use `column-letter-build` to demo blend assembly.

### C.4 VCe / silent-e (~5 atoms) — 1 hr
long_a/i/o/e/u_vce + mixed. Heavy use of `two-button-binary` (silent-e or no?) plus `letter-tile-spell` for spelling.

### C.5 Vowel teams (~10 atoms) — 2 hr
ai/ay, ee/ea, oa/ow, ie, ue/ew, igh, oo (long), oo (short). Sorting + audio-cued spelling.

### C.6 R-controlled (~5 atoms) — 1 hr
ar, or, er-ir-ur, are/air, ear/eer.

### C.7 Diphthongs + soft c/g + schwa (~7 atoms) — 1.5 hr
oi/oy, ou/ow (different sound from vowel team ow), au/aw, soft c, soft g, dge, schwa.

### C.8 Six syllable types + division (~12 atoms) — 2 hr
Use `word-tagger` (Wave 3 widget) for syllable-type classification — students click each syllable, then click its type. Authentic ETC pattern.

### C.9 Heart Words (~18 atoms) — 1.5 hr
Each heart word gets a `sound-box` + `tap-hotspot` (tap the heart-marked irregular grapheme) + `letter-tile-spell` deck.

### C.10 Multisyllabic + morphology (~10 atoms) — 2 hr
Compound words, prefixes (un-/re-/dis-/pre-/mis-), suffixes (-ed/-ing/-er/-est/-ly/-ful/-less/-ness), Greek/Latin roots.

**Total Phase C output:** ~100 phonics atoms with real generators. Tim's class can drill any of them.

---

## Phase D — Mechanics generator expansion (build, 4-8 hr)

55 mechanics atoms; capitalize_proper_noun_person/place are the only 2 with generators. The capitalize family is fully template-able.

### D.1 Capitalization (~12 atoms) — 2 hr
All 12 capitalize atoms (sentence-start, pronoun I, proper noun person/place/month/title/acronym, proper adjective, direct quote, letter greeting, poetry line, geographic name). Same `two-button-binary` lead, with `tap-hotspot` and `mc-text` variants for harder bands.

### D.2 Punctuation (~12 atoms) — 2.5 hr
End marks, comma rules (series, date, intro, compound, direct address), apostrophe (possessive + contraction), quotation marks, colon, semicolon, hyphen.

### D.3 Spelling rules (~10 atoms) — 2 hr
HFW Fry 1-100, CVC, CVCe, FLOSS, doubling, drop-e, change-y-to-i, common confused words (their/there/they're).

---

## Phase E — Grammar + sentence structure + vocabulary (build, 6-12 hr)

### E.1 Grammar (~58 atoms) — 4-6 hr
Parts of speech is the biggest opportunity for the `word-tagger` widget. Each POS atom gets:
- `tap-hotspot` ("Tap the noun in this sentence")
- `sort-into-bins` ("Sort these words into Noun / Verb / Adjective bins")
- `word-tagger` ("Tag each word")
- `mc-text` ("Which word is the [POS]?")
- `drop-down-inline` for verb agreement / pronoun case

### E.2 Sentence structure (~21 atoms) — 2-3 hr
Fragments / run-ons / sentence types use `two-button-binary` heavily. Sentence combining uses `sentence-build`.

### E.3 Vocabulary (~54 atoms) — 3-4 hr
Synonyms / antonyms use `match-pairs`. Tier 2 academic words use `mc-image` + `fib-auto`. Context clues use `passage-mc-set` (Stage 3 widget already shipped). Prefixes/suffixes use `sort-into-bins` + `letter-tile-spell` for word-build.

---

## Phase F — MAP UI integration (build, 4-8 hr)

The engine works (`LiteracyMapSession` smoke-tested with Grade 3 starting RIT 185). UI integration:

### F.1 Reading 2-5 MAP session view (3-4 hr)
- Wire `goToMapReading25()` to instantiate a session
- Render the session's current item via the existing dispatcher
- Show RIT estimate + progress bar in the header
- Item-set support: when next item is part of a passage, render the passage once with `passage-render.js`, then the items beneath

### F.2 Reading K-2 MAP session view (2 hr)
- Same shape but with K-2 audio default ON, larger fonts, fewer answer choices

### F.3 Language Usage 2-12 MAP session view (2 hr)
- Same shape; pulls only Language Usage atoms

### F.4 Session results screen (1 hr)
- Final RIT, percentile (2025 norms), per-instructional-area breakdown, recommended next skills

---

## Phase G — Curated content authoring (build, days)

**Heavy lift; do after Phase D-F land.**

### G.1 Passage authoring tool (1 day)
A simple Node script that reads a CSV of skill_id + passage prompt + topic + lexile target, calls Claude API to draft a passage matching the spec, outputs JSON to `/data/literacy-content/`.

### G.2 Comprehension passages (~500 across K-5, days of agent work)
50 literary + 50 informational per grade K-5. Each passage gets 4-6 mixed-type comprehension questions.

### G.3 ORF passages (~50, 2 days)
Hasbrouck-Tindal aligned; word-count controlled per grade. Use UFLI passages where licensing permits.

### G.4 UFLI bulk import (1-2 days, after user provides bulk download)
Run an extraction script on the 128 lesson PDFs to generate roll-and-read JSON + decodable-passage JSON.

### G.5 Writing prompts + exemplars (~50, 1 day)
Spectrum Writing-style prompts with grade-appropriate exemplars.

---

## Phase H — Polish (build, ongoing)

### H.1 ETC-style page mode (3-4 hr)
Add `style_mode: "etc"` flag on Question. Triggers: instruction icon header, primary-school single-story font, B&W line-art image filter, multi-row batch-card layout for the 3 compound archetypes (Types 1, 2, 8).

### H.2 K-readiness atoms (~15-20, 2-3 hr)
Concept of Print (6), visual letter discrimination (3), letter formation skeletons (8-12). Per RESEARCH_FINDINGS §2.

### H.3 `letter-scan` widget (3-4 hr)
Scene illustration with multiple tappable target letters/objects. Per RESEARCH_FINDINGS §3.

### H.4 `letter-trace` widget (1 day)
Handwriting tracing canvas. Currently deferred Stage 4. Re-enables ~12 K-readiness atoms.

### H.5 OpenDyslexic font bundle (30 min)
Download the OFL-licensed font files into `/css/fonts/`.

### H.6 `column-letter-build` 3-5 column flexibility (1 hr)
Per ETC empirical sample: hardcoded 3 needs to support up to 5 for blend-level lessons.

---

## Recommended next 3 work units (live iteration order)

### Unit 1 — Phase A (audit) + B.1 (graceful fallback) + B.2 (skill browser)
**Why first:** Stop students from hitting dead ends. Unblock catalog access.
**Time:** 4-6 hr.
**Agent count:** 3-4 in parallel.
**Ship as:** Single PR or direct-to-master push. Math Quest unaffected.

### Unit 2 — Phase C (phonics generators)
**Why second:** Highest pedagogical value for Tim's class. ~100 phonics atoms playable.
**Time:** 8-16 hr (multiple commits).
**Agent count:** 5-10 across the 10 sub-domains.
**Ship as:** Iterative commits per sub-domain. Each commit goes live as soon as merged.

### Unit 3 — Phase D (mechanics generators) + Phase F.1 (Reading 2-5 MAP UI)
**Why third:** Mechanics is template-heavy = fast progress. MAP UI is the biggest "wow" feature for teachers.
**Time:** 8-12 hr.
**Agent count:** 3-5 in parallel.
**Ship as:** Iterative.

After Unit 3, Phase E + the rest of Phase F unfolds naturally. Phase G (curated content) starts after Unit 3 for parallel content authoring.

---

## Success metrics (per unit)

- **Unit 1 done:** 0 console errors when clicking through every hub path. Skill browser loads. Atoms without generators show graceful "coming soon" not error.
- **Unit 2 done:** Tim's class can drill any of ~100 phonics skills at any developmental band with mixed-mechanic decks.
- **Unit 3 done:** All capitalization + punctuation skills playable. Reading 2-5 MAP simulation runs a 10-item session with adaptive RIT. Tim sees his first per-student RIT report.
- **Phase C-F all done:** Literacy Quest is functionally on-par with Boom Cards for Tim's class — full catalog + MAP simulation + reports.
- **Phase G done:** Adds the comprehension + ORF + writing layers Boom can't match.
- **Phase H done:** Ships the differentiators (ETC visual fidelity, K-readiness, ELL/SPED accessibility, OpenDyslexic).

---

## Roll-back plan (if anything breaks live)

1. Open `js/modules/features.js`
2. Set `LITERACY_QUEST_ENABLED: false`
3. Commit + push to master
4. Hub button disappears on next page load
5. Math Quest loads as before — zero impact

If a specific generator or widget breaks live, the dispatcher gracefully falls back to "no widget for question type" or "[skill] — generator coming in Phase 2." Students don't see crashes, just stale content.
