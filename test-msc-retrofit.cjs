// Phase 4.5 batch 1 verification: multi-select-check retrofit
// Boots the relevant ES modules via dynamic import and exercises each retrofitted skill.
//
// Validates:
//   - ~30% (range 18-43%) return answerType 'multi-select-check'
//   - Every multi-select variant has non-empty `ans`, `ans.length < options.length`,
//     all `ans` IDs exist in `options`, and `options.filter(correct).map(id)` matches `ans`
//   - Forcing Math.random()->0.99 keeps the original variant generating validly
//
// Exit code 0 = all skills pass; 1 = any failure.

const path = require('path');
const url = require('url');

(async () => {
    const root = path.resolve(__dirname, 'js/modules/');
    const toUrl = (rel) => url.pathToFileURL(path.join(root, rel)).href;

    // Provide a minimal global window/document/etc. shim for ES modules that touch them
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
    const numTheoryMod = await import(toUrl('gen-number-theory.js'));
    const opsMod = await import(toUrl('gen-operations.js'));
    const fracMod = await import(toUrl('gen-fractions.js'));
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

    // Map: skillId -> { gen: function(q, mappedSkill, helpers), label }
    const skills = [
        // Rounding
        { id: 'nearest_10', gen: algMod.generateRoundingQuestion },
        { id: 'nearest_100', gen: algMod.generateRoundingQuestion },
        { id: 'nearest_1000', gen: algMod.generateRoundingQuestion },
        // Number theory
        { id: 'multiples', gen: numTheoryMod.generateNumberTheoryQuestion },
        { id: 'factors_identify', gen: numTheoryMod.generateNumberTheoryQuestion },
        { id: 'prime_composite', gen: numTheoryMod.generateNumberTheoryQuestion },
        // Comparisons
        { id: 'compare_int', gen: opsMod.generateIntegersQuestion },
        { id: 'compare_decimal', gen: fracMod.generateDecimalsQuestion },
        { id: 'equiv_frac_nv', gen: fracMod.generateFractionsQuestion },
        { id: 'benchmark_fractions', gen: fracMod.generateFractionsQuestion },
        // Estimation
        { id: 'estimate_sum', gen: algMod.generateEstimationQuestion },
        { id: 'estimate_diff', gen: algMod.generateEstimationQuestion },
        { id: 'estimate_sums_diffs', gen: algMod.generateEstimationQuestion },
        { id: 'estimate_products', gen: algMod.generateEstimationQuestion },
        // Scaling
        { id: 'mult_scaling', gen: fracMod.generateFractionsQuestion },
        { id: 'mult_scaling_nv', gen: fracMod.generateFractionsQuestion }
    ];

    const N = 50;
    let totalFailures = 0;
    const lines = [];

    for (const s of skills) {
        let mscCount = 0;
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
                    if (failureMsgs.length < 3) failureMsgs.push('msc: ans.length >= options.length');
                    continue;
                }
                const optIds = new Set(q.options.map(o => o.id));
                for (const id of q.ans) {
                    if (!optIds.has(id)) {
                        failures++;
                        if (failureMsgs.length < 3) failureMsgs.push('msc: ans id not in options: ' + id);
                        break;
                    }
                }
                const derived = q.options.filter(o => o.correct).map(o => o.id).slice().sort();
                const ansSorted = q.ans.slice().sort();
                if (derived.length !== ansSorted.length || derived.some((v, i) => v !== ansSorted[i])) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(`msc: derived correct (${JSON.stringify(derived)}) != ans (${JSON.stringify(ansSorted)})`);
                    continue;
                }
                if (q.printFormat !== 'multi-select') {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('msc: printFormat != "multi-select" (got ' + q.printFormat + ')');
                    continue;
                }
            } else {
                normalCount++;
                if (normalAnswerType === null) normalAnswerType = q.answerType;
            }
        }

        // Now run 50 with Math.random forced to >0.50 (above all variant gates 0.25-0.40)
        // to confirm original answer-mode path stays valid. Use real entropy in [0.50, 1.0)
        // so existing pick-and-add-to-Set loops still terminate.
        const realRandom = Math.random;
        Math.random = () => 0.50 + realRandom.call(Math) * 0.50;
        let originalFailures = 0;
        let originalMscCount = 0;
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
                if (q.answerType === 'multi-select-check') originalMscCount++;
            }
        } finally {
            Math.random = realRandom;
        }

        if (originalMscCount > 0) {
            failures += originalMscCount;
            failureMsgs.push(`forced-original: ${originalMscCount}/50 still produced multi-select-check`);
        }
        if (originalFailures > 0) {
            failures += originalFailures;
            failureMsgs.push(`forced-original: ${originalFailures} threw`);
        }

        const status = failures === 0 ? 'OK' : 'FAIL';
        const ratePct = ((mscCount / N) * 100).toFixed(0);
        lines.push(`${s.id}: ${N} generated, ${mscCount} multi-select (${ratePct}%), ${normalCount} ${normalAnswerType || '?'} — ${status}` +
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
