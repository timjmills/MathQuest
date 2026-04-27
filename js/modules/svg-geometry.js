import { randInt } from './utils.js';

// Design tokens — IXL-aligned (Round 3 of graphics overhaul)
// Inlined here so this module has no external dependency on a tokens file.
const _DT_COLORS = {
    bg: '#ffffff', axis: '#212121', grid: '#e6e8ec', text: '#212121',
    primary: '#1e88e5', primaryDark: '#1565c0',
    fill: ['#1e88e5','#43a047','#fb8c00','#8e24aa','#e53935','#00897b'],
    correct: '#2e7d32', wrong: '#c62828', neutral: '#9e9e9e',
};
const _DT_STROKE = { hair: 0.75, normal: 1.5, bold: 2.5 };
const _DT_FONT = '"Open Sans", "Inter", system-ui, -apple-system, sans-serif';
function _dtFill(i) { return _DT_COLORS.fill[i % _DT_COLORS.fill.length]; }
// 18% opacity wash on a saturated hex (e.g. "#1e88e5" -> "#1e88e52E")
function _dtSoft(hex) { return hex + '2E'; }

// Compute the three interior angles of a triangle from its vertices using
// the law of cosines. Input: array of three [x,y] points (or strings parsable
// as "x,y"). Returns [angleAtP0, angleAtP1, angleAtP2] in degrees.
// Used to verify that triangles produced by createTriangleSVG actually exhibit
// their claimed type (right / acute / obtuse / equilateral / isosceles / scalene)
// and guard against future drift between the rendered visual and answer key.
export function computeTriangleAngles(points) {
    const pts = points.map(p => Array.isArray(p) ? p : String(p).split(',').map(Number));
    const [P0, P1, P2] = pts;
    const dist = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]);
    const a = dist(P1, P2); // side opposite P0
    const b = dist(P0, P2); // side opposite P1
    const c = dist(P0, P1); // side opposite P2
    // Clamp to [-1,1] to avoid NaN from floating-point drift.
    const clamp = v => Math.max(-1, Math.min(1, v));
    const angP0 = Math.acos(clamp((b * b + c * c - a * a) / (2 * b * c))) * 180 / Math.PI;
    const angP1 = Math.acos(clamp((a * a + c * c - b * b) / (2 * a * c))) * 180 / Math.PI;
    const angP2 = Math.acos(clamp((a * a + b * b - c * c) / (2 * a * b))) * 180 / Math.PI;
    return [angP0, angP1, angP2];
}

// Classify a triangle from its vertices. Returns an object with .byAngle
// ('right' | 'acute' | 'obtuse') and .bySide ('equilateral' | 'isosceles' |
// 'scalene'). Tolerances: right within 1°, equal sides/angles within 1.5°
// or ~1% relative length.
function _classifyTriangleFromPoints(points) {
    const angs = computeTriangleAngles(points);
    const maxAng = Math.max(...angs);
    const minAng = Math.min(...angs);
    let byAngle;
    if (Math.abs(maxAng - 90) <= 1) byAngle = 'right';
    else if (maxAng > 90) byAngle = 'obtuse';
    else byAngle = 'acute';
    const pts = points.map(p => Array.isArray(p) ? p : String(p).split(',').map(Number));
    const [P0, P1, P2] = pts;
    const dist = (A, B) => Math.hypot(A[0] - B[0], A[1] - B[1]);
    const sides = [dist(P1, P2), dist(P0, P2), dist(P0, P1)].sort((x, y) => x - y);
    const eq01 = Math.abs(sides[0] - sides[1]) < 1.0;
    const eq12 = Math.abs(sides[1] - sides[2]) < 1.0;
    let bySide;
    if (eq01 && eq12) bySide = 'equilateral';
    else if (eq01 || eq12) bySide = 'isosceles';
    else bySide = 'scalene';
    return { byAngle, bySide, angles: angs, sides, minAng, maxAng };
}

export function createAngleSVG(degrees, size = 120, showLabel = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    const arcColor = forPrint ? '#333' : _DT_COLORS.primary;
    const rightAngleColor = forPrint ? '#333' : _DT_COLORS.wrong;
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    // Convert degrees to radians (positive angle going counter-clockwise from horizontal)
    const radians = (degrees * Math.PI) / 180;

    // Position vertex based on angle type for best visibility
    let cx, cy, rayLength;
    if (degrees <= 90) {
        // Acute and right angles: vertex at bottom-left area
        cx = size * 0.25;
        cy = size * 0.75;
        rayLength = size * 0.55;
    } else if (degrees <= 120) {
        // Slightly obtuse: vertex at center-bottom
        cx = size * 0.35;
        cy = size * 0.8;
        rayLength = size * 0.45;
    } else if (degrees < 180) {
        // Very obtuse angles: vertex at center
        cx = size * 0.5;
        cy = size * 0.85;
        rayLength = size * 0.4;
    } else {
        // Straight angle (180): vertex at center
        cx = size * 0.5;
        cy = size * 0.6;
        rayLength = size * 0.4;
    }

    // Arc radius proportional to angle (smaller arc for acute, larger for obtuse)
    const arcRadius = Math.max(15, Math.min(35, rayLength * 0.3 + degrees * 0.05));

    // Calculate ray endpoints
    // First ray goes to the right (0 degrees)
    const x1 = cx + rayLength;
    const y1 = cy;

    // Second ray at the specified angle (counter-clockwise)
    let x2 = cx + rayLength * Math.cos(radians);
    let y2 = cy - rayLength * Math.sin(radians);

    // Clamp second ray to stay within SVG bounds (with padding)
    const minBound = 8;
    const maxBound = size - 8;

    // If x2 goes out of bounds, scale the ray
    if (x2 < minBound) {
        const scale = (cx - minBound) / (cx - x2);
        x2 = minBound;
        y2 = cy - (cy - y2) * scale;
    }
    if (x2 > maxBound) {
        const scale = (maxBound - cx) / (x2 - cx);
        x2 = maxBound;
        y2 = cy - (cy - y2) * scale;
    }
    if (y2 < minBound) {
        const scale = (cy - minBound) / (cy - y2);
        y2 = minBound;
        x2 = cx + (x2 - cx) * scale;
    }
    if (y2 > maxBound) {
        const scale = (maxBound - cy) / (y2 - cy);
        y2 = maxBound;
        x2 = cx + (x2 - cx) * scale;
    }

    // Arc start point (on first ray)
    const arcX1 = cx + arcRadius;
    const arcY1 = cy;

    // Arc end point (on second ray)
    const arcX2 = cx + arcRadius * Math.cos(radians);
    const arcY2 = cy - arcRadius * Math.sin(radians);

    // SVG arcs: SVG Y is INVERTED (down is positive), so what looks "counter-
    // clockwise visually" (the short arc through the TOP, between two rays
    // where the second ray goes UP) is actually sweep-flag = 0. The previous
    // sweep-flag = 1 was drawing the REFLEX angle (long way around through
    // the bottom) for any obtuse angle.
    const sweepFlag = 0;
    // Large arc flag: 0 for actual angle ≤ 180, 1 only for reflex angles.
    const largeArc = degrees > 180 ? 1 : 0;

    // Calculate SVG viewBox to ensure everything fits
    const padding = 20;
    const minX = Math.min(cx, x1, x2, arcX1, arcX2) - padding;
    const maxX = Math.max(cx, x1, x2, arcX1, arcX2) + padding;
    const minY = Math.min(cy, y1, y2, arcY1, arcY2) - padding;
    const maxY = Math.max(cy, y1, y2, arcY1, arcY2) + padding;

    // Responsive sizing: preserve fixed dims for print, let screen SVGs
    // shrink inside MAP/worksheet cards. viewBox preserves coordinate system.
    const _sizeStyle = forPrint
        ? `width="${size}" height="${size}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${size}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${size} ${size}">`;

    // First ray (horizontal, going right)
    svg += `<line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="${strokeColor}" stroke-width="${_DT_STROKE.bold}" stroke-linecap="round"/>`;

    // Second ray (at angle)
    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="${_DT_STROKE.bold}" stroke-linecap="round"/>`;

    // Right angle indicator (small square) for exactly 90 degrees
    if (degrees === 90) {
        const squareSize = 14;
        // Draw square in the corner of the angle
        svg += `<path d="M ${cx + squareSize} ${cy} L ${cx + squareSize} ${cy - squareSize} L ${cx} ${cy - squareSize}" fill="none" stroke="${rightAngleColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (degrees === 180) {
        // For straight angle, show a small semicircle
        svg += `<path d="M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx - arcRadius} ${cy}" fill="none" stroke="${arcColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else {
        // Arc indicator - sweep counter-clockwise from first ray to second ray
        svg += `<path d="M ${arcX1} ${arcY1} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweepFlag} ${arcX2} ${arcY2}" fill="none" stroke="${arcColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    }

    // Vertex dot
    svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="${strokeColor}"/>`;

    // Degree label - position BELOW the angle to avoid overlap
    if (showLabel) {
        // Place label below the vertex, centered
        const labelX = cx + 20;
        const labelY = cy + 25;
        svg += `<text x="${labelX}" y="${labelY}" fill="${textColor}" font-family='${_DT_FONT}' font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${degrees}°</text>`;
    }

    svg += `</svg>`;
    return svg;
}

export function createRectangleSVG(length, width, showDimensions = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    const padding = 30;
    const maxDim = Math.max(length, width);
    const scale = 100 / maxDim;
    const rectW = length * scale;
    const rectH = width * scale;
    const svgW = rectW + padding * 2;
    const svgH = rectH + padding * 2;

    const _vbW = svgW + 20, _vbH = svgH + 20;
    const _sizeStyle = forPrint
        ? `width="${_vbW}" height="${_vbH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${_vbW}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${_vbW} ${_vbH}">`;

    // Rectangle
    svg += `<rect x="${padding}" y="${padding}" width="${rectW}" height="${rectH}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;

    // Right angle indicators
    const cornerSize = 8;
    svg += `<rect x="${padding}" y="${padding}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
    svg += `<rect x="${padding + rectW - cornerSize}" y="${padding}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
    svg += `<rect x="${padding}" y="${padding + rectH - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
    svg += `<rect x="${padding + rectW - cornerSize}" y="${padding + rectH - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;

    // Dimension labels
    if (showDimensions) {
        svg += `<text x="${padding + rectW / 2}" y="${padding - 8}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${length}</text>`;
        // text-anchor:end keeps the label to the LEFT of the rectangle no
        // matter how many digits the value has, so multi-digit dimensions
        // (100, 250, ...) never get clipped against the SVG edge.
        svg += `<text x="${padding - 6}" y="${padding + rectH / 2 + 5}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="end" dominant-baseline="middle">${width}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

export function createSquareSVG(side, showDimensions = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    const padding = 30; // Increased padding for label visibility
    const topPadding = showDimensions ? 20 : 0; // Extra top padding for label
    const size = 100;
    const svgWidth = size + padding * 2;
    const svgHeight = size + padding * 2 + topPadding;

    const _sizeStyle = forPrint
        ? `width="${svgWidth}" height="${svgHeight}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${svgWidth}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${svgWidth} ${svgHeight}">`;

    // Square - shifted down by topPadding. Use 18%-opacity wash of the
    // primary fill instead of the legacy "color + 33" CSS hack.
    const rectY = padding + topPadding;
    const squareFill = forPrint ? 'none' : _dtSoft(_DT_COLORS.primary);
    svg += `<rect x="${padding}" y="${rectY}" width="${size}" height="${size}" fill="${squareFill}" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}" rx="4"/>`;

    // Right angle indicator
    const cornerSize = 8;
    svg += `<rect x="${padding}" y="${rectY}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;

    // Dimension label - positioned above the square with clear visibility
    if (showDimensions) {
        svg += `<text x="${padding + size / 2}" y="${rectY - 8}" fill="${textColor}" font-family='${_DT_FONT}' font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${side}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

export function createTriangleSVG(type, base = 0, height = 0, showDimensions = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    const textColor = forPrint ? '#000' : _DT_COLORS.text;
    const heightColor = forPrint ? '#666' : _DT_COLORS.wrong;

    const padding = 30;
    const size = 120;
    let points, heightLine = '';

    if (type === 'equilateral') {
        // 3 equal sides, 3 equal 60° angles. Verified: angles ≈ 60°/60°/60°.
        const h = size * 0.866;
        points = `${padding + size/2},${padding} ${padding},${padding + h} ${padding + size},${padding + h}`;
    } else if (type === 'isosceles') {
        // 2 equal sides (the two legs from apex). Verified: angles ≈ 49.7°/65.2°/65.2°,
        // base ≠ legs, two equal base angles.
        const h = size * 0.9;
        points = `${padding + size/2},${padding} ${padding + 10},${padding + h} ${padding + size - 10},${padding + h}`;
    } else if (type === 'scalene') {
        // No equal sides AND no equal angles — VISIBLY scalene per shape-id spec.
        // With padding=30, size=120: vertices (40,30), (30,150), (160,80):
        //   side a = (30,150)→(160,80)  = √(130² + 70²)  = √(16900+4900) = √21800 ≈ 147.6
        //   side b = (40,30)→(160,80)   = √(120² + 50²)  = √(14400+2500) = √16900 = 130
        //   side c = (40,30)→(30,150)   = √(10²  + 120²) = √(100+14400)  = √14500 ≈ 120.4
        // Spread ≈ 23% (120 / 130 / 148) — clearly different.
        points = `${padding + 10},${padding} ${padding},${padding + size} ${padding + size + 10},${padding + size * 0.417}`;
    } else if (type === 'right') {
        // Exactly 90° at bottom-left vertex. Verified: angles 45°/90°/45°.
        points = `${padding},${padding} ${padding},${padding + size} ${padding + size},${padding + size}`;
    } else if (type === 'acute') {
        // ALL angles < 90°. Verified: angles ≈ 64.0°/58.0°/58.0°.
        points = `${padding + size/2},${padding} ${padding},${padding + size * 0.8} ${padding + size},${padding + size * 0.8}`;
    } else if (type === 'obtuse') {
        // ONE angle > 90°. Top vertex pulled left+down so the angle at the
        // bottom-left vertex becomes obtuse. Verified: angles ≈ 46.9°/104.9°/28.2°
        // (max angle at bottom-left = 105°). PRIOR coords (size*0.3, size*0.7)
        // produced max angle 68° — visually acute, breaking classify_triangles.
        points = `${padding - 20},${padding + 45} ${padding},${padding + size} ${padding + size},${padding + size}`;
    } else {
        // Default with base/height for area calculation
        const h = height > 0 ? (height / base) * size : size * 0.8;
        points = `${padding + size/2},${padding} ${padding},${padding + h} ${padding + size},${padding + h}`;
        if (showDimensions && base > 0) {
            heightLine = `<line x1="${padding + size/2}" y1="${padding}" x2="${padding + size/2}" y2="${padding + h}" stroke="${heightColor}" stroke-width="${_DT_STROKE.normal}" stroke-dasharray="5,3"/>`;
        }
    }

    // Dev-time assertion: verify the produced triangle actually exhibits its
    // claimed type. Prevents future drift between the rendered shape and the
    // answer key (the bug this helper was added to defend against).
    if (['right', 'acute', 'obtuse', 'equilateral', 'isosceles', 'scalene'].includes(type)) {
        try {
            const verts = points.trim().split(/\s+/).map(s => s.split(',').map(Number));
            const { byAngle, bySide } = _classifyTriangleFromPoints(verts);
            const expected = ['right', 'acute', 'obtuse'].includes(type) ? byAngle : bySide;
            if (expected !== type && typeof console !== 'undefined' && console.warn) {
                console.warn(`[createTriangleSVG] Type mismatch: requested "${type}" but rendered triangle classifies as "${expected}". points=${points}`);
            }
        } catch (_) { /* assertion is non-fatal */ }
    }

    const _vbW = size + padding * 2, _vbH = size + padding;
    const _sizeStyle = forPrint
        ? `width="${_vbW}" height="${_vbH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${_vbW}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${_vbW} ${_vbH}">`;
    svg += `<polygon points="${points}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    svg += heightLine;

    // Right angle indicator for right triangles — bolder marker per shape-id spec.
    if (type === 'right') {
        svg += `<rect x="${padding}" y="${padding + size - 12}" width="12" height="12" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    }

    // Dimension labels for area problems
    if (showDimensions && base > 0 && height > 0) {
        const h = (height / base) * size;
        svg += `<text x="${padding + size/2}" y="${padding + h + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">base = ${base}</text>`;
        svg += `<text x="${padding + size/2 + 8}" y="${padding + h/2}" fill="${heightColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="start" dominant-baseline="middle">h = ${height}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

export function createShapeSVG(shapeName, forPrint = false) {
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    const size = 100;
    const padding = 20;

    const _vbDim = size + padding * 2;
    const _sizeStyle = forPrint
        ? `width="${_vbDim}" height="${_vbDim}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${_vbDim}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${_vbDim} ${_vbDim}">`;

    const cx = size / 2 + padding;
    const cy = size / 2 + padding;
    const r = size / 2 - 5;

    if (shapeName === 'square') {
        svg += `<rect x="${padding + 5}" y="${padding + 5}" width="${size - 10}" height="${size - 10}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
        // Mark all four right angles with small corner squares so the figure
        // is unambiguously a square (per shape-id spec).
        const _sq = 8;
        svg += `<rect x="${padding + 5}" y="${padding + 5}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
        svg += `<rect x="${padding + size - 5 - _sq}" y="${padding + 5}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
        svg += `<rect x="${padding + 5}" y="${padding + size - 5 - _sq}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
        svg += `<rect x="${padding + size - 5 - _sq}" y="${padding + size - 5 - _sq}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
    } else if (shapeName === 'rectangle') {
        svg += `<rect x="${padding}" y="${padding + 15}" width="${size}" height="${size - 30}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
        // Mark right angles to distinguish rectangle from parallelogram.
        const _rsq = 8;
        svg += `<rect x="${padding}" y="${padding + 15}" width="${_rsq}" height="${_rsq}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
        svg += `<rect x="${padding + size - _rsq}" y="${padding + 15}" width="${_rsq}" height="${_rsq}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.hair}"/>`;
    } else if (shapeName === 'circle') {
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (shapeName === 'equilateral triangle') {
        // Proper equilateral: 3 equal sides. Use side length s = 2r·sin(60°) = r·√3.
        // Centroid sits at 1/3 from base; place apex at (cx, cy − 2h/3) and
        // base corners at (cx ± s/2, cy + h/3) where h = s·√3/2 = 1.5r.
        const _s = r * Math.sqrt(3);     // side length ≈ 1.732r
        const _h = _s * Math.sqrt(3) / 2; // height = 1.5r
        const _apexY = cy - 2 * _h / 3;
        const _baseY = cy + _h / 3;
        svg += `<polygon points="${cx},${_apexY} ${cx - _s/2},${_baseY} ${cx + _s/2},${_baseY}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (shapeName === 'regular hexagon') {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 90) * Math.PI / 180;
            points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        svg += `<polygon points="${points.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (shapeName === 'rhombus') {
        svg += `<polygon points="${cx},${cy - r} ${cx + r * 0.7},${cy} ${cx},${cy + r} ${cx - r * 0.7},${cy}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (shapeName === 'parallelogram') {
        const offset = 20;
        svg += `<polygon points="${padding + offset},${padding + 10} ${padding + size},${padding + 10} ${padding + size - offset},${padding + size - 10} ${padding},${padding + size - 10}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (shapeName === 'trapezoid') {
        svg += `<polygon points="${padding + 25},${padding + 10} ${padding + size - 25},${padding + 10} ${padding + size},${padding + size - 10} ${padding},${padding + size - 10}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (shapeName === 'isosceles triangle') {
        svg += `<polygon points="${cx},${cy - r} ${cx - r * 0.6},${cy + r * 0.6} ${cx + r * 0.6},${cy + r * 0.6}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    } else if (shapeName === 'kite') {
        // Two pairs of adjacent equal sides — short top pair, long bottom pair
        svg += `<polygon points="${cx},${cy - r} ${cx + r * 0.7},${cy - r * 0.1} ${cx},${cy + r} ${cx - r * 0.7},${cy - r * 0.1}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;
    }

    svg += `</svg>`;
    return svg;
}

export function create3DBoxSVG(length, width, height, forPrint = false) {
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    const dashColor = forPrint ? '#666' : _DT_COLORS.neutral;
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    // Isometric view
    const scale = 8;
    const l = length * scale;
    const w = width * scale;
    const h = height * scale;

    const svgW = l + w * 0.5 + 60;
    const svgH = h + w * 0.5 + 60;
    const ox = 30;
    const oy = svgH - 30;

    const _sizeStyle = forPrint
        ? `width="${svgW}" height="${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${svgW}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${svgW} ${svgH}">`;

    // Front face
    svg += `<polygon points="${ox},${oy} ${ox + l},${oy} ${ox + l},${oy - h} ${ox},${oy - h}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;

    // Top face
    svg += `<polygon points="${ox},${oy - h} ${ox + l},${oy - h} ${ox + l + w * 0.5},${oy - h - w * 0.3} ${ox + w * 0.5},${oy - h - w * 0.3}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;

    // Side face
    svg += `<polygon points="${ox + l},${oy} ${ox + l + w * 0.5},${oy - w * 0.3} ${ox + l + w * 0.5},${oy - h - w * 0.3} ${ox + l},${oy - h}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;

    // Hidden edges (dashed)
    svg += `<line x1="${ox}" y1="${oy}" x2="${ox + w * 0.5}" y2="${oy - w * 0.3}" stroke="${dashColor}" stroke-width="${_DT_STROKE.hair}" stroke-dasharray="4,3"/>`;
    svg += `<line x1="${ox + w * 0.5}" y1="${oy - w * 0.3}" x2="${ox + l + w * 0.5}" y2="${oy - w * 0.3}" stroke="${dashColor}" stroke-width="${_DT_STROKE.hair}" stroke-dasharray="4,3"/>`;
    svg += `<line x1="${ox + w * 0.5}" y1="${oy - w * 0.3}" x2="${ox + w * 0.5}" y2="${oy - h - w * 0.3}" stroke="${dashColor}" stroke-width="${_DT_STROKE.hair}" stroke-dasharray="4,3"/>`;

    // Dimension labels — explicit anchors so labels never collide with
    // the SVG edge for multi-digit dimensions.
    svg += `<text x="${ox + l / 2}" y="${oy + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">l=${length}</text>`;
    svg += `<text x="${ox - 4}" y="${oy - h / 2}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="end" dominant-baseline="middle">h=${height}</text>`;
    svg += `<text x="${ox + l + w * 0.25 + 6}" y="${oy - w * 0.15 + 5}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="start" dominant-baseline="middle">w=${width}</text>`;

    svg += `</svg>`;
    return svg;
}

// Create L-shaped composite figure SVG
export function createLShapeSVG(dims, forPrint = false) {
    // dims = { topWidth, topHeight, bottomWidth, totalHeight }
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    // 18%-opacity wash of the primary palette color, replaces ad-hoc rgba() pastel.
    const fillColor = forPrint ? '#fff8e7' : _dtSoft(_DT_COLORS.primary);
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    const scale = 12;
    const padding = 35;
    const tw = dims.topWidth * scale;
    const th = dims.topHeight * scale;
    const bw = dims.bottomWidth * scale;
    const totalH = dims.totalHeight * scale;
    const bottomH = totalH - th;

    const svgW = Math.max(tw, bw) + padding * 2;
    const svgH = totalH + padding * 2;

    const _sizeStyle = forPrint
        ? `width="${svgW}" height="${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${svgW}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${svgW} ${svgH}">`;

    // L-shape path (starting from top-left, going clockwise)
    const path = `M ${padding} ${padding}
                  L ${padding + tw} ${padding}
                  L ${padding + tw} ${padding + th}
                  L ${padding + bw} ${padding + th}
                  L ${padding + bw} ${padding + totalH}
                  L ${padding} ${padding + totalH} Z`;

    svg += `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;

    // Dimension labels — text-anchor on side labels keeps multi-digit
    // values from leaking past the SVG edge.
    // Top width
    svg += `<text x="${padding + tw/2}" y="${padding - 8}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${dims.topWidth}</text>`;
    // Top height (right side of top part)
    svg += `<text x="${padding + tw + 6}" y="${padding + th/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="start" dominant-baseline="middle">${dims.topHeight}</text>`;
    // Bottom width
    svg += `<text x="${padding + bw/2}" y="${padding + totalH + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${dims.bottomWidth}</text>`;
    // Total height (left side)
    svg += `<text x="${padding - 6}" y="${padding + totalH/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="end" dominant-baseline="middle">${dims.totalHeight}</text>`;

    svg += `</svg>`;
    return svg;
}

// Create T-shaped composite figure SVG
export function createTShapeSVG(dims, forPrint = false) {
    // dims = { topWidth, topHeight, stemWidth, stemHeight }
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    const fillColor = forPrint ? '#fff8e7' : _dtSoft(_DT_COLORS.primary);
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    const scale = 12;
    const padding = 35;
    const tw = dims.topWidth * scale;
    const th = dims.topHeight * scale;
    const sw = dims.stemWidth * scale;
    const sh = dims.stemHeight * scale;

    const svgW = tw + padding * 2;
    const svgH = th + sh + padding * 2;
    const stemOffset = (tw - sw) / 2;

    const _sizeStyle = forPrint
        ? `width="${svgW}" height="${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${svgW}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${svgW} ${svgH}">`;

    // T-shape path
    const path = `M ${padding} ${padding}
                  L ${padding + tw} ${padding}
                  L ${padding + tw} ${padding + th}
                  L ${padding + stemOffset + sw} ${padding + th}
                  L ${padding + stemOffset + sw} ${padding + th + sh}
                  L ${padding + stemOffset} ${padding + th + sh}
                  L ${padding + stemOffset} ${padding + th}
                  L ${padding} ${padding + th} Z`;

    svg += `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;

    // Dimension labels — anchor side labels so multi-digit dims fit.
    // Top width
    svg += `<text x="${padding + tw/2}" y="${padding - 8}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${dims.topWidth}</text>`;
    // Top height (left side)
    svg += `<text x="${padding - 6}" y="${padding + th/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="end" dominant-baseline="middle">${dims.topHeight}</text>`;
    // Stem width
    svg += `<text x="${padding + tw/2}" y="${padding + th + sh + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${dims.stemWidth}</text>`;
    // Stem height (right side)
    svg += `<text x="${padding + stemOffset + sw + 6}" y="${padding + th + sh/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="13" font-weight="bold" text-anchor="start" dominant-baseline="middle">${dims.stemHeight}</text>`;

    svg += `</svg>`;
    return svg;
}

// Create word problem shape SVG with dashed border and ? for dimensions
export function createWordProblemShapeSVG(length, width, showQuestionMarks = true, forPrint = false) {
    // Word-problem shape uses the categorical-orange palette token
    // instead of var(--accent-orange) so it's consistent across themes.
    const strokeColor = forPrint ? '#000' : _dtFill(2);
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    const scale = 12;
    const padding = 30;
    const w = length * scale;
    const h = width * scale;

    const svgW = w + padding * 2;
    const svgH = h + padding * 2;

    const _sizeStyle = forPrint
        ? `width="${svgW}" height="${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${svgW}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${svgW} ${svgH}">`;

    // Rectangle with dashed border
    svg += `<rect x="${padding}" y="${padding}" width="${w}" height="${h}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}" stroke-dasharray="8,4"/>`;

    // Dimension labels (with ? if showQuestionMarks) — text-anchor:end on
    // the side label keeps multi-digit width values inside the SVG.
    if (showQuestionMarks) {
        svg += `<text x="${padding + w/2}" y="${padding - 10}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">?</text>`;
        svg += `<text x="${padding - 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="end" dominant-baseline="middle">~</text>`;
    } else {
        svg += `<text x="${padding + w/2}" y="${padding - 10}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${length}</text>`;
        svg += `<text x="${padding - 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="end" dominant-baseline="middle">${width}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

// Create labeled rectangle SVG for area/perimeter (with all 4 sides labeled)
export function createLabeledRectSVG(length, width, forPrint = false) {
    const strokeColor = forPrint ? '#000' : _DT_COLORS.primary;
    // 18%-opacity wash of the primary fill replaces the magic rgba() pastel.
    const fillColor = forPrint ? '#fff8e7' : _dtSoft(_DT_COLORS.primary);
    const textColor = forPrint ? '#000' : _DT_COLORS.text;

    const scale = 10;
    const padding = 30;
    const w = length * scale;
    const h = width * scale;

    const svgW = w + padding * 2;
    const svgH = h + padding * 2;

    const _sizeStyle = forPrint
        ? `width="${svgW}" height="${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`
        : `style="display:block;width:100%;height:auto;max-width:${svgW}px;-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;"`;
    let svg = `<svg ${_sizeStyle} viewBox="0 0 ${svgW} ${svgH}">`;

    // Rectangle
    svg += `<rect x="${padding}" y="${padding}" width="${w}" height="${h}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}"/>`;

    // All 4 dimension labels — anchor side labels so multi-digit values
    // don't bleed past the rectangle / SVG edge.
    svg += `<text x="${padding + w/2}" y="${padding - 8}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${length}</text>`;
    svg += `<text x="${padding + w/2}" y="${padding + h + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${length}</text>`;
    svg += `<text x="${padding - 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="end" dominant-baseline="middle">${width}</text>`;
    svg += `<text x="${padding + w + 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="start" dominant-baseline="middle">${width}</text>`;

    svg += `</svg>`;
    return svg;
}

