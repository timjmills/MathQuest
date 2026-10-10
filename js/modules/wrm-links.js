// wrm-links.js — the White Rose small-step page's links: for one lesson of the school sequence,
// which skills teach it (DIRECT), which to do first (PREREQUISITES) and which go with it (RELATED).
//
// Pure: no window, no DOM, no state, no randomness. Same input → same lists, in the same order.
//
// THE RULES (documented here and in the page's "Why these?" note; the owner corrects them through
// WRM_LINK_OVERRIDES below, which always win):
//   DIRECT        every skill tagged to the lesson's WRM step in SKILL_WRM (js/modules/wrm.js). A tag
//                 that teaches only part of the step is kept and marked `partial` ("covers part").
//   PREREQUISITES (nearest and most specific first, cap 8, never a direct skill)
//                 1. The week's prior-learning list from the school's domain-sequence workbook (the
//                    "support blocks this week" column): the direct skills of those WRM steps. Steps that
//                    share a CCSS cluster with this lesson come first, then the nearest grade first.
//                 2. The direct skills of the 1–3 lessons just before this one in the same unit.
//                 3. Fallback when 1 and 2 give nothing: skills tagged to a lower-grade CCSS code in the
//                    same domain and cluster letter (e.g. 1.NBT.B for 2.NBT.B), nearest grade first.
//   RELATED       (best first, cap 8, never direct or prerequisite)
//                 1. Skills that share a CCSS code with this lesson (its first code first) but are not
//                    tagged to its step.
//                 2. The direct skills of the next 1–3 lessons in the same unit.

import { WRM_SEQUENCE } from './wrm-sequence-db.js';
import { skillsForWrmStep, wrmStep, WRM_PROPOSALS } from './wrm.js';
import { skillsForStandard, SKILL_STANDARDS } from './standards.js';
import { STANDARD_PROPOSALS, WRM_EXTENSIONS } from './build-list.js';

// ---- curated links (data/curriculum/links/<YEAR>.json, written by the tagging lane) ------------
// When a step has a curated record it wins over the computed rules: direct (with opts and partial),
// verdict, missing, build / preBuild proposal ids, pre and related. The page fetches the year files
// and hands them in with addCuratedYear(); a missing year or step falls back to the rules below.
const CURATED = new Map();       // step id -> record
const CURATED_PROPOSALS = {};    // proposal id -> { name, ... }
export function addCuratedYear(data) {
    if (!data || typeof data !== 'object' || !data.steps) return 0;
    let n = 0;
    for (const [id, rec] of Object.entries(data.steps)) { if (rec && typeof rec === 'object') { CURATED.set(id, rec); n += 1; } }
    Object.assign(CURATED_PROPOSALS, data.proposals || {});
    return n;
}
export function clearCurated() { CURATED.clear(); for (const k of Object.keys(CURATED_PROPOSALS)) delete CURATED_PROPOSALS[k]; }
export function curatedFor(stepId) { return CURATED.get(stepId) || null; }

/** A proposal's plain name: the year file's proposals first, then WRM_PROPOSALS, then the build list. */
export function proposalName(id) {
    const p = CURATED_PROPOSALS[id] || WRM_PROPOSALS[id] || STANDARD_PROPOSALS[id] || WRM_EXTENSIONS[id];
    return (p && (p.name || p.label || p.title)) || String(id).replace(/_/g, ' ');
}

export const PREREQ_CAP = 8;
export const RELATED_CAP = 8;

/**
 * The owner's corrections. Key: a WRM step id ('Y3.B1.S1') or, for a lesson with no step (CCSS BUILD),
 * its lesson key ('2:D1:7'). Value: { prereq: { add: [...], remove: [...] }, related: { add, remove },
 * direct: { add, remove } } with 'categoryId:skillId' keys. `add` goes to the front, in its own order.
 */
export const WRM_LINK_OVERRIDES = {
};

const DOMAIN_NAMES = {
    CC: 'Counting & Cardinality', OA: 'Operations & Algebraic Thinking', NBT: 'Number & Operations in Base Ten',
    NF: 'Fractions', MD: 'Measurement & Data', G: 'Geometry', E: 'Enrichment',
};
export function domainName(code) { return DOMAIN_NAMES[code] || code; }

const YEAR_LABEL = { R: 'Pre-K', Y1: 'Kindergarten', Y2: 'Grade 1', Y3: 'Grade 2', Y4: 'Grade 3', Y5: 'Grade 4', Y6: 'Grade 5' };
const YEARS = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'];
export function gradeOfYear(y) { return YEAR_LABEL[y] || y; }

// ---- the sequence, unpacked once -------------------------------------------------------------
let LESSONS = null;
let BY_KEY = null;
function unpack() {
    if (LESSONS) return;
    LESSONS = [];
    BY_KEY = new Map();
    for (const g of WRM_SEQUENCE) {
        for (const u of g.units) {
            u.lessons.forEach((t, i) => {
                const [title, step, ccss, power, type, weeks, strands, from] = t;
                const l = {
                    key: `${g.id}:${u.id}:${i + 1}`, grade: g.id, gradeLabel: g.label, unit: u.id, domain: u.domain,
                    unitName: u.name, n: i + 1, title, step, ccss, power: !!power, type, weeks, strands, from,
                };
                LESSONS.push(l);
                BY_KEY.set(l.key, l);
            });
        }
    }
}

/** Every grade: [{ id, label, units: [{ id, domain, name, weeks, power, lessons: [lesson] }] }]. */
export function sequenceGrades() {
    unpack();
    return WRM_SEQUENCE.map((g) => ({
        id: g.id, label: g.label, year: g.year,
        units: g.units.map((u) => ({ id: u.id, domain: u.domain, name: u.name, weeks: u.weeks, power: u.power,
            lessons: u.lessons.map((_, i) => BY_KEY.get(`${g.id}:${u.id}:${i + 1}`)) })),
    }));
}

export function allLessons() { unpack(); return LESSONS.slice(); }
export function lessonByKey(key) { unpack(); return BY_KEY.get(String(key || '')) || null; }
export function weekInfo(gradeId, week) {
    const g = WRM_SEQUENCE.find((x) => x.id === gradeId);
    return (g && g.weekInfo && g.weekInfo[week]) || {};
}

function siblings(lesson) {
    unpack();
    return LESSONS.filter((l) => l.grade === lesson.grade && l.unit === lesson.unit);
}

const clusterOf = (code) => {
    const m = /^([K\d])\.([A-Z]+)\.([A-Z])/.exec(String(code || '').toUpperCase());
    return m ? { grade: m[1] === 'K' ? 0 : +m[1], domain: m[2], letter: m[3], id: `${m[1]}.${m[2]}.${m[3]}` } : null;
};

function directOf(step, live) {
    if (!step) return [];
    return skillsForWrmStep(step, { withPartial: true }).filter((x) => live(x.key)).map((x) => ({ key: x.key, partial: x.partial || '' }));
}

function applyOverride(list, ov, why, cap) {
    if (!ov) return cap ? list.slice(0, cap) : list;
    const rm = new Set(ov.remove || []);
    const add = (ov.add || []).map((key) => ({ key, why }));
    const seen = new Set();
    const out = [];
    for (const x of [...add, ...list]) {
        if (rm.has(x.key) || seen.has(x.key)) continue;
        seen.add(x.key);
        out.push(x);
    }
    return cap ? out.slice(0, cap) : out;
}

/**
 * The three lists for a lesson (a lesson object or its key).
 * opts.live(key) → false drops a skill (e.g. a tombstoned id); default keeps everything.
 * Returns { lesson, step, direct: [{key, partial}], prereq: [{key, why}], related: [{key, why}] }.
 */
export function linksFor(lessonOrKey, opts = {}) {
    const lesson = typeof lessonOrKey === 'string' ? lessonByKey(lessonOrKey) : lessonOrKey;
    if (!lesson) return null;
    const live = opts.live || (() => true);
    const ovr = WRM_LINK_OVERRIDES[lesson.step || lesson.key] || {};
    const cur = lesson.step ? CURATED.get(lesson.step) : null;
    if (cur) return curatedLinks(lesson, cur, ovr, live);
    const direct = applyOverride(directOf(lesson.step, live), ovr.direct, 'Added by the school', 0)
        .map((x) => ({ key: x.key, partial: x.partial || '' }));
    const taken = new Set(direct.map((x) => x.key));
    const myClusters = new Set(lesson.ccss.map((c) => (clusterOf(c) || {}).id).filter(Boolean));

    // PREREQUISITES
    const pre = [];
    const push = (arr, key, why) => { if (!taken.has(key) && live(key)) { taken.add(key); arr.push({ key, why }); } };
    const g = WRM_SEQUENCE.find((x) => x.id === lesson.grade);
    const priorSteps = (g && g.prior && g.prior[lesson.weeks[0]]) || [];
    const ranked = priorSteps.map((sid, i) => {
        const rec = wrmStep(sid);
        const shares = rec && (rec.ccss || []).some((c) => myClusters.has((clusterOf(c) || {}).id));
        return { sid, rec, i, shares: shares ? 0 : 1, yr: -YEARS.indexOf(sid.split('.')[0]) };
    }).sort((a, b) => a.shares - b.shares || a.yr - b.yr || b.i - a.i);
    for (const r of ranked) {
        for (const d of directOf(r.sid, live)) {
            push(pre, d.key, `Taught before: ${gradeOfYear(r.sid.split('.')[0])}, "${r.rec ? r.rec.title : r.sid}"`);
        }
    }
    const sib = siblings(lesson);
    const at = sib.findIndex((l) => l.key === lesson.key);
    for (let k = at - 1; k >= Math.max(0, at - 3); k -= 1) {
        for (const d of directOf(sib[k].step, live)) push(pre, d.key, `Earlier in this unit: "${sib[k].title}"`);
    }
    if (!pre.length) {
        const lower = [];
        for (const c of myClusters) {
            const cl = clusterOf(c);
            for (const [key, e] of Object.entries(SKILL_STANDARDS)) {
                for (const code of e.ccss || []) {
                    const o = clusterOf(code);
                    if (o && o.domain === cl.domain && o.letter === cl.letter && o.grade < cl.grade) lower.push({ key, gap: cl.grade - o.grade, code });
                }
            }
        }
        lower.sort((a, b) => a.gap - b.gap || a.key.localeCompare(b.key));
        for (const x of lower) push(pre, x.key, `Earlier grade, same standard group (${x.code})`);
    }
    const prereq = applyOverride(pre, ovr.prereq, 'Added by the school', PREREQ_CAP);
    prereq.forEach((x) => taken.add(x.key));

    // RELATED
    const rel = [];
    for (const code of lesson.ccss) {
        for (const key of skillsForStandard(code)) push(rel, key, `Same standard (${code})`);
    }
    for (let k = at + 1; k <= Math.min(sib.length - 1, at + 3); k += 1) {
        for (const d of directOf(sib[k].step, live)) push(rel, d.key, `Next in this unit: "${sib[k].title}"`);
    }
    const related = applyOverride(rel, ovr.related, 'Added by the school', RELATED_CAP);
    const verdict = !direct.length ? 'gap' : direct.some((x) => !x.partial) ? 'full' : 'partial';
    return { lesson, step: lesson.step ? wrmStep(lesson.step) : null, direct, prereq, related, verdict,
        missing: verdict === 'partial' ? direct.map((x) => x.partial).filter(Boolean).join('; ') : '',
        build: [], preBuild: [], source: 'rules' };
}

function curatedLinks(lesson, cur, ovr, live) {
    const seen = new Set();
    const keep = (x) => x && x.key && live(x.key) && !seen.has(x.key) && seen.add(x.key);
    const direct = applyOverride([
        ...(cur.direct || []).map((x) => ({ key: x.key, opts: x.opts || null, partial: '' })),
        ...(cur.partial || []).map((x) => ({ key: x.key, opts: x.opts || null, partial: x.missing || 'part of the step' })),
    ], ovr.direct, 'Added by the school', 0).filter(keep).map((x) => ({ key: x.key, opts: x.opts || null, partial: x.partial || '' }));
    const prereq = applyOverride((cur.pre || []).map((x) => ({ key: x.key, why: x.why || '' })), ovr.prereq, 'Added by the school', 0).filter(keep);
    const related = applyOverride((cur.related || []).map((x) => ({ key: x.key, why: x.why || '' })), ovr.related, 'Added by the school', 0).filter(keep);
    const verdict = ['full', 'partial', 'gap'].includes(cur.verdict) ? cur.verdict
        : !direct.length ? 'gap' : direct.some((x) => !x.partial) ? 'full' : 'partial';
    return { lesson, step: wrmStep(lesson.step), direct, prereq, related, verdict, missing: cur.missing || '',
        build: (cur.build || []).slice(), preBuild: (cur.preBuild || []).slice(), note: cur.note || '', source: 'curated' };
}

/** Lessons whose title, CCSS code or unit name match the text, best first (cap `limit`). */
export function searchLessons(text, limit = 12) {
    unpack();
    const q = String(text || '').toLowerCase().replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!q) return [];
    const words = q.split(' ');
    const scored = [];
    for (const l of LESSONS) {
        const title = l.title.toLowerCase();
        const codes = l.ccss.join(' ').toLowerCase();
        const unit = `${l.unitName} ${domainName(l.domain)}`.toLowerCase();
        let s = 0;
        if (title === q) s = 100;
        else if (title.startsWith(q)) s = 80;
        else if (title.includes(q)) s = 60;
        else if (codes.split(' ').some((c) => c === q || c.startsWith(q))) s = 50;
        else if (words.every((w) => title.includes(w) || codes.includes(w) || unit.includes(w))) s = 30;
        if (s) scored.push({ l, s });
    }
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, limit).map((x) => x.l);
}
