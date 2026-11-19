#!/usr/bin/env node
// ws-fixit-words — does an error-analysis Fix-it frame use the SAME words as the frame the pupil wrote in? (lf-placevalue critic
// r3b G5, owner 2026-11-09 "every finding a check": the Fix-it words of a place-value words frame were glued from the answer,
// "1 hundred 9 tens 3 ones", so the pupil page printed "[ ] hundred" and the singular word told the pupil the answer was 1.)
//
//   node tests/scripts/ws-fixit-words.cjs --skills placevalue:unit_form            # error-analysis at S / M / L, seed 7
//   node tests/scripts/ws-fixit-words.cjs --skills a:b --sizes S --seed 11
//
// FIX-WORDS: on each error-analysis cell whose finished work is an "N = ..." words frame, the words after "Fix it" (letters only)
// must equal the words of the frame the pupil wrote in, in order. A word the frame does not print - a singular where the frame is
// plural - is a giveaway. Cells with no "=" frame or no "Fix it" are not judged. Prints `ws-fixit-words: OK` / `FAIL (n)`.
const { open } = require('../lib/ws-harness.cjs');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SKILLS = String(arg('skills', arg('skill', 'placevalue:unit_form'))).split(',').map((x) => x.trim()).filter(Boolean);
const SIZES = String(arg('sizes', 'M,L')).split(','); // owner 2026-11-13: sizes M and L (S dropped; an explicit S still runs)
const SEED = parseInt(arg('seed', '7'), 10);

(async () => {
    const { browser, page } = await open();
    let bad = 0, judged = 0;
    try {
        await page.waitForFunction(() => typeof window.buildSheet === 'function', { timeout: 60000 });
        for (const key of SKILLS) for (const size of SIZES) {
            const [categoryId, skillId] = key.split(':');
            const cells = await page.evaluate(async ({ categoryId, skillId, size, SEED }) => {
                const r = await window.buildSheet({ role: 'error-analysis', sections: [{ skills: [{ categoryId, skillId }] }], size, seed: SEED, key: false });
                const d = document.createElement('div'); d.innerHTML = r.pupilHtml;
                // (the text nodes joined by spaces: a detached page has no layout, so innerText runs the words of adjacent boxes together)
                return [...d.querySelectorAll('.ws-cell')].map((c) => { const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); const out = []; while (w.nextNode()) out.push(w.currentNode.nodeValue); return out.join(' '); });
            }, { categoryId, skillId, size, SEED });
            const words = (t) => (String(t).match(/[A-Za-z]+/g) || []);
            cells.forEach((t, i) => {
                const txt = String(t).replace(/\s+/g, ' ');
                const fi = txt.search(/Fix it/);
                const eq = txt.indexOf('=');
                if (fi < 0 || eq < 0 || eq > fi) return;
                const wrote = words(txt.slice(eq + 1, fi)).filter((w) => !/^(Correct|Wrong|Right)$/i.test(w));
                const fix = words(txt.slice(fi + 6));
                if (!wrote.length || !fix.length) return;
                judged++;
                if (wrote.join(' ') !== fix.slice(0, wrote.length).join(' ')) {
                    bad++;
                    console.log(`  FAIL FIX-WORDS ${key} error-analysis ${size} cell ${i + 1}: wrote in "${wrote.join(' ')}", Fix it prints "${fix.join(' ')}"`);
                }
            });
        }
    } finally { await browser.close(); }
    console.log(`(${SKILLS.length} skill(s), ${SIZES.length} size(s), ${judged} cell(s) judged)`);
    console.log(`ws-fixit-words: ${bad ? `FAIL (${bad})` : 'OK'}`);
    process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); console.log('ws-fixit-words: FAIL (error)'); process.exit(1); });
