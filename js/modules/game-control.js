import { state } from './state.js';
import { SKILLS, DOMAINS, CALCULATOR_SKILLS } from './data.js';

let _fullscreenHandler = null;

export function promptFullscreen() {
    // Only in student mode, only if not already fullscreen
    if (!document.body.classList.contains('student-mode')) return;
    if (document.fullscreenElement) return;

    state.fullscreenPromptShown = false;
    state.fullscreenExitToastShown = false;

    // Auto-enter fullscreen without prompting
    document.documentElement.requestFullscreen().then(() => {
        state.isFullscreen = true;
    }).catch(() => {
        // Browser blocked it — that's fine
    });

    setupFullscreenDetection();
}

export function acceptFullscreen() {
    const overlay = document.getElementById('fullscreenPrompt');
    if (overlay) overlay.remove();

    document.documentElement.requestFullscreen().then(() => {
        state.isFullscreen = true;
    }).catch(() => {
        // Browser blocked it — that's fine
    });

    setupFullscreenDetection();
}

export function declineFullscreen() {
    const overlay = document.getElementById('fullscreenPrompt');
    if (overlay) overlay.remove();
    state.fullscreenPromptShown = true;
    setupFullscreenDetection();
}

export function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
        state.isFullscreen = false;
    } else {
        document.documentElement.requestFullscreen().then(() => {
            state.isFullscreen = true;
        }).catch(() => {});
    }
}

export function setupFullscreenDetection() {
    if (_fullscreenHandler) return;
    _fullscreenHandler = () => {
        const wasFullscreen = state.isFullscreen;
        state.isFullscreen = !!document.fullscreenElement;

        // Update toggle button icon
        const btn = document.getElementById('fullscreenToggleBtn');
        if (btn) btn.textContent = state.isFullscreen ? '⛶' : '⛶';

        // If exited fullscreen during game, show one gentle toast
        if (wasFullscreen && !state.isFullscreen && !state.fullscreenExitToastShown) {
            state.fullscreenExitToastShown = true;
            if (typeof window.showToast === 'function') {
                window.showToast('Fullscreen helps you focus! 🎯', 'info');
            }
        }
    };
    document.addEventListener('fullscreenchange', _fullscreenHandler);
}

export function removeFullscreenDetection() {
    if (_fullscreenHandler) {
        document.removeEventListener('fullscreenchange', _fullscreenHandler);
        _fullscreenHandler = null;
    }
    // Exit fullscreen if still active
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
    }
    state.isFullscreen = false;
    state.fullscreenPromptShown = false;
    state.fullscreenExitToastShown = false;
    // Remove prompt if still showing
    const prompt = document.getElementById('fullscreenPrompt');
    if (prompt) prompt.remove();
}

export function shouldShowNextButton() {
    return ["practice", "boss", "race"].includes(state.gameMode);
}

// ===== Per-question status tracking + dot row =====
// Records the outcome of the question that JUST finished (1-indexed by qCount).
// status: 'correct' | 'incorrect' | 'skipped'
// Used by the dot row above #questionCard AND for end-of-game stats.
//
// Stored shape (NEW): each entry is an object
//   { status, q, userAnswer, correct, timestamp }
// so back-navigation can re-load the exact prior question + answer.
// Legacy string entries from older sessions still render correctly.
//
// When the student is reviewing a past question (state._reviewingQIndex >= 0),
// updates THAT index instead of (qCount - 1). Score is then recomputed from
// history rather than incremented (see recomputeScoreFromHistory).
export function recordQuestionStatus(status, opts) {
    if (!Array.isArray(state.questionHistory)) state.questionHistory = [];
    const reviewing = (typeof state._reviewingQIndex === 'number') ? state._reviewingQIndex : -1;
    const idx = reviewing >= 0
        ? reviewing
        : Math.max(0, (state.qCount || 1) - 1);
    const prev = state.questionHistory[idx];
    const prevStatus = typeof prev === 'string' ? prev : (prev && prev.status);
    const wasSkipped = prevStatus === 'skipped';
    const prevWasWrong = (prev && typeof prev === 'object' && prev.wasWrong === true);
    // Auto-pull the live answer text from the input field if no opts passed.
    let autoUA;
    try {
        const ai = document.getElementById('answerInput');
        if (ai && typeof ai.value === 'string' && ai.value.length) autoUA = ai.value;
    } catch (_) { /* non-fatal */ }
    const entry = {
        status,
        q: (opts && opts.q !== undefined) ? opts.q : (state.currentQ || (prev && prev.q) || null),
        userAnswer: (opts && 'userAnswer' in opts)
            ? opts.userAnswer
            : (autoUA != null ? autoUA : (prev && prev.userAnswer)),
        correct: status === 'correct',
        timestamp: Date.now(),
    };
    // Track wrong-then-right: once a question has been wrong (initially OR via
    // a redo attempt), the flag persists. A later 'correct' status keeps the
    // flag so the dot renders LIGHT green instead of full green.
    if (status === 'incorrect' || prevStatus === 'incorrect' || prevWasWrong) {
        entry.wasWrong = true;
    }
    state.questionHistory[idx] = entry;
    // Reset the "last action was a skip" flag once a real answer (correct or
    // incorrect) is recorded so the alternating-skip rule advances properly.
    if (status === 'correct' || status === 'incorrect') {
        state.lastActionWasSkip = false;
    }
    // Skipped count: increment ONLY on first-time skip (not re-skip via review).
    if (status === 'skipped' && !wasSkipped) {
        state.skippedCount = (state.skippedCount || 0) + 1;
    } else if (status !== 'skipped' && wasSkipped) {
        // A previously-skipped question is now answered — decrement.
        state.skippedCount = Math.max(0, (state.skippedCount || 0) - 1);
    }
    renderQuestionDots();
}

// Recompute state.score = number of 'correct' entries in history.
// Called after a re-answer on a previously-answered question so the score
// reflects the latest outcome at every index instead of double-counting.
export function recomputeScoreFromHistory() {
    if (!Array.isArray(state.questionHistory)) { state.score = 0; return 0; }
    let n = 0;
    for (const h of state.questionHistory) {
        const s = (typeof h === 'string') ? h : (h && h.status);
        if (s === 'correct') n++;
    }
    state.score = n;
    const gs = document.getElementById('gameScore');
    if (gs) gs.innerText = `${state.score} Correct`;
    return n;
}

// Pull just the status string from a history entry (object or legacy string).
function _entryStatus(entry) {
    if (!entry) return null;
    return (typeof entry === 'string') ? entry : entry.status;
}

// Answer types the back-navigation re-answer flow CANNOT handle.
// Empty by default — every type renders fresh from the snapshot's q payload
// and re-evaluates via either the standard checkAnswer/submitAnswer review
// branch OR the per-widget review hook (_applyReviewOutcome in answer-check).
// Complex widgets render fresh; the student re-enters their answer (the
// prior text-input pre-fill below only applies to single #answerInput types).
// Add an answer type here if its widget genuinely cannot be re-rendered
// safely from the q snapshot (none currently identified).
const _NON_REPLAYABLE_ANSWER_TYPES = new Set([]);
function _isReplayable(q) {
    if (!q) return false;
    const t = q.answerType || (typeof q.ans === 'number' ? 'number' : 'text');
    return !_NON_REPLAYABLE_ANSWER_TYPES.has(t);
}

// Jump back to a previously-answered question to view + re-answer.
// Practice / Boss / Race ONLY. (MAP modes use mapJumpToItem in map-engine.js.)
//   - index must be < qCount (i.e. an already-answered question)
//   - snapshots the live currentQ + answered flags so resumeLiveQuestion()
//     can restore them.
//   - re-renders the historical question and pre-populates the input with
//     the student's prior answer.
export function goToQuestionIndex(index) {
    if (typeof index !== 'number' || index < 0) return;
    // Practice/Boss/Race only — MAP has its own navigator.
    if (!['practice', 'boss', 'race'].includes(state.gameMode)) return;
    if (state.mapMode === true) return;
    const total = (state.questionHistory || []).length;
    // Can only jump to an entry that exists.
    if (index >= total) return;
    const entry = state.questionHistory[index];
    if (!entry || typeof entry === 'string' || !entry.q) {
        // Legacy / no question payload stored — can't replay.
        return;
    }
    // Skip dots whose question type isn't safely re-renderable.
    if (!_isReplayable(entry.q)) return;
    // If we were on the LIVE current question, snapshot it for later restore.
    if ((state._reviewingQIndex == null || state._reviewingQIndex < 0)) {
        state._liveQSnapshot = {
            currentQ: state.currentQ,
            hasAnswered: state.hasAnswered,
            lastAnswerCorrect: state.lastAnswerCorrect,
            qCount: state.qCount,
        };
    }
    state._reviewingQIndex = index;
    state.currentQ = entry.q;
    // Allow re-answer (will be re-locked in submitAnswer for MAP test, etc.).
    state.hasAnswered = false;
    state.lastAnswerCorrect = false;
    // Reset wrong-attempt UI from any prior in-flight question.
    if (typeof window.resetAttemptTracking === 'function') {
        try { window.resetAttemptTracking(); } catch (_) { /* non-fatal */ }
    }
    // Re-render the historical question.
    if (typeof window.renderQuestion === 'function') {
        window.renderQuestion();
    }
    // Pre-fill works for simple input types (number / text / MC / fraction-input).
    // Complex widgets (factor-pairs, dnd-generic, tchart, vocab-match, area-model,
    // hot-spot, etc.) render fresh; student re-enters their answer.
    //
    // For wrong / skipped questions, leave the field BLANK so the student gets
    // a clean redo (the prior wrong answer is on the dot's red flag, not in
    // the input). For correct entries (pure review), prefill what they had.
    setTimeout(() => {
        try {
            const ai = document.getElementById('answerInput');
            if (!ai) return;
            if (entry.status === 'correct'
                && entry.userAnswer != null
                && entry.userAnswer !== '') {
                ai.value = String(entry.userAnswer);
            } else {
                ai.value = '';
                ai.focus();
            }
        } catch (_) { /* non-fatal */ }
    }, 30);
    // Show the review banner with a Resume button.
    showReviewBanner();
    renderQuestionDots();
}

// Resume the live question that the student snapshot'ed when they jumped back.
export function resumeLiveQuestion() {
    if (state._reviewingQIndex == null || state._reviewingQIndex < 0) return;
    state._reviewingQIndex = -1;
    hideReviewBanner();
    if (state._liveQSnapshot) {
        state.currentQ = state._liveQSnapshot.currentQ;
        state.hasAnswered = state._liveQSnapshot.hasAnswered;
        state.lastAnswerCorrect = state._liveQSnapshot.lastAnswerCorrect;
        // qCount does NOT need restoration — it was never modified by jumping.
        state._liveQSnapshot = null;
        if (typeof window.renderQuestion === 'function') {
            window.renderQuestion();
        }
    }
    renderQuestionDots();
}

// Show / hide the "Redo this question" banner above the question card.
// The banner makes it explicit that the student SHOULD answer the question
// below to redo it. The "skip back" button is the secondary escape hatch
// for students who clicked a dot by accident.
function showReviewBanner() {
    const card = document.getElementById('questionCard');
    if (!card || !card.parentElement) return;
    const reviewIdx = (typeof state._reviewingQIndex === 'number' && state._reviewingQIndex >= 0)
        ? state._reviewingQIndex + 1
        : null;
    const qNum = reviewIdx ? `Question ${reviewIdx}` : 'this question';
    let banner = document.getElementById('practiceReviewBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'practiceReviewBanner';
        banner.className = 'practice-review-banner';
        card.parentElement.insertBefore(banner, card);
    }
    banner.innerHTML =
        `<strong>↩ Redo ${qNum}</strong> &mdash; type your new answer below and press Check. ` +
        `<button type="button" class="review-back-btn" onclick="window.resumeLiveQuestion()">Skip back to current</button>`;
    banner.style.display = 'block';
}

function hideReviewBanner() {
    const banner = document.getElementById('practiceReviewBanner');
    if (banner) banner.style.display = 'none';
}

export function renderQuestionDots() {
    const row = document.getElementById('qDotsRow');
    if (!row) return;
    // Only render in practice/boss/race game modes (not worksheet, not MAP —
    // MAP has its own #mapNavDots, worksheet shows all problems at once).
    if (!['practice', 'boss', 'race'].includes(state.gameMode)) {
        row.innerHTML = '';
        return;
    }
    // Determine total dots to render. Use problemCount for fixed-length games;
    // otherwise grow with the answered + current count.
    const answered = (state.questionHistory || []).length;
    const current = state.qCount || 0;
    const fixed = state.problemCount > 0 ? state.problemCount : 0;
    const total = fixed > 0 ? fixed : Math.max(answered, current);
    if (total <= 0) { row.innerHTML = ''; return; }
    const reviewing = (typeof state._reviewingQIndex === 'number') ? state._reviewingQIndex : -1;
    let html = '';
    for (let i = 0; i < total; i++) {
        const entry = state.questionHistory[i];
        const status = _entryStatus(entry);
        let cls = 'q-dot';
        // current dot is the one being answered right now (qCount-1 zero-indexed)
        // OR the index the student is reviewing.
        const isCurrent = reviewing >= 0
            ? (i === reviewing)
            : ((i === (current - 1)) && !status);
        const wasWrong = entry && typeof entry === 'object' && entry.wasWrong === true;
        if (status === 'correct' && wasWrong) cls += ' wrong-then-right';
        else if (status === 'correct') cls += ' correct';
        else if (status === 'incorrect') cls += ' incorrect';
        else if (status === 'skipped') cls += ' skipped';
        else cls += ' unanswered';
        if (isCurrent) cls += ' current';
        // Clickable when this index has an answered entry with a stored
        // question payload AND the question type is safely replayable
        // (standard text/number/MC; not complex interactive widgets).
        const canJump = entry && typeof entry === 'object' && entry.q && _isReplayable(entry.q);
        if (canJump) {
            cls += ' clickable';
            html += `<button type="button" class="${cls}" title="Q${i + 1} — click to review/edit" onclick="window.goToQuestionIndex(${i})"></button>`;
        } else {
            html += `<span class="${cls}" title="Q${i + 1}"></span>`;
        }
    }
    row.innerHTML = html;
}

// Universal "Skip" handler — invoked by the ⏭ Skip button next to Hint/Read.
// Returns silently if no current question or if the question was already
// answered correctly (which would auto-advance anyway).
// Works for ALL answer types and all game modes (practice/boss/race/MAP).
//   - Records the current question as 'skipped' (NOT correct, NOT wrong).
//   - Updates the dot row to BLUE for the skipped index.
//   - Does NOT touch sessionStreak, skill streak, XP, or banner counters.
//   - Worksheet mode: handled separately (per-card Skip button in worksheet.js).
//   - MAP mode: routes to skipMapItem (which records as skipped — see map-engine.js).
export function skipCurrentQuestion() {
    // No active question? Nothing to skip.
    if (!state.currentQ) return;
    // Already answered correctly — let the auto-advance fire instead.
    if (state.lastAnswerCorrect && state.hasAnswered) return;

    // Worksheet mode uses per-card Skip; the button shouldn't even be visible
    // there, but defensively no-op.
    if (state.gameMode === 'worksheet') return;

    // MAP mode (practice OR simulation): hand off to the MAP skip path which
    // records as skipped without mutating RIT/streak.
    if (state.mapMode === true) {
        if (typeof window.skipMapItem === 'function') {
            window.skipMapItem();
        }
        return;
    }

    // Skip rationing (practice/boss/race): the first 3 skips are free; after
    // that, the student must answer at least one question between consecutive
    // skips (i.e. every other question can be skipped). Resets each session.
    const totalSkipsBefore = state.totalSkipsEver || 0;
    const lastWasSkip = !!state.lastActionWasSkip;
    if (totalSkipsBefore >= 3 && lastWasSkip) {
        if (typeof window.showToast === 'function') {
            window.showToast('You\'ve used your free skips — answer this one before skipping again.');
        } else if (typeof window.showModal === 'function') {
            window.showModal('You\'ve used your 3 free skips. Answer this question, then you can skip every other one.');
        }
        return;
    }
    state.totalSkipsEver = totalSkipsBefore + 1;
    state.lastActionWasSkip = true;

    // Standard practice/boss/race: mark as skipped, advance.
    recordQuestionStatus('skipped');
    state.hasAnswered = true;
    state.lastAnswerCorrect = true;  // bypass the nextQuestion guard
    state.totalProblemsThisSession = (state.totalProblemsThisSession || 0);
    // Reset any wrong-attempt tracking from the wrong-answer pipeline so the
    // next question starts clean (cross-outs, attempt chips, #skipBtn, etc.).
    if (typeof window.resetAttemptTracking === 'function') {
        try { window.resetAttemptTracking(); } catch (_) { /* non-fatal */ }
    }
    // Slide to next question (uses transitionToNextQuestion when available).
    if (typeof window.transitionToNextQuestion === 'function') {
        window.transitionToNextQuestion();
    } else {
        nextQuestion();
    }
}

export function showNextButton() {
    if (shouldShowNextButton()) {
        document.getElementById("nextBtnContainer").style.display = "flex";
    }
}

export function hideNextButton() {
    document.getElementById("nextBtnContainer").style.display = "none";
}

export function startGame() {
    // If skills are in queue, use queue instead of dropdowns (both student and teacher modes)
    const isStudentMode = document.body.classList.contains('student-mode');
    if (window.skillQueue.length > 0 && !state.isMixedMode) {
        // Automatically use the skill queue with the SELECTED game mode
        playSelectedSkills(state.gameMode || 'practice');
        return;
    }

    // In student mode with empty queue, prompt to select skills
    if (isStudentMode && window.skillQueue.length === 0 && !state.isMixedMode) {
        showModal("📚 Click on the Quick Skills above or use the search bar to choose what you want to practice, then click Start Game!");
        return;
    }
    
    // If mixed mode settings are active, preserve settings from state
    // (because the dropdown doesn't have 'all_mixed' as an option)
    const isCustomMixed = state.mixedModeSettings &&
                          state.category === 'all_mixed' &&
                          state.skill === 'custom_mixed';

    // Get elements with null checks
    const rangeSelectEl = document.getElementById("rangeSelect");
    const decimalSelectEl = document.getElementById("decimalSelect");
    const categorySelectEl = document.getElementById("categorySelect");
    const skillSelectEl = document.getElementById("skillSelect");

    if (isCustomMixed) {
        // Use settings from mixedModeSettings instead of dropdowns
        state.range = state.mixedModeSettings.range || parseInt(rangeSelectEl?.value || '100', 10);
        state.decimalPlaces = state.mixedModeSettings.decimalPlaces !== undefined ?
            state.mixedModeSettings.decimalPlaces : parseInt(decimalSelectEl?.value || '0', 10);
    } else {
        const categoryValue = categorySelectEl?.value;
        const skillValue = skillSelectEl?.value;

        // Validate that category and skill are selected
        if (!categoryValue || categoryValue === "" || !skillValue || skillValue === "") {
            showModal("⚠️ Please choose a category and skill before starting the game!");
            return;
        }

        state.category = categoryValue;
        state.skill = skillValue;
        state.range = parseInt(rangeSelectEl?.value || '100', 10);
        state.decimalPlaces = parseInt(decimalSelectEl?.value || '0', 10);
    }

    // Debug: Log the current state values
    console.log("Starting game with:", {
        category: state.category,
        skill: state.skill,
        range: state.range
    });

    // Check if mixed mode settings override timer
    if (state.mixedModeSettings && state.mixedModeSettings.timeChoice === 'teacher' && state.mixedModeSettings.timer !== null) {
        state.timerDuration = state.mixedModeSettings.timer;
    } else {
        state.timerDuration = parseInt(document.getElementById("timerSelect").value, 10);
    }

    // Get problem count — use mixed mode settings if set, otherwise read dropdown
    if (state.mixedModeSettings && state.mixedModeSettings.totalProblemsEnabled && state.mixedModeSettings.totalProblems) {
        state.problemCount = state.mixedModeSettings.totalProblems;
    } else if (state.infinityMode) {
        // Infinity mode: don't overwrite from dropdown
    } else {
        state.problemCount = parseInt(document.getElementById("problemCountSelect")?.value || "20", 10);
    }

    // Set session start time for duration tracking
    state.sessionStartTime = new Date();

    // Initialize session tracking state (shared by all game modes including worksheet)
    state.qCount = 0;
    state.score = 0;
    state.skippedCount = 0;
    state.totalSkipsEver = 0;
    state.lastActionWasSkip = false;
    state.questionHistory = [];
    state._reviewingQIndex = -1;
    state._liveQSnapshot = null;
    // Hide any leftover review banner from a prior session.
    const _staleBanner = document.getElementById('practiceReviewBanner');
    if (_staleBanner) _staleBanner.style.display = 'none';
    state.hasAnswered = false;
    state.lastAnswerCorrect = false;
    state.currentQ = null;
    state.totalProblemsThisSession = 0;
    state.sessionStreak = 0;
    state.lastStreakBonus = 0;
    state.wrongThenRightTracking = { wrongCount: 0, recovering: false, rightCount: 0 };
    state._timerProgressShown = {};
    state.currentSessionSkills = {};

    // Start session timer
    if (typeof window !== 'undefined' && window.startSessionTimer) {
        window.startSessionTimer();
    }
    if (typeof window !== 'undefined' && window.initSurpriseSchedule) {
        window.initSurpriseSchedule();
    }
    // Start game stats banner timer
    if (typeof window !== 'undefined' && window.startBannerTimer) {
        window.startBannerTimer();
    }
    // Tab switch detection (student mode only)
    if (document.body.classList.contains('student-mode') && window.setupTabDetection) {
        window.setupTabDetection();
    }

    if (state.gameMode === "worksheet") {
        initWorksheet();
        // Fullscreen prompt (student mode only)
        if (document.body.classList.contains('student-mode')) {
            promptFullscreen();
        }
        return;
    }

    if (state.selectedNumbers.length === 0) state.selectedNumbers = [...DEFAULT_TABLES];

    state.heroPos = 70;
    state.monsterPos = 10;
    state.racePos = 0;
    state.cpuPos = 0;
    // Initialize infinity mode round tracking
    if (state.infinityMode) {
        state.roundStartTime = Date.now();
        state.roundNumber = 1;
    }
    hideNextButton();

    showView("gameView");
    document.getElementById("gameScore").innerText = "0 Correct";
    const catSelect = document.getElementById("categorySelect");
    document.getElementById("gameTopicDisplay").innerText =
        (catSelect && catSelect.selectedOptions[0]) ? catSelect.selectedOptions[0].text : (state.isMixedMode ? "Mixed Practice" : "Practice");

    // Show goal progress if enabled
    updateGoalProgress();

    document.getElementById("bossArena").style.display = state.gameMode === "boss" ? "block" : "none";
    document.getElementById("bossStatus").style.display = state.gameMode === "boss" ? "block" : "none";
    document.getElementById("raceTrack").style.display = state.gameMode === "race" ? "block" : "none";
    document.getElementById("raceStatus").style.display = state.gameMode === "race" ? "block" : "none";

    if (state.gameMode === "race") startRaceCPU();
    else if (state.cpuInterval) { clearInterval(state.cpuInterval); state.cpuInterval = null; }

    if (state.gameMode === "boss") startBossMonster();
    else if (state.bossInterval) { clearInterval(state.bossInterval); state.bossInterval = null; }

    if (state.timerDuration > 0) {
        state.timerRemaining = state.timerDuration;
        document.getElementById("timerContainer").style.display = "flex";
        startTimer();
    } else {
        document.getElementById("timerContainer").style.display = "none";
        if (state.timerInterval) clearInterval(state.timerInterval);
    }

    nextQuestion();

    // Fullscreen prompt (student mode only)
    if (document.body.classList.contains('student-mode')) {
        promptFullscreen();
    }
}

export function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.gameTimerPaused = false;
    updateTimerDisplay();
    state.timerInterval = setInterval(() => {
        // Skip countdown tick while paused (3+ wrong answers)
        if (state.gameTimerPaused) return;
        state.timerRemaining--;
        updateTimerDisplay();
        if (state.timerRemaining <= 0) {
            clearInterval(state.timerInterval);
            // For boss mode, if timer runs out and hero is still alive, they win
            if (state.gameMode === "boss" && state.monsterPos < state.heroPos - 5) {
                endGame(true, "You survived! The dinosaur gave up! 🎉");
            } else if (state.gameMode === "boss") {
                endGame(false, "The dinosaur caught you! 🦖");
            } else {
                endGame(false, "Time's up!");
            }
        }
    }, 1000);
}

// Pause the game countdown timer (called after 3 consecutive wrong answers)
export function pauseGameTimer() {
    state.gameTimerPaused = true;
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) timerDisplay.classList.add("timer-paused");
}

// Resume the game countdown timer (called on correct answer)
export function resumeGameTimer() {
    if (!state.gameTimerPaused) return;
    state.gameTimerPaused = false;
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) timerDisplay.classList.remove("timer-paused");
}

export function updateTimerDisplay() {
    const minutes = Math.floor(state.timerRemaining / 60);
    const seconds = state.timerRemaining % 60;
    const timerValue = document.getElementById("timerValue");
    if (timerValue) {
        timerValue.innerText = state.gameTimerPaused
            ? `${minutes}:${seconds < 10 ? "0" : ""}${seconds} ⏸`
            : `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    document.getElementById("timerDisplay").classList.toggle("large", state.timerRemaining <= 20);

    // Check timer progress milestones
    if (typeof window.checkTimerProgress === 'function') {
        window.checkTimerProgress();
    }
}

export function transitionToNextQuestion() {
    // Auto-dismiss any open hint popup so it doesn't linger over the next question.
    if (typeof window.closeHintPopup === 'function') {
        try { window.closeHintPopup(); } catch (_) { /* non-fatal */ }
    }
    const card = document.getElementById("questionCard");
    // Slide out current question
    card.classList.add("q-slide-out");
    setTimeout(() => {
        card.classList.remove("q-slide-out", "correct-bg", "incorrect-bg");
        nextQuestion();
        // Slide in new question
        card.classList.add("q-slide-in");
        setTimeout(() => {
            card.classList.remove("q-slide-in");
        }, 300);
    }, 300);
}

export function nextQuestion() {
    hideNextButton();
    // Belt-and-suspenders: also close any open hint popup here. transitionToNextQuestion
    // already calls this, but nextQuestion is invoked directly from many code paths
    // (skip, MAP advance, worksheet flows) where the hint should also clear.
    if (typeof window.closeHintPopup === 'function') {
        try { window.closeHintPopup(); } catch (_) { /* non-fatal */ }
    }
    if (!document.getElementById("gameView").classList.contains("active")) return;

    // If the student was REVIEWING a past question and the answer just got
    // accepted, snap back to the live current question instead of advancing
    // qCount past the end. Score has already been recomputed from history.
    if (typeof state._reviewingQIndex === 'number' && state._reviewingQIndex >= 0) {
        resumeLiveQuestion();
        return;
    }

    // Auto-mark unfinished INTERACTIVE COORDINATE problems wrong before
    // advancing. The student clicked Next without submitting → treat as
    // incorrect (counts against streak/XP) instead of silently skipping.
    // If the widget already reported an answer (state.hasAnswered), this
    // branch is a no-op — control flows through to the standard advance.
    if (state.currentQ
        && state.currentQ.answerType === "coord-plot"
        && !state.hasAnswered) {
        try {
            const host = document.getElementById('coordPlotHost');
            if (host && typeof host._cpForceSubmit === 'function' && !host._cpIsLocked()) {
                // Force the widget to evaluate whatever is placed (empty
                // → wrong). The onCoordPlotSubmit handler runs the standard
                // wrong-answer path: streak reset, XP=2, banner, practice
                // log, AND flips state.lastAnswerCorrect = true on wrong so
                // the next click of Next can advance. Returning here lets
                // the student see green/red feedback before re-clicking Next.
                host._cpForceSubmit();
                return;
            }
        } catch (_e) { /* fall through to default behavior */ }
    }

    // Auto-mark unfinished NL-DRAG (drag-onto-number-line) wrong before
    // advancing — same Next-without-Submit guard as coord-plot above.
    if (state.currentQ
        && state.currentQ.answerType === "nl-drag"
        && !state.hasAnswered) {
        try {
            const host = document.getElementById('nlDragHost');
            if (host && typeof host._nldForceSubmit === 'function' && !host._nldIsLocked()) {
                host._nldForceSubmit();
                return;
            }
        } catch (_e) { /* fall through to default behavior */ }
    }

    // Enforce correct answer before moving on (skip check for first question)
    if (state.currentQ && !state.lastAnswerCorrect) return;

    // Check if boss caught the hero
    if (state.gameMode === "boss" && state.monsterPos >= state.heroPos - 5) {
        endGame(false, "The dinosaur caught you! 🦖");
        return;
    }
    // Check if player won the race
    if (state.gameMode === "race" && state.racePos >= 100) {
        endGame(true, "You won the race!");
        return;
    }

    state.qCount++;

    // Check if total problems limit is reached (for Mixed Mode goals)
    const settings = state.mixedModeSettings;
    if (settings && settings.totalProblemsEnabled && settings.totalProblems) {
        if (state.qCount > settings.totalProblems) {
            // Already answered the last problem, check if goal was met
            const metGoal = !settings.correctGoalEnabled || (state.score >= settings.correctGoal);
            if (metGoal) {
                endGame(true, `Completed ${settings.totalProblems} problems! Score: ${state.score}`);
            } else {
                endGame(false, `Needed ${settings.correctGoal} correct, got ${state.score}`);
            }
            return;
        }
    }

    // Check infinity mode round boundaries
    if (state.infinityMode && typeof window.checkRoundEnd === 'function') {
        window.checkRoundEnd();
    }

    state.hasAnswered = false;
    state.lastAnswerCorrect = false;
    state.totalProblemsThisSession++;

    if (typeof window.startQuestionTimer === 'function') {
        window.startQuestionTimer(state.skill);
    }

    // Track question start time for adaptive difficulty
    state.questionStartTime = Date.now();
    
    try {
        state.currentQ = generateQuestion();
    } catch (err) {
        console.error("Error generating question:", err);
        state.currentQ = {
            text: "5 + 5 = ?",
            ans: 10,
            hint: "Count up from 5",
            options: [3, 5, 10, 12],
            answerType: "number"
        };
    }

    // Force-enable the floating calculator for any skill in CALCULATOR_SKILLS
    // (e.g. composite volume — multi-step arithmetic where the focus is the
    // conceptual decomposition, not the raw computation). question-render.js
    // toggles #calcBtn based on q.calculatorAllowed, so we just opt in here.
    if (state.currentQ && CALCULATOR_SKILLS.has(state.skill)) {
        state.currentQ.calculatorAllowed = true;
    }
    // Generic catch-all: any question whose CORRECT answer is large enough
    // that mental arithmetic would dominate the conceptual work. This covers
    // skills not yet enumerated in CALCULATOR_SKILLS. Rules:
    // - |ans| >= 100 → calc on
    // - mult/div in text + any operand >= 20 → calc on
    // - Any OoO-like skill (oop_*, paren_*, nested_*, multi_ops_*,
    //   two_ops_*, three_ops_*) → calc on regardless of operand size
    //   (per user spec).
    if (state.currentQ && !state.currentQ.calculatorAllowed) {
        const ans = Number(state.currentQ.ans);
        const txt = String(state.currentQ.text || '');
        const hasMultDiv = /[×÷*\/]/.test(txt);
        const operands = (txt.match(/\d+/g) || []).map(Number);
        const bigOperand = operands.some(n => n >= 20);
        const isOoO = /^(oop_|paren_|nested_|multi_ops_|two_ops_|three_ops_)/.test(state.skill || '');
        if (isOoO) {
            state.currentQ.calculatorAllowed = true;
        } else if (Number.isFinite(ans) && Math.abs(ans) >= 100) {
            state.currentQ.calculatorAllowed = true;
        } else if (hasMultDiv && bigOperand) {
            state.currentQ.calculatorAllowed = true;
        }
    }

    renderQuestion();

    // Universal Skip button — show in practice/boss/race AND MAP modes.
    // Hidden in worksheet mode (per-card Skip is used there instead).
    const skipBtn = document.getElementById('skipQuestionBtn');
    if (skipBtn) {
        const allowSkip = state.gameMode !== 'worksheet';
        skipBtn.style.display = allowSkip ? 'inline-block' : 'none';
    }

    // Refresh per-question dot row (current question highlighted with ring).
    renderQuestionDots();

    // Update progress display
    updateProgressDisplay();

    // Update goal progress display for new question
    updateGoalProgress();
}

// Get a readable skill label for displaying on questions
export function getSkillLabelForQuestion(skillId, categoryId) {
    // Short skill labels for display
    const skillLabels = {
        // Addition
        'add_facts': 'Add Facts', 'add_sub_10s': '+/− 10s', 'add_sub_100s': '+/− 100s',
        'add': 'Addition', 'add_word_problems': 'Add Word',
        'nl_add': 'Add NL', 'nl_sub': 'Sub NL', 'nl_mult': 'Mult NL', 'nl_div': 'Div NL',
        // Explicit add by range & regrouping
        'add_10_no_regroup': 'Add ≤10 NR', 'add_10_regroup': 'Add ≤10 R', 'add_10_mixed': 'Add ≤10',
        'add_20_no_regroup': 'Add ≤20 NR', 'add_20_regroup': 'Add ≤20 R', 'add_20_mixed': 'Add ≤20',
        'add_50_no_regroup': 'Add ≤50 NR', 'add_50_regroup': 'Add ≤50 R', 'add_50_mixed': 'Add ≤50',
        'add_100_no_regroup': 'Add ≤100 NR', 'add_100_regroup': 'Add ≤100 R', 'add_100_mixed': 'Add ≤100',
        'add_1k_no_regroup': 'Add ≤1K NR', 'add_1k_regroup': 'Add ≤1K R', 'add_1k_mixed': 'Add ≤1K',
        'add_10k_no_regroup': 'Add ≤10K NR', 'add_10k_regroup': 'Add ≤10K R', 'add_10k_mixed': 'Add ≤10K',
        'add_100k_no_regroup': 'Add ≤100K NR', 'add_100k_regroup': 'Add ≤100K R', 'add_100k_mixed': 'Add ≤100K',
        'add_1m_no_regroup': 'Add ≤1M NR', 'add_1m_regroup': 'Add ≤1M R', 'add_1m_mixed': 'Add ≤1M',
        'add_wp_10': 'Add Word ≤10', 'add_wp_10_plain': 'Add Word ≤10',
        'add_wp_20': 'Add Word ≤20', 'add_wp_20_plain': 'Add Word ≤20',
        'add_wp_50': 'Add Word ≤50', 'add_wp_50_plain': 'Add Word ≤50',
        'add_wp_100': 'Add Word ≤100', 'add_wp_100_plain': 'Add Word ≤100',
        'add_wp_1k': 'Add Word ≤1K', 'add_wp_1k_plain': 'Add Word ≤1K',
        'add_wp_10k': 'Add Word ≤10K', 'add_wp_10k_plain': 'Add Word ≤10K',
        'add_wp_100k': 'Add Word ≤100K', 'add_wp_100k_plain': 'Add Word ≤100K',
        'add_wp_1m': 'Add Word ≤1M', 'add_wp_1m_plain': 'Add Word ≤1M',
        'cloze_addition': 'Pick Addends',
        'add_sub_fact_family': 'Fact Fam +−', 'number_families_add': 'Num Fam',
        'number_families_add_med': 'Num Fam', 'number_families_add_hard': 'Num Fam',
        // Subtraction
        'sub_facts': 'Sub Facts', 'subtract': 'Subtract', 'sub_word_problems': 'Sub Word',
        // Explicit sub by range & regrouping
        'sub_10_no_regroup': 'Sub ≤10 NR', 'sub_10_regroup': 'Sub ≤10 R', 'sub_10_mixed': 'Sub ≤10',
        'sub_20_no_regroup': 'Sub ≤20 NR', 'sub_20_regroup': 'Sub ≤20 R', 'sub_20_mixed': 'Sub ≤20',
        'sub_50_no_regroup': 'Sub ≤50 NR', 'sub_50_regroup': 'Sub ≤50 R', 'sub_50_mixed': 'Sub ≤50',
        'sub_100_no_regroup': 'Sub ≤100 NR', 'sub_100_regroup': 'Sub ≤100 R', 'sub_100_mixed': 'Sub ≤100',
        'sub_1k_no_regroup': 'Sub ≤1K NR', 'sub_1k_regroup': 'Sub ≤1K R', 'sub_1k_mixed': 'Sub ≤1K',
        'sub_10k_no_regroup': 'Sub ≤10K NR', 'sub_10k_regroup': 'Sub ≤10K R', 'sub_10k_mixed': 'Sub ≤10K',
        'sub_100k_no_regroup': 'Sub ≤100K NR', 'sub_100k_regroup': 'Sub ≤100K R', 'sub_100k_mixed': 'Sub ≤100K',
        'sub_1m_no_regroup': 'Sub ≤1M NR', 'sub_1m_regroup': 'Sub ≤1M R', 'sub_1m_mixed': 'Sub ≤1M',
        'sub_wp_10': 'Sub Word ≤10', 'sub_wp_10_plain': 'Sub Word ≤10',
        'sub_wp_20': 'Sub Word ≤20', 'sub_wp_20_plain': 'Sub Word ≤20',
        'sub_wp_50': 'Sub Word ≤50', 'sub_wp_50_plain': 'Sub Word ≤50',
        'sub_wp_100': 'Sub Word ≤100', 'sub_wp_100_plain': 'Sub Word ≤100',
        'sub_wp_1k': 'Sub Word ≤1K', 'sub_wp_1k_plain': 'Sub Word ≤1K',
        'sub_wp_10k': 'Sub Word ≤10K', 'sub_wp_10k_plain': 'Sub Word ≤10K',
        'sub_wp_100k': 'Sub Word ≤100K', 'sub_wp_100k_plain': 'Sub Word ≤100K',
        'sub_wp_1m': 'Sub Word ≤1M', 'sub_wp_1m_plain': 'Sub Word ≤1M',
        'missing_add_sub': 'Missing +−', 'mixed_add_sub': 'Add/Sub',
        // Multiplication
        'mult_facts': 'Mult Facts', 'multiply': 'Multiply', 'mult_word_problems': 'Mult Word',
        'area_model_mult': 'Area Model', 'area_model_mult_hard': 'Area Model',
        'mult_div_fact_family': 'Fact Fam ×÷', 'number_families_mult': 'Num Fam',
        // Division
        'div_facts': 'Div Facts', 'divide': 'Divide', 'div_word_problems': 'Div Word',
        'area_model_div_2by1': 'Area Div', 'area_model_div_3by1': 'Area Div',
        'missing_mult_div': 'Missing ×÷',
        // Integers
        'number_line_int': 'Int Line', 'compare_int': 'Int Compare',
        'add_int': 'Int Add', 'sub_int': 'Int Sub',
        // Fractions
        'identify': 'Frac ID', 'write_fraction': 'Write Frac', 'shade_fraction': 'Shade Frac',
        'equivalent': 'Equiv Frac', 'compare': 'Compare Frac',
        'simplify': 'Simplify', 'add_fractions': 'Add Frac', 'sub_fractions': 'Sub Frac',
        'mult_fractions': 'Mult Frac', 'div_fractions': 'Div Frac',
        'mixed_to_improper': 'Mixed→Improp', 'improper_to_mixed': 'Improp→Mixed',
        'fraction_word_problems': 'Frac Word', 'numberline': 'Frac Line',
        'add_frac_like_nv': 'Add Frac (NV)', 'sub_frac_like_nv': 'Sub Frac (NV)',
        'add_frac_unlike_nv': 'Add Frac (NV)', 'sub_frac_unlike_nv': 'Sub Frac (NV)',
        'add_mixed_like_nv': 'Add Mixed (NV)', 'sub_mixed_like_nv': 'Sub Mixed (NV)',
        'add_mixed_unlike_nv': 'Add Mixed (NV)', 'sub_mixed_unlike_nv': 'Sub Mixed (NV)',
        'identify_nv': 'Identify Frac (NV)', 'equiv_frac_nv': 'Equiv Frac (NV)', 'fraction_of_set_nv': 'Frac of Set (NV)', 'fraction_of_set_hard_nv': 'Frac of Set (NV)',
        'mult_frac_whole_nv': 'Frac × Whole (NV)', 'decompose_frac_nv': 'Decompose (NV)', 'frac_10_100_nv': '10ths/100ths (NV)',
        'mult_frac_frac_nv': 'Frac × Frac (NV)', 'div_unit_frac_nv': 'Div Unit Frac (NV)', 'frac_as_div_nv': 'Frac as Div (NV)', 'mult_scaling_nv': 'Scaling (NV)',
        'frac_as_div_word': 'Frac as Div Word', 'remainder_contexts': 'Remainder Context',
        // Decimals
        'add_decimal': 'Dec Add', 'sub_decimal': 'Dec Sub',
        'mult_decimal': 'Dec Mult', 'div_decimal': 'Dec Div',
        'compare_decimal': 'Dec Compare', 'order_decimals': 'Dec Order',
        // Conversions
        'f_to_d': 'Frac→Dec', 'd_to_f': 'Dec→Frac',
        'f_to_p': 'Frac→%', 'p_to_f': '%→Frac',
        'd_to_p': 'Dec→%', 'p_to_d': '%→Dec',
        // Geometry
        'perimeter': 'Perimeter', 'area': 'Area', 'area_perimeter': 'Area/Perim',
        'composite_shapes': 'Composite', 'volume': 'Volume',
        'identify_angles': 'Angles', 'measure_angles': 'Measure ∠',
        'identify_lines': 'Lines', 'symmetry': 'Symmetry', 'place_symmetry_lines': 'Draw Symmetry',
        'classify_triangles': 'Triangles', 'classify_quads': 'Quads',
        'hotspot_quads': 'Quad Hotspot',
        'coordinate_q1': 'Coord Q1', 'coordinate_all': 'Coords', 'coordinate_graph': 'Graph',
        'geo_reflect': 'Reflect', 'geo_rotate': 'Rotate', 'geo_translate': 'Translate',
        // Measurement
        'time_hour': 'Time', 'time_half_hour': 'Time', 'time_quarter': 'Time',
        'time_5min': 'Time', 'time_1min': 'Time', 'time_analog_digital': 'Time',
        'time_match_clock': 'Match Clock',
        'elapsed_30min': 'Elapsed', 'elapsed_hour': 'Elapsed', 'elapsed_15min': 'Elapsed',
        'elapsed_mixed': 'Elapsed', 'elapsed_find_duration': 'Find Duration',
        'elapsed_visual_easy': 'Elapsed Clocks', 'elapsed_visual_medium': 'Elapsed Clocks', 'elapsed_visual_hard': 'Elapsed Clocks',
        'money': 'Money', 'temperature': 'Temp', 'capacity': 'Capacity',
        // Data
        'bar_graph': 'Bar Graph', 'pictograph': 'Pictograph', 'line_plot': 'Line Plot',
        'build_bar_graph': 'Build Bar Graph', 'build_pictograph': 'Build Pictograph',
        'pie_chart': 'Pie Chart', 'mean': 'Mean', 'median': 'Median',
        'mode': 'Mode', 'range_stat': 'Range', 'basic_probability': 'Probability',
        // Patterns & Algebra
        'input_output': 'In/Out', 'sequences': 'Sequences', 'missing_pattern': 'Pattern',
        'balance': 'Balance', 'solve_one_step': 'Solve 1-step',
        'solve_two_step': 'Solve 2-step', 'variable_expression': 'Expression',
        'pemdas_basic': 'PEMDAS', 'pemdas_advanced': 'PEMDAS',
        // Place Value & Number Sense
        'expanded_form': 'Expanded', 'word_form': 'Word Form',
        'digit_value': 'Digit Value', 'compare_numbers': 'Compare #',
        'round_whole': 'Round', 'round_decimal': 'Round Dec',
        'estimate_sum': 'Est Sum', 'estimate_diff': 'Est Diff',
        'estimate_sums_diffs': 'Est +/-', 'estimate_products': 'Est Product',
        'estimate_quotient': 'Est Quotient',
        'nearest_10000': 'Round 10K', 'nearest_100000': 'Round 100K', 'nearest_million': 'Round 1M',
        'round_sort_10': 'Sort: Round 10', 'round_sort_100': 'Sort: Round 100',
        'round_sort_1000': 'Sort: Round 1K', 'round_sort_10000': 'Sort: Round 10K',
        'round_sort_100000': 'Sort: Round 100K', 'round_sort_million': 'Sort: Round 1M',
        'round_sort_tenths': 'Sort: Round 0.1', 'round_sort_hundredths': 'Sort: Round 0.01',
        'make_a_ten': 'Make 10', 'doubles_near_doubles': 'Doubles', 'compensation': 'Compensate',
        // Number Theory
        'factor_pairs': 'Factors', 'multiples': 'Multiples', 'factor_links_easy': 'Factor Links',
        'factor_links_medium': 'Factor Links', 'factor_links_hard': 'Factor Links',
        'prime_composite': 'Prime', 'divisibility': 'Divisibility', 'divisibility_sort': 'Div Sort',
        'gcf': 'GCF', 'lcm': 'LCM',
        // New Visual Skills
        'arrays_groups': 'Arrays', 'mult_properties': 'Mult Props',
        'div_remainders': 'Div Remainders',
        'fraction_of_set': 'Frac of Set', 'fraction_of_set_hard': 'Frac of Set Hard', 'equiv_frac_visual': 'Equiv Frac',
        'area_unit_squares': 'Unit Squares', 'perimeter_grid': 'Perim Grid',
        'reading_ruler': 'Ruler', 'reading_ruler_hard': 'Ruler (1/4 in)', 'money_count': 'Money Count',
        'equiv_coin_sets': 'Equiv Coins', 'enough_money': 'Enough?', 'make_change_least_coins': 'Fewest Coins',
        'line_plot_fractions': 'Line Plot',
        'tape_diagram': 'Tape Diagram', 'multi_step_word': 'Multi-Step',
        'skip_count_line': 'Skip Count', 'skip_count_grid': 'Skip Grid',
        // Grid-fill counting/sequencing skills
        'number_seq_fill': 'Seq Fill', 'count_by_step_up': 'Count Up',
        'count_by_step_down': 'Count Down', 'count_by_powers_of_10': 'Powers 10',
        // Ordering skills
        'order_least_to_greatest': 'Order L→G', 'order_greatest_to_least': 'Order G→L',
        'order_negatives': 'Order Int',
        'shape_pattern': 'Shape Pattern', 'number_pattern': 'Number Pattern',
        'rounding_visual': 'Rounding', 'rounding_table': 'Round Table', 'place_value_disks': 'PV Disks',
        'pv_disks_build': 'PV Disks Build',
        'pv_digit_drag': 'Digit Drag', 'number_word_names': 'Word Name',
        'ten_frame_build': 'Ten Frame Build', 'ten_frame_build_teen': 'Teen Ten Frame',
        'base10_build': 'Base-10 Build', 'base10_regroup': 'Base-10 Regroup', 'base10_build_hundreds': 'Base-10 Hundreds',
        // Plain (no pictures) word problems
        'add_word_problems_plain': 'Add Word', 'sub_word_problems_plain': 'Sub Word',
        'mult_word_problems_plain': 'Mult Word', 'div_word_problems_plain': 'Div Word',
        'mult_comparison_plain': 'Times As Many', 'tape_diagram_plain': 'Tape Diagram',
        'multi_step_word_plain': 'Multi-Step', 'frac_word_problems_plain': 'Frac Word',
        'frac_mult_word_plain': 'Frac Mult Word',
        // Mixed word problems
        'word_problems_mixed': 'Mixed Word', 'word_problems_mixed_plain': 'Mixed Word',
        'frac_word_mixed': 'Frac Word Mix', 'frac_word_mixed_plain': 'Frac Word Mix',
        'algebra_word_mixed': 'Alg Word Mix', 'algebra_word_mixed_plain': 'Alg Word Mix',
        // Split difficulty skill variants
        'function_table_easy': 'Func Table', 'function_table_hard': 'Func Table+',
        'fraction_of_set_hard': 'Frac of Set+',
        'reading_ruler_hard': 'Ruler+',
        // New Unit 6 skills
        'oop_easy': 'OoO Easy', 'oop_medium': 'OoO Medium', 'oop_hard': 'OoO Hard',
        'solve_eq_addsub': 'Solve +/−', 'solve_eq_multdiv': 'Solve ×/÷',
        'solve_eq_twostep': 'Two-Step Eq', 'write_equation': 'Write Equation',
        'order_fractions': 'Order Frac', 'order_frac_numline': 'Frac Number Line',
        'benchmark_fractions': 'Benchmark Frac', 'compare_frac_lcd': 'Compare LCD',
        'graph_fractions': 'Graph Frac', 'round_fractions': 'Round Frac',
        'estimate_frac_ops': 'Estimate Frac', 'order_decimals': 'Order Decimals',
        'percent_visual': 'Percent Grid', 'd_to_p': 'Dec→%', 'p_to_d': '%→Dec',
        'percent_of_number': '% of Number', 'order_fdp': 'Order FDP',
        'find_whole_from_pct': 'Find Whole %'
    };
    
    // Try to get from mapping
    if (skillLabels[skillId]) {
        return skillLabels[skillId];
    }
    
    // Try to find in SKILLS constant
    try {
        const index = getSkillIndex();
        const found = index.find(s => s.skillId === skillId);
        if (found) {
            // Extract short name from label (remove emoji and truncate)
            return found.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬🎲]+\s*/, '').substring(0, 12);
        }
    } catch (e) {}
    
    // Fallback: clean up skill ID
    return skillId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).substring(0, 12);
}

