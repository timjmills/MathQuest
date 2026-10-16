// The question dots and the number line (critic nl-r6 D1). In a counted pupil session at Chromebook
// size, css/play-compact.css pulls the question-dots row down into the practice card's top line. The
// number line band (#mqRefLine) must not sit under it: the dots would hide the high tick labels,
// where the answers land.
//
// DOTS_BAND runs in the page (page.evaluate(DOTS_BAND)) and returns:
//   dots      the dots row's rect, or null when there is no row to show
//   band      the band's rect, or null when no line is drawn
//   card      the practice card's rect
//   overlap   true when the dots row's rect and the band's rect intersect
//   dotsSeen  every dot is the topmost element at its centre
//   labelsHidden  the band's tick labels that are not the topmost element at their centre
//   inCardTop the dots row lies in the card's top line (its top and bottom within the card's first 60 px)
//   compact   the compact rule (dots ride in the card) is in force
// problems(r) lists what is wrong with a measurement, [] when it is right.
function DOTS_BAND() {
    const rect = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 ? { left: Math.round(r.left), top: Math.round(r.top), right: Math.round(r.right), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) } : null; };
    const row = document.getElementById('qDotsRow');
    const bandEl = document.getElementById('mqRefLine');
    const cardEl = document.getElementById('questionCard');
    const dots = row && row.children.length ? rect(row) : null;
    const band = rect(bandEl);
    const card = rect(cardEl);
    const overlap = !!(dots && band && dots.left < band.right - 0.5 && band.left < dots.right - 0.5 && dots.top < band.bottom - 0.5 && band.top < dots.bottom - 0.5);
    // a toast or a pop-up pinned over the page (position: fixed) comes and goes: not the layout
    const overlay = (at) => { for (let p = at; p && p !== document.body; p = p.parentElement) if (getComputedStyle(p).position === 'fixed') return true; return false; };
    let dotsSeen = true;
    if (dots) for (const d of row.children) {
        const r = d.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
        const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!at || !(d === at || d.contains(at) || overlay(at))) { dotsSeen = false; break; }
    }
    const labelsHidden = [];
    if (band) for (const t of bandEl.querySelectorAll('svg text')) {
        const r = t.getBoundingClientRect();
        if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
        const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (!at || !(bandEl.contains(at) || overlay(at))) labelsHidden.push((t.textContent || '').trim());
    }
    const compact = !!row && getComputedStyle(row).position === 'relative' && parseFloat(getComputedStyle(row).marginBottom) < 0;
    const inCardTop = !!(dots && card && dots.top >= card.top - 0.5 && dots.bottom <= card.top + 60);
    return { dots, band, card, overlap, dotsSeen, labelsHidden, inCardTop, compact };
}

function problems(r) {
    const out = [];
    if (!r) return ['no measurement'];
    if (r.overlap) out.push(`the question dots (${JSON.stringify(r.dots)}) lie on the number line (${JSON.stringify(r.band)})`);
    if (r.labelsHidden && r.labelsHidden.length) out.push(`tick labels covered: ${r.labelsHidden.join(',')}`);
    if (r.dots && !r.dotsSeen) out.push('a question dot is covered');
    if (r.dots && r.compact && !r.inCardTop) out.push(`the dots row (${JSON.stringify(r.dots)}) is not in the card's top line (card ${JSON.stringify(r.card)})`);
    return out;
}

// The pupil paths with a problem count, at Chromebook size: a queued set (the count select, 10 / 20)
// and a real Direct link (?c=<code>|Gp-N10 / N20 -> the landing pop-up's Start), add_facts with the
// line on and with it off. With the line: a band, and the dots never on it. Without: no band, and the
// dots in the card's top line exactly as before (the compact rule untouched). Returns the failures;
// `log` gets one line per case, `shots` (a directory) a screenshot per case.
async function dotsBandCases(page, { sizes = [{ w: 1366, h: 650 }, { w: 1280, h: 600 }], counts = [10, 20], log = () => {}, shots = null } = {}) {
    const fs = require('fs');
    const path = require('path');
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const base = page.url().split('?')[0];
    const fails = [];
    const ready = async () => {
        await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && window.UnifiedSkills && typeof window.generateSkillCode === 'function', { timeout: 30000 });
    };
    for (const size of sizes) {
        await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
        for (const how of ['queue', 'link']) for (const n of counts) for (const line of [true, false]) {
            const tag = `R6-D1 ${how} N${n} ${line ? 'line' : 'no line'} ${size.w}x${size.h}`;
            try {
                await page.goto(base, { waitUntil: 'networkidle2' });
                await ready();
                const code = await page.evaluate((line) => {
                    window.clearSetOptions && window.clearSetOptions({ silent: true });
                    const U = window.UnifiedSkills; U.clear();
                    U.add({ categoryId: 'addition', skillId: 'add_facts', skillLabel: 'add_facts', opts: line ? { nlOn: true } : {} });
                    return window.generateSkillCode();
                }, line);
                if (how === 'link') {
                    await page.goto(base + '?c=' + encodeURIComponent(`${code}|Gp-N${n}-T0`), { waitUntil: 'networkidle2' });
                    await page.waitForFunction(() => window.state && window.state.landingSettings && typeof window.startFromLanding === 'function', { timeout: 30000 });
                    await page.evaluate(() => window.startFromLanding());
                } else {
                    await page.evaluate((n) => { const sel = document.getElementById('problemCountSelect'); sel.value = String(n); window.playSelectedSkills('practice'); }, n);
                }
                await sleep(1200);
                try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
                await page.evaluate(() => window.scrollTo(0, 0));
                await sleep(200);
                const ms = [];
                for (let i = 0; i < 3; i++) {
                    if (i) { await page.evaluate(() => { const st = window.state; st.hasAnswered = false; st.currentQ = window.generateQuestion(); window.renderQuestion(); window.scrollTo(0, 0); }); await sleep(250); }
                    ms.push(await page.evaluate(DOTS_BAND));
                }
                const bad = new Set();
                for (const m of ms) {
                    problems(m).forEach((p) => bad.add(p));
                    if (!m.dots) bad.add('no question dots in a counted session');
                    if (line && !m.band) bad.add('no number line');
                    if (!line && m.band) bad.add('a number line without the option');
                    if (!m.compact) bad.add('the compact rule (dots in the card) is not in force at this size');
                }
                const m = ms[0];
                log(`  ${tag}: ${bad.size ? 'FAIL' : 'ok'} dots ${m.dots ? `${m.dots.left}-${m.dots.right} x ${m.dots.top}-${m.dots.bottom}` : '-'} band ${m.band ? `${m.band.top}-${m.band.bottom}` : '-'} card top ${m.card ? m.card.top : '-'}${m.labelsHidden.length ? ' hidden ' + m.labelsHidden.join(',') : ''}`);
                bad.forEach((p) => fails.push(`${tag}: ${p}`));
                if (shots) { fs.mkdirSync(shots, { recursive: true }); await page.screenshot({ path: path.join(shots, `dots-${how}-N${n}-${line ? 'line' : 'noline'}-${size.w}x${size.h}.png`) }); }
            } catch (e) { fails.push(`${tag}: ${e.message}`); }
        }
    }
    await page.evaluate(() => { try { window.UnifiedSkills.clear(); window.clearSetOptions && window.clearSetOptions({ silent: true }); window.state.isMixedMode = false; window.showView('homeView'); } catch (e) { /* page left as is */ } });
    return fails;
}

// critic nl-r7 D1: a TIMED session (the queue's default timer; a link with T300) at Chromebook size.
// The page is measured as the pupil gets it (no scrollTo): the band's top must clear the sticky play
// bar's BOTTOM whenever the answer box and Check fit in the window with the band in view, and the box
// and Check must always be in view.
function HEADER_BAND() {
    const band = document.getElementById('mqRefLine');
    let hdr = 0;
    for (const el of document.querySelectorAll('.nav-bar > .nav-logo, #gameView > *, #myStatsBar, .mq-play-menu-btn')) {
        if (el === band || getComputedStyle(el).position !== 'sticky') continue;
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.top < 20 && r.bottom < innerHeight / 2) hdr = Math.max(hdr, r.bottom);
    }
    const box = (id) => { const el = document.getElementById(id); if (!el) return null; const r = el.getBoundingClientRect(); return r.height > 0 ? { top: Math.round(r.top), bottom: Math.round(r.bottom) } : null; };
    const b = band ? band.getBoundingClientRect() : null;
    return { scrollY: Math.round(scrollY), hdr: Math.round(hdr), band: b ? { top: Math.round(b.top), bottom: Math.round(b.bottom) } : null,
        input: box('answerInput'), check: box('qcCheckBtn'), timed: !!(window.state && window.state.timerEnabled !== false && document.getElementById('timerContainer') && getComputedStyle(document.getElementById('timerContainer')).display !== 'none'), vh: innerHeight };
}

async function timedHeaderCases(page, { sizes = [{ w: 1280, h: 600 }, { w: 1366, h: 650 }], skills = [['subtraction', 'sub_100_regroup'], ['multiplication', 'nl_mult']], log = () => {} } = {}) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const base = page.url().split('?')[0];
    const fails = [];
    for (const size of sizes) for (const [cat, skill] of skills) for (const how of ['queue', 'link']) {
        const tag = `R7-D1 timed ${how} ${skill} ${size.w}x${size.h}`;
        try {
            await page.setViewport({ width: size.w, height: size.h, deviceScaleFactor: 1 });
            await page.goto(base, { waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.playSelectedSkills === 'function' && window.UnifiedSkills && typeof window.generateSkillCode === 'function', { timeout: 30000 });
            const code = await page.evaluate((cat, skill) => {
                window.clearSetOptions && window.clearSetOptions({ silent: true });
                const U = window.UnifiedSkills; U.clear();
                U.add({ categoryId: cat, skillId: skill, skillLabel: skill, opts: { nlOn: true } });
                return window.generateSkillCode();
            }, cat, skill);
            if (how === 'link') {
                await page.goto(base + '?c=' + encodeURIComponent(`${code}|Gp-N10-T300`), { waitUntil: 'networkidle2' });
                await page.waitForFunction(() => window.state && window.state.landingSettings && typeof window.startFromLanding === 'function', { timeout: 30000 });
                await page.evaluate(() => window.startFromLanding());
            } else {
                await page.evaluate(() => window.playSelectedSkills('practice'));
            }
            await sleep(1500);
            try { await page.waitForFunction(() => document.fonts.status === 'loaded', { timeout: 8000 }); } catch (e) { /* measured anyway */ }
            await sleep(300);
            const m = await page.evaluate(HEADER_BAND);
            const bad = [];
            if (!m.band) bad.push('no number line');
            const inView = (r) => !r || (r.top >= m.hdr - 0.5 && r.bottom <= m.vh + 0.5);
            if (!inView(m.input)) bad.push(`answer box out of view ${JSON.stringify(m.input)}`);
            if (!inView(m.check)) bad.push(`Check out of view ${JSON.stringify(m.check)}`);
            if (m.band && m.band.top < m.hdr - 0.5) {
                const d = Math.min(m.scrollY, m.hdr - m.band.top);
                const fits = [m.input, m.check].every((r) => !r || r.bottom + d <= m.vh);
                if (fits) bad.push(`band ${m.band.top}-${m.band.bottom} under the sticky bar (bottom ${m.hdr}) at scroll ${m.scrollY} though the box and Check fit`);
            }
            log(`  ${tag}: ${bad.length ? 'FAIL' : 'ok'} scroll ${m.scrollY} bar-bottom ${m.hdr} band ${m.band ? m.band.top + '-' + m.band.bottom : '-'} box ${m.input ? m.input.top + '-' + m.input.bottom : '-'} check ${m.check ? m.check.top + '-' + m.check.bottom : '-'}`);
            bad.forEach((p) => fails.push(`${tag}: ${p}`));
        } catch (e) { fails.push(`${tag}: ${e.message}`); }
    }
    await page.evaluate(() => { try { window.UnifiedSkills.clear(); window.clearSetOptions && window.clearSetOptions({ silent: true }); window.state.isMixedMode = false; window.showView('homeView'); } catch (e) { /* page left as is */ } });
    return fails;
}

module.exports = { DOTS_BAND, problems, dotsBandCases, HEADER_BAND, timedHeaderCases };
