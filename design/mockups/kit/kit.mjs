// Mock-up kit: tiny string-template helpers that draw the parts named in
// WORKSHEET_DESIGN_STANDARD.md. Pure functions, no DOM — the same shape the app's
// js/modules/sheet/ kit will take (ctx.mode 'print' here; 'screen' swaps blanks for inputs).

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const MINUS = '−', TIMES = '×', DIV = '÷';
const OPS = { '+': '+', '-': MINUS, '*': TIMES, x: TIMES, '/': DIV };
const opGlyph = o => OPS[o] || o;

// ---------- page frame ----------
// header: { name, date, score (number|false), time, goal, tab: ['Level 2','Addition','Lesson 5'] | false, title, titleNote }
export function page({ look = 'ican', size = 'L', tab = 6, header = {}, footer = {}, body, cls = '', note = '' }) {
    const h = { name: true, date: true, score: false, tab: false, title: '', ...header };
    const fields = [
        h.name ? `<div class="ws-field name">Name<i></i></div>` : '',
        !h.name ? '<div class="ws-spacer"></div>' : '',
        h.date ? `<div class="ws-field date">Date<i></i></div>` : '',
        h.time ? `<div class="ws-field time">Time<i></i></div>` : '',
        h.goal ? `<div class="ws-field goal">Goal<i></i></div>` : '',
        h.score ? `<div class="ws-field score">Score<i></i><b>/${h.score}</b></div>` : '',
    ].join('');
    const tabBox = h.tab ? `<div class="ws-tabbox">${h.tab.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : '';
    const title = h.title ? `<div class="ws-title">${esc(h.title)}${h.titleNote ? `<small>${esc(h.titleNote)}</small>` : ''}</div>` : '';
    return `${note ? `<div class="ws-note">${note}</div>` : ''}
<section class="ws-page ws-${size} ws-${look} ws-tab${tab} ${cls}" data-ws-look="${look}" data-ws-size="${size}">
  <header class="ws-head"><div class="ws-rowA${h.tab ? '' : ' notab'}">${fields}${tabBox}</div>${title}<div class="ws-headrule"></div></header>
  <main class="ws-body">${body}</main>
  <footer class="ws-foot"><span>${esc(footer.left || '')}</span><b>${esc(footer.center || '1/1')}</b><span>${esc(footer.right || '')}</span></footer>
</section>`;
}

export const instruction = text => `<div class="ws-instrline">${esc(text)}</div>`;

// ---------- cells and grids ----------
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
export function label(style, n) {            // style: 'letter' | 'tab' | 'model' | 'none'
    if (style === 'letter') return `<span class="ws-letter" data-ws-label="letter">${LETTERS[(n - 1) % 26]}.</span>`;
    if (style === 'tab') return `<span class="ws-tab${n > 99 ? ' w3' : n > 9 ? ' w2' : ''}" data-ws-label="tab">${n}</span>`;
    if (style === 'model') return `<span class="ws-modeltab" data-ws-label="model">Model</span>`;
    return '';
}
export const cell = (inner, { label: lab = '', cls = '', style = '' } = {}) =>
    `<div class="ws-cell ${cls}" data-ws-cell style="${style}">${lab}${inner}</div>`;

// grid of cells; `labels` = 'letter' | 'tab' | 'none'; start = first label number
export function grid(cells, { cols, rows, labels = 'none', start = 1, cls = '', height = '', unlabelled = [] } = {}) {
    const n = cols * (rows || Math.ceil(cells.length / cols));
    let k = start;
    const out = cells.map((c, i) => {
        const item = typeof c === 'string' ? { html: c } : c;
        const lab = unlabelled.includes(i) || item.nolabel ? (item.model ? label('model') : '') : label(labels, k++);
        return cell(item.html, { label: lab, cls: item.cls || '', style: item.style || '' });
    });
    if (cells.length < n) out.push(`<div class="ws-cell blankrun" style="--from:${(cells.length % cols) + 1}"></div>`);   // PG-15
    const r = rows || Math.ceil(cells.length / cols);
    return `<div class="ws-grid ${cls}" style="grid-template-columns:repeat(${cols},1fr);grid-template-rows:repeat(${r},1fr);${height ? `height:${height};` : ''}">${out.join('')}</div>`;
}

export const band = (labelText, instr, content, { grow = false, extra = '' } = {}) =>
    `<div class="ws-band${grow ? ' grow' : ''}"><div class="ws-strip"><b>${esc(labelText)}</b><span>${esc(instr || '')}</span>${extra}</div>${content}</div>`;

export const dayBand = (day, scoreOutOf, content) =>
    `<div class="ws-band" style="margin-top:3mm"><div class="ws-strip" style="min-height:10mm"><span class="ws-daytab">Day ${day}</span><div class="ws-field score">Score<i></i><b>/${scoreOutOf}</b></div></div>${content}</div>`;

// ---------- stacked arithmetic (VA-1..VA-23) ----------
// opts: heads ('HTO' letters) | regroup: 'add' | 'sub' | false | answer: 'open' | 'boxes' | 'traced' | grey (Guided scaffolds)
export function stack(a, b, op, { T, heads = false, regroup = false, answer = 'open', grey = false, ans = null } = {}) {
    const A = String(a), B = String(b);
    const t = T || Math.max(A.length, B.length) + 1;
    const pad = s => [...s.padStart(t, ' ')];
    const row = (chars, first = '') => chars.map((ch, i) => `<span${i === 0 && first ? ' class="op"' : ''}>${i === 0 && first ? first : ch === ' ' ? '' : ch}</span>`).join('');
    const g = grey ? ' ws-grey' : '';
    let html = '';
    if (heads) {
        const names = ['O', 'T', 'H', 'Th', 'TTh', 'HTh'];
        html += Array.from({ length: t }, (_, i) => `<span class="head">${i === 0 ? '' : names[t - 1 - i] || ''}</span>`).join('') + `<span class="headcap"></span>`;
    }
    if (regroup === 'add') html += Array.from({ length: t }, (_, i) => `<span class="rg${g}">${i > 0 && i < t - 1 ? '<i></i>' : ''}</span>`).join('');
    if (regroup === 'sub') html += Array.from({ length: t }, (_, i) => `<span class="rg${g}">${i > t - 1 - A.length ? '<i></i>' : ''}</span>`).join('');
    html += row(pad(A)) + `<span class="gap"></span>` + row(pad(B), opGlyph(op)) + `<span class="rule"></span>`;
    if (answer === 'boxes') html += Array.from({ length: t }, () => `<span class="ab${g}"><i></i></span>`).join('');
    if (answer === 'traced' && ans !== null) html += pad(String(ans)).map(ch => `<span class="ws-trace">${ch === ' ' ? '' : ch}</span>`).join('');
    return `<div class="ws-stack${regroup ? ' wide' : ''}" style="--t:${t}" data-ws-slot="answer" data-ws-shape="open">${html}</div>`;
}

// ---------- vertical fact (VA-70) ----------
export function fact(a, b, op, { pt, padTop = 2 } = {}) {
    const A = String(a).padStart(3, ' '), B = String(b).padStart(3, ' ');
    const r = (s, first) => [...s].map((ch, i) => `<span${i === 0 && first ? ' class="op"' : ''}>${i === 0 && first ? first : ch === ' ' ? '' : ch}</span>`).join('');
    return { cls: 'fact', style: `--fd:${pt}pt;--fp:${padTop}mm`, html: `<div class="ws-fact">${r(A)}${r(B, opGlyph(op))}<span class="rule"></span></div>` };
}
export const FACT_LADDER = { 5: 28, 6: 24, 7: 20, 8: 18, 9: 16, 10: 16 };           // TY-30
export const factTab = pt => (pt >= 26 ? 6 : pt >= 20 ? 5 : 4);                       // CL-31

// ---------- horizontal equations and blanks (SL) ----------
export const blankWidth = (n, size) => Math.max(14, Math.ceil(n * 0.75 * ({ S: 6, M: 8, L: 10 })[size] + 2));
export const line = (n = 2, size = 'L') => `<span class="ws-line" style="--w:${blankWidth(n, size)}mm" data-ws-slot="answer" data-ws-shape="line"></span>`;
export const box = (n = 1, size = 'L') => `<span class="ws-box" style="--w:${blankWidth(n, size)}mm" data-ws-slot="answer" data-ws-shape="box"></span>`;
export const circle = () => `<span class="ws-circle" data-ws-slot="answer" data-ws-shape="circle"></span>`;
// parts: numbers / operator strings / '_line' / '_box' / '_circle'
export function equation(parts, size = 'L', digits = 2) {
    return `<div class="ws-eq">${parts.map(p => p === '_line' ? line(digits, size) : p === '_box' ? box(digits, size) : p === '_circle' ? circle()
        : /^[+\-*x/=<>]$/.test(String(p)) ? `<span class="o">${opGlyph(p)}</span>` : `<span>${esc(p)}</span>`).join('')}</div>`;
}
export const frac = (n, d) => `<span class="ws-frac"><span>${n}</span><span>${d}</span></span>`;

// ---------- strips ----------
export function sideStrip(values, { width = 12, pitch = 10.5, grey = false } = {}) {
    return `<div class="ws-sidestrip${grey ? ' grey' : ''}" style="--sw:${width}mm;--pitch:${pitch}mm">${values.map(v => `<span>${v}</span>`).join('')}</div>`;
}
export const withStrip = (main, strip) => `<div class="ws-withstrip"><div class="ws-col">${main}</div>${strip}</div>`;

export const steps = items => `<ol class="ws-steps">${items.map((s, i) => `<li><em>${i + 1}</em><span>${s}</span></li>`).join('')}</ol>`;

// ---------- document ----------
export function doc(title, pages, css = '') {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="../kit/sheet-kit.css">${css ? `<style>${css}</style>` : ''}</head>
<body>${pages.join('\n')}</body></html>`;
}

// deterministic numbers so a rebuild gives the same sheet
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
