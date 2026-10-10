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
                const [title, step, ccss, power, type, weeks, strands, from, note] = t;
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
        ...(cur.partial || []).map((x) => ({ key: x.key, opts: x.opts || null, partial: plainWhy(x.missing || 'part of the step') })),
    ], ovr.direct, 'Added by the school', 0).filter(keep).map((x) => ({ key: x.key, opts: x.opts || null, partial: x.partial || '' }));
    // opts travel with every link (a curated pre / related skill is often "within 100" etc.)
    const withOpts = (x) => ({ key: x.key, why: plainWhy(x.why || ''), opts: x.opts && Object.keys(x.opts).length ? x.opts : null });
    const prereq = applyOverride((cur.pre || []).map(withOpts), ovr.prereq, 'Added by the school', 0).filter(keep);
    const related = applyOverride((cur.related || []).map(withOpts), ovr.related, 'Added by the school', 0).filter(keep);
    const verdict = ['full', 'partial', 'gap'].includes(cur.verdict) ? cur.verdict
        : !direct.length ? 'gap' : direct.some((x) => !x.partial) ? 'full' : 'partial';
    return { lesson, step: wrmStep(lesson.step), direct, prereq, related, verdict, missing: plainWhy(cur.missing || ''),
        build: (cur.build || []).slice(), preBuild: (cur.preBuild || []).slice(), note: cur.note || '', source: 'curated' };
}

/**
 * Skill ids inside a note become the skill's label. Pure by default (the id in words); the page installs
 * the real labels with setSkillLabeler(fn(key|id) → label|null).
 */
let skillLabeler = null;
export function setSkillLabeler(fn) { skillLabeler = typeof fn === 'function' ? fn : null; }
const skillWords = (id) => {
    const lab = skillLabeler ? skillLabeler(id) : null;
    return lab || id.replace(/^[a-z_]+:/, '').replace(/_/g, ' ');
};
const YEAR_WORD = { R: 'Pre-K', Y1: 'Kindergarten', Y2: 'Grade 1', Y3: 'Grade 2', Y4: 'Grade 3', Y5: 'Grade 4', Y6: 'Grade 5' };
const weekWords = (w) => w.split(/\s*\/\s*|,\s*/).map((x) => +String(x).replace(/\D/g, '')).filter(Boolean);

/**
 * A tagging note in a teacher's words (critic r1 M1, r2 M1): step ids become "Grade 1: <step title>",
 * block ids and year codes become grade names, the tagging lanes' shorthand ("prior learning wk W01",
 * "step before in the block", "not dealt", "[rule 3: …]", "{band: 99}", snake_case skill ids) becomes
 * the handbook's words ("support block, week 1", "the step before", "not practised yet", the skill's label).
 */
export function plainWhy(text) {
    let t = String(text || '');
    if (!t) return t;
    t = t.replace(/\s*\[rule[^\]]*\]/gi, '');
    t = t.replace(/\s*-?\s*easier:\s*\{[^}]*\}/gi, ' (easier numbers)').replace(/\s*\{[^}]*\}/g, '');
    // chains of ids "R.B2.S1 / R.B10" → the last full step's grade + title, else the grade
    t = t.replace(/\b(?:R|Y[1-6])\.B\d+(?:\.S\d+)?\b(?:\s*\/\s*(?:R|Y[1-6])\.B\d+(?:\.S\d+)?\b)*/g, (m) => {
        const ids = m.split('/').map((x) => x.trim());
        const full = ids.find((x) => /\.S\d+$/.test(x));
        const y = ids[0].split('.')[0];
        return full ? `${YEAR_WORD[y]}:\u0001${full}\u0001` : `${YEAR_WORD[y]}`;
    });
    t = t.replace(/\u0001([^\u0001]+)\u0001(\s*)(?=$|[(;,)\-]|\s*$)/g, (m, id) => { const r = wrmStep(id); return r ? ` ${r.title}` : ''; });
    t = t.replace(/\u0001[^\u0001]+\u0001/g, '');
    t = t.replace(/\s*\((?:school )?prior learning(?:,)?(?:\s*(?:wk|week)\s*((?:W?\d+\s*\/?\s*)+))?\)/gi, (m, w) => (w ? ` — support block, week ${weekWords(w).join(', ')}` : ' — support block'));
    t = t.replace(/\s*\((?:the )?(?:step before in (?:the|this) block|previous step|earlier in (?:the|this) block|earlier step)\)/gi, ' — the step before');
    t = t.replace(/\s*\(next step[^)]*\)/gi, ' — the next step');
    t = t.replace(/\s*\(neighbouring step[^)]*\)/gi, ' — the step next to it');
    t = t.replace(/\s*\(lower grade, same CCSS cluster\)/gi, ' — earlier grade, same standard group');
    t = t.replace(/\s*\(same CCSS ([^,)]+), earlier\)/gi, ' — same standard $1, earlier');
    t = t.replace(/\s*\(earlier (?:R|Y[1-6]) step\)/gi, ' — earlier');
    t = t.replace(/^same block:\s*/i, 'Same unit: ').replace(/^next step:\s*/i, 'Next: ').replace(/^same CCSS ([^ ]+(?:, [^ ]+)*) in /i, 'Same standard $1: ');
    t = t.replace(/\bCCSS cluster\b/gi, 'standard group');
    // weeks: "school week, W23", "wk W05", "week W05", bare "W05"
    t = t.replace(/\b(?:school )?(?:wk|week),?\s*W?0?(\d{1,2})\b/gi, 'week $1').replace(/\bW0?(\d{1,2})\b/g, 'week $1').replace(/\bweek week\b/gi, 'week');
    // year codes: Y3 / Gr.2 / Rec / Y2/Gr.1
    t = t.replace(/\bY[1-6]\/Gr\.\s?\d\b/g, (m) => YEAR_WORD[m.split('/')[0]]).replace(/\bRec\/PK4\b/g, 'Pre-K').replace(/\bY1\/KG\b/g, 'Kindergarten');
    t = t.replace(/\bGr\.\s?(\d)\b/g, 'Grade $1').replace(/\bY([1-6])\b/g, (m) => YEAR_WORD[m]);
    // skill ids → labels
    t = t.replace(/\b[a-z_]+:[a-z0-9_]+\b/g, (m) => skillWords(m)).replace(/\b[a-z]+(?:_[a-z0-9]+)+\b/g, (m) => skillWords(m));
    t = t.replace(/\bare not dealt\b/gi, 'are not practised yet').replace(/\bis not dealt\b/gi, 'is not practised yet').replace(/\bnot dealt\b/gi, 'not practised yet');
    t = t.replace(/\(\s*\)/g, '').replace(/:\s*(—|$)/g, ' $1').replace(/—\s*—/g, '—').replace(/\s+([,;)])/g, '$1');
    return t.replace(/\s{2,}/g, ' ').replace(/[\s—:-]+$/, '').trim();
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
    const day = (d, m) => new Date(m >= 7 ? 2026 : 2027, m, d);
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
