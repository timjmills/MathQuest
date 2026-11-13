#!/usr/bin/env node
// ws-words-checks — the number-name provider holds to what its pages print (lf-placevalue critic nwf r1, owner 2026-11-09
// "every finding a check"). Node only: the items come from generateQuestionFor (seeded), the provider from the kit registry.
//
//   node tests/scripts/ws-words-checks.mjs                  # composing:number_word_form, 120 items a band, every band
//   node tests/scripts/ws-words-checks.mjs --n 60
//
// WORDS-WRONG-RATE (N1): on every band (20 / 100 / 1,000) at least a third of the words-to-numeral items get a wrong answer that
//   is a NAMED error (not the registry's near-miss nudge) - a band with none prints a True or False? page that is all True and a Reason It page of one item.
// WORDS-STEPS-TRUE (N3): every quoted phrase of a worked step ("...") is part of the item's own name - "thirty-five hundred" for
//   35 was a false step on the model, the Guided hints and the lesson's Steps strip.
// WORDS-STEPS-PLURAL (N12): no worked step counts one of a place in the plural ("3 tens, 1 ones"), with the answer line and with
//   the H T O boxes (answerSlot hto).
// Prints `ws-words-checks: OK` / `FAIL (n)`; exits 1 on FAIL.
import { loadApp, fnv } from './ws-card-rulings.mjs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const N = parseInt(arg('n', '120'), 10);
const KEY = 'composing:number_word_form';
const quiet = () => { const s = {}; for (const k of ['log', 'warn', 'info', 'debug']) { s[k] = console[k]; console[k] = () => {}; } return () => Object.assign(console, s); };

const ROOT = resolve(arg('root', resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')));
const app = await loadApp(ROOT);
// (the kit registry of the SAME tree loadApp read - the providers register on its module graph)
const { getProvider } = await import(new URL(`file://${ROOT}/js/modules/sheet/index.js`).href);
const prov = getProvider('composing', 'number_word_form');   // (category and skill: one string matched no provider and read the defaults)
const bad = [];
if (!prov || !(prov.real || []).includes('wrongAnswer')) bad.push(`no REAL provider wrongAnswer registered for ${KEY} (the defaults would be read)`);
for (const band of [20, 100, 1000]) {
    let withWrong = 0, judged = 0;
    for (let i = 0; i < N && prov; i++) {
        const un = quiet();
        let q = null;
        try { q = app.gq.generateQuestionFor({ category: 'composing', skill: 'number_word_form', opts: { wordform: ['to_number'], band }, seed: (fnv(KEY) + band + i) >>> 0, itemIndex: i, itemCount: N }); } catch (e) { q = null; } finally { un(); }
        if (!q || !q.pv) continue;
        judged++;
        let w = null; try { w = prov.wrongAnswer ? prov.wrongAnswer(q) : null; } catch (e) { w = null; }
        const v = w && typeof w === 'object' ? w.value : w;
        // (a NAMED error only: the registry falls back to a near-miss nudge, misconceptionBased false, which is not a misconception)
        if (v !== null && v !== undefined && String(v) !== String(q.ans) && w.misconceptionBased !== false) withWrong++;
        let steps = []; try { steps = prov.workedSteps ? prov.workedSteps(q) : []; } catch (e) { steps = []; }
        for (const s of steps || []) {
            const text = String((s && (s.text || s.label || s.say)) || '');
            for (const m of text.matchAll(/"([^"]+)"/g)) {
                if (!String(q.pv.words).includes(m[1])) bad.push(`WORDS-STEPS-TRUE band ${band} item ${i} (${q.pv.n}): step quotes "${m[1]}", not part of "${q.pv.words}"`);
            }
        }
    }
    if (judged && withWrong < judged / 3) bad.push(`WORDS-WRONG-RATE band ${band}: ${withWrong} of ${judged} items have a wrong answer (want at least a third)`);
    console.log(`band ${band}: ${judged} items, ${withWrong} with a wrong answer`);
}
// WORDS-STEPS-PLURAL (critic nwf r2 / r3 N12): a worked step never counts ONE of a place in the plural ("3 tens, 1 ones") - every
// band, the default answer line and the H T O boxes (answerSlot hto: the lesson's model, its Steps band and its key)
for (const band of [20, 100, 1000]) for (const answerSlot of ['line', 'hto']) {
    let plural = 0, seen = 0;
    for (let i = 0; i < N && prov; i++) {
        const un = quiet();
        let q = null;
        try { q = app.gq.generateQuestionFor({ category: 'composing', skill: 'number_word_form', opts: { wordform: ['to_number'], band, answerSlot }, seed: (fnv(KEY) + band + i) >>> 0, itemIndex: i, itemCount: N }); } catch (e) { q = null; } finally { un(); }
        if (!q || !q.pv) continue;
        let steps = []; try { steps = prov.workedSteps ? prov.workedSteps(q) : []; } catch (e) { steps = []; }
        for (const st of steps || []) {
            const text = String((st && (st.text || st.label || st.say)) || '');
            seen++;
            const m = /\b1 (ones|tens|hundreds|thousands)\b/.exec(text);
            if (m && plural++ < 2) bad.push(`WORDS-STEPS-PLURAL band ${band} ${answerSlot} item ${i} (${q.pv.n}): "${text}" counts 1 of a place in the plural ("1 ${m[1]}")`);
        }
    }
    if (plural > 2) bad.push(`WORDS-STEPS-PLURAL band ${band} ${answerSlot}: ${plural} plural steps in all`);
    console.log(`band ${band} ${answerSlot}: ${seen} steps read, ${plural} with "1 ones / tens / hundreds"`);
}
for (const b of bad.slice(0, 12)) console.log(`  FAIL ${b}`);
console.log(`ws-words-checks: ${bad.length ? `FAIL (${bad.length})` : 'OK'}`);
process.exit(bad.length ? 1 : 0);
