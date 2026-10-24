// Backtest fixture, NOTATION (C4) - PASS variant (the fix): the times sign U+00D7, the fraction stacked over its bar,
// and the library instruction "Multiply.".
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/notation.pass.mjs   -> OK
export default {
    name: 'notation-pass',
    skill: 'fixture:notation_pass',
    rules: ['NOTATION'],
    setup({ kit }) {
        if (!kit.hasCell('fixture-text')) {
            kit.registerCell('fixture-text', {
                render: (p) => `<div class="fx-text">${p.html}</div>`,
                footprint: () => ({ wMm: 40, hMm: 14, maxCols: 4 }),
            });
        }
        kit.registerSkill('fixture:notation_pass', { strings: () => ({ iCan: 'I Can multiply', instruction: 'Multiply.', instructionKey: 'multiply' }) });
    },
    items: [
        { text: '3 × 4 = ?', ans: 12, cell: { template: 'fixture-text', payload: { html: '3 × 4 = <span class="slot"></span>' } } },
        { text: 'Shade the fraction.', ans: '1/2', cell: { template: 'fixture-text', payload: { html: 'Shade <span class="ws-frac"><span>1</span><span class="bar"></span><span>2</span></span> of the shape.' } } },
    ],
};
