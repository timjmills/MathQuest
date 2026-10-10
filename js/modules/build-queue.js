// build-queue.js — "Skills to be made": every new skill or option still to build, from all four
// sources, as ONE de-duplicated list the teacher screen (teacher-todo.js) filters, prints and exports.
//
// Pure: no window, no DOM, no state. Same input → same list, same order.
//
// SOURCES (an entry carries every source that asks for it; one id = one entry)
//   CCSS  STANDARD_PROPOSALS with CCSS codes, and any entry a CCSS verdict in standards-audit.js
//         (status partial / gap) names in its `build` list
//   EE    the same for the Wisconsin Essential Elements (EE_AUDIT)
//   WRM   WRM_PROPOSALS (js/modules/wrm.js), VISUAL_BUILDS (the White Rose picture catalogue), and the
//         `proposals` of the curated year files data/curriculum/links/<YEAR>.json
//   MAP   the `proposals` of data/curriculum/links/MAP.json (with their strand, RIT band and task type)
//
// FIELDS a teacher reads (the SHORT spec): name, kind (new skill / option / other), teaches ("What
// pupils will do"), closes ("Gap it fills"), representation ("How it looks"), the standards, WRM steps
// and MAP tasks it closes. `spec` keeps the fuller design fields when the source has them, for later.

import { buildList } from './build-list.js';
import { WRM_PROPOSALS, wrmStep } from './wrm.js';
import { CCSS_AUDIT, EE_AUDIT } from './standards-audit.js';
import { repPairsOfText, plainWhy, gradeOfYear } from './wrm-links.js';

export const SOURCES = ['CCSS', 'EE', 'WRM', 'MAP'];
export const GRADES = ['PK', 'K', '1', '2', '3', '4', '5', '6'];
export const GRADE_NAMES = { PK: 'Pre-K', K: 'Kindergarten', 1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5', 6: 'Grade 6 and above', '': 'Grade not set' };
export const DOMAINS = [
    ['CC', 'Counting & Cardinality'], ['OA', 'Operations & Algebraic Thinking'], ['NBT', 'Number & Operations in Base Ten'],
    ['NF', 'Fractions'], ['MD', 'Measurement & Data'], ['G', 'Geometry'], ['X', 'Beyond K–5 (ratio, statistics, number system)'],
];
export const KINDS = [['new', 'New skill'], ['option', 'Option on a skill'], ['other', 'Other (drawing, fix)']];

const YEAR_GRADE = { R: 'PK', Y1: 'K', Y2: '1', Y3: '2', Y4: '3', Y5: '4', Y6: '5' };
const FAMILY_DOMAIN = { k2: 'CC', counting: 'CC', operations: 'OA', algebra: 'OA', placevalue: 'NBT', fractions: 'NF', decimals: 'NF',
    geometry: 'G', measurement: 'MD', timemoney: 'MD', data: 'MD', numtheory: 'OA' };

export function gradeOfCode(code) {
    const m = /^(?:M\.EE\.)?(K|\d)\./.exec(String(code || ''));
    return !m ? '' : m[1] !== 'K' && +m[1] > 6 ? '6' : m[1];
}
export function domainOfCode(code) {
    const m = /^(?:M\.EE\.)?(?:K|\d)\.([A-Z]+)/.exec(String(code || ''));
    if (!m) return '';
    return ['CC', 'OA', 'NBT', 'NF', 'MD', 'G'].includes(m[1]) ? m[1] : 'X';
}
export function gradeOfStep(id) { return YEAR_GRADE[String(id || '').split('.')[0]] || ''; }
/** A rough grade for a MAP RIT band (its low end): the NWEA K–5 norms' median spring scores. */
export function gradeOfRit(band) {
    const lo = parseInt(String(band || ''), 10);
    if (!lo) return '';
    return lo < 161 ? 'K' : lo < 176 ? '1' : lo < 191 ? '2' : lo < 201 ? '3' : lo < 211 ? '4' : '5';
}
/** '2-3' → ['2','3'], 'PK-K' → ['PK','K'], '4' → ['4']. */
export function gradesOfText(t) {
    const parts = String(t || '').split('-').map((x) => x.trim()).filter(Boolean);
    if (!parts.length) return [];
    const a = GRADES.indexOf(parts[0]);
    const b = GRADES.indexOf(parts[parts.length - 1]);
    if (a < 0) return [];
    return GRADES.slice(a, (b < a ? a : b) + 1);
}
const kindOf = (k) => (['new', 'skill'].includes(k) ? 'new' : ['option', 'band'].includes(k) ? 'option' : 'other');
const stepList = (ids) => `${ids.slice(0, 3).map((s) => `"${stepName(s)}"`).join(', ')}${ids.length > 3 ? ` and ${ids.length - 3} more steps` : ''}`;
/** A step as a teacher reads it: 'Grade 2: Hundreds'. */
export const stepName = (id) => { const r = wrmStep(id); return `${gradeOfYear(String(id).split('.')[0])}: ${r ? r.title : id}`; };
/** `closes` may be a string, a list, or { stepId: clause } — always plain strings back. */
export function closesText(v) {
    return closesRaw(v).map((c) => c.replace(/\s*—\s*\(/g, ' (').replace(/\s*—\s*$/, ''));
}
function closesRaw(v) {
    if (v == null || v === '') return [];
    if (typeof v === 'string') return [plainWhy(v)];
    if (Array.isArray(v)) return v.flatMap(closesRaw);
    if (typeof v === 'object') return Object.entries(v).map(([k, t]) => (/^(R|Y[1-6])\.B\d+\.S\d+$/.test(k) ? `${stepName(k)} — ${plainWhy(String(t))}` : `${k}: ${plainWhy(String(t))}`));
    return [String(v)];
}
const uniq = (a) => [...new Set(a.filter(Boolean))];
const sortGrades = (a) => uniq(a).filter((g) => GRADES.includes(g)).sort((x, y) => GRADES.indexOf(x) - GRADES.indexOf(y));

/**
 * The whole queue. `curated` = the year files (objects with `proposals`); `map` = MAP.json or null.
 * → { items: [...], totals: { all, new, option, other, bySource: {CCSS, EE, WRM, MAP} } }
 */
export function buildQueue({ curated = [], map = null } = {}) {
    const byId = new Map();
    const get = (id) => {
        if (!byId.has(id)) {
            byId.set(id, { id, name: '', kind: 'other', kindRaw: '', skill: '', option: '', sources: new Set(), grades: [], domain: '',
                family: '', teaches: '', closes: [], representation: '', ccss: [], ee: [], wrmSteps: [], improves: [], map: [], spec: null });
        }
        return byId.get(id);
    };
    const fill = (e, p) => {
        if (!e.name && p.name) e.name = p.name;
        if (!e.kindRaw && p.kind) { e.kindRaw = p.kind; e.kind = kindOf(p.kind); }
        if (!e.skill && p.skill) e.skill = p.skill;
        if (!e.option && p.option) e.option = String(p.option);
        if (!e.family && p.family) e.family = p.family;
        if (!e.teaches && p.teaches) e.teaches = p.teaches;
        if (!e.representation && p.representation) e.representation = p.representation;
    };

    // 1. the build list: WRM proposals, standards proposals, White Rose pictures
    for (const b of buildList()) {
        const e = get(b.id);
        fill(e, b);
        if (b.source === 'standards') {
            if (b.standards.length) e.sources.add('CCSS');
            if (b.ee.length) e.sources.add('EE');
            e.ccss.push(...b.standards);
            e.ee.push(...b.ee);
        } else {
            e.sources.add('WRM');
            if (b.source === 'wrm') e.ccss.push(...b.standards);
        }
        e.wrmSteps.push(...b.wrmSteps);
        e.improves.push(...(b.wrmImproves || []));
        e.grades.push(...gradesOfText(b.grade));
        if (b.source === 'visual' && !e.closes.length) e.closes.push('White Rose draws this picture and our pages do not yet.');
        if ((b.problemTypes && b.problemTypes.length) || b.ladder || (b.misconceptions && b.misconceptions.length)) {
            e.spec = { problemTypes: b.problemTypes || [], ladder: b.ladder || '', answer: b.answer || '', misconceptions: b.misconceptions || [] };
        }
    }
    // 2. the standards verdicts: what each partial / gap standard is missing, and which entry closes it
    const audit = (table, src) => {
        for (const [code, a] of Object.entries(table)) {
            if (!a || a.status === 'full' || !Array.isArray(a.build)) continue;
            for (const id of a.build) {
                const e = get(id);
                e.sources.add(src);
                if (src === 'CCSS') e.ccss.push(code); else e.ee.push(code);
                const miss = (a.missing || []).join('; ');
                if (miss) e.closes.push(`${code}: ${miss}`);
            }
        }
    };
    audit(CCSS_AUDIT, 'CCSS');
    audit(EE_AUDIT, 'EE');
    // 3. the curated year files (White Rose tagging): their proposals and which steps they close
    for (const y of curated) {
        if (!y || typeof y !== 'object') continue;
        for (const [id, p] of Object.entries(y.proposals || {})) {
            const e = get(id);
            e.sources.add('WRM');
            fill(e, p);
            e.ccss.push(...(p.ccss || []));
            e.wrmSteps.push(...(p.steps || []));
            if (p.closes) e.closes.unshift(...closesText(p.closes));
            else if (p.why && !/reused/i.test(p.why)) e.closes.push(p.why);
        }
        for (const [sid, st] of Object.entries(y.steps || {})) {
            for (const id of [...(st.build || [])]) {
                const e = byId.get(id);
                if (!e) continue;
                e.wrmSteps.push(sid);
                if (st.missing) e.closes.push(`${stepName(sid)} — ${plainWhy(st.missing)}`);
            }
        }
    }
    // 4. MAP.json: proposals with their MAP facets, and the task rows they close
    if (map && typeof map === 'object') {
        for (const [id, p] of Object.entries(map.proposals || {})) {
            const e = get(id);
            e.sources.add('MAP');
            fill(e, p);
            e.ccss.push(...(p.ccss || []));
            const facets = Array.isArray(p.map) ? p.map : p.map ? [p.map] : [];
            e.map.push(...facets.map((f) => ({ strand: f.strand || '', ritBand: f.ritBand || '', taskType: f.taskType || '' })));
            if (p.closes) e.closes.push(...closesText(p.closes));
            else if (p.why) e.closes.push(p.why);
            if (!e.spec && (p.problemTypes || p.levels || p.misconceptions)) {
                e.spec = { problemTypes: p.problemTypes || [], ladder: (p.levels || []).join(' · '), answer: '', misconceptions: p.misconceptions || [] };
            }
        }
        for (const r of map.rows || []) {
            if (!r.proposal) continue;
            const e = byId.get(r.proposal);
            if (!e) continue;
            e.sources.add('MAP');
            if (!e.map.some((f) => f.task === r.task)) e.map.push({ strand: r.strand || '', ritBand: r.ritBand || '', taskType: '', task: r.task || '' });
            if (r.closes) e.closes.push(...closesText(r.closes).map((c) => `MAP task "${r.task}": ${c}`));
        }
    }

    // finish: names, grades, domain, pairs, de-dup
    const items = [];
    for (const e of byId.values()) {
        const W = WRM_PROPOSALS[e.id];
        if (W) fill(e, W);
        if (!e.name) e.name = e.id.replace(/_/g, ' ');
        e.ccss = uniq(e.ccss); e.ee = uniq(e.ee); e.wrmSteps = uniq(e.wrmSteps);
        e.closes = uniq(e.closes.filter((c) => typeof c === 'string'));
        if (!e.closes.length && e.wrmSteps.length) {
            e.closes.push(`No skill teaches ${stepList(e.wrmSteps)}.`);
        }
        e.improves = uniq(e.improves).filter((s) => !e.wrmSteps.includes(s));
        if (!e.closes.length && e.improves.length) e.closes.push(`Today's skills only cover part of ${stepList(e.improves)}.`);
        if (!e.closes.length && e.ccss.length) e.closes.push(`Not yet fully taught: ${e.ccss.join(', ')}.`);
        const g = [...e.grades, ...e.ccss.map(gradeOfCode), ...e.ee.map(gradeOfCode), ...e.wrmSteps.map(gradeOfStep)];
        if (!g.filter(Boolean).length) g.push(...e.map.map((f) => gradeOfRit(f.ritBand)));
        e.grades = sortGrades(g);
        const stepCodes = e.wrmSteps.flatMap((s) => (wrmStep(s) || {}).ccss || []);
        e.domain = domainOfCode(e.ccss[0]) || domainOfCode(e.ee[0]) || domainOfCode(stepCodes[0]) || FAMILY_DOMAIN[e.family] || FAMILY_DOMAIN[(e.skill || '').split(':')[0]] || 'X';
        e.pairs = repPairsOfText([e.name, e.teaches, e.representation, e.option, ...e.map.map((f) => `${f.taskType} ${f.task || ''}`)].join(' '));
        e.sources = SOURCES.filter((s) => e.sources.has(s));
        if (!e.sources.length) continue;
        items.push(e);
    }
    const gi = (e) => (e.grades.length ? GRADES.indexOf(e.grades[0]) : 99);
    const di = (e) => DOMAINS.findIndex((d) => d[0] === e.domain);
    items.sort((a, b) => gi(a) - gi(b) || di(a) - di(b) || a.name.localeCompare(b.name));
    const totals = { all: items.length, new: 0, option: 0, other: 0, bySource: { CCSS: 0, EE: 0, WRM: 0, MAP: 0 } };
    for (const e of items) { totals[e.kind] += 1; for (const s of e.sources) totals.bySource[s] += 1; }
    return { items, totals };
}

/** Does an item pass the filters? f = { sources:Set, grades:Set, domains:Set, kinds:Set, pair:'', q:'' }. */
export function passes(e, f) {
    if (f.sources && f.sources.size && !e.sources.some((s) => f.sources.has(s))) return false;
    if (f.grades && f.grades.size && !e.grades.some((g) => f.grades.has(g))) return false;
    if (f.domains && f.domains.size && !f.domains.has(e.domain)) return false;
    if (f.kinds && f.kinds.size && !f.kinds.has(e.kind)) return false;
    if (f.pair && !e.pairs.includes(f.pair)) return false;
    if (f.q) {
        const hay = [e.id, e.name, e.skill, e.option, e.teaches, e.representation, ...e.closes, ...e.ccss, ...e.ee, ...e.wrmSteps,
            ...e.map.map((m) => `${m.task || ''} ${m.taskType} ${m.strand}`)].join(' ').toLowerCase();
        if (!String(f.q).toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w))) return false;
    }
    return true;
}

const csvCell = (v) => { const s = String(v == null ? '' : v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const CSV_HEAD = ['id', 'name', 'kind', 'sources', 'grades', 'domain', 'skill', 'option', 'what pupils will do', 'gap it fills', 'how it looks', 'CCSS', 'EE', 'WRM steps', 'MAP tasks'];
export function toCSV(items) {
    const rows = [CSV_HEAD, ...items.map((e) => [e.id, e.name, (KINDS.find((k) => k[0] === e.kind) || [])[1], e.sources.join(' '), e.grades.join(' '), e.domain,
        e.skill, e.option, e.teaches, e.closes.join(' | '), e.representation, e.ccss.join(' '), e.ee.join(' '), e.wrmSteps.join(' '),
        e.map.map((m) => [m.strand, m.ritBand, m.task || m.taskType].filter(Boolean).join(' / ')).join(' | ')])];
    return rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
}
