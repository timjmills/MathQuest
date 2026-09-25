#!/usr/bin/env node
/*
 * ws-standards — the standards database and the skill -> standard map.
 *
 *   node tests/scripts/ws-standards.cjs              # GATE: validate, print ws-standards: OK / FAIL
 *   node tests/scripts/ws-standards.cjs --report     # also write design/STANDARDS_COVERAGE.md and
 *                                                    # design/BUILD_LIST.md
 *   node tests/scripts/ws-standards.cjs --strict     # ALSO fail while any CCSS standard, lettered
 *                                                    # part or Essential Element lacks a FULL-coverage
 *                                                    # verdict (js/modules/standards-audit.js), or a
 *                                                    # build-list entry lacks its spec. Fails today by
 *                                                    # design: the build list is not built yet.
 *   node tests/scripts/ws-standards.cjs --write-db   # regenerate js/modules/standards-db.js from
 *                                                    # data/standards/*.json (then validate)
 *
 * The database is data/standards/ccss-math.json (CCSS K-6 with the Wisconsin 2021 crosswalk) and
 * data/standards/ee-math.json (Wisconsin Essential Elements K-6). The browser reads a compact copy,
 * js/modules/standards-db.js, which this script generates and checks is in sync.
 *
 * Checks (any failure exits 1):
 *   - database: unique codes, parents and sub-standards agree, counts match the meta block,
 *     every CCSS -> EE and EE -> CCSS link points at a real record;
 *   - standards-db.js matches the JSON (run --write-db after editing the JSON);
 *   - map: every live skill in SKILLS has an entry, every entry is a live skill, every code in it
 *     exists in the database (never an invented code), an empty entry carries a reason or is a
 *     mixed pool, an approximate entry carries a note;
 *   - every retired skill resolves through skill-aliases.js to a mapped skill;
 *   - the full-coverage audit (js/modules/standards-audit.js) is sound: every CCSS leaf and every EE
 *     has a verdict, every skill a verdict cites is live and carries the code, every partial or gap
 *     names its missing clauses and a proposal that exists in the one build list
 *     (js/modules/build-list.js + WRM_PROPOSALS), every proposal closes something, every recorded
 *     tag fix is applied. (Structure only: a partial or gap verdict does not fail the default run.)
 *
 * Two coverage numbers are printed. "Tagged" is the old count (a skill is tagged to the code). "Full"
 * is the audit's: the tagged skills teach and assess every clause of the standard.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..', '..');
const DATA = path.join(ROOT, 'data', 'standards');
const DB_JS = path.join(ROOT, 'js', 'modules', 'standards-db.js');
const REPORT = path.join(ROOT, 'design', 'STANDARDS_COVERAGE.md');
const args = process.argv.slice(2);
const WRITE_DB = args.includes('--write-db');
const WRITE_REPORT = args.includes('--report');
const STRICT = args.includes('--strict');
const BUILD_LIST = path.join(ROOT, 'design', 'BUILD_LIST.md');
const GRADES = ['K', '1', '2', '3', '4', '5', '6'];

const failures = [];
const fail = (m) => failures.push(m);

function loadJSON(name) { return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8')); }

/* ------------------------------------------------------------ database checks */
function checkDatabase(cc, ee) {
    const codes = new Map();
    for (const s of cc.standards) {
        if (codes.has(s.code)) fail(`ccss: duplicate code ${s.code}`);
        codes.set(s.code, s);
        if (!GRADES.includes(s.grade)) fail(`ccss: ${s.code} has grade ${s.grade}`);
        if (!s.text || s.text.length < 8) fail(`ccss: ${s.code} has no descriptor`);
        if (!cc.meta.domains[s.domainCode]) fail(`ccss: ${s.code} has unknown domain ${s.domainCode}`);
        const want = s.parent ? /^(K|\d)\.[A-Z]{1,3}\.[A-D]\.\d{1,2}[a-d]$/ : /^(K|\d)\.[A-Z]{1,3}\.[A-D]\.\d{1,2}$/;
        if (!want.test(s.code)) fail(`ccss: malformed code ${s.code}`);
    }
    for (const s of cc.standards) {
        if (s.parent && !codes.has(s.parent)) fail(`ccss: ${s.code} parent ${s.parent} missing`);
        for (const sub of s.subs || []) if (!codes.has(sub)) fail(`ccss: ${s.code} sub ${sub} missing`);
    }
    const top = cc.standards.filter((s) => !s.parent);
    if (top.length !== cc.meta.counts.standards) fail(`ccss: ${top.length} standards, meta says ${cc.meta.counts.standards}`);
    if (cc.standards.length - top.length !== cc.meta.counts.subStandards) fail('ccss: sub-standard count differs from meta');
    const eeCodes = new Map();
    for (const e of ee.essentialElements) {
        if (eeCodes.has(e.code)) fail(`ee: duplicate code ${e.code}`);
        eeCodes.set(e.code, e);
        if (!/^M\.EE\.(K|\d)\.[A-Z]{1,3}\.\d{1,2}(-\d{1,2})?$/.test(e.code)) fail(`ee: malformed code ${e.code}`);
        if (!e.text) fail(`ee: ${e.code} has no descriptor`);
        for (const c of e.linkedCcss) if (!codes.has(c)) fail(`ee: ${e.code} links unknown CCSS ${c}`);
    }
    if (ee.essentialElements.length !== ee.meta.counts.essentialElements) fail('ee: count differs from meta');
    for (const s of top) for (const c of s.ee || []) if (!eeCodes.has(c)) fail(`ccss: ${s.code} links unknown EE ${c}`);
    return { codes, eeCodes };
}

/* ------------------------------------------------------------ standards-db.js */
function dbSource(cc, ee) {
    const clusters = {};
    const ccss = cc.standards.map((s) => {
        clusters[`${s.grade}.${s.domainCode}.${s.cluster}`] = s.clusterText;
        const r = { code: s.code, short: s.short, grade: s.grade, domain: s.domainCode, cluster: s.cluster, text: s.text };
        if (s.parent) r.parent = s.parent;
        if (s.subs && s.subs.length) r.subs = s.subs;
        if (s.ee && s.ee.length) r.ee = s.ee;
        if (s.wi && s.wi.length) r.wi = s.wi.map((w) => w.code);
        return r;
    });
    const ees = ee.essentialElements.map((e) => {
        const r = { code: e.code, grade: e.grade, domain: e.domainCode, text: e.text };
        if (e.subs.length) r.subs = e.subs.map((x) => ({ code: x.code, text: x.text }));
        if (e.linkedCcss.length) r.ccss = e.linkedCcss;
        r.wi = e.linkedWi;
        return r;
    });
    const wiOnly = cc.wiOnly.map((w) => ({ code: w.code, grade: w.grade, domain: w.domainCode, text: w.text, related: w.relatedCcss, note: w.note }));
    const j = (v) => JSON.stringify(v, null, 0);
    const lines = (arr) => `[\n${arr.map((x) => `    ${j(x)},`).join('\n')}\n]`;
    return `// standards-db.js — GENERATED by \`node tests/scripts/ws-standards.cjs --write-db\` from
// data/standards/ccss-math.json and data/standards/ee-math.json. Do not edit by hand: edit the
// JSON and regenerate. The JSON files hold the full records (sources, Wisconsin text, level
// descriptors); this is the compact copy the browser reads.
//
// Sources: ${Object.values(cc.meta.sources).map((s) => s.title).join('; ')}.

export const DOMAIN_NAMES = ${j(cc.meta.domains)};

export const CLUSTERS = ${JSON.stringify(clusters, null, 4)};

export const CCSS = ${lines(ccss)};

export const EE = ${lines(ees)};

export const WI_ONLY = ${lines(wiOnly)};
`;
}

/* ------------------------------------------------------------ the full-coverage audit */
const STATUS = ['full', 'partial', 'gap'];
const combine = (list) => (list.every((s) => s === 'full') ? 'full' : list.every((s) => s === 'gap') ? 'gap' : 'partial');

/**
 * Check js/modules/standards-audit.js and the one build list, and compute what the reports need:
 * { ccssRows, eeRows, tally, list, byId, closes, fixCount, kinds }. Structural problems go to fail().
 */
function checkAudit({ cc, ee, audit, bl, wrm, map, liveKeys, labels }) {
    const CA = audit.CCSS_AUDIT, EA = audit.EE_AUDIT;
    const ccByCode = new Map(cc.standards.map((s) => [s.code, s]));
    const eeByCode = new Map(ee.essentialElements.map((e) => [e.code, e]));
    const eeSubs = new Map(ee.essentialElements.map((e) => [e.code, (e.subs || []).map((x) => x.code)]));
    const wrmProps = wrm.WRM_PROPOSALS, stdProps = bl.STANDARD_PROPOSALS;
    const proposalIds = new Set([...Object.keys(wrmProps), ...Object.keys(stdProps)]);
    for (const id of Object.keys(stdProps)) if (wrmProps[id]) fail(`build list: ${id} is both a WRM and a standards proposal`);
    const tagged = (key, code) => {
        const e = map[key];
        if (!e) return false;
        const codes = code.startsWith('M.EE') ? e.ee : e.ccss;
        if (codes.includes(code)) return true;
        if (code.startsWith('M.EE')) return (eeSubs.get(code) || []).some((c) => codes.includes(c));
        const rec = ccByCode.get(code);
        return !!(rec && rec.subs && rec.subs.some((c) => codes.includes(c)));
    };
    const checkVerdict = (code, v) => {
        if (!v || !STATUS.includes(v.status)) { fail(`audit: ${code} has no valid status`); return; }
        if (!Array.isArray(v.by) || !Array.isArray(v.missing) || !Array.isArray(v.build)) { fail(`audit: ${code} needs by, missing and build lists`); return; }
        if (v.status === 'full' && (v.missing.length || v.build.length)) fail(`audit: ${code} is full but lists missing clauses or proposals`);
        if (v.status === 'full' && !v.by.length) fail(`audit: ${code} is full with no skill`);
        if (v.status === 'partial' && !v.by.length) fail(`audit: ${code} is partial with no skill (a gap?)`);
        if (v.status === 'gap' && v.by.length) fail(`audit: ${code} is a gap but names skills`);
        if (v.status !== 'full' && (!v.missing.length || !v.build.length)) fail(`audit: ${code} is ${v.status} and must name the missing clauses and a proposal`);
        for (const k of v.by) {
            if (!liveKeys.has(k)) fail(`audit: ${code} cites ${k}, which is not a live skill`);
            else if (!tagged(k, code)) fail(`audit: ${code} cites ${k}, which is not tagged to ${code} in standards.js`);
        }
        for (const id of v.build) if (!proposalIds.has(id)) fail(`audit: ${code} names proposal ${id}, which is not on the build list`);
    };
    // CCSS: every leaf (no parts) and every lettered part; parents only for their own clause
    const ccssRows = [];
    for (const s of cc.standards) {
        const hasSubs = !!(s.subs && s.subs.length);
        const v = CA[s.code];
        if (!hasSubs && !v) { fail(`audit: CCSS ${s.code} has no verdict`); continue; }
        if (v) checkVerdict(s.code, v);
        const own = v ? v.status : null;
        const status = hasSubs ? combine([...(own ? [own] : []), ...s.subs.map((c) => (CA[c] ? CA[c].status : 'gap'))]) : v.status;
        ccssRows.push({ code: s.code, grade: s.grade, parent: s.parent || '', text: s.text, leaf: !hasSubs, hasOwn: !!v, status,
            by: v ? v.by : [], missing: v ? v.missing : [], build: v ? v.build : [], note: v ? v.note : '',
            domain: s.domainCode, domainName: cc.meta.domains[s.domainCode], cluster: s.cluster, clusterText: s.clusterText });
    }
    for (const code of Object.keys(CA)) if (!ccByCode.has(code)) fail(`audit: ${code} is not a CCSS code`);
    const eeRows = [];
    for (const e of ee.essentialElements) {
        const v = EA[e.code];
        if (!v) { fail(`audit: EE ${e.code} has no verdict`); continue; }
        checkVerdict(e.code, v);
        eeRows.push({ code: e.code, grade: e.grade, text: e.text, ccss: e.linkedCcss, status: v.status, by: v.by, missing: v.missing, build: v.build, note: v.note });
    }
    for (const code of Object.keys(EA)) if (!eeByCode.has(code)) fail(`audit: ${code} is not an Essential Element`);

    // the build list
    const list = bl.buildList();
    const byId = new Map(list.map((e) => [e.id, e]));
    const closes = new Map(list.map((e) => [e.id, []]));
    for (const r of [...ccssRows, ...eeRows]) for (const id of r.build) if (closes.has(id)) closes.get(id).push(r.code);
    const kinds = { new: 0, option: 0, repair: 0 };
    const allCodes = new Set([...ccByCode.keys(), ...eeByCode.keys(), ...ee.essentialElements.flatMap((e) => (e.subs || []).map((x) => x.code))]);
    for (const e of list) {
        kinds[e.kind] = (kinds[e.kind] || 0) + 1;
        if (e.source === 'standards') {
            for (const f of ['kind', 'skill', 'name', 'grade', 'family', 'teaches', 'answer', 'ladder']) if (!e[f]) fail(`proposal ${e.id}: missing ${f}`);
            if (!['new', 'option', 'repair'].includes(e.kind)) fail(`proposal ${e.id}: kind must be new, option or repair`);
            if (e.problemTypes.length < 3 || e.problemTypes.length > 5) fail(`proposal ${e.id}: needs 3-5 problem types`);
            if (e.misconceptions.length < 2) fail(`proposal ${e.id}: needs at least 2 misconceptions`);
            const hostProposed = list.some((q) => q.kind === 'new' && q.skill === e.skill);
            if (e.kind === 'new' && liveKeys.has(e.skill)) fail(`proposal ${e.id}: ${e.skill} is already a live skill`);
            if (e.kind !== 'new' && !liveKeys.has(e.skill) && !hostProposed) fail(`proposal ${e.id}: ${e.skill} is neither live nor proposed`);
            for (const k of e.also) if (!liveKeys.has(k)) fail(`proposal ${e.id}: also-skill ${k} is not live`);
            if (!(closes.get(e.id) || []).length) fail(`proposal ${e.id}: no audit verdict sends a clause to it (delete it, or name it in a verdict)`);
        }
        for (const c of [...e.standards, ...e.ee]) if (!allCodes.has(c)) fail(`proposal ${e.id}: unknown code ${c}`);
        for (const t of e.newTemplates || []) if (!bl.NEW_TEMPLATES[t]) fail(`proposal ${e.id}: new template ${t} is not in NEW_TEMPLATES`);
        for (const d of e.after) if (!byId.has(d)) fail(`proposal ${e.id}: depends on ${d}, which is not on the build list`);
        if (!bl.LANES[e.lane]) fail(`proposal ${e.id}: unknown lane ${e.lane}`);
    }
    for (const id of Object.keys(bl.WRM_EXTENSIONS)) {
        if (!wrmProps[id]) fail(`WRM extension ${id} is not a WRM proposal`);
        for (const c of [...bl.WRM_EXTENSIONS[id].ccss, ...bl.WRM_EXTENSIONS[id].ee]) if (!allCodes.has(c)) fail(`WRM extension ${id}: unknown code ${c}`);
    }
    // tag fixes are applied
    const fixCount = { 'mis-tag': 0, flag: 0, add: 0 };
    for (const f of audit.TAG_FIXES) {
        fixCount[f.kind] = (fixCount[f.kind] || 0) + 1;
        const e = map[f.skill];
        if (!e) { fail(`tag fix: ${f.skill} is not in SKILL_STANDARDS`); continue; }
        const has = (c) => (c.startsWith('M.EE') ? e.ee : e.ccss).includes(c);
        for (const c of f.remove) if (has(c)) fail(`tag fix: ${f.skill} still carries ${c}`);
        for (const c of f.add) if (!has(c)) fail(`tag fix: ${f.skill} should carry ${c}`);
    }
    const t = (rows) => {
        const o = { total: 0, full: 0, partial: 0, gap: 0, byGrade: {} };
        for (const r of rows) {
            const g = o.byGrade[r.grade] || (o.byGrade[r.grade] = { total: 0, full: 0, partial: 0, gap: 0 });
            o.total += 1; g.total += 1; o[r.status] += 1; g[r.status] += 1;
        }
        return o;
    };
    const tally = { top: t(ccssRows.filter((r) => !r.parent)), leaf: t(ccssRows.filter((r) => r.leaf)), ee: t(eeRows) };
    return { ccssRows, eeRows, tally, list, byId, closes, fixCount, kinds, labels, fixes: audit.TAG_FIXES, bl };
}

/* ------------------------------------------------------------ report */
function pct(n, d) { return d ? `${Math.round((100 * n) / d)}%` : '-'; }
const FAMILY_NAMES = { counting: 'Counting and early number', operations: 'Operations', placevalue: 'Place value', algebra: 'Algebra and patterns',
    fractions: 'Fractions', decimals: 'Decimals and percents', ratio: 'Ratio and proportion', geometry: 'Geometry', measurement: 'Measurement, time and money',
    data: 'Data and statistics', integers: 'Integers', number_theory: 'Number theory' };
const MARK = { full: 'FULL', partial: 'PARTIAL', gap: 'GAP' };

function impactOf(A) { return (e) => (A.closes.get(e.id) || []).length * 2 + e.wrmSteps.length; }

function writeReport(cov, cc, ee, skillLabel, mapStats, A) {
    const out = [];
    const L = (s = '') => out.push(s);
    const sk = (k) => `${skillLabel(k)} (\`${k}\`)`;
    const S = cov.summary, T = A.tally;
    L('# Standards coverage');
    L();
    L('Generated by `node tests/scripts/ws-standards.cjs --report`. Do not edit by hand: change the tags in');
    L('`js/modules/standards.js`, the verdicts in `js/modules/standards-audit.js`, the build list in');
    L('`js/modules/build-list.js` (with `js/modules/build-specs.js` and `WRM_PROPOSALS` in `js/modules/wrm.js`) or the');
    L('database in `data/standards/`, then regenerate. The build list itself, with every spec, is `design/BUILD_LIST.md`.');
    L();
    L('Two measures, and only the second is the owner\'s question ("are they fully covered by our current skills?"):');
    L();
    L('- **Tagged** — at least one live skill is tagged to the code without `approx` (the old measure, kept for continuity).');
    L('- **Full** — the audit (2026-09-25) read the tagged skills\' generators, options and seeded items and judged them');
    L('  against every clause of the standard: **FULL** (every clause is taught and assessed), **PARTIAL** (the missing');
    L('  clauses are named) or **GAP** (nothing teaches it). Every missing clause names the proposal that closes it.');
    L('  A parent standard with lettered parts is FULL only when its own clause and every part are FULL.');
    L();
    L('`node tests/scripts/ws-standards.cjs --strict` fails while anything below is not FULL. It fails today by design;');
    L('the default run (structure only) stays green.');
    L();
    L('Sources:');
    for (const s of Object.values(cc.meta.sources)) L(`- ${s.title}${s.url ? ` — ${s.url}` : ''}${s.file ? ` — ${s.file}` : ''}`);
    L();
    L('## Summary');
    L();
    L(`- Skills mapped: ${mapStats.live} live skills; ${mapStats.withCcss} carry at least one CCSS code, ${mapStats.approx} of them approximately; ${mapStats.pools} are mixed review pools; ${mapStats.reasoned} have no standard, with a reason (${mapStats.vocab} vocabulary games, ${mapStats.reasoned - mapStats.vocab} beyond grade 6).`);
    L(`- Database: ${cc.meta.counts.standards} CCSS standards K-6 plus ${cc.meta.counts.subStandards} lettered parts; ${ee.meta.counts.essentialElements} Wisconsin Essential Elements K-6.`);
    L(`- **Full coverage: CCSS ${T.top.full} of ${T.top.total} standards FULL, ${T.top.partial} PARTIAL, ${T.top.gap} GAP** (tagged: ${S.ccss.covered}). Counting leaves and lettered parts (${T.leaf.total}): ${T.leaf.full} FULL, ${T.leaf.partial} PARTIAL, ${T.leaf.gap} GAP.`);
    L(`- **Essential Elements: ${T.ee.full} of ${T.ee.total} FULL, ${T.ee.partial} PARTIAL, ${T.ee.gap} GAP** (tagged: ${S.ee.covered}).`);
    L(`- Tag fixes: ${A.fixCount['mis-tag']} mis-tags corrected, ${A.fixCount.flag} broken skill flagged, ${A.fixCount.add} missing tags added (below).`);
    L(`- The one build list: ${A.list.length} entries — ${A.kinds.new} new skills, ${A.kinds.option} options on existing skills, ${A.kinds.repair} repairs; ${A.list.filter((e) => e.source === 'wrm').length} from the White Rose audit (${Object.keys(A.list.filter((e) => e.source === 'wrm' && e.extension).reduce((o, e) => { o[e.id] = 1; return o; }, {})).length} of them extended to close standards clauses), ${A.list.filter((e) => e.source === 'standards').length} from this audit.`);
    L();
    L('| Level | CCSS standards: full / partial / gap | Leaves and parts: full / partial / gap | Essential Elements: full / partial / gap | Tagged (old): CCSS, EE |');
    L('|---|---|---|---|---|');
    for (const g of GRADES) {
        const a = T.top.byGrade[g] || { total: 0, full: 0, partial: 0, gap: 0 };
        const b = T.leaf.byGrade[g] || { total: 0, full: 0, partial: 0, gap: 0 };
        const c = T.ee.byGrade[g] || { total: 0, full: 0, partial: 0, gap: 0 };
        const oa = S.ccss.byGrade[g] || { total: 0, covered: 0 }, oe = S.ee.byGrade[g] || { total: 0, covered: 0 };
        L(`| ${g} | ${a.full} / ${a.partial} / ${a.gap} of ${a.total} (${pct(a.full, a.total)} full) | ${b.full} / ${b.partial} / ${b.gap} of ${b.total} | ${c.full} / ${c.partial} / ${c.gap} of ${c.total} (${pct(c.full, c.total)} full) | ${oa.covered}/${oa.total}, ${oe.covered}/${oe.total} |`);
    }
    L(`| **All** | **${T.top.full} / ${T.top.partial} / ${T.top.gap} of ${T.top.total} (${pct(T.top.full, T.top.total)} full)** | **${T.leaf.full} / ${T.leaf.partial} / ${T.leaf.gap} of ${T.leaf.total}** | **${T.ee.full} / ${T.ee.partial} / ${T.ee.gap} of ${T.ee.total} (${pct(T.ee.full, T.ee.total)} full)** | ${S.ccss.covered}/${S.ccss.total}, ${S.ee.covered}/${S.ee.total} |`);
    L();
    L('## Tag fixes made by this audit');
    L();
    L('Recorded in `TAG_FIXES` (`js/modules/standards-audit.js`) and applied to `SKILL_STANDARDS`; the gate checks they stay applied.');
    L();
    L('### Mis-tags (the skill did not teach the code)');
    L();
    for (const f of A.fixes.filter((x) => x.kind === 'mis-tag')) L(`- ${sk(f.skill)}: removed ${f.remove.join(', ')}${f.add.length ? `; now ${f.add.join(', ')}` : ''} — ${f.why}.`);
    L();
    L('### Flagged (the tag is right, the skill is broken)');
    L();
    for (const f of A.fixes.filter((x) => x.kind === 'flag')) L(`- ${sk(f.skill)}: ${f.why}.`);
    L();
    L('### Missing tags added (the skill teaches it; it was not tagged)');
    L();
    for (const f of A.fixes.filter((x) => x.kind === 'add')) L(`- ${sk(f.skill)}: + ${f.add.join(', ')} — ${f.why}.`);
    L();
    // build list by family
    L('## The build list, by family, in build order');
    L();
    L('Every partial and gap clause below names one of these. Order inside a family: dependencies first, then the');
    L('highest impact first (standards closed × 2 + White Rose steps closed). The full spec of each entry — problem types,');
    L('representation, answer, option ladder, misconceptions, lane and file ownership — is in `design/BUILD_LIST.md`.');
    L();
    const fams = [...new Set(A.list.map((e) => e.family))];
    const impact = impactOf(A);
    fams.sort((a, b) => A.list.filter((e) => e.family === b).reduce((s, e) => s + impact(e), 0) - A.list.filter((e) => e.family === a).reduce((s, e) => s + impact(e), 0));
    for (const f of fams) {
        const entries = A.bl.orderLane(A.list.filter((e) => e.family === f), impact);
        L(`### ${FAMILY_NAMES[f] || f} (${entries.length})`);
        L();
        L('| # | Entry | Kind | Closes standards | Closes WRM steps |');
        L('|---|---|---|---|---|');
        entries.forEach((e, i) => {
            const cl = A.closes.get(e.id) || [];
            L(`| ${i + 1} | **${e.name}** (\`${e.id}\`) | ${e.kind === 'new' ? `new \`${e.skill}\`` : `${e.kind} on \`${e.skill}\``} | ${cl.join(', ') || '-'} | ${e.wrmSteps.length || '-'} |`);
        });
        L();
    }
    // not full
    L('## Not fully covered, level by level');
    L();
    for (const g of GRADES) {
        const rows = A.ccssRows.filter((r) => r.grade === g && r.hasOwn && r.status !== 'full');
        const erows = A.eeRows.filter((r) => r.grade === g && r.status !== 'full');
        L(`### Level ${g}`);
        L();
        if (!rows.length && !erows.length) { L('Everything at this level is fully covered.'); L(); continue; }
        for (const r of [...rows, ...erows]) {
            L(`- **${r.code}** — ${MARK[r.status]}. ${r.text}  `);
            if (r.by.length) L(`  ${r.missing.length ? 'Taught in part by' : 'Own clause taught by'}: ${r.by.map(sk).join('; ')}  `);
            if (!r.missing.length) { L('  Its own clause is taught (the skills above); the lettered parts below are not all FULL.'); continue; }
            L(`  Missing: ${r.missing.join('; ')}  `);
            L(`  Build: ${r.build.map((id) => `${(A.byId.get(id) || {}).name || id} (\`${id}\`)`).join('; ')}`);
        }
        L();
    }
    L('## CCSS, standard by standard');
    L();
    for (const g of GRADES) {
        L(`### Level ${g}`);
        L();
        let dom = '', clus = '';
        for (const r of A.ccssRows.filter((x) => x.grade === g)) {
            if (r.domain !== dom) { dom = r.domain; clus = ''; L(`#### ${r.domainName} (${g}.${r.domain})`); L(); }
            if (r.cluster !== clus) { clus = r.cluster; L(`*${r.cluster}. ${r.clusterText}*`); L(); }
            const tagged = (cov.ccss.find((x) => x.code === r.code) || { skills: [] }).skills;
            L(`- ${r.parent ? '  ' : ''}**${r.code}** — ${MARK[r.status]}${r.leaf || r.hasOwn ? '' : ' (from its parts)'}. ${r.text}  `);
            if (r.by.length) L(`  ${r.status === 'full' || !r.missing.length ? 'Taught by' : 'In part'}: ${r.by.map(sk).join('; ')}${r.note ? ` — ${r.note}` : ''}  `);
            if (r.missing.length) L(`  Missing: ${r.missing.join('; ')} → ${r.build.map((id) => `\`${id}\``).join(', ')}  `);
            else if (r.status !== 'full') L('  Not FULL because of its lettered parts.  ');
            const extra = tagged.filter((k) => !r.by.includes(k));
            if (extra.length && (r.leaf || r.hasOwn)) L(`  Also tagged: ${extra.map((k) => `\`${k}\``).join(', ')}`);
        }
        L();
    }
    L('## Essential Elements, element by element');
    L();
    for (const g of GRADES) {
        L(`### Level ${g}`);
        L();
        for (const r of A.eeRows.filter((x) => x.grade === g)) {
            L(`- **${r.code}** — ${MARK[r.status]}. ${r.text}${r.ccss.length ? ` (CCSS ${r.ccss.join(', ')})` : ''}  `);
            if (r.by.length) L(`  ${r.status === 'full' ? 'Taught by' : 'In part'}: ${r.by.map(sk).join('; ')}${r.note ? ` — ${r.note}` : ''}  `);
            if (r.missing.length) L(`  Missing: ${r.missing.join('; ')} → ${r.build.map((id) => `\`${id}\``).join(', ')}`);
        }
        L();
    }
    fs.writeFileSync(REPORT, `${out.join('\n')}\n`);
}

function writeBuildList(A, skillLabel) {
    const out = [];
    const L = (s = '') => out.push(s);
    const { LANES, NEW_TEMPLATES, SHARED_APPEND_ONLY } = A.bl;
    const impact = impactOf(A);
    const lanes = Object.keys(LANES);
    L('# Build list');
    L();
    L('Generated by `node tests/scripts/ws-standards.cjs --report`. Do not edit by hand. Sources: `WRM_PROPOSALS`');
    L('(`js/modules/wrm.js`, the White Rose small-step audit) with their specs (`js/modules/build-specs.js`) and the');
    L('standards clauses they were extended to close (`WRM_EXTENSIONS`), and `STANDARD_PROPOSALS`');
    L('(`js/modules/build-list.js`, the CCSS + Essential Element full-coverage audit, `js/modules/standards-audit.js`).');
    L();
    L('**One list.** Where a standards clause was already on a White Rose proposal, that proposal was extended (its');
    L('"Extended for the standards" line) rather than a second entry added. Where White Rose does not teach the content');
    L('at that step, the standards audit added its own entry.');
    L();
    L('**Done means** (for every entry): researched per CLAUDE.md, built in the sheet kit (no legacy handlers), ≥ 8 on all');
    L('four `design/audit/RUBRIC.md` criteria on every page type and screen host and ≥ 8 on OPTIONS-RUBRIC O1-O6, graded');
    L('by an independent critic; then tag it in `SKILL_STANDARDS` (and `SKILL_WRM`), flip the verdicts it closes to');
    L('FULL in `standards-audit.js`, and delete the entry (the WRM gate and `ws-standards --strict` count down).');
    L();
    L('## Summary');
    L();
    L(`- ${A.list.length} entries: **${A.kinds.new} new skills, ${A.kinds.option} new options, ${A.kinds.repair} repairs**.`);
    L(`- ${A.list.filter((e) => e.source === 'wrm').length} from the White Rose audit (${A.list.filter((e) => e.source === 'wrm' && e.extension).length} extended for standards), ${A.list.filter((e) => e.source === 'standards').length} from the standards audit.`);
    L(`- They close ${A.tally.leaf.partial + A.tally.leaf.gap} CCSS leaves and parts and ${A.tally.ee.partial + A.tally.ee.gap} Essential Elements that are not FULL today, and every White Rose small step without a full-coverage skill.`);
    L(`- ${Object.keys(NEW_TEMPLATES).length} new sheet-kit templates are needed; each is owned by one lane.`);
    L();
    L('| Lane | Entries | New skills | Options | Repairs | Standards closed | WRM steps closed |');
    L('|---|---|---|---|---|---|---|');
    for (const id of lanes) {
        const es = A.list.filter((e) => e.lane === id);
        const codes = new Set(es.flatMap((e) => A.closes.get(e.id) || []));
        L(`| ${LANES[id].name} (\`${id}\`) | ${es.length} | ${es.filter((e) => e.kind === 'new').length} | ${es.filter((e) => e.kind === 'option').length} | ${es.filter((e) => e.kind === 'repair').length} | ${codes.size} | ${es.reduce((s, e) => s + e.wrmSteps.length, 0)} |`);
    }
    L();
    L('## File ownership');
    L();
    L('A lane owns its generator file(s) and templates below: only that lane edits them. Everyone may READ any file and');
    L('USE any template; a change to another lane\'s template is requested from its owner.');
    L();
    L('**Shared, append-only** (every lane appends its own entries in its own block, never edits another\'s; SKILLS');
    L('positions are share codes, so nothing is spliced and the integrator fixes the final append order at merge):');
    L();
    for (const f of SHARED_APPEND_ONLY) L(`- ${f}`);
    L();
    L('| Lane | Owns | New templates it builds |');
    L('|---|---|---|');
    for (const id of lanes) L(`| \`${id}\` ${LANES[id].name} | ${LANES[id].files.map((f) => `\`${f}\``).join('<br>')} | ${LANES[id].newTemplates.map((t) => `\`${t}\``).join(', ') || '-'} |`);
    L();
    L('### New templates');
    L();
    L('| Template | Owner lane | What | Used by |');
    L('|---|---|---|---|');
    for (const [t, d] of Object.entries(NEW_TEMPLATES)) {
        const users = A.list.filter((e) => (e.newTemplates || []).includes(t)).map((e) => e.id);
        L(`| \`${t}\` | \`${d.lane}\` | ${d.what} | ${users.length} entries |`);
    }
    L();
    L('## Build order');
    L();
    L('1. Each lane builds its new templates first (they unblock entries in other lanes: `bar-model`, `graph-axes`,');
    L('   `shape-grid`, `coord-grid` are the most shared).');
    L('2. Inside a lane, entries in the order below: dependencies first (`after`), then highest impact first');
    L('   (standards closed × 2 + White Rose steps closed).');
    L('3. Lanes run in parallel; an entry whose dependency is in another lane waits for it (named in its `After` line).');
    L();
    for (const id of lanes) {
        const es = A.bl.orderLane(A.list.filter((e) => e.lane === id), impact);
        if (!es.length) continue;
        L(`## Lane \`${id}\`: ${LANES[id].name} (${es.length})`);
        L();
        L(`Owns: ${LANES[id].files.map((f) => `\`${f}\``).join(', ')}${LANES[id].newTemplates.length ? `. Builds templates: ${LANES[id].newTemplates.map((t) => `\`${t}\``).join(', ')}` : ''}.`);
        L();
        es.forEach((e, i) => {
            const cl = A.closes.get(e.id) || [];
            const what = e.kind === 'new' ? `new skill \`${e.skill}\`` : `${e.kind} on \`${e.skill}\`${e.also.length ? ` (and ${e.also.map((k) => `\`${k}\``).join(', ')})` : ''}: ${e.option}`;
            L(`### ${i + 1}. ${e.name} — \`${e.id}\``);
            L();
            L(`- **What:** ${what}. Grade ${e.grade || '-'} · family ${e.family} · source ${e.source === 'wrm' ? 'White Rose audit' : 'standards audit'}.`);
            L(`- **Closes (standards):** ${cl.length ? cl.join(', ') : 'none not already full'}${e.standards.length ? ` · tag with CCSS ${e.standards.filter((c) => !c.startsWith('M.EE')).join(', ') || '-'}, EE ${e.ee.join(', ') || '-'}` : ''}`);
            L(`- **Closes (White Rose steps):** ${e.wrmSteps.length ? e.wrmSteps.join(', ') : 'none'}${e.wrmImproves.length ? ` · strengthens ${e.wrmImproves.join(', ')}` : ''}`);
            L(`- **Teaches:** ${e.teaches}.`);
            if (e.extension) L(`- **Extended for the standards:** ${e.extension}.`);
            L(`- **Problem types:** ${e.problemTypes.length ? e.problemTypes.map((p, j) => `(${j + 1}) ${p}`).join('; ') : 'SPEC MISSING'}.`);
            L(`- **Representation:** ${e.source === 'wrm' ? `${e.representation}. ` : ''}Templates: ${(e.templates || []).map((t) => `\`${t}\``).join(', ') || '-'}${(e.newTemplates || []).length ? `; new: ${e.newTemplates.map((t) => `\`${t}\``).join(', ')}` : ''}.`);
            L(`- **Answer:** ${e.answer || 'SPEC MISSING'}.`);
            L(`- **Ladder:** ${e.ladder || 'SPEC MISSING'}.`);
            L(`- **Misconceptions:** ${(e.misconceptions || []).join('; ') || 'SPEC MISSING'}.`);
            if (e.after.length) L(`- **After:** ${e.after.map((d) => `\`${d}\`${A.byId.get(d) && A.byId.get(d).lane !== id ? ` (lane \`${A.byId.get(d).lane}\`)` : ''}`).join(', ')}.`);
            L();
        });
    }
    fs.writeFileSync(BUILD_LIST, `${out.join('\n')}\n`);
}


/* ------------------------------------------------------------ main */
(async () => {
    let cc, ee;
    try { cc = loadJSON('ccss-math.json'); ee = loadJSON('ee-math.json'); } catch (e) {
        console.log(`ws-standards: FAIL\n  cannot read the database: ${e.message}`); process.exit(1);
    }
    checkDatabase(cc, ee);
    const src = dbSource(cc, ee);
    if (WRITE_DB) { fs.writeFileSync(DB_JS, src); console.log(`wrote ${path.relative(ROOT, DB_JS)}`); }
    else if (!fs.existsSync(DB_JS) || fs.readFileSync(DB_JS, 'utf8') !== src) fail('js/modules/standards-db.js is out of date: run `node tests/scripts/ws-standards.cjs --write-db`');

    // Node has no localStorage; data.js reads it at load.
    const mem = {};
    globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
    const origLog = console.log;
    console.log = () => {};
    let data, std, aliases, audit, bl, wrm;
    try {
        data = await import(pathToFileURL(path.join(ROOT, 'js/modules/data.js')).href);
        std = await import(pathToFileURL(path.join(ROOT, 'js/modules/standards.js')).href);
        aliases = await import(pathToFileURL(path.join(ROOT, 'js/modules/skill-aliases.js')).href);
        audit = await import(pathToFileURL(path.join(ROOT, 'js/modules/standards-audit.js')).href);
        bl = await import(pathToFileURL(path.join(ROOT, 'js/modules/build-list.js')).href);
        wrm = await import(pathToFileURL(path.join(ROOT, 'js/modules/wrm.js')).href);
    } finally { console.log = origLog; }

    const live = [];
    const retired = [];
    for (const [cat, list] of Object.entries(data.SKILLS)) {
        if (!Array.isArray(list)) continue;
        for (const s of list) (s.retired ? retired : live).push({ cat, v: s.v, l: s.l, key: `${cat}:${s.v}` });
    }
    const liveKeys = new Set(live.map((s) => s.key));
    const labels = new Map(live.map((s) => [s.key, s.l]));
    const map = std.SKILL_STANDARDS;
    const ccCodes = new Set(cc.standards.map((s) => s.code));
    // A skill may name an EE or one of its lettered sub-parts (P10: the school workbook's Qatari
    // currency row is the sub-part M.EE.4.MD.5.d).
    const eeCodes = new Set(ee.essentialElements.flatMap((e) => [e.code, ...(e.subs || []).map((x) => x.code)]));
    const stats = { live: live.length, withCcss: 0, approx: 0, pools: 0, reasoned: 0, vocab: 0 };
    for (const s of live) {
        const e = map[s.key];
        if (!e) { fail(`map: live skill ${s.key} (${s.l}) is not mapped`); continue; }
        if (!Array.isArray(e.ccss) || !Array.isArray(e.ee)) { fail(`map: ${s.key} needs ccss and ee arrays`); continue; }
        for (const c of e.ccss) if (!ccCodes.has(c)) fail(`map: ${s.key} names ${c}, which is not in ccss-math.json`);
        for (const c of e.ee) if (!eeCodes.has(c)) fail(`map: ${s.key} names ${c}, which is not in ee-math.json`);
        if (new Set(e.ccss).size !== e.ccss.length || new Set(e.ee).size !== e.ee.length) fail(`map: ${s.key} repeats a code`);
        if (e.ccss.length) stats.withCcss += 1;
        if (e.approx) { stats.approx += 1; if (!e.note) fail(`map: ${s.key} is approx without a note`); if (!e.ccss.length) fail(`map: ${s.key} is approx with no code`); }
        if (e.pool) stats.pools += 1;
        if (!e.ccss.length && !e.pool) {
            if (!e.reason) fail(`map: ${s.key} has no standard and no reason`);
            else { stats.reasoned += 1; if (s.cat === 'vocabulary') stats.vocab += 1; }
        }
        if (e.pool && (e.ccss.length || e.ee.length)) fail(`map: pool ${s.key} should not list codes (it inherits its members')`);
    }
    for (const k of Object.keys(map)) if (!liveKeys.has(k)) fail(`map: ${k} is not a live skill`);
    for (const r of retired) {
        const ent = std.standardsEntry(r.cat, r.v);
        if (!ent) fail(`alias: retired ${r.key} does not resolve to a mapped skill`);
    }
    // the lookup helpers agree with the database
    const probe = [['3.OA.7', '3.OA.C.7'], ['3.oa.c.7', '3.OA.C.7'], ['2.NBT.1a', '2.NBT.A.1a'], ['M.3.OA.C.6', '3.OA.C.7'],
        ['EE.3.OA.6', 'M.EE.3.OA.6'], ['M.EE.1.OA.5.a', 'M.EE.1.OA.5'], ['EE.6.EE.1', 'M.EE.6.EE.1-2']];
    for (const [q, want] of probe) {
        const got = std.findStandard(q);
        if (!got || got.code !== want) fail(`findStandard('${q}') gave ${got ? got.code : 'null'}, expected ${want}`);
    }
    if (!std.skillsForStandard('3.OA.7').includes('multiplication:mult_facts')) fail('skillsForStandard(3.OA.7) misses multiplication:mult_facts');

    const cov = std.coverage();
    const S = cov.summary;
    const A = checkAudit({ cc, ee, audit, bl, wrm, map, liveKeys, labels });
    if (WRITE_REPORT && !failures.length) {
        writeReport(cov, cc, ee, (k) => labels.get(k) || k, stats, A);
        writeBuildList(A, (k) => labels.get(k) || k);
        console.log(`wrote ${path.relative(ROOT, REPORT)} and ${path.relative(ROOT, BUILD_LIST)}`);
    }
    console.log(`standards: ${cc.meta.counts.standards} CCSS (+${cc.meta.counts.subStandards} parts), ${ee.meta.counts.essentialElements} EE`);
    console.log(`skills: ${stats.live} live, ${stats.withCcss} with CCSS (${stats.approx} approx), ${stats.pools} pools, ${stats.reasoned} with a reason`);
    console.log(`coverage: CCSS ${S.ccss.covered}/${S.ccss.total} (${pct(S.ccss.covered, S.ccss.total)}), EE ${S.ee.covered}/${S.ee.total} (${pct(S.ee.covered, S.ee.total)})`);
    console.log(`  by level: ${GRADES.map((g) => `${g} ${pct((S.ccss.byGrade[g] || {}).covered, (S.ccss.byGrade[g] || {}).total)}`).join('  ')}`);
    const T = A.tally;
    console.log(`full coverage (audit): CCSS ${T.top.full}/${T.top.total} full, ${T.top.partial} partial, ${T.top.gap} gap; parts and leaves ${T.leaf.full}/${T.leaf.total} full, ${T.leaf.partial} partial, ${T.leaf.gap} gap; EE ${T.ee.full}/${T.ee.total} full, ${T.ee.partial} partial, ${T.ee.gap} gap`);
    console.log(`  tag fixes: ${A.fixCount['mis-tag']} mis-tags, ${A.fixCount.flag} flagged, ${A.fixCount.add} missing tags added; build list: ${A.list.length} entries (${A.kinds.new} new skills, ${A.kinds.option} options, ${A.kinds.repair} repairs) in ${Object.keys(bl.LANES).length} lanes`);
    if (!failures.length && STRICT) {
        const notFull = [...A.ccssRows.filter((r) => r.leaf && r.status !== 'full'), ...A.eeRows.filter((r) => r.status !== 'full')];
        const noSpec = A.list.filter((e) => e.specMissing);
        if (notFull.length || noSpec.length) {
            console.log('ws-standards: FAIL (strict)');
            if (notFull.length) console.log(`  ${notFull.length} standards and Essential Elements have no full-coverage skill (the build list is design/BUILD_LIST.md)`);
            for (const r of notFull.slice(0, 12)) console.log(`  ${r.code}: ${r.status}, missing ${r.missing[0]}`);
            if (notFull.length > 12) console.log(`  ... and ${notFull.length - 12} more`);
            for (const e of noSpec.slice(0, 12)) console.log(`  build-list entry ${e.id} has no spec (js/modules/build-specs.js)`);
            process.exit(1);
        }
    }
    if (failures.length) {
        console.log('ws-standards: FAIL');
        for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
        if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`);
        process.exit(1);
    }
    console.log('ws-standards: OK');
})();
