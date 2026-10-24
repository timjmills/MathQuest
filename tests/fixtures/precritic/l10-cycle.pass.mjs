// Backtest fixture, L10 answer cycles - PASS variant (the fix): the right answer's position is dealt from the seeded
// rng, one draw per item, repeats allowed (LESSONS_LEARNED L10's design rule).
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l10-cycle.pass.mjs   -> OK
import { compareItem } from './l10-cycle.fail.mjs';
export default {
    name: 'l10-seeded-position',
    skill: 'fixture:l10_seeded_position',
    rules: ['L10'],
    generate: ({ rng }) => { const first = rng() < 0.5; return compareItem(rng, first); },
};
