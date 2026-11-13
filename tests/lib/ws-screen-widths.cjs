// ws-screen-widths — the screen hosts every screen gate renders by default (owner rule, 2026-11-13; CLAUDE.md
// "Fastest-implementation plan" item 7): print, computer / Chromebook (1280-1366 px) and tablet (820-1024 px).
// There is NO phone width: no gate DEFAULT may hold 390 (tests/scripts/ws-no-phone-width.mjs is the gate). An explicit
// `--widths 390` (or a gate's own `--sizes 390x844`) still runs on request, so backtests that prove a phone fixture keep
// working.
//
//   SCREEN_WIDTHS      the default widths, desktop first: 1280, 1366 (x 768, Chromebook), 820, 1024 (tablets)
//   TABLET_WIDTHS      820, 1024 - where the 48 px touch target (SP-10, RUBRIC H6) is judged
//   HEIGHTS            the viewport height used for each width when a gate has no height of its own
//   DIGIT_FLOOR        the SP screen-digit floor per width (WORKSHEET_DESIGN_STANDARD SP table: 40 / 48 / 56 px at
//                      375 / 768 / 1440). The standard names no 1024 or 1366 row: 1366 takes the 1280 floor (56) and
//                      1024 takes the 820 floor (48), the floor of the bracket each falls in.
//   widthsArg(argv, fallback, key)   `--<key> 820,1024` parsed to numbers, else `fallback` (default SCREEN_WIDTHS)
'use strict';
const SCREEN_WIDTHS = Object.freeze([1280, 1366, 820, 1024]);
const TABLET_WIDTHS = Object.freeze([820, 1024]);
const HEIGHTS = Object.freeze({ 1280: 900, 1366: 768, 820: 1180, 1024: 768, 390: 844 });
const DIGIT_FLOOR = Object.freeze({ 1280: 56, 1366: 56, 820: 48, 1024: 48, 390: 40 });
function widthsArg(argv = process.argv, fallback = SCREEN_WIDTHS, key = 'widths') {
    const i = argv.indexOf('--' + key);
    if (i < 0 || !argv[i + 1]) return [...fallback];
    const out = String(argv[i + 1]).split(',').map((s) => parseInt(s, 10)).filter((n) => n > 0);
    return out.length ? out : [...fallback];
}
const heightOf = (w, fallback = 900) => HEIGHTS[w] || fallback;
module.exports = { SCREEN_WIDTHS, TABLET_WIDTHS, HEIGHTS, DIGIT_FLOOR, widthsArg, heightOf };
