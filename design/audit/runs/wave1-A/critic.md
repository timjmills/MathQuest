# Wave 1 lane A critic (Sonnet low, static + screenshots)
Verdict: FAIL (not browser-verified for options panel; ws-options-verify did not finish in 120s).
Scores: C1 ease 7, C2 teaching/scaffold 8, C3 layout/spacing 7, C4 owner-fidelity 6. Overall 7.
Blocking:
1. worksheet.js:1451 per-card Skip is always visible (only hidden if skipAfter=0). Owner 1.3: shown only after N wrong tries. Screenshot worksheet-current-1280 shows Skip on all cards. Fix: render hidden, reveal per card after N wrong checks.
2. skill-options.js:3261 calculator/skipAfter added to UNIVERSAL_OPTIONS but never confirmed in the panel or ws-options-verify (GEN-differs checks likely fail for options that do not change generation). Run it and exempt/handle.
3. skip-after-5-390.png shows no Skip button on screen; evidence that skip appears after 5 tries is missing.
4. screen-cell.css:1324-1330 pulse also on every :focus input and #questionPaper inputs; yellow flash applies to all focused inputs, including quiz/MAP; reduced-motion block removes animation but yellow stays (ok). Print rule is a no-op safeguard only.
Other:
5. questions with skipAfter via q.skillOptions rely on state.skillOptions; MAP/quiz Skip paths (map-engine.js:371 uses stale #skipBtn id) not retested.
6. student-home-390: Choose Mode shows only the mascot; mode cards hidden, ok, but four full-width orange buttons sit far below the fold (scroll ~1500px); MAP buttons are at the bottom as required.
7. Hint speak button: cancel on close is good; speakHint ignores tts setting as intended.
8. totalSkipsEver is now only a counter; lastActionWasSkip still reset, dead code.
