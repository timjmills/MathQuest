// Y1 copy of the Y6 lane's titlerep.mjs (itself the Y2-Y3 lane's), with the Kindergarten / Reception site-lesson title claims
// appended to the claim table (marked "Y1" below: vertical form, add AND subtract, find the total, subitising, stories, zero, pairs,
// one more / one less, the named shapes, positional words, compose / decompose, rotate, match, map, direction, teen numbers, numerals).
// Y6 copy of the Y2-Y3 lane's titlerep.mjs (critic r13-r15: the title's representation, operation, verb, clock and table claims), run on
// the Y6 site lessons by lessonfit.mjs. Unchanged except this header, the line-plot item regex (marked "Y6" below) and the Y6 lesson-title claims
// (Y6_TITLE_CLAIMS, lessons critic r1 F6: braces, exponents, hierarchy, ordered pairs, two rules, both directions, tiling …).
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
  // r15 (critic r14 M12, the verb class): "Solve problems with time" asks for problems told in a context, not a bare time line
  { n: 'problems in context', c: /\bsolve (?!(?:\S+ )*word )(?:\S+ ){0,3}problems\b|\bproblems with\b/i, i: null, s: 0.3 },
  // the operation or idea a title names (r14: "Doubling and halving", "Odd and even", "Compare", "Order" …)
  { n: 'doubles', c: /\bdoubl(?:e|es|ing)\b/i, i: /doubl|\btwice\b/i, s: 0.2, w: true },
  { n: 'halves (halving)', c: /\bhalving\b/i, i: /\bhalv|\bhalf\b/i, s: 0.2, w: true },
  { n: 'odd / even', c: /\bodd\b|\beven\b(?! (?:if|though))/i, i: /\bodd\b|\beven\b|fair/i, s: 0.3, w: true },
  { n: 'compares', c: /^(?:compare|comparing)\b|\bcompare (?:numbers|objects|lengths|mass|capacity|amounts|angles|size|units|unit fractions|non-unit fractions|and order)/i, i: /[<>]|compar|greater|less|more|fewer|bigger|smaller|larger|heavier|lighter|longer|shorter|taller|holds? (?:more|less)|which is/i, s: 0.3, w: true },
  { n: 'orders', c: /\border\b(?! of)/i, i: /\border|least|greatest|smallest|largest|ascending|descending|shortest|longest|lightest|heaviest/i, s: 0.3, w: true },
  { n: 'estimates', c: /\bestimat/i, i: /estimat|about|roughly|closest|nearest|approximately/i, s: 0.3, w: true },
  { n: 'in words', c: /\bin words\b/i, i: /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/i, s: 0.2, w: true },
  { n: 'expanded form', c: /expanded form/i, i: /expanded|\d+\s*\+\s*\d+\s*\+\s*\d+|\d0\s*\+\s*\d\b/i, s: 0.2, w: true },
  // r15: the cell template is named "coins" and a bills-only payload carries "coins":[]: neither is a coin (coinStr strips them)
  { n: 'coins', c: /\bcoins\b/i, i: /coin|¢|penn(?:y|ies)|nickel|dime|quarter|"coins":\[\d/i, s: 0.2, w: true, pay: true, str: 'coin' },
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
  // Y6: the "x … x" alternative is dropped: any SVG's x="…" attributes matched it (a fraction-adding item "showed" a line plot)
  { n: 'line plot', c: /\bline plots?\b/i, i: /line[- ]?plot|dot[- ]?plot|"marks"/i, s: 0.5, all: true },
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
// r15: "pounds (notes and coins)" counts whole pounds: at the school whole dollars are bills ($1, $5, $10, $20; the step's
// usAdaptation lists $1 with the bills), so the pound coins of the UK title are dollar bills, not cent coins
export const usTitle = t => String(t).replace(TITLE_SKIP, ' ').replace(/\bpounds \(notes and coins\)/gi, 'dollars (bills)').replace(/\bpounds\b/gi, 'dollars').replace(/\bpound\b/gi, 'dollar').replace(/\bpence\b/gi, 'cents').replace(/\bnotes\b/gi, 'bills').replace(/£/g, '$');

// lessons critic r1 G3: an item written in columns: the kit's stack cell, the fact cell with notation vertical (add_facts / sub_facts
// {notation:[stacked]}), the legacy facts-column-visual, or a stack / column-addition visual
export const isColumnItem = i => i.tpl === 'stack' || (i.tpl === 'fact' && /"notation":"vertical"/.test(i.pay || ''))
  || /facts-column-visual|column (?:addition|subtraction)|stacked/i.test(`${i.vis || ''} ${i.raw || ''}`);
// a multiplication grid (mult-grid payload rows / cols / blanks): every blank is a fact of the table n
const gridHit = (i, n) => { if (n == null || i.tpl !== 'mult-grid') return false; try { const p = JSON.parse(i.pay), b = p.blanks || []; return b.length > 0 && b.filter(([r, c]) => p.rows[r] === n || p.cols[c] === n).length >= Math.ceil(b.length / 3); } catch { return false; } };
// the claims a title makes, judged on items: [{claim, word, hit, n, ok}]
export function titleClaims(title, items) {
  const t = usTitle(title), N = items.length || 1, out = [];
  for (const h of CL.claimHits(t, items)) {
    if (h.claim === 'column method' && /horizontal/i.test(t)) continue;   // "Horizontal and vertical" lines, not a written method
    if (/scale|ruler/.test(h.claim) && /\b3-?d\b|\bshapes\b/i.test(t)) continue;   // Y1: a cylinder in a 3-D shape title is a solid, not a measuring cylinder
    const cl = CL.CLAIMS.find(c => c.n === h.claim);
    const need = cl && cl.all ? Math.max(cl.s, TITLE_SHARE) : cl ? cl.s : 0.2;
    out.push({ ...h, ok: h.hit >= need * N, need });
  }
  for (const cl of TITLE_CLAIMS) {
    if (!cl.c.test(t)) continue;
    const str0 = i => cl.w ? `${CL.itemWords(i)} ¦ ${CL.repStr(i)}` : CL.repStr(i);   // repStr carries the payload (coins, bills)
    const str = cl.str === 'coin' ? i => str0({ ...i, tpl: '', pay: String(i.pay || '').replace(/"coins":\[\]/g, '') }).replace(/"coins":\[\]/g, '') : str0;
    const hit = cl.i ? items.filter(i => cl.i.test(str(i))).length : items.filter(story).length;
    out.push({ claim: cl.n, word: (t.match(cl.c) || [''])[0], hit, n: N, ok: hit >= cl.s * N, need: cl.s });
  }
  for (const tc of tableClaims(t)) {
    const hit = items.filter(i => tc.re.test(`${CL.itemWords(i)} ¦ ${i.pay || ''}`) || gridHit(i, tc.num)).length;
    out.push({ claim: tc.n, word: tc.word, hit, n: N, ok: hit >= tc.s * N, need: tc.s, re: tc.re });
  }
  for (const yc of y6Claims(t)) {
    const hit = items.filter(yc.test).length;
    out.push({ claim: yc.n, word: yc.word, hit, n: N, ok: hit >= yc.s * N, need: yc.s, re: yc.re });
  }
  for (const vc of verbClaims(t)) {
    const hit = items.filter(vc.test).length;
    out.push({ claim: vc.n, word: vc.word, hit, n: N, ok: hit >= vc.s * N, need: vc.s, re: vc.named });
  }
  return out;
}

// ---- Y6 (lessons critic r1 F6): the Y6 site-lesson titles' own claims. Each is { n, re (on the title), s (share), test(item),
// named (the clause names it) }; a FULL lesson's direct items must show it at its share, a partial / gap clause must name it.
const num1 = i => { const m = String(i.text || '').replace(/(\d),(?=\d{3}\b)/g, '$1').match(/(?<![\d.])\d+(?:\.\d+)?(?![\d.])/); return m ? +m[0] : null; };
const ansNum = i => { const m = String(i.a || '').replace(/(\d),(?=\d{3}\b)/g, '$1').match(/(?<![\d.])\d+(?:\.\d+)?(?![\d.])/); return m ? +m[0] : null; };
const T = i => `${i.text || ''} ¦ ${i.a || ''} ¦ ${i.x || ''}`;
export const Y6_TITLE_CLAIMS = [
  { re: /\bbraces\b/i, n: 'braces { }', s: 0.2, test: i => /\{/.test(i.text || ''), named: /\bbraces\b/i },
  { re: /\bbrackets\b/i, n: 'square brackets [ ]', s: 0.2, test: i => /\[/.test(i.text || ''), named: /\bbrackets?\b/i },
  { re: /\bparentheses\b/i, n: 'parentheses ( )', s: 0.2, test: i => /\(/.test(i.text || ''), named: /\bparenthes/i },
  { re: /\bexponents?\b|10\^\d/i, n: 'exponents (10^2, 10²)', s: 0.3, test: i => /\^\s*\d|10\s*[¹²³]|exponent|\bpowers? of\b/i.test(T(i)) || /<sup/.test(i.raw || ''), named: /\bexponent|\bpowers? of\b/i },
  { re: /\bexplain the pattern\b/i, n: 'explains the pattern', s: 0.2, test: i => /pattern|explain|\bwhy\b/i.test(i.text || ''), named: /\bpattern\b/i },
  { re: /\bhierarch/i, n: 'hierarchy', s: 0.3, test: i => /hierarch|subcategor/i.test(T(i)), named: /\bhierarch/i },
  { re: /\bordered pairs?\b/i, n: 'ordered pairs', s: 0.3, test: i => /\(\s*\d+\s*,\s*\d+\s*\)|ordered pair/i.test(T(i)), named: /\bordered pairs?\b|\bpairs\b/i },
  { re: /\btwo (?:different )?rules\b|\btwo sequences\b/i, n: 'two sequences from two rules', s: 0.3, test: i => /pattern a\b[\s\S]*pattern b|\brule a\b[\s\S]*\brule b|two rules|sequence a\b/i.test(T(i)), named: /\btwo (?:rules|sequences|patterns)\b|\bboth rules\b|\bpattern a\b/i },
  { re: /\bwords to expressions\b/i, n: 'words to expressions', s: 0.2, test: i => /\d\s*[+\-−×÷]\s*\(?\d/.test(`${i.a || ''}`) && !/\d\s*[+\-−×÷]\s*\d/.test(i.text || ''), named: /\bwords? to (?:an? )?(?:numerical )?expressions?\b|\bfrom words\b|\bwrit(?:e|es|ing) (?:a |the )?(?:numerical )?expressions?\b/i },
  { re: /\bexpressions to words\b/i, n: 'expressions to words', s: 0.2, test: i => /\d\s*[+\-−×÷]\s*\(?\d/.test(i.text || '') && /\b(?:sum|product|difference|quotient|times|twice|half|more than|less than|add|subtract|multiply|divide)\b/i.test(`${i.a || ''} ${i.x || ''}`), named: /\bexpressions? (?:to|into|in) words\b|\binterpret/i },
  { re: /\bconvert\b[^]*\b(?:inches|feet|yards|miles|units)\b/i, n: 'converts to a smaller unit', s: 0.2, test: i => { const a = num1(i), b = ansNum(i); return a != null && b != null && b > a; }, named: /\bsmaller unit\b|\blarger (?:unit )?to (?:a )?smaller\b|\bboth (?:ways|directions)\b/i },
  { re: /\bconvert\b[^]*\b(?:inches|feet|yards|miles|units)\b/i, n: 'converts to a larger unit', s: 0.2, test: i => { const a = num1(i), b = ansNum(i); return a != null && b != null && b < a; }, named: /\bsmaller (?:unit )?to (?:a )?larger\b|\blarger unit\b|\bboth (?:ways|directions)\b/i },
  { re: /\bunits of length\b[^]*\b(?:inches|feet|yards|miles)\b/i, n: 'customary length in most items', s: 0.5, test: i => /\d\s*(?:in|inch(?:es)?|ft|feet|foot|yd|yards?|mi|miles?)\b/i.test(i.text || ''), named: /\bweight\b|\bcapacity\b|\blength\b/i },
  { re: /\bfractional side/i, n: 'tiling with unit-fraction squares', s: 0.3, test: i => /\btil(?:e|es|ed|ing)\b|unit squares?/i.test(`${T(i)} ${i.pay || ''}`), named: /\btil(?:e|es|ed|ing)\b/i },
  { re: /\bdivide (?:\S+ ){0,2}by a decimal\b/i, n: 'a decimal divisor', s: 0.5, test: i => /÷\s*\d*\.\d/.test(i.text || ''), named: /\bdivisor\b|\bdivided by a (?:tenths |hundredths )?decimal\b/i },
  { re: /\bdecimals by decimals\b/i, n: 'decimal × decimal', s: 0.5, test: i => /(?<![\d.])\d*\.\d+\s*[×x]\s*\d*\.\d+/.test(i.text || ''), named: /\bdecimal (?:times|×|multiplied by) a decimal\b|\bdecimal × decimal\b/i },
  { re: /\bwhole number by a unit fraction\b/i, n: 'whole ÷ unit fraction', s: 0.5, test: i => /(?<![\/\d])\d+\s*÷\s*1\s*\/\s*\d+/.test(i.text || ''), named: /\bunit fraction\b/i },
  { re: /\b(\d)-digit number\b/i, n: 'N-digit number', s: 0.5, digit: true, named: null },
  { re: /\bvolume\b/i, n: 'volume', s: 0.5, test: i => /\bvolume\b|cubic|cm³|in³|unit cubes?/i.test(T(i)), named: /\bvolume\b/i },
  { re: /\bcomposite solids?\b/i, n: 'composite solid', s: 0.3, test: i => /composite|two (?:boxes|prisms|cuboids)|l-shaped|joined/i.test(T(i)), named: /\bcomposite\b|\btwo (?:non-overlapping )?(?:cuboids|prisms|boxes)\b/i },
  { re: /\bscaling\b/i, n: 'scaling (greater or less without calculating)', s: 0.3, test: i => /greater|less|bigger|smaller|scal|same/i.test(T(i)), named: /\bscal/i },
  { re: /\bthousandths\b/i, n: 'thousandths', s: 0.3, test: i => /\d\.\d{3}(?!\d)|\/\s*1000\b|thousandths/i.test(T(i)), named: /\bthousandths?\b/i },
  { re: /\bword form\b/i, n: 'word form', s: 0.2, test: i => /\b(?:one|two|three|four|five|six|seven|eight|nine|ten|hundred|thousand)(?:th|ths)?\b/i.test(T(i)), named: /\bwords?\b/i },
  { re: /\bdigit values?\b|\b10 times\b/i, n: '10 times / 1/10 of', s: 0.3, test: i => /\b10 times\b|\bten times\b|\b1\/10\b|\bone tenth\b|×\s*10\b|÷\s*10\b/i.test(T(i)), named: /\b10 times\b|\bten times\b|\bcompar/i },
  // ---- Y1 (Kindergarten site lessons): each title word is a claim on the items a FULL lesson deals, or the clause must name it
  { re: /written vertically|column form/i, n: 'written vertically (column form)', s: 0.5, test: i => isColumnItem(i), named: /\bvertical|\bcolumn|\bstacked\b/i },
  { re: /\badd and subtract\b/i, n: 'subtracts as well as adds', s: 0.2, test: i => /−|(?<![a-z])-\s*\d|subtract|take away|left/i.test(i.text || ''), named: /\bsubtract|\btake away\b|\bboth operations\b/i },
  { re: /\badd and subtract\b/i, n: 'adds as well as subtracts', s: 0.2, test: i => /\+|\badd\b|in all/i.test(i.text || ''), named: /\badd|\bboth operations\b/i },
  { re: /\bfind the total\b/i, n: 'the total of the groups', s: 0.3, test: i => /\btotal\b|in all|altogether|how many (?:things|objects|pictures) are there/i.test(i.text || ''), named: /\btotal\b/i },
  { re: /\bcount each group\b/i, n: 'counts every group', s: 0.3, test: i => /each (?:group|kind)|every (?:group|kind)/i.test(i.text || ''), named: /\beach group\b|\bevery group\b|\bone kind\b|\bonly one\b/i },
  { re: /\bsort\b/i, n: 'sorts (puts every object in a group)', s: 0.3, test: i => /\bsort|put (?:each|every)|into (?:the )?(?:groups|rings|boxes)/i.test(i.text || '') || /sort-?rings|"rings"/i.test(`${i.tpl || ''} ${i.pay || ''}`), named: /\bsort/i },
  { re: /\bsubitis/i, n: 'subitising (dice / dot patterns, seen not counted)', s: 0.5, test: i => /dice|domino|without counting|subitis|"objects":"dice"|"dots"/i.test(`${i.text || ''} ${i.pay || ''} ${i.raw || ''}`), named: /\bsubitis/i },
  { re: /\bstories\b/i, n: 'stories', s: 0.5, test: i => (i.text || '').split(/\s+/).length >= 9 && /\?/.test(i.text || '') && /[a-z]\.\s+[A-Z]/.test(i.text || ''), named: /\bstor(?:y|ies)\b/i },
  { re: /\bfirst,? then,? now\b|\bfirst then now\b/i, n: 'first / then / now strip', s: 0.3, test: i => /\bfirst\b[\s\S]*\bthen\b|story strip|"panels"/i.test(`${i.text || ''} ${i.pay || ''}`), named: /\bfirst\b.*\bthen\b|\bstory strip\b/i },
  { re: /\bzero\b/i, n: 'zero dealt', s: 0.3, test: i => String(i.a ?? '').trim() === '0' || /\bzero\b|\bnone\b|\bempty\b/i.test(i.text || ''), named: /\bzero\b|\b0\b/i },
  { re: /\bpairs\b/i, n: 'pairs', s: 0.3, test: i => /\bpairs?\b|\bodd\b|\beven\b/i.test(`${i.text || ''} ${i.vis || ''}`), named: /\bpair/i },
  { re: /\bmore and less\b|\bone more\b|\b1 more\b/i, n: 'one more', s: 0.2, test: i => /\bmore\b|\bafter\b|\bnext\b/i.test(i.text || ''), named: /\bmore\b|\bafter\b/i },
  { re: /\bmore and less\b|\bone less\b|\b1 less\b/i, n: 'one less', s: 0.2, test: i => /\bless\b|\bbefore\b|\bfewer\b/i.test(i.text || ''), named: /\bless\b|\bbefore\b/i },
  // lessons critic r1 G6 (seed robustness): a title listing five shapes, judged on the pooled items of two forms, gives each shape
  // about a tenth of the items, so the floor is half that (one in twenty); a shape never asked still fails (0 items)
  ...[['cube', /\bcubes?\b/], ['cuboid', /\bcuboids?\b|rectangular prisms?/], ['sphere', /\bspheres?\b/], ['cone', /\bcones?\b/], ['cylinder', /\bcylinders?\b/],
      ['circle', /\bcircles?\b/], ['triangle', /\btriangles?\b/], ['rectangle', /\brectangles?\b/], ['square', /\bsquares?\b/]].map(([w, iw]) =>
    ({ re: new RegExp(`(?:shapes|\\b2d|\\b3d|sides)[^]*\\b${w}s?\\b|\\b${w}s? and\\b|\\b${w}s?,`, 'i'), n: `asks for the ${w}`, s: 0.05, test: i => new RegExp(`(?:click|find|name|which|what|is it an?)[^.?]*${iw.source}`, 'i').test(i.text || '') || (new RegExp(iw.source, 'i').test(String(i.a || '')) && !/^\s*\[/.test(String(i.a || ''))), named: new RegExp(`\\b${w}`, 'i') })),
  { re: /\bproperties\b/i, n: 'properties (sides, corners, curved or straight)', s: 0.5, test: i => /\bsides?\b|corners?|vert(?:ex|ices)|curved|straight|roll|stack/i.test(T(i)), named: /\bpropert|\bsides?\b|\bcorners?\b/i },
  ...['on', 'under', 'in', 'next to'].map(w => ({ re: new RegExp(`\\blanguage\\b.*\\b${w}\\b`, 'i'), n: `the position word "${w}"`, s: 0.1, test: i => new RegExp(`(?:^|[\\s;{"])${w}(?:$|[\\s;}"?.])`, 'i').test(`${i.a || ''} ; ${i.x || ''}`), named: new RegExp(`(?:^|[\\s,"(])${w}(?:$|[\\s,")])`, 'i') })),
  { re: /\bpositional language\b/i, n: 'positional words (in front, behind, on, under …)', s: 0.3, test: i => /\b(?:in front|behind|under|on top|inside|next to|beside|above|below|between)\b/i.test(`${i.a || ''} ${i.x || ''}`), named: /\bposition/i },
  { re: /\bdecompose\b/i, n: 'decomposes a shape', s: 0.2, test: i => /decompos|split|cut|inside|made of|make up|which (?:two )?shapes make/i.test(i.text || ''), named: /\bdecompos|\bsplit|\bcut\b/i },
  { re: /\bcompose\b(?! and decompose)|\bcompose\b/i, n: 'composes a shape', s: 0.3, test: i => /put (?:these|the)[^?]*together|make|fill|combine|join/i.test(i.text || ''), named: /\bcompos|\bcombin|\bjoin/i },
  { re: /\brotate\b/i, n: 'rotates / turns', s: 0.2, test: i => /rotat|turn|flip/i.test(T(i)), named: /\brotat|\bturn/i },
  { re: /\bmatch\b/i, n: 'matches', s: 0.2, test: i => /\bmatch|the same as|same shape/i.test(i.text || ''), named: /\bmatch/i },
  { re: /\bmapping\b|\bmaps?\b/i, n: 'a map', s: 0.3, test: i => /\bmap\b|\bplan\b|grid|route/i.test(`${i.text || ''} ${i.tpl || ''}`), named: /\bmap/i },
  { re: /\bdirection\b/i, n: 'directions (left, right, forwards, backwards)', s: 0.3, test: i => /\bleft\b|\bright\b|forwards?|backwards?|\bturn\b/i.test(T(i)), named: /\bdirection|\bleft\b|\bright\b/i },
  { re: /\bvisuali[sz]e\b/i, n: 'visualises (another viewpoint)', s: 0.3, test: i => /from (?:above|the side|the front|behind)|view|visuali/i.test(i.text || ''), named: /\bvisuali|\bviewpoint|\bview\b/i },
  { re: /\bteen numbers\b|\bbeyond 10\b/i, n: 'numbers past 10 (11 to 20)', s: 0.5, test: i => Math.max(0, ...[...`${i.text || ''} ${i.a || ''} ${i.pay || ''}`.matchAll(/(?<![\d.])\d+(?![\d.])/g)].map(m => +m[0]).filter(v => v <= 20)) >= 11, named: /\bbelow 1[01]\b|\bunder 1[01]\b|\b(?:0|1) to 9\b|\bsingle-digit\b|\bteen\b|\bbeyond 10\b|\bpast 10\b/i },
  { re: /\bcomparing numbers\b/i, n: 'written numbers (numerals) compared', s: 0.5, test: i => /\d/.test(i.text || '') || /^\s*\d+\s*$/.test(String(i.a || '')), named: /\bnumerals?\b|\bwritten numbers?\b|\bnumber symbols?\b|\bdigits?\b/i },
  { re: /\btaking away\b/i, n: 'takes away', s: 0.5, test: i => /take away|taken|\bleft\b|cross(?:es)? out|gives|eats|flies/i.test(i.text || ''), named: /\btak(?:e|ing) away\b/i },
  { re: /\bcapacity\b/i, n: 'capacity (full, empty, holds more)', s: 0.5, test: i => /capacity|holds?|\bfull\b|empty|jug|container|cup|glass|bottle/i.test(T(i)), named: /\bcapacity\b/i },
  { re: /\bmass\b/i, n: 'mass (heavier, lighter, balance)', s: 0.3, test: i => /heav|light|mass|balance|weigh/i.test(T(i)), named: /\bmass\b|\bheav/i },
  { re: /\bsize\b/i, n: 'size (big, small)', s: 0.3, test: i => /\bbig|\bsmall|\bsize\b|larger|smaller/i.test(T(i)), named: /\bsize\b|\bbig\b/i },
];
export function y6Claims(title) {
  const t = String(title), out = [];
  for (const c of Y6_TITLE_CLAIMS) { const m = t.match(c.re); if (!m) continue;
    if (c.digit) { const D = +m[1]; out.push({ n: `${D}-digit number`, word: `${D}-digit`, s: c.s, re: new RegExp(`\\b${D}-digit\\b`, 'i'),
      test: i => { const v = num1(i); return v != null && Number.isInteger(v) && String(v).length === D; } }); continue; }
    out.push({ n: c.n, word: m[0], s: c.s, test: c.test, re: c.named }); }
  return out;
}

// ---- r15 (critic r14 M12 / N15 / N16): the title's VERB and its CLOCK PRECISION are claims too ----
// VERB: a title that starts with a production verb (make, build, draw, record, write, complete) asks the pupil to PRODUCE the
// thing it names. An item is production when it is not a check (yes / no, true / false, "= or ≠", "Check one box") and not a
// pick of one given answer (the answer is one of the item's options). When the object is a chart (tally chart, pictogram,
// bar chart, table, graph), production means constructing it: the item tells the pupil to make / draw / build / record /
// complete / tally / plot (or the response is a built graph): reading a drawn chart ("How many chose running?") is not.
// MEASURE: a title that starts with "Measure" shows a measuring tool (ruler, scale, cylinder, jug, thermometer, grid).
// READ ... DIGITAL: the item shows a digital time to read (a digital clock reading in the stimulus, not only in the answer).
// CLOCK PRECISION: o'clock (:00), half past (:30), quarter past (:15), quarter to (:45), to 5 minutes (a 5-minute time that
// is not a quarter), to the minute (not a multiple of 5) must each be dealt at their share.
export const PROD_VERB = /^(make|build|draw|record|write|complete)\b/i;
const CHART = /\btally|pictogram|picture graph|bar chart|bar graph|\btables?\b|\bgraph|\bchart/i;
const CONSTRUCT = /^(?:make|draw|build|record|complete|fill in|tally|colou?r|shade|plot|show|mark|draw)\b|\b(?:make|draw|build|complete|fill in|record) (?:a|the|your)\b/i;
export const isCheck = i => /^(?:yes|no|true|false|=|≠|correct|wrong)$/i.test(String(i.a || '').trim()) || /check one box|yes or no|true or false|answer = or ≠|\bis (?:it|this) (?:a|an|the)\b.*\?$/i.test(i.text || '');
// a pick: the response type is a choice (the item generators record answerType as `at`); without one, the answer is one of the
// options (generators also attach numeric options to typed items as a fallback, so `at` decides when it is there)
export const isPick = i => { if (i.at != null) return /^(?:multiple-choice|choice|multi-select-check|hot-spot|odd-even-select|symbol|clock-choice)$/.test(i.at);
  const a = String(i.a || '').trim(); if (!a || !i.x) return false; const xs = String(i.x).split(' ; ').map(x => x.trim()); return xs.length >= 2 && xs.includes(a); };
export const isProduction = i => !isCheck(i) && !isPick(i);
export const isConstruct = i => !isCheck(i) && (CONSTRUCT.test((i.text || '').trim()) || /graph-built|"built"/i.test(i.a || ''));
const TOOL = /square side = 1 unit|count the (?:outside )?edges|ruler|\bscale\b|cylinder|\bjug\b|beaker|thermometer|grid|measur|"kind":"(?:ruler|scale|cylinder|jug)|measuring/i;
// the clock time of an item: the payload's h / m, else an h:mm in the answer
export const timeOf = i => { try { const p = JSON.parse(i.pay || 'null'); if (p && Number.isFinite(p.m) && Number.isFinite(p.h)) return { h: p.h, m: p.m }; } catch { /* no payload */ }
  const m = String(i.a || '').match(/\b(\d{1,2}):(\d\d)\b/); return m ? { h: +m[1], m: +m[2] } : null; };
export const shownDigital = i => /"stimulus":"digital"/.test(i.pay || '') || /\b\d{1,2}:\d\d\b/.test(`${i.text || ''} ${i.vis || ''}`);
export function verbClaims(title) {
  const t = String(title), out = [];
  const v = (t.match(PROD_VERB) || [])[1];
  if (v && !/^make decisions\b/i.test(t)) {   // "Make decisions" chooses a strategy: there is no object to produce
    const obj = t.slice(v.length);
    const chart = CHART.test(obj) && !/times-table/i.test(obj);
    out.push({ n: chart ? `${v.toLowerCase()} (construct the chart)` : `${v.toLowerCase()} (production, not a check or a pick)`, word: v, s: 0.5,
      test: chart ? isConstruct : isProduction,
      named: new RegExp(`\\b(?:${v.toLowerCase().replace(/e$/, '')}(?:e|es|ed|ing)?|${{ make: 'made', build: 'built', draw: 'drawn|drew', write: 'written|wrote', record: 'recorded', complete: 'completed' }[v.toLowerCase()]})\\b`, 'i') });
  }
  if (/^measure\b/i.test(t)) out.push({ n: 'measure (a measuring tool shown)', word: 'Measure', s: 0.5, test: i => TOOL.test(CL.repStr(i)), named: /\bmeasur/i });
  if (/\bdigital\b/i.test(t) && /\bread\b/i.test(t)) out.push({ n: 'reads a digital time', word: 'digital', s: 0.3, test: shownDigital, named: /\bdigital\b/i });
  const CK = [[/o'clock/i, "o'clock", m => m === 0, 0.2], [/half past/i, 'half past', m => m === 30, 0.2], [/quarter past/i, 'quarter past', m => m === 15, 0.2],
    [/quarter to\b/i, 'quarter to', m => m === 45, 0.2], [/to 5 minutes|to five minutes/i, 'to 5 minutes', m => m % 5 === 0 && m % 15 !== 0, 0.3], [/to the minute/i, 'to the minute', m => m % 5 !== 0, 0.3]];
  for (const [re, w, ok, s] of CK) if (re.test(t)) out.push({ n: `clock: ${w}`, word: w, s, test: i => { const tm = timeOf(i); return !!tm && ok(tm.m); }, named: new RegExp(w.replace(/ /g, '\\s+'), 'i') });
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
  if (h.claim === 'word problem' || h.claim === 'story' || h.claim === 'problems in context') return /\bstor(?:y|ies)\b|word problems?|context/i.test(t);
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
      out.push({ at: q.answerType || '', text: st(q.text), a: st(typeof q.ans === 'object' ? JSON.stringify(q.ans) : q.ans), x: st([...(q.options || []), ...(q.tiles || []), ...(q.bins || []), ...(q.items || [])].map(lb).join(' ; ')),
        vis: st(q.visual), raw: String(q.visual || '').toLowerCase().slice(0, 6000), tpl: q.cell ? q.cell.template : '', pay: q.cell ? JSON.stringify(q.cell.payload) : '' }); }
    cache.set(id, out); return out;
  };
}
