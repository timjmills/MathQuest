import { state } from './state.js';

// ===== Cookie Storage Functions =====
export function setCookie(name, value, days = 365) {
    try {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + '; expires=' + expires + '; path=/; SameSite=Strict';
    } catch (e) {
        // Cookie setting failed (may be blocked in iframe)
    }
}

export function getCookie(name) {
    try {
        const cookieStr = document.cookie || '';
        const value = cookieStr.split('; ').find(row => row.startsWith(name + '='));
        if (value) {
            return JSON.parse(decodeURIComponent(value.split('=')[1]));
        }
    } catch (e) {
        // Cookie parsing failed, return null
    }
    return null;
}

// Load persistent data from cookies on startup
export function loadPersistentData() {
    try {
        // Load session history
        const savedHistory = getCookie('mathquest_history');
        if (savedHistory && Array.isArray(savedHistory)) {
            state.sessionHistory = savedHistory;
        }

        // Load streak data
        const savedStreak = getCookie('mathquest_streak');
        if (savedStreak) {
            state.streak = savedStreak.streak || 0;
            state.lastPlayDate = savedStreak.lastPlayDate || null;
        }

        // Load badges
        const savedBadges = getCookie('mathquest_badges');
        if (savedBadges && Array.isArray(savedBadges)) {
            state.badges = savedBadges;
        }

        // Load XP
        const savedXP = getCookie('mathquest_xp');
        if (savedXP !== null && typeof savedXP === 'number') {
            state.xp = savedXP;
        }

        // Load streak calendar days
        const savedStreakDays = getCookie('mathquest_streakdays');
        if (savedStreakDays && Array.isArray(savedStreakDays)) {
            state.streakDays = savedStreakDays;
        }

        // Load skill progress from cookie (expand compact format)
        const savedProgress = getCookie('mathquest_skill_progress');
        if (savedProgress && typeof savedProgress === 'object') {
            const expanded = {};
            for (const [k, v] of Object.entries(savedProgress)) {
                if (v.c !== undefined) {
                    // Compact format
                    expanded[k] = {
                        correct: v.c, total: v.t, mastery: v.m,
                        streak: v.s || 0, bestStreak: v.b || 0,
                        lastPracticed: v.lp || null,
                        history: v.h || []
                    };
                } else {
                    // Already full format
                    expanded[k] = v;
                }
            }
            state.skillProgress = expanded;
        }
        // Load celebration toggle
        const savedCelebrations = getCookie('mathquest_celebrations');
        if (savedCelebrations !== null) {
            state.celebrationsEnabled = savedCelebrations;
        }
    } catch (e) {
        // Failed to load persistent data, continue with defaults
    }
}

// Save persistent data to cookies
export function savePersistentData() {
    try {
        // Save session history (limit to prevent cookie overflow)
        const historyToSave = state.sessionHistory.slice(0, 100);
        setCookie('mathquest_history', historyToSave);

        // Save streak data
        setCookie('mathquest_streak', {
            streak: state.streak,
            lastPlayDate: state.lastPlayDate
        });

        // Save badges
        setCookie('mathquest_badges', state.badges);

        // Save XP
        setCookie('mathquest_xp', state.xp);

        // Save streak days
        if (state.streakDays) {
            setCookie('mathquest_streakdays', state.streakDays.slice(-60)); // Keep last 60 days
        }

        // Save skill progress to cookie (compact: only essential fields)
        if (state.skillProgress) {
            const compact = {};
            for (const [k, v] of Object.entries(state.skillProgress)) {
                compact[k] = {
                    c: v.correct, t: v.total, m: v.mastery,
                    s: v.streak, b: v.bestStreak,
                    lp: v.lastPracticed,
                    h: (v.history || []).slice(-10)
                };
            }
            setCookie('mathquest_skill_progress', compact);
        }
        // Save celebration toggle
        setCookie('mathquest_celebrations', state.celebrationsEnabled);
    } catch (e) {
        // Failed to save persistent data
    }
}
