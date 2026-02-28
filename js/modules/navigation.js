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
    if (state.timerInterval) clearInterval(state.timerInterval);
    if (state.cpuInterval) clearInterval(state.cpuInterval);
    if (state.bossInterval) clearInterval(state.bossInterval);

    // Stop tab detection
    if (typeof window !== 'undefined' && window.removeTabDetection) {
        window.removeTabDetection();
    }
    // Stop fullscreen detection
    if (typeof window !== 'undefined' && window.removeFullscreenDetection) {
        window.removeFullscreenDetection();
    }

    // Save incomplete session if they were in a game
    const gameView = document.getElementById("gameView");
    if (gameView && gameView.classList.contains("active") && state.qCount > 0 && state.sessionStartTime) {
        saveIncompleteSession();
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

    if (state.timerInterval) clearInterval(state.timerInterval);
    if (state.cpuInterval) clearInterval(state.cpuInterval);
    if (state.bossInterval) clearInterval(state.bossInterval);

    // Stop session timer
    if (typeof window !== 'undefined' && window.stopSessionTimer) {
        window.stopSessionTimer();
    }
    // Stop banner timer
    if (typeof window !== 'undefined' && window.stopBannerTimer) {
        window.stopBannerTimer();
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

