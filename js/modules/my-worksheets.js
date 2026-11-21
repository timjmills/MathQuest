// my-worksheets.js — the My Worksheets screen, its Save dialog and the ?sheet= link (signed card design/my-worksheets/CARD.md,
// mock design/my-worksheets/mock.html). Lazy: the teacher shell imports it when the screen opens, the print hosts when Save is
// pressed, init.js for a ?sheet= link; a pupil's start never downloads it.
//
//   Screen    folders down the left (All, By unit, My folders, + New folder; a "Folder" picker under 900 px), search over name,
//             skill, tag and class, Newest first | By unit, class and tag chips, and a card per sheet: page-1 thumbnail, name,
//             page type · size · pages · unit · date, skills, class and tags, Print, Play (Open interactive) and ⋯ (Send code,
//             New mix, Edit, Rename, Move, Tags and class, Duplicate, Send as a set, Delete with a 10 s Undo).
//   Save      name (pre-filled, card §4), folder (the unit folder by default), class, tags; Edit re-saves over the original
//             with "Save as a copy" beside it (A15 #1); a warning from 450 sheets, Save stopped at 500 (A15 #3).
//   ?sheet=   a teacher is offered Save to My Worksheets and Print; a pupil plays it (card §6).

import * as L from './sheet-library.js';
import { icon, esc, toast, copyText, savedSets, writeSets, loadSetIntoQueue, currentSet } from './teacher-ui.js';
import { state } from './state.js';

const CSS_HREF = 'css/my-worksheets.css';
function ensureCss() {
    if (typeof document === 'undefined' || document.querySelector('link[data-mws-css]')) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = CSS_HREF;
    l.dataset.mwsCss = '1';
    document.head.appendChild(l);
}
ensureCss();

const NOTE = 'Saved on this device. Use <b>Export library</b> to keep a copy or to move your worksheets to another computer.';
const ui = { folder: '', q: '', sort: 'date', chip: '', menu: '', list: [], meta: null, undo: null, undoTimer: 0, thumbing: false };
let root = null;

/* ================================================================= the screen */

export function renderSheetsScreen(el) {
    root = el;
    if (!el.dataset.mwsBuilt) {
        el.dataset.mwsBuilt = '1';
        el.innerHTML = `
<div class="mws">
  <header class="tv-header mws-top">
    <div><h1 class="tv-h1">My Worksheets</h1></div>
    <div class="tv-header-actions mws-acts-top">
      <button type="button" class="tv-btn mws-b" data-mws="import">${icon('upload', 18)}<span>Import</span></button>
      <button type="button" class="tv-btn mws-b" data-mws="export">${icon('download', 18)}<span>Export library</span></button>
      <button type="button" class="tv-btn tv-btn-primary mws-b" data-mws="new">${icon('plus', 18)}<span>New worksheet</span></button>
      <input type="file" accept=".mqsheets,application/json,.json" id="mwsFile" hidden>
    </div>
  </header>
  <p class="mws-note">${NOTE}</p>
  <p class="mws-cap mws-cap-screen" hidden></p>
  <div class="mws-wrap">
    <nav class="tv-card mws-side" aria-label="Folders"></nav>
    <div class="mws-main">
      <div class="mws-bar">
        <label class="mws-pick-l"><span class="tv-sr">Folder</span><select id="mwsFolderPick" class="tv-select mws-pick" aria-label="Folder"></select></label>
        <input id="mwsSearch" class="tv-input mws-search" type="search" placeholder="Search name, skill, tag or class" aria-label="Search name, skill, tag or class" autocomplete="off">
        <div class="mws-chips" role="group" aria-label="Sort and filter"></div>
      </div>
      <div class="mws-folderline" hidden></div>
      <div class="mws-results" aria-live="polite"></div>
    </div>
  </div>
  <div class="mws-undo" role="status" hidden></div>
</div>`;
        wire(el);
    }
    refresh();
}

function wire(el) {
    el.addEventListener('click', onClick);
    el.querySelector('#mwsSearch').addEventListener('input', (e) => { ui.q = e.target.value; draw(); });
    el.querySelector('#mwsFolderPick').addEventListener('change', (e) => { ui.folder = e.target.value; draw(); });
    el.querySelector('#mwsFile').addEventListener('change', onImportFile);
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ui.menu) { const id = ui.menu; ui.menu = ''; draw(); el.querySelector(`.mws-card[data-id="${CSS.escape(id)}"] [data-mws="menu"]`)?.focus(); } });
    document.addEventListener('pointerdown', (e) => {
        if (!ui.menu || !root || !root.isConnected) return;
        if (e.target.closest && e.target.closest('.mws-menu, [data-mws="menu"]')) return;
        ui.menu = '';
        root.querySelectorAll('.mws-menu').forEach((m) => { m.hidden = true; });
        root.querySelectorAll('[data-mws="menu"][aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
        root.querySelectorAll('.mws-card.is-open').forEach((c) => c.classList.remove('is-open'));
    }, true);
}

async function refresh() {
    try {
        ui.list = await L.listSheets();
        ui.meta = await L.getMeta();
    } catch (e) {
        console.warn('[my-worksheets] could not read the library', e);
        ui.list = []; ui.meta = { folders: [], classes: [], tags: [] };
    }
    if (ui.folder && !ui.meta.folders.some((f) => f.id === ui.folder)) ui.folder = '';
    draw();
    regenThumbs();
}

function folderName(id) { const f = (ui.meta && ui.meta.folders.find((x) => x.id === id)) || null; return f ? f.name : 'Other sheets'; }
function counts() { const c = {}; for (const r of ui.list) c[r.folder] = (c[r.folder] || 0) + 1; return c; }
function unitFolders() { return ui.meta.folders.filter((f) => f.unit && f.unit !== 'other').sort((a, b) => (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name)); }
function ownFolders() { return ui.meta.folders.filter((f) => !f.unit || f.unit === 'other').sort((a, b) => (a.unit === 'other') - (b.unit === 'other') || a.name.localeCompare(b.name)); }

function haystack(r) {
    const skills = L.skillsOf(r.host, r.req).map((k) => L.skillName(k.categoryId, k.skillId)).join(' ');
    return `${r.name} ${skills} ${(r.tags || []).join(' ')} ${(r.tags || []).map((t) => '#' + t).join(' ')} ${r.cls} ${L.pageTypeOf(r)} ${r.unit ? r.unit.folder : ''}`.toLowerCase();
}
function visible() {
    let list = ui.list.slice();
    if (ui.folder) list = list.filter((r) => r.folder === ui.folder);
    const q = ui.q.trim().toLowerCase();
    if (q) list = list.filter((r) => q.split(/\s+/).every((w) => haystack(r).includes(w)));
    if (ui.chip) {
        const [k, v] = [ui.chip.slice(0, ui.chip.indexOf(':')), ui.chip.slice(ui.chip.indexOf(':') + 1)];
        list = list.filter((r) => (k === 'cls' ? r.cls === v : (r.tags || []).includes(v)));
    }
    if (ui.sort === 'unit') list.sort((a, b) => ((a.unit && a.unit.order) || 1e9) - ((b.unit && b.unit.order) || 1e9) || (b.updatedAt - a.updatedAt));
    return list;
}

function draw() {
    if (!root || !ui.meta) return;
    const c = counts();
    const fb = (id, name, n) => `<button type="button" class="mws-f" data-mws="folder" data-v="${esc(id)}"${ui.folder === id ? ' aria-current="true"' : ''}><span class="mws-f-name">${esc(name)}</span><small>${n || 0}</small></button>`;
    const units = unitFolders(), own = ownFolders();
    root.querySelector('.mws-side').innerHTML = fb('', 'All worksheets', ui.list.length)
        + (units.length ? `<h2 class="mws-side-h">By unit</h2>${units.map((f) => fb(f.id, f.name, c[f.id])).join('')}` : '')
        + `<h2 class="mws-side-h">My folders</h2>${own.map((f) => fb(f.id, f.name, c[f.id])).join('')}`
        + `<button type="button" class="mws-f mws-f-new" data-mws="new-folder">${icon('plus', 16)}<span>New folder</span></button>`;
    const pick = root.querySelector('#mwsFolderPick');
    pick.innerHTML = `<option value="">Folder: All (${ui.list.length})</option>${units.concat(own).map((f) => `<option value="${esc(f.id)}"${ui.folder === f.id ? ' selected' : ''}>Folder: ${esc(f.name)} (${c[f.id] || 0})</option>`).join('')}`;
    pick.value = ui.folder;
    const chips = [['sort', 'date', 'Newest first', ui.sort === 'date'], ['sort', 'unit', 'By unit', ui.sort === 'unit']]
        .concat((ui.meta.classes || []).map((k) => ['chip', `cls:${k}`, `Class ${k}`, ui.chip === `cls:${k}`]))
        .concat((ui.meta.tags || []).map((t) => ['chip', `tag:${t}`, `#${t}`, ui.chip === `tag:${t}`]));
    root.querySelector('.mws-chips').innerHTML = chips.map(([a, v, l, on]) => `<button type="button" class="tv-chip mws-chip" data-mws="${a}" data-v="${esc(v)}" aria-pressed="${on}">${esc(l)}</button>`).join('');
    // the open folder's own controls (rename; delete when empty)
    const fl = root.querySelector('.mws-folderline');
    const f = ui.folder && ui.meta.folders.find((x) => x.id === ui.folder);
    fl.hidden = !f;
    fl.innerHTML = f ? `<b>${esc(f.name)}</b><button type="button" class="tv-btn mws-b" data-mws="rename-folder">${icon('edit', 16)}<span>Rename folder</span></button>${(c[f.id] || 0) ? '' : `<button type="button" class="tv-btn mws-b" data-mws="delete-folder">${icon('trash', 16)}<span>Delete folder</span></button>`}` : '';
    // the 450 warning on the screen too
    const cap = root.querySelector('.mws-cap-screen');
    cap.hidden = ui.list.length < L.SHEET_WARN;
    cap.textContent = capText(ui.list.length);
    const list = visible();
    const box = root.querySelector('.mws-results');
    if (!ui.list.length) {
        box.innerHTML = `<div class="mws-empty"><p>No saved worksheets yet. Make one in Print worksheets and press <b>Save to My Worksheets</b>.</p></div>`;
        return;
    }
    box.innerHTML = list.length ? `<div class="mws-grid">${list.map(cardHTML).join('')}</div>`
        : `<div class="mws-grid mws-none"><p class="mws-empty">No worksheet matches. Clear the search or choose All worksheets.</p></div>`;
}

function cardHTML(r) {
    const skills = [...new Map(L.skillsOf(r.host, r.req).map((k) => [`${k.categoryId}:${k.skillId}`, k])).values()];
    const names = skills.slice(0, 3).map((k) => L.skillName(k.categoryId, k.skillId));
    const gone = L.missingSkills(r).length;
    const pages = r.pages ? `${r.pages} page${r.pages === 1 ? '' : 's'}` : '';
    // (critic r1 F9) the meta line never repeats a phrase the name already says (the default name holds the page type
    // and the date)
    const inName = (seg) => new RegExp(`(^|[^\\p{L}\\p{N}])${seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\p{L}\\p{N}])`, 'iu').test(r.name || '');
    const meta = [L.pageTypeOf(r), L.sizeOf(r), pages, r.unit && r.unit.block ? r.unit.block.replace(/^([A-Z]+\d*)\.B(\d+)$/, '$1 · B$2') : '', L.dayText(r.updatedAt)]
        .filter(Boolean).flatMap((x) => String(x).split(' · ')).filter((seg) => !inName(seg)).join(' · ');
    const open = ui.menu === r.id;
    const mi = (act, label, extra = '') => `<button type="button" role="menuitem" data-mws="${act}"${extra}>${label}</button>`;
    return `<article class="tv-card tv-flush mws-card${open ? ' is-open' : ''}" data-id="${esc(r.id)}">
  <div class="mws-thumb">${r.thumb ? `<img src="${esc(r.thumb)}" alt="Page 1 of ${esc(r.name)}" width="120">` : '<div class="mws-page" aria-hidden="true"></div>'}</div>
  <div class="mws-meta"><b class="mws-name">${esc(r.name)}</b><span>${esc(meta)}</span><span class="mws-skills">${esc(names.join(', '))}${skills.length > 3 ? ` + ${skills.length - 3} more` : ''}</span>
  ${gone ? `<span class="mws-gone">${gone} skill${gone === 1 ? ' is' : 's are'} no longer in the app</span>` : ''}</div>
  <div class="mws-tags">${r.cls ? `<span class="mws-tag">${esc(r.cls)}</span>` : ''}${(r.tags || []).map((t) => `<span class="mws-tag">#${esc(t)}</span>`).join('')}</div>
  <div class="mws-acts">
    <button type="button" class="tv-btn tv-btn-primary mws-b" data-mws="print">${icon('print', 18)}<span>Print</span></button>
    <button type="button" class="tv-btn mws-b" data-mws="play" aria-label="Open interactive: ${esc(r.name)}">${icon('play', 18)}<span>Play</span></button>
    <div class="mws-menu-wrap"><button type="button" class="tv-btn mws-b mws-more" data-mws="menu" aria-haspopup="true" aria-expanded="${open}" aria-label="More for ${esc(r.name)}">${icon('dots', 18)}</button>
    <div class="tv-menu mws-menu" role="menu"${open ? '' : ' hidden'}>
      ${mi('newmix', 'New mix')}${mi('edit', 'Edit')}${mi('rename', 'Rename')}${mi('move', 'Move to folder')}${mi('tags', 'Tags and class')}${mi('duplicate', 'Duplicate')}${mi('set', 'Send as a set')}<hr>${mi('delete', 'Delete', ' class="is-danger"')}
    </div></div>
    <button type="button" class="tv-btn mws-b mws-send" data-mws="send" aria-label="Send code: ${esc(r.name)}">${icon('send', 18)}<span>Send code</span></button>
  </div>
</article>`;
}

/**
 * (critic r1 F2) The ⋯ menu opens below its button when it fits, else above it when there is more room there; if it
 * still does not fit, the page is scrolled just enough to show it whole, so no item needs a scroll (or a swipe, which
 * would close it on a tablet).
 */
function placeMenu(card) {
    const m = card.querySelector('.mws-menu'), btn = card.querySelector('[data-mws="menu"]');
    if (!m || !btn || m.hidden) return;
    m.classList.remove('mws-menu-up');
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const b = btn.getBoundingClientRect(), h = m.getBoundingClientRect().height;
    const below = vh - b.bottom - 8, above = b.top - 8;
    if (h > below && above > below) m.classList.add('mws-menu-up');
    const r = m.getBoundingClientRect();
    if (r.top < 0 || r.bottom > vh) m.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function capText(n) {
    if (n >= L.SHEET_CAP) return `You have ${n} of ${L.SHEET_CAP} saved: delete some worksheets or use Export library to keep a copy before you save another.`;
    if (n >= L.SHEET_WARN) return `You have ${n} of ${L.SHEET_CAP} saved. Export library to keep a copy.`;
    return '';
}

/* ---------------------------------------------------------------- actions */

async function onClick(e) {
    const b = e.target.closest('[data-mws]');
    if (!b || !root.contains(b)) return;
    const act = b.dataset.mws, v = b.dataset.v;
    const card = b.closest('.mws-card');
    const rec = card ? ui.list.find((r) => r.id === card.dataset.id) : null;
    switch (act) {
        case 'folder': ui.folder = v || ''; draw(); return;
        case 'sort': ui.sort = v; draw(); return;
        case 'chip': ui.chip = ui.chip === v ? '' : v; draw(); return;
        case 'import': root.querySelector('#mwsFile').click(); return;
        case 'export': return doExport();
        case 'new': { const TP = await import('./teacher-print.js'); TP.printSkills(currentSet().map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts }))); window.tvGo('print'); return; }
        case 'new-folder': return editDialog({ mode: 'folder' });
        case 'rename-folder': return editDialog({ mode: 'folder', folder: ui.meta.folders.find((f) => f.id === ui.folder) });
        case 'delete-folder': { if (await L.deleteFolder(ui.folder)) { ui.folder = ''; toast('Folder deleted'); } refresh(); return; }
        case 'undo': return undoDelete();
        case 'menu': {
            ui.menu = ui.menu === rec.id ? '' : rec.id;
            root.querySelectorAll('.mws-card').forEach((c) => {
                const on = c.dataset.id === ui.menu;
                c.classList.toggle('is-open', on);
                const m = c.querySelector('.mws-menu'); if (m) m.hidden = !on;
                c.querySelector('[data-mws="menu"]')?.setAttribute('aria-expanded', String(on));
            });
            if (ui.menu) { placeMenu(card); card.querySelector('.mws-menu button')?.focus({ preventScroll: true }); }
            return;
        }
        default: break;
    }
    if (!rec) return;
    if (ui.menu) { ui.menu = ''; card.classList.remove('is-open'); const m = card.querySelector('.mws-menu'); if (m) m.hidden = true; }
    switch (act) {
        case 'print': return printRecord(rec);
        case 'play': return playRecord(rec);
        case 'send': { const ok = await copyText(L.sheetLink(rec)); toast(ok ? 'Link copied: it opens this worksheet to print or play' : 'Could not copy the link'); return; }
        case 'newmix': return saveCopy(rec, { req: L.reseed(rec.host, rec.req, L.freshSeed()), name: `${rec.name} (new mix)` }, 'New mix saved: the same settings, new numbers');
        case 'duplicate': return saveCopy(rec, { name: `${rec.name} (copy)` }, 'Duplicated');
        case 'edit': return editRecord(rec);
        case 'rename': return editDialog({ mode: 'rename', rec });
        case 'move': return editDialog({ mode: 'move', rec });
        case 'tags': return editDialog({ mode: 'tags', rec });
        case 'set': return sendAsSet(rec);
        case 'delete': return deleteRecord(rec);
        default: return undefined;
    }
}

async function saveCopy(rec, patch, msg) {
    const now = Date.now();
    const o = Object.assign(JSON.parse(JSON.stringify(rec)), patch, { id: `ws_${now.toString(36)}${Math.random().toString(36).slice(2, 7)}`, createdAt: now, updatedAt: now, printedAt: 0 });
    if (patch.req && o.ui && o.ui.seed !== undefined) o.ui.seed = L.seedOf(o);
    if (patch.req) { o.thumb = ''; delete o.pages; }
    if ((await L.countSheets()) >= L.SHEET_CAP) { toast(capText(L.SHEET_CAP)); return; }
    await L.putSheet(o);
    toast(msg);
    await refresh();
}

async function printRecord(rec) {
    toast('Preparing the pages…');
    try {
        const b = await L.buildRecord(rec);
        const TP = await import('./teacher-print.js');
        const paper = rec.host === 'simple-print' ? 'A4' : rec.req.paper;
        await TP.printHtml(b.doc, rec.name, paper);
        await L.updateSheet(rec.id, { printedAt: Date.now() }).then(() => {}, () => {});
    } catch (e) { console.warn('[my-worksheets] print failed', e); toast('Could not build that worksheet'); }
}

async function editRecord(rec) {
    if (rec.host === 'simple-print') { const SP = await import('./simple-print.js'); SP.openSimpleFromRecord(rec); return; }
    const TP = await import('./teacher-print.js');
    TP.loadPrintUi(rec.ui || null, { editingId: rec.id, req: rec.req });
    window.tvGo('print');
}

async function sendAsSet(rec) {
    const now = Date.now();
    const skills = [...new Map(L.skillsOf(rec.host, rec.req).map((k) => [`${k.categoryId}:${k.skillId}`, k])).values()].map((k) => Object.assign({ categoryId: k.categoryId, skillId: k.skillId }, k.opts && Object.keys(k.opts).length ? { opts: k.opts } : {}));
    const set = { id: 'set_' + now.toString(36) + Math.random().toString(36).slice(2, 6), createdAt: now, lastUsed: now, name: rec.name.slice(0, 60), skills };
    writeSets([set, ...savedSets()]);
    toast(`“${set.name}” is in Skills › My sets`);
}

async function deleteRecord(rec) {
    await L.deleteSheet(rec.id);
    clearTimeout(ui.undoTimer);
    ui.undo = rec;
    const bar = root.querySelector('.mws-undo');
    bar.innerHTML = `<span>“${esc(rec.name)}” deleted.</span><button type="button" class="tv-btn mws-b" data-mws="undo">Undo</button>`;
    bar.hidden = false;
    ui.undoTimer = setTimeout(() => { ui.undo = null; bar.hidden = true; bar.innerHTML = ''; }, 10000);
    await refresh();
}
async function undoDelete() {
    if (!ui.undo) return;
    await L.putSheet(ui.undo);
    ui.undo = null;
    clearTimeout(ui.undoTimer);
    const bar = root.querySelector('.mws-undo');
    bar.hidden = true; bar.innerHTML = '';
    toast('Worksheet back');
    await refresh();
}

async function doExport() {
    const text = await L.exportLibrary();
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-worksheets-${new Date().toISOString().slice(0, 10)}.mqsheets`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    toast(`Library exported: ${ui.list.length} worksheet${ui.list.length === 1 ? '' : 's'}`);
}
async function onImportFile(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
        const r = await L.importLibrary(await f.text());
        toast(`Imported: ${r.added} new, ${r.updated} updated${r.kept ? `, ${r.kept} already here` : ''}`);
    } catch (err) { toast(err.message || 'Could not read that file'); }
    await refresh();
}

/* ---------------------------------------------------------------- thumbnails made again where missing (card §2) */

async function regenThumbs() {
    if (ui.thumbing) return;
    ui.thumbing = true;
    try {
        for (const r of ui.list.filter((x) => !x.thumb || !x.pages).slice(0, 6)) {
            if (!root || !root.isConnected) break;
            let thumb = r.thumb || '', pages = r.pages || 0;
            // (critic r1 F9) the page count is made again with the thumbnail: New mix and Edit copies drop both
            try { const b = await L.buildRecord(r); pages = pages || b.pages || 0; if (!thumb) thumb = await L.makeThumb(b.firstHtml); } catch (e) { /* the card shows the outline */ }
            if (!thumb && !pages) continue;
            const cur = await L.getSheet(r.id);
            if (!cur || (cur.thumb && cur.pages)) continue;
            Object.assign(cur, thumb && !cur.thumb ? { thumb } : {}, pages && !cur.pages ? { pages } : {});
            await L.putSheet(cur);
            r.thumb = cur.thumb; r.pages = cur.pages;
            const card = root.querySelector(`.mws-card[data-id="${CSS.escape(r.id)}"]`);
            if (!card) continue;
            const box = card.querySelector('.mws-thumb');
            if (box && r.thumb) box.innerHTML = `<img src="${esc(r.thumb)}" alt="Page 1 of ${esc(r.name)}" width="120">`;
            const tmp = document.createElement('div');
            tmp.innerHTML = cardHTML(r);
            const nm = tmp.querySelector('.mws-meta > span'), om = card.querySelector('.mws-meta > span');
            if (nm && om) om.textContent = nm.textContent;
        }
    } finally { ui.thumbing = false; }
}

/* ================================================================= dialogs */

let dlgBack = null, dlgBackSel = '';
function backSelector(el) {
    if (!el || el === document.body) return '';
    if (el.id) return `#${CSS.escape(el.id)}`;
    for (const a of ['data-sp', 'data-act', 'data-mws', 'data-mws-code']) if (el.hasAttribute && el.hasAttribute(a)) return `[${a}="${CSS.escape(el.getAttribute(a))}"]`;
    return '';
}
function openOverlay(id, html, label) {
    closeOverlay(id);
    ensureCss();
    dlgBack = document.activeElement;
    dlgBackSel = backSelector(dlgBack);
    const o = document.createElement('div');
    o.id = id;
    o.className = 'mws-overlay';
    o.innerHTML = `<div class="mws-scrim"></div><div class="tv-card mws-dialog" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</div>`;
    document.body.appendChild(o);
    o.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeOverlay(id); return; }
        if (e.key !== 'Tab') return;
        const f = [...o.querySelectorAll('button:not([disabled]), input, select')].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }, true);
    return o;
}
function closeOverlay(id) {
    const o = document.getElementById(id);
    if (!o) return;
    o.remove();
    // (critic r1 F1) back to the control that opened it; a host that redrew it is matched by the same selector
    const back = dlgBack && dlgBack.isConnected ? dlgBack : (dlgBackSel ? [...document.querySelectorAll(dlgBackSel)].find((n) => n.offsetParent !== null) : null);
    if (back) { try { back.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

function folderOptions(sel, unitLabel) {
    const units = unitFolders(), own = ownFolders();
    return `${unitLabel ? `<option value="auto"${sel === 'auto' ? ' selected' : ''}>${esc(unitLabel)}</option>` : ''}${units.concat(own).filter((f) => !unitLabel || f.name !== unitLabel).map((f) => `<option value="${esc(f.id)}"${sel === f.id ? ' selected' : ''}>${esc(f.name)}</option>`).join('')}`;
}

/**
 * The Save dialog (card S-1). draft = {host, req, ui?, name?, firstHtml?, pages?}. With `editingId` it saves over that sheet
 * (A15 #1: "Save changes", with "Save as a copy" beside it). Resolves when it is open.
 */
export async function openSaveDialog(draft, { editingId = null, onSaved = null } = {}) {
    if (!draft || !draft.req) { toast('Nothing to save yet'); return; }
    if (!document.body.classList.contains('teacher-mode')) return;   // teacher-only (A15 #2)
    ui.meta = await L.getMeta();
    const n = await L.countSheets();
    const old = editingId ? await L.getSheet(editingId) : null;
    const unit = L.unitOfSkills(L.skillsOf(draft.host, L.packReq(draft.host, draft.req)));
    const unitLabel = unit ? unit.folder : 'Other sheets';
    const name = old ? old.name : (draft.name || L.defaultName(draft.host, L.packReq(draft.host, draft.req)));
    const full = !old && n >= L.SHEET_CAP;
    const classes = ui.meta.classes || [];
    const o = openOverlay('mwsSave', `
<h2 class="mws-dh">${old ? 'Save changes' : 'Save to My Worksheets'}</h2>
<label class="tv-label" for="mwsSaveName">Name</label>
<input id="mwsSaveName" class="tv-input mws-in" type="text" maxlength="120" value="${esc(name)}">
<label class="tv-label" for="mwsSaveFolder">Folder</label>
<select id="mwsSaveFolder" class="tv-select mws-in">${folderOptions(old ? old.folder : 'auto', old ? '' : unitLabel)}</select>
<div class="mws-two">
  <div><label class="tv-label" for="mwsSaveClass">Class</label><input id="mwsSaveClass" class="tv-input mws-in" type="text" maxlength="30" list="mwsClassList" value="${esc(old ? old.cls : '')}" placeholder="e.g. 5T"><datalist id="mwsClassList">${classes.map((c) => `<option value="${esc(c)}">`).join('')}</datalist></div>
  <div><label class="tv-label" for="mwsSaveTags">Tags</label><input id="mwsSaveTags" class="tv-input mws-in" type="text" maxlength="120" value="${esc(old ? (old.tags || []).join(', ') : '')}" placeholder="homework, friday"></div>
</div>
<p class="mws-cap"${n >= L.SHEET_WARN ? '' : ' hidden'}>${esc(capText(n))}</p>
${full ? `<div class="mws-row"><button type="button" class="tv-btn mws-b" data-mws-save="export">${icon('download', 18)}<span>Export library</span></button><button type="button" class="tv-btn mws-b" data-mws-save="library">Open My Worksheets</button></div>` : ''}
<div class="mws-row mws-dfoot">
  <button type="button" class="tv-btn mws-b" data-mws-save="cancel">Cancel</button>
  ${old ? '<button type="button" class="tv-btn mws-b" data-mws-save="copy">Save as a copy</button>' : ''}
  <button type="button" class="tv-btn tv-btn-primary mws-b" data-mws-save="save"${full ? ' disabled' : ''}>${old ? 'Save changes' : 'Save'}</button>
</div>`, 'Save to My Worksheets');
    const read = () => ({
        name: o.querySelector('#mwsSaveName').value.trim() || name,
        folder: o.querySelector('#mwsSaveFolder').value || 'auto',
        cls: o.querySelector('#mwsSaveClass').value.trim(),
        tags: o.querySelector('#mwsSaveTags').value.split(',').map((t) => t.replace(/^#/, '').trim()).filter(Boolean),
    });
    o.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-mws-save]');
        if (!b || b.disabled) return;
        const act = b.dataset.mwsSave;
        if (act === 'cancel') { closeOverlay('mwsSave'); return; }
        if (act === 'export') { const text = await L.exportLibrary(); const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })); const a = document.createElement('a'); a.href = url; a.download = `my-worksheets-${new Date().toISOString().slice(0, 10)}.mqsheets`; document.body.appendChild(a); a.click(); a.remove(); return; }
        if (act === 'library') { closeOverlay('mwsSave'); window.tvGo && window.tvGo('sheets'); return; }
        b.disabled = true;
        const v = read();
        try {
            const rec = await L.saveSheet(Object.assign({}, draft, v, { folder: v.folder }), { id: act === 'save' ? editingId : null, copy: act === 'copy' });
            closeOverlay('mwsSave');
            if (typeof onSaved === 'function' && act === 'save') onSaved(rec);
            ui.meta = await L.getMeta();
            toast(`Saved in My Worksheets › ${folderName(rec.folder)}`);
            if (root && root.isConnected) refresh();
        } catch (err) {
            b.disabled = false;
            toast(err && err.cap ? capText(L.SHEET_CAP) : 'Could not save the worksheet');
        }
    });
    setTimeout(() => { const i = o.querySelector('#mwsSaveName'); if (i) { i.focus(); i.select(); } }, 0);
}
export function closeSaveDialog() { closeOverlay('mwsSave'); }

/** Rename / Move / Tags and class / a folder's name. */
async function editDialog({ mode, rec = null, folder = null }) {
    ui.meta = await L.getMeta();
    const title = mode === 'rename' ? 'Rename' : mode === 'move' ? 'Move to folder' : mode === 'tags' ? 'Tags and class' : folder ? 'Rename folder' : 'New folder';
    let body = '';
    if (mode === 'rename') body = `<label class="tv-label" for="mwsEditName">Name</label><input id="mwsEditName" class="tv-input mws-in" type="text" maxlength="120" value="${esc(rec.name)}">`;
    else if (mode === 'move') body = `<label class="tv-label" for="mwsEditFolder">Folder</label><select id="mwsEditFolder" class="tv-select mws-in">${folderOptions(rec.folder, '')}</select>`;
    else if (mode === 'tags') body = `<label class="tv-label" for="mwsEditClass">Class</label><input id="mwsEditClass" class="tv-input mws-in" type="text" maxlength="30" list="mwsClassList2" value="${esc(rec.cls || '')}"><datalist id="mwsClassList2">${(ui.meta.classes || []).map((c) => `<option value="${esc(c)}">`).join('')}</datalist>
<label class="tv-label" for="mwsEditTags">Tags (commas between them)</label><input id="mwsEditTags" class="tv-input mws-in" type="text" maxlength="120" value="${esc((rec.tags || []).join(', '))}">`;
    else body = `<label class="tv-label" for="mwsEditFolderName">Folder name</label><input id="mwsEditFolderName" class="tv-input mws-in" type="text" maxlength="60" value="${esc(folder ? folder.name : '')}">`;
    const o = openOverlay('mwsEdit', `<h2 class="mws-dh">${esc(title)}</h2>${body}<div class="mws-row mws-dfoot"><button type="button" class="tv-btn mws-b" data-mws-edit="cancel">Cancel</button><button type="button" class="tv-btn tv-btn-primary mws-b" data-mws-edit="ok">${mode === 'folder' && !folder ? 'Make folder' : 'Save'}</button></div>`, title);
    const ok = async () => {
        if (mode === 'rename') { const nm = o.querySelector('#mwsEditName').value.trim(); if (nm) await L.updateSheet(rec.id, { name: nm.slice(0, 120) }); }
        else if (mode === 'move') await L.updateSheet(rec.id, { folder: o.querySelector('#mwsEditFolder').value });
        else if (mode === 'tags') await L.updateSheet(rec.id, { cls: o.querySelector('#mwsEditClass').value.trim().slice(0, 30), tags: o.querySelector('#mwsEditTags').value.split(',').map((t) => t.replace(/^#/, '').trim()).filter(Boolean) });
        else if (folder) await L.renameFolder(folder.id, o.querySelector('#mwsEditFolderName').value);
        else await L.addFolder(o.querySelector('#mwsEditFolderName').value);
        closeOverlay('mwsEdit');
        await refresh();
    };
    o.addEventListener('click', (e) => { const b = e.target.closest('[data-mws-edit]'); if (!b) return; if (b.dataset.mwsEdit === 'ok') ok(); else closeOverlay('mwsEdit'); });
    o.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); ok(); } });
    setTimeout(() => { const i = o.querySelector('input, select'); if (i) { i.focus(); if (i.select) i.select(); } }, 0);
}

/* ================================================================= Open interactive (card §5) */

/**
 * Play a sheet on screen: the online worksheet deals the items its page 1 prints, in print order (the same seed, skills and
 * options). The teacher's current set is given back after the start, as Practise now does.
 */
export async function playRecord(rec) {
    let items = [];
    try { items = await L.pageOneItems(rec); } catch (e) { items = []; }
    const skills = [...new Map(L.skillsOf(rec.host, L.liveReq(rec.host, rec.req)).map((k) => [`${k.categoryId}:${k.skillId}`, k])).values()];
    if (!skills.length) { toast('No skill of this worksheet is in the app any more'); return; }
    const teacher = document.body.classList.contains('teacher-mode');
    const before = teacher ? currentSet().map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, weight: x.weight, opts: x.opts })) : null;
    // (critic r1 F5; lead wording) a lesson whose pages hold no practice items to deal: Play opens practice of its skills,
    // and says so, until the lesson player covers lessons (card §5, D12)
    if (!items.length && /lesson/i.test(`${L.pageTypeOf(rec)} ${JSON.stringify((rec.req && rec.req.parts || []).map((p) => p.role))}`)) toast('Play opens the practice pages of this lesson.');
    loadSetIntoQueue({ skills });
    state.worksheetPreset = items.length ? items : null;
    try {
        window.playSelectedSkills('worksheet');
    } finally {
        if (before) loadSetIntoQueue({ skills: before });
    }
    // after the start (newWorksheet clears it when no sheet was dealt): the sheet this worksheet came from, for its Save
    state.worksheetSheet = items.length ? { host: rec.host, req: rec.req, ui: rec.ui, name: rec.name } : null;
    const pill = document.getElementById('worksheetSkillPill');
    if (pill && items.length) pill.textContent = rec.name;
}

/* ================================================================= ?sheet= links (card §6) */

export async function openSheetCode(code) {
    const d = L.decodeSheetCode(code);
    if (!d) { try { window.showToast?.('That worksheet link could not be read', 'info'); } catch (e) { /* */ } return; }
    const rec = { id: 'link', name: d.name, host: d.host, req: d.req };
    // The site opens in pupil view (owner 2026-09-25); a device whose saved role is teacher opens a sheet link as the teacher
    // (Save / Print), any other device plays it.
    let savedTeacher = false;
    try { savedTeacher = localStorage.getItem('mathquest_user_role') === 'teacher'; } catch (e) { savedTeacher = false; }
    if (savedTeacher && !document.body.classList.contains('teacher-mode') && typeof window.setUserRole === 'function') window.setUserRole('teacher', { persist: false });
    if (!document.body.classList.contains('teacher-mode')) { await playRecord(rec); return; }
    const o = openOverlay('mwsCodeOpen', `<h2 class="mws-dh">${esc(d.name)}</h2><p class="mws-p">A worksheet was shared with you: ${esc(L.pageTypeOf(rec))}, ${esc(L.skillsOf(d.host, d.req).map((k) => L.skillName(k.categoryId, k.skillId)).slice(0, 3).join(', '))}.</p>
<div class="mws-row mws-dfoot"><button type="button" class="tv-btn mws-b" data-mws-code="close">Close</button><button type="button" class="tv-btn mws-b" data-mws-code="play">${icon('play', 18)}<span>Play</span></button><button type="button" class="tv-btn mws-b" data-mws-code="print">${icon('print', 18)}<span>Print</span></button><button type="button" class="tv-btn tv-btn-primary mws-b" data-mws-code="save">${icon('bookmark', 18)}<span>Save to My Worksheets</span></button></div>`, 'Shared worksheet');
    o.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-mws-code]');
        if (!b) return;
        const act = b.dataset.mwsCode;
        if (act === 'close') { closeOverlay('mwsCodeOpen'); return; }
        if (act === 'print') { await printRecord(rec); return; }
        if (act === 'play') { closeOverlay('mwsCodeOpen'); await playRecord(rec); return; }
        b.disabled = true;
        try {
            const b2 = await L.buildRecord(rec).catch(() => null);
            const saved = await L.saveSheet({ host: d.host, req: d.req, name: d.name, firstHtml: b2 ? b2.firstHtml : '' });
            closeOverlay('mwsCodeOpen');
            toast(`“${saved.name}” is in My Worksheets`);
        } catch (err) { b.disabled = false; toast(err && err.cap ? capText(L.SHEET_CAP) : 'Could not save the worksheet'); }
    });
    setTimeout(() => o.querySelector('[data-mws-code="save"]')?.focus(), 0);
}
