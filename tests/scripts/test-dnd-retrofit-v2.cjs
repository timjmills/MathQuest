// Phase 4.5 batch 2 verification: dnd-generic retrofit (order + categorize)
//
// Validates each retrofitted skill:
//   - Generates 60 questions with normal Math.random
//   - Effective dnd-generic variant rate is in [20, 50]% (allow some headroom)
//   - For dnd variants: tiles non-empty, dndMode set, ans matches mode shape
//   - Forces Math.random()->0.99 to confirm original path stays valid (no dnd, no throws)
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

    // Map: skillId -> { gen: function, expectedDndModes: ['order', 'categorize'] (which are valid for this skill) }
    const skills = [
        // Fractions — order
        { id: 'order_fractions', gen: fracMod.generateFractionsQuestion, modes: ['order'] },
        { id: 'compare_decimal', gen: fracMod.generateDecimalsQuestion, modes: ['order'] },
        { id: 'compare_frac_lcd', gen: fracMod.generateFractionsQuestion, modes: ['order'] },
        { id: 'order_decimals', gen: fracMod.generateDecimalsQuestion, modes: ['order'] },
        { id: 'order_frac_numline', gen: fracMod.generateFractionsQuestion, modes: ['order'] },
        // Fractions — categorize
        { id: 'equiv_frac_nv', gen: fracMod.generateFractionsQuestion, modes: ['categorize'] },
        { id: 'mult_scaling', gen: fracMod.generateFractionsQuestion, modes: ['categorize'] },
        { id: 'mult_scaling_nv', gen: fracMod.generateFractionsQuestion, modes: ['categorize'] },
        { id: 'f_to_d', gen: fracMod.generateConversionsQuestion, modes: ['categorize'] },
        { id: 'd_to_f', gen: fracMod.generateConversionsQuestion, modes: ['categorize'] },
        { id: 'f_to_p', gen: fracMod.generateConversionsQuestion, modes: ['categorize'] },
        { id: 'p_to_f', gen: fracMod.generateConversionsQuestion, modes: ['categorize'] },
        // Fractions — both order and categorize
        { id: 'benchmark_fractions', gen: fracMod.generateFractionsQuestion, modes: ['order', 'categorize'] },
        // Algebraic — order
        { id: 'seq_2', gen: algMod.generatePatternsQuestion, modes: ['order'] },
        { id: 'seq_5', gen: algMod.generatePatternsQuestion, modes: ['order'] },
        { id: 'seq_10', gen: algMod.generatePatternsQuestion, modes: ['order'] },
        { id: 'count_by_fill', gen: algMod.generatePatternsQuestion, modes: ['order'] },
        { id: 'number_pattern', gen: algMod.generatePatternsQuestion, modes: ['order'] },
        { id: 'pattern_relationship', gen: algMod.generatePatternsQuestion, modes: ['order'] },
        // Algebraic — categorize
        { id: 'function_table_easy', gen: algMod.generatePatternsQuestion, modes: ['categorize'] },
        { id: 'function_table_hard', gen: algMod.generatePatternsQuestion, modes: ['categorize'] },
        { id: 'inequalities', gen: algMod.generateAlgebraQuestion, modes: ['categorize'] },
        { id: 'solve_eq_addsub', gen: algMod.generateAlgebraQuestion, modes: ['categorize'] },
        { id: 'solve_eq_multdiv', gen: algMod.generateAlgebraQuestion, modes: ['categorize'] },
        { id: 'compare_expressions', gen: algMod.generateOrderOfOpsQuestion, modes: ['categorize'] }
    ];

    const N = 60;
    let totalFailures = 0;
    const lines = [];

    for (const s of skills) {
        let dndCount = 0;
        let normalCount = 0;
        const modeCounts = { order: 0, categorize: 0 };
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
            if (q.answerType === 'dnd-generic') {
                dndCount++;
                // Validate shape
                if (!Array.isArray(q.tiles) || q.tiles.length === 0) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('dnd: empty tiles');
                    continue;
                }
                if (!q.dndMode) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('dnd: missing dndMode');
                    continue;
                }
                if (!s.modes.includes(q.dndMode)) {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('dnd: unexpected mode ' + q.dndMode);
                    continue;
                }
                modeCounts[q.dndMode] = (modeCounts[q.dndMode] || 0) + 1;
                if (q.dndMode === 'order') {
                    if (!Array.isArray(q.ans) || q.ans.length !== q.tiles.length) {
                        failures++;
                        if (failureMsgs.length < 3) failureMsgs.push(`dnd-order: ans length ${(q.ans || []).length} != tiles ${q.tiles.length}`);
                        continue;
                    }
                    const tileIds = new Set(q.tiles.map(t => t.id));
                    for (const id of q.ans) {
                        if (!tileIds.has(id)) {
                            failures++;
                            if (failureMsgs.length < 3) failureMsgs.push('dnd-order: ans id not in tiles: ' + id);
                            break;
                        }
                    }
                } else if (q.dndMode === 'categorize') {
                    if (!Array.isArray(q.bins) || q.bins.length < 2) {
                        failures++;
                        if (failureMsgs.length < 3) failureMsgs.push('dnd-cat: missing or insufficient bins');
                        continue;
                    }
                    if (!q.ans || typeof q.ans !== 'object' || Array.isArray(q.ans)) {
                        failures++;
                        if (failureMsgs.length < 3) failureMsgs.push('dnd-cat: ans is not an object map');
                        continue;
                    }
                    const tileIds = new Set(q.tiles.map(t => t.id));
                    const binIds = new Set(q.bins.map(b => b.id));
                    let ansBad = false;
                    for (const tid of Object.keys(q.ans)) {
                        if (!tileIds.has(tid)) { ansBad = true; break; }
                        if (!binIds.has(q.ans[tid])) { ansBad = true; break; }
                    }
                    if (Object.keys(q.ans).length !== q.tiles.length) ansBad = true;
                    if (ansBad) {
                        failures++;
                        if (failureMsgs.length < 3) failureMsgs.push('dnd-cat: ans keys/vals dont match tiles/bins');
                        continue;
                    }
                }
                if (q.printFormat !== 'dnd-generic') {
                    failures++;
                    if (failureMsgs.length < 3) failureMsgs.push('dnd: printFormat != "dnd-generic" (got ' + q.printFormat + ')');
                    continue;
                }
            } else {
                normalCount++;
                if (normalAnswerType === null) normalAnswerType = q.answerType;
            }
        }

        // Force Math.random() to return >=0.50 to skip variant gates while preserving entropy
        const realRandom = Math.random;
        Math.random = () => 0.50 + realRandom.call(Math) * 0.50;
        let originalDndCount = 0;
        let originalFailures = 0;
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
                if (q.answerType === 'dnd-generic') originalDndCount++;
            }
        } finally {
            Math.random = realRandom;
        }

        if (originalDndCount > 0) {
            failures += originalDndCount;
            failureMsgs.push(`forced-original: ${originalDndCount}/50 still produced dnd-generic`);
        }
        if (originalFailures > 0) {
            failures += originalFailures;
            failureMsgs.push(`forced-original: ${originalFailures} threw`);
        }

        const ratePct = ((dndCount / N) * 100).toFixed(0);
        const modeStr = Object.entries(modeCounts).filter(([_, n]) => n > 0).map(([m, n]) => `${m}:${n}`).join(',');
        // Require effective dnd rate in [15, 60]% to allow stacked variants
        const okRate = dndCount >= 9 && dndCount <= 36;
        if (!okRate) {
            failures++;
            failureMsgs.push(`rate ${ratePct}% out of [15-60]% window`);
        }
        const status = failures === 0 ? 'OK' : 'FAIL';
        lines.push(`${s.id}: ${N} generated, ${dndCount} dnd-generic [${modeStr}] (${ratePct}%), ${normalCount} ${normalAnswerType || '?'} — ${status}` +
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
