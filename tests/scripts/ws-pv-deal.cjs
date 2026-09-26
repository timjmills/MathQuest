// ws-pv-deal.cjs — answers dealt from the seed, never from the item's position (LESSONS L10).
//
// Critic pv-r1: number_line_scales dealt 70, 40, 20, 80, 65 on every page and every seed; item b of
// every rounding page was the halfway one and item d the round-up; a rounding table's blank column
// and row cycled; decimal compare answered > > < > > = in a loop. This gate generates 30 items of
// every place-value and rounding skill (and the option values that change what is dealt) at TWO
// page seeds, the way a printed page deals them (item i with seed base + i), and fails when
//   cycle      the answers repeat with a period of 2 to 6 across the 30 items,
//   one        every answer is the same (a skill whose answer is a sign or a choice excepted when
//              its value set is that small: then no value may take more than 80 %),
//   position   the item KIND (pv.deal / pv.kind + scope) sits at the same positions on both seeds,
//   same-page  both seeds give the very same answers (test = practice).
//
// And PER PAGE (critic pv-r3: no cycle, yet 7 of 8 items on one page rounded up), on every page of
// 8 and of 12 the 30 items hold:
//   direction  a rounding page rounds up and down alike: neither side over 75 % of the page,
//   lead       no leading digit on more than 40 % of a page (the numbers spread over the band),
//   sign       a compare page: no sign on more than 60 % of it,
//   distinct   a number-line reading page: at least 75 % different answers.
//
//   node tests/scripts/ws-pv-deal.cjs
//   node tests/scripts/ws-pv-deal.cjs --skills number_sense:number_line_scales
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const N = 30;
const SEEDS = [1000, 777777];
const DEFAULT = [
    ['number_sense', 'number_line_scales', {}], ['number_sense', 'number_line_scales', { task: 'mark' }],
    ['number_sense', 'number_line_scales', { decimals: 1 }],
    ...['nearest_10', 'nearest_100', 'nearest_1000', 'nearest_10000', 'nearest_100000', 'nearest_million'].map((s) => ['number_sense', s, {}]),
    ['number_sense', 'nearest_1000', { support: ['bare'] }], ['placevalue', 'compare', { decimals: 3 }],
    ['number_sense', 'nearest_100', { support: ['bare'] }],
    ['number_sense', 'rounding_table', {}], ['number_sense', 'rounding_table', { places: [10, 100, 1000] }],
    ['number_sense', 'rounding_table', { blank: 'column' }], ['number_sense', 'rounding_table', { blank: 'row' }],
    ['number_sense', 'rounding_visual', {}], ['number_sense', 'round_nl_thousands', {}],
    ['number_sense', 'round_nl_hundred_thousands', {}],
    ['placevalue', 'compare', {}], ['placevalue', 'compare', { decimals: 2 }], ['placevalue', 'value', {}],
    ['placevalue', 'value', { decimals: 2 }], ['placevalue', 'expand', {}], ['placevalue', 'place_value_disks', {}],
    ['placevalue', 'place_value_disks', { decimals: 2 }], ['placevalue', 'pv_disks_build', {}], ['placevalue', 'identify', {}],
    ['placevalue', 'more_less_10', {}], ['placevalue', 'place_value_10x', {}],
];
const only = (arg('skills', '') || '').split(',').filter(Boolean);
const LIST = only.length ? DEFAULT.filter(([c, s]) => only.includes(`${c}:${s}`)) : DEFAULT;

(async () => {
    const app = await open({ seed: 1 });
    const fails = [];
    for (const [cat, skill, opts] of LIST) {
        const runs = await app.page.evaluate((cat, skill, opts, N, SEEDS) => SEEDS.map((base) => {
            const out = [];
            for (let i = 0; i < N; i++) {
                let q = null;
                try { q = window.generateQuestionFor({ category: cat, skill, seed: base + i, itemIndex: i, opts }); } catch (e) { q = null; }
                if (!q) { out.push({ ans: '(none)', kind: '' }); continue; }
                const pv = q.pv || {};
                const ans = typeof q.ans === 'object' ? JSON.stringify(q.ans) : String(q.ans);
                // the page facts the balance checks read: a rounding's direction, the number's
                // leading digit, a comparison's sign
                const n = Number(pv.n);
                const dir = pv.kind === 'round' && pv.place && Number.isFinite(n) ? (Math.floor((n + pv.place / 2) / pv.place) * pv.place > n ? 'up' : 'down') : '';
                const lead = pv.kind === 'round' && Number.isFinite(n) ? String(Math.trunc(n))[0] : '';
                out.push({ ans, dir, lead, sign: pv.kind === 'compare' ? ans : '', read: pv.kind === 'scale' && pv.task === 'read',
                    kind: [pv.deal, pv.half ? 'half' : '', pv.kind === 'table' ? JSON.stringify(pv.cells && pv.cells[0]) : ''].join('|') });
            }
            return out;
        }), cat, skill, opts, N, SEEDS);
        const label = `${cat}:${skill}${Object.keys(opts).length ? ' ' + JSON.stringify(opts) : ''}`;
        const bad = [];
        runs.forEach((run, r) => {
            const a = run.map((x) => x.ans);
            for (let p = 2; p <= 6; p++) {
                if (a.every((v, i) => i + p >= a.length || v === a[i + p]) && new Set(a).size > 1) { bad.push(`cycle: seed ${r + 1} answers repeat every ${p}`); break; }
            }
            const counts = {};
            a.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
            const top = Math.max(...Object.values(counts));
            if (Object.keys(counts).length === 1) bad.push(`one: seed ${r + 1} every answer is ${a[0]}`);
            else if (Object.keys(counts).length <= 3 && top / a.length > 0.8) bad.push(`one: seed ${r + 1} one answer takes ${Math.round(100 * top / a.length)} %`);
        });
        // per page: pages of 8 and of 12 from each seed's run
        runs.forEach((run, r) => {
            for (const size of [8, 12]) {
                for (let st = 0; st + size <= run.length; st += size) {
                    const pg = run.slice(st, st + size);
                    const tag = `seed ${r + 1} page of ${size} at ${st + 1}`;
                    const share = (key) => { const c = {}; pg.forEach((x) => { if (x[key]) c[x[key]] = (c[x[key]] || 0) + 1; }); const t = Object.values(c); return t.length ? { top: Math.max(...t), n: t.reduce((a2, b2) => a2 + b2, 0), c } : null; };
                    const d = share('dir');
                    if (d && d.n === size && d.top > 0.75 * size) { bad.push(`direction: ${tag} ${JSON.stringify(d.c)}`); break; }
                    const l = share('lead');
                    if (l && l.n === size && l.top > 0.4 * size) { bad.push(`lead: ${tag} ${JSON.stringify(l.c)}`); break; }
                    const g = share('sign');
                    if (g && g.n === size && g.top > Math.ceil(0.6 * size)) { bad.push(`sign: ${tag} ${JSON.stringify(g.c)}`); break; }
                    // (a line with fewer places than that - tenths from 0 to 1 - holds every one it has)
                    const most = new Set(run.map((x) => x.ans)).size;
                    if (pg.every((x) => x.read) && new Set(pg.map((x) => x.ans)).size < Math.min(0.75 * size, most)) { bad.push(`distinct: ${tag} ${new Set(pg.map((x) => x.ans)).size} different`); break; }
                }
            }
        });
        const k1 = runs[0].map((x) => x.kind), k2 = runs[1].map((x) => x.kind);
        if (new Set(k1).size > 1 && k1.join() === k2.join()) bad.push('position: the item kinds sit at the same positions on both seeds');
        if (runs[0].map((x) => x.ans).join() === runs[1].map((x) => x.ans).join()) bad.push('same-page: both seeds deal the same answers');
        console.log(`${bad.length ? 'FAIL' : 'ok  '} ${label}${bad.length ? '  ' + bad.join('; ') : ''}`);
        if (bad.length) fails.push(label);
    }
    await app.close();
    console.log(`ws-pv-deal: ${fails.length ? 'FAIL' : 'OK'} (${LIST.length} skill settings, ${N} items x ${SEEDS.length} seeds${fails.length ? `, ${fails.length} failing` : ''})`);
    process.exit(fails.length ? 1 : 0);
})();
