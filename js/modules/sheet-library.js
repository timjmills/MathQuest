// sheet-library.js — My Worksheets: the store of every sheet a teacher saves (signed card design/my-worksheets/CARD.md).
//
// A saved sheet is the REQUEST that drew it, never the drawing (card §2): the same record reprints byte-identical and opens
// interactive with the same items. Records live in IndexedDB (`mathquest_quizzes`, store `sheets`, added by the
// DB_VERSION 2 upgrade in quiz-storage.js; `tests` / `results` untouched), folders / classes / tags in one `sheetFolders`
// record of the same store (card §3). Nothing else is changed: My sets (localStorage mq_teacher_sets) stay as they are.
//
//   record = { id, v: 1, name, folder, tags: [], cls, createdAt, updatedAt, printedAt,
//              host: 'teacher-print' | 'simple-print' | 'player', req, ui?, unit: {wrm, grade, folder} | null, thumb }
//   req (teacher-print / player) = the Print screen's own request: { paper, parts: [buildSheet request …], idx }
//   req (simple-print)           = { list: [{categoryId, skillId, opts?, amt?}], o: the dialog's build options }
//   Skill options are stored PACKED (skill-options.js packOptions: only what differs from the defaults), as share codes are.
//
// Loaded lazily (my-worksheets.js, the Save buttons, a ?sheet= link): a pupil's start never downloads it.

import { openQuizDB } from './quiz-storage.js';
import { packOptions } from './skill-options.js';
import { mergedSkillFor } from './skill-aliases.js';
import { SKILLS } from './data.js';
import { wrmFor, wrmStep } from './wrm.js';

export const SHEET_CAP = 500;
export const SHEET_WARN = 450;
export const LIB_FORMAT = 'mqsheets';
export const RECORD_V = 1;
const META_ID = 'sheetFolders';
export const OTHER_FOLDER = 'other';
const OTHER_NAME = 'Other sheets';

/* ================================================================= the store */

function tx(store, mode, fn) {
    return openQuizDB().then((db) => new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        let out;
        try { out = fn(s); } catch (e) { reject(e); return; }
        t.oncomplete = () => resolve(out && typeof out === 'object' && 'result' in out && out.readyState ? out.result : out);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
    }));
}
const isMeta = (r) => !r || r.id === META_ID || r.kind === 'meta';

/** Every saved sheet, newest change first. */
export async function listSheets() {
    const all = await tx('sheets', 'readonly', (s) => s.getAll());
    return (all || []).filter((r) => !isMeta(r)).map(migrate).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0) || String(a.id).localeCompare(String(b.id)));
}
export async function getSheet(id) {
    const r = await tx('sheets', 'readonly', (s) => s.get(String(id)));
    return r && !isMeta(r) ? migrate(r) : null;
}
/** Write a record as given (import, undo, rename …). */
export async function putSheet(rec) {
    await tx('sheets', 'readwrite', (s) => { s.put(rec); });
    return rec;
}
export async function deleteSheet(id) { await tx('sheets', 'readwrite', (s) => { s.delete(String(id)); }); }
/** Remove every sheet and the folders record (the gate's clean start; Import then restores). */
export async function clearSheets() { await tx('sheets', 'readwrite', (s) => { s.clear(); }); }
export async function countSheets() { return (await listSheets()).length; }

/* ================================================================= folders, classes, tags */

const emptyMeta = () => ({ id: META_ID, kind: 'meta', folders: [], classes: [], tags: [] });
export async function getMeta() {
    const r = await tx('sheets', 'readonly', (s) => s.get(META_ID));
    const m = Object.assign(emptyMeta(), r || {});
    m.folders = (Array.isArray(m.folders) ? m.folders : []).filter((f) => f && f.id && f.name);
    m.classes = uniq(m.classes); m.tags = uniq(m.tags);
    return m;
}
export async function putMeta(m) { await tx('sheets', 'readwrite', (s) => { s.put(Object.assign(emptyMeta(), m, { id: META_ID, kind: 'meta' })); }); }
function uniq(list) { return [...new Set((Array.isArray(list) ? list : []).map((x) => String(x || '').trim()).filter(Boolean))]; }
const newId = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** A teacher's own folder (one level, card §4). Returns the folder. */
export async function addFolder(name) {
    const nm = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    if (!nm) return null;
    const m = await getMeta();
    const same = m.folders.find((f) => f.name.toLowerCase() === nm.toLowerCase());
    if (same) return same;
    const f = { id: newId('f_'), name: nm, own: true };
    m.folders.push(f);
    await putMeta(m);
    return f;
}
export async function renameFolder(id, name) {
    const nm = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 60);
    const m = await getMeta();
    const f = m.folders.find((x) => x.id === id);
    if (!f || !nm) return false;
    f.name = nm;
    await putMeta(m);
    return true;
}
/** A folder goes only when it is empty (a unit folder is never deleted while it holds sheets). */
export async function deleteFolder(id) {
    if ((await listSheets()).some((r) => r.folder === id)) return false;
    const m = await getMeta();
    m.folders = m.folders.filter((f) => f.id !== id);
    await putMeta(m);
    return true;
}
/** The unit folder for a unit (made on demand, card §4). */
async function unitFolder(unit) {
    const m = await getMeta();
    if (!unit) {
        if (!m.folders.some((f) => f.id === OTHER_FOLDER)) { m.folders.push({ id: OTHER_FOLDER, name: OTHER_NAME, unit: 'other' }); await putMeta(m); }
        return OTHER_FOLDER;
    }
    const id = `u_${unit.block}`;
    if (!m.folders.some((f) => f.id === id)) { m.folders.push({ id, name: unit.folder, unit: unit.block, order: unit.order }); await putMeta(m); }
    return id;
}
async function remember(cls, tags) {
    const m = await getMeta();
    const c = uniq([...(m.classes || []), ...(cls ? [cls] : [])]), t = uniq([...(m.tags || []), ...(tags || [])]);
    if (c.length !== m.classes.length || t.length !== m.tags.length) { m.classes = c; m.tags = t; await putMeta(m); }
}

/* ================================================================= what a record holds */

/** The skills a request names, in order: [{categoryId, skillId, opts}]. */
export function skillsOf(host, req) {
    if (!req) return [];
    if (host === 'simple-print') return (req.list || []).map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, opts: x.opts || {} }));
    const out = [];
    for (const p of req.parts || []) for (const s of p.sections || []) for (const k of s.skills || []) out.push({ categoryId: k.categoryId, skillId: k.skillId, opts: k.opts || {} });
    return out;
}
const live = (c, k) => !!(SKILLS[c] && SKILLS[c].some((s) => s && (s.v === k || s.id === k)));
/** Is the skill still in the app (itself, or through its alias)? */
export function skillLive(categoryId, skillId) {
    if (live(categoryId, skillId)) return true;
    const m = mergedSkillFor(categoryId, skillId);
    return m.aliased && live(m.categoryId, m.skillId);
}
export function missingSkills(rec) {
    return [...new Set(skillsOf(rec.host, rec.req).filter((k) => !skillLive(k.categoryId, k.skillId)).map((k) => `${k.categoryId}:${k.skillId}`))];
}

function packOne(k) {
    let opts = k.opts && typeof k.opts === 'object' ? k.opts : {};
    try { opts = packOptions(k.categoryId, k.skillId, opts); } catch (e) { /* a skill with no option schema keeps what it had */ }
    return Object.assign({}, k, { opts });
}
/** The request with every skill's options packed (card §2). Pure. */
export function packReq(host, req) {
    const r = JSON.parse(JSON.stringify(req || {}));
    if (host === 'simple-print') { r.list = (r.list || []).map(packOne); return r; }
    for (const p of r.parts || []) for (const s of p.sections || []) s.skills = (s.skills || []).map(packOne);
    return r;
}
/** The request as it builds: a size S (dropped, owner 2026-11-13) reads M; a skill no longer in the app is left out. */
export function liveReq(host, req) {
    const r = JSON.parse(JSON.stringify(req || {}));
    const keep = (k) => k && skillLive(k.categoryId, k.skillId);
    if (host === 'simple-print') {
        r.list = (r.list || []).filter(keep);
        if (r.o && r.o.size === 'S') r.o.size = 'M';
        return r;
    }
    for (const p of r.parts || []) {
        if (p.size === 'S') p.size = 'M';
        for (const s of p.sections || []) s.skills = (s.skills || []).filter(keep);
    }
    r.parts = (r.parts || []).filter((p) => p.role === 'detailed-lesson' || p.lessonId || (p.sections || []).some((s) => (s.skills || []).length));
    return r;
}

/** An older record (or one hand-made) read as version 1: fields filled, size S as M. Never loses a field. */
export function migrate(r) {
    if (!r || typeof r !== 'object') return r;
    const o = Object.assign({}, r);
    o.v = RECORD_V;
    o.tags = uniq(o.tags);
    o.cls = typeof o.cls === 'string' ? o.cls : '';
    o.host = o.host === 'simple-print' || o.host === 'player' ? o.host : 'teacher-print';
    o.createdAt = Number(o.createdAt) || Number(o.updatedAt) || 0;
    o.updatedAt = Number(o.updatedAt) || o.createdAt;
    o.folder = o.folder || OTHER_FOLDER;
    if (o.req && Array.isArray(o.req.parts)) for (const p of o.req.parts) if (p && p.size === 'S') p.size = 'M';
    if (o.req && o.req.o && o.req.o.size === 'S') o.req.o.size = 'M';
    return o;
}

/* ================================================================= names and units */

const ROLE_WORD = {
    independent: 'Independent', 'more-practice': 'More Practice', 'mixed-practice': 'Mixed Review', 'word-problems': 'Word problems',
    lesson: 'Lesson', 'detailed-lesson': 'Lesson', opener: 'Opener', 'scripted-model': 'Model', guided: 'Guided',
    'pre-skill-check': 'Pre-skill check', 'error-analysis': 'Check it', review: 'Review', test: 'Test A', 'test-b': 'Test B',
    'fact-rows': 'Fact rows', 'fact-probe': 'Fact probe', 'true-false': 'True or False?', 'reason-it': 'Reason It', stretch: 'Stretch',
};
/** The page type in words ("Independent", "Lesson", "Simple print"). */
export function pageTypeOf(rec) {
    if (rec.host === 'simple-print') return 'Simple print';
    const roles = [...new Set(((rec.req && rec.req.parts) || []).map((p) => ROLE_WORD[p.role] || 'Worksheet'))];
    return roles.join(' + ') || 'Worksheet';
}
export function sizeOf(rec) {
    const s = rec.host === 'simple-print' ? rec.req && rec.req.o && rec.req.o.size : rec.req && rec.req.parts && rec.req.parts[0] && rec.req.parts[0].size;
    return s === 'L' ? 'L' : 'M';
}
/** A skill's pupil name (the label without its emoji). */
export function skillName(categoryId, skillId) {
    const m = live(categoryId, skillId) ? { categoryId, skillId } : mergedSkillFor(categoryId, skillId);
    const hit = (SKILLS[m.categoryId] || []).find((s) => s && (s.v === m.skillId || s.id === m.skillId));
    const t = hit ? String(hit.l || hit.label || m.skillId) : String(skillId);
    return t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/\s+/g, ' ').trim();
}
export function dayText(ts) { return new Date(ts || Date.now()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); }
/** Card §4: "‹page type› · ‹first skill› (+ N more) · ‹date›". */
export function defaultName(host, req, ts = Date.now()) {
    const ks = skillsOf(host, req);
    const uniqKs = [...new Map(ks.map((k) => [`${k.categoryId}:${k.skillId}`, k])).values()];
    const first = uniqKs[0] ? skillName(uniqKs[0].categoryId, uniqKs[0].skillId) : 'Worksheet';
    const more = uniqKs.length > 1 ? ` + ${uniqKs.length - 1} more` : '';
    return `${pageTypeOf({ host, req })} · ${first}${more} · ${dayText(ts)}`;
}
/** The sheet's unit (card §4): the first skill's White Rose block, from its SKILL_WRM tags. null when it has none. */
export function unitOfSkills(skills) {
    for (const k of skills || []) {
        const steps = wrmFor(k.categoryId, k.skillId);
        const st = steps.find((s) => !s.partial) || steps[0];
        if (!st) continue;
        const w = wrmStep(st.id);
        if (!w || !w.block || !w.year) continue;
        const blockN = (/\.B(\d+)$/.exec(w.block.id) || [])[1] || '';
        const order = Number(String(w.year.id).replace(/\D/g, '') || 0) * 100 + Number(blockN || 0);
        return { wrm: st.id, block: w.block.id, grade: w.year.usGrade || '', order, folder: `${w.year.name} · Block ${blockN} · ${w.block.name}`, short: `${w.year.id.replace('Year ', 'Y')} · B${blockN}` };
    }
    return null;
}

/* ================================================================= saving */

/**
 * Save a sheet. draft = {host, req, ui?, name?, folder?, tags?, cls?, firstHtml?}. With `id` (Edit, card A15 #1) the record is
 * updated in place; `copy` makes a new record. Returns the record. Throws {cap: true} at the 500-sheet cap (card A15 #3).
 */
export async function saveSheet(draft, { id = null, copy = false } = {}) {
    const now = Date.now();
    const old = id && !copy ? await getSheet(id) : null;
    if (!old && (await countSheets()) >= SHEET_CAP) { const e = new Error(`You have ${SHEET_CAP} saved worksheets: delete some or export the library first.`); e.cap = true; throw e; }
    const req = packReq(draft.host, draft.req);
    const unit = unitOfSkills(skillsOf(draft.host, req));
    const folder = draft.folder && draft.folder !== 'auto' ? draft.folder : await unitFolder(unit);
    const rec = migrate(Object.assign({}, old || {}, {
        id: old ? old.id : newId('ws_'),
        name: String(draft.name || defaultName(draft.host, req, now)).replace(/\s+/g, ' ').trim().slice(0, 120),
        folder, tags: uniq(draft.tags), cls: String(draft.cls || '').trim().slice(0, 30),
        createdAt: old ? old.createdAt : now, updatedAt: now, printedAt: old ? old.printedAt || 0 : 0,
        host: draft.host, req, unit: unit ? { wrm: unit.wrm, grade: unit.grade, block: unit.block, folder: unit.folder, order: unit.order } : null,
    }));
    if (draft.ui) rec.ui = JSON.parse(JSON.stringify(draft.ui)); else delete rec.ui;
    // page 1 for the thumbnail and the page count: from the host's own build, else built here once (a player's sheet)
    let first = draft.firstHtml || '';
    let pages = Number(draft.pages) || 0;
    if (!first || !pages) {
        try { const b = await buildRecord(rec); first = first || b.firstHtml; pages = pages || b.pages; } catch (e) { /* the card shows the outline */ }
    }
    if (pages) rec.pages = pages;
    rec.thumb = await makeThumb(first).catch(() => '') || (old && old.req && JSON.stringify(old.req) === JSON.stringify(req) ? old.thumb : '') || '';
    await putSheet(rec);
    await remember(rec.cls, rec.tags);
    // the browser is asked to keep the library under storage pressure (card §3), once
    try { if (navigator.storage && navigator.storage.persist && !saveSheet.asked) { saveSheet.asked = true; navigator.storage.persist().catch(() => {}); } } catch (e) { /* not offered */ }
    return rec;
}
export async function updateSheet(id, patch) {
    const r = await getSheet(id);
    if (!r) return null;
    const o = Object.assign({}, r, patch, { updatedAt: Date.now() });
    if (patch.tags) o.tags = uniq(patch.tags);
    await putSheet(o);
    if (patch.tags || patch.cls) await remember(o.cls, o.tags);
    return o;
}

/** A request with a new seed: the same settings, new numbers (New mix, card S-4). */
export function reseed(host, req, seed) {
    const r = JSON.parse(JSON.stringify(req));
    if (host === 'simple-print') { r.o.seed = seed >>> 0; return r; }
    // the Print screen deals each section from its own seed: (base + i × 7919)
    const base = seed >>> 0;
    (r.parts || []).forEach((p, j) => {
        const i = r.idx ? r.idx[j] : j;
        p.seed = (base + i * 7919) >>> 0;
        if (p.lessonSeeds) delete p.lessonSeeds;
    });
    return r;
}
export function freshSeed() { return Math.floor(Math.random() * 900000) + 100000; }
export function seedOf(rec) {
    if (rec.host === 'simple-print') return rec.req.o.seed;
    const p = rec.req.parts && rec.req.parts[0];
    const i = rec.req.idx ? rec.req.idx[0] : 0;
    return p ? ((p.seed - i * 7919) >>> 0) : 0;
}

/* ================================================================= building */

/** Build a record's pages: {pupilHtml, keyHtml, doc (what Print prints), firstHtml, plans, res}. */
export async function buildRecord(rec) {
    const host = rec.host;
    const req = liveReq(host, rec.req);
    if (host === 'simple-print') {
        const SP = await import('./simple-print.js');
        const b = await SP.buildSets(req.list, req.o);
        return { pupilHtml: b.pupilHtml, keyHtml: b.keyHtml || '', doc: b.doc, firstHtml: b.firstHtml || '', plans: b.firstPlan ? [b.firstPlan] : [], pages: b.pages || 0, title: rec.name };
    }
    const TP = await import('./teacher-print.js');
    const b = await TP.buildPrintRequest(req);
    const keyOn = req.parts.some((p) => p.key && (p.key === true || p.key.on));
    const plans = [];
    for (const part of b.parts) {
        const r = part.res || {};
        if (r.plan) plans.push(r.plan);
        else if (r.partPlans) for (const pp of r.partPlans) plans.push(...(pp.plans || []));
        else if (r.keyPlans) plans.push(...r.keyPlans);
    }
    const first = (b.parts[0] && b.parts[0].res && b.parts[0].res.pupilPages && b.parts[0].res.pupilPages[0]) || firstPage(b.pupilHtml);
    return { pupilHtml: b.pupilHtml, keyHtml: b.keyHtml, doc: keyOn ? b.docHtml : b.pupilHtml, firstHtml: first, plans, pages: b.pages.length, title: rec.name };
}
function firstPage(html) {
    const m = /<section\b[^>]*\bclass="ws-page[\s\S]*?<\/section>/.exec(String(html || ''));
    return m ? m[0] : '';
}

/** The items of the first printed page that holds items, in print order (Open interactive deals these; card §5). */
export function pageOneItemsOf(plans) {
    for (const plan of plans || []) {
        const sheets = plan && plan.sheets && plan.sheets.length ? plan.sheets : (plan ? [plan] : []);
        for (const p of sheets) for (const pg of (p.pages && p.pages.length ? p.pages : [{ sections: p.sections || [] }])) {
            const out = [];
            const walk = (part) => {
                if (!part) return;
                if (part.kind === 'grid') { (part.items || []).forEach((it) => { if (it && it.q) out.push(it.q); }); return; }
                if (part.content) walk(part.content);
                (part.contents || []).forEach(walk);
                (part.parts || []).forEach(walk);
            };
            (pg.sections || []).forEach(walk);
            if (out.length) return out;
        }
    }
    return [];
}
export async function pageOneItems(rec) { return pageOneItemsOf((await buildRecord(rec)).plans); }

/* ================================================================= thumbnails */

let cssCache = null;
async function sheetCss(doc) {
    if (cssCache) return cssCache;
    let css = '';
    for (const sh of Array.from(doc.styleSheets)) {
        try { for (const rule of Array.from(sh.cssRules)) { if (!/^@font-face/.test(rule.cssText)) css += rule.cssText + '\n'; } } catch (e) { /* not readable */ }
    }
    cssCache = css;
    return css;
}
/**
 * Page 1 at 240 px wide, made once at save time (≤ 25 KB; card §2): the page drawn into an SVG <foreignObject>, then a
 * canvas, as WebP (PNG where WebP is not offered). '' when it cannot be drawn (the card then shows the page outline).
 */
export async function makeThumb(firstHtml) {
    if (!firstHtml || typeof document === 'undefined') return '';
    const { sheetDocument } = await import('./print-sheet.js');
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:820px;height:1200px;border:0;visibility:hidden;';
    document.body.appendChild(frame);
    try {
        await new Promise((res) => { frame.onload = res; frame.srcdoc = sheetDocument(firstHtml, 'Thumb', { paper: 'A4' }); setTimeout(res, 4000); });
        const d = frame.contentDocument;
        const page = d && d.querySelector('.ws-page');
        if (!page) return '';
        const w = Math.ceil(page.getBoundingClientRect().width) || 794, h = Math.ceil(page.getBoundingClientRect().height) || 1123;
        const css = await sheetCss(d);
        const xml = new XMLSerializer().serializeToString(page);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><foreignObject x="0" y="0" width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="background:#fff;width:${w}px;height:${h}px;font-family:Andika,sans-serif;color:#000"><style>${css.replace(/<\/style/gi, '')}</style>${xml}</div></foreignObject></svg>`;
        const img = new Image();
        const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
        const W = 240, H = Math.round(W * h / w);
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
        g.drawImage(img, 0, 0, W, H);
        for (const q of [0.7, 0.5, 0.35]) {
            let out = c.toDataURL('image/webp', q);
            if (!/^data:image\/webp/.test(out)) out = c.toDataURL('image/png');
            if (out.length <= 25 * 1024 * 1.37) return out;
        }
        return '';
    } catch (e) {
        return '';
    } finally {
        frame.remove();
    }
}

/* ================================================================= export / import (card S-5) */

export async function exportLibrary() {
    const sheets = await listSheets();
    const meta = await getMeta();
    return JSON.stringify({ format: LIB_FORMAT, v: RECORD_V, exportedAt: Date.now(), sheets, meta: { folders: meta.folders, classes: meta.classes, tags: meta.tags } });
}
/**
 * Merge a .mqsheets file: a record with a new id is added; one with a known id is replaced only when the file's copy is newer
 * (merge-by-id: importing twice never duplicates). Folders, classes and tags are merged by id / name.
 * Returns {added, updated, kept, bad}.
 */
export async function importLibrary(text) {
    let o;
    try { o = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { throw new Error('That file is not a My Worksheets library (.mqsheets).'); }
    const list = Array.isArray(o) ? o : o && Array.isArray(o.sheets) ? o.sheets : null;
    if (!list || (o && !Array.isArray(o) && o.format && o.format !== LIB_FORMAT)) throw new Error('That file is not a My Worksheets library (.mqsheets).');
    const have = new Map((await listSheets()).map((r) => [r.id, r]));
    const out = { added: 0, updated: 0, kept: 0, bad: 0 };
    let n = have.size;
    for (const raw of list) {
        if (!raw || typeof raw !== 'object' || !raw.id || !raw.req) { out.bad++; continue; }
        const r = migrate(raw);
        const old = have.get(r.id);
        if (old) {
            if ((r.updatedAt || 0) > (old.updatedAt || 0)) { await putSheet(r); out.updated++; } else out.kept++;
            continue;
        }
        if (n >= SHEET_CAP) { out.bad++; continue; }
        await putSheet(r); have.set(r.id, r); n++; out.added++;
    }
    const m = await getMeta();
    const fm = (o && o.meta) || {};
    for (const f of Array.isArray(fm.folders) ? fm.folders : []) if (f && f.id && f.name && !m.folders.some((x) => x.id === f.id)) m.folders.push(f);
    // a record's folder that the file does not describe still shows (as "Other sheets" until the teacher names it)
    for (const r of have.values()) if (r.folder === OTHER_FOLDER && !m.folders.some((x) => x.id === OTHER_FOLDER)) m.folders.push({ id: OTHER_FOLDER, name: OTHER_NAME, unit: 'other' });
    m.classes = uniq([...m.classes, ...(fm.classes || [])]);
    m.tags = uniq([...m.tags, ...(fm.tags || [])]);
    await putMeta(m);
    return out;
}

/* ================================================================= the share code (card §6) */

function b64url(s) {
    const bytes = new TextEncoder().encode(s);
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
const HOST_CODE = { 'teacher-print': 't', 'simple-print': 's', player: 'p' };
const CODE_HOST = { t: 'teacher-print', s: 'simple-print', p: 'player' };
/** base64url of the compact {v, n, h, req}; append-only (a new field is optional, an unknown one is ignored). */
export function encodeSheetCode(rec) {
    return 'SH1.' + b64url(JSON.stringify({ v: 1, n: rec.name || '', h: HOST_CODE[rec.host] || 't', req: rec.req }));
}
export function decodeSheetCode(code) {
    try {
        const t = String(code || '').trim().replace(/^.*[?&]sheet=/, '').replace(/&.*$/, '');
        if (!/^SH1\./.test(t)) return null;
        const b = t.slice(4).replace(/-/g, '+').replace(/_/g, '/');
        const bin = atob(b + '==='.slice((b.length + 3) % 4));
        const o = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
        if (!o || o.v !== 1 || !o.req || typeof o.req !== 'object') return null;
        const host = CODE_HOST[o.h] || 'teacher-print';
        if (host === 'simple-print' ? !Array.isArray(o.req.list) || !o.req.o : !Array.isArray(o.req.parts)) return null;
        return { name: String(o.n || 'Shared worksheet').slice(0, 120), host, req: o.req };
    } catch (e) { return null; }
}
export function sheetLink(rec) {
    const loc = typeof location !== 'undefined' ? location : { origin: '', pathname: '/' };
    return `${loc.origin}${loc.pathname}?sheet=${encodeSheetCode(rec)}`;
}
