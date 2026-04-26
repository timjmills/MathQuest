// Verify dnd-generic + coord-plot + place-symmetry-lines actually respond to clicks/drags.
const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    page.on('dialog', async d => { try { await d.accept(); } catch {} });
    const errors = [];
    page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

    await page.goto('http://localhost:8088/index.html', { waitUntil: 'networkidle0', timeout: 30000 });
    await page.evaluate(() => new Promise(r => {
        const t = setInterval(() => { if (window.state && window.generateQuestion) { clearInterval(t); r(); } }, 50);
    }));
    await page.evaluate(() => { window.state.userRole = 'teacher'; });

    async function setupSkill(skill, cat, variant) {
        return await page.evaluate(({ skill, cat, variant }) => {
            window.state.skill = skill;
            window.state.category = cat;
            if (variant) window.pickVariant = () => variant;
            const q = window.generateQuestion();
            if (!q) return { ok: false, why: 'no q' };
            window.state.currentQ = q;
            window.state.gameStarted = true;
            window.showView('gameView');
            window.renderQuestion();
            return { ok: true, type: q.answerType };
        }, { skill, cat, variant });
    }

    // ---- Test 1: dnd-generic categorize via click-to-select fallback ----
    const dndSetup = await setupSkill('round_sort_10', 'rounding', null);
    console.log('dnd setup:', JSON.stringify(dndSetup));
    await new Promise(r => setTimeout(r, 800));
    const dndOk = await page.evaluate(() => {
        const host = document.querySelector('.dnd-host');
        if (!host) return { ok: false, why: 'no host' };
        const tile = host.querySelector('.dnd-tile');
        const bin = host.querySelector('.dnd-bin');
        if (!tile || !bin) return { ok: false, why: 'no tile/bin', tile: !!tile, bin: !!bin };
        // Click tile then click bin
        tile.click();
        const wasActive = tile.classList.contains('tile-active');
        bin.click();
        const placedInBin = bin.querySelector('.dnd-tile') === tile;
        return { ok: wasActive && placedInBin, wasActive, placedInBin };
    });
    console.log('dnd-generic click-and-click:', JSON.stringify(dndOk));

    // ---- Test 2: coord-plot click hit ----
    const cpSetup = await setupSkill('coordinate_q1', 'coordinates', 'plot');
    console.log('cp setup:', JSON.stringify(cpSetup));
    await new Promise(r => setTimeout(r, 800));
    const cpOk = await page.evaluate(() => {
        const hit = document.querySelector('.cp-hit');
        if (!hit) return { ok: false, why: 'no hit target' };
        // Click should toggle a dot
        hit.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const dotCount = document.querySelectorAll('.cp-dot').length;
        return { ok: dotCount > 0, dotCount };
    });
    console.log('coord-plot click:', JSON.stringify(cpOk));

    // ---- Test 3: pv-disks-build wrong-zone reject ----
    await page.evaluate(() => { window.pickVariant = null; });
    const pvSetup = await setupSkill('pv_disks_build', 'placevalue', null);
    console.log('pv setup:', JSON.stringify(pvSetup));
    await new Promise(r => setTimeout(r, 800));
    const pvOk = await page.evaluate(() => {
        const disk = document.querySelector('.pvb-palette-disk');
        const zones = document.querySelectorAll('.pvb-zone');
        if (!disk || zones.length < 2) return { ok: false, why: 'no disk/zones', disk: !!disk, zones: zones.length };
        const diskPlace = disk.dataset.place;
        let wrongZone = null;
        zones.forEach(z => { if (z.dataset.place !== diskPlace && !wrongZone) wrongZone = z; });
        if (!wrongZone) return { ok: false, why: 'no wrong zone' };
        // Simulate click pickup + click wrong zone
        disk.click();
        wrongZone.click();
        const rejected = wrongZone.classList.contains('pvb-zone-reject');
        const childDisks = wrongZone.querySelectorAll('.pvb-zone-stack .pvb-disk');
        // Now click the right zone
        let rightZone = null;
        zones.forEach(z => { if (z.dataset.place === diskPlace) rightZone = z; });
        rightZone.click();
        const placedCorrectly = rightZone.querySelectorAll('.pvb-zone-stack .pvb-disk').length;
        return { ok: rejected && childDisks.length === 0 && placedCorrectly > 0, rejected, wrongZoneDisks: childDisks.length, placedCorrectly };
    });
    console.log('pv-disks wrong-zone reject:', JSON.stringify(pvOk));

    // ---- Test 4: place-symmetry-lines toggle ----
    const psSetup = await setupSkill('place_symmetry_lines', 'angles_lines', null);
    console.log('psl setup:', JSON.stringify(psSetup));
    await new Promise(r => setTimeout(r, 800));
    const psOk = await page.evaluate(() => {
        const cand = document.querySelector('.psl-cand');
        if (!cand) return { ok: false, why: 'no candidate' };
        cand.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const isSelected = cand.classList.contains('selected');
        return { ok: isSelected, classList: Array.from(cand.classList) };
    });
    console.log('place-symmetry-lines toggle:', JSON.stringify(psOk));

    console.log('errors:', errors.length);
    errors.slice(0, 5).forEach(e => console.log(' ', e));
    await browser.close();
    process.exit(0);
})();
