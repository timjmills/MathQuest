// r13 (critic r12 N12): the DENOMINATOR check of every link that carries a `denoms` option, read from EVERYTHING the item shows.
// The generator's own `denoms` filter (generate-question.js itemDenominators / p12Acceptor) reads the question text, the
// picture markup, the options and the answer only. An item that draws its fractions from its kit cell (the = / ≠ items of
// equiv_frac_visual: q.cell.payload.terms) passes that filter with any denominator. This check reads the same fields PLUS the
// cell payload (every numeric `d` / `den` / `denom` / `denominator`, and every "a/b" string in it).
//
// For every link with opts.denoms in Y2.json / Y3.json (steps and site lessons; direct, partial, pre and related) it generates
// N items and counts the items with a fraction outside the ticked families (utils.js denomAllowed). Then it reads the link's
// text: the partial clause, or the pre / related why with the FULL title of every step it cites (unless "nearest live
// practice"). A text that names a denominator (a word: halves, thirds, quarters …; or a fraction "3/4") CLAIMS what is dealt:
//   FAMILY  every off-family family the items deal (thirds 3/6/9/12 …, fifths 5/10/20 …, sevenths 7/14 …) must be named too
//           (a denominator of that family, as a word or a fraction, or "<thirds|fifths|sevenths> family")
//   NAMED   every denominator WORD it names in a positive part (not after "no / never / not …") must be dealt by some item
//   DENIED  (r14) a denominator word in a NEGATED part ("never thirds, fifths or sevenths": the negation runs on through the
//           list) is not named (FAMILY reads positive parts only) and must NOT be dealt by any item
// A text that names no denominator ("Y2.B8.S11 Non-unit fractions") claims no family and is only counted.
// usage: node denoms.mjs Y2 Y3 [--n 80] [--seed 40961] [--step 131] [--all]   (exit 1 on any FAMILY / NAMED finding)
//        --all prints every link's counts, not only the findings
const _m = new Map(); globalThis.localStorage ??= { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
globalThis.window ??= globalThis;
const R = new URL('../../../../', import.meta.url).pathname;
const _log = console.log, _warn = console.warn; console.log = () => {}; console.warn = () => {};
const G = await import(R + 'js/modules/generate-question.js');
const U = await import(R + 'js/modules/utils.js');
console.log = _log; console.warn = _warn;
const fs = await import('fs');
const wrm = JSON.parse(fs.readFileSync(R + 'data/curriculum/wrm-steps.json', 'utf8'));
const titles = {}; for (const y of wrm.years) for (const b of y.blocks) for (const s of b.steps) titles[s.id] = s.title;

// the denominators an item shows: the generator's own reading, plus the kit cell payload
export function payloadDens(p) {
  const out = [];
  const walk = (o, k) => {
    if (o == null) return;
    if (Array.isArray(o)) { for (const x of o) walk(x, k); return; }
    if (typeof o === 'object') { for (const [a, b] of Object.entries(o)) walk(b, a); return; }
    if (typeof o === 'number' && /^(d|den|denom|denominator)$/.test(k || '')) out.push(o);
    if (typeof o === 'string') for (const m of o.matchAll(/(?:^|[^\d.])\d+\s*\/\s*(\d+)(?!\d|\.\d)/g)) out.push(+m[1]);
  };
  walk(p, '');
  return out.filter(d => Number.isFinite(d) && d > 1);
}
export function itemDens(q) { return [...G.itemDenominators(q), ...(q.cell ? payloadDens(q.cell.payload) : [])].filter(d => d > 1); }

// the odd-prime families of a denominator (2 / 4 / 8 / 16 are the halves family: [])
export function famsOf(d) { let n = Math.round(d); while (n % 2 === 0) n /= 2; const f = new Set();
  for (let p = 3; n > 1 && p * p <= n; p += 2) while (n % p === 0) { f.add(p === 3 ? 3 : p === 5 ? 5 : 7); n /= p; }
  if (n > 1) f.add(n === 3 ? 3 : n === 5 ? 5 : 7); return [...f]; }
const FAMNAME = { 3: 'thirds', 5: 'fifths', 7: 'sevenths' };
// denominator words, singular or plural (a "half" is 2, a "quarter" 4)
const WORDS = [[2, 'half|halves'], [3, 'thirds?'], [4, 'quarters?|fourths?'], [5, 'fifths?'], [6, 'sixths?'], [7, 'sevenths?'], [8, 'eighths?'], [9, 'ninths?'],
  [10, 'tenths?'], [12, 'twelfths?'], [14, 'fourteenths?'], [15, 'fifteenths?'], [16, 'sixteenths?'], [18, 'eighteenths?'], [20, 'twentieths?'], [24, 'twenty-fourths?'], [100, 'hundredths?']];
// the text a link claims: its clause, or its why plus the full title of every step it cites (not under "nearest live practice")
export function linkText(e, role) {
  if (role === 'partial') return String(e.missing || '');
  let w = String(e.why || '');
  if (!/nearest live practice/.test(w)) for (const id of new Set([...w.matchAll(/(?:R|Y\d)\.B\d+\.S\d+/g)].map(m => m[0]))) if (titles[id] && !w.includes(titles[id])) w += ' ' + titles[id];
  return w;
}
// the positive part of a text: drop what follows a negation up to the next ; , . : ( )
// r14 (critic r13 M10 d4): a negation runs on through a list of denominator words ("never thirds, fifths or sevenths"), so a
// family named only to be denied is not "named" (FAMILY then fires) and is itself checked (DENIED: the items deal it)
const DENW = WORDS.map(w => w[1]).join('|');
const NEG = new RegExp(`\\b(?:no|never|not(?!\\s+(?:only|just|always|all)\\b)|without|nor|other than|instead of|rather than)\\b[^;,.:()]*(?:,\\s*(?:or\\s+|and\\s+|nor\\s+)?(?:${DENW})\\b[^;,.:()]*)*`, 'gi');
const positive = t => String(t).replace(NEG, ' ');
export const negatedDenText = t => [...String(t).matchAll(NEG)].map(m => m[0]).join(' ; ');
export function namedDens(text) {
  const t = String(text), words = new Set(), lits = new Set(), fams = new Set();
  for (const [d, re] of WORDS) if (new RegExp(`\\b(?:${re})\\b`, 'i').test(t)) words.add(d);
  for (const m of t.matchAll(/(?:^|[^\d.])\d+\s*\/\s*(\d+)(?!\d|\.\d)/g)) if (+m[1] > 1) lits.add(+m[1]);
  for (const m of t.matchAll(/\b(thirds|fifths|sevenths|halves) family\b/gi)) fams.add({ thirds: 3, fifths: 5, sevenths: 7, halves: 2 }[m[1].toLowerCase()]);
  const pt = positive(t), pos = new Set(); for (const [d, re] of WORDS) if (new RegExp(`\\b(?:${re})\\b`, 'i').test(pt)) pos.add(d);
  // r14: the families a text NAMES are read from its positive parts only; the words of its negated parts are DENIED
  const posLits = new Set(); for (const m of pt.matchAll(/(?:^|[^\d.])\d+\s*\/\s*(\d+)(?!\d|\.\d)/g)) if (+m[1] > 1) posLits.add(+m[1]);
  const posFams = new Set(); for (const m of pt.matchAll(/\b(thirds|fifths|sevenths|halves) family\b/gi)) posFams.add({ thirds: 3, fifths: 5, sevenths: 7, halves: 2 }[m[1].toLowerCase()]);
  const nt = negatedDenText(t), denied = new Set(); for (const [d, re] of WORDS) if (new RegExp(`\\b(?:${re})\\b`, 'i').test(nt)) denied.add(d);
  return { words, lits, fams, pos, posLits, posFams, denied, any: words.size + lits.size + fams.size > 0 };
}
const cache = new Map();
export function scan(key, opts, { n = 80, seed = 40961, step = 131 } = {}) {
  const id = `${key}|${JSON.stringify(opts || {})}|${n}|${seed}|${step}`; if (cache.has(id)) return cache.get(id);
  const [c, k] = key.split(':'); const ticked = opts.denoms; const r = { n: 0, off: 0, offDens: {}, offFams: {}, dealt: new Set(), ex: {} };
  for (let i = 0; i < n; i++) { let q; try { q = G.generateQuestionFor({ category: c, skill: k, opts, seed: seed + i * step, itemIndex: i % 20, itemCount: 20 }); } catch { continue; }
    if (!q) continue; r.n++;
    const ds = itemDens(q); for (const d of ds) r.dealt.add(d);
    const off = [...new Set(ds.filter(d => !U.denomAllowed(d, ticked)))];
    if (off.length) { r.off++; for (const d of off) { r.offDens[d] = (r.offDens[d] || 0) + 1; for (const f of famsOf(d)) r.offFams[f] = (r.offFams[f] || 0) + 1;
      if (!r.ex[d]) { const p = q.cell?.payload; r.ex[d] = (p?.terms ? p.terms.map(t => `${t.n}/${t.d}`).join(` ${p.signs?.[0] || p.joins?.[0] || ','} `) : String(q.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 60)); } } } }
  cache.set(id, r); return r;
}
// every denoms link of a links file, checked
export function denomFinds(d, o = {}) {
  const U2 = { ...d.steps, ...(d.lessons || {}) }; const rows = [], finds = [];
  for (const [sid, s] of Object.entries(U2)) for (const role of ['direct', 'partial', 'pre', 'related']) for (const e of s[role] || []) {
    if (!e.opts || !Array.isArray(e.opts.denoms)) continue;
    const r = scan(e.key, e.opts, o); const txt = role === 'direct' ? '' : linkText(e, role); const nm = namedDens(txt);
    const row = { sid, role, key: e.key, opts: e.opts, n: r.n, off: r.off, offDens: r.offDens, offFams: r.offFams, claims: nm.any, text: txt };
    rows.push(row);
    if (!nm.any) continue;
    const namedFams = new Set([...nm.posFams]); for (const x of [...nm.pos, ...nm.posLits]) for (const f of famsOf(x)) namedFams.add(f);
    const miss = Object.keys(r.offFams).map(Number).filter(f => !namedFams.has(f));
    if (miss.length) finds.push({ ...row, kind: 'FAMILY', msg: `deals the ${miss.map(f => FAMNAME[f]).join(', ')} famil${miss.length > 1 ? 'ies' : 'y'} (${Object.entries(r.offDens).filter(([x]) => famsOf(+x).some(f => miss.includes(f))).map(([x, c]) => `/${x} ×${c}`).join(', ')} of ${r.n} items; e.g. ${Object.entries(r.ex).filter(([x]) => famsOf(+x).some(f => miss.includes(f))).slice(0, 3).map(([, v]) => v).join(' | ')}) but the text names only ${[...namedFams].filter(f => FAMNAME[f]).length ? [...namedFams].filter(f => FAMNAME[f]).map(f => FAMNAME[f]).join(', ') + ' and the halves family' : 'the halves family'}` });
    // NAMED is judged on a wider fixed sample (2 x 200 items) as well, so a rare but real denominator (sevenths, 9 in 600) is not a false finding
    const wide = new Set([...r.dealt, ...scan(e.key, e.opts, { n: 200, seed: 40961, step: 97 }).dealt, ...scan(e.key, e.opts, { n: 200, seed: 77001, step: 97 }).dealt]);
    const ghost = [...nm.pos].filter(x => !wide.has(x) && x !== 1);
    const denied = [...nm.denied].filter(x => wide.has(x));
    if (denied.length) finds.push({ ...row, kind: 'DENIED', msg: `denies ${denied.map(x => WORDS.find(w => w[0] === x)[1].split('|')[0].replace('?', '')).join(', ')} ("${negatedDenText(txt).slice(0, 80)}") but the items deal /${denied.join(', /')} (${denied.map(x => `/${x} ×${r.offDens[x] || 0} of ${r.n}`).join(', ')})` });
    if (ghost.length) finds.push({ ...row, kind: 'NAMED', msg: `names ${ghost.map(x => WORDS.find(w => w[0] === x)[1].split('|')[0].replace('?', '')).join(', ')} but no item of ${r.n} (nor of 400 more) deals /${ghost.join(', /')}` });
  }
  return { rows, finds };
}
if (process.argv[1] && process.argv[1].endsWith('denoms.mjs')) {
  const a = process.argv.slice(2); const val = (f, d) => a.includes(f) ? +a[a.indexOf(f) + 1] : d;
  const o = { n: val('--n', 80), seed: val('--seed', 40961), step: val('--step', 131) };
  let bad = 0;
  for (const Y of a.filter(x => /^Y\d$/.test(x))) {
    const d = JSON.parse(fs.readFileSync(R + `data/curriculum/links/${Y}.json`, 'utf8'));
    const { rows, finds } = denomFinds(d, o);
    if (a.includes('--all')) for (const r of rows) _log(`  ${r.sid} ${r.role} ${r.key}${JSON.stringify(r.opts)}: ${r.off}/${r.n} items off-family ${JSON.stringify(r.offDens)}${r.claims ? '' : ' (text names no denominator)'}`);
    for (const f of finds) _log(`[${f.kind}] ${f.sid} ${f.role} ${f.key}${JSON.stringify(f.opts)}: ${f.msg}\n      text: ${f.text.slice(0, 240)}`);
    const keys = new Set(rows.map(r => r.key + JSON.stringify(r.opts)));
    _log(`denoms ${Y}: ${rows.length} denoms links (${keys.size} key + opts), ${o.n} items each (seed ${o.seed} + ${o.step}i); ${rows.filter(r => r.off).length} links deal an off-family fraction; ${rows.filter(r => r.claims).length} texts name a denominator; findings ${finds.length} (FAMILY ${finds.filter(f => f.kind === 'FAMILY').length}, NAMED ${finds.filter(f => f.kind === 'NAMED').length}, DENIED ${finds.filter(f => f.kind === 'DENIED').length})`);
    bad += finds.length;
  }
  _log(bad ? 'denoms: FAIL' : 'denoms: OK'); process.exit(bad ? 1 : 0);
}
