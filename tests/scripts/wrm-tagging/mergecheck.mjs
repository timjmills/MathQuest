// Simulate the lead's merge of a links file's tagFixes into the LIVE SKILL_WRM (js/modules/wrm.js) and check that every
// step of that year comes out as the file says: each direct skill tagged FULL, each partial-only skill tagged PARTIAL with
// the file's clause (several partial rungs of one key: their clauses joined by '; '), nothing else tagged to the year's steps.
// In wrm.js a string or {step, note} is FULL; {step, partial} is PARTIAL. The tagFix vocabulary is the brief's:
// add (tag FULL, or drop the partial flag), remove, partial (tag PARTIAL; the clause is `why`).
// Adapted from the Y4 lane's check. usage: node tests/scripts/wrm-tagging/mergecheck.mjs [R|Y1 ...] (default: R Y1)
globalThis.window = globalThis;
const ROOT = new URL('../../../', import.meta.url).pathname;
const { SKILL_WRM } = await import(ROOT + 'js/modules/wrm.js');
const fs = await import('fs');
let bad = 0;
for (const y of (process.argv.length > 2 ? process.argv.slice(2) : ['R', 'Y1'])) {
  const d = JSON.parse(fs.readFileSync(ROOT + `data/curriculum/links/${y}.json`, 'utf8'));
  const tag = new Map();   // key|step -> {status, clause}
  for (const [k, v] of Object.entries(SKILL_WRM)) for (const e of v) {
    const s = typeof e === 'string' ? e : e.step;
    tag.set(k + '|' + s, typeof e === 'object' && 'partial' in e ? { status: 'partial', clause: e.partial } : { status: 'full' });
  }
  const problems = [];
  for (const t of d.tagFixes) {
    const id = t.key + '|' + t.step, had = tag.get(id);
    if (!d.steps[t.step]) problems.push(`tagFix on a step outside ${y}: ${id}`);
    if (t.action === 'remove') { if (!had) problems.push(`remove of an untagged ${id}`); tag.delete(id); }
    else if (t.action === 'add') {
      if (had?.status === 'full') problems.push(`add on a tag already full: ${id}`);
      if (had && !/drop the partial flag/.test(t.why)) problems.push(`add on a partial tag without "drop the partial flag": ${id}`);
      tag.set(id, { status: 'full' });
    }
    else if (t.action === 'partial') {
      const clause = t.partial ?? t.why;
      if (had?.status === 'partial' && had.clause === clause) problems.push(`partial that changes nothing: ${id}`);
      tag.set(id, { status: 'partial', clause });
    }
    else problems.push(`unknown action ${t.action}: ${id}`);
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
  for (const [sid, s] of Object.entries(d.steps)) for (const e of s.direct) want.set(e.key + '|' + sid, { status: 'full' });   // direct wins over a later partial rung
  let full = 0, part = 0;
  for (const [id, w] of want) {
    const got = tag.get(id);
    if (!got) problems.push(`${id}: not tagged after the merge (${y}.json: ${w.status})`);
    else if (got.status !== w.status) problems.push(`${id}: ${got.status} after the merge, ${y}.json says ${w.status}`);
    else if (w.status === 'partial' && got.clause !== w.clause) problems.push(`${id}: clause after the merge differs from ${y}.json\n     merged: ${got.clause}\n     ${y}.json: ${w.clause}`);
    else if (w.status === 'full') full++; else part++;
  }
  for (const id of tag.keys()) { const sid = id.split('|')[1]; if (d.steps[sid] && !want.has(id)) problems.push(`${id}: still tagged after the merge, but not a direct or partial skill in ${y}.json`); }
  // every step's verdict follows from the merged tags: full = some FULL tag, partial = PARTIAL tags only, gap = none
  for (const [sid, s] of Object.entries(d.steps)) {
    const ts = [...tag].filter(([id]) => id.split('|')[1] === sid).map(([, v]) => v.status);
    const v = ts.includes('full') ? 'full' : ts.length ? 'partial' : 'gap';
    if (v !== s.verdict) problems.push(`${sid}: the merged tags give ${v}, ${y}.json says ${s.verdict}`);
  }
  if (problems.length) console.log(problems.join('\n'));
  console.log(`mergecheck ${y}: ${Object.keys(d.steps).length} steps, ${want.size} direct/partial tags (${full} full, ${part} partial matched), ${d.tagFixes.length} tagFixes; ${problems.length} problems`);
  bad += problems.length;
}
console.log(bad ? 'mergecheck: FAIL' : 'mergecheck: OK');
process.exit(bad ? 1 : 0);
