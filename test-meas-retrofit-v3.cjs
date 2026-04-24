// Phase 4.5 batch 13 verification: variants on non-time measurement skills.
//
// Validates each retrofitted skill in gen-measurement.js:
//   - 60 generations under normal Math.random — variant rate in [10, 50]%
//   - Each variant has the correct shape:
//       multi-select-check: options[].id/label/correct, ans = filter(correct).map(id),
//                           printFormat 'multi-select', skillLabel non-empty
//       dnd-generic categorize: dndMode 'categorize', tiles[]/bins[], ans is map of tileId -> binId,
//                               printFormat 'dnd-generic', skillLabel non-empty
//   - Forced-original sweep (Math.random ∈ [0.70, 1.00)) yields zero variants
//
// Exit code 0 = all pass; 1 = any failure.

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
    const measMod = await import(toUrl('gen-measurement.js'));

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

    // Skills retrofitted in batch 11 + batch 13.
    // Each entry lists which variants are *expected* for that skill.
    // 'msc' = multi-select-check, 'dnd' = dnd-generic (categorize)
    const skills = [
        // Already shipped in batch 11:
        { id: 'temperature',         expects: ['msc', 'dnd'] },
        { id: 'capacity',            expects: ['msc', 'dnd'] },
        { id: 'mass_volume_liquid',  expects: ['msc', 'dnd'] },
        // New in batch 13:
        { id: 'estimate_length',     expects: ['msc', 'dnd'] },
        { id: 'unit_conversions',    expects: ['msc'] },
        { id: 'money_count',         expects: ['msc'] },
        { id: 'money',               expects: ['msc'] }
    ];

    const N = 60;
    let totalFailures = 0;
    const lines = [];

    function validateMSC(q) {
        if (!Array.isArray(q.options) || q.options.length === 0) return 'msc: empty options';
        if (!Array.isArray(q.ans) || q.ans.length === 0) return 'msc: empty ans';
        if (q.ans.length >= q.options.length) return 'msc: ans.length >= options.length';
        const optIds = new Set(q.options.map(o => o.id));
        for (const id of q.ans) {
            if (!optIds.has(id)) return 'msc: ans id not in options: ' + id;
        }
        const derived = q.options.filter(o => o.correct).map(o => o.id).slice().sort();
        const ansSorted = q.ans.slice().sort();
        if (derived.length !== ansSorted.length || derived.some((v, i) => v !== ansSorted[i])) {
            return `msc: derived correct (${JSON.stringify(derived)}) != ans (${JSON.stringify(ansSorted)})`;
        }
        if (q.printFormat !== 'multi-select') return 'msc: printFormat != "multi-select" (got ' + q.printFormat + ')';
        if (typeof q.skillLabel !== 'string' || !q.skillLabel) return 'msc: empty skillLabel';
        if (typeof q.text !== 'string' || !q.text) return 'msc: empty text';
        return null;
    }
    function validateDnd(q) {
        if (q.dndMode !== 'categorize') return 'dnd: dndMode != categorize';
        if (!Array.isArray(q.tiles) || q.tiles.length === 0) return 'dnd: empty tiles';
        if (!Array.isArray(q.bins) || q.bins.length < 2) return 'dnd: bins missing/too few';
        if (typeof q.ans !== 'object' || q.ans === null) return 'dnd: ans not object';
        const tileIds = new Set(q.tiles.map(t => t.id));
        const binIds = new Set(q.bins.map(b => b.id));
        for (const tid of Object.keys(q.ans)) {
            if (!tileIds.has(tid)) return 'dnd: ans tile id not in tiles: ' + tid;
            if (!binIds.has(q.ans[tid])) return 'dnd: ans bin id not in bins: ' + q.ans[tid];
        }
        if (q.printFormat !== 'dnd-generic') return 'dnd: printFormat != "dnd-generic" (got ' + q.printFormat + ')';
        if (typeof q.skillLabel !== 'string' || !q.skillLabel) return 'dnd: empty skillLabel';
        return null;
    }

    for (const s of skills) {
        let mscCount = 0;
        let dndCount = 0;
        let originalCount = 0;
        let failures = 0;
        const failureMsgs = [];

        for (let i = 0; i < N; i++) {
            const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
            try {
                measMod.generateMeasurementQuestion(q, s.id, helpers);
            } catch (e) {
                failures++;
                if (failureMsgs.length < 3) failureMsgs.push('throw: ' + e.message);
                continue;
            }
            if (q.answerType === 'multi-select-check') {
                mscCount++;
                const err = validateMSC(q);
                if (err) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(err);
                }
            } else if (q.answerType === 'dnd-generic') {
                dndCount++;
                const err = validateDnd(q);
                if (err) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push(err);
                }
            } else {
                originalCount++;
            }
        }

        const variantCount = mscCount + dndCount;
        const variantRate = variantCount / N;
        // For skills with both variants, expected combined rate is ~1 - 0.75*0.80 = 0.40, accept [25%, 60%].
        // For skills with msc only, expected ~25%, accept [10%, 45%].
        const both = s.expects.includes('msc') && s.expects.includes('dnd');
        let lo = 0.10, hi = 0.45;
        if (both) { lo = 0.20; hi = 0.65; }
        if (variantRate < lo || variantRate > hi) {
            failures++;
            failureMsgs.push(`variant rate ${(variantRate*100).toFixed(0)}% outside [${(lo*100)|0}%, ${(hi*100)|0}%]`);
        }
        if (s.expects.includes('msc') && mscCount === 0) {
            failures++;
            failureMsgs.push('expected multi-select-check variant, none observed');
        }
        if (s.expects.includes('dnd') && dndCount === 0) {
            failures++;
            failureMsgs.push('expected dnd-generic variant, none observed');
        }

        // Forced-original sweep: Math.random returns [0.70, 1.0)
        const realRandom = Math.random;
        Math.random = () => 0.70 + realRandom.call(Math) * 0.30;
        let originalThrows = 0;
        let originalVariantsLeak = 0;
        try {
            for (let i = 0; i < 50; i++) {
                const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
                try {
                    measMod.generateMeasurementQuestion(q, s.id, helpers);
                } catch (e) {
                    originalThrows++;
                    if (failureMsgs.length < 5) failureMsgs.push('original throw: ' + e.message);
                    continue;
                }
                if (q.answerType === 'multi-select-check' || q.answerType === 'dnd-generic') {
                    originalVariantsLeak++;
                }
            }
        } finally {
            Math.random = realRandom;
        }

        if (originalVariantsLeak > 0) {
            failures += originalVariantsLeak;
            failureMsgs.push(`forced-original: ${originalVariantsLeak}/50 still produced a variant`);
        }
        if (originalThrows > 0) {
            failures += originalThrows;
            failureMsgs.push(`forced-original: ${originalThrows} threw`);
        }

        const status = failures === 0 ? 'OK' : 'FAIL';
        const ratePct = ((variantCount / N) * 100).toFixed(0);
        const breakdown = `msc=${mscCount}, dnd=${dndCount}, orig=${originalCount}`;
        lines.push(`${s.id}: ${N} generated, ${variantCount} variant (${ratePct}%) [${breakdown}] — ${status}` +
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
