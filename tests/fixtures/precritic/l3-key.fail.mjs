// Backtest fixture, L3 key in the drawing - FAIL variant: a "combine shapes" item whose drawing shows its result
// (the critics' compose_shapes defect, ea-r5: "legacy cell with the result drawn"): two pieces, "=", and the finished
// shape with its name under it - the answer the pupil is asked to write.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/l3-key.fail.mjs   -> FAIL
const PIECES = { rectangle: ['square', 'square'], square: ['triangle', 'triangle'], hexagon: ['trapezoid', 'trapezoid'], rhombus: ['triangle', 'triangle'] };
const pic = (name) => `<svg width="20mm" height="20mm" viewBox="0 0 20 20"><polygon points="2,18 18,18 18,2 2,2" fill="none" stroke="#000"/></svg><div class="fx-name">${name}</div>`;
export const drawResult = true;
export function setupWith(kit, id, showResult) {
    kit.registerCell(id, {
        render: (p) => `<div class="fx-compose">${p.pieces.map((x) => `<span class="fx-piece">${pic('')}</span>`).join(' + ')} = ${showResult ? pic(p.result) : '<span class="fx-unknown">?</span>'}<div class="fx-answer">______</div></div>`,
        footprint: (p, ctx) => ({ wMm: 10 * ctx.metrics.writeMm, hMm: 4 * ctx.metrics.writeMm, maxCols: 2 }),
    });
}
export const items = Object.entries(PIECES).map(([result, pieces]) => ({ text: 'What shape do the two pieces make?', ans: result, answerType: 'text', cell: { template: 'TEMPLATE', payload: { pieces, result } } }));
export default {
    name: 'l3-result-drawn',
    skill: 'fixture:l3_result_drawn',
    rules: ['L3'],
    setup({ kit }) { setupWith(kit, 'fixture-compose-drawn', true); },
    items: items.map((q) => ({ ...q, cell: { ...q.cell, template: 'fixture-compose-drawn' } })),
};
