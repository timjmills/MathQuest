import { randInt } from './utils.js';
import { COLORS, STROKE, FONTS, categoricalFill, palette, MONO, MONO_STROKE } from './design-tokens.js';

// Black & white support: every builder below takes an optional trailing
// `opts` bag. `{ mono: true }` (or the legacy `forPrint` alias) paints in
// ink / paper / the single grey. See WORKSHEET_DESIGN_STANDARD.md INK-*.
function _pal(opts) { return palette(opts); }

// Single source of truth: re-export tokens locally for in-file references.
const _DT_COLORS = COLORS;
const _DT_STROKE = STROKE;
const _DT_FONT = FONTS.sans;
// HTML style attributes are double-quoted, so the token font stack's own
// double quotes would close the attribute early (and silently drop every
// declaration after it, colour included). Single-quote it for HTML; SVG
// attributes below are single-quoted already and keep _DT_FONT.
const _DT_FONT_CSS = FONTS.sans.replace(/"/g, "'");
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

export function createDotArray(rows, cols, label = "", opts = null) {
    const P = _pal(opts);
    // Bumped from 20px to 32px max — visuals now sit in a wide left column
    // (layout-visual-left) so dots should be clearly visible.
    // INK-5: a solid black fill is allowed only up to ~7 mm, so mono counters
    // cap a little smaller than the colour ones.
    const dotSize = Math.min(P.mono ? 26 : 32, 600 / Math.max(rows, cols));
    const dotFill = P.mono ? P.ink : _C_PRIMARY;
    let html = `<div style="display:inline-block; margin:10px;">`;
    if (label) html += `<div style="font-size:1.05rem; margin-bottom:6px; font-weight:700; font-family:${_DT_FONT_CSS};${P.mono ? `color:${P.ink};` : ''}">${label}</div>`;
    html += `<div style="display:grid; grid-template-columns:repeat(${cols}, ${dotSize}px); gap:${Math.max(6, dotSize/4)}px;">`;
    for (let i = 0; i < rows * cols; i++) {
        html += `<div style="width:${dotSize}px; height:${dotSize}px; background:${dotFill}; border-radius:50%;"></div>`;
    }
    html += `</div></div>`;
    return html;
}

export function createNumberLine(min, max, highlight, answer = null, opts = null) {
    const P = _pal(opts);
    const range = max - min;
    const step = range <= 20 ? 1 : range <= 100 ? 10 : range <= 1000 ? 100 : 1000;
    const highlightPos = ((highlight - min) / range) * 100;
    const answerPos = answer !== null ? ((answer - min) / range) * 100 : null;

    // Add inline horizontal padding so endpoint labels (which can be wide,
    // e.g. "10000") and the highlight bubble's nowrap caption never get
    // clipped against the container edge.
    let html = `<div style="position:relative; margin:20px auto; max-width:620px; width:100%; padding:0 20px; font-family:${_DT_FONT_CSS};">`;
    // Single-color primary line (was a purple→cyan gradient — IXL number lines
    // are single-color with discrete tick marks, not a gradient bar).
    const lineColor = P.mono ? P.ink : _C_PRIMARY;
    const markerRing = P.mono ? P.paper : 'white';
    html += `<div style="height:${P.mono ? MONO_STROKE.heavy : _DT_STROKE.normal * 2}px; background:${lineColor}; border-radius:2px; position:relative;">`;

    // Highlight marker — primary single-hue marker.
    // MEANING-BEARING COLOUR: the given point (primary) vs the answer point
    // (green). In mono the two are told apart by SOLID vs HOLLOW (INK-6,
    // LS-5), not by hue, so the distinction survives.
    html += `<div style="position:absolute; left:${highlightPos}%; top:-12px; transform:translateX(-50%);">`;
    html += `<div style="width:14px; height:14px; background:${P.mono ? P.ink : _C_PRIMARY}; border-radius:50%; border:2px solid ${markerRing};"></div>`;
    html += `<div style="position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-weight:700; color:${P.mono ? P.ink : _C_INK}; white-space:nowrap; font-family:${_DT_FONT_CSS}; font-size:11px;">${highlight}</div>`;
    html += `</div>`;

    // Answer marker (for showing solution) — semantic correct color
    if (answerPos !== null && answer !== highlight) {
        const answerDot = P.mono
            ? `width:14px; height:14px; background:${P.paper}; border-radius:50%; border:${MONO_STROKE.heavy}px solid ${P.ink}; box-sizing:border-box;`
            : `width:14px; height:14px; background:${_C_CORRECT}; border-radius:50%; border:2px solid white;`;
        html += `<div style="position:absolute; left:${answerPos}%; top:-12px; transform:translateX(-50%);">`;
        html += `<div style="${answerDot}"></div>`;
        html += `<div style="position:absolute; top:-22px; left:50%; transform:translateX(-50%); font-weight:700; color:${P.mono ? P.ink : _C_CORRECT}; white-space:nowrap; font-family:${_DT_FONT_CSS}; font-size:11px;">?</div>`;
        html += `</div>`;
    }

    html += `</div>`;

    // Endpoint labels — Open Sans, axis color
    html += `<div style="display:flex; justify-content:space-between; margin-top:8px; font-size:11px; font-weight:600; color:${P.mono ? P.ink : _C_AXIS}; font-family:${_DT_FONT_CSS};">`;
    html += `<span>${min}</span><span>${max}</span>`;
    html += `</div>`;
    html += `</div>`;
    return html;
}

// ===== HOP NUMBER LINE (for nl_add, nl_sub, nl_mult, nl_div) =====

export function createHopNumberLine({ min, max, step, hops, showAnswer = true, highlightEnd, mono = false, forPrint = false }) {
    const P = _pal({ mono, forPrint });
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
            <path d="M0,0 L8,3 L0,6 Z" fill="${P.mono ? P.ink : _C_PRIMARY}"/>
        </marker>
        <marker id="ahd-${uid}" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="${P.mono ? P.ink : _C_MUTED}"/>
        </marker>
    </defs>`;

    // Main horizontal line — axis color, normal stroke
    svg += `<line x1="${lineX1 - 6}" y1="${lineY}" x2="${lineX2 + 6}" y2="${lineY}" stroke="${P.axis}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    // Arrow ends
    svg += `<polygon points="${lineX1 - 10},${lineY} ${lineX1 - 2},${lineY - 4} ${lineX1 - 2},${lineY + 4}" fill="${P.axis}"/>`;
    svg += `<polygon points="${lineX2 + 10},${lineY} ${lineX2 + 2},${lineY - 4} ${lineX2 + 2},${lineY + 4}" fill="${P.axis}"/>`;

    // Tick marks — hairline (0.75) for IXL crispness; labels in Open Sans
    for (let v = min; v <= max; v += step) {
        const x = toX(v);
        svg += `<line x1="${x}" y1="${lineY - 5}" x2="${x}" y2="${lineY + 5}" stroke="${P.axis}" stroke-width="${P.sw(_DT_STROKE.hair)}"/>`;
        svg += `<text x="${x}" y="${lineY + 18}" text-anchor="middle" dominant-baseline="hanging" font-size="11" fill="${P.ink}" font-family='${_DT_FONT}'>${v}</text>`;
    }

    // Draw hops (arcs)
    for (const hop of hops) {
        const x1 = toX(hop.from);
        const x2 = toX(hop.to);
        const dist = Math.abs(x2 - x1);
        const arcH = Math.min(40, Math.max(18, dist * 0.3));
        const midX = (x1 + x2) / 2;
        const isDashed = hop.dashed;
        // MEANING-BEARING: a dashed hop is the UNKNOWN jump. LS-1/LS-4 reserve
        // dashes for cut lines and missing-digit slots, so mono redraws it as a
        // DOTTED ink line instead of a grey dashed one.
        const color = P.mono ? P.ink : (isDashed ? _C_MUTED : _C_PRIMARY);
        // RP-52 fixes the weights: a GIVEN hop is 0.75 pt solid, a MODELLED
        // (here: unknown) hop is dotted, and LS-1 fixes a dot at 1 pt.
        const hopW = P.mono ? (isDashed ? P.dotStroke : MONO_STROKE.hair) : _DT_STROKE.normal;
        const markerEnd = isDashed ? `url(#ahd-${uid})` : `url(#ah-${uid})`;
        const dashAttr = isDashed ? ` stroke-dasharray="${P.dash(hopW, '6,4')}"` : '';

        // Bezier arc above the line
        const cpY = lineY - arcH - 8;
        svg += `<path d="M${x1},${lineY - 5} Q${midX},${cpY} ${x2},${lineY - 5}" fill="none" stroke="${color}" stroke-width="${hopW}"${dashAttr} stroke-linecap="round" marker-end="${markerEnd}"/>`;

        // Label above arc
        const labelY = cpY - 2;
        svg += `<text x="${midX}" y="${labelY}" text-anchor="middle" dominant-baseline="auto" font-size="12" fill="${P.mono ? P.ink : color}" font-weight="600" font-family='${_DT_FONT}'>${hop.label}</text>`;
    }

    // Start marker (first hop's from) — primary
    if (hops.length > 0) {
        const startX = toX(hops[0].from);
        svg += `<circle cx="${startX}" cy="${lineY}" r="5" fill="${P.mono ? P.ink : _C_PRIMARY}" stroke="${P.paper}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
    }

    // End/answer marker — primary
    if (highlightEnd != null) {
        const endX = toX(highlightEnd);
        // Solid start marker vs hollow end marker: the "where you land" point
        // is told apart by fill-versus-outline, never by hue (INK-6 / LS-5).
        svg += `<circle cx="${endX}" cy="${lineY}" r="5" fill="${P.mono ? P.paper : _C_PRIMARY}" stroke="${P.mono ? P.ink : P.paper}" stroke-width="${P.sw(_DT_STROKE.normal)}"/>`;
        if (!showAnswer) {
            svg += `<text x="${endX}" y="${lineY - 10}" text-anchor="middle" dominant-baseline="auto" font-size="14" fill="${P.mono ? P.ink : _C_PRIMARY}" font-weight="700" font-family='${_DT_FONT}'>?</text>`;
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
    orange: { face: '#fff3e0', border: '#ffb74d', accent: '#e65100' },
    // INK-1 black & white face. Additive: existing schemes are untouched.
    mono: { face: MONO.paper, border: MONO.ink, accent: MONO.ink }
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
    ],
    // INK-1: mono links are all ink. They are told apart by ARC RADIUS, never
    // by hue or by grey level (INK-6, AX-2) — the `grayscale` ramp above is a
    // six-value grey ladder and is NOT standard-compliant; it is kept only so
    // existing callers keep working.
    mono: [MONO.ink, MONO.ink, MONO.ink, MONO.ink, MONO.ink, MONO.ink]
};


export function createBase10Blocks(number, opts = null) {
    const P = _pal(opts);
    const thousands = Math.floor(number / 1000);
    const hundreds = Math.floor((number % 1000) / 100);
    const tens = Math.floor((number % 100) / 10);
    const ones = number % 10;

    // 3-color place-value mapping per IXL convention.
    // Hundreds = blue, tens = green, ones = orange. Thousands reuse blue.
    //
    // MEANING-BEARING COLOUR — but REDUNDANT: the three places are already
    // told apart by the piece's SHAPE and SIZE (64px cube / 58px gridded flat
    // / 10x52 rod / 16px unit) and by the printed place label under each
    // stack. Mono therefore drops the hue and draws each piece as paper with
    // an ink outline, keeping the interior grid that makes a flat a "hundred"
    // and a rod a "ten" (INK-6: the cue is shape, not colour).
    const HUNDREDS_FILL = P.mono ? P.paper : _dtFill(0); // blue
    const TENS_FILL = P.mono ? P.paper : _dtFill(1);     // green
    const ONES_FILL = P.mono ? P.ink : _dtFill(2);       // orange
    const EDGE = P.axis;
    const cellFace = P.mono ? P.paper : 'rgba(255,255,255,0.3)';

    let html = `<div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center; align-items:flex-end; font-family:${_DT_FONT_CSS};${P.mono ? `color:${P.ink};` : ''}">`;

    // Thousands (large cubes) — bumped from 50px to 64px
    if (thousands > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:5px; flex-wrap:wrap; max-width:${Math.min(thousands, 3) * 72}px;">`;
        for (let i = 0; i < Math.min(thousands, 3); i++) {
            html += `<div style="width:64px; height:64px; background:${HUNDREDS_FILL}; border:${P.mono ? MONO_STROKE.heavy : 1.5}px solid ${EDGE}; border-radius:${P.mono ? 0 : 4}px;"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${P.ink};">${thousands},000</div>`;
        html += `</div>`;
    }

    // Hundreds (flats) — bumped from 44px to 58px
    if (hundreds > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:4px; flex-wrap:wrap; max-width:${Math.min(hundreds, 5) * 64}px;">`;
        for (let i = 0; i < Math.min(hundreds, 5); i++) {
            // The 1 px grid gap is what draws the flat's interior grid lines in
            // mono (the dark background shows through). Colour mode never had
            // it, so it stays mono-only and that rendering is unchanged.
            html += `<div style="width:58px; height:58px; background:${P.mono ? EDGE : HUNDREDS_FILL}; border:${P.mono ? MONO_STROKE.heavy : 1}px solid ${EDGE}; display:grid; grid-template-columns:repeat(5,1fr); grid-template-rows:repeat(5,1fr);${P.mono ? ' gap:1px;' : ''} padding:1px;">`;
            for (let j = 0; j < 25; j++) {
                html += `<div style="background:${cellFace}; border-radius:${P.mono ? 0 : 1}px;"></div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${P.ink};">${hundreds}00</div>`;
        html += `</div>`;
    }

    // Tens (rods) — bumped from 8x40 to 10x52
    if (tens > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:4px;">`;
        for (let i = 0; i < tens; i++) {
            html += `${P.mono
                ? `<div style="width:12px; height:52px; background:${EDGE}; border:${MONO_STROKE.heavy}px solid ${EDGE}; display:grid; grid-template-rows:repeat(10,1fr); gap:1px; box-sizing:border-box;">${('<div style="background:' + P.paper + ';"></div>').repeat(10)}</div>`
                : `<div style="width:10px; height:52px; background:${TENS_FILL}; border:1px solid ${EDGE}; border-radius:3px;"></div>`}`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${P.ink};">${tens}0</div>`;
        html += `</div>`;
    }

    // Ones (units) — bumped from 12px to 16px
    if (ones > 0) {
        html += `<div style="text-align:center;">`;
        html += `<div style="display:flex; gap:5px;">`;
        for (let i = 0; i < ones; i++) {
            html += `<div style="width:16px; height:16px; background:${ONES_FILL}; border-radius:50%;${P.mono ? ` border:${MONO_STROKE.hair}px solid ${EDGE}; box-sizing:border-box;` : ''}"></div>`;
        }
        html += `</div>`;
        html += `<div style="font-size:0.95rem; margin-top:4px; font-weight:700; color:${P.ink};">${ones}</div>`;
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

export function createCountingDots(count, groupSize = 5, opts = null) {
    const P = _pal(opts);
    // Bumped dots from 12px to 22px for layout-visual-left wide column
    let html = `<div style="display:flex; gap:14px; flex-wrap:wrap; justify-content:center; font-family:${_DT_FONT_CSS};">`;
    const groups = Math.ceil(count / groupSize);
    for (let g = 0; g < groups; g++) {
        const dotsInGroup = Math.min(groupSize, count - g * groupSize);
        // Soft tint of primary background; single primary dot color.
        // The group tint is decorative; in mono the group is a plain outlined
        // box (RP-22 dot-mat convention) rather than a coloured wash.
        html += P.mono
            ? `<div style="display:flex; gap:6px; padding:10px; background:${P.paper}; border:${MONO_STROKE.hair}px solid ${P.ink}; border-radius:6px;">`
            : `<div style="display:flex; gap:6px; padding:10px; background:${_DT_COLORS.primary}1A; border-radius:10px;">`;
        for (let i = 0; i < dotsInGroup; i++) {
            html += `<div style="width:22px; height:22px; background:${P.mono ? P.ink : _DT_COLORS.primary}; border-radius:50%;"></div>`;
        }
        html += `</div>`;
    }
    html += `</div>`;
    return html;
}

