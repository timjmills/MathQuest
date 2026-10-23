// Backtest fixture, keyed node-lint baseline (critic r1 D5) - FAIL variant: the pinned finding on item 2 was fixed and
// a NEW one of the same rule and kind appeared on item 5 in the same change. The count per (skill, rule) is still 1, so
// the old count baseline passed this; the keyed baseline fails it (1 new key, 1 pinned key gone).
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/node-lint-keys.swap.mjs --baseline tests/fixtures/precritic/node-lint-keys.baseline.json   -> FAIL
import pin, { clean, lettered } from './node-lint-keys.pin.mjs';
export default {
    ...pin,
    items: Array.from({ length: 8 }, (_, i) => (i === 4 ? lettered(i) : clean(i))),
};
