// gen-measurement.js - Measurement question generation (time, money, ruler, temperature, capacity)
import { state } from './state.js';
import { getSkillsForCategory } from './data.js';
import { optionsFor } from './skill-options.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, formatTime, timeToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify } from './svg-clock.js';
import { COLORS, STROKE, FONTS, softFill } from './design-tokens.js';
import { isTimeMoneySkill, generateTimeMoneyQuestion } from './gen-time-money.js';
import { k2Twin } from './sheet/index.js';
import { perimeterIntroFigure } from './gen-geo-kit.js';

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
            // AP2 round 3 (the bar graph's defects, critic round 4): a kit cell (sheet/cells/figures.js
            // `pictograph`), drawn the same on paper, in the key and on the three screen hosts: 2-3
            // rows of in-house line pictures (RP-20; the emoji broke INK-7) in a ruled table, one
            // picture for one, the key printed under it; the question beside it, one box.
            if (mappedSkill === "pictograph_intro") {
                const themes = [
                    { title: 'Pets We Have', icon: 'fish', items: ['Cats', 'Dogs', 'Birds', 'Fish'], cat: 'Pet', val: 'Number of pets',
                        count: c => `How many ${c.toLowerCase()}?`, more: (a, b) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Fruits We Like', icon: 'apple', items: ['Apples', 'Pears', 'Grapes', 'Plums'], cat: 'Fruit', val: 'Number of children',
                        count: c => `How many children like ${c.toLowerCase()}?`, more: (a, b) => `How many more children like ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Toys in the Box', icon: 'ball', items: ['Cars', 'Balls', 'Blocks'], cat: 'Toy', val: 'Number of toys',
                        count: c => `How many ${c.toLowerCase()}?`, more: (a, b) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                ];
                const theme = pick(themes);
                const numCats = pick([2, 3]);
                const cats = shuffle([...theme.items]).slice(0, numCats);
                const counts = cats.map(() => randInt(1, 5));
                const forms = _mSet('forms') || [0, 1];
                const askType = ['count', 'more'][pick(forms)] || 'count';
                let ask, text, ans;
                if (askType === 'more') {
                    if (Math.max(...counts) === Math.min(...counts)) counts[0] = counts[0] < 5 ? counts[0] + 1 : counts[0] - 1;
                    const order = [...counts.keys()].sort((x, y) => counts[y] - counts[x]);
                    const i = order[0], j = order[order.length - 1];
                    ans = counts[i] - counts[j];
                    text = theme.more(cats[i], cats[j]);
                    ask = { kind: 'more', i, j };
                } else {
                    const i = randInt(0, numCats - 1);
                    ans = counts[i];
                    text = theme.count(cats[i]);
                    ask = { kind: 'value', i };
                }
                const payload = { title: theme.title, categories: cats, values: counts, scale: 1, icon: theme.icon,
                    catTitle: theme.cat, valTitle: theme.val, ask, question: text, answer: ans };
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
            // AP2 round 3 (critic round 4): a kit cell (sheet/cells/figures.js `bar-graph`), drawn the
            // same on paper, in the key and on the three screen hosts: 2-3 bars on a full numbered
            // scale 0 to 5, axis titles in words, no number over any bar. "Which has the most?" is
            // answered with one check box (the most is never a tie); a count with one box.
            if (mappedSkill === "bar_graph_intro") {
                const themes = [
                    { title: 'Pets in Our Class', items: ['Cats', 'Dogs', 'Birds'], cat: 'Pet', val: 'Number of pets',
                        count: c => `How many ${c.toLowerCase()}?`, more: (a, b) => `How many more ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Snacks We Like', items: ['Apples', 'Crackers', 'Grapes'], cat: 'Snack', val: 'Number of children',
                        count: c => `How many children like ${c.toLowerCase()}?`, more: (a, b) => `How many more children like ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Favorite Colors', items: ['Red', 'Blue', 'Green'], cat: 'Color', val: 'Number of children',
                        count: c => `How many children like ${c.toLowerCase()}?`, more: (a, b) => `How many more children like ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Sports We Play', items: ['Soccer', 'Tennis'], cat: 'Sport', val: 'Number of children',
                        count: c => `How many children play ${c.toLowerCase()}?`, more: (a, b) => `How many more children play ${a.toLowerCase()} than ${b.toLowerCase()}?` },
                    { title: 'Books on the Shelf', items: ['Animal', 'Comic', 'Nature'], cat: 'Kind of book', val: 'Number of books',
                        count: c => `How many ${c.toLowerCase()} books?`, more: (a, b) => `How many more ${a.toLowerCase()} books than ${b.toLowerCase()} books?` },
                ];
                const theme = pick(themes);
                const numCats = Math.min(pick([2, 3]), theme.items.length);
                const cats = theme.items.slice(0, numCats);
                const counts = cats.map(() => randInt(1, 5));
                // the kinds the teacher ticked (forms: 0 most, 1 how many, 2 how many more)
                const forms = _mSet('forms') || [0, 1, 2];
                const askType = ['most', 'count', 'more'][pick(forms)] || 'count';
                let ask, text, ans;
                if (askType === 'most') {
                    // one bar is the most: break a tie
                    const maxVal = Math.max(...counts);
                    const top = counts.map((c, i) => (c === maxVal ? i : -1)).filter(i => i >= 0);
                    if (top.length > 1) { if (counts[top[0]] < 5) counts[top[0]]++; else counts[top[1]]--; }
                    ans = cats[counts.indexOf(Math.max(...counts))];
                    text = 'Which has the most?';
                    ask = { kind: 'most' };
                } else if (askType === 'more') {
                    // two different counts: move one when every bar is the same
                    if (Math.max(...counts) === Math.min(...counts)) counts[0] = counts[0] < 5 ? counts[0] + 1 : counts[0] - 1;
                    const order = [...counts.keys()].sort((x, y) => counts[y] - counts[x]);
                    const i = order[0], j = order[order.length - 1];
                    ans = counts[i] - counts[j];
                    text = theme.more(cats[i], cats[j]);
                    ask = { kind: 'more', i, j };
                } else {
                    const i = randInt(0, cats.length - 1);
                    ans = counts[i];
                    text = theme.count(cats[i]);
                    ask = { kind: 'value', i };
                }
                const orientation = _mLook('bars', 'vertical') === 'horizontal' ? 'horizontal' : 'vertical';
                const payload = { title: theme.title, categories: cats, values: counts, step: 1, top: 5, orientation,
                    catTitle: theme.cat, valTitle: theme.val, ask, question: text, answer: ans };
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
            // AP2 round 3 (critic round 4): a kit cell (sheet/cells/figures.js `perimeter-shape`): a
            // rectangle, square or triangle drawn to scale, each side labelled with its length and
            // a real unit at the working digit size, and "Perimeter = [ ] cm" under it. O6 "Figure
            // labels: some" labels one length and one width of a rectangle or square (the other two
            // follow from equal opposite sides); a triangle keeps all three.
            if (mappedSkill === "perimeter_intro") {
                // Build lane geometry (regrade 5): the shape-grid figure cell (gen-geo-kit.js), drawn
                // to the page's size, with rectangles, triangles and 5- or 6-sided shapes (option
                // "Which shapes"), Support levels and the "Perimeter up to" bound.
                perimeterIntroFigure(q);
                q.screenInstr = 'Add the lengths of all the sides. Write the perimeter.';
                const p = q.cell.payload;
                // the legacy print path draws a rectangle or a triangle only; a 5- or 6-sided shape
                // is a kit cell alone
                if (['rectangle', 'square', 'triangle'].includes(p.shape)) {
                    q.perimeterIntroData = { shape: p.shape, sides: p.sides, ans: p.ans, unit: p.unit, ...(p.show.every(Boolean) ? {} : { labels: 'some' }) };
                }
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
                // AP2 round 3 (critic round 4): a kit cell (sheet/cells/figures.js `ruler`), drawn the
                // same on paper, in the key and on the three screen hosts. The ruler is at TRUE scale
                // (RP-160), the arrow comes from above, and there is ONE answer slot, in the sentence
                // "The arrow points to [ ] inches." Reading to the inch is the Grade 2 step
                // (2.MD.A.1): `parts` defaults to whole inches there; the Quarter Inches skill
                // (3.MD.B.4) reads all three. The ruler carries only the marks the page reads.
                const hard = measSkill === "reading_ruler_hard";
                const parts = _mSet('parts') || (hard ? [0, 1, 2] : [0]);
                const kind = pick(parts);
                const res = parts.includes(2) ? 4 : parts.includes(1) ? 2 : 1;
                let meas;
                if (kind === 0) meas = rng(1, 6);
                else if (kind === 1) meas = rng(0, 5) + 0.5;
                else meas = rng(0, 5) + pick([0.25, 0.75]);
                const ans = _inchText(meas);
                const payload = { len: 6, meas, res, labels: _mLook('labels', 'all'), ans };
                q.cell = { template: 'ruler', v: 1, payload };
                q.visual = k2Twin('ruler', payload);
                q.text = `What length does the arrow point to?`;
                q.screenInstr = 'Read the ruler. Write the number the arrow points to.';
                q.ans = res === 1 ? meas : ans;
                q.answerType = res === 1 ? "number" : "text";
                q.options = [];
                q.hint = res === 1 ? 'Follow the arrow down to the ruler. Read the number under the long mark.'
                    : res === 2 ? 'Find the inch number before the arrow. A mark between two numbers is a half inch.'
                        : 'Find the inch number before the arrow. Count the small spaces after it: each is a quarter inch.';
                q.measurementData = { meas, res, ans };
                q.printFormat = 'reading-ruler';
                q.skillLabel = 'Ruler';
            }
            // ===== TEMPERATURE =====
            else if (measSkill === "temperature") {
                // AP2 round 3 (critic round 4): ONE task, read the thermometer, as a kit cell
                // (sheet/cells/figures.js `thermometer`) drawn the same on paper, in the key and on the
                // three screen hosts, with ONE box and the unit printed after it. The click-all and
                // sort variants (a drag task on paper) and the conversions (a formula, not reading a
                // scale) are gone. A 20-degree window, a mark every degree; the scale numbered every
                // 5 or, with O6 "Figure labels: some", every 10. Never below zero (negative numbers
                // are Grade 6).
                const forms = _mSet('forms');
                const units = (forms || [0, 1]).map(i => ['°F', '°C'][i]).filter(Boolean);
                const unit = pick(units.length ? units : ['°F', '°C']);
                const every = _mLook('labels', 'all') === 'some' ? 10 : 5;
                const lo = pick(unit === '°F' ? [30, 40, 50, 60, 70] : [0, 10, 20]);
                const hi = lo + 20;
                let temp = rng(lo + 1, hi - 1);
                if (temp % every === 0) temp = rng(lo + 1, hi - 1);   // mostly between two numbers
                const payload = { temp, unit, lo, hi, every };
                q.cell = { template: 'thermometer', v: 1, payload };
                q.visual = k2Twin('thermometer', payload);
                q.text = `What is the temperature in ${unit}?`;
                q.screenInstr = 'Read the thermometer. Write the temperature.';
                q.ans = temp;
                q.answerType = 'number';
                q.options = [];
                q.hint = 'Find the top of the dark column. Start at the number just below it and count up one degree for each small mark.';
                q.measurementData = { temp, unit, every, lo, hi };
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
