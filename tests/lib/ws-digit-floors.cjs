// The screen digit floors, ONE table for every check (lead D8 ruling 2026-11-13; design/decisions/LEAD_DECISIONS.md 2026-11-13:
// "Online worksheet screen-digit floor = written standard 29 px (TY-10b count rows); card / quiz 40 / 48 / 56; a passed raise on
// the worksheet is pinned as a no-regression ratchet, not a new floor"; RUBRIC C3 "practice card 40 / 48 / 56 px at phone /
// tablet / desktop; online worksheet 29 px").
//   floorPx(host, width, key) -> px   host: 'card' | 'quiz' | 'worksheet'; key: 'category:skill'
// Card and quiz: 56 px at 1200 px and wider, 48 px from 600 px, 40 px under. Worksheet: 29 px at every width, unless the skill's
// worksheet passed a raise, which is held as a ratchet (WORKSHEET_RATCHET; div_facts: lf-ops-divarray 898f800d7, backtest
// screen-digit-ws-divfacts).
'use strict';
const HOST_FLOOR = (width) => (width >= 1200 ? 56 : width >= 600 ? 48 : 40);
const WORKSHEET_FLOOR = 29;
const WORKSHEET_RATCHET = Object.freeze({
    'division:div_facts': HOST_FLOOR,
});
function floorPx(host, width, key = '') {
    if (host === 'worksheet') {
        const r = WORKSHEET_RATCHET[key];
        return r ? Math.max(WORKSHEET_FLOOR, r(width)) : WORKSHEET_FLOOR;
    }
    return HOST_FLOOR(width);
}
module.exports = { floorPx, HOST_FLOOR, WORKSHEET_FLOOR, WORKSHEET_RATCHET };
