// MAP Test Practice — results report (strengths / needs-work / domain bars).
//
// Replaces the placeholder Ready-to-Learn columns with a real per-skill
// performance report aggregated from state.lastMapResult.history.

import { state } from './state.js';
import { showView } from './navigation.js';
import {
    SKILL_FULL_LABELS, getCategoryForSkill, getDomainByCategory,
    DOMAINS, SKILLS,
} from './data.js';

const DOMAINS_ORDER = ['OA', 'NO', 'MD', 'G'];
const DOMAIN_LABELS = {
    OA: 'Operations & Algebra',
    NO: 'Number & Operations',
    MD: 'Measurement & Data',
    G: 'Geometry',
};

// NWEA 2020 Math norms — mean RIT and SD by grade and season.
// Source: MAP_MODE_PLAN.md §2.1 (NWEA 2020 Math norms tables).
const NORMS_2020 = {
    K:  { fall: { mean: 139.56, sd: 12.45 }, winter: { mean: 150.13, sd: 11.94 }, spring: { mean: 157.11, sd: 12.03 } },
    1:  { fall: { mean: 160.05, sd: 12.43 }, winter: { mean: 170.18, sd: 12.59 }, spring: { mean: 176.40, sd: 13.18 } },
    2:  { fall: { mean: 175.04, sd: 12.98 }, winter: { mean: 184.07, sd: 13.01 }, spring: { mean: 189.42, sd: 13.44 } },
    3:  { fall: { mean: 188.48, sd: 13.45 }, winter: { mean: 196.23, sd: 13.64 }, spring: { mean: 201.08, sd: 14.11 } },
    4:  { fall: { mean: 199.55, sd: 14.40 }, winter: { mean: 206.05, sd: 14.90 }, spring: { mean: 210.51, sd: 15.56 } },
    5:  { fall: { mean: 209.13, sd: 15.19 }, winter: { mean: 214.70, sd: 15.88 }, spring: { mean: 218.75, sd: 16.70 } },
};

const GRADE_LABELS = {
    K: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5',
};
const SEASON_LABELS = { fall: 'Fall', winter: 'Winter', spring: 'Spring' };

function gradeBadge(rit, grade, season) {
    const norm = NORMS_2020[grade] && NORMS_2020[grade][season];
    if (!norm) return { label: 'No norm data', cls: 'neutral', diff: 0 };
    const diff = rit - norm.mean;
    if (Math.abs(diff) <= 5) {
        return { label: '🎯 On Grade Level', cls: 'on-grade', diff };
    }
    if (diff > 5) {
        return { label: `🚀 Above Grade Level (+${Math.round(diff)})`, cls: 'above-grade', diff };
    }
    return { label: `📚 Building Skills (${Math.round(diff)} points to grade level)`, cls: 'below-grade', diff };
}

function percentileEstimate(rit, grade, season) {
    const norm = NORMS_2020[grade] && NORMS_2020[grade][season];
    if (!norm || !norm.sd) return null;
    const z = (rit - norm.mean) / norm.sd;
    // Approximate normal CDF via tanh-based sigmoid (Polya approximation).
    const p = 0.5 * (1 + Math.tanh(z * Math.sqrt(2 / Math.PI)));
    return Math.max(1, Math.min(99, Math.round(p * 100)));
}

function currentSeason() {
    const m = new Date().getMonth(); // 0 = Jan
    if (m >= 8 || m <= 0) return 'fall';   // Sep–Jan
    if (m >= 1 && m <= 3) return 'winter'; // Feb–Apr
    return 'spring';                       // May–Aug
}

function getSavedGrade() {
    try {
        if (typeof localStorage !== 'undefined') {
            const v = localStorage.getItem('mathquest_grade');
            if (v && (NORMS_2020[v] || v === 'K')) return v;
        }
    } catch (_) { /* ignore */ }
    // Cookie fallback
    try {
        if (typeof document !== 'undefined' && document.cookie) {
            const m = document.cookie.match(/(?:^|;\s*)mathquest_grade=([^;]+)/);
            if (m && m[1] && NORMS_2020[m[1]]) return m[1];
        }
    } catch (_) { /* ignore */ }
    return 'K';
}

function saveGrade(grade) {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mathquest_grade', grade);
        }
    } catch (_) { /* ignore */ }
}

function escapeHTML(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getSkillLabel(skillId) {
    if (SKILL_FULL_LABELS && SKILL_FULL_LABELS[skillId]) return SKILL_FULL_LABELS[skillId];
    // Fallback: search SKILLS arrays directly
    for (const arr of Object.values(SKILLS || {})) {
        if (!Array.isArray(arr)) continue;
        const found = arr.find(s => s && s.v === skillId);
        if (found && found.l) return found.l;
    }
    return skillId;
}

/**
 * Aggregate state.lastMapResult.history by skillId into:
 *   [{ skillId, categoryId, domain, items, correct, rate, label }, ...]
 */
function buildSkillStats(history) {
    const stats = {};
    for (const h of (history || [])) {
        if (!h || !h.skillId) continue;
        if (!stats[h.skillId]) {
            stats[h.skillId] = {
                skillId: h.skillId,
                categoryId: h.categoryId,
                domain: h.domain,
                items: 0,
                correct: 0,
            };
        }
        stats[h.skillId].items++;
        if (h.correct) stats[h.skillId].correct++;
    }
    return Object.values(stats).map(s => ({
        ...s,
        rate: s.items > 0 ? s.correct / s.items : 0,
        label: getSkillLabel(s.skillId),
    }));
}

function domainBadge(d) {
    if (!d) return '';
    return `<span class="domain-badge ${escapeHTML(d)}">${escapeHTML(d)}</span>`;
}

function renderSkillRow(s, opts) {
    const opts2 = opts || {};
    const variant = opts2.variant || '';
    const showPracticeBtn = !!opts2.showPracticeBtn;
    const pct = Math.round(s.rate * 100);
    const score = `${s.correct} of ${s.items} correct${s.items >= 2 ? ` (${pct}%)` : ''}`;
    const btnHTML = showPracticeBtn
        ? `<button class="practice-btn" onclick="practiceMapSkill('${escapeHTML(s.skillId)}')" aria-label="Practice ${escapeHTML(s.label)}">Practice this</button>`
        : '';
    return `
        <div class="rit-skill-row ${variant}">
            <div class="skill-info">
                <div class="skill-label">${escapeHTML(s.label)}</div>
                <div class="skill-score">${escapeHTML(score)}</div>
            </div>
            ${domainBadge(s.domain)}
            ${btnHTML}
        </div>
    `;
}

function renderEmptyState(msg) {
    return `<div class="rit-skill-empty">${escapeHTML(msg)}</div>`;
}

function classifyDomainBar(rate) {
    if (rate >= 0.75) return 'strong';
    if (rate >= 0.5) return 'medium';
    return 'weak';
}

function renderDomainBars(perDomain) {
    return DOMAINS_ORDER.map(d => {
        const p = perDomain[d];
        if (!p || !p.items) {
            return `
                <div class="domain-bar-row">
                    <div class="domain-name">${escapeHTML(d)}</div>
                    <div class="domain-bar-track"><div class="domain-bar-fill weak" style="width:0%"></div></div>
                    <div class="domain-bar-pct">—</div>
                    <div class="domain-bar-rit">—</div>
                </div>
            `;
        }
        const rate = p.correct / p.items;
        const pct = Math.round(rate * 100);
        const cls = classifyDomainBar(rate);
        return `
            <div class="domain-bar-row" title="${escapeHTML(DOMAIN_LABELS[d] || d)} — ${p.correct}/${p.items} correct">
                <div class="domain-name">${escapeHTML(d)} <span class="domain-bar-items">(${p.items})</span></div>
                <div class="domain-bar-track"><div class="domain-bar-fill ${cls}" style="width:${pct}%"></div></div>
                <div class="domain-bar-pct">${pct}%</div>
                <div class="domain-bar-rit">RIT ${p.rit}</div>
            </div>
        `;
    }).join('');
}

function buildEncouragingMessage(rate, items) {
    if (!items) return "Try a session and see how you do!";
    if (rate >= 0.8) return "Amazing work! You're really mastering these skills.";
    if (rate >= 0.6) return "Good effort! With more practice on the highlighted skills, you'll level up.";
    if (rate >= 0.4) return "Keep practicing — every attempt makes you better.";
    return "Don't give up. Try the practice items below to build confidence.";
}

export function renderMapResults() {
    const r = state.lastMapResult;

    const ritEl = document.getElementById('mapFinalRit');
    const seEl = document.getElementById('mapFinalSE');
    const perDom = document.getElementById('mapPerDomain');
    const strengthsEl = document.getElementById('mapStrengths');
    const needsWorkEl = document.getElementById('mapNeedsWork');
    const domainBarsEl = document.getElementById('mapDomainBars');
    const summaryMsgEl = document.getElementById('mapSummaryMsg');
    const rtl = document.getElementById('mapReadyToLearn');

    if (!r) {
        if (ritEl) ritEl.textContent = '--';
        if (seEl) seEl.textContent = '± --';
        if (perDom) perDom.innerHTML = '';
        if (strengthsEl) strengthsEl.innerHTML = renderEmptyState('No session data yet.');
        if (needsWorkEl) needsWorkEl.innerHTML = renderEmptyState('No session data yet.');
        if (domainBarsEl) domainBarsEl.innerHTML = '';
        if (summaryMsgEl) summaryMsgEl.textContent = '';
        if (rtl) rtl.innerHTML = '';
        return;
    }

    if (ritEl) ritEl.textContent = String(r.finalRit);
    if (seEl) seEl.textContent = `± ${r.se}`;

    // Total session duration (M:SS), shown under the RIT card. The HTML is
    // locked, so we inject/update a child of the .rit-overall block via DOM.
    if (typeof r.durationMs === 'number' && r.durationMs > 0) {
        const overall = document.querySelector('#mapResultsView .rit-overall');
        if (overall) {
            let durEl = overall.querySelector('.rit-duration');
            if (!durEl) {
                durEl = document.createElement('div');
                durEl.className = 'rit-duration';
                overall.appendChild(durEl);
            }
            const totalSec = Math.max(0, Math.round(r.durationMs / 1000));
            const m = Math.floor(totalSec / 60);
            const s = totalSec % 60;
            durEl.textContent = `Total time: ${m}:${String(s).padStart(2, '0')}`;
        }
    }

    if (perDom) {
        perDom.innerHTML = DOMAINS_ORDER.map(d => {
            const p = r.perDomain[d];
            if (!p) {
                return `<div class="rit-domain-card">
                    <div class="dname">${escapeHTML(DOMAIN_LABELS[d])}</div>
                    <div class="drit">—</div>
                    <div class="dsub">No items</div>
                </div>`;
            }
            return `<div class="rit-domain-card">
                <div class="dname">${escapeHTML(DOMAIN_LABELS[d])}</div>
                <div class="drit">${p.rit}</div>
                <div class="dsub">${p.correct}/${p.items} correct</div>
            </div>`;
        }).join('');
    }

    // Build per-skill stats
    const skillList = buildSkillStats(r.history);

    // Strengths: rate >= 0.5, sort by rate desc, then raw correct desc, then items desc
    const strengths = skillList
        .filter(s => s.rate >= 0.5)
        .sort((a, b) =>
            (b.rate - a.rate) ||
            (b.correct - a.correct) ||
            (b.items - a.items)
        )
        .slice(0, 5);

    // Needs work: rate < 0.75 AND has at least one wrong attempt; sort by rate asc, then items desc
    const needsWork = skillList
        .filter(s => s.items >= 1 && s.rate < 0.75 && s.correct < s.items)
        .sort((a, b) =>
            (a.rate - b.rate) ||
            (b.items - a.items)
        )
        .slice(0, 5);

    if (strengthsEl) {
        strengthsEl.innerHTML = strengths.length
            ? strengths.map(s => renderSkillRow(s, { variant: 'strong', showPracticeBtn: false })).join('')
            : renderEmptyState('No clear strengths yet — try a longer session.');
    }

    if (needsWorkEl) {
        needsWorkEl.innerHTML = needsWork.length
            ? needsWork.map(s => renderSkillRow(s, { variant: 'weak', showPracticeBtn: true })).join('')
            : renderEmptyState('Great — no skills need extra work right now!');
    }

    if (domainBarsEl) {
        domainBarsEl.innerHTML = renderDomainBars(r.perDomain || {});
    }

    if (summaryMsgEl) {
        const totalItems = skillList.reduce((n, s) => n + s.items, 0);
        const totalCorrect = skillList.reduce((n, s) => n + s.correct, 0);
        const overallRate = totalItems ? totalCorrect / totalItems : 0;
        summaryMsgEl.textContent = buildEncouragingMessage(overallRate, totalItems);
    }

    // Hide the legacy Ready-to-Learn block (kept in HTML for backward compat)
    if (rtl) rtl.innerHTML = '';
    const legacy = document.querySelector('#mapResultsView .rit-ready');
    if (legacy) legacy.style.display = 'none';

    // Inject (or update) the grade-level context section with a badge + percentile.
    renderGradeContextSection(r.finalRit);
}

/**
 * Insert or refresh the .rit-grade-context section after .rit-summary.
 * Builds the badge + percentile + grade/season selectors and wires them up.
 */
function renderGradeContextSection(finalRit) {
    if (typeof document === 'undefined') return;
    const view = document.getElementById('mapResultsView');
    if (!view) return;

    let section = view.querySelector('.rit-grade-context');
    if (!section) {
        section = document.createElement('section');
        section.className = 'rit-grade-context';
        section.style.cssText = 'padding:20px;max-width:900px;margin:0 auto;text-align:center;';

        const gradeOpts = ['K', '1', '2', '3', '4', '5']
            .map(g => `<option value="${g}">${escapeHTML(GRADE_LABELS[g])}</option>`)
            .join('');
        const seasonOpts = ['fall', 'winter', 'spring']
            .map(s => `<option value="${s}">${escapeHTML(SEASON_LABELS[s])}</option>`)
            .join('');

        section.innerHTML = `
            <div class="rit-grade-controls" style="margin-bottom:12px;font-size:0.95rem;">
                Compare to grade level:
                <select id="mapGradeCompare" onchange="window.updateMapGradeContext()" style="margin:0 6px;padding:4px 8px;border-radius:6px;border:1px solid #ccc;">${gradeOpts}</select>
                Season:
                <select id="mapSeasonCompare" onchange="window.updateMapGradeContext()" style="margin:0 6px;padding:4px 8px;border-radius:6px;border:1px solid #ccc;">${seasonOpts}</select>
            </div>
            <div id="mapGradeBadge" class="grade-badge" style="display:inline-block;padding:12px 24px;border-radius:12px;font-size:1.2rem;font-weight:700;margin-bottom:8px;"></div>
            <div id="mapPercentileText" style="font-size:1.05rem;color:#555;"></div>
        `;

        // Insert immediately after the .rit-summary section
        const summary = view.querySelector('.rit-summary');
        if (summary && summary.parentNode) {
            summary.parentNode.insertBefore(section, summary.nextSibling);
        } else {
            view.appendChild(section);
        }
    }

    // Apply default grade (saved or 'K') and current season
    const gradeSel = section.querySelector('#mapGradeCompare');
    const seasonSel = section.querySelector('#mapSeasonCompare');
    if (gradeSel && !gradeSel.dataset.userTouched) {
        gradeSel.value = getSavedGrade();
    }
    if (seasonSel && !seasonSel.dataset.userTouched) {
        seasonSel.value = currentSeason();
    }

    // Stash the current finalRit on the section for later refreshes.
    section.dataset.finalRit = String(finalRit != null ? finalRit : '');

    updateMapGradeContext();
}

/**
 * Recompute and re-render the grade badge + percentile based on the
 * currently selected grade and season. Called on initial render and on
 * each selector change.
 */
export function updateMapGradeContext() {
    if (typeof document === 'undefined') return;
    const view = document.getElementById('mapResultsView');
    if (!view) return;
    const section = view.querySelector('.rit-grade-context');
    if (!section) return;

    const gradeSel = section.querySelector('#mapGradeCompare');
    const seasonSel = section.querySelector('#mapSeasonCompare');
    const badgeEl = section.querySelector('#mapGradeBadge');
    const pctEl = section.querySelector('#mapPercentileText');

    const grade = (gradeSel && gradeSel.value) || 'K';
    const season = (seasonSel && seasonSel.value) || 'fall';

    // Mark selectors as user-touched so subsequent re-renders don't override.
    if (gradeSel) gradeSel.dataset.userTouched = '1';
    if (seasonSel) seasonSel.dataset.userTouched = '1';

    // Persist the grade choice for next session
    saveGrade(grade);

    const ritRaw = (state.lastMapResult && state.lastMapResult.finalRit != null)
        ? state.lastMapResult.finalRit
        : Number(section.dataset.finalRit);
    const rit = Number(ritRaw);

    if (!Number.isFinite(rit)) {
        if (badgeEl) {
            badgeEl.textContent = 'No RIT yet';
            badgeEl.className = 'grade-badge neutral';
            badgeEl.style.background = '#f0f0f0';
            badgeEl.style.color = '#666';
        }
        if (pctEl) pctEl.textContent = '';
        return;
    }

    const badge = gradeBadge(rit, grade, season);
    const pct = percentileEstimate(rit, grade, season);

    if (badgeEl) {
        badgeEl.textContent = badge.label;
        badgeEl.className = `grade-badge ${badge.cls}`;
        // Inline color fallbacks in case base.css doesn't define these classes
        const palette = {
            'on-grade':    { bg: '#d1f5e0', fg: '#1b5e20', border: '#4caf50' },
            'above-grade': { bg: '#dbeafe', fg: '#0d47a1', border: '#1e88e5' },
            'below-grade': { bg: '#fff3e0', fg: '#7c4a03', border: '#ff9800' },
            'neutral':     { bg: '#f0f0f0', fg: '#666',    border: '#ccc'    },
        };
        const p = palette[badge.cls] || palette.neutral;
        badgeEl.style.background = p.bg;
        badgeEl.style.color = p.fg;
        badgeEl.style.border = `2px solid ${p.border}`;
    }

    if (pctEl) {
        const norm = NORMS_2020[grade] && NORMS_2020[grade][season];
        if (pct == null || !norm) {
            pctEl.textContent = `No norm data for ${GRADE_LABELS[grade] || grade} (${SEASON_LABELS[season] || season}).`;
        } else if (pct >= 90) {
            pctEl.textContent = `Top ${100 - pct}% of ${GRADE_LABELS[grade]} students (around the ${pct}th percentile).`;
        } else if (pct >= 50) {
            pctEl.textContent = `Around the ${pct}th percentile of ${GRADE_LABELS[grade]} students.`;
        } else {
            pctEl.textContent = `Around the ${pct}th percentile of ${GRADE_LABELS[grade]} students. Keep practicing!`;
        }
    }
}

/**
 * Add a skill to the queue and route the user into Practice mode.
 * Wired to onclick handlers in the needs-work section.
 */
export function practiceMapSkill(skillId) {
    if (!skillId) return;
    const categoryId = getCategoryForSkill(skillId);
    if (!categoryId) {
        if (typeof window.showNotification === 'function') {
            window.showNotification('Could not find that skill.', 'error');
        }
        return;
    }
    const domainId = getDomainByCategory(categoryId);
    const dom = domainId && DOMAINS[domainId];
    const cat = (dom && Array.isArray(dom.categories))
        ? dom.categories.find(c => c.id === categoryId)
        : null;

    const skillLabel = getSkillLabel(skillId);
    const categoryIcon = (cat && cat.icon) || '📚';
    const categoryName = (cat && cat.name) || categoryId;
    const domainColor = (dom && dom.color) || '#8b5cf6';

    // Prefer the UnifiedSkills manager if available (keeps all UI in sync)
    if (typeof window.UnifiedSkills === 'object' && window.UnifiedSkills) {
        try {
            window.UnifiedSkills.clear();
            window.UnifiedSkills.add({
                domainId: domainId || 'number_operations',
                categoryId,
                skillId,
                skillLabel,
                categoryIcon,
                categoryName,
                domainColor,
            });
        } catch (err) {
            console.warn('[MAP results] UnifiedSkills.add failed, falling back:', err);
            window.skillQueue = [{
                domainId, categoryId, skillId, skillLabel,
                categoryIcon, categoryName, domainColor,
            }];
        }
    } else {
        window.skillQueue = [{
            domainId, categoryId, skillId, skillLabel,
            categoryIcon, categoryName, domainColor,
        }];
    }

    // Also set state.skill / state.category so a no-arg generateQuestion()
    // dispatches correctly even if startGame() doesn't pull from the queue.
    if (state) {
        state.skill = skillId;
        state.category = categoryId;
        state.gameMode = 'practice';
    }

    if (typeof window.startGame === 'function') {
        window.startGame();
    } else {
        if (typeof window.showNotification === 'function') {
            window.showNotification('Game system not available.', 'error');
        }
    }
}

export function printMapSession() {
    const r = state.lastMapResult;
    if (!r || !r.history || !r.history.length) {
        alert('No MAP session results to print.');
        return;
    }
    // Unique skills exercised during the just-finished session
    const seen = new Set();
    const skills = [];
    for (const h of r.history) {
        if (h && h.skillId && !seen.has(h.skillId)) {
            seen.add(h.skillId);
            skills.push(h.skillId);
        }
    }
    if (!skills.length) {
        alert('No skills recorded for this session.');
        return;
    }
    if (typeof window.printMapSkillsAsWorksheet === 'function') {
        window.printMapSkillsAsWorksheet(skills, r.items || skills.length * 4);
    } else {
        alert('Print system not available.');
    }
}

export function restartMapSession() {
    showView('mapSelectorView');
}

// Expose practiceMapSkill on window so the inline onclick="practiceMapSkill(...)"
// in the rendered needs-work rows can reach it. Done here (not in globals.js)
// because the results module owns the button and globals.js is locked.
if (typeof window !== 'undefined') {
    window.practiceMapSkill = practiceMapSkill;
    window.updateMapGradeContext = updateMapGradeContext;
}
