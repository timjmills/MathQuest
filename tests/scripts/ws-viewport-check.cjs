// ws-viewport-check — Chromebook viewport in a REAL session (IMPROVEMENT_PLAN §1.4 S2, "Chromebook viewport"): the answer
// box and Check are reachable, and nothing of the question sits under the sticky header, measured where the page really
// settles after a pupil starts a session — not with the page forced to the top.
//
// The class it closes: the number line's timed band under the sticky play bar (critic r2–r7, R7-D1 at 1280 x 600): a timed
// session's first focus scrolled the document to its end, so the band went under the bar although the page fitted.
// ws-chromebook-fit measures with scrollY = 0 and could not see it. This gate starts each session the way a pupil does —
// a ?c= link, untimed (T0) and timed (T300) — waits for the question to settle, measures, answers it, Checks, waits for
// the next question and measures again.
//
//   node tests/scripts/ws-viewport-check.cjs                                     # the default sample, every size, both modes
//   node tests/scripts/ws-viewport-check.cjs --skills subtraction:sub_100_regroup,multiplication:nl_mult --opts '{"nlOn":true}'
//   node tests/scripts/ws-viewport-check.cjs --sizes 1280x600 --modes T300       # one size, timed only
//   node tests/scripts/ws-viewport-check.cjs --baseline design/audit/baselines/viewport-check.json   # fail only NEW findings
//   node tests/scripts/ws-viewport-check.cjs --json out.json --report-only
//
// OPTIONS
//   --skills cat:skill,...   the skills (default SAMPLE below: tall stacks, number lines, long division, word problems, graphs)
//   --opts '{json}'          option values every skill in the run carries (the skill normalises what it does not declare)
//   --sizes WxH,...          default 1366x768,1366x650,1280x600,1280x720 (the Chromebook sizes RUBRIC and chromebook-fit use)
//   --modes T0,T300          default both: untimed and timed (3:00) link starts
//   --questions N            questions measured per session (default 2)
//   --baseline file          RATCHET: a (skill, size, mode, finding) already in the file does not fail; anything else does
//   --json file              write every finding (the format --baseline reads)
//   --report-only            print everything, exit 0
//
// FINDINGS (per measured question)
//   BOX-OUT       the answer box (the focused input, else the first answer input) is not wholly between the bottom of the
//                 sticky header and the bottom of the viewport
//   CHECK-OUT     the Check button is shown but not wholly in that strip
//   UNDER-HEADER  the top of the question (the number-line band, else the question paper / visual / text) is above the
//                 sticky header's bottom although scrolling it clear would keep the box and Check in view (when the
//                 problem itself is too tall to fit, the accepted ruling is that it may scroll; that is not a finding)
// The header is every sticky or fixed element pinned to the top of the viewport (toasts, modals and pop-ups excluded),
// found from computed styles, not from the app's own selector list.
//
// Runs one browser (through /tmp/mq-browser-run.sh, owner rule). MQ_ROOT serves another checkout (backtests).
// Prints one line per session and `ws-viewport-check: OK` or `ws-viewport-check: FAIL (n)`; exit 1 on FAIL.
'use strict';
const fs = require('fs');
const path = require('path');
const { open, ROOT } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TOOL = 'ws-viewport-check';

// The default sample: the hosts' tall cases (column stacks, long division, word problems, graphs, count rows) and the
// number-line band, plus one plain fact skill as a control.
const SAMPLE = [
    ['addition', 'add_facts', {}],
    ['subtraction', 'sub_100_regroup', {}],
    ['subtraction', 'sub_100_regroup', { nlOn: true }],
    ['multiplication', 'nl_mult', { nlOn: true }],
    ['multiplication', 'count_by_tables', {}],
    ['division', 'long_div_2digit', {}],
    ['addition', 'add_word_problems', {}],
    ['graphs', 'bar_graph', {}],
];
const OPTS = arg('opts', null) ? JSON.parse(arg('opts')) : null;
const SKILLS = arg('skills', null)
    ? arg('skills').split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [c, k] = s.split(':'); return [c, k, OPTS || {}]; })
    : SAMPLE.map(([c, k, o]) => [c, k, OPTS ? { ...o, ...OPTS } : o]);
const SIZES = arg('sizes', '1366x768,1366x650,1280x600,1280x720').split(',').map((s) => { const [w, h] = s.split('x').map(Number); return { w, h }; });
const MODES = arg('modes', 'T0,T300').split(',').map((s) => s.trim()).filter(Boolean);
const QUESTIONS = Math.max(1, parseInt(arg('questions', '2'), 10) || 2);

/** In the page: the sticky header's bottom, the question's top, the answer box and Check. */
function MEASURE() {
    const isOverlay = (el) => { for (let p = el; p && p !== document.body; p = p.parentElement) { const c = `${typeof p.className === 'string' ? p.className : ''} ${p.id}`; if (/toast|modal|popup|overlay|confetti|celebrat|tooltip/i.test(c)) return true; } return false; };
    const rr = (el) => { if (!el) return null; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return null; const r = el.getBoundingClientRect(); return r.height > 0 && r.width > 0 ? { top: Math.round(r.top), bottom: Math.round(r.bottom) } : null; };
    let hdr = 0;
    const hdrEls = [];
    for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position !== 'sticky' && cs.position !== 'fixed') continue;
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
        const r = el.getBoundingClientRect();
        if (!(r.height > 0 && r.width > 100 && r.left < innerWidth - 20 && r.right > 20 && r.top < 20 && r.bottom > 0 && r.bottom < innerHeight / 2)) continue;
        if (isOverlay(el)) continue;
        if (el.closest('#questionCard')) continue;
        if (r.bottom > hdr) { hdr = r.bottom; }
        hdrEls.push(`${el.id || (typeof el.className === 'string' ? el.className.split(' ')[0] : '') || el.tagName}:${Math.round(r.bottom)}`);
    }
    // the question's top: the number-line band when there is one, else the first drawn of paper / visual / text
    const qTopEl = ['mqRefLine', 'questionPaper', 'visualAid', 'questionText'].map((id) => document.getElementById(id)).find((e) => rr(e));
    const ae = document.activeElement;
    const active = ae && ae !== document.body && /INPUT|TEXTAREA/.test(ae.tagName) && ae.closest('#gameView') ? rr(ae) : null;
    const inputs = [...document.querySelectorAll('#questionCard input:not([type=hidden]), #answerInput')].filter((e) => rr(e));
    const chk = document.getElementById('qcCheckBtn');
    return {
        sy: Math.round(scrollY), vh: innerHeight, hdr: Math.round(hdr), hdrEls: hdrEls.slice(0, 4),
        qTop: qTopEl ? rr(qTopEl) : null, qTopId: qTopEl ? qTopEl.id : '',
        box: active || (inputs.length ? rr(inputs[0]) : null),
        check: chk ? rr(chk) : null,
        qi: window.state ? window.state.qCount : null,
    };
}

function verdict(m) {
    const bad = [];
    const inView = (r) => r && r.top >= m.hdr - 1 && r.bottom <= m.vh + 1;
    if (m.box && !inView(m.box)) bad.push('BOX-OUT');
    if (m.check && !inView(m.check)) bad.push('CHECK-OUT');
    if (m.qTop && m.qTop.top < m.hdr - 1 && m.sy > 0) {
        // could the page show the question's top below the header and still show the box and Check?
        const d = Math.min(m.sy, m.hdr - m.qTop.top);
        const fits = [m.box, m.check].every((r) => !r || r.bottom + d <= m.vh + 1);
        if (fits) bad.push('UNDER-HEADER');
    }
    return bad;
}

(async () => {
    const t0 = Date.now();
    // a seeded Math.random on every navigation: the same tree deals the same questions, so the baseline does not flap
    const h = await open({ seed: 1, viewport: { width: 1366, height: 768, deviceScaleFactor: 1 } });
    const { page } = h;
    const base = page.url().split('?')[0];
    const sessions = [];
    const findings = [];
    try {
        for (const size of SIZES) for (const [cat, skill, opts] of SKILLS) for (const mode of MODES) {
            const id = `${cat}:${skill}${Object.keys(opts).length ? JSON.stringify(opts) : ''}`;
            const tag = `${size.w}x${size.h} ${mode} ${id}`;
            const rec = { tag, steps: [] };
            try {
                await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
                await page.goto(base, { waitUntil: 'networkidle2' });
                await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && window.UnifiedSkills && typeof window.generateSkillCode === 'function', { timeout: 30000 });
                const code = await page.evaluate((cat, skill, opts) => {
                    if (window.clearSetOptions) window.clearSetOptions({ silent: true });
                    const U = window.UnifiedSkills; U.clear();
                    U.add({ categoryId: cat, skillId: skill, skillLabel: skill, opts });
                    return window.generateSkillCode();
                }, cat, skill, opts);
                await page.goto(`${base}?c=${encodeURIComponent(`${code}|Gp-N10-${mode}`)}`, { waitUntil: 'networkidle2' });
                await page.waitForFunction(() => window.state && window.state.landingSettings && typeof window.startFromLanding === 'function', { timeout: 30000 });
                await page.evaluate(() => window.startFromLanding());
                await sleep(1600);
                try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
                for (let qn = 1; qn <= QUESTIONS; qn++) {
                    await sleep(500);   // let any late scroll correction land (critic r8 R8-D1: ~300 ms)
                    const m = await page.evaluate(MEASURE);
                    const bad = verdict(m);
                    rec.steps.push({ q: qn, m, bad });
                    for (const b of bad) findings.push({ skill: id, size: `${size.w}x${size.h}`, mode, q: qn, finding: b, detail: `scrollY ${m.sy}, header bottom ${m.hdr}, ${m.qTopId} ${m.qTop ? `${m.qTop.top}-${m.qTop.bottom}` : '-'}, box ${m.box ? `${m.box.top}-${m.box.bottom}` : '-'}, Check ${m.check ? `${m.check.top}-${m.check.bottom}` : '-'}, viewport ${m.vh}` });
                    if (qn === QUESTIONS) break;
                    // answer it right, Check, wait for the next question
                    await page.evaluate(() => {
                        const a = window.state && window.state.currentQ ? window.state.currentQ.ans : '1';
                        const el = document.activeElement && /INPUT/.test(document.activeElement.tagName) ? document.activeElement : document.getElementById('answerInput');
                        if (el) { el.value = String(a); el.dispatchEvent(new Event('input', { bubbles: true })); }
                        if (typeof window.submitAnswer === 'function') window.submitAnswer();
                    });
                    let adv = false;
                    for (let k = 0; k < 25 && !adv; k++) { await sleep(200); adv = await page.evaluate((qi) => window.state.qCount !== qi, m.qi); }
                    if (!adv) {
                        await page.evaluate(() => { const b = document.getElementById('nextBtn'); if (b && b.offsetParent) b.click(); });
                        await sleep(300);
                        adv = await page.evaluate((qi) => window.state.qCount !== qi, m.qi);
                    }
                    if (!adv) {
                        // a multi-box answer the probe cannot type: render the next question as the game does
                        rec.note = `q${qn}: answer not typed, next question rendered`;
                        adv = await page.evaluate(() => { try { const st = window.state; st.hasAnswered = false; st.currentQ = window.generateQuestion(); window.renderQuestion(); return true; } catch (e) { return false; } });
                        if (!adv) { rec.note = `q${qn}: did not move on`; break; }
                    }
                    await sleep(1400);
                }
            } catch (e) { rec.error = e.message; findings.push({ skill: id, size: `${size.w}x${size.h}`, mode, q: 0, finding: 'ERROR', detail: e.message.slice(0, 160) }); }
            const errs = h.problems.splice(0).filter((p) => p.type === 'pageerror');
            for (const e of errs) findings.push({ skill: id, size: `${size.w}x${size.h}`, mode, q: 0, finding: 'PAGE-ERROR', detail: e.text.slice(0, 160) });
            sessions.push(rec);
            const s = rec.steps.map((x) => `q${x.q} sy${x.m.sy} hdr${x.m.hdr} top${x.m.qTop ? x.m.qTop.top : '-'}${x.bad.length ? ` [${x.bad.join(' ')}]` : ''}`).join(' | ');
            console.log(`  ${tag}: ${rec.error ? `ERROR ${rec.error}` : s}${rec.note ? ` (${rec.note})` : ''}${errs.length ? ` (${errs.length} page error(s))` : ''}`);
        }
    } finally { await h.close(); }

    const keyOf = (f) => `${f.skill}|${f.size}|${f.mode}|${f.finding}`;
    const basePath = arg('baseline', null);
    let known = new Set();
    if (basePath) {
        const p = path.resolve(basePath);
        if (fs.existsSync(p)) known = new Set((JSON.parse(fs.readFileSync(p, 'utf8')).findings || []).map(keyOf));
        else console.log(`${TOOL}: baseline ${basePath} not found; every finding counts`);
    }
    if (arg('json', null)) fs.writeFileSync(path.resolve(arg('json')), JSON.stringify({ tool: TOOL, root: ROOT === path.resolve(__dirname, '..', '..') ? 'this tree' : 'MQ_ROOT', sizes: SIZES.map((s) => `${s.w}x${s.h}`), modes: MODES, findings: findings.map((f) => ({ skill: f.skill, size: f.size, mode: f.mode, finding: f.finding, q: f.q, detail: f.detail })) }, null, 1) + '\n');
    const fresh = findings.filter((f) => !known.has(keyOf(f)));
    console.log('');
    console.log(`${'finding'.padEnd(14)}${'size'.padEnd(10)}${'mode'.padEnd(6)}${'q'.padEnd(3)}skill / detail`);
    for (const f of findings) console.log(`${f.finding.padEnd(14)}${f.size.padEnd(10)}${f.mode.padEnd(6)}${String(f.q).padEnd(3)}${f.skill}${known.has(keyOf(f)) ? ' (baseline)' : ''}\n${' '.repeat(33)}${f.detail}`);
    console.log(`\n${sessions.length} session(s), ${findings.length} finding(s), ${fresh.length} new; ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    if (fresh.length) {
        console.log(has('report-only') ? `${TOOL}: WOULD FAIL (${fresh.length}) [report-only, exit 0]` : `${TOOL}: FAIL (${fresh.length})`);
        process.exit(has('report-only') ? 0 : 1);
    }
    console.log(`${TOOL}: OK`);
})().catch((e) => { console.log(`${TOOL}: FAIL (crash: ${e.message})`); process.exit(1); });
