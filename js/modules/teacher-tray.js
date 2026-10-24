// teacher-tray.js — the TRAY of the Teacher site 2.0 (lane S2, T3a; IMPROVEMENT_PLAN §2.4, the signed mock-up
// design/mockups/teacher-2/app.js tray() / trayPop()).
//
// The tray IS the current set: currentSet() / UnifiedSkills (teacher-ui.js). Nothing is copied:
//   item.weight    How often: Less · Equal · More = 1 · 2 · 3 (Detailed weights 1–10). An item without a weight, or
//                  with 0 (a share code's "no weight given", teacher-plan.js), is taken as Equal (2).
//   item.leftOut   true = left out for now (Detailed weights 0): still in the set, gets no problem.
//   item.count     an exact number of problems for that skill ("6 🔒"); exclusive with lockPct.
//   item.lockPct   a held share for that skill (0–100 %, "40 % 🔒"); exclusive with count. Counts come off the
//                  total first, then the held %, then the weights share the rest (teacher-plan.js planCounts).
//   item.opts      the skill's own options (the set's option store; teacher-chip.js edits them).
// Area and grade holds ('a:OA', 'g:OA|3') live in trayLocks(); planCounts (teacher-plan.js) takes them as
// opts.locks, so the counts "≈ n" here are the counts the worksheet sheet prints.
//
//   the bar      fixed at the foot of Skills (css/teacher-tray.css shows it only there), always visible:
//                empty → "Tick skills first" (Print and Share greyed; Quiz opens Build from); ≤ 8 skills one row
//                (List · Chips · Thumbnails, as the popup); > 8 one summary bar "Grade 3 · 64 skills · 6 areas ▸"
//                with one segment per area (+N); below 820 px "3 skills ▸" above the bottom bar.
//   the popup    area → grade → skill; search (skill-finder.js); select + bulk bar; How often per area /
//                grade / whole grade / skill; Detailed weights (0–10, share, ≈ n, % lock, split evenly or keep
//                proportions, > 100 % refused, a held scope shows "40 % 🔒" and asks before release); Remove;
//                Clear tray with Undo.
//   saving       the tray saves itself as the set 'tray' in mq_teacher_sets (Browse by › My sets lists it).
//
// Print · Quiz · Share call window.tvOpenSheet(kind, {from: 'tray'}) (T3b); without it the old screens open.

import { icon, esc, toast, findSkill, currentSet, addToCurrentSet, loadSetIntoQueue, savedSets, writeSets, readStore, writeStore } from './teacher-ui.js';
import { areaOf, AREAS, AREA_ORDER, areaIcon } from './teacher-areas.js';
import { skillSearchScores } from './skill-finder.js';
import { tvpAttrs, mountSample } from './teacher-preview.js';
import { openChipSheet, openBulkOptions, closeChipSheet } from './teacher-chip.js';

/* ================================================================= words and marks */

export const ABBR = { CC: 'Count', OA: 'Ops', NBT: 'PV', NF: 'Frac', MEAS: 'Meas', DATA: 'Data', G: 'Geo', RPNS: 'Ratio', MIXED: 'Mixed', WORDS: 'Words', NOSTD: 'None' };
export const GRADE_ORDER = ['K', '1', '2', '3', '4', '5', '6', 'M'];
const WNAME = { 1: 'Less', 2: 'Equal', 3: 'More' };
const SMALL = 8;          // up to 8 skills: one row of items; more: the summary bar
const PER_PAGE = 8;       // problems on a page at the default size (teacher-plan.js PER_PAGE.M)

export const gradeName = (g) => (g === 'K' ? 'Kindergarten' : g === 'M' ? 'Mixed levels' : `Grade ${g}`);
const gradeMark = (g) => (g === 'K' ? 'K' : g === 'M' ? 'Mix' : `G${g}`);
/** The grade badge (owner 2026-10-24): the grade's own colour (css/teacher-tokens.css --grade-*) AND its label, in a
 *  fixed first slot, so grade is never told by colour alone. `long` gives "Grade 2" (cards, headers). */
export const gbadge = (g, long = false) => `<span class="gbadge${long ? ' gbadge-long' : ''}" data-grade="${esc(g)}" title="${esc(gradeName(g))}"${long ? '' : ` aria-label="${esc(gradeName(g))}"`}>${long ? esc(g === 'K' ? 'Kindergarten' : g === 'M' ? 'Mixed levels' : `Grade ${g}`) : gradeMark(g)}</span>`;
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
const wWord = (n) => WNAME[n] || (n === 0 ? 'Left out' : `Weight ${n}`);
/** A long label shortened for a chip: the bracketed tail goes ("Add within 20 (No Pictures)" keeps its words). */
export const shortName = (l) => String(l || '').replace(/\s*\((?:B&W|black and white)\)\s*$/i, '');

/* ================================================================= the items */

export const keyOfItem = (it) => `${it.categoryId}:${it.skillId}`;
const splitKey = (k) => { const i = String(k).indexOf(':'); return [k.slice(0, i), k.slice(i + 1)]; };

/** The tray's items, every one a live skill; an item without a weight is Equal (2). */
export function trayItems() {
    const out = [];
    for (const it of currentSet()) {
        if (!findSkill(it.categoryId, it.skillId)) continue;
        if (typeof it.weight !== 'number' || !isFinite(it.weight) || it.weight <= 0) it.weight = 2;
        out.push(it);
    }
    return out;
}
export function trayKeys() { return trayItems().map(keyOfItem); }
export function trayHas(key) { return currentSet().some((it) => keyOfItem(it) === key); }
function itemOf(key) { return currentSet().find((it) => keyOfItem(it) === key) || null; }

const infoCache = new Map();
/** { a: area key, g: grade, label } of a skill key. */
export function infoOf(key) {
    if (infoCache.has(key)) return infoCache.get(key);
    const [c, s] = splitKey(key);
    const hit = findSkill(c, s);
    let a = 'NOSTD';
    try { a = areaOf(c, s) || 'NOSTD'; } catch (e) { a = 'NOSTD'; }
    const out = { a, g: hit ? hit.level : 'M', label: hit ? hit.label : s };
    infoCache.set(key, out);
    return out;
}
const wOf = (key) => { const it = itemOf(key); if (!it) return 2; if (it.leftOut === true) return 0; return typeof it.weight === 'number' && it.weight > 0 ? it.weight : 2; };
/** Detailed weights 0–10: 0 is "left out for now" (leftOut), never weight 0 (that is a share code's default). */
function setW(it, w) {
    if (!it) return;
    if (w <= 0) { it.leftOut = true; return; }
    delete it.leftOut;
    it.weight = Math.min(10, w);
}
const isNum = (v) => typeof v === 'number' && isFinite(v);
/** A skill held at an exact count or a %: '6' | '40 %' | null. */
function heldText(it) { if (!it) return null; if (isNum(it.count)) return String(Math.round(it.count)); if (isNum(it.lockPct)) return `${Math.round(it.lockPct)} %`; return null; }
const FIELDS = ['weight', 'leftOut', 'lockPct', 'count'];
function copyItem(it) {
    const o = { categoryId: it.categoryId, skillId: it.skillId };
    for (const f of FIELDS) if (it[f] !== undefined) o[f] = it[f];
    if (it.opts && typeof it.opts === 'object' && Object.keys(it.opts).length) o.opts = { ...it.opts };
    return o;
}

function areasOf(keys) {
    const by = {};
    keys.forEach((k) => (by[infoOf(k).a] = by[infoOf(k).a] || []).push(k));
    return AREA_ORDER.filter((a) => by[a]).map((a) => ({ a, ks: by[a] }));
}
function gradesOf(keys) {
    const by = {};
    keys.forEach((k) => (by[infoOf(k).g] = by[infoOf(k).g] || []).push(k));
    return GRADE_ORDER.filter((g) => by[g]).map((g) => ({ g, ks: by[g] }));
}

/* ================================================================= state */

const UI_KEY = 'mq_teacher_tray_ui';
const T = {
    locks: {},           // 'a:OA' | 'g:OA|3' → held %
    groups: [],          // owner 2026-10-24: "Problems for these" — [{ skills: ['cat:skill'], total } | { skills, pct }]
    lessons: [],         // T4 (owner, multi-lesson sets): lesson groups [{ id, name, ord, skills: ['cat:skill'] }] in lesson order
    groupMode: 'total',  // the bulk bar's toggle: 'total' (problems) | 'pct'
    groupN: 12,
    sel: new Set(),      // selected keys in the popup
    tq: '',              // the popup's search
    detailed: false,     // Detailed weights (remembered)
    tview: 'list',       // 'list' | 'chips' | 'thumbs' (remembered; the bar follows it)
    rest: 'even',        // when a % is held: 'even' (the rest back to Equal) | 'prop' (keep proportions)
    collapsed: {},       // area → collapsed
    open: false,         // the popup is open
    more: false,         // "View and more" (below 1100 px)
    ctl: '',             // the header whose ⋯ is open (phone)
    lockErr: '',
    releaseAsk: '',      // the held scope asking "Release the 40 %?"
    bulkN: 2,
    need: 0,             // the total a refused count needs ("Raise the total to N")
    bulkCount: 4,        // the bulk bar's "Set count" 
    opener: null,
};
(function restore() {
    const s = readStore(UI_KEY, null);
    if (!s || typeof s !== 'object') return;
    T.detailed = s.detailed === true;
    if (['list', 'chips', 'thumbs'].includes(s.tview)) T.tview = s.tview;
    if (s.rest === 'prop') T.rest = 'prop';
})();
function persistUi() { writeStore(UI_KEY, { detailed: T.detailed, tview: T.tview, rest: T.rest }); }

/** The area and grade holds, for planCounts(items, total, {locks}). */
export function trayLocks() { return { ...T.locks }; }
/** The group totals of the bulk bar ("Problems for these"), for planCounts(items, total, {groups}). */
export function trayGroups() { return T.groups.map((g) => ({ ...g, skills: g.skills.slice() })); }
const planOpts = () => ({ locks: T.locks, groups: trayGroups() });

const listeners = new Set();
/** Called after every change the tray makes (the gallery keeps its ticks in step). */
export function onTrayChange(fn) { listeners.add(fn); }

/* ================================================================= counts (teacher-plan.js, T3b) */

let PLAN = null;
import('./teacher-plan.js').then((m) => { if (m && typeof m.planCounts === 'function') { PLAN = m; refresh(); } }).catch(() => { /* not there yet: shares only */ });

function trayTotal(n) { return PER_PAGE * Math.max(1, Math.ceil(n / SMALL)); }
/** The worksheet's How much (teacher-sheet.js, shared with the popup's Total), or null before the sheet is in. */
function sheetAmount() { try { return window.tvSheetAmount ? window.tvSheetAmount.get() : null; } catch (e) { return null; } }
/** The problems the tray's counts are checked against: the sheet's current total (its kept Pages / Problems in all). */
function curTotal(nAct) {
    const a = sheetAmount();
    if (a) {
        if (a.mode === 'total' && a.n > 0) return a.n;
        if (a.mode === 'each' && a.n > 0) return a.n * Math.max(1, nAct);
        if (a.total) return a.total;
        if (a.mode === 'pages' && (a.pages || a.n)) return (a.pages || a.n) * PER_PAGE;
    }
    return trayTotal(nAct);
}

/** { pct: key → %, byKey: key → n | null, total, error } for the tray as it stands. */
function plan() {
    const list = trayItems();
    const act = list.filter((it) => it.leftOut !== true);
    const total = curTotal(act.length);
    if (PLAN) {
        try {
            const r = PLAN.planCounts(list, total, planOpts());
            if (r && !r.error) return { pct: r.pct || {}, byKey: r.byKey || {}, total, error: '' };
            if (r && r.error) return { pct: fallbackPct(list), byKey: null, total, error: r.error, need: r.needTotal };
        } catch (e) { /* fall through */ }
    }
    return { pct: fallbackPct(list), byKey: null, total, error: '' };
}
/** Before teacher-plan.js: shares by weight, held skills first (no area holds). */
function fallbackPct(list) {
    const out = {};
    const total = curTotal(list.filter((it) => it.leftOut !== true).length);
    const pctOf = (it) => (isNum(it.count) ? 100 * it.count / total : it.lockPct);
    const held = list.filter((it) => it.leftOut !== true && (isNum(it.lockPct) || isNum(it.count)));
    const used = held.reduce((t, it) => t + pctOf(it), 0);
    held.forEach((it) => { out[keyOfItem(it)] = pctOf(it); });
    const rest = list.filter((it) => it.leftOut !== true && !isNum(it.lockPct) && !isNum(it.count));
    const ws = rest.reduce((t, it) => t + it.weight, 0);
    rest.forEach((it) => { out[keyOfItem(it)] = ws ? Math.max(0, 100 - used) * it.weight / ws : 0; });
    return out;
}
/** A % held over 100 is refused (the same arithmetic the sheet uses). */
function lockError() {
    const list = trayItems();
    const total = curTotal(list.filter((it) => it.leftOut !== true).length);
    if (PLAN) { try { const r = PLAN.planCounts(list, total, planOpts()); return r && r.error ? r.error : ''; } catch (e) { return ''; } }
    const counts = list.reduce((t, x) => t + (isNum(x.count) && x.leftOut !== true ? x.count : 0), 0);
    if (counts > total) return `Counts add up to ${counts}, more than the ${total} problems the page holds.`;
    const sum = list.reduce((t, x) => t + (isNum(x.lockPct) ? x.lockPct : 0), 0) + Object.values(T.locks).reduce((t, v) => t + v, 0);
    return sum + 100 * counts / total > 100.01 ? `The held amounts come to ${Math.round(sum + 100 * counts / total)} %, more than the 100 % there is.` : '';
}

/* ================================================================= changing the tray */

function snapshot() {
    return {
        items: trayItems().map(copyItem),
        locks: { ...T.locks },
        groups: trayGroups(),
        lessons: trayLessons(),
    };
}
function restoreSnap(snap) {
    loadSetIntoQueue({ skills: snap.items.map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, opts: x.opts })) });
    for (const x of snap.items) {
        const it = itemOf(`${x.categoryId}:${x.skillId}`);
        if (!it) continue;
        it.weight = isNum(x.weight) && x.weight > 0 ? x.weight : 2;
        for (const f of ['leftOut', 'lockPct', 'count']) { if (x[f] !== undefined && x[f] !== null) it[f] = x[f]; else delete it[f]; }
    }
    T.locks = { ...(snap.locks || {}) };
    T.groups = (Array.isArray(snap.groups) ? snap.groups : []).map((g) => ({ ...g, skills: (g.skills || []).filter(trayHas) })).filter((g) => g.skills.length);
    if (Array.isArray(snap.lessons)) T.lessons = cleanLessons(snap.lessons);
    T.sel = new Set([...T.sel].filter(trayHas));
}

function addOne(key, extra = {}) {
    const [c, s] = splitKey(key);
    if (trayHas(key) || !findSkill(c, s)) return false;
    addToCurrentSet(c, s, extra.opts ? { opts: extra.opts } : {});
    const it = itemOf(key);
    if (it) it.weight = typeof extra.weight === 'number' ? extra.weight : 2;
    return true;
}

/** Tick a card: in or out of the tray. Returns true when the skill is now in. */
export function trayToggle(key) {
    if (trayHas(key)) { removeKeys([key]); changed(); return false; }
    addOne(key);
    changed();
    return true;
}

/** Bulk add (Add whole grade / area / all N on a standard, a MAP task): says what it added, with Undo. */
export function trayAddMany(keys, what) {
    const before = snapshot();
    let n = 0;
    for (const k of keys) if (addOne(k)) n++;
    changed();
    const total = trayItems().length;
    if (!n) { undoToast(`${what}: already in the tray (${plural(total, 'skill')}).`, null); return 0; }
    undoToast(`${what}: ${plural(n, 'skill')} added (${plural(total, 'skill')} in the tray).`, before);
    return n;
}

/** Replace the tray with a saved set (Browse by › My sets), with Undo. */
export function trayLoadSet(set) {
    const before = snapshot();
    const skills = (set.skills || []).filter((x) => x && findSkill(x.categoryId, x.skillId));
    // a set saved by the older screens has every weight 1 (their default): that is Equal here
    const old = skills.every((x) => !(x.weight > 1));
    restoreSnap({ items: skills.map((x) => ({ ...x, weight: old ? 2 : x.weight })), locks: set.locks || {}, groups: set.groups || [], lessons: set.lessons || [] });
    changed();
    undoToast(`${set.name || 'The set'} is in the tray (${plural(trayItems().length, 'skill')}).`, before);
}

/* ================================================================= lesson groups (T4, owner: multi-lesson sets)
 * A lesson's ticked skills go in as ONE group named after the lesson ("Lesson 4: Add within 20"). The groups keep
 * their lesson order (ord), are saved with the tray (and with Save as set), and the Print sheet offers one worksheet
 * per lesson, one for all, or both. A skill can sit in two lessons' groups; it is in the tray once. */
function cleanLessons(list) {
    return (Array.isArray(list) ? list : []).map((g) => ({ id: String(g.id || g.name || ''), name: String(g.name || 'Lesson'), ord: Number(g.ord) || 0, skills: [...new Set((g.skills || []).filter(trayHas))] }))
        .filter((g) => g.id && g.skills.length).sort((a, b) => a.ord - b.ord);
}
/** The lesson groups in lesson order: [{ id, name, ord, skills }]. */
export function trayLessons() { return cleanLessons(T.lessons).map((g) => ({ ...g, skills: g.skills.slice() })); }
/** Add a lesson's skills as its group (the same lesson again replaces its group), with Undo. */
export function trayAddLesson({ id, name, ord = 0, keys = [], opts = {} }) {
    const before = snapshot();
    let n = 0;
    for (const k of keys) if (addOne(k, opts[k] ? { opts: opts[k] } : {})) n++;
    const live = keys.filter(trayHas);
    if (!live.length) { undoToast('Tick skills first: they go in the tray as this lesson.', null); return 0; }
    T.lessons = cleanLessons([...T.lessons.filter((g) => g.id !== id), { id, name, ord, skills: live }]);
    changed();
    const nl = T.lessons.length;
    undoToast(`${name}: ${plural(live.length, 'skill')} in the tray${n < live.length ? ` (${live.length - n} already there)` : ''} · ${plural(nl, 'lesson')}, ${plural(trayItems().length, 'skill')}.`, before);
    return live.length;
}
/** Take one lesson out: its group and the skills no other lesson holds. */
function removeLesson(id) {
    const g = T.lessons.find((x) => x.id === id);
    if (!g) return;
    const before = snapshot();
    const others = new Set(T.lessons.filter((x) => x.id !== id).flatMap((x) => x.skills));
    T.lessons = T.lessons.filter((x) => x.id !== id);
    removeKeys(g.skills.filter((k) => !others.has(k)));
    changed();
    undoToast(`${g.name} taken out of the tray (${plural(trayItems().length, 'skill')} left).`, before);
}
/* Borrow: a lesson's Print practice / Share practice prints ONLY that lesson's skills. The tray is put aside (not
 * saved over) and comes back when the sheet closes (trayReturn). */
let borrowed = null;
export function trayBorrow(list) {
    if (!borrowed) borrowed = snapshot();
    restoreSnap({ items: list.map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, weight: 2, opts: x.opts })), locks: {}, groups: [], lessons: [] });
    T.lessons = [];
    window.skillQueue = [...currentSet()];
}
export function trayReturn() {
    if (!borrowed) return;
    const b = borrowed;
    borrowed = null;
    restoreSnap(b);
    T.lessons = cleanLessons(b.lessons);
    window.skillQueue = [...currentSet()];
    refresh();
    for (const fn of listeners) { try { fn(); } catch (e) { console.warn('[teacher-tray] listener', e); } }
}

function removeKeys(keys) {
    const set = new Set(keys);
    const keep = currentSet().filter((it) => !set.has(keyOfItem(it)));
    const snap = keep.map(copyItem);
    restoreSnap({ items: snap, locks: T.locks, groups: T.groups, lessons: T.lessons });
    keys.forEach((k) => T.sel.delete(k));
    // a hold on an area or grade that has left the tray goes with it
    const left = trayKeys();
    for (const sc of Object.keys(T.locks)) if (!scopeKeys(sc, left).length) delete T.locks[sc];
    T.lessons = cleanLessons(T.lessons);
}

function takeOut(keys, what) {
    if (!keys.length) return;
    const before = snapshot();
    removeKeys(keys);
    changed();
    undoToast(`${what} taken out of the tray (${plural(trayItems().length, 'skill')} left).`, before);
}

function changed() {
    T.sel = new Set([...T.sel].filter(trayHas));
    T.lessons = cleanLessons(T.lessons);
    window.skillQueue = [...currentSet()];
    save();
    refresh();
    for (const fn of listeners) { try { fn(); } catch (e) { console.warn('[teacher-tray] listener', e); } }
}

function refresh() {
    renderBar();
    if (T.open) renderPop();
}

/* ================================================================= saving (mq_teacher_sets) */

export const TRAY_SET_ID = 'tray';

/** "Grade 3 · 64 skills" — the tray in words. */
export function trayTitle(keys = trayKeys()) {
    if (!keys.length) return 'Empty';
    const gs = gradesOf(keys).map((x) => x.g);
    const g = gs.length === 1 ? gradeName(gs[0]) : gs.length === 2 ? `Grades ${gs[0]}–${gs[1]}` : plural(gs.length, 'grade');
    return `${g} · ${plural(keys.length, 'skill')}`;
}

function save() {
    const list = savedSets().filter((s) => s.id !== TRAY_SET_ID);
    const items = trayItems();
    if (!items.length) { writeSets(list); return; }
    const now = Date.now();
    const rec = {
        id: TRAY_SET_ID, tray: true, name: `Tray · ${trayTitle()}`, createdAt: now, lastUsed: now,
        skills: items.map(copyItem),
    };
    if (Object.keys(T.locks).length) rec.locks = { ...T.locks };
    if (T.groups.length) rec.groups = trayGroups();
    if (T.lessons.length) rec.lessons = trayLessons();
    writeSets([rec, ...list]);
}

let restored = false;
/** The first time Skills opens with an empty current set, the saved tray comes back. */
export function restoreTray() {
    if (restored) return;
    restored = true;
    if (currentSet().length) return;
    const rec = savedSets().find((s) => s.id === TRAY_SET_ID);
    if (!rec || !rec.skills.length) return;
    restoreSnap({ items: rec.skills.filter((x) => findSkill(x.categoryId, x.skillId)), locks: rec.locks || {}, groups: rec.groups || [], lessons: rec.lessons || [] });
    window.skillQueue = [...currentSet()];
}

/* ================================================================= scopes, How often, holds */

/** 'all' | 'a:OA' | 'g:OA|3' | 'r:3' (a whole grade, all areas) | 'k:<cat>:<skill>' → the keys in it. */
function scopeKeys(scope, keys = trayKeys()) {
    if (scope === 'all') return keys.slice();
    const t = scope.slice(0, 1), v = scope.slice(2);
    if (t === 'a') return keys.filter((k) => infoOf(k).a === v);
    if (t === 'g') return keys.filter((k) => `${infoOf(k).a}|${infoOf(k).g}` === v);
    if (t === 'r') return keys.filter((k) => infoOf(k).g === v);
    return keys.includes(v) ? [v] : [];
}
/** The held % of a scope (a skill's lockPct, an area's or grade's hold), or null. */
function heldPct(scope) {
    if (scope.startsWith('k:')) { const it = itemOf(scope.slice(2)); return it && isNum(it.lockPct) ? Math.round(it.lockPct) : null; }
    return T.locks[scope] !== undefined ? Math.round(T.locks[scope]) : null;
}
/** What a held scope says: '40 %' (a %) or '6' (a skill's exact count), else null. */
function heldLabel(scope) {
    if (scope.startsWith('k:')) return heldText(itemOf(scope.slice(2)));
    return T.locks[scope] !== undefined ? `${Math.round(T.locks[scope])} %` : null;
}
const skillHeld = (k) => heldText(itemOf(k)) !== null;

function setHowOften(scope, w) {
    for (const k of scopeKeys(scope)) { if (skillHeld(k)) continue; setW(itemOf(k), w); }
}

function evenRest(scope) {
    if (T.rest !== 'even') return;
    const inScope = new Set(scopeKeys(scope));
    for (const it of trayItems()) if (!inScope.has(keyOfItem(it)) && it.leftOut !== true && heldText(it) === null) it.weight = 2;
}
function refuse(before, err, what) {
    const p = plan();
    T.need = p.need && isFinite(p.need) ? p.need : 0;
    restoreSnap(before);
    T.lockErr = `Not set: ${err} ${what}`;
}
function setLock(scope, v) {
    const val = Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
    const before = snapshot();
    if (scope.startsWith('k:')) { const it = itemOf(scope.slice(2)); if (!it) return; it.lockPct = val; delete it.count; }
    else T.locks[scope] = val;
    evenRest(scope);
    const err = lockError();
    if (err) { refuse(before, err, 'Lower another held % or count first.'); return; }
    T.lockErr = '';
}
/** An exact number of problems for one skill (clears its %). */
function setCount(key, v) {
    const it = itemOf(key);
    if (!it) return;
    const n = Math.max(0, Math.min(999, Math.round(Number(v) || 0)));
    const before = snapshot();
    it.count = n;
    delete it.lockPct;
    delete it.leftOut;
    evenRest(`k:${key}`);
    const err = lockError();
    if (err) { refuse(before, err, 'Lower another count or held % first.'); return; }
    T.lockErr = '';
}
function release(scope) {
    if (scope.startsWith('k:')) { const it = itemOf(scope.slice(2)); if (it) { delete it.lockPct; delete it.count; } }
    else delete T.locks[scope];
    T.releaseAsk = '';
    T.lockErr = '';
}

/* ================================================================= the Undo note */

let undoTimer = 0;
let undoSnap = null;
function undoToast(msg, snap) {
    const el = ensureEl('tvTrayToast', 'tt-toast', 'status');
    undoSnap = snap;
    el.innerHTML = `<span>${esc(msg)}</span>${snap ? '<button type="button" class="tt-undo" data-tt-undo>Undo</button>' : ''}`;
    el.hidden = false;
    placeToast(el);
    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => { el.hidden = true; undoSnap = null; }, snap ? 8000 : 4000);
}
/** While a sheet is open the note sits just above that sheet's foot (its buttons stay in reach), inside the window. */
function placeToast(el) {
    const foot = [...document.querySelectorAll('#tvChipSheet:not([hidden]) .tt-sheet-foot, #tvTrayPop:not([hidden]) .tt-sheet-foot')].pop();
    if (foot && foot.getBoundingClientRect().height) el.style.bottom = `${Math.round(window.innerHeight - foot.getBoundingClientRect().top + 8)}px`;
    else el.style.removeProperty('bottom');
}
function undo() {
    if (!undoSnap) return;
    const s = undoSnap;
    undoSnap = null;
    restoreSnap(s);
    changed();
    const el = document.getElementById('tvTrayToast');
    if (el) el.hidden = true;
    toast(`Undone: ${plural(trayItems().length, 'skill')} in the tray`);
}

function ensureEl(id, cls, role) {
    let el = document.getElementById(id);
    if (el) return el;
    el = document.createElement('div');
    el.id = id;
    el.className = cls;
    if (role) el.setAttribute('role', role);
    el.hidden = true;
    (document.getElementById('teacherApp') || document.body).appendChild(el);
    return el;
}

/* ================================================================= the buttons: Print · Quiz · Share */

function openSheet(kind) {
    const items = trayItems();
    if (kind !== 'quiz' && !items.length) { undoToast('Tick skills first: they wait in the tray.', null); return; }
    closePop();
    closeChipSheet();
    if (typeof window.tvOpenSheet === 'function') { window.tvOpenSheet(kind, { from: 'tray', empty: !items.length, fromLesson: T.lessons.length > 0 }); return; }
    // T3b's sheets are not in yet: today's screens, with the tray's skills
    const skills = items.filter((it) => it.leftOut !== true).map((it) => ({ categoryId: it.categoryId, skillId: it.skillId, weight: it.weight, opts: it.opts }));
    if (kind === 'print') { if (typeof window.tvOpenPrintWith === 'function') window.tvOpenPrintWith(skills); else window.tvGo?.('print'); return; }
    if (kind === 'share') { window.tvGo?.('sets'); return; }
    window.tvGo?.('quizzes');
}

/* ================================================================= the bar */

function barItemHTML(k, many) {
    const { a, g, label } = infoOf(k);
    const mark = many && T.tview !== 'chips' ? `<span class="tt-li-a">${ABBR[a]}</span>` : '';
    const [c, s] = splitKey(k);
    const it = itemOf(k);
    const pv = tvpAttrs(c, s, it && it.opts);
    if (T.tview === 'chips') {
        return `<button type="button" class="tt-chip" data-domain="${a}" data-act="chip" data-arg="${esc(k)}"${pv} title="${esc(label)} · ${esc(AREAS[a].name)} · ${esc(gradeName(g))}">${gbadge(g)}<span class="tt-chip-dot">${areaIcon(a, 16)}</span><span class="tt-name">${esc(shortName(label))}</span>${many ? `<span class="tt-li-a">${ABBR[a]}</span>` : ''}</button>`;
    }
    if (T.tview === 'thumbs') {
        return `<button type="button" class="tt-mini" data-domain="${a}" data-act="chip" data-arg="${esc(k)}"${pv} title="${esc(label)}">${gbadge(g)}<span class="tt-mini-pic" data-tt-pic="${esc(k)}" aria-hidden="true"></span><span class="tt-mini-name">${esc(shortName(label))}</span>${mark}</button>`;
    }
    return `<button type="button" class="tt-li" data-domain="${a}" data-act="chip" data-arg="${esc(k)}"${pv} title="${esc(label)} · ${esc(gradeName(g))}">${areaIcon(a, 16)}<span class="tt-name">${esc(shortName(label))}</span>${mark}</button>`;
}

function barHTML() {
    const keys = trayKeys();
    const n = keys.length;
    const big = n > SMALL;
    const areas = areasOf(keys);
    const many = areas.length > 1;
    const dis = n ? '' : ' aria-disabled="true"';
    const label = n ? plural(n, 'skill') : 'Empty';
    let lead, mid;
    if (!n) {
        lead = `<div class="tt-label"><b>Tray</b><span>Empty</span></div>`;
        mid = `<div class="tt-empty">Tick skills to put them here. Quiz can also start from a standard, a White Rose step or a lesson.</div>`;
    } else if (T.lessons.length) {
        const nl = T.lessons.length;
        const loose = keys.filter((k) => !T.lessons.some((g) => g.skills.includes(k))).length;
        lead = `<div class="tt-label"><b>Tray</b><span>${plural(nl, 'lesson')} · ${plural(n, 'skill')}</span></div>`;
        mid = `<div class="tt-items tt-lessons">${T.lessons.map((g) => `<button type="button" class="tt-li tt-lesson" data-act="trayopen" title="${esc(g.name)}: ${plural(g.skills.length, 'skill')}"><span class="tt-name">${esc(g.name)}</span><span class="tt-li-a">${g.skills.length}</span></button>`).join('')}${loose ? `<button type="button" class="tt-li" data-act="trayopen"><span class="tt-name">Other skills</span><span class="tt-li-a">${loose}</span></button>` : ''}<button type="button" class="tt-btn tt-more" data-act="trayopen" hidden>+0 more</button></div>`;
    } else if (!big) {
        lead = `<div class="tt-label"><b>Tray</b><span>${n} skill${n === 1 ? '' : 's'} selected</span></div>`;
        mid = `<div class="tt-items tt-v-${T.tview}">${keys.map((k) => barItemHTML(k, true)).join('')}<button type="button" class="tt-btn tt-more" data-act="trayopen" hidden>+0 more</button></div>`;
    } else {
        lead = `<button type="button" class="tt-label tt-label-btn" data-act="trayopen" aria-label="Open the tray: ${esc(trayTitle(keys))}, ${plural(areas.length, 'area')}"><b>Tray</b><span>${esc(trayTitle(keys).split(' · ')[0])}</span><span>${label} · ${plural(areas.length, 'area')} ▸</span></button>`;
        mid = `<div class="tt-segs">${areas.map((x) => `<button type="button" class="tt-seg" data-domain="${x.a}" data-act="trayarea" data-arg="${x.a}" title="${esc(AREAS[x.a].name)}: open in the tray">${areaIcon(x.a, 16)}<span class="tt-seg-long">${esc(AREAS[x.a].short)}</span><span class="tt-seg-abbr">${ABBR[x.a]}</span><b>${x.ks.length}</b></button>`).join('')}<button type="button" class="tt-btn tt-more" data-act="trayopen" hidden>+0</button></div>`;
    }
    return `${lead}${mid}
      <button type="button" class="tt-btn tt-count" data-act="trayopen">${n ? `${esc(label)} ▸` : 'Tray empty'}</button>
      <div class="tt-actions">${n ? `<button type="button" class="tt-btn tt-review" data-act="trayopen">Review ${esc(label)}</button>` : '<span class="tt-hint">Tick skills first</span>'}
        <button type="button" class="tt-btn tt-ic" data-act="tray-quiz" aria-label="Quiz">${icon('sheet', 20)}<span class="tt-l">Quiz</span></button>
        <button type="button" class="tt-btn tt-ic" data-act="tray-share" aria-label="Share"${dis}>${icon('link', 20)}<span class="tt-l">Share</span></button>
        <button type="button" class="tt-btn${n ? ' tt-primary' : ''}" data-act="tray-print"${dis}>${icon('print', 20)}<span>Print</span></button>
      </div>`;
}

/** Draw the tray bar (it is in the page from the first Skills visit; CSS shows it only on Skills). */
export function renderBar() {
    const bar = mountBar();
    if (!bar) return;
    const keys = trayKeys();
    bar.classList.toggle('tt-big', keys.length > SMALL && !T.lessons.length);
    bar.classList.toggle('is-empty', !keys.length);
    bar.innerHTML = barHTML();
    bar.querySelectorAll('[data-tt-pic]').forEach((pic) => drawMini(pic));
    requestAnimationFrame(() => fitBar(bar));
}

function drawMini(pic) {
    const [c, s] = splitKey(pic.dataset.ttPic);
    const it = itemOf(pic.dataset.ttPic);
    const frame = document.createElement('span');
    frame.className = 'tvp-frame tt-mini-frame';
    pic.appendChild(frame);
    try { mountSample(frame, c, s, it && it.opts); } catch (e) { /* a picture never breaks the bar */ }
}

/** One row only: what does not fit becomes "+N more" (never "+N more" alone: the first name stays and wraps). */
function fitBar(bar) {
    for (const row of bar.querySelectorAll('.tt-items, .tt-segs')) {
        if (!row.offsetParent) continue;
        const more = row.querySelector('.tt-more');
        const items = [...row.children].filter((c) => c !== more);
        items.forEach((c) => { c.hidden = false; c.classList.remove('fit-wrap', 'bare'); });
        more.hidden = true;
        more.classList.remove('tight');
        row.classList.remove('abbr');
        if (row.scrollWidth <= row.clientWidth + 1) continue;
        const segs = row.classList.contains('tt-segs');
        if (segs) { row.classList.add('abbr'); if (row.scrollWidth <= row.clientWidth + 1) continue; }
        more.hidden = false;
        let hid = 0;
        for (let i = items.length - 1; i >= 0 && row.scrollWidth > row.clientWidth + 1; i--) {
            items[i].hidden = true; hid++;
            more.textContent = segs ? `+${hid}` : `+${hid} more`;
        }
        more.setAttribute('aria-label', `${hid} more: open the tray`);
        if (items.length && items.every((c) => c.hidden)) {
            items[0].hidden = false;
            hid = items.length - 1;
            more.textContent = segs ? `+${hid}` : `+${hid} more`;
            more.hidden = hid === 0;
            if (segs) {
                if (row.scrollWidth > row.clientWidth + 1) items[0].classList.add('bare');
                if (row.scrollWidth > row.clientWidth + 1) more.classList.add('tight');
                if (row.scrollWidth > row.clientWidth + 1) more.hidden = true;
            } else {
                items[0].classList.add('fit-wrap');
                if (row.scrollWidth > row.clientWidth + 1) more.textContent = `+${hid}`;
                if (row.scrollWidth > row.clientWidth + 1) more.hidden = true;   // the label still says how many
            }
        }
    }
}

let barEl = null;
function mountBar() {
    if (barEl && barEl.isConnected) return barEl;
    const app = document.getElementById('teacherApp');
    if (!app) return null;
    barEl = document.createElement('div');
    barEl.id = 'tvTray';
    barEl.className = 'tt-bar';
    barEl.setAttribute('role', 'region');
    barEl.setAttribute('aria-label', 'Tray');
    app.appendChild(barEl);
    barEl.addEventListener('click', onClick);
    let t = 0;
    window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { if (barEl) fitBar(barEl); }, 80); }, { passive: true });
    document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('[data-tt-undo]')) undo(); });
    return barEl;
}

/* ================================================================= the popup */

function selBox(scope, label) {
    const ks = scopeKeys(scope);
    const on = ks.filter((k) => T.sel.has(k)).length;
    const st = on === 0 ? 'false' : on === ks.length ? 'true' : 'mixed';
    return `<button type="button" class="tt-selbox" role="checkbox" aria-checked="${st}" aria-label="Select ${esc(label)}" data-act="sel" data-arg="${esc(scope)}"><i>${st === 'true' ? '✓' : st === 'mixed' ? '–' : ''}</i></button>`;
}
const pressed = (on) => `aria-pressed="${on ? 'true' : 'false'}"`;

/** Less · Equal · More for a scope; a held scope says "40 % 🔒" (never "Equal") and asks before release. */
function releaseHTML(scope, held) {
    if (T.releaseAsk === scope) {
        return `<div class="tt-release" role="group" aria-label="Release the held ${esc(held)}"><span>Release the ${esc(held)}?</span><button type="button" class="tt-btn" data-act="release" data-arg="${esc(scope)}">Release</button><button type="button" class="tt-btn" data-act="releasekeep">Keep ${esc(held)}</button></div>`;
    }
    return `<button type="button" class="tt-btn tt-held" data-act="releaseask" data-arg="${esc(scope)}" aria-label="Held at ${esc(held)}. Press to release">${esc(held)}${icon('lock', 16)}</button>`;
}
function howOftenHTML(scope) {
    const held = heldLabel(scope);
    if (held !== null) return releaseHTML(scope, held);
    const ks = scopeKeys(scope).filter((k) => !skillHeld(k));
    const ws = new Set(ks.map(wOf));
    const cur = ws.size === 1 ? String([...ws][0]) : '';
    return `<div class="tt-seg-ctl" role="group" aria-label="How often">${[['1', 'Less'], ['2', 'Equal'], ['3', 'More']].map(([v, l]) => `<button type="button" data-act="hw" data-arg="${esc(scope)}|${v}" ${pressed(cur === v)}>${l}</button>`).join('')}</div>`
        + `<span class="tt-tag-slot">${cur || !ks.length ? '' : '<span class="tt-tag">Mixed</span>'}</span>`;
}
function groupWord(ks) { const ws = new Set(ks.map(wOf)); return ws.size === 1 ? wWord([...ws][0]) : 'Mixed'; }
function oftenWord(scope, p) {
    const held = heldLabel(scope);
    if (held !== null) return `${esc(held)}${icon('lock', 12)}`;
    return `${groupWord(scopeKeys(scope).filter((k) => !skillHeld(k)))} · ${Math.round(p)} %`;
}
/** An exact count of problems for one skill ("6 problems"), exclusive with its %. */
function countCtl(k, n) {
    const it = itemOf(k);
    const v = it && isNum(it.count) ? Math.round(it.count) : '';
    return `<label class="tt-pct-in tt-cnt-in"><span class="tv-sr">Exact number of problems for ${esc(infoOf(k).label)}</span><input type="number" min="0" max="999" step="1" class="tt-cnt" data-key="${esc(k)}" value="${v}" placeholder="${n === null ? '' : n}"><span class="tt-cnt-l" aria-hidden="true">problems</span></label>`;
}
function pctCtl(scope, p) {
    const held = heldPct(scope);
    const v = held !== null ? held : Math.round(p);
    return `<span class="tt-pct-ctl"><label class="tt-pct-in"><span class="tv-sr">Share of the page for ${esc(scopeLabel(scope))}</span><input type="number" min="0" max="100" step="1" class="tt-pct" data-scope="${esc(scope)}" value="${v}"><span aria-hidden="true">%</span></label>`
        + `<button type="button" class="tt-btn tt-icon tt-lock" data-act="lock" data-arg="${esc(scope)}" aria-pressed="${held !== null}" aria-label="${held !== null ? 'Release' : 'Hold'} this % for ${esc(scopeLabel(scope))}">${icon(held !== null ? 'lock' : 'unlock', 18)}</button></span>`;
}
function scopeLabel(scope) {
    const t = scope.slice(0, 1), v = scope.slice(2);
    if (t === 'a') return AREAS[v] ? AREAS[v].name : v;
    if (t === 'g') { const [a, g] = v.split('|'); return `${AREAS[a] ? AREAS[a].short : a} ${gradeName(g)}`; }
    if (t === 'r') return gradeName(v);
    if (t === 'k') return infoOf(v).label;
    return 'the tray';
}
const dots = (sc, label) => `<button type="button" class="tt-btn tt-icon tt-dots" data-act="tpdots" data-arg="${esc(sc)}" aria-expanded="${T.ctl === sc}" aria-label="${esc(label)}: how often and remove">⋯</button>`;

function rowHTML(k, p, oneGrade) {
    const { a, g, label } = infoOf(k);
    const it = itemOf(k);
    const w = wOf(k);
    const heldT = heldText(it);
    const held = heldT !== null;
    const changedOpts = it && it.opts && Object.keys(it.opts).length;
    const tags = `<span class="tt-tags">${changedOpts ? '<span class="tt-tag">changed</span>' : ''}${held ? `<span class="tt-tag tt-tag-w tt-tag-held">${esc(heldT)}${icon('lock', 12)}</span>` : w !== 2 ? `<span class="tt-tag tt-tag-w">${wWord(w)}</span>` : ''}</span>`;
    const n = p.byKey ? (p.byKey[k] || 0) : null;
    const sc = `k:${k}`;
    const share = `<span class="tt-share">${n === null ? `${Math.round(p.pct[k] || 0)} %` : `≈ ${n}<span class="tt-of"> of ${p.total}</span>`}</span>`;
    const detail = !T.detailed ? '' : T.releaseAsk === sc ? `<span class="tt-det">${releaseHTML(sc, heldT)}${share}</span>`
        : `<span class="tt-det"><span class="tt-stepper"><button type="button" data-act="wstep" data-arg="${esc(k)}|-1" aria-label="Less weight for ${esc(label)}"${w <= 0 || held ? ' disabled' : ''}>−</button><output>${w}</output><button type="button" data-act="wstep" data-arg="${esc(k)}|1" aria-label="More weight for ${esc(label)}"${w >= 10 || held ? ' disabled' : ''}>+</button></span>${countCtl(k, n)}${pctCtl(sc, p.pct[k] || 0)}${share}</span>`;
    const x = `<button type="button" class="tt-btn tt-icon" data-act="tpremove" data-arg="k:${esc(k)}" aria-label="Take ${esc(shortName(label))} out of the tray">${icon('x', 18)}</button>`;
    const [c, s] = splitKey(k);
    const pv = tvpAttrs(c, s, it && it.opts);
    if (T.tview === 'chips' && !T.detailed) {
        return `<div class="tt-item tt-chipitem${w === 0 ? ' out' : ''}">${selBox(`k:${k}`, label)}<button type="button" class="tt-chip" data-domain="${a}" data-act="chip" data-arg="${esc(k)}"${pv}>${oneGrade ? '' : gbadge(g)}<span class="tt-chip-dot">${areaIcon(a, 16)}</span><span class="tt-name">${esc(shortName(label))}</span></button>${x}${tags}</div>`;
    }
    if (T.tview === 'thumbs' && !T.detailed) {
        return `<div class="tt-item tt-pthumb${w === 0 ? ' out' : ''}" data-domain="${a}" data-skill="${esc(k)}"><div class="tt-pthumb-top">${selBox(`k:${k}`, label)}${oneGrade ? '' : gbadge(g)}<button type="button" class="tt-name-btn" data-act="chip" data-arg="${esc(k)}">${esc(shortName(label))}</button>${x}</div><span class="tt-pthumb-pic ts-thumb" data-ts-thumb="${esc(c)}|${esc(s)}" data-ts-size="M" aria-hidden="true"></span>${tags}</div>`;
    }
    return `<div class="tt-row${w === 0 ? ' out' : ''}" data-domain="${a}"${oneGrade ? '' : ' data-grade-host'}>${oneGrade ? '' : gbadge(g)}${selBox(`k:${k}`, label)}<span class="tt-ricon">${areaIcon(a, 16)}</span><button type="button" class="tt-name-btn" data-act="chip" data-arg="${esc(k)}"${pv}>${esc(label)}</button>${tags}${x}${detail}</div>`;
}

/** Total: Pages · Problems in all, the same How much the worksheet sheet keeps (window.tvSheetAmount). */
function totalHTML(p) {
    const a = sheetAmount();
    if (!a) return '';
    const pages = a.mode === 'pages';
    const n = pages ? (a.pages || a.n || 1) : (a.mode === 'total' ? a.n : p.total);
    const b = (v, l) => `<button type="button" data-act="amode" data-arg="${v}" ${pressed((v === 'pages') === pages)}>${l}</button>`;
    return `<div class="tt-total" role="group" aria-labelledby="tvTrayTotalL"><span class="tt-row-label" id="tvTrayTotalL">Total</span><div class="tt-seg-ctl">${b('pages', 'Pages')}${b('total', 'Problems in all')}</div>`
        + `<span class="tt-stepper"><button type="button" data-act="astep" data-arg="-1" aria-label="Fewer"${n <= 1 ? ' disabled' : ''}>−</button><label><span class="tv-sr">${pages ? 'Pages' : 'Problems in all'}</span><input type="number" class="tt-amt" min="1" max="${pages ? 30 : 999}" value="${n}"></label><button type="button" data-act="astep" data-arg="1" aria-label="More">+</button></span>`
        + `<span class="tt-note">${pages ? `${p.total} problems` : `${Math.max(1, Math.ceil(p.total / PER_PAGE))} pages`}</span></div>`;
}
function setAmount(mode, n) { try { window.tvSheetAmount.set(mode, n); } catch (e) { return; } T.lockErr = ''; T.need = 0; changed(); }

function popHTML() {
    const p = plan();
    const keys = trayKeys();
    const sc = skillSearchScores(T.tq);
    const match = (k) => !sc || sc.has(k);
    const areas = areasOf(keys);
    const collapsedDefault = areas.length > 3;
    const grades = gradesOf(keys);
    const oneGrade = grades.length === 1;
    const q = T.tq.trim();
    const isCollapsed = (a) => !q && (a in T.collapsed ? T.collapsed[a] : collapsedDefault);
    const sumOf = (ks) => ks.reduce((t, k) => t + (p.pct[k] || 0), 0);
    const nOf = (ks) => (p.byKey ? ks.reduce((t, k) => t + (p.byKey[k] || 0), 0) : null);
    const ctlOpen = (s) => (T.ctl === s ? ' ctl-open' : '');
    const share = (ks) => { const n = nOf(ks); return n === null ? '' : `<span class="tt-n"> · ≈ ${n} of ${p.total}</span>`; };
    const body = areas.map(({ a, ks }) => {
        const vis = ks.filter(match);
        if (!vis.length) return '';
        const col = isCollapsed(a);
        const gs = gradesOf(ks);
        const head = `<div class="tt-ahead${ctlOpen(`a:${a}`)}">${selBox(`a:${a}`, AREAS[a].name)}`
            + `<button type="button" class="tt-toggle" data-act="tpcol" data-arg="${a}" aria-expanded="${!col}">${areaIcon(a, 20)}<span class="tt-hname"><b><span class="tt-wide">${esc(AREAS[a].name)}</span><span class="tt-short">${esc(AREAS[a].short)}</span></b><span class="tt-count-t">${plural(ks.length, 'skill')}${col && gs.length > 1 ? ` · ${gs.map((x) => `${x.g} ${x.ks.length}`).join(' · ')}` : ''}<span class="tt-state"> · ${oftenWord(`a:${a}`, sumOf(ks))}</span></span></span><span class="tt-chev" aria-hidden="true">${col ? '▸' : '▾'}</span></button>`
            + dots(`a:${a}`, AREAS[a].name)
            + `<span class="tt-ctl">${howOftenHTML(`a:${a}`)}<span class="tt-pp">${T.detailed ? pctCtl(`a:${a}`, sumOf(ks)) : `<span class="tt-p">${Math.round(sumOf(ks))} %</span>`}</span><button type="button" class="tt-btn tt-text tt-rm" data-act="tpremove" data-arg="a:${a}">Remove area</button></span></div>`;
        const inner = col ? '' : gs.map(({ g, ks: gk }) => {
            const gv = gk.filter(match);
            if (!gv.length) return '';
            const s = `g:${a}|${g}`;
            return `<div class="tt-grade"><div class="tt-ghead${ctlOpen(s)}" data-grade-host>${selBox(s, gradeName(g))}<span class="tt-hname">${gbadge(g, true)}<span class="tt-count-t">${plural(gk.length, 'skill')}${share(gk)}<span class="tt-state"> · ${oftenWord(s, sumOf(gk))}</span></span></span>`
                + dots(s, `${AREAS[a].short} ${gradeName(g)}`)
                + `<span class="tt-ctl">${howOftenHTML(s)}<span class="tt-pp">${T.detailed ? pctCtl(s, sumOf(gk)) : `<span class="tt-p">${Math.round(sumOf(gk))} %</span>`}</span><button type="button" class="tt-btn tt-text tt-rm" data-act="tpremove" data-arg="${esc(s)}">Remove grade</button></span></div>`
                + `<div class="tt-items-p tt-pv-${T.detailed ? 'list' : T.tview}">${gv.map((k) => rowHTML(k, p, oneGrade)).join('')}</div></div>`;
        }).join('');
        return `<section class="tt-area${col ? ' collapsed' : ''}" data-domain="${a}" id="tt-area-${a}">${head}${inner}</section>`;
    }).join('');
    const byGrade = grades.length > 1 && !q ? `<section class="tt-bygrade" aria-label="Whole grades, all areas"><p class="tt-row-label">Whole grades · all areas</p>${grades.map((x) => {
        const s = `r:${x.g}`;
        return `<div class="tt-ghead tt-rgrade${ctlOpen(s)}" data-grade-host>${selBox(s, gradeName(x.g))}<span class="tt-hname">${gbadge(x.g, true)}<b class="tt-wide">all areas</b><span class="tt-count-t">${plural(x.ks.length, 'skill')}${share(x.ks)}</span></span>`
            + dots(s, gradeName(x.g)) + `<span class="tt-ctl">${howOftenHTML(s)}<span class="tt-pp"><span class="tt-p">${Math.round(sumOf(x.ks))} %</span></span><button type="button" class="tt-btn tt-text tt-rm" data-act="tpremove" data-arg="${esc(s)}">Remove grade</button></span></div>`;
    }).join('')}</section>` : '';
    const lessonsBox = T.lessons.length && !q ? `<section class="tt-lessonbox" aria-label="Lessons in the tray"><p class="tt-row-label">Lessons · in lesson order</p>${T.lessons.map((g) => `<div class="tt-lgroup" data-tt-lesson="${esc(g.id)}"><div class="tt-ghead"><span class="tt-hname"><b>${esc(g.name)}</b><span class="tt-count-t">${plural(g.skills.length, 'skill')}</span></span><button type="button" class="tt-btn tt-text tt-rm" data-act="lessonrm" data-arg="${esc(g.id)}" aria-label="Take ${esc(g.name)} out of the tray">Remove lesson</button></div>`
        + `<div class="tt-items-p tt-pv-list">${g.skills.map((k) => { const x = infoOf(k); return `<button type="button" class="tt-li" data-domain="${x.a}" data-act="chip" data-arg="${esc(k)}">${gbadge(x.g)}${areaIcon(x.a, 16)}<span class="tt-name">${esc(shortName(x.label))}</span></button>`; }).join('')}</div></div>`).join('')}</section>` : '';
    const nSel = T.sel.size;
    const bulk = nSel ? `<div class="tt-bulk" role="group" aria-label="Selected skills"><b>${nSel} selected</b><span class="tt-row-label">How often</span><div class="tt-seg-ctl">${[['1', 'Less'], ['2', 'Equal'], ['3', 'More']].map(([v, l]) => `<button type="button" data-act="bulkw" data-arg="${v}">${l}</button>`).join('')}</div>`
        + (T.detailed ? `<span class="tt-stepper"><button type="button" data-act="bulkn" data-arg="-1" aria-label="Lower">−</button><output>${T.bulkN}</output><button type="button" data-act="bulkn" data-arg="1" aria-label="Higher">+</button></span><button type="button" class="tt-btn" data-act="bulkset">Set weight</button>` : '')
        + `<label class="tt-pct-in tt-cnt-in"><span class="tv-sr">Exact number of problems for each selected skill</span><input type="number" min="0" max="999" step="1" id="tvTrayBulkCount" value="${T.bulkCount}"><span class="tt-cnt-l" aria-hidden="true">problems</span></label><button type="button" class="tt-btn" data-act="bulkcount">Set count</button>`
        + `<span class="tt-bulk-group"><label class="tt-pct-in"><span class="tt-row-label">Problems for these</span><input type="number" min="0" max="${T.groupMode === 'pct' ? 100 : 999}" step="1" id="tvTrayGroupN" value="${T.groupN}"></label><span class="tt-seg-ctl" role="group" aria-label="Problems or a % of the whole set">${[['total', 'problems'], ['pct', '%']].map(([v, l]) => `<button type="button" data-act="groupmode" data-arg="${v}" ${pressed(T.groupMode === v)}>${l}</button>`).join('')}</span><button type="button" class="tt-btn" data-act="bulkgroup">Set</button></span>`
        + `<button type="button" class="tt-btn" data-act="bulkopts">Options…</button><button type="button" class="tt-btn" data-act="bulkremove">Remove</button><button type="button" class="tt-btn tt-text" data-act="selnone">Clear selection</button></div>` : '';
    const anyCol = areas.some((x) => isCollapsed(x.a));
    const tools = `<div class="tt-tools"><label class="tt-search"><span class="tv-sr">Find a skill in the tray</span>${icon('search', 20)}<input id="tvTraySearch" type="search" placeholder="Find a skill in the tray" value="${esc(T.tq)}" autocomplete="off"></label>`
        + `<button type="button" class="tt-toggle-sw" data-act="detailed" ${pressed(T.detailed)}><i aria-hidden="true"></i>Detailed weights</button>`
        + `<button type="button" class="tt-btn tt-more-btn" data-act="tpmore" aria-expanded="${T.more}">View and more ${T.more ? '▴' : '▾'}</button>`
        + `<div class="tt-extra${T.more ? ' open' : ''}"><div class="tt-seg-ctl tt-view" role="group" aria-label="View">${[['list', 'List'], ['chips', 'Chips'], ['thumbs', 'Thumbnails']].map(([v, l]) => `<button type="button" data-act="tview" data-arg="${v}" ${pressed(T.tview === v)}>${l}</button>`).join('')}</div>`
        + `<button type="button" class="tt-btn tt-text" data-act="tpall" data-arg="${anyCol ? 'open' : 'close'}">${anyCol ? 'Expand all' : 'Collapse all'}</button>`
        + `<button type="button" class="tt-btn tt-text" data-act="trayclear">Clear tray</button></div></div>`
        + (T.detailed ? `<div class="tt-rest tt-extra${T.more ? ' open' : ''}"><span class="tt-row-label">When you set a %, the rest</span><div class="tt-seg-ctl" role="group" aria-label="The rest">${[['even', 'Split evenly'], ['prop', 'Keep proportions']].map(([v, l]) => `<button type="button" data-act="rest" data-arg="${v}" ${pressed(T.rest === v)}>${l}</button>`).join('')}</div><button type="button" class="tt-btn tt-text" data-act="reseteq" data-arg="all">Reset all to equal</button><span class="tt-note">Weight 0 leaves a skill out for now; Less · Equal · More = 1 · 2 · 3.</span></div>` : '')
        + (T.groups.length ? `<div class="tt-groups">${T.groups.map((g, i) => `<span class="tt-group"><b>${plural(g.skills.length, 'skill')}</b> share ${g.pct !== undefined ? `${g.pct} % of the set` : plural(g.total, 'problem')}<span class="tt-note"> (${esc(g.skills.slice(0, 2).map((k) => shortName(infoOf(k).label)).join(', '))}${g.skills.length > 2 ? ' …' : ''})</span><button type="button" class="tt-btn tt-text" data-act="groupdel" data-arg="${i}" aria-label="Stop the shared total of these ${g.skills.length} skills">Remove</button></span>`).join('')}</div>` : '')
        + (T.lockErr || p.error ? `<p class="tt-warn" role="alert">⚠ ${esc(T.lockErr || p.error)}${(T.lockErr ? T.need : p.need) && isFinite(T.lockErr ? T.need : p.need) && sheetAmount() ? ` <button type="button" class="tt-btn" data-act="raise" data-arg="${T.lockErr ? T.need : p.need}">Raise the total to ${T.lockErr ? T.need : p.need}</button>` : ''}</p>` : '')
        + bulk;
    const empty = !keys.length ? '<p class="tt-note">The tray is empty. Tick skills on the Skills page and they wait here.</p>'
        : (body ? '' : `<p class="tt-note">No skill in the tray matches “${esc(T.tq)}”.</p>`);
    const act = keys.filter((k) => wOf(k) > 0).length;
    const summary = !keys.length ? 'Nothing in the tray yet'
        : `${plural(keys.length, 'skill')} · ${plural(areas.length, 'area')}${act < keys.length ? ` · ${act} in use` : ''} · ${p.total} problems (${plural(Math.round(p.total / PER_PAGE), 'page')}) share them as shown`;
    const dis = keys.length ? '' : ' aria-disabled="true"';
    return `<div class="tt-scrim" data-act="close"></div>
    <div class="tt-sheet tt-pop${T.detailed ? ' det' : ''}" role="dialog" aria-modal="true" aria-labelledby="tvTrayPopTitle">
      <div class="tt-sheet-head"><div class="tt-head-text"><p class="tt-eyebrow">Tray · ${esc(trayTitle(keys))}</p><h2 id="tvTrayPopTitle">Your tray</h2></div><button type="button" class="tt-btn tt-icon tt-close" data-act="close" aria-label="Close the tray">${icon('x', 20)}</button></div>
      <div class="tt-pop-head">${tools}</div>
      <div class="tt-pop-body">${lessonsBox}${byGrade}${body}${empty}</div>
      <div class="tt-sheet-foot">${totalHTML(p)}<div class="tt-summary">${esc(summary)}</div><button type="button" class="tt-btn" data-act="tray-quiz">${icon('sheet', 20)}<span>Quiz</span></button><button type="button" class="tt-btn" data-act="tray-share"${dis}>${icon('link', 20)}<span>Share</span></button><button type="button" class="tt-btn tt-primary" data-act="tray-print"${dis}>${icon('print', 20)}<span>Print</span></button></div>
    </div>`;
}

let popEl = null;
function mountPop() {
    if (popEl && popEl.isConnected) return popEl;
    const app = document.getElementById('teacherApp');
    if (!app) return null;
    popEl = document.createElement('div');
    popEl.id = 'tvTrayPop';
    popEl.className = 'tt-layer';
    popEl.hidden = true;
    app.appendChild(popEl);
    popEl.addEventListener('click', onClick);
    popEl.addEventListener('input', (e) => {
        if (e.target.id === 'tvTraySearch') {
            T.tq = e.target.value;
            clearTimeout(popEl._t);
            popEl._t = setTimeout(() => renderPop(), 120);
        }
    });
    popEl.addEventListener('change', (e) => {
        const inp = e.target.closest('input.tt-pct');
        if (inp) { setLock(inp.dataset.scope, inp.value); changed(); focusAfter(`input.tt-pct[data-scope="${CSS.escape(inp.dataset.scope)}"]`); return; }
        const amt = e.target.closest('input.tt-amt');
        if (amt) { const a = sheetAmount(); setAmount(a && a.mode === 'pages' ? 'pages' : 'total', amt.value); focusAfter('input.tt-amt'); return; }
        const cnt = e.target.closest('input.tt-cnt');
        if (cnt) {
            if (cnt.value === '') { release(`k:${cnt.dataset.key}`); } else setCount(cnt.dataset.key, cnt.value);
            changed();
            focusAfter(`input.tt-cnt[data-key="${CSS.escape(cnt.dataset.key)}"]`);
        }
    });
    popEl.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); closePop(); return; }
        const inp = e.target.closest('input.tt-pct, input.tt-cnt, input.tt-amt');
        if (inp && e.key === 'Enter') { e.preventDefault(); inp.dispatchEvent(new Event('change', { bubbles: true })); }
    });
    return popEl;
}

function renderPop() {
    const el = mountPop();
    if (!el) return;
    const body = el.querySelector('.tt-pop-body');
    const scroll = body ? body.scrollTop : 0;
    const sheetScroll = el.querySelector('.tt-sheet') ? el.querySelector('.tt-sheet').scrollTop : 0;
    const active = document.activeElement;
    const focusSel = active && el.contains(active)
        ? (active.id ? `#${CSS.escape(active.id)}` : active.dataset.act ? `[data-act="${active.dataset.act}"]${active.dataset.arg ? `[data-arg="${CSS.escape(active.dataset.arg)}"]` : ''}` : '')
        : '';
    const caret = active && active.id === 'tvTraySearch' ? active.selectionStart : null;
    el.innerHTML = popHTML();
    el.hidden = false;
    const b2 = el.querySelector('.tt-pop-body');
    if (b2) b2.scrollTop = scroll;
    const s2 = el.querySelector('.tt-sheet');
    if (s2) s2.scrollTop = sheetScroll;
    if (focusSel) {
        const again = el.querySelector(focusSel);
        if (again) { try { again.focus({ preventScroll: true }); if (caret !== null && again.setSelectionRange) again.setSelectionRange(caret, caret); } catch (e) { /* */ } }
    }
    drawThumbsIn?.(el);
}
function focusAfter(sel) {
    const el = popEl && popEl.querySelector(sel);
    if (el) { try { el.focus({ preventScroll: true }); } catch (e) { /* */ } }
}

/** Open the popup (optionally at one area). */
export function openTrayPopup(area) {
    T.open = true;
    T.opener = document.activeElement;
    if (area) { T.collapsed[area] = false; }
    renderPop();
    document.body.classList.add('tt-locked');
    const el = popEl;
    if (area) el.querySelector(`#tt-area-${CSS.escape(area)}`)?.scrollIntoView({ block: 'start' });
    (el.querySelector('#tvTraySearch') || el.querySelector('.tt-close'))?.focus({ preventScroll: true });
}
export function closePop() {
    if (!T.open) return;
    T.open = false;
    T.releaseAsk = '';
    T.ctl = '';
    if (popEl) { popEl.hidden = true; popEl.innerHTML = ''; }
    document.body.classList.remove('tt-locked');
    const back = T.opener;
    T.opener = null;
    if (back && back.isConnected) { try { back.focus({ preventScroll: true }); } catch (e) { /* */ } }
}
export function trayPopupOpen() { return T.open; }

/* ================================================================= clicks (bar and popup) */

function chipOpen(k, anchor) {
    const [c, s] = splitKey(k);
    const it = itemOf(k);
    if (!it) return;
    openChipSheet(c, s, {
        item: it,
        anchor,
        weight: () => wOf(k),
        held: () => heldLabel(`k:${k}`),
        count: () => { const x = itemOf(k); return x && isNum(x.count) ? Math.round(x.count) : null; },
        pct: () => heldPct(`k:${k}`),
        share: () => { const p = plan(); return { n: p.byKey ? (p.byKey[k] || 0) : null, pct: Math.round(p.pct[k] || 0), total: p.total, error: T.lockErr || p.error }; },
        setWeight: (w) => { const x = itemOf(k); if (x && !skillHeld(k)) { setW(x, w); changed(); } },
        setCount: (n) => { if (n === '' || n === null) release(`k:${k}`); else setCount(k, n); changed(); return T.lockErr; },
        setPct: (v) => { if (v === '' || v === null) release(`k:${k}`); else setLock(`k:${k}`, v); changed(); return T.lockErr; },
        release: () => { release(`k:${k}`); changed(); },
        remove: () => { takeOut([k], shortName(infoOf(k).label)); },
        changed: () => changed(),
    });
}

function onClick(e) {
    const b = e.target.closest('button, [data-act="close"]');
    if (!b) return;
    const act = b.dataset.act;
    const arg = b.dataset.arg || '';
    if (!act) return;
    if (b.getAttribute('aria-disabled') === 'true' && /^tray-(print|share)$/.test(act)) { undoToast('Tick skills first: they wait in the tray.', null); return; }
    switch (act) {
        case 'tray-print': openSheet('print'); return;
        case 'tray-quiz': openSheet('quiz'); return;
        case 'tray-share': openSheet('share'); return;
        case 'trayopen': openTrayPopup(); return;
        case 'trayarea': openTrayPopup(arg); return;
        case 'chip': chipOpen(arg, b); return;
        case 'close': closePop(); return;
        default: break;
    }
    // popup-only actions
    switch (act) {
        case 'sel': {
            const ks = scopeKeys(arg);
            const all = ks.every((k) => T.sel.has(k));
            ks.forEach((k) => (all ? T.sel.delete(k) : T.sel.add(k)));
            break;
        }
        case 'selnone': T.sel.clear(); break;
        case 'hw': { const i = arg.lastIndexOf('|'); setHowOften(arg.slice(0, i), Number(arg.slice(i + 1))); changed(); return; }
        case 'bulkw': [...T.sel].forEach((k) => { if (!skillHeld(k)) setW(itemOf(k), Number(arg)); }); changed(); return;
        case 'bulkcount': {
            const inp = popEl && popEl.querySelector('#tvTrayBulkCount');
            T.bulkCount = Math.max(0, Math.min(999, Math.round(Number(inp ? inp.value : T.bulkCount) || 0)));
            const before = snapshot();
            [...T.sel].forEach((k) => { const it = itemOf(k); if (it) { it.count = T.bulkCount; delete it.lockPct; delete it.leftOut; } });
            const err = lockError();
            if (err) refuse(before, err, 'Lower the count or select fewer skills.'); else T.lockErr = '';
            changed();
            return;
        }
        case 'bulkn': T.bulkN = Math.max(0, Math.min(10, T.bulkN + Number(arg))); break;
        case 'bulkset': [...T.sel].forEach((k) => { if (!skillHeld(k)) setW(itemOf(k), T.bulkN); }); changed(); return;
        case 'bulkremove': takeOut([...T.sel], plural(T.sel.size, 'selected skill')); return;
        case 'amode': { const a = sheetAmount(); if (!a) return; const p = plan(); setAmount(arg, arg === 'pages' ? Math.max(1, Math.ceil(p.total / PER_PAGE)) : p.total); return; }
        case 'astep': { const a = sheetAmount(); if (!a) return; const pages = a.mode === 'pages'; const cur = pages ? (a.pages || a.n || 1) : (a.mode === 'total' ? a.n : plan().total); setAmount(pages ? 'pages' : 'total', cur + Number(arg)); return; }
        case 'raise': setAmount('total', Number(arg)); return;
        case 'groupmode': T.groupMode = arg === 'pct' ? 'pct' : 'total'; break;
        case 'bulkgroup': {
            const inp = popEl && popEl.querySelector('#tvTrayGroupN');
            const n = Math.max(0, Math.min(T.groupMode === 'pct' ? 100 : 999, Math.round(Number(inp ? inp.value : T.groupN) || 0)));
            T.groupN = n;
            const keys = [...T.sel];
            if (!keys.length) break;
            const before = snapshot();
            T.groups = T.groups.map((g) => ({ ...g, skills: g.skills.filter((k) => !T.sel.has(k)) })).filter((g) => g.skills.length);
            T.groups.push(T.groupMode === 'pct' ? { skills: keys, pct: n } : { skills: keys, total: n });
            const err = lockError();
            if (err) refuse(before, err, 'Lower this total, or a count or held % in it.'); else T.lockErr = '';
            changed();
            return;
        }
        case 'groupdel': T.groups.splice(Number(arg), 1); T.lockErr = ''; changed(); return;
        case 'bulkopts': openBulkOptions([...T.sel].map(splitKey), { changed: () => changed() }); return;
        case 'tpremove': {
            const ks = scopeKeys(arg);
            const what = arg === 'all' ? 'Everything' : arg.startsWith('k:') ? shortName(infoOf(arg.slice(2)).label) : scopeLabel(arg);
            takeOut(ks, what);
            return;
        }
        case 'trayclear': takeOut(trayKeys(), 'Every skill'); return;
        case 'lessonrm': removeLesson(arg); return;
        case 'tpcol': { const keys = trayKeys(); const def = areasOf(keys).length > 3; const cur = arg in T.collapsed ? T.collapsed[arg] : def; T.collapsed[arg] = !cur; break; }
        case 'tpall': areasOf(trayKeys()).forEach((x) => { T.collapsed[x.a] = arg !== 'open'; }); break;
        case 'tpdots': T.ctl = T.ctl === arg ? '' : arg; break;
        case 'tpmore': T.more = !T.more; break;
        case 'tview': T.tview = ['list', 'chips', 'thumbs'].includes(arg) ? arg : 'list'; persistUi(); renderBar(); break;
        case 'detailed': T.detailed = !T.detailed; persistUi(); break;
        case 'rest': T.rest = arg === 'prop' ? 'prop' : 'even'; persistUi(); break;
        case 'reseteq': {
            const eq = (it) => { if (it) { it.weight = 2; delete it.lockPct; delete it.count; delete it.leftOut; } };
            if (arg === 'all') { T.locks = {}; trayItems().forEach(eq); }
            else { scopeKeys(arg).forEach((k) => eq(itemOf(k))); delete T.locks[arg]; }
            T.lockErr = '';
            changed();
            return;
        }
        case 'wstep': {
            const i = arg.lastIndexOf('|');
            const k = arg.slice(0, i);
            const it = itemOf(k);
            if (it && !skillHeld(k)) setW(it, Math.max(0, Math.min(10, wOf(k) + Number(arg.slice(i + 1)))));
            changed();
            focusAfter(`[data-act="wstep"][data-arg="${CSS.escape(arg)}"]`);
            return;
        }
        case 'lock': {
            if (heldLabel(arg) !== null) { T.releaseAsk = arg; break; }
            const inp = popEl && popEl.querySelector(`input.tt-pct[data-scope="${CSS.escape(arg)}"]`);
            setLock(arg, inp ? inp.value : 0);
            changed();
            return;
        }
        case 'releaseask': T.releaseAsk = arg; break;
        case 'releasekeep': T.releaseAsk = ''; break;
        case 'release': release(arg); changed(); return;
        default: return;
    }
    renderPop();
}

// The gallery lends its thumbnail drawer to the popup's Thumbnails view (teacher-library.js sets it).
let drawThumbsIn = null;
export function setThumbDrawer(fn) { drawThumbsIn = typeof fn === 'function' ? fn : null; }

/** Keep the bar in step when the tray changed somewhere else (another screen edited the current set). */
export function syncTray() { renderBar(); if (T.open) renderPop(); }
