// Rule 18, step-relative: every pre and related link must deal numbers a pupil of THIS step can do.
// For each step: its ceiling is the largest number its own direct/partial items deal (print path, their opts and Max
// Number) or its title names ("3-digit" = 999), or, when larger, its block's ceiling (the unit it is taught in) or the
// largest number of any step the school teaches in an EARLIER week (the xlsx sequence). A link fails when its largest number is past max(1.5 × ceiling, 100), when the school
// teaches the step before W11 and the link deals 4-digit numbers the step does not, or when it deals more than 2 places.
// usage: node linkfit.mjs [--all]   (--all prints every step's result, not only failures)
const _m = new Map(); globalThis.localStorage = { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window = globalThis; globalThis.document = undefined;
const R = new URL('../../../', import.meta.url).pathname;
const g = await import(R + 'js/modules/generate-question.js');
const fs = await import('fs');
const DATA = process.env.WRM_TAG_DATA || '/tmp/claude-0/-home-user-MathQuest/766f9569-7b1f-5e16-90cf-84166df13b4d/scratchpad/wrm-tag-Y4';
const prior = JSON.parse(fs.readFileSync(DATA + '/prior.json', 'utf8'));
const d = JSON.parse(fs.readFileSync(R + 'data/curriculum/links/Y4.json', 'utf8'));
const ALL = process.argv.includes('--all');
const strip = s => String(s ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ');
const NUM = /(\d{1,3}(?:,\d{3})+(?!\d)|\d+)(\.\d+)?/g;
const cache = new Map();
function probe(key, opts, range) {
  const id = key + JSON.stringify(opts) + range; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); let max = 0, dp = 0, ex = '';
  for (let i = 0; i < 8; i++) {
    let q; try { q = g.generateQuestionFor({ category: c, skill: k, opts, range, seed: 9100 + i * 17, itemIndex: i, itemCount: 8 }); } catch (e) { continue; }
    if (!q) continue;
    let t = strip(q.text);
    const a = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans);
    if (/"[xy]":/.test(a)) t += ' ' + [...a.matchAll(/"[xy]":(\d+)/g)].map(m => m[1]).join(' ');   // coordinates
    else if (!/,/.test(a)) t += ' ' + strip(a);                       // an answer with commas may be a list: read the cell instead
    if (q.cell && q.cell.payload) t += ' ' + [...JSON.stringify(q.cell.payload).matchAll(/:(-?\d+(?:\.\d+)?)[,}\]]/g)].map(m => m[1]).join(' ');
    for (const m of t.matchAll(NUM)) {
      const n = Number(m[1].replace(/,/g, '')); if (n > max) { max = n; ex = strip(q.text).trim().slice(0, 60); }
      if (m[2]) dp = Math.max(dp, m[2].length - 1);
    }
  }
  const r = { max, dp, ex }; cache.set(id, r); return r;
}
// a deliberate decoy: "Is this answer reasonable? 3,090 + 1,859 = 49,490" shows a wrong sum on purpose
const TIME = /^measurement:(time|elapsed|clock|order_clocks)/;
const DECOY = new Set(['number_sense:estimate_sums_diffs{"place":1000,"task":"reasonable"}']);
// the title's own numbers, and "n-digit" read as the largest n-digit number
const titleCeil = t => { const m = (t.match(/\d{1,3}(?:,\d{3})+|\d+(?!-digit)/g) || []).map(x => +x.replace(/,/g, ''));
  for (const k of t.matchAll(/(\d)-digit/g)) m.push(10 ** +k[1] - 1); return m.length ? Math.max(...m) : 0; };
// a step's own ceiling: what its direct/partial items deal or its title names
const own = {}; const block = {};
for (const [sid, s] of Object.entries(d.steps)) {
  let c = titleCeil(s.title);
  for (const e of [...s.direct, ...s.partial]) c = Math.max(c, probe(e.key, e.opts || {}, e.maxNumber || 10000).max);
  own[sid] = c; const b = sid.split('.').slice(0, 2).join('.'); block[b] = Math.max(block[b] || 0, c);
}
let bad = 0, checked = 0;
for (const [sid, s] of Object.entries(d.steps)) {
  // the step's own ceiling, its block's (the unit it is taught in), or what the school has already taught in an earlier
  // week (a pupil of this step can do those numbers); never what is taught later
  const wkOf = id => prior[id]?.wk || '';
  const taught = Object.keys(own).filter(id => wkOf(id) && wkOf(sid) && wkOf(id) < wkOf(sid)).reduce((m, id) => Math.max(m, own[id]), 0);
  const ceil = Math.max(own[sid], block[sid.split('.').slice(0, 2).join('.')], taught);
  const wk = prior[sid]?.wk || ''; const early = wk && wk < 'W11';
  const limit = ceil ? Math.max(ceil * 1.5, 100) : 20000;
  const fails = [];
  for (const [role, list] of [['pre', s.pre], ['related', s.related]]) for (const e of list) {
    checked++;
    if (DECOY.has(e.key + JSON.stringify(e.opts || {}))) continue;
    if (TIME.test(e.key)) continue;   // clock times: a payload of minutes (19:00 = 1140) is not a number the pupil reads
    const r = probe(e.key, e.opts || {}, e.maxNumber || 10000);
    const why = r.max > limit ? `max ${r.max} > ${limit}` : (early && r.max >= 1000 && ceil < 1000) ? `4-digit (${r.max}) in ${wk}` : r.dp > 2 ? `${r.dp} decimal places` : '';
    if (why) fails.push(`${role} ${e.key}${e.opts ? JSON.stringify(e.opts) : ''}${e.maxNumber ? '@' + e.maxNumber : ''}: ${why} — ${r.ex}`);
  }
  bad += fails.length;
  if (fails.length || ALL) console.log(`${sid} [${wk || '—'}] ceiling ${ceil || 'none'} (limit ${limit}): ${fails.length ? fails.length + ' FAIL\n   ' + fails.join('\n   ') : 'ok'}`);
}
console.log(`linkfit: ${checked} links in ${Object.keys(d.steps).length} steps; ${bad} too big for their own step`);
process.exitCode = bad ? 1 : 0;
