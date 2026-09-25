// teacher-standards.js — the "Standards coverage" view of the Skills library (owner request
// 2026-09-25: "keep a database of the standards, both Common Core and EE, along with their
// descriptors, so that we can see which skills are covered in our practice and which we still
// might need to make").
//
// Lists every standard with its covered / not-covered status, filterable by framework (CCSS or
// Essential Elements), level and status. It is drawn inside the library screen (teacher-library.js
// owns the entry button and the way back) from the pure data module standards.js, so the numbers
// here are the same numbers `node tests/scripts/ws-standards.cjs --report` writes to
// design/STANDARDS_COVERAGE.md.
//
// A standard is covered when at least one skill maps to it without `approx` (see standards.js).

import { icon, esc, readStore, writeStore } from './teacher-ui.js';

const LEVELS = ['K', '1', '2', '3', '4', '5', '6'];
const UI_KEY = 'mq_teacher_standards_ui';
const SHOW_SKILLS = 4;

const view = { fw: 'ccss', level: '', status: 'all' };
(function restore() {
    const s = readStore(UI_KEY, null);
    if (!s || typeof s !== 'object') return;
    if (s.fw === 'ccss' || s.fw === 'ee') view.fw = s.fw;
    if (LEVELS.includes(s.level)) view.level = s.level;
    if (['all', 'gaps', 'covered'].includes(s.status)) view.status = s.status;
})();
function persist() { writeStore(UI_KEY, { fw: view.fw, level: view.level, status: view.status }); }

let cov = null;

function seg(name, label, list, current) {
    return `<div class="tv-seg" role="radiogroup" aria-label="${esc(label)}">${list.map(([v, t]) => `<button type="button" role="radio" aria-checked="${current === v}" data-std-${name}="${v}">${esc(t)}</button>`).join('')}</div>`;
}

function pct(n, d) { return d ? Math.round((100 * n) / d) : 0; }

function shellHTML() {
    const levelOpts = LEVELS.map((l) => `<option value="${l}">Level ${l}</option>`).join('');
    return `
<div class="tvs-bar">
  <div class="tvs-fw">${seg('fw', 'Standards', [['ccss', 'Common Core'], ['ee', 'Essential Elements']], view.fw)}</div>
  <div><label class="tv-sr" for="tvsLevel">Level</label><select id="tvsLevel" class="tv-select"><option value="">All levels</option>${levelOpts}</select></div>
  <div class="tvs-status">${seg('status', 'Show', [['all', 'All'], ['gaps', 'Not covered'], ['covered', 'Covered']], view.status)}</div>
</div>
<section class="tv-card tv-flush tvs-card" aria-labelledby="tvsCount">
  <div class="tv-card-head tvs-head"><h2 class="tv-h2-sm" id="tvsCount" aria-live="polite">Standards</h2><p class="tv-cap tvs-sum" id="tvsSum"></p></div>
  <div class="tvs-body" id="tvsList"></div>
</section>`;
}

/**
 * Draw the coverage view into `el`.
 *   std       the loaded standards.js module
 *   labelOf   (key 'categoryId:skillId') -> the skill's name, or '' when it is not in the library
 */
export function renderStandardsCoverage(el, std, labelOf) {
    if (!cov) cov = std.coverage();
    if (!el.dataset.built) {
        el.innerHTML = shellHTML();
        el.dataset.built = '1';
        wire(el, std, labelOf);
    }
    el.querySelector('#tvsLevel').value = view.level;
    el.querySelectorAll('[data-std-fw]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.stdFw === view.fw)));
    el.querySelectorAll('[data-std-status]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.stdStatus === view.status)));
    drawList(el, labelOf);
}

function drawList(el, labelOf) {
    const all = view.fw === 'ee' ? cov.ee : cov.ccss;
    const inLevel = all.filter((r) => !view.level || r.grade === view.level);
    const top = view.fw === 'ee' ? inLevel : inLevel.filter((r) => !r.parent);
    const covered = top.filter((r) => r.covered).length;
    const rows = inLevel.filter((r) => view.status === 'all' || (view.status === 'gaps' ? !r.covered : r.covered));
    const noun = view.fw === 'ee' ? 'Essential Element' : 'standard';
    const nouns = `${noun}${top.length === 1 ? '' : 's'}`;
    // ONE count everywhere: the standards themselves. Lettered parts (3.NF.A.3a) are listed under
    // their standard but never counted, so the heading and the summary agree.
    el.querySelector('#tvsCount').textContent = view.status === 'gaps'
        ? `${top.length - covered} of ${top.length} ${nouns} not covered`
        : view.status === 'covered'
            ? `${covered} of ${top.length} ${nouns} covered`
            : `${top.length} ${nouns} · ${covered} covered`;
    el.querySelector('#tvsSum').textContent = `${view.level ? `Level ${view.level}` : 'Levels K to 6'}: ${pct(covered, top.length)}% covered.${view.fw === 'ccss' ? ' Lettered parts sit under their standard and are not counted.' : ''}`;
    const box = el.querySelector('#tvsList');
    if (!rows.length) {
        box.innerHTML = `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('check', 22)}</span>
          <div class="tv-h3">${view.status === 'gaps' ? 'Everything here is covered' : 'Nothing to show'}</div>
          <p class="tv-cap">Try another level or show all standards.</p></div>`;
        return;
    }
    let html = '';
    let grade = '', dom = '';
    for (const r of rows) {
        if (r.grade !== grade) {
            if (grade) html += '</ul></div>';
            grade = r.grade; dom = '';
            html += `<div class="tvs-group"><h3 class="tvs-group-h">Level ${esc(r.grade)}</h3><ul class="tvs-list" role="list">`;
        }
        if (r.domainCode !== dom) {
            dom = r.domainCode;
            html += `<li class="tvs-dom" role="presentation">${esc(r.domainName)}</li>`;
        }
        html += rowHTML(r, labelOf);
    }
    if (grade) html += '</ul></div>';
    box.innerHTML = html;
}

function rowHTML(r, labelOf) {
    const named = r.skills.map((k) => [k, labelOf(k)]).filter(([, l]) => l);
    const shown = named.slice(0, SHOW_SKILLS);
    const more = named.length - shown.length;
    const skills = shown.length
        ? `<ul class="tvs-skills" aria-label="Skills for ${esc(r.short)}">${shown.map(([k, l]) => `<li><button type="button" class="tv-link" data-std-skill="${esc(k)}">${esc(l)}</button></li>`).join('')}${more > 0 ? `<li class="tv-muted">and ${more} more</li>` : ''}</ul>`
        : '';
    const approx = !r.covered && r.approxSkills.length
        ? `<p class="tv-cap">Close but not exact: ${r.approxSkills.map((k) => esc(labelOf(k) || k)).join(', ')}</p>` : '';
    const linked = r.type === 'ee' && r.ccss && r.ccss.length ? `<p class="tv-cap">Linked to CCSS ${esc(r.ccss.map((c) => c.replace(/\.[A-D]\.(\d)/, '.$1')).join(', '))}</p>` : '';
    return `<li class="tvs-row${r.parent ? ' is-part' : ''}${r.covered ? '' : ' is-gap'}">
      <span class="tvs-code" title="${esc(r.code)}">${esc(r.short)}</span>
      <div class="tvs-main"><p class="tvs-text">${esc(r.text)}</p>${linked}${skills}${approx}</div>
      <span class="tvs-state">${r.covered ? `${icon('check', 14)}<span>${r.skills.length} skill${r.skills.length === 1 ? '' : 's'}</span>` : '<span>Not covered</span>'}</span>
    </li>`;
}

function wire(el, std, labelOf) {
    el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !el.contains(b)) return;
        if (b.dataset.stdFw) { view.fw = b.dataset.stdFw; persist(); renderStandardsCoverage(el, std, labelOf); b.focus(); return; }
        if (b.dataset.stdStatus) { view.status = b.dataset.stdStatus; persist(); renderStandardsCoverage(el, std, labelOf); b.focus(); }
    });
    el.addEventListener('change', (e) => {
        if (e.target.id !== 'tvsLevel') return;
        view.level = e.target.value;
        persist();
        drawList(el, labelOf);
    });
}
