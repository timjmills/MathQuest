// Unit tests for the supports model (js/modules/sheet/supports.js, sheet/support-draw.js,
// design/SUPPORTS.md §S2). Pure node.
//
//   node tests/scripts/ws-supports-unit.mjs
//
// Checks:
//   - the allocator is DETERMINISTIC (same input, same output) and BALANCED (the alternatives of a
//     clash are dealt in equal shares, ±1);
//   - clashing supports are dealt SECTION BY SECTION (sections of their own, or equal blocks in one
//     section) and PROBLEM BY PROBLEM (alternating); compatible ones stack on every problem;
//   - it respects what each item can draw (`can`) and what it needs (coverage 'needed');
//   - FADE never increases down the page (each item's set is a subset, in support, of the one
//     before; touch dots step from count all to count on) and ends with none;
//   - touch dots on digits under 24 pt force size L for the whole section;
//   - the compatibility matrix is symmetric, over every support id;
//   - WORST-CASE RESERVATION: in every section, every item's on + reserve is the same set (what the
//     section could carry), so every cell has one geometry;
//   - the touch-dot plans: + count on = the smaller number, − = the number taken away, × = the
//     factor that is not the table, ÷ = none on the numerals (a tally row), columns column by column;
//   - the Support control of every skill offers only what the skill declares it can draw
//     (provider `supports` or the family default in providers/util.js), and its values have tokens.
// Prints `ws-supports-unit: OK` or `ws-supports-unit: FAIL` and exits non-zero on failure.

const mem = {};
globalThis.localStorage = globalThis.localStorage || { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
const quiet = console.log;
console.log = () => {};
const S = await import('../../js/modules/sheet/supports.js');
const D = await import('../../js/modules/sheet/support-draw.js');
const K = await import('../../js/modules/sheet/index.js');
const SO = await import('../../js/modules/skill-options.js');
const REG = await import('../../js/modules/skill-option-keys.js');
const DATA = await import('../../js/modules/data.js');
const U = await import('../../js/modules/sheet/providers/util.js');
console.log = quiet;

let pass = 0, fail = 0;
const ok = (name, cond, detail = '') => { if (cond) pass++; else { fail++; console.log(`  FAIL ${name} ${detail}`); } };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const items = (n, extra = {}) => Array.from({ length: n }, (_, i) => ({ section: 0, skill: 'x', ...(typeof extra === 'function' ? extra(i) : extra) }));

/* ---------------------------------------------------------------- alternatives + compat */
ok('alternatives touch|tile + boxsign', eq(S.alternativesOf(['touch', 'tile', 'boxsign']), [['touch', 'boxsign'], ['tile', 'boxsign']]), JSON.stringify(S.alternativesOf(['touch', 'tile', 'boxsign'])));
ok('alternatives stack', eq(S.alternativesOf(['touch', 'boxsign', 'steps']), [['touch', 'boxsign', 'steps']]));
ok('touch rungs clash', S.supportCompat('touch', 'touchall') === 'clash');
ok('touch + tile clash (owner example)', S.supportCompat('touch', 'tile') === 'clash');
ok('touch + boxsign stack', S.supportCompat('touch', 'boxsign') === 'ok');
let asym = 0;
for (const x of S.SUPPORT_IDS) for (const y of S.SUPPORT_IDS) if (S.supportCompat(x, y) !== S.supportCompat(y, x)) { asym++; if (asym < 4) console.log(`  asym ${x} ${y}`); }
ok('compat matrix symmetric', asym === 0, `${asym} pairs`);
ok('compat values', S.SUPPORT_IDS.every((x) => S.SUPPORT_IDS.every((y) => ['ok', 'wide', 'clash'].includes(S.supportCompat(x, y)))));

/* ---------------------------------------------------------------- determinism + balance */
{
    const it = items(12);
    const a = S.allocateSupports(it, ['touch', 'tile'], { mix: 'problem' });
    const b = S.allocateSupports(it, ['touch', 'tile'], { mix: 'problem' });
    ok('deterministic', eq(a, b));
    const touch = a.filter((r) => r.on.includes('touch')).length, tile = a.filter((r) => r.on.includes('tile')).length;
    ok('problem mix balanced', touch === 6 && tile === 6, `${touch}/${tile}`);
    ok('problem mix alternates', a.every((r, i) => r.on[0] === (i % 2 ? 'tile' : 'touch')), a.map((r) => r.on.join('+')).join(' '));
    for (const n of [5, 7, 11]) {
        const c = S.allocateSupports(items(n), ['touch', 'tile', 'line'], { mix: 'problem' });
        const counts = ['touch', 'tile', 'line'].map((x) => c.filter((r) => r.on.includes(x)).length);
        ok(`balanced ±1 (n=${n}, 3 clashing)`, Math.max(...counts) - Math.min(...counts) <= 1, counts.join('/'));
    }
}
/* ---------------------------------------------------------------- section mix */
{
    const two = [...items(4, { section: 0 }), ...items(4, { section: 1 })];
    const r = S.allocateSupports(two, ['touch', 'tile'], { mix: 'section' });
    ok('section mix: section A touch', r.slice(0, 4).every((x) => eq(x.on, ['touch'])), JSON.stringify(r.map((x) => x.on)));
    ok('section mix: section B tile', r.slice(4).every((x) => eq(x.on, ['tile'])));
    const one = S.allocateSupports(items(6), ['touch', 'tile'], { mix: 'section' });
    ok('section mix in one section: equal blocks', eq(one.map((x) => x.on[0]), ['touch', 'touch', 'touch', 'tile', 'tile', 'tile']), JSON.stringify(one.map((x) => x.on)));
    const cross = [...items(3, { section: 0, skill: 'add' }), ...items(3, { section: 1, skill: 'sub' })];
    const rc = S.allocateSupports(cross, { add: ['touch', 'tile'], sub: ['touch', 'tile'] }, { mix: 'section' });
    ok('section mix across skills: section A touch, section B tile', rc.slice(0, 3).every((x) => eq(x.on, ['touch'])) && rc.slice(3).every((x) => eq(x.on, ['tile'])), JSON.stringify(rc.map((x) => x.on)));
    const stack = S.allocateSupports(items(4), ['touch', 'boxsign'], { mix: 'section' });
    ok('compatible supports stack on every problem', stack.every((x) => eq(x.on, ['touch', 'boxsign'])));
}
/* ---------------------------------------------------------------- can + needed */
{
    const it = items(4, (i) => ({ can: i % 2 ? ['tile'] : ['touch', 'tile'] }));
    const r = S.allocateSupports(it, ['touch', 'tile'], { mix: 'problem' });
    ok('respects can', r.every((x, i) => x.on.every((s) => it[i].can.includes(s))), JSON.stringify(r.map((x) => x.on)));
    ok('an item that cannot draw its alternative takes the next', r[1].on.length === 1);
    const nd = S.allocateSupports(items(4, (i) => ({ need: { touch: i >= 2 } })), ['touch'], { coverage: 'needed' });
    ok('needed: only qualifying items', eq(nd.map((x) => x.on.length), [0, 0, 1, 1]));
}
/* ---------------------------------------------------------------- fade */
{
    const rank = (on) => on.reduce((s, x) => s + (x === 'touchall' ? 3 : x === 'touch' ? 2 : 1), 0);
    for (const chosen of [['touchall'], ['touchall', 'boxsign'], ['tile', 'boxsign'], ['round-pv'], ['touch', 'tile']]) {
        for (const n of [3, 6, 9, 10, 20]) {
            const r = S.allocateSupports(items(n), chosen, { coverage: 'fade', mix: 'problem' });
            let mono = true;
            for (let i = 1; i < n; i++) {
                const prev = r[i - 1].on, cur = r[i].on;
                if (r[i].level > r[i - 1].level) mono = false;
                if (r[i].level < r[i - 1].level && rank(cur) > rank(prev) && chosen.length === 1) mono = false;
            }
            ok(`fade monotonic ${chosen} n=${n}`, mono, JSON.stringify(r.map((x) => x.on)));
            ok(`fade ends with none ${chosen} n=${n}`, r[n - 1].on.length === 0);
            ok(`fade starts full ${chosen} n=${n}`, r[0].on.length > 0);
        }
    }
    const t = S.allocateSupports(items(6), ['touchall'], { coverage: 'fade' });
    ok('fade touch: count all -> count on -> none', eq(t.map((x) => x.on), [['touchall'], ['touchall'], ['touch'], ['touch'], [], []]), JSON.stringify(t.map((x) => x.on)));
    ok('fadeRung never increases', [1, 2, 3, 6, 7, 20].every((total) => { let last = 0; for (let i = 0; i < total; i++) { const r = S.fadeRung(i, 3, total); if (r < last) return false; last = r; } return last === 2 || total < 3; }));
    ok('fadeRung without a count: blocks of two', eq([0, 1, 2, 3, 4, 5, 6].map((i) => S.fadeRung(i, 3, undefined)), [0, 0, 1, 1, 2, 2, 2]));
    ok('fadeRung live play cycles', eq([0, 1, 2, 3].map((i) => S.fadeRung(i, 3, undefined, false)), [0, 1, 2, 0]));
}
/* ---------------------------------------------------------------- touch forcing L */
{
    const r = S.allocateSupports([...items(3, { section: 0, touchPt: 22 }), ...items(3, { section: 1, touchPt: 28 })], ['touch'], {});
    ok('touch under 24 pt forces L for the section', r.slice(0, 3).every((x) => x.forceL) && r.slice(3).every((x) => !x.forceL));
    const faded = S.allocateSupports(items(6, { touchPt: 16 }), ['touch'], { coverage: 'fade' });
    ok('forceL holds for the whole section, faded cells too', faded.every((x) => x.forceL));
}
/* ---------------------------------------------------------------- worst-case reservation */
{
    for (const [chosen, o] of [[['touch', 'tile'], { mix: 'problem' }], [['tile', 'boxsign'], { coverage: 'fade' }], [['frame', 'line'], { mix: 'section' }], [['touch'], { coverage: 'needed' }]]) {
        const it = items(8, (i) => ({ section: i < 4 ? 0 : 1, need: { touch: i % 3 === 0, tile: true, frame: true, line: true, boxsign: true } }));
        const r = S.allocateSupports(it, chosen, o);
        for (const s of [0, 1]) {
            const sets = r.filter((_, i) => it[i].section === s).map((x) => [...x.on, ...x.reserve].sort().join('+'));
            ok(`worst-case reserve ${chosen} ${JSON.stringify(o)} section ${s}`, new Set(sets).size === 1, JSON.stringify(sets));
            ok(`reserve disjoint from on ${chosen}`, r.every((x) => x.reserve.every((y) => !x.on.includes(y))));
        }
    }
}
/* ---------------------------------------------------------------- touch plans */
{
    const tn = (p, mode) => D.touchNumbers(Object.assign({ supports: { on: [mode === 'all' ? 'touchall' : 'touch'] } }, p));
    ok('+ count on: the smaller', eq(tn({ a: 8, b: 5, op: '+' }), { a: false, b: true }) && eq(tn({ a: 3, b: 9, op: '+' }), { a: true, b: false }));
    ok('+ count all: both', eq(tn({ a: 8, b: 5, op: '+' }, 'all'), { a: true, b: true }));
    ok('− count back: the number taken away', eq(tn({ a: 12, b: 5, op: '-' }), { a: false, b: true }));
    ok('× not the table number', eq(D.touchNumbers({ a: 6, b: 4, op: '*', supports: { on: ['touch'], table: 6 } }), { a: false, b: true }));
    ok('× no table: the smaller', eq(D.touchNumbers({ a: 3, b: 7, op: '*', supports: { on: ['touch'] } }), { a: true, b: false }));
    ok('÷ no dots on numerals', eq(tn({ a: 28, b: 4, op: '/' }), { a: false, b: false }));
    const cols = D.touchColumns(['47', '25'], 3, '+', 'on');
    ok('stack count on column by column', eq(cols, [[false, false, false], [false, true, true]]), JSON.stringify(cols));
    const sub = D.touchColumns(['52', '27'], 3, '-', 'on');
    ok('stack count back: bottom row', eq(sub, [[false, false, false], [false, true, true]]));
    const three = D.touchColumns(['41', '85', '17'], 3, '+', 'on');
    ok('three addends: all but the largest per column', eq(three, [[false, true, true], [false, false, true], [false, true, false]]), JSON.stringify(three));
}
/* ---------------------------------------------------------------- drawing: no answer, parity */
{
    const draw = (template, payload, supports) => K.renderCell({ cell: { template, payload: Object.assign({}, payload, supports ? { supports } : {}) } }, { mode: 'print', size: 'L' });
    const div = draw('fact', { a: 56, b: 7, op: '/', notation: 'horiz', digits: 2 }, { on: ['touch'], reserve: [], tally: 10 });
    ok('÷ tally row drawn', /ws-td-tally/.test(div) && /data-ws-tally="10"/.test(div));
    const tallyDots = (div.match(/class="ws-td-mark"/g) || []).length;
    ok('÷ tally row is 10 dots, never the quotient', tallyDots === 10, String(tallyDots));
    const f = draw('fact', { a: 7, b: 5, op: '+', notation: 'vertical', digits: 2 }, { on: ['touch'], reserve: ['tile'] });
    ok('fact touch: one number dotted', (f.match(/ws-td-svg/g) || []).length === 1);
    ok('reserve drawn invisibly', /data-ws-support-reserve="tile"[^>]*visibility:hidden/.test(f));
    // No answer inside a support: the answer digit strings never appear in support text.
    for (const [tpl, p, on] of [['fact', { a: 8, b: 6, op: '+', notation: 'vertical', digits: 2 }, ['tile', 'boxsign']], ['fact', { a: 9, b: 4, op: '-', notation: 'horiz', digits: 2 }, ['frame']], ['stack', { operands: [47, 25], op: '+' }, ['startarrow']]]) {
        const h = draw(tpl, p, { on, reserve: [] });
        const ans = String(p.op === '+' ? (p.a ?? 47) + (p.b ?? 25) : p.a - p.b);
        const parts = h.split(/data-ws-support-on="/).slice(1).map((x) => x.replace(/<[^>]+>/g, ' '));
        ok(`no answer in supports ${tpl} ${on}`, parts.every((t) => !new RegExp(`(^|\\D)${ans}(\\D|$)`).test(t.slice(0, 2000))));
    }
    const fp0 = K.cellFootprint({ cell: { template: 'fact', payload: { a: 7, b: 5, op: '+', digits: 2 } } }, { mode: 'print', size: 'L' });
    const fpT = K.cellFootprint({ cell: { template: 'fact', payload: { a: 7, b: 5, op: '+', digits: 2, supports: { on: ['touch'], reserve: [] } } } }, { mode: 'print', size: 'L' });
    ok('touch dots add no space; facts capped at 6 columns', fpT.hMm === fp0.hMm && fpT.wMm === fp0.wMm && fpT.maxCols <= 6);
    const fpC = K.cellFootprint({ cell: { template: 'fact', payload: { a: 7, b: 5, op: '+', digits: 2, supports: { on: [], reserve: ['tile'] } } } }, { mode: 'print', size: 'L' });
    const fpC2 = K.cellFootprint({ cell: { template: 'fact', payload: { a: 7, b: 5, op: '+', digits: 2, supports: { on: ['tile'], reserve: [] } } } }, { mode: 'print', size: 'L' });
    ok('a reserved support takes the same room as a drawn one', eq(fpC, fpC2));
}
/* ---------------------------------------------------------------- the Support controls */
{
    let checked = 0;
    // The support set spills into a second field (skill-option-keys.js SPILL_KEYS): either table.
    const union = { ...(REG.SPILL_KEYS && REG.SPILL_KEYS.support ? REG.tokenUnion(REG.SPILL_KEYS.support) : {}), ...REG.tokenUnion('support') };
    for (const [cat, list] of Object.entries(DATA.SKILLS)) {
        if (!Array.isArray(list)) continue;
        for (const sk of list) {
            if (!sk || sk.retired) continue;
            const def = SO.optionsFor(cat, sk.v).find((d) => d.id === 'support' && d.supportsModel);
            if (!def) continue;
            checked++;
            const declared = U.declaredSupports(cat, K.getProvider(cat, sk.v));
            const bad = def.render.filter((v) => !declared.includes(v));
            ok(`${cat}:${sk.v} offers only what it can draw`, !bad.length, bad.join(','));
            ok(`${cat}:${sk.v} support values have tokens`, def.values.every((x) => x.v in union));
            ok(`${cat}:${sk.v} render ids are support ids`, def.render.every((v) => S.SUPPORT_IDS.includes(v)));
            const defs = SO.offeredOptionsFor(cat, sk.v);
            const resting = defs.filter((d) => !(typeof d.appliesTo === 'function' && !d.appliesTo(SO.defaultOptions(cat, sk.v))));
            const on = defs.filter((d) => !(typeof d.appliesTo === 'function' && !d.appliesTo(Object.assign(SO.defaultOptions(cat, sk.v), { support: [def.render[0]] }))));
            ok(`${cat}:${sk.v} panel ≤ 5 controls at rest`, resting.length <= 5, String(resting.length));
            ok(`${cat}:${sk.v} cover appears once a support is on`, on.some((d) => d.id === 'cover') && !resting.some((d) => d.id === 'cover'));
        }
    }
    ok('support controls found', checked >= 20, String(checked));
}

console.log(`ws-supports-unit: ${fail ? 'FAIL' : 'OK'} (${pass} passed, ${fail} failed)`);
process.exit(fail ? 1 : 0);
