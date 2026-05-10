// Phase 4.5 batch 3 verification: number-line-extended retrofit
// Boots gen-algebraic.js via dynamic ES-module import and exercises retrofitted skills.
//
// Validates each retrofitted skill:
//   - Generates 60 questions with normal Math.random
//   - Effective NLE variant rate is in [10, 50]% (chained gates can lower the apparent rate)
//   - For NLE variants: rangeMin < rangeMax, ans within range, tolerance > 0,
//     numberType set, printFormat is 'number-line-extended'
//   - Forced-original (Math.random >= 0.7) yields zero NLE variants
//
// Exit code 0 = all skills pass; 1 = any failure.

const path = require('path');
const url = require('url');

(async () => {
    const root = path.resolve(__dirname, 'js/modules/');
    const toUrl = (rel) => url.pathToFileURL(path.join(root, rel)).href;

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
    const algMod = await import(toUrl('gen-algebraic.js'));

    const state = stateMod.state;
    state.range = 1000;
    state.decimalPlaces = 0;
    state.selectedNumbers = [2, 3, 4, 5, 6, 7, 8, 9, 10];

    const helpers = {
        rng: (min, max) => utilsMod.randInt(min, max),
        range: state.range,
        applyDecimals: (n) => n,
        ensureTables: () => state.selectedNumbers
    };

    const skills = [
        { id: 'nearest_10', gen: algMod.generateRoundingQuestion },
        { id: 'nearest_100', gen: algMod.generateRoundingQuestion },
        { id: 'nearest_1000', gen: algMod.generateRoundingQuestion },
        { id: 'rounding_visual', gen: algMod.generateRoundingQuestion },
        { id: 'inequalities', gen: algMod.generateAlgebraQuestion },
    ];

    const N = 60;
    let totalFailures = 0;
    const lines = [];

    for (const s of skills) {
        let nleCount = 0;
        let normalCount = 0;
        let failures = 0;
        const failureMsgs = [];
        let normalAnswerType = null;

        for (let i = 0; i < N; i++) {
            const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
            try {
                s.gen(q, s.id, helpers);
            } catch (e) {
                failures++;
                if (failureMsgs.length < 3) failureMsgs.push('throw: ' + e.message);
                continue;
            }
            if (q.answerType === 'number-line-extended') {
                nleCount++;
                // Validate shape
                if (typeof q.rangeMin !== 'number' || typeof q.rangeMax !== 'number') {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('nle: rangeMin/rangeMax not numbers');
                    continue;
                }
                if (!(q.rangeMin < q.rangeMax)) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(`nle: rangeMin (${q.rangeMin}) !< rangeMax (${q.rangeMax})`);
                    continue;
                }
                if (typeof q.ans !== 'number') {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('nle: ans not a number (got ' + typeof q.ans + ')');
                    continue;
                }
                if (q.ans < q.rangeMin || q.ans > q.rangeMax) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(`nle: ans (${q.ans}) outside [${q.rangeMin}, ${q.rangeMax}]`);
                    continue;
                }
                if (typeof q.tolerance !== 'number' || !(q.tolerance > 0)) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(`nle: tolerance must be > 0 (got ${q.tolerance})`);
                    continue;
                }
                if (!q.numberType || typeof q.numberType !== 'string') {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('nle: numberType missing/not string');
                    continue;
                }
                if (q.printFormat !== 'number-line-extended') {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('nle: printFormat != "number-line-extended" (got ' + q.printFormat + ')');
                    continue;
                }
                if (typeof q.majorTickEvery !== 'number' || !(q.majorTickEvery > 0)) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(`nle: majorTickEvery must be > 0 (got ${q.majorTickEvery})`);
                    continue;
                }
            } else {
                normalCount++;
                if (normalAnswerType === null) normalAnswerType = q.answerType;
            }
        }

        // Forced-original: Math.random in [0.70, 1.0) — above all NLE 0.30 gates
        const realRandom = Math.random;
        Math.random = () => 0.70 + realRandom.call(Math) * 0.30;
        let originalFailures = 0;
        let originalNleCount = 0;
        try {
            for (let i = 0; i < 50; i++) {
                const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
                try {
                    s.gen(q, s.id, helpers);
                } catch (e) {
                    originalFailures++;
                    if (failureMsgs.length < 5) failureMsgs.push('original throw: ' + e.message);
                    continue;
                }
                if (q.answerType === 'number-line-extended') originalNleCount++;
            }
        } finally {
            Math.random = realRandom;
        }

        if (originalNleCount > 0) {
            failures += originalNleCount;
            failureMsgs.push(`forced-original: ${originalNleCount}/50 still produced number-line-extended`);
        }
        if (originalFailures > 0) {
            failures += originalFailures;
            failureMsgs.push(`forced-original: ${originalFailures} threw`);
        }

        // Variant rate sanity check: 10-50% (allow headroom for chained gates)
        const ratePct = (nleCount / N) * 100;
        if (nleCount > 0 && (ratePct < 10 || ratePct > 50)) {
            failures++;
            failureMsgs.push(`variant rate ${ratePct.toFixed(0)}% outside [10, 50]%`);
        }
        if (nleCount === 0) {
            failures++;
            failureMsgs.push('zero NLE variants in ' + N + ' samples (gate may be broken)');
        }

        const status = failures === 0 ? 'OK' : 'FAIL';
        lines.push(`${s.id}: ${N} generated, ${nleCount} NLE (${ratePct.toFixed(0)}%), ${normalCount} ${normalAnswerType || '?'} — ${status}` +
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
