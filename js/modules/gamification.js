import { state } from './state.js';
import { randInt } from './utils.js';
import { setCookie, getCookie, savePersistentData } from './storage.js';
import { SKILL_TIME_CATEGORY, CODE_TO_SKILL, DOMAINS, SKILLS } from './data.js';

// ===== LEVEL SYSTEM =====
const LEVEL_THRESHOLDS = [0, 100, 250, 450, 750, 1150, 1650, 2300, 3100, 4100, 5300, 6800, 8600, 10800, 13400];
const LEVEL_TITLES = [
    "Math Starter", "Number Novice", "Problem Solver", "Quick Thinker",
    "Math Explorer", "Skill Builder", "Math Athlete", "Brain Power",
    "Math Hero", "Math Champion", "Math Wizard", "Math Legend",
    "Math Genius", "Math Master", "Grand Master"
];

export function calculateLevel(totalXp) {
    let level = 1;
    for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
        if (totalXp >= LEVEL_THRESHOLDS[i]) level = i + 1;
        else break;
    }
    if (level > LEVEL_THRESHOLDS.length) level = LEVEL_THRESHOLDS.length;
    const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 2000;
    return {
        level,
        title: LEVEL_TITLES[level - 1] || "Grand Master",
        xpInLevel: totalXp - currentThreshold,
        xpForNext: nextThreshold - currentThreshold
    };
}

// ===== XP AWARDING =====
export function awardXP(amount, reason) {
    const oldLevel = calculateLevel(state.xp).level;
    state.xp += amount;
    const newInfo = calculateLevel(state.xp);
    state.level = newInfo.level;
    state.xpForCurrentLevel = newInfo.xpInLevel;
    state.xpToNextLevel = newInfo.xpForNext;

    // Show toast for attempt XP
    if (reason === 'attempt') {
        showToast("Keep trying! +" + amount + " XP", "info");
    }

    // Check level up
    if (newInfo.level > oldLevel) {
        onLevelUp(newInfo.level);
    }

    // Check math_master badge
    if (state.xp >= 1000) {
        earnBadge('math_master');
    }
    // Check level_5 badge
    if (newInfo.level >= 5) {
        earnBadge('level_5');
    }

    updateUI();
    savePersistentData();
    saveGamificationData();
}

function onLevelUp(newLevel) {
    const title = LEVEL_TITLES[newLevel - 1] || "Grand Master";
    const facts = MATH_FACTS[randInt(0, MATH_FACTS.length - 1)];
    showCelebrationModal({
        emoji: "🎉",
        title: "Level Up! Level " + newLevel,
        message: "You are now a " + title + "!",
        subMessage: facts,
        autoDismissMs: 800
    });
}

// ===== STREAK BONUSES =====
export function checkStreakBonus() {
    const s = state.sessionStreak;
    let bonus = 0;
    let milestone = 0;

    if (s >= 10 && s % 5 === 0 && state.lastStreakBonus < s) {
        bonus = 20; milestone = s;
    } else if (s === 10 && state.lastStreakBonus < 10) {
        bonus = 20; milestone = 10;
    } else if (s === 5 && state.lastStreakBonus < 5) {
        bonus = 10; milestone = 5;
    } else if (s === 3 && state.lastStreakBonus < 3) {
        bonus = 5; milestone = 3;
    }

    if (bonus > 0) {
        state.lastStreakBonus = milestone;
        showCelebrationModal({
            emoji: "🔥",
            title: milestone + " in a Row!",
            message: "+" + bonus + " Streak Bonus XP!",
            subMessage: GROWTH_MESSAGES[randInt(0, GROWTH_MESSAGES.length - 1)],
            autoDismissMs: 800
        });
        // Award directly to avoid recursive celebration
        state.xp += bonus;
        const info = calculateLevel(state.xp);
        state.level = info.level;
        state.xpForCurrentLevel = info.xpInLevel;
        state.xpToNextLevel = info.xpForNext;
        updateUI();
        savePersistentData();
        saveGamificationData();
    }
}

// ===== SURPRISE (VR-5) BONUS =====
export function initSurpriseSchedule() {
    state.correctSinceLastSurprise = 0;
    state.nextSurpriseAt = randInt(3, 7);
}

export function checkSurpriseBonus() {
    state.correctSinceLastSurprise++;
    if (state.correctSinceLastSurprise >= state.nextSurpriseAt) {
        const bonus = randInt(15, 30);
        state.correctSinceLastSurprise = 0;
        state.nextSurpriseAt = randInt(3, 7);
        showCelebrationModal({
            emoji: "🎁",
            title: "Surprise Bonus!",
            message: "+" + bonus + " XP!",
            subMessage: MATH_JOKES[randInt(0, MATH_JOKES.length - 1)],
            autoDismissMs: 800
        });
        state.xp += bonus;
        const info = calculateLevel(state.xp);
        state.level = info.level;
        updateUI();
        savePersistentData();
        saveGamificationData();
    }
}

// ===== TIME-ON-TASK =====
const TIME_MILESTONES = [
    { min: 3, xp: 25, joke: true },
    { min: 5, xp: 50, joke: true },
    { min: 10, xp: 75, joke: true },
    { min: 15, xp: 100, joke: true },
    { min: 20, xp: 150, joke: true },
    { min: 25, xp: 200, joke: true, breakSuggestion: true },
    { min: 30, xp: 250, joke: true }
];

export function startSessionTimer() {
    state.sessionTimeMs = 0;
    state.lastTimeMilestone = 0;
    if (state.sessionTimerInterval) clearInterval(state.sessionTimerInterval);
    const startTime = Date.now();
    state.sessionTimerInterval = setInterval(() => {
        state.sessionTimeMs = Date.now() - startTime;
        checkTimeMilestones();
    }, 5000); // Check every 5 seconds
}

export function stopSessionTimer() {
    if (state.sessionTimerInterval) {
        clearInterval(state.sessionTimerInterval);
        state.sessionTimerInterval = null;
    }
    // Accumulate to cumulative time
    state.cumulativeTimeMs += state.sessionTimeMs;
    saveCumulativeTime();

    // Check time_champion badge (20+ min)
    if (state.sessionTimeMs >= 20 * 60 * 1000) {
        earnBadge('time_champion');
    }
}

function checkTimeMilestones() {
    const minutesElapsed = Math.floor(state.sessionTimeMs / 60000);
    for (const m of TIME_MILESTONES) {
        if (minutesElapsed >= m.min && state.lastTimeMilestone < m.min) {
            state.lastTimeMilestone = m.min;
            let sub = "";
            if (m.joke) {
                sub = MATH_JOKES[randInt(0, MATH_JOKES.length - 1)];
            }
            if (m.breakSuggestion) {
                sub = "Great job! Consider taking a short break to recharge your brain!";
            }
            showCelebrationModal({
                emoji: "⏱️",
                title: m.min + " Minutes!",
                message: "+" + m.xp + " XP for dedication!",
                subMessage: sub,
                autoDismissMs: 800
            });
            state.xp += m.xp;
            const info = calculateLevel(state.xp);
            state.level = info.level;
            updateUI();
            savePersistentData();
            saveGamificationData();
            break; // Only award one at a time
        }
    }
}

// ===== ENHANCED SPACED REPETITION =====
// Blends SM-2 adaptive ease factors, Leitner box structure, Ebbinghaus
// forgetting-curve decay, Bjork's desirable difficulties & interleaving,
// and Pimsleur's graduated interval recall.
//
// Key improvements over basic Leitner:
//   1. Per-skill ease factor (SM-2): harder skills get shorter intervals
//   2. Soft demotion (Bjork): wrong drops 1 box, not reset to 1
//   3. Quality rating: factors in response time, not just correct/wrong
//   4. Lower eligibility (10 attempts/50% mastery): enters system faster
//   5. Confidence decay (Ebbinghaus): very overdue skills auto-demote
//   6. Interleaved review (Bjork): round-robin across math domains
//   7. Dynamic sizing (Pimsleur): weak skills get more problems
//   8. Review streak: XP bonus for consecutive daily reviews

const BOX_INTERVALS = [1, 3, 7, 16, 35]; // base intervals in days
const DEFAULT_EF = 2.5;  // default ease factor (SM-2 standard)
const MIN_EF = 1.3;      // floor — prevents intervals from collapsing
const MAX_EF = 3.0;      // ceiling

export function initSpacedRepetition() {
    const saved = getCookie('mathquest_spaced_rep');
    if (saved && typeof saved === 'object') {
        state.spacedRepetition = saved;
    }
    // Load review streak
    const streakData = getCookie('mathquest_review_streak');
    if (streakData && typeof streakData === 'object') {
        state.reviewStreak = streakData.streak || 0;
        state.lastReviewDate = streakData.lastDate || null;
    }
}

export function saveSpacedRepetition() {
    setCookie('mathquest_spaced_rep', state.spacedRepetition);
}

function saveReviewStreak() {
    setCookie('mathquest_review_streak', {
        streak: state.reviewStreak,
        lastDate: state.lastReviewDate
    });
}

// SM-2 inspired quality rating (1-5) from correctness + response time
// Higher quality = faster interval growth
function getQualityRating(skillId, isCorrect) {
    if (!isCorrect) return 1;

    const elapsed = state.questionElapsedMs || 0;
    const category = SKILL_TIME_CATEGORY[skillId] || 'extended';
    const threshold = category === 'quick' ? 25000 : 50000;

    if (elapsed > 0 && elapsed <= threshold * 0.6) return 5; // Fast + correct
    if (elapsed > 0 && elapsed <= threshold) return 4;       // On-pace + correct
    return 3; // Slow but correct
}

// Adaptive interval: base Leitner interval scaled by ease factor
function calculateInterval(box, ef) {
    return Math.max(1, Math.round(BOX_INTERVALS[box - 1] * (ef / DEFAULT_EF)));
}

export function updateSpacedRepetition(skillId, isCorrect) {
    const prog = state.skillProgress[skillId];
    // Lowered threshold (was 20/60%): earlier entry means earlier review benefits
    if (!prog || prog.total < 10 || prog.mastery < 50) return;

    if (!state.spacedRepetition[skillId]) {
        state.spacedRepetition[skillId] = {
            box: 1,
            ef: DEFAULT_EF,
            nextReview: new Date().toISOString().split('T')[0],
            lastReview: null
        };
    }

    const sr = state.spacedRepetition[skillId];
    const today = new Date().toISOString().split('T')[0];
    sr.lastReview = today;
    if (!sr.ef) sr.ef = DEFAULT_EF; // backward compat

    const quality = getQualityRating(skillId, isCorrect);

    if (quality >= 4) {
        // Good/perfect recall → advance box, boost ease
        sr.box = Math.min(sr.box + 1, BOX_INTERVALS.length);
        sr.ef = Math.min(MAX_EF, sr.ef + 0.10);
    } else if (quality === 3) {
        // Correct but slow → keep box, slight ease decrease
        // Bjork "desirable difficulty": don't fully reward slow recall
        sr.ef = Math.max(MIN_EF, sr.ef - 0.05);
    } else {
        // Wrong → soft demotion: drop 1 box (not reset to 1)
        // Bjork: maintains credit for past learning, less discouraging
        sr.box = Math.max(1, sr.box - 1);
        sr.ef = Math.max(MIN_EF, sr.ef - 0.15);
    }

    // Calculate next review using adaptive interval
    const interval = calculateInterval(sr.box, sr.ef);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    sr.nextReview = nextDate.toISOString().split('T')[0];

    saveSpacedRepetition();
}

// Ebbinghaus confidence decay: very overdue skills auto-demote
// Models the forgetting curve — unused knowledge fades over time
function applyConfidenceDecay() {
    const today = new Date();
    let changed = false;

    for (const sr of Object.values(state.spacedRepetition)) {
        if (!sr.ef) sr.ef = DEFAULT_EF;

        const reviewDate = new Date(sr.nextReview);
        const daysPastDue = Math.floor((today - reviewDate) / 86400000);
        const interval = calculateInterval(sr.box, sr.ef);

        // If overdue by more than 2× its interval, demote 1 box
        if (daysPastDue > interval * 2 && sr.box > 1) {
            sr.box = Math.max(1, sr.box - 1);
            sr.nextReview = today.toISOString().split('T')[0];
            changed = true;
        }
    }

    if (changed) saveSpacedRepetition();
}

// Look up which domain a skill belongs to (for interleaving)
function getSkillDomain(skillId) {
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        for (const cat of domain.categories) {
            if (SKILLS[cat.id] && SKILLS[cat.id].some(s => s.v === skillId)) {
                return domainId;
            }
        }
    }
    return 'unknown';
}

export function getSkillsDueForReview() {
    // Apply Ebbinghaus decay before checking what's due
    applyConfidenceDecay();

    const today = new Date().toISOString().split('T')[0];
    const due = [];
    for (const [skillId, sr] of Object.entries(state.spacedRepetition)) {
        if (sr.nextReview <= today) {
            const ef = sr.ef || DEFAULT_EF;
            due.push({
                skillId,
                box: sr.box,
                ef,
                domain: getSkillDomain(skillId),
                // Urgency: lower box + lower ease factor = more urgent
                urgency: (6 - sr.box) + (DEFAULT_EF - ef),
                lastReview: sr.lastReview
            });
        }
    }
    // Sort by urgency (highest first), then oldest review first
    due.sort((a, b) => b.urgency - a.urgency || (a.lastReview || '').localeCompare(b.lastReview || ''));
    return due;
}

// Bjork interleaving: round-robin across math domains
// Students retain more when practice alternates between topic types
function interleaveByDomain(skills) {
    const byDomain = {};
    for (const s of skills) {
        const d = s.domain || 'unknown';
        if (!byDomain[d]) byDomain[d] = [];
        byDomain[d].push(s);
    }

    const domains = Object.keys(byDomain);
    const result = [];
    let idx = 0;

    while (result.length < skills.length) {
        const d = domains[idx % domains.length];
        if (byDomain[d] && byDomain[d].length > 0) {
            result.push(byDomain[d].shift());
        }
        idx++;
        // Safety: break if all domains exhausted
        if (domains.every(k => !byDomain[k] || byDomain[k].length === 0)) break;
    }
    return result;
}

export function startSmartReview() {
    const due = getSkillsDueForReview();
    if (due.length === 0) {
        showToast("No skills due for review! Great job!", "success");
        return;
    }

    // Interleave up to 10 due skills across domains
    const selected = interleaveByDomain(due.slice(0, 10));
    const skillsToReview = selected.map(d => d.skillId);

    // Pimsleur graduated practice: weak skills (low box) get more problems
    const totalProblems = selected.reduce((sum, s) => {
        return sum + (s.box <= 2 ? 4 : s.box <= 3 ? 3 : 2);
    }, 0);

    state.isReviewSession = true;
    state.isMixedMode = true;
    state.category = 'all_mixed';
    state.skill = 'custom_mixed';
    state.mixedModeSettings = {
        selectedSkills: skillsToReview,
        range: state.range || 100,
        decimalPlaces: state.decimalPlaces || 0,
        timeChoice: 'student',
        timer: 0,
        totalProblemsEnabled: true,
        totalProblems: Math.min(totalProblems, 30),
        correctGoalEnabled: false,
        correctGoal: 0
    };

    // Update review streak (consecutive daily reviews)
    const today = new Date().toISOString().split('T')[0];
    if (state.lastReviewDate !== today) {
        if (state.lastReviewDate) {
            const last = new Date(state.lastReviewDate);
            const diff = Math.floor((new Date(today) - last) / 86400000);
            state.reviewStreak = diff === 1 ? state.reviewStreak + 1 : 1;
        } else {
            state.reviewStreak = 1;
        }
        state.lastReviewDate = today;
        saveReviewStreak();
    }

    // Award XP for starting review + streak bonus
    if (typeof window !== 'undefined' && window.awardXP) {
        window.awardXP(15, "Starting Smart Review");
        if (state.reviewStreak >= 3) {
            window.awardXP(state.reviewStreak * 5, state.reviewStreak + "-day review streak!");
        }
    }

    startGame();
}

// ===== BADGE SYSTEM =====
const ALL_BADGES = [
    { id: 'first_game', icon: '🎮', name: 'First Game', desc: 'Complete your first game' },
    { id: 'streak_3', icon: '🔥', name: '3-Day Streak', desc: 'Play 3 days in a row' },
    { id: 'streak_7', icon: '🏆', name: 'Week Warrior', desc: 'Play 7 days in a row' },
    { id: 'streak_30', icon: '👑', name: 'Monthly Master', desc: 'Play 30 days in a row' },
    { id: 'perfect_10', icon: '⭐', name: 'Perfect 10', desc: 'Get 10 correct in a row' },
    { id: 'speed_demon', icon: '⚡', name: 'Speed Demon', desc: '20+ questions in under 2 min' },
    { id: 'math_master', icon: '🧮', name: 'Math Master', desc: 'Earn 1000 XP' },
    { id: 'division_pro', icon: '➗', name: 'Division Pro', desc: 'Complete 50 division problems' },
    { id: 'multiplication_ace', icon: '✖️', name: 'Mult. Ace', desc: 'Master all times tables' },
    // New badges
    { id: 'persistent_50', icon: '💪', name: 'Persistent', desc: '50 problems in one session' },
    { id: 'bounce_back', icon: '🔄', name: 'Bounce Back', desc: '3 wrong then 3 right' },
    { id: 'time_champion', icon: '⏱️', name: 'Time Champ', desc: '20+ min on task in session' },
    { id: 'review_master', icon: '📖', name: 'Review Master', desc: 'Complete a Smart Review' },
    { id: 'growth_spurt', icon: '🌟', name: 'Growth Spurt', desc: 'Improve a skill by 20+ pts' },
    { id: 'level_5', icon: '🎖️', name: 'Level 5', desc: 'Reach Level 5' }
];

export function getAllBadges() {
    return ALL_BADGES;
}

export function checkBadgeTriggers(event, data) {
    if (event === 'answer') {
        // perfect_10
        if (state.consecutiveCorrect >= 10) {
            earnBadge('perfect_10');
        }
        // persistent_50
        if (state.totalProblemsThisSession >= 50) {
            earnBadge('persistent_50');
        }
        // bounce_back tracking
        if (data && !data.isCorrect) {
            if (!state.wrongThenRightTracking.recovering) {
                state.wrongThenRightTracking.wrongCount++;
            } else {
                // Was recovering, got another wrong — reset
                state.wrongThenRightTracking.recovering = false;
                state.wrongThenRightTracking.rightCount = 0;
                state.wrongThenRightTracking.wrongCount = 1;
            }
        } else if (data && data.isCorrect) {
            if (state.wrongThenRightTracking.wrongCount >= 3 && !state.wrongThenRightTracking.recovering) {
                state.wrongThenRightTracking.recovering = true;
                state.wrongThenRightTracking.rightCount = 1;
            } else if (state.wrongThenRightTracking.recovering) {
                state.wrongThenRightTracking.rightCount++;
                if (state.wrongThenRightTracking.rightCount >= 3) {
                    earnBadge('bounce_back');
                    state.wrongThenRightTracking = { wrongCount: 0, recovering: false, rightCount: 0 };
                }
            } else {
                // Correct but never had 3 wrong — reset wrong counter
                state.wrongThenRightTracking.wrongCount = 0;
            }
        }
    }
    if (event === 'streak_update') {
        if (state.streak >= 3) earnBadge('streak_3');
        if (state.streak >= 7) earnBadge('streak_7');
        if (state.streak >= 30) earnBadge('streak_30');
    }
    if (event === 'game_end') {
        earnBadge('first_game');
        // speed_demon: 20+ questions in < 2 min
        if (data && data.qCount >= 20 && data.sessionTimeMs < 120000) {
            earnBadge('speed_demon');
        }
        // review_master
        if (state.isReviewSession) {
            earnBadge('review_master');
        }
    }
    if (event === 'skill_progress') {
        // division_pro
        if (data && data.skillId) {
            const divSkills = ['div_facts', 'divide', 'div_word_problems', 'area_model_div_2by1', 'area_model_div_3by1', 'missing_mult_div', 'div_remainders'];
            if (divSkills.includes(data.skillId)) {
                const prog = state.skillProgress[data.skillId];
                if (prog && prog.total >= 50) earnBadge('division_pro');
            }
        }
        // growth_spurt
        if (data && data.masteryDelta >= 20) {
            earnBadge('growth_spurt');
        }
    }
}

export function earnBadge(badgeId) {
    if (state.badges.includes(badgeId)) return;
    state.badges.push(badgeId);
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (badge) {
        showCelebrationModal({
            emoji: badge.icon,
            title: "Badge Earned!",
            message: badge.name,
            subMessage: badge.desc,
            autoDismissMs: 800
        });
    }
    savePersistentData();
}

// ===== CELEBRATION MODALS =====
export function toggleCelebrations(enabled) {
    state.celebrationsEnabled = enabled;
    savePersistentData();
}

export function showCelebrationModal({ emoji, title, message, subMessage, autoDismissMs }) {
    if (!state.celebrationsEnabled) return;
    const modal = document.createElement('div');
    modal.className = 'mq-celebration-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001;animation:mqCelebFadeIn 0.15s ease;';
    modal.innerHTML = `
        <div style="background:var(--bg-card);padding:28px 36px;border-radius:24px;text-align:center;max-width:320px;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:mqCelebPop 0.2s cubic-bezier(0.34,1.56,0.64,1);">
            <div style="font-size:3.5rem;margin-bottom:8px;">${emoji}</div>
            <h3 style="font-size:1.3rem;font-weight:900;margin-bottom:6px;color:var(--text-bright);">${title}</h3>
            <p style="font-size:1rem;font-weight:700;color:var(--accent-cyan);margin-bottom:8px;">${message}</p>
            ${subMessage ? `<p style="font-size:0.8rem;color:var(--text-dim);margin-bottom:12px;font-style:italic;">${subMessage}</p>` : ''}
            <button class="btn btn-primary" style="padding:8px 24px;font-size:0.9rem;" onclick="this.closest('.mq-celebration-modal').remove()">OK</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Inject animation keyframes if not yet added
    if (!document.getElementById('mqCelebStyles')) {
        const style = document.createElement('style');
        style.id = 'mqCelebStyles';
        style.textContent = `
            @keyframes mqCelebFadeIn { from { opacity:0; } to { opacity:1; } }
            @keyframes mqCelebPop { from { transform:scale(0.5);opacity:0; } to { transform:scale(1);opacity:1; } }
        `;
        document.head.appendChild(style);
    }

    if (autoDismissMs) {
        setTimeout(() => { if (modal.parentNode) modal.remove(); }, autoDismissMs);
    }

    // Click backdrop to dismiss
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

// ===== CONTENT ARRAYS =====
const MATH_JOKES = [
    "Why was the math book sad? It had too many problems!",
    "What did the zero say to the eight? Nice belt!",
    "Why do plants hate math? It gives them square roots!",
    "What's a math teacher's favorite place? Times Square!",
    "Why was six afraid of seven? Because 7, 8, 9!",
    "Parallel lines have so much in common... too bad they'll never meet!",
    "What did the triangle say to the circle? You're pointless!",
    "Why is the obtuse angle always upset? Because it's never right!",
    "What do you call a number that can't sit still? A roamin' numeral!",
    "How do you stay warm in a cold room? Go to the corner — it's always 90 degrees!",
    "What did the calculator say to the math student? You can count on me!",
    "Why did the student do multiplication on the floor? They were told not to use tables!",
    "What's a butterfly's favorite subject? Moth-ematics!",
    "What do mathematicians eat for dinner? Pi!",
    "I saw my math teacher with graph paper. She must be plotting something!",
    "Why couldn't the angle get a loan? Its parents wouldn't cosine!",
    "What's the king of the pencil case? The ruler!",
    "Decimals always have a point!",
    "What do you call friends who love math? Algebros!",
    "How does a mathematician plow fields? With a protractor!",
    "What tool is best for math? Multi-pliers!",
    "Why was the fraction apprehensive about marrying the decimal? Because he'd have to convert!",
    "What did one math book say to the other? Don't bother me, I've got my own problems!",
    "Why is arithmetic hard work? All those numbers you have to carry!",
    "If you had 8 apples in one hand and 5 in the other, what would you have? Really big hands!"
];

const MATH_FACTS = [
    "111,111,111 x 111,111,111 = 12,345,678,987,654,321!",
    "A 'googol' is 1 followed by 100 zeros!",
    "Zero is the only number that can't be represented in Roman numerals!",
    "Every odd number has an 'e' in it!",
    "If you shuffle a deck of cards, the order is likely unique in all of history!",
    "2,520 is the smallest number divisible by 1 through 10!",
    "The word 'hundred' comes from 'hundrath' meaning 120, not 100!",
    "Pi has been calculated to over 100 trillion digits!",
    "The symbol for division (÷) is called an obelus!",
    "A pizza that has radius 'z' and height 'a' has volume pi×z×z×a!",
    "Forty is the only number spelled with letters in alphabetical order!",
    "The Fibonacci sequence appears in sunflowers, pinecones, and hurricanes!",
    "There are 86,400 seconds in a day!",
    "A palindrome number reads the same forwards and backwards, like 12321!",
    "The number 1 is neither prime nor composite!",
    "A circle has the most area for a given perimeter!",
    "The sum of opposite faces on a die always equals 7!",
    "Math is the universal language — it works the same everywhere on Earth!"
];

const GROWTH_MESSAGES = [
    "Your brain gets stronger every time you practice!",
    "Mistakes are how your brain learns — keep going!",
    "You're building math muscles right now!",
    "Every expert was once a beginner!",
    "The more you practice, the easier it gets!",
    "Challenge is what makes your brain grow!",
    "You're getting better with every problem!",
    "Hard work beats talent when talent doesn't work hard!",
    "Your effort today is tomorrow's skill!",
    "Struggling means you're learning something new!",
    "You haven't mastered it YET — but you will!",
    "Each problem you try makes you smarter!",
    "Practice doesn't make perfect — it makes progress!",
    "Be proud of how far you've come!"
];

// ===== TOOLTIP UPDATER =====
export function updateTooltips() {
    const info = calculateLevel(state.xp);
    const xpTip = document.getElementById('mqTooltipXp');
    if (xpTip) {
        xpTip.textContent = "Level " + info.level + ": " + info.title + " — " + (info.xpForNext - info.xpInLevel) + " XP to next level! Earn XP by answering problems.";
    }
    const streakTip = document.getElementById('mqTooltipStreak');
    if (streakTip) {
        streakTip.textContent = state.streak + " day streak! Play every day to keep your streak going.";
    }
    const progTip = document.getElementById('mqTooltipProgress');
    if (progTip) {
        const skillId = state.skill || 'add';
        const skillName = skillId.replace(/_/g, ' ');
        progTip.textContent = "Your mastery of " + skillName + ". Practice 20+ problems at 80%+ to master it!";
    }
}

// ===== REVIEW COUNT =====
export function updateReviewCount() {
    const due = getSkillsDueForReview();
    const badge = document.getElementById('reviewDueCount');
    if (badge) {
        if (due.length > 0) {
            badge.textContent = due.length;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }
    // Toggle glow: green = due, red = any box-1 skill or never-reviewed skill
    const reviewBtn = document.getElementById('gsbReviewBtn');
    if (reviewBtn) {
        reviewBtn.classList.remove('gsb-review-due', 'gsb-review-overdue');
        if (due.length > 0) {
            // Red glow if any skill is in box 1 (weak) or has never been reviewed
            const hasUrgent = due.some(d => d.box <= 1 || !d.lastReview);
            if (hasUrgent) {
                reviewBtn.classList.add('gsb-review-overdue');
            } else {
                reviewBtn.classList.add('gsb-review-due');
            }
        }
    }
}

// ===== PERSISTENCE =====
function saveGamificationData() {
    setCookie('mathquest_level', { level: state.level, xp: state.xp });
}

function saveCumulativeTime() {
    setCookie('mathquest_cumulative_time', state.cumulativeTimeMs);
}

export function initGamification() {
    // Load level data
    const savedLevel = getCookie('mathquest_level');
    if (savedLevel && typeof savedLevel === 'object') {
        if (typeof savedLevel.xp === 'number') state.xp = savedLevel.xp;
    }

    // Calculate current level from XP
    const info = calculateLevel(state.xp);
    state.level = info.level;
    state.xpForCurrentLevel = info.xpInLevel;
    state.xpToNextLevel = info.xpForNext;

    // Load cumulative time
    const savedTime = getCookie('mathquest_cumulative_time');
    if (typeof savedTime === 'number') state.cumulativeTimeMs = savedTime;

    // Init spaced repetition
    initSpacedRepetition();

    // Init surprise schedule
    initSurpriseSchedule();

    updateUI();
}

// Helper used by other modules — re-export showToast for internal use
function showToast(msg, type) {
    // Call window.showToast since ui-core attaches it
    if (typeof window !== 'undefined' && window.showToast) {
        window.showToast(msg, type);
    }
}

function updateUI() {
    if (typeof window !== 'undefined' && window.updateUI) {
        window.updateUI();
    }
}

function startGame() {
    if (typeof window !== 'undefined' && window.startGame) {
        window.startGame();
    }
}

export function getSessionTimeFormatted() {
    const totalSec = Math.floor(state.sessionTimeMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return min + ":" + (sec < 10 ? "0" : "") + sec;
}

// ===== GAME STATS BANNER =====
const IDLE_THRESHOLD_MS = 90000; // 90 seconds of no interaction → idle
const EFFORT_PER_10SEC = 1;      // +1 effort every 10s of active time
const EFFORT_PER_ATTEMPT = 5;    // +5 for trying any question
const EFFORT_PER_CORRECT = 3;    // +3 bonus on top of attempt for correct
const EFFORT_PER_STREAK = 1;     // +streak count bonus per correct (rewards consistency)

// Research-based thresholds: celebrate early (40%+ neutral) to encourage struggling
// learners, purple for 95%+ mastery (kids associate purple with "legendary" tier)
const MOOD_FACES = [
    { emoji: '😟', bg: '#E74C3C' },   // <40% — keep trying
    { emoji: '😐', bg: '#F39C12' },   // 40-59% — getting there
    { emoji: '🙂', bg: '#F1C40F' },   // 60-74% — nice work
    { emoji: '😊', bg: '#52C41A' },   // 75-84% — great job
    { emoji: '😄', bg: '#2ECC71' },   // 85-94% — excellent
    { emoji: '🤩', bg: '#9B59B6' }    // 95-100% — amazing / mastery
];

// Load or reset daily stats
export function initDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    const saved = getCookie('mathquest_daily_stats');
    if (saved && saved.date === today) {
        state.effortScore = saved.effort || 0;
        state.dailyCorrect = saved.correct || 0;
        state.dailyTotal = saved.total || 0;
        state.dailyActiveTimeMs = saved.timeMs || 0;
        state.sessionStreak = saved.answerStreak || 0;
        state.dailyDate = today;
    } else {
        // New day — archive yesterday's stats (if any) then reset
        if (saved && saved.date && saved.total > 0) {
            archiveDailyStats(saved);
        }
        state.effortScore = 0;
        state.dailyCorrect = 0;
        state.dailyTotal = 0;
        state.dailyActiveTimeMs = 0;
        state.sessionStreak = 0;
        state.dailyDate = today;
    }
    updateBannerDisplay();
}

function saveDailyStats() {
    setCookie('mathquest_daily_stats', {
        date: state.dailyDate,
        effort: state.effortScore,
        correct: state.dailyCorrect,
        total: state.dailyTotal,
        timeMs: state.dailyActiveTimeMs,
        answerStreak: state.sessionStreak
    });
}

// Archive daily stats for 7-day / 30-day history view
function archiveDailyStats(dayData) {
    const history = getCookie('mathquest_stats_history') || [];
    history.push({
        d: dayData.date,
        e: dayData.effort || 0,
        c: dayData.correct || 0,
        t: dayData.total || 0,
        m: dayData.timeMs || 0
    });
    // Keep last 30 days only
    while (history.length > 30) history.shift();
    setCookie('mathquest_stats_history', history);
}

// Get stats history for the last N days (for dashboard display)
export function getStatsHistory(days) {
    const history = getCookie('mathquest_stats_history') || [];
    const today = new Date().toISOString().split('T')[0];

    // Include today's live stats
    const result = [...history];
    if (state.dailyTotal > 0 || state.dailyActiveTimeMs > 0) {
        result.push({
            d: today,
            e: state.effortScore,
            c: state.dailyCorrect,
            t: state.dailyTotal,
            m: state.dailyActiveTimeMs
        });
    }

    // Filter to last N days (days=1 means today only, days=7 means last 7 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return result.filter(entry => entry.d >= cutoffStr);
}

// Render stats history for the dashboard
export function renderStatsHistory() {
    const container = document.getElementById('statsHistoryContainer');
    if (!container) return;

    const week = getStatsHistory(7);
    const month = getStatsHistory(30);

    // Calculate weekly totals
    const weekEffort = week.reduce((s, d) => s + d.e, 0);
    const weekCorrect = week.reduce((s, d) => s + d.c, 0);
    const weekTotal = week.reduce((s, d) => s + d.t, 0);
    const weekTimeMin = Math.round(week.reduce((s, d) => s + d.m, 0) / 60000);
    const weekAccuracy = weekTotal > 0 ? Math.round((weekCorrect / weekTotal) * 100) : 0;

    // Calculate monthly totals
    const monthEffort = month.reduce((s, d) => s + d.e, 0);
    const monthCorrect = month.reduce((s, d) => s + d.c, 0);
    const monthTotal = month.reduce((s, d) => s + d.t, 0);
    const monthTimeMin = Math.round(month.reduce((s, d) => s + d.m, 0) / 60000);
    const monthAccuracy = monthTotal > 0 ? Math.round((monthCorrect / monthTotal) * 100) : 0;

    // Build the sparkline bar chart (last 7 days)
    const maxEffort = Math.max(1, ...week.map(d => d.e));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const barChart = week.map(day => {
        const pct = Math.round((day.e / maxEffort) * 100);
        const date = new Date(day.d + 'T00:00:00');
        const dayName = dayNames[date.getDay()];
        const acc = day.t > 0 ? Math.round((day.c / day.t) * 100) : 0;
        const barColor = acc >= 85 ? 'var(--accent-green)' : acc >= 60 ? 'var(--accent-cyan)' : 'var(--accent-orange)';
        return '<div class="sh-bar-col">' +
            '<div class="sh-bar" style="height:' + Math.max(4, pct) + '%;background:' + barColor + ';" title="' + day.d + ': ' + day.e + ' effort, ' + acc + '% accuracy"></div>' +
            '<div class="sh-bar-label">' + dayName + '</div>' +
        '</div>';
    }).join('');

    container.innerHTML =
        '<div class="sh-section">' +
            '<h4 class="sh-title">Last 7 Days</h4>' +
            '<div class="sh-chart">' + barChart + '</div>' +
            '<div class="sh-summary">' +
                '<span>⭐ ' + weekEffort.toLocaleString() + '</span>' +
                '<span>✓ ' + weekCorrect + '/' + weekTotal + ' (' + weekAccuracy + '%)</span>' +
                '<span>⏱ ' + weekTimeMin + ' min</span>' +
                '<span>' + week.length + ' day' + (week.length !== 1 ? 's' : '') + ' active</span>' +
            '</div>' +
        '</div>' +
        '<div class="sh-section">' +
            '<h4 class="sh-title">Last 30 Days</h4>' +
            '<div class="sh-summary">' +
                '<span>⭐ ' + monthEffort.toLocaleString() + '</span>' +
                '<span>✓ ' + monthCorrect + '/' + monthTotal + ' (' + monthAccuracy + '%)</span>' +
                '<span>⏱ ' + monthTimeMin + ' min</span>' +
                '<span>' + month.length + ' day' + (month.length !== 1 ? 's' : '') + ' active</span>' +
            '</div>' +
        '</div>';
}

// ===== MY STATS MODAL =====
export function openMyStats() {
    const modal = document.getElementById('myStatsModal');
    const body = document.getElementById('myStatsBody');
    if (!modal || !body) return;

    const today = getStatsHistory(1);
    const week = getStatsHistory(7);
    const month = getStatsHistory(30);

    function buildSection(label, data) {
        const effort = data.reduce((s, d) => s + d.e, 0);
        const correct = data.reduce((s, d) => s + d.c, 0);
        const total = data.reduce((s, d) => s + d.t, 0);
        const timeMin = Math.round(data.reduce((s, d) => s + d.m, 0) / 60000);
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const days = data.length;
        return '<div class="mystats-section">' +
            '<div class="mystats-section-title">' + label + '</div>' +
            '<div class="mystats-grid">' +
                '<div class="mystats-stat"><span class="mystats-stat-value">' + effort.toLocaleString() + '</span><span class="mystats-stat-label">⭐ Effort</span></div>' +
                '<div class="mystats-stat"><span class="mystats-stat-value">' + correct + '/' + total + '</span><span class="mystats-stat-label">✓ Score</span></div>' +
                '<div class="mystats-stat"><span class="mystats-stat-value">' + accuracy + '%</span><span class="mystats-stat-label">🎯 Accuracy</span></div>' +
                '<div class="mystats-stat"><span class="mystats-stat-value">' + timeMin + ' min</span><span class="mystats-stat-label">⏱ Time</span></div>' +
                '<div class="mystats-stat"><span class="mystats-stat-value">' + days + '</span><span class="mystats-stat-label">📅 Days Active</span></div>' +
                '<div class="mystats-stat"><span class="mystats-stat-value">' + (state.streak || 0) + '</span><span class="mystats-stat-label">🔥 Day Streak</span></div>' +
            '</div>' +
        '</div>';
    }

    body.innerHTML =
        buildSection('Today', today) +
        buildSection('This Week (7 days)', week) +
        buildSection('This Month (30 days)', month);

    modal.style.display = 'flex';
}

export function closeMyStats() {
    const modal = document.getElementById('myStatsModal');
    if (modal) modal.style.display = 'none';
}

// Start the banner timer for a game session
export function startBannerTimer() {
    state.lastInteractionTime = Date.now();
    state.isIdlePaused = false;
    state.bannerGameStartTime = Date.now();
    // Preserve lastCorrectAnswerTime, timerFrozen, and wrongStreak across skill switches
    // Only initialize lastCorrectAnswerTime if never set (first game of session)
    if (!state.lastCorrectAnswerTime) {
        state.lastCorrectAnswerTime = Date.now();
    }
    if (state.bannerTimerInterval) clearInterval(state.bannerTimerInterval);

    // Tick every 100ms
    let lastTick = Date.now();
    state.bannerTimerInterval = setInterval(() => {
        const now = Date.now();
        const timeSinceInteraction = now - state.lastInteractionTime;
        if (timeSinceInteraction >= IDLE_THRESHOLD_MS) {
            // Idle — pause timer, show indicator on the gauge
            if (!state.isIdlePaused) {
                state.isIdlePaused = true;
                const gaugeEl = document.getElementById('gsbGauge');
                if (gaugeEl) {
                    gaugeEl.classList.add('gsb-paused');
                    gaugeEl.classList.add('gsb-alert');
                }
            }
        } else {
            // Active — accumulate time (unless frozen)
            if (state.isIdlePaused) {
                state.isIdlePaused = false;
                const gaugeEl = document.getElementById('gsbGauge');
                if (gaugeEl) {
                    gaugeEl.classList.remove('gsb-paused');
                    gaugeEl.classList.remove('gsb-alert');
                }
                lastTick = now; // Don't count the idle gap
            }
            if (!state.timerFrozen) {
                const delta = now - lastTick;
                state.dailyActiveTimeMs += delta;

                // Award effort points for time (every 10 seconds of active time)
                const totalSec = Math.floor(state.dailyActiveTimeMs / 1000);
                const prevSec = Math.floor((state.dailyActiveTimeMs - delta) / 1000);
                const newTens = Math.floor(totalSec / 10);
                const oldTens = Math.floor(prevSec / 10);
                if (newTens > oldTens) {
                    state.effortScore += EFFORT_PER_10SEC * (newTens - oldTens);
                }
            }
        }
        lastTick = now;
        updateBannerDisplay();
    }, 100);

    // Listen for user interactions to detect activity
    setupIdleDetection();
}

export function stopBannerTimer() {
    if (state.bannerTimerInterval) {
        clearInterval(state.bannerTimerInterval);
        state.bannerTimerInterval = null;
    }
    saveDailyStats();
    removeIdleDetection();
}

// Called when student answers a question — update daily stats + effort
export function bannerRecordAnswer(isCorrect) {
    state.dailyTotal++;
    state.effortScore += EFFORT_PER_ATTEMPT;
    if (isCorrect) {
        state.dailyCorrect++;
        state.effortScore += EFFORT_PER_CORRECT;
        state.effortScore += Math.min(state.sessionStreak, 20) * EFFORT_PER_STREAK;
        // Correct answer: reset all warning states
        state.wrongStreak = 0;
        state.lastCorrectAnswerTime = Date.now();
        state.timerFrozen = false;
        const gaugeEl = document.getElementById('gsbGauge');
        if (gaugeEl) gaugeEl.classList.remove('gsb-warn', 'gsb-danger');
        // Resume game countdown timer if it was paused
        if (state.gameTimerPaused && typeof window.resumeGameTimer === 'function') {
            window.resumeGameTimer();
        }
    } else {
        // Track consecutive wrong answers
        // 3 wrong → yellow warn + pause game timer
        // 6 wrong → red danger + freeze banner timer
        state.wrongStreak++;
        const gaugeEl = document.getElementById('gsbGauge');
        if (gaugeEl) {
            if (state.wrongStreak >= 6) {
                gaugeEl.classList.remove('gsb-warn');
                gaugeEl.classList.add('gsb-danger');
                state.timerFrozen = true;
            } else if (state.wrongStreak >= 3 && !gaugeEl.classList.contains('gsb-danger')) {
                gaugeEl.classList.add('gsb-warn');
            }
        }
        // Pause game countdown timer after 3 consecutive wrong answers
        if (state.wrongStreak >= 3 && !state.gameTimerPaused && typeof window.pauseGameTimer === 'function') {
            window.pauseGameTimer();
            if (typeof window.showToast === 'function') {
                window.showToast('Timer paused — take your time!', 'info');
            }
        }
    }
    saveDailyStats();
    updateBannerDisplay();
}

// Calculate mood face index (0-5) from accuracy AND time decay
// Accuracy is the primary driver; elapsed time without answering drags mood down
function getMoodIndex() {
    // Base mood from accuracy
    let baseMood;
    if (state.dailyTotal === 0) {
        baseMood = 3; // start happy
    } else {
        const pct = (state.dailyCorrect / state.dailyTotal) * 100;
        if (pct < 40) baseMood = 0;
        else if (pct < 60) baseMood = 1;
        else if (pct < 75) baseMood = 2;
        else if (pct < 85) baseMood = 3;
        else if (pct < 95) baseMood = 4;
        else baseMood = 5;
    }
    // Time decay: if timer is running and no answer for a while, mood drops
    // Every 20s of elapsed question time drops mood by 1 level
    const qElapsed = state.questionElapsedMs || 0;
    const timePenalty = Math.floor(qElapsed / 20000);
    return Math.max(0, baseMood - timePenalty);
}

// Update all banner DOM elements
export function updateBannerDisplay() {
    // Timer
    const timerEl = document.getElementById('gsbTimer');
    const gaugeEl = document.getElementById('gsbGauge');
    if (timerEl) {
        const totalMs = state.dailyActiveTimeMs;
        const min = Math.floor(totalMs / 60000);
        const sec = Math.floor((totalMs % 60000) / 1000);
        const ds = Math.floor((totalMs % 1000) / 100);
        timerEl.textContent = min + ':' + (sec < 10 ? '0' : '') + sec + '.' + ds;
    }
    // Timer color: escalate from time OR wrong streak (whichever is worse).
    // Only a correct answer clears warn/danger — never auto-clear here.
    if (gaugeEl) {
        const secSinceCorrect = state.lastCorrectAnswerTime
            ? (Date.now() - state.lastCorrectAnswerTime) / 1000 : 0;
        // Time-based freeze at 45s without correct answer
        if (secSinceCorrect >= 45 && !state.timerFrozen) {
            state.timerFrozen = true;
        }
        // Time-based escalation (only escalate, never downgrade)
        if (secSinceCorrect >= 60 && !gaugeEl.classList.contains('gsb-danger')) {
            gaugeEl.classList.remove('gsb-warn');
            gaugeEl.classList.add('gsb-danger');
        } else if (secSinceCorrect >= 30 && !gaugeEl.classList.contains('gsb-warn') && !gaugeEl.classList.contains('gsb-danger')) {
            gaugeEl.classList.add('gsb-warn');
        }
        // Streak-based escalation handled in bannerRecordAnswer()
    }

    // Score
    const scoreEl = document.getElementById('gsbScore');
    if (scoreEl) {
        scoreEl.textContent = state.dailyCorrect + ' / ' + state.dailyTotal;
    }

    // Streak
    const streakEl = document.getElementById('gsbStreak');
    if (streakEl) {
        streakEl.textContent = state.sessionStreak;
        const icon = streakEl.previousElementSibling;
        if (icon) {
            if (state.sessionStreak >= 5) icon.classList.add('gsb-fire-hot');
            else icon.classList.remove('gsb-fire-hot');
        }
    }

    // Mood face (with pop animation on change)
    const faceEl = document.getElementById('gsbMoodFace');
    if (faceEl) {
        const idx = getMoodIndex();
        const mood = MOOD_FACES[idx];
        if (faceEl.textContent !== mood.emoji) {
            faceEl.textContent = mood.emoji;
            faceEl.style.filter = 'drop-shadow(0 1px 4px ' + mood.bg + '40)';
            faceEl.classList.add('gsb-mood-change');
            setTimeout(() => faceEl.classList.remove('gsb-mood-change'), 500);
        }
    }

    // Effort score (comma-formatted — "1,245" feels more impressive to kids)
    const effortEl = document.getElementById('gsbEffort');
    if (effortEl) {
        effortEl.textContent = state.effortScore.toLocaleString();
    }

    // Daily Streak (days in a row)
    const dailyStreakEl = document.getElementById('gsbDailyStreak');
    if (dailyStreakEl) {
        dailyStreakEl.textContent = state.streak || 0;
    }

    // The persistent banner is always visible in student mode (no separate home banner needed)
}

// Idle detection — listen for any user interaction
let _idleHandler = null;
function setupIdleDetection() {
    if (_idleHandler) return;
    _idleHandler = () => { state.lastInteractionTime = Date.now(); };
    document.addEventListener('mousemove', _idleHandler, { passive: true });
    document.addEventListener('keydown', _idleHandler, { passive: true });
    document.addEventListener('click', _idleHandler, { passive: true });
    document.addEventListener('touchstart', _idleHandler, { passive: true });
    document.addEventListener('pointerdown', _idleHandler, { passive: true });
}
function removeIdleDetection() {
    if (!_idleHandler) return;
    document.removeEventListener('mousemove', _idleHandler);
    document.removeEventListener('keydown', _idleHandler);
    document.removeEventListener('click', _idleHandler);
    document.removeEventListener('touchstart', _idleHandler);
    document.removeEventListener('pointerdown', _idleHandler);
    _idleHandler = null;
}

// ===== STUDENT LANDING MODAL =====
export function showStudentLandingModal(parsed) {
    state.landingSettings = parsed;

    // Decode skill codes to human-readable names
    const skillParts = parsed.skillsCode.split('-');
    const decodedSkills = [];
    for (const part of skillParts) {
        if (part.length < 2) continue;
        const code = part.substring(0, 2).toUpperCase();
        const weightStr = part.substring(2);
        const weight = weightStr ? parseInt(weightStr, 10) : 0;
        const info = CODE_TO_SKILL[code];
        if (info) {
            decodedSkills.push({ label: info.skillLabel, weight: isNaN(weight) ? 0 : weight });
        }
    }

    // Build skill pills
    let skillsHTML = '<div class="landing-skills" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0;">';
    if (decodedSkills.length > 0) {
        for (const sk of decodedSkills) {
            const weightBadge = sk.weight > 0 ? ' <span style="opacity:0.7;font-size:0.7em;">x' + sk.weight + '</span>' : '';
            skillsHTML += '<span class="landing-badge" style="background:var(--accent-purple,#7c4dff);">' + sk.label + weightBadge + '</span>';
        }
    } else {
        skillsHTML += '<div class="landing-skill-code">' + parsed.skillsCode + '</div>';
    }
    skillsHTML += '</div>';

    // Build settings display
    let settingsHTML = '<div class="landing-settings" style="margin:12px 0;">';
    const s = parsed.settings;

    // Fixed settings as badges
    let badgesHTML = '';
    if (s.timer !== undefined && s.timer !== '?') {
        const timerLabel = s.timer === 0 ? 'No time limit' : (s.timer >= 60 ? Math.floor(s.timer / 60) + ' min' : s.timer + 's');
        badgesHTML += '<span class="landing-badge">Timer: ' + timerLabel + '</span>';
    }
    if (s.problemCount !== undefined && s.problemCount !== '?') {
        const countLabel = s.problemCount === 0 ? 'Unlimited' : s.problemCount + ' problems';
        badgesHTML += '<span class="landing-badge">Count: ' + countLabel + '</span>';
    }
    if (s.gameMode && s.gameMode !== '?') {
        const modeLabels = { practice: 'Practice', boss: 'Boss Battle', race: 'Car Race', worksheet: 'Worksheet' };
        badgesHTML += '<span class="landing-badge">Mode: ' + (modeLabels[s.gameMode] || s.gameMode) + '</span>';
    }
    if (s.range !== undefined && s.range !== '?') {
        badgesHTML += '<span class="landing-badge">Max: ' + s.range + '</span>';
    }
    if (s.decimals !== undefined && s.decimals !== '?') {
        badgesHTML += '<span class="landing-badge">Decimals: ' + s.decimals + '</span>';
    }
    if (badgesHTML) {
        settingsHTML += '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:10px;">' + badgesHTML + '</div>';
    }

    // Student-choice settings as dropdowns
    let choicesHTML = '';
    if (!s.gameMode || s.gameMode === '?') {
        choicesHTML += '<div class="landing-choice"><label>Game Mode:</label><select id="landingMode"><option value="practice">Practice</option><option value="boss">Boss Battle</option><option value="race">Car Race</option></select></div>';
    }
    if (s.timer === undefined || s.timer === '?') {
        choicesHTML += '<div class="landing-choice"><label>Timer:</label><select id="landingTimer"><option value="0">No Limit</option><option value="60">1 min</option><option value="120">2 min</option><option value="180">3 min</option><option value="300" selected>5 min</option><option value="600">10 min</option></select></div>';
    }
    if (s.problemCount === undefined || s.problemCount === '?') {
        choicesHTML += '<div class="landing-choice"><label>Problems:</label><select id="landingCount"><option value="10">10</option><option value="20" selected>20</option><option value="30">30</option><option value="50">50</option><option value="0">Unlimited</option></select></div>';
    }
    if (choicesHTML) {
        settingsHTML += '<div class="landing-choices">' + choicesHTML + '</div>';
    }

    settingsHTML += '</div>';

    // Build modal
    const overlay = document.createElement('div');
    overlay.id = 'studentLandingOverlay';
    overlay.className = 'landing-overlay';
    overlay.innerHTML = '<div class="landing-modal">' +
        '<h2>Ready to Practice!</h2>' +
        '<p>Your teacher has set up a practice session for you.</p>' +
        skillsHTML +
        settingsHTML +
        '<button class="btn btn-primary landing-start-btn" onclick="startFromLanding()">Start Playing!</button>' +
        '</div>';
    document.body.appendChild(overlay);
}

export function startFromLanding() {
    const parsed = state.landingSettings;
    if (!parsed) return;

    const s = parsed.settings;

    // Remove modal
    const overlay = document.getElementById('studentLandingOverlay');
    if (overlay) overlay.remove();

    // Force student mode
    if (!document.body.classList.contains('student-mode')) {
        if (typeof window !== 'undefined' && window.toggleUserRole) {
            window.toggleUserRole();
        }
    }

    // Step 1: Load skills into queue via applySkillCode (synchronous)
    const tempInput = document.createElement('input');
    tempInput.id = '_landingCodeInput';
    tempInput.value = parsed.skillsCode;
    tempInput.style.display = 'none';
    document.body.appendChild(tempInput);
    if (typeof window !== 'undefined' && window.applySkillCode) {
        window.applySkillCode('_landingCodeInput');
    }
    tempInput.remove();

    if (window.skillQueue.length === 0) {
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Could not load skills from link', 'error');
        }
        return;
    }

    // Step 2: Resolve all settings (fixed from link or student choice from dropdowns)
    let timerDuration;
    if (s.timer !== undefined && s.timer !== '?') {
        timerDuration = s.timer;
    } else {
        const el = document.getElementById('landingTimer');
        timerDuration = el ? parseInt(el.value, 10) : 0;
    }

    let problemCount;
    let infinityMode = false;
    if (s.problemCount !== undefined && s.problemCount !== '?') {
        if (s.problemCount === 0) {
            infinityMode = true;
            problemCount = 999999;
        } else {
            problemCount = s.problemCount;
        }
    } else {
        const el = document.getElementById('landingCount');
        const val = el ? parseInt(el.value, 10) : 20;
        if (val === 0) {
            infinityMode = true;
            problemCount = 999999;
        } else {
            problemCount = val;
        }
    }

    let gameMode;
    if (s.gameMode && s.gameMode !== '?') {
        gameMode = s.gameMode;
    } else {
        const el = document.getElementById('landingMode');
        gameMode = el ? el.value : 'practice';
    }

    let range = 100;
    if (s.range !== undefined && s.range !== '?') {
        range = s.range;
    }

    let decimals = 0;
    if (s.decimals !== undefined && s.decimals !== '?') {
        decimals = s.decimals;
    }

    // Step 3: Build mixedModeSettings from the queue so startGame() takes
    // the isCustomMixed path (bypassing playSelectedSkills redirect)
    const selectedSkills = {};
    window.skillQueue.forEach(skill => {
        if (!selectedSkills[skill.categoryId]) {
            selectedSkills[skill.categoryId] = [];
        }
        if (!selectedSkills[skill.categoryId].includes(skill.skillId)) {
            selectedSkills[skill.categoryId].push(skill.skillId);
        }
    });

    state.mixedModeSettings = {
        selectedSkills: selectedSkills,
        name: 'Shared Practice (' + window.skillQueue.length + ' skills)',
        range: range,
        decimalPlaces: decimals,
        timeChoice: 'teacher',
        timer: timerDuration,
        totalProblemsEnabled: !infinityMode,
        totalProblems: infinityMode ? 0 : problemCount
    };

    // Step 4: Set state so startGame sees isMixedMode = true and uses
    // mixedModeSettings instead of reading from HTML dropdowns
    state.category = 'all_mixed';
    state.skill = 'custom_mixed';
    state.isMixedMode = true;
    state.gameMode = gameMode;
    state.infinityMode = infinityMode;
    state.range = range;
    state.decimalPlaces = decimals;
    state.timerDuration = timerDuration;
    state.problemCount = problemCount;

    // Step 5: Sync UI dropdowns so startGame reads correct values
    // for fields it always reads from DOM
    const timerSelect = document.getElementById('timerSelect');
    if (timerSelect) timerSelect.value = String(timerDuration);

    const problemCountSelect = document.getElementById('problemCountSelect');
    if (problemCountSelect) {
        // Use closest available option
        const opts = Array.from(problemCountSelect.options).map(o => o.value);
        if (opts.includes(String(problemCount))) {
            problemCountSelect.value = String(problemCount);
        } else if (infinityMode && opts.includes('0')) {
            problemCountSelect.value = '0';
        }
    }

    const rangeSelect = document.getElementById('rangeSelect');
    if (rangeSelect) rangeSelect.value = String(range);

    const decimalSelect = document.getElementById('decimalSelect');
    if (decimalSelect) decimalSelect.value = String(decimals);

    // Set domain/category/skill dropdowns for mixed mode
    const domainSelect = document.getElementById('domainSelect');
    if (domainSelect) {
        domainSelect.value = 'all_domains';
        if (typeof window.updateCategoryOptions === 'function') window.updateCategoryOptions();
    }
    const categorySelect = document.getElementById('categorySelect');
    if (categorySelect) categorySelect.value = 'all_mixed';
    const skillSelect = document.getElementById('skillSelect');
    if (skillSelect) skillSelect.value = 'custom_mixed';

    // Step 6: Start game — isMixedMode=true skips the playSelectedSkills
    // redirect, isCustomMixed=true reads range/decimals from mixedModeSettings,
    // timeChoice='teacher' reads timer from mixedModeSettings
    if (typeof window !== 'undefined' && window.startGame) {
        window.startGame();
    }
}

// ===== INFINITY MODE ROUND SYSTEM =====
export function checkRoundEnd() {
    if (!state.infinityMode) return;
    const elapsed = Date.now() - (state.roundStartTime || Date.now());
    if (elapsed >= state.roundDurationMs) {
        showRoundModal();
    }
}

function showRoundModal() {
    const overlay = document.createElement('div');
    overlay.id = 'roundOverlay';
    overlay.className = 'landing-overlay';
    overlay.innerHTML = '<div class="landing-modal">' +
        '<h2>Round ' + state.roundNumber + ' Complete!</h2>' +
        '<div class="round-score"><span class="round-correct">' + state.score + ' Correct!</span>' +
        '<span class="round-total">out of ' + state.qCount + ' attempted</span></div>' +
        '<div class="round-buttons">' +
        '<button class="btn btn-primary" onclick="continueNextRound()">Continue</button>' +
        '<button class="btn btn-secondary" onclick="endGame()">Finish</button>' +
        '</div></div>';
    document.body.appendChild(overlay);
}

export function continueNextRound() {
    state.roundNumber++;
    state.roundStartTime = Date.now();
    const overlay = document.getElementById('roundOverlay');
    if (overlay) overlay.remove();
    if (typeof window !== 'undefined' && window.nextQuestion) {
        window.nextQuestion();
    }
}

// ===== TIMER PROGRESS POPUPS =====
export function checkTimerProgress() {
    if (state.infinityMode || !state.timerDuration || state.timerDuration <= 0) return;
    const elapsed = state.timerDuration - state.timerRemaining;
    const total = state.timerDuration;
    const pct = elapsed / total;

    if (!state._timerProgressShown) state._timerProgressShown = {};

    const milestones = [0.25, 0.50, 0.75];
    for (const m of milestones) {
        if (pct >= m && !state._timerProgressShown[m]) {
            state._timerProgressShown[m] = true;
            const pctLabel = Math.round(m * 100) + '%';
            const remaining = state.timerRemaining;
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            const timeLeft = mins + ':' + String(secs).padStart(2, '0');
            showToast(pctLabel + ' done! ' + state.score + ' correct so far! ' + timeLeft + ' to go!', 'info');
        }
    }
}

// ===== ON-TASK TIMER =====
export function startQuestionTimer(skillId) {
    clearQuestionTimer();
    state.questionElapsedMs = 0;
    const category = SKILL_TIME_CATEGORY[skillId] || "extended";
    const thresholdMs = category === "quick" ? 25000 : 50000;

    state.questionTimerInterval = setInterval(() => {
        state.questionElapsedMs += 1000;
        if (state.questionElapsedMs >= thresholdMs) {
            showOffTaskIndicator();
        }
    }, 1000);
}

export function clearQuestionTimer() {
    if (state.questionTimerInterval) {
        clearInterval(state.questionTimerInterval);
        state.questionTimerInterval = null;
    }
    state.questionElapsedMs = 0;
    hideOffTaskIndicator();
}

function showOffTaskIndicator() {
    const gaugeEl = document.getElementById('gsbGauge');
    if (gaugeEl && !gaugeEl.classList.contains('gsb-alert')) {
        gaugeEl.classList.add('gsb-alert');
        // Save and override mood face
        const moodFace = document.getElementById('gsbMoodFace');
        if (moodFace) {
            state.savedMoodFace = moodFace.textContent;
            moodFace.textContent = '\u{1F61F}'; // worried face
        }
    }
}

function hideOffTaskIndicator() {
    const gaugeEl = document.getElementById('gsbGauge');
    if (gaugeEl) {
        gaugeEl.classList.remove('gsb-alert');
    }
    // Restore mood face
    if (state.savedMoodFace) {
        const moodFace = document.getElementById('gsbMoodFace');
        if (moodFace) {
            moodFace.textContent = state.savedMoodFace;
        }
        state.savedMoodFace = null;
    }
}
