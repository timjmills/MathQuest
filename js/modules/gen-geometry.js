// gen-geometry.js - Geometry question generation (area, perimeter, angles, shapes, coordinates, volume)
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG } from './svg-geometry.js';

export function generateGeometryQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // ===== NAME 2D SHAPES (Grade K) =====
            if (mappedSkill === "name_2d_shapes") {
                const shapes2d = [
                    { name: "Circle", sides: 0, svgFn: () => `<ellipse cx="100" cy="100" rx="80" ry="80" fill="var(--accent-cyan)" fill-opacity="0.35" stroke="var(--accent-cyan)" stroke-width="3"/>` },
                    { name: "Square", sides: 4, svgFn: () => `<rect x="20" y="20" width="160" height="160" fill="var(--accent-green)" fill-opacity="0.35" stroke="var(--accent-green)" stroke-width="3"/>` },
                    { name: "Rectangle", sides: 4, svgFn: () => `<rect x="10" y="40" width="180" height="120" fill="var(--accent-purple)" fill-opacity="0.3" stroke="var(--accent-purple)" stroke-width="3"/>` },
                    { name: "Triangle", sides: 3, svgFn: () => `<polygon points="100,15 15,185 185,185" fill="var(--accent-orange)" fill-opacity="0.35" stroke="var(--accent-orange)" stroke-width="3"/>` },
                    { name: "Hexagon", sides: 6, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 6; i++) {
                            const a = Math.PI / 3 * i - Math.PI / 2;
                            pts.push(`${100 + 80 * Math.cos(a)},${100 + 80 * Math.sin(a)}`);
                        }
                        return `<polygon points="${pts.join(' ')}" fill="#e879f9" fill-opacity="0.35" stroke="#c026d3" stroke-width="3"/>`;
                    }},
                    { name: "Pentagon", sides: 5, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 5; i++) {
                            const a = Math.PI * 2 / 5 * i - Math.PI / 2;
                            pts.push(`${100 + 80 * Math.cos(a)},${100 + 80 * Math.sin(a)}`);
                        }
                        return `<polygon points="${pts.join(' ')}" fill="#60a5fa" fill-opacity="0.35" stroke="#2563eb" stroke-width="3"/>`;
                    }},
                    { name: "Oval", sides: 0, svgFn: () => `<ellipse cx="100" cy="100" rx="90" ry="60" fill="#fbbf24" fill-opacity="0.35" stroke="#d97706" stroke-width="3"/>` },
                    { name: "Rhombus", sides: 4, svgFn: () => `<polygon points="100,15 185,100 100,185 15,100" fill="#34d399" fill-opacity="0.35" stroke="#059669" stroke-width="3"/>` }
                ];

                const shape2d = pick(shapes2d);
                q.text = `What shape is this?`;
                q.ans = shape2d.name;
                q.answerType = "multiple-choice";
                q.options = shuffle(["Circle", "Square", "Triangle", "Rectangle", "Hexagon", "Pentagon"]);
                if (!q.options.includes(shape2d.name)) {
                    q.options[q.options.length - 1] = shape2d.name;
                    q.options = shuffle(q.options);
                }
                q.hint = shape2d.sides > 0 ? `Count the sides. This shape has ${shape2d.sides} sides.` : `This shape has no straight sides - it is curved.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Name This Shape</div>
                    <svg width="200" height="200" viewBox="0 0 200 200" style="max-width:100%;">
                        ${shape2d.svgFn()}
                    </svg>
                </div>`;
                q.skillLabel = '2D Shapes';
                q.printFormat = 'geometry-2d-shapes';
                return;
            }

            // ===== NAME 3D SHAPES (Grade K) =====
            if (mappedSkill === "name_3d_shapes") {
                const shapes3d = [
                    { name: "Cube", svgFn: () => `
                        <defs><linearGradient id="cubeFace1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#60a5fa" stop-opacity="0.6"/><stop offset="100%" stop-color="#3b82f6" stop-opacity="0.8"/></linearGradient>
                        <linearGradient id="cubeFace2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#93c5fd" stop-opacity="0.5"/><stop offset="100%" stop-color="#60a5fa" stop-opacity="0.7"/></linearGradient>
                        <linearGradient id="cubeFace3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#bfdbfe" stop-opacity="0.4"/><stop offset="100%" stop-color="#93c5fd" stop-opacity="0.6"/></linearGradient></defs>
                        <polygon points="60,160 160,160 160,60 60,60" fill="url(#cubeFace1)" stroke="#2563eb" stroke-width="2.5"/>
                        <polygon points="60,60 160,60 200,30 100,30" fill="url(#cubeFace3)" stroke="#2563eb" stroke-width="2.5"/>
                        <polygon points="160,60 200,30 200,130 160,160" fill="url(#cubeFace2)" stroke="#2563eb" stroke-width="2.5"/>` },
                    { name: "Sphere", svgFn: () => `
                        <defs><radialGradient id="sphereGrad" cx="35%" cy="35%" r="60%"><stop offset="0%" stop-color="#fef3c7"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#d97706"/></radialGradient></defs>
                        <circle cx="120" cy="110" r="75" fill="url(#sphereGrad)" stroke="#b45309" stroke-width="2"/>
                        <ellipse cx="120" cy="110" rx="75" ry="20" fill="none" stroke="#b45309" stroke-width="1.5" stroke-dasharray="6,4"/>
                        <ellipse cx="120" cy="110" rx="20" ry="75" fill="none" stroke="#b45309" stroke-width="1.5" stroke-dasharray="6,4"/>` },
                    { name: "Cylinder", svgFn: () => `
                        <defs><linearGradient id="cylGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.7"/><stop offset="50%" stop-color="#c4b5fd" stop-opacity="0.5"/><stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.8"/></linearGradient></defs>
                        <rect x="60" y="60" width="120" height="120" fill="url(#cylGrad)" stroke="#7c3aed" stroke-width="2.5"/>
                        <ellipse cx="120" cy="60" rx="60" ry="20" fill="#c4b5fd" stroke="#7c3aed" stroke-width="2.5"/>
                        <ellipse cx="120" cy="180" rx="60" ry="20" fill="url(#cylGrad)" stroke="#7c3aed" stroke-width="2.5"/>
                        <line x1="60" y1="60" x2="60" y2="180" stroke="#7c3aed" stroke-width="2.5"/>
                        <line x1="180" y1="60" x2="180" y2="180" stroke="#7c3aed" stroke-width="2.5"/>` },
                    { name: "Cone", svgFn: () => `
                        <defs><linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fb923c" stop-opacity="0.6"/><stop offset="100%" stop-color="#ea580c" stop-opacity="0.8"/></linearGradient></defs>
                        <polygon points="120,25 55,175 185,175" fill="url(#coneGrad)" stroke="#c2410c" stroke-width="2.5"/>
                        <ellipse cx="120" cy="175" rx="65" ry="20" fill="#fdba74" fill-opacity="0.6" stroke="#c2410c" stroke-width="2.5"/>` },
                    { name: "Rectangular Prism", svgFn: () => `
                        <defs><linearGradient id="rpFace1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#34d399" stop-opacity="0.6"/><stop offset="100%" stop-color="#059669" stop-opacity="0.8"/></linearGradient>
                        <linearGradient id="rpFace2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#6ee7b7" stop-opacity="0.5"/><stop offset="100%" stop-color="#34d399" stop-opacity="0.7"/></linearGradient>
                        <linearGradient id="rpFace3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#a7f3d0" stop-opacity="0.4"/><stop offset="100%" stop-color="#6ee7b7" stop-opacity="0.6"/></linearGradient></defs>
                        <polygon points="40,170 170,170 170,60 40,60" fill="url(#rpFace1)" stroke="#047857" stroke-width="2.5"/>
                        <polygon points="40,60 170,60 210,35 80,35" fill="url(#rpFace3)" stroke="#047857" stroke-width="2.5"/>
                        <polygon points="170,60 210,35 210,145 170,170" fill="url(#rpFace2)" stroke="#047857" stroke-width="2.5"/>` }
                ];

                const shape3d = pick(shapes3d);
                q.text = `What 3D shape is this?`;
                q.ans = shape3d.name;
                q.answerType = "multiple-choice";
                q.options = shuffle(["Cube", "Sphere", "Cylinder", "Cone", "Rectangular Prism"]);
                q.hint = `Look at the shape carefully. Does it have flat faces, curved surfaces, or both?`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Name This 3D Shape</div>
                    <svg width="240" height="210" viewBox="0 0 240 210" style="max-width:100%;">
                        ${shape3d.svgFn()}
                    </svg>
                </div>`;
                q.skillLabel = '3D Shapes';
                q.printFormat = 'geometry-3d-shapes';
                return;
            }

            // ===== SHAPE POSITIONS (Grade K) =====
            if (mappedSkill === "shape_positions") {
                const positions = ["Above", "Below", "Beside", "Between"];
                const posChoice = pick(positions);
                const objectColors = ["#ef4444", "#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];
                const objColor = pick(objectColors);
                const refColor = pick(objectColors.filter(c => c !== objColor));

                const objects = [
                    { name: "ball", svg: (cx, cy, col) => `<circle cx="${cx}" cy="${cy}" r="22" fill="${col}" stroke="${col}" stroke-width="1"/><ellipse cx="${cx}" cy="${cy - 6}" rx="8" ry="5" fill="white" fill-opacity="0.3"/>` },
                    { name: "star", svg: (cx, cy, col) => {
                        const pts = [];
                        for (let i = 0; i < 5; i++) {
                            const outerA = Math.PI * 2 / 5 * i - Math.PI / 2;
                            const innerA = outerA + Math.PI / 5;
                            pts.push(`${cx + 20 * Math.cos(outerA)},${cy + 20 * Math.sin(outerA)}`);
                            pts.push(`${cx + 9 * Math.cos(innerA)},${cy + 9 * Math.sin(innerA)}`);
                        }
                        return `<polygon points="${pts.join(' ')}" fill="${col}" stroke="${col}" stroke-width="1"/>`;
                    }},
                    { name: "heart", svg: (cx, cy, col) => `<path d="M ${cx} ${cy + 10} C ${cx - 25} ${cy - 15}, ${cx - 5} ${cy - 30}, ${cx} ${cy - 10} C ${cx + 5} ${cy - 30}, ${cx + 25} ${cy - 15}, ${cx} ${cy + 10} Z" fill="${col}"/>` }
                ];
                const obj = pick(objects);
                const refObj = pick(objects.filter(o => o.name !== obj.name));

                let objX, objY, refX, refY, betweenSvg = '';
                const sceneCX = 140, sceneCY = 100;

                if (posChoice === "Above") {
                    refX = sceneCX; refY = sceneCY + 40;
                    objX = sceneCX; objY = sceneCY - 30;
                } else if (posChoice === "Below") {
                    refX = sceneCX; refY = sceneCY - 30;
                    objX = sceneCX; objY = sceneCY + 40;
                } else if (posChoice === "Beside") {
                    refX = sceneCX - 45; refY = sceneCY;
                    objX = sceneCX + 45; objY = sceneCY;
                } else {
                    // Between: place object between two reference objects
                    refX = sceneCX - 60; refY = sceneCY;
                    objX = sceneCX; objY = sceneCY;
                    const ref2X = sceneCX + 60;
                    betweenSvg = refObj.svg(ref2X, sceneCY, refColor);
                }

                q.text = `Where is the ${obj.name} compared to the ${refObj.name}?`;
                q.ans = posChoice;
                q.answerType = "multiple-choice";
                q.options = shuffle([...positions]);
                q.hint = `Look at where the ${obj.name} is placed relative to the ${refObj.name}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Where Is It?</div>
                    <svg width="280" height="200" viewBox="0 0 280 200" style="max-width:100%;background:var(--bg-card);border-radius:12px;">
                        <rect x="0" y="0" width="280" height="200" fill="var(--bg-card)" rx="12"/>
                        ${refObj.svg(refX, refY, refColor)}
                        ${obj.svg(objX, objY, objColor)}
                        ${betweenSvg}
                        <text x="${objX}" y="${objY + 35}" text-anchor="middle" fill="${objColor}" font-size="11" font-weight="700">${obj.name}</text>
                        <text x="${refX}" y="${refY + 35}" text-anchor="middle" fill="${refColor}" font-size="11" font-weight="700">${refObj.name}</text>
                    </svg>
                </div>`;
                q.skillLabel = 'Positions';
                q.printFormat = 'geometry-positions';
                return;
            }

            // ===== SHAPE CORNERS COUNT (Grade K) — Phase 5 batch 1 =====
            if (mappedSkill === "shape_corners_count") {
                const polygons = [
                    { name: 'triangle', sides: 3, color: '#f59e0b' },
                    { name: 'square', sides: 4, color: '#22c55e' },
                    { name: 'pentagon', sides: 5, color: '#3b82f6' },
                    { name: 'hexagon', sides: 6, color: '#a855f7' },
                    { name: 'heptagon', sides: 7, color: '#06b6d4' },
                    { name: 'octagon', sides: 8, color: '#ec4899' },
                ];
                const shape = pick(polygons);
                const cx = 100, cy = 100, r = 70;
                const startAngle = shape.sides % 2 === 1 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / shape.sides;
                const pts = [];
                const cornerDots = [];
                for (let i = 0; i < shape.sides; i++) {
                    const a = startAngle + (Math.PI * 2 / shape.sides) * i;
                    const px = cx + r * Math.cos(a);
                    const py = cy + r * Math.sin(a);
                    pts.push(`${px},${py}`);
                    cornerDots.push(`<circle cx="${px}" cy="${py}" r="5" fill="#fff" stroke="${shape.color}" stroke-width="2.5"/>`);
                }

                // Build distinct multi-choice options near the answer (3-4 options for K)
                const optsSet = new Set([shape.sides]);
                while (optsSet.size < 3) {
                    const cand = shape.sides + (Math.random() < 0.5 ? -1 : 1) * randInt(1, 2);
                    if (cand >= 3 && cand <= 8) optsSet.add(cand);
                }

                q.text = `How many corners does this shape have?`;
                q.ans = shape.sides;
                q.answerType = "number";
                q.options = shuffle([...optsSet]);
                q.hint = `Count each pointy corner of the shape one by one.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Count the Corners</div>
                    <svg viewBox="0 0 200 200" width="220" style="background:var(--bg-card);border-radius:12px;padding:8px;">
                        <polygon points="${pts.join(' ')}" fill="${shape.color}" fill-opacity="0.3" stroke="${shape.color}" stroke-width="3"/>
                        ${cornerDots.join('')}
                    </svg>
                </div>`;
                q.skillLabel = "Count Corners";
                q.printFormat = "shape-corners";
                q.shapeData = { shape: shape.name, sides: shape.sides, points: pts };
                return;
            }

            // ===== COMPOSE SHAPES (Grade K-1) =====
            if (mappedSkill === "compose_shapes") {
                const compositions = [
                    { result: "Rectangle", parts: ["Two squares"], partSvg: `
                        <rect x="10" y="50" width="60" height="60" fill="var(--accent-cyan)" fill-opacity="0.4" stroke="var(--accent-cyan)" stroke-width="2.5"/>
                        <rect x="90" y="50" width="60" height="60" fill="var(--accent-green)" fill-opacity="0.4" stroke="var(--accent-green)" stroke-width="2.5"/>`,
                        resultSvg: `<rect x="10" y="50" width="120" height="60" fill="var(--accent-purple)" fill-opacity="0.3" stroke="var(--accent-purple)" stroke-width="2.5"/>
                        <line x1="70" y1="50" x2="70" y2="110" stroke="var(--accent-purple)" stroke-width="1.5" stroke-dasharray="4,3"/>` },
                    { result: "Square", parts: ["Two triangles"], partSvg: `
                        <polygon points="10,110 70,50 70,110" fill="var(--accent-orange)" fill-opacity="0.4" stroke="var(--accent-orange)" stroke-width="2.5"/>
                        <polygon points="90,50 150,50 150,110" fill="#e879f9" fill-opacity="0.4" stroke="#c026d3" stroke-width="2.5"/>`,
                        resultSvg: `<rect x="10" y="50" width="60" height="60" fill="var(--accent-green)" fill-opacity="0.3" stroke="var(--accent-green)" stroke-width="2.5"/>
                        <line x1="10" y1="110" x2="70" y2="50" stroke="var(--accent-green)" stroke-width="1.5" stroke-dasharray="4,3"/>` },
                    { result: "Triangle", parts: ["Two smaller triangles"], partSvg: `
                        <polygon points="10,110 50,50 50,110" fill="var(--accent-cyan)" fill-opacity="0.4" stroke="var(--accent-cyan)" stroke-width="2.5"/>
                        <polygon points="100,110 100,50 140,110" fill="var(--accent-orange)" fill-opacity="0.4" stroke="var(--accent-orange)" stroke-width="2.5"/>`,
                        resultSvg: `<polygon points="10,110 70,30 130,110" fill="#fbbf24" fill-opacity="0.3" stroke="#d97706" stroke-width="2.5"/>
                        <line x1="70" y1="30" x2="70" y2="110" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,3"/>` },
                    { result: "Hexagon", parts: ["Two trapezoids"], partSvg: `
                        <polygon points="20,80 40,50 80,50 100,80" fill="var(--accent-green)" fill-opacity="0.4" stroke="var(--accent-green)" stroke-width="2.5"/>
                        <polygon points="110,80 130,110 90,110 70,80" fill="var(--accent-purple)" fill-opacity="0.4" stroke="var(--accent-purple)" stroke-width="2.5"/>`,
                        resultSvg: (() => {
                            const pts = [];
                            for (let i = 0; i < 6; i++) {
                                const a = Math.PI / 3 * i - Math.PI / 2;
                                pts.push(`${70 + 40 * Math.cos(a)},${80 + 40 * Math.sin(a)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="#e879f9" fill-opacity="0.3" stroke="#c026d3" stroke-width="2.5"/>`;
                        })() }
                ];

                const comp = pick(compositions);
                const wrongResults = ["Rectangle", "Square", "Triangle", "Hexagon", "Circle", "Pentagon"].filter(s => s !== comp.result);
                const opts = shuffle([comp.result, ...wrongResults.slice(0, 3)]);

                q.text = `What shape do you make when you put these two shapes together?`;
                q.ans = comp.result;
                q.answerType = "multiple-choice";
                q.options = opts;
                q.hint = `Look at the pieces and imagine sliding them together. ${comp.parts[0]} can make a ${comp.result}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Compose Shapes</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:15px;flex-wrap:wrap;">
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:5px;font-weight:600;">Pieces</div>
                            <svg width="160" height="130" viewBox="0 0 160 130" style="max-width:100%;background:var(--bg-card);border-radius:8px;padding:5px;">
                                ${comp.partSvg}
                            </svg>
                        </div>
                        <div style="font-size:2rem;color:var(--accent-cyan);font-weight:900;">=</div>
                        <div>
                            <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:5px;font-weight:600;">Result</div>
                            <svg width="140" height="130" viewBox="0 0 140 130" style="max-width:100%;background:var(--bg-card);border-radius:8px;padding:5px;">
                                ${comp.resultSvg}
                            </svg>
                            <div style="font-size:1rem;font-weight:700;margin-top:5px;color:var(--accent-green);">?</div>
                        </div>
                    </div>
                </div>`;
                q.skillLabel = 'Compose';
                q.printFormat = 'geometry-compose';
                return;
            }

            // ===== PARTITION SHAPES (Grade 1-3) =====
            if (mappedSkill === "partition_shapes") {
                const partCount = pick([2, 3, 4]);
                const shapeKind = pick(["rectangle", "circle"]);
                const shadedCount = rng(1, partCount - 1);

                // Decide question type
                const qType = pick(["count_parts", "fraction_shaded"]);

                let shapeSvg = '';
                if (shapeKind === "rectangle") {
                    const w = 180, h = 100;
                    const partW = w / partCount;
                    for (let i = 0; i < partCount; i++) {
                        const isFilled = i < shadedCount;
                        shapeSvg += `<rect x="${10 + i * partW}" y="10" width="${partW}" height="${h}" fill="${isFilled ? 'var(--accent-cyan)' : 'white'}" fill-opacity="${isFilled ? 0.5 : 0.1}" stroke="var(--accent-cyan)" stroke-width="2.5"/>`;
                    }
                } else {
                    const cx = 100, cy = 70, r = 60;
                    for (let i = 0; i < partCount; i++) {
                        const startAngle = (2 * Math.PI / partCount) * i - Math.PI / 2;
                        const endAngle = (2 * Math.PI / partCount) * (i + 1) - Math.PI / 2;
                        const x1 = cx + r * Math.cos(startAngle);
                        const y1 = cy + r * Math.sin(startAngle);
                        const x2 = cx + r * Math.cos(endAngle);
                        const y2 = cy + r * Math.sin(endAngle);
                        const largeArc = (endAngle - startAngle > Math.PI) ? 1 : 0;
                        const isFilled = i < shadedCount;
                        shapeSvg += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${isFilled ? 'var(--accent-purple)' : 'white'}" fill-opacity="${isFilled ? 0.45 : 0.1}" stroke="var(--accent-purple)" stroke-width="2.5"/>`;
                    }
                }

                if (qType === "count_parts") {
                    q.text = `How many equal parts is this shape divided into?`;
                    q.ans = partCount;
                    q.answerType = "number";
                    q.options = buildNumericOptions(partCount);
                    q.hint = `Count the sections. Each section should be the same size.`;
                } else {
                    const fractionNames = { 2: "halves", 3: "thirds", 4: "fourths" };
                    q.text = `What fraction of the shape is shaded?`;
                    q.ans = `${shadedCount}/${partCount}`;
                    q.answerType = "text";
                    q.options = shuffle([`${shadedCount}/${partCount}`, `${partCount - shadedCount}/${partCount}`, `1/${partCount}`, `${partCount}/${shadedCount}`].filter((v, i, a) => a.indexOf(v) === i));
                    q.hint = `${shadedCount} out of ${partCount} equal parts are shaded. The parts are called ${fractionNames[partCount]}.`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Equal Parts</div>
                    <svg width="200" height="${shapeKind === 'rectangle' ? 120 : 140}" viewBox="0 0 200 ${shapeKind === 'rectangle' ? 120 : 140}" style="max-width:100%;">
                        ${shapeSvg}
                    </svg>
                    <div style="margin-top:8px;font-size:0.85rem;color:var(--text-dim);">
                        ${qType === "fraction_shaded" ? "Shaded parts are colored" : "Count the equal sections"}
                    </div>
                </div>`;
                q.skillLabel = 'Partitions';
                q.printFormat = 'geometry-partitions';
                return;
            }

            // ===== SHAPE ATTRIBUTES (Grade 1-2) =====
            if (mappedSkill === "shape_attributes") {
                const attrShapes = [
                    { name: "Triangle", sides: 3, vertices: 3, svgFn: () => {
                        const pts = [[100, 20], [20, 160], [180, 160]];
                        let svg = `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="var(--accent-orange)" fill-opacity="0.3" stroke="var(--accent-orange)" stroke-width="2.5"/>`;
                        return { svg, pts };
                    }},
                    { name: "Square", sides: 4, vertices: 4, svgFn: () => {
                        const pts = [[30, 30], [170, 30], [170, 170], [30, 170]];
                        let svg = `<rect x="30" y="30" width="140" height="140" fill="var(--accent-cyan)" fill-opacity="0.3" stroke="var(--accent-cyan)" stroke-width="2.5"/>`;
                        return { svg, pts };
                    }},
                    { name: "Rectangle", sides: 4, vertices: 4, svgFn: () => {
                        const pts = [[20, 50], [180, 50], [180, 150], [20, 150]];
                        let svg = `<rect x="20" y="50" width="160" height="100" fill="var(--accent-green)" fill-opacity="0.3" stroke="var(--accent-green)" stroke-width="2.5"/>`;
                        return { svg, pts };
                    }},
                    { name: "Pentagon", sides: 5, vertices: 5, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 5; i++) {
                            const a = Math.PI * 2 / 5 * i - Math.PI / 2;
                            pts.push([100 + 75 * Math.cos(a), 100 + 75 * Math.sin(a)]);
                        }
                        let svg = `<polygon points="${pts.map(p => p.map(v => Math.round(v)).join(',')).join(' ')}" fill="#e879f9" fill-opacity="0.3" stroke="#c026d3" stroke-width="2.5"/>`;
                        return { svg, pts };
                    }},
                    { name: "Hexagon", sides: 6, vertices: 6, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 6; i++) {
                            const a = Math.PI / 3 * i - Math.PI / 2;
                            pts.push([100 + 75 * Math.cos(a), 100 + 75 * Math.sin(a)]);
                        }
                        let svg = `<polygon points="${pts.map(p => p.map(v => Math.round(v)).join(',')).join(' ')}" fill="#60a5fa" fill-opacity="0.3" stroke="#2563eb" stroke-width="2.5"/>`;
                        return { svg, pts };
                    }},
                    { name: "Octagon", sides: 8, vertices: 8, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 8; i++) {
                            const a = Math.PI / 4 * i - Math.PI / 8;
                            pts.push([100 + 75 * Math.cos(a), 100 + 75 * Math.sin(a)]);
                        }
                        let svg = `<polygon points="${pts.map(p => p.map(v => Math.round(v)).join(',')).join(' ')}" fill="#fb923c" fill-opacity="0.3" stroke="#ea580c" stroke-width="2.5"/>`;
                        return { svg, pts };
                    }}
                ];

                const attrShape = pick(attrShapes);
                const askWhat = pick(["sides", "vertices"]);
                const correctAns = askWhat === "sides" ? attrShape.sides : attrShape.vertices;
                const { svg: shapeDraw, pts } = attrShape.svgFn();

                // Label sides or vertices
                let labels = '';
                if (askWhat === "sides") {
                    for (let i = 0; i < pts.length; i++) {
                        const p1 = pts[i];
                        const p2 = pts[(i + 1) % pts.length];
                        const mx = (p1[0] + p2[0]) / 2;
                        const my = (p1[1] + p2[1]) / 2;
                        // Offset label outward from center
                        const dx = mx - 100, dy = my - 100;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const offX = mx + dx / dist * 12;
                        const offY = my + dy / dist * 12;
                        labels += `<text x="${Math.round(offX)}" y="${Math.round(offY)}" text-anchor="middle" dominant-baseline="middle" fill="var(--accent-orange)" font-size="13" font-weight="800">${i + 1}</text>`;
                    }
                } else {
                    for (let i = 0; i < pts.length; i++) {
                        labels += `<circle cx="${Math.round(pts[i][0])}" cy="${Math.round(pts[i][1])}" r="5" fill="var(--accent-green)" stroke="white" stroke-width="1.5"/>`;
                    }
                }

                q.text = `How many ${askWhat} does a ${attrShape.name.toLowerCase()} have?`;
                q.ans = correctAns;
                q.answerType = "number";
                q.options = buildNumericOptions(correctAns);
                q.hint = `Count each ${askWhat === "sides" ? "straight edge" : "corner point"} of the ${attrShape.name.toLowerCase()}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Shape Attributes</div>
                    <svg width="200" height="200" viewBox="0 0 200 200" style="max-width:100%;">
                        ${shapeDraw}
                        ${labels}
                    </svg>
                    <div style="margin-top:8px;font-size:0.9rem;color:var(--text-bright);font-weight:600;">${attrShape.name}</div>
                    <div style="margin-top:4px;font-size:0.85rem;color:var(--text-dim);">Count the ${askWhat === "sides" ? "numbered sides" : "green dots (vertices)"}</div>
                </div>`;
                q.skillLabel = 'Attributes';
                q.printFormat = 'geometry-attributes';
                return;
            }

            // ===== ADDITIVE ANGLES (Grade 4) =====
            if (mappedSkill === "additive_angles") {
                const totalAngle = pick([90, 180, 360]);
                const part1 = rng(10, totalAngle - 10);
                const part2 = totalAngle - part1;

                // Decide which part to ask for
                const askPart = pick([1, 2]);
                const knownPart = askPart === 1 ? part2 : part1;
                const unknownPart = askPart === 1 ? part1 : part2;

                q.text = `An angle is split into two parts. One part is ${knownPart}° and the whole angle is ${totalAngle}°. What is the missing part?`;
                q.ans = unknownPart;
                q.answerType = "number";
                q.options = buildNumericOptions(unknownPart);
                q.hint = `Missing angle = Total - Known part = ${totalAngle}° - ${knownPart}° = ${unknownPart}°`;

                // Draw the angle with two parts
                const cx = 120, cy = 130, armLen = 90;
                const totalRad = totalAngle * Math.PI / 180;
                const p1Rad = part1 * Math.PI / 180;

                // Arm positions (start from right, go counter-clockwise)
                const arm1X = cx + armLen * Math.cos(0);
                const arm1Y = cy - armLen * Math.sin(0);
                const splitX = cx + armLen * Math.cos(p1Rad);
                const splitY = cy - armLen * Math.sin(p1Rad);
                const arm2X = cx + armLen * Math.cos(totalRad);
                const arm2Y = cy - armLen * Math.sin(totalRad);

                // Arc paths
                const arcR = 40;
                const arc1EndX = cx + arcR * Math.cos(p1Rad);
                const arc1EndY = cy - arcR * Math.sin(p1Rad);
                const arc2EndX = cx + arcR * Math.cos(totalRad);
                const arc2EndY = cy - arcR * Math.sin(totalRad);
                const largeArc1 = part1 > 180 ? 1 : 0;
                const largeArc2 = part2 > 180 ? 1 : 0;

                // Label positions (midpoint of each arc)
                const label1Angle = p1Rad / 2;
                const label2Angle = p1Rad + (totalRad - p1Rad) / 2;
                const labelR = 55;
                const label1X = cx + labelR * Math.cos(label1Angle);
                const label1Y = cy - labelR * Math.sin(label1Angle);
                const label2X = cx + labelR * Math.cos(label2Angle);
                const label2Y = cy - labelR * Math.sin(label2Angle);

                // Right angle marker if total is 90
                let rightAngleMarker = '';
                if (totalAngle === 90) {
                    rightAngleMarker = `<path d="M ${cx + 15} ${cy} L ${cx + 15} ${cy - 15} L ${cx} ${cy - 15}" fill="none" stroke="var(--accent-green)" stroke-width="1.5"/>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.1rem;">Additive Angles</div>
                    <svg width="260" height="170" viewBox="0 0 260 170" style="max-width:100%;">
                        <!-- Arms -->
                        <line x1="${cx}" y1="${cy}" x2="${arm1X}" y2="${arm1Y}" stroke="var(--text-bright)" stroke-width="2.5"/>
                        <line x1="${cx}" y1="${cy}" x2="${Math.round(splitX)}" y2="${Math.round(splitY)}" stroke="var(--accent-orange)" stroke-width="2" stroke-dasharray="5,3"/>
                        <line x1="${cx}" y1="${cy}" x2="${Math.round(arm2X)}" y2="${Math.round(arm2Y)}" stroke="var(--text-bright)" stroke-width="2.5"/>
                        <!-- Arc for part 1 -->
                        <path d="M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${largeArc1} 0 ${Math.round(arc1EndX)} ${Math.round(arc1EndY)}" fill="var(--accent-cyan)" fill-opacity="0.2" stroke="var(--accent-cyan)" stroke-width="2"/>
                        <!-- Arc for part 2 -->
                        <path d="M ${Math.round(arc1EndX)} ${Math.round(arc1EndY)} A ${arcR} ${arcR} 0 ${largeArc2} 0 ${Math.round(arc2EndX)} ${Math.round(arc2EndY)}" fill="var(--accent-orange)" fill-opacity="0.2" stroke="var(--accent-orange)" stroke-width="2"/>
                        ${rightAngleMarker}
                        <!-- Labels -->
                        <text x="${Math.round(label1X)}" y="${Math.round(label1Y)}" text-anchor="middle" dominant-baseline="middle" fill="${askPart === 1 ? 'var(--accent-green)' : 'var(--text-bright)'}" font-size="14" font-weight="800">${askPart === 1 ? '?' : part1 + '\u00B0'}</text>
                        <text x="${Math.round(label2X)}" y="${Math.round(label2Y)}" text-anchor="middle" dominant-baseline="middle" fill="${askPart === 2 ? 'var(--accent-green)' : 'var(--text-bright)'}" font-size="14" font-weight="800">${askPart === 2 ? '?' : part2 + '\u00B0'}</text>
                        <!-- Total label -->
                        <text x="${cx - 5}" y="${cy + 18}" text-anchor="end" fill="var(--text-dim)" font-size="12" font-weight="600">Total: ${totalAngle}\u00B0</text>
                        <!-- Vertex dot -->
                        <circle cx="${cx}" cy="${cy}" r="3" fill="var(--text-bright)"/>
                    </svg>
                    <div style="margin-top:8px;font-size:0.95rem;color:var(--text-bright);">${knownPart}\u00B0 + <span style="border-bottom:2px solid var(--accent-green);padding:0 12px;font-weight:700;">?</span> = ${totalAngle}\u00B0</div>
                </div>`;
                q.skillLabel = 'Add Angles';
                q.printFormat = 'geometry-additive-angles';
                return;
            }

            // ===== VOLUME COMPOSITE (Grade 5) =====
            if (mappedSkill === "volume_composite") {
                const volDim = Math.max(3, Math.min(Math.ceil(Math.pow(range, 1 / 3)), 20));
                // Generate two rectangular prisms that join to form an L or step
                const compType = pick(["L", "step"]);

                let w1, h1, d1, w2, h2, d2, totalVol;
                if (compType === "L") {
                    // L-shape: bottom long prism + top short prism on one end
                    w1 = rng(3, volDim); h1 = rng(2, Math.max(2, volDim - 1)); d1 = rng(2, Math.max(2, volDim - 1));
                    w2 = rng(2, Math.max(2, Math.floor(w1 / 2) + 1)); h2 = rng(2, Math.max(2, volDim - 1)); d2 = d1;
                } else {
                    // Step: two prisms stacked at different heights
                    w1 = rng(3, volDim); h1 = rng(2, Math.max(2, volDim - 1)); d1 = rng(2, Math.max(2, volDim - 1));
                    w2 = rng(2, Math.max(2, w1 - 1)); h2 = rng(2, Math.max(2, volDim - 1)); d2 = d1;
                }
                const vol1 = w1 * h1 * d1;
                const vol2 = w2 * h2 * d2;
                totalVol = vol1 + vol2;

                q.text = `Find the total volume of this composite shape (two rectangular prisms joined together).`;
                q.ans = totalVol;
                q.answerType = "number";
                q.options = buildNumericOptions(totalVol);
                q.hint = `Break into two rectangular prisms. Volume 1 = ${w1} x ${h1} x ${d1} = ${vol1}. Volume 2 = ${w2} x ${h2} x ${d2} = ${vol2}. Total = ${vol1} + ${vol2} = ${totalVol}.`;

                // Isometric drawing — dynamically scaled to fill the SVG
                const b = { w: w1, h: d1, d: h1 };
                const t = { w: w2, h: d2, d: h2 };
                const tz = b.d; // z offset where top prism sits

                // Unit-space isometric projection (scale=1)
                const uX = (x, y, z) => (x - y) * 0.866;
                const uY = (x, y, z) => (x + y) * 0.5 - z;

                // Compute bounding box of all 16 vertices in unit space
                const allVerts = [
                    [0,0,0],[b.w,0,0],[b.w,b.h,0],[0,b.h,0],
                    [0,0,b.d],[b.w,0,b.d],[b.w,b.h,b.d],[0,b.h,b.d],
                    [0,0,tz],[t.w,0,tz],[t.w,t.h,tz],[0,t.h,tz],
                    [0,0,tz+t.d],[t.w,0,tz+t.d],[t.w,t.h,tz+t.d],[0,t.h,tz+t.d]
                ];
                let mnX = Infinity, mxX = -Infinity, mnY = Infinity, mxY = -Infinity;
                for (const [vx,vy,vz] of allVerts) {
                    const px = uX(vx,vy,vz), py = uY(vx,vy,vz);
                    mnX = Math.min(mnX, px); mxX = Math.max(mxX, px);
                    mnY = Math.min(mnY, py); mxY = Math.max(mxY, py);
                }
                const unitW = mxX - mnX;
                const unitH = mxY - mnY;

                // Scale to fill a 380x280 target, leaving 40px padding for labels
                const targetW = 300, targetH = 220;
                const scale = Math.min(targetW / unitW, targetH / unitH);
                const svgW = 380, svgH = 300;
                const ox = -mnX * scale + (svgW - unitW * scale) / 2;
                const oy = -mnY * scale + (svgH - unitH * scale) / 2;

                const isoX = (x, y, z) => Math.round((ox + uX(x,y,z) * scale) * 10) / 10;
                const isoY = (x, y, z) => Math.round((oy + uY(x,y,z) * scale) * 10) / 10;

                // Bottom prism faces
                const bFront = `M ${isoX(0,0,0)} ${isoY(0,0,0)} L ${isoX(b.w,0,0)} ${isoY(b.w,0,0)} L ${isoX(b.w,0,b.d)} ${isoY(b.w,0,b.d)} L ${isoX(0,0,b.d)} ${isoY(0,0,b.d)} Z`;
                const bRight = `M ${isoX(b.w,0,0)} ${isoY(b.w,0,0)} L ${isoX(b.w,b.h,0)} ${isoY(b.w,b.h,0)} L ${isoX(b.w,b.h,b.d)} ${isoY(b.w,b.h,b.d)} L ${isoX(b.w,0,b.d)} ${isoY(b.w,0,b.d)} Z`;
                const bTop = `M ${isoX(0,0,b.d)} ${isoY(0,0,b.d)} L ${isoX(b.w,0,b.d)} ${isoY(b.w,0,b.d)} L ${isoX(b.w,b.h,b.d)} ${isoY(b.w,b.h,b.d)} L ${isoX(0,b.h,b.d)} ${isoY(0,b.h,b.d)} Z`;

                // Top prism faces
                const tFront = `M ${isoX(0,0,tz)} ${isoY(0,0,tz)} L ${isoX(t.w,0,tz)} ${isoY(t.w,0,tz)} L ${isoX(t.w,0,tz+t.d)} ${isoY(t.w,0,tz+t.d)} L ${isoX(0,0,tz+t.d)} ${isoY(0,0,tz+t.d)} Z`;
                const tRight = `M ${isoX(t.w,0,tz)} ${isoY(t.w,0,tz)} L ${isoX(t.w,t.h,tz)} ${isoY(t.w,t.h,tz)} L ${isoX(t.w,t.h,tz+t.d)} ${isoY(t.w,t.h,tz+t.d)} L ${isoX(t.w,0,tz+t.d)} ${isoY(t.w,0,tz+t.d)} Z`;
                const tTop = `M ${isoX(0,0,tz+t.d)} ${isoY(0,0,tz+t.d)} L ${isoX(t.w,0,tz+t.d)} ${isoY(t.w,0,tz+t.d)} L ${isoX(t.w,t.h,tz+t.d)} ${isoY(t.w,t.h,tz+t.d)} L ${isoX(0,t.h,tz+t.d)} ${isoY(0,t.h,tz+t.d)} Z`;

                // Font size scales with the shape (min 13px, max 18px)
                const fontSize = Math.max(13, Math.min(18, Math.round(scale * 0.9)));
                const dimLabel = (x, y, text) => `<text x="${x}" y="${y}" text-anchor="middle" fill="var(--text-bright)" font-size="${fontSize}" font-weight="700">${text}</text>`;

                // Label offset scales with shape size
                const lOff = Math.max(16, Math.round(scale * 0.8));

                // Bottom prism labels
                const bLabelW = dimLabel(
                    (isoX(0, 0, 0) + isoX(b.w, 0, 0)) / 2,
                    (isoY(0, 0, 0) + isoY(b.w, 0, 0)) / 2 + lOff,
                    w1
                );
                const bLabelH = dimLabel(
                    isoX(b.w, b.h / 2, 0) + lOff,
                    isoY(b.w, b.h / 2, 0),
                    d1
                );
                const bLabelD = dimLabel(
                    isoX(0, 0, b.d / 2) - lOff,
                    isoY(0, 0, b.d / 2),
                    h1
                );

                // Top prism labels
                const tLabelW = dimLabel(
                    (isoX(0, 0, tz + t.d) + isoX(t.w, 0, tz + t.d)) / 2 - Math.round(lOff * 0.6),
                    (isoY(0, 0, tz + t.d) + isoY(t.w, 0, tz + t.d)) / 2 - Math.round(lOff * 0.4),
                    w2
                );
                const tLabelD = dimLabel(
                    isoX(0, 0, tz + t.d / 2) - lOff,
                    isoY(0, 0, tz + t.d / 2),
                    h2
                );

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">Composite Volume</div>
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
                        <!-- Bottom prism -->
                        <path d="${bFront}" fill="var(--accent-cyan)" fill-opacity="0.35" stroke="var(--accent-cyan)" stroke-width="2"/>
                        <path d="${bRight}" fill="var(--accent-cyan)" fill-opacity="0.25" stroke="var(--accent-cyan)" stroke-width="2"/>
                        <path d="${bTop}" fill="var(--accent-cyan)" fill-opacity="0.15" stroke="var(--accent-cyan)" stroke-width="2"/>
                        <!-- Top prism -->
                        <path d="${tFront}" fill="var(--accent-orange)" fill-opacity="0.35" stroke="var(--accent-orange)" stroke-width="2"/>
                        <path d="${tRight}" fill="var(--accent-orange)" fill-opacity="0.25" stroke="var(--accent-orange)" stroke-width="2"/>
                        <path d="${tTop}" fill="var(--accent-orange)" fill-opacity="0.15" stroke="var(--accent-orange)" stroke-width="2"/>
                        <!-- Labels -->
                        ${bLabelW}${bLabelH}${bLabelD}${tLabelW}${tLabelD}
                    </svg>
                    <div style="margin-top:6px;font-size:0.9rem;color:var(--text-dim);">
                        Find the volume of each prism, then add.
                    </div>
                    <div style="margin-top:8px;font-size:1.1rem;font-weight:600;">Total Volume = <span style="border-bottom:2px solid var(--accent-green);padding:0 18px;">?</span> cubic units</div>
                </div>`;
                q.skillLabel = 'Composite Vol';
                q.printFormat = 'geometry-volume-composite';
                return;
            }

            // Geometry Category
            const geoSkill = mappedSkill === "mixed" ? pick(["perimeter", "area", "area_perimeter", "composite_shapes", "area_word_problems", "perimeter_word_problems", "volume", "identify_angles", "measure_angles", "identify_lines", "symmetry", "coordinate_q1", "coordinate_all", "coordinate_graph", "classify_triangles", "classify_quads", "area_unit_squares", "perimeter_grid"]) : mappedSkill;

            // Scale geometry dimensions based on range (sqrt keeps answers reasonable)
            // range 10→5, 50→7, 100→10, 1000→32, 10000→50(cap)
            const maxDim = Math.max(5, Math.min(Math.ceil(Math.sqrt(range)), 50));

            if (geoSkill === "area_unit_squares") {
                // Area by counting unit squares - rectangles and L-shapes
                const ausShapeType = Math.random() < 0.6 ? 'rectangle' : 'L';
                const ausSqSize = 30;

                if (ausShapeType === 'rectangle') {
                    const ausW = rng(2, 8);
                    const ausH = rng(2, 6);
                    const ausArea = ausW * ausH;
                    q.ans = ausArea;
                    q.text = `Count the unit squares. What is the area?`;
                    q.hint = `Count each small square, or multiply: ${ausW} columns \u00D7 ${ausH} rows = ${ausArea} square units.`;

                    const ausSvgW = ausW * ausSqSize + 2;
                    const ausSvgH = ausH * ausSqSize + 2;
                    let ausSquares = '';
                    for (let ar = 0; ar < ausH; ar++) {
                        for (let ac = 0; ac < ausW; ac++) {
                            const ax = 1 + ac * ausSqSize;
                            const ay = 1 + ar * ausSqSize;
                            ausSquares += `<rect x="${ax}" y="${ay}" width="${ausSqSize}" height="${ausSqSize}" fill="var(--accent-cyan)" fill-opacity="0.3" stroke="var(--accent-green)" stroke-width="1.5"/>`;
                        }
                    }
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Area - Count Unit Squares</div>
                        <svg width="${ausSvgW}" height="${ausSvgH}" viewBox="0 0 ${ausSvgW} ${ausSvgH}" style="max-width:100%;">
                            ${ausSquares}
                        </svg>
                        <div style="margin-top:10px;font-size:1.1rem;">Area = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> square units</div>
                    </div>`;
                } else {
                    // L-shape: full rectangle minus a corner rectangle
                    const ausFullW = rng(4, 7);
                    const ausFullH = rng(4, 6);
                    const ausCutW = rng(1, ausFullW - 2);
                    const ausCutH = rng(1, ausFullH - 2);
                    const ausArea = ausFullW * ausFullH - ausCutW * ausCutH;
                    q.ans = ausArea;
                    q.text = `Count the unit squares. What is the area of this L-shape?`;
                    q.hint = `Full rectangle: ${ausFullW}\u00D7${ausFullH} = ${ausFullW * ausFullH}. Removed corner: ${ausCutW}\u00D7${ausCutH} = ${ausCutW * ausCutH}. Area = ${ausFullW * ausFullH} - ${ausCutW * ausCutH} = ${ausArea}.`;

                    const ausSvgW = ausFullW * ausSqSize + 2;
                    const ausSvgH = ausFullH * ausSqSize + 2;
                    let ausSquares = '';
                    for (let ar = 0; ar < ausFullH; ar++) {
                        for (let ac = 0; ac < ausFullW; ac++) {
                            // Remove top-right corner
                            if (ar < ausCutH && ac >= ausFullW - ausCutW) continue;
                            const ax = 1 + ac * ausSqSize;
                            const ay = 1 + ar * ausSqSize;
                            ausSquares += `<rect x="${ax}" y="${ay}" width="${ausSqSize}" height="${ausSqSize}" fill="var(--accent-cyan)" fill-opacity="0.3" stroke="var(--accent-green)" stroke-width="1.5"/>`;
                        }
                    }
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Area - Count Unit Squares</div>
                        <svg width="${ausSvgW}" height="${ausSvgH}" viewBox="0 0 ${ausSvgW} ${ausSvgH}" style="max-width:100%;">
                            ${ausSquares}
                        </svg>
                        <div style="margin-top:10px;font-size:1.1rem;">Area = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> square units</div>
                    </div>`;
                }
                q.answerType = "number";
                q.options = buildNumericOptions(q.ans);
                q.printFormat = 'area-unit-squares';
                q.skillLabel = 'Unit Squares';
            } else if (geoSkill === "perimeter_grid") {
                // Perimeter on a grid - rectangles and L-shapes
                const pgSqSize = 30;
                const pgShapeType = Math.random() < 0.6 ? 'rectangle' : 'L';

                if (pgShapeType === 'rectangle') {
                    const pgW = rng(2, 8);
                    const pgH = rng(2, 6);
                    const pgPerimeter = 2 * (pgW + pgH);
                    q.ans = pgPerimeter;
                    q.text = `Count the outside edges. What is the perimeter?`;
                    q.hint = `Perimeter = 2 \u00D7 (width + height) = 2 \u00D7 (${pgW} + ${pgH}) = ${pgPerimeter} units.`;

                    const pgSvgW = pgW * pgSqSize + 2;
                    const pgSvgH = pgH * pgSqSize + 2;
                    let pgSquares = '';
                    for (let pr = 0; pr < pgH; pr++) {
                        for (let pc = 0; pc < pgW; pc++) {
                            const px = 1 + pc * pgSqSize;
                            const py = 1 + pr * pgSqSize;
                            pgSquares += `<rect x="${px}" y="${py}" width="${pgSqSize}" height="${pgSqSize}" fill="var(--accent-cyan)" fill-opacity="0.15" stroke="#ccc" stroke-width="0.5"/>`;
                        }
                    }
                    // Highlight perimeter
                    const pgOutline = `<rect x="1" y="1" width="${pgW * pgSqSize}" height="${pgH * pgSqSize}" fill="none" stroke="var(--accent-orange)" stroke-width="3"/>`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Count Edges</div>
                        <svg width="${pgSvgW}" height="${pgSvgH}" viewBox="0 0 ${pgSvgW} ${pgSvgH}" style="max-width:100%;">
                            ${pgSquares}
                            ${pgOutline}
                        </svg>
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--text-bright);">Each square side = 1 unit</div>
                        <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                    </div>`;
                } else {
                    // L-shape perimeter
                    const pgFullW = rng(4, 7);
                    const pgFullH = rng(4, 6);
                    const pgCutW = rng(1, pgFullW - 2);
                    const pgCutH = rng(1, pgFullH - 2);
                    // Perimeter of L-shape = perimeter of full rect + 2*(cutW + cutH) - 2*(cutW + cutH) ...
                    // Actually: walk the boundary. For top-right corner cut:
                    // Bottom: pgFullW, Right side bottom part: pgFullH - pgCutH,
                    // Horizontal step in: pgCutW, Vertical step up: pgCutH,
                    // Top remaining: pgFullW - pgCutW, Left: pgFullH
                    const pgPerimeter = pgFullW + (pgFullH - pgCutH) + pgCutW + pgCutH + (pgFullW - pgCutW) + pgFullH;
                    q.ans = pgPerimeter;
                    q.text = `Count the outside edges of this L-shape. What is the perimeter?`;
                    q.hint = `Walk around the outside and count each unit edge. The perimeter is ${pgPerimeter} units.`;

                    const pgSvgW = pgFullW * pgSqSize + 2;
                    const pgSvgH = pgFullH * pgSqSize + 2;
                    let pgSquares = '';
                    for (let pr = 0; pr < pgFullH; pr++) {
                        for (let pc = 0; pc < pgFullW; pc++) {
                            if (pr < pgCutH && pc >= pgFullW - pgCutW) continue;
                            const px = 1 + pc * pgSqSize;
                            const py = 1 + pr * pgSqSize;
                            pgSquares += `<rect x="${px}" y="${py}" width="${pgSqSize}" height="${pgSqSize}" fill="var(--accent-cyan)" fill-opacity="0.15" stroke="#ccc" stroke-width="0.5"/>`;
                        }
                    }
                    // Draw L-shape outline path
                    const pgOx = 1, pgOy = 1;
                    const pgPath = `M ${pgOx} ${pgOy + pgCutH * pgSqSize} L ${pgOx} ${pgOy + pgFullH * pgSqSize} L ${pgOx + pgFullW * pgSqSize} ${pgOy + pgFullH * pgSqSize} L ${pgOx + pgFullW * pgSqSize} ${pgOy} L ${pgOx + (pgFullW - pgCutW) * pgSqSize} ${pgOy} L ${pgOx + (pgFullW - pgCutW) * pgSqSize} ${pgOy + pgCutH * pgSqSize} Z`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Count Edges</div>
                        <svg width="${pgSvgW}" height="${pgSvgH}" viewBox="0 0 ${pgSvgW} ${pgSvgH}" style="max-width:100%;">
                            ${pgSquares}
                            <path d="${pgPath}" fill="none" stroke="var(--accent-orange)" stroke-width="3"/>
                        </svg>
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--text-bright);">Each square side = 1 unit</div>
                        <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                    </div>`;
                }
                q.answerType = "number";
                q.options = buildNumericOptions(q.ans);
                q.printFormat = 'perimeter-grid';
                q.skillLabel = 'Perim Grid';
            } else if (geoSkill === "perimeter") {
                // Perimeter
                const shapeType = pick(["rectangle", "square"]);
                if (shapeType === "rectangle") {
                    const length = rng(3, maxDim);
                    const width = rng(2, Math.min(length - 1, maxDim - 1));
                    const perimeter = 2 * (length + width);
                    q.ans = perimeter;
                    q.text = `Find the perimeter of a rectangle: length = ${length}, width = ${width}`;
                    q.hint = `Perimeter = 2 × (length + width) = 2 × (${length} + ${width})`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter</div>
                        <svg width="200" height="140" viewBox="0 0 200 140">
                            <rect x="30" y="20" width="140" height="90" fill="none" stroke="var(--accent-cyan)" stroke-width="3"/>
                            <text x="100" y="12" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${length}</text>
                            <text x="100" y="125" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${length}</text>
                            <text x="15" y="70" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${width}</text>
                            <text x="185" y="70" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${width}</text>
                        </svg>
                        <div style="margin-top:10px;">P = 2(l + w) = 2(${length} + ${width}) = <span style="border-bottom:2px solid var(--accent-green);padding:0 10px;">?</span></div>
                    </div>`;
                    q.geometryData = { shape: 'rectangle', length, width, perimeter };
                } else {
                    const side = rng(3, maxDim);
                    const perimeter = 4 * side;
                    q.ans = perimeter;
                    q.text = `Find the perimeter of a square with side = ${side}`;
                    q.hint = `Perimeter of square = 4 × side = 4 × ${side}`;

                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter</div>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <rect x="30" y="30" width="100" height="100" fill="none" stroke="var(--accent-cyan)" stroke-width="3"/>
                            <text x="80" y="22" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${side}</text>
                            <text x="15" y="85" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${side}</text>
                        </svg>
                        <div style="margin-top:10px;">P = 4s = 4 × ${side} = <span style="border-bottom:2px solid var(--accent-green);padding:0 10px;">?</span></div>
                    </div>`;
                    q.geometryData = { shape: 'square', side, perimeter };
                }
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "geometry-perimeter";
            } else if (geoSkill === "area") {
                // Area
                const shapeType = pick(["rectangle", "square", "triangle"]);
                let shapeSVG = '';

                if (shapeType === "rectangle") {
                    const length = rng(3, maxDim);
                    const width = rng(2, Math.max(2, maxDim - 2));
                    const area = length * width;
                    q.ans = area;
                    q.text = `Find the area of a rectangle: length = ${length}, width = ${width}`;
                    q.hint = `Area = length × width = ${length} × ${width}`;
                    q.geometryData = { shape: 'rectangle', length, width, area };
                    shapeSVG = createRectangleSVG(length, width, true, false);
                } else if (shapeType === "square") {
                    const side = rng(2, maxDim);
                    const area = side * side;
                    q.ans = area;
                    q.text = `Find the area of a square with side = ${side}`;
                    q.hint = `Area = side × side = ${side} × ${side}`;
                    q.geometryData = { shape: 'square', side, area };
                    shapeSVG = createSquareSVG(side, true, false);
                } else {
                    const base = rng(4, maxDim);
                    const height = rng(2, Math.max(2, maxDim - 2));
                    const area = (base * height) / 2;
                    q.ans = area;
                    q.text = `Find the area of a triangle: base = ${base}, height = ${height}`;
                    q.hint = `Area = ½ × base × height = ½ × ${base} × ${height}`;
                    q.geometryData = { shape: 'triangle', base, height, area };
                    shapeSVG = createTriangleSVG('default', base, height, true, false);
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Area</div>
                    ${shapeSVG}
                    <div style="font-size:1.2rem;margin:15px 0;">Area = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> square units</div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.printFormat = "geometry-area";
            } else if (geoSkill === "volume") {
                // Volume of rectangular prism - use cube root for 3D scaling
                const volDim = Math.max(3, Math.min(Math.ceil(Math.pow(range, 1/3)), 30));
                const length = rng(2, volDim);
                const width = rng(2, Math.max(2, volDim - 1));
                const height = rng(2, Math.max(2, volDim - 1));
                const volume = length * width * height;

                q.ans = volume;
                q.text = `Find the volume: length = ${length}, width = ${width}, height = ${height}`;
                q.hint = `Volume = length × width × height = ${length} × ${width} × ${height}`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Volume</div>
                    ${create3DBoxSVG(length, width, height, false)}
                    <div style="font-size:1.1rem;margin-top:10px;">V = l × w × h = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> cubic units</div>
                </div>`;
                q.options = buildNumericOptions(volume);
                q.geometryData = { length, width, height, volume };
                q.printFormat = "geometry-volume";
            } else if (geoSkill === "identify_angles") {
                // Identify angles
                const angleTypes = [
                    { name: "acute", range: [20, 80], desc: "less than 90°" },
                    { name: "right", range: [90, 90], desc: "exactly 90°" },
                    { name: "obtuse", range: [100, 170], desc: "between 90° and 180°" },
                    { name: "straight", range: [180, 180], desc: "exactly 180°" }
                ];
                const angleType = pick(angleTypes);
                const angle = angleType.range[0] === angleType.range[1] ? angleType.range[0] : rng(angleType.range[0], angleType.range[1]);

                q.text = `What type of angle is this?`;
                q.ans = angleType.name.charAt(0).toUpperCase() + angleType.name.slice(1);
                q.answerType = "choice";
                q.options = ["Acute", "Right", "Obtuse", "Straight"];
                q.hint = `Acute < 90° | Right = 90° | Obtuse: 90°-180° | Straight = 180°`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Identify This Angle</div>
                    ${createAngleSVG(angle, 140, true, false)}
                    <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:10px;">
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Acute < 90°</div>
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Right = 90°</div>
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Obtuse 90°-180°</div>
                        <div style="padding:8px 12px;background:var(--bg-card);border-radius:6px;font-size:0.85rem;">Straight = 180°</div>
                    </div>
                </div>`;
                q.geometryData = { angle, type: angleType.name };
                q.printFormat = "geometry-angles";
            } else if (geoSkill === "measure_angles") {
                // Measure/estimate angles
                const angles = [30, 45, 60, 90, 120, 135, 150];
                const angle = pick(angles);

                q.ans = angle;
                q.text = `What is the measure of this angle in degrees?`;
                q.hint = `Compare to known angles: 90° is a right angle, 45° is half of that, 180° is a straight line`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Measure This Angle</div>
                    ${createAngleSVG(angle, 160, false, false)}
                    <div style="margin-top:10px;font-size:1.2rem;">? degrees</div>
                    <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:10px;font-size:0.85rem;color:var(--text-dim);">
                        <span>Reference: 45° | 90° | 135° | 180°</span>
                    </div>
                </div>`;
                q.options = [30, 45, 60, 90, 120, 135, 150].filter(a => Math.abs(a - angle) <= 30 || a === angle);
                if (!q.options.includes(angle)) q.options.push(angle);
                q.options = [...new Set(q.options)].sort((a, b) => a - b).slice(0, 4);
                q.geometryData = { angle };
                q.printFormat = "geometry-measure-angle";
            } else if (geoSkill === "identify_lines") {
                // Identify lines - with clean, standardized visuals
                const lineTypes = ["parallel", "perpendicular", "intersecting"];
                const lineType = pick(lineTypes);

                // Randomly choose line style: lines (arrows both ends), rays (one arrow), segments (dots)
                const lineStyles = ["lines", "rays", "segments"];
                const lineStyle = pick(lineStyles);

                // Random orientation variation
                const orientations = ["horizontal", "diagonal1", "diagonal2", "vertical"];
                const orientation = pick(orientations);

                q.text = `What type of lines are shown?`;
                q.ans = lineType.charAt(0).toUpperCase() + lineType.slice(1);
                q.answerType = "choice";
                q.options = ["Parallel", "Perpendicular", "Intersecting"];
                q.hint = `Parallel lines never meet (∥), Perpendicular lines form 90° angles (⊥), Intersecting lines cross at a point`;

                // === STANDARDIZED VISUAL CONSTANTS ===
                const STROKE_WIDTH = 2;           // Consistent line weight
                const STROKE_COLOR = '#4a9eff';   // Clean blue color
                const ARROW_SIZE = 6;             // Small, proportional arrowheads
                const ENDPOINT_RADIUS = 3;        // Uniform endpoint dots
                const MARKER_COLOR = '#22c55e';   // Green for right angle/parallel markers
                const MARKER_WIDTH = 1.5;         // Thin marker lines

                // SVG viewBox centered at 80,50 with padding
                const svgWidth = 160;
                const svgHeight = 100;
                const cx = 80;  // Center x
                const cy = 50;  // Center y

                // Clean arrow markers with smaller, proportional heads
                const arrowMarker = `<defs>
                    <marker id="arrow-end" markerWidth="${ARROW_SIZE}" markerHeight="${ARROW_SIZE}" refX="${ARROW_SIZE - 1}" refY="${ARROW_SIZE/2}" orient="auto">
                        <path d="M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE/2} L 0 ${ARROW_SIZE}" fill="none" stroke="${STROKE_COLOR}" stroke-width="1.5" stroke-linejoin="round"/>
                    </marker>
                    <marker id="arrow-start" markerWidth="${ARROW_SIZE}" markerHeight="${ARROW_SIZE}" refX="1" refY="${ARROW_SIZE/2}" orient="auto-start-reverse">
                        <path d="M ${ARROW_SIZE} 0 L 0 ${ARROW_SIZE/2} L ${ARROW_SIZE} ${ARROW_SIZE}" fill="none" stroke="${STROKE_COLOR}" stroke-width="1.5" stroke-linejoin="round"/>
                    </marker>
                </defs>`;

                // Helper for clean endpoint dots
                const endpoint = (x, y) => `<circle cx="${x}" cy="${y}" r="${ENDPOINT_RADIUS}" fill="${STROKE_COLOR}"/>`;

                // Build line attributes based on style
                let lineAttrs = `stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round"`;
                if (lineStyle === "lines") {
                    lineAttrs += ' marker-end="url(#arrow-end)" marker-start="url(#arrow-start)"';
                } else if (lineStyle === "rays") {
                    lineAttrs += ' marker-end="url(#arrow-end)"';
                }

                let linesSvg = arrowMarker;
                let endpoints = '';
                let markers = ''; // For parallel/perpendicular indicators

                // Standard line length for consistency
                const lineLen = 55;
                const gap = 28; // Gap between parallel lines

                if (lineType === "parallel") {
                    if (orientation === "horizontal") {
                        // Two horizontal parallel lines, centered
                        const y1 = cy - gap/2;
                        const y2 = cy + gap/2;
                        const x1 = cx - lineLen/2;
                        const x2 = cx + lineLen/2;

                        linesSvg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y1}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${x1}" y1="${y2}" x2="${x2}" y2="${y2}" ${lineAttrs}/>`;

                        if (lineStyle === "segments") {
                            endpoints = endpoint(x1, y1) + endpoint(x2, y1) + endpoint(x1, y2) + endpoint(x2, y2);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(x1, y1) + endpoint(x1, y2);
                        }

                        // Parallel tick marks (small diagonal lines)
                        const tickX = cx;
                        markers = `<line x1="${tickX-3}" y1="${y1-4}" x2="${tickX+3}" y2="${y1+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${tickX+5}" y1="${y1-4}" x2="${tickX+11}" y2="${y1+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${tickX-3}" y1="${y2-4}" x2="${tickX+3}" y2="${y2+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${tickX+5}" y1="${y2-4}" x2="${tickX+11}" y2="${y2+4}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;

                    } else if (orientation === "vertical") {
                        // Two vertical parallel lines, centered
                        const x1 = cx - gap/2;
                        const x2 = cx + gap/2;
                        const y1 = cy - lineLen/2;
                        const y2 = cy + lineLen/2;

                        linesSvg += `<line x1="${x1}" y1="${y1}" x2="${x1}" y2="${y2}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${x2}" y1="${y1}" x2="${x2}" y2="${y2}" ${lineAttrs}/>`;

                        if (lineStyle === "segments") {
                            endpoints = endpoint(x1, y1) + endpoint(x1, y2) + endpoint(x2, y1) + endpoint(x2, y2);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(x1, y2) + endpoint(x2, y2);
                        }

                        // Parallel tick marks
                        const tickY = cy;
                        markers = `<line x1="${x1-4}" y1="${tickY-3}" x2="${x1+4}" y2="${tickY+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${x1-4}" y1="${tickY+5}" x2="${x1+4}" y2="${tickY+11}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${x2-4}" y1="${tickY-3}" x2="${x2+4}" y2="${tickY+3}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <line x1="${x2-4}" y1="${tickY+5}" x2="${x2+4}" y2="${tickY+11}" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;

                    } else {
                        // Diagonal parallel lines
                        const angle = orientation === "diagonal1" ? 25 : -25;
                        const rad = angle * Math.PI / 180;
                        const dx = lineLen * Math.cos(rad) / 2;
                        const dy = lineLen * Math.sin(rad) / 2;

                        // Perpendicular offset for second line
                        const offsetX = gap * Math.sin(rad) * (angle > 0 ? -1 : 1);
                        const offsetY = gap * Math.cos(rad);

                        linesSvg += `<line x1="${cx - dx}" y1="${cy - dy - offsetY/2}" x2="${cx + dx}" y2="${cy + dy - offsetY/2}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx - dx}" y1="${cy - dy + offsetY/2}" x2="${cx + dx}" y2="${cy + dy + offsetY/2}" ${lineAttrs}/>`;

                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - dx, cy - dy - offsetY/2) + endpoint(cx + dx, cy + dy - offsetY/2) +
                                       endpoint(cx - dx, cy - dy + offsetY/2) + endpoint(cx + dx, cy + dy + offsetY/2);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - dx, cy - dy - offsetY/2) + endpoint(cx - dx, cy - dy + offsetY/2);
                        }
                    }

                } else if (lineType === "perpendicular") {
                    if (orientation === "horizontal" || orientation === "vertical") {
                        // Standard perpendicular (one horizontal, one vertical) centered
                        const halfLen = lineLen / 2;

                        linesSvg += `<line x1="${cx - halfLen}" y1="${cy}" x2="${cx + halfLen}" y2="${cy}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx}" y1="${cy - halfLen}" x2="${cx}" y2="${cy + halfLen}" ${lineAttrs}/>`;

                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - halfLen, cy) + endpoint(cx + halfLen, cy) +
                                       endpoint(cx, cy - halfLen) + endpoint(cx, cy + halfLen);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - halfLen, cy) + endpoint(cx, cy + halfLen);
                        }

                        // Right angle square marker (small, precise)
                        const sq = 8;
                        markers = `<path d="M ${cx + sq} ${cy} L ${cx + sq} ${cy - sq} L ${cx} ${cy - sq}" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>`;

                    } else {
                        // Rotated perpendicular (45 degrees)
                        const halfLen = lineLen / 2;
                        const diag = halfLen * 0.707; // cos(45°) = sin(45°) ≈ 0.707

                        linesSvg += `<line x1="${cx - diag}" y1="${cy - diag}" x2="${cx + diag}" y2="${cy + diag}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx + diag}" y1="${cy - diag}" x2="${cx - diag}" y2="${cy + diag}" ${lineAttrs}/>`;

                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - diag, cy - diag) + endpoint(cx + diag, cy + diag) +
                                       endpoint(cx + diag, cy - diag) + endpoint(cx - diag, cy + diag);
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - diag, cy - diag) + endpoint(cx + diag, cy - diag);
                        }

                        // Rotated right angle marker
                        const sq = 7;
                        markers = `<path d="M ${cx + sq} ${cy} L ${cx} ${cy - sq}" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}"/>
                                  <path d="M ${cx} ${cy - sq} L ${cx - sq} ${cy}" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}" stroke-dasharray="0"/>
                                  <rect x="${cx - 3}" y="${cy - 3}" width="6" height="6" fill="none" stroke="${MARKER_COLOR}" stroke-width="${MARKER_WIDTH}" transform="rotate(45, ${cx}, ${cy})"/>`;
                    }

                } else {
                    // Intersecting (not perpendicular) - cross at non-90° angle
                    if (orientation === "diagonal1" || orientation === "diagonal2") {
                        // X-shape intersection
                        const angle1 = 30;
                        const angle2 = -50;
                        const rad1 = angle1 * Math.PI / 180;
                        const rad2 = angle2 * Math.PI / 180;
                        const halfLen = lineLen / 2;

                        linesSvg += `<line x1="${cx - halfLen * Math.cos(rad1)}" y1="${cy - halfLen * Math.sin(rad1)}"
                                          x2="${cx + halfLen * Math.cos(rad1)}" y2="${cy + halfLen * Math.sin(rad1)}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx - halfLen * Math.cos(rad2)}" y1="${cy - halfLen * Math.sin(rad2)}"
                                          x2="${cx + halfLen * Math.cos(rad2)}" y2="${cy + halfLen * Math.sin(rad2)}" ${lineAttrs}/>`;

                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - halfLen * Math.cos(rad1), cy - halfLen * Math.sin(rad1)) +
                                       endpoint(cx + halfLen * Math.cos(rad1), cy + halfLen * Math.sin(rad1)) +
                                       endpoint(cx - halfLen * Math.cos(rad2), cy - halfLen * Math.sin(rad2)) +
                                       endpoint(cx + halfLen * Math.cos(rad2), cy + halfLen * Math.sin(rad2));
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - halfLen * Math.cos(rad1), cy - halfLen * Math.sin(rad1)) +
                                       endpoint(cx - halfLen * Math.cos(rad2), cy - halfLen * Math.sin(rad2));
                        }

                    } else {
                        // One horizontal, one diagonal
                        const halfLen = lineLen / 2;
                        const angle = 55;
                        const rad = angle * Math.PI / 180;

                        linesSvg += `<line x1="${cx - halfLen}" y1="${cy}" x2="${cx + halfLen}" y2="${cy}" ${lineAttrs}/>`;
                        linesSvg += `<line x1="${cx - halfLen * Math.cos(rad)}" y1="${cy + halfLen * Math.sin(rad)}"
                                          x2="${cx + halfLen * Math.cos(rad)}" y2="${cy - halfLen * Math.sin(rad)}" ${lineAttrs}/>`;

                        if (lineStyle === "segments") {
                            endpoints = endpoint(cx - halfLen, cy) + endpoint(cx + halfLen, cy) +
                                       endpoint(cx - halfLen * Math.cos(rad), cy + halfLen * Math.sin(rad)) +
                                       endpoint(cx + halfLen * Math.cos(rad), cy - halfLen * Math.sin(rad));
                        } else if (lineStyle === "rays") {
                            endpoints = endpoint(cx - halfLen, cy) +
                                       endpoint(cx - halfLen * Math.cos(rad), cy + halfLen * Math.sin(rad));
                        }
                    }
                }

                // Add endpoints and markers
                linesSvg += endpoints + markers;

                // Line style label
                const styleLabel = lineStyle === "lines" ? "Lines" : lineStyle === "rays" ? "Rays" : "Line Segments";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:12px;color:var(--accent-purple);font-size:0.95rem;">Identify These ${styleLabel}</div>
                    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;">${linesSvg}</svg>
                </div>`;
                q.geometryData = { lineType, lineStyle, orientation };
                q.printFormat = "geometry-lines";
            } else if (geoSkill === "symmetry") {
                // Lines of symmetry
                const shapes = [
                    { name: "square", lines: 4 },
                    { name: "rectangle", lines: 2 },
                    { name: "equilateral triangle", lines: 3 },
                    { name: "isosceles triangle", lines: 1 },
                    { name: "regular hexagon", lines: 6 }
                ];
                const shape = pick(shapes);

                q.text = `How many lines of symmetry does this shape have?`;
                q.ans = shape.lines;
                q.hint = `A line of symmetry divides a shape into two identical halves. This is a ${shape.name}.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Lines of Symmetry</div>
                    ${createShapeSVG(shape.name, false)}
                    <div style="margin-top:10px;font-size:1.1rem;text-transform:capitalize;font-weight:600;">${shape.name}</div>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-top:5px;">Count the lines that divide this shape into matching halves</div>
                </div>`;
                q.options = buildNumericOptions(shape.lines);
                q.geometryData = { shape: shape.name, lines: shape.lines };
                q.printFormat = "geometry-symmetry";
            } else if (geoSkill === "coordinate_graph" || geoSkill === "coordinate_q1" || geoSkill === "coordinate_all") {
                // Coordinate graphing with multiple modes
                // Determine quadrant mode based on skill selection
                let quadrantMode;
                if (geoSkill === "coordinate_q1") {
                    quadrantMode = "quadrant1";
                } else if (geoSkill === "coordinate_all") {
                    quadrantMode = "all_quadrants";
                } else {
                    // Mixed - random
                    quadrantMode = pick(["quadrant1", "all_quadrants"]);
                }
                const problemType = pick(["identify", "plot"]);
                const numPoints = rng(1, 3);

                // Scale coordinate bounds with state.range
                const maxCoordQ1 = Math.min(Math.max(10, Math.floor(state.range / 10)), 20);
                const maxCoordAll = Math.min(Math.max(5, Math.floor(state.range / 20)), 10);

                // Generate points based on quadrant mode
                const points = [];
                const usedCoords = new Set();
                for (let p = 0; p < numPoints; p++) {
                    let x, y;
                    do {
                        if (quadrantMode === "quadrant1") {
                            x = rng(1, maxCoordQ1);
                            y = rng(1, maxCoordQ1);
                        } else {
                            x = rng(-maxCoordAll, maxCoordAll);
                            y = rng(-maxCoordAll, maxCoordAll);
                        }
                    } while (usedCoords.has(`${x},${y}`) || (x === 0 && y === 0));
                    usedCoords.add(`${x},${y}`);
                    points.push({ x, y, label: String.fromCharCode(65 + p) }); // A, B, C
                }

                // Build answers
                const answers = points.map(p => `(${p.x}, ${p.y})`);
                q.ans = answers.join(', ');
                q.answerType = "coordinate-multi";
                q.coordinateData = { points, quadrantMode, problemType };

                // Grid setup based on quadrant mode - scale spacing to fit maxCoord
                const maxCoord = quadrantMode === "quadrant1" ? maxCoordQ1 : maxCoordAll;
                const gridSpacing = Math.max(12, Math.floor(200 / maxCoord));
                const gridSize = quadrantMode === "quadrant1" ? maxCoord * gridSpacing + 40 : maxCoord * 2 * gridSpacing + 40;
                const origin = quadrantMode === "quadrant1" ? { x: 20, y: gridSize - 20 } : { x: gridSize / 2, y: gridSize / 2 };
                // Label every N ticks to avoid crowding
                const labelStep = maxCoord > 12 ? 4 : maxCoord > 8 ? 2 : 2;
                const labelFontSize = maxCoord > 12 ? 8 : 10;

                // Build SVG grid
                let gridLines = '';
                let axisLabels = '';

                if (quadrantMode === "quadrant1") {
                    // Quadrant 1 only - positive x and y
                    for (let i = 0; i <= maxCoord; i++) {
                        gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#ddd" stroke-width="1"/>`;
                        gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#ddd" stroke-width="1"/>`;
                        if (i % labelStep === 0) {
                            axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 15}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize}">${i}</text>`;
                            if (i > 0) axisLabels += `<text x="${origin.x - 12}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize}">${i}</text>`;
                        }
                    }
                } else {
                    // All quadrants
                    for (let i = -maxCoord; i <= maxCoord; i++) {
                        gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#ddd" stroke-width="1"/>`;
                        gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#ddd" stroke-width="1"/>`;
                        if (i % labelStep === 0 || i === 0) {
                            axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 15}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize - 1}">${i}</text>`;
                            if (i !== 0) axisLabels += `<text x="${origin.x - 12}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize - 1}">${i}</text>`;
                        }
                    }
                }

                // Build points SVG (for identify mode) or empty circles (for plot mode)
                let pointsSVG = '';
                points.forEach((p, idx) => {
                    const px = origin.x + p.x * gridSpacing;
                    const py = origin.y - p.y * gridSpacing;
                    const colors = ['#e53935', '#43a047', '#1e88e5'];
                    if (problemType === "identify") {
                        // Show the points, student identifies coordinates
                        pointsSVG += `<circle cx="${px}" cy="${py}" r="7" fill="${colors[idx]}"/>`;
                        // Position label to not overlap with point - offset based on quadrant
                        const labelOffsetX = p.x >= 0 ? 12 : -12;
                        const labelOffsetY = p.y >= 0 ? -10 : 15;
                        pointsSVG += `<text x="${px + labelOffsetX}" y="${py + labelOffsetY}" fill="${colors[idx]}" font-size="14" font-weight="bold" text-anchor="${p.x >= 0 ? 'start' : 'end'}">${p.label}</text>`;
                    } else {
                        // Plot mode - show empty target circles
                        pointsSVG += `<circle cx="${px}" cy="${py}" r="8" fill="none" stroke="${colors[idx]}" stroke-width="2" stroke-dasharray="4,2"/>`;
                        pointsSVG += `<text x="${px + 12}" y="${py - 8}" fill="${colors[idx]}" font-size="12" font-weight="bold">${p.label}</text>`;
                    }
                });

                // Build answer input area
                let answerInputs = '';
                if (problemType === "identify") {
                    q.text = numPoints === 1
                        ? `What are the coordinates of point ${points[0].label}?`
                        : `What are the coordinates of each point?`;
                    q.hint = `Read the x-coordinate (horizontal) first, then y-coordinate (vertical). Format: (x, y)`;

                    answerInputs = `<div style="margin-top:15px;text-align:left;max-width:280px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:10px;padding:8px;background:var(--bg-card);border-radius:6px;">
                            <strong>Format:</strong> (x, y) &nbsp; Example: (3, 5)
                        </div>
                        ${points.map((p, idx) => `
                            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                                <span style="font-weight:700;color:${['#e53935', '#43a047', '#1e88e5'][idx]};min-width:20px;">${p.label}:</span>
                                <input type="text" id="coordInput_${idx}" class="coord-answer-input" placeholder="(x, y)"
                                    style="flex:1;padding:10px;border:2px solid var(--border-light);border-radius:8px;font-size:1rem;background:var(--bg-card);">
                            </div>
                        `).join('')}
                    </div>`;
                } else {
                    // Plot mode
                    const coordList = points.map(p => `${p.label}: (${p.x}, ${p.y})`).join(', ');
                    q.text = numPoints === 1
                        ? `Plot point ${points[0].label} at (${points[0].x}, ${points[0].y})`
                        : `Plot these points: ${coordList}`;
                    q.hint = `Find the x-value on the horizontal axis, then go up/down to the y-value. Mark each point with a dot.`;

                    answerInputs = `<div style="margin-top:15px;text-align:center;">
                        <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">
                            Points to plot: <strong>${coordList}</strong>
                        </div>
                        <div style="font-size:0.85rem;color:var(--text-dim);padding:8px;background:var(--bg-card);border-radius:6px;display:inline-block;">
                            Find x on horizontal axis, then move up/down to y
                        </div>
                    </div>`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Coordinate ${quadrantMode === "quadrant1" ? "(Quadrant I)" : "(All Quadrants)"}</div>
                    <svg width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                        ${gridLines}
                        <!-- Axes -->
                        <line x1="${quadrantMode === "quadrant1" ? origin.x : 10}" y1="${origin.y}" x2="${gridSize - 10}" y2="${origin.y}" stroke="currentColor" stroke-width="2"/>
                        <line x1="${origin.x}" y1="${quadrantMode === "quadrant1" ? gridSize - 10 : 10}" x2="${origin.x}" y2="10" stroke="currentColor" stroke-width="2"/>
                        <!-- Axis labels -->
                        ${axisLabels}
                        <text x="${gridSize - 8}" y="${origin.y - 8}" fill="currentColor" font-size="12" font-weight="bold">x</text>
                        <text x="${origin.x + 8}" y="18" fill="currentColor" font-size="12" font-weight="bold">y</text>
                        <!-- Points -->
                        ${pointsSVG}
                    </svg>
                    ${answerInputs}
                </div>`;
                q.geometryData = { points, quadrantMode, problemType, mode: problemType };
                q.printFormat = "geometry-coordinates";
            } else if (geoSkill === "classify_triangles") {
                // Classify triangles
                const types = [
                    { name: "equilateral", desc: "3 equal sides, 3 equal angles (60°)" },
                    { name: "isosceles", desc: "2 equal sides, 2 equal angles" },
                    { name: "scalene", desc: "no equal sides, no equal angles" },
                    { name: "right", desc: "one 90° angle" },
                    { name: "acute", desc: "all angles less than 90°" },
                    { name: "obtuse", desc: "one angle greater than 90°" }
                ];
                const byWhat = pick(["sides", "angles"]);
                const triType = byWhat === "sides" ? pick(types.slice(0, 3)) : pick(types.slice(3));

                q.text = `What type of triangle is shown?`;
                q.ans = triType.name.charAt(0).toUpperCase() + triType.name.slice(1);
                q.answerType = "choice";
                q.options = byWhat === "sides" ? ["Equilateral", "Isosceles", "Scalene"] : ["Right", "Acute", "Obtuse"];
                q.hint = `${triType.name.charAt(0).toUpperCase() + triType.name.slice(1)}: ${triType.desc}`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Classify This Triangle</div>
                    ${createTriangleSVG(triType.name, 0, 0, false, false)}
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">
                        Classify by ${byWhat}: ${byWhat === "sides" ? "equal sides count" : "angle types"}
                    </div>
                </div>`;
                q.geometryData = { triType: triType.name, byWhat };
                q.printFormat = "geometry-triangles";
            } else if (geoSkill === "classify_quads") {
                // Classify quadrilaterals
                const quads = [
                    { name: "square", desc: "4 equal sides, 4 right angles" },
                    { name: "rectangle", desc: "opposite sides equal, 4 right angles" },
                    { name: "rhombus", desc: "4 equal sides, opposite angles equal" },
                    { name: "parallelogram", desc: "2 pairs of parallel sides" },
                    { name: "trapezoid", desc: "exactly 1 pair of parallel sides" }
                ];
                const quad = pick(quads);

                q.text = `What type of quadrilateral is shown?`;
                q.ans = quad.name.charAt(0).toUpperCase() + quad.name.slice(1);
                q.answerType = "choice";
                q.options = ["Square", "Rectangle", "Rhombus", "Parallelogram", "Trapezoid"];
                q.hint = `${quad.name.charAt(0).toUpperCase() + quad.name.slice(1)}: ${quad.desc}`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Classify This Quadrilateral</div>
                    ${createShapeSVG(quad.name, false)}
                    <div style="margin-top:10px;font-size:0.9rem;color:var(--text-dim);">
                        Look at the sides and angles to identify this shape.
                    </div>
                </div>`;
                q.geometryData = { quad: quad.name };
                q.printFormat = "geometry-quads";
            } else if (geoSkill === "area_perimeter") {
                // Combined Area AND Perimeter
                const shapeType = pick(["rectangle", "square"]);
                let length, width, area, perimeter;

                if (shapeType === "rectangle") {
                    length = rng(4, maxDim);
                    width = rng(3, Math.min(length - 1, maxDim - 1));
                    area = length * width;
                    perimeter = 2 * (length + width);
                    q.geometryData = { shape: 'rectangle', length, width, area, perimeter };
                } else {
                    const side = rng(3, maxDim);
                    length = side;
                    width = side;
                    area = side * side;
                    perimeter = 4 * side;
                    q.geometryData = { shape: 'square', side, area, perimeter };
                }

                q.text = `Find BOTH the perimeter AND area of this shape.`;
                q.answerType = "dual"; // Special type for dual answers
                q.dualAnswers = { perimeter, area };
                q.ans = `P=${perimeter}, A=${area}`;
                q.hint = `Perimeter = distance around (add all sides). Area = space inside (length × width)`;

                q.visual = `<div style="text-align:center;">
                    ${createLabeledRectSVG(length, width, false)}
                    <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                        <div style="text-align:left;">
                            <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                            <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter"
                                style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                            <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">Perimeter Hint</button>
                        </div>
                        <div style="text-align:left;">
                            <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                            <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                            <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">Area Hint</button>
                        </div>
                    </div>
                </div>`;
                q.perimeterHint = `Perimeter = 2 × (${length} + ${width}) = 2 × ${length + width}`;
                q.areaHint = `Area = ${length} × ${width}`;
                q.printFormat = "geometry-area-perimeter";
            } else if (geoSkill === "composite_shapes") {
                // Composite shapes (L-shapes, T-shapes)
                const shapeType = pick(["L", "T"]);
                const compDim = Math.max(4, Math.min(maxDim, 20)); // Cap composite dims for SVG readability

                if (shapeType === "L") {
                    // L-shape
                    const topWidth = rng(2, Math.max(3, Math.floor(compDim / 2)));
                    const topHeight = rng(3, Math.max(4, Math.floor(compDim * 0.7)));
                    const bottomWidth = rng(topWidth + 2, Math.min(topWidth + 5, compDim));
                    const totalHeight = topHeight + rng(2, Math.max(3, Math.floor(compDim / 3)));
                    const bottomHeight = totalHeight - topHeight;

                    // Area = top rectangle + bottom extension
                    const area = (topWidth * topHeight) + (bottomWidth * bottomHeight);
                    // Perimeter = all outer edges
                    const perimeter = topWidth + topHeight + (bottomWidth - topWidth) + bottomHeight + bottomWidth + totalHeight;

                    q.geometryData = {
                        shapeType: 'L',
                        dims: { topWidth, topHeight, bottomWidth, totalHeight },
                        area, perimeter
                    };

                    q.text = `Find BOTH the perimeter AND area of this L-shape.`;
                    q.answerType = "dual";
                    q.dualAnswers = { perimeter, area };
                    q.ans = `P=${perimeter}, A=${area}`;
                    q.hint = `Break into rectangles. Area = sum of parts. Perimeter = all outer edges.`;

                    q.visual = `<div style="text-align:center;">
                        ${createLShapeSVG({ topWidth, topHeight, bottomWidth, totalHeight }, false)}
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                                <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter"
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">Perimeter Hint</button>
                            </div>
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                                <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">Area Hint</button>
                            </div>
                        </div>
                    </div>`;
                    q.perimeterHint = `Add all outer edges: ${topWidth} + ${topHeight} + ${bottomWidth - topWidth} + ${bottomHeight} + ${bottomWidth} + ${totalHeight}`;
                    q.areaHint = `Split into 2 rectangles: (${topWidth} × ${topHeight}) + (${bottomWidth} × ${bottomHeight})`;
                } else {
                    // T-shape
                    const topWidth = rng(6, Math.max(7, compDim));
                    const topHeight = rng(2, Math.max(3, Math.floor(compDim / 3)));
                    const stemWidth = rng(2, Math.floor(topWidth / 2));
                    const stemHeight = rng(3, Math.max(4, Math.floor(compDim * 0.6)));

                    const area = (topWidth * topHeight) + (stemWidth * stemHeight);
                    const perimeter = topWidth + topHeight + ((topWidth - stemWidth) / 2) + stemHeight + stemWidth + stemHeight + ((topWidth - stemWidth) / 2) + topHeight;

                    q.geometryData = {
                        shapeType: 'T',
                        dims: { topWidth, topHeight, stemWidth, stemHeight },
                        area, perimeter
                    };

                    q.text = `Find BOTH the perimeter AND area of this T-shape.`;
                    q.answerType = "dual";
                    q.dualAnswers = { perimeter, area };
                    q.ans = `P=${perimeter}, A=${area}`;
                    q.hint = `Break into rectangles. Area = sum of parts. Perimeter = all outer edges.`;

                    q.visual = `<div style="text-align:center;">
                        ${createTShapeSVG({ topWidth, topHeight, stemWidth, stemHeight }, false)}
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                                <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter"
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">Perimeter Hint</button>
                            </div>
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                                <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                    style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:var(--bg-card);">
                                <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;">Area Hint</button>
                            </div>
                        </div>
                    </div>`;
                    q.perimeterHint = `Add all outer edges around the T shape`;
                    q.areaHint = `Split into 2 rectangles: (${topWidth} × ${topHeight}) + (${stemWidth} × ${stemHeight})`;
                }
                q.printFormat = "geometry-composite";
            } else if (geoSkill === "area_word_problems") {
                // Area word problems
                const contexts = [
                    { item: "garden", action: "cover with mulch", unit: "meters", unitSq: "square meters" },
                    { item: "poster", action: "cover with paper", unit: "meters", unitSq: "square meters" },
                    { item: "room", action: "carpet", unit: "feet", unitSq: "square feet" },
                    { item: "wall", action: "paint", unit: "meters", unitSq: "square meters" },
                    { item: "table", action: "cover with a tablecloth", unit: "feet", unitSq: "square feet" },
                    { item: "pool cover", action: "need", unit: "meters", unitSq: "square meters" }
                ];
                const ctx = pick(contexts);
                const length = rng(4, maxDim);
                const width = rng(2, Math.max(2, maxDim - 2));
                const area = length * width;

                q.text = `A ${ctx.item} is ${length} ${ctx.unit} long and ${width} ${ctx.unit} wide. How many ${ctx.unitSq} do you need to ${ctx.action}?`;
                q.ans = area;
                q.hint = `This is an AREA problem (covering a surface). Area = length × width = ${length} × ${width}`;

                q.visual = `<div style="text-align:center;">
                    ${createWordProblemShapeSVG(length, width, false, false)}
                    <div style="margin-top:15px;background:var(--bg-card);padding:15px;border-radius:10px;text-align:left;max-width:350px;margin-left:auto;margin-right:auto;">
                        <div style="font-weight:700;margin-bottom:10px;">What is being asked for?</div>
                        <div style="display:flex;gap:15px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="area" checked style="width:18px;height:18px;"> Area
                            </label>
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="perimeter" style="width:18px;height:18px;"> Perimeter
                            </label>
                        </div>
                        <div style="font-weight:700;margin-bottom:5px;">Final Answer (include the unit):</div>
                        <input type="text" id="wordProblemAnswer" placeholder="e.g., ${area} ${ctx.unitSq}"
                            style="width:100%;padding:10px;border:2px solid var(--border-light);border-radius:8px;font-size:1rem;background:white;">
                    </div>
                </div>`;
                q.answerType = "word_problem";
                q.expectedType = "area";
                q.expectedUnit = ctx.unitSq;
                q.geometryData = { length, width, area, context: ctx };
                q.printFormat = "geometry-word-area";
            } else if (geoSkill === "perimeter_word_problems") {
                // Perimeter word problems
                const contexts = [
                    { item: "garden", action: "fence around", unit: "meters", unitLin: "meters" },
                    { item: "picture frame", action: "put trim around", unit: "inches", unitLin: "inches" },
                    { item: "playground", action: "put a fence around", unit: "meters", unitLin: "meters" },
                    { item: "room", action: "put baseboard around", unit: "feet", unitLin: "feet" },
                    { item: "pool", action: "put tiles around the edge of", unit: "meters", unitLin: "meters" }
                ];
                const ctx = pick(contexts);
                const length = rng(5, maxDim);
                const width = rng(3, Math.max(3, maxDim - 2));
                const perimeter = 2 * (length + width);

                q.text = `A ${ctx.item} is ${length} ${ctx.unit} long and ${width} ${ctx.unit} wide. How many ${ctx.unitLin} of material do you need to ${ctx.action}?`;
                q.ans = perimeter;
                q.hint = `This is a PERIMETER problem (going around the edge). Perimeter = 2 × (length + width) = 2 × (${length} + ${width})`;

                q.visual = `<div style="text-align:center;">
                    ${createWordProblemShapeSVG(length, width, false, false)}
                    <div style="margin-top:15px;background:var(--bg-card);padding:15px;border-radius:10px;text-align:left;max-width:350px;margin-left:auto;margin-right:auto;">
                        <div style="font-weight:700;margin-bottom:10px;">What is being asked for?</div>
                        <div style="display:flex;gap:15px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="area" style="width:18px;height:18px;"> Area
                            </label>
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="perimeter" checked style="width:18px;height:18px;"> Perimeter
                            </label>
                        </div>
                        <div style="font-weight:700;margin-bottom:5px;">Final Answer (include the unit):</div>
                        <input type="text" id="wordProblemAnswer" placeholder="e.g., ${perimeter} ${ctx.unitLin}"
                            style="width:100%;padding:10px;border:2px solid var(--border-light);border-radius:8px;font-size:1rem;background:white;">
                    </div>
                </div>`;
                q.answerType = "word_problem";
                q.expectedType = "perimeter";
                q.expectedUnit = ctx.unitLin;
                q.geometryData = { length, width, perimeter, context: ctx };
                q.printFormat = "geometry-word-perimeter";
            } else if (geoSkill === "area_perimeter_word") {
                // Scaffolded word problem (like Image 3)
                const contexts = [
                    { item: "poster", action: "cover", edgeAction: "frame", unit: "meters" },
                    { item: "garden", action: "cover with grass", edgeAction: "fence", unit: "meters" },
                    { item: "room", action: "carpet", edgeAction: "put baseboard around", unit: "feet" },
                    { item: "pool", action: "cover", edgeAction: "tile around", unit: "meters" }
                ];
                const ctx = pick(contexts);
                const length = rng(4, maxDim);
                const width = rng(2, Math.max(2, maxDim - 2));
                const area = length * width;
                const perimeter = 2 * (length + width);

                // Randomly choose whether to ask for area or perimeter
                const askFor = pick(["area", "perimeter"]);
                const correctAnswer = askFor === "area" ? area : perimeter;
                const unitLabel = askFor === "area" ? `square ${ctx.unit}` : ctx.unit;
                const actionText = askFor === "area" ? ctx.action : ctx.edgeAction;

                q.text = `A ${ctx.item} is ${length} ${ctx.unit} long and ${width} ${ctx.unit} wide. How many ${unitLabel} of material do you need to ${actionText}?`;
                q.ans = correctAnswer;

                q.visual = `<div style="text-align:center;">
                    <div style="background:var(--bg-card);padding:15px;border-radius:10px;margin-bottom:15px;text-align:left;max-width:400px;margin-left:auto;margin-right:auto;">
                        <div style="font-size:1.1rem;line-height:1.6;">${q.text}</div>
                    </div>

                    ${createWordProblemShapeSVG(length, width, true, false)}

                    <div style="background:var(--bg-card);padding:15px;border-radius:10px;text-align:left;max-width:380px;margin:15px auto;">
                        <div style="font-weight:700;margin-bottom:10px;">Label the shape (what are the dimensions?):</div>
                        <div style="display:flex;gap:10px;margin-bottom:15px;">
                            <button class="dimension-btn" onclick="this.classList.toggle('selected')" style="padding:8px 20px;border:2px solid var(--accent-cyan);border-radius:8px;background:white;cursor:pointer;font-weight:600;">Length</button>
                            <button class="dimension-btn" onclick="this.classList.toggle('selected')" style="padding:8px 20px;border:2px solid var(--accent-cyan);border-radius:8px;background:white;cursor:pointer;font-weight:600;">Width</button>
                        </div>

                        <div style="font-weight:700;margin-bottom:10px;">What is being asked for?</div>
                        <div style="display:flex;gap:15px;margin-bottom:15px;">
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="area" ${askFor === 'area' ? '' : ''} style="width:18px;height:18px;"> Area
                            </label>
                            <label style="display:flex;align-items:center;gap:5px;cursor:pointer;">
                                <input type="radio" name="problemType" value="perimeter" ${askFor === 'perimeter' ? '' : ''} style="width:18px;height:18px;"> Perimeter
                            </label>
                        </div>

                        <div style="font-weight:700;margin-bottom:5px;">Final Answer (include the unit):</div>
                        <input type="text" id="wordProblemAnswer" placeholder="e.g., 20 ${unitLabel}"
                            style="width:100%;padding:12px;border:2px solid var(--border-light);border-radius:8px;font-size:1.1rem;background:white;">

                        <button class="hint-btn-small" onclick="showWordProblemHint()" style="margin-top:10px;width:100%;padding:10px;font-size:1rem;">Need Help?</button>
                    </div>
                </div>`;

                q.answerType = "scaffolded_word";
                q.expectedType = askFor;
                q.expectedUnit = unitLabel;
                q.hint = askFor === "area"
                    ? `Area = length × width = ${length} × ${width}. Remember to include "square ${ctx.unit}"!`
                    : `Perimeter = 2 × (length + width) = 2 × (${length} + ${width}). Remember to include "${ctx.unit}"!`;
                q.geometryData = { length, width, area, perimeter, askFor, context: ctx };
                q.printFormat = "geometry-word-scaffolded";
            }
            return;
}
