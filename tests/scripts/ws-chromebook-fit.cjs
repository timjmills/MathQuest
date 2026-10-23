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
// Deploy gates (IMPROVEMENT_PLAN §1.4 S5; tests/scripts/ws-deploy-gates.sh):
//   --category c1,c2     only the sample's skills in these categories
//   --shard i/n          the i-th of n deterministic parts of the skill list (skill n goes to part n mod n), so
//                        two browser slots share one sweep. The checks that are not per skill (the header
//                        checks, the question dots, the touch taps on quiz Next) run in part 1 only
//   --dark               SWEEP: dark mode (prefers-color-scheme: dark, so html.dark as the app sets it), as a
//                        pupil (--roles; the fit verdicts are the pupil contract: a teacher-launched play view carries teacher chrome they do not read, and teacher dark colours are ws-screen-slots --dark), on the fixed sample (one skill per kit template,
//                        tests/fixtures/precritic/sweep-sample.json), hosts card, worksheet, quiz, size 1366x650;
//                        the same fit verdicts as the default run
//   --bigboard           SWEEP: the teacher's Board display (body.teacher-mode.tv-bigboard: css/teacher.css:96,
//                        css/play-teacher.css), host card (the board shows the practice card only), sizes
//                        1280x720, 1366x768 and 1920x1080. FAILS when the question does not fit the board: the board
//                        card or frame scrolls sideways or down, a box nested in #questionPaper clips its content
//                        by > 12 px (number-line pan strips excluded, as fitBoard does), or the teacher's board
//                        controls are off screen (measured after the board's entrance animations finish)
//   --sample <file>      the sweep sample; --skills overrides it; --roles student,teacher the sweep roles
//   --baseline <file>    fail only on a per-skill failure the file does not pin (see findingId below); the
//                        sweeps' standing failures are pinned in tests/fixtures/precritic/sweep-sample.json
// The sweeps skip the checks that are not per skill (they have no mode of their own).
//
// Page errors (critic r1 D6) belong to the skill, size and host whose render raised them: a pageerror / console.error
// is recorded as "<cat:skill> <WxH> <host>: page error: [type] <message>" (host "load" for one raised while the page
// reloaded for that skill), and pinned in the baseline like any per-skill failure, as
// "<host>:<WxH>:pageerror:<message, first 100 characters>". A page error outside the per-skill loop (the header,
// dots and touch checks) cannot be pinned. No message is ever waived globally.
//
// An empty run is a FAIL, never OK (critic r1 D3): an unknown --skills key, a retired skill, an unknown --category,
// a sweep sample naming a skill that is not live, a list of 0 skills, or 0 measured renders each FAIL and say why.
//   node tests/scripts/ws-chromebook-fit.cjs --self-test     # the selection and page-error id rules (no browser)
//
// Prints one line per skill, size and host, then `ws-chromebook-fit: OK` or `FAIL` (exit 1).
const fs = require('fs');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');
const { dotsBandCases } = require('../lib/refline-dots.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DARK = has('dark');
const BIGBOARD = has('bigboard');
const SWEEP = DARK || BIGBOARD;
if (DARK && BIGBOARD) { console.log('ws-chromebook-fit: --dark and --bigboard are separate sweeps; run one at a time'); console.log('ws-chromebook-fit: FAIL'); process.exit(2); }
const MODE = DARK ? 'dark' : BIGBOARD ? 'bigboard' : '';
const ROLES = SWEEP ? (arg('roles', DARK ? 'student' : 'teacher')).split(',').map(s => s.trim()).filter(Boolean) : [''];
const CATEGORIES = (arg('category', '') || '').split(',').map(s => s.trim()).filter(Boolean);
const SHARD = (() => {
    const s = arg('shard', '');
    if (!s) return null;
    const m = /^(\d+)\/(\d+)$/.exec(s);
    if (!m || +m[1] < 1 || +m[1] > +m[2]) { console.log(`ws-chromebook-fit: bad --shard ${s} (want i/n, 1 <= i <= n)`); console.log('ws-chromebook-fit: FAIL'); process.exit(2); }
    return { i: +m[1], n: +m[2] };
})();
// the checks that are not per skill run once: not in a sweep, and in shard 1 only
const GLOBALS = !SWEEP && (!SHARD || SHARD.i === 1);
const SAMPLE_FILE = arg('sample', path.join(__dirname, '..', 'fixtures', 'precritic', 'sweep-sample.json'));
const SIZES = (arg('sizes', BIGBOARD ? '1280x720,1366x768,1920x1080' : DARK ? '1366x650' : '1366x650,1280x600')).split(',').map(s => { const [w, h] = s.split('x').map(Number); return { w, h }; });
const HOSTS = (arg('hosts', BIGBOARD ? 'card' : DARK ? 'card,worksheet,quiz' : 'card,boss,race,worksheet,quiz')).split(',');
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

// --baseline <file>: a per-skill failure line "cat:skill WxH host: why" as {key, id: "host:WxH:kind"}, the
// form the pin lists ({skills: {"cat:skill": [id, ...]}}, or under a "chromebookFit" key, as
// tests/fixtures/precritic/sweep-sample.json pins the sweeps' standing findings). Lines that are not per
// skill (header, dots, touch, console errors) are never pinned.
function findingId(line) {
    const m = /^([a-z0-9_]+:[a-z0-9_]+) (\d+x\d+) (\S+): (.*)$/.exec(line);
    if (!m) return null;
    const why = m[4];
    // a page error is pinned with its own message, per skill, size and host (critic r1 D6)
    const pe = /^page error: \[[^\]]+\] (.*)$/.exec(why);
    if (pe) return { key: m[1], id: `${m[3]}:${m[2]}:pageerror:${pe[1].replace(/\s+/g, ' ').trim().slice(0, 100)}` };
    const kind = /scrolls down/.test(why) ? 'scroll-y' : /scrolls sideways/.test(why) ? 'scroll-x' : /board controls/.test(why) ? 'controls'
        : /no Check \/ Next/.test(why) ? 'no-go' : /Check \/ Next off screen/.test(why) ? 'go' : /answer box bottom/.test(why) ? 'box'
            : /not brought into view/.test(why) ? 'tall-load' : /does not have the focus/.test(why) ? 'focus' : /did not move/.test(why) ? 'next'
                : /arena|track/.test(why) ? 'arena' : 'error';
    return { key: m[1], id: `${m[3]}:${m[2]}:${kind}` };
}

/**
 * Check a run's skill list (critic r1 D3). all: every SKILLS entry [{key, live}]; explicit: --skills given;
 * sample: the list came from the sweep sample. Returns {list, errors}.
 */
function selectFit(all, { list = [], explicit = false, sample = false, categories = [], shard = null } = {}) {
    const errors = [];
    const known = new Map(all.map((s) => [s.key, s]));
    for (const k of list) {
        const s = known.get(k);
        if (explicit || sample) {
            if (!s) errors.push(sample ? `the sweep sample names ${k}, which is not a skill (regenerate the sample)` : `--skills ${k}: no such skill (want category:skill as in data.js SKILLS)`);
            else if (!s.live) errors.push(sample ? `the sweep sample names ${k}, a retired skill` : `--skills ${k}: a retired skill (tombstone), not a live one`);
        }
    }
    let out = list.filter((k) => known.has(k) && known.get(k).live);
    const cats = new Set(all.filter((s) => s.live).map((s) => s.key.split(':')[0]));
    for (const c of categories) if (!cats.has(c)) errors.push(`--category ${c}: no such category with a live skill`);
    if (categories.length) out = out.filter((s) => categories.includes(s.split(':')[0]));
    if (shard) out = out.filter((_, i) => i % shard.n === shard.i - 1);
    if (!errors.length && !out.length) errors.push('the skill list has 0 skills (--category, --shard or the sample left nothing to measure)');
    return { list: out, errors };
}

if (has('self-test')) {
    const all = [{ key: 'addition:add_facts', live: true }, { key: 'addition:add', live: true }, { key: 'measurement:time_hour', live: true }, { key: 'addition:old', live: false }];
    const cases = [
        ['--skills nosuch:skill', { list: ['nosuch:skill'], explicit: true }, /--skills nosuch:skill: no such skill/],
        ['--skills of a retired skill', { list: ['addition:old'], explicit: true }, /retired/],
        ['--category measurment (a typo)', { list: ['addition:add_facts'], categories: ['measurment'] }, /--category measurment: no such category/],
        ['a sample naming a gone skill', { list: ['addition:add_facts', 'addition:gone'], sample: true }, /sweep sample names addition:gone/],
        ['--category with no sampled skill', { list: ['addition:add_facts'], categories: ['measurement'] }, /0 skills/],
        ['--shard 3/3 of 2 skills', { list: ['addition:add_facts', 'addition:add'], shard: { i: 3, n: 3 } }, /0 skills/],
        ['--skills addition:add (valid)', { list: ['addition:add'], explicit: true }, null],
    ];
    let bad = 0;
    for (const [name, o, want] of cases) {
        const r = selectFit(all, o);
        const ok = want ? r.errors.some((e) => want.test(e)) : (!r.errors.length && r.list.length > 0);
        if (!ok) bad++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: ${r.errors.length ? r.errors.join('; ') : `${r.list.length} skill(s)`}`);
    }
    // page errors are pinned per skill, size and host, with their message (critic r1 D6)
    const msg = "Cannot read properties of null (reading 'numberFamilyData')";
    const idA = findingId(`addition:add_sub_fact_family 1366x650 dark-student:worksheet: page error: [pageerror] ${msg}`);
    const idB = findingId(`addition:add_facts 1366x650 dark-student:worksheet: page error: [pageerror] ${msg}`);
    const pinned = { 'addition:add_sub_fact_family': [`dark-student:worksheet:1366x650:pageerror:${msg}`] };
    const hit = (id) => !!id && (pinned[id.key] || []).includes(id.id);
    const ids = [['the pinned skill and host', idA, true], ['the same message from another skill', idB, false],
        ['the same skill on another host', findingId(`addition:add_sub_fact_family 1366x650 dark-student:quiz: page error: [pageerror] ${msg}`), false]];
    for (const [name, id, want] of ids) {
        const ok = hit(id) === want;
        if (!ok) bad++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} page error, ${name}: ${hit(id) ? 'pinned' : 'NEW'} (${id ? id.id : 'no id'})`);
    }
    console.log(bad ? 'ws-chromebook-fit --self-test: FAIL' : 'ws-chromebook-fit --self-test: OK');
    process.exit(bad ? 1 : 0);
}

// In the page (--bigboard): does the question fit the teacher's Board display?
function BOARD() {
    const H = innerHeight, W = innerWidth;
    const gv = document.getElementById('gameView');
    const card = document.getElementById('questionCard');
    const paper = document.getElementById('questionPaper');
    if (!gv || !card || !paper) return { error: 'no board host' };
    if (!document.body.classList.contains('tv-bigboard') || getComputedStyle(gv).position !== 'fixed') return { error: 'the Board display did not engage (#gameView is not the fixed board frame)' };
    const vis = el => { if (!el) return false; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const pR = paper.getBoundingClientRect();
    const ctl = document.getElementById('tvBoardCtl');
    // a box nested in the paper that clips its own content by > 12 px (launch-chrome.js nestedClip;
    // the number lines' pan strips [data-mq-scroll] and 1-px screen-reader boxes excluded)
    const nested = [];
    for (const el of paper.querySelectorAll('*')) {
        const ch = el.clientHeight, cw = el.clientWidth;
        if (ch <= 2 || cw <= 2) continue;
        const oy = el.scrollHeight - ch, ox = el.scrollWidth - cw;
        if (oy <= 12 && ox <= 12) continue;
        if (el.closest('[data-mq-scroll]')) continue;
        const cs = getComputedStyle(el);
        if ((oy > 12 && cs.overflowY !== 'visible') || (ox > 12 && cs.overflowX !== 'visible')) nested.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList[0] ? '.' + el.classList[0] : ''} +${Math.max(oy, ox)}`);
    }
    const cR = ctl && vis(ctl) ? ctl.getBoundingClientRect() : null;
    return {
        H, W,
        paper: { w: Math.round(pR.width), h: Math.round(pR.height), right: Math.round(pR.right), bottom: Math.round(pR.bottom) },
        overX: Math.max(card.scrollWidth - card.clientWidth, gv.scrollWidth - gv.clientWidth),
        overY: Math.max(card.scrollHeight - card.clientHeight, gv.scrollHeight - gv.clientHeight),
        ctl: cR ? { bottom: Math.round(cR.bottom), right: Math.round(cR.right) } : null,
        nested,
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
        // the teacher's Board display: teacher-shell.js startPractice plays 'practice', then sets the class
        if (host === 'card' && BIGBOARD) await page.evaluate(() => document.body.classList.add('tv-bigboard'));
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
    // page errors: those raised in the per-skill loop are blamed on the skill, size and host that raised them
    let mark = 0;
    const unattributed = [];
    const take = () => { const p = app.problems.slice(mark); mark = app.problems.length; return p; };
    const blame = (s, size, host) => { for (const p of take()) fails.push(`${s} ${size.w}x${size.h} ${host}: page error: [${p.type}] ${String(p.text).split('\n')[0]}`); };

    // ---- the sample ----
    let LIST = (arg('skills', '') || '').split(',').map(s => s.trim()).filter(Boolean);
    const EXPLICIT = LIST.length > 0;
    // a sweep runs on the pinned sample: one skill per kit template
    const FROM_SAMPLE = !LIST.length && SWEEP;
    if (FROM_SAMPLE) LIST = (JSON.parse(fs.readFileSync(SAMPLE_FILE, 'utf8')).skills || []).map(r => r.key);
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
    {
        // every SKILLS entry, live or not (tombstones and "(retired)" labels are not live)
        const all = await page.evaluate(() => { const o = []; for (const [c, a] of Object.entries(window.SKILLS)) if (Array.isArray(a)) a.forEach(x => x && x.v && o.push({ key: `${c}:${x.v}`, live: !x.retired && !/^_?tomb|retired/i.test(x.v) && !/retired|tombstone/i.test(x.l || '') })); return o; });
        const sel = selectFit(all, { list: LIST, explicit: EXPLICIT, sample: FROM_SAMPLE, categories: CATEGORIES, shard: SHARD });
        if (sel.errors.length) { await app.close(); sel.errors.forEach(e => console.log(e)); console.log(`ws-chromebook-fit: ${sel.errors.length} selection error(s); nothing measured`); console.log('ws-chromebook-fit: FAIL'); process.exit(2); }
        LIST = sel.list;
    }
    if (DARK) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    if (SWEEP || SHARD || CATEGORIES.length) console.log(`${MODE ? `${MODE} sweep (${ROLES.join(', ')}), ` : ''}${SHARD ? `shard ${SHARD.i}/${SHARD.n}, ` : ''}${LIST.length} skill(s)${GLOBALS ? '' : '; header, dots and touch checks not in this run'}`);

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
    if (GLOBALS) {
        await chromeCheck('home screen 1366x650 (full header)', 1366, 650, null);
        await chromeCheck('play at 1366x960 (tall screen, full header)', 1366, 960, () => startHost(page, 'card', 'addition', 'add', 7));
    }

    // ---- the question dots and the number line (critic nl-r6 D1) ----
    // A counted session (queue count / link N10, N20) pulls the dots into the card's top line; with
    // the number line on they must not lie on it, and without it they stay where they were.
    if (GLOBALS && HOSTS.includes('card')) {
        const dotFails = await dotsBandCases(page, { sizes: SIZES, log: (l) => console.log(l.trim()), shots: SHOTS });
        fails.push(...dotFails);
    }

    unattributed.push(...take());   // the header and dots checks: not one skill's
    for (const role of ROLES) for (const size of SIZES) {
        await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
        for (const s of LIST) {
            const [c, k] = s.split(':');
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
            if (role) await page.evaluate((role) => window.setUserRole && window.setUserRole(role, { persist: false }), role);
            blame(s, size, MODE ? `${MODE}${role ? '-' + role : ''}:load` : 'load');
            const line = [];
            for (const host of HOSTS) {
                if ((host === 'boss' || host === 'race') && !arg('skills', '') && !ARENA_SAMPLE.includes(s)) continue;
                const hostTag = MODE ? `${MODE}${role ? '-' + role : ''}:${host}` : host;
                // every page error raised while this host rendered is this skill's, size's and host's (critic r1 D6)
                try {
                if (BIGBOARD) {
                    // the Board display: the whole question on the board, no scrolling, the controls on screen
                    const tag = `${s} ${size.w}x${size.h} ${hostTag}`;
                    let b;
                    try {
                        await startHost(page, host, c, k, hash(`${s}:${host}`));
                        // the controls enter with a fadeSlide (translateY 24 px): measure only once every
                        // animation on the board frame has finished, or it reads "bottom 772 of 768"
                        try { await page.waitForFunction(() => { const g = document.getElementById('gameView'); if (!g || !g.getAnimations) return true; const t = getComputedStyle(g).transform; return (t === 'none' || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(t)) && g.getAnimations({ subtree: true }).every(a => !a.pending && (a.playState === 'finished' || a.playState === 'idle' || (a.effect && a.effect.getComputedTiming().iterations === Infinity))); }, { timeout: 5000 }); } catch (e) { /* measured anyway */ }
                        b = await page.evaluate(BOARD);
                        if (b.error) throw new Error(b.error);
                    } catch (e) { line.push(`${hostTag} ERR ${e.message}`); fails.push(`${tag}: ${e.message}`); continue; }
                    if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${size.w}x${size.h}-bigboard-${c}-${k}.png`) }); }
                    const why = [];
                    if (b.overX > 1) why.push(`the board scrolls sideways by ${b.overX} px (paper ${b.paper.w} px wide, right ${b.paper.right} of ${b.W})`);
                    if (b.overY > 1) why.push(`the board scrolls down by ${b.overY} px (paper ${b.paper.h} px tall, bottom ${b.paper.bottom} of ${b.H})`);
                    if (b.nested.length) why.push(`a box inside the paper clips its content (${b.nested.slice(0, 3).join(', ')})`);
                    if (!b.ctl) why.push('the board controls are not shown');
                    else if (b.ctl.bottom > b.H + 0.5 || b.ctl.right > b.W + 0.5) why.push(`the board controls are off screen (bottom ${b.ctl.bottom}, right ${b.ctl.right})`);
                    why.forEach(w => fails.push(`${tag}: ${w}`));
                    rows.push({ skill: s, size: `${size.w}x${size.h}`, host: hostTag, ...b, verdict: why.length ? 'FAIL' : 'ok' });
                    line.push(`${hostTag} ${why.length ? 'FAIL' : 'ok'} paper ${b.paper.w}x${b.paper.h} over ${b.overX}/${b.overY}`);
                    continue;
                }
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
                } catch (e) { line.push(`${hostTag} ERR ${e.message}`); fails.push(`${s} ${size.w}x${size.h} ${hostTag}: ${e.message}`); continue; }
                if (SHOTS) {
                    fs.mkdirSync(SHOTS, { recursive: true });
                    await page.screenshot({ path: path.join(SHOTS, `${size.w}x${size.h}-${host}-${c}-${k}.png`) });
                }
                const tag = `${s} ${size.w}x${size.h} ${hostTag}`;
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
                rows.push({ skill: s, size: `${size.w}x${size.h}`, host: hostTag, ...m, load: undefined, verdict });
                line.push(`${hostTag} ${verdict} box ${m.box ?? '-'}${m.boxKind === 'none' || m.boxKind === 'paper' ? `(${m.boxKind})` : ''}/${m.fold} go ${m.go ?? '-'}${host === 'worksheet' ? ` cards ${m.cardsFull}` : ''}`);
                } finally { await sleep(50); blame(s, size, hostTag); }
            }
            console.log(`${(s + ' ' + size.w + 'x' + size.h).padEnd(44)} ${line.join(' | ')}`);
        }
    }
    // Touch (critic r5 Q5-1): instant feedback, a typed one-box answer, then ONE real touch tap on Next
    // moves on (the feedback must not be drawn under the tap and move Next away from it).
    if (GLOBALS && HOSTS.includes('quiz')) {
        for (const size of SIZES) {
            const t = await open({ seed: 17, viewport: { width: size.w, height: size.h, deviceScaleFactor: 1, hasTouch: true } });
            try {
                await t.page.waitForFunction(() => typeof window.generateQuestionFor === 'function' && !!window.SKILLS, { timeout: 30000 });
                for (const [c, k] of [['addition', 'add_facts'], ['subtraction', 'subtract'], ['multiplication', 'mult_facts']]) for (const ans of ['wrong', 'right']) {
                    await t.page.evaluate((c, k) => {
                        const questions = [];
                        for (let i = 0; i < 3; i++) {
                            const q = window.generateQuestionFor({ category: c, skill: k, seed: 990 + i, itemIndex: i });
                            questions.push({ id: i, skillId: k, points: 1, questionData: window.quizQuestionData(q) });
                        }
                        const test = { id: null, name: 'Fit', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                            settings: { timeLimit: null, randomOrder: false, showFeedback: 'instant', allowRetry: true, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                        window.handleQuizURL(window.compressTestForURL(test));
                        const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                        window.startQuizTest(); window.scrollTo(0, 0);
                    }, c, k);
                    await sleep(1200);
                    const tag = `${c}:${k} ${size.w}x${size.h} quiz touch ${ans}`;
                    if (!(await t.page.$('#qtAnswerInput'))) { fails.push(`${tag}: no one-box answer`); continue; }
                    const v = await t.page.evaluate((ans) => { const s = window.state; const a = Number(String(s.quizAllQuestions[s.quizOrder[s.quizQuestionIndex]].question.questionData.ans).replace(/,/g, '')); return String(ans === 'right' ? a : a + 1); }, ans);
                    await t.page.focus('#qtAnswerInput'); await t.page.keyboard.type(v);
                    const nx = await t.page.evaluate(() => { const n = document.querySelector('#quizTakeView .qt-nav-btn.next'); const r = n.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
                    await t.page.touchscreen.tap(nx.x, nx.y); await sleep(1100);
                    const idx = await t.page.evaluate(() => window.state.quizQuestionIndex);
                    console.log(`${tag.padEnd(44)} touch Next ${idx === 1 ? 'ok' : 'FAIL'}`);
                    if (idx !== 1) fails.push(`${tag}: one touch tap on Next after typing did not move to the next question`);
                }
            } finally {
                if (t.problems.length) fails.push(...t.problems.slice(0, 4).map(p => `[${p.type}] ${p.text}`));
                await t.close();
            }
        }
    }
    if (arg('json', null)) fs.writeFileSync(arg('json'), JSON.stringify(rows, null, 1));
    if (tall.length) console.log(`\nGenuinely tall items (may scroll; active-box brings the box into view):\n  ${tall.join('\n  ')}`);
    unattributed.push(...take());
    if (unattributed.length) fails.push(...unattributed.slice(0, 8).map(p => `[${p.type}] ${p.text}`));
    await app.close();
    // nothing measured is never OK (critic r1 D3)
    if (!rows.length) { console.log(`\n0 renders measured (${LIST.length} skill(s) on hosts ${HOSTS.join(', ')}): nothing was checked`); if (fails.length) console.log(fails.join('\n')); console.log('ws-chromebook-fit: FAIL'); process.exit(1); }
    if (arg('baseline', null)) {
        // a pinned per-skill failure ("cat:skill WxH host: why") is reported, not failed; anything else fails
        const base = JSON.parse(fs.readFileSync(arg('baseline'), 'utf8'));
        const pinned = (base.chromebookFit || base).skills || {};
        // page errors are pinned per skill, size and host (findingId); a global message list is no longer read
        if (((base.chromebookFit || base).problems || []).length) console.log(`baseline ${arg('baseline')}: its global "problems" list is ignored (critic r1 D6): pin a page error per skill as "<host>:<WxH>:pageerror:<message>"`);
        const seen = [];
        const left = fails.filter(f => {
            const id = findingId(f);
            if (id && (pinned[id.key] || []).includes(id.id)) { seen.push(`${id.key} ${id.id}`); return false; }
            return true;
        });
        console.log(`\nbaseline ${arg('baseline')}: ${seen.length} pinned failure(s) seen (${seen.join('; ') || 'none'}), ${left.length} NEW`);
        fails.length = 0;
        fails.push(...left);
    }
    if (fails.length) { console.log('\n' + fails.join('\n')); console.log('ws-chromebook-fit: FAIL'); process.exit(1); }
    console.log('ws-chromebook-fit: OK');
})().catch(e => { console.error(e); console.log('ws-chromebook-fit: FAIL'); process.exit(1); });
