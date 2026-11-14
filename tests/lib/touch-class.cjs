// touch-class — THE ONE classifier of a typed box's touch kind and floor, shared by ws-phone-card (TOUCH-TARGET, TOUCH,
// FOCUS-RING) and ws-grade-render (the screen hosts' TARGET gate). Critic lf-checks tt-r1 D4: ws-phone-card held every
// `.mq-wwork` input to the 44 px working floor, so the word-work sign circle (`input.mq-wwork.mq-gl-sign`,
// data-mq-kind="sign": "Type the sign" is a production step) passed at 46 px while ws-grade-render held it to 48.
//
//   touchKind(el)   in the page (inject with `${touchKind}`): 'working' for a carry / regroup / working box - .mq-carry,
//                   .column-carry-input, .mq-opswork, .mq-wwork, [data-mq-work], [data-ws-slot^="regroup"], .mq-regroup,
//                   or a class naming carry / regroup - EXCEPT a box whose data-mq-kind names an answer place (sign,
//                   answer): that is an 'answer'. Everything else typed is an 'answer'.
//   FLOOR           { answer: 48, working: 44 } on a tablet (SP-10, RUBRIC H6; fastest plan item 7)
//   isTablet(w)     the widths where FLOOR is judged: 600 < w <= 1100 (820, 1024)
//   floorAt(kind, w) the floor at a viewport width: FLOOR[kind] at every screen width >= 600 (tablets AND computers:
//                   SP-10 "digit inputs are at least 48 px tall" holds at every width; critic tt-r2 D6 - a 44 px
//                   computer floor weakened master's check); a phone (< 600, on request) 44
//   selfTest()      planted classes, no browser (a fake element) - `node tests/lib/touch-class.cjs --self-test`
'use strict';
function touchKind(el) {
    const ANSWER_KINDS = ['sign', 'answer'];
    const k = el.getAttribute ? el.getAttribute('data-mq-kind') : null;
    if (k && ANSWER_KINDS.includes(k)) return 'answer';
    const WORK = '.mq-carry, .column-carry-input, .mq-opswork, .mq-wwork, [data-mq-work], [data-ws-slot^="regroup"], .mq-regroup';
    const words = String(el.className || '') + ' ' + ((el.getAttribute && el.getAttribute('data-ws-slot')) || '');
    if (el.matches(WORK) || /carry|regroup/i.test(words)) return 'working';
    return 'answer';
}
const FLOOR = Object.freeze({ answer: 48, working: 44 });
const isTablet = (w) => w > 600 && w <= 1100;
// self-contained (no closure), so a page can take it as `${floorAt}` too
function floorAt(kind, w) {
    if (w >= 600) return kind === 'working' ? 44 : 48;
    return 44;
}
/** the two in-page functions as one injectable source: `page.evaluate(INJECT)` defines window.touchKind / window.floorAt */
const INJECT = `window.touchKind = ${touchKind}; window.floorAt = ${floorAt};`;

function selfTest() {
    // a fake element: classes, attributes, and the WORK selector's parts read from them
    const fake = (cls, attrs = {}) => ({
        className: cls,
        getAttribute: (a) => (a in attrs ? attrs[a] : null),
        matches: (sel) => sel.split(',').map((s) => s.trim()).some((s) => {
            if (s.startsWith('.')) return cls.split(/\s+/).includes(s.slice(1));
            const m = /^\[([a-z-]+)(\^=)?(?:"([^"]*)")?\]$/.exec(s);
            if (!m) return false;
            if (!(m[1] in attrs)) return false;
            return m[2] ? String(attrs[m[1]]).startsWith(m[3]) : true;
        }),
    });
    const cases = [
        ['sign circle mq-wwork.mq-gl-sign data-mq-kind=sign', fake('mq-wwork mq-gl-sign', { 'data-mq-kind': 'sign' }), 'answer'],
        ['word-work digit box mq-wwork data-mq-kind=digit', fake('mq-wwork', { 'data-mq-kind': 'digit' }), 'working'],
        ['word-work regroup box', fake('mq-wwork mq-wwsmall', { 'data-mq-kind': 'regroup' }), 'working'],
        ['carry box', fake('mq-carry'), 'working'],
        ['ops working row', fake('mq-work mq-opswork'), 'working'],
        ['regroup slot', fake('mq-cellslot', { 'data-ws-slot': 'regroup-1' }), 'working'],
        ['boxed answer slot', fake('mq-cellslot'), 'answer'],
        ['legacy fact-family input', fake('fact-family-input'), 'answer'],
    ];
    const bad = [];
    for (const [name, el, want] of cases) if (touchKind(el) !== want) bad.push(`${name}: ${touchKind(el)}, want ${want}`);
    // the floors: a 46 px sign circle fails on a tablet (both tools), a 44 px working box passes; a computer holds the same 48 / 44 (tt-r2 D6)
    const fl = [[floorAt('answer', 820), 48], [floorAt('answer', 1024), 48], [floorAt('working', 1024), 44], [floorAt('answer', 1280), 48], [floorAt('answer', 1366), 48], [floorAt('working', 1366), 44], [floorAt('answer', 390), 44]];
    fl.forEach(([got, want], i) => { if (got !== want) bad.push(`floor case ${i}: ${got}, want ${want}`); });
    const sign46 = 46 < floorAt(touchKind(cases[0][1]), 1024);
    if (!sign46) bad.push('a 46 px sign circle at 1024 must be under its floor');
    for (const b of bad) console.log(`  touch-class self-test FAIL: ${b}`);
    console.log(bad.length ? `touch-class: FAIL - self-test (${bad.length})` : `touch-class: OK (self-test, ${cases.length + fl.length + 1} cases)`);
    return bad.length;
}

module.exports = { touchKind, FLOOR, isTablet, floorAt, INJECT, selfTest };
if (require.main === module && process.argv.includes('--self-test')) process.exitCode = selfTest() ? 1 : 0;
