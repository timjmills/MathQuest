// Chromebook fit (owner, 2026-10-09): pupils mostly play on Chromebooks, so at 1366 x 650 and
// 1280 x 600 of visible page the problem, its answer box and Check / Next must be on screen without
// scrolling, on every pupil host: the practice card, the online worksheet and the quiz.
//
// For a broad sample of skills (one per category, plus the known tall ones: column stacks, long
// division, word problems, graphs, count rows, number lines) it opens each host the way a pupil
// does, at each size, and measures with the page at the top (scrollY = 0):
//   box     the bottom of the first answer box (the pulsing active box; else the first answer input
//           or answer choice in the host; else the whole question paper)
//   go      the bottom of Check / Next (card: Check or Next; quiz: Next / Review; worksheet: Check All)
//   fold    the viewport height less any bar pinned to the bottom edge that covers content
// A TYPICAL item FAILS when its answer box ends below the fold. A GENUINELY TALL item (its own
// problem, from the top of its question paper to the bottom of its answer box, taller than the
// space a folded chrome leaves) is listed separately: it may scroll, but active-box must have brought
// its box into view on load. Every item FAILS if Check / Next is off screen. The online worksheet
// also reports how many cards show in full.
//
// Boss and race also FAIL when the arena / track is out of view (at the top or after the page has
// scrolled to a box), and the quiz FAILS when, after a click on Next, the pulsing box has not got the
// focus (typing would go nowhere) or when one click on Next, after typing a digit, does not move on.
//
// It also checks that nothing else changed: the home screen and a tall screen (1366 x 960) keep
// the full app header, and the compact header never engages there.
//
//   node tests/scripts/ws-chromebook-fit.cjs                    # the default sample, both sizes
//   node tests/scripts/ws-chromebook-fit.cjs --skills addition:add,division:long_div_2digit
//   node tests/scripts/ws-chromebook-fit.cjs --hosts card --sizes 1366x650   (hosts: card, boss, race,
//        worksheet, quiz; boss and race run on a fixed sample in a full run, on every --skills skill)
//   node tests/scripts/ws-chromebook-fit.cjs --shots <dir>     # a screenshot per skill, host and size
//
// Prints one line per skill, size and host, then `ws-chromebook-fit: OK` or `FAIL` (exit 1).
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SIZES = (arg('sizes', '1366x650,1280x600')).split(',').map(s => { const [w, h] = s.split('x').map(Number); return { w, h }; });
const HOSTS = (arg('hosts', 'card,boss,race,worksheet,quiz')).split(',');
// boss and race are the card plus an arena / a track: in a full run they are sampled on these
const ARENA_SAMPLE = ['addition:add_facts', 'addition:add', 'addition:add_column_multi', 'counting:count_objects', 'addition:add_wp_10', 'graphs:bar_graph', 'division:long_div_2digit'];
const SHOTS = arg('shots', null);
// The compact chrome's budget: the most a short screen may spend above the question paper
// (header row + play bar + the card's own top line). An item whose problem is taller than what is
// left is genuinely tall.
const CHROME_BUDGET = 130;
const ARENA_BUDGET = 0;    // the boss arena and the race track ride in the play bar (css/play-compact.css)
// The known tall shapes, always in the sample on top of one skill per category.
const TALL = [
    'addition:add_column_multi', 'addition:add', 'subtraction:subtract', 'division:long_div_2digit',
    'addition:add_wp_10', 'addition:number_line_add', 'counting:count_objects', 'graphs:bar_graph',
    'multiplication:area_model_mult', 'multiplication:arrays_groups', 'division:div_remainders',
    'composing:ten_frame_build', 'composing:base10_build', 'measurement:time_quarter',
];
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

// In the page: measure the active host at scrollY = 0 (and, for `load`, as the app left it).
function MEASURE(host) {
    const H = innerHeight;
    const vis = el => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    if (host === 'boss' || host === 'race') host = 'card';
    const root = host === 'card' ? document.getElementById('questionCard')
        : host === 'worksheet' ? (document.querySelector('#worksheetGrid .problem-card.mq-active-problem') || document.querySelector('#worksheetGrid .problem-card'))
            : document.querySelector('#quizTakeView .qt-question-card');
    if (!root) return { error: 'no host' };
    const paper = host === 'card' ? document.getElementById('questionPaper') : host === 'worksheet' ? root.querySelector('.mq-wspaper, .ws-cell') : root.querySelector('.mq-qtpaper, .qt-cell, .ws-cell');
    const OPTIONAL = /carry|regroup/i;
    const inputs = Array.from(root.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea, select, [contenteditable="true"]'))
        .filter(vis).filter(el => !OPTIONAL.test(el.className) && !el.closest('.mq-qactions, .qt-nav, .mq-wsbar, .qt-q-header'));
    const active = Array.from(root.querySelectorAll('.mq-active-box')).find(vis);
    const choice = Array.from(root.querySelectorAll('#answerOptions button, .answer-options button, .option-btn, .mq-choice, .qt-option, [data-choice], .mq-tap, .mq-target, .mq-tickbox'))
        .find(vis);
    // no typing box or choice found (a tick-one table, a drawing): the whole problem must show
    const box = active || inputs[0] || choice || paper || null;
    const go = host === 'card'
        ? [document.getElementById('nextBtn'), document.getElementById('qcCheckBtn'), document.querySelector('#answerInputArea .mq-inline-check')].find(vis)
        : host === 'worksheet' ? Array.from(document.querySelectorAll('#worksheetView .game-header .btn')).find(b => /check all/i.test(b.textContent) && vis(b))
            : Array.from(document.querySelectorAll('#quizTakeView .qt-nav .qt-nav-btn, #quizTakeView .qt-nav button')).filter(vis).pop();
    // no Check / Next of the host's own: the item submits itself (a Submit inside the cell), or a tap
    // on a choice is the answer, so the choice is the control that must show
    let goEl = go;
    if (!goEl) goEl = Array.from(root.querySelectorAll('button')).filter(vis).find(b => /^\s*(submit|check|done)\b/i.test(b.textContent) && (paper || root).contains(b))
        || ((choice || (!active && !inputs[0])) ? box : null);
    // a bar pinned to the bottom edge covers what scrolls under it
    const pinned = Array.from(document.querySelectorAll('#questionCard > .mq-qactions, #questionCard > .next-btn-container, #quizTakeView .qt-nav'))
        .filter(vis).filter(el => getComputedStyle(el).position === 'sticky').map(el => el.getBoundingClientRect()).filter(r => r.bottom >= H - 1 && r.top < H);
    const fold = pinned.length ? Math.min(...pinned.map(r => r.top)) : H;
    const r = el => el ? el.getBoundingClientRect() : null;
    const bR = r(box), gR = r(goEl), pR = r(paper || root);
    let cardsFull = 0;
    if (host === 'worksheet') cardsFull = Array.from(document.querySelectorAll('#worksheetGrid .problem-card')).filter(c => { const q = c.getBoundingClientRect(); return q.top >= 0 && q.bottom <= H + 0.5; }).length;
    return {
        H, fold: Math.round(fold), scrollY: Math.round(scrollY),
        box: bR ? Math.round(bR.bottom) : null, boxTop: bR ? Math.round(bR.top) : null, boxKind: active ? 'active' : inputs[0] ? 'input' : choice ? 'choice' : paper ? 'paper' : 'none',
        go: gR ? Math.round(gR.bottom) : null, goTop: gR ? Math.round(gR.top) : null,
        paperTop: Math.round(pR.top), cardsFull,
        goInPaper: !!(goEl && paper && paper.contains(goEl)),
        // the bottom of the sticky play bar: a box under it is not seen
        barBottom: Math.round(Math.max(0, ...Array.from(document.querySelectorAll('.mq-play-menu-btn, #myStatsBar, .view.active > .game-header, .view.active > .qt-topbar')).filter(vis).filter(el => getComputedStyle(el).position === 'sticky').map(el => el.getBoundingClientRect().bottom))),
        arena: (() => { const a = Array.from(document.querySelectorAll('#bossArena, #raceTrack')).find(vis); if (!a) return null; const q = a.getBoundingClientRect(); return q.top >= -0.5 && q.bottom <= H + 0.5; })(),
    };
}

async function settle(page) {
    await sleep(900);
    try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
    // a celebration or a toast over the page is not part of the layout
    await page.evaluate(() => {
        Array.from(document.body.querySelectorAll('*')).filter(e => { const cs = getComputedStyle(e); return cs.position === 'fixed' && Number(cs.zIndex) >= 1000 && e.getBoundingClientRect().width > innerWidth * 0.6 && e.getBoundingClientRect().height > innerHeight * 0.6; }).forEach(e => { e.style.display = 'none'; });
    });
    await sleep(400);
}

async function startHost(page, host, c, k, seed) {
    if (host === 'card' || host === 'worksheet' || host === 'boss' || host === 'race') {
        await page.evaluate((c, k, mode, seed) => {
            if (window.__wsReseed) window.__wsReseed(seed);
            window.state.quizMode = false;
            window.skillQueue.length = 0;
            window.skillQueue.push({ categoryId: c, skillId: k, skillLabel: k });
            window.playSelectedSkills(mode);
        }, c, k, host === 'card' ? 'practice' : host, seed);
        if (host === 'worksheet') {
            try { await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 20000 }); } catch (e) { /* measured anyway */ }
        }
    } else {
        await page.evaluate((c, k, seed) => {
            const questions = [];
            for (let i = 0; i < 3; i++) {
                const q = window.generateQuestionFor({ category: c, skill: k, seed: seed + i, itemIndex: i });
                questions.push({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(q) });
            }
            const test = { id: null, name: 'Fit', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
            window.handleQuizURL(window.compressTestForURL(test));
            const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
            window.startQuizTest();
        }, c, k, seed);
    }
    await settle(page);
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: SIZES[0].w, height: SIZES[0].h, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', d => d.accept().catch(() => {}));
    const fails = [];
    const tall = [];
    const rows = [];

    // ---- the sample ----
    let LIST = (arg('skills', '') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!LIST.length) {
        const per = await page.evaluate(() => {
            const out = [];
            for (const [cat, skills] of Object.entries(window.SKILLS)) {
                if (!Array.isArray(skills)) continue;
                const live = skills.filter(s => s && s.v && !s.retired && !/^mixed|custom_mixed|all_mixed/.test(s.v));
                if (live.length) out.push(`${cat}:${live[0].v}`);
            }
            return out;
        });
        LIST = Array.from(new Set([...per, ...TALL, ...ARENA_SAMPLE]));
        const known = await page.evaluate(() => { const s = new Set(); for (const [c, a] of Object.entries(window.SKILLS)) if (Array.isArray(a)) a.forEach(x => x && s.add(`${c}:${x.v}`)); return Array.from(s); });
        LIST = LIST.filter(s => known.includes(s));
    }

    // ---- unchanged elsewhere: the home screen, and a tall screen in play ----
    const chromeCheck = async (label, w, h, setup) => {
        await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
        await page.reload({ waitUntil: 'networkidle2' });
        await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
        if (setup) await setup();
        await sleep(600);
        const m = await page.evaluate(() => {
            const nav = document.querySelector('.container > .nav-bar');
            const btn = document.getElementById('mqPlayMenuBtn');
            return { navDisplay: nav ? getComputedStyle(nav).display : 'none', menuShown: !!btn && getComputedStyle(btn).display !== 'none', stats: getComputedStyle(document.querySelector('.nav-stats')).display };
        });
        const ok = m.navDisplay === 'flex' && !m.menuShown && m.stats !== 'none';
        console.log(`${label.padEnd(44)} ${ok ? 'ok' : 'CHANGED'} (nav ${m.navDisplay}, controls ${m.stats}, menu button ${m.menuShown ? 'shown' : 'hidden'})`);
        if (!ok) fails.push(`${label}: the full app header changed (${JSON.stringify(m)})`);
    };
    await chromeCheck('home screen 1366x650 (full header)', 1366, 650, null);
    await chromeCheck('play at 1366x960 (tall screen, full header)', 1366, 960, () => startHost(page, 'card', 'addition', 'add', 7));

    for (const size of SIZES) {
        await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
        for (const s of LIST) {
            const [c, k] = s.split(':');
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
            const line = [];
            for (const host of HOSTS) {
                if ((host === 'boss' || host === 'race') && !arg('skills', '') && !ARENA_SAMPLE.includes(s)) continue;
                let m;
                try {
                    await startHost(page, host, c, k, hash(`${s}:${host}`));
                    const load = await page.evaluate(MEASURE, host);
                    // the pupil scrolls back to the top: a wheel first, so active-box (which keeps a
                    // focused box in view for its first seconds) leaves the page where they put it
                    await page.mouse.move(5, 300); await page.mouse.wheel({ deltaY: -1 });
                    await page.evaluate(() => window.scrollTo(0, 0));
                    await sleep(150);
                    m = await page.evaluate(MEASURE, host);
                    if (m.error) throw new Error(m.error);
                    m.load = load;
                } catch (e) { line.push(`${host} ERR ${e.message}`); fails.push(`${s} ${size.w}x${size.h} ${host}: ${e.message}`); continue; }
                if (SHOTS) {
                    fs.mkdirSync(SHOTS, { recursive: true });
                    await page.screenshot({ path: path.join(SHOTS, `${size.w}x${size.h}-${host}-${c}-${k}.png`) });
                }
                const tag = `${s} ${size.w}x${size.h} ${host}`;
                // a widget's own Submit inside the cell (a legacy coordinate plot) is part of the problem
                const problem = m.box != null ? Math.max(m.box, m.goInPaper && m.go != null ? m.go : 0) - m.paperTop : 0;
                // boss and race add their arena / track to the chrome: the game itself, not header
                const budget = CHROME_BUDGET + (host === 'boss' || host === 'race' ? ARENA_BUDGET : 0);
                const isTall = m.box != null && problem > m.fold - budget;
                let verdict = 'ok';
                // Check / Next must show on a typical item; a tall item's own Check may sit below its boxes
                if (m.go == null) { verdict = 'FAIL'; fails.push(`${tag}: no Check / Next found`); }
                else if (m.go > m.H + 0.5 && !isTall) { verdict = 'FAIL'; fails.push(`${tag}: Check / Next off screen (bottom ${m.go} > ${m.H})`); }
                else if (m.go > m.H + 0.5 && !(m.box > m.fold)) { verdict = 'tall'; tall.push(`${tag}: problem ${problem} px; its own Submit ${m.go} > ${m.H} (the answer box ${m.box} shows)`); }
                if (m.box != null && m.box > m.fold) {
                    if (isTall) {
                        // it may scroll, but active-box must have brought the box into view on load
                        const l = m.load || {};
                        const seen = l.box != null && l.box <= l.fold && l.boxTop >= (l.barBottom || 0);
                        tall.push(`${tag}: problem ${problem} px; box ${m.box} > fold ${m.fold}; on load ${seen ? 'in view' : `NOT in view (box ${l.box}, fold ${l.fold})`}`);
                        if (host !== 'worksheet' && !seen && (m.boxKind === 'active' || m.boxKind === 'input')) { verdict = 'FAIL'; fails.push(`${tag}: tall item, active box not brought into view on load`); }
                        else if (verdict === 'ok') verdict = 'tall';
                    } else { verdict = 'FAIL'; fails.push(`${tag}: answer box bottom ${m.box} > fold ${m.fold} (paper top ${m.paperTop})`); }
                }
                // boss / race: the arena or the track stays in view, also when the page has scrolled to a box
                if ((host === 'boss' || host === 'race') && !(m.arena && m.load && m.load.arena)) { verdict = 'FAIL'; fails.push(`${tag}: the ${host === 'boss' ? 'arena' : 'track'} is not in view (top ${m.arena}, on load ${m.load && m.load.arena})`); }
                // quiz: after Next (a click), the next question's pulsing box has the focus, so typing lands
                if (host === 'quiz') {
                    // the pupil types a digit first: the box's change must not swallow the first click on Next
                    const typed = await page.evaluate(() => { const a = document.activeElement; return !!a && a.matches('#quizTakeView input:not([type=hidden])'); });
                    if (typed) { await page.keyboard.type('1'); await sleep(100); }
                    const next = await page.$('#quizTakeView .qt-nav-btn.next');
                    if (next) {
                        const before = await page.evaluate(() => window.state.quizQuestionIndex);
                        await next.click();
                        await sleep(700);
                        const f = await page.evaluate(() => { const a = document.querySelector('#quizTakeView .mq-active-box'); return { idx: window.state.quizQuestionIndex, typing: !!a && a.matches('input, textarea, [contenteditable="true"]'), focused: !!a && document.activeElement === a }; });
                        if (f.idx !== before + 1) { verdict = 'FAIL'; fails.push(`${tag}: one click on Next${typed ? ' after typing' : ''} did not move to the next question`); }
                        else if (f.typing && !f.focused) { verdict = 'FAIL'; fails.push(`${tag}: after Next the pulsing box does not have the focus`); }
                    }
                }
                rows.push({ skill: s, size: `${size.w}x${size.h}`, host, ...m, load: undefined, verdict });
                line.push(`${host} ${verdict} box ${m.box ?? '-'}${m.boxKind === 'none' || m.boxKind === 'paper' ? `(${m.boxKind})` : ''}/${m.fold} go ${m.go ?? '-'}${host === 'worksheet' ? ` cards ${m.cardsFull}` : ''}`);
            }
            console.log(`${(s + ' ' + size.w + 'x' + size.h).padEnd(44)} ${line.join(' | ')}`);
        }
    }
    if (arg('json', null)) fs.writeFileSync(arg('json'), JSON.stringify(rows, null, 1));
    if (tall.length) console.log(`\nGenuinely tall items (may scroll; active-box brings the box into view):\n  ${tall.join('\n  ')}`);
    if (app.problems.length) fails.push(...app.problems.slice(0, 8).map(p => `[${p.type}] ${p.text}`));
    await app.close();
    if (fails.length) { console.log('\n' + fails.join('\n')); console.log('ws-chromebook-fit: FAIL'); process.exit(1); }
    console.log('ws-chromebook-fit: OK');
})().catch(e => { console.error(e); console.log('ws-chromebook-fit: FAIL'); process.exit(1); });
