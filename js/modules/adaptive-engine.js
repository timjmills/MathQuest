// adaptive-engine.js — per-skill difficulty ladder for Whole-Program Adaptive Mode.
//
// Approach B from "Adaptive Mode Research.md" — each selected skill gets its own
// 1-5 level. Promotion rule: 3 consecutive correct answers → level up. Demotion
// rule: 2 consecutive wrong answers → level down. Level state persists per-skill
// across sessions via localStorage so a student picks up where they left off.
//
// Adaptive mode is OPT-IN. When `state.adaptiveModeEnabled === false` (the
// default), every helper short-circuits and the original generator output passes
// through untouched. MAP mode (which has its own adaptive engine) is NEVER
// touched by this module.

import { state } from './state.js';
import { SKILLS } from './data.js';

// 1=easiest, 5=hardest. New skills start mid-ladder so progression can move
// either direction quickly.
const DEFAULT_LEVEL = 3;
const MIN_LEVEL = 1;
const MAX_LEVEL = 5;

// Promotion/demotion thresholds.
const PROMOTE_AFTER = 3; // consecutive correct
const DEMOTE_AFTER = 2;  // consecutive wrong

const LS_KEY = 'mathquest_adaptive_levels';
const TOGGLE_LS_KEY = 'mathquest_adaptive_enabled';

// Range ladder: maps level 1-5 → maximum operand magnitude. Generators read
// `state.range` for everything from add facts to word problems, so swapping it
// is the single safest knob.
const RANGE_BY_LEVEL = { 1: 10, 2: 20, 3: 100, 4: 1000, 5: 10000 };
// Decimal-place ladder for skills that opt-in to decimals.
const DECIMALS_BY_LEVEL = { 1: 0, 2: 0, 3: 1, 4: 2, 5: 2 };

// Skills with explicit easy/medium/hard variants — adaptive level snaps to the
// matching variant instead of just nudging range. Keys are the *base* skill;
// values are { level: skillId } maps. If only easy/hard exist, mid-levels reuse.
const VARIANT_LADDERS = {
    elapsed_visual: {
        1: 'elapsed_visual_easy',
        2: 'elapsed_visual_easy',
        3: 'elapsed_visual_medium',
        4: 'elapsed_visual_hard',
        5: 'elapsed_visual_hard',
    },
    function_table: {
        1: 'function_table_easy',
        2: 'function_table_easy',
        3: 'function_table_easy',
        4: 'function_table_hard',
        5: 'function_table_hard',
    },
    oop: {
        1: 'oop_easy',
        2: 'oop_easy',
        3: 'oop_medium',
        4: 'oop_medium',
        5: 'oop_hard',
    },
    factor_tchart: {
        1: 'factor_tchart_easy',
        2: 'factor_tchart_easy',
        3: 'factor_tchart_medium',
        4: 'factor_tchart_hard',
        5: 'factor_tchart_hard',
    },
    factor_links: {
        1: 'factor_links_easy',
        2: 'factor_links_easy',
        3: 'factor_links_medium',
        4: 'factor_links_hard',
        5: 'factor_links_hard',
    },
    gcf: {
        1: 'gcf_easy',
        2: 'gcf_easy',
        3: 'gcf_easy',
        4: 'gcf_hard',
        5: 'gcf_hard',
    },
};

function emptyEntry() {
    return { level: DEFAULT_LEVEL, recentCorrect: 0, recentWrong: 0, history: [] };
}

function persistAdaptiveLevels() {
    try {
        if (state.adaptiveLevels) {
            localStorage.setItem(LS_KEY, JSON.stringify(state.adaptiveLevels));
        }
    } catch { /* localStorage unavailable — ignore */ }
}

function persistAdaptiveToggle() {
    try {
        localStorage.setItem(TOGGLE_LS_KEY, state.adaptiveModeEnabled ? '1' : '0');
    } catch { /* ignore */ }
}

// Initialize the per-session bookkeeping. Restores saved per-skill levels and
// the on/off toggle from localStorage. Idempotent — safe to call multiple times.
export function initAdaptiveSession() {
    if (!state.adaptiveLevels) state.adaptiveLevels = {};
    try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                Object.assign(state.adaptiveLevels, parsed);
            }
        }
    } catch { /* ignore */ }
    try {
        const toggle = localStorage.getItem(TOGGLE_LS_KEY);
        if (toggle === '1') state.adaptiveModeEnabled = true;
        if (toggle === '0') state.adaptiveModeEnabled = false;
    } catch { /* ignore */ }
    // Reflect the loaded state on the top-nav button label, if present.
    updateAdaptiveStatusUI();
}

export function getAdaptiveLevel(skillId) {
    if (!skillId) return DEFAULT_LEVEL;
    if (!state.adaptiveLevels) state.adaptiveLevels = {};
    if (!state.adaptiveLevels[skillId]) state.adaptiveLevels[skillId] = emptyEntry();
    return state.adaptiveLevels[skillId].level;
}

// Record a correct/wrong answer for the per-skill ladder. Returns
// { promoted, demoted, newLevel, prevLevel } when the level changes; null
// otherwise. Caller can show a toast based on the return value.
export function recordAdaptiveAnswer(skillId, isCorrect) {
    if (!state.adaptiveModeEnabled) return null;
    if (!skillId) return null;
    if (!state.adaptiveLevels) state.adaptiveLevels = {};
    if (!state.adaptiveLevels[skillId]) state.adaptiveLevels[skillId] = emptyEntry();
    const entry = state.adaptiveLevels[skillId];
    const prevLevel = entry.level;

    entry.history.push({ correct: !!isCorrect, ts: Date.now() });
    if (entry.history.length > 20) entry.history.shift();

    let result = null;
    if (isCorrect) {
        entry.recentCorrect = (entry.recentCorrect || 0) + 1;
        entry.recentWrong = 0;
        if (entry.recentCorrect >= PROMOTE_AFTER && entry.level < MAX_LEVEL) {
            entry.level++;
            entry.recentCorrect = 0;
            result = { promoted: true, demoted: false, newLevel: entry.level, prevLevel };
        }
    } else {
        entry.recentWrong = (entry.recentWrong || 0) + 1;
        entry.recentCorrect = 0;
        if (entry.recentWrong >= DEMOTE_AFTER && entry.level > MIN_LEVEL) {
            entry.level--;
            entry.recentWrong = 0;
            result = { promoted: false, demoted: true, newLevel: entry.level, prevLevel };
        }
    }
    persistAdaptiveLevels();
    if (result && typeof window !== 'undefined' && typeof window.showToast === 'function') {
        const skillLabel = (state.currentQ && state.currentQ.skillLabel) || skillId;
        if (result.promoted) {
            window.showToast(`Level up! Now at Level ${result.newLevel} in ${skillLabel}`, 'success');
        } else {
            window.showToast(`Going back to Level ${result.newLevel} in ${skillLabel} for more practice`, 'info');
        }
    }
    return result;
}

// Look for an easy/hard variant ladder this skill might belong to. Returns the
// ladder object or null. Matches by checking if `skillId` starts with any
// known base name in VARIANT_LADDERS.
function findVariantLadder(skillId) {
    if (!skillId) return null;
    for (const base of Object.keys(VARIANT_LADDERS)) {
        // Match base prefix (e.g., 'oop_easy' → base 'oop').
        if (skillId === base || skillId.startsWith(base + '_')) {
            return VARIANT_LADDERS[base];
        }
    }
    return null;
}

// Apply the adaptive level to a freshly generated question. We can't change
// `q.text` retroactively, so the primary effect is **before** generation:
// `applyAdaptiveSettingsForNextQuestion()` should be called BEFORE
// `generateQuestion()` to bias state.range / state.decimalPlaces. This
// post-process function tags the question with its adaptive level for UI
// surfacing and (where possible) swaps in the right variant skill id.
export function applyAdaptiveLevelToQuestion(q, skillId) {
    if (!state.adaptiveModeEnabled || !q) return q;
    const id = skillId || (q && q.skillId) || state.skill;
    if (!id) return q;
    const lvl = getAdaptiveLevel(id);
    q._adaptiveLevel = lvl;
    return q;
}

// Bias state.range / state.decimalPlaces ahead of the next generateQuestion()
// call so generators emit harder/easier numbers. Returns a restore function the
// caller MUST call after the question is fully generated. Saves the original
// values so adaptive mode can never permanently mutate user settings.
export function applyAdaptiveSettingsForNextQuestion(skillId) {
    if (!state.adaptiveModeEnabled) return () => {};
    const id = skillId || state.skill;
    if (!id) return () => {};

    const lvl = getAdaptiveLevel(id);
    const ladder = findVariantLadder(id);
    const savedRange = state.range;
    const savedDecimals = state.decimalPlaces;
    const savedSkill = state.skill;

    // Variant swap takes priority — many _easy/_hard skills hard-code their own
    // ranges, so range scaling on top would be a no-op.
    if (ladder && ladder[lvl]) {
        state.skill = ladder[lvl];
    } else {
        // Range scaling: only narrow the range if the user's setting is wider
        // than the level's cap. Never widen beyond the user-selected ceiling.
        const cap = RANGE_BY_LEVEL[lvl] ?? state.range;
        state.range = Math.min(state.range, cap);
        // Decimal scaling: only apply for skills that already use decimals (ie
        // user-set decimalPlaces > 0); never force decimals onto a whole-number
        // skill at higher levels.
        if (savedDecimals > 0) {
            state.decimalPlaces = Math.min(savedDecimals, DECIMALS_BY_LEVEL[lvl] ?? savedDecimals);
        }
    }
    return () => {
        state.range = savedRange;
        state.decimalPlaces = savedDecimals;
        state.skill = savedSkill;
    };
}

// Update the on-screen toggle label (#adaptiveStatus) and active class.
function updateAdaptiveStatusUI() {
    if (typeof document === 'undefined') return;
    const status = document.getElementById('adaptiveStatus');
    if (status) status.textContent = state.adaptiveModeEnabled ? 'On' : 'Off';
    const buttons = document.querySelectorAll('.adaptive-toggle');
    buttons.forEach(btn => btn.classList.toggle('active', !!state.adaptiveModeEnabled));
}

// Restore only the saved per-skill levels from localStorage. Used by
// `toggleAdaptiveMode` when flipping ON so previously-stored ladder positions
// pick up where they left off — without touching the toggle itself.
function loadAdaptiveLevelsOnly() {
    if (!state.adaptiveLevels) state.adaptiveLevels = {};
    try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                Object.assign(state.adaptiveLevels, parsed);
            }
        }
    } catch { /* ignore */ }
}

// Public toggle wired to the top-of-page button.
export function toggleAdaptiveMode() {
    state.adaptiveModeEnabled = !state.adaptiveModeEnabled;
    if (state.adaptiveModeEnabled) {
        // First-time enable in this session: restore any saved per-skill levels.
        // (Do NOT call initAdaptiveSession here — it would re-read the stale
        // toggle key from localStorage and clobber the just-flipped state.)
        loadAdaptiveLevelsOnly();
    }
    persistAdaptiveToggle();
    updateAdaptiveStatusUI();
    if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
        if (state.adaptiveModeEnabled) {
            window.showToast('Adaptive Mode ON — questions adjust to your level', 'success');
        } else {
            window.showToast('Adaptive Mode OFF', 'info');
        }
    }
}

// Reset all per-skill levels (escape hatch for v2 UI).
export function resetAdaptiveLevels() {
    state.adaptiveLevels = {};
    try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
}

// Read-only snapshot for inspection / debugging (used by the probe test).
export function getAdaptiveSnapshot() {
    return {
        enabled: !!state.adaptiveModeEnabled,
        levels: state.adaptiveLevels ? JSON.parse(JSON.stringify(state.adaptiveLevels)) : {},
    };
}
