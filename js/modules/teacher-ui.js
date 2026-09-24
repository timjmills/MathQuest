// teacher-ui.js — shared helpers for the teacher view (icons, escaping, toast, the skill
// catalogue, the current skill set and the device-local stores the teacher screens keep).
//
// The teacher view never invents data. Everything shown comes from:
//   - DOMAINS / SKILLS (data.js)                         the skill catalogue
//   - UnifiedSkills / window.skillQueue                  the CURRENT set (the app's skill queue)
//   - localStorage 'mq_teacher_sets'                     skill sets the teacher saved or sent
//   - localStorage 'mq_teacher_prints'                   worksheets printed from the Print screen
//   - localStorage 'mq_teacher_print_defaults'           print defaults chosen in Settings
// The last three are written only by the teacher screens themselves.

import { DOMAINS, SKILLS, getSkillGrade, isMixedMetaSkill, visibleSkills } from './data.js';
import { optionsFor, describeOptions } from './skill-options.js';
import { UnifiedSkills } from './unified-skills.js';

/* ------------------------------------------------------------------ icons */

const P = {
    send: '<path d="M20 4 10.5 13.5"/><path d="M20 4l-6 16-3.5-6.5L4 10z"/>',
    print: '<path d="M7 8V4h10v4"/><rect x="4" y="8" width="16" height="8" rx="2"/><path d="M7 13h10v7H7z"/>',
    board: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M12 16v4"/><path d="M8 20h8"/>',
    arrow: '<path d="M5 12h14"/><path d="M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
    chevR: '<path d="M9 6l6 6-6 6"/>',
    chevD: '<path d="M6 9l6 6 6-6"/>',
    sliders: '<path d="M4 7h9"/><path d="M17 7h3"/><circle cx="15" cy="7" r="2"/><path d="M4 17h3"/><path d="M11 17h9"/><circle cx="9" cy="17" r="2"/>',
    book: '<path d="M3 5.5h6a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H3z"/><path d="M21 5.5h-6a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H21z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    bookmark: '<path d="M6 4h12v16l-6-4-6 4z"/>',
    layers: '<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4h12l-2 4 2 4H5"/>',
    sheet: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6"/><path d="M10 17h6"/>',
    external: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    edit: '<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    bars: '<path d="M6 20v-6"/><path d="M12 20V8"/><path d="M18 20v-10"/>',
    dots: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    upload: '<path d="M12 16V4"/><path d="M7 9l5-5 5 5"/><path d="M4 20h16"/>',
    download: '<path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 13h10l1-13"/>',
    speaker: '<path d="M4 10v4h4l5 4V6L8 10z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
    device: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
    chart: '<path d="M4 4v16h16"/><path d="M8 15l3.5-3.5 3 3L19 9"/>',
    grip: '<circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>',
};

export function icon(name, size = 20, extra = '') {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${P[name] || ''}</svg>`;
}

/* ------------------------------------------------------------------ text */

export function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** A skill label without the emoji the pupil view decorates it with. */
export function cleanLabel(label) {
    return String(label || '')
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '')
        .replace(/^[\s½]+(?=\S)/, '')
        .replace(/\s+/g, ' ')
        .trim();
}

let toastTimer = null;
export function toast(msg) {
    const el = document.getElementById('tvToast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 2200);
}

export async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;left:-9999px;top:0;';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            ta.remove();
            return ok;
        } catch (e2) { return false; }
    }
}

export function fmtDay(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const today = new Date();
    const y = new Date(); y.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === y.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

/* ------------------------------------------------------------------ stores */

export function readStore(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
}
export function writeStore(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
}

export const SETS_KEY = 'mq_teacher_sets';
export const PRINTS_KEY = 'mq_teacher_prints';
export const PRINT_DEFAULTS_KEY = 'mq_teacher_print_defaults';

export function savedSets() {
    const list = readStore(SETS_KEY, []);
    return Array.isArray(list) ? list.filter((s) => s && Array.isArray(s.skills)) : [];
}
export function writeSets(list) { writeStore(SETS_KEY, list.slice(0, 50)); }

export function printDefaults() {
    const d = readStore(PRINT_DEFAULTS_KEY, {}) || {};
    return {
        size: ['S', 'M', 'L'].includes(d.size) ? d.size : 'L',
        paper: d.paper === 'Letter' ? 'Letter' : 'A4',
        photocopySafe: !!d.photocopySafe,
    };
}

/* ------------------------------------------------------------------ catalogue */

let catalogue = null;
/**
 * Every offered skill: tombstones and mixed "meta" pools are left out, because they are not
 * something a teacher chooses directly.
 * @returns {{domainId, domainName, domainColor, categoryId, categoryName, categoryIcon, skillId, label, level}[]}
 */
export function skillCatalogue() {
    if (catalogue) return catalogue;
    catalogue = [];
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        for (const cat of domain.categories) {
            for (const sk of visibleSkills(cat.id)) {
                if (isMixedMetaSkill(sk.v)) continue;
                const g = getSkillGrade(sk.v, cat.id);
                catalogue.push({
                    domainId, domainName: domain.name, domainColor: domain.color,
                    categoryId: cat.id, categoryName: cat.name, categoryIcon: cat.icon,
                    skillId: sk.v, label: cleanLabel(sk.l),
                    level: g === null || g === undefined ? 'M' : String(g),
                });
            }
        }
    }
    return catalogue;
}

export function findSkill(categoryId, skillId) {
    return skillCatalogue().find((s) => s.categoryId === categoryId && s.skillId === skillId) || null;
}

export function skillLabel(categoryId, skillId) {
    const hit = findSkill(categoryId, skillId);
    if (hit) return hit.label;
    const list = SKILLS[categoryId] || [];
    const raw = list.find((s) => s.v === skillId);
    return raw ? cleanLabel(raw.l) : skillId;
}

export function levelText(level) {
    return level === 'M' ? 'Mixed levels' : `Level ${level}`;
}

/* ------------------------------------------------------------------ the current set */

/** The current set = the app's skill queue (UnifiedSkills). Weight 1-9 lives on `weight`. */
export function currentSet() {
    return UnifiedSkills.skills;
}

export function addToCurrentSet(categoryId, skillId, extra = {}) {
    const hit = findSkill(categoryId, skillId);
    if (!hit) return false;
    const added = UnifiedSkills.add({
        domainId: hit.domainId, categoryId, skillId,
        skillLabel: hit.label, categoryIcon: hit.categoryIcon, categoryName: hit.categoryName,
        domainColor: hit.domainColor,
    });
    const item = UnifiedSkills.skills.find((s) => s.categoryId === categoryId && s.skillId === skillId);
    if (item) {
        if (extra.weight) item.weight = extra.weight;
        if (extra.opts && typeof extra.opts === 'object') item.opts = extra.opts;
    }
    return added;
}

export function removeFromCurrentSet(categoryId, skillId) {
    const i = UnifiedSkills.skills.findIndex((s) => s.categoryId === categoryId && s.skillId === skillId);
    if (i >= 0) UnifiedSkills.removeByIndex(i);
}

/** Replace the current set with a saved one (skills, weights, options). */
export function loadSetIntoQueue(set) {
    UnifiedSkills.clear();
    for (const sk of set.skills || []) addToCurrentSet(sk.categoryId, sk.skillId, { weight: sk.weight, opts: sk.opts });
    window.skillQueue = [...UnifiedSkills.skills];
}

/** A plain snapshot of the current set, for saving. */
export function snapshotCurrentSet() {
    return UnifiedSkills.skills.map((s) => {
        const out = { categoryId: s.categoryId, skillId: s.skillId, weight: s.weight && s.weight > 1 ? s.weight : 1 };
        if (s.opts && typeof s.opts === 'object') out.opts = s.opts;
        return out;
    });
}

export function levelsSummary(skills) {
    const lv = [...new Set(skills.map((s) => {
        const hit = findSkill(s.categoryId, s.skillId);
        return hit ? hit.level : null;
    }).filter(Boolean))];
    const order = ['K', '1', '2', '3', '4', '5', '6', 'M'];
    lv.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    if (!lv.length) return '';
    if (lv.length === 1) return levelText(lv[0]);
    const nums = lv.filter((l) => l !== 'M');
    return nums.length > 1 ? `Levels ${nums[0]}–${nums[nums.length - 1]}` : levelText(lv[0]);
}

/* ------------------------------------------------------------------ skill options */

/** A one-line summary of a skill's options, or '' when every option is at its default. */
export function optionsSummary(categoryId, skillId, opts) {
    try { return describeOptions(categoryId, skillId, opts || {}) || ''; } catch (e) { return ''; }
}

/**
 * The read-only options panel shown when the options agent's editor is not installed.
 * INTEGRATION POINT: `window.openSkillOptionsPanel(categoryId, skillId, anchorEl, ctx)` — when
 * present, the teacher screens call it instead and do not render this panel. `ctx` carries
 * `{opts, onChange(nextOpts)}`: the editor reports new values through onChange and the teacher
 * screen stores them on the skill (`item.opts`), from where the share code and the print request
 * pick them up.
 */
export function optionsReadOnlyHTML(categoryId, skillId, opts) {
    let defs = [];
    try { defs = optionsFor(categoryId, skillId); } catch (e) { defs = []; }
    if (!defs.length) return '<p class="tv-cap">This skill has no options.</p>';
    const cur = opts || {};
    const rows = defs.map((d) => {
        const v = d.id in cur ? cur[d.id] : d.default;
        let text;
        if (d.type === 'bool') text = v ? 'Yes' : 'No';
        else if (d.type === 'set') {
            const all = d.values || [];
            const picked = all.filter((x) => Array.isArray(v) && v.includes(x.v)).map((x) => x.l);
            text = !picked.length ? 'Any' : (picked.length === all.length && d.allLabel) ? d.allLabel : picked.join(', ');
        } else {
            const hit = (d.values || []).find((x) => x.v === v);
            text = hit ? hit.l : String(v);
        }
        return `<dt>${esc(d.label)}</dt><dd>${esc(text)}</dd>`;
    }).join('');
    return `<dl>${rows}</dl><p class="tv-cap">These are this skill's current option values. Changing them here arrives with the options update.</p>`;
}
