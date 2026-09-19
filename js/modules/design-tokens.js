// Design tokens — IXL-aligned color/typography/stroke system
// Single source of truth for all SVG visuals. Imported by every svg-*.js
// and gen-*.js file that emits SVG/HTML graphics.

export const COLORS = {
    // Background and base
    bg: '#ffffff',
    bgPanel: '#f8f9fa',

    // Axis & grid
    axis: '#212121',
    grid: '#e6e8ec',

    // Text
    text: '#212121',
    textMuted: '#5f6368',

    // Single primary
    primary: '#1e88e5',
    primaryDark: '#1565c0',

    // Categorical palette (max 6, color-blind safe)
    fill: ['#1e88e5', '#43a047', '#fb8c00', '#8e24aa', '#e53935', '#00897b'],

    // Soft fill (18% alpha) — append to base hex
    softAlphaSuffix: '2E',  // hex 0x2E = 46/255 ≈ 18%

    // Status
    correct: '#2e7d32',
    wrong: '#c62828',
    neutral: '#9e9e9e',
};

export const STROKE = {
    hair: 0.75,      // grid lines, secondary
    normal: 1.5,     // shape outlines
    bold: 2.5,       // emphasized borders, axes
    arrow: 2,
};

export const FONTS = {
    sans: '"Open Sans", "Inter", system-ui, -apple-system, sans-serif',
};

export const SIZES = {
    // Font sizes for SVG labels (numbers in viewBox units; assume viewBox is in pixels)
    titleFont: 16,
    labelFont: 13,
    ticksFont: 11,
    smallFont: 10,
};

export const RADIUS = {
    point: 4,        // coordinate plane points
    pointBig: 6,
};

// Helper: get a soft fill from a base color
export function softFill(hex) {
    return hex + COLORS.softAlphaSuffix;
}

// Helper: pick a category color by index (cycles)
export function categoricalFill(i) {
    return COLORS.fill[i % COLORS.fill.length];
}

// Helper: produce a CSS-var-with-fallback string suitable for direct
// emission into SVG attribute values (e.g. fill="...", stroke="...").
// Modern browsers evaluate var(--name, #hex) inside attributes for inline
// SVG. The hex fallback keeps print contexts and old browsers safe.
export function cssVar(name, fallback) {
    return `var(--${name}, ${fallback})`;
}

// Helper: resolve a CSS custom property's value at runtime. Used by callers
// that need an actual hex string (rather than a var() expression) — e.g.
// when feeding a value into softFill() which appends an alpha suffix to a
// raw hex.
export function getRuntimeColor(name, fallback) {
    if (typeof window === 'undefined' || typeof document === 'undefined') return fallback;
    try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name);
        return v && v.trim() ? v.trim() : fallback;
    } catch (_) {
        return fallback;
    }
}

// Token name map: design-tokens key → CSS custom property name. This is the
// canonical mapping used by SVG modules so we have a single source of truth.
export const CSS_VAR_NAMES = {
    bg:           'mq-paper',
    bgPanel:      'mq-paper-soft',
    axis:         'mq-ink',
    grid:         'mq-rule',
    text:         'mq-ink',
    textMuted:    'mq-muted',
    primary:      'mq-purple',
    primaryDark:  'mq-purple-d',
    correct:      'mq-correct-ink',
    wrong:        'mq-wrong-ink',
    neutral:      'mq-muted',
};

// Convenience: look up the CSS var-form string for a named COLORS key.
// Falls back to the raw hex if the key is unknown.
export function colorVar(key) {
    const hex = COLORS[key] !== undefined ? COLORS[key] : '#000000';
    const cssName = CSS_VAR_NAMES[key];
    return cssName ? cssVar(cssName, hex) : hex;
}

/* ===================================================================== */
/* MONO (black & white) mode — WORKSHEET_DESIGN_STANDARD.md INK-* rules   */
/* ===================================================================== */

// INK-1: exactly three paint values exist inside question content.
export const MONO = {
    ink:   '#000000',
    paper: '#ffffff',
    grey:  '#949494',   // the single grey ("40% grey"), INK-3
};

// INK-10: the allowed stroke widths are a closed set (pt).
export const STROKE_SET = [0.5, 0.75, 1, 1.5, 2.25];

// Named mono stroke weights, so callers say what a line MEANS rather than
// picking a number (INK-4, INK-11, INK-12).
export const MONO_STROKE = {
    fine:   0.5,    // decorative interior detail only
    hair:   0.75,   // grid interiors, minimum for anything bounding a writing place
    grey:   1,      // INK-4: grey strokes are 1 pt, never thinner
    heavy:  1.5,    // shape outlines, cell borders, the sum rule
    rule:   2.25,   // the heaviest rule (header rule, emphasis)
};

// LS-1: a dotted line is ALWAYS 1 pt round dots at 1.2 mm pitch. It does not
// scale with the width of the line it replaces. The dot is painted by a
// near-zero-length dash under a ROUND cap, which gives a circle of diameter
// DOT_STROKE — so a caller that emits DOT_DASHARRAY must also emit
// stroke-linecap="round" and stroke-width DOT_STROKE, or it gets dashes (or,
// with a butt cap, nothing at all). The dash length is 0.01 rather than 0
// because Blink paints a genuinely zero-length dash as nothing.
// Pitch is given in the same units the widths above use.
export const DOT_STROKE = 1;
export const DOT_PITCH = 3.4;           // 1.2 mm / 0.3528 mm-per-pt
export const DOT_DASHARRAY = `0.01 ${(DOT_PITCH - 0.01).toFixed(2)}`;
// The three attributes a dotted line needs, so no call site can emit a
// half-built one.
export function dotAttrs(color) {
    return `stroke="${color}" stroke-width="${DOT_STROKE}" stroke-dasharray="${DOT_DASHARRAY}" stroke-linecap="round"`;
}

// Snap any width to the nearest allowed value and clamp into the set.
// Used ONLY in mono; colour mode passes widths through untouched so that
// existing renderings stay pixel-identical.
export function snapStroke(w) {
    const n = Number(w);
    if (!isFinite(n) || n <= 0) return STROKE_SET[0];
    if (n <= STROKE_SET[0]) return STROKE_SET[0];
    if (n >= STROKE_SET[STROKE_SET.length - 1]) return STROKE_SET[STROKE_SET.length - 1];
    let best = STROKE_SET[0];
    let bestD = Infinity;
    for (const s of STROKE_SET) {
        const d = Math.abs(s - n);
        if (d < bestD - 1e-9) { bestD = d; best = s; }
    }
    return best;
}

// Normalise the visual option bag. Every svg-*.js entry point accepts either
// the legacy boolean `forPrint` positional argument or an options object.
//
//   normalizeVisualOpts(true)              -> { forPrint: true,  mono: true  }
//   normalizeVisualOpts({ mono: true })    -> { forPrint: false, mono: true  }
//   normalizeVisualOpts({ forPrint: true })-> { forPrint: true,  mono: true  }
//   normalizeVisualOpts({ forPrint: true, mono: false }) -> mono opt-out
//
// `forPrint` is an ALIAS for mono (paper is always black and white), but it
// also keeps its second, unrelated job: absolute width/height attributes
// instead of a fluid `width:100%` style. An explicit `mono: false` opts out.
export function normalizeVisualOpts(o) {
    if (o && typeof o === 'object') {
        const forPrint = !!o.forPrint;
        return { forPrint, mono: o.mono === undefined ? forPrint : !!o.mono };
    }
    return { forPrint: !!o, mono: !!o };
}

// Build the paint set a visual should draw with.
//
// Colour mode returns the existing var(--token, #hex) strings, so nothing
// about today's rendering changes. Mono returns flat ink / paper / grey and a
// stroke snapper. Feedback (`correct` / `wrong`) is EXEMPT in both modes: it
// is chrome, it keeps its colour (SP-30, INK-1 exclusion).
export function palette(o) {
    const { forPrint, mono } = normalizeVisualOpts(o);
    const correct = cssVar('mq-correct-ink', COLORS.correct);
    const wrong = cssVar('mq-wrong-ink', COLORS.wrong);

    if (!mono) {
        return {
            mono: false, forPrint,
            paper:       cssVar('mq-paper', COLORS.bg),
            ink:         cssVar('mq-ink', COLORS.text),
            axis:        cssVar('mq-ink', COLORS.axis),
            text:        cssVar('mq-ink', COLORS.text),
            textMuted:   cssVar('mq-muted', COLORS.textMuted),
            primary:     cssVar('mq-purple', COLORS.primary),
            primaryDark: cssVar('mq-purple-d', COLORS.primaryDark),
            muted:       cssVar('mq-muted', COLORS.neutral),
            rule:        cssVar('mq-rule', COLORS.grid),
            grey:        cssVar('mq-muted', COLORS.neutral),
            correct, wrong,
            // A shaded part: an 18% wash of the primary hue.
            shade:  () => softFill(COLORS.primary),
            // A decorative wash behind a figure; `none` when there isn't one.
            wash:   () => softFill(COLORS.primary),
            fillAt: i => categoricalFill(i),
            sw:     w => w,
            // Dash pattern for a construction / hidden / unknown line. Colour
            // mode keeps whatever the caller already used.
            dash:   (_w, fallback) => fallback,
            dotStroke: DOT_STROKE,
        };
    }

    return {
        mono: true, forPrint,
        paper:       MONO.paper,
        ink:         MONO.ink,
        axis:        MONO.ink,
        text:        MONO.ink,
        // INK-3 / AX-1: text a pupil must read to act is NEVER grey.
        textMuted:   MONO.ink,
        primary:     MONO.ink,
        primaryDark: MONO.ink,
        // Grey is a FILL / non-semantic stroke colour only.
        muted:       MONO.grey,
        rule:        MONO.grey,
        grey:        MONO.grey,
        correct, wrong,
        // INK-3(a): the fill of a shaded part is the single grey.
        shade:  () => MONO.grey,
        // INK-2: no decorative washes on paper.
        wash:   () => 'none',
        fillAt: () => MONO.ink,
        sw:     snapStroke,
        // LS-1 / LS-4: in mono, a dashed stroke that is not a cut line or a
        // missing-digit slot becomes DOTTED — 1 pt round dots at 1.2 mm pitch,
        // fixed, never scaled to the line it replaces. Callers pair this with
        // dotStroke and stroke-linecap="round" (see dotAttrs).
        dash:   () => DOT_DASHARRAY,
        dotStroke: DOT_STROKE,
    };
}

// Convenience for HTML (non-SVG) visuals: a CSS border shorthand.
export function monoBorder(width = MONO_STROKE.heavy, color = MONO.ink) {
    return `${width}px solid ${color}`;
}
