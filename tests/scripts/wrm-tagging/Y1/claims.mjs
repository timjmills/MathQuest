// Y6 claim checker: a copy of the Y5 lane's claims.mjs (critic r6-r8 classes K, L, M, N; passed Y5 critic r8), used by lessonfit.mjs
// A why (pre / related link) or a clause (partial `missing`) is a set of CLAIMS about the items the link deals: a unit
// ("litres", "mL", "metric"), an operation ("adds", "÷"), a representation ("number line", "bar model"), a number kind
// ("decimals", "3 dp"), an idea ("times as many") or a context ("story", "money"). Each claim word is read from the text
// with its negated parts removed ("no pictures", "never adds …"), and must be true of at least a share of the items.
// A NEGATED claim in a clause ("never adds a tenths and a hundredths fraction") must be false of the items instead.
// Used by linkfit.mjs (every build: the RULES set) and by sweep.mjs (fresh seeds, every claim, a report to review).
export const CUST = /\b(ounces?|oz|pounds?|lbs?|yards?|yd|inch(es)?|feet|foot|ft|miles?|gallons?|gal|quarts?|qt|pints?|pt|fahrenheit|tons?)\b|\d\s*cups?\b|\bcups\b|°\s*F\b/i;
export const MET = /\d\s*(?:cm|mm|km|kg|m|g|l|ml)\b|\b(?:cm|mm|km|kg|ml|mL)\b|\d\s*L\b|centimet|millimet|kilomet|kilogram|millilit|\bgrams?\b|\bmet(?:re|er)s?\b|\blit(?:re|er)s?\b|cubic (?:centi|units?)|cm³|cm2|cm²|m²/i;
// the text a claim is judged on: the question, the answer, options / tiles, the stripped picture, the raw picture markup,
// the cell template and its payload (class names and payload keys name a representation: "nlp-line", "rows", "places")
export const itemStr = i => `${i.text || ''} ¦ ${i.a || ''} ¦ ${i.x || ''} ¦ ${i.vis || ''} ¦ ${i.raw || ''} ¦ ${i.tpl || ''} ¦ ${i.pay || ''}`;
export const itemWords = i => `${i.text || ''} ¦ ${i.a || ''} ¦ ${i.x || ''} ¦ ${i.vis || ''}`;
// critic r7 N': a REPRESENTATION claim ("read on a scale", "number line", "bar model") is judged on the picture, its raw markup,
// the cell template and its payload ONLY: option and tile text is not a picture ("Milk jug" in a unit sort is not a scale)
// The question's own stem may name what is drawn or built ("Read the graduated cylinder", "Build a bar graph": an interactive
// builder has no picture markup); the options, tiles and answer never count.
export const repStr = i => `${i.text || ''} ¦ ${i.vis || ''} ¦ ${i.raw || ''} ¦ ${i.tpl || ''} ¦ ${i.pay || ''}`;
// a FORM claim (what the pupil does: sort, click, drag, convert, rename) is judged on the question, the template and the payload
export const formStr = i => `${i.text || ''} ¦ ${i.tpl || ''} ¦ ${i.pay || ''}`;
const FR = /(?<![\d/])\d+\s*\/\s*\d+(?![\d/])|class="den"/;
// [name, claim regex (on the why / clause), item regex, share of items that must show it, judged on 'words' | 'all']
// RULE = true: run on every build by linkfit (precise enough to gate); the others are swept and reviewed by hand.
export const CLAIMS = [
  // units (critic r6 K: a why that says metric / L / mL must be true of the items; r5: kilograms and grams on lb items)
  { n: 'metric', c: /\bmetric\b/i, i: MET, s: 0.4, rule: true },
  { n: 'customary', c: /\b(customary|imperial)\b/i, i: CUST, s: 0.4, rule: true },
  { n: 'millilitres', unit: true, c: /\b(mL|ml|millilit\w*|millilit(?:er|re)s?)\b/, i: /\bml\b|millilit/i, s: 0.2, rule: true },
  { n: 'litres', unit: true, c: /\d\s*L\b|\bL\s*(?:↔|and|or|=)|(?:↔|and|or)\s*L\b|\blit(?:re|er)s?\b/, i: /\d\s*L\b|\bL\b|\blit(?:re|er)s?\b/, s: 0.2, rule: true },
  { n: 'kilograms', unit: true, c: /\b(kg|kilograms?)\b/i, i: /\bkg\b|kilogram/i, s: 0.2, rule: true },
  { n: 'grams', unit: true, c: /\b(\d\s*g|grams?)\b/i, i: /\d\s*g\b|\bgrams?\b|\bg\b/i, s: 0.2, rule: true },
  { n: 'kilometres', unit: true, c: /\b(km|kilomet(?:re|er)s?)\b/i, i: /\bkm\b|kilomet/i, s: 0.2, rule: true },
  { n: 'centimetres', unit: true, c: /\b(cm|centimet(?:re|er)s?)\b/i, i: /\bcm\b|centimet|cm[²³2]/i, s: 0.2, rule: true },
  { n: 'millimetres', unit: true, c: /\b(mm|millimet(?:re|er)s?)\b/i, i: /\bmm\b|millimet/i, s: 0.2, rule: true },
  { n: 'metres', unit: true, c: /\b(\d\s*m|met(?:re|er)s?)\b/i, i: /\d\s*m\b|\bm\b|\bmet(?:re|er)s?\b|m²/i, s: 0.2, rule: true },
  { n: 'cups / pints / quarts / gallons', c: /\b(cups?|pints?|quarts?|gallons?|fl oz)\b/i, i: /\bcups?\b|pints?|quarts?|gallons?|\bqt\b|\bgal\b|\bpt\b|fl\.? oz/i, s: 0.2, rule: true },
  { n: 'ounces / pounds', c: /\b(ounces?|oz|pounds?|lbs?)\b/i, i: /\bounces?\b|\boz\b|\bpounds?\b|\blbs?\b/i, s: 0.2, rule: true },
  { n: 'inches / feet / yards / miles', c: /\b(inch(es)?|feet|foot|ft|yards?|yd|miles?)\b/i, i: /\binch|\bin\.|\bfeet\b|\bfoot\b|\bft\b|\byards?\b|\byd\b|\bmiles?\b/i, s: 0.2, rule: true },
  { n: 'minutes / hours / seconds', c: /\b(minutes?|hours?|seconds?|mins?)\b/i, i: /\bminutes?\b|\bhours?\b|\bseconds?\b|\bmin\b|\bhr\b|\bsec\b|o'clock|:\d\d|clock/i, s: 0.2, rule: true },
  { n: 'degrees', c: /°|\bdegrees?\b/i, i: /°|degree|protractor|angle/i, s: 0.2, rule: true },
  { n: 'money', c: /\b(money|dollars?|cents?|coins?|notes?)\b|\$|¢|£/i, i: /\$|¢|£|dollar|cent|coin|money|price|cost|\bpay|spend|change/i, s: 0.2, rule: true },
  // critic r6 L: a multiplicative idea must be multiplicative in the items (tape_diagram is additive in every form)
  { n: 'times as many / equal groups', c: /times[- ]as[- ]many|how many times|multiplicative|equal (?:groups|shares)|scal(?:e|ing) (?:up|by)/i,
    i: /\btimes\b|×|÷|(?<![a-z])x(?=\s*\d)|equal(?:ly)?\b|in each\b|each (?:friend|group|row|box|bag|plate|basket|jar|pack)|groups? of\b|\bshare|missing factor|\?\s*×|×\s*\?|_+\s*[×÷]|[×÷]\s*_+/i, s: 0.34, rule: true },
  { n: 'equal parts', c: /equal parts/i, i: /equal|\d+\s*\/\s*\d+|class="den"|parts?\b|fraction|share|÷/i, s: 0.34, rule: true },
  // operations
  { n: 'adds', c: /\b(add(?:s|ing|ition)?|sums?|plus)\b|\+/i, i: /\+|\badd|\bsum\b|total|in all|altogether|\bmore\b|combined|plus/i, s: 0.2 },
  { n: 'subtracts', c: /\b(subtract\w*|minus|take away|difference)\b|−(?=\s*\d)/i, i: /[−-]\s*\d|subtract|difference|\bleft\b|remain|fewer|less|take away|how many more|gave|used|minus/i, s: 0.2 },
  { n: 'multiplies', c: /\b(multipl(?:y|ies|ying|ication)|products?)\b|×/i, i: /×|(?<![a-z])x(?=\s*\d)|multipl|product|times|\beach\b|groups? of|rows? of|array|\bof\b/i, s: 0.2 },
  { n: 'divides', c: /\b(divid(?:e|es|ing)|division|quotients?)\b|÷/i, i: /÷|divid|division|quotient|\bshare|equal(?:ly)?|in each|left over|remainder|⟌|bracket|\bper\b|how many (?:groups|boxes|bags|teams|rows)/i, s: 0.2 },
  { n: 'remainders', c: /\bremainders?\b/i, i: /remainder|left over|\bR\s?\d|\br\d|leftover/i, s: 0.2 },
  { n: 'rounds', c: /\bround(?:s|ing|ed)?\b(?! (?:up|the answer))/i, i: /round|nearest|closer to/i, s: 0.2 },
  // number kinds and sizes
  { n: 'fractions', c: /\bfractions?\b/i, i: FR, s: 0.2, rule: true },
  { n: 'decimals', c: /\bdecimals?\b/i, i: /\d\.\d|decimal/i, s: 0.2, rule: true },
  { n: '3 dp', c: /\b(3 dp|three decimal places|thousandths)\b/i, i: /\d\.\d{3}\b|\/\s*1,?000\b|thousandth/i, s: 0.2, rule: true },
  { n: 'negative numbers', c: /\bnegative\b/i, i: /[−-]\s?\d|negative|below zero/i, s: 0.2, rule: true },
  { n: 'percent', c: /%|\bpercent/i, i: /%|percent/i, s: 0.2, rule: true },
  { n: 'Roman numerals', c: /\bRoman\b/, i: /\b[IVXLCDM]{2,}\b|Roman/, s: 0.2, rule: true },
  // representations (raw picture markup and template names count)
  { n: 'number line', c: /number[- ]lines?/i, i: /number[- ]?line|nlp|numline|"ticks"|line-mark|"support":"line"|"kind":"line|class="nl|frac-line|nl-/i, s: 0.2, all: true },
  { n: 'bar model', c: /bar models?|tape diagrams?|\bbar of\b|bars? cut/i, i: /tape|bar[- ]model|"bars"|bar-diagram|class="bar|\bbar\b/i, s: 0.2, all: true },
  { n: 'hundred square', c: /hundred squares?|100 square|10 ?× ?10 grid/i, i: /hundred|10x10|10 × 10|grid|"cells":100|hundredths/i, s: 0.2, all: true },
  { n: 'array', c: /\barrays?\b/i, i: /array|"rows"|rows? of|\brows?\b[^¦]{0,20}\bcolumns?\b|dot|(?:<circle[^>]*>\s*){4,}/i, s: 0.2, all: true },
  { n: 'place-value chart / counters', c: /place[- ]value (?:chart|grid|mat|counters?)|counters on|\bdisks?\b/i, i: /place[- ]?value|pv-|"places"|counter|disk|chart|\bth\b.*\bh\b.*\bt\b/i, s: 0.2, all: true },
  { n: 'base 10', c: /base[- ]?10|dienes|\bflats?\b|\brods?\b/i, i: /base[- ]?10|b10|flat|rod|cube|block/i, s: 0.2, all: true },
  { n: 'protractor', c: /protractor/i, i: /protractor/i, s: 0.2, all: true },
  { n: 'clock', c: /\bclocks?\b|analogue|analog/i, i: /clock|o'clock|:\d\d|hand/i, s: 0.2, all: true },
  { n: 'ruler / scale', c: /\bruler\b|\bscales?\b(?! factor)|thermometer|cylinder|\bjug\b/i, i: /ruler|scale|thermometer|cylinder|jug|tick|°/i, s: 0.2, all: true },
  { n: 'area model / grid method', c: /area model|grid method/i, i: /area[- ]?model|grid|box method|partial products|"parts"/i, s: 0.2, all: true },
  { n: 'column method', c: /\bcolumns?\b(?! of)|column method|written method|vertical/i, i: /"stack"|stack|column|vertical|align/i, s: 0.2, all: true },
  { n: 'graph / chart / table', c: /\b(bar graphs?|bar charts?|pictograms?|pictographs?|line graphs?|line plots?|tally|(?<!times-)tables?)\b/i, i: /graph|chart|pictogra|plot|tally|table|<table|svg/i, s: 0.2, all: true },
  { n: 'coordinates', c: /\bcoordinates?\b/i, i: /coordinat|\(\s*-?\d+\s*,\s*-?\d+\s*\)|"x":|grid|plot/i, s: 0.2, all: true },
  // critic r7 N: FORM claims, what the pupil does with the item (a re-option from a sort to a convert form made "sort containers"
  // false on Y5.B14.S4; "45 hundreds = 4,500" on standard unit-form items made lesson 2's why false)
  { n: 'sorts', c: /\bsort(?:s|ing|ed)?\b/i, i: /\bsort|"bins"|drag-bin|\bbins?\b/i, s: 0.2, form: true },
  { n: 'clicks', c: /\bclick(?:s|ing)?\b|click-all/i, i: /\bclick|\btap\b|\bselect\b|"hotspot|hotspot/i, s: 0.2, form: true },
  { n: 'drags', c: /\bdrag(?:s|ging)?\b/i, i: /\bdrag|drag-bin|"tiles"/i, s: 0.2, form: true },
  { n: 'converts', c: /\bconver(?:t|ts|ting|sions?)\b/i, i: /convert|how many \w+(?: \w+)? (?:are )?(?:in|make)|how many \w+ is that|\bwrite\b[^¦]{0,40}\bas an? (?:mixed number|improper fraction|fraction|decimal)|\d\s*[a-zA-Z]+\.?\s*=\s*(?:_+|\?|\d)|=\s*(?:_+|\?)\s*[a-zA-Z]|_+\s*[a-zA-Z]+\s*=|conversion/i, s: 0.2, form: true },
  { n: 'renamed unit form', c: /\b(?:[1-9]\d+)\s+(?:ones|tens|hundreds|thousands)\b|\brenam\w*\b[^;,.]{0,30}\b(?:ones|tens|hundreds|thousands)\b/i, i: /\b[1-9]\d+\s+(?:ones|tens|hundreds|thousands)\b/i, s: 0.2, form: true },
  // contexts
  { n: 'story', c: /\bstor(?:y|ies)\b|word problems?/i, i: null, s: 0.3 },
  { n: 'circle model', c: /\bcircle models?\b|\bfraction circles?\b|\bcircles? (?:cut|divided|split|shaded)\b|\bpie\b/i, i: /"kind":"circle"|circle|<circle|<ellipse|pie/i, s: 0.2, all: true },
];
// remove negated parts and the parts that describe another step or the pupil, not the items
export function positive(t) {
  return String(t || '')
    .replace(/\b(?:no|never|not|without|nor|instead of|rather than|other than|beyond|past|before (?:the|any|a|\w+ing)\b)\b[^;,.:()]*(?:\([^)]*\))?/gi, ' ')
    .replace(/\b(?:the next step|next step|the step after|the Grade \d step|later|then|beside|after it|before it)\b[^;,.:()]*/gi, ' ');
}
export function negatedParts(t) {
  return [...String(t || '').matchAll(/\b(?:never|no|without)\b([^;,.:()]*)/gi)].map(m => m[1].trim()).filter(Boolean);
}
const story = i => (i.text || '').split(/\s+/).length >= 9 && /\?/.test(i.text || '') && /[a-z]\.\s+[A-Z]|\b(?:has|had|have|buys|bought|needs|makes|ran|runs|puts|shares|gets|weighs|holds|uses|costs|biked|walked|is|was)\b/.test(i.text || '') && !/^(?:Find|Convert|What is|Write|Click|Round|Compare|Order|Drag|Estimate|Sort)\b/.test(i.text || '');
// GATE (critic r7 N): the claims linkfit enforces on every build: the rules, every representation claim (picture only) and every
// form claim. Operations and "story" are fuzzy (a purpose word, "to check by adding") and stay in the swept, hand-read set.
export const isGate = cl => !!(cl.rule || cl.all || cl.form);
export function claimHits(text, items, { rulesOnly = false, gateOnly = false, ruleSet = null } = {}) {
  const pos = positive(text), out = [], N = items.length || 1;
  // a text that lists several units ("kg↔g, km↔m, m↔cm and L↔mL") claims a mix: each listed unit is judged at its share of the list
  const nUnits = CLAIMS.filter(cl => cl.unit && cl.c.test(pos)).length;
  for (const cl of CLAIMS) {
    if (rulesOnly && !cl.rule) continue;
    if (gateOnly && !isGate(cl)) continue;
    if (ruleSet && !ruleSet.has(cl.n)) continue;
    if (!cl.c.test(pos)) continue;
    if (cl.n === 'litres' && /\b[IVXCDM]\b.*\b[IVXCDM]\b/.test(pos)) continue;   // "D, C, L and X" are Roman numerals
    // lessons critic r1 G6: a cylinder named among solids (3-D shapes, sphere, cube, cone, prism) is a solid, not a measuring cylinder
    // (titlerep.mjs has the same exemption for titles); only a ruler / scale / thermometer / jug word still makes the claim
    if (cl.n === 'ruler / scale' && /\bcylinders?\b/i.test(pos) && /\b3-?d\b|\bsolids?\b|\bspheres?\b|\bcubes?\b|\bcones?\b|\bprisms?\b|\bcuboids?\b/i.test(pos)
        && !/\bruler\b|\bscales?\b(?! factor)|thermometer|\bjug\b/i.test(pos)) continue;
    const hit = cl.n === 'story' ? items.filter(story).length : items.filter(i => cl.i.test(cl.all ? repStr(i) : cl.form ? formStr(i) : itemWords(i))).length;
    const share = cl.unit && nUnits > 2 ? Math.max(0.05, cl.s / (nUnits - 1)) : cl.s;
    out.push({ claim: cl.n, word: (pos.match(cl.c) || [''])[0], hit, n: N, ok: hit >= share * N });
  }
  return out;
}
// a clause's negated OPERATION ("never adds a tenths and a hundredths fraction", "no ÷", "never a division") must be false of
// the items: the operation's sign in more than a third of the items is a false clause. Only an operation word right after the
// negation counts (a noun after it, "no unit-fraction-only control", names a missing option, not the items).
const OPS = [['adds', /^(?:a |an )?(?:add(?:s|ing|ition)?|sums?)\b|^\+/i, /\d\s*\+\s*\d|\d\s*\+\s*_|_\s*\+\s*\d|\bby adding\b/i],
  ['subtracts', /^(?:a |an )?(?:subtract\w*)\b|^−/i, /\d\s*[−-]\s*\d/],
  ['multiplies', /^(?:a |an )?(?:multipl\w*)\b|^×/i, /\d\s*[×x]\s*\d/],
  ['divides', /^(?:a |an )?(?:divi\w*)\b|^÷/i, /÷|⟌/]];
export function negatedHits(text, items) {
  const out = [], N = items.length || 1;
  for (const part of negatedParts(text)) for (const [n, c, re] of OPS) {
    if (!c.test(part)) continue;
    const hit = items.filter(i => re.test(`${i.text || ''} ${i.x || ''}`)).length;
    out.push({ claim: n, part, hit, n: N, ok: hit <= N / 3 });
  }
  return out;
}
// a why marked "the adding half" (build.py pass 3b) must deal only that half: the other operation's sign in a third of the
// items makes the marker false
const HALF_OTHER = { adding: OPS[1][2], subtracting: OPS[0][2], multiplication: OPS[3][2], division: OPS[2][2] };
export function halfHits(why, items) {
  const h = String(why || '').match(/\bthe (adding|subtracting|multiplication|division) half\b/); if (!h) return [];
  const N = items.length || 1, hit = items.filter(i => HALF_OTHER[h[1]].test(`${i.text || ''} ${i.x || ''}`)).length;
  return [{ claim: `the ${h[1]} half`, hit, n: N, ok: hit <= N / 3 }];
}
// the text of a why that is claimed true of the items: a cited step's FULL title (parentheses included, critic r6 H'), and the
// builder's own words; the boilerplate of where the step sits is not a claim. "(… the adding half)" names which half of an
// "add and subtract" title the link deals, and the other half is then not claimed.
const BOIL = /taught earlier this year, wk W\d+|taught the same school week,? W\d+|lower grade, same (?:idea|cluster[^;)]*)|prior learning(?: wk W\d+)?|previous step|earlier (?:Y5 )?(?:step|block)|same idea|next step/g;
const HALF = { adding: /\bsubtract\w*|\bminus\b/gi, subtracting: /\badd(?:s|ing|ition)?\b/gi, multiplication: /\bdivi\w*|\bdivision\b/gi,
  division: /\bmultipl\w*|times-tables?/gi };
export function claimText(why, titles) {
  const w = String(why || ''), m = w.match(/^((?:R|Y\d)\.B\d+\.S\d+)\s*(.*)$/);
  if (!m) return w;
  let rest = m[2], t = titles[m[1]] || '';
  if (t && rest.startsWith(t)) rest = rest.slice(t.length);
  if (/nearest live practice|has no live skill/.test(w)) t = '';
  const h = rest.match(/\bthe (adding|subtracting|multiplication|division) half\b/);
  if (h) t = t.replace(HALF[h[1]], ' ');
  rest = rest.replace(/\(nearest live practice[^)]*\)?/g, ' ').replace(BOIL, ' ');
  return t + ' ' + rest;
}
// metric and customary entries (critic r6 K, the lead's "and vice versa")
export const metricWords = /centimet|millimet|kilomet|met(?:re|er)|gram|lit(?:re|er)|millilit|kilo|cubic|\bmetric\b/i;
export const custWords = /customary|imperial|cups?|pints?|quarts?|gallons?|inch|feet|foot|yards?|ounces?|pounds?|miles?/i;
