// literacy-skill-browser.js — Skill browser for Literacy Quest.
//
// Provides a 2-panel browse-and-pick screen between a strand home and
// the practice session.  Students can filter by grade band, sub-strand,
// RIT range, and free-text, then launch any atom directly.
//
// Exports (all attached to window by literacy-init.js):
//   renderSkillBrowser(strand, container)   — render grid + filters
//   openReadingSkillBrowser()               — navigate to readingSkillBrowserView
//   openLanguageSkillBrowser()              — navigate to languageSkillBrowserView

import { FEATURES } from '../features.js';
import { showView } from '../navigation.js';
import { READING_SKILLS, LANGUAGE_SKILLS } from '../../../data/literacy-skills/index.js';
import { getMasteryLevel } from './literacy-progress.js';
import { isAtomPlayable } from './coming-soon.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** HTML-escape a value for safe embedding in attributes and text. */
function _esc(str) {
    if (typeof str !== 'string') str = String(str ?? '');
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/** Truncate a string to maxLen chars, appending ellipsis if needed. */
function _trunc(str, maxLen) {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}

// Mastery level → human label + CSS class
const MASTERY_META = {
    'not_started':        { label: 'Not started',        cls: 'lq-sb-mastery--none' },
    'introducing':        { label: 'Introducing',        cls: 'lq-sb-mastery--intro' },
    'developing':         { label: 'Developing',         cls: 'lq-sb-mastery--dev' },
    'approaching_mastery':{ label: 'Approaching',        cls: 'lq-sb-mastery--approach' },
    'mastered':           { label: 'Mastered',           cls: 'lq-sb-mastery--mastered' },
};

// Developmental band → short grade label
const BAND_LABEL = {
    'K':   'K',
    'K-1': 'K-1',
    'K-2': 'K-2',
    '1':   'Gr 1',
    '1-2': 'Gr 1-2',
    '2':   'Gr 2',
    '2-3': 'Gr 2-3',
    '3':   'Gr 3',
    '3-4': 'Gr 3-4',
    '4':   'Gr 4',
    '4-5': 'Gr 4-5',
    '5':   'Gr 5',
    '5-6': 'Gr 5-6',
    '6':   'Gr 6',
};

// ─── Filter helpers ───────────────────────────────────────────────────────────

/**
 * Collect all unique developmental_band values from a skill list.
 * @param {object[]} skills
 * @returns {string[]} sorted bands
 */
function _uniqueBands(skills) {
    const seen = new Set();
    for (const s of skills) {
        if (s.developmental_band) seen.add(s.developmental_band);
    }
    // Sort by first character (K < 1 < 2 … 6); 'K' sorts before digits.
    return [...seen].sort((a, b) => {
        const ka = a.replace(/^K/, '0');
        const kb = b.replace(/^K/, '0');
        return ka.localeCompare(kb, undefined, { numeric: true });
    });
}

/**
 * Collect all unique sub_domain + domain values for the filter dropdown.
 * Returns [{value, label}] sorted alphabetically by label.
 * @param {object[]} skills
 * @returns {{value: string, label: string}[]}
 */
function _uniqueSubDomains(skills) {
    const map = new Map(); // value → label
    for (const s of skills) {
        const key  = s.sub_domain || s.domain || s.strand || '';
        const label = (s.sub_domain || s.domain || s.strand || '')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
        if (key) map.set(key, label);
    }
    return [...map.entries()]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Parse a RIT band string (e.g. "141-150") into [low, high] integers.
 * Returns [0, 999] if unparseable.
 * @param {string|undefined} ritBand
 * @returns {[number, number]}
 */
function _parseRit(ritBand) {
    if (!ritBand) return [0, 999];
    const m = String(ritBand).match(/(\d+)[^0-9]+(\d+)/);
    if (m) return [parseInt(m[1], 10), parseInt(m[2], 10)];
    const n = parseInt(ritBand, 10);
    if (!isNaN(n)) return [n, n];
    return [0, 999];
}

/**
 * Apply active filters to a skill list and return the matching subset.
 * @param {object[]} skills  Full skill list for the strand
 * @param {object}  filters  { band, subDomain, ritMin, ritMax, query }
 * @returns {object[]}
 */
function _applyFilters(skills, filters) {
    const { band, subDomain, ritMin, ritMax, query } = filters;
    const lq = query ? query.toLowerCase().trim() : '';

    return skills.filter(s => {
        // Grade band filter
        if (band && s.developmental_band !== band) return false;

        // Sub-domain filter
        if (subDomain) {
            const sd = s.sub_domain || s.domain || s.strand || '';
            if (sd !== subDomain) return false;
        }

        // RIT band filter
        if (ritMin !== 0 || ritMax !== 999) {
            const [lo, hi] = _parseRit(s.rit_band);
            // Overlap check: skill range [lo,hi] overlaps filter range [ritMin,ritMax]
            if (hi < ritMin || lo > ritMax) return false;
        }

        // Text search: skill_statement, strand, domain, sub_domain
        if (lq) {
            const hay = [
                s.skill_statement || '',
                s.strand || '',
                s.domain || '',
                s.sub_domain || '',
            ].join(' ').toLowerCase();
            if (!hay.includes(lq)) return false;
        }

        return true;
    });
}

// ─── Card builder ─────────────────────────────────────────────────────────────

/**
 * Build the inner HTML for a single skill card.
 * @param {object} atom  SkillAtom
 * @returns {string} HTML string
 */
function _buildCard(atom) {
    const mastery    = getMasteryLevel(atom.skill_id);
    const mastMeta   = MASTERY_META[mastery] || MASTERY_META['not_started'];
    const playable   = isAtomPlayable(atom);

    // Chips
    const gradeChip = atom.developmental_band
        ? `<span class="lq-sb-chip lq-sb-chip--grade">${_esc(BAND_LABEL[atom.developmental_band] || atom.developmental_band)}</span>`
        : '';

    const ritChip = atom.rit_band
        ? `<span class="lq-sb-chip lq-sb-chip--rit">RIT ${_esc(String(atom.rit_band))}</span>`
        : '';

    const subLabel = (atom.sub_domain || atom.domain || atom.strand || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    const subChip = subLabel
        ? `<span class="lq-sb-chip lq-sb-chip--sub">${_esc(subLabel)}</span>`
        : '';

    const mastChip = `<span class="lq-sb-mastery-chip ${_esc(mastMeta.cls)}">${_esc(mastMeta.label)}</span>`;

    const comingSoonBadge = !playable
        ? `<span class="lq-skill-coming-soon-badge" aria-label="Coming soon">Coming soon</span>`
        : '';

    // Play / Coming-soon button
    const actionBtn = playable
        ? `<button
              type="button"
              class="lq-sb-play-btn"
              onclick="if(typeof window.startLiteracyPractice==='function') window.startLiteracyPractice('${_esc(atom.skill_id)}')"
              aria-label="Practice: ${_esc(_trunc(atom.skill_statement, 60))}"
           >Play</button>`
        : `<button
              type="button"
              class="lq-sb-play-btn lq-sb-play-btn--disabled"
              disabled
              aria-label="Coming soon: ${_esc(_trunc(atom.skill_statement, 60))}"
           >Soon</button>`;

    return `
        <div class="lq-skill-card${playable ? '' : ' lq-skill-card--coming-soon'}"
             data-skill-id="${_esc(atom.skill_id)}"
             tabindex="0"
             role="article"
             aria-label="${_esc(_trunc(atom.skill_statement, 80))}">
            ${comingSoonBadge}
            <p class="lq-skill-statement">${_esc(_trunc(atom.skill_statement, 90))}</p>
            <div class="lq-skill-card-meta">
                ${gradeChip}${ritChip}${subChip}
            </div>
            <div class="lq-skill-card-footer">
                ${mastChip}
                ${actionBtn}
            </div>
        </div>`;
}

// ─── Filter bar builder ───────────────────────────────────────────────────────

/**
 * Build and inject the filter bar HTML, wiring change/input events to
 * re-render the grid without a full page reload.
 *
 * @param {object[]}    skills      Full skill list for the strand
 * @param {HTMLElement} filterEl    Container element for filters
 * @param {HTMLElement} gridEl      Container element for the skill grid
 * @param {string}      strand      'reading' | 'language'
 */
function _buildFilterBar(skills, filterEl, gridEl, strand) {
    const bands      = _uniqueBands(skills);
    const subDomains = _uniqueSubDomains(skills);

    const bandOptions = bands.map(b =>
        `<option value="${_esc(b)}">${_esc(BAND_LABEL[b] || b)}</option>`
    ).join('');

    const subOptions = subDomains.map(sd =>
        `<option value="${_esc(sd.value)}">${_esc(sd.label)}</option>`
    ).join('');

    filterEl.innerHTML = `
        <div class="lq-sb-filters" role="search" aria-label="Filter skills">
            <div class="lq-sb-filter-group">
                <label class="lq-sb-filter-label" for="lq-filter-grade-${strand}">Grade</label>
                <select class="lq-sb-filter-select" id="lq-filter-grade-${strand}">
                    <option value="">All grades</option>
                    ${bandOptions}
                </select>
            </div>
            <div class="lq-sb-filter-group">
                <label class="lq-sb-filter-label" for="lq-filter-sub-${strand}">Strand / Topic</label>
                <select class="lq-sb-filter-select" id="lq-filter-sub-${strand}">
                    <option value="">All topics</option>
                    ${subOptions}
                </select>
            </div>
            <div class="lq-sb-filter-group lq-sb-filter-group--search">
                <label class="lq-sb-filter-label" for="lq-filter-search-${strand}">Search</label>
                <input
                    type="search"
                    class="lq-sb-filter-input"
                    id="lq-filter-search-${strand}"
                    placeholder="Type a skill keyword..."
                    aria-label="Search skills"
                />
            </div>
        </div>`;

    // Wire up live filtering
    const gradeEl  = filterEl.querySelector(`#lq-filter-grade-${strand}`);
    const subEl    = filterEl.querySelector(`#lq-filter-sub-${strand}`);
    const searchEl = filterEl.querySelector(`#lq-filter-search-${strand}`);

    function _refresh() {
        const filters = {
            band:      gradeEl  ? gradeEl.value  : '',
            subDomain: subEl    ? subEl.value     : '',
            ritMin:    0,
            ritMax:    999,
            query:     searchEl ? searchEl.value  : '',
        };
        const matched = _applyFilters(skills, filters);
        _renderGrid(matched, gridEl);
    }

    if (gradeEl)  gradeEl.addEventListener('change', _refresh);
    if (subEl)    subEl.addEventListener('change',   _refresh);
    if (searchEl) searchEl.addEventListener('input',  _refresh);
}

// ─── Grid renderer ────────────────────────────────────────────────────────────

/**
 * Render a flat grid of skill cards into `gridEl`.
 * @param {object[]}    skills   Filtered skill atoms to display
 * @param {HTMLElement} gridEl   Target container
 */
function _renderGrid(skills, gridEl) {
    if (!gridEl) return;

    if (skills.length === 0) {
        gridEl.innerHTML = `
            <div class="lq-sb-empty">
                <p>No skills match the current filters. Try clearing a filter.</p>
            </div>`;
        return;
    }

    const html = skills.map(_buildCard).join('');
    gridEl.innerHTML = `<div class="lq-skill-browser-grid" role="list">${html}</div>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Render the skill browser (filter bar + grid) into `container`.
 *
 * @param {'reading' | 'language'} strand
 * @param {HTMLElement} container  Target element (e.g. #readingSkillBrowserBody)
 */
export function renderSkillBrowser(strand, container) {
    if (!container) return;

    const skills = strand === 'language' ? LANGUAGE_SKILLS : READING_SKILLS;

    // Build layout: filter section on top, grid below
    container.innerHTML = `
        <div class="lq-skill-browser-body">
            <div id="lq-sb-filters-${strand}" class="lq-sb-filter-bar"></div>
            <p class="lq-sb-count" id="lq-sb-count-${strand}"></p>
            <div id="lq-sb-grid-${strand}" class="lq-sb-grid-area"></div>
        </div>`;

    const filterEl = container.querySelector(`#lq-sb-filters-${strand}`);
    const gridEl   = container.querySelector(`#lq-sb-grid-${strand}`);
    const countEl  = container.querySelector(`#lq-sb-count-${strand}`);

    // Initial full render (all atoms)
    if (countEl) countEl.textContent = `${skills.length} skills`;

    _buildFilterBar(skills, filterEl, gridEl, strand);
    _renderGrid(skills, gridEl);

    // Update count label when filters change — hook into the existing select/input events
    // by observing DOM mutations on the grid (simple approach: wrap _refresh to also update count)
    const gradeEl  = filterEl && filterEl.querySelector(`#lq-filter-grade-${strand}`);
    const subEl    = filterEl && filterEl.querySelector(`#lq-filter-sub-${strand}`);
    const searchEl = filterEl && filterEl.querySelector(`#lq-filter-search-${strand}`);

    function _updateCount() {
        if (!countEl) return;
        // Count the rendered cards
        const n = gridEl ? gridEl.querySelectorAll('.lq-skill-card').length : 0;
        countEl.textContent = n === skills.length
            ? `${n} skills`
            : `${n} of ${skills.length} skills`;
    }

    // Observe grid for child-list changes to update the count label
    if (typeof MutationObserver !== 'undefined' && gridEl) {
        const obs = new MutationObserver(_updateCount);
        obs.observe(gridEl, { childList: true, subtree: false });
    }

    // Also manually wire count update so the count fires on the first filter change
    function _refreshWithCount() { _updateCount(); }
    if (gradeEl)  gradeEl.addEventListener('change', _refreshWithCount);
    if (subEl)    subEl.addEventListener('change',   _refreshWithCount);
    if (searchEl) searchEl.addEventListener('input',  _refreshWithCount);
}

/**
 * Navigate to the Reading Quest skill browser view and render it.
 */
export function openReadingSkillBrowser() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
    showView('readingSkillBrowserView');
    const body = document.getElementById('readingSkillBrowserBody');
    if (body) renderSkillBrowser('reading', body);
}

/**
 * Navigate to the Language Quest skill browser view and render it.
 */
export function openLanguageSkillBrowser() {
    if (!FEATURES.LITERACY_QUEST_ENABLED) return;
    showView('languageSkillBrowserView');
    const body = document.getElementById('languageSkillBrowserBody');
    if (body) renderSkillBrowser('language', body);
}
