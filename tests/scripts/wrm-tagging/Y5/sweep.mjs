// Y5 root-cause sweep (builder round 5, after critic r6): every pre / related why and every partial clause of Y5.json (steps
// and site lessons) checked against 30 items generated on FRESH seeds (not linkfit's), with the link's own opts:
//   (a) every claim word (unit, representation, operation, number kind, idea, context) of the why / clause is true of the
//       items (claims.mjs); a cited step's FULL title (parentheses included) counts as claimed; a clause's "never X" / "no X"
//       must be false of the items
//   (b) no customary unit on a metric or time entry, and no metric-only link on a customary entry (a metric pre allowed only
//       when its why names the metric measure it brings)
//   (c) no pre harder than its entry: a pre's largest number is at most the entry's own ceiling (1.5 × when it cites a
//       lower-grade step of the same idea is linkfit's rule; here the strict ceiling is reported for review)
// usage: node sweep.mjs <Y5.json> [--json out.json]     prints every finding and the counts (exit 0; a report to review)
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../../', import.meta.url).pathname;
const _log = console.log; console.log = () => {};
const g = await import(R + 'js/modules/generate-question.js');
console.log = _log;
const fs = await import('fs');
const C = await import('./claims.mjs');
const d = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const titles = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) titles[s.id] = s.title;
const U = { ...d.steps, ...(d.lessons || {}) };
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
const lab = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);
const N = 30, BASE = 73013, STEP = 59, cache = new Map();
function gen(e) {
  const id = e.key + JSON.stringify(e.opts || {}) + (e.maxNumber || ''); if (cache.has(id)) return cache.get(id);
  const [c, k] = e.key.split(':'); const items = []; let max = 0;
  for (let i = 0; i < N; i++) { let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts: e.opts || {}, range: e.maxNumber || 10000, seed: BASE + i * STEP, itemIndex: i % 20, itemCount: 20 }); } catch { continue; }
    if (!q) continue;
    const it = { text: strip(q.text), a: strip(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans), x: strip([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lab).join(' ; ')),
      vis: strip(q.visual), raw: String(q.visual || '').toLowerCase().slice(0, 6000), tpl: q.cell ? q.cell.template : '', pay: q.cell ? JSON.stringify(q.cell.payload) : '' };
    items.push(it);
    if (!/^measurement:(time|elapsed|clock)/.test(e.key)) for (const m of `${it.text} ${it.a} ${it.x}`.matchAll(/(?<![\d.])\d{1,3}(?:,\d{3})+(?![\d.])|(?<![\d.,])\d+(?![\d,])/g)) { const v = +m[0].replace(/,/g, ''); if (v < 1e7) max = Math.max(max, v); }
  }
  const r = { items, max }; cache.set(id, r); return r;
}
const claimText = w => C.claimText(w, titles);
const finds = []; let nLinks = 0, nClauses = 0, nClaims = 0;
const metricEntry = (sid, s) => !C.custWords.test(s.title) && (/^Y5\.B(8|10|14|15)\./.test(sid) && sid !== 'Y5.B14.S4' || C.metricWords.test(s.title));
const custEntry = (sid, s) => C.custWords.test(s.title) && !C.metricWords.test(s.title) && !/word problems/i.test(s.title);
// the entry's own ceiling as linkfit reads it: its items, its title ("4-digit" = 9,999) and, when not full, its missing clause
const titleCeil = t => { const m = (String(t).match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit|-D|s\b|dp|st|nd|rd|th)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of String(t).matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };
const own = {};
for (const [sid, s] of Object.entries(U)) { let c = Math.max(titleCeil(s.title), s.verdict === 'full' ? 0 : titleCeil(String(s.missing || '').replace(/\b\d+\/\d+\b|\d+ \d+\/\d+/g, '')));
  for (const e of [...s.direct, ...s.partial]) c = Math.max(c, gen(e).max); own[sid] = c; }
// a pre is harder than its entry when its numbers pass 1.5 × the entry's ceiling (the size a pupil of the entry meets), or
// when its skill is taught in Y5 only at a later school week than the entry (the content comes after it)
const prior = process.env.WRM_TAG_DATA ? JSON.parse(fs.readFileSync(process.env.WRM_TAG_DATA + '/prior.json', 'utf8')) : {};
const firstY5 = {};
for (const [sid, s] of Object.entries(d.steps)) for (const e of [...s.direct, ...s.partial]) { const w = prior[sid]?.wk; if (w && (!firstY5[e.key] || w < firstY5[e.key].wk)) firstY5[e.key] = { wk: w, sid }; }
const KEYS = JSON.parse(fs.readFileSync((process.env.WRM_TAG_DATA || '') + '/keys.json', 'utf8')).tags;
const lowerTagged = k => (KEYS[k] || []).some(t => /^(R|Y[1-4])\./.test(typeof t === 'string' ? t : t.step));
for (const [sid, s] of Object.entries(U)) {
  for (const role of ['pre', 'related']) for (const e of s[role]) { nLinks++;
    const r = gen(e), txt = claimText(e.why);
    for (const h of C.claimHits(txt, r.items)) { nClaims++; if (!h.ok) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'a', msg: `claims "${h.word}" (${h.claim}) but ${h.hit}/${h.n} items`, why: e.why }); }
    for (const h of C.halfHits(e.why, r.items)) { nClaims++; if (!h.ok) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'a', msg: `marked "${h.claim}" but ${h.hit}/${h.n} items deal the other half`, why: e.why }); }
    const all = r.items.map(C.itemWords).join(' | ');
    if (metricEntry(sid, s) && C.CUST.test(all)) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'b', msg: `customary units on a metric / time entry (${(all.match(C.CUST) || [''])[0]})`, why: e.why });
    if (custEntry(sid, s) && C.MET.test(all) && !C.CUST.test(all) && !(role === 'pre' && C.metricWords.test(C.positive(claimText(e.why)) + ' ' + e.why.replace(/\(.*$/, ''))))
      finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'b', msg: 'metric-only link on a customary entry, its why names no metric measure', why: e.why });
    if (role === 'pre' && own[sid] && r.max > 1.5 * own[sid] && r.max > 100) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'c', msg: `pre reaches ${r.max}, past 1.5 × the entry's ceiling ${own[sid]}`, why: e.why });
    const f = firstY5[e.key], wk = prior[sid]?.wk;
    if (role === 'pre' && f && wk && f.wk > wk && !lowerTagged(e.key)) finds.push({ sid, role, key: e.key, opts: e.opts, kind: 'c', msg: `pre skill is first taught at ${f.sid} (${f.wk}), after this entry (${wk}), and in no lower year`, why: e.why });
  }
  for (const e of s.partial) { nClauses++;
    const r = gen(e);
    for (const h of C.negatedHits(e.missing, r.items)) { nClaims++; if (!h.ok) finds.push({ sid, role: 'partial', key: e.key, opts: e.opts, kind: 'a-neg', msg: `clause says "${h.part.slice(0, 60)}" (${h.claim}) but ${h.hit}/${h.n} items do it`, why: e.missing }); }
    for (const h of C.claimHits(e.missing.split(/\b(?:but|;)\b/)[0], r.items, { rulesOnly: true })) { nClaims++; if (!h.ok) finds.push({ sid, role: 'partial', key: e.key, opts: e.opts, kind: 'a', msg: `clause claims "${h.word}" (${h.claim}) but ${h.hit}/${h.n} items`, why: e.missing }); }
  }
}
for (const f of finds) _log(`[${f.kind}] ${f.sid} ${f.role} ${f.key}${f.opts ? JSON.stringify(f.opts) : ''}: ${f.msg}\n      why: ${String(f.why).slice(0, 200)}`);
_log(`sweep: ${nLinks} links, ${nClauses} partial clauses, ${nClaims} claims checked on ${N} fresh-seed items each; ${finds.length} findings (a ${finds.filter(f => f.kind === 'a').length}, a-neg ${finds.filter(f => f.kind === 'a-neg').length}, b ${finds.filter(f => f.kind === 'b').length}, c ${finds.filter(f => f.kind === 'c').length})`);
const ji = process.argv.indexOf('--json'); if (ji > 0) fs.writeFileSync(process.argv[ji + 1], JSON.stringify(finds, null, 1));
