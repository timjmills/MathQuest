// The long-division bracket hugs its dividend on screen, as it does on paper (owner 2026-10-09;
// critic div-facts-forms R4 nit c: "7)  28", "2)  8" drew a gap under the vinculum on the online
// worksheet because the quotient box's 64 px floor, and the >= 44 px work tracks, widened the
// dividend's column beyond its digits).
//
// For every screen host - the practice card at 820 and 1280, the online worksheet at 1280 and 820 (owner 2026-11-13: no phone width),
// the quiz at 1280 - and every bracket drawing:
//   fact bracket (.mq-ldiv: div_facts Long / Mix, every one-line division fact drawn as a bracket)
//   worked bracket (.ws-ops-division: long_div_2digit, long_division ... the kit twin with work rows)
// it measures, in units of the digit size (em), from the glyph boxes of the digits:
//   gap    the arc's outer edge to the dividend's first digit
//   over   the dividend's last digit to the vinculum's right end
//   space  the widest space between two dividend digits
// and holds each to the PAPER drawing of the same skill (the kit's Independent page at L, measured
// the same way in a printed sheetDocument): no more than paper + TOL. Every quotient input is a
// touch target (>= 44 x 44 px) sitting above the bar, clear of the divisor and inside the cell;
// the one-line brackets also stay within the CEIL the hug fix reaches, and the remainder bracket's bar
// runs unbroken from the arc. A skill x host that measures no bracket FAILS (it would pass unseen).
// 1-, 2- and 3-digit dividends must all be seen in a bracket.
//
//   node tests/scripts/ws-ldiv-hug.cjs                 # prints one line per bracket, then OK / FAIL
//   node tests/scripts/ws-ldiv-hug.cjs --shots <dir>   # also screenshots each host
//
// LDIV-JOIN (owner 2026-11-14, lf-ops: "the long-division sign is not good because it's disconnected"):
//   node tests/scripts/ws-ldiv-hug.cjs --join [--skills division:long_div_2digit,division:div_facts,...] [--shots <dir>]
// The bracket is ONE connected stroke: the arc's top end runs into the vinculum with no gap and no step. For every bracket
// drawn on paper (the kit's pupil page AND key, at M and L, on every role in JOIN_ROLES, plus div_facts' compact fact-rows
// page) and on screen (practice card, online worksheet, quiz at 1366 and 820), measured in the rendered page:
//   gap   the white (mm) at the bracket's outer corner: from the point K where the arc's outer edge, continued along its
//         top-end tangent, meets the vinculum's top edge, to the nearest ink of the arc stroke (its butt cap, or its join
//         when the arc and the bar are one path) or the vinculum. A butt-capped arc set under a separate bar leaves a
//         wedge of white there (master 3623be10c); a joined path closes it (miter: K is the corner itself). <= 0.3 mm.
//         A break in the vinculum (white between its pieces, from the arc rightwards) counts as gap too.
//   step  the arc's top end against the vinculum's centre line, and the vinculum's pieces against each other (mm). <= 0.1 mm.
// A skill x host that draws no bracket FAILS (it would pass unseen). word-work.js's own divide frame (M2 1 Q...) is
// lf-algebra's and is not measured here.
const fs = require('fs');
const path = require('path');
const { open, hideOverlays } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SHOTS = arg('shots', null);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const TOL = { gap: 0.1, over: 0.1, space: 0.05 }, BOX_MIN = 44;
// The one-line brackets (fact, remainder) are held to what the hug fix reaches as well (critic
// ldiv-hug R1 G-1: paper + TOL alone would let a partial regression back to 0.6 em pass).
const CEIL = { fact: { gap: 0.43, over: 0.22 }, remainder: { gap: 0.43, over: 0.22 } };

const SKILLS = [
    { categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'long' }, tag: 'div_facts-long' },
    { categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'mix' }, tag: 'div_facts-mix' },
    { categoryId: 'division', skillId: 'long_div_2digit', opts: null, tag: 'long_div_2digit' },
    // a times-table fact prints across on paper, so its bracket is held to the div_facts Long bracket
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'] }, tag: 'divide-facts', paperAs: { categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'long' } } },
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'], tiles: 21 }, tag: 'divide-21' },
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'], tiles: 31 }, tag: 'divide-31' },
    { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'], tiles: 31, regroup: 'always' }, tag: 'divide-31-R' },
    { categoryId: 'division', skillId: 'div_remainders', opts: { notation: ['bracket'] }, tag: 'div_remainders-bracket',
        paperAs: { categoryId: 'division', skillId: 'divide', opts: { notation: ['bracket'], tiles: 21, regroup: 'always' } } },
];

// In the page: measure every bracket under `rootSel`.
function MEASURE(rootSel, frameSel) {
    const doc = frameSel ? document.querySelector(frameSel).contentDocument : document;
    const root = doc.querySelector(rootSel);
    if (!root) return { error: 'no root ' + rootSel };
    const getComputedStyle = doc.defaultView.getComputedStyle.bind(doc.defaultView);
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const textRect = (el) => {
        const rg = doc.createRange();
        rg.selectNodeContents(el);
        const rs = Array.from(rg.getClientRects()).filter((r) => r.width > 0);
        if (!rs.length) return null;
        return { left: Math.min(...rs.map((r) => r.left)), right: Math.max(...rs.map((r) => r.right)) };
    };
    const out = [];
    // Where the answer boxes sit: above the bar, clear of the divisor's digits, inside the cell.
    const placeOf = (boxes, barTop, dsrEl, g) => {
        const bad = [];
        const ds = dsrEl ? textRect(dsrEl) : null;
        const cell = g.closest('.mq-scell') || g.parentElement;
        const c = cell.getBoundingClientRect();
        boxes.forEach((r) => {
            if (r.bottom > barTop + 1) bad.push('box below the bar');
            if (ds && r.left < ds.right - 1 && r.bottom > barTop - 2) bad.push('box over the divisor');
            if (r.left < c.left - 1 || r.right > c.right + 1) bad.push('box outside the cell');
        });
        return bad.join(', ');
    };
    root.querySelectorAll('.mq-ldiv').forEach((g) => {
        if (!vis(g)) return;
        const em = parseFloat(getComputedStyle(g).fontSize);
        const arc = g.querySelector('.mq-ldiv-arc, .mq-ldiv-arcj'), dvd = g.querySelector('.mq-ldiv-dvd');
        const t = textRect(dvd);
        if (!arc || !t) return;
        const a = arc.getBoundingClientRect(), d = dvd.getBoundingClientRect();
        const boxes = Array.from(g.querySelectorAll('.mq-ldiv-q input')).filter(vis).map((i) => i.getBoundingClientRect());
        // the arc path is M1 1 Q11 24 1 47 in a 12-wide box: its outer edge is at x = 6 / 12
        out.push({ kind: 'fact', text: (dvd.textContent || '').trim(), em,
            gap: (t.left - (a.left + a.width * 0.5)) / em, over: (d.right - t.right) / em, space: 0,
            box: boxes.length ? Math.min(...boxes.map((r) => Math.min(r.width, r.height))) : 0,
            boxOffset: boxes.length ? ((boxes[0].left + boxes[0].right) / 2 - (t.left + t.right) / 2) / em : 0,
            place: placeOf(boxes, d.top, g.querySelector('.mq-ldiv-dsr'), g), join: '' });
    });
    // The remainder bracket of the ring twin (div_remainders / divide with remainders, bracket
    // notation): divisor | arc | dividend under the vinculum, "[ ] R [ ]" above.
    root.querySelectorAll('.mq-remeq').forEach((g) => {
        if (!vis(g)) return;
        const kids = Array.from(g.children);
        const arcSpan = kids.find((el) => el.querySelector('svg'));
        if (!arcSpan) return;                                   // the across form, no bracket
        const em = parseFloat(getComputedStyle(g).fontSize);
        const col = (el) => { const m = (el.getAttribute('style') || '').match(/grid-column:\s*(\d+)/); return m ? Number(m[1]) : 0; };
        const row = (el) => { const m = (el.getAttribute('style') || '').match(/grid-row:\s*(\d+)/); return m ? Number(m[1]) : 0; };
        const dvd = kids.find((el) => col(el) === 3 && row(el) === 2);
        const dsr = kids.find((el) => col(el) === 1 && row(el) === 2);
        const t = dvd ? textRect(dvd) : null;
        if (!t) return;
        const a = arcSpan.getBoundingClientRect(), d = dvd.getBoundingClientRect();
        const boxes = Array.from(g.querySelectorAll('input')).filter(vis).map((i) => i.getBoundingClientRect());
        const bw = parseFloat(getComputedStyle(dvd).borderTopWidth) || 0;
        // the arc's top stroke (centred on the svg's top edge) must run into the dividend's bar
        const join = [];
        if (d.left - a.right > 1) join.push(`bar broken ${(d.left - a.right).toFixed(1)} px at the arc`);
        if (Math.abs(a.top - (d.top + bw / 2)) > 1) join.push(`bar steps ${(a.top - (d.top + bw / 2)).toFixed(1)} px at the arc`);
        out.push({ kind: 'remainder', text: (dvd.textContent || '').trim(), em,
            gap: (t.left - (a.left + a.width * 0.525)) / em, over: (d.right - t.right) / em, space: 0,
            box: boxes.length ? Math.min(...boxes.map((r) => Math.min(r.width, r.height))) : 0, boxOffset: 0,
            place: placeOf(boxes, d.top, dsr, g), join: join.join(', ') });
    });
    root.querySelectorAll('.ws-ops-division [role="group"]').forEach((g) => {
        if (!vis(g)) return;
        const em = parseFloat(getComputedStyle(g).fontSize);
        const pos = (el) => {
            const st = el.getAttribute('style') || '';
            const c = st.match(/grid-column:\s*(\d+)/), r = st.match(/grid-row:\s*(\d+)/);
            return c && r ? { col: Number(c[1]), row: Number(r[1]) } : null;
        };
        const kids = Array.from(g.children).map((el) => ({ el, p: pos(el) })).filter((x) => x.p && x.p.row === 2);
        const arcSpan = kids.find((x) => x.el.querySelector('svg'));
        const digits = kids.filter((x) => /border-top/.test(x.el.getAttribute('style') || '') && /\d/.test(x.el.textContent || '') && x.el.getBoundingClientRect().height > 0).sort((p, q) => p.p.col - q.p.col);
        const bar = Array.from(g.children).find((el) => /height:\s*0/.test(el.getAttribute('style') || '') && /border-top/.test(el.getAttribute('style') || ''));
        if (!arcSpan || !digits.length || !bar) return;
        const a = arcSpan.el.getBoundingClientRect();
        const ts = digits.map((x) => textRect(x.el)).filter(Boolean);
        const spaces = ts.slice(1).map((r, i) => (r.left - ts[i].right) / em);
        const boxes = Array.from(g.querySelectorAll('input')).filter((i) => vis(i) && !i.classList.contains('mq-opswork')).map((i) => i.getBoundingClientRect());
        // the kit's arc path is M1.5 0 Q9 20 1.5 40 in a 10-wide box: outer edge at x = 5.25 / 10
        out.push({ kind: 'worked', text: digits.map((x) => x.el.textContent.trim()).join(''), em,
            gap: (ts[0].left - (a.left + a.width * 0.525)) / em, over: (bar.getBoundingClientRect().right - ts[ts.length - 1].right) / em,
            space: spaces.length ? Math.max(...spaces) : 0,
            box: boxes.length ? Math.min(...boxes.map((r) => Math.min(r.width, r.height))) : 0, boxOffset: 0,
            place: placeOf(boxes, bar.getBoundingClientRect().top, null, g), join: '' });
    });
    return { brackets: out };
}

// LDIV-JOIN, in the page: every bracket arc under `rootSel` against its vinculum (mm).
function JOIN(rootSel, frameSel) {
    const doc = frameSel ? document.querySelector(frameSel).contentDocument : document;
    const root = doc.querySelector(rootSel);
    if (!root) return { error: 'no root ' + rootSel };
    const win = doc.defaultView, MM = 25.4 / 96;
    const parse = (d) => {
        const t = String(d).match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
        const segs = []; let i = 0, cur = null, sub = -1, cmd = null;
        while (i < t.length) {
            if (/[A-Za-z]/.test(t[i])) cmd = t[i++];
            if (cmd === 'M') { cur = { x: +t[i], y: +t[i + 1] }; i += 2; sub++; cmd = 'L'; }
            else if (cmd === 'H') { const p = { x: +t[i], y: cur.y }; i++; segs.push({ k: 'L', a: cur, b: p, sub }); cur = p; }
            else if (cmd === 'V') { const p = { x: cur.x, y: +t[i] }; i++; segs.push({ k: 'L', a: cur, b: p, sub }); cur = p; }
            else if (cmd === 'L') { const p = { x: +t[i], y: +t[i + 1] }; i += 2; segs.push({ k: 'L', a: cur, b: p, sub }); cur = p; }
            else if (cmd === 'Q') { const c = { x: +t[i], y: +t[i + 1] }, p = { x: +t[i + 2], y: +t[i + 3] }; i += 4; segs.push({ k: 'Q', a: cur, c, b: p, sub }); cur = p; }
            else return null;
        }
        return segs;
    };
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const sub = (p, q) => ({ x: p.x - q.x, y: p.y - q.y });
    const len = (v) => Math.hypot(v.x, v.y);
    const unit = (v) => { const l = len(v) || 1; return { x: v.x / l, y: v.y / l }; };
    const segDist = (p, a, b) => { const ab = sub(b, a), t = Math.max(0, Math.min(1, ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / ((ab.x * ab.x + ab.y * ab.y) || 1))); return len(sub(p, { x: a.x + t * ab.x, y: a.y + t * ab.y })); };
    const rectDist = (p, r) => Math.hypot(Math.max(r.l - p.x, 0, p.x - r.r), Math.max(r.t - p.y, 0, p.y - r.b));
    const alpha = (c) => { const m = String(c).match(/rgba?\(([^)]*)\)/); if (!m) return 1; const v = m[1].split(',').map(Number); return v.length > 3 ? v[3] : 1; };
    const out = [];
    root.querySelectorAll('svg path').forEach((path) => {
        const d = path.getAttribute('d') || '';
        if (!/Q/.test(d) || /^\s*M\s*2[ ,]1\s*Q/.test(d)) return;            // not an arc, or word-work's own frame (lf-algebra)
        const svg = path.ownerSVGElement;
        if (!svg || !vis(svg)) return;
        const segs = parse(d);
        if (!segs) return;
        const qi = segs.findIndex((s) => s.k === 'Q');
        const q = segs[qi];
        if (Math.abs(q.a.x - q.b.x) > 0.5 || Math.abs(q.a.y - q.b.y) < 10) return;   // a bracket arc: both ends on one vertical
        const m = path.getScreenCTM();
        const P = (p) => { const r = new DOMPoint(p.x, p.y).matrixTransform(m); return { x: r.x, y: r.y }; };
        const cs = win.getComputedStyle(path);
        const hw = (parseFloat(cs.strokeWidth) || 1) / 2;
        const topIsA = q.a.y < q.b.y;
        const T = P(topIsA ? q.a : q.b), C = P(q.c);
        const u = unit(sub(C, T));                                            // into the curve, downward
        // the arc's top end is a cap unless a segment of the same subpath continues from it (a join)
        const nb = topIsA ? segs[qi - 1] : segs[qi + 1];
        const joined = !!(nb && nb.sub === q.sub && nb.k === 'L');
        // the vinculum: the path's own horizontal lines, and the drawn top borders in the bracket's group
        const bars = [];
        segs.filter((s) => s.k === 'L' && Math.abs(s.a.y - s.b.y) < 1e-6).forEach((s) => {
            const a = P(s.a), b = P(s.b);
            bars.push({ l: Math.min(a.x, b.x), r: Math.max(a.x, b.x), t: a.y - hw, b: a.y + hw, src: 'path' });
        });
        let group = svg.parentElement;
        for (let k = 0; k < 4 && group && group.parentElement; k++) {
            const disp = win.getComputedStyle(group).display;
            if (/grid/.test(disp)) break;
            group = group.parentElement;
        }
        [group, ...group.querySelectorAll('*')].forEach((el) => {
            if (el === svg || svg.contains(el)) return;
            const st = win.getComputedStyle(el);
            const bw = parseFloat(st.borderTopWidth) || 0;
            if (bw <= 0 || st.borderTopStyle === 'none' || alpha(st.borderTopColor) === 0) return;
            const r = el.getBoundingClientRect();
            if (r.width <= 0) return;
            bars.push({ l: r.left, r: r.right, t: r.top, b: r.top + bw, src: 'border' });
        });
        const near = bars.filter((b) => b.r > T.x - 4 * hw && Math.abs((b.t + b.b) / 2 - T.y) < 8 * hw);
        if (!near.length) { out.push({ error: 'no vinculum at the arc', d }); return; }
        const first = near.slice().sort((p, q2) => p.l - q2.l)[0];
        const yTop = Math.min(...near.map((b) => b.t));
        const cents = near.map((b) => (b.t + b.b) / 2);
        const step = Math.max(Math.abs(T.y - (first.t + first.b) / 2), Math.max(...cents) - Math.min(...cents));
        // a break along the vinculum: white between its pieces, from the arc's corner rightwards
        let reach = first.l, brk = 0;
        near.slice().sort((p, q2) => p.l - q2.l).forEach((b) => { brk = Math.max(brk, b.l - reach); reach = Math.max(reach, b.r); });
        // K: the arc's outer (left) edge, continued up along its top tangent, meets the vinculum's top edge
        const nOut = { x: -u.y, y: u.x };
        const E0 = { x: T.x + hw * nOut.x, y: T.y + hw * nOut.y };
        const s = (yTop - E0.y) / (u.y || 1e-9);
        const K = { x: E0.x + s * u.x, y: E0.y + s * u.y };
        let gap = Math.min(...near.map((b) => rectDist(K, b)));
        const A0 = P(q.a), A1 = P(q.c), A2 = P(q.b);
        for (let i = 0; i <= 400; i++) {
            const t = i / 400, w0 = (1 - t) * (1 - t), w1 = 2 * t * (1 - t), w2 = t * t;
            const c = { x: w0 * A0.x + w1 * A1.x + w2 * A2.x, y: w0 * A0.y + w1 * A1.y + w2 * A2.y };
            const dv = unit({ x: 2 * (1 - t) * (A1.x - A0.x) + 2 * t * (A2.x - A1.x), y: 2 * (1 - t) * (A1.y - A0.y) + 2 * t * (A2.y - A1.y) });
            const n = { x: -dv.y * hw, y: dv.x * hw };
            gap = Math.min(gap, segDist(K, { x: c.x - n.x, y: c.y - n.y }, { x: c.x + n.x, y: c.y + n.y }));
        }
        if (joined) {
            const lj = cs.strokeLinejoin || 'miter';
            const nbDir = unit(sub(P(topIsA ? nb.a : nb.b), T));              // from the join along the bar
            const phi = Math.acos(Math.max(-1, Math.min(1, u.x * nbDir.x + u.y * nbDir.y)));   // interior angle at the join
            if (lj === 'round') gap = Math.min(gap, Math.max(0, len(sub(K, T)) - hw));
            else if (/miter/.test(lj) && 1 / Math.sin(phi / 2) <= (parseFloat(cs.strokeMiterlimit) || 4)) gap = 0;
        }
        out.push({ gap: Math.max(gap, brk) * MM, step: step * MM, joined, sw: hw * 2 * MM, d: d.slice(0, 40) });
    });
    return { arcs: out };
}

async function viewport(page, w, h) { await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await sleep(150); }

async function card(page, s, w, seed, fn = MEASURE) {
    await viewport(page, w, 900);
    await hideOverlays(page);
    const r = await page.evaluate(({ s, seed }) => {
        const st = window.state;
        st.category = s.categoryId; st.skill = s.skillId; st.gameMode = 'practice'; st.isMixedMode = false;
        window.showView('gameView');
        const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, opts: s.opts || undefined, seed, itemIndex: 0 });
        if (!q) return { error: 'no item' };
        st.currentQ = q;
        window.renderQuestion();
        window.scrollTo(0, 0);
        return {};
    }, { s, seed });
    if (r.error) return r;
    await sleep(250);
    return page.evaluate(fn, '#questionCard');
}

async function worksheet(page, s, w, fn = MEASURE) {
    await viewport(page, w, 900);
    await hideOverlays(page);
    const r = await page.evaluate((s) => {
        const st = window.state;
        st.category = s.categoryId; st.skill = s.skillId; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
        st.skillOptions = s.opts ? { ...s.opts } : {};
        if (window.__wsReseed) window.__wsReseed(7);
        window.initWorksheet();
        window.scrollTo(0, 0);
        return {};
    }, s);
    if (r.error) return r;
    await sleep(400);
    return page.evaluate(fn, '#worksheetGrid');
}

async function quiz(page, s, fn = MEASURE, w = 1280) {
    await viewport(page, w, 900);
    await hideOverlays(page);
    const r = await page.evaluate((s) => {
        const questions = [];
        for (let i = 0; i < 6; i++) {
            const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, opts: s.opts || undefined, seed: 300 + i, itemIndex: i });
            if (!q) continue;
            const qd = window.quizQuestionData ? window.quizQuestionData(q) : { text: q.text, ans: q.ans, answerType: q.answerType, visual: q.visual };
            questions.push({ id: i, skillId: s.skillId, points: 1, questionData: qd });
        }
        const test = { id: null, name: 'Bracket quiz', createdAt: null, updatedAt: null,
            sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
            settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
        window.handleQuizURL(window.compressTestForURL(test));
        const name = document.getElementById('qtStudentName');
        if (!name) return { error: 'quiz landing did not render' };
        name.value = 'Audit'; name.dispatchEvent(new Event('input'));
        window.startQuizTest();
        window.scrollTo(0, 0);
        return {};
    }, s);
    if (r.error) return r;
    await sleep(400);
    return page.evaluate(fn, '#quizTakeView');
}

// The paper reference: the kit's Independent page at L, printed (sheetDocument) in an iframe.
async function paper(page, s) {
    const ok = await page.evaluate(async (s) => {
        const res = await window.buildSheet({ role: 'independent', size: 'L', seed: 4242, key: false,
            sections: [{ skills: [{ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts || {} }], count: 6 }] });
        let f = document.getElementById('mqHugPaper');
        if (!f) {
            f = document.createElement('iframe');
            f.id = 'mqHugPaper';
            f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:1300px;border:0;z-index:-1;visibility:hidden';
            document.body.appendChild(f);
        }
        await new Promise((r) => { f.onload = r; f.srcdoc = window.sheetDocument(res.pupilHtml, 'paper'); });
        await f.contentDocument.fonts.ready;
        return true;
    }, s);
    if (!ok) return { error: 'paper did not build' };
    await sleep(200);
    return page.evaluate(MEASURE, 'body', '#mqHugPaper');
}

async function shot(page, sel, file) {
    if (!SHOTS) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    const el = await page.$(sel);
    await (el || page).screenshot({ path: path.join(SHOTS, file) });
}

// ---- LDIV-JOIN (--join) ----
const JOIN_TOL = { gap: 0.3, step: 0.1 };
const JOIN_ROLES = ['independent', 'guided', 'review', 'test'];
const JOIN_SKILLS = {
    'division:long_div_2digit': [{ opts: null, tag: 'long_div_2digit' }],
    'division:div_facts': [{ opts: { divForm: 'long' }, tag: 'div_facts-long', roles: ['fact-rows'] }],
    'division:div_facts_long': [{ opts: null, tag: 'div_facts_long', roles: ['fact-rows'] }],
    'division:divide': [{ opts: { notation: ['bracket'], tiles: 31 }, tag: 'divide-31' }],
    'division:div_remainders': [{ opts: { notation: ['bracket'] }, tag: 'div_remainders-bracket' }],
};
async function paperJoin(page, s, size, role, key) {
    const ok = await page.evaluate(async ({ s, size, role, key }) => {
        let res;
        try {
            res = await window.buildSheet({ role, size, seed: 4242, key,
                sections: [{ skills: [{ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts || {} }], count: 6 }] });
        } catch (e) { return 'build threw: ' + e.message; }
        const html = key ? res.keyHtml : res.pupilHtml;
        if (!html) return 'no ' + (key ? 'key' : 'pupil page');
        let f = document.getElementById('mqJoinPaper');
        if (!f) {
            f = document.createElement('iframe');
            f.id = 'mqJoinPaper';
            f.style.cssText = 'position:fixed;left:0;top:0;width:900px;height:1300px;border:0;z-index:-1;visibility:hidden';
            document.body.appendChild(f);
        }
        await new Promise((r) => { f.onload = r; f.srcdoc = window.sheetDocument(html, 'paper'); });
        await f.contentDocument.fonts.ready;
        return 'ok';
    }, { s, size, role, key });
    if (ok !== 'ok') return { error: ok };
    await sleep(150);
    return page.evaluate(JOIN, 'body', '#mqJoinPaper');
}
async function shotJoin(page, frameSel, file) {
    if (!SHOTS) return;
    fs.mkdirSync(SHOTS, { recursive: true });
    const box = await page.evaluate((frameSel) => {
        const doc = frameSel ? document.querySelector(frameSel).contentDocument : document;
        const fr = frameSel ? document.querySelector(frameSel) : null;
        if (fr) fr.style.visibility = 'visible', fr.style.zIndex = '99999';
        const p = Array.from(doc.querySelectorAll('svg path')).find((x) => /Q/.test(x.getAttribute('d') || '') && x.ownerSVGElement.getBoundingClientRect().width > 0);
        if (!p) return null;
        const r = p.ownerSVGElement.getBoundingClientRect();
        return { x: Math.max(0, r.left - 20), y: Math.max(0, r.top - 20), width: r.width + 90, height: r.height + 40 };
    }, frameSel);
    if (box) await page.screenshot({ path: path.join(SHOTS, file), clip: box });
    if (frameSel) await page.evaluate((frameSel) => { const fr = document.querySelector(frameSel); fr.style.visibility = 'hidden'; fr.style.zIndex = '-1'; }, frameSel);
}
async function joinMain() {
    const want = String(arg('skills', Object.keys(JOIN_SKILLS).join(','))).split(',').map((x) => x.trim()).filter(Boolean);
    const app = await open({ seed: 1, viewport: { width: 1366, height: 900, deviceScaleFactor: SHOTS ? 4 : 1 } });
    const { page } = app;
    let fails = 0, n = 0, worstGap = 0, worstStep = 0;
    const judge = (where, res, needOne) => {
        if (!res || res.error) { fails++; console.log(`FAIL ${where}: ${res ? res.error : 'no result'}`); return; }
        if (!res.arcs.length) { if (needOne) { fails++; console.log(`FAIL ${where}: no bracket measured`); } return; }
        for (const a of res.arcs) {
            n++;
            if (a.error) { fails++; console.log(`FAIL ${where}: ${a.error} (${a.d})`); continue; }
            worstGap = Math.max(worstGap, a.gap); worstStep = Math.max(worstStep, a.step);
        }
        const g = Math.max(...res.arcs.map((a) => a.gap || 0)), st = Math.max(...res.arcs.map((a) => a.step || 0));
        const bad = [];
        if (g > JOIN_TOL.gap) bad.push(`gap ${g.toFixed(2)} mm > ${JOIN_TOL.gap}`);
        if (st > JOIN_TOL.step) bad.push(`step ${st.toFixed(2)} mm > ${JOIN_TOL.step}`);
        if (bad.length) fails++;
        console.log(`${bad.length ? 'FAIL' : 'PASS'} LDIV-JOIN ${where}: ${res.arcs.length} arc(s) gap ${g.toFixed(2)} mm step ${st.toFixed(2)} mm${bad.length ? '  <- ' + bad.join(', ') : ''}`);
    };
    try {
        for (const key of want) {
            const cases = JOIN_SKILLS[key];
            if (!cases) { fails++; console.log(`FAIL ${key}: not a bracket skill of LDIV-JOIN`); continue; }
            const [categoryId, skillId] = key.split(':');
            for (const c of cases) {
                const s = { categoryId, skillId, opts: c.opts, tag: c.tag };
                for (const size of ['M', 'L']) {
                    for (const role of [...JOIN_ROLES, ...(c.roles || [])]) {
                        for (const k of [false, true]) {
                            const res = await paperJoin(page, s, size, role, k);
                            judge(`paper ${c.tag} ${role} ${size} ${k ? 'key' : 'pupil'}`, res, role === 'independent' || (c.roles || []).includes(role));
                            if (role === 'independent' && !k) await shotJoin(page, '#mqJoinPaper', `${c.tag}-paper-${size}.png`);
                        }
                    }
                }
                for (const w of [1366, 820]) {
                    judge(`card-${w} ${c.tag}`, await card(page, s, w, 11, JOIN), true);
                    await shotJoin(page, null, `${c.tag}-card-${w}.png`);
                    judge(`worksheet-${w} ${c.tag}`, await worksheet(page, s, w, JOIN), true);
                    judge(`quiz-${w} ${c.tag}`, await quiz(page, s, JOIN, w), true);
                }
            }
        }
        const errs = app.problems.filter((p) => p.type !== 'requestfailed');
        if (errs.length) { fails++; errs.slice(0, 5).forEach((e) => console.log(`FAIL console: ${e.text}`)); }
        console.log(`LDIV-JOIN: ${n} arcs measured; worst gap ${worstGap.toFixed(2)} mm, worst step ${worstStep.toFixed(2)} mm`);
    } catch (e) {
        console.log('FAIL ' + (e.stack || e.message));
        fails++;
    } finally {
        await app.close();
    }
    console.log(fails ? `ws-ldiv-hug: FAIL (${fails})` : 'ws-ldiv-hug: OK');
    process.exit(fails ? 1 : 0);
}

if (process.argv.includes('--join')) joinMain();
else (async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    let fails = 0, n = 0;
    const lens = new Set();
    let ref = null;
    const seen = new Map();          // brackets measured per host x skill (a Mix card may deal another form)
    const judge = (host, tag, res) => {
        if (!res || res.error) { console.log(`FAIL ${host} ${tag}: ${res ? res.error : 'no result'}`); fails++; return; }
        seen.set(`${host} ${tag}`, (seen.get(`${host} ${tag}`) || 0) + res.brackets.length);
        for (const b of res.brackets) {
            n++;
            lens.add(b.text.length);
            const bad = [];
            for (const k of ['gap', 'over', 'space']) if (b[k] > ref[k] + TOL[k]) bad.push(`${k} ${b[k].toFixed(2)} > paper ${ref[k].toFixed(2)} + ${TOL[k]}`);
            const ceil = CEIL[b.kind] || {};
            for (const k of Object.keys(ceil)) if (b[k] > ceil[k]) bad.push(`${k} ${b[k].toFixed(2)} > ${ceil[k]}`);
            if (b.place) bad.push(b.place);
            if (b.join) bad.push(b.join);
            if (b.box < BOX_MIN) bad.push(`box ${b.box.toFixed(0)}px`);
            if (bad.length) fails++;
            console.log(`${bad.length ? 'FAIL' : 'PASS'} ${host} ${tag} ${b.kind} ${b.text} @${b.em.toFixed(0)}px: gap ${b.gap.toFixed(2)} over ${b.over.toFixed(2)} space ${b.space.toFixed(2)} box ${b.box.toFixed(0)}px centre ${b.boxOffset.toFixed(2)}${bad.length ? '  <- ' + bad.join(', ') : ''}`);
        }
    };
    try {
        for (const s of SKILLS) {
            const pr = await paper(page, s.paperAs || s);
            if (!pr || pr.error || !pr.brackets.length) { console.log(`FAIL paper ${s.tag}: ${pr && pr.error ? pr.error : 'no bracket'}`); fails++; continue; }
            ref = { gap: Math.max(...pr.brackets.map((b) => b.gap)), over: Math.max(...pr.brackets.map((b) => b.over)), space: Math.max(...pr.brackets.map((b) => b.space)) };
            console.log(`---- ${s.tag}: paper (${pr.brackets.length} brackets) gap ${ref.gap.toFixed(2)} over ${ref.over.toFixed(2)} space ${ref.space.toFixed(2)}`);
            for (const w of [820, 1280]) { // owner 2026-11-13: no phone width (was 390)
                for (const seed of [11, 12, 13, 14]) {
                    judge(`card-${w}`, s.tag, await card(page, s, w, seed));
                    if (seed === 11) await shot(page, '#gameView', `${s.tag}-card-${w}.png`);
                }
                judge(`worksheet-${w}`, s.tag, await worksheet(page, s, w));
                await shot(page, '#worksheetView', `${s.tag}-worksheet-${w}.png`);
            }
            judge('quiz-1280', s.tag, await quiz(page, s));
            await shot(page, '#quizTakeView', `${s.tag}-quiz-1280.png`);
        }
        for (const [k, c] of seen) if (!c) { fails++; console.log(`FAIL ${k}: no bracket measured`); }
        for (const L of [1, 2, 3]) {
            const ok = lens.has(L);
            if (!ok) fails++;
            console.log(`${ok ? 'PASS' : 'FAIL'} a ${L}-digit dividend was drawn in a bracket on screen`);
        }
        const errs = app.problems.filter((p) => p.type !== 'requestfailed');
        if (errs.length) { fails++; errs.slice(0, 5).forEach((e) => console.log(`FAIL console: ${e.text}`)); }
        console.log(`${n} brackets measured`);
    } catch (e) {
        console.log('FAIL ' + (e.stack || e.message));
        fails++;
    } finally {
        await app.close();
    }
    console.log(fails ? `ws-ldiv-hug: FAIL (${fails})` : 'ws-ldiv-hug: OK');
    process.exit(fails ? 1 : 0);
})();
