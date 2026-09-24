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
