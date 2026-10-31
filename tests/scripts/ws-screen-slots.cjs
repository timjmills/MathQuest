// One answer area per item (owner ruling 2026-09-26): "In problems like this where they give a
// blank, it should not have a separate answer area." When a cell draws its own answer places -
// the "[ ]:[ ]" of a time, the boxes of a sentence, a fraction's two boxes, "[ ] R [ ]" - those
// places ARE the answer inputs, and the host's separate answer field is hidden.
//
// For every live skill and every screen host (the practice card, the card inside a MAP session,
// the online worksheet, the quiz)
// this renders items and reports a DOUBLED answer area: the cell holds answer places (drawn
// blanks that are not inputs, or its own inputs) AND the host's own answer field is visible.
//
//   node tests/scripts/ws-screen-slots.cjs                       # every live skill, all hosts
//   node tests/scripts/ws-screen-slots.cjs --skills measurement:time_5min,division:div_remainders
//   node tests/scripts/ws-screen-slots.cjs --category measurement --hosts card
//   node tests/scripts/ws-screen-slots.cjs --from 200 --to 300   # a slice of the skill list
//   node tests/scripts/ws-screen-slots.cjs --report-only         # print, never exit 1
//   node tests/scripts/ws-screen-slots.cjs --skills division:div_facts --hosts worksheet --uniform   # + one digit size, even rows
//
// Deploy gates (IMPROVEMENT_PLAN §1.4 S5; tests/scripts/ws-deploy-gates.sh):
//   --category c1,c2           only these categories (one or several)
//   --shard i/n                the i-th of n deterministic parts of the skill list (skill n goes to part
//                              n mod n), so two browser slots can share one sweep; applied after the filters
//   --json <file>              write every finding as {skills: {"cat:skill": ["host:kind", ...]}, findings: [...]}
//   --baseline <file>          fail only on a finding (skill + "host:kind") that the pinned file does not list;
//                              design/audit/baselines/screen-slots.json is today's pin. Listed findings that no
//                              longer occur are printed as "fixed" (tighten the pin), never failed
//   --dark                     SWEEP: dark mode (prefers-color-scheme: dark, so html.dark as the app sets it), as
//                              a pupil and as a teacher (--roles), on the fixed sample, hosts card, worksheet, quiz
//   --bigboard                 SWEEP: the teacher's Board display (body.teacher-mode.tv-bigboard, which
//                              css/teacher.css:96 and css/play-teacher.css zoom); the board shows the practice
//                              card only (teacher-shell.js startPractice maps board to practice), so host card
//   --sample <file>            the sweep sample (default tests/fixtures/precritic/sweep-sample.json: one skill per
//                              kit template, every screen host); --skills overrides it
//   --roles student,teacher    sweep roles (dark default student,teacher; bigboard teacher)
//   --write-sample <file>      derive the sample (the template of each live skill from generateQuestionFor seeds
//                              1-3, its most frequent q.cell.template, 'legacy' when none; the first skill of each
//                              template in SKILLS order) and write it; no gate runs
// A sweep adds one check to the doubled-area and paper-verb checks: LEGIBLE, any visible text or answer input in
// the whole host view (#gameView, #worksheetView, #quizTakeView incl. every state of the quiz's question dots)
// whose contrast against its own background is below the WCAG AA bar (4.5 : 1, large text 3 : 1) in the mode
// but not without it (the dark page bleeding into the cell; the board's dark frame). Contrast that is low in both is not this gate's.
// Finding kinds (the baseline's "host:kind"): doubled, paper, contrast; in a sweep the host is prefixed with the
// mode and role ("dark-teacher:worksheet:contrast").
//
// Seeded card (critic r1 N8; the S9 regression check, ws-deploy-gates session 2):
//   --seeds a-b                the card host deals generateQuestionFor({category, skill, seed}) for every seed a..b
//                              instead of one unseeded generateQuestion(), so which items a run sees no longer depends
//                              on the shard or what ran before; every seed is a render (a finding names its seed)
//   --need-ans x,y,...         with --seeds: FAIL unless the seeded card items dealt every one of these answers (the
//                              check proves it saw the case it guards, e.g. --skills measurement:reading_ruler_hard
//                              --hosts card --seeds 1-40 --need-ans 1/4,1/2,3/4: readings under an inch, which once
//                              showed the cell's own fraction boxes AND a typed fraction field)
//
// An empty run is a FAIL, never OK (critic r1 D3): an unknown --skills key, a retired skill, an unknown --category,
// a sweep sample that names a skill that is not live, a selection of 0 skills, or a run of 0 host renders each
// FAIL and name what was wrong.
//   node tests/scripts/ws-screen-slots.cjs --self-test         # the selection rules on a fixture list (no browser)
//
// Prints one line per doubled skill x host, a count, then `ws-screen-slots: OK` or `FAIL`.
const fs = require('fs');
const path = require('path');
const { open, listSkills } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const has = (k) => process.argv.includes('--' + k);
const ONLY = (arg('skills', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const CATEGORIES = (arg('category', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
const DARK = has('dark');
const BIGBOARD = has('bigboard');
const SWEEP = DARK || BIGBOARD;
if (DARK && BIGBOARD) { console.log('ws-screen-slots: --dark and --bigboard are separate sweeps; run one at a time'); console.log('ws-screen-slots: FAIL'); process.exit(2); }
const MODE = DARK ? 'dark' : BIGBOARD ? 'bigboard' : '';
const ROLES = SWEEP ? (arg('roles', DARK ? 'student,teacher' : 'teacher')).split(',').map((s) => s.trim()).filter(Boolean) : [''];
const SHARD = (() => {
    const s = arg('shard', '');
    if (!s) return null;
    const m = /^(\d+)\/(\d+)$/.exec(s);
    if (!m || +m[1] < 1 || +m[1] > +m[2]) { console.log(`ws-screen-slots: bad --shard ${s} (want i/n, 1 <= i <= n)`); console.log('ws-screen-slots: FAIL'); process.exit(2); }
    return { i: +m[1], n: +m[2] };
})();
const SAMPLE_FILE = arg('sample', path.join(__dirname, '..', 'fixtures', 'precritic', 'sweep-sample.json'));
const HOSTS = (arg('hosts', BIGBOARD ? 'card' : DARK ? 'card,worksheet,quiz' : 'card,map,worksheet,quiz') || '').split(',');
// --opts '{"times":"each"}' (wave 1 C2): the skill's options in the set's option store, which every host reads.
const OPTS = arg('opts', null) ? JSON.parse(arg('opts', '{}')) : null;
// --uniform (Lane D restart critic r1 R1-16, RUBRIC C3 screen: "even cells, a consistent layout for every item of one
// skill"): the worksheet host also deals a 6-item sheet and fails `worksheet:digits` when the kit cards' digit sizes
// differ by more than 10 % (a div_facts Mix sheet drew brackets at 29 px beside 40 px fractions) and `worksheet:rows`
// when the bordered paper cells of one row of cards differ in height by more than 1 px. Only kit cards are judged.
const UNIFORM = has('uniform');
const FROM = parseInt(arg('from', '0'), 10);
const TO = parseInt(arg('to', '100000'), 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (why) => { console.log(`ws-screen-slots: ${why}`); console.log('ws-screen-slots: FAIL'); process.exit(2); };
const SEEDS = (() => {
    const s = arg('seeds', '');
    if (!s) return null;
    const m = /^(\d+)-(\d+)$/.exec(s);
    if (!m || +m[1] > +m[2]) fail(`bad --seeds ${s} (want a-b, a <= b)`);
    return Array.from({ length: +m[2] - +m[1] + 1 }, (_, i) => +m[1] + i);
})();
const NEED_ANS = (arg('need-ans', '') || '').split(',').map((s) => s.trim()).filter(Boolean);
if (NEED_ANS.length && !SEEDS) fail('--need-ans needs --seeds (the answers of seeded card items)');
if (SEEDS && !HOSTS.includes('card')) fail('--seeds seeds the card host; add card to --hosts');

const isLive = (s) => !!s.skillId && !s.retired && !/retired|tombstone/i.test(s.label || '') && !/^_?tomb|retired/i.test(s.skillId);   // N11: s.retired (ws-harness listSkills) as ws-node-lint counts live
/**
 * The skills a run checks, and why a selection is wrong (critic r1 D3: an empty or misspelt selection is never OK).
 * all: every SKILLS entry [{categoryId, skillId, label}]; returns {skills, errors}.
 */
function selectSkills(all, { only = [], categories = [], sample = null, from = 0, to = 100000, shard = null } = {}) {
    const errors = [];
    const live = all.filter(isLive);
    const key = (s) => `${s.categoryId}:${s.skillId}`;
    const liveKeys = new Set(live.map(key));
    const allKeys = new Set(all.map(key));
    for (const k of only) {
        if (!allKeys.has(k)) errors.push(`--skills ${k}: no such skill (want category:skill as in data.js SKILLS)`);
        else if (!liveKeys.has(k)) errors.push(`--skills ${k}: a retired skill (tombstone), not a live one`);
    }
    const cats = new Set(live.map((s) => s.categoryId));
    for (const c of categories) if (!cats.has(c)) errors.push(`--category ${c}: no such category with a live skill`);
    let skills = live;
    if (sample) {
        for (const k of sample) if (!liveKeys.has(k)) errors.push(`the sweep sample names ${k}, which is not a live skill (regenerate it: --write-sample)`);
        skills = sample.map((k) => live.find((s) => key(s) === k)).filter(Boolean);
    }
    if (only.length) skills = skills.filter((s) => only.includes(key(s)));
    if (categories.length) skills = skills.filter((s) => categories.includes(s.categoryId));
    skills = skills.slice(from, to);
    if (shard) skills = skills.filter((_, i) => i % shard.n === shard.i - 1);
    if (!errors.length && !skills.length) errors.push('the selection has 0 skills (filters, --from/--to or --shard left nothing to check)');
    return { skills, errors };
}

if (has('self-test')) {
    const L = [
        { categoryId: 'measurement', skillId: 'time_5min', label: 'Time' }, { categoryId: 'measurement', skillId: 'reading_ruler_hard', label: 'Ruler' },
        { categoryId: 'addition', skillId: 'add_facts', label: 'Facts' }, { categoryId: 'addition', skillId: 'old_one', label: 'Old (retired)' },
        { categoryId: 'graveyard', skillId: '_tomb_1', label: 'tombstone' }, { categoryId: 'addition', skillId: 'flagged', label: 'Flagged', retired: true },
    ];
    const cases = [
        ['--skills of a skill flagged retired: true', { only: ['addition:flagged'] }, /retired skill/],
        ['--category measurment (a typo)', { categories: ['measurment'] }, /--category measurment: no such category/],
        ['--skills nosuch:skill', { only: ['nosuch:skill'] }, /--skills nosuch:skill: no such skill/],
        ['--skills of a retired skill', { only: ['addition:old_one'] }, /retired skill/],
        ['--category of only tombstones', { categories: ['graveyard'] }, /--category graveyard: no such category/],
        ['a sample naming a gone skill', { sample: ['addition:add_facts', 'addition:gone'] }, /sweep sample names addition:gone/],
        ['--from past the end', { from: 50 }, /0 skills/],
        ["--shard 2/2 of 1 skill", { only: ['measurement:time_5min'], shard: { i: 2, n: 2 } }, /0 skills/],
        ['--skills measurement:time_5min (valid)', { only: ['measurement:time_5min'] }, null],
        ['--category measurement (valid)', { categories: ['measurement'] }, null],
    ];
    let bad = 0;
    for (const [name, o, want] of cases) {
        const r = selectSkills(L, o);
        const ok = want ? r.errors.some((e) => want.test(e)) : (!r.errors.length && r.skills.length > 0);
        if (!ok) bad++;
        console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: ${r.errors.length ? r.errors.join('; ') : `${r.skills.length} skill(s)`}`);
    }
    console.log(bad ? 'ws-screen-slots --self-test: FAIL' : 'ws-screen-slots --self-test: OK');
    process.exit(bad ? 1 : 0);
}

// In the page: does this cell draw answer places, and is a separate host field visible?
function DETECT(cellSel, hostSel, textSel) {
    const vis = (el) => {
        if (!el || !el.isConnected) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !el.closest('[hidden], .mq-sr');
    };
    const cell = document.querySelector(cellSel);
    if (!cell) return { error: 'no cell' };
    const host = hostSel ? Array.from(document.querySelectorAll(hostSel)).find(vis) : null;
    const hostInput = host ? (host.matches('input') ? host : host.querySelector('input:not([type=hidden])')) : null;
    // the host's own answer area is still there, with its input showing (an input adopted into the
    // cell has left that area)
    const hostVisible = !!hostInput && vis(hostInput);
    const inHost = (el) => !!host && host.contains(el);
    // drawn answer places that are not inputs
    const SHAPES = /^(box|line|circle|time|fraction|mixed|unit|unit-open|cell|box-unknown)$/;
    const drawn = Array.from(cell.querySelectorAll('[data-mq-cell], [data-mq-blank], [data-ws-slot]')).filter((el) => {
        if (inHost(el) || !vis(el) || el.querySelector('input, select, textarea')) return false;
        if (el.matches('input, select, textarea')) return false;
        if (el.getAttribute('data-ws-graded') === '0') return false;
        if (el.hasAttribute('data-ws-slot') && !SHAPES.test(el.getAttribute('data-ws-shape') || '')) return false;
        return !(el.textContent || '').trim();
    });
    // the cell's own typed answer inputs (working rows and regroup boxes are not answers)
    const inputs = Array.from(cell.querySelectorAll('input[type=text], input:not([type]), input[inputmode]'))
        .filter((i) => vis(i) && i !== hostInput && !inHost(i) && !i.classList.contains('mq-opswork') && !i.classList.contains('mq-carry')
            && !i.classList.contains('column-carry-input') && !i.hasAttribute('data-mq-work'));
    // a legacy drawing's blank written as underscores ("5 + ___ = 8")
    let under = 0;
    const tw = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
        const t = tw.currentNode;
        if (/_{3,}/.test(t.nodeValue || '') && t.parentElement && vis(t.parentElement) && !inHost(t.parentElement)) under++;
    }
    // SUSPECTS (reported, not failed): an empty drawn box or rule the size of an answer place,
    // outside the drag / build widgets whose empty zones are drop targets
    const WIDGET = '.dnd-host, .pvdd-host, .pvb-host, .tfb-host, .b10-host, .nle-host, .cs-host, .df-host, [data-mq-model], [data-ws-zone], svg, table, .mq-kittwin, .k2-twin';
    const suspects = drawn.length || under ? [] : Array.from(cell.querySelectorAll('span, div')).filter((el) => {
        if (inHost(el) || !vis(el) || (el.textContent || '').trim() || el.querySelector('input, svg, img, canvas, select, button') || el.closest(WIDGET)) return false;
        if (el.children.length) return false;
        const cs = getComputedStyle(el);
        const bw = ['Top', 'Right', 'Bottom', 'Left'].map((k) => parseFloat(cs[`border${k}Width`]) || 0);
        const r = el.getBoundingClientRect();
        const box = bw.every((w) => w >= 1) && r.width >= 28 && r.width <= 200 && r.height >= 22 && r.height <= 110;
        const rule = bw[2] >= 1 && !bw[0] && !bw[1] && !bw[3] && r.width >= 30 && r.width <= 260;
        return box || rule;
    }).length;
    // a PAPER verb on screen (RUBRIC H7, PEDAGOGY 10.2): visible text the pupil reads, in verb
    // position (sentence start, after a sentence end or after an expression)
    const PAPER = /(^|[.?!:;]\s+|[0-9)=?]\s+)(Write|Circle|Mark|Draw|Shade|Check one|Check the|Cross out|Underline|Trace|Color|Colour|Cut out|Glue)\b(?=\s+\S)/;
    const tRoot = textSel ? document.querySelector(textSel) : cell;
    const paper = [];
    if (tRoot) {
        const w2 = document.createTreeWalker(tRoot, NodeFilter.SHOW_TEXT);
        while (w2.nextNode()) {
            const t = w2.currentNode;
            const el = t.parentElement;
            if (!el || !vis(el) || el.closest('.mq-sr, script, style, [aria-hidden="true"], .hint-popup, .qt-q-header, .mq-wsbar')) continue;
            const m = PAPER.exec((t.nodeValue || '').replace(/\s+/g, ' ').trim());
            if (m) paper.push((t.nodeValue || '').trim().slice(0, 50));
        }
    }
    return { hostVisible, drawn: drawn.length, under, inputs: inputs.length, suspects, paper,
        doubled: hostVisible && (drawn.length > 0 || inputs.length > 0 || under > 0),
        suspect: hostVisible && !(drawn.length > 0 || inputs.length > 0 || under > 0) && suspects > 0 };
}

// In the page (sweeps only): visible text and typed answer inputs in the host card whose contrast with
// their own background is below 3 : 1 in the mode AND at least 3 : 1 (or hidden) with the mode's class taken
// off (`toggle`), so only what dark mode / the board made illegible is reported. SVG text (drawn on its
// own shapes) and text over an image or a gradient are not judged.
function LEGIBLE(rootSel, toggle) {
    const root = document.querySelector(rootSel);
    if (!root) return { error: 'no host view' };
    // the quiz's question dots: every state the pupil meets (plain, answered, flagged, answered + flagged,
    // current + answered) is probed with a temporary copy of a real dot, under the real CSS
    const probes = [];
    const dot = root.querySelector('.qt-q-dot');
    if (dot) for (const st of ['', 'answered', 'flagged', 'answered flagged', 'current answered']) {
        const d = dot.cloneNode(true);
        d.className = `qt-q-dot ${st}`.trim(); d.removeAttribute('onclick'); d.style.transition = 'none';
        dot.parentNode.appendChild(d); probes.push(d);
    }
    const parse = (c) => {
        const m = /rgba?\(([^)]+)\)/.exec(c || '');
        if (!m) return null;
        const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const vis = (el) => {
        if (!el || !el.isConnected) return false;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.3) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && !el.closest('[hidden], .mq-sr, [aria-hidden="true"]');
    };
    // the first background behind el that is at least half opaque; null over an image or a gradient
    const bgOf = (el) => {
        for (let e = el; e; e = e.parentElement) {
            const cs = getComputedStyle(e);
            if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
            const c = parse(cs.backgroundColor);
            if (c && c.a >= 0.5) return c;
        }
        return { r: 255, g: 255, b: 255, a: 1 };
    };
    const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) });
    // WCAG AA: 3 : 1 for large text (24 px, or 18.66 px bold), 4.5 : 1 for the rest
    const barOf = (el) => { const cs = getComputedStyle(el); const fs = parseFloat(cs.fontSize) || 16; return fs >= 24 || (fs >= 18.66 && Number(cs.fontWeight) >= 700) ? 3 : 4.5; };
    const contrastOf = (el) => {
        if (!vis(el)) return null;
        const bg = bgOf(el);
        const fg = parse(getComputedStyle(el).color);
        if (!bg || !fg) return null;
        return { r: ratio(over(fg, bg), bg), bar: barOf(el), fg: getComputedStyle(el).color, bg: `rgb(${[bg.r, bg.g, bg.b].map(Math.round).join(', ')})` };
    };
    const items = [];
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) {
        const t = tw.currentNode;
        const txt = (t.nodeValue || '').trim();
        const el = t.parentElement;
        if (!txt || !el || el.closest('svg, script, style') || items.some((x) => x.el === el)) continue;
        items.push({ el, sample: txt, state: probes.includes(el) ? el.className.replace('qt-q-dot', '').trim() : (el.classList.contains('qt-q-dot') ? el.className.replace('qt-q-dot', '').trim() : undefined) });
    }
    for (const i of root.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]), textarea')) items.push({ el: i, sample: `input ${i.id || i.className || ''}`.trim() });
    const flagged = items.map((x) => Object.assign(x, { c: contrastOf(x.el) })).filter((x) => x.c && x.c.r < x.c.bar);
    // only what the mode itself made illegible: the same element with the mode's class taken off
    // (html.dark, body.tv-bigboard) is at least 3 : 1 or not shown
    if (toggle && flagged.length) {
        const host = toggle.on === 'html' ? document.documentElement : document.body;
        // transitions off while the class is away: a 0.2 s colour transition (the quiz dots) would otherwise
        // report the mode's own colours as the "without" colours and hide the finding
        const still = document.createElement('style');
        still.textContent = '*, *::before, *::after { transition: none !important; }';
        document.head.appendChild(still);
        host.classList.remove(toggle.cls);
        for (const x of flagged) x.off = contrastOf(x.el);
        host.classList.add(toggle.cls);
        void document.body.offsetHeight;
        still.remove();
    }
    probes.forEach((d) => d.remove());
    const low = flagged.filter((x) => !(x.off && x.off.r < x.c.bar))
        .map((x) => `"${x.sample.slice(0, 24)}"${x.state != null ? ` (dot${x.state ? ' ' + x.state : ''})` : ''} ${x.c.r.toFixed(2)}:1 (${x.c.fg} on ${x.c.bg}${x.off ? `; ${x.off.r.toFixed(2)}:1 without ${toggle.cls}` : ''})`);
    return { low, sameWithout: flagged.length - low.length };
}

// The sweep sample: one skill per kit template (tests/fixtures/precritic/sweep-sample.json).
function readSample() {
    const j = JSON.parse(fs.readFileSync(SAMPLE_FILE, 'utf8'));
    return (j.skills || []).map((r) => r.key);
}

// The kit template each live skill draws with: the most frequent q.cell.template over seeds 1-3.
async function writeSample(page, skills, file) {
    const rows = await page.evaluate((skills) => skills.map((s) => {
        const t = {};
        for (let seed = 1; seed <= 3; seed++) {
            try {
                const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, seed, itemIndex: 0 });
                const id = (q && q.cell && q.cell.template) || 'legacy';
                t[id] = (t[id] || 0) + 1;
            } catch (e) { t.error = (t.error || 0) + 1; }
        }
        const top = Object.entries(t).sort((a, b) => b[1] - a[1])[0];
        return { key: `${s.categoryId}:${s.skillId}`, template: top ? top[0] : 'error' };
    }), skills);
    const first = new Map();
    const count = {};
    for (const r of rows) { count[r.template] = (count[r.template] || 0) + 1; if (!first.has(r.template) && r.template !== 'error') first.set(r.template, r.key); }
    const out = {
        note: 'Pinned sweep sample for ws-screen-slots / ws-chromebook-fit --dark and --bigboard (IMPROVEMENT_PLAN §1.4 S5, §1.6.2): every screen host (practice card, online worksheet, quiz) x one skill per kit template. The template of a skill is the most frequent q.cell.template over generateQuestionFor seeds 1-3 (\'legacy\' = no kit cell yet); the skill is the first live skill of that template in SKILLS order. Regenerate with `node tests/scripts/ws-screen-slots.cjs --write-sample tests/fixtures/precritic/sweep-sample.json` and change it only with a STATUS note.',
        hosts: ['card', 'worksheet', 'quiz'],
        derived: new Date().toISOString().slice(0, 10),
        liveSkills: rows.length,
        skills: Array.from(first.entries()).map(([template, key]) => ({ template, key, skillsOnTemplate: count[template] })),
    };
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
    console.log(`${out.skills.length} templates over ${rows.length} live skills -> ${file}`);
}

// Put the page into the sweep's mode and role after a (re)load.
async function prep(page, role) {
    await page.evaluate((role) => {
        try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* ignore */ }
        if (role && window.setUserRole) window.setUserRole(role, { persist: false });
    }, role);
}

(async () => {
    const app = await open({ seed: 1, viewport: { width: BIGBOARD ? 1366 : 1280, height: BIGBOARD ? 768 : 900, deviceScaleFactor: 1 } });
    const { page } = app;
    const allSkills = await listSkills(page);
    if (arg('write-sample', null)) { await writeSample(page, allSkills.filter(isLive), arg('write-sample')); await app.close(); console.log('ws-screen-slots: OK'); return; }
    // a sweep runs on the pinned sample (one skill per kit template) unless --skills names the skills
    const SAMPLE = SWEEP && !ONLY.length ? readSample() : null;
    const sel = selectSkills(allSkills, { only: ONLY, categories: CATEGORIES, sample: SAMPLE, from: FROM, to: TO, shard: SHARD });
    if (sel.errors.length) { await app.close(); sel.errors.forEach((e) => console.log(e)); fail(`${sel.errors.length} selection error(s); nothing checked`); }
    const skills = sel.skills;
    const seen = new Map();   // --need-ans: answer -> first "skill seed n"
    if (DARK) await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    const doubled = [];
    const suspects = [];
    const paperVerbs = [];
    const contrast = [];
    const errors = [];
    const findings = [];   // {key, id: "host:kind", line}
    let mapOn = false;
    let checked = 0;
    for (const role of ROLES) {
        const tagOf = (host) => (MODE ? `${MODE}${role ? '-' + role : ''}:` : '') + host;
        // MAP turns the whole page into its session (body.map-immersive): it runs as its own pass,
        // after the other hosts, so a card render is never taken for a MAP one.
        const passes = [HOSTS.filter((h) => h !== 'map'), HOSTS.includes('map') ? ['map'] : []].filter((p) => p.length);
        for (const pass of passes) for (let n = 0; n < skills.length; n++) {
            const { categoryId: c, skillId: k } = skills[n];
            const key = `${c}:${k}`;
            if (n % 25 === 0) {
                mapOn = false;
                await page.reload({ waitUntil: 'networkidle2' });
                await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
                await prep(page, role);
            }
            if (OPTS) await page.evaluate((c, k, o) => { window.clearSetOptions({ silent: true }); window.setSetOptions(c, k, o, { silent: true }); }, c, k, OPTS);
            const note = (host, r, leg) => {
                checked++;
                const h = tagOf(host);
                if (r && r.paper && r.paper.length) { const l = `${key.padEnd(44)} ${h.padEnd(10)} paper verb on screen: "${r.paper[0]}"`; paperVerbs.push(l); findings.push({ key, id: `${h}:paper`, line: l }); }
                if (r && r.doubled) { const l = `${key.padEnd(44)} ${h.padEnd(10)} host field + ${r.drawn} drawn place(s), ${r.under} underscore blank(s), ${r.inputs} cell input(s)${r.seedNote || ''}`; doubled.push(l); findings.push({ key, id: `${h}:doubled`, line: l }); }
                else if (r && r.suspect) suspects.push(`${key.padEnd(44)} ${h.padEnd(10)} host field + ${r.suspects} empty drawn box(es) (check by eye)`);
                if (leg && leg.low && leg.low.length) { const l = `${key.padEnd(44)} ${h.padEnd(10)} ${leg.low.length} low-contrast text(s), e.g. ${leg.low[0]}`; contrast.push(l); findings.push({ key, id: `${h}:contrast`, line: l }); }
            };
            const legible = (sel) => (SWEEP ? page.evaluate(LEGIBLE, sel, DARK ? { on: 'html', cls: 'dark' } : { on: 'body', cls: 'tv-bigboard' }) : null);
            try {
                if (pass.includes('card')) for (const seed of SEEDS || [null]) {
                    const ok = await page.evaluate((c, k, board, seed) => {
                        try {
                            const st = window.state; st.quizMode = false; st.category = c; st.skill = k; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                            window.showView('gameView');
                            // the teacher's Board display (teacher-shell.js startPractice, run.mode 'board')
                            if (board) document.body.classList.add('tv-bigboard');
                            // --seeds: the seeded item (generateQuestionFor runs the same generateQuestion, practice mode)
                            st.currentQ = seed == null ? window.generateQuestion() : window.generateQuestionFor({ category: c, skill: k, seed });
                            if (!st.currentQ) return 'none';
                            window.renderQuestion();
                            if (board) document.body.classList.add('tv-bigboard');
                            // the board must really be on: the teacher's full-screen frame (css/play-teacher.css)
                            if (board && getComputedStyle(document.getElementById('gameView')).position !== 'fixed') return 'board';
                            return { ans: String(st.currentQ.ans), type: st.currentQ.answerType || '' };
                        } catch (e) { return false; }
                    }, c, k, BIGBOARD, seed);
                    if (ok === 'board') throw new Error('the Board display did not engage (#gameView is not the fixed board frame)');
                    if (ok === 'none') throw new Error(`card: the generator dealt no item${seed == null ? '' : ` for seed ${seed}`}`);
                    if (ok) {
                        await sleep(350);
                        const r = await page.evaluate(DETECT, '#visualAid', '#answerInputArea', '#questionPaper');
                        if (seed != null) {
                            if (!seen.has(ok.ans)) seen.set(ok.ans, `${key} seed ${seed}`);
                            if (r && r.doubled) r.seedNote = ` [seed ${seed}, answer ${ok.ans}, answerType ${ok.type}]`;
                        }
                        note('card', r, await legible('#gameView'));
                    }
                }
                if (pass.includes('map')) {
                    // MAP borrows the practice card with the paper wrapper off (the owner's time card)
                    if (!mapOn) {
                        await page.evaluate(() => { try { window.startMapSession({ tier: 'mixed', bands: ['161-170', '171-180', '181-190', '191-200'], domains: ['OA', 'NO', 'MD', 'G'], itemCount: 0, mode: 'practice' }); } catch (e) { /* no MAP */ } });
                        await sleep(1200);
                    }
                    const ok = await page.evaluate(async (c, k) => {
                        try {
                            const st = window.state;
                            st.category = c; st.skill = k; st.hasAnswered = false;
                            st.currentQ = window.generateQuestionFor({ category: c, skill: k, seed: 11 });
                            window.renderQuestion(); return !!st.mapMode;
                        } catch (e) { return false; }
                    }, c, k);
                    mapOn = ok;
                    if (ok) { await sleep(350); note('map', await page.evaluate(DETECT, '#visualAid', '#answerInputArea', '#questionCard'), await legible('#gameView')); }
                }
                if (pass.includes('worksheet')) {
                    const ok = await page.evaluate((c, k) => {
                        try {
                            const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 2;
                            window.initWorksheet(); return true;
                        } catch (e) { return false; }
                    }, c, k);
                    if (ok) {
                        await sleep(450);
                        const nq = await page.evaluate(() => (window.state.worksheetQs || []).length);
                        let worst = null;
                        let leg = null;
                        for (let i = 0; i < nq; i++) {
                            const r = await page.evaluate(DETECT, `#ws_card_${i} .mq-wspaper`, `#ws_card_${i} .mq-answerrow`);
                            if (SWEEP && !leg) leg = await legible('#worksheetView');
                            if (r && r.doubled) { worst = r; break; }
                            worst = worst || r;
                        }
                        note('worksheet', worst, leg);
                        if (UNIFORM) {
                            const u = await page.evaluate(async (c, k) => {
                                const st = window.state; st.category = c; st.skill = k; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
                                window.initWorksheet();
                                await new Promise((r) => setTimeout(r, 1100));   // the worksheet's layout passes (80 / 320 / 900 ms)
                                const cards = [...document.querySelectorAll('#worksheetGrid > .problem-card.mq-wscard')].filter((cd) => cd.querySelector('.ws-card-visual .mq-kit'));
                                const digitPx = (cd) => {
                                    let mx = 0;
                                    const w = document.createTreeWalker(cd.querySelector('.ws-card-visual'), NodeFilter.SHOW_TEXT);
                                    for (let n = w.nextNode(); n; n = w.nextNode()) {
                                        const el = n.parentElement;
                                        if (!/\d/.test(n.nodeValue) || !el || !el.offsetParent || el.closest('.mq-instr, .mq-tn-count, [data-mq-screen-only]')) continue;
                                        mx = Math.max(mx, parseFloat(getComputedStyle(el).fontSize) || 0);
                                    }
                                    return mx;
                                };
                                const ds = cards.map(digitPx).filter((x) => x > 0);
                                const out = { n: cards.length, digits: null, rows: null };
                                if (ds.length > 1 && Math.max(...ds) > 1.1 * Math.min(...ds)) out.digits = `${Math.min(...ds)}-${Math.max(...ds)} px`;
                                const rows = new Map();
                                for (const cd of cards) { const t = Math.round(cd.getBoundingClientRect().top); if (!rows.has(t)) rows.set(t, []); rows.get(t).push(cd.querySelector('.ws-card-visual').getBoundingClientRect().height); }
                                for (const hs of rows.values()) if (hs.length > 1 && Math.max(...hs) - Math.min(...hs) > 1) { out.rows = hs.map((h) => Math.round(h)).join('/') + ' px'; break; }
                                return out;
                            }, c, k);
                            checked++;
                            if (u.digits) { const l = `${key.padEnd(44)} worksheet  ${u.n} kit cards in different digit sizes: ${u.digits} (one digit size per worksheet)`; findings.push({ key, id: `${tagOf('worksheet')}:digits`, line: l }); console.log(l); }
                            if (u.rows) { const l = `${key.padEnd(44)} worksheet  one row of cards holds paper cells of ${u.rows} (equal cells per row)`; findings.push({ key, id: `${tagOf('worksheet')}:rows`, line: l }); console.log(l); }
                        }
                    }
                }
                if (pass.includes('quiz')) {
                    const ok = await page.evaluate((c, k) => {
                        try {
                            const q = window.generateQuestionFor({ category: c, skill: k, seed: 7, itemIndex: 0 });
                            const questions = [{ id: 0, skillId: k, points: 1, questionData: window.quizQuestionData(Object.assign({ categoryId: c }, q)) }];
                            const test = { id: null, name: 'Slots', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                                settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                            window.handleQuizURL(window.compressTestForURL(test));
                            const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                            window.startQuizTest(); return true;
                        } catch (e) { return false; }
                    }, c, k);
                    if (ok) { await sleep(400); note('quiz', await page.evaluate(DETECT, '#quizTakeView .mq-qtpaper', '#quizTakeView .qt-answer-area'), await legible('#quizTakeView')); }
                    await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) { /* ignore */ } });
                }
            } catch (e) {
                const l = `${key} ERR ${String(e.message || e).split('\n')[0]}`;
                errors.push(l);
                console.log(l);
            }
        }
    }
    await app.close();
    doubled.forEach((l) => console.log(l));
    paperVerbs.forEach((l) => console.log(l));
    contrast.forEach((l) => console.log(l));
    if (suspects.length) { console.log('\nsuspects (an empty drawn box beside a visible host field; not failed):'); suspects.forEach((l) => console.log('  ' + l)); }
    const what = `${MODE ? `${MODE} sweep (${ROLES.join(', ')}), ` : ''}${SHARD ? `shard ${SHARD.i}/${SHARD.n}, ` : ''}`;
    console.log(`\n${what}${skills.length} skills, ${checked} host renders, ${doubled.length} doubled answer area(s), ${paperVerbs.length} paper verb(s) on screen${SWEEP ? `, ${contrast.length} low-contrast host(s)` : ''}`);
    if (arg('json', null)) {
        const bySkill = {};
        for (const f of findings) (bySkill[f.key] = bySkill[f.key] || []).push(f.id);
        fs.mkdirSync(path.dirname(path.resolve(arg('json'))), { recursive: true });
        fs.writeFileSync(arg('json'), JSON.stringify({ mode: MODE || 'default', roles: ROLES.filter(Boolean), shard: SHARD ? `${SHARD.i}/${SHARD.n}` : null, hosts: HOSTS,
            skillsChecked: skills.length, hostRenders: checked, skills: bySkill, findings: findings.map((f) => ({ key: f.key, id: f.id, line: f.line.replace(/\s+/g, ' ') })), errors }, null, 1) + '\n');
    }
    let failing = findings;
    if (arg('baseline', null)) {
        const base = JSON.parse(fs.readFileSync(arg('baseline'), 'utf8'));
        const pinned = base.skills || {};
        failing = findings.filter((f) => !(pinned[f.key] || []).includes(f.id));
        // a pinned finding in this run's scope that did not occur: tighten the pin (never failed)
        const inScope = new Set(skills.map((s) => `${s.categoryId}:${s.skillId}`));
        const hostsRun = new Set(ROLES.flatMap((role) => HOSTS.map((h) => (MODE ? `${MODE}${role ? '-' + role : ''}:` : '') + h)));
        const fixed = [];
        for (const [key, ids] of Object.entries(pinned)) {
            if (!inScope.has(key)) continue;
            for (const id of ids) if (hostsRun.has(id.split(':').slice(0, -1).join(':')) && !findings.some((f) => f.key === key && f.id === id)) fixed.push(`${key} ${id}`);
        }
        console.log(`baseline ${arg('baseline')}: ${findings.length - failing.length} pinned finding(s) seen, ${failing.length} NEW${fixed.length ? `, ${fixed.length} pinned but not seen (fixed or intermittent: ${fixed.join('; ')})` : ''}`);
        failing.forEach((f) => console.log(`NEW ${f.line}`));
    }
    // a sweep (or a seeded run) that could not render a host has not checked it
    const errFail = (SWEEP || SEEDS) && errors.length > 0;
    if (errFail) console.log(`${errors.length} render error(s): the run did not check those hosts`);
    // nothing checked is never OK (critic r1 D3)
    const empty = checked === 0;
    if (empty) console.log(`0 host renders: ${skills.length} skill(s) selected on hosts ${HOSTS.join(', ')}, but no host rendered, so nothing was checked`);
    // --need-ans: the seeded items must have dealt the case the run guards
    const missing = NEED_ANS.filter((a) => !seen.has(a));
    if (SEEDS) console.log(`seeded card answers: ${seen.size} distinct (${Array.from(seen.keys()).slice(0, 20).join(', ')}${seen.size > 20 ? ' ...' : ''})${NEED_ANS.length ? `; needed ${NEED_ANS.join(', ')}: ${missing.length ? `MISSING ${missing.join(', ')} (widen --seeds: the check did not see the case it guards)` : NEED_ANS.map((a) => `${a} at ${seen.get(a).split(' ').slice(1).join(' ')}`).join(', ')}` : ''}`);
    if (empty || missing.length) { console.log('ws-screen-slots: FAIL'); process.exit(1); }
    if ((failing.length || errFail) && !has('report-only')) { console.log('ws-screen-slots: FAIL'); process.exit(1); }
    console.log('ws-screen-slots: OK');
})().catch((e) => { console.error(e); console.log('ws-screen-slots: FAIL'); process.exit(1); });
