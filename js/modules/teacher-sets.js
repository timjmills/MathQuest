// teacher-sets.js — the "Send a skill set" screen of the teacher view.
//
//   1 Choose skills   search + Level K-6 over the catalogue, grouped domain -> category
//   2 Your set        the app's skill queue (UnifiedSkills), with weights and per-skill options
//   3 Send to pupils  Direct / Quick Start link, built by the EXISTING code generator in
//                     skill-codes.js (generateShareableLink via state.shareSettings)
//
// Step 1 shows the catalogue as a List (the domain -> category tree) or as Thumbnails (a grid of
// cards, each drawing one real sample item of the skill; teacher-preview.js). The choice is kept
// per device. Hovering or focusing a skill row, or a skill in the set, shows its sample larger.
//
// Sets the teacher saves or sends are kept on this device in localStorage 'mq_teacher_sets'
// (see teacher-ui.js), which is what Home's "Your skill sets" lists.
//
// INTEGRATION POINT (skill options): each row's Options button calls
//   window.openSkillOptionsPanel(categoryId, skillId, anchorEl, { opts, onChange })
// when the options editor is installed. Otherwise a read-only panel of the skill's declared
// options (skill-options.js optionsFor) is shown. Chosen values live on the queue item as
// `item.opts`; the share code carries them once skill-codes.js encodes `opts`.

import { state } from './state.js';
import { DOMAINS } from './data.js';
import {
    icon, esc, toast, copyText, skillCatalogue, findSkill, levelText, currentSet, addToCurrentSet,
    removeFromCurrentSet, loadSetIntoQueue, snapshotCurrentSet, savedSets, writeSets, optionsSummary,
    optionsReadOnlyHTML, readStore, writeStore, pupilCode,
} from './teacher-ui.js';
import {
    skillView, setSkillView, viewToggleHTML, lazyThumbs, tvpAttrs, infoButtonHTML, installPreview, modeAttrs,
} from './teacher-preview.js';
import { skillHasOfferedOptions } from './skill-options-ui.js';

const LEVELS = ['K', '1', '2', '3', '4', '5', '6'];
const UI_KEY = 'mq_teacher_sets_ui';
const THUMB_PAGE = 48;   // thumbnail cards rendered at a time; "Show more" adds another page

const ui = {
    query: '',
    levels: [],
    open: {},            // domainId / categoryId -> expanded
    optionsOpen: '',     // 'cat:skill'
    name: '',
    setId: null,
    type: 'direct',
    send: { gameMode: 'practice', problemCount: '20', timer: '0', range: '?', decimals: '0' },
    lock: false,
    result: null,        // {link, code}
    menu: false,
    view: skillView(),   // 'list' | 'thumbs' (per device)
    thumbLimit: THUMB_PAGE,
};

(function restore() {
    const saved = readStore(UI_KEY, null);
    if (saved && typeof saved === 'object') {
        if (Array.isArray(saved.levels)) ui.levels = saved.levels.filter((l) => LEVELS.includes(l));
        if (saved.send && typeof saved.send === 'object') Object.assign(ui.send, saved.send);
        if (saved.type === 'qs') ui.type = 'qs';
    }
})();
function persist() { writeStore(UI_KEY, { levels: ui.levels, send: ui.send, type: ui.type }); }

let root = null;

/* ================================================================= public */

export function renderSetsScreen(el) {
    root = el;
    installPreview();
    if (!root.dataset.built) {
        root.innerHTML = shellHTML();
        root.dataset.built = '1';
        wire();
    }
    const nameInput = root.querySelector('#tvSetName');
    if (nameInput && document.activeElement !== nameInput) nameInput.value = ui.name;
    renderBrowser();
    renderSet();
    renderSend();
}

/** Open a saved set on this screen (used by Home and Run practice). */
export function openSavedSet(id) {
    const set = savedSets().find((s) => s.id === id);
    if (!set) return false;
    loadSetIntoQueue(set);
    ui.name = set.name || '';
    ui.setId = set.id;
    if (set.type === 'qs' || set.type === 'direct') ui.type = set.type;
    if (set.settings) Object.assign(ui.send, set.settings);
    ui.lock = !!set.lock;
    ui.result = set.link ? { link: set.link, code: set.code } : null;
    return true;
}

export function currentSetName() { return ui.name; }
export function startNewSet() {
    ui.name = ''; ui.setId = null; ui.result = null;
    window.UnifiedSkills?.clear?.();
}

/* ================================================================= markup */

function shellHTML() {
    const levelChips = LEVELS.map((l) => `<button type="button" class="tv-chip" data-level="${l}" aria-pressed="false" aria-label="Level ${l}">${l}</button>`).join('');
    return `
<header class="tv-header">
  <div>
    <h1 class="tv-h1">Send a skill set</h1>
    <p class="tv-sub">Choose skills, set each skill's options, then create a link or a code for pupils.</p>
  </div>
  <div class="tv-header-actions">
    <div class="tv-menu-wrap">
      <button type="button" class="tv-btn" data-act="open-menu" aria-haspopup="true" aria-expanded="false">${icon('layers', 18)}<span>Open a saved set</span>${icon('chevD', 16)}</button>
      <div class="tv-menu" id="tvSetsMenu" hidden></div>
    </div>
    <button type="button" class="tv-btn" data-act="save">${icon('bookmark', 18)}<span>Save set</span></button>
  </div>
</header>
<div class="tv-sets-grid">
  <section class="tv-card tv-flush tv-panel" aria-labelledby="tvChooseH">
    <div class="tv-panel-head">
      <div class="tvp-head-row">
        <div class="tv-step"><span class="tv-step-num" aria-hidden="true">1</span><h2 class="tv-h2" id="tvChooseH">Choose skills</h2></div>
        <div id="tvViewSeg"></div>
      </div>
      <div class="tv-search">
        <label class="tv-sr" for="tvSkillSearch">Search skills</label>
        ${icon('search', 18)}
        <input id="tvSkillSearch" class="tv-input" type="search" placeholder="Search, e.g. times tables or regroup" autocomplete="off">
      </div>
      <div class="tv-row">
        <span class="tv-label" id="tvLevelL" style="margin:0 8px 0 0;">Level</span>
        <div class="tv-chips" role="group" aria-labelledby="tvLevelL">${levelChips}</div>
      </div>
    </div>
    <div class="tv-panel-body" id="tvBrowser"></div>
    <div class="tv-panel-foot">
      <span class="tv-cap" id="tvLevelCaption"></span>
      <button type="button" class="tv-btn tv-btn-ghost" data-act="add-shown">${icon('plus', 16)}<span>Add all shown</span></button>
    </div>
  </section>
  <section class="tv-card tv-flush tv-panel" aria-labelledby="tvSetH">
    <div class="tv-panel-head">
      <div class="tv-row" style="justify-content:space-between;">
        <div class="tv-step"><span class="tv-step-num" aria-hidden="true">2</span><h2 class="tv-h2" id="tvSetH">Your set</h2></div>
        <div class="tv-row"><span class="tv-cap" id="tvSetCount"></span><button type="button" class="tv-link" data-act="clear" style="font-size:12px;">Clear all</button></div>
      </div>
      <div>
        <label class="tv-sr" for="tvSetName">Set name</label>
        <input id="tvSetName" class="tv-input" type="text" placeholder="Name this set" style="font-weight:600;" maxlength="80">
      </div>
    </div>
    <div class="tv-panel-body" id="tvSetList"></div>
    <div class="tv-panel-foot" style="flex-direction:column;align-items:flex-start;">
      <p class="tv-cap">Options belong to the skill and travel with it. ×2 comes up twice as often as ×1.</p>
      <div class="tv-row" style="font-size:12px;">
        <span class="tv-muted" style="font-weight:600;">Also use this set:</span>
        <button type="button" class="tv-link" data-go="print">Print</button>
        <button type="button" class="tv-link" data-go="run">Run on the board</button>
        <button type="button" class="tv-link" data-go="quizzes">Make a quiz</button>
      </div>
    </div>
  </section>
  <section class="tv-card" aria-labelledby="tvSendH" id="tvSendPanel"></section>
</div>
<div class="tv-actionbar" id="tvSetsBar" role="region" aria-label="Send this set" hidden></div>`;
}

function wire() {
    const search = root.querySelector('#tvSkillSearch');
    let t = null;
    search.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => { ui.query = search.value.trim(); ui.thumbLimit = THUMB_PAGE; renderBrowser(); }, 120);
    });
    root.querySelector('#tvSetName').addEventListener('input', (e) => { ui.name = e.target.value; renderBar(); });

    root.addEventListener('click', (e) => {
        const b = e.target.closest('button, a');
        if (!b || !root.contains(b)) return;
        const d = b.dataset;
        if (d.level) {
            const i = ui.levels.indexOf(d.level);
            if (i >= 0) ui.levels.splice(i, 1); else ui.levels.push(d.level);
            ui.thumbLimit = THUMB_PAGE;
            persist();
            renderBrowser();
            return;
        }
        if (d.go) { e.preventDefault(); window.tvGo?.(d.go); return; }
        if (d.toggle) { ui.open[d.toggle] = !ui.open[d.toggle]; renderBrowser(); return; }
        if (d.add) {
            const [cat, sk] = d.add.split('|');
            const has = currentSet().some((s) => s.categoryId === cat && s.skillId === sk);
            if (has) removeFromCurrentSet(cat, sk); else addToCurrentSet(cat, sk);
            ui.result = null;
            // The thumbnail grid is updated in place, so its drawn samples stay put.
            if (ui.view === 'thumbs') syncAdded(); else renderBrowser();
            renderSet(); renderSend();
            return;
        }
        switch (d.act) {
            case 'skill-view':
                if (d.view === ui.view) return;
                ui.view = d.view === 'thumbs' ? 'thumbs' : 'list';
                ui.thumbLimit = THUMB_PAGE;
                setSkillView(ui.view);
                renderBrowser();
                root.querySelector(`[data-act="skill-view"][data-view="${ui.view}"]`)?.focus();
                break;
            case 'more-thumbs': ui.thumbLimit += THUMB_PAGE; renderBrowser(); break;
            case 'add-shown': addShown(); break;
            case 'clear':
                if (!currentSet().length) return;
                window.UnifiedSkills.clear();
                ui.result = null; ui.optionsOpen = '';
                renderBrowser(); renderSet(); renderSend();
                break;
            case 'remove': {
                const [cat, sk] = d.key.split('|');
                removeFromCurrentSet(cat, sk);
                ui.result = null;
                renderBrowser(); renderSet(); renderSend();
                break;
            }
            case 'weight': {
                const [cat, sk] = d.key.split('|');
                const item = currentSet().find((s) => s.categoryId === cat && s.skillId === sk);
                if (!item) return;
                const w = Math.max(1, Math.min(9, (item.weight > 0 ? item.weight : 1) + Number(d.dir)));
                item.weight = w;
                window.skillQueue = [...currentSet()];
                ui.result = null;
                renderSet(); renderSend();
                break;
            }
            case 'options': openOptions(d.key, b); break;
            case 'type': ui.type = d.type; ui.result = null; persist(); renderSend(); break;
            case 'lock': ui.lock = !ui.lock; ui.result = null; renderSend(); break;
            case 'create': {
                const fromBar = !!b.closest('#tvSetsBar');
                createLink();
                if (fromBar && ui.result) scrollToSend();
                break;
            }
            case 'goto-send': scrollToSend(); break;
            case 'copy-link': copyOut('link'); break;
            case 'copy-code': copyOut('code'); break;
            case 'board-code': showBoardCode(); break;
            case 'save': saveSet(); break;
            case 'open-menu': toggleMenu(b); break;
            case 'load-set': {
                if (openSavedSet(d.id)) {
                    closeMenu();
                    renderSetsScreen(root);
                    toast('Set opened');
                }
                break;
            }
            case 'delete-set': {
                const list = savedSets();
                const hit = list.find((s) => s.id === d.id);
                if (!hit || !confirm(`Delete the saved set "${hit.name || 'Untitled set'}"?`)) return;
                writeSets(list.filter((s) => s.id !== d.id));
                if (ui.setId === d.id) ui.setId = null;
                renderMenu();
                break;
            }
            default: break;
        }
    });

    root.addEventListener('change', (e) => {
        const f = e.target.dataset.send;
        if (!f) return;
        ui.send[f] = e.target.value;
        ui.result = null;
        persist();
        renderSend();
    });

    document.addEventListener('click', (e) => {
        if (!ui.menu) return;
        if (!e.target.closest('.tv-menu-wrap')) closeMenu();
    });
}

/* ================================================================= 1 browser */

function matches(s, q) {
    if (ui.levels.length && !ui.levels.includes(s.level) && s.level !== 'M') return false;
    if (ui.levels.length && s.level === 'M') return false;
    if (!q) return true;
    const hay = `${s.label} ${s.categoryName} ${s.domainName} ${s.skillId.replace(/_/g, ' ')}`.toLowerCase();
    return q.split(/\s+/).every((w) => hay.includes(w));
}

function shownSkills() {
    const q = ui.query.toLowerCase();
    return skillCatalogue().filter((s) => matches(s, q));
}

function renderBrowser() {
    const box = root.querySelector('#tvBrowser');
    if (!box) return;
    root.querySelectorAll('[data-level]').forEach((b) => b.setAttribute('aria-pressed', ui.levels.includes(b.dataset.level) ? 'true' : 'false'));
    const picked = LEVELS.filter((l) => ui.levels.includes(l));
    root.querySelector('#tvLevelCaption').textContent = !picked.length ? 'Showing all levels'
        : picked.length === 1 ? `Showing Level ${picked[0]}` : `Showing Levels ${picked.slice(0, -1).join(', ')} and ${picked[picked.length - 1]}`;

    const seg = root.querySelector('#tvViewSeg');
    if (seg) seg.innerHTML = viewToggleHTML(ui.view);
    box.classList.toggle('tvp-thumbs-body', ui.view === 'thumbs');
    const searching = !!ui.query;
    const shown = shownSkills();
    const inSet = new Set(currentSet().map((s) => `${s.categoryId}|${s.skillId}`));
    if (!shown.length) {
        box.innerHTML = `<p class="tv-empty" style="margin:12px;">No skills match${ui.query ? ` “${esc(ui.query)}”` : ''}${ui.levels.length ? ' at the chosen levels' : ''}.</p>`;
        return;
    }
    if (ui.view === 'thumbs') { renderThumbs(box, shown, inSet); return; }
    let html = '';
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        const dSkills = shown.filter((s) => s.domainId === domainId);
        if (!dSkills.length) continue;
        const dOpen = searching || !!ui.open[domainId];
        html += `<button type="button" class="tv-tree-btn" data-toggle="${domainId}" aria-expanded="${dOpen}">${icon('chevR', 16, ' class="tv-chev"')}<span>${esc(domain.name)}</span><span class="tv-tree-count">${dSkills.length}</span></button>`;
        if (!dOpen) continue;
        for (const cat of domain.categories) {
            const cSkills = dSkills.filter((s) => s.categoryId === cat.id);
            if (!cSkills.length) continue;
            const key = `${domainId}/${cat.id}`;
            const cOpen = searching || !!ui.open[key];
            html += `<button type="button" class="tv-tree-btn tv-tree-cat" data-toggle="${key}" aria-expanded="${cOpen}">${icon('chevR', 14, ' class="tv-chev"')}<span>${esc(cat.name)}</span><span class="tv-tree-count">${cSkills.length}</span></button>`;
            if (!cOpen) continue;
            for (const s of cSkills) {
                const k = `${s.categoryId}|${s.skillId}`;
                const added = inSet.has(k);
                html += `<div class="tv-skill-row${added ? ' is-added' : ''}"${tvpAttrs(s.categoryId, s.skillId)}>
  ${addButtonHTML(s, added)}
  <div style="min-width:0;" data-tvp-anchor><div class="tv-skill-name">${esc(s.label)}</div><div class="tv-skill-meta">${esc(levelText(s.level))} · ${esc(s.categoryName)}</div></div>
  ${infoButtonHTML(s.label)}
</div>`;
            }
        }
    }
    box.innerHTML = html;
}

function addButtonHTML(s, added) {
    const k = `${s.categoryId}|${s.skillId}`;
    return `<button type="button" class="tv-add" data-add="${esc(k)}" aria-pressed="${added}" aria-label="${added ? 'Remove' : 'Add'} ${esc(s.label)} ${added ? 'from' : 'to'} the set">${icon(added ? 'check' : 'plus', 16)}</button>`;
}

/**
 * Thumbnails: a grid of cards, grouped under category headings, each with one real sample item
 * (drawn lazily as it scrolls into view). Only `ui.thumbLimit` cards are built at a time.
 */
function renderThumbs(box, shown, inSet) {
    const list = shown.slice(0, ui.thumbLimit);
    let html = '';
    let group = '';
    let open = false;
    for (const s of list) {
        const g = `${s.domainId}/${s.categoryId}`;
        if (g !== group) {
            if (open) html += '</div>';
            group = g;
            const n = shown.filter((x) => x.domainId === s.domainId && x.categoryId === s.categoryId).length;
            html += `<h3 class="tvp-group"><span>${esc(s.categoryName)}</span><span class="tvp-group-domain">${esc(s.domainName)}</span><span class="tv-tree-count">${n}</span></h3><div class="tvp-grid" role="list">`;
            open = true;
        }
        const added = inSet.has(`${s.categoryId}|${s.skillId}`);
        html += `<div class="tvp-card${added ? ' is-added' : ''}" role="listitem" data-card="${esc(`${s.categoryId}|${s.skillId}`)}">
  <div class="tvp-frame tvp-thumb" data-tvp-lazy="${esc(`${s.categoryId}|${s.skillId}`)}" role="img" aria-label="Sample question for ${esc(s.label)}"></div>
  <div class="tvp-card-body">
    <div class="tvp-card-text"><div class="tv-skill-name tvp-clamp" title="${esc(s.label)}">${esc(s.label)}</div><div class="tv-skill-meta">${esc(levelText(s.level))} · ${esc(s.categoryName)}</div></div>
    ${addButtonHTML(s, added)}
  </div>
</div>`;
    }
    if (open) html += '</div>';
    const left = shown.length - list.length;
    html += left > 0
        ? `<div class="tvp-more"><span class="tv-cap">Showing ${list.length} of ${shown.length} skills</span><button type="button" class="tv-btn tv-btn-sm" data-act="more-thumbs">${icon('plus', 16)}<span>Show ${Math.min(left, THUMB_PAGE)} more</span></button></div>`
        : `<div class="tvp-more"><span class="tv-cap">${shown.length} skill${shown.length === 1 ? '' : 's'}</span></div>`;
    box.innerHTML = html;
    lazyThumbs(box, box);
}

/** Thumbnails: reflect the set on the cards without redrawing them. */
function syncAdded() {
    const box = root.querySelector('#tvBrowser');
    if (!box) return;
    const inSet = new Set(currentSet().map((s) => `${s.categoryId}|${s.skillId}`));
    box.querySelectorAll('.tvp-card').forEach((card) => {
        const k = card.dataset.card;
        const added = inSet.has(k);
        card.classList.toggle('is-added', added);
        const b = card.querySelector('[data-add]');
        if (!b) return;
        const hit = findSkill(...k.split('|'));
        const label = hit ? hit.label : k;
        b.setAttribute('aria-pressed', String(added));
        b.setAttribute('aria-label', `${added ? 'Remove' : 'Add'} ${label} ${added ? 'from' : 'to'} the set`);
        b.innerHTML = icon(added ? 'check' : 'plus', 16);
    });
}

function visibleInBrowser() {
    if (ui.view === 'thumbs') return shownSkills().slice(0, ui.thumbLimit);
    const searching = !!ui.query;
    return shownSkills().filter((s) => searching || (ui.open[s.domainId] && ui.open[`${s.domainId}/${s.categoryId}`]));
}

function addShown() {
    const list = visibleInBrowser();
    if (!list.length) { toast('Open a category or search first'); return; }
    const LIMIT = 30;
    let n = 0;
    for (const s of list) {
        if (n >= LIMIT) break;
        if (addToCurrentSet(s.categoryId, s.skillId)) n++;
    }
    ui.result = null;
    toast(n ? `Added ${n} skill${n === 1 ? '' : 's'}${list.length > LIMIT ? ` (first ${LIMIT})` : ''}` : 'Those skills are already in the set');
    renderBrowser(); renderSet(); renderSend();
}

/* ================================================================= 2 the set */

function renderSet() {
    const box = root.querySelector('#tvSetList');
    if (!box) return;
    const set = currentSet();
    root.querySelector('#tvSetCount').textContent = `${set.length} skill${set.length === 1 ? '' : 's'}`;
    if (!set.length) {
        box.innerHTML = '<p class="tv-empty" style="margin:4px;">No skills yet. Add skills from the list on the left.</p>';
        return;
    }
    box.innerHTML = set.map((s) => {
        const k = `${s.categoryId}|${s.skillId}`;
        const hit = findSkill(s.categoryId, s.skillId);
        const label = hit ? hit.label : s.skillId;
        const summary = optionsSummary(s.categoryId, s.skillId, s.opts) || `${hit ? levelText(hit.level) : ''}${hit ? ' · ' + hit.categoryName : ''}`;
        const w = s.weight > 0 ? s.weight : 1;
        const open = ui.optionsOpen === k && typeof window.openSkillOptionsPanel !== 'function';
        return `<div class="tv-set-item" role="group" aria-label="${esc(label)}">
  <div class="tv-set-top">
    <div class="tvp-name" tabindex="0"${tvpAttrs(s.categoryId, s.skillId, s.opts)}><div class="tv-skill-name">${esc(label)}${infoButtonHTML(label)}</div><div class="tv-skill-meta">${esc(summary)}</div></div>
    <button type="button" class="tv-icon-btn" data-act="remove" data-key="${esc(k)}" aria-label="Remove ${esc(label)}">${icon('x', 18)}</button>
  </div>
  <div class="tv-set-tools">
    ${skillHasOfferedOptions(s.categoryId, s.skillId) ? `<button type="button" class="tv-opt-btn" data-act="options" data-key="${esc(k)}" aria-expanded="${open}" aria-label="Options for ${esc(label)}">${icon('sliders', 16)}<span>Options</span></button>` : '<span class="tv-cap">No options</span>'}
    <div class="tv-weight" role="group" aria-label="How often ${esc(label)} comes up">
      <button type="button" data-act="weight" data-dir="-1" data-key="${esc(k)}" aria-label="Less often">${icon('minus', 16)}</button>
      <span>×${w}</span>
      <button type="button" data-act="weight" data-dir="1" data-key="${esc(k)}" aria-label="More often">${icon('plus', 16)}</button>
    </div>
  </div>
  ${open ? `<div class="tv-opt-panel" role="group" aria-label="Options for ${esc(label)}">${optionsReadOnlyHTML(s.categoryId, s.skillId, s.opts)}</div>` : ''}
</div>`;
    }).join('');
}

function openOptions(key, anchor) {
    const [cat, sk] = key.split('|');
    const item = currentSet().find((s) => s.categoryId === cat && s.skillId === sk);
    if (!item) return;
    if (typeof window.openSkillOptionsPanel === 'function') {
        window.openSkillOptionsPanel(cat, sk, anchor, {
            opts: item.opts || null,
            onChange(next) {
                item.opts = next && typeof next === 'object' ? next : undefined;
                window.skillQueue = [...currentSet()];
                ui.result = null;
                renderSet(); renderSend();
            },
        });
        return;
    }
    ui.optionsOpen = ui.optionsOpen === key ? '' : key;
    renderSet();
}

/* ================================================================= 3 send */

const SEND_FIELDS = [
    ['gameMode', 'Mode', [['?', "Pupil's choice"], ['practice', 'Practice'], ['boss', 'Boss Battle'], ['race', 'Car Race'], ['worksheet', 'Worksheet']]],
    ['problemCount', 'Problems', [['?', "Pupil's choice"], ['10', '10'], ['15', '15'], ['20', '20'], ['25', '25'], ['30', '30'], ['50', '50'], ['0', 'Unlimited']]],
    ['timer', 'Timer', [['?', "Pupil's choice"], ['0', 'No limit'], ['60', '1 min'], ['120', '2 min'], ['180', '3 min'], ['300', '5 min'], ['600', '10 min'], ['900', '15 min']]],
    ['range', 'Max number', [['?', "Pupil's choice"], ['10', 'Up to 10'], ['20', 'Up to 20'], ['50', 'Up to 50'], ['100', 'Up to 100'], ['500', 'Up to 500'], ['1000', 'Up to 1,000'], ['10000', 'Up to 10,000'], ['100000', 'Up to 100,000'], ['1000000', 'Up to 1,000,000']]],
    ['decimals', 'Decimals', [['?', "Pupil's choice"], ['0', 'None'], ['1', '1 place'], ['2', '2 places'], ['3', '3 places']]],
];

function selectHTML(field, label, opts) {
    const v = ui.send[field];
    // The Mode picker shows "what pupils see" for the chosen mode, with the set's first skill.
    const first = currentSet()[0];
    const mode = field === 'gameMode' ? modeAttrs(String(v), first && first.categoryId, first && first.skillId, first && first.opts) : '';
    return `<div${mode}><label class="tv-label" for="tvSend_${field}">${label}${mode ? infoButtonHTML(label === 'Mode' ? 'this mode' : label, 'what pupils see in') : ''}</label><select id="tvSend_${field}" class="tv-select" data-send="${field}">${opts.map(([val, text]) => `<option value="${val}"${String(v) === val ? ' selected' : ''}>${text}</option>`).join('')}</select></div>`;
}

function checkHTML(label) {
    return `<button type="button" class="tv-check" role="checkbox" aria-checked="${ui.lock}" data-act="lock"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span><span>${label}</span></button>`;
}

function renderSend() {
    renderSendPanel();
    renderBar();
}

/**
 * Step 3 sits below the fold whenever the screen stacks (1360px and narrower), and so did
 * "Create link" and its result. A sticky bar at the foot of the screen carries the set's summary
 * and the primary action; it steps aside once step 3 itself is on screen.
 */
function renderBar() {
    const bar = root.querySelector('#tvSetsBar');
    if (!bar) return;
    const n = currentSet().length;
    const name = (ui.name || '').trim();
    const what = ui.type === 'qs' ? 'Quick Start link' : 'Direct link';
    const r = ui.result;
    const count = `${n} skill${n === 1 ? '' : 's'}`;
    bar.innerHTML = `
  <div class="tv-actionbar-text">
    <div class="tv-h3">${n ? esc(name || `${count} chosen`) : 'No skills chosen yet'}</div>
    <div class="tv-cap">${n ? `${name ? `${count} · ` : ''}${what}${r ? ' · link ready' : ''}` : 'Add skills from the list to make a link.'}</div>
  </div>
  <div class="tv-row">
    ${r ? `<button type="button" class="tv-btn" data-act="copy-link">${icon('copy', 18)}<span>Copy link</span></button>
    <button type="button" class="tv-btn tv-btn-primary" data-act="goto-send">${icon('chevD', 18)}<span>See link and code</span></button>`
        : `<button type="button" class="tv-btn tv-btn-primary" data-act="create"${n ? '' : ' aria-disabled="true"'}>${icon('link', 18)}<span>Create link</span></button>`}
  </div>`;
    watchSendButton();
}

let barObserver = null;
let sendVisible = false;
function watchSendButton() {
    const bar = root.querySelector('#tvSetsBar');
    const panel = root.querySelector('#tvSendPanel');
    if (!bar || !panel) return;
    if (!barObserver && 'IntersectionObserver' in window) {
        barObserver = new IntersectionObserver((entries) => {
            for (const e of entries) sendVisible = e.isIntersecting;
            const b = root && root.querySelector('#tvSetsBar');
            if (b) b.hidden = sendVisible;
        }, { threshold: 0, rootMargin: '0px 0px -120px 0px' });
        // Once step 3 is well on screen the bar steps aside, so it never covers step 3 itself.
        barObserver.observe(panel);
    }
    bar.hidden = sendVisible;
}

function scrollToSend() {
    const panel = root.querySelector('#tvSendPanel');
    const target = panel && (panel.querySelector('.tv-result') || panel);
    if (target) target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const focusable = panel && panel.querySelector('.tv-result [data-act="copy-link"]');
    if (focusable) { try { focusable.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

function renderSendPanel() {
    const box = root.querySelector('#tvSendPanel');
    if (!box) return;
    const empty = currentSet().length === 0;
    const isQS = ui.type === 'qs';
    const r = ui.result;
    box.innerHTML = `
  <div class="tv-step"><span class="tv-step-num" aria-hidden="true">3</span><h2 class="tv-h2" id="tvSendH">Send to pupils</h2></div>
  <div>
    <div class="tv-seg" role="radiogroup" aria-label="Link type">
      <button type="button" role="radio" aria-checked="${!isQS}" data-act="type" data-type="direct">Direct link</button>
      <button type="button" role="radio" aria-checked="${isQS}" data-act="type" data-type="qs">Quick Start link</button>
    </div>
    <p class="tv-cap" style="margin-top:6px;">${isQS ? 'Puts these skills on the pupil start screen. Pupils pick how to play.' : 'Opens the set straight into play with the rules you choose.'}</p>
  </div>
  ${isQS ? `
  <p class="tv-note">Pupils choose the mode, timer and number of problems themselves. Each skill keeps the options you set. Locking stops pupils changing the skills.</p>
  ${checkHTML('Lock Quick Start (pupils cannot change the skills)')}` : `
  <div class="tv-fields-2">
    ${SEND_FIELDS.map(([f, l, o]) => selectHTML(f, l, o)).join('')}
    <div style="display:flex;align-items:flex-end;padding-bottom:6px;">${checkHTML('Lock Quick Start')}</div>
  </div>`}
  <button type="button" class="tv-btn tv-btn-primary tv-btn-block" data-act="create"${empty ? ' aria-disabled="true"' : ''}>${icon('link', 18)}<span>Create link</span></button>
  ${empty ? '<p class="tv-cap">Add at least one skill to create a link.</p>' : ''}
  ${r ? `
  <div class="tv-result">
    <div>
      <div class="tv-result-row"><span class="tv-label" style="margin:0;" id="tvLinkL">Link</span><button type="button" class="tv-btn tv-btn-sm" data-act="copy-link">${icon('copy', 16)}<span>Copy link</span></button></div>
      <code class="tv-code tv-code-block" aria-labelledby="tvLinkL">${esc(r.link)}</code>
    </div>
    <div>
      <div class="tv-result-row"><span class="tv-label" style="margin:0;" id="tvCodeL">Code <span class="tv-muted" style="font-weight:500;">· pupils can type it</span></span><button type="button" class="tv-btn tv-btn-sm" data-act="copy-code">${icon('copy', 16)}<span>Copy code</span></button></div>
      <code class="tv-code tv-code-block" aria-labelledby="tvCodeL">${esc(pupilCode(r.code))}</code>
      <p class="tv-cap" style="margin-top:6px;">Carries each skill's weight${typeof window.openSkillOptionsPanel === 'function' ? ' and options' : ''}. Your mode, timer and other rules travel in the link.</p>
    </div>
    <button type="button" class="tv-btn tv-btn-sm" data-act="board-code" style="align-self:flex-start;">${icon('board', 16)}<span>Show the code on the board</span></button>
  </div>` : ''}`;
}

function createLink() {
    if (!currentSet().length) { toast('Add at least one skill first'); return; }
    const s = ui.send;
    state.shareSettings = {
        timer: s.timer === '?' ? '?' : Number(s.timer),
        problemCount: s.problemCount === '?' ? '?' : Number(s.problemCount),
        gameMode: s.gameMode,
        range: s.range === '?' ? '?' : Number(s.range),
        decimals: s.decimals === '?' ? '?' : Number(s.decimals),
        quickStartLocked: ui.lock ? 'locked' : '?',
    };
    state.shareLinkType = ui.type === 'qs' ? 'quickstart' : 'direct';
    let link = '';
    try { link = window.generateShareableLink ? window.generateShareableLink() : ''; } catch (e) { link = ''; }
    if (!link) { toast('Could not make a link for this set'); return; }
    const m = /[?&](?:c|qs)=([^&]*)/.exec(link);
    const code = m ? decodeURIComponent(m[1]) : '';
    ui.result = { link, code };
    upsertSet({ link, code });
    renderSend();
}

function upsertSet(extra = {}) {
    const list = savedSets();
    const skills = snapshotCurrentSet();
    const now = Date.now();
    const name = (ui.name || '').trim() || autoName(skills);
    let rec = ui.setId ? list.find((x) => x.id === ui.setId) : null;
    if (!rec) {
        rec = { id: 'set_' + now.toString(36) + Math.random().toString(36).slice(2, 6), createdAt: now };
        list.unshift(rec);
        ui.setId = rec.id;
    }
    const changed = JSON.stringify(rec.skills || []) !== JSON.stringify(skills);
    Object.assign(rec, {
        name, skills, type: ui.type, settings: { ...ui.send }, lock: ui.lock, lastUsed: now,
    });
    if (extra.link) { rec.link = extra.link; rec.code = extra.code; }
    else if (changed) { delete rec.link; delete rec.code; }
    // most recently used first
    const rest = list.filter((x) => x.id !== rec.id);
    writeSets([rec, ...rest]);
    if (!ui.name) { ui.name = name; const inp = root && root.querySelector('#tvSetName'); if (inp) inp.value = name; }
    return rec;
}

function autoName(skills) {
    if (!skills.length) return 'Untitled set';
    const first = findSkill(skills[0].categoryId, skills[0].skillId);
    const base = first ? first.label : 'Skill set';
    return skills.length > 1 ? `${base} + ${skills.length - 1} more` : base;
}

function saveSet() {
    if (!currentSet().length) { toast('Add at least one skill first'); return; }
    upsertSet();
    toast('Set saved on this device');
}

async function copyOut(which) {
    if (!ui.result) return;
    const ok = await copyText(which === 'link' ? ui.result.link : pupilCode(ui.result.code));
    toast(ok ? (which === 'link' ? 'Link copied' : 'Code copied') : 'Could not copy');
}

/**
 * Show the code on the classroom board: the set's name, where to type it, and the code itself in
 * large type. The code shown is the SKILLS part only (the part before "|"): it is what a pupil can
 * type on a tablet, and the start screen opens it on its own. The rules (mode, timer ...) travel
 * in the link. The teacher app is inert behind it (teacher-shell syncInert); Esc or Close ends it.
 */
function showBoardCode() {
    if (!ui.result) return;
    const opener = document.activeElement;
    let ov = document.getElementById('tvBoardOverlay');
    const close = () => {
        const el = document.getElementById('tvBoardOverlay');
        if (el) el.remove();
        document.removeEventListener('keydown', onKey, true);
        const back = root && root.querySelector('[data-act="board-code"]');
        const target = opener && opener.isConnected ? opener : back;
        if (target) { try { target.focus({ preventScroll: true }); } catch (e) { /* */ } }
    };
    function onKey(e) {
        // Closed some other way (a sidebar route closes every overlay): stop listening.
        if (!document.getElementById('tvBoardOverlay')) { document.removeEventListener('keydown', onKey, true); return; }
        if (e.key === 'Escape') { e.preventDefault(); close(); return; }
        if (e.key === 'Tab') {
            // One control: keep focus on it.
            e.preventDefault();
            document.querySelector('#tvBoardOverlay [data-close]')?.focus();
        }
    }
    if (ov) ov.remove();
    ov = document.createElement('div');
    ov.id = 'tvBoardOverlay';
    ov.className = 'tv-boardcode';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-labelledby', 'tvBoardName');
    const code = pupilCode(ui.result.code);
    const parts = code.split('-').filter(Boolean);
    const name = (ui.name || '').trim() || autoName(snapshotCurrentSet());
    let host = 'the Maths Quest start screen';
    try { host = new URL(ui.result.link).host || host; } catch (e) { /* keep the words */ }
    ov.innerHTML = `<div class="tv-boardcode-card">
  <p class="tv-boardcode-kicker">Maths Quest</p>
  <h2 class="tv-boardcode-name" id="tvBoardName">${esc(name)}</h2>
  <ol class="tv-boardcode-steps">
    <li>1. Go to <strong>${esc(host)}</strong></li>
    <li>2. Type this code on the start screen:</li>
  </ol>
  <div class="tv-boardcode-code" aria-label="Code: ${esc(parts.join(' dash '))}">${parts.map((p, i) => `<span>${esc(p)}${i < parts.length - 1 ? '-' : ''}</span>`).join('')}</div>
  <p class="tv-boardcode-note">The code opens these skills. Your mode, timer and other rules travel in the link.</p>
  <button type="button" class="tv-btn" data-close>${icon('x', 18)}<span>Close</span></button>
</div>`;
    document.body.appendChild(ov);
    ov.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey, true);
    ov.querySelector('[data-close]').focus();
}

/* ================================================================= saved-set menu */

function toggleMenu(btn) {
    ui.menu = !ui.menu;
    btn.setAttribute('aria-expanded', String(ui.menu));
    renderMenu();
}
function closeMenu() {
    ui.menu = false;
    const m = root && root.querySelector('#tvSetsMenu');
    if (m) m.hidden = true;
    const b = root && root.querySelector('[data-act="open-menu"]');
    if (b) b.setAttribute('aria-expanded', 'false');
}
function renderMenu() {
    const m = root.querySelector('#tvSetsMenu');
    if (!m) return;
    m.hidden = !ui.menu;
    if (!ui.menu) return;
    const list = savedSets();
    m.style.minWidth = '280px';
    m.innerHTML = list.length ? list.map((s) => `<div style="display:flex;align-items:center;gap:4px;">
  <button type="button" data-act="load-set" data-id="${esc(s.id)}" style="flex:1;min-width:0;"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(s.name || 'Untitled set')}</span><span class="tv-cap" style="margin-left:auto;">${s.skills.length}</span></button>
  <button type="button" data-act="delete-set" data-id="${esc(s.id)}" aria-label="Delete ${esc(s.name || 'set')}" style="width:36px;justify-content:center;padding:0;">${icon('trash', 16)}</button>
</div>`).join('') : '<p class="tv-cap" style="padding:8px 10px;">No saved sets yet. Save one with “Save set”.</p>';
}
