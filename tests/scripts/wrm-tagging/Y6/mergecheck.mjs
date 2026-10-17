// Simulate the lead's merge of one or more year links files' tagFixes into the LIVE SKILL_WRM (js/modules/wrm.js), in the
// order given, and check that every step of every file comes out as that file says: each direct skill tagged FULL, each
// partial skill tagged PARTIAL with the file's clause (the structured `partial` field), nothing else tagged to its steps,
// and no two files touching the same skill+step. In wrm.js a string or {step, note} is FULL; {step, partial} is PARTIAL.
// usage: node tests/scripts/wrm-tagging/Y6/mergecheck.mjs [Y6.json] [R.json Y1.json Y4.json ...]   (the first file must give
// every partial clause in the structured `partial` field; the others may keep it in `why`, as R and Y1 do)
globalThis.window = globalThis;
const R = new URL('../../../../', import.meta.url).pathname;
const { SKILL_WRM } = await import(R + 'js/modules/wrm.js');
const fs = await import('fs');
const files = process.argv.slice(2).length ? process.argv.slice(2) : [R + 'data/curriculum/links/Y6.json'];
const docs = files.map(f => JSON.parse(fs.readFileSync(f, 'utf8')));
const tag = new Map();   // key|step -> {status, clause}
for (const [k, v] of Object.entries(SKILL_WRM)) for (const e of v) {
  const s = typeof e === 'string' ? e : e.step;
  tag.set(k + '|' + s, typeof e === 'object' && 'partial' in e ? { status: 'partial', clause: e.partial } : { status: 'full' });
}
const problems = [], owner = new Map();
docs.forEach((d, fi) => {
  const yr = d.year;
  for (const t of d.tagFixes) {
    const id = t.key + '|' + t.step, had = tag.get(id);
    if (owner.has(id) && owner.get(id) !== yr) problems.push(`${yr}: ${id} also changed by ${owner.get(id)}`);
    owner.set(id, yr);
    if (t.action === 'remove') { if (!had) problems.push(`${yr}: remove of an untagged ${id}`); tag.delete(id); }
    else if (t.action === 'full') { if (had?.status === 'full') problems.push(`${yr}: full on a tag already full: ${id}`); tag.set(id, { status: 'full' }); }
    else if (t.action === 'add') { if (had) problems.push(`${yr}: add on a tag that exists: ${id}`); tag.set(id, 'partial' in t ? { status: 'partial', clause: t.partial } : { status: 'full' }); }
    else if (t.action === 'partial') {
      // the first file is the one being checked and must carry the clause in `partial`; older lane files (R, Y1) keep it in `why`
      if (typeof t.partial !== 'string' || !t.partial) { if (fi === 0) problems.push(`${yr}: partial with no structured clause: ${id}`); }
      tag.set(id, { status: 'partial', clause: t.partial ?? t.why }); }
    else if (t.action === 'opts') { if (!had) problems.push(`${yr}: opts on an untagged ${id}`); }
    else problems.push(`${yr}: unknown action ${t.action} on ${id}`);
  }
});
let nWant = 0;
for (const d of docs) {
  const yr = d.year, want = new Map();
  for (const [sid, s] of Object.entries(d.steps)) {
    if (s.verdict !== 'full' && s.direct.length) problems.push(`${yr}: ${sid} is ${s.verdict} but lists a FULL direct skill`);
    for (const e of s.direct) want.set(e.key + '|' + sid, { status: 'full' });
    for (const e of s.partial) {
      const id = e.key + '|' + sid, w = want.get(id);
      if (w?.status === 'full') continue;
      want.set(id, { status: 'partial', clause: w && !w.clause.includes(e.missing) ? w.clause + '; ' + e.missing : e.missing });
    }
  }
  nWant += want.size;
  for (const [id, w] of want) {
    const got = tag.get(id);
    if (!got) problems.push(`${yr}: ${id}: not tagged after the merge (${w.status})`);
    else if (got.status !== w.status) problems.push(`${yr}: ${id}: ${got.status} after the merge, the file says ${w.status}`);
    else if (w.status === 'partial' && got.clause !== w.clause) problems.push(`${yr}: ${id}: clause after the merge differs\n     merged: ${got.clause}\n     file:   ${w.clause}`);
  }
  for (const id of tag.keys()) { const sid = id.split('|')[1]; if (d.steps[sid] && !want.has(id)) problems.push(`${yr}: ${id}: still tagged after the merge, but not a direct or partial skill`); }
}
// site lessons (owner rule 2026-10-16): a lesson is not a WRM small step, so no file's tagFixes may name one, every tagFix of the
// first file names a step of that file (an older lane may tag another year's step), and the first file's `lessons` section holds exactly its year's entries of data/curriculum/site-lessons.json
{
  const site = JSON.parse(fs.readFileSync(R + 'data/curriculum/site-lessons.json', 'utf8')).lessons;
  for (const d of docs) for (const t of d.tagFixes) {
    if (/\|-\|/.test(t.step) || (d.lessons && d.lessons[t.step])) problems.push(`${d.year}: tagFix names a site lesson: ${t.key}|${t.step}`);
    else if (d === docs[0] && !d.steps[t.step]) problems.push(`${d.year}: tagFix names a step outside its own file: ${t.key}|${t.step}`);
  }
  const d0 = docs[0];
  if (d0.lessons) {
    const want = site.filter(l => l.wrmYear === d0.year).map(l => l.id), got = Object.keys(d0.lessons);
    for (const id of want) if (!d0.lessons[id]) problems.push(`${d0.year}: site lesson not in the lessons section: ${id}`);
    for (const id of got) if (!want.includes(id)) problems.push(`${d0.year}: lessons section has ${id}, not a ${d0.year} entry of site-lessons.json`);
  }
}
console.log(problems.join('\n'));
console.log(`mergecheck: ${docs.map(d => d.year).join(' + ')}: ${nWant} direct/partial tags, ${docs.reduce((a, d) => a + d.tagFixes.length, 0)} tagFixes; ${problems.length} problems`);
console.log(problems.length ? 'mergecheck: FAIL' : 'mergecheck: OK');
process.exit(problems.length ? 1 : 0);
