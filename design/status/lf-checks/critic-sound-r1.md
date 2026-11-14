# Critic r1: correct-answer sound "B, power-up" (narrow, independent, Opus medium)

Graded: `git diff 84f8813a1..06b8d2104` on `claude/sweet-newton-c8wrv1-lf-tools-sound`, 2026-11-14.

## Verdict: PASS (C1 9, C2 9, C3 10, C4 9)

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 9 | One short cue on a correct answer, nothing on a wrong one; follows the existing Sound toggle (#sfxToggle), which persists in localStorage and is re-read at every play, so "off" survives a reload. No new control to learn. |
| C2 Educational value | 9 | Clear positive feedback with no penalty sound; the quiz stays silent unless it gives instant feedback, so an end-of-quiz test cannot leak correctness. Retyping the same correct answer does not replay. |
| C3 Spacing and layout | 10 | No markup or CSS change; no layout on any host moved. |
| C4 Standard fidelity | 9 | Spec met (below). CLAUDE.md: no CSS touched, window export added in globals.js (import + Object.assign) and in the module, all six modified modules pass `node --input-type=module --check`, ws-boot-smoke OK. |

## Spec check (js/modules/correct-sound.js)
- Notes: square, C5 523.25 / E5 659.25 / G5 783.99 / C6 1046.50 Hz; 70 / 70 / 70 / 400 ms; only the last decays (exponential to 0.0001). Correct.
- Envelopes: 4 ms linear attack from 0.0001 on every note; 10 ms linear release on the short notes; the decay closes the last. Click-free.
- Peak gain 0.13 (square, RMS about -19 dBFS): moderate.
- Lazy AudioContext created on first play; resumes on pointerdown / keydown (once, capture) and on play. No Web Audio: returns false, no throw; the scheduling is inside try/catch.
- 300 ms dedupe: one answer never sounds twice even if two hosts' paths fire.

## Wiring
- Card: `celebrateCorrect` and `_celebrateCorrectAnswer` (answer-check.js) and `_celebrateMapCorrect` (map-engine.js) now call `playCorrectSound` instead of `playSfx('correct'|'streak')`. grep: no `playSfx('correct')` / `'streak'` call site remains, so no old + new double play.
- Worksheet: `wsRecordAnswer` plays once per item (Set, cleared by `newWorksheet`). Wrong path (`wsNoteWrong`) untouched.
- Quiz: `recordAnswer` plays only when correct, not partial, newly correct, and `showFeedback === 'instant'`.
- Wrong-answer paths: unchanged on all three hosts.

## Gates run
- `ws-correct-sound.mjs` (via /tmp/mq-browser-run.sh): OK, 18/18 (card / worksheet / quiz x correct-on / wrong-on / correct-off x 1280 / 1024).
- Honesty: the stub replaces only `AudioContext`; the real `playCorrectSound` -> `scheduleCorrectSound` path runs and the spy counts square oscillators at C6. Honest.
- Mutation (scratch worktree, `isSfxEnabled` guard removed): gate FAILS on all six Sound-off runs. Good.
- `ws-backtest --row correct-sound-powerup-once`: PASS (fail state FAIL, pass state OK).
- `ws-boot-smoke`: OK.

## WAV (design/status/lf-checks/sound/powerup.wav)
44.1 kHz mono, 0.75 s file; sound starts at 20 ms and is scheduled for 3 x 70 + 400 = 610 ms. FFT per segment: 523.2, 659.1, 783.9, 1046.4 Hz (match). C6 peak falls 0.127 -> 0.0002 across its 400 ms (exponential decay). Peak 0.129.

## Minor (not blocking; machine-check suggestions)
1. Gate gap: no quiz case with `showFeedback: 'end'` (should be 0 plays). Add it to SOUND-ONCE.
2. Gate gap: the worksheet's per-item Set is masked by the module's 300 ms dedupe (both checks fire within ms). Add a second correct verdict on the same item after > 300 ms, want 0.
3. The backtest fail state is "module absent", which fails trivially; a fail state with the guard removed (as in this round's mutation) would prove SOUND-ONCE's off-branch.
4. The streak-milestone cue is gone with the old correct cue (builder choice, consistent with "replace"); note for the owner.
5. A second AudioContext beside sfx.js's; sharing one would be tidier.
