// r10 (critic r9 N7): simulate the lead's merge of a year's tagFixes into the LIVE SKILL_WRM (js/modules/wrm.js) and assert
// that every step of the year comes out as the links file says: each direct skill FULL, each partial skill PARTIAL with this
// file's clause, nothing else tagged to the step, the step's coverage (any full -> full, any partial -> partial, else gap)
// equal to its verdict, and no partial or gap step with a direct (full) skill.
// Merge semantics (the Y2/Y3 tagFix shape): remove -> drop the key's entry for the step; partial -> {step, partial: why};
// add with why "partial: X" -> {step, partial: X}; any other add -> full.
// usage: node tests/scripts/wrm-tagging/mergecheck23.mjs Y2 Y3     (build.mjs also calls mergeCheck on the file it writes)
import fs from 'fs';
const R = new URL('../../../', import.meta.url).pathname;
export async function mergeCheck(L) {
  if (!globalThis.localStorage) { const m = new Map(); globalThis.localStorage = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; }
  globalThis.window ??= globalThis; globalThis.document ??= {};
  const { SKILL_WRM } = await import(R + 'js/modules/wrm.js');
  const { SKILL_ALIASES } = await import(R + 'js/modules/skill-aliases.js');
  const { SKILLS } = await import(R + 'js/modules/data.js');
  const live = k => { const [c, s] = k.split(':'); return (SKILLS[c] || []).some(x => x && x.v === s); };
  const resolve = k => { if (live(k)) return k; const a = SKILL_ALIASES[k]; if (a) { const r = k.split(':')[0] + ':' + a.skillId; if (live(r)) return r; } return 'DEAD:' + k; };
  const M = {}; for (const [k, l] of Object.entries(SKILL_WRM)) M[k] = l.map(e => typeof e === 'string' ? { step: e } : { ...e });
  const P = []; const seen = new Set();
  for (const t of L.tagFixes) {
    const sk = t.key + '|' + t.step; if (seen.has(sk)) P.push(`DUPFIX ${sk}`); seen.add(sk);
    const list = (M[t.key] ??= []); const others = list.filter(e => e.step !== t.step); const cur = list.filter(e => e.step === t.step);
    if (t.action === 'remove') { if (!cur.length) P.push(`REMOVE-NOOP ${sk}`); M[t.key] = others; }
    else if (t.action === 'partial') { if (!cur.length) P.push(`PARTIAL-NOENTRY ${sk}`); M[t.key] = [...others, { step: t.step, partial: t.why }]; }
    else if (t.action === 'add') { const m = String(t.why).match(/^partial: ([\s\S]*)/); M[t.key] = [...others, m ? { step: t.step, partial: m[1] } : { step: t.step }]; }
    else P.push(`UNKNOWN ${t.action} ${sk}`);
  }
  let tags = 0;
  for (const [id, s] of Object.entries(L.steps)) {
    const want = new Map();
    for (const d of s.direct) want.set(d.key, { v: 'full' });
    for (const p of s.partial) { if (want.has(p.key)) P.push(`BOTH-DIRECT-PARTIAL ${id} ${p.key}`); want.set(p.key, { v: 'partial', c: p.missing }); }
    tags += want.size;
    const got = new Map();
    for (const [k, l] of Object.entries(M)) for (const e of l) if (e.step === id) { const rk = resolve(k); if (got.has(rk)) P.push(`DUP-ENTRY ${id} ${k}`); got.set(rk, { v: e.partial ? 'partial' : 'full', c: e.partial }); }
    for (const [k, w] of want) { const g = got.get(k); if (!g) { P.push(`MISSING ${id} ${k} want ${w.v}`); continue; }
      if (g.v !== w.v) P.push(`VERDICT ${id} ${k} links=${w.v} merged=${g.v}`);
      else if (w.v === 'partial' && g.c !== w.c) P.push(`CLAUSE ${id} ${k}\n   links : ${w.c}\n   merged: ${g.c}`); }
    for (const [k, g] of got) if (!want.has(k)) P.push(`EXTRA ${id} ${k} merged=${g.v}`);
    const vals = [...got.values()]; const cov = vals.some(g => g.v === 'full') ? 'full' : vals.some(g => g.v === 'partial') ? 'partial' : 'gap';
    if (cov !== s.verdict) P.push(`STEPVERDICT ${id} links=${s.verdict} merged=${cov}`);
    if (s.verdict !== 'full' && s.direct.length) P.push(`PARTIAL-WITH-DIRECT ${id} verdict=${s.verdict} direct ${s.direct.map(d => d.key).join(',')}`);
  }
  return { problems: P, tags, fixes: L.tagFixes.length };
}
if (process.argv[1] && process.argv[1].endsWith('mergecheck23.mjs')) {
  let bad = 0;
  for (const Y of process.argv.slice(2).length ? process.argv.slice(2) : ['Y2', 'Y3']) {
    const L = JSON.parse(fs.readFileSync(R + `data/curriculum/links/${Y}.json`, 'utf8'));
    const r = await mergeCheck(L); bad += r.problems.length;
    if (r.problems.length) console.log(r.problems.join('\n'));
    console.log(`mergecheck ${Y}: ${r.tags} direct/partial tags, ${r.fixes} tagFixes; ${r.problems.length} problems`);
  }
  console.log(bad ? 'mergecheck: FAIL' : 'mergecheck: OK'); process.exit(bad ? 1 : 0);
}
