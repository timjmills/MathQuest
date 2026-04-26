// gen-measurement.js - Measurement question generation (time, money, ruler, temperature, capacity)
import { state } from './state.js';
import { getSkillsForCategory } from './data.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createAnalogClockSVG, createDigitalClockHTML, addTime, subtractTime, formatTime, timeToWords, generateTimeDistractors, createMagnifiableClock, createClockChoiceWithMagnify } from './svg-clock.js';
import { COLORS, STROKE, FONTS, softFill } from './design-tokens.js';

export function generateMeasurementQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // ===== ORDER OBJECTS BY LENGTH (Grade 1) =====
            if (mappedSkill === "order_objects_length") {
                const count = rng(3, 4);
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
                // Tick marks
                let ticks = '';
                for (let i = 0; i <= unitCount; i++) {
                    ticks += `<line x1="${15 + i * unit.unitW}" y1="${unit.name === 'cubes' ? 72 : 62}" x2="${15 + i * unit.unitW}" y2="${unit.name === 'cubes' ? 78 : 68}" stroke="var(--text-dim)" stroke-width="${STROKE.hair}"/>`;
                    if (i > 0) {
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
                    ? `Think about which one weighs the most.`
                    : `Think about which one weighs the least.`;
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

                // Build SVG
                let svg = '';
                if (shape === "rectangle" || shape === "square") {
                    const W = 180, H = 110, padX = 40, padY = 25;
                    const rectW = W - padX * 2;
                    const rectH = H - padY * 2;
                    svg = `<svg viewBox="0 0 ${W} ${H}" width="220" style="display:block;margin:0 auto;background:#fff;">
                        <rect x="${padX}" y="${padY}" width="${rectW}" height="${rectH}" fill="${softFill(COLORS.primary)}" stroke="${COLORS.primary}" stroke-width="${STROKE.bold}"/>
                        <text x="${W / 2}" y="${padY - 6}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[0]}</text>
                        <text x="${W / 2}" y="${H - padY + 16}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[2]}</text>
                        <text x="${padX - 6}" y="${H / 2 + 4}" text-anchor="end" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[1]}</text>
                        <text x="${W - padX + 6}" y="${H / 2 + 4}" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="${COLORS.text}">${sides[3]}</text>
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
                q.perimeterIntroData = { shape, sides, sideLabels, ans };
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
                    if (ri % 4 === 0) {
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
            // ===== TIME TO THE HOUR =====
            else if (measSkill === "time_hour") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set the clock" variant
                if (Math.random() < 0.30) {
                    const targetH = rng(1, 12);
                    q.text = `Set the clock to ${targetH} o'clock.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: targetH % 12, minute: 0 };
                    q.minuteSnap = 5;
                    q.initialHour = 12;
                    q.initialMinute = 0;
                    q.hint = `Drag the hour hand to point at ${targetH}, and the minute hand to 12.`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Time to the Hour";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const hour = rng(1, 12);
                const minute = 0;
                const timeStr = formatTime(hour, minute);

                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `The short hand (hour hand) points to ${hour}. The long hand points to 12, which means ${minute} minutes.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Time to the Hour</div>
                    ${createMagnifiableClock(hour, minute, { size: 290, colorScheme })}
                </div>`;

                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_hour' };
                q.printFormat = "measurement-time";
            }

            // ===== TIME TO HALF HOUR =====
            else if (measSkill === "time_half_hour") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set the clock" variant
                if (Math.random() < 0.30) {
                    const targetH = rng(1, 12);
                    const targetM = pick([0, 30]);
                    const timeStr2 = formatTime(targetH, targetM);
                    q.text = `Set the clock to ${timeStr2}.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: targetH % 12, minute: targetM };
                    q.minuteSnap = 5;
                    q.initialHour = 12;
                    q.initialMinute = 0;
                    q.hint = targetM === 0
                        ? `Point the hour hand at ${targetH} and the minute hand at 12.`
                        : `Point the hour hand at ${targetH} and the minute hand at 6 (half past).`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Time to Half Hour";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const hour = rng(1, 12);
                const minute = pick([0, 30]);
                const timeStr = formatTime(hour, minute);

                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = minute === 0
                    ? `The long hand at 12 means o'clock (${minute} minutes).`
                    : `The long hand at 6 means half past (30 minutes).`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Time to Half Hour</div>
                    ${createMagnifiableClock(hour, minute, { size: 290, colorScheme })}
                </div>`;

                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_half_hour' };
                q.printFormat = "measurement-time";
            }

            // ===== TIME TO QUARTER HOUR =====
            else if (measSkill === "time_quarter") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set the clock" variant
                if (Math.random() < 0.30) {
                    const targetH = rng(1, 12);
                    const targetM = pick([15, 45]);
                    const timeStr2 = formatTime(targetH, targetM);
                    q.text = `Set the clock to ${timeStr2}.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: targetH % 12, minute: targetM };
                    q.minuteSnap = 5;
                    q.initialHour = 12;
                    q.initialMinute = 0;
                    q.hint = targetM === 15
                        ? `Quarter past: minute hand at 3, hour hand just past ${targetH}.`
                        : `Quarter to: minute hand at 9, hour hand near ${targetH === 12 ? 1 : targetH + 1}.`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Time to Quarter Hour";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45]);
                const timeStr = formatTime(hour, minute);

                const minuteHints = {
                    0: "at 12 means o'clock",
                    15: "at 3 means quarter past (15 minutes)",
                    30: "at 6 means half past (30 minutes)",
                    45: "at 9 means quarter to (45 minutes)"
                };

                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `The long hand ${minuteHints[minute]}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Time to Quarter Hour</div>
                    ${createMagnifiableClock(hour, minute, { size: 290, colorScheme })}
                </div>`;

                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_quarter' };
                q.printFormat = "measurement-time";
            }

            // ===== TIME TO 5 MINUTES =====
            else if (measSkill === "time_5min") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set the clock" variant
                if (Math.random() < 0.30) {
                    const targetH = rng(1, 12);
                    const targetM = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
                    const timeStr2 = formatTime(targetH, targetM);
                    q.text = `Set the clock to ${timeStr2}.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: targetH % 12, minute: targetM };
                    q.minuteSnap = 5;
                    q.initialHour = 12;
                    q.initialMinute = 0;
                    q.hint = `Count by 5s: minute hand at ${targetM / 5}, hour hand near ${targetH}.`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Time to 5 Minutes";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const hour = rng(1, 12);
                const minute = pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
                const timeStr = formatTime(hour, minute);

                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `Count by 5s from 12. The long hand is at ${minute === 0 ? 12 : minute / 5}, which is ${minute} minutes.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Time to 5 Minutes</div>
                    ${createMagnifiableClock(hour, minute, { size: 290, colorScheme, showMinuteTicks: true })}
                </div>`;

                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_5min' };
                q.printFormat = "measurement-time";
            }

            // ===== TIME TO THE MINUTE =====
            else if (measSkill === "time_1min") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set the clock" variant
                if (Math.random() < 0.30) {
                    const targetH = rng(1, 12);
                    const targetM = rng(1, 59);
                    const timeStr2 = formatTime(targetH, targetM);
                    q.text = `Set the clock to ${timeStr2}.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: targetH % 12, minute: targetM };
                    q.minuteSnap = 1;
                    q.initialHour = 12;
                    q.initialMinute = 0;
                    q.hint = `Hour hand near ${targetH}; count individual minute ticks to ${targetM}.`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Time to the Minute";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const hour = rng(1, 12);
                const minute = rng(0, 59);
                const timeStr = formatTime(hour, minute);

                q.text = `What time does this clock show?`;
                q.ans = timeStr;
                q.answerType = "text";
                q.hint = `The hour hand is near ${hour}. Count each small tick mark for minutes: ${minute} minutes.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Time to the Minute</div>
                    ${createMagnifiableClock(hour, minute, { size: 290, colorScheme, showMinuteTicks: true })}
                </div>`;

                q.options = generateTimeDistractors(hour, minute);
                q.measurementData = { hour, minute, timeStr, skill: 'time_1min' };
                q.printFormat = "measurement-time";
            }

            // ===== ANALOG TO DIGITAL MATCHING =====
            else if (measSkill === "time_analog_digital" && Math.random() < 0.30) {
                // Drag-and-drop ORDER variant: 4 times shown as a mix of analog
                // and digital labels; student drags into chronological order.
                // The dnd-generic widget HTML-escapes tile labels, so we use
                // plain text with [Analog] / [Digital] tags to differentiate.
                const baseHour = randInt(1, 10);
                const times = [];
                while (times.length < 4) {
                    const h = randInt(baseHour, baseHour + 2);
                    const m = pick([0, 15, 30, 45]);
                    const minutes = h * 60 + m;
                    if (!times.some(t => t.minutes === minutes)) {
                        times.push({ hour: h, minute: m, minutes });
                    }
                }
                const sorted = [...times].sort((a, b) => a.minutes - b.minutes);
                const presentation = times.map((t, i) => {
                    const isDigital = Math.random() < 0.5;
                    const timeText = `${t.hour}:${String(t.minute).padStart(2, '0')}`;
                    const tag = isDigital ? 'Digital' : 'Analog';
                    return {
                        id: 't' + i,
                        label: `[${tag}] ${timeText}`,
                        minutes: t.minutes,
                        isDigital
                    };
                });
                // Shuffle for presentation order
                for (let i = presentation.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [presentation[i], presentation[j]] = [presentation[j], presentation[i]];
                }
                const ans = sorted.map(t => presentation.find(p => p.minutes === t.minutes).id);
                q.text = 'Drag the clocks into order from EARLIEST to LATEST.';
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                q.tiles = presentation.map(({ id, label }) => ({ id, label }));
                q.ans = ans;
                q.orderLabel = 'earliest to latest';
                q.hint = 'Read each clock as a time of day, then put the smallest time first.';
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = 'Order Clocks';
                return;
            }
            else if (measSkill === "time_analog_digital") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
                const timeStr = formatTime(hour, minute);
                const direction = pick(['analog_to_digital', 'digital_to_analog']);

                if (direction === 'analog_to_digital') {
                    // Show analog clock, pick digital answer
                    q.text = `Which digital clock shows the same time?`;
                    q.ans = timeStr;
                    q.answerType = "text";
                    q.hint = `Read the analog clock: hour hand near ${hour}, minute hand at ${minute === 0 ? 12 : minute / 5 || minute}.`;

                    // Create wrong digital options
                    const wrongTime1 = addTime(hour, minute, 1, 0);
                    const wrongTime2 = addTime(hour, minute, 0, 15);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Analog → Digital</div>
                        <div style="margin-bottom:20px;">
                            ${createMagnifiableClock(hour, minute, { size: 210, colorScheme })}
                        </div>
                        <div style="font-weight:600;margin-bottom:15px;color:var(--text-dim);">Which digital clock shows the same time?</div>
                        <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">
                            ${createDigitalClockHTML(hour, minute, { colorScheme: 'yellow', size: 'medium' })}
                            ${createDigitalClockHTML(wrongTime1.hour, wrongTime1.minute, { colorScheme: 'yellow', size: 'medium' })}
                        </div>
                    </div>`;
                } else {
                    // Show digital clock, pick analog answer — click the correct clock
                    q.text = `Which analog clock shows ${timeStr}?`;
                    q.ans = timeStr;
                    q.answerType = "clock-choice";
                    q.hint = `The digital clock shows ${hour}:${minute.toString().padStart(2, '0')}. Find the analog clock with hour hand near ${hour}.`;

                    const wrongHour = hour === 12 ? 1 : hour + 1;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Digital → Analog</div>
                        <div style="margin-bottom:20px;">
                            ${createDigitalClockHTML(hour, minute, { colorScheme: 'yellow', size: 'large' })}
                        </div>
                        <div style="font-weight:600;margin-bottom:15px;color:var(--text-dim);">Which clock shows this time?</div>
                        <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;">
                            ${createClockChoiceWithMagnify(hour, minute, 'blue', timeStr, 130)}
                            ${createClockChoiceWithMagnify(wrongHour, minute, 'purple', formatTime(wrongHour, minute), 130)}
                        </div>
                    </div>`;
                    q.options = [];
                }

                if (q.answerType !== "clock-choice") {
                    q.options = generateTimeDistractors(hour, minute);
                }
                q.measurementData = { hour, minute, timeStr, direction, skill: 'time_analog_digital' };
                q.printFormat = "measurement-clock-match";
            }

            // ===== MATCH TIME TO CLOCK =====
            else if (measSkill === "time_match_clock") {
                const hour = rng(1, 12);
                const minute = pick([0, 15, 30, 45, 5, 10, 20, 25, 35, 40, 50, 55]);
                const timeStr = formatTime(hour, minute);
                const timeWords = timeToWords(hour, minute);

                // Create a wrong clock
                const wrongOptions = [
                    { h: hour === 12 ? 1 : hour + 1, m: minute }, // Off by 1 hour
                    { h: hour, m: (minute + 30) % 60 }, // Off by 30 min
                    { h: Math.floor(minute / 5) || 12, m: hour * 5 } // Swapped hands
                ];
                const wrong = pick(wrongOptions);

                q.text = `Which clock shows ${timeWords}?`;
                q.ans = timeStr;
                q.answerType = "clock-choice";
                q.hint = `${timeWords} means ${timeStr}. Look for the clock with hour hand near ${hour}.`;

                // Randomize order
                const clocksData = shuffle([
                    { h: hour, m: minute, correct: true },
                    { h: wrong.h, m: wrong.m, correct: false }
                ]);

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Match Time to Clock</div>
                    <div style="font-size:1.3rem;font-weight:700;margin-bottom:20px;color:var(--accent-cyan);">"${timeWords}"</div>
                    <div style="display:flex;justify-content:center;gap:30px;flex-wrap:wrap;">
                        ${clocksData.map((c, i) =>
                            createClockChoiceWithMagnify(c.h, c.m, i === 0 ? 'blue' : 'purple', formatTime(c.h, c.m), 140)
                        ).join('')}
                    </div>
                </div>`;

                q.options = [];
                q.measurementData = { hour, minute, timeStr, timeWords, skill: 'time_match_clock' };
                q.printFormat = "measurement-clock-match";
            }

            // ===== ORDER CLOCKS (drag clocks into chronological order) =====
            // 4 variants: analog/digital × ascending/descending. Students drag
            // 3-5 clock tiles into the correct chronological sequence using the
            // generic dnd-generic widget in 'order' mode. Tile content is the
            // clock SVG/HTML rather than a text label.
            else if (
                measSkill === "order_clocks_analog_asc" ||
                measSkill === "order_clocks_analog_desc" ||
                measSkill === "order_clocks_digital_asc" ||
                measSkill === "order_clocks_digital_desc"
            ) {
                const isAnalog = measSkill.indexOf('analog') !== -1;
                const direction = measSkill.endsWith('asc') ? 'asc' : 'desc';

                // Choose 3-5 unique times. Use 15-minute increments so the
                // visual difference between analog clocks is unmistakable for
                // K-2 readers.
                const count = rng(3, 5);
                const seen = new Set();
                const times = [];
                let safety = 0;
                while (times.length < count && safety < 200) {
                    safety++;
                    const h = rng(1, 12);
                    const m = pick([0, 15, 30, 45]);
                    // For ordering, we sort by the displayed 12-hour minute
                    // count (h is already in 1-12 range, midnight not used).
                    // Map 12 → 0 so 12:30 sorts BEFORE 1:00 within the hour
                    // ring on the same dial face.
                    const h12 = h % 12;
                    const minutes = h12 * 60 + m;
                    if (seen.has(minutes)) continue;
                    seen.add(minutes);
                    times.push({ h, m, minutes });
                }

                const sorted = [...times].sort((a, b) =>
                    direction === 'asc' ? a.minutes - b.minutes : b.minutes - a.minutes
                );

                // Build tile payloads. Each tile carries an SVG or HTML clock
                // and a hidden numeric `value` so the answer key can resolve
                // to the correct tile id regardless of presentation order.
                const tiles = times.map((t, i) => {
                    const ariaTime = formatTime(t.h, t.m);
                    let html;
                    if (isAnalog) {
                        // forPrint:true gives a fixed-pixel SVG that scales
                        // cleanly inside the tile button (no max-width:42vh
                        // shrink that the screen path adds).
                        html = createAnalogClockSVG(t.h, t.m, {
                            size: 110,
                            colorScheme: 'blue',
                            forPrint: true
                        });
                    } else {
                        html = createDigitalClockHTML(t.h, t.m, {
                            size: 'medium',
                            colorScheme: 'yellow'
                        });
                    }
                    return {
                        id: 't' + i,
                        html,
                        ariaLabel: `clock showing ${ariaTime}`,
                        value: t.minutes,
                    };
                });

                // q.tiles is the SHUFFLED presentation order shown in the tray.
                const presentation = shuffle(tiles.slice());

                // Build answer array: for order mode, q.ans is [tileId,...]
                // in the correct sequence (1st → last).
                const ans = sorted.map(target => {
                    const match = tiles.find(x => x.value === target.minutes);
                    return match.id;
                });

                const dirText = direction === 'asc'
                    ? 'EARLIEST to LATEST'
                    : 'LATEST to EARLIEST';
                const clockKind = isAnalog ? 'analog' : 'digital';
                q.text = `Drag the ${clockKind} clocks in order from ${dirText}.`;
                q.answerType = 'dnd-generic';
                q.dndMode = 'order';
                // Strip non-display fields so q.tiles only carries what the
                // widget needs to render.
                q.tiles = presentation.map(({ id, html, ariaLabel }) => ({
                    id, html, ariaLabel
                }));
                q.ans = ans;
                q.orderLabel = direction === 'asc'
                    ? 'earliest to latest'
                    : 'latest to earliest';
                q.hint = direction === 'asc'
                    ? 'Find the clock that shows the smallest time first.'
                    : 'Find the clock that shows the largest time first.';
                q.options = [];
                q.printFormat = 'dnd-generic';
                q.skillLabel = (isAnalog ? 'Order Analog Clocks ' : 'Order Digital Clocks ')
                    + (direction === 'asc' ? '↑' : '↓');
                return;
            }

            // ===== ELAPSED TIME - 30 MINUTES =====
            else if (measSkill === "elapsed_30min") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set END clock" variant
                if (Math.random() < 0.30) {
                    const sH = rng(1, 11);
                    const sM = pick([0, 15, 30, 45]);
                    const end = addTime(sH, sM, 0, 30);
                    const endH12 = end.hour % 12;
                    q.text = `It is now ${formatTime(sH, sM)}. Set the clock to show 30 minutes later.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: endH12, minute: end.minute };
                    q.minuteSnap = 5;
                    q.initialHour = sH;
                    q.initialMinute = sM;
                    q.hint = `Add 30 minutes to ${formatTime(sH, sM)}.`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Elapsed Time (30 min)";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const startHour = rng(1, 11);
                const startMin = pick([0, 30]);
                const direction = pick(['forward', 'backward']);

                let result, questionText;
                if (direction === 'forward') {
                    result = addTime(startHour, startMin, 0, 30);
                    questionText = `What time will it be in 30 minutes?`;
                } else {
                    result = subtractTime(startHour, startMin, 0, 30);
                    questionText = `What time was it 30 minutes ago?`;
                }

                const startStr = formatTime(startHour, startMin);
                const answerStr = formatTime(result.hour, result.minute);

                q.text = questionText;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = direction === 'forward'
                    ? `Move the minute hand halfway around the clock (30 minutes).`
                    : `Move the minute hand backward halfway around the clock.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (+/- 30 min)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 210, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">${direction === 'forward' ? '+' : '-'} 30 minutes</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;

                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, direction, elapsed: { hours: 0, minutes: 30 }, skill: 'elapsed_30min' };
                q.printFormat = "measurement-elapsed";
            }

            // ===== ELAPSED TIME - HOURS =====
            else if (measSkill === "elapsed_hour") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set END clock" variant
                if (Math.random() < 0.30) {
                    const sH = rng(1, 10);
                    const sM = pick([0, 15, 30, 45]);
                    const elapH = rng(1, 4);
                    const end = addTime(sH, sM, elapH, 0);
                    const endH12 = end.hour % 12;
                    q.text = `It is now ${formatTime(sH, sM)}. Set the clock to show ${elapH} hour${elapH > 1 ? 's' : ''} later.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: endH12, minute: end.minute };
                    q.minuteSnap = 5;
                    q.initialHour = sH;
                    q.initialMinute = sM;
                    q.hint = `Add ${elapH} hour${elapH > 1 ? 's' : ''} to ${formatTime(sH, sM)} (the minutes stay the same).`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Elapsed Time (Hours)";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const startHour = rng(1, 10);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 4);
                const direction = pick(['forward', 'backward']);

                let result, questionText;
                if (direction === 'forward') {
                    result = addTime(startHour, startMin, elapsedHours, 0);
                    questionText = `What time will it be in ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}?`;
                } else {
                    result = subtractTime(startHour, startMin, elapsedHours, 0);
                    questionText = `What time was it ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''} ago?`;
                }

                const startStr = formatTime(startHour, startMin);
                const answerStr = formatTime(result.hour, result.minute);

                q.text = questionText;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = `The minute hand stays the same. ${direction === 'forward' ? 'Add' : 'Subtract'} ${elapsedHours} to the hour.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (Hours)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 210, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">${direction === 'forward' ? '+' : '-'} ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;

                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, direction, elapsed: { hours: elapsedHours, minutes: 0 }, skill: 'elapsed_hour' };
                q.printFormat = "measurement-elapsed";
            }

            // ===== ELAPSED TIME - 15 MINUTES =====
            else if (measSkill === "elapsed_15min") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set END clock" variant
                if (Math.random() < 0.30) {
                    const sH = rng(1, 11);
                    const sM = pick([0, 15, 30, 45]);
                    const elapM = pick([15, 30, 45]);
                    const end = addTime(sH, sM, 0, elapM);
                    const endH12 = end.hour % 12;
                    q.text = `It is now ${formatTime(sH, sM)}. Set the clock to show ${elapM} minutes later.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: endH12, minute: end.minute };
                    q.minuteSnap = 15;
                    q.initialHour = sH;
                    q.initialMinute = sM;
                    q.hint = `Add ${elapM} minutes (${elapM / 15} quarter${elapM > 15 ? 's' : ''} of the clock).`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Elapsed Time (15 min)";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const startHour = rng(1, 11);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedMin = pick([15, 30, 45]);
                const direction = pick(['forward', 'backward']);

                let result, questionText;
                if (direction === 'forward') {
                    result = addTime(startHour, startMin, 0, elapsedMin);
                    questionText = `What time will it be in ${elapsedMin} minutes?`;
                } else {
                    result = subtractTime(startHour, startMin, 0, elapsedMin);
                    questionText = `What time was it ${elapsedMin} minutes ago?`;
                }

                const answerStr = formatTime(result.hour, result.minute);

                q.text = questionText;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = `${elapsedMin} minutes = ${elapsedMin / 15} quarter${elapsedMin > 15 ? 's' : ''} of the clock.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (Minutes)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 210, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">${direction === 'forward' ? '+' : '-'} ${elapsedMin} minutes</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;

                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, direction, elapsed: { hours: 0, minutes: elapsedMin }, skill: 'elapsed_15min' };
                q.printFormat = "measurement-elapsed";
            }

            // ===== ELAPSED TIME - MIXED (HOURS AND MINUTES) =====
            else if (measSkill === "elapsed_mixed") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set END clock" variant
                if (Math.random() < 0.30) {
                    const sH = rng(1, 10);
                    const sM = pick([0, 15, 30, 45]);
                    const elapH = rng(1, 3);
                    const elapM = pick([15, 30, 45]);
                    const end = addTime(sH, sM, elapH, elapM);
                    const endH12 = end.hour % 12;
                    q.text = `It is now ${formatTime(sH, sM)}. Set the clock to show ${elapH} hour${elapH > 1 ? 's' : ''} ${elapM} minutes later.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: endH12, minute: end.minute };
                    q.minuteSnap = 5;
                    q.initialHour = sH;
                    q.initialMinute = sM;
                    q.hint = `First add ${elapH} hour${elapH > 1 ? 's' : ''}, then add ${elapM} minutes.`;
                    q.printFormat = "clock-set";
                    q.skillLabel = "Elapsed Time (Hours & Minutes)";
                    q.options = [];
                    q.visual = "";
                    return;
                }
                const startHour = rng(1, 10);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 3);
                const elapsedMin = pick([15, 30, 45]);

                const result = addTime(startHour, startMin, elapsedHours, elapsedMin);
                const answerStr = formatTime(result.hour, result.minute);

                q.text = `What time will it be in ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''} and ${elapsedMin} minutes?`;
                q.ans = answerStr;
                q.answerType = "text";
                q.hint = `First add ${elapsedHours} hour${elapsedHours > 1 ? 's' : ''}, then add ${elapsedMin} minutes.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time (Hours & Minutes)</div>
                    <div style="font-size:0.95rem;color:var(--text-dim);margin-bottom:15px;">Starting time:</div>
                    ${createMagnifiableClock(startHour, startMin, { size: 210, colorScheme })}
                    <div style="font-size:1.1rem;font-weight:700;margin:15px 0;color:var(--accent-cyan);">+ ${elapsedHours} hr ${elapsedMin} min</div>
                    <div style="font-size:1rem;">New time: <span style="border-bottom:3px solid var(--accent-green);padding:2px 20px;font-weight:700;">?</span></div>
                </div>`;

                q.options = generateTimeDistractors(result.hour, result.minute);
                q.measurementData = { startHour, startMin, result, elapsed: { hours: elapsedHours, minutes: elapsedMin }, skill: 'elapsed_mixed' };
                q.printFormat = "measurement-elapsed";
            }

            // ===== FIND THE DURATION =====
            else if (measSkill === "elapsed_find_duration") {
                const startHour = rng(8, 11);
                const startMin = pick([0, 15, 30, 45]);
                const elapsedHours = rng(1, 4);
                const elapsedMin = pick([0, 15, 30, 45]);

                const end = addTime(startHour, startMin, elapsedHours, elapsedMin);
                const startAMPM = 'A.M.';
                const endAMPM = end.hour >= 12 ? 'P.M.' : 'A.M.';

                const totalMinutes = elapsedHours * 60 + elapsedMin;

                q.text = `Find the elapsed time.`;
                q.ans = totalMinutes;
                q.hint = `Count the hours first, then add the minutes. Total = ${elapsedHours} × 60 + ${elapsedMin} = ${totalMinutes} minutes.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Find the Duration</div>
                    <div style="display:inline-block;background:linear-gradient(135deg, #f3e5f5, #e8f5e9);padding:20px 30px;border-radius:12px;border:2px solid #ce93d8;margin-bottom:20px;">
                        <div style="font-size:1.1rem;margin-bottom:8px;"><b>Start:</b> ${formatTime(startHour, startMin)} ${startAMPM}</div>
                        <div style="font-size:1.1rem;"><b>End:</b> ${formatTime(end.hour % 12 || 12, end.minute)} ${endAMPM}</div>
                    </div>
                    <div style="display:flex;justify-content:center;gap:15px;margin-top:15px;">
                        <div style="text-align:center;">
                            <input type="number" id="elapsedHoursInput" placeholder="?"
                                style="width:60px;height:40px;text-align:center;font-size:1.2rem;border:2px solid var(--accent-cyan);border-radius:8px;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:5px;">hours</div>
                        </div>
                        <div style="text-align:center;">
                            <input type="number" id="elapsedMinutesInput" placeholder="?"
                                style="width:60px;height:40px;text-align:center;font-size:1.2rem;border:2px solid var(--accent-cyan);border-radius:8px;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-top:5px;">minutes</div>
                        </div>
                    </div>
                </div>`;

                q.options = buildNumericOptions(totalMinutes);
                q.measurementData = { startHour, startMin, endHour: end.hour, endMin: end.minute, elapsedHours, elapsedMin, totalMinutes, skill: 'elapsed_find_duration' };
                q.printFormat = "measurement-elapsed-find";
            }

            // ===== ELAPSED TIME CLOCKS (VISUAL) - Easy / Medium / Hard =====
            else if (measSkill === "elapsed_visual_easy" || measSkill === "elapsed_visual_medium" || measSkill === "elapsed_visual_hard") {
                // Phase 4.5 batch 7: 30% chance clock-set "Set END clock" variant
                if (Math.random() < 0.30) {
                    let sMinOpts, elOpts, diffLab2, snap2;
                    if (measSkill === "elapsed_visual_easy") {
                        sMinOpts = [0, 30];
                        elOpts = [30, 60, 90, 120];
                        diffLab2 = "Easy";
                        snap2 = 5;
                    } else if (measSkill === "elapsed_visual_medium") {
                        sMinOpts = [0, 15, 30, 45];
                        elOpts = [15, 30, 45, 60, 75, 90, 120];
                        diffLab2 = "Medium";
                        snap2 = 5;
                    } else {
                        sMinOpts = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
                        elOpts = [5, 10, 20, 25, 35, 40, 50, 55, 65, 80, 95, 110];
                        diffLab2 = "Hard";
                        snap2 = 1;
                    }
                    const sH = rng(1, 11);
                    const sM = pick(sMinOpts);
                    const elTotal = pick(elOpts);
                    const end = addTime(sH, sM, 0, elTotal);
                    const endH12 = end.hour % 12;
                    const eHrs2 = Math.floor(elTotal / 60);
                    const eMins2 = elTotal % 60;
                    let elapsedText;
                    if (eHrs2 === 0) elapsedText = `${eMins2} minute${eMins2 !== 1 ? 's' : ''}`;
                    else if (eMins2 === 0) elapsedText = `${eHrs2} hour${eHrs2 !== 1 ? 's' : ''}`;
                    else elapsedText = `${eHrs2} hr ${eMins2} min`;
                    q.text = `It is now ${formatTime(sH, sM)}. Set the clock to show ${elapsedText} later.`;
                    q.answerType = "clock-set";
                    q.ans = { hour: endH12, minute: end.minute };
                    q.minuteSnap = snap2;
                    q.initialHour = sH;
                    q.initialMinute = sM;
                    q.hint = `Add ${elapsedText} to ${formatTime(sH, sM)}.`;
                    q.printFormat = "clock-set";
                    q.skillLabel = `Elapsed Time Clocks (${diffLab2})`;
                    q.options = [];
                    q.visual = "";
                    return;
                }
                // Determine difficulty parameters
                let startMinOptions, elapsedOptions, diffLabel;
                if (measSkill === "elapsed_visual_easy") {
                    startMinOptions = [0, 30];
                    elapsedOptions = [30, 60, 90, 120, 150, 180];
                    diffLabel = "Easy";
                } else if (measSkill === "elapsed_visual_medium") {
                    startMinOptions = [0, 15, 30, 45];
                    elapsedOptions = [15, 30, 45, 60, 75, 90, 105, 120];
                    diffLabel = "Medium";
                } else {
                    startMinOptions = [];
                    for (let m = 0; m < 60; m += 1) startMinOptions.push(m);
                    elapsedOptions = [];
                    for (let m = 5; m <= 180; m += 5) elapsedOptions.push(m);
                    // Also include some non-round numbers for hard
                    elapsedOptions.push(7, 13, 22, 37, 43, 53, 67, 83, 97, 113, 127, 143);
                    diffLabel = "Hard";
                }

                const startHour = rng(1, 11);
                const startMin = pick(startMinOptions);
                const elapsedTotal = pick(elapsedOptions);
                const end = addTime(startHour, startMin, 0, elapsedTotal);
                const endHour = end.hour;
                const endMin = end.minute;

                // Format elapsed time for display
                const eHrs = Math.floor(elapsedTotal / 60);
                const eMins = elapsedTotal % 60;
                let answerText;
                if (eHrs === 0) answerText = `${eMins} minute${eMins !== 1 ? 's' : ''}`;
                else if (eMins === 0) answerText = `${eHrs} hour${eHrs !== 1 ? 's' : ''}`;
                else answerText = `${eHrs} hr ${eMins} min`;

                // Generate distractors
                const distractorSet = new Set();
                distractorSet.add(answerText);
                const offsets = [15, 30, -15, -30, 60, -60, 45, -45, 10, -10, 20, -20];
                for (const off of offsets) {
                    if (distractorSet.size >= 4) break;
                    const alt = elapsedTotal + off;
                    if (alt > 0 && alt <= 300 && alt !== elapsedTotal) {
                        const h = Math.floor(alt / 60);
                        const m = alt % 60;
                        let txt;
                        if (h === 0) txt = `${m} minute${m !== 1 ? 's' : ''}`;
                        else if (m === 0) txt = `${h} hour${h !== 1 ? 's' : ''}`;
                        else txt = `${h} hr ${m} min`;
                        distractorSet.add(txt);
                    }
                }
                // Fill remaining slots if needed
                while (distractorSet.size < 4) {
                    const alt = rng(10, 180);
                    if (alt !== elapsedTotal) {
                        const h = Math.floor(alt / 60);
                        const m = alt % 60;
                        let txt;
                        if (h === 0) txt = `${m} minute${m !== 1 ? 's' : ''}`;
                        else if (m === 0) txt = `${h} hour${h !== 1 ? 's' : ''}`;
                        else txt = `${h} hr ${m} min`;
                        distractorSet.add(txt);
                    }
                }

                q.ans = answerText;
                q.answerType = "text";
                q.options = [];
                q.text = `How much time has passed from the first clock to the second?`;
                q.hint = eHrs > 0
                    ? `Count the hours first (${eHrs}), then count the extra minutes (${eMins}).`
                    : `Count how many minutes the minute hand has moved.`;

                // Pick clock display type: analog-analog, digital-digital, or mixed
                const clockType = pick(['analog-analog', 'digital-digital', 'analog-digital', 'digital-analog']);
                const color1 = pick(['blue', 'purple', 'yellow']);
                const color2 = color1 === 'blue' ? 'purple' : 'blue';

                // Build screen visual (magnifiable)
                let clock1HTML, clock2HTML;
                if (clockType.startsWith('analog')) {
                    clock1HTML = createMagnifiableClock(startHour, startMin, { size: 200, colorScheme: color1 });
                } else {
                    clock1HTML = createDigitalClockHTML(startHour, startMin, { size: 'large', colorScheme: color1, showAMPM: true });
                }
                if (clockType.endsWith('analog')) {
                    clock2HTML = createMagnifiableClock(endHour, endMin, { size: 200, colorScheme: color2 });
                } else {
                    clock2HTML = createDigitalClockHTML(endHour, endMin, { size: 'large', colorScheme: color2, showAMPM: true });
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">⏰ Elapsed Time Clocks (${diffLabel})</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
                        <div style="text-align:center;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;font-weight:600;">Start</div>
                            ${clock1HTML}
                        </div>
                        <div style="font-size:2rem;color:var(--accent-cyan);font-weight:900;">→</div>
                        <div style="text-align:center;">
                            <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:8px;font-weight:600;">End</div>
                            ${clock2HTML}
                        </div>
                    </div>
                    <div style="font-size:1.05rem;font-weight:700;margin-top:18px;color:var(--text-bright);">How much time has passed?</div>
                </div>`;

                q.measurementData = {
                    startHour, startMin, endHour, endMin, elapsedTotal,
                    clockType, color1, color2, answerText,
                    skill: measSkill
                };
                q.printFormat = "measurement-elapsed-visual";
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
                    q.hint = `Read the thermometer scale carefully`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Temperature</div>
                        <div style="font-size:2rem;font-weight:700;color:${temp < 0 ? '#3498db' : temp > 30 ? '#e74c3c' : '#27ae60'};">${temp}${unit}</div>
                    </div>`;
                    q.measurementData = { temp, unit };
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

            // ===== MONEY =====
            else if (measSkill === "money") {
                // Phase 4.5 batch 13: 25% multi-select-check "ways to make N cents"
                if (Math.random() < 0.25) {
                    const targets = [25, 50, 75, 100];
                    const target = pick(targets);

                    // Combos that equal the target (handcrafted, common)
                    const matchPool = {
                        25: [
                            { label: '1 quarter (25¢)', cents: 25 },
                            { label: '2 dimes + 1 nickel (10+10+5)', cents: 25 },
                            { label: '5 nickels (5+5+5+5+5)', cents: 25 },
                            { label: '1 dime + 3 nickels (10+5+5+5)', cents: 25 },
                            { label: '2 dimes + 5 pennies (10+10+5×1)', cents: 25 }
                        ],
                        50: [
                            { label: '2 quarters (25+25)', cents: 50 },
                            { label: '5 dimes (10×5)', cents: 50 },
                            { label: '1 quarter + 2 dimes + 1 nickel (25+10+10+5)', cents: 50 },
                            { label: '10 nickels (5×10)', cents: 50 },
                            { label: '4 dimes + 2 nickels (10×4 + 5×2)', cents: 50 }
                        ],
                        75: [
                            { label: '3 quarters (25+25+25)', cents: 75 },
                            { label: '2 quarters + 2 dimes + 1 nickel (25+25+10+10+5)', cents: 75 },
                            { label: '7 dimes + 1 nickel (10×7 + 5)', cents: 75 },
                            { label: '1 quarter + 5 dimes (25 + 10×5)', cents: 75 },
                            { label: '6 dimes + 3 nickels (10×6 + 5×3)', cents: 75 }
                        ],
                        100: [
                            { label: '4 quarters (25×4)', cents: 100 },
                            { label: '10 dimes (10×10)', cents: 100 },
                            { label: '3 quarters + 2 dimes + 1 nickel (25×3+10+10+5)', cents: 100 },
                            { label: '2 quarters + 5 dimes (25+25 + 10×5)', cents: 100 },
                            { label: '1 quarter + 7 dimes + 1 nickel (25 + 10×7 + 5)', cents: 100 }
                        ]
                    };
                    const distractorPool = {
                        25: [
                            { label: '2 dimes (10+10)', cents: 20 },
                            { label: '4 nickels (5×4)', cents: 20 },
                            { label: '1 quarter + 1 nickel (25+5)', cents: 30 }
                        ],
                        50: [
                            { label: '4 dimes (10×4)', cents: 40 },
                            { label: '1 quarter + 1 dime (25+10)', cents: 35 },
                            { label: '2 quarters + 1 dime (25+25+10)', cents: 60 }
                        ],
                        75: [
                            { label: '2 quarters + 1 dime (25+25+10)', cents: 60 },
                            { label: '6 dimes (10×6)', cents: 60 },
                            { label: '3 quarters + 1 nickel (25×3+5)', cents: 80 }
                        ],
                        100: [
                            { label: '3 quarters (25×3)', cents: 75 },
                            { label: '9 dimes (10×9)', cents: 90 },
                            { label: '4 quarters + 1 nickel (25×4+5)', cents: 105 }
                        ]
                    };

                    const goodPool = shuffle([...matchPool[target]]);
                    const badPool = shuffle([...distractorPool[target]]);
                    const goodCount = Math.min(3, goodPool.length);
                    const badCount = 6 - goodCount;
                    const chosen = [
                        ...goodPool.slice(0, goodCount).map(o => ({ ...o, ok: true })),
                        ...badPool.slice(0, badCount).map(o => ({ ...o, ok: false }))
                    ];
                    shuffle(chosen);
                    const opts = chosen.map((it, i) => ({
                        id: 'opt' + i,
                        label: it.label,
                        correct: it.ok
                    }));
                    if (!opts.some(o => o.correct)) opts[0].correct = true;
                    if (!opts.some(o => !o.correct)) opts[opts.length - 1].correct = false;
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL ways to make ${target}¢.`;
                    q.answerType = 'multi-select-check';
                    q.options = opts;
                    q.ans = ans;
                    q.hint = `Add each combo and select every one that equals ${target}¢.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Money';
                    return;
                }
                const mode = pick(["make_change", "total"]);
                if (mode === "make_change") {
                    const cost = rng(1, 9) + rng(0, 99) / 100;
                    const paid = Math.ceil(cost);
                    const change = parseFloat((paid - cost).toFixed(2));

                    q.ans = change;
                    q.text = `You paid $${paid.toFixed(2)} for something that cost $${cost.toFixed(2)}. What is your change?`;
                    q.hint = `Change = Amount paid - Cost`;
                    q.measurementData = { cost, paid, change };
                    // Wire the column-subtraction workmat: minuend (paid) on top,
                    // subtrahend (cost) below, decimal-aligned with cents.
                    q.minuend = paid;
                    q.subtrahend = cost;
                    q.decimalPlaces = 2;
                    q.dollarSign = true;
                    q.answerType = 'col-subtract';
                    q.printFormat = "measurement-money";
                    q.skillLabel = 'Money';
                    return;
                } else {
                    const items = [
                        rng(1, 5) + rng(0, 99) / 100,
                        rng(1, 3) + rng(0, 99) / 100
                    ];
                    const total = parseFloat(items.reduce((a, b) => a + b, 0).toFixed(2));

                    q.ans = total;
                    q.text = `Find the total: $${items[0].toFixed(2)} + $${items[1].toFixed(2)}`;
                    q.hint = `Add the dollars, then add the cents`;
                    q.measurementData = { items, total };
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Money</div>
                    <div style="font-size:1.2rem;margin:15px 0;">Answer: $<span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span></div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "measurement-money";
            }

            // ===== MONEY COUNT (visual coins & bills) =====
            else if (measSkill === "money_count") {
                // US coin definitions — penny (1c), nickel (5c), dime (10c), quarter (25c)
                // Sizes proportional to real US coins: quarter biggest, dime smallest
                const coinDefs = [
                    { label: '1\u00A2', name: 'penny', valueCents: 1, svgR: 30 },
                    { label: '5\u00A2', name: 'nickel', valueCents: 5, svgR: 38 },
                    { label: '10\u00A2', name: 'dime', valueCents: 10, svgR: 34 },
                    { label: '25\u00A2', name: 'quarter', valueCents: 25, svgR: 44 }
                ];
                // Bill definitions — $1, $5, $10, $20
                const billDefs = [
                    { label: '$1', valueDollars: 1 },
                    { label: '$5', valueDollars: 5 },
                    { label: '$10', valueDollars: 10 },
                    { label: '$20', valueDollars: 20 },
                    { label: '$50', valueDollars: 50 },
                    { label: '$100', valueDollars: 100 }
                ];

                // Render a single coin as B&W SVG circle with denomination text
                const renderCoin = (coin) => {
                    const d = coin.svgR * 2 + 4;
                    const cx = d / 2, cy = d / 2;
                    return `<svg width="${d}" height="${d}" viewBox="0 0 ${d} ${d}" style="margin:3px;">
                        <circle cx="${cx}" cy="${cy}" r="${coin.svgR}" fill="#fff" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>
                        <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="${coin.svgR * 0.7}" font-family='${FONTS.sans}' font-weight="bold" fill="${COLORS.axis}">${coin.label}</text>
                    </svg>`;
                };
                // Render a single bill as B&W rectangle with $ value
                const renderBill = (bill) => {
                    return `<svg width="170" height="78" viewBox="0 0 170 78" style="margin:5px;">
                        <rect x="1" y="1" width="168" height="76" rx="6" fill="#fff" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>
                        <text x="85" y="48" text-anchor="middle" font-size="28" font-family='${FONTS.sans}' font-weight="bold" fill="${COLORS.axis}">${bill.label}</text>
                    </svg>`;
                };

                // Scale bill selection by range
                let usableBills = billDefs.filter(b => b.valueDollars <= Math.max(range, 20));
                if (usableBills.length < 3) usableBills = billDefs.slice(0, 4);

                // Phase 4.5 batch 13: 25% multi-select-check "click coins that total N¢"
                if (Math.random() < 0.25) {
                    // Each option is a small coin combination labeled with its total cents.
                    // Options whose total equals the target are correct.
                    const targets = [25, 50, 75, 100];
                    const target = pick(targets);

                    const matchPool = {
                        25: [
                            { label: '🪙 1 quarter (25¢)', cents: 25 },
                            { label: '🪙 2 dimes + 1 nickel (10+10+5)', cents: 25 },
                            { label: '🪙 5 nickels (5×5)', cents: 25 },
                            { label: '🪙 1 dime + 3 nickels (10+5+5+5)', cents: 25 }
                        ],
                        50: [
                            { label: '🪙 2 quarters (25+25)', cents: 50 },
                            { label: '🪙 5 dimes (10×5)', cents: 50 },
                            { label: '🪙 1 quarter + 2 dimes + 1 nickel', cents: 50 },
                            { label: '🪙 4 dimes + 2 nickels', cents: 50 }
                        ],
                        75: [
                            { label: '🪙 3 quarters (25+25+25)', cents: 75 },
                            { label: '🪙 2 quarters + 2 dimes + 1 nickel', cents: 75 },
                            { label: '🪙 7 dimes + 1 nickel', cents: 75 },
                            { label: '🪙 1 quarter + 5 dimes', cents: 75 }
                        ],
                        100: [
                            { label: '🪙 4 quarters (25×4)', cents: 100 },
                            { label: '🪙 10 dimes (10×10)', cents: 100 },
                            { label: '🪙 3 quarters + 2 dimes + 1 nickel', cents: 100 },
                            { label: '🪙 2 quarters + 5 dimes', cents: 100 }
                        ]
                    };
                    const distractorPool = {
                        25: [
                            { label: '🪙 2 dimes (10+10)', cents: 20 },
                            { label: '🪙 4 nickels (5×4)', cents: 20 },
                            { label: '🪙 1 quarter + 1 nickel (25+5)', cents: 30 },
                            { label: '🪙 3 dimes (10+10+10)', cents: 30 }
                        ],
                        50: [
                            { label: '🪙 4 dimes (10×4)', cents: 40 },
                            { label: '🪙 1 quarter + 1 dime (25+10)', cents: 35 },
                            { label: '🪙 2 quarters + 1 dime', cents: 60 },
                            { label: '🪙 6 nickels (5×6)', cents: 30 }
                        ],
                        75: [
                            { label: '🪙 2 quarters + 1 dime', cents: 60 },
                            { label: '🪙 6 dimes (10×6)', cents: 60 },
                            { label: '🪙 3 quarters + 1 nickel', cents: 80 },
                            { label: '🪙 1 quarter + 4 dimes', cents: 65 }
                        ],
                        100: [
                            { label: '🪙 3 quarters (25×3)', cents: 75 },
                            { label: '🪙 9 dimes (10×9)', cents: 90 },
                            { label: '🪙 4 quarters + 1 nickel', cents: 105 },
                            { label: '🪙 2 quarters + 4 dimes', cents: 90 }
                        ]
                    };

                    const goodPool = shuffle([...matchPool[target]]);
                    const badPool = shuffle([...distractorPool[target]]);
                    const goodCount = Math.min(2, goodPool.length); // 2 correct out of 6
                    const badCount = 6 - goodCount;
                    const chosen = [
                        ...goodPool.slice(0, goodCount).map(o => ({ ...o, ok: true })),
                        ...badPool.slice(0, badCount).map(o => ({ ...o, ok: false }))
                    ];
                    shuffle(chosen);
                    const opts = chosen.map((it, i) => ({
                        id: 'opt' + i,
                        label: it.label,
                        correct: it.ok
                    }));
                    if (!opts.some(o => o.correct)) opts[0].correct = true;
                    if (!opts.some(o => !o.correct)) opts[opts.length - 1].correct = false;
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL coin combinations that total ${target}¢.`;
                    q.answerType = 'multi-select-check';
                    q.options = opts;
                    q.ans = ans;
                    q.hint = `Add each combination and pick every one that equals ${target}¢.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Money Count';
                    return;
                }

                const roll = Math.random();

                if (roll < 0.35) {
                    // ---- Coins only (35%) — count the coins ----
                    const numCoins = rng(3, 7);
                    let totalCents = 0;
                    const chosenCoins = [];
                    for (let ci = 0; ci < numCoins; ci++) {
                        const coin = pick(coinDefs);
                        chosenCoins.push(coin);
                        totalCents += coin.valueCents;
                    }
                    // Cap at reasonable total
                    if (totalCents > 300) {
                        totalCents = 0; chosenCoins.length = 0;
                        for (let ci = 0; ci < numCoins; ci++) {
                            const coin = pick(coinDefs.slice(0, 4));
                            chosenCoins.push(coin); totalCents += coin.valueCents;
                        }
                    }

                    q.text = `Count the coins. How many cents in total?`;
                    q.ans = totalCents;
                    q.answerType = "number";
                    q.hint = `Add up each coin: ${chosenCoins.map(c => c.valueCents + ' cents').join(' + ')}`;
                    q.options = buildNumericOptions(totalCents);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Count the Coins</div>
                        <div style="display:inline-flex;flex-wrap:wrap;justify-content:center;align-items:end;gap:4px;padding:15px 20px;background:var(--bg-card);border-radius:14px;border:2px solid var(--border-light);max-width:360px;">
                            ${chosenCoins.map(c => renderCoin(c)).join('')}
                        </div>
                        <div style="margin-top:12px;font-size:1.1rem;font-weight:700;">Total = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> cents</div>
                    </div>`;
                    q.measurementData = { coins: chosenCoins.map(c => c.valueCents), totalCents, mode: 'coins' };

                } else if (roll < 0.60) {
                    // ---- Bills only (25%) — count the bills ----
                    const numBills = rng(2, 5);
                    let totalDollars = 0;
                    const chosenBills = [];
                    for (let bi = 0; bi < numBills; bi++) {
                        const bill = pick(usableBills);
                        chosenBills.push(bill);
                        totalDollars += bill.valueDollars;
                    }

                    q.text = `Count the bills. How many dollars in total?`;
                    q.ans = totalDollars;
                    q.answerType = "number";
                    q.hint = `Add up each bill: ${chosenBills.map(b => b.label).join(' + ')}`;
                    q.options = buildNumericOptions(totalDollars);

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Count the Bills</div>
                        <div style="display:inline-flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px;padding:15px 20px;background:var(--bg-card);border-radius:14px;border:2px solid var(--border-light);max-width:400px;">
                            ${chosenBills.map(b => renderBill(b)).join('')}
                        </div>
                        <div style="margin-top:12px;font-size:1.1rem;font-weight:700;">Total = $<span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span></div>
                    </div>`;
                    q.measurementData = { bills: chosenBills.map(b => b.valueDollars), totalDollars, mode: 'bills' };

                } else if (roll < 0.80) {
                    // ---- Mixed coins + bills (20%) — count everything ----
                    const numCoins = rng(2, 5);
                    const numBills = rng(1, 3);
                    let totalCents = 0;
                    const chosenCoins = [];
                    const chosenBills = [];
                    const smallBills = usableBills.filter(b => b.valueDollars <= 50);
                    const pickBills = smallBills.length >= 2 ? smallBills : billDefs.slice(0, 4);

                    for (let ci = 0; ci < numCoins; ci++) {
                        const coin = pick(coinDefs);
                        chosenCoins.push(coin);
                        totalCents += coin.valueCents;
                    }
                    for (let bi = 0; bi < numBills; bi++) {
                        const bill = pick(pickBills);
                        chosenBills.push(bill);
                        totalCents += bill.valueDollars * 100;
                    }

                    const dollars = Math.floor(totalCents / 100);
                    const cents = totalCents % 100;
                    const formatted = dollars + '.' + String(cents).padStart(2, '0');

                    q.text = `Count all the money. Write the total as a number.`;
                    q.ans = formatted;
                    q.answerType = "text";
                    q.hint = `Bills: ${chosenBills.map(b => b.label).join(' + ')}. Coins: ${chosenCoins.map(c => c.valueCents + ' cents').join(' + ')}. Write as dollars.cents`;
                    q.options = [];

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:1.1rem;">Count All the Money</div>
                        <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:15px 20px;background:var(--bg-card);border-radius:14px;border:2px solid var(--border-light);max-width:400px;margin:0 auto;">
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px;">
                                ${chosenBills.map(b => renderBill(b)).join('')}
                            </div>
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:end;gap:4px;">
                                ${chosenCoins.map(c => renderCoin(c)).join('')}
                            </div>
                        </div>
                        <div style="margin-top:12px;font-size:1.1rem;font-weight:700;">Total = $<span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span></div>
                    </div>`;
                    q.measurementData = { coins: chosenCoins.map(c => c.valueCents), bills: chosenBills.map(b => b.valueDollars), totalCents, formatted, mode: 'mixed' };

                } else {
                    // ---- Make the Amount (20%) — given a target, pick bills/coins ----
                    // Generate a target amount and show available money to choose from
                    const useCoinsOnly = Math.random() < 0.4;
                    let targetCents, chosenCoins, chosenBills, allItems;

                    if (useCoinsOnly) {
                        // Coins only: target 10-199 cents
                        targetCents = rng(10, 199);
                        // Build a set of coins that sum to the target
                        const coinValues = [25, 10, 5, 1];
                        chosenCoins = [];
                        let remaining = targetCents;
                        for (const cv of coinValues) {
                            while (remaining >= cv && chosenCoins.length < 10) {
                                chosenCoins.push(coinDefs.find(c => c.valueCents === cv));
                                remaining -= cv;
                            }
                        }
                        shuffle(chosenCoins);

                        q.text = `How many cents do these coins make?`;
                        q.ans = targetCents;
                        q.answerType = "number";
                        q.hint = `Add each coin value: ${chosenCoins.map(c => c.valueCents).join(' + ')} = ${targetCents} cents.`;
                        q.options = buildNumericOptions(targetCents);

                        q.visual = `<div style="text-align:center;">
                            <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">Count the Coins</div>
                            <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Add up the value of every coin shown</div>
                            <div style="display:inline-flex;flex-wrap:wrap;justify-content:center;align-items:end;gap:4px;padding:15px 20px;background:var(--bg-card);border-radius:14px;border:2px solid var(--accent-orange);max-width:360px;">
                                ${chosenCoins.map(c => renderCoin(c)).join('')}
                            </div>
                            <div style="margin-top:12px;font-size:1.1rem;font-weight:700;">Total = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> cents</div>
                        </div>`;
                        q.measurementData = { coins: chosenCoins.map(c => c.valueCents), totalCents: targetCents, mode: 'coins' };
                    } else {
                        // Bills + coins: target $1 to range-based cap
                        const maxDollars = Math.min(range, 200);
                        const targetDollars = rng(1, maxDollars);
                        const targetCentsPart = pick([0, 0, 0, 10, 20, 25, 50, 75]); // often whole dollars
                        targetCents = targetDollars * 100 + targetCentsPart;

                        // Build bills
                        const billValues = [100, 50, 20, 10, 5, 1];
                        chosenBills = [];
                        let remainD = targetDollars;
                        for (const bv of billValues) {
                            if (bv > Math.max(range, 20)) continue;
                            while (remainD >= bv && chosenBills.length < 8) {
                                chosenBills.push(billDefs.find(b => b.valueDollars === bv));
                                remainD -= bv;
                            }
                        }
                        // Build coins for cent part
                        chosenCoins = [];
                        const coinValues = [25, 10, 5, 1];
                        let remainC = targetCentsPart;
                        for (const cv of coinValues) {
                            while (remainC >= cv && chosenCoins.length < 8) {
                                chosenCoins.push(coinDefs.find(c => c.valueCents === cv));
                                remainC -= cv;
                            }
                        }
                        shuffle(chosenBills);
                        shuffle(chosenCoins);

                        const dollars = Math.floor(targetCents / 100);
                        const cents = targetCents % 100;
                        const formatted = dollars + '.' + String(cents).padStart(2, '0');
                        const displayTarget = cents > 0 ? '$' + formatted : '$' + dollars;

                        q.text = `Count all the money shown. Total = ?`;
                        if (cents > 0) {
                            q.ans = formatted;
                            q.answerType = "text";
                            q.options = [];
                        } else {
                            q.ans = dollars;
                            q.answerType = "number";
                            q.options = buildNumericOptions(dollars);
                        }
                        q.hint = `Bills: ${chosenBills.map(b => b.label).join(' + ')}${chosenCoins.length ? '. Coins: ' + chosenCoins.map(c => c.valueCents + 'c').join(' + ') : ''}`;

                        q.visual = `<div style="text-align:center;">
                            <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">Count the Money</div>
                            <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Add up all the bills and coins</div>
                            <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:15px 20px;background:var(--bg-card);border-radius:14px;border:2px solid var(--accent-orange);max-width:420px;margin:0 auto;">
                                ${chosenBills.length ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:4px;">${chosenBills.map(b => renderBill(b)).join('')}</div>` : ''}
                                ${chosenCoins.length ? `<div style="display:flex;flex-wrap:wrap;justify-content:center;align-items:end;gap:4px;">${chosenCoins.map(c => renderCoin(c)).join('')}</div>` : ''}
                            </div>
                            <div style="margin-top:12px;font-size:1.1rem;font-weight:700;">Total = ${cents > 0 ? '$' : '$'}<span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span></div>
                        </div>`;
                        q.measurementData = { coins: chosenCoins.map(c => c.valueCents), bills: chosenBills.map(b => b.valueDollars), totalCents: targetCents, formatted, mode: 'mixed' };
                    }
                }

                q.printFormat = "money-count";
                q.skillLabel = "Money Count";
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
