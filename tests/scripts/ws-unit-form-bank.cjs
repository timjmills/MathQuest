// Owner bug (2026-11-15): "Value of a Digit in Unit Form" asked the pupil to TYPE the place word ("hundreds").
// Owner ruling: "I don't want students typing hundreds so either have them write 600 or 6 and then choose between words."
//
// On the practice card, over several seeds, placevalue:digit_value_unit_form must:
//   1. offer no typable box that expects a place word (the place box is read-only, filled from the bank);
//   2. draw the bank of place words as buttons at least 48 px tall and wide;
//   3. mark the right number + the right tapped word correct;
//   4. with option answerAs = value, give ONE number box that accepts the value (600);
//   5. show its "Here is how" steps and Say line with no "___" blank.
//
//   node tests/scripts/ws-unit-form-bank.cjs [--shots <dir>]
// Prints `ws-unit-form-bank: OK` or `FAIL` (exit 1).
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SHOTS = arg('shots', '');
const SEEDS = [3, 7, 11, 19, 42, 77];
const PLACE_WORD = /^(ones?|tens?|hundreds?|thousands?|ten thousands?|hundred thousands?|millions?)$/i;
const fails = [];
const fail = (m) => { fails.push(m); console.log('  FAIL ' + m); };

async function render(page, opts) {
    return page.evaluate((opts) => {
        const st = window.state;
        if (window.clearSetOptions) window.clearSetOptions({ silent: true });
        if (opts && window.setSetOptions) window.setSetOptions('placevalue', 'digit_value_unit_form', opts, { silent: true });
        st.category = 'placevalue'; st.skill = 'digit_value_unit_form'; st.range = 1000; st.decimalPlaces = 0;
        st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
        if (window.showView) window.showView('gameView');
        const q = window.generateQuestion();
        st.currentQ = q;
        window.renderQuestion();
        return { ans: q.ans, at: q.answerType, pv: q.pv };
    }, opts || null);
}

async function inspect(page) {
    return page.evaluate(async () => {
        const card = document.querySelector('#questionCard');
        const vis = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
        const inputs = Array.from(card.querySelectorAll('input')).filter(vis)
            .map((i) => ({ readOnly: i.readOnly, im: i.getAttribute('inputmode') || '', cls: i.className }));
        const tiles = Array.from(card.querySelectorAll('.mq-placetile')).filter(vis)
            .map((b) => { const r = b.getBoundingClientRect(); return { w: r.width, h: r.height, v: b.dataset.v }; });
        const sl = await import('/js/modules/support-ladder.js');
        const q = window.state.currentQ;
        const steps = sl.workedStepsFor(q, { cat: 'placevalue', skill: q.skillId || 'digit_value_unit_form' });
        const say = sl.sayFor(q, { cat: 'placevalue', skill: q.skillId || 'digit_value_unit_form' });
        return { inputs, tiles, steps, say };
    });
}

async function answer(page, num, word) {
    return page.evaluate(({ num, word }) => {
        const card = document.querySelector('#questionCard');
        const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const boxes = Array.from(card.querySelectorAll('#visualAid input.mq-cellslot')).filter(vis);
        const before = window.state.score;
        const typed = boxes.filter((b) => !b.readOnly);
        if (!typed.length) return { error: 'no typable box' };
        typed[0].value = String(num);
        typed[0].dispatchEvent(new Event('input', { bubbles: true }));
        if (word) {
            const tile = Array.from(card.querySelectorAll('.mq-placetile')).find((b) => b.dataset.v === word);
            if (!tile) return { error: 'no tile ' + word };
            tile.click();
        }
        if (!window.state.hasAnswered) window.submitAnswer();
        return { ok: window.state.score > before, boxes: boxes.length };
    }, { num, word });
}

(async () => {
    // a fresh page per item: a right answer starts the card's auto-advance, which would swap the item mid-check
    let page = null; let close = async () => {};
    const fresh = async (seed) => { await close(); ({ page, close } = await open({ seed })); };
    try {
        for (const seed of SEEDS) {
            await fresh(seed);
            const info = await render(page, null);
            await new Promise((r) => setTimeout(r, 200));
            const ins = await inspect(page);
            const tag = `seed ${seed} (${info.pv && info.pv.n}, ans "${info.ans}")`;
            // 1. no typable place-word box
            const [d, ...w] = String(info.ans).split(' ');
            const word = w.join(' ');
            const typable = ins.inputs.filter((i) => !i.readOnly && !/answer-input/.test(i.cls));
            if (typable.length !== 1) fail(`${tag}: ${typable.length} typable boxes in the cell (want 1: the number)`);
            if (!PLACE_WORD.test(word)) fail(`${tag}: answer is not number + place word`);
            // 2. the bank
            if (!ins.tiles.some((t) => t.v === word)) fail(`${tag}: no bank button "${word}" (bank: ${ins.tiles.map((t) => t.v).join('/') || 'none'})`);
            ins.tiles.forEach((t) => { if (t.h < 48 || t.w < 48) fail(`${tag}: bank button "${t.v}" is ${Math.round(t.w)}x${Math.round(t.h)} px (< 48)`); });
            // 5. help filled
            const help = ins.steps.join(' | ') + ' | Say: ' + ins.say;
            if (/_{2,}/.test(help)) fail(`${tag}: help has blanks: ${help}`);
            if (seed === SEEDS[0] && SHOTS) {
                await page.screenshot({ path: `${SHOTS}/unit-form-card.png`, fullPage: false, clip: await page.evaluate(() => { const r = document.querySelector('#questionCard').getBoundingClientRect(); return { x: r.x, y: r.y + window.scrollY, width: r.width, height: Math.min(r.height, 900) }; }) }).catch(() => {});
            }
            // 3. right number + right word is correct
            const res = await answer(page, d, ins.tiles.length ? word : null);
            if (res.error || !res.ok) fail(`${tag}: right answer ${d} + ${word} not marked correct (${res.error || 'wrong'})`);
            else console.log(`  ok ${tag}: help "${help}"`);
        }
        // 4. answerAs = value: one number box, accepts the value
        for (const seed of SEEDS.slice(0, 3)) {
            await fresh(seed);
            const info = await render(page, { form: 'unit', answerAs: 'value' });
            await new Promise((r) => setTimeout(r, 200));
            const tag = `value seed ${seed} (${info.pv && info.pv.n}, ans "${info.ans}")`;
            if (typeof info.ans !== 'number') { fail(`${tag}: answerAs value does not ask for the value`); continue; }
            const ins = await inspect(page);
            if (ins.tiles.length) fail(`${tag}: a word bank is shown`);
            if (/_{2,}/.test(ins.steps.join(' ') + ins.say)) fail(`${tag}: help has blanks`);
            if (seed === SEEDS[0] && SHOTS) {
                await page.screenshot({ path: `${SHOTS}/unit-form-value-option.png`, clip: await page.evaluate(() => { const r = document.querySelector('#questionCard').getBoundingClientRect(); return { x: r.x, y: r.y + window.scrollY, width: r.width, height: Math.min(r.height, 900) }; }) }).catch(() => {});
            }
            const ok = await page.evaluate((v) => {
                const inp = document.querySelector('#questionCard input:not([readonly])');
                const before = window.state.score;
                const all = Array.from(document.querySelectorAll('#questionCard input')).filter((i) => i.offsetWidth > 0);
                if (all.length !== 1) return { n: all.length };
                inp.value = String(v); inp.dispatchEvent(new Event('input', { bubbles: true }));
                if (!window.state.hasAnswered) window.submitAnswer();
                return { n: 1, ok: window.state.score > before };
            }, info.ans);
            if (ok.n !== 1) fail(`${tag}: ${ok.n} answer boxes (want 1)`);
            else if (!ok.ok) fail(`${tag}: ${info.ans} not marked correct`);
            else console.log(`  ok ${tag}`);
        }
        // 6. placevalue:identify, response bank: the place word is TAPPED into a read-only slot, never typed
        for (const seed of SEEDS.slice(0, 3)) {
            await fresh(seed);
            const r = await page.evaluate(() => {
                const st = window.state;
                window.clearSetOptions({ silent: true });
                window.setSetOptions('placevalue', 'identify', { response: 'bank' }, { silent: true });
                st.category = 'placevalue'; st.skill = 'identify'; st.range = 1000; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                window.showView('gameView');
                const q = window.generateQuestion(); st.currentQ = q; window.renderQuestion();
                return { ans: q.ans };
            });
            await new Promise((res) => setTimeout(res, 200));
            const tag = `identify bank seed ${seed} (ans "${r.ans}")`;
            const out = await page.evaluate((ans) => {
                const card = document.querySelector('#questionCard');
                const vis = (el) => el.offsetWidth > 0 && el.offsetHeight > 0;
                const typable = Array.from(card.querySelectorAll('input')).filter((i) => vis(i) && !i.readOnly);
                const tiles = Array.from(card.querySelectorAll('.mq-placetile')).filter(vis);
                const small = tiles.filter((b) => b.offsetHeight < 48 || b.offsetWidth < 48).map((b) => b.dataset.v);
                const tile = tiles.find((b) => b.dataset.v === ans);
                const before = window.state.score;
                if (tile) { tile.click(); if (!window.state.hasAnswered) window.submitAnswer(); }
                return { typable: typable.length, tiles: tiles.length, small, ok: window.state.score > before, hasTile: !!tile };
            }, r.ans);
            if (out.typable) fail(`${tag}: ${out.typable} typable box(es) for the place word`);
            if (!out.hasTile) fail(`${tag}: no bank button "${r.ans}" (${out.tiles} buttons)`);
            if (out.small.length) fail(`${tag}: bank buttons under 48 px: ${out.small.join(', ')}`);
            if (out.hasTile && !out.ok) fail(`${tag}: tapping "${r.ans}" not marked correct`);
            if (!out.typable && out.hasTile && out.ok && !out.small.length) console.log(`  ok ${tag}`);
        }
    } catch (e) { fail('error: ' + (e && e.stack || e)); }
    await close();
    console.log(fails.length ? 'ws-unit-form-bank: FAIL' : 'ws-unit-form-bank: OK');
    process.exit(fails.length ? 1 : 0);
})();
