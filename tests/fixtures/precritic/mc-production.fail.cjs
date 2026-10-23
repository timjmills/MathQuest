// Backtest fixture, H8 (IMPROVEMENT_PLAN §1.6.3; P-29 / RM-P-01) - FAIL variant: a seeded "what fraction is shaded?"
// item. On paper the pupil WRITES the fraction (the cell prints a fraction slot and no choices); on screen the same
// item is dealt with four fraction options, so the app draws a row of buttons. This is the defect class the MC-ALL
// section of ws-content-audit finds live (fractions:simplify, conversions:d_to_f, measure_angles ...).
//   node tests/scripts/ws-content-audit.cjs --mc-fixture tests/fixtures/precritic/mc-production.fail.cjs   -> FAIL
// The items have the shape ws-content-audit's in-page sampler returns (answerType, the option labels, and the visible
// text of the pupil cell the print path draws), so the judgement is the one the live sweep uses.
function mulberry(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/** Six seeded items: d parts, n shaded; the paper cell prints the question and a stacked fraction slot. */
function deal(seed, { buttons, paperChoices }) {
    const rng = mulberry(seed);
    const items = [];
    for (let i = 0; i < 6; i++) {
        const d = 2 + Math.floor(rng() * 7);            // 2..8 parts
        const n = 1 + Math.floor(rng() * (d - 1));      // 1..d-1 shaded
        const four = [...new Set([`${n}/${d}`, `${d - n}/${d}`, `${n}/${d + 1}`, `${d}/${n}`, `${n + 1}/${d + 2}`])].slice(0, 4);
        const labels = four.map((l) => [rng(), l]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
        const choiceRow = paperChoices ? ` Circle one: ${labels.map((l) => l.replace('/', ' ')).join('   ')}` : '';
        items.push({
            i, answerType: buttons ? 'multiple-choice' : 'fraction-input', printFormat: 'fraction-shaded', template: 'frac-model',
            labels: buttons ? labels : undefined,
            printText: `What fraction of the shape is shaded?${choiceRow} Answer:`,
        });
    }
    return items;
}
module.exports = {
    deal,
    skills: [{ categoryId: 'fixture', skillId: 'mc_production', label: 'Fraction shaded (fixture)', items: deal(20261023, { buttons: true, paperChoices: false }) }],
};
