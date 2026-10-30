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
import { STANDARD_PROPOSALS, WRM_EXTENSIONS, canonicalEntry } from './build-list.js';
import { plainNote, isPlain } from './plain-words.js';
import { SITE_LESSONS, SITE_ASSESSMENTS, STEP_SITE } from './site-lessons-db.js';
import { LEGACY_HASHES, LEGACY_DATE, SLUG_ALIASES } from './wrm-legacy-hashes-db.js';

// ---- curated links (data/curriculum/links/<YEAR>.json, written by the tagging lane) ------------
// When a step has a curated record it wins over the computed rules: direct (with opts and partial),
// verdict, missing, build / preBuild proposal ids, pre and related. The page fetches the year files
// and hands them in with addCuratedYear(); a missing year or step falls back to the rules below.
// Which files exist is data/curriculum/links/index.json (links-data.js reads it, so a missing file never
// costs a failed request). Add a year there in the same change that adds its file; ws-wrm-page-unit
// checks both agree.
const CURATED = new Map();       // step id -> record
// A year file's top-level `lessons` section (round 7): the school site's own lessons, keyed by their site id
// ("G4|-|lineplotswithfractions", data/curriculum/site-lessons.json), with the same record shape as a step.
const CURATED_LESSONS = new Map();
const CURATED_PROPOSALS = {};    // proposal id -> { name, ... }
export function addCuratedYear(data) {
    if (!data || typeof data !== 'object' || !data.steps) return 0;
    let n = 0;
    for (const [id, rec] of Object.entries(data.steps)) { if (rec && typeof rec === 'object') { CURATED.set(id, rec); n += 1; } }
    for (const [id, rec] of Object.entries(data.lessons || {})) { if (rec && typeof rec === 'object') { CURATED_LESSONS.set(id, rec); n += 1; } }
    Object.assign(CURATED_PROPOSALS, data.proposals || {});
    return n;
}
export function clearCurated() { CURATED.clear(); CURATED_LESSONS.clear(); for (const k of Object.keys(CURATED_PROPOSALS)) delete CURATED_PROPOSALS[k]; }
export function curatedFor(stepId) { return CURATED.get(stepId) || null; }
/** The curated record of a school-site lesson (its site id), or null. */
export function curatedLessonFor(siteId) { return CURATED_LESSONS.get(siteId) || null; }

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
let BY_SITE = null;      // site id -> lesson (a sequence row the site names, or a lesson only the site has)
let UNIT_ORDER = null;   // 'grade:unit' -> [lesson] in school-week order (the unit's list on screen)
let BY_SLUG = null;      // 'grade|unit|slug' and 'grade|slug' -> lesson (the stable bookmark, critic 2026-10-30 W1)
/** The slug part of a site id ("G4|-|lineplotswithfractions" -> "lineplotswithfractions"). */
export const siteSlug = (id) => String(id || '').split('|-|')[1] || '';
const titleSlug = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const weekNo = (w) => +String(w || '').replace(/\D/g, '') || 0;
/** The site's grade prefix for a screen grade id: '4' -> 'G4', 'K' -> 'K'. */
const siteGrade = (g) => (/^\d$/.test(String(g)) ? `G${g}` : String(g || ''));

/**
 * The domain a site lesson is placed by (critic r6 M10): its OWN CCSS codes, the code of its grade first, else its
 * first code; the site's `domain` field only when the lesson has no code. One exception, kept on purpose: a code
 * from another grade in the counting / base-ten pair (a Kindergarten "Represent numbers to 5" tagged 2.NBT.A.1)
 * keeps the site's domain, because Kindergarten counts where Grade 2 writes place value.
 */
export function placeDomain(gradeId, ccss, siteDomain) {
    const pre = String(gradeId) === 'PK' ? 'PK' : String(gradeId);
    const dom = (c) => (/^(?:K|\d)\.([A-Z]+)\./.exec(String(c || '')) || [])[1] || '';
    const own = (ccss || []).find((c) => String(c).split('.')[0] === pre && dom(c));
    if (own) return dom(own);
    const first = (ccss || []).find(dom);
    if (!first) return siteDomain || '';
    const d = dom(first);
    if (siteDomain && d !== siteDomain && ({ CC: 'NBT', NBT: 'CC' })[d] === siteDomain) return siteDomain;
    return d;
}
/**
 * The unit a site lesson sits in: the grade's unit of its domain (placeDomain; the one whose weeks hold its first
 * week when two share the domain), else the unit taught that week, else Enrichment. Never moves a sequence row.
 */
function placeUnit(g, domain, week) {
    const units = g.units.filter((u) => u.id !== 'E');
    const inWeeks = (u) => { const ws = (String(u.weeks || '').match(/W\d+/g) || []).map(weekNo); return ws.length && week && weekNo(week) >= ws[0] && weekNo(week) <= ws[ws.length - 1]; };
    const byDom = domain ? units.filter((u) => u.domain === domain) : [];
    if (byDom.length) return byDom.find(inWeeks) || byDom[0];
    const alt = { CC: 'NBT', NBT: 'CC' }[domain];
    return (alt && units.find((u) => u.domain === alt)) || units.find(inWeeks) || g.units.find((u) => u.id === 'E') || g.units[0];
}
/** Put a lesson after the last lesson of the unit taught in its week or before (a lesson with no week goes last). */
function insertByWeek(list, l) {
    const w = weekNo(l.weeks[0]);
    if (!w) { list.push(l); return; }
    let at = 0;
    list.forEach((x, i) => { const xw = weekNo((x.weeks || [])[0]); if (xw && xw <= w) at = i + 1; else if (!xw && x.seq && at === i) at = i + 1; });
    list.splice(at, 0, l);
}

function unpack() {
    if (LESSONS) return;
    LESSONS = [];
    BY_KEY = new Map();
    BY_SITE = new Map();
    UNIT_ORDER = new Map();
    for (const g of WRM_SEQUENCE) {
        for (const u of g.units) {
            const list = [];
            u.lessons.forEach((t, i) => {
                const [rawTitle, step, ccss, power, type, weeks, strands, from, note, flag] = t;
                const title = tidyTitle(rawTitle);   // "(How many left )", "10^1" -> "10¹"
                const l = {
                    key: `${g.id}:${u.id}:${i + 1}`, grade: g.id, gradeLabel: g.label, unit: u.id, domain: u.domain,
                    unitName: u.name, n: i + 1, title, step, ccss, power: !!power, type, weeks, strands, from, note: note || '',
                    seq: true, year: g.year, site: '', siteInfo: null, flag: flag || '', rawTitle: String(rawTitle),
                };
                LESSONS.push(l);
                BY_KEY.set(l.key, l);
                list.push(l);
            });
            UNIT_ORDER.set(`${g.id}:${u.id}`, list);
        }
    }
    // The school site's own lessons (round 7, owner: "every lesson on the school site must be visible with its
    // skills"). A site lesson whose title is a row of the grade's sequence IS that row (the row keeps its place and
    // number and gains the site id); any other joins its unit in school-week order, the dated ones first.
    const fresh = [];
    for (const t of SITE_LESSONS) {
        const [id, grade, title, flag, supplement, ccss, ee, power, domain, block, week, weeks, strands, domainTest] = t;
        const g = WRM_SEQUENCE.find((x) => x.id === grade);
        if (!g) continue;
        const info = { id, flag, supplement: !!supplement, ee, block, week, weeks, domainTest: !!domainTest, kind: 'lesson' };
        const twin = LESSONS.find((l) => l.seq && l.grade === grade && !l.site && titleSlug(l.rawTitle || l.title) === siteSlug(id));
        if (twin) { twin.site = id; twin.siteInfo = info; BY_SITE.set(id, twin); continue; }
        const u = placeUnit(g, placeDomain(grade, ccss, domain), week);
        fresh.push({ key: id, grade, gradeLabel: g.label, unit: u.id, domain: u.domain, unitName: u.name, n: 0, title: tidyTitle(title), step: null,
            ccss, power: !!power, type: 'site', weeks: weeks.length ? weeks : week ? [week] : [], strands, from: '', note: '', seq: false, year: g.year,
            site: id, siteInfo: info });
    }
    for (const t of SITE_ASSESSMENTS) {
        const [id, grade, title, kind, domain, weeks] = t;
        const g = WRM_SEQUENCE.find((x) => x.id === grade);
        if (!g) continue;
        const u = placeUnit(g, domain, weeks[0]);
        fresh.push({ key: id, grade, gradeLabel: g.label, unit: u.id, domain: u.domain, unitName: u.name, n: 0, title: tidyTitle(title), step: null,
            ccss: [], power: false, type: 'assessment', weeks, strands: '', from: '', note: '', seq: false, year: g.year, site: id,
            siteInfo: { id, flag: kind === 'map' ? 'map' : 'exam', supplement: false, ee: [], block: null, week: weeks[0] || null, weeks, domainTest: false, kind: 'assessment' } });
    }
    // dated lessons by week (lessons before the assessment of the same week), then the undated ones by title
    const dated = fresh.filter((l) => l.weeks.length).sort((a, b) => weekNo(a.weeks[0]) - weekNo(b.weeks[0]) || (a.type === 'assessment') - (b.type === 'assessment'));
    const undated = fresh.filter((l) => !l.weeks.length).sort((a, b) => a.title.localeCompare(b.title));
    for (const l of [...dated, ...undated]) {
        LESSONS.push(l);
        BY_KEY.set(l.key, l);
        BY_SITE.set(l.site, l);
        insertByWeek(UNIT_ORDER.get(`${l.grade}:${l.unit}`), l);
    }
    // W1 (critic 2026-10-30): every lesson's bookmark is a SLUG of its title (the site's own id for a site lesson),
    // never its list number, so a reordering cannot move a link. Two lessons of one unit with the same title (a
    // repeat in the support block) are told apart by "-2", "-3" in list order.
    BY_SLUG = new Map();
    // the site's lessons first: their slug is the site id's, never suffixed
    for (const l of [...LESSONS.filter((x) => x.site), ...LESSONS.filter((x) => !x.site)]) {
        const base = l.site ? siteSlug(l.site) : titleSlug(l.rawTitle || l.title) || 'lesson';
        const safe = /^\d+$/.test(base) ? `l${base}` : base;
        let slug = safe;
        for (let k = 2; BY_SLUG.has(`${l.grade}|${l.unit}|${slug}`); k += 1) slug = `${safe}-${k}`;
        l.slug = slug;
        BY_SLUG.set(`${l.grade}|${l.unit}|${slug}`, l);
        if (!BY_SLUG.has(`${l.grade}|${slug}`)) BY_SLUG.set(`${l.grade}|${slug}`, l);
    }
}

/** A unit's lessons as the screen lists them: the sequence's rows with the site's own lessons in week order. */
export function unitLessons(gradeId, unitId) { unpack(); return (UNIT_ORDER.get(`${gradeId}:${unitId}`) || []).slice(); }
/** The lesson a site id names (a sequence row the site also lists, or a lesson only the site has), or null. */
export function lessonBySite(id) { unpack(); return BY_SITE.get(String(id || '')) || null; }
/** The lesson of a grade whose site id ends in this slug (the bookmark form), or null. */
export function lessonBySiteSlug(gradeId, slug) { unpack(); return BY_SITE.get(`${siteGrade(gradeId)}|-|${String(slug || '')}`) || null; }
/**
 * The bookmark of a lesson: #wrm/<grade>/<unit>/<slug>. The slug is the site id's slug for a lesson the school site
 * names, else the slug of its title (W1, critic 2026-10-30: stable while the title stays, whatever its number).
 */
export function lessonHash(l) {
    if (!l) return '#wrm';
    unpack();
    return `#wrm/${encodeURIComponent(l.grade)}/${encodeURIComponent(l.unit)}/${encodeURIComponent(l.slug)}`;
}
/** The lesson a slug names in a grade: in the unit first, then a site lesson, then anywhere in the grade, then an alias. */
export function lessonBySlug(gradeId, unit, slug) {
    unpack();
    const g = String(gradeId || ''), s = String(slug || '');
    const hit = BY_SLUG.get(`${g}|${unit}|${s}`) || lessonBySiteSlug(g, s) || BY_SLUG.get(`${g}|${s}`);
    if (hit) return hit;
    const alias = SLUG_ALIASES[`${g}/${s}`];
    return alias ? resolveLessonHash(`#wrm/${alias}`).lesson : null;
}
/** The date the lesson list was renumbered (numbered links made before it are redirected). */
export const RENUMBERED = LEGACY_DATE;
/**
 * What a #wrm hash opens: { grade, seg, lesson, legacy }. `seg` is the second segment (a section or unit id).
 * A numbered lesson link (#wrm/3/D1/16, the form used until 2026-10-30) opens the lesson it was MADE for: the frozen
 * table of the numbering before the school-site reorder (data/curriculum/wrm-legacy-hashes.json) names it, and
 * `legacy` says so: { title (what it opens, or the old title), gone (no longer listed), alt (the lesson that number
 * holds today: what a link made after the reorder meant) }. A number the table does not list meant the same lesson
 * then and now, and opens it with no notice.
 */
export function resolveLessonHash(hash) {
    unpack();
    const m = /^#wrm(?:\/([^/]*))?(?:\/([^/]*))?(?:\/([^/?#]+))?/.exec(String(hash || ''));
    const out = { grade: '', seg: '', lesson: null, legacy: null };
    if (!m) return out;
    const dec = (x) => { try { return decodeURIComponent(x || ''); } catch (e) { return String(x || ''); } };
    out.grade = dec(m[1]);
    out.seg = dec(m[2]);
    const seg3 = dec(m[3]);
    if (!seg3) return out;
    if (/^\d+$/.test(seg3)) {
        const now = BY_KEY.get(`${out.grade}:${out.seg}:${seg3}`) || null;
        const old = LEGACY_HASHES[`${out.grade}/${out.seg}/${seg3}`];
        if (!old) { out.lesson = now; return out; }
        const [title, to] = old;
        const target = to ? resolveLessonHash(`#wrm/${to}`).lesson : null;
        out.lesson = target;
        // a numbered link made after the reorder named the lesson that number holds now (a row the site does not name)
        const alt = now && now !== target && !now.site ? now : null;
        out.legacy = { title: target ? target.title : tidyTitle(title), gone: !target, alt };
        return out;
    }
    out.lesson = lessonBySlug(out.grade, out.seg, seg3);
    return out;
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

/* ---- the page's navigation (owner 2026-10-17: "show the grade, the domain, and then the lessons in list form in
 * order ... the extra lessons/projects/enrichment come up as the last domain section") ----------------------------
 * A CORE lesson is a sequence row the school site lists inside a core domain unit (White Rose, copied in, CCSS BUILD,
 * above grade, non-CCSS). Everything else is an EXTRA lesson: the site's support lessons, its projects and other
 * school lessons (the step flag "other", e.g. Grade 5's end-of-year investigation projects), enrichment lessons and
 * the assessments. */
export function isCoreLesson(l) {
    if (!l || !l.seq || l.unit === 'E' || l.type === 'enrich' || l.type === 'assessment') return false;
    return ((l.siteInfo && l.siteInfo.flag) || l.flag || '') !== 'other';
}
/** The groups of the Extra lessons section, in the order the page shows them. */
export const EXTRA_KINDS = [
    ['support', 'Support lessons'],
    ['other', 'Projects and other school lessons'],
    ['enrich', 'Enrichment lessons'],
    ['assessment', 'Assessments'],
];
/** Which Extra lessons group a non-core lesson belongs to. */
export function extraKind(l) {
    if (l.type === 'assessment') return 'assessment';
    if (l.type === 'enrich' || l.unit === 'E') return 'enrich';
    const f = (l.siteInfo && l.siteInfo.flag) || l.flag || '';
    return f === 'enrich-native' ? 'support' : 'other';
}
/**
 * A grade's list as the page shows it: one section per domain in the site's order (its core lessons in the site's
 * order; Pre-K's small units of a domain are parts of one section), then the "Extra lessons" section holding every
 * non-core lesson of the grade exactly once, grouped by EXTRA_KINDS.
 * [{ key, domain, name, extra, parts: [{ unit, name, lessons }], groups?: [{ kind, label, lessons }], lessons }]
 * `key` is the section's bookmark segment: the first unit id of the domain, or 'extra'.
 */
export function gradeSections(gradeId) {
    unpack();
    const g = WRM_SEQUENCE.find((x) => x.id === String(gradeId));
    if (!g) return [];
    const out = [];
    const byDom = new Map();
    const extra = [];
    for (const u of g.units) {
        const list = UNIT_ORDER.get(`${g.id}:${u.id}`) || [];
        const core = list.filter(isCoreLesson);
        if (core.length) {
            let s = byDom.get(u.domain);
            if (!s) { s = { key: u.id, domain: u.domain, name: domainName(u.domain), extra: false, parts: [] }; byDom.set(u.domain, s); out.push(s); }
            s.parts.push({ unit: u.id, name: u.name, lessons: core });
        }
        for (const l of list) if (!isCoreLesson(l)) extra.push(l);
    }
    for (const s of out) s.lessons = s.parts.flatMap((p) => p.lessons);
    if (extra.length) {
        const groups = EXTRA_KINDS.map(([kind, label]) => ({ kind, label, lessons: extra.filter((l) => extraKind(l) === kind) })).filter((x) => x.lessons.length);
        out.push({ key: 'extra', domain: '', name: 'Extra lessons', extra: true, parts: [], groups, lessons: groups.flatMap((x) => x.lessons) });
    }
    return out;
}

export function allLessons() { unpack(); return LESSONS.slice(); }
export function lessonByKey(key) { unpack(); return BY_KEY.get(String(key || '')) || null; }
export function weekInfo(gradeId, week) {
    const g = WRM_SEQUENCE.find((x) => x.id === gradeId);
    return (g && g.weekInfo && g.weekInfo[week]) || {};
}

/** The White Rose sequence rows of the lesson's unit (the computed rules read only these). */
function siblings(lesson) {
    unpack();
    return LESSONS.filter((l) => l.seq && l.grade === lesson.grade && l.unit === lesson.unit);
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
    const cur = (lesson.step ? CURATED.get(lesson.step) : null) || (lesson.site ? CURATED_LESSONS.get(lesson.site) : null);
    if (cur) return curatedLinks(lesson, cur, ovr, live);
    // an assessment lists no skills (the site links none)
    if (lesson.type === 'assessment') return { lesson, step: null, direct: [], prereq: [], related: [], verdict: 'gap', missing: '', build: [], preBuild: [], source: 'assessment' };
    const direct = applyOverride(directOf(lesson.step, live), ovr.direct, 'Added by the school', 0)
        .map((x) => ({ key: x.key, partial: x.partial ? composePartial(x.partial) : '', part: !!x.partial }));
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
            // N35 (critic r7): the same composed sentence as the curated path ('Taught before, in Pre-K: "…".')
            push(pre, d.key, stepsSentence([r.sid], lesson.step || '', { lesson, group: 'prereq', support: true, weeks: [weekNo(lesson.weeks[0])].filter(Boolean) })
                || `Taught before, in ${gradeOfYear(r.sid.split('.')[0])}: "${r.rec ? tidyTitle(r.rec.title) : r.sid}".`);
        }
    }
    const sib = siblings(lesson);
    const at = sib.findIndex((l) => l.key === lesson.key);
    for (let k = at - 1; at > 0 && k >= Math.max(0, at - 3); k -= 1) {
        for (const d of directOf(sib[k].step, live)) push(pre, d.key, `Earlier in this unit: "${sib[k].title}".`);
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
        for (const x of lower) push(pre, x.key, `Earlier grade, same standard group (${x.code}).`);
    }
    const prereq = applyOverride(pre, ovr.prereq, 'Added by the school', PREREQ_CAP);
    prereq.forEach((x) => taken.add(x.key));

    // RELATED
    const rel = [];
    for (const code of lesson.ccss) {
        for (const key of skillsForStandard(code)) push(rel, key, `Same standard (${code}).`);
    }
    for (let k = at + 1; at >= 0 && k <= Math.min(sib.length - 1, at + 3); k += 1) {
        for (const d of directOf(sib[k].step, live)) push(rel, d.key, `Next in this unit: "${sib[k].title}".`);
    }
    const related = applyOverride(rel, ovr.related, 'Added by the school', RELATED_CAP);
    const verdict = !direct.length ? 'gap' : direct.some((x) => !x.part) ? 'full' : 'partial';
    return onceEach({ lesson, step: lesson.step ? wrmStep(lesson.step) : null, direct, prereq, related, verdict,
        missing: verdict === 'partial' ? (directOf(lesson.step, live).map((x) => composeMissing(x.partial)).find(Boolean) || '') : '',
        build: [], preBuild: [], source: 'rules' });
}

function curatedLinks(lesson, cur, ovr, live) {
    const seen = new Set();
    const keep = (x) => x && x.key && live(x.key) && !seen.has(x.key) && seen.add(x.key);
    const build = [...new Set((cur.build || []).map(canonicalEntry))];   // W3: merged ids read once
    const direct = applyOverride([
        ...(cur.direct || []).map((x) => ({ key: x.key, opts: x.opts || null, partial: '', part: false })),
        ...(cur.partial || []).map((x) => ({ key: x.key, opts: x.opts || null, partial: composePartial(x.missing, build), part: true })),
    ], ovr.direct, 'Added by the school', 0).filter(keep).map((x) => ({ key: x.key, opts: x.opts || null, partial: x.partial || '', part: !!x.part }));
    // opts travel with every link (a curated pre / related skill is often "within 100" etc.)
    const withOpts = (group) => (x) => ({ key: x.key, why: composeWhy(x.why || '', { key: x.key, lesson, group }), opts: x.opts && Object.keys(x.opts).length ? x.opts : null });
    const prereq = applyOverride((cur.pre || []).map(withOpts('prereq')), ovr.prereq, 'Added by the school', 0).filter(keep);
    const related = applyOverride((cur.related || []).map(withOpts('related')), ovr.related, 'Added by the school', 0).filter(keep);
    const verdict = ['full', 'partial', 'gap'].includes(cur.verdict) ? cur.verdict
        : !direct.length ? 'gap' : direct.some((x) => !x.part) ? 'full' : 'partial';
    return onceEach({ lesson, step: lesson.step ? wrmStep(lesson.step) : null, direct, prereq, related, verdict, missing: composeMissing(cur.missing, build, cur.envision),
        build, preBuild: [...new Set((cur.preBuild || []).map(canonicalEntry))], note: cur.note || '', source: 'curated' });
}

/**
 * Critic r6 M9: a lesson says each sentence ONCE. A row whose line repeats the verdict's "Not yet" or an earlier
 * row's line keeps no line of its own: a partial row shows only its "Covers part" tag, and a Do-first / Go-with row
 * joins the first row with that line (moved up beside it, in the group's order) and is marked `same` ("Same reason
 * as above").
 */
const lineKey = (t) => String(t || '').toLowerCase().replace(/^not yet:\s*/, '').replace(/[.\s]+$/, '').trim();
/** The support-block clause a composed line may end with (said once per lesson). */
export const SUP_CLAUSE = / Revisited in this grade's support block, weeks? [\d, and]+\.$/;
/** m15 (critic r7): two lines that differ only by the support clause are the same reason. */
export const baseKey = (t) => lineKey(String(t || '').replace(SUP_CLAUSE, ''));
function onceEach(r) {
    const seen = new Set();
    if (r.missing) seen.add(lineKey(r.missing));
    for (const x of r.direct) { if (!x.partial) continue; const k = lineKey(x.partial); if (seen.has(k)) x.partial = ''; else seen.add(k); }
    // the support week is one fact about the lesson: said on the first row that names it, not on every row
    const supSaid = new Set();
    for (const g of ['prereq', 'related']) for (const x of r[g]) {
        const m = SUP_CLAUSE.exec(x.why || '');
        if (!m) continue;
        if (supSaid.has(m[0])) x.why = x.why.slice(0, m.index); else supSaid.add(m[0]);
    }
    for (const g of ['prereq', 'related']) {
        const firstAt = new Map();
        r[g].forEach((x, i) => { const k = baseKey(x.why); if (k && !firstAt.has(k)) firstAt.set(k, i); });
        const order = r[g].map((x, i) => ({ x, i, at: x.why ? firstAt.get(baseKey(x.why)) : i }));
        order.sort((a, b) => a.at - b.at || a.i - b.i);
        const firstRow = new Map();
        r[g] = order.map(({ x }) => {
            const k = baseKey(x.why);
            if (k && seen.has(k)) {
                // a repeat that carried the support clause hands it to the first row with that reason
                const m = SUP_CLAUSE.exec(x.why || '');
                const f = firstRow.get(k);
                if (m && f && !SUP_CLAUSE.test(f.why)) f.why = `${f.why}${m[0]}`;
                return { ...x, why: '', same: true };
            }
            if (k) { seen.add(k); firstRow.set(k, x); }
            return x;
        });
    }
    return r;
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
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
/** A title as written, with stray spaces inside brackets closed up and powers written raised ("10^3" -> "10³"). */
export const tidyTitle = (t) => String(t || '').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s{2,}/g, ' ')
    .replace(/(\d)\^(\d+)/g, (m, a, b) => a + [...b].map((d) => SUP[d]).join('')).trim();
/** A White Rose step's title, tidied, or ''. */
export function stepTitle(id) { const r = wrmStep(id); return r ? tidyTitle(r.title) : ''; }
/**
 * A MAP task's name as the screens show it: the MAP list's own name with its arrows drawn ("<->" → "↔"), "Gr 6"
 * as "Grade 6", and any bracket that is not plain English left out.
 */
export function taskName(raw) {
    const t = tidyTitle(raw).replace(/\s*<->\s*/g, ' ↔ ').replace(/\s*->\s*/g, ' → ').replace(/\bGr\.?\s?(\d)\b/g, 'Grade $1')
        .replace(/\bB&W\b/g, 'black-and-white').replace(/\b([Aa])dd\/sub\b/g, '$1dd and subtract').replace(/\(Q1\)/g, '(first quadrant)').replace(/\(upper band\)/g, '(higher RIT scores)')
        .replace(/\bincl\.\s*/g, 'including ');
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

/** How a step sits against this lesson's step (or, for a school-site lesson with no step, against its year). */
export function relationOf(sid, lessonStep, lessonYear = '') {
    const a = STEP_PART.exec(sid || ''), b = STEP_PART.exec(lessonStep || '');
    if (!a) return 'other';
    if (!b) {
        const yb = YEAR_ORDER.indexOf(lessonYear || '');
        if (yb < 0) return 'grade';
        const ya = YEAR_ORDER.indexOf(a[2]);
        return ya < yb ? 'earlierGrade' : ya > yb ? 'laterGrade' : 'sameGrade';
    }
    if (a[1] === b[1]) { const d = +a[4] - +b[4]; return d === -1 ? 'before' : d < 0 ? 'earlier' : d === 1 ? 'next' : d > 0 ? 'later' : 'same'; }
    const ya = YEAR_ORDER.indexOf(a[2]), yb = YEAR_ORDER.indexOf(b[2]);
    if (ya !== yb) return ya < yb ? 'earlierGrade' : 'laterGrade';
    return +a[3] < +b[3] ? 'earlierBlock' : 'laterBlock';
}
const quoteJoin = (titles) => {
    const q = [...new Set(titles)].slice(0, 3).map((t) => `"${t}"`);
    return q.length < 2 ? q.join('') : `${q.slice(0, -1).join(', ')} and ${q[q.length - 1]}`;
};
/**
 * The school weeks a grade teaches a White Rose step (its sequence rows), as numbers, ascending; [] when the
 * grade's sequence does not list it. Critic r6 M8: within a grade, the SCHOOL's order decides "earlier" and
 * "later", never the White Rose step number.
 */
let SCHOOL_WEEKS = null;
export function schoolWeeksOf(gradeId, sid) {
    unpack();
    if (!SCHOOL_WEEKS) {
        SCHOOL_WEEKS = new Map();
        for (const l of LESSONS) {
            if (!l.seq || !l.step) continue;
            const k = `${l.grade}|${l.step}`;
            const ws = SCHOOL_WEEKS.get(k) || [];
            for (const w of l.weeks) { const n = weekNo(w); if (n && !ws.includes(n)) ws.push(n); }
            SCHOOL_WEEKS.set(k, ws.sort((x, y) => x - y));
        }
    }
    return (SCHOOL_WEEKS.get(`${gradeId}|${sid}`) || []).slice();
}
/** The support-block weeks of a grade (the workbook's prior-learning column) that list a step, ascending. */
export function supportWeeksOf(gradeId, sid) {
    const g = WRM_SEQUENCE.find((x) => x.id === String(gradeId));
    if (!g) return [];
    return Object.entries(g.prior || {}).filter(([, ids]) => (ids || []).includes(sid)).map(([w]) => weekNo(w)).filter(Boolean).sort((x, y) => x - y);
}
/**
 * How a step sits against a LESSON as the school teaches it: { rel, weeks }. A step the lesson's grade teaches
 * in its own sequence is placed by the school weeks ('schoolEarlier' | 'schoolSame' | 'schoolLater', with those
 * weeks); any other by relationOf. In the Do-first group a later relation is never said: it becomes 'alsoGrade'
 * ("Also taught in Grade 1"), which states only where else it is taught.
 */
export function relationIn(sid, lesson = {}, group = 'related') {
    const lessonStep = lesson.step || '';
    const year = lessonStep ? '' : lesson.year || '';
    const base = relationOf(sid, lessonStep, year);
    if (base === 'other' || base === 'same') return { rel: base, weeks: [] };
    const lw = weekNo((lesson.weeks || [])[0]);
    const ws = lesson.grade ? schoolWeeksOf(lesson.grade, sid) : [];
    let out = null;
    if (ws.length && lw) {
        const before = ws.filter((w) => w < lw);
        if (before.length) out = { rel: 'schoolEarlier', weeks: before.slice(-2) };
        // the same school week: White Rose's own order holds inside it ("The step before"), but never "later"
        else if (ws.includes(lw)) out = ['before', 'earlier'].includes(base) ? { rel: base, weeks: [] } : { rel: 'schoolSame', weeks: [lw] };
        else out = { rel: 'schoolLater', weeks: ws.filter((w) => w > lw).slice(0, 2) };
    } else if (ws.length && lesson.gradeLabel) out = { rel: 'alsoGrade', weeks: ws.slice(0, 2), g: lesson.gradeLabel };   // a lesson with no week
    else out = { rel: base, weeks: [] };
    out = ownGradeRel(out, sid, lesson, group);
    if (group === 'prereq' && LATER_RELS.includes(out.rel)) out = { rel: 'alsoGrade', weeks: out.rel === 'schoolLater' ? out.weeks : [], g: out.rel === 'laterGrade' ? '' : lesson.gradeLabel || '' };
    return out;
}
/**
 * m16 (critic r7): a grade word is measured against the lesson's OWN grade, never against the year of the step it is
 * mapped to (a Grade 3 lesson on a Grade 5 step). A step of a lower grade is "Taught before, in Grade N"; of a higher
 * grade "Taught later, in Grade N" (a Do-first line: "Also taught in Grade N"); of the lesson's own grade that the
 * school's sequence does not list, "In the White Rose Grade N lessons" (no order word).
 */
function ownGradeRel(out, sid, lesson, group) {
    const own = YEAR_ORDER.indexOf((WRM_SEQUENCE.find((g) => g.id === String(lesson.grade || '')) || {}).year);
    if (own < 0) return out;
    const cross = ['earlierGrade', 'laterGrade', 'earlierBlock', 'laterBlock'].includes(out.rel);
    if (!cross && !(group === 'prereq' && ['next', 'later'].includes(out.rel))) return out;
    const yi = YEAR_ORDER.indexOf(String(sid).split('.')[0]);
    if (yi < own) return { rel: 'earlierGrade', weeks: [] };
    if (yi > own) return group === 'prereq' ? { rel: 'alsoGrade', weeks: [], g: '' } : { rel: 'laterGrade', weeks: [] };
    return out.rel === 'earlierBlock' ? out : { rel: 'wrGrade', weeks: [] };
}
/** The leads a Do-first line may never use (critic r6 M8; ws-wrm-page-unit checks the same pattern). */
export const LATER_LEAD = /(?:^|\. )(?:Later\b|Taught later\b|The next step\b)/;
const LATER_RELS = ['next', 'later', 'laterBlock', 'laterGrade', 'schoolLater'];
const REL_LEAD = {
    before: () => 'The step before', earlier: () => 'Earlier in the same White Rose block', next: () => 'The next step',
    later: () => 'Later in the same White Rose block', same: () => 'This lesson\'s own White Rose step',
    earlierGrade: (g) => `Taught before, in ${g}`, laterGrade: (g) => `Taught later, in ${g}`, earlierBlock: (g) => `Taught earlier in ${g}`,
    laterBlock: (g) => `Taught later in ${g}`, grade: (g) => g, sameGrade: (g) => `In ${g}`,
    schoolEarlier: () => 'Taught earlier this year', schoolSame: () => 'Taught the same week', schoolLater: () => 'Taught later this year',
    alsoGrade: (g) => `Also taught in ${g}`, wrGrade: (g) => `In the White Rose ${g} lessons`,
};
const REL_ORDER = ['schoolEarlier', 'before', 'earlier', 'earlierBlock', 'earlierGrade', 'sameGrade', 'wrGrade', 'schoolSame', 'alsoGrade', 'schoolLater', 'next', 'later', 'laterBlock', 'laterGrade', 'grade', 'same'];
/** The relations a Do-first line may state (none says "later" or "next"). */
export const PREREQ_RELS = ['schoolEarlier', 'before', 'earlier', 'earlierBlock', 'earlierGrade', 'sameGrade', 'wrGrade', 'schoolSame', 'alsoGrade', 'grade'];
const weekClause = (ws) => (ws.length ? ` (${weeksWords(ws)})` : '');
/**
 * 'Taught before, in Grade 2: "Hundreds, tens and ones". Revisited in this grade's support block, week 11.' for a
 * list of steps, against a lesson. Each part carries its own weeks (the school weeks of THIS grade); the support
 * block is its own clause, said only when the lesson's grade lists one of the steps in that week (critic r6 M8).
 */
export function stepsSentence(steps, lessonStep, { weeks = [], support = false, year = '', lesson = null, group = 'related' } = {}) {
    const les = lesson || { step: lessonStep, year };
    const groups = new Map();
    for (const sid of steps) {
        const r = relationIn(sid, les, group);
        if (r.rel === 'other') continue;
        const yr = sid.split('.')[0];
        const g = r.rel === 'alsoGrade' && r.g ? r.g : gradeOfYear(yr);
        const k = `${r.rel}|${g}`;
        if (!groups.has(k)) groups.set(k, { rel: r.rel, g, yi: YEAR_ORDER.indexOf(yr), titles: [], weeks: [] });
        const x = groups.get(k);
        const t = stepTitle(sid);
        x.titles.push(t);
        // N36 (critic r7): only the weeks of the steps the line names (titles stop at three)
        if ([...new Set(x.titles)].indexOf(t) < 3) for (const w of r.weeks) if (!x.weeks.includes(w)) x.weeks.push(w);
    }
    for (const x of groups.values()) x.weeks.sort((a, b) => a - b);
    // the same titles in two grades are said once, the grades in order ("in Grade 2 and Grade 3")
    const merged = [];
    for (const x of [...groups.values()].sort((a, b) => REL_ORDER.indexOf(a.rel) - REL_ORDER.indexOf(b.rel) || a.yi - b.yi)) {
        const twin = merged.find((m) => m.rel === x.rel && !m.weeks.length && !x.weeks.length && quoteJoin(m.titles) === quoteJoin(x.titles));
        if (twin) twin.g = `${twin.g} and ${x.g}`; else merged.push({ ...x });
    }
    const parts = [];
    for (const x of merged.slice(0, 2)) {
        const body = `${quoteJoin(x.titles)}${weekClause(x.weeks)}`;
        const prev = parts[parts.length - 1];
        // N30: "Taught before, in Grade 2: "…"; in Grade 3: "…"" (one lead, not two)
        if (prev && prev.rel === x.rel && x.rel === 'earlierGrade') prev.text += `; in ${x.g}: ${body}`;
        else parts.push({ rel: x.rel, text: `${REL_LEAD[x.rel](x.g)}: ${body}` });
    }
    if (!parts.length) return '';
    let out = `${parts.map((x) => x.text).join('. ')}.`;
    // the support block: THIS grade's prior-learning weeks that list one of the steps (the note's weeks when they
    // agree with the data, else the nearest one at or before the lesson's week)
    if (support && les.grade) {
        const lw = weekNo((les.weeks || [])[0]);
        const data = [...new Set(steps.flatMap((sid) => supportWeeksOf(les.grade, sid)))].sort((a, b) => a - b);
        let ws = data.filter((w) => weeks.includes(w));
        if (!ws.length && data.length) { const upTo = data.filter((w) => !lw || w <= lw); ws = [upTo.length ? upTo[upTo.length - 1] : data[0]]; }
        if (ws.length) out += ` Revisited in this grade's support block, ${weeksWords(ws.slice(0, 3))}.`;
    }
    return out;
}
const uniqBy = (a) => [...new Set(a)];
/** A skill's own reason to sit beside a lesson when the note names no step: its White Rose steps, else its standards. */
function skillReason(key, lesson, group) {
    const [c, s] = String(key || '').split(':');
    const mine = lesson.step || '';
    const myYear = mine ? mine.split('.')[0] : lesson.year || '';
    const rel = (id) => relationIn(id, lesson, group).rel;
    const steps = c && s ? wrmFor(c, s).map((x) => x.id).filter((id) => id !== mine && rel(id) !== 'other') : [];
    // a Do-first skill is placed by a step taught before the lesson (never by one taught after it)
    const want = group === 'prereq' ? PREREQ_RELS.filter((r) => r !== 'alsoGrade') : REL_ORDER;
    const pick = steps.filter((id) => want.includes(rel(id)));
    // nearest first: the same block, then the nearest grade
    pick.sort((a, b) => REL_ORDER.indexOf(rel(a)) - REL_ORDER.indexOf(rel(b))
        || Math.abs(YEAR_ORDER.indexOf(a.split('.')[0]) - YEAR_ORDER.indexOf(myYear)) - Math.abs(YEAR_ORDER.indexOf(b.split('.')[0]) - YEAR_ORDER.indexOf(myYear)));
    if (pick.length) return stepsSentence(pick.slice(0, 2), mine, { lesson, group });
    const codes = (SKILL_STANDARDS[key] || {}).ccss || [];
    const shared = codes.filter((x) => (lesson.ccss || []).includes(x));
    if (shared.length) return `Same standard as this lesson: ${uniqBy(shared).slice(0, 2).join(', ')}.`;
    // "Earlier standard" only for a code of a lower grade than the lesson's own codes
    const gradeOf = (c) => { const m = /^(K|\d)\./.exec(c); return !m ? 99 : m[1] === 'K' ? 0 : +m[1]; };
    const lessonGrade = Math.min(...(lesson.ccss || []).map(gradeOf), 99);
    const earlier = codes.filter((c) => gradeOf(c) < lessonGrade);
    if (group === 'prereq' && earlier.length) return `Earlier standard: ${earlier.slice(0, 2).join(', ')}.`;
    if (codes.length) return `Linked standard: ${codes.slice(0, 2).join(', ')}.`;
    return group === 'prereq' ? 'Earlier learning this lesson builds on.' : 'The same idea in another form.';
}

/**
 * The line beside a linked skill: the note when it is plain English as written, else a sentence composed from
 * the steps and weeks it names, else the skill's own steps or standards. Never a part of the note.
 */
export function composeWhy(note, { key = '', lesson = {}, group = 'prereq' } = {}) {
    const whole = plainNote(note);
    // a Do-first line never opens with a later-relation word, even in a note written that way ("Later times")
    if (whole && !(group === 'prereq' && LATER_LEAD.test(whole))) return whole;
    const steps = stepsInNote(note);
    if (steps.length) {
        const s = stepsSentence(steps, lesson.step || '', { weeks: weeksInNote(note), support: /prior learning/i.test(note), year: lesson.step ? '' : lesson.year || '', lesson, group });
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

/**
 * "Covers part" beside one skill: "Not yet: <the note>" when the note is plain, else '' (the row shows only its
 * "Covers part" tag; the verdict and the "To be built" chip already say what is missing — critic r6 M9).
 */
export function composePartial(note, build = []) {
    const whole = plainNote(note);
    if (whole) return `Not yet: ${/^(?:[A-Z][a-z]|A )/.test(whole) ? whole.charAt(0).toLowerCase() + whole.slice(1) : whole}`;
    return '';
}
/**
 * What follows "Not yet:" for a lesson only partly taught: the note when plain, else what the entry to build will
 * teach (its plain envision line), else '' — the page then says "The rest is still to be built (below)." and the
 * "To be built" chip names the entry. Never a sentence around an entry's name.
 */
export function composeMissing(note, build = [], envision = []) {
    const low = (t) => (/^(?:[A-Z][a-z]|A )/.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t);
    const whole = plainNote(note);
    if (whole) return low(whole);
    for (const e of envision || []) { const t = plainNote(e && e.teaches); if (t) return low(t); }
    return '';
}
/** The verdict line of a lesson only partly taught (one sentence, never repeated by its rows). */
export function partialVerdict(links) {
    if (links.missing) return `These skills cover part of the lesson. Not yet: ${links.missing}`;
    return (links.build || []).length ? 'These skills cover part of the lesson. The rest is still to be built (below).' : 'These skills cover part of the lesson.';
}

/* ================================================================= the school site's lessons (round 7) */
const gradeName = (id) => { const g = WRM_SEQUENCE.find((x) => x.id === String(id)); return g ? g.label : String(id || ''); };
const andJoin = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const weeksWords = (ns) => {
    const w = [...new Set(ns)].sort((a, b) => a - b);
    if (!w.length) return '';
    // N36 (critic r7): every week is named ("and 1 more" read like the step "1 more"); a long list ends "and more weeks"
    return w.length > 6 ? `weeks ${w.slice(0, 5).join(', ')} and more weeks` : `week${w.length > 1 ? 's' : ''} ${andJoin(w.map(String))}`;
};

/** The flag a lesson of the school site carries, in plain words ('' for a White Rose lesson the site does not flag). */
export function siteFlagText(l) {
    // the live site's step flag rides on the sequence row (owner 2026-10-17: the site orders the page)
    const f = l && l.siteInfo ? l.siteInfo.flag : (l && l.flag) || '';
    if (l && l.type === 'assessment') return 'Assessment';
    if (f === 'non-ccss') return 'Non-CCSS extra';
    if (f === 'committee' || (l && l.type === 'build')) return 'CCSS · BUILD';
    if (f === 'enrich-native') return 'Support lesson';
    if (f === 'above') return 'Above grade';
    if (f === 'native' || f === 'other') return 'School lesson';
    return '';
}

/** A school-site lesson as a teacher reads it in another screen's sentence: 'Grade 4, "Line plots with fractions"'. */
export function siteLessonLabel(id) {
    const l = lessonBySite(id);
    return l ? `${l.gradeLabel}, "${l.title}"` : '';
}

/**
 * What the lesson is, in sentences composed from the site's fields (never its notes): the kind of school lesson,
 * the domain test it comes before, the week the site plans it when the workbook says another week, and for a White
 * Rose step the other grades that teach it (copied in, reviewed, in a support block) and an enrichment mark.
 */
export function lessonAbout(l) {
    if (!l) return [];
    const out = [];
    const si = l.siteInfo;
    if (l.type === 'assessment') {
        out.push(si && si.flag === 'map' ? 'The MAP Growth test window on the school calendar.' : 'A domain test on the school calendar. It checks the lessons of this unit.');
    } else if (si && si.flag === 'committee') {
        out.push('A lesson the school writes for a CCSS standard that White Rose does not teach.');
        if (si.domainTest) out.push('It comes before the domain test, so the test only asks what has been taught.');
    } else if (si && si.flag === 'enrich-native') {
        out.push('A support lesson the school site lists for this grade. No White Rose lesson has this title.');
    } else if (si && (si.flag === 'other' || si.flag === 'native')) {
        out.push('A lesson the school site lists for this grade.');
    }
    // m13 (critic r6): two calendars, both named — the workbook's week (the list's order) and the site's
    if (si && l.seq && si.week && !l.weeks.includes(si.week)) {
        const wb = l.weeks.map(weekNo).filter(Boolean);
        out.push(wb.length ? `Workbook ${weeksWords(wb)}; the school site plans it for week ${weekNo(si.week)}.` : `The school site plans it for week ${weekNo(si.week)}.`);
    }
    if (!l.step) return out;
    const rec = STEP_SITE[l.step] || {};
    const taught = (rec.t || []).filter((x) => x[0] !== l.grade);
    const copied = taught.filter((x) => x[1] !== 'review').map((x) => `${gradeName(x[0])}${x[2] ? ` (from week ${weekNo(x[2])})` : ''}`);
    const review = taught.filter((x) => x[1] === 'review').map((x) => `${gradeName(x[0])}${x[2] ? ` (week ${weekNo(x[2])})` : ''}`);
    if (copied.length) out.push(`Also taught in ${andJoin(copied)}.`);
    if (review.length) out.push(`Reviewed in ${andJoin(review)}.`);
    // the support blocks that list the step: the workbook's weeks, else the grades the site names
    // m17 (critic r7): in grade order, every grade named (there are at most seven)
    const sup = [];
    WRM_SEQUENCE.forEach((g, gi) => {
        const ws = Object.entries(g.prior || {}).filter(([, ids]) => (ids || []).includes(l.step)).map(([w]) => weekNo(w));
        if (ws.length) sup.push([gi, `${g.label}, ${weeksWords(ws)}`]);
        else if ((rec.s || []).includes(g.id)) sup.push([gi, g.label]);
    });
    if (sup.length) out.push(`Also in the support block: ${sup.sort((a, b) => a[0] - b[0]).map((x) => x[1]).join('; ')}.`);
    if (rec.e && l.type !== 'enrich') {
        const why = /^(?:true|1)$/i.test(String(rec.e)) ? '' : String(rec.e).replace(/\.$/, '');
        const t = `The school marks it as an enrichment lesson${why ? ` (${why})` : ''}.`;
        if (isPlain(t)) out.push(t);
    }
    return out;
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
        const unit = `${l.unitName} ${domainName(l.domain)} ${siteFlagText(l)}`.toLowerCase();
        let s = 0;
        // m13: a row the school site dates differently is found by the site's week too
        if (wk) { if (l.weeks.some((w) => weekNo(w) === +wk[1]) || (l.siteInfo && weekNo(l.siteInfo.week) === +wk[1])) s = 70 + (l.grade === grade ? 20 : 0); }
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
