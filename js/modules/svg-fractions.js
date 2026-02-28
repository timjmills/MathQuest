import { randInt, shuffle } from './utils.js';

// Create HTML for a properly stacked fraction display
export function fracHTML(num, den, size = '') {
    const sizeClass = size ? ` frac-${size}` : '';
    return `<span class="frac${sizeClass}"><span class="num">${num}</span><span class="den">${den}</span></span>`;
}

// Create SVG circle (pie chart) fraction visual with LIGHT PASTEL COLORS
// IXL-STYLE PASTEL COLOR PALETTE FOR GAME MODE
const IXL_COLORS = {
    yellow: { fill: '#fffde7', border: '#d4c85c' },
    purple: { fill: '#e8d4f0', border: '#333' },
    blue: { fill: '#d4e5f7', border: '#333' },
    pink: { fill: '#f5d4e8', border: '#333' },
    white: { fill: '#ffffff', border: '#333' }
};

// Create SVG circle (pie chart) fraction visual with IXL-style colors
export function fracCircleSVG(num, den, size = 100, fillColor = '#d4e5f7', emptyColor = '#ffffff') {
    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) - 5;
    const borderColor = '#333'; // Black borders for clarity

    // Guard: clamp num to [0, den] to prevent rendering issues with improper fractions
    num = Math.max(0, Math.min(num, den));

    // If it's a whole (num >= den), fill completely
    if (num >= den) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fillColor}" stroke="${borderColor}" stroke-width="2"/>
            <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="${size/4}" font-weight="700" fill="#333">${num}/${den}</text>
        </svg>`;
    }
    
    // Create pie slices
    let slices = '';
    const sliceAngle = 360 / den;
    
    for (let i = 0; i < den; i++) {
        const startAngle = (i * sliceAngle) - 90; // Start from top
        const endAngle = startAngle + sliceAngle;
        const isFilled = i < num;
        
        // Convert angles to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        // Calculate arc points
        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);
        
        // Large arc flag
        const largeArc = sliceAngle > 180 ? 1 : 0;
        
        // Create path for slice
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        slices += `<path d="${path}" fill="${isFilled ? fillColor : emptyColor}" stroke="${borderColor}" stroke-width="1.5"/>`;
    }
    
    // Add dividing lines for clarity - BLACK
    let lines = '';
    for (let i = 0; i < den; i++) {
        const angle = ((i * sliceAngle) - 90) * Math.PI / 180;
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        lines += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${borderColor}" stroke-width="1.5"/>`;
    }
    
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${emptyColor}" stroke="${borderColor}" stroke-width="2"/>
        ${slices}
        ${lines}
    </svg>`;
}

// Create fraction bar visual (rectangular segments) with IXL-style colors
export function fracBarHTML(num, den, fillColor = '#d4e5f7', width = 'auto') {
    const segmentWidth = Math.max(30, Math.min(50, 250 / den));
    const borderColor = '#333'; // Black borders
    const segments = Array.from({length: den}, (_, i) => {
        const isFilled = i < num;
        return `<div class="frac-bar-segment ${isFilled ? 'filled' : 'empty'}" style="width:${segmentWidth}px;height:${segmentWidth}px;${isFilled ? `background:${fillColor};border-color:${borderColor};` : 'background:#fff;border-color:#333;'}"></div>`;
    }).join('');
    
    return `<div class="frac-bar-visual" style="width:${width};">${segments}</div>`;
}

// Create a combined fraction display with visual
export function fracWithVisual(num, den, visualType = 'bar', size = 'lg') {
    const fracElement = fracHTML(num, den, size);
    let visual = '';
    
    if (visualType === 'circle') {
        visual = fracCircleSVG(num, den, 80);
    } else if (visualType === 'bar') {
        visual = fracBarHTML(num, den);
    }
    
    return `<div class="frac-visual-container">
        ${fracElement}
        ${visual}
    </div>`;
}

// Create fraction equation display (for add/subtract)
export function fracEquationHTML(num1, den1, op, num2, den2, showVisual = true) {
    const opSymbol = op === '+' || op === 'add' ? '+' : '−';
    const color1 = 'var(--accent-cyan)';
    const color2 = 'var(--accent-purple)';
    
    let visualSection = '';
    if (showVisual) {
        visualSection = `
            <div style="display:flex;align-items:center;gap:15px;margin-top:15px;justify-content:center;">
                ${fracBarHTML(num1, den1, color1)}
                <span style="font-size:1.5rem;color:var(--accent-orange);">${opSymbol}</span>
                ${fracBarHTML(num2, den2, color2)}
            </div>`;
    }
    
    return `<div class="frac-equation">
        <span class="frac frac-2xl" style="color:${color1};">
            <span class="num">${num1}</span>
            <span class="den">${den1}</span>
        </span>
        <span class="frac-op">${opSymbol}</span>
        <span class="frac frac-2xl" style="color:${color2};">
            <span class="num">${num2}</span>
            <span class="den">${den2}</span>
        </span>
        <span class="frac-equals">=</span>
        <span class="frac-answer-box">
            <span class="answer-num">?</span>
            <span class="answer-bar"></span>
            <span class="answer-den">?</span>
        </span>
    </div>
    ${visualSection}`;
}

// Create fraction comparison display
export function fracCompareHTML(num1, den1, num2, den2) {
    return `<div class="frac-compare-visual">
        <div class="frac-compare-box">
            ${fracCircleSVG(num1, den1, 90, '#00bcd4')}
            <span class="frac frac-xl">${fracHTML(num1, den1, 'xl').replace(/<span class="frac[^"]*">/, '').replace(/<\/span>$/, '')}</span>
        </div>
        <span class="compare-symbol">?</span>
        <div class="frac-compare-box">
            ${fracCircleSVG(num2, den2, 90, '#9c27b0')}
            <span class="frac frac-xl" style="color:var(--accent-purple);">${fracHTML(num2, den2, 'xl').replace(/<span class="frac[^"]*">/, '').replace(/<\/span>$/, '')}</span>
        </div>
    </div>`;
}

// Create text representation for TTS (screen reader friendly)
export function fracText(num, den) {
    return `${num} over ${den}`;
}

export function fractionToPercent(n, d) { return Math.round((n / d) * 100) + "%"; }
