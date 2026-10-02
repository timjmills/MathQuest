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

# Round 2 critic (Opus low, browser-verified, 503f3d9)
Verdict: PASS. Scores: C1 ease 8, C2 teaching/scaffold 8, C3 layout/spacing 8, C4 owner-fidelity 8.
Runs: wave1-a-probe OK (34 PASS, 1280 + 390); test-wrong-retry-skip OVERALL PASS (needs PUPPETEER_EXECUTABLE_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome and a server on :8080; it crashes without them); ws-options-verify --skill add_facts OK 34/34 incl. calculator=true, skipAfter=0/2/20; ws-boot-smoke OK; ws-screen-answer OK (3 skills x card/worksheet/quiz).
Round-1 defects: 1 FIXED (Skip rendered display:none, revealed per card at skipAfter wrong checks; probe: card 0 shown after 5, card 1 hidden; worksheet-skip-after-5-1280.png shows Skip on card 1 only). 2 FIXED (behaviour branch is a real test: generation and printed page must be unchanged, share-code trip, store -> generateQuestion -> calcAllowedFor / isSkipAvailable at value-1, value, value+3; not an exemption). 3 FIXED (skip-after-5-390.png shows Skip with 2 struck answers in history; probe [false,false,false,false,true]). 4 FIXED (pulse selectors scoped to #gameView #questionCard, active worksheet card, .qt-question-card; reduced motion animation:none, steady yellow). 5 FIXED in code (map-engine uses skipQuestionBtn) but NOT proven, see R2-1. 6 FIXED (four Start buttons 2x2 in first screen at 390, top 621 bottom 765; MAP K-2/3-5/K-5 remain at the bottom).

Defects (ranked):
R2-1 tests/scripts/test-wrong-retry-skip.cjs:201-207 (MAP K-2, 3-5, standard flows). Observed: 2 wrong tries, skipVisible=false, then the test .click()s the hidden #skipQuestionBtn and reports PASS. It never checks Skip appears at the 5th try in MAP, and answer-check.js:443 skipCurrentItem's MAP branch has no isSkipAvailable() guard, so a hidden-button click skips. C4 -1 (owner 1.3 unproven on MAP), C2 0. Fix: add `if (!isSkipAvailable()) return;` at the top of skipCurrentItem's MAP branch; update the test to make 4 wrong tries (assert skipVisible=false), a 5th (assert true), then click. Check: test reports skipVisible=[f,f,f,f,t] for both MAP flows and a click at 2 tries leaves itemCount unchanged.
R2-2 design/audit/runs/wave1-A/practice-card-pulse-1280.png. Observed: the answer box is below the fold (only "6" of the item visible, toast over it); the image does not show the pulse it is named for. C3 evidence -1 for the 1280 host. Fix: scrollIntoView the active slot and dismiss the toast before the shot. Check: PNG shows the yellow box with ring.
R2-3 js/modules/game-control.js:146. Empty `if (status === 'correct' || status === 'incorrect') { }` left after removing lastActionWasSkip; the comment above it is now false. Code quality, 0 points. Fix: delete the comment and the empty block. Check: grep lastActionWasSkip returns nothing and the block is gone.
R2-4 index.html:352 Start buttons now sit above "Game Setup" under the line "Customize your challenge below". C1 -0 now, but a pupil pressing Start first gets the default skill (Count Objects). Fix: change the line to "Pick a skill below, or start now" or show the chosen skill name on the buttons. Check: 390 screenshot shows the chosen skill beside the Start buttons.
R2-5 practice-card-pulse-1280.png header reads "Mixed Mode (All Categories)" for a one-skill run (pre-existing, outside lane). Not scored.

To reach 10: C1 show the chosen skill with the Start buttons (R2-4); C2 a guarded, tested MAP skip (R2-1); C3 evidence PNGs that show the feature at both widths (R2-2); C4 R2-1 plus a worksheet behaviour check in ws-options-verify (skipAfter currently tested on the practice gate only, not wsNoteWrong).
