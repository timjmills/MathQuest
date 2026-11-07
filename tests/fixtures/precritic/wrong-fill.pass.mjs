// Backtest fixture, WRONG-FILL (lf-placevalue critic r1 F3) - PASS variant (the fix, as cells/pv.js does it today): the
// cell writes its own part of a whole false statement into each box ("4", "0", "3"), so the roles' one value prints one
// part a box.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/wrong-fill.pass.mjs   -> OK
import { registerBoxes, items, wrongWhole } from './wrong-slots.fail.mjs';
export default {
    name: 'wrong-fill-per-slot',
    skill: 'fixture:wrong_fill_per',
    rules: ['WRONG-FILL'],
    setup({ kit }) {
        registerBoxes(kit, 'fixture-wrong-fill-per', { splitWhole: true });
        kit.registerSkill('fixture:wrong_fill_per', { wrongAnswer: wrongWhole });
    },
    items: items('wrong_fill_per', 'fixture-wrong-fill-per'),
};
