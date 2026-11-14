// ws-tof-stem - TOF-STEM (lf-ops critic-cbt-r2 E1, lead 2026-11-14): a True or False? frame that restates the problem as an
// equation ("a x b = ____") must have an answer of that shape - ONE number equal to a op b. count_by_tables printed the false
// statement "3 x 12 = 12, 18, 24, 30, 36" on the pupil page and the key (true-false.js used the operand stem whenever
// operandsOf found two operands). Read from the rendered KEY: each frame's stem text and its filled slot(s).
//
//   node tests/scripts/ws-tof-stem.cjs [--skills cat:skill,..] [--sizes M] [--seeds 7,11,23]   # default: every live skill
// Last line `ws-tof-stem: OK (...)` / `FAIL - n finding(s)`; exit 1 on FAIL. MQ_ROOT=<tree> measures another checkout.
const H = require('../lib/ws-harness.cjs');
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const SIZES = list(arg('sizes', 'M'));
const SEEDS = list(arg('seeds', '7,11,23')).map(Number);
(async () => {
    const app = await H.open({});
    const out = await app.page.evaluate(async ({ only, SIZES, SEEDS }) => {
        const S = window.SKILLS || {};
        const skills = only.length ? only : Object.entries(S).flatMap(([c, arr]) => (Array.isArray(arr) ? arr : []).filter((s) => s && s.v && !s.retired).map((s) => `${c}:${s.v}`));
        const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '-': (a, b) => a - b, '×': (a, b) => a * b, 'x': (a, b) => a * b, '÷': (a, b) => a / b };
        const bad = [], seen = { frames: 0, eq: 0, skills: 0, na: 0 };
        for (const k of [...new Set(skills)]) {
            const [cat, id] = k.split(':'); let any = false;
            for (const size of SIZES) for (const seed of SEEDS) {
                let r; try { r = await window.buildSheet({ role: 'true-false', sections: [{ skills: [{ categoryId: cat, skillId: id }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' }); } catch (e) { seen.na++; continue; }
                const d = document.createElement('div'); d.innerHTML = r.keyHtml || '';
                for (const tf of d.querySelectorAll('.mq-tf')) {
                    const kids = [...tf.children]; const fr = kids[kids.length - 1];
                    if (!fr || fr.classList.contains('mq-judge-work') || fr.querySelector('.mq-checkline')) continue;
                    seen.frames++; any = true;
                    const txt = fr.textContent.replace(/\s+/g, ' ').trim();
                    const m = /^(-?[\d,.]+)\s*([+−\-×x÷])\s*(-?[\d,.]+)\s*=\s*(.*?)\.?$/.exec(txt);
                    if (!m) continue;
                    seen.eq++;
                    const num = (s) => Number(String(s).replace(/,/g, ''));
                    const want = OPS[m[2]](num(m[1]), num(m[3]));
                    const rhs = m[4].trim();
                    const isList = fr.classList.contains('mq-framelist') || /,\s*\S/.test(rhs) || /^,/.test(rhs);
                    if (isList) { bad.push(`${k} ${size} seed ${seed}: "${m[1]} ${m[2]} ${m[3]} =" stem over a list answer ("${txt.slice(0, 60)}")`); continue; }
                    if (rhs && Number.isFinite(num(rhs)) && Math.abs(num(rhs) - want) > 1e-9) bad.push(`${k} ${size} seed ${seed}: "${txt}" is false (${m[1]} ${m[2]} ${m[3]} = ${want})`);
                    else if (rhs && !Number.isFinite(num(rhs))) bad.push(`${k} ${size} seed ${seed}: "${txt}" - an equation stem over a non-number answer`);
                }
            }
            if (any) seen.skills++;
        }
        return { bad, seen, total: skills.length };
    }, { only: list(arg('skills', '')), SIZES, SEEDS });
    await app.close();
    const skillsHit = [...new Set(out.bad.map((b) => b.split(' ')[0]))];
    for (const b of out.bad.slice(0, 60)) console.log('  FAIL ' + b);
    if (out.bad.length > 60) console.log(`  ... ${out.bad.length - 60} more`);
    if (skillsHit.length) console.log(`  skills hit (${skillsHit.length}): ${skillsHit.join(', ')}`);
    console.log(out.bad.length ? `ws-tof-stem: FAIL - ${out.bad.length} finding(s) in ${skillsHit.length} skill(s)` : `ws-tof-stem: OK (${out.total} skills, ${out.seen.skills} with frames, ${out.seen.frames} frames, ${out.seen.eq} equation stems)`);
    process.exit(out.bad.length ? 1 : 0);
})();
