// Live puppeteer test: MAP results screen grade-level comparison badge,
// percentile estimate, and grade/season selector behavior.
//
// Verifies:
//  1. Section is injected into the DOM after results render.
//  2. Badge text matches expected output for known (rit, grade, season) tuples.
//  3. Percentile estimates fall within plausible ranges.
//  4. Changing the grade/season selector recomputes the badge.
//  5. Saved grade is persisted via localStorage.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    let failed = false;
    const expect = (cond, msg) => {
        if (!cond) { console.log('  FAIL: ' + msg); failed = true; }
        else { console.log('  OK:   ' + msg); }
    };

    console.log('=== Loading app ===');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 600));

    // --- Helper: inject a fake lastMapResult with given finalRit, render, set selectors. ---
    async function renderWith(finalRit, grade, season) {
        return await page.evaluate(({ finalRit, grade, season }) => {
            window.state.lastMapResult = {
                finalRit, se: 4,
                perDomain: { OA: null, NO: null, MD: null, G: null },
                items: 0, durationMs: 0, tier: 'k2', mode: 'practice',
                history: [],
            };
            if (typeof window.showView === 'function') window.showView('mapResultsView');
            if (typeof window.renderMapResults === 'function') window.renderMapResults();
            const gs = document.getElementById('mapGradeCompare');
            const ss = document.getElementById('mapSeasonCompare');
            if (gs && grade != null) {
                gs.value = grade;
                gs.dataset.userTouched = '1';
            }
            if (ss && season != null) {
                ss.value = season;
                ss.dataset.userTouched = '1';
            }
            if (typeof window.updateMapGradeContext === 'function') window.updateMapGradeContext();
            const badge = document.getElementById('mapGradeBadge');
            const pct = document.getElementById('mapPercentileText');
            return {
                badgeText: badge ? badge.textContent.trim() : null,
                badgeClass: badge ? badge.className : null,
                pctText: pct ? pct.textContent.trim() : null,
                gradeVal: gs ? gs.value : null,
                seasonVal: ss ? ss.value : null,
            };
        }, { finalRit, grade, season });
    }

    // === Test 1: Badge presence & default behavior ===
    console.log('\n=== Test 1: Section injected on initial render ===');
    const initial = await renderWith(180, 'K', 'fall');
    const sectionPresent = await page.evaluate(() => !!document.querySelector('#mapResultsView .rit-grade-context'));
    expect(sectionPresent, 'rit-grade-context section injected into mapResultsView');
    expect(!!initial.badgeText, 'badge text rendered');
    expect(!!initial.pctText, 'percentile text rendered');

    // === Test 2: K spring rit=160 ===
    // mean=157.11, diff=+2.89 → on-grade ("🎯 On Grade Level")
    console.log('\n=== Test 2: K spring rit=160 → On Grade Level ===');
    const t2 = await renderWith(160, 'K', 'spring');
    console.log('  badge:', t2.badgeText);
    console.log('  pct:  ', t2.pctText);
    expect(/On Grade Level/.test(t2.badgeText), 'K spring 160 shows "On Grade Level"');
    expect(/on-grade/.test(t2.badgeClass || ''), 'badge has on-grade class');

    // === Test 3: G3 spring rit=180 ===
    // mean=201.08, diff=-21.08 → below-grade "📚 Building Skills (-21 points to grade level)"
    console.log('\n=== Test 3: G3 spring rit=180 → Building Skills (-21) ===');
    const t3 = await renderWith(180, '3', 'spring');
    console.log('  badge:', t3.badgeText);
    console.log('  pct:  ', t3.pctText);
    expect(/Building Skills/.test(t3.badgeText), 'G3 spring 180 shows "Building Skills"');
    expect(/-21/.test(t3.badgeText), 'G3 spring 180 shows -21 in badge');
    expect(/below-grade/.test(t3.badgeClass || ''), 'badge has below-grade class');

    // === Test 4: G5 spring rit=219 ===
    // mean=218.75, diff=+0.25 → on-grade ("🎯 On Grade Level")
    console.log('\n=== Test 4: G5 spring rit=219 → On Grade Level ===');
    const t4 = await renderWith(219, '5', 'spring');
    console.log('  badge:', t4.badgeText);
    console.log('  pct:  ', t4.pctText);
    expect(/On Grade Level/.test(t4.badgeText), 'G5 spring 219 shows "On Grade Level"');
    expect(/on-grade/.test(t4.badgeClass || ''), 'badge has on-grade class');

    // === Test 5: Above-grade case (G1 fall, rit=200 → mean 160.05, diff=+40) ===
    console.log('\n=== Test 5: G1 fall rit=200 → Above Grade Level (+40) ===');
    const t5 = await renderWith(200, '1', 'fall');
    console.log('  badge:', t5.badgeText);
    console.log('  pct:  ', t5.pctText);
    expect(/Above Grade Level/.test(t5.badgeText), 'G1 fall 200 shows "Above Grade Level"');
    expect(/\+40/.test(t5.badgeText), 'G1 fall 200 shows +40 in badge');
    expect(/above-grade/.test(t5.badgeClass || ''), 'badge has above-grade class');

    // === Test 6: Percentile plausibility ===
    // For K spring rit=160 (mean 157.11, sd 12.03), z = +0.24 → CDF ~ 59.5%
    // For G3 spring rit=180 (mean 201.08, sd 14.11), z = -1.50 → CDF ~ 6-8%
    // For G5 spring rit=219 (mean 218.75, sd 16.70), z = +0.015 → CDF ~ 50%
    console.log('\n=== Test 6: Percentile estimate plausibility ===');
    const matchPct = (txt) => {
        const m = (txt || '').match(/(\d+)(?:st|nd|rd|th)\s+percentile|Top\s+(\d+)%/);
        if (!m) return null;
        if (m[2]) return 100 - Number(m[2]);
        return Number(m[1]);
    };
    const p2 = matchPct(t2.pctText);
    const p3 = matchPct(t3.pctText);
    const p4 = matchPct(t4.pctText);
    console.log('  K spring 160 → percentile:', p2);
    console.log('  G3 spring 180 → percentile:', p3);
    console.log('  G5 spring 219 → percentile:', p4);
    expect(p2 != null && p2 >= 50 && p2 <= 70, 'K spring 160 percentile in plausible range (50-70)');
    expect(p3 != null && p3 >= 1 && p3 <= 15, 'G3 spring 180 percentile in plausible range (1-15)');
    expect(p4 != null && p4 >= 40 && p4 <= 60, 'G5 spring 219 percentile in plausible range (40-60)');

    // === Test 7: Grade selector change recomputes badge ===
    console.log('\n=== Test 7: Changing grade selector recomputes badge ===');
    // Start with rit=200, grade=1 (above grade). Change grade to 5 (mean 209.13 fall, diff=-9 → below).
    const before = await renderWith(200, '1', 'fall');
    const after = await page.evaluate(() => {
        const gs = document.getElementById('mapGradeCompare');
        gs.value = '5';
        gs.dataset.userTouched = '1';
        if (typeof window.updateMapGradeContext === 'function') window.updateMapGradeContext();
        const b = document.getElementById('mapGradeBadge');
        return { badgeText: b ? b.textContent.trim() : null, badgeClass: b ? b.className : null };
    });
    console.log('  before:', before.badgeText);
    console.log('  after :', after.badgeText);
    expect(/Above Grade Level/.test(before.badgeText), 'rit=200 vs G1 fall is Above');
    expect(/Building Skills|Above Grade Level|On Grade Level/.test(after.badgeText), 'badge changed text on grade switch');
    expect(before.badgeText !== after.badgeText, 'badge text differs after grade switch');

    // === Test 8: Saved grade persists across renders ===
    console.log('\n=== Test 8: Saved grade persists ===');
    const saved = await page.evaluate(() => {
        try { return localStorage.getItem('mathquest_grade'); } catch (_) { return null; }
    });
    console.log('  localStorage mathquest_grade =', saved);
    expect(saved === '5', 'localStorage saved most recent grade selection (5)');

    // === Test 9: Existing mapFinalRit still renders (no regression) ===
    console.log('\n=== Test 9: Regression — finalRit/SE still render ===');
    await renderWith(192, '3', 'fall');
    const reg = await page.evaluate(() => ({
        finalRit: (document.getElementById('mapFinalRit') || {}).textContent,
        finalSE:  (document.getElementById('mapFinalSE') || {}).textContent,
    }));
    console.log('  finalRit:', reg.finalRit, ' finalSE:', reg.finalSE);
    expect(reg.finalRit === '192', 'finalRit shows 192');
    expect(/^±\s*4$/.test(reg.finalSE), 'finalSE shows ± 4');

    // === Test 10: window.updateMapGradeContext is exposed ===
    console.log('\n=== Test 10: window.updateMapGradeContext exposed ===');
    const exposed = await page.evaluate(() => typeof window.updateMapGradeContext === 'function');
    expect(exposed, 'window.updateMapGradeContext is a function');

    // Console error check
    const critical = errors.filter(e =>
        !e.includes('favicon') && !e.includes('net::') &&
        !e.includes('ERR_CONNECTION') && !e.includes('404') &&
        !e.includes('Failed to load resource')
    );
    console.log('\n=== Console errors ===');
    console.log('  total:', errors.length, ' critical:', critical.length);
    critical.forEach(e => console.log('    ERROR:', e));
    expect(critical.length === 0, 'no critical console errors');

    await browser.close();

    if (failed) {
        console.log('\n=== TEST FAILED ===');
        process.exit(1);
    } else {
        console.log('\n=== TEST PASSED ===');
        process.exit(0);
    }
})();
