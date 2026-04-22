import { randInt } from './utils.js';

export function createAngleSVG(degrees, size = 120, showLabel = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const arcColor = forPrint ? '#333' : 'var(--accent-green)';
    const textColor = forPrint ? '#000' : 'currentColor';
    
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
    
    // Sweep flag: 1 for counter-clockwise (positive angle)
    const sweepFlag = 1;
    // Large arc flag: 0 for angles <= 180
    const largeArc = degrees > 180 ? 1 : 0;
    
    // Calculate SVG viewBox to ensure everything fits
    const padding = 20;
    const minX = Math.min(cx, x1, x2, arcX1, arcX2) - padding;
    const maxX = Math.max(cx, x1, x2, arcX1, arcX2) + padding;
    const minY = Math.min(cy, y1, y2, arcY1, arcY2) - padding;
    const maxY = Math.max(cy, y1, y2, arcY1, arcY2) + padding;
    
    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // First ray (horizontal, going right)
    svg += `<line x1="${cx}" y1="${cy}" x2="${x1}" y2="${y1}" stroke="${strokeColor}" stroke-width="2.5"/>`;
    
    // Second ray (at angle)
    svg += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="2.5"/>`;
    
    // Right angle indicator (small square) for exactly 90 degrees
    if (degrees === 90) {
        const squareSize = 14;
        // Draw square in the corner of the angle
        svg += `<path d="M ${cx + squareSize} ${cy} L ${cx + squareSize} ${cy - squareSize} L ${cx} ${cy - squareSize}" fill="none" stroke="${arcColor}" stroke-width="2"/>`;
    } else if (degrees === 180) {
        // For straight angle, show a small semicircle
        svg += `<path d="M ${cx + arcRadius} ${cy} A ${arcRadius} ${arcRadius} 0 0 1 ${cx - arcRadius} ${cy}" fill="none" stroke="${arcColor}" stroke-width="2"/>`;
    } else {
        // Arc indicator - sweep counter-clockwise from first ray to second ray
        svg += `<path d="M ${arcX1} ${arcY1} A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweepFlag} ${arcX2} ${arcY2}" fill="none" stroke="${arcColor}" stroke-width="2"/>`;
    }
    
    // Vertex dot
    svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="${strokeColor}"/>`;
    
    // Degree label - position BELOW the angle to avoid overlap
    if (showLabel) {
        // Place label below the vertex, centered
        const labelX = cx + 20;
        const labelY = cy + 25;
        svg += `<text x="${labelX}" y="${labelY}" fill="${textColor}" font-size="16" font-weight="bold" text-anchor="middle">${degrees}°</text>`;
    }
    
    svg += `</svg>`;
    return svg;
}

export function createRectangleSVG(length, width, showDimensions = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const textColor = forPrint ? '#000' : 'currentColor';
    
    const padding = 30;
    const maxDim = Math.max(length, width);
    const scale = 100 / maxDim;
    const rectW = length * scale;
    const rectH = width * scale;
    const svgW = rectW + padding * 2;
    const svgH = rectH + padding * 2;
    
    let svg = `<svg width="${svgW + 20}" height="${svgH + 20}" viewBox="0 0 ${svgW + 20} ${svgH + 20}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // Rectangle
    svg += `<rect x="${padding}" y="${padding}" width="${rectW}" height="${rectH}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    
    // Right angle indicators
    const cornerSize = 8;
    svg += `<rect x="${padding}" y="${padding}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="1"/>`;
    svg += `<rect x="${padding + rectW - cornerSize}" y="${padding}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="1"/>`;
    svg += `<rect x="${padding}" y="${padding + rectH - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="1"/>`;
    svg += `<rect x="${padding + rectW - cornerSize}" y="${padding + rectH - cornerSize}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="1"/>`;
    
    // Dimension labels
    if (showDimensions) {
        svg += `<text x="${padding + rectW / 2}" y="${padding - 8}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="middle">${length}</text>`;
        // text-anchor:end keeps the label to the LEFT of the rectangle no
        // matter how many digits the value has, so multi-digit dimensions
        // (100, 250, ...) never get clipped against the SVG edge.
        svg += `<text x="${padding - 6}" y="${padding + rectH / 2 + 5}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="end">${width}</text>`;
    }

    svg += `</svg>`;
    return svg;
}

export function createSquareSVG(side, showDimensions = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const textColor = forPrint ? '#000' : 'currentColor';
    
    const padding = 30; // Increased padding for label visibility
    const topPadding = showDimensions ? 20 : 0; // Extra top padding for label
    const size = 100;
    const svgWidth = size + padding * 2;
    const svgHeight = size + padding * 2 + topPadding;
    
    let svg = `<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // Square - shifted down by topPadding
    const rectY = padding + topPadding;
    svg += `<rect x="${padding}" y="${rectY}" width="${size}" height="${size}" fill="${forPrint ? 'none' : 'var(--accent-green)'}33" stroke="${strokeColor}" stroke-width="2" rx="4"/>`;
    
    // Right angle indicator
    const cornerSize = 8;
    svg += `<rect x="${padding}" y="${rectY}" width="${cornerSize}" height="${cornerSize}" fill="none" stroke="${strokeColor}" stroke-width="1"/>`;
    
    // Dimension label - positioned above the square with clear visibility
    if (showDimensions) {
        svg += `<text x="${padding + size / 2}" y="${rectY - 8}" fill="${textColor}" font-size="16" font-weight="bold" text-anchor="middle">${side}</text>`;
    }
    
    svg += `</svg>`;
    return svg;
}

export function createTriangleSVG(type, base = 0, height = 0, showDimensions = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const textColor = forPrint ? '#000' : 'currentColor';
    const heightColor = forPrint ? '#666' : 'var(--accent-orange)';
    
    const padding = 30;
    const size = 120;
    let points, heightLine = '';
    
    if (type === 'equilateral') {
        const h = size * 0.866;
        points = `${padding + size/2},${padding} ${padding},${padding + h} ${padding + size},${padding + h}`;
    } else if (type === 'isosceles') {
        const h = size * 0.9;
        points = `${padding + size/2},${padding} ${padding + 10},${padding + h} ${padding + size - 10},${padding + h}`;
    } else if (type === 'scalene') {
        points = `${padding + 20},${padding} ${padding},${padding + size} ${padding + size},${padding + size * 0.8}`;
    } else if (type === 'right') {
        points = `${padding},${padding} ${padding},${padding + size} ${padding + size},${padding + size}`;
    } else if (type === 'acute') {
        points = `${padding + size/2},${padding} ${padding},${padding + size * 0.8} ${padding + size},${padding + size * 0.8}`;
    } else if (type === 'obtuse') {
        points = `${padding + size * 0.3},${padding} ${padding},${padding + size * 0.7} ${padding + size},${padding + size * 0.7}`;
    } else {
        // Default with base/height for area calculation
        const h = height > 0 ? (height / base) * size : size * 0.8;
        points = `${padding + size/2},${padding} ${padding},${padding + h} ${padding + size},${padding + h}`;
        if (showDimensions && base > 0) {
            heightLine = `<line x1="${padding + size/2}" y1="${padding}" x2="${padding + size/2}" y2="${padding + h}" stroke="${heightColor}" stroke-width="1" stroke-dasharray="5,3"/>`;
        }
    }
    
    let svg = `<svg width="${size + padding * 2}" height="${size + padding}" viewBox="0 0 ${size + padding * 2} ${size + padding}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    svg += `<polygon points="${points}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    svg += heightLine;
    
    // Right angle indicator for right triangles
    if (type === 'right') {
        svg += `<rect x="${padding}" y="${padding + size - 10}" width="10" height="10" fill="none" stroke="${strokeColor}" stroke-width="1"/>`;
    }
    
    // Dimension labels for area problems
    if (showDimensions && base > 0 && height > 0) {
        const h = (height / base) * size;
        svg += `<text x="${padding + size/2}" y="${padding + h + 18}" fill="${textColor}" font-size="12" font-weight="bold" text-anchor="middle">base = ${base}</text>`;
        svg += `<text x="${padding + size/2 + 8}" y="${padding + h/2}" fill="${heightColor}" font-size="12" font-weight="bold" text-anchor="start">h = ${height}</text>`;
    }
    
    svg += `</svg>`;
    return svg;
}

export function createShapeSVG(shapeName, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const size = 100;
    const padding = 20;
    
    let svg = `<svg width="${size + padding * 2}" height="${size + padding * 2}" viewBox="0 0 ${size + padding * 2} ${size + padding * 2}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    const cx = size / 2 + padding;
    const cy = size / 2 + padding;
    const r = size / 2 - 5;
    
    if (shapeName === 'square') {
        svg += `<rect x="${padding + 5}" y="${padding + 5}" width="${size - 10}" height="${size - 10}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'rectangle') {
        svg += `<rect x="${padding}" y="${padding + 15}" width="${size}" height="${size - 30}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'circle') {
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'equilateral triangle') {
        const h = r * 1.73;
        svg += `<polygon points="${cx},${cy - r} ${cx - r},${cy + r * 0.5} ${cx + r},${cy + r * 0.5}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'regular hexagon') {
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60 - 90) * Math.PI / 180;
            points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
        }
        svg += `<polygon points="${points.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'rhombus') {
        svg += `<polygon points="${cx},${cy - r} ${cx + r * 0.7},${cy} ${cx},${cy + r} ${cx - r * 0.7},${cy}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'parallelogram') {
        const offset = 20;
        svg += `<polygon points="${padding + offset},${padding + 10} ${padding + size},${padding + 10} ${padding + size - offset},${padding + size - 10} ${padding},${padding + size - 10}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'trapezoid') {
        svg += `<polygon points="${padding + 25},${padding + 10} ${padding + size - 25},${padding + 10} ${padding + size},${padding + size - 10} ${padding},${padding + size - 10}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    } else if (shapeName === 'isosceles triangle') {
        svg += `<polygon points="${cx},${cy - r} ${cx - r * 0.6},${cy + r * 0.6} ${cx + r * 0.6},${cy + r * 0.6}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    }
    
    svg += `</svg>`;
    return svg;
}

export function create3DBoxSVG(length, width, height, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const dashColor = forPrint ? '#666' : 'var(--text-dim)';
    const textColor = forPrint ? '#000' : 'currentColor';
    
    // Isometric view
    const scale = 8;
    const l = length * scale;
    const w = width * scale;
    const h = height * scale;
    
    const svgW = l + w * 0.5 + 60;
    const svgH = h + w * 0.5 + 60;
    const ox = 30;
    const oy = svgH - 30;
    
    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // Front face
    svg += `<polygon points="${ox},${oy} ${ox + l},${oy} ${ox + l},${oy - h} ${ox},${oy - h}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    
    // Top face
    svg += `<polygon points="${ox},${oy - h} ${ox + l},${oy - h} ${ox + l + w * 0.5},${oy - h - w * 0.3} ${ox + w * 0.5},${oy - h - w * 0.3}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    
    // Side face
    svg += `<polygon points="${ox + l},${oy} ${ox + l + w * 0.5},${oy - w * 0.3} ${ox + l + w * 0.5},${oy - h - w * 0.3} ${ox + l},${oy - h}" fill="none" stroke="${strokeColor}" stroke-width="2"/>`;
    
    // Hidden edges (dashed)
    svg += `<line x1="${ox}" y1="${oy}" x2="${ox + w * 0.5}" y2="${oy - w * 0.3}" stroke="${dashColor}" stroke-width="1" stroke-dasharray="4,3"/>`;
    svg += `<line x1="${ox + w * 0.5}" y1="${oy - w * 0.3}" x2="${ox + l + w * 0.5}" y2="${oy - w * 0.3}" stroke="${dashColor}" stroke-width="1" stroke-dasharray="4,3"/>`;
    svg += `<line x1="${ox + w * 0.5}" y1="${oy - w * 0.3}" x2="${ox + w * 0.5}" y2="${oy - h - w * 0.3}" stroke="${dashColor}" stroke-width="1" stroke-dasharray="4,3"/>`;
    
    // Dimension labels — explicit anchors so labels never collide with
    // the SVG edge for multi-digit dimensions.
    svg += `<text x="${ox + l / 2}" y="${oy + 18}" fill="${textColor}" font-size="12" font-weight="bold" text-anchor="middle">l=${length}</text>`;
    svg += `<text x="${ox - 4}" y="${oy - h / 2}" fill="${textColor}" font-size="12" font-weight="bold" text-anchor="end">h=${height}</text>`;
    svg += `<text x="${ox + l + w * 0.25 + 6}" y="${oy - w * 0.15 + 5}" fill="${textColor}" font-size="12" font-weight="bold" text-anchor="start">w=${width}</text>`;
    
    svg += `</svg>`;
    return svg;
}

// Create L-shaped composite figure SVG
export function createLShapeSVG(dims, forPrint = false) {
    // dims = { topWidth, topHeight, bottomWidth, totalHeight }
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const fillColor = forPrint ? '#fff8e7' : 'rgba(255, 200, 100, 0.15)';
    const textColor = forPrint ? '#000' : 'currentColor';
    
    const scale = 12;
    const padding = 35;
    const tw = dims.topWidth * scale;
    const th = dims.topHeight * scale;
    const bw = dims.bottomWidth * scale;
    const totalH = dims.totalHeight * scale;
    const bottomH = totalH - th;
    
    const svgW = Math.max(tw, bw) + padding * 2;
    const svgH = totalH + padding * 2;
    
    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // L-shape path (starting from top-left, going clockwise)
    const path = `M ${padding} ${padding} 
                  L ${padding + tw} ${padding} 
                  L ${padding + tw} ${padding + th} 
                  L ${padding + bw} ${padding + th} 
                  L ${padding + bw} ${padding + totalH} 
                  L ${padding} ${padding + totalH} Z`;
    
    svg += `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>`;
    
    // Dimension labels — text-anchor on side labels keeps multi-digit
    // values from leaking past the SVG edge.
    // Top width
    svg += `<text x="${padding + tw/2}" y="${padding - 8}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="middle">${dims.topWidth}</text>`;
    // Top height (right side of top part)
    svg += `<text x="${padding + tw + 6}" y="${padding + th/2 + 4}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="start">${dims.topHeight}</text>`;
    // Bottom width
    svg += `<text x="${padding + bw/2}" y="${padding + totalH + 18}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="middle">${dims.bottomWidth}</text>`;
    // Total height (left side)
    svg += `<text x="${padding - 6}" y="${padding + totalH/2 + 4}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="end">${dims.totalHeight}</text>`;
    
    svg += `</svg>`;
    return svg;
}

// Create T-shaped composite figure SVG
export function createTShapeSVG(dims, forPrint = false) {
    // dims = { topWidth, topHeight, stemWidth, stemHeight }
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const fillColor = forPrint ? '#fff8e7' : 'rgba(255, 200, 100, 0.15)';
    const textColor = forPrint ? '#000' : 'currentColor';
    
    const scale = 12;
    const padding = 35;
    const tw = dims.topWidth * scale;
    const th = dims.topHeight * scale;
    const sw = dims.stemWidth * scale;
    const sh = dims.stemHeight * scale;
    
    const svgW = tw + padding * 2;
    const svgH = th + sh + padding * 2;
    const stemOffset = (tw - sw) / 2;
    
    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // T-shape path
    const path = `M ${padding} ${padding} 
                  L ${padding + tw} ${padding} 
                  L ${padding + tw} ${padding + th} 
                  L ${padding + stemOffset + sw} ${padding + th} 
                  L ${padding + stemOffset + sw} ${padding + th + sh} 
                  L ${padding + stemOffset} ${padding + th + sh} 
                  L ${padding + stemOffset} ${padding + th} 
                  L ${padding} ${padding + th} Z`;
    
    svg += `<path d="${path}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>`;
    
    // Dimension labels — anchor side labels so multi-digit dims fit.
    // Top width
    svg += `<text x="${padding + tw/2}" y="${padding - 8}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="middle">${dims.topWidth}</text>`;
    // Top height (left side)
    svg += `<text x="${padding - 6}" y="${padding + th/2 + 4}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="end">${dims.topHeight}</text>`;
    // Stem width
    svg += `<text x="${padding + tw/2}" y="${padding + th + sh + 18}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="middle">${dims.stemWidth}</text>`;
    // Stem height (right side)
    svg += `<text x="${padding + stemOffset + sw + 6}" y="${padding + th + sh/2 + 4}" fill="${textColor}" font-size="13" font-weight="bold" text-anchor="start">${dims.stemHeight}</text>`;
    
    svg += `</svg>`;
    return svg;
}

// Create word problem shape SVG with dashed border and ? for dimensions
export function createWordProblemShapeSVG(length, width, showQuestionMarks = true, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-orange)';
    const textColor = forPrint ? '#000' : 'var(--text-dim)';
    
    const scale = 12;
    const padding = 30;
    const w = length * scale;
    const h = width * scale;
    
    const svgW = w + padding * 2;
    const svgH = h + padding * 2;
    
    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // Rectangle with dashed border
    svg += `<rect x="${padding}" y="${padding}" width="${w}" height="${h}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-dasharray="8,4"/>`;
    
    // Dimension labels (with ? if showQuestionMarks) — text-anchor:end on
    // the side label keeps multi-digit width values inside the SVG.
    if (showQuestionMarks) {
        svg += `<text x="${padding + w/2}" y="${padding - 10}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="middle">?</text>`;
        svg += `<text x="${padding - 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="end">~</text>`;
    } else {
        svg += `<text x="${padding + w/2}" y="${padding - 10}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="middle">${length}</text>`;
        svg += `<text x="${padding - 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="end">${width}</text>`;
    }
    
    svg += `</svg>`;
    return svg;
}

// Create labeled rectangle SVG for area/perimeter (with all 4 sides labeled)
export function createLabeledRectSVG(length, width, forPrint = false) {
    const strokeColor = forPrint ? '#000' : 'var(--accent-cyan)';
    const fillColor = forPrint ? '#fff8e7' : 'rgba(255, 200, 100, 0.15)';
    const textColor = forPrint ? '#000' : 'currentColor';
    
    const scale = 10;
    const padding = 30;
    const w = length * scale;
    const h = width * scale;
    
    const svgW = w + padding * 2;
    const svgH = h + padding * 2;
    
    let svg = `<svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:visible;">`;
    
    // Rectangle
    svg += `<rect x="${padding}" y="${padding}" width="${w}" height="${h}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/>`;
    
    // All 4 dimension labels — anchor side labels so multi-digit values
    // don't bleed past the rectangle / SVG edge.
    svg += `<text x="${padding + w/2}" y="${padding - 8}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="middle">${length}</text>`;
    svg += `<text x="${padding + w/2}" y="${padding + h + 18}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="middle">${length}</text>`;
    svg += `<text x="${padding - 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="end">${width}</text>`;
    svg += `<text x="${padding + w + 6}" y="${padding + h/2 + 4}" fill="${textColor}" font-size="14" font-weight="bold" text-anchor="start">${width}</text>`;
    
    svg += `</svg>`;
    return svg;
}

