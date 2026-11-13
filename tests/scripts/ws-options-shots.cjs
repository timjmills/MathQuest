#!/usr/bin/env node
// ws-options-shots — GATE: the option panel's live sample shows the problem, for EVERY skill with an options panel.
//
//   node tests/scripts/ws-options-shots.cjs                       # every skill with options, at 1280x1000, 1366x768, 1024x768, 820x1180
//   node tests/scripts/ws-options-shots.cjs --skill algebra:growing [--skill cat:skill ...]   (or a comma list)
//   node tests/scripts/ws-options-shots.cjs --widths 1280 --workers 3 --shots <dir> --save-panels
//   node tests/scripts/ws-options-shots.cjs algebra:growing ...   # (bare cat:skill refs, as the old screenshot tool took them)
//   node tests/scripts/ws-options-shots.cjs --skill a:b --skip-no-panel  # a live skill with no options panel is SKIPPED, not FAIL
//   node tests/scripts/ws-options-shots.cjs --shard 1/2 --workers 1      # every i-th skill of the full list (deploy session 4)
//
// Each skill is opened the way a teacher does (lf-algebra F8/G11 repro): teacher mode → Sets → the skill's Options
// button → the shared editor (#skillOptionsPopover). The panel draws its sample, tidies it at once and again at +950 ms
// (skill-options-ui _tidySample); the gate reads it 1.5 s after the click, after both passes, and fails a skill when
//   (a) the stage `.tv-sko-frame > .tvp-stage` is not inside the frame (1 px tolerance; critic-panel-r1 F4: no "covers
//       90 %" escape, so a clipped drawing fails) — the F8/G11 defect put the stage at about (-183,-358);
//   (b) the frame's visible crop holds no ink: at most 0.5 % dark pixels (luma < 230, inside a 3 px inset);
//   (c) the sample is illegible (critic-panel-r1 F1): the smallest visible HTML text of the sample (question, labels,
//       answer choices), as drawn = computed font-size × its effective scale (bounding width / layout width), is under
//       9 px. A sample that cannot be drawn whole at 9 px is shown one whole part at a time ("1 of N"): the visible
//       part is what is measured, every part in turn (`@<w> part i`, Next arrow), and each must be whole (inside the
//       frame). The smallest SVG text is reported, not failed;
//   (d) the panel's controls leave the window (critic-panel-r1 F2): `.tv-sko-foot`'s bottom below innerHeight, or the
//       Done button not wholly inside the window, or the panel itself outside it;
//   (e) a page error is thrown while the panel opens or redraws (critic-panel-r1 F4);
//   [hit] (critic-panel-r3 P1) a visible option control whose centre does not take the pointer (document.elementFromPoint
//       there is not the control, inside it, or its own label), and the option-change pass clicks with page.mouse.click;
//   (f) the drawing's scale is under 0.30 (its strokes are hairlines), or the frame ends shorter than its CSS height
//       (critic-panel-r1 F3: a grown frame computed from clientHeight but written as a border-box height).
// The main sweep is every skill at 1280×1000, 1366×768, 1024×768 and 820×1180. The SPOT set (the critic's cases: the coordinates
// transformation skills, the long algebra word problems, the skills whose footer fell off the window, ...) and every
// --skill run also get: 1280×720 (`@1280x720`), a resize with the panel open from 1280×1000 to 1280×720
// (`@1280x1000>720`), and an option change at every width: the first select / checkbox of the panel is changed and
// (a)-(e) are re-measured 50 ms and 1.5 s after it (`@<w> changed +50ms`, `+1.5s`).
// A skill whose sample is honestly unavailable (`.tvp-frame.is-unavailable`, its own message) is reported, not failed.
// A --skill that has no options panel FAILs (a typo or a skill that lost its options); with --skip-no-panel (ws-precritic's
// scoped row: a lane's skills need not all have options) a LIVE skill with no panel prints `skip <ref>: no options panel`
// and is not checked, while a skill that is not live (unknown, retired) still FAILs. Every skill skipped: `OK (0 skills ...)`.
// --shard i/n checks every n-th skill of the full list starting at the i-th (sorted list order; ws-deploy-gates session 4),
// and the same share of the spot set. --no-spot drops the spot passes from a full run.
// Prints `ws-options-shots: OK (n skills × w widths)` or `ws-options-shots: FAIL (n)`; exit 1 on FAIL.
// --shots <dir> saves every frame crop; --fail-shots <dir> (default: scratch-free, off) saves only the failing ones;
// --save-panels writes the whole panel to design/audit/options-panels/<cat>-<skill>.png (the old tool's P12 evidence).
// --checks inside,ink,text,controls,pageerror,scale limits which families fail (each FAIL reason is tagged [family]);
// --change gives every main check the option-change pass; --changed-only judges only the readings after it;
// --inject <file.js> runs a backtest fixture script in the page (tests/fixtures/precritic/options-shots/).
// --verbose prints an `ok` line (scale, smallest text, part) for every check of a full run too.
// A full run is ~1.7 s a skill a width per worker; --workers (default 3) runs that many browsers side by side.
'use strict';
const fs = require('fs');
const path = require('path');
const { ROOT, open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const many = (k) => { const out = []; argv.forEach((a, i) => { if (a === '--' + k && argv[i + 1]) out.push(argv[i + 1]); }); return out; };
const one = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const flag = (k) => argv.includes('--' + k);
const valued = new Set(['--skill', '--widths', '--workers', '--shots', '--fail-shots', '--shard', '--checks', '--inject']);
const bare = argv.filter((a, i) => /^[a-z0-9_]+:[a-z0-9_]+$/i.test(a) && !valued.has(argv[i - 1]));
const ONLY = [...new Set([...many('skill').flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean), ...bare])];
// The panel's widths (owner scope, 2026-11-13: 1280, 1366, 1024 and 820; 390 dropped). `--widths 1280,820` keeps their heights.
const HEIGHT = { 1280: 1000, 1366: 768, 1024: 768, 820: 1180, 390: 844 };   // (390: only when asked, for the round-1/2 backtest rows)
const WIDTHS = String(one('widths', '1280,1366,1024,820')).split(',').map(Number).filter(Boolean);
const WORKERS = Math.max(1, Number(one('workers', 3)) || 1);
const SHOTS = one('shots', '') ? path.resolve(one('shots')) : '';
const FAIL_SHOTS = one('fail-shots', '') ? path.resolve(one('fail-shots')) : '';
const SAVE_PANELS = flag('save-panels');
const SKIP_NO_PANEL = flag('skip-no-panel');
const SHARD = (() => {
    const v = one('shard', '');
    if (!v) return null;
    const m = /^(\d+)\/(\d+)$/.exec(v);
    if (!m || +m[1] < 1 || +m[1] > +m[2]) { console.log(`ws-options-shots: --shard ${v}: give i/n with 1 <= i <= n`); console.log('ws-options-shots: FAIL (usage)'); process.exit(2); }
    return { i: +m[1], n: +m[2] };
})();
if (SHARD && (many('skill').length || bare.length)) { console.log('ws-options-shots: --shard and --skill do not go together'); console.log('ws-options-shots: FAIL (usage)'); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const INK_MIN = 0.005, TEXT_MIN = 9;
const NO_SPOT = flag('no-spot');
// --checks a,b: only these families fail a reading (the others are still measured and shown); a backtest row isolates its
// own finding with it. inside (a), ink (b), text (c), controls (d), pageerror (e), scale (f).
// critic-panel-r2 (round 3): clip (an overflow box inside the stage clips its content, F1), cover (the parts together
// show every block of the item, F1/F2), choices (the answer choices one lettered part of their own, F2), svgtext (SVG
// labels at the floor, F3), parts (every part walked), summary (the clamped
// option summary has a keyboard/touch expand control, F5), repeat (no sentence shown twice, F6).
const FAMILIES = ['hit', 'inside', 'ink', 'text', 'controls', 'pageerror', 'scale', 'clip', 'cover', 'choices', 'svgtext', 'parts', 'summary', 'repeat'];
const CHECKS = new Set(String(one('checks', FAMILIES.join(','))).split(',').map((x) => x.trim()).filter(Boolean));
const BAD_CHECK = [...CHECKS].filter((c) => !FAMILIES.includes(c));
if (BAD_CHECK.length) { console.log(`ws-options-shots: --checks ${BAD_CHECK.join(',')}: unknown (${FAMILIES.join(', ')})`); console.log('ws-options-shots: FAIL (usage)'); process.exit(2); }
// SVG text floor (critic-panel-r2 F3): the same 9 px as HTML text. No lower SVG floor is allowed: a grid's tag or a
// group's number is read by the teacher like any other word.
const SVG_TEXT_MIN = 9;
// Every part is walked; a sample with more parts than this FAILs [parts] (it is not a sample a teacher can page through).
const PART_CAP = 40;
// A part's own ink floor: dark pixels inside the drawn part's box (not the whole frame), the same 0.5 % as a whole sample.
const PART_INK_MIN = 0.005;
// --change: the option-change pass on every main check (a full run gives it to the spot set; a --skill run to every skill).
const CHANGE_ALL = flag('change');
// --changed-only: only the readings taken after the option change are judged (the backtest of that pass).
const CHANGED_ONLY = flag('changed-only');
// --inject <file.js>: a script run in the page after boot (a backtest fixture that models a regression: an oversize
// stage, a page error while the panel draws). Never used by a gate run.
const INJECT = one('inject', '') ? fs.readFileSync(path.resolve(one('inject')), 'utf8') : '';
const VERBOSE = flag('verbose');
// The critic's cases (critic-panel-r1): the transformation skills (k 0.17-0.23), the long algebra word problems, the skills
// whose footer fell below the window at 1280, a grown frame that shrinks on an option change, and plain short samples.
const SPOT = [
    'coordinates:geo_translate', 'coordinates:geo_reflect', 'coordinates:geo_rotate', 'coordinates:reflect_x_axis',
    'coordinates:rotate_quarter_turn', 'coordinates:translate_left_down', 'coordinates:coord_distance_q1',
    'algebra:two_step_add_then_div', 'algebra:two_step_add_then_mult', 'algebra:multi_step_word', 'algebra:multi_step_word_plain',
    'algebra_mixed:algebra_all', 'algebra:evaluate_expression', 'addition:add_word_problems', 'addition:add_5_pictures',
    'subtraction:sub_5_pictures', 'subtraction:sub_2d_1d', 'comparing:classify_count', 'integers:order_negatives',
    'integers:abs_value', 'number_ops_mixed:mixed', 'shapes_early:shape_attributes', 'fractions:fraction_of_set',
    'composing:number_bonds', 'multiplication:mult_facts', 'multiplication:mult_chart_easy',
];

// Count dark pixels of a PNG (base64) in the page itself: no image library in the repo.
async function inkOf(page, b64, part = null) {
    return page.evaluate(async (b64, part) => {
        const img = new Image();
        await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/png;base64,' + b64; });
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
        const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        // (a 3 px inset: the frame's own border and radius are not ink)
        const IN = 3, W = Math.max(1, c.width - 2 * IN), H = Math.max(1, c.height - 2 * IN);
        const d = g.getImageData(IN, IN, W, H).data;
        let dark = 0;
        for (let i = 0; i < d.length; i += 4) if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < 230) dark++;
        // (the drawn part's own box, frame-relative: its density, so a near-blank part in a big frame cannot pass)
        let own = null;
        if (part) {
            const x0 = Math.max(IN, Math.round(part.x)), y0 = Math.max(IN, Math.round(part.y));
            const x1 = Math.min(c.width - IN, Math.round(part.x + part.w)), y1 = Math.min(c.height - IN, Math.round(part.y + part.h));
            if (x1 > x0 && y1 > y0) {
                const e = g.getImageData(x0, y0, x1 - x0, y1 - y0).data;
                let k = 0;
                for (let i = 0; i < e.length; i += 4) if (0.299 * e[i] + 0.587 * e[i + 1] + 0.114 * e[i + 2] < 230) k++;
                own = k / ((x1 - x0) * (y1 - y0));
            }
        }
        return { ink: dark / (W * H), own };
    }, b64, part);
}

// Everything the gate reads off the open panel, in one pass.
function measure(page) {
    return page.evaluate(() => {
        const pop = document.getElementById('skillOptionsPopover');
        const frame = pop && pop.querySelector('.tv-sko-frame');
        if (!frame) return { noFrame: true };
        const stage = frame.querySelector(':scope > .tvp-stage');
        const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
        // the sample's text as drawn: computed font-size × the element's effective scale (bounding width / layout width)
        let minPx = Infinity, minText = '', svgPx = Infinity, svgText = '';
        if (stage) {
            const sk = stage.offsetWidth ? stage.getBoundingClientRect().width / stage.offsetWidth : 1;
            const tw = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
            for (let n = tw.nextNode(); n; n = tw.nextNode()) {
                const t = n.textContent.trim();
                const el = n.parentElement;
                if (!t || !el || !el.getClientRects().length) continue;
                const cs = getComputedStyle(el);
                if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
                const fsz = parseFloat(cs.fontSize) || 0;
                if (el.closest('svg')) {
                    const m = el.getScreenCTM && el.getScreenCTM();
                    const px = fsz * (m ? Math.hypot(m.a, m.b) : sk);
                    if (px < svgPx) { svgPx = px; svgText = t.slice(0, 24); }
                    continue;
                }
                // (a ratio within 3 % of the stage's scale is the layout width's whole-pixel rounding: the stage's scale)
                let eff = el.offsetWidth >= 4 ? el.getBoundingClientRect().width / el.offsetWidth : sk;
                if (!(eff > 0) || Math.abs(eff - sk) < 0.03 * sk) eff = sk;
                const px = fsz * eff;
                if (px < minPx) { minPx = px; minText = t.slice(0, 24); }
            }
        }
        // the frame's own CSS height (its inline grown height set aside for one synchronous read)
        const grown = frame.style.height;
        frame.style.height = '';
        const cssH = frame.offsetHeight;
        frame.style.height = grown;
        // (round 3) The item's atoms (every word outside a drawing, every outermost svg / img / canvas) as the UNPAGED item
        // draws them: the parts' hidden blocks are shown for one synchronous read, then hidden again (no paint between).
        const atomsOf = () => {
            const out = [];
            if (!stage) return out;
            const tw2 = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
            for (let n = tw2.nextNode(); n; n = tw2.nextNode()) {
                const el = n.parentElement;
                if (!n.textContent.trim() || !el || el.closest('svg')) continue;
                out.push({ n, el, t: n.textContent.replace(/\s+/g, ' ').trim() });
            }
            for (const g of stage.querySelectorAll('svg, img, canvas')) if (!(g.parentElement && g.parentElement.closest('svg'))) out.push({ n: g, el: g, t: `<${g.tagName.toLowerCase()}>` });
            return out;
        };
        const rectOf = (a) => {
            if (a.n.nodeType === 3) { const rg = document.createRange(); rg.selectNodeContents(a.n); const rs = [...rg.getClientRects()].filter((r) => r.width > 0 && r.height > 0); if (!rs.length) return null; const top = Math.min(...rs.map((r) => r.top)), bottom = Math.max(...rs.map((r) => r.bottom)); const ih = Math.min(...rs.map((r) => r.height)) * 0.2; return { left: Math.min(...rs.map((r) => r.left)), top: top + ih, right: Math.max(...rs.map((r) => r.right)), bottom: bottom - ih }; }
            // (a text's glyph box overhangs a tight line box by a pixel or two: its middle 60 % of a line is what must show)
            const r = a.n.getBoundingClientRect();
            return r.width > 0 && r.height > 0 ? r : null;
        };
        const seen = (el) => { const cs = getComputedStyle(el); return cs.visibility !== 'hidden' && Number(cs.opacity) !== 0; };
        const idMap = window.__osIds || (window.__osIds = new WeakMap());
        const idOf = (n) => { if (!idMap.has(n)) { window.__osNext = (window.__osNext || 0) + 1; idMap.set(n, window.__osNext); } return idMap.get(n); };
        const CHOICE = '.tvp-options > .tvp-opt, .opt-list > .opt';
        const QLINE = '.tvp-q, .question-line, .tvp-instr';
        const item = [];
        let itemChoices = [];
        if (stage) {
            const hid = [...stage.querySelectorAll('[data-sko-hide]')];
            const was = hid.map((e) => e.style.display);
            hid.forEach((e) => { e.style.display = e.dataset.skoHide === '-' ? '' : e.dataset.skoHide; });
            for (const a of atomsOf()) if (seen(a.el) && rectOf(a)) item.push([idOf(a.n), a.t.slice(0, 30)]);
            itemChoices = [...stage.querySelectorAll(CHOICE)].filter((c) => c.getClientRects().length && seen(c));
            hid.forEach((e, i) => { e.style.display = was[i]; });
        }
        // what of it a teacher sees now: drawn, and wholly inside the frame and inside every clipping box around it
        const fR = frame.getBoundingClientRect();
        const within = (r, b) => r.left >= b.left - 1.5 && r.top >= b.top - 1.5 && r.right <= b.right + 1.5 && r.bottom <= b.bottom + 1.5;
        const clipOK = (from, r) => { for (let a = from; a && a !== frame; a = a.parentElement) { const cs = getComputedStyle(a); if ((cs.overflowX !== 'visible' || cs.overflowY !== 'visible') && !within(r, a.getBoundingClientRect())) return false; } return true; };
        const visible = (a) => { if (!seen(a.el)) return false; const r = rectOf(a); return !!r && within(r, fR) && clipOK(a.n.parentElement, r); };
        const vis = [];
        const visText = [];
        let qShown = false;
        if (stage) for (const a of atomsOf()) if (visible(a)) { vis.push(idOf(a.n)); if (a.n.nodeType === 3) { const inQ = !!a.el.closest(QLINE); visText.push([a.t, inQ]); if (inQ) qShown = true; } }
        // F1: a box inside the stage that clips its own content (overflow not visible and content wider or taller than it)
        const clips = [];
        if (stage) for (const el of stage.querySelectorAll('*')) {
            if (el.closest('svg') || !el.getClientRects().length) continue;
            const cs = getComputedStyle(el);
            const cx = cs.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1;
            const cy = cs.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 1;
            if (cx || cy) clips.push(`${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''} ${cx ? `${el.scrollWidth}>${el.clientWidth} wide` : ''}${cx && cy ? ', ' : ''}${cy ? `${el.scrollHeight}>${el.clientHeight} tall` : ''}`);
        }
        // F2: the answer choices on this part, and whether each carries its letter or label (text outside its drawing)
        const choiceVis = [], unlabeled = [];
        itemChoices.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            if (!(r.width > 0 && r.height > 0) || !seen(c) || !within(r, fR) || !clipOK(c.parentElement, r)) return;
            choiceVis.push(i);
            const label = [...c.querySelectorAll('*'), c].filter((e) => !e.closest('svg')).map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('')).join('').trim();
            if (!label) unlabeled.push(i);
        });
        // F6: the question line said again in the sample: its whole text (20+ characters) is contained in the visible text
        // outside it. That is the sample's composition (live play hides such a line, question-render's mq-dup). A sentence
        // the ITEM repeats (a question naming the sentence its visual shows, two glossary words with one definition) is the
        // item's own content, left alone, and not counted.
        const norm = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const qText = norm(visText.filter(([, inQ]) => inQ).map(([t]) => t).join(' '));
        const oText = ` ${norm(visText.filter(([, inQ]) => !inQ).map(([t]) => t).join(' '))} `;
        const repeats = qText.length >= 20 && /[a-z]{3,}/.test(qText) && oText.includes(` ${qText} `) ? [qText.slice(0, 40)] : [];
        // F4: the option body's own visible height (and whether it has more than that to show)
        const bodyEl = pop.querySelector('.tv-sko-body');
        // F5: a summary clamped to two lines has an expand control reachable by touch and keyboard
        const sum = pop.querySelector('.tv-sko-sum');
        const clamped = !!sum && sum.scrollHeight > sum.clientHeight + 1;
        const more = pop.querySelector('.tv-sko-head button[aria-expanded]');
        const moreOK = !!more && more.getClientRects().length > 0 && !more.disabled && more.tabIndex >= 0;
        // P1 (critic-panel-r3): every visible option control takes a pointer at its centre. document.elementFromPoint there
        // must be the control, inside it, or its own <label> (a "?" hit area hung off the row swallowed every click).
        const blocked = [];
        let hitN = 0;
        if (bodyEl) {
            const bR = bodyEl.getBoundingClientRect();
            for (const e of bodyEl.querySelectorAll('input, select, button:not(.sko-tip), textarea')) {
                if (!e.getClientRects().length || !seen(e) || e.disabled) continue;
                let t = e;
                const r0 = e.getBoundingClientRect();
                // (a visually hidden tick box is pointed at through its label)
                if (r0.width < 2 || r0.height < 2 || Number(getComputedStyle(e).opacity) === 0) { const lb = e.closest('label') || (e.labels && e.labels[0]); if (!lb) continue; t = lb; }
                const r = t.getBoundingClientRect();
                const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                if (cy < Math.max(0, bR.top) + 1 || cy > Math.min(innerHeight, bR.bottom) - 1 || cx < 0 || cx > innerWidth) continue;
                hitN++;
                const hit = document.elementFromPoint(cx, cy);
                const lab = e.closest('label');
                const ok = hit && (hit === e || e.contains(hit) || t.contains(hit) || (hit.tagName === 'LABEL' && hit.contains(e)) || (lab && lab.contains(hit)) || [...(e.labels || [])].some((l) => l.contains(hit)));
                if (!ok) blocked.push(`${e.tagName.toLowerCase()} "${String((lab || e).textContent || e.value || '').replace(/\s+/g, ' ').trim().slice(0, 24)}" -> ${hit ? hit.tagName.toLowerCase() + (typeof hit.className === 'string' && hit.className ? '.' + hit.className.trim().split(/\s+/)[0] : '') : 'nothing'}`);
            }
        }
        const sR = stage ? stage.getBoundingClientRect() : null;
        const foot = pop.querySelector('.tv-sko-foot');
        const done = foot && [...foot.querySelectorAll('button')].pop();
        const sample = frame.closest('.tv-sko-sample');
        const part = sample && sample.querySelector('.tv-sko-part');
        return {
            unavailable: frame.classList.contains('is-unavailable'), cropped: frame.classList.contains('is-cropped'),
            f: box(frame), s: box(stage), cssH, frameH: frame.offsetHeight, pop: box(pop), foot: box(foot), done: box(done),
            vw: document.documentElement.clientWidth || window.innerWidth, vh: window.innerHeight,
            transform: stage ? stage.style.transform : '', minPx: Number.isFinite(minPx) ? minPx : null, minText, svgPx: Number.isFinite(svgPx) ? svgPx : null, svgText,
            hit: { n: hitN, blocked }, item, vis, clips, choices: { n: itemChoices.length, vis: choiceVis, unlabeled, q: qShown }, repeats,
            body: bodyEl ? { h: bodyEl.clientHeight, sh: bodyEl.scrollHeight } : null, sum: { clamped, moreOK },
            partBox: sR ? { x: Math.max(0, sR.left - fR.left), y: Math.max(0, sR.top - fR.top), w: Math.min(sR.right, fR.right) - Math.max(sR.left, fR.left), h: Math.min(sR.bottom, fR.bottom) - Math.max(sR.top, fR.top) } : null,
            part: part && !part.hidden ? String(part.querySelector('.tv-sko-part-n') ? part.querySelector('.tv-sko-part-n').textContent : part.textContent).replace(/\s+/g, ' ').trim() : '',
        };
    });
}

const scaleOf = (t) => (/scale\(([\d.]+)\)/.exec(t || '') || [0, '1'])[1];
// The verdict on one reading: (a) inside, (b) ink, (c) legible, (d) the controls in the window.
function judge(m, inkR) {
    const fails = [];
    const ink = inkR && typeof inkR === 'object' ? inkR.ink : inkR;
    const own = inkR && typeof inkR === 'object' ? inkR.own : null;
    if (m.noFrame) return ['[inside] no sample frame in the panel'];
    const { f, s } = m;
    if (s) {
        const inside = s.x >= f.x - 1 && s.y >= f.y - 1 && s.x + s.w <= f.x + f.w + 1 && s.y + s.h <= f.y + f.h + 1;
        if (!m.unavailable && !inside) fails.push(`[inside] stage (${Math.round(s.x - f.x)},${Math.round(s.y - f.y)}) ${Math.round(s.w)}×${Math.round(s.h)} is not inside the ${Math.round(f.w)}×${Math.round(f.h)} frame (${m.cropped ? 'is-cropped, ' : ''}transform ${m.transform})`);
    } else if (!m.unavailable) fails.push('[inside] no .tvp-stage in the frame');
    // A whole sample needs 0.5 % of its frame inked. A part (critic-panel-r2 soft spot: it needed only 0.03 %) needs 0.5 % of
    // its OWN drawn box inked, so a part that is one stray word in an empty frame fails.
    if (!m.unavailable && !m.part && ink <= INK_MIN) fails.push(`[ink] the frame's visible crop holds ${(ink * 100).toFixed(2)} % dark pixels (needs > ${(INK_MIN * 100).toFixed(2)} %)`);
    if (!m.unavailable && m.part && !(own > PART_INK_MIN)) fails.push(`[ink] part ${m.part}: its drawn box holds ${own == null ? 'nothing' : (own * 100).toFixed(2) + ' %'} dark pixels (needs > ${(PART_INK_MIN * 100).toFixed(2)} %)`);
    if (!m.unavailable && m.clips && m.clips.length) fails.push(`[clip] a box inside the stage clips its content: ${m.clips.slice(0, 3).join('; ')}`);
    if (!m.unavailable && m.svgPx != null && m.svgPx < SVG_TEXT_MIN - 0.05) fails.push(`[svgtext] SVG text drawn at ${m.svgPx.toFixed(1)} px ("${m.svgText}"; needs >= ${SVG_TEXT_MIN} px)`);
    if (m.sum && m.sum.clamped && !m.sum.moreOK) fails.push('[summary] the option summary is clamped and its full text has no expand control (title attribute only: not reachable by touch or keyboard)');
    if (!m.unavailable && m.repeats && m.repeats.length) fails.push(`[repeat] the sample says its question line twice: "${m.repeats[0]}"`);
    if (!m.unavailable && m.choices && m.choices.unlabeled.length) fails.push(`[choices] answer choice(s) ${m.choices.unlabeled.map((i) => String.fromCharCode(65 + i)).join(', ')} shown with no letter or label`);
    if (!m.unavailable && m.part && m.choices && m.choices.vis.length && m.choices.q) fails.push(`[choices] part ${m.part}: answer choices share a part with the question`);
    if (!m.unavailable && s && m.minPx != null && m.minPx < TEXT_MIN - 0.05) fails.push(`[text] text drawn at ${m.minPx.toFixed(1)} px ("${m.minText}"; needs >= ${TEXT_MIN} px; ${m.transform})`);
    const k = Number(scaleOf(m.transform));
    if (!m.unavailable && s && k < 0.2995) fails.push(`[scale] drawn at scale ${k} (needs >= 0.30: below it a sample's strokes are hairlines)`);
    if (!m.unavailable && m.frameH < m.cssH) fails.push(`[scale] the frame is ${m.frameH} px, shorter than its CSS height ${m.cssH} px (critic-panel-r1 F3: a grown frame never shrinks)`);
    if (m.hit && m.hit.blocked.length) fails.push(`[hit] ${m.hit.blocked.length} of ${m.hit.n} option controls do not take a pointer at their centre: ${m.hit.blocked.slice(0, 3).join('; ')}`);
    if (m.foot && m.foot.y + m.foot.h > m.vh + 0.5) fails.push(`[controls] the panel footer's bottom is at ${Math.round(m.foot.y + m.foot.h)}, below the ${m.vh} px window`);
    if (m.done && (m.done.x < -0.5 || m.done.y < -0.5 || m.done.x + m.done.w > m.vw + 0.5 || m.done.y + m.done.h > m.vh + 0.5)) fails.push(`[controls] the Done button (${Math.round(m.done.x)},${Math.round(m.done.y)} ${Math.round(m.done.w)}×${Math.round(m.done.h)}) is not inside the ${m.vw}×${m.vh} window`);
    else if (m.pop && (m.pop.y < -0.5 || m.pop.y + m.pop.h > m.vh + 0.5)) fails.push(`[controls] the panel (top ${Math.round(m.pop.y)}, bottom ${Math.round(m.pop.y + m.pop.h)}) leaves the ${m.vh} px window`);
    return fails;
}

async function frameInk(page, partBox = null) {
    const fh = await page.$('#skillOptionsPopover .tv-sko-frame');
    if (!fh) return { ink: { ink: 0, own: null }, b64: '' };
    const b64 = await fh.screenshot({ encoding: 'base64' });
    return { ink: await inkOf(page, b64, partBox), b64 };
}

const note = (m, inkR) => (m.noFrame ? '' : `ink ${(inkR.ink * 100).toFixed(2)} %${inkR.own != null ? ` (own box ${(inkR.own * 100).toFixed(1)} %)` : ''}, scale ${scaleOf(m.transform)}, text >= ${m.minPx != null ? m.minPx.toFixed(1) : '-'} px${m.svgPx != null ? ` (svg text ${m.svgPx.toFixed(1)} px)` : ''}, frame ${Math.round(m.f.h)} px${m.body ? `, options ${m.body.h}/${m.body.sh} px` : ''}${m.part ? `, part ${m.part}` : ''}${m.unavailable ? ' (sample unavailable)' : ''}`);

// Change the panel's first option (the first select or tick box of its body) the way a teacher does: a real pointer click
// at the control's centre (P1, critic-panel-r3: a DOM el.click() never hit-tests, so a row-wide "?" hit area went unseen).
// A select must take focus from that click before its value is chosen; a tick box must change. Returns '' (nothing to
// change), the control's kind, or a '[hit] ...' failure.
async function changeFirstOption(page) {
    const at = await page.evaluate(() => {
        const c = document.querySelector('#skillOptionsPopover .tv-sko-body select, #skillOptionsPopover .tv-sko-body input[type="checkbox"]');
        if (!c) return null;
        if (c.tagName === 'SELECT' && c.options.length < 2) return null;
        c.scrollIntoView({ block: 'nearest' });
        let t = c;
        const r0 = c.getBoundingClientRect();
        if (r0.width < 2 || r0.height < 2 || Number(getComputedStyle(c).opacity) === 0) t = c.closest('label') || (c.labels && c.labels[0]) || c;
        const r = t.getBoundingClientRect();
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2, kind: c.tagName === 'SELECT' ? 'select' : 'tick box', was: c.tagName === 'SELECT' ? c.selectedIndex : c.checked };
    });
    if (!at) return '';
    await page.mouse.click(at.x, at.y);
    const res = await page.evaluate((at) => {
        const c = document.querySelector('#skillOptionsPopover .tv-sko-body select, #skillOptionsPopover .tv-sko-body input[type="checkbox"]');
        if (!c) return 'gone';
        if (at.kind === 'tick box' && c.checked === at.was) {
            // (a tick the skill will not clear, e.g. its last ticked table, stays: that is no hit failure if the click reached it)
            const hit = document.elementFromPoint(at.x, at.y);
            const lab = c.closest('label');
            if (hit && (hit === c || (lab && lab.contains(hit)))) return 'same';
        }
        if (at.kind === 'tick box') return c.checked !== at.was ? 'ok' : `[hit] a mouse click on the first tick box "${String((c.closest('label') || c).textContent).replace(/\s+/g, ' ').trim().slice(0, 24)}" did not change it`;
        if (document.activeElement !== c) return `[hit] a mouse click on the first select did not focus it (focus: ${document.activeElement ? document.activeElement.tagName.toLowerCase() + '.' + String(document.activeElement.className).split(' ')[0] : 'none'})`;
        c.selectedIndex = (c.selectedIndex + 1) % c.options.length;
        c.dispatchEvent(new Event('change', { bubbles: true }));
        return 'ok';
    }, at);
    return res === 'ok' || res === 'gone' ? at.kind : res === 'same' ? '' : res;
}

// One check: open the panel at `vp`, read it after both tidies; then optionally resize it while open (`resizeTo`), or
// change its first option (`change`) and read it again at +50 ms and +1.5 s. Returns one result per reading.
async function checkSkill(app, ref, vp, mode = {}) {
    const { page } = app;
    const [categoryId, skillId] = ref.split(':');
    const errs0 = app.problems.filter((p) => p.type === 'pageerror').length;
    await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
    await page.evaluate(({ categoryId, skillId }) => {
        if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
        const s = (window.SKILLS[categoryId] || []).find((x) => x.v === skillId);
        window.UnifiedSkills.clear();
        window.UnifiedSkills.add({ domainId: 'x', categoryId, skillId, skillLabel: s ? s.l : skillId, categoryIcon: '', categoryName: categoryId, domainColor: '#8b5cf6' });
        window.UnifiedSkills._syncAllImmediate();
        window.tvGo('sets');
    }, { categoryId, skillId });
    const sel = `.tv-opt-btn[data-key="${categoryId}|${skillId}"]`;
    await page.waitForSelector(sel, { timeout: 10000 });
    await page.evaluate((sel) => { const b = document.querySelector(sel); b.scrollIntoView({ block: 'center' }); }, sel);
    await page.click(sel);
    await page.waitForSelector('#skillOptionsPopover', { timeout: 5000 });
    await sleep(1500);   // the repro's wait: both _tidySample passes (now and +950 ms) and fit()'s settle have run
    const out = [];
    const read = async (label, keep = true) => {
        const m = await measure(page);
        const { ink, b64 } = m.noFrame ? { ink: { ink: 0, own: null }, b64: '' } : await frameInk(page, m.partBox);
        const fails = judge(m, ink);
        const errs = app.problems.filter((p) => p.type === 'pageerror');
        if (errs.length > errs0) fails.push(`[pageerror] page error: ${errs.slice(errs0).map((e) => e.text.split('\n')[0]).join(' | ').slice(0, 200)}`);
        const judged = !CHANGED_ONLY || /changed/.test(label);
        const shown = fails.slice();
        fails.length = 0;
        if (judged) for (const f of shown) if (CHECKS.has((/^\[(\w+)\]/.exec(f) || [])[1])) fails.push(f);
        const tag = `${categoryId}-${skillId}-${label.replace(/[^\w]+/g, '_')}`;
        if (keep && SHOTS && b64) { fs.mkdirSync(SHOTS, { recursive: true }); fs.writeFileSync(path.join(SHOTS, tag + '.png'), Buffer.from(b64, 'base64')); }
        if (keep && FAIL_SHOTS && b64 && fails.length) { fs.mkdirSync(FAIL_SHOTS, { recursive: true }); fs.writeFileSync(path.join(FAIL_SHOTS, tag + '.png'), Buffer.from(b64, 'base64')); }
        const other = shown.filter((f) => !fails.includes(f));
        if (keep) out.push({ ref, width: label, fails, unavailable: !!m.unavailable, note: note(m, ink) + (other.length ? `; not judged here: ${other.join('; ')}` : '') });
        return m;
    };
    // Judged across the readings of one walk (the whole item, or every part of it): (cover) every atom of the unpaged item
    // was wholly visible on some part, and (choices) the answer choices sit on ONE part, never with the question.
    const walkVerdict = (label, ms) => {
        const fails = [];
        const ok = ms.filter((x) => x && !x.noFrame && !x.unavailable);
        if (!ok.length) return null;
        const seenIds = new Set(ok.flatMap((x) => x.vis || []));
        const missing = (ok[0].item || []).filter(([id]) => !seenIds.has(id));
        if (missing.length) fails.push(`[cover] ${missing.length} of ${ok[0].item.length} blocks of the item appear on no part${ok.length > 1 ? ` (${ok.length} parts)` : ''}: ${missing.slice(0, 6).map(([, t]) => `"${t}"`).join(', ')}`);
        const groups = ok.map((x) => (x.choices ? x.choices.vis : [])).filter((g) => g.length);
        const n = ok[0].choices ? ok[0].choices.n : 0;
        if (n && groups.length > 1) fails.push(`[choices] the ${n} answer choices are spread over ${groups.length} parts (${groups.map((g) => g.map((i) => String.fromCharCode(65 + i)).join('')).join(' | ')})`);
        const sig = n ? groups.map((g) => g.join('')).join('|') : '';
        return { fails, sig };
    };
    const walkPush = (label, ms) => {
        const v = walkVerdict(label, ms);
        if (!v) return;
        const fails = CHANGED_ONLY && !/changed/.test(label) ? [] : v.fails.filter((f) => CHECKS.has((/^\[(\w+)\]/.exec(f) || [])[1]));
        out.push({ ref, width: `${label} (all parts)`, fails, walk: true, sig: v.sig, note: `${ms.length} reading(s), choices ${v.sig || '-'}` });
    };
    // (a resize check's reading before the resize is the main sweep's own: not reported twice)
    const walk = [await read(vp.label, !mode.resizeTo)];
    if (SAVE_PANELS && vp.label === '1280' && !mode.resizeTo) {
        const el = await page.$('#skillOptionsPopover');
        if (el) await el.screenshot({ path: path.join(ROOT, 'design', 'audit', 'options-panels', `${categoryId}-${skillId}.png`) });
    }
    // A sample shown one part at a time: every part is read, each must be whole, legible and inked (critic-panel-r1 F1).
    if (!mode.resizeTo) {
        const nextPart = () => page.evaluate(() => { const b = document.querySelector('#skillOptionsPopover .tv-sko-part:not([hidden]) [data-sko-part="1"]'); if (!b || b.disabled) return false; b.click(); return true; });
        for (let i = 2; ; i++) {
            if (i > PART_CAP) {
                if (await page.evaluate(() => { const b = document.querySelector('#skillOptionsPopover .tv-sko-part:not([hidden]) [data-sko-part="1"]'); return !!b && !b.disabled; })) {
                    const f = [`[parts] more than ${PART_CAP} parts: not a sample a teacher can page through`];
                    out.push({ ref, width: `${vp.label} part ${i}`, fails: CHECKS.has('parts') ? f : [], note: f[0] });
                }
                break;
            }
            if (!await nextPart()) break;
            await sleep(100);
            walk.push(await read(`${vp.label} part ${i}`));
        }
        walkPush(vp.label, walk);
    }
    if (mode.resizeTo) {
        await page.setViewport({ width: vp.w, height: mode.resizeTo, deviceScaleFactor: 1 });
        await sleep(1500);
        const rz = await read(`${vp.w}x${vp.h}>${mode.resizeTo}`);
        if (rz && !rz.part) walkPush(`${vp.w}x${vp.h}>${mode.resizeTo}`, [rz]);
    }
    const changed = mode.change ? await changeFirstOption(page) : '';
    if (/^\[hit\]/.test(changed)) out.push({ ref, width: `${vp.label} option change`, fails: CHECKS.has('hit') ? [changed] : [], note: changed });
    else if (changed) {
        await sleep(50);
        await read(`${vp.label} changed +50ms`);
        await sleep(1450);
        const after = await read(`${vp.label} changed +1.5s`);
        // (an unpaged redraw is judged whole; a paged one shows part 1 only here, its parts are the main walk's business)
        if (after && !after.part) walkPush(`${vp.label} changed +1.5s`, [after]);
    }
    await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
    return out;
}

(async () => {
    const t0 = Date.now();
    const first = await open({ seed: 1, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 } });
    // Every skill whose Sets row offers an Options button (the same test teacher-sets.js uses).
    const all = await first.page.evaluate(async () => {
        const ui = await import('./js/modules/skill-options-ui.js');
        const out = [];
        for (const [cat, list] of Object.entries(window.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const s of list) if (s && s.v && !s.retired && ui.skillHasOfferedOptions(cat, s.v)) out.push(`${cat}:${s.v}`);
        }
        return out;
    });
    const live = await first.page.evaluate((refs) => refs.filter((r) => { const [c, v] = r.split(':'); return (window.SKILLS[c] || []).some((s) => s && s.v === v && !s.retired); }), ONLY);
    let missing = ONLY.filter((r) => !all.includes(r));
    const skipped = SKIP_NO_PANEL ? missing.filter((r) => live.includes(r)) : [];
    for (const r of skipped) console.log(`skip ${r}: no options panel (not checked)`);
    missing = missing.filter((r) => !skipped.includes(r));
    if (missing.length) { console.log(`FAIL no options panel (${SKIP_NO_PANEL ? 'not a live skill' : 'unknown skill or no options'}): ${missing.join(', ')}`); await first.close(); console.log(`ws-options-shots: FAIL (${missing.length})`); process.exit(1); }
    const refs = ONLY.length ? ONLY.filter((r) => !skipped.includes(r)) : SHARD ? all.filter((_, k) => k % SHARD.n === SHARD.i - 1) : all;
    // The spot passes: every --skill run; a full run's share of SPOT (a SPOT skill that lost its panel is noted, not run).
    const spotGone = ONLY.length || NO_SPOT ? [] : SPOT.filter((r) => !all.includes(r));
    for (const r of spotGone) console.log(`  note: spot skill ${r} has no options panel now (not checked)`);
    const spotAll = SPOT.filter((r) => all.includes(r));
    const spot = NO_SPOT ? [] : ONLY.length ? refs : SHARD ? spotAll.filter((_, k) => k % SHARD.n === SHARD.i - 1) : spotAll;
    const skipNote = skipped.length ? `; ${skipped.length} skipped, no options panel` : '';
    const shardNote = SHARD ? `; shard ${SHARD.i}/${SHARD.n} of ${all.length}` : '';
    const jobs = [];
    for (const w of WIDTHS) for (const r of refs) jobs.push({ ref: r, vp: { w, h: HEIGHT[w] || 900, label: String(w) }, mode: { change: CHANGE_ALL || spot.includes(r) } });
    if (spot.length) {
        for (const r of spot) jobs.push({ ref: r, vp: { w: 1280, h: 720, label: '1280x720' } });
        for (const r of spot) jobs.push({ ref: r, vp: { w: 1280, h: 1000, label: '1280' }, mode: { resizeTo: 720 } });
    }
    const nWorkers = Math.min(WORKERS, Math.max(1, Math.ceil(jobs.length / 20)));
    const apps = [first];
    if (INJECT) await first.page.evaluate(INJECT);
    for (let i = 1; i < nWorkers; i++) {
        const a = await open({ seed: 1, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 } });
        if (INJECT) await a.page.evaluate(INJECT);
        apps.push(a);
    }
    const results = [];
    let next = 0;
    await Promise.all(apps.map(async (app) => {
        let cur = '';
        while (next < jobs.length) {
            const job = jobs[next++];
            const key = `${job.vp.w}x${job.vp.h}`;
            if (key !== cur || (job.mode && job.mode.resizeTo)) { await app.page.setViewport({ width: job.vp.w, height: job.vp.h, deviceScaleFactor: 1 }); cur = job.mode && job.mode.resizeTo ? '' : key; await sleep(200); }
            let res;
            try { res = await checkSkill(app, job.ref, job.vp, job.mode); } catch (e) { res = [{ ref: job.ref, width: job.vp.label, fails: [`could not open the panel: ${e.message.split('\n')[0]}`] }]; }
            for (const r of res) {
                results.push(r);
                if (r.fails.length) console.log(`FAIL ${r.ref} @${r.width}: ${r.fails.join('; ')}`);
                else if (ONLY.length || VERBOSE) console.log(`ok   ${r.ref} @${r.width}: ${r.note}`);
            }
        }
    }));
    // (choices) one split at every width: the answer-choice grouping of each main walk (1280, 1366, 1024, 820, 1280x720) is the same
    if (CHECKS.has('choices')) {
        const byRef = new Map();
        for (const r of results) if (r.walk && /^(\d+|1280x720) \(all parts\)$/.test(r.width) && r.sig) { if (!byRef.has(r.ref)) byRef.set(r.ref, []); byRef.get(r.ref).push(`${r.width.split(' ')[0]}: ${r.sig}`); }
        for (const [ref, sigs] of byRef) {
            if (new Set(sigs.map((x) => x.split(': ')[1])).size < 2) continue;
            const r = { ref, width: 'widths', fails: [`[choices] the answer choices are split differently by width (${sigs.join('; ')})`] };
            results.push(r);
            console.log(`FAIL ${r.ref} @${r.width}: ${r.fails.join('; ')}`);
        }
    }
    const pageErrors = apps.flatMap((a) => a.problems.filter((p) => p.type === 'pageerror'));
    for (const a of apps) await a.close();
    const unavailable = [...new Set(results.filter((r) => r.unavailable).map((r) => r.ref))];
    if (unavailable.length) console.log(`  sample unavailable (reported, not failed): ${unavailable.join(', ')}`);
    if (pageErrors.length) console.log(`  page errors (each FAILs the check it was thrown in): ${pageErrors.slice(0, 5).map((e) => e.text.split('\n')[0]).join(' | ')}`);
    const bad = results.filter((r) => r.fails.length);
    const nBad = bad.length + (CHECKS.has('pageerror') && pageErrors.length && !bad.some((r) => r.fails.some((f) => /^\[pageerror\]/.test(f))) ? 1 : 0);
    const secs = Math.round((Date.now() - t0) / 1000);
    const spotNote = spot.length ? `; spot passes on ${spot.length} skill(s): 1280x720, a resize to 720, an option change at ${WIDTHS.join(' and ')}` : '';
    console.log(`  ${refs.length} skills × ${WIDTHS.length} widths (${WIDTHS.join(', ')} px)${spotNote}, ${results.length} readings, ${apps.length} worker(s), ${secs} s${shardNote}`);
    if (nBad) { console.log(`ws-options-shots: FAIL (${nBad})`); process.exit(1); }
    console.log(`ws-options-shots: OK (${refs.length} skills × ${WIDTHS.length} widths${skipNote}${shardNote})`);
})().catch((e) => { console.error(e); console.log('ws-options-shots: FAIL (1)'); process.exit(1); });
