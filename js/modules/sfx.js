// Procedural Web Audio sound effects.
// No audio files — every cue is synthesized via OscillatorNode + GainNode so
// the bundle stays static-only (GitHub Pages friendly) and we never block on
// asset loading. Fail-silent: if AudioContext is unavailable or a node throws
// we no-op.
//
// Public API:
//   playSfx(name)        — play one of the named cues
//   setSfxEnabled(bool)  — persists to localStorage 'mathquest_sfx_enabled'
//   isSfxEnabled()       — reads the same key (default: true)

const STORAGE_KEY = 'mathquest_sfx_enabled';

let audioCtx = null;
let resumeWired = false;

function getCtx() {
    if (audioCtx) return audioCtx;
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
        // Chrome / Safari refuse to start audio until a user gesture has
        // touched the context. Wire a one-shot pointerdown listener on first
        // creation so the next click resumes the context if it's suspended.
        if (!resumeWired) {
            resumeWired = true;
            const resume = () => {
                try { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); } catch (_) {}
                window.removeEventListener('pointerdown', resume);
                window.removeEventListener('keydown', resume);
            };
            window.addEventListener('pointerdown', resume, { once: true });
            window.addEventListener('keydown', resume, { once: true });
        }
        return audioCtx;
    } catch (_) {
        return null;
    }
}

// Small helper: schedule a tone at frequency `freq` starting at `t` for `dur`
// seconds with peak gain `peak`. Envelope is attack(5ms) → exponential decay.
function tone(ctx, t, freq, dur, peak, type = 'triangle') {
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    } catch (_) { /* fail-silent per cue */ }
}

// Pitch glide tone (sawtooth/sine) for woosh-style cues.
function glide(ctx, t, fStart, fEnd, dur, peak, type = 'sawtooth') {
    try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(fStart, t);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, fEnd), t + dur);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak), t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    } catch (_) { /* fail-silent */ }
}

const CUES = {
    // Ascending C5-E5-G5 arpeggio, ~150ms total. Triangle wave is bright but
    // not harsh; perfect for a "yes!" feel without being shrill.
    correct(ctx) {
        const t = ctx.currentTime;
        tone(ctx, t,        523.25, 0.18, 0.22, 'triangle'); // C5
        tone(ctx, t + 0.05, 659.25, 0.18, 0.22, 'triangle'); // E5
        tone(ctx, t + 0.10, 783.99, 0.30, 0.24, 'triangle'); // G5 (held longer)
    },
    // Soft descending minor 2nd. Sine + low gain so it never feels punishing.
    wrong(ctx) {
        const t = ctx.currentTime;
        tone(ctx, t,        330.00, 0.14, 0.10, 'sine');  // E4
        tone(ctx, t + 0.08, 311.13, 0.20, 0.10, 'sine');  // Eb4
    },
    // Major chord burst — C-E-G-C stacked with a bright square wave.
    levelup(ctx) {
        const t = ctx.currentTime;
        tone(ctx, t,        523.25, 0.30, 0.16, 'square'); // C5
        tone(ctx, t + 0.06, 659.25, 0.28, 0.16, 'square'); // E5
        tone(ctx, t + 0.12, 783.99, 0.26, 0.16, 'square'); // G5
        tone(ctx, t + 0.18, 1046.50, 0.32, 0.18, 'triangle'); // C6 cap
    },
    // Bright single note + chime overtone for the "you're on a roll" cue.
    streak(ctx) {
        const t = ctx.currentTime;
        tone(ctx, t,        880.00, 0.20, 0.20, 'triangle'); // A5
        tone(ctx, t + 0.02, 1760.00, 0.30, 0.10, 'sine');    // A6 sparkle
    },
    // Fast 4-note ascending sparkle. Sine waves keep it twinkly.
    badge(ctx) {
        const t = ctx.currentTime;
        tone(ctx, t,        1046.50, 0.10, 0.16, 'sine'); // C6
        tone(ctx, t + 0.06, 1318.51, 0.10, 0.16, 'sine'); // E6
        tone(ctx, t + 0.12, 1567.98, 0.10, 0.16, 'sine'); // G6
        tone(ctx, t + 0.18, 2093.00, 0.20, 0.18, 'sine'); // C7
    },
    // Tiny pop for button presses. Very short.
    click(ctx) {
        tone(ctx, ctx.currentTime, 1200, 0.03, 0.10, 'triangle');
    },
    // Descending sawtooth woosh for skip / dismiss.
    skip(ctx) {
        glide(ctx, ctx.currentTime, 600, 180, 0.08, 0.10, 'sawtooth');
    },
    // 4-note ascending fanfare for end-of-game wins.
    gameover(ctx) {
        const t = ctx.currentTime;
        tone(ctx, t,        523.25, 0.12, 0.20, 'triangle'); // C5
        tone(ctx, t + 0.08, 659.25, 0.12, 0.20, 'triangle'); // E5
        tone(ctx, t + 0.16, 783.99, 0.12, 0.20, 'triangle'); // G5
        tone(ctx, t + 0.24, 1046.50, 0.30, 0.24, 'triangle'); // C6
    },
};

export function playSfx(name) {
    if (!isSfxEnabled()) return;
    const cue = CUES[name];
    if (!cue) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
        if (ctx.state === 'suspended') {
            // Best-effort: try to resume; if it fails (no gesture yet), the
            // sound just won't play this time and the queued listener will
            // unlock on the next click.
            try { ctx.resume(); } catch (_) {}
        }
        cue(ctx);
    } catch (_) { /* fail-silent */ }
}

export function setSfxEnabled(enabled) {
    try {
        localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
    } catch (_) { /* ignore quota / privacy errors */ }
    // Reflect the new state in any visible toggle.
    try {
        const cb = document.getElementById('sfxToggle');
        if (cb) cb.checked = !!enabled;
    } catch (_) { /* DOM may not be ready */ }
}

export function isSfxEnabled() {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === null) return true; // default ON
        return v === '1';
    } catch (_) {
        return true;
    }
}

// Sync the nav toggle's checkbox with the persisted setting once the DOM is
// ready, so the UI reflects the saved preference on every page load.
if (typeof window !== 'undefined') {
    window.playSfx = playSfx;
    window.setSfxEnabled = setSfxEnabled;
    window.isSfxEnabled = isSfxEnabled;

    const syncToggle = () => {
        try {
            const cb = document.getElementById('sfxToggle');
            if (cb) cb.checked = isSfxEnabled();
        } catch (_) { /* non-fatal */ }
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncToggle, { once: true });
    } else {
        // DOM is already parsed — sync next tick to allow the toggle markup
        // to render if globals.js loaded after the body.
        setTimeout(syncToggle, 0);
    }
}
