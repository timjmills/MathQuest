// ws-mix-pages — MIX-PAGES on any checkout (lf-placevalue vocab deploy, 2026-11-19; lf-engine review of fbca1a582).
//
//   node tests/scripts/ws-mix-pages.mjs [--root <checkout>] [--only MIX-PAGES,MIX-DROP,MIX-SHELVES]   (MQ_ROOT works too)
//
// The node twin of ws-layout-unit MIX-PAGES, runnable on an OLD tree (a backtest row's {root}): ws-layout-unit imports its own
// checkout's modules, so it cannot judge another commit. A library lesson's Mixed page (lessonFit, over several pages) ADDS lead
// shelves while its page count holds. A lead shelf that STARTS a page opens a band under its strip; counted without the strip
// (mixed-practice.js packing pagesOf before fbca1a582), a 4th Match 3 shelf joined the anchor chart's page on paper only, the
// chart spilled, and the Mixed page ran 3 -> 4 pages with one lead cell alone on a page (vocab_grade_pictures L lesson p7-10).
// The judge needs no new meta: the Mixed page dealt the counts `counts()` chose must print as many pages as the same page with
// ONE lead shelf fewer - adding a shelf the packing said fits never adds a page. (Shelves as the lesson measures them: the lead
// 54 mm a shelf, 1 across; a 180.8 mm chart; a 60 mm row of 6 facts; a 19.7 mm strip.)
// Prints `ws-mix-pages: OK` / `FAIL`.
import path from 'path';
import { pathToFileURL } from 'url';

const ai = process.argv.indexOf('--root');
const ROOT = path.resolve(ai > -1 ? process.argv[ai + 1] : (process.env.MQ_ROOT || path.join(path.dirname(new URL(import.meta.url).pathname), '..', '..')));
// --only MIX-PAGES|MIX-DROP|MIX-SHELVES (comma list): judge only those (a backtest row on an old tree judges its own rule)
const oi = process.argv.indexOf('--only');
const ONLY = oi > -1 ? String(process.argv[oi + 1] || '').split(',') : null;
const on = (rule) => !ONLY || ONLY.includes(rule);
const imp = (rel) => import(pathToFileURL(path.join(ROOT, rel)).href);

const { ROLE_MODULES } = await imp('js/modules/sheet/roles/index.js');
const { renderCell, cellAnswerKey, cellFootprint, resolveCtx } = await imp('js/modules/sheet/index.js');
const mod = ROLE_MODULES['mixed-practice'];

const stackQ = (a, b, op = '+') => ({
    categoryId: 'addition', skillId: 'add_1k_regroup', skillLabel: 'Add within 1,000', answerType: 'number',
    text: `${a} ${op} ${b} = ?`, ans: op === '+' ? a + b : a - b, printFormat: 'vertical',
    cell: { template: 'stack', v: 1, payload: { operands: [a, b], op } },
});
const factQ = (a, b) => ({
    categoryId: 'multiplication', skillId: 'mult_facts', skillLabel: 'Multiplication facts', answerType: 'number',
    text: `${a} × ${b} = ?`, ans: a * b, printFormat: 'mult-facts-vertical', cell: { template: 'fact', v: 1, payload: { a, b, op: '×' } },
});
const subQ = (a, b) => Object.assign(stackQ(a, b, '-'), { categoryId: 'subtraction', skillId: 'sub_1k_regroup', skillLabel: 'Subtract within 1,000' });
const SKILLS = [
    { categoryId: 'multiplication', skillId: 'mult_facts', label: 'Multiplication facts', grade: 3, instructionKey: 'multiply', iCan: 'I Can multiply' },
    { categoryId: 'subtraction', skillId: 'sub_1k_regroup', label: 'Subtract within 1,000', grade: 3, instructionKey: 'subtract', iCan: 'I Can subtract within 1,000' },
    { categoryId: 'addition', skillId: 'add_1k_regroup', label: 'Add within 1,000', grade: 3, instructionKey: 'add', iCan: 'I Can add within 1,000' },
];
const H = [53, 179.8, 59];
const hostLike = (q, h, cols) => {
    const ans = String(q.ans);
    return {
        q, key: (() => { try { return cellAnswerKey(q); } catch (e) { return ans; } })(), template: q.cell.template, legacy: false,
        skill: `${q.categoryId}:${q.skillId}`, answerType: 'number', fclass: 'standard', cellCls: '', canShow: () => true,
        footprint: Object.assign({}, (() => { try { return cellFootprint(q, resolveCtx({ mode: 'print', size: 'L', look: 'ican' })); } catch (e) { return { wMm: 40, hMm: h }; } })(), { measure: false, maxCols: cols }),
        measured: Object.fromEntries([1, 2, 3, 4, 5, 6, 8, 10].map((c) => [c, { hMm: h, fits: c <= cols }])),
        render: (c, { shown, ink } = {}) => renderCell(q, Object.assign({}, c, shown !== undefined && shown !== null && shown !== '' && ink === 'trace' && String(shown) === ans ? { state: 'traced' } : {})),
    };
};
const pools = mod.sources(SKILLS.map((sk, i) => ({ categoryId: sk.categoryId, skillId: sk.skillId, weight: i ? 1 : 2.5 })), { earlier: () => [] });
const deal = (pool, n) => Array.from({ length: n }, (_, i) => {
    const pi = pools.indexOf(pool);
    const q = pi === 0 ? factQ(2 + i, 7) : pi === 1 ? subQ(500 + i * 11, 123 + i) : stackQ(111 + i * 7, 222 + i * 3);
    const it = hostLike(q, H[pi], pi === 2 ? 6 : 1);
    it.pool = pool.id;
    return it;
});
const inputOf = () => ({ items: [], skills: SKILLS, pools: pools.map((p) => ({ id: p.id, weight: p.weight || 1 })), ctx: { size: 'L', paper: 'A4' }, seed: 42, form: 'A', floors: {},
    leadHalf: true, lessonFit: true, latticeN: 6, stepStrip: '<div></div>', stepStripMm: 19.7 });
const input = inputOf();
const want = mod.counts(Object.fromEntries(pools.map((p) => [p.id, deal(p, 8)])), input);
const pagesWith = (w) => { const inp = inputOf(); inp.items = pools.flatMap((p) => deal(p, w[p.id] || 0)); return mod.plan(inp).pages.length; };
const lead = pools[0].id;
const got = pagesWith(want);
const fewer = want[lead] > 1 ? pagesWith(Object.assign({}, want, { [lead]: want[lead] - 1 })) : got;
console.log(`  root ${ROOT}: want ${JSON.stringify(want)}; lead ${want[lead]} shelves -> ${got} page(s); one shelf fewer -> ${fewer} page(s)`);
let bad = 0;
if (on('MIX-PAGES') && got > fewer) { console.log(`  FAIL MIX-PAGES: the shelf the packing added prints a page of its own (${fewer} -> ${got} pages)`); bad++; }

// MIX-DROP (lf-engine vocabfix, 2026-11-20; lf-placevalue vocab deploy blocker 1): a shelf that FITS is never dropped. packing()
// counted every shelf of a pool at the pool's tallest UNCAPPED shelf (shelf.h, the probe's tallest item), while plan() lays each
// shelf out at the height of the items IT holds, capped (layout.rowCapMm): add_wp_10 L lesson Mixed 14 -> 12 items (p5 45 %
// white), two_step_letter_equation M Mixed 6 -> 5. Judge, needing no new meta: the lesson's own (lead) pool still wants shelves
// (it weighs 2.5: the weight pass adds any shelf that fits, and leadHalf only adds lead shelves), has items left and the page has shelf room, yet dealt one lead item MORE, plan() lays
// that shelf out on the pages the chosen counts print - the packing dropped a shelf that fits. Shelves as the M lesson measures them: the lead 1
// across at 53.2 mm for the items dealt and 70 mm for a taller probe item (the probe's tallest sets shelf.h), partners 80 and
// 82 mm, a 7.5 mm strip. MIX-SHELVES: where the plan carries them, meta.packedPages / packedShelves equal the pages and shelves
// plan() lays out.
{
    const HB = [52.2, 79, 81];
    const leadH = (i) => (i >= 4 ? 69 : HB[0]);
    const dealB = (pool, n) => Array.from({ length: n }, (_, i) => {
        const pi = pools.indexOf(pool);
        const q = pi === 0 ? factQ(2 + i, 7) : pi === 1 ? subQ(500 + i * 11, 123 + i) : stackQ(111 + i * 7, 222 + i * 3);
        const it = hostLike(q, pi === 0 ? leadH(i) : HB[pi], 1);
        it.pool = pool.id;
        return it;
    });
    const inB = () => Object.assign(inputOf(), { ctx: { size: 'M', paper: 'A4' }, stepStrip: '<div></div>', stepStripMm: 19.7 });
    const wantB = mod.counts(Object.fromEntries(pools.map((p) => [p.id, dealB(p, 8)])), inB());
    const planB = (w) => { const inp = inB(); inp.items = pools.flatMap((p) => dealB(p, w[p.id] || 0)); return mod.plan(inp); };
    const pb = planB(wantB);
    const pagesB = pb.pages.length;
    const shelvesB = pools.reduce((a, p) => a + (wantB[p.id] || 0), 0);
    // (plan() re-packs the items it is given: dealt one lead item more, it lays that shelf out only when it fits)
    const pm = wantB[lead] < 8 ? planB(Object.assign({}, wantB, { [lead]: wantB[lead] + 1 })) : null;
    const moreLead = pm ? ((pm.meta || {}).achieved || {})[lead] || 0 : 0;
    console.log(`  MIX-DROP: want ${JSON.stringify(wantB)} -> ${pagesB} page(s); dealt one lead item more, plan() lays out ${moreLead} lead on ${pm ? pm.pages.length : '-'} page(s)`);
    if (on('MIX-DROP') && pm && shelvesB < 7 * pagesB && moreLead > wantB[lead] && pm.pages.length <= pagesB) { console.log(`  FAIL MIX-DROP: a lead shelf that fits was dropped (counts ${wantB[lead]} lead; plan() fits ${moreLead} on the same ${pagesB} page(s))`); bad++; }
    const meta = pb.meta || {};
    if (on('MIX-SHELVES') && Number.isFinite(meta.packedPages) && meta.packedPages !== pagesB) { console.log(`  FAIL MIX-SHELVES: packing counted ${meta.packedPages} page(s), plan() lays out ${pagesB}`); bad++; }
    if (on('MIX-SHELVES') && Number.isFinite(meta.packedShelves) && meta.packedShelves !== shelvesB) { console.log(`  FAIL MIX-SHELVES: packing counted ${meta.packedShelves} shelves, plan() lays out ${shelvesB}`); bad++; }
}
if (bad) { console.log('ws-mix-pages: FAIL'); process.exit(1); }
console.log('ws-mix-pages: OK');
