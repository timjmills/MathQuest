// Bug repro: bar_graph / pictograph / tally_chart multi-select-check variants
// emit q.options as objects, but generate-question.js post-strips them because
// `hasNonNumericOptions` only sees STRING elements (not objects with non-numeric labels).
//
// This test goes through the full generateQuestion() pipeline (not the direct
// gen-data-stats.js synthetic-only path) to surface the regression.

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
    const genMod = await import(toUrl('generate-question.js'));

    const state = stateMod.state;
    state.range = 100;
    state.decimalPlaces = 0;

    const skills = [
        { id: 'bar_graph', category: 'data_stats' },
        { id: 'pictograph', category: 'data_stats' },
        { id: 'tally_chart', category: 'data_stats' },
    ];

    const N = 200;
    let totalFailures = 0;
    const lines = [];
    const samples = {};

    for (const s of skills) {
        state.skill = s.id;
        state.category = s.category;

        let mscCount = 0;
        let badOptionsCount = 0;
        let badAnsCount = 0;
        let validCount = 0;
        const failureMsgs = [];

        for (let i = 0; i < N; i++) {
            let q;
            try {
                q = genMod.generateQuestion();
            } catch (e) {
                failureMsgs.push('throw: ' + e.message);
                continue;
            }
            if (q.answerType !== 'multi-select-check') continue;
            mscCount++;

            // Capture a sample
            if (!samples[s.id]) {
                samples[s.id] = {
                    text: q.text,
                    answerType: q.answerType,
                    optionsLength: Array.isArray(q.options) ? q.options.length : 'NOT-ARRAY',
                    optionsSample: Array.isArray(q.options) ? q.options.slice(0, 3) : null,
                    ans: q.ans,
                    hasVisual: !!q.visual,
                };
            }

            if (!Array.isArray(q.options) || q.options.length === 0) {
                badOptionsCount++;
                if (failureMsgs.length < 3) failureMsgs.push(`empty/missing options on q: "${q.text}"`);
                continue;
            }
            if (!Array.isArray(q.ans) || q.ans.length === 0) {
                badAnsCount++;
                if (failureMsgs.length < 3) failureMsgs.push(`empty/missing ans on q: "${q.text}"`);
                continue;
            }
            // Verify each ans id corresponds to a correct:true option
            const optMap = new Map(q.options.map(o => [o.id, o]));
            let bad = false;
            for (const id of q.ans) {
                const o = optMap.get(id);
                if (!o || !o.correct) { bad = true; break; }
            }
            if (bad) {
                badAnsCount++;
                if (failureMsgs.length < 3) failureMsgs.push(`ans id missing or correct=false on q: "${q.text}"`);
                continue;
            }
            validCount++;
        }

        const failures = badOptionsCount + badAnsCount;
        const status = (mscCount > 0 && failures === 0) ? 'OK' : (mscCount === 0 ? 'NO-MSC' : 'FAIL');
        lines.push(`${s.id}: ${N} generated, ${mscCount} msc variants, ${validCount} valid, ${badOptionsCount} bad-options, ${badAnsCount} bad-ans -- ${status}` +
            (failureMsgs.length ? '\n    ' + failureMsgs.join('\n    ') : ''));
        if (failures > 0 || mscCount === 0) totalFailures += (failures || 1);
    }

    console.log(lines.join('\n'));
    console.log('\nSample first multi-select-check question per skill:');
    for (const k of Object.keys(samples)) {
        console.log(`\n--- ${k} ---`);
        console.log(JSON.stringify(samples[k], null, 2));
    }
    console.log('\nTotal failures: ' + totalFailures);
    process.exit(totalFailures === 0 ? 0 : 1);
})().catch(e => {
    console.error('Fatal error:', e);
    process.exit(2);
});
