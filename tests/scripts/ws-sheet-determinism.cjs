// Seeded sheets are reproducible (CLAUDE.md: generateQuestionFor with a seed makes a page
// reproducible): the same skill + seed + size gives byte-identical pupil and key HTML whether it is
// built first in a fresh page or after other skills (the full lint sweep's order).
//   node tests/scripts/ws-sheet-determinism.cjs [--skills c:s,...] [--before c:s,...] [--size L]
const { open } = require('../lib/ws-harness.cjs');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SKILLS = arg('skills', 'multiplication:mixed_multiplication,subtraction:mixed_subtraction,counting_mixed:counting_all,composing:mixed_composing,addition:add_sub_10s,division:missing_mult_div').split(',');
const BEFORE = arg('before', 'addition:mixed_addition,measurement:mixed_time,multiplication:dot_array_mult,counting:mixed_counting').split(',').filter(Boolean);
const SIZES = arg('size', 'S,L').split(',');
const ITEMS = process.argv.includes('--items');
const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const build = (page, k, size) => page.evaluate(async ({ k, size, seed, ITEMS }) => {
    window.__mqDetItems = ITEMS;
    const [categoryId, skillId] = k.split(':');
    const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId, skillId }] }], size, look: 'ican', key: true, seed });
    if (window.__mqDetItems) return r.items.map((it) => it.template + ':' + String(it.text).slice(0, 40)).join(' | ');
    return r.pupilHtml + '\n<!--key-->\n' + r.keyHtml;
}, { k, size, ITEMS, seed: hash(k.replace(':', '__') + ':print') });
(async () => {
    let fails = 0;
    for (const size of SIZES) for (const k of SKILLS) {
        const a = await open({ seed: 1 });
        const alone = await build(a.page, k, size);
        await a.close();
        const b = await open({ seed: 1 });
        for (const o of BEFORE) await build(b.page, o, size);
        const after = await build(b.page, k, size);
        const again = await build(b.page, k, size);
        await b.close();
        const ok = alone === after && after === again;
        if (!ok) fails++;
        console.log(`${ok ? 'ok  ' : 'FAIL'} ${k} ${size}${ok ? '' : ` (alone ${hash(alone)}, after others ${hash(after)}, again ${hash(again)})`}`);
        if (!ok && ITEMS) console.log(`  alone: ${alone}\n  after: ${after}`);
    }
    console.log(fails ? `ws-sheet-determinism: FAIL (${fails})` : 'ws-sheet-determinism: OK');
    process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
