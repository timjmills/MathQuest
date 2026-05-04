# Literacy Quest — Live Risk Audit

**Date:** 2026-05-03
**Auditor:** Phase A automated sweep
**Scope:** All click-to-error and dead-end paths on the live `master` build with `FEATURES.LITERACY_QUEST_ENABLED = true`.

---

## 1. Summary

| Severity | Count | Description |
|----------|-------|-------------|
| HIGH | 1 | `state.mapMode = true` persists after MAP navigation and contaminates Math Quest sessions |
| MEDIUM | 3 | MAP view back-buttons route to Reading/Language Home without resetting `state.mapMode` |
| MEDIUM | 1 | `_genericMcText` fallback shows "Option A / B / C" with no real question content — misleading for placeholder phonics/mechanics atoms |
| MEDIUM | 1 | `_fallbackQuestion` renders a single-option "Coming soon" mc-text for all 8 strands with no gen file — auto-wins every card |
| LOW | 6 | 5 unregistered widget types (`build-with-tiles`, `chain-images`, `claim-evidence`, `open-response-fib`, `passage-hot-text`, `passage-mc-set`) referenced by 67 atoms — no crash today because those atoms are unreachable, but will break on skill-browser launch |
| LOW | 3 | Curated fluency atoms reference paths in `/data/literacy-content/` that don't exist — bypassed today by `_fallbackQuestion`, will crash when real generators are wired |
| INFO | 0 | No missing widget files, no broken imports, no missing window functions for current UI handlers |

**Net today:** 1 HIGH (Math Quest contamination), 4 MEDIUM (bad UX, no crash), 9 LOW (latent, not student-visible yet).

---

## 2. Generator Coverage Map

All 478 atoms audited. Three status categories:

- **real** — full procedural generator with multiple question variants
- **placeholder** — gen file exists but skill falls through to `_genericMcText`; returns a fixed mc-text card with "Option A/B/C" and stem `[skill_statement] — generator coming in Phase 2.`
- **no-gen-file** — strand has no `gen-*.js`; falls to `_fallbackQuestion` in `literacy-game-control.js`; returns a single-option mc-text "Coming soon" that auto-wins every card

| Strand | Total | Real | Placeholder | No-Gen-File | Gen File | Reachable via UI Now |
|--------|-------|------|-------------|-------------|----------|---------------------|
| phonemic_awareness | 35 | 0 | 0 | 35 | None | No |
| phonics | 151 | 1 | 150 | 0 | `gen-phonics.js` | 1 skill hardwired |
| fluency | 25 | 0 | 0 | 25 | None | No |
| vocabulary | 54 | 0 | 0 | 54 | None | No |
| comprehension_lit | 33 | 0 | 0 | 33 | None | No |
| comprehension_info | 26 | 0 | 0 | 26 | None | No |
| grammar | 58 | 0 | 0 | 58 | None | No |
| sentence_structure | 21 | 0 | 0 | 21 | None | No |
| mechanics | 55 | 2 | 53 | 0 | `gen-mechanics.js` | 1 skill hardwired |
| writing | 20 | 0 | 0 | 20 | None | No |
| **TOTAL** | **478** | **3** | **203** | **272** | — | **2 skills** |

**Currently reachable via hardwired Practice buttons:**
- `reading_phonics_short_a_initial` (Reading Home → Practice) — real generator, works correctly
- `language_mechanics_capitalize_proper_noun_person` (Language Home → Practice) — real generator, works correctly

The other 476 atoms cannot be reached without a skill browser. All live-session risks today are confined to the 2 hardwired atoms plus the MAP navigation state leak.

**Placeholder UX detail:**
- Phonics/mechanics non-real atoms: `_genericMcText` returns a card whose stem includes the skill statement plus " — generator coming in Phase 2." Options are literally "Option A", "Option B", "Option C" with A always correct. Clicking A shows "Correct!" and advances. No crash, but pedagogically useless and potentially confusing.
- No-gen-file strands: `_fallbackQuestion` returns a single "Coming soon" button. Clicking it shows "Correct!" instantly and auto-advances. A 10-card session completes 10/10 in about 9 seconds.

---

## 3. Widget Reference Gaps

26 widget types are registered in `LITERACY_WIDGETS`. Atom `question_types` arrays reference 28 distinct types. Two are unregistered — and 4 more are pseudo-widgets (compound types not yet built):

| Unregistered Type | Atom References | Affected Strands | Stage |
|-------------------|-----------------|------------------|-------|
| `build-with-tiles` | 24 | phonics (21), mechanics (3) | Stage 3 (deferred) |
| `chain-images` | 1 | phonics | Stage 3 |
| `claim-evidence` | 17 | comp-lit (12), comp-info (5) | Stage 3 |
| `open-response-fib` | 21 | comp-lit (5), sentence-structure (8), writing (5), comp-info (3) | Stage 3 |
| `passage-hot-text` | 3 | fluency | Stage 3 |
| `passage-mc-set` | 8 | fluency (3), comp-lit (3), comp-info (2) | Stage 3 |

**Total atoms with at least one unregistered widget type: 67 of 478.**

**Current live risk: NONE.** All 67 affected atoms are unreachable via current UI (no skill browser). The generator fallbacks (`_genericMcText`, `_fallbackQuestion`) ignore `question_types` and hardcode `mc-text`, so the unregistered types are never actually passed to `renderLiteracyQuestion`.

**Risk on skill-browser launch (Phase B.2): HIGH.** When the skill browser allows students to tap any atom, a phonics atom like `reading_phonics_multisyllabic_compound` (which lists `build-with-tiles` as its first question_type) will have `_pickMechanic` select it. The phonics fallback `_genericMcText` ignores this and still returns `mc-text` — so no crash. However, for strands without a gen file, `_fallbackQuestion` also ignores question_types. **Conclusion:** the fallback architecture shields against crashes even post-skill-browser. What it cannot prevent is a student seeing "Option A / B / C" for a morphology skill. That is a medium-UX issue, not an error.

**Exception:** If a future generator is added for, say, comp-lit atoms and directly dispatches to `claim-evidence` without checking widget registration, `renderLiteracyQuestion` will hit the `No widget for question type` branch and render a `<div class="lq-error">` message. That is the actual HIGH risk to watch for during Phase C-E generator expansion.

---

## 4. Curated Path Failures

Three fluency atoms have `content_strategy: 'curated'` with `curated_content_path` pointing into `/data/literacy-content/` which does not exist:

| Skill ID | Path |
|----------|------|
| `reading_fluency_decodable_passage_set5` | `/data/literacy-content/reading/fluency-passages/ufli-set5/passage-001.json` |
| `reading_fluency_decodable_passage_set9` | `/data/literacy-content/reading/fluency-passages/ufli-set9/passage-001.json` |
| `reading_fluency_decodable_passage_set11` | `/data/literacy-content/reading/fluency-passages/ufli-set11/passage-001.json` |

**What happens today:** These atoms have `strand: 'fluency'`. `_buildDeck` finds no entry for `'fluency'` in `DECK_BUILDERS`, falls to `_fallbackQuestion`, which returns a hardcoded `mc-text` card and never touches `curated_content_path`. **No file fetch is attempted. No crash.**

**What happens when a fluency generator is added (Phase C):** If the new generator reads `skillAtom.curated_content_path` and does `fetch(path)` or dynamic `import(path)`, it will 404 or throw a module-not-found error. This will surface as either an uncaught Promise rejection or a `lq-error` div. **Fix required before fluency generator ships:** add a null-check with graceful fallback before reading curated content.

---

## 5. MAP Entry-Point Cross-Contamination Check

**FAIL — HIGH severity.**

Path:
1. Student clicks "MAP Quest — K-2" on Reading Home
2. `goToMapReadingK2()` runs: sets `state.mapMode = true`, `state.mapVariant = 'reading-k2'`, shows `mapReadingK2View` (static placeholder)
3. Student clicks "← Reading Quest" back button
4. `goToReadingHome()` runs: sets `state.subject = 'reading'`, shows `readingHomeView` — **does NOT reset `state.mapMode`**
5. Student clicks "← Quest Hub", then "Math Quest" card
6. `goToMathHome()` runs: sets `state.subject = 'math'`, shows `homeView` — **does NOT reset `state.mapMode`**
7. `state.mapMode` is still `true`
8. Student selects a math skill and clicks Start Game
9. `answer-check.js` hits `state.mapMode === true` branches at lines 100, 231, 380, 559, 743, 1092, 1423, 1553, 1745, 1918, 2107, 2370, 2521, 2669, 2858

**Effect:** `answer-check.js` attempts to call `window.recordMapAnswer()` (the Math MAP engine function) after each correct answer. If the user arrived via literacy MAP, a Math MAP session was never initialized, so `window.recordMapAnswer` will operate on a null/undefined session object. Depending on the Math MAP engine's null-guards, this may silently fail or throw.

**Mitigating factor:** `goHome()` and `exitGame()` in `navigation.js` both explicitly reset `state.mapMode = false`. If the student navigates via one of those paths instead of the literacy back-buttons, they are safe. The contamination only occurs when students use the literacy-specific `goToMathHome()` / `goToReadingHome()` / `goToLanguageHome()` / `goToHub()` shortcuts that bypass `goHome()`.

**Confirmed safe paths:** Home button (runs `goHome()`) → `state.mapMode = false` before returning to math.

---

## 6. Inline-Handler Audit

All onclick handlers in literacy view divs verified against `window` after `initLiteracy()` runs with flag ON.

| Handler | Defined In | Attached to `window` | Pass/Fail |
|---------|-----------|---------------------|-----------|
| `goToHub()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `goToMathHome()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `goToReadingHome()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `goToLanguageHome()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `goToMapReadingK2()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `goToMapReading25()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `goToMapLanguageUsage()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `goToLiteracyDashboard()` | `literacy-navigation.js` | Yes, in `initLiteracy()` | PASS |
| `openLiteracySettings()` | `literacy-settings-panel.js` | Yes, in `initLiteracy()` | PASS |
| `closeLiteracySettings()` | `literacy-settings-panel.js` | Yes, in `initLiteracy()` | PASS |
| `getLiteracySettings()` | `literacy-settings.js` | Yes, in `initLiteracy()` | PASS |
| `window.startLiteracyPractice` (guarded) | `literacy-game-control.js` | Yes, side-effect import | PASS |

**Reading Home Practice button** uses a guard pattern: `window.startLiteracyPractice && window.startLiteracyPractice('reading_phonics_short_a_initial')`. This is safe — if the function is not yet attached (race condition), it silently does nothing instead of throwing a ReferenceError.

**Language Home Practice button** uses the same guard pattern for `language_mechanics_capitalize_proper_noun_person`. Safe.

**No inline handler failures detected.** All 12 functions are present on `window` after module load completes.

---

## 7. Recommended Fixes — Prioritized by Severity

### HIGH

**H-1: Reset `state.mapMode` in all literacy navigation functions.**

File: `js/modules/literacy/literacy-navigation.js`

Add `state.mapMode = false;` to `goToHub()`, `goToMathHome()`, `goToReadingHome()`, and `goToLanguageHome()`. The MAP-specific functions (`goToMapReadingK2`, etc.) intentionally set it true, so leave those alone. The back-navigation functions are the exit points where it must be cleared.

```js
export function goToHub() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) { showView('homeView'); return; }
    state.subject = null;
    state.mapMode = false;   // ADD THIS
    showView('questHubView');
}

export function goToMathHome() {
    state.subject = 'math';
    state.mapMode = false;   // ADD THIS
    showView('homeView');
}
// Same pattern for goToReadingHome and goToLanguageHome
```

**Time:** 5 minutes. Zero risk to Math Quest.

---

### MEDIUM

**M-1: Replace `_genericMcText` with a graceful "coming soon" card.**

File: `js/modules/literacy/gen-phonics.js` and `js/modules/literacy/gen-mechanics.js`

The current placeholder (`"[skill statement] — generator coming in Phase 2."` with `Option A / B / C`) is confusing to students. Phase B.1 work: replace the fallback with a non-interactive card that shows the skill statement, a friendly "Coming soon" message, and a "Try a related skill" suggestion. This requires a new widget type `coming-soon` or can be done by returning a special flag on the question object that `startLiteracyPractice` checks before building a deck.

**Recommended approach for B.1:** check `skillAtom.skill_id` against a set of `LIVE_SKILLS`; if not live, skip the session start and show an interstitial screen (not a game session) with skill info + "Try [related live skill]".

**M-2: Replace `_fallbackQuestion` with the same graceful interstitial.**

File: `js/modules/literacy/literacy-game-control.js`

The single-option "Coming soon" that always auto-wins is worse than the gen-file placeholder because it moves through 10 cards silently. Same B.1 fix applies: gate `startLiteracyPractice` at the top of the function, before deck building, and show the interstitial instead of launching a session.

**M-3: MAP view back-buttons should also reset `state.mapMode`.**

Even after H-1 is fixed, the MAP placeholder views show a "← Reading Quest / ← Language Quest" back button. These call `goToReadingHome()` / `goToLanguageHome()` which (after H-1) will reset `mapMode`. No separate fix needed once H-1 lands.

**M-4: MAP placeholder views need "Coming soon" branding.**

Current `mapReadingK2View`, `mapReading25View`, `mapLanguageUsageView` contain bare text. Per Phase B.3: add teaser copy, a visual, and a cookie-flag "Notify me" button so teachers know this is intentionally coming, not broken.

---

### LOW

**L-1: Document the 6 unregistered widget types before Phase B.2 skill-browser launch.**

Add them to `QUESTION_TYPES.md` as "Stage 3 — not yet implemented." When future generator expansions reference them, the dispatcher will show a `lq-error` div if the widget isn't registered. Add a safety check in `renderLiteracyQuestion`: log a `console.warn` (not error) and fall back to `mc-text` with the stem, rather than showing a raw error string.

**L-2: Guard curated content paths before fluency generator lands.**

When the Phase C fluency generator is written, wrap the `curated_content_path` fetch in a try/catch that falls back to a procedural question if the file is missing. Example:

```js
try {
    const module = await import(skillAtom.curated_content_path);
    // use module.default
} catch {
    return _proceduralFluency(skillAtom, rng);  // graceful fallback
}
```

**L-3: `_genericMcText` in both gen files uses placeholder options with no educational value.**

Low priority only because those atoms are unreachable today. Before Phase B.2 ships, either fix or gate them.

---

## 8. Phase B.1 + B.2 Atomic Fixes

### B.1 — Graceful fallback (priority order)

1. **H-1 fix (5 min):** Add `state.mapMode = false` to `goToHub`, `goToMathHome`, `goToReadingHome`, `goToLanguageHome` in `literacy-navigation.js`.

2. **Gate non-live skills at session start (1 hr):** In `startLiteracyPractice`, before `_buildDeck`, check if `skillAtom.skill_id` is in a `LIVE_SKILLS` set. If not, call a new `_showComingSoonInterstitial(skillAtom)` function that renders a friendly card inside `gameView` instead of launching a session. The card should show: skill statement, RIT band, prerequisite skills (from `skillAtom.prerequisite_skill_ids`), and "Try related skill" buttons that call `startLiteracyPractice(prereqId)` only for skills in `LIVE_SKILLS`.

3. **Add `LIVE_SKILLS` constant (10 min):** In a new file `js/modules/literacy/live-skills.js`, export a `Set` of the 3 currently-real skill IDs. Extend it as generators land.

4. **Add a `renderLiteracyQuestion` fallback for unregistered widgets (20 min):** Change the `if (!w)` branch from rendering a `lq-error` div to: log `console.warn`, return a minimal `mc-text` card with the original stem.

### B.2 — Skill browser prerequisites

Before the skill browser can route to any of the 478 atoms without crashing:

1. H-1 must be fixed (mapMode contamination)
2. The `LIVE_SKILLS` gate from B.1 must be in place (so clicking any non-live skill shows the interstitial, not a broken session)
3. The unregistered-widget fallback from B.1 step 4 must be in place (so no `lq-error` divs appear even if a generator accidentally picks an unregistered type)

After those three are done, the skill browser can route to any atom safely. The worst case is the "Coming soon" interstitial, not an error.
