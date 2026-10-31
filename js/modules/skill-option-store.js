// skill-option-store.js — the ONE place a skill set's chosen options live while the app runs.
//
// A teacher builds one set of skills and it shows up in six places: the home queue and its share
// panel, the Skills Navigator queue, the mixed-mode settings, the Add Skills (global) list, the
// print dialog and the pupil's chips. Every one of them is a copy of the same set, and a skill
// appears in a set at most once, so the options are stored ONCE, keyed 'categoryId:skillId':
//
//     state.skillOptionsBySkill = { 'multiplication:mult_facts': { constant: [7, 8] } }
//
// Values are PACKED (only what differs from the defaults), exactly what a share code carries.
//
// generate-question.js consults this map in plain generateQuestion() whenever the caller has not
// set explicit options, so practice, boss, race, the online worksheet, mixed play and the quiz
// builder all honour a set's options without any of them changing (see lookupSetOptions there).
// generateQuestionFor({ opts }) — print, preview, audits — always passes its own and wins.
//
// LIFETIME. The map lives for the session, like the skill queue it belongs to. It is NOT written
// to localStorage: a pupil who opened "Times 7 and 8" yesterday must not find mult_facts still
// restricted today. What survives a reload does so on its own carrier — a Quick Start card keeps
// its `opts`, saved mixed settings keep `skillOptions`, a print section keeps its `opts`.
import { state } from './state.js';
import { packOptions, describeOptions } from './skill-options.js';

const _key = (categoryId, skillId) => `${categoryId}:${skillId}`;
const _listeners = new Set();

function _map() {
    if (!state.skillOptionsBySkill || typeof state.skillOptionsBySkill !== 'object') state.skillOptionsBySkill = {};
    return state.skillOptionsBySkill;
}

function _changed() {
    for (const fn of _listeners) { try { fn(); } catch (e) { console.error('[skill-options] listener failed', e); } }
}

/** Run `fn` whenever any skill's options change (UIs re-render, share codes refresh). */
export function onSetOptionsChanged(fn) { _listeners.add(fn); return () => _listeners.delete(fn); }

/** The packed options this set holds for a skill ({} when it is at its defaults). */
export function getSetOptions(categoryId, skillId) {
    const v = _map()[_key(categoryId, skillId)];
    return v ? { ...v } : {};
}

/** True when the set holds a non-default choice for this skill. */
export function hasSetOptions(categoryId, skillId) {
    return Object.keys(getSetOptions(categoryId, skillId)).length > 0;
}

/** Store a skill's options (packed; defaults remove the entry). */
export function setSetOptions(categoryId, skillId, opts, { silent = false } = {}) {
    if (!categoryId || !skillId) return;
    const packed = packOptions(categoryId, skillId, opts || {});
    const m = _map();
    const k = _key(categoryId, skillId);
    const before = JSON.stringify(m[k] || {});
    if (Object.keys(packed).length) m[k] = packed; else delete m[k];
    if (!silent && before !== JSON.stringify(m[k] || {})) _changed();
}

export function deleteSetOptions(categoryId, skillId, { silent = false } = {}) {
    const m = _map();
    const k = _key(categoryId, skillId);
    if (!(k in m)) return;
    delete m[k];
    if (!silent) _changed();
}

export function clearSetOptions({ silent = false } = {}) {
    const had = Object.keys(_map()).length > 0;
    state.skillOptionsBySkill = {};
    if (had && !silent) _changed();
}

/** A copy of the whole map, for carriers that must survive a reload (saved mixed settings). */
export function snapshotSetOptions(onlyKeys) {
    const m = _map();
    const out = {};
    for (const [k, v] of Object.entries(m)) if (!onlyKeys || onlyKeys.has(k)) out[k] = { ...v };
    return out;
}

/** Merge a saved map back in (each entry re-packed, so a stale value cannot survive). */
export function restoreSetOptions(map, { replace = false } = {}) {
    if (replace) state.skillOptionsBySkill = {};
    if (map && typeof map === 'object') {
        for (const [k, v] of Object.entries(map)) {
            const at = k.indexOf(':');
            if (at > 0) setSetOptions(k.slice(0, at), k.slice(at + 1), v, { silent: true });
        }
    }
    _changed();
}

/** The one-line summary a chip or row shows, e.g. "Times: 7, 8" — '' at the defaults. */
export function describeSetOptions(categoryId, skillId) {
    const o = getSetOptions(categoryId, skillId);
    return Object.keys(o).length ? describeOptions(categoryId, skillId, o) : '';
}

// ===== REPEATED USES (a detailed lesson's Practice link, 2026-10-31) =====
// The set holds each skill once and the store above keys options by skill, so a link that uses one
// skill several times with different options ("placevalue:value" six times in lesson 6) cannot live
// in the queue alone. The decoded link's uses are kept here, in order, each with its own options;
// mixed play deals them use by use (generate-question.js, custom_mixed). Only a code that REPEATS a
// skill records uses: a link without repeats plays exactly as before.
//
// The uses are honoured only while the queue is still the set the link loaded: the same skills in
// the same order, and each skill's first use's options still the store's. Any later change to the
// set (a skill added or removed, an option edited, another set loaded) leaves them stale; ignored.

const _ukey = (u) => `${u.categoryId}:${u.skillId}`;

/** Record the uses of a just-loaded code ([{categoryId, skillId, opts}]); null unless a skill repeats. */
export function setQueueUses(list) {
    const uses = Array.isArray(list) ? list.filter((u) => u && u.categoryId && u.skillId) : [];
    const keys = uses.map(_ukey);
    state.queueUses = new Set(keys).size < keys.length
        ? uses.map((u) => ({ categoryId: u.categoryId, skillId: u.skillId, opts: packOptions(u.categoryId, u.skillId, u.opts && typeof u.opts === 'object' ? u.opts : {}) }))
        : null;
    return state.queueUses;
}

/** The recorded uses (a copy) while they still describe `queue` (default window.skillQueue), else null. */
export function queueUsesInPlay(queue) {
    const uses = state.queueUses;
    if (!Array.isArray(uses) || !uses.length) return null;
    const q = Array.isArray(queue) ? queue : (typeof window !== 'undefined' && Array.isArray(window.skillQueue) ? window.skillQueue : []);
    const firstOf = new Map();
    for (const u of uses) if (!firstOf.has(_ukey(u))) firstOf.set(_ukey(u), u);
    const order = [...firstOf.keys()];
    const qkeys = q.map(_ukey);
    if (qkeys.length !== order.length || qkeys.some((k, i) => k !== order[i])) return null;
    for (const u of firstOf.values()) {
        if (JSON.stringify(getSetOptions(u.categoryId, u.skillId)) !== JSON.stringify(u.opts || {})) return null;
    }
    return uses.map((u) => ({ categoryId: u.categoryId, skillId: u.skillId, opts: { ...(u.opts || {}) } }));
}
