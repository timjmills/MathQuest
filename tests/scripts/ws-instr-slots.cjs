// ws-instr-slots - INSTR-SLOTS: a page's instruction and Steps match its slots (lane lf-algebra after patterns critic r3,
// R3-1 / R3-2 / R3-3 / R3-6 / R3-7; lead ruling 2026-11-20: general, on precritic's path for every lane's --skill run).
// The rules and the verb <-> slot vocabulary are in tests/lib/ws-instr-slots.cjs (KIND-UNNAMED, VERB-ABSENT, SCREEN-VERB,
// ONE-PLACE, SLOT-NAME). Each page is built through buildSheet (paper, pupil page) and read in the browser.
//
//   node tests/scripts/ws-instr-slots.cjs --skills cat:skill[,..] [--roles r1,..] [--size M,L] [--opts json] [--seed N]
//        [--rules KIND-UNNAMED,..] [--strict [--strict-skills cat:skill,..]] [--show N]
//   node tests/scripts/ws-instr-slots.cjs --self-test
// Default roles: independent, more-practice, guided, test, opener, pre-skill-check, lesson. Sizes M, L.
// REPORT by default (exit 0, last line "ws-instr-slots: REPORT ..."); --strict fails (exit 1) on a finding of a strict skill
// (--strict-skills, default every --skills skill). ws-precritic passes --strict for the run's own skills. ONE-PLACE on a
// Pre-skill check (the prerequisites' legacy print) is always a note.
// MQ_ROOT=<tree> serves another checkout (ws-backtest commit-pair rows).
const H = require('../lib/ws-harness.cjs');
const { instrSlotsInPage } = require('../lib/ws-instr-slots.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const TOOL = 'ws-instr-slots';
const ALL_RULES = ['KIND-UNNAMED', 'VERB-ABSENT', 'SCREEN-VERB', 'ONE-PLACE', 'SLOT-NAME'];
const RULES = list(arg('rules', ALL_RULES.join(',')));
const ROLES = list(arg('roles', 'independent,more-practice,guided,test,opener,pre-skill-check,lesson'));
const SIZES = list(arg('size', 'M,L'));
const SEED = Number(arg('seed', 4242));

const PLANTED = [
    // [name, html, rules expected to fire]
    ['circle over ticks', '<section data-ws-page="1"><div class="ws-instrline">Is the product even or odd? Circle one.</div><div class="ws-cell"><span data-ws-slot="answer" data-ws-shape="check"></span></div></section>', ['VERB-ABSENT', 'KIND-UNNAMED']],
    ['tick over ticks', '<section data-ws-page="1"><div class="ws-instrline">Read the pattern. Check the sentence that is true.</div><div class="ws-cell"><span data-ws-slot="answer" data-ws-shape="check"></span></div></section>', []],
    ['tiles never named', '<section data-ws-page="1"><div class="ws-instrline">Read the pattern. Check the sentence that is true.</div><div class="ws-cell"><span data-ws-slot="w1" data-ws-shape="box"></span><span data-ws-slot="answer" data-ws-shape="check"></span></div></section>', ['KIND-UNNAMED']],
    ['steps write over printed tiles', '<section data-ws-page="1"><div class="ws-band"><ol class="ws-steps"><li><span>Read the rule. Write the numbers.</span></li></ol></div><div class="ws-band"><div class="ws-strip"><b>Guided Practice:</b><span>Read the pattern. Check the sentence that is true.</span></div><div class="ws-cell"><span data-ws-slot="answer" data-ws-shape="check"></span></div></div></section>', ['VERB-ABSENT']],
    ['drag on paper', '<section data-ws-page="1"><div class="ws-cell"><div class="p-prompt">Drag the numbers in counting order.</div><span data-ws-shape="line" data-ws-slot="answer"></span></div><div class="ws-instrline">Write the numbers.</div></section>', ['SCREEN-VERB']],
    ['legacy doubled', '<section data-ws-page="1"><div class="ws-instrline">Write the answer.</div><div class="ws-cell"><div class="ws-legacy"><span class="slot">1.</span><div class="ws-legacy-answer"><span class="ws-zone">Answer:</span><span data-ws-shape="line" data-ws-slot="answer"></span></div></div></div></section>', ['ONE-PLACE']],
    ['term 10 unnamed', '<section data-ws-page="1"><div class="ws-instrline">Draw Term 4. Write how many it has.</div><div class="ws-cell"><div>Term 4</div><div data-ws-shape="draw" data-ws-slot="draw"></div><span data-ws-shape="box" data-ws-slot="n4"></span><span>Term 10 has</span><span data-ws-shape="box" data-ws-slot="answer"></span></div></section>', ['SLOT-NAME']],
    ['term 10 named', '<section data-ws-page="1"><div class="ws-instrline">Draw Term 4. Write how many Term 4 and Term 10 have.</div><div class="ws-cell"><div>Term 4</div><div data-ws-shape="draw" data-ws-slot="draw"></div><span data-ws-shape="box" data-ws-slot="n4"></span><span>Term 10 has</span><span data-ws-shape="box" data-ws-slot="answer"></span></div></section>', []],
    ['fact page Add.', '<section data-ws-page="1"><div class="ws-instrline" data-ws-instruction="add">Add.</div><div class="ws-cell"><span data-ws-shape="open" data-ws-slot="ans"></span></div></section>', []],
];

(async () => {
    const app = await H.open({});
    const page = app.page;
    const fnSrc = instrSlotsInPage.toString();
    const run = (html) => page.evaluate((src, h) => { const f = (0, eval)(`(${src})`); return f(h); }, fnSrc, html);
    if (has('self-test')) {
        let bad = 0;
        for (const [name, html, want] of PLANTED) {
            const got = [...new Set((await run(html)).map((f) => f.rule))].sort();
            const ok = JSON.stringify(got) === JSON.stringify([...want].sort());
            if (!ok) bad++;
            console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: ${got.join(', ') || 'quiet'}${ok ? '' : ` (want ${want.join(', ') || 'quiet'})`}`);
        }
        await app.close();
        console.log(bad ? `${TOOL} --self-test: FAIL (${bad})` : `${TOOL} --self-test: OK (${PLANTED.length} planted pages)`);
        process.exit(bad ? 1 : 0);
    }
    const skills = list(arg('skills', arg('skill', '')));
    if (!skills.length) { await app.close(); console.log(`usage: ${TOOL}.cjs --skills cat:skill[,..] [--roles ..] [--size M,L] [--strict] | --self-test`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
    const strict = has('strict') ? new Set(list(arg('strict-skills', skills.join(',')))) : new Set();
    const opts = arg('opts', null) ? JSON.parse(arg('opts')) : null;
    const findings = [];
    let pages = 0;
    const t0 = Date.now();
    for (const k of skills) for (const role of ROLES) for (const size of SIZES) {
        const [cat, id] = k.split(':');
        const built = await page.evaluate(async ({ cat, id, role, size, seed, opts }) => {
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [Object.assign({ categoryId: cat, skillId: id }, opts ? { opts } : {})], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' });
                return { html: r.pupilHtml, pages: r.pageCount };
            } catch (e) { return e && e.unsupported ? { unsupported: String(e.message) } : { error: String((e && e.message) || e).slice(0, 200) }; }
        }, { cat, id, role, size, seed: SEED, opts });
        const tag = `${k} ${role} ${size}${opts ? ' ' + JSON.stringify(opts) : ''}`;
        if (built.unsupported) { console.log(`  n/a  ${tag}: ${built.unsupported.slice(0, 90)}`); continue; }
        if (built.error) { console.log(`  n/a  ${tag}: buildSheet threw ${built.error.slice(0, 90)}`); continue; }
        pages += built.pages || 1;
        const here = (await run(built.html)).filter((f) => RULES.includes(f.rule));
        // one line per distinct finding (the same instruction repeats on every page)
        const uniq = [...new Map(here.map((f) => [`${f.rule} ${f.msg}`, f])).values()];
        // (ONE-PLACE on a Pre-skill check reads the PREREQUISITE skills' legacy print - print-generate.js and the legacy adapter's
        // stamped Answer line, owner the legacy path / lf-roles: reported, never failing the run's own skill)
        for (const f of uniq) findings.push(Object.assign({ tag, strict: strict.has(k) && !(f.rule === 'ONE-PLACE' && role === 'pre-skill-check') }, f));
        const hardHere = findings.slice(-uniq.length || findings.length).filter((f) => uniq.length && f.strict).length;
        console.log(`  ${uniq.length ? (hardHere ? 'FAIL' : 'note') : 'ok  '} ${tag}: ${built.pages}p${uniq.length ? ` - ${[...new Set(uniq.map((f) => f.rule))].join(', ')} (${uniq.length})` : ''}`);
    }
    await app.close();
    const show = Number(arg('show', 60));
    findings.slice(0, show).forEach((f) => console.log(`  ${f.strict ? 'FAIL' : 'note'} ${f.rule} ${f.tag} p${f.page}: ${f.msg}`));
    const by = {};
    for (const f of findings) by[f.rule] = (by[f.rule] || 0) + 1;
    const hard = findings.filter((f) => f.strict);
    const secs = Math.round((Date.now() - t0) / 1000);
    const sum = Object.entries(by).map(([r, n]) => `${r} ${n}`).join(', ');
    if (hard.length) console.log(`${TOOL}: FAIL - ${hard.length} finding(s) on strict skills (${sum}) on ${pages} page(s), ${secs}s`);
    else if (findings.length) console.log(`${TOOL}: REPORT - ${findings.length} finding(s) (${sum}), none strict; ${pages} page(s), ${secs}s`);
    else console.log(`${TOOL}: OK (${pages} page(s), no finding; ${secs}s)`);
    process.exit(hard.length ? 1 : 0);
})().catch((e) => { console.error(e); console.log(`${TOOL}: FAIL - ${e.message}`); process.exit(1); });
