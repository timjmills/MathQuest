// ws-title-code — the page-title option travels with the share code (lf-roles, owner request 2026-11-13).
//
//   node tests/scripts/ws-title-code.cjs                       # the checks below
//   node tests/scripts/ws-title-code.cjs --write-old <file>    # pin codes made by THIS tree (run on origin/master) and their
//                                                              # decoded records: the "old codes" fixture
//   node tests/scripts/ws-title-code.cjs --old <file>          # the old-codes fixture (default
//                                                              # tests/fixtures/precritic/frame-title/old-codes.json)
//
// TITLE-CODE-RT    a quick print (simple print's share code QP1, simple-print.js encodeQuickPrint / decodeQuickPrint) with
//                  a custom title and placement decodes to the same title and placement; so does a link (?qp=)
// TITLE-CODE-OLD   every pinned old code decodes exactly as it did on master, with the title defaults (no custom title,
//                  placement below), and a record at the defaults encodes to the SAME code as master (the field is appended
//                  only when set, so no existing code changes)
// TITLE-CODE-REQ   the decoded title reaches the print request: the simple print sends it as header.titleText / titlePos
//
// Prints `ws-title-code: OK` / `FAIL (n)`.
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const ROOT = path.resolve(__dirname, '..', '..');
const OLD = arg('old', path.join(ROOT, 'tests/fixtures/precritic/frame-title/old-codes.json'));
const WRITE_OLD = arg('write-old', null);

// the records pinned as old codes: a plain one, one with options and amounts, one with every print field set
const RECS = [
    { name: 'Facts', skills: [{ categoryId: 'addition', skillId: 'add_facts' }], print: { how: 'pages', n: 1, sets: 1, size: 'M', cols: 'auto', colsMode: 'aim', key: true, arrange: 'sections' } },
    { name: 'Two skills', skills: [{ categoryId: 'subtraction', skillId: 'sub_100_no_regroup', amt: '60%' }, { categoryId: 'addition', skillId: 'add_facts', opts: { band: 10 } }], print: { how: 'problems', n: 12, sets: 2, size: 'L', cols: 3, colsMode: 'exact', key: false, arrange: 'mixed' } },
];

(async () => {
    const fails = [];
    const app = await open({ seed: 1, lock: 'ws-title-code' });
    try {
        const r = await app.page.evaluate(async ({ RECS, write, old }) => {
            const sp = await import('./js/modules/simple-print.js');
            const out = { fails: [] };
            const f = (s) => out.fails.push(s);
            const titleOf = (p) => ({ text: (p && typeof p.title === 'string') ? p.title : '', pos: (p && p.titlePos === 'above') ? 'above' : 'below' });
            if (write) { out.old = RECS.map((rec) => { const code = sp.encodeQuickPrint(rec); return { code, decoded: sp.decodeQuickPrint(code) }; }); return out; }
            // TITLE-CODE-OLD
            for (const o of old) {
                const d = sp.decodeQuickPrint(o.code);
                if (JSON.stringify(d) !== JSON.stringify(o.decoded)) f(`TITLE-CODE-OLD ${o.code.slice(0, 24)}…: decodes differently from master (${JSON.stringify(d).slice(0, 160)})`);
                const t = titleOf(d && d.print);
                if (t.text !== '' || t.pos !== 'below') f(`TITLE-CODE-OLD ${o.code.slice(0, 24)}…: an old code decodes with a title ${JSON.stringify(t)} (the defaults are no title, below)`);
                if (d && sp.encodeQuickPrint(d) !== o.code) f(`TITLE-CODE-OLD ${o.code.slice(0, 24)}…: re-encoding the decoded record gives a different code (a default must add nothing)`);
            }
            // TITLE-CODE-RT
            const cases = [['My own title', 'above'], ['I Can add 10 to a number (a long one that wraps to two lines on the page, still fine)', 'below'], ['Fractions & “quotes” é', 'above']];
            for (const [text, pos] of cases) {
                const rec = { name: 'T', skills: [{ categoryId: 'addition', skillId: 'add_facts' }], print: Object.assign({}, RECS[0].print, { title: text, titlePos: pos }) };
                const code = sp.encodeQuickPrint(rec);
                const d = sp.decodeQuickPrint(code);
                const t = titleOf(d && d.print);
                if (t.text !== text || t.pos !== pos) f(`TITLE-CODE-RT "${text}" ${pos}: decodes as ${JSON.stringify(t)}`);
                const dl = sp.decodeQuickPrint(`https://example.org/index.html?qp=${code}&x=1`);
                const tl = titleOf(dl && dl.print);
                if (tl.text !== text || tl.pos !== pos) f(`TITLE-CODE-RT "${text}" ${pos} (link): decodes as ${JSON.stringify(tl)}`);
                // TITLE-CODE-REQ: the request the simple print would send for it
                if (typeof sp.titleHeaderOf !== 'function') { f('TITLE-CODE-REQ: simple-print.js exports no titleHeaderOf(print) (the request header the dialog sends)'); continue; }
                const h = sp.titleHeaderOf(d.print);
                if (h.titleText !== text || (h.titlePos || 'below') !== pos) f(`TITLE-CODE-REQ "${text}" ${pos}: the request header is ${JSON.stringify(h)}`);
            }
            if (typeof sp.titleHeaderOf === 'function') {
                const h0 = sp.titleHeaderOf(sp.decodeQuickPrint(old[0].code).print);
                if (Object.keys(h0).length) f(`TITLE-CODE-REQ: an old code's request carries title fields ${JSON.stringify(h0)} (it must carry none: byte-identical pages)`);
            }
            return out;
        }, { RECS, write: !!WRITE_OLD, old: WRITE_OLD ? [] : JSON.parse(fs.readFileSync(OLD, 'utf8')).old });
        if (WRITE_OLD) {
            fs.mkdirSync(path.dirname(WRITE_OLD), { recursive: true });
            fs.writeFileSync(WRITE_OLD, JSON.stringify({ note: 'QP1 codes made by origin/master before the title option (ws-title-code --write-old)', old: r.old }, null, 1) + '\n');
            console.log(`ws-title-code: OK (wrote ${r.old.length} old codes to ${path.relative(ROOT, WRITE_OLD)})`);
            return;
        }
        fails.push(...r.fails);
        for (const p of app.problems.slice(0, 5)) fails.push(`console: ${p.type} ${p.text}`);
    } finally { await app.close(); }
    for (const f of fails) console.log(`  ${f}`);
    console.log(fails.length ? `ws-title-code: FAIL (${fails.length})` : 'ws-title-code: OK (old codes decode unchanged with the defaults; title + placement round-trip through the code, the link and the request)');
    process.exit(fails.length ? 1 : 0);
})().catch((e) => { console.log(`ws-title-code: FAIL (${e && e.stack || e})`); process.exit(1); });
