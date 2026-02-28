// gen-counting.js - Counting & Cardinality (Grade K) question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';

export function generateCountingQuestion(q, mappedSkill, helpers) {
    const { rng, range } = helpers;

    // ========================================
    // COUNT OBJECTS (Grade K) - Count objects 1-20
    // ========================================
    if (mappedSkill === "count_objects") {
        const count = rng(1, 20);
        const shapes = [
            { name: "star", color: "var(--accent-orange)", draw: (cx, cy, s) => {
                const pts = [];
                for (let i = 0; i < 5; i++) {
                    const outerAngle = (i * 72 - 90) * Math.PI / 180;
                    const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
                    pts.push(`${cx + s * Math.cos(outerAngle)},${cy + s * Math.sin(outerAngle)}`);
                    pts.push(`${cx + s * 0.4 * Math.cos(innerAngle)},${cy + s * 0.4 * Math.sin(innerAngle)}`);
                }
                return `<polygon points="${pts.join(' ')}" fill="currentColor" stroke="none"/>`;
            }},
            { name: "circle", color: "var(--accent-cyan)", draw: (cx, cy, s) => {
                return `<circle cx="${cx}" cy="${cy}" r="${s * 0.8}" fill="currentColor" stroke="none"/>`;
            }},
            { name: "heart", color: "#e74c7c", draw: (cx, cy, s) => {
                const hs = s * 0.9;
                return `<path d="M${cx},${cy + hs * 0.3} C${cx},${cy - hs * 0.5} ${cx - hs},${cy - hs * 0.5} ${cx - hs},${cy} C${cx - hs},${cy + hs * 0.4} ${cx},${cy + hs} ${cx},${cy + hs} C${cx},${cy + hs} ${cx + hs},${cy + hs * 0.4} ${cx + hs},${cy} C${cx + hs},${cy - hs * 0.5} ${cx},${cy - hs * 0.5} ${cx},${cy + hs * 0.3} Z" fill="currentColor" stroke="none"/>`;
            }},
            { name: "apple", color: "var(--accent-green)", draw: (cx, cy, s) => {
                return `<circle cx="${cx}" cy="${cy + s * 0.1}" r="${s * 0.7}" fill="currentColor" stroke="none"/>
                    <rect x="${cx - s * 0.06}" y="${cy - s * 0.7}" width="${s * 0.12}" height="${s * 0.4}" rx="1" fill="#8B4513"/>
                    <ellipse cx="${cx + s * 0.2}" cy="${cy - s * 0.45}" rx="${s * 0.2}" ry="${s * 0.12}" fill="#27ae60" transform="rotate(30,${cx + s * 0.2},${cy - s * 0.45})"/>`;
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
            boxesSvg += `<rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="6" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>`;
            if (isBlank) {
                boxesSvg += `<text x="${x + boxW / 2}" y="${y + boxH / 2 + 6}" text-anchor="middle" font-size="20" font-weight="700" fill="${textColor}">?</text>`;
            } else {
                boxesSvg += `<text x="${x + boxW / 2}" y="${y + boxH / 2 + 6}" text-anchor="middle" font-size="18" font-weight="600" fill="${textColor}">${n}</text>`;
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

        const colorsA = "var(--accent-cyan)";
        const colorsB = "var(--accent-orange)";
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
        const qType = pick(questionTypes);

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

        const colorA = "var(--accent-cyan)";
        const colorB = "var(--accent-orange)";

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
            objectsSvg += `<text x="${15 + rectA.w / 2}" y="${10 + rectA.h / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">A</text>`;
            objectsSvg += `<rect x="15" y="${10 + rectA.h + 20}" width="${rectB.w}" height="${rectB.h}" rx="6" fill="${colorB}" opacity="0.85"/>`;
            objectsSvg += `<text x="${15 + rectB.w / 2}" y="${10 + rectA.h + 20 + rectB.h / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">B</text>`;
        } else {
            // Show side by side horizontally for height comparison, aligned at bottom
            const maxH = Math.max(rectA.h, rectB.h);
            const yA = 10 + maxH - rectA.h;
            const yB = 10 + maxH - rectB.h;
            objectsSvg += `<rect x="15" y="${yA}" width="${rectA.w}" height="${rectA.h}" rx="6" fill="${colorA}" opacity="0.85"/>`;
            objectsSvg += `<text x="${15 + rectA.w / 2}" y="${yA + rectA.h / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">A</text>`;
            objectsSvg += `<rect x="${15 + rectA.w + 30}" y="${yB}" width="${rectB.w}" height="${rectB.h}" rx="6" fill="${colorB}" opacity="0.85"/>`;
            objectsSvg += `<text x="${15 + rectA.w + 30 + rectB.w / 2}" y="${yB + rectB.h / 2 + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">B</text>`;
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
    else if (mappedSkill === "classify_count") {
        // Categories of objects to sort
        const categories = [
            {
                name: "Fruit",
                items: [
                    { label: "Apple", color: "#e74c3c", shape: "circle" },
                    { label: "Banana", color: "#f1c40f", shape: "crescent" },
                    { label: "Orange", color: "#e67e22", shape: "circle" },
                    { label: "Grape", color: "#8e44ad", shape: "circle" },
                ]
            },
            {
                name: "Animal",
                items: [
                    { label: "Cat", color: "#e67e22", shape: "triangle" },
                    { label: "Dog", color: "#8B4513", shape: "triangle" },
                    { label: "Bird", color: "#3498db", shape: "diamond" },
                    { label: "Fish", color: "#1abc9c", shape: "diamond" },
                ]
            },
            {
                name: "Shape",
                items: [
                    { label: "Circle", color: "#e74c3c", shape: "circle" },
                    { label: "Square", color: "#3498db", shape: "square" },
                    { label: "Triangle", color: "#2ecc71", shape: "triangle" },
                    { label: "Star", color: "#f1c40f", shape: "star" },
                ]
            },
            {
                name: "Vehicle",
                items: [
                    { label: "Car", color: "#e74c3c", shape: "square" },
                    { label: "Bus", color: "#f1c40f", shape: "square" },
                    { label: "Bike", color: "#2ecc71", shape: "diamond" },
                    { label: "Boat", color: "#3498db", shape: "diamond" },
                ]
            },
            {
                name: "Color",
                items: [
                    { label: "Red", color: "#e74c3c", shape: "circle" },
                    { label: "Blue", color: "#3498db", shape: "circle" },
                    { label: "Green", color: "#2ecc71", shape: "circle" },
                    { label: "Yellow", color: "#f1c40f", shape: "circle" },
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
                itemsSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${item.color}" stroke="#333" stroke-width="1.5"/>`;
            } else if (item.shape === "square") {
                itemsSvg += `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="3" fill="${item.color}" stroke="#333" stroke-width="1.5"/>`;
            } else if (item.shape === "triangle") {
                itemsSvg += `<polygon points="${cx},${cy - r} ${cx - r},${cy + r} ${cx + r},${cy + r}" fill="${item.color}" stroke="#333" stroke-width="1.5"/>`;
            } else if (item.shape === "diamond") {
                itemsSvg += `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${item.color}" stroke="#333" stroke-width="1.5"/>`;
            } else if (item.shape === "star") {
                const pts = [];
                for (let i = 0; i < 5; i++) {
                    const oA = (i * 72 - 90) * Math.PI / 180;
                    const iA = ((i * 72) + 36 - 90) * Math.PI / 180;
                    pts.push(`${cx + r * Math.cos(oA)},${cy + r * Math.sin(oA)}`);
                    pts.push(`${cx + r * 0.4 * Math.cos(iA)},${cy + r * 0.4 * Math.sin(iA)}`);
                }
                itemsSvg += `<polygon points="${pts.join(' ')}" fill="${item.color}" stroke="#333" stroke-width="1.5"/>`;
            } else if (item.shape === "crescent") {
                itemsSvg += `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.6}" ry="${r}" fill="${item.color}" stroke="#333" stroke-width="1.5"/>`;
            }
            itemsSvg += `<text x="${cx}" y="${cy + r + 12}" text-anchor="middle" font-size="9" fill="var(--text-bright, #333)">${item.label}</text>`;
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

        const topColor = "var(--accent-purple)";
        const leftColor = missingPart === "A" ? "var(--accent-orange)" : "var(--accent-cyan)";
        const rightColor = missingPart === "B" ? "var(--accent-orange)" : "var(--accent-green)";

        q.visual = `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Number Bond</div>
            <svg viewBox="0 0 ${svgW} ${svgH}" width="${Math.min(svgW, 220)}" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                <!-- Lines connecting circles -->
                <line x1="${topCx}" y1="${topCy + circR}" x2="${botLeftCx}" y2="${botCy - circR}" stroke="var(--text-dim)" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="${topCx}" y1="${topCy + circR}" x2="${botRightCx}" y2="${botCy - circR}" stroke="var(--text-dim)" stroke-width="2.5" stroke-linecap="round"/>
                <!-- Top circle (total) -->
                <circle cx="${topCx}" cy="${topCy}" r="${circR}" fill="${topColor}" stroke="none" opacity="0.9"/>
                <text x="${topCx}" y="${topCy + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${total}</text>
                <!-- Left circle (part A) -->
                <circle cx="${botLeftCx}" cy="${botCy}" r="${circR}" fill="${leftColor}" stroke="${missingPart === 'A' ? 'var(--accent-orange)' : 'none'}" stroke-width="${missingPart === 'A' ? 3 : 0}" stroke-dasharray="${missingPart === 'A' ? '6,3' : 'none'}" opacity="0.9"/>
                <text x="${botLeftCx}" y="${botCy + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${missingPart === "A" ? "?" : partA}</text>
                <!-- Right circle (part B) -->
                <circle cx="${botRightCx}" cy="${botCy}" r="${circR}" fill="${rightColor}" stroke="${missingPart === 'B' ? 'var(--accent-orange)' : 'none'}" stroke-width="${missingPart === 'B' ? 3 : 0}" stroke-dasharray="${missingPart === 'B' ? '6,3' : 'none'}" opacity="0.9"/>
                <text x="${botRightCx}" y="${botCy + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${missingPart === "B" ? "?" : partB}</text>
            </svg>
        </div>`;
        return;
    }

    // ========================================
    // MAKE TEN (Grade K) - Missing to make 10
    // ========================================
    else if (mappedSkill === "make_ten") {
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
        const filledColor = "var(--accent-cyan)";
        const emptyColor = "transparent";
        const borderColor = "var(--text-dim)";

        let cells = '';
        for (let i = 0; i < 10; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 10 + col * (cellSize + gap);
            const y = 10 + row * (cellSize + gap);
            const isFilled = i < filled;
            cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="6" fill="${isFilled ? filledColor : emptyColor}" stroke="${borderColor}" stroke-width="2" opacity="${isFilled ? 0.85 : 0.4}"/>`;
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

        const tenColor = "var(--accent-cyan)";
        const onesColor = "var(--accent-orange)";
        const borderColor = "var(--text-dim)";

        // Ten frame (all 10 filled)
        let cells = '';
        for (let i = 0; i < 10; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const x = 10 + col * (cellSize + gap);
            const y = 10 + row * (cellSize + gap);
            cells += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="5" fill="${tenColor}" stroke="${borderColor}" stroke-width="1.5" opacity="0.85"/>`;
            cells += `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize * 0.28}" fill="#fff" opacity="0.9"/>`;
        }

        // Extra ones below the ten frame
        const extrasY = tenFrameH + 5;
        const extrasStartX = 10;
        for (let i = 0; i < ones; i++) {
            const x = extrasStartX + i * (cellSize + gap);
            cells += `<rect x="${x}" y="${extrasY}" width="${cellSize}" height="${cellSize}" rx="5" fill="${onesColor}" stroke="${borderColor}" stroke-width="1.5" opacity="0.85"/>`;
            cells += `<circle cx="${x + cellSize / 2}" cy="${extrasY + cellSize / 2}" r="${cellSize * 0.28}" fill="#fff" opacity="0.9"/>`;
        }

        // Labels
        cells += `<text x="${frameW / 2}" y="${tenFrameH - 2}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-dim)">10</text>`;
        if (ones > 0) {
            const extrasW = ones * (cellSize + gap) - gap;
            cells += `<text x="${extrasStartX + extrasW / 2}" y="${extrasY + cellSize + 14}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--text-dim)">+ ${ones}</text>`;
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
