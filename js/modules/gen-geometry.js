// gen-geometry.js - Geometry question generation (area, perimeter, angles, shapes, coordinates, volume)
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';
import { createAngleSVG, createRectangleSVG, createSquareSVG, createTriangleSVG, createShapeSVG, create3DBoxSVG, createLShapeSVG, createTShapeSVG, createWordProblemShapeSVG, createLabeledRectSVG, computeTriangleAngles } from './svg-geometry.js';
import { COLORS, STROKE, FONTS, softFill, categoricalFill } from './design-tokens.js';

// IXL-aligned shape style: cycle through the 6-color categorical palette.
// Returns matched fill (saturated, 18% alpha) + stroke (full saturation).
function shapeStyle(idx) {
    const c = categoricalFill(idx);
    return { fill: softFill(c), stroke: c, strokeWidth: STROKE.bold };
}

// Student-friendly definition snippets for area & perimeter — rendered as a
// subtle italic info box at the top of the visual so students see the
// concept right when they need it. See `.student-def` in ui-components.css.
const STUDENT_DEF_AREA = `<div class="student-def"><b>Area</b> = the amount of space inside a flat shape. Count the square units inside.</div>`;
const STUDENT_DEF_PERIMETER = `<div class="student-def"><b>Perimeter</b> = the total distance around the outside of a shape. Add up all the side lengths.</div>`;

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
                const _s = (i) => shapeStyle(i);
                const shapes2d = [
                    { name: "Circle", sides: 0, svgFn: () => { const s = _s(0); return `<ellipse cx="100" cy="100" rx="80" ry="80" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; } },
                    { name: "Square", sides: 4, svgFn: () => { const s = _s(1); return `<rect x="20" y="20" width="160" height="160" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; } },
                    { name: "Rectangle", sides: 4, svgFn: () => { const s = _s(2); return `<rect x="10" y="40" width="180" height="120" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; } },
                    { name: "Triangle", sides: 3, svgFn: () => { const s = _s(3); return `<polygon points="100,15 15,185 185,185" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; } },
                    { name: "Hexagon", sides: 6, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 6; i++) {
                            const a = Math.PI / 3 * i - Math.PI / 2;
                            pts.push(`${100 + 80 * Math.cos(a)},${100 + 80 * Math.sin(a)}`);
                        }
                        const s = _s(4);
                        return `<polygon points="${pts.join(' ')}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`;
                    }},
                    { name: "Pentagon", sides: 5, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 5; i++) {
                            const a = Math.PI * 2 / 5 * i - Math.PI / 2;
                            pts.push(`${100 + 80 * Math.cos(a)},${100 + 80 * Math.sin(a)}`);
                        }
                        const s = _s(5);
                        return `<polygon points="${pts.join(' ')}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`;
                    }},
                    { name: "Oval", sides: 0, svgFn: () => { const s = _s(0); return `<ellipse cx="100" cy="100" rx="90" ry="60" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; } },
                    { name: "Rhombus", sides: 4, svgFn: () => { const s = _s(1); return `<polygon points="100,15 185,100 100,185 15,100" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; } }
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
                // Single primary-blue palette across all 3D shapes (IXL convention).
                // Three opacity tiers (front/right/top) give the 3D illusion via
                // value contrast, not via three different hues.
                const _3D_STROKE = COLORS.primaryDark;            // #1565c0
                const _3D_FILL_FRONT = softFill(COLORS.fill[0]);  // 18% blue
                const _3D_FILL_TOP   = COLORS.fill[0] + '14';     // ~8% blue (lighter top face)
                const _3D_FILL_RIGHT = COLORS.fill[0] + '40';     // ~25% blue (medium right face)
                const _3D_SW = STROKE.bold;
                const shapes3d = [
                    { name: "Cube", svgFn: () => `
                        <polygon points="60,160 160,160 160,60 60,60" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <polygon points="60,60 160,60 200,30 100,30" fill="${_3D_FILL_TOP}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <polygon points="160,60 200,30 200,130 160,160" fill="${_3D_FILL_RIGHT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>` },
                    { name: "Sphere", svgFn: () => `
                        <circle cx="120" cy="110" r="75" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <ellipse cx="120" cy="110" rx="75" ry="20" fill="none" stroke="${_3D_STROKE}" stroke-width="${STROKE.normal}" stroke-dasharray="6,4"/>
                        <ellipse cx="120" cy="110" rx="20" ry="75" fill="none" stroke="${_3D_STROKE}" stroke-width="${STROKE.normal}" stroke-dasharray="6,4"/>` },
                    { name: "Cylinder", svgFn: () => `
                        <rect x="60" y="60" width="120" height="120" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <ellipse cx="120" cy="60" rx="60" ry="20" fill="${_3D_FILL_TOP}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <ellipse cx="120" cy="180" rx="60" ry="20" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <line x1="60" y1="60" x2="60" y2="180" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <line x1="180" y1="60" x2="180" y2="180" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>` },
                    { name: "Cone", svgFn: () => `
                        <polygon points="120,25 55,175 185,175" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <ellipse cx="120" cy="175" rx="65" ry="20" fill="${_3D_FILL_RIGHT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>` },
                    { name: "Rectangular Prism", svgFn: () => `
                        <polygon points="40,170 170,170 170,60 40,60" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <polygon points="40,60 170,60 210,35 80,35" fill="${_3D_FILL_TOP}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>
                        <polygon points="170,60 210,35 210,145 170,170" fill="${_3D_FILL_RIGHT}" stroke="${_3D_STROKE}" stroke-width="${_3D_SW}"/>` }
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
                    { name: 'triangle', sides: 3, color: COLORS.fill[2] },
                    { name: 'square', sides: 4, color: COLORS.fill[1] },
                    { name: 'pentagon', sides: 5, color: COLORS.fill[0] },
                    { name: 'hexagon', sides: 6, color: COLORS.fill[3] },
                    { name: 'heptagon', sides: 7, color: COLORS.fill[5] },
                    { name: 'octagon', sides: 8, color: COLORS.fill[4] },
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
                    cube:               { label: 'cube',                 edges: 12, faces: 6, vertices: 8 },
                    rectangular_prism:  { label: 'rectangular prism',    edges: 12, faces: 6, vertices: 8 },
                    square_pyramid:     { label: 'square pyramid',       edges: 8,  faces: 5, vertices: 5 },
                    triangular_prism:   { label: 'triangular prism',     edges: 9,  faces: 5, vertices: 6 },
                    triangular_pyramid: { label: 'triangular pyramid',   edges: 6,  faces: 4, vertices: 4 },
                    hexagonal_prism:    { label: 'hexagonal prism',      edges: 18, faces: 8, vertices: 12 },
                    cone:               { label: 'cone',                 edges: 1,  faces: 2, vertices: 1 },
                    cylinder:           { label: 'cylinder',             edges: 2,  faces: 3, vertices: 0 },
                    sphere:             { label: 'sphere',               edges: 0,  faces: 1, vertices: 0 },
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
                } else if (shapeKey === 'triangular_pyramid') {
                    // Tetrahedron — 4 vertices, 4 faces, 6 edges
                    const ox = 30, oy = 140, w = 100, h = 90, d = 30;
                    const apexX = ox + w / 2 + 8;
                    const apexY = oy - h;
                    // Base triangle (in perspective): front-left, front-right, back
                    const flX = ox, flY = oy;
                    const frX = ox + w, frY = oy;
                    const bkX = ox + w / 2 + d, bkY = oy - d;
                    // Visible base front edge
                    shapeSvg += `<line x1="${flX}" y1="${flY}" x2="${frX}" y2="${frY}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Visible base back-right edge
                    shapeSvg += `<line x1="${frX}" y1="${frY}" x2="${bkX}" y2="${bkY}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Hidden base back-left edge
                    shapeSvg += `<line x1="${flX}" y1="${flY}" x2="${bkX}" y2="${bkY}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                    // Visible faces (front-left + front-right)
                    shapeSvg += `<polygon points="${flX},${flY} ${frX},${frY} ${apexX},${apexY}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    shapeSvg += `<polygon points="${frX},${frY} ${bkX},${bkY} ${apexX},${apexY}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                } else if (shapeKey === 'hexagonal_prism') {
                    // 12 vertices, 18 edges, 8 faces (2 hexagons + 6 rectangles)
                    const cx = 95, cyFront = 130, ry = 14, rx = 36, h = 78;
                    // Build hexagon points (6 vertices)
                    const hex = (cy0) => {
                        const pts = [];
                        for (let i = 0; i < 6; i++) {
                            const a = (Math.PI / 3) * i + Math.PI / 6;
                            pts.push([cx + rx * Math.cos(a), cy0 + ry * Math.sin(a)]);
                        }
                        return pts;
                    };
                    const front = hex(cyFront);
                    const back = front.map(([x, y]) => [x, y - h]);
                    // Top hexagon
                    shapeSvg += `<polygon points="${back.map(p => p.join(',')).join(' ')}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Bottom hexagon (front + visible portion)
                    shapeSvg += `<polygon points="${front.map(p => p.join(',')).join(' ')}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Vertical edges — visible (front 3) and hidden (back 3)
                    for (let i = 0; i < 6; i++) {
                        const isVisible = (i === 0 || i === 1 || i === 5);
                        const stroke = isVisible ? STROKE : DASH;
                        const sw = isVisible ? '2.2' : '1';
                        const dash = isVisible ? '' : 'stroke-dasharray="4,3"';
                        shapeSvg += `<line x1="${front[i][0]}" y1="${front[i][1]}" x2="${back[i][0]}" y2="${back[i][1]}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
                    }
                } else if (shapeKey === 'sphere') {
                    // 0 edges, 1 face, 0 vertices — circle + dashed equator/meridian for 3D feel
                    const cx = 95, cy = 95, r = 60;
                    shapeSvg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.2"/>`;
                    // Equator ellipse (front arc solid, back arc dashed)
                    shapeSvg += `<path d="M ${cx - r} ${cy} A ${r} 16 0 0 0 ${cx + r} ${cy}" stroke="${STROKE}" stroke-width="1.4" fill="none"/>`;
                    shapeSvg += `<path d="M ${cx - r} ${cy} A ${r} 16 0 0 1 ${cx + r} ${cy}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>`;
                    // Meridian ellipse (vertical)
                    shapeSvg += `<path d="M ${cx} ${cy - r} A 16 ${r} 0 0 0 ${cx} ${cy + r}" stroke="${STROKE}" stroke-width="1.4" fill="none"/>`;
                    shapeSvg += `<path d="M ${cx} ${cy - r} A 16 ${r} 0 0 1 ${cx} ${cy + r}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>`;
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

            // ===== SHAPE NAME MATCH — 2D (drag names onto polygons) =====
            // Grades 2-4 (CCSS 2.G.A.1, 3.G.A.1). Show 4-6 polygons in a row.
            // Student drags names from a palette (with 1-2 distractors) onto
            // each shape's slot. Powered by the dnd-generic widget in
            // shape-match mode.
            //
            // INCLUSIVE HIERARCHY (US convention — parallelograms ARE trapezoids):
            //   square → {square, rectangle, rhombus, parallelogram, trapezoid, quadrilateral}
            //   rectangle (non-square) → {rectangle, parallelogram, trapezoid, quadrilateral}
            //   rhombus (non-square) → {rhombus, parallelogram, trapezoid, quadrilateral}
            //   parallelogram (non-rect/rhombus) → {parallelogram, trapezoid, quadrilateral}
            //   trapezoid (only one pair parallel) → {trapezoid, quadrilateral}
            //   irregular quad → {quadrilateral}
            //   kite → {kite, quadrilateral}
            //   equilateral triangle → {equilateral triangle, isosceles triangle, triangle}
            //   isosceles triangle → {isosceles triangle, triangle}
            //   scalene triangle → {scalene triangle, triangle}
            //   regular pentagon/hexagon/etc → {regular X, X, polygon}
            //   irregular pentagon/hexagon/etc → {X, polygon}
            //   circle → {circle}
            // The chain is one-way: a child accepts ancestor names, but an ancestor
            // does NOT accept child names (e.g., a parallelogram bin must reject "rhombus").
            const SHAPE_2D_HIERARCHY = {
                square:            ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'quadrilateral'],
                rectangle:         ['rectangle', 'parallelogram', 'trapezoid', 'quadrilateral'],
                rhombus:           ['rhombus', 'parallelogram', 'trapezoid', 'quadrilateral'],
                parallelogram:     ['parallelogram', 'trapezoid', 'quadrilateral'],
                trapezoid:         ['trapezoid', 'quadrilateral'],
                kite:              ['kite', 'quadrilateral'],
                irregular_quad:    ['quadrilateral'],
                eq_triangle:       ['equilateral triangle', 'isosceles triangle', 'triangle'],
                iso_triangle:      ['isosceles triangle', 'triangle'],
                sca_triangle:      ['scalene triangle', 'triangle'],
                pentagon:          ['pentagon', 'polygon'],
                irregular_pentagon:['pentagon', 'polygon'],
                hexagon:           ['hexagon', 'polygon'],
                irregular_hexagon: ['hexagon', 'polygon'],
                heptagon:          ['heptagon', 'polygon'],
                irregular_heptagon:['heptagon', 'polygon'],
                octagon:           ['octagon', 'polygon'],
                irregular_octagon: ['octagon', 'polygon'],
                nonagon:           ['nonagon', 'polygon'],
                decagon:           ['decagon', 'polygon'],
                circle:            ['circle']
            };
            if (mappedSkill === "shape_name_match_2d") {
                const STK = '#1565c0';     // shape outline
                const FIL = 'rgba(33,150,243,0.18)';
                const SW  = 2.4;

                // Each shape entry returns: { id, name, svgInner, ariaName }
                // svgInner is rendered inside a 0..120 / 0..120 viewBox.
                const SHAPES_2D = {
                    // Triangle subtypes all match the simple "triangle" name —
                    // the dup-name filter (line ~676) ensures only ONE triangle
                    // shape appears per problem, so the student sees one
                    // triangle figure and one "triangle" tile. Subtype
                    // distinctions (equilateral / isosceles / scalene) are
                    // taught in the dedicated classify_triangles skill.
                    eq_triangle: {
                        name: 'triangle', aria: 'equilateral triangle',
                        svg: `<polygon points="60,15 15,100 105,100" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    iso_triangle: {
                        name: 'triangle', aria: 'isosceles triangle',
                        svg: `<polygon points="60,12 22,100 98,100" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    sca_triangle: {
                        name: 'triangle', aria: 'scalene triangle',
                        svg: `<polygon points="20,30 100,55 35,105" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    square: {
                        name: 'square', aria: 'square',
                        svg: `<rect x="20" y="20" width="80" height="80" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    rectangle: {
                        name: 'rectangle', aria: 'rectangle',
                        svg: `<rect x="10" y="32" width="100" height="56" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    rhombus: {
                        name: 'rhombus', aria: 'rhombus',
                        svg: `<polygon points="60,15 105,60 60,105 15,60" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    parallelogram: {
                        name: 'parallelogram', aria: 'parallelogram',
                        svg: `<polygon points="20,90 75,90 100,30 45,30" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    trapezoid: {
                        name: 'trapezoid', aria: 'trapezoid',
                        svg: `<polygon points="25,30 95,30 110,95 10,95" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    irregular_quad: {
                        name: 'quadrilateral', aria: 'irregular quadrilateral',
                        svg: `<polygon points="18,30 95,18 102,80 25,98" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    pentagon: {
                        name: 'pentagon', aria: 'regular pentagon',
                        svg: (() => {
                            const pts = [];
                            for (let i = 0; i < 5; i++) {
                                const a = (Math.PI * 2 / 5) * i - Math.PI / 2;
                                pts.push(`${(60 + 45 * Math.cos(a)).toFixed(1)},${(60 + 45 * Math.sin(a)).toFixed(1)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`;
                        })()
                    },
                    irregular_pentagon: {
                        name: 'pentagon', aria: 'irregular pentagon',
                        svg: `<polygon points="60,15 105,40 95,100 25,95 18,45" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    hexagon: {
                        name: 'hexagon', aria: 'regular hexagon',
                        svg: (() => {
                            const pts = [];
                            for (let i = 0; i < 6; i++) {
                                const a = (Math.PI / 3) * i;
                                pts.push(`${(60 + 46 * Math.cos(a)).toFixed(1)},${(60 + 46 * Math.sin(a)).toFixed(1)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`;
                        })()
                    },
                    irregular_hexagon: {
                        name: 'hexagon', aria: 'irregular hexagon',
                        svg: `<polygon points="55,12 100,30 110,80 60,108 12,90 18,40" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    heptagon: {
                        name: 'heptagon', aria: 'regular heptagon',
                        svg: (() => {
                            const pts = [];
                            for (let i = 0; i < 7; i++) {
                                const a = (Math.PI * 2 / 7) * i - Math.PI / 2;
                                pts.push(`${(60 + 46 * Math.cos(a)).toFixed(1)},${(60 + 46 * Math.sin(a)).toFixed(1)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`;
                        })()
                    },
                    irregular_heptagon: {
                        name: 'heptagon', aria: 'irregular heptagon',
                        svg: `<polygon points="58,12 95,22 108,55 92,98 35,105 14,75 18,38" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    octagon: {
                        name: 'octagon', aria: 'regular octagon',
                        svg: (() => {
                            const pts = [];
                            for (let i = 0; i < 8; i++) {
                                const a = (Math.PI / 4) * i + Math.PI / 8;
                                pts.push(`${(60 + 46 * Math.cos(a)).toFixed(1)},${(60 + 46 * Math.sin(a)).toFixed(1)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`;
                        })()
                    },
                    irregular_octagon: {
                        name: 'octagon', aria: 'irregular octagon',
                        svg: `<polygon points="50,10 90,15 108,40 105,80 80,105 35,108 14,82 12,40" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`
                    },
                    nonagon: {
                        name: 'nonagon', aria: 'nonagon (9 sides)',
                        svg: (() => {
                            const pts = [];
                            for (let i = 0; i < 9; i++) {
                                const a = (Math.PI * 2 / 9) * i - Math.PI / 2;
                                pts.push(`${(60 + 46 * Math.cos(a)).toFixed(1)},${(60 + 46 * Math.sin(a)).toFixed(1)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`;
                        })()
                    },
                    decagon: {
                        name: 'decagon', aria: 'decagon (10 sides)',
                        svg: (() => {
                            const pts = [];
                            for (let i = 0; i < 10; i++) {
                                const a = (Math.PI / 5) * i - Math.PI / 2;
                                pts.push(`${(60 + 46 * Math.cos(a)).toFixed(1)},${(60 + 46 * Math.sin(a)).toFixed(1)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`;
                        })()
                    },
                };

                // Sample 4-6 distinct shape entries with distinct displayed names.
                const allKeys = Object.keys(SHAPES_2D);
                const numBins = pick([4, 5, 6]);
                const chosenKeys = [];
                const usedNames = new Set();
                const shuffledKeys = shuffle([...allKeys]);
                for (const k of shuffledKeys) {
                    if (chosenKeys.length >= numBins) break;
                    const nm = SHAPES_2D[k].name;
                    if (usedNames.has(nm)) continue;   // avoid two bins with the same correct answer
                    usedNames.add(nm);
                    chosenKeys.push(k);
                }
                // Fallback: if we couldn't find enough distinct names, allow duplicates
                while (chosenKeys.length < numBins) {
                    chosenKeys.push(pick(allKeys));
                }

                // STABLE BIN ORDER: re-sort the picked keys into canonical
                // SHAPES_2D enumeration order so the bin layout is deterministic
                // for the entire question (no reshuffling on retry / re-render
                // / hint popup / zoom-modal close). The randomness lives in
                // WHICH shapes were picked above — once chosen, their on-screen
                // positions are fixed by their declared SHAPES_2D order. The
                // NAME tiles in the tray (below) stay shuffled — that's the
                // actual quiz randomization the student must reason about.
                const _canonicalOrder = new Map(allKeys.map((k, i) => [k, i]));
                chosenKeys.sort((a, b) => (_canonicalOrder.get(a) ?? 0) - (_canonicalOrder.get(b) ?? 0));

                // Build bins (shape figures) and matching tile IDs.
                const bins = [];
                const tiles = [];
                const ans = {};
                chosenKeys.forEach((key, i) => {
                    const sh = SHAPES_2D[key];
                    const binId = 'b' + i;
                    const tileId = 't' + i;
                    // Inclusive hierarchy: a square bin accepts square/rectangle/rhombus/etc.
                    // Fall back to canonical name only if no hierarchy entry exists.
                    const acceptedNames = SHAPE_2D_HIERARCHY[key] || [sh.name];
                    bins.push({
                        id: binId,
                        ariaLabel: sh.aria,
                        shapeKey: key,
                        canonicalName: sh.name,
                        acceptedNames: acceptedNames,
                        htmlLabel: `<svg viewBox="0 0 120 120" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${sh.svg}</svg>`
                    });
                    tiles.push({ id: tileId, label: sh.name });
                    ans[tileId] = binId;
                });

                // Add 1-2 distractor name tiles whose names don't match any shape.
                const distractorPool = ['circle', 'oval', 'kite', 'star', 'arrow', 'crescent', 'pentagon', 'hexagon', 'octagon', 'rectangle', 'square', 'rhombus', 'trapezoid', 'parallelogram'];
                const usedShapeNames = new Set(chosenKeys.map(k => SHAPES_2D[k].name));
                const availDistractors = distractorPool.filter(n => !usedShapeNames.has(n));
                const numDistractors = pick([1, 2]);
                const distractors = shuffle(availDistractors).slice(0, numDistractors);
                distractors.forEach((nm, i) => {
                    tiles.push({ id: 'd' + i, label: nm });
                });

                // Shuffle tiles so the correct order isn't trivial.
                const shuffledTiles = shuffle(tiles);

                q.text = 'Drag each name onto the matching 2D shape.';
                q.answerType = 'dnd-generic';
                q.dndMode = 'shape-match';
                q.tiles = shuffledTiles;
                q.bins = bins;
                q.ans = ans;
                q.options = [];
                q.hint = 'Look at the number of sides on each shape, and whether the sides and angles look equal.';
                q.printFormat = 'shape-name-match';
                q.skillLabel = '2D Match';
                return;
            }

            // ===== SHAPE NAME MATCH — 3D (drag names onto solids) =====
            // Grades 1-3 (CCSS 1.G.A.2, 2.G.A.1). 4-6 solids per problem.
            if (mappedSkill === "shape_name_match_3d") {
                const STK = '#1565c0';
                const FIL = 'rgba(33,150,243,0.18)';
                const FILT = 'rgba(33,150,243,0.10)';
                const FILR = 'rgba(33,150,243,0.28)';
                const DASH = '#888';
                const SW = 2.2;

                // Each entry: viewBox 0..160 / 0..140, isometric solid.
                const SHAPES_3D = {
                    cube: {
                        name: 'cube',
                        svg: (() => {
                            const ox = 30, oy = 110, s = 60, d = 24;
                            return `
                                <polygon points="${ox},${oy} ${ox+s},${oy} ${ox+s},${oy-s} ${ox},${oy-s}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>
                                <polygon points="${ox},${oy-s} ${ox+s},${oy-s} ${ox+s+d},${oy-s-d} ${ox+d},${oy-s-d}" fill="${FILT}" stroke="${STK}" stroke-width="${SW}"/>
                                <polygon points="${ox+s},${oy} ${ox+s+d},${oy-d} ${ox+s+d},${oy-s-d} ${ox+s},${oy-s}" fill="${FILR}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox}" y1="${oy}" x2="${ox+d}" y2="${oy-d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>
                                <line x1="${ox+d}" y1="${oy-d}" x2="${ox+s+d}" y2="${oy-d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>
                                <line x1="${ox+d}" y1="${oy-d}" x2="${ox+d}" y2="${oy-s-d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                        })()
                    },
                    rectangular_prism: {
                        name: 'rectangular prism',
                        svg: (() => {
                            const ox = 18, oy = 110, l = 90, h = 56, d = 24;
                            return `
                                <polygon points="${ox},${oy} ${ox+l},${oy} ${ox+l},${oy-h} ${ox},${oy-h}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>
                                <polygon points="${ox},${oy-h} ${ox+l},${oy-h} ${ox+l+d},${oy-h-d} ${ox+d},${oy-h-d}" fill="${FILT}" stroke="${STK}" stroke-width="${SW}"/>
                                <polygon points="${ox+l},${oy} ${ox+l+d},${oy-d} ${ox+l+d},${oy-h-d} ${ox+l},${oy-h}" fill="${FILR}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox}" y1="${oy}" x2="${ox+d}" y2="${oy-d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>
                                <line x1="${ox+d}" y1="${oy-d}" x2="${ox+l+d}" y2="${oy-d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>
                                <line x1="${ox+d}" y1="${oy-d}" x2="${ox+d}" y2="${oy-h-d}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                        })()
                    },
                    triangular_prism: {
                        name: 'triangular prism',
                        svg: (() => {
                            const ox = 18, oy = 115, w = 70, h = 75, d = 42;
                            return `
                                <polygon points="${ox},${oy} ${ox+w},${oy} ${ox+w/2},${oy-h}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>
                                <polygon points="${ox+d},${oy-d/2} ${ox+w+d},${oy-d/2} ${ox+w/2+d},${oy-h-d/2}" fill="${FILT}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox+w/2}" y1="${oy-h}" x2="${ox+w/2+d}" y2="${oy-h-d/2}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox+w}" y1="${oy}" x2="${ox+w+d}" y2="${oy-d/2}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox}" y1="${oy}" x2="${ox+d}" y2="${oy-d/2}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                        })()
                    },
                    hexagonal_prism: {
                        name: 'hexagonal prism',
                        svg: (() => {
                            const cx = 78, cyFront = 105, ry = 12, rx = 32, h = 62;
                            const hex = (cy0) => {
                                const pts = [];
                                for (let i = 0; i < 6; i++) {
                                    const a = (Math.PI / 3) * i + Math.PI / 6;
                                    pts.push([cx + rx * Math.cos(a), cy0 + ry * Math.sin(a)]);
                                }
                                return pts;
                            };
                            const front = hex(cyFront);
                            const back = front.map(([x,y]) => [x, y - h]);
                            let s = '';
                            s += `<polygon points="${back.map(p => p.join(',')).join(' ')}" fill="${FILT}" stroke="${STK}" stroke-width="${SW}"/>`;
                            s += `<polygon points="${front.map(p => p.join(',')).join(' ')}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>`;
                            for (let i = 0; i < 6; i++) {
                                const isVis = (i === 0 || i === 1 || i === 5);
                                const stroke = isVis ? STK : DASH;
                                const sw = isVis ? SW : 1;
                                const dash = isVis ? '' : 'stroke-dasharray="4,3"';
                                s += `<line x1="${front[i][0]}" y1="${front[i][1]}" x2="${back[i][0]}" y2="${back[i][1]}" stroke="${stroke}" stroke-width="${sw}" ${dash}/>`;
                            }
                            return s;
                        })()
                    },
                    square_pyramid: {
                        name: 'square pyramid',
                        svg: (() => {
                            const ox = 25, oy = 115, s = 70, d = 26, ah = 80;
                            const ax = ox + s/2 + d/2;
                            const ay = oy - ah;
                            return `
                                <polygon points="${ox},${oy} ${ox+s},${oy} ${ox+s+d},${oy-d} ${ox+d},${oy-d}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox}" y1="${oy}" x2="${ax}" y2="${ay}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox+s}" y1="${oy}" x2="${ax}" y2="${ay}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox+s+d}" y1="${oy-d}" x2="${ax}" y2="${ay}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${ox+d}" y1="${oy-d}" x2="${ax}" y2="${ay}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>`;
                        })()
                    },
                    triangular_pyramid: {
                        name: 'triangular pyramid',
                        svg: (() => {
                            const ox = 25, oy = 115, w = 80, h = 80, d = 26;
                            const apexX = ox + w/2 + 6;
                            const apexY = oy - h;
                            const flX = ox, flY = oy;
                            const frX = ox + w, frY = oy;
                            const bkX = ox + w/2 + d, bkY = oy - d;
                            return `
                                <line x1="${flX}" y1="${flY}" x2="${frX}" y2="${frY}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${frX}" y1="${frY}" x2="${bkX}" y2="${bkY}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${flX}" y1="${flY}" x2="${bkX}" y2="${bkY}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3"/>
                                <polygon points="${flX},${flY} ${frX},${frY} ${apexX},${apexY}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>
                                <polygon points="${frX},${frY} ${bkX},${bkY} ${apexX},${apexY}" fill="${FILT}" stroke="${STK}" stroke-width="${SW}"/>`;
                        })()
                    },
                    cylinder: {
                        name: 'cylinder',
                        svg: (() => {
                            const cx = 78, cyTop = 35, cyBot = 115, rx = 38, ry = 12;
                            return `
                                <ellipse cx="${cx}" cy="${cyTop}" rx="${rx}" ry="${ry}" fill="${FILT}" stroke="${STK}" stroke-width="${SW}"/>
                                <rect x="${cx-rx}" y="${cyTop}" width="${rx*2}" height="${cyBot-cyTop}" fill="${FIL}" stroke="none"/>
                                <line x1="${cx-rx}" y1="${cyTop}" x2="${cx-rx}" y2="${cyBot}" stroke="${STK}" stroke-width="${SW}"/>
                                <line x1="${cx+rx}" y1="${cyTop}" x2="${cx+rx}" y2="${cyBot}" stroke="${STK}" stroke-width="${SW}"/>
                                <path d="M ${cx-rx} ${cyBot} A ${rx} ${ry} 0 0 0 ${cx+rx} ${cyBot}" stroke="${STK}" stroke-width="${SW}" fill="none"/>
                                <path d="M ${cx-rx} ${cyBot} A ${rx} ${ry} 0 0 1 ${cx+rx} ${cyBot}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>`;
                        })()
                    },
                    cone: {
                        name: 'cone',
                        svg: (() => {
                            const cx = 78, cy = 115, rx = 42, ry = 12, h = 90;
                            return `
                                <polygon points="${cx-rx},${cy} ${cx+rx},${cy} ${cx},${cy-h}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>
                                <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${FILR}" stroke="${STK}" stroke-width="${SW}"/>
                                <path d="M ${cx-rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx+rx} ${cy}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>`;
                        })()
                    },
                    sphere: {
                        name: 'sphere',
                        svg: (() => {
                            const cx = 78, cy = 75, r = 50;
                            return `
                                <circle cx="${cx}" cy="${cy}" r="${r}" fill="${FIL}" stroke="${STK}" stroke-width="${SW}"/>
                                <path d="M ${cx-r} ${cy} A ${r} 14 0 0 0 ${cx+r} ${cy}" stroke="${STK}" stroke-width="1.4" fill="none"/>
                                <path d="M ${cx-r} ${cy} A ${r} 14 0 0 1 ${cx+r} ${cy}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>
                                <path d="M ${cx} ${cy-r} A 14 ${r} 0 0 0 ${cx} ${cy+r}" stroke="${STK}" stroke-width="1.4" fill="none"/>
                                <path d="M ${cx} ${cy-r} A 14 ${r} 0 0 1 ${cx} ${cy+r}" stroke="${DASH}" stroke-width="1" stroke-dasharray="4,3" fill="none"/>`;
                        })()
                    },
                };

                const allKeys = Object.keys(SHAPES_3D);
                const numBins = pick([4, 5, 6]);
                const chosenKeys = shuffle([...allKeys]).slice(0, numBins);

                // STABLE BIN ORDER: re-sort the picked keys into canonical
                // SHAPES_3D enumeration order so the bin layout is deterministic
                // for the entire question (no reshuffling on retry / re-render).
                // The randomness lives in WHICH solids were picked above — once
                // chosen, their on-screen positions are fixed by their declared
                // SHAPES_3D order. The NAME tiles in the tray (below) stay
                // shuffled — that's the actual quiz randomization.
                const _canonicalOrder3D = new Map(allKeys.map((k, i) => [k, i]));
                chosenKeys.sort((a, b) => (_canonicalOrder3D.get(a) ?? 0) - (_canonicalOrder3D.get(b) ?? 0));

                const bins = [];
                const tiles = [];
                const ans = {};
                chosenKeys.forEach((key, i) => {
                    const sh = SHAPES_3D[key];
                    const binId = 'b' + i;
                    const tileId = 't' + i;
                    // 3D shapes don't use inclusive hierarchy here — drag-match
                    // doesn't conflate cube/rectangular prism, so each bin only
                    // accepts its own canonical name.
                    bins.push({
                        id: binId,
                        ariaLabel: sh.name,
                        shapeKey: key,
                        canonicalName: sh.name,
                        acceptedNames: [sh.name],
                        htmlLabel: `<svg viewBox="0 0 160 140" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${sh.svg}</svg>`
                    });
                    tiles.push({ id: tileId, label: sh.name });
                    ans[tileId] = binId;
                });

                // Distractor names: solids that are NOT in this problem.
                const usedNames = new Set(chosenKeys.map(k => SHAPES_3D[k].name));
                const distractorPool = allKeys.map(k => SHAPES_3D[k].name).filter(n => !usedNames.has(n));
                const numDistractors = pick([1, 2]);
                const distractors = shuffle(distractorPool).slice(0, numDistractors);
                distractors.forEach((nm, i) => {
                    tiles.push({ id: 'd' + i, label: nm });
                });

                const shuffledTiles = shuffle(tiles);

                q.text = 'Drag each name onto the matching 3D shape.';
                q.answerType = 'dnd-generic';
                q.dndMode = 'shape-match';
                q.tiles = shuffledTiles;
                q.bins = bins;
                q.ans = ans;
                q.options = [];
                q.hint = 'Look at the faces and curves. Prisms have flat faces; cones, cylinders, and spheres have curves.';
                q.printFormat = 'shape-name-match';
                q.skillLabel = '3D Match';
                return;
            }

            // ===== COUNT SIDES & VERTICES on 2D SHAPE (Grades K-2) =====
            // CCSS K.G.B.4 / 1.G.A.2 / 2.G.A.1
            // Show one polygon (regular or irregular). Ask sides OR vertices.
            if (mappedSkill === "count_sides_vertices_2d") {
                const cx = 100, cy = 105;
                const R = 70;
                const regularPts = (n, rotDeg = -90, r = R) => {
                    const pts = [];
                    for (let i = 0; i < n; i++) {
                        const a = (rotDeg + i * 360 / n) * Math.PI / 180;
                        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
                    }
                    return pts;
                };
                const SHAPES_2D = [
                    { key: 'equilateral_triangle', label: 'triangle',     sides: 3, points: regularPts(3, -90, 75) },
                    { key: 'isosceles_triangle',   label: 'triangle',     sides: 3, points: [[100, 30], [40, 170], [160, 170]] },
                    { key: 'scalene_triangle',     label: 'triangle',     sides: 3, points: [[55, 40], [175, 95], [30, 175]] },
                    { key: 'square',               label: 'square',       sides: 4, points: [[40, 45], [160, 45], [160, 165], [40, 165]] },
                    { key: 'rectangle',            label: 'rectangle',    sides: 4, points: [[25, 60], [175, 60], [175, 150], [25, 150]] },
                    { key: 'trapezoid',            label: 'trapezoid',    sides: 4, points: [[55, 55], [145, 55], [180, 160], [20, 160]] },
                    { key: 'kite',                 label: 'kite',         sides: 4, points: [[100, 25], [165, 95], [100, 180], [35, 95]] },
                    { key: 'irregular_quad',       label: 'quadrilateral',sides: 4, points: [[35, 55], [170, 35], [160, 160], [50, 175]] },
                    { key: 'regular_pentagon',     label: 'pentagon',     sides: 5, points: regularPts(5, -90, 72) },
                    { key: 'irregular_pentagon',   label: 'pentagon',     sides: 5, points: [[100, 25], [175, 80], [150, 170], [50, 170], [25, 80]] },
                    { key: 'regular_hexagon',      label: 'hexagon',      sides: 6, points: regularPts(6, -90, 72) },
                    { key: 'irregular_hexagon',    label: 'hexagon',      sides: 6, points: [[100, 25], [170, 60], [165, 140], [110, 175], [40, 155], [30, 75]] },
                    { key: 'heptagon',             label: 'heptagon',     sides: 7, points: regularPts(7, -90, 72) },
                    { key: 'regular_octagon',      label: 'octagon',      sides: 8, points: regularPts(8, -90 - 22.5, 72) },
                    { key: 'irregular_octagon',    label: 'octagon',      sides: 8, points: [[80, 25], [120, 25], [170, 65], [170, 125], [125, 175], [75, 175], [30, 130], [30, 70]] },
                    { key: 'nonagon',              label: 'nonagon',      sides: 9, points: regularPts(9, -90, 72) },
                    { key: 'decagon',              label: 'decagon',      sides: 10, points: regularPts(10, -90, 72) },
                ];
                const shape2d = pick(SHAPES_2D);
                // Closed polygon: sides === vertices, but vary the question for variety.
                const askFor = pick(['sides', 'vertices']);
                const answer = shape2d.sides;

                const STROKE = '#1565c0';
                const FILL = 'rgba(33,150,243,0.18)';
                const ptsStr = shape2d.points.map(p => p.join(',')).join(' ');
                let svg = `<polygon points="${ptsStr}" fill="${FILL}" stroke="${STROKE}" stroke-width="2.4" stroke-linejoin="round"/>`;
                if (askFor === 'vertices') {
                    for (const [px, py] of shape2d.points) {
                        svg += `<circle cx="${px}" cy="${py}" r="5.5" fill="#ff5722" stroke="#fff" stroke-width="1.5"/>`;
                    }
                }

                const optsSet = new Set([answer]);
                const candidates = [answer + 1, Math.max(3, answer - 1), answer + 2, Math.max(3, answer - 2), answer + 3];
                for (const c of shuffle(candidates)) {
                    if (optsSet.size >= 4) break;
                    optsSet.add(c);
                }
                while (optsSet.size < 4) optsSet.add(randInt(3, 12));

                q.text = `How many ${askFor} does this ${shape2d.label} have?`;
                q.ans = answer;
                q.answerType = "number";
                q.options = shuffle([...optsSet]);
                q.hint = askFor === 'sides'
                    ? `Sides are the straight edges of the shape. Count each edge once.`
                    : `Vertices are the corner points where two sides meet. Count each corner once.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.1rem;">Count the ${askFor.charAt(0).toUpperCase() + askFor.slice(1)}</div>
                    <svg viewBox="0 0 200 200" width="220" style="background:var(--bg-card);border-radius:12px;padding:8px;max-width:100%;">
                        ${svg}
                    </svg>
                    <div style="margin-top:6px;font-size:1rem;text-transform:capitalize;font-weight:600;">${shape2d.label}</div>
                </div>`;
                q.skillLabel = "2D Sides/Verts";
                q.printFormat = "count-2d-attrs";
                q.shape2DData = { shape: shape2d.key, label: shape2d.label, askFor, sides: shape2d.sides, points: shape2d.points };
                return;
            }

            // ===== COMPOSE SHAPES (Grade K-1) =====
            if (mappedSkill === "compose_shapes") {
                // Use IXL palette: piece A = blue (idx 0), piece B = orange (idx 2),
                // composed result = green (idx 1) with dashed seam in axis dark.
                const _pa = shapeStyle(0); // piece A
                const _pb = shapeStyle(2); // piece B
                const _pr = shapeStyle(1); // result
                const compositions = [
                    { result: "Rectangle", parts: ["Two squares"], partSvg: `
                        <rect x="10" y="50" width="60" height="60" fill="${_pa.fill}" stroke="${_pa.stroke}" stroke-width="${STROKE.normal}"/>
                        <rect x="90" y="50" width="60" height="60" fill="${_pb.fill}" stroke="${_pb.stroke}" stroke-width="${STROKE.normal}"/>`,
                        resultSvg: `<rect x="10" y="50" width="120" height="60" fill="${_pr.fill}" stroke="${_pr.stroke}" stroke-width="${STROKE.normal}"/>
                        <line x1="70" y1="50" x2="70" y2="110" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}" stroke-dasharray="6,4"/>` },
                    { result: "Square", parts: ["Two triangles"], partSvg: `
                        <polygon points="10,110 70,50 70,110" fill="${_pa.fill}" stroke="${_pa.stroke}" stroke-width="${STROKE.normal}"/>
                        <polygon points="90,50 150,50 150,110" fill="${_pb.fill}" stroke="${_pb.stroke}" stroke-width="${STROKE.normal}"/>`,
                        resultSvg: `<rect x="10" y="50" width="60" height="60" fill="${_pr.fill}" stroke="${_pr.stroke}" stroke-width="${STROKE.normal}"/>
                        <line x1="10" y1="110" x2="70" y2="50" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}" stroke-dasharray="6,4"/>` },
                    { result: "Triangle", parts: ["Two smaller triangles"], partSvg: `
                        <polygon points="10,110 50,50 50,110" fill="${_pa.fill}" stroke="${_pa.stroke}" stroke-width="${STROKE.normal}"/>
                        <polygon points="100,110 100,50 140,110" fill="${_pb.fill}" stroke="${_pb.stroke}" stroke-width="${STROKE.normal}"/>`,
                        resultSvg: `<polygon points="10,110 70,30 130,110" fill="${_pr.fill}" stroke="${_pr.stroke}" stroke-width="${STROKE.normal}"/>
                        <line x1="70" y1="30" x2="70" y2="110" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}" stroke-dasharray="6,4"/>` },
                    { result: "Hexagon", parts: ["Two trapezoids"], partSvg: `
                        <polygon points="20,80 40,50 80,50 100,80" fill="${_pa.fill}" stroke="${_pa.stroke}" stroke-width="${STROKE.normal}"/>
                        <polygon points="110,80 130,110 90,110 70,80" fill="${_pb.fill}" stroke="${_pb.stroke}" stroke-width="${STROKE.normal}"/>`,
                        resultSvg: (() => {
                            const pts = [];
                            for (let i = 0; i < 6; i++) {
                                const a = Math.PI / 3 * i - Math.PI / 2;
                                pts.push(`${70 + 40 * Math.cos(a)},${80 + 40 * Math.sin(a)}`);
                            }
                            return `<polygon points="${pts.join(' ')}" fill="${_pr.fill}" stroke="${_pr.stroke}" stroke-width="${STROKE.normal}"/>`;
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

            // ===== COMPOSE HEXAGON / COMPOSE RECT FROM SQUARES (Drag pattern blocks) =====
            // compose-shape-blocks widget: student drags pattern blocks into snap
            // points on a target outline. Many valid solutions can exist for
            // compose_hexagon (the generator picks ONE plan per question).
            if (mappedSkill === "compose_hexagon") {
                // Pattern-block "unit" — must match the widget's default (28px).
                const unit = 28;
                // Hexagon is centered at (170, 110); side = unit*2 (matches block geometry).
                // We pre-build three valid plans and pick one per question.
                // Plan A: 6 equilateral triangles (apex meets center)
                // Plan B: 3 blue rhombi (60°/120°)
                // Plan C: 2 red trapezoids (top + bottom)
                const cx = 170, cy = 110;
                const r = unit * 2;

                // Build the hexagon outline.
                const hexPts = [];
                for (let i = 0; i < 6; i++) {
                    const ang = Math.PI / 3 * i - Math.PI / 2;
                    hexPts.push(`${(cx + r * Math.cos(ang)).toFixed(2)},${(cy + r * Math.sin(ang)).toFixed(2)}`);
                }
                const targetSvg = `<svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="${hexPts.join(' ')}" fill="#fff" stroke="#37474f" stroke-width="3" stroke-linejoin="round"/>
                </svg>`;

                const plan = pick(['triangles', 'rhombi', 'trapezoids']);
                let snapPoints = [];
                let palette = [];

                if (plan === 'triangles') {
                    // 6 triangles, each rotated to point outward from center.
                    // Triangle apex points OUT (to the hexagon vertex); triangle
                    // base sits along the inner edge that bisects two adjacent
                    // hex vertices. Centroid of an equilateral triangle is at
                    // 1/3 of the height from the base; we approximate by
                    // placing the snap point partway from center toward the
                    // outer vertex.
                    for (let i = 0; i < 6; i++) {
                        const ang = Math.PI / 3 * i - Math.PI / 2 + Math.PI / 6;
                        const dist = r * 0.55;
                        snapPoints.push({
                            id: `t${i}`,
                            shape: 'triangle',
                            cx: cx + dist * Math.cos(ang),
                            cy: cy + dist * Math.sin(ang),
                            rotation: (i * 60) + 30
                        });
                    }
                    palette = [{ shape: 'triangle', count: 6 }];
                } else if (plan === 'rhombi') {
                    // 3 rhombi at 60° apart, each centered halfway from center
                    // to the midpoint of two adjacent hexagon vertices.
                    for (let i = 0; i < 3; i++) {
                        const ang = (i * 120) - 90;
                        const rad = ang * Math.PI / 180;
                        const dist = r * 0.5;
                        snapPoints.push({
                            id: `rh${i}`,
                            shape: 'rhombus',
                            cx: cx + dist * Math.cos(rad),
                            cy: cy + dist * Math.sin(rad),
                            rotation: ang + 90
                        });
                    }
                    palette = [{ shape: 'rhombus', count: 3 }];
                } else {
                    // 2 trapezoids — top half and bottom half of the hexagon.
                    snapPoints.push({ id: 'tr0', shape: 'trapezoid', cx: cx, cy: cy - unit / 2, rotation: 0 });
                    snapPoints.push({ id: 'tr1', shape: 'trapezoid', cx: cx, cy: cy + unit / 2, rotation: 180 });
                    palette = [{ shape: 'trapezoid', count: 2 }];
                }

                q.text = `Fill the hexagon with pattern blocks. Drag each block into a slot.`;
                q.answerType = "compose-shape-blocks";
                q.targetSvg = targetSvg;
                q.snapPoints = snapPoints;
                q.palette = palette;
                q.unit = unit;
                q.ans = `Hexagon (${plan})`;
                q.options = [];
                q.hint = `A hexagon can be made from 6 triangles, 3 rhombi, or 2 trapezoids. Match the slot shape!`;
                q.skillLabel = 'Compose Hexagon';
                q.printFormat = 'compose-shape-blocks';
                q.visual = `<div style="text-align:center;font-weight:600;color:#1565c0;">Target: Hexagon</div>`;
                return;
            }

            if (mappedSkill === "compose_rect_from_squares") {
                // Compose a 2x3 rectangle from 6 unit squares.
                const unit = 28;
                const cellSize = unit * 2;
                const cols = 3, rows = 2;
                const totalW = cellSize * cols;
                const totalH = cellSize * rows;
                const offsetX = (340 - totalW) / 2;
                const offsetY = (220 - totalH) / 2;

                const targetSvg = `<svg viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg">
                    <rect x="${offsetX}" y="${offsetY}" width="${totalW}" height="${totalH}" fill="#fff" stroke="#37474f" stroke-width="3" stroke-linejoin="round"/>
                </svg>`;

                const snapPoints = [];
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        snapPoints.push({
                            id: `sq${r}${c}`,
                            shape: 'square',
                            cx: offsetX + c * cellSize + cellSize / 2,
                            cy: offsetY + r * cellSize + cellSize / 2,
                            rotation: 0
                        });
                    }
                }

                q.text = `Fill the rectangle with unit squares. Drag each square into a slot.`;
                q.answerType = "compose-shape-blocks";
                q.targetSvg = targetSvg;
                q.snapPoints = snapPoints;
                q.palette = [{ shape: 'square', count: 6 }];
                q.unit = unit;
                q.ans = `2 × 3 rectangle`;
                q.options = [];
                q.hint = `A 2 × 3 rectangle holds 2 rows × 3 columns = 6 unit squares.`;
                q.skillLabel = 'Compose Rectangle';
                q.printFormat = 'compose-shape-blocks';
                q.visual = `<div style="text-align:center;font-weight:600;color:#1565c0;">Target: 2 × 3 rectangle</div>`;
                return;
            }

            // ===== PARTITION SHAPES (Grade 1-3) =====
            if (mappedSkill === "partition_shapes") {
                const partCount = pick([2, 3, 4]);
                const shapeKind = pick(["rectangle", "circle"]);
                const shadedCount = rng(1, partCount - 1);

                // Decide question type. LRU rotation prevents the same form repeating
                // back-to-back across consecutive partition_shapes problems.
                const qType = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('partition_shapes', ["count_parts", "fraction_shaded"])
                    : pick(["count_parts", "fraction_shaded"]);
                q._variant = qType;

                let shapeSvg = '';
                // IXL-style: single saturated color for all partitions, fill = soft alpha when shaded.
                const _ps = shapeStyle(0);
                if (shapeKind === "rectangle") {
                    const w = 180, h = 100;
                    const partW = w / partCount;
                    for (let i = 0; i < partCount; i++) {
                        const isFilled = i < shadedCount;
                        shapeSvg += `<rect x="${10 + i * partW}" y="10" width="${partW}" height="${h}" fill="${isFilled ? _ps.fill : COLORS.bg}" stroke="${_ps.stroke}" stroke-width="${STROKE.normal}"/>`;
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
                        shapeSvg += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z" fill="${isFilled ? _ps.fill : COLORS.bg}" stroke="${_ps.stroke}" stroke-width="${STROKE.normal}"/>`;
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
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.3rem;">Equal Parts</div>
                    <svg width="320" height="${shapeKind === 'rectangle' ? 192 : 224}" viewBox="0 0 200 ${shapeKind === 'rectangle' ? 120 : 140}" style="max-width:100%;">
                        ${shapeSvg}
                    </svg>
                    <div style="margin-top:10px;font-size:1rem;color:var(--text-dim);">
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
                const _sa = (i) => shapeStyle(i);
                const saPool = [
                    { name: 'square', sides: 4, rightAngles: 4, parallel: true, equalSides: true,
                      svg: (() => { const s = _sa(0); return `<rect x="20" y="20" width="60" height="60" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { name: 'rectangle', sides: 4, rightAngles: 4, parallel: true, equalSides: false,
                      svg: (() => { const s = _sa(1); return `<rect x="10" y="25" width="80" height="50" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { name: 'rhombus', sides: 4, rightAngles: 0, parallel: true, equalSides: true,
                      svg: (() => { const s = _sa(2); return `<polygon points="50,10 90,50 50,90 10,50" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { name: 'parallelogram', sides: 4, rightAngles: 0, parallel: true, equalSides: false,
                      svg: (() => { const s = _sa(2); return `<polygon points="20,75 80,75 90,25 30,25" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { name: 'triangle', sides: 3, rightAngles: 0, parallel: false, equalSides: false,
                      svg: (() => { const s = _sa(4); return `<polygon points="50,10 90,85 10,85" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { name: 'right triangle', sides: 3, rightAngles: 1, parallel: false, equalSides: false,
                      svg: (() => { const s = _sa(4); return `<polygon points="20,20 20,80 80,80" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { name: 'pentagon', sides: 5, rightAngles: 0, parallel: false, equalSides: true,
                      svg: (() => { const s = _sa(3); return `<polygon points="50,10 90,38 75,85 25,85 10,38" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { name: 'trapezoid', sides: 4, rightAngles: 0, parallel: true, equalSides: false,
                      svg: (() => { const s = _sa(5); return `<polygon points="15,80 85,80 70,20 30,20" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() }
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

            // ===== COMPOSE FROM ATTRIBUTES (Grade 3) — multi-criterion multi-select =====
            // Band 191-200, K2 pool. Pool of 8-10 shapes with computed attributes
            // (sides, right-angle count, parallel-side pairs, equal-side groups).
            // Question varies the criterion (often a 2-attribute AND).
            if (mappedSkill === "compose_from_attributes") {
                const _cfa = (i) => shapeStyle(i);
                // Each entry: name + computed attributes
                // sides, rightAngles, parallelPairs (pairs of parallel sides), equalSideGroups (max group of equal sides)
                const cfaPool = [
                    { key: 'square', name: 'square', sides: 4, rightAngles: 4, parallelPairs: 2, equalSideGroups: 4,
                      svg: (() => { const s = _cfa(0); return `<rect x="20" y="20" width="60" height="60" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'rectangle', name: 'rectangle', sides: 4, rightAngles: 4, parallelPairs: 2, equalSideGroups: 2,
                      svg: (() => { const s = _cfa(1); return `<rect x="10" y="25" width="80" height="50" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'rhombus', name: 'rhombus', sides: 4, rightAngles: 0, parallelPairs: 2, equalSideGroups: 4,
                      svg: (() => { const s = _cfa(2); return `<polygon points="50,10 90,50 50,90 10,50" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'parallelogram', name: 'parallelogram', sides: 4, rightAngles: 0, parallelPairs: 2, equalSideGroups: 2,
                      svg: (() => { const s = _cfa(2); return `<polygon points="20,75 80,75 90,25 30,25" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'trapezoid', name: 'trapezoid', sides: 4, rightAngles: 0, parallelPairs: 1, equalSideGroups: 1,
                      svg: (() => { const s = _cfa(5); return `<polygon points="15,80 85,80 70,20 30,20" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'right_trapezoid', name: 'right trapezoid', sides: 4, rightAngles: 2, parallelPairs: 1, equalSideGroups: 1,
                      svg: (() => { const s = _cfa(5); return `<polygon points="15,80 85,80 85,30 15,30 15,80 70,30" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}" fill-rule="evenodd"/><polygon points="15,80 85,80 85,30 15,30" fill="none" stroke="none"/><polygon points="15,30 70,30 85,80 15,80" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'irregular_quad', name: 'quadrilateral', sides: 4, rightAngles: 0, parallelPairs: 0, equalSideGroups: 1,
                      svg: (() => { const s = _cfa(3); return `<polygon points="15,20 88,18 95,75 25,90" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'kite', name: 'kite', sides: 4, rightAngles: 0, parallelPairs: 0, equalSideGroups: 2,
                      svg: (() => { const s = _cfa(3); return `<polygon points="50,8 88,42 50,92 12,42" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'eq_triangle', name: 'equilateral triangle', sides: 3, rightAngles: 0, parallelPairs: 0, equalSideGroups: 3,
                      svg: (() => { const s = _cfa(4); return `<polygon points="50,12 88,80 12,80" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'right_triangle', name: 'right triangle', sides: 3, rightAngles: 1, parallelPairs: 0, equalSideGroups: 1,
                      // Clearly scalene 3-4-5 style: vertical leg 65 (y=15→80), horizontal leg 35 (x=15→50).
                      // Previous 60×65 legs read as visually equal and confused students answering "≥2 equal sides".
                      svg: (() => { const s = _cfa(4); return `<polygon points="15,15 15,80 50,80" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'iso_right_triangle', name: 'right triangle', sides: 3, rightAngles: 1, parallelPairs: 0, equalSideGroups: 2,
                      // Isosceles right triangle: both legs equal length (65), so it satisfies "≥2 equal sides" AND "1 right angle".
                      svg: (() => { const s = _cfa(4); return `<polygon points="15,15 15,80 80,80" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'iso_triangle', name: 'isosceles triangle', sides: 3, rightAngles: 0, parallelPairs: 0, equalSideGroups: 2,
                      svg: (() => { const s = _cfa(4); return `<polygon points="50,10 85,82 15,82" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'pentagon', name: 'pentagon', sides: 5, rightAngles: 0, parallelPairs: 0, equalSideGroups: 5,
                      svg: (() => { const s = _cfa(0); return `<polygon points="50,10 90,38 75,85 25,85 10,38" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                    { key: 'hexagon', name: 'hexagon', sides: 6, rightAngles: 0, parallelPairs: 3, equalSideGroups: 6,
                      svg: (() => { const s = _cfa(2); return `<polygon points="50,8 86,30 86,70 50,92 14,70 14,30" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${s.strokeWidth}"/>`; })() },
                ];

                // Criteria — each returns a predicate AND a human-readable prompt.
                // For multi-attribute (AND) criteria, the second qualifier is in
                // ALL CAPS so students don't lock onto only the first attribute
                // (e.g. "3 sides") and miss the second (e.g. "no right angles").
                // q.text is HTML-escaped at render time, so we cannot use <b> tags
                // — caps + the word "AND" is the strongest available signal.
                // Distractors in the wrong-pool deliberately include shapes that
                // match ONE attribute but not BOTH — that's the pedagogical point.
                const criteria = [
                    { id: 'four_sides_no_par', prompt: 'Click ALL the shapes that have exactly 4 sides AND NO PARALLEL SIDES. (Skip any 4-sided shape that DOES have parallel sides.)',
                      hint: 'Watch out: squares, rectangles, and trapezoids have parallel sides — skip those.',
                      fn: s => s.sides === 4 && s.parallelPairs === 0 },
                    { id: 'three_sides_no_right', prompt: 'Click ALL the shapes that have exactly 3 sides AND NO RIGHT ANGLES. (Skip any triangle with a square 90° corner.)',
                      hint: 'Watch out: a right triangle has 3 sides but ALSO has a 90° corner — skip it.',
                      fn: s => s.sides === 3 && s.rightAngles === 0 },
                    { id: 'four_right', prompt: 'Click ALL the shapes that have 4 right angles.',
                      hint: 'Each corner must be a perfect square (90°) angle.',
                      fn: s => s.rightAngles === 4 },
                    { id: 'all_sides_equal', prompt: 'Click ALL the shapes that have all sides equal in length.',
                      hint: 'Every side of the shape must be the same length.',
                      fn: s => s.equalSideGroups === s.sides && s.sides >= 3 },
                    { id: 'parallel_sides', prompt: 'Click ALL the shapes that have at least one pair of parallel sides.',
                      hint: 'Two sides are parallel when they never meet, like train tracks.',
                      fn: s => s.parallelPairs >= 1 },
                    { id: 'four_sides_par', prompt: 'Click ALL the shapes that have exactly 4 sides AND AT LEAST ONE PAIR OF PARALLEL SIDES. (Skip any 4-sided shape with no parallel sides.)',
                      hint: 'A quadrilateral with at least one pair of parallel sides.',
                      fn: s => s.sides === 4 && s.parallelPairs >= 1 },
                    { id: 'right_only_one', prompt: 'Click ALL the shapes that have exactly 1 right angle.',
                      hint: 'Find the shape where exactly one corner is a 90° square corner.',
                      fn: s => s.rightAngles === 1 },
                    { id: 'three_sides_some_eq', prompt: 'Click ALL the shapes that have 3 sides AND AT LEAST 2 SIDES EQUAL. (Skip any triangle with all sides different.)',
                      hint: 'Watch out: a scalene/right triangle has 3 sides but no equal sides — skip it.',
                      fn: s => s.sides === 3 && s.equalSideGroups >= 2 },
                ];

                // Pick a criterion that has 1-3 matches in our pool (avoid all-or-nothing)
                let crit, correctPool, wrongPool;
                const tries = shuffle([...criteria]);
                for (const c of tries) {
                    const cp = cfaPool.filter(c.fn);
                    if (cp.length >= 1 && cp.length <= 4) {
                        crit = c;
                        correctPool = cp;
                        wrongPool = cfaPool.filter(s => !c.fn(s));
                        break;
                    }
                }
                if (!crit) {
                    crit = criteria[0];
                    correctPool = cfaPool.filter(crit.fn);
                    wrongPool = cfaPool.filter(s => !crit.fn(s));
                }

                const ccount = Math.min(correctPool.length, randInt(2, 3));
                const wcount = Math.min(wrongPool.length, randInt(3, 4));
                const chosen = shuffle([
                    ...shuffle([...correctPool]).slice(0, ccount),
                    ...shuffle([...wrongPool]).slice(0, wcount)
                ]);

                const opts = chosen.map((s, i) => ({
                    id: 'opt' + i,
                    svg: `<svg viewBox="0 0 100 100" width="78" height="78">${s.svg}</svg>`,
                    label: s.name,
                    correct: crit.fn(s)
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);

                q.text = crit.prompt;
                q.ans = ans;
                q.options = opts;
                q.answerType = 'multi-select-check';
                q.hint = crit.hint;
                q.printFormat = 'compose-from-attributes';
                q.skillLabel = 'Attributes';
                q.cfaData = { criterionId: crit.id, prompt: crit.prompt };
                return;
            }

            // ===== SHAPE ATTRIBUTES (Grade 1-2) =====
            if (mappedSkill === "shape_attributes") {
                const _ats = (i) => shapeStyle(i);
                const attrShapes = [
                    { name: "Triangle", sides: 3, vertices: 3, svgFn: () => {
                        const pts = [[100, 20], [20, 160], [180, 160]];
                        const s = _ats(2);
                        let svg = `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${STROKE.normal}"/>`;
                        return { svg, pts };
                    }},
                    { name: "Square", sides: 4, vertices: 4, svgFn: () => {
                        const pts = [[30, 30], [170, 30], [170, 170], [30, 170]];
                        const s = _ats(0);
                        let svg = `<rect x="30" y="30" width="140" height="140" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${STROKE.normal}"/>`;
                        return { svg, pts };
                    }},
                    { name: "Rectangle", sides: 4, vertices: 4, svgFn: () => {
                        const pts = [[20, 50], [180, 50], [180, 150], [20, 150]];
                        const s = _ats(1);
                        let svg = `<rect x="20" y="50" width="160" height="100" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${STROKE.normal}"/>`;
                        return { svg, pts };
                    }},
                    { name: "Pentagon", sides: 5, vertices: 5, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 5; i++) {
                            const a = Math.PI * 2 / 5 * i - Math.PI / 2;
                            pts.push([100 + 75 * Math.cos(a), 100 + 75 * Math.sin(a)]);
                        }
                        const s = _ats(3);
                        let svg = `<polygon points="${pts.map(p => p.map(v => Math.round(v)).join(',')).join(' ')}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${STROKE.normal}"/>`;
                        return { svg, pts };
                    }},
                    { name: "Hexagon", sides: 6, vertices: 6, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 6; i++) {
                            const a = Math.PI / 3 * i - Math.PI / 2;
                            pts.push([100 + 75 * Math.cos(a), 100 + 75 * Math.sin(a)]);
                        }
                        const s = _ats(0);
                        let svg = `<polygon points="${pts.map(p => p.map(v => Math.round(v)).join(',')).join(' ')}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${STROKE.normal}"/>`;
                        return { svg, pts };
                    }},
                    { name: "Octagon", sides: 8, vertices: 8, svgFn: () => {
                        const pts = [];
                        for (let i = 0; i < 8; i++) {
                            const a = Math.PI / 4 * i - Math.PI / 8;
                            pts.push([100 + 75 * Math.cos(a), 100 + 75 * Math.sin(a)]);
                        }
                        const s = _ats(2);
                        let svg = `<polygon points="${pts.map(p => p.map(v => Math.round(v)).join(',')).join(' ')}" fill="${s.fill}" stroke="${s.stroke}" stroke-width="${STROKE.normal}"/>`;
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

                // Map dims into the drawing coord system: x=width (right), y=depth (into page, away from viewer), z=height (up)
                // Bottom occupies (0..w1) x (0..d1) x (0..h1)
                // Top occupies   (tx..tx+w2) x (ty..ty+d2) x (h1..h1+h2) — sits ON the bottom, sharing a face along z=h1
                const bw = w1, bd = d1, bh = h1;
                const tw = w2, td = d2, th = h2;
                const tzBase = bh;

                // Isometric projection (30 deg). x-axis goes right & slightly down; y-axis goes left & slightly down (into page); z-axis goes straight up.
                const ISO_COS = 0.866;   // cos(30)
                const ISO_SIN = 0.5;     // sin(30)
                const uX = (x, y) => (x - y) * ISO_COS;
                const uY = (x, y, z) => (x + y) * ISO_SIN - z;

                // All 16 vertices — bounding box calc for fitting into SVG
                const allVerts = [
                    [0,0,0],[bw,0,0],[bw,bd,0],[0,bd,0],
                    [0,0,bh],[bw,0,bh],[bw,bd,bh],[0,bd,bh],
                    [tx,ty,tzBase],[tx+tw,ty,tzBase],[tx+tw,ty+td,tzBase],[tx,ty+td,tzBase],
                    [tx,ty,tzBase+th],[tx+tw,ty,tzBase+th],[tx+tw,ty+td,tzBase+th],[tx,ty+td,tzBase+th]
                ];
                let mnX = Infinity, mxX = -Infinity, mnY = Infinity, mxY = -Infinity;
                for (const [vx,vy,vz] of allVerts) {
                    const px = uX(vx,vy), py = uY(vx,vy,vz);
                    if (px < mnX) mnX = px; if (px > mxX) mxX = px;
                    if (py < mnY) mnY = py; if (py > mxY) mxY = py;
                }
                const unitW = mxX - mnX;
                const unitH = mxY - mnY;

                // Single SVG, single viewBox, single coherent isometric projection
                const svgW = 480, svgH = 384;
                const targetW = 320, targetH = 230; // shape area; leaves margin for labels
                const scale = Math.min(targetW / unitW, targetH / unitH);
                const ox = -mnX * scale + (svgW - unitW * scale) / 2;
                const oy = -mnY * scale + (svgH - unitH * scale) / 2;

                const isoX = (x, y, z) => Math.round((ox + uX(x,y) * scale) * 10) / 10;
                const isoY = (x, y, z) => Math.round((oy + uY(x,y,z) * scale) * 10) / 10;

                // Helper: build a face path from 4 (x,y,z) corners (closed)
                const facePath = (corners) =>
                    'M ' + corners.map(([x,y,z]) => `${isoX(x,y,z)} ${isoY(x,y,z)}`).join(' L ') + ' Z';

                // Helper: a single edge line from a→b
                const edge = (a, b, dashed = false) =>
                    `<line x1="${isoX(...a)}" y1="${isoY(...a)}" x2="${isoX(...b)}" y2="${isoY(...b)}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}" stroke-linecap="round"${dashed ? ' stroke-dasharray="4,4" stroke-opacity="0.55"' : ''}/>`;

                // ----- Visible faces (painter's algorithm: back to front) -----
                // Both prisms share the same iso projection. Visible faces in standard front-right-top view: front (y=0), right (x=max), top (z=max).
                // For the composite, the bottom's top face is partially covered by the top prism's footprint; draw only the exposed strip.

                const bottomFill = softFill(COLORS.fill[0]);   // blue ~18%
                const topFill    = softFill(COLORS.fill[2]);   // orange ~18%

                // Bottom prism faces
                const bFront = facePath([[0,0,0],[bw,0,0],[bw,0,bh],[0,0,bh]]);
                const bRight = facePath([[bw,0,0],[bw,bd,0],[bw,bd,bh],[bw,0,bh]]);
                let bTopVisible;
                if (compType === "step") {
                    // top prism sits at x=0..tw across full depth → exposed bottom-top is x=tw..bw, y=0..bd
                    bTopVisible = facePath([[tw,0,bh],[bw,0,bh],[bw,bd,bh],[tw,bd,bh]]);
                } else {
                    // L: top prism sits at y=0..td across full width → exposed bottom-top is y=td..bd, x=0..bw
                    bTopVisible = facePath([[0,td,bh],[bw,td,bh],[bw,bd,bh],[0,bd,bh]]);
                }

                // Top prism faces. For "step", the top prism's RIGHT face (at x=tw) is fully exposed and meets the bottom-top step.
                // For "L", the top prism's BACK face (at y=td) is exposed and meets the bottom-top shelf.
                const tFront = facePath([[tx,ty,tzBase],[tx+tw,ty,tzBase],[tx+tw,ty,tzBase+th],[tx,ty,tzBase+th]]);
                const tRight = facePath([[tx+tw,ty,tzBase],[tx+tw,ty+td,tzBase],[tx+tw,ty+td,tzBase+th],[tx+tw,ty,tzBase+th]]);
                const tTop   = facePath([[tx,ty,tzBase+th],[tx+tw,ty,tzBase+th],[tx+tw,ty+td,tzBase+th],[tx,ty+td,tzBase+th]]);

                // ----- Visible edges (drawn ON TOP of faces with a unified dark stroke) -----
                const visibleEdges = [];
                // Bottom prism: visible front-bottom, front verticals, top-front, right top-front, right vertical at far back, bottom-right
                visibleEdges.push(edge([0,0,0],[bw,0,0]));         // front-bottom
                visibleEdges.push(edge([0,0,0],[0,0,bh]));         // front-left vertical (bottom)
                visibleEdges.push(edge([bw,0,0],[bw,0,bh]));       // front-right vertical (bottom)
                visibleEdges.push(edge([bw,0,bh],[bw,bd,bh]));     // bottom top-right edge (back along right top)
                visibleEdges.push(edge([bw,0,0],[bw,bd,0]));       // bottom-right ground edge (right side base)
                visibleEdges.push(edge([bw,bd,0],[bw,bd,bh]));     // back-right vertical of bottom (visible silhouette)
                // Front-top of bottom prism: only the part NOT covered by the top prism's front footprint
                if (compType === "step") {
                    // Top prism covers x=0..tw at front → exposed front-top is x=tw..bw at y=0,z=bh
                    visibleEdges.push(edge([tw,0,bh],[bw,0,bh]));
                } else {
                    // L: top prism covers full width at front → none of the bottom front-top edge is exposed at y=0
                    // (the join is the entire top of the bottom front face, occluded by the top prism's front face)
                }
                // Bottom prism's exposed top face boundary (the "step" or "shelf")
                if (compType === "step") {
                    visibleEdges.push(edge([tw,0,bh],[tw,bd,bh]));     // step inner edge (where top meets bottom-top)
                    visibleEdges.push(edge([tw,bd,bh],[bw,bd,bh]));    // back of exposed top strip
                } else {
                    visibleEdges.push(edge([0,td,bh],[bw,td,bh]));     // shelf edge (front of exposed bottom-top)
                    visibleEdges.push(edge([0,bd,bh],[bw,bd,bh]));     // back of exposed bottom-top
                    visibleEdges.push(edge([0,td,bh],[0,bd,bh]));      // left side of shelf (visible silhouette)
                }

                // Top prism visible edges
                visibleEdges.push(edge([tx,ty,tzBase],[tx+tw,ty,tzBase]));               // top prism front-bottom
                visibleEdges.push(edge([tx,ty,tzBase],[tx,ty,tzBase+th]));               // top prism front-left vertical
                visibleEdges.push(edge([tx+tw,ty,tzBase],[tx+tw,ty,tzBase+th]));         // top prism front-right vertical
                visibleEdges.push(edge([tx,ty,tzBase+th],[tx+tw,ty,tzBase+th]));         // top prism front-top edge
                visibleEdges.push(edge([tx+tw,ty,tzBase+th],[tx+tw,ty+td,tzBase+th]));   // top prism right-top edge
                visibleEdges.push(edge([tx,ty+td,tzBase+th],[tx+tw,ty+td,tzBase+th]));   // top prism back-top edge
                visibleEdges.push(edge([tx+tw,ty,tzBase],[tx+tw,ty+td,tzBase]));         // top prism right-bottom edge (where it meets bottom-top step)
                visibleEdges.push(edge([tx+tw,ty+td,tzBase],[tx+tw,ty+td,tzBase+th]));   // top prism back-right vertical
                if (compType === "L") {
                    // Top prism back face (at y=td) is exposed — its bottom and left edges are visible
                    visibleEdges.push(edge([tx,ty+td,tzBase],[tx+tw,ty+td,tzBase]));     // top back-bottom edge (along shelf)
                    visibleEdges.push(edge([tx,ty+td,tzBase],[tx,ty+td,tzBase+th]));     // top back-left vertical
                }

                // ----- Hidden edges (dashed) — the back-bottom-left vertex of the bottom prism -----
                const hiddenEdges = [
                    edge([0,bd,0],[bw,bd,0], true),   // back-bottom of bottom
                    edge([0,bd,0],[0,0,0],   true),   // left-bottom of bottom (along ground)
                    edge([0,bd,0],[0,bd,bh], true),   // back-left vertical of bottom
                ];

                // ----- Dimension labels — positioned on visible edges, outside silhouette where possible -----
                const fontSize = Math.max(18, Math.min(22, Math.round(scale * 0.9)));
                const lOff = Math.max(16, Math.round(scale * 0.7));
                const dimLabel = (x, y, text, anchor = 'middle') =>
                    `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" font-family="${FONTS.sans}" fill="${COLORS.text}" font-size="${fontSize}" font-weight="800" paint-order="stroke" stroke="white" stroke-width="3px" stroke-linejoin="round">${text}</text>`;

                // Bottom width (w1) — below the front-bottom edge
                const bw_lx = (isoX(0,0,0) + isoX(bw,0,0)) / 2;
                const bw_ly = (isoY(0,0,0) + isoY(bw,0,0)) / 2 + lOff;
                // Bottom depth (d1) — to the right of the bottom-right ground edge
                const bd_lx = (isoX(bw,0,0) + isoX(bw,bd,0)) / 2 + Math.round(lOff * 0.7);
                const bd_ly = (isoY(bw,0,0) + isoY(bw,bd,0)) / 2 + Math.round(lOff * 0.3);
                // Bottom height (h1) — to the LEFT of the front-left vertical edge
                const bh_lx = isoX(0, 0, bh / 2) - lOff;
                const bh_ly = isoY(0, 0, bh / 2);
                // Top height (h2) — to the LEFT of top prism's front-left vertical
                const th_lx = isoX(tx, ty, tzBase + th / 2) - Math.round(lOff * 0.85);
                const th_ly = isoY(tx, ty, tzBase + th / 2);

                let labels =
                    dimLabel(bw_lx, bw_ly, w1) +
                    dimLabel(bd_lx, bd_ly, d1, 'start') +
                    dimLabel(bh_lx, bh_ly, h1, 'end') +
                    dimLabel(th_lx, th_ly, h2, 'end');

                // Extra new dimension on the top prism
                if (compType === "step") {
                    // Top width (w2) — above top prism's front-top edge
                    const tw_lx = (isoX(tx, ty, tzBase + th) + isoX(tx + tw, ty, tzBase + th)) / 2;
                    const tw_ly = (isoY(tx, ty, tzBase + th) + isoY(tx + tw, ty, tzBase + th)) / 2 - Math.round(lOff * 0.55);
                    labels += dimLabel(tw_lx, tw_ly, w2);
                } else {
                    // L: top depth (d2) — to the right of the top prism's right-top edge
                    const td_lx = (isoX(tx + tw, ty, tzBase + th) + isoX(tx + tw, ty + td, tzBase + th)) / 2 + Math.round(lOff * 0.6);
                    const td_ly = (isoY(tx + tw, ty, tzBase + th) + isoY(tx + tw, ty + td, tzBase + th)) / 2 + Math.round(lOff * 0.2);
                    labels += dimLabel(td_lx, td_ly, d2, 'start');
                }

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;">Composite Volume</div>
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="max-width:100%;font-family:${FONTS.sans};">
                        <!-- Hidden edges first (dashed), so visible faces render on top -->
                        ${hiddenEdges.join('')}
                        <!-- Bottom prism faces (blue tint) — painter's order: back-most first -->
                        <path d="${bFront}" fill="${bottomFill}" stroke="none"/>
                        <path d="${bRight}" fill="${bottomFill}" stroke="none"/>
                        <path d="${bTopVisible}" fill="${bottomFill}" stroke="none"/>
                        <!-- Top prism faces (orange tint), drawn after bottom so it occludes any shared region -->
                        <path d="${tFront}" fill="${topFill}" stroke="none"/>
                        <path d="${tRight}" fill="${topFill}" stroke="none"/>
                        <path d="${tTop}" fill="${topFill}" stroke="none"/>
                        <!-- All visible edges with unified dark stroke -->
                        ${visibleEdges.join('')}
                        <!-- Dimension labels -->
                        ${labels}
                    </svg>
                    <div style="margin-top:6px;font-size:0.9rem;color:var(--text-dim);">
                        Break it into two rectangular prisms, find each volume, then add.
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
                // Area by counting unit squares - rectangles and L-shapes.
                // LRU rotation across the two shape variants so neither floods.
                const ausShapeType = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('area_unit_squares', ['rectangle', 'L'], [3, 2])
                    : (Math.random() < 0.6 ? 'rectangle' : 'L');
                q._variant = ausShapeType;
                const ausSqSize = 68; // bumped from 46 for layout-visual-left wide column

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
                            ausSquares += `<rect x="${ax}" y="${ay}" width="${ausSqSize}" height="${ausSqSize}" fill="${softFill(COLORS.fill[1])}" stroke="${COLORS.fill[1]}" stroke-width="${STROKE.normal}"/>`;
                        }
                    }
                    q.visual = `<div style="text-align:center;">
                        ${STUDENT_DEF_AREA}
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Area - Count Unit Squares</div>
                        <svg width="${ausSvgW}" height="${ausSvgH}" viewBox="0 0 ${ausSvgW} ${ausSvgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:560px;height:auto;">
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
                            ausSquares += `<rect x="${ax}" y="${ay}" width="${ausSqSize}" height="${ausSqSize}" fill="${softFill(COLORS.fill[1])}" stroke="${COLORS.fill[1]}" stroke-width="${STROKE.normal}"/>`;
                        }
                    }
                    q.visual = `<div style="text-align:center;">
                        ${STUDENT_DEF_AREA}
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Area - Count Unit Squares</div>
                        <svg width="${ausSvgW}" height="${ausSvgH}" viewBox="0 0 ${ausSvgW} ${ausSvgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:560px;height:auto;">
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
                // Perimeter on a grid - rectangles, L-shapes, and labeled-sides
                const pgSqSize = 68; // bumped from 46 for layout-visual-left wide column
                // 40% rectangle (grid), 25% L-shape (grid), 35% labeled-sides (no grid)
                const _pgRoll = Math.random();
                const pgShapeType = _pgRoll < 0.40 ? 'rectangle'
                                   : _pgRoll < 0.65 ? 'L'
                                   : 'labeled';

                if (pgShapeType === 'rectangle') {
                    const pgW = rng(2, 8);
                    const pgH = rng(2, 6);
                    const pgPerimeter = 2 * (pgW + pgH);
                    q.ans = pgPerimeter;
                    q.text = `Count the outside edges. What is the perimeter?`;
                    q.hint = `Count or add the OUTSIDE of the shape.`;

                    const pgSvgW = pgW * pgSqSize + 2;
                    const pgSvgH = pgH * pgSqSize + 2;
                    let pgSquares = '';
                    for (let pr = 0; pr < pgH; pr++) {
                        for (let pc = 0; pc < pgW; pc++) {
                            const px = 1 + pc * pgSqSize;
                            const py = 1 + pr * pgSqSize;
                            pgSquares += `<rect x="${px}" y="${py}" width="${pgSqSize}" height="${pgSqSize}" fill="${COLORS.bg}" stroke="${COLORS.grid}" stroke-width="${STROKE.hair}"/>`;
                        }
                    }
                    // Highlight perimeter
                    const pgOutline = `<rect class="perim-hint-outline" x="1" y="1" width="${pgW * pgSqSize}" height="${pgH * pgSqSize}" fill="none" stroke="${COLORS.fill[2]}" stroke-width="${STROKE.bold}" stroke-linejoin="round"/>`;

                    q.visual = `<div style="text-align:center;">
                        ${STUDENT_DEF_PERIMETER}
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Count Edges</div>
                        <svg width="${pgSvgW}" height="${pgSvgH}" viewBox="0 0 ${pgSvgW} ${pgSvgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:560px;height:auto;">
                            ${pgSquares}
                            ${pgOutline}
                        </svg>
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--text-bright);">Each square side = 1 unit</div>
                        <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                    </div>`;
                } else if (pgShapeType === 'L') {
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
                    q.hint = `Count or add the OUTSIDE of the shape.`;

                    const pgSvgW = pgFullW * pgSqSize + 2;
                    const pgSvgH = pgFullH * pgSqSize + 2;
                    let pgSquares = '';
                    for (let pr = 0; pr < pgFullH; pr++) {
                        for (let pc = 0; pc < pgFullW; pc++) {
                            if (pr < pgCutH && pc >= pgFullW - pgCutW) continue;
                            const px = 1 + pc * pgSqSize;
                            const py = 1 + pr * pgSqSize;
                            pgSquares += `<rect x="${px}" y="${py}" width="${pgSqSize}" height="${pgSqSize}" fill="${COLORS.bg}" stroke="${COLORS.grid}" stroke-width="${STROKE.hair}"/>`;
                        }
                    }
                    // Draw L-shape outline path
                    const pgOx = 1, pgOy = 1;
                    const pgPath = `M ${pgOx} ${pgOy + pgCutH * pgSqSize}`
                        + ` L ${pgOx} ${pgOy + pgFullH * pgSqSize}`
                        + ` L ${pgOx + pgFullW * pgSqSize} ${pgOy + pgFullH * pgSqSize}`
                        + ` L ${pgOx + pgFullW * pgSqSize} ${pgOy}`
                        + ` L ${pgOx + (pgFullW - pgCutW) * pgSqSize} ${pgOy}`
                        + ` L ${pgOx + (pgFullW - pgCutW) * pgSqSize} ${pgOy + pgCutH * pgSqSize}`
                        + ` L ${pgOx} ${pgOy + pgCutH * pgSqSize}`;

                    q.visual = `<div style="text-align:center;">
                        ${STUDENT_DEF_PERIMETER}
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Count Edges</div>
                        <svg width="${pgSvgW}" height="${pgSvgH}" viewBox="0 0 ${pgSvgW} ${pgSvgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:560px;height:auto;">
                            ${pgSquares}
                            <path class="perim-hint-outline" d="${pgPath}" fill="none" stroke="${COLORS.fill[2]}" stroke-width="${STROKE.bold}" stroke-linejoin="round"/>
                        </svg>
                        <div style="margin-top:8px;font-size:0.85rem;color:var(--text-bright);">Each square side = 1 unit</div>
                        <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                    </div>`;
                } else {
                    // Labeled-sides variant: clean shape (no grid), numbers on each side outside the edge.
                    // 35% of these are L-shapes with 6 labeled sides; 65% are rectangles with 4 labels.
                    const _isL = Math.random() < 0.35;
                    // Choose a unit scale so the shape stays within ~360px max
                    const _maxPx = 360;
                    if (!_isL) {
                        const lblW = rng(3, 12);
                        const lblH = rng(2, Math.min(9, lblW));
                        const lblPerim = 2 * (lblW + lblH);
                        q.ans = lblPerim;
                        q.text = `Find the perimeter of this rectangle.`;
                        q.hint = `Count or add the OUTSIDE of the shape.`;
                        // Compute scale: largest dim maps to _maxPx
                        const _maxDim = Math.max(lblW, lblH);
                        const _unit = Math.floor(_maxPx / _maxDim);
                        const _w = lblW * _unit;
                        const _h = lblH * _unit;
                        const _pad = 60; // room for outside labels
                        const _svgW = _w + _pad * 2;
                        const _svgH = _h + _pad * 2;
                        const _x0 = _pad, _y0 = _pad;
                        const _fill = softFill(COLORS.primary);
                        const _stroke = COLORS.primary;
                        // Side labels: top, bottom, left, right
                        const _topLbl = `<text x="${_x0 + _w/2}" y="${_y0 - 18}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${lblW}</text>`;
                        const _botLbl = `<text x="${_x0 + _w/2}" y="${_y0 + _h + 36}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${lblW}</text>`;
                        const _lftLbl = `<text x="${_x0 - 22}" y="${_y0 + _h/2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${lblH}</text>`;
                        const _rgtLbl = `<text x="${_x0 + _w + 22}" y="${_y0 + _h/2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${lblH}</text>`;
                        q.visual = `<div style="text-align:center;">
                            ${STUDENT_DEF_PERIMETER}
                            <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Add the Sides</div>
                            <svg width="${_svgW}" height="${_svgH}" viewBox="0 0 ${_svgW} ${_svgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:${_maxPx + _pad * 2}px;height:auto;">
                                <rect class="perim-hint-outline" x="${_x0}" y="${_y0}" width="${_w}" height="${_h}" fill="${_fill}" stroke="${_stroke}" stroke-width="${STROKE.bold}" stroke-linejoin="round"/>
                                ${_topLbl}${_botLbl}${_lftLbl}${_rgtLbl}
                            </svg>
                            <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                        </div>`;
                    } else {
                        // L-shape with labeled sides (top-right corner cut out)
                        const lblFW = rng(5, 10);
                        const lblFH = rng(4, 8);
                        const lblCW = rng(1, lblFW - 2);
                        const lblCH = rng(1, lblFH - 2);
                        // 6 sides walked clockwise from top-left:
                        //   side1 = top-left segment (lblFW - lblCW)
                        //   side2 = step down (lblCH)
                        //   side3 = step right (lblCW)
                        //   side4 = right side (lblFH - lblCH)  ... wait, that's bottom right going down
                        // Use bottom-left, up-left, top-partial, down-step, right-step, down-right, bottom
                        const sideTopLeft = lblFW - lblCW;   // top horizontal (left part)
                        const sideStepDown = lblCH;          // step down
                        const sideStepRight = lblCW;         // step right
                        const sideRight = lblFH - lblCH;     // remaining right side
                        const sideBottom = lblFW;            // full bottom
                        const sideLeft = lblFH;              // full left
                        const lblPerim = sideTopLeft + sideStepDown + sideStepRight + sideRight + sideBottom + sideLeft;
                        q.ans = lblPerim;
                        q.text = `Find the perimeter of this composite shape.`;
                        q.hint = `Count or add the OUTSIDE of the shape.`;
                        const _maxDimL = Math.max(lblFW, lblFH);
                        const _unitL = Math.floor(_maxPx / _maxDimL);
                        const _W = lblFW * _unitL;
                        const _H = lblFH * _unitL;
                        const _CW = lblCW * _unitL;
                        const _CH = lblCH * _unitL;
                        const _padL = 60;
                        const _svgWL = _W + _padL * 2;
                        const _svgHL = _H + _padL * 2;
                        const _ox = _padL, _oy = _padL;
                        const _fillL = softFill(COLORS.primary);
                        const _strokeL = COLORS.primary;
                        // L-path: start top-left, go right (top-left segment), down (step), right (step), down (right), left (bottom), up (left)
                        const _pathL = `M ${_ox} ${_oy} `
                                     + `L ${_ox + (_W - _CW)} ${_oy} `
                                     + `L ${_ox + (_W - _CW)} ${_oy + _CH} `
                                     + `L ${_ox + _W} ${_oy + _CH} `
                                     + `L ${_ox + _W} ${_oy + _H} `
                                     + `L ${_ox} ${_oy + _H} `
                                     + `L ${_ox} ${_oy}`;
                        // Labels positioned outside each side
                        const _lblTopLeft   = `<text x="${_ox + (_W - _CW) / 2}" y="${_oy - 14}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideTopLeft}</text>`;
                        const _lblStepDown  = `<text x="${_ox + (_W - _CW) - 18}" y="${_oy + _CH / 2 + 8}" text-anchor="end" font-size="22" font-weight="800" fill="${COLORS.text}">${sideStepDown}</text>`;
                        const _lblStepRight = `<text x="${_ox + (_W - _CW) + _CW / 2}" y="${_oy + _CH - 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideStepRight}</text>`;
                        const _lblRight     = `<text x="${_ox + _W + 22}" y="${_oy + _CH + (_H - _CH) / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideRight}</text>`;
                        const _lblBottom    = `<text x="${_ox + _W / 2}" y="${_oy + _H + 36}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideBottom}</text>`;
                        const _lblLeft      = `<text x="${_ox - 22}" y="${_oy + _H / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideLeft}</text>`;
                        q.visual = `<div style="text-align:center;">
                            ${STUDENT_DEF_PERIMETER}
                            <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Add the Sides</div>
                            <svg width="${_svgWL}" height="${_svgHL}" viewBox="0 0 ${_svgWL} ${_svgHL}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:${_maxPx + _padL * 2}px;height:auto;">
                                <path class="perim-hint-outline" d="${_pathL}" fill="${_fillL}" stroke="${_strokeL}" stroke-width="${STROKE.bold}" stroke-linejoin="round"/>
                                ${_lblTopLeft}${_lblStepDown}${_lblStepRight}${_lblRight}${_lblBottom}${_lblLeft}
                            </svg>
                            <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                        </div>`;
                    }
                }
                q.answerType = "number";
                q.options = buildNumericOptions(q.ans);
                q.printFormat = 'perimeter-grid';
                q.skillLabel = 'Perim Grid';
            } else if (geoSkill === "perimeter") {
                // Perimeter — labeled shape only (no equation give-away).
                // Hint / wrong answer triggers .show-perim-hint on the card,
                // which makes the outlined .perim-hint-outline rect pulse so
                // the student SEES that perimeter = the distance around.
                const shapeType = pick(["rectangle", "square"]);
                if (shapeType === "rectangle") {
                    const length = rng(3, maxDim);
                    const width = rng(2, Math.min(length - 1, maxDim - 1));
                    const perimeter = 2 * (length + width);
                    q.ans = perimeter;
                    q.text = `Find the perimeter of a rectangle: length = ${length}, width = ${width}`;
                    q.hint = `Perimeter is the distance around the OUTSIDE. Add all 4 side lengths, or multiply 2 × (length + width).`;

                    q.visual = `<div style="text-align:center;">
                        ${STUDENT_DEF_PERIMETER}
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter</div>
                        <svg width="200" height="140" viewBox="0 0 200 140">
                            <rect class="perim-hint-outline" x="30" y="20" width="140" height="90" fill="none" stroke="var(--accent-cyan)" stroke-width="3"/>
                            <text x="100" y="12" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${length}</text>
                            <text x="100" y="125" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${length}</text>
                            <text x="15" y="70" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${width}</text>
                            <text x="185" y="70" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${width}</text>
                        </svg>
                    </div>`;
                    q.geometryData = { shape: 'rectangle', length, width, perimeter };
                } else {
                    const side = rng(3, maxDim);
                    const perimeter = 4 * side;
                    q.ans = perimeter;
                    q.text = `Find the perimeter of a square with side = ${side}`;
                    q.hint = `Perimeter is the distance around the OUTSIDE. A square has 4 equal sides — add them all, or multiply 4 × side.`;

                    q.visual = `<div style="text-align:center;">
                        ${STUDENT_DEF_PERIMETER}
                        <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter</div>
                        <svg width="160" height="160" viewBox="0 0 160 160">
                            <rect class="perim-hint-outline" x="30" y="30" width="100" height="100" fill="none" stroke="var(--accent-cyan)" stroke-width="3"/>
                            <text x="80" y="22" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${side}</text>
                            <text x="15" y="85" text-anchor="middle" fill="currentColor" font-size="14" font-weight="bold">${side}</text>
                        </svg>
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
                    ${STUDENT_DEF_AREA}
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

                // Replaced `transform:scale(2)` wrapper with a width-clamped responsive
                // container. The previous transform doubled an already-up-to-360px SVG
                // to 720px, which overflowed map cards and worksheet cells. We now
                // rewrite the inline width/height attributes on the returned SVG so it
                // fluidly fills a max-360px parent while the viewBox preserves aspect.
                const _volSvg = create3DBoxSVG(length, width, height, false)
                    .replace(/\swidth="[^"]*"/, '')
                    .replace(/\sheight="[^"]*"/, '')
                    .replace(/style="([^"]*)"/, 'style="$1;display:block;width:100%;height:auto;"');
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.15rem;">Volume</div>
                    <div style="display:inline-block;width:min(360px,90%);margin:16px auto;line-height:0;">${_volSvg}</div>
                    <div style="font-size:1.15rem;margin-top:10px;">V = l × w × h = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> cubic units</div>
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
                function _angleSvg(deg, rotateDeg) {
                    const r = 36;
                    const cx = 50, cy = 60;
                    const rad = (180 - deg) * Math.PI / 180;
                    const x2 = cx + r * Math.cos(rad);
                    const y2 = cy - r * Math.sin(rad);
                    // Subtle interior wedge (30% green) makes the angle's
                    // INSIDE obvious regardless of rotation, so students don't
                    // misread an upside-down acute angle as obtuse and vice
                    // versa. The wedge spans from the horizontal ray (0°)
                    // counter-clockwise to the second ray.
                    const wedgeR = r - 4;
                    const wedgeEndX = cx + wedgeR * Math.cos(rad);
                    const wedgeEndY = cy - wedgeR * Math.sin(rad);
                    const wedgeLargeArc = deg > 180 ? 1 : 0;
                    const interiorWedge = `<path d="M ${cx} ${cy} L ${(cx + wedgeR).toFixed(1)} ${cy} A ${wedgeR} ${wedgeR} 0 ${wedgeLargeArc} 0 ${wedgeEndX.toFixed(1)} ${wedgeEndY.toFixed(1)} Z" fill="${COLORS.fill[1] || '#43a047'}" fill-opacity="0.22" stroke="none"/>`;
                    // IXL convention: rays + arc share the angle color; right-angle marker is red.
                    let arc = '';
                    if (deg === 90) {
                        arc = `<rect x="${cx}" y="${cy - 8}" width="8" height="8" fill="none" stroke="${COLORS.wrong}" stroke-width="${STROKE.normal}"/>`;
                    } else {
                        const arcEndX = cx + 14 * Math.cos(rad);
                        const arcEndY = cy - 14 * Math.sin(rad);
                        const largeArc = deg > 180 ? 1 : 0;
                        arc = `<path d="M ${cx + 14} ${cy} A 14 14 0 ${largeArc} 0 ${arcEndX.toFixed(1)} ${arcEndY.toFixed(1)}" fill="none" stroke="${COLORS.primary}" stroke-width="${STROKE.normal}"/>`;
                    }
                    const rot = rotateDeg || 0;
                    return `<svg viewBox="0 0 100 80" width="90" height="72">
                        <g transform="rotate(${rot} ${cx} ${cy})">
                            ${interiorWedge}
                            <line x1="${cx}" y1="${cy}" x2="${(cx + r).toFixed(1)}" y2="${cy}" stroke="${COLORS.primary}" stroke-width="${STROKE.bold}" stroke-linecap="round"/>
                            <line x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${COLORS.primary}" stroke-width="${STROKE.bold}" stroke-linecap="round"/>
                            <circle cx="${cx}" cy="${cy}" r="2" fill="${COLORS.primary}"/>
                            ${arc}
                        </g>
                    </svg>`;
                }
                const cCount = randInt(2, 3);
                const wCount = randInt(2, 3);
                const wrongTypes = angleTypeChoices.filter(t => t !== target);
                const items = [];
                for (let i = 0; i < cCount; i++) items.push({ type: target, deg: _angleOf(target) });
                for (let i = 0; i < wCount; i++) items.push({ type: pick(wrongTypes), deg: _angleOf(pick(wrongTypes)) });
                const shuffled = shuffle(items);
                // Vary base rotation per item so right angles (and others)
                // appear in different orientations — but cap rotations at 135°
                // to avoid flipping angles fully upside-down (180/270), which
                // confused students into misreading acute as obtuse.
                const _rotPool = shuffle([0, 30, 45, 60, 90, 120, 135]);
                const opts = shuffled.map((it, i) => ({
                    id: 'opt' + i,
                    svg: _angleSvg(it.deg, _rotPool[i % _rotPool.length]),
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
                // Hot-spot: composite polygon, click all angles of the target type.
                //
                // Vertex coords are hand-picked per layout, but the angle TYPE at each
                // vertex MUST be computed from the actual geometry. The previous
                // implementation hard-coded `type` per vertex and those tags didn't
                // match the rendered shape (e.g. layout 1 marked vertex A as 'right'
                // when its true interior angle was ~80°/acute), producing factually
                // wrong answer keys.
                const layouts = [
                    // Trapezoid (no right angles) — acute + obtuse mix
                    [{ id: 'h0', x: 60, y: 50 }, { id: 'h1', x: 240, y: 50 }, { id: 'h2', x: 220, y: 160 }, { id: 'h3', x: 80, y: 160 }],
                    // Skewed quad — acute + obtuse mix
                    [{ id: 'h0', x: 50, y: 50 }, { id: 'h1', x: 250, y: 60 }, { id: 'h2', x: 240, y: 170 }, { id: 'h3', x: 60, y: 160 }],
                    // Irregular quad — acute + obtuse mix
                    [{ id: 'h0', x: 70, y: 40 }, { id: 'h1', x: 230, y: 60 }, { id: 'h2', x: 250, y: 165 }, { id: 'h3', x: 50, y: 150 }],
                    // Right-trapezoid — TWO obvious right angles on the right side
                    [{ id: 'h0', x: 50, y: 60 }, { id: 'h1', x: 250, y: 60 }, { id: 'h2', x: 250, y: 160 }, { id: 'h3', x: 80, y: 160 }],
                    // Right-trapezoid mirror — TWO obvious right angles on the left side
                    [{ id: 'h0', x: 60, y: 60 }, { id: 'h1', x: 240, y: 60 }, { id: 'h2', x: 200, y: 160 }, { id: 'h3', x: 60, y: 160 }],
                    // Rectangle — FOUR right angles
                    [{ id: 'h0', x: 60, y: 60 }, { id: 'h1', x: 240, y: 60 }, { id: 'h2', x: 240, y: 160 }, { id: 'h3', x: 60, y: 160 }],
                    // L-pentagon variant kept as quad: right + right + right + obtuse
                    [{ id: 'h0', x: 60, y: 50 }, { id: 'h1', x: 250, y: 50 }, { id: 'h2', x: 250, y: 170 }, { id: 'h3', x: 60, y: 130 }]
                ];
                let angles = pick(layouts).map(p => ({ ...p }));
                // Compute the true interior angle type at each vertex from coords.
                // STRICT 1° tolerance — wider tolerances let visually-slanted
                // corners (e.g. 87°, 93°) read as 'right' when they clearly
                // aren't, leading to "click the right angles" questions where
                // no corner LOOKS square.
                const _interiorDeg = (idx) => {
                    const n = angles.length;
                    const prev = angles[(idx - 1 + n) % n];
                    const curr = angles[idx];
                    const next = angles[(idx + 1) % n];
                    const v1x = prev.x - curr.x, v1y = prev.y - curr.y;
                    const v2x = next.x - curr.x, v2y = next.y - curr.y;
                    const m1 = Math.hypot(v1x, v1y), m2 = Math.hypot(v2x, v2y);
                    if (m1 === 0 || m2 === 0) return 90;
                    const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / (m1 * m2)));
                    return Math.acos(cos) * 180 / Math.PI;
                };
                angles.forEach((a, i) => {
                    const deg = _interiorDeg(i);
                    a.deg = deg;
                    a.type = Math.abs(deg - 90) <= 1 ? 'right' : (deg < 90 ? 'acute' : 'obtuse');
                });
                // Pick a target that actually appears in this layout (otherwise the
                // question is unsolvable). Falls back to whatever types ARE present.
                const presentTypes = [...new Set(angles.map(a => a.type))];
                const target = pick(presentTypes);
                const points = angles.map(a => `${a.x},${a.y}`).join(' ');
                const labelLetters = 'ABCD';
                const _ps = shapeStyle(0);
                const labels = angles.map((a, i) => {
                    const lx = a.x + (a.x < 150 ? -12 : 12);
                    const ly = a.y + (a.y < 100 ? -8 : 18);
                    return `<text x="${lx}" y="${ly}" font-family="${FONTS.sans}" font-size="16" font-weight="700" fill="${COLORS.text}" text-anchor="middle" dominant-baseline="middle">${labelLetters[i]}</text>`;
                }).join('');
                // Explicit width/height: without them, the inline-block wrapper
                // (.hs-bg-wrap) can collapse an unsized SVG to zero width — the
                // polygon then renders invisibly and the student sees nothing.
                const bgSvg = `<svg viewBox="0 0 300 200" width="400" height="267" xmlns="http://www.w3.org/2000/svg"><polygon points="${points}" fill="${_ps.fill}" stroke="${_ps.stroke}" stroke-width="${_ps.strokeWidth}"/>${labels}</svg>`;
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
                // Estimate/identify angles by reference. Students can't
                // physically measure an on-screen angle, so this MUST be a
                // multiple-choice problem — they pick the closest reference
                // angle. Options use the "°" suffix string so the post-strip
                // in generate-question.js doesn't collapse the numeric MC back
                // to a typed-input fallback. Pool covers common reference
                // angles (multiples of 30° and 45°). Each render gets a
                // random base rotation so orientations vary on screen.
                const angles = [30, 45, 60, 90, 120, 135, 150, 180];
                const angle = pick(angles);
                const rotation = pick([0, 45, 90, 135, 180, 225, 270, 315]);

                q.text = `What is the measure of this angle in degrees?`;
                q.ans = `${angle}°`;
                q.answerType = "choice";
                // Show 4 options including the correct one — pick 3 distractors from the pool.
                const distractors = angles.filter(a => a !== angle);
                for (let i = distractors.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
                }
                const optAngles = [angle, ...distractors.slice(0, 3)].sort((a, b) => a - b);
                q.options = optAngles.map(a => `${a}°`);
                q.hint = `Compare to known angles: 90° is a right angle (square corner), 45° is half of a right angle, 180° is a straight line. Multiples of 30° also help (60°, 120°, 150°).`;

                // Replaced `transform: scale(2) rotate(...)` (which produced a 320px
                // scaled bounding box that overflowed narrow map/worksheet cards and
                // forced 90px+ blank margins) with a responsive wrapper. Keep the
                // rotation as an inline style on the SVG itself (so multiple
                // measure-angle visuals on one page each use their own rotation),
                // drop the 2x scale, and use a larger native SVG (260px) clamped to
                // the parent width.
                const _angSvg = createAngleSVG(angle, 260, false, false)
                    .replace(/\swidth="[^"]*"/, '')
                    .replace(/\sheight="[^"]*"/, '')
                    .replace(/style="([^"]*)"/, `style="$1;display:block;width:100%;height:auto;transform:rotate(${rotation}deg);transform-origin:center;"`);
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.2rem;">Measure This Angle</div>
                    <div style="display:inline-block;width:min(280px,90%);margin:24px auto;line-height:0;">${_angSvg}</div>
                    <div style="margin-top:10px;font-size:1rem;color:var(--text-dim);">
                        Pick the closest match: ${optAngles.map(a => `${a}°`).join(' &middot; ')}
                    </div>
                </div>`;
                q.geometryData = { angle, rotation };
                q.printFormat = "geometry-measure-angle";
            } else if (geoSkill === "identify_lines" && Math.random() < 0.30) {
                // Multi-select: "Click ALL pairs of parallel lines."
                const targetType = pick(['parallel', 'perpendicular', 'intersecting']);
                function _linePairSvg(type, variant) {
                    const cx = 50, cy = 40;
                    const len = 36;
                    const _ln = `stroke="${COLORS.primary}" stroke-width="${STROKE.bold}" stroke-linecap="round"`;
                    if (type === 'parallel') {
                        // Variant: horizontal or diagonal
                        if (variant === 0) {
                            return `<svg viewBox="0 0 100 80" width="90" height="72">
                                <line x1="${cx - len/2}" y1="${cy - 10}" x2="${cx + len/2}" y2="${cy - 10}" ${_ln}/>
                                <line x1="${cx - len/2}" y1="${cy + 10}" x2="${cx + len/2}" y2="${cy + 10}" ${_ln}/>
                            </svg>`;
                        }
                        return `<svg viewBox="0 0 100 80" width="90" height="72">
                            <line x1="${cx - 18}" y1="${cy - 18}" x2="${cx + 18}" y2="${cy + 14}" ${_ln}/>
                            <line x1="${cx - 4}" y1="${cy - 22}" x2="${cx + 32}" y2="${cy + 10}" ${_ln}/>
                        </svg>`;
                    }
                    if (type === 'perpendicular') {
                        return `<svg viewBox="0 0 100 80" width="90" height="72">
                            <line x1="${cx - len/2}" y1="${cy}" x2="${cx + len/2}" y2="${cy}" ${_ln}/>
                            <line x1="${cx}" y1="${cy - len/2}" x2="${cx}" y2="${cy + len/2}" ${_ln}/>
                            <rect x="${cx}" y="${cy - 7}" width="7" height="7" fill="none" stroke="${COLORS.wrong}" stroke-width="${STROKE.normal}"/>
                        </svg>`;
                    }
                    // intersecting (non-perp)
                    return `<svg viewBox="0 0 100 80" width="90" height="72">
                        <line x1="${cx - 22}" y1="${cy - 14}" x2="${cx + 22}" y2="${cy + 14}" ${_ln}/>
                        <line x1="${cx - 18}" y1="${cy + 18}" x2="${cx + 22}" y2="${cy - 18}" ${_ln}/>
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
                // Hot-spot: a multi-line figure, click the parallel/perpendicular pair.
                // Picks one of several layouts so orientations (horizontal,
                // vertical, diagonal pairs) vary across renders.
                const target = pick(['parallel', 'perpendicular']);
                const layouts = [
                    // L0: horizontal pair + vertical + diagonal
                    [
                        { id: 'h0', x1: 30,  y1: 50,  x2: 290, y2: 50,  label: 'a', isHoriz: true },
                        { id: 'h1', x1: 30,  y1: 110, x2: 290, y2: 110, label: 'b', isHoriz: true },
                        { id: 'h2', x1: 60,  y1: 30,  x2: 60,  y2: 200, label: 'c', isVert: true },
                        { id: 'h3', x1: 220, y1: 30,  x2: 290, y2: 200, label: 'd' },
                    ],
                    // L1: vertical pair + horizontal + diagonal
                    [
                        { id: 'h0', x1: 80,  y1: 30,  x2: 80,  y2: 200, label: 'a', isVert: true },
                        { id: 'h1', x1: 200, y1: 30,  x2: 200, y2: 200, label: 'b', isVert: true },
                        { id: 'h2', x1: 30,  y1: 60,  x2: 290, y2: 60,  label: 'c', isHoriz: true },
                        { id: 'h3', x1: 30,  y1: 200, x2: 200, y2: 30,  label: 'd' },
                    ],
                    // L2: diagonal pair + vertical + horizontal
                    [
                        { id: 'h0', x1: 30,  y1: 200, x2: 160, y2: 30,  label: 'a' },
                        { id: 'h1', x1: 130, y1: 200, x2: 260, y2: 30,  label: 'b' },
                        { id: 'h2', x1: 30,  y1: 80,  x2: 290, y2: 80,  label: 'c', isHoriz: true },
                        { id: 'h3', x1: 290, y1: 30,  x2: 30,  y2: 200, label: 'd' },
                    ],
                    // L3: cross of two perpendicular pairs + 2 distractors
                    [
                        { id: 'h0', x1: 30,  y1: 110, x2: 290, y2: 110, label: 'a', isHoriz: true },
                        { id: 'h1', x1: 160, y1: 30,  x2: 160, y2: 200, label: 'b', isVert: true },
                        { id: 'h2', x1: 60,  y1: 200, x2: 230, y2: 30,  label: 'c' },
                        { id: 'h3', x1: 50,  y1: 50,  x2: 280, y2: 180, label: 'd' },
                    ],
                ];
                const lines = pick(layouts);
                let pairAns;
                if (target === 'parallel') {
                    // Find the two lines with matching orientation flag
                    const horiz = lines.filter(l => l.isHoriz);
                    const vert = lines.filter(l => l.isVert);
                    const par = horiz.length === 2 ? horiz : vert.length === 2 ? vert : [lines[0], lines[1]];
                    pairAns = [par[0].id, par[1].id];
                } else {
                    // Pick one horizontal + one vertical (perpendicular pair)
                    const horiz = lines.find(l => l.isHoriz);
                    const vert = lines.find(l => l.isVert);
                    if (horiz && vert) pairAns = [horiz.id, vert.id];
                    else pairAns = [lines[0].id, lines[1].id];
                }
                const linesSvg = lines.map(L => `<line x1="${L.x1}" y1="${L.y1}" x2="${L.x2}" y2="${L.y2}" stroke="${COLORS.primary}" stroke-width="${STROKE.bold}" stroke-linecap="round"/>
                    <text x="${(L.x1 + L.x2) / 2 + 6}" y="${(L.y1 + L.y2) / 2 - 6}" font-family="${FONTS.sans}" font-size="16" font-weight="700" fill="${COLORS.text}">${L.label}</text>`).join('');
                // CRITICAL: include explicit width/height so the SVG renders at a real
                // size — without them the hot-spot host collapses and no lines show.
                const bgSvg = `<svg width="320" height="220" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">${linesSvg}</svg>`;
                // Hot-spots: ORIENTED polygons hugging each line (not AABB rects).
                // The previous AABB approach made diagonal lines have huge bounding
                // boxes that overlapped neighbors — clicking near the center hit
                // multiple regions and selected the "wrong" or all of them.
                // Polygon = thin rectangle aligned to the line's actual direction.
                const HALF_THICK = 12; // half-width of click target perpendicular to the line
                const hotSpots = lines.map(L => {
                    const dx = L.x2 - L.x1;
                    const dy = L.y2 - L.y1;
                    const len = Math.hypot(dx, dy) || 1;
                    // Unit perpendicular (rotated 90° CCW)
                    const px = -dy / len * HALF_THICK;
                    const py = dx / len * HALF_THICK;
                    const points = [
                        `${(L.x1 + px).toFixed(1)},${(L.y1 + py).toFixed(1)}`,
                        `${(L.x2 + px).toFixed(1)},${(L.y2 + py).toFixed(1)}`,
                        `${(L.x2 - px).toFixed(1)},${(L.y2 - py).toFixed(1)}`,
                        `${(L.x1 - px).toFixed(1)},${(L.y1 - py).toFixed(1)}`,
                    ].join(' ');
                    return { id: L.id, shape: 'polygon', points, label: `Line ${L.label}` };
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
                    <svg width="${svgWidth * 2}" height="${svgHeight * 2}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;">${linesSvg}</svg>
                </div>`;
                q.geometryData = { lineType, lineStyle, orientation };
                q.printFormat = "geometry-lines";
            } else if (geoSkill === "place_symmetry_lines") {
                // Draw the lines of symmetry. Student clicks faint candidate
                // lines drawn through the shape's center; selecting the right
                // SET (any order) wins.
                //
                // Coordinate system (all shapes): viewBox 0 0 240 200,
                // center at (120, 100). Candidate lines extend ±110 from
                // center. Angles are measured from horizontal (0 = right,
                // 90 = vertical). The CANDIDATE POOL is the same 8 angles
                // for every shape so the student can't infer N from the
                // number of candidates: [0, 30, 45, 60, 90, 120, 135, 150].
                const _sm = shapeStyle(0);
                const _ss = `fill="${softFill(_sm.fill)}" stroke="${_sm.stroke}" stroke-width="${STROKE.bold}"`;
                const symPool = [
                    // 1 line of symmetry
                    {
                        name: 'isosceles triangle',
                        body: `<polygon points="120,40 180,160 60,160" ${_ss}/>`,
                        ans: [90]
                    },
                    {
                        name: 'isosceles trapezoid',
                        body: `<polygon points="80,50 160,50 200,150 40,150" ${_ss}/>`,
                        ans: [90]
                    },
                    {
                        name: 'kite',
                        body: `<polygon points="120,30 180,100 120,170 60,100" ${_ss}/>`,
                        ans: [90]
                    },
                    {
                        name: 'letter A',
                        body: `<polygon points="120,30 165,170 145,170 135,140 105,140 95,170 75,170" ${_ss}/>` +
                              `<rect x="108" y="115" width="24" height="10" fill="${_sm.stroke}"/>`,
                        ans: [90]
                    },
                    {
                        name: 'letter T',
                        body: `<polygon points="60,40 180,40 180,65 135,65 135,170 105,170 105,65 60,65" ${_ss}/>`,
                        ans: [90]
                    },
                    {
                        name: 'letter M',
                        body: `<polygon points="50,170 50,40 80,40 120,110 160,40 190,40 190,170 165,170 165,80 130,140 110,140 75,80 75,170" ${_ss}/>`,
                        ans: [90]
                    },
                    // 2 lines of symmetry
                    {
                        name: 'rectangle',
                        body: `<rect x="40" y="60" width="160" height="80" ${_ss}/>`,
                        ans: [0, 90]
                    },
                    {
                        name: 'rhombus',
                        // Diagonals are horizontal (0°) and vertical (90°), so the
                        // symmetry axes ARE the diagonals — at 0° and 90°.
                        body: `<polygon points="120,40 195,100 120,160 45,100" ${_ss}/>`,
                        ans: [0, 90]
                    },
                    {
                        name: 'letter H',
                        // Crossbar straddles y=100 evenly (y=88..112) so the H is
                        // perfectly symmetric about BOTH the vertical (90°) and
                        // horizontal (0°) axes through the candidate-line center.
                        body: `<polygon points="60,40 90,40 90,88 150,88 150,40 180,40 180,160 150,160 150,112 90,112 90,160 60,160" ${_ss}/>`,
                        ans: [0, 90]
                    },
                    {
                        name: 'oval (ellipse)',
                        body: `<ellipse cx="120" cy="100" rx="80" ry="50" ${_ss}/>`,
                        ans: [0, 90]
                    },
                    // 3 lines of symmetry
                    {
                        name: 'equilateral triangle',
                        // Vertices chosen so the CENTROID sits exactly on the
                        // candidate-line center (120, 100). Circumradius R=70:
                        //   apex   (top, math 90°): (120, 30)
                        //   right  (math -30°):     (120 + 70·cos30°, 100 + 70·sin30°) = (180.62, 135)
                        //   left   (math 210°):     (120 - 70·cos30°, 100 + 70·sin30°) = ( 59.38, 135)
                        // Centroid = ((120+180.62+59.38)/3, (30+135+135)/3) = (120, 100). ✓
                        // Symmetry axes pass through each vertex AND the centroid:
                        //   vertical (apex → bottom-edge midpoint)         → 90°
                        //   bottom-left vertex → right-edge midpoint       → 30°
                        //   bottom-right vertex → left-edge midpoint       → 150°
                        body: `<polygon points="120,30 180.62,135 59.38,135" ${_ss}/>`,
                        ans: [30, 90, 150]
                    },
                    // 4 lines of symmetry
                    {
                        name: 'square',
                        body: `<rect x="60" y="40" width="120" height="120" ${_ss}/>`,
                        ans: [0, 45, 90, 135]
                    }
                ];
                const fig = pick(symPool);
                const N = fig.ans.length;
                // Explicit width/height so widget hosts that don't constrain dimensions
                // still render the shape at a real size (avoids 0×0 collapse).
                const shapeSvg = `<svg width="240" height="200" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">${fig.body}</svg>`;
                const candidateAngles = [0, 30, 45, 60, 90, 120, 135, 150];

                q.text = `Draw the lines of symmetry on this ${fig.name}. (This shape has ${N}.)`;
                q.answerType = 'place-symmetry-lines';
                q.shapeSvg = shapeSvg;
                q.candidateAngles = candidateAngles;
                q.center = { cx: 120, cy: 100 };
                q.lineLength = 110;
                q.symLines = N;
                q.ans = fig.ans.slice();
                q.shapeName = fig.name;
                q.hint = `A line of symmetry divides the shape into two mirror-image halves that fold exactly on top of each other.`;
                q.printFormat = 'place-symmetry-lines';
                q.skillLabel = 'Draw Symmetry';
                q.geometryData = { shape: fig.name, lines: N, angles: fig.ans.slice() };
                return;
            } else if (geoSkill === "symmetry" && Math.random() < 0.30) {
                // Multi-select: "Click ALL shapes that have a line of symmetry."
                // IXL convention: every shape uses the same primary blue so the
                // student classifies by SHAPE not by COLOR.
                const _sm = shapeStyle(0);
                const _ss = `fill="${_sm.fill}" stroke="${_sm.stroke}" stroke-width="${STROKE.normal}"`;
                const _sl = `fill="none" stroke="${_sm.stroke}" stroke-width="6" stroke-linecap="round"`;
                const symPool = [
                    { name: 'heart', sym: true,
                      svg: `<path d="M 50 78 C 18 50, 12 22, 32 18 C 42 16, 50 26, 50 36 C 50 26, 58 16, 68 18 C 88 22, 82 50, 50 78 Z" ${_ss}/>` },
                    { name: 'butterfly', sym: true,
                      svg: `<ellipse cx="32" cy="50" rx="20" ry="28" ${_ss}/><ellipse cx="68" cy="50" rx="20" ry="28" ${_ss}/><line x1="50" y1="20" x2="50" y2="82" stroke="${_sm.stroke}" stroke-width="${STROKE.bold}"/>` },
                    { name: 'square', sym: true,
                      svg: `<rect x="22" y="22" width="56" height="56" ${_ss}/>` },
                    { name: 'isosceles triangle', sym: true,
                      svg: `<polygon points="50,18 84,80 16,80" ${_ss}/>` },
                    { name: 'circle', sym: true,
                      svg: `<circle cx="50" cy="50" r="32" ${_ss}/>` },
                    { name: 'letter F', sym: false,
                      svg: `<path d="M 30 18 L 30 82 M 30 18 L 70 18 M 30 48 L 60 48" ${_sl}/>` },
                    { name: 'letter R', sym: false,
                      svg: `<path d="M 32 82 L 32 20 L 60 20 Q 70 20 70 35 Q 70 50 60 50 L 32 50 M 50 50 L 70 82" ${_sl}/>` },
                    { name: 'scalene triangle', sym: false,
                      svg: `<polygon points="20,80 78,68 60,22" ${_ss}/>` },
                    { name: 'parallelogram', sym: false,
                      svg: `<polygon points="22,72 70,72 80,28 32,28" ${_ss}/>` }
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
                        bg: `<rect x="60" y="40" width="120" height="120" fill="${softFill(COLORS.fill[0])}" stroke="${COLORS.fill[0]}" stroke-width="${STROKE.bold}"/>` +
                            `<line x1="60" y1="100" x2="180" y2="100" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="120" y1="40" x2="120" y2="160" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="60" y1="40" x2="180" y2="160" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="180" y1="40" x2="60" y2="160" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            // distractors
                            `<line x1="60" y1="70" x2="180" y2="70" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="90" y1="40" x2="90" y2="160" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>`,
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
                        bg: `<polygon points="120,40 180,160 60,160" fill="${softFill(COLORS.fill[0])}" stroke="${COLORS.fill[0]}" stroke-width="${STROKE.bold}"/>` +
                            `<line x1="120" y1="40" x2="120" y2="160" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="60" y1="100" x2="180" y2="100" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="60" y1="160" x2="180" y2="40" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>`,
                        spots: [
                            { id: 'h0', shape: 'rect', x: 115, y: 35, w: 10, h: 130, label: 'vertical' },
                            { id: 'h1', shape: 'rect', x: 55, y: 95, w: 130, h: 10, label: 'horizontal' },
                            { id: 'h2', shape: 'polygon', points: '55,160 65,160 185,40 175,40', label: 'diagonal' }
                        ],
                        ans: ['h0']
                    },
                    {
                        name: 'rectangle',
                        bg: `<rect x="40" y="60" width="160" height="80" fill="${softFill(COLORS.fill[0])}" stroke="${COLORS.fill[0]}" stroke-width="${STROKE.bold}"/>` +
                            `<line x1="40" y1="100" x2="200" y2="100" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="120" y1="60" x2="120" y2="140" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="40" y1="60" x2="200" y2="140" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>` +
                            `<line x1="200" y1="60" x2="40" y2="140" stroke-dasharray="6,3" stroke="#e53935" stroke-width="2"/>`,
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
                // CRITICAL: include explicit width/height so the SVG renders at a real
                // size — without them the hot-spot host collapses and no shape shows.
                const bgSvg = `<svg width="240" height="200" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">${fig.bg}</svg>`;
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
            } else if (geoSkill === "geo_reflect" || geoSkill === "geo_rotate" || geoSkill === "geo_translate") {
                // ===== GEOMETRIC TRANSFORMATIONS (G5) — MC with 4 small grids =====
                // Pick a random small polygon (3-5 vertices), apply the correct
                // transformation + 3 distractor transformations, present as a
                // multi-select-check with minCorrect:1 (one-correct enforced).
                const _gtRandShape = () => {
                    // 4 hand-tuned shapes that look distinct under rotation/reflection.
                    const shapes = [
                        // Right triangle (asymmetric)
                        [[1, 1], [4, 1], [1, 3]],
                        // L-shape pentagon
                        [[1, 1], [3, 1], [3, 2], [2, 2], [2, 4], [1, 4]],
                        // Scalene triangle
                        [[1, 1], [4, 2], [2, 4]],
                        // Trapezoid
                        [[1, 1], [4, 1], [3, 3], [2, 3]],
                    ];
                    return shapes[randInt(0, shapes.length - 1)].map(p => [p[0], p[1]]);
                };
                // Translate every vertex of the source so it fits comfortably
                // in [-5, 5] on both axes (so distractor results stay on grid).
                const _gtNormalize = (pts, ox, oy) => pts.map(([x, y]) => [x + ox, y + oy]);
                const _gtReflectY = pts => pts.map(([x, y]) => [-x, y]);
                const _gtReflectX = pts => pts.map(([x, y]) => [x, -y]);
                const _gtRotate = (pts, deg) => {
                    // Clockwise positive deg; rotate around origin.
                    const r = (-deg) * Math.PI / 180;
                    const c = Math.cos(r), s = Math.sin(r);
                    return pts.map(([x, y]) => {
                        const nx = x * c - y * s;
                        const ny = x * s + y * c;
                        return [Math.round(nx), Math.round(ny)];
                    });
                };
                const _gtTranslate = (pts, dx, dy) => pts.map(([x, y]) => [x + dx, y + dy]);
                const _gtKey = pts => {
                    // Order-independent polygon key for distractor de-dup.
                    return [...pts].map(p => `${p[0]},${p[1]}`).sort().join('|');
                };
                // Build an SVG of the polygon on a coordinate grid spanning [-6, 6].
                const _gtGridSvg = (pts, color, label) => {
                    const min = -6, max = 6, span = max - min;
                    const size = 180;
                    const pad = 12;
                    const inner = size - 2 * pad;
                    const tx = (x) => pad + ((x - min) / span) * inner;
                    const ty = (y) => pad + ((max - y) / span) * inner;
                    let grid = '';
                    for (let i = min; i <= max; i++) {
                        const isAxis = (i === 0);
                        const stroke = isAxis ? '#333' : '#cfd8dc';
                        const sw = isAxis ? 1.5 : 0.6;
                        grid += `<line x1="${tx(i)}" y1="${pad}" x2="${tx(i)}" y2="${size - pad}" stroke="${stroke}" stroke-width="${sw}"/>`;
                        grid += `<line x1="${pad}" y1="${ty(i)}" x2="${size - pad}" y2="${ty(i)}" stroke="${stroke}" stroke-width="${sw}"/>`;
                    }
                    const polyPts = pts.map(([x, y]) => `${tx(x).toFixed(1)},${ty(y).toFixed(1)}`).join(' ');
                    const fill = color + '33';
                    const lab = label ? `<text x="${pad + 4}" y="${size - pad - 4}" font-family="Arial" font-size="10" fill="#666">${label}</text>` : '';
                    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                        ${grid}
                        <polygon points="${polyPts}" fill="${fill}" stroke="${color}" stroke-width="2"/>
                        ${lab}
                    </svg>`;
                };

                // Pick a source shape and place it so transforms stay in-grid.
                const baseShape = _gtRandShape();
                // Shift source into Q1 lightly off-center so reflections/rotations move visibly.
                const sourcePts = _gtNormalize(baseShape, 1, 1);
                const srcColor = '#1e88e5';
                const ansColor = '#43a047';
                let promptText, hintText, correctPts, distractorSet;

                if (geoSkill === "geo_reflect") {
                    // Pick reflection axis. y-axis flips x sign.
                    const axisChoice = pick(['y', 'x']);
                    if (axisChoice === 'y') {
                        correctPts = _gtReflectY(sourcePts);
                        promptText = 'Which figure shows this shape reflected over the y-axis?';
                        hintText = 'Reflecting over the y-axis flips the shape left/right (x becomes -x).';
                    } else {
                        correctPts = _gtReflectX(sourcePts);
                        promptText = 'Which figure shows this shape reflected over the x-axis?';
                        hintText = 'Reflecting over the x-axis flips the shape up/down (y becomes -y).';
                    }
                    // Distractors: other reflections + rotations
                    const candDistractors = [
                        axisChoice === 'y' ? _gtReflectX(sourcePts) : _gtReflectY(sourcePts),
                        _gtRotate(sourcePts, 180),
                        _gtRotate(sourcePts, 90),
                        sourcePts,
                    ];
                    distractorSet = candDistractors;
                } else if (geoSkill === "geo_rotate") {
                    const rotChoice = pick([90, 180, 270]);
                    correctPts = _gtRotate(sourcePts, rotChoice);
                    const rotName = rotChoice === 90 ? '90° clockwise' : (rotChoice === 180 ? '180°' : '270° clockwise');
                    promptText = `Which figure shows this shape rotated ${rotName} around the origin?`;
                    hintText = `Rotate every vertex ${rotName} around (0, 0). Tip: 90° CW takes (x, y) → (y, -x).`;
                    // Distractors: other rotation amounts and a reflection
                    const otherRotations = [90, 180, 270].filter(r => r !== rotChoice);
                    distractorSet = [
                        _gtRotate(sourcePts, otherRotations[0]),
                        _gtRotate(sourcePts, otherRotations[1]),
                        _gtReflectY(sourcePts),
                        _gtReflectX(sourcePts),
                    ];
                } else {
                    // geo_translate
                    const dx = pick([-3, -2, -1, 1, 2, 3]);
                    const dy = pick([-3, -2, -1, 1, 2, 3]);
                    correctPts = _gtTranslate(sourcePts, dx, dy);
                    const dirX = dx > 0 ? `${dx} right` : `${-dx} left`;
                    const dirY = dy > 0 ? `${dy} up` : `${-dy} down`;
                    promptText = `Which figure shows this shape translated ${dirX} and ${dirY}?`;
                    hintText = `Add (${dx}, ${dy}) to every vertex. The shape slides without rotating or flipping.`;
                    // Distractor translations: swap signs / use different magnitudes
                    distractorSet = [
                        _gtTranslate(sourcePts, -dx, dy),
                        _gtTranslate(sourcePts, dx, -dy),
                        _gtTranslate(sourcePts, dy, dx),
                        _gtTranslate(sourcePts, -dx, -dy),
                    ];
                }

                // De-dup distractors against correct + each other.
                const correctKey = _gtKey(correctPts);
                const usedKeys = new Set([correctKey]);
                const distractors = [];
                for (const d of distractorSet) {
                    const k = _gtKey(d);
                    if (usedKeys.has(k)) continue;
                    usedKeys.add(k);
                    distractors.push(d);
                    if (distractors.length === 3) break;
                }
                // Pad if dedup left fewer than 3 distractors (rare with degenerate shapes).
                let _padTries = 0;
                while (distractors.length < 3 && _padTries < 12) {
                    _padTries++;
                    const dx = pick([-3, -2, -1, 1, 2, 3]);
                    const dy = pick([-3, -2, -1, 1, 2, 3]);
                    const cand = _gtTranslate(sourcePts, dx, dy);
                    const k = _gtKey(cand);
                    if (usedKeys.has(k)) continue;
                    usedKeys.add(k);
                    distractors.push(cand);
                }

                // Build options array: 1 correct + 3 distractors, shuffled.
                const allOpts = [
                    { pts: correctPts, correct: true },
                    ...distractors.slice(0, 3).map(p => ({ pts: p, correct: false })),
                ];
                const shuffledOpts = shuffle(allOpts);
                const opts = shuffledOpts.map((o, i) => ({
                    id: 'opt' + i,
                    svg: _gtGridSvg(o.pts, o.correct ? ansColor : srcColor, ''),
                    label: '',
                    correct: o.correct,
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);

                // Source figure shown above the choices.
                const srcSvg = _gtGridSvg(sourcePts, srcColor, 'original');
                q.text = promptText;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Original Shape</div>
                    ${srcSvg}
                </div>`;
                q.ans = ans;
                q.options = opts;
                q.minCorrect = 1;
                q.answerType = 'multi-select-check';
                q.hint = hintText;
                q.printFormat = 'geo-transform-mc';
                q.skillLabel = geoSkill === 'geo_reflect' ? 'Reflect'
                    : geoSkill === 'geo_rotate' ? 'Rotate' : 'Translate';
                q.geometryData = {
                    sourcePts, correctPts,
                    transform: geoSkill,
                };
                return;
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
                // LRU-rotated identify-vs-plot rotation per coordinate skill.
                const problemType = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant(geoSkill || 'coordinate', ["identify", "plot"])
                    : pick(["identify", "plot"]);
                q._variant = problemType;
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
                // IDENTIFY mode: dots are pre-rendered on the grid; student
                // reads the coordinates and TYPES them back → coord-input
                // (separate x/y boxes).
                // PLOT mode: empty grid; student CLICKS to place dots →
                // coord-plot (interactive widget with toggle + color feedback).
                q.ans = points.length === 1
                    ? { x: points[0].x, y: points[0].y }
                    : points.map(p => ({ label: p.label, x: p.x, y: p.y }));
                q.answerType = problemType === "plot" ? "coord-plot" : "coord-input";

                // Grid setup based on quadrant mode - scale spacing to fit maxCoord
                const maxCoord = quadrantMode === "quadrant1" ? maxCoordQ1 : maxCoordAll;
                // Pass maxCoord into coordinateData so the click-to-plot widget
                // can size its own grid (it re-builds the SVG rather than
                // reusing q.visual's static SVG).
                q.coordinateData = { points, quadrantMode, problemType, maxCoord };
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
                        gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#e6e8ec" stroke-width="0.75"/>`;
                        gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#e6e8ec" stroke-width="0.75"/>`;
                        if (i % labelStep === 0) {
                            axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 15}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize}">${i}</text>`;
                            if (i > 0) axisLabels += `<text x="${origin.x - 12}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize}">${i}</text>`;
                        }
                    }
                } else {
                    // All quadrants
                    for (let i = -maxCoord; i <= maxCoord; i++) {
                        gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#e6e8ec" stroke-width="0.75"/>`;
                        gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#e6e8ec" stroke-width="0.75"/>`;
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
                    // Plot mode — coords in text, empty grid, student CLICKS to place dots.
                    const coordList = points.map(p => `${p.label}: (${p.x}, ${p.y})`).join(', ');
                    q.text = numPoints === 1
                        ? `Plot point ${points[0].label} at (${points[0].x}, ${points[0].y})`
                        : `Plot these points: ${coordList}`;
                    q.hint = `Find the x-value on the horizontal axis, then go up/down to the y-value. Click the intersection to place each point. Click an existing dot to remove it.`;
                }

                // PLOT mode bypasses the static-SVG path entirely — the
                // coord-plot widget owns the grid, lattice hit-targets, and
                // submit button. Don't bake the typed-input host into q.visual
                // (it would render alongside the widget and confuse students).
                if (problemType === "plot") {
                    // Leave q.visual EMPTY — the widget host renders inside
                    // visualAid in question-render.js. Keep coordinateData
                    // (set above) and a print-friendly format below.
                    q.visual = "";
                    q.printFormat = "geometry-coordinates";
                } else {
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

                    // Cap rendered SVG height so the 4-quadrant grid + answer
                    // inputs fit within the visualAid frame at 100% browser
                    // zoom on a 1080p display. All-quadrants needs a tighter
                    // cap than quadrant-1 because its native aspect is square
                    // around the origin (so width AND height scale together).
                    const _coordMaxH = quadrantMode === "all_quadrants" ? "44vh" : "50vh";
                    const _coordMaxW = quadrantMode === "all_quadrants" ? "min(420px, 80vw)" : "min(540px, 80vw)";
                    q.visual = `<div style="text-align:center;">
                        <div style="font-weight:700;margin-bottom:6px;color:var(--accent-purple);">Coordinate ${quadrantMode === "quadrant1" ? "(Quadrant I)" : "(All Quadrants)"}</div>
                        <svg width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" style="display:block;margin:0 auto;width:100% !important;max-width:${_coordMaxW} !important;max-height:${_coordMaxH} !important;height:auto !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
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
                }
                q.geometryData = { points, quadrantMode, problemType, mode: problemType };
                // Identify-mode prints the X/Y typed-input boxes; plot-mode
                // prints an empty grid + the target coords in q.text.
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
                    const _s1 = shapeStyle(0); // blue for part 1
                    const _s2 = shapeStyle(2); // orange for part 2
                    svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 320)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:${FONTS.sans};">
                        <rect x="${padX}" y="${padY}" width="${rectW}" height="${rectH1}" fill="${_s1.fill}" stroke="${_s1.stroke}" stroke-width="${STROKE.normal}"/>
                        <rect x="${padX}" y="${padY + rectH1}" width="${rectW}" height="${rectH2}" fill="${_s2.fill}" stroke="${_s2.stroke}" stroke-width="${STROKE.normal}"/>
                        <line x1="${padX}" y1="${padY + rectH1}" x2="${padX + rectW}" y2="${padY + rectH1}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}" stroke-dasharray="6,4"/>
                        <text x="${padX + rectW / 2}" y="${padY - 8}" text-anchor="middle" dominant-baseline="auto" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${COLORS.text}">${w}</text>
                        <text x="${padX - 8}" y="${padY + rectH1 / 2 + 4}" text-anchor="end" dominant-baseline="middle" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${_s1.stroke}">${h1}</text>
                        <text x="${padX - 8}" y="${padY + rectH1 + rectH2 / 2 + 4}" text-anchor="end" dominant-baseline="middle" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${_s2.stroke}">${h2}</text>
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
                    const _s1 = shapeStyle(0);
                    const _s2 = shapeStyle(2);
                    svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 340)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:${FONTS.sans};">
                        <rect x="${padX}" y="${padY}" width="${rectW1}" height="${rectH}" fill="${_s1.fill}" stroke="${_s1.stroke}" stroke-width="${STROKE.normal}"/>
                        <rect x="${padX + rectW1}" y="${padY}" width="${rectW2}" height="${rectH}" fill="${_s2.fill}" stroke="${_s2.stroke}" stroke-width="${STROKE.normal}"/>
                        <line x1="${padX + rectW1}" y1="${padY}" x2="${padX + rectW1}" y2="${padY + rectH}" stroke="${COLORS.axis}" stroke-width="${STROKE.normal}" stroke-dasharray="6,4"/>
                        <text x="${padX - 8}" y="${padY + rectH / 2 + 4}" text-anchor="end" dominant-baseline="middle" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${COLORS.text}">${w}</text>
                        <text x="${padX + rectW1 / 2}" y="${padY + rectH + 18}" text-anchor="middle" dominant-baseline="auto" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${_s1.stroke}">${h1}</text>
                        <text x="${padX + rectW1 + rectW2 / 2}" y="${padY + rectH + 18}" text-anchor="middle" dominant-baseline="auto" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${_s2.stroke}">${h2}</text>
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
                const _ts = shapeStyle(0);
                const svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 320)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:${FONTS.sans};">
                    <polygon points="${x0},${y0} ${xR},${y0} ${x0},${yT}" fill="${_ts.fill}" stroke="${_ts.stroke}" stroke-width="${STROKE.normal}"/>
                    <!-- right-angle marker (red, IXL convention) -->
                    <rect x="${x0}" y="${y0 - 10}" width="10" height="10" fill="none" stroke="${COLORS.wrong}" stroke-width="${STROKE.normal}"/>
                    <!-- base label -->
                    <text x="${x0 + triW / 2}" y="${y0 + 22}" text-anchor="middle" dominant-baseline="auto" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${COLORS.text}">b = ${base}</text>
                    <!-- height label -->
                    <text x="${x0 - 8}" y="${y0 - triH / 2 + 4}" text-anchor="end" dominant-baseline="middle" font-family="${FONTS.sans}" font-size="14" font-weight="600" fill="${COLORS.text}">h = ${height}</text>
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
                        <text x="${(tw / 2) * GRID}" y="-6" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${tw}</text>
                        <text x="${tw * GRID + 6}" y="${(th / 2) * GRID + 4}" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${th}</text>
                        <text x="${((tw + bw) / 2) * GRID}" y="${th * GRID + 14}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#5f6368">${bw - tw}</text>
                        <text x="${bw * GRID + 6}" y="${(th + bh / 2) * GRID + 4}" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${bh}</text>
                        <text x="${(bw / 2) * GRID}" y="${(th + bh) * GRID + 14}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${bw}</text>
                        <text x="-6" y="${((th + bh) / 2) * GRID + 4}" text-anchor="end" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${th + bh}</text>
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
                        <text x="${(tw / 2) * GRID}" y="-6" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${tw}</text>
                        <text x="${tw * GRID + 6}" y="${(th / 2) * GRID + 4}" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${th}</text>
                        <text x="${((off + sw + tw / 2) / 2) * GRID + (off + sw) * GRID / 2}" y="${th * GRID - 4}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="11" fill="#5f6368"></text>
                        <text x="${(off + sw / 2) * GRID}" y="${(th + sh) * GRID + 14}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${sw}</text>
                        <text x="${(off + sw) * GRID + 6}" y="${(th + sh / 2) * GRID + 4}" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${sh}</text>
                        <text x="-6" y="${(th / 2) * GRID + 4}" text-anchor="end" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${th}</text>
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
                        <text x="${(off / 2) * GRID}" y="-6" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${off}</text>
                        <text x="${(off + cw + (w - off - cw) / 2) * GRID}" y="-6" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${w - off - cw}</text>
                        <text x="${(off + cw / 2) * GRID}" y="${ch * GRID + 14}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="11" font-weight="600" fill="#5f6368">${cw}</text>
                        <text x="${off * GRID - 6}" y="${(ch / 2) * GRID + 4}" text-anchor="end" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="11" font-weight="600" fill="#5f6368">${ch}</text>
                        <text x="${w * GRID + 6}" y="${(h / 2) * GRID + 4}" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${h}</text>
                        <text x="${(w / 2) * GRID}" y="${h * GRID + 14}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${w}</text>
                        <text x="-6" y="${(h / 2) * GRID + 4}" text-anchor="end" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${h}</text>
                    `;
                }

                const pad = 26;
                const W = bbW * GRID + pad * 2;
                const H = bbH * GRID + pad * 2;
                const _ds = shapeStyle(0);
                // Light grid lines for decomposition help
                let gridLines = '';
                for (let i = 0; i <= bbW; i++) {
                    gridLines += `<line x1="${i * GRID}" y1="0" x2="${i * GRID}" y2="${bbH * GRID}" stroke="${COLORS.grid}" stroke-width="${STROKE.hair}"/>`;
                }
                for (let j = 0; j <= bbH; j++) {
                    gridLines += `<line x1="0" y1="${j * GRID}" x2="${bbW * GRID}" y2="${j * GRID}" stroke="${COLORS.grid}" stroke-width="${STROKE.hair}"/>`;
                }
                const svg = `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(W, 360)}" style="display:block;margin:0 auto;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-family:${FONTS.sans};">
                    <g transform="translate(${pad},${pad})">
                        ${gridLines}
                        <polygon points="${polygon}" fill="${_ds.fill}" stroke="${_ds.stroke}" stroke-width="${STROKE.normal}"/>
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
                    gridLines += `<line x1="${xPos}" y1="${origin.y}" x2="${xPos}" y2="${origin.y - maxCoord * gridSpacing}" stroke="#e6e8ec" stroke-width="0.75"/>`;
                    gridLines += `<line x1="${origin.x}" y1="${yPos}" x2="${origin.x + maxCoord * gridSpacing}" y2="${yPos}" stroke="#e6e8ec" stroke-width="0.75"/>`;
                    if (i > 0 && i % (maxCoord > 10 ? 2 : 1) === 0) {
                        axisLabels += `<text x="${xPos}" y="${origin.y + 14}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' fill="#5f6368" font-size="11">${i}</text>`;
                        axisLabels += `<text x="${origin.x - 8}" y="${yPos + 4}" text-anchor="end" font-family='"Open Sans", Inter, system-ui, sans-serif' fill="#5f6368" font-size="11">${i}</text>`;
                    }
                }
                const polygonPts = vertices.map(v => `${origin.x + v.x * gridSpacing},${origin.y - v.y * gridSpacing}`).join(' ');
                const _cps = shapeStyle(0);
                const polygonSvg = `<polygon points="${polygonPts}" fill="${_cps.fill}" stroke="${_cps.stroke}" stroke-width="${STROKE.normal}"/>`;
                const vertexMarks = vertices.map(v => {
                    const px = origin.x + v.x * gridSpacing;
                    const py = origin.y - v.y * gridSpacing;
                    return `<circle cx="${px}" cy="${py}" r="5" fill="${COLORS.wrong}"/>` +
                           `<text x="${px + 8}" y="${py - 6}" font-family="${FONTS.sans}" font-size="13" font-weight="700" fill="${COLORS.wrong}">${v.label}(${v.x},${v.y})</text>`;
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
                // LRU rotation so students alternate between identify and SA.
                const askKind = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('net_surface_area', ['identify', 'sa'])
                    : (Math.random() < 0.5 ? 'identify' : 'sa');
                q._variant = askKind;
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
                        `<text x="${xs[1] + sp / 2}" y="${middleY + sp / 2 + 4}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="13" font-weight="600" fill="#212121">${s}</text>` +
                        `<text x="${xs[1] - 6}" y="${middleY + sp / 2 + 4}" text-anchor="end" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="11" font-weight="600" fill="#5f6368">${s}</text>`;
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
                    svg += `<text x="${lpx / 2}" y="${middleY + hpx / 2 + 4}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${l} × ${h}</text>`;
                    svg += `<text x="${lpx / 2}" y="${wpx / 2 + 4}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' font-size="12" font-weight="600" fill="#212121">${l} × ${w}</text>`;
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
            } else if (geoSkill === "cross_section_3d") {
                // ===== CROSS-SECTION OF 3D SHAPE (Grade 6) — Band 221-230 =====
                // Show a 3D shape with a translucent slice plane; ask the
                // student to identify the 2D shape produced by that slice.
                // Pool of (shape, sliceOrientation) → cross-section name.
                // sliceOrientation values:
                //   "horizontal" — plane parallel to base
                //   "vertical_through_axis" — vertical plane through main axis
                //   "vertical_off_axis" — vertical plane not through axis (cone/cylinder)
                const _3D_STROKE = '#1565c0';
                const _3D_FILL_FRONT = '#1e88e5' + '2E';
                const _3D_FILL_TOP = '#1e88e5' + '14';
                const _3D_FILL_RIGHT = '#1e88e5' + '40';
                const SLICE_FILL = 'rgba(229, 57, 53, 0.35)';
                const SLICE_STROKE = '#c62828';

                const csPool = [
                    // Rectangular prism — vertical slice through faces gives a rectangle
                    { shape: 'rectangular_prism', label: 'rectangular prism', orientation: 'vertical_through_axis', cross: 'rectangle',
                      hint: 'A vertical slice through a rectangular prism produces a rectangle whose sides match the height and one base side.' },
                    { shape: 'rectangular_prism', label: 'rectangular prism', orientation: 'horizontal', cross: 'rectangle',
                      hint: 'A horizontal slice through a rectangular prism produces a rectangle the same size as the base.' },
                    // Cylinder
                    { shape: 'cylinder', label: 'cylinder', orientation: 'horizontal', cross: 'circle',
                      hint: 'A horizontal slice across a cylinder gives a circle the same size as the base.' },
                    { shape: 'cylinder', label: 'cylinder', orientation: 'vertical_through_axis', cross: 'rectangle',
                      hint: 'A vertical slice through a cylinder gives a rectangle (height × diameter).' },
                    // Cone
                    { shape: 'cone', label: 'cone', orientation: 'horizontal', cross: 'circle',
                      hint: 'A horizontal slice through a cone gives a circle smaller than the base.' },
                    { shape: 'cone', label: 'cone', orientation: 'vertical_through_axis', cross: 'triangle',
                      hint: 'A vertical slice through the apex of a cone gives a triangle.' },
                    // Square pyramid
                    { shape: 'square_pyramid', label: 'square pyramid', orientation: 'horizontal', cross: 'square',
                      hint: 'A horizontal slice through a square pyramid gives a square smaller than the base.' },
                    { shape: 'square_pyramid', label: 'square pyramid', orientation: 'vertical_through_axis', cross: 'triangle',
                      hint: 'A vertical slice through the apex of a square pyramid gives a triangle.' },
                    // Sphere — always a circle
                    { shape: 'sphere', label: 'sphere', orientation: 'horizontal', cross: 'circle',
                      hint: 'Every flat slice through a sphere produces a circle.' },
                    { shape: 'sphere', label: 'sphere', orientation: 'vertical_through_axis', cross: 'circle',
                      hint: 'Every flat slice through a sphere produces a circle.' },
                ];
                const cs = pick(csPool);

                // Build the 3D shape SVG (240×210 viewBox) with the slice plane
                let shapeSvg = '';
                let sliceSvg = '';
                if (cs.shape === 'rectangular_prism') {
                    shapeSvg += `<polygon points="40,170 170,170 170,60 40,60" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<polygon points="40,60 170,60 210,35 80,35" fill="${_3D_FILL_TOP}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<polygon points="170,60 210,35 210,145 170,170" fill="${_3D_FILL_RIGHT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    if (cs.orientation === 'horizontal') {
                        // Horizontal slice (parallelogram across middle, height ~115)
                        sliceSvg = `<polygon points="40,115 170,115 210,90 80,90" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    } else {
                        // Vertical slice through middle (rectangle in perspective)
                        sliceSvg = `<polygon points="105,170 105,60 145,35 145,145" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    }
                } else if (cs.shape === 'cylinder') {
                    shapeSvg += `<rect x="60" y="60" width="120" height="120" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<ellipse cx="120" cy="60" rx="60" ry="20" fill="${_3D_FILL_TOP}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<ellipse cx="120" cy="180" rx="60" ry="20" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<line x1="60" y1="60" x2="60" y2="180" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<line x1="180" y1="60" x2="180" y2="180" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    if (cs.orientation === 'horizontal') {
                        // Horizontal slice = ellipse in middle
                        sliceSvg = `<ellipse cx="120" cy="120" rx="60" ry="20" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    } else {
                        // Vertical slice through axis = rectangle (height × diameter)
                        sliceSvg = `<rect x="80" y="60" width="80" height="120" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    }
                } else if (cs.shape === 'cone') {
                    shapeSvg += `<polygon points="120,25 55,175 185,175" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<ellipse cx="120" cy="175" rx="65" ry="20" fill="${_3D_FILL_RIGHT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    if (cs.orientation === 'horizontal') {
                        // Horizontal slice partway up = small ellipse
                        sliceSvg = `<ellipse cx="120" cy="115" rx="32" ry="10" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    } else {
                        // Vertical slice through apex = triangle (apex to base)
                        sliceSvg = `<polygon points="120,25 78,175 162,175" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    }
                } else if (cs.shape === 'square_pyramid') {
                    // Pyramid base (square in perspective) + 3 visible edges to apex
                    const ox = 50, oy = 175, sw = 110, dep = 38, ah = 130;
                    const ax = ox + sw / 2 + dep / 2;
                    const ay = oy - ah;
                    shapeSvg += `<polygon points="${ox},${oy} ${ox + sw},${oy} ${ox + sw + dep},${oy - dep} ${ox + dep},${oy - dep}" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<polygon points="${ox},${oy} ${ox + sw},${oy} ${ax},${ay}" fill="${_3D_FILL_RIGHT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<polygon points="${ox + sw},${oy} ${ox + sw + dep},${oy - dep} ${ax},${ay}" fill="${_3D_FILL_TOP}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<line x1="${ox + dep}" y1="${oy - dep}" x2="${ax}" y2="${ay}" stroke="${_3D_STROKE}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
                    if (cs.orientation === 'horizontal') {
                        // Horizontal slice partway up = smaller square (in perspective)
                        const t = 0.45; // fraction up the pyramid
                        const sx = ox + (sw / 2) * t;
                        const sy = oy - (oy - ay) * t;
                        const sw2 = sw * (1 - t);
                        const dep2 = dep * (1 - t);
                        sliceSvg = `<polygon points="${sx},${sy} ${sx + sw2},${sy} ${sx + sw2 + dep2},${sy - dep2} ${sx + dep2},${sy - dep2}" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    } else {
                        // Vertical slice through apex = triangle (apex to midline of base)
                        const blX = ox + sw / 2;
                        const brX = ox + sw / 2 + dep;
                        const brY = oy - dep;
                        sliceSvg = `<polygon points="${ax},${ay} ${blX},${oy} ${brX},${brY}" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    }
                } else if (cs.shape === 'sphere') {
                    shapeSvg += `<circle cx="120" cy="110" r="80" fill="${_3D_FILL_FRONT}" stroke="${_3D_STROKE}" stroke-width="2.5"/>`;
                    shapeSvg += `<ellipse cx="120" cy="110" rx="80" ry="22" fill="none" stroke="${_3D_STROKE}" stroke-width="1.5" stroke-dasharray="6,4"/>`;
                    shapeSvg += `<ellipse cx="120" cy="110" rx="22" ry="80" fill="none" stroke="${_3D_STROKE}" stroke-width="1.5" stroke-dasharray="6,4"/>`;
                    if (cs.orientation === 'horizontal') {
                        // Horizontal slice = wide ellipse across center
                        sliceSvg = `<ellipse cx="120" cy="110" rx="78" ry="20" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    } else {
                        // Vertical slice through axis = circle (great circle disk seen edge-on as ellipse)
                        sliceSvg = `<ellipse cx="120" cy="110" rx="20" ry="78" fill="${SLICE_FILL}" stroke="${SLICE_STROKE}" stroke-width="2" stroke-dasharray="6,4"/>`;
                    }
                }

                // Slice orientation label for the prompt
                const orientLabel = cs.orientation === 'horizontal' ? 'horizontally'
                    : cs.orientation === 'vertical_through_axis' ? 'vertically through its axis'
                    : 'vertically';

                // 4 distractor options always include the correct one
                const allCross = ['rectangle', 'triangle', 'circle', 'trapezoid', 'square', 'oval'];
                const optsSet = new Set([cs.cross]);
                // Add a couple of plausible distractors
                while (optsSet.size < 4) {
                    optsSet.add(pick(allCross));
                }
                const opts = shuffle([...optsSet]);

                q.text = `What 2D shape is the cross-section when this ${cs.label} is sliced ${orientLabel}?`;
                q.ans = cs.cross;
                q.answerType = "multiple-choice";
                q.options = opts;
                q.hint = cs.hint;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.05rem;">Slice the 3D shape</div>
                    <svg viewBox="0 0 240 210" width="280" style="max-width:100%;background:var(--bg-card);border-radius:12px;padding:6px;">
                        ${shapeSvg}
                        ${sliceSvg}
                    </svg>
                    <div style="margin-top:6px;font-size:0.88rem;color:var(--text-dim);">The red dashed plane shows where the slice is made.</div>
                </div>`;
                q.skillLabel = 'Cross-Section';
                q.printFormat = 'cross-section-3d';
                q.crossSectionData = { shape: cs.shape, label: cs.label, orientation: cs.orientation, cross: cs.cross };
            } else if (geoSkill === "net_identify") {
                // ===== NET IDENTIFY (Grade 5) — Band 211-220 =====
                // "Which net folds into a [shape]?" — 4 small grids, only one valid.
                // Variants for cube, rectangular prism, square pyramid, triangular prism.
                const targetType = pick(['cube', 'rect_prism', 'square_pyramid', 'triangular_prism']);

                // Each layout is a list of {x,y,w,h,kind} faces drawn in a 6×5 unit grid.
                // For triangle faces we use a polygon. We use unit dim, then scale per cell.
                // Helper: render a net layout to SVG using uniform U scale.
                function _renderNet(layout, U) {
                    // Compute bounds
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                    for (const f of layout) {
                        if (f.kind === 'rect' || f.kind === 'square') {
                            minX = Math.min(minX, f.x);
                            minY = Math.min(minY, f.y);
                            maxX = Math.max(maxX, f.x + f.w);
                            maxY = Math.max(maxY, f.y + f.h);
                        } else if (f.kind === 'tri') {
                            for (const p of f.pts) {
                                minX = Math.min(minX, p[0]);
                                minY = Math.min(minY, p[1]);
                                maxX = Math.max(maxX, p[0]);
                                maxY = Math.max(maxY, p[1]);
                            }
                        }
                    }
                    const w = (maxX - minX) * U + 8;
                    const h = (maxY - minY) * U + 8;
                    let inner = '';
                    for (const f of layout) {
                        if (f.kind === 'rect' || f.kind === 'square') {
                            const x = (f.x - minX) * U + 4;
                            const y = (f.y - minY) * U + 4;
                            inner += `<rect x="${x}" y="${y}" width="${f.w * U}" height="${f.h * U}" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.5"/>`;
                        } else if (f.kind === 'tri') {
                            const pts = f.pts.map(p => `${(p[0] - minX) * U + 4},${(p[1] - minY) * U + 4}`).join(' ');
                            inner += `<polygon points="${pts}" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.5"/>`;
                        }
                    }
                    return `<svg viewBox="0 0 ${w} ${h}" width="${Math.min(w, 130)}" height="${Math.min(h, 130)}" preserveAspectRatio="xMidYMid meet" style="background:#fff;border:1px solid #ccc;border-radius:6px;">${inner}</svg>`;
                }

                // Define valid + invalid layouts per target shape
                // Layouts use unit cells (w=h=1 for cube/pyramid). For rect prism use w/h dims.
                let validNets = [];
                let invalidNets = [];
                let shapeName = '';
                if (targetType === 'cube') {
                    shapeName = 'cube';
                    // Valid hexomino nets (subset of 11)
                    validNets = [
                        // T-cross
                        [ {kind:'square',x:1,y:0,w:1,h:1}, {kind:'square',x:0,y:1,w:1,h:1}, {kind:'square',x:1,y:1,w:1,h:1}, {kind:'square',x:2,y:1,w:1,h:1}, {kind:'square',x:3,y:1,w:1,h:1}, {kind:'square',x:1,y:2,w:1,h:1} ],
                        // 1-4-1 straight
                        [ {kind:'square',x:0,y:1,w:1,h:1}, {kind:'square',x:1,y:1,w:1,h:1}, {kind:'square',x:2,y:1,w:1,h:1}, {kind:'square',x:3,y:1,w:1,h:1}, {kind:'square',x:1,y:0,w:1,h:1}, {kind:'square',x:2,y:2,w:1,h:1} ],
                        // 2-3-1 staircase
                        [ {kind:'square',x:0,y:0,w:1,h:1}, {kind:'square',x:0,y:1,w:1,h:1}, {kind:'square',x:1,y:1,w:1,h:1}, {kind:'square',x:2,y:1,w:1,h:1}, {kind:'square',x:2,y:2,w:1,h:1}, {kind:'square',x:3,y:2,w:1,h:1} ],
                    ];
                    invalidNets = [
                        // O-shape (2x3 rectangle of 6 squares — folds into bent strip, NOT a cube)
                        [ {kind:'square',x:0,y:0,w:1,h:1}, {kind:'square',x:1,y:0,w:1,h:1}, {kind:'square',x:2,y:0,w:1,h:1}, {kind:'square',x:0,y:1,w:1,h:1}, {kind:'square',x:1,y:1,w:1,h:1}, {kind:'square',x:2,y:1,w:1,h:1} ],
                        // L-with-stub (5 in a row + 1 sticking off the end)
                        [ {kind:'square',x:0,y:0,w:1,h:1}, {kind:'square',x:1,y:0,w:1,h:1}, {kind:'square',x:2,y:0,w:1,h:1}, {kind:'square',x:3,y:0,w:1,h:1}, {kind:'square',x:4,y:0,w:1,h:1}, {kind:'square',x:4,y:1,w:1,h:1} ],
                        // Plus sign with extra (T with one arm misplaced)
                        [ {kind:'square',x:1,y:0,w:1,h:1}, {kind:'square',x:0,y:1,w:1,h:1}, {kind:'square',x:1,y:1,w:1,h:1}, {kind:'square',x:2,y:1,w:1,h:1}, {kind:'square',x:1,y:2,w:1,h:1}, {kind:'square',x:0,y:2,w:1,h:1} ],
                    ];
                } else if (targetType === 'rect_prism') {
                    shapeName = 'rectangular prism';
                    // Use l=2, w=1, h=1.5 abstract dims; valid net is T-layout: row of 4 long faces + 2 ends.
                    validNets = [
                        // Standard T: row [l,w,l,w] in middle; ends [l x w] on top + bottom of first long face.
                        [ {kind:'rect',x:0,y:1,w:2,h:1.5}, {kind:'rect',x:2,y:1,w:1,h:1.5}, {kind:'rect',x:3,y:1,w:2,h:1.5}, {kind:'rect',x:5,y:1,w:1,h:1.5},
                          {kind:'rect',x:0,y:0,w:2,h:1}, {kind:'rect',x:0,y:2.5,w:2,h:1} ],
                    ];
                    invalidNets = [
                        // Wrong: row of 6 random size rects (no end caps)
                        [ {kind:'rect',x:0,y:0,w:2,h:1.5}, {kind:'rect',x:2,y:0,w:1,h:1.5}, {kind:'rect',x:3,y:0,w:2,h:1.5}, {kind:'rect',x:5,y:0,w:1,h:1.5}, {kind:'rect',x:6,y:0,w:1,h:1}, {kind:'rect',x:7,y:0,w:1,h:1} ],
                        // Wrong: 6 squares (would be cube, not rect prism)
                        [ {kind:'square',x:1,y:0,w:1,h:1}, {kind:'square',x:0,y:1,w:1,h:1}, {kind:'square',x:1,y:1,w:1,h:1}, {kind:'square',x:2,y:1,w:1,h:1}, {kind:'square',x:3,y:1,w:1,h:1}, {kind:'square',x:1,y:2,w:1,h:1} ],
                        // Wrong: T-layout but with mismatched end-cap dimensions (ends are wrong size)
                        [ {kind:'rect',x:0,y:1,w:2,h:1.5}, {kind:'rect',x:2,y:1,w:1,h:1.5}, {kind:'rect',x:3,y:1,w:2,h:1.5}, {kind:'rect',x:5,y:1,w:1,h:1.5},
                          {kind:'rect',x:0,y:0,w:1,h:1}, {kind:'rect',x:0,y:2.5,w:1,h:1} ],
                    ];
                } else if (targetType === 'square_pyramid') {
                    shapeName = 'square pyramid';
                    // Valid: 1 square base + 4 triangles attached to each side of the square.
                    validNets = [
                        // Square at center, triangles on all 4 sides
                        [ {kind:'square',x:1,y:1,w:1,h:1},
                          {kind:'tri',pts:[[1,1],[2,1],[1.5,0]]},   // top
                          {kind:'tri',pts:[[2,1],[2,2],[3,1.5]]},   // right
                          {kind:'tri',pts:[[1,2],[2,2],[1.5,3]]},   // bottom
                          {kind:'tri',pts:[[1,1],[1,2],[0,1.5]]} ], // left
                    ];
                    invalidNets = [
                        // Wrong: 1 square + only 3 triangles
                        [ {kind:'square',x:1,y:1,w:1,h:1},
                          {kind:'tri',pts:[[1,1],[2,1],[1.5,0]]},
                          {kind:'tri',pts:[[2,1],[2,2],[3,1.5]]},
                          {kind:'tri',pts:[[1,2],[2,2],[1.5,3]]} ],
                        // Wrong: 1 square + 4 triangles all on one side (impossible to fold)
                        [ {kind:'square',x:1,y:1,w:1,h:1},
                          {kind:'tri',pts:[[1,1],[2,1],[1.5,0.2]]},
                          {kind:'tri',pts:[[1,1],[2,1],[1.5,-0.7]]},
                          {kind:'tri',pts:[[2,1],[2,2],[3,1.5]]},
                          {kind:'tri',pts:[[2,1],[2,2],[3.7,1.5]]} ],
                        // Wrong: 1 triangle + 4 squares (impossible — would need 1 sq + 4 tri)
                        [ {kind:'tri',pts:[[1,1],[2,1],[1.5,0.2]]},
                          {kind:'square',x:0,y:1,w:1,h:1},
                          {kind:'square',x:1,y:1,w:1,h:1},
                          {kind:'square',x:2,y:1,w:1,h:1},
                          {kind:'square',x:3,y:1,w:1,h:1} ],
                    ];
                } else { // triangular_prism
                    shapeName = 'triangular prism';
                    // Valid: 3 rectangles in a row + 2 triangles (one above first rect, one below)
                    validNets = [
                        [ {kind:'rect',x:0,y:1,w:1.5,h:2}, {kind:'rect',x:1.5,y:1,w:1.5,h:2}, {kind:'rect',x:3,y:1,w:1.5,h:2},
                          {kind:'tri',pts:[[0,1],[1.5,1],[0.75,0]]},
                          {kind:'tri',pts:[[0,3],[1.5,3],[0.75,4]]} ],
                    ];
                    invalidNets = [
                        // Wrong: 3 rectangles + only 1 triangle
                        [ {kind:'rect',x:0,y:1,w:1.5,h:2}, {kind:'rect',x:1.5,y:1,w:1.5,h:2}, {kind:'rect',x:3,y:1,w:1.5,h:2},
                          {kind:'tri',pts:[[0,1],[1.5,1],[0.75,0]]} ],
                        // Wrong: 4 rectangles + 2 triangles (too many rects)
                        [ {kind:'rect',x:0,y:1,w:1.5,h:2}, {kind:'rect',x:1.5,y:1,w:1.5,h:2}, {kind:'rect',x:3,y:1,w:1.5,h:2}, {kind:'rect',x:4.5,y:1,w:1.5,h:2},
                          {kind:'tri',pts:[[0,1],[1.5,1],[0.75,0]]},
                          {kind:'tri',pts:[[0,3],[1.5,3],[0.75,4]]} ],
                        // Wrong: 2 rectangles + 2 triangles (too few rects for prism's 3 rect faces)
                        [ {kind:'rect',x:0,y:1,w:1.5,h:2}, {kind:'rect',x:1.5,y:1,w:1.5,h:2},
                          {kind:'tri',pts:[[0,1],[1.5,1],[0.75,0]]},
                          {kind:'tri',pts:[[0,3],[1.5,3],[0.75,4]]} ],
                    ];
                }

                // Pick 1 valid + 3 invalid
                const validChosen = pick(validNets);
                const invChosen = shuffle([...invalidNets]).slice(0, 3);

                // Build options
                const U = 22;
                const optionItems = shuffle([
                    { svg: _renderNet(validChosen, U), correct: true },
                    { svg: _renderNet(invChosen[0], U), correct: false },
                    { svg: _renderNet(invChosen[1], U), correct: false },
                    { svg: _renderNet(invChosen[2], U), correct: false },
                ]);
                const letters = ['A', 'B', 'C', 'D'];
                const opts = optionItems.map((o, i) => ({
                    id: letters[i],
                    svg: o.svg,
                    correct: o.correct
                }));
                const correctLetter = opts.find(o => o.correct).id;

                q.text = `Which net folds into a ${shapeName}?`;
                q.ans = correctLetter;
                q.answerType = 'multiple-choice';
                q.options = letters.slice(0, 4);
                q.hint = targetType === 'cube'
                    ? `A cube net has 6 squares arranged so that no two squares overlap when folded.`
                    : targetType === 'rect_prism'
                        ? `A rectangular prism has 6 rectangular faces — 3 pairs of equal rectangles.`
                        : targetType === 'square_pyramid'
                            ? `A square pyramid has 1 square base and 4 triangle sides.`
                            : `A triangular prism has 3 rectangle sides and 2 triangle ends.`;

                // Build the visual: 4 nets in a 2x2 grid, labeled A-D
                const cells = opts.map(o => `<td style="vertical-align:top;padding:8px;text-align:center;">
                    <div style="font-weight:700;font-size:1rem;margin-bottom:4px;color:var(--accent-purple);">${o.id}</div>
                    ${o.svg}
                </td>`);
                const visualHtml = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);font-size:1.05rem;">Choose the net that folds into a ${shapeName}</div>
                    <table style="border-collapse:collapse;margin:0 auto;background:var(--bg-card);border-radius:10px;padding:6px;">
                        <tr>${cells[0]}${cells[1]}</tr>
                        <tr>${cells[2]}${cells[3]}</tr>
                    </table>
                </div>`;
                q.visual = visualHtml;
                q.skillLabel = 'Net Identify';
                q.printFormat = 'net-identify';
                q.netIdentifyData = { targetType, shapeName, correctLetter, options: opts.map(o => ({ id: o.id, correct: o.correct, svg: o.svg })) };
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
                    gridLines += `<line x1="${xPos}" y1="${origin.y}" x2="${xPos}" y2="${origin.y - maxCoord * gridSpacing}" stroke="#e6e8ec" stroke-width="0.75"/>`;
                    // Horizontal
                    gridLines += `<line x1="${origin.x}" y1="${yPos}" x2="${origin.x + maxCoord * gridSpacing}" y2="${yPos}" stroke="#e6e8ec" stroke-width="0.75"/>`;
                    if (i > 0 && i % (maxCoord > 10 ? 2 : 1) === 0) {
                        axisLabels += `<text x="${xPos}" y="${origin.y + 14}" text-anchor="middle" font-family='"Open Sans", Inter, system-ui, sans-serif' fill="#5f6368" font-size="11">${i}</text>`;
                        axisLabels += `<text x="${origin.x - 8}" y="${yPos + 4}" text-anchor="end" font-family='"Open Sans", Inter, system-ui, sans-serif' fill="#5f6368" font-size="11">${i}</text>`;
                    }
                }

                // Plot two points + connecting segment
                const pxA = origin.x + A.x * gridSpacing;
                const pyA = origin.y - A.y * gridSpacing;
                const pxB = origin.x + B.x * gridSpacing;
                const pyB = origin.y - B.y * gridSpacing;
                const segment = `<line x1="${pxA}" y1="${pyA}" x2="${pxB}" y2="${pyB}" stroke="${COLORS.primary}" stroke-width="${STROKE.bold}" stroke-linecap="round"/>`;
                const ptA = `<circle cx="${pxA}" cy="${pyA}" r="6" fill="${COLORS.wrong}" stroke="${COLORS.bg}" stroke-width="${STROKE.normal}"/><text x="${pxA + 10}" y="${pyA - 8}" font-family="${FONTS.sans}" fill="${COLORS.wrong}" font-size="13" font-weight="700">A(${A.x},${A.y})</text>`;
                const ptB = `<circle cx="${pxB}" cy="${pyB}" r="6" fill="${COLORS.wrong}" stroke="${COLORS.bg}" stroke-width="${STROKE.normal}"/><text x="${pxB + 10}" y="${pyB - 8}" font-family="${FONTS.sans}" fill="${COLORS.wrong}" font-size="13" font-weight="700">B(${B.x},${B.y})</text>`;

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
                    // IXL convention: every triangle in the same chooser uses the same
                    // primary blue fill, so the student classifies by SHAPE not by COLOR.
                    // Right triangle adds the red right-angle marker per IXL convention.
                    const _t = shapeStyle(0);
                    // True equilateral: base 76, height = 76·√3/2 ≈ 65.82.
                    // Apex at (50, 16.18), base from (12, 82) to (88, 82).
                    if (type === 'equilateral') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="50,16.2 88,82 12,82" fill="${_t.fill}" stroke="${_t.stroke}" stroke-width="${STROKE.normal}"/></svg>`;
                    }
                    if (type === 'isosceles') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="50,12 82,85 18,85" fill="${_t.fill}" stroke="${_t.stroke}" stroke-width="${STROKE.normal}"/></svg>`;
                    }
                    if (type === 'scalene') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="20,80 78,68 60,18" fill="${_t.fill}" stroke="${_t.stroke}" stroke-width="${STROKE.normal}"/></svg>`;
                    }
                    if (type === 'right') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="20,20 20,82 82,82" fill="${_t.fill}" stroke="${_t.stroke}" stroke-width="${STROKE.normal}"/><rect x="20" y="74" width="8" height="8" fill="none" stroke="${COLORS.wrong}" stroke-width="${STROKE.normal}"/></svg>`;
                    }
                    if (type === 'acute') {
                        return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="50,18 78,80 22,80" fill="${_t.fill}" stroke="${_t.stroke}" stroke-width="${STROKE.normal}"/></svg>`;
                    }
                    // Obtuse: apex shifted left of the bottom-left vertex so the
                    // bottom-left angle clearly exceeds 90°. Vertices (5,30)
                    // (25,82) (90,82) → angles ≈ 111° / 37.5° / 31.5°. Prior
                    // coords (10,72) (90,72) (78,38) had max angle ~83° (acute).
                    return `<svg viewBox="0 0 100 100" width="80" height="80"><polygon points="5,30 25,82 90,82" fill="${_t.fill}" stroke="${_t.stroke}" stroke-width="${STROKE.normal}"/></svg>`;
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
                // IXL convention: every shape uses the same primary blue so the
                // student classifies by SHAPE not by COLOR.
                const _q = shapeStyle(0);
                const _qs = `fill="${_q.fill}" stroke="${_q.stroke}" stroke-width="${STROKE.normal}"`;
                const quadDefs = [
                    { name: 'square', svg: `<rect x="22" y="22" width="56" height="56" ${_qs}/>`,
                      isSquare: true, isRect: true, isRhombus: true, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'rectangle', svg: `<rect x="12" y="32" width="76" height="40" ${_qs}/>`,
                      isSquare: false, isRect: true, isRhombus: false, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'rhombus', svg: `<polygon points="50,12 88,50 50,88 12,50" ${_qs}/>`,
                      isSquare: false, isRect: false, isRhombus: true, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'parallelogram', svg: `<polygon points="20,72 78,72 88,28 30,28" ${_qs}/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: true, isTrapezoid: false, isQuad: true },
                    { name: 'trapezoid', svg: `<polygon points="12,78 88,78 70,22 30,22" ${_qs}/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: false, isTrapezoid: true, isQuad: true },
                    { name: 'kite', svg: `<polygon points="50,10 80,42 50,90 20,42" ${_qs}/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: false, isTrapezoid: false, isQuad: true },
                    { name: 'triangle', svg: `<polygon points="50,15 88,82 12,82" ${_qs}/>`,
                      isSquare: false, isRect: false, isRhombus: false, isParallelogram: false, isTrapezoid: false, isQuad: false },
                    { name: 'pentagon', svg: `<polygon points="50,12 88,40 74,86 26,86 12,40" ${_qs}/>`,
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
                // Classify quadrilaterals — multi-select using the INCLUSIVE
                // hierarchy. A square is also a rectangle, rhombus,
                // parallelogram, trapezoid (US inclusive def), and
                // quadrilateral. Student must select ALL categories that
                // apply.
                //
                // Hierarchy:
                //   Quadrilateral ⊃ Trapezoid (≥1 pair parallel)
                //                 ⊃ Parallelogram (both pairs parallel)
                //                 ⊃ {Rectangle, Rhombus}
                //                 ⊃ Square (Rectangle ∩ Rhombus)
                //   Kite is its own branch (2 pairs adjacent equal sides).
                const quadShapes = [
                    { name: "square",        cats: ["square","rectangle","rhombus","parallelogram","trapezoid","quadrilateral"] },
                    { name: "rectangle",     cats: ["rectangle","parallelogram","trapezoid","quadrilateral"] },
                    { name: "rhombus",       cats: ["rhombus","parallelogram","trapezoid","quadrilateral"] },
                    { name: "parallelogram", cats: ["parallelogram","trapezoid","quadrilateral"] },
                    { name: "trapezoid",     cats: ["trapezoid","quadrilateral"] },
                    { name: "kite",          cats: ["kite","quadrilateral"] }
                ];
                const shape = pick(quadShapes);
                // Always present the same 7 category options in a fixed order
                // so students learn the full classification vocabulary.
                const ALL_CATS = ["square","rectangle","rhombus","parallelogram","trapezoid","kite","quadrilateral"];
                const correctSet = new Set(shape.cats);
                const opts = ALL_CATS.map((cat, i) => ({
                    id: 'cat' + i,
                    label: cat.charAt(0).toUpperCase() + cat.slice(1),
                    correct: correctSet.has(cat)
                }));
                const ans = opts.filter(o => o.correct).map(o => o.id);
                const nCorrect = ans.length;

                q.text = `Click ALL categories that apply (select ${nCorrect}).`;
                q.ans = ans;
                q.options = opts;
                q.answerType = "multi-select-check";
                q.hint = `A ${shape.name} belongs to ${nCorrect} ${nCorrect === 1 ? 'category' : 'categories'}: ${shape.cats.join(', ')}. Remember: every square is also a rectangle, rhombus, parallelogram, trapezoid, and quadrilateral.`;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);font-size:1.2rem;">Classify This Quadrilateral</div>
                    <div style="display:inline-block;width:min(260px,60vw);max-width:100%;">
                        <div style="width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center;">${createShapeSVG(shape.name, false)}</div>
                    </div>
                    <div style="margin-top:10px;font-size:1rem;color:var(--text-dim);">
                        Tip: a shape can belong to more than one category.
                    </div>
                </div>`;
                q.geometryData = { quad: shape.name, allCats: shape.cats };
                q.printFormat = "geometry-quads";
                q.skillLabel = 'Quadrilaterals';
                return;
            } else if (geoSkill === "hotspot_quads") {
                // ====================================================
                // DEMO: image-hotspot primitive
                // Show a row of 5 SVG shapes (mix of quads and non-quads).
                // Student clicks every quadrilateral. Submit checks the
                // selected set vs the IDs of the quad shapes.
                // ====================================================
                const QUADS = ['square', 'rectangle', 'rhombus', 'parallelogram', 'trapezoid', 'kite'];
                const NON_QUADS = ['equilateral triangle', 'isosceles triangle', 'regular hexagon', 'circle'];
                // Pick 3 quads + 2 non-quads, shuffle.
                const quads = shuffle(QUADS.slice()).slice(0, 3);
                const nonQuads = shuffle(NON_QUADS.slice()).slice(0, 2);
                const slots = shuffle(
                    quads.map((name, i) => ({ id: 'q' + i, name, isQuad: true }))
                    .concat(nonQuads.map((name, i) => ({ id: 'n' + i, name, isQuad: false })))
                );

                // Build a single SVG containing 5 shape groups laid out in a row.
                // Each shape is rendered into a 140x140 cell; we wrap each in a
                // <g class="hot" data-id="..."> so the renderer can attach
                // click handlers and the answer-check can read the data-id.
                const cellW = 140;
                const cellH = 150;
                const totalW = cellW * slots.length;
                let inner = '';
                slots.forEach((slot, idx) => {
                    const dx = idx * cellW;
                    // Render the shape via createShapeSVG, then strip the outer
                    // <svg> tags so we can splat its inner contents into our
                    // group with a translate. createShapeSVG produces a 140-px
                    // wide SVG (size 100 + padding 20*2). Just wrap in <g>.
                    const shapeSvg = createShapeSVG(slot.name, false);
                    // Extract inner SVG (everything between <svg ...> and </svg>)
                    const innerMatch = shapeSvg.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
                    const shapeBody = innerMatch ? innerMatch[1] : '';
                    // Hit-target backdrop ensures the click area covers the
                    // whole cell (not just the thin shape stroke).
                    inner += `<g class="hot" data-id="${slot.id}" data-selected="0">`
                        + `<rect x="${dx + 4}" y="4" width="${cellW - 8}" height="${cellH - 18}" fill="#ffffff" stroke="#cccccc" stroke-width="1" rx="6"/>`
                        + `<g transform="translate(${dx},0)">${shapeBody}</g>`
                        + `<text x="${dx + cellW / 2}" y="${cellH - 4}" text-anchor="middle" font-size="11" fill="#666" font-family="Arial">${slot.name}</text>`
                        + `</g>`;
                });
                const hotspotSvg = `<svg viewBox="0 0 ${totalW} ${cellH}" width="${Math.min(totalW, 720)}" height="${cellH * Math.min(totalW, 720) / totalW}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">${inner}</svg>`;

                const correctIds = slots.filter(s => s.isQuad).map(s => s.id);

                q.text = `Click ALL the quadrilaterals.`;
                q.ans = correctIds;
                q.answerType = 'image-hotspot';
                q.hotspotSvg = hotspotSvg;
                q.visual = '';
                q.hint = `A quadrilateral is any closed shape with exactly 4 straight sides — squares, rectangles, rhombuses, parallelograms, trapezoids, and kites all qualify.`;
                q.printFormat = 'image-hotspot';
                q.skillLabel = 'Quadrilateral Hotspot';
                q.options = [];
                q.hotspotData = { slots, correctIds };
                return;
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
                    ${STUDENT_DEF_PERIMETER}
                    ${STUDENT_DEF_AREA}
                    ${createLabeledRectSVG(length, width, false)}
                    <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                        <div style="text-align:left;">
                            <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                            <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter"
                                style="width:100%;padding:12px;border:2px solid #1565c0;border-radius:8px;font-size:1.1rem;background:#ffffff;color:#1a202c;">
                            <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;display:inline-block;visibility:visible;">Perimeter Hint</button>
                        </div>
                        <div style="text-align:left;">
                            <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                            <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                style="width:100%;padding:12px;border:2px solid #1565c0;border-radius:8px;font-size:1.1rem;background:#ffffff;color:#1a202c;">
                            <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;display:inline-block;visibility:visible;">Area Hint</button>
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

                // 50% perimeter-only with labeled sides; 50% dual P+A (original behavior).
                // LRU rotation guarantees students see both forms in alternation.
                const _ckind = (typeof window !== 'undefined' && window.pickVariant)
                    ? window.pickVariant('composite_shapes', ['perim_only', 'dual_pa'])
                    : (Math.random() < 0.5 ? 'perim_only' : 'dual_pa');
                q._variant = _ckind;
                const _compPerimOnly = (_ckind === 'perim_only');

                if (_compPerimOnly) {
                    // Labeled-sides composite shape - perimeter only
                    const _maxPxC = 360;
                    const _padC = 60;
                    if (shapeType === "L") {
                        const lFW = rng(5, 10);
                        const lFH = rng(4, 8);
                        const lCW = rng(1, lFW - 2);
                        const lCH = rng(1, lFH - 2);
                        const sTopLeft = lFW - lCW;   // top horizontal (left part)
                        const sStepDn  = lCH;         // step down
                        const sStepRt  = lCW;         // step right
                        const sRight   = lFH - lCH;   // remaining right
                        const sBottom  = lFW;         // bottom
                        const sLeft    = lFH;         // left
                        const cPerim = sTopLeft + sStepDn + sStepRt + sRight + sBottom + sLeft;
                        q.ans = cPerim;
                        q.text = `Find the perimeter of this composite shape.`;
                        q.hint = `Count or add the OUTSIDE of the shape.`;
                        const _maxDC = Math.max(lFW, lFH);
                        const _u = Math.floor(_maxPxC / _maxDC);
                        const _W = lFW * _u;
                        const _H = lFH * _u;
                        const _CW = lCW * _u;
                        const _CH = lCH * _u;
                        const _svgW = _W + _padC * 2;
                        const _svgH = _H + _padC * 2;
                        const _ox = _padC, _oy = _padC;
                        const _fillC = softFill(COLORS.primary);
                        const _strokeC = COLORS.primary;
                        const _path = `M ${_ox} ${_oy} `
                                    + `L ${_ox + (_W - _CW)} ${_oy} `
                                    + `L ${_ox + (_W - _CW)} ${_oy + _CH} `
                                    + `L ${_ox + _W} ${_oy + _CH} `
                                    + `L ${_ox + _W} ${_oy + _H} `
                                    + `L ${_ox} ${_oy + _H} Z`;
                        const _T1 = `<text x="${_ox + (_W - _CW) / 2}" y="${_oy - 14}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sTopLeft}</text>`;
                        const _T2 = `<text x="${_ox + (_W - _CW) - 18}" y="${_oy + _CH / 2 + 8}" text-anchor="end" font-size="22" font-weight="800" fill="${COLORS.text}">${sStepDn}</text>`;
                        const _T3 = `<text x="${_ox + (_W - _CW) + _CW / 2}" y="${_oy + _CH - 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sStepRt}</text>`;
                        const _T4 = `<text x="${_ox + _W + 22}" y="${_oy + _CH + (_H - _CH) / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sRight}</text>`;
                        const _T5 = `<text x="${_ox + _W / 2}" y="${_oy + _H + 36}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sBottom}</text>`;
                        const _T6 = `<text x="${_ox - 22}" y="${_oy + _H / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sLeft}</text>`;
                        q.visual = `<div style="text-align:center;">
                            ${STUDENT_DEF_PERIMETER}
                            <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Add the Sides</div>
                            <svg width="${_svgW}" height="${_svgH}" viewBox="0 0 ${_svgW} ${_svgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:${_maxPxC + _padC * 2}px;height:auto;">
                                <path class="perim-hint-outline" d="${_path}" fill="${_fillC}" stroke="${_strokeC}" stroke-width="${STROKE.bold}" stroke-linejoin="round"/>
                                ${_T1}${_T2}${_T3}${_T4}${_T5}${_T6}
                            </svg>
                            <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                        </div>`;
                        q.geometryData = { shapeType: 'L', perimeter: cPerim, dims: { lFW, lFH, lCW, lCH } };
                    } else {
                        // T-shape: bigger top, narrower stem; 8 sides labeled
                        const tTW = rng(6, 12);                          // top width
                        const tTH = rng(2, 4);                           // top height
                        const tSW = rng(2, Math.max(2, Math.floor(tTW / 2) - 1)); // stem width
                        const tSH = rng(3, 7);                           // stem height
                        const sideTop    = tTW;
                        const sideTopRgt = tTH;
                        const sideShlfRt = (tTW - tSW) / 2;
                        const sideStemRt = tSH;
                        const sideBot    = tSW;
                        const sideStemLf = tSH;
                        const sideShlfLf = (tTW - tSW) / 2;
                        const sideTopLft = tTH;
                        const tPerim = sideTop + sideTopRgt + sideShlfRt + sideStemRt + sideBot + sideStemLf + sideShlfLf + sideTopLft;
                        q.ans = tPerim;
                        q.text = `Find the perimeter of this composite shape.`;
                        q.hint = `Count or add the OUTSIDE of the shape.`;
                        const _maxDC = Math.max(tTW, tTH + tSH);
                        const _u = Math.floor(_maxPxC / _maxDC);
                        const _TW = tTW * _u;
                        const _TH = tTH * _u;
                        const _SW = tSW * _u;
                        const _SH = tSH * _u;
                        const _shelf = (_TW - _SW) / 2;
                        const _svgW = _TW + _padC * 2;
                        const _svgH = (_TH + _SH) + _padC * 2;
                        const _ox = _padC, _oy = _padC;
                        const _fillC = softFill(COLORS.primary);
                        const _strokeC = COLORS.primary;
                        // T-path: top-left clockwise
                        const _path = `M ${_ox} ${_oy} `
                                    + `L ${_ox + _TW} ${_oy} `
                                    + `L ${_ox + _TW} ${_oy + _TH} `
                                    + `L ${_ox + _TW - _shelf} ${_oy + _TH} `
                                    + `L ${_ox + _TW - _shelf} ${_oy + _TH + _SH} `
                                    + `L ${_ox + _shelf} ${_oy + _TH + _SH} `
                                    + `L ${_ox + _shelf} ${_oy + _TH} `
                                    + `L ${_ox} ${_oy + _TH} Z`;
                        const _T1 = `<text x="${_ox + _TW / 2}" y="${_oy - 14}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideTop}</text>`;
                        const _T2 = `<text x="${_ox + _TW + 22}" y="${_oy + _TH / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideTopRgt}</text>`;
                        const _T3 = `<text x="${_ox + _TW - _shelf / 2}" y="${_oy + _TH - 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideShlfRt}</text>`;
                        const _T4 = `<text x="${_ox + _TW - _shelf + 22}" y="${_oy + _TH + _SH / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideStemRt}</text>`;
                        const _T5 = `<text x="${_ox + _TW / 2}" y="${_oy + _TH + _SH + 36}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideBot}</text>`;
                        const _T6 = `<text x="${_ox + _shelf - 22}" y="${_oy + _TH + _SH / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideStemLf}</text>`;
                        const _T7 = `<text x="${_ox + _shelf / 2}" y="${_oy + _TH - 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideShlfLf}</text>`;
                        const _T8 = `<text x="${_ox - 22}" y="${_oy + _TH / 2 + 8}" text-anchor="middle" font-size="22" font-weight="800" fill="${COLORS.text}">${sideTopLft}</text>`;
                        q.visual = `<div style="text-align:center;">
                            ${STUDENT_DEF_PERIMETER}
                            <div style="font-weight:700;margin-bottom:15px;color:var(--accent-purple);">Perimeter - Add the Sides</div>
                            <svg width="${_svgW}" height="${_svgH}" viewBox="0 0 ${_svgW} ${_svgH}" preserveAspectRatio="xMidYMid meet" style="width:100%;max-width:${_maxPxC + _padC * 2}px;height:auto;">
                                <path class="perim-hint-outline" d="${_path}" fill="${_fillC}" stroke="${_strokeC}" stroke-width="${STROKE.bold}" stroke-linejoin="round"/>
                                ${_T1}${_T2}${_T3}${_T4}${_T5}${_T6}${_T7}${_T8}
                            </svg>
                            <div style="margin-top:6px;font-size:1.1rem;">Perimeter = <span style="border-bottom:2px solid var(--accent-green);padding:0 15px;">?</span> units</div>
                        </div>`;
                        q.geometryData = { shapeType: 'T', perimeter: tPerim, dims: { tTW, tTH, tSW, tSH } };
                    }
                    q.answerType = "number";
                    q.options = buildNumericOptions(q.ans);
                    q.printFormat = "geometry-composite";
                } else if (shapeType === "L") {
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
                        ${STUDENT_DEF_PERIMETER}
                        ${STUDENT_DEF_AREA}
                        ${createLShapeSVG({ topWidth, topHeight, bottomWidth, totalHeight }, false)}
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                                <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter"
                                    style="width:100%;padding:12px;border:2px solid #1565c0;border-radius:8px;font-size:1.1rem;background:#ffffff;color:#1a202c;">
                                <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;display:inline-block;visibility:visible;">Perimeter Hint</button>
                            </div>
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                                <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                    style="width:100%;padding:12px;border:2px solid #1565c0;border-radius:8px;font-size:1.1rem;background:#ffffff;color:#1a202c;">
                                <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;display:inline-block;visibility:visible;">Area Hint</button>
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
                        ${STUDENT_DEF_PERIMETER}
                        ${STUDENT_DEF_AREA}
                        ${createTShapeSVG({ topWidth, topHeight, stemWidth, stemHeight }, false)}
                        <div style="display:flex;flex-direction:column;gap:15px;margin-top:20px;max-width:300px;margin-left:auto;margin-right:auto;">
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-purple);display:block;margin-bottom:5px;">Perimeter:</label>
                                <input type="number" id="perimeterInput" class="dual-answer-input" placeholder="Enter perimeter"
                                    style="width:100%;padding:12px;border:2px solid #1565c0;border-radius:8px;font-size:1.1rem;background:#ffffff;color:#1a202c;">
                                <button class="hint-btn-small" onclick="showGeometryHint('perimeter')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;display:inline-block;visibility:visible;">Perimeter Hint</button>
                            </div>
                            <div style="text-align:left;">
                                <label style="font-weight:700;color:var(--accent-green);display:block;margin-bottom:5px;">Area:</label>
                                <input type="number" id="areaInput" class="dual-answer-input" placeholder="Enter area"
                                    style="width:100%;padding:12px;border:2px solid #1565c0;border-radius:8px;font-size:1.1rem;background:#ffffff;color:#1a202c;">
                                <button class="hint-btn-small" onclick="showGeometryHint('area')" style="margin-top:5px;padding:6px 12px;font-size:0.85rem;display:inline-block;visibility:visible;">Area Hint</button>
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
                    ${STUDENT_DEF_AREA}
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
                            style="width:100%;padding:10px;border:2px solid #1565c0;border-radius:8px;font-size:1rem;background:#ffffff;color:#1a202c;">
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
                    ${STUDENT_DEF_PERIMETER}
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
                            style="width:100%;padding:10px;border:2px solid #1565c0;border-radius:8px;font-size:1rem;background:#ffffff;color:#1a202c;">
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
                    ${askFor === "area" ? STUDENT_DEF_AREA : STUDENT_DEF_PERIMETER}
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
                            style="width:100%;padding:12px;border:2px solid #1565c0;border-radius:8px;font-size:1.1rem;background:#ffffff;color:#1a202c;">

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
