// literacy-reports.js — CSV export and report rendering for Literacy Quest.
// All output targets a container element or triggers a browser download.
// No external chart libraries — inline SVG only.

import { loadProgress, getStrandSummary, getRecentSessions, STRAND_LABELS } from './literacy-progress.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Escape a single CSV cell value. */
function _csvCell(value) {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
}

/** Build one CSV row from an array of values. */
function _csvRow(values) {
    return values.map(_csvCell).join(',');
}

/** Format a timestamp string for display. */
function _fmtTimestamp(isoStr) {
    if (!isoStr) return '';
    try {
        const d = new Date(isoStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return isoStr;
    }
}

/** Infer grade_level and rit_band from skill_id (best-effort; real values come from SkillAtom at runtime). */
function _inferSkillMeta(skill_id) {
    // Until the full SkillAtom index is loaded, return placeholder strings.
    // The full implementation reads from the atom index when available.
    if (typeof window !== 'undefined' && window.LITERACY_SKILL_INDEX) {
        const atom = window.LITERACY_SKILL_INDEX[skill_id];
        if (atom) {
            return {
                skill_label: atom.skill_statement ? atom.skill_statement.slice(0, 60) : skill_id,
                grade_level: atom.developmental_band || '',
                rit_band: atom.rit_band || 'n/a',
            };
        }
    }
    return { skill_label: skill_id, grade_level: '', rit_band: 'n/a' };
}

/** Accuracy color (green/amber/red) for a 0-100 integer. */
function _accColor(pct) {
    if (pct >= 85) return '#4caf50';
    if (pct >= 70) return '#ff9800';
    return '#e53935';
}

/** Simple inline SVG bar (width px, height px, filled pct 0–100). */
function _svgBar(pct, width, height, color) {
    const filled = Math.round((pct / 100) * width);
    return `<svg width="${width}" height="${height}" aria-hidden="true" style="vertical-align:middle;">
        <rect x="0" y="2" width="${width}" height="${height - 4}" rx="3" fill="#e0e0e0"/>
        <rect x="0" y="2" width="${filled}" height="${height - 4}" rx="3" fill="${color}"/>
    </svg>`;
}

// ---------------------------------------------------------------------------
// CSV Export — FEATURES.md §4.4 + PHASE_1_DECISIONS Q2
// Columns: skill_id, skill_label, grade_level, rit_band, attempts, correct,
//          accuracy, response_time_ms, mechanic_used, timestamp
// ---------------------------------------------------------------------------

/**
 * Generate a CSV Blob from the full per-card history and trigger a download.
 * @param {Record<string, object>} [progress]  optional pre-loaded progress; loads from localStorage if omitted
 */
export function exportSessionCsv(progress) {
    const data = progress || loadProgress();

    const header = _csvRow([
        'skill_id', 'skill_label', 'grade_level', 'rit_band',
        'attempts', 'correct', 'accuracy',
        'response_time_ms', 'mechanic_used', 'timestamp',
    ]);

    const rows = [header];

    for (const [skill_id, rec] of Object.entries(data)) {
        const meta = _inferSkillMeta(skill_id);
        const skillAcc = rec.attempts > 0
            ? (Math.round((rec.correct / rec.attempts) * 100) + '%')
            : '0%';

        for (const card of rec.per_card_history) {
            rows.push(_csvRow([
                skill_id,
                meta.skill_label,
                meta.grade_level,
                meta.rit_band,
                card.attempts,
                card.correct ? 1 : 0,
                skillAcc,
                card.fastest_correct_ms != null ? card.fastest_correct_ms : '',
                card.mechanic,
                card.timestamp,
            ]));
        }
    }

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `literacy-progress-${dateStr}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 200);
}

// ---------------------------------------------------------------------------
// Per-skill report table
// ---------------------------------------------------------------------------

/**
 * Render a per-question history table for a single skill into a container element.
 * Table is sortable by any column header click.
 *
 * @param {string} skill_id
 * @param {HTMLElement} container
 */
export function renderSkillReport(skill_id, container) {
    const progress = loadProgress();
    const rec = progress[skill_id];

    if (!rec || rec.per_card_history.length === 0) {
        container.innerHTML = '<p style="color:var(--text-dim,#888);text-align:center;padding:24px;">No data yet for this skill.</p>';
        return;
    }

    const meta = _inferSkillMeta(skill_id);
    const cards = rec.per_card_history.slice();

    // Sortable state.
    let sortCol = 'timestamp';
    let sortAsc = false;

    function sortAndRender() {
        cards.sort((a, b) => {
            let av = a[sortCol], bv = b[sortCol];
            if (sortCol === 'correct') { av = av ? 1 : 0; bv = bv ? 1 : 0; }
            if (typeof av === 'string') return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
            return sortAsc ? (av - bv) : (bv - av);
        });

        const cols = [
            { key: 'question_id', label: 'Card ID' },
            { key: 'mechanic',    label: 'Mechanic' },
            { key: 'correct',     label: 'Result' },
            { key: 'attempts',    label: 'Attempts' },
            { key: 'fastest_correct_ms', label: 'Fastest (ms)' },
            { key: 'timestamp',   label: 'Time' },
        ];

        const headerCells = cols.map(c => {
            const arrow = c.key === sortCol ? (sortAsc ? ' ▲' : ' ▼') : '';
            return `<th data-col="${c.key}" style="padding:8px 10px;cursor:pointer;user-select:none;background:var(--bg-card-light,#f5f5f5);white-space:nowrap;">${c.label}${arrow}</th>`;
        }).join('');

        const bodyRows = cards.map((card, i) => {
            const bg = i % 2 === 0 ? 'transparent' : 'var(--bg-card-light,#f5f5f5)';
            const resultHtml = card.correct
                ? '<span style="color:#4caf50;font-weight:700;">Correct</span>'
                : '<span style="color:#e53935;font-weight:700;">Incorrect</span>';
            const timeVal = card.fastest_correct_ms != null ? card.fastest_correct_ms : '—';
            return `<tr style="background:${bg};">
                <td style="padding:7px 10px;font-family:monospace;font-size:0.78rem;">${card.question_id}</td>
                <td style="padding:7px 10px;">${card.mechanic}</td>
                <td style="padding:7px 10px;">${resultHtml}</td>
                <td style="padding:7px 10px;text-align:center;">${card.attempts}</td>
                <td style="padding:7px 10px;text-align:center;">${timeVal}</td>
                <td style="padding:7px 10px;color:var(--text-dim,#888);font-size:0.8rem;">${_fmtTimestamp(card.timestamp)}</td>
            </tr>`;
        }).join('');

        container.innerHTML = `
            <div style="margin-bottom:8px;font-size:0.85rem;color:var(--text-dim,#888);">
                Skill: <strong>${meta.skill_label}</strong> &nbsp;|&nbsp; Grade: ${meta.grade_level} &nbsp;|&nbsp; RIT: ${meta.rit_band}
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
                    <thead><tr>${headerCells}</tr></thead>
                    <tbody>${bodyRows}</tbody>
                </table>
            </div>`;

        // Attach sort listeners.
        container.querySelectorAll('th[data-col]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.getAttribute('data-col');
                if (col === sortCol) sortAsc = !sortAsc;
                else { sortCol = col; sortAsc = true; }
                sortAndRender();
            });
        });
    }

    sortAndRender();
}

// ---------------------------------------------------------------------------
// Session timeline (last 14 days, color-coded by daily accuracy)
// ---------------------------------------------------------------------------

/**
 * Render a session timeline into a container.
 * Each day is a pill showing date + skills practiced, color-coded by accuracy.
 *
 * @param {Record<string, object>} [progress]  optional; loads if omitted
 * @param {HTMLElement} container
 */
export function renderSessionTimeline(progress, container) {
    const data = progress || loadProgress();
    const sessions = getRecentSessions(14);

    if (sessions.length === 0) {
        container.innerHTML = '<p style="color:var(--text-dim,#888);text-align:center;padding:20px;">No sessions recorded yet.</p>';
        return;
    }

    const pills = sessions.map(s => {
        const color = _accColor(s.accuracy);
        const dateLabel = new Date(s.date + 'T00:00:00')
            .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const skillCount = s.skills.length;
        const tipSkills = s.skills.slice(0, 5).join(', ') + (s.skills.length > 5 ? '…' : '');
        return `<div title="${tipSkills}" style="
            display:inline-flex;flex-direction:column;align-items:center;
            background:${color}22;border:2px solid ${color};
            border-radius:10px;padding:8px 14px;margin:4px;min-width:80px;
            cursor:default;">
            <span style="font-size:0.75rem;font-weight:700;color:${color};">${dateLabel}</span>
            <span style="font-size:1.1rem;font-weight:800;color:${color};">${s.accuracy}%</span>
            <span style="font-size:0.7rem;color:var(--text-dim,#888);">${skillCount} skill${skillCount !== 1 ? 's' : ''}</span>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:4px;padding:4px 0;">
            ${pills}
        </div>
        <div style="font-size:0.75rem;color:var(--text-dim,#888);margin-top:6px;">
            Color: <span style="color:#4caf50;">&#9632;</span> ≥85% &nbsp;
            <span style="color:#ff9800;">&#9632;</span> 70–84% &nbsp;
            <span style="color:#e53935;">&#9632;</span> &lt;70%
        </div>`;
}

// ---------------------------------------------------------------------------
// Strand summary card
// ---------------------------------------------------------------------------

/**
 * Render an aggregate stats card for a whole strand.
 *
 * @param {string} strand  e.g. "phonics"
 * @param {HTMLElement} container
 */
export function renderStrandSummary(strand, container) {
    const summary = getStrandSummary(strand);
    const color = _accColor(summary.accuracy);
    const barHtml = summary.skills_started > 0 ? _svgBar(summary.accuracy, 200, 18, color) : '';

    container.innerHTML = `
        <div style="padding:16px 20px;background:var(--bg-card,#fff);border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.07);">
            <h3 style="margin:0 0 12px;font-size:1rem;color:var(--accent-cyan,#1e88e5);">${summary.strand_label}</h3>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
                <div style="text-align:center;">
                    <div style="font-size:1.5rem;font-weight:800;">${summary.skills_started}</div>
                    <div style="font-size:0.72rem;color:var(--text-dim,#888);">Skills practiced</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.5rem;font-weight:800;color:#4caf50;">${summary.mastered}</div>
                    <div style="font-size:0.72rem;color:var(--text-dim,#888);">Mastered</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.5rem;font-weight:800;color:#ff9800;">${summary.approaching}</div>
                    <div style="font-size:0.72rem;color:var(--text-dim,#888);">Approaching</div>
                </div>
            </div>
            ${summary.skills_started > 0 ? `
            <div style="display:flex;align-items:center;gap:10px;">
                ${barHtml}
                <span style="font-weight:700;color:${color};">${summary.accuracy}%</span>
            </div>` : '<p style="color:var(--text-dim,#888);margin:0;font-size:0.85rem;">No attempts yet.</p>'}
        </div>`;
}

// ---------------------------------------------------------------------------
// Accuracy trend charts (inline SVG sparklines per skill)
// ---------------------------------------------------------------------------

/**
 * Render a grid of sparkline accuracy charts, one per skill practiced.
 *
 * @param {Record<string, object>} [progress]  optional; loads if omitted
 * @param {HTMLElement} container
 */
export function renderProgressCharts(progress, container) {
    const data = progress || loadProgress();
    const practiced = Object.entries(data).filter(([, rec]) => rec.attempts > 0);

    if (practiced.length === 0) {
        container.innerHTML = '<p style="color:var(--text-dim,#888);text-align:center;padding:20px;">No progress data yet.</p>';
        return;
    }

    const cards = practiced.map(([skill_id, rec]) => {
        const meta = _inferSkillMeta(skill_id);
        const hist = rec.accuracy_history.slice(-10); // last 10 sessions
        const overall = rec.attempts > 0 ? Math.round((rec.correct / rec.attempts) * 100) : 0;
        const sparkHtml = _buildSparkline(hist, 120, 36);
        const masteryColor = {
            not_started: '#9e9e9e',
            introducing: '#e53935',
            developing: '#ff9800',
            approaching_mastery: '#1e88e5',
            mastered: '#4caf50',
        }[rec.mastery_level] || '#9e9e9e';

        return `<div style="
            background:var(--bg-card,#fff);border-radius:10px;padding:12px 14px;
            box-shadow:0 1px 4px rgba(0,0,0,0.08);min-width:180px;flex:1 1 180px;">
            <div style="font-size:0.75rem;color:var(--text-dim,#888);margin-bottom:2px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;" title="${meta.skill_label}">${meta.skill_label}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:1.4rem;font-weight:800;color:${masteryColor};">${overall}%</span>
                <span style="font-size:0.7rem;background:${masteryColor}22;color:${masteryColor};border-radius:20px;padding:2px 8px;font-weight:600;">${rec.mastery_level.replace(/_/g, ' ')}</span>
            </div>
            ${sparkHtml}
            <div style="font-size:0.68rem;color:var(--text-dim,#888);margin-top:4px;">${rec.attempts} attempt${rec.attempts !== 1 ? 's' : ''}</div>
        </div>`;
    }).join('');

    container.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:12px;">${cards}</div>`;
}

/**
 * Build an inline SVG sparkline from accuracy_history buckets.
 * @param {Array<{date, correct, total}>} hist
 * @param {number} width
 * @param {number} height
 * @returns {string}  SVG HTML string
 */
function _buildSparkline(hist, width, height) {
    if (hist.length < 2) {
        return `<svg width="${width}" height="${height}" aria-hidden="true"><text x="0" y="${height - 4}" font-size="10" fill="#9e9e9e">Not enough data</text></svg>`;
    }

    const points = hist.map((b, i) => {
        const acc = b.total > 0 ? b.correct / b.total : 0;
        const x = Math.round((i / (hist.length - 1)) * width);
        const y = Math.round(height - acc * (height - 4) - 2);
        return [x, y];
    });

    const polyline = points.map(([x, y]) => `${x},${y}`).join(' ');

    // Reference lines at 70% and 85%.
    const y70 = Math.round(height - 0.70 * (height - 4) - 2);
    const y85 = Math.round(height - 0.85 * (height - 4) - 2);

    return `<svg width="${width}" height="${height}" aria-label="Accuracy trend">
        <line x1="0" y1="${y70}" x2="${width}" y2="${y70}" stroke="#ff9800" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>
        <line x1="0" y1="${y85}" x2="${width}" y2="${y85}" stroke="#4caf50" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>
        <polyline points="${polyline}" fill="none" stroke="#1e88e5" stroke-width="2" stroke-linejoin="round"/>
        ${points.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#1e88e5"/>`).join('')}
    </svg>`;
}
