// r10 (critic r9 N7): simulate the lead's merge of a year's tagFixes into the LIVE SKILL_WRM (js/modules/wrm.js) and assert
// that every step of the year comes out as the links file says: each direct skill FULL, each partial skill PARTIAL with this
// file's clause, nothing else tagged to the step, the step's coverage (any full -> full, any partial -> partial, else gap)
// equal to its verdict, and no partial or gap step with a direct (full) skill.
// Merge semantics (r11, one reading of all three lanes' shapes): remove -> drop; partial -> {step, partial: t.partial ?? why};
// add -> partial when it has a `partial` field (or a "partial: X" why), else full; full -> full; opts -> no change.
// usage: node tests/scripts/wrm-tagging/Y2-Y3/mergecheck23.mjs Y2 Y3     (build.mjs also calls mergeCheck on the file it writes)
import fs from 'fs';
const R = new URL('../../../../', import.meta.url).pathname;
export async function mergeCheck(L) {
  if (!globalThis.localStorage) { const m = new Map(); globalThis.localStorage = { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) }; }
  globalThis.window ??= globalThis; globalThis.document ??= {};
  const { SKILL_WRM } = await import(R + 'js/modules/wrm.js');
  const { SKILL_ALIASES } = await import(R + 'js/modules/skill-aliases.js');
  const { SKILLS } = await import(R + 'js/modules/data.js');
  const live = k => { const [c, s] = k.split(':'); return (SKILLS[c] || []).some(x => x && x.v === s); };
  const resolve = k => { if (live(k)) return k; const a = SKILL_ALIASES[k]; if (a) { const r = k.split(':')[0] + ':' + a.skillId; if (live(r)) return r; } return 'DEAD:' + k; };
  const M = {}; for (const [k, l] of Object.entries(SKILL_WRM)) M[k] = l.map(e => typeof e === 'string' ? { step: e } : { ...e });
  const P = [];
  // r11 (critic r10 A3b): the other lanes' tagFixes that touch THIS file's steps (the passed R, Y1 and Y4 files, vendored
  // read-only under tests/scripts/wrm-tagging/Y2-Y3/inputs/) are merged too, before and after this file's own fixes, so a
  // fix another lane carries on a Y2/Y3 step must agree with this file whichever lane the lead merges first.
  const INP = R + 'data/curriculum/links/';
  const foreign = [];
  for (const y of ['R', 'Y1', 'Y4', 'Y5', 'Y6']) { let F; try { F = JSON.parse(fs.readFileSync(INP + y + '.json', 'utf8')); } catch (_) { P.push(`NO-INPUT ${y}.json`); continue; }
    for (const t of F.tagFixes || []) if (L.steps[t.step]) foreign.push({ ...t, lane: y }); }
  const base = JSON.stringify(M);
  const apply = (M, fixes, tagP) => { const seen = new Map();
    for (const t of fixes) {
      const sk = t.key + '|' + t.step; const prevA = seen.get(sk);
      // the same tag fixed twice by ONE file is a defect, except a 'remove' followed by an 'add' (a partial tag made full)
      if (prevA && !(prevA.lane === (t.lane || '') && prevA.a === 'remove' && t.action === 'add') && prevA.lane === (t.lane || '')) tagP(`DUPFIX ${sk}`);
      seen.set(sk, { a: t.action, lane: t.lane || '' });
      const list = (M[t.key] ??= []); const others = list.filter(e => e.step !== t.step); const cur = list.filter(e => e.step === t.step);
      // one reading of every lane's vocabulary: remove drops; partial -> clause = t.partial ?? t.why; add -> PARTIAL when it
      // has a `partial` field (or a "partial: " why), else FULL; full -> FULL; opts -> no change to the tag
      if (t.action === 'remove') { if (!cur.length) tagP(`REMOVE-NOOP ${sk}`); M[t.key] = others; }
      else if (t.action === 'partial') { M[t.key] = [...others, { step: t.step, partial: t.partial ?? t.why }]; }
      else if (t.action === 'add') { const m = String(t.why).match(/^partial: ([\s\S]*)/); M[t.key] = [...others, 'partial' in t ? { step: t.step, partial: t.partial } : m ? { step: t.step, partial: m[1] } : { step: t.step }]; }
      else if (t.action === 'full') { M[t.key] = [...others, { step: t.step }]; }
      else if (t.action === 'opts') { if (!cur.length) tagP(`OPTS-NOENTRY ${sk}`); }
      else tagP(`UNKNOWN ${t.action} ${sk}`);
    } return M; };
  // this file's own shape: every partial-setting fix carries a `partial` field, and no 'add' is partial
  for (const t of L.tagFixes) { if (t.action === 'partial' && !('partial' in t)) P.push(`SHAPE partial without a partial field ${t.key}|${t.step}`);
    if (t.action === 'add' && ('partial' in t || /^partial: /.test(t.why))) P.push(`SHAPE add that sets a partial ${t.key}|${t.step}`); }
  const runs = [['own', apply(JSON.parse(base), L.tagFixes, x => P.push(x))]];
  if (foreign.length) { runs.push(['others first', apply(apply(JSON.parse(base), foreign, x => P.push('FOREIGN ' + x)), L.tagFixes, () => {})]);
    runs.push(['others last', apply(apply(JSON.parse(base), L.tagFixes, () => {}), foreign, () => {})]); }
  let tags = 0;
  for (const [runName, M] of runs) { const P0 = P.length; tags = 0;
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
  for (let i = P0; i < P.length; i++) if (runName !== 'own') P[i] = `[${runName}] ` + P[i];
  }
  return { problems: [...new Set(P)], tags, fixes: L.tagFixes.length, foreign: foreign.length };
}
if (process.argv[1] && process.argv[1].endsWith('mergecheck23.mjs')) {
  let bad = 0;
  for (const Y of process.argv.slice(2).length ? process.argv.slice(2) : ['Y2', 'Y3']) {
    const L = JSON.parse(fs.readFileSync(R + `data/curriculum/links/${Y}.json`, 'utf8'));
    const r = await mergeCheck(L); bad += r.problems.length;
    if (r.problems.length) console.log(r.problems.join('\n'));
    console.log(`mergecheck ${Y}: ${r.tags} direct/partial tags, ${r.fixes} tagFixes, ${r.foreign} other-lane fixes on its steps (merged before and after); ${r.problems.length} problems`);
  }
  console.log(bad ? 'mergecheck: FAIL' : 'mergecheck: OK'); process.exit(bad ? 1 : 0);
}
