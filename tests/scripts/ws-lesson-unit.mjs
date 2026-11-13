// THE LESSON LIBRARY UNIT GATE (design/LESSON_LIBRARY_PLAN.md phase 0, design/LESSON_RULES.md): the
// lesson rules (sheet/lesson-rules.js), the library (lessons/library.js, schema.js), the back-compat
// view (lessons/prereqs.js), the prerequisite fallback (prereq-db.js) and the build-list NEEDS merge.
// Node only, no browser; prints `ws-lesson-unit: OK (n checks)` / `FAIL`.
//
//   node tests/scripts/ws-lesson-unit.mjs
//   node tests/scripts/ws-lesson-unit.mjs --only title,routing-export   # the engine checks alone (lf-engine P1, critic
//                                                                        # lessons-phase0 r1): title (D13), routing-export
//                                                                        # (D14), route-styles (D15), routed-plan (D16),
//                                                                        # checks-field (D12), parts-plugin (D18),
//                                                                        # chart-sizing (lesson 7 D1)
//   MQ_ROOT=<checkout> node tests/scripts/ws-lesson-unit.mjs --only ... # run them on another tree (ws-backtest commit-pair)
//   node tests/scripts/ws-lesson-unit.mjs --only chant-box               # a chant naming boxes holds for every dealt item (nwf r1 N6)
//   node tests/scripts/ws-lesson-unit.mjs --only chant-fit               # a chant decides at least half its lesson's items (compare r1 F2)
// The engine checks also run in the full gate.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ONLY = (() => { const i = process.argv.indexOf('--only'); return i > -1 ? String(process.argv[i + 1] || '').split(',').map((x) => x.trim()).filter(Boolean) : null; })();
const imp = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const mem = {};
globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
let pass = 0;
const fails = [];
const eq = (got, want, what) => { if (JSON.stringify(got) === JSON.stringify(want)) pass++; else fails.push(`${what}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
const ok = (cond, what) => { if (cond) pass++; else fails.push(what); };
const log = console.log;
console.log = () => {};
const data = await imp('js/modules/data.js').finally(() => { console.log = log; });
const LR = await imp('js/modules/sheet/lesson-rules.js');
const LIB = await imp('js/modules/lessons/library.js');
const SCHEMA = await imp('js/modules/lessons/schema.js');
const PRE = await imp('js/modules/lessons/prereqs.js');
const BL = await imp('js/modules/build-list.js');
const DET = await imp('js/modules/lessons/detailed/index.js');
const LATE = {
    // (lf-placevalue critic nwf r1 N6: "Three boxes, three digits." was printed over 2-digit items with no boxes, and over "one
    // thousand" in four. A routine's chant that names boxes must hold for every item its lessons deal: a chant naming a count
    // ("Three boxes") - every item has that many boxes; any chant about boxes - every item has boxes. Judged on the deal a
    // skill-keyed lesson prints: the practice options when the lesson sets `dealPracticeOpts`, else the skill's defaults too.
    // Items: generateQuestionFor, seeded, 60 a deal; boxes: the kit cell rendered blank, its data-ws-shape="box" slots.)
    async 'chant-box'() {
        const { loadApp } = await import(pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'ws-card-rulings.mjs')).href);
        const app = await loadApp(ROOT);
        const KIT = await imp('js/modules/sheet/index.js');
        const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
        for (const [id, l] of Object.entries(LIB.LESSONS)) {
            const r = LIB.ROUTINES[l.routine];
            const chant = String((r && r.chant) || '');
            if (!/\bbox(es)?\b/i.test(chant) || !l.practice) continue;
            const m = chant.match(/\b(one|two|three|four|five|six)\s+box(es)?\b/i);
            const want = m ? NUM[m[1].toLowerCase()] : null;
            const [category, skill] = String(l.practice.skill).split(':');
            const deals = [l.practice.opts || null].concat(l.dealPracticeOpts || !l.practice.opts ? [] : [null]);
            for (const opts of deals) {
                const bad = [];
                for (let i = 0; i < 60; i++) {
                    const sv = {}; for (const k of ['log', 'warn', 'info', 'debug']) { sv[k] = console[k]; console[k] = () => {}; }
                    let q = null;
                    try { q = app.gq.generateQuestionFor(Object.assign({ category, skill, seed: 7001 + i, itemIndex: i, itemCount: 60 }, opts ? { opts } : {})); } catch (e) { q = null; } finally { Object.assign(console, sv); }
                    if (!q || !q.cell) { bad.push(`item ${i}: no kit cell`); continue; }
                    let html = ''; try { html = KIT.renderCell(q, KIT.resolveCtx({ mode: 'print', size: 'M', look: 'ican', state: 'blank' })); } catch (e) { html = ''; }
                    const boxes = (html.match(/data-ws-shape="box"/g) || []).length;
                    if (want !== null ? boxes !== want : boxes === 0) bad.push(`item ${i} (${q.ans}): ${boxes} box(es)`);
                }
                ok(!bad.length, `chant-box: lesson ${id} chant "${chant}" ${want !== null ? `names ${want} boxes` : 'names boxes'}, but the ${opts ? 'practice-option' : 'default'} deal has ${bad.slice(0, 3).join('; ')}${bad.length > 3 ? ` (+${bad.length - 3})` : ''}`);
            }
        }
    },
    // (lf-placevalue compare r2, critic r1 F2: the compare lesson's chant "More digits, bigger number." decided 8 of the 33 items the
    // lesson dealt - every other item has two numbers of one length. A routine's chant must DECIDE at least half the items its
    // lesson's practice deals, judged where the skill's decision rules are known (CHANT_DECIDES: which rule a chant names, and
    // which items that rule decides). The deal: each practiceBlocks block (its opts over the practice opts), weighted by its
    // count, else the practice deal; generateQuestionFor, seeded, 60 an option set.)
    async 'chant-fit'() {
        const { loadApp } = await import(pathToFileURL(path.join(path.dirname(fileURLToPath(import.meta.url)), 'ws-card-rulings.mjs')).href);
        const app = await loadApp(ROOT);
        const CHANT_DECIDES = {
            'placevalue:compare': (chant, q) => {
                const a = String(q.pv && q.pv.a), b = String(q.pv && q.pv.b);
                if (a.length !== b.length) return /more digits|longer|digit count/i.test(chant);
                if (a === b) return /\bsame\b|=|equal/i.test(chant) && /first different|left/i.test(chant);
                return /first different|from the left|left to right/i.test(chant);
            },
        };
        let judged = 0;
        for (const [id, l] of Object.entries(LIB.LESSONS)) {
            const r = LIB.ROUTINES[l.routine];
            const judge = l.practice && CHANT_DECIDES[l.practice.skill];
            if (!judge || !r || !String(r.chant || '').trim()) continue;
            judged++;
            const [category, skill] = String(l.practice.skill).split(':');
            const blocks = Array.isArray(r.practiceBlocks) && r.practiceBlocks.length ? r.practiceBlocks : [{ shape: [12, 1] }];
            let dec = 0, all = 0;
            blocks.forEach((bk, bi) => {
                const w = Number((bk.shape || [])[0]) || 1;
                const opts = Object.assign({}, l.practice.opts || {}, bk.opts || {});
                for (let i = 0; i < 60; i++) {
                    const sv = {}; for (const k of ['log', 'warn', 'info', 'debug']) { sv[k] = console[k]; console[k] = () => {}; }
                    let q = null;
                    try { q = app.gq.generateQuestionFor({ category, skill, opts, seed: 9001 + bi * 100 + i, itemIndex: i, itemCount: 60 }); } catch (e) { q = null; } finally { Object.assign(console, sv); }
                    if (!q || !q.pv) continue;
                    all += w; if (judge(String(r.chant), q)) dec += w;
                }
            });
            ok(all > 0 && dec >= all / 2, `chant-fit: lesson ${id} chant "${r.chant}" decides ${all ? Math.round((100 * dec) / all) : 0} % of the items its practice deals (want at least half)`);
        }
        ok(judged > 0, 'chant-fit: no lesson with a known decision rule was judged (CHANT_DECIDES)');
    },
    // (P1d r3, lesson 3a critic: {p4.last} counted a Practice k a PAGE - "Practice 3" for Practice 1's second page. A
    // practiceSheets sheet over two pages is ONE unit whose last row is on its last page; a plan without `sheet`, one a page)
    async 'practice-units'() {
        const f = LR.practiceUnits;
        ok(typeof f === 'function', 'practice-units: lesson-rules exports practiceUnits');
        if (typeof f !== 'function') return;
        const plan = (pages) => ({ cells: pages.flatMap((n, pg) => Array.from({ length: n }, (_, r) => ({ page: pg, row: r + 1, id: `${pg}.${r}` }))) });
        const cellsOf = (pl) => pl.cells;
        const u = f([{ part: 'practice', sheet: 1, plans: [plan([2, 2])] }, { part: 'practice', sheet: 2, plans: [plan([10])] }], cellsOf);
        eq(u.length, 2, 'practice-units: two sheets, one over two pages, are two Practice units (never "Practice 3")');
        eq(u[0].map((c) => c.page), [1, 1], 'practice-units: a sheet over two pages names its LAST page');
        const v = f([{ part: 'practice', plans: [plan([3, 3])] }], cellsOf);
        eq(v.length, 2, 'practice-units: a plan without `sheet` stays one unit a page (every other lesson as before)');
    },
    // (E24b, owner ruling 2026-11-08 - lesson 2: CHECK FIRST, the WHOLE PACK. Every place that draws from the lesson's + pool
    // (chart 3, Guided 2, Practice 1's 4 + equal parts, the word problem, the exit slip 2, the Check Question - and the
    // Prerequisite Check only while a ref of it can deal a pool fact) gets a fact under LR-5 and LR-6 at seeds 1-25 + 4242
    // (lessons/pack-solve.js), and no Prerequisite Check ref draws from the lesson's own pool. The solver is the lane's when
    // the tree read (MQ_ROOT) has none, so the record of any tree is judged. No browser.)
    async 'pack-feasible'() {
        const own = path.join(ROOT, 'js/modules/lessons/pack-solve.js');
        const mine = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../js/modules/lessons/pack-solve.js');
        const PS0 = await import(pathToFileURL(fs.existsSync(own) ? own : mine).href);
        // (a tree whose solver predates placeSources - attempt 4 - is judged by today's model of each place's own source)
        const PS = typeof PS0.placeSources === 'function' ? PS0 : await import(pathToFileURL(mine).href);
        const d = (await imp('js/modules/lessons/detailed/g1-oa1-bar-model-wp-20.js')).default;
        const draws = (d.prerequisites || []).flatMap((p) => PS.prereqPoolDraws(p.ref, d.pool));
        eq(draws.length, 0, `pack-feasible: lesson 2's Prerequisite Check draws no fact of the lesson's crossing-ten pool (owner ruling 2026-11-08; it could deal ${draws.slice(0, 4).join(', ')}${draws.length > 4 ? ' ...' : ''})`);
        const places = PS.packPlaces(d);
        ok(!!places && places.length >= 14, 'pack-feasible: lesson 2 has a + pool and at least 14 places that draw from it');
        if (!places) return;
        const seeds = [...Array(25)].map((_, i) => i + 1).concat([4242]);
        const none = seeds.filter((s) => !PS.solvePack(d.pool, places, [], s));
        eq(none, [], `pack-feasible: a whole-pack assignment (${places.length} places, LR-5 + LR-6) exists at seeds 1-25 + 4242`);
        if (process.argv.includes('--verbose')) for (const s of seeds) { const r = PS.solvePack(d.pool, places, [], s); log(`  seed ${s}: ${r ? Object.entries(r.byId).map(([k, v]) => `${k} ${v}`).join(', ') : 'NONE'}`); }
        // (Practice 1's set taken from a whole-pack solution: its zone sizes, and the pack's spent keys left out)
        const r = PS.solvePracticeFromPack(d, { partMin: 2, noPart: [10], sums: [20] }, ['9+6', '6+9'], 4242);
        ok(!!r && r.at.length === 4 && /^(\d)\+\1$/.test(r.edge[0]) && !r.at.concat(r.edge).some((k) => k === '9+6' || k === '6+9'), 'pack-feasible: solvePracticeFromPack gives 4 stories + an equal-parts edge, none spent');
        // (lead's order 2026-11-08, attempt 5: the count above was green while the deal failed at seeds 2 and 5 - each place is
        // modelled from its OWN source: P0's count / bond ranges, the chart's case pools, Practice 1's solved set)
        if (typeof PS.placeSources !== 'function') { ok(false, 'pack-feasible: pack-solve.js placeSources models each place from its own item source'); return; }
        const bad = [];
        for (const s of seeds) { const rs = PS.placeSources(d, s); for (const x of rs.filter((y) => !y.ok)) bad.push(`seed ${s} ${x.place} (${x.source}): ${x.why}`); if (process.argv.includes('--verbose')) log(`  seed ${s} sources: ${rs.map((x) => `${x.place} ${x.source} ${x.ok ? 'ok' : 'FAIL'}`).join('; ')}`); }
        eq([...new Set(bad.map((b) => b.replace(/^seed \d+ /, '')))], [], `pack-feasible: every place keeps its own item source at seeds 1-25 + 4242 (${bad.length} place-seeds short)`);
        const srcPs = fs.readFileSync(path.join(ROOT, 'js/modules/sheet/roles/lesson.js'), 'utf8');
        ok(/Array\.isArray\(main\.hardAvoid\) \? \[Object\.assign\(\{\}, main, data\[k\]\.ref\)\]/.test(srcPs), 'pack-feasible: roles/lesson.js sources gives a hard-bound lesson\'s case pools the whole main ref (its avoid keys too)');
    },
    // (P0 ANSWER OVERLAP, lf-engine 2026-11-09: lesson 2's count 11-20 shares answers with its + facts 13-19, and the lane's
    // engine dealt each Prerequisite Check question against its own items only - twins 16 / 13 at seed 1, E24b. Where two
    // questions of one detailed lesson's P0 can share an answer, the engine must deal the page against ONE answer set
    // (print-sheet.js pageLr6 on a `perQuestion` pre-skill-check, master lf-placevalue 2026-11-08) and the union of their
    // answers must hold every item. Read from the record and the source, no browser.)
    async 'p0-overlap'() {
        const src = fs.readFileSync(path.join(ROOT, 'js/modules/print-sheet.js'), 'utf8');
        const wired = /const pageLr6 = \([^;]*n\.role === 'pre-skill-check' && n\.perQuestion\)/.test(src);
        const span = (r) => {
            const o = r.opts || {};
            const lo = r.minNum !== undefined ? Number(r.minNum) : (o.constant && r.skillId === 'add_facts' ? Math.min(...o.constant) : 0);
            const hi = r.maxNum !== undefined ? Number(r.maxNum) : Number(o.band) || 20;
            return [lo, hi];
        };
        const one = (r) => r.minNum !== undefined || r.maxNum !== undefined;
        let pairs = 0;
        for (const d of Object.values(DET.DETAILED_LESSONS)) {
            const qs = (d.prerequisites || []).filter((p) => p.ref && one(p.ref)).map((p) => ({ k: `${p.ref.categoryId}:${p.ref.skillId}`, n: Number(p.items) || 2, s: span(p.ref) }));
            for (let i = 0; i < qs.length; i++) for (let j = i + 1; j < qs.length; j++) {
                const [a, b] = [qs[i], qs[j]];
                const lo = Math.max(a.s[0], b.s[0]), hi = Math.min(a.s[1], b.s[1]);
                if (lo > hi) continue;
                pairs++;
                ok(wired, `p0-overlap: ${d.id} P0 ${a.k} (${a.s.join('-')}) and ${b.k} (${b.s.join('-')}) share answers ${lo}-${hi}, so the engine deals the Prerequisite Check page against one answer set (print-sheet.js pageLr6 on pre-skill-check + perQuestion)`);
                const union = Math.max(a.s[1], b.s[1]) - Math.min(a.s[0], b.s[0]) + 1;
                ok(union >= a.n + b.n, `p0-overlap: ${d.id} P0 ${a.k} and ${b.k}: ${a.n + b.n} items need ${a.n + b.n} different answers, their ranges hold ${union}`);
            }
        }
        ok(pairs > 0, 'p0-overlap: at least one detailed lesson has two P0 questions whose answers can meet (lesson 2: count 11-20, + facts 13-19)');
    },
    // (E24b attempt 2, lesson 2: the GREEDY deal order left Practice 1 the near twins 7 + 4 / 8 + 5 at seed 4242 though a set
    // without them existed. A `solve` sheet's stories are solved before it is dealt (print-sheet.js solveStoryFacts) and the
    // generator is pinned to the solved pairs (page-deal.js setDealPin). Read from the source, no browser.)
    async 'solve-story'() {
        const src = fs.readFileSync(path.join(ROOT, 'js/modules/print-sheet.js'), 'utf8');
        const m = src.match(/export function solveStoryFacts[\s\S]*?\n}\n/);
        ok(!!m, 'solve-story: print-sheet.js exports solveStoryFacts (a Practice page\'s stories solved before the deal)');
        if (!m) return;
        const solve = new Function(`${m[0].replace('export ', '')}; return solveStoryFacts;`)();
        // (lesson 2 at seed 4242: the chart, Guided and the reserved slip / Check Question facts, as dealt before Practice 1)
        const avoid = ['9+6', '6+9', '9+2', '2+9', '7+7', '7+8', '7+5', '9+5', '8+4'];
        const r = solve({ partMin: 2, noPart: [10], sums: [20] }, avoid, 4, 4242);
        ok(!!r && r.at.length === 4, 'solve-story: four stories solved for Practice 1 at 4242');
        if (!r) return;
        const o = r.at.map((k) => k.split('+').map(Number));
        const twins = [];
        for (let i = 0; i < o.length; i++) for (let j = i + 1; j < o.length; j++) if (Math.abs(o[i][0] - o[j][0]) <= 2 && Math.abs(o[i][1] - o[j][1]) <= 2) twins.push(`${r.at[i]} / ${r.at[j]}`);
        eq(twins, [], 'solve-story: no near twins among the solved stories (E24b)');
        eq(new Set(o.map((x) => x[0])).size, 4, 'solve-story: every first addend different, so any deal order keeps LR-6');
        eq(new Set(o.map((x) => x[0] + x[1])).size, 4, 'solve-story: every whole different (no twin answers)');
        ok(o.every((x) => x.every((v) => v >= 2 && v <= 9) && x[0] + x[1] >= 11 && !avoid.includes(`${x[0]}+${x[1]}`) && !avoid.includes(`${x[1]}+${x[0]}`)), 'solve-story: crossing-ten facts, parts 2-9, none the pack has dealt (LR-5, either order)');
        ok(/^(\d)\+\1$/.test(r.edge[0]) && r.edge.slice(1).every((k) => k.split('+').map(Number).reduce((a, b) => a + b) === 20), 'solve-story: the edge set is one equal-parts fact and wholes of 20');
        const pd = fs.readFileSync(path.join(ROOT, 'js/modules/page-deal.js'), 'utf8');
        ok(/export function setDealPin\(/.test(pd) && /if \(_pin && _pin\.key === key\)/.test(pd), 'solve-story: page-deal.js freshDeal honours a deal pin (set round one generateQuestionFor call only)');
        const L = Object.values(DET.DETAILED_LESSONS);
        eq(L.filter((d) => (d.practiceSheets || []).some((ps) => ps.solve)).map((d) => d.id), ['g1-oa1-bar-model-wp-20'], 'solve-story: only lesson 2 sets `solve` (every other lesson deals as before)');
    },
    // (P1d, owner rulings 2026-11-07 - lesson 2 E24b, lesson 3a LP-FAMILY-REPEAT: the POOL CAPACITY a pack needs. A pack
    // whose places need more distinct facts than its rule holds - LR-5 one fact a pack, LR-6 no near twins on a page - deals
    // a repeat or a twin on its last try, at some seeds only. Read from the record, no browser.)
    async 'pool-capacity'() {
        const L = Object.values(DET.DETAILED_LESSONS);
        const PSOLVE = await tryImp('js/modules/lessons/pack-solve.js');
        // (a) a + story pool (`pool.kind: 'plus'`, crossing ten): every page's places dealt from unordered facts, each fact
        // once in the pack, no two on a page near twins (both numbers within 2, either order of a fact chosen to dodge).
        const twin = (x, y) => Math.abs(x[0] - y[0]) <= 2 && Math.abs(x[1] - y[1]) <= 2;
        const pageOk = (fs) => { for (let m = 0; m < 1 << fs.length; m++) { const o = fs.map((f, i) => ((m >> i) & 1 ? [f[1], f[0]] : f)); let good = true; for (let i = 0; i < o.length && good; i++) for (let j = i + 1; j < o.length; j++) if (twin(o[i], o[j])) { good = false; break; } if (good) return true; } return false; };
        const plusFeasible = (d) => {
            const pd = d.pool, pm = Number(pd.partMin) || 1, no = pd.noPart || [];
            const facts = []; for (let a = pm; a <= 9; a++) for (let b = a; b <= 9; b++) if (a + b >= 11 && !no.includes(a) && !no.includes(b)) facts.push([a, b]);
            const sq = (f) => f[0] === f[1];
            const ld = d.lessonData || {};
            const pages = [];
            // (owner ruling 2026-11-08: a Prerequisite Check ref counts only while it can deal a pool fact - lessons/pack-solve.js)
            const pre = (d.prerequisites || []).filter((p) => p.ref && p.ref.categoryId === 'addition' && p.ref.skillId === 'add_facts' && (!PSOLVE || PSOLVE.prereqPoolDraws(p.ref, d.pool).length > 0));
            for (const p of pre) pages.push({ n: Number(p.items) || 2, s: 0, cap: Number(p.ref.maxNum) || 20, lo: Number(p.ref.minNum) || 0, anySq: true });
            pages.push({ n: 1 + (ld.second ? 1 : 0), s: ld.third && /Equal/.test(ld.third.test) ? 1 : 0, cap: 20 });
            pages.push({ n: Number(ld.guidedRows) || 2, s: 0, cap: 20 });
            for (const ps of d.practiceSheets || []) { const e = ps.edgeLast || {}; pages.push({ n: (Number(e.per) || 0) - (Number(e.cols) || 0), s: (e.wants || []).includes('wpEqual') ? 1 : 0, cap: 20 }); }
            pages.push({ n: 1, s: 0, cap: 20 }, { n: (d.exit || []).length, s: 0, cap: 20 }, { n: d.checkQuestion ? 1 : 0, s: 0, cap: 20 });
            const rec = (i, used) => {
                if (i === pages.length) return true;
                const pg = pages[i];
                const cand = facts.filter((f) => !used.has(f.join()) && f[0] + f[1] <= pg.cap && f[0] + f[1] >= (pg.lo || 0) && (pg.anySq || !sq(f)));
                const sqs = facts.filter((f) => !used.has(f.join()) && sq(f));
                const pick = (from, k, start, acc, then) => { if (acc.length === k) return then(acc); for (let j = start; j < from.length; j++) if (pick(from, k, j + 1, acc.concat([from[j]]), then)) return true; return false; };
                return pick(cand, pg.n, 0, [], (ns) => pick(sqs.filter((f) => !ns.includes(f)), pg.s, 0, [], (ss) => { const fs = ns.concat(ss); return pageOk(fs) && rec(i + 1, new Set([...used, ...fs.map((f) => f.join())])); }));
            };
            return { facts: facts.length, need: pages.reduce((t, p) => t + p.n + p.s, 0), ok: rec(0, new Set()) };
        };
        for (const d of L.filter((x) => x.pool && x.pool.kind === 'plus' && x.pool.crossTen)) {
            const r = plusFeasible(d);
            ok(r.ok, `pool-capacity: ${d.id} - ${r.facts} crossing-ten facts cannot fill ${r.need} places once each with no near twins on a page (LR-5 / LR-6)`);
        }
        // (b) an arrays-turn Practice sheet: the x families its allTest admits (factors 2 to the band's side) must cover its
        // places plus the chart and Guided arrays that share them (LR-5 one family a pack - lesson 3a r5: 4-5 families for 8)
        const ARR = await tryImp('js/modules/sheet/lesson-arch/array.js');
        if (ARR && ARR.CASES) for (const d of L) for (const ps of d.practiceSheets || []) {
            const sk = ps.skill || {}; if (sk.skillId !== 'mult_properties' || !sk.allTest || !ARR.CASES[sk.allTest]) continue;
            const t = (sk.opts && sk.opts.task || [0])[0], type = ['both', 'known', 'missing'][t] || 'known';
            const side = { 25: 5, 36: 6, 81: 9 }[Number(sk.opts && sk.opts.band)] || 5;
            const fam = new Set();
            for (let r = 2; r <= side; r++) for (let c = 2; c <= side; c++) if (r * c >= (Number(sk.minNum) || 0) && r * c <= (Number(sk.maxNum) || 999) && ARR.CASES[sk.allTest]({ q: { cell: { template: 'arrays-turn', payload: { rows: r, cols: c, type } } } })) fam.add([Math.min(r, c), Math.max(r, c)].join());
            const shape = Array.isArray(ps.shape) ? ps.shape : [0, 1];
            const need = Number(shape[0]) + 1 + (Number((d.lessonData || {}).guidedRows) || 2);
            ok(fam.size >= need, `pool-capacity: ${d.id} ${sk.allTest} admits ${fam.size} x families for ${shape[0]} Practice places + the chart and Guided arrays (${need}) - LR-5 one family a pack`);
        }
    },
    // (P1c, lesson 3a owner ruling 2026-11-07: an array is the x family of its two sides - its own group, so the D2 backtest
    // row keeps reading only what D2 fixed)
    async 'array-family'() {
        eq(LR.repeatKeysOf({ cell: { template: 'arrays-turn', payload: { rows: 3, cols: 4 } } }), ['rk:fam:3,4,12'], 'lesson 3a ruling: an array is the x family of its sides');
    },
    // P1c item 2 (lf-algebra): `guidedRows: 1` - a chartWide lesson's Guided band may be ONE full-width row; absent: 2.
    async 'guided-rows'() {
        const WD = await tryImp('js/modules/sheet/lesson-pages/we-do.js');
        const g = WD && WD.guidedRowsOf;
        eq(g ? [g(null), g({}), g({ guidedRows: 1 }), g({ guidedRows: 2 }), g({ guidedRows: 3 }), g({ guidedRows: 9 }), g({ guidedRows: 0 })] : [], [2, 2, 1, 2, 3, 4, 2], 'guidedRows: 1 when asked, 2 when absent, 2-4 as before');
        eq([SCHEMA.validateGuidedRows(undefined).length, SCHEMA.validateGuidedRows(1).length, SCHEMA.validateGuidedRows(0).length, SCHEMA.validateGuidedRows('2').length], [0, 0, 1, 1], 'guidedRows: schema takes 1-4');
        const wd = readSrc('js/modules/sheet/lesson-pages/we-do.js');
        ok(/const gw = guidedRowsOf\(data\);/.test(wd) && /cols: 1, rows: set\.length/.test(wd), 'guidedRows: the chartWide band reads guidedRowsOf and keeps one column');
        const ps = readSrc('js/modules/print-sheet.js');
        ok(/: guidedRowsOf\(d\.lessonData\);/.test(ps) && /const ng = guidedRowsOf\(ch\.lessonData\);/.test(ps), 'guidedRows: the detailed lesson reads the same count for {we}');
    },
    // P1c item 1 (lf-ops): `practiceBlocks` [{shape: [count, cols], opts?}] (1-3) on a short lesson - the Practice page prints
    // one section per block, the block's opts over the lesson's practice opts, its own grid, the step strip once.
    async 'practice-blocks'() {
        const PR = await tryImp('js/modules/sheet/lesson-pages/practice.js');
        const v = SCHEMA.validatePracticeBlocks;
        ok(typeof v === 'function' && !v(undefined).length && !v([{ shape: [4, 2] }, { shape: [4, 2], opts: { task: [2] } }]).length, 'blocks: the lf-ops case validates');
        ok(typeof v === 'function' && v([]).length && v([{ shape: [4, 2] }, { shape: [4, 2] }, { shape: [2, 2] }, { shape: [2, 2] }]).length && v([{ shape: [5, 2] }]).length
            && v([{ shape: [4, 2], opts: [1] }]).length && v([{ shape: [4, 2], pages: 2 }]).length && v([{ shape: [4] }]).length, 'blocks: 0 or 4 blocks, a part row, bad opts, an unknown key, a bad shape fail');
        ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, LIB.LESSONS['Y2.B2.S18'], { practiceBlocks: [{ shape: [3, 2] }] })).some((m) => /practiceBlocks/.test(m)), 'blocks: validateLesson checks the lesson\'s blocks');
        ok(!!PR && PR.practiceBlocksOf({}) === null && PR.practiceBlocksOf({ practiceBlocks: [] }) === null, 'blocks: absent or empty -> null (the page prints as before)');
        const secs = PR ? PR.practiceBlockSections(PR.practiceBlocksOf({ practiceBlocks: [{ shape: [4, 2] }, { shape: [4, 2], opts: { task: [2], pictures: false } }] }),
            { categoryId: 'multiplication', skillId: 'mult_properties', opts: { forms: [0], task: [1], band: 81 }, lr6: true }) : [];
        eq(secs.map((x) => [x.count, x.columns, x.pageCap, x.blockShare, x.noCap, x.skills[0].opts, x.skills[0].lr6]), [
            [4, 2, 4, 2, true, { forms: [0], task: [1], band: 81 }, true],
            [4, 2, 4, 2, true, { forms: [0], task: [2], band: 81, pictures: false }, true]], 'blocks: one section per block, opts merged over the lesson\'s, floors kept');
        const req = PR ? PR.practiceRequest({ common: {}, size: 'L', practiceSize: 'L', lessonNo: 1, section: { skills: [] }, facts: false, pages: 1, withStrip: true, shape: [6, 2], seed: 1, strip: null, stripH: 9, stripHtml: '<i>s</i>', blocks: secs }) : {};
        ok(req.sections === secs && req.stepStrip && req.stepStrip.html === '<i>s</i>', 'blocks: the request carries the blocks and the strip once');
        const ps = readSrc('js/modules/print-sheet.js');
        ok(/blockShare: Number\(s\.blockShare\)/.test(ps) && /sec\.blockShare > 0/.test(ps), 'blocks: buildSheet keeps blockShare and shares the body by it');
        const libSrc = readSrc('js/modules/lessons/library.js');
        ok(/out\.practiceBlocks = clone\(l\.practiceBlocks\)/.test(libSrc), 'blocks: engineRecord carries the lesson\'s practiceBlocks');
        const CMP = await tryImp('js/modules/lessons/compile.js');
        const U = await tryImp('js/modules/lessons/units/G3-Y4.B4.js');
        const card = U && JSON.parse(JSON.stringify(U.CARDS['g3-oa5-mult-properties']));
        let lib = null, lib0 = null;
        try { lib0 = CMP.compileLesson(card).library; card.parts.weDo = Object.assign({}, card.parts.weDo, { practiceBlocks: [{ shape: [4, 2] }] }); lib = CMP.compileLesson(card).library; } catch (e) { lib = null; }
        const one = (l) => (l ? Object.values(l.lessons)[0] : {});
        ok(!!lib && JSON.stringify(one(lib).practiceBlocks) === '[{"shape":[4,2]}]' && one(lib0).practiceBlocks === undefined, 'blocks: compile.js passes a card\'s weDo.practiceBlocks to the short lesson (absent: none)');
    },
    // R1 (lf-engine P1b): lesson 2 did not build since 944afb79 - a story within 20 tells ONE schema a page (word-work.js
    // pageConstant 'word-work-schema'), and an `itemSpread` ref never re-opens its page, so every try told the first try's
    // schema and the exit slip's put-together case was never met. `pageFresh` re-opens the page per try (both dealers), and
    // `reserve` deals the late items whose cases a 15-fact pool can run out of before any page.
    // R2 (lf-engine P1b): lessons 1 and 6 Practice sheets 17-19 % blank since 6bc3cbd8 (layout.js r12c nearPack laid 5 rows for
    // a 4 x 1 sheet's 4 items). A detailed Practice sheet's shape is its page: pageCap = its count, passed through normaliseRequest.
    async 'r2-practice-cap'() {
        const ps = readSrc('js/modules/print-sheet.js');
        ok(/sections: \[\{ skills: \[sk1\], count: shape\[0\], columns: shape\[1\], noCap: true, pageCap: shape\[0\](, \.\.\.\(ps\.equalPages \? \{ capFillCont: true \} : \{\}\))? \}\]/.test(ps), 'R2: a detailed Practice sheet is capped at its shape count');
        ok(/pageCap: s && Number\(s\.pageCap\) > 0 \? Number\(s\.pageCap\) : undefined/.test(ps), 'R2: normaliseRequest keeps a section pageCap');
        const L = await tryImp('js/modules/sheet/layout.js');
        ok(L && /Number\(section\.pageCap\) > 0 && rows \* cols > Number\(section\.pageCap\)/.test(readSrc('js/modules/sheet/layout.js')), 'R2: layout.js applies the cap after the near-height pack');
    },
    // Lesson 7 D2 (lf-engine P1b): the compiled card's `repeatKey: 'family+frame'` is read by both dealers - an item's
    // unordered x / ÷ family and its story frames are held once across the pack.
    async 'd2-repeat-key'() {
        ok(typeof LR.repeatKeysOf === 'function', 'D2: lesson-rules.js exports repeatKeysOf');
        if (typeof LR.repeatKeysOf !== 'function') return;
        const ws = { cell: { template: 'word-work', payload: { steps: [{ op: '*', a: 4, b: 6, ans: 24 }, { op: '+', a: 24, b: 3 }], lines: ['Ravi has 4 bags.', 'Each bag has 6 marbles.', 'How many marbles in all?'] } } };
        eq(LR.repeatKeysOf(ws), ['rk:fam:4,6,24', 'rk:frame:4 bag', 'rk:frame:6 marble'], 'D2: a two-step story keys its x step family and its frames');
        eq(LR.repeatKeysOf({ cell: { payload: { op: '/', a: 24, b: 6 } } }), ['rk:fam:4,6,24'], 'D2: 24 ÷ 6 is the family of 4 x 6');
        eq(LR.repeatKeysOf({ cell: { payload: { op: '+', a: 7, b: 5 } } }), [], 'D2: a + item has no x / ÷ family');
        const ps = readSrc('js/modules/print-sheet.js');
        ok(/if \(sk\.repeatKey && dlRepeatKeys\(cand\)\.some/.test(ps) && /if \(sk\.repeatKey\) for \(const k of dlRepeatKeys\(q\)\) seen\.add\(k\)/.test(ps), 'D2: refAccepts / refRecord read repeatKey (the role dealer)');
        ok(/const rks = ref\.repeatKey \? dlRepeatKeys\(q\) : \[\];/.test(ps) && /if \(d\.repeatKey\) for \(const x of dlRepeatKeys\(c\.q\)\) used\.add\(x\)/.test(ps), 'D2: the detailed dealer and the pack record read repeatKey');
        const U = await tryImp('js/modules/lessons/units/G3-Y4.B4.js');
        const l7 = U && Object.values(U.DETAILED || {}).find((x) => x && x.id === 'g3-oa8-two-step-wp');
        ok(l7 && l7.repeatKey && l7.skill.repeatKey === 'family+frame', 'D2: the compiled lesson 7 carries repeatKey on the description and its refs');
        ok(!DET.DETAILED_LESSONS['g3-oa8-two-step-wp'] || !DET.DETAILED_LESSONS['g3-oa8-two-step-wp'].repeatKey, 'D2: the hand-written lesson 7 has none (its render is unchanged)');
    },
    // critic r2 N2 / N3 / N4 (lf-engine P1b): a routed question never prints one item; the routing table says when a
    // question is missed and each routed question prints its __/n; the check holds LR-6.
    async 'route-floor'() {
        const R = await tryImp('js/modules/sheet/roles/pre-skill-check.js');
        if (!R) { ok(false, 'N2: pre-skill-check.js import'); return; }
        eq(R.ROUTE_ITEMS, 2, 'N2: ROUTE_ITEMS is 2');
        const html = R.routingTableHtml([{ letters: '1-2', checks: 'x', lesson: 'Y1', title: 't' }]);
        ok(typeof R.ROUTE_MISSED_RULE === 'string' && html.includes(R.ROUTE_MISSED_RULE), 'N3: the routing table states when a question is missed');
        const src = readSrc('js/modules/sheet/roles/pre-skill-check.js');
        ok(/const floor = \(i\) => Math\.max\(1, Math\.min\(ROUTE_ITEMS,/.test(src) && /return floor\(i\); \};/.test(src) && /filter\(\(\[v, i\]\) => v > floor\(i\)\)/.test(src), 'N2: plan() gives items up only above the floor of 2');
        ok(/extra: input\.perQuestion && !routed \? '' : scoreTag\(its\.length\)/.test(src), 'N3: a routed band carries its __/n score');
        ok(/Object\.assign\(\{ lr6: true, distinctAnswer: true \}, p\.ref\)/.test(readSrc('js/modules/print-sheet.js')), 'N4: the lesson check refs hold LR-6');
        ok(!/10 \* em - 24\)/.test(src) && /ROUTE_TABLE_FIXED_MM/.test(src), 'D16: routePlan names its fixed margins');
    },
    // R4 / R5 (lf-engine P1b): a detailed pack builds at every seed (a late item that finds its case spent is reserved and the
    // pack rebuilt); a spent pool never deals a chart example, its turn, or an item already on the page, while another is left.
    async 'r4-r5-dealer'() {
        const ps = readSrc('js/modules/print-sheet.js');
        ok(/async function buildDetailedLesson\(req = \{\}\) \{\n    const late = new Set\(\);/.test(ps) && /late\.add\(e\.dlLate\)/.test(ps), 'R4: buildDetailedLesson rebuilds with the failing late item reserved');
        ok((ps.match(/lateTag\('(wp|cq)'|lateTag\(`exit\$\{i\}`/g) || []).length === 3, 'R4: the word problem, the Check Question and every exit item name themselves when they fail');
        ok(/if \(!strict && Array\.isArray\(sk\.chartKeys\) && k < tries\)/.test(ps) && /lr6: true, chartKeys \}/.test(ps), 'R5: the relaxed pass keeps chart examples and page repeats last');
    },
    async 'r1-page-fresh'() {
        globalThis.window = globalThis.window || globalThis;
        const G = await tryImp('js/modules/generate-question.js'), PD = await tryImp('js/modules/page-deal.js');
        if (!G || !PD) { ok(false, 'R1: generate-question.js / page-deal.js import'); return; }
        const opts = { band: 20, pictures: false, support: 'bar', wpCues: false, wpBank: false };
        const kinds = (fresh) => { const out = new Set(); for (let k = 0; k < 40; k++) { if (fresh && k > 0) PD.resetPageDeals(); const q = G.generateQuestionFor({ category: 'addition', skill: 'add_wp_20', opts, seed: (4242 + 7919 * k) >>> 0, itemIndex: k }); const t = String((q && q.text) || ''); out.add(/\bin all\b/.test(t) ? 'put-together' : /\bmore\b/.test(t) ? 'add-to' : 'other'); } return [...out].sort(); };
        eq(kinds(false).length, 1, 'R1: the trap - an item-spread deal without a fresh page tells one schema on every try');
        eq(kinds(true), ['add-to', 'put-together'], 'R1: pageFresh - a fresh page per try deals both schemas');
        const ps = readSrc('js/modules/print-sheet.js');
        ok((ps.match(/if \((ref|sk)\.pageFresh && k > 0\) resetPageDeals\(\);/g) || []).length === 2, 'R1: both dealers (dealOne1, generateRun) re-open the page per try on a pageFresh ref');
        const l2 = DET.DETAILED_LESSONS['g1-oa1-bar-model-wp-20'] || Object.values(DET.DETAILED_LESSONS).find((x) => x.id === 'g1-oa1-bar-model-wp-20');
        ok(l2 && l2.skill.pageFresh && l2.wordProblem.ref.pageFresh && l2.exit.every((e) => e.ref.pageFresh), 'R1: lesson 2 story refs are pageFresh');
        ok(l2 && l2.exit[0].reserve && l2.checkQuestion.reserve, 'R1: lesson 2 reserves the exit put-together item and the Check Question');
    },
    // D18: the parts registry is fully plug-in - a dummy part registers with its own build hook and the host's dispatch
    // builds it, with no edit of roles/lesson.js or print-sheet.js buildLesson (which names no core part list).
    async 'parts-plugin'() {
        const R = await tryImp('js/modules/sheet/lesson-pages/index.js');
        ok(R && typeof R.buildPluggedParts === 'function', 'D18: lesson-pages/index.js exports buildPluggedParts (the host dispatch)');
        if (!R || typeof R.buildPluggedParts !== 'function') return;
        eq(['prereq', 'chart', 'sheet', 'practice', 'mixed'].map((x) => !!(R.lessonPart(x) || {}).core), [true, true, true, true, true], 'D18: the five core parts are marked core in the registry');
        const seen = [];
        R.registerLessonPart({ id: 'zz-dummy', order: 50, role: 'lesson', name: 'Dummy', build: async (api) => { seen.push([api.part.id, api.seed]); return { pageCount: 1, pupilHtml: '<section class="ws-page">dummy</section>' }; } });
        R.registerLessonPart({ id: 'zz-plan', order: 60, role: 'lesson', name: 'Planned', plan: () => [] });
        try {
            const ids = R.lessonPartIds();
            eq(ids.slice(-2), ['zz-dummy', 'zz-plan'], 'D18: a registered part takes its place in packet order');
            const rolled = [];
            const out = await R.buildPluggedParts(ids, { seedOf: (x) => (x === 'zz-dummy' ? 77 : 88), lessonRolePart: async (x, seed) => { rolled.push([x, seed]); return { pageCount: 2 }; } });
            eq(out.map((p) => [p.part, p.role, p.res.pageCount]), [['zz-dummy', 'lesson', 1], ['zz-plan', 'lesson', 2]], 'D18: the dispatch builds each plugged part (own hook, else the lesson role) and no core part');
            eq([seen, rolled], [[['zz-dummy', 77]], [['zz-plan', 88]]], 'D18: each with its own seed');
            R.registerLessonPart({ id: 'zz-vocab', order: 7, role: 'lesson', name: 'Vocabulary', plan: () => [] });
            ok(typeof R.orderParts === 'function', 'D18: lesson-pages/index.js exports orderParts');
            if (typeof R.orderParts === 'function') {
                const built = ['prereq', 'chart', 'teach', 'practice', 'practice', 'mixed', 'zz-dummy', 'zz-vocab'].map((part, i) => ({ part, i }));
                const got = R.orderParts(built, (e) => (e.part === 'teach' ? 'sheet' : e.part)).map((e) => `${e.part}${e.part === 'practice' ? e.i : ''}`);
                eq(got, ['prereq', 'zz-vocab', 'chart', 'teach', 'practice3', 'practice4', 'mixed', 'zz-dummy'], 'D18: parts come out in registry order - a part at order 7 lands second; a part\'s sheets keep their order');
                eq(R.orderParts(built.slice(0, 6), (e) => (e.part === 'teach' ? 'sheet' : e.part)).map((e) => e.i), [0, 1, 2, 3, 4, 5], 'D18: the default packet\'s order is unchanged');
            }
        } finally { R.unregisterLessonPart('zz-dummy'); R.unregisterLessonPart('zz-plan'); R.unregisterLessonPart('zz-vocab'); }
        eq(R.lessonPartIds().filter((x) => /^zz-/.test(x)), [], 'D18: a test part unregisters');
        const ps = readSrc('js/modules/print-sheet.js');
        const body = ps.slice(ps.indexOf('async function buildLesson('), ps.indexOf('async function buildDetailedLesson('));
        ok(!/\[\s*'prereq',\s*'chart',\s*'sheet',\s*'practice',\s*'mixed'\s*\]/.test(code(body)) && /buildPluggedParts\(/.test(body) && /orderParts\(/.test(body), 'D18: buildLesson names no list of the core parts, builds the rest through the registry and prints them in registry order');
    },
    // Lesson 7 D1 (brief step 2.4): the anchor chart reports its sizing; a fallback zoom under 1 is a failure.
    async 'chart-sizing'() {
        const CH = await tryImp('js/modules/sheet/lesson-pages/chart.js');
        const C = await tryImp('js/modules/sheet/roles/compose.js');
        ok(CH && typeof CH.chartSizingOf === 'function', 'lesson 7 D1: chart.js exports chartSizingOf');
        if (!CH || !C || typeof CH.chartSizingOf !== 'function') return;
        const fake = (h) => ({ measured: Object.fromEntries([1, 2, 3, 4].map((c) => [c, { hMm: h, fits: true }])), render: () => '<i></i>', cellCls: '', q: { text: '1 + 1', ans: 2 } });
        const input = { ctx: { size: 'L', paper: 'A4' }, skills: [{ categoryId: 'addition', skillId: 'add', iCan: 'I Can add' }] };
        const ctx = C.ctxOf(input);
        const run = (h, n, tail) => { const st = Array.from({ length: n }, () => fake(h)); return CH.chartPage(input, ctx, null, st[0], st, st, [], tail ? fake(20) : null, [], null).sizing; };
        const a = run(40, 4, false), b = run(150, 3, true);
        eq([a.mode, a.fallback, a.ok, a.zoom >= 1], ['one', false, true, true], 'lesson 7 D1: a chart that fits reports mode, zoom >= 1, ok');
        eq([b.fallback, b.ok, b.zoom < 1], [true, false, true], 'lesson 7 D1: a fallback zoom under 1 is reported as a failure (ok false)');
        eq(CH.chartSizingOf({ plan: { meta: { chartSizing: b } } }), { mode: b.mode, zoom: b.zoom, fallback: true, ok: false }, 'lesson 7 D1: the build result carries it (chartSizing)');
        const ps = readSrc('js/modules/print-sheet.js');
        ok(/chartSizing: chartSizingOf\(chart\)/.test(ps) && /chartsOk:/.test(ps), 'lesson 7 D1: buildLesson and buildDetailedLesson surface the chart sizing');
    },
};

/* ============================================================ the ENGINE checks (lf-engine P1, critic r1) */
const readSrc = (rel) => { try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch (e) { return ''; } };
const listJs = (rel) => { const out = []; const walk = (d) => { let ents = []; try { ents = fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }); } catch (e) { return; } for (const e of ents) { const r = `${d}/${e.name}`; if (e.isDirectory()) walk(r); else if (/\.js$/.test(e.name)) out.push(r); } }; walk(rel); return out; };
/** Source without comments (block comments, and // comments that start a line or follow code after whitespace). */
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.replace(/(^|\s)\/\/.*$/, '$1')).join('\n');
const tryImp = async (rel) => { try { return await imp(rel); } catch (e) { return null; } };
const ENGINE = {
    // D13: one title spelling - "Prerequisite Check" written once (PREREQ_CHECK_TITLE) and used by every page and table.
    async title() {
        const PSC = await tryImp('js/modules/sheet/roles/pre-skill-check.js');
        eq(PSC && PSC.PREREQ_CHECK_TITLE, 'Prerequisite Check', 'D13: pre-skill-check.js exports PREREQ_CHECK_TITLE');
        const files = [...listJs('js/modules/sheet'), 'js/modules/print-sheet.js', ...listJs('js/modules/lessons').filter((f) => !/\/(detailed|units)\/|\/compile\.js$/.test(f))];
        const lower = [], lit = [];
        for (const f of files) {
            const c = code(readSrc(f));
            if (/Prerequisite check/.test(c)) lower.push(f);
            const n = (c.match(/(['"`])Prerequisite Check(?::[^'"`]*)?\1/g) || []).length;
            if (n && !(f.endsWith('roles/pre-skill-check.js') && n === 1)) lit.push(`${f} (${n})`);
        }
        eq(lower, [], 'D13: no "Prerequisite check" spelling in the lesson modules');
        eq(lit, [], 'D13: the title is a literal only in PREREQ_CHECK_TITLE (every other use reads the constant)');
    },
    // D14: one routing-table builder (routingTableHtml); the detailed T6 is its own teacher table and nothing claims otherwise.
    async 'routing-export'() {
        const files = [...listJs('js/modules'), ...listJs('js/modules/sheet')];
        const defs = [...new Set(files)].filter((f) => /function\s+routingTableHtml\b|const\s+routingTableHtml\s*=/.test(code(readSrc(f))));
        eq(defs, ['js/modules/sheet/roles/pre-skill-check.js'], 'D14: routingTableHtml is defined once');
        const twins = [...new Set(files)].filter((f) => !f.endsWith('roles/pre-skill-check.js') && /If missed, teach first|Two or more missed/.test(code(readSrc(f))));
        eq(twins, [], 'D14: no second routing table (its head and rules live in routingTableHtml only)');
        ok(!/T6 prints the same/.test(readSrc('js/modules/sheet/roles/pre-skill-check.js')), 'D14: no claim that the detailed T6 prints the same table (it does not)');
        ok(/routingTableHtml\(/.test(code(readSrc('js/modules/sheet/roles/pre-skill-check.js')).replace(/function routingTableHtml/, '')), 'D14: the routing page calls the one builder');
    },
    // D15: the routed outputs carry classes, never literal type sizes, colours, borders or paddings; their CSS travels only
    // with a routed page (not in the engine stylesheet every page embeds).
    async 'route-styles'() {
        const PSC = await tryImp('js/modules/sheet/roles/pre-skill-check.js');
        const CSS = await tryImp('js/modules/sheet/lesson-css.js');
        ok(PSC && typeof PSC.routeTagHtml === 'function' && typeof PSC.routingTableHtml === 'function', 'D15: the route builders exist');
        if (!PSC) return;
        const html = PSC.routeTagHtml({ lesson: 'Y1.B1.S2', title: 'Count objects' }, 2) + PSC.routingTableHtml([{ letters: '1-2', checks: 'Count the objects.', answers: '6; 7', lesson: 'Y1.B1.S2', title: 'Count objects' }]);
        const bare = html.replace(/<style[\s\S]*?<\/style>/g, '');
        const styles = [...bare.matchAll(/style="([^"]*)"/g)].map((x) => x[1]);
        eq(styles.filter((st) => /\d(pt|px)\b|#[0-9a-f]{3,6}\b|border|padding|font|color|margin/i.test(st)), [], 'D15: no literal type, colour, border, padding or margin in the routed outputs');
        ok(/class="mq-lpretag"/.test(html) && /class="mq-lroute"/.test(html), 'D15: the routed outputs carry their classes');
        ok(CSS && typeof CSS.LESSON_ROUTE_CSS === 'string' && /\.mq-lpretag\{/.test(CSS.LESSON_ROUTE_CSS) && /\.mq-lroute/.test(CSS.LESSON_ROUTE_CSS), 'D15: lesson-css.js holds the route classes (LESSON_ROUTE_CSS)');
        ok(CSS && !/mq-lpretag|mq-lroute/.test(CSS.LESSON_CSS || ''), 'D15: the route classes are not in the engine stylesheet (pages without routes stay byte-identical)');
        ok(/data-mq-route-css/.test(html), 'D15: a routed output carries its own stylesheet');
    },
    // D16: the routed plan's numbers are named, and routes / routePlan / routeTagLines / routedLayout are unit-tested.
    async 'routed-plan'() {
        const PSC = await tryImp('js/modules/sheet/roles/pre-skill-check.js');
        const C = await tryImp('js/modules/sheet/roles/compose.js');
        const names = ['ROUTE_TAG_PT', 'ROUTE_TAG_LEADING', 'ROUTE_TAG_PAD_MM', 'ROUTE_CHAR_MM', 'ROUTE_TAG_INSET_MM', 'INSTR_CHAR_EM', 'FULL_W_MM', 'HALF_W_MM', 'ROUTE_GROW', 'PAIR_ALIKE', 'ROUTE_ITEMS'];
        eq(names.filter((k) => !(PSC && Number.isFinite(PSC[k]))), [], 'D16: the routed plan\'s numbers are named constants');
        if (!PSC || !names.every((k) => Number.isFinite(PSC[k])) || typeof PSC.routedLayout !== 'function') { fails.push('D16: routedLayout is exported'); return; }
        const src = code(readSrc('js/modules/sheet/roles/pre-skill-check.js'));
        ok(!/\b1\.6\b|\b0\.75\b|\b0\.7\b|Math\.min\(40,/.test(src.slice(src.indexOf('export function routedLayout'))), 'D16: no magic 1.6 / 0.7 / 0.75 / 40 mm left in the routed layout');
        const PT = 25.4 / 72;
        ok(Math.abs(PSC.routeTagMm(1) - (PSC.ROUTE_TAG_PT * PT * PSC.ROUTE_TAG_LEADING + PSC.ROUTE_TAG_PAD_MM)) < 1e-9 && Math.abs(PSC.ROUTE_TAG_MM - PSC.routeTagMm(1)) < 1e-9, 'D16: a one-line tag is 9 pt at 1.3 plus its pad');
        ok(PSC.routeTagMm(2) > PSC.routeTagMm(1) && PSC.routeTagMm(0) === PSC.routeTagMm(1), 'D16: a two-line tag is taller; never under one line');
        const r = { lesson: 'Y2.B2.S17', title: 'Subtract two 2-digit numbers (not across a 10)' };
        eq(PSC.routeText(r), 'If missed \u2192 Lesson Y2.B2.S17 Subtract two 2-digit numbers (not across a 10)', 'D16: the tag words');
        eq([PSC.routeTagLines(null, 93), PSC.routeTagLines(r, PSC.FULL_W_MM), PSC.routeTagLines(r, PSC.HALF_W_MM)], [1, 1, 2], 'D16: a long tag wraps at half width, not at full width (TY-12: never clipped)');
        if (!C) return;
        const fake = (h, w = 40) => ({ q: { text: 'x', ans: 1, categoryId: 'a', skillId: 'b' }, template: 'fact', footprint: { wMm: w, hMm: h, measure: true, maxCols: 4 }, measured: Object.fromEntries([1, 2, 3, 4].map((c) => [c, { hMm: h, fits: w * c <= 186 }])) });
        const input = { ctx: { size: 'L', paper: 'A4' }, skills: [], perQuestion: 2, routes: [{ lesson: 'Y1.B1.S1', title: 'A' }, { lesson: 'Y1.B1.S2', title: 'B' }, { lesson: 'Y1.B1.S3', title: 'C' }, { lesson: 'Y1.B1.S4', title: 'D' }] };
        const ctx = C.ctxOf(input);
        const m = C.bandMetrics(ctx, C.layoutHeader({ title: 'Prerequisite Check', name: true }));
        const L1 = PSC.routedLayout([[fake(30), fake(30)], [fake(30), fake(30)], [fake(30, 100)], [fake(60)]], [0, 1, 2, 3], input, ctx, m);
        eq(L1.units.map((u) => [u.qs.map((q) => q.length), u.cols, u.rows]), [[[2, 2], 4, 1], [[1], 1, 1], [[1], 1, 1]], 'D16: two narrow 2-item questions share a row of 4; a wide item and an unlike one stand alone');
        ok(L1.units.every((u) => u.h <= u.h0 * PSC.ROUTE_GROW + 1e-6 && u.h >= u.h0), 'D16: rows grow, each to at most ROUTE_GROW x its measured height (H13)');
        ok(L1.fits && L1.foot >= 0 && L1.foot < 1, 'D16: the layout reports its fit and the foot it leaves');
        const L2 = PSC.routedLayout([[fake(120)], [fake(120)], [fake(120)]], [0, 1, 2], input, ctx, m);
        ok(!L2.fits, 'D16: a check taller than the page says so (the role then drops items)');
        const rp = PSC.routePlan(Object.assign({}, input, { checkFor: { categoryId: 'a', skillId: 'b', iCan: 'I Can add' } }), [{ letters: '1\u20132', checks: 'Count.', answers: '6; 7', lesson: 'Y1.B1.S2', title: 'Count objects' }]);
        ok(rp && rp.pages.length === 1 && rp.meta.part === 'prereq-route', 'D16: routePlan is one teacher page');
        ok(rp && rp.header && rp.header.title === PSC.ROUTE_PAGE_TITLE && rp.header.name === false && !/^I Can/.test(rp.header.title), 'D12/D16: the routing page is titled "Prerequisite Check: where next", no Name, never "I Can"');
        eq(PSC.routePlan(input, []), null, 'D16: no routes, no routing page');
    },
    // D12: every library prerequisite says what its question asks (`checks`), in words other than the design `why`.
    async 'checks-field'() {
        const L = await tryImp('js/modules/lessons/library.js');
        const S = await tryImp('js/modules/lessons/schema.js');
        const bad = [];
        for (const [id, l] of Object.entries((L && L.LESSONS) || {})) for (const [i, p] of (l.prereqs || []).entries()) {
            if (!String(p.checks || '').trim()) bad.push(`${id} Q${i + 1}: no checks`);
            else if (String(p.checks).trim() === String(p.why || '').trim()) bad.push(`${id} Q${i + 1}: checks = why`);
        }
        eq(bad, [], 'D12: every library prerequisite has its own `checks` line');
        const lsn = L && L.lessonById && L.lessonById('Y2.B2.S18');
        ok(!!(S && lsn && S.validateLesson('Y2.B2.S18', Object.assign({}, lsn, { prereqs: lsn.prereqs.map((p, i) => (i ? p : Object.assign({}, p, { checks: '' }))) })).some((x) => /no checks/.test(x))), 'D12: the schema refuses a prerequisite with no checks');
        ok(!!(L && L.lessonData && (L.lessonData('Y2.B2.S18').prereqs || []).every((p) => p.checks)), 'D12: lessonData hands `checks` to the engine');
    },
};
if (ONLY) {
    const unknown = ONLY.filter((g) => !ENGINE[g] && !LATE[g]);
    if (unknown.length) { log(`ws-lesson-unit: unknown --only group(s) ${unknown.join(', ')} (${[...Object.keys(ENGINE), ...Object.keys(LATE)].join(', ')})`); process.exit(2); }
}

const skillExists = (key) => { const [c, s] = String(key).split(':'); return !!(data.SKILLS[c] && data.SKILLS[c].some((x) => x && x.v === s)); };

if (!ONLY) {
// ---- THE LESSON RULES (sheet/lesson-rules.js)
eq(LR.itemKey('9 + 1 = ?', '10'), LR.itemKey('1 + 9 = ?', '10'), 'LR-5: a turnaround is the same item');
ok(LR.itemKey('Which place?', 'tens', 78) !== LR.itemKey('Which place?', 'tens', 42), 'LR-5: a place-value item is keyed by its number');
ok(LR.nearTwins([51, 44], [53, 45]) && LR.nearTwins([27, 19], [77, 19]) && !LR.nearTwins([52, 39], [70, 23]), 'LR-6: near twins');
eq(LR.casesOf({ text: '36 − 29 = ?', ops: [36, 29] }).join(','), 'twoPlace,underTen', 'LR-1: 36 - 29 is a two-place take-away with an answer under 10');
eq(LR.casesOf({ text: '60 − 3 = ?', ops: [60, 3] }).join(','), 'onePlace,zeroOnes', 'LR-1: 60 - 3 is one-place, 0 in the ones');
eq(LR.casesOf({ kind: 'round', n: 98, place: 10, text: 'Round 98' }).join(','), 'roundUp,toHundred', 'LR-1: 98 rounds up to 100');
const pk = (part, text, ops, ans) => ({ part, skill: 'subtraction:sub_100_regroup', text, ops, ans });
const V = LR.packetViolations({
    lesson: { skill: 'subtraction:sub_100_regroup', cases: ['twoPlace', 'onePlace', 'zeroOnes', 'underTen'], caps: { onePlace: 1, underTen: 2 } },
    placed: [pk('chart', '52 − 39 = ?', [52, 39], '13'), pk('practice', '52 − 39 = ?', [52, 39], '13'), pk('practice', '62 − 59 = ?', [62, 59], '3'),
        pk('practice', '64 − 59 = ?', [64, 59], '5'), pk('practice', '31 − 25 = ?', [31, 25], '6'), pk('practice', '100 − 47 = ?', [100, 47], '53')],
    chartCases: ['twoPlace'],
}).map((v) => v.rule);
ok(['LR-1', 'LR-2', 'LR-5', 'LR-6', 'LR-7'].every((r) => V.includes(r)), `LR: a packet breaking five rules is caught (${[...new Set(V)].join(', ')})`);
eq(LR.packetViolations({ lesson: { cases: [] }, placed: [], sizePrinted: 'M', packetSize: 'L' }).map((v) => v.rule).join(','), 'LR-10', 'LR-10: a packet printed off its one size fails');
eq(LR.packetViolations({ lesson: { cases: [] }, placed: [], sizePrinted: 'L', packetSize: 'L' }).length, 0, 'LR-10: a packet at its size passes');

// ---- THE LESSON LIBRARY
const caseNames = Object.values(LR.CASE_FAMILIES).flatMap((f) => Object.keys(f));
eq(LIB.validateLibrary({ stepIcons: PRE.STEP_ICONS, caseNames, skillExists }).join('; '), '', 'library: no structural problem');
eq(LIB.lessonById('add-within-10') && LIB.lessonById('add-within-10').id, 'Y1.B2.S9', 'library: an older slug finds its lesson');
eq(LIB.lessonIdOf('round-nearest-10'), 'Y4.B1.S14', 'library: lessonIdOf reads a slug');
eq(LIB.lessonIdOf('nope'), null, 'library: an unknown id is null');
eq(LIB.practiceRef('Y1.B2.S9'), { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10, constant: [1, 2, 3] } }, 'library: the practice options live in the lesson record');
eq((LIB.defaultLessonForSkill('subtraction', 'sub_100_regroup') || {}).id, 'Y2.B2.S18', 'library: a skill finds its default lesson');
eq(LIB.defaultLessonForSkill('multiplication', 'mult_facts'), null, 'library: a skill with no lesson has none');
eq([SCHEMA.kindOf('Y2.B2.S18'), SCHEMA.kindOf('ccss:6.NS.A.1'), SCHEMA.kindOf('ee:M.EE.6.SP.1'), SCHEMA.kindOf('skill:addition:add_facts'), SCHEMA.kindOf('Y9.B1')].join(','), 'wrm,ccss,ee,skill,', 'library: lesson id kinds');

// lessonData = lessonFor (the engine record, unchanged) + prereqs
for (const id of Object.keys(LIB.LESSONS)) {
    const ref = LIB.practiceRef(id);
    const d = LIB.lessonData(id);
    const f = PRE.lessonFor(ref.categoryId, ref.skillId);
    const { prereqs, prereqsLive, vocabZoom, roundOneNum, ...rest } = d;
    eq(rest, JSON.parse(JSON.stringify(f)), `library: lessonData(${id}) is lessonFor(${ref.categoryId}, ${ref.skillId}) plus prereqs`);
    ok(!('archetype' in d) && !('cases' in d) && !('caps' in d) && !('casesPending' in d), `library: lessonData(${id}) hands no library-only field to the engine`);
    ok(!('prereqs' in f), `prereqs.js: lessonFor(${ref.categoryId}, ${ref.skillId}) carries no prereqs (byte-identical packets)`);
}
const yp = LIB.lessonData('Y2.B2.S18').prereqs;
eq(yp.map((p) => Object.keys(p).sort().join(',')), ['checks,lesson,ref,title,why', 'checks,lesson,ref,title,why', 'checks,lesson,ref,title,why', 'checks,lesson,ref,title,why'], 'LR-17: each question {lesson, title, why, checks, ref}');
eq(yp[0], { lesson: 'Y2.B1.S4', title: 'Use a place value chart', why: 'Regrouping reads the tens digit and the ones digit.', checks: 'Name the place of a digit: tens or ones.', ref: { categoryId: 'placevalue', skillId: 'identify', opts: { band: 99, places: [1, 10], writeValue: false } } }, 'LR-17: question 1 of Y2.B2.S18');
eq(yp[2].ref, { categoryId: 'subtraction', skillId: 'subtract', opts: { band: 20, regroup: 'always', notation: ['stacked'] }, minTop: 11, maxTop: 18, maxBottom: 9 }, 'LR-17: a question ref carries its floors (critic r1 D8: a kit fact, no exchange box, no Check line)');
yp[0].ref.opts.band = 1;
eq(LIB.lessonData('Y2.B2.S18').prereqs[0].ref.opts.band, 99, 'library: lessonData hands out fresh objects');
eq(LIB.lessonData('Y2.B2.S17').prereqs, undefined, 'LR-17: a lesson whose check is pending has no prereqs (keeps its Warm-up)');
// LR-17 switch (landing 2026-11-09): the three samples' checks stay OFF the printed packet until their critic passes
for (const id of ['Y1.B2.S9', 'Y2.B2.S18', 'Y4.B1.S14']) {
    eq(LIB.lessonData(id).prereqsLive, false, `LR-17 switch: ${id} is off (prereqsLive false)`);
    eq(LIB.prereqCheckLive(LIB.lessonData(id)), false, `LR-17 switch: ${id} prints its Warm-up (prereqCheckLive false)`);
    ok(LIB.lessonData(id).prereqs.length >= 3 && LIB.lessonData(id).skills.length > 0, `LR-17 switch: ${id} keeps its check data and its Warm-up skills`);
}
ok(LIB.prereqCheckLive({ prereqs: [{}] }) && !LIB.prereqCheckLive({ prereqs: [] }) && !LIB.prereqCheckLive(null), 'LR-17 switch: a record with prereqs and no switch is live');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, LIB.lessonById('Y2.B2.S18'), { prereqsLive: true })).some((m) => /prereqsLive/.test(m)), 'LR-17 switch: prereqsLive is false or absent');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, LIB.lessonById('Y2.B2.S18'), { warmup: [] })).some((m) => /Warm-up it prints/.test(m)), 'LR-17 switch: an off check needs its Warm-up');
for (const [id, l] of Object.entries(LIB.LESSONS)) if ((l.prereqs || []).length) ok(l.prereqsLive === false, `LR-17 switch: library lesson ${id} with a check is off until its critic passes (landing)`);
// LR-17b (landing 2026-11-09, lead decision A): the phase-0 look (critic r2 N1 vocabZoom, D11 roundOneNum) is OPT-IN on the
// three samples and live only with their check: prereqsLive false prints exactly as master (ws-lesson-baseline proof).
{
    const CM = await imp('js/modules/sheet/lesson-pages/common.js');
    const PR = await imp('js/modules/sheet/lesson-pages/practice.js');
    const { resolveCtx } = await imp('js/modules/sheet/index.js');
    eq(LIB.PHASE0_FLAGS, ['vocabZoom', 'roundOneNum'], 'LR-17b: the phase-0 flags');
    eq(['Y1.B2.S9', 'Y2.B2.S18', 'Y4.B1.S14'].map((id) => [!!LIB.lessonData(id).vocabZoom, !!LIB.lessonData(id).roundOneNum]), [[true, false], [true, false], [true, true]], 'LR-17b: vocabZoom on the three samples, roundOneNum on the round sample only');
    eq(Object.entries(LIB.LESSONS).filter(([, l]) => LIB.PHASE0_FLAGS.some((f) => l[f])).map(([id]) => id).sort(), ['Y1.B2.S9', 'Y2.B2.S18', 'Y4.B1.S14'], 'LR-17b: no other lesson carries a phase-0 flag');
    for (const id of ['Y1.B2.S9', 'Y2.B2.S18', 'Y4.B1.S14']) eq([CM.phase0On(LIB.lessonData(id), 'vocabZoom'), CM.phase0On(LIB.lessonData(id), 'roundOneNum')], [false, false], `LR-17b: ${id}'s flags are off while its check is off (master's packet)`);
    ok(CM.phase0On({ vocabZoom: true, prereqs: [{}] }, 'vocabZoom') && !CM.phase0On({ vocabZoom: true, prereqs: [{}], prereqsLive: false }, 'vocabZoom')
        && !CM.phase0On({ vocabZoom: true }, 'vocabZoom') && !CM.phase0On({ prereqs: [{}] }, 'vocabZoom') && !CM.phase0On(null, 'vocabZoom'), 'LR-17b: phase0On = flag true AND the check live');
    const l14 = LIB.lessonById('Y4.B1.S14');
    ok(!SCHEMA.validateLesson('Y4.B1.S14', l14, { skillExists: (k) => !!k }).some((m) => /LR-17b/.test(m)), 'LR-17b: the round sample\'s flags validate');
    ok(SCHEMA.validateLesson('Y4.B1.S14', Object.assign({}, l14, { vocabZoom: 1 })).some((m) => /vocabZoom: true or absent/.test(m)), 'LR-17b: a flag is true or absent');
    ok(SCHEMA.validateLesson('Y2.B2.S17', Object.assign({}, LIB.lessonById('Y2.B2.S17'), { roundOneNum: true })).some((m) => /roundOneNum: true needs/.test(m)), 'LR-17b: a flag needs `prereqs`');
    // the engine: rounding cells fill the Independent rows as one-number answers only with roundOneNum live (D11)
    const ctx = resolveCtx({ size: 'L', look: 'ican', mode: 'print' });
    const cell = (i) => ({ q: { text: `${21 + i} → ?`, ans: 20, cell: { template: 'pv', payload: { kind: 'round' } } }, template: 'pv', render: () => '<i></i>', key: { value: '20', display: '20', slots: {} },
        measured: Object.fromEntries([1, 2, 3, 4].map((c) => [c, { hMm: 20, wMm: 30, slackMm: 10 }])), footprint: { wMm: 40, hMm: 20 } });
    const rowsWith = (d) => PR.independentBand({ input: { skills: [{ categoryId: 'number_sense', skillId: 'nearest_10' }] }, ctx, m: { strip: 10 }, data: d, main: Array.from({ length: 18 }, (_, i) => cell(i)),
        example: null, example2: null, example3: null, example4: null, weDo: [], extrasList: [], cur: { sections: [], used: 60, budget: 200 }, labels: {}, letter: 1 }).length;
    eq([rowsWith(null), rowsWith({ roundOneNum: true, prereqs: [{}], prereqsLive: false }), rowsWith({ roundOneNum: true, prereqs: [{}] })], [6, 6, 12], 'LR-17b: rounding rows - flag off or check off: master\'s 6; on with the check live: 12');
}
eq(LIB.lessonRules('Y4.B1.S14').cases, ['roundUp', 'roundDown', 'endsFive', 'toHundred'], 'library: lessonRules gives the gates the cases');
eq(LIB.lessonRules('Y2.B2.S18').caps, { onePlace: 1, underTen: 2 }, 'library: lessonRules gives the gates the caps');
eq(LIB.lessonRules('Y3.B2.S12').cases, null, 'library: a routine with casesPending declares none');
eq(PRE.lessonDataById('subtract-2-digit-regroup').prereqs.length, 4, 'prereqs.js: lessonDataById reads a slug');
eq(PRE.lessonFor('subtraction', 'sub_1m_no_regroup').warmRows, ['S', 'M'], 'prereqs.js: a lesson\'s teach fields reach the engine record');
eq(PRE.lessonFor('subtraction', 'sub_10k_no_regroup').steps[2].text, 'Each place to the left.', 'prereqs.js: a shared routine with the lesson\'s own steps');
eq(PRE.lessonFor('addition', 'add_10_regroup'), null, 'prereqs.js: a skill with no lesson is null');

// The prerequisite skills (plan §8e): a lesson's own check, else its Warm-up, else the seed's fallback.
eq(LIB.prerequisiteSkillsFor('subtraction', 'sub_100_regroup').map((p) => p.skillId).join(','), 'identify,expand,subtract,sub_100_no_regroup', 'library: a skill with a lesson lists its Prerequisite Check skills');
eq(LIB.prerequisiteSkillsFor('subtraction', 'sub_100_regroup')[0].lesson, 'Y2.B1.S4', 'library: each with the lesson it routes to');
eq(LIB.prerequisiteSkillsFor('subtraction', 'sub_1k_no_regroup').map((p) => p.skillId).join(','), 'sub_100_no_regroup,subtract', 'library: a lesson with no check lists its Warm-up');
const mf = LIB.prerequisiteSkillsFor('multiplication', 'mult_facts');
ok(mf.length > 0 && mf.every((p) => p.categoryId && p.skillId && p.why && skillExists(`${p.categoryId}:${p.skillId}`) && `${p.categoryId}:${p.skillId}` !== 'multiplication:mult_facts'), 'library: a skill with no lesson takes the seed fallback, live, each with its reason, never itself');

// LR-17: the Prerequisite Check - 3 or 4 questions, routed earliest-missed first; both shapes.
const lsn = LIB.lessonById('Y2.B2.S18');
const two = Object.assign({}, lsn, { prereqs: lsn.prereqs.slice(0, 2) });
ok(SCHEMA.validateLesson('Y2.B2.S18', two).some((m) => /LR-17/.test(m)) && !SCHEMA.validateLesson('Y2.B2.S18', lsn, { skillExists }).length, 'LR-17: a check of 2 questions fails, the sample passes');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, lsn, { prereqs: lsn.prereqs.concat([{ lesson: 'Y2.B2.S18', title: 'x', key: 'addition:add_facts', why: 'x' }]) })).some((m) => /own prerequisite/.test(m)), 'LR-17: 5 questions or a self-prerequisite fails');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, lsn, { prereqs: lsn.prereqs.map((p, i) => (i ? p : Object.assign({}, p, { key: 'placevalue:zz_gone' }))) }), { skillExists }).some((m) => /not live/.test(m)), 'LR-17: a dead skill fails');
ok(SCHEMA.validateLesson('Y2.B2.S18', Object.assign({}, lsn, { prereqs: undefined, prereqsPending: '' })).some((m) => /no Prerequisite Check/.test(m)), 'LR-17: a lesson with neither a check nor a reason fails');
for (const d of Object.values(DET.DETAILED_LESSONS)) eq(SCHEMA.validatePrereqs(d.id, d.prerequisites, { skillExists }), [], `LR-17: detailed lesson ${d.id} keeps the rules`);
const det = Object.values(DET.DETAILED_LESSONS)[0];
ok(SCHEMA.validatePrereqs(det.id, det.prerequisites.slice(0, 2), { skillExists }).some((m) => /2 question/.test(m)), 'LR-17: a detailed check of 2 questions fails');
eq(SCHEMA.prereqOf(det.prerequisites[0]).key, `${det.prerequisites[0].ref.categoryId}:${det.prerequisites[0].ref.skillId}`, 'LR-17: prereqOf reads the detailed shape');
eq(LIB.prereqRoute('Y2.B2.S18', [4, 2]).map((r) => r.lesson).join(','), 'Y2.B1.S5,Y2.B2.S17,Y2.B2.S18', 'LR-17: two misses go earliest first, then back to the lesson');
eq(LIB.prereqRoute('Y2.B2.S18', ['Y2.B2.S17']).map((r) => [r.lesson, !!r.built, !!r.back]), [['Y2.B2.S17', true, false], ['Y2.B2.S18', false, true]], 'LR-17: a route names whether its lesson is built');
eq(LIB.prereqRoute('Y2.B2.S18', []).length, 0, 'LR-17: nothing missed - straight to the anchor chart');

// ---- Lesson NEEDS reach the build list (plan §2): a match blocks the entry, a new need is an entry.
const blOpt = BL.buildList(null, []).find((e) => e.kind === 'option');
const blMerged = BL.buildList(null, [{ lesson: 'Y2.B2.S18', kind: 'option', skill: blOpt.skill, option: blOpt.option, name: 'x' },
    { lesson: 'Y3.B2.S1', kind: 'skill', skill: 'addition:zz_unit', name: 'n' }, { lesson: 'Y1.B2.S9', kind: 'lesson', prereq: 'Y1.B1.S2', name: 'p' }]);
ok(blMerged.find((e) => e.id === blOpt.id).lessonsBlocked.includes('Y2.B2.S18') && blMerged.some((e) => e.source === 'lesson' && e.skill === 'addition:zz_unit')
    && !blMerged.some((e) => e.lessonsBlocked.includes('Y1.B2.S9')), 'build list: a lesson need blocks its entry or adds one; a missing lesson stays off the skill list');
eq(BL.buildList().map((e) => e.id), BL.buildList(null, []).map((e) => e.id), 'build list: today\'s NEEDS (prerequisite lessons only) leave the list unchanged');

}
for (const [g, fn] of Object.entries(Object.assign({}, ENGINE, LATE))) if (!ONLY || ONLY.includes(g)) await fn();
for (const f of fails) console.log(`  FAIL ${f}`);
console.log(fails.length ? `ws-lesson-unit: FAIL (${fails.length} of ${pass + fails.length})` : `ws-lesson-unit: OK (${pass} checks)`);
process.exit(fails.length ? 1 : 0);
