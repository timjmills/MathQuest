import { state } from './state.js';
import { setCookie, getCookie, loadPersistentData, savePersistentData } from './storage.js';

export function markTodayAsPlayed() {
    const today = new Date().toISOString().split('T')[0];
    if (!state.streakDays) state.streakDays = [];
    if (!state.streakDays.includes(today)) {
        state.streakDays.push(today);
        // Update streak
        updateStreak();
    }
    savePersistentData();
}

export function updateStreak() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    if (state.lastPlayDate === yesterdayStr || state.lastPlayDate === todayStr) {
        if (state.lastPlayDate !== todayStr) {
            state.streak++;
        }
    } else if (state.lastPlayDate !== todayStr) {
        state.streak = 1;
    }
    state.lastPlayDate = todayStr;

    // Check streak badges
    if (typeof window !== 'undefined' && window.checkBadgeTriggers) {
        window.checkBadgeTriggers('streak_update', {});
    }
}

// Initialize on load
loadPersistentData();

// Render streak calendar showing last 28 days
export function renderStreakCalendar() {
    const container = document.getElementById("streakCalendar");
    if (!container) return;

    const today = new Date();
    const days = [];

    // Generate last 28 days (4 weeks)
    for (let i = 27; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push(d);
    }

    let html = '';
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Add day labels for first row
    dayLabels.forEach(label => {
        html += `<div style="text-align:center; font-size:0.7rem; color:var(--text-dim); font-weight:600;">${label}</div>`;
    });

    days.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const isToday = dateStr === today.toISOString().split('T')[0];
        const hasPlayed = state.streakDays.includes(dateStr);
        const dayNum = date.getDate();

        let bgColor = 'var(--bg-card-light)';
        let textColor = 'var(--text-dim)';
        let border = 'none';

        if (hasPlayed) {
            bgColor = 'linear-gradient(135deg, var(--accent-green), var(--accent-cyan))';
            textColor = 'white';
        }
        if (isToday) {
            border = '2px solid var(--accent-orange)';
        }

        html += `<div style="
            aspect-ratio:1;
            display:flex;
            align-items:center;
            justify-content:center;
            background:${bgColor};
            color:${textColor};
            border-radius:8px;
            font-size:0.8rem;
            font-weight:600;
            border:${border};
            ${hasPlayed ? 'box-shadow:0 2px 6px rgba(6,214,160,0.3);' : ''}
        ">${dayNum}</div>`;
    });

    container.innerHTML = html;
}

// Render badges
export function renderBadges() {
    const container = document.getElementById("badgeGrid");
    if (!container) return;

    const allBadges = (typeof window !== 'undefined' && window.getAllBadges) ? window.getAllBadges() : [
        { id: 'first_game', icon: '🎮', name: 'First Game', desc: 'Complete your first game' },
        { id: 'streak_3', icon: '🔥', name: '3-Day Streak', desc: 'Play 3 days in a row' },
        { id: 'streak_7', icon: '🏆', name: 'Week Warrior', desc: 'Play 7 days in a row' },
        { id: 'streak_30', icon: '👑', name: 'Monthly Master', desc: 'Play 30 days in a row' },
        { id: 'perfect_10', icon: '⭐', name: 'Perfect 10', desc: 'Get 10 correct in a row' },
        { id: 'speed_demon', icon: '⚡', name: 'Speed Demon', desc: '20+ questions in under 2 min' },
        { id: 'math_master', icon: '🧮', name: 'Math Master', desc: 'Earn 1000 XP' },
        { id: 'division_pro', icon: '➗', name: 'Division Pro', desc: '50 division problems' },
        { id: 'multiplication_ace', icon: '✖️', name: 'Mult. Ace', desc: 'Master all times tables' },
        { id: 'persistent_50', icon: '💪', name: 'Persistent', desc: '50 problems in one session' },
        { id: 'bounce_back', icon: '🔄', name: 'Bounce Back', desc: '3 wrong then 3 right' },
        { id: 'time_champion', icon: '⏱️', name: 'Time Champ', desc: '20+ min on task' },
        { id: 'review_master', icon: '📖', name: 'Review Master', desc: 'Complete a Smart Review' },
        { id: 'growth_spurt', icon: '🌟', name: 'Growth Spurt', desc: 'Improve skill by 20+ pts' },
        { id: 'level_5', icon: '🎖️', name: 'Level 5', desc: 'Reach Level 5' }
    ];

    let html = '';
    allBadges.forEach(badge => {
        const earned = state.badges.includes(badge.id);
        html += `<div style="
            display:flex;
            flex-direction:column;
            align-items:center;
            padding:12px;
            min-width:80px;
            background:${earned ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))' : 'var(--bg-card-light)'};
            border-radius:12px;
            opacity:${earned ? '1' : '0.5'};
            ${earned ? 'box-shadow:0 2px 8px rgba(139,92,246,0.3);' : ''}
        ">
            <span style="font-size:1.8rem; ${earned ? '' : 'filter:grayscale(100%);'}">${badge.icon}</span>
            <span style="font-size:0.75rem; font-weight:600; color:${earned ? 'white' : 'var(--text-dim)'}; text-align:center; margin-top:4px;">${badge.name}</span>
        </div>`;
    });

    container.innerHTML = html || '<p style="color:var(--text-dim);">Complete challenges to earn badges!</p>';
}

// Render dashboard content
export function renderDashboard() {
    renderSessionHistory();
    renderStreakCalendar();
    renderBadges();
}


export function filterHistory(period) {
    state.historyFilter = period;

    // Update button states
    document.querySelectorAll('.history-filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('filter' + period.charAt(0).toUpperCase() + period.slice(1)).classList.add('active');

    renderSessionHistory();
}

// Get filtered history based on selected period
export function getFilteredHistory() {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Calculate week start (Sunday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Calculate 30 days ago
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];

    return state.sessionHistory.filter(entry => {
        if (!entry.date) return true; // Legacy entries without date
        switch (state.historyFilter) {
            case 'today':
                return entry.date === todayStr;
            case 'week':
                return entry.date >= weekStartStr;
            case 'month':
                return entry.date >= monthAgoStr;
            default:
                return true;
        }
    });
}

export function renderSessionHistory() {
    const container = document.getElementById("sessionHistoryTable");
    if (!container) return;

    const filteredHistory = getFilteredHistory();
    const periodLabels = { today: 'today', week: 'this week', month: 'in the last 30 days' };

    if (filteredHistory.length === 0) {
        const periodLabel = periodLabels[state.historyFilter] || '';
        container.innerHTML = `<p style="color:var(--text-dim); text-align:center;">No games played ${periodLabel}.</p>`;
        return;
    }

    let html = `
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
            <thead>
                <tr style="background:var(--bg-card-light); text-align:left;">
                    <th style="padding:10px 8px; border-radius:10px 0 0 0;">Date</th>
                    <th style="padding:10px 8px;">Day</th>
                    <th style="padding:10px 8px;">Time</th>
                    <th style="padding:10px 8px;">Duration</th>
                    <th style="padding:10px 8px;">Skill</th>
                    <th style="padding:10px 8px;">Mode</th>
                    <th style="padding:10px 8px;">Score</th>
                    <th style="padding:10px 8px; border-radius:0 10px 0 0;">Result</th>
                </tr>
            </thead>
            <tbody>
    `;

    filteredHistory.forEach((entry, idx) => {
        const bgColor = idx % 2 === 0 ? 'transparent' : 'var(--bg-card-light)';
        const scoreColor = entry.percentage >= 80 ? 'var(--correct)' : entry.percentage >= 50 ? 'var(--accent-orange)' : 'var(--incorrect)';
        const rowOpacity = entry.incomplete ? '0.75' : '1';
        const incompleteStyle = entry.incomplete ? 'font-style:italic;' : '';

        // Format date nicely (e.g., "Jan 15")
        let dateDisplay = entry.date || '';
        if (entry.date) {
            const d = new Date(entry.date + 'T00:00:00');
            dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        html += `
            <tr style="background:${bgColor}; opacity:${rowOpacity}; ${incompleteStyle}">
                <td style="padding:8px; color:var(--text-dim);">${dateDisplay}</td>
                <td style="padding:8px; color:var(--text-secondary);">${entry.day || ''}</td>
                <td style="padding:8px; color:var(--text-dim);">${entry.time}</td>
                <td style="padding:8px; color:var(--accent-green);">${entry.duration || ''}</td>
                <td style="padding:8px; color:var(--accent-cyan); font-weight:600;">${entry.challenge}</td>
                <td style="padding:8px; font-weight:600;">${entry.mode}</td>
                <td style="padding:8px; font-weight:800; color:${scoreColor};">${entry.score} <span style="font-size:0.75rem;opacity:0.7;">(${entry.percentage}%)</span></td>
                <td style="padding:8px; font-weight:700;">${entry.result}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Restore UI settings from current state (settings persist in memory during session)
