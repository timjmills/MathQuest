// Backtest fixture, L6 instruction follows the item - PASS variant (the fix): the worked steps are derived from the
// item (provider workedSteps(q)), so they walk its own ones and tens.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l6-steps.pass.mjs   -> OK
import { addItem, itemSteps } from './l6-steps.fail.mjs';
export default {
    name: 'l6-steps-own-numbers',
    skill: 'fixture:l6_own_numbers',
    rules: ['L6'],
    setup({ kit }) {
        kit.registerSkill('fixture:l6_own_numbers', {
            strings: () => ({ iCan: 'I Can add 2-digit numbers', instruction: 'Add.', instructionKey: 'add', say: '__ plus __ equals __.' }),
            workedSteps: (q) => itemSteps(q),
        });
    },
    generate: ({ rng }) => addItem(rng),
};
