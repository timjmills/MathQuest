// gen-measurement.js - Measurement question generation (time, money, ruler, temperature, capacity)
import { state } from './state.js';
import { getSkillsForCategory } from './data.js';
import { optionsFor } from './skill-options.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, formatTime, timeToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify } from './svg-clock.js';
import { COLORS, STROKE, FONTS, softFill } from './design-tokens.js';
import { isTimeMoneySkill, generateTimeMoneyQuestion } from './gen-time-money.js';
import { createBarGraphSVG, createThermometerSVG } from './svg-geometry.js';

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
            // Phase 5 batch 1: 2-3 categories, 1-to-1 picture graph (each icon = 1 unit)
            if (mappedSkill === "pictograph_intro") {
                const themes = [
                    { title: 'Pets We Have', items: [
                        { name: 'Cats', icon: '🐱' }, { name: 'Dogs', icon: '🐶' },
                        { name: 'Birds', icon: '🐦' }, { name: 'Fish', icon: '🐠' }
                    ]},
                    { title: 'Fruits We Like', items: [
                        { name: 'Apples', icon: '🍎' }, { name: 'Bananas', icon: '🍌' },
                        { name: 'Grapes', icon: '🍇' }, { name: 'Pears', icon: '🍐' }
                    ]},
                    { title: 'Toys in the Box', items: [
                        { name: 'Cars', icon: '🚗' }, { name: 'Balls', icon: '⚽' },
                        { name: 'Blocks', icon: '🧱' }
                    ]},
                ];
                const theme = pick(themes);
                const numCats = pick([2, 3]);
                const cats = shuffle([...theme.items]).slice(0, numCats);
                const counts = cats.map(() => randInt(1, 5));

                // Question type: specific count, OR how many more
                const askType = pick(['count', 'count', 'more']); // weight count
                let askIdx, askIdx2, ans, text;
                if (askType === 'count') {
                    askIdx = randInt(0, numCats - 1);
                    ans = counts[askIdx];
                    text = `How many ${cats[askIdx].name.toLowerCase()}?`;
                } else {
                    // Find max and a different category
                    const sortedIdx = [...counts.keys()].sort((a, b) => counts[b] - counts[a]);
                    askIdx = sortedIdx[0];
                    askIdx2 = sortedIdx[sortedIdx.length - 1];
                    ans = counts[askIdx] - counts[askIdx2];
                    text = `How many MORE ${cats[askIdx].name.toLowerCase()} than ${cats[askIdx2].name.toLowerCase()}?`;
                }

                // Build pictograph rows
                const rows = cats.map((cat, i) => {
                    const icons = `<span style="font-size:1.6rem;letter-spacing:6px;">${cat.icon.repeat(counts[i])}</span>`;
                    return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border-light);">
                        <span style="min-width:80px;font-weight:600;font-size:0.95rem;">${cat.name}</span>
                        ${icons}
                    </div>`;
                }).join('');

                q.text = text;
                q.ans = ans;
                q.answerType = "number";
                q.hint = `Each picture stands for 1. Count the pictures in the row.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">${theme.title}</div>
                    <div style="background:var(--bg-card);border-radius:12px;padding:14px;display:inline-block;text-align:left;">
                        <div style="font-weight:600;margin-bottom:8px;text-align:center;font-size:0.85rem;color:var(--text-dim);">Each picture = 1</div>
                        ${rows}
                    </div>
                </div>`;
                q.skillLabel = "Picture Graph";
                q.printFormat = "pictograph-intro";
                q.dataData = {
                    title: theme.title,
                    categories: cats.map(c => c.name),
                    icons: cats.map(c => c.icon),
                    values: counts,
                    scale: 1,
                    askType,
                    askIdx,
                    askIdx2: askIdx2 != null ? askIdx2 : null,
                };
                return;
            }

            // ===== BAR GRAPH INTRO (Grade K) =====
            // Phase 5 batch 1: 2-3 named categories, single-unit scale, max ≤5
            if (mappedSkill === "bar_graph_intro") {
                const themes = [
                    { title: 'Pets in Our Class', items: ['Cats', 'Dogs', 'Birds'] },
                    { title: 'Snacks We Like', items: ['Apples', 'Crackers', 'Grapes'] },
                    { title: 'Favorite Colors', items: ['Red', 'Blue', 'Green'] },
                    { title: 'Sports We Play', items: ['Soccer', 'Basketball'] },
                    { title: 'Books on the Shelf', items: ['Mysteries', 'Comics', 'Nature'] },
                ];
                const theme = pick(themes);
                const requestedNum = pick([2, 3]);
                const numCats = Math.min(requestedNum, theme.items.length);
                const cats = theme.items.slice(0, numCats);
                const counts = cats.map(() => randInt(1, 5));

                // Decide question type
                const askType = pick(['count', 'most', 'more']);
                let ans, text, answerType, options;
                if (askType === 'count') {
                    const idx = randInt(0, cats.length - 1);
                    ans = counts[idx];
                    text = `How many ${cats[idx].toLowerCase()}?`;
                    answerType = "number";
                } else if (askType === 'most') {
                    // Ensure unique max for clean answer
                    const maxVal = Math.max(...counts);
                    const maxIndices = counts.map((c, i) => c === maxVal ? i : -1).filter(i => i >= 0);
                    if (maxIndices.length > 1) {
                        // Bump the first one up (or down) to break tie
                        const bumpIdx = maxIndices[0];
                        if (counts[bumpIdx] < 5) counts[bumpIdx]++;
                        else counts[bumpIdx]--;
                    }
                    const finalMax = Math.max(...counts);
                    const winIdx = counts.indexOf(finalMax);
                    ans = cats[winIdx];
                    text = `Which has the MOST?`;
                    answerType = "multiple-choice";
                    options = [...cats];
                } else {
                    // "How many more X than Y?"
                    const sortedIdx = [...counts.keys()].sort((a, b) => counts[b] - counts[a]);
                    const idxHi = sortedIdx[0];
                    const idxLo = sortedIdx[sortedIdx.length - 1];
                    const catHi = (cats[idxHi] || '').toLowerCase();
                    const catLo = (cats[idxLo] || '').toLowerCase();
                    ans = counts[idxHi] - counts[idxLo];
                    if (ans === 0 || idxHi === idxLo) {
                        // Tie or single category: switch to count question
                        ans = counts[idxHi];
                        text = `How many ${catHi}?`;
                    } else {
                        text = `How many MORE ${catHi} than ${catLo}?`;
                    }
                    answerType = "number";
                }

                // Build SVG bar graph
                const svgW = 320, svgH = 200;
                const barAreaH = 130;
                const barW = 50;
                const gap = 28;
                const startX = 60;
                const baseY = 160;
                // Single-color bars per IXL bar-chart convention.
                const barColor = COLORS.primary;
                let bars = '';
                let yLabels = '';
                for (let v = 0; v <= 5; v++) {
                    const y = baseY - (v / 5) * barAreaH;
                    yLabels += `<text x="48" y="${y + 4}" text-anchor="end" font-family='${FONTS.sans}' font-size="11" fill="${COLORS.textMuted}">${v}</text>`;
                    yLabels += `<line x1="55" y1="${y}" x2="${svgW - 10}" y2="${y}" stroke="${COLORS.grid}" stroke-width="${STROKE.hair}"/>`;
                }
                cats.forEach((cat, i) => {
                    const x = startX + i * (barW + gap);
                    const h = (counts[i] / 5) * barAreaH;
                    const y = baseY - h;
                    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${barColor}" fill-opacity="0.7" stroke="${barColor}" stroke-width="${STROKE.normal}" rx="3"/>`;
                    bars += `<text x="${x + barW / 2}" y="${baseY + 16}" text-anchor="middle" font-family='${FONTS.sans}' font-size="11" font-weight="600" fill="${COLORS.text}">${cat}</text>`;
                });
                // Axes
                const axes = `<line x1="55" y1="${baseY - barAreaH}" x2="55" y2="${baseY}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>
                              <line x1="55" y1="${baseY}" x2="${svgW - 10}" y2="${baseY}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;

                q.text = text;
                q.ans = ans;
                q.answerType = answerType;
                if (options) q.options = options;
                q.hint = `Look at the height of each bar. The numbers on the side tell you how many.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">${theme.title}</div>
                    <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 360)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                        ${yLabels}
                        ${bars}
                        ${axes}
                    </svg>
                </div>`;
                q.skillLabel = "Bar Graph Intro";
                q.printFormat = "bar-graph-intro";
                q.dataData = { title: theme.title, categories: cats, values: counts, scale: 1 };
                // O6 "Bars" (AP2): the same graph lying down — the categories down the left, the
                // scale 0 to 5 along the bottom. Screen and print draw it with one builder.
                if (_mLook('bars', 'vertical') === 'horizontal') {
                    q.hint = `Look at how long each bar is. The numbers along the bottom tell you how many.`;
                    q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">${theme.title}</div>
                    ${createBarGraphSVG({ categories: cats, values: counts, max: 5 })}
                </div>`;
                    q.dataData.bars = 'horizontal';
                }
                return;
            }

            // ===== PERIMETER INTRO (Grade 1) =====
            // Phase 5 batch 3: simple polygon (rectangle, square, or triangle), small side lengths 1-10
            if (mappedSkill === "perimeter_intro") {
                // Pick shape: rectangle (60%), square (25%), triangle (15%)
                const shapeRoll = Math.random();
                let shape, sides, ans, sideLabels;
                if (shapeRoll < 0.6) {
                    shape = "rectangle";
                    const w = randInt(2, 9);
                    let l = randInt(2, 10);
                    if (l === w) l = w + 1;
                    sides = [l, w, l, w];
                    sideLabels = { length: l, width: w };
                    ans = 2 * (l + w);
                } else if (shapeRoll < 0.85) {
                    shape = "square";
                    const s = randInt(2, 9);
                    sides = [s, s, s, s];
                    sideLabels = { side: s };
                    ans = 4 * s;
                } else {
                    shape = "triangle";
                    // Pick triangle inequality-safe sides
                    const a = randInt(2, 8);
                    const b = randInt(2, 8);
                    const cMax = Math.min(10, a + b - 1);
                    const cMin = Math.max(2, Math.abs(a - b) + 1);
                    const c = cMin <= cMax ? randInt(cMin, cMax) : a;
                    sides = [a, b, c];
                    sideLabels = { a, b, c };
                    ans = a + b + c;
                }

                // Build SVG. O6 "Figure labels" (AP2): `some` labels one length (top) and one width
                // (left) of a rectangle or square — the bottom and right follow from equal opposite
                // sides. A triangle keeps all three (none can be worked out).
                const _piLabels = _mLook('labels', 'all');
                const _piShow = (i) => _piLabels !== 'some' || shape === 'triangle' || i < 2;
                let svg = '';
                if (shape === "rectangle" || shape === "square") {
                    const W = 180, H = 110, padX = 40, padY = 25;
                    const rectW = W - padX * 2;
                    const rectH = H - padY * 2;
                    svg = `<svg viewBox="0 0 ${W} ${H}" width="220" style="display:block;margin:0 auto;background:#fff;">
                        <rect x="${padX}" y="${padY}" width="${rectW}" height="${rectH}" fill="${softFill(COLORS.primary)}" stroke="${COLORS.primary}" stroke-width="${STROKE.bold}"/>
                        <text x="${W / 2}" y="${padY - 6}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[0]}</text>
                        ${_piShow(2) ? `<text x="${W / 2}" y="${H - padY + 16}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[2]}</text>` : ''}
                        <text x="${padX - 6}" y="${H / 2 + 4}" text-anchor="end" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[1]}</text>
                        ${_piShow(3) ? `<text x="${W - padX + 6}" y="${H / 2 + 4}" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[3]}</text>` : ''}
                    </svg>`;
                } else {
                    // Triangle (isoceles-ish layout)
                    const W = 200, H = 130;
                    const apexX = W / 2, apexY = 20;
                    const baseY = H - 25;
                    const baseHalf = 60;
                    const leftX = apexX - baseHalf, rightX = apexX + baseHalf;
                    const pts = `${apexX},${apexY} ${rightX},${baseY} ${leftX},${baseY}`;
                    svg = `<svg viewBox="0 0 ${W} ${H}" width="220" style="display:block;margin:0 auto;background:#fff;">
                        <polygon points="${pts}" fill="${softFill(COLORS.fill[2])}" stroke="${COLORS.fill[2]}" stroke-width="${STROKE.bold}"/>
                        <text x="${(apexX + rightX) / 2 + 8}" y="${(apexY + baseY) / 2}" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[0]}</text>
                        <text x="${apexX}" y="${baseY + 16}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[1]}</text>
                        <text x="${(apexX + leftX) / 2 - 8}" y="${(apexY + baseY) / 2}" text-anchor="end" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[2]}</text>
                    </svg>`;
                }

                q.text = `What is the perimeter?`;
                q.ans = ans;
                q.answerType = "number";
                q.hint = `Add up the lengths of all the sides: ${sides.join(' + ')} = ?`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">Find the Perimeter</div>
                    ${svg}
                    <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">Add all the sides to find the perimeter.</div>
                </div>`;
                q.skillLabel = "Perimeter Intro";
                q.printFormat = "perimeter-intro";
                q.perimeterIntroData = { shape, sides, sideLabels, ans, ...(_piLabels === 'some' ? { labels: 'some' } : {}) };
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
                let rrMeasurement, rrAnswerText;
                const rrRulerLen = 6;
                const rrPxPerInch = 105; // bumped from 75 for layout-visual-left
                const rrPad = 36;
                const rrSvgW = rrRulerLen * rrPxPerInch + rrPad * 2;
                const rrSvgH = 150; // bumped from 110
                const rrRulerY = 20; // top edge of ruler

                if (measSkill === "reading_ruler_hard") {
                    // Quarter inches
                    const rrWholeInch = rng(0, rrRulerLen - 1);
                    const rrQuarter = pick([0, 1, 2, 3]);
                    rrMeasurement = rrWholeInch + rrQuarter * 0.25;
                    if (rrQuarter === 0) rrAnswerText = `${rrWholeInch}`;
                    else if (rrQuarter === 2) rrAnswerText = rrWholeInch === 0 ? '1/2' : `${rrWholeInch} 1/2`;
                    else rrAnswerText = rrWholeInch === 0 ? `${rrQuarter}/4` : `${rrWholeInch} ${rrQuarter}/4`;
                } else {
                    // Easy: 40% whole inches, 30% half inches, 30% quarter inches
                    const rrRoll = Math.random();
                    if (rrRoll < 0.4) {
                        rrMeasurement = rng(1, rrRulerLen);
                        rrAnswerText = `${rrMeasurement}`;
                    } else if (rrRoll < 0.7) {
                        const rrWholeInch = rng(0, rrRulerLen - 1);
                        rrMeasurement = rrWholeInch + 0.5;
                        rrAnswerText = rrWholeInch === 0 ? '1/2' : `${rrWholeInch} 1/2`;
                    } else {
                        const rrWholeInch = rng(0, rrRulerLen - 1);
                        const rrQuarter = pick([1, 3]);
                        rrMeasurement = rrWholeInch + rrQuarter * 0.25;
                        rrAnswerText = rrWholeInch === 0 ? `${rrQuarter}/4` : `${rrWholeInch} ${rrQuarter}/4`;
                    }
                }
                if (rrMeasurement === 0) { rrMeasurement = 1; rrAnswerText = '1'; }

                q.text = `What length does the arrow point to?`;
                q.ans = rrAnswerText;
                q.answerType = "text";
                q.hint = `Look at the tick marks: tall marks = whole inches, medium = 1/2 inch, short = 1/4 inch.`;

                const rrOptions = new Set();
                rrOptions.add(rrAnswerText);
                let rrAttempts = 0;
                while (rrOptions.size < 4 && rrAttempts < 40) {
                    rrAttempts++;
                    const rrOff = pick([-1, -0.5, -0.25, 0.25, 0.5, 1]);
                    const rrCand = rrMeasurement + rrOff;
                    if (rrCand > 0 && rrCand <= rrRulerLen) {
                        let rrCandText;
                        const rrCandWhole = Math.floor(rrCand);
                        const rrCandFrac = rrCand - rrCandWhole;
                        if (rrCandFrac === 0) rrCandText = `${rrCandWhole}`;
                        else if (Math.abs(rrCandFrac - 0.5) < 0.01) rrCandText = rrCandWhole === 0 ? '1/2' : `${rrCandWhole} 1/2`;
                        else if (Math.abs(rrCandFrac - 0.25) < 0.01) rrCandText = rrCandWhole === 0 ? '1/4' : `${rrCandWhole} 1/4`;
                        else if (Math.abs(rrCandFrac - 0.75) < 0.01) rrCandText = rrCandWhole === 0 ? '3/4' : `${rrCandWhole} 3/4`;
                        else rrCandText = `${rrCand}`;
                        rrOptions.add(rrCandText);
                    }
                }
                q.options = shuffle([...rrOptions]);

                // Build B&W ruler SVG with clear tick marks
                const _rrLabels = _mLook('labels', 'all');
                let rrTicks = '';
                // Heavy ruler edge line at top
                rrTicks += `<line x1="${rrPad}" y1="${rrRulerY}" x2="${rrPad + rrRulerLen * rrPxPerInch}" y2="${rrRulerY}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
                for (let ri = 0; ri <= rrRulerLen * 4; ri++) {
                    const rrTickX = rrPad + ri * (rrPxPerInch / 4);
                    let rrTickH, rrTickW;
                    if (ri % 4 === 0) { rrTickH = 42; rrTickW = STROKE.normal; }       // inch marks — tall
                    else if (ri % 2 === 0) { rrTickH = 28; rrTickW = 1; }     // half-inch — medium
                    else { rrTickH = 17; rrTickW = STROKE.hair; }                      // quarter-inch — short
                    rrTicks += `<line x1="${rrTickX}" y1="${rrRulerY}" x2="${rrTickX}" y2="${rrRulerY + rrTickH}" stroke="${COLORS.axis}" stroke-width="${rrTickW}"/>`;
                    // O6 "Figure labels" (AP2): every inch numbered, or every other inch (0, 2, 4, 6).
                    if (ri % 4 === 0 && (_rrLabels !== 'some' || (ri / 4) % 2 === 0)) {
                        rrTicks += `<text x="${rrTickX}" y="${rrRulerY + 70}" text-anchor="middle" font-size="22" font-family='${FONTS.sans}' font-weight="bold" fill="${COLORS.axis}">${ri / 4}</text>`;
                    }
                }
                // Arrow pointing up to measurement from below
                const rrArrowX = rrPad + rrMeasurement * rrPxPerInch;
                const rrArrowTip = rrRulerY + 78;
                const rrArrowBase = rrSvgH - 8;
                rrTicks += `<line x1="${rrArrowX}" y1="${rrArrowBase}" x2="${rrArrowX}" y2="${rrArrowTip + 10}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
                rrTicks += `<polygon points="${rrArrowX - 9},${rrArrowTip + 12} ${rrArrowX + 9},${rrArrowTip + 12} ${rrArrowX},${rrArrowTip}" fill="${COLORS.axis}"/>`;

                q.visual = `<div style="text-align:center;">
                    <svg width="${rrSvgW}" height="${rrSvgH}" viewBox="0 0 ${rrSvgW} ${rrSvgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:820px;height:auto;">
                        ${rrTicks}
                    </svg>
                    <div style="margin-top:8px;font-size:1.15rem;">The arrow points to <span style="border-bottom:2px solid #333;padding:0 15px;min-width:50px;display:inline-block;">?</span> inches</div>
                </div>`;
                q.printFormat = 'reading-ruler';
                q.skillLabel = 'Ruler';
            }
            // ===== TEMPERATURE =====
            else if (measSkill === "temperature") {
                // Phase 4.5 batch 11: 25% multi-select-check "above N°F" variant
                if (Math.random() < 0.25) {
                    const target = pick([60, 65, 70, 75, 80]);
                    const candidates = new Set();
                    while (candidates.size < 6) {
                        candidates.add(rng(20, 100));
                    }
                    const arr = [...candidates];
                    const opts = arr.map((t, i) => ({
                        id: 'opt' + i,
                        label: `${t}°F`,
                        correct: t > target
                    }));
                    // Ensure at least 1 correct and at least 1 incorrect
                    if (!opts.some(o => o.correct)) {
                        opts[0].label = `${target + 5}°F`; opts[0].correct = true;
                    }
                    if (!opts.some(o => !o.correct)) {
                        opts[opts.length - 1].label = `${Math.max(0, target - 10)}°F`;
                        opts[opts.length - 1].correct = false;
                    }
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL temperatures above ${target}°F.`;
                    q.answerType = 'multi-select-check';
                    q.options = opts;
                    q.ans = ans;
                    q.hint = `Select every value greater than ${target}°F.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Temperature';
                    return;
                }
                // Phase 4.5 batch 11: 20% dnd-categorize variant — sort temps into Cold/Cool/Warm/Hot bins
                if (Math.random() < 0.20) {
                    const pool = [
                        { temp: 15, label: '15°F' }, { temp: 25, label: '25°F' },
                        { temp: 32, label: '32°F' }, { temp: 45, label: '45°F' },
                        { temp: 55, label: '55°F' }, { temp: 70, label: '70°F' },
                        { temp: 75, label: '75°F' }, { temp: 85, label: '85°F' },
                        { temp: 95, label: '95°F' }, { temp: 100, label: '100°F' }
                    ];
                    const items = shuffle([...pool]).slice(0, 6);
                    const tiles = items.map((it, i) => ({ id: 't' + i, label: it.label }));
                    const bins = [
                        { id: 'cold', label: 'Cold (<32°F)' },
                        { id: 'cool', label: 'Cool (32-59°F)' },
                        { id: 'warm', label: 'Warm (60-80°F)' },
                        { id: 'hot',  label: 'Hot (>80°F)' }
                    ];
                    const ans = {};
                    items.forEach((it, i) => {
                        if (it.temp < 32) ans['t' + i] = 'cold';
                        else if (it.temp < 60) ans['t' + i] = 'cool';
                        else if (it.temp <= 80) ans['t' + i] = 'warm';
                        else ans['t' + i] = 'hot';
                    });
                    q.text = 'Sort each temperature into the correct category.';
                    q.answerType = 'dnd-generic';
                    q.dndMode = 'categorize';
                    q.tiles = tiles;
                    q.bins = bins;
                    q.ans = ans;
                    q.options = [];
                    q.hint = 'Cold is freezing or below; Cool is jacket weather; Warm is comfortable; Hot is sweating weather.';
                    q.printFormat = 'dnd-generic';
                    q.skillLabel = 'Temperature';
                    return;
                }
                const mode = pick(["read", "convert"]);
                if (mode === "read") {
                    const temp = rng(-10, 40);
                    const unit = pick(["°C", "°F"]);
                    q.ans = temp;
                    q.text = `What temperature is shown? (${unit})`;
                    q.hint = `Find where the dark column stops. Start at the nearest number below it and count up one degree for each small mark.`;

                    // AP2 (2026-09-25): a thermometer to read. The card used to print the answer
                    // itself in large type ("23°C") above the answer box. O6 "Figure labels": the
                    // scale numbered every 5 degrees, or every 10 (a mark for every degree either way).
                    const every = _mLook('labels', 'all') === 'some' ? 10 : 5;
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Temperature</div>
                        ${createThermometerSVG({ temp, unit, every })}
                    </div>`;
                    q.measurementData = { temp, unit, every };
                } else {
                    const celsius = rng(0, 40);
                    const fahrenheit = Math.round(celsius * 9 / 5 + 32);
                    const direction = pick(["c_to_f", "f_to_c"]);

                    if (direction === "c_to_f") {
                        q.ans = fahrenheit;
                        q.text = `Convert ${celsius}°C to Fahrenheit`;
                        q.hint = `°F = (°C × 9/5) + 32`;
                    } else {
                        q.ans = celsius;
                        q.text = `Convert ${fahrenheit}°F to Celsius`;
                        q.hint = `°C = (°F - 32) × 5/9`;
                    }
                    q.measurementData = { celsius, fahrenheit, direction };
                }
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "measurement-temp";
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
