// literacy-progress.js — Per-skill progress tracking for Literacy Quest.
// All data stored in localStorage under key "mathquest_literacy_progress".
// Schema matches DATA_MODEL.md §6 (StudentProgress interface) with the
// per_card_history extension required by FEATURES.md §4.4.

const STORAGE_KEY = 'mathquest_literacy_progress';

// Spaced review intervals in days (post-mastery schedule).
const SPACED_REVIEW_INTERVALS = [1, 3, 7, 14, 30];

// Strand labels used for strand summary and dashboard display.
const STRAND_LABELS = {
    phonemic_awareness: 'Phonemic Awareness',
    phonics: 'Phonics',
    fluency: 'Fluency',
    vocabulary: 'Vocabulary',
    comprehension_lit: 'Comprehension (Literary)',
    comprehension_info: 'Comprehension (Informational)',
    grammar: 'Grammar',
    sentence_structure: 'Sentence Structure',
    mechanics: 'Mechanics',
    writing: 'Writing',
};

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/**
 * Load the full progress map from localStorage.
 * @returns {Record<string, object>}
 */
export function loadProgress() {
    try {
        const raw = (typeof localStorage !== 'undefined')
            ? localStorage.getItem(STORAGE_KEY)
            : null;
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.warn('literacy-progress: loadProgress parse error', e);
        return {};
    }
}

/**
 * Persist the full progress map to localStorage.
 * @param {Record<string, object>} progress
 */
export function saveProgress(progress) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
    } catch (e) {
        console.warn('literacy-progress: saveProgress error', e);
    }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Return an empty StudentProgress record for a new skill.
 * @param {string} skill_id
 * @returns {object}
 */
function _emptyRecord(skill_id) {
    return {
        skill_id,
        attempts: 0,
        correct: 0,
        accuracy_history: [],       // [{ date, correct, total }]
        last_practiced: 0,
        mastery_level: 'not_started',
        current_rit_estimate: null,
        in_review: false,
        spaced_review_due_date: null,
        mechanics_seen: [],
        per_card_history: [],       // [{ question_id, mechanic, correct, attempts, fastest_correct_ms, timestamp }]
    };
}

/**
 * ISO date string for today.
 * @returns {string}  e.g. "2026-05-03"
 */
function _today() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Add N days to an ISO date string and return the resulting ISO date string.
 * @param {string} dateStr  e.g. "2026-05-03"
 * @param {number} days
 * @returns {string}
 */
function _addDays(dateStr, days) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
}

/**
 * Derive mastery_level from a StudentProgress record.
 * Thresholds per FEATURES.md §2.8:
 *   < 0.70 accuracy                              → introducing
 *   0.70–0.84 accuracy                           → developing
 *   ≥ 0.85 accuracy in < 2 consecutive sessions  → approaching_mastery
 *   ≥ 0.85 accuracy across ≥ 2 sessions          → mastered
 *
 * A "session" boundary is a new calendar date in accuracy_history.
 *
 * @param {object} rec  StudentProgress record
 * @returns {string}  mastery_level
 */
function _computeMasteryLevel(rec) {
    const total = rec.attempts;
    if (total === 0) return 'not_started';

    const overallAcc = rec.correct / total;

    if (overallAcc < 0.70) return 'introducing';
    if (overallAcc < 0.85) return 'developing';

    // Count consecutive sessions at ≥ 0.85
    const hist = rec.accuracy_history;
    let consecutiveGood = 0;
    for (let i = hist.length - 1; i >= 0; i--) {
        const sessionAcc = hist[i].total > 0 ? hist[i].correct / hist[i].total : 0;
        if (sessionAcc >= 0.85) {
            consecutiveGood++;
        } else {
            break;
        }
    }

    return consecutiveGood >= 2 ? 'mastered' : 'approaching_mastery';
}

/**
 * When a skill transitions to "mastered", schedule the first spaced review.
 * @param {object} rec  StudentProgress record (mutated in place)
 */
function _scheduleSpacedReview(rec) {
    if (rec.in_review) {
        // Already in review — advance to next interval based on current due date.
        const today = _today();
        const currentInterval = rec._review_interval_index != null
            ? rec._review_interval_index
            : 0;
        const nextIndex = Math.min(currentInterval + 1, SPACED_REVIEW_INTERVALS.length - 1);
        rec._review_interval_index = nextIndex;
        rec.spaced_review_due_date = _addDays(today, SPACED_REVIEW_INTERVALS[nextIndex]);
    } else {
        rec.in_review = true;
        rec._review_interval_index = 0;
        rec.spaced_review_due_date = _addDays(_today(), SPACED_REVIEW_INTERVALS[0]);
    }
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Record a single card attempt and update all derived fields.
 *
 * @param {string} skill_id
 * @param {string} question_id
 * @param {string} mechanic       question_type string, e.g. "multiple_choice"
 * @param {boolean} correct
 * @param {number} attempts       number of attempts on this card (≥ 1)
 * @param {number} response_ms    wall-clock milliseconds for this attempt
 */
export function recordAttempt(skill_id, question_id, mechanic, correct, attempts, response_ms) {
    const progress = loadProgress();

    if (!progress[skill_id]) {
        progress[skill_id] = _emptyRecord(skill_id);
    }

    const rec = progress[skill_id];
    const timestamp = new Date().toISOString();
    const today = _today();

    // --- per_card_history ---
    // Find existing entry for this question_id in today's session, or create new.
    const existing = rec.per_card_history.find(
        h => h.question_id === question_id && h.timestamp.startsWith(today)
    );

    if (existing) {
        // Update fastest correct time if this attempt was correct and faster.
        if (correct && (existing.fastest_correct_ms === null || response_ms < existing.fastest_correct_ms)) {
            existing.fastest_correct_ms = response_ms;
        }
        existing.correct = correct;
        existing.attempts = Math.max(existing.attempts, attempts);
        existing.timestamp = timestamp;
    } else {
        rec.per_card_history.push({
            question_id,
            mechanic,
            correct,
            attempts,
            fastest_correct_ms: correct ? response_ms : null,
            timestamp,
        });
    }

    // Keep per_card_history bounded (last 500 entries).
    if (rec.per_card_history.length > 500) {
        rec.per_card_history = rec.per_card_history.slice(-500);
    }

    // --- lifetime attempts / correct ---
    rec.attempts += 1;
    if (correct) rec.correct += 1;
    rec.last_practiced = Date.now();

    // --- accuracy_history (per-session daily bucket) ---
    const todayBucket = rec.accuracy_history.find(h => h.date === today);
    if (todayBucket) {
        todayBucket.total += 1;
        if (correct) todayBucket.correct += 1;
    } else {
        rec.accuracy_history.push({ date: today, correct: correct ? 1 : 0, total: 1 });
    }

    // --- mechanics_seen ---
    if (!rec.mechanics_seen.includes(mechanic)) {
        rec.mechanics_seen.push(mechanic);
    }

    // --- mastery_level transition ---
    const prevLevel = rec.mastery_level;
    rec.mastery_level = _computeMasteryLevel(rec);

    // On mastery transition, schedule spaced review.
    if (rec.mastery_level === 'mastered' && prevLevel !== 'mastered') {
        _scheduleSpacedReview(rec);
    }

    saveProgress(progress);
}

/**
 * Return the mastery level for a skill.
 * @param {string} skill_id
 * @returns {string}  one of the 5 mastery_level values
 */
export function getMasteryLevel(skill_id) {
    const progress = loadProgress();
    return progress[skill_id] ? progress[skill_id].mastery_level : 'not_started';
}

/**
 * Return recent session summaries grouped by calendar date, newest first.
 * A "session" is a day-bucket in accuracy_history across all skills.
 *
 * @param {number} [limit=14]
 * @returns {Array<{ date: string, skills: string[], correct: number, total: number, accuracy: number }>}
 */
export function getRecentSessions(limit = 14) {
    const progress = loadProgress();
    // Aggregate by date across all skills.
    const byDate = {};

    for (const [skill_id, rec] of Object.entries(progress)) {
        for (const bucket of rec.accuracy_history) {
            if (!byDate[bucket.date]) {
                byDate[bucket.date] = { date: bucket.date, skills: new Set(), correct: 0, total: 0 };
            }
            byDate[bucket.date].skills.add(skill_id);
            byDate[bucket.date].correct += bucket.correct;
            byDate[bucket.date].total += bucket.total;
        }
    }

    return Object.values(byDate)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit)
        .map(s => ({
            date: s.date,
            skills: Array.from(s.skills),
            correct: s.correct,
            total: s.total,
            accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
        }));
}

/**
 * Return aggregate stats for a single skill.
 *
 * @param {string} skill_id
 * @returns {{ attempts: number, accuracy: number, mastery_level: string, mechanics_used: string[], last_practiced: number }}
 */
export function getSkillStats(skill_id) {
    const progress = loadProgress();
    const rec = progress[skill_id];
    if (!rec) {
        return {
            attempts: 0,
            accuracy: 0,
            mastery_level: 'not_started',
            mechanics_used: [],
            last_practiced: 0,
        };
    }
    return {
        attempts: rec.attempts,
        accuracy: rec.attempts > 0 ? Math.round((rec.correct / rec.attempts) * 100) : 0,
        mastery_level: rec.mastery_level,
        mechanics_used: rec.mechanics_seen.slice(),
        last_practiced: rec.last_practiced,
    };
}

/**
 * Return aggregate statistics across all skills belonging to a strand.
 * skill_ids must follow the naming convention: strand is the first segment
 * (e.g., "phonics_short_vowel_short_a_initial" → strand "phonics").
 *
 * @param {string} strand  e.g. "phonics"
 * @returns {{ skills_total: number, skills_started: number, accuracy: number, mastered: number, approaching: number }}
 */
export function getStrandSummary(strand) {
    const progress = loadProgress();
    let skillsTotal = 0;
    let skillsStarted = 0;
    let totalCorrect = 0;
    let totalAttempts = 0;
    let mastered = 0;
    let approaching = 0;

    for (const [skill_id, rec] of Object.entries(progress)) {
        // Derive strand from the skill_id prefix.
        const skillStrand = skill_id.split('_')[0];
        if (skillStrand !== strand) continue;

        skillsTotal++;
        if (rec.attempts > 0) {
            skillsStarted++;
            totalCorrect += rec.correct;
            totalAttempts += rec.attempts;
        }
        if (rec.mastery_level === 'mastered') mastered++;
        if (rec.mastery_level === 'approaching_mastery') approaching++;
    }

    return {
        strand,
        strand_label: STRAND_LABELS[strand] || strand,
        skills_total: skillsTotal,
        skills_started: skillsStarted,
        accuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
        mastered,
        approaching,
    };
}

/**
 * Return all skill IDs that have a spaced review due today or in the past.
 * @returns {string[]}
 */
export function getSkillsDueForReview() {
    const progress = loadProgress();
    const today = _today();
    return Object.entries(progress)
        .filter(([, rec]) => rec.in_review && rec.spaced_review_due_date && rec.spaced_review_due_date <= today)
        .map(([skill_id]) => skill_id);
}

export { STRAND_LABELS };
