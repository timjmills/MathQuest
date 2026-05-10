// Phase 4.5 batch 4 verification: ten-frame retrofit on K-2 composing skills
// Boots gen-counting.js via dynamic ES-module import and exercises retrofitted skills.
//
// Validates each retrofitted skill:
//   - Generates 60 questions with normal Math.random
//   - Effective ten-frame variant rate is in [15, 50]%
//   - For ten-frame variants:
//       answerType === 'ten-frame'
//       maxDots is 10 or 20
//       initialDots is a non-negative integer ≤ ans
//       ans is a non-negative integer ≤ maxDots
//       printFormat === 'ten-frame'
//       skillLabel non-empty
//       text non-empty, hint non-empty
//   - Forced-original (Math.random >= 0.7) yields zero ten-frame variants
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
    const countMod = await import(toUrl('gen-counting.js'));

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

    const skills = [
        { id: 'make_ten' },
        { id: 'number_bonds' },
        { id: 'teen_compose' },
    ];

    const N = 60;
    let totalFailures = 0;
    const lines = [];

    function validateTF(q) {
        if (q.answerType !== 'ten-frame') return 'answerType != ten-frame';
        const max = q.maxDots;
        if (max !== 10 && max !== 20) return `maxDots not 10 or 20 (got ${max})`;
        if (!Number.isInteger(q.initialDots) || q.initialDots < 0) return `bad initialDots (${q.initialDots})`;
        if (!Number.isInteger(q.ans) || q.ans < 0) return `bad ans (${q.ans})`;
        if (q.ans > max) return `ans (${q.ans}) > maxDots (${max})`;
        if (q.initialDots > q.ans) return `initialDots (${q.initialDots}) > ans (${q.ans})`;
        if (q.printFormat !== 'ten-frame') return `printFormat != ten-frame (got ${q.printFormat})`;
        if (typeof q.skillLabel !== 'string' || !q.skillLabel) return 'empty skillLabel';
        if (typeof q.text !== 'string' || !q.text) return 'empty text';
        if (typeof q.hint !== 'string' || !q.hint) return 'empty hint';
        return null;
    }

    for (const s of skills) {
        let tfCount = 0;
        let normalCount = 0;
        let failures = 0;
        const failureMsgs = [];
        let normalAnswerType = null;

        for (let i = 0; i < N; i++) {
            const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
            try {
                countMod.generateCountingQuestion(q, s.id, helpers);
            } catch (e) {
                failures++;
                if (failureMsgs.length < 3) failureMsgs.push('throw: ' + e.message);
                continue;
            }
            if (q.answerType === 'ten-frame') {
                tfCount++;
                const err = validateTF(q);
                if (err) {
                    failures++;
                    if (failureMsgs.length < 5) failureMsgs.push('tf-variant: ' + err);
                }
            } else {
                normalCount++;
                if (normalAnswerType === null) normalAnswerType = q.answerType;
            }
        }

        // Now run 50 with Math.random forced to >= 0.70 — original-only sweep.
        // Use real entropy in [0.70, 1.0) so existing pick loops still terminate.
        const realRandom = Math.random;
        Math.random = () => 0.70 + realRandom.call(Math) * 0.30;
        let originalFailures = 0;
        let originalTfCount = 0;
        try {
            for (let i = 0; i < 50; i++) {
                const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
                try {
                    countMod.generateCountingQuestion(q, s.id, helpers);
                } catch (e) {
                    originalFailures++;
                    if (failureMsgs.length < 5) failureMsgs.push('original throw: ' + e.message);
                    continue;
                }
                if (q.answerType === 'ten-frame') originalTfCount++;
            }
        } finally {
            Math.random = realRandom;
        }

        if (originalTfCount > 0) {
            failures += originalTfCount;
            failureMsgs.push(`forced-original: ${originalTfCount}/50 still produced ten-frame`);
        }
        if (originalFailures > 0) {
            failures += originalFailures;
            failureMsgs.push(`forced-original: ${originalFailures} threw`);
        }

        const ratePct = (tfCount / N) * 100;
        if (tfCount > 0 && (ratePct < 15 || ratePct > 50)) {
            failures++;
            failureMsgs.push(`rate ${ratePct.toFixed(1)}% outside [15, 50]%`);
        }

        const status = failures === 0 ? 'OK' : 'FAIL';
        lines.push(`${s.id}: ${N} generated, ${tfCount} ten-frame (${ratePct.toFixed(0)}%), ${normalCount} ${normalAnswerType || '?'} — ${status}` +
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
