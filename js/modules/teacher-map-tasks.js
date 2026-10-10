// teacher-map-tasks.js — the MAP page's two browse views (owner 2026-10-10), drawn inside the MAP tests
// screen (teacher-map.js keeps the "Start a MAP test" view and the pupil MAP flow unchanged):
//
//   Practise by task   strand (the seven MAP practice strands) → RIT band → the MAP task types; a task
//                      opens its skills in three groups — "Skills for this task" (direct), "Skills to do
//                      first" (pre) and "Skills that go with it" (related) — with the same tick boxes,
//                      thumbnails / list, Practice link and Print as the White Rose screen, and a
//                      "To be built" line where a skill is still missing.
//   By representation  per strand, the eight "match the two" changes MAP asks for (picture ↔ equation,
//                      model ↔ number, …): the skills that practise each and what still needs building.
//
// DATA: data/curriculum/links/MAP.json when present (the MAP audit's rows: task, strand, RIT band,
// status, skills, proposal). Without it the tasks come from the app's own MAP engine lists (data.js
// RIT_BAND_SKILLS via getMapSkillsForBands), one task per skill category per band.
//
// RULES (computed, documented here):
//   DIRECT   the task's skills (MAP.json `skills`, or the band's skills of that category).
//   PRE      skills of the same strand's tasks whose RIT band starts lower — nearest band first, cap 8,
//            never a direct skill.
//   RELATED  skills of the same strand's other tasks that overlap this task's band, then the skills of the
//            representation changes this task's skills take part in — cap 8, never direct or pre.

import { esc, icon } from './teacher-ui.js';
import { skillView } from './teacher-preview.js';
import { getMapSkillsForBands, getCategoryForSkill, DOMAINS } from './data.js';
import { createPicker, liveKey, toBeBuiltHTML } from './teacher-skillpick.js';
import { loadMap } from './links-data.js';

export const RIT_BANDS = ['<141', '141-150', '151-160', '161-170', '171-180', '181-190', '191-200', '201-210', '211-220', '221-230', '231+'];
const STATUS = {
    'exists-ok': ['Ready', 'is-full'], 'exists-regrade': ['Ready (being checked)', 'is-full'], exists: ['Ready', 'is-full'],
    partial: ['Covers part', 'is-part'], missing: ['To be built', 'is-gap'],
};
const CAP = 8;

let W = null;            // wrm-links.js (strands, representation pairs, proposal names)
let MAPD = null;         // MAP.json or null
let TASKS = null;        // [{ id, task, strand, ritBand, lo, hi, status, skills:[keys], proposal, note }]
let loading = null;

const k = { view: 'tasks', strand: 'Number & place value', band: '', task: '' };
let host = null;
const pick = createPicker({ idp: 'tvmk', root: () => host, redraw: () => drawDetail() });

function rng(b) {
    const s = String(b || '');
    if (/^<\s*1?\d+/.test(s) || s === '< 150') return [100, parseInt(s.replace(/\D/g, ''), 10) - 1 || 140];
    if (/\+$/.test(s)) return [parseInt(s, 10), 260];
    const [a, z] = s.split('-').map((x) => parseInt(x, 10));
    return [a || 0, z || a || 0];
}
const overlaps = (t, band) => { if (!band) return true; const [a, z] = rng(band); return t.lo <= z && t.hi >= a; };

function catNames() {
    const out = {};
    for (const d of Object.values(DOMAINS || {})) for (const c of d.categories || []) out[c.id] = c.name;
    return out;
}

function buildTasks() {
    const out = [];
    if (MAPD && Array.isArray(MAPD.rows)) {
        MAPD.rows.forEach((r, i) => {
            const [lo, hi] = rng(r.ritBand);
            out.push({ id: `m${i}`, task: String(r.task || '').replace(/<->/g, '↔'), strand: r.strand, ritBand: r.ritBand, lo, hi, status: r.status || '',
                skills: (r.skills || []).filter(liveKey), proposal: r.proposal || '', note: r.closes || '' });
        });
    } else {
        // Fallback: the engine's own band lists, one task per skill category in each band.
        const names = catNames();
        for (const band of RIT_BANDS.slice(1)) {
            const by = new Map();
            for (const id of getMapSkillsForBands([band], 'mixed')) {
                const cat = getCategoryForSkill(id);
                const key = `${cat}:${id}`;
                if (!cat || !liveKey(key)) continue;
                if (!by.has(cat)) by.set(cat, []);
                by.get(cat).push(key);
            }
            for (const [cat, keys] of by) {
                const strand = W.strandOfKey(keys[0]);
                if (!strand) continue;
                const [lo, hi] = rng(band);
                out.push({ id: `e${out.length}`, task: names[cat] || cat.replace(/_/g, ' '), strand, ritBand: band, lo, hi, status: 'exists', skills: keys, proposal: '', note: '' });
            }
        }
    }
    out.sort((a, b) => a.lo - b.lo || a.hi - b.hi || a.task.localeCompare(b.task));
    return out;
}

function load() {
    if (TASKS) return Promise.resolve();
    if (!loading) {
        loading = Promise.all([import('./wrm-links.js'), loadMap()]).then(([w, map]) => {
            W = w; MAPD = map;
            TASKS = buildTasks();
        }).catch((e) => { console.warn('[teacher-map-tasks] load', e); loading = null; });
    }
    return loading;
}

const strands = () => W.MAP_STRANDS.map((s) => s[1]);
const nameOf = (id) => {
    const p = MAPD && MAPD.proposals && MAPD.proposals[id];
    if (p && p.name) return p.name;
    for (const r of W.REP_PAIRS) for (const s of Object.values(r.strands)) for (const [bid, n] of s.build) if (bid === id) return n;
    return W.proposalName(id);
};

/** A note in plain words: a proposal id inside it becomes its name. */
function plainNote(text) {
    return String(text).replace(/\s*\(part [A-Z]\)/g, '').replace(/\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/g, (id) => (MAPD && MAPD.proposals && MAPD.proposals[id] ? `"${nameOf(id)}"` : id));
}

/* ================================================================= links for a task */

export function taskLinks(t) {
    const direct = t.skills.map((key) => ({ key }));
    const taken = new Set(t.skills);
    const push = (arr, key, why) => { if (!taken.has(key) && liveKey(key) && arr.length < CAP) { taken.add(key); arr.push({ key, why }); } };
    const same = TASKS.filter((x) => x.strand === t.strand && x.id !== t.id);
    const pre = [];
    same.filter((x) => x.lo < t.lo).sort((a, b) => b.lo - a.lo).forEach((x) => x.skills.forEach((key) => push(pre, key, `Earlier MAP task: "${x.task}" (RIT ${x.ritBand})`)));
    const related = [];
    same.filter((x) => x.lo >= t.lo && x.lo <= t.hi).forEach((x) => x.skills.forEach((key) => push(related, key, `Same band: "${x.task}"`)));
    for (const p of W.REP_PAIRS) {
        const s = p.strands[t.strand];
        if (s && s.skills.some((key) => t.skills.includes(key))) s.skills.forEach((key) => push(related, key, `Same picture-to-number change: ${p.label}`));
    }
    return { direct, pre, related };
}

/* ================================================================= URL state (#map/<view>/<strand>/<band>/<task>) */
// Like the White Rose screen: the view, strand, band and task live in the hash, so a teacher can bookmark
// a task and Back works (critic r1 M4). "Start a MAP test" keeps no hash.

export function mapHashActive() { return /^#map(\/|$)/.test(location.hash || ''); }
/** The view the hash names ('tasks' | 'reps'), or ''. */
export function mapHashView() { const m = /^#map\/(tasks|reps)/.exec(location.hash || ''); return m ? m[1] : ''; }
function readHash() {
    const m = /^#map\/(tasks|reps)(?:\/([^/]*))?(?:\/([^/]*))?(?:\/([^/]*))?/.exec(location.hash || '');
    if (!m || !W) return;
    const st = W.MAP_STRANDS.find((x) => x[0] === m[2]);
    if (st) k.strand = st[1];
    if (m[1] === 'tasks') {
        const b = decodeURIComponent(m[3] || 'all');
        k.band = b === 'all' ? '' : RIT_BANDS.includes(b) ? b : '';
        k.task = m[4] && TASKS && TASKS.some((t) => t.id === m[4]) ? m[4] : '';
    }
}
function writeHash(replace) {
    const sid = (W.MAP_STRANDS.find((x) => x[1] === k.strand) || [''])[0];
    const h = k.view === 'reps' ? `#map/reps/${sid}` : `#map/tasks/${sid}/${encodeURIComponent(k.band || 'all')}${k.task ? `/${k.task}` : ''}`;
    if (location.hash === h) return;
    if (replace) history.replaceState(history.state, '', h); else history.pushState(history.state, '', h);
}
/** Leaving the MAP browse views: drop the hash (a new entry, so Back returns to the task). */
export function clearMapHash() {
    if (mapHashActive()) history.pushState(history.state, '', location.pathname + location.search);
}

/* ================================================================= render */

/** Draw the browse view ('tasks' | 'reps') into `el` (a container inside the MAP screen). */
export function renderMapTasks(el, view) {
    host = el;
    if (k.view !== view) { k.view = view; pick.reset(); }
    pick.view = skillView();
    if (!el.dataset.wired) { el.dataset.wired = '1'; wire(el); }
    if (!TASKS) el.innerHTML = '<p class="tv-cap">Loading the MAP tasks…</p>';
    load().then(() => {
        if (!TASKS) { el.innerHTML = '<p class="tv-cap">Could not load the MAP tasks. Reload the page to try again.</p>'; return; }
        if (mapHashView() === view) readHash();
        writeHash(true);
        draw();
    });
}

function strandChips() {
    return `<div class="tvw-pickrow"><span class="tvw-pick-h" id="tvmkStrandH">Strand</span><div class="tv-chips" role="group" aria-labelledby="tvmkStrandH">${strands().map((s) => `<button type="button" class="tv-chip" data-mk-strand="${esc(s)}" aria-pressed="${s === k.strand}">${esc(s)}</button>`).join('')}</div></div>`;
}

function tasksOf() { return TASKS.filter((t) => t.strand === k.strand && overlaps(t, k.band)); }

function draw() {
    if (!host) return;
    const src = MAPD ? 'The task types from our review of MAP Growth.' : 'The skills the app\'s MAP practice uses in each band, by topic.';
    if (k.view === 'reps') {
        host.innerHTML = `<div class="tvmk-find">${strandChips()}<p class="tv-cap">MAP often asks pupils to match two forms of the same idea. Each box shows the skills that practise one change in this strand, and what still needs building.</p></div>
          <section class="tvmk-detail" id="tvmkDetail" aria-live="polite"></section>`;
        drawDetail();
        return;
    }
    const list = tasksOf();
    if (k.task && !list.some((t) => t.id === k.task)) k.task = '';
    const bandCounts = RIT_BANDS.map((b) => [b, TASKS.filter((t) => t.strand === k.strand && overlaps(t, b)).length]).filter((x) => x[1]);
    host.innerHTML = `<div class="tvmk-find">${strandChips()}
        <div class="tvw-pickrow"><span class="tvw-pick-h" id="tvmkBandH">RIT</span><div class="tv-chips" role="group" aria-labelledby="tvmkBandH">
          <button type="button" class="tv-chip" data-mk-band="" aria-pressed="${!k.band}">All</button>${bandCounts.map(([b]) => `<button type="button" class="tv-chip" data-mk-band="${b}" aria-pressed="${b === k.band}">${b.replace('-', '–').replace('<', 'below ')}</button>`).join('')}</div></div>
        <p class="tv-cap">${src}</p></div>
      <div class="tvw-grid">
        <nav class="tv-card tv-flush tvw-lessons" aria-labelledby="tvmkListH" id="tvmkList">
          <h2 class="tv-h3 tvw-unit-title" id="tvmkListH">${esc(k.strand)}${k.band ? ` · RIT ${esc(k.band.replace('-', '–'))}` : ''}</h2>
          ${list.length ? `<ol class="tvw-list">${list.map(taskRowHTML).join('')}</ol>` : '<p class="tv-cap tvw-pad">No MAP task in this band for this strand.</p>'}
        </nav>
        <section class="tvw-detail" id="tvmkDetail" aria-live="polite"></section>
      </div>`;
    drawDetail();
}

function taskRowHTML(t, i) {
    const st = STATUS[t.status] || ['', ''];
    const n = t.skills.length;
    const gap = t.status === 'missing' || !n;
    return `<li><button type="button" class="tvw-lesson${gap ? ' is-gap' : ''}" data-mk-task="${esc(t.id)}"${t.id === k.task ? ' aria-current="true"' : ''}>
      <span class="tvw-n">${i + 1}</span>
      <span class="tvw-lt"><span class="tvw-lt-title">${esc(t.task)}</span>
        <span class="tvw-lt-meta">RIT ${esc(t.ritBand.replace('-', '–'))}${st[0] && t.status !== 'missing' && t.status !== 'exists' ? ` <span class="tvw-tag tvw-verdict-tag ${st[1]}">${esc(st[0])}</span>` : ''}</span></span>
      <span class="tvw-count${gap ? ' is-gap' : ''}">${gap ? 'To be built' : `${n} skill${n === 1 ? '' : 's'}`}</span></button></li>`;
}

function drawDetail() {
    const d = host && host.querySelector('#tvmkDetail');
    if (!d) return;
    d.innerHTML = k.view === 'reps' ? repsHTML() : taskHTML();
    pick.after(d);
}

function taskHTML() {
    const t = TASKS.find((x) => x.id === k.task);
    if (!t) {
        pick.setGroups({});
        return `<div class="tv-card tvw-empty"><span class="tv-empty-icon" aria-hidden="true">${icon('flag', 22)}</span>
          <div class="tv-h3">Choose a MAP task</div><p class="tv-cap">Pick a task on the left. You will see the skills that practise it, the skills to do first and the skills that go with it.</p></div>`;
    }
    const l = taskLinks(t);
    pick.setGroups({ direct: l.direct, prereq: l.pre, related: l.related });
    const st = STATUS[t.status] || ['', ''];
    return `<div class="tv-card tvw-head">
        <p class="tvw-kicker">${esc(t.strand)} · RIT ${esc(t.ritBand.replace('-', '–'))}</p>
        <h2 class="tv-h2 tvw-title">${esc(t.task)}</h2>
        ${st[0] ? `<div class="tvw-tags"><span class="tvw-tag tvw-verdict-tag ${st[1]}">${esc(st[0])}</span></div>` : ''}
        ${t.note ? `<p class="tvw-verdict${t.status === 'missing' ? ' is-gap' : ''}">${esc(plainNote(t.note))}</p>` : ''}
        ${toBeBuiltHTML(t.proposal ? [t.proposal] : [], nameOf)}
      </div>
      ${pick.quickHTML([['direct', 'Task skills'], ['prereq', 'Do-first skills'], ['related', 'Go-with skills'], ['all', 'Everything']])}
      ${pick.groupHTML('direct', 'Skills for this task', 'Practise the task itself.', t.proposal ? 'No skill practises this task yet — it is on the list to be built.' : 'No skill practises this task yet.')}
      ${pick.groupHTML('prereq', 'Skills to do first', 'The same strand at a lower RIT band.', 'Nothing lower in this strand.')}
      ${pick.groupHTML('related', 'Skills that go with it', 'The same strand and band, or the same picture-to-number change.', 'No other skills in this band.')}
      ${pick.barWrapHTML()}`;
}

function repsHTML() {
    // Build every group first, hand them to the picker, THEN draw (the groups render from the picker).
    const pairs = W.REP_PAIRS.filter((p) => p.strands[k.strand]).map((p) => {
        const s = p.strands[k.strand];
        return { p, live: s.skills.filter(liveKey), builds: s.build.map((b) => b[0]) };
    });
    pick.setGroups(Object.fromEntries(pairs.map((x) => [x.p.id, x.live.map((key) => ({ key }))])));
    const parts = pairs.map(({ p, live, builds }) => pick.groupHTML(p.id, esc(p.label),
        live.length ? `${live.length === 1 ? '1 skill practises' : `${live.length} skills practise`} this change.` : '',
        builds.length ? 'No skill practises this change yet.' : 'No skill yet.', toBeBuiltHTML(builds, nameOf)));
    const absent = W.REP_PAIRS.filter((p) => !p.strands[k.strand]).map((p) => p.label);
    return `${parts.length ? pick.quickHTML([['all', 'Everything']]) : ''}
      ${parts.join('') || '<div class="tv-card tvw-empty"><div class="tv-h3">No representation changes listed</div></div>'}
      ${absent.length ? `<p class="tv-cap">Not asked in this strand: ${esc(absent.join(', '))}.</p>` : ''}
      ${parts.length ? pick.barWrapHTML() : ''}`;
}

/* ================================================================= events */

function wire(el) {
    el.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !el.contains(b) || !TASKS) return;
        const d = b.dataset;
        if (d.mkStrand !== undefined && d.mkStrand) { k.strand = d.mkStrand; k.task = ''; pick.reset(); writeHash(false); draw(); host.querySelector(`[data-mk-strand="${CSS.escape(d.mkStrand)}"]`)?.focus(); return; }
        if (d.mkBand !== undefined) { k.band = d.mkBand; pick.reset(); writeHash(false); draw(); host.querySelector(`[data-mk-band="${CSS.escape(d.mkBand)}"]`)?.focus(); return; }
        if (d.mkTask) {
            k.task = d.mkTask; pick.reset();
            writeHash(false);
            host.querySelectorAll('[data-mk-task]').forEach((x) => { if (x.dataset.mkTask === k.task) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
            drawDetail();
            host.querySelector('#tvmkDetail')?.scrollIntoView({ block: 'start', behavior: 'instant' });
            return;
        }
        pick.handle(b);
    });
}

/** For the gate: the current task list and the chosen task. */
export function mapTasksState() { return { strand: k.strand, band: k.band, task: k.task, view: k.view, tasks: TASKS ? TASKS.length : 0, source: MAPD ? 'map.json' : 'engine' }; }
