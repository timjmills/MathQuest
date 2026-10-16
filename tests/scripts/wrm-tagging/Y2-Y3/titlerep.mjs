// r14 TITLEREP (critic r13 N13 / M11, the class behind Y3.B6.S10 "as bar models" marked full on circles): the step TITLE is
// a claim too. Every representation, operation, unit or context the title names (bar model, number line, part-whole, array,
// column method, ten frame, money, grams, litres, a clock, a word problem, adds / subtracts …; claims.mjs CLAIMS plus the
// title-only words below) must be dealt by the items of the entry's own skills:
//   FULL     the union of the DIRECT links' items (with their opts) shows each title claim at its share (a representation the
//            title names: at least half the items, TITLE_SHARE). A full step whose directs never draw what its title names
//            is not full (the option that draws it goes on the direct, or the verdict drops to partial)
//   PARTIAL  a title claim the direct + partial items do not show must be named in the entry's clause (the step `missing`
//   / GAP    or a partial's `missing`): the clause may not silently omit the representation the title asks for
// Steps and site lessons (lesson titles are read the same way). usage:
//   node titlerep.mjs Y2 Y3 [--n 40] [--seed 70001] [--step 97] [--all]     exit 1 on any finding
// build.mjs runs titleRepFinds() on the out object with its own item generator (a build gate: TITLEREP).
import * as CL from './claims.mjs';

// title-only representation words the general CLAIMS list does not carry (a why rarely says them; a title often does)
export const TITLE_CLAIMS = [
  { n: 'part-whole model', c: /part[- ]whole/i, i: /part[- ]?whole|"whole"|cherry|pw-|"parts"|"part"|bar[- ]model|"bars"|tape/i, s: 0.5, all: true },
  { n: 'ten frame', c: /\bten[- ]frames?|\btens? frames?\b/i, i: /ten[- ]?frame|tenframe|tf-|"frames?"/i, s: 0.5, all: true },
  { n: 'word problem', c: /\bword problems?\b|\bproblem solving\b/i, i: null, s: 0.3 },
  // the operation or idea a title names (r14: "Doubling and halving", "Odd and even", "Compare", "Order" …)
  { n: 'doubles', c: /\bdoubl(?:e|es|ing)\b/i, i: /doubl|\btwice\b/i, s: 0.2, w: true },
  { n: 'halves (halving)', c: /\bhalving\b/i, i: /\bhalv|\bhalf\b/i, s: 0.2, w: true },
  { n: 'odd / even', c: /\bodd\b|\beven\b(?! (?:if|though))/i, i: /\bodd\b|\beven\b|fair/i, s: 0.3, w: true },
  { n: 'compares', c: /^(?:compare|comparing)\b|\bcompare (?:numbers|objects|lengths|mass|capacity|amounts|angles|size|units|unit fractions|non-unit fractions|and order)/i, i: /[<>]|compar|greater|less|more|fewer|bigger|smaller|larger|heavier|lighter|longer|shorter|taller|holds? (?:more|less)|which is/i, s: 0.3, w: true },
  { n: 'orders', c: /\border\b(?! of)/i, i: /\border|least|greatest|smallest|largest|ascending|descending|shortest|longest|lightest|heaviest/i, s: 0.3, w: true },
  { n: 'estimates', c: /\bestimat/i, i: /estimat|about|roughly|closest|nearest|approximately/i, s: 0.3, w: true },
  { n: 'in words', c: /\bin words\b/i, i: /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/i, s: 0.2, w: true },
  { n: 'expanded form', c: /expanded form/i, i: /expanded|\d+\s*\+\s*\d+\s*\+\s*\d+|\d0\s*\+\s*\d\b/i, s: 0.2, w: true },
  { n: 'coins', c: /\bcoins\b/i, i: /coin|¢|penn(?:y|ies)|nickel|dime|quarter|"coins"/i, s: 0.2, w: true, pay: true },
  { n: 'bills', c: /\bbills\b/i, i: /\bbills?\b|"bills?"|"notes?"|"kind":"(?:bill|note)"|\$\s?(?:1|5|10|20|50|100)\b(?![.,]\d)/i, s: 0.2, w: true, pay: true },
  { n: 'cents', c: /\bcents\b|\bpence\b/i, i: /¢|\bcents?\b|\$\s?\d+\.\d\d/i, s: 0.2, w: true, pay: true },
  { n: 'change', c: /\bfind change\b|\bchange\b$/i, i: /\bchange\b/i, s: 0.3, w: true },
  { n: 'a.m. / p.m.', c: /a\.m\.|p\.m/i, i: /\ba\.?m\.?(?![a-z])|\bp\.?m\.?(?![a-z])|morning|afternoon|evening|night/i, s: 0.3, w: true },
  { n: 'temperature', c: /^temperature$/i, i: /°|temperature|thermometer/i, s: 0.5, all: true },
  { n: 'perimeter', c: /\bperimeter\b/i, i: /perimeter|all the way round|around the (?:edge|outside)/i, s: 0.5, w: true },
  { n: 'right angles', c: /\bright angles?\b/i, i: /right[- ]angle|90/i, s: 0.3, w: true },
  { n: 'parallel', c: /\bparallel\b/i, i: /parallel/i, s: 0.2, w: true },
  { n: 'perpendicular', c: /\bperpendicular\b/i, i: /perpendicular/i, s: 0.2, w: true },
  { n: 'symmetry', c: /\bsymmetr/i, i: /symmetr|mirror|fold/i, s: 0.3, w: true },
  { n: 'faces / edges / vertices / sides', c: /\b(?:faces|edges|vertices|sides)\b/i, i: /\bfaces?\b|\bedges?\b|vert(?:ex|ices)|corners?|\bsides?\b/i, s: 0.5, w: true },
  { n: '3-D shapes', c: /\b3-D\b/i, i: /3-?d|cube|cuboid|sphere|cone|cylinder|pyramid|prism/i, s: 0.2, all: true, w: true },
  { n: '2-D shapes', c: /\b2-D\b/i, i: /2-?d|triangle|square|rectangle|circle|pentagon|hexagon|octagon|kite|rhomb|oval|polygon/i, s: 0.2, all: true, w: true },
  { n: 'tally', c: /\btally\b/i, i: /tally|<line|"tallies"|\|\|\|/i, s: 0.3, all: true },
  { n: 'pictogram', c: /\bpictograms?\b|picture graphs?/i, i: /pictogra|picture graph|picto|\bkey\b|stands for|= \d+ |"icon/i, s: 0.5, all: true },
  { n: 'bar chart', c: /\bbar charts?\b|\bbar graphs?\b/i, i: /bar[- ]?(?:chart|graph)|"bars"|class="bar|"kind":"bar|"type":"bar/i, s: 0.5, all: true },
  { n: 'line plot', c: /\bline plots?\b/i, i: /line[- ]?plot|dot[- ]?plot|"marks"|\bx\b.*\bx\b/i, s: 0.5, all: true },
  { n: 'table', c: /(?<!times-)\b(?:tables|in a table|two-way tables?)$/i, i: /<table|table|"rows"/i, s: 0.5, all: true },
];
// "Multiply by 3", "Divide by 8", "The 2 times-table", "The 5 and 10 times-tables", "Multiples of 5 and 10", "Count in 3s": each
// number the title names must be a factor, divisor or step of the items (r14: a 5-and-10 page that never deals the 5s is not full)
export function tableClaims(title) {
  const t = String(title), out = [];
  const m = t.match(/\b(?:the\s+)?((?:\d+(?:,\s*|\s+and\s+|\s*&\s*))*\d+)\s+times-tables?\b/i) || t.match(/\b(?:multiply|divide) by (\d+)\b/i) || t.match(/\bmultiples of ((?:\d+(?:,\s*|\s+and\s+))*\d+)\b/i) || t.match(/\bcount in ((?:\d+s(?:,\s*|\s+and\s+))*\d+s)\b/i);
  if (!m) return out;
  const ns = [...m[1].matchAll(/\d+/g)].map(x => +x[0]);
  const op = /divide/i.test(t) ? 'div' : /count in/i.test(t) ? 'count' : /multipl(?:y|es)/i.test(t) ? 'mul' : 'any';
  for (const n of ns) {
    const re = op === 'div' ? new RegExp(`÷\\s*${n}(?!\\d)|by ${n}\\b|into ${n}\\b|${n} (?:equal )?(?:groups|teams|boxes|bags|plates|rows)|"divisor":${n}\\b|"d":${n}\\b`, 'i')
      : op === 'count' ? new RegExp(`(?:^|[^\\d])(?:0|${n}),\\s*${2 * n},\\s*${3 * n}\\b|\\b${n}s\\b|"step":${n}\\b|in ${n}s|by ${n}s|count(?:ing)? (?:on|back|up|down)? ?(?:in|by) ${n}`, 'i')
      : new RegExp(`(?<![\\d.])${n}\\s*[×x÷]|[×x÷]\\s*${n}(?![\\d.])|groups of ${n}\\b|${n} (?:in each|groups|rows|columns)|"(?:constant|factor|table|n|a|b)":${n}\\b|"step":${n}\\b|multiples? of ${n}\\b|\\b${n}s\\b|count(?:ing)? (?:by|in) ${n}s?\\b|"tab":"${n}"`, 'i');
    out.push({ n: `${op === 'div' ? '÷' : op === 'count' ? 'count in ' : '×'}${n}`, word: m[0], re, num: op === 'div' ? null : n, s: ns.length > 1 ? 0.2 : 0.5 });
  }
  return out;
}
// a representation the title names must be most of the page, not a fifth of it
export const TITLE_SHARE = 0.5;
// title words that are not claims about the items: "Count in 2s" is no money; "the multiplication symbol" names ×
const TITLE_SKIP = /\(US[^)]*\)/gi;
const story = i => (i.text || '').split(/\s+/).length >= 9 && /\?/.test(i.text || '') && /[a-z]\.\s+[A-Z]|\b(?:has|had|have|buys|bought|needs|makes|ran|runs|puts|shares|gets|weighs|holds|uses|costs|biked|walked|is|was)\b/.test(i.text || '') && !/^(?:Find|Convert|What is|Write|Click|Round|Compare|Order|Drag|Estimate|Sort)\b/.test(i.text || '');
// the UK money words of a title are the school's US money (as build.mjs usTitle)
export const usTitle = t => String(t).replace(TITLE_SKIP, ' ').replace(/\bpounds\b/gi, 'dollars').replace(/\bpound\b/gi, 'dollar').replace(/\bpence\b/gi, 'cents').replace(/\bnotes\b/gi, 'bills').replace(/£/g, '$');

// a multiplication grid (mult-grid payload rows / cols / blanks): every blank is a fact of the table n
const gridHit = (i, n) => { if (n == null || i.tpl !== 'mult-grid') return false; try { const p = JSON.parse(i.pay), b = p.blanks || []; return b.length > 0 && b.filter(([r, c]) => p.rows[r] === n || p.cols[c] === n).length >= Math.ceil(b.length / 3); } catch { return false; } };
// the claims a title makes, judged on items: [{claim, word, hit, n, ok}]
export function titleClaims(title, items) {
  const t = usTitle(title), N = items.length || 1, out = [];
  for (const h of CL.claimHits(t, items)) {
    if (h.claim === 'column method' && /horizontal/i.test(t)) continue;   // "Horizontal and vertical" lines, not a written method
    const cl = CL.CLAIMS.find(c => c.n === h.claim);
    const need = cl && cl.all ? Math.max(cl.s, TITLE_SHARE) : cl ? cl.s : 0.2;
    out.push({ ...h, ok: h.hit >= need * N, need });
  }
  for (const cl of TITLE_CLAIMS) {
    if (!cl.c.test(t)) continue;
    const str = i => cl.w ? `${CL.itemWords(i)} ¦ ${CL.repStr(i)}` : CL.repStr(i);   // repStr carries the payload (coins, bills)
    const hit = cl.i ? items.filter(i => cl.i.test(str(i))).length : items.filter(story).length;
    out.push({ claim: cl.n, word: (t.match(cl.c) || [''])[0], hit, n: N, ok: hit >= cl.s * N, need: cl.s });
  }
  for (const tc of tableClaims(t)) {
    const hit = items.filter(i => tc.re.test(`${CL.itemWords(i)} ¦ ${i.pay || ''}`) || gridHit(i, tc.num)).length;
    out.push({ claim: tc.n, word: tc.word, hit, n: N, ok: hit >= tc.s * N, need: tc.s, re: tc.re });
  }
  return out;
}
// does the clause name the claim (as missing, or as what is dealt instead)? the claim's own regex on the whole clause,
// negated parts included ("no bar model", "never on a number line" name it), plus the claim name itself
const named = (h, clause) => {
  const cl = CL.CLAIMS.find(c => c.n === h.claim) || TITLE_CLAIMS.find(c => c.n === h.claim);
  const t = String(clause || '');
  if (h.re) return h.re.test(t) || t.toLowerCase().includes(String(h.word).toLowerCase());
  if (cl && cl.c.test(t)) return true;
  if (cl && cl.i && (cl.n === 'fractions' || cl.n === 'compares' || cl.n === 'orders') && cl.i.test(t)) return true;   // "halves and quarters" names fractions; "the bigger unit" a comparison
  if (h.claim === 'word problem' || h.claim === 'story') return /\bstor(?:y|ies)\b|word problems?|context/i.test(t);
  if (h.claim === 'part-whole model') return /part[- ]whole|parts? and (?:the )?whole/i.test(t);
  return t.toLowerCase().includes(h.claim.toLowerCase());
};
// every finding of one links file object. itemsOf(key, opts) -> items (claims.mjs item shape)
export function titleRepFinds(out, itemsOf) {
  const finds = [], rows = [];
  for (const [sec, tag] of [['steps', 'step'], ['lessons', 'lesson']]) for (const [id, s] of Object.entries(out[sec] || {})) {
    const title = s.title || '';
    const dItems = s.direct.flatMap(d => itemsOf(d.key, d.opts || {}));
    const pItems = s.partial.flatMap(p => itemsOf(p.key, p.opts || {}));
    if (s.verdict === 'full') {
      const hs = titleClaims(title, dItems);
      rows.push({ id, tag, verdict: s.verdict, title, claims: hs });
      for (const h of hs.filter(h => !h.ok)) finds.push({ kind: 'FULL', id, tag, title, claim: h.claim, msg: `full, but the direct items show "${h.word}" (${h.claim}) in ${h.hit} of ${h.n} (needs ${Math.ceil(h.need * h.n)}): ${s.direct.map(d => d.key + JSON.stringify(d.opts || {})).join(', ')}` });
    } else {
      const items = [...dItems, ...pItems];
      const hs = items.length ? titleClaims(title, items) : titleClaims(title, []).map(h => ({ ...h, ok: false }));
      rows.push({ id, tag, verdict: s.verdict, title, claims: hs });
      const clause = [s.missing, ...s.partial.map(p => p.missing)].join(' ; ');
      for (const h of hs.filter(h => !h.ok)) if (!named(h, clause)) finds.push({ kind: 'CLAUSE', id, tag, title, claim: h.claim, msg: `${s.verdict}: the title names "${h.word}" (${h.claim}), the linked items show it in ${h.hit} of ${h.n}, and the clause never says so: "${clause.slice(0, 160)}"` });
    }
  }
  return { finds, rows };
}

// ---- standalone: fresh seeds, both years ----
if (import.meta.url === `file://${process.argv[1]}`) {
  const _m = new Map(); globalThis.localStorage ??= { getItem: k => _m.get(k) ?? null, setItem: (k, v) => _m.set(k, String(v)), removeItem: k => _m.delete(k) };
  globalThis.window ??= globalThis;
  const R = new URL('../../../../', import.meta.url).pathname;
  const _log = console.log, _warn = console.warn; console.log = () => {}; console.warn = () => {};
  const G = await import(R + 'js/modules/generate-question.js');
  console.log = _log; console.warn = _warn;
  const fs = await import('fs');
  const a = process.argv.slice(2), arg = (k, d) => a.includes(k) ? +a[a.indexOf(k) + 1] : d;
  const N = arg('--n', 40), SEED = arg('--seed', 70001), STEP = arg('--step', 97);
  const itemsOf = itemGen(G.generateQuestionFor, N, SEED, STEP);
  let bad = 0;
  for (const y of a.filter(x => /^Y\d$/.test(x))) {
    const f = JSON.parse(fs.readFileSync(R + `data/curriculum/links/${y}.json`, 'utf8'));
    const { finds, rows } = titleRepFinds(f, itemsOf);
    if (a.includes('--all')) for (const r of rows) if (r.claims.length) console.log(y, r.id, r.verdict, '|', r.title, '|', r.claims.map(h => `${h.claim} ${h.hit}/${h.n}${h.ok ? '' : ' X'}`).join('; '));
    for (const x of finds) console.log('TITLEREP', x.kind, x.id, '|', x.title, '|', x.msg);
    console.log(`titlerep ${y}: ${rows.length} entries, ${rows.filter(r => r.claims.length).length} with a title claim, ${finds.length} findings`);
    bad += finds.length;
  }
  process.exitCode = bad ? 1 : 0;
}
// the item shape claims.mjs reads (as build.mjs claimItems and sweep.mjs gen), cached per key + opts
export function itemGen(generateQuestionFor, N, SEED, STEP) {
  const st = x => String(x ?? '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&times;/g, '×').replace(/&divide;/g, '÷').replace(/&minus;/g, '−').replace(/&#?\w+;/g, ' ').replace(/\s+/g, ' ');
  const lb = x => x == null ? '' : typeof x === 'object' ? (x.label ?? x.text ?? x.html ?? JSON.stringify(x)) : String(x);
  const cache = new Map();
  return (key, opts) => {
    const id = key + JSON.stringify(opts || {}); if (cache.has(id)) return cache.get(id);
    const [c, k] = key.split(':'), out = [];
    for (let i = 0; i < N; i++) { let q; try { q = generateQuestionFor({ category: c, skill: k, opts: opts || {}, seed: SEED + i * STEP, itemIndex: i % 20, itemCount: 20 }); } catch { continue; }
      if (!q) continue;
      out.push({ text: st(q.text), a: st(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans), x: st([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lb).join(' ; ')),
        vis: st(q.visual), raw: String(q.visual || '').toLowerCase().slice(0, 6000), tpl: q.cell ? q.cell.template : '', pay: q.cell ? JSON.stringify(q.cell.payload) : '' }); }
    cache.set(id, out); return out;
  };
}
