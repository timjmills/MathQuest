import { state } from './state.js';
import { recordPracticeLog } from './storage.js';

// ===== WRONG-ANSWER RETRY HELPERS =====
// Used by Practice + MAP Practice. Keep the problem on screen after a wrong
// answer, cross out the wrong choice, and reveal a Skip button after the 2nd
// wrong attempt so the student can move on if truly stuck.

// Should we apply the retry-then-skip behavior for the current session?
// Yes for: standard Practice mode + MAP Practice mode.
// No for:  MAP Simulation, Worksheet, Quiz, Boss/Race (handled elsewhere).
export function isRetryWithSkipMode() {
    if (state.mapMode === true) {
        return state.mapSessionMode === 'practice';
    }
    return state.gameMode === 'practice';
}

// Reset attempt tracking — call when a new question is shown or after correct answer.
export function resetAttemptTracking() {
    state.currentQAttempts = 0;
    state.currentQAttemptHistory = [];
    // Hide skip button + clear any cross-outs
    const skipBtn = document.getElementById('skipBtn');
    if (skipBtn) skipBtn.style.display = 'none';
    const histBox = document.getElementById('attemptHistoryBox');
    if (histBox) { histBox.innerHTML = ''; histBox.style.display = 'none'; }
    // Re-enable any wrong-choice buttons (cross-outs cleared on next render anyway)
    const optsContainer = document.getElementById('answerOptions');
    if (optsContainer) {
        optsContainer.querySelectorAll('.wrong-choice').forEach(el => {
            el.classList.remove('wrong-choice');
        });
    }
}

// Mark a clicked multi-choice button as wrong (cross-out + disabled).
export function markWrongChoice(btnElement) {
    if (!btnElement) return;
    btnElement.classList.add('wrong-choice');
    // Defensive: also remove the transient .incorrect class if any setTimeout
    // would have stripped it; .wrong-choice persists through the question.
    btnElement.classList.remove('incorrect');
}

// Append a strikethrough chip to the attempt-history box (for numeric / text inputs)
export function appendAttemptHistory(submittedAnswer) {
    let histBox = document.getElementById('attemptHistoryBox');
    if (!histBox) {
        histBox = document.createElement('div');
        histBox.id = 'attemptHistoryBox';
        histBox.className = 'attempt-history';
        // Mount just below the feedback area for visibility
        const feedback = document.getElementById('feedbackArea');
        if (feedback && feedback.parentNode) {
            feedback.parentNode.insertBefore(histBox, feedback.nextSibling);
        } else {
            const card = document.getElementById('questionCard');
            if (card) card.appendChild(histBox);
        }
    }
    histBox.style.display = 'flex';
    const chip = document.createElement('span');
    chip.className = 'past-wrong';
    chip.textContent = String(submittedAnswer);
    histBox.appendChild(chip);
}

// Make sure a Skip button exists in the DOM (idempotent). Returns the button.
export function ensureSkipButton() {
    let skipBtn = document.getElementById('skipBtn');
    if (skipBtn) return skipBtn;
    skipBtn = document.createElement('button');
    skipBtn.id = 'skipBtn';
    skipBtn.type = 'button';
    skipBtn.className = 'skip-btn';
    skipBtn.textContent = 'Skip →';
    skipBtn.style.display = 'none';
    skipBtn.onclick = () => {
        if (typeof window.skipCurrentItem === 'function') window.skipCurrentItem();
    };
    // Wrap in a container for centering, mount below feedback area
    const container = document.createElement('div');
    container.className = 'skip-btn-container';
    container.appendChild(skipBtn);
    const feedback = document.getElementById('feedbackArea');
    if (feedback && feedback.parentNode) {
        feedback.parentNode.insertBefore(container, feedback.nextSibling);
    } else {
        const card = document.getElementById('questionCard');
        if (card) card.appendChild(container);
    }
    return skipBtn;
}

// Show the skip button after enough wrong attempts (>= 2).
export function showSkipButtonIfNeeded() {
    if ((state.currentQAttempts || 0) >= 2) {
        const skipBtn = ensureSkipButton();
        if (skipBtn) skipBtn.style.display = 'inline-block';
    }
}

// Record a wrong attempt: bumps counter, stores submission, optionally crosses
// out the multi-choice button, optionally appends to history chips.
// Then conditionally shows Skip.
export function recordWrongAttempt({ submitted, btnElement, showHistoryChip }) {
    state.currentQAttempts = (state.currentQAttempts || 0) + 1;
    if (!Array.isArray(state.currentQAttemptHistory)) state.currentQAttemptHistory = [];
    state.currentQAttemptHistory.push(submitted);
    if (btnElement) markWrongChoice(btnElement);
    if (showHistoryChip && submitted !== undefined && submitted !== null && String(submitted).length) {
        appendAttemptHistory(submitted);
    }
    showSkipButtonIfNeeded();
}

// Skip the current item — invoked by the Skip button after 2nd wrong attempt.
// MAP Practice: hand off to skipMapItem (records wrong, advances).
// Standard Practice: mark wrong, advance via nextQuestion (forces past the
//   "must be correct to advance" guard by setting lastAnswerCorrect = true).
export function skipCurrentItem() {
    // Always reset attempt UI so the next question starts fresh
    state.hasAnswered = true;
    if (state.mapMode === true && state.mapSessionMode === 'practice') {
        if (typeof window.skipMapItem === 'function') {
            window.skipMapItem();
        } else if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: false });
        }
        return;
    }
    // Standard practice (or other non-MAP modes that mistakenly call here)
    state.lastAnswerCorrect = true; // bypass nextQuestion guard
    resetAttemptTracking();
    if (typeof window.transitionToNextQuestion === 'function') {
        window.transitionToNextQuestion();
    } else if (typeof window.nextQuestion === 'function') {
        window.nextQuestion();
    }
}

// ===== PER-SKILL SESSION TRACKING =====
export function trackSkillAnswer(isCorrect) {
    const skillId = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    if (skillId === 'custom_mixed' || skillId === 'all_mixed') return;
    const timeMs = state.questionStartTime ? Math.max(0, Date.now() - state.questionStartTime) : 0;
    // Cap at 120s to exclude idle time
    const cappedTime = Math.min(timeMs, 120000);
    if (!state.currentSessionSkills) state.currentSessionSkills = {};
    if (!state.currentSessionSkills[skillId]) {
        const label = (state.currentQ && state.currentQ.skillLabel) || skillId;
        state.currentSessionSkills[skillId] = { attempted: 0, correct: 0, timeMs: 0, label };
    }
    const entry = state.currentSessionSkills[skillId];
    entry.attempted++;
    if (isCorrect) entry.correct++;
    entry.timeMs += cappedTime;
}

// ===== FLEXIBLE TIME ANSWER HELPERS =====

// Check if the current skill is time-related
export function isTimeSkill(skill) {
    if (!skill) return false;
    return skill.startsWith('time_') || skill.startsWith('elapsed_');
}

// Duration skills return elapsed durations ("1 hour", "30 minutes") vs clock times ("3:45")
function isDurationSkill(skill) {
    if (!skill) return false;
    return skill.startsWith('elapsed_visual_');
}

// Parse a clock time string → {hours, minutes} in 12-hour format, or null
function parseClockTime(str) {
    if (!str) return null;
    str = str.toString().trim();

    // Strip AM/PM variants (3:45 PM, 3:45pm, 3:45 p.m.)
    str = str.replace(/\s*(a\.?\s*m\.?|p\.?\s*m\.?)\s*$/i, '').trim();

    // "H:MM" or "HH:MM"
    let m = str.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        let h = parseInt(m[1]) % 12 || 12;
        return { hours: h, minutes: parseInt(m[2]) };
    }

    // "N o'clock"
    m = str.match(/^(\d{1,2})\s*o['']?\s*clock$/i);
    if (m) {
        let h = parseInt(m[1]) % 12 || 12;
        return { hours: h, minutes: 0 };
    }

    return null;
}

// Parse a duration string → total minutes, or null
function parseDuration(str) {
    if (!str) return null;
    str = str.toString().trim().toLowerCase();

    // "H:MM" format interpreted as hours:minutes duration
    let m = str.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        return parseInt(m[1]) * 60 + parseInt(m[2]);
    }

    let totalMin = 0;
    let found = false;

    // "N hour(s)" / "N hr(s)"
    m = str.match(/(\d+)\s*(?:hours?|hrs?)\b/);
    if (m) { totalMin += parseInt(m[1]) * 60; found = true; }

    // "N minute(s)" / "N min(s)"
    m = str.match(/(\d+)\s*(?:minutes?|mins?)\b/);
    if (m) { totalMin += parseInt(m[1]); found = true; }

    if (found) return totalMin;

    // Bare number → treat as minutes
    m = str.match(/^(\d+)$/);
    if (m) return parseInt(m[1]);

    return null;
}

// Flexible time/duration comparison: accepts multiple equivalent formats
export function timeAnswersMatch(userAns, correctAns, skill) {
    // Quick exact match first (handles MC clicks where option text === q.ans)
    if (normalizeText(userAns) === normalizeText(correctAns)) return true;

    if (isDurationSkill(skill)) {
        // Duration: "1 hour" = "1:00" = "60 minutes" = "60"
        const userDur = parseDuration(userAns);
        const ansDur = parseDuration(correctAns);
        if (userDur !== null && ansDur !== null) return userDur === ansDur;
    } else {
        // Clock time: "3:45" = "3:45 PM" = "03:45" = "3:45pm"
        const userTime = parseClockTime(userAns);
        const ansTime = parseClockTime(correctAns);
        if (userTime && ansTime) {
            return userTime.hours === ansTime.hours && userTime.minutes === ansTime.minutes;
        }
    }

    return false;
}

// ===== FRACTION ANSWER EQUIVALENCE =====

// Parse a fraction string → { num, den } or null
// Accepts: "3/4", "2 3/4", "2-3/4", "11/4", "3", whole numbers
function parseFraction(str) {
    if (!str) return null;
    str = str.toString().trim();

    // Mixed number: "2 3/4" or "2-3/4"
    let m = str.match(/^(-?\d+)\s*[\s-]\s*(\d+)\s*\/\s*(\d+)$/);
    if (m) {
        const whole = parseInt(m[1]);
        const num = parseInt(m[2]);
        const den = parseInt(m[3]);
        if (den === 0) return null;
        const sign = whole < 0 ? -1 : 1;
        return { num: sign * (Math.abs(whole) * den + num), den };
    }

    // Simple fraction: "3/4" or "-3/4"
    m = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (m) {
        const num = parseInt(m[1]);
        const den = parseInt(m[2]);
        if (den === 0) return null;
        return { num, den };
    }

    // Whole number: "3" → 3/1
    m = str.match(/^(-?\d+)$/);
    if (m) {
        return { num: parseInt(m[1]), den: 1 };
    }

    return null;
}

// Check if two fraction answers are equivalent
// "6/8" = "3/4", "2 3/4" = "11/4", "3" = "3/1"
export function fractionAnswersMatch(userAns, correctAns) {
    const userFrac = parseFraction(userAns);
    const ansFrac = parseFraction(correctAns);

    if (!userFrac || !ansFrac) return false;

    // Cross-multiplication comparison: a/b = c/d iff a*d = b*c
    return userFrac.num * ansFrac.den === userFrac.den * ansFrac.num;
}

// Check if a skill uses fraction answers
function isFractionSkill(skill) {
    if (!skill) return false;
    const fracSkills = [
        'add_fractions_like', 'sub_fractions_like', 'add_mixed_like', 'sub_mixed_like',
        'mult_frac_whole', 'decompose_fractions', 'frac_word_problems',
        'add_frac_unlike', 'sub_frac_unlike', 'add_mixed_unlike', 'sub_mixed_unlike',
        'mult_frac_frac', 'div_unit_fraction', 'frac_as_division', 'frac_mult_word',
        'fraction_number_line', 'whole_as_fraction', 'frac_10_100',
        'add_frac_like_nv', 'sub_frac_like_nv', 'add_frac_unlike_nv', 'sub_frac_unlike_nv',
        'add_mixed_like_nv', 'sub_mixed_like_nv', 'add_mixed_unlike_nv', 'sub_mixed_unlike_nv',
        'mixed_fraction_ops',
        'identify_nv', 'equiv_frac_nv', 'fraction_of_set_nv', 'fraction_of_set_hard_nv',
        'mult_frac_whole_nv', 'decompose_frac_nv', 'frac_10_100_nv',
        'mult_frac_frac_nv', 'div_unit_frac_nv', 'frac_as_div_nv', 'mult_scaling_nv',
        'order_fractions', 'benchmark_fractions', 'compare_frac_lcd',
        'graph_fractions', 'round_fractions', 'estimate_frac_ops',
        'd_to_f', 'p_to_f'
    ];
    return fracSkills.includes(skill);
}

export function checkAnswer(userAns, btnElement) {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    const type = q.answerType || (typeof q.ans === "number" ? "number" : "text");
    let isCorrect = false;

    // Track response time for adaptive difficulty
    const responseTime = state.questionStartTime ? Date.now() - state.questionStartTime : 5000;

    if (type === "number") {
        // Strip commas from user input before parsing (allow commas but don't require them)
        const cleanedInput = String(userAns).replace(/,/g, "");
        const userValue = Number(cleanedInput);
        isCorrect = !Number.isNaN(userValue) && Number(userValue.toFixed(3)) === Number(Number(q.ans).toFixed(3));
    } else if (isTimeSkill(state.skill)) {
        // Flexible time/duration comparison for all time skills
        isCorrect = timeAnswersMatch(userAns, q.ans, state.skill);
    } else if (isFractionSkill(state.skill)) {
        // Fraction equivalence: "6/8" = "3/4", "2 3/4" = "11/4"
        isCorrect = fractionAnswersMatch(userAns, q.ans);
    } else {
        isCorrect = normalizeText(userAns) === normalizeText(q.ans);
    }

    // ===== MAP MODE BRANCH =====
    // MAP sessions own their own answer flow: no XP, no streak/boss/race side
    // effects, no auto-advance via transitionToNextQuestion. The MAP engine
    // handles its own next-item scheduling.
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;

        if (state.mapSessionMode === 'practice') {
            // Practice: keep problem on screen for retries. Cross out wrong
            // choices; show Skip after 2 wrong attempts. Only correct answers
            // (or explicit Skip) advance the engine.
            const feedback = document.getElementById("feedbackArea");
            const card = document.getElementById("questionCard");
            if (isCorrect) {
                state.hasAnswered = true;
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area correct";
                    feedback.innerHTML = `🎉 Correct!`;
                }
                if (card) card.classList.add("correct-bg");
                if (btnElement) btnElement.classList.add("correct");
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                // Wrong: do NOT call recordMapAnswer (engine would advance).
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area incorrect";
                    feedback.innerHTML = `❌ Not quite — try again!`;
                }
                if (card) {
                    card.classList.add("incorrect-bg");
                    setTimeout(() => card.classList.remove("incorrect-bg"), 700);
                }
                const isMC = (q.options && q.options.length > 0);
                recordWrongAttempt({
                    submitted: userAns,
                    btnElement: isMC ? btnElement : null,
                    showHistoryChip: !isMC,
                });
                const answerInput = document.getElementById("answerInput");
                if (answerInput) {
                    answerInput.value = "";
                    answerInput.disabled = false;
                    answerInput.style.borderColor = "";
                    answerInput.style.background = "";
                    setTimeout(() => answerInput.focus(), 50);
                }
                state.hasAnswered = false;
            }
        } else {
            // Simulation mode — silent feedback, advance regardless
            state.hasAnswered = true;
            if (typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: isCorrect });
            }
        }
        return;
    }

    // ===== PROGRESS TRACKING & ADAPTIVE DIFFICULTY =====
    // Update skill progress
    const currentSkill = state.skill || 'add';
    updateSkillProgress(currentSkill, isCorrect);
    
    // Track performance for adaptive difficulty
    trackPerformance(isCorrect, responseTime);

    // Format answer with commas for display
    const displayAnswer = typeof q.ans === "number" && Number.isInteger(q.ans) ? q.ans.toLocaleString() : q.ans;

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    feedback.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
    // Wrong-answer feedback hides the correct answer so the student keeps trying.
    feedback.innerHTML = isCorrect ? `🎉 Correct!` : `❌ Not quite — try again!`;

    // Show the "Show Solution" button after answering
    const solutionBtn = document.getElementById("solutionBtn");
    if (solutionBtn) solutionBtn.style.display = "inline-block";

    if (btnElement) btnElement.classList.add(isCorrect ? "correct" : "incorrect");

    if (isCorrect) {
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        const _g = document.getElementById('gsbGauge');
        if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(10, 'correct');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();

        // Reset wrong-attempt tracking — they got it right
        resetAttemptTracking();

        // Streak and surprise bonuses
        checkStreakBonus();
        checkSurpriseBonus();

        if (state.gameMode === "boss") {
            const pushbackAmount = 15;
            state.monsterPos = Math.max(0, state.monsterPos - pushbackAmount);
            updateBossVisuals();
        }
        if (state.gameMode === "race") {
            const playerSpeed = getPlayerRaceSpeed();
            state.racePos = Math.min(100, state.racePos + playerSpeed);
            updateRaceVisuals();
        }

        // Update goal progress display
        updateGoalProgress();

        // Check if problem goals are met (Mixed Mode)
        if (checkProblemGoals()) {
            return; // Game ended due to goal reached
        }

        // Auto-advance with green flash + slide transition
        if (shouldShowNextButton()) {
            setTimeout(() => {
                transitionToNextQuestion();
            }, 750);
        }
    } else {
        // Wrong answer — keep problem on screen, cross out the wrong choice,
        // show Skip after the 2nd wrong attempt.
        state.sessionStreak = 0;
        state.lastStreakBonus = 0;
        awardXP(2, 'attempt');

        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            // Brief red flash, then return to neutral so student can keep trying
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }

        const answerInput = document.getElementById("answerInput");
        const isMC = (q.options && q.options.length > 0);

        // Track this wrong attempt + cross out the wrong choice (or chip)
        recordWrongAttempt({
            submitted: userAns,
            btnElement: isMC ? btnElement : null,
            showHistoryChip: !isMC,
        });

        // Reset the input so student can try again immediately
        if (answerInput) {
            answerInput.value = "";
            answerInput.style.borderColor = "";
            answerInput.style.background = "";
            answerInput.disabled = false;
            setTimeout(() => answerInput.focus(), 50);
        }

        // Record attempt but do NOT advance
        trackSkillAnswer(false);
        const logSkill = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTime = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkill, false, logTime);

        // Update game stats banner
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Badge triggers
        checkBadgeTriggers('answer', { isCorrect: false });

        // Allow another submission immediately
        state.hasAnswered = false;
        return;
    }

    // Badge triggers
    checkBadgeTriggers('answer', { isCorrect });

    // Update game stats banner
    if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
        window.bannerRecordAnswer(isCorrect);
    }

    state.hasAnswered = true;

    // Record to practice log and session skill tracking
    trackSkillAnswer(isCorrect);
    const logSkill = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
    const logTime = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
    recordPracticeLog(logSkill, isCorrect, logTime);
}

// Count the digits the student needs to type for a numeric answer
function expectedDigitCount(ans) {
    const s = String(ans);
    // Count only digit characters (ignore minus, decimal point, commas)
    return s.replace(/[^0-9]/g, '').length;
}

// Auto-check as student types — fires when digit count matches expected answer length
export function autoCheckOnInput() {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q) return;

    const input = document.getElementById("answerInput");
    if (!input) return;
    const userAns = input.value.trim();
    if (!userAns) return;

    const type = q.answerType || (typeof q.ans === "number" ? "number" : "text");

    if (type === "number") {
        // Count digits in user input (ignore minus, decimal, commas, spaces)
        const userDigits = userAns.replace(/[^0-9]/g, '').length;
        const targetDigits = expectedDigitCount(q.ans);

        // Auto-submit when digit count matches (right or wrong)
        if (userDigits >= targetDigits && targetDigits > 0) {
            checkAnswer(userAns);
            return;
        }
    } else if (type === "text") {
        // For text answers, auto-check on exact match only (existing behavior)
        if (isTimeSkill(state.skill)) {
            if (timeAnswersMatch(userAns, q.ans, state.skill)) {
                checkAnswer(userAns);
                return;
            }
        } else if (normalizeText(userAns) === normalizeText(q.ans)) {
            checkAnswer(userAns);
            return;
        }
    }
}

export function submitAnswer() {
    const q = state.currentQ;

    // multi-select-check submits via its own in-widget Submit button.
    // The global Submit shortcut/button is a no-op for these items.
    if (q.answerType === "multi-select-check") {
        return;
    }

    // ten-frame submits via its own in-widget Submit button.
    if (q.answerType === "ten-frame") {
        return;
    }

    // dnd-generic submits via its own in-widget Submit button.
    if (q.answerType === "dnd-generic") {
        return;
    }

    // hot-spot submits via its own in-widget Submit button.
    if (q.answerType === "hot-spot") {
        return;
    }

    // numpad-input submits via its own in-widget Submit button.
    if (q.answerType === "numpad-input") {
        return;
    }

    // number-line-extended submits via its own in-widget Submit button.
    if (q.answerType === "number-line-extended") {
        return;
    }

    // clock-set submits via its own in-widget Submit button.
    if (q.answerType === "clock-set") {
        return;
    }

    // Handle different answer types
    if (q.answerType === "dual-fraction") {
        // Dual fraction answer (mixed number + improper fraction)
        checkDualFractionAnswer();
        return;
    } else if (q.answerType === "dual") {
        // Dual answer (perimeter + area)
        const perimeterInput = document.getElementById("perimeterInput");
        const areaInput = document.getElementById("areaInput");
        if (!perimeterInput || !areaInput) return;

        const userPerimeter = parseFloat(perimeterInput.value);
        const userArea = parseFloat(areaInput.value);

        if (isNaN(userPerimeter) || isNaN(userArea)) {
            const feedback = document.getElementById("feedbackArea");
            feedback.style.display = "block";
            feedback.className = "feedback-area hint";
            feedback.innerHTML = "Please enter both perimeter and area!";
            return;
        }

        checkDualAnswer(userPerimeter, userArea);
    } else if (q.answerType === "word_problem" || q.answerType === "scaffolded_word") {
        // Word problem answer
        const answerInput = document.getElementById("wordProblemAnswer");
        if (!answerInput || !answerInput.value.trim()) {
            const feedback = document.getElementById("feedbackArea");
            feedback.style.display = "block";
            feedback.className = "feedback-area hint";
            feedback.innerHTML = "Please enter your answer!";
            return;
        }
        checkWordProblemAnswer(answerInput.value);
    } else {
        // Standard single answer
        const input = document.getElementById("answerInput").value;
        if (!input) return;
        checkAnswer(input);
    }
}

// Check dual answer (perimeter + area)
export function checkDualAnswer(userPerimeter, userArea) {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    
    const correctPerimeter = q.dualAnswers.perimeter;
    const correctArea = q.dualAnswers.area;
    
    const perimeterCorrect = Math.abs(userPerimeter - correctPerimeter) < 0.01;
    const areaCorrect = Math.abs(userArea - correctArea) < 0.01;
    const isCorrect = perimeterCorrect && areaCorrect;

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById("feedbackArea");
            if (fb) {
                fb.style.display = "block";
                fb.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
                fb.innerHTML = isCorrect
                    ? `🎉 Correct!`
                    : `❌ Not quite — try again!`;
            }
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                recordWrongAttempt({
                    submitted: `${userPerimeter}/${userArea}`,
                    btnElement: null,
                    showHistoryChip: false,
                });
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent feedback, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    // Update input field styling
    const perimeterInput = document.getElementById("perimeterInput");
    const areaInput = document.getElementById("areaInput");

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        if (perimeterInput) perimeterInput.classList.add("correct");
        if (areaInput) areaInput.classList.add("correct");

        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Both correct! Perimeter = ${correctPerimeter}, Area = ${correctArea}`;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(15, 'correct_dual');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        resetAttemptTracking();
        checkStreakBonus();
        checkSurpriseBonus();

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 750);
        }

        state.hasAnswered = true;

        // Record to practice log and session skill tracking
        trackSkillAnswer(true);
        const logSkillD = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeD = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillD, true, logTimeD);

        // Update game stats banner (dual)
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        // Show solution button
        const solutionBtn = document.getElementById("solutionBtn");
        if (solutionBtn) solutionBtn.style.display = "inline-block";
    } else {
        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }
        feedback.className = "feedback-area incorrect";
        // Tell them which parts are wrong but don't reveal the answer
        let msg = "❌ ";
        if (!perimeterCorrect && !areaCorrect) {
            msg += "Both answers are incorrect. Try again!";
        } else if (!perimeterCorrect) {
            msg += "Perimeter is incorrect. Try again!";
        } else {
            msg += "Area is incorrect. Try again!";
        }
        feedback.innerHTML = msg;

        if (perimeterInput) {
            perimeterInput.classList.add(perimeterCorrect ? "correct" : "incorrect");
        }
        if (areaInput) {
            areaInput.classList.add(areaCorrect ? "correct" : "incorrect");
        }

        // Track wrong attempt + show Skip after 2nd wrong
        recordWrongAttempt({
            submitted: `P=${userPerimeter},A=${userArea}`,
            btnElement: null,
            showHistoryChip: false,
        });

        // Record attempt
        trackSkillAnswer(false);
        const logSkillD2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeD2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillD2, false, logTimeD2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Allow another submission immediately. Clear only the wrong fields.
        if (perimeterInput && !perimeterCorrect) perimeterInput.value = "";
        if (areaInput && !areaCorrect) areaInput.value = "";
        state.hasAnswered = false;
    }
}

// Normalize a fraction answer string for comparison
function normalizeFracAnswer(str) {
    if (!str) return '';
    return str.toString().trim().replace(/\s+/g, ' ').toLowerCase();
}

// Check dual-fraction answer (mixed number + improper fraction)
export function checkDualFractionAnswer() {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    if (!q.dualFractionAnswers) return;

    const mixedInput = document.getElementById("mixedInput");
    const improperInput = document.getElementById("improperInput");
    if (!mixedInput || !improperInput) return;

    const userMixed = mixedInput.value.trim();
    const userImproper = improperInput.value.trim();

    if (!userMixed || !userImproper) {
        const feedback = document.getElementById("feedbackArea");
        feedback.style.display = "block";
        feedback.className = "feedback-area hint";
        feedback.innerHTML = "Please enter both the mixed number and improper fraction!";
        return;
    }

    const correctMixed = q.dualFractionAnswers.mixed;
    const correctImproper = q.dualFractionAnswers.improper;

    const mixedCorrect = normalizeFracAnswer(userMixed) === normalizeFracAnswer(correctMixed);
    const improperCorrect = normalizeFracAnswer(userImproper) === normalizeFracAnswer(correctImproper);
    const isCorrect = mixedCorrect && improperCorrect;

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById("feedbackArea");
            if (fb) {
                fb.style.display = "block";
                fb.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
                fb.innerHTML = isCorrect
                    ? `🎉 Correct!`
                    : `❌ Not quite — try again!`;
            }
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                recordWrongAttempt({
                    submitted: `${userMixed}/${userImproper}`,
                    btnElement: null,
                    showHistoryChip: false,
                });
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        // Style inputs as correct
        if (mixedInput) {
            mixedInput.style.borderColor = "var(--correct)";
            mixedInput.style.background = "rgba(6,214,160,0.15)";
        }
        if (improperInput) {
            improperInput.style.borderColor = "var(--correct)";
            improperInput.style.background = "rgba(6,214,160,0.15)";
        }

        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Both correct! Mixed: ${correctMixed} = Improper: ${correctImproper}`;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(15, 'correct_dual_fraction');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        resetAttemptTracking();
        checkStreakBonus();
        checkSurpriseBonus();

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 750);
        }

        state.hasAnswered = true;

        // Record to practice log and session skill tracking
        trackSkillAnswer(true);
        const logSkillDF = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeDF = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillDF, true, logTimeDF);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        // Show solution button
        const solutionBtn = document.getElementById("solutionBtn");
        if (solutionBtn) solutionBtn.style.display = "inline-block";
    } else {
        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }
        feedback.className = "feedback-area incorrect";
        // Tell them which parts are wrong but don't reveal the answer
        let msg = "❌ ";
        if (!mixedCorrect && !improperCorrect) {
            msg += "Both answers are incorrect. Try again!";
        } else if (!mixedCorrect) {
            msg += "Mixed number is incorrect. Try again!";
        } else {
            msg += "Improper fraction is incorrect. Try again!";
        }
        feedback.innerHTML = msg;
        awardXP(2, 'attempt');

        // Style inputs to show which are wrong
        if (mixedInput) {
            mixedInput.style.borderColor = mixedCorrect ? "var(--correct)" : "var(--incorrect)";
            mixedInput.style.background = mixedCorrect ? "rgba(6,214,160,0.15)" : "rgba(239,71,111,0.15)";
        }
        if (improperInput) {
            improperInput.style.borderColor = improperCorrect ? "var(--correct)" : "var(--incorrect)";
            improperInput.style.background = improperCorrect ? "rgba(6,214,160,0.15)" : "rgba(239,71,111,0.15)";
        }

        // Track wrong attempt + show Skip after 2nd wrong
        recordWrongAttempt({
            submitted: `M=${userMixed},I=${userImproper}`,
            btnElement: null,
            showHistoryChip: false,
        });

        // Record attempt
        trackSkillAnswer(false);
        const logSkillDF2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeDF2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillDF2, false, logTimeDF2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Allow another submission immediately. Clear only the wrong fields.
        if (mixedInput && !mixedCorrect) mixedInput.value = "";
        if (improperInput && !improperCorrect) improperInput.value = "";
        state.hasAnswered = false;
    }
}

// Check word problem answer
export function checkWordProblemAnswer(userAnswer) {
    if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
    if (state.hasAnswered) return;
    const q = state.currentQ;
    
    // Extract number from user answer
    const numMatch = userAnswer.match(/[\d,]+\.?\d*/);
    const userNum = numMatch ? parseFloat(numMatch[0].replace(/,/g, '')) : NaN;
    
    const isCorrect = !isNaN(userNum) && Math.abs(userNum - q.ans) < 0.01;

    // ===== MAP MODE BRANCH =====
    if (state.mapMode === true) {
        state.lastAnswerCorrect = isCorrect;
        if (state.mapSessionMode === 'practice') {
            const fb = document.getElementById("feedbackArea");
            if (fb) {
                fb.style.display = "block";
                fb.className = `feedback-area ${isCorrect ? "correct" : "incorrect"}`;
                fb.innerHTML = isCorrect
                    ? `🎉 Correct!`
                    : `❌ Not quite — try again!`;
            }
            if (isCorrect) {
                state.hasAnswered = true;
                resetAttemptTracking();
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: true });
                }
            } else {
                recordWrongAttempt({
                    submitted: userAnswer,
                    btnElement: null,
                    showHistoryChip: true,
                });
                const wpInput = document.getElementById("wordProblemAnswer");
                if (wpInput) {
                    wpInput.value = "";
                    setTimeout(() => wpInput.focus(), 50);
                }
                state.hasAnswered = false;
            }
            return;
        }
        // Simulation: silent, advance regardless
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: isCorrect });
        }
        return;
    }

    // Check if user selected correct type (area vs perimeter)
    const selectedType = document.querySelector('input[name="problemType"]:checked');
    const typeCorrect = !selectedType || selectedType.value === q.expectedType;

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    
    const answerInput = document.getElementById("wordProblemAnswer");
    
    if (isCorrect) {
        feedback.className = "feedback-area correct";
        feedback.innerHTML = `🎉 Correct! ${q.ans} ${q.expectedUnit}`;
        if (answerInput) {
            answerInput.style.borderColor = "var(--accent-green)";
            answerInput.style.background = "rgba(76, 175, 80, 0.15)";
        }
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        state.isIdlePaused = false;
        state.gameTimerPaused = false;
        { const _g = document.getElementById('gsbGauge'); if (_g) { _g.classList.remove('gsb-paused', 'gsb-alert'); } }
        { const _td = document.getElementById('timerDisplay'); if (_td) _td.classList.remove('timer-paused'); }
        awardXP(12, 'correct_word');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        resetAttemptTracking();
        checkStreakBonus();
        checkSurpriseBonus();

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 750);
        }

        state.hasAnswered = true;

        // Update game stats banner (word problem)
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }

        // Record to practice log and session skill tracking
        trackSkillAnswer(true);
        const logSkillWP = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeWP = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillWP, true, logTimeWP);

        // Show solution button
        const solutionBtn = document.getElementById("solutionBtn");
        if (solutionBtn) solutionBtn.style.display = "inline-block";
    } else {
        const card = document.getElementById("questionCard");
        if (card) {
            card.classList.add("incorrect-bg");
            setTimeout(() => card.classList.remove("incorrect-bg"), 700);
        }
        feedback.className = "feedback-area incorrect";
        // Don't reveal the answer — tell student to try again
        feedback.innerHTML = "❌ That's not correct. Try again!";

        if (answerInput) {
            answerInput.style.borderColor = "var(--accent-red)";
            answerInput.style.background = "rgba(244, 67, 54, 0.15)";
        }

        // Track wrong attempt + show Skip after 2nd wrong
        recordWrongAttempt({
            submitted: userAnswer,
            btnElement: null,
            showHistoryChip: true,
        });

        // Record attempt
        trackSkillAnswer(false);
        const logSkillWP2 = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
        const logTimeWP2 = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
        recordPracticeLog(logSkillWP2, false, logTimeWP2);

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }

        // Allow another submission immediately
        if (answerInput) {
            answerInput.value = "";
            answerInput.style.borderColor = "";
            answerInput.style.background = "";
            setTimeout(() => answerInput.focus(), 50);
        }
        state.hasAnswered = false;
    }
}

