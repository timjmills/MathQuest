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
