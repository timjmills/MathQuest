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

export function escHTML(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** True when a skill has at least one control worth showing (see offeredOptionsFor). */
export function skillHasOfferedOptions(categoryId, skillId) {
    if (!categoryId || !skillId) return false;
    try { return offeredOptionsFor(categoryId, skillId).length > 0; } catch (e) { return false; }
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
    const v = cur[def.id];
    const id = escHTML(def.id);
    const extra = h.extra ? (h.extra(def) || '') : '';
    if (def.type === 'bool') {
        return `<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.82rem;color:var(--text);">
            <input type="checkbox" ${v ? 'checked' : ''} style="width:15px;height:15px;"
                onchange="${h.set(id, 'this.checked')}">
            <span>${escHTML(def.label)}</span>
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
                <span>${escHTML(x.l)}</span>
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
        return `<div style="font-size:0.82rem;color:var(--text);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="flex:1;font-weight:600;">${escHTML(def.label)}</span>
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
    return `<label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;color:var(--text);flex-wrap:wrap;">
        <span style="flex:1;min-width:90px;">${escHTML(def.label)}</span>
        <select style="flex:1;min-width:120px;padding:5px 6px;border:1px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text);font-size:0.82rem;"
            onchange="${h.set(id, 'this.value')}">${opts}</select>
    </label>${extra}`;
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
    const defs = offeredOptionsFor(categoryId, skillId);
    const cur = normalizeOptions(categoryId, skillId, _read(host, idx, e));
    const hq = _q(hostId);
    const handlers = {
        set: (optId, expr) => `skoEdit('${hq}',${idx},'set','${optId}',${expr})`,
        toggle: (optId, i) => `skoEdit('${hq}',${idx},'toggle','${optId}',${i})`,
        all: (optId, all) => `skoEdit('${hq}',${idx},'all','${optId}',${all})`,
    };
    const rows = defs.map(def => {
        if (typeof def.appliesTo === 'function' && !def.appliesTo(cur)) return '';
        const help = def.help ? `<div style="font-size:0.7rem;color:var(--text-dim);margin-top:3px;line-height:1.35;">${escHTML(def.help)}</div>` : '';
        return `<div style="padding:7px 0;border-bottom:1px solid var(--border);">${optionControlHTML(def, cur, color, handlers)}${help}</div>`;
    }).join('');
    return `<div class="sko-panel" data-sko-host="${escHTML(hostId)}" data-sko-idx="${idx}" onclick="event.stopPropagation()"
         style="margin:4px 0 6px 0;padding:8px 12px;border-left:3px solid ${color};background:var(--bg-card-light, #f7f7fb);border-radius:0 8px 8px 0;color:var(--text);text-align:left;width:100%;box-sizing:border-box;">
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
}

export function skoEdit(hostId, idx, action, optId, raw) {
    const host = _hosts.get(hostId);
    const e = host && host.entry(idx);
    if (!e) return;
    const defs = offeredOptionsFor(e.categoryId, e.skillId);
    const next = applyOptionEdit({ ...normalizeOptions(e.categoryId, e.skillId, _read(host, idx, e)) }, defs, action, optId, raw);
    _write(host, idx, e, next);
    host.rerender();
}

export function skoReset(hostId, idx) {
    const host = _hosts.get(hostId);
    const e = host && host.entry(idx);
    if (!e) return;
    _write(host, idx, e, {});
    host.rerender();
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
