#!/usr/bin/env node
/*
 * ws-standards — the standards database and the skill -> standard map.
 *
 *   node tests/scripts/ws-standards.cjs              # GATE: validate, print ws-standards: OK / FAIL
 *   node tests/scripts/ws-standards.cjs --report     # also write design/STANDARDS_COVERAGE.md
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
 *   - every retired skill resolves through skill-aliases.js to a mapped skill.
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

/* ------------------------------------------------------------ report */
function pct(n, d) { return d ? `${Math.round((100 * n) / d)}%` : '-'; }

function writeReport(cov, cc, ee, skillLabel, mapStats) {
    const out = [];
    const L = (s = '') => out.push(s);
    const skillList = (keys) => keys.map((k) => `${skillLabel(k)} (\`${k}\`)`).join('; ');
    L('# Standards coverage');
    L();
    L('Generated by `node tests/scripts/ws-standards.cjs --report`. Do not edit by hand: change the map in');
    L('`js/modules/standards.js` or the database in `data/standards/`, then regenerate.');
    L();
    L('A standard is **covered** when at least one live skill maps to it without `approx`. A parent standard');
    L('is covered when any of its lettered parts is; a lettered part only by a skill that names it. Skills');
    L('mapped with `approx` (the closest standard when none fits) are shown in italics and do not count.');
    L();
    L('Sources:');
    for (const s of Object.values(cc.meta.sources)) L(`- ${s.title}${s.url ? ` — ${s.url}` : ''}${s.file ? ` — ${s.file}` : ''}`);
    L();
    L('## Summary');
    L();
    L(`- Skills mapped: ${mapStats.live} live skills; ${mapStats.withCcss} carry at least one CCSS code, ${mapStats.approx} of them approximately; ${mapStats.pools} are mixed review pools; ${mapStats.reasoned} have no standard, with a reason (${mapStats.vocab} vocabulary games, ${mapStats.reasoned - mapStats.vocab} beyond grade 6).`);
    L(`- Database: ${cc.meta.counts.standards} CCSS standards K-6 plus ${cc.meta.counts.subStandards} lettered parts; ${ee.meta.counts.essentialElements} Wisconsin Essential Elements K-6 (${ee.meta.counts.notApplicableStandards} Wisconsin standards have no Essential Element: "Not applicable").`);
    L();
    L('| Level | CCSS standards covered | CCSS lettered parts covered | Essential Elements covered |');
    L('|---|---|---|---|');
    const S = cov.summary;
    for (const g of GRADES) {
        const a = S.ccss.byGrade[g] || { total: 0, covered: 0 };
        const b = S.ccssSubs.byGrade[g] || { total: 0, covered: 0 };
        const c = S.ee.byGrade[g] || { total: 0, covered: 0 };
        L(`| ${g} | ${a.covered} / ${a.total} (${pct(a.covered, a.total)}) | ${b.total ? `${b.covered} / ${b.total} (${pct(b.covered, b.total)})` : '-'} | ${c.covered} / ${c.total} (${pct(c.covered, c.total)}) |`);
    }
    L(`| **All** | **${S.ccss.covered} / ${S.ccss.total} (${pct(S.ccss.covered, S.ccss.total)})** | **${S.ccssSubs.covered} / ${S.ccssSubs.total} (${pct(S.ccssSubs.covered, S.ccssSubs.total)})** | **${S.ee.covered} / ${S.ee.total} (${pct(S.ee.covered, S.ee.total)})** |`);
    L();
    L('## NOT COVERED YET');
    L();
    L('The gap list for planning new skills: every standard no live skill covers. "approx" names a skill that');
    L('touches the standard only approximately.');
    L();
    for (const g of GRADES) {
        const gapsC = cov.ccss.filter((r) => r.grade === g && !r.covered);
        const gapsE = cov.ee.filter((r) => r.grade === g && !r.covered);
        L(`### Level ${g}`);
        L();
        if (!gapsC.length && !gapsE.length) { L('Everything at this level is covered.'); L(); continue; }
        if (gapsC.length) {
            L('CCSS:');
            L();
            for (const r of gapsC) L(`- **${r.code}** ${r.text}${r.approxSkills.length ? ` _(approx: ${skillList(r.approxSkills)})_` : ''}`);
            L();
        }
        if (gapsE.length) {
            L('Essential Elements:');
            L();
            for (const r of gapsE) L(`- **${r.code}** ${r.text}`);
            L();
        }
    }
    L('## CCSS, standard by standard');
    L();
    for (const g of GRADES) {
        L(`### Level ${g}`);
        L();
        let dom = '', clus = '';
        for (const r of cov.ccss.filter((x) => x.grade === g)) {
            if (r.domainCode !== dom) { dom = r.domainCode; clus = ''; L(`#### ${r.domainName} (${g}.${r.domainCode})`); L(); }
            if (r.cluster !== clus) { clus = r.cluster; L(`*${r.cluster}. ${r.clusterText}*`); L(); }
            const mark = r.covered ? 'covered' : 'NOT COVERED';
            const who = r.skills.length ? skillList(r.skills) : '';
            const ax = r.approxSkills.length ? ` _approx: ${skillList(r.approxSkills)}_` : '';
            L(`- ${r.parent ? '  ' : ''}**${r.code}** — ${mark}. ${r.text}${who ? `  \n  Skills: ${who}` : ''}${ax}`);
        }
        L();
    }
    L('## Essential Elements, element by element');
    L();
    for (const g of GRADES) {
        L(`### Level ${g}`);
        L();
        for (const r of cov.ee.filter((x) => x.grade === g)) {
            const mark = r.covered ? 'covered' : 'NOT COVERED';
            L(`- **${r.code}** — ${mark}. ${r.text}${r.ccss.length ? ` (CCSS ${r.ccss.join(', ')})` : ''}${r.skills.length ? `  \n  Skills: ${skillList(r.skills)}` : ''}`);
        }
        L();
    }
    fs.writeFileSync(REPORT, out.join('\n'));
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
    let data, std, aliases;
    try {
        data = await import(pathToFileURL(path.join(ROOT, 'js/modules/data.js')).href);
        std = await import(pathToFileURL(path.join(ROOT, 'js/modules/standards.js')).href);
        aliases = await import(pathToFileURL(path.join(ROOT, 'js/modules/skill-aliases.js')).href);
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
    const eeCodes = new Set(ee.essentialElements.map((e) => e.code));
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
    if (WRITE_REPORT && !failures.length) {
        writeReport(cov, cc, ee, (k) => labels.get(k) || k, stats);
        console.log(`wrote ${path.relative(ROOT, REPORT)}`);
    }
    console.log(`standards: ${cc.meta.counts.standards} CCSS (+${cc.meta.counts.subStandards} parts), ${ee.meta.counts.essentialElements} EE`);
    console.log(`skills: ${stats.live} live, ${stats.withCcss} with CCSS (${stats.approx} approx), ${stats.pools} pools, ${stats.reasoned} with a reason`);
    console.log(`coverage: CCSS ${S.ccss.covered}/${S.ccss.total} (${pct(S.ccss.covered, S.ccss.total)}), EE ${S.ee.covered}/${S.ee.total} (${pct(S.ee.covered, S.ee.total)})`);
    console.log(`  by level: ${GRADES.map((g) => `${g} ${pct((S.ccss.byGrade[g] || {}).covered, (S.ccss.byGrade[g] || {}).total)}`).join('  ')}`);
    if (failures.length) {
        console.log('ws-standards: FAIL');
        for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
        if (failures.length > 40) console.log(`  ... and ${failures.length - 40} more`);
        process.exit(1);
    }
    console.log('ws-standards: OK');
})();
