// MAP Test Practice — selector view rendering and chip interactions.
import { state } from './state.js';
import { showView } from './navigation.js';
import { getMapSkillsForBands, getMapDomain } from './data.js';
import { startMapSession } from './map-engine.js';

const K2_BANDS = ['141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220'];
const BANDS_35 = ['141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220', '221-230', '231+'];
const MIXED_BANDS = ['141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220', '221-230', '231+'];
const K2_DEFAULT_BANDS = [];
const DEFAULT_BANDS_35 = [];
const DEFAULT_BANDS_MIXED = [];
const ALL_DOMAINS = ['OA', 'NO', 'MD', 'G'];
const DOMAIN_NAMES = {
    OA: 'Operations & Algebra',
    NO: 'Number & Operations',
    MD: 'Measurement & Data',
    G: 'Geometry',
};

function bandsForTier(tier) {
    if (tier === 'mixed') return MIXED_BANDS;
    return tier === 'k2' ? K2_BANDS : BANDS_35;
}

function defaultBandsForTier(tier) {
    if (tier === 'mixed') return DEFAULT_BANDS_MIXED;
    return tier === 'k2' ? K2_DEFAULT_BANDS : DEFAULT_BANDS_35;
}

function defaultItemCountForTier(tier) {
    if (tier === 'mixed') return 20;
    return tier === 'k2' ? 15 : 20;
}

export function openMapTest(tier) {
    state.mapTier = tier || null;
    state.mapSelectedBands = tier ? defaultBandsForTier(tier).slice() : [];
    state.mapSelectedDomains = ALL_DOMAINS.slice();
    state.mapSessionMode = 'practice';
    state.mapItemCountTarget = defaultItemCountForTier(tier);
    showView('mapSelectorView');
}

export function selectMapTier(tier) {
    state.mapTier = tier;
    state.mapSelectedBands = defaultBandsForTier(tier).slice();
    state.mapSelectedDomains = ALL_DOMAINS.slice();
    state.mapSessionMode = state.mapSessionMode || 'practice';
    state.mapItemCountTarget = defaultItemCountForTier(tier);
    initMapSelector();
}

export function initMapSelector() {
    const tierPicker = document.getElementById('mapTierPicker');
    const bandPicker = document.getElementById('mapBandPicker');
    const domainPicker = document.getElementById('mapDomainPicker');
    const modePicker = document.getElementById('mapModePicker');
    const startSection = document.getElementById('mapStartSection');

    if (!state.mapTier) {
        if (tierPicker) tierPicker.style.display = '';
        [bandPicker, domainPicker, modePicker, startSection].forEach(el => {
            if (el) el.hidden = true;
        });
        return;
    }

    if (tierPicker) tierPicker.style.display = 'none';
    [bandPicker, domainPicker, modePicker, startSection].forEach(el => {
        if (el) el.hidden = false;
    });

    renderBandChips();
    renderDomainChips();
    updateModeToggleUI();
    renderItemSlider();
    updateStartButton();
}

function countSkillsForBand(band) {
    const skills = getMapSkillsForBands([band], state.mapTier);
    if (!state.mapSelectedDomains || state.mapSelectedDomains.length === 0) return 0;
    return skills.filter(id => state.mapSelectedDomains.includes(getMapDomain(id))).length;
}

function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let _bandChipsDelegated = false;
let _domainChipsDelegated = false;

function renderBandChips() {
    const container = document.getElementById('mapBandChips');
    if (!container) return;
    const bands = bandsForTier(state.mapTier);
    let html = '';
    html += `<button type="button" class="rit-chip" data-action="select-all" style="background:#e3f2fd;border-color:#1565c0;color:#1565c0;">Select all</button>`;
    html += `<button type="button" class="rit-chip" data-action="clear" style="background:#ffebee;border-color:#c62828;color:#c62828;">Clear</button>`;
    for (const band of bands) {
        const selected = state.mapSelectedBands.includes(band);
        const count = countSkillsForBand(band);
        html += `<button type="button" class="rit-chip${selected ? ' selected' : ''}" data-band="${escapeAttr(band)}" data-action="toggle-band">RIT ${band} <span class="chip-count">${count} skills</span></button>`;
    }
    container.innerHTML = html;

    if (!_bandChipsDelegated) {
        container.addEventListener('click', (e) => {
            const btn = e.target && e.target.closest && e.target.closest('button[data-action]');
            if (!btn || !container.contains(btn)) return;
            e.preventDefault();
            e.stopPropagation();
            const action = btn.dataset.action;
            if (action === 'select-all') selectAllMapBands();
            else if (action === 'clear') clearMapBands();
            else if (action === 'toggle-band') {
                const band = btn.dataset.band;
                if (band) toggleMapBand(band);
            }
        });
        _bandChipsDelegated = true;
    }
}

function renderDomainChips() {
    const container = document.getElementById('mapDomainChips');
    if (!container) return;
    let html = '';
    for (const d of ALL_DOMAINS) {
        const selected = state.mapSelectedDomains.includes(d);
        html += `<button type="button" class="domain-chip${selected ? ' selected' : ''}" data-domain="${escapeAttr(d)}" data-action="toggle-domain">${d} — ${DOMAIN_NAMES[d]}</button>`;
    }
    container.innerHTML = html;

    if (!_domainChipsDelegated) {
        container.addEventListener('click', (e) => {
            const btn = e.target && e.target.closest && e.target.closest('button[data-action="toggle-domain"]');
            if (!btn || !container.contains(btn)) return;
            e.preventDefault();
            e.stopPropagation();
            const dom = btn.dataset.domain;
            if (dom) toggleMapDomain(dom);
        });
        _domainChipsDelegated = true;
    }
}

function updateModeToggleUI() {
    const sim = document.getElementById('mapModeSimulation');
    const prac = document.getElementById('mapModePractice');
    const ws = document.getElementById('mapModeWorksheet');
    if (sim) sim.classList.toggle('selected', state.mapSessionMode === 'simulation');
    if (prac) prac.classList.toggle('selected', state.mapSessionMode === 'practice');
    if (ws) ws.classList.toggle('selected', state.mapSessionMode === 'worksheet');
}

function renderItemSlider() {
    const startSection = document.getElementById('mapStartSection');
    if (!startSection) return;
    if (document.getElementById('mapItemSlider')) {
        document.getElementById('mapItemSlider').value = state.mapItemCountTarget;
        document.getElementById('mapItemDisplay').textContent = state.mapItemCountTarget;
        return;
    }
    const startBtn = document.getElementById('mapStartBtn');
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-bottom:14px;';
    wrap.innerHTML = `
      <label style="display:block;font-weight:700;margin-bottom:6px;">Items per session: <span id="mapItemDisplay">${state.mapItemCountTarget}</span></label>
      <input type="range" min="5" max="45" step="5" value="${state.mapItemCountTarget}" id="mapItemSlider" oninput="window.setMapItemCount(this.value)" style="width:100%;">
    `;
    startSection.insertBefore(wrap, startBtn);
}

function updateStartButton() {
    const btn = document.getElementById('mapStartBtn');
    if (!btn) return;
    const ok = state.mapSelectedBands.length > 0 && state.mapSelectedDomains.length > 0;
    btn.disabled = !ok;
    btn.style.opacity = ok ? '1' : '0.5';
    btn.style.cursor = ok ? 'pointer' : 'not-allowed';
}

export function toggleMapBand(band) {
    const idx = state.mapSelectedBands.indexOf(band);
    if (idx === -1) state.mapSelectedBands.push(band);
    else state.mapSelectedBands.splice(idx, 1);
    renderBandChips();
    updateStartButton();
}

export function toggleMapDomain(domain) {
    const idx = state.mapSelectedDomains.indexOf(domain);
    if (idx === -1) state.mapSelectedDomains.push(domain);
    else state.mapSelectedDomains.splice(idx, 1);
    renderBandChips();
    renderDomainChips();
    updateStartButton();
}

export function selectAllMapBands() {
    state.mapSelectedBands = bandsForTier(state.mapTier).slice();
    renderBandChips();
    updateStartButton();
}

export function clearMapBands() {
    state.mapSelectedBands = [];
    renderBandChips();
    updateStartButton();
}

export function setMapItemCount(value) {
    state.mapItemCountTarget = parseInt(value, 10);
    const disp = document.getElementById('mapItemDisplay');
    if (disp) disp.textContent = state.mapItemCountTarget;
}

export function setMapMode(mode) {
    state.mapSessionMode = mode;
    updateModeToggleUI();
}

export function startMapFromUI() {
    if (!state.mapTier) {
        alert('Please choose a tier (K-2 or 3-5).');
        return;
    }
    if (state.mapSelectedBands.length === 0) {
        alert('Please select at least one RIT band.');
        return;
    }
    if (state.mapSelectedDomains.length === 0) {
        alert('Please select at least one domain.');
        return;
    }
    if (!state.mapSessionMode) {
        alert('Please choose a mode (Simulation, Practice, or Worksheet).');
        return;
    }
    startMapSession({
        tier: state.mapTier,
        mode: state.mapSessionMode,
        bands: state.mapSelectedBands,
        domains: state.mapSelectedDomains,
        itemCount: state.mapItemCountTarget,
    });
}

/**
 * Print the current MAP selection (bands + domains) as a worksheet packet,
 * without running an adaptive session first. Useful for teachers who want a
 * "MAP-style practice packet" to hand out.
 */
export function printMapFromSelector() {
    if (!state.mapTier) {
        alert('Please choose a tier (K-2 or 3-5) first.');
        return;
    }
    if (!state.mapSelectedBands || state.mapSelectedBands.length === 0) {
        alert('Please select at least one RIT band.');
        return;
    }
    if (!state.mapSelectedDomains || state.mapSelectedDomains.length === 0) {
        alert('Please select at least one domain.');
        return;
    }
    const allSkills = getMapSkillsForBands(state.mapSelectedBands, state.mapTier);
    const skills = allSkills.filter(id => state.mapSelectedDomains.includes(getMapDomain(id)));
    if (!skills.length) {
        alert('No MAP skills match the current selection.');
        return;
    }
    const itemCount = state.mapItemCountTarget || 20;
    if (typeof window.printMapSkillsAsWorksheet === 'function') {
        window.printMapSkillsAsWorksheet(skills, itemCount);
    } else {
        alert('Print system not available.');
    }
}
