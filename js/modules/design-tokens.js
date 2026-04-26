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
