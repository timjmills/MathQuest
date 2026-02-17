import { state } from './state.js';
import { SKILLS } from './data.js';

export function showModal(message, onOk) {
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;";
    modal.innerHTML = `
        <div style="background:var(--bg-card);padding:28px 36px;border-radius:20px;text-align:center;max-width:320px;box-shadow:0 20px 50px rgba(0,0,0,0.3);">
            <p style="font-size:1.2rem;font-weight:800;margin-bottom:20px;color:var(--text-bright);">${message}</p>
            <button class="btn btn-primary" style="padding:12px 32px;">OK</button>
        </div>
    `;
    modal.querySelector("button").onclick = () => {
        modal.remove();
        if (onOk) onOk();
    };
    document.body.appendChild(modal);
}

export function getGameDescriptionText() {
    // Get the skill label
    let skillLabel = "";
    const skillsList = SKILLS[state.category] || [];
    const skillObj = skillsList.find(s => s.v === state.skill);
    if (skillObj) {
        skillLabel = skillObj.l;
    }

    // Format the range
    let rangeText = "";
    if (state.category === "operations" || state.category === "patterns" ||
        state.category === "rounding" || state.category === "doubling") {
        rangeText = ` (up to ${state.range.toLocaleString()})`;
    }

    // Get category name
    const categorySelect = document.getElementById("categorySelect");
    const categoryName = categorySelect.options[categorySelect.selectedIndex].text;

    // Build description
    if (skillLabel) {
        return `${skillLabel}${rangeText}`;
    } else {
        return `${categoryName}${rangeText}`;
    }
}

export function showEndGameModal(win, message) {
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;";

    const emoji = win ? "🎉" : "😢";
    const scoreText = `Score: ${state.score} Correct`;
    const gameDescription = getGameDescriptionText();
    const sessionTimeStr = (typeof window !== 'undefined' && window.getSessionTimeFormatted) ? window.getSessionTimeFormatted() : '';

    // Show win/lose banner for boss and race modes
    const showBanner = state.gameMode === "boss" || state.gameMode === "race";
    const bannerText = win ? "🏆 YOU WIN! 🏆" : "☹️ YOU LOST ☹️";
    const bannerColor = win ? "linear-gradient(135deg, #06D6A0, #00BFA5)" : "linear-gradient(135deg, #EF476F, #C1121F)";
    const bannerHTML = showBanner ? `
        <div style="background:${bannerColor};color:white;padding:16px 24px;border-radius:16px;margin-bottom:16px;font-size:1.8rem;font-weight:900;text-shadow:2px 2px 4px rgba(0,0,0,0.3);animation:bannerPulse 1s ease-in-out infinite;">
            ${bannerText}
        </div>
        <style>
            @keyframes bannerPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
        </style>
    ` : "";

    modal.innerHTML = `
        <div style="background:var(--bg-card);padding:32px 40px;border-radius:24px;text-align:center;max-width:420px;box-shadow:0 20px 60px rgba(0,0,0,0.4);">
            ${bannerHTML}
            <div style="font-size:3.5rem;margin-bottom:12px;">${emoji}</div>
            <h2 style="font-size:1.5rem;font-weight:900;margin-bottom:8px;color:var(--text-bright);">${message}</h2>
            <div style="background:var(--bg-card-light);padding:12px 20px;border-radius:12px;margin-bottom:12px;">
                <p style="font-size:0.9rem;font-weight:700;color:var(--text-dim);margin-bottom:4px;">Challenge</p>
                <p style="font-size:1rem;font-weight:800;color:var(--accent-cyan);">${gameDescription}</p>
            </div>
            <p style="font-size:1.2rem;font-weight:800;margin-bottom:8px;color:var(--accent-purple);">${scoreText}</p>
            ${sessionTimeStr ? `<p style="font-size:0.85rem;font-weight:600;margin-bottom:24px;color:var(--text-dim);">Time: ${sessionTimeStr}</p>` : '<div style="margin-bottom:24px;"></div>'}
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                <button class="btn btn-primary" id="playAgainBtn" style="padding:14px 28px;font-size:1rem;">🔄 Play Again</button>
                <button class="btn btn-secondary" id="homeBtn" style="padding:14px 28px;font-size:1rem;">🏠 Home</button>
            </div>
        </div>
    `;

    modal.querySelector("#playAgainBtn").onclick = () => {
        modal.remove();
        startGame(); // Restart with same settings
    };

    modal.querySelector("#homeBtn").onclick = () => {
        modal.remove();
        showView("homeView");
    };

    document.body.appendChild(modal);
}

// Update goal progress display
export function updateGoalProgress() {
    const settings = state.mixedModeSettings;
    const progressEl = document.getElementById('goalProgress');
    if (!progressEl) return;

    if (!settings || (!settings.totalProblemsEnabled && !settings.correctGoalEnabled)) {
        progressEl.style.display = 'none';
        return;
    }

    let progressText = '';

    // Show correct goal progress
    if (settings.correctGoalEnabled && settings.correctGoal) {
        progressText = `🎯 ${state.score}/${settings.correctGoal}`;
    }

    // Show total problems progress
    if (settings.totalProblemsEnabled && settings.totalProblems) {
        const qText = `Q${state.qCount}/${settings.totalProblems}`;
        progressText = progressText ? `${progressText} | ${qText}` : qText;
    }

    if (progressText) {
        progressEl.textContent = progressText;
        progressEl.style.display = 'inline';
    } else {
        progressEl.style.display = 'none';
    }
}

// Check if problem goals from Mixed Mode are met
export function checkProblemGoals() {
    const settings = state.mixedModeSettings;
    if (!settings) return false;

    // Check if correct goal is reached (win condition)
    if (settings.correctGoalEnabled && settings.correctGoal) {
        if (state.score >= settings.correctGoal) {
            setTimeout(() => {
                endGame(true, `🎯 Goal Reached! You got ${settings.correctGoal} correct!`);
            }, 600);
            return true;
        }
    }

    // Check if total problems limit is reached
    if (settings.totalProblemsEnabled && settings.totalProblems) {
        if (state.qCount >= settings.totalProblems) {
            // Check if they met the correct goal
            const metGoal = !settings.correctGoalEnabled || (state.score >= settings.correctGoal);
            setTimeout(() => {
                if (metGoal) {
                    endGame(true, `Completed ${settings.totalProblems} problems! Score: ${state.score}`);
                } else {
                    endGame(false, `Needed ${settings.correctGoal} correct, got ${state.score}`);
                }
            }, 600);
            return true;
        }
    }

    return false;
}

export function endGame(win, message) {
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

    // Badge triggers for game end
    if (typeof window !== 'undefined' && window.checkBadgeTriggers) {
        window.checkBadgeTriggers('game_end', {
            qCount: state.qCount,
            sessionTimeMs: state.sessionTimeMs
        });
    }

    // Reset review session flag
    state.isReviewSession = false;

    // Save to session history
    saveToSessionHistory(win);

    showEndGameModal(win, message || (win ? "Nice work!" : "Good try!"));
}

export function saveWorksheetToHistory(correct, total, isPassing) {
    const gameDesc = getGameDescriptionText();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });
    const percentage = Math.round((correct / total) * 100);

    // Calculate duration
    const duration = state.sessionStartTime
        ? Math.round((now - state.sessionStartTime) / 1000 / 60)
        : 0;
    const durationStr = duration > 0 ? `${duration} min` : "< 1 min";

    state.sessionHistory.unshift({
        date: dateStr,
        day: dayName,
        time: timeStr,
        duration: durationStr,
        mode: "📝 Worksheet",
        challenge: gameDesc,
        score: `${correct}/${total}`,
        result: isPassing ? "✅ Pass" : "❌ Retry",
        percentage: percentage,
        timestamp: now.getTime()
    });

    // Keep only last 100 entries
    if (state.sessionHistory.length > 100) {
        state.sessionHistory = state.sessionHistory.slice(0, 100);
    }

    // Mark today as played and save to cookies
    markTodayAsPlayed();
    renderSessionHistory();
}

export function saveToSessionHistory(win) {
    const modeNames = {
        practice: "🎓 Practice",
        boss: "🐉 Boss Battle",
        race: "🏎️ Car Race",
        worksheet: "📝 Worksheet"
    };

    const gameDesc = getGameDescriptionText();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayName = now.toLocaleDateString('en-US', { weekday: 'short' });

    // Calculate duration
    const duration = state.sessionStartTime
        ? Math.round((now - state.sessionStartTime) / 1000 / 60)
        : 0;
    const durationStr = duration > 0 ? `${duration} min` : "< 1 min";

    // Build per-skill breakdown from session tracking
    const skillBreakdown = {};
    if (state.currentSessionSkills) {
        for (const [sid, data] of Object.entries(state.currentSessionSkills)) {
            skillBreakdown[sid] = { a: data.attempted, c: data.correct, t: data.timeMs, l: data.label };
        }
    }

    state.sessionHistory.unshift({
        date: dateStr,
        day: dayName,
        time: timeStr,
        duration: durationStr,
        durationMs: state.sessionStartTime ? (now.getTime() - state.sessionStartTime) : 0,
        mode: modeNames[state.gameMode] || state.gameMode,
        challenge: gameDesc,
        score: `${state.score}/${state.qCount}`,
        result: win ? "✅ Win" : "❌ Loss",
        percentage: state.qCount > 0 ? Math.round((state.score / state.qCount) * 100) : 0,
        timestamp: now.getTime(),
        incomplete: false,
        skills: skillBreakdown
    });

    // Reset session skill tracking
    state.currentSessionSkills = {};

    // Keep only last 100 entries
    if (state.sessionHistory.length > 100) {
        state.sessionHistory = state.sessionHistory.slice(0, 100);
    }

    // Mark today as played and save to cookies
    markTodayAsPlayed();
    renderSessionHistory();
}

// Filter history by time period
