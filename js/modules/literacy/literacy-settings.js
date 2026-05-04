// literacy-settings.js — Literacy Quest accessibility + scaffold settings.
//
// Persisted to a single cookie `mathquest_literacy_settings` (JSON-encoded).
// Applies CSS data attributes to <html> so literacy-quest.css selectors fire.
// Gated by FEATURES.LITERACY_QUEST_ENABLED — safe to import always.

import { FEATURES } from '../features.js';
import { state } from '../state.js';
import { setCookie, getCookie } from '../storage.js';

// ─── Schema defaults ──────────────────────────────────────────────────────────

const DEFAULTS = {
    ell_scaffold:       false,
    sped_scaffold:      false,
    audio_enabled:      true,
    contrast_mode:      'default',   // 'default' | 'high'
    font_face:          'default',   // 'default' | 'opendyslexic'
    font_scale:         100,         // 100 | 125 | 150 | 200
    last_grade:         'K',         // 'K' | '1' | '2' | '3' | '4' | '5'
    last_rit_band:      '141-150',   // e.g. '181-190'
    last_test_variant:  'reading-k2', // 'reading-k2' | 'reading-2-5' | 'language-usage'
    line_reader_enabled: false,
    reduce_motion:      false,
};

const COOKIE_KEY = 'mathquest_literacy_settings';

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the current settings object with defaults applied.
 * Never throws — returns defaults if cookie is missing or corrupt.
 */
export function getLiteracySettings() {
    const saved = getCookie(COOKIE_KEY);
    if (!saved || typeof saved !== 'object') return { ...DEFAULTS };
    // Merge: saved values override defaults; unknown keys from old schemas are dropped.
    const merged = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS)) {
        if (key in saved) merged[key] = saved[key];
    }
    return merged;
}

/**
 * Merges `updates` into the persisted settings and writes the cookie.
 * Only keys present in the schema are accepted.
 *
 * @param {Partial<typeof DEFAULTS>} updates
 */
export function saveLiteracySettings(updates) {
    const current = getLiteracySettings();
    for (const key of Object.keys(DEFAULTS)) {
        if (key in updates) current[key] = updates[key];
    }
    setCookie(COOKIE_KEY, current, 365);
    return current;
}

/**
 * Applies settings to the <html> element as data-lq-* attributes and to
 * the shared state object.  Called after every save and on page load.
 *
 * @param {typeof DEFAULTS} settings — result of getLiteracySettings()
 */
export function applyLiteracySettings(settings) {
    const html = document.documentElement;

    // ── contrast ──────────────────────────────────────────────────────────────
    if (settings.contrast_mode === 'high') {
        html.setAttribute('data-lq-contrast', 'high');
    } else {
        html.removeAttribute('data-lq-contrast');
    }

    // ── font face ─────────────────────────────────────────────────────────────
    if (settings.font_face === 'opendyslexic') {
        html.setAttribute('data-lq-font', 'opendyslexic');
    } else {
        html.removeAttribute('data-lq-font');
    }

    // ── font scale ────────────────────────────────────────────────────────────
    if (settings.font_scale && settings.font_scale !== 100) {
        html.setAttribute('data-lq-font-scale', String(settings.font_scale));
    } else {
        html.removeAttribute('data-lq-font-scale');
    }

    // ── reduce motion ─────────────────────────────────────────────────────────
    if (settings.reduce_motion) {
        html.setAttribute('data-lq-reduce-motion', 'true');
    } else {
        html.removeAttribute('data-lq-reduce-motion');
    }

    // ── line reader ───────────────────────────────────────────────────────────
    if (settings.line_reader_enabled) {
        html.setAttribute('data-lq-line-reader', 'enabled');
    } else {
        html.removeAttribute('data-lq-line-reader');
    }

    // ── shared state ──────────────────────────────────────────────────────────
    state.literacyEllScaffold  = Boolean(settings.ell_scaffold);
    state.literacySpedScaffold = Boolean(settings.sped_scaffold);
    // audio_enabled maps to state.ttsEnabled for literacy sessions
    // (only set if we're actually in a literacy session to avoid stomping
    //  the Math Quest default of always-ON)
    if ('audio_enabled' in settings) {
        state.audio_enabled = Boolean(settings.audio_enabled);
    }
}

/**
 * One-time page-load initializer.  Reads the persisted cookie and immediately
 * applies any saved accessibility settings.  Safe to call unconditionally;
 * no-ops (removes no attrs) when the cookie is absent.
 *
 * Gated by FEATURES.LITERACY_QUEST_ENABLED so the Math Quest page is
 * untouched when Literacy Quest is disabled.
 */
export function initLiteracySettings() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
    const settings = getLiteracySettings();
    applyLiteracySettings(settings);
}

/**
 * Resets all settings to defaults, writes the cookie, and reapplies.
 * Called by the "Reset to defaults" link in the settings panel.
 */
export function resetLiteracySettings() {
    const fresh = { ...DEFAULTS };
    setCookie(COOKIE_KEY, fresh, 365);
    applyLiteracySettings(fresh);
    return fresh;
}
