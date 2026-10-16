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
import { skillsForWrmStep, wrmStep, wrmFor, WRM_PROPOSALS } from './wrm.js';
import { skillsForStandard, SKILL_STANDARDS } from './standards.js';
import { STANDARD_PROPOSALS, WRM_EXTENSIONS } from './build-list.js';
import { plainNote, isPlain } from './plain-words.js';

// ---- curated links (data/curriculum/links/<YEAR>.json, written by the tagging lane) ------------
// When a step has a curated record it wins over the computed rules: direct (with opts and partial),
// verdict, missing, build / preBuild proposal ids, pre and related. The page fetches the year files
// and hands them in with addCuratedYear(); a missing year or step falls back to the rules below.
// Which files exist is data/curriculum/links/index.json (links-data.js reads it, so a missing file never
// costs a failed request). Add a year there in the same change that adds its file; ws-wrm-page-unit
// checks both agree.
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
const EXTRA_NAMES = {};          // proposal id -> { name } from MAP.json and the build list (addProposalNames)
export function addProposalNames(obj) {
    for (const [id, p] of Object.entries(obj || {})) if (p && (p.name || p.label || p.title) && !EXTRA_NAMES[id]) EXTRA_NAMES[id] = { name: p.name || p.label || p.title };
}
export function proposalName(id) {
    const p = CURATED_PROPOSALS[id] || EXTRA_NAMES[id] || WRM_PROPOSALS[id] || STANDARD_PROPOSALS[id] || WRM_EXTENSIONS[id];
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
                const [rawTitle, step, ccss, power, type, weeks, strands, from, note] = t;
                const title = String(rawTitle).replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');   // "(How many left )"
                const l = {
                    key: `${g.id}:${u.id}:${i + 1}`, grade: g.id, gradeLabel: g.label, unit: u.id, domain: u.domain,
                    unitName: u.name, n: i + 1, title, step, ccss, power: !!power, type, weeks, strands, from, note: note || '',
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
    const add = (ov.add || []).map((k) => (typeof k === 'string' ? { key: k, why } : { why, ...k }));
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
        .map((x) => ({ key: x.key, partial: x.partial ? composePartial(x.partial) : '' }));
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
            push(pre, d.key, `Taught before: ${gradeOfYear(r.sid.split('.')[0])}, "${r.rec ? tidyTitle(r.rec.title) : r.sid}"`);
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
        missing: verdict === 'partial' ? (directOf(lesson.step, live).map((x) => composeMissing(x.partial)).find(Boolean) || '') : '',
        build: [], preBuild: [], source: 'rules' };
}

function curatedLinks(lesson, cur, ovr, live) {
    const seen = new Set();
    const keep = (x) => x && x.key && live(x.key) && !seen.has(x.key) && seen.add(x.key);
    const build = (cur.build || []).slice();
    const direct = applyOverride([
        ...(cur.direct || []).map((x) => ({ key: x.key, opts: x.opts || null, partial: '' })),
        ...(cur.partial || []).map((x) => ({ key: x.key, opts: x.opts || null, partial: composePartial(x.missing, build) })),
    ], ovr.direct, 'Added by the school', 0).filter(keep).map((x) => ({ key: x.key, opts: x.opts || null, partial: x.partial || '' }));
    // opts travel with every link (a curated pre / related skill is often "within 100" etc.)
    const withOpts = (group) => (x) => ({ key: x.key, why: composeWhy(x.why || '', { key: x.key, lesson, group }), opts: x.opts && Object.keys(x.opts).length ? x.opts : null });
    const prereq = applyOverride((cur.pre || []).map(withOpts('prereq')), ovr.prereq, 'Added by the school', 0).filter(keep);
    const related = applyOverride((cur.related || []).map(withOpts('related')), ovr.related, 'Added by the school', 0).filter(keep);
    const verdict = ['full', 'partial', 'gap'].includes(cur.verdict) ? cur.verdict
        : !direct.length ? 'gap' : direct.some((x) => !x.partial) ? 'full' : 'partial';
    return { lesson, step: wrmStep(lesson.step), direct, prereq, related, verdict, missing: composeMissing(cur.missing, build, cur.envision),
        build, preBuild: (cur.preBuild || []).slice(), note: cur.note || '', source: 'curated' };
}

/**
 * The page installs real skill labels with setSkillLabeler(fn(key|id) → label|null); Node gates install theirs.
 */
let skillLabeler = null;
export function setSkillLabeler(fn) { skillLabeler = typeof fn === 'function' ? fn : null; }
/** A live skill's label (through the installed labeler), or null. */
export function liveSkillLabel(id) { return skillLabeler && id ? skillLabeler(id) || null : null; }

/* ================================================================= teacher sentences (fix round 6)
 * WHITELIST, not blacklist: every line a teacher reads about a link is COMPOSED from structured fields — the
 * White Rose steps a note names (resolved to their grade and title), the relation of that step to this lesson
 * (the step before, the next step, taught before in an earlier grade …), the week numbers, the skill's own
 * White Rose steps and standards, and the names of the entries still to be built. The tagging lanes' free-text
 * note is shown only when it passes plain-words.js WHOLE; it is never partly rewritten. The notes stay in the
 * link files and the CSV for the build team.
 */
/** A title as written, with stray spaces inside brackets closed up ("(How many left )"). */
export const tidyTitle = (t) => String(t || '').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s{2,}/g, ' ').trim();
/** A White Rose step's title, tidied, or ''. */
export function stepTitle(id) { const r = wrmStep(id); return r ? tidyTitle(r.title) : ''; }
/**
 * A MAP task's name as the screens show it: the MAP list's own name with its arrows drawn ("<->" → "↔"), "Gr 6"
 * as "Grade 6", and any bracket that is not plain English left out.
 */
export function taskName(raw) {
    const t = tidyTitle(raw).replace(/\s*<->\s*/g, ' ↔ ').replace(/\s*->\s*/g, ' → ').replace(/\bGr\.?\s?(\d)\b/g, 'Grade $1')
        .replace(/\bB&W\b/g, 'black-and-white').replace(/\(Q1\)/g, '(first quadrant)').replace(/\(upper band\)/g, '(higher RIT scores)');
    if (isPlain(t, { fragment: false })) return t;
    return t.replace(/\s*\(([^()]*)\)/g, (m, x) => (isPlain(x, { fragment: false }) ? m : '')).trim();
}
const YEAR_ORDER = ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'];
const STEP_PART = /^((R|Y[1-6])\.B(\d+))\.S(\d+)$/;
const ID_CHAIN = /\b(?:R|Y[1-6])\.B\d+(?:\.S\d+(?:\s*[-–]\s*S\d+)?)?\b(?:\s*(?:\/|,|&|\band\b|\bor\b)\s*(?:(?:R|Y[1-6])\.B\d+(?:\.S\d+(?:\s*[-–]\s*S\d+)?)?|S\d+(?:\s*[-–]\s*S\d+)?)\b)*/g;

/** The White Rose steps a note names, in order: "Y3.B1.S8", "R.B11.S5 / S6", "Y6.B8.S1-S2". */
export function stepsInNote(text) {
    const out = [];
    for (const m of String(text || '').match(ID_CHAIN) || []) {
        let blk = '';
        for (const p of m.split(/\s*(?:\/|,|&|\band\b|\bor\b)\s*/)) {
            const f = /^(?:((?:R|Y[1-6])\.B\d+)(?:\.S(\d+))?|S(\d+))(?:\s*[-–]\s*S(\d+))?$/.exec(p);
            if (!f) continue;
            if (f[1]) blk = f[1];
            const a = +(f[2] || f[3] || 0);
            if (!a || !blk) continue;
            for (let n = a; n <= Math.max(a, Math.min(+(f[4] || a), a + 9)); n += 1) {
                const id = `${blk}.S${n}`;
                if (wrmStep(id) && !out.includes(id)) out.push(id);
            }
        }
    }
    return out;
}
/** The school weeks a note names ("wk W11", "week W05", "W30"), as numbers. */
export function weeksInNote(text) {
    const out = [];
    for (const m of String(text || '').matchAll(/\b(?:wk|week),?\s*W?0?(\d{1,2})\b|\bW0?(\d{1,2})\b/gi)) {
        const n = +(m[1] || m[2]);
        if (n && !out.includes(n)) out.push(n);
    }
    return out;
}

/** How a step sits against this lesson's step. */
export function relationOf(sid, lessonStep) {
    const a = STEP_PART.exec(sid || ''), b = STEP_PART.exec(lessonStep || '');
    if (!a) return 'other';
    if (!b) return 'grade';
    if (a[1] === b[1]) { const d = +a[4] - +b[4]; return d === -1 ? 'before' : d < 0 ? 'earlier' : d === 1 ? 'next' : d > 0 ? 'later' : 'same'; }
    const ya = YEAR_ORDER.indexOf(a[2]), yb = YEAR_ORDER.indexOf(b[2]);
    if (ya !== yb) return ya < yb ? 'earlierGrade' : 'laterGrade';
    return +a[3] < +b[3] ? 'earlierBlock' : 'laterBlock';
}
const quoteJoin = (titles) => {
    const q = [...new Set(titles)].slice(0, 3).map((t) => `"${t}"`);
    return q.length < 2 ? q.join('') : `${q.slice(0, -1).join(', ')} and ${q[q.length - 1]}`;
};
const REL_LEAD = {
    before: () => 'The step before', earlier: () => 'Earlier in the same White Rose block', next: () => 'The next step',
    later: () => 'Later in the same White Rose block', same: () => 'This lesson\'s own White Rose step',
    earlierGrade: (g) => `Taught before, in ${g}`, laterGrade: (g) => `Taught later, in ${g}`, earlierBlock: (g) => `Taught earlier in ${g}`,
    laterBlock: (g) => `Taught later in ${g}`, grade: (g) => g,
};
const REL_ORDER = ['before', 'earlier', 'earlierBlock', 'earlierGrade', 'next', 'later', 'laterBlock', 'laterGrade', 'grade', 'same'];
/** "Taught before, in Grade 2: "Hundreds, tens and ones" (support block, week 11)." for a list of steps. */
export function stepsSentence(steps, lessonStep, { weeks = [], support = false } = {}) {
    const groups = new Map();
    for (const sid of steps) {
        const rel = relationOf(sid, lessonStep);
        if (rel === 'other') continue;
        const g = gradeOfYear(sid.split('.')[0]);
        const k = `${rel}|${g}`;
        if (!groups.has(k)) groups.set(k, { rel, g, titles: [] });
        groups.get(k).titles.push(stepTitle(sid));
    }
    // the same titles in two grades ("Represent numbers to 1,000" in Grade 3 and Grade 2) are said once
    const merged = [];
    for (const x of [...groups.values()].sort((a, b) => REL_ORDER.indexOf(a.rel) - REL_ORDER.indexOf(b.rel))) {
        const twin = merged.find((m) => m.rel === x.rel && quoteJoin(m.titles) === quoteJoin(x.titles));
        if (twin) twin.g = `${twin.g} and ${x.g}`; else merged.push({ ...x });
    }
    const parts = merged.slice(0, 2).map((x) => `${REL_LEAD[x.rel](x.g)}: ${quoteJoin(x.titles)}`);
    if (!parts.length) return '';
    const wk = weeks.length ? ` (${support ? 'support block, ' : ''}week${weeks.length > 1 ? 's' : ''} ${weeks.slice(0, 3).join(', ')})` : '';
    return `${parts.join('. ')}${wk}.`;
}
const uniqBy = (a) => [...new Set(a)];
/** A skill's own reason to sit beside a lesson when the note names no step: its White Rose steps, else its standards. */
function skillReason(key, lesson, group) {
    const [c, s] = String(key || '').split(':');
    const mine = lesson.step || '';
    const steps = c && s ? wrmFor(c, s).map((x) => x.id).filter((id) => id !== mine && relationOf(id, mine) !== 'other') : [];
    const want = group === 'prereq' ? ['before', 'earlier', 'earlierBlock', 'earlierGrade'] : REL_ORDER;
    const pick = steps.filter((id) => want.includes(relationOf(id, mine)));
    // nearest first: the same block, then the nearest grade
    pick.sort((a, b) => REL_ORDER.indexOf(relationOf(a, mine)) - REL_ORDER.indexOf(relationOf(b, mine))
        || Math.abs(YEAR_ORDER.indexOf(a.split('.')[0]) - YEAR_ORDER.indexOf(mine.split('.')[0])) - Math.abs(YEAR_ORDER.indexOf(b.split('.')[0]) - YEAR_ORDER.indexOf(mine.split('.')[0])));
    if (pick.length) return stepsSentence(pick.slice(0, 2), mine);
    const codes = (SKILL_STANDARDS[key] || {}).ccss || [];
    const shared = codes.filter((x) => (lesson.ccss || []).includes(x));
    if (shared.length) return `Same standard as this lesson: ${uniqBy(shared).slice(0, 2).join(', ')}.`;
    if (codes.length) return `${group === 'prereq' ? 'Earlier standard' : 'Linked standard'}: ${codes.slice(0, 2).join(', ')}.`;
    return group === 'prereq' ? 'Earlier learning this lesson builds on.' : 'The same idea in another form.';
}

/**
 * The line beside a linked skill: the note when it is plain English as written, else a sentence composed from
 * the steps and weeks it names, else the skill's own steps or standards. Never a part of the note.
 */
export function composeWhy(note, { key = '', lesson = {}, group = 'prereq' } = {}) {
    const whole = plainNote(note);
    if (whole) return whole;
    const steps = stepsInNote(note);
    if (steps.length) {
        const s = stepsSentence(steps, lesson.step || '', { weeks: weeksInNote(note), support: /prior learning/i.test(note) });
        if (s) return s;
    }
    if (/added by the school/i.test(String(note || ''))) return 'Added by the school.';
    return skillReason(key, lesson, group);
}

/** An entry still to build, by name, as a teacher reads it (the name when it is plain, else without its bracket). */
export function proposalLabel(id) {
    const n = String(proposalName(id) || '').replace(/\s*\(option\)\s*$/i, ' (new option on an existing skill)');
    if (isPlain(n)) return n;
    const bare = n.replace(/\s*\([^()]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
    return isPlain(bare) ? bare : 'A new skill (see Skills to be made)';
}
const namesOf = (ids) => quoteJoin((ids || []).map(proposalLabel));

/** "Covers part" beside one skill: the note when plain, else what will close the rest. */
export function composePartial(note, build = []) {
    const whole = plainNote(note);
    if (whole) return `Not yet: ${/^[A-Z][a-z]/.test(whole) ? whole.charAt(0).toLowerCase() + whole.slice(1) : whole}`;
    return build.length ? `The rest of the lesson comes with ${namesOf(build)}, still to be built.` : 'The rest of the lesson has no skill yet.';
}
/** What follows "Not yet:" for a lesson only partly taught: the note when plain, else what the entries to build will add. */
export function composeMissing(note, build = [], envision = []) {
    const low = (t) => (/^[A-Z][a-z]/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
    const whole = plainNote(note);
    if (whole) return low(whole);
    for (const e of envision || []) { const t = plainNote(e && e.teaches); if (t) return low(t); }
    return build.length ? `the part ${namesOf(build)} will add.` : '';
}

/**
 * Lessons whose title, CCSS code, unit name or WEEK ("week 5", "w05") match the text, best first (cap `limit`).
 * A CCSS code ranks the code's own grade first (3.NF.A.1 → Grade 3 before the Grade 1 copies); a week search
 * ranks `grade` (the grade on screen) first.
 */
export function searchLessons(text, limit = 12, grade = '') {
    unpack();
    const q = String(text || '').toLowerCase().replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!q) return [];
    const words = q.split(' ');
    const wk = /^(?:week|wk|w)\s*0?(\d{1,2})$/.exec(q);
    const codeGrade = (/^([k\d])\.[a-z]+/.exec(q) || [])[1];
    const gradeOfCode = codeGrade === 'k' ? 'K' : codeGrade || '';
    const scored = [];
    for (const l of LESSONS) {
        const title = l.title.toLowerCase();
        const codes = l.ccss.join(' ').toLowerCase();
        const unit = `${l.unitName} ${domainName(l.domain)}`.toLowerCase();
        let s = 0;
        if (wk) { if (l.weeks.some((w) => +w.replace(/\D/g, '') === +wk[1])) s = 70 + (l.grade === grade ? 20 : 0); }
        else if (title === q) s = 100;
        else if (title.startsWith(q)) s = 80;
        else if (title.includes(q)) s = 60;
        else if (codes.split(' ').some((c) => c === q || c.startsWith(q))) s = 50 + (l.grade === gradeOfCode ? 5 : 0);
        else if (words.every((w) => title.includes(w) || codes.includes(w) || unit.includes(w))) s = 30;
        if (s) scored.push({ l, s });
    }
    scored.sort((a, b) => b.s - a.s);
    return scored.slice(0, limit).map((x) => x.l);
}

/**
 * The school week a date falls in for a grade ("6–10 Sep" → 2026-09-06…10; Sep–Dec 2026, Jan–Aug 2027), or
 * the next week to come (a weekend or a holiday) — '' when the year is over.
 */
export function weekForDate(gradeId, date = new Date()) {
    const g = WRM_SEQUENCE.find((x) => x.id === gradeId);
    if (!g || !g.weekInfo) return '';
    const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
    // the school year runs Aug–Jul: derive it from the date itself (N12), so the table keeps working every year
    const sy = date.getMonth() >= 7 ? date.getFullYear() : date.getFullYear() - 1;
    const day = (d, m) => new Date(m >= 7 ? sy : sy + 1, m, d);
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    let next = '';
    for (const [w, info] of Object.entries(g.weekInfo)) {
        const m = /(\d+)\s*(?:([A-Za-z]{3})[a-z]*)?\s*[–-]\s*(\d+)\s*([A-Za-z]{3})/.exec(info.weekOf || '');
        if (!m) continue;
        const endM = MON[m[4].toLowerCase()];
        const startM = m[2] ? MON[m[2].toLowerCase()] : endM;
        const start = day(+m[1], startM), end = day(+m[3], endM);
        if (today >= start && today <= end) return w;
        if (!next && start > today) next = w;
    }
    return next;
}


/* =================================================================== MAP strands and representation pairs */
// The seven MAP practice strands (MASTER_PLAN 6.3) and which skill categories practise each. A MAP.json
// row names its own strand; this table is for skills and the fallback when MAP.json is absent.
export const MAP_STRANDS = [
    ['npv', 'Number & place value', ['counting', 'comparing', 'composing', 'placevalue', 'number_sense', 'integers', 'counting_mixed']],
    ['opa', 'Operations & algebra', ['addition', 'subtraction', 'number_ops_mixed', 'patterns', 'algebra', 'order_of_operations']],
    ['md', 'Multiplication & division', ['multiplication', 'division', 'number_theory']],
    ['fd', 'Fractions & decimals', ['fractions', 'fraction_operations', 'decimals', 'conversions']],
    ['meas', 'Measurement', ['measurement', 'area_perimeter']],
    ['geo', 'Geometry', ['shapes_early', 'shapes_classify', 'angles_lines', 'coordinates']],
    ['data', 'Data & graphing', ['graphs', 'data_analysis', 'probability']],
];
export function strandOfKey(key) {
    const cat = String(key || '').split(':')[0];
    const s = MAP_STRANDS.find((x) => x[2].includes(cat));
    return s ? s[1] : '';
}

/**
 * The eight "match the two" representation changes MAP asks for (MASTER_PLAN 6.4), per strand: the live
 * skills that practise the change and the build-list entries that would close what is missing. A small
 * hand map (checked against the MAP audit's 6.4 rows, 2026-10-10); a strand a change does not belong to
 * is simply absent. `match` finds the change in a proposal's text, for the "Skills to be made" filter.
 * Correct it here: the MAP page and the filter both read it.
 */
export const REP_PAIRS = [
    { id: 'picture-equation', label: 'Picture ↔ equation', match: /(picture|drawing|pictured).{0,60}(equation|number sentence)|(equation|number sentence).{0,60}(picture|drawing)/i, strands: {
        'Operations & algebra': { skills: ['addition:add_5_pictures', 'subtraction:sub_5_pictures'], build: [['pictures_to_sentence', 'Pictures to number sentences']] },
        'Multiplication & division': { skills: ['multiplication:arrays_groups', 'multiplication:dot_array_mult'], build: [['map_array_to_eq', 'Match an array or groups to its equation']] },
        'Fractions & decimals': { skills: ['fraction_operations:decompose_fractions', 'fraction_operations:add_fractions_like'], build: [['map_frac_unit_build', 'Fraction model to unit-fraction sum']] },
        'Measurement': { skills: ['area_perimeter:area_distributive_visual'], build: [['map_area_equation', 'Area picture to its equation']] },
    } },
    { id: 'model-number', label: 'Model ↔ number', match: /(base[- ]?ten|base-10|place[- ]value dis[ck]|fraction (bar|circle|model|strip)|hundred square|decimal grid|unit cubes|ten[- ]frame|counters)/i, strands: {
        'Number & place value': { skills: ['placevalue:place_value_disks', 'composing:base10_build', 'composing:tens_foundation_visual'], build: [['map_match_model_number', 'Match a base-ten model to its number']] },
        'Fractions & decimals': { skills: ['fractions:identify', 'fractions:shade_fraction', 'conversions:percent_visual'], build: [['map_frac_model_match', 'Match a fraction model to its fraction'], ['map_decimal_grid', 'Decimal grids to decimals']] },
        'Measurement': { skills: ['area_perimeter:volume'], build: [['volume_cubes', 'Volume by counting cubes']] },
    } },
    { id: 'graph-sentence', label: 'Graph ↔ sentence', match: /(graph|pictograph|bar chart|line plot|tally|chart).{0,80}(sentence|statement|true|claim)/i, strands: {
        'Data & graphing': { skills: ['graphs:bar_graph', 'graphs:pictograph', 'graphs:line_plot'], build: [['map_graph_sentence', 'Which sentence matches the graph?']] },
    } },
    { id: 'story-operation', label: 'Story ↔ operation', match: /(story|word problem|context).{0,80}(equation|operation|expression|number sentence)|(equation|expression|number sentence).{0,80}(story|word problem)/i, strands: {
        'Operations & algebra': { skills: ['algebra:build_expr_addsub', 'algebra:write_equation', 'addition:add_word_problems', 'subtraction:sub_word_problems'], build: [['map_story_equation_addsub', 'Choose the equation for a story (+ −)']] },
        'Multiplication & division': { skills: ['algebra:build_expr_multdiv', 'multiplication:mult_word_problems', 'division:div_word_problems'], build: [['map_story_equation_multdiv', 'Choose the equation for a story (× ÷)']] },
        'Fractions & decimals': { skills: ['fraction_operations:frac_word_problems', 'fraction_operations:frac_mult_word'], build: [['map_story_equation_frac', 'Choose the equation for a fraction story']] },
        'Measurement': { skills: ['measurement:money_change', 'area_perimeter:perimeter'], build: [] },
    } },
    { id: 'shape-property', label: 'Shape ↔ property', match: /(shape|polygon|quadrilateral|triangle|solid|3-?d|2-?d).{0,80}(propert|attribute|sides|vertices|faces|edges|classify|sort)/i, strands: {
        'Geometry': { skills: ['shapes_early:shape_attributes', 'shapes_early:compose_from_attributes', 'shapes_classify:classify_quads'], build: [] },
    } },
    { id: 'numberline-number', label: 'Number line ↔ number', match: /number line|ruler|thermometer|scale/i, strands: {
        'Number & place value': { skills: ['number_sense:place_on_number_line', 'integers:integer_nl_drag'], build: [['nl_20', 'Numbers on a number line (any scale)']] },
        'Operations & algebra': { skills: ['addition:number_line_add', 'subtraction:number_line_sub'], build: [['map_nl_jumps_equation_addsub', 'Number-line jumps to the equation (+ −)']] },
        'Multiplication & division': { skills: ['multiplication:nl_mult', 'division:nl_div'], build: [['map_nl_hops_equation', 'Number-line hops to the equation (× ÷)']] },
        'Fractions & decimals': { skills: ['composing:fraction_number_line', 'fractions:fraction_nl_drag', 'decimals:decimal_nl_drag'], build: [['map_nl_read_decimal', 'Read a decimal on a number line']] },
        'Measurement': { skills: ['measurement:reading_ruler', 'measurement:reading_ruler_hard', 'measurement:temperature'], build: [] },
    } },
    { id: 'clock-words', label: 'Clock ↔ time words', match: /(clock|o'clock|half past|quarter (past|to))/i, strands: {
        'Measurement': { skills: ['measurement:time_hour', 'measurement:time_5min', 'measurement:time_match_clock', 'measurement:time_analog_digital'], build: [] },
    } },
    { id: 'array-mult', label: 'Array ↔ multiplication', match: /\barrays?\b/i, strands: {
        'Multiplication & division': { skills: ['multiplication:arrays_groups', 'multiplication:dot_array_mult'], build: [['map_array_to_eq', 'Match an array or groups to its equation']] },
    } },
];

/** The pair ids whose `match` finds the text (a proposal's name + teaches + representation + task). */
export function repPairsOfText(text) {
    const t = String(text || '');
    return REP_PAIRS.filter((p) => p.match.test(t)).map((p) => p.id);
}
