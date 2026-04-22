import { state } from './state.js';

export function restoreSettingsUI() {
    // Update UI to reflect current state with null checks
    const categorySelect = document.getElementById("categorySelect");
    const skillSelect = document.getElementById("skillSelect");
    const rangeSelect = document.getElementById("rangeSelect");
    const decimalSelect = document.getElementById("decimalSelect");
    const timerSelect = document.getElementById("timerSelect");

    if (categorySelect) categorySelect.value = state.category;
    updateSkillOptions();
    if (skillSelect) skillSelect.value = state.skill;
    if (rangeSelect) rangeSelect.value = state.range;
    if (decimalSelect) decimalSelect.value = state.decimalPlaces;
    if (timerSelect) timerSelect.value = state.timerDuration;

    // Update number selection visibility
    updateNumberSectionVisibility();

    // Restore number selections
    document.querySelectorAll(".number-select-btn").forEach(btn => {
        const num = parseInt(btn.dataset.num);
        if (state.selectedNumbers.includes(num)) {
            btn.classList.add("selected");
        } else {
            btn.classList.remove("selected");
        }
    });

    // Update TTS button
    const ttsBtn = document.querySelector('.btn-tts');
    if (ttsBtn) {
        ttsBtn.textContent = state.ttsEnabled ? "🔊 On" : "🔇 Off";
        ttsBtn.classList.toggle("active", state.ttsEnabled);
    }
}

export function showView(id) {
    // Close settings panel if open
    const overlay = document.getElementById('settingsPanelOverlay');
    if (overlay && overlay.classList.contains('active')) {
        overlay.classList.remove('active');
    }
    const panel = document.getElementById('settingsPanel');
    if (panel && panel.classList.contains('active')) {
        panel.classList.remove('active');
    }
    // Close any open modals
    document.querySelectorAll('.modal-overlay.active, .modal.active').forEach(el => {
        el.classList.remove('active');
    });

    document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    // When returning to home view, restore UI from state
    if (id === "homeView") {
        restoreSettingsUI();
        if (typeof window !== 'undefined' && window.updateReviewCount) {
            window.updateReviewCount();
        }
        if (typeof window !== 'undefined' && window.updateBannerDisplay) {
            window.updateBannerDisplay();
        }
    }

    // When showing dashboard, render all dashboard content
    if (id === "dashboardView") {
        renderDashboard();
    }

    // When showing quiz builder, initialize DB
    if (id === "quizBuilderView" || id === "quizResultsView") {
        if (typeof window.initQuizDB === 'function') {
            window.initQuizDB();
        }
    }

    if (id === 'mapSelectorView') {
        // The MAP selector is a "settings/setup" screen — there is no active
        // game. Defensively tear down any game-side timers/handlers that may
        // have leaked from a prior session (e.g. user clicked the home banner
        // mid-game, which historically did NOT stop the banner/session/question
        // timers). A leftover banner/session/idle timer in student-mode could
        // raise the idle modal or fire updateBannerDisplay against the wrong
        // view after ~15-30s — which the user perceived as "auto-redirected
        // to home". Calling these stop helpers is a no-op when no timer is
        // running, so it is always safe.
        if (typeof window !== 'undefined') {
            try { if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; } } catch {}
            try { if (state.cpuInterval) { clearInterval(state.cpuInterval); state.cpuInterval = null; } } catch {}
            try { if (state.bossInterval) { clearInterval(state.bossInterval); state.bossInterval = null; } } catch {}
            try { window.stopBannerTimer && window.stopBannerTimer(); } catch {}
            try { window.stopSessionTimer && window.stopSessionTimer(); } catch {}
            try { window.clearQuestionTimer && window.clearQuestionTimer(); } catch {}
            try { window.removeTabDetection && window.removeTabDetection(); } catch {}
            try { window.removeFullscreenDetection && window.removeFullscreenDetection(); } catch {}
            try { window.dismissIdleModal && window.dismissIdleModal(); } catch {}
            try { window.dismissNudgePopup && window.dismissNudgePopup(); } catch {}
        }
        if (typeof window.initMapSelector === 'function') window.initMapSelector();
    }
    if (id === 'mapSessionView') {
        // Session is set up by startMapSession; nothing to init here yet
    }
    if (id === 'mapResultsView') {
        if (typeof window.renderMapResults === 'function') window.renderMapResults();
    }
}

// Go to home page (called when clicking the banner)
export function goHome() {
    // Confirm exit if student is mid-game
    const isStudent = document.body.classList.contains('student-mode');
    const gameActive = document.getElementById("gameView")?.classList.contains("active");
    if (isStudent && gameActive && state.qCount > 0 && state.gameMode !== 'worksheet') {
        if (!confirm('Exit game? Your progress will be saved.')) return;
    }

    // Clear any running intervals
    if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
    if (state.cpuInterval) { clearInterval(state.cpuInterval); state.cpuInterval = null; }
    if (state.bossInterval) { clearInterval(state.bossInterval); state.bossInterval = null; }

    // Stop the gamification banner/session/question timers too. Historically
    // goHome only cleared the game-side intervals above, leaving the banner
    // timer running. In student-mode that timer would later raise the idle
    // modal (~30s of no interaction) on whatever screen the student had
    // navigated to next — including the MAP selector — which felt like an
    // unexplained redirect. Mirroring exitGame() here keeps every navigation
    // path away from gameView clean.
    if (typeof window !== 'undefined') {
        if (window.stopSessionTimer) { try { window.stopSessionTimer(); } catch {} }
        if (window.stopBannerTimer) { try { window.stopBannerTimer(); } catch {} }
        if (window.clearQuestionTimer) { try { window.clearQuestionTimer(); } catch {} }
    }
    // Stop tab detection
    if (typeof window !== 'undefined' && window.removeTabDetection) {
        window.removeTabDetection();
    }
    // Stop fullscreen detection
    if (typeof window !== 'undefined' && window.removeFullscreenDetection) {
        window.removeFullscreenDetection();
    }
    // Dismiss any leftover idle/nudge popups
    if (typeof window !== 'undefined') {
        if (window.dismissIdleModal) { try { window.dismissIdleModal(); } catch {} }
        if (window.dismissNudgePopup) { try { window.dismissNudgePopup(); } catch {} }
    }

    // Save incomplete session if they were in a game
    const gameView = document.getElementById("gameView");
    if (gameView && gameView.classList.contains("active") && state.qCount > 0 && state.sessionStartTime) {
        saveIncompleteSession();
    }

    // If a MAP session was active, return the borrowed questionCard to gameView.
    // releaseMapSessionScaffold is idempotent — safe to call always.
    if (state.mapMode) state.mapMode = false;
    if (typeof window !== 'undefined' && window.releaseMapSessionScaffold) {
        try { window.releaseMapSessionScaffold(); } catch {}
    }

    hideNextButton();
    showView("homeView");
}

export function exitGame() {
    // Confirm exit if student is mid-game
    const isStudent = document.body.classList.contains('student-mode');
    if (isStudent && state.qCount > 0 && state.gameMode !== 'worksheet') {
        if (!confirm('Exit game? Your progress will be saved.')) return;
    }

    if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
    if (state.cpuInterval) { clearInterval(state.cpuInterval); state.cpuInterval = null; }
    if (state.bossInterval) { clearInterval(state.bossInterval); state.bossInterval = null; }

    // Stop session timer
    if (typeof window !== 'undefined' && window.stopSessionTimer) {
        window.stopSessionTimer();
    }
    // Stop banner timer
    if (typeof window !== 'undefined' && window.stopBannerTimer) {
        window.stopBannerTimer();
    }
    // Clear any active per-question on-task timer
    if (typeof window !== 'undefined' && window.clearQuestionTimer) {
        try { window.clearQuestionTimer(); } catch {}
    }
    // Dismiss any leftover idle/nudge popups
    if (typeof window !== 'undefined') {
        if (window.dismissIdleModal) { try { window.dismissIdleModal(); } catch {} }
        if (window.dismissNudgePopup) { try { window.dismissNudgePopup(); } catch {} }
    }
    // Stop tab detection
    if (typeof window !== 'undefined' && window.removeTabDetection) {
        window.removeTabDetection();
    }
    // Stop fullscreen detection
    if (typeof window !== 'undefined' && window.removeFullscreenDetection) {
        window.removeFullscreenDetection();
    }

    // Save incomplete session to history if they answered at least 1 question
    if (state.qCount > 0 && state.sessionStartTime) {
        saveIncompleteSession();
    }

    // If a MAP session was active, return the borrowed questionCard to gameView.
    // releaseMapSessionScaffold is idempotent — safe to call always.
    if (state.mapMode) state.mapMode = false;
    if (typeof window !== 'undefined' && window.releaseMapSessionScaffold) {
        try { window.releaseMapSessionScaffold(); } catch {}
    }

    hideNextButton();
    showView("homeView");
}

// Save an incomplete/exited session to history
export function saveIncompleteSession() {
    const modeNames = {
        practice: "🎓 Practice",
        boss: "🐉 Boss Battle",
        race: "🏎️ Car Race",
        worksheet: "📝 Worksheet"
    };

    const gameDesc = getGameDescriptionText();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];
    const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });

    // Calculate duration
    const duration = state.sessionStartTime
        ? Math.round((now - state.sessionStartTime) / 1000 / 60)
        : 0;
    const durationStr = duration > 0 ? `${duration} min` : "< 1 min";

    // Calculate percentage
    const percentage = state.qCount > 0 ? Math.round((state.score / state.qCount) * 100) : 0;

    state.sessionHistory.unshift({
        date: dateStr,
        day: dayName,
        time: timeStr,
        duration: durationStr,
        mode: modeNames[state.gameMode] || state.gameMode,
        challenge: gameDesc,
        score: `${state.score}/${state.qCount}`,
        result: "⏸️ Exited",
        percentage: percentage,
        timestamp: now.getTime(),
        incomplete: true
    });

    // Keep only last 100 entries
    if (state.sessionHistory.length > 100) {
        state.sessionHistory = state.sessionHistory.slice(0, 100);
    }

    // Save and render
    markTodayAsPlayed();
    renderSessionHistory();
}

