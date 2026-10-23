// Backtest fixture, H8 - PASS variant (the fix): the same seeded items. Production stays production: on screen the
// pupil types the fraction into the fraction slot (no option row). A second skill shows the other legal fix: the
// paper item IS a circle-one (the cell prints the four choices), so the screen may offer the same four as a choice.
//   node tests/scripts/ws-content-audit.cjs --mc-fixture tests/fixtures/precritic/mc-production.pass.cjs   -> OK
const { deal } = require('./mc-production.fail.cjs');
module.exports = {
    skills: [
        { categoryId: 'fixture', skillId: 'mc_production', label: 'Fraction shaded (fixture)', items: deal(20261023, { buttons: false, paperChoices: false }) },
        { categoryId: 'fixture', skillId: 'mc_circle_one', label: 'Fraction shaded, circle one (fixture)', items: deal(20261023, { buttons: true, paperChoices: true }) },
    ],
};
