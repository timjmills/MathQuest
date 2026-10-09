// Wave 5.2 lane test: the custom number line at the top of the page (design/MASTER_PLAN.md 5.2).
//
//   node tests/scripts/support-numberline.cjs            the gate
//   node tests/scripts/support-numberline.cjs --shots    also write the proof images to
//                                                        tests/compliance/shots/support-numberline/ (git-ignored)
//
// Checks (in the real app):
//   1. OFFERED where it fits: every skill numberLineFits() names offers the seven nl* controls in
//      one disclosure (never among the resting controls), and a skill that does not fit offers none.
//   2. SHARE CODES: the option round-trips through the option payload and a skill code, signed and
//      decimal ends included (−10, 2.5), and a code with every option at its default is unchanged.
//   3. COVERAGE: for the sampled skills, buildSheet's line covers every number of every item on the
//      page (Auto ends), and a teacher range that misses them warns (sheet note + panel warning).
//   4. THE PAGE FITS: the band prints on every pupil page AND every key page, under the header, and
//      no page body overflows (no split cell); the line takes the live width at S and at L.
//   5. SCREEN: the line mounts above the practice card and above the online worksheet when the
//      option is on, and not otherwise; the quiz draws none.
// Prints `support-numberline: OK` or `support-numberline: FAIL` and exits non-zero on failure.
const fs = require('fs');
const path = require('path');
const { ROOT, open, waitFor, hideOverlays } = require('../lib/ws-harness.cjs');

const SHOTS = process.argv.includes('--shots');
const SHOT_DIR = path.join(ROOT, 'tests', 'compliance', 'shots', 'support-numberline');
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const log = (...a) => console.log(...a);

const SAMPLES = [
    { id: 'add_facts', cat: 'addition', skill: 'add_facts', opts: { nlOn: true } },
    { id: 'add_100', cat: 'addition', skill: 'add_100_mixed', opts: { nlOn: true } },
    { id: 'frac_quarters', cat: 'fractions', skill: 'compare', opts: { nlOn: true, nlFrom: 0, nlTo: 2, nlStep: '1/4' } },
    { id: 'dec_tenths', cat: 'decimals', skill: 'add_decimal', opts: { nlOn: true, nlStep: '0.1' } },
    { id: 'int_10', cat: 'integers', skill: 'integer_nl_drag', opts: { nlOn: true, nlFrom: -10, nlTo: 10 } },
];

(async () => {
    const h = await open();
    const { page } = h;
    if (SHOTS) fs.mkdirSync(SHOT_DIR, { recursive: true });
    try {
        await waitFor(page, () => typeof window.buildSheet === 'function' && typeof window.encodeOptionPayload === 'function', 30000, 'kit');

        /* 1 + 2: offered, resting, codec */
        const u = await page.evaluate(async () => {
            const W = window;
            const out = { fails: [], offered: 0, skills: 0 };
            const fail = (m) => { if (out.fails.length < 40) out.fails.push(m); };
            const mod = await import('./js/modules/skill-options.js');
            const NL = ['nlOn', 'nlFrom', 'nlTo', 'nlStep', 'nlLabels', 'nlMinor', 'nlHops'];
            for (const [cat, list] of Object.entries(W.SKILLS)) {
                if (!Array.isArray(list)) continue;
                for (const s of list) {
                    if (!s || s.retired) continue;
                    out.skills++;
                    const fits = mod.numberLineFits(cat, s.v);
                    const ids = W.offeredOptionsFor(cat, s.v).map((d) => d.id);
                    const has = NL.filter((x) => ids.includes(x));
                    if (fits && has.length !== NL.length) fail(`${cat}:${s.v} fits but offers ${has.join(',')}`);
                    if (!fits && has.length) fail(`${cat}:${s.v} does not fit but offers ${has.join(',')}`);
                    if (!fits) continue;
                    out.offered++;
                    const defs = W.offeredOptionsFor(cat, s.v);
                    const on = W.normalizeOptions(cat, s.v, { nlOn: true });
                    if (mod.restingOptions(defs, on).some((d) => NL.includes(d.id))) fail(`${cat}:${s.v} shows a number-line control at rest`);
                    if (defs.filter((d) => NL.includes(d.id)).some((d) => !d.help)) fail(`${cat}:${s.v} a number-line control has no help line`);
                    // round trips
                    for (const want of [{ nlOn: true }, { nlOn: true, nlFrom: -10, nlTo: 10 }, { nlOn: true, nlFrom: 0, nlTo: 2.5, nlStep: '1/4', nlLabels: '5', nlMinor: '2', nlHops: true },
                        { nlOn: true, nlStep: '0.01', nlLabels: 'ends' }, { nlOn: true, nlFrom: -0.5, nlTo: 1000000, nlStep: '1000', nlMinor: '10', nlLabels: 'none' }]) {
                        const packed = W.packOptions(cat, s.v, want);
                        const pay = W.encodeOptionPayload(cat, s.v, packed);
                        if (!/^[A-Z0-9_]*$/.test(pay)) fail(`${cat}:${s.v} payload not URL-safe: ${pay}`);
                        const back = W.decodeOptionPayload(cat, s.v, '~' + pay);
                        if (JSON.stringify(back) !== JSON.stringify(packed)) fail(`${cat}:${s.v} ${JSON.stringify(packed)} -> ${pay} -> ${JSON.stringify(back)}`);
                        const code = W.SKILL_CODES[`${cat}:${s.v}`];
                        if (code) {
                            const parts = W.parseSkillCodeParts(code + '~' + pay);
                            if (parts.length !== 1 || JSON.stringify(parts[0].opts) !== JSON.stringify(packed)) fail(`${cat}:${s.v} skill code ${code}~${pay} -> ${JSON.stringify(parts)}`);
                        }
                    }
                    if (W.encodeOptionPayload(cat, s.v, W.packOptions(cat, s.v, {})) !== W.encodeOptionPayload(cat, s.v, {})) fail(`${cat}:${s.v} default payload changed`);
                    // the line off writes nothing
                    if (W.encodeOptionPayload(cat, s.v, W.packOptions(cat, s.v, { nlOn: false, nlFrom: null }))) fail(`${cat}:${s.v} the line off still writes a payload`);
                }
            }
            return out;
        });
        u.fails.forEach((m) => check(false, m));
        log(`  offered on ${u.offered} of ${u.skills} skills; codec round trips checked`);

        /* 3 + 4: coverage and fit, S and L */
        for (const size of ['S', 'L']) {
            for (const smp of SAMPLES) {
                const r = await page.evaluate(async ({ smp, size }) => {
                    const W = window;
                    const req = { role: 'independent', sections: [{ skills: [{ categoryId: smp.cat, skillId: smp.skill, opts: smp.opts }] }], size, look: 'ican', key: true, seed: 4242 };
                    const out = await W.buildSheet(req);
                    const kit = await import('./js/modules/sheet/index.js');
                    const items = (out.items || []);
                    // every number of every item on the page lies on the line
                    const nl = out.numberLine;
                    const miss = [];
                    if (nl) {
                        for (const it of items) for (const x of kit.nlLineNumbers({ text: it.text, ans: it.ans })) if (x.v < nl.from - 1e-9 || x.v > nl.to + 1e-9) miss.push(`${x.v} in "${it.text}"`);
                    }
                    // render and measure
                    const host = document.createElement('div');
                    host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;background:#fff';
                    host.innerHTML = `<style>${document.querySelector('style[data-mq-sheet-engine]') ? '' : ''}</style>` + out.pupilHtml + out.keyHtml;
                    document.body.appendChild(host);
                    await new Promise((res) => setTimeout(res, 50));
                    const pages = [...host.querySelectorAll('.ws-page')];
                    const pg = pages.map((p) => {
                        const band = p.querySelector('.ws-refline');
                        const head = p.querySelector('.ws-head');
                        const body = p.querySelector('.ws-body');
                        const svg = band && band.querySelector('svg');
                        return {
                            key: p.classList.contains('ws-key') || p.getAttribute('data-ws-mode') === 'key',
                            band: !!band,
                            under: !!(band && head && band.previousElementSibling === head),
                            overflow: body ? Math.max(0, body.scrollHeight - body.clientHeight) : 0,
                            pageOverflow: Math.max(0, p.scrollHeight - p.clientHeight),
                            svgW: svg ? svg.getBoundingClientRect().width : 0,
                            pageW: p.getBoundingClientRect().width,
                        };
                    });
                    host.remove();
                    return { nl, miss, pages: pg, pageCount: out.pageCount, keyPageCount: out.keyPageCount, fits: out.fits && out.fits.note };
                }, { smp, size });
                const tag = `${smp.id} @${size}`;
                check(!!r.nl, `${tag}: no number line on the sheet`);
                if (!r.nl) continue;
                check(r.nl.covers && !r.miss.length, `${tag}: the line ${r.nl.from}..${r.nl.to} misses ${r.miss.slice(0, 4).join("; ")} ${JSON.stringify(r.nl.missing)}`);
                check(r.pages.length === r.pageCount + r.keyPageCount, `${tag}: ${r.pages.length} pages rendered, ${r.pageCount}+${r.keyPageCount} expected`);
                check(r.pages.every((p) => p.band && p.under), `${tag}: a page has no band under its header`);
                check(r.pages.some((p) => p.key && p.band), `${tag}: the key has no band`);
                check(r.pages.every((p) => p.overflow <= 1 && p.pageOverflow <= 1), `${tag}: a page overflows (${JSON.stringify(r.pages.map((p) => [p.overflow, p.pageOverflow]))})`);
                // full live width: 186 of 210 mm
                const ratio = r.pages[0].svgW / r.pages[0].pageW;
                check(ratio > 0.85 && ratio < 0.92, `${tag}: the line is ${(ratio * 100).toFixed(1)}% of the page width (want the live width, ~88.6%)`);
                log(`  ${tag}: line ${r.nl.from} to ${r.nl.to} by ${r.nl.step}, band ${r.nl.hMm} mm, ${r.pageCount}+${r.keyPageCount} pages${r.nl.notes && r.nl.notes.length ? ' (' + r.nl.notes.join('; ') + ')' : ''}`);
            }
        }
        /* critic nl-r2: the Auto line counts in what the items count in (D1, D2, D4, D5, D8) */
        const ax = await page.evaluate(async () => {
            const rs = await import('./js/modules/refline-screen.js');
            const kit = await import('./js/modules/sheet/index.js');
            const out = {};
            for (const k of ['counting:count_sequence', 'patterns:seq_2', 'patterns:seq_5', 'multiplication:count_by_tables', 'patterns:skip_count_line',
                'patterns:count_by_step_up', 'conversions:order_fdp', 'integers:mixed_integers', 'fractions:equivalent', 'decimals:add_decimal']) {
                const [c, sk] = k.split(':');
                const sp = rs.skillLine(c, sk, { nlOn: true });
                const g = sp && kit.refLineHTML(sp, { size: 'S', widthMm: 186 });
                // every number of 12 items lands on a drawn tick (a step or a small tick)
                const off = [];
                if (sp) {
                    const sv = sp.step.num / sp.step.den;
                    const fine = sp.minor && sp.minor !== 'auto' && sp.minor !== '0' ? sv / Number(sp.minor) : sv;
                    for (let i = 0; i < 12; i++) {
                        const q = window.generateQuestionFor({ category: c, skill: sk, seed: 300 + i, itemIndex: i });
                        for (const x of kit.nlLineNumbers(q)) if (Number.isInteger(x.v) && sp.step.kind === 'whole' && Math.abs(x.v / fine - Math.round(x.v / fine)) > 1e-9) off.push(x.v);
                    }
                }
                out[sk] = sp && { from: sp.from, to: sp.to, step: sp.step.num / sp.step.den, kind: sp.step.kind, labels: sp.labels, minor: sp.minor,
                    labelEvery: g.geom.labelEvery, off: [...new Set(off)].slice(0, 6), svg: g.html };
            }
            out.fracOps = (await import('./js/modules/skill-options.js')).numberLineFits('fraction_operations', 'add_fractions_like');
            return out;
        });
        check(ax.count_sequence && ax.count_sequence.step === 1 && ax.count_sequence.labels === 'auto', `D1 count_sequence: ${JSON.stringify(ax.count_sequence)}`);
        for (const k of ['count_by_tables', 'skip_count_line', 'count_by_step_up', 'seq_5']) check(ax[k] && !ax[k].off.length && ax[k].labels !== 'ends', `D1 ${k}: counts off the ticks ${JSON.stringify(ax[k] && { ...ax[k], svg: 0 })}`);
        check(ax.seq_2 && !ax.seq_2.off.length && ax.seq_2.labels !== 'ends' && ax.seq_2.labels !== 'none', `D2 seq_2 landmarks: ${JSON.stringify(ax.seq_2 && { ...ax.seq_2, svg: 0 })}`);
        check(!ax.fracOps, 'D3 fraction_operations still offers the page-wide line');
        check(ax.order_fdp && ax.order_fdp.from === 0 && ax.order_fdp.to === 1, `D4 order_fdp: ${JSON.stringify(ax.order_fdp && { ...ax.order_fdp, svg: 0 })}`);
        check(ax.mixed_integers && ax.mixed_integers.kind === 'whole', `D5 mixed_integers: ${JSON.stringify(ax.mixed_integers && { ...ax.mixed_integers, svg: 0 })}`);
        check(ax.equivalent && ax.equivalent.to <= 2, `D5 equivalent: ${JSON.stringify(ax.equivalent && { ...ax.equivalent, svg: 0 })}`);
        check(ax.add_decimal && ax.add_decimal.to === 20 && /stroke-width/.test(ax.add_decimal.svg) && (ax.add_decimal.svg.match(/<line/g) || []).length > 100, `D8 add_decimal tenths: ${JSON.stringify(ax.add_decimal && { ...ax.add_decimal, svg: 0 })}`);
        for (const [k, v] of Object.entries(ax)) if (v && v.from !== undefined) log(`  auto ${k}: ${v.from} to ${v.to} by ${v.step}${v.minor && v.minor !== 'auto' ? ' / ' + v.minor : ''}, labels ${v.labels} (every ${v.labelEvery})`);

        /* critic nl-r2 D6 + D7: every fitting skill at S and L: the band on EVERY pupil and key page, and the rows it costs */
        if (!process.argv.includes('--quick')) {
            const list = await page.evaluate(async () => {
                const mod = await import('./js/modules/skill-options.js');
                const out = [];
                for (const [cat, l] of Object.entries(window.SKILLS)) if (Array.isArray(l)) for (const s of l) if (s && !s.retired && mod.numberLineFits(cat, s.v)) out.push([cat, s.v]);
                return out;
            });
            const sweep = { noBand: [], lost: [], n: 0 };
            for (const [cat, sk] of list) for (const size of ['S', 'L']) {
                const r = await page.evaluate(async ({ cat, sk, size }) => {
                    const mk = (on) => ({ role: 'independent', sections: [{ skills: [{ categoryId: cat, skillId: sk, opts: on ? { nlOn: true } : {} }], pages: 1 }], size, key: true, seed: 77 });
                    let a, b;
                    try { a = await window.buildSheet(mk(true)); b = await window.buildSheet(mk(false)); } catch (e) { return null; }
                    const html = a.pupilHtml + a.keyHtml;
                    const per = (x) => ((x.fits && (x.fits.sections || [x.fits])) || []).reduce((t, f) => t + (f.perPage || 0), 0);
                    return { pages: (html.match(/class="ws-page[ "]/g) || []).length, bands: (html.match(/data-ws-band="refline"/g) || []).length, on: per(a), off: per(b) };
                }, { cat, sk, size });
                if (!r) continue;
                sweep.n++;
                if (r.bands < r.pages) sweep.noBand.push(`${sk}@${size} ${r.bands}/${r.pages}`);
                if (r.on < r.off) sweep.lost.push(`${sk}@${size} ${r.off}→${r.on}`);
            }
            check(!sweep.noBand.length, `D6 pages without the line: ${sweep.noBand.join(', ')}`);
            log(`  sweep: ${sweep.n} builds; band on every page of ${sweep.n - sweep.noBand.length}; ${sweep.lost.length} lose capacity to the band (D7, recorded): ${sweep.lost.join(', ')}`);
        }

        // every page role where supports are allowed carries the line; test / check pages do not
        for (const role of ['more-practice', 'guided', 'scripted-model', 'mixed-practice', 'review', 'stretch', 'reason-it', 'error-analysis', 'test', 'pre-skill-check']) {
            const r = await page.evaluate(async ({ role }) => {
                const req = { role, sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_20_mixed', opts: { nlOn: true } }] }], size: 'L', key: true, seed: 99 };
                let out;
                try { out = await window.buildSheet(req); } catch (e) { return { err: e.message, unsupported: !!(e && e.unsupported) }; }
                const host = document.createElement('div');
                host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;background:#fff';
                host.innerHTML = out.pupilHtml + out.keyHtml;
                document.body.appendChild(host);
                await new Promise((res) => setTimeout(res, 50));
                const pages = [...host.querySelectorAll('.ws-page')].map((p) => {
                    const body = p.querySelector('.ws-body');
                    return { band: !!p.querySelector('.ws-refline'), overflow: body ? Math.max(0, body.scrollHeight - body.clientHeight) : 0, pageOverflow: Math.max(0, p.scrollHeight - p.clientHeight) };
                });
                host.remove();
                return { pages, nl: out.numberLine };
            }, { role });
            if (r.err) { check(r.unsupported, `${role}: ${r.err}`); log(`  ${role}: n/a (${r.err})`); continue; }
            const want = !['test', 'pre-skill-check'].includes(role);
            check(r.pages.length > 0 && r.pages.every((p) => p.band === want), `${role}: band ${want ? 'missing on a page' : 'printed on a check page'}`);
            check(r.pages.every((p) => p.overflow <= 1 && p.pageOverflow <= 1), `${role}: a page overflows ${JSON.stringify(r.pages)}`);
            if (want) check(r.nl && r.nl.covers, `${role}: the line does not cover the page (${JSON.stringify(r.nl)})`);
            log(`  ${role}: ${want ? 'line ' + (r.nl ? r.nl.from + ' to ' + r.nl.to : '?') : 'no line (check page)'}, ${r.pages.length} pages`);
        }
        // REAL FLOW (critic nl-r1 D1): the option set the way the panel sets it (the set's store,
        // and a skill code carrying ~0R1), then the online worksheet built by initWorksheet.
        const flow = await page.evaluate(async () => {
            const W = window;
            const st = (await import('./js/modules/state.js')).state;
            const out = {};
            for (const via of ['store', 'code']) {
                W.clearSetOptions && W.clearSetOptions();
                if (via === 'store') W.setSetOptions('addition', 'add_facts', { nlOn: true });
                else {
                    const parts = W.parseSkillCodeParts(W.SKILL_CODES['addition:add_facts'] + '~_0R1');
                    W.setSetOptions('addition', 'add_facts', parts[0].opts);
                }
                st.category = 'addition'; st.skill = 'add_facts'; st.skillOptions = null; st.problemCount = 6; st.gameMode = 'worksheet';
                W.initWorksheet();
                await new Promise((r) => setTimeout(r, 200));
                const el = document.getElementById('mqWsRefLine');
                const lab = el ? el.querySelector('svg').getAttribute('aria-label') : '';
                out[via] = { on: !!el, label: lab, items: st.worksheetQs.length };
            }
            W.clearSetOptions && W.clearSetOptions();
            st.skillOptions = null; W.initWorksheet();
            await new Promise((r) => setTimeout(r, 100));
            out.off = !document.getElementById('mqWsRefLine');
            W.showView('homeView');
            return out;
        });
        check(flow.store.on && /0 to 20/.test(flow.store.label), `real-flow worksheet (set options): ${JSON.stringify(flow.store)}`);
        check(flow.code.on, `real-flow worksheet (skill code ~0R1): ${JSON.stringify(flow.code)}`);
        check(flow.off, 'real-flow worksheet: the line stays after the option is cleared');
        log(`  real-flow worksheet: ${flow.store.label}`);

        // AUTO DEFAULTS (critic nl-r1 D2-D6): the skill decides its line, one line per skill everywhere.
        const auto = await page.evaluate(async () => {
            const m = await import('./js/modules/refline-screen.js');
            const L = (c, k, o = {}) => { const s = m.skillLine(c, k, Object.assign({ nlOn: true }, o)); return s ? { from: s.from, to: s.to, step: s.step, labels: s.labels, warn: s.warn, covers: s.covers } : null; };
            return {
                seq2: L('patterns', 'seq_2'), seq5: L('patterns', 'seq_5'),
                wp20: L('addition', 'add_wp_20'), wp50: L('addition', 'add_wp_50'),
                k1r: L('addition', 'add_1k_regroup'), k1n: L('addition', 'add_1k_no_regroup'), facts: L('addition', 'add_facts'),
                rs1000: L('number_sense', 'round_sort_1000'), neg: L('integers', 'order_negatives'),
                ofn: L('fractions', 'order_frac_numline'), ofr: L('fractions', 'order_fractions'),
                dec: L('decimals', 'add_decimal'), fop: L('fraction_operations', 'add_fractions_like'),
                roundDec: !!m.skillLine('decimals', 'round_decimals', { nlOn: true }),
            };
        });
        const a = auto;
        check(a.seq2 && a.seq2.labels !== 'ends' && a.seq2.covers, `seq_2 Auto: ${JSON.stringify(a.seq2)}`);
        check(a.seq5 && a.seq5.labels !== 'ends' && a.seq5.covers, `seq_5 Auto: ${JSON.stringify(a.seq5)}`);
        check(a.wp20 && a.wp20.from === 0 && a.wp20.to === 20, `add_wp_20 Auto: ${JSON.stringify(a.wp20)}`);
        check(a.wp50 && a.wp50.to === 50, `add_wp_50 Auto: ${JSON.stringify(a.wp50)}`);
        check(a.k1r && a.k1n && a.k1r.to === 1000 && a.k1n.to === 1000, `add_1k Auto: ${JSON.stringify([a.k1r, a.k1n])}`);
        check(a.facts && a.facts.to === 20, `add_facts Auto: ${JSON.stringify(a.facts)}`);
        check(a.rs1000 && a.rs1000.to >= 1000 && a.rs1000.covers, `round_sort_1000 Auto: ${JSON.stringify(a.rs1000)}`);
        check(a.neg && a.neg.from >= -1000 && a.neg.to <= 1000 && a.neg.from < 0, `order_negatives Auto: ${JSON.stringify(a.neg)}`);
        check(a.ofn && a.ofn.step.kind === 'frac', `order_frac_numline Auto: ${JSON.stringify(a.ofn)}`);
        check(a.ofr && a.ofr.step.kind === 'frac', `order_fractions Auto: ${JSON.stringify(a.ofr)}`);
        check(a.dec && a.dec.step.kind === 'whole', `add_decimal Auto: ${JSON.stringify(a.dec)}`);
        check(!a.fop, `add_fractions_like is off the page-wide list (R2-D3): ${JSON.stringify(a.fop)}`);
        check(!a.roundDec, 'round_decimals still offers the line');
        log(`  auto: seq_2 ${a.seq2 && a.seq2.from}..${a.seq2 && a.seq2.to} by ${a.seq2 && a.seq2.step.num} (landmarks), add_wp_20 0..${a.wp20 && a.wp20.to}, round_sort_1000 ${a.rs1000 && a.rs1000.from}..${a.rs1000 && a.rs1000.to}, order_negatives ${a.neg && a.neg.from}..${a.neg && a.neg.to}, order_fractions 1/${a.ofr && a.ofr.step.den}`);

        // ONE range per skill across roles (D6), and the mixed page (D8)
        const one = await page.evaluate(async () => {
            const out = {};
            for (const role of ['independent', 'guided', 'review', 'mixed-practice', 'stretch', 'reason-it']) {
                try {
                    const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } }] }], size: 'L', key: false, seed: 31 });
                    out[role] = r.numberLine ? `${r.numberLine.from}..${r.numberLine.to}/${r.numberLine.step}` : 'none';
                } catch (e) { out[role] = 'n/a'; }
            }
            const mix = await window.buildSheet({ role: 'independent', sections: [
                { skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } }], count: 6 },
                { skills: [{ categoryId: 'fractions', skillId: 'order_fractions', opts: { nlOn: true } }], count: 4 }], size: 'M', key: false, seed: 5 });
            const ranges = await window.buildSheet({ role: 'independent', sections: [
                { skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true, nlFrom: 0, nlTo: 10 } }], count: 6 },
                { skills: [{ categoryId: 'integers', skillId: 'add_int', opts: { nlOn: true, nlFrom: -20, nlTo: 20 } }], count: 6 }], size: 'M', key: false, seed: 5 });
            return { roles: out, mix: mix.numberLine, mixNote: mix.fits.note, ranges: ranges.numberLine };
        });
        const vals = [...new Set(Object.values(one.roles).filter((v) => v !== 'n/a'))];
        check(vals.length === 1, `add_facts gets different lines on different roles: ${JSON.stringify(one.roles)}`);
        check(one.mix && one.mix.step.includes('/'), `mixed add_facts + order_fractions: no fraction step (${JSON.stringify(one.mix)})`);
        check(one.ranges && one.ranges.from === -20 && one.ranges.to === 20, `the teacher ranges do not merge: ${JSON.stringify(one.ranges)}`);
        log(`  roles: ${JSON.stringify(one.roles)}; mixed: ${one.mix && one.mix.from}..${one.mix && one.mix.to} by ${one.mix && one.mix.step}`);

        // a teacher range that misses the page warns
        const warn = await page.evaluate(async () => {
            const out = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true, nlFrom: 0, nlTo: 5 } }] }], size: 'M', key: false, seed: 7 });
            const m = await import('./js/modules/refline-screen.js');
            return { covers: out.numberLine && out.numberLine.covers, note: out.fits && out.fits.note, panel: m.numberLineCoverWarning('addition', 'add_facts', { nlOn: true, nlFrom: 0, nlTo: 5 }), ok: m.numberLineCoverWarning('addition', 'add_facts', { nlOn: true }) };
        });
        check(warn.covers === false && /number line runs 0 to 5/.test(warn.note || ''), `custom range 0-5 on add_facts: no sheet warning (${JSON.stringify(warn)})`);
        check(/number line runs/.test(warn.panel) && !warn.ok, `panel warning wrong: ${JSON.stringify(warn)}`);

        /* 5: screen */
        const scr = await page.evaluate(async () => {
            const W = window;
            const st = (await import('./js/modules/state.js')).state;
            const m = await import('./js/modules/refline-screen.js');
            const q = W.generateQuestionFor({ category: 'addition', skill: 'add_facts', seed: 3 });
            m.syncPracticeRefLine(q, { categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } });
            const on = !!document.querySelector('#mqRefLine svg');
            const before = document.getElementById('mqRefLine') && document.getElementById('mqRefLine').nextElementSibling && document.getElementById('mqRefLine').nextElementSibling.id;
            m.syncPracticeRefLine(q, { categoryId: 'addition', skillId: 'add_facts', opts: {} });
            const off = !document.getElementById('mqRefLine');
            const qs = [1, 2, 3].map((i) => W.generateQuestionFor({ category: 'addition', skill: 'add_facts', seed: i }));
            m.syncWorksheetRefLine(qs, { categoryId: 'addition', skillId: 'add_facts', opts: { nlOn: true } });
            const ws = !!document.querySelector('#mqWsRefLine svg') && document.getElementById('mqWsRefLine').nextElementSibling.id === 'worksheetGrid';
            m.syncWorksheetRefLine(qs, { categoryId: 'addition', skillId: 'add_facts', opts: {} });
            const wsOff = !document.getElementById('mqWsRefLine');
            const quizSrc = await (await fetch('./js/modules/quiz-take.js')).text();
            return { on, before, off, ws, wsOff, quiz: !/refline/i.test(quizSrc), st: !!st };
        });
        check(scr.on && scr.before === 'questionCard', `practice card: line not mounted above the card (${JSON.stringify(scr)})`);
        check(scr.off, 'practice card: line still shown with the option off');
        check(scr.ws && scr.wsOff, `online worksheet: line not mounted above the grid / not removed (${JSON.stringify(scr)})`);
        check(scr.quiz, 'the quiz draws the line (it draws no supports)');

        if (SHOTS) await shots(h);
        check(!h.problems.length, `console problems: ${JSON.stringify(h.problems.slice(0, 5))}`);
    } catch (e) {
        fails.push(`run error: ${e.stack || e.message}`);
    } finally {
        await h.close();
    }
    if (fails.length) {
        fails.slice(0, 60).forEach((m) => log('  FAIL ' + m));
        log('support-numberline: FAIL');
        process.exit(1);
    }
    log('support-numberline: OK');
})();

/* ------------------------------------------------------------------ proof images */
async function shots(h) {
    const { page, browser, base } = h;
    for (const size of ['S', 'L']) {
        for (const smp of SAMPLES) {
            const doc = await page.evaluate(async ({ smp, size }) => {
                const out = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: smp.cat, skillId: smp.skill, opts: smp.opts }] }], size, look: 'ican', key: true, seed: 4242 });
                return window.sheetDocument(out.pupilHtml + '\n' + out.keyHtml, smp.id);
            }, { smp, size });
            const p = await browser.newPage();
            await p.setViewport({ width: 900, height: 1300, deviceScaleFactor: 1.5 });
            await p.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
            await p.setContent(doc, { waitUntil: 'networkidle0', timeout: 60000 });
            await p.evaluate(() => document.fonts && document.fonts.ready);
            const els = await p.$$('.ws-page');
            const keyEl = (await p.$$('.ws-page.ws-key'))[0];
            if (els[0]) await els[0].screenshot({ path: path.join(SHOT_DIR, `${smp.id}-${size}-pupil.png`) });
            if (keyEl) await keyEl.screenshot({ path: path.join(SHOT_DIR, `${smp.id}-${size}-key.png`) });
            await p.close();
        }
    }
    // the card and the online worksheet at 390 and 1280, for two skills
    for (const smp of [SAMPLES[0], SAMPLES[2]]) {
        for (const w of [390, 1280]) {
            await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1.5 });
            // The REAL hosts: the practice card through renderQuestion, the online worksheet
            // through initWorksheet, waited on until the question is drawn and the layout settled.
            await page.evaluate(async ({ smp }) => {
                const st = (await import('./js/modules/state.js')).state;
                st.category = smp.cat; st.skill = smp.skill; st.skillOptions = smp.opts;
                st.skillOptionsBySkill = Object.assign({}, st.skillOptionsBySkill || {}, { [smp.cat + ':' + smp.skill]: smp.opts });
                st.gameMode = 'practice';
                st.currentQ = window.generateQuestionFor({ category: smp.cat, skill: smp.skill, opts: smp.opts, seed: 11 });
                window.showView('gameView');
                window.renderQuestion();
            }, { smp });
            await waitFor(page, () => { const c = document.getElementById('questionCard'); return !!(c && c.offsetHeight > 80 && document.querySelector('#mqRefLine svg') && /\d/.test(c.innerText)); }, 15000, 'practice card');
            await hideOverlays(page);
            await new Promise((r) => setTimeout(r, 900));
            const host = await page.$('#mqRefLine');
            if (host) {
                const box = await host.boundingBox();
                const card = await (await page.$('#questionCard')).boundingBox();
                await page.screenshot({ path: path.join(SHOT_DIR, `${smp.id}-card-${w}.png`), clip: { x: 0, y: Math.max(0, box.y - 10), width: w, height: Math.min(900, box.height + (card ? card.height : 300) + 30) } });
            }
            await page.evaluate(async ({ smp }) => {
                const st = (await import('./js/modules/state.js')).state;
                window.setSetOptions(smp.cat, smp.skill, smp.opts);
                st.category = smp.cat; st.skill = smp.skill; st.skillOptions = null; st.problemCount = 6; st.gameMode = 'worksheet';
                window.initWorksheet();
            }, { smp });
            await waitFor(page, () => { const g = document.getElementById('worksheetGrid'); return !!(g && g.dataset.mqLaidOut === '1' && g.children.length && document.querySelector('#mqWsRefLine svg')); }, 20000, 'worksheet laid out');
            await hideOverlays(page);
            await new Promise((r) => setTimeout(r, 300));
            const wh = await page.$('#mqWsRefLine');
            if (wh) {
                const box = await wh.boundingBox();
                await page.screenshot({ path: path.join(SHOT_DIR, `${smp.id}-worksheet-${w}.png`), clip: { x: 0, y: Math.max(0, box.y - 10), width: w, height: Math.min(900, box.height + 600) } });
            }
        }
    }
    // the option panel, with the disclosure open and a warning
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1.5 });
    await page.evaluate(() => {
        window.showView('homeView');
        const d = document.createElement('div');
        d.id = 'nlPanelShot';
        d.style.cssText = 'position:fixed;left:20px;top:20px;width:420px;max-height:860px;overflow:auto;z-index:99999;background:var(--bg-card,#fff);padding:10px;border:1px solid #888';
        document.body.appendChild(d);
    });
    await page.evaluate(async () => {
        const ui = await import('./js/modules/skill-options-ui.js');
        const so = await import('./js/modules/skill-options.js');
        ui.skoNlineOpen(true);
        const cur = so.normalizeOptions('addition', 'add_facts', { nlOn: true, nlFrom: 0, nlTo: 5 });
        const defs = so.offeredOptionsFor('addition', 'add_facts');
        const handlers = { set: () => '', toggle: () => '', all: () => '' };
        document.getElementById('nlPanelShot').innerHTML = ui.groupedOptionRowsHTML(defs, cur, (def) => `<div style="padding:7px 0;border-bottom:1px solid var(--border);">${ui.optionControlHTML(def, cur, '#8b5cf6', handlers)}<div style="font-size:0.7rem;color:var(--text-dim);margin-top:3px;">${ui.optionHelpLine(def)}</div></div>`);
    });
    const panel = await page.$('#nlPanelShot');
    await panel.screenshot({ path: path.join(SHOT_DIR, 'option-panel.png') });
    await page.evaluate(async () => {
        const ui = await import('./js/modules/skill-options-ui.js');
        ui.skoNlineOpen(false);
        const so = await import('./js/modules/skill-options.js');
        const cur = so.normalizeOptions('addition', 'add_facts', {});
        const handlers = { set: () => '', toggle: () => '', all: () => '' };
        document.getElementById('nlPanelShot').innerHTML = ui.groupedOptionRowsHTML(so.offeredOptionsFor('addition', 'add_facts'), cur, (def) => `<div style="padding:7px 0;border-bottom:1px solid var(--border);">${ui.optionControlHTML(def, cur, '#8b5cf6', handlers)}</div>`);
    });
    await panel.screenshot({ path: path.join(SHOT_DIR, 'option-panel-closed.png') });
    log(`  proof images in ${path.relative(ROOT, SHOT_DIR)}`);
}
