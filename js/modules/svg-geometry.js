import { randInt } from './utils.js';
import { COLORS, STROKE, FONTS, categoricalFill, softFill, palette, MONO, MONO_STROKE, dotAttrs } from './design-tokens.js';

// Black & white support. Every builder below takes its existing trailing
// `forPrint` argument, which may now ALSO be an options object:
//   createSquareSVG(5, true, true)             -> print + mono (as before)
//   createSquareSVG(5, true, { mono: true })   -> mono on screen
//   createSquareSVG(5, true, { forPrint: true, mono: false }) -> opt out
// See WORKSHEET_DESIGN_STANDARD.md INK-1..INK-13, LS-1..LS-8, RP-2.
function _pal(o) { return palette(o); }
// `forPrint` is consumed in two places: colour AND absolute sizing. The
// sizing half reads this.
function _isPrint(o) { return !!(o && typeof o === 'object' ? o.forPrint : o); }

// Single source of truth — alias to imported tokens.
const _DT_COLORS = COLORS;
const _DT_STROKE = STROKE;
const _DT_FONT = FONTS.sans;
function _dtFill(i) { return categoricalFill(i); }
// 18% opacity wash (e.g. "#1e88e5" -> "#1e88e52E").
function _dtSoft(hex) { return softFill(hex); }

// CSS-var-with-fallback wrapper for dark-mode support.
// Browsers resolve var(--name, #hex) inside inline-SVG attributes.
// Hex fallback keeps print contexts and old browsers safe.
function _cv(name, hex) { return `var(--${name}, ${hex})`; }
const _C_PAPER = _cv('mq-paper', _DT_COLORS.bg);
const _C_INK = _cv('mq-ink', _DT_COLORS.text);
const _C_AXIS = _cv('mq-ink', _DT_COLORS.axis);
const _C_PRIMARY = _cv('mq-purple', _DT_COLORS.primary);
const _C_PRIMARY_DARK = _cv('mq-purple-d', _DT_COLORS.primaryDark);
const _C_MUTED = _cv('mq-muted', _DT_COLORS.neutral);
const _C_RULE = _cv('mq-rule', _DT_COLORS.grid);

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
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    const arcColor = P.mono ? P.ink : _C_PRIMARY;
    // MEANING-BEARING COLOUR: the right-angle marker was red. The meaning is
    // carried by the SQUARE CORNER glyph itself (INK-6), so mono drops the
    // hue and keeps the shape.
    const rightAngleColor = P.mono ? P.ink : _DT_COLORS.wrong;
    const textColor = P.mono ? P.ink : _C_INK;

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
    svg += `<line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.bold)}" stroke-linecap="round"/>`;

    // Second ray (at angle)
    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.bold)}" stroke-linecap="round"/>`;

    // Right angle indicator (small square) for exactly 90 degrees
    if (degrees === 90) {
        const squareSize = 14;
        // Draw square in the corner of the angle
        svg += `<path d="M ${cx + squareSize} ${cy} L ${cx + squareSize} ${cy - squareSize} L ${cx} ${cy - squareSize}" fill="none" stroke="${rightAngleColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (degrees === 180) {
        // For straight angle, show a small semicircle
        svg += `<path d="M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx - arcRadius} ${cy}" fill="none" stroke="${arcColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else {
        // Arc indicator - sweep counter-clockwise from first ray to second ray
        svg += `<path d="M ${arcX1} ${arcY1} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweepFlag} ${arcX2} ${arcY2}" fill="none" stroke="${arcColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
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
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    const textColor = P.mono ? P.ink : _C_INK;

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
    svg += `<rect x="${padding}" y="${padding}" width="${rectW}" height="${rectH}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;

    // Right angle indicators
    const cornerSize = 8;
    svg += `<rect x="${padding}" y="${padding}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
    svg += `<rect x="${padding + rectW - cornerSize}" y="${padding}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
    svg += `<rect x="${padding}" y="${padding + rectH - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
    svg += `<rect x="${padding + rectW - cornerSize}" y="${padding + rectH - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;

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
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    const textColor = P.mono ? P.ink : _C_INK;

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
    // INK-2: no decorative wash on paper.
    const squareFill = P.mono ? 'none' : _dtSoft(_C_PRIMARY);
    svg += `<rect x="${padding}" y="${rectY}" width="${size}" height="${size}" fill="${squareFill}" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}" rx="${P.mono ? 0 : 4}"/>`;

    // Right angle indicator
    const cornerSize = 8;
    svg += `<rect x="${padding}" y="${rectY}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;

    // Dimension label - positioned above the square with clear visibility
    if (showDimensions) {
        svg += `<text x="${padding + size / 2}" y="${rectY - 8}" fill="${textColor}" font-family='${_DT_FONT}' font-size="16" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${side}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

export function createTriangleSVG(type, base = 0, height = 0, showDimensions = true, forPrint = false) {
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    const textColor = P.mono ? P.ink : _C_INK;
    // MEANING-BEARING COLOUR: the height line and its "h =" label were red so
    // the height would not be mistaken for a side. In mono the cue becomes a
    // DOTTED construction line (LS-1) plus the existing "h =" label, and the
    // label itself is ink because a pupil has to read it (INK-3).
    const heightColor = P.mono ? P.ink : _DT_COLORS.wrong;
    const heightLabelColor = P.mono ? P.ink : _DT_COLORS.wrong;

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
            // The height is a construction guide, so in mono it is a dotted
            // line: 1 pt round dots at 1.2 mm pitch (LS-1), not a dash.
            heightLine = P.mono
                ? `<line x1="${padding + size/2}" y1="${padding}" x2="${padding + size/2}" y2="${padding + h}" ${dotAttrs(heightColor)}/>`
                : `<line x1="${padding + size/2}" y1="${padding}" x2="${padding + size/2}" y2="${padding + h}" stroke="${heightColor}" stroke-width="${_DT_STROKE.normal}" stroke-dasharray="5,3"/>`;
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
    svg += `<polygon points="${points}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    svg += heightLine;

    // Right angle indicator for right triangles — bolder marker per shape-id spec.
    if (type === 'right') {
        svg += `<rect x="${padding}" y="${padding + size - 12}" width="12" height="12" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    }

    // Dimension labels for area problems
    if (showDimensions && base > 0 && height > 0) {
        const h = (height / base) * size;
        svg += `<text x="${padding + size/2}" y="${padding + h + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">base = ${base}</text>`;
        svg += `<text x="${padding + size/2 + 8}" y="${padding + h/2}" fill="${heightLabelColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="start" dominant-baseline="middle">h = ${height}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

export function createShapeSVG(shapeName, forPrint = false) {
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
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
        svg += `<rect x="${padding + 5}" y="${padding + 5}" width="${size - 10}" height="${size - 10}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
        // Mark all four right angles with small corner squares so the figure
        // is unambiguously a square (per shape-id spec).
        const _sq = 8;
        svg += `<rect x="${padding + 5}" y="${padding + 5}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
        svg += `<rect x="${padding + size - 5 - _sq}" y="${padding + 5}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
        svg += `<rect x="${padding + 5}" y="${padding + size - 5 - _sq}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
        svg += `<rect x="${padding + size - 5 - _sq}" y="${padding + size - 5 - _sq}" width="${_sq}" height="${_sq}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
    } else if (shapeName === 'rectangle') {
        svg += `<rect x="${padding}" y="${padding + 15}" width="${size}" height="${size - 30}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
        // Mark right angles to distinguish rectangle from parallelogram.
        const _rsq = 8;
        svg += `<rect x="${padding}" y="${padding + 15}" width="${_rsq}" height="${_rsq}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
        svg += `<rect x="${padding + size - _rsq}" y="${padding + 15}" width="${_rsq}" height="${_rsq}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
    } else if (shapeName === 'circle') {
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (shapeName === 'equilateral triangle') {
        // Proper equilateral: 3 equal sides. Use side length s = 2r·sin(60°) = r·√3.
        // Centroid sits at 1/3 from base; place apex at (cx, cy − 2h/3) and
        // base corners at (cx ± s/2, cy + h/3) where h = s·√3/2 = 1.5r.
        const _s = r * Math.sqrt(3);     // side length ≈ 1.732r
        const _h = _s * Math.sqrt(3) / 2; // height = 1.5r
        const _apexY = cy - 2 * _h / 3;
        const _baseY = cy + _h / 3;
        svg += `<polygon points="${cx},${_apexY} ${cx - _s/2},${_baseY} ${cx + _s/2},${_baseY}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (shapeName === 'regular hexagon') {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 90) * Math.PI / 180;
            points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        svg += `<polygon points="${points.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (shapeName === 'rhombus') {
        svg += `<polygon points="${cx},${cy - r} ${cx + r * 0.7},${cy} ${cx},${cy + r} ${cx - r * 0.7},${cy}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (shapeName === 'parallelogram') {
        const offset = 20;
        svg += `<polygon points="${padding + offset},${padding + 10} ${padding + size},${padding + 10} ${padding + size - offset},${padding + size - 10} ${padding},${padding + size - 10}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (shapeName === 'trapezoid') {
        svg += `<polygon points="${padding + 25},${padding + 10} ${padding + size - 25},${padding + 10} ${padding + size},${padding + size - 10} ${padding},${padding + size - 10}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (shapeName === 'isosceles triangle') {
        svg += `<polygon points="${cx},${cy - r} ${cx - r * 0.6},${cy + r * 0.6} ${cx + r * 0.6},${cy + r * 0.6}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else if (shapeName === 'kite') {
        // Two pairs of adjacent equal sides — short top pair, long bottom pair
        svg += `<polygon points="${cx},${cy - r} ${cx + r * 0.7},${cy - r * 0.1} ${cx},${cy + r} ${cx - r * 0.7},${cy - r * 0.1}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    }

    svg += `</svg>`;
    return svg;
}

export function create3DBoxSVG(length, width, height, forPrint = false) {
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    // Hidden edges of a solid are 0.5 pt SOLID ink — LS-2 names them
    // explicitly ("Hidden edges of solids are 0.5 pt solid; guides are
    // dotted") and RP-122 repeats it. They are neither dashed nor dotted.
    const dashColor = P.mono ? P.ink : _C_MUTED;
    const hiddenW = P.mono ? MONO_STROKE.fine : _DT_STROKE.hair;
    const hiddenDash = P.mono ? 'none' : '4,3';
    const textColor = P.mono ? P.ink : _C_INK;

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
    svg += `<polygon points="${ox},${oy} ${ox + l},${oy} ${ox + l},${oy - h} ${ox},${oy - h}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;

    // Top face
    svg += `<polygon points="${ox},${oy - h} ${ox + l},${oy - h} ${ox + l + w * 0.5},${oy - h - w * 0.3} ${ox + w * 0.5},${oy - h - w * 0.3}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;

    // Side face
    svg += `<polygon points="${ox + l},${oy} ${ox + l + w * 0.5},${oy - w * 0.3} ${ox + l + w * 0.5},${oy - h - w * 0.3} ${ox + l},${oy - h}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;

    // Hidden edges (dashed)
    svg += `<line x1="${ox}" y1="${oy}" x2="${ox + w * 0.5}" y2="${oy - w * 0.3}" stroke="${dashColor}" stroke-width="${hiddenW}" stroke-dasharray="${hiddenDash}"/>`;
    svg += `<line x1="${ox + w * 0.5}" y1="${oy - w * 0.3}" x2="${ox + l + w * 0.5}" y2="${oy - w * 0.3}" stroke="${dashColor}" stroke-width="${hiddenW}" stroke-dasharray="${hiddenDash}"/>`;
    svg += `<line x1="${ox + w * 0.5}" y1="${oy - w * 0.3}" x2="${ox + w * 0.5}" y2="${oy - h - w * 0.3}" stroke="${dashColor}" stroke-width="${hiddenW}" stroke-dasharray="${hiddenDash}"/>`;

    // Dimension labels — explicit anchors so labels never collide with
    // the SVG edge for multi-digit dimensions.
    svg += `<text x="${ox + l / 2}" y="${oy + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle" dominant-baseline="middle">l=${length}</text>`;
    svg += `<text x="${ox - 4}" y="${oy - h / 2}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="end" dominant-baseline="middle">h=${height}</text>`;
    svg += `<text x="${ox + l + w * 0.25 + 6}" y="${oy - w * 0.15 + 5}" fill="${textColor}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="start" dominant-baseline="middle">w=${width}</text>`;

    svg += `</svg>`;
    return svg;
}

// Create L-shaped composite figure SVG
// showDecomposition (default true): shade the 2 component rectangles in
// different colors so the L visibly decomposes into "top piece" + "bottom piece".
export function createLShapeSVG(dims, forPrint = false, showDecomposition = true) {
    // dims = { topWidth, topHeight, bottomWidth, totalHeight }
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    // 18%-opacity wash of the primary palette color, replaces ad-hoc rgba() pastel.
    const fillColor = P.mono ? 'none' : _dtSoft(_C_PRIMARY);
    const textColor = P.mono ? P.ink : _C_INK;

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

    if (showDecomposition) {
        // Two-piece decomposition: top rectangle (topWidth × topHeight)
        // + bottom rectangle (bottomWidth × bottomHeight). Render the shaded
        // pieces, then the polygon outline on top with fill="none" so the
        // colors show through.
        // MEANING-BEARING COLOUR: piece A vs piece B of the decomposition.
        // Mono keeps the distinction with grey-against-paper (INK-3a) PLUS an
        // explicit cut line between the two pieces and an A / B label, so it
        // never rests on the fill alone (INK-6, AX-2).
        const c1 = P.mono ? P.grey : '#e3f2fd'; // light blue — top piece
        const c2 = P.mono ? P.paper : '#fff3e0'; // light orange — bottom piece
        svg += `<rect x="${padding}" y="${padding}" width="${tw}" height="${th}" fill="${c1}" stroke="none" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"/>`;
        svg += `<rect x="${padding}" y="${padding + th}" width="${bw}" height="${bottomH}" fill="${c2}" stroke="none" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"/>`;
        if (P.mono) {
            // The line where the two pieces meet.
            svg += `<line x1="${padding}" y1="${padding + th}" x2="${padding + tw}" y2="${padding + th}" stroke="${P.ink}" stroke-width="${MONO_STROKE.grey}"/>`;
            svg += `<text x="${padding + tw / 2}" y="${padding + th / 2 + 4}" fill="${P.ink}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle">A</text>`;
            svg += `<text x="${padding + bw / 2}" y="${padding + th + bottomH / 2 + 4}" fill="${P.ink}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle">B</text>`;
        }
        svg += `<path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else {
        svg += `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    }

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
// showDecomposition (default true): shade the 2 component rectangles in
// different colors so the T visibly decomposes into "top bar" + "stem".
export function createTShapeSVG(dims, forPrint = false, showDecomposition = true) {
    // dims = { topWidth, topHeight, stemWidth, stemHeight }
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    const fillColor = P.mono ? 'none' : _dtSoft(_C_PRIMARY);
    const textColor = P.mono ? P.ink : _C_INK;

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

    if (showDecomposition) {
        // Two-piece decomposition: top bar + stem.
        // MEANING-BEARING COLOUR: top bar vs stem — same treatment as the
        // L-shape: grey / paper plus a meeting line and A / B labels.
        const c1 = P.mono ? P.grey : '#e3f2fd'; // light blue — top bar
        const c2 = P.mono ? P.paper : '#fff3e0'; // light orange — stem
        svg += `<rect x="${padding}" y="${padding}" width="${tw}" height="${th}" fill="${c1}" stroke="none" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"/>`;
        svg += `<rect x="${padding + stemOffset}" y="${padding + th}" width="${sw}" height="${sh}" fill="${c2}" stroke="none" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;"/>`;
        if (P.mono) {
            svg += `<line x1="${padding + stemOffset}" y1="${padding + th}" x2="${padding + stemOffset + sw}" y2="${padding + th}" stroke="${P.ink}" stroke-width="${MONO_STROKE.grey}"/>`;
            svg += `<text x="${padding + tw / 2}" y="${padding + th / 2 + 4}" fill="${P.ink}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle">A</text>`;
            svg += `<text x="${padding + stemOffset + sw / 2}" y="${padding + th + sh / 2 + 4}" fill="${P.ink}" font-family='${_DT_FONT}' font-size="12" font-weight="bold" text-anchor="middle">B</text>`;
        }
        svg += `<path d="${path}" fill="none" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    } else {
        svg += `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    }

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
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _dtFill(2);
    const textColor = P.mono ? P.ink : _C_INK;

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
    // LS-1/LS-4: the "sketch this shape" outline becomes dotted in mono — 1 pt
    // round dots at 1.2 mm pitch; a dash is reserved for cut lines and
    // missing-digit slots.
    svg += P.mono
        ? `<rect x="${padding}" y="${padding}" width="${w}" height="${h}" fill="none" ${dotAttrs(strokeColor)}/>`
        : `<rect x="${padding}" y="${padding}" width="${w}" height="${h}" fill="none" stroke="${strokeColor}" stroke-width="${_DT_STROKE.normal}" stroke-dasharray="8,4"/>`;

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
    const P = _pal(forPrint);
    forPrint = _isPrint(forPrint);
    const strokeColor = P.mono ? P.ink : _C_PRIMARY;
    // 18%-opacity wash of the primary fill replaces the magic rgba() pastel.
    const fillColor = P.mono ? 'none' : _dtSoft(_C_PRIMARY);
    const textColor = P.mono ? P.ink : _C_INK;

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
    svg += `<rect x="${padding}" y="${padding}" width="${w}" height="${h}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;

    // All 4 dimension labels — anchor side labels so multi-digit values
    // don't bleed past the rectangle / SVG edge.
    svg += `<text x="${padding + w/2}" y="${padding - 8}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${length}</text>`;
    svg += `<text x="${padding + w/2}" y="${padding + h + 18}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="middle" dominant-baseline="middle">${length}</text>`;
    svg += `<text x="${padding - 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="end" dominant-baseline="middle">${width}</text>`;
    svg += `<text x="${padding + w + 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-family='${_DT_FONT}' font-size="14" font-weight="bold" text-anchor="start" dominant-baseline="middle">${width}</text>`;

    svg += `</svg>`;
    return svg;
}


// O6 appearance (lane AP2, 2026-09-25): a bar graph standing up or LYING DOWN, for the "Bars"
// choice of bar_graph and bar_graph_intro. Lying down, it draws the same data as the standing graph
// of each skill — the same scale numbers (`ticks`), the same bar-end values when the standing graph
// shows them (`valueLabels`) — turned on its side: categories down the left, the scale along the
// bottom. The printed cell draws both orientations with it (black and white, a whole-number scale,
// every bar named: the old print graph named no bar and numbered its scale 2.8, 5.7 …).
// `forPrint` / mono as every builder above; print is sized to sit two to a row.
//   { categories: string[], values: number[], max, ticks: number[], valueLabels, orientation, forPrint }
export function createBarGraphSVG({ categories = [], values = [], max = 5, ticks = null, valueLabels = false, orientation = 'horizontal', forPrint = false } = {}) {
    const P = _pal(forPrint);
    const ink = P.mono ? P.ink : _C_INK;
    const rule = P.mono ? P.rule : _C_RULE;
    const barFill = P.mono ? P.shade() : _dtSoft(_DT_COLORS.primary);
    const barStroke = P.mono ? P.ink : _C_PRIMARY;
    const safeMax = Math.max(1, max);
    const tickList = Array.isArray(ticks) && ticks.length ? ticks : Array.from({ length: safeMax + 1 }, (_, i) => i);
    const longest = categories.reduce((m, c) => Math.max(m, String(c).length), 0);
    // Print is sized to sit two to a row in a worksheet cell; the screen card draws it larger.
    const fs = _isPrint(forPrint) ? 12 : 14;
    const charW = fs * (_isPrint(forPrint) ? 0.66 : 0.6);
    const top = 14;
    const txt = (x, y, s, extra = '') => `<text x="${x}" y="${y}" font-size="${fs}" fill="${ink}" ${extra}>${s}</text>`;
    let grid = '', bars = '', axes = '', W, H;
    if (orientation === 'vertical') {
        const plotH = _isPrint(forPrint) ? 120 : 260;
        // A slot fits a name of up to 6 letters; a longer name (Strawberries, Basketball) is
        // written on a slant under its bar, so five bars still sit two graphs to a row.
        const slot = Math.max(_isPrint(forPrint) ? 44 : 80, Math.round(Math.min(longest, 6) * charW) + (_isPrint(forPrint) ? 8 : 12));
        const slant = longest * charW > slot - 4;
        // Room for the scale numbers, and for the first slanted name to run left of its bar.
        const left = Math.max(16 + Math.max(...tickList.map(t => String(t).length)) * charW,
            slant ? Math.round(longest * charW * 0.77 - slot / 2 + 6) : 0);
        const barW = Math.round(slot * 0.62);
        const plotW = categories.length * slot;
        W = left + plotW + 10;
        H = top + plotH + 30 + (slant ? Math.round(longest * charW * 0.64) : 0);
        const yAt = v => top + plotH - (v / safeMax) * plotH;
        for (const t of tickList) {
            const y = yAt(t);
            grid += `<line x1="${left}" y1="${y}" x2="${left + plotW}" y2="${y}" stroke="${rule}" stroke-width="${_DT_STROKE.hair}"/>`;
            grid += txt(left - 6, y + fs * 0.35, t, 'text-anchor="end"');
        }
        categories.forEach((c, i) => {
            const x = left + i * slot + (slot - barW) / 2;
            const y = yAt(values[i] || 0);
            if (values[i] > 0) bars += `<rect x="${x}" y="${y}" width="${barW}" height="${top + plotH - y}" fill="${barFill}" stroke="${barStroke}" stroke-width="${_DT_STROKE.normal}"/>`;
            if (valueLabels) bars += txt(x + barW / 2, y - 6, values[i], 'text-anchor="middle" font-weight="700"');
            const lx = x + barW / 2, ly = top + plotH + fs + 6;
            bars += slant
                ? txt(lx + fs * 0.4, ly - fs * 0.3, c, `text-anchor="end" font-weight="700" transform="rotate(-40 ${lx + fs * 0.4} ${ly - fs * 0.3})"`)
                : txt(lx, ly, c, 'text-anchor="middle" font-weight="700"');
        });
        axes = `<line x1="${left}" y1="${top}" x2="${left}" y2="${top + plotH}" stroke="${ink}" stroke-width="${_DT_STROKE.bold}"/>`
            + `<line x1="${left}" y1="${top + plotH}" x2="${left + plotW}" y2="${top + plotH}" stroke="${ink}" stroke-width="${_DT_STROKE.bold}"/>`;
    } else {
        const left = Math.max(_isPrint(forPrint) ? 56 : 70, Math.round(longest * charW) + 16);
        const plotW = _isPrint(forPrint) ? 220 : 440;
        const barH = _isPrint(forPrint) ? 26 : 40;
        const gap = _isPrint(forPrint) ? 10 : 18;
        const plotH = categories.length * (barH + gap) + gap;
        W = left + plotW + (valueLabels ? 44 : 16);
        H = top + plotH + 30;
        const xAt = v => left + (v / safeMax) * plotW;
        for (const t of tickList) {
            const x = xAt(t);
            grid += `<line x1="${x}" y1="${top}" x2="${x}" y2="${top + plotH}" stroke="${rule}" stroke-width="${_DT_STROKE.hair}"/>`;
            grid += txt(x, top + plotH + fs + 6, t, 'text-anchor="middle"');
        }
        categories.forEach((c, i) => {
            const y = top + gap + i * (barH + gap);
            const w = Math.max(0, xAt(values[i] || 0) - left);
            bars += txt(left - 8, y + barH / 2 + fs * 0.35, c, 'text-anchor="end" font-weight="700"');
            if (w > 0) bars += `<rect x="${left}" y="${y}" width="${w}" height="${barH}" fill="${barFill}" stroke="${barStroke}" stroke-width="${_DT_STROKE.normal}"/>`;
            if (valueLabels) bars += txt(left + w + 8, y + barH / 2 + fs * 0.35, values[i], 'font-weight="700"');
        });
        axes = `<line x1="${left}" y1="${top}" x2="${left}" y2="${top + plotH}" stroke="${ink}" stroke-width="${_DT_STROKE.bold}"/>`
            + `<line x1="${left}" y1="${top + plotH}" x2="${left + plotW}" y2="${top + plotH}" stroke="${ink}" stroke-width="${_DT_STROKE.bold}"/>`;
    }
    W = Math.round(W); H = Math.round(H);
    const kind = orientation === 'vertical' ? 'standing up' : 'lying down';
    return `<svg class="bar-graph-${orientation}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet" style="display:block;margin:0 auto;width:100%;max-width:${W}px;height:auto;" role="img" aria-label="Bar graph with bars ${kind}">${grid}${bars}${axes}</svg>`;
}

/** A whole-number scale for a bar graph: a step of 1, 2, 5, 10 … so that about `n` lines fit. */
export function barGraphScale(top, n = 6) {
    const t = Math.max(1, top);
    const step = [1, 2, 5, 10, 20, 25, 50, 100].find(s => t / s <= n) || Math.ceil(t / n);
    const max = Math.ceil(t / step) * step;
    const ticks = [];
    for (let v = 0; v <= max; v += step) ticks.push(v);
    return { max, ticks };
}

// O6 appearance (lane AP2, 2026-09-25): a thermometer to READ, for temperature's "What
// temperature is shown?" items (it had none on screen: the card printed the answer in large type,
// and the print cell drew a 0-100 tube the item's -10 to 40 range did not fit). One mark for every
// degree, a longer mark every 5, and the scale numbered every `every` degrees (5 or 10: the
// "Figure labels" choice). The column is solid ink to the reading; black and white on paper.
//   { temp, unit: '°C' | '°F', min = -10, max = 40, every = 5, forPrint }
export function createThermometerSVG({ temp = 0, unit = '°C', min = -10, max = 40, every = 5, forPrint = false } = {}) {
    const P = _pal(forPrint);
    const ink = P.mono ? P.ink : _C_INK;
    const paper = P.mono ? P.paper : _C_PAPER;
    const perDeg = 6;
    const top = 22;
    const tubeX = 70, tubeW = 18;
    const H0 = top + (max - min) * perDeg;       // y of the lowest mark
    const yAt = t => H0 - (t - min) * perDeg;
    const bulbR = 17;
    const bulbCy = H0 + 26;
    const H = bulbCy + bulbR + 10;
    const W = 170;
    let marks = '';
    for (let t = min; t <= max; t++) {
        const y = yAt(t);
        const long = t % 5 === 0;
        const len = t % 10 === 0 ? 20 : long ? 15 : 8;
        marks += `<line x1="${tubeX + tubeW}" y1="${y}" x2="${tubeX + tubeW + len}" y2="${y}" stroke="${ink}" stroke-width="${long ? _DT_STROKE.normal : _DT_STROKE.hair}"/>`;
        if (t % every === 0) {
            marks += `<text x="${tubeX + tubeW + 26}" y="${y + 5}" font-size="15" font-weight="${t % 10 === 0 ? 700 : 400}" fill="${ink}">${t}</text>`;
        }
    }
    const clamped = Math.max(min, Math.min(max, temp));
    const colTop = yAt(clamped);
    const column = `<rect x="${tubeX + 5}" y="${colTop}" width="${tubeW - 10}" height="${bulbCy - colTop}" fill="${ink}"/>`;
    const tube = `<rect x="${tubeX}" y="${top - 12}" width="${tubeW}" height="${bulbCy - top + 12}" rx="${tubeW / 2}" fill="${paper}" stroke="${ink}" stroke-width="${_DT_STROKE.normal}"/>`;
    const bulb = `<circle cx="${tubeX + tubeW / 2}" cy="${bulbCy}" r="${bulbR}" fill="${ink}" stroke="${ink}" stroke-width="${_DT_STROKE.normal}"/>`;
    const unitLabel = `<text x="${tubeX - 12}" y="${top + 4}" text-anchor="end" font-size="16" font-weight="700" fill="${ink}">${unit}</text>`;
    return `<svg class="thermometer" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid meet" style="display:block;margin:0 auto;max-width:100%;height:auto;" role="img" aria-label="Thermometer in ${unit === '°F' ? 'degrees Fahrenheit' : 'degrees Celsius'}">${tube}${column}${bulb}${marks}${unitLabel}</svg>`;
}

/**
 * AP2 (2026-09-25): the drawn size of a labelled rectangle whose sides are `len` (across) by
 * `wid` (up), in the same proportion as its numbers, inside `maxW` x `maxH` and never thinner
 * than `minSide` (a 10 by 2 rectangle still has room for its labels). A square is drawn square.
 */
export function rectBoxFor(len, wid, { maxW = 120, maxH = 80, minSide = 28 } = {}) {
    const l = Math.max(1, Number(len) || 1), w = Math.max(1, Number(wid) || 1);
    const u = Math.min(maxW / l, maxH / w);
    return { w: Math.round(Math.max(minSide, l * u)), h: Math.round(Math.max(minSide, w * u)) };
}

/**
 * AP2 (2026-09-25): the labelled L- or T-shape of composite_shapes' "Find the perimeter" items,
 * every outside side numbered, drawn to scale — the printed twin of the generator's screen
 * figure (the print cell used to draw one fixed shape whatever the item said).
 *   kind 'L': dims { lFW, lFH, lCW, lCH }  (a full lFW x lFH block, its top-right lCW x lCH cut out)
 *   kind 'T': dims { tTW, tTH, tSW, tSH }  (a tTW x tTH bar, a tSW x tSH stem centred under it)
 */
export function createLabeledStepShapeSVG(kind, dims, forPrint = false) {
    const P = _pal(forPrint);
    const ink = P.mono ? P.ink : _C_INK;
    const stroke = P.mono ? P.ink : _C_PRIMARY;
    const fill = P.mono ? 'none' : _dtSoft(_DT_COLORS.primary);
    const pad = 34;
    const fs = 15;
    const t = (x, y, s, anchor = 'middle') => `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${ink}" font-size="${fs}" font-weight="700" text-anchor="${anchor}" dominant-baseline="middle">${s}</text>`;
    let pts, labels, W, H;
    if (kind === 'T') {
        const { tTW, tTH, tSW, tSH } = dims;
        const u = Math.min(200 / tTW, 150 / (tTH + tSH));
        const TW = tTW * u, TH = tTH * u, SW = tSW * u, SH = tSH * u, sh = (TW - SW) / 2;
        W = TW + pad * 2; H = TH + SH + pad * 2;
        const o = pad;
        pts = [[o, o], [o + TW, o], [o + TW, o + TH], [o + TW - sh, o + TH], [o + TW - sh, o + TH + SH], [o + sh, o + TH + SH], [o + sh, o + TH], [o, o + TH]];
        const shelf = (tTW - tSW) / 2;
        labels = t(o + TW / 2, o - 12, tTW) + t(o + TW + 8, o + TH / 2, tTH, 'start')
            + t(o + TW - sh / 2, o + TH + 12, shelf) + t(o + TW - sh + 8, o + TH + SH / 2, tSH, 'start')
            + t(o + TW / 2, o + TH + SH + 14, tSW) + t(o + sh - 8, o + TH + SH / 2, tSH, 'end')
            + t(o + sh / 2, o + TH + 12, shelf) + t(o - 8, o + TH / 2, tTH, 'end');
    } else {
        const { lFW, lFH, lCW, lCH } = dims;
        const u = Math.min(200 / lFW, 150 / lFH);
        const FW = lFW * u, FH = lFH * u, CW = lCW * u, CH = lCH * u;
        W = FW + pad * 2; H = FH + pad * 2;
        const o = pad;
        pts = [[o, o], [o + FW - CW, o], [o + FW - CW, o + CH], [o + FW, o + CH], [o + FW, o + FH], [o, o + FH]];
        labels = t(o + (FW - CW) / 2, o - 12, lFW - lCW) + t(o + FW - CW + 8, o + CH / 2, lCH, 'start')
            + t(o + FW - CW / 2, o + CH - 12, lCW) + t(o + FW + 8, o + CH + (FH - CH) / 2, lFH - lCH, 'start')
            + t(o + FW / 2, o + FH + 14, lFW) + t(o - 8, o + FH / 2, lFH, 'end');
    }
    W = Math.round(W); H = Math.round(H);
    const poly = `<polygon points="${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${P.sw(_DT_STROKE.bold)}" stroke-linejoin="round"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="display:block;margin:0 auto;max-width:100%;height:auto;" role="img" aria-label="${kind === 'T' ? 'T' : 'L'}-shape with its sides labelled">${poly}${labels}</svg>`;
}
