// Teacher site 2.0 T1: every live skill's thumbnail must show that skill (critic r1 C1: "Find the Start" was drawn as an
// addition, place-value skills as facts, every Maths words card the same). A machine check, not a look:
//   node design/mockups/teacher-2/thumbs-check.cjs          prints the drawing used per category; exit 1 on any failure
// Rules: every live skill gets a named drawing (never a fallback); a skill's drawing agrees with its name (subtraction never
// draws an addition and back, word problems draw a story of the right operation, start-unknown draws a start-unknown story,
// place value draws place value, time draws a clock, fractions draw fractions, …); every Maths words card is different.
// thumbs.html shows every thumbnail for a look by eye.
'use strict';
const path = require('path');
global.window = global;
require(path.join(__dirname, 'data.js'));
require(path.join(__dirname, 'thumbs.js'));
const D = window.MQ_DATA, T = window.MQThumbs;

const ADD = new Set(['eq-add', 'stack-add', 'story-add', 'pics-add', 'nl-add', 'missing-addend', 'stack-add-missing', 'add-three', 'stack-add-multi']);
const SUB = new Set(['eq-sub', 'stack-sub', 'story-sub', 'pics-sub', 'nl-sub', 'stack-sub-missing', 'stack-sub-zeros', 'story-sub-start', 'missing-sub', 'sub-check']);
const fails = []; const byCat = {}; const svgs = {};
const fail = (s, k, why) => fails.push(`${s.c}:${s.v} (“${s.l}”) drew ${k}: ${why}`);
for (const s of D.skills) {
  const k = T.kindOf(s); const out = T.draw(s, 1); const v = s.v, L = s.l.toLowerCase();
  (byCat[s.c] = byCat[s.c] || {})[k] = ((byCat[s.c] || {})[k] || 0) + 1;
  if (k === 'unknown' || !out || !/^<svg/.test(out)) { fail(s, k, 'no drawing'); continue; }
  if (/NaN|undefined/.test(out)) fail(s, k, 'NaN or undefined in the drawing');
  const pool = k.startsWith('pool-');
  if (s.c === 'subtraction' && !pool && ADD.has(k)) fail(s, k, 'a subtraction skill drawn as an addition');
  if (s.c === 'addition' && !pool && SUB.has(k)) fail(s, k, 'an addition skill drawn as a subtraction');
  if (/word_problems|_wp_|_wp$|wp_\d|word$/.test(v) && !/^story-/.test(k)) fail(s, k, 'a word-problem skill without a story');
  if (/start/.test(v) && /wp/.test(v) && k !== 'story-sub-start') fail(s, k, 'a start-unknown story must show the start missing');
  if (/compare/.test(v) && /wp/.test(v) && k !== 'story-compare') fail(s, k, 'a compare story must compare two amounts');
  if (s.c === 'subtraction' && /story/.test(k) && !/sub|compare/.test(k)) fail(s, k, 'a subtraction story must take away, compare or find the start');
  if (s.c === 'multiplication' && /story/.test(k) && !/mult/.test(k)) fail(s, k, 'a multiplication story must multiply');
  if (s.c === 'division' && /story/.test(k) && !/div|remainder/.test(k)) fail(s, k, 'a division story must divide');
  if (s.c === 'placevalue' && !/^pv-|^pool-placevalue/.test(k)) fail(s, k, 'a place-value skill must draw place value');
  if (/place.?value|unit form|expanded/i.test(s.l) && !/^pv-|pool-|^rods|^flats/.test(k)) fail(s, k, 'its name says place value');
  if (/^time_|clock/.test(v) && !/clock|digital|am-pm/.test(k)) fail(s, k, 'a time skill must draw a clock or a time');
  if ((s.c === 'fractions' || s.c === 'fraction_operations') && !/^frac|^story-frac|^pool-fraction/.test(k)) fail(s, k, 'a fraction skill must draw fractions');
  if (s.c === 'vocabulary' && k !== 'words') fail(s, k, 'a Maths words skill must draw its words');
  if (/money|coin|notes/.test(v) && !/coins|notes|money/.test(k)) fail(s, k, 'a money skill must draw money');
  if (s.c === 'graphs' && !/tally|pictograph|line-plot|pie|bar-graph|pool-graphs/.test(k)) fail(s, k, 'a graph skill must draw its graph');
  if (/^count_by_|^seq_\d/.test(v) && k !== 'skip-count') fail(s, k, 'a count-by skill must draw the count');
  if (s.c === 'vocabulary') { if (svgs[out]) fail(s, k, `the same picture as ${svgs[out]}`); svgs[out] = v; }
}
// fix round 2 (critic r2 C2): variants show their variant. A "(Visual)" / "with Pictures" skill draws a picture; a
// "(No Pictures)" / "(No Visuals)" twin draws none where its pictured twin does, and the two never draw the same thing.
const byId = Object.fromEntries(D.skills.map(s => [s.c + ':' + s.v, s]));
for (const s of D.skills) {
  const out = T.draw(s, 1);
  if (/\(visual|with pictures|visual pizza/i.test(s.l) && !T.picCount(out)) fail(s, T.kindOf(s), 'a Visual skill with no picture');
  if (/no pictures|no visuals/i.test(s.l)) {
    const twin = byId[s.c + ':' + s.v.replace(/_plain$|_nv$/, '')] || byId[s.c + ':' + s.v.replace(/_nv$/, '_visual')];
    if (twin) { const t = T.draw(twin, 1); if (t === out) fail(s, T.kindOf(s), `draws the same as its pictured twin ${twin.v}`); if (T.picCount(t) <= T.picCount(out)) fail(s, T.kindOf(s), `has as much picture as its pictured twin ${twin.v}`); }
  }
  if (/^story-/.test(T.kindOf(s)) && !/no pictures/i.test(s.l) && T.draw(s, 1, { pictures: false }) === out) fail(s, T.kindOf(s), 'Pictures off draws the same as Pictures on');
}
// the same skill must draw the same kind with every seed, and a different item with a different seed
for (const s of D.skills.slice(0, 120)) if (T.draw(s, 1) === T.draw(s, 2) && T.draw(s, 2) === T.draw(s, 3) && !/words|shape|solid|compose|lines|symmetry|net|pie|box-plot|stat|spinner|attributes|classify|area-|positions|balance|jug|thermo|ruler|frac-|story-frac|story-convert|convert-|fdp|am-pm|digital|money-words|clock-parts|clock-fives|clock-order|length|nonstandard|oop-compare|div-sort|double-nl|inequality|transform|coord-polygon|volume|partition|pv-words|stat-question/.test(T.kindOf(s))) fails.push(`${s.c}:${s.v} draws the same item for every seed (New numbers would not change it)`);

for (const [c, kinds] of Object.entries(byCat)) console.log(`${c.padEnd(20)} ${Object.entries(kinds).map(([k, n]) => `${k}${n > 1 ? ' ×' + n : ''}`).join(', ')}`);
const kinds = new Set(D.skills.map(s => T.kindOf(s)));
console.log(`\n${D.skills.length} live skills · ${kinds.size} different drawings · ${Object.keys(svgs).length} Maths words cards, all different`);
if (fails.length) { console.log('\nthumbs-check: FAIL'); fails.slice(0, 60).forEach(f => console.log('  ' + f)); if (fails.length > 60) console.log(`  … ${fails.length - 60} more`); process.exit(1); }
console.log('thumbs-check: OK');
