import { state } from './state.js';
import { SKILLS } from './data.js';
import { savePersistentData } from './storage.js';

// ===== PROGRESS TRACKING SYSTEM =====

// Initialize or load skill progress (loaded via loadPersistentData in storage.js)
export function initializeSkillProgress() {
    // Skill progress is now loaded from cookies via loadPersistentData()
    // If it wasn't loaded, try localStorage as fallback migration
    if (Object.keys(state.skillProgress).length === 0) {
        try {
            const saved = localStorage.getItem('mathquest_skill_progress');
            if (saved) {
                state.skillProgress = JSON.parse(saved);
                // Migrate to cookies
                savePersistentData();
            }
        } catch (e) {
            state.skillProgress = {};
        }
    }
}

// Save skill progress (now uses cookies via savePersistentData)
export function saveSkillProgress() {
    savePersistentData();
}

// Update progress for a skill after answering
export function updateSkillProgress(skillId, isCorrect) {
    if (!state.skillProgress[skillId]) {
        state.skillProgress[skillId] = {
            correct: 0,
            total: 0,
            streak: 0,
            bestStreak: 0,
            mastery: 0,
            lastPracticed: null,
            history: [] // Last 20 results
        };
    }

    const prog = state.skillProgress[skillId];
    const oldMastery = prog.mastery;
    prog.total++;
    prog.lastPracticed = new Date().toISOString();

    if (isCorrect) {
        prog.correct++;
        prog.streak++;
        if (prog.streak > prog.bestStreak) {
            prog.bestStreak = prog.streak;
        }
    } else {
        prog.streak = 0;
    }

    // Keep last 20 results for mastery calculation
    prog.history.push(isCorrect ? 1 : 0);
    if (prog.history.length > 20) {
        prog.history.shift();
    }

    // Calculate mastery (0-100) based on recent performance
    // Weighted: recent answers count more
    if (prog.history.length >= 5) {
        const recentWeight = 0.7;
        const overallWeight = 0.3;
        const recentCorrect = prog.history.slice(-5).reduce((a, b) => a + b, 0) / 5;
        const overallCorrect = prog.correct / prog.total;
        prog.mastery = Math.round((recentCorrect * recentWeight + overallCorrect * overallWeight) * 100);
    } else {
        prog.mastery = Math.round((prog.correct / prog.total) * 100);
    }

    // Spaced repetition integration
    if (typeof window !== 'undefined' && window.updateSpacedRepetition) {
        window.updateSpacedRepetition(skillId, isCorrect);
    }

    // Badge triggers for skill progress
    const masteryDelta = prog.mastery - oldMastery;
    if (typeof window !== 'undefined' && window.checkBadgeTriggers) {
        window.checkBadgeTriggers('skill_progress', { skillId, masteryDelta });
    }

    saveSkillProgress();
    updateProgressDisplay();
}

// Get mastery level for display
export function getMasteryLevel(mastery) {
    if (mastery >= 90) return { level: 'Master', color: '#ffd700', icon: '🏆', stars: 5 };
    if (mastery >= 75) return { level: 'Expert', color: '#c0c0c0', icon: '⭐', stars: 4 };
    if (mastery >= 60) return { level: 'Proficient', color: '#cd7f32', icon: '✨', stars: 3 };
    if (mastery >= 40) return { level: 'Developing', color: '#4cc9f0', icon: '📈', stars: 2 };
    if (mastery >= 20) return { level: 'Beginner', color: '#7209b7', icon: '🌱', stars: 1 };
    return { level: 'New', color: '#666', icon: '🆕', stars: 0 };
}

// Update progress display in UI
export function updateProgressDisplay() {
    const progressBar = document.getElementById('skillProgressBar');
    const progressText = document.getElementById('skillProgressText');
    if (!progressBar || !progressText) return;
    
    const currentSkill = state.skill || 'add';
    const prog = state.skillProgress[currentSkill];
    
    if (prog) {
        const masteryInfo = getMasteryLevel(prog.mastery);
        progressBar.style.width = `${prog.mastery}%`;
        progressBar.style.background = `linear-gradient(90deg, ${masteryInfo.color}, ${masteryInfo.color}88)`;
        progressText.innerHTML = `${masteryInfo.icon} ${masteryInfo.level} (${prog.mastery}%) • ${prog.streak} streak`;
    } else {
        progressBar.style.width = '0%';
        progressText.innerHTML = '🆕 New Skill';
    }
}

// ===== ADAPTIVE DIFFICULTY SYSTEM =====

// Track recent performance for adaptive difficulty
export function trackPerformance(isCorrect, responseTimeMs) {
    state.recentPerformance.push({
        correct: isCorrect,
        time: responseTimeMs,
        timestamp: Date.now()
    });
    
    // Keep last 10
    if (state.recentPerformance.length > 10) {
        state.recentPerformance.shift();
    }
    
    // Update consecutive counters
    if (isCorrect) {
        state.consecutiveCorrect++;
        state.consecutiveWrong = 0;
    } else {
        state.consecutiveWrong++;
        state.consecutiveCorrect = 0;
    }
    
    // Adjust difficulty
    adjustDifficulty();
}

// Adjust difficulty based on performance
export function adjustDifficulty() {
    // Deprecated: difficulty is now baked into skill variants
    return;
}

// Get adjusted range based on adaptive difficulty
export function getAdaptiveRange(baseRange) {
    return baseRange;
}

// ===== PROGRESS DASHBOARD FUNCTIONS =====

export function openProgressDashboard() {
    renderProgressDashboard();
    document.getElementById('progressModal').classList.add('active');
}

export function closeProgressDashboard() {
    document.getElementById('progressModal').classList.remove('active');
}

export function renderProgressDashboard() {
    const body = document.getElementById('progressBody');
    const progress = state.skillProgress;
    const skills = Object.keys(progress);
    
    if (skills.length === 0) {
        body.innerHTML = `
            <div class="progress-empty">
                <div class="progress-empty-icon">📚</div>
                <h3>No Progress Yet!</h3>
                <p>Start practicing to track your progress.</p>
                <button class="btn btn-primary" onclick="closeProgressDashboard(); selectMode('practice');">Start Practicing</button>
            </div>`;
        return;
    }
    
    // Calculate overall stats
    let totalCorrect = 0;
    let totalAttempted = 0;
    let skillsMastered = 0;
    let bestStreak = 0;
    
    skills.forEach(skillId => {
        const p = progress[skillId];
        totalCorrect += p.correct || 0;
        totalAttempted += p.total || 0;
        if (p.mastery >= 80) skillsMastered++;
        if ((p.bestStreak || 0) > bestStreak) bestStreak = p.bestStreak;
    });
    
    const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    
    // Build HTML
    let html = `
        <div class="progress-stats">
            <div class="progress-stat-card">
                <div class="progress-stat-value">${totalAttempted}</div>
                <div class="progress-stat-label">Problems Solved</div>
            </div>
            <div class="progress-stat-card">
                <div class="progress-stat-value">${overallAccuracy}%</div>
                <div class="progress-stat-label">Accuracy</div>
            </div>
            <div class="progress-stat-card">
                <div class="progress-stat-value">${skills.length}</div>
                <div class="progress-stat-label">Skills Practiced</div>
            </div>
            <div class="progress-stat-card">
                <div class="progress-stat-value">${skillsMastered}</div>
                <div class="progress-stat-label">Skills Mastered</div>
            </div>
            <div class="progress-stat-card">
                <div class="progress-stat-value">${bestStreak}</div>
                <div class="progress-stat-label">Best Streak</div>
            </div>
        </div>
        
        <h3 style="margin-bottom:15px;">📈 Skills Progress</h3>`;
    
    // Sort skills by mastery (highest first)
    const sortedSkills = skills.sort((a, b) => (progress[b].mastery || 0) - (progress[a].mastery || 0));
    
    sortedSkills.forEach(skillId => {
        const p = progress[skillId];
        const mastery = p.mastery || 0;
        const masteryInfo = getMasteryLevel(mastery);
        const accuracy = p.total > 0 ? Math.round((p.correct / p.total) * 100) : 0;
        
        // Get skill display name
        let skillName = skillId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        // Try to find actual skill label
        for (const [catId, skills] of Object.entries(SKILLS)) {
            const found = skills.find(s => s.v === skillId);
            if (found) {
                skillName = found.l.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, '');
                break;
            }
        }
        
        html += `
            <div class="progress-skill-item" style="border-left-color:${masteryInfo.color};">
                <div class="progress-skill-info">
                    <div class="progress-skill-name">${masteryInfo.icon} ${skillName}</div>
                    <div class="progress-skill-stats">${p.correct}/${p.total} correct (${accuracy}%) • Streak: ${p.streak || 0}</div>
                </div>
                <div class="progress-skill-bar-bg">
                    <div class="progress-skill-bar" style="width:${mastery}%;background:linear-gradient(90deg,${masteryInfo.color},${masteryInfo.color}88);"></div>
                </div>
                <div class="progress-skill-mastery" style="color:${masteryInfo.color};">${mastery}%</div>
            </div>`;
    });
    
    body.innerHTML = html;
}

export function clearAllProgress() {
    if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        state.skillProgress = {};
        state.recentPerformance = [];
        state.consecutiveCorrect = 0;
        state.consecutiveWrong = 0;
        state.adaptiveDifficulty = 'medium';
        saveSkillProgress();
        renderProgressDashboard();
        showNotification('Progress reset successfully', 'success');
    }
}

// Notification toast
export function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: ${type === 'success' ? 'var(--correct)' : type === 'error' ? '#e74c3c' : 'var(--accent-cyan)'};
        color: white;
        border-radius: 10px;
        font-weight: 600;
        z-index: 10001;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add animation keyframes if not exists
    if (!document.getElementById('notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                to { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(20px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}
