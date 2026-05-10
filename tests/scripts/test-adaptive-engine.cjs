// Whole-Program Adaptive Mode probe test
// Verifies: opt-in toggle, 3-correct promotion, 2-wrong demotion, persistence.

const puppeteer = require('puppeteer');

const BASE = 'http://localhost:8080/index.html';

function log(...args) { console.log('[ADAPTIVE TEST]', ...args); }

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            const ok = await page.evaluate(fn);
            if (ok) return true;
        } catch {}
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error(`Timeout waiting for ${label}`);
}

(async () => {
    let browser;
    let exitCode = 0;
    const failures = [];

    function assert(cond, msg) {
        if (!cond) { failures.push(msg); log('FAIL:', msg); }
        else log('PASS:', msg);
    }

    try {
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 900 });

        const consoleErrors = [];
        page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
        page.on('pageerror', err => consoleErrors.push(String(err)));

        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && window.state !== null,
            10000, 'window.state to exist');

        // Globals wired
        const wired = await page.evaluate(() => ({
            toggleAdaptiveMode: typeof window.toggleAdaptiveMode === 'function',
            initAdaptiveSession: typeof window.initAdaptiveSession === 'function',
            recordAdaptiveAnswer: typeof window.recordAdaptiveAnswer === 'function',
            applyAdaptiveLevelToQuestion: typeof window.applyAdaptiveLevelToQuestion === 'function',
            applyAdaptiveSettingsForNextQuestion: typeof window.applyAdaptiveSettingsForNextQuestion === 'function',
            getAdaptiveSnapshot: typeof window.getAdaptiveSnapshot === 'function',
            getAdaptiveLevel: typeof window.getAdaptiveLevel === 'function',
        }));
        log('wired:', JSON.stringify(wired));
        for (const [k, v] of Object.entries(wired)) {
            assert(v, `window.${k} wired`);
        }

        // Reset any previously persisted state
        await page.evaluate(() => {
            try { localStorage.removeItem('mathquest_adaptive_levels'); } catch {}
            try { localStorage.removeItem('mathquest_adaptive_enabled'); } catch {}
            window.state.adaptiveLevels = {};
            window.state.adaptiveModeEnabled = false;
        });

        // Toggle button visible in DOM
        const toggleVisible = await page.evaluate(() => {
            const btn = document.querySelector('.adaptive-toggle');
            const status = document.getElementById('adaptiveStatus');
            return { btn: !!btn, status: !!status, label: status ? status.textContent : null, active: btn ? btn.classList.contains('active') : null };
        });
        log('toggle UI:', JSON.stringify(toggleVisible));
        assert(toggleVisible.btn, 'Adaptive toggle button rendered');
        assert(toggleVisible.status, 'Adaptive status span rendered');
        assert(toggleVisible.label === 'Off', `Initial label is "Off" (got "${toggleVisible.label}")`);
        assert(toggleVisible.active === false, 'Initial button NOT active class');

        // Default OFF
        const initialEnabled = await page.evaluate(() => window.state.adaptiveModeEnabled);
        assert(initialEnabled === false, 'state.adaptiveModeEnabled defaults to false');

        // Enable
        await page.evaluate(() => window.toggleAdaptiveMode());
        const afterToggle = await page.evaluate(() => ({
            enabled: window.state.adaptiveModeEnabled,
            label: document.getElementById('adaptiveStatus').textContent,
            active: document.querySelector('.adaptive-toggle').classList.contains('active'),
        }));
        log('after toggle ON:', JSON.stringify(afterToggle));
        assert(afterToggle.enabled === true, 'state.adaptiveModeEnabled === true after toggle');
        assert(afterToggle.label === 'On', `Label changes to "On" (got "${afterToggle.label}")`);
        assert(afterToggle.active === true, 'Button has active class when ON');

        // Default level for a fresh skill should be 3
        const initLvl = await page.evaluate(() => window.getAdaptiveLevel('add_facts'));
        assert(initLvl === 3, `Default level for add_facts is 3 (got ${initLvl})`);

        // 3 correct in a row → promote 3 → 4
        await page.evaluate(() => {
            window.recordAdaptiveAnswer('add_facts', true);
            window.recordAdaptiveAnswer('add_facts', true);
            window.recordAdaptiveAnswer('add_facts', true);
        });
        const afterPromote = await page.evaluate(() => window.getAdaptiveSnapshot().levels.add_facts);
        log('after 3 correct:', JSON.stringify(afterPromote));
        assert(afterPromote.level === 4, `Promoted to level 4 (got ${afterPromote.level})`);
        assert(afterPromote.recentCorrect === 0, `recentCorrect reset to 0 (got ${afterPromote.recentCorrect})`);

        // 2 wrong in a row → demote 4 → 3
        await page.evaluate(() => {
            window.recordAdaptiveAnswer('add_facts', false);
            window.recordAdaptiveAnswer('add_facts', false);
        });
        const afterDemote = await page.evaluate(() => window.getAdaptiveSnapshot().levels.add_facts);
        log('after 2 wrong:', JSON.stringify(afterDemote));
        assert(afterDemote.level === 3, `Demoted back to level 3 (got ${afterDemote.level})`);
        assert(afterDemote.recentWrong === 0, `recentWrong reset to 0 (got ${afterDemote.recentWrong})`);

        // Verify state.adaptiveLevels.add_facts.level === 3 (spec assertion)
        const finalLevel = await page.evaluate(() => window.state.adaptiveLevels.add_facts.level);
        assert(finalLevel === 3, `state.adaptiveLevels.add_facts.level === 3 (got ${finalLevel})`);

        // Persistence: localStorage should hold the data
        const persisted = await page.evaluate(() => localStorage.getItem('mathquest_adaptive_levels'));
        log('persisted localStorage:', persisted);
        assert(persisted && persisted.includes('add_facts'), 'Per-skill levels persisted to localStorage');
        const persistedToggle = await page.evaluate(() => localStorage.getItem('mathquest_adaptive_enabled'));
        assert(persistedToggle === '1', `Toggle persisted to localStorage as "1" (got "${persistedToggle}")`);

        // Demotion floor at level 1: drive add_facts down to 1, then 2 more wrong shouldn't go below.
        await page.evaluate(() => {
            window.state.adaptiveLevels.add_facts = { level: 1, recentCorrect: 0, recentWrong: 0, history: [] };
            window.recordAdaptiveAnswer('add_facts', false);
            window.recordAdaptiveAnswer('add_facts', false);
        });
        const floor = await page.evaluate(() => window.state.adaptiveLevels.add_facts.level);
        assert(floor === 1, `Cannot demote below level 1 (got ${floor})`);

        // Promotion ceiling at level 5
        await page.evaluate(() => {
            window.state.adaptiveLevels.add_facts = { level: 5, recentCorrect: 0, recentWrong: 0, history: [] };
            window.recordAdaptiveAnswer('add_facts', true);
            window.recordAdaptiveAnswer('add_facts', true);
            window.recordAdaptiveAnswer('add_facts', true);
        });
        const ceiling = await page.evaluate(() => window.state.adaptiveLevels.add_facts.level);
        assert(ceiling === 5, `Cannot promote above level 5 (got ${ceiling})`);

        // OFF mode short-circuits recordAdaptiveAnswer
        await page.evaluate(() => {
            window.toggleAdaptiveMode(); // turn OFF
            window.state.adaptiveLevels.add_facts = { level: 3, recentCorrect: 0, recentWrong: 0, history: [] };
            window.recordAdaptiveAnswer('add_facts', true);
            window.recordAdaptiveAnswer('add_facts', true);
            window.recordAdaptiveAnswer('add_facts', true);
        });
        const afterOff = await page.evaluate(() => ({
            enabled: window.state.adaptiveModeEnabled,
            level: window.state.adaptiveLevels.add_facts.level,
            recentCorrect: window.state.adaptiveLevels.add_facts.recentCorrect,
            history: window.state.adaptiveLevels.add_facts.history.length,
        }));
        log('after OFF + 3 correct:', JSON.stringify(afterOff));
        assert(afterOff.enabled === false, 'Toggle OFF works');
        assert(afterOff.level === 3, 'Level stays at 3 when adaptive mode OFF');
        assert(afterOff.recentCorrect === 0, 'recentCorrect not incremented when OFF');
        assert(afterOff.history === 0, 'history not appended when OFF');

        // Default-OFF behavior must match: a non-adaptive generated question
        // should not have an _adaptiveLevel tag.
        await page.evaluate(() => { window.state.skill = 'add_facts'; });
        const qOff = await page.evaluate(() => {
            const out = window.generateQuestion();
            return { hasAdaptive: '_adaptiveLevel' in out, text: out.text.slice(0, 60) };
        });
        log('q OFF:', JSON.stringify(qOff));
        assert(!qOff.hasAdaptive, 'OFF: generated question has no _adaptiveLevel tag');

        // ON: question should be tagged
        await page.evaluate(() => {
            window.toggleAdaptiveMode(); // back ON
            window.state.skill = 'add_facts';
            window.state.mapMode = false;
        });
        const qOn = await page.evaluate(() => {
            const out = window.generateQuestion();
            return {
                enabled: window.state.adaptiveModeEnabled,
                skill: window.state.skill,
                mapMode: window.state.mapMode,
                hasAdaptive: '_adaptiveLevel' in out,
                level: out._adaptiveLevel,
                text: out.text.slice(0, 60),
            };
        });
        log('q ON:', JSON.stringify(qOn));
        assert(qOn.hasAdaptive, 'ON: generated question has _adaptiveLevel tag');
        assert(qOn.level >= 1 && qOn.level <= 5, `_adaptiveLevel in [1,5] (got ${qOn.level})`);

        // Console errors gate
        if (consoleErrors.length > 0) {
            log('!!! console errors:');
            consoleErrors.forEach(e => log('   ', e));
            failures.push(`${consoleErrors.length} console errors`);
        }

        log('======== SUMMARY ========');
        log(`failures: ${failures.length}`);
        if (failures.length) {
            failures.forEach(f => log('  -', f));
            exitCode = 2;
            log('OVERALL: FAIL');
        } else {
            log('OVERALL: PASS');
        }
    } catch (err) {
        log('!!! TEST CRASHED:', err.stack || err.message);
        exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit(exitCode);
    }
})();
