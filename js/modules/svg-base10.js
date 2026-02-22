import { randInt } from './utils.js';

export function createDotArray(rows, cols, label = "") {
    const dotSize = Math.min(20, 400 / Math.max(rows, cols));
    let html = `<div style="display:inline-block; margin:8px;">`;
    if (label) html += `<div style="font-size:0.9rem; margin-bottom:4px; font-weight:700;">${label}</div>`;
    html += `<div style="display:grid; grid-template-columns:repeat(${cols}, ${dotSize}px); gap:${Math.max(4, dotSize/4)}px;">`;
    for (let i = 0; i < rows * cols; i++) {
        html += `<div style="width:${dotSize}px; height:${dotSize}px; background:var(--accent-cyan); border-radius:50%;"></div>`;
    }
    html += `</div></div>`;
    return html;
}

export function createNumberLine(min, max, highlight, answer = null) {
    const range = max - min;
    const step = range <= 20 ? 1 : range <= 100 ? 10 : range <= 1000 ? 100 : 1000;
    const highlightPos = ((highlight - min) / range) * 100;
    const answerPos = answer !== null ? ((answer - min) / range) * 100 : null;

    let html = `<div style="position:relative; margin:20px auto; max-width:450px;">`;
    html += `<div style="height:8px; background:linear-gradient(90deg, var(--accent-purple), var(--accent-cyan)); border-radius:4px; position:relative;">`;

    // Highlight marker
    html += `<div style="position:absolute; left:${highlightPos}%; top:-12px; transform:translateX(-50%);">`;
    html += `<div style="width:16px; height:16px; background:var(--accent-orange); border-radius:50%; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;
    html += `<div style="position:absolute; top:-25px; left:50%; transform:translateX(-50%); font-weight:800; color:var(--accent-orange); white-space:nowrap;">${highlight}</div>`;
    html += `</div>`;

    // Answer marker (for showing solution)
    if (answerPos !== null && answer !== highlight) {
        html += `<div style="position:absolute; left:${answerPos}%; top:-12px; transform:translateX(-50%);">`;
        html += `<div style="width:16px; height:16px; background:var(--accent-green); border-radius:50%; border:3px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`;
        html += `<div style="position:absolute; top:-25px; left:50%; transform:translateX(-50%); font-weight:800; color:var(--accent-green); white-space:nowrap;">?</div>`;
        html += `</div>`;
    }

    html += `</div>`;

    // Labels
    html += `<div style="display:flex; justify-content:space-between; margin-top:8px; font-size:0.85rem; font-weight:700; color:var(--text-dim);">`;
    html += `<span>${min}</span><span>${max}</span>`;
    html += `</div>`;
    html += `</div>`;
    return html;
}

// ===== HOP NUMBER LINE (for nl_add, nl_sub, nl_mult, nl_div) =====

export function createHopNumberLine({ min, max, step, hops, showAnswer = true, highlightEnd }) {
    const uid = Math.random().toString(36).slice(2, 8);
    const W = 500, H = 130;
    const lineY = 85, lineX1 = 40, lineX2 = 460;
    const lineLen = lineX2 - lineX1;

    // Auto-calculate step if not provided
    if (!step) {
        const range = max - min;
        if (range <= 10) step = 1;
        else if (range <= 20) step = 2;
        else if (range <= 50) step = 5;
        else if (range <= 100) step = 10;
        else step = 25;
    }

    const toX = (val) => lineX1 + ((val - min) / (max - min)) * lineLen;

    let svg = `<div style="text-align:center;max-width:100%;"><svg viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;" xmlns="http://www.w3.org/2000/svg">`;

    // Arrowhead marker defs
    svg += `<defs>
        <marker id="ah-${uid}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#7c3aed"/>
        </marker>
        <marker id="ahd-${uid}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#999"/>
        </marker>
    </defs>`;

    // Main horizontal line
    svg += `<line x1="${lineX1 - 6}" y1="${lineY}" x2="${lineX2 + 6}" y2="${lineY}" stroke="#333" stroke-width="2"/>`;
    // Arrow ends
    svg += `<polygon points="${lineX1 - 10},${lineY} ${lineX1 - 2},${lineY - 4} ${lineX1 - 2},${lineY + 4}" fill="#333"/>`;
    svg += `<polygon points="${lineX2 + 10},${lineY} ${lineX2 + 2},${lineY - 4} ${lineX2 + 2},${lineY + 4}" fill="#333"/>`;

    // Tick marks and labels
    for (let v = min; v <= max; v += step) {
        const x = toX(v);
        svg += `<line x1="${x}" y1="${lineY - 5}" x2="${x}" y2="${lineY + 5}" stroke="#333" stroke-width="1.5"/>`;
        svg += `<text x="${x}" y="${lineY + 18}" text-anchor="middle" font-size="11" fill="#333" font-family="sans-serif">${v}</text>`;
    }

    // Draw hops (arcs)
    for (const hop of hops) {
        const x1 = toX(hop.from);
        const x2 = toX(hop.to);
        const dist = Math.abs(x2 - x1);
        const arcH = Math.min(40, Math.max(18, dist * 0.3));
        const midX = (x1 + x2) / 2;
        const dir = hop.to > hop.from ? 1 : -1;
        const isDashed = hop.dashed;
        const color = isDashed ? '#999' : '#7c3aed';
        const markerEnd = isDashed ? `url(#ahd-${uid})` : `url(#ah-${uid})`;
        const dashAttr = isDashed ? ' stroke-dasharray="6,4"' : '';

        // Bezier arc above the line
        const cpY = lineY - arcH - 8;
        svg += `<path d="M${x1},${lineY - 5} Q${midX},${cpY} ${x2},${lineY - 5}" fill="none" stroke="${color}" stroke-width="2"${dashAttr} marker-end="${markerEnd}"/>`;

        // Label above arc
        const labelY = cpY - 2;
        svg += `<text x="${midX}" y="${labelY}" text-anchor="middle" font-size="12" fill="${color}" font-weight="600" font-family="sans-serif">${hop.label}</text>`;
    }

    // Start marker (first hop's from)
    if (hops.length > 0) {
        const startX = toX(hops[0].from);
        svg += `<circle cx="${startX}" cy="${lineY}" r="5" fill="#22c55e" stroke="#fff" stroke-width="1.5"/>`;
    }

    // End/answer marker
    if (highlightEnd != null) {
        const endX = toX(highlightEnd);
        svg += `<circle cx="${endX}" cy="${lineY}" r="5" fill="#f97316" stroke="#fff" stroke-width="1.5"/>`;
        if (!showAnswer) {
            svg += `<text x="${endX}" y="${lineY - 10}" text-anchor="middle" font-size="14" fill="#f97316" font-weight="700" font-family="sans-serif">?</text>`;
        }
    }

    svg += `</svg></div>`;
    return svg;
}

// ===== CLOCK & TIME HELPER FUNCTIONS =====

// Pastel color schemes for clocks
export const CLOCK_COLORS = {
    blue: { face: '#e3f2fd', border: '#64b5f6', accent: '#1976d2' },
    purple: { face: '#f3e5f5', border: '#ce93d8', accent: '#7b1fa2' },
    green: { face: '#e8f5e9', border: '#81c784', accent: '#388e3c' },
    red: { face: '#ffebee', border: '#ef5350', accent: '#c62828' },
    yellow: { face: '#fffde7', border: '#ffd54f', accent: '#f9a825' },
    cyan: { face: '#e0f7fa', border: '#4dd0e1', accent: '#00838f' },
    gray: { face: '#f5f5f5', border: '#9e9e9e', accent: '#424242' },
    orange: { face: '#fff3e0', border: '#ffb74d', accent: '#e65100' }
};

// Pastel link colors for factor links (matching the reference image)
export const LINK_COLORS = {
    pastel: [
        '#e53935', // Red (outer) - brightest
        '#fb8c00', // Orange
        '#fdd835', // Yellow  
        '#7b1fa2', // Purple
        '#ec407a', // Pink
        '#43a047', // Green (inner)
    ],
    // For print - solid distinct colors
    print: [
        '#cc0000', // Red
        '#ff6600', // Orange
        '#ffcc00', // Yellow
        '#660099', // Purple
        '#cc6699', // Pink
        '#009933', // Green
    ],
    grayscale: [
        '#2d2d2d',
        '#4a4a4a',
        '#666666',
        '#888888',
        '#aaaaaa',
        '#cccccc',
    ]
};


export function createBase10Blocks(number) {
    const thousands = Math.floor(number / 1000);
    const hundreds = Math.floor((number % 1000) / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;

    let html = `<div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; align-items:flex-end;">`;

    // Thousands (large cubes)
    if (thousands > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:3px; flex-wrap:wrap; max-width:${Math.min(thousands, 3) * 35}px;">`;
        for (let i = 0; i < Math.min(thousands, 3); i++) {
            html += `<div style="width:30px; height:30px; background:var(--accent-purple); border:2px solid var(--text-dim); border-radius:3px;"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.75rem; margin-top:2px; font-weight:700;">${thousands},000</div>`;
        html += `</div>`;
    }

    // Hundreds (flats)
    if (hundreds > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:2px; flex-wrap:wrap; max-width:${Math.min(hundreds, 5) * 28}px;">`;
        for (let i = 0; i < Math.min(hundreds, 5); i++) {
            html += `<div style="width:25px; height:25px; background:var(--accent-cyan); border:1px solid var(--text-dim); display:grid; grid-template-columns:repeat(5,1fr); grid-template-rows:repeat(5,1fr); padding:1px;">`;
            for (let j = 0; j < 25; j++) {
                html += `<div style="background:rgba(255,255,255,0.3); border-radius:1px;"></div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.75rem; margin-top:2px; font-weight:700;">${hundreds}00</div>`;
        html += `</div>`;
    }

    // Tens (rods)
    if (tens > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:2px;">`;
        for (let i = 0; i < tens; i++) {
            html += `<div style="width:4px; height:20px; background:var(--accent-green); border:1px solid var(--text-dim); border-radius:2px;"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.75rem; margin-top:2px; font-weight:700;">${tens}0</div>`;
        html += `</div>`;
    }

    // Ones (units)
    if (ones > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:2px;">`;
        for (let i = 0; i < ones; i++) {
            html += `<div style="width:4px; height:4px; background:var(--accent-orange); border-radius:50%;"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.75rem; margin-top:2px; font-weight:700;">${ones}</div>`;
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

export function createCountingDots(count, groupSize = 5) {
    let html = `<div style="display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">`;
    const groups = Math.ceil(count / groupSize);
    for (let g = 0; g < groups; g++) {
        const dotsInGroup = Math.min(groupSize, count - g * groupSize);
        html += `<div style="display:flex; gap:4px; padding:6px; background:rgba(var(--accent-cyan-rgb, 76, 201, 240), 0.1); border-radius:8px;">`;
        for (let i = 0; i < dotsInGroup; i++) {
            html += `<div style="width:12px; height:12px; background:var(--accent-cyan); border-radius:50%;"></div>`;
        }
        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

