// Simulate the lead's merge of links-file tagFixes into the LIVE SKILL_WRM (js/modules/wrm.js) and check that every Y5 step comes
// out as its links file says: each direct skill tagged FULL, each partial skill tagged PARTIAL with this file's clause, nothing else
// tagged to a Y5 step. In wrm.js a string or {step, note} is FULL; {step, partial} is PARTIAL.
// usage: node tests/scripts/wrm-tagging/Y5/mergecheck.mjs [Y5.json] [other years' links files ...]
// Format-only (accepted): a partial tagFix with no `partial` field (R, Y1 keep the clause in `why`).
// With several files, every file's tagFixes are merged in turn into one SKILL_WRM, then every file's steps are checked.
globalThis.window = globalThis;
const R = new URL('../../../../', import.meta.url).pathname;
const { SKILL_WRM } = await import(R + 'js/modules/wrm.js');
const fs = await import('fs');
const files = process.argv.length > 2 ? process.argv.slice(2) : [R + 'data/curriculum/links/Y5.json'];
const docs = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const tag = new Map();   // key|step -> {status, clause}
for (const [k, v] of Object.entries(SKILL_WRM)) for (const e of v) {
  const s = typeof e === 'string' ? e : e.step;
  tag.set(k + '|' + s, typeof e === 'object' && 'partial' in e ? { status: 'partial', clause: e.partial } : { status: 'full' });
}
const problems = [], formatOnly = [];
for (const d of docs) for (const t of d.tagFixes) {
  const id = t.key + '|' + t.step, had = tag.get(id);
  if (t.action === 'remove') { if (!had) problems.push(`remove of an untagged ${id}`); tag.delete(id); }
  else if (t.action === 'full') { if (had?.status === 'full') problems.push(`full on a tag already full: ${id}`); if (/^tagged partial/.test(t.why) && had?.status !== 'partial') problems.push(`why says tagged partial: ${id}`); tag.set(id, { status: 'full' }); }
  else if (t.action === 'add') { if (had) problems.push(`add on a tag that exists: ${id}`); tag.set(id, 'partial' in t ? { status: 'partial', clause: t.partial } : { status: 'full' }); }
  else if (t.action === 'partial') tag.set(id, { status: 'partial', clause: t.partial });
  else if (t.action === 'opts') { if (!had) problems.push(`opts on an untagged ${id}`); }
  if (/re-tag as FULL/.test(t.why) && t.action !== 'full' && t.action !== 'add') problems.push(`why says "re-tag as FULL" on a ${t.action}: ${id}`);
}
const want = new Map(), mine = new Set();
for (const d of docs) for (const [sid, s] of Object.entries(d.steps)) {
  mine.add(sid);
  for (const e of s.direct) want.set(e.key + '|' + sid, { status: 'full' });
  for (const e of s.partial) {
    const id = e.key + '|' + sid, w = want.get(id);
    if (w?.status === 'full') continue;
    want.set(id, { status: 'partial', clause: w && !w.clause.includes(e.missing) ? w.clause + '; ' + e.missing : e.missing });
  }
}
for (const [id, w] of want) {
  const got = tag.get(id);
  if (!got) problems.push(`${id}: not tagged after the merge (links file: ${w.status})`);
  else if (got.status !== w.status) problems.push(`${id}: ${got.status} after the merge, links file says ${w.status}`);
  else if (w.status === 'partial' && got.clause === undefined) formatOnly.push(id);   // R/Y1 keep the clause in `why`, no `partial` field
  else if (w.status === 'partial' && got.clause !== w.clause) problems.push(`${id}: clause after the merge differs from the links file\n     merged: ${got.clause}\n     links file: ${w.clause}`);
}
for (const id of tag.keys()) { const sid = id.split('|')[1]; if (mine.has(sid) && !want.has(id)) problems.push(`${id}: still tagged after the merge, but not a direct or partial skill in its links file`); }
console.log(problems.join('\n'));
console.log(`mergecheck: ${docs.map(d => d.year).join('+')}: ${want.size} direct/partial tags, ${docs.reduce((n, d) => n + d.tagFixes.length, 0)} tagFixes; ${problems.length} problems; ${formatOnly.length} format-only (partial clause in why, no partial field)`);
console.log(problems.length ? 'mergecheck: FAIL' : 'mergecheck: OK');
process.exit(problems.length ? 1 : 0);
