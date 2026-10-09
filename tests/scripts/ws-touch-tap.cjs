// SUPPORTS.md S1.8: touch numerals are tappable on screen. Checks, in the real app:
//  - each NUMBER is one target of at least 44 x 44 px (a tap 21 px off its centre still lands on it)
//  - a tap counts the nearest mark with a touch left and greys it; a double takes two taps
//  - the running count shows under the cell ("Touched N"), "Start again" clears it
//  - keyboard: the number is a button, Enter counts the next mark in order
//   node tests/scripts/ws-touch-tap.cjs
const { open } = require('../lib/ws-harness.cjs');

(async () => {
    const { page, problems, close } = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const fails = [];
    const ok = (c, m) => { if (!c) fails.push(m); };
    try {
        await page.evaluate(async () => {
            const k = await import('./js/modules/sheet/index.js');
            const v = document.getElementById('gameView');
            v.style.display = 'block'; v.classList.add('active');
            const host = document.createElement('div');
            host.id = 'tt-host'; host.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647;background:#fff';
            host.innerHTML = `<div class="mq-scell" style="font-family:Andika;font-size:40px;padding:40px">`
                + `<span id="n7">${k.touchNumeralHTML('7', { em: 40, unit: 'px' })}</span> + `
                + `<span id="n12">${k.touchNumeralHTML('1', { em: 40, unit: 'px' })}${k.touchNumeralHTML('2', { em: 40, unit: 'px' })}</span></div>`;
            v.prepend(host);
            await document.fonts.ready;
        });
        await page.waitForFunction(() => document.querySelector('#n7 .ws-tn[data-mq-tn]'), { timeout: 5000 });
        const info = await page.evaluate(() => {
            document.getElementById('tt-host').scrollIntoView({ block: 'center' });
            const r = (s) => s.getBoundingClientRect();
            const a = r(document.querySelector('#n7 .ws-tn'));
            const t = document.querySelectorAll('#n12 .ws-tn');
            return {
                a: { x: a.left + a.width / 2, y: a.top + a.height / 2 },
                roles: [...document.querySelectorAll('#tt-host [role="button"]')].length,
                hidden2: t[1].getAttribute('aria-hidden'),
                label: document.querySelector('#n7 .ws-tn').getAttribute('aria-label'),
            };
        });
        ok(info.roles === 2, `one button per NUMBER (7 and 12): got ${info.roles}`);
        ok(info.hidden2 === 'true', 'the 2 of 12 is part of the 12 target');
        ok(/^7: 7 touch dots/.test(info.label || ''), `aria-label: ${info.label}`);
        // 44 px target: the point 21 px above / below the centre still hits the 7
        for (const dy of [-21, 21]) {
            const hit = await page.evaluate((x, y) => { const e = document.elementFromPoint(x, y); return !!(e && e.closest && e.closest('#n7 .ws-tn')); }, info.a.x, info.a.y + dy);
            ok(hit, `tap target reaches ${dy} px from the 7's centre`);
        }
        const greys = () => page.evaluate(() => [...document.querySelectorAll('#n7 g.ws-td-mark')].map((g) => [...g.querySelectorAll('circle')].map((c) => c.getAttribute('fill') === '#949494' || c.getAttribute('stroke') === '#949494' ? 1 : 0).reduce((s, v) => s + v, 0)));
        const said = () => page.evaluate(() => { const b = document.querySelector('#tt-host .mq-tn-count .mq-tn-said'); return b ? b.textContent : null; });
        for (let i = 0; i < 7; i++) await page.mouse.click(info.a.x, info.a.y);
        const g = await greys();
        ok(g.reduce((s, v) => s + v, 0) === 7, `7 taps grey 7 touches: ${JSON.stringify(g)}`);
        ok((await said()) === 'Touched 7', `count line: ${await said()}`);
        await page.mouse.click(info.a.x, info.a.y);
        ok((await said()) === 'Touched 7', 'an 8th tap on a fully counted 7 counts nothing');
        await page.click('#tt-host .mq-tn-reset');
        ok((await greys()).every((v) => v === 0), 'Start again clears every mark');
        ok((await said()) === null, 'Start again removes the count line');
        await page.focus('#n12 .ws-tn[role="button"]');
        for (let i = 0; i < 3; i++) await page.keyboard.press('Enter');
        ok((await said()) === 'Touched 3', `Enter counts the 12's marks in order: ${await said()}`);
    } catch (e) {
        fails.push(String(e && e.stack || e));
    } finally {
        await close();
    }
    if (problems.length) fails.push('console: ' + JSON.stringify(problems.slice(0, 3)));
    fails.forEach((f) => console.log('  ' + f));
    console.log(`ws-touch-tap: ${fails.length ? 'FAIL' : 'OK'}`);
    process.exit(fails.length ? 1 : 0);
})();
