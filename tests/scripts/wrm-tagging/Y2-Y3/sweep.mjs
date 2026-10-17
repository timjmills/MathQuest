// Y2 / Y3 root-cause sweep (round 12, ported from the Y5 lane's sweep.mjs after its critic r6-r8 class N): every pre / related
// why and every partial clause of Y2.json / Y3.json (steps and site lessons) checked against items generated on FRESH seeds
// (not the build's marker seeds, not any critic seed of r1-r11) with the link's own opts:
//   (a) every claim word of claims.mjs (unit, representation, form, operation, number kind, idea, context) in the why is true
//       of the items; every step id the why cites counts with its FULL wrm-steps.json title (the cited title is a claim:
//       "Y2.B7.S7 Measure in litres" on a millilitre cylinder is false); a clause's "never X" / "no X" operation must be false
//       of the items, and its first part's rule claims true
//   (b) no customary unit on a metric or time entry, and no metric-only link on a customary entry (a metric pre is allowed
//       only when its why names the metric measure it brings)
//   (c) no pre harder than its entry: a pre's largest number past 1.5 x the entry's ceiling (its own items, its title) and
//       past 20 is reported for review
// usage: node sweep.mjs Y2 Y3 [--n 30] [--json out.json]     prints every finding and the counts; exit 1 on any (a), (a-neg)
// or (b) finding that is not listed in sweep-reviewed.json (a reviewed (c) never fails: an easier task with larger numbers)
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../../', import.meta.url).pathname;
const HERE = new URL('.', import.meta.url).pathname;
const _log = console.log, _warn = console.warn; console.log = () => {}; console.warn = () => {};
const g = await import(R + 'js/modules/generate-question.js');
console.log = _log; console.warn = _warn;
const fs = await import('fs');
const C = await import('./claims.mjs');
const args = process.argv.slice(2);
const years = args.filter(a => /^Y\d$/.test(a));
const N = args.includes('--n') ? +args[args.indexOf('--n') + 1] : 30, BASE = 27449, STEP = 89;
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const titles = {}, blockOf = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) { titles[s.id] = s.title; blockOf[s.id] = b.name; }
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&times;/g, '×').replace(/&divide;/g, '÷').replace(/&minus;/g, '−').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
const lab = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);
const cache = new Map();
export function gen(e) {
  const id = e.key + JSON.stringify(e.opts || {}); if (cache.has(id)) return cache.get(id);
  const [c, k] = e.key.split(':'); const items = []; let max = 0;
  for (let i = 0; i < N; i++) { let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts: e.opts || {}, seed: BASE + i * STEP, itemIndex: i % 20, itemCount: 20 }); } catch { continue; }
    if (!q) continue;
    const it = { text: strip(q.text), a: strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans), x: strip([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lab).join(' ; ')),
      vis: strip(q.visual), raw: String(q.visual || '').toLowerCase().slice(0, 6000), tpl: q.cell ? q.cell.template : '', pay: q.cell ? JSON.stringify(q.cell.payload) : '' };
    items.push(it);
    if (!/^measurement:(time|elapsed|clock|days|months|calendar)/.test(e.key)) for (const m of `${it.text} ${it.a}`.replace(/\d{1,2}:\d\d/g, ' ').matchAll(/(?<![\d.])\d{1,3}(?:,\d{3})+(?![\d.])|(?<![\d.,])\d+(?![\d,])/g)) { const v = +m[0].replace(/,/g, ''); if (v < 1e7) max = Math.max(max, v); }
  }
  const r = { items, max }; cache.set(id, r); return r;
}
// the claim text of a why: the why with the boilerplate of where the step sits removed, plus the FULL title of every step it
// cites (when the why does not already carry it). "(the adding half)" removes the other half of an "add and subtract" title.
const BOIL = /\((?:prior learning|taught (?:before|earlier|later|the same)|the same week|Grade \d|K\b|topic ladder|next step|a later step|earlier step this builds on)[^)]*\)|prior learning(?: wk W\d+)?|taught (?:earlier|before this step in the block)(?:, W\d+)?|lower grade, same (?:idea|cluster)|on the W\d+ list(?: as [^,;)]*)?|\bW\d+\b/gi;
const HALF = { adding: /\bsubtract\w*|\bminus\b/gi, subtracting: /\badd(?:s|ing|ition)?\b/gi, multiplication: /\bdivi\w*|\bdivision\b/gi, division: /\bmultipl\w*|times-tables?/gi };
export function claimText(why) {
  let w = String(why || '');
  const ids = [...new Set([...w.matchAll(/(?:R|Y\d)\.B\d+\.S\d+/g)].map(m => m[0]))];
  const h = w.match(/\bthe (adding|subtracting|multiplication|division) half\b/);
  // "nearest live practice": the cited step's skill is only its partial practice, so its title is not claimed (Y5's rule)
  const nlp = /nearest live practice/.test(w);
  // the school teaches the UK money steps in US dollars and cents (the school's pacing): a cited title's pounds, pence and
  // notes are read as dollars, cents and bills
  const us = t => /pound|pence|\bnotes\b/i.test(t) ? t.replace(/\bpounds\b/gi, 'dollars').replace(/\bpound\b/gi, 'dollar').replace(/\bpence\b/gi, 'cents').replace(/\bnotes\b/gi, 'bills').replace(/£/g, '$') : t;
  let extra = '';
  for (const id of ids) { const t = titles[id]; if (!t) continue; if (nlp) { w = w.split(t).join(' '); continue; } if (!w.includes(t)) extra += ' ' + us(t); else w = w.split(t).join(us(t)); }
  let all = w.replace(/\bthe (adding|subtracting|multiplication|division) half\b/, ' ').replace(/(?:R|Y\d)\.B\d+\.S\d+/g, ' ').replace(BOIL, ' ') + ' ' + extra;
  if (h) all = all.replace(HALF[h[1]], ' ');
  return all;
}
const METRIC_BLOCK = /length|height|mass|capacity|volume|temperature|time/i;
const metricEntry = (sid, s) => !C.custWords.test(s.title) && (METRIC_BLOCK.test(blockOf[sid] || '') || C.metricWords.test(s.title) || /time|clock|o'clock|minutes|hours/i.test(s.title));
const custEntry = (sid, s) => C.custWords.test(s.title) && !C.metricWords.test(s.title);
const titleCeil = t => { const m = (String(t).match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit|-D|s\b|dp|st|nd|rd|th)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of String(t).matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };
let reviewed = {}; try { reviewed = JSON.parse(fs.readFileSync(HERE + 'sweep-reviewed.json', 'utf8')); } catch (_) {}
export function sweep(d) {
  const U = { ...d.steps, ...(d.lessons || {}) };
  const finds = []; let nLinks = 0, nClauses = 0, nClaims = 0;
  const own = {};
  for (const [sid, s] of Object.entries(U)) { let c = titleCeil(s.title); for (const e of [...s.direct, ...s.partial]) c = Math.max(c, gen(e).max); own[sid] = c; }
  for (const [sid, s] of Object.entries(U)) {
    for (const role of ['pre', 'related']) for (const e of s[role]) { nLinks++;
      const r = gen(e), txt = claimText(e.why);
      for (const h of C.claimHits(txt, r.items)) { nClaims++; if (!h.ok) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'a', msg: `claims "${h.word}" (${h.claim}) but ${h.hit}/${h.n} items`, why: e.why }); }
      for (const h of C.halfHits(e.why, r.items)) { nClaims++; if (!h.ok) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'a', msg: `marked "${h.claim}" but ${h.hit}/${h.n} items deal the other half`, why: e.why }); }
      const all = r.items.map(C.itemWords).join(' | ');
      if (metricEntry(sid, s) && C.CUST.test(all)) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'b', msg: `customary units on a metric / time entry (${(all.match(C.CUST) || [''])[0]})`, why: e.why });
      if (custEntry(sid, s) && C.MET.test(all) && !C.CUST.test(all) && !(role === 'pre' && C.metricWords.test(C.positive(claimText(e.why)))))
        finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'b', msg: 'metric-only link on a customary entry, its why names no metric measure', why: e.why });
      if (role === 'pre' && own[sid] && r.max > 1.5 * own[sid] && r.max > 20) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'c', msg: `pre reaches ${r.max}, past 1.5 x the entry's ceiling ${own[sid]}`, why: e.why });
    }
    for (const e of s.partial) { nClauses++;
      const r = gen(e);
      for (const h of C.negatedHits(e.missing, r.items)) { nClaims++; if (!h.ok) finds.push({ sid, role: 'partial', key: e.key, opts: e.opts, kind: 'a-neg', msg: `clause says "${h.part.slice(0, 60)}" (${h.claim}) but ${h.hit}/${h.n} items do it`, why: e.missing }); }
      for (const h of C.claimHits(e.missing.split(/\bbut\b|;/)[0], r.items, { rulesOnly: true })) { nClaims++; if (!h.ok) finds.push({ sid, role: 'partial', key: e.key, opts: e.opts, kind: 'a', msg: `clause claims "${h.word}" (${h.claim}) but ${h.hit}/${h.n} items`, why: e.missing }); }
    }
  }
  for (const f of finds) { const sig = `${f.sid}|${f.role}|${f.key}|${JSON.stringify(f.opts || {})}|${f.msg.replace(/\d+\/\d+ items|reaches \d+|ceiling \d+/g, '#')}`; f.sig = sig; f.reviewed = reviewed[sig] || null; }
  return { finds, nLinks, nClauses, nClaims };
}
if (process.argv[1] && process.argv[1].endsWith('sweep.mjs')) {
  let bad = 0; const allF = [];
  for (const Y of years.length ? years : ['Y2', 'Y3']) {
    const d = JSON.parse(fs.readFileSync(R + `data/curriculum/links/${Y}.json`, 'utf8'));
    const { finds, nLinks, nClauses, nClaims } = sweep(d);
    for (const f of finds) _log(`[${f.kind}${f.reviewed ? ' reviewed' : ''}] ${f.sid} ${f.role} ${f.key}${f.opts ? JSON.stringify(f.opts) : ''}: ${f.msg}\n      why: ${String(f.why).slice(0, 220)}${f.reviewed ? '\n      review: ' + f.reviewed : ''}`);
    const open = finds.filter(f => f.kind !== 'c' && !f.reviewed);
    bad += open.length; allF.push(...finds);
    _log(`sweep ${Y}: ${nLinks} links, ${nClauses} partial clauses, ${nClaims} claims checked on ${N} fresh-seed items each; ${finds.length} findings (a ${finds.filter(f => f.kind === 'a').length}, a-neg ${finds.filter(f => f.kind === 'a-neg').length}, b ${finds.filter(f => f.kind === 'b').length}, c ${finds.filter(f => f.kind === 'c').length}); open (a / a-neg / b, not reviewed) ${open.length}; reviewed ${finds.filter(f => f.reviewed).length}`);
  }
  const ji = args.indexOf('--json'); if (ji >= 0) fs.writeFileSync(args[ji + 1], JSON.stringify(allF, null, 1));
  _log(bad ? 'sweep: FAIL' : 'sweep: OK'); process.exit(bad ? 1 : 0);
}
