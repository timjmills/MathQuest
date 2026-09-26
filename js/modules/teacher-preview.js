// teacher-preview.js — what a skill looks like, shown small, in the teacher view.
//
// Owner request 2026-09-24: "there must be a way to see the list or to see thumbnail preview of
// skills. Also when you mouse over the list chip it should show a thumbnail preview of the skill
// so you can see what it is."
//
//   sampleFor(cat, skill, opts)   one seeded item of the skill, drawn as the black-and-white
//                                 paper cell of the practice card (screen-cell.js), cached per
//                                 skill + options. generateQuestionFor restores live state.
//   mountSample(frame, ...)       draws a sample into a frame and scales it to fit.
//   lazyThumbs(container, root)   renders the [data-tvp-lazy] frames of a thumbnail grid only as
//                                 they scroll into view (IntersectionObserver), a few per tick.
//   tvpAttrs / infoButtonHTML     the markup a skill row / chip / pill carries to get the hover
//                                 preview: data-tvp="cat|skill" (+ data-tvp-opts JSON).
//   modeAttrs(mode, cat, skill)   the same preview for a TYPE OF PRACTICE (owner addition): a
//                                 clean schematic of what pupils see in that mode (practice card,
//                                 boss battle, car race, online worksheet, board display), with
//                                 the chosen skill's sample item in the paper cell.
//   installPreview()              one document-level listener set for the floating preview:
//                                 hover (≈350 ms) or keyboard focus shows it; mouseleave, blur,
//                                 Escape, scroll and resize hide it; on touch the (i) button pins
//                                 it and a tap outside closes it. It is placed beside the anchor,
//                                 never over the pointer, and flips to stay inside the viewport.
//
// Teacher-only. Nothing here runs in student mode (the triggers live in #teacherApp).

import { generateQuestionFor } from './generate-question.js';
import {
    cellKindFor, kindHTML, instructionForKind, answerDigits, regroupFor, hideScreenOnlyCaptions,
    hideRepeatedPrompt, monoCell, unmonoCell, screenGlyphs, screenTextLine, plainText,
} from './screen-cell.js';
import { formatProblemForPrint } from './print-generate.js';
import { esc, icon, findSkill, levelText, optionsSummary, readStore, writeStore, skillCatalogue } from './teacher-ui.js';

/* ================================================================= the view choice */

const VIEW_KEY = 'mq_teacher_skill_view';

/** 'list' | 'thumbs', per device. */
export function skillView() {
    const v = readStore(VIEW_KEY, 'list');
    return v === 'thumbs' ? 'thumbs' : 'list';
}
export function setSkillView(v) { writeStore(VIEW_KEY, v === 'thumbs' ? 'thumbs' : 'list'); }

/** The List | Thumbnails segmented control. Buttons carry data-act="skill-view" data-view. */
export function viewToggleHTML(view) {
    const b = (v, ic, label) => `<button type="button" role="radio" aria-checked="${view === v}" data-act="skill-view" data-view="${v}">${icon(ic, 16)}<span>${label}</span></button>`;
    return `<div class="tv-seg tvp-viewseg" role="radiogroup" aria-label="Show skills as">${b('list', 'list', 'List')}${b('thumbs', 'grid', 'Thumbnails')}</div>`;
}

/* ================================================================= samples */

const cache = new Map();
const CACHE_MAX = 600;

function keyOf(cat, sk, opts, index) {
    return `${cat}|${sk}|${opts && typeof opts === 'object' ? JSON.stringify(opts) : ''}|${index || 0}`;
}

// One fixed seed per skill, so a skill always previews the same item (and a thumbnail matches
// its hover preview).
function seedOf(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}

function optionHTML(o) {
    if (o == null) return '';
    if (typeof o === 'string' || typeof o === 'number') return screenGlyphs(String(o));
    if (typeof o === 'object') {
        if (o.svg) return o.svg;
        if (o.html) return o.html;
        if (o.label != null) return esc(o.label);
        if (o.text != null) return esc(o.text);
        if (o.value != null) return esc(o.value);
    }
    return '';
}

const PLAIN_TYPES = new Set(['number', 'text', 'multiple-choice', 'multiple_choice', 'mc', 'dual', 'dual-fraction']);
function isWidgetOnly(q) {
    return !String(q.visual || '').trim() && !!q.answerType && !PLAIN_TYPES.has(q.answerType);
}

/** The item as the print path draws it (black and white), without its number or skill label. */
function printedHTML(q) {
    let html = '';
    try { html = formatProblemForPrint({ ...q }, 0, 2, '', false) || ''; } catch (e) { html = ''; }
    if (!html) return q.text ? `<div class="question-line tvp-q">${screenGlyphs(q.text)}</div>` : '';
    return html;
}

/** The inner markup of the paper cell for a generated item (no live inputs are wired). */
function cellHTML(q, skillId) {
    const kind = cellKindFor(q);
    let instr = '';
    let body = '';
    if (kind) {
        instr = instructionForKind(kind);
        const box = kind.kind === 'fact' || kind.kind === 'division';
        const slot = `<span class="mq-slot${box ? ' mq-slot--box' : ''}" style="--mq-n:${answerDigits(q)}"></span>`;
        body = kind.kind === 'stack'
            ? kindHTML(kind, { regroup: regroupFor(skillId), idPrefix: 'tvp' })
            : kindHTML(kind, { slotHtml: slot });
    } else if (isWidgetOnly(q)) {
        // A live widget (grid fill, drag and drop, ...) mounts its drawing at play time, so the
        // item carries no visual of its own. Its paper drawing is the one print makes.
        body = `<div class="tvp-printed">${printedHTML(q)}</div>`;
    } else {
        const text = q.text ? `<div class="question-line tvp-q">${screenGlyphs(q.text)}</div>` : '';
        const vis = q.visual ? `<div class="tvp-visual">${q.visual}</div>` : '';
        const opts = Array.isArray(q.options) && q.options.length
            ? `<div class="tvp-options">${q.options.slice(0, 6).map((o) => `<span class="tvp-opt">${optionHTML(o)}</span>`).join('')}</div>` : '';
        // a kit twin's own answer places (data-mq-blank / data-mq-cell) count too: no second line
        const hasOwnSlots = /<input\b|<select\b|<textarea\b|data-mq-blank=|data-mq-cell=/i.test(q.visual || '');
        const numeric = q.answerType === 'number' || typeof q.ans === 'number';
        const slot = !opts && !hasOwnSlots && !q.selfAnswering && q.ans != null && q.ans !== ''
            ? `<div class="tvp-answerrow"><span class="mq-slot${numeric ? '' : ' mq-slot--text'}" style="--mq-n:${numeric ? answerDigits(q) : 6}"></span></div>` : '';
        body = `${text}${vis}${opts}${slot}`;
    }
    return `<div class="mq-scell mq-grid-cell mq-mono ws-cell tvp-cell" data-ws-cell="${kind ? kind.kind : 'legacy'}">${instr ? `<div class="tvp-instr">${instr}</div>` : ''}${body}</div>`;
}

let idSeq = 0;
/** Ids inside a visual would collide with the live app's; give them a unique prefix. */
function scopeIds(html) {
    const ids = new Set();
    html.replace(/\sid\s*=\s*"([^"]+)"/g, (m, id) => { ids.add(id); return m; });
    if (!ids.size) return html;
    const p = `tvp${++idSeq}-`;
    let out = html.replace(/(\sid\s*=\s*")([^"]+)"/g, (m, a, id) => `${a}${p}${id}"`);
    for (const id of ids) {
        const e = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        out = out.replace(new RegExp(`url\\(\\s*#${e}\\s*\\)`, 'g'), `url(#${p}${id})`)
            .replace(new RegExp(`(href\\s*=\\s*")#${e}"`, 'g'), `$1#${p}${id}"`)
            .replace(new RegExp(`(aria-(?:labelledby|describedby|controls)\\s*=\\s*")${e}"`, 'g'), `$1${p}${id}"`);
    }
    return out;
}

/**
 * One seeded sample of a skill, honouring its options.
 * @returns {{ok:true, html:string, text:string}|{ok:false}}
 */
export function sampleFor(cat, sk, opts, index = 0) {
    const key = keyOf(cat, sk, opts, index);
    if (cache.has(key)) return cache.get(key);
    let out = { ok: false };
    try {
        const q = generateQuestionFor({
            category: cat, skill: sk,
            opts: opts && typeof opts === 'object' ? opts : {},
            seed: (seedOf(`${cat}:${sk}`) + index * 7919) >>> 0,
            itemIndex: index,
        });
        if (q && (q.text || q.visual)) {
            out = { ok: true, html: cellHTML(q, sk), text: plainText(q.text || '').slice(0, 160) };
        }
    } catch (e) {
        out = { ok: false };
    }
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
    cache.set(key, out);
    return out;
}

/**
 * A sample is one item on its own: the print path's item number ("1.") and a widget's own
 * action buttons (Check, Reset ...) say nothing about the skill, so they are hidden.
 */
function tidySample(cell) {
    cell.querySelectorAll('.tvp-printed .problem-number, .tvp-printed .p-num').forEach((el) => { el.style.display = 'none'; });
    cell.querySelectorAll('.tvp-printed span, .tvp-printed div').forEach((el) => {
        if (!el.children.length && /^\s*1\.\s*$/.test(el.textContent || '')) el.style.display = 'none';
    });
    cell.querySelectorAll('button').forEach((b) => {
        if (/^\s*(check|submit|reset|clear|undo|start over|try again)\b/i.test(b.textContent || '')) b.style.display = 'none';
    });
    // A print header that held only the item number is an empty ruled line: drop it.
    cell.querySelectorAll('.tvp-printed .p-head, .tvp-printed .problem-header').forEach((h) => {
        const left = [...h.childNodes].some((n) => (n.nodeType === 3 ? n.textContent.trim() : (n.nodeType === 1 && n.style.display !== 'none' && n.textContent.trim())));
        if (!left) h.style.display = 'none';
    });
}

// Below this scale a sample's lines and digits are hairlines in a thumbnail: show a legible crop.
const MIN_LEGIBLE = 0.3;
const CROP_SCALE = 0.45;

/** Fit the stage inside its frame: scale down (never up), centred. */
function fit(frame) {
    const stage = frame.querySelector(':scope > .tvp-stage');
    if (!stage) return;
    stage.style.transform = 'translate(-50%, -50%)';
    // A drawing wider than the stage (a printed number track) widens the stage, so the whole
    // drawing is centred and scaled instead of overflowing one side.
    if (stage.scrollWidth > stage.offsetWidth + 1) {
        stage.style.maxWidth = 'none';
        stage.style.width = `${stage.scrollWidth}px`;
    }
    const w = Math.max(stage.scrollWidth, stage.offsetWidth, 1);
    const h = Math.max(stage.scrollHeight, stage.offsetHeight, 1);
    const fw = frame.clientWidth - 12, fh = frame.clientHeight - 12;
    if (fw <= 0 || fh <= 0) return;
    const s = Math.min(1, fw / w, fh / h);
    if (s < MIN_LEGIBLE && fh < 200) {
        // A tall drawing in a short frame (a thermometer, a graph in the options popover, AP2
        // round 4: "the sample preview renders blank"): show its TOP at a legible scale. Scaling
        // about the stage's own centre while it sat at the frame's centre put the drawing below
        // the frame, so nothing showed; the crop is anchored to the frame's top edge instead.
        frame.classList.add('is-cropped');
        stage.style.top = '0';
        stage.style.transformOrigin = 'top center';
        stage.style.transform = `translate(-50%, 0) scale(${CROP_SCALE})`;
        return;
    }
    frame.classList.remove('is-cropped');
    stage.style.top = '';
    stage.style.transformOrigin = '';
    stage.style.transform = `translate(-50%, -50%) scale(${s.toFixed(4)})`;
}

/**
 * Draw a skill's sample into `frame` (a .tvp-frame). Returns false when it is unavailable.
 */
export function mountSample(frame, cat, sk, opts, index = 0) {
    if (!frame) return false;
    const hit = findSkill(cat, sk);
    const name = hit ? hit.label : sk;
    return mountBuilt(frame, sampleFor(cat, sk, opts, index), name);
}

/**
 * Draw a GIVEN generated question (not a seeded sample) as the same paper cell: the quiz
 * builder's question cards show the exact item the quiz holds.
 */
export function mountQuestion(frame, q, sk) {
    if (!frame) return false;
    let s = { ok: false };
    try {
        if (q && (q.text || q.visual)) s = { ok: true, html: cellHTML(q, sk), text: plainText(q.text || '').slice(0, 160) };
    } catch (e) { s = { ok: false }; }
    return mountBuilt(frame, s, 'this question', 'Question');
}

function mountBuilt(frame, s, name, what = 'Sample question') {
    frame.classList.remove('is-unavailable');
    if (!s.ok) {
        frame.classList.add('is-unavailable');
        frame.setAttribute('role', 'img');
        frame.setAttribute('aria-label', `Preview unavailable for ${name}`);
        frame.innerHTML = `<span class="tvp-unavail">${icon('eye', 18)}<span>Preview unavailable</span></span>`;
        return false;
    }
    frame.setAttribute('role', 'img');
    frame.setAttribute('aria-label', s.text ? `${what}: ${s.text}` : `${what} for ${name}`);
    frame.innerHTML = `<div class="tvp-stage" inert aria-hidden="true">${scopeIds(s.html)}</div>`;
    const cell = frame.querySelector('.tvp-cell');
    try {
        hideScreenOnlyCaptions(cell);
        tidySample(cell);
        const line = cell.querySelector('.tvp-q');
        if (line) {
            screenTextLine(line);
            const vis = cell.querySelector('.tvp-visual');
            if (vis) hideRepeatedPrompt(vis, line.textContent);
        }
        monoCell(cell);
        // The mono pass re-reads the cell for ~0.7 s while styles settle; a static sample then
        // needs no observer.
        setTimeout(() => { unmonoCell(cell); if (frame.isConnected) fit(frame); }, 900);
    } catch (e) { /* a preview never breaks the screen */ }
    fit(frame);
    return true;
}

/* ================================================================= lazy thumbnails */

let io = null;
let ioRoot = null;
const queue = [];
let pumping = false;

function pump() {
    if (pumping) return;
    pumping = true;
    const step = () => {
        const t0 = performance.now();
        while (queue.length && performance.now() - t0 < 24) {
            const el = queue.shift();
            if (!el.isConnected || el.dataset.tvpDone) continue;
            el.dataset.tvpDone = '1';
            const [cat, sk] = String(el.dataset.tvpLazy || '').split('|');
            let opts;
            try { opts = el.dataset.tvpOpts ? JSON.parse(el.dataset.tvpOpts) : undefined; } catch (e) { opts = undefined; }
            mountSample(el, cat, sk, opts);
        }
        if (queue.length) setTimeout(step, 0); else pumping = false;
    };
    setTimeout(step, 0);
}

/** Render the [data-tvp-lazy] frames under `container` as they come into view of `scrollRoot`. */
export function lazyThumbs(container, scrollRoot) {
    if (!container) return;
    const frames = container.querySelectorAll('[data-tvp-lazy]:not([data-tvp-done])');
    if (typeof IntersectionObserver === 'undefined') {
        frames.forEach((f) => queue.push(f));
        pump();
        return;
    }
    if (!io || ioRoot !== scrollRoot) {
        if (io) io.disconnect();
        ioRoot = scrollRoot || null;
        io = new IntersectionObserver((entries) => {
            for (const en of entries) {
                if (!en.isIntersecting) continue;
                io.unobserve(en.target);
                queue.push(en.target);
            }
            pump();
        }, { root: ioRoot, rootMargin: '240px 0px' });
    }
    frames.forEach((f) => io.observe(f));
}

/* ================================================================= triggers */

/** Attributes that give an element the hover preview. */
export function tvpAttrs(cat, sk, opts) {
    const o = opts && typeof opts === 'object' && Object.keys(opts).length ? ` data-tvp-opts="${esc(JSON.stringify(opts))}"` : '';
    return ` data-tvp="${esc(`${cat}|${sk}`)}"${o}`;
}

/* ================================================================= types of practice */

const MODE_INFO = {
    practice: ['Practice', 'One question at a time, with hints. Pupils check each answer before the next.'],
    boss: ['Boss Battle', 'Each right answer hits the boss; a wrong one lets the boss hit back.'],
    race: ['Car Race', 'Pupils race a computer car: every right answer moves their car forward.'],
    worksheet: ['Online worksheet', 'A page of problems in paper cells, checked together at the end.'],
    board: ['Board display', 'One large question at a time on the classroom board, for the whole class.'],
};

/** Attributes that give a mode card (or a mode picker) the "what pupils see" preview. */
export function modeAttrs(mode, cat, sk, opts) {
    if (!MODE_INFO[mode]) return '';
    return ` data-tvp-mode="${esc(mode)}"${cat && sk ? tvpAttrs(cat, sk, opts) : ''}`;
}

/** The skill a mode preview draws its item from: the chosen one, or a plain fact skill. */
function modeSampleSkill(t) {
    if (t.dataset.tvp) return parseTrigger(t);
    const cat = skillCatalogue();
    const hit = cat.find((s) => s.categoryId === 'addition' && /facts/.test(s.skillId)) || cat.find((s) => s.categoryId === 'addition') || cat[0];
    return hit ? { cat: hit.categoryId, sk: hit.skillId, opts: undefined } : { cat: '', sk: '' };
}

const cellSlot = (i = 0, cls = '') => `<div class="tvp-frame tvp-mcell${cls}" data-mcell="${i}"></div>`;
const bar = (w) => `<span class="tvp-mbar"><span style="width:${w}%"></span></span>`;

/** A clean schematic of the pupil screen for a mode. Paper cells are filled in afterwards. */
function modeSchematicHTML(mode) {
    switch (mode) {
        case 'boss': return `<div class="tvp-mode tvp-mode-boss">
  <div class="tvp-mtop"><span class="tvp-mchip">Boss</span>${bar(62)}<span class="tvp-mchip">Q 4</span></div>
  <div class="tvp-marena"><span class="tvp-mhero" aria-hidden="true"></span><span class="tvp-mvs">vs</span><span class="tvp-mboss" aria-hidden="true"></span></div>
  ${cellSlot(0, ' tvp-mcell-main')}
  <div class="tvp-mbtns"><span></span><span class="is-primary"></span></div>
</div>`;
        case 'race': return `<div class="tvp-mode tvp-mode-race">
  <div class="tvp-mtop"><span class="tvp-mchip">Race</span><span class="tvp-mgrow"></span><span class="tvp-mchip">Q 6</span></div>
  <div class="tvp-mlanes">
    <div class="tvp-mlane"><span class="tvp-mlane-l">You</span><span class="tvp-mtrack"><span class="tvp-mcar is-you" style="left:58%"></span></span><span class="tvp-mflag" aria-hidden="true"></span></div>
    <div class="tvp-mlane"><span class="tvp-mlane-l">CPU</span><span class="tvp-mtrack"><span class="tvp-mcar" style="left:44%"></span></span><span class="tvp-mflag" aria-hidden="true"></span></div>
  </div>
  ${cellSlot(0, ' tvp-mcell-main')}
</div>`;
        case 'worksheet': return `<div class="tvp-mode tvp-mode-ws">
  <div class="tvp-mtop"><span class="tvp-mchip">Worksheet</span><span class="tvp-mgrow"></span><span class="tvp-mchip">20 problems</span></div>
  <div class="tvp-mwsgrid">${[0, 1, 2, 3, 4, 5].map((i) => `<div class="tvp-mwscard"><span class="tvp-mnum">${i + 1}</span>${cellSlot(i)}</div>`).join('')}</div>
</div>`;
        case 'board': return `<div class="tvp-mode tvp-mode-board">
  <div class="tvp-mboard">
    <div class="tvp-mtop"><span class="tvp-mchip is-dark">Question 3</span><span class="tvp-mgrow"></span><span class="tvp-mchip is-dark">Whole class</span></div>
    ${cellSlot(0, ' tvp-mcell-big')}
  </div>
</div>`;
        default: return `<div class="tvp-mode tvp-mode-practice">
  <div class="tvp-mtop"><span class="tvp-mchip">Question 3 of 20</span><span class="tvp-mgrow"></span><span class="tvp-mchip">Streak 4</span></div>
  ${cellSlot(0, ' tvp-mcell-main')}
  <div class="tvp-mbtns"><span></span><span></span><span class="tvp-mgrow"></span><span class="is-primary"></span></div>
</div>`;
    }
}

function fillMode(p, t) {
    const mode = MODE_INFO[t.dataset.tvpMode] ? t.dataset.tvpMode : 'practice';
    const [name, desc] = MODE_INFO[mode];
    const { cat, sk, opts } = modeSampleSkill(t);
    const hit = cat ? findSkill(cat, sk) : null;
    p.innerHTML = `<div class="tvp-frame tvp-pop-frame tvp-mode-frame" role="img" aria-label="What pupils see in ${esc(name)}">${modeSchematicHTML(mode)}</div>
<div class="tvp-pop-body">
  <div class="tvp-pop-title">${esc(name)}</div>
  <div class="tv-skill-meta">What pupils see</div>
  <p class="tvp-pop-desc">${esc(desc)}</p>
  ${hit && t.dataset.tvp ? `<p class="tvp-pop-opts"><span>Sample</span> ${esc(hit.label)}</p>` : ''}
</div>`;
    const frame = p.querySelector('.tvp-mode-frame');
    frame.dataset.mode = mode;
    return { frame, cat, sk, opts };
}

function mountModeCells(frame, cat, sk, opts) {
    if (!cat || !sk) return;
    frame.querySelectorAll('[data-mcell]').forEach((c) => {
        mountSample(c, cat, sk, opts, Number(c.dataset.mcell) || 0);
        c.removeAttribute('role');
        c.removeAttribute('aria-label');
    });
}

/** The (i) button that opens the preview on touch screens (hidden where the pointer can hover). */
export function infoButtonHTML(label, what = 'a preview of') {
    return `<button type="button" class="tvp-info" data-tvp-info aria-label="Show ${esc(what)} ${esc(label)}" aria-expanded="false">${icon('info', 16)}</button>`;
}

/* ================================================================= the floating preview */

const POP_ID = 'tvSkillPreview';
const DELAY = 350;
const WARM = 120;           // moving straight from one skill to the next

let pop = null;
let timer = null;
let shownFor = null;        // the trigger element
let describedEl = null;     // the element carrying aria-describedby
let pinnedBy = null;        // the (i) button that pinned it
let pendingFocus = null;    // the focused element a scheduled (keyboard) preview is for
let shownByFocus = false;   // the open preview came from keyboard focus (not hover)
let lastHide = 0;
let pointer = { x: -1, y: -1 };
let installed = false;

function triggerOf(node) {
    const el = node && node.nodeType === 1 ? node : node && node.parentElement;
    const t = el && el.closest ? el.closest('[data-tvp], [data-tvp-mode]') : null;
    return t && t.closest('#teacherApp') ? t : null;
}

function ensurePop() {
    if (pop && pop.isConnected) return pop;
    pop = document.createElement('div');
    pop.id = POP_ID;
    pop.className = 'tvp-pop';
    pop.setAttribute('role', 'tooltip');
    pop.hidden = true;
    document.body.appendChild(pop);
    return pop;
}

function parseTrigger(t) {
    const [cat, sk] = String(t.dataset.tvp || '').split('|');
    let opts;
    try { opts = t.dataset.tvpOpts ? JSON.parse(t.dataset.tvpOpts) : undefined; } catch (e) { opts = undefined; }
    return { cat, sk, opts };
}

function fill(t) {
    const { cat, sk, opts } = parseTrigger(t);
    const hit = findSkill(cat, sk);
    const label = hit ? hit.label : sk;
    const meta = hit ? `${levelText(hit.level)} · ${hit.categoryName}` : '';
    const desc = hit && hit.categoryDesc ? hit.categoryDesc : '';
    const sum = opts ? optionsSummary(cat, sk, opts) : '';
    const p = ensurePop();
    p.innerHTML = `<div class="tvp-frame tvp-pop-frame"></div>
<div class="tvp-pop-body">
  <div class="tvp-pop-title">${esc(label)}</div>
  ${meta ? `<div class="tv-skill-meta">${esc(meta)}</div>` : ''}
  ${desc ? `<p class="tvp-pop-desc">${esc(desc)}</p>` : ''}
  ${sum ? `<p class="tvp-pop-opts"><span>Options</span> ${esc(sum)}</p>` : ''}
</div>`;
    return p;
}

function anchorRect(t) {
    const a = t.querySelector('[data-tvp-anchor]') || t;
    return a.getBoundingClientRect();
}

function place(t) {
    const p = pop;
    const r = anchorRect(t);
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    const pw = p.offsetWidth, ph = p.offsetHeight;
    const g = 12, m = 8;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const midY = clamp(r.top + r.height / 2 - ph / 2, m, Math.max(m, vh - ph - m));
    const leftX = clamp(r.left, m, Math.max(m, vw - pw - m));
    const cands = [
        { x: r.right + g, y: midY },
        { x: r.left - g - pw, y: midY },
        { x: leftX, y: r.bottom + g },
        { x: leftX, y: r.top - g - ph },
    ];
    const fits = (c) => c.x >= m && c.y >= m && c.x + pw <= vw - m && c.y + ph <= vh - m;
    const coversPointer = (c) => pointer.x >= c.x - 8 && pointer.x <= c.x + pw + 8 && pointer.y >= c.y - 8 && pointer.y <= c.y + ph + 8;
    let pick = cands.find((c) => fits(c) && !coversPointer(c));
    if (!pick) {
        // Nothing fits cleanly (a very small window): the side with the most room, clamped.
        const below = vh - r.bottom, above = r.top;
        pick = below >= above ? { x: leftX, y: clamp(r.bottom + g, m, vh - ph - m) } : { x: leftX, y: clamp(r.top - g - ph, m, vh - ph - m) };
    }
    p.style.left = `${Math.round(pick.x)}px`;
    p.style.top = `${Math.round(pick.y)}px`;
}

function show(t, focusEl) {
    clearTimeout(timer);
    if (!t.isConnected) return;
    hide(true);
    const p = ensurePop();
    p.classList.toggle('is-mode', !!t.dataset.tvpMode);
    p.hidden = false;
    p.style.left = '-9999px';
    p.style.top = '0px';
    if (t.dataset.tvpMode) {
        const m = fillMode(p, t);
        mountModeCells(m.frame, m.cat, m.sk, m.opts);
    } else {
        fill(t);
        const { cat, sk, opts } = parseTrigger(t);
        mountSample(p.querySelector('.tvp-pop-frame'), cat, sk, opts);
    }
    place(t);
    shownFor = t;
    describedEl = focusEl || t;
    shownByFocus = !!focusEl;
    const cur = (describedEl.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (!cur.includes(POP_ID)) describedEl.setAttribute('aria-describedby', [...cur, POP_ID].join(' '));
}

function hide(silent) {
    clearTimeout(timer);
    timer = null;
    if (describedEl) {
        const rest = (describedEl.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== POP_ID);
        if (rest.length) describedEl.setAttribute('aria-describedby', rest.join(' ')); else describedEl.removeAttribute('aria-describedby');
    }
    if (pinnedBy) pinnedBy.setAttribute('aria-expanded', 'false');
    if (pop && !pop.hidden && !silent) lastHide = Date.now();
    if (pop) pop.hidden = true;
    shownFor = null;
    describedEl = null;
    pinnedBy = null;
    shownByFocus = false;
}

function schedule(t, focusEl) {
    clearTimeout(timer);
    pendingFocus = focusEl || null;
    const delay = Date.now() - lastHide < 400 ? WARM : DELAY;
    timer = setTimeout(() => show(t, focusEl), delay);
}

/** Is the preview showing (and for which skill)? For tests. */
export function previewState() {
    return {
        open: !!(pop && !pop.hidden),
        skill: shownFor ? shownFor.dataset.tvp || null : null,
        mode: shownFor ? shownFor.dataset.tvpMode || null : null,
        pinned: !!pinnedBy,
    };
}

export function installPreview() {
    if (installed || typeof document === 'undefined') return;
    installed = true;

    // Touch or mouse: the (i) buttons show on a touch screen only (html.tvp-touch). The media
    // query gives the first guess; the pointer the teacher actually uses settles it.
    const html = document.documentElement;
    const setTouch = (on) => { if (html.classList.contains('tvp-touch') !== on) html.classList.toggle('tvp-touch', on); };
    try { setTouch(!window.matchMedia('(any-hover: hover)').matches); } catch (e) { /* keep the default */ }
    document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') setTouch(true); }, { passive: true, capture: true });

    document.addEventListener('pointermove', (e) => {
        pointer = { x: e.clientX, y: e.clientY };
        if (e.pointerType === 'mouse') setTouch(false);
    }, { passive: true, capture: true });

    document.addEventListener('pointerover', (e) => {
        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
        pointer = { x: e.clientX, y: e.clientY };
        const t = triggerOf(e.target);
        if (!t || pinnedBy) return;
        if (t === shownFor) return;
        if (e.relatedTarget && t.contains(e.relatedTarget)) return;
        schedule(t, null);
    });

    document.addEventListener('pointerout', (e) => {
        const t = triggerOf(e.target);
        if (!t || pinnedBy) return;
        if (e.relatedTarget && t.contains(e.relatedTarget)) return;
        hide();
    });

    document.addEventListener('focusin', (e) => {
        const t = triggerOf(e.target);
        if (!t || pinnedBy) return;
        let keyboard = false;
        try { keyboard = e.target.matches(':focus-visible'); } catch (err) { keyboard = true; }
        if (!keyboard) return;
        if (t === shownFor) return;
        schedule(t, e.target);
    });

    document.addEventListener('focusout', (e) => {
        if (pinnedBy) return;
        const t = triggerOf(e.target);
        if (!t) return;
        if (e.relatedTarget && t.contains(e.relatedTarget)) return;
        hide();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape' || !pop || pop.hidden) {
            if (e.key === 'Escape') clearTimeout(timer);
            return;
        }
        const back = pinnedBy;
        hide();
        if (back && back.isConnected) back.focus();
    });

    // The (i) button: toggles a pinned preview (the touch path).
    document.addEventListener('click', (e) => {
        const info = e.target.closest && e.target.closest('[data-tvp-info]');
        if (info && info.closest('#teacherApp')) {
            e.preventDefault();
            const t = triggerOf(info);
            if (!t) return;
            if (pinnedBy === info) { hide(); return; }
            const r = info.getBoundingClientRect();
            pointer = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
            show(t, info);
            pinnedBy = info;
            info.setAttribute('aria-expanded', 'true');
            return;
        }
        // Any other click (an add or a remove re-renders the row) closes a hover preview.
        if (pop && !pop.hidden) hide();
        else clearTimeout(timer);
    }, true);

    document.addEventListener('pointerdown', (e) => {
        if (!pinnedBy) return;
        if (e.target.closest && e.target.closest('[data-tvp-info]')) return;
        hide();
    }, true);

    // A scroll hides a hover preview. A KEYBOARD preview follows its row instead: arrowing down a
    // long list scrolls the focused row into view, and the preview must not vanish (or never
    // appear) each time it does. It re-places beside the row and hides once the row leaves the
    // window. A pinned (i) preview still closes on scroll.
    let followRaf = 0;
    const followsFocus = (el) => !pinnedBy && el && el === document.activeElement && el.isConnected;
    window.addEventListener('scroll', () => {
        if (pop && !pop.hidden) {
            if (!shownByFocus || !followsFocus(describedEl)) { hide(); return; }
            if (followRaf) return;
            followRaf = requestAnimationFrame(() => {
                followRaf = 0;
                if (!shownFor || !pop || pop.hidden) return;
                const r = anchorRect(shownFor);
                if (r.bottom <= 0 || r.top >= window.innerHeight) { hide(); return; }
                place(shownFor);
            });
        } else if (!followsFocus(pendingFocus)) clearTimeout(timer);
    }, { passive: true, capture: true });
    window.addEventListener('resize', () => { if (pop && !pop.hidden) hide(); });
}
