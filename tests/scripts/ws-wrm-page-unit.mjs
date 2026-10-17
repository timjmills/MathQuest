// ws-wrm-page-unit.mjs — node unit test for the White Rose page data: the GENERATED sequence
// (wrm-sequence-db.js) and the link rules (wrm-links.js). Run: node tests/scripts/ws-wrm-page-unit.mjs
//   --write-index        regenerate data/curriculum/links/index.json from the files on disk (after a merge)
//   --curated <dir,...>  also run the jargon gate over the tagging lanes' newest files
// The JARGON gate runs over EVERY teacher-facing line of the real link files (why / missing / partial /
// prior lines, MAP task notes, every Skills to be made field) through the page's own text functions.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
const { ready: jargonReady, jargonHit } = createRequire(import.meta.url)('../lib/wrm-jargon.cjs');
await jargonReady();
import { WRM_SEQUENCE } from '../../js/modules/wrm-sequence-db.js';
import { WRM_STEPS, skillsForWrmStep } from '../../js/modules/wrm.js';
import { linksFor, allLessons, lessonByKey, searchLessons, addCuratedYear, clearCurated, proposalName, unitLessons, lessonBySite, lessonBySiteSlug,
    lessonHash, siteSlug, siteFlagText, lessonAbout, siteLessonLabel,
    PREREQ_CAP, RELATED_CAP, WRM_LINK_OVERRIDES, REP_PAIRS, composeWhy, composePartial, composeMissing, proposalLabel, stepsInNote, taskName, MAP_STRANDS, strandOfKey, repPairsOfText,
    partialVerdict, LATER_LEAD, supportWeeksOf, placeDomain, curatedFor, curatedLessonFor, baseKey } from '../../js/modules/wrm-links.js';
import * as P0 from '../../js/modules/plain-words.js';
import { VISUALS } from '../../js/modules/visual-catalogue.js';
import { buildQueue, passes, toCSV, CSV_HEAD, KINDS, gradesOfText, gradeOfCode, gradeOfRit, closesText, stepName } from '../../js/modules/build-queue.js';

let fails = 0;
const ok = (c, msg) => { if (!c) { fails += 1; console.log('FAIL', msg); } };
const stepIds = new Set(WRM_STEPS.map((s) => s.id));

// sequence
ok(WRM_SEQUENCE.map((g) => g.id).join() === 'PK,K,1,2,3,4,5', 'grades PK..5 in order');
const L = allLessons();
ok(L.length > 900, `>900 lessons (${L.length})`);
for (const l of L) {
    if (l.step) ok(stepIds.has(l.step), `${l.key} maps to a real step ${l.step}`);
    if (l.type === 'build') ok(!l.step, `${l.key} CCSS BUILD has no step`);
}
const SEQ_L = L.filter((l) => l.seq);   // the White Rose sequence rows (the site's own lessons are checked below)
const mapped = SEQ_L.filter((l) => l.step).length;
ok(mapped / SEQ_L.length > 0.9, `>90% of the sequence mapped (${mapped}/${SEQ_L.length})`);
const g2 = lessonByKey('2:D1:1');
ok(g2 && g2.title === 'Represent numbers to 100' && g2.step === 'Y3.B1.S1' && g2.power && g2.weeks[0] === 'W01', 'Grade 2 D1 lesson 1 = Y3.B1.S1, power, W01');
const copied = L.find((l) => l.type === 'copied');
ok(copied && copied.from, 'copied-in lesson keeps its source grade');
ok(WRM_SEQUENCE.find((g) => g.id === '2').prior.W01.length >= 5, 'Grade 2 W01 has prior-learning steps');
ok(WRM_SEQUENCE.find((g) => g.id === '2').units.map((u) => u.id).slice(0, 2).join() === 'D1,D2', 'units in workbook order');

// mapping (critic r1 B1): an exact title maps to its exact step; no two White Rose lessons of a grade share
// a step unless their titles are the same lesson; cross-year and adapted mappings are in the report.
const norm = (t) => String(t || '').toLowerCase().replace(/[–—]/g, '-').replace(/[^a-z0-9]+/g, ' ').trim();
const stepById = new Map(WRM_STEPS.map((s) => [s.id, s]));
const YEAR_OF = { PK: 'R', K: 'Y1', 1: 'Y2', 2: 'Y3', 3: 'Y4', 4: 'Y5', 5: 'Y6' };
for (const l of L) {
    if (!l.step || l.type === 'build') continue;
    const st = stepById.get(l.step);
    const year = l.step.split('.')[0];
    const exact = WRM_STEPS.filter((s) => s.id.startsWith(year + '.') && norm(s.title) === norm(l.title));
    if (exact.length === 1) ok(l.step === exact[0].id, `${l.key} "${l.title}" maps to ${l.step}, exact title is ${exact[0].id}`);
    if (!exact.length && !l.note) ok(norm(st.title).length > 0, `${l.key} title-less map`);
}
for (const g of WRM_SEQUENCE) {
    const seen = new Map();
    for (const l of L.filter((x) => x.grade === g.id && x.step && x.type === 'wr')) {
        const prev = seen.get(l.step);
        ok(!prev || norm(prev.title) === norm(l.title) || l.note || prev.note, `${g.id}: "${prev && prev.title}" and "${l.title}" share ${l.step}`);
        seen.set(l.step, l);
    }
}
const pkMore = L.filter((l) => l.grade === 'PK' && /^1 (more|less)$/.test(l.title)).map((l) => l.step);
ok(new Set(pkMore).size === pkMore.length && pkMore.length >= 8, `Pre-K "1 more/1 less" map to distinct steps (${pkMore})`);
ok(L.find((l) => /Find the difference \(US/.test(l.title)).step === 'Y2.B4.S7', 'US money lesson adapted to Y2.B4.S7');
ok(L.filter((l) => l.note === 'ADAPT: US money').length === 5, 'five US-money lessons tagged ADAPT');

// rules
for (const l of L) {
    const r = linksFor(l);
    const d = new Set(r.direct.map((x) => x.key));
    ok(r.prereq.length <= PREREQ_CAP && r.related.length <= RELATED_CAP, `${l.key} caps`);
    ok(r.prereq.every((x) => !d.has(x.key)) && r.related.every((x) => !d.has(x.key)), `${l.key} direct never repeated`);
    const p = new Set(r.prereq.map((x) => x.key));
    ok(r.related.every((x) => !p.has(x.key)), `${l.key} related never repeats a prerequisite`);
    ok(p.size === r.prereq.length, `${l.key} prereq de-duplicated`);
    ok(r.prereq.every((x) => x.why || x.same) && r.related.every((x) => x.why || x.same), `${l.key} every link says why (or shares the row above's line)`);
    if (l.step) ok(r.direct.length === skillsForWrmStep(l.step, { withPartial: true }).length, `${l.key} direct = SKILL_WRM tags`);
    ok(['full', 'partial', 'gap'].includes(r.verdict), `${l.key} verdict`);
}
ok(JSON.stringify(linksFor('2:D1:1')) === JSON.stringify(linksFor('2:D1:1')), 'deterministic');
ok(linksFor('2:D1:1').prereq[0].why.startsWith('Taught before'), 'workbook prior learning comes first');
// override
const second = linksFor('2:D1:1').prereq[1].key;
WRM_LINK_OVERRIDES['Y3.B1.S1'] = { prereq: { add: ['counting:count_objects'], remove: [second] } };
const ov = linksFor('2:D1:1');
ok(ov.prereq[0].key === 'counting:count_objects' && ov.prereq[0].why === 'Added by the school', 'override add goes first');
ok(!ov.prereq.some((x) => x.key === second), 'override remove');
delete WRM_LINK_OVERRIDES['Y3.B1.S1'];
// curated data wins; absent steps fall back
addCuratedYear(JSON.parse(readFileSync(new URL('../fixtures/wrm-links-sample.json', import.meta.url))));
const c = linksFor('2:D1:1');
ok(c.source === 'curated' && c.verdict === 'partial' && c.direct.length === 2 && c.direct[1].partial, 'curated direct + partial');
ok(c.prereq.length === 1 && c.prereq[0].key === 'counting:count_objects', 'curated pre, duplicate of direct dropped');
ok(c.build[0] === 'fixture_pv_model' && proposalName('fixture_pv_model') === 'Fixture place value model', 'curated proposal name');
ok(proposalName('pattern_make') === 'Make a Pattern', 'WRM_PROPOSALS name');
ok(linksFor('2:D1:2').source === 'rules', 'absent step falls back to rules');
// curated opts survive on pre and related (critic r1 B2)
addCuratedYear({ steps: { 'Y3.B1.S2': { title: 'x', direct: [], verdict: 'gap', pre: [{ key: 'placevalue:combine', opts: { band: 99 }, why: 'Y3.B1.S1 Represent numbers to 100 (step before in the block)' }],
    related: [{ key: 'number_sense:place_on_number_line', opts: { span: 10, band: 100 }, why: 'Y2.B1.S8 Write numbers (prior learning wk W01)' }] } } });
const co = linksFor('2:D1:2');
ok(co.prereq[0].opts && co.prereq[0].opts.band === 99 && co.related[0].opts.span === 10, 'curated pre / related keep opts');
ok(!/Y\d\.B\d|prior learning|wk W/.test(co.prereq[0].why + co.related[0].why), `why lines in plain words: "${co.prereq[0].why}" / "${co.related[0].why}"`);
ok(co.prereq[0].why === 'The step before: "Represent numbers to 100".', `composed: the step before -> "${co.prereq[0].why}"`);
clearCurated();
ok(linksFor('2:D1:1').source === 'rules', 'clearCurated');
// the curated files on disk and data/curriculum/links/index.json agree
const dir = new URL('../../data/curriculum/links/', import.meta.url);
const files = existsSync(dir) ? readdirSync(dir) : [];
const onDisk = files.filter((f) => /^(R|Y[1-6])\.json$/.test(f)).map((f) => f.replace('.json', '')).sort();
// round 7: "detailed" says whether data/curriculum/detailed-lessons.json exists (the page fetches it only then)
const detailedOnDisk = existsSync(new URL('../detailed-lessons.json', dir));
const want = { years: ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6'].filter((y) => onDisk.includes(y)), map: files.includes('MAP.json'), detailed: detailedOnDisk };
if (process.argv.includes('--write-index')) {
    writeFileSync(new URL('index.json', dir), `${JSON.stringify(want, null, 2)}\n`);
    console.log(`wrote data/curriculum/links/index.json ${JSON.stringify(want)}`);
}
const idx = JSON.parse(readFileSync(new URL('index.json', dir)));
ok(JSON.stringify(onDisk) === JSON.stringify([...idx.years].sort()), `index.json years ${JSON.stringify(idx.years)} = files on disk ${JSON.stringify(onDisk)}`);
ok(!!idx.map === files.includes('MAP.json'), `index.json map ${idx.map} = MAP.json on disk ${files.includes('MAP.json')} (fix: node tests/scripts/ws-wrm-page-unit.mjs --write-index)`);
ok(!!idx.detailed === detailedOnDisk, `index.json detailed ${idx.detailed} = data/curriculum/detailed-lessons.json on disk ${detailedOnDisk} (fix: node tests/scripts/ws-wrm-page-unit.mjs --write-index)`);

// representation pairs and strands
ok(REP_PAIRS.length === 8, 'eight representation pairs');
const strandNames = MAP_STRANDS.map((x) => x[1]);
ok(strandNames.length === 7, 'seven MAP strands');
for (const p of REP_PAIRS) {
    for (const [st, rec] of Object.entries(p.strands)) {
        ok(strandNames.includes(st), `${p.id}: strand ${st}`);
        ok(rec.skills.length + rec.build.length > 0, `${p.id}/${st}: skills or a build`);
        for (const k of rec.skills) ok(/^[a-z_]+:[a-z0-9_]+$/.test(k), `${p.id}: key ${k}`);
    }
}
ok(strandOfKey('multiplication:arrays_groups') === 'Multiplication & division' && strandOfKey('graphs:bar_graph') === 'Data & graphing', 'strandOfKey');
ok(repPairsOfText('Read the clock and write the time in words').includes('clock-words'), 'repPairsOfText clock');

// the build queue (Skills to be made)
ok(gradesOfText('2-4').join() === '2,3,4' && gradesOfText('PK-K').join() === 'PK,K', 'gradesOfText');
ok(gradeOfCode('M.EE.3.NF.1') === '3' && gradeOfCode('8.G.A.5') === '6' && gradeOfCode('K.CC.A.1') === 'K', 'gradeOfCode');
ok(gradeOfRit('141-150') === 'K' && gradeOfRit('211-220') === '5', 'gradeOfRit');
const Q0 = buildQueue();
ok(Q0.items.length > 200 && Q0.totals.all === Q0.items.length, `queue without links files: ${Q0.items.length}`);
ok(Q0.totals.bySource.CCSS > 0 && Q0.totals.bySource.EE > 0 && Q0.totals.bySource.WRM > 0 && Q0.totals.bySource.MAP === 0, 'queue sources without MAP.json');
ok(new Set(Q0.items.map((e) => e.id)).size === Q0.items.length, 'queue de-duplicated');
for (const e of Q0.items) {
    ok(e.name && e.teaches && e.closes.length && e.representation, `${e.id}: short spec complete`);
    ok(['new', 'option', 'other'].includes(e.kind) && e.sources.length, `${e.id}: kind + source`);
}
const fx = JSON.parse(readFileSync(new URL('../fixtures/wrm-links-sample.json', import.meta.url)));
const mapFx = { rows: [{ task: 'Fixture task', strand: 'Geometry', ritBand: '181-190', status: 'missing', skills: [], proposal: 'fixture_map_one' }],
    proposals: { fixture_map_one: { kind: 'option', skill: 'shapes_early:shape_attributes', name: 'Fixture MAP option', teaches: 'pick the shape with 4 sides',
        representation: 'shapes in boxes, ring one', ccss: ['2.G.A.1'], map: [{ strand: 'Geometry', ritBand: '181-190', taskType: 'click to select' }], why: 'MAP asks it' },
    fixture_pv_model: { kind: 'new', name: 'ignored second name', teaches: 'x', representation: 'y', why: 'also MAP' } } };
const Q1 = buildQueue({ curated: [fx], map: mapFx });
const one = Q1.items.find((e) => e.id === 'fixture_map_one');
ok(one && one.sources.join() === 'MAP' && one.grades.join() === '2' && one.domain === 'G' && one.map[0].ritBand === '181-190', 'MAP proposal');
const both = Q1.items.find((e) => e.id === 'fixture_pv_model');
ok(both && both.sources.join() === 'WRM,MAP' && both.name === 'Fixture place value model', 'curated + MAP merged on one id, first name kept');
ok(Q1.items.filter((e) => passes(e, { sources: new Set(['MAP']) })).length === 2, 'filter by source');
ok(Q1.items.filter((e) => passes(e, { q: 'fixture map option' })).length === 1, 'filter by search');
ok(Q1.items.filter((e) => passes(e, { grades: new Set(['2']), domains: new Set(['G']), kinds: new Set(['option']) })).some((e) => e.id === 'fixture_map_one'), 'filter grade+domain+kind');
ok(closesText({ 'Y3.B1.S1': 'part-whole' }).join() === 'Y3.B1.S1: part-whole' && closesText(['a', 'b']).length === 2, 'closesText object / array (the CSV keeps the note as written)');
const csv = toCSV(Q1.items.slice(0, 5)).split('\r\n');
ok(csv.length === 6 && csv[0] === CSV_HEAD.join(','), 'CSV header + rows');

// PLAIN-ENGLISH gate (fix round 6: a whitelist, not a blacklist). EVERY teacher-facing line — the White Rose
// why / missing / partial lines, the "To be built" names, the MAP task notes and every Skills to be made field
// (screen and print text) — must pass js/modules/plain-words.js, the SAME check the screens use to decide
// whether a note is shown. Both data modes (no link files; every file on disk and any --curated dir). Zero hits.
const DATA = await import('../../js/modules/data.js');
const TT = await import('../../js/modules/todo-text.js');
const { setSkillLabeler } = await import('../../js/modules/wrm-links.js');
const { teacherLabel } = await import('../../js/modules/teacher-label.js');
const cleanLabel = (l) => String(l || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, '').replace(/^[\s½]+(?=\S)/, '').replace(/\s+/g, ' ').trim();
setSkillLabeler((id) => {
    const [a, b] = String(id).includes(':') ? String(id).split(':') : [DATA.getCategoryForSkill(id), id];
    const sk = (DATA.SKILLS[a] || []).find((x) => x.v === b);
    return sk ? teacherLabel(cleanLabel(sk.l)) : null;
});
// every skill label, as the teacher screens show it, is plain (a new label with a shorthand fails here)
for (const [c, list] of Object.entries(DATA.SKILLS)) for (const sk of list || []) {
    if (!sk || !sk.v) continue;
    const h = jargonHit(teacherLabel(cleanLabel(sk.l)), { fragment: false });
    ok(!h, `skill label not plain on the teacher screens: ${c}:${sk.v} "${sk.l}" (${h && h.name} ${h && h.at}) — write it out in js/modules/teacher-label.js or rename`);
}
// the r2–r5 critics' real lines: each must come out plain (shown whole, or replaced by a composed sentence)
const LESSON = { step: 'Y4.B1.S3', ccss: ['3.NBT.A.2'] };
const REAL = ['Y3.B1.S14 counts in 50s, which no live skill deals', '(Y4.B10.S2 Tenths as fractions, week W30)', 'ftRules only has x or / first',
    'every band stops at 999,999', 'its partWhole variant writes a part-to-whole ratio', 'the forms option is lost on the print path',
    'next steps S4-S5: the same area by b x h / 2', 'Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W18; tagged there as a partial cover by a hand tagFix)',
    '(the smallest band is 5)', 'its lowest band (100) deals 51-100', 'generated with itemIndex (the print path)', 'R.B2.S1 / R.B10 compare by size: the compare words',
    'part-whole model (see Y5.B13) [rule 18: opts {"notation":["across"]} for this pupil]', 'Y1.B6.S1 and Y1.B12.S1: counting to 50, and from 50 to 100',
    'groups of 1-3 only (band 5 deals 4 and 5)', 'R.B11.S5 / S6 1 more / 1 less', 'Sum-and-difference brace; two levels) and the journey line', 'the the cat'];
for (const t of REAL) {
    for (const o of [composeWhy(t, { key: 'placevalue:compare', lesson: LESSON, group: 'prereq' }), composePartial(t, ['nl_20']), composeMissing(t, ['nl_20']) ? `Not yet: ${composeMissing(t, ['nl_20'])}` : '']) {
        if (!o) continue;
        const h = jargonHit(o); ok(!h, `real line not plain: "${t}" -> "${o}" (${h && h.name})`);
    }
}
{ const w = composeWhy('Y3.B1.S14 counts in 50s, which no live skill deals', { key: 'x:y', lesson: LESSON });
  ok(/Grade 2/.test(w) && !/\( /.test(w), `M5 orphan bracket -> "${w}" names the grade and step`); }
{ const w = composeWhy('Y2.B1.S15 Count in 2s, 5s and 10s (prior learning wk W18)', { lesson: LESSON });
  ok(w === 'Taught before, in Grade 1: "Count in 2s, 5s and 10s".', `composed prior learning, no grade to check the support week against -> "${w}"`); }
// critic r6 M8: the support block is THIS grade's, said as its own clause, and only in a week the data holds the step
{ const g5 = L.find((l) => l.step === 'Y6.B10.S3' && l.grade === '5');
  const w = composeWhy('Y1.B10.S2 Find a half (school prior learning, week W23)', { lesson: g5, group: 'prereq' });
  ok(w === 'Taught before, in Kindergarten: "Find a half of an object or a shape". Revisited in this grade\'s support block, week 23.', `M8 support week names this grade's block -> "${w}"`); }
// critic r6 M8: a Do-first line never says "later" — Grade 1 "Recognise equal groups" (the school teaches the 5 and 10 times-tables first)
{ const g1 = L.find((l) => l.grade === '1' && l.title === 'Recognise equal groups');
  const w = g1 && composeWhy('Y2.B5.S17 The 5 and 10 times-tables (taught before this step in the block)', { lesson: g1, group: 'prereq' });
  ok(g1 && !LATER_LEAD.test(w) && /^Taught earlier this year: "The 5 and 10 times-tables" \(week \d+\)\.$/.test(w), `M8 Do-first by the school week -> "${w}"`);
  const later = g1 && composeWhy('Y2.B5.S17 The 5 and 10 times-tables', { lesson: { ...g1, weeks: ['W01'] }, group: 'prereq' });
  ok(later && /^Also taught in Grade 1: /.test(later), `M8 a Do-first step the school teaches later reads "Also taught in" -> "${later}"`); }
ok(composeMissing('the part X will add', ['nl_20']) === '' && composePartial('Y5.B1.S2 the rest', ['nl_20']) === '', 'M9: a hidden note composes no sentence around the entry name');
ok(partialVerdict({ missing: '', build: ['nl_20'] }) === 'These skills cover part of the lesson. The rest is still to be built (below).', 'M9: the plain verdict');
ok(composeWhy('the same number written in unit form (4 hundreds 7 tens 6 ones)', { lesson: LESSON }) === 'The same number written in unit form (4 hundreds 7 tens 6 ones).', 'a plain note is shown whole (N32: with its full stop)');
ok(stepsInNote('R.B11.S5 / S6').join() === 'R.B11.S5,R.B11.S6', 'stepsInNote: shorthand chain');
ok(jargonHit('Grade 2/Grade 3 reading a scale') === null && jargonHit('the the cat') && jargonHit('Grade 2: Hundreds ( tens') && jargonHit('ftRules only') && jargonHit('Use band 5'), 'the plain check: plain line passes, the r5 forms fail');


// TRUTH gate (critic r6 M8 / M9): plain words are not enough — a composed line must state the right order and say
// each fact once. Over every lesson, in every data mode:
//   M8a no Do-first line uses a later-relation lead ("Later …", "Taught later …", "The next step");
//   M8b every "support block, week N" clause is "this grade's support block" and the lesson's OWN grade lists, in
//       week N, a step the line's note names (or, with no note, any step);
//   M9  no line holds 'the part "', no line repeats inside one lesson's view, and "(new option on an existing skill)"
//       never sits inside a sentence.
let truthLines = 0, truthBad = 0;
const tbad = (msg) => { truthBad += 1; if (truthBad <= 15) console.log('UNTRUE', msg); };
function truth(l, r) {
    const cur = (l.step && curatedFor(l.step)) || (l.site && curatedLessonFor(l.site)) || null;
    const rawWhy = (g, key) => { const x = cur && (cur[g === 'prereq' ? 'pre' : 'related'] || []).find((y) => y.key === key); return x ? x.why || '' : ''; };
    const lines = [r.verdict === 'partial' ? partialVerdict(r) : '', ...r.direct.map((x) => x.partial), ...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why), ...lessonAbout(l)].filter(Boolean);
    truthLines += lines.length;
    for (const x of r.prereq) if (x.why && LATER_LEAD.test(x.why)) tbad(`M8a ${l.key} Do-first "${x.why}"`);
    for (const g of ['prereq', 'related']) for (const x of r[g]) {
        if (!/support block, week/.test(x.why || '')) continue;
        const m = /(?:^|\. )Revisited in this grade's support block, weeks? ([\d, and]+)\.$/.exec(x.why);
        if (!m) { tbad(`M8b ${l.key} support week not this grade's: "${x.why}"`); continue; }
        const steps = stepsInNote(rawWhy(g, x.key));
        for (const n of m[1].split(/,| and /).map((t) => +t.trim()).filter(Boolean)) {
            const okWeek = steps.length ? steps.some((sid) => supportWeeksOf(l.grade, sid).includes(n)) : true;
            if (!okWeek) tbad(`M8b ${l.key} week ${n} of ${l.gradeLabel}'s support block does not hold ${steps.join(', ')}: "${x.why}"`);
        }
    }
    const seen = new Set();
    for (const t of lines) {
        if (/the part "/.test(t)) tbad(`M9 ${l.key} "${t}"`);
        if (/\(new option on an existing skill\)./.test(t)) tbad(`M9 ${l.key} option suffix inside a sentence "${t}"`);
        // m15 (critic r7): two lines that differ only by the support clause are the same line
        const k = baseKey(t);
        if (seen.has(k)) tbad(`M9/m15 ${l.key} said twice: "${t}"`);
        seen.add(k);
        // N36: no "and 1 more" (it reads like the step "1 more"); m17: every support grade named
        if (/\bweeks? [\d, ]+ and \d+ more\b|\bmore grades?\b/.test(t)) tbad(`N36/m17 ${l.key} hides a week or a grade: "${t}"`);
    }
    // m16 (critic r7): a grade word agrees with the lesson's OWN grade
    const GI = (g) => ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'].indexOf(g);
    const own = GI(l.gradeLabel);
    for (const t of [...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why)].filter(Boolean)) {
        for (const s of t.split(/(?<=\.)\s+(?=[A-Z])/)) {
            const gs = (s.match(/Pre-K|Kindergarten|Grade \d/g) || []).map(GI);
            if (/^Taught before, in /.test(s) && gs.some((g) => g >= own)) tbad(`m16 ${l.key} (${l.gradeLabel}) "Taught before" names a grade not below it: "${s}"`);
            if (/^Taught later,? in /.test(s) && gs.some((g) => g <= own)) tbad(`m16 ${l.key} (${l.gradeLabel}) "Taught later" names a grade not above it: "${s}"`);
            if (/^Taught earlier in /.test(s) && gs.some((g) => g !== own)) tbad(`m16 ${l.key} (${l.gradeLabel}) "Taught earlier in" names another grade: "${s}"`);
            if (/^Also taught in /.test(s) && gs[0] === own && !/\(weeks? \d/.test(s)) tbad(`m16 ${l.key} "Also taught in" its own grade with no week: "${s}"`);
        }
    }
    // m17: the support block lists its grades in order
    for (const t of lessonAbout(l)) {
        if (!/^Also in the support block: /.test(t)) continue;
        const gs = (t.match(/Pre-K|Kindergarten|Grade \d/g) || []).map(GI);
        if (gs.some((g, i) => i && g < gs[i - 1])) tbad(`m17 ${l.key} support grades out of order: "${t}"`);
    }
}

const dirs = [new URL('../../data/curriculum/links/', import.meta.url).pathname];
process.argv.forEach((a, i) => { if (a === '--curated' && process.argv[i + 1]) dirs.push(...process.argv[i + 1].split(',')); });
let jLines = 0, jBad = 0;
const jByForm = {};
const jByKind = {};
const gate = (where, out, opts) => {
    const kind = /^todo/.test(where) ? 'Skills to be made fields' : /^MAP row/.test(where) ? 'MAP task notes' : 'White Rose lesson lines';
    for (const o of [].concat(out)) {
        if (o == null || o === '') continue;
        jLines += 1;
        jByKind[kind] = (jByKind[kind] || 0) + 1;
        const h = jargonHit(o, opts);
        if (h) { jBad += 1; jByForm[h.name] = (jByForm[h.name] || 0) + 1; if (jBad <= (process.env.SHOWALL ? 9999 : 15)) console.log('NOT PLAIN', h.name, '|', where, '|', h.snippet); }
    }
};
// M11 (critic r7): no "How it looks", Kind, name or teaches line is a template-id list or the build list's syntax
const KIT_ID = /\b(?:hop-line|mult-grid|count-row|area-model|word-work|function-table|data-table|coord-grid|frac-model|nl-place|value-line|money-columns|mult-chart|arrays-turn|fact-family|cloze-bank|tally-chart|bar-graph|perimeter-shape|picture-row|measure-scale|graph-axes|shape-grid|pv-support|angle-kit|solid-kit|chartwindow|seqstrip|tenframe|wordpic|rcdws)\b/i;
let m11 = 0;
// M12 (critic r8): "How it looks" never guesses. Its response agrees with the entry's own answer field and the Kind
// line's "How the pupil answers"; no answer field, no response; a drawing noun only from its structured source.
const ROOT = { writing: /\bwrit(?:e|es|ten|ing)\b/i, typing: /\btype\b/i, 'filling in': /\b(?:fill|complete)\b/i, numbering: /\bnumber\b/i,
    circling: /\b(?:circle|ring)\b/i, ticking: /\btick\b/i, drawing: /\bdraw(?:n)?\b/i, 'plotting points': /\bplot\b/i, marking: /\bmark\b/i,
    'making tally marks': /\btally\b/i, shading: /\bshade\b/i, colouring: /\bcolou?r\b/i, matching: /\bmatch\b/i, dragging: /\bdrag\b/i,
    building: /\bbuild\b/i, tapping: /\btap\b/i, choosing: /\b(?:choose|pick)\b/i, saying: /\bsay\b/i, copying: /\bcopy\b/i, counting: /\bcount\b/i, ordering: /\border\b/i };
const NOTE_VERB = { write: /\bwrit(?:e|es|ten)\b|\btype\b/i, circle: /\b(?:circle|ring|tap|choose|pick)\b/i, tick: /\b(?:tick|tap|choose|pick)\b/i, draw: /\bdraw\b/i,
    shade: /\b(?:shade|colou?r)\b/i, match: /\bmatch\b/i, drag: /\bdrag\b/i, tap: /\b(?:tap|circle|ring|tick|choose|pick)\b/i, choose: /\b(?:choose|pick|tap|circle|ring|tick)\b/i, pick: /\b(?:choose|pick|tap|circle|ring|tick)\b/i, ring: /\b(?:circle|ring|tap|choose|pick)\b/i };
const NOUN_SRC = { shapes: /\b(?:triangles?|rectangles?|polygons?|quadrilaterals?|pentagons?|hexagons?|shapes?|solids)\b/i, coins: /\bcoins?\b/i, notes: /\bnotes\b/i,
    'fraction pictures': /\bfraction\b/i, 'shaded fraction pictures': /\bfraction/i };
let m12 = 0;
const m12bad = (msg) => { m12 += 1; if (m12 <= 12) console.log('M12', msg); };
const looksGate = (tag, e, looks) => {
    if (!looks) return;
    const ans = `${(e.spec && typeof e.spec === 'object' && e.spec.answer) || ''}; ${TT.optionResponse(e)}`;
    const declared = /[a-z]/i.test(ans.replace(/;/g, ''));
    const rep = String(e.representation || '');
    const by = /the pupil answers by (.+?)\.$/.exec(looks);
    if (by) {
        if (!declared) m12bad(`${tag} ${e.id}: a response with no answer field: "${looks}"`);
        for (const g of by[1].split(/, | and | or /)) if (!ROOT[g] || !ROOT[g].test(TT.optionResponse(e) || ans)) m12bad(`${tag} ${e.id}: "${g}" is not the declared answer "${ans}"`);
    } else if (/\bthe pupil\b/i.test(looks) && looks !== P0.plainNote(rep)) m12bad(`${tag} ${e.id}: a response not from the answer field: "${looks}"`);
    if (looks === P0.plainNote(rep)) {
        // a build note shown whole: every response it names is one the entry declares
        for (const [v, re] of Object.entries(NOTE_VERB)) if (new RegExp(`\\b${v}\\b`, 'i').test(looks) && !(declared && re.test(ans))) m12bad(`${tag} ${e.id}: the note says "${v}", the answer is "${ans}"`);
        return;
    }
    const shows = /^Shows (.+?) in black and white/.exec(looks);
    if (!shows) return;
    if (/^the White Rose pictures? /.test(shows[1])) {
        for (const [, n] of shows[1].matchAll(/"([^"]+)"/g)) if (!Object.values(VISUALS).some(([, name, ids]) => (ids || []).includes(e.id) && String(name).startsWith(n))) m12bad(`${tag} ${e.id}: White Rose picture "${n}" not in VISUALS for it`);
        return;
    }
    const ids = String(rep).toLowerCase().split(/[\s,.+:]+/);
    for (const w of shows[1].split(/, | and (?=a |an |[a-z]+ ?[a-z]*$)/)) {
        const fromKit = Object.entries(TT.KIT_WORDS).some(([k, v]) => v === w && ids.includes(k));
        const noun = TT.DRAW_NOUNS.find(([, v]) => v === w);
        if (!fromKit && !(noun && noun[0].test(rep))) m12bad(`${tag} ${e.id}: "${w}" has no source in "${rep.slice(0, 80)}"`);
        if (NOUN_SRC[w] && !fromKit && !NOUN_SRC[w].test(rep)) m12bad(`${tag} ${e.id}: "${w}" without its word in the note`);
    }
};
const todoGate = (tag, Q) => {
    TT.setTodoNames(Q.items);
    for (const e of Q.items) {
        const T = TT.todoTexts(e);
        for (const [f, v] of Object.entries(T)) for (const x of [].concat(v)) {
            if (!x || f === 'closes') continue;
            const bad = (f === 'looks' && TT.TEMPLATE_LIST.test(x)) || /\+ new:|\(tiles \d+\)|\bresponse "|^The existing\b|^The skill['’]s own\b|\bA new picture in\b|^[a-z]+ ["']/.test(x) || KIT_ID.test(x);
            if (bad) { m11 += 1; if (m11 <= 10) console.log('M11', tag, e.id, f, '|', x); }
        }
        looksGate(tag, e, T.looks);
        // m17: "no skill teaches all of it yet" once per entry at most
        ok(T.closes.filter((x) => /no skill teaches all of it yet/.test(x)).length <= 1, `m17 ${tag} ${e.id}: "no skill teaches all of it yet" more than once`);
        for (const [f, v] of Object.entries(T)) gate(`${tag} ${e.id} ${f}`, f === 'kind' ? [(KINDS.find((x) => x[0] === e.kind) || [])[1], ...v].join(' · ') : v);
        gate(`${tag} ${e.id} steps`, e.wrmSteps.map(stepName));
        gate(`${tag} ${e.id} map`, e.map.map(TT.mapLine), { fragment: false });
    }
};
// the share of the tagging lanes' free-text notes the screens now hide (shown whole only when plain)
const P = await import('../../js/modules/plain-words.js');
const hidden = {};
const count = (file, t) => { if (!t || typeof t !== 'string') return; const h = (hidden[file] = hidden[file] || [0, 0]); h[0] += 1; if (!P.plainNote(t)) h[1] += 1; };
todoGate('todo (no files)', buildQueue());
for (const dir of dirs) {
    const years = [];
    let map = null;
    for (const y of ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']) {
        const f = `${dir.replace(/\/$/, '')}/${y}.json`;
        if (!existsSync(f)) continue;
        const d = JSON.parse(readFileSync(f, 'utf8'));
        years.push(d);
        for (const st of [...Object.values(d.steps || {}), ...Object.values(d.lessons || {})]) {
            for (const g of ['pre', 'related']) for (const x of st[g] || []) count(`${y}.json`, x.why);
            for (const x of st.partial || []) count(`${y}.json`, x.missing);
            count(`${y}.json`, st.missing);
        }
    }
    const mf = `${dir.replace(/\/$/, '')}/MAP.json`;
    if (existsSync(mf)) { map = JSON.parse(readFileSync(mf, 'utf8')); for (const r of map.rows || []) count('MAP.json', r.closes); }
    if (years.length || map) {
        clearCurated();
        for (const d of years) addCuratedYear(d);
        const Qc = buildQueue({ curated: years, map });
        todoGate(`todo (${dir})`, Qc);
        if (map) {
            TT.setTodoNames(Qc.items);
            for (const r of map.rows || []) {
                const note = TT.mapNote(r.closes, { proposal: r.proposal || '' });
                gate(`MAP row ${r.task}`, note);
                gate(`MAP row ${r.task} name`, taskName(r.task), { fragment: false });   // a name, not a sentence
                if (r.proposal) ok(!/^(?:today|it|this)\b/i.test(note), `M7: MAP note starts with today/it/this: ${r.task} -> "${note}"`);
                if (/equal sign/i.test(r.task || '') && r.proposal) ok(/equal sign/i.test(note) && note.length > 40, `M7: the equal-sign task names its repair: "${note}"`);
            }
        }
        // the lessons themselves, through linksFor (what the screen shows)
        for (const l of L) {
            if (!(l.step && years.some((d) => d.steps && d.steps[l.step])) && !(l.site && years.some((d) => d.lessons && d.lessons[l.site]))) continue;
            const r = linksFor(l);
            if (l.site && !l.step) ok(r.source === 'curated', `site lesson ${l.site}: its links entry is read (source ${r.source})`);
            gate(`lesson ${l.key}`, [r.verdict === 'partial' ? partialVerdict(r) : '', ...r.direct.map((x) => x.partial), ...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why), ...r.build.map(proposalLabel), ...r.preBuild.map(proposalLabel), l.title, ...lessonAbout(l)]);
            truth(l, r);
        }
        clearCurated();
    }
}
// rules mode: every lesson's lines with no link files
for (const l of L) { const r = linksFor(l); gate(`lesson (rules) ${l.key}`, [r.verdict === 'partial' ? partialVerdict(r) : '', ...r.direct.map((x) => x.partial), ...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why), l.title, siteFlagText(l), ...lessonAbout(l)]); truth(l, r); }

// THE SCHOOL SITE'S OWN LESSONS (round 7, owner: every lesson on the school site visible with its skills)
{
    const site = JSON.parse(readFileSync(new URL('../../data/curriculum/site-lessons.json', import.meta.url), 'utf8'));
    const { execFileSync } = await import('node:child_process');
    let fresh = true;
    try { execFileSync(process.execPath, [new URL('./ws-site-lessons.mjs', import.meta.url).pathname, '--check'], { stdio: 'pipe' }); } catch (e) { fresh = false; }
    ok(fresh, 'js/modules/site-lessons-db.js is stale (fix: node tests/scripts/ws-site-lessons.mjs)');
    const GR = (g) => String(g).replace(/^G(?=\d)/, '');
    const ids = [...site.lessons.map((x) => ({ ...x, kind: 'lesson' })), ...site.assessments.map((x) => ({ ...x, kind: 'assessment' }))];
    let reach = 0, twins = 0, tagged = 0, untagged = 0, assessments = 0;
    for (const s of ids) {
        const l = lessonBySite(s.id);
        ok(l, `site lesson ${s.id} "${s.title}" is listed`);
        if (!l) continue;
        // reachable: in its unit's list, its grade is the site's, its bookmark opens it, and the id is the bookmark
        ok(l.grade === GR(s.grade), `${s.id}: listed under grade ${l.grade}, the site says ${s.grade}`);
        const inUnit = unitLessons(l.grade, l.unit).includes(l);
        ok(inUnit, `${s.id}: not in the list of ${l.grade} ${l.unit}`);
        const h = lessonHash(l);
        const m = /^#wrm\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(h);
        ok(m && m[3] === siteSlug(s.id) && !/^\d+$/.test(m[3]) && lessonBySiteSlug(decodeURIComponent(m[1]), m[3]) === l, `${s.id}: bookmark ${h} does not reopen it`);
        if (inUnit && m) reach += 1;
        if (l.seq) twins += 1;
        if (s.kind === 'assessment') { assessments += 1; ok(l.type === 'assessment' && siteFlagText(l) === 'Assessment' && !linksFor(l).direct.length, `${s.id}: an assessment, flagged and with no skills`); continue; }
        ok(siteFlagText(l), `${s.id}: no flag on the row`);
        gate(`site lesson ${s.id}`, [l.title, siteFlagText(l), ...lessonAbout(l)]);
    }
    // tagged / untagged with every links file on disk
    clearCurated();
    for (const y of ['R', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6']) { const f = new URL(`${y}.json`, dir); if (existsSync(f)) addCuratedYear(JSON.parse(readFileSync(f, 'utf8'))); }
    for (const s of site.lessons) { const l = lessonBySite(s.id); if (!l || l.step) continue; if (linksFor(l).source === 'curated') tagged += 1; else untagged += 1; }
    // every site lesson's screen lines, in both data modes
    for (const s of site.lessons) {
        const l = lessonBySite(s.id);
        if (!l) continue;
        const r = linksFor(l);
        gate(`site lesson ${s.id} links`, [r.verdict === 'partial' ? partialVerdict(r) : '', ...r.direct.map((x) => x.partial), ...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why), ...r.build.map(proposalLabel), ...r.preBuild.map(proposalLabel)]);
        truth(l, r);
        ok(siteLessonLabel(s.id).includes(l.title), `${s.id}: label for other screens`);
    }
    clearCurated();
    for (const s of site.lessons) { const l = lessonBySite(s.id); if (l) { const r = linksFor(l); gate(`site lesson (rules) ${s.id}`, [...r.prereq.map((x) => x.why), ...r.related.map((x) => x.why)]); } }
    ok(reach === ids.length, `every site lesson and assessment reachable by its unit and bookmark (${reach}/${ids.length})`);
    // ids stable: the sequence rows keep their numbers; a site lesson's key is its site id unless it is a sequence row
    ok(lessonByKey('2:D1:1') && lessonByKey('2:D1:1').title === 'Represent numbers to 100', 'the sequence keys are unchanged');
    ok(L.filter((l) => !l.seq).every((l) => l.key === l.site && !l.n), 'a site-only lesson is keyed by its site id and has no number');
    ok(new Set(L.map((l) => l.key)).size === L.length, 'lesson keys unique');
    // school-week order inside every unit: a dated site lesson never sits after a later week's dated lesson of the site
    for (const g of WRM_SEQUENCE) for (const u of g.units) {
        const list = unitLessons(g.id, u.id).filter((l) => !l.seq && l.weeks.length);
        const wk = list.map((l) => +l.weeks[0].slice(1));
        ok(wk.every((w, i) => !i || w >= wk[i - 1]), `${g.id} ${u.id}: site lessons out of week order ${wk}`);
        const all = unitLessons(g.id, u.id);
        const firstUndated = all.findIndex((l) => !l.seq && !l.weeks.length);
        ok(firstUndated < 0 || all.slice(firstUndated).every((l) => !l.seq && !l.weeks.length), `${g.id} ${u.id}: the lessons with no week come last`);
    }
    ok(searchLessons('Line plots with fractions', 5).some((l) => l.site === 'G4|-|lineplotswithfractions'), 'search finds a site lesson by title');
    ok(searchLessons('assessment', 40).filter((l) => l.type === 'assessment').length >= 10, 'search "assessment" finds the assessments');
    ok(searchLessons('ccss build', 80, '4').some((l) => l.site && !l.step), 'search "ccss build" finds the CCSS BUILD lessons');
    // critic r6 M10: a site lesson sits in the unit of its OWN CCSS code (its grade's code first, else its first code);
    // the site's domain field only when it has no code. The listed exception keeps a counting lesson tagged with a
    // base-ten code of another grade in counting (placeDomain).
    const M10_EXCEPT = new Set(['K|-|representnumbersto5']);
    const codeDom = (c) => (/^(?:K|\d)\.([A-Z]+)\./.exec(c) || [])[1] || '';
    let placed = 0;
    for (const s of site.lessons) {
        const l = lessonBySite(s.id);
        if (!l || l.seq || !(l.ccss || []).length) continue;
        placed += 1;
        const pre = l.grade;
        const want = codeDom(l.ccss.find((c) => c.split('.')[0] === pre) || l.ccss.find(codeDom) || '');
        const hasUnit = WRM_SEQUENCE.find((g) => g.id === l.grade).units.some((u) => u.domain === want);
        ok(!want || !hasUnit || l.domain === want || M10_EXCEPT.has(s.id), `M10: ${s.id} "${l.title}" (${l.ccss.join(', ')}) sits in ${l.grade} ${l.unit} ${l.domain}, its code says ${want}`);
        ok(l.domain === WRM_SEQUENCE.find((g) => g.id === l.grade).units.find((u) => u.id === l.unit).domain && (!hasUnit || placeDomain(l.grade, l.ccss, s.domain) === l.domain), `M10: ${s.id} placed by placeDomain`);
    }
    const pos = site.lessons.filter((x) => /^Positional language/.test(x.title) && x.grade === 'K').map((x) => lessonBySite(x.id).unit);
    ok(pos.length === 2 && pos[0] === pos[1] && pos[0] === 'D5', `M10: both Kindergarten "Positional language" lessons in D5 Geometry (${pos})`);
    const lh = lessonBySite('G1|-|lengthandheightcompareorder');
    ok(lh && lh.domain === 'MD', `M10: Grade 1 "Length and height" in measurement (${lh && lh.unit})`);
    console.log(`site lessons placed by their own CCSS code: ${placed}`);
    console.log(`site lessons: ${site.lessons.length} lessons + ${assessments} assessments listed (${twins} are sequence rows the site also names); tagged ${tagged}, not tagged ${untagged} (site-only lessons with no step)`);
}

// DETAILED LESSONS (round 9): data/curriculum/detailed-lessons.json — every record joins a real school-site lesson
// (siteLessonId), names real White Rose steps, points at a lesson file on disk, uses live skills, has a lesson in the
// maker for "Make it", and every line the White Rose screen composes for it is plain.
{
    const D = await import('../../js/modules/detailed-links.js');
    const { liveSkillLabel } = await import('../../js/modules/wrm-links.js');
    const { detailedLessonFor } = await import('../../js/modules/lessons/detailed/index.js');
    const raw = JSON.parse(readFileSync(new URL('../../data/curriculum/detailed-lessons.json', import.meta.url), 'utf8'));
    const idx = D.indexDetailed(raw);
    ok(idx.all.length === raw.lessons.length && idx.all.length > 0, `detailed lessons read: ${idx.all.length} of ${raw.lessons.length}`);
    let joined = 0;
    for (const r of idx.all) {
        const l = lessonBySite(r.site);
        ok(!!l, `detailed ${r.id}: siteLessonId ${r.site} is a real school-site lesson`);
        if (l) { ok(D.detailedOf(idx, l).includes(r), `detailed ${r.id}: shown on ${l.key}`); joined += 1; }
        for (const st of r.steps) ok(stepIds.has(st) && L.some((x) => x.step === st), `detailed ${r.id}: White Rose step ${st} is listed`);
        ok(!!r.pack && existsSync(new URL(`../../${r.pack}`, import.meta.url)), `detailed ${r.id}: lesson file on disk (${r.pack})`);
        for (const x of r.used) { const [c, k] = x.key.split(':'); ok((DATA.SKILLS[c] || []).some((y) => y.v === k), `detailed ${r.id}: skill ${x.key} is live`); }
        ok(!!detailedLessonFor(r.id), `detailed ${r.id}: the lesson maker has it ("Make it")`);
        const T = D.detailedTexts(r, (k) => liveSkillLabel(k));
        ok(T.some((t) => /^Its skills: /.test(t)), `detailed ${r.id}: its skills are named`);
        gate(`detailed lesson ${r.id}`, T);
    }
    ok(D.safeHref('javascript:alert(1)') === '' && D.safeHref('../x.pdf') === '' && D.safeHref('https://example.org/a.pdf') && D.safeHref('design/a/pack.pdf'), 'detailed: only site paths or https links are followed');
    console.log(`detailed lessons: ${idx.all.length} read, ${joined} joined to a school-site lesson`);
}
ok(!m11, `M11: ${m11} Skills to be made lines are template-id lists or build syntax`);
console.log(`M11 gate: template-id / build-syntax lines on Skills to be made: ${m11}`);
ok(!m12, `M12: ${m12} "How it looks" lines name a response or a drawing the entry does not declare`);
console.log(`M12 gate: "How it looks" lines against the answer field, the Kind line and the drawing sources: ${m12}`);
ok(!truthBad, `truth gate (M8 order / support week, M9 said once): ${truthBad} of ${truthLines} lesson lines`);
console.log(`truth gate: ${truthLines} lesson lines, ${truthBad} untrue or repeated`);
ok(!jBad, `plain-English gate: ${jBad} of ${jLines} teacher-facing lines ${JSON.stringify(jByForm)}`);
console.log(`plain-English gate: ${jLines} teacher-facing lines checked, ${jBad} not plain ${JSON.stringify(jByKind)}`);
console.log(`free-text notes hidden (not plain as written; the composed sentence stands): ${Object.entries(hidden).map(([f, [n, h]]) => `${f} ${h}/${n} (${Math.round((100 * h) / n)}%)`).join(', ')}`);

// search
ok(searchLessons('Represent numbers to 100')[0].title === 'Represent numbers to 100', 'search exact title first');
ok(searchLessons('3.NF.A.1').length > 0, 'search by CCSS code');
ok(searchLessons('zzzz').length === 0, 'search nothing');
ok(searchLessons('week 5', 5, '2').every((l) => l.grade === '2' && l.weeks.includes('W05')), 'search by week, own grade first');
ok(searchLessons('3.NF.A.1', 3)[0].grade === '3', 'a CCSS code ranks its own grade first');

console.log(`ws-wrm-page-unit: ${fails ? 'FAIL (' + fails + ')' : 'OK'} — ${L.length} lessons, ${mapped} mapped`);
process.exit(fails ? 1 : 0);
