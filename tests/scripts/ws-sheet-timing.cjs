// How long a mixed-pool sheet takes to build, and how long it blocks the page (critic r7 D7-2: a
// mixed_multiplication S page built as ONE 56.5 s main-thread task, and the teacher print screen
// rebuilds on every option change). buildSheet is called with the teacher print screen's request
// shape (teacher-print.js requestFor: More Practice asks for letters A and B) for each pool, size,
// role and seed. Recorded per build: the wall time, the longest stretch the page could not answer
// (PerformanceObserver 'longtask', and a 20 ms heartbeat's longest gap), and whether the pool's
// fill found a deal that passes its printed-page check or kept its best (`out.pool`).
// On the first seed of every case the build is also repeated (the same request prints the same
// page) and, for More Practice, letter B is built alone (PT-MPR-2: Practice B reprints the same
// whatever else prints with it).
//
//   node tests/scripts/ws-sheet-timing.cjs [--skills c:s,...] [--size S,L] [--roles independent,more-practice]
//                                          [--seeds 20 | --seed-list 1,2,3] [--p90 5000] [--max 10000] [--task 0] [--verbose]
//
// FAILS when, for any pool x size x role, the p90 build exceeds --p90 ms or any build exceeds --max
// ms, when a repeat or a lone letter differs, and (--task N) when a stretch exceeds N ms (0 = report).
const { open } = require('../lib/ws-harness.cjs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SKILLS = arg('skills', 'multiplication:mixed_multiplication,addition:mixed_addition,subtraction:mixed_subtraction,composing:mixed_composing,counting_mixed:counting_all').split(',').filter(Boolean);
const SIZES = arg('size', 'S,L').split(',').filter(Boolean);
const ROLES = arg('roles', 'independent,more-practice').split(',').filter(Boolean);
const SEEDS = arg('seed-list', '') ? arg('seed-list', '').split(',').map(Number) : Array.from({ length: Number(arg('seeds', 20)) }, (_, i) => i + 1);
const P90 = Number(arg('p90', 5000));
const MAX = Number(arg('max', 10000));
const TASK = Number(arg('task', 0));
const VERBOSE = process.argv.includes('--verbose');

const quant = (xs, q) => { const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.ceil(q * s.length) - 1))]; };
const fmt = (ms) => (ms / 1000).toFixed(2) + ' s';

const build = (page, a) => page.evaluate(async ({ categoryId, skillId, size, role, seed, letters }) => {
    const req = {
        role,
        sections: [{ skills: [{ categoryId, skillId, opts: {} }], columns: 'auto', pages: role === 'independent' ? 1 : undefined }],
        letters: role === 'more-practice' ? letters : undefined,
        size, look: 'auto', paper: 'A4', key: true, seed,
        header: { name: true, date: true, score: true, title: true },
    };
    const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    // let any earlier task finish and its long-task entry land first
    await new Promise((res) => setTimeout(res, 0));
    let last = performance.now(), gap = 0;
    const beat = setInterval(() => { const t = performance.now(); gap = Math.max(gap, t - last); last = t; }, 20);
    const t0 = performance.now();
    const out = await window.buildSheet(req);
    const t1 = performance.now();
    gap = Math.max(gap, t1 - last);
    clearInterval(beat);
    // long-task entries are delivered after their task ends
    await new Promise((res) => setTimeout(res, 60));
    const long = window.__mqLong ? window.__mqLong.filter((e) => e.start + e.dur > t0 && e.start < t1) : [];
    return {
        ms: t1 - t0, task: Math.max(gap, long.reduce((m, e) => Math.max(m, e.dur), 0)), pages: out.pageCount, items: out.items.length,
        stats: out.stats || null,
        pool: out.pool ? [].concat(out.pool).map((p) => (p.passed ? 'passed' : 'KEPT-BEST') + '@' + p.deal).join(' ') : '',
        kept: out.pool ? [].concat(out.pool).filter((p) => !p.passed).length : 0,
        hash: hash(out.pupilHtml + '\n' + out.keyHtml),
        byLetter: out.items.reduce((m, it) => { const L = it.letter || '-'; (m[L] = m[L] || []).push(`${it.template}:${it.text}`); return m; }, {}),
    };
}, a);

(async () => {
    const h = await open({ seed: 1 });
    let fails = 0;
    try {
        await h.page.evaluate(() => {
            window.__mqLong = [];
            try {
                new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__mqLong.push({ start: e.startTime, dur: e.duration }); })
                    .observe({ type: 'longtask', buffered: true });
            } catch (e) { window.__mqLong = null; }
        });
        for (const role of ROLES) for (const size of SIZES) for (const k of SKILLS) {
            const [categoryId, skillId] = k.split(':');
            const times = [], tasks = [];
            let kept = 0;
            const notes = [];
            for (const [si, seed] of SEEDS.entries()) {
                const a = { categoryId, skillId, size, role, seed, letters: ['A', 'B'] };
                const r = await build(h.page, a);
                times.push(r.ms);
                tasks.push(r.task);
                kept += r.kept;
                if (VERBOSE) console.log(`    ${k} ${size} ${role} seed ${seed}: ${fmt(r.ms)}, longest task ${fmt(r.task)}, ${r.items} items on ${r.pages} page(s)${r.stats ? `, ${r.stats.deals} deals / ${r.stats.layouts} layouts` : ''}${r.pool ? `, pool ${r.pool}` : ''}`);
                if (si === 0) {
                    const again = await build(h.page, a);
                    if (again.hash !== r.hash) { fails++; notes.push(`seed ${seed}: the same request printed a different sheet`); }
                    if (role === 'more-practice') {
                        const b = await build(h.page, Object.assign({}, a, { letters: ['B'] }));
                        if (JSON.stringify(b.byLetter.B || []) !== JSON.stringify(r.byLetter.B || [])) { fails++; notes.push(`seed ${seed}: Practice B alone differs from Practice B printed after A`); }
                    }
                }
            }
            const med = quant(times, 0.5), p90 = quant(times, 0.9), max = Math.max(...times), task = Math.max(...tasks);
            const bad = p90 > P90 || max > MAX || (TASK > 0 && task > TASK) || notes.length;
            if (p90 > P90 || max > MAX || (TASK > 0 && task > TASK)) fails++;
            console.log(`${bad ? 'FAIL' : 'ok  '} ${k} ${size} ${role}: median ${fmt(med)}, p90 ${fmt(p90)}, max ${fmt(max)}, longest task ${fmt(task)}, ${kept} page(s) kept without a passing deal (${SEEDS.length} seeds)${notes.length ? ' - ' + notes.join('; ') : ''}`);
        }
    } finally {
        await h.close();
    }
    console.log(fails ? `ws-sheet-timing: FAIL (${fails})` : 'ws-sheet-timing: OK');
    process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
