import { randInt, shuffle } from './utils.js';
import { COLORS, STROKE, FONTS, SIZES, softFill, palette, MONO_STROKE } from './design-tokens.js';

// Black & white support. Every entry point below takes an optional trailing
// `opts` bag; `{ mono: true }` (or the legacy `forPrint` alias) paints the
// figure in ink / paper / the single grey and snaps stroke widths to the
// allowed set. Omitting it leaves today's colour rendering untouched.
// See WORKSHEET_DESIGN_STANDARD.md INK-1..INK-13.
function _pal(opts) { return palette(opts); }

// The fraction builders below emit CLASSED markup (.frac, .frac-equation,
// .frac-compare-visual, .frac-bar-segment) whose colour lives in
// css/ui-components.css — the orange operator, the green equals, the pulsing
// compare symbol, the translucent boxes. `opts.mono` has to beat those
// classes without the caller having applied the .mq-mono scope, so the mono
// path writes the override inline (inline style outranks a class rule).
// Colour mode emits nothing at all, so today's rendering is byte-identical.
function _monoTextStyle(P) { return P.mono ? ` style="color:${P.ink};"` : ''; }
function _monoBoxStyle(P, extra = '') {
    return P.mono
        ? ` style="color:${P.ink};background:${P.paper};background-image:none;box-shadow:none;text-shadow:none;animation:none;opacity:1;${extra}"`
        : '';
}

// Create HTML for a properly stacked fraction display
export function fracHTML(num, den, size = '') {
    const sizeClass = size ? ` frac-${size}` : '';
    return `<span class="frac${sizeClass}"><span class="num">${num}</span><span class="den">${den}</span></span>`;
}

// Create SVG circle (pie chart) fraction visual — IXL-style flat single-color
// fillColor is honored when an explicit hex/token is passed; otherwise we use
// the design-system primary. emptyColor defaults to bg (white).
export function fracCircleSVG(num, den, size = 100, fillColor = COLORS.primary, emptyColor = COLORS.bg, opts = null) {
    const P = _pal(opts);
    const cx = size / 2;
    const cy = size / 2;
    const r = (size / 2) - 5;
    // MEANING-BEARING COLOUR: "shaded part" vs "unshaded part". In mono the
    // distinction is carried by the single grey against paper (INK-3a), which
    // is exactly how the sample workbooks draw it — no meaning is lost.
    if (P.mono) { fillColor = P.shade(); emptyColor = P.paper; }
    const borderColor = P.axis;

    // Guard: clamp num to [0, den] to prevent rendering issues with improper fractions
    num = Math.max(0, Math.min(num, den));

    // A whole (num >= den) is drawn like any other fraction: every part shaded AND every
    // partition drawn (RP-90). It used to be a solid disc with "6/6" printed in the middle,
    // which is the answer (RP-1) on every "write 1 as a fraction" item, and in print the disc
    // came out as a black blob with no parts to count. A single-part whole (den 1) is one
    // shaded disc, with no label.
    if (num >= den && den <= 1) {
        return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fillColor}" stroke="${borderColor}" stroke-width="${P.sw(STROKE.normal)}"/>
        </svg>`;
    }

    // Scale slice/divider stroke widths inversely with density. At den=24,
    // a 60px circle has ~2.5px wedges; drawing STROKE.normal (1.5) on every
    // slice and STROKE.hair (0.75) on every radial leaves no room for the
    // fill color, so dense circles look uniformly dark and visually smaller
    // than sparse ones even at the same viewBox size.
    const densityScale = Math.min(1, 8 / den);
    // INK-10/INK-11: in mono a part boundary never drops below 0.75 pt, so it
    // survives a photocopy; density scaling is a colour-mode nicety only.
    const sliceStroke = P.mono ? MONO_STROKE.hair : Math.max(0.3, STROKE.normal * densityScale);
    const radialStroke = P.mono ? MONO_STROKE.hair : Math.max(0.2, STROKE.hair * densityScale);

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

        slices += `<path d="${path}" fill="${isFilled ? fillColor : emptyColor}" stroke="${borderColor}" stroke-width="${sliceStroke}"/>`;
    }

    // Add dividing lines for clarity (hairline weight — divisions are secondary)
    let lines = '';
    for (let i = 0; i < den; i++) {
        const angle = ((i * sliceAngle) - 90) * Math.PI / 180;
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        lines += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${borderColor}" stroke-width="${radialStroke}"/>`;
    }

    // No drop shadow — IXL uses flat vector art.
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${emptyColor}" stroke="${borderColor}" stroke-width="${P.sw(STROKE.normal)}"/>
        ${slices}
        ${lines}
    </svg>`;
}

// Create fraction bar visual (rectangular segments) — single color, axis-color borders
export function fracBarHTML(num, den, fillColor = COLORS.primary, width = 'auto', opts = null) {
    const P = _pal(opts);
    const segmentWidth = Math.max(30, Math.min(50, 250 / den));
    // MEANING-BEARING COLOUR: shaded vs unshaded part -> grey vs paper (INK-3a).
    if (P.mono) fillColor = P.shade();
    const borderColor = P.axis;
    const emptyFill = P.mono ? P.paper : COLORS.bg;
    // A fraction part is structure, so in mono its corners are square and its
    // outline is the hairline part-boundary weight (LS corner table, RP-90).
    const segShape = P.mono ? `border-radius:0;border-width:${MONO_STROKE.hair}px;` : '';
    const segments = Array.from({length: den}, (_, i) => {
        const isFilled = i < num;
        return `<div class="frac-bar-segment ${isFilled ? 'filled' : 'empty'}" style="width:${segmentWidth}px;height:${segmentWidth}px;${segShape}${isFilled ? `background:${fillColor};border-color:${borderColor};` : `background:${emptyFill};border-color:${borderColor};`}"></div>`;
    }).join('');

    // .frac-bar-visual carries a light-yellow tray in ui-components.css. Inline
    // style beats the class so the mono bar sits on plain paper (INK-1).
    const tray = P.mono
        ? `background:${P.paper};border:${MONO_STROKE.hair}px solid ${P.ink};border-radius:0;`
        : '';
    return `<div class="frac-bar-visual" style="width:${width};${tray}">${segments}</div>`;
}

// Create a combined fraction display with visual
export function fracWithVisual(num, den, visualType = 'bar', size = 'lg', opts = null) {
    const P = _pal(opts);
    const fracElement = fracHTML(num, den, size);
    let visual = '';

    if (visualType === 'circle') {
        visual = fracCircleSVG(num, den, 80, COLORS.primary, COLORS.bg, opts);
    } else if (visualType === 'bar') {
        visual = fracBarHTML(num, den, COLORS.primary, 'auto', opts);
    }

    // fracHTML() carries no colour of its own, so its numerals inherit the
    // host page's text colour. Under opts.mono the host may still be a colour
    // surface, so the container pins the colour to ink (INK-1 / AX-1).
    return `<div class="frac-visual-container"${_monoTextStyle(P)}>
        ${fracElement}
        ${visual}
    </div>`;
}

// Create fraction equation display (for add/subtract)
// Both operands use the same primary color — operator differentiates them, not color.
export function fracEquationHTML(num1, den1, op, num2, den2, showVisual = true, opts = null) {
    const P = _pal(opts);
    const opSymbol = op === '+' || op === 'add' ? '+' : '−';
    const operandColor = P.mono ? P.shade() : COLORS.primary;

    let visualSection = '';
    if (showVisual) {
        visualSection = `
            <div style="display:flex;align-items:center;gap:15px;margin-top:15px;justify-content:center;">
                ${fracBarHTML(num1, den1, operandColor, 'auto', opts)}
                <span style="font-size:1.5rem;color:${P.axis};">${opSymbol}</span>
                ${fracBarHTML(num2, den2, operandColor, 'auto', opts)}
            </div>`;
    }

    // INK-3 / AX-1: digits a pupil must read are never grey — the operand
    // numerals stay ink in mono even though the bars they describe are grey.
    const operandInk = P.mono ? P.ink : operandColor;
    // .frac-op is orange and .frac-equals green in ui-components.css, and the
    // answer box is a green DASHED slot on a green wash. In mono the signs go
    // to ink and the slot becomes a solid square-cornered ink box, which is
    // the only shape a scored answer is allowed to sit in (SL-8, LS-3).
    const signStyle = P.mono ? ` style="color:${P.ink};"` : '';
    const slotStyle = P.mono
        ? ` style="color:${P.ink};background:${P.paper};border:${MONO_STROKE.hair}px solid ${P.ink};border-radius:0;"`
        : '';
    const barStyle = P.mono ? ` style="background:${P.ink};"` : '';
    return `<div class="frac-equation"${_monoBoxStyle(P)}>
        <span class="frac frac-2xl" style="color:${operandInk};">
            <span class="num">${num1}</span>
            <span class="den">${den1}</span>
        </span>
        <span class="frac-op"${signStyle}>${opSymbol}</span>
        <span class="frac frac-2xl" style="color:${operandInk};">
            <span class="num">${num2}</span>
            <span class="den">${den2}</span>
        </span>
        <span class="frac-equals"${signStyle}>=</span>
        <span class="frac-answer-box"${_monoTextStyle(P)}>
            <span class="answer-num"${slotStyle}>?</span>
            <span class="answer-bar"${barStyle}></span>
            <span class="answer-den"${slotStyle}>?</span>
        </span>
    </div>
    ${visualSection}`;
}

// Create fraction comparison display — same color for both fractions
// (compare visually via SIZE/SHADING, not via color, per IXL convention).
export function fracCompareHTML(num1, den1, num2, den2, opts = null) {
    const P = _pal(opts);
    const compareColor = P.mono ? P.shade() : COLORS.primary;
    const compareInk = P.mono ? P.ink : compareColor;
    // .compare-symbol is orange and pulses (opacity 0.8), and .frac-compare-box
    // sits on a translucent wash — INK-2 allows neither on paper. The first
    // fraction also carried no colour of its own and simply inherited the
    // host's, which is why it stayed off-black under opts.mono.
    const symbolStyle = P.mono ? ` style="color:${P.ink};animation:none;opacity:1;"` : '';
    return `<div class="frac-compare-visual"${_monoTextStyle(P)}>
        <div class="frac-compare-box"${_monoBoxStyle(P)}>
            ${fracCircleSVG(num1, den1, 90, compareColor, P.mono ? P.paper : COLORS.bg, opts)}
            <span class="frac frac-xl"${P.mono ? ` style="color:${compareInk};"` : ''}>${fracHTML(num1, den1, 'xl').replace(/<span class="frac[^"]*">/, '').replace(/<\/span>$/, '')}</span>
        </div>
        <span class="compare-symbol"${symbolStyle}>?</span>
        <div class="frac-compare-box"${_monoBoxStyle(P)}>
            ${fracCircleSVG(num2, den2, 90, compareColor, P.mono ? P.paper : COLORS.bg, opts)}
            <span class="frac frac-xl" style="color:${compareInk};">${fracHTML(num2, den2, 'xl').replace(/<span class="frac[^"]*">/, '').replace(/<\/span>$/, '')}</span>
        </div>
    </div>`;
}

// Create text representation for TTS (screen reader friendly)
export function fracText(num, den) {
    return `${num} over ${den}`;
}

export function fractionToPercent(n, d) { return Math.round((n / d) * 100) + "%"; }
