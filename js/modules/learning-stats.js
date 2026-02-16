import { state } from './state.js';
import { SKILLS } from './data.js';

// ===== LEARNING STATS VIEW =====
// Full-screen view showing session history with per-skill breakdowns

function formatDuration(ms) {
    if (!ms || ms <= 0) return '0s';
    const totalSec = Math.round(ms / 1000);
    if (totalSec < 60) return totalSec + 's';
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    if (min < 60) return sec > 0 ? min + 'm ' + sec + 's' : min + 'm';
    const hr = Math.floor(min / 60);
    const rm = min % 60;
    return hr + 'h ' + rm + 'm';
}

function formatDate(dateStr, dayStr, timeStr) {
    if (!dateStr) return 'Unknown';
    return (dayStr || '') + ' ' + dateStr + (timeStr ? ' at ' + timeStr : '');
}

function getSkillLabel(skillId) {
    if (SKILLS[skillId]) return SKILLS[skillId].label || skillId;
    return skillId;
}

// Build today summary cards from daily stats + stats history
function buildTodaySummary() {
    const todayCorrect = state.dailyCorrect || 0;
    const todayTotal = state.dailyTotal || 0;
    const todayTimeMs = state.dailyActiveTimeMs || 0;
    const accuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;

    // Count unique skills practiced today from session history
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = state.sessionHistory.filter(s => s.date === todayStr);
    const skillSet = new Set();
    todaySessions.forEach(s => {
        if (s.skills) Object.keys(s.skills).forEach(k => skillSet.add(k));
    });
    // Also count current session skills
    if (state.currentSessionSkills) {
        Object.keys(state.currentSessionSkills).forEach(k => skillSet.add(k));
    }

    return `<div class="ls-summary-cards">
        <div class="ls-card">
            <div class="ls-card-value">${formatDuration(todayTimeMs)}</div>
            <div class="ls-card-label">Time Today</div>
        </div>
        <div class="ls-card">
            <div class="ls-card-value">${todayTotal}</div>
            <div class="ls-card-label">Questions</div>
        </div>
        <div class="ls-card">
            <div class="ls-card-value">${accuracy}%</div>
            <div class="ls-card-label">Accuracy</div>
        </div>
        <div class="ls-card">
            <div class="ls-card-value">${skillSet.size}</div>
            <div class="ls-card-label">Skills</div>
        </div>
    </div>`;
}

// Build session log with expandable rows
function buildSessionLog(filterDays) {
    const sessions = state.sessionHistory || [];
    if (sessions.length === 0) {
        return '<div class="ls-empty">No sessions recorded yet. Play some math to see your stats!</div>';
    }

    // Filter by date range
    let filtered = sessions;
    if (filterDays > 0) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - filterDays);
        const cutoffTs = cutoff.getTime();
        filtered = sessions.filter(s => {
            if (s.timestamp) return s.timestamp >= cutoffTs;
            return true; // include sessions without timestamp
        });
    }

    if (filtered.length === 0) {
        return '<div class="ls-empty">No sessions in this time range.</div>';
    }

    let html = '';
    filtered.forEach((session, idx) => {
        const scoreText = session.score || '0/0';
        const pct = session.percentage || 0;
        const hasSkills = session.skills && Object.keys(session.skills).length > 0;
        const expandClass = hasSkills ? 'ls-expandable' : '';
        const expandIcon = hasSkills ? '<span class="ls-expand-icon">&#9654;</span>' : '<span class="ls-expand-icon" style="visibility:hidden">&#9654;</span>';

        html += `<div class="ls-session ${expandClass}" data-idx="${idx}">
            <div class="ls-session-row" onclick="toggleSessionDetails(${idx})">
                ${expandIcon}
                <div class="ls-session-info">
                    <span class="ls-session-date">${formatDate(session.date, session.day, session.time)}</span>
                    <span class="ls-session-mode">${session.mode || 'Practice'}</span>
                </div>
                <div class="ls-session-stats">
                    <span class="ls-session-score">${scoreText}</span>
                    <span class="ls-session-pct">${pct}%</span>
                    <span class="ls-session-duration">${session.duration || ''}</span>
                </div>
            </div>
            <div class="ls-session-details" id="lsDetails${idx}" style="display:none;">
                ${hasSkills ? buildSkillBreakdown(session.skills) : '<div class="ls-no-breakdown">No per-skill data for this session.</div>'}
            </div>
        </div>`;
    });

    return html;
}

// Build per-skill breakdown table for a session
function buildSkillBreakdown(skills) {
    if (!skills || Object.keys(skills).length === 0) return '';

    let html = '<table class="ls-breakdown-table"><thead><tr><th>Skill</th><th>Questions</th><th>Correct</th><th>Accuracy</th><th>Time</th></tr></thead><tbody>';

    const entries = Object.entries(skills).sort((a, b) => (b[1].a || 0) - (a[1].a || 0));
    for (const [skillId, data] of entries) {
        const attempted = data.a || data.attempted || 0;
        const correct = data.c || data.correct || 0;
        const timeMs = data.t || data.timeMs || 0;
        const label = data.l || data.label || getSkillLabel(skillId);
        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
        const barWidth = Math.min(100, accuracy);
        const barColor = accuracy >= 80 ? 'var(--accent-green)' : accuracy >= 50 ? 'var(--accent-orange)' : 'var(--accent-red, #ef4444)';

        html += `<tr>
            <td class="ls-skill-name">${label}</td>
            <td>${attempted}</td>
            <td>${correct}</td>
            <td>
                <div class="ls-mini-bar">
                    <div class="ls-mini-bar-fill" style="width:${barWidth}%;background:${barColor};"></div>
                </div>
                <span class="ls-mini-bar-text">${accuracy}%</span>
            </td>
            <td>${formatDuration(timeMs)}</td>
        </tr>`;
    }

    html += '</tbody></table>';
    return html;
}

// Build all-time per-skill summary from all sessions
function buildSkillSummary() {
    const allSkills = {};

    // Aggregate from all session history
    (state.sessionHistory || []).forEach(session => {
        if (!session.skills) return;
        for (const [skillId, data] of Object.entries(session.skills)) {
            if (!allSkills[skillId]) {
                allSkills[skillId] = { attempted: 0, correct: 0, timeMs: 0, sessions: 0, label: '' };
            }
            const entry = allSkills[skillId];
            entry.attempted += (data.a || data.attempted || 0);
            entry.correct += (data.c || data.correct || 0);
            entry.timeMs += (data.t || data.timeMs || 0);
            entry.sessions++;
            if (!entry.label) entry.label = data.l || data.label || getSkillLabel(skillId);
        }
    });

    const entries = Object.entries(allSkills).sort((a, b) => b[1].attempted - a[1].attempted);

    if (entries.length === 0) {
        return '<div class="ls-empty">No skill data yet. Complete some practice sessions to see per-skill stats.</div>';
    }

    let html = '<div class="ls-skill-grid">';
    for (const [skillId, data] of entries) {
        const accuracy = data.attempted > 0 ? Math.round((data.correct / data.attempted) * 100) : 0;
        const barColor = accuracy >= 80 ? 'var(--accent-green)' : accuracy >= 50 ? 'var(--accent-orange)' : 'var(--accent-red, #ef4444)';

        html += `<div class="ls-skill-card">
            <div class="ls-skill-card-header">
                <span class="ls-skill-card-name">${data.label || getSkillLabel(skillId)}</span>
                <span class="ls-skill-card-accuracy" style="color:${barColor}">${accuracy}%</span>
            </div>
            <div class="ls-mini-bar" style="height:6px;margin:6px 0;">
                <div class="ls-mini-bar-fill" style="width:${Math.min(100, accuracy)}%;background:${barColor};"></div>
            </div>
            <div class="ls-skill-card-details">
                <span>${data.correct}/${data.attempted} correct</span>
                <span>${formatDuration(data.timeMs)}</span>
                <span>${data.sessions} session${data.sessions !== 1 ? 's' : ''}</span>
            </div>
        </div>`;
    }
    html += '</div>';
    return html;
}

// Main function to open Learning Stats view
export function openLearningStats() {
    const container = document.getElementById('learningStatsContent');
    if (!container) return;

    const filterDays = state.statsFilterDays || 0; // 0 = all time

    container.innerHTML = `
        <div class="ls-section">
            <div class="ls-section-title">Today's Summary</div>
            ${buildTodaySummary()}
        </div>
        <div class="ls-section">
            <div class="ls-section-title-row">
                <span class="ls-section-title">Session History</span>
                <select class="ls-filter-select" id="lsFilterSelect" onchange="filterLearningStats(this.value)">
                    <option value="0" ${filterDays === 0 ? 'selected' : ''}>All Time</option>
                    <option value="1" ${filterDays === 1 ? 'selected' : ''}>Today</option>
                    <option value="7" ${filterDays === 7 ? 'selected' : ''}>Last 7 Days</option>
                    <option value="30" ${filterDays === 30 ? 'selected' : ''}>Last 30 Days</option>
                </select>
            </div>
            <div id="lsSessionLog">
                ${buildSessionLog(filterDays)}
            </div>
        </div>
        <div class="ls-section">
            <div class="ls-section-title">Skill Summary (All Time)</div>
            <div id="lsSkillSummary">
                ${buildSkillSummary()}
            </div>
        </div>
    `;

    window.showView('learningStatsView');
}

export function closeLearningStats() {
    window.showView('homeView');
}

export function filterLearningStats(days) {
    state.statsFilterDays = parseInt(days, 10) || 0;
    const logContainer = document.getElementById('lsSessionLog');
    if (logContainer) {
        logContainer.innerHTML = buildSessionLog(state.statsFilterDays);
    }
}

export function toggleSessionDetails(idx) {
    const details = document.getElementById('lsDetails' + idx);
    if (!details) return;
    const session = details.closest('.ls-session');
    const icon = session ? session.querySelector('.ls-expand-icon') : null;

    if (details.style.display === 'none') {
        details.style.display = 'block';
        if (icon) icon.innerHTML = '&#9660;'; // down arrow
        if (session) session.classList.add('ls-expanded');
    } else {
        details.style.display = 'none';
        if (icon) icon.innerHTML = '&#9654;'; // right arrow
        if (session) session.classList.remove('ls-expanded');
    }
}