// Story lint (round-4 critic, 2026-09-25): every word-work story, over a large sample, reads as
// grammatical English for an ELL pupil and says what it counts.
//
//   node tests/scripts/ws-story-lint.mjs            # the gate
//   node tests/scripts/ws-story-lint.mjs --show 3   # also print 3 stories per schema
//
// The stories come from ONE place, js/modules/sheet/cells/word-work.js (`tellStory`,
// `tellTwoStep`): the generators decide the numbers and the kind of story, the words are the
// cell's. Every schema is told for many numbers (1, small, teens, hundreds, thousands, 6 digits)
// and every name / noun rotation, and each story is held to:
//   S1  every sentence starts with a capital and ends with "." or "?", the question is last and
//       asks "How many ..."
//   S2  at most 12 words a sentence (P-WP-18, Levels 4-6; the K/1 stories are shorter)
//   S3  number agreement: "1 bag", never "1 bags"; "4 bags", never "4 bag" (P-WP-20)
//   S4  no bare past participle as a clause ("After 423 removed", "Then 102 spent.")
//   S5  no pronoun standing for a name ("She", "He" as a subject; P-WP-19)
//   S6  every number of the step is in the story, and the story has no other number
//   S7  the unit word (the answer's label) is a noun of the story, singular when the answer is 1
//   S8  the verbs fit their nouns: no money in rows, gardens or bags; no planted rocks
// Pure node: imports the kit module only. Prints `ws-story-lint: OK` / `FAIL`.
import { tellStory, tellTwoStep, makeStep, WW_THINGS, WW_CONTAINERS, WW_MONEY } from '../../js/modules/sheet/cells/word-work.js';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const SHOW = Number(arg('show', '0'));
const fails = [];
const fail = (m) => { if (fails.length < 60) fails.push(m); };
let checked = 0;

const nouns = [...WW_THINGS, ...WW_CONTAINERS, WW_MONEY, { one: 'child', many: 'children' }, { one: 'car', many: 'cars' }, { one: 'friend', many: 'friends' }];
const SINGULAR = new Set(nouns.map((n) => n.one));
const PLURAL = new Set(nouns.map((n) => n.many));
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const numsIn = (s) => [...s.matchAll(/\d[\d,]*/g)].map((m) => Number(m[0].replace(/,/g, '')));

function lint(story, st, tag, { steps = [st] } = {}) {
    checked++;
    if (!story) { fail(`${tag}: no story`); return; }
    const { lines, unit, ans } = story;
    const text = lines.join(' ');
    lines.forEach((l, i) => {
        if (!/^[A-Z0-9]/.test(l)) fail(`${tag}: S1 sentence does not start with a capital: "${l}"`);
        if (!/[.?]$/.test(l)) fail(`${tag}: S1 sentence does not end with . or ?: "${l}"`);
        if (i < lines.length - 1 && /\?$/.test(l)) fail(`${tag}: S1 a question before the last line: "${l}"`);
        if (words(l) > 12) fail(`${tag}: S2 ${words(l)} words: "${l}"`);
        if (/^(She|He|They|It)\b/.test(l)) fail(`${tag}: S5 a pronoun for a name: "${l}"`);
    });
    const q = lines[lines.length - 1];
    if (!/^How many\b/.test(q) || !/\?$/.test(q)) fail(`${tag}: S1 the last line is not a "How many ...?" question: "${q}"`);
    for (const m of text.matchAll(/\b(\d[\d,]*) (?:more )?([a-z]+)\b/g)) {
        const n = Number(m[1].replace(/,/g, ''));
        const w = m[2];
        if (n === 1 && PLURAL.has(w)) fail(`${tag}: S3 "1 ${w}" in "${text}"`);
        if (n !== 1 && SINGULAR.has(w)) fail(`${tag}: S3 "${m[1]} ${w}" in "${text}"`);
    }
    if (/\b(There is|There are) (\d[\d,]*)\b/.test(text)) {
        const m = /\b(There is|There are) (\d[\d,]*)/.exec(text);
        if ((m[2] === '1') !== (m[1] === 'There is')) fail(`${tag}: S3 "${m[0]}"`);
    }
    if (/\b(After|Then|Later,?)\s+\d[\d,]*\s+[a-z]+(ed|en|t)\b[,.]/i.test(text)) fail(`${tag}: S4 a bare participle clause: "${text}"`);
    const want = new Set(steps.flatMap((s, i) => (i === 0 ? [s.top, s.bottom] : [s.bottom])));
    const got = numsIn(text);
    for (const n of want) if (!got.includes(n)) fail(`${tag}: S6 ${n} is not in the story: "${text}"`);
    for (const n of got) if (!want.has(n)) fail(`${tag}: S6 an extra number ${n}: "${text}"`);
    if (unit) {
        if (!new RegExp(`\\b${unit.many}\\b`).test(text) && !new RegExp(`\\b${unit.one}\\b`).test(text)) fail(`${tag}: S7 the unit "${unit.many}" is not in the story: "${text}"`);
    }
    if (/\b(dollars?|cents?)\b/.test(text) && /\b(rows?|garden|bags?|jars?|plates?|baskets?|boxes|packs?|each)\b/.test(text)) fail(`${tag}: S8 money in a container story: "${text}"`);
    if (/\bplant(s|ed)?\b.*\brocks?\b/.test(text)) fail(`${tag}: S8 planted rocks: "${text}"`);
    return ans;
}

const SAMPLES = [1, 2, 3, 7, 9, 12, 18, 25, 48, 99, 100, 250, 999, 1000, 4821, 57938, 217422, 690000];
const show = {};
const out = (schema, s) => { show[schema] = show[schema] || []; if (show[schema].length < SHOW) show[schema].push(s.lines.join(' ')); };
for (let k = 0; k < 40; k++) {
    for (const x of SAMPLES) {
        for (const y of SAMPLES) {
            if (x > y) {
                const add = makeStep(x - y, '+', y);                // (x - y) + y
                for (const sc of ['join', 'compare-more', 'start-sub']) { const s = tellStory(sc, add, k); lint(s, add, `${sc} ${add.top}+${add.bottom} k${k}`); if (s) out(sc, s); }
                const sub = makeStep(x, '-', y);
                for (const sc of ['separate', 'compare', 'change', 'start-add']) { const s = tellStory(sc, sub, k); lint(s, sub, `${sc} ${x}-${y} k${k}`); if (s) out(sc, s); }
            }
        }
    }
    for (const f of [1, 2, 3, 6, 7, 9, 12]) {
        for (const g of [1, 2, 4, 5, 8, 10, 12, 23]) {
            const mul = makeStep(f, '*', g);
            for (const sc of ['groups', 'times']) { const s = tellStory(sc, mul, k); lint(s, mul, `${sc} ${f}x${g} k${k}`); if (s) out(sc, s); }
            const div = makeStep(f * g, '/', g);
            for (const sc of ['sharing', 'grouping', 'times-inverse', 'times-howmany']) {
                const s = tellStory(sc, div, k);
                if (s === null && sc === 'sharing' && g < 2) continue;              // a share needs 2 or more
                lint(s, div, `${sc} ${f * g}/${g} k${k}`); if (s) out(sc, s);
            }
            for (const r of [1, 3]) {
                if (r >= g) continue;
                const dr = makeStep(f * g + r, '/', g);
                for (const [sc, a] of [['rem-left', r], ['rem-up', f + 1], ['rem-full', f]]) {
                    const s = tellStory(sc, dr, k, { ans: a });
                    if (s === null && sc === 'rem-up' && (g < 2 || f * g + r < 2)) continue;
                    lint(s, dr, `${sc} ${f * g + r}/${g} k${k}`); if (s) out(sc, s);
                }
            }
        }
    }
    for (const [a, b, c, o1, o2] of [[53, 10, 14, '-', '-'], [57, 28, 12, '+', '+'], [91, 37, 6, '+', '-'], [31, 25, 48, '-', '+'], [1, 1, 1, '+', '+']]) {
        const s1 = makeStep(a, o1, b); const s2 = makeStep(s1.ans, o2, c);
        if (!s1 || !s2) continue;
        const s = tellTwoStep(s1, s2, k);
        lint(s, s1, `two-step ${a}${o1}${b}${o2}${c} k${k}`, { steps: [s1, s2] }); if (s) out('two-step', s);
    }
}
if (SHOW) for (const [sc, list] of Object.entries(show)) console.log(`${sc}:\n  ${list.join('\n  ')}`);
if (fails.length) { console.log(fails.join('\n')); console.log(`ws-story-lint: FAIL (${fails.length}${fails.length >= 60 ? '+' : ''} of ${checked} stories)`); process.exit(1); }
console.log(`ws-story-lint: OK (${checked} stories, 17 schemas, 8 rules)`);
