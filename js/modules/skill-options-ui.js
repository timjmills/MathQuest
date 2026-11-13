// skill-options-ui.js — ONE options panel, used wherever a skill set is built.
//
// The print dialog grew the first per-skill Options panel (a gear on the row, an inline panel of
// tick-box lists and drop-downs under it). The owner's 2026-09-24 request is that the same choice
// be available wherever a set is built and shared — the home queue's share panel, the Skills
// Navigator queue, the mixed-mode settings, the Add Skills list and the Quick Start cards — so a
// teacher can say "only the 7s and 8s" in a link. This module is that panel, lifted out of
// print-settings.js so every surface draws the same controls with the same wording:
//
//   optionControlHTML(def, cur, color, handlers)   one control (the print dialog uses it too)
//   skillOptionsGearHTML(host, idx, cat, skill)    the "⚙ Options" button, only when there is
//                                                  something the generator really honours
//   skillOptionsPanelHTML(host, idx, cat, skill)   the inline panel, when that row is open
//   skillOptionsSummaryHTML(cat, skill, opts)      the one-line "Times: 7, 8" under a label
//
// A HOST is one list on screen. It says how to find row `idx` and how to redraw itself; the
// values themselves live in the set's option store (skill-option-store.js), keyed by skill, so a
// change made in the mixed settings shows up in the share panel and in the next link. A host may
// instead keep the values on its own rows (a Quick Start card carries its `opts` in localStorage)
// by supplying read / write.
import { offeredOptionsFor, normalizeOptions, packOptions, describeOptions, isPlayOption, isMoreOption, playSummary, isNumberLineOption, numberLineSummary } from './skill-options.js';
import { normalizeRows, downStart, onePagePlan, ROW_MAX, STEP_MAX, AT_MAX } from './count-rows.js';
import { getSetOptions, setSetOptions, onSetOptionsChanged } from './skill-option-store.js';
import { SKILLS } from './data.js';
import { state } from './state.js';

// ---------------------------------------------------------------------------
// Groups and one-line help (owner, 2026-09-25: "The options should let a teacher go easier or
// harder and give more or less support")
// ---------------------------------------------------------------------------
// Every panel sets its controls out under three headings, so a teacher can see at a glance which
// control makes the page harder, which one gives more help, and which one only changes the look.
// An option names its group itself (`group` in skill-options.js); options that predate the field
// are placed by id.
export const OPTION_GROUPS = [
    { id: 'difficulty', label: 'Harder / easier' },
    { id: 'support', label: 'Support' },
    { id: 'layout', label: 'Layout' },
];
const GROUP_BY_ID = {
    band: 'difficulty', range: 'difficulty', decimals: 'difficulty', constant: 'difficulty', regroup: 'difficulty',
    unknown: 'difficulty', place: 'difficulty', places: 'difficulty', step: 'difficulty', dir: 'difficulty',
    op: 'difficulty', power: 'difficulty', zeroPlace: 'difficulty', midpoint: 'difficulty', order: 'difficulty',
    wordform: 'difficulty', simplestForm: 'difficulty',
    level: 'support', pictures: 'support', support: 'support',
    notation: 'layout', orientation: 'layout', response: 'layout', task: 'layout', tiles: 'layout',
};
export function optionGroup(def) {
    return (def && (def.group || GROUP_BY_ID[def.id])) || 'difficulty';
}

// The ONE line shown under a control, in plain teacher English. Long `help` strings (notation,
// support level) stay on the control as its tooltip; the panel shows this line instead.
const SHORT_HELP = {
    notation: 'How each problem is written. Tick more than one to mix them on the page.',
    level: 'More support first. Tick several to fade the help down the page.',
    constant: 'Tick one fact to drill it, or several for a mixed set.',
    response: 'What the pupil does: work it out, or only pick the numbers the story needs.',
    range: 'The biggest number for this skill only.',
    decimals: 'Whole numbers or decimals, for this skill only.',
    regroup: 'Whether the pupil has to carry or borrow.',
    orientation: 'Stacked in columns, or written across on one line.',
    unknown: 'Which number in the sentence is left blank.',
    simplestForm: 'On asks for the fraction in its simplest form.',
    pictures: 'Off gives the same problems as text only.',
    band: 'The biggest number on the page.',
};
/**
 * The option's VERY short explanation (owner 2026-10-03): the schema's `tip` (one line, e.g. "Step: how much each jump
 * adds"), else its short help line. Every host shows it on mouse-over and behind a "?" that a touch screen can tap.
 */
export function optionTip(def) {
    if (!def) return '';
    return String(def.tip || def.helpShort || optionHelpLine(def) || '');
}
let _tipSeq = 0;
/**
 * The "?" beside a control: hover shows the tip (title), a tap or Enter shows it under the control (a touch screen has no
 * hover). `descId` is the id of the visible line the control is described by (aria-describedby on the row).
 */
export function optionTipHTML(def) {
    const tip = optionTip(def);
    if (!tip) return { button: '', line: '', id: '' };
    const id = `skoTip${++_tipSeq}`;
    return {
        id,
        button: `<button type="button" class="sko-tip" aria-label="What is ${escHTML(def.label || def.id)}?" aria-expanded="false" aria-controls="${id}" title="${escHTML(tip)}" `
            + `onclick="event.stopPropagation();var t=document.getElementById('${id}');if(t){t.hidden=!t.hidden;this.setAttribute('aria-expanded',String(!t.hidden));}">?</button>`,
        line: `<span class="sko-tip-text" id="${id}" role="note" hidden>${escHTML(tip)}</span>`,
    };
}
export function optionHelpLine(def) {
    if (!def) return '';
    if (def.helpShort) return String(def.helpShort);
    const own = String(def.help || '');
    // A help that fits one line of a 420 px panel (two short sentences at most) is shown as it is.
    if (own && own.length <= 140) return own;
    return SHORT_HELP[def.id] || own.split(/(?<=\.)\s/)[0] || '';
}

/**
 * A control's values as the teacher should read them NOW: "Use the Max Number setting" says what
 * that setting currently is (owner, 2026-09-25), so choosing between it and "Up to 20" is not a
 * guess.
 */
function _liveDef(def) {
    if (!def || !Array.isArray(def.values)) return def;
    if (def.id !== 'range' && def.id !== 'decimals') return def;
    const DP = { 0: 'whole numbers', 1: 'tenths', 2: 'hundredths', 3: 'thousandths' };
    // A def may name its own null value (a decimals skill deals decimals whatever the setting says).
    const now = def.nullLabel ? String(def.nullLabel) : def.id === 'range'
        ? `Use the Max Number setting (now ${Number(state.range).toLocaleString('en-US')})`
        : `Use the Decimals setting (now ${DP[state.decimalPlaces] || state.decimalPlaces + ' places'})`;
    return { ...def, values: def.values.map(x => (x.v === null ? { ...x, l: now } : x)) };
}

/**
 * Every control of a skill, set out under the three group headings (a heading only when it adds
 * something: more than one group, or a group other than "Harder / easier"). `row(def)` draws one
 * control with its help line.
 */
export function groupedOptionRowsHTML(defs, cur, row, headingStyle) {
    const all = defs.filter(def => !(typeof def.appliesTo === 'function' && !def.appliesTo(cur)));
    const shown = all.filter(d => !isPlayOption(d) && !isMoreOption(d) && !isNumberLineOption(d));
    const nline = defs.filter(isNumberLineOption).filter(d => !(typeof d.appliesTo === 'function' && !d.appliesTo(cur)));
    const more = all.filter(isMoreOption);
    const play = all.filter(isPlayOption);
    const used = OPTION_GROUPS.filter(g => shown.some(d => optionGroup(d) === g.id));
    const hs = headingStyle || 'font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-dim);margin:10px 0 0;';
    const heads = used.length > 1 || (used[0] && used[0].id !== 'difficulty');
    const groups = used.map(g => `<div class="sko-group" data-sko-group="${g.id}">`
        + (heads ? `<div class="sko-group-head" role="heading" aria-level="3" style="${hs}">${escHTML(g.label)}</div>` : '')
        + shown.filter(d => optionGroup(d) === g.id).map(row).join('') + '</div>').join('');
    // Pupil play (calculator, skip): one disclosure, closed at rest, its current values in the summary line.
    const disclosure = play.length
        ? `<details class="sko-group sko-play" data-sko-group="play"${_playOpen ? ' open' : ''} ontoggle="skoPlayOpen(this.open)" style="margin-top:10px;">`
            + `<summary class="sko-play-sum" style="cursor:pointer;min-height:44px;display:flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:700;color:var(--text);">`
            + `<span aria-hidden="true">&#9662;</span><span>Pupil play</span><span class="sko-play-vals" style="font-weight:500;color:var(--text-dim);">${escHTML(playSummary(play, cur))}</span></summary>`
            + play.map(row).join('') + '</details>'
        : '';
    // Wave 1 lane C2: "More" - the layout choices a crowded panel keeps behind one closed disclosure, values in its summary.
    const moreSummary = more.map((d) => (typeof d.summary === 'function' ? d.summary(cur[d.id] === undefined ? d.default : cur[d.id]) : d.label)).join(' · ');
    const moreBox = more.length
        ? `<details class="sko-group sko-more" data-sko-group="more"${_moreOpen ? ' open' : ''} ontoggle="skoMoreOpen(this.open)" style="margin-top:10px;">`
            + `<summary class="sko-more-sum" style="cursor:pointer;min-height:44px;display:flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:700;color:var(--text);">`
            + `<span aria-hidden="true">&#9662;</span><span>More</span><span class="sko-more-vals" style="font-weight:500;color:var(--text-dim);">${escHTML(moreSummary)}</span></summary>`
            + more.map(row).join('') + '</details>'
        : '';
    // Wave 5.2: the number line at the top of the page - seven settings behind one closed disclosure,
    // its state in the summary, and a warning when the teacher's own range misses the page's numbers.
    const nlDef = nline.find(d => d.id === 'nlOn');
    let nlWarn = '', nlSummary = numberLineSummary(cur);
    if (nlDef && cur.nlOn && typeof _nlCoverCheck === 'function' && nlDef.nlSkill) {
        try {
            const info = _nlCoverCheck(nlDef.nlSkill.categoryId, nlDef.nlSkill.skillId, cur) || {};
            nlWarn = typeof info === 'string' ? info : (info.warn || '');
            if (info.summary) nlSummary = info.summary;
        } catch (e) { nlWarn = ''; }
    }
    const nlBox = nline.length
        ? `<details class="sko-group sko-nline" data-sko-group="nline"${_nlOpen ? ' open' : ''} ontoggle="skoNlineOpen(this.open)" style="margin-top:10px;">`
            + `<summary class="sko-nline-sum" style="cursor:pointer;min-height:44px;display:flex;align-items:center;gap:6px;font-size:0.8rem;font-weight:700;color:var(--text);">`
            + `<span aria-hidden="true">&#9662;</span><span>Number line at the top of the page</span><span class="sko-nline-vals" style="font-weight:500;color:var(--text-dim);">${escHTML(nlSummary)}</span></summary>`
            + (nlWarn ? `<div class="sko-nline-warn" role="alert" data-sko-warn="nline" style="margin:4px 0;padding:6px 8px;border:1px solid #b45309;border-radius:6px;font-size:0.75rem;color:var(--text);">&#9888; ${escHTML(nlWarn)}</div>` : '')
            + nline.map(row).join('') + '</details>'
        : '';
    return groups + nlBox + moreBox + disclosure;
}
let _nlOpen = false;
let _nlCoverCheck = null;
/** Remembers whether the Number line disclosure is open, so a redraw after a change keeps it open. */
export function skoNlineOpen(open) { _nlOpen = !!open; }
/** The app installs the coverage check (refline-screen.js): (categoryId, skillId, opts) -> warning text or ''. */
export function setNumberLineCoverCheck(fn) { _nlCoverCheck = typeof fn === 'function' ? fn : null; }
let _playOpen = false;
let _moreOpen = false;
/** Remembers whether the More disclosure is open, so a redraw after a change keeps it open. */
export function skoMoreOpen(open) { _moreOpen = !!open; }
/** Remembers whether the Pupil play disclosure is open, so a redraw after a change keeps it open. */
export function skoPlayOpen(open) { _playOpen = !!open; }

export function escHTML(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * A skill's NAME is its declaration (CLAUDE.md): a control whose choices would contradict it is not
 * offered. "Subtract within 100 (No Regrouping)" gets no Regrouping control (its "Every item" would
 * break the name), a skill named "with regrouping" none either (its "Never" would), and a
 * "within N" skill keeps only the number ranges that stay within N.
 */
export function nameFitOptions(categoryId, skillId, defs) {
    const list = SKILLS[categoryId];
    const hit = Array.isArray(list) ? list.find(x => x && x.v === skillId) : null;
    const name = `${hit && hit.l ? hit.l : ''} ${String(skillId).replace(/_/g, ' ')}`.toLowerCase();
    const noRegroup = /\bno regroup|\bwithout regroup|\bno borrow|\bno carry|\bnr\b/.test(name);
    const withRegroup = !noRegroup && /\bwith regroup|\bregrouping\)|\bwith borrow|\bwith carry/.test(name);
    const within = name.match(/\bwithin (\d[\d,]*)/);
    const cap = within ? Number(within[1].replace(/,/g, '')) : null;
    const out = [];
    for (const def of defs || []) {
        if (def.id === 'regroup' && /regroup|carry|borrow/i.test(String(def.label || '')) && (noRegroup || withRegroup)) continue;
        if (def.id === 'range' && cap && Array.isArray(def.values)) {
            const values = def.values.filter(x => typeof x.v !== 'number' || x.v <= cap);
            if (values.length < 2) continue;
            out.push(values.length === def.values.length ? def : { ...def, values });
            continue;
        }
        out.push(def);
    }
    return out;
}

/** True when a skill has at least one control worth showing (see offeredOptionsFor). */
export function skillHasOfferedOptions(categoryId, skillId) {
    if (!categoryId || !skillId) return false;
    try { return nameFitOptions(categoryId, skillId, offeredOptionsFor(categoryId, skillId)).length > 0; } catch (e) { return false; }
}

/**
 * One option control. `h` supplies the JS each control calls:
 *   h.set(optId, valueExpr)     enum index / bool / int input value
 *   h.toggle(optId, i)          tick / untick value i of a set
 *   h.all(optId, bool)          tick all / none of a set
 *   h.extra(def)                optional extra HTML under a control (the print dialog's
 *                               "Sheet will be titled" line)
 */
export function optionControlHTML(def, cur, color, h) {
    def = _liveDef(def);
    // A control another option overrides (count_by_tables "All 12 tables on one page"): show the value
    // it forces, disabled, with the reason - never the teacher's own value, which will not print.
    const lock = typeof def.lockedBy === 'function' ? def.lockedBy(cur || {}) : null;
    if (lock) return _lockedControlHTML(def, lock);
    const v = cur[def.id];
    const tip = def.help ? ` title="${escHTML(def.help)}"` : '';
    const id = escHTML(def.id);
    const extra = h.extra ? (h.extra(def) || '') : '';
    if (def.type === 'rows') return _rowsControlHTML(def, v, color, h, tip, cur) + extra;
    if (def.type === 'bool') {
        return `<label${tip} style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.82rem;color:var(--text);">
            <input type="checkbox" ${v ? 'checked' : ''} style="width:15px;height:15px;flex:none;"
                onchange="${h.set(id, 'this.checked')}">
            <span style="min-width:0;overflow-wrap:anywhere;">${escHTML(def.label)}</span>
        </label>${extra}`;
    }
    if (def.type === 'int') {
        return `<label${tip} style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text);">
            <span style="flex:1;">${escHTML(def.label)}</span>
            <input type="number" value="${escHTML(v)}"${def.placeholder ? ` placeholder="${escHTML(def.placeholder)}"` : ''}${def.min != null ? ` min="${def.min}"` : ''}${def.max != null ? ` max="${def.max}"` : ''}${def.step != null ? ` step="${def.step}"` : ''}
                style="width:80px;padding:5px 6px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text);font-size:0.82rem;"
                onchange="${h.set(id, 'this.value')}">
        </label>${extra}`;
    }
    if (def.type === 'set') {
        // A LIST, one choice per row: the wording on the left, a small box on the right, and the
        // whole row is the hit area (owner, 2026-09-20). Long numeric sets (the fact constant)
        // are the SAME list laid out in columns so fourteen boxes do not push everything else off
        // the dialog; a dense cell keeps a visible edge so a box cannot be read as its neighbour's.
        const chosen = Array.isArray(v) ? v : [];
        const vals = def.values || [];
        const dense = vals.length > 8 && vals.every(x => String(x.l).length <= 3);
        const pad = dense ? '5px 7px' : '6px 9px';
        const offBorder = dense ? color + '55' : 'var(--border)';
        // A value another option rules out (div_facts' array past dividends of 50, facts card F2): its box is greyed and
        // disabled, its reason on mouse-over and in a line under the list (`valueLock(cur)` -> {value: why}).
        const vlock = typeof def.valueLock === 'function' ? (def.valueLock(cur || {}) || {}) : {};
        const rows = vals.map((x, i) => {
            const why = vlock[x.v];
            if (why) {
                return `<label class="sko-set-row sko-set-locked" title="${escHTML(why)}" style="display:flex;align-items:center;justify-content:space-between;gap:${dense ? '6px' : '10px'};
                        padding:${pad};border:1px dashed ${offBorder};border-radius:7px;background:transparent;cursor:not-allowed;min-width:0;
                        font-size:0.8rem;color:var(--text-dim);font-weight:400;opacity:0.55;">
                <span style="min-width:0;overflow-wrap:anywhere;">${escHTML(x.l)}</span>
                <input type="checkbox" disabled aria-disabled="true" style="width:16px;height:16px;flex:none;margin:0;">
            </label>`;
            }
            const on = chosen.includes(x.v);
            // Checked is shown by the box alone (owner 2026-11-02): every row has the same edge and no fill.
            return `<label class="sko-set-row" style="display:flex;align-items:center;justify-content:space-between;gap:${dense ? '6px' : '10px'};
                        padding:${pad};border:1px solid ${offBorder};border-radius:7px;
                        background:transparent;cursor:pointer;min-width:0;
                        font-size:0.8rem;color:var(--text);font-weight:400;">
                <span style="min-width:0;overflow-wrap:anywhere;">${escHTML(x.l)}</span>
                <input type="checkbox" ${on ? 'checked' : ''}
                    onchange="${h.toggle(id, i)}"
                    style="width:16px;height:16px;flex:none;accent-color:${color};cursor:pointer;margin:0;">
            </label>`;
        }).join('');
        const rowsWrap = dense
            ? `display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:4px;`
            : `display:flex;flex-direction:column;gap:4px;`;
        // Nothing ticked is legal and means "no restriction" (skill-options.js), so say so.
        const none = !chosen.length
            ? `<div style="font-size:0.7rem;color:var(--text-dim);margin-top:4px;">None ticked — any of them may appear.</div>`
            : '';
        const lockNote = Object.entries(vlock).map(([v, why]) => {
            const x = vals.find((y) => String(y.v) === String(v));
            return x ? `<div class="sko-set-locknote" style="font-size:0.7rem;color:var(--text-dim);margin-top:4px;">${escHTML(x.l)}: ${escHTML(why)}</div>` : '';
        }).join('');
        return `<div${tip} style="font-size:0.82rem;color:var(--text);">
            <div class="sko-set-head" style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="flex:1 1 8em;min-width:0;font-weight:600;overflow-wrap:anywhere;">${escHTML(def.label)}</span>
                <button type="button" onclick="${h.all(id, true)}"
                    style="padding:2px 8px;font-size:0.7rem;border:1px solid var(--border);background:transparent;color:var(--text-dim);border-radius:5px;cursor:pointer;">All</button>
                <button type="button" onclick="${h.all(id, false)}"
                    style="padding:2px 8px;font-size:0.7rem;border:1px solid var(--border);background:transparent;color:var(--text-dim);border-radius:5px;cursor:pointer;">None</button>
            </div>
            <div style="${rowsWrap}">${rows}</div>
            ${none}
            ${lockNote}
            ${extra}
        </div>`;
    }
    // enum — the option index is the control value so numeric, string and null values behave alike
    const opts = (def.values || []).map((x, i) =>
        `<option value="${i}"${x.v === v ? ' selected' : ''}${x.tip ? ` title="${escHTML(x.tip)}"` : ''}>${escHTML(x.l)}</option>`
    ).join('');
    // The label sits ABOVE a full-width drop-down, so a long value ("Place-value chart (place names
    // over the digits)") never pushes the label off a 420 px panel or is cut off itself.
    // A chosen value too long for the drop-down (a phone-width panel cuts it with "…") is written
    // out in full on a line under it (OPTIONS-CRITIC-R2 §5 #21). The line starts hidden and
    // revealOverflowingChoices() shows it only when the value really is cut, measured on screen.
    const chosen = (def.values || []).find(x => x.v === v);
    const full = chosen ? `<span class="sko-chosen" data-sko-chosen hidden style="font-size:0.76rem;line-height:1.35;color:var(--text);overflow-wrap:anywhere;">${escHTML(chosen.l)}</span>` : '';
    return `<label${tip} style="display:flex;flex-direction:column;align-items:stretch;gap:4px;font-size:0.82rem;color:var(--text);min-width:0;">
        <span style="font-weight:600;overflow-wrap:anywhere;">${escHTML(def.label)}</span>
        <select style="width:100%;max-width:100%;min-width:0;box-sizing:border-box;padding:6px 6px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text);font-size:0.82rem;text-overflow:ellipsis;"
            onchange="${h.set(id, 'this.value')}">${opts}</select>${full}
    </label>${extra}`;
}

/**
 * Wave 1 lane C2: the list of count-by rows (type 'rows'). ONE control: the tables 1 to 12 as chips (a tap adds that
 * table, a second tap removes it), a typed step to add, and one line per row with its step, where it starts and which
 * way it runs. Every change is a whole new list, written as JSON into the host's own `set` handler by `mqRows`.
 */
export function mqRows(json, op, i, val) {
    let rows = normalizeRows(json);
    const at = Number(i);
    const num = Math.round(Number(val));
    // Owner 2026-10-03: the rows stand smallest step to biggest automatically. A new row goes in at its place while the list
    // is still in step order; once the teacher has moved rows by hand (Up / Down), a new row joins at the end, so the
    // hand-made order is kept.
    const sorted = rowsInStepOrder(rows);
    const put = (list, r) => (sorted ? rowsSorted(list.concat([r])) : list.concat([r]));
    if (op === 'chip') {
        const n = Number(val);
        rows = rows.some((r) => r.step === n) ? rows.filter((r) => r.step !== n) : put(rows, { step: n, start: 'step', dir: 'up' });
    } else if (op === 'add') {
        if (Number.isFinite(num) && num >= 1) rows = put(rows, { step: Math.min(STEP_MAX, num), start: 'step', dir: 'up' });
    } else if (op === 'all') {
        for (let n = 1; n <= 12 && rows.length < ROW_MAX; n++) if (!rows.some((r) => r.step === n)) rows = put(rows, { step: n, start: 'step', dir: 'up' });
    } else if (op === 'none') rows = rows.filter((r) => r.step > 12);
    else if ((op === 'up' || op === 'down') && rows[at]) {
        const to = op === 'up' ? at - 1 : at + 1;
        if (to >= 0 && to < rows.length) { rows = rows.slice(); [rows[at], rows[to]] = [rows[to], rows[at]]; }
    } else if (op === 'remove') rows = rows.filter((_, k) => k !== at);
    else if (op === 'clear') rows = [];
    else if (rows[at]) {
        const r = { ...rows[at] };
        if (op === 'step' && Number.isFinite(num) && num >= 1) r.step = num;
        else if (op === 'start') { r.start = val === 'zero' || val === 'custom' ? val : 'step'; if (r.start === 'custom' && !Number.isFinite(r.at)) r.at = 0; }
        else if (op === 'at' && Number.isFinite(num)) r.at = num;
        else if (op === 'dir') r.dir = val === 'down' ? 'down' : 'up';
        rows = rows.map((x, k) => (k === at ? r : x));
    }
    return JSON.stringify(normalizeRows(rows));
}

/** True when the rows stand in step order (smallest first): the automatic order, not one the teacher made by hand. */
export function rowsInStepOrder(rows) {
    for (let k = 1; k < rows.length; k++) if (rows[k].step < rows[k - 1].step) return false;
    return true;
}
/** The rows sorted by step, smallest first (a stable sort: equal steps keep their order). */
export function rowsSorted(rows) {
    return rows.map((r, k) => [r, k]).sort((a, b) => a[0].step - b[0].step || a[1] - b[1]).map((x) => x[0]);
}

function _rowsControlHTML(def, rows, color, h, tip, cur) {
    const list = normalizeRows(rows);
    const id = escHTML(def.id);
    const js = escHTML(JSON.stringify(list));
    const call = (op, i, valExpr) => h.set(id, `mqRows('${js}','${op}',${i},${valExpr})`);
    const field = 'padding:6px 8px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text);font-size:0.82rem;min-height:40px;box-sizing:border-box;';
    const chips = Array.from({ length: 12 }, (_, k) => k + 1).map((n) => {
        const on = list.some((r) => r.step === n);
        return `<button type="button" aria-pressed="${on}" aria-label="Count by ${n}" title="Count by ${n}: tap to add or take off this table" onclick="${call('chip', -1, String(n))}" `
            + `style="min-width:40px;min-height:40px;padding:0 6px;border:1px solid ${on ? color : 'var(--border)'};border-radius:7px;cursor:pointer;font-size:0.85rem;font-weight:${on ? 700 : 400};`
            + `background:${on ? color + '22' : 'transparent'};color:var(--text);">${n}</button>`;
    }).join('');
    const nNum = Number((cur && cur.jumps) || 12) === 15 ? 15 : 12;
    const TIP = (def.parts || {});
    const t = (k) => (TIP[k] ? ` title="${escHTML(TIP[k])}"` : '');
    const small = 'min-width:40px;min-height:40px;flex:none;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text);cursor:pointer;';
    const word = 'flex:none;font-size:0.8rem;color:var(--text);white-space:nowrap;';
    const rowsHtml = list.map((r, i) => {
        // Owner 2026-10-03: each row reads as a sentence - "Count by [3] starting at [the step] [counting on] [Up Down x]".
        const startSel = `<select aria-label="Row ${i + 1} starts at"${t('start')} onchange="${call('start', i, 'this.value')}" style="${field}flex:1 1 92px;min-width:84px;padding:6px 4px;">`
            + [['step', `${r.step.toLocaleString('en-US')} (the step)`], ['zero', '0'], ['custom', 'a number…']]
                .map(([v, l]) => `<option value="${v}"${r.start === v ? ' selected' : ''}>${escHTML(l)}</option>`).join('') + '</select>';
        const atInput = r.start === 'custom'
            ? `<input type="number" inputmode="numeric" min="0" max="${AT_MAX}" value="${r.at}" aria-label="Row ${i + 1} start number"${t('at')} onchange="${call('at', i, 'this.value')}" style="${field}width:76px;flex:none;padding:6px 4px;">` : '';
        const down = r.dir === 'down';
        const dirSel = `<select aria-label="Row ${i + 1} counts"${t('dir')} onchange="${call('dir', i, 'this.value')}" style="${field}flex:none;width:auto;padding:6px 4px;">`
            + `<option value="up"${down ? '' : ' selected'}>up &uarr;</option><option value="down"${down ? ' selected' : ''}>down &darr;</option></select>`;
        const lifted = down && r.start === 'custom' ? downStart(r, nNum) : null;
        const note = lifted !== null && lifted !== r.at
            ? `<div class="sko-row-note" style="font-size:0.7rem;color:var(--text-dim);padding:0 0 4px 0;">Starts at ${lifted.toLocaleString('en-US')} so the row has ${nNum} numbers.</div>` : '';
        const move = list.length > 1
            ? `<button type="button" aria-label="Move row ${i + 1} up"${t('move')}${i === 0 ? ' disabled' : ''} onclick="${call('up', i, '0')}" style="${small}min-width:34px;">&#9650;</button>`
                + `<button type="button" aria-label="Move row ${i + 1} down"${t('move')}${i === list.length - 1 ? ' disabled' : ''} onclick="${call('down', i, '0')}" style="${small}min-width:34px;">&#9660;</button>` : '';
        return `<div class="sko-row-line" style="padding:6px 0;border-top:1px solid var(--border);">`
            + `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;">`
            + `<span style="${word}">Count by</span>`
            + `<input type="number" inputmode="numeric" min="1" max="${STEP_MAX}" value="${r.step}" aria-label="Row ${i + 1} count by"${t('step')} onchange="${call('step', i, 'this.value')}" style="${field}width:70px;flex:none;padding:6px 4px;">`
            + `<span style="${word}">starting at</span>${startSel}${atInput}${dirSel}`
            + `<span style="flex:1 0 0;"></span>${move}`
            + `<button type="button" aria-label="Remove row ${i + 1}" title="Remove this row" onclick="${call('remove', i, '0')}" style="${small}min-width:36px;font-size:1rem;">&times;</button></div>${note}</div>`;
    }).join('');
    const full = list.length >= ROW_MAX;
    return `<div class="sko-rows"${tip} style="font-size:0.82rem;color:var(--text);">`
        + `<div style="font-weight:600;margin-bottom:6px;">${escHTML(def.label)}</div>`
        + `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><span style="flex:1;min-width:0;font-size:0.72rem;color:var(--text-dim);">Tap the tables to use</span>`
        + `<button type="button" class="sko-rows-all" title="Add every table, 1 to 12" onclick="${call('all', -1, '0')}" style="min-height:40px;padding:0 10px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text);cursor:pointer;font-size:0.76rem;">Select all</button>`
        + `<button type="button" class="sko-rows-none" title="Take off every table 1 to 12 (typed steps stay)" onclick="${call('none', -1, '0')}" style="min-height:40px;padding:0 10px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text);cursor:pointer;font-size:0.76rem;">Select none</button></div>`
        + `<div class="sko-rows-chips" style="display:flex;flex-wrap:wrap;gap:5px;">${chips}</div>`
        + `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;"><span style="font-size:0.72rem;color:var(--text-dim);">Or type a step</span>`
        + `<input type="number" inputmode="numeric" min="1" max="${STEP_MAX}" placeholder="25" aria-label="Count by (type a number)"${t('custom')}${full ? ' disabled' : ''} style="${field}width:96px;">`
        + `<button type="button"${full ? ' disabled' : ''} onclick="${call('add', -1, 'this.previousElementSibling.value')}" style="min-height:40px;padding:0 12px;border:1px solid ${color};border-radius:7px;background:${color}22;color:var(--text);cursor:pointer;font-weight:700;">Add</button>`
        + (list.length ? `<button type="button" onclick="${call('clear', -1, '0')}" style="min-height:40px;padding:0 10px;border:1px solid var(--border);border-radius:7px;background:transparent;color:var(--text-dim);cursor:pointer;">Clear</button>` : '')
        + `</div>`
        + (cur && cur.onePage && list.length && (onePagePlan(list, 'Letter').cut > 0 || onePagePlan(list, 'A4').cut > 0) ? (() => {
            const nL = onePagePlan(list, 'Letter').rows.length, nA = onePagePlan(list, 'A4').rows.length;
            const msg = nL === nA ? `${nL} of ${list.length} rows fit on one page (Letter or A4)` : `${nL} of ${list.length} rows fit on one Letter page, ${nA} on A4`;
            return `<div class="sko-onepage-note" style="font-size:0.74rem;font-weight:600;margin-top:8px;color:var(--text);">${msg}; the rest do not print.</div>`;
        })() : '')
        + (list.length ? `<div class="sko-rows-list" style="margin-top:8px;">${rowsHtml}</div>`
            : `<div style="font-size:0.72rem;color:var(--text-dim);margin-top:6px;">None chosen: the page counts by the tables 2 to 12.</div>`)
        + `</div>`;
}

function _lockedControlHTML(def, lock) {
    const vals = def.values || [];
    const shown = def.type === 'set'
        ? (Array.isArray(lock.v) && lock.v.length === vals.length && def.allLabel ? def.allLabel : (Array.isArray(lock.v) ? lock.v.join(', ') : String(lock.v)))
        : ((vals.find(x => x.v === lock.v) || {}).l || String(lock.v));
    return `<div class="sko-locked" data-sko-locked="${escHTML(def.id)}" aria-disabled="true" style="display:flex;flex-direction:column;gap:4px;font-size:0.82rem;color:var(--text);min-width:0;opacity:0.85;">
        <span style="font-weight:600;overflow-wrap:anywhere;">${escHTML(def.label)}</span>
        <select disabled aria-label="${escHTML(def.label)}" style="width:100%;max-width:100%;min-width:0;box-sizing:border-box;padding:6px 6px;border:1px dashed var(--border);border-radius:6px;background:transparent;color:var(--text);font-size:0.82rem;"><option selected>${escHTML(shown)}</option></select>
        <span style="font-size:0.72rem;color:var(--text-dim);">${escHTML(lock.why)}</span>
    </div>`;
}

let _measureCtx = null;
/**
 * Show the full-label line under every drop-down whose chosen value does not fit in it. The width
 * a <select> leaves for its text is its content box less the arrow; the text is measured in the
 * select's own font. Safe to call on any subtree, any number of times.
 */
export function revealOverflowingChoices(root) {
    if (!root || typeof document === 'undefined' || !root.querySelectorAll) return;
    try {
        if (!_measureCtx) _measureCtx = document.createElement('canvas').getContext('2d');
    } catch (e) { _measureCtx = null; }
    for (const sel of root.querySelectorAll('select')) {
        const line = sel.parentElement && sel.parentElement.querySelector(':scope > [data-sko-chosen]');
        if (!line) continue;
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !sel.clientWidth) { line.hidden = true; continue; }
        const cs = getComputedStyle(sel);
        let w = opt.text.length * parseFloat(cs.fontSize) * 0.55;   // a fallback when there is no canvas
        if (_measureCtx) {
            _measureCtx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
            w = _measureCtx.measureText(opt.text).width;
        }
        const room = sel.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0) - 22;
        line.hidden = !(w > room);
    }
}
/** Reveal the full-label lines on every open panel once the browser has laid it out. */
function _revealSoon() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const run = () => { for (const el of document.querySelectorAll('.sko-panel, #skillOptionsPopover')) revealOverflowingChoices(el); };
    if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run); else setTimeout(run, 0);
}

/**
 * The live sample, tidied for a popover: a legacy printed item (a stacked sum, an expanded-form
 * row) takes the PRINT stylesheet's rules (`.print-edition`), so its column rule sits under the
 * numbers instead of the item header's rule sitting over them, and the header (the item number
 * only) and the printed item's own box edge are dropped; then the drawing is scaled down to the frame so it never overflows it
 * (OPTIONS-CRITIC-R2 §5 #23).
 */
function _tidySample(frame) {
    if (!frame) return;
    for (const p of frame.querySelectorAll('.tvp-printed')) {
        p.classList.add('print-edition');
        // The printed item's own box edge is the page's; the sample frame is the box here.
        for (const w of p.querySelectorAll('.worksheet-problem')) { w.style.border = 'none'; w.style.boxShadow = 'none'; }
        for (const h of p.querySelectorAll('.p-head, .problem-header')) {
            if (!String(h.textContent || '').replace(/\s+/g, '').replace(/^\d+\.$/, '')) h.style.display = 'none';
        }
    }
    const stage = frame.querySelector(':scope > .tvp-stage');
    if (!stage) return;
    // The centred scale below is the panel's fit: a thumbnail crop (teacher-preview fit's `is-cropped`, origin top-left)
    // under it puts the stage off the frame (lf-algebra F8/G11), so it never survives a tidy.
    frame.classList.remove('is-cropped');
    _sampleShowAll(stage);     // each tidy starts from the whole item, at the panel's own frame height (re-runs are idempotent)
    _sampleSaidOnce(stage);    // a question line the drawn item already says is hidden (critic-panel-r2 F6)
    _sampleChoices(stage);     // answer choices: lettered, figures two to a row (critic-panel-r2 F2)
    frame.style.height = '';
    const fw = frame.clientWidth - SAMPLE_PAD;
    const base = frame.clientHeight - SAMPLE_PAD;
    if (fw <= 0 || base <= 0) return;
    // The frame is border-box (`.tv-sko *`): a grown height is its inner height plus the border, so the frame never ends
    // shorter than its CSS height and the drawing reaches the scale it was grown for (critic-panel-r1 F3).
    const border = frame.offsetHeight - frame.clientHeight;
    const vh = (typeof window !== 'undefined' && window.innerHeight) || 800;
    // (the frame grows up to 36 % of the window and 300 px: room for a whole step, answer choice or matching table at 9 px)
    const cap = Math.max(base, Math.min(300, Math.round(vh * 0.36)) - border - SAMPLE_PAD);
    // A part that is one drawing and cannot be split (a set of groups, a graph) may grow the frame past the cap, up to
    // 45 % of the window and 420 px, so its own labels reach 9 px (critic-panel-r2 F3).
    const cap2 = Math.max(cap, Math.min(420, Math.round(vh * 0.45)) - border - SAMPLE_PAD);
    const tall = (w, h, need) => Math.min(cap2, h * Math.min(_sampleZoom(need), fw / w, Math.max(cap, h * need) / h));
    const setInner = (inner, max = cap) => {
        const px = Math.max(base, Math.min(max, Math.ceil(inner)));
        if (px > base) frame.style.height = `${px + SAMPLE_PAD + border}px`;
        return frame.clientHeight - SAMPLE_PAD;
    };
    const place = (w, h, fh, need = 1) => {
        const k = Math.min(_sampleZoom(need), fw / w, fh / h);
        stage.style.transform = `translate(-50%, -50%) scale(${k.toFixed(4)})`;
        return k;
    };
    _sampleUnclip(stage);      // a box inside the item that clips its own content is opened up (critic-panel-r2 F1)
    const whole = _sampleSize(stage);
    // The scale at which the sample is legible: its strokes reach 0.3 (teacher-preview's MIN_LEGIBLE) and its smallest
    // word or digit is drawn at 9 px (critic-panel-r1 F1). A sample that reaches it whole is shown whole, the frame grown
    // (up to 36 % of the window and 300 px) only as far as it needs.
    const need = _sampleNeed(stage);
    if (Math.min(_sampleZoom(need), fw / whole.w, cap / whole.h) >= need - 0.001) {
        _samplePartUI(frame, 0, 1);
        place(whole.w, whole.h, setInner(whole.h * need), need);
        return;
    }
    // Too big to read whole inside the capped frame: the panel shows what ONE item looks like one whole part at a time
    // (the question; then the drawing; then the answer choices, ...), each part legible, with "1 of N" and arrows. A part
    // is a whole block of the item, never a crop through it.
    const pages = _samplePages(stage, fw, cap);
    if (!pages.length) {   // nothing to split along: the whole item, as large as the capped frame allows
        _samplePartUI(frame, 0, 1);
        place(whole.w, whole.h, setInner(tall(whole.w, whole.h, need), cap2), need);
        return;
    }
    const want = Math.max(...pages.map((p) => tall(p.w, p.h, p.need)));
    let fh = setInner(want, cap2);
    // The panel could not give the frame that height (a short window): the parts are packed again for the frame it has.
    if (fh < Math.min(want, cap2) - 1) {
        const again = _samplePages(stage, fw, fh);
        if (again.length) { pages.splice(0, pages.length, ...again); fh = setInner(Math.max(...pages.map((p) => p.h * Math.min(_sampleZoom(p.need), fw / p.w, fh / p.h))), fh); }
    }
    const at = Math.max(0, Math.min(pages.length - 1, Number(frame.dataset.skoPart) || 0));
    _sampleShowPage(stage, pages, at);
    const now = _sampleSize(stage);
    place(now.w, now.h, fh, pages[at].need);
    _samplePartUI(frame, at, pages.length);
}
// (teacher-preview's MIN_LEGIBLE: below it a sample's strokes are hairlines)
const SAMPLE_MIN_LEGIBLE = 0.3;
// The smallest word or digit of a sample, as drawn (ws-options-shots' legibility floor).
const SAMPLE_MIN_TEXT_PX = 9;
const SAMPLE_PAD = 12;
// A page of parts is filled only while it is drawn at least at half size.
const SAMPLE_PART_MIN = 0.5;
// A drawing whose own labels are under 9 px (a number line's 9 px ticks at 0.65, a grid's 6 px tag) may be drawn larger
// than 1, up to this, so its labels reach the floor (critic-panel-r2 F3).
const SAMPLE_MAX_ZOOM = 2;
function _sampleZoom(need) { return Math.min(SAMPLE_MAX_ZOOM, Math.max(1, need || 1)); }
// The answer-choice blocks of an item (screen cell and printed item).
const SAMPLE_CHOICES = '.tvp-options, .opt-list';

/**
 * Said once (critic-panel-r2 F6), as live play's mq-dup: when the item's drawing (a word problem's story, a widget that
 * draws itself after the preview mounted) shows the whole question line, the line is hidden. Judged on what is drawn.
 */
function _sampleSaidOnce(stage) {
    const line = stage.querySelector('.tvp-q');
    const vis = stage.querySelector('.tvp-visual') || stage.querySelector('.tvp-printed');
    if (!line || !vis || line.style.display === 'none') return;
    const norm = (t) => ` ${String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
    const want = norm(line.textContent);
    if (want.trim().length < 6 || !/[a-z]{3,}/.test(want)) return;
    if (norm(vis.innerText).includes(want)) line.style.display = 'none';
}

/**
 * Answer choices are one unit of the item (critic-panel-r2 F2): each carries its letter (a figure-only choice gets A, B,
 * C ... in the sample, as the pupil's choices are read out), and figure choices are laid two to a row so the whole set
 * can be one legible part. Idempotent.
 */
function _sampleChoices(stage) {
    for (const block of stage.querySelectorAll(SAMPLE_CHOICES)) {
        const opts = [...block.children].filter((c) => c.matches('.tvp-opt, .opt'));
        if (!opts.length) continue;
        opts.forEach((c, i) => {
            if (c.querySelector(':scope > .tv-sko-optletter')) return;
            const own = [...c.querySelectorAll('*'), c].filter((e) => !e.closest('svg')).map((e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('')).join('').trim();
            if (own) return;
            const tag = document.createElement('span');
            tag.className = 'tv-sko-optletter';
            tag.textContent = String.fromCharCode(65 + i);
            c.insertBefore(tag, c.firstChild);
        });
        if (opts.length >= 3 && opts.some((c) => c.querySelector('svg, img, canvas'))) {
            block.style.display = 'grid';
            block.style.gridTemplateColumns = 'repeat(2, auto)';
            block.style.justifyContent = 'center';
            block.style.maxWidth = 'none';
        }
    }
}

/**
 * A box inside the item that clips its own content (a 12 x 12 chart in a 400 px scroller) is opened up, and the widths
 * that held it are released, so the stage measures the real content and the parts can split it (critic-panel-r2 F1).
 */
function _sampleUnclip(stage) {
    // innermost boxes first, and again until nothing changes: an opened box can make the box around it overflow
    const all = [...stage.querySelectorAll('*')].reverse();
    let any = false;
    for (let pass = 0, changed = true; changed && pass < 4; pass++) {
        changed = false;
        for (const el of all) if (_sampleUnclipOne(stage, el)) { changed = true; any = true; }
    }
    return any;
}
function _sampleUnclipOne(stage, el) {
    {
        if (el.closest('svg') || !el.getClientRects().length) return false;
        const cs = getComputedStyle(el);
        const wide = cs.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1;
        const tall = cs.overflowY !== 'visible' && el.scrollHeight > el.clientHeight + 1;
        if (!wide && !tall) return false;
        el.style.setProperty('overflow', 'visible', 'important');   // (a print rule may hold it with !important)
        if (tall) { el.style.height = 'auto'; el.style.maxHeight = 'none'; }
        for (let a = el; a && a !== stage; a = a.parentElement) a.style.maxWidth = 'none';
        return true;
    }
}
const _SKO_HIDE = 'skoHide';

/** The stage's layout size with nothing hidden or scaled; a drawing wider than the stage widens it (teacher-preview fit). */
function _sampleSize(stage) {
    stage.style.transform = 'translate(-50%, -50%)';
    stage.style.width = ''; stage.style.maxWidth = '';
    stage.style.paddingLeft = ''; stage.style.paddingRight = ''; stage.style.paddingTop = ''; stage.style.paddingBottom = '';
    _sampleFitStage(stage);
    // (padding the stage out reflows the item: a box it makes overflow is opened, and the stage measured again)
    if (_sampleUnclip(stage)) {
        stage.style.width = ''; stage.style.maxWidth = '';
        stage.style.paddingLeft = ''; stage.style.paddingRight = ''; stage.style.paddingTop = ''; stage.style.paddingBottom = '';
        _sampleFitStage(stage);
    }
    return { w: Math.max(stage.scrollWidth, stage.offsetWidth, 1), h: Math.max(stage.scrollHeight, stage.offsetHeight, 1) };
}
function _sampleFitStage(stage) {
    if (stage.scrollWidth > stage.offsetWidth + 1) { stage.style.maxWidth = 'none'; stage.style.width = `${stage.scrollWidth}px`; }
    // Content that overhangs the stage VISIBLY (a timeline row centred wider than its box spills past both sides; scroll
    // sizes miss the left side) pads the stage out to it, so the frame fits what is drawn (critic-panel-r2 F1).
    const o = _sampleOverhang(stage);
    if (o) {
        const cs = getComputedStyle(stage);
        stage.style.maxWidth = 'none';
        if (stage.style.width) stage.style.width = `${parseFloat(stage.style.width) + o.l + o.r}px`;
        else if (o.l + o.r > 0) stage.style.width = `${stage.offsetWidth + o.l + o.r}px`;
        stage.style.paddingLeft = `${parseFloat(cs.paddingLeft) + o.l}px`; stage.style.paddingRight = `${parseFloat(cs.paddingRight) + o.r}px`;
        stage.style.paddingTop = `${parseFloat(cs.paddingTop) + o.t}px`; stage.style.paddingBottom = `${parseFloat(cs.paddingBottom) + o.b}px`;
    }
}
/** How far the stage's drawn content reaches past its own box on each side (unscaled px), or null when it does not. */
function _sampleOverhang(stage) {
    const r = stage.getBoundingClientRect();
    let l = 0, t = 0, rr = 0, b = 0;
    for (const el of stage.querySelectorAll('*')) {
        if (el.parentElement && el.parentElement.closest('svg')) continue;
        const q = el.getBoundingClientRect();
        if (!(q.width > 0 && q.height > 0)) continue;
        l = Math.max(l, r.left - q.left); rr = Math.max(rr, q.right - r.right);
        t = Math.max(t, r.top - q.top); b = Math.max(b, q.bottom - r.bottom);
    }
    const c = (v) => (v > 1 ? Math.ceil(v) : 0);
    return c(l) || c(rr) || c(t) || c(b) ? { l: c(l), r: c(rr), t: c(t), b: c(b) } : null;
}

/** The scale at which everything visible in `root` is legible: 0.3 for strokes, 9 px for its smallest word or digit (HTML or SVG). */
function _sampleNeed(root) {
    let min = Infinity;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (!n.textContent.trim()) continue;
        const el = n.parentElement;
        if (!el || !el.getClientRects().length) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
        // SVG text counts too (critic-panel-r2 F3): its size times the drawing's own scale (the stage is unscaled here)
        if (el.closest('svg')) {
            const m = el.getScreenCTM && el.getScreenCTM();
            const px = (parseFloat(cs.fontSize) || 0) * (m ? Math.hypot(m.a, m.b) : 1);
            if (px > 0 && px < min) min = px;
            continue;
        }
        // (a drawing's own nested scale counts: bounding width / layout width, measured while the stage is unscaled)
        // (a ratio within 3 % of 1 is the layout width's whole-pixel rounding, not a scale)
        let own = el.offsetWidth >= 4 ? el.getBoundingClientRect().width / el.offsetWidth : 1;
        if (!(own > 0) || Math.abs(own - 1) < 0.03) own = 1;
        const px = (parseFloat(cs.fontSize) || 0) * own;
        if (px > 0 && px < min) min = px;
    }
    return Math.max(SAMPLE_MIN_LEGIBLE, Number.isFinite(min) ? SAMPLE_MIN_TEXT_PX / min : 0);
}

function _sampleShown(el) { return el.getClientRects().length > 0 && getComputedStyle(el).display !== 'none'; }
// (a block with no height draws nothing: it is never a part of its own)
function _sampleDrawn(el) { return _sampleShown(el) && el.getBoundingClientRect().height > 0; }

/**
 * The item's whole parts, in reading order: a block that is legible on its own inside the capped frame is one part; a
 * block that is not, and is a plain column of blocks (no loose words, not a table, grid or drawing), gives its own
 * blocks instead. The answer choices are always ONE part (critic-panel-r2 F2). A table too big to read whole gives
 * TILES, `{table, r: [first, last], c: [first, last]}`: a block of its rows and columns, its heading row and its row
 * labels (the first column) kept on every tile, so every cell of it is on some part (critic-panel-r2 F1).
 * Returns the leaves and every block split along the way (the leaves' ancestors).
 */
function _sampleLeaves(el, fits, splits) {
    if (el.matches(SAMPLE_CHOICES)) return [el];
    if (fits(el)) return [el];
    if (el.tagName === 'TABLE' && !el.closest('svg')) {
        // a one-row table that sets blocks side by side (a word list beside its definitions) gives its cells, left to right
        const rows = [...el.rows].filter(_sampleDrawn);
        const cells = rows.length === 1 ? [...rows[0].cells].filter(_sampleDrawn) : [];
        if (cells.length >= 2) {
            splits.push(el, rows[0]);
            if (rows[0].parentElement !== el) splits.push(rows[0].parentElement);
            return cells.flatMap((c) => _sampleLeaves(c, fits, splits));
        }
        const tiles = _sampleTiles(el, fits);
        if (tiles) {
            splits.push(el);
            return tiles;
        }
    }
    if (el.tagName.toLowerCase() === 'svg' && !(el.parentElement && el.parentElement.closest('svg'))) {
        const slices = _sampleSvgSlices(el, fits);
        if (slices) { splits.push(el); return slices; }
    }
    const kids = [...el.children].filter(_sampleDrawn);
    const cs = getComputedStyle(el);
    const loose = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    // A grid (a place-value mat: its labels over its mats) splits by its columns, each column whole, read left to right.
    if (/grid/.test(cs.display) && kids.length >= 2 && !loose && !el.closest('svg, table')) {
        const lefts = [...new Set(kids.map((k) => Math.round(k.offsetLeft)))].sort((a, b) => a - b);
        if (lefts.length >= 2) {
            splits.push(el);
            el.dataset.skoGridSplit = '1';
            kids.forEach((k) => { k.dataset.skoCol = String(lefts.indexOf(Math.round(k.offsetLeft))); });
            const order = kids.slice().sort((a, b) => (+a.dataset.skoCol - +b.dataset.skoCol) || (a.offsetTop - b.offsetTop));
            return order.flatMap((k) => _sampleLeaves(k, fits, splits));
        }
    }
    const column = /^(block|flex|flow-root|list-item)$/.test(cs.display) && !(cs.display === 'flex' && /row/.test(cs.flexDirection) && cs.flexWrap === 'nowrap');
    if (!kids.length || loose || !column || el.closest('svg, table')) return [el];
    splits.push(el);
    if (kids.length === 1) return _sampleLeaves(kids[0], fits, splits);   // a wrapper (the visual's own box): look inside it
    return kids.flatMap((k) => _sampleLeaves(k, fits, splits));
}

const _leafEl = (l) => (l && (l.table || l.svg)) || l;
const _isTile = (l) => !!(l && (l.table || l.svg));
function _sampleTileShow(t) { if (t.table) _sampleTileApply(t); else _sampleSliceApply(t); }
/**
 * A drawing too wide to read whole (a number line, a row of shapes, a grid whose labels are under 9 px when it spans the
 * frame) is paged in SLICES of its viewBox, `{svg, x: [from, to], y: [from, to]}` in its own units, read like a page, each
 * overlapping the next by a tenth so a label on a cut is whole on one of them (critic-panel-r2 F3: "scale or page them"). Null: no split.
 */
function _sampleSvgSlices(svg, fits) {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !(vb.width > 0) || !(vb.height > 0) || !svg.querySelector('text')) return null;
    const cuts = (len, n) => { const step = len / n, lap = step * 0.1; return [...Array(n).keys()].map((i) => [Math.max(0, i * step - lap), Math.min(len, (i + 1) * step + lap)]); };
    // the fewest slices that are all legible: across first, then down, then both (a tall grid is cut into quarters)
    for (const [nx, ny] of [[2, 1], [3, 1], [1, 2], [4, 1], [2, 2], [1, 3], [3, 2], [2, 3], [3, 3]]) {
        const tiles = [];
        for (const y of cuts(vb.height, ny)) for (const x of cuts(vb.width, nx)) tiles.push({ svg, x, y });
        if (tiles.every((t) => fits(svg, t))) return tiles;
    }
    return null;
}
/** Show only a slice of a drawing: its viewBox narrowed to the slice, its width narrowed in step (same units per px). */
function _sampleSliceApply(tile) {
    const svg = tile.svg;
    if (svg.dataset.skoVb === undefined) {
        const r = svg.getBoundingClientRect();
        const k = svg.closest('.tvp-stage') ? (svg.closest('.tvp-stage').getBoundingClientRect().width / (svg.closest('.tvp-stage').offsetWidth || 1)) || 1 : 1;
        svg.dataset.skoVb = svg.getAttribute('viewBox') || '';
        svg.dataset.skoWh = `${svg.style.width}|${svg.style.height}|${svg.style.maxWidth}|${r.width / k}|${r.height / k}`;
    }
    const [x, y, w, h] = svg.dataset.skoVb.split(/[\s,]+/).map(Number);
    const [, , , pw, ph] = svg.dataset.skoWh.split('|');
    const sw = tile.x[1] - tile.x[0], sh = tile.y[1] - tile.y[0];
    svg.setAttribute('viewBox', `${x + tile.x[0]} ${y + tile.y[0]} ${sw} ${sh}`);
    svg.style.maxWidth = 'none';
    svg.style.width = `${(Number(pw) * sw) / w}px`;
    svg.style.height = `${(Number(ph) * sh) / h}px`;
}
function _sampleSliceRestore(stage) {
    for (const svg of stage.querySelectorAll('svg[data-sko-vb]')) {
        if (svg.dataset.skoVb) svg.setAttribute('viewBox', svg.dataset.skoVb); else svg.removeAttribute('viewBox');
        const [w, h, mw] = svg.dataset.skoWh.split('|');
        svg.style.width = w; svg.style.height = h; svg.style.maxWidth = mw;
        delete svg.dataset.skoVb; delete svg.dataset.skoWh;
    }
}


/** A table's tiles: as many columns as fit across, then as many rows as fit down, both split evenly. Null: no split. */
function _sampleTiles(table, fits) {
    const rows = [...table.rows].filter(_sampleDrawn);
    const nCols = Math.max(0, ...rows.map((r) => r.cells.length));
    if (rows.length < 2 || nCols < 2) return null;
    const dataRows = rows.length - 1, dataCols = nCols - 1;
    // (a table with a spanning cell keeps all its columns: it pages by rows only)
    const spans = rows.some((r) => [...r.cells].some((c) => c.colSpan > 1));
    let k = spans ? dataCols : 0;
    while (k < dataCols && fits(table, { table, r: [1, 1], c: [1, k + 1] })) k++;
    if (!k) return null;
    const cGroups = Math.ceil(dataCols / k), cSize = Math.ceil(dataCols / cGroups);
    let m = 0;
    while (m < dataRows && fits(table, { table, r: [1, m + 1], c: [1, cSize] })) m++;
    if (!m) return null;
    const rGroups = Math.ceil(dataRows / m), rSize = Math.ceil(dataRows / rGroups);
    if (rGroups * cGroups < 2) return null;
    const out = [];
    for (let r = 1; r <= dataRows; r += rSize) {
        for (let c = 1; c <= dataCols; c += cSize) out.push({ table, r: [r, Math.min(dataRows, r + rSize - 1)], c: [c, Math.min(dataCols, c + cSize - 1)] });
    }
    return out;
}
/** Show only a tile of its table: the heading row and the row-label column, and its own rows and columns. */
function _sampleTileApply(tile) {
    const rows = [...tile.table.rows].filter((r) => r.dataset[_SKO_HIDE] || _sampleDrawn(r));
    rows.forEach((row, i) => {
        if (i && (i < tile.r[0] || i > tile.r[1])) { _sampleHide(row); return; }
        [...row.cells].forEach((cell, j) => { if (j && (j < tile.c[0] || j > tile.c[1])) _sampleHide(cell); });
    });
}

/** Pack the item's parts into pages, each legible inside the capped frame. Pages: [{leaves, w, h, need}]. */
function _samplePages(stage, fw, cap) {
    const cell = stage.querySelector('.tvp-cell') || stage;
    const legible = () => {
        const s = _sampleSize(stage);
        const need = Math.max(SAMPLE_PART_MIN, _sampleNeed(stage));
        return Math.min(_sampleZoom(need), fw / s.w, cap / s.h) >= need - 0.001;
    };
    // a block is legible on its own when the stage, showing only it (and the boxes around it), fits at its own scale
    const fits = (el, tile = null) => {
        _sampleShowAll(stage);
        for (let a = el; a && a !== cell && a.parentElement; a = a.parentElement) {
            for (const sib of a.parentElement.children) if (sib !== a && _sampleShown(sib)) _sampleHide(sib);
            const g = a.parentElement;
            if (g.dataset.skoGridSplit && !g.dataset.skoGrid) { g.dataset.skoGrid = g.style.gridTemplateColumns || '-'; g.style.gridTemplateColumns = 'repeat(1, auto)'; }
        }
        if (tile) _sampleTileShow(tile);
        const ok = legible();
        _sampleShowAll(stage);
        return ok;
    };
    const splits = [];
    const leaves = _sampleLeaves(cell, fits, splits);
    if (leaves.length < 2) return [];
    const tree = { leaves, splits };
    // (a part of drawings only is packed to half size, not to the strokes' 0.3 floor: one part is never a column of specks)
    const fitsPage = (page, floor = SAMPLE_PART_MIN) => {
        _sampleApply(stage, tree, page);
        const s = _sampleSize(stage);
        const need = Math.max(floor, _sampleNeed(stage));
        return Math.min(_sampleZoom(need), fw / s.w, cap / s.h) >= need - 0.001;
    };
    const isChoice = (l) => !_isTile(l) && l.matches(SAMPLE_CHOICES);
    const pages = [];
    let cur = [];
    for (const leaf of leaves) {
        // the answer choices are a part of their own: never with the question, never spread (critic-panel-r2 F2)
        if (isChoice(leaf)) { if (cur.length) pages.push(cur); pages.push([leaf]); cur = []; continue; }
        // (two tiles of one table never share a part: a part shows one block of the chart)
        const sameTable = _isTile(leaf) && cur.some((l) => _isTile(l) && _leafEl(l) === _leafEl(leaf));
        if (!cur.length || (!sameTable && fitsPage([...cur, leaf]))) { cur = [...cur, leaf]; continue; }
        pages.push(cur);
        cur = [leaf];
    }
    if (cur.length) pages.push(cur);
    // An empty answer slot is never a part of its own: it joins the question's part (or the nearest part it fits on).
    const slotOnly = (page) => page.every((l) => !_isTile(l) && l.matches('.tvp-answerrow, .mq-slot') && !l.textContent.trim());
    for (let i = pages.length - 1; i >= 0 && pages.length > 1; i--) {
        if (!slotOnly(pages[i])) continue;
        const to = [0, ...pages.keys()].find((j) => j !== i && !slotOnly(pages[j]) && !pages[j].some(isChoice) && fitsPage([...pages[j], ...pages[i]].sort((x, y) => leaves.indexOf(x) - leaves.indexOf(y)), SAMPLE_MIN_LEGIBLE));
        // (an empty slot that fits on no part is left out: the teacher sees the question and its drawing, never a part
        // that is one blank box)
        if (to === undefined) { pages.splice(i, 1); continue; }
        pages[to] = [...pages[to], ...pages[i]].sort((x, y) => leaves.indexOf(x) - leaves.indexOf(y));
        pages.splice(i, 1);
    }
    // (one part left once an empty slot is left out: the item without its blank box, shown legibly, with no "1 of 1")
    if (pages.length < 2) { _sampleShowAll(stage); return []; }
    const out = pages.map((page) => { _sampleApply(stage, tree, page); return { leaves: page, tree, need: Math.max(SAMPLE_PART_MIN, _sampleNeed(stage)), ..._sampleSize(stage) }; });
    _sampleShowAll(stage);
    return out;
}

/** Show only `page`'s parts (and the blocks that hold them). */
function _sampleApply(stage, tree, page) {
    _sampleShowAll(stage);
    const els = page.map(_leafEl);
    for (const el of tree.splits) if (!els.some((l) => el.contains(l))) _sampleHide(el);
    for (const l of tree.leaves) if (!_isTile(l) && !page.includes(l)) _sampleHide(l);
    for (const l of page) if (_isTile(l)) _sampleTileShow(l);
    // a split grid shows only some of its columns: it lays out that many (auto-placement keeps each label over its mat)
    for (const g of tree.splits) {
        if (!g.dataset.skoGridSplit || g.dataset[_SKO_HIDE]) continue;
        const cols = new Set([...g.children].filter((k) => k.dataset.skoCol !== undefined && !k.dataset[_SKO_HIDE]).map((k) => k.dataset.skoCol));
        g.dataset.skoGrid = g.style.gridTemplateColumns || '-';
        g.style.gridTemplateColumns = `repeat(${Math.max(1, cols.size)}, auto)`;
    }
}
function _sampleHide(el) { if (el.dataset[_SKO_HIDE]) return; el.dataset[_SKO_HIDE] = el.style.display || '-'; el.style.display = 'none'; }
function _sampleShowPage(stage, pages, at) { _sampleApply(stage, pages[at].tree, pages[at].leaves); }
function _sampleShowAll(stage) {
    _sampleSliceRestore(stage);
    for (const g of stage.querySelectorAll('[data-sko-grid]')) {
        g.style.gridTemplateColumns = g.dataset.skoGrid === '-' ? '' : g.dataset.skoGrid;
        delete g.dataset.skoGrid;
    }
    for (const el of stage.querySelectorAll('[data-sko-hide]')) {
        const was = el.dataset[_SKO_HIDE];
        el.style.display = was === '-' ? '' : was;
        delete el.dataset[_SKO_HIDE];
    }
}

/** The "1 of N" line over the frame (hidden when the sample is shown whole). */
function _samplePartUI(frame, at, n) {
    frame.dataset.skoPart = String(at);
    const box = frame.closest('.tv-sko-sample');
    const ui = box && box.querySelector('.tv-sko-part');
    if (!ui) return;
    ui.hidden = n < 2;
    if (n < 2) return;
    const label = ui.querySelector('.tv-sko-part-n');
    if (label) label.textContent = `${at + 1} of ${n}`;
    const prev = ui.querySelector('[data-sko-part="-1"]');
    const next = ui.querySelector('[data-sko-part="1"]');
    if (prev) prev.disabled = at === 0;
    if (next) next.disabled = at === n - 1;
}

/** Apply one control change to a full option object. Shared by every host and the print dialog. */
export function applyOptionEdit(next, defs, action, optId, raw) {
    const def = defs.find(d => d.id === optId);
    if (!def) return next;
    if (action === 'set') {
        if (def.type === 'bool') next[optId] = raw === true || raw === 'true';
        else if (def.type === 'rows') next[optId] = normalizeRows(raw);
        else if (def.type === 'int') { if (def.nullable && (raw === '' || raw === null)) next[optId] = null; else { const n = Number(raw); if (Number.isFinite(n)) next[optId] = n; } }
        else if (def.type === 'enum') { const hit = (def.values || [])[Number(raw)]; if (hit) next[optId] = hit.v; }
    } else if (action === 'toggle' && def.type === 'set') {
        const hit = (def.values || [])[Number(raw)];
        if (!hit) return next;
        const cur = Array.isArray(next[optId]) ? next[optId].slice() : [];
        const at = cur.indexOf(hit.v);
        if (at === -1) cur.push(hit.v); else cur.splice(at, 1);
        const order = def.values.map(x => x.v);
        cur.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        next[optId] = cur;
    } else if (action === 'all' && def.type === 'set') {
        next[optId] = raw ? def.values.map(x => x.v) : [];
    }
    return next;
}

// ---------------------------------------------------------------------------
// Hosts
// ---------------------------------------------------------------------------
const _hosts = new Map();
let _open = null;   // `${host}|${cat}:${skill}` — one panel open at a time, app-wide

/**
 * @param {string} hostId
 * @param {object} host
 * @param {(idx:number)=>({categoryId:string, skillId:string}|null)} host.entry
 * @param {()=>void} host.rerender
 * @param {(idx:number)=>object} [host.read]    own storage (default: the set's option store)
 * @param {(idx:number, packed:object)=>void} [host.write]
 */
export function registerSkillOptionsHost(hostId, host) { _hosts.set(hostId, host); }

function _read(host, idx, e) { return host.read ? (host.read(idx) || {}) : getSetOptions(e.categoryId, e.skillId); }
function _write(host, idx, e, opts) {
    const packed = packOptions(e.categoryId, e.skillId, opts);
    if (host.write) host.write(idx, packed);
    else setSetOptions(e.categoryId, e.skillId, packed);   // the store notifies every listener
}

export function isSkillOptionsOpen(hostId, categoryId, skillId) {
    return _open === `${hostId}|${categoryId}:${skillId}`;
}

const _q = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/** The ⚙ button for a row, or '' when the skill offers nothing. */
export function skillOptionsGearHTML(hostId, idx, categoryId, skillId, color = '#8b5cf6') {
    if (!skillHasOfferedOptions(categoryId, skillId)) return '';
    const open = isSkillOptionsOpen(hostId, categoryId, skillId);
    return `<button type="button" class="sko-gear" data-sko-host="${escHTML(hostId)}" data-sko-idx="${idx}"
        onclick="event.stopPropagation();skoToggle('${_q(hostId)}',${idx})" title="Skill options — what this skill drills"
        aria-expanded="${open}"
        style="display:inline-flex;align-items:center;gap:4px;background:${open ? color : 'transparent'};border:1px solid ${open ? color : color + '88'};color:${open ? '#fff' : color};cursor:pointer;font-size:0.72rem;font-weight:700;padding:4px 9px;border-radius:999px;white-space:nowrap;min-height:28px;">&#9881;<span>Options</span></button>`;
}

/** "Times: 7, 8" as a small line, or '' at the defaults. */
export function skillOptionsSummaryHTML(categoryId, skillId, opts) {
    const o = opts || getSetOptions(categoryId, skillId);
    if (!o || !Object.keys(o).length) return '';
    const text = describeOptions(categoryId, skillId, o);
    return text ? `<span class="sko-summary" style="display:block;font-size:0.72rem;color:var(--text-dim);margin-top:1px;font-weight:500;">${escHTML(text)}</span>` : '';
}

/** The inline panel for a row, or '' when that row is closed. */
export function skillOptionsPanelHTML(hostId, idx, categoryId, skillId, color = '#8b5cf6') {
    if (!isSkillOptionsOpen(hostId, categoryId, skillId)) return '';
    const host = _hosts.get(hostId);
    if (!host) return '';
    const e = { categoryId, skillId };
    const defs = nameFitOptions(categoryId, skillId, offeredOptionsFor(categoryId, skillId));
    const cur = normalizeOptions(categoryId, skillId, _read(host, idx, e));
    const hq = _q(hostId);
    const handlers = {
        set: (optId, expr) => `skoEdit('${hq}',${idx},'set','${optId}',${expr})`,
        toggle: (optId, i) => `skoEdit('${hq}',${idx},'toggle','${optId}',${i})`,
        all: (optId, all) => `skoEdit('${hq}',${idx},'all','${optId}',${all})`,
    };
    const rows = groupedOptionRowsHTML(defs, cur, def => {
        const line = optionHelpLine(def);
        const help = line ? `<div style="font-size:0.7rem;color:var(--text-dim);margin-top:3px;line-height:1.35;">${escHTML(line)}</div>` : '';
        const tp = optionTipHTML(def);
        return `<div class="sko-has-tip" role="group" aria-label="${escHTML(def.label || def.id)}"${tp.id ? ` aria-describedby="${tp.id}"` : ''} style="position:relative;padding:7px 0;border-bottom:1px solid var(--border);">${tp.button}${optionControlHTML(def, cur, color, handlers)}${tp.line}${help}</div>`;
    });
    return `<div class="sko-panel" data-sko-host="${escHTML(hostId)}" data-sko-idx="${idx}" onclick="event.stopPropagation()"
         style="margin:4px 0 6px 0;padding:8px 12px;border-left:3px solid ${color};background:var(--bg-card-light, #f7f7fb);border-radius:0 8px 8px 0;color:var(--text);text-align:left;width:100%;box-sizing:border-box;">
        <div style="font-size:0.85rem;font-weight:700;overflow-wrap:anywhere;">${escHTML(_skillName(categoryId, skillId))}</div>
        <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.04em;color:var(--text-dim);margin-bottom:2px;">SKILL OPTIONS — travel with this skill into every link, code and print</div>
        ${rows}
        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:8px;">
            <button type="button" onclick="skoReset('${hq}',${idx})"
                style="padding:6px 10px;font-size:0.75rem;border:1px solid var(--border);background:transparent;color:var(--text-dim);border-radius:6px;cursor:pointer;">Reset to default</button>
            <button type="button" onclick="skoToggle('${hq}',${idx})"
                style="padding:6px 12px;font-size:0.75rem;border:none;background:${color};color:#fff;border-radius:6px;cursor:pointer;font-weight:600;">Done</button>
        </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Handlers (attached to window in globals.js)
// ---------------------------------------------------------------------------
export function skoToggle(hostId, idx) {
    const host = _hosts.get(hostId);
    const e = host && host.entry(idx);
    if (!e) return;
    const key = `${hostId}|${e.categoryId}:${e.skillId}`;
    _open = _open === key ? null : key;
    host.rerender();
    _revealSoon();
}

export function skoEdit(hostId, idx, action, optId, raw) {
    const host = _hosts.get(hostId);
    const e = host && host.entry(idx);
    if (!e) return;
    const defs = nameFitOptions(e.categoryId, e.skillId, offeredOptionsFor(e.categoryId, e.skillId));
    const next = applyOptionEdit({ ...normalizeOptions(e.categoryId, e.skillId, _read(host, idx, e)) }, defs, action, optId, raw);
    _write(host, idx, e, next);
    host.rerender();
    _revealSoon();
}

export function skoReset(hostId, idx) {
    const host = _hosts.get(hostId);
    const e = host && host.entry(idx);
    if (!e) return;
    _write(host, idx, e, {});
    host.rerender();
}

// ---------------------------------------------------------------------------
// The floating panel: window.openSkillOptionsPanel(categoryId, skillId, anchorEl, { opts, onChange })
// ---------------------------------------------------------------------------
// For screens that keep options on their own rows and just want the editor (the teacher view's
// Sets and Print screens call this). The same controls as every inline panel, in a popover beside
// the button that opened it — a bottom sheet on a phone — reporting each change through
// onChange(nextPackedOpts). It holds no values of its own beyond the session it is open for.
let _pop = null;   // { categoryId, skillId, opts, onChange, anchor }

function _popHostRegister() {
    registerSkillOptionsHost('popover', {
        entry: () => (_pop ? { categoryId: _pop.categoryId, skillId: _pop.skillId } : null),
        read: () => (_pop ? _pop.opts : {}),
        write: (i, packed) => {
            if (!_pop) return;
            _pop.opts = packed;
            try { if (typeof _pop.onChange === 'function') _pop.onChange(Object.keys(packed).length ? { ...packed } : null); }
            catch (e) { console.error('[skill-options] onChange failed', e); }
        },
        rerender: () => _renderPopover(),
    });
}
_popHostRegister();

function _isTeacherView() {
    return typeof document !== 'undefined' && !!document.body && document.body.classList.contains('teacher-mode');
}

function _skillName(categoryId, skillId) {
    const list = SKILLS[categoryId];
    const hit = Array.isArray(list) ? list.find(s => s && s.v === skillId) : null;
    return hit && hit.l ? hit.l : skillId;
}

/**
 * The teacher view's popover: the skill's name, what is chosen now, the controls, a live
 * sample of the skill with these choices (teacher-preview.js, through window.tvMountSample),
 * and Reset / Done. Drawn with the teacher tokens (teacher.css .tv-sko). It stays inside the
 * window: beside the button when there is room, above it or pinned to the bottom when not, and
 * a bottom sheet on a phone. The body scrolls; the header and Done never leave the screen.
 */
/**
 * The teacher accent as a #rrggbb hex (the option controls append alpha digits to it), read from
 * the --tv-accent token so the popover follows css/teacher.css + css/brand.css. Falls back to the
 * brand accent when the token is missing or not a plain hex.
 */
function _teacherAccent() {
    const dark = document.documentElement.classList.contains('dark');
    const fallback = dark ? '#B5A5F4' : '#5E3FCC';
    try {
        const v = getComputedStyle(document.body).getPropertyValue('--tv-accent').trim();
        return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
    } catch (e) { return fallback; }
}

function _renderTeacherPopover(el) {
    const { categoryId, skillId } = _pop;
    const color = _teacherAccent();
    const defs = nameFitOptions(categoryId, skillId, offeredOptionsFor(categoryId, skillId));
    const cur = normalizeOptions(categoryId, skillId, _pop.opts);
    const handlers = {
        set: (optId, expr) => `skoEdit('popover',0,'set','${optId}',${expr})`,
        toggle: (optId, i) => `skoEdit('popover',0,'toggle','${optId}',${i})`,
        all: (optId, all) => `skoEdit('popover',0,'all','${optId}',${all})`,
    };
    const rows = groupedOptionRowsHTML(defs, cur, def => {
        const line = optionHelpLine(def);
        const tp = optionTipHTML(def);
        const help = line ? `<p class="tv-sko-help">${escHTML(line)}</p>` : '';
        return `<div class="tv-sko-row sko-has-tip" role="group" aria-label="${escHTML(def.label || def.id)}"${tp.id ? ` aria-describedby="${tp.id}"` : ''}>${tp.button}${optionControlHTML(def, cur, color, handlers)}${tp.line}${help}</div>`;
    }, 'font-size:13px;line-height:18px;font-weight:700;color:var(--tv-text);margin:16px 0 0;');
    const chosen = Object.keys(_pop.opts || {}).length ? describeOptions(categoryId, skillId, _pop.opts) : '';
    const summary = !defs.length ? 'No options to set' : (chosen || 'Standard settings');
    const name = _skillName(categoryId, skillId);
    const canSample = typeof window.tvMountSample === 'function';
    // Keep the body's scroll position across re-renders (each change redraws the popover).
    const oldBody = el.querySelector('.tv-sko-body');
    const scroll = oldBody ? oldBody.scrollTop : 0;
    const FOCUSABLE = 'input, select, button';
    const focusAt = el.contains(document.activeElement) ? [...el.querySelectorAll(FOCUSABLE)].indexOf(document.activeElement) : -1;
    el.className = 'tv-sko';
    el.setAttribute('aria-labelledby', 'tvSkoTitle');
    el.removeAttribute('aria-label');
    el.innerHTML = `<div class="tv-sko-head">
            <div><h2 class="tv-sko-title" id="tvSkoTitle">${escHTML(name)}</h2><p class="tv-sko-sum${_pop.sumOpen ? ' is-open' : ''}" id="tvSkoSum" title="${escHTML(summary)}">${escHTML(summary)}</p><button type="button" class="tv-sko-more" aria-controls="tvSkoSum" aria-expanded="${_pop.sumOpen ? 'true' : 'false'}" hidden>${_pop.sumOpen ? 'Show less' : 'Show all'}</button></div>
            <button type="button" class="tv-icon-btn" onclick="closeSkillOptionsPanel()" aria-label="Close options"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg></button>
        </div>
        ${canSample ? `<div class="tv-sko-sample is-pinned"><div class="tv-sko-samplehead"><span class="tv-label" id="tvSkoSampleL">Sample question</span><span class="tv-sko-part" hidden><button type="button" class="tv-icon-btn" data-sko-part="-1" aria-label="Previous part of the sample"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><span class="tv-sko-part-n" aria-live="polite"></span><button type="button" class="tv-icon-btn" data-sko-part="1" aria-label="Next part of the sample"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button></span></div><div class="tvp-frame tv-sko-frame" aria-labelledby="tvSkoSampleL"></div></div>` : ''}
        <div class="tv-sko-body" style="overflow-x:hidden;">
            ${defs.length ? rows : '<p class="tv-sko-none">This skill has no options.</p>'}
        </div>
        <div class="tv-sko-foot">
            ${defs.length ? `<button type="button" class="tv-btn" onclick="skoReset('popover',0)">Reset to default</button>` : ''}
            <button type="button" class="tv-btn tv-btn-primary" onclick="closeSkillOptionsPanel()">Done</button>
        </div>`;
    // Teacher-styled drop-downs (the shared control draws the pupil app's inline look).
    el.querySelectorAll('.tv-sko-body select').forEach(sel => { sel.removeAttribute('style'); sel.classList.add('tv-select'); });
    const body = el.querySelector('.tv-sko-body');
    if (body) body.scrollTop = scroll;
    if (focusAt >= 0) {
        const again = el.querySelectorAll(FOCUSABLE)[focusAt];
        if (again) { try { again.focus({ preventScroll: true }); } catch (e) { /* */ } }
    }
    // Placed first, so the sample is fitted to the panel's real width; every later change of the panel's height (the
    // tidies grow the frame, a choice line is revealed) re-clamps it inside the window (critic-panel-r1 F2).
    _placeTeacherPopover(el);
    if (canSample) {
        const frame = el.querySelector('.tv-sko-frame');
        try {
            window.tvMountSample(frame, categoryId, skillId, _pop.opts);
            _tidySample(frame);
            // The preview re-fits itself once its styles settle; tidy again after it.
            setTimeout(() => { if (frame.isConnected) { _tidySample(frame); _clampTeacherPopover(el); } }, 950);
        } catch (e) { /* a sample never breaks the editor */ }
        for (const b of el.querySelectorAll('.tv-sko-part [data-sko-part]')) {
            b.addEventListener('click', () => {
                frame.dataset.skoPart = String((Number(frame.dataset.skoPart) || 0) + Number(b.dataset.skoPart));
                try { _tidySample(frame); } catch (e) { /* */ }
                _clampTeacherPopover(el);
                if (b.disabled) { const other = el.querySelector(`.tv-sko-part [data-sko-part="${-Number(b.dataset.skoPart)}"]`); if (other) other.focus({ preventScroll: true }); }
            });
        }
    }
    _wireSummaryMore(el);
    revealOverflowingChoices(el);
    _clampTeacherPopover(el);
    _watchTeacherPopover(el);
}

/** The option summary is clamped to two lines; when it is cut, a "Show all" button opens it, so touch and keyboard reach
 *  the full text, not only the hover title (critic-panel-r2 F5). */
function _wireSummaryMore(el) {
    const sum = el.querySelector('.tv-sko-sum');
    const more = el.querySelector('.tv-sko-more');
    if (!sum || !more) return;
    more.hidden = !(_pop.sumOpen || sum.scrollHeight > sum.clientHeight + 1);
    more.onclick = () => {
        _pop.sumOpen = !_pop.sumOpen;
        sum.classList.toggle('is-open', _pop.sumOpen);
        more.setAttribute('aria-expanded', _pop.sumOpen ? 'true' : 'false');
        more.textContent = _pop.sumOpen ? 'Show less' : 'Show all';
        _clampTeacherPopover(el);
    };
}

/** Keep a floating panel inside the window after it grew (its placement measured it before the sample was tidied). */
function _clampTeacherPopover(el) {
    if (!el || !el.isConnected || el.classList.contains('is-sheet') || el.classList.contains('is-docked') || el.classList.contains('is-halfsheet')) return;
    const vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    if (r.bottom > vh - 12) el.style.top = Math.round(Math.max(12, vh - 12 - r.height)) + 'px';
}

// One watcher per open panel: its own size changes (ResizeObserver) re-clamp it; a window resize re-places it from the
// button that opened it and re-fits the sample to the new frame.
let _popWatch = null;
function _watchTeacherPopover(el) {
    if (_popWatch && _popWatch.el === el) return;
    _unwatchTeacherPopover();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => _clampTeacherPopover(el)) : null;
    if (ro) ro.observe(el);
    let t = 0;
    const onResize = () => {
        clearTimeout(t);
        t = setTimeout(() => {
            if (!_pop || !el.isConnected) return;
            if (_pop.anchor && _pop.anchor.isConnected && _pop.anchor.getBoundingClientRect) _pop.rect = _pop.anchor.getBoundingClientRect();
            _placeTeacherPopover(el);
            const frame = el.querySelector('.tv-sko-frame');
            try { if (frame) _tidySample(frame); } catch (e) { /* */ }
            _clampTeacherPopover(el);
        }, 100);
    };
    window.addEventListener('resize', onResize);
    _popWatch = { el, ro, onResize };
}
function _unwatchTeacherPopover() {
    if (!_popWatch) return;
    if (_popWatch.ro) _popWatch.ro.disconnect();
    window.removeEventListener('resize', _popWatch.onResize);
    _popWatch = null;
}

function _placeTeacherPopover(el) {
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    const r = _pop.rect;
    el.style.cssText = '';
    const hasPreview = !!document.querySelector('#teacherApp .tv-preview-card');
    if ((vw < 600 && !hasPreview) || !r || (!r.width && !r.height)) {
        el.classList.add('is-sheet');
        el.style.maxHeight = Math.round(vh * 0.85) + 'px';
        return;
    }
    // Never over the sidebar: the popover belongs to the screen that opened it.
    const side = document.querySelector('#teacherApp .tv-side');
    const sr = side ? side.getBoundingClientRect() : null;
    const minLeft = (sr && sr.width && getComputedStyle(side).display !== 'none' ? sr.right : 0) + 12;
    // Owner 2026-10-03: never over the print PREVIEW. On a screen with a live preview the popover docks over the column
    // beside it (the full height of the window), so the page stays in view and redraws as options change; where the
    // two columns are stacked it is a bottom sheet over the lower half, leaving the preview's top half visible.
    const prev = document.querySelector('#teacherApp .tv-preview-card');
    const pr = prev && prev.offsetParent !== null ? prev.getBoundingClientRect() : null;
    if (pr && pr.width > 0) {
        const room = pr.left - minLeft - 12;
        if (room >= 320 && pr.left > minLeft) {
            el.classList.add('is-docked');
            el.style.left = Math.round(minLeft) + 'px';
            el.style.top = '12px';
            el.style.width = Math.round(Math.min(480, room)) + 'px';
            el.style.height = (vh - 24) + 'px';
            el.style.maxHeight = (vh - 24) + 'px';
            return;
        }
        el.classList.add('is-halfsheet');
        // the preview's top half must show above the sheet: bring it into view when it has scrolled away
        if (pr.top < 0 || pr.top > vh * 0.25) { try { prev.scrollIntoView({ block: 'start' }); } catch (e) { /* */ } }
        el.style.maxHeight = Math.round(vh * 0.5) + 'px';
        el.style.height = Math.round(vh * 0.5) + 'px';
        if (sr && sr.width && getComputedStyle(side).display !== 'none') el.style.left = Math.round(sr.right) + 'px';
        return;
    }
    const w = Math.min(440, vw - minLeft - 12);
    el.style.width = w + 'px';
    el.style.maxHeight = (vh - 24) + 'px';
    el.style.left = '0px';
    el.style.top = '0px';
    const h = Math.min(el.offsetHeight, vh - 24);
    const left = Math.max(minLeft, Math.min(vw - w - 12, r.left));
    let top = r.bottom + 8;
    if (top + h > vh - 12) top = r.top - 8 - h;               // above the button
    if (top < 12) top = Math.max(12, vh - 12 - h);            // or pinned to the bottom edge
    el.style.left = Math.round(left) + 'px';
    el.style.top = Math.round(top) + 'px';
}

// The popover redraws its whole body on every change: keep a keyboard user on the same control (ui3 check D2).
const _POP_FOCUSABLE = 'button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])';
function _popFocusables(el) { return el ? [...el.querySelectorAll(_POP_FOCUSABLE)].filter((x) => !x.disabled && x.offsetParent !== null) : []; }
function _renderPopover() {
    if (!_pop || typeof document === 'undefined') return;
    const was = document.getElementById('skillOptionsPopover');
    const ae = was && document.activeElement && was.contains(document.activeElement) ? document.activeElement : null;
    const at = ae ? _popFocusables(was).indexOf(ae) : -1;
    _renderPopoverBody();
    if (at >= 0) {
        const f = _popFocusables(document.getElementById('skillOptionsPopover'));
        const t = f[Math.min(at, f.length - 1)];
        if (t && t !== document.activeElement) { try { t.focus({ preventScroll: true }); } catch (e) { /* */ } }
    }
}
function _renderPopoverBody() {
    let el = document.getElementById('skillOptionsPopover');
    if (!el) {
        el = document.createElement('div');
        el.id = 'skillOptionsPopover';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-label', 'Skill options');
        el.addEventListener('click', (e) => e.stopPropagation());
        document.body.appendChild(el);
    }
    if (_isTeacherView()) { _renderTeacherPopover(el); return; }
    const color = '#6d28d9';
    const { categoryId, skillId } = _pop;
    const defs = nameFitOptions(categoryId, skillId, offeredOptionsFor(categoryId, skillId));
    const cur = normalizeOptions(categoryId, skillId, _pop.opts);
    const handlers = {
        set: (optId, expr) => `skoEdit('popover',0,'set','${optId}',${expr})`,
        toggle: (optId, i) => `skoEdit('popover',0,'toggle','${optId}',${i})`,
        all: (optId, all) => `skoEdit('popover',0,'all','${optId}',${all})`,
    };
    const rows = defs.length ? groupedOptionRowsHTML(defs, cur, def => {
        const line = optionHelpLine(def);
        const help = line ? `<div style="font-size:0.72rem;color:var(--text-dim,#666);margin-top:3px;line-height:1.35;">${escHTML(line)}</div>` : '';
        const tp = optionTipHTML(def);
        return `<div class="sko-has-tip" role="group" aria-label="${escHTML(def.label || def.id)}"${tp.id ? ` aria-describedby="${tp.id}"` : ''} style="position:relative;padding:8px 0;border-bottom:1px solid var(--border,#e5e7eb);">${tp.button}${optionControlHTML(def, cur, color, handlers)}${tp.line}${help}</div>`;
    }, 'font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-dim,#666);margin:12px 0 0;')
        : '<p style="font-size:0.85rem;margin:8px 0;">This skill has nothing to choose: its generator reads none of the settings an option could change.</p>';
    // The header names the SKILL (owner, 2026-09-25); what is chosen sits under it.
    const chosen = Object.keys(_pop.opts || {}).length ? describeOptions(categoryId, skillId, _pop.opts) : 'Standard settings';
    const narrow = window.innerWidth < 600;
    const place = (() => {
        // The rect is taken when the panel opens: the screen behind usually re-renders on every
        // change, which detaches the button and would leave a live rect of zeros.
        const r = _pop.rect;
        if (narrow || !r || (!r.width && !r.height)) {
            return 'left:0;right:0;bottom:0;max-height:80vh;border-radius:16px 16px 0 0;';
        }
        const w = 420;
        const left = Math.max(12, Math.min(window.innerWidth - w - 12, r.right - w));
        const below = r.bottom + 8;
        const room = window.innerHeight - below - 12;
        return room > 320
            ? `left:${left}px;top:${below}px;width:${w}px;max-height:${room}px;border-radius:14px;`
            : `left:${left}px;bottom:12px;width:${w}px;max-height:${window.innerHeight - 24}px;border-radius:14px;`;
    })();
    el.style.cssText = `position:fixed;${place}overflow-y:auto;z-index:10050;background:var(--bg-card,#fff);color:var(--text,#1a1a2e);`
        + 'box-shadow:0 12px 40px rgba(0,0,0,0.28);border:1px solid var(--border,#e5e7eb);padding:14px 16px;box-sizing:border-box;';
    el.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <div style="flex:1;min-width:0;">
                <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.04em;color:var(--text-dim,#666);">SKILL OPTIONS</div>
                <div class="sko-pop-title" style="font-size:1rem;font-weight:700;overflow-wrap:anywhere;">${escHTML(_skillName(categoryId, skillId))}</div>
                <div class="sko-pop-summary" style="font-size:0.78rem;font-weight:500;color:var(--text-dim,#666);overflow-wrap:anywhere;">${escHTML(chosen)}</div>
            </div>
            <button type="button" onclick="closeSkillOptionsPanel()" aria-label="Close"
                style="width:44px;height:44px;border-radius:50%;border:1px solid var(--border,#ddd);background:transparent;color:inherit;font-size:1.2rem;cursor:pointer;">&times;</button>
        </div>
        ${rows}
        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:10px;">
            <button type="button" onclick="skoReset('popover',0)"
                style="min-height:44px;padding:0 14px;font-size:0.85rem;border:1px solid var(--border,#ddd);background:transparent;color:inherit;border-radius:8px;cursor:pointer;">Reset to default</button>
            <button type="button" onclick="closeSkillOptionsPanel()"
                style="min-height:44px;padding:0 18px;font-size:0.85rem;border:none;background:${color};color:#fff;border-radius:8px;cursor:pointer;font-weight:700;">Done</button>
        </div>`;
    revealOverflowingChoices(el);
}

function _popOutside(e) {
    const el = document.getElementById('skillOptionsPopover');
    if (!_pop || !el) return;
    if (el.contains(e.target) || (_pop.anchor && _pop.anchor.contains && _pop.anchor.contains(e.target))) return;
    closeSkillOptionsPanel();
}
// On window, capture phase: it runs before any screen's own document handler, so Esc closes ONLY the panel (ui3 check
// D3: the print dialog under it stays open) and Tab stays inside the panel while it is open.
function _popKey(e) {
    const el = document.getElementById('skillOptionsPopover');
    if (!_pop || !el) return;
    if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        const anchor = _pop.anchor;
        const inside = el.contains(document.activeElement);
        closeSkillOptionsPanel();
        if (!inside && anchor && anchor.isConnected && typeof anchor.focus === 'function') { try { anchor.focus({ preventScroll: true }); } catch (x) { /* */ } }
        return;
    }
    if (e.key === 'Tab') {
        const f = _popFocusables(el);
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        e.stopPropagation();
        if (i < 0) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
        else if (e.shiftKey && i === 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
}
/** The control a keyboard user lands on when the panel opens: the first option's control, else Done. */
function _popFirstControl() {
    const el = document.getElementById('skillOptionsPopover');
    if (!el) return null;
    const pick = (sel) => [...el.querySelectorAll(sel)].find((x) => !x.disabled && x.offsetParent !== null);
    return pick('.tv-sko-body input, .tv-sko-body select, .tv-sko-body button')
        || pick('[role="group"] select, [role="group"] input, [role="group"] button:not(.sko-tip)')
        || pick('.tv-sko-foot .tv-btn-primary')
        || _popFocusables(el).slice(-1)[0] || null;
}

/**
 * Open the option editor for one skill beside `anchorEl`.
 * @param {string} categoryId
 * @param {string} skillId
 * @param {Element} [anchorEl]
 * @param {{opts?: object|null, onChange?: (next: object|null) => void}} [ctx]
 *        `opts` the skill's current values (packed or full); `onChange` receives the new PACKED
 *        values after every change (null when back at the defaults).
 */
export function openSkillOptionsPanel(categoryId, skillId, anchorEl, ctx = {}) {
    if (!categoryId || !skillId) return;
    const same = _pop && _pop.categoryId === categoryId && _pop.skillId === skillId && _pop.anchor === anchorEl;
    if (same) { closeSkillOptionsPanel(); return; }   // the same button toggles it shut
    const rect = anchorEl && anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect() : null;
    _pop = { categoryId, skillId, anchor: anchorEl || null, rect, onChange: ctx.onChange, opts: packOptions(categoryId, skillId, ctx.opts || {}) };
    _renderPopover();
    // Keyboard users land in the editor in every view (ui3 check D2: the pupil's print dialog too); Done / Esc hand
    // focus back to the Options button.
    const first = _popFirstControl();
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { /* */ } }
    // Esc / Tab at once (the panel is open now); outside clicks from the next tick (the opening click is not one)
    window.removeEventListener('keydown', _popKey, true);
    window.addEventListener('keydown', _popKey, true);
    setTimeout(() => {
        if (_pop) document.addEventListener('mousedown', _popOutside, true);
    }, 0);
}

export function closeSkillOptionsPanel() {
    const back = _pop && _pop.anchor;
    const hadFocus = !!(typeof document !== 'undefined' && document.activeElement && document.activeElement.closest && document.activeElement.closest('#skillOptionsPopover'));
    _pop = null;
    // The screen behind may have redrawn the button that opened the panel: find its twin.
    let target = back;
    if (back && !back.isConnected && back.getAttribute && back.getAttribute('aria-label')) {
        target = document.querySelector(`button[aria-label="${CSS.escape(back.getAttribute('aria-label'))}"]`);
    }
    if (hadFocus && target && target.isConnected && typeof target.focus === 'function') { try { target.focus({ preventScroll: true }); } catch (e) { /* */ } }
    const el = typeof document !== 'undefined' && document.getElementById('skillOptionsPopover');
    if (typeof window !== 'undefined') _unwatchTeacherPopover();
    if (el) el.remove();
    if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', _popOutside, true);
        window.removeEventListener('keydown', _popKey, true);
    }
}

// Any change to the set's options redraws every registered list and refreshes the share codes,
// so the share panel's code and the mixed settings' MX- code can never show a stale choice.
onSetOptionsChanged(() => {
    for (const host of _hosts.values()) { if (!host.read) { try { host.rerender(); } catch (e) { /* host not on screen */ } } }
    if (typeof window !== 'undefined') {
        if (typeof window.updateSkillCodeDisplay === 'function') { try { window.updateSkillCodeDisplay(); } catch (e) { /* */ } }
        if (typeof window.updateMixedCode === 'function' && document.getElementById('mixedCodeDisplay')) { try { window.updateMixedCode(); } catch (e) { /* */ } }
        const link = document.getElementById('shareableLinkField');
        if (link && link.value && typeof window.generateShareableLink === 'function') { try { window.generateShareableLink(); } catch (e) { /* */ } }
    }
});
