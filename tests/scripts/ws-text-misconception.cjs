// ws-text-misconception - TEXT-MISC: a misconception a skill teaches only in TEXT (provider `wrongText`, contract
// OPTIONAL_MEMBERS) is really taught, and never drawn in a chart square (lead ruling 2026-11-13, chart_120: 'writes-ten-ten',
// 110 written 1010, was dropped from the chart squares because four digits printed '1,011' over the next square on True or
// False? L; the ruling re-scoped it to the screen practice card and Reason It's statements in words, not dropped).
//
//   node tests/scripts/ws-text-misconception.cjs --skill composing:chart_to_120 [--seeds 16] [--sizes S,L]
//   MQ_ROOT=<tree> judges another checkout (ws-backtest commit-pair rows)
//
// WHICH SKILLS: a design/cards/*/card.json misconception with `"textOnly": {"skills": [...]}` names the skills that MUST
// teach it (REACH judges required); any other skill that deals none is N/A on the two REACH judges (SQUARE always runs).
// THREE JUDGES (in the browser, the app's own modules):
//   REACH-SCREEN  over seeds 1..N, generateQuestionFor items: at least one has a provider wrongText(q), and EVERY such item's
//                 screen-card feedback (q.distractorTags) names its value, so a pupil who types it is told the error.
//   REACH-TEXT    over seeds 1..N, Reason It pages (window.buildSheet): at least one A / B pair is the text form
//                 (data-ws-misc="<the misconception>"), its wrong statement in words and its answer slot as wide as the value.
//   SQUARE        on every Reason It, Error analysis and True or False? page (pupil and key) of those seeds, no written number
//                 in a chart square (table.k2-chart [data-ws-slot]) has more digits than the window's widest number (its
//                 bottom-right square, read from the printed squares).
// Last line `ws-text-misconception: OK (...)` / `FAIL - ...`; exit 1 on FAIL, 2 on error.
const path = require('path');
const TOOL = 'ws-text-misconception';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

(async () => {
    const keys = list(arg('skill', arg('skills', '')));
    if (!keys.length) { console.log(`${TOOL}: FAIL - usage: --skill cat:skill[,..]`); process.exit(2); }
    const N = Number(arg('seeds', '16'));
    const sizes = list(arg('sizes', 'S,L'));
    // which skills MUST teach a text-only misconception: a card misconception marked `textOnly` names them (read from THIS
    // tree's cards, so a backtest judges an old app against today's ruling); for any other skill, none dealt is N/A
    const fs = require('fs');
    const cardsDir = path.join(__dirname, '..', '..', 'design', 'cards');
    const must = {};
    for (const d of fs.readdirSync(cardsDir)) {
        const f = path.join(cardsDir, d, 'card.json');
        if (!fs.existsSync(f)) continue;
        let c; try { c = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
        for (const m of c.misconceptions || []) if (m && m.textOnly) for (const k of m.textOnly.skills || []) (must[k] = must[k] || []).push(`${d} ${m.id}`);
    }
    const H = require('../lib/ws-harness.cjs');
    const app = await H.open({});
    let res;
    try {
        res = await app.page.evaluate(async ({ keys, N, sizes, must }) => {
            const gq = await import('/js/modules/generate-question.js');
            const sheet = await import('/js/modules/sheet/index.js');
            const out = [];
            for (const key of keys) {
                const [cat, id] = key.split(':');
                // REACH-SCREEN
                let withText = 0; const untagged = [];
                for (let s = 1; s <= N * 4; s++) {
                    let q;
                    try { q = gq.generateQuestionFor({ category: cat, skill: id, seed: 1000 + s, itemIndex: s }); } catch (e) { continue; }
                    if (!q) continue;
                    q.categoryId = q.categoryId || cat; q.skillId = q.skillId || id;
                    let w = null;
                    try { const p = sheet.getProvider(cat, id); w = typeof p.wrongText === 'function' ? p.wrongText(q) : null; } catch (e) { w = null; }
                    if (!w) continue;
                    withText++;
                    const tags = q.distractorTags || {};
                    if (!Object.prototype.hasOwnProperty.call(tags, String(w.value))) untagged.push(`${q.ans} (wrong ${w.value})`);
                }
                if (!withText && !must[key]) { out.push({ key, judge: 'REACH-SCREEN', ok: true, na: true, msg: 'N/A: no card names a text-only misconception for this skill, and none is dealt' }); }
                else out.push({ key, judge: 'REACH-SCREEN', ok: withText > 0 && !untagged.length,
                    msg: !withText ? `no item of ${N * 4} has a text-only wrong answer (provider wrongText): the misconception is taught nowhere` : untagged.length ? `${untagged.length} of ${withText} item(s) give no feedback for their text wrong answer, e.g. ${untagged.slice(0, 3).join('; ')}` : `${withText} of ${N * 4} items: the card names the text wrong answer` });
                // REACH-TEXT + SQUARE
                let pairs = 0, textPairs = 0; const miscs = new Set(); const squares = []; let pages = 0;
                for (const role of ['reason-it', 'error-analysis', 'true-false']) for (const size of sizes) for (let s = 1; s <= N; s++) {
                    let r;
                    try { r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: id }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed: 5000 + s, form: 'A', key: true, anchors: 'off' }); } catch (e) { continue; }
                    pages++;
                    for (const [side, html] of [['pupil', r.pupilHtml || ''], ['key', r.keyHtml || '']]) {
                        const doc = new DOMParser().parseFromString(html, 'text/html');
                        if (role === 'reason-it' && side === 'pupil') {
                            pairs += doc.querySelectorAll('.mq-ab').length;
                            for (const ab of doc.querySelectorAll('.mq-ab[data-ws-misc]')) { textPairs++; miscs.add(ab.getAttribute('data-ws-misc')); }
                        }
                        for (const t of doc.querySelectorAll('table.k2-chart')) {
                            // the window's widest number: its bottom-right square, read from any printed square (rows of ten)
                            const trs = [...t.querySelectorAll('tr')];
                            let topN = 0;
                            trs.forEach((tr, i) => [...tr.querySelectorAll('td')].forEach((td, j, row) => {
                                if (td.querySelector('[data-ws-slot]')) return;
                                const n = Number(td.textContent.replace(/[^0-9]/g, ''));
                                if (n) topN = Math.max(topN, n + (trs.length - 1 - i) * 10 + (row.length - 1 - j));
                            }));
                            const top = String(topN || '').length;
                            for (const sl of t.querySelectorAll('[data-ws-slot]')) {
                                const d = sl.textContent.replace(/[^0-9]/g, '');
                                if (top && d.length > top) squares.push(`${role} ${size} seed ${5000 + s} ${side}: ${sl.textContent.trim()} in a ${top}-digit square`);
                            }
                        }
                    }
                }
                if (!textPairs && !must[key]) out.push({ key, judge: 'REACH-TEXT', ok: true, na: true, msg: 'N/A: no card names a text-only misconception for this skill, and no pair states one' });
                else out.push({ key, judge: 'REACH-TEXT', ok: textPairs > 0, msg: textPairs ? `${textPairs} of ${pairs} Reason It pair(s) are statements in words (${[...miscs].join(', ')})` : `no Reason It pair of ${pairs} (${N} seeds x ${sizes.join('/')}) states a text-only misconception` });
                out.push({ key, judge: 'SQUARE', ok: !squares.length && pages > 0, msg: !pages ? 'no page built' : squares.length ? `${squares.length} written number(s) wider than their square, e.g. ${squares.slice(0, 3).join('; ')}` : `${pages} page(s): every written number fits its square` });
            }
            return out;
        }, { keys, N, sizes, must });
    } finally { await app.close(); }
    for (const r of res) console.log(`  ${r.ok ? 'ok  ' : 'FAIL'} ${r.key.padEnd(30)} ${r.judge.padEnd(13)} ${r.msg}`);
    const bad = res.filter((r) => !r.ok);
    console.log(bad.length ? `${TOOL}: FAIL - ${bad.length} judge(s): ${bad.map((r) => `${r.judge} ${r.key}`).join(', ')}` : `${TOOL}: OK (${res.length} judges on ${keys.length} skill(s))`);
    process.exit(bad.length ? 1 : 0);
})().catch((e) => { console.log(`${TOOL}: ${e && e.stack || e}`); console.log(`${TOOL}: FAIL - error`); process.exit(2); });
