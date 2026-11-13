#!/usr/bin/env node
// ws-pv-screen-numeral — the online worksheet draws a place-value number sentence's numerals at the worksheet's digit floor
// (lf-placevalue live1; lf-hosts critic via the lead, 2026-11-13: placevalue:expand's "144 = [ ] + [ ] + [ ]" was set at 18 px
// - the sentence-text size - under the 29 px worksheet digit floor (screen-cell.css .mq-grid-cell --mq-digit), and the legacy
// digit fit could only zoom it to 22 px at 390 px, its "+" left alone at a line's end).
//
//   tests/scripts/mq-browser-run.sh node tests/scripts/ws-pv-screen-numeral.cjs                 # placevalue:expand
//   ... --skills placevalue:expand --widths 1280,820,390 --n 4
//   MQ_ROOT=<tree> ... (ws-backtest commit-pair)
//
// WS-NUMERAL   on the online worksheet (cards 1..n at 1280, 820 and 390 px), every run of digits in the item's own sentence (the
//              instruction, the card bar, inputs and screen-only chrome excluded) is set at >= 29 px (CSS font-size, as the critic
//              reads it) AND drawn at >= 29 px (font-size x the cell's digit-fit zoom), in Andika at weight >= 700 (the paper
//              prints a place-value numeral bold).
// WS-WRAP-OP   no line of the sentence ends in an operator (+ = − ×) with its box on the next line.
// Prints `ws-pv-screen-numeral: OK` / `FAIL (n)` last; exits 1 on FAIL.
const H = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const SKILLS = list(arg('skills', 'placevalue:expand'));
const WIDTHS = list(arg('widths', '1280,820,390')).map(Number);
const N = Number(arg('n', 4));
const FLOOR = 29;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readCard(sel) {
    const card = document.querySelector(sel);
    if (!card) return null;
    const paper = card.querySelector('.mq-wspaper') || card;
    const runs = [];
    const tw = document.createTreeWalker(paper, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const el = n.parentElement;
        const t = n.nodeValue.trim();
        if (!/\d/.test(t) || !el || !el.getClientRects().length) continue;
        if (el.closest('.mq-instr, .mq-wsbar, .hint-popup, [data-mq-screen-only], input, button, label, .ws-tab, [data-ws-label], .mq-sr')) continue;
        const cs = getComputedStyle(el);
        let z = 1;
        for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const v = parseFloat(getComputedStyle(a).zoom); if (v > 0) z *= v; }
        runs.push({ t: t.slice(0, 20), px: parseFloat(cs.fontSize) || 0, drawn: (parseFloat(cs.fontSize) || 0) * z, weight: Number(cs.fontWeight), family: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim() });
    }
    // WS-WRAP-OP: an operator that is the last thing on its line (the next box starts a line below it)
    const wraps = [];
    const line = paper.querySelector('.mq-ibline');
    if (line) {
        const boxes = [...line.querySelectorAll('.mq-cellbox')];
        const r = document.createRange();
        const tw2 = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
        for (let n = tw2.nextNode(); n; n = tw2.nextNode()) {
            for (let i = 0; i < n.nodeValue.length; i++) {
                if (!/[+=−×]/.test(n.nodeValue[i])) continue;
                r.setStart(n, i); r.setEnd(n, i + 1);
                const op = r.getClientRects()[0];
                if (!op) continue;
                const next = boxes.find((b) => (n.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
                if (next && next.getBoundingClientRect().top > op.bottom - 2) wraps.push(n.nodeValue[i]);
            }
        }
    }
    return { runs, wraps, text: (line || paper).textContent.replace(/\s+/g, ' ').trim().slice(0, 40) };
}

(async () => {
    const app = await H.open({ seed: 1 });
    const page = app.page;
    const bad = [];
    let judged = 0;
    for (const w of WIDTHS) {
        await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
        for (const key of SKILLS) {
            const [c, k] = key.split(':');
            const ok = await page.evaluate((c, k, n) => {
                try { const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = n; window.initWorksheet(); return true; } catch (e) { return String(e); }
            }, c, k, N);
            if (ok !== true) { bad.push(`BUILD ${key} worksheet@${w}: ${ok}`); continue; }
            await sleep(1200);
            for (let i = 0; i < N; i++) {
                const r = await page.evaluate(readCard, `#ws_card_${i}`);
                if (!r) continue;
                judged++;
                const at = `${key} worksheet@${w} card ${i + 1} ("${r.text}")`;
                if (!r.runs.length) { bad.push(`WS-NUMERAL ${at}: no numeral read`); continue; }
                for (const x of r.runs) {
                    const why = [];
                    if (x.px < FLOOR - 0.5) why.push(`set at ${Math.round(x.px * 10) / 10} px`);
                    if (x.drawn < FLOOR - 0.5) why.push(`drawn at ${Math.round(x.drawn * 10) / 10} px`);
                    if (!(x.weight >= 700)) why.push(`weight ${x.weight}`);
                    if (!/andika/i.test(x.family)) why.push(`font ${x.family}`);
                    if (why.length) { bad.push(`WS-NUMERAL ${at}: "${x.t}" ${why.join(', ')} (want >= ${FLOOR} px, Andika 700)`); break; }
                }
                if (r.wraps.length) bad.push(`WS-WRAP-OP ${at}: "${r.wraps[0]}" ends a line, its box on the next`);
            }
        }
    }
    await app.close();
    console.log(`  ${judged} worksheet cards judged (${SKILLS.join(', ')} at ${WIDTHS.join(' / ')} px)`);
    for (const b of bad.slice(0, 20)) console.log(`  FAIL ${b}`);
    console.log(`ws-pv-screen-numeral: ${bad.length ? `FAIL (${bad.length})` : 'OK'}`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.log(String((e && e.stack) || e)); console.log('ws-pv-screen-numeral: FAIL (error)'); process.exit(2); });
