// Phase 4.5 batch 5 verification: word-problem multi-select-check retrofit
// Boots gen-operations.js via dynamic import and exercises each retrofitted skill.
//
// Validates:
//   - Per skill: 60 generations show variant rate in [10%, 35%]
//   - Variant validation: answerType === 'multi-select-check', options non-empty,
//     ans is array of valid option IDs, every ans ID corresponds to a `correct: true` option,
//     options has at least one distractor (correct: false), printFormat === 'multi-select'
//   - Forced-original sweep (Math.random >= 0.5): 0 multi-select variants
//
// Exit code 0 = all pass; 1 = any failure.

const path = require('path');
const url = require('url');

(async () => {
    const root = path.resolve(__dirname, 'js/modules/');
    const toUrl = (rel) => url.pathToFileURL(path.join(root, rel)).href;

    // Minimal browser-environment shim
    if (typeof globalThis.window === 'undefined') globalThis.window = globalThis;
    if (typeof globalThis.localStorage === 'undefined') {
        const _store = new Map();
        globalThis.localStorage = {
            getItem: (k) => _store.has(k) ? _store.get(k) : null,
            setItem: (k, v) => _store.set(k, String(v)),
            removeItem: (k) => _store.delete(k),
            clear: () => _store.clear()
        };
    }
    if (typeof globalThis.document === 'undefined') {
        globalThis.document = {
            cookie: '',
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: () => ({ style: {}, classList: { add(){}, remove(){}, toggle(){} }, appendChild(){} }),
            addEventListener: () => {}
        };
    }

    const stateMod = await import(toUrl('state.js'));
    const utilsMod = await import(toUrl('utils.js'));
    const opsMod = await import(toUrl('gen-operations.js'));

    const state = stateMod.state;
    state.range = 100;
    state.decimalPlaces = 0;
    state.selectedNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];

    const helpers = {
        rng: (min, max) => utilsMod.randInt(min, max),
        range: state.range,
        applyDecimals: (n) => n,
        ensureTables: () => state.selectedNumbers
    };

    // All test skills exercise generateOperationsQuestion in gen-operations.js
    const skills = [
        { id: 'add_word_problems' },
        { id: 'sub_word_problems' },
        { id: 'mult_word_problems' },
        { id: 'div_word_problems' },
        { id: 'mult_comparison' },
        { id: 'comparison_word' },
    ];

    const N = 60;
    let totalFailures = 0;
    const lines = [];

    for (const s of skills) {
        let mscCount = 0;
        let normalCount = 0;
        let failures = 0;
        const failureMsgs = [];

        for (let i = 0; i < N; i++) {
            const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
            try {
                opsMod.generateOperationsQuestion(q, s.id, helpers);
            } catch (e) {
                failures++;
                if (failureMsgs.length < 3) failureMsgs.push('throw: ' + e.message);
                continue;
            }
            if (q.answerType === 'multi-select-check') {
                mscCount++;
                // Validate shape
                if (!Array.isArray(q.options) || q.options.length === 0) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('msc: empty options');
                    continue;
                }
                if (!Array.isArray(q.ans) || q.ans.length === 0) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('msc: empty ans');
                    continue;
                }
                if (q.ans.length >= q.options.length) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('msc: ans.length >= options.length (no distractors)');
                    continue;
                }
                const optMap = new Map(q.options.map(o => [o.id, o]));
                let badAns = false;
                for (const id of q.ans) {
                    const opt = optMap.get(id);
                    if (!opt) {
                        failures++;
                        if (failureMsgs.length < 3) failureMsgs.push('msc: ans id not in options: ' + id);
                        badAns = true;
                        break;
                    }
                    if (!opt.correct) {
                        failures++;
                        if (failureMsgs.length < 3) failureMsgs.push('msc: ans id has correct=false: ' + id);
                        badAns = true;
                        break;
                    }
                }
                if (badAns) continue;
                // Confirm derived correct === ans
                const derived = q.options.filter(o => o.correct).map(o => o.id).slice().sort();
                const ansSorted = q.ans.slice().sort();
                if (derived.length !== ansSorted.length || derived.some((v, i) => v !== ansSorted[i])) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(`msc: derived correct (${JSON.stringify(derived)}) != ans (${JSON.stringify(ansSorted)})`);
                    continue;
                }
                // Confirm at least one distractor (correct:false) exists
                const distractors = q.options.filter(o => !o.correct);
                if (distractors.length === 0) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('msc: no distractors present');
                    continue;
                }
                if (q.printFormat !== 'multi-select') {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('msc: printFormat != "multi-select" (got ' + q.printFormat + ')');
                    continue;
                }
                if (typeof q.text !== 'string' || !q.text.includes('Click ALL the numbers')) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('msc: text missing "Click ALL the numbers" prompt');
                    continue;
                }
            } else {
                normalCount++;
            }
        }

        // Variant rate must be ~10-35% (binomial spread for p=0.20 over n=60)
        const ratePct = (mscCount / N) * 100;
        if (ratePct < 10 || ratePct > 35) {
            failures++;
            failureMsgs.push(`variant rate ${ratePct.toFixed(0)}% outside [10%, 35%]`);
        }

        // Forced-original sweep: with Math.random in [0.5, 1.0), no variant should fire
        const realRandom = Math.random;
        Math.random = () => 0.50 + realRandom.call(Math) * 0.50;
        let originalFailures = 0;
        let originalMscCount = 0;
        try {
            for (let i = 0; i < 60; i++) {
                const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
                try {
                    opsMod.generateOperationsQuestion(q, s.id, helpers);
                } catch (e) {
                    originalFailures++;
                    if (failureMsgs.length < 5) failureMsgs.push('original throw: ' + e.message);
                    continue;
                }
                if (q.answerType === 'multi-select-check') originalMscCount++;
            }
        } finally {
            Math.random = realRandom;
        }

        if (originalMscCount > 0) {
            failures += originalMscCount;
            failureMsgs.push(`forced-original: ${originalMscCount}/60 still produced multi-select-check`);
        }
        if (originalFailures > 0) {
            failures += originalFailures;
            failureMsgs.push(`forced-original: ${originalFailures} threw`);
        }

        const status = failures === 0 ? 'OK' : 'FAIL';
        lines.push(`${s.id}: ${N} generated, ${mscCount} multi-select (${ratePct.toFixed(0)}%), ${normalCount} normal — ${status}` +
            (failures > 0 ? '\n    ' + failureMsgs.join('\n    ') : ''));
        totalFailures += failures;
    }

    console.log(lines.join('\n'));
    console.log('\nTotal failures across all skills: ' + totalFailures);
    process.exit(totalFailures === 0 ? 0 : 1);
})().catch(e => {
    console.error('Fatal error:', e);
    process.exit(2);
});
