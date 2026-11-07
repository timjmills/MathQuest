// Backtest fixture, WRONG-FITS-SLOTS (lf-placevalue critic r1 F3) - PASS variant (the fix): the same three-box item, and
// wrongAnswer gives one value per box (`slots: {part0, part1, part2}`), each one part ("4", "0", "3").
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/wrong-slots.pass.mjs   -> OK
import { registerBoxes, items, wrongWhole } from './wrong-slots.fail.mjs';
export default {
    name: 'wrong-slots-per-slot',
    skill: 'fixture:wrong_slots_per',
    rules: ['WRONG-FITS-SLOTS'],
    setup({ kit }) {
        registerBoxes(kit, 'fixture-wrong-slots-per');
        kit.registerSkill('fixture:wrong_slots_per', {
            wrongAnswer: (q) => { const w = wrongWhole(q); return Object.assign(w, { slots: Object.fromEntries(String(q.cell.payload.n).split('').map((d, i) => [`part${i}`, d])) }); },
        });
    },
    items: items('wrong_slots_per', 'fixture-wrong-slots-per'),
};
