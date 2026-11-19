// The correct-answer sound (owner request 2026-11-14, "B, power-up"): four rising square-wave notes,
// C5 E5 G5 (70 ms each) then C6 held 400 ms with an exponential decay. Synthesised with the Web Audio API
// (no audio file), at a moderate peak gain with a short attack and release on every note so nothing clicks.
//
// It is played from the one place each host decides an answer is correct (answer-check.js for the practice
// card, worksheet.js wsRecordAnswer for the online worksheet, quiz-take.js refreshQuizFeedback for the quiz),
// and ONLY while the Sound toggle (#sfxToggle, sfx.js isSfxEnabled) is on. A second call within
// DEDUPE_MS of the last play is ignored, so one answer never sounds twice.
//
// Public API:
//   POWERUP_NOTES          the note plan [{freq, dur, decay}] (seconds); ws-correct-sound asserts it
//   POWERUP_PEAK           the peak gain of each note
//   playCorrectSound()     play once (gated by the Sound toggle); returns true when it scheduled the notes
//   scheduleCorrectSound(ctx, t0)  schedule the notes on any (Offline)AudioContext; returns the end time

import { isSfxEnabled } from './sfx.js';

export const POWERUP_NOTES = Object.freeze([
    Object.freeze({ name: 'C5', freq: 523.25, dur: 0.070, decay: false }),
    Object.freeze({ name: 'E5', freq: 659.25, dur: 0.070, decay: false }),
    Object.freeze({ name: 'G5', freq: 783.99, dur: 0.070, decay: false }),
    Object.freeze({ name: 'C6', freq: 1046.50, dur: 0.400, decay: true }),
]);
export const POWERUP_PEAK = 0.13;
const ATTACK = 0.004;      // s: short ramp in, no click
const RELEASE = 0.010;     // s: short ramp out at the end of each held note
const DEDUPE_MS = 300;

let audioCtx = null;
let resumeWired = false;
let lastPlayAt = -Infinity;

function getCtx() {
    if (audioCtx) return audioCtx;
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
        if (!resumeWired) {
            resumeWired = true;
            const resume = () => {
                try { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch (_) { /* ignore */ }
            };
            window.addEventListener('pointerdown', resume, { once: true, capture: true });
            window.addEventListener('keydown', resume, { once: true, capture: true });
        }
        return audioCtx;
    } catch (_) {
        return null;
    }
}

/** Schedule the power-up on `ctx` from time `t0`; returns the time the last note ends. */
export function scheduleCorrectSound(ctx, t0) {
    let t = t0;
    for (const n of POWERUP_NOTES) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(n.freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(POWERUP_PEAK, t + ATTACK);
        if (n.decay) {
            gain.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);
        } else {
            gain.gain.setValueAtTime(POWERUP_PEAK, t + n.dur - RELEASE);
            gain.gain.linearRampToValueAtTime(0.0001, t + n.dur);
        }
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + n.dur + 0.01);
        t += n.dur;
    }
    return t;
}

/** Play the correct-answer sound once, if the Sound toggle is on. */
export function playCorrectSound() {
    if (!isSfxEnabled()) return false;
    const now = Date.now();
    if (now - lastPlayAt < DEDUPE_MS) return false;
    const ctx = getCtx();
    if (!ctx) return false;
    lastPlayAt = now;
    try {
        if (ctx.state === 'suspended') { try { ctx.resume(); } catch (_) { /* gesture listener will */ } }
        scheduleCorrectSound(ctx, ctx.currentTime + 0.01);
        if (typeof window !== 'undefined') window.__mqCorrectSoundPlays = (window.__mqCorrectSoundPlays || 0) + 1;
        return true;
    } catch (_) {
        return false;   // fail-silent: never break the answer flow
    }
}

if (typeof window !== 'undefined') {
    window.playCorrectSound = playCorrectSound;
    window.MQ_CORRECT_SOUND = { POWERUP_NOTES, POWERUP_PEAK, scheduleCorrectSound };
}
