// gen-measurement.js - Measurement question generation (time, money, ruler, temperature, capacity)
import { state } from './state.js';
import { getSkillsForCategory } from './data.js';
import { optionsFor } from './skill-options.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, formatTime, timeToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify } from './svg-clock.js';
import { COLORS, STROKE, FONTS, softFill } from './design-tokens.js';
import { isTimeMoneySkill, generateTimeMoneyQuestion } from './gen-time-money.js';
import { k2Twin, fadeRung } from './sheet/index.js';

// O6 appearance (lane AP2): the value of an appearance control (`labels`, `bars`) for the skill
// being generated, or `dflt` when the skill has no such control. It never consumes a random
// number: the item is dealt exactly as before and only its drawing changes.
function _mLook(id, dflt) {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === id) || null; } catch (e) { def = null; }
    if (!def) return dflt;
    const o = state.skillOptions;
    const v = o && typeof o === 'object' ? o[id] : undefined;
    return def.values.some(x => x.v === v) ? v : def.default;
}

// AP2 round 3: the values ticked in a SET option (`forms`, `parts`) for the skill being generated,
// the option's default when none is ticked, or null when the skill has no such option.
function _mSet(id) {
    let def = null;
    try { def = optionsFor(state.category, state.skill).find(o => o.id === id) || null; } catch (e) { def = null; }
    if (!def || def.type !== 'set') return null;
    const o = state.skillOptions;
    const v = o && typeof o === 'object' ? o[id] : undefined;
    const legal = def.values.map(x => x.v);
    const t = Array.isArray(v) ? legal.filter(x => v.includes(x)) : [];
    if (t.length) return t;
    const d = Array.isArray(def.default) ? legal.filter(x => def.default.includes(x)) : [];
    return d.length ? d : legal;
}

// AP2 round 5 (critic figures-r6, L10): themes, question kinds, shapes, objects and the marks a
// ruler reads are DEALT from the seeded rng, never turned through by the item's place on the page
// (a pupil could read the pattern). The item index serves the Support level (it fades down a
// page, O3) and the answers already on the page (no answer on most of a page's items).
let _mLive = 0;
const _mAt = () => (Number.isFinite(state.itemIndex) ? state.itemIndex : (_mLive++));
const _mOnPage = () => Number.isFinite(state.itemIndex);
// The answers dealt so far on this page (a page restarts at item 0). An answer already on a
// third of the page is dealt again, so "2, 2, 1, 2" never fills a test.
let _mPageAns = [];
function _mNoteAnswer(at, ans) {
    if (at === 0) _mPageAns = [];
    _mPageAns.push(String(ans));
}
function _mFresh(at, ans) {
    if (at === 0) return true;
    const seen = _mPageAns.filter(a => a === String(ans)).length;
    return seen < Math.max(1, Math.ceil((at + 1) / 3));
}
/** A whole-number option value, or null (unset, "As dealt"). */
function _mNum(id) {
    const v = _mLook(id, null);
    const n = Number(v);
    return v !== null && v !== undefined && Number.isFinite(n) && n > 0 ? n : null;
}
/** The Support level of this item (O3): the ticked levels dealt most-support-first down a page. */
function _mLevel(at) {
    let t = _mSet('level');
    if (typeof t === 'number') t = [t];
    t = Array.isArray(t) ? t.map(Number).filter(Number.isFinite).sort((x, y) => y - x) : [];
    if (!t.length) return 1;
    return t[fadeRung(at, t.length, state.itemCount, _mOnPage())];
}

// A length in inches as a pupil writes it: 3, 1/2, 2 3/4 (a half never 2/4).
function _inchText(x) {
    const q4 = Math.round(x * 4);
    const w = Math.floor(q4 / 4), r = q4 % 4;
    const f = r === 0 ? '' : r === 2 ? '1/2' : `${r}/4`;
    return f ? (w ? `${w} ${f}` : f) : String(w);
}

// ── Regrouping/carry-box helper for multi-digit unit conversion multiplications ──
// Used when converting from a larger unit to a smaller one (e.g. m→cm, lb→oz)
// where the multiplication produces a carry. Mirrors the carry boxes shown
// above standard column-multiplication problems.
function _needsRegrouping(a, b) {
    // a × b: check if any digit-by-digit multiplication step produces a carry.
    if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
    const sa = String(Math.abs(Math.trunc(a)));
    const sb = String(Math.abs(Math.trunc(b)));
    for (const da of sa) {
        for (const db of sb) {
            if ((+da) * (+db) >= 10) return true;
        }
    }
    return false;
}

function _regroupBoxesHTML(numDigits) {
    // numDigits = how many carry boxes to show (one per place value column above).
    const n = Math.max(1, Math.min(8, numDigits | 0));
    const boxes = Array(n).fill('').map(() =>
        `<div style="display:inline-block;width:32px;height:32px;border:2px dashed #999;border-radius:6px;margin:0 3px;background:#fffbe6;"></div>`
    ).join('');
    return `<div style="text-align:center;margin-bottom:10px;">
        <div style="font-size:0.85rem;color:#666;margin-bottom:4px;font-style:italic;">Regrouping boxes (write your carries here):</div>
        <div>${boxes}</div>
    </div>`;
}

export function generateMeasurementQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // ===== GRADE 4 — CUSTOMARY LENGTH (4.MD.A.1) =====
            if (mappedSkill === 'length_customary') {
                const PAIRS = [
                    ['feet', 'inches', 12, 'foot'],
                    ['yards', 'feet', 3, 'yard'],
                    ['yards', 'inches', 36, 'yard'],
                    ['miles', 'feet', 5280, 'mile'],
                ];
                const sel = (typeof pick === 'function') ? pick(PAIRS) : PAIRS[Math.floor(Math.random() * PAIRS.length)];
                const big = sel[0], small = sel[1], factor = sel[2], bigSing = sel[3];
                const n = randInt(2, 12);
                return Object.assign(q, {
                    text: `How many ${small} are in ${n} ${big}?`,
                    ans: n * factor,
                    answerType: 'number',
                    hint: `1 ${bigSing} = ${factor} ${small}. Multiply ${n} × ${factor}.`,
                    skillLabel: 'Customary Length',
                    printFormat: 'standard'
                });
            }

            // ===== GRADE 4 — METRIC LENGTH (4.MD.A.1) =====
            if (mappedSkill === 'length_metric') {
                const PAIRS = [
                    ['m', 'cm', 100, 'meter'],
                    ['km', 'm', 1000, 'kilometer'],
                    ['cm', 'mm', 10, 'centimeter'],
                    ['m', 'mm', 1000, 'meter'],
                ];
                const sel = (typeof pick === 'function') ? pick(PAIRS) : PAIRS[Math.floor(Math.random() * PAIRS.length)];
                const big = sel[0], small = sel[1], factor = sel[2], bigName = sel[3];
                const n = randInt(2, 12);
                return Object.assign(q, {
                    text: `How many ${small} are in ${n} ${big}?`,
                    ans: n * factor,
                    answerType: 'number',
                    hint: `1 ${bigName} (${big}) = ${factor} ${small}. Multiply ${n} × ${factor}.`,
                    skillLabel: 'Metric Length',
                    printFormat: 'standard'
                });
            }

            // ===== ORDER OBJECTS BY LENGTH (Grade 1) =====
            if (mappedSkill === "order_objects_length") {
                // P12: `tiles` fixes how many objects are ordered (3 or 4); unset, it is dealt.
                const _oolN = (() => {
                    let def = null;
                    try { def = optionsFor(state.category, state.skill).find(o => o.id === 'tiles') || null; } catch (e) { def = null; }
                    const v = def && state.skillOptions ? Number(state.skillOptions.tiles) : NaN;
                    return v === 3 || v === 4 ? v : 0;
                })();
                const count = _oolN || rng(3, 4);
                const labels = ["A", "B", "C", "D"].slice(0, count);
                // Generate distinct lengths
                const lengths = [];
                const usedLens = new Set();
                for (let i = 0; i < count; i++) {
                    let len;
                    do { len = rng(2, 14); } while (usedLens.has(len));
                    usedLens.add(len);
                    lengths.push(len);
                }
                // Sorted order (shortest to longest)
                const indexed = labels.map((lbl, i) => ({ lbl, len: lengths[i] }));
                const sorted = [...indexed].sort((a, b) => a.len - b.len);
                const answerStr = sorted.map(s => s.lbl).join(", ");

                // Shuffled display order
                const displayOrder = shuffle([...indexed]);

                // Build bars SVG
                const barH = 28;
                const gap = 12;
                const maxBarW = 250;
                const maxLen = Math.max(...lengths);
                const svgH = count * (barH + gap) + 20;
                // Each labelled bar gets a distinct categorical color since
                // color identifies which letter the bar belongs to.
                const barColors = [COLORS.fill[4], COLORS.fill[0], COLORS.fill[1], COLORS.fill[2]];

                let barsSvg = '';
                displayOrder.forEach((item, i) => {
                    const y = 10 + i * (barH + gap);
                    const barW = Math.max(20, (item.len / maxLen) * maxBarW);
                    const color = barColors[labels.indexOf(item.lbl)];
                    barsSvg += `<rect x="30" y="${y}" width="${barW}" height="${barH}" fill="${color}" fill-opacity="0.6" stroke="${color}" stroke-width="${STROKE.normal}" rx="4"/>`;
                    barsSvg += `<text x="14" y="${y + barH / 2 + 5}" font-family='${FONTS.sans}' fill="var(--text-bright)" font-size="14" font-weight="800">${item.lbl}</text>`;
                });

                // Draggable letter tiles via dnd-generic widget
                const tiles = labels.map(lbl => ({ id: 't_' + lbl, label: lbl }));
                const ans = sorted.map(s => 't_' + s.lbl);

                q.text = `Order the objects from shortest to longest.`;
                q.ans = ans;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = tiles;
                q.orderLabel = 'shortest to longest';
                q.options = [];
                q.hint = `Compare the lengths of each bar above, then drag the letters into order from shortest to longest.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Order by Length</div>
                    <svg width="310" height="${svgH}" viewBox="0 0 310 ${svgH}" style="max-width:100%;">
                        ${barsSvg}
                    </svg>
                    <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">Drag the letters below into order from shortest to longest.</div>
                </div>`;
                q.skillLabel = 'Order Length';
                q.printFormat = 'dnd-generic';
                return;
            }

            // ===== MEASURE WITH NON-STANDARD UNITS (Grade 1) =====
            if (mappedSkill === "measure_nonstandard") {
                // Thematic per-object colors are intentional (real-world cue):
                // paperclips = grey, cubes = blue, crayons = orange, pencil = yellow,
                // eraser = pink, stick = brown. Tokenized where possible; outlines
                // standardized to STROKE.normal.
                const grey = COLORS.neutral, greyDark = '#64748b';
                const blue = COLORS.fill[0], orange = COLORS.fill[2];
                const units = [
                    { name: "paper clips", unitW: 22, color: grey, drawUnit: (x, y) => `<rect x="${x}" y="${y}" width="18" height="8" fill="${grey}" stroke="${greyDark}" stroke-width="${STROKE.normal}" rx="4"/><rect x="${x + 3}" y="${y + 2}" width="12" height="4" fill="none" stroke="${greyDark}" stroke-width="${STROKE.hair}" rx="2"/>` },
                    { name: "cubes", unitW: 24, color: blue, drawUnit: (x, y) => `<rect x="${x}" y="${y}" width="20" height="20" fill="${blue}" fill-opacity="0.5" stroke="${blue}" stroke-width="${STROKE.normal}"/>` },
                    { name: "crayons", unitW: 32, color: orange, drawUnit: (x, y) => `<rect x="${x + 4}" y="${y}" width="24" height="10" fill="${orange}" stroke="${orange}" stroke-width="${STROKE.normal}" rx="2"/><polygon points="${x + 28},${y} ${x + 32},${y + 5} ${x + 28},${y + 10}" fill="${orange}"/>` }
                ];
                const objects = [
                    { name: "pencil", lengthMult: 1, drawObj: (w) => `<rect x="15" y="20" width="${w}" height="12" fill="${orange}" stroke="${orange}" stroke-width="${STROKE.normal}" rx="2"/><polygon points="${15 + w},20 ${15 + w + 10},26 ${15 + w},32" fill="${COLORS.fill[4]}"/>` },
                    { name: "eraser", lengthMult: 0.6, drawObj: (w) => `<rect x="15" y="20" width="${w}" height="16" fill="${COLORS.fill[4]}" fill-opacity="0.5" stroke="${COLORS.fill[4]}" stroke-width="${STROKE.normal}" rx="3"/>` },
                    { name: "stick", lengthMult: 1.2, drawObj: (w) => `<rect x="15" y="22" width="${w}" height="8" fill="#a16207" stroke="#78350f" stroke-width="${STROKE.normal}" rx="1"/>` }
                ];

                const unit = pick(units);
                const obj = pick(objects);
                const unitCount = rng(3, 8);
                const objWidth = unitCount * unit.unitW;

                let unitsSvg = '';
                for (let i = 0; i < unitCount; i++) {
                    unitsSvg += unit.drawUnit(15 + i * unit.unitW, 50);
                }
                // Tick marks. O6 "Figure labels" (AP2): every unit numbered, the first only, or none.
                const _nsLabels = _mLook('labels', 'all');
                let ticks = '';
                for (let i = 0; i <= unitCount; i++) {
                    ticks += `<line x1="${15 + i * unit.unitW}" y1="${unit.name === 'cubes' ? 72 : 62}" x2="${15 + i * unit.unitW}" y2="${unit.name === 'cubes' ? 78 : 68}" stroke="var(--text-dim)" stroke-width="${STROKE.hair}"/>`;
                    if (i > 0 && (_nsLabels === 'all' || (_nsLabels === 'some' && i === 1))) {
                        ticks += `<text x="${15 + i * unit.unitW - unit.unitW / 2}" y="${unit.name === 'cubes' ? 88 : 78}" text-anchor="middle" font-family='${FONTS.sans}' fill="var(--text-dim)" font-size="10">${i}</text>`;
                    }
                }

                const svgW = objWidth + 40;
                const svgH = unit.name === 'cubes' ? 100 : 90;

                q.text = `How many ${unit.name} long is the ${obj.name}?`;
                q.ans = unitCount;
                q.answerType = "number";
                q.options = buildNumericOptions(unitCount);
                q.hint = `Count each ${unit.name.slice(0, -1)} lined up along the ${obj.name}. There are ${unitCount}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Measure with ${unit.name}</div>
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
                        ${obj.drawObj(objWidth)}
                        ${unitsSvg}
                        ${ticks}
                    </svg>
                    <div style="margin-top:8px;font-size:0.9rem;color:var(--text-bright);">The ${obj.name} is <span style="border-bottom:2px solid var(--accent-green);padding:0 12px;font-weight:700;">?</span> ${unit.name} long</div>
                </div>`;
                q.skillLabel = 'Non-standard';
                q.printFormat = 'measurement-nonstandard';
                return;
            }

            // ===== ESTIMATE LENGTH (Grade 2) =====
            if (mappedSkill === "estimate_length") {
                // Phase 4.5 batch 13: 25% multi-select-check "reasonable estimates of an object's length"
                if (Math.random() < 0.25) {
                    const subjects = [
                        { name: 'pencil',     unit: 'in', good: [5, 6, 7, 8],  bad: [1, 2, 24, 36] },
                        { name: 'door',       unit: 'ft', good: [6, 7, 8],     bad: [1, 2, 30, 50] },
                        { name: 'finger',     unit: 'in', good: [2, 3, 4],     bad: [12, 24, 36, 48] },
                        { name: 'classroom',  unit: 'ft', good: [20, 25, 30],  bad: [2, 3, 200, 500] },
                        { name: 'baseball bat', unit: 'in', good: [30, 32, 34], bad: [4, 6, 100, 200] },
                        { name: 'paperclip',  unit: 'in', good: [1, 2],        bad: [10, 12, 24, 36] }
                    ];
                    const subject = pick(subjects);
                    const goodOpts = shuffle([...subject.good]).slice(0, Math.min(3, subject.good.length));
                    const badOpts = shuffle([...subject.bad]).slice(0, 6 - goodOpts.length);
                    const all = shuffle([
                        ...goodOpts.map(v => ({ v, ok: true })),
                        ...badOpts.map(v => ({ v, ok: false }))
                    ]);
                    const opts = all.map((it, i) => ({
                        id: 'opt' + i,
                        label: `${it.v} ${subject.unit}`,
                        correct: it.ok
                    }));
                    if (!opts.some(o => o.correct)) opts[0].correct = true;
                    if (!opts.some(o => !o.correct)) opts[opts.length - 1].correct = false;
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL reasonable estimates of a ${subject.name}'s length.`;
                    q.answerType = 'multi-select-check';
                    q.options = opts;
                    q.ans = ans;
                    q.hint = `Think about how long a real ${subject.name} is. Pick every estimate that fits.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Estimate';
                    return;
                }
                // Phase 4.5 batch 13: 20% dnd-categorize variant — sort objects into Inches/Feet/Yards/Miles
                if (Math.random() < 0.20) {
                    const pool = [
                        { name: 'Pencil',         bin: 'in' },
                        { name: 'Crayon',         bin: 'in' },
                        { name: 'Paperclip',      bin: 'in' },
                        { name: 'Spoon',          bin: 'in' },
                        { name: 'Couch',          bin: 'ft' },
                        { name: 'Door height',    bin: 'ft' },
                        { name: 'Bed length',     bin: 'ft' },
                        { name: 'Car length',     bin: 'ft' },
                        { name: 'Football field', bin: 'yd' },
                        { name: 'Soccer field',   bin: 'yd' },
                        { name: 'Garden hose',    bin: 'yd' },
                        { name: 'Highway trip',   bin: 'mi' },
                        { name: 'River length',   bin: 'mi' },
                        { name: 'Marathon',       bin: 'mi' }
                    ];
                    // Pick 6 with spread across bins
                    const byBin = { in: [], ft: [], yd: [], mi: [] };
                    pool.forEach(p => byBin[p.bin].push(p));
                    Object.values(byBin).forEach(arr => shuffle(arr));
                    const items = [];
                    ['in', 'ft', 'yd', 'mi'].forEach(b => {
                        if (byBin[b].length) items.push(byBin[b].shift());
                    });
                    const remaining = ['in', 'ft', 'yd', 'mi'].flatMap(b => byBin[b]);
                    shuffle(remaining);
                    while (items.length < 6 && remaining.length) items.push(remaining.shift());
                    shuffle(items);

                    const tiles = items.map((it, i) => ({ id: 't' + i, label: it.name }));
                    const bins = [
                        { id: 'in', label: 'Inches' },
                        { id: 'ft', label: 'Feet' },
                        { id: 'yd', label: 'Yards' },
                        { id: 'mi', label: 'Miles' }
                    ];
                    const ans = {};
                    items.forEach((it, i) => { ans['t' + i] = it.bin; });
                    q.text = 'Sort each object by the unit you would use to measure its length.';
                    q.answerType = 'dnd-generic';
                    q.dndMode = 'categorize';
                    q.tiles = tiles;
                    q.bins = bins;
                    q.ans = ans;
                    q.options = [];
                    q.hint = 'Inches: small objects. Feet: room-sized. Yards: fields. Miles: long distances.';
                    q.printFormat = 'dnd-generic';
                    q.skillLabel = 'Estimate';
                    return;
                }
                const estimateItems = [
                    { name: "crayon", actual: 12, unit: "cm", reference: "A penny is about 2 cm wide" },
                    { name: "textbook", actual: 28, unit: "cm", reference: "A new pencil is about 19 cm long" },
                    { name: "door", actual: 200, unit: "cm", reference: "A yardstick is 91 cm long" },
                    { name: "paperclip", actual: 3, unit: "cm", reference: "Your pinky finger is about 1 cm wide" },
                    { name: "desk", actual: 60, unit: "cm", reference: "A ruler is 30 cm long" },
                    { name: "water bottle", actual: 22, unit: "cm", reference: "A dollar bill is about 15 cm long" },
                    { name: "shoe", actual: 25, unit: "cm", reference: "A new pencil is about 19 cm long" },
                    { name: "school bus", actual: 10, unit: "m", reference: "A car is about 4 m long" },
                    { name: "classroom", actual: 9, unit: "m", reference: "A door is about 2 m tall" },
                    { name: "basketball court", actual: 28, unit: "m", reference: "A car is about 4 m long" }
                ];

                const item = pick(estimateItems);
                // Create plausible wrong answers
                const wrongMults = [0.1, 0.3, 3, 10];
                const allOptions = [item.actual];
                for (const m of wrongMults) {
                    const wrong = Math.round(item.actual * m);
                    if (wrong > 0 && wrong !== item.actual && !allOptions.includes(wrong)) {
                        allOptions.push(wrong);
                    }
                }
                while (allOptions.length < 4) {
                    allOptions.push(rng(1, item.actual * 5));
                }

                q.text = `About how long is a ${item.name}?`;
                q.ans = `${item.actual} ${item.unit}`;
                q.answerType = "multiple-choice";
                q.options = shuffle(allOptions.slice(0, 4).map(v => `${v} ${item.unit}`));
                if (!q.options.includes(`${item.actual} ${item.unit}`)) {
                    q.options[0] = `${item.actual} ${item.unit}`;
                    q.options = shuffle(q.options);
                }
                q.hint = `Think about objects you know: ${item.reference}. Use that to estimate.`;

                // Draw reference item and target item
                const refBarW = 80;
                const targetBarW = Math.min(250, Math.max(20, refBarW * (item.actual / (item.unit === "m" ? 4 : 19))));

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Estimate the Length</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;display:inline-block;margin-bottom:15px;">
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:10px;font-weight:600;">Reference:</div>
                        <div style="font-size:1rem;color:var(--accent-cyan);font-weight:700;margin-bottom:15px;">${item.reference}</div>
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;font-weight:600;">How long is the ${item.name}?</div>
                        <svg width="280" height="60" viewBox="0 0 280 60" style="max-width:100%;">
                            <rect x="15" y="15" width="${Math.min(260, targetBarW)}" height="24" fill="${COLORS.fill[2]}" fill-opacity="0.5" stroke="${COLORS.fill[2]}" stroke-width="${STROKE.normal}" rx="4"/>
                            <text x="${15 + Math.min(260, targetBarW) / 2}" y="32" text-anchor="middle" font-family='${FONTS.sans}' fill="var(--text-bright)" font-size="12" font-weight="700">${item.name}</text>
                            <text x="${15 + Math.min(260, targetBarW) + 8}" y="32" font-family='${FONTS.sans}' fill="${COLORS.correct}" font-size="14" font-weight="800">?</text>
                        </svg>
                    </div>
                </div>`;
                q.skillLabel = 'Estimate';
                q.printFormat = 'measurement-estimate';
                return;
            }

            // ===== UNIT CONVERSIONS (Grade 4-5) =====
            if (mappedSkill === "unit_conversions") {
                // Phase 4.5 batch 13: 25% multi-select-check "equivalent measurements" variant
                if (Math.random() < 0.25) {
                    const targets = [
                        {
                            name: '1 yard',
                            good: ['3 feet', '36 inches', '3 ft', '36 in'],
                            bad:  ['12 inches', '1 foot', '100 cm', '5 feet', '24 inches', '2 yards', '6 feet']
                        },
                        {
                            name: '1 foot',
                            good: ['12 inches', '12 in'],
                            bad:  ['10 inches', '1 yard', '3 feet', '24 inches', '6 inches', '20 inches', '15 cm']
                        },
                        {
                            name: '1 meter',
                            good: ['100 cm', '1000 mm', '100 centimeters'],
                            bad:  ['10 cm', '1 km', '1000 m', '50 cm', '10 mm', '10 meters']
                        },
                        {
                            name: '1 kilometer',
                            good: ['1000 m', '1000 meters', '100,000 cm'],
                            bad:  ['100 m', '1 m', '1000 cm', '10 m', '1 mile', '500 m']
                        },
                        {
                            name: '1 pound',
                            good: ['16 ounces', '16 oz'],
                            bad:  ['1 ton', '8 ounces', '32 oz', '12 ounces', '100 grams', '1 kilogram']
                        },
                        {
                            name: '1 gallon',
                            good: ['4 quarts', '8 pints', '16 cups'],
                            bad:  ['2 quarts', '4 cups', '4 pints', '1 quart', '8 cups', '32 cups']
                        }
                    ];
                    const target = pick(targets);
                    const goodOpts = shuffle([...target.good]).slice(0, Math.min(3, target.good.length));
                    const badOpts = shuffle([...target.bad]).slice(0, 6 - goodOpts.length);
                    const all = shuffle([
                        ...goodOpts.map(v => ({ v, ok: true })),
                        ...badOpts.map(v => ({ v, ok: false }))
                    ]);
                    const opts = all.map((it, i) => ({
                        id: 'opt' + i,
                        label: it.v,
                        correct: it.ok
                    }));
                    if (!opts.some(o => o.correct)) opts[0].correct = true;
                    if (!opts.some(o => !o.correct)) opts[opts.length - 1].correct = false;
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL measurements equivalent to ${target.name}.`;
                    q.answerType = 'multi-select-check';
                    q.options = opts;
                    q.ans = ans;
                    q.hint = `Convert each option and pick every one that equals ${target.name}.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Conversions';
                    return;
                }
                const conversions = [
                    { from: "feet", to: "inches", factor: 12, maxFrom: 10, label: "1 foot = 12 inches" },
                    { from: "yards", to: "feet", factor: 3, maxFrom: 12, label: "1 yard = 3 feet" },
                    { from: "meters", to: "centimeters", factor: 100, maxFrom: 10, label: "1 meter = 100 cm" },
                    { from: "kilometers", to: "meters", factor: 1000, maxFrom: 5, label: "1 km = 1000 m" },
                    { from: "kilograms", to: "grams", factor: 1000, maxFrom: 5, label: "1 kg = 1000 g" },
                    { from: "liters", to: "milliliters", factor: 1000, maxFrom: 5, label: "1 L = 1000 mL" },
                    { from: "pounds", to: "ounces", factor: 16, maxFrom: 6, label: "1 pound = 16 ounces" },
                    { from: "gallons", to: "quarts", factor: 4, maxFrom: 8, label: "1 gallon = 4 quarts" },
                    { from: "cups", to: "fluid ounces", factor: 8, maxFrom: 8, label: "1 cup = 8 fl oz" }
                ];

                const conv = pick(conversions);
                // Randomly choose direction
                const direction = pick(["multiply", "divide"]);

                let fromVal, toVal, questionFrom, questionTo;
                if (direction === "multiply") {
                    fromVal = rng(1, conv.maxFrom);
                    toVal = fromVal * conv.factor;
                    questionFrom = conv.from;
                    questionTo = conv.to;
                    q.text = `How many ${conv.to} are in ${fromVal} ${conv.from}?`;
                    q.hint = `${conv.label}. Multiply: ${fromVal} x ${conv.factor} = ${toVal}`;
                } else {
                    fromVal = rng(1, conv.maxFrom) * conv.factor;
                    toVal = fromVal / conv.factor;
                    questionFrom = conv.to;
                    questionTo = conv.from;
                    q.text = `Convert ${fromVal} ${conv.to} to ${conv.from}.`;
                    q.hint = `${conv.label}. Divide: ${fromVal} / ${conv.factor} = ${toVal}`;
                }

                q.ans = toVal;
                q.answerType = "number";
                q.options = buildNumericOptions(toVal);

                // Draw conversion visual
                const arrowDir = direction === "multiply" ? "x " + conv.factor : "/ " + conv.factor;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Unit Conversions</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:12px;display:inline-block;">
                        <div style="display:flex;align-items:center;justify-content:center;gap:15px;flex-wrap:wrap;">
                            <div style="background:var(--accent-cyan);background:linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.1));padding:12px 20px;border-radius:10px;border:2px solid var(--accent-cyan);">
                                <div style="font-size:1.5rem;font-weight:800;color:var(--text-bright);">${direction === "multiply" ? fromVal : fromVal}</div>
                                <div style="font-size:0.8rem;color:var(--text-dim);font-weight:600;">${direction === "multiply" ? conv.from : conv.to}</div>
                            </div>
                            <div style="font-size:1.2rem;color:var(--accent-orange);font-weight:800;">${arrowDir}<br/><span style="font-size:1.5rem;">&#8594;</span></div>
                            <div style="background:var(--accent-green);background:linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1));padding:12px 20px;border-radius:10px;border:2px solid var(--accent-green);">
                                <div style="font-size:1.5rem;font-weight:800;color:var(--accent-green);">?</div>
                                <div style="font-size:0.8rem;color:var(--text-dim);font-weight:600;">${direction === "multiply" ? conv.to : conv.from}</div>
                            </div>
                        </div>
                        <div style="margin-top:15px;padding:8px 15px;background:rgba(168,85,247,0.1);border-radius:8px;font-size:0.85rem;color:var(--text-bright);">
                            <strong>Remember:</strong> ${conv.label}
                        </div>
                    </div>
                </div>`;

                // Regrouping boxes intentionally suppressed on conversion
                // problems — the focus is on the conversion factor, not column
                // multiplication. Students who need carry support fall back to
                // the calculator/scratch paper.

                q.skillLabel = 'Conversions';
                q.printFormat = 'measurement-conversions';
                return;
            }

            // ===== MASS, VOLUME & LIQUID (Grade 3) =====
            if (mappedSkill === "mass_volume_liquid") {
                // Phase 4.5 batch 11: 25% multi-select-check "items measured in grams (vs kilograms)"
                if (Math.random() < 0.25) {
                    const pool = [
                        { name: 'Paper clip',  unit: 'g'  },
                        { name: 'Penny',       unit: 'g'  },
                        { name: 'Pencil',      unit: 'g'  },
                        { name: 'Apple',       unit: 'g'  },
                        { name: 'Banana',      unit: 'g'  },
                        { name: 'Slice of bread', unit: 'g' },
                        { name: 'Bag of flour',  unit: 'kg' },
                        { name: 'Watermelon',    unit: 'kg' },
                        { name: 'Bowling ball',  unit: 'kg' },
                        { name: 'Bicycle',       unit: 'kg' },
                        { name: 'Backpack',      unit: 'kg' },
                        { name: 'Dog',           unit: 'kg' }
                    ];
                    const items = shuffle([...pool]).slice(0, 6);
                    const opts = items.map((it, i) => ({
                        id: 'opt' + i,
                        label: it.name,
                        correct: it.unit === 'g'
                    }));
                    if (!opts.some(o => o.correct)) opts[0].correct = true;
                    if (!opts.some(o => !o.correct)) opts[opts.length - 1].correct = false;
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = 'Click ALL items best measured in grams (not kilograms).';
                    q.answerType = 'multi-select-check';
                    q.options = opts;
                    q.ans = ans;
                    q.hint = 'Use grams for light items (under 1 kg). Use kilograms for heavier items.';
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Mass/Volume';
                    return;
                }
                // Phase 4.5 batch 11: 20% dnd-categorize variant — sort items into g/kg/mL/L bins
                if (Math.random() < 0.20) {
                    const pool = [
                        { name: 'Paper clip',     bin: 'g'  },
                        { name: 'Pencil',         bin: 'g'  },
                        { name: 'Apple',          bin: 'g'  },
                        { name: 'Watermelon',     bin: 'kg' },
                        { name: 'Bag of rice',    bin: 'kg' },
                        { name: 'Bicycle',        bin: 'kg' },
                        { name: 'Tea spoon water', bin: 'mL' },
                        { name: 'Eye drops',      bin: 'mL' },
                        { name: 'Soda can',       bin: 'mL' },
                        { name: 'Milk jug',       bin: 'L'  },
                        { name: 'Pitcher of juice', bin: 'L' },
                        { name: 'Aquarium',       bin: 'L'  }
                    ];
                    // Pick 6, ensuring spread across bins
                    const byBin = { g: [], kg: [], mL: [], L: [] };
                    pool.forEach(p => byBin[p.bin].push(p));
                    Object.values(byBin).forEach(arr => shuffle(arr));
                    const items = [];
                    // Take 1-2 from each bin, then pad to 6
                    ['g', 'kg', 'mL', 'L'].forEach(b => {
                        if (byBin[b].length) items.push(byBin[b].shift());
                    });
                    const remaining = ['g', 'kg', 'mL', 'L']
                        .flatMap(b => byBin[b]);
                    shuffle(remaining);
                    while (items.length < 6 && remaining.length) items.push(remaining.shift());
                    shuffle(items);

                    const tiles = items.map((it, i) => ({ id: 't' + i, label: it.name }));
                    const bins = [
                        { id: 'g',  label: 'Grams (g)' },
                        { id: 'kg', label: 'Kilograms (kg)' },
                        { id: 'mL', label: 'Milliliters (mL)' },
                        { id: 'L',  label: 'Liters (L)' }
                    ];
                    const ans = {};
                    items.forEach((it, i) => { ans['t' + i] = it.bin; });
                    q.text = 'Sort each item into the unit you would use to measure it.';
                    q.answerType = 'dnd-generic';
                    q.dndMode = 'categorize';
                    q.tiles = tiles;
                    q.bins = bins;
                    q.ans = ans;
                    q.options = [];
                    q.hint = 'Solids → g or kg (mass). Liquids → mL or L (volume).';
                    q.printFormat = 'dnd-generic';
                    q.skillLabel = 'Mass/Volume';
                    return;
                }
                const qType = pick(["graduated_cylinder", "scale"]);

                if (qType === "graduated_cylinder") {
                    const maxML = pick([100, 200, 500, 1000]);
                    const increment = maxML <= 100 ? 10 : maxML <= 200 ? 20 : maxML <= 500 ? 50 : 100;
                    const numMarks = maxML / increment;
                    const waterLevel = rng(1, numMarks - 1) * increment;

                    q.text = `Read the graduated cylinder. How many mL of water are there?`;
                    q.ans = waterLevel;
                    q.answerType = "number";
                    q.options = buildNumericOptions(waterLevel);
                    q.hint = `Look at where the water level lines up with the markings. Each mark is ${increment} mL.`;

                    // Draw graduated cylinder
                    const cylW = 70, cylH = 180;
                    const innerW = 50, innerH = 150;
                    const startX = 25, startY = 15;
                    const waterH = (waterLevel / maxML) * innerH;
                    const waterY = startY + innerH - waterH;

                    let marksSvg = '';
                    for (let i = 0; i <= numMarks; i++) {
                        const markY = startY + innerH - (i / numMarks) * innerH;
                        const isMainMark = i % 2 === 0 || numMarks <= 5;
                        marksSvg += `<line x1="${startX}" y1="${markY}" x2="${startX + (isMainMark ? 12 : 7)}" y2="${markY}" stroke="var(--text-bright)" stroke-width="${isMainMark ? STROKE.normal : STROKE.hair}"/>`;
                        marksSvg += `<line x1="${startX + innerW - (isMainMark ? 12 : 7)}" y1="${markY}" x2="${startX + innerW}" y2="${markY}" stroke="var(--text-bright)" stroke-width="${isMainMark ? STROKE.normal : STROKE.hair}"/>`;
                        if (isMainMark) {
                            marksSvg += `<text x="${startX - 4}" y="${markY + 4}" text-anchor="end" font-family='${FONTS.sans}' fill="var(--text-bright)" font-size="9" font-weight="600">${i * increment}</text>`;
                        }
                    }

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Read the Graduated Cylinder</div>
                        <svg width="120" height="${cylH + 20}" viewBox="0 0 120 ${cylH + 20}" style="max-width:100%;">
                            <!-- Cylinder body -->
                            <rect x="${startX}" y="${startY}" width="${innerW}" height="${innerH}" fill="white" fill-opacity="0.1" stroke="var(--text-bright)" stroke-width="${STROKE.normal}" rx="3"/>
                            <!-- Water -->
                            <rect x="${startX + 2}" y="${waterY}" width="${innerW - 4}" height="${waterH}" fill="${COLORS.primary}" fill-opacity="0.4" rx="1"/>
                            <!-- Water surface meniscus -->
                            <ellipse cx="${startX + innerW / 2}" cy="${waterY}" rx="${innerW / 2 - 4}" ry="3" fill="${COLORS.primary}" fill-opacity="0.3"/>
                            <!-- Graduation marks -->
                            ${marksSvg}
                            <!-- Base -->
                            <rect x="${startX - 5}" y="${startY + innerH}" width="${innerW + 10}" height="8" fill="var(--text-bright)" fill-opacity="0.15" stroke="var(--text-bright)" stroke-width="${STROKE.normal}" rx="2"/>
                            <!-- Arrow pointing to water level -->
                            <polygon points="105,${waterY} 95,${waterY - 5} 95,${waterY + 5}" fill="${COLORS.correct}"/>
                            <text x="108" y="${waterY + 4}" font-family='${FONTS.sans}' fill="${COLORS.correct}" font-size="11" font-weight="700">?</text>
                            <!-- Unit label -->
                            <text x="${startX + innerW / 2}" y="${startY + innerH + 18}" text-anchor="middle" font-family='${FONTS.sans}' fill="var(--text-dim)" font-size="10" font-weight="600">mL</text>
                        </svg>
                    </div>`;
                } else {
                    // Scale reading
                    const maxKg = pick([1, 2, 5, 10]);
                    const unitLabel = maxKg <= 2 ? "g" : "kg";
                    const maxVal = maxKg <= 2 ? maxKg * 1000 : maxKg;
                    const increment = maxKg <= 1 ? 100 : maxKg <= 2 ? 200 : maxKg <= 5 ? 500 : 1000;
                    const gIncrement = unitLabel === "g" ? increment : increment;
                    const numMarks = maxVal / increment;
                    const reading = rng(1, numMarks - 1) * increment;

                    q.text = `Read the scale. What is the mass in ${unitLabel}?`;
                    q.ans = reading;
                    q.answerType = "number";
                    q.options = buildNumericOptions(reading);
                    q.hint = `Look at where the pointer points. Each mark is ${increment} ${unitLabel}.`;

                    // Draw a simple dial scale
                    const scaleCX = 110, scaleCY = 130, scaleR = 80;
                    const startAngleDeg = 210, endAngleDeg = 330;
                    const angleRange = endAngleDeg - startAngleDeg;

                    let dialMarks = '';
                    for (let i = 0; i <= numMarks; i++) {
                        const frac = i / numMarks;
                        const angleDeg = startAngleDeg + frac * angleRange;
                        const angleRad = angleDeg * Math.PI / 180;
                        const x1 = scaleCX + (scaleR - 10) * Math.cos(angleRad);
                        const y1 = scaleCY + (scaleR - 10) * Math.sin(angleRad);
                        const x2 = scaleCX + scaleR * Math.cos(angleRad);
                        const y2 = scaleCY + scaleR * Math.sin(angleRad);
                        const lx = scaleCX + (scaleR + 14) * Math.cos(angleRad);
                        const ly = scaleCY + (scaleR + 14) * Math.sin(angleRad);
                        dialMarks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--text-bright)" stroke-width="${STROKE.normal}"/>`;
                        dialMarks += `<text x="${lx}" y="${ly + 3}" text-anchor="middle" font-family='${FONTS.sans}' fill="var(--text-bright)" font-size="9" font-weight="600">${i * increment}</text>`;
                    }

                    // Pointer
                    const pointerFrac = reading / maxVal;
                    const pointerAngleDeg = startAngleDeg + pointerFrac * angleRange;
                    const pointerAngleRad = pointerAngleDeg * Math.PI / 180;
                    const ptrX = scaleCX + (scaleR - 20) * Math.cos(pointerAngleRad);
                    const ptrY = scaleCY + (scaleR - 20) * Math.sin(pointerAngleRad);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Read the Scale</div>
                        <svg width="220" height="180" viewBox="0 0 220 180" style="max-width:100%;">
                            <!-- Scale arc -->
                            <path d="M ${scaleCX + scaleR * Math.cos(startAngleDeg * Math.PI / 180)} ${scaleCY + scaleR * Math.sin(startAngleDeg * Math.PI / 180)} A ${scaleR} ${scaleR} 0 0 1 ${scaleCX + scaleR * Math.cos(endAngleDeg * Math.PI / 180)} ${scaleCY + scaleR * Math.sin(endAngleDeg * Math.PI / 180)}" fill="none" stroke="var(--text-bright)" stroke-width="${STROKE.bold}"/>
                            ${dialMarks}
                            <!-- Pointer -->
                            <line x1="${scaleCX}" y1="${scaleCY}" x2="${ptrX}" y2="${ptrY}" stroke="${COLORS.correct}" stroke-width="${STROKE.bold}" stroke-linecap="round"/>
                            <circle cx="${scaleCX}" cy="${scaleCY}" r="5" fill="${COLORS.correct}"/>
                            <!-- Unit label -->
                            <text x="${scaleCX}" y="${scaleCY + 25}" text-anchor="middle" font-family='${FONTS.sans}' fill="var(--text-dim)" font-size="12" font-weight="700">${unitLabel}</text>
                        </svg>
                        <div style="margin-top:5px;font-size:1rem;color:var(--text-bright);">Mass = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;font-weight:700;">?</span> ${unitLabel}</div>
                    </div>`;
                }

                q.skillLabel = 'Mass/Volume';
                q.printFormat = 'measurement-mass-volume';
                return;
            }

            // ===== HEAVIER / LIGHTER VISUAL (Grade K) =====
            // Phase 5 batch 1: 2-3 emoji items, ask "Which is heavier?" or "Which is lighter?"
            if (mappedSkill === "heavier_lighter_visual") {
                const WEIGHTS = { '🪶': 1, '🍃': 1, '🍎': 3, '📕': 5, '🐕': 7, '🚗': 9, '🚛': 10 };
                const allItems = Object.keys(WEIGHTS);
                const numChoices = pick([2, 3]);
                // Pick numChoices distinct items with distinct weights
                const chosen = [];
                const usedWeights = new Set();
                const shuffled = shuffle([...allItems]);
                for (const it of shuffled) {
                    if (chosen.length >= numChoices) break;
                    if (!usedWeights.has(WEIGHTS[it])) {
                        chosen.push(it);
                        usedWeights.add(WEIGHTS[it]);
                    }
                }
                // Fallback if too few distinct weights
                while (chosen.length < numChoices) {
                    const it = pick(allItems);
                    if (!chosen.includes(it)) chosen.push(it);
                }

                const askHeavier = Math.random() < 0.5;
                const sorted = [...chosen].sort((a, b) => WEIGHTS[a] - WEIGHTS[b]);
                const correct = askHeavier ? sorted[sorted.length - 1] : sorted[0];

                q.text = askHeavier ? `Which is heavier?` : `Which is lighter?`;
                q.ans = correct;
                q.answerType = "multiple-choice";
                q.options = shuffle([...chosen]);
                q.hint = askHeavier
                    ? `Picture each object in real life. Which one would feel hardest to lift?`
                    : `Picture each object in real life. Which one would feel easiest to lift?`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">${askHeavier ? 'Heavier' : 'Lighter'}?</div>
                    <div style="display:flex;justify-content:center;gap:18px;flex-wrap:wrap;background:var(--bg-card);border-radius:12px;padding:14px;">
                        ${chosen.map(it => `<span style="font-size:2.6rem;">${it}</span>`).join('')}
                    </div>
                </div>`;
                q.skillLabel = "Heavier/Lighter";
                q.printFormat = "heavier-lighter";
                q.weightData = { items: chosen, askHeavier, correct };
                return;
            }

            // ===== PICTOGRAPH INTRO (Grade K) =====
            // A kit cell (sheet/cells/figures.js `pictograph`), drawn the same on paper, in the key and
            // on the three screen hosts. AP2 round 4 (critic round 5): every row is drawn with ITS OWN
            // picture (circles as circles, balls as balls - never another row's object), or one plain
            // circle for every row (O6 "Pictures"); one picture for one; the key beside the table.
            // "Counts up to" 5 or 10, 2 or 3 rows, and the Support level prints the grey count under
            // each picture (a hint that fades).
            if (mappedSkill === "pictograph_intro") {
                const themes = [
                    { title: 'Shapes in the Box', items: [['Circles', 'circle'], ['Squares', 'square'], ['Stars', 'star'], ['Triangles', 'triangle']],
                        cat: 'Shape', val: 'Number of shapes', count: c => `How many ${c.toLowerCase()}?`,
                        more: (a, b) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Things We Picked Up', items: [['Balls', 'ball'], ['Apples', 'apple'], ['Flowers', 'flower']],
                        cat: 'Thing', val: 'How many', count: c => `How many ${c.toLowerCase()}?`,
                        more: (a, b) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Stickers We Have', items: [['Stars', 'star'], ['Fish', 'fish'], ['Flowers', 'flower']],
                        cat: 'Thing', val: 'How many', count: c => `How many ${c.toLowerCase()}?`,
                        more: (a, b) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                ];
                const at = _mAt();
                const forms = _mSet('forms') || [0, 1];
                const most = _mNum('most') || 5;
                let theme, rows, cats, counts, ask, text, ans, askType;
                for (let tries = 0; tries < 8; tries++) {
                    theme = pick(themes);
                    const numCats = Math.min(_mNum('tiles') || pick([2, 3]), theme.items.length);
                    rows = shuffle([...theme.items]).slice(0, numCats);
                    cats = rows.map(r => r[0]);
                    counts = cats.map(() => randInt(1, most));
                    askType = pick(forms.map(f => ['count', 'more'][f]).filter(Boolean)) || 'count';
                    if (askType === 'more') {
                        // two rows set apart by 1 to most - 1, the larger at random
                        const [i, j] = shuffle([...cats.keys()]).slice(0, 2);
                        counts[j] = randInt(1, most - 1);
                        counts[i] = counts[j] + randInt(1, most - counts[j]);
                        ans = counts[i] - counts[j];
                        text = theme.more(cats[i], cats[j]);
                        ask = { kind: 'more', i, j };
                    } else {
                        // a count on a graph whose rows differ (never every row the same)
                        if (Math.max(...counts) === Math.min(...counts) && counts.length > 1) counts[1] = counts[1] < most ? counts[1] + 1 : counts[1] - 1;
                        const i = randInt(0, cats.length - 1);
                        ans = counts[i];
                        text = theme.count(cats[i]);
                        ask = { kind: 'value', i };
                    }
                    if (_mFresh(at, ans)) break;
                }
                _mNoteAnswer(at, ans);
                const plain = _mLook('objects', 'pictures') === 'shapes';
                const payload = { title: theme.title, categories: cats, values: counts, scale: 1,
                    icons: rows.map(r => (plain ? 'circle' : r[1])), catTitle: theme.cat, valTitle: theme.val, ask,
                    kinds: forms.map(f => ['value', 'more'][f]).filter(Boolean), scales: [1], question: text, answer: ans, support: _mLevel(at), widest: most };
                q.cell = { template: 'pictograph', v: 1, payload };
                q.visual = k2Twin('pictograph', payload);
                q.text = text;
                q.screenInstr = 'Use the picture graph. Answer the question.';
                q.ans = ans;
                q.answerType = "number";
                q.options = [];
                q.hint = `Each picture stands for 1. Count the pictures in the row.`;
                q.skillLabel = "Picture Graph";
                q.printFormat = "pictograph-intro";
                q.dataData = { title: theme.title, categories: cats, values: counts, scale: 1, askType,
                    askIdx: ask.i, askIdx2: ask.j != null ? ask.j : null };
                return;
            }

            // ===== BAR GRAPH INTRO (Grade K) =====
            // A kit cell (sheet/cells/figures.js `bar-graph`), drawn the same on paper, in the key and on
            // the three screen hosts: 2-3 bars ("Bars", O1) on a full numbered scale to 5 or 10 ("Tallest
            // bar up to", O2), axis titles in words, no number over any bar. "Which has the most?" is one
            // check box (the most is never a tie); a count one box. A page turns through its themes and
            // question kinds (AP2 round 4); the Support level draws the grey read-across (a hint).
            if (mappedSkill === "bar_graph_intro") {
                const themes = [
                    { title: 'Pets in Our Class', items: ['Cats', 'Dogs', 'Birds'], cat: 'Pet', val: 'Number of pets',
                        count: c => `How many ${c.toLowerCase()}?`, more: (a, b) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Snacks We Like', items: ['Apples', 'Grapes', 'Pears'], cat: 'Snack', val: 'Number of children',
                        count: c => `How many children like ${c.toLowerCase()}?`, more: (a, b) => `How many more children like ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Favorite Colors', items: ['Red', 'Blue', 'Green'], cat: 'Color', val: 'Number of children',
                        count: c => `How many children like ${c.toLowerCase()}?`, more: (a, b) => `How many more children like ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Sports We Play', items: ['Soccer', 'Tennis', 'Golf'], cat: 'Sport', val: 'Number of children',
                        count: c => `How many children play ${c.toLowerCase()}?`, more: (a, b) => `How many more children play ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Books on the Shelf', items: ['Animal', 'Comic', 'Nature'], cat: 'Kind of book', val: 'Number of books',
                        count: c => `How many ${c.toLowerCase()} books?`, more: (a, b) => `How many more ${a.toLowerCase()} books than ${b.toLowerCase()} books?` },
                ];
                const at = _mAt();
                const top = _mNum('most') || 5;
                // the kinds the teacher ticked (forms: 0 most, 1 how many, 2 how many more), dealt
                const forms = _mSet('forms') || [0, 1, 2];
                const order = [1, 2, 0].filter(f => forms.includes(f));
                let theme, cats, counts, ask, text, ans, askType;
                for (let tries = 0; tries < 8; tries++) {
                    theme = pick(themes);
                    const numCats = Math.min(_mNum('tiles') || pick([2, 3]), theme.items.length);
                    // the bars in a dealt order, so the tallest is not the first bar
                    cats = shuffle(theme.items.slice()).slice(0, numCats);
                    counts = cats.map(() => randInt(1, top));
                    askType = ['most', 'count', 'more'][pick(order.length ? order : [1])] || 'count';
                    if (askType === 'most') {
                        // one bar is the most: a tie is broken at a dealt bar
                        const maxVal = Math.max(...counts);
                        const tops = shuffle(counts.map((c, i) => (c === maxVal ? i : -1)).filter(i => i >= 0));
                        if (tops.length > 1) { if (counts[tops[0]] < top) counts[tops[0]]++; else counts[tops[1]]--; }
                        ans = cats[counts.indexOf(Math.max(...counts))];
                        text = 'Which has the most?';
                        ask = { kind: 'most' };
                    } else if (askType === 'more') {
                        const [i, j] = shuffle([...cats.keys()]).slice(0, 2);
                        counts[j] = randInt(1, top - 1);
                        counts[i] = counts[j] + randInt(1, top - counts[j]);
                        ans = counts[i] - counts[j];
                        text = theme.more(cats[i], cats[j]);
                        ask = { kind: 'more', i, j };
                    } else {
                        if (Math.max(...counts) === Math.min(...counts) && counts.length > 1) counts[1] = counts[1] < top ? counts[1] + 1 : counts[1] - 1;
                        const i = randInt(0, cats.length - 1);
                        ans = counts[i];
                        text = theme.count(cats[i]);
                        ask = { kind: 'value', i };
                    }
                    if (_mFresh(at, ans)) break;
                }
                _mNoteAnswer(at, ans);
                const orientation = _mLook('bars', 'vertical') === 'horizontal' ? 'horizontal' : 'vertical';
                const payload = { title: theme.title, categories: cats, values: counts, step: 1, top, half: false,
                    orientation, catTitle: theme.cat, valTitle: theme.val, ask,
                    kinds: order.map(f => ['most', 'value', 'more'][f]), question: text, answer: ans, support: _mLevel(at) };
                q.cell = { template: 'bar-graph', v: 1, payload };
                q.visual = k2Twin('bar-graph', payload);
                q.text = text;
                q.screenInstr = 'Use the graph. Answer the question.';
                q.ans = ans;
                q.options = [];
                if (askType === 'most') { q.answerType = 'text'; q.selfAnswering = true; q.printAnswer = ans; }
                else q.answerType = 'number';
                q.hint = orientation === 'horizontal' ? 'Look at how long each bar is. The numbers along the bottom tell you how many.'
                    : 'Look at the height of each bar. The numbers up the side tell you how many.';
                q.skillLabel = "Bar Graph Intro";
                q.printFormat = "bar-graph-intro";
                q.dataData = { title: theme.title, categories: cats, values: counts, scale: 1, ...(orientation === 'horizontal' ? { bars: 'horizontal' } : {}) };
                return;
            }

            // ===== PERIMETER INTRO (Grade 3, 3.MD.D.8) =====
            // A kit cell (sheet/cells/figures.js `perimeter-shape`): a rectangle, square, triangle or
            // five-sided house drawn to scale, each side labelled with its length and a real unit at
            // the working digit size, "Perimeter = [ ] cm" under it. O6 "Figure labels: some" labels
            // only the sides that cannot be worked out (equal opposite sides, equal walls and roof
            // edges); a triangle keeps all three. AP2 round 4 (critic round 5): "Shapes" (O1) picks the
            // kinds and a page turns through them (never four rectangles), "Perimeter up to" reaches
            // 50, and the Support level prints a grey addition frame, one line a side (a hint).
            if (mappedSkill === "perimeter_intro") {
                const at = _mAt();
                const kindsOn = _mSet('shapes') || [0, 1, 2, 3];
                const order = [0, 2, 1, 3].filter(k => kindsOn.includes(k));
                const kind = ['rectangle', 'square', 'triangle', 'pentagon'][pick(order.length ? order : [0])];
                const band = _mNum('band');
                const sideMax = band ? Math.max(4, Math.min(15, Math.floor(band / 3.2))) : 10;
                // "Perimeter up to" (default about 40) is the bound the page keeps: a deal past it is
                // dealt again (critic figures-r6: "Up to about 40" dealt 44)
                const limit = band || 40;
                let shape = kind, sides, sideLabels;
                for (let tries = 0; tries < 40; tries++) {
                if (kind === 'rectangle') {
                    const w = randInt(2, Math.max(2, sideMax - 1));
                    let l = randInt(2, sideMax);
                    if (l === w) l = w + 1 <= sideMax ? w + 1 : w - 1;
                    sides = [l, w, l, w];                    // top, left, bottom, right
                    sideLabels = { length: l, width: w };
                } else if (kind === 'square') {
                    const e = randInt(2, Math.min(sideMax, 12));
                    sides = [e, e, e, e];
                    sideLabels = { side: e };
                } else if (kind === 'triangle') {
                    // three different-looking sides, the longest along the bottom
                    const a = randInt(3, sideMax), b = randInt(3, sideMax);
                    const cMax = Math.min(sideMax, a + b - 1), cMin = Math.max(3, Math.abs(a - b) + 1);
                    const c = cMin <= cMax ? randInt(cMin, cMax) : a;
                    const t = [a, b, c].sort((x, y) => y - x);
                    sides = [t[0], t[1], t[2]];              // base, right, left
                    sideLabels = { a: t[0], b: t[1], c: t[2] };
                } else {
                    // a house: base, two equal walls, two equal roof edges (each longer than half the base)
                    const base = 2 * randInt(2, Math.max(2, Math.floor(sideMax / 2)));
                    const wall = randInt(2, Math.max(2, sideMax - 2));
                    const roof = randInt(base / 2 + 1, Math.max(base / 2 + 1, Math.min(sideMax, base)));
                    sides = [base, wall, roof, roof, wall];  // base, right wall, right roof, left roof, left wall
                    sideLabels = { base, wall, roof };
                }
                if (sides.reduce((x, y) => x + y, 0) <= limit) break;
                }
                const ans = sides.reduce((x, y) => x + y, 0);
                const unit = pick(['cm', 'm']);
                const some = _mLook('labels', 'all') === 'some' && shape !== 'triangle';
                // "some": the sides a pupil can work out stay blank (a rectangle's bottom and right; a
                // house's left roof and left wall)
                const show = sides.map((_, i) => !some || (shape === 'pentagon' ? i < 3 : i < 2));
                const payload = { shape, sides, show, unit, ans, support: _mLevel(at) };
                q.cell = { template: 'perimeter-shape', v: 1, payload };
                q.visual = k2Twin('perimeter-shape', payload);
                q.text = 'Add the lengths of all the sides. Write the perimeter.';
                q.screenInstr = 'Add the lengths of all the sides. Write the perimeter.';
                q.ans = ans;
                q.answerType = "number";
                q.options = [];
                q.hint = some ? 'A side with no number is as long as the side that matches it. Add all the sides.' : 'Add the lengths of all the sides.';
                q.skillLabel = "Perimeter Intro";
                q.printFormat = "perimeter-intro";
                q.perimeterIntroData = { shape, sides, sideLabels, ans, unit, ...(some ? { labels: 'some' } : {}) };
                return;
            }

            // ===== UNIT CONVERSION WORD (Grade 4) =====
            // Phase 5 batch 3: word problem with 1-2 unit conversions using a fixed conversion table
            if (mappedSkill === "unit_conversion_word") {
                const conversions = [
                    { from: 'km', to: 'm', factor: 1000, type: 'length', singular: 'kilometer', metric: true },
                    { from: 'm', to: 'cm', factor: 100, type: 'length', singular: 'meter', metric: true },
                    { from: 'cm', to: 'mm', factor: 10, type: 'length', singular: 'centimeter', metric: true },
                    { from: 'lb', to: 'oz', factor: 16, type: 'weight', singular: 'pound', metric: false },
                    { from: 'ft', to: 'in', factor: 12, type: 'length', singular: 'foot', metric: false },
                    { from: 'yd', to: 'ft', factor: 3, type: 'length', singular: 'yard', metric: false },
                    { from: 'hr', to: 'min', factor: 60, type: 'time', singular: 'hour', metric: false },
                    { from: 'min', to: 'sec', factor: 60, type: 'time', singular: 'minute', metric: false },
                    { from: 'gal', to: 'qt', factor: 4, type: 'volume', singular: 'gallon', metric: false },
                    { from: 'qt', to: 'pt', factor: 2, type: 'volume', singular: 'quart', metric: false },
                    { from: 'pt', to: 'cup', factor: 2, type: 'volume', singular: 'pint', metric: false },
                    { from: 'L', to: 'mL', factor: 1000, type: 'volume', singular: 'liter', metric: true },
                    { from: 'kg', to: 'g', factor: 1000, type: 'weight', singular: 'kilogram', metric: true },
                ];

                const contextsByType = {
                    length: [
                        { actor: 'Maya', verb: 'ran', objSingular: 'distance' },
                        { actor: 'Liam', verb: 'biked', objSingular: 'distance' },
                        { actor: 'A snail', verb: 'crawled', objSingular: 'distance' },
                        { actor: 'A snake', verb: 'measured', objSingular: 'length' },
                    ],
                    weight: [
                        { actor: 'A bag of apples', verb: 'weighs', objSingular: 'weight' },
                        { actor: 'A sack of flour', verb: 'weighs', objSingular: 'weight' },
                        { actor: 'A dog', verb: 'weighs', objSingular: 'weight' },
                    ],
                    volume: [
                        { actor: 'A jug', verb: 'holds', objSingular: 'volume' },
                        { actor: 'A pot', verb: 'holds', objSingular: 'volume' },
                        { actor: 'A bottle', verb: 'contains', objSingular: 'volume' },
                    ],
                    time: [
                        { actor: 'A movie', verb: 'lasted', objSingular: 'time' },
                        { actor: 'A class', verb: 'lasted', objSingular: 'time' },
                        { actor: 'A bus ride', verb: 'took', objSingular: 'time' },
                    ],
                };

                // Pick whether to do single- or two-step conversion
                const isTwoStep = Math.random() < 0.3;

                const conv = pick(conversions);
                const ctx = pick(contextsByType[conv.type]);

                // Pick a clean amount: integers for single-step large factors; small integers for two-step
                let amount;
                if (isTwoStep) {
                    amount = randInt(1, 6);
                } else {
                    if (conv.factor >= 100) {
                        amount = pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
                    } else if (conv.factor >= 10) {
                        amount = randInt(2, 12);
                    } else {
                        amount = randInt(2, 15);
                    }
                }

                // Pluralize unit names that are common English words ('cup' -> 'cups').
                // Leave abbreviations like 'm', 'cm', 'mL' alone.
                const wordUnits = new Set(['cup', 'pound', 'ounce', 'foot', 'inch', 'yard', 'gallon', 'quart', 'pint', 'minute', 'second', 'hour', 'day']);
                const pluralize = (u) => wordUnits.has(u) ? u + 's' : u;

                // Compute answer
                let ans, text, hint;
                if (!isTwoStep) {
                    ans = amount * conv.factor;
                    text = `${ctx.actor} ${ctx.verb} ${amount} ${pluralize(conv.from)}. How many ${pluralize(conv.to)} is that?`;
                    hint = `1 ${conv.from} = ${conv.factor} ${pluralize(conv.to)}. Multiply ${amount} × ${conv.factor}.`;
                } else {
                    // Two-step: chain conv with another whose .from matches conv.to
                    const next = conversions.find(c => c.from === conv.to);
                    if (!next) {
                        // Fallback to single-step
                        ans = amount * conv.factor;
                        text = `${ctx.actor} ${ctx.verb} ${amount} ${pluralize(conv.from)}. How many ${pluralize(conv.to)} is that?`;
                        hint = `1 ${conv.from} = ${conv.factor} ${pluralize(conv.to)}. Multiply ${amount} × ${conv.factor}.`;
                    } else {
                        ans = amount * conv.factor * next.factor;
                        text = `${ctx.actor} ${ctx.verb} ${amount} ${pluralize(conv.from)}. How many ${pluralize(next.to)} is that?`;
                        hint = `1 ${conv.from} = ${conv.factor} ${pluralize(conv.to)}, and 1 ${conv.to} = ${next.factor} ${pluralize(next.to)}. Multiply ${amount} × ${conv.factor} × ${next.factor}.`;
                    }
                }

                // Conversion-key reference card — shows EVERY conversion in the
                // problem's category (length / weight / volume / time) so the
                // student has to read the table to find the row that applies.
                // Small tan card to keep it unobtrusive; the whole #visualAid
                // is a zoom-trigger via attachZoomBehavior in question-render,
                // so clicking the card opens it in the magnify modal.
                const labelMap = { weight: 'Weight', volume: 'Capacity', length: 'Length', time: 'Time', mass: 'Mass' };
                const iconMap  = { weight: '⚖️',     volume: '🧪',       length: '📏',     time: '⏱️',   mass: '⚖️'    };
                function _convRow(c) {
                    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:4px 10px;border-bottom:1px dashed rgba(141,110,99,0.30);font-family:'Nunito',system-ui,sans-serif;font-size:0.95rem;line-height:1.3;">
                        <span style="font-weight:800;color:#5d4037;">1 ${c.from}</span>
                        <span style="color:#8d6e63;font-weight:600;">=</span>
                        <span style="font-weight:800;color:#5d4037;">${c.factor} ${pluralize(c.to)}</span>
                    </div>`;
                }
                function _conversionKey(type) {
                    const rows = conversions.filter(c => c.type === type).map(_convRow).join('');
                    return `<div title="Click to enlarge" style="display:inline-block;text-align:left;background:linear-gradient(180deg,#fdf3d8 0%,#f5e1b0 100%);border:2px solid #b8956a;border-radius:10px;padding:8px 14px 4px;margin:6px auto;min-width:200px;box-shadow:0 1px 0 rgba(255,255,255,0.85) inset, 0 2px 6px rgba(93,64,55,0.18);cursor:zoom-in;">
                        <div style="font-family:'Nunito',system-ui,sans-serif;font-weight:800;font-size:0.8rem;color:#6d4c1a;letter-spacing:0.6px;text-transform:uppercase;text-align:center;margin-bottom:4px;">${iconMap[type] || ''} ${labelMap[type] || type} Key</div>
                        ${rows}
                    </div>`;
                }

                q.text = text;
                q.ans = ans;
                q.answerType = "number";
                q.hint = hint;
                q.visual = `<div style="text-align:center;width:100%;">${_conversionKey(conv.type)}</div>`;
                q.skillLabel = "Unit Conversion Word";
                q.printFormat = "unit-conversion-word";
                q.conversionWordData = { conv, amount, ans, isTwoStep };

                // ── Column workmat (col-arith / 'mult' mode) ──
                // Both single- and two-step conversions resolve to a
                // multiplication. For two-step, multiply the two factors
                // first so the student does ONE column multiplication.
                let _ucwMul;
                if (isTwoStep) {
                    const _next = conversions.find(c => c.from === conv.to);
                    _ucwMul = _next ? conv.factor * _next.factor : conv.factor;
                } else {
                    _ucwMul = conv.factor;
                }
                if (Number.isFinite(amount) && Number.isFinite(_ucwMul) && ans >= 0) {
                    const top = Math.max(amount, _ucwMul);
                    const bot = Math.min(amount, _ucwMul);
                    q.answerType = 'col-arith';
                    q.colMode = 'mult';
                    q.factorTop = top;
                    q.factorBottom = bot;
                    q.decimalPlaces = 0;
                }
                return;
            }

            // Build time/measurement skill lists dynamically (auto-updates when new skills added)
            const allMeasSkills = getSkillsForCategory('measurement');
            const allTimeSkills = allMeasSkills.filter(s => s.startsWith('time_') || s.startsWith('elapsed_'));

            let measSkill = mappedSkill;
            if (mappedSkill === "mixed" || mappedSkill === "mixed_measurement") {
                measSkill = pick(allMeasSkills);
            } else if (mappedSkill === "mixed_time") {
                measSkill = pick(allTimeSkills);
            } else if (mappedSkill === "tell_time") {
                // Legacy mapping
                measSkill = pick(['time_hour', 'time_half_hour', 'time_quarter', 'time_5min']);
            } else if (mappedSkill === "clock_conversion") {
                measSkill = 'time_analog_digital';
            } else if (mappedSkill === "elapsed_time") {
                measSkill = pick(['elapsed_30min', 'elapsed_hour', 'elapsed_15min', 'elapsed_mixed']);
            }

            const colorScheme = pick(['blue', 'purple', 'green', 'cyan', 'orange']);

            // P10 (design/research/time-money.md): every time and money id is generated by
            // gen-time-money.js as a sheet-kit cell (clock, timeline, coins, money-columns). The
            // old branches here, with their hidden 30% "Set the clock" and multi-select rolls,
            // colour coins and hints that named the answer, were deleted (contract 10.1 step 8).
            if (isTimeMoneySkill(measSkill)) { generateTimeMoneyQuestion(q, measSkill); return; }

            // ===== READING A RULER =====
            if (measSkill === "reading_ruler" || measSkill === "reading_ruler_hard") {
                // A kit cell (sheet/cells/figures.js `ruler`), drawn the same on paper, in the key and on
                // the three screen hosts: an inch ruler at TRUE scale (RP-160) with an object lying along
                // it, and ONE answer place, "The pencil is [ ] inches long." AP2 round 4 (critic round 5):
                // no arrow on a labelled mark any more - the pupil finds where the object ENDS; with
                // "What is measured: not from 0" the object starts on a later inch mark and the pupil
                // counts from there. Reading to the inch is the Grade 2 step (2.MD.A.1); the Quarter
                // Inches skill (3.MD.B.4) reads all three. The ruler carries only the marks the page
                // reads. The Support level draws grey guides from the object's ends (a hint).
                const at = _mAt();
                const hard = measSkill === "reading_ruler_hard";
                const parts = _mSet('parts') || (hard ? [0, 1, 2] : [0]);
                const res = parts.includes(2) ? 4 : parts.includes(1) ? 2 : 1;
                // AP2 round 5 (L10): the marks each item reads are DEALT. A page of one fine part
                // (half or quarter inches alone) also deals the coarser readings it contains - a
                // whole inch, and on a quarter page a half - so the fraction is never the same on
                // every item. The page's first item (a Guided page's Model) reads the finest marks.
                const finest = Math.max(...parts);
                const pool = parts.length > 1 ? parts : finest === 2 ? [2, 2, 2, 1, 0] : finest === 1 ? [1, 1, 0] : [0];
                const kindAt = at === 0 && _mOnPage() ? finest : pick(pool);
                const moved = _mLook('measure', 'zero') === 'moved';
                const start = moved ? rng(1, 2) : 0;
                const room = 6 - start;
                let meas;
                for (let tries = 0; tries < 8; tries++) {
                    if (kindAt === 0) meas = rng(1, Math.min(room, 6));
                    else if (kindAt === 1) meas = rng(0, room - 1) + 0.5;
                    else meas = rng(0, room - 1) + pick([0.25, 0.75]);
                    if (_mFresh(at, meas)) break;
                }
                _mNoteAnswer(at, meas);
                const ans = _inchText(meas);
                const object = pick(['pencil', 'crayon', 'ribbon', 'straw']);
                const payload = { len: 6, start, meas, res, labels: _mLook('labels', 'all'), object, ans, support: _mLevel(at) };
                q.cell = { template: 'ruler', v: 1, payload };
                q.visual = k2Twin('ruler', payload);
                q.text = `How long is the ${object}?`;
                q.screenInstr = 'Measure the object. Write how many inches long it is.';
                q.ans = res === 1 ? meas : ans;
                q.answerType = res === 1 ? "number" : "text";
                q.options = [];
                q.hint = (moved ? `The ${object} starts at ${start}, not at 0: count the inches from ${start}. ` : `The ${object} starts at 0. `)
                    + (res === 1 ? 'Find where it ends. Read the number there.'
                        : res === 2 ? 'Find where it ends. A mark between two numbers is a half inch.'
                            : 'Find where it ends. Count the small spaces after the last inch: each is a quarter inch.');
                q.measurementData = { meas, start, res, ans };
                q.printFormat = 'reading-ruler';
                q.skillLabel = 'Ruler';
            }
            // ===== TEMPERATURE =====
            else if (measSkill === "temperature") {
                // ONE task, read the thermometer, as a kit cell (sheet/cells/figures.js `thermometer`)
                // drawn the same on paper, in the key and on the three screen hosts, with ONE box and the
                // unit printed after it. A window of 20 marks, a mark every degree or every 2 degrees
                // ("Each small mark", O2), the scale numbered every 5 / 10 or, with O6 "Figure labels:
                // some", every 10 / 20. AP2 round 4 (critic round 5): "Temperatures up to" 30 / 60 / 100
                // (a number-size ladder), "Below zero: some items" (one item in three reads below 0),
                // and the Support level draws the grey read-across guide (a hint that fades).
                const at = _mAt();
                const forms = _mSet('forms');
                const units = (forms || [0, 1]).map(i => ['°F', '°C'][i]).filter(Boolean);
                const unit = pick(units.length ? units : ['°F', '°C']);
                const step = _mNum('step') === 2 ? 2 : 1;
                const span = 20 * step;
                const some = _mLook('labels', 'all') === 'some';
                const every = step === 2 ? (some ? 20 : 10) : (some ? 10 : 5);
                const band = _mNum('band');
                const below = _mLook('belowZero', 'never') === 'some' && rng(1, 3) === 1;
                const top = band || (unit === '°F' ? 100 : 40);
                const floor = below ? -span + 10 : (band ? 0 : (unit === '°F' ? 30 : 0));
                const los = [];
                for (let lo = floor; lo + span <= Math.max(top, floor + span); lo += 10) {
                    if (below ? lo < 0 : lo >= 0) los.push(lo);
                }
                const lo = pick(los.length ? los : [floor]);
                const hi = lo + span;
                const deal = () => step * rng(Math.ceil((lo + 1) / step), Math.floor((hi - 1) / step));
                let temp = deal();
                if (temp % every === 0) temp = deal();          // mostly between two numbers
                if (below && temp >= 0) temp = -step * rng(1, Math.max(1, Math.floor(-lo / step) - 1));
                const payload = { temp, unit, lo, hi, every, step, support: _mLevel(at) };
                q.cell = { template: 'thermometer', v: 1, payload };
                q.visual = k2Twin('thermometer', payload);
                q.text = `What is the temperature in ${unit}?`;
                q.screenInstr = 'Read the thermometer. Write the temperature.';
                q.ans = temp;
                q.answerType = 'number';
                q.options = [];
                q.hint = (temp < 0 ? 'The column stops below 0: the temperature is below zero, so it has a minus sign. ' : '')
                    + `Find the top of the dark column. Start at the number just below it and count up ${step} degree${step > 1 ? 's' : ''} for each small mark.`;
                q.measurementData = { temp, unit, every, lo, hi, step };
                q.printFormat = "measurement-temp";
                q.skillLabel = 'Temperature';
            }

            // ===== CAPACITY =====
            else if (measSkill === "capacity") {
                // Phase 4.5 batch 11: 25% multi-select-check "containers larger than 1 L" variant
                if (Math.random() < 0.25) {
                    const pool = [
                        { name: 'Cup',           emoji: '☕', mL: 240 },
                        { name: 'Juice box',     emoji: '🧃', mL: 200 },
                        { name: 'Soda can',      emoji: '🥤', mL: 355 },
                        { name: 'Water bottle',  emoji: '💧', mL: 500 },
                        { name: 'Milk carton',   emoji: '🥛', mL: 1000 },
                        { name: 'Soda bottle',   emoji: '🍾', mL: 2000 },
                        { name: 'Pitcher',       emoji: '🫗', mL: 1500 },
                        { name: 'Bucket',        emoji: '🪣', mL: 8000 },
                        { name: 'Bath tub',      emoji: '🛁', mL: 150000 },
                        { name: 'Tea spoon',     emoji: '🥄', mL: 5 }
                    ];
                    const items = shuffle([...pool]).slice(0, 6);
                    const opts = items.map((it, i) => ({
                        id: 'opt' + i,
                        label: `${it.emoji} ${it.name} (${it.mL >= 1000 ? (it.mL / 1000) + ' L' : it.mL + ' mL'})`,
                        correct: it.mL > 1000
                    }));
                    if (!opts.some(o => o.correct)) opts[0].correct = true;
                    if (!opts.some(o => !o.correct)) opts[opts.length - 1].correct = false;
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = 'Click ALL containers larger than 1 liter.';
                    q.answerType = 'multi-select-check';
                    q.options = opts;
                    q.ans = ans;
                    q.hint = '1 liter = 1000 mL. Pick every item with more than 1000 mL.';
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Capacity';
                    return;
                }
                // Phase 4.5 batch 11: 20% dnd-categorize variant — sort containers into capacity bins
                if (Math.random() < 0.20) {
                    const pool = [
                        { name: 'Tea spoon',    mL: 5,    cat: 'less' },
                        { name: 'Shot glass',   mL: 30,   cat: 'less' },
                        { name: 'Cup',          mL: 240,  cat: 'less' },
                        { name: 'Mug',          mL: 350,  cat: 'mid' },
                        { name: 'Pint glass',   mL: 470,  cat: 'mid' },
                        { name: 'Water bottle', mL: 500,  cat: 'mid' },
                        { name: 'Quart jar',    mL: 950,  cat: 'mid' },
                        { name: 'Pitcher',      mL: 1500, cat: 'more' },
                        { name: 'Milk jug',     mL: 3800, cat: 'more' },
                        { name: 'Bucket',       mL: 8000, cat: 'more' }
                    ];
                    const items = shuffle([...pool]).slice(0, 6);
                    const tiles = items.map((it, i) => ({ id: 't' + i, label: it.name }));
                    const bins = [
                        { id: 'less', label: 'Less than 1 cup' },
                        { id: 'mid',  label: '1 cup - 1 quart' },
                        { id: 'more', label: 'More than 1 quart' }
                    ];
                    const ans = {};
                    items.forEach((it, i) => { ans['t' + i] = it.cat; });
                    q.text = 'Sort each container into the correct capacity bin.';
                    q.answerType = 'dnd-generic';
                    q.dndMode = 'categorize';
                    q.tiles = tiles;
                    q.bins = bins;
                    q.ans = ans;
                    q.options = [];
                    q.hint = '1 cup ≈ 240 mL. 1 quart ≈ 950 mL.';
                    q.printFormat = 'dnd-generic';
                    q.skillLabel = 'Capacity';
                    return;
                }
                const conversions = [
                    { from: "mL", to: "L", factor: 1000, values: [1000, 2000, 500, 250, 1500] },
                    { from: "L", to: "mL", factor: 0.001, values: [1, 2, 3, 0.5, 1.5] },
                    { from: "cups", to: "pints", factor: 2, values: [2, 4, 6, 8] },
                    { from: "pints", to: "quarts", factor: 2, values: [2, 4, 6, 8] },
                    { from: "quarts", to: "gallons", factor: 4, values: [4, 8, 12, 16] }
                ];
                const conv = pick(conversions);
                const value = pick(conv.values);
                const answer = value / conv.factor;

                q.ans = answer;
                q.text = `Convert: ${value} ${conv.from} = ___ ${conv.to}`;
                q.hint = `${conv.factor} ${conv.from} = 1 ${conv.to}`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Capacity</div>
                    <div style="font-size:1.3rem;margin:15px 0;">${value} ${conv.from} = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> ${conv.to}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);">Reference: ${conv.factor} ${conv.from} = 1 ${conv.to}</div>
                </div>`;
                q.options = buildNumericOptions(answer);
                q.measurementData = { from: conv.from, to: conv.to, value, answer };
                q.printFormat = "measurement-capacity";
            }
            return;
}
