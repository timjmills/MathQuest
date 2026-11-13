// ws-drawing-skeleton — the DRAWING a kit cell makes, read from what it RENDERS, not from a hand-kept list of payload fields.
// (critic lf-tools r1 B1 and r2 D1: ws-copy-light keyed a drawing on six named payload fields (kind / task / layout / mode /
// type / form); stack draws by op, unknown, regroup and row count, none on the list, so never-passed stack drawings read
// ELIGIBLE. Root cause: a hand list. Here the key is the rendered skeleton, so a field that changes the picture changes the key.)
//
//   skeletonOfHtml(html)                     the normalised skeleton of one cell's HTML. Pure.
//   cellSkeleton(kit, template, payload[, q])   print blank + screen blank of a payload (kit = js/modules/sheet/index.js), or null
//                                            when it does not draw (an error, or the registry's fallback)
//   drawingKey(kit, template, payload[, q])     '<template>@<6 hex of the skeleton>'; '<template>@fallback' when it does not draw
//
// THE SKELETON keeps: every element's tag; its class tokens (digits masked '#', sorted); its attribute NAMES except geometry,
// ids and slot names (style, id, name, value, title, aria-*, data-slot, data-ws-slot, data-ws-order, data-ws-seg values and
// every coordinate); the VALUES of the attributes that say what a slot or primitive is (type, inputmode, maxlength,
// data-ws-shape, data-ws-kind, data-ws-fallback); SVG primitive kinds (line / rect / circle / path / polygon / text ...) as
// tags (an unclassed <g> inside an <svg> is one icon: a word problem's ball or apple is content, not a new drawing); the operator and relation glyphs of text (+ − × ÷ = < > and a free-standing - or x). It MASKS digits and words
// (every other character of text). A RUN of identical sibling elements is kept as ONE (1) or MANY (2+): a 3-digit row is
// the same drawing as a 2-digit row, but a second operand row, a second answer box where there was one, a carry row, a
// missing-digit box (data-ws-shape box-unknown), a different operator or a bar of another kind is a new drawing.

const KEEP_VALUE = new Set(['type', 'inputmode', 'maxlength', 'data-ws-shape', 'data-ws-kind', 'data-ws-fallback']);
const DROP_ATTR = /^(style|id|name|value|title|alt|href|src|for|placeholder|autocomplete|data-slot|data-ws-slot|data-ws-order|data-ws-id|data-ws-key|data-ans|data-answer|data-value|aria-.*|role|tabindex|x\d?|y\d?|cx|cy|r|rx|ry|d|points|width|height|viewbox|transform|font-size|font-family|font-weight|text-anchor|dominant-baseline|stroke.*|fill.*|opacity|preserveaspectratio|xmlns.*|class)$/i;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ENT = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&minus;': '−', '&times;': '×', '&divide;': '÷', '&nbsp;': ' ', '&#8722;': '−', '&#215;': '×', '&#247;': '÷', '&#x2212;': '−' };

/** The operator / relation glyphs of one text run, digits and words masked away. Pure. */
export function glyphsOf(text) {
    let t = String(text).replace(/&[#\w]+;/g, (m) => ENT[m] ?? ' ');
    t = t.replace(/[A-Za-zÀ-ɏ][A-Za-zÀ-ɏ'’-]*/g, (w) => (w === 'x' ? ' × ' : ' '));   // words masked; a lone x is ×
    t = t.replace(/\d[\d,.]*/g, ' ');                                                                   // numbers masked
    const out = [];
    for (const m of t.matchAll(/[+−×÷=<>*]|(?:^|\s)-(?=\s|$)/g)) out.push(m[0].trim() === '-' ? '−' : m[0] === '*' ? '×' : m[0]);
    return out.join('');
}

/** Parse HTML into a light tree: {tag, sig, kids}. Tolerant (an unclosed tag closes at its parent's end). Pure. */
function parse(html) {
    const root = { tag: '#root', sig: '#root', kids: [] };
    const stack = [root];
    const re = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w:-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)/g;
    let m;
    while ((m = re.exec(String(html)))) {
        if (m[0].startsWith('<!--')) continue;
        if (m[4] !== undefined) {
            const g = glyphsOf(m[4]);
            if (g) stack[stack.length - 1].kids.push({ tag: '#text', sig: `"${g}"`, kids: [] });
            continue;
        }
        const tag = m[2].toLowerCase();
        if (m[1]) {
            const i = stack.map((n) => n.tag).lastIndexOf(tag);
            if (i > 0) stack.length = i;
            continue;
        }
        const attrs = [];
        let cls = '';
        for (const a of String(m[3]).matchAll(/([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
            const name = a[1].toLowerCase();
            const val = a[2] ?? a[3] ?? a[4] ?? '';
            if (name === 'class') { cls = val; continue; }
            if (DROP_ATTR.test(name)) continue;
            attrs.push(KEEP_VALUE.has(name) ? `${name}=${val.replace(/\d+/g, '#')}` : name);
        }
        const classes = [...new Set(cls.split(/\s+/).filter(Boolean).map((c) => c.replace(/\d+/g, '#')))].sort();
        const node = { tag, sig: `${tag}${classes.length ? '.' + classes.join('.') : ''}${attrs.length ? '[' + attrs.sort().join(',') + ']' : ''}`, kids: [] };
        stack[stack.length - 1].kids.push(node);
        if (!VOID.has(tag) && !/\/\s*$/.test(m[3])) stack.push(node);
    }
    return root;
}

/** One node's canonical string, runs of identical siblings kept as one (1) or many (*). Pure. */
function canon(node, inSvg = false) {
    // a picture glyph (an UNCLASSED <g> inside an <svg>: a ball, an apple, a star of a word problem's picture) is one icon;
    // which icon is content, chosen per item from one set, so its inner primitives are not the drawing
    if (inSvg && node.sig === 'g' && node.kids.length) return 'g';
    const svg = inSvg || node.tag === 'svg';
    const kids = node.kids.map((k) => canon(k, svg));
    const out = [];
    for (let i = 0; i < kids.length;) {
        let j = i + 1;
        while (j < kids.length && kids[j] === kids[i]) j++;
        out.push(j - i > 1 ? `${kids[i]}*` : kids[i]);
        i = j;
    }
    return out.length ? `${node.sig}(${out.join(',')})` : node.sig;
}

/** The normalised skeleton of one cell's HTML. Pure. */
export function skeletonOfHtml(html) { return canon(parse(html)); }

/** fnv-1a 32 of a string, hex. Pure. */
export function fnvHex(s) { let h = 0x811c9dc5; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return (h >>> 0).toString(16).padStart(8, '0'); }

/**
 * The skeleton of a payload drawn by `template`: print (size M, blank) + screen (blank). null when it does not draw (the
 * render throws, or the registry falls back: an unknown template or a payload it cannot draw).
 */
export function cellSkeleton(kit, template, payload, question = null) {
    try {
        const q = Object.assign({}, question || {}, { cell: { template, payload } });
        const print = kit.renderCell(q, { size: 'M', mode: 'print', state: 'blank' });
        const screen = kit.renderCell(q, { size: 'M', mode: 'screen', state: 'blank' });
        if (/data-ws-fallback/.test(print) || /data-ws-fallback/.test(screen)) return null;
        return `P:${skeletonOfHtml(print)}|S:${skeletonOfHtml(screen)}`;
    } catch (e) { return null; }
}

/** The drawing key: '<template>@<6 hex>', '<template>@fallback' when it does not draw. */
export function drawingKey(kit, template, payload, question = null) {
    const s = cellSkeleton(kit, template, payload, question);
    return `${template}@${s === null ? 'fallback' : fnvHex(s).slice(0, 6)}`;
}

/** A readable label of a payload's drawing for messages: its short scalar, non-numeric fields (op=*, unknown, ...). Pure. */
export function drawingLabel(payload) {
    const p = payload && typeof payload === 'object' ? payload : {};
    const parts = [];
    for (const [k, v] of Object.entries(p)) {
        if (k === 'supports' || parts.length >= 5) continue;
        if (typeof v === 'string' && v.length <= 14 && !/^\d/.test(v)) parts.push(`${k}=${v}`);
        else if (typeof v === 'boolean') parts.push(`${k}=${v}`);
        else if (Array.isArray(v) && k !== 'ans' && v.length > 2 && v.every((x) => typeof x === 'number')) parts.push(`${k}:${v.length}`);
        else if (v && typeof v === 'object' && !Array.isArray(v) && /unknown|regroup|check/i.test(k)) parts.push(`${k}`);
    }
    return parts.join(' ');
}
