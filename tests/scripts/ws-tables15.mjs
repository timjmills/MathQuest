#!/usr/bin/env node
// ws-tables15 - the "Tables to 15 x 15" band of the x / ÷ fact drills and the Options panel order (owner requests 2026-11-14,
// lane lf-ops t15). Browser (the app's own modules in a page): run it through /tmp/mq-browser-run.sh.
//
//   node tests/scripts/ws-tables15.mjs                                   # both hosts, every rule
//   node tests/scripts/ws-tables15.mjs --skill division:div_facts        # one host (a preset id names its host)
//   node tests/scripts/ws-tables15.mjs --rules FORM-FIRST                # the panel-order rule only
//   node tests/scripts/ws-tables15.mjs --root DIR                        # another checkout (backtests)
//
// RULES (each prints PASS / FAIL n; the tool's last line is `ws-tables15: OK` / `FAIL (n)`):
//   T15-BAND    the host's "Tables to" control offers 10 x 10, 12 x 12 (the default) and 15 x 15 (band 225), as ONE option.
//   T15-DEAL    at band 225, 150 seeded items: every one of the 13, 14 and 15 tables is dealt; every answer is within the band
//               (x: both factors <= 15, the product <= 225; ÷: the divisor and the quotient <= 15, the dividend <= 225); a ticked
//               13 alone deals only 13 facts. At the default band no 13-15 is ever dealt (the 12 x 12 page is unchanged).
//   T15-TICKS   the "Multiply by" / "Divide by" ticks show 13, 14 and 15 only under 15 x 15 (rendered control, 12 x 12 and 15 x 15).
//   T15-FIT     the independent page at M and L, band 225: buildSheet says it fits, no cell's ink leaves its cell, and the fact
//               digits print at the same size as on the default 12 x 12 page (3-digit products such as 225 fit the boxes).
//   T15-PRESET  mult_facts_15 / div_facts_15 are live skills, presets of their host that open it with band 225, with a share
//               code, standards, WRM tags and search terms.
//   T15-HIDDEN  at "Tables to 12 x 12" (144) and "10 x 10" (100) the hidden 13, 14 and 15 ticks are never dealt and never named,
//               whatever the ticks: all ticked, some unticked (the complement of 7 and 8 over 0-15), only 13-15 ticked, or decoded
//               from a share code that carries the D / E / F tokens. No dealt fact has a factor, divisor or quotient past the
//               band's top, and the option summary (describeOptions: the Sets screen, the Quick Start card), the fact-set title
//               and the I Can line name no 13, 14 or 15 (hotfix t15fix, 2026-11-20: ws-share-options read "Times: 0 ... 6, 9 ... 15").
//   FORM-FIRST  in the rendered Options panel, "How it is written" (divForm / notation) and the Support choices stand ABOVE the
//               long "Multiply by" / "Divide by" tick list.
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-tables15';
const args = process.argv.slice(2);
const arg = (k, d) => { const i = args.indexOf(k); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || join(HERE, '..', '..')));
if (ROOT !== resolve(join(HERE, '..', '..')) && !process.env.MQ_ROOT) process.env.MQ_ROOT = ROOT;
const HOSTS = [
    { cat: 'multiplication', id: 'mult_facts', preset: 'mult_facts_15', form: 'notation' },
    { cat: 'division', id: 'div_facts', preset: 'div_facts_15', form: 'divForm' },
];
const only = String(arg('--skill', arg('--skills', ''))).split(',').map((s) => s.trim()).filter(Boolean);
const mine = only.length ? HOSTS.filter((h) => only.some((k) => [h.id, h.preset, `${h.cat}:${h.id}`, `${h.cat}:${h.preset}`].includes(k))) : HOSTS;
if (!mine.length) { console.log(`${TOOL}: OK (n/a: no x / ÷ fact drill in scope)`); process.exit(0); }
const RULES = ['T15-BAND', 'T15-DEAL', 'T15-TICKS', 'T15-FIT', 'T15-PRESET', 'T15-HIDDEN', 'FORM-FIRST'];
const want = new Set(String(arg('--rules', RULES.join(','))).split(',').map((s) => s.trim()).filter(Boolean));
const VERBOSE = args.includes('--verbose');

const H = createRequire(import.meta.url)(join(HERE, '..', 'lib', 'ws-harness.cjs'));
const found = Object.fromEntries(RULES.map((r) => [r, []]));
const app = await H.open({});
try {
    await app.page.waitForFunction(() => typeof window.buildSheet === 'function' && typeof window.generateQuestionFor === 'function', { timeout: 90000 });
    for (const h of mine) {
        const r = await app.page.evaluate(async (a) => {
            const out = { band: [], deal: [], ticks: [], preset: [], hidden: [], order: [], info: {} };
            const so = await import('/js/modules/skill-options.js');
            const ui = await import('/js/modules/skill-options-ui.js');
            const data = await import('/js/modules/data.js');
            // ---- T15-BAND
            const defs = so.offeredOptionsFor(a.cat, a.id);
            const bands = defs.filter((d) => d.id === 'band');
            const band = bands[0];
            if (bands.length !== 1) out.band.push(`${a.id}: ${bands.length} "Tables to" controls (want one)`);
            const vals = band ? band.values.map((x) => x.v) : [];
            for (const v of [100, 144, 225]) if (!vals.includes(v)) out.band.push(`${a.id}: "Tables to" has no ${v} (${v === 225 ? '15 x 15' : v === 144 ? '12 x 12' : '10 x 10'}); values ${vals.join(', ')}`);
            if (band && band.default !== 144) out.band.push(`${a.id}: the default is ${band.default}, not 144 (12 x 12)`);
            const l225 = band && band.values.find((x) => x.v === 225);
            if (l225 && !/15\s*[x×]\s*15/.test(l225.l)) out.band.push(`${a.id}: band 225 is labelled "${l225.l}", not 15 x 15`);
            // ---- T15-DEAL
            const fnv = (s) => { let x = 0x811c9dc5; for (const c of s) { x ^= c.charCodeAt(0); x = Math.imul(x, 16777619) >>> 0; } return x; };
            const factOf = (q) => {
                const p = q && q.cell && q.cell.payload;
                let A = p ? Number(p.a) : NaN, B = p ? Number(p.b) : NaN;
                const ans = Number(String(q && q.ans).replace(/,/g, ''));
                if (!Number.isFinite(A) || !Number.isFinite(B)) {
                    const m = /(\d+)\s*[×x÷\/]\s*(\d+)/.exec(String((q && q.text) || '').replace(/<[^>]+>/g, ' '));
                    if (m) { A = Number(m[1]); B = Number(m[2]); }
                }
                return { A, B, ans };
            };
            const deal = (opts, n, tag) => {
                const seen = new Set(); let bad = 0, read = 0;
                for (let i = 0; i < n; i++) {
                    let q;
                    try { q = window.generateQuestionFor({ category: a.cat, skill: a.id, opts, seed: (fnv(`${a.cat}:${a.id}:${tag}`) ^ Math.imul(i + 1, 2654435761)) >>> 0, itemIndex: i % 12 }); } catch (e) { out.deal.push(`${a.id} ${tag}: item ${i} threw ${e.message}`); continue; }
                    const f = factOf(q);
                    if (!Number.isFinite(f.A) || !Number.isFinite(f.B) || !Number.isFinite(f.ans)) { out.deal.push(`${a.id} ${tag}: item ${i} has no readable fact (${String(q && q.text).slice(0, 40)})`); continue; }
                    read++;
                    const top = opts && opts.band === 225 ? 15 : 12, cap = opts && opts.band === 225 ? 225 : 144;
                    if (a.cat === 'multiplication') {
                        if (f.A * f.B !== f.ans) { bad++; out.deal.push(`${a.id} ${tag}: ${f.A} x ${f.B} keyed ${f.ans}`); }
                        if (f.A > top || f.B > top || f.ans > cap) { bad++; out.deal.push(`${a.id} ${tag}: ${f.A} x ${f.B} = ${f.ans} is past ${top} x ${top}`); }
                        seen.add(f.A); seen.add(f.B);
                    } else {
                        if (f.B * f.ans !== f.A) { bad++; out.deal.push(`${a.id} ${tag}: ${f.A} ÷ ${f.B} keyed ${f.ans}`); }
                        if (f.B > top || f.ans > top || f.A > cap) { bad++; out.deal.push(`${a.id} ${tag}: ${f.A} ÷ ${f.B} = ${f.ans} is past ${top} x ${top}`); }
                        seen.add(f.B); seen.add(f.ans);
                    }
                }
                return { seen, bad, read };
            };
            const offers225 = vals.includes(225);
            if (offers225) {
                const d = deal({ band: 225 }, 150, 'b225');
                for (const t of [13, 14, 15]) if (!d.seen.has(t)) out.deal.push(`${a.id} band 225: the ${t}s table is never dealt in 150 items (dealt: ${[...d.seen].sort((x, y) => x - y).join(' ')})`);
                out.info.dealt225 = [...d.seen].sort((x, y) => x - y).join(' ');
                // a ticked 13 alone: every fact is a 13 fact
                for (let i = 0; i < 24; i++) {
                    const q = window.generateQuestionFor({ category: a.cat, skill: a.id, opts: { band: 225, constant: [13] }, seed: 1000 + i, itemIndex: i % 12 });
                    const f = factOf(q);
                    const has = a.cat === 'multiplication' ? (f.A === 13 || f.B === 13) : f.B === 13;
                    if (!has) { out.deal.push(`${a.id} band 225 constant [13]: item ${i} is ${f.A} ${a.cat === 'multiplication' ? 'x' : '÷'} ${f.B}`); break; }
                }
            } else out.deal.push(`${a.id}: band 225 is not offered, so no 13-15 fact can be dealt`);
            const d144 = deal({}, 150, 'b144');
            for (const t of [13, 14, 15]) if (d144.seen.has(t)) out.deal.push(`${a.id} default (12 x 12): a ${t} fact was dealt`);
            // ---- T15-HIDDEN (bands 144 and 100: the hidden 13-15 ticks are never dealt, never named)
            {
                const codec = await import('/js/modules/skill-option-codec.js');
                const ALL = Array.from({ length: 16 }, (_, i) => i);
                const NOT78 = ALL.filter((v) => v !== 7 && v !== 8);
                for (const b of [144, 100]) {
                    const top = b === 100 ? 10 : 12;
                    const cases = [
                        ['default', b === 144 ? {} : { band: b }],
                        ['all ticked', { band: b, constant: ALL }],
                        ['7, 8 unticked', { band: b, constant: NOT78 }],
                        ['only 13-15 ticked', { band: b, constant: [13, 14, 15] }],
                        ['7, 8 and 13-15 ticked', { band: b, constant: [7, 8, 13, 14, 15] }],
                    ];
                    // decoded from share codes: the round trip of each case, and a hand-made code with the D / E / F tokens
                    for (const [tag, o] of cases.slice(1)) {
                        const pay = codec.encodeOptionPayload(a.cat, a.id, o);
                        if (pay) cases.push([`code ${pay}`, codec.decodeOptionPayload(a.cat, a.id, pay)]);
                    }
                    for (const [tag, o] of cases) {
                        const opts = { ...o };
                        if (b !== 144) opts.band = b; else delete opts.band;
                        for (let i = 0; i < 48; i++) {
                            let q;
                            try { q = window.generateQuestionFor({ category: a.cat, skill: a.id, opts, seed: (fnv(`${a.id}:hid:${b}:${tag}`) ^ Math.imul(i + 1, 2654435761)) >>> 0, itemIndex: i % 12 }); } catch (e) { out.hidden.push(`${a.id} band ${b} ${tag}: item ${i} threw ${e.message}`); break; }
                            const f = factOf(q);
                            const nums = a.cat === 'multiplication' ? [f.A, f.B] : [f.B, f.ans];
                            if (nums.some((x) => Number.isFinite(x) && x > top)) { out.hidden.push(`${a.id} band ${b} ${tag}: dealt ${f.A} ${a.cat === 'multiplication' ? 'x' : '÷'} ${f.B} (past ${top})`); break; }
                        }
                        const words = [
                            ['summary', so.describeOptions(a.cat, a.id, opts)],
                            ['title', so.factSetTitle(a.cat, a.id, opts)],
                            ['I Can', so.optionICan ? so.optionICan(a.cat, a.id, opts, 'I Can multiply') : ''],
                        ];
                        for (const [w, t] of words) {
                            const m = String(t || '').match(/(?:[^\d]|^)(1[3-5])(?!\d)/);
                            if (m) out.hidden.push(`${a.id} band ${b} ${tag}: the ${w} names ${m[1]} ("${String(t).slice(0, 90)}")`);
                        }
                    }
                }
            }
            // ---- T15-TICKS
            const cdef = defs.find((d) => d.id === 'constant');
            const h = { set: () => '', toggle: () => '', all: () => '' };
            const labelsAt = (cur) => {
                const host = document.createElement('div');
                host.innerHTML = ui.optionControlHTML(cdef, so.normalizeOptions(a.cat, a.id, cur), '#000', h);
                return [...host.querySelectorAll('.sko-set-row')].map((x) => x.textContent.trim());
            };
            if (!cdef) out.ticks.push(`${a.id}: no fact-set control`);
            else {
                const at144 = labelsAt({}), at225 = labelsAt({ band: 225 });
                for (const t of ['13', '14', '15']) {
                    if (at144.includes(t)) out.ticks.push(`${a.id}: the ${t} tick shows under 12 x 12`);
                    if (!at225.includes(t)) out.ticks.push(`${a.id}: no ${t} tick under 15 x 15 (ticks: ${at225.join(' ')})`);
                }
                if (at144.length !== 13) out.ticks.push(`${a.id}: ${at144.length} ticks under 12 x 12 (want 0 to 12)`);
            }
            // ---- T15-PRESET
            const pkey = `${a.cat}:${a.preset}`;
            const live = (data.SKILLS[a.cat] || []).find((s) => s.v === a.preset);
            if (!live) out.preset.push(`${a.preset}: not a skill in SKILLS.${a.cat}`);
            else if (live.presetOf !== a.id) out.preset.push(`${a.preset}: presetOf is ${live.presetOf}, not ${a.id}`);
            let ps = null;
            try { ps = await import('/js/modules/skill-presets.js'); } catch (e) { ps = null; }
            const pr = ps && ps.SKILL_PRESETS ? ps.SKILL_PRESETS[pkey] : null;
            if (!pr) out.preset.push(`${pkey}: no SKILL_PRESETS entry`);
            else {
                if (pr.skill !== a.id) out.preset.push(`${pkey}: opens ${pr.skill}, not ${a.id}`);
                if (!pr.opts || pr.opts.band !== 225) out.preset.push(`${pkey}: does not open with band 225 (${JSON.stringify(pr.opts)})`);
                const pdefs = so.optionsFor(a.cat, a.preset);
                const pb = pdefs.find((d) => d.id === 'band');
                if (!pb || pb.default !== 225) out.preset.push(`${pkey}: its "Tables to" default is ${pb && pb.default}, not 225`);
                // the preset PAGE's "I Can" title names 15, as the host page at band 225 does (critic t15 D1: it read "to 12")
                {
                    const titleOf = async (skillId, opts) => {
                        let sh = null;
                        try { sh = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: a.cat, skillId, opts }], count: 'auto', columns: 'auto' }], size: 'M', look: 'auto', paper: 'A4', seed: 4242, key: true }); } catch (e) { return 'ERR ' + (e && e.message); }
                        const m = String(sh && sh.pupilHtml || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').match(/I Can [^.]*?(?:to 1[0-9]|\))/);
                        return m ? m[0].trim() : '(no I Can line)';
                    };
                    const pl = await titleOf(a.preset, {}), hl = await titleOf(a.id, { band: 225 });
                    if (pl !== hl || !/15/.test(pl)) out.preset.push(`${pkey}: its page title is "${pl}", the host page at 15 x 15 reads "${hl}"`);
                }
                const q = window.generateQuestionFor({ category: a.cat, skill: a.preset, seed: 5, itemIndex: 0 });
                if (!q || q.__error) out.preset.push(`${pkey}: generateQuestionFor gave nothing`);
            }
            try {
                const st = await import('/js/modules/standards.js');
                if (!st.SKILL_STANDARDS[pkey]) out.preset.push(`${pkey}: no SKILL_STANDARDS entry`);
                const w = await import('/js/modules/wrm.js');
                if (!w.SKILL_WRM[pkey]) out.preset.push(`${pkey}: no SKILL_WRM entry`);
                const fz = await import('/js/modules/skill-codes-frozen.js');
                if (!fz.FROZEN_SKILL_CODES[pkey]) out.preset.push(`${pkey}: no share code (FROZEN_SKILL_CODES)`);
                const sf = await import('/js/modules/skill-finder.js').catch(() => null);
                if (sf && typeof sf.findSkills === 'function') {
                    const hits = sf.findSkills('15 times table', { limit: 5 }) || [];
                    const ids = hits.map((x) => x && (x.key || `${x.categoryId || x.category}:${x.skillId || x.id || x.v}`));
                    out.info.search = ids.slice(0, 5).join(' ');
                }
            } catch (e) { out.preset.push(`${pkey}: tags not readable (${e.message})`); }
            // ---- FORM-FIRST (the panel's own grouping and order)
            const shown = ui.nameFitOptions(a.cat, a.id, defs);
            const html = ui.groupedOptionRowsHTML(shown, so.normalizeOptions(a.cat, a.id, {}), (d) => `<div data-t15-opt="${d.id}"></div>`);
            const host2 = document.createElement('div'); host2.innerHTML = html;
            const order = [...host2.querySelectorAll('[data-t15-opt]')].map((x) => x.getAttribute('data-t15-opt'));
            out.info.order = order.join(' > ');
            const iC = order.indexOf('constant'), iF = order.indexOf(a.form), iS = order.indexOf('support');
            if (iC < 0) out.order.push(`${a.id}: the tick list is not in the panel`);
            if (iF < 0) out.order.push(`${a.id}: "How it is written" (${a.form}) is not in the panel`);
            if (iC >= 0 && iF > iC) out.order.push(`${a.id}: "How it is written" (${a.form}) stands below the "${cdef ? cdef.label : 'constant'}" tick list (${order.join(' > ')})`);
            if (iC >= 0 && iS > iC) out.order.push(`${a.id}: the Support choices stand below the tick list (${order.join(' > ')})`);
            return out;
        }, h);
        found['T15-BAND'].push(...r.band); found['T15-DEAL'].push(...r.deal); found['T15-TICKS'].push(...r.ticks);
        found['T15-PRESET'].push(...r.preset); found['T15-HIDDEN'].push(...r.hidden); found['FORM-FIRST'].push(...r.order);
        if (VERBOSE) console.log(`  ${h.id}: dealt at 225 ${r.info.dealt225 || '-'}; panel ${r.info.order}; search ${r.info.search || '-'}`);
        // ---- T15-FIT (independent page at M and L)
        if (want.has('T15-FIT')) {
            for (const size of ['M', 'L']) {
                const f = await app.page.evaluate(async (a) => {
                    const one = async (opts) => {
                        let s;
                        try { s = await window.buildSheet({ role: 'independent', sections: [{ skills: [{ categoryId: a.cat, skillId: a.id, opts }], count: 'auto', columns: 'auto' }], size: a.size, look: 'auto', paper: 'A4', seed: 4242, key: true }); } catch (e) { return { err: String(e && e.message || e) }; }
                        const host = document.createElement('div');
                        host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;background:#fff;';
                        host.innerHTML = (s.pupilHtml || '') + (s.keyHtml || ''); document.body.appendChild(host);   // the key prints the 3-digit answers (225)
                        await document.fonts.ready;
                        const cells = [...host.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
                        const over = [];
                        let fs = 0; const big = [];
                        for (const c of cells) {
                            const R = c.getBoundingClientRect();
                            for (const e of c.querySelectorAll('*')) {
                                const r = e.getBoundingClientRect();
                                if (!r.width || !r.height) continue;
                                if (r.left < R.left - 1 || r.right > R.right + 1 || r.top < R.top - 1 || r.bottom > R.bottom + 1) { over.push((e.textContent || e.tagName).trim().slice(0, 12)); break; }
                            }
                            for (const e of c.querySelectorAll('*')) {
                                if (e.children.length) continue;
                                const t = (e.textContent || '').trim();
                                if (/^\d+$/.test(t)) { const px = parseFloat(getComputedStyle(e).fontSize); fs = Math.max(fs, px); if (t.length >= 3) big.push(t); }
                            }
                        }
                        host.remove();
                        return { fits: s.fits && s.fits.pages >= 1, cells: cells.length, over, fs, big: big.slice(0, 4), note: s.fits && s.fits.note };
                    };
                    return { b: await one({ band: 225 }), d: await one({}) };
                }, { ...h, size });
                const where = `${h.id} independent ${size} band 225`;
                if (f.b.err) { found['T15-FIT'].push(`${where}: buildSheet threw ${f.b.err}`); continue; }
                if (f.b.fits === false) found['T15-FIT'].push(`${where}: buildSheet says it does not fit`);
                if (!f.b.cells) found['T15-FIT'].push(`${where}: no cells`);
                if (f.b.over.length) found['T15-FIT'].push(`${where}: ${f.b.over.length} cell(s) with ink outside the cell (${f.b.over.slice(0, 3).join(', ')})`);
                if (!f.d.err && f.d.fs && Math.abs(f.b.fs - f.d.fs) > 0.5) found['T15-FIT'].push(`${where}: fact digits ${f.b.fs.toFixed(1)} px, the 12 x 12 page's ${f.d.fs.toFixed(1)} px`);
                if (VERBOSE) console.log(`  ${where}: ${f.b.cells} cells, fits ${f.b.fits}, digits ${f.b.fs} px (default ${f.d.fs}), 3-digit ${f.b.big.join(' ')}`);
            }
        }
    }
} finally { await app.close(); }
let n = 0;
for (const rule of RULES) {
    if (!want.has(rule)) continue;
    const f = found[rule];
    n += f.length;
    console.log(`${rule} ${f.length ? `FAIL ${f.length}` : 'PASS'}`);
    for (const x of f.slice(0, 12)) console.log(`  ${rule} ${x}`);
}
console.log(n ? `${TOOL}: FAIL (${n})` : `${TOOL}: OK (${[...want].filter((r) => RULES.includes(r)).join(', ')}; ${mine.map((h) => h.id).join(', ')})`);
process.exit(n ? 1 : 0);
