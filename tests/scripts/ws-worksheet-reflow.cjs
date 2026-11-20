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
//   node tests/scripts/ws-worksheet-reflow.cjs --pin-slots           # add / refresh ONLY each key's slotXs from this tree (the
//                                                                    # other fields keep their pin; run it with MQ_ROOT=<master>)
//   node tests/scripts/ws-worksheet-reflow.cjs --self-test           # the judging rules on fixed numbers (no browser)
//   node tests/scripts/ws-worksheet-reflow.cjs --judge-fixture F     # judge a saved {baseline, measured} pair (no browser;
//                                                                    # backtest rows such as ws-reflow-slot-x)
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
//              (lf-hosts critic r3) Nor does any typed answer place move sideways inside its card by more than 1.5 px (slot by
//              slot: its left edge from the card's left edge; judged when the baseline carries `slotXs`).
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
const TOL_X = 1.5;    // px a typed answer place may move sideways inside its card (lf-hosts critic r3: the r1 F4 4 px gap
                      // moves boxes by up to 1 px; a 2 px move is a layout change)

/**
 * Templates exempt from the ratchet (lead ruling 2026-11-13, lf-ops-props critic cbt r1 D2): a worksheet card that draws a
 * count-row train takes the whole grid row so its wrapped train holds >= 3 numbers a line (ws-screen-slots TRAIN-FIT) - a
 * pupil-reading finding, where this ratchet exists to stop ACCIDENTAL reflow. Keyed on the TEMPLATE (the drawing's
 * data-mq-template / its k2-countrow root), never on skill ids: a sheet any of whose cards draws an exempt template is not
 * judged (the spanning card reflows the grid around it); every other card and sheet is judged as before.
 */
const EXEMPT_TEMPLATES = ['count-row'];
/** The exempt templates a measured sheet draws ([] when none). */
const exemptOf = (m) => (m && Array.isArray(m.templates) ? [...new Set(m.templates.flat())].filter((t) => EXEMPT_TEMPLATES.includes(t)) : []);

/** The verdicts on one measure against its baseline: [] when it holds. */
function judge(m, b) {
    const out = [];
    if (!m || m.error) return [`WS-REFLOW nothing measured (${m ? m.error : 'no render'})`];
    // (critic cbt r2 E9, lead ruling 2026-11-14: the exemption is PER CARD) a card that spans the row in a grid that could hold
    // two columns (>= 620 px) must earn it: a count-row card only when its train is wider than a 2-column column (FULLROW-SPAN),
    // and any full-row card's content uses >= 50 % of its width (FULLROW-USE). The sheet is exempt from the ratchet only when
    // every spanning card is such a count-row card.
    const full = [];
    if (Array.isArray(m.spans) && m.gridW >= 620) m.spans.forEach((sp, i) => {
        if (!sp) return;
        const cr = Array.isArray(m.templates) && (m.templates[i] || []).includes('count-row');
        if (cr && m.trainWs && m.avail2 && m.trainWs[i] > 0 && m.trainWs[i] <= m.avail2[i] + 1) full.push(`FULLROW-SPAN card ${i + 1} spans the row but its train (${m.trainWs[i]} px) fits a column of a 2-column grid (${m.avail2[i]} px): it stays in the grid (lead ruling 2026-11-14, cbt r3 E9)`);
        // (the card's usable width: its cell's content box when measured, else the card)
        const W = m.innerWs && m.innerWs[i] > 0 ? m.innerWs[i] : m.cardWs ? m.cardWs[i] : 0;
        if (m.contentWs && W > 0 && m.contentWs[i] < 0.5 * W) full.push(`FULLROW-USE card ${i + 1} spans the row but its content uses ${m.contentWs[i]} of ${W} px (${Math.round((100 * m.contentWs[i]) / W)} %, want >= 50 %: critic cbt r2 E9)`);
    });
    if (full.length) return full;
    if (exemptOf(m).length && Array.isArray(m.spans) ? m.spans.some(Boolean) : exemptOf(m).length) return [];
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
    if (Array.isArray(b.slotXs) && Array.isArray(m.slotXs)) {
        const moved = [];
        if (b.slotXs.length !== m.slotXs.length) out.push(`WS-REFLOW slot x: ${b.slotXs.length} card(s) in the baseline, ${m.slotXs.length} measured`);
        else b.slotXs.forEach((row, i) => {
            const now = m.slotXs[i] || [];
            if (row.length !== now.length) { moved.push(`card ${i + 1} has ${now.length} answer place(s), master ${row.length}`); return; }
            row.forEach((x, j) => { if (Math.abs(now[j] - x) > TOL_X) moved.push(`card ${i + 1} slot ${j + 1} x ${x} -> ${now[j]} px`); });
        });
        if (moved.length) out.push(`WS-REFLOW ${moved.length} answer place(s) moved sideways by more than ${TOL_X} px: ${moved.slice(0, 3).join(', ')}`);
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
    // each card's typed answer places, left edge from the card's left edge, in DOM order (lf-hosts critic r3: per-slot x)
    const slotXs = cards.map((c) => { const cl = c.getBoundingClientRect().left; return Array.from(c.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=button]), textarea')).filter((el) => vis(el) && !el.closest('.mq-wsbar')).map((el) => Math.round((el.getBoundingClientRect().left - cl) * 10) / 10); });
    const perCard = cards.map(digitOf);
    // each card's drawn kit templates (the EXEMPT_TEMPLATES test; the count-row root class where the twin carries no attribute)
    const templates = cards.map((c) => [...new Set([...c.querySelectorAll('[data-mq-template]')].map((e) => e.getAttribute('data-mq-template')).concat(c.querySelector('.k2-cell.k2-countrow') ? ['count-row'] : []))]);
    const ds = perCard.filter((x) => x > 0);
    const r1 = (x) => Math.round(x * 10) / 10;
    // (critic cbt r2 E9, lead ruling 2026-11-14 - the PER-CARD exemption and FULLROW-USE): the grid's column track, and per card
    // whether it spans the row, its count-row train's natural width (the widest line laid out unwrapped: its step tab, then every
    // number / jump cell and the gaps between them - each is flex:none, so its width does not depend on the card) and the width
    // its content's ink spans (text, boxes, drawings)
    const tracks = String(getComputedStyle(g).gridTemplateColumns || '').split(/\s+/).map(parseFloat).filter((x) => x > 0);
    const colW = tracks.length ? Math.min(...tracks) : 0;
    const gapOf = (el) => parseFloat(getComputedStyle(el).columnGap) || 0;
    const natural = (el) => {
        const kids = Array.from(el.children).filter(vis);
        if (!kids.length) return el.getBoundingClientRect().width;
        const inner = el.matches('[data-mq-wrapped]') && !el.classList.contains('k2-countrow-line');
        if (inner) return kids.reduce((a, k) => a + k.getBoundingClientRect().width, 0) + gapOf(el) * (kids.length - 1);
        if (getComputedStyle(el).display.includes('flex') && getComputedStyle(el).flexDirection.startsWith('row')) return kids.reduce((a, k) => a + natural(k), 0) + gapOf(el) * (kids.length - 1);
        return Math.max(...kids.map(natural));
    };
    const trainWs = cards.map((c) => { const ls = Array.from(c.querySelectorAll('.k2-countrow-line')).filter(vis); return ls.length ? r1(Math.max(...ls.map(natural))) : 0; });
    const spans = cards.map((c) => (colW > 0 && c.getBoundingClientRect().width > colW * 1.5 ? 1 : 0));
    const gridGap = parseFloat(getComputedStyle(g).columnGap) || 0;
    // the width a card's drawing gets in a column of a 2-column grid (the card's chrome - its padding and the cell's - taken off)
    const avail2 = cards.map((c) => {
        const cell = c.querySelector('.ws-cell');
        if (!cell) return 0;
        const cs = getComputedStyle(cell);
        const inner = cell.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0);
        return r1((g.clientWidth - gridGap) / 2 - Math.max(0, c.getBoundingClientRect().width - inner));
    });
    // the width a card's drawing can use: its cell's content box (the card's own padding and border are not room)
    const innerWs = cards.map((c) => {
        const cell = c.querySelector('.ws-cell');
        if (!cell) return r1(c.getBoundingClientRect().width);
        const cs = getComputedStyle(cell);
        return r1(cell.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0));
    });
    const contentWs = cards.map((c) => {
        // a count row's content is its drawing's ink - the train (numbers, boxes, jumps) and its rule line - not the keys hint
        const lines = Array.from(c.querySelectorAll('.k2-countrow-line, .k2-rulebox, .k2-rule')).filter(vis);
        if (lines.length) {
            let lo = Infinity, hi = -Infinity;
            for (const l of lines) for (const el of l.querySelectorAll('*')) { if (!vis(el) || el.children.length) continue; const r = el.getBoundingClientRect(); lo = Math.min(lo, r.left); hi = Math.max(hi, r.right); }
            if (hi > lo) return r1(hi - lo);
        }
        const paper = c.querySelector('.mq-wspaper') || c;
        let lo = Infinity, hi = -Infinity;
        const add = (r) => { if (r.width > 0 && r.height > 0) { lo = Math.min(lo, r.left); hi = Math.max(hi, r.right); } };
        const w = document.createTreeWalker(paper, NodeFilter.SHOW_TEXT);
        for (let t = w.nextNode(); t; t = w.nextNode()) { if (!/\S/.test(t.nodeValue || '') || !t.parentElement || !vis(t.parentElement) || t.parentElement.closest('.mq-sr, .mq-wsbar')) continue; const rg = document.createRange(); rg.selectNodeContents(t); for (const r of rg.getClientRects()) add(r); }
        for (const el of paper.querySelectorAll('input, textarea, svg, [data-mq-cell], .k2-tile')) if (vis(el) && !el.closest('.mq-wsbar')) add(el.getBoundingClientRect());
        return hi > lo ? r1(hi - lo) : 0;
    });
    return { cards: cards.length, cols, cardH: r1(cardH), cardW: r1(cardW), boxW: r1(boxW), boxH: r1(boxH), digit: ds.length ? r1(Math.min(...ds)) : 0,
        cardHs: cards.map((c) => r1(c.getBoundingClientRect().height)), digits: perCard.map(r1), slotXs, templates,
        colW: r1(colW), gridW: r1(g.clientWidth), spans, trainWs, contentWs, avail2, innerWs, cardWs: cards.map((c) => r1(c.getBoundingClientRect().width)) };
}

function selfTest() {
    const b = { cols: 2, cardH: 300, cardW: 300, boxW: 144, boxH: 192, digit: 29, cardHs: [300, 290], digits: [29, 40], slotXs: [[40, 100], [40]] };
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
        // lf-hosts critic r3: per-slot x, tolerance 1.5 px (the r1 F4 4 px gap moves a box by up to 1 px)
        ['r3 a slot 1 px sideways holds', { cols: 2, cardH: 300, boxW: 144, boxH: 192, digit: 29, slotXs: [[40, 101], [40]] }, []],
        ['r3 a slot 2 px sideways fails', { cols: 2, cardH: 300, boxW: 144, boxH: 192, digit: 29, slotXs: [[40, 102], [40]] }, [/1 answer place\(s\) moved sideways.*card 1 slot 2 x 100 -> 102/]],
        ['r3 a card that lost an answer place fails', { cols: 2, cardH: 300, boxW: 144, boxH: 192, digit: 29, slotXs: [[40], [40]] }, [/card 1 has 1 answer place\(s\), master 2/]],
        // lead ruling 2026-11-13 (cbt r1 D2): a sheet drawing the count-row template is exempt; any other template is judged
        ['D2 a count-row sheet that spans and grows is exempt', { cols: 1, cardH: 396, cardW: 600, boxW: 144, boxH: 192, digit: 29, templates: [['count-row'], ['count-row']] }, []],
        ['D2 a non-count-row card that grows still fails', { cols: 2, cardH: 337, boxW: 144, boxH: 192, digit: 29, templates: [['k2kit'], []] }, [/tallest card/]],
        // lead ruling 2026-11-14 (cbt r3 E9): the exemption is per card - a spanning count-row card whose train fits a 2-column column,
        // or whose content uses under half its width, fails; a train wider than that column spans and is exempt
        ['E9 a spanning count-row card whose train fits a column fails', { cols: 1, cardH: 428, cardW: 1136, boxW: 136, boxH: 72, digit: 56, templates: [['count-row'], ['count-row']], gridW: 1136, spans: [1, 1], trainWs: [444, 444], avail2: [500, 500], contentWs: [444, 444], cardWs: [1136, 1136] }, [/FULLROW-SPAN card 1/, /FULLROW-USE card 1/, /FULLROW-SPAN card 2/, /FULLROW-USE card 2/]],
        ['E9 a spanning count-row card whose train is wider than a column is exempt', { cols: 1, cardH: 342, cardW: 1136, boxW: 102, boxH: 72, digit: 56, templates: [['count-row'], ['count-row']], gridW: 1136, spans: [1, 1], trainWs: [1652, 1652], avail2: [500, 500], contentWs: [997, 997], cardWs: [1136, 1136] }, []],
        ['E9 a spanning card using 40 % of its width fails FULLROW-USE', { cols: 1, cardH: 342, cardW: 1136, boxW: 102, boxH: 72, digit: 56, templates: [['count-row'], ['count-row']], gridW: 1136, spans: [1, 0], trainWs: [1652, 300], avail2: [500, 500], contentWs: [454, 300], cardWs: [1136, 560] }, [/FULLROW-USE card 1/]],
        ['E9 count-row cards in the grid (none spans) are judged against the baseline', { cols: 2, cardH: 337, boxW: 144, boxH: 192, digit: 29, templates: [['count-row'], ['count-row']], gridW: 1136, spans: [0, 0], trainWs: [444, 444], avail2: [500, 500], contentWs: [444, 444], cardWs: [560, 560] }, [/tallest card/]],
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

/** --judge-fixture FILE: {about, baseline, measured} judged with the same rules (no browser). */
function judgeFixture(file) {
    const fx = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
    const v = judge(fx.measured, fx.baseline);
    for (const f of v) say(`  ${path.basename(file)}: ${f}`);
    say(v.length ? `${TOOL}: FAIL - ${v.length} finding(s) on fixture ${path.basename(file)}` : `${TOOL}: OK (fixture ${path.basename(file)})`);
    process.exit(v.length ? 1 : 0);
}

async function main() {
    if (has('self-test')) return selfTest();
    if (has('judge-fixture')) return judgeFixture(arg('judge-fixture'));
    const VALUE = new Set(['skills', 'sample-only', 'baseline', 'json']), BOOL = new Set(['pin', 'pin-slots', 'self-test', 'print-widths']);
    for (let i = 0; i < argv.length; i++) {
        const m = /^--([a-z-]+)$/.exec(argv[i]);
        if (!m || (!VALUE.has(m[1]) && !BOOL.has(m[1]))) { say(`${TOOL}: unknown argument ${argv[i]}`); say(`${TOOL}: FAIL - usage`); process.exit(2); }
        if (VALUE.has(m[1])) i++;
    }
    if (has('print-widths')) { say(`widths: ${WIDTHS.map((v) => v.w).join(',')}`); return; }
    const basePath = path.resolve(arg('baseline', BASE));
    const pinSlots = has('pin-slots');
    const pin = has('pin') || pinSlots;
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
                say(`${key.padEnd(40)} ${m.error ? 'ERR ' + m.error : `${exemptOf(m).length ? `EXEMPT (draws ${exemptOf(m).join(', ')}: lead ruling 2026-11-13) ` : ''}${m.cols} col(s), tallest card ${m.cardH} px (w ${m.cardW}), answer place ${m.boxW} x ${m.boxH}, numeral ${m.digit} px, ${m.slotXs.flat().length} slot x${m.spans && m.spans.some(Boolean) ? `; col ${m.colW} px, spanning card(s) ${m.spans.map((x, i) => (x ? `${i + 1} (train ${m.trainWs[i]}, content ${m.contentWs[i]} of ${m.innerWs ? m.innerWs[i] : m.cardWs[i]} px, 2-col column ${m.avail2 ? m.avail2[i] : '?'} px)` : '')).filter(Boolean).join(', ')}` : ''}`}${v.length ? '\n    ' + v.join('\n    ') : ''}`);
            }
        }
    } finally { await app.close(); }
    if (pin) {
        if (fails.length) { say(`${TOOL}: FAIL - not pinned: ${fails.join(' | ')}`); process.exit(1); }
        const prev = (() => { try { return JSON.parse(fs.readFileSync(basePath, 'utf8')); } catch (e) { return { keys: {} }; } })();
        if (pinSlots) {
            const missing = Object.keys(rows).filter((k) => !(prev.keys || {})[k]);
            if (missing.length) { say(`${TOOL}: FAIL - --pin-slots needs pinned keys first: ${missing.join(', ')}`); process.exit(1); }
            const { execSync } = require('child_process');
            let head = '?';
            try { head = execSync('git rev-parse --short=9 HEAD', { cwd: process.env.MQ_ROOT || path.resolve(__dirname, '..', '..') }).toString().trim(); } catch (e) { /* none */ }
            for (const [k, m] of Object.entries(rows)) { prev.keys[k].slotXs = m.slotXs; prev.keys[k].slotXsFrom = head; }
            fs.writeFileSync(basePath, JSON.stringify(prev, null, 1) + '\n');
            say(`${TOOL}: OK (pinned slotXs of ${Object.keys(rows).length} key(s) from ${head} into ${path.relative(process.cwd(), basePath)})`);
            return;
        }
        const keys = Object.assign({}, prev.keys || {}, rows);
        const { execSync } = require('child_process');
        let head = '?';
        try { head = execSync('git rev-parse --short=9 HEAD', { cwd: process.env.MQ_ROOT || path.resolve(__dirname, '..', '..') }).toString().trim(); } catch (e) { /* none */ }
        fs.writeFileSync(basePath, JSON.stringify({ tool: TOOL, about: 'The online worksheet layout as master prints it (lf-hosts critic r1 F1): per skill@width the grid column count, tallest card, largest answer place and worst card numeral. Re-pin only from master, or in the change that moves the layout on purpose.', pinnedFrom: head, cards: CARDS, keys }, null, 1) + '\n');
        say(`${TOOL}: OK (pinned ${Object.keys(rows).length} key(s) from ${head} into ${path.relative(process.cwd(), basePath)})`);
        return;
    }
    // (--json FILE: every measure as judged, keyed skill@width - a fixture's `measured` comes from here, cbt r3 E9)
    if (arg('json', null)) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, rows }, null, 1) + '\n');
    const n = skills.length * WIDTHS.length;
    if (fails.length) { say(`${TOOL}: FAIL - ${fails.length} finding(s) (${n} worksheet renders): ${fails.slice(0, 4).join(' | ').slice(0, 600)}`); process.exit(1); }
    say(`${TOOL}: OK (${skills.length} skill(s) x ${WIDTHS.length} widths: columns, card heights, answer places and numerals hold against ${base.pinnedFrom})`);
}
main().catch((e) => { say(`${TOOL}: ${e && e.stack || e}`); say(`${TOOL}: FAIL - error`); process.exit(1); });
