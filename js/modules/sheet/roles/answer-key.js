// js/modules/sheet/roles/answer-key.js
// The FACSIMILE answer key: the same page, the same cells, the same pagination, with the
// answers written into the answer slots in the way a pupil would write them.
//
// Rules: WORKSHEET_DESIGN_STANDARD.md AK-1..AK-7 and HD-1..HD-5, HD-20, HD-30;
// design/PAGE_TYPES.md 7.1 (PT-KEY-1..PT-KEY-7) and PT-CMP-5.
//
// A key is NOT a list of answers. A teacher marks by laying the key beside the pupil's sheet,
// so a cell that moves between the two makes it useless (AK-1). The one rule that guarantees
// this holds is: THE SAME PLAN RENDERS BOTH. `renderPages(plan, {state:'blank'})` is the pupil
// page and `renderPages(plan, {state:'answered'})` is its key - nothing is re-measured, no
// layout decision is taken twice, and cell N is therefore at the same x/y by construction.
//
// A role composer that draws its pupil page some other way must inject that renderer
// (`opts.render`); the narrow interface it has to satisfy is documented at `renderPages`.
//
// Pure module (SCC-01): no `window`, no DOM, no `Math.random`, no app import.

import {
    page, instruction, band, sayBand, grid, dayBand,
    renderCell, cellAnswerKey, cellGridItem, hasCell,
    resolveCtx, esc,
} from '../index.js';

/* ------------------------------------------------------------------ the plan (data only) */

/**
 * @typedef {Object} PagePlan
 *   What a page role hands to the renderer. It is PLAIN DATA: the same object renders the
 *   pupil page and the key, so every layout decision is taken once.
 * @property {string} [role]              'independent', 'test-a', 'long-division', ...
 * @property {Object} [ctx]               partial CellCtx: look, size, paper, scaffoldLevel,
 *                                        photocopySafe, mode. `state` is supplied by the render.
 * @property {Object} [header]            {name, date, time, goal, score, tab:[l1,l2,l3], title, titleNote}
 * @property {Object} [contHeader]        HD-20 header for pages 2+; defaults below
 * @property {Object} [footer]            {left, right} - `center` is always page n/N
 * @property {string|number} [seed]       HD-30 / AK-4: printed footer-right on the key
 * @property {string} [form]              form letter
 * @property {PagePart[]} [sections]      a one-page plan
 * @property {{sections: PagePart[], header?: Object}[]} [pages]   an explicit pagination
 * @property {boolean} [nothingToAnswer]  PT-KEY-7: the page IS its own key
 *
 * @typedef {Object} PagePart
 * @property {'grid'|'instruction'|'band'|'say'|'day'|'html'} kind
 * @property {PlanItem[]} [items]         kind 'grid'
 * @property {number} [cols] @property {number} [rows] @property {string} [labels]
 * @property {number} [start] @property {string} [cls] @property {string} [height]
 * @property {number[]} [unlabelled]
 * @property {string} [text]              kind 'instruction'
 * @property {string} [label] @property {string} [instr] @property {PagePart} [content]  kind 'band'
 * @property {boolean} [grow]
 * @property {string} [frame]             kind 'say'
 * @property {string} [html]              kind 'html' - identical in both states (static chrome)
 *
 * @typedef {Object} PlanItem
 * @property {Object} [q]                 a question: `q.cell = {template, payload}` (+ legacy fields)
 * @property {(ctx: Object) => string} [render]   a role's own drawing function, called with the
 *                                        resolved ctx. THE SAME function draws both states, so a
 *                                        role that owns a visual keeps geometry parity for free.
 * @property {Object} [key]               an AnswerKey; defaults to `cellAnswerKey(q)`
 * @property {{rows?: number}} [work]     reserve a working box under the cell (same box, both states)
 * @property {{text: string, marks?: {slot: string, value: string}[]}[]} [workedSteps]
 * @property {string} [answerWords]       what to print when the answer cannot be DRAWN yet
 * @property {boolean} [visual]           the cell carries a visual (drives gap detection)
 * @property {boolean} [drawsAnswer]      force the gap verdict: true = trust it, false = gap
 * @property {string} [skill]             'categoryId:skillId', for the gap list
 * @property {string} [cls] @property {string} [style]
 * @property {boolean} [nolabel] @property {boolean} [model]
 */

/** PT-FRM-9 / HD-5 / PT-KEY-3: the id line of a key's strand tab. */
export const KEY_ID_LINE = 'Answer Key';

const DEFAULT_CTX = Object.freeze({ mode: 'print', look: 'ican', size: 'L', scaffoldLevel: 1, paper: 'A4' });

const num = (v) => (v === undefined || v === null ? '' : String(v));

/* ------------------------------------------------------------------- header, tab, footer */

/**
 * HD-5 / PT-KEY-3 / AK-3. The tab's LAST line is the page id, so the key replaces the last
 * line and leaves "Level N" and the strand alone. A two-line tab (a sheet with no single
 * strand) keeps its two lines and only the id changes.
 */
export function keyTab(lines) {
    if (!lines) return [KEY_ID_LINE];
    const out = Array.isArray(lines) ? lines.slice() : [String(lines)];
    if (!out.length) return [KEY_ID_LINE];
    out[out.length - 1] = KEY_ID_LINE;
    return out;
}

/**
 * The key's header. HD-16 says a field never moves, and AK-4 says the Score denominator is
 * identical, so the key changes NOTHING structural:
 *
 *   - Name (HD-1): the field, its box and its rule stay exactly where they are; the word
 *     "Name" is replaced by bold "Answer Key" ON the Name rule (AK-3, PT-KEY-3). Done as a
 *     patch on the rendered header (`markKeyName`) so the field geometry is byte-identical.
 *   - Date (HD-1): printed exactly as on the pupil page, rule empty. Removing it would free
 *     header height, HD-12 would give that height to the body, the rows would be recomputed
 *     and every cell would move - which is the one thing a facsimile may not do.
 *   - Score (HD-2, HD-3): printed with the SAME denominator and an empty rule, for the same
 *     reason and because AK-4 requires the denominator to match. When Day bands suppressed the
 *     header Score on the pupil page (HD-3) they suppress it here too, because the plan is the
 *     same object.
 *   - Title (HD-11): unchanged. The phase lives on the tab, never in the title.
 */
export function keyHeader(header = {}) {
    return Object.assign({}, header, { tab: header.tab ? keyTab(header.tab) : [KEY_ID_LINE] });
}

/** AK-3 / HD-30: footer right reads "Key · Form A · seed N". Grade and CCSS stay on the left. */
export function keyFooterRight({ form, seed } = {}) {
    return ['Key', form ? `Form ${form}` : '', seed === undefined || seed === null || seed === '' ? '' : `seed ${seed}`]
        .filter(Boolean).join(' · ');
}

/**
 * AK-3: "Answer Key" prints on the Name rule. Patching the rendered header keeps the field
 * box, its flex basis and the 14 mm row height byte-identical to the pupil page - the words
 * simply shorten the rule inside the same box, exactly as a written name would.
 */
const NAME_FIELD = '<div class="ws-field name">Name<i></i></div>';
export const markKeyName = (html) =>
    html.replace(NAME_FIELD, `<div class="ws-field name"><span data-ws-key="name">${KEY_ID_LINE}</span><i></i></div>`);

/* ------------------------------------------------------------------------- slot filling */

/**
 * The shapes `blank()` fills on its own (line, box, box-unknown, circle, unit, open) need
 * nothing here. These four carry structure instead of a text node, so the value has to be
 * placed INSIDE that structure or the key prints an empty shape:
 *
 *   fraction  ->  numerator over denominator on the existing bar
 *   mixed     ->  whole number in its box, then the fraction
 *   time      ->  hours box : minutes box
 *   check     ->  a drawn check mark (AK-2: check marks at 1.5 pt)
 *   choice    ->  the correct option ringed at 1.5 pt (AK-2)
 *
 * These regexes are anchored on the exact markup `cell.js` `blank()` emits for each shape.
 * That is the assumption this module states out loud: the slot markup is the contract.
 */
const FRAC_RE = /(<span class="ws-slotfrac[^"]*"[^>]*data-ws-slot="([^"]+)"[^>]*>)<span><\/span><span><\/span>(<\/span>)/g;
// The trailing three closers are matched but NOT captured: they close the second fraction
// span, the fraction and the mixed slot, and the rebuild below writes its own closers for
// the first two. Emitting them verbatim leaked two stray `</span>` that closed the cell's
// own wrapper on the key and not on the pupil page - an invisible AK-1 break, because the
// parser silently drops the extras and only the nesting changes.
const MIXED_RE = /(<span class="ws-slotmixed[^"]*"[^>]*data-ws-slot="([^"]+)"[^>]*>)([\s\S]*?)(?:<\/span><\/span><\/span>)/g;
const TIME_RE = /(<span class="ws-slottime[^"]*"[^>]*data-ws-slot="([^"]+)"[^>]*>)<span class="ws-box" style="--w:([\d.]+)mm"><\/span><b>:<\/b><span class="ws-box" style="--w:([\d.]+)mm"><\/span>(<\/span>)/g;
const CHECK_RE = /<span class="ws-check([^"]*)" style="([^"]*)"([^>]*)data-ws-slot="([^"]+)" data-ws-shape="check"([^>]*)>([\s\S]*?)<\/span>/g;
const CHOICE_RE = /<span class="ws-choice([^"]*)"([^>]*)data-ws-slot="([^"]+)" data-ws-shape="choice"([^>]*)>([\s\S]*?)<\/span>/g;

const TRUE_WORDS = new Set(['1', 'true', 'yes', 'y', 'x', 'check', 'checked', '✓']);
const CHECK_GLYPH = '✓';

const slotValue = (key, id) => {
    if (!key) return '';
    if (typeof key !== 'object') return num(key);
    const s = key.slots && key.slots[id];
    if (s && s.value !== undefined && s.value !== null) return num(s.value);
    return '';
};

/** "3/4" or "3 / 4" -> ['3','4']. Anything else -> null. */
function splitFraction(v) {
    const m = /^\s*(-?\d+)\s*\/\s*(\d+)\s*$/.exec(String(v));
    return m ? [m[1], m[2]] : null;
}
/** "1 3/4" -> ['1','3','4']. */
function splitMixed(v) {
    const m = /^\s*(-?\d+)\s+(\d+)\s*\/\s*(\d+)\s*$/.exec(String(v));
    return m ? [m[1], m[2], m[3]] : null;
}
/** "3:45" or "03:45" -> ['3','45']. */
function splitTime(v) {
    const m = /^\s*(\d{1,2})\s*:\s*(\d{2})\s*$/.exec(String(v));
    return m ? [String(Number(m[1])), m[2]] : null;
}

/**
 * Write the answers into the structural slot shapes of one already-rendered, ANSWERED cell.
 * Never changes a box, a rule or a width - only what sits inside them (AK-1).
 */
export function fillSlots(html, key, ctx) {
    if (!key) return html;
    const ink = ' data-ws-ink="solid"';
    // `blank()` already stamps the ink attribute on a shape whose value is non-empty, so a
    // rebuild that keeps the original attribute run must not add a second one: a duplicate
    // attribute is invalid markup and any strict parser (the PDF path, an XML serializer)
    // rejects it even though a browser quietly keeps the first.
    const inkOnce = (...attrRuns) => (attrRuns.join('').includes('data-ws-ink=') ? '' : ink);
    let out = String(html);

    out = out.replace(FRAC_RE, (m, open, id, close) => {
        const parts = splitFraction(slotValue(key, id));
        if (!parts) return m;
        return `${open}<span${ink}>${esc(parts[0])}</span><span${ink}>${esc(parts[1])}</span>${close}`;
    });

    out = out.replace(MIXED_RE, (m, open, id, inner) => {
        const v = slotValue(key, id);
        const parts = splitMixed(v);
        if (!parts) return m;
        const boxW = /--w:([\d.]+)mm/.exec(inner);
        const w = boxW ? boxW[1] : '14';
        return `${open}<span class="ws-box" style="--w:${w}mm"${ink}>${esc(parts[0])}</span>`
            + `<span class="ws-slotfrac"><span${ink}>${esc(parts[1])}</span><span${ink}>${esc(parts[2])}</span></span></span>`;
    });

    out = out.replace(TIME_RE, (m, open, id, wh, wm, close) => {
        const parts = splitTime(slotValue(key, id));
        if (!parts) return m;
        return `${open}<span class="ws-box" style="--w:${wh}mm"${ink}>${esc(parts[0])}</span><b>:</b>`
            + `<span class="ws-box" style="--w:${wm}mm"${ink}>${esc(parts[1])}</span>${close}`;
    });

    out = out.replace(CHECK_RE, (m, cls, style, pre, id, post, inner) => {
        const v = slotValue(key, id).trim().toLowerCase();
        if (!v || !TRUE_WORDS.has(v)) return m;
        // AK-2: a drawn check mark, 1.5 pt, inside the box the pupil would have used.
        return `<span class="ws-check${cls}" style="${style};display:inline-flex;align-items:center;`
            + `justify-content:center;font-weight:700;line-height:1"${pre}data-ws-slot="${id}" `
            + `data-ws-shape="check"${post}${inkOnce(pre, post)}>${CHECK_GLYPH}</span>`;
    });

    out = out.replace(CHOICE_RE, (m, cls, pre, id, post, inner) => {
        const v = slotValue(key, id).trim();
        const text = inner.replace(/<[^>]*>/g, '').trim();
        if (!v || v !== text) return m;
        // AK-2: the correct option is RINGED at 1.5 pt. An outline costs no layout, so the
        // option keeps its exact position on the key.
        return `<span class="ws-choice${cls}" style="outline:1.5pt solid #000;outline-offset:1mm;`
            + `border-radius:3mm"${pre}data-ws-slot="${id}" data-ws-shape="choice"${post}${inkOnce(pre, post)}>${inner}</span>`;
    });

    return out;
}

/* -------------------------------------------------------------------- the working block */

/**
 * PT-KEY-1 / AK-2 / requirement 4. Where the page GIVES space for working - long division,
 * multi-step word problems - the key shows the completed working, not just the final answer;
 * that is what makes a key usable for marking method.
 *
 * The box is drawn in BOTH states at the same height (rows x Hw), so it costs exactly the same
 * layout on the pupil page and on the key. SCC-A5: the work space is a SOLID hairline, because
 * dashed means cut and nothing else.
 */
export function workBox(item, ctx) {
    const rows = Math.max(1, (item.work && item.work.rows) || 4);
    const hMm = Math.round(rows * ctx.metrics.writeMm * 100) / 100;
    const inner = ctx.state === 'blank' ? '' : workingHtml(item, ctx);
    return `<div class="ws-workbox" data-ws-work="1" style="width:100%;height:${hMm}mm;`
        + `border:0.75pt solid #000;margin-top:2mm;padding:1.2mm 2mm;overflow:hidden;`
        + `font-size:${ctx.metrics.zonePt}pt;line-height:1.25;text-align:left">${inner}</div>`;
}

/** SCC-P4: at most 6 steps. Degrades to the answer alone when a skill supplies none. */
export function workingHtml(item, ctx) {
    const steps = Array.isArray(item.workedSteps) ? item.workedSteps.slice(0, 6) : [];
    if (!steps.length) {
        const key = item.key || (item.q ? cellAnswerKey(item.q) : null);
        const d = key && key.display !== undefined ? num(key.display) : num(item.answerWords);
        return d ? `<div data-ws-ink="solid"><b>${esc(d)}</b></div>` : '';
    }
    return steps.map((s, i) => {
        const marks = Array.isArray(s.marks) && s.marks.length
            ? ` <b>${esc(s.marks.map((m) => num(m.value)).filter(Boolean).join('  '))}</b>` : '';
        return `<div data-ws-ink="solid">${i + 1}. ${esc(s.text || '')}${marks}</div>`;
    }).join('');
}

/* -------------------------------------------------------------------- undrawable answers */

/**
 * PT-KEY-7 / requirement 5. Where a visual answer genuinely cannot be DRAWN yet, the cell
 * prints the answer instead of being left blank, and the skill goes on the gap list.
 *
 * The stamp is absolutely positioned at the foot of the cell (`.ws-cell` is `position:
 * relative` in the kit stylesheet), so it costs NO layout: the problem above it does not move
 * and the cell box is unchanged.
 */
export function keyStamp(text, ctx) {
    if (!text) return '';
    return `<div class="ws-keystamp" data-ws-key="words" style="position:absolute;left:2mm;right:2mm;`
        + `bottom:1.5mm;font-size:${ctx.metrics.zonePt}pt;line-height:1.15;font-weight:700;`
        + `text-align:center" data-ws-ink="solid">${esc(text)}</div>`;
}

/** What the stamp says: the role's own wording first, then the key's display value. */
export function answerWords(item, key) {
    if (item && item.answerWords) return String(item.answerWords);
    if (key && key.display !== undefined && key.display !== null && key.display !== '') return `Answer: ${num(key.display)}`;
    if (key && key.value !== undefined && key.value !== null && key.value !== '') return `Answer: ${num(key.value)}`;
    return '';
}

/* ------------------------------------------------------------------------ one plan item */

const isFallbackItem = (item) => {
    if (!item || !item.q) return false;
    const spec = item.q.cell || item.q;
    return !spec.template || !hasCell(spec.template);
};

function itemHtml(item, ctx, report) {
    const draw = (c) => (typeof item.render === 'function' ? item.render(c) : renderCell(item.q, c));
    let inner = draw(ctx);

    if (ctx.state === 'answered') {
        const key = item.key || (item.q ? cellAnswerKey(item.q) : null);
        const blankCtx = resolveCtx(Object.assign({}, ctx, { state: 'blank' }));
        const blankHtml = draw(blankCtx);

        // Two independent gap signals, because they catch different failures:
        //   (a) the answered render is byte-identical to the blank one - nothing was drawn;
        //   (b) the cell carries a visual but has no registered template, so it is drawing
        //       through the legacy fallback, which can only put a number on a line.
        let gap = null;
        if (item.drawsAnswer === false) gap = 'role declared the visual answer undrawable';
        else if (item.drawsAnswer !== true) {
            if (inner === blankHtml) gap = 'answered render is identical to the blank render';
            else if (item.visual && isFallbackItem(item)) gap = 'visual cell has no registered template (legacy fallback)';
        }

        inner = fillSlots(inner, key, ctx);
        if (gap) {
            const words = answerWords(item, key);
            report.gaps.push({
                skill: item.skill || '',
                template: (item.q && (item.q.cell || item.q).template) || (item.render ? 'role-render' : ''),
                page: report.page,
                index: report.index,
                reason: gap,
                printed: words,
            });
            inner += keyStamp(words, ctx);
        }
    }

    if (item.work) inner += workBox(item, ctx);
    return inner;
}

/* --------------------------------------------------------------------------- the render */

function gridPart(part, ctx, report) {
    const items = part.items || [];
    const cells = items.map((item, i) => {
        report.index = report.cellNo++;
        const gi = item.q ? cellGridItem(item.q, ctx) : { cls: '', style: '' };
        return {
            html: itemHtml(item, ctx, report),
            cls: [gi.cls, item.cls].filter(Boolean).join(' '),
            style: [gi.style, item.style].filter(Boolean).join(';'),
            nolabel: !!item.nolabel,
            model: !!item.model,
        };
    });
    // CL-12: a label run continues across sections and across pages, so the counter lives on
    // the report and a section only overrides it when it says so.
    const start = part.start !== undefined ? part.start : report.label;
    const labelled = items.filter((it, i) => !it.nolabel && !(part.unlabelled || []).includes(i)).length;
    if (part.start === undefined) report.label += labelled;
    return grid(cells, {
        cols: part.cols || 2,
        rows: part.rows,
        labels: part.labels || 'none',
        start,
        cls: part.cls || '',
        height: part.height || '',
        unlabelled: part.unlabelled || [],
        rowsTpl: part.rowsTpl || '',
        spanFirst: !!part.spanFirst,
        rowGap: Number(part.rowGap) || 0,
    });
}

/** A part's content: one part, several parts in order, or static html. */
function contentHtml(part, ctx, report) {
    if (Array.isArray(part.contents)) return part.contents.map((p) => partHtml(p, ctx, report)).join('');
    return part.content ? partHtml(part.content, ctx, report) : (part.html || '');
}

function partHtml(part, ctx, report) {
    switch (part.kind) {
        case 'instruction': return instruction(part.text || '');
        case 'grid': return gridPart(part, ctx, report);
        case 'say': return sayBand(part.frame || '', { size: ctx.size, digits: part.digits || 2 });
        case 'band': {
            // `extra`: static html at the right end of the strip (a quadrant's own "__/4").
            // `style`: a fixed band height on a banded page (PT-ENG-3), identical in both states.
            const html = band(part.label || '', part.instr || '', contentHtml(part, ctx, report), { grow: !!part.grow, extra: part.extra || '' });
            return part.style ? html.replace('<div class="ws-band', `<div style="${part.style}" class="ws-band`) : html;
        }
        case 'day': return dayBand(part.day, part.score, contentHtml(part, ctx, report));
        case 'row': {
            // Parts side by side (the Opener's Model | Steps band, Pre-skill quadrants, a probe
            // grid beside its support strip). `widths` are CSS track sizes; the row is a flex:none
            // block of fixed height, so it lays out identically on the pupil page and the key.
            const parts = part.parts || [];
            const widths = parts.map((p, i) => (part.widths && part.widths[i]) || '1fr').join(' ');
            const cells = parts.map((p) => `<div class="mq-rowcol">${partHtml(p, ctx, report)}</div>`).join('');
            return `<div class="mq-row ${part.cls || ''}" style="grid-template-columns:${widths};${part.height ? `height:${part.height};` : ''}${part.gap ? `column-gap:${part.gap};` : ''}${part.style || ''}">${cells}</div>`;
        }
        case 'col': {
            // Parts stacked inside one column of a `row` (a probe's vertical and horizontal
            // blocks beside the support strip), with a fixed gap between them.
            const gap = part.gap ? `<div style="flex:none;height:${part.gap}"></div>` : '';
            return `<div class="mq-col ${part.cls || ''}">${(part.parts || []).map((p) => partHtml(p, ctx, report)).join(gap)}</div>`;
        }
        case 'html': return part.html || '';
        default: return '';
    }
}

/**
 * Render a plan. THE NARROW INTERFACE a role composer must satisfy if it renders its own
 * pupil page instead of using this: a function `(plan, {state}) => {html, pages}` that takes
 * every layout decision from `plan` alone and takes none of them from `state`. Inject it as
 * `opts.render` and `renderAnswerKey` will use it for the key.
 *
 * @param {PagePlan} plan
 * @param {{state?: string}} [opts]
 * @returns {{html: string, pages: string[], gaps: Object[], cells: number}}
 */
export function renderPages(plan, opts = {}) {
    const state = opts.state || (plan.ctx && plan.ctx.state) || 'blank';
    const base = Object.assign({}, DEFAULT_CTX, plan.ctx, { state });
    const ctx = resolveCtx(base);
    const pages = plan.pages && plan.pages.length ? plan.pages : [{ sections: plan.sections || [] }];
    const n = pages.length;
    const report = { gaps: [], label: 1, cellNo: 0, page: 1, index: 0 };
    const key = state === 'answered';

    const out = pages.map((pg, i) => {
        report.page = i + 1;
        // HD-20: pages 2 and later carry the 12 mm continuation header - the Name line and a
        // one-line compact tab, no Date, no Score, no title. The kit's `page()` has no
        // continuation mode yet, so the plan expresses it as a header with only those parts;
        // it is identical on the pupil page and on the key, which is what parity needs.
        // The continuation tab keeps HD-5's shape: the strand lines collapse to one line and the
        // page id stays its OWN last line, so `keyHeader` replaces the id here exactly as it does
        // on page 1 and the key never loses "Level N" and the strand.
        const srcTab = ((plan.header && plan.header.tab) || []).filter(Boolean);
        const head = pg.header || (i === 0 ? (plan.header || {}) : (plan.contHeader || {
            name: (plan.header && plan.header.name) !== false,
            date: false, score: false, title: '',
            tab: srcTab.length > 1 ? [srcTab.slice(0, -1).join(' · '), srcTab[srcTab.length - 1]] : srcTab.slice(),
        }));
        const header = key ? keyHeader(head) : head;
        const footer = Object.assign({}, plan.footer, {
            center: `${i + 1}/${n}`,
            right: key ? keyFooterRight({ form: plan.form, seed: plan.seed })
                : (plan.footer && plan.footer.right) || '',
        });
        const body = (pg.sections || []).map((p) => partHtml(p, ctx, report)).join('');
        let html = page({
            look: ctx.look, size: ctx.size, tab: ctx.metrics.tabStep,
            header, footer, body,
            cls: [ctx.photocopySafe ? 'ws-photocopy' : '', key ? 'ws-key' : '', plan.cls || ''].filter(Boolean).join(' '),
            note: pg.note || '',
        });
        if (key) html = markKeyName(html);
        return html;
    });

    return { html: out.join('\n'), pages: out, gaps: report.gaps, cells: report.cellNo };
}

/* -------------------------------------------------------------------------- the key API */

/**
 * AK-4: the key is generated from the SAME plan, so the same seed and the same layout result.
 * This returns a plan, not HTML, so a role can still hand it to its own renderer.
 */
export function answerKeyPlan(plan, { form, seed } = {}) {
    const out = Object.assign({}, plan, {
        role: `${plan.role || 'page'}-key`,
        ctx: Object.assign({}, DEFAULT_CTX, plan.ctx, { state: 'answered' }),
        header: keyHeader(plan.header || {}),
        isKey: true,
    });
    if (form !== undefined) out.form = form;
    if (seed !== undefined) out.seed = seed;
    out.footer = Object.assign({}, plan.footer, { right: keyFooterRight({ form: out.form, seed: out.seed }) });
    return out;
}

/**
 * The facsimile key for a plan: same geometry, same labels, same pagination, answers in.
 *
 * @param {PagePlan} plan
 * @param {{form?: string, seed?: string|number, render?: Function}} [opts]
 * @returns {{html, pages, gaps, cells, selfKey?: true, reason?: string}}
 */
export function renderAnswerKey(plan, opts = {}) {
    // PT-KEY-7: a page with nothing to answer IS its own key, and the job says so rather than
    // reporting that no key exists.
    if (plan.nothingToAnswer) {
        const src = (opts.render || renderPages)(plan, { state: 'blank' });
        return Object.assign({}, src, {
            selfKey: true,
            reason: 'nothing to answer on this page: the page is its own key (PT-KEY-7)',
        });
    }
    const keyPlan = answerKeyPlan(plan, opts);
    return (opts.render || renderPages)(keyPlan, { state: 'answered' });
}

/** The pupil page, from the same plan. Pairing the two calls is the whole point. */
export const renderSource = (plan, opts = {}) => (opts.render || renderPages)(plan, { state: 'blank' });

/**
 * Both at once, which is how a print job should ask for them. AK-7 / PT-KEY-6: the key is a
 * separate run of sheets that starts after the last pupil page.
 */
export function renderPageAndKey(plan, opts = {}) {
    const source = renderSource(plan, opts);
    const key = renderAnswerKey(plan, opts);
    return { source, key, html: source.html + '\n' + key.html };
}

/* ----------------------------------------------------- the OTHER artefact: the flat list */

/**
 * The numbered list of answers. This is NOT the facsimile and never replaces it, but it is
 * still the right artefact for a 40-item fact probe (and PT-KEY-5's skill-to-item map is built
 * from it), so the data is available from the same plan.
 *
 * @returns {{n: number, display: string, skill: string}[]}
 */
export function answerListRows(plan) {
    const rows = [];
    let n = 1;
    const walk = (part) => {
        if (!part) return;
        if (part.kind === 'grid') {
            (part.items || []).forEach((item, i) => {
                if (item.nolabel || (part.unlabelled || []).includes(i)) return;
                const key = item.key || (item.q ? cellAnswerKey(item.q) : null);
                rows.push({
                    n: n++,
                    display: key && key.display !== undefined ? num(key.display) : num(item.answerWords),
                    skill: item.skill || '',
                });
            });
        }
        if (part.content) walk(part.content);
        if (Array.isArray(part.contents)) part.contents.forEach(walk);
        if (Array.isArray(part.parts)) part.parts.forEach(walk);
    };
    const pages = plan.pages && plan.pages.length ? plan.pages : [{ sections: plan.sections || [] }];
    for (const pg of pages) for (const part of pg.sections || []) walk(part);
    return rows;
}

/** PT-KEY-5: which items belong to which skill, for a Mixed Skill Practice key. */
export function skillItemMap(plan) {
    const map = {};
    for (const r of answerListRows(plan)) {
        if (!r.skill) continue;
        (map[r.skill] = map[r.skill] || []).push(r.n);
    }
    return map;
}

/**
 * PT-CMP-5: `coverage()` checks `state: answered` as well as `blank` for every skill x role
 * pair. This is the answered half: render the plan both ways and report what could not be
 * drawn. A pair with a gap is not a failure to PRINT a key - the key still prints, with the
 * answer in words - it is a pair whose visual answer is still owed.
 */
export function keyCoverage(plan, opts = {}) {
    const source = renderSource(plan, opts);
    const key = renderAnswerKey(plan, opts);
    return {
        cells: source.cells,
        keyCells: key.cells,
        equalCellCount: source.cells === key.cells,   // PT-KEY-1, the lint
        pages: source.pages.length,
        keyPages: key.pages.length,
        equalPageCount: source.pages.length === key.pages.length,
        gaps: key.gaps,
        selfKey: !!key.selfKey,
    };
}

export default {
    KEY_ID_LINE, keyTab, keyHeader, keyFooterRight, markKeyName,
    fillSlots, workBox, workingHtml, keyStamp, answerWords,
    renderPages, answerKeyPlan, renderAnswerKey, renderSource, renderPageAndKey,
    answerListRows, skillItemMap, keyCoverage,
};
