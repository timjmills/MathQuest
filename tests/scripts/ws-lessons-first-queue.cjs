#!/usr/bin/env node
/*
 * ws-lessons-first-queue — the "lessons first" work queue (owner decision 2026-11-07, design/LESSONS_FIRST_PLAN.md):
 * every K-5 unit of the school year, in the order the program builds them, with what each unit needs before its short
 * and long lessons can be made and passed at 8/10.
 *
 *   node tests/scripts/ws-lessons-first-queue.cjs            write design/lessons-first/QUEUE.md + queue.json
 *   node tests/scripts/ws-lessons-first-queue.cjs --check    exit 1 when the committed files are stale (nothing written)
 *   node tests/scripts/ws-lessons-first-queue.cjs --order week    sort units by first teaching week instead of by round
 *   node tests/scripts/ws-lessons-first-queue.cjs --from W10      start the queue at a school week (earlier units go last)
 *   node tests/scripts/ws-lessons-first-queue.cjs --json-only     write only queue.json
 *
 * A UNIT is one White Rose block as one school grade teaches it (the school rule, data/curriculum/wrm-steps.json
 * meta.gradeRule: WRM Year N = US grade N-1, so K = Y1 ... Grade 5 = Y6), plus the Awsaj CCSS BUILD lessons the
 * school places in that block (data/curriculum/links/<Y>.json lessons[].site.block) or, when the site gives no block,
 * the block of the same grade and CCSS domain taught nearest in time. A unit's start week is the median first week of
 * its lessons in the school pacing (data/curriculum/wrm-sequence.json, the live school site + the pacing workbook).
 *
 * ORDER (owner 2026-11-07, "across all grades by time of year"): round r holds every grade's r-th unit, K, 1, 2, 3, 4, 5
 * (default), or, with --order week, every unit by its start week, then grade.
 *
 * A CCSS LESSON is a lesson of the school sequence with a CCSS code and no "non-ccss" flag: a White Rose small step or
 * a CCSS BUILD ("committee") lesson. Each needs two products: the SHORT lesson (the standard lesson packet,
 * sheet/roles/lesson.js) and the LONG lesson (the detailed V22 lesson, sheet/roles/detailed-lesson.js).
 *
 * Per lesson the queue reads: the skills that teach it (links "direct" with options, else SKILL_WRM full tags), the
 * links verdict (full / partial / gap), the build-list entries that close its gaps, whether each skill passed the 8/10
 * redesign (js/modules/redesign-passed.js, the one record), the long lesson's state (data/curriculum/detailed-lessons.json)
 * and whether short-lesson data exists (js/modules/lessons/prereqs.js LESSONS). The lesson SHAPE is a heuristic proposal
 * (the archetypes of design/LESSON_LIBRARY_PLAN.md §6) until design/lessons/SHAPES.md (E4) exists and decides it.
 *
 * Pure node: no browser. Deterministic: two runs on one tree write byte-identical files.
 */
'use strict';
process.removeAllListeners('warning');   // data.js and the other app modules are ES modules without a package type
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'design', 'lessons-first');
const OUT_MD = path.join(OUT_DIR, 'QUEUE.md');
const OUT_JSON = path.join(OUT_DIR, 'queue.json');
const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const arg = (f) => (has(f) ? args[args.indexOf(f) + 1] : null);
const CHECK = has('--check');
const ORDER = arg('--order') === 'week' ? 'week' : 'rank';
const FROM = arg('--from');
const JSON_ONLY = has('--json-only');

const rd = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const wk = (w) => (/^W\d{2}$/.test(String(w || '')) ? Number(String(w).slice(1)) : null);
const W = (n) => (n == null ? '-' : `W${String(n).padStart(2, '0')}`);
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)]; };
const uniq = (a) => [...new Set(a)];
const ccssGrade = (c) => { const m = /^(K|\d+)\./.exec(c || ''); return m ? (m[1] === 'K' ? 0 : Number(m[1])) : null; };
const ccssDomain = (c) => { const m = /^(?:K|\d+)\.([A-Z]+)\./.exec(c || ''); return m ? m[1] : null; };
const GRADES = [
    { seq: 'K', label: 'K', num: 0, year: 'Y1' },
    { seq: '1', label: '1', num: 1, year: 'Y2' },
    { seq: '2', label: '2', num: 2, year: 'Y3' },
    { seq: '3', label: '3', num: 3, year: 'Y4' },
    { seq: '4', label: '4', num: 4, year: 'Y5' },
    { seq: '5', label: '5', num: 5, year: 'Y6' },
];

/* ---------------------------------------------------------------- lesson shapes (heuristic, E4 decides) */
// The 13 archetypes of design/LESSON_LIBRARY_PLAN.md §6, used as the proposed lesson shape of each lesson.
const SHAPES = {
    A1: 'column (written method)', A2: 'fact (strategy, tables)', A3: 'line (number line, rounding)', A4: 'pv (place value)',
    A5: 'partwhole (bonds, bar, missing number)', A6: 'count (early number)', A7: 'groups (equal groups, arrays)',
    A8: 'fraction', A9: 'measure', A10: 'timemoney', A11: 'shape', A12: 'data', A13: 'story (word problems)',
};
// E4: design/lessons/SHAPES.md decides each lesson's archetype (its Archetype column, written and kept by
// `ws-lesson-card.mjs --shapes`); the title heuristic below proposes one only for a lesson SHAPES.md does not list yet.
function shapeOf(title, lanes, ccss, id) {
    if (!shapeOf.table) {
        shapeOf.table = new Map();
        const f = path.join(ROOT, 'design/lessons/SHAPES.md');
        if (fs.existsSync(f)) for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
            const m = line.match(/^\| `([^`]+)` \| [^|]+ \| .* \| (A\d+) \| [^|]+ \| [^|]* \|$/);
            const key = m && m[1].replace(/\\\|/g, '|');
            if (m && !shapeOf.table.has(key)) shapeOf.table.set(key, m[2]);
        }
    }
    if (id && shapeOf.table.has(id)) return shapeOf.table.get(id);
    const t = String(title || '').toLowerCase();
    const dom = uniq(ccss.map(ccssDomain));
    if (/word problem|problems|solve problems|story|two-step|multi-step/.test(t)) return 'A13';
    if (/input-output|function machine|\brule\b|pattern|sequence/.test(t)) return 'A5';
    if (/\b(clock|o'clock|hours?|minutes?|seconds|time(?!s)|a\.m\.|p\.m\.|24-hour|money|coins?|notes|pence|pounds?|dollars?|cents?|calendar|days?|weeks?|months?|years?)\b/.test(t)) return 'A10';
    if (/pictogram|picture graph|bar chart|bar graph|tally|line plot|line graph|\bdata\b|survey|timetable|two-way table|\btables? of\b|in a table/.test(t)) return 'A12';
    if (/fraction|half|halves|quarter|third|tenth|hundredth|thousandth|decimal|percent|numerator|denominator|ratio|proportion/.test(t)) return 'A8';
    if (/number line|round|estimate on|nearest/.test(t)) return 'A3';
    if (/shape|triangle|rectangle|square|circle|polygon|angle|symmetry|3-d|2-d|cube|cuboid|sphere|cone|cylinder|pyramid|prism|faces?|edges?|vertex|vertices|position|direction|turns?|coordinate|parallel|perpendicular|quadrilateral|lines?, line segments|rays/.test(t)) return 'A11';
    if (/length|height|mass|weight|capacity|volume|measure|ruler|perimeter|area|metre|meter|\bcm\b|\bkg\b|gram|litre|liter|inch|feet|foot|yard|temperature|convert|units/.test(t)) return 'A9';
    if (/column|exchange|regroup|add two|subtract two|written method|across a 10|across a 100|2-digit and|3-digit|4-digit|long multiplication|long division|short division|formal/.test(t)) return 'A1';
    if (/equal groups|array|groups of|share|sharing|grouping|repeated addition|lots of/.test(t)) return 'A7';
    if (/bond|part-whole|part whole|fact famil|missing|inverse|bar model|related facts|commutativ|properties|balance|equation|unknown|expression|order of operations|brackets|parenthes/.test(t)) return 'A5';
    if (/times-table|times table|multiplication table|facts|double|halve|multiply|divide|\d+ times|count in|count by|multiples|factor|prime|square number|cube number/.test(t)) return 'A2';
    if (/place value|hundreds|thousands|tens and ones|partition|digit|value|million|compare|order numbers|represent numbers|numbers to|powers of 10|10 times|roman/.test(t)) return 'A4';
    if (/count|how many|find \d|subitise|more|fewer|less|zero|1 more|1 less|numerals?|match|sort/.test(t)) return 'A6';
    if (lanes.includes('k2')) return 'A6';
    if (lanes.includes('placevalue')) return 'A4';
    if (lanes.includes('fractions') || dom.includes('NF')) return 'A8';
    if (lanes.includes('geometry') || dom.includes('G')) return 'A11';
    if (lanes.includes('measurement') || dom.includes('MD')) return 'A9';
    if (lanes.includes('timemoney')) return 'A10';
    if (lanes.includes('data')) return 'A12';
    if (dom.includes('OA')) return 'A5';
    if (dom.includes('NBT')) return 'A4';
    return 'A6';
}

async function main() {
    // Node has no localStorage; data.js reads it at load.
    const mem = {};
    globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
    const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
    const origLog = console.log, origWarn = console.warn;
    console.log = () => {}; console.warn = () => {};
    let data, wrm, bl, passedMod, prereqs;
    try {
        data = await imp('js/modules/data.js');
        wrm = await imp('js/modules/wrm.js');
        bl = await imp('js/modules/build-list.js');
        passedMod = await imp('js/modules/redesign-passed.js');
        prereqs = await imp('js/modules/lessons/prereqs.js');
    } finally { console.log = origLog; console.warn = origWarn; }

    const live = new Map();
    for (const [cat, list] of Object.entries(data.SKILLS)) {
        if (!Array.isArray(list)) continue;
        for (const s of list) if (s && !s.retired) live.set(`${cat}:${s.v}`, s.l);
    }
    const PASSED = passedMod.REDESIGN_PASSED;
    const SHORT_DATA = new Set(Object.keys(prereqs.LESSONS || {}));
    // The three standard-lesson samples passed lessons-r4 (48/48 pages >= 8; design/LESSONS_VISION.md, LESSON_LIBRARY_PLAN.md).
    const SHORT_PASSED = new Set(['addition:add_facts', 'subtraction:sub_100_regroup', 'number_sense:nearest_10']);
    const entries = bl.buildList();
    const entryById = new Map(entries.map((e) => [e.id, e]));
    const canon = (id) => (bl.canonicalEntry ? bl.canonicalEntry(id) : id);

    const steps = rd('data/curriculum/wrm-steps.json');
    const stepRec = new Map(), blockRec = new Map();
    for (const y of steps.years) for (const b of y.blocks) {
        blockRec.set(b.id, { id: b.id, year: y.id, term: b.term, termBlock: b.termBlock, number: b.number, name: b.name });
        for (const s of b.steps) stepRec.set(s.id, s);
    }
    const seq = rd('data/curriculum/wrm-sequence.json');
    const detailed = rd('data/curriculum/detailed-lessons.json').lessons;
    const longBySite = new Map(), longByStep = new Map();
    for (const l of detailed) {
        const st = { id: l.id, status: l.critic && l.critic.verdict === 'PASS' ? 'passed' : (l.critic ? `critic r${l.critic.round} ${l.critic.verdict}` : 'draft'),
            skills: uniq(((l.skills && l.skills.used) || []).map((u) => u.key).filter(Boolean)) };
        if (l.siteLessonId) longBySite.set(l.siteLessonId, st);
        for (const s of l.wrmSteps || []) longByStep.set(s, st);
    }
    const links = {};
    const linkProps = new Map();
    for (const y of ['R', ...GRADES.map((g) => g.year)]) links[y] = rd(`data/curriculum/links/${y}.json`);
    for (const y of Object.keys(links)) for (const [k, v] of Object.entries(links[y].proposals || {})) if (!linkProps.has(k)) linkProps.set(k, v);
    const slug = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const siteGrade = (g) => (g.seq === 'K' ? 'K' : `G${g.seq}`);
    const weekOf = {};

    const skillRow = (key, opts) => {
        const cat = key.split(':')[0];
        return { key, opts: opts && Object.keys(opts).length ? opts : undefined, label: live.get(key) || null, live: live.has(key),
            category: cat, lane: bl.laneFor(key), passed: PASSED.has(key) };
    };
    // The links files' own lesson-fit proposals (data/curriculum/links/<Y>.json proposals): entries the year tagging
    // proposed that are not (yet) on the single build list (js/modules/build-list.js); loaded with the links below.
    const entryRow = (id) => {
        const c = canon(id), e = entryById.get(c);
        if (e) return { id: c, kind: e.kind, skill: e.skill, name: e.name, lane: e.lane, source: 'build-list' };
        const lp = linkProps.get(c) || linkProps.get(id);
        if (lp) return { id: c, kind: lp.kind || null, skill: lp.skill || null, name: lp.name || null, lane: lp.skill ? bl.laneFor(lp.skill) : null, source: 'links-proposal' };
        return { id: c, kind: null, skill: null, name: null, lane: null, source: 'unknown' };
    };

    const units = [];
    const mapEvidence = [];
    for (const g of GRADES) {
        const G = seq.grades.find((x) => String(x.id) === g.seq);
        if (!G) throw new Error(`wrm-sequence.json has no grade ${g.seq}`);
        if (G.weeks && typeof G.weeks === 'object') for (const [w, v] of Object.entries(G.weeks)) weekOf[`${g.seq}|${w}`] = v.weekOf;
        const L = links[g.year];
        const linkLessonByTitle = new Map(Object.entries(L.lessons || {}).map(([id, v]) => [slug(v.title), { id, ...v }]));
        const byBlock = new Map();
        const pendingBuild = [];
        let ev = { grade: g.label, year: g.year, lessons: 0, ccss: 0, at: 0, above: 0, below: 0 };
        for (const u of G.units) for (const l of u.lessons) {
            const lw = (l.weeks || []).map(wk).filter((n) => n != null);
            const firstWeek = lw.length ? Math.min(...lw) : null;
            const ccss = Array.isArray(l.ccss) ? l.ccss : [];
            const isCcss = ccss.length > 0 && l.flag !== 'non-ccss';
            ev.lessons += 1;
            if (ccss.length) { ev.ccss += 1; const cg = ccssGrade(ccss[0]); if (cg === g.num) ev.at += 1; else if (cg > g.num) ev.above += 1; else ev.below += 1; }
            let lesson;
            if (l.step) {
                const rec = stepRec.get(l.step) || {};
                const sl = (links[l.step.split('.')[0]] || L).steps[l.step] || null;
                const direct = sl ? sl.direct.map((d) => skillRow(d.key, d.opts)) : [];
                const tagged = wrm.skillsForWrmStep(l.step).map((k) => skillRow(k));
                const skills = direct.length ? direct : tagged;
                lesson = {
                    kind: 'wrm', id: l.step, title: l.title || rec.title, ccss, ee: rec.ee || [], flag: l.flag || rec.flag || 'native',
                    ccssLesson: isCcss, power: !!l.power, weeks: l.weeks || [], firstWeek, strands: l.strands || '',
                    domainUnit: u.id, verdict: sl ? sl.verdict : (tagged.length ? 'full' : 'gap'), skillSource: direct.length ? 'links' : 'SKILL_WRM',
                    skills, partial: sl ? sl.partial.map((d) => skillRow(d.key, d.opts)) : [],
                    build: uniq([...(sl ? sl.build : []), ...wrm.proposalsForWrmStep(l.step).map((p) => p.id)]).map(entryRow),
                    missing: sl ? sl.missing : '', long: longByStep.get(l.step) || null,
                };
                const blk = l.step.replace(/\.S\d+$/, '');
                if (l.step.split('.')[0] !== g.year) {
                    // A step of another White Rose year that this grade teaches (a review or copied-in lesson): it joins the
                    // grade's own block of the same CCSS domain taught nearest in time, like a BUILD lesson with no block.
                    lesson.fromYear = l.step.split('.')[0];
                    pendingBuild.push(lesson);
                } else {
                    if (!byBlock.has(blk)) byBlock.set(blk, []);
                    byBlock.get(blk).push(lesson);
                }
            } else {
                const guess = `${siteGrade(g)}|-|${slug(l.title)}`;
                const ll = (L.lessons && L.lessons[guess] ? { id: guess, ...L.lessons[guess] } : null) || linkLessonByTitle.get(slug(l.title)) || null;
                const siteId = ll ? ll.id : guess;
                lesson = {
                    kind: l.type === 'build' ? 'build' : (l.type || 'other'), id: siteId, title: l.title, ccss, ee: ll && ll.site ? ll.site.ee || [] : [],
                    flag: l.flag || 'committee', ccssLesson: isCcss, power: !!l.power, weeks: l.weeks || [], firstWeek, strands: l.strands || '',
                    domainUnit: u.id, verdict: ll ? ll.verdict : 'gap', skillSource: 'links',
                    skills: ll ? ll.direct.map((d) => skillRow(d.key, d.opts)) : [], partial: ll ? (ll.partial || []).map((d) => skillRow(d.key, d.opts)) : [],
                    build: uniq(ll ? ll.build : []).map(entryRow), missing: ll ? ll.missing : '', long: longBySite.get(siteId) || null,
                    siteBlock: ll && ll.site ? ll.site.block : null, domain: u.domain,
                };
                if (lesson.siteBlock) {
                    if (!byBlock.has(lesson.siteBlock)) byBlock.set(lesson.siteBlock, []);
                    byBlock.get(lesson.siteBlock).push(lesson);
                } else pendingBuild.push(lesson);
            }
            // A long lesson already made names the skills it practises (data/curriculum/detailed-lessons.json skills.used).
            if (lesson.long && lesson.long.skills.length) {
                const have = new Set(lesson.skills.map((s) => s.key));
                for (const k of lesson.long.skills) if (!have.has(k)) { lesson.skills.push(skillRow(k)); have.add(k); }
                if (lesson.skillSource !== 'links' || !lesson.skills.length) lesson.skillSource = 'detailed lesson';
            }
            lesson.short = lesson.skills.some((s) => SHORT_PASSED.has(s.key)) ? 'sample passed (lessons-r4)'
                : lesson.skills.some((s) => SHORT_DATA.has(s.key)) ? 'lesson data exists' : null;
            lesson.shape = shapeOf(lesson.title, uniq(lesson.skills.map((s) => s.lane)), ccss, lesson.id);
        }
        mapEvidence.push(ev);
        // A BUILD lesson with no site block joins the block of the same grade and CCSS domain taught nearest in time.
        const blockInfo = () => [...byBlock.entries()].map(([b, ls]) => ({
            b, start: median(ls.map((x) => x.firstWeek).filter((n) => n != null)),
            doms: new Set(ls.flatMap((x) => x.ccss.map(ccssDomain))), units: new Set(ls.map((x) => x.domainUnit)),
        }));
        for (const lesson of pendingBuild) {
            const dom = ccssDomain(lesson.ccss[0]);
            const cands = blockInfo().filter((x) => x.doms.has(dom) || x.units.has(lesson.domainUnit));
            cands.sort((a, b) => Math.abs((a.start ?? 99) - (lesson.firstWeek ?? 99)) - Math.abs((b.start ?? 99) - (lesson.firstWeek ?? 99)) || a.b.localeCompare(b.b));
            const target = cands.length ? cands[0].b : `${g.year}.BUILD`;
            lesson.attachedBy = cands.length ? 'nearest same-domain block' : 'no block';
            if (!byBlock.has(target)) byBlock.set(target, []);
            byBlock.get(target).push(lesson);
        }
        const gUnits = [...byBlock.entries()].map(([b, ls]) => {
            const br = blockRec.get(b) || { id: b, year: g.year, term: '-', number: 999, name: 'Awsaj build lessons' };
            const starts = ls.map((x) => x.firstWeek).filter((n) => n != null);
            const start = median(starts);
            return { grade: g.label, gradeNum: g.num, year: g.year, block: b, term: br.term, blockNumber: br.number, blockName: br.name,
                start, first: starts.length ? Math.min(...starts) : null, last: starts.length ? Math.max(...ls.flatMap((x) => (x.weeks || []).map(wk).filter((n) => n != null))) : null,
                lessons: ls.sort((a, b) => (a.firstWeek ?? 99) - (b.firstWeek ?? 99) || (a.kind === 'build') - (b.kind === 'build') || a.id.localeCompare(b.id, 'en', { numeric: true })) };
        });
        gUnits.sort((a, b) => (a.start ?? 99) - (b.start ?? 99) || a.blockNumber - b.blockNumber || a.block.localeCompare(b.block));
        gUnits.forEach((u, i) => { u.rankInGrade = i + 1; });
        units.push(...gUnits);
    }

    // ---------------------------------------------------------------- order
    let ordered;
    if (ORDER === 'week') ordered = [...units].sort((a, b) => (a.start ?? 99) - (b.start ?? 99) || a.gradeNum - b.gradeNum || a.blockNumber - b.blockNumber);
    else ordered = [...units].sort((a, b) => a.rankInGrade - b.rankInGrade || a.gradeNum - b.gradeNum);
    if (FROM && wk(FROM) != null) {
        const f = wk(FROM);
        ordered = [...ordered.filter((u) => (u.start ?? 99) >= f), ...ordered.filter((u) => (u.start ?? 99) < f)];
    }

    // ---------------------------------------------------------------- per-unit summary
    const firstSeen = new Map();
    const out = ordered.map((u, i) => {
        const ccssLessons = u.lessons.filter((l) => l.ccssLesson);
        const parked = u.lessons.filter((l) => !l.ccssLesson);
        const skills = new Map();
        for (const l of ccssLessons) for (const s of l.skills) if (!skills.has(s.key)) skills.set(s.key, s);
        const builds = new Map();
        for (const l of ccssLessons) for (const b of l.build) if (!builds.has(b.id)) builds.set(b.id, b);
        const lanes = {};
        for (const s of skills.values()) { const x = lanes[s.lane] || (lanes[s.lane] = { skills: 0, passed: 0 }); x.skills += 1; if (s.passed) x.passed += 1; }
        const newSkills = [...skills.keys()].filter((k) => !firstSeen.has(k));
        for (const k of skills.keys()) if (!firstSeen.has(k)) firstSeen.set(k, i + 1);
        const longPassed = ccssLessons.filter((l) => l.long && l.long.status === 'passed').length;
        const ready = ccssLessons.filter((l) => l.verdict === 'full' && l.skills.length && l.skills.every((s) => s.passed)).length;
        const skillsOnly = ccssLessons.filter((l) => l.verdict === 'full' && l.skills.length && !l.skills.every((s) => s.passed)).length;
        const blocked = ccssLessons.length - ready - skillsOnly;
        return {
            n: i + 1, round: u.rankInGrade, id: `G${u.grade}-${u.block}`, grade: u.grade, year: u.year, block: u.block, term: u.term,
            name: u.blockName, start: W(u.start), span: `${W(u.first)}-${W(u.last)}`,
            weekOf: weekOf[`${u.grade}|${W(u.start)}`] || null,
            ccss: uniq(ccssLessons.flatMap((l) => l.ccss)).sort(),
            counts: { lessons: u.lessons.length, ccssLessons: ccssLessons.length, builds: ccssLessons.filter((l) => l.kind === 'build').length,
                parkedNonCcss: parked.length, productsToMake: ccssLessons.length * 2 - longPassed, longPassed,
                ready, skillsNotPassed: skillsOnly, blockedByGaps: blocked,
                skills: skills.size, skillsPassed: [...skills.values()].filter((s) => s.passed).length, newSkills: newSkills.length, buildEntries: builds.size },
            shapes: uniq(ccssLessons.map((l) => l.shape)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1))),
            lanes, skills: [...skills.values()], newSkills, builds: [...builds.values()],
            lessons: u.lessons.map((l) => ({ kind: l.kind, id: l.id, title: l.title, ccss: l.ccss, flag: l.flag, ccssLesson: l.ccssLesson,
                weeks: l.weeks, verdict: l.verdict, skillSource: l.skillSource, skills: uniq(l.skills.map((s) => s.key + (s.passed ? ' [8/10]' : ''))),
                partial: uniq(l.partial.map((s) => s.key)), build: l.build.map((b) => b.id), shape: l.shape, short: l.short, long: l.long ? `${l.long.id}: ${l.long.status}` : null,
                ...(l.attachedBy ? { attachedBy: l.attachedBy } : {}), ...(l.fromYear ? { fromYear: l.fromYear } : {}) })),
        };
    });

    // ---------------------------------------------------------------- totals
    const T = { units: out.length, lessons: 0, ccssLessons: 0, builds: 0, parked: 0, products: 0, longPassed: 0, ready: 0, skillsNotPassed: 0, blocked: 0 };
    for (const u of out) { T.lessons += u.counts.lessons; T.ccssLessons += u.counts.ccssLessons; T.builds += u.counts.builds; T.parked += u.counts.parkedNonCcss;
        T.products += u.counts.productsToMake; T.longPassed += u.counts.longPassed; T.ready += u.counts.ready; T.skillsNotPassed += u.counts.skillsNotPassed; T.blocked += u.counts.blockedByGaps; }
    const allSkills = new Map();
    for (const u of out) for (const s of u.skills) if (!allSkills.has(s.key)) allSkills.set(s.key, { ...s, firstUnit: u.n });
    const allBuilds = new Map();
    for (const u of out) for (const b of u.builds) if (!allBuilds.has(b.id)) allBuilds.set(b.id, { ...b, firstUnit: u.n });
    const rounds = [];
    for (const u of out) {
        const r = rounds[u.round - 1] || (rounds[u.round - 1] = { round: u.round, units: 0, ccssLessons: 0, buildLessons: 0, products: 0, newSkills: 0, newSkillsPassed: 0, builds: 0, lanes: {} });
        r.units += 1; r.ccssLessons += u.counts.ccssLessons; r.buildLessons += u.counts.builds; r.products += u.counts.productsToMake;
        for (const k of u.newSkills) { const s = allSkills.get(k); r.newSkills += 1; if (s.passed) r.newSkillsPassed += 1; r.lanes[s.lane] = (r.lanes[s.lane] || 0) + (s.passed ? 0 : 1); }
    }
    for (const b of allBuilds.values()) { const u = out[b.firstUnit - 1]; rounds[u.round - 1].builds += 1; }
    const shapeCount = {};
    for (const u of out) for (const l of u.lessons) if (l.ccssLesson) shapeCount[l.shape] = (shapeCount[l.shape] || 0) + 1;

    const json = {
        meta: {
            what: 'Lessons-first work queue (owner 2026-11-07): every K-5 unit in build order, with its lessons, CCSS, skills, 8/10 state, gaps and proposed lesson shapes',
            generatedBy: 'node tests/scripts/ws-lessons-first-queue.cjs' + (ORDER === 'week' ? ' --order week' : '') + (FROM ? ` --from ${FROM}` : ''),
            plan: 'design/LESSONS_FIRST_PLAN.md',
            order: ORDER === 'week' ? 'by start week, then grade' : 'round r = every grade\'s r-th unit by start week, K..5',
            gradeRule: steps.meta.gradeRule,
            sources: ['data/curriculum/wrm-sequence.json', 'data/curriculum/wrm-steps.json', 'data/curriculum/links/Y1..Y6.json', 'data/curriculum/detailed-lessons.json',
                'js/modules/wrm.js', 'js/modules/build-list.js', 'js/modules/redesign-passed.js', 'js/modules/lessons/prereqs.js'],
            shapes: SHAPES,
        },
        totals: { ...T, skills: allSkills.size, skillsPassed: [...allSkills.values()].filter((s) => s.passed).length, buildEntries: allBuilds.size,
            buildEntriesLinksOnly: [...allBuilds.values()].filter((b) => b.source === 'links-proposal').length, buildEntriesUnknown: [...allBuilds.values()].filter((b) => b.source === 'unknown').length, shapeCount },
        gradeMapEvidence: mapEvidence,
        rounds,
        units: out,
    };

    // ---------------------------------------------------------------- markdown
    const md = [];
    const p = (s = '') => md.push(s);
    const skillTxt = (s) => `\`${s.key}\`${s.passed ? ' **8/10**' : ''}`;
    p('# Lessons-first queue (generated)');
    p();
    p(`Generated by \`${json.meta.generatedBy}\` from the school pacing and the skill records. Do not edit by hand: change the`);
    p('sources (or the script) and re-run it; `--check` fails when this file is stale. The plan is `design/LESSONS_FIRST_PLAN.md`.');
    p();
    p(`**Order:** ${json.meta.order}. **Unit:** one White Rose block as one school grade teaches it, plus the CCSS BUILD lessons the`);
    p('school places in it. **CCSS lesson:** a lesson with a CCSS code and no "non-ccss" flag; each needs a short and a long lesson.');
    p('**Shape:** a heuristic proposal (LESSON_LIBRARY_PLAN §6 archetypes) until `design/lessons/SHAPES.md` (E4) decides it.');
    p();
    p('## Totals');
    p();
    p('| Units | Lessons in the sequence | CCSS lessons | of them CCSS BUILD | Parked (non-CCSS) | Products to make (short + long) | Long lessons passed | CCSS lessons ready (every skill 8/10) | Skills exist, not yet 8/10 | Blocked by a gap | Skills | Skills at 8/10 | Build-list entries |');
    p('|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|');
    p(`| ${T.units} | ${T.lessons} | ${T.ccssLessons} | ${T.builds} | ${T.parked} | ${T.products} | ${T.longPassed} | ${T.ready} | ${T.skillsNotPassed} | ${T.blocked} | ${json.totals.skills} | ${json.totals.skillsPassed} | ${json.totals.buildEntries} (${json.totals.buildEntriesLinksOnly} only in the links files' proposals, ${json.totals.buildEntriesUnknown} unknown) |`);
    p();
    p('Proposed shapes over all CCSS lessons: ' + Object.entries(shapeCount).sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1))).map(([k, v]) => `${k} ${SHAPES[k].split(' (')[0]} ${v}`).join(' · ') + '.');
    p();
    p('## Grade-mapping evidence (owner question Q1)');
    p();
    p('Primary CCSS code of each lesson of the school sequence, against the school grade that teaches it (rule: WRM Year N = grade N-1).');
    p();
    p('| School grade | WRM year | Lessons | with CCSS | primary code at the grade | above | below |');
    p('|---|---|--:|--:|--:|--:|--:|');
    for (const e of mapEvidence) p(`| ${e.grade} | ${e.year} | ${e.lessons} | ${e.ccss} | ${e.at} (${Math.round(100 * e.at / Math.max(1, e.ccss))} %) | ${e.above} | ${e.below} |`);
    p();
    p('## Rounds');
    p();
    p('A round is every grade\'s next unit. "New skills" are skills no earlier unit needed; "to bring to 8/10" are those not yet passed, by lane (the lane owns the generator).');
    p();
    p('| Round | Units | CCSS lessons | of them BUILD | Products | New skills | of them at 8/10 | New build entries | New skills to bring to 8/10, by lane |');
    p('|--:|--:|--:|--:|--:|--:|--:|--:|---|');
    for (const r of rounds) p(`| ${r.round} | ${r.units} | ${r.ccssLessons} | ${r.buildLessons} | ${r.products} | ${r.newSkills} | ${r.newSkillsPassed} | ${r.builds} | ${Object.entries(r.lanes).filter(([, v]) => v).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k} ${v}`).join(', ') || '-'} |`);
    p();
    p('## The queue');
    p();
    p('| # | Round | Unit | Grade | Block | Starts | CCSS lessons (build) | Ready / skills not 8/10 / gaps | Skills (8/10) | New skills | Build entries | Shapes |');
    p('|--:|--:|---|---|---|---|--:|---|--:|--:|--:|---|');
    for (const u of out) p(`| ${u.n} | ${u.round} | [${u.id}](#${u.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}) | ${u.grade} | ${u.block} ${u.name} (${u.term}) | ${u.start}${u.weekOf ? ` (${u.weekOf})` : ''} | ${u.counts.ccssLessons} (${u.counts.builds}) | ${u.counts.ready} / ${u.counts.skillsNotPassed} / ${u.counts.blockedByGaps} | ${u.counts.skills} (${u.counts.skillsPassed}) | ${u.counts.newSkills} | ${u.counts.buildEntries} | ${u.shapes.join(' ')} |`);
    p();
    p('## Units in detail');
    for (const u of out) {
        p();
        p(`### ${u.id}`);
        p();
        p(`**#${u.n}, round ${u.round}.** Grade ${u.grade} · ${u.year} ${u.term} block ${u.block}: ${u.name}. Taught ${u.span} (start ${u.start}${u.weekOf ? `, week of ${u.weekOf}` : ''}).`);
        p(`CCSS: ${u.ccss.join(', ') || '-'}. Shapes: ${u.shapes.map((s) => `${s} ${SHAPES[s].split(' (')[0]}`).join(', ') || '-'}.`);
        p(`Lanes: ${Object.entries(u.lanes).map(([k, v]) => `${k} ${v.passed}/${v.skills} at 8/10`).join(' · ') || '-'}.`);
        p();
        p('| Lesson | Title | CCSS | Weeks | Verdict | Skills (8/10 marked) | Build entries | Shape | Short | Long |');
        p('|---|---|---|---|---|---|---|---|---|---|');
        for (const l of u.lessons) {
            const id = l.ccssLesson ? `\`${l.id}\`` : `~~${l.id}~~ (parked: ${l.flag})`;
            const sk = l.skills.map((s) => `\`${s.replace(' [8/10]', '')}\`${s.endsWith('[8/10]') ? ' **8/10**' : ''}`).join(', ') || '-';
            p(`| ${id}${l.kind === 'build' ? ' BUILD' : ''}${l.fromYear ? ` (${l.fromYear} step, review)` : ''}${l.attachedBy ? ` (${l.attachedBy})` : ''} | ${String(l.title).replace(/\|/g, '/')} | ${l.ccss.join(', ') || '-'} | ${(l.weeks || []).join(' ') || '-'} | ${l.verdict} | ${sk}${l.partial.length ? `; partial: ${l.partial.map((k) => `\`${k}\``).join(', ')}` : ''} | ${l.build.join(', ') || '-'} | ${l.shape} | ${l.short || '-'} | ${l.long || '-'} |`);
        }
        if (u.builds.length) {
            p();
            p('Build entries: ' + u.builds.map((b) => `\`${b.id}\` (${b.kind || '?'} ${b.skill || '?'}${b.lane ? `, ${b.lane}` : ''}${b.source === 'links-proposal' ? ', links proposal only' : b.source === 'unknown' ? ', UNKNOWN id: re-check the links file' : ''})`).join('; ') + '.');
        }
    }
    p();
    p('## Every skill the queue needs, by lane');
    p();
    const byLane = {};
    for (const s of allSkills.values()) (byLane[s.lane] || (byLane[s.lane] = [])).push(s);
    p('| Lane | Skills | at 8/10 | First needed by unit | Skills not yet at 8/10 (first unit) |');
    p('|---|--:|--:|--:|---|');
    for (const [lane, list] of Object.entries(byLane).sort((a, b) => Math.min(...a[1].map((s) => s.firstUnit)) - Math.min(...b[1].map((s) => s.firstUnit)) || a[0].localeCompare(b[0]))) {
        list.sort((a, b) => a.firstUnit - b.firstUnit || a.key.localeCompare(b.key));
        p(`| ${lane} | ${list.length} | ${list.filter((s) => s.passed).length} | ${list[0].firstUnit} | ${list.filter((s) => !s.passed).map((s) => `\`${s.key}\` (${s.firstUnit})`).join(', ')} |`);
    }
    p();
    const mdText = md.join('\n') + '\n';
    const jsonText = JSON.stringify(json, null, 1) + '\n';

    if (CHECK) {
        const stale = [];
        if (!fs.existsSync(OUT_JSON) || fs.readFileSync(OUT_JSON, 'utf8') !== jsonText) stale.push(path.relative(ROOT, OUT_JSON));
        if (!JSON_ONLY && (!fs.existsSync(OUT_MD) || fs.readFileSync(OUT_MD, 'utf8') !== mdText)) stale.push(path.relative(ROOT, OUT_MD));
        console.log(stale.length ? `ws-lessons-first-queue: FAIL (stale: ${stale.join(', ')}; run node tests/scripts/ws-lessons-first-queue.cjs)` : 'ws-lessons-first-queue: OK');
        process.exit(stale.length ? 1 : 0);
    }
    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(OUT_JSON, jsonText);
    if (!JSON_ONLY) fs.writeFileSync(OUT_MD, mdText);
    console.log(`ws-lessons-first-queue: wrote ${path.relative(ROOT, OUT_JSON)}${JSON_ONLY ? '' : ` and ${path.relative(ROOT, OUT_MD)}`}: ${T.units} units, ${T.ccssLessons} CCSS lessons (${T.builds} BUILD), ${T.products} products, ${json.totals.skills} skills (${json.totals.skillsPassed} at 8/10), ${json.totals.buildEntries} build entries`);
}

main().catch((e) => { console.log(`ws-lessons-first-queue: FAIL\n  ${e && e.stack ? e.stack : e}`); process.exit(1); });
