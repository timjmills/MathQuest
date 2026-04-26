// MAP Test Practice — selector view rendering and chip interactions.
import { state } from './state.js';
import { showView } from './navigation.js';
import { getMapSkillsForBands, getMapDomain } from './data.js';
import { startMapSession } from './map-engine.js';

const K2_BANDS = ['141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220'];
const BANDS_35 = ['141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220', '221-230', '231+'];
const MIXED_BANDS = ['141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220', '221-230', '231+'];
// NWEA-aligned default RIT bands per tier (sweet spot for typical students)
// K-2 actually tests RIT 141-220; default covers Grade 1 fall through Grade 3 fall
const K2_DEFAULT_BANDS = ['161-170', '171-180', '181-190', '191-200'];
// 3-5 actually tests RIT 191-230; default covers Grade 3 through Grade 5
const DEFAULT_BANDS_35 = ['191-200', '201-210', '211-220'];
// Mixed K-5 broader middle band
const DEFAULT_BANDS_MIXED = ['171-180', '181-190', '191-200', '201-210'];
const ALL_DOMAINS = ['OA', 'NO', 'MD', 'G'];
const DOMAIN_NAMES = {
    OA: 'Operations & Algebra',
    NO: 'Number & Operations',
    MD: 'Measurement & Data',
    G: 'Geometry',
};

// Share-link encode/decode tables
const MODE_CODES = { simulation: 'SI', practice: 'PR', worksheet: 'WS', unlimited: 'UN' };
const MODE_DECODES = { SI: 'simulation', PR: 'practice', WS: 'worksheet', UN: 'unlimited' };
const TIER_CODES = { k2: 'k2', '35': '35', mixed: 'mx' };
const TIER_DECODES = { k2: 'k2', '35': '35', mx: 'mixed' };
const DOMAIN_CHARS = { OA: 'O', NO: 'N', MD: 'M', G: 'G' };
const CHAR_DOMAINS = { O: 'OA', N: 'NO', M: 'MD', G: 'G' };

function bandsForTier(tier) {
    if (tier === 'mixed') return MIXED_BANDS;
    return tier === 'k2' ? K2_BANDS : BANDS_35;
}

function defaultBandsForTier(tier) {
    // Default to ALL bands for the chosen tier so the student can be assessed
    // across the full range. The curated DEFAULT_BANDS_* sets remain importable
    // for callers that want a starter subset, but tier selection itself opens
    // the door to every band in the tier.
    return bandsForTier(tier).slice();
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
    const un = document.getElementById('mapModeUnlimited');
    if (sim) sim.classList.toggle('selected', state.mapSessionMode === 'simulation');
    if (prac) prac.classList.toggle('selected', state.mapSessionMode === 'practice');
    if (ws) ws.classList.toggle('selected', state.mapSessionMode === 'worksheet');
    if (un) un.classList.toggle('selected', state.mapSessionMode === 'unlimited');
    // Hide / disable the item-count slider when running unlimited.
    const sliderWrap = document.getElementById('mapItemSlider');
    if (sliderWrap) {
        const wrap = sliderWrap.closest('div');
        if (wrap) wrap.style.display = (state.mapSessionMode === 'unlimited') ? 'none' : '';
    }
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
    if (mode === 'unlimited') {
        // Sentinel: -1 means "no cap". Engine reads this to skip the count gate.
        state.mapItemCountTarget = -1;
    } else if (state.mapItemCountTarget <= 0) {
        // Restore a sensible default if leaving unlimited.
        state.mapItemCountTarget = defaultItemCountForTier(state.mapTier);
        const slider = document.getElementById('mapItemSlider');
        if (slider) slider.value = state.mapItemCountTarget;
        const disp = document.getElementById('mapItemDisplay');
        if (disp) disp.textContent = state.mapItemCountTarget;
    }
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
        alert('Please choose a mode (Simulation, Practice, Worksheet, or Unlimited).');
        return;
    }
    if (state.mapSessionMode === 'worksheet' && state.mapItemCountTarget <= 0) {
        // Worksheet mode can't be unlimited — give it a sensible count.
        state.mapItemCountTarget = defaultItemCountForTier(state.mapTier);
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

// =====================================================================
// Teacher share-link feature for MAP Practice
// =====================================================================
// URL format: ?map=tier-mode-bandsCSV-domainsCSV-count
// Example:    ?map=k2-PR-141,151,161-OAN-15
// - tier:    k2 / 35 / mx
// - mode:    SI (simulation) / PR (practice) / WS (worksheet)
// - bands:   comma-separated band START numbers (e.g. 141 for "141-150",
//            231 for "231+")
// - domains: concatenated single chars (O=OA, N=NO, M=MD, G=G)
// - count:   integer item count

/**
 * Build a share URL from the current selector state.
 */
export function generateMapShareLink() {
    const tier = TIER_CODES[state.mapTier] || 'mx';
    const mode = MODE_CODES[state.mapSessionMode] || 'PR';
    const bands = (state.mapSelectedBands || [])
        .map(b => String(b).split('-')[0])
        .join(',');
    const domains = (state.mapSelectedDomains || [])
        .map(d => DOMAIN_CHARS[d])
        .filter(Boolean)
        .join('');
    // -1 sentinel for unlimited; encode as 'U' so the URL stays clean.
    const target = state.mapItemCountTarget;
    const count = (target > 0) ? target : (state.mapSessionMode === 'unlimited' ? 'U' : 20);
    const base = window.location.origin + window.location.pathname;
    // Optional 6th positional segment: A1 (adaptive ON) or A0 (adaptive OFF).
    // Omit entirely when default (false) so old 5-segment links remain valid.
    const adaptiveSeg = state.adaptiveModeEnabled === true ? '-A1' : '';
    return `${base}?map=${tier}-${mode}-${bands}-${domains}-${count}${adaptiveSeg}`;
}

/**
 * Copy the share URL to clipboard. Falls back to a textarea selection
 * trick if navigator.clipboard is unavailable.
 */
export function copyMapShareLink() {
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
    const url = generateMapShareLink();

    const onSuccess = () => {
        if (typeof window !== 'undefined' && typeof window.showToast === 'function') {
            window.showToast('Share link copied to clipboard!', 'success');
        }
    };
    const onFail = () => {
        // Final fallback: prompt the user with the URL
        try { window.prompt('Copy this share link:', url); } catch (_) { /* noop */ }
    };

    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(url).then(onSuccess).catch(() => {
            // Try execCommand fallback
            try {
                const ta = document.createElement('textarea');
                ta.value = url;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                if (ok) onSuccess(); else onFail();
            } catch (_) {
                onFail();
            }
        });
    } else {
        try {
            const ta = document.createElement('textarea');
            ta.value = url;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) onSuccess(); else onFail();
        } catch (_) {
            onFail();
        }
    }
    return url;
}

/**
 * Decode a `?map=` payload back into a startMapSession opts object.
 * Returns null if the string is malformed.
 */
export function parseMapShareLink(s) {
    if (!s || typeof s !== 'string') return null;
    const parts = s.split('-');
    if (parts.length < 5) return null;
    const tier = TIER_DECODES[parts[0]];
    const mode = MODE_DECODES[parts[1]];
    if (!tier || !mode) return null;
    const bandStarts = (parts[2] || '').split(',').filter(Boolean);
    const bands = bandStarts.map(str => {
        if (str === '231') return '231+';
        const n = parseInt(str, 10);
        if (!Number.isFinite(n)) return null;
        if (n >= 141 && n <= 230) return `${n}-${n + 9}`;
        return null;
    }).filter(Boolean);
    const domains = (parts[3] || '').split('').map(c => CHAR_DOMAINS[c]).filter(Boolean);
    const rawCount = parts[4];
    const count = (rawCount === 'U') ? -1 : (parseInt(rawCount, 10) || 20);
    if (!bands.length || !domains.length) return null;
    // Optional 6th positional segment encodes adaptive flag: 'A1' / 'A0'.
    // 5-segment links are still valid (adaptive omitted → undefined → leave state alone).
    let adaptive;
    if (parts.length >= 6 && typeof parts[5] === 'string' && parts[5].length > 0 && parts[5][0] === 'A') {
        adaptive = parts[5].slice(1) === '1';
    }
    return { tier, mode, bands, domains, itemCount: count, adaptive };
}

/**
 * Auto-launch a MAP session from a parsed share-link payload, skipping
 * the selector view entirely. Sets state then delegates to startMapSession.
 */
export function loadMapShareLink(parsed) {
    if (!parsed || !parsed.tier || !parsed.mode) return false;
    if (!Array.isArray(parsed.bands) || !parsed.bands.length) return false;
    if (!Array.isArray(parsed.domains) || !parsed.domains.length) return false;
    state.mapTier = parsed.tier;
    state.mapSessionMode = parsed.mode;
    state.mapSelectedBands = parsed.bands.slice();
    state.mapSelectedDomains = parsed.domains.slice();
    state.mapItemCountTarget = parsed.itemCount || 20;
    // Apply optional adaptive flag from share-link before launching the session
    // so the engine sees the correct toggle state during the first question.
    if (typeof parsed.adaptive === 'boolean') {
        if (typeof window !== 'undefined' && typeof window.setAdaptiveModeEnabled === 'function') {
            window.setAdaptiveModeEnabled(parsed.adaptive);
        } else {
            state.adaptiveModeEnabled = parsed.adaptive;
        }
    }
    startMapSession({
        tier: parsed.tier,
        mode: parsed.mode,
        bands: parsed.bands.slice(),
        domains: parsed.domains.slice(),
        itemCount: parsed.itemCount || 20,
    });
    return true;
}
