# js/modules/shared/quest-core/

Reusable infrastructure shared by Math Quest, Reading Quest, and Language Quest.

**Important:** During the Literacy Quest expansion, modules in this folder are *re-exports* or stub-references to the existing Math Quest modules. We do not physically move files in Phase 1 — that risks breaking Math Quest. Instead we document the shared surface here and gradually migrate true shared logic.

The 19 reusable modules from `/docs/literacy-quest/STUDY_NOTES.md` §7:

1. `state.js` — shared mutable state pattern
2. `storage.js` — cookie + localStorage wrappers
3. `utils.js` — `randInt`, `shuffle`, `pick`, `normalizeText`, `buildNumericOptions`
4. `gamification.js` — XP, levels, badges, streaks (overrideable per subject)
5. `progress.js` — skill progress, mastery, adaptive difficulty
6. `dashboard.js` — session history UI, streak calendar
7. `ui-core.js` — `showToast`, `confetti`, theme toggle
8. `navigation.js` — `showView()` (view IDs are app-specific)
9. `hints-speech.js` — TTS via Web Speech API with voice warming
10. `quiz-storage.js` — IndexedDB persistence (math-only currently; literacy doesn't need it)
11. `print-settings.js` + `print-generate.js` — worksheet pipeline
12. Widget pattern (each widget exports `render*` + `check*`)
13. `widget-retry.js` — `isFirstAttempt`, `markFirstAttempt`, `markAllCorrectFired`
14. Answer-check dispatcher pattern
15. MAP adaptive engine (`map-engine.js`) — Rasch 1PL
16. `variables.css` — CSS custom properties + dark mode
17. `settings-panel.js` (extend with literacy options)
18. `skill-codes.js` — URL share scheme (extended with M:/R:/L: subject prefix)
19. Game stats banner, on-task timer, inactivity modal, fullscreen prompt — already-built attention features

## Math-only modules that DO NOT live here

- `numpad-input.js` (digits 0-9)
- All `gen-*.js` math generators
- `data.js` DOMAINS / SKILLS arrays for math
- Math-only widgets (base10-build, coord-plot, factor-pairs, clock-set, etc.)
