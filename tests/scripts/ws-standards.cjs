#!/usr/bin/env node
/*
 * ws-standards — the standards database and the skill -> standard map.
 *
 *   node tests/scripts/ws-standards.cjs              # GATE: validate, print ws-standards: OK / FAIL
 *   node tests/scripts/ws-standards.cjs --report     # also write design/STANDARDS_COVERAGE.md,
 *                                                    # design/BUILD_LIST.md and design/wrm-visuals/INDEX.md
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
 *   - the WRM visual catalogue (design/wrm-visuals/*.md + js/modules/visual-catalogue.js): every year row
 *     joins exactly one representation id, every PARTIAL / GAP representation names a build-list entry
 *     that exists, every entry added from the catalogue is used, has a lane, hosts and files.
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

/* ------------------------------------------------------------ the WRM visual catalogue */
// design/wrm-visuals/{reception,year-1 … year-6}.md each end with an "Every … representation
// (de-duplicated)" table. Their rows are joined into ONE catalogue by the years' cross-references plus
// js/modules/visual-catalogue.js (VISUAL_ALIASES, VISUALS), and written as design/wrm-visuals/INDEX.md.
const VIS_DIR = path.join(ROOT, 'design', 'wrm-visuals');
const VIS_INDEX = path.join(VIS_DIR, 'INDEX.md');
const VIS_FILES = { R: 'reception', Y1: 'year-1', Y2: 'year-2', Y3: 'year-3', Y4: 'year-4', Y5: 'year-5', Y6: 'year-6' };
const VIS_YEAR_NAME = { R: 'Reception', Y1: 'Year 1', Y2: 'Year 2', Y3: 'Year 3', Y4: 'Year 4', Y5: 'Year 5', Y6: 'Year 6' };

function visCells(line) { return line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((c) => c.trim()); }

/** The WRM step ids a "Where" cell names ("B1 S2–S4, S7; B2 S1", "B1 S1,4,5,9,12–13", "B1–B4"). */
function visSteps(year, where, blockSteps) {
    const out = new Set();
    let w = where.replace(/\*\*/g, '');
    const bare = w.replace(/\([^)]*\)/g, '');
    if (/B\d/.test(bare)) w = bare;
    for (const seg of w.split(';')) {
        const re = /B(\d+)(?:\s*[–-]\s*B?(\d+))?((?:\s*,?\s*S\s*\d+(?:\s*[–-]\s*S?\d+)?|\s*,\s*\d+(?:\s*[–-]\s*\d+)?)*)/g;
        let m;
        while ((m = re.exec(seg))) {
            const b0 = +m[1], b1 = m[2] ? +m[2] : b0, sPart = m[3] || '';
            if (!/\d/.test(sPart) || m[2]) {
                for (let b = b0; b <= b1; b++) (blockSteps.get(`${year}.B${b}`) || []).forEach((s) => out.add(s));
                continue;
            }
            for (const r of sPart.replace(/S/g, '').split(',')) {
                const mm = r.trim().match(/^(\d+)(?:\s*[–-]\s*(\d+))?$/);
                if (!mm) continue;
                for (let s = +mm[1]; s <= (mm[2] ? +mm[2] : +mm[1]); s++) {
                    const id = `${year}.B${b0}.S${s}`;
                    if ((blockSteps.get(`${year}.B${b0}`) || []).includes(id)) out.add(id);
                    else fail(`visual catalogue: ${year} "${where}" names ${id}, which is not a WRM step`);
                }
            }
        }
    }
    return [...out];
}

function parseVisualTables(blockSteps) {
    const rows = [];
    for (const [y, f] of Object.entries(VIS_FILES)) {
        const file = path.join(VIS_DIR, `${f}.md`);
        if (!fs.existsSync(file)) { fail(`visual catalogue: ${path.relative(ROOT, file)} is missing`); continue; }
        const txt = fs.readFileSync(file, 'utf8').split('\n');
        let i = txt.findIndex((l) => /^## Every .*representation/.test(l));
        if (i < 0) { fail(`visual catalogue: ${f}.md has no "Every … representation" table`); continue; }
        let header = null;
        for (i++; i < txt.length; i++) {
            const l = txt[i];
            if (/^## /.test(l)) break;
            if (!l.startsWith('|')) continue;
            const c = visCells(l);
            if (!header) { header = c; continue; }
            if (/^-+$/.test(c[0].replace(/:/g, ''))) continue;
            const get = (re) => { const k = header.findIndex((h) => re.test(h)); return k < 0 ? '' : c[k]; };
            const idRaw = c[0].replace(/\*\*/g, '').trim();
            const id = /^Y\d R\d+/.test(idRaw) ? idRaw.replace(' ', ':') : idRaw;
            const where = get(/^Where/);
            const status = get(/^Status/).replace(/\*\*/g, '').replace(/^NEW · /, '');
            rows.push({ year: y, id, key: `${y}:${id}`, name: c[1].replace(/\*\*/g, ''), where, y3: get(/^Y3$/), y1: get(/^(Y1|Y1\/Y2)$/),
                status, proposal: get(/^Existing/), steps: visSteps(y, where, blockSteps), everywhere: !/B\d/.test(where) });
        }
    }
    return rows;
}

/** One row status -> M / P / G. */
function visTone(s) { return s === 'MATCH' ? 'M' : s === 'GAP' ? 'G' : 'P'; }

function buildVisualCatalogue(vc, wrmJson) {
    const blockSteps = new Map();
    for (const y of wrmJson.years) for (const b of y.blocks) blockSteps.set(b.id, b.steps.map((s) => s.id));
    const rows = parseVisualTables(blockSteps);
    const byKey = new Map(rows.map((r) => [r.key, r]));
    const firstR = (s) => { const m = (s || '').match(/R(\d+)/); return m ? `R${m[1].padStart(2, '0')}` : null; };
    const link = (r) => {
        if (r.key in vc.VISUAL_ALIASES) return vc.VISUAL_ALIASES[r.key];
        const n = /^R\d+$/.test(r.id) ? +r.id.slice(1) : null;
        if (['Y2', 'Y5', 'Y6'].includes(r.year)) {
            if (n !== null) return n <= 84 ? `Y3:${r.id}` : `Y2:${r.id}`;
            return /^Y\d:R\d+$/.test(r.id) ? r.id : null;
        }
        if (r.year === 'Y1') { const t = /NEW|—/.test(r.y3) ? null : firstR(r.y3); return t ? `Y3:${t}` : null; }
        if (r.year === 'Y4') {
            const t = /^—/.test(r.y3) || /^\(/.test(r.y3) ? null : firstR(r.y3);
            if (t) return `Y3:${t}`;
            const u = /—/.test(r.y1) ? null : firstR(r.y1);
            return u ? `Y1:${u}` : null;
        }
        return null;
    };
    for (const k of Object.keys(vc.VISUAL_ALIASES)) if (!byKey.has(k)) fail(`visual catalogue: alias ${k} is not a row of the year tables`);
    const parent = new Map(rows.map((r) => [r.key, r.key]));
    const find = (k) => { while (parent.get(k) !== k) k = parent.get(k); return k; };
    for (const r of rows) {
        const t = link(r);
        if (!t || t === r.key) continue;
        if (!byKey.has(t)) { fail(`visual catalogue: ${r.key} joins ${t}, which is not a row`); continue; }
        const a = find(r.key), b = find(t);
        if (a !== b) parent.set(a, b);
    }
    const members = new Map();
    for (const r of rows) { const k = find(r.key); if (!members.has(k)) members.set(k, []); members.get(k).push(r); }
    // pin each group to its VISUALS id through the anchor
    const groupOfRow = new Map();
    for (const [root, ms] of members) for (const m of ms) groupOfRow.set(m.key, root);
    const groups = [];
    const seenRoot = new Set();
    for (const [id, [anchor, name, build]] of Object.entries(vc.VISUALS)) {
        if (!/^V\d{3}$/.test(id)) fail(`visual catalogue: ${id} is not a V### id`);
        const root = groupOfRow.get(anchor);
        if (!root) { fail(`visual catalogue: ${id} anchor ${anchor} is not a row`); continue; }
        if (seenRoot.has(root)) { fail(`visual catalogue: ${id} (${anchor}) is the same representation as another id`); continue; }
        seenRoot.add(root);
        const ms = members.get(root);
        const tones = ms.map((m) => visTone(m.status));
        const status = tones.every((t) => t === 'M') ? 'MATCH' : tones.every((t) => t === 'G') ? 'GAP' : 'PARTIAL';
        const steps = [...new Set(ms.flatMap((m) => m.steps))];
        const years = Object.keys(VIS_FILES).filter((y) => ms.some((m) => m.year === y));
        if (status !== 'MATCH' && !build.length) fail(`visual catalogue: ${id} ${name} is ${status} and names no build-list entry`);
        groups.push({ id, anchor, name, build: [...build], members: ms, status, steps, years, everywhere: ms.some((m) => m.everywhere) });
    }
    for (const root of members.keys()) if (!seenRoot.has(root)) fail(`visual catalogue: ${members.get(root).map((m) => m.key).join(' = ')} has no VISUALS id`);
    const byBuild = new Map();
    for (const g of groups) for (const b of g.build) {
        if (!byBuild.has(b)) byBuild.set(b, { visuals: [], steps: new Set() });
        byBuild.get(b).visuals.push(g.id);
        g.steps.forEach((s) => byBuild.get(b).steps.add(s));
    }
    const index = new Map([...byBuild].map(([b, v]) => [b, { visuals: v.visuals, steps: [...v.steps] }]));
    return { rows, groups, index };
}

/** After the build list exists: every build a representation names is on it; every catalogue entry is used. */
function checkVisualCatalogue(V, A, bl, liveKeys) {
    for (const g of V.groups) for (const b of g.build) if (!A.byId.has(b)) fail(`visual catalogue: ${g.id} names ${b}, which is not on the build list`);
    const proposed = new Set(A.list.filter((e) => e.kind === 'new').map((e) => e.skill));
    for (const [id, b] of Object.entries(bl.VISUAL_BUILDS)) {
        if (!V.index.has(id)) fail(`visual build ${id}: no representation names it`);
        if (!bl.LANES[b.lane]) fail(`visual build ${id}: unknown lane ${b.lane}`);
        for (const f of ['kind', 'name', 'build']) if (!b[f]) fail(`visual build ${id}: missing ${f}`);
        if (!['wiring', 'template', 'pane', 'option', 'skill', 'migration', 'band'].includes(b.kind)) fail(`visual build ${id}: bad kind ${b.kind}`);
        if (b.kind !== 'skill' && !b.hosts.length) fail(`visual build ${id}: names no host skill`);
        for (const h of b.hosts) if (!liveKeys.has(h) && !proposed.has(h)) fail(`visual build ${id}: host ${h} is neither live nor proposed`);
        if (!b.files.length) fail(`visual build ${id}: names no files`);
        if (A.byId.has(id) && A.byId.get(id).source !== 'visual') fail(`visual build ${id} collides with a proposal id`);
    }
    for (const [id, deps] of Object.entries(bl.VISUAL_AFTER)) {
        const e = A.byId.get(id);
        if (!e) { fail(`VISUAL_AFTER: ${id} is not on the build list`); continue; }
        if (bl.FROZEN_LANES.includes(e.lane)) fail(`VISUAL_AFTER: ${id} is in the frozen lane ${e.lane}`);
        for (const d of deps) if (!bl.VISUAL_BUILDS[d]) fail(`VISUAL_AFTER: ${id} waits for ${d}, which is not a visual build`);
    }
}

function visHave(g, liveKeys) {
    const found = new Set();
    const cells = new Set(fs.readdirSync(path.join(ROOT, 'js/modules/sheet/cells')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)));
    const paneSrc = fs.readFileSync(path.join(ROOT, 'js/modules/sheet/cells/panes/index.js'), 'utf8');
    const liveBySkill = new Map();
    for (const k of liveKeys) { const s = k.split(':')[1]; liveBySkill.set(s, liveBySkill.has(s) ? null : k); }
    for (const m of g.members) {
        for (const t of m.proposal.match(/`[^`]+`/g) || []) {
            const s = t.slice(1, -1).trim();
            let mm;
            if ((mm = s.match(/^template:([a-z0-9-]+)$/)) && cells.has(mm[1])) found.add(`template:${mm[1]}`);
            else if ((mm = s.match(/^pane:([a-z0-9-]+)$/)) && new RegExp(`['\\s{]${mm[1].replace(/-/g, '\\-')}'?:`).test(paneSrc)) found.add(`pane:${mm[1]}`);
            else if (liveKeys.has(s)) found.add(s);
            else if (/^[a-z0-9_]+$/.test(s) && liveBySkill.get(s)) found.add(liveBySkill.get(s));
        }
    }
    return [...found];
}

function writeVisualIndex(V, A, liveKeys) {
    const out = [];
    const L = (s = '') => out.push(s);
    const esc = (s) => String(s).replace(/\|/g, '\\|');
    const laneOf = (g) => { const e = g.build.length ? A.byId.get(g.build[0]) : null; return e ? e.lane : '-'; };
    const cnt = (st) => V.groups.filter((g) => g.status === st).length;
    const ents = (g) => g.build.map((b) => { const e = A.byId.get(b); return `\`${b}\`${e && e.source === 'visual' ? '*' : ''}`; }).join(', ');
    L('# WRM visual catalogue — the de-duplicated index');
    L();
    L('Generated by `node tests/scripts/ws-standards.cjs --report`. Do not edit by hand. Sources: the seven year catalogues in');
    L('this folder (their "Every … representation (de-duplicated)" tables) and `js/modules/visual-catalogue.js` (the joins');
    L('and the final ids). Owner, 2026-09-25: every White Rose visual is to be replicated in our skills, as an option within');
    L('a skill or as a skill of its own.');
    L();
    L('**How rows became one catalogue.** Years 2, 5 and 6 reuse the Year 3 ids (R01–R84) and the Year 2 additions');
    L('(R85–R101); Years 1 and 4 name the Year 3 / Year 1 row in their cross-reference columns; `VISUAL_ALIASES` joins the');
    L('rest by hand (Reception has no cross-reference column; the "NEW" rows of Years 4–6 repeat each other). Each group has');
    L('ONE final id `V###`, pinned in `VISUALS` — ids are append-only.');
    L();
    L('**Status** is computed from the year rows: MATCH when every year row is MATCH (built and offered, B&W), GAP when every');
    L('year row is GAP, PARTIAL otherwise (it exists for some years, some ranges or some looks, or only on the legacy colour');
    L('path). **Steps** = distinct White Rose small steps whose lesson pages use it (a representation used "throughout" is');
    L('marked +). **Build** names the entries of `design/BUILD_LIST.md` that close it: an existing WRM or standards entry that');
    L('already draws it (merged, not duplicated) or an entry added from this catalogue (marked *). **Lane** is the owner lane of');
    L('the first entry.');
    L();
    L('## Summary');
    L();
    L(`- **${V.rows.length} year rows** (${Object.keys(VIS_FILES).map((y) => `${VIS_YEAR_NAME[y]} ${V.rows.filter((r) => r.year === y).length}`).join(', ')}) → **${V.groups.length} representations**.`);
    L(`- **MATCH ${cnt('MATCH')} · PARTIAL ${cnt('PARTIAL')} · GAP ${cnt('GAP')}.**`);
    const visEntries = A.list.filter((e) => e.source === 'visual');
    const merged = new Set(V.groups.flatMap((g) => g.build).filter((b) => A.byId.get(b) && A.byId.get(b).source !== 'visual'));
    L(`- The ${cnt('PARTIAL') + cnt('GAP')} PARTIAL / GAP representations are closed by ${merged.size} existing build-list entries (merged) and ${visEntries.length} entries added from this catalogue.`);
    L();
    L('| Lane | Representations it owns | MATCH | PARTIAL | GAP | Entries added from the catalogue |');
    L('|---|---|---|---|---|---|');
    for (const id of Object.keys(A.bl.LANES)) {
        const gs = V.groups.filter((g) => laneOf(g) === id);
        L(`| \`${id}\` | ${gs.length} | ${gs.filter((g) => g.status === 'MATCH').length} | ${gs.filter((g) => g.status === 'PARTIAL').length} | ${gs.filter((g) => g.status === 'GAP').length} | ${visEntries.filter((e) => e.lane === id).length} |`);
    }
    L();
    L('## Cross-cutting findings');
    L();
    const line = (id, what) => { const e = A.byId.get(id); if (e) L(`- **${what}** → \`${id}\` (lane \`${e.lane}\`): ${e.visuals.join(', ')}.`); };
    line('vis_supports_wiring', 'Picture panes built but never offered as supports (rekenrek, fingers, dice, base10-quick, disks, pvgrid, openline, bar, gridpaper, hundreds, base10, objects)');
    for (const id of ['vis_migrate_shapes', 'vis_migrate_area_volume', 'vis_migrate_coordinates', 'vis_migrate_measures', 'vis_migrate_fraction_ops', 'vis_migrate_graphs']) line(id, `Legacy colour → B&W: ${A.byId.get(id) ? A.byId.get(id).name : id}`);
    line('vis_pv_bands_millions', 'Widening band: 7-digit / millions place value');
    line('vis_pv_decimal_places', 'Widening band: decimals to thousandths in the place-value chart');
    L();
    L('## The catalogue');
    L();
    L('| Id | Representation | Year rows | Steps | Status | Have today | Build | Lane |');
    L('|---|---|---|---|---|---|---|---|');
    for (const g of V.groups) {
        const rowsTxt = g.members.map((m) => `${m.year === 'R' ? 'R' : m.year} ${m.id.replace(/^Y\d:/, '')}${m.status !== g.status ? ` (${m.status === 'MATCH / PARTIAL' ? 'M/P' : m.status})` : ''}`).join(', ');
        const have = visHave(g, liveKeys);
        L(`| ${g.id} | ${esc(g.name)} | ${esc(rowsTxt)} | ${g.steps.length}${g.everywhere ? '+' : ''} | ${g.status} | ${have.length ? have.map((h) => `\`${h}\``).join(', ') : '-'} | ${ents(g) || '-'} | ${g.build.length ? `\`${laneOf(g)}\`` : '-'} |`);
    }
    L();
    L('## By build-list entry');
    L();
    L('Every entry of `design/BUILD_LIST.md` that draws a catalogued representation, with its reach (distinct small steps).');
    L();
    L('| Entry | Lane | Source | Representations | Reach (steps) |');
    L('|---|---|---|---|---|');
    const ids = [...V.index.keys()].sort((a, b) => (A.byId.get(a) ? A.byId.get(a).lane : '').localeCompare(A.byId.get(b) ? A.byId.get(b).lane : '') || V.index.get(b).steps.length - V.index.get(a).steps.length);
    for (const id of ids) {
        const e = A.byId.get(id);
        if (!e) continue;
        L(`| \`${id}\` ${esc(e.name)} | \`${e.lane}\` | ${e.source === 'visual' ? 'added from visual catalogue' : e.source === 'wrm' ? 'White Rose audit' : 'standards audit'} | ${V.index.get(id).visuals.join(', ')} | ${V.index.get(id).steps.length} |`);
    }
    fs.writeFileSync(VIS_INDEX, `${out.join('\n')}\n`);
}

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
function checkAudit({ cc, ee, audit, bl, wrm, map, liveKeys, labels, vis }) {
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
    const list = bl.buildList(vis ? vis.index : null);
    const byId = new Map(list.map((e) => [e.id, e]));
    const closes = new Map(list.map((e) => [e.id, []]));
    for (const r of [...ccssRows, ...eeRows]) for (const id of r.build) if (closes.has(id)) closes.get(id).push(r.code);
    const kinds = { new: 0, option: 0, repair: 0 };
    const allCodes = new Set([...ccByCode.keys(), ...eeByCode.keys(), ...ee.essentialElements.flatMap((e) => (e.subs || []).map((x) => x.code))]);
    for (const e of list) {
        if (e.source !== 'visual') kinds[e.kind] = (kinds[e.kind] || 0) + 1;
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
    L(`- The one build list: ${A.list.length} entries — ${A.kinds.new} new skills, ${A.kinds.option} options on existing skills, ${A.kinds.repair} repairs; ${A.list.filter((e) => e.source === 'wrm').length} from the White Rose audit (${Object.keys(A.list.filter((e) => e.source === 'wrm' && e.extension).reduce((o, e) => { o[e.id] = 1; return o; }, {})).length} of them extended to close standards clauses), ${A.list.filter((e) => e.source === 'standards').length} from this audit, ${A.list.filter((e) => e.source === 'visual').length} added from the White Rose visual catalogue (\`design/wrm-visuals/INDEX.md\`).`);
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
    const std = A.list.filter((e) => e.source !== 'visual');
    const fams = [...new Set(std.map((e) => e.family))];
    const impact = impactOf(A);
    fams.sort((a, b) => std.filter((e) => e.family === b).reduce((s, e) => s + impact(e), 0) - std.filter((e) => e.family === a).reduce((s, e) => s + impact(e), 0));
    for (const f of fams) {
        const entries = A.bl.orderLane(std.filter((e) => e.family === f), impact);
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
    L('at that step, the standards audit added its own entry. The White Rose VISUAL catalogue (`design/wrm-visuals/INDEX.md`)');
    L('adds only what no entry already draws: a representation an entry draws is sent to that entry (its "Visual catalogue"');
    L('line); the rest are the entries "added from visual catalogue" (templates, panes, options, the supports wiring, the');
    L('legacy-to-B&W migrations and the wider place-value bands).');
    L();
    L('**Done means** (for every entry): researched per CLAUDE.md, built in the sheet kit (no legacy handlers), ≥ 8 on all');
    L('four `design/audit/RUBRIC.md` criteria on every page type and screen host and ≥ 8 on OPTIONS-RUBRIC O1-O6, graded');
    L('by an independent critic; then tag it in `SKILL_STANDARDS` (and `SKILL_WRM`), flip the verdicts it closes to');
    L('FULL in `standards-audit.js`, and delete the entry (the WRM gate and `ws-standards --strict` count down).');
    L();
    L('## Summary');
    L();
    const visAll = A.list.filter((e) => e.source === 'visual');
    L(`- ${A.list.length} entries: **${A.kinds.new} new skills, ${A.kinds.option} new options, ${A.kinds.repair} repairs**, and **${visAll.length} added from the visual catalogue** (${['wiring', 'template', 'pane', 'option', 'skill', 'migration', 'band'].map((k) => `${visAll.filter((e) => e.kind === k).length} ${k}`).join(', ')}).`);
    L(`- ${A.list.filter((e) => e.source === 'wrm').length} from the White Rose audit (${A.list.filter((e) => e.source === 'wrm' && e.extension).length} extended for standards), ${A.list.filter((e) => e.source === 'standards').length} from the standards audit.`);
    L(`- They close ${A.tally.leaf.partial + A.tally.leaf.gap} CCSS leaves and parts and ${A.tally.ee.partial + A.tally.ee.gap} Essential Elements that are not FULL today, and every White Rose small step without a full-coverage skill.`);
    L(`- The visual catalogue: ${A.vis.groups.length} representations (MATCH ${A.vis.groups.filter((g) => g.status === 'MATCH').length}, PARTIAL ${A.vis.groups.filter((g) => g.status === 'PARTIAL').length}, GAP ${A.vis.groups.filter((g) => g.status === 'GAP').length}); every PARTIAL and GAP one is on an entry below.`);
    L(`- ${Object.keys(NEW_TEMPLATES).length} new sheet-kit templates and panes are needed; each is owned by one lane.`);
    L(`- Lanes ${A.bl.FROZEN_LANES.map((l) => `\`${l}\``).join(' and ')} were already building from this list: their entries keep their order and names, and the catalogue's entries are APPENDED after them.`);
    L();
    L('| Lane | Entries | New skills | Options | Repairs | Added from visual catalogue | Standards closed | WRM steps closed | Representations drawn | Visual reach (steps) |');
    L('|---|---|---|---|---|---|---|---|---|---|');
    for (const id of lanes) {
        const es = A.list.filter((e) => e.lane === id);
        const std = es.filter((e) => e.source !== 'visual');
        const codes = new Set(es.flatMap((e) => A.closes.get(e.id) || []));
        const reps = new Set(es.flatMap((e) => e.visuals || []));
        const steps = new Set(es.flatMap((e) => e.visualSteps || []));
        L(`| ${LANES[id].name} (\`${id}\`) | ${es.length} | ${std.filter((e) => e.kind === 'new').length} | ${std.filter((e) => e.kind === 'option').length} | ${std.filter((e) => e.kind === 'repair').length} | ${es.length - std.length} | ${codes.size} | ${es.reduce((s, e) => s + e.wrmSteps.length, 0)} | ${reps.size} | ${steps.size} |`);
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
    L('   (standards closed × 2 + White Rose steps closed + the small steps whose pages use the representations it draws).');
    L(`   The frozen lanes (${A.bl.FROZEN_LANES.map((l) => `\`${l}\``).join(', ')}) keep their original order; their entries added from the visual`);
    L('   catalogue follow, in dependency-then-reach order.');
    L('3. Lanes run in parallel; an entry whose dependency is in another lane waits for it (named in its `After` line).');
    L();
    const reach = (e) => (e.visualSteps || []).length;
    const mergedImpact = (e) => impact(e) + reach(e);
    const visLabel = (ids) => ids.map((v) => `${v} ${(A.vis.groups.find((g) => g.id === v) || {}).name || ''}`).join('; ');
    const renderVisual = (e, i, id) => {
        L(`### ${i + 1}. ${e.name} — \`${e.id}\``);
        L();
        L(`- **Added from visual catalogue.** ${e.kind}${e.low ? ' (low priority)' : ''} · grade ${e.grade || '-'} · lane \`${e.lane}\`.`);
        L(`- **Build:** ${e.teaches}.`);
        L(`- **Offered on:** ${[e.skill, ...e.also].filter(Boolean).map((k) => `\`${k}\``).join(', ') || '-'}.`);
        L(`- **Templates:** ${(e.templates || []).map((t) => `\`${t}\``).join(', ') || '-'}${(e.newTemplates || []).length ? `; new or owned: ${e.newTemplates.map((t) => `\`${t}\``).join(', ')}` : ''}. **Files:** ${(e.files || []).map((f) => `\`${f}\``).join(', ')}.`);
        L(`- **Draws (visual catalogue):** ${visLabel(e.visuals)}.`);
        L(`- **Reach:** ${reach(e)} White Rose small steps use these pictures.`);
        if (e.after.length) L(`- **After:** ${e.after.map((d) => `\`${d}\`${A.byId.get(d) && A.byId.get(d).lane !== id ? ` (lane \`${A.byId.get(d).lane}\`)` : ''}`).join(', ')}.`);
        L('- **Done means:** B&W kit drawing on every page type and screen host, answer-free where it is a support, ≥ 8 on the RUBRIC and OPTIONS-RUBRIC; then set each representation it closes to MATCH in its year catalogue.');
        L();
    };
    for (const id of lanes) {
        const frozen = A.bl.FROZEN_LANES.includes(id);
        const es = frozen
            ? [...A.bl.orderLane(A.list.filter((e) => e.lane === id && e.source !== 'visual'), impact), ...A.bl.orderLane(A.list.filter((e) => e.lane === id && e.source === 'visual'), reach)]
            : A.bl.orderLane(A.list.filter((e) => e.lane === id), mergedImpact);
        if (!es.length) continue;
        L(`## Lane \`${id}\`: ${LANES[id].name} (${es.length})`);
        L();
        L(`Owns: ${LANES[id].files.map((f) => `\`${f}\``).join(', ')}${LANES[id].newTemplates.length ? `. Builds templates: ${LANES[id].newTemplates.map((t) => `\`${t}\``).join(', ')}` : ''}.`);
        L();
        let firstVisual = true;
        es.forEach((e, i) => {
            if (frozen && e.source === 'visual' && firstVisual) {
                firstVisual = false;
                L(`### Added from visual catalogue (appended 2026-09-25; the entries above are unchanged)`);
                L();
                const carried = es.filter((x) => x.source !== 'visual' && (x.visuals || []).length);
                if (carried.length) L(`Your existing entries that also draw catalogued representations (build them with these pictures): ${carried.map((x) => `\`${x.id}\` (${x.visuals.join(', ')})`).join('; ')}.`);
                L();
            }
            if (e.source === 'visual') { renderVisual(e, i, id); return; }
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
            if (!frozen && (e.visuals || []).length) L(`- **Visual catalogue:** also draws ${visLabel(e.visuals)} (reach ${reach(e)} steps).`);
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
    let data, std, aliases, audit, bl, wrm, vc;
    try {
        data = await import(pathToFileURL(path.join(ROOT, 'js/modules/data.js')).href);
        std = await import(pathToFileURL(path.join(ROOT, 'js/modules/standards.js')).href);
        aliases = await import(pathToFileURL(path.join(ROOT, 'js/modules/skill-aliases.js')).href);
        audit = await import(pathToFileURL(path.join(ROOT, 'js/modules/standards-audit.js')).href);
        bl = await import(pathToFileURL(path.join(ROOT, 'js/modules/build-list.js')).href);
        wrm = await import(pathToFileURL(path.join(ROOT, 'js/modules/wrm.js')).href);
        vc = await import(pathToFileURL(path.join(ROOT, 'js/modules/visual-catalogue.js')).href);
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
    const V = buildVisualCatalogue(vc, JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'curriculum', 'wrm-steps.json'), 'utf8')));
    const A = checkAudit({ cc, ee, audit, bl, wrm, map, liveKeys, labels, vis: V });
    checkVisualCatalogue(V, A, bl, liveKeys);
    A.vis = V;
    if (WRITE_REPORT && !failures.length) {
        writeReport(cov, cc, ee, (k) => labels.get(k) || k, stats, A);
        writeBuildList(A, (k) => labels.get(k) || k);
        writeVisualIndex(V, A, liveKeys);
        console.log(`wrote ${path.relative(ROOT, REPORT)}, ${path.relative(ROOT, BUILD_LIST)} and ${path.relative(ROOT, VIS_INDEX)}`);
    }
    console.log(`standards: ${cc.meta.counts.standards} CCSS (+${cc.meta.counts.subStandards} parts), ${ee.meta.counts.essentialElements} EE`);
    console.log(`skills: ${stats.live} live, ${stats.withCcss} with CCSS (${stats.approx} approx), ${stats.pools} pools, ${stats.reasoned} with a reason`);
    console.log(`coverage: CCSS ${S.ccss.covered}/${S.ccss.total} (${pct(S.ccss.covered, S.ccss.total)}), EE ${S.ee.covered}/${S.ee.total} (${pct(S.ee.covered, S.ee.total)})`);
    console.log(`  by level: ${GRADES.map((g) => `${g} ${pct((S.ccss.byGrade[g] || {}).covered, (S.ccss.byGrade[g] || {}).total)}`).join('  ')}`);
    const T = A.tally;
    console.log(`full coverage (audit): CCSS ${T.top.full}/${T.top.total} full, ${T.top.partial} partial, ${T.top.gap} gap; parts and leaves ${T.leaf.full}/${T.leaf.total} full, ${T.leaf.partial} partial, ${T.leaf.gap} gap; EE ${T.ee.full}/${T.ee.total} full, ${T.ee.partial} partial, ${T.ee.gap} gap`);
    console.log(`  tag fixes: ${A.fixCount['mis-tag']} mis-tags, ${A.fixCount.flag} flagged, ${A.fixCount.add} missing tags added; build list: ${A.list.length} entries (${A.kinds.new} new skills, ${A.kinds.option} options, ${A.kinds.repair} repairs, ${A.list.filter((e) => e.source === 'visual').length} added from the visual catalogue) in ${Object.keys(bl.LANES).length} lanes`);
    const vst = (st) => V.groups.filter((g) => g.status === st).length;
    console.log(`visual catalogue: ${V.rows.length} year rows -> ${V.groups.length} representations (MATCH ${vst('MATCH')}, PARTIAL ${vst('PARTIAL')}, GAP ${vst('GAP')}); ${A.list.filter((e) => e.source === 'visual').length} build-list entries added from it`);
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
