#!/usr/bin/env node
// ws-pv-compare-deal — placevalue:compare deals what its card teaches (lf-placevalue compare r2; critic r1 F2-F6). Node only:
// items from generateQuestionFor (seeded, as a page deals them), the provider from the kit registry of the same tree.
//
//   node tests/scripts/ws-pv-compare-deal.mjs                       # every check
//   node tests/scripts/ws-pv-compare-deal.mjs --only CLOSE-DEPTH,MIXED-1DIGIT
//   node tests/scripts/ws-pv-compare-deal.mjs --root <tree>         # another checkout (ws-backtest commit-pair: {root})
//
// EQ-LIVE (F4)          live play (no item seed, no item index - the practice card, the online worksheet, the quiz) does
//                       not pin "=": over 20 fresh sessions (one node process each) of 6 items, no position holds the "="
//                       in more than half the sessions that dealt one, and the sessions deal about one "=" in six (0.5-1.5).
//                       r1: every session opened on "897 = 897".
// CLOSE-DEPTH (F5)      closeness=close at band 9,999 and 999,999: the deciding place (the first different digit, from the
//                       left) spreads over place 2 .. the last, and at least a third of the unequal items are decided at
//                       place 3 or deeper. r1: every close 6-digit pair was decided at the 2nd digit.
// MIXED-1DIGIT (F6)     lengths=mixed at band 999: at most one item in five holds a 1-digit number (r1: 16 of 30), and at
//                       least a quarter put the bigger first digit on the shorter number (89 / 312, the card's M6).
// M6-WRONG (F3)         every wrong answer the provider names (what True or False?, Reason It and Error analysis show) is the
//                       card's M6 - M-C2 (the last digits) or M-C3 (the first digits of different lengths) - on the default,
//                       mixed and band 999,999 deals, and a mixed deal names M-C3 on at least a quarter of its items.
// WORKED-STEP-DOES (F2) no worked step restates the item ("Compare 419 and 470."), and a step that names digits marks them
//                       (a step mark the drawing shows).
// SIGN-PARITY (r2 N3)   on every offered option value, 4 pages of 30 seeded items: the share of ">" among the unequal items
//                       at even and at odd places is 0.25-0.75 each, and no page holds 4 consecutive items whose signs strictly
//                       alternate (> < > <; an "=" breaks a run). r2: lengths=mixed dealt > < > < down every page.
// EQ-SHARE (r2 N7)      the same pages: no "=" at item 1 or 2, and any n consecutive items hold at most ceil(n / 6) "="
//                       (r2: two "=" in one set of six, Test item 1 "724 = 724"), and an "=" item's Guided cue (the first
//                       worked step naming a number) is step 2, the one that decides it (r2: "Both have three digits.").
// Prints `ws-pv-compare-deal: OK` / `FAIL (n)` last; exits 1 on FAIL.
import { loadApp, fnv } from './ws-card-rulings.mjs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, resolve } from 'path';
import { spawn } from 'child_process';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(arg('root', process.env.MQ_ROOT || resolve(HERE, '..', '..')));
const ONLY = arg('only', '') ? arg('only').split(',') : null;
const on = (id) => !ONLY || ONLY.includes(id);
const quiet = () => { const s = {}; for (const k of ['log', 'warn', 'info', 'debug']) { s[k] = console[k]; console[k] = () => {}; } return () => Object.assign(console, s); };

// ---- a child: one live session of 6 items, printed as JSON (EQ-LIVE)
if (argv.includes('--live-session')) {
    const app = await loadApp(ROOT);
    const out = [];
    for (let i = 0; i < 6; i++) {
        const un = quiet();
        let q = null;
        try { q = app.gq.generateQuestionFor({ category: 'placevalue', skill: 'compare' }); } catch (e) { q = null; } finally { un(); }
        out.push(q && q.pv ? q.pv.a === q.pv.b : null);
    }
    process.stdout.write(JSON.stringify(out) + '\n');
    process.exit(0);
}

const app = await loadApp(ROOT);
const { getProvider } = await import(pathToFileURL(resolve(ROOT, 'js/modules/sheet/index.js')).href);
const prov = getProvider('placevalue', 'compare');
const bad = [];
const deal = (opts, n = 120, tag = '') => {
    const base = fnv(`placevalue:compare${tag}`);
    const out = [];
    for (let i = 0; i < n; i++) {
        const un = quiet();
        let q = null;
        try { q = app.gq.generateQuestionFor({ category: 'placevalue', skill: 'compare', opts, seed: (base + i) >>> 0, itemIndex: i % 30, itemCount: 30 }); } catch (e) { q = null; } finally { un(); }
        if (q && q.pv && q.pv.a !== undefined) out.push(q);
    }
    return out;
};
const firstDiff = (a, b) => { const sa = String(a), sb = String(b); return sa.length !== sb.length ? -1 : [...sa].findIndex((d, k) => d !== sb[k]); };

if (on('EQ-LIVE')) {
    const N = 20;
    const runOne = () => new Promise((res) => {
        const c = spawn(process.execPath, [fileURLToPath(import.meta.url), '--live-session', '--root', ROOT], { stdio: ['ignore', 'pipe', 'ignore'] });
        let s = ''; c.stdout.on('data', (d) => { s += d; });
        c.on('close', () => { try { res(JSON.parse(s.trim().split('\n').pop())); } catch (e) { res(null); } });
    });
    const sessions = [];
    for (let k = 0; k < N; k += 5) sessions.push(...await Promise.all(Array.from({ length: Math.min(5, N - k) }, runOne)));
    const ok = sessions.filter(Array.isArray);
    const pos = Array(6).fill(0);
    let eqs = 0, withEq = 0;
    for (const s of ok) { const n = s.filter((x) => x === true).length; eqs += n; if (n) withEq++; s.forEach((x, i) => { if (x === true) pos[i]++; }); }
    const rate = ok.length ? eqs / ok.length : 0;
    const top = Math.max(...pos);
    console.log(`EQ-LIVE: ${ok.length} sessions, "=" per 6 items ${rate.toFixed(2)}, by position ${pos.join(' ')}`);
    if (ok.length < N / 2) bad.push(`EQ-LIVE: only ${ok.length} of ${N} live sessions ran`);
    if (withEq >= 4 && top > withEq / 2) bad.push(`EQ-LIVE: "=" sits on item ${pos.indexOf(top) + 1} in ${top} of ${withEq} live sessions that deal one (pinned)`);
    if (rate < 0.5 || rate > 1.5) bad.push(`EQ-LIVE: ${rate.toFixed(2)} "=" items per 6 live items (want about 1)`);
}

if (on('CLOSE-DEPTH')) {
    for (const band of [9999, 999999]) {
        const nd = String(band).length;
        const at = deal({ band, closeness: 'close' }, 120, `close${band}`).map((q) => firstDiff(q.pv.a, q.pv.b)).filter((i) => i >= 0);
        const hist = Array(nd).fill(0); at.forEach((i) => hist[i]++);
        const deep = at.filter((i) => i >= 2).length;
        console.log(`CLOSE-DEPTH band ${band}: deciding place 1..${nd}: ${hist.join(' ')}`);
        if (deep < at.length / 3) bad.push(`CLOSE-DEPTH band ${band}: ${deep} of ${at.length} close items decided at place 3 or deeper (want a third)`);
        for (let i = 1; i < nd; i++) if (!hist[i]) bad.push(`CLOSE-DEPTH band ${band}: no close item is decided at place ${i + 1}`);
    }
}

if (on('MIXED-1DIGIT')) {
    const qs = deal({ lengths: 'mixed' }, 120, 'mixed');
    const one = qs.filter((q) => Math.min(String(q.pv.a).length, String(q.pv.b).length) === 1).length;
    const trap = qs.filter((q) => { const [s, l] = String(q.pv.a).length < String(q.pv.b).length ? [q.pv.a, q.pv.b] : [q.pv.b, q.pv.a]; return String(s).length < String(l).length && String(s)[0] > String(l)[0]; }).length;
    console.log(`MIXED-1DIGIT: ${qs.length} items, ${one} with a 1-digit number, ${trap} with the bigger first digit on the shorter number`);
    if (one > qs.length / 5) bad.push(`MIXED-1DIGIT: ${one} of ${qs.length} mixed items hold a 1-digit number (want at most a fifth)`);
    if (trap < qs.length / 4) bad.push(`MIXED-1DIGIT: ${trap} of ${qs.length} mixed items put the bigger first digit on the shorter number (89 / 312; want a quarter)`);
}

if (on('M6-WRONG')) {
    for (const [tag, opts] of [['default', {}], ['mixed', { lengths: 'mixed' }], ['band 999999', { band: 999999 }], ['close 999999', { band: 999999, closeness: 'close' }]]) {
        const qs = deal(opts, 120, `m6${tag}`);
        const ws = qs.map((q) => { try { return prov.wrongAnswer(q); } catch (e) { return null; } }).filter((w) => w && w.value !== undefined && w.value !== null);
        const other = ws.filter((w) => !['M-C2', 'M-C3'].includes(w.misconception));
        const c3 = ws.filter((w) => w.misconception === 'M-C3').length;
        console.log(`M6-WRONG ${tag}: ${ws.length} of ${qs.length} items name a wrong answer, ${other.length} not M6, ${c3} M-C3`);
        if (other.length) bad.push(`M6-WRONG ${tag}: ${other.length} of ${ws.length} named wrong answers are not M6 (${[...new Set(other.map((w) => w.misconception))].join(', ')})`);
        if (ws.length < qs.length / 2) bad.push(`M6-WRONG ${tag}: only ${ws.length} of ${qs.length} items have an M6 wrong answer (want half)`);
        if (tag === 'mixed' && c3 < qs.length / 4) bad.push(`M6-WRONG mixed: ${c3} of ${qs.length} items show the first-digit form M-C3 (want a quarter)`);
    }
}

if (on('WORKED-STEP-DOES')) {
    let n = 0;
    for (const opts of [{}, { lengths: 'mixed' }, { band: 999999 }]) {
        for (const q of deal(opts, 60, `steps${JSON.stringify(opts)}`)) {
            const steps = prov.workedSteps(q) || [];
            const nums = [q.pv.a, q.pv.b].map((v) => Number(v).toLocaleString('en-US'));
            for (const s of steps) {
                const t = String(s.text || '');
                const plain = t.replace(/(\d),(\d)/g, '$1$2').replace(new RegExp(`\\b(${nums.map((x) => x.replace(/,/g, '')).join('|')})\\b`, 'g'), '#').replace(/[.]/g, '').trim().toLowerCase();
                if (/^(compare )?# (and|with) #$/.test(plain) || /^compare #/.test(plain)) { bad.push(`WORKED-STEP-DOES: "${t}" only restates the item ${nums.join(' / ')}`); n++; }
                if (/\bdigits?\b/i.test(t) && /(^|[^\d,])\d([^\d,]|$)/.test(t) && !(s.marks || []).length) { bad.push(`WORKED-STEP-DOES: "${t}" names digits and marks nothing`); n++; }
                if (n > 8) break;
            }
        }
    }
}

const OPTION_DEALS = [['default', {}], ['mixed', { lengths: 'mixed' }], ['band 99', { band: 99 }], ['band 9999', { band: 9999 }],
    ['band 99999', { band: 99999 }], ['band 999999', { band: 999999 }], ['close', { closeness: 'close' }], ['far', { closeness: 'far' }],
    ['close 999999', { band: 999999, closeness: 'close' }]];
if (on('SIGN-PARITY') || on('EQ-SHARE')) {
    for (const [tag, opts] of OPTION_DEALS) {
        const qs = deal(opts, 120, `parity${tag}`);
        const sign = (q) => (q.pv.a > q.pv.b ? '>' : q.pv.a < q.pv.b ? '<' : '=');
        if (on('SIGN-PARITY')) {
            const share = (par) => { const u = qs.filter((q, i) => i % 2 === par && sign(q) !== '='); return u.length ? u.filter((q) => sign(q) === '>').length / u.length : 0.5; };
            const [ev, od] = [share(0), share(1)];
            let alt = 0, where = '';
            for (let p0 = 0; p0 < qs.length; p0 += 30) {
                const sg = qs.slice(p0, p0 + 30).map(sign);
                for (let i = 0; i + 3 < sg.length; i++) {
                    const w = sg.slice(i, i + 4);
                    if (!w.includes('=') && w[0] !== w[1] && w[1] !== w[2] && w[2] !== w[3]) { alt++; if (!where) where = `page ${p0 / 30 + 1} items ${i + 1}-${i + 4} ${w.join(' ')}`; }
                }
            }
            console.log(`SIGN-PARITY ${tag}: ">" at even places ${ev.toFixed(2)}, at odd ${od.toFixed(2)}, ${alt} strict 4-alternations`);
            if (ev < 0.25 || ev > 0.75 || od < 0.25 || od > 0.75) bad.push(`SIGN-PARITY ${tag}: the share of ">" is ${ev.toFixed(2)} at even places and ${od.toFixed(2)} at odd (want 0.25-0.75 each: the sign follows the item's parity)`);
            if (alt) bad.push(`SIGN-PARITY ${tag}: ${alt} runs of 4 strictly alternating signs, e.g. ${where}`);
        }
        if (on('EQ-SHARE') && opts.lengths !== 'mixed') {
            let n = 0;
            for (let p0 = 0; p0 < qs.length; p0 += 30) {
                const at = qs.slice(p0, p0 + 30).map((q, i) => (sign(q) === '=' ? i : -1)).filter((i) => i >= 0);
                n += at.length;
                if (at.some((i) => i < 2)) bad.push(`EQ-SHARE ${tag}: page ${p0 / 30 + 1} deals "=" at item ${at[0] + 1} (never item 1 or 2)`);
                for (let k = 1; k < at.length; k++) if (at[k] - at[k - 1] < 6) { bad.push(`EQ-SHARE ${tag}: page ${p0 / 30 + 1} deals "=" at items ${at[k - 1] + 1} and ${at[k] + 1} (any n items hold at most ceil(n/6))`); break; }
            }
            // (the Guided cue - guided.js hintOf: the first worked step that names a number - of an "=" item is the step that
            // decides it, step 2, never "Both have three digits.")
            for (const q of qs.filter((x) => sign(x) === '=').slice(0, 6)) {
                const st = (prov.workedSteps(q) || []).map((x) => String(x.text || ''));
                const at = st.findIndex((t) => /\d/.test(t) && !/^(Write|Check|Say)\b/i.test(t));
                if (at !== 1) { bad.push(`EQ-SHARE ${tag}: the "=" item ${q.pv.a}'s first step naming a number is step ${at + 1} ("${st[at] || st[0]}") - the Guided cue must be step 2, the one that decides "="`); break; }
            }
            console.log(`EQ-SHARE ${tag}: ${n} "=" in ${qs.length} items`);
            if (n < qs.length / 10) bad.push(`EQ-SHARE ${tag}: only ${n} "=" in ${qs.length} items (want about one in six)`);
        }
    }
}

for (const b of bad.slice(0, 20)) console.log(`  FAIL ${b}`);
console.log(`ws-pv-compare-deal: ${bad.length ? `FAIL (${bad.length})` : 'OK'}`);
process.exit(bad.length ? 1 : 0);
