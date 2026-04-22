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
}
