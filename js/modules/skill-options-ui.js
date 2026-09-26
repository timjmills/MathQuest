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
import { offeredOptionsFor, normalizeOptions, packOptions, describeOptions } from './skill-options.js';
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
    const shown = defs.filter(def => !(typeof def.appliesTo === 'function' && !def.appliesTo(cur)));
    const used = OPTION_GROUPS.filter(g => shown.some(d => optionGroup(d) === g.id));
    const hs = headingStyle || 'font-size:0.68rem;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;color:var(--text-dim);margin:10px 0 0;';
    const heads = used.length > 1 || (used[0] && used[0].id !== 'difficulty');
    return used.map(g => `<div class="sko-group" data-sko-group="${g.id}">`
        + (heads ? `<div class="sko-group-head" role="heading" aria-level="3" style="${hs}">${escHTML(g.label)}</div>` : '')
        + shown.filter(d => optionGroup(d) === g.id).map(row).join('') + '</div>').join('');
}

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
    const v = cur[def.id];
    const tip = def.help ? ` title="${escHTML(def.help)}"` : '';
    const id = escHTML(def.id);
    const extra = h.extra ? (h.extra(def) || '') : '';
    if (def.type === 'bool') {
        return `<label${tip} style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.82rem;color:var(--text);">
            <input type="checkbox" ${v ? 'checked' : ''} style="width:15px;height:15px;flex:none;"
                onchange="${h.set(id, 'this.checked')}">
            <span style="min-width:0;overflow-wrap:anywhere;">${escHTML(def.label)}</span>
        </label>${extra}`;
    }
    if (def.type === 'int') {
        return `<label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text);">
            <span style="flex:1;">${escHTML(def.label)}</span>
            <input type="number" value="${escHTML(v)}"${def.min != null ? ` min="${def.min}"` : ''}${def.max != null ? ` max="${def.max}"` : ''}${def.step != null ? ` step="${def.step}"` : ''}
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
        const rows = vals.map((x, i) => {
            const on = chosen.includes(x.v);
            return `<label style="display:flex;align-items:center;justify-content:space-between;gap:${dense ? '6px' : '10px'};
                        padding:${pad};border:1px solid ${on ? color : offBorder};border-radius:7px;
                        background:${on ? color + '1a' : 'transparent'};cursor:pointer;min-width:0;
                        font-size:0.8rem;color:var(--text);font-weight:${on ? '600' : '400'};">
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
        return `<div${tip} style="font-size:0.82rem;color:var(--text);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="flex:1;min-width:0;font-weight:600;overflow-wrap:anywhere;">${escHTML(def.label)}</span>
                <button type="button" onclick="${h.all(id, true)}"
                    style="padding:2px 8px;font-size:0.7rem;border:1px solid var(--border);background:transparent;color:var(--text-dim);border-radius:5px;cursor:pointer;">All</button>
                <button type="button" onclick="${h.all(id, false)}"
                    style="padding:2px 8px;font-size:0.7rem;border:1px solid var(--border);background:transparent;color:var(--text-dim);border-radius:5px;cursor:pointer;">None</button>
            </div>
            <div style="${rowsWrap}">${rows}</div>
            ${none}
            ${extra}
        </div>`;
    }
    // enum — the option index is the control value so numeric, string and null values behave alike
    const opts = (def.values || []).map((x, i) =>
        `<option value="${i}"${x.v === v ? ' selected' : ''}>${escHTML(x.l)}</option>`
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
    stage.style.top = '';
    stage.style.transformOrigin = '';
    stage.style.transform = 'translate(-50%, -50%)';
    // A drawing wider than the stage (a graph, a ruler) widens the stage, so the WHOLE drawing is
    // scaled into the frame - never cropped (critic figures-r7: "...any cats?", no scale shown).
    if (stage.scrollWidth > stage.offsetWidth + 1) {
        stage.style.maxWidth = 'none';
        stage.style.width = `${stage.scrollWidth}px`;
    }
    const w = Math.max(stage.scrollWidth, stage.offsetWidth, 1);
    const h = Math.max(stage.scrollHeight, stage.offsetHeight, 1);
    const fw = frame.clientWidth - 12, fh = frame.clientHeight - 12;
    if (fw <= 0 || fh <= 0) return;
    frame.classList.remove('is-cropped');
    const k = Math.min(1, fw / w, fh / h);
    stage.style.transform = `translate(-50%, -50%) scale(${k.toFixed(4)})`;
}

/** Apply one control change to a full option object. Shared by every host and the print dialog. */
export function applyOptionEdit(next, defs, action, optId, raw) {
    const def = defs.find(d => d.id === optId);
    if (!def) return next;
    if (action === 'set') {
        if (def.type === 'bool') next[optId] = raw === true || raw === 'true';
        else if (def.type === 'int') { const n = Number(raw); if (Number.isFinite(n)) next[optId] = n; }
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
        return `<div style="padding:7px 0;border-bottom:1px solid var(--border);">${optionControlHTML(def, cur, color, handlers)}${help}</div>`;
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
        const help = line ? `<p class="tv-sko-help">${escHTML(line)}</p>` : '';
        return `<div class="tv-sko-row">${optionControlHTML(def, cur, color, handlers)}${help}</div>`;
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
            <div><h2 class="tv-sko-title" id="tvSkoTitle">${escHTML(name)}</h2><p class="tv-sko-sum">${escHTML(summary)}</p></div>
            <button type="button" class="tv-icon-btn" onclick="closeSkillOptionsPanel()" aria-label="Close options"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg></button>
        </div>
        ${canSample ? `<div class="tv-sko-sample is-pinned"><span class="tv-label" id="tvSkoSampleL">Sample question</span><div class="tvp-frame tv-sko-frame" aria-labelledby="tvSkoSampleL"></div></div>` : ''}
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
    if (canSample) {
        const frame = el.querySelector('.tv-sko-frame');
        try {
            window.tvMountSample(frame, categoryId, skillId, _pop.opts);
            _tidySample(frame);
            // The preview re-fits itself once its styles settle; tidy again after it.
            setTimeout(() => { if (frame.isConnected) _tidySample(frame); }, 950);
        } catch (e) { /* a sample never breaks the editor */ }
    }
    _placeTeacherPopover(el);
    revealOverflowingChoices(el);
}

function _placeTeacherPopover(el) {
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;
    const r = _pop.rect;
    el.style.cssText = '';
    if (vw < 600 || !r || (!r.width && !r.height)) {
        el.classList.add('is-sheet');
        el.style.maxHeight = Math.round(vh * 0.85) + 'px';
        return;
    }
    // Never over the sidebar: the popover belongs to the screen that opened it.
    const side = document.querySelector('#teacherApp .tv-side');
    const sr = side ? side.getBoundingClientRect() : null;
    const minLeft = (sr && sr.width && getComputedStyle(side).display !== 'none' ? sr.right : 0) + 12;
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

function _renderPopover() {
    if (!_pop || typeof document === 'undefined') return;
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
        return `<div style="padding:8px 0;border-bottom:1px solid var(--border,#e5e7eb);">${optionControlHTML(def, cur, color, handlers)}${help}</div>`;
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
function _popKey(e) { if (e.key === 'Escape') closeSkillOptionsPanel(); }

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
    if (_isTeacherView()) {
        // Keyboard users land in the editor; Done / Esc hand focus back to the Options button.
        const first = document.querySelector('#skillOptionsPopover .tv-sko-body input, #skillOptionsPopover .tv-sko-body select, #skillOptionsPopover .tv-sko-body button, #skillOptionsPopover .tv-sko-foot .tv-btn-primary');
        if (first) { try { first.focus({ preventScroll: true }); } catch (e) { /* */ } }
    }
    setTimeout(() => {
        document.addEventListener('mousedown', _popOutside, true);
        document.addEventListener('keydown', _popKey, true);
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
    if (el) el.remove();
    if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', _popOutside, true);
        document.removeEventListener('keydown', _popKey, true);
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
