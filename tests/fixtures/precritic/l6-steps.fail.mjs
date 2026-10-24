// Backtest fixture, L6 instruction follows the item - FAIL variant: guided steps written for other numbers. Every item
// is its own 2-digit addition, but the provider's worked steps always walk 26 + 15 (an example baked into the string).
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l6-steps.fail.mjs   -> FAIL
export function addItem(rng) {
    const a = 31 + Math.floor(rng() * 60), b = 31 + Math.floor(rng() * 60);
    return { a, b, op: '+', text: `${a} + ${b} = ?`, ans: a + b, answerType: 'number' };
}
export function itemSteps(q) {
    const ao = q.a % 10, bo = q.b % 10, at = q.a - ao, bt = q.b - bo;
    return [
        { text: `Add the ones: ${ao} + ${bo} = ${ao + bo}.`, marks: [] },
        { text: `Add the tens: ${at} + ${bt} = ${at + bt}.`, marks: [] },
        { text: `${at + bt} + ${ao + bo} = ${q.ans}. Write ${q.ans}.`, marks: [{ slot: 'answer', value: String(q.ans) }] },
    ];
}
export default {
    name: 'l6-steps-other-numbers',
    skill: 'fixture:l6_other_numbers',
    rules: ['L6'],
    setup({ kit }) {
        kit.registerSkill('fixture:l6_other_numbers', {
            strings: () => ({ iCan: 'I Can add 2-digit numbers', instruction: 'Add.', instructionKey: 'add', say: '__ plus __ equals __.' }),
            workedSteps: () => [
                { text: 'Add the ones: 6 + 5 = 11.', marks: [] },
                { text: 'Add the tens: 20 + 10 = 30.', marks: [] },
                { text: '30 + 11 = 41. Write 41.', marks: [{ slot: 'answer', value: '41' }] },
            ],
        });
    },
    generate: ({ rng }) => addItem(rng),
};
