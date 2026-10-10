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
const pn1 = id => id ? `\`${id}\` ${esc(P[id].name)}${P[id].reused ? ' (reused)' : ' (new)'}` : '';
const pn = (id, r) => [pn1(id), ...((r && r.also) || []).map(a => '+ ' + pn1(a))].filter(Boolean).join('<br>');
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
L.push('', 'Proposals by kind: ' + Object.entries(pr.reduce((a, p) => (a[p.kind || '(none)'] = (a[p.kind || '(none)'] || 0) + 1, a), {})).map(([k, v]) => `${k} ${v}`).join(', ') + ` (= ${pr.length}).`, '');
L.push('## The Wave 6.2 table, re-verified against the code today', '', '| MAP task | Plan said | Today | Skills | Proposal | What was sampled |', '|---|---|---|---|---|---|');
const PLAN = fs.readFileSync(path.join(ROOT, 'design/MASTER_PLAN.md'), 'utf8');
for (const r of rows.filter(r => r.source === '6.2')) {
    const key = r.task.slice(0, 18).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = PLAN.match(new RegExp('^\\| ' + key + '[^|]*\\| ([^|]*)\\|', 'm'));
    L.push(`| ${esc(r.task)} | ${m ? esc(m[1].trim()) : ''} | **${r.status}** | ${r.skills.map(k => '`' + k + '`').join(', ')} | ${pn(r.proposal, r)} | ${esc(r.note)} |`);
}
L.push('', '## New gaps found beyond the 6.2 table (strand walk)', '');
for (const s of STRANDS) {
    const rs = rows.filter(r => r.strand === s && r.source === 'strand-walk' && r.status !== 'exists-ok');
    if (!rs.length) continue;
    L.push(`### ${s}`, '', '| Task | RIT | Status | Skill to make | What it adds |', '|---|---|---|---|---|');
    for (const r of rs) L.push(`| ${esc(r.task)} | ${esc(r.ritBand)} | ${r.status} | ${pn(r.proposal, r)} | ${esc(r.closes)} |`);
    L.push('');
}
L.push('## The 6.4 "match the two" audit', '', '| Pair | Strand | Status | Skills | Skill to make | What it adds |', '|---|---|---|---|---|---|');
for (const r of rows.filter(r => r.source === '6.4')) L.push(`| ${esc(r.task)} | ${r.strand} | ${r.status} | ${r.skills.map(k => '`' + k + '`').join(', ')} | ${pn(r.proposal, r)} | ${esc(r.closes)} |`);
L.push('', '## Re-grades (not builds)', '', 'Skills that already deal a MAP task but must pass the 8/10 re-grade (Wave 5 lanes). These are in `MAP.json` `regrades`, not in `proposals`.', '', '| Skill | MAP tasks it serves |', '|---|---|');
for (const [k, ts] of Object.entries(d.regrades || {})) L.push(`| \`${k}\` | ${ts.map(esc).join('; ')} |`);
L.push('', '## Skills yet to be made (every new proposal, in full)', '');
for (const [id, p] of Object.entries(P).filter(([, p]) => !p.reused)) {
    const gaps = rows.filter(r => r.proposal === id || (r.also || []).includes(id));
    L.push(`### \`${id}\` — ${esc(p.name)}`, '',
        `- **Builds:** ${p.kind === 'option' ? `option on \`${p.skill}\`: ${esc(p.option)}` : `new skill \`${p.skill}\``} (family ${p.family}; CCSS ${(p.ccss || []).join(', ')})`,
        `- **Teaches:** ${esc(p.teaches)}`,
        `- **Looks like:** ${esc(p.representation)}`,
        `- **Problem types:** ${(p.problemTypes || []).map(esc).join('; ')}`,
        `- **Levels:** ${(p.levels || []).map(esc).join(' → ')}`,
        `- **Example:** ${esc(p.example && p.example.item)} → **${esc(p.example && p.example.answer)}**`,
        `- **Misconceptions:** ${(p.misconceptions || []).map(esc).join('; ')}`,
        `- **MAP:** ${(p.map || []).map(m => `${m.strand} ${m.ritBand} (${esc(m.taskType)})`).join('; ')}`,
        `- **Fills:** ${gaps.map(r => esc(r.task)).join('; ')}`,
        `- **Why:** ${esc(p.why)}`, '');
}
L.push('', '## Every proposal', '', '| Id | Kind | Skill (option) | Name | MAP strand / RIT / task type | Reused from |', '|---|---|---|---|---|---|');
for (const [id, p] of Object.entries(P)) L.push(`| \`${id}\` | ${p.kind || ''} | \`${p.skill || ''}\`${p.option ? ' (' + esc(p.option) + ')' : ''} | ${esc(p.name)} | ${(p.map || []).map(m => `${m.strand} ${m.ritBand} — ${esc(m.taskType)}`).join('<br>')} | ${p.reused ? p.source + (p.mapClause ? ' + MAP clause: ' + esc(p.mapClause) : '') : 'new'} |`);
L.push('', fs.readFileSync(path.join(__dirname, 'report-tail.md'), 'utf8').trim(), '');
fs.writeFileSync(path.join(ROOT, 'design/audit/runs/wrm-tagging/MAP-report.md'), L.join('\n'));
console.log('MAP-report.md written');
