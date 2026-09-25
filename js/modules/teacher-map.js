// teacher-map.js — the "MAP tests" screen of the teacher view (owner request 2026-09-24).
//
// Replaces, for teachers only, the legacy MAP selector (#mapSelectorView): the same choices —
// level (tier), mode, question count, domains and RIT bands — in the teacher style, with the
// three things a teacher does with them: start the session on this screen, create the pupil
// link (?map=...), or print the selection as a worksheet.
//
// It never re-implements MAP. Every action writes the choices to the state fields the MAP
// modules already read (state.mapTier, mapSessionMode, mapSelectedBands, mapSelectedDomains,
// mapItemCountTarget) and calls the existing functions: startMapSession (map-engine.js),
// generateMapShareLink (map-mode-ui.js) and window.printMapSkillsAsWorksheet. The pupil side of
// MAP — the link, the session and the results — is unchanged.

import { state } from './state.js';
import { getMapSkillsForBands, getMapDomain, getCategoryForSkill } from './data.js';
import { startMapSession } from './map-engine.js';
import { generateMapShareLink } from './map-mode-ui.js';
import { icon, esc, toast, copyText, readStore, writeStore, findSkill } from './teacher-ui.js';
import { mountSample } from './teacher-preview.js';

const UI_KEY = 'mq_teacher_map_ui';

const TIERS = [
    ['k2', 'K–2', 'Questions with audio and pictures.'],
    ['35', '3–5', 'Multi-step questions.'],
    ['mixed', 'K–5', 'Questions from the whole K–5 range.'],
];
const MODES = [
    ['practice', 'Practice', 'Feedback and hints after each question.'],
    ['simulation', 'Test', 'No feedback until the end, like the real MAP test.'],
    ['worksheet', 'Worksheet', 'All the questions on one page, checked at the end.'],
    ['unlimited', 'Unlimited', 'Questions keep coming until the pupil stops.'],
];
const BANDS_K2 = ['141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220'];
const BANDS_ALL = [...BANDS_K2, '221-230', '231+'];
const DOMAINS = [['OA', 'Operations and algebra'], ['NO', 'Number and operations'], ['MD', 'Measurement and data'], ['G', 'Geometry']];
const COUNTS = [5, 10, 15, 20, 25, 30, 35, 40, 45];

function bandsFor(tier) { return tier === 'k2' ? BANDS_K2 : BANDS_ALL; }
function defaultCount(tier) { return tier === 'k2' ? 15 : 20; }
function bandText(b) { return b.replace('-', '–'); }

const m = {
    tier: '35',
    mode: 'practice',
    count: 20,
    bands: BANDS_ALL.slice(),
    domains: DOMAINS.map((d) => d[0]),
    bandsOpen: false,
    link: '',
    sampleBand: '',     // the band the sample question is drawn from ('' = the middle chosen band)
    sampleIdx: 0,       // steps through that band's skills ("Another question")
};

(function restore() {
    const s = readStore(UI_KEY, null);
    if (!s || typeof s !== 'object') return;
    if (TIERS.some((t) => t[0] === s.tier)) m.tier = s.tier;
    if (MODES.some((x) => x[0] === s.mode)) m.mode = s.mode;
    if (COUNTS.includes(Number(s.count))) m.count = Number(s.count);
    if (Array.isArray(s.bands)) m.bands = s.bands.filter((b) => bandsFor(m.tier).includes(b));
    if (Array.isArray(s.domains)) m.domains = s.domains.filter((d) => DOMAINS.some((x) => x[0] === d));
})();
function persist() { writeStore(UI_KEY, { tier: m.tier, mode: m.mode, count: m.count, bands: m.bands, domains: m.domains }); }

let root = null;
let seenTier = null;   // the last state.mapTier this screen read or wrote

/* ================================================================= public */

export function renderMapScreen(el) {
    root = el;
    // openMapTest('k2' | '35' | 'mixed') from an old entry point names a tier: honour it once.
    if (state.mapTier && state.mapTier !== seenTier && TIERS.some((t) => t[0] === state.mapTier)) {
        if (state.mapTier !== m.tier) setTier(state.mapTier);
    }
    seenTier = state.mapTier;
    if (!root.dataset.built) {
        root.dataset.built = '1';
        wire();
    }
    render();
}

/* ================================================================= model */

function setTier(t) {
    m.tier = t;
    m.bands = bandsFor(t).slice();
    m.count = defaultCount(t);
    m.link = '';
}

function skillCount() {
    if (!m.bands.length || !m.domains.length) return 0;
    try {
        return getMapSkillsForBands(m.bands, m.tier).filter((id) => m.domains.includes(getMapDomain(id))).length;
    } catch (e) { return 0; }
}

function ready() { return m.bands.length > 0 && m.domains.length > 0 && skillCount() > 0; }

/** Hand the choices to the state fields the MAP modules read. */
function applyToState() {
    state.mapTier = m.tier;
    state.mapSessionMode = m.mode;
    state.mapSelectedBands = m.bands.slice();
    state.mapSelectedDomains = m.domains.slice();
    state.mapItemCountTarget = m.mode === 'unlimited' ? -1 : m.count;
    seenTier = m.tier;
}

/** The band the sample comes from: the teacher's pick if still chosen, else the middle chosen band. */
function sampleBand() {
    const pool = m.bands.length ? bandsFor(m.tier).filter((b) => m.bands.includes(b)) : bandsFor(m.tier);
    if (pool.includes(m.sampleBand)) return m.sampleBand;
    return pool[Math.floor((pool.length - 1) / 2)] || '';
}

/** The MAP skills a band offers under the chosen domains, as {categoryId, skillId}. */
function bandSkills(band) {
    let ids = [];
    try { ids = getMapSkillsForBands([band], m.tier).filter((id) => m.domains.includes(getMapDomain(id))); } catch (e) { ids = []; }
    return ids.map((id) => ({ categoryId: getCategoryForSkill(id), skillId: id })).filter((x) => x.categoryId);
}

function sampleHTML() {
    const band = sampleBand();
    const pool = m.bands.length ? bandsFor(m.tier).filter((b) => m.bands.includes(b)) : bandsFor(m.tier);
    const skills = band ? bandSkills(band) : [];
    const pick = skills.length ? skills[sampleAt(skills.length)] : null;
    const hit = pick ? findSkill(pick.categoryId, pick.skillId) : null;
    const dom = pick ? DOMAINS.find((d) => d[0] === getMapDomain(pick.skillId)) : null;
    return `
    <section class="tv-card" aria-labelledby="tvmSampleH">
      <div class="tvm-sample-head"><h2 class="tv-h2" id="tvmSampleH">Sample question</h2>
        <div><label class="tv-sr" for="tvmSampleBand">Band</label><select id="tvmSampleBand" class="tv-select">${pool.map((b) => `<option value="${b}"${b === band ? ' selected' : ''}>RIT ${bandText(b)}</option>`).join('')}</select></div></div>
      <p class="tv-cap" style="margin-top:-8px;">RIT is the MAP score scale: a higher band means harder questions. This is one question pupils could meet in the band.</p>
      ${pick ? `<div class="tvp-frame tvm-sample" id="tvmSample"></div>
      <div class="tvm-sample-foot"><p class="tv-cap">${esc(hit ? hit.label : pick.skillId)}${dom ? ` · ${esc(dom[1])}` : ''}</p>
        <button type="button" class="tv-btn tv-btn-ghost" data-map-act="another">${icon('reset', 16)}<span>Another question</span></button></div>`
        : '<p class="tv-empty">No questions in this band for the chosen domains.</p>'}
    </section>`;
}

function drawSample() {
    const frame = root.querySelector('#tvmSample');
    const band = sampleBand();
    const skills = band ? bandSkills(band) : [];
    if (!frame || !skills.length) return;
    const pick = skills[sampleAt(skills.length)];
    mountSample(frame, pick.categoryId, pick.skillId, undefined, Math.floor(m.sampleIdx / skills.length));
}

/**
 * Which of a band's skills the sample shows. A band lists its skills from the ones it starts with
 * (181-190 opens with the first multiplication facts), so the first sample is taken from the
 * middle of the list, where the band is most typical; Another question steps on from there.
 */
function sampleAt(n) {
    return (Math.floor(n / 2) + m.sampleIdx) % n;
}

function bandsSummary() {
    const all = bandsFor(m.tier);
    if (!m.bands.length) return 'No bands chosen';
    const ordered = all.filter((b) => m.bands.includes(b));
    const range = ordered.length === 1 ? `RIT ${bandText(ordered[0])}`
        : `RIT ${ordered[0].split('-')[0]}–${ordered[ordered.length - 1].includes('+') ? '231+' : ordered[ordered.length - 1].split('-')[1]}`;
    return ordered.length === all.length ? `All ${all.length} bands · ${range}` : `${ordered.length} of ${all.length} bands · ${range}`;
}

/* ================================================================= markup */

function seg(name, list, current, label) {
    return `<div class="tv-seg" role="radiogroup" aria-label="${esc(label)}">${list.map(([v, t]) => `<button type="button" role="radio" aria-checked="${current === v}" data-map-${name}="${v}">${t}</button>`).join('')}</div>`;
}

function render() {
    const tier = TIERS.find((t) => t[0] === m.tier);
    const mode = MODES.find((x) => x[0] === m.mode);
    const n = skillCount();
    const ok = ready();
    const adaptive = state.adaptiveModeEnabled === true;
    const domainNames = DOMAINS.filter((d) => m.domains.includes(d[0])).map((d) => d[1]);
    const bandsHTML = bandsFor(m.tier).map((b) => {
        let c = 0;
        try { c = getMapSkillsForBands([b], m.tier).filter((id) => m.domains.includes(getMapDomain(id))).length; } catch (e) { c = 0; }
        return `<button type="button" class="tvm-band" aria-pressed="${m.bands.includes(b)}" data-map-band="${b}" title="${c} skill${c === 1 ? '' : 's'}">${bandText(b)}</button>`;
    }).join('');
    root.innerHTML = `
<header class="tv-header">
  <div><h1 class="tv-h1">MAP tests</h1><p class="tv-sub">Adaptive MAP-style practice. Choose the level and what it covers, then start it here or send pupils a link.</p></div>
</header>
<div class="tvm-grid">
  <div class="tv-col">
    <section class="tv-card" aria-labelledby="tvmTestH">
      <h2 class="tv-h2" id="tvmTestH">Test</h2>
      <div><span class="tv-label" id="tvmTierL">Level</span>${seg('tier', TIERS, m.tier, 'Level')}<p class="tv-cap tvm-help">${esc(tier[2])}</p></div>
      <div><span class="tv-label">Mode</span>${seg('mode', MODES, m.mode, 'Mode')}<p class="tv-cap tvm-help">${esc(mode[2])}</p></div>
      ${m.mode === 'unlimited' ? '' : `<div class="tvm-count"><label class="tv-label" for="tvmCount">Questions</label>
        <select id="tvmCount" class="tv-select">${COUNTS.map((c) => `<option value="${c}"${c === m.count ? ' selected' : ''}>${c}</option>`).join('')}</select></div>`}
    </section>
    <section class="tv-card" aria-labelledby="tvmCoverH">
      <div class="tv-row" style="justify-content:space-between;"><h2 class="tv-h2" id="tvmCoverH">What it covers</h2><span class="tv-cap" aria-live="polite">${n} skill${n === 1 ? '' : 's'}</span></div>
      <div role="group" aria-labelledby="tvmDomL"><span class="tv-label" id="tvmDomL">Domains</span>
        <div class="tvm-domains">${DOMAINS.map(([d, name]) => `<button type="button" class="tv-check tvm-check" role="checkbox" aria-checked="${m.domains.includes(d)}" data-map-domain="${d}"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span><span>${esc(name)}</span></button>`).join('')}</div>
      </div>
      <div class="tv-divided">
        <div class="tvm-bands-head">
          <div><span class="tv-label" style="margin:0;">RIT bands</span><p class="tv-body">${esc(bandsSummary())}</p><p class="tv-cap">Bands of the MAP score scale. Pupils get questions from the bands you choose.</p></div>
          <button type="button" class="tv-btn tv-btn-sm" data-map-act="bands" aria-expanded="${m.bandsOpen}" aria-controls="tvmBands">${m.bandsOpen ? 'Done' : 'Choose bands'}</button>
        </div>
        <div id="tvmBands" class="tvm-bands-panel"${m.bandsOpen ? '' : ' hidden'}>
          <div class="tvm-bands" role="group" aria-label="RIT bands">${bandsHTML}</div>
          <div class="tv-row"><button type="button" class="tv-btn tv-btn-ghost" data-map-act="all-bands">Select all</button><button type="button" class="tv-btn tv-btn-ghost" data-map-act="no-bands">Clear</button></div>
        </div>
      </div>
    </section>
  </div>
  <div class="tv-col">
    <section class="tv-card" aria-labelledby="tvmGoH">
      <h2 class="tv-h2" id="tvmGoH">Start or share</h2>
      <dl class="tv-dl">
        <dt>Level</dt><dd>${esc(tier[1])}</dd>
        <dt>Mode</dt><dd>${esc(mode[1])}</dd>
        <dt>Questions</dt><dd>${m.mode === 'unlimited' ? 'No limit' : m.count}</dd>
        <dt>Domains</dt><dd>${domainNames.length === DOMAINS.length ? 'All four' : domainNames.length ? esc(domainNames.join(', ')) : 'None'}</dd>
      </dl>
      <div class="tv-setting tvm-adaptive">
        <div><div class="tv-h3" id="tvmAdL">Adaptive difficulty</div><p class="tv-cap" id="tvmAdD">Questions get harder or easier as the pupil answers. The same switch as in Settings.</p></div>
        <button type="button" class="tv-switch" role="switch" aria-checked="${adaptive}" aria-labelledby="tvmAdL" aria-describedby="tvmAdD" data-map-act="adaptive"></button>
      </div>
      ${ok ? '' : `<p class="tv-note" role="status">${!m.domains.length ? 'Choose at least one domain.' : !m.bands.length ? 'Choose at least one RIT band.' : 'No MAP skills match these choices.'}</p>`}
      <div class="tvm-go">
        <button type="button" class="tv-btn tv-btn-primary tv-btn-block" data-map-act="start"${ok ? '' : ' aria-disabled="true"'}>${icon('play', 18)}<span>Start MAP session</span></button>
        <button type="button" class="tv-btn tv-btn-block" data-map-act="link"${ok ? '' : ' aria-disabled="true"'}>${icon('link', 18)}<span>Create pupil link</span></button>
      </div>
      ${m.link ? `<div class="tv-result" role="status">
        <div class="tv-result-row"><span class="tv-h3">Pupil link</span><button type="button" class="tv-btn tv-btn-sm" data-map-act="copy">${icon('copy', 16)}<span>Copy</span></button></div>
        <code class="tv-code tv-code-block" id="tvmLink">${esc(m.link)}</code>
        <p class="tv-cap">Pupils who open this link go straight into the test with these settings.</p>
      </div>` : ''}
      <button type="button" class="tv-btn tv-btn-ghost" data-map-act="print" style="align-self:flex-start;"${ok ? '' : ' aria-disabled="true"'}>${icon('print', 16)}<span>Print as a worksheet</span></button>
    </section>
    ${sampleHTML()}
  </div>
</div>`;
    drawSample();
}

/* ================================================================= actions */

function changed() { m.link = ''; persist(); render(); }

function refocus(sel) {
    const el = root.querySelector(sel);
    if (el) el.focus();
}

async function onAct(act) {
    switch (act) {
        case 'bands': m.bandsOpen = !m.bandsOpen; render(); refocus('[data-map-act="bands"]'); return;
        case 'all-bands': m.bands = bandsFor(m.tier).slice(); changed(); refocus('[data-map-act="all-bands"]'); return;
        case 'no-bands': m.bands = []; changed(); refocus('[data-map-act="no-bands"]'); return;
        case 'settings': window.tvGo?.('settings'); return;
        case 'adaptive': {
            const on = !(state.adaptiveModeEnabled === true);
            if (typeof window.setAdaptiveModeEnabled === 'function') window.setAdaptiveModeEnabled(on);
            else state.adaptiveModeEnabled = on;
            render();
            refocus('[data-map-act="adaptive"]');
            return;
        }
        case 'another': m.sampleIdx += 1; drawSample(); return;
        default: break;
    }
    if (!ready()) { toast(!m.domains.length ? 'Choose at least one domain' : 'Choose at least one RIT band'); return; }
    applyToState();
    switch (act) {
        case 'start':
            startMapSession({ tier: m.tier, mode: m.mode, bands: m.bands.slice(), domains: m.domains.slice(), itemCount: state.mapItemCountTarget });
            break;
        case 'link':
            m.link = generateMapShareLink();
            render();
            refocus('[data-map-act="copy"]');
            break;
        case 'copy':
            if (m.link) toast((await copyText(m.link)) ? 'Link copied' : 'Could not copy');
            break;
        case 'print': {
            const skills = getMapSkillsForBands(m.bands, m.tier).filter((id) => m.domains.includes(getMapDomain(id)));
            if (typeof window.printMapSkillsAsWorksheet === 'function') window.printMapSkillsAsWorksheet(skills, m.mode === 'unlimited' ? 20 : m.count);
            else toast('Printing is not available');
            break;
        }
        default: break;
    }
}

function wire() {
    root.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !root.contains(b)) return;
        const d = b.dataset;
        if (d.mapTier) { if (d.mapTier !== m.tier) { setTier(d.mapTier); changed(); } refocus(`[data-map-tier="${d.mapTier}"]`); return; }
        if (d.mapMode) {
            if (d.mapMode !== m.mode) { m.mode = d.mapMode; changed(); }
            refocus(`[data-map-mode="${d.mapMode}"]`);
            return;
        }
        if (d.mapDomain) {
            m.domains = m.domains.includes(d.mapDomain) ? m.domains.filter((x) => x !== d.mapDomain) : [...m.domains, d.mapDomain];
            changed(); refocus(`[data-map-domain="${d.mapDomain}"]`);
            return;
        }
        if (d.mapBand) {
            m.bands = m.bands.includes(d.mapBand) ? m.bands.filter((x) => x !== d.mapBand) : [...m.bands, d.mapBand];
            changed(); refocus(`[data-map-band="${d.mapBand}"]`);
            return;
        }
        if (d.mapAct) onAct(d.mapAct);
    });
    root.addEventListener('change', (e) => {
        if (e.target.id === 'tvmSampleBand') {
            m.sampleBand = e.target.value; m.sampleIdx = 0; render(); refocus('#tvmSampleBand');
            return;
        }
        if (e.target.id !== 'tvmCount') return;
        m.count = Number(e.target.value) || defaultCount(m.tier);
        changed();
        refocus('#tvmCount');
    });
    // Arrow keys move within a segmented control, as radio groups do.
    root.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        const btn = e.target.closest('[role="radio"]');
        if (!btn) return;
        const group = [...btn.parentElement.querySelectorAll('[role="radio"]')];
        const i = group.indexOf(btn);
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
        const next = group[(i + step + group.length) % group.length];
        e.preventDefault();
        next.click();
    });
}
