// Backtest fixture, NOTATION (C4) - FAIL variant: an item printing "3 x 4 =" (a letter x for times, TY-6), an inline
// "1/2" (a slash fraction, TY-7), and a provider instruction that is not a library string (P-14).
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/notation.fail.mjs   -> FAIL
export default {
    name: 'notation-fail',
    skill: 'fixture:notation_fail',
    rules: ['NOTATION'],
    setup({ kit }) {
        if (!kit.hasCell('fixture-text')) {
            kit.registerCell('fixture-text', {
                render: (p) => `<div class="fx-text">${p.html}</div>`,
                footprint: () => ({ wMm: 40, hMm: 14, maxCols: 4 }),
            });
        }
        kit.registerSkill('fixture:notation_fail', { strings: () => ({ iCan: 'I Can multiply', instruction: 'Work out the answers.', instructionKey: '' }) });
    },
    items: [
        { text: '3 x 4 = ?', ans: 12, cell: { template: 'fixture-text', payload: { html: '3 x 4 = <span class="slot"></span>' } } },
        { text: 'Shade 1/2 of the shape.', ans: '1/2', cell: { template: 'fixture-text', payload: { html: 'Shade 1/2 of the shape.' } } },
    ],
};
