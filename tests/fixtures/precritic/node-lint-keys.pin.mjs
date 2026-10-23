// Backtest fixture, keyed node-lint baseline (critic r1 D5) - PASS variant: the state the baseline pins. Item 2 prints a
// letter x for times; tests/fixtures/precritic/node-lint-keys.baseline.json pins exactly that finding's key.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/node-lint-keys.pin.mjs --baseline tests/fixtures/precritic/node-lint-keys.baseline.json   -> OK
// Re-pin (only if this fixture changes):
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/node-lint-keys.pin.mjs --baseline tests/fixtures/precritic/node-lint-keys.baseline.json --write-baseline
export const clean = (i) => ({ text: `${i + 2} × ${i + 3} =`, ans: (i + 2) * (i + 3), answerType: 'number' });
export const lettered = (i) => ({ text: `${i + 2} x ${i + 3} =`, ans: (i + 2) * (i + 3), answerType: 'number' });
export default {
    name: 'node-lint-keys',
    skill: 'fixture:node_lint_keys',
    rules: ['NOTATION'],
    items: Array.from({ length: 8 }, (_, i) => (i === 1 ? lettered(i) : clean(i))),
};
