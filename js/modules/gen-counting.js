// gen-counting.js - Counting & Cardinality (Grade K) question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createBase10Blocks } from './svg-base10.js';
import { COLORS, STROKE, FONTS, softFill } from './design-tokens.js';

export function generateCountingQuestion(q, mappedSkill, helpers) {
    const { rng, range } = helpers;

    // ========================================
    // COUNT OBJECTS (Grade K) - Count objects 1-20
    // ========================================
    if (mappedSkill === "count_objects" && Math.random() < 0.25) {
        // Phase 4.5 batch 10: multi-select-check variant — "Click ALL groups that show N"
        const targetN = rng(2, 8);
        const emojiPool = ["🍎", "⭐", "🐢", "🚗", "🌸", "🍄", "🐝", "🍇", "🐱", "🐶"];
        const optionCount = rng(4, 6);
        const correctCount = rng(1, Math.min(3, optionCount - 1));
        const counts = [];
        // Add correct copies
        for (let i = 0; i < correctCount; i++) counts.push(targetN);
        // Add distractors (not equal to targetN, between 1-9)
        while (counts.length < optionCount) {
            const c = rng(1, 9);
            if (c !== targetN) counts.push(c);
        }
        const shuffledCounts = shuffle(counts);
        const options = shuffledCounts.map((n, i) => {
            const e = emojiPool[i % emojiPool.length];
            const svg = `<span style="font-size:1.6rem;letter-spacing:3px;">${e.repeat(n)}</span>`;
            return { id: 'opt' + i, label: '', svg, correct: n === targetN };
        });
        const ans = options.filter(o => o.correct).map(o => o.id);
        q.text = `Click ALL groups that show ${targetN}.`;
        q.ans = ans;
        q.options = options;
        q.answerType = 'multi-select-check';
        q.hint = `Count the items in each group. Pick every group that has exactly ${targetN}.`;
        q.printFormat = 'multi-select';
        q.skillLabel = 'Count Objects';
        return;
    }
    if (mappedSkill === "count_objects") {
        const count = rng(1, 20);
        const shapes = [
            { name: "star", color: COLORS.fill[2], draw: (cx, cy, s) => {
                const pts = [];
                for (let i = 0; i < 5; i++) {
                    const outerAngle = (i * 72 - 90) * Math.PI / 180;
                    const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
                    pts.push(`${cx + s * Math.cos(outerAngle)},${cy + s * Math.sin(outerAngle)}`);
                    pts.push(`${cx + s * 0.4 * Math.cos(innerAngle)},${cy + s * 0.4 * Math.sin(innerAngle)}`);
                }
                return `<polygon points="${pts.join(' ')}" fill="currentColor" stroke="none"/>`;
            }},
            { name: "circle", color: COLORS.fill[0], draw: (cx, cy, s) => {
                return `<circle cx="${cx}" cy="${cy}" r="${s * 0.8}" fill="currentColor" stroke="none"/>`;
            }},
            { name: "heart", color: COLORS.fill[4], draw: (cx, cy, s) => {
                const hs = s * 0.9;
                return `<path d="M${cx},${cy + hs * 0.3} C${cx},${cy - hs * 0.5} ${cx - hs},${cy - hs * 0.5} ${cx - hs},${cy} C${cx - hs},${cy + hs * 0.4} ${cx},${cy + hs} ${cx},${cy + hs} C${cx},${cy + hs} ${cx + hs},${cy + hs * 0.4} ${cx + hs},${cy} C${cx + hs},${cy - hs * 0.5} ${cx},${cy - hs * 0.5} ${cx},${cy + hs * 0.3} Z" fill="currentColor" stroke="none"/>`;
            }},
            { name: "apple", color: COLORS.fill[1], draw: (cx, cy, s) => {
                return `<circle cx="${cx}" cy="${cy + s * 0.1}" r="${s * 0.7}" fill="currentColor" stroke="none"/>
                    <rect x="${cx - s * 0.06}" y="${cy - s * 0.7}" width="${s * 0.12}" height="${s * 0.4}" rx="1" fill="#8B4513"/>
                    <ellipse cx="${cx + s * 0.2}" cy="${cy - s * 0.45}" rx="${s * 0.2}" ry="${s * 0.12}" fill="${COLORS.fill[1]}" transform="rotate(30,${cx + s * 0.2},${cy - s * 0.45})"/>`;
            }}
        ];
        const shape = pick(shapes);

        // Grid layout: determine cols/rows
        const cols = count <= 5 ? count : count <= 10 ? 5 : count <= 15 ? 5 : count <= 20 ? 5 : 7;
        const rows = Math.ceil(count / cols);
        const cellSize = 42;
        const padding = 10;
        const svgW = cols * cellSize + padding * 2;
        const svgH = rows * cellSize + padding * 2;

        let shapeSvgs = '';
        for (let i = 0; i < count; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cx = padding + col * cellSize + cellSize / 2;
            const cy = padding + row * cellSize + cellSize / 2;
            shapeSvgs += shape.draw(cx, cy, cellSize * 0.35);
        }

        q.text = `How many ${shape.name}s are there? Count them!`;
        q.ans = count;
        q.answerType = "number";
        q.hint = "Count each object one by one. Point to each one as you count!";
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Count the ${shape.name}s</div>
            <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 320)}" style="color:${shape.color};background:var(--bg-card);border-radius:12px;padding:8px;">
                ${shapeSvgs}
            </svg>
        </div>`;
        return;
    }

    // ========================================
    // COUNT SEQUENCE (Grade K) - Next/before/after number
    // ========================================
    else if (mappedSkill === "count_sequence") {
        const num = rng(1, 19);
        const questionTypes = ["after", "before"];
        const type = pick(questionTypes);
        let answer, questionText, blankPos;

        if (type === "after") {
            answer = num + 1;
            questionText = `What number comes AFTER ${num}?`;
            blankPos = "after";
        } else {
            answer = num - 1;
            if (answer < 0) {
                // Ensure no negatives for kindergarten
                answer = num + 1;
                questionText = `What number comes AFTER ${num}?`;
                blankPos = "after";
            } else {
                questionText = `What number comes BEFORE ${num}?`;
                blankPos = "before";
            }
        }

        // Number path visual: show 5 consecutive boxes with one blank
        const startNum = blankPos === "before" ? Math.max(0, num - 3) : Math.max(0, num - 2);
        const pathNums = [];
        for (let i = 0; i < 5; i++) {
            pathNums.push(startNum + i);
        }

        const boxW = 52;
        const boxH = 44;
        const gap = 8;
        const totalW = pathNums.length * (boxW + gap) - gap + 20;
        const totalH = boxH + 30;

        let boxesSvg = '';
        pathNums.forEach((n, i) => {
            const x = 10 + i * (boxW + gap);
            const y = 15;
            const isBlank = n === answer;
            const isCurrent = n === num;
            // B&W: blank=light grey, current=slightly darker grey, others=white
            const fillColor = isBlank ? '#e0e0e0' : isCurrent ? '#ccc' : '#fff';
            const textColor = '#000';
            const strokeColor = '#000';
            boxesSvg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${STROKE.normal}"/>`;
            if (isBlank) {
                boxesSvg += `<text x="${x + boxW / 2}" y="${y + boxH / 2 + 6}" text-anchor="middle" font-family='${FONTS.sans}' font-size="20" font-weight="700" fill="${textColor}">?</text>`;
            } else {
                boxesSvg += `<text x="${x + boxW / 2}" y="${y + boxH / 2 + 6}" text-anchor="middle" font-family='${FONTS.sans}' font-size="18" font-weight="600" fill="${textColor}">${n}</text>`;
            }
        });

        q.text = questionText;
        q.ans = answer;
        q.answerType = "number";
        q.hint = blankPos === "after" ? `Count forward from ${num}. What is the next number?` : `Count backward to ${num}. What number is just before it?`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;font-size:1.1rem;">Number Path</div>
            <svg viewBox="0 0 ${totalW} ${totalH}" width="${Math.min(totalW, 340)}" style="border-radius:12px;padding:6px;">
                ${boxesSvg}
            </svg>
        </div>`;
        return;
    }

    // ========================================
    // COMPARE GROUPS (Grade K) - More/fewer/same
    // ========================================
    else if (mappedSkill === "compare_groups") {
        const countA = rng(1, 10);
        const variation = rng(0, 2); // 0=more, 1=fewer, 2=same
        let countB;
        if (variation === 2) {
            countB = countA; // same
        } else {
            countB = countA + rng(1, 4) * (variation === 0 ? 1 : -1);
            if (countB < 1) countB = countA + rng(1, 3);
        }

        const colorsA = COLORS.fill[0];
        const colorsB = COLORS.fill[2];
        const circR = 12;
        const circGap = 30;
        const maxPerRow = 5;

        // Build SVG for group A
        const rowsA = Math.ceil(countA / maxPerRow);
        const colsA = Math.min(countA, maxPerRow);
        const grpAW = colsA * circGap + 10;
        const grpAH = rowsA * circGap + 10;
        let circlesA = '';
        for (let i = 0; i < countA; i++) {
            const col = i % maxPerRow;
            const row = Math.floor(i / maxPerRow);
            circlesA += `<circle cx="${10 + col * circGap + circR}" cy="${10 + row * circGap + circR}" r="${circR}" fill="${colorsA}" stroke="none" opacity="0.9"/>`;
        }

        // Build SVG for group B
        const rowsB = Math.ceil(countB / maxPerRow);
        const colsB = Math.min(countB, maxPerRow);
        const grpBW = colsB * circGap + 10;
        const grpBH = rowsB * circGap + 10;
        let circlesB = '';
        for (let i = 0; i < countB; i++) {
            const col = i % maxPerRow;
            const row = Math.floor(i / maxPerRow);
            circlesB += `<circle cx="${10 + col * circGap + circR}" cy="${10 + row * circGap + circR}" r="${circR}" fill="${colorsB}" stroke="none" opacity="0.9"/>`;
        }

        const questionTypes = [];
        if (countA !== countB) {
            questionTypes.push("more", "fewer");
        }
        questionTypes.push("same_check");
        // LRU rotation across the available question types so students see all forms.
        const qType = (typeof window !== 'undefined' && window.pickVariant)
            ? window.pickVariant('compare_groups', questionTypes)
            : pick(questionTypes);
        q._variant = qType;

        let questionText, answer, options;
        if (qType === "more") {
            questionText = "Which group has MORE?";
            answer = countA > countB ? "Group A" : "Group B";
            options = ["Group A", "Group B"];
        } else if (qType === "fewer") {
            questionText = "Which group has FEWER?";
            answer = countA < countB ? "Group A" : "Group B";
            options = ["Group A", "Group B"];
        } else {
            questionText = "Do both groups have the SAME number?";
            answer = countA === countB ? "Same" : (countA > countB ? "Group A has more" : "Group B has more");
            options = countA === countB ? ["Same", "Group A has more", "Group B has more"] : ["Same", "Group A has more", "Group B has more"];
        }

        const maxGrpW = Math.max(grpAW, grpBW);
        const svgW = maxGrpW * 2 + 60;
        const svgH = Math.max(grpAH, grpBH) + 40;

        q.text = questionText;
        q.ans = answer;
        q.answerType = "multiple-choice";
        q.options = options;
        q.hint = `Count the objects in each group carefully. Group A has ${countA}, Group B has ${countB}.`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Compare the Groups</div>
            <div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;align-items:flex-start;">
                <div style="text-align:center;">
                    <div style="font-weight:700;color:${colorsA};margin-bottom:6px;font-size:1rem;">Group A</div>
                    <svg viewBox="0 0 ${grpAW + 10} ${grpAH + 10}" width="${Math.min(grpAW + 10, 170)}" style="background:var(--bg-card);border-radius:10px;border:2px solid ${colorsA};">
                        ${circlesA}
                    </svg>
                </div>
                <div style="text-align:center;">
                    <div style="font-weight:700;color:${colorsB};margin-bottom:6px;font-size:1rem;">Group B</div>
                    <svg viewBox="0 0 ${grpBW + 10} ${grpBH + 10}" width="${Math.min(grpBW + 10, 170)}" style="background:var(--bg-card);border-radius:10px;border:2px solid ${colorsB};">
                        ${circlesB}
                    </svg>
                </div>
            </div>
        </div>`;
        return;
    }

    // ========================================
    // COMPARE OBJECTS (Grade K) - Compare attributes (longer/shorter/taller)
    // ========================================
    else if (mappedSkill === "compare_objects" && Math.random() < 0.25) {
        // Phase 4.5 batch 10: multi-select-check variant — "Click ALL X taller/longer than Y"
        const attrs = [
            { word: 'TALLER', dim: 'height', baseLabel: 'apple' },
            { word: 'SHORTER', dim: 'height', baseLabel: 'apple' },
            { word: 'LONGER', dim: 'width', baseLabel: 'pencil' },
            { word: 'SHORTER', dim: 'width', baseLabel: 'pencil' }
        ];
        const a = pick(attrs);
        const baseSize = rng(40, 65);
        const optionCount = rng(4, 6);
        const sizes = [];
        // Generate distinct sizes including some bigger and some smaller than baseSize
        while (sizes.length < optionCount) {
            const delta = rng(-30, 30);
            const s = baseSize + delta;
            if (s >= 15 && s <= 110 && Math.abs(delta) >= 8 && !sizes.includes(s)) sizes.push(s);
        }
        const isBigger = a.word === 'TALLER' || a.word === 'LONGER';
        const correctSet = isBigger ? sizes.filter(s => s > baseSize) : sizes.filter(s => s < baseSize);
        // Ensure at least 1 correct and at least 1 incorrect
        if (correctSet.length === 0) sizes[0] = isBigger ? baseSize + 20 : Math.max(15, baseSize - 20);
        if (correctSet.length === sizes.length) sizes[0] = isBigger ? Math.max(15, baseSize - 20) : baseSize + 20;
        const optionColor = COLORS.primary;
        const options = sizes.map((s, i) => {
            let svg;
            if (a.dim === 'height') {
                svg = `<svg width="40" height="80" viewBox="0 0 40 80" style="vertical-align:bottom;"><rect x="8" y="${80 - s}" width="24" height="${s}" rx="3" fill="${optionColor}"/></svg>`;
            } else {
                svg = `<svg width="120" height="22" viewBox="0 0 120 22"><rect x="0" y="6" width="${s}" height="10" rx="3" fill="${optionColor}"/></svg>`;
            }
            const correct = isBigger ? s > baseSize : s < baseSize;
            return { id: 'opt' + i, label: '', svg, correct };
        });
        // Reference object
        let refSvg;
        if (a.dim === 'height') {
            refSvg = `<svg width="40" height="80" viewBox="0 0 40 80"><rect x="8" y="${80 - baseSize}" width="24" height="${baseSize}" rx="3" fill="${COLORS.neutral}"/></svg>`;
        } else {
            refSvg = `<svg width="120" height="22" viewBox="0 0 120 22"><rect x="0" y="6" width="${baseSize}" height="10" rx="3" fill="${COLORS.neutral}"/></svg>`;
        }
        const ans = options.filter(o => o.correct).map(o => o.id);
        // Put the reference SVG in q.visual (NOT q.text) so the question
        // text formatter doesn't HTML-escape it. q.text stays as plain text.
        q.text = `Click ALL objects ${a.word.toLowerCase()} than the reference.`;
        q.visual = `<div style="text-align:center;margin-bottom:8px;">
            <div style="font-weight:700;color:var(--text-dim);margin-bottom:6px;">Reference:</div>
            ${refSvg}
        </div>`;
        q.ans = ans;
        q.options = options;
        q.answerType = 'multi-select-check';
        q.hint = `Compare each object to the grey reference. Pick every one that is ${a.word.toLowerCase()}.`;
        q.printFormat = 'multi-select';
        q.skillLabel = 'Compare Objects';
        return;
    }
    else if (mappedSkill === "compare_objects") {
        const attributes = [
            { word: "LONGER", opposite: "SHORTER", dimension: "width" },
            { word: "SHORTER", opposite: "LONGER", dimension: "width" },
            { word: "TALLER", opposite: "SHORTER", dimension: "height" },
            { word: "SHORTER", opposite: "TALLER", dimension: "height" }
        ];
        const attr = pick(attributes);
        const isWidth = attr.dimension === "width";

        // Generate two distinct sizes
        const sizeA = rng(40, 80);
        let sizeB = sizeA + rng(25, 50) * (Math.random() < 0.5 ? 1 : -1);
        if (sizeB < 20) sizeB = sizeA + rng(25, 50);
        if (sizeB === sizeA) sizeB = sizeA + 30;

        const colorA = COLORS.fill[0];
        const colorB = COLORS.fill[2];

        let rectA, rectB;
        if (isWidth) {
            rectA = { w: sizeA * 2, h: 30 };
            rectB = { w: sizeB * 2, h: 30 };
        } else {
            rectA = { w: 35, h: sizeA };
            rectB = { w: 35, h: sizeB };
        }

        // Determine correct answer
        let answer;
        if (attr.word === "LONGER" || attr.word === "TALLER") {
            // Which is bigger
            answer = (isWidth ? rectA.w > rectB.w : rectA.h > rectB.h) ? "Object A" : "Object B";
        } else {
            // Which is smaller
            answer = (isWidth ? rectA.w < rectB.w : rectA.h < rectB.h) ? "Object A" : "Object B";
        }

        const svgW = isWidth ? Math.max(rectA.w, rectB.w) + 40 : rectA.w + rectB.w + 80;
        const svgH = isWidth ? rectA.h + rectB.h + 60 : Math.max(rectA.h, rectB.h) + 40;

        let objectsSvg = '';
        if (isWidth) {
            // Show side by side vertically for length comparison
            objectsSvg += `<rect x="15" y="10" width="${rectA.w}" height="${rectA.h}" rx="6" fill="${colorA}" opacity="0.85"/>`;
            objectsSvg += `<text x="${15 + rectA.w / 2}" y="${10 + rectA.h / 2 + 5}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="#fff">A</text>`;
            objectsSvg += `<rect x="15" y="${10 + rectA.h + 20}" width="${rectB.w}" height="${rectB.h}" rx="6" fill="${colorB}" opacity="0.85"/>`;
            objectsSvg += `<text x="${15 + rectB.w / 2}" y="${10 + rectA.h + 20 + rectB.h / 2 + 5}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="#fff">B</text>`;
        } else {
            // Show side by side horizontally for height comparison, aligned at bottom
            const maxH = Math.max(rectA.h, rectB.h);
            const yA = 10 + maxH - rectA.h;
            const yB = 10 + maxH - rectB.h;
            objectsSvg += `<rect x="15" y="${yA}" width="${rectA.w}" height="${rectA.h}" rx="6" fill="${colorA}" opacity="0.85"/>`;
            objectsSvg += `<text x="${15 + rectA.w / 2}" y="${yA + rectA.h / 2 + 5}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="#fff">A</text>`;
            objectsSvg += `<rect x="${15 + rectA.w + 30}" y="${yB}" width="${rectB.w}" height="${rectB.h}" rx="6" fill="${colorB}" opacity="0.85"/>`;
            objectsSvg += `<text x="${15 + rectA.w + 30 + rectB.w / 2}" y="${yB + rectB.h / 2 + 5}" text-anchor="middle" font-family='${FONTS.sans}' font-size="13" font-weight="700" fill="#fff">B</text>`;
        }

        q.text = `Which object is ${attr.word}?`;
        q.ans = answer;
        q.answerType = "multiple-choice";
        q.options = ["Object A", "Object B"];
        q.hint = `Look carefully at the ${attr.dimension} of each object. Which one is ${attr.word.toLowerCase()}?`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Which is ${attr.word}?</div>
            <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 320)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                ${objectsSvg}
            </svg>
            <div style="margin-top:6px;display:flex;justify-content:center;gap:20px;font-size:0.9rem;">
                <span style="color:${colorA};font-weight:700;">A</span>
                <span style="color:${colorB};font-weight:700;">B</span>
            </div>
        </div>`;
        return;
    }

    // ========================================
    // CLASSIFY & COUNT (Grade K) - Sort objects by category and count
    // ========================================
    else if (mappedSkill === "classify_count" && Math.random() < 0.25) {
        // Phase 4.5 batch 10: multi-select-check variant — "Click ALL the X" with mixed emoji
        const groups = [
            { word: 'round things', items: ['🍎', '🍊', '⚽', '🍇', '🌕'], distractors: ['🍌', '🌟', '🚗', '🌸', '🐝', '⭐', '🍄'] },
            { word: 'animals', items: ['🐱', '🐶', '🐢', '🐝', '🐟'], distractors: ['🍎', '🚗', '⭐', '🌸', '🍇', '🍄'] },
            { word: 'fruits', items: ['🍎', '🍌', '🍇', '🍊', '🍓'], distractors: ['🚗', '⭐', '🐢', '🌸', '🌟', '🐝'] },
            { word: 'vehicles', items: ['🚗', '🚕', '🚌', '🚓', '🚒'], distractors: ['🍎', '🐢', '⭐', '🌸', '🍄', '🐝'] },
            { word: 'yellow things', items: ['🌟', '🍌', '🌻', '🐤', '⭐'], distractors: ['🍎', '🐢', '🚗', '🌸', '🍇', '🐝'] }
        ];
        const g = pick(groups);
        const optionCount = rng(4, 6);
        const correctCount = rng(1, Math.min(3, optionCount - 1));
        const correctItems = shuffle([...g.items]).slice(0, correctCount);
        const wrongItems = shuffle([...g.distractors]).slice(0, optionCount - correctCount);
        const all = shuffle([
            ...correctItems.map(e => ({ emoji: e, correct: true })),
            ...wrongItems.map(e => ({ emoji: e, correct: false }))
        ]);
        const options = all.map((it, i) => ({
            id: 'opt' + i,
            label: '',
            svg: `<span style="font-size:2rem;">${it.emoji}</span>`,
            correct: it.correct
        }));
        const ans = options.filter(o => o.correct).map(o => o.id);
        q.text = `Click ALL the ${g.word}.`;
        q.ans = ans;
        q.options = options;
        q.answerType = 'multi-select-check';
        q.hint = `Look at each picture. Pick every one that is a kind of ${g.word}.`;
        q.printFormat = 'multi-select';
        q.skillLabel = 'Sort & Count';
        return;
    }
    else if (mappedSkill === "classify_count") {
        // Categories of objects to sort.
        // Colors carry semantic meaning (Apple = red, Banana = yellow) so we
        // keep distinct hues but pull them from the categorical token palette.
        const categories = [
            {
                name: "Fruit",
                items: [
                    { label: "Apple", color: COLORS.fill[4], shape: "circle" },
                    { label: "Banana", color: COLORS.fill[2], shape: "crescent" },
                    { label: "Orange", color: COLORS.fill[2], shape: "circle" },
                    { label: "Grape", color: COLORS.fill[3], shape: "circle" },
                ]
            },
            {
                name: "Animal",
                items: [
                    { label: "Cat", color: COLORS.fill[2], shape: "triangle" },
                    { label: "Dog", color: "#8B4513", shape: "triangle" },
                    { label: "Bird", color: COLORS.fill[0], shape: "diamond" },
                    { label: "Fish", color: COLORS.fill[5], shape: "diamond" },
                ]
            },
            {
                name: "Shape",
                items: [
                    { label: "Circle", color: COLORS.fill[4], shape: "circle" },
                    { label: "Square", color: COLORS.fill[0], shape: "square" },
                    { label: "Triangle", color: COLORS.fill[1], shape: "triangle" },
                    { label: "Star", color: COLORS.fill[2], shape: "star" },
                ]
            },
            {
                name: "Vehicle",
                items: [
                    { label: "Car", color: COLORS.fill[4], shape: "square" },
                    { label: "Bus", color: COLORS.fill[2], shape: "square" },
                    { label: "Bike", color: COLORS.fill[1], shape: "diamond" },
                    { label: "Boat", color: COLORS.fill[0], shape: "diamond" },
                ]
            },
            {
                name: "Color",
                items: [
                    { label: "Red", color: COLORS.fill[4], shape: "circle" },
                    { label: "Blue", color: COLORS.fill[0], shape: "circle" },
                    { label: "Green", color: COLORS.fill[1], shape: "circle" },
                    { label: "Yellow", color: COLORS.fill[2], shape: "circle" },
                ]
            }
        ];

        // Pick 2 different category groups
        const shuffledCats = shuffle([...categories]);
        const catA = shuffledCats[0];
        const catB = shuffledCats[1];

        // Pick 2 items from each category
        const itemsA = shuffle([...catA.items]).slice(0, 2);
        const itemsB = shuffle([...catB.items]).slice(0, 2);

        // Create counts: 1-5 of each item type
        const collection = [];
        const countA = {};
        for (const item of itemsA) {
            const cnt = rng(1, 4);
            countA[item.label] = cnt;
            for (let i = 0; i < cnt; i++) collection.push({ ...item, category: catA.name });
        }
        const countB = {};
        for (const item of itemsB) {
            const cnt = rng(1, 4);
            countB[item.label] = cnt;
            for (let i = 0; i < cnt; i++) collection.push({ ...item, category: catB.name });
        }

        // Total for each category
        const totalA = Object.values(countA).reduce((s, v) => s + v, 0);
        const totalB = Object.values(countB).reduce((s, v) => s + v, 0);

        // Shuffle collection for display
        const displayed = shuffle(collection);

        // Randomly pick which category to ask about
        const askAboutA = Math.random() < 0.5;
        const askedCategory = askAboutA ? catA.name : catB.name;
        const answer = askAboutA ? totalA : totalB;

        // Draw shapes in SVG
        const cols = Math.min(displayed.length, 6);
        const rows = Math.ceil(displayed.length / cols);
        const cellSize = 50;
        const svgW = cols * cellSize + 20;
        const svgH = rows * cellSize + 20;

        let itemsSvg = '';
        displayed.forEach((item, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const cx = 10 + col * cellSize + cellSize / 2;
            const cy = 10 + row * cellSize + cellSize / 2;
            const r = 16;

            if (item.shape === "circle") {
                itemsSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${item.color}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
            } else if (item.shape === "square") {
                itemsSvg += `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="3" fill="${item.color}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
            } else if (item.shape === "triangle") {
                itemsSvg += `<polygon points="${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}" fill="${item.color}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
            } else if (item.shape === "diamond") {
                itemsSvg += `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${item.color}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
            } else if (item.shape === "star") {
                const pts = [];
                for (let i = 0; i < 5; i++) {
                    const oA = (i * 72 - 90) * Math.PI / 180;
                    const iA = ((i * 72) + 36 - 90) * Math.PI / 180;
                    pts.push(`${cx + r * Math.cos(oA)},${cy + r * Math.sin(oA)}`);
                    pts.push(`${cx + r * 0.4 * Math.cos(iA)},${cy + r * 0.4 * Math.sin(iA)}`);
                }
                itemsSvg += `<polygon points="${pts.join(' ')}" fill="${item.color}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
            } else if (item.shape === "crescent") {
                itemsSvg += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.6}" ry="${r}" fill="${item.color}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}"/>`;
            }
            itemsSvg += `<text x="${cx}" y="${cy + r + 12}" text-anchor="middle" font-family='${FONTS.sans}' font-size="9" fill="var(--text-bright, #333)">${item.label}</text>`;
        });

        // Build legend showing categories
        const legendItems = [
            ...itemsA.map(i => `<span style="color:${i.color};font-weight:700;">${i.label}</span>`),
            ...itemsB.map(i => `<span style="color:${i.color};font-weight:700;">${i.label}</span>`)
        ];

        q.text = `How many are ${askedCategory}s?`;
        q.ans = answer;
        q.answerType = "number";
        q.hint = `Count all the ${askedCategory.toLowerCase()} items: ${askAboutA ? itemsA.map(i => i.label).join(' and ') : itemsB.map(i => i.label).join(' and ')}. Add them up!`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">Sort & Count</div>
            <svg viewBox="0 0 ${svgW} ${svgH + 20}" width="${Math.min(svgW, 350)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                ${itemsSvg}
            </svg>
            <div style="margin-top:8px;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;font-size:0.85rem;">
                <span style="font-weight:600;color:var(--accent-cyan);">${catA.name}s:</span> ${itemsA.map(i => `<span style="color:${i.color};">${i.label}</span>`).join(', ')}
                <span style="margin-left:10px;font-weight:600;color:var(--accent-orange);">${catB.name}s:</span> ${itemsB.map(i => `<span style="color:${i.color};">${i.label}</span>`).join(', ')}
            </div>
        </div>`;
        return;
    }

    // ========================================
    // NUMBER BONDS (Grade K) - Decompose within 10
    // ========================================
    else if (mappedSkill === "number_bonds") {
        // Two top-level variants: ten-frame manipulative vs traditional missing-part.
        // LRU rotation keeps either form from clustering.
        const _nbKind = (typeof window !== 'undefined' && window.pickVariant)
            ? window.pickVariant('number_bonds', ['tenframe', 'missing'], [3, 7])
            : (Math.random() < 0.30 ? 'tenframe' : 'missing');
        q._variant = _nbKind;
        if (_nbKind === 'tenframe') {
            const totalTF = rng(3, 9);
            const partATF = rng(1, totalTF - 1);
            const partBTF = totalTF - partATF;
            q.text = `Show the number bond ${partATF} + ${partBTF} = ${totalTF}. Click boxes to fill the ten-frame to ${totalTF}.`;
            q.ans = totalTF;
            q.answerType = "ten-frame";
            q.initialDots = 0;
            q.maxDots = 10;
            q.hint = `${partATF} and ${partBTF} together make ${totalTF}. Fill ${totalTF} cells in all.`;
            q.printFormat = "ten-frame";
            q.skillLabel = "Number Bonds";
            return;
        }
        const total = rng(2, 10);
        const partA = rng(1, total - 1);
        const partB = total - partA;

        // Randomly decide which part is missing
        const missingPart = Math.random() < 0.5 ? "A" : "B";
        const answer = missingPart === "A" ? partA : partB;
        const shownPart = missingPart === "A" ? partB : partA;

        q.text = `${total} = ${missingPart === "A" ? "?" : partA} + ${missingPart === "B" ? "?" : partB}`;
        q.ans = answer;
        q.answerType = "number";
        q.hint = `${total} can be split into two parts. One part is ${shownPart}. What is the other part? Think: ${shownPart} + ? = ${total}`;

        // Number bond diagram: circle at top, two circles below, connected by lines
        const svgW = 200;
        const svgH = 150;
        const topCx = 100, topCy = 35, botLeftCx = 55, botRightCx = 145, botCy = 115;
        const circR = 28;

        const topColor = COLORS.fill[3];
        const highlightColor = COLORS.fill[2];
        const leftColor = missingPart === "A" ? highlightColor : COLORS.fill[0];
        const rightColor = missingPart === "B" ? highlightColor : COLORS.fill[1];

        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Number Bond</div>
            <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 220)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                <!-- Lines connecting circles -->
                <line x1="${topCx}" y1="${topCy + circR}" x2="${botLeftCx}" y2="${botCy - circR}" stroke="var(--text-dim)" stroke-width="${STROKE.bold}" stroke-linecap="round"/>
                <line x1="${topCx}" y1="${topCy + circR}" x2="${botRightCx}" y2="${botCy - circR}" stroke="var(--text-dim)" stroke-width="${STROKE.bold}" stroke-linecap="round"/>
                <!-- Top circle (total) -->
                <circle cx="${topCx}" cy="${topCy}" r="${circR}" fill="${topColor}" stroke="none" opacity="0.9"/>
                <text x="${topCx}" y="${topCy + 7}" text-anchor="middle" font-family='${FONTS.sans}' font-size="20" font-weight="700" fill="#fff">${total}</text>
                <!-- Left circle (part A) -->
                <circle cx="${botLeftCx}" cy="${botCy}" r="${circR}" fill="${leftColor}" stroke="${missingPart === 'A' ? highlightColor : 'none'}" stroke-width="${missingPart === 'A' ? STROKE.bold : 0}" stroke-dasharray="${missingPart === 'A' ? '6,3' : 'none'}" opacity="0.9"/>
                <text x="${botLeftCx}" y="${botCy + 7}" text-anchor="middle" font-family='${FONTS.sans}' font-size="20" font-weight="700" fill="#fff">${missingPart === "A" ? "?" : partA}</text>
                <!-- Right circle (part B) -->
                <circle cx="${botRightCx}" cy="${botCy}" r="${circR}" fill="${rightColor}" stroke="${missingPart === 'B' ? highlightColor : 'none'}" stroke-width="${missingPart === 'B' ? STROKE.bold : 0}" stroke-dasharray="${missingPart === 'B' ? '6,3' : 'none'}" opacity="0.9"/>
                <text x="${botRightCx}" y="${botCy + 7}" text-anchor="middle" font-family='${FONTS.sans}' font-size="20" font-weight="700" fill="#fff">${missingPart === "B" ? "?" : partB}</text>
            </svg>
        </div>`;
        return;
    }

    // ========================================
    // MAKE TEN (Grade K) - Missing to make 10
    // ========================================
    else if (mappedSkill === "make_ten") {
        // Two top-level variants — ten-frame vs missing-addend. LRU rotation
        // keeps the rare ten-frame variant from disappearing or clustering.
        const _mtKind = (typeof window !== 'undefined' && window.pickVariant)
            ? window.pickVariant('make_ten', ['tenframe', 'missing'], [3, 7])
            : (Math.random() < 0.30 ? 'tenframe' : 'missing');
        q._variant = _mtKind;
        if (_mtKind === 'tenframe') {
            const startTF = rng(2, 8);
            const needTF = 10 - startTF;
            q.text = `The ten-frame already shows ${startTF}. Click more boxes to make 10.`;
            q.ans = 10;
            q.answerType = "ten-frame";
            q.initialDots = startTF;
            q.maxDots = 10;
            q.hint = `You need ${needTF} more to reach 10.`;
            q.printFormat = "ten-frame";
            q.skillLabel = "Make 10";
            return;
        }
        const filled = rng(1, 9);
        const answer = 10 - filled;

        q.text = `How many more to make 10? You have ${filled}.`;
        q.ans = answer;
        q.answerType = "number";
        q.hint = `You have ${filled}. Count up from ${filled} to 10. How many more do you need? ${filled} + ? = 10`;

        // Ten frame: 2 rows x 5 columns
        const cellSize = 38;
        const gap = 4;
        const frameW = 5 * (cellSize + gap) - gap + 20;
        const frameH = 2 * (cellSize + gap) - gap + 20;
        const filledColor = COLORS.primary;
        const emptyColor = "transparent";
        const borderColor = "var(--text-dim)";

        let cells = '';
        for (let i = 0; i < 10; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 10 + col * (cellSize + gap);
            const y = 10 + row * (cellSize + gap);
            const isFilled = i < filled;
            cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="6" fill="${isFilled ? filledColor : emptyColor}" stroke="${borderColor}" stroke-width="${STROKE.normal}" opacity="${isFilled ? 0.85 : 0.4}"/>`;
            if (isFilled) {
                cells += `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize * 0.3}" fill="#fff" opacity="0.9"/>`;
            }
        }

        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Ten Frame</div>
            <svg viewBox="0 0 ${frameW} ${frameH}" width="${Math.min(frameW, 280)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                ${cells}
            </svg>
            <div style="margin-top:8px;font-size:0.9rem;color:var(--text-dim);">
                <span style="color:${filledColor};font-weight:700;">${filled}</span> filled. How many empty?
            </div>
        </div>`;
        return;
    }

    // ========================================
    // TEEN COMPOSE (Grade K) - 10 + ones = teen numbers
    // ========================================
    else if (mappedSkill === "teen_compose") {
        // Top-level variants: ten-frame manipulative vs traditional fill. LRU rotation.
        const _tcKind = (typeof window !== 'undefined' && window.pickVariant)
            ? window.pickVariant('teen_compose', ['tenframe', 'traditional'], [3, 7])
            : (Math.random() < 0.30 ? 'tenframe' : 'traditional');
        q._variant = _tcKind;
        if (_tcKind === 'tenframe') {
            const teenTF = rng(11, 19);
            q.text = `Click boxes to show the number ${teenTF} on the ten-frames.`;
            q.ans = teenTF;
            q.answerType = "ten-frame";
            q.initialDots = 0;
            q.maxDots = 20;
            q.hint = `${teenTF} is 1 ten and ${teenTF - 10} ones. Fill the first frame, then ${teenTF - 10} more.`;
            q.printFormat = "ten-frame";
            q.skillLabel = "Teen Numbers";
            return;
        }
        const ones = rng(1, 9);
        const teen = 10 + ones;

        // Randomly choose format
        const format = rng(0, 1);
        let questionText, answer;
        if (format === 0) {
            questionText = `10 + ___ = ${teen}`;
            answer = ones;
        } else {
            questionText = `What is 10 + ${ones}?`;
            answer = teen;
        }

        q.text = questionText;
        q.ans = answer;
        q.answerType = "number";
        q.hint = format === 0
            ? `${teen} is made of 10 and some more. How many more than 10 is ${teen}?`
            : `Start at 10 and count ${ones} more. 10 + ${ones} = ?`;

        // Visual: filled ten frame + extra circles below
        const cellSize = 32;
        const gap = 3;
        const frameW = 5 * (cellSize + gap) - gap + 20;
        const tenFrameH = 2 * (cellSize + gap) - gap + 20;
        const extrasRowH = cellSize + 20;
        const svgH = tenFrameH + extrasRowH + 10;

        const tenColor = COLORS.fill[0];
        const onesColor = COLORS.fill[2];
        const borderColor = "var(--text-dim)";

        // Ten frame (all 10 filled)
        let cells = '';
        for (let i = 0; i < 10; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 10 + col * (cellSize + gap);
            const y = 10 + row * (cellSize + gap);
            cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="5" fill="${tenColor}" stroke="${borderColor}" stroke-width="${STROKE.normal}" opacity="0.85"/>`;
            cells += `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize * 0.28}" fill="#fff" opacity="0.9"/>`;
        }

        // Extra ones below the ten frame
        const extrasY = tenFrameH + 5;
        const extrasStartX = 10;
        for (let i = 0; i < ones; i++) {
            const x = extrasStartX + i * (cellSize + gap);
            cells += `<rect x="${x}" y="${extrasY}" width="${cellSize}" height="${cellSize}" rx="5" fill="${onesColor}" stroke="${borderColor}" stroke-width="${STROKE.normal}" opacity="0.85"/>`;
            cells += `<circle cx="${x + cellSize / 2}" cy="${extrasY + cellSize / 2}" r="${cellSize * 0.28}" fill="#fff" opacity="0.9"/>`;
        }

        // Labels
        cells += `<text x="${frameW / 2}" y="${tenFrameH - 2}" text-anchor="middle" font-family='${FONTS.sans}' font-size="11" font-weight="600" fill="var(--text-dim)">10</text>`;
        if (ones > 0) {
            const extrasW = ones * (cellSize + gap) - gap;
            cells += `<text x="${extrasStartX + extrasW / 2}" y="${extrasY + cellSize + 14}" text-anchor="middle" font-family='${FONTS.sans}' font-size="11" font-weight="600" fill="var(--text-dim)">+ ${ones}</text>`;
        }

        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">10 + Ones = Teen Number</div>
            <svg viewBox="0 0 ${frameW} ${svgH}" width="${Math.min(frameW, 260)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                ${cells}
            </svg>
            <div style="margin-top:8px;font-size:0.95rem;color:var(--text-dim);">
                <span style="color:${tenColor};font-weight:700;">10</span> + <span style="color:${onesColor};font-weight:700;">${ones}</span> = <span style="font-weight:700;">${teen}</span>
            </div>
        </div>`;
        return;
    }

    // ========================================
    // ADD 5 PICTURES (Grade K) — sums to 5 with emoji counters
    // ========================================
    else if (mappedSkill === "add_5_pictures") {
        const emojiSet = ["🍎", "⭐", "🐢", "🚗", "🌸", "🍄", "🐝", "🍇"];
        const emoji = pick(emojiSet);
        let n, m;
        do { n = randInt(1, 3); m = randInt(1, 3); } while (n + m > 5);
        const total = n + m;

        const groupA = `<span style="font-size:2rem;letter-spacing:4px;">${emoji.repeat(n)}</span>`;
        const groupB = `<span style="font-size:2rem;letter-spacing:4px;">${emoji.repeat(m)}</span>`;

        // 3 distinct numeric options including the correct answer
        const optsSet = new Set([total]);
        while (optsSet.size < 3) {
            const cand = total + (Math.random() < 0.5 ? -1 : 1) * randInt(1, 2);
            if (cand >= 0 && cand <= 5) optsSet.add(cand);
        }
        if (optsSet.size < 3) {
            for (let v = 0; v <= 5 && optsSet.size < 3; v++) optsSet.add(v);
        }

        const mcOptions = shuffle([...optsSet]);
        q.text = `How many in all? ${n} + ${m} = ?`;
        q.ans = total;
        q.answerType = "multiple-choice";
        q.options = mcOptions;
        q.hint = `Count all the ${emoji} together. ${n} + ${m} = ${total}.`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Add the Pictures</div>
            <div style="display:inline-flex;align-items:center;justify-content:center;gap:14px;background:var(--bg-card);border-radius:12px;padding:14px;white-space:nowrap;max-width:100%;">
                ${groupA}
                <span style="font-size:1.8rem;font-weight:800;color:var(--accent-green);">+</span>
                ${groupB}
                <span style="font-size:1.8rem;font-weight:800;color:var(--accent-cyan);">=</span>
                <span style="display:inline-block;min-width:48px;border-bottom:3px solid var(--text-dim);font-size:1.6rem;">?</span>
            </div>
        </div>`;
        q.skillLabel = "Add ≤5 Pics";
        q.printFormat = "add-5-pictures";
        q.pictureData = { emoji, n, m, total, mcOptions };
        return;
    }

    // ========================================
    // SUB 5 PICTURES (Grade K) — differences from N (≤5) with cross-outs
    // ========================================
    else if (mappedSkill === "sub_5_pictures") {
        const emojiSet = ["🍎", "⭐", "🐢", "🚗", "🌸", "🍄", "🐝", "🍇"];
        const emoji = pick(emojiSet);
        const n = randInt(2, 5);
        const m = randInt(1, n - 1);
        const remain = n - m;

        // Render: m crossed-out, then (n-m) plain — total of n icons in a row
        let pics = '';
        for (let i = 0; i < n; i++) {
            const isCrossed = i < m;
            pics += `<span style="font-size:2rem;display:inline-block;margin:0 3px;${isCrossed ? 'text-decoration:line-through;text-decoration-color:#d33;text-decoration-thickness:3px;opacity:0.55;' : ''}">${emoji}</span>`;
        }

        const optsSet = new Set([remain]);
        while (optsSet.size < 3) {
            const cand = remain + (Math.random() < 0.5 ? -1 : 1) * randInt(1, 2);
            if (cand >= 0 && cand <= 5) optsSet.add(cand);
        }
        if (optsSet.size < 3) {
            for (let v = 0; v <= 5 && optsSet.size < 3; v++) optsSet.add(v);
        }

        const mcOptions = shuffle([...optsSet]);
        q.text = `Start with ${n}, take away ${m}. How many are left?`;
        q.ans = remain;
        q.answerType = "multiple-choice";
        q.options = mcOptions;
        q.hint = `Count just the ${emoji} that are NOT crossed out. ${n} − ${m} = ${remain}.`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">How Many Are Left?</div>
            <div style="background:var(--bg-card);border-radius:12px;padding:14px;">
                <div style="line-height:1;">${pics}</div>
                <div style="margin-top:10px;font-size:1.1rem;font-weight:700;">${n} − ${m} = <span style="display:inline-block;min-width:42px;border-bottom:3px solid var(--text-dim);">?</span></div>
            </div>
        </div>`;
        q.skillLabel = "Sub ≤5 Pics";
        q.printFormat = "sub-5-pictures";
        q.pictureData = { emoji, n, m, remain, mcOptions };
        return;
    }

    // ========================================
    // TENS FOUNDATION (Grade K) — count base-10 rods, "How many tens?"
    // ========================================
    else if (mappedSkill === "tens_foundation_visual") {
        const rods = randInt(1, 9);
        // createBase10Blocks(rods*10) renders R rods (no units, no flats)
        const blocksHtml = createBase10Blocks(rods * 10);

        q.text = `How many tens?`;
        q.ans = rods;
        q.answerType = "number";
        q.options = buildNumericOptions(rods).filter(v => v >= 1 && v <= 9);
        // Ensure 3-option floor for K-friendliness
        const optsSet = new Set(q.options);
        optsSet.add(rods);
        while (optsSet.size < 3) {
            const cand = randInt(1, 9);
            optsSet.add(cand);
        }
        q.options = shuffle([...optsSet]).slice(0, 4);
        if (!q.options.includes(rods)) q.options[0] = rods;
        q.hint = `Each tall green rod is 1 ten. Count the rods!`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Count the Tens</div>
            <div style="background:var(--bg-card);border-radius:12px;padding:14px;display:inline-block;">
                ${blocksHtml}
            </div>
            <div style="margin-top:10px;font-size:1rem;color:var(--text-dim);">Each rod = 10. How many rods?</div>
        </div>`;
        q.skillLabel = "Count Tens";
        q.printFormat = "tens-foundation";
        q.tensData = { rods };
        return;
    }

    // ========================================
    // HUNDREDS CHART FILL (Grade 1) — find the missing number on a 10x10 chart
    // Phase 5 batch 2 — band 161-170, NO domain
    // ========================================
    else if (mappedSkill === "hundreds_chart_fill") {
        // Pick a target cell (1-100). Avoid corners on first attempt for visual variety.
        const target = randInt(2, 99);
        // Build 10x10 SVG grid. Cells number 1..100 row-major (top-left = 1).
        const cellW = 30;
        const cellH = 28;
        const padL = 6, padT = 6;
        const svgW = padL + 10 * cellW + 6;
        const svgH = padT + 10 * cellH + 6;
        let cells = '';
        for (let i = 0; i < 100; i++) {
            const num = i + 1;
            const col = i % 10;
            const row = Math.floor(i / 10);
            const x = padL + col * cellW;
            const y = padT + row * cellH;
            const isBlank = num === target;
            const highlight = COLORS.fill[2];
            const fill = isBlank ? softFill(highlight) : '#fff';
            const stroke = isBlank ? highlight : COLORS.grid;
            const strokeW = isBlank ? STROKE.bold : STROKE.hair;
            const dash = isBlank ? 'stroke-dasharray="4,3"' : '';
            cells += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${dash}/>`;
            if (!isBlank) {
                cells += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 4}" text-anchor="middle" font-family='${FONTS.sans}' font-size="11" font-weight="600" fill="${COLORS.text}">${num}</text>`;
            } else {
                cells += `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 5}" text-anchor="middle" font-family='${FONTS.sans}' font-size="14" font-weight="800" fill="${highlight}">?</text>`;
            }
        }

        // 4 distinct numeric options near target
        const optsSet = new Set([target]);
        // Near-neighbours: ±1, ±10 — common confusable distractors on a 100-chart
        const candidates = [target - 1, target + 1, target - 10, target + 10, target - 11, target + 11, target - 9, target + 9];
        for (const c of shuffle(candidates)) {
            if (optsSet.size >= 4) break;
            if (c >= 1 && c <= 100) optsSet.add(c);
        }
        while (optsSet.size < 4) {
            const c = randInt(1, 100);
            optsSet.add(c);
        }

        q.text = `What number goes in the blank?`;
        q.ans = target;
        q.answerType = "number";
        q.options = shuffle([...optsSet]);
        q.hint = `Look at the numbers around the blank. Each row goes up by 1; each column goes up by 10.`;
        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.2rem;">Hundreds Chart</div>
            <div style="background:var(--bg-card);border-radius:12px;padding:14px;display:inline-block;max-width:100%;width:100%;">
                <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:820px;height:auto;">
                    ${cells}
                </svg>
            </div>
            <div style="margin-top:10px;font-size:1rem;color:var(--text-dim);">Find the missing number in the orange box.</div>
        </div>`;
        q.skillLabel = "100-Chart Fill";
        q.printFormat = "hundreds-chart-fill";
        q.chartData = { target };
        return;
    }

    // ========================================
    // TEN-FRAME BUILD (Grade K) — drag dots into a 5×2 frame to match target
    // ========================================
    else if (mappedSkill === "ten_frame_build") {
        const target = rng(1, 10);
        q.text = `Build the number ${target} on the ten frame. Drag counters from the palette into the cells.`;
        q.target = target;
        q.ans = target;
        q.maxDots = 10;
        q.answerType = "ten-frame-build";
        q.hint = `Drag exactly ${target} counter${target === 1 ? '' : 's'} into the ten frame.`;
        q.skillLabel = "Ten Frame Build";
        q.printFormat = "ten-frame-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // TEN-FRAME BUILD TEEN (Grade K/1) — 11..20 on two stacked 5×2 frames
    // ========================================
    else if (mappedSkill === "ten_frame_build_teen") {
        const target = rng(11, 20);
        q.text = `Build the number ${target} on the ten frames. Drag counters into the cells.`;
        q.target = target;
        q.ans = target;
        q.maxDots = 20;
        q.answerType = "ten-frame-build";
        q.hint = `Fill the top frame to 10, then place ${target - 10} more in the bottom frame.`;
        q.skillLabel = "Teen Ten Frame";
        q.printFormat = "ten-frame-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // BASE-10 BUILD (Grade 1) — model 11..99 with rods + units
    // ========================================
    else if (mappedSkill === "base10_build") {
        const target = rng(11, 99);
        const tens = Math.floor(target / 10);
        const ones = target % 10;
        q.text = `Build the number ${target} with base-10 blocks.`;
        q.target = target;
        q.ans = target;
        q.maxPlace = 10;
        q.allowRegroup = false;
        q.places = [10, 1];
        q.answerType = "base10-build";
        q.hint = `${target} = ${tens} ten${tens === 1 ? '' : 's'} + ${ones} one${ones === 1 ? '' : 's'}. Drag ${tens} rod${tens === 1 ? '' : 's'} and ${ones} unit${ones === 1 ? '' : 's'}.`;
        q.skillLabel = "Base-10 Build";
        q.printFormat = "base10-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // BASE-10 REGROUP (Grade 2) — model with regrouping enabled (sub prep)
    // ========================================
    else if (mappedSkill === "base10_regroup") {
        const target = rng(20, 99);
        const tens = Math.floor(target / 10);
        const ones = target % 10;
        q.text = `Build ${target} with base-10 blocks, then use the "Decompose 1 ten" button to regroup. The total must still equal ${target}.`;
        q.target = target;
        q.ans = target;
        q.maxPlace = 10;
        q.allowRegroup = true;
        q.places = [10, 1];
        q.answerType = "base10-build";
        q.hint = `Build ${target} (${tens} tens + ${ones} ones), then click "Decompose 1 ten" to trade one rod for ten units. The total stays the same.`;
        q.skillLabel = "Base-10 Regroup";
        q.printFormat = "base10-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // ========================================
    // BASE-10 BUILD HUNDREDS (Grade 2) — model 100..999 with flats + rods + units
    // ========================================
    else if (mappedSkill === "base10_build_hundreds") {
        const target = rng(100, 999);
        const hundreds = Math.floor(target / 100);
        const tens = Math.floor((target % 100) / 10);
        const ones = target % 10;
        q.text = `Build the number ${target} with base-10 blocks (flats, rods, and units).`;
        q.target = target;
        q.ans = target;
        q.maxPlace = 100;
        q.allowRegroup = true;
        q.places = [100, 10, 1];
        q.answerType = "base10-build";
        q.hint = `${target} = ${hundreds} hundred${hundreds === 1 ? '' : 's'} + ${tens} ten${tens === 1 ? '' : 's'} + ${ones} one${ones === 1 ? '' : 's'}.`;
        q.skillLabel = "Base-10 Hundreds";
        q.printFormat = "base10-build";
        q.visual = "";
        q.options = [];
        return;
    }

    // Fallback
    else {
        q.text = `Count: 1 + 1 = ?`;
        q.ans = 2;
        q.answerType = "number";
        q.hint = "1 plus 1 equals 2.";
        q.visual = `<div style="text-align:center;color:var(--text-dim);">Counting practice</div>`;
        return;
    }
}
