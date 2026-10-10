// Simulate the lead's merge of Y4.json tagFixes into the LIVE SKILL_WRM (js/modules/wrm.js) and check that every Y4 step comes
// out as Y4.json says: each direct skill tagged FULL, each partial skill tagged PARTIAL with this file's clause, nothing else
// tagged to a Y4 step. In wrm.js a string or {step, note} is FULL; {step, partial} is PARTIAL.
// usage: node tests/scripts/wrm-tagging/mergecheck.mjs [Y4.json]
globalThis.window = globalThis;
const R = new URL('../../../', import.meta.url).pathname;
const { SKILL_WRM } = await import(R + 'js/modules/wrm.js');
const fs = await import('fs');
const d = JSON.parse(fs.readFileSync(process.argv[2] || R + 'data/curriculum/links/Y4.json', 'utf8'));
const tag = new Map();   // key|step -> {status, clause}
for (const [k, v] of Object.entries(SKILL_WRM)) for (const e of v) {
  const s = typeof e === 'string' ? e : e.step;
  tag.set(k + '|' + s, typeof e === 'object' && 'partial' in e ? { status: 'partial', clause: e.partial } : { status: 'full' });
}
const problems = [];
for (const t of d.tagFixes) {
  const id = t.key + '|' + t.step, had = tag.get(id);
  if (t.action === 'remove') { if (!had) problems.push(`remove of an untagged ${id}`); tag.delete(id); }
  else if (t.action === 'full') { if (had?.status === 'full') problems.push(`full on a tag already full: ${id}`); if (/^tagged partial/.test(t.why) && had?.status !== 'partial') problems.push(`why says tagged partial: ${id}`); tag.set(id, { status: 'full' }); }
  else if (t.action === 'add') { if (had) problems.push(`add on a tag that exists: ${id}`); tag.set(id, 'partial' in t ? { status: 'partial', clause: t.partial } : { status: 'full' }); }
  else if (t.action === 'partial') tag.set(id, { status: 'partial', clause: t.partial });
  else if (t.action === 'opts') { if (!had) problems.push(`opts on an untagged ${id}`); }
  if (/re-tag as FULL/.test(t.why) && t.action !== 'full' && t.action !== 'add') problems.push(`why says "re-tag as FULL" on a ${t.action}: ${id}`);
}
const want = new Map();
for (const [sid, s] of Object.entries(d.steps)) {
  for (const e of s.direct) want.set(e.key + '|' + sid, { status: 'full' });
  for (const e of s.partial) {
    const id = e.key + '|' + sid, w = want.get(id);
    if (w?.status === 'full') continue;
    want.set(id, { status: 'partial', clause: w && !w.clause.includes(e.missing) ? w.clause + '; ' + e.missing : e.missing });
  }
}
for (const [id, w] of want) {
  const got = tag.get(id);
  if (!got) problems.push(`${id}: not tagged after the merge (Y4.json: ${w.status})`);
  else if (got.status !== w.status) problems.push(`${id}: ${got.status} after the merge, Y4.json says ${w.status}`);
  else if (w.status === 'partial' && got.clause !== w.clause) problems.push(`${id}: clause after the merge differs from Y4.json\n     merged: ${got.clause}\n     Y4.json: ${w.clause}`);
}
for (const id of tag.keys()) { const sid = id.split('|')[1]; if (d.steps[sid] && !want.has(id)) problems.push(`${id}: still tagged after the merge, but not a direct or partial skill in Y4.json`); }
console.log(problems.join('\n'));
console.log(`mergecheck: ${want.size} Y4 direct/partial tags, ${d.tagFixes.length} tagFixes; ${problems.length} problems`);
console.log(problems.length ? 'mergecheck: FAIL' : 'mergecheck: OK');
process.exit(problems.length ? 1 : 0);
