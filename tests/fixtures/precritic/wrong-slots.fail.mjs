// Backtest fixture, WRONG-FITS-SLOTS (lf-placevalue critic r1 F3) - FAIL variant: an expanded-form item with three
// write-in boxes ("403 = [ ] + [ ] + [ ]") whose provider's wrongAnswer is ONE string ("4 + 0 + 3") and no per-slot
// values, so every role that writes it into the cell has nothing to put in each box but the whole statement.
//   node tests/scripts/ws-node-lint.mjs --fixture tests/fixtures/precritic/wrong-slots.fail.mjs   -> FAIL
export const NUMS = [403, 527, 860, 719, 305, 642, 981, 270];
export const partsOf = (n) => String(n).split('').map((d, i, a) => Number(d) * 10 ** (a.length - 1 - i));
/** A three-box expanded-form cell: a box shows ctx.wrong.slots[id], else (splitWhole) its part of the whole wrong value, else the whole value. */
export function registerBoxes(kit, id, { splitWhole = false } = {}) {
    kit.registerCell(id, {
        render: (p, ctx) => {
            const w = (ctx && ctx.state === 'wrong' && ctx.wrong) || null;
            const parts = w && splitWhole ? String(w.value).split(' + ') : null;
            const box = (i) => {
                const v = !w ? '' : w.slots && w.slots[`part${i}`] !== undefined ? w.slots[`part${i}`] : parts ? (parts[i] || '') : w.value;
                return `<span class="ws-box" style="--w:20mm" data-ws-slot="part${i}" data-ws-shape="box">${v}</span>`;
            };
            return `<div class="fx-expand">${p.n} = ${box(0)} + ${box(1)} + ${box(2)}</div>`;
        },
        footprint: (p, c) => ({ wMm: 12 * c.metrics.writeMm, hMm: 3 * c.metrics.writeMm, maxCols: 2 }),
    });
}
export const items = (skillId, template) => NUMS.map((n) => ({ text: `Write ${n} in expanded form.`, ans: partsOf(n).join(' + '), answerType: 'text', categoryId: 'fixture', skillId, cell: { template, payload: { n } } }));
/** The digits read as the parts (M-V6): "4 + 0 + 3" for 403. */
export const wrongWhole = (q) => ({ value: String(q.cell.payload.n).split('').join(' + '), misconception: 'M-V6', explain: 'Wrote the digits, not what they are worth.' });
export default {
    name: 'wrong-slots-one-string',
    skill: 'fixture:wrong_slots_one',
    rules: ['WRONG-FITS-SLOTS'],
    setup({ kit }) {
        registerBoxes(kit, 'fixture-wrong-slots-one');
        kit.registerSkill('fixture:wrong_slots_one', { wrongAnswer: wrongWhole });
    },
    items: items('wrong_slots_one', 'fixture-wrong-slots-one'),
};
