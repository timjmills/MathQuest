// teacher-shell.js — the teacher view shell (approved design, 2026-09-24).
//
// In teacher mode (body.teacher-mode) a fixed sidebar replaces the pupil nav bar, and seven
// teacher screens live in #teacherMain: Home, Send a skill set, Print worksheets, Run practice,
// Quizzes, Settings and Progress. The Library links open the EXISTING views (Skills Navigator,
// quiz builder, MAP selector) to the right of the sidebar. Student mode is untouched.
//
// How it coexists with the legacy views without editing them:
//   - `body.tv-on-screen` means a teacher screen is showing; teacher.css then hides #homeView
//     (the pupil landing) and shows #teacherMain.
//   - A MutationObserver watches every `.view` for `active`. When a legacy view other than the
//     home view becomes active (quiz builder, a game, MAP ...), the teacher screen steps aside;
//     when the home view comes back (goHome, exitGame, a builder's Back), the teacher screen
//     returns. Play views (game, online worksheet, quiz taking, MAP session) also hide the
//     sidebar (`body.tv-play`), so the board shows only the game.
//   - The shell reacts to the body's teacher-mode class, so user-role.js needs no hook.
//   - `?board=1` in the URL (the "Open board view in new window" link) hides the teacher
//     shell entirely for that window (`body.tv-board`).

import { state } from './state.js';
import { listTests, loadTest, deleteTest, exportTestJSON, importTestJSON, compressTestForURL } from './quiz-storage.js';
import { populateVoicePicker, setSelectedVoiceURI, testSelectedVoice, getSelectedVoiceURI } from './voice-picker.js';
import { isSfxEnabled } from './sfx.js';
import {
    icon, esc, toast, copyText, fmtDay, savedSets, findSkill, levelText, levelsSummary, currentSet,
    loadSetIntoQueue, skillCatalogue, optionsSummary, readStore, writeStore, PRINT_DEFAULTS_KEY, printDefaults,
} from './teacher-ui.js';
import { renderSetsScreen, openSavedSet, startNewSet } from './teacher-sets.js';
import { renderPrintScreen, recentPrintouts, reprint, printoutMeta } from './teacher-print.js';

const SCREENS = ['home', 'sets', 'print', 'run', 'quizzes', 'settings', 'progress'];
const PLAY_VIEWS = new Set(['gameView', 'worksheetView', 'quizTakeView', 'mapSessionView']);
const LIB_FOR_VIEW = {
    skillsOrganizerView: 'library', quizBuilderView: 'quizzes', quizResultsView: 'quizzes', quizMonitorView: 'quizzes',
    mapSelectorView: 'map', mapResultsView: 'map', dashboardView: 'progress', learningStatsView: 'progress',
};
const SCREEN_KEY = 'mq_teacher_screen';

const BOARD_WINDOW = (() => { try { return new URLSearchParams(location.search).get('board') === '1'; } catch (e) { return false; } })();

let current = (() => { try { const s = sessionStorage.getItem(SCREEN_KEY); return SCREENS.includes(s) ? s : 'home'; } catch (e) { return 'home'; } })();
let started = false;

/* ================================================================= routing */

function isTeacher() { return document.body.classList.contains('teacher-mode'); }

function setNavCurrent(key) {
    document.querySelectorAll('#teacherApp [data-tv-go]').forEach((a) => {
        if (a.classList.contains('tv-brand')) return;
        if (a.dataset.tvGo === key) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
}

function activeViewId() {
    const v = document.querySelector('.view.active');
    return v ? v.id : '';
}

/** Show a teacher screen (or open a Library view). Exposed as window.tvGo. */
export function tvGo(key) {
    if (!isTeacher()) return;
    if (key === 'student') { switchToStudent(); return; }
    if (key === 'library') { window.openSkillsOrganizer?.(); return; }
    if (key === 'map') { window.openMapTest?.(); return; }
    if (!SCREENS.includes(key)) key = 'home';
    current = key;
    try { sessionStorage.setItem(SCREEN_KEY, key); } catch (e) { /* private mode */ }
    // Leave any legacy view first; the observer then brings the teacher screen up.
    if (activeViewId() !== 'homeView') {
        if (window.showView) window.showView('homeView');
    }
    showScreen(key);
}

function showScreen(key) {
    // The board window shows only the pupil-facing views (the game and its landing card).
    if (BOARD_WINDOW) return;
    document.body.classList.add('tv-on-screen');
    document.body.classList.remove('tv-play', 'tv-bigboard');
    document.querySelectorAll('#teacherMain .tv-screen').forEach((s) => s.classList.toggle('is-active', s.dataset.screen === key));
    setNavCurrent(key);
    const el = document.querySelector(`#teacherMain .tv-screen[data-screen="${key}"]`);
    if (!el) return;
    try {
        RENDER[key](el);
    } catch (e) {
        console.error('[teacher-shell] could not render', key, e);
    }
    window.scrollTo(0, 0);
}

function onViewChange() {
    if (!isTeacher()) {
        document.body.classList.remove('tv-on-screen', 'tv-play', 'tv-bigboard');
        return;
    }
    const id = activeViewId();
    if (id === 'homeView' || !id) {
        if (!document.body.classList.contains('tv-on-screen')) showScreen(current);
        document.body.classList.remove('tv-play', 'tv-bigboard');
        return;
    }
    document.body.classList.remove('tv-on-screen');
    document.body.classList.toggle('tv-play', PLAY_VIEWS.has(id));
    if (!PLAY_VIEWS.has(id)) document.body.classList.remove('tv-bigboard');
    setNavCurrent(LIB_FOR_VIEW[id] || '');
}

function onRoleChange() {
    if (isTeacher()) {
        onViewChange();
        if (activeViewId() === 'homeView') showScreen(current);
    } else {
        document.body.classList.remove('tv-on-screen', 'tv-play', 'tv-bigboard');
    }
}

function switchToStudent() {
    if (window.showView && activeViewId() !== 'homeView') window.showView('homeView');
    window.setUserRole?.('student');
    window.scrollTo(0, 0);
}

function start() {
    if (started) return;
    started = true;
    if (BOARD_WINDOW) document.body.classList.add('tv-board');

    document.getElementById('teacherApp')?.addEventListener('click', (e) => {
        const a = e.target.closest('[data-tv-go]');
        if (!a) return;
        e.preventDefault();
        tvGo(a.dataset.tvGo);
    });

    let pending = false;
    const flush = () => { pending = false; onViewChange(); };
    new MutationObserver((records) => {
        for (const r of records) {
            if (r.type === 'attributes' && r.target.classList && r.target.classList.contains('view')) { if (!pending) { pending = true; queueMicrotask(flush); } return; }
            if (r.type === 'childList' && [...r.addedNodes].some((n) => n.nodeType === 1 && n.classList.contains('view'))) { if (!pending) { pending = true; queueMicrotask(flush); } return; }
        }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });

    // React only when teacher-mode itself flips (the shell's own tv-* classes also touch body).
    let wasTeacher = isTeacher();
    new MutationObserver(() => {
        const now = isTeacher();
        if (now === wasTeacher) return;
        wasTeacher = now;
        onRoleChange();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    if (wasTeacher) onRoleChange();
}

/* ================================================================= Home */

function greeting() {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function renderHome(el) {
    const sets = savedSets().slice(0, 6);
    const prints = recentPrintouts().slice(0, 4);
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const job = (go, ic, title, text, cta, primary) => `
    <button type="button" class="tv-job" data-home-go="${go}">
      <span class="tv-job-icon" aria-hidden="true">${icon(ic, 24)}</span>
      <span><span class="tv-job-title">${title}</span><span class="tv-job-text">${text}</span></span>
      <span class="tv-btn${primary ? ' tv-btn-primary' : ''}">${cta}${icon('arrow', 16)}</span>
    </button>`;
    const setRows = sets.map((s) => {
        const n = s.skills.length;
        const lv = levelsSummary(s.skills);
        return `<tr>
  <td><button type="button" class="tv-cell-title tv-link-row" data-open-set="${esc(s.id)}">${esc(s.name || 'Untitled set')}</button><span class="tv-cell-sub">${n} skill${n === 1 ? '' : 's'}${lv ? ' · ' + esc(lv) : ''}</span></td>
  <td>${s.code ? `<code class="tv-code" title="${esc(s.code)}">${esc(s.code)}</code><span class="tv-cell-sub" style="margin-top:2px;">${s.type === 'qs' ? 'Quick Start link' : 'Direct link'}</span>` : '<span class="tv-cell-sub">No link yet</span>'}</td>
  <td><span class="tv-cell-sub">${esc(fmtDay(s.lastUsed || s.createdAt))}</span></td>
  <td style="text-align:right;padding:0 16px 0 0;overflow:visible;">${s.link ? `<button type="button" class="tv-icon-btn" data-copy-set="${esc(s.id)}" aria-label="Copy the link for ${esc(s.name || 'this set')}">${icon('copy', 18)}</button>` : ''}</td>
</tr>`;
    }).join('');
    const setsCard = `
    <section class="tv-card tv-flush" aria-labelledby="tvHomeSetsH">
      <div class="tv-card-head"><h2 class="tv-h2-sm" id="tvHomeSetsH">Your skill sets</h2>
        <button type="button" class="tv-btn tv-btn-ghost" data-home-new>${icon('plus', 16)}<span>New set</span></button></div>
      ${sets.length ? `<table class="tv-table">
        <thead><tr><th scope="col">Set</th><th scope="col" style="width:38%;">Code</th><th scope="col" style="width:104px;">Last used</th><th scope="col" style="width:76px;"><span class="tv-sr">Copy link</span></th></tr></thead>
        <tbody>${setRows}</tbody></table>
        <p class="tv-cap tv-card-foot">Pupils without a link can type the code on the start screen.</p>`
        : `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('send', 22)}</span>
            <div class="tv-h3">No skill sets yet</div>
            <p class="tv-cap">Sets you save or send from “Send a skill set” appear here, with their links and codes.</p>
            <button type="button" class="tv-btn tv-btn-primary" data-home-go="sets" style="margin-top:8px;">New skill set</button></div>`}
    </section>`;
    const printsCard = prints.length ? `
    <section class="tv-card tv-flush" aria-labelledby="tvHomePrintsH">
      <div class="tv-card-head"><h2 class="tv-h2-sm" id="tvHomePrintsH">Recent printouts</h2></div>
      <div role="list">${prints.map((p) => {
        const m = printoutMeta(p);
        return `<div role="listitem" class="tv-print-item">
          <svg width="40" height="56" viewBox="0 0 40 56" aria-hidden="true" style="flex:none;"><rect x="0.5" y="0.5" width="39" height="55" rx="2" fill="#ffffff" stroke="#c9c9c4"/><path d="M5 7h15" stroke="#85878c"/><path d="M5 11.5h30" stroke="#1f2023" stroke-width="1.2"/><rect x="5" y="15" width="30" height="35" fill="none" stroke="#85878c"/><path d="M15 15v35M25 15v35M5 26.7h30M5 38.3h30" stroke="#c9c9c4"/></svg>
          <div><div class="tv-cell-title">${esc(p.title)}</div><span class="tv-cell-sub">${esc(m.line1)}</span><span class="tv-cell-sub">${esc(m.line2)}</span></div>
          <button type="button" class="tv-icon-btn" data-reprint="${esc(p.id)}" aria-label="Print ${esc(p.title)} again">${icon('print', 18)}</button>
        </div>`;
    }).join('')}</div>
    </section>` : '';
    el.innerHTML = `
<header class="tv-header">
  <div><h1 class="tv-h1">${greeting()}</h1><p class="tv-sub">${esc(today)}</p></div>
  <div class="tv-header-actions"><a class="tv-btn tv-btn-ghost" href="help/teacher-online.html" target="_blank" rel="noopener">${icon('book', 20)}<span>Teacher help</span></a></div>
</header>
<section class="tv-grid-3" aria-label="Start a job">
  ${job('sets', 'send', 'Send a skill set', 'Pick the skills and the rules, then give pupils a link or a code to open on their own device.', 'New skill set', true)}
  ${job('print', 'print', 'Print worksheets', 'Choose skills and a page type, then print pupil pages with an answer key.', 'Choose a worksheet', false)}
  ${job('run', 'board', 'Run practice on the board', 'Put practice, a game or one large question at a time on the classroom screen.', 'Set up the board', false)}
</section>
<div class="${prints.length ? 'tv-grid-2-1' : ''}">${setsCard}${printsCard}</div>`;
    if (!el.dataset.wired) {
        el.dataset.wired = '1';
        el.addEventListener('click', async (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            if (b.dataset.homeGo) {
                if (b.dataset.homeGo === 'sets' && b.classList.contains('tv-job')) startNewSet();
                tvGo(b.dataset.homeGo);
            } else if (b.hasAttribute('data-home-new')) { startNewSet(); tvGo('sets'); }
            else if (b.dataset.openSet) { if (openSavedSet(b.dataset.openSet)) tvGo('sets'); }
            else if (b.dataset.copySet) {
                const s = savedSets().find((x) => x.id === b.dataset.copySet);
                if (s && s.link) toast((await copyText(s.link)) ? 'Link copied' : 'Could not copy');
            } else if (b.dataset.reprint) reprint(b.dataset.reprint);
        });
    }
}

/* ================================================================= Run practice */

const run = {
    source: 'set',       // 'set' | 'one'
    setId: '__current',
    one: null,           // {categoryId, skillId}
    oneQuery: '',
    mode: 'practice',
    count: '20', timer: '0', range: '100', decimals: '0',
};
(function restoreRun() {
    const s = readStore('mq_teacher_run', null);
    if (s && typeof s === 'object') for (const k of ['mode', 'count', 'timer', 'range', 'decimals']) if (s[k] !== undefined) run[k] = String(s[k]);
})();
function persistRun() { writeStore('mq_teacher_run', { mode: run.mode, count: run.count, timer: run.timer, range: run.range, decimals: run.decimals }); }

const MODES = [
    ['practice', 'play', 'Practice', 'One question at a time, with hints.'],
    ['boss', 'shield', 'Boss Battle', 'Each right answer hits the boss.'],
    ['race', 'flag', 'Car Race', 'Answer fast to beat the computer car.'],
    ['worksheet', 'sheet', 'Online worksheet', 'A page of problems, checked together at the end.'],
    ['board', 'board', 'Board display', 'One large question at a time for the whole class.'],
];
const MODE_NAME = Object.fromEntries(MODES.map((m) => [m[0], m[2]]));

function runSkills() {
    if (run.source === 'one') return run.one ? [{ ...run.one, weight: 1 }] : [];
    if (run.setId === '__current') return currentSet().map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, weight: s.weight || 1, opts: s.opts }));
    const set = savedSets().find((s) => s.id === run.setId);
    return set ? set.skills : [];
}

function runSelect(field, label, opts) {
    return `<div><label class="tv-label" for="tvRun_${field}">${label}</label><select id="tvRun_${field}" class="tv-select" data-run="${field}">${opts.map(([v, t]) => `<option value="${v}"${run[field] === v ? ' selected' : ''}>${t}</option>`).join('')}</select></div>`;
}

function renderRun(el) {
    const sets = savedSets();
    if (run.setId !== '__current' && !sets.some((s) => s.id === run.setId)) run.setId = '__current';
    const skills = runSkills();
    const setChoice = `
    <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:end;">
      <div><label class="tv-label" for="tvRunSet">Skill set</label><select id="tvRunSet" class="tv-select" data-run-set>
        <option value="__current"${run.setId === '__current' ? ' selected' : ''}>Current set (${currentSet().length} skill${currentSet().length === 1 ? '' : 's'})</option>
        ${sets.map((s) => `<option value="${esc(s.id)}"${run.setId === s.id ? ' selected' : ''}>${esc(s.name || 'Untitled set')}</option>`).join('')}
      </select></div>
      <button type="button" class="tv-btn" data-run-act="edit-set" style="height:40px;">${icon('edit', 18)}<span>Edit set</span></button>
    </div>
    ${skills.length ? `<div class="tv-pills" role="list" aria-label="Skills in this set">${skills.map((k) => {
        const hit = findSkill(k.categoryId, k.skillId);
        const sum = optionsSummary(k.categoryId, k.skillId, k.opts);
        return `<span class="tv-pill" role="listitem">${esc(hit ? hit.label : k.skillId)}${sum ? `<small>· ${esc(sum)}</small>` : ''}${k.weight > 1 ? `<strong>×${k.weight}</strong>` : ''}</span>`;
    }).join('')}</div>` : '<p class="tv-empty">This set has no skills yet. Build one in “Send a skill set”.</p>'}`;
    const oneChoice = `
    <div><label class="tv-label" for="tvRunOne">Skill</label>
      <div class="tv-search">${icon('search', 18)}<input id="tvRunOne" class="tv-input" type="search" placeholder="Search, e.g. Subtract Across Zeros" autocomplete="off" value="${esc(run.oneQuery)}"></div></div>
    ${run.one ? `<div class="tv-pills"><span class="tv-pill">${esc((findSkill(run.one.categoryId, run.one.skillId) || {}).label || run.one.skillId)}<small>· ${esc(levelText((findSkill(run.one.categoryId, run.one.skillId) || {}).level || 'M'))}</small></span></div>` : ''}
    <div class="tv-pick-results" id="tvRunOneRes"${run.oneQuery ? '' : ' hidden'}></div>`;
    const ttsOn = !!state.ttsEnabled;
    const adaptiveOn = !!state.adaptiveModeEnabled;
    const practising = skills.length ? (skills.length === 1 ? ((findSkill(skills[0].categoryId, skills[0].skillId) || {}).label || '1 skill') : `${skills.length} skills, mixed`) : 'Nothing yet';
    const qs = Array.isArray(window.customQuickSkills) ? window.customQuickSkills : [];
    const qsLocked = typeof window.isQuickStartLocked === 'function' ? window.isQuickStartLocked() : false;
    el.innerHTML = `
<header class="tv-header"><div><h1 class="tv-h1">Run practice</h1><p class="tv-sub">Put practice up on the classroom board. Pupils' game view looks the same as today.</p></div></header>
<div class="tv-run-grid">
  <div class="tv-col">
    <section class="tv-card" aria-labelledby="tvSrcH">
      <h2 class="tv-h2" id="tvSrcH">What to practise</h2>
      <div class="tv-src" role="radiogroup" aria-labelledby="tvSrcH">
        <button type="button" class="tv-radio-card" role="radio" aria-checked="${run.source === 'set'}" data-run-src="set"><span class="tv-radio-dot" aria-hidden="true"></span><span><span class="tv-radio-title">A skill set</span><span class="tv-radio-text">Several skills mixed, with weights</span></span></button>
        <button type="button" class="tv-radio-card" role="radio" aria-checked="${run.source === 'one'}" data-run-src="one"><span class="tv-radio-dot" aria-hidden="true"></span><span><span class="tv-radio-title">One skill</span><span class="tv-radio-text">Practise a single skill on its own</span></span></button>
      </div>
      ${run.source === 'set' ? setChoice : oneChoice}
    </section>
    <section class="tv-card" aria-labelledby="tvModeH">
      <h2 class="tv-h2" id="tvModeH">How to play</h2>
      <div class="tv-modes" role="radiogroup" aria-labelledby="tvModeH">${MODES.map(([v, ic, t, d]) => `
        <button type="button" class="tv-mode" role="radio" aria-checked="${run.mode === v}" data-run-mode="${v}">
          <span class="tv-mode-icon" aria-hidden="true">${icon(ic, 20)}</span>
          <span><span class="tv-radio-title">${t}</span><span class="tv-radio-text" style="margin-top:4px;">${d}</span></span>
          <span class="tv-mode-tick" aria-hidden="true">${icon('check', 18)}</span>
        </button>`).join('')}
      </div>
    </section>
  </div>
  <div class="tv-col">
    <section class="tv-card" aria-labelledby="tvRunSetH">
      <h2 class="tv-h2" id="tvRunSetH">Settings</h2>
      <div class="tv-fields-2">
        ${runSelect('count', 'Problems', [['10', '10'], ['20', '20'], ['30', '30'], ['50', '50'], ['0', 'Unlimited']])}
        ${runSelect('timer', 'Timer', [['0', 'No timer'], ['60', '1 min'], ['120', '2 min'], ['180', '3 min'], ['300', '5 min'], ['600', '10 min']])}
        ${runSelect('range', 'Max number', [['10', 'Up to 10'], ['20', 'Up to 20'], ['50', 'Up to 50'], ['100', 'Up to 100'], ['1000', 'Up to 1,000'], ['10000', 'Up to 10,000']])}
        ${runSelect('decimals', 'Decimals', [['0', 'None'], ['1', 'Tenths'], ['2', 'Hundredths'], ['3', 'Thousandths']])}
      </div>
      <dl class="tv-dl">
        <dt>Practising</dt><dd>${esc(practising)}</dd>
        <dt>Mode</dt><dd>${esc(MODE_NAME[run.mode])}</dd>
        <dt>Adaptive difficulty</dt><dd>${adaptiveOn ? 'On' : 'Off'} · <button type="button" class="tv-link" data-go-settings>Change</button></dd>
        <dt>Read aloud</dt><dd>${ttsOn ? 'On' : 'Off'} · <button type="button" class="tv-link" data-go-settings>Change</button></dd>
      </dl>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button type="button" class="tv-btn tv-btn-primary tv-btn-block" data-run-act="start"${skills.length ? '' : ' aria-disabled="true"'}>${icon('play', 18)}<span>Open on this screen</span></button>
        <button type="button" class="tv-btn tv-btn-block" data-run-act="board"${skills.length ? '' : ' aria-disabled="true"'}>${icon('external', 18)}<span>Open board view in new window</span></button>
        <p class="tv-cap" style="text-align:center;">Board view fills the screen and hides your teacher tools.</p>
      </div>
    </section>
    <section class="tv-card" aria-labelledby="tvQsH">
      <div class="tv-row" style="justify-content:space-between;"><h2 class="tv-h2-sm" id="tvQsH">Pupil start screen</h2><span class="tv-cap">${qsLocked ? 'Locked' : 'Unlocked'}</span></div>
      <p class="tv-cap" style="margin-top:-8px;">The Quick Start cards pupils see in student view on this device.</p>
      <p class="tv-body" style="color:var(--tv-text);">${qs.length ? esc(qs.map((q) => q.shortName || (findSkill(q.categoryId, q.skillId) || {}).label || q.skillId).join(', ')) : 'No cards'}</p>
      <div class="tv-row">
        <button type="button" class="tv-btn tv-btn-sm" data-run-act="qs-use"${currentSet().length ? '' : ' aria-disabled="true"'} title="Put the current set's skills on the pupil start screen">${icon('upload', 16)}<span>Use current set</span></button>
        <button type="button" class="tv-btn tv-btn-sm" data-run-act="qs-lock" aria-pressed="${qsLocked}">${icon(qsLocked ? 'unlock' : 'lock', 16)}<span>${qsLocked ? 'Unlock' : 'Lock'}</span></button>
      </div>
      <button type="button" class="tv-btn tv-btn-ghost" data-run-act="qs-reset" style="align-self:flex-start;">${icon('reset', 16)}<span>Reset to default</span></button>
    </section>
  </div>
</div>`;
    if (run.source === 'one' && run.oneQuery) renderRunOneResults(el);
    if (!el.dataset.wired) {
        el.dataset.wired = '1';
        el.addEventListener('click', (e) => onRunClick(e, el));
        el.addEventListener('change', (e) => {
            const t = e.target;
            if (t.dataset.run) { run[t.dataset.run] = t.value; persistRun(); }
            else if (t.hasAttribute('data-run-set')) { run.setId = t.value; renderRun(el); }
        });
        el.addEventListener('input', (e) => {
            if (e.target.id === 'tvRunOne') { run.oneQuery = e.target.value; renderRunOneResults(el); }
        });
    }
}

function renderRunOneResults(el) {
    const box = el.querySelector('#tvRunOneRes');
    if (!box) return;
    const words = run.oneQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    box.hidden = !words.length;
    if (!words.length) return;
    const hits = skillCatalogue().filter((s) => {
        const hay = `${s.label} ${s.categoryName} ${s.skillId.replace(/_/g, ' ')}`.toLowerCase();
        return words.every((w) => hay.includes(w));
    }).slice(0, 30);
    box.innerHTML = hits.length ? hits.map((s) => `<button type="button" data-run-one="${esc(s.categoryId + '|' + s.skillId)}"><span class="tv-skill-name">${esc(s.label)}</span><br><span class="tv-skill-meta">${esc(levelText(s.level))} · ${esc(s.categoryName)}</span></button>`).join('')
        : '<p class="tv-cap" style="padding:8px 12px;">No skills match.</p>';
}

function onRunClick(e, el) {
    const b = e.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    if (d.runSrc) { run.source = d.runSrc; renderRun(el); return; }
    if (d.runMode) { run.mode = d.runMode; persistRun(); renderRun(el); return; }
    if (d.runOne) { const [c, s] = d.runOne.split('|'); run.one = { categoryId: c, skillId: s }; run.oneQuery = ''; renderRun(el); return; }
    if (b.hasAttribute('data-go-settings')) { tvGo('settings'); return; }
    switch (d.runAct) {
        case 'edit-set': {
            if (run.setId !== '__current') openSavedSet(run.setId);
            tvGo('sets');
            break;
        }
        case 'start': startPractice(); break;
        case 'board': openBoardWindow(); break;
        case 'qs-use': {
            const code = window.generateSkillCode ? window.generateSkillCode() : '';
            if (!code || code === '---') { toast('Add skills to the current set first'); return; }
            window.setQuickSkillsFromCode?.(code);
            renderRun(el);
            break;
        }
        case 'qs-lock': window.toggleQuickStartLock?.(); renderRun(el); break;
        case 'qs-reset': window.resetQuickSkillsToDefault?.(); renderRun(el); break;
        default: break;
    }
}

/** Point the legacy selects startGame reads at the chosen settings (it reads them as fallbacks). */
function applyRunSettings() {
    const setSel = (id, v) => { const s = document.getElementById(id); if (s && [...s.options].some((o) => o.value === v)) s.value = v; };
    setSel('rangeSelect', run.range);
    setSel('decimalSelect', run.decimals);
    setSel('timerSelect', run.timer);
    setSel('problemCountSelect', run.count);
}

function startPractice() {
    const skills = runSkills();
    if (!skills.length) { toast('Choose at least one skill'); return; }
    // The run uses the chosen skills through the skill queue; the teacher's current set is put
    // back straight after the game has started (the game keeps its own copy).
    const before = run.setId === '__current' && run.source === 'set' ? null
        : currentSet().map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, weight: s.weight, opts: s.opts }));
    if (before) loadSetIntoQueue({ skills });
    applyRunSettings();
    const mode = run.mode === 'board' ? 'practice' : run.mode;
    try {
        window.playSelectedSkills(mode);
    } finally {
        if (before) loadSetIntoQueue({ skills: before });
    }
    if (run.mode === 'board') document.body.classList.add('tv-bigboard');
}

function openBoardWindow() {
    const skills = runSkills();
    if (!skills.length) { toast('Choose at least one skill'); return; }
    const before = currentSet().map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, weight: s.weight, opts: s.opts }));
    loadSetIntoQueue({ skills });
    const mode = run.mode === 'board' ? 'practice' : run.mode;
    state.shareSettings = {
        timer: Number(run.timer), problemCount: Number(run.count), gameMode: mode,
        range: Number(run.range), decimals: Number(run.decimals), quickStartLocked: '?',
    };
    const code = window.generateEnhancedSkillCode ? window.generateEnhancedSkillCode() : '';
    loadSetIntoQueue({ skills: before });
    if (!code) { toast('Could not make a code for these skills'); return; }
    const url = `${location.origin}${location.pathname}?c=${encodeURIComponent(code)}&board=1`;
    const w = window.open(url, '_blank');
    if (!w) toast('Allow pop-ups to open the board window');
}

/* ================================================================= Quizzes */

const quiz = { query: '', menu: '', tests: null };

async function renderQuizzes(el) {
    if (!el.dataset.wired) {
        el.dataset.wired = '1';
        el.innerHTML = `
<header class="tv-header">
  <div><h1 class="tv-h1">Quizzes</h1><p class="tv-sub">Build a quiz from any skills. Pupils open it from a link, and results are kept in this browser.</p></div>
  <div class="tv-header-actions">
    <a class="tv-btn tv-btn-ghost" href="help/quiz-builder.html" target="_blank" rel="noopener">${icon('book', 20)}<span>Quiz help</span></a>
    <button type="button" class="tv-btn" data-q="import">${icon('upload', 18)}<span>Import JSON</span></button>
  </div>
</header>
<section class="tv-card" aria-labelledby="tvNewQuizH">
  <h2 class="tv-h2" id="tvNewQuizH">New quiz</h2>
  <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:end;">
    <div><label class="tv-label" for="tvQuizName">Quiz name</label><input id="tvQuizName" class="tv-input" type="text" placeholder="Untitled Quiz" maxlength="80"></div>
    <button type="button" class="tv-btn tv-btn-primary" data-q="create">${icon('plus', 18)}<span>Create quiz</span></button>
  </div>
  <p class="tv-cap">Next you add questions skill by skill, set points and arrange sections in the quiz builder.</p>
</section>
<section class="tv-card tv-flush" aria-labelledby="tvMyQuizH">
  <div class="tv-card-head" style="min-height:72px;">
    <div class="tv-row"><h2 class="tv-h2" id="tvMyQuizH">My quizzes</h2><span class="tv-cap" id="tvQuizCount"></span></div>
    <div class="tv-search" style="width:260px;max-width:40%;"><label class="tv-sr" for="tvQuizSearch">Search quizzes</label>${icon('search', 18)}<input id="tvQuizSearch" class="tv-input" type="search" placeholder="Search quizzes" autocomplete="off"></div>
  </div>
  <div id="tvQuizList"></div>
</section>`;
        el.addEventListener('click', (e) => onQuizClick(e, el));
        el.querySelector('#tvQuizSearch').addEventListener('input', (e) => { quiz.query = e.target.value.trim().toLowerCase(); renderQuizList(el); });
        document.addEventListener('click', (e) => {
            if (quiz.menu && !e.target.closest('#teacherMain [data-screen="quizzes"] .tv-menu-wrap')) { quiz.menu = ''; renderQuizList(el); }
        });
    }
    try { quiz.tests = await listTests(); } catch (e) { quiz.tests = []; }
    renderQuizList(el);
}

function qCount(t) {
    return t.sections ? t.sections.reduce((n, s) => n + (s.questions || []).length, 0) : (t.questions || []).length;
}

function renderQuizList(el) {
    const box = el.querySelector('#tvQuizList');
    const all = (quiz.tests || []).slice().sort((a, b) => (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0));
    el.querySelector('#tvQuizCount').textContent = `${all.length} quiz${all.length === 1 ? '' : 'zes'}`;
    const list = quiz.query ? all.filter((t) => String(t.name || '').toLowerCase().includes(quiz.query)) : all;
    if (!all.length) {
        box.innerHTML = `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('sheet', 22)}</span><div class="tv-h3">No quizzes yet</div><p class="tv-cap">Create one above, or import a quiz file.</p></div>`;
        return;
    }
    if (!list.length) { box.innerHTML = '<p class="tv-cap" style="padding:16px 24px;">No quizzes match your search.</p>'; return; }
    box.innerHTML = `<table class="tv-table">
  <thead><tr><th scope="col">Name</th><th scope="col" style="width:104px;">Questions</th><th scope="col" style="width:88px;">Sections</th><th scope="col" style="width:120px;">Last edited</th><th scope="col" style="width:360px;"><span class="tv-sr">Actions</span></th></tr></thead>
  <tbody>${list.map((t) => `<tr>
    <td><span class="tv-cell-title">${esc(t.name || 'Untitled Quiz')}</span></td>
    <td>${qCount(t)}</td>
    <td>${t.sections ? t.sections.length : 1}</td>
    <td><span class="tv-cell-sub">${esc(fmtDay(t.updatedAt || t.createdAt))}</span></td>
    <td style="overflow:visible;"><div class="tv-row" style="justify-content:flex-end;flex-wrap:nowrap;">
      <button type="button" class="tv-btn tv-btn-sm" data-q="edit" data-id="${esc(t.id)}">${icon('edit', 16)}<span>Edit</span></button>
      <button type="button" class="tv-btn tv-btn-sm tv-btn-ghost" style="color:var(--tv-text);" data-q="monitor" data-id="${esc(t.id)}">${icon('eye', 16)}<span>Monitor</span></button>
      <button type="button" class="tv-btn tv-btn-sm tv-btn-ghost" style="color:var(--tv-text);" data-q="results" data-id="${esc(t.id)}">${icon('bars', 16)}<span>Results</span></button>
      <div class="tv-menu-wrap"><button type="button" class="tv-icon-btn is-framed" data-q="menu" data-id="${esc(t.id)}" aria-label="More for ${esc(t.name || 'quiz')}" aria-expanded="${quiz.menu === t.id}">${icon('dots', 18)}</button>
        ${quiz.menu === t.id ? `<div class="tv-menu">
          <button type="button" data-q="share" data-id="${esc(t.id)}">${icon('link', 16)}<span>Copy share link</span></button>
          <button type="button" data-q="print" data-id="${esc(t.id)}">${icon('print', 16)}<span>Print</span></button>
          <button type="button" data-q="export" data-id="${esc(t.id)}">${icon('download', 16)}<span>Export JSON</span></button>
          <hr><button type="button" class="is-danger" data-q="delete" data-id="${esc(t.id)}">${icon('trash', 16)}<span>Delete</span></button>
        </div>` : ''}</div>
    </div></td>
  </tr>`).join('')}</tbody></table>`;
}

async function onQuizClick(e, el) {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    const id = b.dataset.id;
    switch (b.dataset.q) {
        case 'create': {
            const name = el.querySelector('#tvQuizName').value.trim();
            window.openQuizBuilder?.();
            if (name) {
                setTimeout(() => {
                    window.updateQuizName?.(name);
                    const inp = document.getElementById('quizNameInput');
                    if (inp) inp.value = name;
                }, 0);
            }
            el.querySelector('#tvQuizName').value = '';
            break;
        }
        case 'import': {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';
            input.onchange = async () => {
                const f = input.files && input.files[0];
                if (!f) return;
                try { await importTestJSON(await f.text()); toast('Quiz imported'); renderQuizzes(el); } catch (err) { toast('That file is not a quiz'); }
            };
            input.click();
            break;
        }
        case 'edit': window.openQuizBuilder?.(id); break;
        case 'monitor': window.openQuizMonitor?.(id); break;
        case 'results': window.showQuizResults?.(id); break;
        case 'menu': quiz.menu = quiz.menu === id ? '' : id; renderQuizList(el); break;
        case 'share': {
            quiz.menu = ''; renderQuizList(el);
            const t = await loadTest(id);
            if (!t) return;
            const url = `${location.origin}${location.pathname}?quiz=${compressTestForURL(t)}`;
            if (url.length > 8000) { toast('This quiz is too large for a link. Use Export JSON.'); return; }
            toast((await copyText(url)) ? 'Pupil link copied' : 'Could not copy');
            break;
        }
        case 'print': {
            quiz.menu = ''; renderQuizList(el);
            const t = await loadTest(id);
            if (t && window.printQuizTest) window.printQuizTest(t, { includeAnswerKey: true, includeNameField: true, shuffleWithinSections: t.settings && t.settings.shuffleWithinSections, printVersions: (t.settings && t.settings.printVersions) || 1 });
            break;
        }
        case 'export': {
            quiz.menu = ''; renderQuizList(el);
            const json = await exportTestJSON(id);
            const t = (quiz.tests || []).find((x) => x.id === id);
            if (!json) return;
            const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
            const a = document.createElement('a');
            a.href = url; a.download = `${(t && t.name) || 'quiz'}.json`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            break;
        }
        case 'delete': {
            const t = (quiz.tests || []).find((x) => x.id === id);
            quiz.menu = '';
            if (!confirm(`Delete “${(t && t.name) || 'this quiz'}” and all its results?`)) { renderQuizList(el); return; }
            await deleteTest(id);
            toast('Quiz deleted');
            renderQuizzes(el);
            break;
        }
        default: break;
    }
}

/* ================================================================= Settings */

function sw(id, on, labelId, descId) {
    return `<button type="button" class="tv-switch" role="switch" id="${id}" aria-checked="${!!on}" aria-labelledby="${labelId}"${descId ? ` aria-describedby="${descId}"` : ''}></button>`;
}

function renderSettings(el) {
    const pd = printDefaults();
    const dark = document.documentElement.classList.contains('dark');
    const segBtns = (name, cur, list) => `<div class="tv-seg" role="radiogroup" aria-label="${name}">${list.map(([v, t]) => `<button type="button" role="radio" data-set-${name.toLowerCase()}="${v}" aria-checked="${cur === v}">${t}</button>`).join('')}</div>`;
    el.innerHTML = `
<header class="tv-header"><div><h1 class="tv-h1">Settings</h1><p class="tv-sub">Saved in this browser, on this device.</p></div></header>
<div class="tv-grid-1-1">
  <div class="tv-col">
    <section class="tv-card" aria-labelledby="tvReadH">
      <h2 class="tv-h2" id="tvReadH">Read aloud</h2>
      <div class="tv-setting"><div><div class="tv-h3" id="tvTtsL">Read questions aloud</div><p class="tv-cap" id="tvTtsD">Each question is read out in practice. Pupils can also press Read.</p></div>${sw('tvTts', state.ttsEnabled, 'tvTtsL', 'tvTtsD')}</div>
      <div>
        <label class="tv-label" for="tvVoice">Voice</label>
        <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;">
          <select id="tvVoice" class="tv-select"></select>
          <button type="button" class="tv-btn" data-set-act="test-voice" style="height:40px;">${icon('speaker', 18)}<span>Test voice</span></button>
        </div>
        <p class="tv-cap" style="margin-top:6px;">The list shows the voices in this browser. Your choice is saved on this computer.</p>
      </div>
    </section>
    <section class="tv-card" aria-labelledby="tvPupilH">
      <h2 class="tv-h2" id="tvPupilH">Pupil practice</h2>
      <div class="tv-setting"><div><div class="tv-h3" id="tvAdL">Adaptive difficulty</div><p class="tv-cap" id="tvAdD">Each skill gets harder or easier, on a scale of 1 to 5, as the pupil answers.</p></div>${sw('tvAdaptive', state.adaptiveModeEnabled, 'tvAdL', 'tvAdD')}</div>
      <div class="tv-row"><button type="button" class="tv-btn tv-btn-sm" data-set-act="reset-adaptive">${icon('reset', 16)}<span>Reset adaptive difficulty</span></button><span class="tv-cap">Every skill goes back to 3. Scores are kept.</span></div>
      <div class="tv-setting tv-divided"><div><div class="tv-h3" id="tvPopL">Celebration pop-ups</div><p class="tv-cap">Short messages for streaks and badges.</p></div>${sw('tvPopups', state.celebrationsEnabled, 'tvPopL')}</div>
      <div class="tv-setting tv-divided"><div><div class="tv-h3" id="tvSfxL">Sound effects</div><p class="tv-cap">A sound for right and wrong answers.</p></div>${sw('tvSfx', isSfxEnabled(), 'tvSfxL')}</div>
    </section>
  </div>
  <div class="tv-col">
    <section class="tv-card" aria-labelledby="tvLookH">
      <h2 class="tv-h2" id="tvLookH">Appearance</h2>
      <div><span class="tv-label">Theme</span>${segBtns('Theme', dark ? 'dark' : 'light', [['light', 'Light'], ['dark', 'Dark']])}</div>
      <p class="tv-cap" style="margin-top:-8px;">Worksheets always print black on white.</p>
    </section>
    <section class="tv-card" aria-labelledby="tvPrintDefH">
      <h2 class="tv-h2" id="tvPrintDefH">Printing defaults</h2>
      <div class="tv-fields-2">
        <div><span class="tv-label">Size</span>${segBtns('Size', pd.size, [['S', 'S'], ['M', 'M'], ['L', 'L']])}</div>
        <div><span class="tv-label">Paper</span>${segBtns('Paper', pd.paper, [['A4', 'A4'], ['Letter', 'Letter']])}</div>
      </div>
      <div class="tv-setting"><div><div class="tv-h3" id="tvPcL">Photocopy-safe shading</div><p class="tv-cap">Swaps grey for hatching so pages copy cleanly.</p></div>${sw('tvPhotocopy', pd.photocopySafe, 'tvPcL')}</div>
    </section>
    <section class="tv-card" aria-labelledby="tvHelpH" style="gap:8px;">
      <h2 class="tv-h2" id="tvHelpH" style="margin-bottom:4px;">Help</h2>
      <a class="tv-btn tv-btn-ghost" style="justify-content:flex-start;align-self:flex-start;" href="help/teacher-online.html" target="_blank" rel="noopener">${icon('book', 18)}<span>Teacher help</span></a>
      <a class="tv-btn tv-btn-ghost" style="justify-content:flex-start;align-self:flex-start;" href="help/skills-navigator.html" target="_blank" rel="noopener">${icon('book', 18)}<span>Skills library help</span></a>
      <a class="tv-btn tv-btn-ghost" style="justify-content:flex-start;align-self:flex-start;" href="help/quiz-builder.html" target="_blank" rel="noopener">${icon('book', 18)}<span>Quiz help</span></a>
    </section>
  </div>
</div>`;
    const voice = el.querySelector('#tvVoice');
    const fillVoices = () => { try { populateVoicePicker(voice); voice.value = getSelectedVoiceURI() || ''; } catch (e) { /* no speech */ } };
    fillVoices();
    if ('speechSynthesis' in window) { try { window.speechSynthesis.addEventListener('voiceschanged', fillVoices, { once: true }); } catch (e) { /* ignore */ } }
    voice.addEventListener('change', () => { setSelectedVoiceURI(voice.value); const legacy = document.getElementById('voicePickerSelect'); if (legacy) legacy.value = voice.value; });
    if (!el.dataset.wired) {
        el.dataset.wired = '1';
        el.addEventListener('click', (e) => onSettingsClick(e, el));
    }
}

function savePrintDefaults(patch) {
    writeStore(PRINT_DEFAULTS_KEY, { ...printDefaults(), ...patch });
}

function onSettingsClick(e, el) {
    const b = e.target.closest('button');
    if (!b) return;
    const d = b.dataset;
    const flip = () => b.getAttribute('aria-checked') !== 'true';
    switch (b.id) {
        case 'tvTts': window.setTTS?.(flip()); break;
        case 'tvAdaptive': window.setAdaptiveModeEnabled?.(flip()); break;
        case 'tvPopups': {
            const on = flip();
            window.toggleCelebrations?.(on);
            const cb = document.getElementById('celebrationToggle'); if (cb) cb.checked = on;
            break;
        }
        case 'tvSfx': window.setSfxEnabled?.(flip()); break;
        case 'tvPhotocopy': savePrintDefaults({ photocopySafe: flip() }); break;
        default: break;
    }
    if (d.setAct === 'test-voice') { testSelectedVoice(); return; }
    if (d.setAct === 'reset-adaptive') { window.confirmResetAdaptiveLevels?.(); return; }
    if (d.setTheme) {
        const dark = document.documentElement.classList.contains('dark');
        if ((d.setTheme === 'dark') !== dark) window.toggleTheme?.();
    }
    if (d.setSize) savePrintDefaults({ size: d.setSize });
    if (d.setPaper) savePrintDefaults({ paper: d.setPaper });
    renderSettings(el);
}

/* ================================================================= Progress */

const prog = { period: 'week' };

function filteredHistory() {
    const list = Array.isArray(state.sessionHistory) ? state.sessionHistory : [];
    const now = new Date();
    const iso = (d) => d.toISOString().split('T')[0];
    const today = iso(now);
    const ws = new Date(now); ws.setDate(now.getDate() - now.getDay());
    const ma = new Date(now); ma.setDate(now.getDate() - 30);
    return list.filter((e) => {
        if (!e || !e.date) return prog.period !== 'today';
        if (prog.period === 'today') return e.date === today;
        if (prog.period === 'week') return e.date >= iso(ws);
        return e.date >= iso(ma);
    });
}

function renderProgress(el) {
    const rows = filteredHistory();
    const any = Array.isArray(state.sessionHistory) && state.sessionHistory.length > 0;
    const label = { today: 'Today', week: 'This week', month: 'Last 30 days' }[prog.period];
    const seg = `<div class="tv-seg" role="radiogroup" aria-label="Period" style="min-width:360px;">${[['today', 'Today'], ['week', 'This week'], ['month', 'Last 30 days']].map(([v, t]) => `<button type="button" role="radio" data-period="${v}" aria-checked="${prog.period === v}">${t}</button>`).join('')}</div>`;
    const table = rows.length ? `<table class="tv-table">
      <thead><tr><th scope="col" style="width:80px;">Date</th><th scope="col" style="width:64px;">Day</th><th scope="col" style="width:80px;">Time</th><th scope="col" style="width:88px;">Duration</th><th scope="col">Skill</th><th scope="col" style="width:104px;">Mode</th><th scope="col" style="width:104px;">Score</th><th scope="col" style="width:96px;">Result</th></tr></thead>
      <tbody>${rows.map((r) => {
        let dd = r.date || '';
        if (r.date) { try { dd = new Date(r.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); } catch (e) { /* keep raw */ } }
        return `<tr${r.incomplete ? ' style="font-style:italic;"' : ''}><td>${esc(dd)}</td><td>${esc(r.day || '')}</td><td>${esc(r.time || '')}</td><td>${esc(r.duration || '')}</td><td><span class="tv-cell-title" style="font-weight:600;">${esc(String(r.challenge || '').replace(/<[^>]*>/g, ''))}</span></td><td>${esc(r.mode || '')}</td><td>${esc(r.score || '')}${r.percentage !== undefined ? ` <span class="tv-muted">(${esc(r.percentage)}%)</span>` : ''}</td><td>${esc(r.result || '')}</td></tr>`;
    }).join('')}</tbody></table>`
        : `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('chart', 22)}</span>
            <div class="tv-h3">${any ? `No sessions ${label.toLowerCase() === 'today' ? 'today' : label === 'This week' ? 'this week' : 'in the last 30 days'}` : 'Sessions played on this device appear here'}</div>
            <p class="tv-cap">Pupils add a row each time they finish practice, a game or a worksheet in student view.</p>
            ${any ? '' : `<button type="button" class="tv-btn tv-btn-ghost" data-tv-student>${icon('reset', 16)}<span>Switch to student view</span></button>`}</div>`;
    el.innerHTML = `
<header class="tv-header"><div><h1 class="tv-h1">Progress</h1><p class="tv-sub">Practice sessions played on this device.</p></div>${seg}</header>
<section class="tv-card tv-notice"><span class="tv-notice-icon" aria-hidden="true">${icon('device', 20)}</span><div><div class="tv-h3">This device only</div><p class="tv-body">Each browser keeps its own list of the last 100 sessions. Sessions played on pupils' own tablets or other computers do not appear here.</p></div></section>
<div class="tv-grid-2-1" style="grid-template-columns:minmax(0,2.4fr) minmax(260px,1fr);">
  <section class="tv-card tv-flush" aria-labelledby="tvHistH">
    <div class="tv-card-head"><div class="tv-row"><h2 class="tv-h2" id="tvHistH">Session history</h2><span class="tv-cap">${esc(label)} · ${rows.length} session${rows.length === 1 ? '' : 's'}</span></div></div>
    <div style="overflow-x:auto;">${table}</div>
  </section>
  <section class="tv-card" aria-labelledby="tvWhatRowH">
    <h2 class="tv-h2" id="tvWhatRowH">What each row shows</h2>
    <ul class="tv-bullets"><li>Date, day and start time</li><li>How long the session took</li><li>The skill or skill set</li><li>The mode: Practice, Boss Battle, Car Race or Worksheet</li><li>Score and result</li></ul>
    <p class="tv-cap tv-divided">No names are recorded. Clearing this browser's data removes the history.</p>
    <p class="tv-cap">Quiz results are kept with each quiz. <button type="button" class="tv-link" data-go-quizzes style="font-size:12px;">Open Quizzes</button></p>
  </section>
</div>`;
    if (!el.dataset.wired) {
        el.dataset.wired = '1';
        el.addEventListener('click', (e) => {
            const b = e.target.closest('button');
            if (!b) return;
            if (b.dataset.period) { prog.period = b.dataset.period; renderProgress(el); }
            else if (b.hasAttribute('data-tv-student')) tvGo('student');
            else if (b.hasAttribute('data-go-quizzes')) tvGo('quizzes');
        });
    }
}

/* ================================================================= wiring */

const RENDER = {
    home: renderHome,
    sets: renderSetsScreen,
    print: renderPrintScreen,
    run: renderRun,
    quizzes: renderQuizzes,
    settings: renderSettings,
    progress: renderProgress,
};

// The module is loaded (deferred) after the DOM is parsed and before init() runs, so the
// observers are in place when loadUserRole() first sets the role.
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
}
