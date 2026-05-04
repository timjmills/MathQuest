// literacy-dashboard.js — Literacy Quest progress dashboard.
// Renders into #literacyDashboardView in index.html.
// Pulls data from literacy-progress.js; delegates charts/tables to literacy-reports.js.

import { FEATURES } from '../features.js';
import {
    loadProgress,
    getMasteryLevel,
    getRecentSessions,
    getSkillStats,
    getStrandSummary,
    getSkillsDueForReview,
    STRAND_LABELS,
} from './literacy-progress.js';
import {
    exportSessionCsv,
    renderSkillReport,
    renderSessionTimeline,
    renderStrandSummary,
    renderProgressCharts,
} from './literacy-reports.js';

// All 10 strands (DATA_MODEL.md §13).
const ALL_STRANDS = [
    'phonemic_awareness', 'phonics', 'fluency', 'vocabulary',
    'comprehension_lit', 'comprehension_info',
    'grammar', 'sentence_structure', 'mechanics', 'writing',
];

const MASTERY_LEVELS = ['not_started', 'introducing', 'developing', 'approaching_mastery', 'mastered'];
const MASTERY_LABELS = {
    not_started: 'Not Started',
    introducing: 'Introducing',
    developing: 'Developing',
    approaching_mastery: 'Approaching Mastery',
    mastered: 'Mastered',
};
const MASTERY_COLORS = {
    not_started: '#9e9e9e',
    introducing: '#e53935',
    developing: '#ff9800',
    approaching_mastery: '#1e88e5',
    mastered: '#4caf50',
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _el(tag, attrs, innerHTML) {
    const el = document.createElement(tag);
    if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
            if (k === 'style' || k === 'class' || k === 'id' || k === 'aria-label' || k === 'role') {
                el.setAttribute(k, v);
            } else {
                el[k] = v;
            }
        }
    }
    if (innerHTML !== undefined) el.innerHTML = innerHTML;
    return el;
}

function _section(title, id) {
    const sec = document.createElement('section');
    sec.setAttribute('aria-label', title);
    if (id) sec.id = id;
    sec.style.cssText = 'margin-bottom:28px;';
    const h2 = document.createElement('h2');
    h2.style.cssText = 'font-size:1rem;font-weight:700;color:var(--accent-cyan,#1e88e5);border-bottom:2px solid var(--accent-cyan,#1e88e5);padding-bottom:6px;margin-bottom:14px;';
    h2.textContent = title;
    sec.appendChild(h2);
    return sec;
}

// ---------------------------------------------------------------------------
// Section 1: Header
// ---------------------------------------------------------------------------

function _buildHeader(progress) {
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:24px;padding-bottom:14px;border-bottom:3px solid #1565c0;';

    const titleBlock = document.createElement('div');
    titleBlock.innerHTML = `
        <div style="font-size:0.75rem;font-weight:600;color:#1565c0;letter-spacing:0.06em;text-transform:uppercase;">MATHS QUEST PRO</div>
        <h1 style="margin:2px 0 0;font-size:1.4rem;font-weight:800;color:var(--text-primary,#111);">Literacy Progress Dashboard</h1>`;

    const btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap;';

    const csvBtn = document.createElement('button');
    csvBtn.textContent = 'Download CSV Report';
    csvBtn.style.cssText = 'padding:10px 18px;background:#1565c0;color:#fff;border:none;border-radius:8px;font-size:0.9rem;font-weight:700;cursor:pointer;';
    csvBtn.setAttribute('aria-label', 'Download full progress report as CSV');
    csvBtn.addEventListener('click', () => exportSessionCsv(progress));

    const printBtn = document.createElement('button');
    printBtn.textContent = 'Print';
    printBtn.style.cssText = 'padding:10px 18px;background:var(--bg-card-light,#f5f5f5);color:var(--text-primary,#111);border:1px solid #ccc;border-radius:8px;font-size:0.9rem;cursor:pointer;';
    printBtn.setAttribute('aria-label', 'Print this dashboard');
    printBtn.addEventListener('click', () => window.print());

    const backBtn = document.createElement('button');
    backBtn.textContent = 'Back to Hub';
    backBtn.style.cssText = 'padding:10px 18px;background:transparent;color:var(--text-secondary,#555);border:1px solid #ccc;border-radius:8px;font-size:0.9rem;cursor:pointer;';
    backBtn.setAttribute('aria-label', 'Return to Quest Hub');
    backBtn.addEventListener('click', () => {
        if (typeof window.goToHub === 'function') window.goToHub();
        else if (typeof window.showView === 'function') window.showView('questHubView');
    });

    btnGroup.append(csvBtn, printBtn, backBtn);
    header.append(titleBlock, btnGroup);
    return header;
}

// ---------------------------------------------------------------------------
// Section 2: Mastery overview tiles
// ---------------------------------------------------------------------------

function _buildMasteryTiles(progress) {
    const sec = _section('Mastery Overview');
    const counts = Object.fromEntries(MASTERY_LEVELS.map(l => [l, 0]));

    for (const rec of Object.values(progress)) {
        if (counts[rec.mastery_level] !== undefined) counts[rec.mastery_level]++;
    }

    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;';

    MASTERY_LEVELS.forEach(level => {
        const color = MASTERY_COLORS[level];
        const tile = document.createElement('div');
        tile.style.cssText = `flex:1 1 140px;background:${color}15;border:2px solid ${color};border-radius:12px;padding:14px 16px;text-align:center;`;
        tile.innerHTML = `
            <div style="font-size:2rem;font-weight:800;color:${color};">${counts[level]}</div>
            <div style="font-size:0.75rem;font-weight:600;color:${color};">${MASTERY_LABELS[level]}</div>`;
        grid.appendChild(tile);
    });

    sec.appendChild(grid);
    return sec;
}

// ---------------------------------------------------------------------------
// Section 3: Strand summary cards
// ---------------------------------------------------------------------------

function _buildStrandCards(progress) {
    const sec = _section('Strand Overview');
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;';

    ALL_STRANDS.forEach(strand => {
        const wrapper = document.createElement('div');
        renderStrandSummary(strand, wrapper);

        // Make card clickable — opens drill-down modal.
        wrapper.style.cursor = 'pointer';
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('aria-label', `Open ${STRAND_LABELS[strand] || strand} detail`);
        const clickHandler = () => _openStrandModal(strand, progress);
        wrapper.addEventListener('click', clickHandler);
        wrapper.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clickHandler(); } });

        grid.appendChild(wrapper);
    });

    sec.appendChild(grid);
    return sec;
}

// ---------------------------------------------------------------------------
// Section 4: Recent sessions timeline (last 14 days)
// ---------------------------------------------------------------------------

function _buildTimeline(progress) {
    const sec = _section('Recent Sessions (Last 14 Days)', 'lq-session-timeline');
    renderSessionTimeline(progress, sec);
    return sec;
}

// ---------------------------------------------------------------------------
// Section 5: Skills due for spaced review
// ---------------------------------------------------------------------------

function _buildReviewQueue() {
    const sec = _section('Due for Review');
    const due = getSkillsDueForReview();

    if (due.length === 0) {
        sec.innerHTML += '<p style="color:var(--text-dim,#888);">No skills due for review right now.</p>';
        return sec;
    }

    const list = document.createElement('ul');
    list.setAttribute('role', 'list');
    list.style.cssText = 'list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;';

    due.forEach(skill_id => {
        const stats = getSkillStats(skill_id);
        const li = document.createElement('li');
        li.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:var(--bg-card,#fff);border-radius:8px;padding:10px 14px;box-shadow:0 1px 3px rgba(0,0,0,0.06);';

        const label = document.createElement('span');
        label.style.cssText = 'font-weight:600;font-size:0.88rem;';
        label.textContent = skill_id;

        const meta = document.createElement('span');
        meta.style.cssText = 'font-size:0.78rem;color:var(--text-dim,#888);';
        meta.textContent = `${stats.accuracy}% accuracy — ${stats.attempts} attempt${stats.attempts !== 1 ? 's' : ''}`;

        const reviewBtn = document.createElement('button');
        reviewBtn.textContent = 'Review Now';
        reviewBtn.style.cssText = 'padding:5px 12px;background:#1e88e5;color:#fff;border:none;border-radius:6px;font-size:0.78rem;cursor:pointer;';
        reviewBtn.addEventListener('click', () => {
            // Wire to the literacy game start when the session layer exists.
            if (typeof window.startLiteracySession === 'function') {
                window.startLiteracySession(skill_id);
            } else {
                console.log(`literacy-dashboard: startLiteracySession('${skill_id}') — not yet wired`);
            }
        });

        li.append(label, meta, reviewBtn);
        list.appendChild(li);
    });

    sec.appendChild(list);
    return sec;
}

// ---------------------------------------------------------------------------
// Section 6: Per-skill charts
// ---------------------------------------------------------------------------

function _buildCharts(progress) {
    const sec = _section('Accuracy Trends by Skill', 'lq-progress-charts');
    renderProgressCharts(progress, sec);
    return sec;
}

// ---------------------------------------------------------------------------
// Strand drill-down modal
// ---------------------------------------------------------------------------

function _openStrandModal(strand, progress) {
    // Remove any existing modal.
    const existing = document.getElementById('lq-strand-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'lq-strand-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `${STRAND_LABELS[strand] || strand} detail`);
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:var(--bg-world,#fff);border-radius:16px;padding:24px;max-width:640px;width:100%;max-height:80vh;overflow-y:auto;position:relative;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.setAttribute('aria-label', 'Close strand detail');
    closeBtn.style.cssText = 'position:absolute;top:14px;right:14px;background:transparent;border:none;font-size:1.1rem;cursor:pointer;color:var(--text-secondary,#555);';
    closeBtn.addEventListener('click', () => overlay.remove());

    const summaryWrapper = document.createElement('div');
    renderStrandSummary(strand, summaryWrapper);

    // Per-skill rows for this strand.
    const strandSkills = Object.entries(progress)
        .filter(([sid]) => sid.startsWith(strand + '_'));

    let skillHtml = '';
    if (strandSkills.length > 0) {
        const rows = strandSkills.map(([sid, rec]) => {
            const acc = rec.attempts > 0 ? Math.round((rec.correct / rec.attempts) * 100) : 0;
            const col = acc >= 85 ? '#4caf50' : acc >= 70 ? '#ff9800' : '#e53935';
            return `<tr>
                <td style="padding:7px 8px;font-size:0.82rem;">${sid}</td>
                <td style="padding:7px 8px;text-align:center;font-weight:700;color:${col};">${acc}%</td>
                <td style="padding:7px 8px;text-align:center;">${rec.attempts}</td>
                <td style="padding:7px 8px;font-size:0.78rem;">${MASTERY_LABELS[rec.mastery_level] || rec.mastery_level}</td>
            </tr>`;
        }).join('');
        skillHtml = `<table style="width:100%;border-collapse:collapse;font-size:0.85rem;margin-top:16px;">
            <thead><tr style="background:var(--bg-card-light,#f5f5f5);">
                <th style="padding:8px;text-align:left;">Skill</th>
                <th style="padding:8px;">Accuracy</th>
                <th style="padding:8px;">Attempts</th>
                <th style="padding:8px;">Mastery</th>
            </tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    }

    panel.append(closeBtn, summaryWrapper);
    if (skillHtml) panel.insertAdjacentHTML('beforeend', skillHtml);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Dismiss on overlay click.
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    // Keyboard dismiss.
    overlay.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.remove(); });
    closeBtn.focus();
}

// ---------------------------------------------------------------------------
// Top-level composer
// ---------------------------------------------------------------------------

/**
 * Render the full literacy dashboard into the given container element.
 * Replaces any existing content.
 *
 * @param {HTMLElement} container  e.g. document.getElementById('literacyDashboardView')
 */
export function renderLiteracyDashboard(container) {
    if (!container) return;
    container.innerHTML = '';

    const progress = loadProgress();

    const inner = document.createElement('div');
    inner.style.cssText = 'max-width:900px;margin:0 auto;padding:20px 16px 40px;';

    inner.appendChild(_buildHeader(progress));
    inner.appendChild(_buildMasteryTiles(progress));
    inner.appendChild(_buildStrandCards(progress));
    inner.appendChild(_buildTimeline(progress));
    inner.appendChild(_buildReviewQueue());
    inner.appendChild(_buildCharts(progress));

    container.appendChild(inner);
}
