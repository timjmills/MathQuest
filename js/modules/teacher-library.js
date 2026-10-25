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

import { rankByQuery, onSkillSearchReady } from './skill-finder.js';
import { state } from './state.js';
import { DOMAINS, SKILLS } from './data.js';
import { presetOf } from './skill-presets.js';
import { optionsFor } from './skill-options.js';
import { addMultipleQuestions } from './quiz-builder.js';
import {
    icon, esc, toast, copyText, skillCatalogue, findSkill, levelText, currentSet, addToCurrentSet,
    loadSetIntoQueue, optionsSummary, optionsReadOnlyHTML, readStore, writeStore,
} from './teacher-ui.js';
import { printSkills } from './teacher-print.js';
import { skillView, setSkillView, viewToggleHTML, mountSample, lazyThumbs, tvpAttrs, infoButtonHTML } from './teacher-preview.js';
import { renderStandardsCoverage, coverageRows } from './teacher-standards.js';
import { areaDetail, areaOfCode, AREAS, AREA_ORDER, areaIcon } from './teacher-areas.js';
import { primaryStandard } from './standards.js';
import { mapTaskList, mapStrandNames } from './teacher-map-tasks.js';
import {
    trayHas, trayToggle, trayAddMany, trayLoadSet, onTrayChange, renderBar, restoreTray, syncTray, setThumbDrawer,
    gbadge, gradeName, shortName, trayItems, TRAY_SET_ID, openTrayPopup,
} from './teacher-tray.js';
import { mountCropped, refitCropped, croppedReady } from './teacher-chip.js';
import { savedSets } from './teacher-ui.js';

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
            refreshResults();
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
  <div><h1 class="tv-h1" id="tvlTitle">Skills library</h1><p class="tv-sub" id="tvlSub">Every skill in Math Quest Pro. Choose one to see an example, then practise it, add it to a set or print it.</p></div>
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
    return true;
}

// The words are matched by the shared thesaurus search (skill-finder.js), best match first.
function shown() {
    const list = skillCatalogue().filter(matches);
    return lib.stdHits ? list : rankByQuery(list, lib.query);
}

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

/** What renderResults last drew: the view, the selection and the skills in order. */
let resultsSig = '';
function resultsSignature(list) {
    return [lib.view, lib.sel, lib.stdHits ? 'std' : '', list.map(keyOf).join(',')].join('|');
}

/** A late load (search terms, standards) re-draws the results only when they changed: re-drawing the same
 *  list would blank its drawn thumbnails while they are drawn again. */
function refreshResults() {
    stdSearch();
    if (resultsSig && resultsSignature(shown()) === resultsSig) return;
    renderResults();
}

function renderResults() {
    const box = root.querySelector('#tvlResults');
    stdSearch();
    const list = shown();
    resultsSig = resultsSignature(list);
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
        // Owner request 2026-09-25: a row shows the skill's floating preview (teacher-preview.js)
        // on hover and on keyboard focus, like the chips elsewhere; on a touch screen the (i)
        // button beside the row pins it. The trigger is the <li> so the (i) button can sit beside
        // the row button (a button cannot hold a button); the pop anchors to the row itself.
        html += `<li class="tvl-li"${tvpAttrs(s.categoryId, s.skillId, lib.opts[k])}><button type="button" class="tvl-row" data-tvp-anchor data-lib-skill="${esc(k)}"${lib.sel === k ? ' aria-current="true"' : ''}>
          <span class="tvl-row-name">${esc(s.label)}</span><span class="tvl-row-level">${esc(s.level === 'M' ? 'Mixed' : `Level ${s.level}`)}</span></button>${infoButtonHTML(s.label)}</li>`;
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
  ${presetNoteHTML(s)}
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

/** A PRESET skill (skill-presets.js) says which skill it opens: the host with set options, still editable. */
function presetNoteHTML(s) {
    const p = presetOf(s.categoryId, s.skillId);
    if (!p) return '';
    const host = (SKILLS[s.categoryId] || []).find((x) => x.v === p.skillId);
    return `<p class="tv-cap tvl-preset-note">Uses ${esc(host ? host.l : p.skillId)} with set options (you can change them).</p>`;
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
        : 'Every skill in Math Quest Pro. Choose one to see an example, then practise it, add it to a set or print it.';
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

/* The search bar and its filters stay at the top of the window while the list scrolls (owner
   request 2026-09-25). CSS makes .tvl-bar sticky; this keeps --tvl-bar-h (the bar's height, which
   the sticky detail panel and the document's scroll-padding read) current, and marks the bar
   .is-stuck once content scrolls under it so it draws its bottom rule only then. */
function wireStickyBar() {
    const bar = root.querySelector('.tvl-bar');
    if (!bar) return;
    const html = document.documentElement;
    const measure = () => {
        const h = bar.offsetHeight;
        if (h) html.style.setProperty('--tvl-bar-h', `${h}px`);
    };
    let raf = 0;
    const stuck = () => {
        raf = 0;
        if (!bar.isConnected || !bar.offsetParent) return;
        const on = window.scrollY > 0 && bar.getBoundingClientRect().top <= 0.5;
        if (bar.classList.contains('is-stuck') !== on) bar.classList.toggle('is-stuck', on);
    };
    try { new ResizeObserver(() => { measure(); stuck(); }).observe(bar); } catch (e) { measure(); }
    window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(stuck); }, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    measure();
}

function wire() {
    wireStickyBar();
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

// The standards / WRM terms load after boot: re-run a search that is on screen (critic r1 N2).
onSkillSearchReady(() => { try { if (root && root.isConnected && lib.query.trim()) refreshResults(); } catch (e) { /* screen gone */ } });


/* =====================================================================================================================
   Teacher site 2.0 (lane S2, T3a): THE SKILLS GALLERY — the Skills place (IMPROVEMENT_PLAN §2.3; the signed mock-up
   design/mockups/teacher-2/app.js skillsScreen()).

   One big search through skill-finder.js (never label-only); Browse by Maths area · White Rose step · Standard
   (covered / not yet, teacher-standards.js) · MAP strand · My sets; Grade chips; Big 3 / Medium 4 / Small 5 cards or
   List, 60 per page, filtered by grade; on every card the grade badge (a neutral numbered ink circle) and the area
   word + icon, its colours from areaOf() (teacher-areas.js); tick → tray (teacher-tray.js); Add whole grade / Add whole
   area / Add all N on a standard, each with Undo.

   Thumbnails are the skill's REAL item, drawn by the app's preview path (teacher-preview.js mountSample: the seeded
   item through generateQuestionFor, the black-and-white paper cell, no page header and so no strand tab), CROPPED to
   the drawn content box: anchored at its left / top when it must be cut, never below the place's smallest text (Big
   12 px, Medium 11, Small 9), a cut edge fading. Drawn lazily as they scroll into view; the measure is cached per skill
   + options + seed, so a re-render redraws at once.
   ===================================================================================================================== */

const G_KEY = 'mq_teacher_skills_ui';
const G_PAGE = 60;
const BROWSE = [['area', 'Maths area', 'Area'], ['wrm', 'White Rose step', 'White Rose'], ['std', 'Standard', 'Standard'], ['map', 'MAP strand', 'MAP'], ['sets', 'My sets', 'Sets']];
// owner 2026-10-24 (owner-2026-10-24/skills-hierarchy.webp): Size Big · Medium · Small in the filter card, and the
// view Thumbnail · List · Chip on every area band (one choice for the page).
const SIZES = [['big', 'Big'], ['medium', 'Medium'], ['small', 'Small']];
const LAYOUTS = [['thumb', 'Thumbnail', 'grid'], ['list', 'List', 'list'], ['chip', 'Chip', 'layers']];
const GRADES = [['K', 'K', 'Kindergarten'], ['1', '1', 'Grade 1'], ['2', '2', 'Grade 2'], ['3', '3', 'Grade 3'], ['4', '4', 'Grade 4'], ['5', '5', 'Grade 5'], ['6', '6', 'Grade 6'], ['M', 'Mixed levels', 'Mixed levels']];

const G = { q: '', browse: 'area', grade: '2', grades: ['2'], size: 'medium', layout: 'thumb', limit: G_PAGE, open: {}, fw: 'ccss', status: 'all' };
/** The grid's data-view: a card size for thumbnails, else 'list' / 'chip'. */
const gv = () => (G.layout === 'thumb' ? G.size : G.layout);
(function restoreG() {
    const s = readStore(G_KEY, null);
    if (!s || typeof s !== 'object') return;
    if (BROWSE.some((b) => b[0] === s.browse)) G.browse = s.browse;
    if (GRADES.some((g) => g[0] === s.grade)) G.grade = s.grade;
    const gs = Array.isArray(s.grades) ? GRADES.map((g) => g[0]).filter((g) => s.grades.includes(g)) : [];
    G.grades = gs.length ? gs : [G.grade];
    G.grade = G.grades[0];
    if (SIZES.some((v) => v[0] === s.size)) G.size = s.size;
    if (LAYOUTS.some((v) => v[0] === s.layout)) G.layout = s.layout;
    if (s.view === 'list' && !s.layout) G.layout = 'list';
    if (s.fw === 'ee') G.fw = 'ee';
    if (['all', 'gaps', 'covered'].includes(s.status)) G.status = s.status;
})();
function persistG() { writeStore(G_KEY, { browse: G.browse, grade: G.grade, grades: G.grades, size: G.size, layout: G.layout, fw: G.fw, status: G.status }); }

let groot = null;
const gkey = (s) => `${s.categoryId}:${s.skillId}`;
const plural2 = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const pressedA = (on) => `aria-pressed="${on ? 'true' : 'false'}"`;

/** The area of a catalogue entry, and whether it is a mixed pool inside its category. */
const AD = new Map();
function adOf(s) {
    const k = gkey(s);
    if (!AD.has(k)) { let d; try { d = areaDetail(s.categoryId, s.skillId); } catch (e) { d = { area: 'NOSTD', pool: false }; } AD.set(k, d); }
    return AD.get(k);
}
const stdShort = new Map();
function stdOf(s) {
    const k = gkey(s);
    if (!stdShort.has(k)) { let c = ''; try { c = primaryStandard(s.categoryId, s.skillId, { short: true }) || ''; } catch (e) { c = ''; } stdShort.set(k, c); }
    return stdShort.get(k);
}
const stdSort = (x, y) => (stdOf(x) || 'zz').localeCompare(stdOf(y) || 'zz', 'en', { numeric: true }) || x.label.localeCompare(y.label);

/** A WHOLE GRADE (or area): one of each skill — no Mixed pools, no Maths words cards, no "(No Pictures)" twin. */
function wholeSet(g, a) {
    return skillCatalogue().filter((s) => s.level === g && !adOf(s).pool && adOf(s).area !== 'WORDS' && (!a || adOf(s).area === a)
        && !/\((no pictures|no visuals)\)/i.test(s.label)).map(gkey);
}

// Several grades at once (owner 2026-10-25: "select multiple grades or all grades"): G.grades in pill order;
// G.grade is the first one (the White Rose and Standard views draw one grade at a time).
const ALL_GRADES = GRADES.map((g) => g[0]);
const allOn = () => ALL_GRADES.every((g) => G.grades.includes(g));
const multi = () => G.grades.length > 1;
const realGrades = () => G.grades.filter((g) => g !== 'M');
/** One of each skill across every selected grade (or one area of them). */
const wholeSetG = (a) => realGrades().flatMap((g) => wholeSet(g, a));
function gradesNameOf(gs) {
    const ls = gs.map((g) => (g === 'K' ? 'K' : g === 'M' ? 'Mixed levels' : g));
    return ls.length > 1 ? `Grades ${ls.slice(0, -1).join(', ')} and ${ls[ls.length - 1]}` : gradeName(gs[0]);
}
function gradesName() {
    if (allOn()) return 'All grades';
    if (!multi()) return gradeName(G.grade);
    const ls = G.grades.map((g) => (g === 'K' ? 'K' : g === 'M' ? 'Mixed levels' : g));
    return `Grades ${ls.slice(0, -1).join(', ')} and ${ls[ls.length - 1]}`;
}
function pickGrade(g) {
    if (g === 'ALL') G.grades = allOn() ? ['2'] : ALL_GRADES.slice();
    else if (allOn()) G.grades = [g];                           // from All, a grade means just that grade
    else if (G.grades.includes(g)) { if (multi()) G.grades = G.grades.filter((x) => x !== g); }
    else G.grades = ALL_GRADES.filter((x) => x === g || G.grades.includes(x));
    G.grade = G.grades[0];
}
/** Draw `fn` once per selected grade (one at a time), each under its grade heading when there are several. */
function perGrade(fn) {
    const gs = realGrades().length ? realGrades() : G.grades;
    if (gs.length === 1) { G.grade = gs[0]; const h = fn(); G.grade = G.grades[0]; return h; }
    const out = gs.map((g) => { G.grade = g; return `<h2 class="ts-grade-head ts-grade-sec">${gbadge(g, true)}</h2>${fn()}`; }).join('');
    G.grade = G.grades[0];
    return out;
}

/* ------------------------------------------------------------------ public */

export function renderSkillsScreen(el) {
    groot = el;
    if (!el.dataset.built) {
        el.innerHTML = gShellHTML();
        el.dataset.built = '1';
        gWire();
    }
    restoreTray();
    gSyncControls();
    gRender();
    syncTray();
}

/* ------------------------------------------------------------------ markup */

function gShellHTML() {
    return `
<div class="ts-top">
  <div class="ts-head-text"><h1 class="tv-h1 ts-title">Skills</h1><p class="ts-sub">Select skills to build your tray.</p><p class="ts-meta" id="tsEyebrow"></p></div>
  <label class="ts-search"><span class="tv-sr">Search skills or standards</span>${icon('search', 20)}<input id="tsSearch" type="search" placeholder="Search skills or standards: “add within 20”, “2.NBT.5”" autocomplete="off"></label>
</div>
<div class="ts-filters">
  <div class="ts-frow"><span class="ts-flabel" id="tsGradeL">Grade</span><div class="ts-pills" role="group" aria-labelledby="tsGradeL" id="tsGrades"></div><span class="ts-note" id="tsSearchNote"></span></div>
  <div class="ts-fdiv" role="presentation"></div>
  <div class="ts-frow"><span class="ts-flabel" id="tsBrowseL">Browse by</span><div class="ts-seg ts-browse" role="group" aria-labelledby="tsBrowseL" id="tsBrowse"></div>
    <span class="ts-fsep" role="presentation"></span><span class="ts-flabel" id="tsSizeL">Size</span><div class="ts-seg" role="group" aria-labelledby="tsSizeL" id="tsViews"></div></div>
</div>
<div id="tsList" class="ts-list"></div>`;
}

function gSyncControls() {
    const r = groot;
    const inp = r.querySelector('#tsSearch');
    if (inp && document.activeElement !== inp) inp.value = G.q;
    const searching = !!G.q.trim();
    r.querySelector('#tsBrowse').innerHTML = BROWSE.map(([k, l]) => `<button type="button" data-act="browse" data-arg="${k}" ${pressedA(G.browse === k)}>${l}</button>`).join('');
    r.querySelector('#tsViews').innerHTML = SIZES.map(([k, l]) => `<button type="button" data-act="size" data-arg="${k}" ${pressedA(G.size === k)}${G.layout === 'thumb' ? '' : ' title="The size of the thumbnail cards"'}>${l}</button>`).join('');
    r.querySelector('#tsGrades').innerHTML = `<button type="button" class="ts-pill ts-pill-all" data-act="grade" data-arg="ALL" ${pressedA(allOn() && !searching)} title="Every grade at once">All</button>` + GRADES.map(([g, l, long]) => `<button type="button" class="ts-pill" data-act="grade" data-arg="${g}" data-grade="${g}" ${pressedA(G.grades.includes(g) && !allOn() && !searching)}${l !== long ? ` aria-label="${esc(long)}"` : ''}><i class="ts-gsw" aria-hidden="true"></i>${esc(l)}</button>`).join('');
    r.querySelector('#tsSearchNote').textContent = searching ? 'Searching all grades' : '';
    r.classList.toggle('ts-searching', searching);
}

/** Thumbnail · List · Chip, on every area band (one choice for the page). */
function layoutSegHTML() {
    return `<div class="ts-seg ts-layout" role="group" aria-label="View">${LAYOUTS.map(([k, l, ic]) => `<button type="button" data-act="layout" data-arg="${k}" ${pressedA(G.layout === k)} aria-label="${l}">${icon(ic, 18)}<span aria-hidden="true">${l}</span></button>`).join('')}</div>`;
}

/** A skill card: grade pill + tick, bold name, the real item, area word + icon. data-skill = 'category:skill'. */
function gCard(s) {
    const k = gkey(s);
    const d = adOf(s);
    const a = d.area;
    const on = trayHas(k);
    const v = gv();
    const tick = `<span class="ts-tick" aria-hidden="true"><span>${on ? '✓' : ''}</span></span><span class="tv-sr">${on ? ', in the tray' : ', tick to add'}</span>`;
    if (v === 'chip') {
        return `<button type="button" class="ts-card ts-chipcard" data-domain="${a}" data-act="tick" data-skill="${esc(k)}" ${pressedA(on)}${tvpAttrs(s.categoryId, s.skillId)}>${gbadge(s.level)}<span class="ts-chip-ic">${areaIcon(a, 16)}</span><span class="ts-card-name">${esc(s.label).replace(/\//g, '/<wbr>')}</span>${tick}</button>`;
    }
    const list = v === 'list';
    const thumb = list ? '' : `<span class="ts-thumb" data-ts-thumb="${esc(s.categoryId)}|${esc(s.skillId)}" data-ts-size="${v}"${tvpAttrs(s.categoryId, s.skillId, trayOpts(s.categoryId, s.skillId))} data-tvp-flip aria-hidden="true"></span>`;
    return `<button type="button" class="ts-card" data-domain="${a}" data-act="tick" data-skill="${esc(k)}" ${pressedA(on)}${list ? tvpAttrs(s.categoryId, s.skillId) : ''}>`
        + `<span class="ts-card-top">${gbadge(s.level, !list)}<span class="ts-area-tag">${areaIcon(a, 16)}${esc(AREAS[a].short)}</span>${d.pool ? '<span class="ts-mixed">mixed</span>' : ''}</span><span class="ts-card-name">${esc(s.label).replace(/\//g, '/<wbr>')}</span>${thumb}`
        + `${tick}</button>`;
}

/** A maths-area group: the band (icon, name, count, + Add whole area) and its cards (or grade sub-groups). */
function gGroup(a, list, { cross = false, addArea = false, budget, planned = [] }) {
    const shown = list.slice(0, Math.max(0, budget.left));
    budget.left -= shown.length;
    if (!shown.length && !planned.length) return '';
    let body;
    if (cross && new Set(shown.map((s) => s.level)).size > 1) {
        const gs = [];
        shown.forEach((s) => { let g = gs.find((x) => x.g === s.level); if (!g) gs.push(g = { g: s.level, l: [] }); g.l.push(s); });
        body = gs.map((g) => `<h3 class="ts-grade-head">${gbadge(g.g, true)}<span class="ts-count">${plural2(g.l.length, 'skill')}</span></h3><div class="ts-grid" data-view="${gv()}">${g.l.map(gCard).join('')}</div>`).join('');
    } else body = shown.length ? `<div class="ts-grid" data-view="${gv()}">${shown.map(gCard).join('')}</div>` : '';
    const planShown = planned.slice(0, Math.max(0, budget.left));   // planned cards share the page limit (after the real ones)
    budget.left -= planShown.length;
    if (!shown.length && !planShown.length) return '';
    if (planShown.length) body += `<h3 class="ts-grade-head ts-plan-head"><span class="ts-plan-tag">Yet to be built</span><span class="ts-count">${plural2(planned.length, 'skill')} planned</span></h3><div class="ts-grid" data-view="${gv()}">${planShown.map(planCard).join('')}</div>`;
    const n = addArea ? wholeSetG(a).length : 0;
    const add = addArea && n > 1 ? `<button type="button" class="ts-btn ts-add" data-act="addarea" data-arg="${a}">+ Add whole area (${n})</button>` : '';
    return `<section class="ts-group" data-domain="${a}">${bandHTML(a, AREAS[a].long, plural2(list.length, 'skill') + (planned.length ? ` · ${planned.length} yet to be built` : ''), layoutSegHTML() + add)}${body}</section>`;
}

/* ------------------------------------------------------------------ "Yet to be built" (owner 2026-10-25)
   Every NEW skill on the build list ("All skills to be made") gets a card in its grade and area, outlined in orange.
   It cannot go in the tray; pressing it opens its entry in the build list. */
const PLAN_AREA = { CC: 'CC', OA: 'OA', NBT: 'NBT', NF: 'NF', MD: 'MEAS', G: 'G', X: 'RPNS' };
let PLAN = null;
let planLoading = null;
function loadPlan() {
    if (PLAN || planLoading) return;
    planLoading = import('./teacher-todo.js').then((m) => m.plannedSkills()).then((list) => {
        PLAN = list || [];
        if (groot && groot.isConnected && G.browse === 'area' && !G.q.trim()) gRender();
    }).catch((e) => { console.warn('[teacher-library] plan', e); planLoading = null; });
}
/** The planned skills in the selected grades, by area (each listed once, under the first selected grade it reaches). */
function plannedByArea() {
    if (!PLAN) { loadPlan(); return {}; }
    const by = {};
    PLAN.forEach((e) => {
        const g = e.grades.find((x) => G.grades.includes(x));
        if (!g) return;
        const a = PLAN_AREA[e.domain] || 'NOSTD';
        (by[a] = by[a] || []).push({ ...e, level: g });
    });
    return by;
}
function planCard(e) {
    const a = PLAN_AREA[e.domain] || 'NOSTD';
    const v = gv();
    const attrs = `data-domain="${a}" data-act="todo" data-arg="${esc(e.id)}" title="Yet to be built: open it in All skills to be made"`;
    if (v === 'chip') {
        return `<button type="button" class="ts-card ts-chipcard ts-plancard" ${attrs}>${gbadge(e.level)}<span class="ts-chip-ic">${areaIcon(a, 16)}</span><span class="ts-card-name">${esc(e.name)}</span><span class="ts-plan-tag">Yet to be built</span></button>`;
    }
    const list = v === 'list';
    const what = list ? '' : `<span class="ts-plan-what"><span class="ts-plan-txt">${esc(e.teaches || 'Planned skill.')}</span></span>`;
    return `<button type="button" class="ts-card ts-plancard" ${attrs}>`
        + `<span class="ts-card-top">${gbadge(e.level, !list)}<span class="ts-plan-tag">Yet to be built</span></span><span class="ts-card-name">${esc(e.name)}</span>${what}</button>`;
}

/** An area band: the icon tile, the title with its count under it, then (on the right) the view and the add button. */
function bandHTML(a, title, count, right = '') {
    return `<div class="ts-band-row"><div class="ts-band">${areaIcon(a, 24)}<span class="ts-band-t"><h2>${esc(title)}</h2><span class="ts-count">${esc(count)}</span></span></div>${right ? `<div class="ts-band-tools">${right}</div>` : ''}</div>`;
}

function moreHTML(left) {
    return left > 0 ? `<div class="ts-more-row"><button type="button" class="ts-btn" data-act="more">Show ${Math.min(G_PAGE, left)} more <span class="ts-muted">(${left} left)</span></button></div>` : '';
}

function byArea(list) {
    const by = {};
    const order = [];
    list.forEach((s) => { const a = adOf(s).area; if (!by[a]) { by[a] = []; order.push(a); } by[a].push(s); });
    return { by, order };
}

function gRender() {
    const box = groot.querySelector('#tsList');
    const q = G.q.trim();
    const eyebrow = groot.querySelector('#tsEyebrow');
    let html = '';
    if (q) {
        const hits = rankByQuery(skillCatalogue(), q);
        eyebrow.textContent = `All grades • ${plural2(hits.length, 'skill')} ${hits.length === 1 ? 'matches' : 'match'}`;
        if (!hits.length) html = `<p class="ts-note">No skill matches “${esc(G.q)}”. Try fewer words.</p>`;
        else {
            const { by, order } = byArea(hits);
            const budget = { left: G.limit };
            html = `<p class="ts-note ts-mb">${hits.length === 1 ? '1 skill matches' : `${hits.length} skills match`} “${esc(G.q)}” across all grades, best match first. Each shows its grade.</p>`
                + order.map((a) => gGroup(a, by[a], { cross: true, budget })).join('') + moreHTML(hits.length - G.limit);
        }
    } else if (G.browse === 'area') {
        const list = skillCatalogue().filter((s) => G.grades.includes(s.level));
        eyebrow.textContent = `${gradesName()} • ${plural2(list.length, 'skill')}`;
        const { by } = byArea(list);
        const whole = wholeSetG();
        const nG = realGrades().length;
        const budget = { left: G.limit };
        const plan = plannedByArea();
        const order = AREA_ORDER.filter((a) => by[a] || plan[a]);
        order.forEach((a) => { by[a] = (by[a] || []).sort(stdSort); });
        html = (whole.length ? `<div class="ts-add-row"><button type="button" class="ts-btn ts-add" data-act="addgrade">${icon('plus', 18)}<span>${nG > 1 ? `Add all ${nG} grades` : 'Add whole grade'}</span></button><span class="ts-note">Add ${whole.length} skills from ${esc(allOn() ? 'every grade' : nG > 1 ? gradesNameOf(realGrades()) : gradeName(realGrades()[0]))} to your tray (one of each: no Mixed pools or Maths words)</span></div>` : '')
            + order.map((a) => gGroup(a, by[a], { cross: multi() || G.grade === 'M', addArea: nG > 0, budget, planned: plan[a] || [] })).join('')
            + moreHTML(list.length + Object.values(plan).reduce((n, l) => n + l.length, 0) - G.limit);
    } else if (G.browse === 'wrm') {
        eyebrow.textContent = `${gradesName()} · White Rose steps`;
        html = perGrade(wrmHTML);
    } else if (G.browse === 'std') {
        eyebrow.textContent = `${gradesName()} · ${G.fw === 'ee' ? 'Essential Elements' : 'Common Core standards'}`;
        html = perGrade(stdHTML);
    } else if (G.browse === 'map') {
        eyebrow.textContent = 'MAP strands · every RIT band';
        html = mapHTML();
    } else {
        eyebrow.textContent = 'My sets';
        html = setsHTML();
    }
    box.innerHTML = html;
    gThumbs(box);
}

/* ------------------------------------------------------------------ Browse by › White Rose step */

let WRM = null;
let wrmLoading = null;
function loadWrm() {
    if (WRM || wrmLoading) return;
    wrmLoading = import('./wrm.js').then((m) => { WRM = m; if (groot && groot.isConnected && G.browse === 'wrm' && !G.q.trim()) gRender(); })
        .catch((e) => { console.warn('[teacher-library] wrm', e); wrmLoading = null; });
}
function wrmHTML() {
    if (!WRM) { loadWrm(); return '<p class="ts-note">Loading the White Rose steps…</p>'; }
    const year = WRM.WRM_YEARS.find((y) => y.usGrade === G.grade);
    if (!year) return `<p class="ts-note">${G.grade === 'M' ? 'Choose a grade to see its White Rose steps.' : `White Rose has no year for ${esc(gradeName(G.grade))}. Try Browse by Standard.`}</p>`;
    const blocks = WRM.WRM_BLOCKS.filter((b) => b.id.startsWith(`${year.id}.`));
    const cat = new Map(skillCatalogue().map((s) => [gkey(s), s]));
    const out = blocks.map((b) => {
        const steps = WRM.WRM_STEPS.filter((st) => st.id.startsWith(`${b.id}.`)).map((st) => ({ st, skills: WRM.skillsForWrmStep(st.id).map((k) => cat.get(k)).filter(Boolean) }));
        const withSkills = steps.filter((x) => x.skills.length);
        if (!withSkills.length) return '';
        const areaVotes = {};
        withSkills.forEach((x) => x.skills.forEach((s) => { const a = adOf(s).area; areaVotes[a] = (areaVotes[a] || 0) + 1; }));
        const code = steps.map((x) => (x.st.ccss || [])[0]).find(Boolean);
        const a = code ? (areaOfCode(code, G.grade) || 'NOSTD') : Object.entries(areaVotes).sort((p, q) => q[1] - p[1])[0][0];
        const key = `w${b.id}`;
        const lim = G.open[key] ? withSkills.length : 3;
        return `<section class="ts-group" data-domain="${a}">${bandHTML(a, `${b.term} block ${b.termBlock}: ${b.name}`, `${AREAS[a].name} · ${plural2(steps.length, 'step')}`, layoutSegHTML())}`
            + withSkills.slice(0, lim).map(({ st, skills }) => `<div class="ts-step"><b>Step ${esc(st.id.split('.S')[1])}: ${esc(st.title)}</b>${(st.ccss || [])[0] ? `<span class="ts-gpill">${esc(st.ccss[0])}</span>` : ''}${skills.length > 1 ? `<button type="button" class="ts-btn ts-add" data-act="addkeys" data-arg="${esc(skills.map(gkey).join(','))}" data-what="Step ${esc(st.id.split('.S')[1])}">+ Add all ${skills.length}</button>` : ''}</div><div class="ts-grid ts-mb" data-view="${gv()}">${skills.map(gCard).join('')}</div>`).join('')
            + (withSkills.length > lim ? `<button type="button" class="ts-btn ts-more-btn" data-act="showall" data-arg="${esc(key)}">Show all ${withSkills.length} steps</button>` : '')
            + '</section>';
    }).join('');
    return `<p class="ts-note ts-mb">White Rose ${esc(year.name)} is ${esc(gradeName(G.grade))}. Each step lists the skills that teach it.</p>${out || '<p class="ts-note">No skills are linked to these steps yet.</p>'}`;
}

/* ------------------------------------------------------------------ Browse by › Standard (covered / not yet) */

let STDM = null;
let stdmLoading = null;
function loadStdm() {
    if (STDM || stdmLoading) return;
    stdmLoading = import('./standards.js').then((m) => { STDM = m; if (groot && groot.isConnected && G.browse === 'std' && !G.q.trim()) gRender(); })
        .catch((e) => { console.warn('[teacher-library] standards', e); stdmLoading = null; });
}
function stdHTML() {
    if (!STDM) { loadStdm(); return '<p class="ts-note">Loading the standards…</p>'; }
    const g = G.grade === 'M' ? '' : G.grade;
    const rows = coverageRows(STDM, { fw: G.fw, grade: g });
    const covered = rows.filter((r) => r.covered).length;
    const cat = new Map(skillCatalogue().map((s) => [gkey(s), s]));
    const shownRows = rows.filter((r) => G.status === 'all' || (G.status === 'gaps' ? !r.covered : r.covered));
    const by = {};
    shownRows.forEach((r) => {
        const first = r.skills.map((k) => cat.get(k)).find(Boolean);
        const code = r.type === 'ee' && r.ccss && r.ccss[0] ? r.ccss[0] : r.code;
        const a = first ? adOf(first).area : (areaOfCode(String(code).replace(/^EE\./, ''), r.grade) || 'NOSTD');
        (by[a] = by[a] || []).push(r);
    });
    const seg = (name, list, cur) => `<div class="ts-seg" role="group" aria-label="${esc(name)}">${list.map(([v, l]) => `<button type="button" data-act="${name === 'Standards' ? 'fw' : 'status'}" data-arg="${v}" ${pressedA(cur === v)}>${l}</button>`).join('')}</div>`;
    const head = `<div class="ts-row">${seg('Standards', [['ccss', 'Common Core'], ['ee', 'Essential Elements']], G.fw)}${seg('Show', [['all', 'All'], ['gaps', 'Not yet'], ['covered', 'Covered']], G.status)}<span class="ts-note">${covered} of ${rows.length} ${esc(g ? gradeName(g) : 'K to 6')} ${G.fw === 'ee' ? 'Essential Elements' : 'standards'} have skills.</span></div>`;
    const groups = AREA_ORDER.filter((a) => by[a]).map((a) => {
        const key = `s${a}`;
        const lim = G.open[key] ? by[a].length : 4;
        return `<section class="ts-group" data-domain="${a}">${bandHTML(a, AREAS[a].long, plural2(by[a].length, G.fw === 'ee' ? 'element' : 'standard'), layoutSegHTML())}`
            + by[a].slice(0, lim).map((r) => {
                const skills = r.skills.map((k) => cat.get(k)).filter(Boolean);
                const sk = `k${r.code}`;
                const slim = G.open[sk] ? skills.length : 4;
                return `<div class="ts-std"><div class="ts-step"><span class="ts-gpill">${esc(r.short || r.code)}</span><span class="ts-badge${r.covered ? '' : ' quiet'}">${r.covered ? '✓ Covered' : 'Not yet'}</span>${skills.length > 1 ? `<button type="button" class="ts-btn ts-add" data-act="addkeys" data-arg="${esc(skills.map(gkey).join(','))}" data-what="${esc(r.short || r.code)}">+ Add all ${skills.length}</button>` : ''}</div><p class="ts-note">${esc(r.text)}</p>`
                    + (skills.length ? `<div class="ts-grid ts-mb" data-view="${gv()}">${skills.slice(0, slim).map(gCard).join('')}</div>${skills.length > slim ? `<button type="button" class="ts-btn ts-more-btn" data-act="showall" data-arg="${esc(sk)}">Show all ${skills.length} skills</button>` : ''}` : '<p class="ts-note ts-mb">No skill teaches this yet.</p>')
                    + '</div>';
            }).join('')
            + (by[a].length > lim ? `<button type="button" class="ts-btn ts-more-btn" data-act="showall" data-arg="${esc(key)}">Show all ${by[a].length}</button>` : '')
            + '</section>';
    }).join('');
    return head + (groups || '<p class="ts-note">Nothing to show here. Try another grade or show all.</p>');
}

/* ------------------------------------------------------------------ Browse by › MAP strand */

let MAPT = null;
let mapLoading = null;
const STRAND_AREA = { 'Operations & algebra': 'OA', 'Operations & algebraic thinking': 'OA', 'Number & place value': 'NBT', 'Fractions & decimals': 'NF', 'Multiplication & division': 'OA', Geometry: 'G', Measurement: 'MEAS', 'Data & graphing': 'DATA', 'Measurement & data': 'MEAS' };
function loadMapT() {
    if (MAPT || mapLoading) return;
    mapLoading = mapTaskList().then((t) => { MAPT = t; if (groot && groot.isConnected && G.browse === 'map' && !G.q.trim()) gRender(); })
        .catch((e) => { console.warn('[teacher-library] map', e); mapLoading = null; });
}
function mapHTML() {
    if (!MAPT) { loadMapT(); return '<p class="ts-note">Loading the MAP tasks…</p>'; }
    const names = mapStrandNames();
    const by = {};
    MAPT.forEach((t, i) => { if (t.skills.length) (by[t.strand] = by[t.strand] || []).push({ t, i }); });
    const order = [...names.filter((n) => by[n]), ...Object.keys(by).filter((n) => !names.includes(n))];
    return `<p class="ts-note ts-mb">Pick a MAP task: its skills go into the tray.</p>` + order.map((st) => {
        const a = STRAND_AREA[st] || 'NOSTD';
        const key = `m${st}`;
        const lim = G.open[key] ? by[st].length : 6;
        return `<section class="ts-group" data-domain="${a}">${bandHTML(a, st, plural2(by[st].length, 'task'))}<div class="ts-tasks">`
            + by[st].slice(0, lim).map(({ t, i }) => {
                const inTray = t.skills.every(trayHas);
                return `<button type="button" class="ts-task" data-domain="${a}" data-act="maptask" data-arg="${i}" ${pressedA(inTray)}><span class="ts-card-name">${esc(t.task)}</span><span class="ts-card-meta"><span class="ts-area-tag">${areaIcon(a, 16)}${esc(AREAS[a].name)}</span><span class="ts-gpill">RIT ${esc(t.ritBand)}</span><span class="ts-gpill">${plural2(t.skills.length, 'skill')}</span></span><span class="ts-task-act">${inTray ? `${icon('check', 16)}In the tray` : '+ Add to tray'}</span></button>`;
            }).join('')
            + `</div>${by[st].length > lim ? `<button type="button" class="ts-btn ts-more-btn" data-act="showall" data-arg="${esc(key)}">Show all ${by[st].length}</button>` : ''}</section>`;
    }).join('');
}

/* ------------------------------------------------------------------ Browse by › My sets */

let setsShown = [];
function setsHTML() {
    setsShown = savedSets();
    if (!setsShown.length) return '<p class="ts-note">No sets yet. Your tray saves itself as a set as soon as it holds a skill.</p>';
    const chipOf = (x) => {
        const hit = findSkill(x.categoryId, x.skillId);
        if (!hit) return '';
        const a = adOf(hit).area;
        return `<span class="ts-mini-chip" data-domain="${a}">${gbadge(hit.level)}${areaIcon(a, 14)}<span>${esc(shortName(hit.label))}</span></span>`;
    };
    return `<p class="ts-note ts-mb">Your tray saves itself as a set. Open a set to put its skills in the tray. Saved quizzes are in Classes › Quizzes.</p><div class="ts-sets">`
        + setsShown.map((st, i) => {
            const live = st.skills.filter((x) => findSkill(x.categoryId, x.skillId));
            const isTray = st.id === TRAY_SET_ID;
            return `<button type="button" class="ts-set" data-act="openset" data-arg="${i}"><span class="ts-set-name">${esc(isTray ? 'Your tray (saved as you go)' : (st.name || 'Untitled set'))}</span><span class="ts-set-chips">${live.slice(0, 6).map(chipOf).join('')}${live.length > 6 ? `<span class="ts-muted">+${live.length - 6}</span>` : ''}</span><span class="ts-note">${plural2(live.length, 'skill')} · ${isTray ? 'open the tray' : 'open to print, quiz or share'}</span></button>`;
        }).join('') + '</div>';
}

/* ------------------------------------------------------------------ thumbnails: the real item, cropped */

function trayOpts(cat, sk) {
    const it = trayItems().find((x) => x.categoryId === cat && x.skillId === sk);
    return it && it.opts && Object.keys(it.opts).length ? it.opts : undefined;
}

function drawThumb(host) {
    if (!host.isConnected || host.dataset.tsDone) return;
    host.dataset.tsDone = '1';
    const [c, s] = String(host.dataset.tsThumb || '').split('|');
    const opts = trayOpts(c, s);
    host.innerHTML = '';
    const frame = document.createElement('span');
    frame.className = 'tvp-frame ts-frame';
    host.appendChild(frame);
    mountCropped(frame, c, s, opts, 0, host.dataset.tsSize || 'medium');
}

let tio = null;
const tqueue = [];
let tpumping = false;
function tpump() {
    if (tpumping) return;
    tpumping = true;
    const step = () => {
        const t0 = performance.now();
        while (tqueue.length && performance.now() - t0 < 24) drawThumb(tqueue.shift());
        if (tqueue.length) setTimeout(step, 0); else tpumping = false;
    };
    setTimeout(step, 0);
}
/** Draw the [data-ts-thumb] hosts under `box`: at once when measured before, else as they scroll into view. */
function gThumbs(box) {
    const hosts = box.querySelectorAll('[data-ts-thumb]:not([data-ts-done])');
    if (!hosts.length) return;
    if (typeof IntersectionObserver === 'undefined') { hosts.forEach((h) => tqueue.push(h)); tpump(); return; }
    if (!tio) {
        tio = new IntersectionObserver((entries) => {
            for (const en of entries) { if (!en.isIntersecting) continue; tio.unobserve(en.target); tqueue.push(en.target); }
            tpump();
        }, { rootMargin: '240px 0px' });
    }
    hosts.forEach((h) => {
        const [c, s] = String(h.dataset.tsThumb || '').split('|');
        const opts = trayOpts(c, s);
        if (croppedReady(c, s, opts, 0)) drawThumb(h); else tio.observe(h);
    });
}
setThumbDrawer(gThumbs);

/* ------------------------------------------------------------------ ticks and actions */

function syncTicks() {
    if (!groot || !groot.isConnected) return;
    groot.querySelectorAll('.ts-card[data-skill]').forEach((b) => {
        const on = trayHas(b.dataset.skill);
        if ((b.getAttribute('aria-pressed') === 'true') === on) return;
        b.setAttribute('aria-pressed', String(on));
        const t = b.querySelector('.ts-tick span');
        if (t) t.textContent = on ? '✓' : '';
        const sr = b.querySelector(':scope > .tv-sr');
        if (sr) sr.textContent = on ? ', in the tray' : ', tick to add';
    });
    if (G.browse === 'map' || G.browse === 'sets') { if (!G.q.trim()) gRender(); }
}
onTrayChange(syncTicks);

function gAction(act, arg, b) {
    switch (act) {
        case 'tick': trayToggle(b.dataset.skill); return;
        case 'todo': import('./teacher-todo.js').then((m) => m.openTodo(arg)); return;
        case 'browse': G.browse = arg; G.q = ''; G.limit = G_PAGE; persistG(); break;
        case 'grade': pickGrade(arg); G.q = ''; G.limit = G_PAGE; persistG(); break;
        case 'size': G.size = arg; if (G.layout !== 'thumb') G.layout = 'thumb'; persistG(); break;
        case 'layout': G.layout = arg; persistG(); break;
        case 'fw': G.fw = arg === 'ee' ? 'ee' : 'ccss'; persistG(); break;
        case 'status': G.status = arg; persistG(); break;
        case 'more': G.limit += G_PAGE; break;
        case 'showall': G.open[arg] = true; break;
        case 'addgrade': trayAddMany(wholeSetG(), realGrades().length > 1 ? gradesName() : `Whole ${gradeName(realGrades()[0])}`); return;
        case 'addarea': trayAddMany(wholeSetG(arg), `${AREAS[arg].name}, ${realGrades().length > 1 ? gradesName() : gradeName(realGrades()[0])}`); return;
        case 'addkeys': trayAddMany(arg.split(',').filter(Boolean), b.dataset.what || 'These skills'); return;
        case 'maptask': { const t = MAPT && MAPT[Number(arg)]; if (t) trayAddMany(t.skills, t.task); return; }
        case 'openset': {
            const st = setsShown[Number(arg)];
            if (!st) return;
            if (st.id === TRAY_SET_ID) { openTrayPopup(); return; }
            trayLoadSet(st);
            return;
        }
        default: return;
    }
    gSyncControls();
    gRender();
    if (b && (act === 'browse' || act === 'grade' || act === 'size' || act === 'layout' || act === 'fw' || act === 'status')) groot.querySelector(`[data-act="${act}"][data-arg="${CSS.escape(arg)}"]`)?.focus({ preventScroll: true });
}

function gWire() {
    groot.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-act]');
        if (!b || !groot.contains(b)) return;
        gAction(b.dataset.act, b.dataset.arg || '', b);
    });
    let t = 0;
    groot.addEventListener('input', (e) => {
        if (e.target.id !== 'tsSearch') return;
        G.q = e.target.value;
        G.limit = G_PAGE;
        clearTimeout(t);
        t = setTimeout(() => { gSyncControls(); gRender(); }, 120);
    });
    groot.addEventListener('change', (e) => {
        void e;
    });
    let rt = 0;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
            if (!groot || !groot.isConnected) return;
            groot.querySelectorAll('.ts-frame').forEach((f) => {
                const h = f.parentElement;
                const [c, s] = String(h.dataset.tsThumb || '').split('|');
                refitCropped(f, h.dataset.tsSize);
            });
        }, 100);
    }, { passive: true });
}

// The finder's thesaurus loads after boot: a search on screen is run again.
onSkillSearchReady(() => { try { if (groot && groot.isConnected && G.q.trim()) gRender(); } catch (e) { /* screen gone */ } });
