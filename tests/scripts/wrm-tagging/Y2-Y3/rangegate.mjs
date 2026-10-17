// r15 RANGECHECK (critic r14 M13 / N17, brief rule 7 "range must match"): a skill + opts is `full` only when its items stay
// inside the step's number range. Every number of an item's question text and answer (operands, readings, conversions,
// totals; clock times read as times, not numbers) is held to the entry's CEILING:
//   the title's own bound when it names one ("Numbers to 20", "Bonds within 20", "Compare numbers to 1,000"), else the
//   grade band at the entry's school week: Grade 1 (Y2) 100 before W08 and 120 from W08 (count to 120, 1.NBT.A.1),
//   Grade 2 (Y3) 1,000 (2.NBT). Money (amounts in cents), clock and elapsed-time skills, angles and the shape skills are
//   exempt (fixed domains: a payload in cents or minutes is not a number range).
//   FULL     every item of every DIRECT link (and of a partial link the entry also lists) is within the ceiling, or the
//            entry is not full: one item above it is a finding
//   PARTIAL  a direct / partial link whose items pass the ceiling must say so in the entry's clause (a number above the
//   / GAP    ceiling, or "pass / above / beyond / over") — a clause may not leave the overshoot unsaid
// usage: node rangegate.mjs Y2 Y3 [--n 40] [--seed S] [--step K] [--all]   exit 1 on any finding (build.mjs runs rangeFinds)
export const EXEMPT = /^measurement:(?:time_|elapsed_|clock_|order_clocks|mixed_time|money|coin_|equiv_coin|enough_money|make_change|days_|months_|calendar)|^angles_lines:|^shapes_early:|^shapes_classify:|^shapes:/;
// a title bound: "to 20", "within 20", "to 1,000" (not "to the next 10", "to 5 minutes", "Roman numerals to 12", "bonds within
// 10" applied to tens and hundreds)
export function titleBound(title) {
  const t = String(title);
  if (/next 10|nearest|minutes|roman|apply number bonds/i.test(t)) return null;
  const m = t.match(/\b(?:to|within|up to)\s+(\d{1,3}(?:,\d{3})*|\d+)\b/i);
  return m ? +m[1].replace(/,/g, '') : null;
}
export function ceilingOf(year, title, week) {
  const tb = titleBound(title);
  if (tb != null) return { c: tb, why: `the title's own bound (${tb})` };
  if (year === 'Y2') return week != null && week < 8 ? { c: 100, why: 'the Grade 1 band before W08 (100)' } : { c: 120, why: 'the Grade 1 band from W08 (120)' };
  if (year === 'Y3') return { c: 1000, why: 'the Grade 2 band (1,000)' };
  return { c: Infinity, why: 'no band' };
}
// the numbers an item deals: question text and answer (a list answer "4, 10, 12" or "341,417,709" is several numbers)
export function itemNumbers(i) {
  const out = [];
  const txt = String(i.text || '').replace(/\b\d{1,2}:\d\d\b/g, ' ').replace(/\b(\d{1,3})((?:,\d{3})+)(?![\d,])/g, (_, a, b) => a + b.replace(/,/g, ''));
  for (const m of txt.matchAll(/(?<![\d.])\d+(?:\.\d+)?(?![\d])/g)) out.push(+m[0]);
  let a = String(i.a ?? '').replace(/\b\d{1,2}:\d\d\b/g, ' ');
  if (/^\d{1,3}(?:,\d{3})+$/.test(a.trim()) && /^(?:number|)$/.test(i.at || '')) a = a.replace(/,/g, '');
  for (const part of a.split(/[,;]/)) for (const m of part.matchAll(/(?<![\d.])\d+(?:\.\d+)?(?![\d])/g)) out.push(+m[0]);
  return out;
}
const NAMES_OVER = /\b(?:pass(?:es|ing)?|above|beyond|over|more than \d|larger than \d|bigger than \d)\b/i;
// every finding of one links file. itemsOf(key, opts) -> items {text, a, at}; weekOf(id) -> school week (or null)
export function rangeFinds(out, itemsOf, year, weekOf = () => null) {
  const finds = [], rows = [];
  for (const [sec, tag] of [['steps', 'step'], ['lessons', 'lesson']]) for (const [id, s] of Object.entries(out[sec] || {})) {
    const { c, why } = ceilingOf(year, s.title || '', weekOf(id));
    const clause = [s.missing, ...(s.partial || []).map(p => p.missing)].join(' ; ');
    const clauseNums = [...String(clause).replace(/(\d),(\d{3})/g, '$1$2').matchAll(/\d+/g)].map(m => +m[0]);
    for (const [role, list] of [['direct', s.direct || []], ['partial', s.partial || []]]) for (const e of list) {
      if (EXEMPT.test(e.key)) continue;
      const its = itemsOf(e.key, e.opts || {});
      const over = its.map(i => ({ i, mx: Math.max(0, ...itemNumbers(i)) })).filter(x => x.mx > c);
      const mx = Math.max(0, ...its.map(i => Math.max(0, ...itemNumbers(i))));
      rows.push({ id, tag, verdict: s.verdict, role, key: e.key, opts: e.opts || {}, ceiling: c, max: mx, over: over.length, n: its.length });
      if (!over.length) continue;
      const ex = over.sort((a, b) => b.mx - a.mx)[0];
      const exS = `${String(ex.i.text || '').slice(0, 60)} → ${String(ex.i.a || '').slice(0, 24)}`;
      if (s.verdict === 'full' && role === 'direct') finds.push({ kind: 'FULL', id, tag, title: s.title, key: e.key, opts: e.opts || {}, msg: `full, but ${over.length} of ${its.length} items of ${role} ${e.key}${JSON.stringify(e.opts || {})} pass the ceiling ${c} (${why}); largest ${ex.mx}: "${exS}"` });
      else if (!(clauseNums.some(n => n > c) || NAMES_OVER.test(clause))) finds.push({ kind: 'CLAUSE', id, tag, title: s.title, key: e.key, opts: e.opts || {}, msg: `${s.verdict}: ${over.length} of ${its.length} items of ${role} ${e.key}${JSON.stringify(e.opts || {})} pass the ceiling ${c} (${why}), largest ${ex.mx}, and the clause never says so: "${clause.slice(0, 140)}"` });
    }
  }
  return { finds, rows };
}

// ---- standalone: fresh seeds, both years ----
if (import.meta.url === `file://${process.argv[1]}`) {
  const _m = new Map(); globalThis.localStorage ??= { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
  globalThis.window ??= globalThis;
  const R = new URL('../../../../', import.meta.url).pathname, HERE = new URL('.', import.meta.url).pathname;
  const _log = console.log, _warn = console.warn; console.log = () => {}; console.warn = () => {};
  const G = await import(R + 'js/modules/generate-question.js');
  console.log = _log; console.warn = _warn;
  const fs = await import('fs'); const { execFileSync } = await import('child_process');
  const TR = await import(HERE + 'titlerep.mjs'); const MK = await import(HERE + 'markers.mjs');
  const a = process.argv.slice(2), arg = (k, d) => a.includes(k) ? +a[a.indexOf(k) + 1] : d;
  const N = arg('--n', 40), SEED = arg('--seed', 70001), STEP = arg('--step', 97);
  const itemsOf = TR.itemGen(G.generateQuestionFor, N, SEED, STEP);
  const SITE = JSON.parse(fs.readFileSync(R + 'data/curriculum/site-lessons.json', 'utf8'));
  let bad = 0;
  for (const y of a.filter(x => /^Y\d$/.test(x))) {
    const f = JSON.parse(fs.readFileSync(R + `data/curriculum/links/${y}.json`, 'utf8'));
    const sheet = { Y2: 'Grade 1', Y3: 'Grade 2' }[y];
    const xl = JSON.parse(execFileSync('python3', ['-I', HERE + 'xlsx.py', R + 'data/curriculum/source/Awsaj-Domain-Sequence-K-5-2026-27.xlsx', sheet]).toString());
    const SWK = MK.schoolWeeks(Object.fromEntries(Object.entries(f.steps).map(([i, s]) => [i, s.title])), xl);
    for (const l of SITE.lessons) if (f.lessons?.[l.id]) SWK[l.id] = l.firstWeek ? +String(l.firstWeek).replace(/\D/g, '') : l.flag === 'enrich-native' ? 0 : 38;
    const { finds, rows } = rangeFinds(f, itemsOf, y, id => SWK[id] === 999 ? null : SWK[id]);
    if (a.includes('--all')) for (const r of rows) console.log(y, r.id, r.verdict, r.role, r.key, JSON.stringify(r.opts), 'max', r.max, 'ceiling', r.ceiling, r.over ? `OVER ${r.over}/${r.n}` : '');
    for (const x of finds) console.log('RANGECHECK', x.kind, x.id, '|', x.title, '|', x.msg);
    console.log(`rangecheck ${y}: ${rows.length} direct / partial links, ${rows.filter(r => r.over).length} pass their ceiling, ${finds.length} findings`);
    bad += finds.length;
  }
  process.exitCode = bad ? 1 : 0;
}
