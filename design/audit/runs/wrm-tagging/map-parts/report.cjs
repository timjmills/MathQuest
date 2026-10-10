// Regenerate the data sections of MAP-report.md from data/curriculum/links/MAP.json.
// The hand-written parts (sources, owner questions) live in report-head.md / report-tail.md beside this script.
//   node design/audit/runs/wrm-tagging/map-parts/report.cjs
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../../../../..');
const d = require(path.join(ROOT, 'data/curriculum/links/MAP.json'));
const P = d.proposals, rows = d.rows;
const ST = ['exists-ok', 'exists-regrade', 'partial', 'missing'];
const STRANDS = ['Number & place value', 'Operations & algebra', 'Multiplication & division', 'Fractions & decimals', 'Measurement', 'Geometry', 'Data & graphing'];
const cnt = rs => ST.map(s => rs.filter(r => r.status === s).length);
const esc = s => String(s == null ? '' : s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const pn = id => id ? `\`${id}\` ${esc(P[id].name)}${P[id].reused ? ' (reused)' : ' (new)'}` : '';
const L = [];
L.push(fs.readFileSync(path.join(__dirname, 'report-head.md'), 'utf8').trim(), '');
const pr = Object.values(P), reused = pr.filter(p => p.reused).length;
L.push('## Counts', '', `${rows.length} rows; ${pr.length} proposals (${pr.length - reused} new, ${reused} reused: ${Object.entries(pr.filter(p => p.reused).reduce((a, p) => (a[p.source] = (a[p.source] || 0) + 1, a), {})).map(([k, v]) => `${k} ${v}`).join(', ')}). ` +
    `${rows.filter(r => r.evidence && r.evidence.url).length} rows cite public NWEA material; the rest say why they are kept (their CCSS code).`, '');
L.push('| Strand | rows | exists-ok | exists-regrade | partial | missing |', '|---|---|---|---|---|---|');
for (const s of STRANDS) { const rs = rows.filter(r => r.strand === s); L.push(`| ${s} | ${rs.length} | ${cnt(rs).join(' | ')} |`); }
L.push(`| **All** | ${rows.length} | ${cnt(rows).join(' | ')} |`, '');
L.push('| Source | rows | exists-ok | exists-regrade | partial | missing |', '|---|---|---|---|---|---|');
for (const s of ['6.2', 'strand-walk', '6.4']) { const rs = rows.filter(r => r.source === s); L.push(`| ${s} | ${rs.length} | ${cnt(rs).join(' | ')} |`); }
L.push('', 'Proposals by kind: ' + ['new', 'option'].map(k => `${k} ${pr.filter(p => p.kind === k).length}`).join(', ') + '.', '');
L.push('## The Wave 6.2 table, re-verified against the code today', '', '| MAP task | Plan said | Today | Skills | Proposal | What was sampled |', '|---|---|---|---|---|---|');
const PLAN = fs.readFileSync(path.join(ROOT, 'design/MASTER_PLAN.md'), 'utf8');
for (const r of rows.filter(r => r.source === '6.2')) {
    const key = r.task.slice(0, 18).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = PLAN.match(new RegExp('^\\| ' + key + '[^|]*\\| ([^|]*)\\|', 'm'));
    L.push(`| ${esc(r.task)} | ${m ? esc(m[1].trim()) : ''} | **${r.status}** | ${r.skills.map(k => '`' + k + '`').join(', ')} | ${pn(r.proposal)} | ${esc(r.note)} |`);
}
L.push('', '## New gaps found beyond the 6.2 table (strand walk)', '');
for (const s of STRANDS) {
    const rs = rows.filter(r => r.strand === s && r.source === 'strand-walk' && r.status !== 'exists-ok');
    if (!rs.length) continue;
    L.push(`### ${s}`, '', '| Task | RIT | Status | Proposal |', '|---|---|---|---|');
    for (const r of rs) L.push(`| ${esc(r.task)} | ${esc(r.ritBand)} | ${r.status} | ${pn(r.proposal)} |`);
    L.push('');
}
L.push('## The 6.4 "match the two" audit', '', '| Pair | Strand | Status | Skills | Proposal |', '|---|---|---|---|---|');
for (const r of rows.filter(r => r.source === '6.4')) L.push(`| ${esc(r.task)} | ${r.strand} | ${r.status} | ${r.skills.map(k => '`' + k + '`').join(', ')} | ${pn(r.proposal)} |`);
L.push('', '## Every proposal', '', '| Id | Kind | Skill (option) | Name | MAP strand / RIT / task type | Reused from |', '|---|---|---|---|---|---|');
for (const [id, p] of Object.entries(P)) L.push(`| \`${id}\` | ${p.kind || ''} | \`${p.skill || ''}\`${p.option ? ' (' + esc(p.option) + ')' : ''} | ${esc(p.name)} | ${(p.map || []).map(m => `${m.strand} ${m.ritBand} — ${esc(m.taskType)}`).join('<br>')} | ${p.reused ? p.source : 'new'} |`);
L.push('', fs.readFileSync(path.join(__dirname, 'report-tail.md'), 'utf8').trim(), '');
fs.writeFileSync(path.join(ROOT, 'design/audit/runs/wrm-tagging/MAP-report.md'), L.join('\n'));
console.log('MAP-report.md written');
