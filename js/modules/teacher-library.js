// teacher-library.js — the "Skills library" screen of the teacher view (owner request 2026-09-24:
// every teacher-facing part of the site looks the same, uncluttered and easy to use).
//
// Replaces, for teachers only, the legacy Skills Navigator (#skillsOrganizerView). Pupils never
// reach that view, and it is left in place, untouched, for its old entry point.
//
//   Browse    one search box, two quiet filters (Level, Domain) and a List | Thumbnails toggle
//   Preview   the selected skill's example drawn as the black-and-white paper cell
//             (generateQuestionFor + screen-cell.js), with "New example"
//   Act       Practise now · Add to skill set · Print · More (Options, Copy pupil link, Make a quiz)
//
// The library never duplicates another screen: "Add to skill set" puts the skill in the current
// set that "Send a skill set" edits, "Print" hands the skill to "Print worksheets", and
// "Practise now" runs it the way "Run practice" does.
//
// Previews come from the shared component (teacher-preview.js): `mountSample` draws the seeded
// black-and-white paper cell into a frame and scales it to fit, `lazyThumbs` fills the thumbnail
// grid as it scrolls into view, and the List | Thumbnails choice is the same per-device choice the
// Send screen uses (skillView / setSkillView / viewToggleHTML).

import { state } from './state.js';
import { DOMAINS } from './data.js';
import { optionsFor } from './skill-options.js';
import { addMultipleQuestions } from './quiz-builder.js';
import {
    icon, esc, toast, copyText, skillCatalogue, findSkill, levelText, currentSet, addToCurrentSet,
    loadSetIntoQueue, optionsSummary, optionsReadOnlyHTML, readStore, writeStore,
} from './teacher-ui.js';
import { printSkills } from './teacher-print.js';
import { skillView, setSkillView, viewToggleHTML, mountSample, lazyThumbs } from './teacher-preview.js';
import { renderStandardsCoverage } from './teacher-standards.js';

// Standards (owner request 2026-09-25): the detail panel tags each skill with its CCSS standards
// and Essential Elements, the search finds skills by a standard code (3.OA.7, EE.3.OA.6), and a
// "Standards coverage" view lists every standard as covered or not. standards.js and its database
// are ~200 KB, so they load the first time the library opens, never at boot; until then the
// library works exactly as before.
let STD = null;
let stdLoading = null;
function loadStandards() {
    if (STD || stdLoading) return stdLoading;
    stdLoading = import('./standards.js').then((m) => {
        STD = m;
        if (root && root.isConnected) {
            renderResults();
            renderDetail();
            if (lib.mode === 'standards') renderStandardsView();
        }
        return m;
    }).catch((e) => { console.warn('[teacher-library] standards', e); stdLoading = null; return null; });
    return stdLoading;
}

const LEVELS = ['K', '1', '2', '3', '4', '5', '6', 'M'];
const UI_KEY = 'mq_teacher_library_ui';
const THUMB_PAGE = 60;

const lib = {
    query: '',
    level: '',          // '' = all levels
    domain: '',         // '' = all domains
    view: skillView(),  // 'list' | 'thumbs' (shared with the Send screen)
    sel: '',            // 'categoryId|skillId'
    opts: {},           // 'categoryId|skillId' -> the options chosen here (preview + actions)
    example: 0,         // which sample of the skill ("New example" steps it)
    menu: false,
    optionsOpen: false,
    thumbLimit: THUMB_PAGE,
    mode: 'skills',     // 'skills' | 'standards' (the Standards coverage view)
    stdHits: null,      // Set of 'categoryId:skillId' when the search is a standard code
    stdRec: null,       // the standard the search names, when it names exactly one
};

(function restore() {
    const s = readStore(UI_KEY, null);
    if (!s || typeof s !== 'object') return;
    if (LEVELS.includes(s.level)) lib.level = s.level;
    if (s.domain && DOMAINS[s.domain]) lib.domain = s.domain;
})();
function persist() { writeStore(UI_KEY, { level: lib.level, domain: lib.domain }); }

let root = null;

/* ================================================================= public */

export function renderLibraryScreen(el) {
    root = el;
    if (!root.dataset.built) {
        root.innerHTML = shellHTML();
        root.dataset.built = '1';
        wire();
    }
    // Arriving at the Library (the sidebar link, or back from a practice) shows the skill list:
    // Standards coverage is a view opened from here, not a place the link remembers.
    lib.mode = 'skills';
    syncControls();
    renderResults();
    renderDetail();
    syncMode();
    loadStandards();
}

/** Select a skill on the library screen (for callers that want to deep-link one). */
export function selectLibrarySkill(categoryId, skillId) {
    if (!findSkill(categoryId, skillId)) return false;
    lib.sel = `${categoryId}|${skillId}`;
    lib.example = 0;
    lib.optionsOpen = false;
    lib.menu = false;
    return true;
}

/* ================================================================= markup */

function shellHTML() {
    const domainOpts = Object.entries(DOMAINS).map(([id, d]) => `<option value="${esc(id)}">${esc(d.name)}</option>`).join('');
    const levelOpts = LEVELS.map((l) => `<option value="${l}">${l === 'M' ? 'Mixed levels' : `Level ${l}`}</option>`).join('');
    return `
<header class="tv-header">
  <div><h1 class="tv-h1" id="tvlTitle">Skills library</h1><p class="tv-sub" id="tvlSub">Every skill in Maths Quest. Choose one to see an example, then practise it, add it to a set or print it.</p></div>
  <div class="tv-header-actions"><button type="button" class="tv-btn tvl-std-toggle" data-lib-act="standards" title="Which Common Core standards and Essential Elements our skills cover, and which they do not yet">${icon('chart', 18)}<span>Standards coverage</span></button></div>
</header>
<section class="tvl-std-view" id="tvlStd" aria-labelledby="tvlTitle" hidden></section>
<div class="tvl-bar" role="search" aria-label="Find a skill">
  <div class="tv-search tvl-bar-search"><label class="tv-sr" for="tvlSearch">Search skills</label>${icon('search', 18)}<input id="tvlSearch" class="tv-input" type="search" placeholder="Search, e.g. subtract across zeros or 3.OA.7" autocomplete="off"></div>
  <div class="tvl-bar-filter"><label class="tv-sr" for="tvlLevel">Level</label><select id="tvlLevel" class="tv-select"><option value="">All levels</option>${levelOpts}</select></div>
  <div class="tvl-bar-filter"><label class="tv-sr" for="tvlDomain">Domain</label><select id="tvlDomain" class="tv-select"><option value="">All domains</option>${domainOpts}</select></div>
</div>
<div class="tvl-grid">
  <section class="tv-card tv-flush tvl-results" aria-labelledby="tvlCount">
    <div class="tv-card-head"><h2 class="tv-h2-sm" id="tvlCount" aria-live="polite">Skills</h2>
      <div class="tv-row tvl-head-tools"><button type="button" class="tv-btn tv-btn-ghost" data-lib-act="clear-filters" hidden>Clear filters</button>
      <div class="tvl-view" id="tvlView"></div></div></div>
    <div class="tvl-results-body" id="tvlResults"></div>
  </section>
  <aside class="tv-card tvl-detail" id="tvlDetail" aria-label="Selected skill"></aside>
</div>`;
}

function syncControls() {
    const q = root.querySelector('#tvlSearch');
    if (q && document.activeElement !== q) q.value = lib.query;
    root.querySelector('#tvlLevel').value = lib.level;
    root.querySelector('#tvlDomain').value = lib.domain;
    root.querySelector('#tvlView').innerHTML = viewToggleHTML(lib.view);
}

/* ================================================================= browse */

function matches(s) {
    if (lib.level && s.level !== lib.level) return false;
    if (lib.domain && s.domainId !== lib.domain) return false;
    if (lib.stdHits) return lib.stdHits.has(`${s.categoryId}:${s.skillId}`);
    const words = lib.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return true;
    const hay = `${s.label} ${s.categoryName} ${s.domainName} ${s.skillId.replace(/_/g, ' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w));
}

function shown() { return skillCatalogue().filter(matches); }

function keyOf(s) { return `${s.categoryId}|${s.skillId}`; }

/** A search that is a standard code (3.OA.7, 3.OA, EE.3.OA.6, M.3.OA.C.6) finds skills by standard. */
function stdSearch() {
    lib.stdHits = null;
    lib.stdRec = null;
    const q = lib.query.trim();
    if (!STD || !q || !STD.looksLikeStandardCode(q)) return;
    const rec = STD.findStandard(q);
    lib.stdRec = rec;
    lib.stdHits = new Set(rec ? STD.skillsForStandard(q) : STD.skillsMatchingCode(q));
}

function stdBannerHTML(count) {
    const q = lib.query.trim();
    const r = lib.stdRec;
    if (!r) {
        return `<div class="tvl-std-banner"><p class="tv-cap">${count ? `Skills tagged with a standard starting ${esc(q)}.` : `No standard or skill matches ${esc(q)}.`}</p></div>`;
    }
    const kind = r.type === 'ee' ? 'Essential Element' : r.type === 'wi' ? 'Wisconsin standard' : 'Common Core';
    return `<div class="tvl-std-banner"><p class="tvl-std-banner-code">${esc(r.short || r.code)} <span class="tv-muted">· ${kind}, Level ${esc(r.grade)}</span></p>
      <p class="tvl-std-banner-text">${esc(r.text)}</p>${count ? '' : '<p class="tv-cap">No skill covers this yet. It is on the gap list in Standards coverage.</p>'}</div>`;
}

function renderResults() {
    const box = root.querySelector('#tvlResults');
    stdSearch();
    const list = shown();
    if (lib.stdHits) {
        const banner = stdBannerHTML(list.length);
        root.querySelector('#tvlCount').textContent = `${list.length} skill${list.length === 1 ? '' : 's'}`;
        root.querySelector('[data-lib-act="clear-filters"]').hidden = false;
        if (!list.length) { box.innerHTML = banner; return; }
        if (lib.view === 'thumbs') renderThumbs(box, list); else renderList(box, list);
        box.insertAdjacentHTML('afterbegin', banner);
        return;
    }
    const filtered = !!(lib.query.trim() || lib.level || lib.domain);
    root.querySelector('#tvlCount').textContent = `${list.length} skill${list.length === 1 ? '' : 's'}${filtered ? '' : ' in all'}`;
    root.querySelector('[data-lib-act="clear-filters"]').hidden = !filtered;
    if (!list.length) {
        box.innerHTML = `<div class="tv-empty-lg"><span class="tv-empty-icon" aria-hidden="true">${icon('search', 22)}</span>
          <div class="tv-h3">No skills match</div><p class="tv-cap">Try fewer words, or clear the filters.</p></div>`;
        return;
    }
    if (lib.view === 'thumbs') renderThumbs(box, list);
    else renderList(box, list);
}

/** Grouped by domain, then category: a plain list of rows. */
function renderList(box, list) {
    let html = '';
    let dom = '', cat = '';
    for (const s of list) {
        if (s.domainId !== dom) {
            if (dom) html += '</ul></div>';
            dom = s.domainId; cat = '';
            html += `<div class="tvl-group"><h3 class="tvl-group-h">${esc(s.domainName)}</h3><ul class="tvl-list" role="list">`;
        }
        if (s.categoryId !== cat) {
            cat = s.categoryId;
            html += `<li class="tvl-cat" role="presentation">${esc(s.categoryName)}</li>`;
        }
        const k = keyOf(s);
        html += `<li><button type="button" class="tvl-row" data-lib-skill="${esc(k)}"${lib.sel === k ? ' aria-current="true"' : ''}>
          <span class="tvl-row-name">${esc(s.label)}</span><span class="tvl-row-level">${esc(s.level === 'M' ? 'Mixed' : `Level ${s.level}`)}</span></button></li>`;
    }
    if (dom) html += '</ul></div>';
    box.innerHTML = html;
}

/** A grid of small paper-cell thumbnails (teacher-preview.js), drawn as they scroll into view. */
function renderThumbs(box, list) {
    const page = list.slice(0, lib.thumbLimit);
    box.innerHTML = `<ul class="tvl-thumbs" role="list">${page.map((s) => {
        const k = keyOf(s);
        const o = lib.opts[k] && Object.keys(lib.opts[k]).length ? ` data-tvp-opts="${esc(JSON.stringify(lib.opts[k]))}"` : '';
        return `<li><button type="button" class="tvl-thumb" data-lib-skill="${esc(k)}"${lib.sel === k ? ' aria-current="true"' : ''}>
          <span class="tvp-frame tvp-thumb" data-tvp-lazy="${esc(k)}"${o} aria-hidden="true"></span>
          <span class="tvl-thumb-name">${esc(s.label)}</span>
          <span class="tvl-thumb-meta">${esc(levelText(s.level))} · ${esc(s.categoryName)}</span></button></li>`;
    }).join('')}</ul>
    ${list.length > page.length ? `<div class="tvl-more"><button type="button" class="tv-btn" data-lib-act="more">Show more <span class="tv-muted">(${list.length - page.length} left)</span></button></div>` : ''}`;
    lazyThumbs(box, null);
}

/* ================================================================= detail */

function selected() {
    if (!lib.sel) return null;
    const [c, s] = lib.sel.split('|');
    return findSkill(c, s);
}

function inCurrentSet(s) { return currentSet().some((x) => x.categoryId === s.categoryId && x.skillId === s.skillId); }

function hasOptions(s) {
    try { return optionsFor(s.categoryId, s.skillId).length > 0; } catch (e) { return false; }
}

function renderDetail() {
    const box = root.querySelector('#tvlDetail');
    const s = selected();
    box.classList.toggle('is-empty', !s);
    if (!s) {
        box.innerHTML = `<div class="tv-empty-lg tvl-detail-empty"><span class="tv-empty-icon" aria-hidden="true">${icon('eye', 22)}</span>
          <div class="tv-h3">Choose a skill</div><p class="tv-cap">Its example appears here, with what you can do with it.</p></div>`;
        return;
    }
    const k = keyOf(s);
    const opts = lib.opts[k];
    const sum = optionsSummary(s.categoryId, s.skillId, opts);
    const inSet = inCurrentSet(s);
    const optionable = hasOptions(s);
    box.innerHTML = `
  <div class="tvl-detail-head">
    <h2 class="tv-h2" id="tvlSelName">${esc(s.label)}</h2>
    <p class="tv-cap">${esc(levelText(s.level))} · ${esc(s.domainName)} · ${esc(s.categoryName)}</p>
  </div>
  ${standardsTagsHTML(s)}
  <div class="tvl-prev">
    <div class="tvl-prev-head"><span class="tv-label" style="margin:0;">Example</span>
      <button type="button" class="tv-btn tv-btn-ghost" data-lib-act="new-example">${icon('reset', 16)}<span>New example</span></button></div>
    <div class="tvp-frame tvl-stage" id="tvlStage"></div>
    ${sum ? `<p class="tv-cap">Options: ${esc(sum)}</p>` : ''}
  </div>
  <div class="tvl-actions">
    <button type="button" class="tv-btn tv-btn-primary tv-btn-block" data-lib-act="practise">${icon('play', 18)}<span>Practise now</span></button>
    <div class="tvl-actions-row">
      <button type="button" class="tv-btn" data-lib-act="add" aria-pressed="${inSet}"${inSet ? ' title="Already in your current set. Open it in Send a skill set."' : ''}>${icon(inSet ? 'check' : 'plus', 18)}<span>${inSet ? 'In your set' : 'Add to skill set'}</span></button>
      <button type="button" class="tv-btn" data-lib-act="print">${icon('print', 18)}<span>Print</span></button>
      <div class="tv-menu-wrap">
        <button type="button" class="tv-btn tvl-more-btn" data-lib-act="menu" aria-haspopup="true" aria-expanded="${lib.menu}" aria-label="More actions for ${esc(s.label)}">${icon('dots', 20)}</button>
        <div class="tv-menu" role="menu"${lib.menu ? '' : ' hidden'}>
          ${optionable ? `<button type="button" role="menuitem" data-lib-act="options">${icon('sliders', 16)}<span>Options</span></button>` : ''}
          <button type="button" role="menuitem" data-lib-act="link">${icon('link', 16)}<span>Copy pupil link</span></button>
          <button type="button" role="menuitem" data-lib-act="quiz">${icon('sheet', 16)}<span>Make a quiz</span></button>
        </div>
      </div>
    </div>
  </div>
  <div class="tv-opt-panel" id="tvlOptions"${lib.optionsOpen ? '' : ' hidden'}>${lib.optionsOpen ? optionsReadOnlyHTML(s.categoryId, s.skillId, opts) : ''}</div>`;
    drawDetailPreview();
}

/**
 * The skill's standards as quiet tags: CCSS first (primary first), then Essential Elements.
 * Hovering or focusing a tag shows its descriptor (a tooltip linked by aria-describedby).
 */
function standardsTagsHTML(s) {
    if (!STD) return '';
    const st = STD.standardsFor(s.categoryId, s.skillId);
    if (!st.ccss.length && !st.ee.length) {
        return st.reason ? `<div class="tvl-std"><p class="tv-cap"><span class="tvl-std-k">Standards</span> ${esc(st.reason)}</p></div>` : '';
    }
    let n = 0;
    const tags = (list, ee) => list.map((r) => {
        const id = `tvlTip${n++}`;
        return `<li><span class="tvl-tag${ee ? ' tvl-tag-ee' : ''}" tabindex="0" aria-describedby="${id}">${esc(r.short)}</span>`
            + `<span class="tvl-tip" role="tooltip" id="${id}"><b>${esc(r.code)}</b> ${esc(r.text)}</span></li>`;
    }).join('');
    const row = (k, title, list, ee) => (list.length
        ? `<div class="tvl-std-row"><span class="tvl-std-k" title="${esc(title)}">${k}</span><ul class="tvl-tags" role="list" aria-label="${esc(title)}">${tags(list, ee)}</ul></div>` : '');
    return `<div class="tvl-std">
    ${row('CCSS', 'Common Core State Standards', st.ccss, false)}
    ${row('EE', 'Essential Elements', st.ee, true)}
    ${st.approx ? `<p class="tv-cap">Closest match: ${esc(st.note)}</p>` : ''}
  </div>`;
}

/* ---------------------------------------------------------------- standards coverage view */

function syncMode() {
    const std = lib.mode === 'standards';
    const view = root.querySelector('#tvlStd');
    view.hidden = !std;
    root.querySelector('.tvl-bar').hidden = std;
    root.querySelector('.tvl-grid').hidden = std;
    root.querySelector('#tvlTitle').textContent = std ? 'Standards coverage' : 'Skills library';
    root.querySelector('#tvlSub').textContent = std
        ? 'Every Common Core standard and Essential Element for levels K to 6. The ones not covered yet are the skills still to make.'
        : 'Every skill in Maths Quest. Choose one to see an example, then practise it, add it to a set or print it.';
    const t = root.querySelector('.tvl-std-toggle');
    t.dataset.libAct = std ? 'skills' : 'standards';
    t.classList.toggle('is-back', std);
    t.innerHTML = std ? `${icon('arrow', 18)}<span>Back to skills</span>` : `${icon('chart', 18)}<span>Standards coverage</span>`;
    t.title = std ? 'Back to the Skills library' : 'Which Common Core standards and Essential Elements our skills cover, and which they do not yet';
    if (std) renderStandardsView();
}

function renderStandardsView() {
    const view = root.querySelector('#tvlStd');
    if (!STD) {
        view.innerHTML = `<div class="tv-card"><p class="tv-cap">Loading the standards…</p></div>`;
        delete view.dataset.built;
        return;
    }
    renderStandardsCoverage(view, STD, (key) => {
        const [c, k] = key.split(':');
        const hit = findSkill(c, k);
        return hit ? hit.label : '';
    });
}

function drawDetailPreview() {
    const s = selected();
    const stage = root.querySelector('#tvlStage');
    if (!s || !stage) return;
    mountSample(stage, s.categoryId, s.skillId, lib.opts[keyOf(s)], lib.example);
}

/* ================================================================= actions */

function oneSkill(s) {
    const item = { categoryId: s.categoryId, skillId: s.skillId, weight: 1 };
    const opts = lib.opts[keyOf(s)];
    if (opts && Object.keys(opts).length) item.opts = opts;
    return item;
}

function snapshotQueue() {
    return currentSet().map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, weight: x.weight, opts: x.opts }));
}

/** Run one skill now, then give the teacher's current set back (the game keeps its own copy). */
function practise(s) {
    const before = snapshotQueue();
    loadSetIntoQueue({ skills: [oneSkill(s)] });
    try {
        window.playSelectedSkills?.('practice');
    } finally {
        loadSetIntoQueue({ skills: before });
    }
}

async function copyLink(s) {
    const before = snapshotQueue();
    const prevSettings = state.shareSettings;
    const prevType = state.shareLinkType;
    let link = '';
    loadSetIntoQueue({ skills: [oneSkill(s)] });
    try {
        state.shareSettings = { timer: '?', problemCount: '?', gameMode: 'practice', range: '?', decimals: '?', quickStartLocked: '?' };
        state.shareLinkType = 'direct';
        link = window.generateShareableLink ? window.generateShareableLink() : '';
    } catch (e) {
        link = '';
    } finally {
        loadSetIntoQueue({ skills: before });
        state.shareSettings = prevSettings;
        state.shareLinkType = prevType;
    }
    if (!link) { toast('Could not make a link for this skill'); return; }
    toast((await copyText(link)) ? 'Pupil link copied' : 'Could not copy the link');
}

function makeQuiz(s) {
    window.openQuizBuilder?.();
    setTimeout(() => {
        try { addMultipleQuestions(s.skillId, 5); } catch (e) { console.warn('[teacher-library] quiz', e); }
    }, 100);
}

function openOptions(s, anchor) {
    const k = keyOf(s);
    if (typeof window.openSkillOptionsPanel === 'function') {
        window.openSkillOptionsPanel(s.categoryId, s.skillId, anchor, {
            opts: lib.opts[k] || {},
            onChange: (next) => {
                lib.opts[k] = next && typeof next === 'object' ? next : {};
                lib.example = 0;
                renderDetail();
            },
        });
        return;
    }
    lib.optionsOpen = !lib.optionsOpen;
    renderDetail();
}

function onAction(act, btn) {
    const s = selected();
    switch (act) {
        case 'clear-filters':
            lib.query = ''; lib.level = ''; lib.domain = ''; lib.thumbLimit = THUMB_PAGE;
            persist(); syncControls(); renderResults();
            return;
        case 'more':
            lib.thumbLimit += THUMB_PAGE;
            renderResults();
            return;
        case 'standards':
        case 'skills':
            lib.mode = act;
            lib.menu = false;
            syncMode();
            root.querySelector('.tvl-std-toggle')?.focus();
            return;
        default: break;
    }
    if (!s) return;
    if (act !== 'menu') lib.menu = false;
    switch (act) {
        case 'new-example': lib.example += 1; drawDetailPreview(); break;
        case 'practise': practise(s); break;
        case 'add': {
            if (inCurrentSet(s)) { window.tvGo?.('sets'); return; }
            const item = oneSkill(s);
            addToCurrentSet(s.categoryId, s.skillId, { opts: item.opts });
            window.skillQueue = [...currentSet()];
            const n = currentSet().length;
            toast(`Added to your set · ${n} skill${n === 1 ? '' : 's'}`);
            renderDetail();
            root.querySelector('[data-lib-act="add"]')?.focus();
            break;
        }
        case 'print':
            printSkills([oneSkill(s)]);
            window.tvGo?.('print');
            break;
        case 'menu':
            lib.menu = !lib.menu;
            renderDetail();
            if (lib.menu) root.querySelector('#tvlDetail .tv-menu button')?.focus();
            else root.querySelector('[data-lib-act="menu"]')?.focus();
            break;
        case 'options': openOptions(s, root.querySelector('[data-lib-act="menu"]') || btn); if (!lib.menu) root.querySelector('[data-lib-act="menu"]')?.focus(); break;
        case 'link': renderDetail(); copyLink(s); break;
        case 'quiz': makeQuiz(s); break;
        default: break;
    }
}

function select(key) {
    if (lib.sel === key) return;
    lib.sel = key;
    lib.example = 0;
    lib.menu = false;
    lib.optionsOpen = false;
    root.querySelectorAll('[data-lib-skill]').forEach((b) => {
        if (b.dataset.libSkill === key) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    renderDetail();
    // On a narrow screen the detail sits above the list: bring it into view.
    if (window.matchMedia && window.matchMedia('(max-width: 1100px)').matches) {
        root.querySelector('#tvlDetail')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
}

/* ================================================================= wiring */

function wire() {
    document.addEventListener('click', (e) => {
        // A click inside the screen re-renders the detail, which can detach its target first.
        if (!e.target.isConnected) return;
        if (lib.menu && root && !root.contains(e.target)) { lib.menu = false; renderDetail(); }
    });
    root.addEventListener('click', (e) => {
        const b = e.target.closest('button');
        if (!b || !root.contains(b)) {
            if (lib.menu && !e.target.closest('.tv-menu-wrap')) { lib.menu = false; renderDetail(); }
            return;
        }
        if (b.dataset.libSkill) { select(b.dataset.libSkill); return; }
        if (b.dataset.stdSkill) {
            // A skill named in the coverage view: open it in the library.
            lib.mode = 'skills';
            syncMode();
            select(b.dataset.stdSkill.replace(':', '|'));
            root.querySelector(`[data-lib-skill="${CSS.escape(lib.sel)}"]`)?.scrollIntoView({ block: 'nearest' });
            return;
        }
        if (b.dataset.act === 'skill-view') {
            const v = b.dataset.view === 'thumbs' ? 'thumbs' : 'list';
            if (lib.view !== v) {
                lib.view = v; setSkillView(v); syncControls(); renderResults();
                root.querySelector(`[data-act="skill-view"][data-view="${v}"]`)?.focus();
            }
            return;
        }
        if (b.dataset.libAct) { onAction(b.dataset.libAct, b); return; }
        if (lib.menu && !b.closest('.tv-menu-wrap')) { lib.menu = false; renderDetail(); }
    });
    let t = null;
    root.addEventListener('input', (e) => {
        if (e.target.id !== 'tvlSearch') return;
        lib.query = e.target.value;
        lib.thumbLimit = THUMB_PAGE;
        clearTimeout(t);
        t = setTimeout(renderResults, 120);
    });
    root.addEventListener('change', (e) => {
        if (e.target.id === 'tvlLevel') { lib.level = e.target.value; }
        else if (e.target.id === 'tvlDomain') { lib.domain = e.target.value; }
        else return;
        lib.thumbLimit = THUMB_PAGE;
        persist();
        renderResults();
    });
    root.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lib.menu) {
            lib.menu = false; renderDetail(); root.querySelector('[data-lib-act="menu"]')?.focus();
            return;
        }
        // Arrow keys move through the skills (list rows or thumbnails) and the menu items.
        if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const menuItem = e.target.closest('.tv-menu [role="menuitem"]');
        if (menuItem) {
            const items = [...menuItem.parentElement.querySelectorAll('[role="menuitem"]')];
            const i = items.indexOf(menuItem);
            const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
            items[(i + step + items.length) % items.length]?.focus();
            e.preventDefault();
            return;
        }
        const cur = e.target.closest('[data-lib-skill]');
        if (!cur) return;
        const all = [...root.querySelectorAll('#tvlResults [data-lib-skill]')];
        const i = all.indexOf(cur);
        let step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : -1;
        if (lib.view === 'thumbs' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            const top = cur.getBoundingClientRect().top;
            const perRow = all.filter((b) => Math.abs(b.getBoundingClientRect().top - top) < 2).length || 1;
            step *= perRow;
        }
        const next = all[i + step];
        if (next) { next.focus(); e.preventDefault(); }
    });
}
