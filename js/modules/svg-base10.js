import { randInt } from './utils.js';
import { COLORS, STROKE, FONTS, categoricalFill } from './design-tokens.js';

// Single source of truth: re-export tokens locally for in-file references.
const _DT_COLORS = COLORS;
const _DT_STROKE = STROKE;
const _DT_FONT = FONTS.sans;
function _dtFill(i) { return categoricalFill(i); }

// CSS-var-with-fallback wrapper for SVG attribute values. Inline SVG honors
// var(--name, #hex) so dark mode picks up themed colors automatically.
// The hex fallback keeps print contexts and old browsers safe.
function _cv(name, hex) { return `var(--${name}, ${hex})`; }
const _C_PAPER = _cv('mq-paper', _DT_COLORS.bg);
const _C_INK = _cv('mq-ink', _DT_COLORS.text);
const _C_AXIS = _cv('mq-ink', _DT_COLORS.axis);
const _C_PRIMARY = _cv('mq-purple', _DT_COLORS.primary);
const _C_PRIMARY_DARK = _cv('mq-purple-d', _DT_COLORS.primaryDark);
const _C_CORRECT = _cv('mq-correct-ink', _DT_COLORS.correct);
const _C_WRONG = _cv('mq-wrong-ink', _DT_COLORS.wrong);
const _C_MUTED = _cv('mq-muted', _DT_COLORS.neutral);

// SVG accessibility: short unique id for <title> elements.
let _svgIdCounter = 0;
function _svgUid(prefix) {
    _svgIdCounter = (_svgIdCounter + 1) % 1e9;
    return prefix + '-' + _svgIdCounter.toString(36) + '-' + Math.random().toString(36).slice(2, 6);
}

export function createDotArray(rows, cols, label = "") {
    // Bumped from 20px to 32px max — visuals now sit in a wide left column
    // (layout-visual-left) so dots should be clearly visible.
    const dotSize = Math.min(32, 600 / Math.max(rows, cols));
    let html = `<div style="display:inline-block; margin:10px;">`;
    if (label) html += `<div style="font-size:1.05rem; margin-bottom:6px; font-weight:700; font-family:${_DT_FONT};">${label}</div>`;
    html += `<div style="display:grid; grid-template-columns:repeat(${cols}, ${dotSize}px); gap:${Math.max(6, dotSize/4)}px;">`;
    for (let i = 0; i < rows * cols; i++) {
        html += `<div style="width:${dotSize}px; height:${dotSize}px; background:${_C_PRIMARY}; border-radius:50%;"></div>`;
    }
    html += `</div></div>`;
    return html;
}

export function createNumberLine(min, max, highlight, answer = null) {
    const range = max - min;
    const step = range <= 20 ? 1 : range <= 100 ? 10 : range <= 1000 ? 100 : 1000;
    const highlightPos = ((highlight - min) / range) * 100;
    const answerPos = answer !== null ? ((answer - min) / range) * 100 : null;

    // Add inline horizontal padding so endpoint labels (which can be wide,
    // e.g. "10000") and the highlight bubble's nowrap caption never get
    // clipped against the container edge.
    let html = `<div style="position:relative; margin:20px auto; max-width:620px; width:100%; padding:0 20px; font-family:${_DT_FONT};">`;
    // Single-color primary line (was a purple→cyan gradient — IXL number lines
    // are single-color with discrete tick marks, not a gradient bar).
    html += `<div style="height:${_DT_STROKE.normal * 2}px; background:${_C_PRIMARY}; border-radius:2px; position:relative;">`;

    // Highlight marker — primary single-hue marker
    html += `<div style="position:absolute; left:${highlightPos}%; top:-12px; transform:translateX(-50%);">`;
    html += `<div style="width:14px; height:14px; background:${_C_PRIMARY}; border-radius:50%; border:2px solid white;"></div>`;
    html += `<div style="position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-weight:700; color:${_C_INK}; white-space:nowrap; font-family:${_DT_FONT}; font-size:11px;">${highlight}</div>`;
    html += `</div>`;

    // Answer marker (for showing solution) — semantic correct color
    if (answerPos !== null && answer !== highlight) {
        html += `<div style="position:absolute; left:${answerPos}%; top:-12px; transform:translateX(-50%);">`;
        html += `<div style="width:14px; height:14px; background:${_C_CORRECT}; border-radius:50%; border:2px solid white;"></div>`;
        html += `<div style="position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-weight:700; color:${_C_CORRECT}; white-space:nowrap; font-family:${_DT_FONT}; font-size:11px;">?</div>`;
        html += `</div>`;
    }

    html += `</div>`;

    // Endpoint labels — Open Sans, axis color
    html += `<div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; font-weight:600; color:${_C_AXIS}; font-family:${_DT_FONT};">`;
    html += `<span>${min}</span><span>${max}</span>`;
    html += `</div>`;
    html += `</div>`;
    return html;
}

// ===== HOP NUMBER LINE (for nl_add, nl_sub, nl_mult, nl_div) =====

export function createHopNumberLine({ min, max, step, hops, showAnswer = true, highlightEnd }) {
    const uid = Math.random().toString(36).slice(2, 8);
    // Widen the viewBox horizontally so endpoint tick labels (which can be
    // 3-4 digits like "100" or "1000") don't get clipped at the SVG edge.
    const W = 540, H = 135;
    const lineY = 85, lineX1 = 60, lineX2 = 480;
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

    // Accessibility: descriptive title summarizing the hops.
    const _titleId = _svgUid('hopline-title');
    const _hopSummary = (hops || []).map(h => `${h.from}→${h.to}`).join(', ');
    const _label = `Number line from ${min} to ${max}` + (_hopSummary ? `, hops: ${_hopSummary}` : '');
    let svg = `<div style="text-align:center;max-width:100%;"><svg viewBox="0 0 ${W} ${H}" style="max-width:100%;height:auto;overflow:visible;" role="img" aria-labelledby="${_titleId}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<title id="${_titleId}">${_label}</title>`;

    // Arrowhead marker defs — primary fill for live hops, neutral for dashed
    svg += `<defs>
        <marker id="ah-${uid}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="${_C_PRIMARY}"/>
        </marker>
        <marker id="ahd-${uid}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="${_C_MUTED}"/>
        </marker>
    </defs>`;

    // Main horizontal line — axis color, normal stroke
    svg += `<line x1="${lineX1 - 6}" y1="${lineY}" x2="${lineX2 + 6}" y2="${lineY}" stroke="${_C_AXIS}" stroke-width="${_DT_STROKE.normal}"/>`;
    // Arrow ends
    svg += `<polygon points="${lineX1 - 10},${lineY} ${lineX1 - 2},${lineY - 4} ${lineX1 - 2},${lineY + 4}" fill="${_C_AXIS}"/>`;
    svg += `<polygon points="${lineX2 + 10},${lineY} ${lineX2 + 2},${lineY - 4} ${lineX2 + 2},${lineY + 4}" fill="${_C_AXIS}"/>`;

    // Tick marks — hairline (0.75) for IXL crispness; labels in Open Sans
    for (let v = min; v <= max; v += step) {
        const x = toX(v);
        svg += `<line x1="${x}" y1="${lineY - 5}" x2="${x}" y2="${lineY + 5}" stroke="${_C_AXIS}" stroke-width="${_DT_STROKE.hair}"/>`;
        svg += `<text x="${x}" y="${lineY + 18}" text-anchor="middle" dominant-baseline="hanging" font-size="11" fill="${_C_AXIS}" font-family='${_DT_FONT}'>${v}</text>`;
    }

    // Draw hops (arcs)
    for (const hop of hops) {
        const x1 = toX(hop.from);
        const x2 = toX(hop.to);
        const dist = Math.abs(x2 - x1);
        const arcH = Math.min(40, Math.max(18, dist * 0.3));
        const midX = (x1 + x2) / 2;
        const isDashed = hop.dashed;
        const color = isDashed ? _C_MUTED : _C_PRIMARY;
        const markerEnd = isDashed ? `url(#ahd-${uid})` : `url(#ah-${uid})`;
        const dashAttr = isDashed ? ' stroke-dasharray="6,4"' : '';

        // Bezier arc above the line
        const cpY = lineY - arcH - 8;
        svg += `<path d="M${x1},${lineY - 5} Q${midX},${cpY} ${x2},${lineY - 5}" fill="none" stroke="${color}" stroke-width="${_DT_STROKE.normal}"${dashAttr} stroke-linecap="round" marker-end="${markerEnd}"/>`;

        // Label above arc
        const labelY = cpY - 2;
        svg += `<text x="${midX}" y="${labelY}" text-anchor="middle" dominant-baseline="auto" font-size="12" fill="${color}" font-weight="600" font-family='${_DT_FONT}'>${hop.label}</text>`;
    }

    // Start marker (first hop's from) — primary
    if (hops.length > 0) {
        const startX = toX(hops[0].from);
        svg += `<circle cx="${startX}" cy="${lineY}" r="5" fill="${_C_PRIMARY}" stroke="#fff" stroke-width="${_DT_STROKE.normal}"/>`;
    }

    // End/answer marker — primary
    if (highlightEnd != null) {
        const endX = toX(highlightEnd);
        svg += `<circle cx="${endX}" cy="${lineY}" r="5" fill="${_C_PRIMARY}" stroke="#fff" stroke-width="${_DT_STROKE.normal}"/>`;
        if (!showAnswer) {
            svg += `<text x="${endX}" y="${lineY - 10}" text-anchor="middle" dominant-baseline="auto" font-size="14" fill="${_C_PRIMARY}" font-weight="700" font-family='${_DT_FONT}'>?</text>`;
        }
    }

    svg += `</svg></div>`;
    return svg;
}

// ===== CLOCK & TIME HELPER FUNCTIONS =====

// Pastel color schemes for clocks (legacy CLOCK_COLORS preserved for callers)
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

    // 3-color place-value mapping per IXL convention.
    // Hundreds = blue, tens = green, ones = orange. Thousands reuse blue.
    const HUNDREDS_FILL = _dtFill(0); // blue
    const TENS_FILL = _dtFill(1);     // green
    const ONES_FILL = _dtFill(2);     // orange

    let html = `<div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; align-items:flex-end; font-family:${_DT_FONT};">`;

    // Thousands (large cubes) — bumped from 50px to 64px
    if (thousands > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:5px; flex-wrap:wrap; max-width:${Math.min(thousands, 3) * 72}px;">`;
        for (let i = 0; i < Math.min(thousands, 3); i++) {
            html += `<div style="width:64px; height:64px; background:${HUNDREDS_FILL}; border:1.5px solid ${_C_AXIS}; border-radius:4px;"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${_C_AXIS};">${thousands},000</div>`;
        html += `</div>`;
    }

    // Hundreds (flats) — bumped from 44px to 58px
    if (hundreds > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:4px; flex-wrap:wrap; max-width:${Math.min(hundreds, 5) * 64}px;">`;
        for (let i = 0; i < Math.min(hundreds, 5); i++) {
            html += `<div style="width:58px; height:58px; background:${HUNDREDS_FILL}; border:1px solid ${_C_AXIS}; display:grid; grid-template-columns:repeat(5,1fr); grid-template-rows:repeat(5,1fr); padding:1px;">`;
            for (let j = 0; j < 25; j++) {
                html += `<div style="background:rgba(255,255,255,0.3); border-radius:1px;"></div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${_C_AXIS};">${hundreds}00</div>`;
        html += `</div>`;
    }

    // Tens (rods) — bumped from 8x40 to 10x52
    if (tens > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:4px;">`;
        for (let i = 0; i < tens; i++) {
            html += `<div style="width:10px; height:52px; background:${TENS_FILL}; border:1px solid ${_C_AXIS}; border-radius:3px;"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${_C_AXIS};">${tens}0</div>`;
        html += `</div>`;
    }

    // Ones (units) — bumped from 12px to 16px
    if (ones > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:5px;">`;
        for (let i = 0; i < ones; i++) {
            html += `<div style="width:16px; height:16px; background:${ONES_FILL}; border-radius:50%;"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${_C_AXIS};">${ones}</div>`;
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

export function createCountingDots(count, groupSize = 5) {
    // Bumped dots from 12px to 22px for layout-visual-left wide column
    let html = `<div style="display:flex; gap:14px; flex-wrap:wrap; justify-content:center; font-family:${_DT_FONT};">`;
    const groups = Math.ceil(count / groupSize);
    for (let g = 0; g < groups; g++) {
        const dotsInGroup = Math.min(groupSize, count - g * groupSize);
        // Soft tint of primary background; single primary dot color.
        html += `<div style="display:flex; gap:6px; padding:10px; background:${_DT_COLORS.primary}1A; border-radius:10px;">`;
        for (let i = 0; i < dotsInGroup; i++) {
            html += `<div style="width:22px; height:22px; background:${_DT_COLORS.primary}; border-radius:50%;"></div>`;
        }
        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

