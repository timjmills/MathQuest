// print-ink.js — the ONE place legacy print markup is put into ink.
//
// WORKSHEET_DESIGN_STANDARD.md section 4: a printed sheet holds exactly three paint values —
// ink #000, paper #fff and the one grey #949494 (INK-1) — with no gradients, shadows or filters
// (INK-2), and no solid black shape bigger than 7 mm (INK-5).
//
// The generators predate that standard. Roughly 250 legacy print branches and the screen
// visuals they borrow colour their pictures with `var(--accent-*)`, literal hexes and white
// labels. The print path used to "fix" that by pointing every `--accent-*` at #000, which is
// how the owner's printout of 2026-09-24 came out: place-value disks as solid black discs with
// black-on-black labels, fraction bars as black slabs with invisible partitions.
//
// New work draws in ink at the source (`opts.mono` in the svg-* builders, the sheet kit). This
// module is the safety net for everything that has not been migrated yet, and it runs over the
// HTML of every printed cell (formatProblemForPrint). It maps each paint by what the paint is
// FOR, never by a blanket substitution:
//
//   role      a colour becomes ...
//   ------    ------------------------------------------------------------------------------
//   text      ink, always (INK-3: text a pupil must read is never grey). White text survives
//             only on an element whose own background stays black (a number tab).
//   bg        HTML background. A tint becomes paper. A strong colour means "this is a thing"
//             (a disk, a chip, a bar), so it becomes paper WITH an ink outline and its label
//             turns ink — a disk stays a disk. A class that says the part is shaded
//             (`filled`, `shaded`) becomes the grey instead. Thin rules stay ink.
//   fill      SVG shape fill. A strong colour means "marked / shaded" in legacy SVG (fraction
//             parts, bars, blocks), so it becomes the one grey (INK-3a); tints become paper;
//             black stays black.
//   stroke    lines. Colours and dark greys become ink; light greys the one grey; a white
//             stroke on a shape that ends up white becomes ink so its partitions survive.
//   border    as stroke; `dashed` becomes solid (LS-2: dashes mean "cut" or the missing-digit
//             box only) and widths above 1.5 pt are capped at 1.5 pt (INK-10).
//
// Shadows, text shadows, filters and gradient images are removed; a fractional opacity is set
// to 1 (INK-2), so a faded part prints as a part, not as a pale ghost.
//
// Pure module: no DOM, no window, no imports. Unit tests: tests/scripts/ws-ink-unit.mjs.

export const INK_BLACK = '#000';
export const INK_PAPER = '#fff';
export const INK_GREY = '#949494';

/* ------------------------------------------------------------------ colour reading */

const NAMED = {
    white: [255, 255, 255], black: [0, 0, 0], red: [255, 0, 0], green: [0, 128, 0], blue: [0, 0, 255],
    orange: [255, 165, 0], purple: [128, 0, 128], yellow: [255, 255, 0], gray: [128, 128, 128],
    grey: [128, 128, 128], silver: [192, 192, 192], lightgray: [211, 211, 211], lightgrey: [211, 211, 211],
    darkgray: [169, 169, 169], darkgrey: [169, 169, 169], dimgray: [105, 105, 105], dimgrey: [105, 105, 105],
    gainsboro: [220, 220, 220], whitesmoke: [245, 245, 245], gold: [255, 215, 0], pink: [255, 192, 203],
    teal: [0, 128, 128], navy: [0, 0, 128], maroon: [128, 0, 0], olive: [128, 128, 0], lime: [0, 255, 0],
    aqua: [0, 255, 255], cyan: [0, 255, 255], magenta: [255, 0, 255], fuchsia: [255, 0, 255],
    brown: [165, 42, 42], crimson: [220, 20, 60], coral: [255, 127, 80], tomato: [255, 99, 71],
    indigo: [75, 0, 130], violet: [238, 130, 238], lightblue: [173, 216, 230], lightgreen: [144, 238, 144],
    skyblue: [135, 206, 235], royalblue: [65, 105, 225], dodgerblue: [30, 144, 255], steelblue: [70, 130, 180],
    darkblue: [0, 0, 139], darkgreen: [0, 100, 0], darkred: [139, 0, 0], orangered: [255, 69, 0],
    slategray: [112, 128, 144], slategrey: [112, 128, 144], lightyellow: [255, 255, 224], ivory: [255, 255, 240],
    beige: [245, 245, 220], lavender: [230, 230, 250], honeydew: [240, 255, 240], aliceblue: [240, 248, 255],
    mintcream: [245, 255, 250], seashell: [255, 245, 238], snow: [255, 250, 250], ghostwhite: [248, 248, 255],
    linen: [250, 240, 230], oldlace: [253, 245, 230], floralwhite: [255, 250, 240], lemonchiffon: [255, 250, 205],
    cornsilk: [255, 248, 220], azure: [240, 255, 255], mistyrose: [255, 228, 225], goldenrod: [218, 165, 32],
    darkorange: [255, 140, 0], forestgreen: [34, 139, 34], seagreen: [46, 139, 87], hotpink: [255, 105, 180],
    deeppink: [255, 20, 147], firebrick: [178, 34, 34], chocolate: [210, 105, 30], tan: [210, 180, 140],
    khaki: [240, 230, 140], salmon: [250, 128, 114], plum: [221, 160, 221], orchid: [218, 112, 214],
    turquoise: [64, 224, 208], mediumseagreen: [60, 179, 113], cornflowerblue: [100, 149, 237],
    darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], lightslategray: [119, 136, 153],
};

// What the app's custom properties resolve to, as a colour CLASS (not a value): the legacy
// markup only ever uses them for one purpose each.
const VAR_KIND = [
    [/^--(?:ws|mq)-ink$/, 'black'], [/^--(?:ws|mq)-paper$/, 'white'], [/^--ws-grey$/, 'grey'],
    [/^--print-(?:ink|ink-soft|ink-mute|accent|rule)$/, 'black'],
    [/^--print-(?:paper|tint|accent-soft)$/, 'white'], [/^--print-rule-soft$/, 'grey'],
    [/^--text-/, 'black'], [/^--bg-/, 'white'], [/^--border/, 'light'], [/^--mq-rule$/, 'light'],
    [/^--mq-muted$/, 'grey'], [/^--accent/, 'strong'], [/^--mq-(?:purple|primary|blue|green|orange)/, 'strong'],
    [/^--(?:primary|secondary|success|warning|danger|info)/, 'strong'],
];

function hexRGB(h) {
    let s = h.slice(1);
    if (s.length === 3 || s.length === 4) s = s.split('').map(c => c + c).join('');
    if (s.length !== 6 && s.length !== 8) return null;
    const n = [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16));
    if (n.some(Number.isNaN)) return null;
    const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1;
    return { rgb: n, a };
}

function hslRGB(h, s, l) {
    h = ((h % 360) + 360) % 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2;
    const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
        : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    return [r, g, b].map(v => Math.round((v + m) * 255));
}

function funcArgs(inner) {
    return inner.split(/[\s,\/]+/).filter(Boolean);
}

/** Split `var(--a, fallback)` without being fooled by the fallback's own parentheses. */
function splitVar(v) {
    const inner = v.slice(4, -1);
    let depth = 0;
    for (let i = 0; i < inner.length; i++) {
        const ch = inner[i];
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === ',' && depth === 0) return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
    }
    return [inner.trim(), ''];
}

/**
 * Read one colour token and say what KIND of paint it is.
 * @returns {{kind: 'none'|'current'|'url'|'white'|'light'|'grey'|'black'|'strong'|'unknown', rgb?: number[]}}
 */
export function classifyColor(value) {
    let v = String(value == null ? '' : value).trim().toLowerCase().replace(/\s*!important$/, '');
    if (!v) return { kind: 'unknown' };
    if (v === 'none' || v === 'transparent') return { kind: 'none' };
    if (v === 'currentcolor' || v === 'inherit' || v === 'initial' || v === 'unset' || v === 'revert') return { kind: 'current' };
    if (v.startsWith('url(')) return { kind: 'url' };
    // `var(--accent-orange)20` — a hex alpha glued onto a variable (legacy tint idiom)
    const glued = v.match(/^(var\(.*\))([0-9a-f]{2})$/);
    let alphaOverride = null;
    if (glued) { v = glued[1]; alphaOverride = parseInt(glued[2], 16) / 255; }
    if (v.startsWith('var(') && v.endsWith(')')) {
        const [name, fallback] = splitVar(v);
        let kind = null;
        for (const [re, k] of VAR_KIND) if (re.test(name)) { kind = k; break; }
        if (!kind && fallback) return classifyColor(fallback);
        if (!kind) return { kind: 'unknown' };
        if (alphaOverride !== null && alphaOverride < 0.5 && kind === 'strong') return { kind: 'light' };
        return { kind };
    }
    let rgb = null, a = 1;
    if (v[0] === '#') {
        const h = hexRGB(v);
        if (!h) return { kind: 'unknown' };
        rgb = h.rgb; a = h.a;
    } else if (/^rgba?\(/.test(v)) {
        const p = funcArgs(v.slice(v.indexOf('(') + 1, -1));
        if (p.length < 3) return { kind: 'unknown' };
        rgb = p.slice(0, 3).map(x => (x.endsWith('%') ? parseFloat(x) * 2.55 : parseFloat(x)));
        if (p[3] !== undefined) a = p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    } else if (/^hsla?\(/.test(v)) {
        const p = funcArgs(v.slice(v.indexOf('(') + 1, -1));
        if (p.length < 3) return { kind: 'unknown' };
        rgb = hslRGB(parseFloat(p[0]), parseFloat(p[1]) / 100, parseFloat(p[2]) / 100);
        if (p[3] !== undefined) a = p[3].endsWith('%') ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
    } else if (NAMED[v]) {
        rgb = NAMED[v];
    } else {
        return { kind: 'unknown' };
    }
    if (rgb.some(x => !Number.isFinite(x)) || !Number.isFinite(a)) return { kind: 'unknown' };
    if (a <= 0) return { kind: 'none' };
    // Composite over paper: a 10 % wash of blue is a near-white, not a blue.
    const c = rgb.map(x => Math.round(a * Math.max(0, Math.min(255, x)) + (1 - a) * 255));
    const max = Math.max(...c), min = Math.min(...c), chroma = max - min;
    if (chroma < 24) {
        if (max >= 235) return { kind: 'white', rgb: c };
        if (max <= 72) return { kind: 'black', rgb: c };
        if (max >= 195) return { kind: 'light', rgb: c };
        return { kind: 'grey', rgb: c };
    }
    if (max < 80) return { kind: 'black', rgb: c };
    if ((max + min) / 2 >= 212) return { kind: 'light', rgb: c };
    return { kind: 'strong', rgb: c };
}

/* ------------------------------------------------------------ declaration helpers */

/** Split a style string into [text, isDeclaration] chunks without breaking entities or parens. */
function splitDeclarations(style) {
    const out = [];
    let depth = 0, quote = '', start = 0;
    for (let i = 0; i < style.length; i++) {
        const ch = style[i];
        if (quote) { if (ch === quote) quote = ''; continue; }
        if (ch === '"' || ch === '\'') { quote = ch; continue; }
        if (ch === '(') depth++;
        else if (ch === ')') depth = Math.max(0, depth - 1);
        else if (ch === '&') {
            const m = /^&(?:#\d+|#x[0-9a-f]+|[a-z]+);/i.exec(style.slice(i));
            if (m) { i += m[0].length - 1; continue; }
        } else if (ch === ';' && depth === 0) {
            out.push(style.slice(start, i));
            start = i + 1;
        }
    }
    out.push(style.slice(start));
    return out;
}

/** Tokens of a CSS value, split on whitespace outside parentheses. */
function valueTokens(v) {
    const out = [];
    let depth = 0, cur = '';
    for (const ch of v) {
        if (ch === '(') depth++;
        if (ch === ')') depth = Math.max(0, depth - 1);
        if (/\s/.test(ch) && depth === 0) { if (cur) out.push(cur); cur = ''; } else cur += ch;
    }
    if (cur) out.push(cur);
    return out;
}

const COLOR_TOKEN = /^(#[0-9a-f]{3,8}|rgba?\(.*\)|hsla?\(.*\)|var\(.*\)[0-9a-f]{0,2}|currentcolor|transparent|[a-z]+)$/i;
const BORDER_STYLES = new Set(['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset']);
const BORDER_WIDTH = /^(?:\d*\.?\d+(?:px|pt|mm|em|rem|cm|in)?|thin|medium|thick)$/i;
const isColorToken = (t) => COLOR_TOKEN.test(t) && !BORDER_STYLES.has(t.toLowerCase()) && !BORDER_WIDTH.test(t)
    && classifyColor(t).kind !== 'unknown';

/** px value of a length, or null. mm and pt are converted; percentages and em are unknown. */
function lengthPx(v) {
    const m = /^\s*(-?\d*\.?\d+)\s*(px|mm|pt|cm|in)?\s*$/i.exec(String(v || ''));
    if (!m) return null;
    const n = parseFloat(m[1]);
    const u = (m[2] || 'px').toLowerCase();
    return u === 'px' ? n : u === 'mm' ? n * 96 / 25.4 : u === 'pt' ? n * 96 / 72 : u === 'cm' ? n * 960 / 25.4 : n * 96;
}

/* -------------------------------------------------------------------- paint maps */

/** Text: ink, always. White text keeps only on an element whose own background stays black. */
export function inkText(value, ownBgKind) {
    const k = classifyColor(value).kind;
    if (k === 'none' || k === 'current' || k === 'unknown' || k === 'url') return null;
    if (k === 'white' && ownBgKind === 'black') return null;
    return k === 'black' && /^#0{3}(?:0{3})?$/i.test(String(value).trim()) ? null : INK_BLACK;
}

/** SVG shape fill. Strong colour = a marked / shaded part in legacy SVG -> the one grey. */
export function inkFill(value) {
    const k = classifyColor(value).kind;
    switch (k) {
        case 'white': case 'light': return INK_PAPER;
        case 'grey': return INK_GREY;
        case 'black': return INK_BLACK;
        case 'strong': return INK_GREY;
        default: return null;
    }
}

/** Lines: ink, or the one grey for a light rule. White is decided by the caller (it needs the fill). */
export function inkStroke(value) {
    const c = classifyColor(value);
    switch (c.kind) {
        case 'black': case 'strong': return INK_BLACK;
        // A dark grey (#555, #666) was legacy "ink"; a mid grey (#999) was a light rule.
        case 'grey': return (c.rgb ? Math.max(...c.rgb) <= 125 : false) ? INK_BLACK : INK_GREY;
        case 'light': return INK_GREY;
        case 'white': return 'white';
        default: return null;
    }
}

/** Replace a value but keep an `!important` suffix. */
function keepImportant(orig, next) {
    return /!important\s*$/i.test(orig) ? `${next} !important` : next;
}
// Two values are the same paint when they spell the same colour (#000 = #000000 = black), so
// markup that is already in ink comes back byte-identical.
const canon = (v) => {
    let s = String(v).trim().toLowerCase().replace(/\s+/g, '');
    if (s === 'black') s = '#000'; else if (s === 'white') s = '#fff';
    if (/^#[0-9a-f]{6}$/.test(s) && s[1] === s[2] && s[3] === s[4] && s[5] === s[6]) s = `#${s[1]}${s[3]}${s[5]}`;
    return s;
};
const same = (a, b) => canon(a) === canon(b);

/* --------------------------------------------------------------- tag processing */

const SVG_TEXT_TAGS = new Set(['text', 'tspan', 'textpath']);
const SVG_SHAPES = new Set(['rect', 'circle', 'ellipse', 'path', 'polygon', 'polyline', 'line', 'g', 'svg', 'use', 'symbol']);
const HANDLED_PROPS = /^(?:color|background|background-color|background-image|border|border-(?:top|right|bottom|left)|border(?:-(?:top|right|bottom|left))?-(?:color|style|width)|outline|outline-color|box-shadow|text-shadow|filter|fill|stroke|opacity|fill-opacity|stroke-opacity|stop-color|text-decoration|text-decoration-color|column-rule-color|caret-color)$/i;

const ATTR_RE = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttrs(src) {
    const list = [];
    let m;
    ATTR_RE.lastIndex = 0;
    while ((m = ATTR_RE.exec(src))) {
        const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4];
        list.push({ name: m[1], lower: m[1].toLowerCase(), value, quote: m[2] !== undefined ? '"' : m[3] !== undefined ? '\'' : '"', raw: m[0] });
    }
    return list;
}

function serialiseAttr(a) {
    if (a.value === undefined) return a.name;
    const q = a.value.includes('"') ? '\'' : '"';
    return `${a.name}=${q}${a.value}${q}`;
}

/**
 * Process one element's attributes. Returns the new attribute list (or null when nothing changed).
 * `tag` is lower-case.
 */
function inkElement(tag, attrs, ctx = {}) {
    const isSvgText = SVG_TEXT_TAGS.has(tag);
    const isSvgShape = SVG_SHAPES.has(tag);
    const get = (n) => attrs.find(a => a.lower === n);
    const styleAttr = get('style');
    const cls = (get('class') || {}).value || '';
    const exemptDash = /\bbox-unknown\b/.test((get('data-ws-shape') || {}).value || '') || !!get('data-ws-cut');
    const shadedClass = /(?:^|\s)(?:filled|shaded|is-filled|is-shaded)(?:\s|$)/.test(cls);
    let changed = false;

    // --- the element's declarations, as [{prop, value, raw}] + untouched chunks
    const chunks = styleAttr ? splitDeclarations(styleAttr.value) : [];
    const decls = chunks.map(raw => {
        const i = raw.indexOf(':');
        if (i < 0) return { raw };
        return { raw, prop: raw.slice(0, i).trim().toLowerCase(), value: raw.slice(i + 1).trim() };
    });
    const dget = (p) => { for (let i = decls.length - 1; i >= 0; i--) if (decls[i].prop === p) return decls[i]; return null; };

    // --- sizes (to tell a rule or a small tab from a big shape)
    const sizeOf = (p) => { const d = dget(p); return d ? lengthPx(d.value.replace(/\s*!important$/i, '')) : null; };
    const w = sizeOf('width') ?? sizeOf('min-width');
    const h = sizeOf('height') ?? sizeOf('min-height');
    const thin = (w !== null && w <= 4) || (h !== null && h <= 4);
    const smallBox = w !== null && h !== null && w <= 26.5 && h <= 26.5;   // 7 mm
    // A counter: a small round thing. Coloured counters become SOLID counters (INK-5 allows a
    // black fill up to 7 mm; RP-11 draws counters solid), never grey smudges or hollow specks.
    const radius = (dget('border-radius') || {}).value || '';
    const htmlCounter = smallBox && /50%|999|9999/.test(radius);
    const num = (n) => { const a = get(n); const v = a ? parseFloat(a.value) : NaN; return Number.isFinite(v) ? v : null; };
    const svgCounter = (tag === 'circle' && num('r') !== null && num('r') <= 12)
        || (tag === 'ellipse' && num('rx') !== null && num('ry') !== null && Math.max(num('rx'), num('ry')) <= 12)
        // ...and a small polygon is a marker (an arrow tip, a pointer), which is ink (LS-7).
        || (tag === 'polygon' && (() => {
            const pts = String((get('points') || {}).value || '').trim().split(/[\s,]+/).map(Number).filter(Number.isFinite);
            if (pts.length < 6) return false;
            const xs = pts.filter((_, i) => i % 2 === 0), ys = pts.filter((_, i) => i % 2 === 1);
            return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) <= 16;
        })());

    // --- background first: the text colour depends on it
    let bgKind = null;          // final kind of this element's own background
    let bgWasStrong = false;
    const bgFromValue = (value) => {
        const toks = valueTokens(value.replace(/\s*!important$/i, ''));
        if (toks.some(t => /^url\(/i.test(t))) return null;      // an image: leave it
        const grad = /gradient\(/i.test(value);
        let colorTok = null;
        if (grad) {
            const m = value.match(/(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|var\([^)]*\))/i);
            colorTok = m ? m[1] : null;
        } else {
            colorTok = toks.find(isColorToken) || null;
        }
        if (!colorTok && !grad) return null;
        const k = colorTok ? classifyColor(colorTok).kind : 'strong';
        let out;
        if (k === 'none') out = grad ? 'transparent' : null;
        else if (k === 'current' || k === 'url' || k === 'unknown') out = grad ? INK_PAPER : null;
        else if (k === 'white' || k === 'light') out = INK_PAPER;
        else if (k === 'grey') out = shadedClass ? INK_GREY : INK_PAPER;
        else if (k === 'black') out = (thin || smallBox) ? INK_BLACK : INK_PAPER;
        else /* strong */ {
            bgWasStrong = !thin && !htmlCounter;
            out = (thin || htmlCounter) ? INK_BLACK : shadedClass ? INK_GREY : INK_PAPER;
        }
        if (k === 'black' && out === INK_PAPER) bgWasStrong = true;
        bgKind = out === INK_BLACK ? 'black' : out === INK_GREY ? 'grey' : out ? 'white' : null;
        return out;
    };
    for (const d of decls) {
        if (!d.prop) continue;
        if (d.prop === 'background' || d.prop === 'background-color') {
            const out = bgFromValue(d.value);
            if (out && !same(d.value.replace(/\s*!important$/i, ''), out)) { d.value = keepImportant(d.value, out); d.changed = true; }
        } else if (d.prop === 'background-image' && /gradient\(/i.test(d.value)) {
            d.value = keepImportant(d.value, 'none'); d.changed = true;
        }
    }
    const bgcolor = get('bgcolor');
    if (bgcolor && bgcolor.value) {
        const out = bgFromValue(bgcolor.value);
        if (out && !same(bgcolor.value, out)) { bgcolor.value = out; changed = true; }
    }

    // --- the SVG fill decides what a white stroke means
    let fillKind = null;
    let hollowed = false;
    const mapFill = (value) => {
        if (isSvgText) return inkText(value, null);
        let out = inkFill(value);
        if (out === INK_GREY && svgCounter && classifyColor(value).kind === 'strong') out = INK_BLACK;
        // A big coloured circle in a drawing with NO paper parts is a counter or a disk, not a
        // shaded part (an array, a set of disks): it becomes a hollow ink circle (RP-81), not a
        // grey one. Where the drawing also has paper parts, colour means "shaded": grey.
        else if (out === INK_GREY && (tag === 'circle' || tag === 'ellipse') && !ctx.svgPaper
            && classifyColor(value).kind === 'strong') { out = INK_PAPER; hollowed = true; }
        const k = classifyColor(value).kind;
        fillKind = out === INK_GREY ? 'grey' : out === INK_BLACK ? 'black' : out === INK_PAPER ? 'white'
            : (k === 'none' ? 'none' : k === 'url' ? 'url' : null);
        return out;
    };
    const fillAttr = get('fill');
    if (fillAttr && fillAttr.value !== undefined) {
        const out = mapFill(fillAttr.value);
        if (out && !same(fillAttr.value, out)) { fillAttr.value = out; changed = true; }
    }
    const fillDecl = dget('fill');
    if (fillDecl) {
        const out = mapFill(fillDecl.value.replace(/\s*!important$/i, ''));
        if (out && !same(fillDecl.value.replace(/\s*!important$/i, ''), out)) { fillDecl.value = keepImportant(fillDecl.value, out); fillDecl.changed = true; }
    }

    const mapStroke = (value) => {
        const out = inkStroke(value);
        if (out === 'white') {
            if (isSvgText) return null;                           // a halo round text
            return (fillKind === 'grey' || fillKind === 'black') ? null : INK_BLACK;
        }
        return out;
    };
    const strokeAttr = get('stroke');
    if (strokeAttr && strokeAttr.value !== undefined) {
        const out = mapStroke(strokeAttr.value);
        if (out && !same(strokeAttr.value, out)) { strokeAttr.value = out; changed = true; }
    }

    if (hollowed) {
        const st = get('stroke');
        if (!st || !st.value || /^(?:none|transparent|white|#fff(?:fff)?)$/i.test(st.value)) {
            if (st) st.value = INK_BLACK; else attrs.push({ name: 'stroke', lower: 'stroke', value: INK_BLACK });
            if (!get('stroke-width')) attrs.push({ name: 'stroke-width', lower: 'stroke-width', value: '1.5' });
            changed = true;
        }
    }

    // --- every other declaration
    for (const d of decls) {
        if (!d.prop || !HANDLED_PROPS.test(d.prop)) continue;
        const bare = d.value.replace(/\s*!important$/i, '');
        let out = null;
        switch (d.prop) {
            case 'color':
                out = inkText(bare, bgKind);
                // White on a black counter or tab is legal and has to stay white in print, where
                // css/print-worksheet.css forces every glyph in a cell to #000 !important. Only an
                // inline !important outranks that.
                if (out === null && bgKind === 'black' && classifyColor(bare).kind === 'white' && !/!important/i.test(d.value)) {
                    d.value = `${bare} !important`; d.changed = true;
                }
                break;
            case 'stroke': out = mapStroke(bare); break;
            case 'stop-color': out = inkFill(bare); break;
            case 'text-decoration-color': case 'column-rule-color': out = inkText(bare, null); break;
            case 'text-decoration': out = valueTokens(bare).map(t => (isColorToken(t) ? (inkText(t, null) || t) : t)).join(' '); break;
            case 'box-shadow': case 'text-shadow': out = /^none$/i.test(bare) ? null : 'none'; break;
            case 'filter': out = /^none$/i.test(bare) ? null : 'none'; break;
            case 'opacity': case 'fill-opacity': case 'stroke-opacity': {
                const n = parseFloat(bare);
                out = Number.isFinite(n) && n >= 0.15 && n < 1 ? '1' : null;
                break;
            }
            case 'outline-color': case 'border-color': case 'border-top-color': case 'border-right-color':
            case 'border-bottom-color': case 'border-left-color':
                out = valueTokens(bare).map(t => mapBorderColor(t, bgKind)).join(' ');
                break;
            case 'border-style': case 'border-top-style': case 'border-right-style': case 'border-bottom-style': case 'border-left-style':
                out = exemptDash ? null : bare.replace(/\bdashed\b/gi, 'solid');
                break;
            case 'border-width': case 'border-top-width': case 'border-right-width': case 'border-bottom-width': case 'border-left-width':
                out = valueTokens(bare).map(capWidth).join(' ');
                break;
            case 'border': case 'border-top': case 'border-right': case 'border-bottom': case 'border-left': case 'outline':
                out = mapBorderShorthand(bare, bgKind, exemptDash);
                break;
            default: break;
        }
        if (out !== null && out !== undefined && !same(bare, out)) { d.value = keepImportant(d.value, out); d.changed = true; }
    }

    // --- presentation attributes on SVG and HTML
    const colorAttr = get('color');
    if (colorAttr && colorAttr.value) {
        const out = inkText(colorAttr.value, bgKind);
        if (out && !same(colorAttr.value, out)) { colorAttr.value = out; changed = true; }
    }
    for (const n of ['opacity', 'fill-opacity', 'stroke-opacity']) {
        const a = get(n);
        if (a && a.value !== undefined) {
            const v = parseFloat(a.value);
            if (Number.isFinite(v) && v >= 0.15 && v < 1) { a.value = '1'; changed = true; }
        }
    }
    // LS-2 / LS-3: a DASHED closed shape in a diagram was legacy for "the unknown". The standard
    // keeps dashes for cut lines and the missing-digit box only; the unknown in a diagram is a
    // SOLID shape. Dots (a near-zero dash under a round cap, LS-1 "model") stay dots, and open
    // lines and paths keep their pattern (a guide, which the family waves redraw as dotted).
    const dashA = get('stroke-dasharray');
    if (!exemptDash && dashA && dashA.value && /^(?:rect|circle|ellipse|polygon)$/.test(tag)) {
        const first = parseFloat(String(dashA.value).split(/[\s,]+/)[0]);
        if (Number.isFinite(first) && first >= 0.5) { dashA.value = 'none'; changed = true; }
    }
    const stopColor = get('stop-color');
    if (stopColor && stopColor.value) {
        const out = inkFill(stopColor.value);
        if (out && !same(stopColor.value, out)) { stopColor.value = out; changed = true; }
    }
    if (isSvgShape && tag !== 'svg' && tag !== 'g' && tag !== 'symbol') {
        // A shape whose fill was a strong colour and that has no visible outline: its parts
        // still read as grey, so nothing to add. A shape that became paper with no stroke and
        // was STRONG before would vanish; that cannot happen here (strong -> grey).
    }

    // --- an HTML thing that was a coloured object keeps its edge
    if (bgWasStrong && !isSvgShape && !isSvgText) {
        const hasBorder = decls.some(d => d.prop && /^border(?:-width|-style)?$/.test(d.prop) && !/^\s*(?:none|0(?:px)?)\s*(?:!important)?\s*$/i.test(d.value))
            || decls.some(d => d.prop && /^border-(?:top|right|bottom|left)$/.test(d.prop));
        if (!hasBorder) {
            decls.push({ prop: 'border', value: `1px solid ${INK_BLACK}`, changed: true, added: true });
        }
        // The label on it: white or tinted text on what is now paper has to turn ink.
        if (!dget('color')) decls.push({ prop: 'color', value: INK_BLACK, changed: true, added: true });
    }

    const styleChanged = decls.some(d => d.changed);
    if (styleChanged) {
        const text = decls.map(d => (d.changed ? (d.added ? `${d.prop}:${d.value}` : `${d.raw.slice(0, d.raw.indexOf(':') + 1)}${/^\s/.test(d.raw.slice(d.raw.indexOf(':') + 1)) ? ' ' : ''}${d.value}`) : d.raw));
        // An added declaration after a trailing ';' would otherwise leave an empty chunk before it
        const cleaned = [];
        for (let i = 0; i < text.length; i++) {
            if (decls[i].added && cleaned.length && cleaned[cleaned.length - 1].trim() === '') cleaned.pop();
            cleaned.push(text[i]);
        }
        const joined = cleaned.join(';');
        if (styleAttr) styleAttr.value = joined;
        else attrs.push({ name: 'style', lower: 'style', value: joined });
        changed = true;
    }
    return changed ? attrs : null;
}

function capWidth(t) {
    const px = lengthPx(t);
    if (px === null) return t;
    return px > 2 ? '2px' : t;
}

function mapBorderColor(tok, bgKind) {
    const c = classifyColor(tok);
    const k = c.kind;
    if (k === 'unknown' || k === 'none' || k === 'current' || k === 'url') return tok;
    if (k === 'light') return INK_GREY;
    if (k === 'grey') return (c.rgb ? Math.max(...c.rgb) <= 125 : false) ? INK_BLACK : INK_GREY;
    if (k === 'white') return bgKind === 'black' || bgKind === 'grey' ? tok : INK_BLACK;
    return INK_BLACK;
}

function mapBorderShorthand(value, bgKind, exemptDash) {
    const toks = valueTokens(value);
    if (toks.length === 1 && /^(?:none|0|0px)$/i.test(toks[0])) return null;
    return toks.map(t => {
        const l = t.toLowerCase();
        if (BORDER_STYLES.has(l)) return l === 'dashed' && !exemptDash ? 'solid' : t;
        if (BORDER_WIDTH.test(t)) return capWidth(t);
        if (isColorToken(t)) return mapBorderColor(t, bgKind);
        return t;
    }).join(' ');
}

/* ---------------------------------------------------------------- <style> blocks */

function inkCssText(css) {
    return css.replace(/\{([^{}]*)\}/g, (all, body) => {
        const decls = splitDeclarations(body).map(raw => {
            const i = raw.indexOf(':');
            if (i < 0) return raw;
            const prop = raw.slice(0, i).trim().toLowerCase();
            const val = raw.slice(i + 1).trim();
            const bare = val.replace(/\s*!important$/i, '');
            let out = null;
            if (prop === 'color') out = inkText(bare, null);
            else if (prop === 'fill') out = inkFill(bare);
            else if (prop === 'stroke') { out = inkStroke(bare); if (out === 'white') out = null; }
            else if (prop === 'background' || prop === 'background-color') {
                if (/gradient\(/i.test(bare)) out = INK_PAPER;
                else {
                    const tok = valueTokens(bare).find(isColorToken);
                    const k = tok ? classifyColor(tok).kind : null;
                    out = k === 'white' || k === 'light' || k === 'strong' || k === 'grey' ? INK_PAPER : null;
                }
            } else if (prop === 'box-shadow' || prop === 'text-shadow' || prop === 'filter') out = /^none$/i.test(bare) ? null : 'none';
            else if (/^border(?:-(?:top|right|bottom|left))?$/.test(prop) || prop === 'outline') out = mapBorderShorthand(bare, null, false);
            else if (/^border(?:-(?:top|right|bottom|left))?-color$/.test(prop)) out = valueTokens(bare).map(t => mapBorderColor(t, null)).join(' ');
            if (out === null || same(bare, out)) return raw;
            return `${raw.slice(0, i + 1)}${keepImportant(val, out)}`;
        });
        return `{${decls.join(';')}}`;
    });
}

/* -------------------------------------------------------------------- the entry */

/** Does a drawing hold CIRCLES filled with paper (or a tint)? Then its coloured circles mean "shaded"
 *  (a shaded set). A paper background rect does not count: an array sits on one. */
function svgHasPaperParts(svg) {
    const re = /<(?:circle|ellipse)\b[^>]*?\bfill\s*=\s*["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(svg))) {
        const k = classifyColor(m[1]).kind;
        if (k === 'white' || k === 'light') return true;
    }
    return false;
}

const TAG_RE = /<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;

/**
 * Put one piece of print markup into ink. Idempotent: running it twice gives the same string,
 * and markup that is already ink, paper and the one grey comes back byte-identical.
 * @param {string} html
 * @returns {string}
 */
export function inkHTML(html) {
    if (typeof html !== 'string' || !html) return html;
    // <style> blocks inside a visual
    let out = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (all, open, css, close) => open + inkCssText(css) + close);
    const tagPass = (src, ctx) => src.replace(TAG_RE, (all, name, attrSrc, selfClose) => {
        if (!attrSrc || !/(?:fill|stroke|color|style|background|opacity|bgcolor)/i.test(attrSrc)) return all;
        const attrs = parseAttrs(attrSrc);
        const next = inkElement(name.toLowerCase(), attrs, ctx);
        if (!next) return all;
        return `<${name}${next.map(a => ' ' + serialiseAttr(a)).join('')}${selfClose ? '/' : ''}>`;
    });
    // Each drawing first, knowing whether it has paper parts (what a coloured circle means in
    // it); then everything else. Inked markup is a fixed point, so the second pass leaves the
    // drawings alone.
    out = out.replace(/<svg\b[\s\S]*?<\/svg>/gi, (blk) => tagPass(blk, { svgPaper: svgHasPaperParts(blk) }));
    return tagPass(out, {});
}

/**
 * Every non-ink paint left in a piece of markup, for tests and lints: returns the list of
 * `prop:value` strings whose colour is not ink, paper, the one grey or a no-paint keyword.
 */
export function inkResidue(html) {
    const bad = [];
    const ok = (v) => {
        const k = classifyColor(v).kind;
        if (k === 'none' || k === 'current' || k === 'url' || k === 'unknown') return true;
        const s = String(v).trim().toLowerCase().replace(/\s*!important$/, '');
        return ['#000', '#000000', 'black', '#fff', '#ffffff', 'white', '#949494', 'transparent'].includes(s);
    };
    String(html).replace(TAG_RE, (all, name, attrSrc) => {
        if (!attrSrc) return all;
        for (const a of parseAttrs(attrSrc)) {
            if (['fill', 'stroke', 'color', 'stop-color', 'bgcolor'].includes(a.lower) && a.value && !ok(a.value)) bad.push(`${a.lower}:${a.value}`);
            if (a.lower === 'style' && a.value) {
                for (const raw of splitDeclarations(a.value)) {
                    const i = raw.indexOf(':');
                    if (i < 0) continue;
                    const prop = raw.slice(0, i).trim().toLowerCase();
                    const val = raw.slice(i + 1).trim();
                    if (['color', 'fill', 'stroke', 'background-color', 'stop-color'].includes(prop) && !ok(val)) bad.push(`${prop}:${val}`);
                    if (prop === 'background' && !/url\(/i.test(val)) {
                        if (/gradient\(/i.test(val)) bad.push(`${prop}:${val}`);
                        else { const t = valueTokens(val.replace(/\s*!important$/i, '')).find(isColorToken); if (t && !ok(t)) bad.push(`${prop}:${val}`); }
                    }
                    if (/^(?:border|outline)/.test(prop)) {
                        for (const t of valueTokens(val.replace(/\s*!important$/i, ''))) if (isColorToken(t) && !ok(t)) bad.push(`${prop}:${val}`);
                    }
                    if ((prop === 'box-shadow' || prop === 'text-shadow') && !/^none/i.test(val)) bad.push(`${prop}:${val}`);
                }
            }
        }
        return all;
    });
    return bad;
}
