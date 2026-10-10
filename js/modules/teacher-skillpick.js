// teacher-skillpick.js — the "tick skills, then practise or print" kit shared by the White Rose lessons
// screen (teacher-wrm.js) and the MAP page (teacher-map-tasks.js): groups of skills as thumbnails or
// list rows with a tick box each, "Select all" per group, quick group buttons, per-skill Practice /
// Print, and the action bar (Practice link through the app's existing share flow, so pupils land in
// the unchanged pupil flow; Print opens the Print worksheets screen with one mixed section).
//
// A picker owns its ticks and its last link. The host screen hands it the current groups
// ({ id: [{ key, opts?, partial?, why? }] }), places its markup and passes clicks to handle().

import { state } from './state.js';
import { icon, esc, toast, copyText, findSkill, levelText, loadSetIntoQueue, currentSet } from './teacher-ui.js';
import { printSkills } from './teacher-print.js';
import { skillView, setSkillView, viewToggleHTML, lazyThumbs, tvpAttrs, infoButtonHTML } from './teacher-preview.js';

export const k2p = (key) => key.replace(':', '|');
export const liveKey = (key) => { const [c, s] = String(key || '').split(':'); return !!(c && s && findSkill(c, s)); };

/** A pupil link for these skills through the app's existing share flow (stable share codes). */
export function makePracticeLink(items) {
    const before = currentSet().map((x) => ({ categoryId: x.categoryId, skillId: x.skillId, weight: x.weight, opts: x.opts }));
    const prevSettings = state.shareSettings;
    const prevType = state.shareLinkType;
    let link = '';
    loadSetIntoQueue({ skills: items });
    try {
        state.shareSettings = { timer: '?', problemCount: '?', gameMode: 'practice', range: '?', decimals: '?', quickStartLocked: '?' };
        state.shareLinkType = 'direct';
        link = window.generateShareableLink ? window.generateShareableLink() : '';
    } catch (e) {
        link = '';
    } finally {
        loadSetIntoQueue({ skills: before });
        state.shareSettings = prevSettings;
        state.shareLinkType = prevType;
    }
    return link;
}

/** "To be built: <name>" — each name a button to the Skills to be made screen at that entry. */
export function toBeBuiltHTML(ids, nameOf, lead = 'To be built') {
    if (!ids || !ids.length) return '';
    return `<p class="tvw-tbb">${esc(lead)}: ${ids.map((id) => `<button type="button" class="tvw-tbb-link" data-todo-open="${esc(id)}">${esc(nameOf(id))}</button>`).join(', ')}</p>`;
}

/**
 * opts.idp       prefix for element ids ('tvw' → #tvwBar, #tvwLink)
 * opts.root()    the screen element
 * opts.redraw()  re-render the groups (after a tick or a view change)
 */
export function createPicker(opts) {
    const p = { ticked: new Set(), link: '', linkNote: '', view: skillView(), groups: {} };
    const idp = opts.idp;
    const root = () => opts.root();

    p.reset = () => { p.ticked.clear(); p.link = ''; p.linkNote = ''; };
    p.setGroups = (g) => { p.groups = g || {}; };
    p.all = () => Object.values(p.groups).flat();

    const bits = (x) => {
        const [c, s] = x.key.split(':');
        const sk = findSkill(c, s);
        return { c, s, sk, p: k2p(x.key), on: p.ticked.has(k2p(x.key)), opts: x.opts && Object.keys(x.opts).length ? x.opts : null };
    };
    const tickHTML = (b, label) => `<button type="button" class="tv-check tvw-tick" role="checkbox" aria-checked="${b.on}" data-w-tick="${esc(b.p)}" aria-label="Tick ${esc(label)}"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span></button>`;
    const quickHTML = (b, label) => `<span class="tvw-q"><button type="button" class="tv-btn tv-btn-sm" data-w-one="link" data-w-key="${esc(b.p)}" aria-label="Practice link for ${esc(label)}">${icon('link', 16)}<span>Practice</span></button>
      <button type="button" class="tv-btn tv-btn-sm" data-w-one="print" data-w-key="${esc(b.p)}" aria-label="Print ${esc(label)}">${icon('print', 16)}<span>Print</span></button></span>`;
    const why = (x) => (x.partial ? ` · <span class="tvw-tag tvw-part">Covers part</span> <span class="tvw-why">${esc(x.partial)}</span>`
        : x.why ? ` · <span class="tvw-why">${esc(x.why)}</span>` : '');

    function cardHTML(x) {
        const b = bits(x);
        const label = b.sk ? b.sk.label : x.key;
        const o = b.opts ? ` data-tvp-opts="${esc(JSON.stringify(b.opts))}"` : '';
        return `<li class="tvw-card${b.on ? ' is-on' : ''}">
      <div class="tvw-card-top">${tickHTML(b, label)}<span class="tvw-card-name">${esc(label)}</span></div>
      <button type="button" class="tvw-thumbbtn" data-w-tick="${esc(b.p)}" aria-hidden="true" tabindex="-1"><span class="tvp-frame tvp-thumb" data-tvp-lazy="${esc(b.p)}"${o}></span></button>
      <p class="tvw-card-meta">${esc(b.sk ? levelText(b.sk.level) : '')} ${why(x)}</p>
      ${quickHTML(b, label)}</li>`;
    }
    function rowHTML(x) {
        const b = bits(x);
        const label = b.sk ? b.sk.label : x.key;
        return `<li class="tvw-row${b.on ? ' is-on' : ''}"${tvpAttrs(b.c, b.s, b.opts)}>${tickHTML(b, label)}
      <span class="tvw-row-main" data-tvp-anchor><span class="tvw-row-name">${esc(label)}</span><span class="tvw-row-meta">${esc(b.sk ? levelText(b.sk.level) : '')} ${why(x)}</span></span>
      ${infoButtonHTML(label)}${quickHTML(b, label)}</li>`;
    }

    /** One group: heading with a count and "Select all", the cards or rows, or the empty text. */
    p.groupHTML = (g, h, cap, empty, after = '') => {
        const list = p.groups[g] || [];
        const n = list.length;
        const allOn = n && list.every((x) => p.ticked.has(k2p(x.key)));
        return `<section class="tvw-group" aria-labelledby="${idp}H-${g}" data-w-group="${g}">
      <div class="tvw-group-head"><div><h3 class="tv-h3" id="${idp}H-${g}">${h} <span class="tvw-n-sm">${n}</span></h3>${cap ? `<p class="tv-cap">${cap}</p>` : ''}</div>
        ${n ? `<button type="button" class="tv-check" role="checkbox" aria-checked="${allOn}" data-w-all="${g}"><span class="tv-check-box" aria-hidden="true">${icon('check', 14)}</span><span>Select all</span></button>` : ''}</div>
      ${n ? (p.view === 'thumbs' ? `<ul class="tvw-cards" role="list">${list.map(cardHTML).join('')}</ul>` : `<ul class="tvw-rows" role="list">${list.map(rowHTML).join('')}</ul>`) : `<p class="tvw-none">${empty}</p>`}${after}
    </section>`;
    };

    /** The quick tick buttons: defs = [[groupId | 'all', label], ...]. */
    p.quickHTML = (defs) => `<div class="tvw-quick" role="group" aria-label="Tick a group of skills">
        <span class="tvw-pick-h">Tick</span>
        ${defs.map(([g, label]) => `<button type="button" class="tv-btn tv-btn-sm" data-w-quick="${g}">${esc(label)}</button>`).join('')}
        <button type="button" class="tv-btn tv-btn-sm tv-btn-ghost" data-w-quick="none">Clear</button>
        <span class="tvw-viewtog">${viewToggleHTML(p.view)}</span>
      </div>`;

    p.barHTML = () => {
        const n = p.ticked.size;
        const count = n ? `${n} skill${n === 1 ? '' : 's'} ticked` : 'Tick the skills you want';
        const left = p.link
            ? `<div class="tvw-linkbox"><label class="tvw-link-l" for="${idp}Link">${esc(p.linkNote || 'Practice link for pupils')}</label>
            <div class="tvw-linkrow"><input id="${idp}Link" class="tv-input tvw-link" readonly value="${esc(p.link)}">
            <button type="button" class="tv-btn" data-w-act="copy">${icon('copy', 18)}<span>Copy</span></button></div></div>`
            : `<div class="tv-actionbar-text"><div class="tv-h3">${count}</div>
            <p class="tv-cap">${n > 1 ? 'They will be mixed together.' : n ? 'One skill.' : 'Then make a practice link or print.'}</p></div>`;
        return `${left}
      <div class="tv-row tvw-bar-btns">
        <button type="button" class="tv-btn tv-btn-primary" data-w-act="link"${n ? '' : ' aria-disabled="true"'}>${icon('link', 18)}<span>Practice link</span></button>
        <button type="button" class="tv-btn" data-w-act="print"${n ? '' : ' aria-disabled="true"'}>${icon('print', 18)}<span>Print</span></button></div>`;
    };
    p.barWrapHTML = () => `<div class="tv-actionbar tvw-bar" id="${idp}Bar">${p.barHTML()}</div>`;
    p.redrawBar = () => { const bar = root().querySelector(`#${idp}Bar`); if (bar) bar.innerHTML = p.barHTML(); };
    p.after = (container) => { if (container && p.view === 'thumbs') lazyThumbs(container, null); };

    function itemsFor(keys) {
        const all = p.all();
        return keys.map((pk) => {
            const [c, s] = pk.split('|');
            const hit = all.find((x) => x.key === `${c}:${s}`);
            const item = { categoryId: c, skillId: s, weight: 1 };
            if (hit && hit.opts && Object.keys(hit.opts).length) item.opts = hit.opts;
            return item;
        }).filter((x) => findSkill(x.categoryId, x.skillId));
    }
    async function doLink(keys) {
        const items = itemsFor(keys);
        if (!items.length) { toast('Tick at least one skill first'); return; }
        p.link = makePracticeLink(items);
        const what = `Practice link · ${items.length} skill${items.length === 1 ? '' : 's'}${items.length > 1 ? ' mixed' : ''}`;
        if (!p.link) { p.linkNote = what; p.redrawBar(); toast('Could not make a link'); return; }
        const ok = await copyText(p.link);
        // Say "copied" only when it was (critic r1 M3); otherwise the link is selected for the teacher to copy.
        p.linkNote = ok ? `${what} · copied` : `${what} · copy it from the box`;
        p.redrawBar();
        toast(ok ? `Practice link copied · ${items.length} skill${items.length === 1 ? '' : 's'}` : 'Link ready: copy it from the box');
        root().querySelector(`#${idp}Link`)?.select();
    }
    function doPrint(keys) {
        const items = itemsFor(keys);
        if (!items.length) { toast('Tick at least one skill first'); return; }
        printSkills(items);
        window.tvGo?.('print');
    }
    const tickGroup = (g, on) => {
        const list = g === 'all' ? p.all() : p.groups[g] || [];
        for (const x of list) { if (on) p.ticked.add(k2p(x.key)); else p.ticked.delete(k2p(x.key)); }
    };

    /** Handle a click on a picker control. Returns true when handled. */
    p.handle = (t) => {
        const d = t.dataset;
        if (d.wTick) {
            if (p.ticked.has(d.wTick)) p.ticked.delete(d.wTick); else p.ticked.add(d.wTick);
            p.link = '';
            opts.redraw();
            root().querySelector(`.tvw-tick[data-w-tick="${CSS.escape(d.wTick)}"]`)?.focus();
            return true;
        }
        if (d.wAll) {
            const list = p.groups[d.wAll] || [];
            tickGroup(d.wAll, !list.every((x) => p.ticked.has(k2p(x.key))));
            p.link = '';
            opts.redraw();
            root().querySelector(`[data-w-all="${d.wAll}"]`)?.focus();
            return true;
        }
        if (d.wQuick) {
            p.ticked.clear();
            if (d.wQuick !== 'none') tickGroup(d.wQuick, true);
            p.link = '';
            opts.redraw();
            root().querySelector(`[data-w-quick="${d.wQuick}"]`)?.focus();
            return true;
        }
        if (d.wOne === 'link') { doLink([d.wKey]); return true; }
        if (d.wOne === 'print') { doPrint([d.wKey]); return true; }
        if (d.wAct === 'link') { doLink([...p.ticked]); return true; }
        if (d.wAct === 'print') { doPrint([...p.ticked]); return true; }
        if (d.wAct === 'copy') { copyText(p.link).then((ok) => toast(ok ? 'Practice link copied' : 'Select the link and copy it')); return true; }
        if (d.act === 'skill-view' && d.view) {
            p.view = d.view === 'thumbs' ? 'thumbs' : 'list';
            setSkillView(p.view);
            opts.redraw();
            root().querySelector(`[data-act="skill-view"][data-view="${p.view}"]`)?.focus();
            return true;
        }
        if (d.todoOpen) { window.tvOpenTodo?.(d.todoOpen); return true; }
        return false;
    };
    return p;
}
