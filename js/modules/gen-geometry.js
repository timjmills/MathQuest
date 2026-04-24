// gen-geometry.js - Geometry question generation (area, perimeter, angles, shapes, coordinates, volume)
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG } from './svg-geometry.js';

export function generateGeometryQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // ===== NAME 2D SHAPES (Grade K) — multi-select variant =====
            if (mappedSkill === "name_2d_shapes" && Math.random() < 0.30) {
                const allShapes = [
                    { name: 'triangle', emoji: '\u{1F53A}' },
                    { name: 'square', emoji: '\u{1F7E6}' },
                    { name: 'circle', emoji: '⭕' },
                    { name: 'rectangle', emoji: '▭' },
                    { name: 'pentagon', emoji: '⬟' },
                    { name: 'hexagon', emoji: '⬢' },
                    { name: 'star', emoji: '⭐' },
                    { name: 'diamond', emoji: '\u{1F537}' }
                ];
                const target = pick(['triangle', 'square', 'circle', 'rectangle', 'pentagon', 'hexagon']);
                let sample = shuffle([...allShapes]).slice(0, 6);
                // Ensure at least one target shape exists
                if (!sample.some(s => s.name === target)) {
                    const targetShape = allShapes.find(s => s.name === target);
                    sample[0] = targetShape;
                }
                // Optionally include another instance of target to vary count
                if (Math.random() < 0.5) {
                    const targetShape = allShapes.find(s => s.name === target);
                    const dupIdx = sample.findIndex(s => s.name !== target);
                    if (dupIdx !== -1) sample[dupIdx] = { ...targetShape };
                }
                sample = shuffle(sample);
                const opts = sample.map((s, i) => ({
                    id: 'opt' + i,
                    label: `${s.emoji} ${s.name}`,
                    correct: s.name === target
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the ${target}s.`;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = `${target}s have a specific shape — look carefully at the sides and curves.`;
                q.printFormat = 'multi-select';
                q.skillLabel = '2D Shapes';
                return;
            }

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

            // ===== NAME 3D SHAPES (Grade K) — multi-select variant =====
            if (mappedSkill === "name_3d_shapes" && Math.random() < 0.30) {
                const all3d = [
                    { name: 'cube', emoji: '\u{1F9CA}' },
                    { name: 'sphere', emoji: '⚪' },
                    { name: 'cylinder', emoji: '\u{1F50B}' },
                    { name: 'cone', emoji: '\u{1F366}' },
                    { name: 'rectangular prism', emoji: '\u{1F9F1}' },
                    { name: 'pyramid', emoji: '⛰️' }
                ];
                const target = pick(['cube', 'sphere', 'cylinder', 'cone']);
                let sample = shuffle([...all3d]).slice(0, 5);
                if (!sample.some(s => s.name === target)) {
                    sample[0] = all3d.find(s => s.name === target);
                }
                if (Math.random() < 0.5) {
                    const targetShape = all3d.find(s => s.name === target);
                    const dupIdx = sample.findIndex(s => s.name !== target);
                    if (dupIdx !== -1) sample[dupIdx] = { ...targetShape };
                }
                sample = shuffle(sample);
                const opts = sample.map((s, i) => ({
                    id: 'opt' + i,
                    label: `${s.emoji} ${s.name}`,
                    correct: s.name === target
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the ${target}s.`;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = `Think about the faces, edges, and curves of a ${target}.`;
                q.printFormat = 'multi-select';
                q.skillLabel = '3D Shapes';
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

            // ===== COUNT EDGES, FACES & VERTICES (Grade 2) — Phase 5 batch 2 =====
            // Band 171-180, G domain. Show a 3D shape, ask one of E/F/V.
            if (mappedSkill === "count_edges_faces_vertices") {
                const SHAPES_3D = {
                    cube:               { label: 'cube',               edges: 12, faces: 6, vertices: 8 },
                    rectangular_prism:  { label: 'rectangular prism',  edges: 12, faces: 6, vertices: 8 },
                    square_pyramid:     { label: 'square pyramid',     edges: 8,  faces: 5, vertices: 5 },
                    triangular_prism:   { label: 'triangular prism',   edges: 9,  faces: 5, vertices: 6 },
                    cone:               { label: 'cone',               edges: 1,  faces: 2, vertices: 1 },
                    cylinder:           { label: 'cylinder',           edges: 2,  faces: 3, vertices: 0 },
                };
                const shapeKey = pick(Object.keys(SHAPES_3D));
                const shape3d = SHAPES_3D[shapeKey];
                const askKeys = ['edges', 'faces', 'vertices'];
                const askFor = pick(askKeys);
                const answer = shape3d[askFor];

                // Build SVG drawing per shape
                let shapeSvg = '';
                const STROKE = '#1565c0';
                const FILL = 'rgba(33,150,243,0.18)';
                const DASH = '#888';
                if (shapeKey === 'cube') {
                    const ox = 30, oy = 130, s = 70, d = 28;
                    // Front face
                    shapeSvg += `<polygon points="${ox},${oy} ${ox + s},${oy} ${ox + s},${oy - s} ${ox},${oy - s}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Top face
                    shapeSvg += `<polygon points="${ox},${oy - s} ${ox + s},${oy - s} ${ox + s + d},${oy - s - d} ${ox + d},${oy - s - d}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Right face
                    shapeSvg += `<polygon points="${ox + s},${oy} ${ox + s + d},${oy - d} ${ox + s + d},${oy - s - d} ${ox + s},${oy - s}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Hidden edges
                    shapeSvg += `<line x1="${ox}" y1="${oy}" x2="${ox + d}" y2="${oy - d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                    shapeSvg += `<line x1="${ox + d}" y1="${oy - d}" x2="${ox + s + d}" y2="${oy - d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                    shapeSvg += `<line x1="${ox + d}" y1="${oy - d}" x2="${ox + d}" y2="${oy - s - d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                } else if (shapeKey === 'rectangular_prism') {
                    const ox = 25, oy = 130, l = 95, h = 60, d = 26;
                    shapeSvg += `<polygon points="${ox},${oy} ${ox + l},${oy} ${ox + l},${oy - h} ${ox},${oy - h}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    shapeSvg += `<polygon points="${ox},${oy - h} ${ox + l},${oy - h} ${ox + l + d},${oy - h - d} ${ox + d},${oy - h - d}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    shapeSvg += `<polygon points="${ox + l},${oy} ${ox + l + d},${oy - d} ${ox + l + d},${oy - h - d} ${ox + l},${oy - h}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    shapeSvg += `<line x1="${ox}" y1="${oy}" x2="${ox + d}" y2="${oy - d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                    shapeSvg += `<line x1="${ox + d}" y1="${oy - d}" x2="${ox + l + d}" y2="${oy - d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                    shapeSvg += `<line x1="${ox + d}" y1="${oy - d}" x2="${ox + d}" y2="${oy - h - d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                } else if (shapeKey === 'square_pyramid') {
                    const ox = 30, oy = 140, s = 80, d = 30, ah = 90;
                    const ax = ox + s / 2 + d / 2;
                    const ay = oy - ah;
                    // Base (square in perspective)
                    shapeSvg += `<polygon points="${ox},${oy} ${ox + s},${oy} ${ox + s + d},${oy - d} ${ox + d},${oy - d}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Front-left edge to apex
                    shapeSvg += `<line x1="${ox}" y1="${oy}" x2="${ax}" y2="${ay}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Front-right edge to apex
                    shapeSvg += `<line x1="${ox + s}" y1="${oy}" x2="${ax}" y2="${ay}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Back-right edge to apex
                    shapeSvg += `<line x1="${ox + s + d}" y1="${oy - d}" x2="${ax}" y2="${ay}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Back-left hidden edge
                    shapeSvg += `<line x1="${ox + d}" y1="${oy - d}" x2="${ax}" y2="${ay}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                } else if (shapeKey === 'triangular_prism') {
                    const ox = 25, oy = 140, w = 80, h = 80, d = 50;
                    // Front triangle
                    shapeSvg += `<polygon points="${ox},${oy} ${ox + w},${oy} ${ox + w / 2},${oy - h}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Top edge
                    shapeSvg += `<line x1="${ox + w / 2}" y1="${oy - h}" x2="${ox + w / 2 + d}" y2="${oy - h - d / 2}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Right back edge
                    shapeSvg += `<line x1="${ox + w}" y1="${oy}" x2="${ox + w + d}" y2="${oy - d / 2}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Back triangle (top + right visible, bottom hidden)
                    shapeSvg += `<polygon points="${ox + d},${oy - d / 2} ${ox + w + d},${oy - d / 2} ${ox + w / 2 + d},${oy - h - d / 2}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Hidden left edge
                    shapeSvg += `<line x1="${ox}" y1="${oy}" x2="${ox + d}" y2="${oy - d / 2}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                } else if (shapeKey === 'cone') {
                    const cx = 90, cy = 145, rx = 50, ry = 14, h = 100;
                    // Base ellipse
                    shapeSvg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Sides up to apex
                    shapeSvg += `<line x1="${cx - rx}" y1="${cy}" x2="${cx}" y2="${cy - h}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    shapeSvg += `<line x1="${cx + rx}" y1="${cy}" x2="${cx}" y2="${cy - h}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Hidden bottom curve indicator
                    shapeSvg += `<path d="M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>`;
                } else if (shapeKey === 'cylinder') {
                    const cx = 90, cyTop = 50, cyBot = 145, rx = 45, ry = 14;
                    // Top ellipse
                    shapeSvg += `<ellipse cx="${cx}" cy="${cyTop}" rx="${rx}" ry="${ry}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Body
                    shapeSvg += `<rect x="${cx - rx}" y="${cyTop}" width="${rx * 2}" height="${cyBot - cyTop}" fill="${FILL}" stroke="none"/>`;
                    shapeSvg += `<line x1="${cx - rx}" y1="${cyTop}" x2="${cx - rx}" y2="${cyBot}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    shapeSvg += `<line x1="${cx + rx}" y1="${cyTop}" x2="${cx + rx}" y2="${cyBot}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Bottom ellipse (front arc)
                    shapeSvg += `<path d="M ${cx - rx} ${cyBot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cyBot}" stroke="${STROKE}" stroke-width="2.2" fill="none"/>`;
                    // Hidden back arc
                    shapeSvg += `<path d="M ${cx - rx} ${cyBot} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cyBot}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>`;
                }

                // 4 distinct numeric options near answer
                const optsSet = new Set([answer]);
                const all = [shape3d.edges, shape3d.faces, shape3d.vertices];
                for (const v of all) optsSet.add(v);
                const candidates = [answer + 1, Math.max(0, answer - 1), answer + 2, Math.max(0, answer - 2)];
                for (const c of shuffle(candidates)) {
                    if (optsSet.size >= 4) break;
                    optsSet.add(c);
                }
                while (optsSet.size < 4) optsSet.add(randInt(0, 12));

                q.text = `How many ${askFor} does this ${shape3d.label} have?`;
                q.ans = answer;
                q.answerType = "number";
                q.options = shuffle([...optsSet]);
                q.hint = askFor === 'edges'
                    ? `Edges are the lines where two faces meet. Count each edge once.`
                    : askFor === 'faces'
                        ? `Faces are the flat (or curved) surfaces. Count each surface once.`
                        : `Vertices are the corner points where edges meet. Count each corner once.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Count the ${askFor.charAt(0).toUpperCase() + askFor.slice(1)}</div>
                    <svg viewBox="0 0 220 170" width="240" style="background:var(--bg-card);border-radius:12px;padding:6px;max-width:100%;">
                        ${shapeSvg}
                    </svg>
                    <div style="margin-top:6px;font-size:1rem;text-transform:capitalize;font-weight:600;">${shape3d.label}</div>
                </div>`;
                q.skillLabel = "3D E/F/V";
                q.printFormat = "count-efv";
                q.shape3DData = { shape: shapeKey, label: shape3d.label, askFor, edges: shape3d.edges, faces: shape3d.faces, vertices: shape3d.vertices };
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

            // ===== SHAPE ATTRIBUTES (Grade 1-2) — multi-select variant =====
            if (mappedSkill === "shape_attributes" && Math.random() < 0.30) {
                // Pool of named shapes with attribute facts
                const saPool = [
                    { name: 'square', sides: 4, rightAngles: 4, parallel: true, equalSides: true,
                      svg: `<rect x="20" y="20" width="60" height="60" fill="#bfdbfe" stroke="#1e88e5" stroke-width="2.5"/>` },
                    { name: 'rectangle', sides: 4, rightAngles: 4, parallel: true, equalSides: false,
                      svg: `<rect x="10" y="25" width="80" height="50" fill="#dcfce7" stroke="#22c55e" stroke-width="2.5"/>` },
                    { name: 'rhombus', sides: 4, rightAngles: 0, parallel: true, equalSides: true,
                      svg: `<polygon points="50,10 90,50 50,90 10,50" fill="#fef3c7" stroke="#f59e0b" stroke-width="2.5"/>` },
                    { name: 'parallelogram', sides: 4, rightAngles: 0, parallel: true, equalSides: false,
                      svg: `<polygon points="20,75 80,75 90,25 30,25" fill="#fde68a" stroke="#d97706" stroke-width="2.5"/>` },
                    { name: 'triangle', sides: 3, rightAngles: 0, parallel: false, equalSides: false,
                      svg: `<polygon points="50,10 90,85 10,85" fill="#fecaca" stroke="#ef4444" stroke-width="2.5"/>` },
                    { name: 'right triangle', sides: 3, rightAngles: 1, parallel: false, equalSides: false,
                      svg: `<polygon points="20,20 20,80 80,80" fill="#fbcfe8" stroke="#ec4899" stroke-width="2.5"/>` },
                    { name: 'pentagon', sides: 5, rightAngles: 0, parallel: false, equalSides: true,
                      svg: `<polygon points="50,10 90,38 75,85 25,85 10,38" fill="#e9d5ff" stroke="#a855f7" stroke-width="2.5"/>` },
                    { name: 'trapezoid', sides: 4, rightAngles: 0, parallel: true, equalSides: false,
                      svg: `<polygon points="15,80 85,80 70,20 30,20" fill="#cffafe" stroke="#06b6d4" stroke-width="2.5"/>` }
                ];
                const attrType = pick(['four_sides', 'four_right_angles', 'three_sides', 'parallel_sides']);
                const matches = (s) => {
                    if (attrType === 'four_sides') return s.sides === 4;
                    if (attrType === 'four_right_angles') return s.rightAngles === 4;
                    if (attrType === 'three_sides') return s.sides === 3;
                    if (attrType === 'parallel_sides') return s.parallel;
                    return false;
                };
                const correctPool = saPool.filter(matches);
                const wrongPool = saPool.filter(s => !matches(s));
                let chosen;
                if (correctPool.length === 0) {
                    chosen = shuffle([...saPool]).slice(0, 5);
                } else {
                    const ccount = Math.min(correctPool.length, randInt(2, 3));
                    const wcount = Math.min(wrongPool.length, randInt(2, 3));
                    chosen = shuffle([...shuffle([...correctPool]).slice(0, ccount), ...shuffle([...wrongPool]).slice(0, wcount)]);
                }
                const opts = chosen.map((s, i) => ({
                    id: 'opt' + i,
                    svg: `<svg viewBox="0 0 100 100" width="80" height="80">${s.svg}</svg>`,
                    label: s.name,
                    correct: matches(s)
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                const promptMap = {
                    four_sides: 'Click ALL shapes with 4 sides.',
                    four_right_angles: 'Click ALL shapes with 4 right angles.',
                    three_sides: 'Click ALL shapes with 3 sides.',
                    parallel_sides: 'Click ALL shapes with at least one pair of parallel sides.'
                };
                q.text = promptMap[attrType];
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = `Look at each shape's sides and angles carefully.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Attributes';
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
                // Generate two rectangular prisms that join to form an L (notch on top) or step (stairs).
                // Geometry constraint: the top prism MUST sit fully on the bottom prism's top face,
                // i.e. tx + t.w <= b.w  AND  ty + t.h <= b.h, with at least one strictly-less so a step is visible.
                const compType = pick(["L", "step"]);

                // Bottom prism dims (w1=width along x, h1=height along z, d1=depth along y)
                const w1 = rng(4, Math.max(4, volDim));
                const h1 = rng(2, Math.max(2, volDim - 1));
                const d1 = rng(3, Math.max(3, volDim - 1));

                // Top prism dims constrained to fit on bottom
                let w2, h2, d2, tx, ty;
                if (compType === "step") {
                    // Step: top spans full depth (d2 = d1), narrower in width (w2 < w1), sitting on the left.
                    w2 = rng(2, Math.max(2, w1 - 2));
                    d2 = d1;
                    h2 = rng(2, Math.max(2, volDim - 1));
                    tx = 0;
                    ty = 0;
                } else {
                    // L (notch): top spans full width (w2 = w1), shallower in depth (d2 < d1), sitting at front.
                    w2 = w1;
                    d2 = rng(2, Math.max(2, d1 - 2));
                    h2 = rng(2, Math.max(2, volDim - 1));
                    tx = 0;
                    ty = 0;
                }

                const vol1 = w1 * h1 * d1;
                const vol2 = w2 * h2 * d2;
                const totalVol = vol1 + vol2;

                q.text = `Find the total volume of this composite shape (two rectangular prisms joined together).`;
                q.ans = totalVol;
                q.answerType = "number";
                q.options = buildNumericOptions(totalVol);
                q.hint = `Break into two rectangular prisms. Volume 1 = ${w1} x ${d1} x ${h1} = ${vol1}. Volume 2 = ${w2} x ${d2} x ${h2} = ${vol2}. Total = ${vol1} + ${vol2} = ${totalVol}.`;

                // Map dims into the drawing coord system: x=width, y=depth (into page), z=height (up)
                // Bottom occupies (0..w1) x (0..d1) x (0..h1)
                // Top occupies   (tx..tx+w2) x (ty..ty+d2) x (h1..h1+h2)
                const bw = w1, bd = d1, bh = h1;
                const tw = w2, td = d2, th = h2;
                const tzBase = bh; // top prism sits on bottom prism

                // Isometric projection (30deg) — unit space, scale applied later
                const uX = (x, y, z) => (x - y) * 0.866;
                const uY = (x, y, z) => (x + y) * 0.5 - z;

                // All 16 vertices for bounding box calc
                const allVerts = [
                    [0,0,0],[bw,0,0],[bw,bd,0],[0,bd,0],
                    [0,0,bh],[bw,0,bh],[bw,bd,bh],[0,bd,bh],
                    [tx,ty,tzBase],[tx+tw,ty,tzBase],[tx+tw,ty+td,tzBase],[tx,ty+td,tzBase],
                    [tx,ty,tzBase+th],[tx+tw,ty,tzBase+th],[tx+tw,ty+td,tzBase+th],[tx,ty+td,tzBase+th]
                ];
                let mnX = Infinity, mxX = -Infinity, mnY = Infinity, mxY = -Infinity;
                for (const [vx,vy,vz] of allVerts) {
                    const px = uX(vx,vy,vz), py = uY(vx,vy,vz);
                    mnX = Math.min(mnX, px); mxX = Math.max(mxX, px);
                    mnY = Math.min(mnY, py); mxY = Math.max(mxY, py);
                }
                const unitW = mxX - mnX;
                const unitH = mxY - mnY;

                // Scale to fill a 300x220 target inside a 380x300 SVG, with margin for labels
                const targetW = 300, targetH = 220;
                const scale = Math.min(targetW / unitW, targetH / unitH);
                const svgW = 380, svgH = 300;
                const ox = -mnX * scale + (svgW - unitW * scale) / 2;
                const oy = -mnY * scale + (svgH - unitH * scale) / 2;

                const isoX = (x, y, z) => Math.round((ox + uX(x,y,z) * scale) * 10) / 10;
                const isoY = (x, y, z) => Math.round((oy + uY(x,y,z) * scale) * 10) / 10;

                // Helper: build a face path from 4 (x,y,z) corners
                const facePath = (corners) => {
                    return 'M ' + corners.map(([x,y,z]) => `${isoX(x,y,z)} ${isoY(x,y,z)}`).join(' L ') + ' Z';
                };

                // Bottom prism — only visible faces in standard isometric view (front, right, top).
                // Hidden faces (back, left, bottom) are omitted; the top prism on top changes the visible top portion.
                const bFront = facePath([[0,0,0],[bw,0,0],[bw,0,bh],[0,0,bh]]);
                const bRight = facePath([[bw,0,0],[bw,bd,0],[bw,bd,bh],[bw,0,bh]]);

                // Bottom's TOP face — only the portion NOT covered by the top prism.
                // Compute the visible region as the bottom rectangle minus the top footprint.
                // For step: top covers x=0..w2 across full depth → visible top is x=w2..bw across full depth.
                // For L:   top covers full width across y=0..d2 → visible top is y=d2..bd across full width.
                let bTopVisible;
                if (compType === "step") {
                    bTopVisible = facePath([[tw,0,bh],[bw,0,bh],[bw,bd,bh],[tw,bd,bh]]);
                } else {
                    bTopVisible = facePath([[0,td,bh],[bw,td,bh],[bw,bd,bh],[0,bd,bh]]);
                }

                // Top prism — front, right, top faces (also a left face if step exposes it; back face if L exposes it).
                const tFront = facePath([[tx,ty,tzBase],[tx+tw,ty,tzBase],[tx+tw,ty,tzBase+th],[tx,ty,tzBase+th]]);
                const tRight = facePath([[tx+tw,ty,tzBase],[tx+tw,ty+td,tzBase],[tx+tw,ty+td,tzBase+th],[tx+tw,ty,tzBase+th]]);
                const tTop   = facePath([[tx,ty,tzBase+th],[tx+tw,ty,tzBase+th],[tx+tw,ty+td,tzBase+th],[tx,ty+td,tzBase+th]]);

                // Font/label sizing scaled with the shape
                const fontSize = Math.max(12, Math.min(17, Math.round(scale * 0.85)));
                const lOff = Math.max(14, Math.round(scale * 0.7));
                const dimLabel = (x, y, text, anchor = 'middle') =>
                    `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="var(--text-bright)" font-size="${fontSize}" font-weight="700" stroke="var(--bg-world)" stroke-width="3" paint-order="stroke">${text}</text>`;

                // ----- Labels (placed outside the silhouette to avoid overlap) -----
                // Bottom prism width (w1): label below the front-bottom edge.
                const bw_lx = (isoX(0,0,0) + isoX(bw,0,0)) / 2;
                const bw_ly = (isoY(0,0,0) + isoY(bw,0,0)) / 2 + lOff;
                const bLabelW = dimLabel(bw_lx, bw_ly, w1);

                // Bottom prism depth (d1): label to the right of the bottom-right edge.
                const bd_lx = isoX(bw, bd, 0) + Math.round(lOff * 0.6);
                const bd_ly = isoY(bw, bd, 0) + Math.round(lOff * 0.4);
                const bLabelD = dimLabel(bd_lx, bd_ly, d1, 'start');

                // Bottom prism height (h1): label to the LEFT of the front-left vertical edge.
                const bh_lx = isoX(0, 0, bh / 2) - lOff;
                const bh_ly = isoY(0, 0, bh / 2);
                const bLabelH = dimLabel(bh_lx, bh_ly, h1, 'end');

                // Top prism height (h2): label to the LEFT of top prism's front-left vertical edge.
                const th_lx = isoX(tx, ty, tzBase + th / 2) - lOff;
                const th_ly = isoY(tx, ty, tzBase + th / 2);
                const tLabelH = dimLabel(th_lx, th_ly, h2, 'end');

                // Top prism width or depth (whichever is the new dimension): label on top face.
                let tLabelExtra = '';
                if (compType === "step") {
                    // Step: top width (w2) is new — label above the top-front edge of the top prism.
                    const tw_lx = (isoX(tx, ty, tzBase + th) + isoX(tx + tw, ty, tzBase + th)) / 2;
                    const tw_ly = (isoY(tx, ty, tzBase + th) + isoY(tx + tw, ty, tzBase + th)) / 2 - Math.round(lOff * 0.4);
                    tLabelExtra = dimLabel(tw_lx, tw_ly, w2);
                } else {
                    // L: top depth (d2) is new — label on the top-right edge of top prism.
                    const td_lx = isoX(tx + tw, ty + td, tzBase + th) + Math.round(lOff * 0.4);
                    const td_ly = isoY(tx + tw, ty + td / 2, tzBase + th);
                    tLabelExtra = dimLabel(td_lx, td_ly, d2, 'start');
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">Composite Volume</div>
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;">
                        <!-- Bottom prism (cyan): visible front, right, and exposed top portion -->
                        <path d="${bFront}" fill="var(--accent-cyan)" fill-opacity="0.35" stroke="var(--accent-cyan)" stroke-width="2" stroke-linejoin="round"/>
                        <path d="${bRight}" fill="var(--accent-cyan)" fill-opacity="0.25" stroke="var(--accent-cyan)" stroke-width="2" stroke-linejoin="round"/>
                        <path d="${bTopVisible}" fill="var(--accent-cyan)" fill-opacity="0.15" stroke="var(--accent-cyan)" stroke-width="2" stroke-linejoin="round"/>
                        <!-- Top prism (orange): front, right, top -->
                        <path d="${tFront}" fill="var(--accent-orange)" fill-opacity="0.4" stroke="var(--accent-orange)" stroke-width="2" stroke-linejoin="round"/>
                        <path d="${tRight}" fill="var(--accent-orange)" fill-opacity="0.3" stroke="var(--accent-orange)" stroke-width="2" stroke-linejoin="round"/>
                        <path d="${tTop}" fill="var(--accent-orange)" fill-opacity="0.18" stroke="var(--accent-orange)" stroke-width="2" stroke-linejoin="round"/>
                        <!-- Labels -->
                        ${bLabelW}${bLabelD}${bLabelH}${tLabelH}${tLabelExtra}
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
            } else if (geoSkill === "identify_angles" && Math.random() < 0.30) {
                // Multi-select: "Click ALL the X angles." — 4-6 angle SVGs
                const angleTypeChoices = ['acute', 'right', 'obtuse'];
                const target = pick(angleTypeChoices);
                function _angleOf(type) {
                    if (type === 'acute') return randInt(25, 80);
                    if (type === 'right') return 90;
                    return randInt(100, 165); // obtuse
                }
                function _angleSvg(deg) {
                    const r = 36;
                    const cx = 50, cy = 60;
                    const rad = (180 - deg) * Math.PI / 180;
                    const x2 = cx + r * Math.cos(rad);
                    const y2 = cy - r * Math.sin(rad);
                    let arc = '';
                    if (deg === 90) {
                        arc = `<rect x="${cx}" y="${cy - 8}" width="8" height="8" fill="none" stroke="#22c55e" stroke-width="1.5"/>`;
                    } else {
                        const arcEndX = cx + 14 * Math.cos(rad);
                        const arcEndY = cy - 14 * Math.sin(rad);
                        const largeArc = deg > 180 ? 1 : 0;
                        arc = `<path d="M ${cx + 14} ${cy} A 14 14 0 ${largeArc} 0 ${arcEndX.toFixed(1)} ${arcEndY.toFixed(1)}" fill="none" stroke="#22c55e" stroke-width="1.5"/>`;
                    }
                    return `<svg viewBox="0 0 100 80" width="90" height="72">
                        <line x1="${cx}" y1="${cy}" x2="${(cx + r).toFixed(1)}" y2="${cy}" stroke="#1e88e5" stroke-width="2"/>
                        <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#1e88e5" stroke-width="2"/>
                        <circle cx="${cx}" cy="${cy}" r="2" fill="#1e88e5"/>
                        ${arc}
                    </svg>`;
                }
                const cCount = randInt(2, 3);
                const wCount = randInt(2, 3);
                const wrongTypes = angleTypeChoices.filter(t => t !== target);
                const items = [];
                for (let i = 0; i < cCount; i++) items.push({ type: target, deg: _angleOf(target) });
                for (let i = 0; i < wCount; i++) items.push({ type: pick(wrongTypes), deg: _angleOf(pick(wrongTypes)) });
                const shuffled = shuffle(items);
                const opts = shuffled.map((it, i) => ({
                    id: 'opt' + i,
                    svg: _angleSvg(it.deg),
                    label: '',
                    correct: it.type === target
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the ${target} angles.`;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = target === 'right' ? 'Right angles measure exactly 90°.'
                    : target === 'acute' ? 'Acute angles are less than 90°.'
                    : 'Obtuse angles are greater than 90° and less than 180°.';
                q.printFormat = 'multi-select';
                q.skillLabel = 'Identify Angles';
                return;
            } else if (geoSkill === "identify_angles" && Math.random() < 0.286) {
                // Hot-spot: composite polygon, click all angles of the target type
                const target = pick(['obtuse', 'right', 'acute']);
                // Choose a vertex layout that contains 1-2 of the target type plus mixed others
                const layouts = [
                    // Each vertex: {x, y, type}
                    [
                        { id: 'h0', x: 60, y: 50, type: 'right' },
                        { id: 'h1', x: 240, y: 50, type: 'obtuse' },
                        { id: 'h2', x: 220, y: 160, type: 'acute' },
                        { id: 'h3', x: 80, y: 160, type: 'obtuse' }
                    ],
                    [
                        { id: 'h0', x: 50, y: 50, type: 'acute' },
                        { id: 'h1', x: 250, y: 60, type: 'obtuse' },
                        { id: 'h2', x: 240, y: 170, type: 'right' },
                        { id: 'h3', x: 60, y: 160, type: 'obtuse' }
                    ],
                    [
                        { id: 'h0', x: 70, y: 40, type: 'obtuse' },
                        { id: 'h1', x: 230, y: 60, type: 'acute' },
                        { id: 'h2', x: 250, y: 165, type: 'right' },
                        { id: 'h3', x: 50, y: 150, type: 'obtuse' }
                    ]
                ];
                let angles = pick(layouts);
                // Ensure at least one of target exists
                if (!angles.some(a => a.type === target)) {
                    angles = angles.map((a, i) => i === 0 ? { ...a, type: target } : a);
                }
                const points = angles.map(a => `${a.x},${a.y}`).join(' ');
                const labelLetters = 'ABCD';
                const labels = angles.map((a, i) => {
                    const lx = a.x + (a.x < 150 ? -12 : 12);
                    const ly = a.y + (a.y < 100 ? -8 : 18);
                    return `<text x="${lx}" y="${ly}" font-size="16" font-weight="700" fill="#1e3a8a" text-anchor="middle">${labelLetters[i]}</text>`;
                }).join('');
                const bgSvg = `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"><polygon points="${points}" fill="#dbeafe" stroke="#1e88e5" stroke-width="2.5"/>${labels}</svg>`;
                const hotSpots = angles.map(a => ({
                    id: a.id,
                    shape: 'circle',
                    cx: a.x,
                    cy: a.y,
                    r: 28,
                    label: `Vertex ${labelLetters[angles.indexOf(a)]}`
                }));
                const ans = angles.filter(a => a.type === target).map(a => a.id);
                q.text = `Click ALL the ${target} angles in this shape.`;
                q.answerType = 'hot-spot';
                q.backgroundSvg = bgSvg;
                q.hotSpots = hotSpots;
                q.ans = ans;
                q.selectMode = 'multi';
                q.hint = target === 'right' ? 'Right angles measure exactly 90° (a square corner).'
                    : target === 'obtuse' ? 'Obtuse angles are greater than 90° (look wider than a square corner).'
                    : 'Acute angles are less than 90° (look narrower than a square corner).';
                q.printFormat = 'hot-spot';
                q.skillLabel = 'Identify Angles';
                return;
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
            } else if (geoSkill === "identify_lines" && Math.random() < 0.30) {
                // Multi-select: "Click ALL pairs of parallel lines."
                const targetType = pick(['parallel', 'perpendicular', 'intersecting']);
                function _linePairSvg(type, variant) {
                    const cx = 50, cy = 40;
                    const len = 36;
                    if (type === 'parallel') {
                        // Variant: horizontal or diagonal
                        if (variant === 0) {
                            return `<svg viewBox="0 0 100 80" width="90" height="72">
                                <line x1="${cx - len/2}" y1="${cy - 10}" x2="${cx + len/2}" y2="${cy - 10}" stroke="#1e88e5" stroke-width="2"/>
                                <line x1="${cx - len/2}" y1="${cy + 10}" x2="${cx + len/2}" y2="${cy + 10}" stroke="#1e88e5" stroke-width="2"/>
                            </svg>`;
                        }
                        return `<svg viewBox="0 0 100 80" width="90" height="72">
                            <line x1="${cx - 18}" y1="${cy - 18}" x2="${cx + 18}" y2="${cy + 14}" stroke="#1e88e5" stroke-width="2"/>
                            <line x1="${cx - 4}" y1="${cy - 22}" x2="${cx + 32}" y2="${cy + 10}" stroke="#1e88e5" stroke-width="2"/>
                        </svg>`;
                    }
                    if (type === 'perpendicular') {
                        return `<svg viewBox="0 0 100 80" width="90" height="72">
                            <line x1="${cx - len/2}" y1="${cy}" x2="${cx + len/2}" y2="${cy}" stroke="#1e88e5" stroke-width="2"/>
                            <line x1="${cx}" y1="${cy - len/2}" x2="${cx}" y2="${cy + len/2}" stroke="#1e88e5" stroke-width="2"/>
                            <rect x="${cx}" y="${cy - 7}" width="7" height="7" fill="none" stroke="#22c55e" stroke-width="1.4"/>
                        </svg>`;
                    }
                    // intersecting (non-perp)
                    return `<svg viewBox="0 0 100 80" width="90" height="72">
                        <line x1="${cx - 22}" y1="${cy - 14}" x2="${cx + 22}" y2="${cy + 14}" stroke="#1e88e5" stroke-width="2"/>
                        <line x1="${cx - 18}" y1="${cy + 18}" x2="${cx + 22}" y2="${cy - 18}" stroke="#1e88e5" stroke-width="2"/>
                    </svg>`;
                }
                const cCount = randInt(2, 3);
                const wCount = randInt(2, 3);
                const wrongTypes = ['parallel', 'perpendicular', 'intersecting'].filter(t => t !== targetType);
                const items = [];
                for (let i = 0; i < cCount; i++) items.push({ type: targetType, variant: i % 2 });
                for (let i = 0; i < wCount; i++) items.push({ type: pick(wrongTypes), variant: i % 2 });
                const shuffled = shuffle(items);
                const opts = shuffled.map((it, i) => ({
                    id: 'opt' + i,
                    svg: _linePairSvg(it.type, it.variant),
                    label: '',
                    correct: it.type === targetType
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL pairs of ${targetType} lines.`;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = targetType === 'parallel' ? 'Parallel lines never meet — they stay the same distance apart.'
                    : targetType === 'perpendicular' ? 'Perpendicular lines meet at a 90° angle.'
                    : 'Intersecting lines cross at a single point (and are not perpendicular).';
                q.printFormat = 'multi-select';
                q.skillLabel = 'Identify Lines';
                return;
            } else if (geoSkill === "identify_lines" && Math.random() < 0.286) {
                // Hot-spot: a multi-line figure, click the parallel/perpendicular pair
                const target = pick(['parallel', 'perpendicular']);
                // Build a 4-line figure with one matching pair and other lines
                // viewBox 0 0 320 220
                // Layout 4 lines as labeled segments a, b, c, d
                const lines = [
                    { id: 'h0', x1: 30, y1: 50, x2: 290, y2: 50, label: 'a' },     // horizontal
                    { id: 'h1', x1: 30, y1: 110, x2: 290, y2: 110, label: 'b' },    // horizontal (parallel to a)
                    { id: 'h2', x1: 60, y1: 30, x2: 60, y2: 200, label: 'c' },     // vertical (perp to a, b)
                    { id: 'h3', x1: 220, y1: 30, x2: 290, y2: 200, label: 'd' }    // diagonal
                ];
                // Determine pair IDs that match target
                let pairAns;
                if (target === 'parallel') {
                    pairAns = ['h0', 'h1']; // a & b
                } else {
                    pairAns = ['h0', 'h2']; // a & c
                }
                const linesSvg = lines.map(L => `<line x1="${L.x1}" y1="${L.y1}" x2="${L.x2}" y2="${L.y2}" stroke="#1e88e5" stroke-width="2.5"/>
                    <text x="${(L.x1 + L.x2) / 2 + 6}" y="${(L.y1 + L.y2) / 2 - 6}" font-size="16" font-weight="700" fill="#1e3a8a">${L.label}</text>`).join('');
                const bgSvg = `<svg viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">${linesSvg}</svg>`;
                // Hot-spots: thick rectangles wrapping each line
                const hotSpots = lines.map(L => {
                    const minX = Math.min(L.x1, L.x2) - 12;
                    const minY = Math.min(L.y1, L.y2) - 12;
                    const w = Math.abs(L.x2 - L.x1) + 24;
                    const h = Math.abs(L.y2 - L.y1) + 24;
                    return { id: L.id, shape: 'rect', x: minX, y: minY, w, h, label: `Line ${L.label}` };
                });
                q.text = `Click the two lines that are ${target}.`;
                q.answerType = 'hot-spot';
                q.backgroundSvg = bgSvg;
                q.hotSpots = hotSpots;
                q.ans = pairAns;
                q.selectMode = 'multi';
                q.hint = target === 'parallel' ? 'Parallel lines never meet and stay the same distance apart.'
                    : 'Perpendicular lines cross at a 90° angle.';
                q.printFormat = 'hot-spot';
                q.skillLabel = 'Identify Lines';
                return;
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
            } else if (geoSkill === "symmetry" && Math.random() < 0.30) {
                // Multi-select: "Click ALL shapes that have a line of symmetry."
                const symPool = [
                    { name: 'heart', sym: true,
                      svg: `<path d="M 50 78 C 18 50, 12 22, 32 18 C 42 16, 50 26, 50 36 C 50 26, 58 16, 68 18 C 88 22, 82 50, 50 78 Z" fill="#fecaca" stroke="#ef4444" stroke-width="2"/>` },
                    { name: 'butterfly', sym: true,
                      svg: `<ellipse cx="32" cy="50" rx="20" ry="28" fill="#bfdbfe" stroke="#1e88e5" stroke-width="2"/><ellipse cx="68" cy="50" rx="20" ry="28" fill="#bfdbfe" stroke="#1e88e5" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="82" stroke="#0c4a6e" stroke-width="2.5"/>` },
                    { name: 'square', sym: true,
                      svg: `<rect x="22" y="22" width="56" height="56" fill="#bbf7d0" stroke="#22c55e" stroke-width="2"/>` },
                    { name: 'isosceles triangle', sym: true,
                      svg: `<polygon points="50,18 84,80 16,80" fill="#fde68a" stroke="#d97706" stroke-width="2"/>` },
                    { name: 'circle', sym: true,
                      svg: `<circle cx="50" cy="50" r="32" fill="#e9d5ff" stroke="#a855f7" stroke-width="2"/>` },
                    { name: 'letter F', sym: false,
                      svg: `<path d="M 30 18 L 30 82 M 30 18 L 70 18 M 30 48 L 60 48" fill="none" stroke="#1e3a8a" stroke-width="6" stroke-linecap="round"/>` },
                    { name: 'letter R', sym: false,
                      svg: `<path d="M 32 82 L 32 20 L 60 20 Q 70 20 70 35 Q 70 50 60 50 L 32 50 M 50 50 L 70 82" fill="none" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>` },
                    { name: 'scalene triangle', sym: false,
                      svg: `<polygon points="20,80 78,68 60,22" fill="#fecaca" stroke="#ef4444" stroke-width="2"/>` },
                    { name: 'parallelogram', sym: false,
                      svg: `<polygon points="22,72 70,72 80,28 32,28" fill="#fde68a" stroke="#d97706" stroke-width="2"/>` }
                ];
                const correctPool = symPool.filter(s => s.sym);
                const wrongPool = symPool.filter(s => !s.sym);
                const cCount = randInt(2, 3);
                const wCount = randInt(2, 3);
                const chosen = shuffle([...shuffle([...correctPool]).slice(0, cCount), ...shuffle([...wrongPool]).slice(0, wCount)]);
                const opts = chosen.map((s, i) => ({
                    id: 'opt' + i,
                    svg: `<svg viewBox="0 0 100 100" width="80" height="80">${s.svg}</svg>`,
                    label: s.name,
                    correct: s.sym
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL shapes that have a line of symmetry.`;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = `A line of symmetry divides a shape into two matching mirror-image halves.`;
                q.printFormat = 'multi-select';
                q.skillLabel = 'Symmetry';
                return;
            } else if (geoSkill === "symmetry" && Math.random() < 0.286) {
                // Hot-spot: a single shape, click the line(s) of symmetry on it
                const symFigs = [
                    {
                        name: 'square',
                        bg: `<rect x="60" y="40" width="120" height="120" fill="#bbf7d0" stroke="#22c55e" stroke-width="2.5"/>` +
                            `<line x1="60" y1="100" x2="180" y2="100" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="120" y1="40" x2="120" y2="160" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="60" y1="40" x2="180" y2="160" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="180" y1="40" x2="60" y2="160" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            // distractors
                            `<line x1="60" y1="70" x2="180" y2="70" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="90" y1="40" x2="90" y2="160" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>`,
                        spots: [
                            { id: 'h0', shape: 'rect', x: 55, y: 95, w: 130, h: 10, label: 'horizontal middle' },
                            { id: 'h1', shape: 'rect', x: 115, y: 35, w: 10, h: 130, label: 'vertical middle' },
                            { id: 'h2', shape: 'polygon', points: '55,40 65,40 185,160 175,160', label: 'diagonal TL-BR' },
                            { id: 'h3', shape: 'polygon', points: '175,40 185,40 65,160 55,160', label: 'diagonal TR-BL' },
                            { id: 'h4', shape: 'rect', x: 55, y: 65, w: 130, h: 10, label: 'horizontal upper' },
                            { id: 'h5', shape: 'rect', x: 85, y: 35, w: 10, h: 130, label: 'vertical left' }
                        ],
                        ans: ['h0', 'h1', 'h2', 'h3']
                    },
                    {
                        name: 'isosceles triangle',
                        bg: `<polygon points="120,40 180,160 60,160" fill="#fde68a" stroke="#d97706" stroke-width="2.5"/>` +
                            `<line x1="120" y1="40" x2="120" y2="160" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="60" y1="100" x2="180" y2="100" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="60" y1="160" x2="180" y2="40" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>`,
                        spots: [
                            { id: 'h0', shape: 'rect', x: 115, y: 35, w: 10, h: 130, label: 'vertical' },
                            { id: 'h1', shape: 'rect', x: 55, y: 95, w: 130, h: 10, label: 'horizontal' },
                            { id: 'h2', shape: 'polygon', points: '55,160 65,160 185,40 175,40', label: 'diagonal' }
                        ],
                        ans: ['h0']
                    },
                    {
                        name: 'rectangle',
                        bg: `<rect x="40" y="60" width="160" height="80" fill="#dcfce7" stroke="#22c55e" stroke-width="2.5"/>` +
                            `<line x1="40" y1="100" x2="200" y2="100" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="120" y1="60" x2="120" y2="140" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="40" y1="60" x2="200" y2="140" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>` +
                            `<line x1="200" y1="60" x2="40" y2="140" stroke-dasharray="4,3" stroke="#94a3b8" stroke-width="1.5"/>`,
                        spots: [
                            { id: 'h0', shape: 'rect', x: 35, y: 95, w: 170, h: 10, label: 'horizontal' },
                            { id: 'h1', shape: 'rect', x: 115, y: 55, w: 10, h: 90, label: 'vertical' },
                            { id: 'h2', shape: 'polygon', points: '35,60 45,60 205,140 195,140', label: 'diagonal TL-BR' },
                            { id: 'h3', shape: 'polygon', points: '195,60 205,60 45,140 35,140', label: 'diagonal TR-BL' }
                        ],
                        ans: ['h0', 'h1']
                    }
                ];
                const fig = pick(symFigs);
                const bgSvg = `<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">${fig.bg}</svg>`;
                q.text = `Click ALL the lines of symmetry on this ${fig.name}.`;
                q.answerType = 'hot-spot';
                q.backgroundSvg = bgSvg;
                q.hotSpots = fig.spots;
                q.ans = fig.ans;
                q.selectMode = 'multi';
                q.hint = `A line of symmetry divides the shape into two matching halves.`;
                q.printFormat = 'hot-spot';
                q.skillLabel = 'Symmetry';
                return;
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
                // BOTH identify AND plot modes use the new coord-input answerType
                // (separate x/y boxes). Plot mode just shows an empty grid + the
                // target coords in q.text — student types the coords back.
                q.ans = points.length === 1
                    ? { x: points[0].x, y: points[0].y }
                    : points.map(p => ({ label: p.label, x: p.x, y: p.y }));
                q.answerType = "coord-input";
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

                // Build points SVG (for identify mode only).
                // Plot mode: NO dashed-circle placeholders — show an empty
                // grid; the target coordinates appear in q.text and the
                // student types them into the coord-input boxes.
                let pointsSVG = '';
                if (problemType === "identify") {
                    points.forEach((p, idx) => {
                        const px = origin.x + p.x * gridSpacing;
                        const py = origin.y - p.y * gridSpacing;
                        const colors = ['#e53935', '#43a047', '#1e88e5'];
                        // Show the points, student identifies coordinates
                        pointsSVG += `<circle cx="${px}" cy="${py}" r="7" fill="${colors[idx]}"/>`;
                        // Position label to not overlap with point - offset based on quadrant
                        const labelOffsetX = p.x >= 0 ? 12 : -12;
                        const labelOffsetY = p.y >= 0 ? -10 : 15;
                        pointsSVG += `<text x="${px + labelOffsetX}" y="${py + labelOffsetY}" fill="${colors[idx]}" font-size="14" font-weight="bold" text-anchor="${p.x >= 0 ? 'start' : 'end'}">${p.label}</text>`;
                    });
                }

                // Build answer input area — both modes use the new coord-input
                // format (parens + comma + two numeric boxes per point).
                if (problemType === "identify") {
                    q.text = numPoints === 1
                        ? `What are the coordinates of point ${points[0].label}?`
                        : `What are the coordinates of each point?`;
                    q.hint = `Read the x-coordinate (horizontal) first, then y-coordinate (vertical).`;
                } else {
                    // Plot mode — coords in text, empty grid, student types coords back
                    const coordList = points.map(p => `${p.label}: (${p.x}, ${p.y})`).join(', ');
                    q.text = numPoints === 1
                        ? `Plot point ${points[0].label} at (${points[0].x}, ${points[0].y})`
                        : `Plot these points: ${coordList}`;
                    q.hint = `Find the x-value on the horizontal axis, then go up/down to the y-value. Type the coordinates of each point.`;
                }

                const colors = ['#e53935', '#43a047', '#1e88e5'];
                const answerInputs = `<div class="ci-host">
                    ${points.map((p, idx) => `
                        <div class="ci-row">
                            <span class="ci-label" style="color:${colors[idx]};">${p.label}:</span>
                            <span class="ci-paren">(</span>
                            <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="ci-x" id="ciX_${idx}" data-point="${idx}" data-axis="x" maxlength="4" autocomplete="off" />
                            <span class="ci-comma">,</span>
                            <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="ci-y" id="ciY_${idx}" data-point="${idx}" data-axis="y" maxlength="4" autocomplete="off" />
                            <span class="ci-paren">)</span>
                        </div>
                    `).join('')}
                    <button class="ci-submit primary-btn" id="ciSubmitBtn" type="button" onclick="submitAnswer()">Check</button>
                </div>`;

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
                // Both modes use the coord-input print format (separate X/Y boxes);
                // plot mode just shows an empty grid + coords in text.
                q.printFormat = problemType === "identify" ? "coord-input" : "geometry-coordinates";
            } else if (geoSkill === "area_distributive_visual") {
                // ===== AREA DISTRIBUTIVE VISUAL (Grade 4) — Phase 5 batch 4 =====
                // Band 201-210, MD domain. Rectangle split into TWO sub-rectangles
                // (vertical or horizontal split). Label width and the two sub-heights.
                // Ask "What is the total area?" — solver should see (h1+h2)*w distributed.
                const orientation = pick(['horizontal', 'vertical']);
                // Use range to scale dims; cap so SVG is readable
                const dimMax = Math.max(8, Math.min(20, Math.ceil(Math.sqrt(state.range))));
                const w = randInt(3, dimMax);          // shared width
                const h1 = randInt(2, Math.max(3, Math.floor(dimMax * 0.6)));
                const h2 = randInt(2, Math.max(3, Math.floor(dimMax * 0.6)));
                const totalArea = w * (h1 + h2);
                const part1Area = w * h1;
                const part2Area = w * h2;

                // Build SVG of the split rectangle
                const SCALE = 16;          // px per unit
                const padX = 50, padY = 30;
                const rectW = w * SCALE;
                let svg = '';
                if (orientation === 'horizontal') {
                    // Stacked: two rectangles sharing width, different heights
                    const rectH1 = h1 * SCALE;
                    const rectH2 = h2 * SCALE;
                    const totalH = rectH1 + rectH2;
                    const W = rectW + padX * 2;
                    const H = totalH + padY * 2;
                    svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 320)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                        <rect x="${padX}" y="${padY}" width="${rectW}" height="${rectH1}" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
                        <rect x="${padX}" y="${padY + rectH1}" width="${rectW}" height="${rectH2}" fill="#fff3e0" stroke="#1565c0" stroke-width="2"/>
                        <line x1="${padX}" y1="${padY + rectH1}" x2="${padX + rectW}" y2="${padY + rectH1}" stroke="#1565c0" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <text x="${padX + rectW / 2}" y="${padY - 8}" text-anchor="middle" font-size="14" font-weight="700" fill="#333">${w}</text>
                        <text x="${padX - 8}" y="${padY + rectH1 / 2 + 4}" text-anchor="end" font-size="14" font-weight="700" fill="#1565c0">${h1}</text>
                        <text x="${padX - 8}" y="${padY + rectH1 + rectH2 / 2 + 4}" text-anchor="end" font-size="14" font-weight="700" fill="#ff9800">${h2}</text>
                    </svg>`;
                } else {
                    // Side-by-side: two rectangles sharing height (=w), different widths (=h1, h2 in this swap)
                    // Re-label so "width" labeled along top is the shared dimension; sub-widths along bottom.
                    const rectH = w * SCALE;
                    const rectW1 = h1 * SCALE;
                    const rectW2 = h2 * SCALE;
                    const totalW = rectW1 + rectW2;
                    const W = totalW + padX * 2;
                    const H = rectH + padY * 2;
                    svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 340)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                        <rect x="${padX}" y="${padY}" width="${rectW1}" height="${rectH}" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
                        <rect x="${padX + rectW1}" y="${padY}" width="${rectW2}" height="${rectH}" fill="#fff3e0" stroke="#1565c0" stroke-width="2"/>
                        <line x1="${padX + rectW1}" y1="${padY}" x2="${padX + rectW1}" y2="${padY + rectH}" stroke="#1565c0" stroke-width="2.5" stroke-dasharray="6,4"/>
                        <text x="${padX - 8}" y="${padY + rectH / 2 + 4}" text-anchor="end" font-size="14" font-weight="700" fill="#333">${w}</text>
                        <text x="${padX + rectW1 / 2}" y="${padY + rectH + 18}" text-anchor="middle" font-size="14" font-weight="700" fill="#1565c0">${h1}</text>
                        <text x="${padX + rectW1 + rectW2 / 2}" y="${padY + rectH + 18}" text-anchor="middle" font-size="14" font-weight="700" fill="#ff9800">${h2}</text>
                    </svg>`;
                }

                q.text = `The rectangle is split into two parts. What is the TOTAL area?`;
                q.ans = totalArea;
                q.answerType = "number";
                q.hint = `Use the distributive property: ${w} × (${h1} + ${h2}) = ${w} × ${h1} + ${w} × ${h2} = ${part1Area} + ${part2Area} = ${totalArea} square units.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Distributive Area Model</div>
                    ${svg}
                    <div style="margin-top:8px;font-size:0.92rem;color:var(--text-dim);">Find the area of EACH part, then add.</div>
                </div>`;
                q.skillLabel = "Distributive Area";
                q.printFormat = "area-distributive";
                q.areaDistData = { w, h1, h2, part1Area, part2Area, totalArea, orientation };
            } else if (geoSkill === "area_triangle") {
                // ===== AREA OF A TRIANGLE (Grade 6) — Phase 5 batch 4 =====
                // Band 221-230, MD. Right triangle with base b and height h labeled.
                // Area = b*h/2. Pick even product so answer is whole.
                const dimMax = Math.max(8, Math.min(20, Math.ceil(Math.sqrt(state.range))));
                let base = randInt(2, dimMax);
                let height = randInt(2, dimMax);
                // Ensure base*height is even so area is a whole number
                if ((base * height) % 2 !== 0) {
                    if (base % 2 === 1) base = base + 1 > dimMax ? base - 1 : base + 1;
                    else height = height + 1 > dimMax ? height - 1 : height + 1;
                }
                if (base < 2) base = 2;
                if (height < 2) height = 2;
                const area = (base * height) / 2;

                const SCALE = 14;
                const padL = 40, padB = 40, padT = 20, padR = 20;
                const triW = base * SCALE;
                const triH = height * SCALE;
                const W = triW + padL + padR;
                const H = triH + padT + padB;
                // Right triangle: right angle at bottom-left
                const x0 = padL, y0 = padT + triH;
                const xR = padL + triW;
                const yT = padT;
                const svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 320)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                    <polygon points="${x0},${y0} ${xR},${y0} ${x0},${yT}" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
                    <!-- right-angle marker -->
                    <rect x="${x0}" y="${y0 - 10}" width="10" height="10" fill="none" stroke="#1565c0" stroke-width="1"/>
                    <!-- base label -->
                    <text x="${x0 + triW / 2}" y="${y0 + 22}" text-anchor="middle" font-size="14" font-weight="700" fill="#333">b = ${base}</text>
                    <!-- height label -->
                    <text x="${x0 - 8}" y="${y0 - triH / 2 + 4}" text-anchor="end" font-size="14" font-weight="700" fill="#333">h = ${height}</text>
                </svg>`;

                q.text = `What is the area of this triangle?`;
                q.ans = area;
                q.answerType = "number";
                q.hint = `Area of a triangle = (base × height) ÷ 2 = (${base} × ${height}) ÷ 2 = ${base * height} ÷ 2 = ${area} square units.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Area of a Triangle</div>
                    ${svg}
                    <div style="margin-top:8px;font-size:0.92rem;color:var(--text-dim);">Use A = (b × h) ÷ 2.</div>
                </div>`;
                q.skillLabel = "Triangle Area";
                q.printFormat = "area-triangle";
                q.triangleData = { base, height, area };
            } else if (geoSkill === "area_polygon_decompose") {
                // ===== DECOMPOSE POLYGON AREA (Grade 6) — Phase 5 batch 4 =====
                // Band 221-230, MD. L/T/U-shape on a grid; sum sub-rectangle areas.
                const dimMax = Math.max(6, Math.min(12, Math.ceil(Math.sqrt(state.range))));
                const shapeKind = pick(['L', 'T', 'U']);

                const GRID = 22; // px per unit
                let polygon = '';      // points string
                let sideLabels = '';
                let totalArea = 0;
                let dimsTxt = '';
                let bbW = 0, bbH = 0;

                if (shapeKind === 'L') {
                    // L-shape: bottom rectangle (bw x bh) + top-left tower (tw x th)
                    const bw = randInt(5, dimMax);
                    const bh = randInt(2, Math.max(3, Math.floor(dimMax * 0.5)));
                    const tw = randInt(2, Math.max(3, Math.floor(bw * 0.5)));
                    const th = randInt(2, Math.max(3, Math.floor(dimMax * 0.5)));
                    bbW = bw; bbH = bh + th;
                    // Polygon (in grid units, then scale): bottom-left CCW
                    // (0, bh+th), (tw, bh+th)... wait simpler: top to bottom — start top-left of tower
                    // Use coordinate where (0,0) is top-left of bbox, x right, y down
                    const pts = [
                        [0, 0], [tw, 0], [tw, th], [bw, th], [bw, th + bh], [0, th + bh]
                    ];
                    polygon = pts.map(([x, y]) => `${x * GRID},${y * GRID}`).join(' ');
                    totalArea = (tw * th) + (bw * bh);
                    dimsTxt = `tower ${tw}×${th} + base ${bw}×${bh}`;
                    // Side labels
                    sideLabels = `
                        <text x="${(tw / 2) * GRID}" y="-6" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${tw}</text>
                        <text x="${tw * GRID + 6}" y="${(th / 2) * GRID + 4}" font-size="12" font-weight="700" fill="#333">${th}</text>
                        <text x="${((tw + bw) / 2) * GRID}" y="${th * GRID + 14}" text-anchor="middle" font-size="12" font-weight="700" fill="#555">${bw - tw}</text>
                        <text x="${bw * GRID + 6}" y="${(th + bh / 2) * GRID + 4}" font-size="12" font-weight="700" fill="#333">${bh}</text>
                        <text x="${(bw / 2) * GRID}" y="${(th + bh) * GRID + 14}" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${bw}</text>
                        <text x="-6" y="${((th + bh) / 2) * GRID + 4}" text-anchor="end" font-size="12" font-weight="700" fill="#333">${th + bh}</text>
                    `;
                } else if (shapeKind === 'T') {
                    // T-shape: top horizontal bar (tw x th) + center stem (sw x sh)
                    const tw = randInt(5, dimMax);
                    const th = randInt(2, Math.max(3, Math.floor(dimMax * 0.4)));
                    const sw = randInt(2, Math.max(3, Math.floor(tw * 0.5)));
                    const sh = randInt(2, Math.max(3, Math.floor(dimMax * 0.5)));
                    const off = Math.floor((tw - sw) / 2);
                    bbW = tw; bbH = th + sh;
                    const pts = [
                        [0, 0], [tw, 0], [tw, th], [off + sw, th], [off + sw, th + sh],
                        [off, th + sh], [off, th], [0, th]
                    ];
                    polygon = pts.map(([x, y]) => `${x * GRID},${y * GRID}`).join(' ');
                    totalArea = (tw * th) + (sw * sh);
                    dimsTxt = `top ${tw}×${th} + stem ${sw}×${sh}`;
                    sideLabels = `
                        <text x="${(tw / 2) * GRID}" y="-6" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${tw}</text>
                        <text x="${tw * GRID + 6}" y="${(th / 2) * GRID + 4}" font-size="12" font-weight="700" fill="#333">${th}</text>
                        <text x="${((off + sw + tw / 2) / 2) * GRID + (off + sw) * GRID / 2}" y="${th * GRID - 4}" text-anchor="middle" font-size="11" fill="#555"></text>
                        <text x="${(off + sw / 2) * GRID}" y="${(th + sh) * GRID + 14}" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${sw}</text>
                        <text x="${(off + sw) * GRID + 6}" y="${(th + sh / 2) * GRID + 4}" font-size="12" font-weight="700" fill="#333">${sh}</text>
                        <text x="-6" y="${(th / 2) * GRID + 4}" text-anchor="end" font-size="12" font-weight="700" fill="#333">${th}</text>
                    `;
                } else {
                    // U-shape: outer rectangle minus a center "cut" from the top
                    const w = randInt(5, dimMax);
                    const h = randInt(4, Math.max(5, dimMax));
                    const cw = Math.max(2, Math.floor(w / 3));
                    const ch = Math.max(2, Math.floor(h / 2));
                    const off = Math.floor((w - cw) / 2);
                    bbW = w; bbH = h;
                    // U outline: bottom-left corner → CCW around shape with a notch from top
                    const pts = [
                        [0, 0], [off, 0], [off, ch], [off + cw, ch], [off + cw, 0],
                        [w, 0], [w, h], [0, h]
                    ];
                    polygon = pts.map(([x, y]) => `${x * GRID},${y * GRID}`).join(' ');
                    totalArea = (w * h) - (cw * ch);
                    dimsTxt = `outer ${w}×${h} − cut ${cw}×${ch}`;
                    sideLabels = `
                        <text x="${(off / 2) * GRID}" y="-6" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${off}</text>
                        <text x="${(off + cw + (w - off - cw) / 2) * GRID}" y="-6" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${w - off - cw}</text>
                        <text x="${(off + cw / 2) * GRID}" y="${ch * GRID + 14}" text-anchor="middle" font-size="11" font-weight="700" fill="#555">${cw}</text>
                        <text x="${off * GRID - 6}" y="${(ch / 2) * GRID + 4}" text-anchor="end" font-size="11" font-weight="700" fill="#555">${ch}</text>
                        <text x="${w * GRID + 6}" y="${(h / 2) * GRID + 4}" font-size="12" font-weight="700" fill="#333">${h}</text>
                        <text x="${(w / 2) * GRID}" y="${h * GRID + 14}" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${w}</text>
                        <text x="-6" y="${(h / 2) * GRID + 4}" text-anchor="end" font-size="12" font-weight="700" fill="#333">${h}</text>
                    `;
                }

                const pad = 26;
                const W = bbW * GRID + pad * 2;
                const H = bbH * GRID + pad * 2;
                // Light grid lines for decomposition help
                let gridLines = '';
                for (let i = 0; i <= bbW; i++) {
                    gridLines += `<line x1="${i * GRID}" y1="0" x2="${i * GRID}" y2="${bbH * GRID}" stroke="#e0e0e0" stroke-width="0.6"/>`;
                }
                for (let j = 0; j <= bbH; j++) {
                    gridLines += `<line x1="0" y1="${j * GRID}" x2="${bbW * GRID}" y2="${j * GRID}" stroke="#e0e0e0" stroke-width="0.6"/>`;
                }
                const svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 360)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                    <g transform="translate(${pad},${pad})">
                        ${gridLines}
                        <polygon points="${polygon}" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
                        ${sideLabels}
                    </g>
                </svg>`;

                q.text = `What is the total area of this ${shapeKind}-shape?`;
                q.ans = totalArea;
                q.answerType = "number";
                q.hint = `Decompose into rectangles: ${dimsTxt} = ${totalArea} square units.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Decompose Polygon Area</div>
                    ${svg}
                    <div style="margin-top:8px;font-size:0.92rem;color:var(--text-dim);">Split the shape into rectangles, find each area, then add (or subtract).</div>
                </div>`;
                q.skillLabel = "Decompose Area";
                q.printFormat = "area-polygon-decompose";
                q.polygonDecomposeData = { shapeKind, polygon, totalArea, bbW, bbH, GRID, dimsTxt };
            } else if (geoSkill === "coord_polygon") {
                // ===== POLYGON ON COORD GRID (Grade 6) — Phase 5 batch 4 =====
                // Band 221-230, G. 3 or 4 vertices in Q1 with horizontal/vertical sides only.
                // Ask side length OR perimeter.
                const maxCoord = Math.min(Math.max(8, Math.floor(state.range / 10)), 12);
                const numVerts = pick([3, 4, 4, 4]); // weight rectangles slightly
                let vertices = []; // [{x,y,label}]
                if (numVerts === 4) {
                    // Axis-aligned rectangle: pick two x's and two y's, distinct
                    let x1 = randInt(1, maxCoord - 2), x2 = randInt(x1 + 2, maxCoord);
                    let y1 = randInt(1, maxCoord - 2), y2 = randInt(y1 + 2, maxCoord);
                    vertices = [
                        { x: x1, y: y1, label: 'A' },
                        { x: x2, y: y1, label: 'B' },
                        { x: x2, y: y2, label: 'C' },
                        { x: x1, y: y2, label: 'D' },
                    ];
                } else {
                    // Right triangle: one horizontal leg + one vertical leg sharing a corner.
                    let x1 = randInt(1, maxCoord - 2), x2 = randInt(x1 + 2, maxCoord);
                    let y1 = randInt(1, maxCoord - 2), y2 = randInt(y1 + 2, maxCoord);
                    // Hypotenuse is diagonal — we won't ask its length to keep it horizontal/vertical only.
                    vertices = [
                        { x: x1, y: y1, label: 'A' },
                        { x: x2, y: y1, label: 'B' },
                        { x: x1, y: y2, label: 'C' }, // forms right angle at A
                    ];
                }

                // Compute side lengths between consecutive vertices (only horiz/vert sides counted)
                const sides = [];
                for (let i = 0; i < vertices.length; i++) {
                    const A = vertices[i], B = vertices[(i + 1) % vertices.length];
                    if (A.x === B.x) sides.push({ from: A.label, to: B.label, length: Math.abs(A.y - B.y), kind: 'vertical' });
                    else if (A.y === B.y) sides.push({ from: A.label, to: B.label, length: Math.abs(A.x - B.x), kind: 'horizontal' });
                    else sides.push({ from: A.label, to: B.label, length: null, kind: 'diagonal' });
                }
                const horizVertSides = sides.filter(s => s.length !== null);
                const perimeterHV = horizVertSides.reduce((sum, s) => sum + s.length, 0);

                // Pick question type
                let askPerimeter;
                if (numVerts === 3) askPerimeter = false; // triangle has a diagonal — only ask side length
                else askPerimeter = Math.random() < 0.5;

                let qText, ans, qHint;
                if (askPerimeter) {
                    qText = `Find the perimeter of the polygon with vertices ${vertices.map(v => `${v.label}(${v.x}, ${v.y})`).join(', ')}.`;
                    ans = perimeterHV;
                    qHint = `Add the side lengths: ${horizVertSides.map(s => s.length).join(' + ')} = ${perimeterHV} units.`;
                } else {
                    const target = pick(horizVertSides);
                    qText = `What is the length of side ${target.from}${target.to}?`;
                    ans = target.length;
                    qHint = target.kind === 'horizontal'
                        ? `Both points share the same y, so length = |${vertices.find(v => v.label === target.from).x} − ${vertices.find(v => v.label === target.to).x}| = ${target.length} units.`
                        : `Both points share the same x, so length = |${vertices.find(v => v.label === target.from).y} − ${vertices.find(v => v.label === target.to).y}| = ${target.length} units.`;
                }

                // Build SVG
                const gridSpacing = Math.max(20, Math.floor(280 / maxCoord));
                const gridSize = maxCoord * gridSpacing + 40;
                const origin = { x: 24, y: gridSize - 24 };
                let gridLines = '';
                let axisLabels = '';
                for (let i = 0; i <= maxCoord; i++) {
                    const xPos = origin.x + i * gridSpacing;
                    const yPos = origin.y - i * gridSpacing;
                    gridLines += `<line x1="${xPos}" y1="${origin.y}" x2="${xPos}" y2="${origin.y - maxCoord * gridSpacing}" stroke="#e0e0e0" stroke-width="1"/>`;
                    gridLines += `<line x1="${origin.x}" y1="${yPos}" x2="${origin.x + maxCoord * gridSpacing}" y2="${yPos}" stroke="#e0e0e0" stroke-width="1"/>`;
                    if (i > 0 && i % (maxCoord > 10 ? 2 : 1) === 0) {
                        axisLabels += `<text x="${xPos}" y="${origin.y + 14}" text-anchor="middle" fill="#444" font-size="10">${i}</text>`;
                        axisLabels += `<text x="${origin.x - 8}" y="${yPos + 4}" text-anchor="end" fill="#444" font-size="10">${i}</text>`;
                    }
                }
                const polygonPts = vertices.map(v => `${origin.x + v.x * gridSpacing},${origin.y - v.y * gridSpacing}`).join(' ');
                const polygonSvg = `<polygon points="${polygonPts}" fill="#e3f2fd" fill-opacity="0.55" stroke="#1565c0" stroke-width="2.5"/>`;
                const vertexMarks = vertices.map(v => {
                    const px = origin.x + v.x * gridSpacing;
                    const py = origin.y - v.y * gridSpacing;
                    return `<circle cx="${px}" cy="${py}" r="5" fill="#e53935"/>` +
                           `<text x="${px + 8}" y="${py - 6}" font-size="13" font-weight="700" fill="#e53935">${v.label}(${v.x},${v.y})</text>`;
                }).join('');

                q.text = qText;
                q.ans = ans;
                q.answerType = "number";
                q.hint = qHint;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Polygon on a Coordinate Grid</div>
                    <svg width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" style="background:var(--bg-card);border-radius:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;max-width:100%;">
                        ${gridLines}
                        <line x1="${origin.x}" y1="${origin.y}" x2="${origin.x + maxCoord * gridSpacing}" y2="${origin.y}" stroke="currentColor" stroke-width="2"/>
                        <line x1="${origin.x}" y1="${origin.y}" x2="${origin.x}" y2="${origin.y - maxCoord * gridSpacing}" stroke="currentColor" stroke-width="2"/>
                        ${axisLabels}
                        <text x="${origin.x + maxCoord * gridSpacing - 6}" y="${origin.y - 6}" fill="currentColor" font-size="12" font-weight="700">x</text>
                        <text x="${origin.x + 6}" y="${origin.y - maxCoord * gridSpacing + 12}" fill="currentColor" font-size="12" font-weight="700">y</text>
                        ${polygonSvg}
                        ${vertexMarks}
                    </svg>
                </div>`;
                q.skillLabel = "Coord Polygon";
                q.printFormat = "coord-polygon";
                q.coordPolygonData = { vertices, sides, askPerimeter, ans, maxCoord };
            } else if (geoSkill === "net_surface_area") {
                // ===== NET → SURFACE AREA (Grade 6) — Phase 5 batch 4 =====
                // Band 221-230, G. Either:
                //   - "Which 3D shape does this net form?" (multiple-choice)
                //   - "What is the surface area?" (numeric, sum of face areas)
                const askKind = Math.random() < 0.5 ? 'identify' : 'sa';
                // Net types: cube (6 squares cross), rect prism (T-net w/ 4 long + 2 sqr ends)
                const shapeChoice = pick(['cube', 'rect_prism']);
                const dimMax = Math.max(4, Math.min(10, Math.ceil(Math.sqrt(state.range))));

                let l, w, h, surfaceArea, shapeName, faceLayout;
                if (shapeChoice === 'cube') {
                    const s = randInt(2, dimMax);
                    l = w = h = s;
                    surfaceArea = 6 * s * s;
                    shapeName = 'Cube';
                    faceLayout = 'cube';
                } else {
                    l = randInt(2, dimMax);
                    w = randInt(2, dimMax);
                    h = randInt(2, dimMax);
                    if (l === w && w === h) h = h + 1; // ensure non-cube prism
                    surfaceArea = 2 * (l * w + l * h + w * h);
                    shapeName = 'Rectangular Prism';
                    faceLayout = 'rect_prism';
                }

                // Build the net SVG (cross / T layout)
                const SCALE = 22;
                let svg = '';
                let netW = 0, netH = 0;
                const STROKE = '#1565c0', FILL = '#e3f2fd';
                if (faceLayout === 'cube') {
                    // 6 squares in a cross: 1 in middle row x4, plus one above middle column, one below
                    const s = l;
                    const sp = s * SCALE;
                    netW = 4 * sp;
                    netH = 3 * sp;
                    const xs = [0, sp, 2 * sp, 3 * sp];
                    const middleY = sp;
                    // Cross: middle row (4 squares) at row=middleY, top square above col 1, bottom square below col 1
                    const faces = [
                        { x: xs[0], y: middleY, label: s }, // left
                        { x: xs[1], y: middleY, label: s },
                        { x: xs[2], y: middleY, label: s },
                        { x: xs[3], y: middleY, label: s },
                        { x: xs[1], y: 0, label: s },        // top
                        { x: xs[1], y: 2 * sp, label: s },   // bottom
                    ];
                    svg = faces.map(f => `<rect x="${f.x}" y="${f.y}" width="${sp}" height="${sp}" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`).join('') +
                        // Label one face dimension
                        `<text x="${xs[1] + sp / 2}" y="${middleY + sp / 2 + 4}" text-anchor="middle" font-size="13" font-weight="700" fill="#333">${s}</text>` +
                        `<text x="${xs[1] - 6}" y="${middleY + sp / 2 + 4}" text-anchor="end" font-size="11" fill="#555">${s}</text>`;
                } else {
                    // Rect prism net: T-layout
                    // Row of 4 long faces (l wide x h tall, w wide x h tall, l wide x h tall, w wide x h tall) with 2 ends (l x w) above and below the first long face
                    const lpx = l * SCALE, wpx = w * SCALE, hpx = h * SCALE;
                    const rowW = 2 * (lpx + wpx);
                    netW = rowW;
                    netH = wpx + hpx + wpx;
                    const middleY = wpx;
                    let x = 0;
                    const rects = [];
                    rects.push({ x, y: middleY, w: lpx, h: hpx, lbl: { wTxt: l, hTxt: h } }); x += lpx;
                    rects.push({ x, y: middleY, w: wpx, h: hpx, lbl: { wTxt: w, hTxt: h } }); x += wpx;
                    rects.push({ x, y: middleY, w: lpx, h: hpx, lbl: { wTxt: l, hTxt: h } }); x += lpx;
                    rects.push({ x, y: middleY, w: wpx, h: hpx, lbl: { wTxt: w, hTxt: h } });
                    // Top end above first long face: l x w
                    rects.push({ x: 0, y: 0, w: lpx, h: wpx, lbl: { wTxt: l, hTxt: w } });
                    // Bottom end below first long face: l x w
                    rects.push({ x: 0, y: middleY + hpx, w: lpx, h: wpx, lbl: { wTxt: l, hTxt: w } });

                    svg = rects.map(r => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="${FILL}" stroke="${STROKE}" stroke-width="2"/>`).join('');
                    // Add labels on first long face
                    svg += `<text x="${lpx / 2}" y="${middleY + hpx / 2 + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${l} × ${h}</text>`;
                    svg += `<text x="${lpx / 2}" y="${wpx / 2 + 4}" text-anchor="middle" font-size="12" font-weight="700" fill="#333">${l} × ${w}</text>`;
                }

                const padN = 18;
                const fullW = netW + padN * 2;
                const fullH = netH + padN * 2;
                const netSvg = `<svg viewBox="0 0 ${fullW} ${fullH}" width="${Math.min(fullW, 380)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                    <g transform="translate(${padN},${padN})">${svg}</g>
                </svg>`;

                if (askKind === 'identify') {
                    // Multiple-choice 3D shape identification
                    q.text = `Which 3D shape does this net form?`;
                    q.ans = shapeName;
                    q.answerType = "multiple-choice";
                    q.options = shuffle(["Cube", "Rectangular Prism", "Triangular Prism", "Square Pyramid"]);
                    if (!q.options.includes(shapeName)) {
                        q.options[q.options.length - 1] = shapeName;
                        q.options = shuffle(q.options);
                    }
                    q.hint = faceLayout === 'cube'
                        ? `All 6 faces are equal squares — this is a cube.`
                        : `4 rectangles in a row + 2 ends = rectangular prism.`;
                } else {
                    q.text = `What is the surface area of the 3D shape this net forms?`;
                    q.ans = surfaceArea;
                    q.answerType = "number";
                    q.hint = faceLayout === 'cube'
                        ? `Cube SA = 6 × s² = 6 × ${l}² = 6 × ${l * l} = ${surfaceArea} sq units.`
                        : `Rect prism SA = 2(lw + lh + wh) = 2(${l * w} + ${l * h} + ${w * h}) = 2 × ${l * w + l * h + w * h} = ${surfaceArea} sq units.`;
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Net of a 3D Shape</div>
                    ${netSvg}
                    <div style="margin-top:8px;font-size:0.92rem;color:var(--text-dim);">Each rectangle is a face of the 3D shape.</div>
                </div>`;
                q.skillLabel = "Net & SA";
                q.printFormat = "net-surface-area";
                q.netData = { shapeName, faceLayout, l, w, h, surfaceArea, askKind };
            } else if (geoSkill === "coord_distance_q1") {
                // ===== COORD DISTANCE Q1 (Grade 5) — Phase 5 batch 2 =====
                // Band 211-220, G domain. Two points in Q1 sharing x or y coord.
                // Distance is |y1 - y2| (vertical) or |x1 - x2| (horizontal).
                const maxCoord = Math.min(Math.max(8, Math.floor(state.range / 10)), 12);
                const sharedAxis = pick(['x', 'y']); // share x → vertical line; share y → horizontal line
                let A, B, distance;
                if (sharedAxis === 'x') {
                    const sharedX = randInt(1, maxCoord);
                    let y1 = randInt(1, maxCoord);
                    let y2 = randInt(1, maxCoord);
                    while (y1 === y2) y2 = randInt(1, maxCoord);
                    A = { x: sharedX, y: y1, label: 'A' };
                    B = { x: sharedX, y: y2, label: 'B' };
                    distance = Math.abs(y1 - y2);
                } else {
                    const sharedY = randInt(1, maxCoord);
                    let x1 = randInt(1, maxCoord);
                    let x2 = randInt(1, maxCoord);
                    while (x1 === x2) x2 = randInt(1, maxCoord);
                    A = { x: x1, y: sharedY, label: 'A' };
                    B = { x: x2, y: sharedY, label: 'B' };
                    distance = Math.abs(x1 - x2);
                }

                // 4-option MC near distance
                const optsSet = new Set([distance]);
                const candidates = [distance + 1, Math.max(1, distance - 1), distance + 2, Math.max(1, distance - 2),
                                    A.x + B.x, A.y + B.y];
                for (const c of shuffle(candidates)) {
                    if (optsSet.size >= 4) break;
                    if (c >= 1 && c !== distance) optsSet.add(c);
                }
                while (optsSet.size < 4) {
                    const c = randInt(1, maxCoord * 2);
                    if (c !== distance) optsSet.add(c);
                }

                // Build SVG (Q1 grid)
                const gridSpacing = Math.max(20, Math.floor(280 / maxCoord));
                const gridSize = maxCoord * gridSpacing + 40;
                const origin = { x: 24, y: gridSize - 24 };
                let gridLines = '';
                let axisLabels = '';
                for (let i = 0; i <= maxCoord; i++) {
                    const xPos = origin.x + i * gridSpacing;
                    const yPos = origin.y - i * gridSpacing;
                    // Vertical
                    gridLines += `<line x1="${xPos}" y1="${origin.y}" x2="${xPos}" y2="${origin.y - maxCoord * gridSpacing}" stroke="#e0e0e0" stroke-width="1"/>`;
                    // Horizontal
                    gridLines += `<line x1="${origin.x}" y1="${yPos}" x2="${origin.x + maxCoord * gridSpacing}" y2="${yPos}" stroke="#e0e0e0" stroke-width="1"/>`;
                    if (i > 0 && i % (maxCoord > 10 ? 2 : 1) === 0) {
                        axisLabels += `<text x="${xPos}" y="${origin.y + 14}" text-anchor="middle" fill="#444" font-size="10">${i}</text>`;
                        axisLabels += `<text x="${origin.x - 8}" y="${yPos + 4}" text-anchor="end" fill="#444" font-size="10">${i}</text>`;
                    }
                }

                // Plot two points + connecting segment
                const pxA = origin.x + A.x * gridSpacing;
                const pyA = origin.y - A.y * gridSpacing;
                const pxB = origin.x + B.x * gridSpacing;
                const pyB = origin.y - B.y * gridSpacing;
                const segment = `<line x1="${pxA}" y1="${pyA}" x2="${pxB}" y2="${pyB}" stroke="#7b1fa2" stroke-width="2.5"/>`;
                const ptA = `<circle cx="${pxA}" cy="${pyA}" r="6" fill="#e53935" stroke="#fff" stroke-width="1.5"/><text x="${pxA + 10}" y="${pyA - 8}" fill="#e53935" font-size="13" font-weight="700">A(${A.x},${A.y})</text>`;
                const ptB = `<circle cx="${pxB}" cy="${pyB}" r="6" fill="#1e88e5" stroke="#fff" stroke-width="1.5"/><text x="${pxB + 10}" y="${pyB - 8}" fill="#1e88e5" font-size="13" font-weight="700">B(${B.x},${B.y})</text>`;

                q.text = `What is the distance between A(${A.x}, ${A.y}) and B(${B.x}, ${B.y})?`;
                q.ans = distance;
                q.answerType = "number";
                q.options = shuffle([...optsSet]);
                q.hint = sharedAxis === 'x'
                    ? `Both points share x = ${A.x}, so the distance is |${A.y} − ${B.y}| = ${distance} units.`
                    : `Both points share y = ${A.y}, so the distance is |${A.x} − ${B.x}| = ${distance} units.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Distance Between Points</div>
                    <svg width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" style="background:var(--bg-card);border-radius:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact;max-width:100%;">
                        ${gridLines}
                        <line x1="${origin.x}" y1="${origin.y}" x2="${origin.x + maxCoord * gridSpacing}" y2="${origin.y}" stroke="currentColor" stroke-width="2"/>
                        <line x1="${origin.x}" y1="${origin.y}" x2="${origin.x}" y2="${origin.y - maxCoord * gridSpacing}" stroke="currentColor" stroke-width="2"/>
                        ${axisLabels}
                        <text x="${origin.x + maxCoord * gridSpacing - 6}" y="${origin.y - 6}" fill="currentColor" font-size="12" font-weight="700">x</text>
                        <text x="${origin.x + 6}" y="${origin.y - maxCoord * gridSpacing + 12}" fill="currentColor" font-size="12" font-weight="700">y</text>
                        ${segment}
                        ${ptA}
                        ${ptB}
                    </svg>
                    <div style="margin-top:8px;font-size:0.95rem;color:var(--text-dim);">Find the distance in units.</div>
                </div>`;
                q.skillLabel = "Distance Q1";
                q.printFormat = "coord-distance";
                q.coordDistanceData = { A, B, distance, sharedAxis, maxCoord };
            } else if (geoSkill === "classify_triangles" && Math.random() < 0.30) {
                // Multi-select: "Click ALL the X triangles." — 4-6 triangle SVGs
                function _triSvg(type) {
                    if (type === 'equilateral') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="50,15 88,82 12,82" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/></svg>`;
                    }
                    if (type === 'isosceles') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="50,12 82,85 18,85" fill="#bfdbfe" stroke="#1e88e5" stroke-width="2"/></svg>`;
                    }
                    if (type === 'scalene') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="20,80 78,68 60,18" fill="#fecaca" stroke="#ef4444" stroke-width="2"/></svg>`;
                    }
                    if (type === 'right') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="20,20 20,82 82,82" fill="#bbf7d0" stroke="#22c55e" stroke-width="2"/><rect x="20" y="74" width="8" height="8" fill="none" stroke="#0f5132" stroke-width="1.4"/></svg>`;
                    }
                    if (type === 'acute') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="50,18 78,80 22,80" fill="#fde68a" stroke="#d97706" stroke-width="2"/></svg>`;
                    }
                    // obtuse
                    return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="10,72 90,72 78,38" fill="#e9d5ff" stroke="#a855f7" stroke-width="2"/></svg>`;
                }
                const byWhat = pick(['sides', 'angles']);
                const sidesTypes = ['equilateral', 'isosceles', 'scalene'];
                const anglesTypes = ['right', 'acute', 'obtuse'];
                const allTypes = byWhat === 'sides' ? sidesTypes : anglesTypes;
                const target = pick(allTypes);
                const wrongTypes = allTypes.filter(t => t !== target);
                const cCount = randInt(2, 3);
                const wCount = randInt(2, 3);
                const items = [];
                for (let i = 0; i < cCount; i++) items.push(target);
                for (let i = 0; i < wCount; i++) items.push(pick(wrongTypes));
                const shuffled = shuffle(items);
                const opts = shuffled.map((t, i) => ({
                    id: 'opt' + i,
                    svg: _triSvg(t),
                    label: '',
                    correct: t === target
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                q.text = `Click ALL the ${target} triangles.`;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                const hintMap = {
                    equilateral: 'Equilateral triangles have 3 equal sides.',
                    isosceles: 'Isosceles triangles have 2 equal sides.',
                    scalene: 'Scalene triangles have no equal sides.',
                    right: 'Right triangles have one 90° angle (a square corner).',
                    acute: 'Acute triangles have all three angles less than 90°.',
                    obtuse: 'Obtuse triangles have one angle greater than 90°.'
                };
                q.hint = hintMap[target];
                q.printFormat = 'multi-select';
                q.skillLabel = 'Triangles';
                return;
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
            } else if (geoSkill === "classify_quads" && Math.random() < 0.30) {
                // Multi-select: "Click ALL the parallelograms."
                const quadDefs = [
                    { name: 'square', svg: `<rect x="22" y="22" width="56" height="56" fill="#bbf7d0" stroke="#22c55e" stroke-width="2"/>`,
                      isSquare: true, isRect: true, isRhombus: true, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'rectangle', svg: `<rect x="12" y="32" width="76" height="40" fill="#dcfce7" stroke="#22c55e" stroke-width="2"/>`,
                      isSquare: false, isRect: true, isRhombus: false, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'rhombus', svg: `<polygon points="50,12 88,50 50,88 12,50" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>`,
                      isSquare: false, isRect: false, isRhombus: true, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'parallelogram', svg: `<polygon points="20,72 78,72 88,28 30,28" fill="#fde68a" stroke="#d97706" stroke-width="2"/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'trapezoid', svg: `<polygon points="12,78 88,78 70,22 30,22" fill="#cffafe" stroke="#06b6d4" stroke-width="2"/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: false, isTrapezoid: true, isQuad: true },
                    { name: 'kite', svg: `<polygon points="50,10 80,42 50,90 20,42" fill="#e9d5ff" stroke="#a855f7" stroke-width="2"/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: false, isTrapezoid: false, isQuad: true },
                    { name: 'triangle', svg: `<polygon points="50,15 88,82 12,82" fill="#fecaca" stroke="#ef4444" stroke-width="2"/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: false, isTrapezoid: false, isQuad: false },
                    { name: 'pentagon', svg: `<polygon points="50,12 88,40 74,86 26,86 12,40" fill="#bfdbfe" stroke="#1e88e5" stroke-width="2"/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: false, isTrapezoid: false, isQuad: false }
                ];
                const targets = [
                    { key: 'isParallelogram', label: 'parallelograms' },
                    { key: 'isRect', label: 'rectangles' },
                    { key: 'isQuad', label: 'quadrilaterals' },
                    { key: 'isTrapezoid', label: 'trapezoids' },
                    { key: 'isRhombus', label: 'rhombuses' }
                ];
                const target = pick(targets);
                const correctPool = quadDefs.filter(q2 => q2[target.key]);
                const wrongPool = quadDefs.filter(q2 => !q2[target.key]);
                const cCount = Math.min(correctPool.length, randInt(2, 3));
                const wCount = Math.min(wrongPool.length, randInt(2, 3));
                const chosen = shuffle([...shuffle([...correctPool]).slice(0, cCount), ...shuffle([...wrongPool]).slice(0, wCount)]);
                const opts = chosen.map((s, i) => ({
                    id: 'opt' + i,
                    svg: `<svg viewBox="0 0 100 100" width="80" height="80">${s.svg}</svg>`,
                    label: s.name,
                    correct: !!s[target.key]
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                const hintMap = {
                    isParallelogram: 'Parallelograms have two pairs of parallel sides — squares, rectangles, rhombuses, and parallelograms all qualify.',
                    isRect: 'Rectangles have 4 right angles — squares are also rectangles.',
                    isQuad: 'Quadrilaterals have exactly 4 sides.',
                    isTrapezoid: 'Trapezoids have exactly one pair of parallel sides.',
                    isRhombus: 'Rhombuses have 4 equal sides — squares are also rhombuses.'
                };
                q.text = `Click ALL the ${target.label}.`;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = hintMap[target.key];
                q.printFormat = 'multi-select';
                q.skillLabel = 'Quadrilaterals';
                return;
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
