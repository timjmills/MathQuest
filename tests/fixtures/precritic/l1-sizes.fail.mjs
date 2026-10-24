// Backtest fixture, L1 sizes - FAIL variant. The defect options critic R3 found on 87 skills (OC14, e.g.
// counting:count_sequence "Size S == L (2 x 5, same card size)"): a template whose footprint is fixed in mm and whose
// drawing is fixed in px, so the Independent page at S prints the same grid as at L and the picture never shrinks.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l1-sizes.fail.mjs   -> FAIL
const TRACK = (n) => Array.from({ length: 10 }, (_, k) => `<rect x="${k * 30}" y="0" width="30" height="40" fill="none" stroke="#000"/><text x="${k * 30 + 15}" y="28">${k === 4 ? '' : n + k}</text>`).join('');
export default {
    name: 'l1-fixed-grid',
    skill: 'fixture:l1_fixed_grid',
    rules: ['L1'],
    setup({ kit }) {
        kit.registerCell('fixture-fixed-track', {
            // fixed: the same 300 x 40 px track and the same 2-column, 88 x 40 mm cell at every size
            render: (p) => `<svg width="300" height="40" viewBox="0 0 300 40">${TRACK(p.start)}</svg>`,
            footprint: () => ({ wMm: 88, hMm: 40, maxCols: 2, hardCap: true }),
        });
    },
    generate: ({ i }) => ({ text: 'Write the missing number.', ans: 4 + 3 * i + 4, cell: { template: 'fixture-fixed-track', payload: { start: 4 + 3 * i } } }),
};
