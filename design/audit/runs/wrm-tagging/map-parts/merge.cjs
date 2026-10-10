// Merge the MAP audit worker parts (A/B/C.json) into data/curriculum/links/MAP.json and check them.
//   node design/audit/runs/wrm-tagging/map-parts/merge.cjs
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../../../..');
const dir = __dirname;
const STATUS = new Set(['exists-ok', 'exists-regrade', 'partial', 'missing']);
const STRANDS = new Set(['Number & place value', 'Operations & algebra', 'Multiplication & division', 'Fractions & decimals', 'Measurement', 'Geometry', 'Data & graphing']);
(async () => {
globalThis.localStorage = { getItem: () => null, setItem() {} }; globalThis.window = globalThis; globalThis.document = {};
const log = console.log; console.log = () => {};
const { SKILLS } = await import(require('url').pathToFileURL(path.join(ROOT, 'js/modules/data.js')).href);
console.log = log;
const LIVE = new Set(); for (const [c, l] of Object.entries(SKILLS)) for (const s of l) if (!s.retired) LIVE.add(c + ':' + s.v);
const rows = [], proposals = {}, errs = [];
for (const f of fs.readdirSync(dir).filter(f => /^[A-Z]\.json$/.test(f)).sort()) {
    const part = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    for (const r of part.rows) rows.push(r);
    for (const [id, p] of Object.entries(part.proposals || {})) {
        if (proposals[id]) {   // same id from two parts: merge the map facets
            const a = proposals[id]; a.map = [].concat(a.map, p.map).filter(Boolean);
            continue;
        }
        proposals[id] = p;
    }
}
for (const p of Object.values(proposals)) if (!Array.isArray(p.map)) p.map = p.map ? [p.map] : [];
// A reused id carries its source entry verbatim; the audit adds only the map facet.
const imp = f => import(require('url').pathToFileURL(path.join(ROOT, f)).href);
const W = await imp('js/modules/wrm.js'), B = await imp('js/modules/build-list.js');
const SRC = { WRM_PROPOSALS: W.WRM_PROPOSALS, STANDARD_PROPOSALS: B.STANDARD_PROPOSALS, WRM_EXTENSIONS: B.WRM_EXTENSIONS, VISUAL_BUILDS: B.VISUAL_BUILDS };
for (const [id, p] of Object.entries(proposals)) {
    if (!p.reused) { for (const [n, o] of Object.entries(SRC)) if (o[id]) errs.push(`proposal ${id}: marked new but exists in ${n}`); continue; }
    const hit = Object.entries(SRC).find(([, o]) => o[id]);
    if (!hit) { errs.push(`proposal ${id}: reused but not in any source list`); continue; }
    // source wins; a field the source entry lacks (e.g. ccss on a WRM step proposal) keeps the audit's value
    const keep = {}; for (const k of ['ccss', 'why', 'teaches', 'representation', 'family']) if (hit[1][id][k] === undefined && p[k] !== undefined) keep[k] = p[k];
    // A reused entry widened for MAP keeps its source text and gains the extra clause as mapClause.
    const clause = p.mapClause || (String(p.teaches || '').match(/MAP clause:\s*(.+)$/i) || [])[1];
    proposals[id] = { ...keep, ...hit[1][id], source: hit[0], map: p.map, ...(clause ? { mapClause: clause.trim() } : {}), reused: true };
}
const live = k => LIVE.has(k);
rows.forEach((r, i) => {
    const at = `row ${i} "${r.task}"`;
    if (!STATUS.has(r.status)) errs.push(`${at}: bad status ${r.status}`);
    if (!STRANDS.has(r.strand)) errs.push(`${at}: bad strand ${r.strand}`);
    if ((r.status === 'partial' || r.status === 'missing') && !r.proposal) errs.push(`${at}: ${r.status} without proposal`);
    if (r.proposal && !proposals[r.proposal]) errs.push(`${at}: unknown proposal ${r.proposal}`);
    // Owner 2026-10-10: every gap is written as the skill that fills it, and the row says what that skill adds.
    if ((r.status === 'partial' || r.status === 'missing') && !(r.closes && r.closes.length > 20)) errs.push(`${at}: gap row without "closes" (what the proposed skill adds)`);
    for (const k of r.skills || []) if (!live(k)) errs.push(`${at}: skill ${k} not a live skill key`);
});
const used = new Set(rows.map(r => r.proposal).filter(Boolean));
for (const [id, p] of Object.entries(proposals)) {
    if (!used.has(id)) errs.push(`proposal ${id} not used by any row`);
    for (const k of (p.reused ? ['name'] : ['kind', 'skill', 'name', 'teaches', 'representation', 'family', 'ccss', 'why', 'map'])) if (p[k] === undefined) errs.push(`proposal ${id}: missing ${k}`);
    if (p.kind === 'option' && !p.option) errs.push(`proposal ${id}: option without option`);
    if (!p.reused) {   // a new proposal is a whole imagined skill, not a one-liner
        if (!Array.isArray(p.problemTypes) || p.problemTypes.length < 2) errs.push(`proposal ${id}: needs problemTypes (2-4 item forms)`);
        if (!Array.isArray(p.levels) || p.levels.length < 2) errs.push(`proposal ${id}: needs levels (the one-change ladder)`);
        if (!p.example || !p.example.item || p.example.answer === undefined) errs.push(`proposal ${id}: needs example {item, answer}`);
        if (!Array.isArray(p.misconceptions) || p.misconceptions.length < 1) errs.push(`proposal ${id}: needs misconceptions`);
    }
}
// Re-grades are not builds: every exists-regrade row's skills go to one list the Wave 5 lanes work from.
const regrades = {};
for (const r of rows) if (r.status === 'exists-regrade') for (const k of r.skills) (regrades[k] ??= []).push(r.task);
for (const id of Object.keys(proposals)) if (/^map_regrade_/.test(id)) errs.push(`proposal ${id}: a re-grade is not a build; drop it and leave the row exists-regrade`);
const out = { generatedBy: 'map-audit', rows, proposals, regrades };
fs.mkdirSync(path.join(ROOT, 'data/curriculum/links'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data/curriculum/links/MAP.json'), JSON.stringify(out, null, 1) + '\n');
const c = {}; rows.forEach(r => c[r.status] = (c[r.status] || 0) + 1);
const pr = Object.values(proposals); const reused = pr.filter(p => p.reused).length;
console.log(`rows ${rows.length}`, c, `proposals ${pr.length} (new ${pr.length - reused}, reused ${reused})`);
if (errs.length) { console.log(errs.join('\n')); process.exitCode = 1; } else console.log('MAP merge: OK');
})();
