// Verify the new MAP results report renders strengths, needs-work,
// domain bars, and the encouraging summary message.
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    let failed = false;
    const expect = (cond, msg) => {
        if (!cond) {
            console.log('  FAIL: ' + msg);
            failed = true;
        } else {
            console.log('  OK:   ' + msg);
        }
    };

    console.log('=== Loading app ===');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 30000 });
    await new Promise(r => setTimeout(r, 600));

    // Inject a synthetic MAP session into state.lastMapResult, then render.
    console.log('\n=== Inject synthetic MAP history & render ===');
    const renderInfo = await page.evaluate(() => {
        // Pull a known skill id from each MAP domain so the report has real labels.
        // We use whatever exists in MAP_DOMAIN_CATEGORIES.
        const cats = window.MAP_DOMAIN_CATEGORIES || {
            OA: ['addition'], NO: ['place_value'], MD: ['measurement'], G: ['shapes'],
        };
        function pickSkillForDomain(d) {
            const catList = cats[d] || [];
            for (const cat of catList) {
                const arr = window.SKILLS && window.SKILLS[cat];
                if (Array.isArray(arr) && arr.length) {
                    return { skillId: arr[0].v, categoryId: cat, label: arr[0].l };
                }
            }
            return null;
        }
        const oa = pickSkillForDomain('OA');
        const no = pickSkillForDomain('NO');
        const md = pickSkillForDomain('MD');
        const g  = pickSkillForDomain('G');

        // Build a history array with controlled correct/wrong per skill.
        // Strong skill: 3/3 correct (oa)
        // Mid skill:    2/3 correct (no)  -> appears in BOTH strengths & needs-work
        // Weak skill:   0/2 correct (md)
        // Wrong only:   1/3 correct (g)
        const history = [];
        const push = (sk, correctFlags) => {
            if (!sk) return;
            for (let i = 0; i < correctFlags.length; i++) {
                history.push({
                    skillId: sk.skillId,
                    categoryId: sk.categoryId,
                    domain: (function(){
                        for (const [d, list] of Object.entries(cats)) {
                            if (list.includes(sk.categoryId)) return d;
                        }
                        return null;
                    })(),
                    band: '181-190',
                    correct: !!correctFlags[i],
                    ritBefore: 185 + i,
                    ritAfter: 185 + i + (correctFlags[i] ? 3 : -3),
                    ts: Date.now() + i,
                });
            }
        };
        push(oa, [true, true, true]);
        push(no, [true, true, false]);
        push(md, [false, false]);
        push(g,  [true, false, false]);

        // Per-domain aggregates
        const perDomain = { OA: null, NO: null, MD: null, G: null };
        for (const h of history) {
            if (!h.domain) continue;
            if (!perDomain[h.domain]) perDomain[h.domain] = { rit: 0, items: 0, correct: 0, _sum: 0 };
            const p = perDomain[h.domain];
            p.items++;
            if (h.correct) p.correct++;
            p._sum += h.ritBefore;
            p.rit = Math.round(p._sum / p.items);
        }
        for (const k of Object.keys(perDomain)) {
            if (perDomain[k]) delete perDomain[k]._sum;
        }

        const lastMapResult = {
            finalRit: 192,
            se: 4,
            perDomain,
            items: history.length,
            durationMs: 60_000,
            tier: 'k2',
            mode: 'practice',
            history,
        };
        window.state.lastMapResult = lastMapResult;

        // Force the results view to be visible & render
        if (typeof window.showView === 'function') window.showView('mapResultsView');
        if (typeof window.renderMapResults === 'function') window.renderMapResults();

        return {
            picked: { oa, no, md, g },
            historyCount: history.length,
            perDomain,
        };
    });
    console.log('  picked OA:', renderInfo.picked.oa && renderInfo.picked.oa.skillId);
    console.log('  picked NO:', renderInfo.picked.no && renderInfo.picked.no.skillId);
    console.log('  picked MD:', renderInfo.picked.md && renderInfo.picked.md.skillId);
    console.log('  picked G: ', renderInfo.picked.g && renderInfo.picked.g.skillId);
    console.log('  total history items:', renderInfo.historyCount);

    // Verify DOM
    console.log('\n=== Verify rendered DOM ===');
    const dom = await page.evaluate(() => {
        const out = {};
        out.finalRit = (document.getElementById('mapFinalRit') || {}).textContent;
        out.finalSE  = (document.getElementById('mapFinalSE') || {}).textContent;

        const strengths = document.querySelectorAll('#mapStrengths .rit-skill-row');
        out.strengthsCount = strengths.length;
        out.strengthsText = Array.from(strengths).map(r => {
            const lbl = r.querySelector('.skill-label');
            const score = r.querySelector('.skill-score');
            const badge = r.querySelector('.domain-badge');
            return {
                label: lbl ? lbl.textContent.trim() : null,
                score: score ? score.textContent.trim() : null,
                domain: badge ? badge.textContent.trim() : null,
                strong: r.classList.contains('strong'),
            };
        });

        const needs = document.querySelectorAll('#mapNeedsWork .rit-skill-row');
        out.needsCount = needs.length;
        out.needsText = Array.from(needs).map(r => {
            const lbl = r.querySelector('.skill-label');
            const score = r.querySelector('.skill-score');
            const badge = r.querySelector('.domain-badge');
            const btn = r.querySelector('.practice-btn');
            return {
                label: lbl ? lbl.textContent.trim() : null,
                score: score ? score.textContent.trim() : null,
                domain: badge ? badge.textContent.trim() : null,
                weak: r.classList.contains('weak'),
                hasPracticeBtn: !!btn,
            };
        });

        const bars = document.querySelectorAll('#mapDomainBars .domain-bar-row');
        out.barsCount = bars.length;
        out.barsText = Array.from(bars).map(r => {
            const name = r.querySelector('.domain-name');
            const fill = r.querySelector('.domain-bar-fill');
            const pct  = r.querySelector('.domain-bar-pct');
            return {
                name: name ? name.textContent.trim() : null,
                width: fill ? fill.style.width : null,
                fillClass: fill ? fill.className : null,
                pct: pct ? pct.textContent.trim() : null,
            };
        });

        const msg = document.getElementById('mapSummaryMsg');
        out.summaryMsg = msg ? msg.textContent.trim() : null;

        const legacyReady = document.querySelector('#mapResultsView .rit-ready');
        out.legacyHidden = legacyReady ? (legacyReady.style.display === 'none') : true;

        out.practiceBtnAttached = typeof window.practiceMapSkill === 'function';
        return out;
    });

    console.log('  finalRit:', dom.finalRit, ' finalSE:', dom.finalSE);
    console.log('  strengths rows:', dom.strengthsCount);
    dom.strengthsText.forEach((s, i) => console.log(`    [${i}] ${s.label} | ${s.score} | ${s.domain} | strong=${s.strong}`));
    console.log('  needs-work rows:', dom.needsCount);
    dom.needsText.forEach((s, i) => console.log(`    [${i}] ${s.label} | ${s.score} | ${s.domain} | weak=${s.weak} | btn=${s.hasPracticeBtn}`));
    console.log('  domain-bar rows:', dom.barsCount);
    dom.barsText.forEach((b, i) => console.log(`    [${i}] ${b.name} | width=${b.width} | ${b.fillClass} | ${b.pct}`));
    console.log('  summary message:', dom.summaryMsg);
    console.log('  legacy Ready-to-Learn hidden:', dom.legacyHidden);
    console.log('  window.practiceMapSkill attached:', dom.practiceBtnAttached);

    expect(dom.finalRit === '192', 'finalRit shows 192');
    expect(/^±\s*4$/.test(dom.finalSE), 'finalSE shows ± 4');
    expect(dom.strengthsCount >= 1, 'strengths section has at least 1 skill');
    expect(dom.strengthsText.some(s => s.strong), 'strengths use .strong variant');
    expect(dom.needsCount >= 1, 'needs-work section has at least 1 skill');
    expect(dom.needsText.every(s => s.weak), 'needs-work rows use .weak variant');
    expect(dom.needsText.every(s => s.hasPracticeBtn), 'every needs-work row has Practice button');
    expect(dom.barsCount === 4, 'domain bars: 4 rows (OA/NO/MD/G)');
    expect(dom.barsText.some(b => b.fillClass.includes('strong')), 'at least one strong (green) bar');
    expect(dom.barsText.some(b => b.fillClass.includes('weak')), 'at least one weak (red) bar');
    expect(dom.summaryMsg && dom.summaryMsg.length > 0, 'encouraging summary text rendered');
    expect(dom.legacyHidden, 'legacy Ready-to-Learn placeholder is hidden');
    expect(dom.practiceBtnAttached, 'window.practiceMapSkill function exposed');

    // Click the first Practice button — verify it queues the skill and starts game
    console.log('\n=== Click Practice button ===');
    const clickResult = await page.evaluate(() => {
        const btn = document.querySelector('#mapNeedsWork .practice-btn');
        if (!btn) return { clicked: false, reason: 'no button' };
        // Stub startGame so we can observe without entering gameplay
        let gameStarted = false;
        const origStart = window.startGame;
        window.startGame = function() { gameStarted = true; };
        btn.click();
        window.startGame = origStart;
        return {
            clicked: true,
            gameStarted,
            queueLen: (window.skillQueue || []).length,
            stateGameMode: window.state ? window.state.gameMode : null,
            stateSkill: window.state ? window.state.skill : null,
        };
    });
    console.log('  clicked:', clickResult.clicked, ' gameStarted:', clickResult.gameStarted,
                ' queue len:', clickResult.queueLen, ' mode:', clickResult.stateGameMode,
                ' skill:', clickResult.stateSkill);
    expect(clickResult.clicked, 'practice button clickable');
    expect(clickResult.gameStarted, 'startGame() invoked after click');
    expect(clickResult.queueLen >= 1, 'skillQueue has at least 1 entry after click');
    expect(clickResult.stateGameMode === 'practice', 'state.gameMode set to practice');

    // Console error check (filter network noise)
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
