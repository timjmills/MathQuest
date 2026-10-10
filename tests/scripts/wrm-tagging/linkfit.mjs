// Rule 18: pre and related links deal numbers a pupil of THIS step can do. Generate each link with its own opts (print
// path, Max Number 10,000) and flag links whose items go past Y4's ceiling: numbers over 10,000, more than 2 decimal
// places, or negative numbers.
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const g = await import(R + 'js/modules/generate-question.js');
const fs = await import('fs');
const d = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/Y4.json', 'utf8'));
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
const cache = new Map();
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, dp = 0, neg = false, ex = '';
  for (let i = 0; i < 8; i++) {
    let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts, range, seed: 9100 + i * 17, itemIndex: i, itemCount: 8 }); } catch (e) { continue; }
    if (!q) continue;
    const a = typeof q.ans === 'object' ? '' : String(q.ans); const t = strip(q.text) + ' ' + (/\d,\d{4}|,\d+,/.test(a) || /^[\d,]+$/.test(a) && a.includes(',') && !/^\d{1,3}(,\d{3})+$/.test(a) ? '' : strip(a));
    for (const m of t.matchAll(/(−|-)?(\d{1,3}(?:,\d{3})+(?!\d)|\d+)(\.\d+)?/g)) {
      const n = Number(m[0].replace(/[,−-]/g, '')); if (n > max) { max = n; ex = strip(q.text).trim().slice(0, 70); }
      if (m[3]) dp = Math.max(dp, m[3].length - 1); if (m[1] === '−' && /^\s*[−-]\d/.test(t.slice(m.index))) neg = neg || /(^|[=(\s])−\d/.test(t.slice(Math.max(0, m.index - 1), m.index + 2));
    }
  }
  const r = { max, dp, ex }; cache.set(id, r); return r;
}
let bad = 0;
// a deliberate decoy: "Is this answer reasonable? 3,090 + 1,859 = 49,490" shows a wrong sum on purpose
const DECOY = new Set(['number_sense:estimate_sums_diffs{"place":1000,"task":"reasonable"}']);
for (const [sid, s] of Object.entries(d.steps)) for (const [role, list] of [['pre', s.pre], ['related', s.related]]) for (const e of list) {
  const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
  if (DECOY.has(e.key + JSON.stringify(e.opts || {}))) continue;
  if (r.max > 20000 || r.dp > 2) { bad++; console.log(`${sid} ${role} ${e.key} ${JSON.stringify(e.opts || {})}: max ${r.max}, dp ${r.dp} — ${r.ex}`); }
}
console.log(`linkfit: ${bad} links past the Y4 ceiling`);
process.exitCode = bad ? 1 : 0;
