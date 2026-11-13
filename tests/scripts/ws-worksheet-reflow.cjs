// ws-worksheet-reflow — the online worksheet's LAYOUT ratchet against what master prints (lf-hosts critic r1 F1, lead
// ruling 2026-11-13). Hand-off 1 raised the worksheet grid digit to 40 / 48 / 56 px; no check looked at the sheet's layout,
// and the raise broke it: placevalue:expand dropped from 2 columns to 1 at 1280 (cards 231 -> 432 px wide, answer boxes
// stretched to about 260 px, the third wrapping), sub_100_no_regroup's answer box grew 144 x 192 -> 160 x 252, fact cards
// grew 28-56 px. The contract's worksheet digit floor is 29 px (the SP table), and master's
// sizes hold it; this ratchet keeps the sheet where master has it.
//
//   node tests/scripts/ws-worksheet-reflow.cjs                      # judge the sample against the pinned baseline
//   node tests/scripts/ws-worksheet-reflow.cjs --skills a:b,c:d      # judge only these (each must be in the baseline)
//   node tests/scripts/ws-worksheet-reflow.cjs --sample-only a:b     # judge only these members of the pinned sample (a backtest
//                                                                    # row on one skill; precritic runs the whole sample)
//   node tests/scripts/ws-worksheet-reflow.cjs --pin                 # re-pin the baseline from THIS tree (pin from master)
//   node tests/scripts/ws-worksheet-reflow.cjs --self-test           # the judging rules on fixed numbers (no browser)
//   MQ_ROOT=<checkout> ... serves another tree (ws-backtest commit-pair rows)
//
// For each sample skill (placevalue:expand, subtraction:sub_100_no_regroup, multiplication:mult_facts, addition:add_facts,
// subtraction:sub_word_problems, patterns:number_patterns_rule) at 820 x 1180, 1024 x 768, 1280 x 900 and 1366 x 768 (the screen targets; the lead's
// 2026-11-13 scope change dropped the phone width) it renders the online worksheet as a pupil opens it
// (initWorksheet, 6 cards, seeded), waits for the grid's layout pass, and measures: the grid's column count, the tallest
// card, the largest typed answer place, and the worst card's largest numeral. Against design/audit/baselines/worksheet-reflow.json:
//   WS-REFLOW  the column count does not fall; the tallest card grows no more than 6 px; the largest answer place grows no
//              more than 6 px in either direction (a layout change that should land is re-pinned with --pin, in the same change).
//              (lf-hosts critic r2 F5) Nor does the tallest card or the largest answer place SHRINK by more than 6 px, the card
//              width change by more than 6 px either way, or any card's height move by more than 6 px (card by card).
//   WS-DIGIT   the worst card's numeral is not smaller than master's (0.5 px): a worksheet digit never falls below what master
//              prints (the ruling's no-regression floor; the 29 px contract floor itself is ws-screen-ink-size TEXT-SIZE's and
//              ws-screen-slots --screen-digit's). (r2 F5) Nor is ANY card's numeral smaller than that card's on master.
// Prints one line per (skill, width) and `ws-worksheet-reflow: OK` / `FAIL - ...`; exit 1 on FAIL, 2 on a usage error.
// A render that measured nothing (no grid, 0 cards) or a key missing from the baseline is a FAIL, never a pass.
'use strict';
const fs = require('fs');
const path = require('path');

const TOOL = 'ws-worksheet-reflow';
const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const say = (...a) => console.log(...a);
const BASE = path.resolve(__dirname, '..', '..', 'design/audit/baselines/worksheet-reflow.json');
const SAMPLE = ['placevalue:expand', 'subtraction:sub_100_no_regroup', 'multiplication:mult_facts', 'addition:add_facts', 'subtraction:sub_word_problems', 'patterns:number_patterns_rule'];
// the screen targets (lead 2026-11-13: no phone width), from the one table (lf-hosts critic r2 F2)
const SW = require('../lib/ws-screen-widths.cjs');
const WIDTHS = [...SW.SCREEN_WIDTHS].sort((a, b) => a - b).map((w) => ({ w, h: SW.heightOf(w) }));
const CARDS = 6;
const TOL_H = 6;      // px a card / answer place may grow
const TOL_D = 0.5;    // px a numeral may shrink (rounding)

/** The verdicts on one measure against its baseline: [] when it holds. */
function judge(m, b) {
    const out = [];
    if (!m || m.error) return [`WS-REFLOW nothing measured (${m ? m.error : 'no render'})`];
    if (!b) return ['WS-REFLOW no baseline for this key (pin it from master with --pin)'];
    if (m.cols < b.cols) out.push(`WS-REFLOW columns ${b.cols} -> ${m.cols} (the grid dropped a column)`);
    if (m.cardH > b.cardH + TOL_H) out.push(`WS-REFLOW tallest card ${b.cardH} -> ${m.cardH} px (+${Math.round(m.cardH - b.cardH)}, want <= +${TOL_H})`);
    if (b.boxW && (m.boxW > b.boxW + TOL_H || m.boxH > b.boxH + TOL_H)) out.push(`WS-REFLOW largest answer place ${b.boxW} x ${b.boxH} -> ${m.boxW} x ${m.boxH} px (want <= +${TOL_H})`);
    if (b.digit && !(m.digit >= b.digit - TOL_D)) out.push(`WS-DIGIT worst card's numeral ${b.digit} -> ${m.digit} px (a worksheet digit never falls below master's)`);
    // lf-hosts critic r2 F5: the ratchet caught growth only. A sheet that SHRINKS (a card or an answer place smaller than
    // master's by more than the tolerance), a card WIDTH that changes either way, and a numeral that drops on ANY card (not
    // only the worst card's) are findings too.
    if (m.cardH < b.cardH - TOL_H) out.push(`WS-REFLOW tallest card ${b.cardH} -> ${m.cardH} px (${Math.round(m.cardH - b.cardH)}, want >= -${TOL_H}: the sheet shrank)`);
    if (b.boxW && (m.boxW < b.boxW - TOL_H || m.boxH < b.boxH - TOL_H)) out.push(`WS-REFLOW largest answer place ${b.boxW} x ${b.boxH} -> ${m.boxW} x ${m.boxH} px (shrank; want >= -${TOL_H})`);
    if (b.cardW && Math.abs(m.cardW - b.cardW) > TOL_H) out.push(`WS-REFLOW card width ${b.cardW} -> ${m.cardW} px (${m.cardW > b.cardW ? '+' : ''}${Math.round(m.cardW - b.cardW)}, want within ${TOL_H})`);
    if (Array.isArray(b.cardHs) && Array.isArray(m.cardHs) && b.cardHs.length === m.cardHs.length) {
        const moved = b.cardHs.map((h, i) => [i, h, m.cardHs[i]]).filter(([, h, x]) => Math.abs(x - h) > TOL_H);
        if (moved.length) out.push(`WS-REFLOW ${moved.length} card(s) changed height by more than ${TOL_H} px: ${moved.slice(0, 3).map(([i, h, x]) => `card ${i + 1} ${h} -> ${x}`).join(', ')}`);
    } else if (Array.isArray(b.cardHs) && m.cardHs && b.cardHs.length !== m.cardHs.length) out.push(`WS-REFLOW card count ${b.cardHs.length} -> ${m.cardHs.length}`);
    if (Array.isArray(b.digits) && Array.isArray(m.digits) && b.digits.length === m.digits.length) {
        const drop = b.digits.map((d, i) => [i, d, m.digits[i]]).filter(([, d, x]) => d > 0 && !(x >= d - TOL_D));
        if (drop.length) out.push(`WS-DIGIT ${drop.length} card(s) print a smaller numeral than master's: ${drop.slice(0, 3).map(([i, d, x]) => `card ${i + 1} ${d} -> ${x} px`).join(', ')}`);
    }
    return out;
}

/** In the page: the sheet's measure. */
function MEASURE() {
    const g = document.getElementById('worksheetGrid');
    if (!g) return { error: 'no #worksheetGrid' };
    const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const cards = Array.from(g.querySelectorAll('.problem-card.mq-wscard')).filter(vis);
    if (!cards.length) return { error: '0 worksheet cards' };
    const tops = new Map();
    for (const c of cards) { const t = Math.round(c.getBoundingClientRect().top); tops.set(t, (tops.get(t) || 0) + 1); }
    const cols = Math.max(...tops.values());
    const cardH = Math.max(...cards.map((c) => c.getBoundingClientRect().height));
    const cardW = Math.max(...cards.map((c) => c.getBoundingClientRect().width));
    let boxW = 0, boxH = 0;
    for (const c of cards) for (const el of c.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=button]), textarea')) {
        if (!vis(el) || el.closest('.mq-wsbar')) continue;
        const r = el.getBoundingClientRect();
        if (r.width * r.height > boxW * boxH) { boxW = r.width; boxH = r.height; }
    }
    const digitOf = (c) => {
        const paper = c.querySelector('.mq-wspaper') || c;
        let px = 0;
        const w = document.createTreeWalker(paper, NodeFilter.SHOW_TEXT);
        for (let n = w.nextNode(); n; n = w.nextNode()) {
            if (!/\d/.test(n.nodeValue || '')) continue;
            const el = n.parentElement;
            if (!el || !vis(el) || el.closest('.mq-sr, [aria-hidden="true"]')) continue;
            px = Math.max(px, parseFloat(getComputedStyle(el).fontSize) || 0);
        }
        return px;
    };
    const perCard = cards.map(digitOf);
    const ds = perCard.filter((x) => x > 0);
    const r1 = (x) => Math.round(x * 10) / 10;
    return { cards: cards.length, cols, cardH: r1(cardH), cardW: r1(cardW), boxW: r1(boxW), boxH: r1(boxH), digit: ds.length ? r1(Math.min(...ds)) : 0,
        cardHs: cards.map((c) => r1(c.getBoundingClientRect().height)), digits: perCard.map(r1) };
}

function selfTest() {
    const b = { cols: 2, cardH: 300, cardW: 300, boxW: 144, boxH: 192, digit: 29, cardHs: [300, 290], digits: [29, 40] };
    const cases = [
        ['same layout', { cols: 2, cardH: 300, boxW: 144, boxH: 192, digit: 29 }, []],
        ['r1 expand at 1280: 2 -> 1 column', { cols: 1, cardH: 300, boxW: 144, boxH: 192, digit: 29 }, [/columns 2 -> 1/]],
        ['r1 sub_100 answer box 144 x 192 -> 160 x 252', { cols: 2, cardH: 300, boxW: 160, boxH: 252, digit: 29 }, [/answer place/]],
        ['r1 fact card +28 px', { cols: 2, cardH: 328, boxW: 144, boxH: 192, digit: 29 }, [/tallest card/]],
        ['a card 4 px taller holds', { cols: 2, cardH: 304, boxW: 144, boxH: 192, digit: 29 }, []],
        ['more columns hold', { cols: 3, cardH: 300, boxW: 144, boxH: 192, digit: 29 }, []],
        ['a numeral under master\'s', { cols: 2, cardH: 300, boxW: 144, boxH: 192, digit: 24 }, [/WS-DIGIT/]],
        ['nothing measured', { error: '0 worksheet cards' }, [/nothing measured/]],
        // lf-hosts critic r2 F5: shrinking, a card width change, a numeral drop on a card that is not the worst one
        ['r2 F5 the tallest card shrinks 20 px', { cols: 2, cardH: 280, boxW: 144, boxH: 192, digit: 29 }, [/shrank/]],
        ['r2 F5 the answer place shrinks to 120 x 150', { cols: 2, cardH: 300, boxW: 120, boxH: 150, digit: 29 }, [/answer place.*shrank/]],
        ['r2 F5 the card width changes 300 -> 340', { cols: 2, cardH: 300, cardW: 340, boxW: 144, boxH: 192, digit: 29 }, [/card width 300 -> 340/]],
        ['r2 F5 card 2 numeral 40 -> 32 (the worst card holds 29)', { cols: 2, cardH: 300, boxW: 144, boxH: 192, digit: 29, cardHs: [300, 290], digits: [29, 32] }, [/WS-DIGIT 1 card\(s\).*card 2 40 -> 32/]],
        ['r2 F5 card 2 shrinks 290 -> 250 (the tallest holds)', { cols: 2, cardH: 300, boxW: 144, boxH: 192, digit: 29, cardHs: [300, 250], digits: [29, 40] }, [/card 2 290 -> 250/]],
    ];
    let bad = 0;
    for (const [name, m, want] of cases) {
        const v = judge(m, b);
        const ok = v.length === want.length && want.every((re, i) => re.test(v[i]));
        if (!ok) bad++;
        say(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: ${v.join('; ') || 'holds'}`);
    }
    if (judge({ cols: 2, cardH: 1, boxW: 0, boxH: 0, digit: 1 }, null).length !== 1) { bad++; say('  FAIL a key with no baseline must fail'); }
    say(bad ? `${TOOL}: FAIL - self-test (${bad})` : `${TOOL}: OK (self-test, ${cases.length + 1} cases)`);
    process.exit(bad ? 1 : 0);
}

async function main() {
    if (has('self-test')) return selfTest();
    const VALUE = new Set(['skills', 'sample-only', 'baseline']), BOOL = new Set(['pin', 'self-test', 'print-widths']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && !BOOL.has(m[1]))) { say(`${TOOL}: unknown argument ${argv[i]}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    if (has('print-widths')) { say(`widths: ${WIDTHS.map((v) => v.w).join(',')}`); return; }
    const basePath = path.resolve(arg('baseline', BASE));
    const pin = has('pin');
    const skills = String(arg('skills', arg('sample-only', SAMPLE.join(',')))).split(',').map((s) => s.trim()).filter(Boolean);
    if (has('sample-only') && skills.some((k) => !SAMPLE.includes(k))) { say(`${TOOL}: --sample-only takes members of the sample (${SAMPLE.join(', ')})`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
    let base = null;
    if (!pin) {
        try { base = JSON.parse(fs.readFileSync(basePath, 'utf8')); } catch (e) { say(`${TOOL}: cannot read the baseline ${basePath}: ${e.message}`); say(`${TOOL}: FAIL - no baseline`); process.exit(2); }
    }
    const { open } = require('../lib/ws-harness.cjs');
    const app = await open({ seed: 1, viewport: { width: WIDTHS[0].w, height: WIDTHS[0].h, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', (d) => d.accept().catch(() => {}));
    const rows = {};
    const fails = [];
    try {
        await page.waitForFunction(() => typeof window.initWorksheet === 'function' && !!window.SKILLS, { timeout: 30000 });
        const live = await page.evaluate(() => { const o = []; for (const [c, l] of Object.entries(window.SKILLS)) for (const s of l || []) if (s && s.v && !s.retired) o.push(`${c}:${s.v}`); return o; });
        const unknown = skills.filter((k) => !live.includes(k));
        if (unknown.length) { say(`${TOOL}: FAIL - not live skill(s): ${unknown.join(', ')}`); await app.close(); process.exit(1); }
        for (const vp of WIDTHS) {
            await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: 1 });
            for (const s of skills) {
                const [c, k] = s.split(':');
                const key = `${s}@${vp.w}`;
                let m;
                try {
                    await page.reload({ waitUntil: 'networkidle2' });
                    await page.waitForFunction(() => typeof window.initWorksheet === 'function' && !!window.SKILLS, { timeout: 30000 });
                    const ok = await page.evaluate((c, k, n) => {
                        try {
                            if (window.__wsReseed) window.__wsReseed(11);
                            if (window.setUserRole) window.setUserRole('student', { persist: false });
                            const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = n;
                            window.initWorksheet(); return true;
                        } catch (e) { return String((e && e.message) || e).slice(0, 160); }
                    }, c, k, CARDS);
                    if (ok !== true) throw new Error(`the worksheet did not render (${ok})`);
                    await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 15000 }).catch(() => {});
                    try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
                    // the late mounts (word-work twin) and the grid's second layout pass
                    await page.waitForFunction(() => !Array.from(document.querySelectorAll('#worksheetGrid [data-mq-cell]')).some((b) => !b.querySelector('input, textarea') && !b.matches('input, textarea')), { timeout: 8000, polling: 50 }).catch(() => {});
                    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 300)))));
                    m = await page.evaluate(MEASURE);
                } catch (e) { m = { error: String(e.message || e).split('\n')[0] }; }
                rows[key] = m;
                const v = pin ? (m.error ? [`WS-REFLOW nothing measured (${m.error})`] : []) : judge(m, base.keys[key]);
                for (const f of v) fails.push(`${key}: ${f}`);
                say(`${key.padEnd(40)} ${m.error ? 'ERR ' + m.error : `${m.cols} col(s), tallest card ${m.cardH} px (w ${m.cardW}), answer place ${m.boxW} x ${m.boxH}, numeral ${m.digit} px`}${v.length ? '\n    ' + v.join('\n    ') : ''}`);
            }
        }
    } finally { await app.close(); }
    if (pin) {
        if (fails.length) { say(`${TOOL}: FAIL - not pinned: ${fails.join(' | ')}`); process.exit(1); }
        const prev = (() => { try { return JSON.parse(fs.readFileSync(basePath, 'utf8')); } catch (e) { return { keys: {} }; } })();
        const keys = Object.assign({}, prev.keys || {}, rows);
        const { execSync } = require('child_process');
        let head = '?';
        try { head = execSync('git rev-parse --short=9 HEAD', { cwd: process.env.MQ_ROOT || path.resolve(__dirname, '..', '..') }).toString().trim(); } catch (e) { /* none */ }
        fs.writeFileSync(basePath, JSON.stringify({ tool: TOOL, about: 'The online worksheet layout as master prints it (lf-hosts critic r1 F1): per skill@width the grid column count, tallest card, largest answer place and worst card numeral. Re-pin only from master, or in the change that moves the layout on purpose.', pinnedFrom: head, cards: CARDS, keys }, null, 1) + '\n');
        say(`${TOOL}: OK (pinned ${Object.keys(rows).length} key(s) from ${head} into ${path.relative(process.cwd(), basePath)})`);
        return;
    }
    const n = skills.length * WIDTHS.length;
    if (fails.length) { say(`${TOOL}: FAIL - ${fails.length} finding(s) (${n} worksheet renders): ${fails.slice(0, 4).join(' | ').slice(0, 600)}`); process.exit(1); }
    say(`${TOOL}: OK (${skills.length} skill(s) x ${WIDTHS.length} widths: columns, card heights, answer places and numerals hold against ${base.pinnedFrom})`);
}
main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(1); });
