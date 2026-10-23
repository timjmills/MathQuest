// Backtest fixture, L1 sizes - PASS variant (the fix): the track is drawn from ctx.metrics (box = 1.6 writing
// heights wide, 1.4 tall), so its footprint and its drawing shrink at S, and S prints more items than L.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l1-sizes.pass.mjs   -> OK
const box = (ctx) => ({ w: +(1.6 * ctx.metrics.writeMm).toFixed(2), h: +(1.4 * ctx.metrics.writeMm).toFixed(2) });
export default {
    name: 'l1-metric-grid',
    skill: 'fixture:l1_metric_grid',
    rules: ['L1'],
    setup({ kit }) {
        kit.registerCell('fixture-metric-track', {
            render: (p, ctx) => {
                const b = box(ctx);
                const cells = Array.from({ length: 10 }, (_, k) => `<rect x="${(k * b.w).toFixed(2)}" y="0" width="${b.w}" height="${b.h}" fill="none" stroke="#000"/><text x="${(k * b.w + b.w / 2).toFixed(2)}" y="${(b.h * 0.7).toFixed(2)}" font-size="${ctx.metrics.digitPt}pt">${k === 4 ? '' : p.start + k}</text>`).join('');
                return `<svg width="${(10 * b.w).toFixed(2)}mm" height="${b.h}mm" viewBox="0 0 ${(10 * b.w).toFixed(2)} ${b.h}">${cells}</svg>`;
            },
            footprint: (p, ctx) => { const b = box(ctx); return { wMm: +(10 * b.w + 6).toFixed(2), hMm: +(b.h + 4).toFixed(2), maxCols: 2 }; },
        });
    },
    generate: ({ i }) => ({ text: 'Write the missing number.', ans: 4 + 3 * i + 4, cell: { template: 'fixture-metric-track', payload: { start: 4 + 3 * i } } }),
};
