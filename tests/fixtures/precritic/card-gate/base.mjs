// Shared state for the card-gate fixtures (ws-spec-card --fixture; ws-backtest rows card-gate-*): the pilot-su-c
// subtraction card in miniature, as signed before critic SU-C r2, and the option panel the repo offered then
// (offeredOptionsFor on sub_100_no_regroup: the inherited AP4 "How it is written" Stacked / Across control included).
const SK = ['subtraction:sub_100_no_regroup'];
const line = (key, text = '') => ({ key, skills: SK, text });
export const surface = {
    options: ['notation=stacked', 'notation=across', 'band=10', 'band=20', 'band=50', 'band=100', 'level=3', 'level=2', 'level=1'].map((k) => line(k)),
    roles: ['independent', 'lesson'].map((r) => line(`role:${r}`)),
    hosts: ['practice-card', 'online-worksheet', 'quiz'].map((h) => line(`host:${h}`)),
};
export const card = {
    id: 'sub', kind: 'family', title: 'Subtract within 100, no regrouping (fixture)', families: [],
    skills: { include: SK },
    ruleGroups: [{ title: 'Core', core: true, rules: ['VA-1'] }],
    ownerRulings: [{ date: '2026-10-23', ruling: 'Always stacked: across belongs to the sub-setup page.', source: 'lead' }],
    rulings: { rulings: [{ id: 'R-BAND-100', source: '§5.1', assert: 'range', of: 'a', min: 51, max: 99 }], notOffered: [{ id: 'N-BAND', source: '§7', option: 'band' }] },
    decisions: {
        options: [
            { option: 'band', values: ['10', '20', '50', '100'], d: 'hidden', source: '§7' },
            { option: 'level', values: ['3', '1'], d: 'offered', source: '§5' },
            { option: 'level', values: ['2'], d: 'hidden', source: '§5' },
        ],
        roles: [{ key: 'independent', d: 'offered' }, { key: 'lesson', d: 'offered' }],
        hosts: [{ key: 'practice-card', d: 'offered' }, { key: 'online-worksheet', d: 'offered' }, { key: 'quiz', d: 'offered' }],
    },
};
export const clone = (x) => JSON.parse(JSON.stringify(x));
/** The card with the notation control decided (hidden: always stacked). */
export function decided() {
    const c = clone(card);
    c.decisions.options.push({ option: 'notation', values: ['stacked', 'across'], d: 'hidden', source: '§5.1', why: 'always stacked' });
    return c;
}
