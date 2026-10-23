// Backtest fixture, L3 key in the drawing - PASS variant (the fix): the same item draws the two pieces and a "?" where
// the result goes; the shape's name is only in the answer key.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l3-key.pass.mjs   -> OK
import { setupWith, items } from './l3-key.fail.mjs';
export default {
    name: 'l3-result-hidden',
    skill: 'fixture:l3_result_hidden',
    rules: ['L3'],
    setup({ kit }) { setupWith(kit, 'fixture-compose-hidden', false); },
    items: items.map((q) => ({ ...q, cell: { ...q.cell, template: 'fixture-compose-hidden' } })),
};
