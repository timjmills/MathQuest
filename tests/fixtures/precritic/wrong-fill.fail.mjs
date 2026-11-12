// Backtest fixture, WRONG-FILL (lf-placevalue critic r1 F3) - FAIL variant: the True or False? / Reason It roles hand a
// three-box cell its false statement as ONE value (print-sheet's draw: wrong = {value, slots: {}}), and the cell writes
// that value into every box ("4 + 0 + 3" three times, clipped at both ends: critic r1 expand true-false items 2 and 3).
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/wrong-fill.fail.mjs   -> FAIL
import { registerBoxes, items, wrongWhole } from './wrong-slots.fail.mjs';
export default {
    name: 'wrong-fill-whole',
    skill: 'fixture:wrong_fill_whole',
    rules: ['WRONG-FILL'],
    setup({ kit }) {
        registerBoxes(kit, 'fixture-wrong-fill-whole');
        kit.registerSkill('fixture:wrong_fill_whole', { wrongAnswer: wrongWhole });
    },
    items: items('wrong_fill_whole', 'fixture-wrong-fill-whole'),
};
