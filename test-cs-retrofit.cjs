// Phase 4.5 batch 7 verification: clock-set retrofit on time/elapsed skills.
//
// Validates each retrofitted skill:
//   - 60 generations under normal Math.random — clock-set rate in [15, 50]%
//   - For each clock-set variant:
//       answerType === 'clock-set'
//       ans is { hour: int 0..11, minute: int 0..59 }
//       minuteSnap ∈ {1, 5, 15}
//       initialHour int 0..23, initialMinute int 0..59
//       printFormat === 'clock-set'
//       skillLabel non-empty, text non-empty, hint non-empty
//   - Forced-original sweep (Math.random ∈ [0.70, 1.00)) yields zero clock-set variants
//   - For elapsed_* skills with parseable text: end time matches (start + elapsed) % 1440
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

    const skills = [
        { id: 'time_hour',           kind: 'time' },
        { id: 'time_half_hour',      kind: 'time' },
        { id: 'time_quarter',        kind: 'time' },
        { id: 'time_5min',           kind: 'time' },
        { id: 'time_1min',           kind: 'time' },
        { id: 'elapsed_30min',       kind: 'elapsed', addMin: 30 },
        { id: 'elapsed_hour',        kind: 'elapsed' /* hours parsed from text */ },
        { id: 'elapsed_15min',       kind: 'elapsed' },
        { id: 'elapsed_mixed',       kind: 'elapsed' },
        { id: 'elapsed_visual_easy',   kind: 'elapsed' },
        { id: 'elapsed_visual_medium', kind: 'elapsed' },
        { id: 'elapsed_visual_hard',   kind: 'elapsed' },
    ];

    const N = 60;
    let totalFailures = 0;
    const lines = [];

    function parseHM(s) {
        // "H:MM" form
        const m = /^(\d{1,2}):(\d{2})$/.exec(s);
        if (!m) return null;
        return { h: parseInt(m[1], 10), min: parseInt(m[2], 10) };
    }

    // Parse the elapsed delta from the question text. Returns total minutes or null.
    function parseDelta(text) {
        // "30 minutes later" / "15 minutes later"
        let m = /Set the clock to show (\d+) minutes later/.exec(text);
        if (m) return parseInt(m[1], 10);
        // "N hours later"
        m = /Set the clock to show (\d+) hours? later/.exec(text);
        if (m) return parseInt(m[1], 10) * 60;
        // "N hours M minutes later"
        m = /Set the clock to show (\d+) hours? (\d+) minutes later/.exec(text);
        if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        // "N hr M min later"
        m = /Set the clock to show (\d+) hr (\d+) min later/.exec(text);
        if (m) return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
        // "N hour later" / "N hours later"
        m = /Set the clock to show (\d+) hour later/.exec(text);
        if (m) return parseInt(m[1], 10) * 60;
        return null;
    }

    function validateCS(q, skill) {
        if (q.answerType !== 'clock-set') return 'answerType != clock-set';
        if (!q.ans || typeof q.ans !== 'object') return 'ans not object';
        const { hour, minute } = q.ans;
        if (!Number.isInteger(hour) || hour < 0 || hour > 11) return `bad ans.hour (${hour})`;
        if (!Number.isInteger(minute) || minute < 0 || minute > 59) return `bad ans.minute (${minute})`;
        if (q.minuteSnap !== 1 && q.minuteSnap !== 5 && q.minuteSnap !== 15) return `bad minuteSnap (${q.minuteSnap})`;
        if (!Number.isInteger(q.initialHour) || q.initialHour < 0 || q.initialHour > 23) return `bad initialHour (${q.initialHour})`;
        if (!Number.isInteger(q.initialMinute) || q.initialMinute < 0 || q.initialMinute > 59) return `bad initialMinute (${q.initialMinute})`;
        if (q.printFormat !== 'clock-set') return `printFormat != clock-set (${q.printFormat})`;
        if (typeof q.skillLabel !== 'string' || !q.skillLabel) return 'empty skillLabel';
        if (typeof q.text !== 'string' || !q.text) return 'empty text';
        if (typeof q.hint !== 'string' || !q.hint) return 'empty hint';

        // For elapsed skills: verify end = (start + delta) % 1440 mod 12-hour clock
        if (skill.kind === 'elapsed') {
            const startMatch = /It is now (\d{1,2}):(\d{2})/.exec(q.text);
            if (!startMatch) return 'elapsed: could not parse start time from text';
            const sH = parseInt(startMatch[1], 10);
            const sM = parseInt(startMatch[2], 10);
            if (sH !== q.initialHour) return `start hour mismatch text=${sH} initial=${q.initialHour}`;
            if (sM !== q.initialMinute) return `start min mismatch text=${sM} initial=${q.initialMinute}`;
            const delta = parseDelta(q.text);
            if (delta == null) return 'elapsed: could not parse delta from text';
            const totalStart = sH * 60 + sM;
            const totalEnd = ((totalStart + delta) % 1440 + 1440) % 1440;
            const expectedH24 = Math.floor(totalEnd / 60);
            const expectedM = totalEnd % 60;
            const expectedH12 = expectedH24 % 12;
            if (expectedH12 !== hour) return `end hour mismatch want=${expectedH12} got=${hour} (start ${sH}:${sM} + ${delta}m)`;
            if (expectedM !== minute) return `end min mismatch want=${expectedM} got=${minute}`;
        } else {
            // For time-reading skills: text contains the target time
            const m = /Set the clock to ((\d{1,2}):(\d{2})|(\d{1,2}) o'clock)/.exec(q.text);
            if (!m) return 'time: could not parse target from text';
            let tH, tM;
            if (m[2]) { tH = parseInt(m[2], 10); tM = parseInt(m[3], 10); }
            else { tH = parseInt(m[4], 10); tM = 0; }
            if ((tH % 12) !== hour) return `time hour mismatch text=${tH} ans=${hour}`;
            if (tM !== minute) return `time min mismatch text=${tM} ans=${minute}`;
        }
        return null;
    }

    for (const s of skills) {
        let csCount = 0;
        let normalCount = 0;
        let failures = 0;
        const failureMsgs = [];
        let normalAnswerType = null;

        for (let i = 0; i < N; i++) {
            const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
            try {
                measMod.generateMeasurementQuestion(q, s.id, helpers);
            } catch (e) {
                failures++;
                if (failureMsgs.length < 3) failureMsgs.push('throw: ' + e.message);
                continue;
            }
            if (q.answerType === 'clock-set') {
                csCount++;
                const err = validateCS(q, s);
                if (err) {
                    failures++;
                    if (failureMsgs.length < 5) failureMsgs.push('cs-variant: ' + err);
                }
            } else {
                normalCount++;
                if (normalAnswerType === null) normalAnswerType = q.answerType;
            }
        }

        // Forced-original sweep: Math.random ∈ [0.70, 1.00)
        const realRandom = Math.random;
        Math.random = () => 0.70 + realRandom.call(Math) * 0.30;
        let originalFailures = 0;
        let originalCsCount = 0;
        try {
            for (let i = 0; i < 50; i++) {
                const q = { text: '', ans: 0, hint: '', options: [], answerType: 'number', visual: '', skillLabel: '' };
                try {
                    measMod.generateMeasurementQuestion(q, s.id, helpers);
                } catch (e) {
                    originalFailures++;
                    if (failureMsgs.length < 5) failureMsgs.push('original throw: ' + e.message);
                    continue;
                }
                if (q.answerType === 'clock-set') originalCsCount++;
            }
        } finally {
            Math.random = realRandom;
        }

        if (originalCsCount > 0) {
            failures += originalCsCount;
            failureMsgs.push(`forced-original: ${originalCsCount}/50 still produced clock-set`);
        }
        if (originalFailures > 0) {
            failures += originalFailures;
            failureMsgs.push(`forced-original: ${originalFailures} threw`);
        }

        const ratePct = (csCount / N) * 100;
        if (csCount === 0) {
            failures++;
            failureMsgs.push(`no clock-set variants in ${N} samples`);
        } else if (ratePct < 15 || ratePct > 50) {
            failures++;
            failureMsgs.push(`rate ${ratePct.toFixed(1)}% outside [15, 50]%`);
        }

        const status = failures === 0 ? 'OK' : 'FAIL';
        lines.push(`${s.id}: ${N} generated, ${csCount} clock-set (${ratePct.toFixed(0)}%), ${normalCount} ${normalAnswerType || '?'} — ${status}` +
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
