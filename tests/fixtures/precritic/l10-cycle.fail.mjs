// Backtest fixture, L10 answer cycles - FAIL variant: a "Which is greater?" choice item whose right answer is put in
// position A or B by `itemIndex % 2` (the k2-r1 defect class), so down a page the key reads A B A B A B ...
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l10-cycle.fail.mjs   -> FAIL
export function compareItem(rng, rightFirst) {
    const a = 10 + Math.floor(rng() * 80);
    let b = 10 + Math.floor(rng() * 80);
    if (b === a) b = a + 7;
    const big = Math.max(a, b), small = Math.min(a, b);
    const options = rightFirst ? [String(big), String(small)] : [String(small), String(big)];
    return { text: 'Which number is greater? Circle A or B.', ans: String(big), options, answerType: 'multiple-choice' };
}
export default {
    name: 'l10-ab-alternation',
    skill: 'fixture:l10_ab_alternation',
    rules: ['L10'],
    generate: ({ i, rng }) => compareItem(rng, i % 2 === 0),
};
