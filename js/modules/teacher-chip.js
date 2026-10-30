// teacher-chip.js — a tray chip's OPTIONS SHEET (Teacher site 2.0, T3a; IMPROVEMENT_PLAN §2.4 "Tap a chip",
// queued design item 3): the skill's own options (skill-options.js, drawn by skill-options-ui.js), LED by a live
// preview of the skill at those options that redraws as they change, and How often for that skill.
// Options live on the skill (CLAUDE.md): the values are the item's `opts` (the set's option store), so the share
// code and every print request carry them.
//
//   openChipSheet(cat, skill, ctx)   one skill (ctx from teacher-tray.js: item, weight(), held(), setWeight(w),
//                                    remove(), changed()); or a DRAFT (not in the tray yet): {draft: true,
//                                    item: {opts}, primary: 'Add to tray', onPrimary(opts)}, no How often
//   openBulkOptions(pairs, ctx)      the settings a selection of skills SHARES; a change is made in each of them
//
// Below 820 px the sheet is full screen above the bars; from 820 px a narrow sheet over a scrim.

import { icon, esc, findSkill } from './teacher-ui.js';
import { areaOf, AREAS, areaIcon } from './teacher-areas.js';
import { mountSample } from './teacher-preview.js';
import { offeredOptionsFor, normalizeOptions, packOptions, describeOptions } from './skill-options.js';
import {
    registerSkillOptionsHost, groupedOptionRowsHTML, optionControlHTML, optionHelpLine, optionTipHTML,
    nameFitOptions, escHTML, revealOverflowingChoices,
} from './skill-options-ui.js';

const INK = '#1A1614';

/* ================================================================= the real item, cropped (thumbnails and previews)
   The app's preview path draws the item (teacher-preview.js mountSample: the seeded item through generateQuestionFor,
   the black-and-white paper cell, no page header, so no strand tab). Here it is CROPPED to what it draws: scaled to fit,
   but never so far that its smallest text falls under the place's minimum (Big 12 px, Medium 11, Small 9; the options
   sheet's preview 12); what still does not fit is cut on the right / bottom (anchored at the drawing's left / top, so
   every line keeps its start) and the cut edge fades. The measure is cached per skill + options + example. */

const MIN_PX = { big: 10, medium: 9, small: 7, preview: 10 };   // owner 2026-10-25: thumbnails zoom out so the whole problem shows
const MEAS = new Map();
const MEAS_MAX = 1200;
const mkey = (c, s, opts, ex) => `${c}|${s}|${opts && Object.keys(opts).length ? JSON.stringify(opts) : ''}|${ex || 0}`;

function measureStage(stage) {
    const r0 = stage.getBoundingClientRect();
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    let minFs = Infinity;
    const grow = (r) => {
        if (r.width < 0.5 && r.height < 0.5) return;
        x0 = Math.min(x0, r.left); y0 = Math.min(y0, r.top); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom);
    };
    const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent.trim()) continue;
        range.selectNodeContents(n);
        const rects = range.getClientRects();
        if (!rects.length) continue;
        for (const r of rects) grow(r);
        const p = n.parentElement;
        if (p && !p.closest('svg')) { const fs = parseFloat(getComputedStyle(p).fontSize); if (fs && fs < minFs) minFs = fs; }
    }
    stage.querySelectorAll('svg, img, canvas').forEach((e) => grow(e.getBoundingClientRect()));
    stage.querySelectorAll('*').forEach((e) => {
        if (e.closest('svg')) return;
        const cs = getComputedStyle(e);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        if ((parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0) + (parseFloat(cs.borderLeftWidth) || 0) > 0) grow(e.getBoundingClientRect());
    });
    if (!isFinite(x0)) return null;
    return { bx: x0 - r0.left, by: y0 - r0.top, bw: Math.max(1, x1 - x0), bh: Math.max(1, y1 - y0), minFs: isFinite(minFs) ? minFs : 0 };
}

/** A story told twice (the question line and the story picture under it): the line goes, the picture keeps it. */
function dropTwiceTold(stage) {
    const line = stage.querySelector('.tvp-q');
    const vis = stage.querySelector('.tvp-visual');
    if (!line || !vis) return;
    const norm = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
    const a = norm(line.textContent), b = norm(vis.textContent);
    if (a.length > 12 && b.includes(a.slice(0, Math.min(a.length, 60)))) line.style.display = 'none';
}

function cropFrame(frame, remeasure) {
    const stage = frame.querySelector(':scope > .tvp-stage');
    if (!stage || !frame.isConnected) return;
    const key = frame.dataset.tcKey;
    frame.classList.remove('is-cropped');
    dropTwiceTold(stage);
    stage.style.left = '0px';
    stage.style.top = '0px';
    stage.style.transformOrigin = '0 0';
    let m = MEAS.get(key);
    if (!m || remeasure) {
        stage.style.transform = 'none';
        m = measureStage(stage);
        if (!m) return;
        if (MEAS.size >= MEAS_MAX) MEAS.delete(MEAS.keys().next().value);
        MEAS.set(key, m);
    }
    const W = frame.clientWidth, H = frame.clientHeight, pad = 6;
    if (W < 8 || H < 8) return;
    const min = MIN_PX[frame.dataset.tcSize] || 11;
    let s = Math.min((W - 2 * pad) / m.bw, (H - 2 * pad) / m.bh, 1);
    // a preview that pops up shows the WHOLE problem, never a crop (owner 2026-10-30); thumbnails keep their legibility floor
    if (frame.dataset.tcSize !== 'preview' && m.minFs && s * m.minFs < min) s = min / m.minFs;
    const cutR = m.bw * s > W - 2 * pad + 1;
    const cutB = m.bh * s > H - 2 * pad + 1;
    const ox = cutR ? pad : (W - m.bw * s) / 2;
    const oy = cutB ? pad : (H - m.bh * s) / 2;
    stage.style.transform = `translate(${(ox - m.bx * s).toFixed(1)}px, ${(oy - m.by * s).toFixed(1)}px) scale(${s.toFixed(4)})`;
    frame.classList.toggle('ts-cut-r', cutR);
    frame.classList.toggle('ts-cut-b', cutB);
    frame.dataset.scale = s.toFixed(3);
}

/** Draw a skill's real item into `frame` (a .tvp-frame), cropped for `size` ('big' | 'medium' | 'small' | 'preview'). */
export function mountCropped(frame, c, s, opts, example = 0, size = 'medium') {
    if (!frame) return false;
    frame.dataset.tcKey = mkey(c, s, opts, example);
    frame.dataset.tcSize = size;
    let ok = false;
    try { ok = mountSample(frame, c, s, opts, example); } catch (e) { return false; }
    if (!ok) return false;
    const fresh = !MEAS.has(frame.dataset.tcKey);
    cropFrame(frame, false);
    // the preview path settles its styles for ~0.9 s and re-fits then: crop again after it (measuring again the first time)
    setTimeout(() => cropFrame(frame, fresh), 950);
    return true;
}
/** Fit a drawn frame again (its box changed size). */
export function refitCropped(frame, size) { if (size) frame.dataset.tcSize = size; cropFrame(frame, false); }
/** True when this item was measured before (it can be drawn at once, without a flash). */
export function croppedReady(c, s, opts, example = 0) { return MEAS.has(mkey(c, s, opts, example)); }   // the option controls take an accent hex; on the teacher site the accent is ink
const gradeName = (g) => (g === 'K' ? 'Kindergarten' : g === 'M' ? 'Mixed levels' : `Grade ${g}`);
const gbadge = (g) => `<span class="gbadge gbadge-long" data-grade="${esc(g)}">${esc(gradeName(g))}</span>`;

let S = null;   // { mode: 'one'|'bulk', pairs: [[cat, skill]], ctx, example, opener }
let el = null;

function defsOf(cat, sk) {
    try { return nameFitOptions(cat, sk, offeredOptionsFor(cat, sk)); } catch (e) { return []; }
}
function readOpts(cat, sk) {
    if (S && S.mode === 'one' && S.ctx.item) return S.ctx.item.opts || {};
    const it = (window.UnifiedSkills && window.UnifiedSkills.skills || []).find((x) => x.categoryId === cat && x.skillId === sk);
    return (it && it.opts) || {};
}
function writeOpts(cat, sk, packed) {
    const it = S && S.mode === 'one' && S.ctx.item ? S.ctx.item
        : (window.UnifiedSkills && window.UnifiedSkills.skills || []).find((x) => x.categoryId === cat && x.skillId === sk);
    if (it) it.opts = packed && Object.keys(packed).length ? packed : {};
}

// The common settings of a selection (bulk): same id, type and choices in every selected skill.
function commonDefs(pairs) {
    const sets = pairs.map(([c, s]) => defsOf(c, s));
    if (!sets.length) return [];
    const sig = (d) => JSON.stringify([d.id, d.type, (d.values || []).map((v) => v.v)]);
    return sets[0].filter((d) => sets.every((st) => st.some((x) => sig(x) === sig(d))));
}

registerSkillOptionsHost('tvchip', {
    entry: () => (S && S.pairs[0] ? { categoryId: S.pairs[0][0], skillId: S.pairs[0][1] } : null),
    read: () => (S && S.pairs[0] ? readOpts(S.pairs[0][0], S.pairs[0][1]) : {}),
    write: (i, packed) => {
        if (!S) return;
        if (S.mode === 'one') { writeOpts(S.pairs[0][0], S.pairs[0][1], packed); }
        else {
            // apply only what changed to every selected skill
            const [c0, s0] = S.pairs[0];
            const before = normalizeOptions(c0, s0, readOpts(c0, s0));
            const after = normalizeOptions(c0, s0, packed);
            const ids = commonDefs(S.pairs).map((d) => d.id).filter((id) => JSON.stringify(before[id]) !== JSON.stringify(after[id]));
            for (const [c, s] of S.pairs) {
                const cur = normalizeOptions(c, s, readOpts(c, s));
                ids.forEach((id) => { cur[id] = after[id]; });
                writeOpts(c, s, packOptions(c, s, cur));
            }
        }
        S.example = 0;
        try { S.ctx.changed && S.ctx.changed(); } catch (e) { /* */ }
    },
    rerender: () => render(),
});

function rowsHTML(defs, cur) {
    const handlers = {
        set: (optId, expr) => `skoEdit('tvchip',0,'set','${optId}',${expr})`,
        toggle: (optId, i) => `skoEdit('tvchip',0,'toggle','${optId}',${i})`,
        all: (optId, all) => `skoEdit('tvchip',0,'all','${optId}',${all})`,
    };
    return groupedOptionRowsHTML(defs, cur, (def) => {
        const line = optionHelpLine(def);
        const tp = optionTipHTML(def);
        return `<div class="tc-row sko-has-tip" role="group" aria-label="${escHTML(def.label || def.id)}"${tp.id ? ` aria-describedby="${tp.id}"` : ''}>${tp.button}${optionControlHTML(def, cur, INK, handlers)}${tp.line}${line ? `<p class="tc-help">${escHTML(line)}</p>` : ''}</div>`;
    }, '');
}

function howOftenHTML() {
    if (S.mode !== 'one' || S.ctx.draft) return '';
    const held = S.ctx.held ? S.ctx.held() : null;
    const sh = S.ctx.share ? S.ctx.share() : null;
    const shareLine = sh ? (sh.error ? `<p class="tt-warn" role="alert">⚠ ${esc(sh.error)}</p>`
        : `<p class="tc-note">${sh.n === null ? `About ${sh.pct} % of the problems` : `≈ ${sh.n} of ${sh.total} problems`} on a worksheet of the whole tray.</p>`) : '';
    if (held !== null && held !== undefined) {
        const ask = S.ask
            ? `<div class="tt-release" role="group" aria-label="Release the held ${esc(held)}"><span>Release the ${esc(held)}?</span><button type="button" class="tt-btn" data-tc="release">Release</button><button type="button" class="tt-btn" data-tc="keep">Keep ${esc(held)}</button></div>`
            : `<button type="button" class="tt-btn tt-held" data-tc="ask" aria-label="Held at ${esc(held)}. Press to change">${esc(held)}${icon('lock', 16)}</button><span class="tc-note">${/%/.test(held) ? 'A held share of the page.' : 'An exact number of problems.'} Press to use Less · Equal · More again.</span>`;
        return `<div class="tc-often"><span class="tc-k">How often</span>${ask}</div>${shareLine}`;
    }
    const w = S.ctx.weight ? S.ctx.weight() : 2;
    const b = (v, l) => `<button type="button" data-tc="weight" data-arg="${v}" aria-pressed="${w === v}">${l}</button>`;
    const exact = S.ctx.setCount ? `<span class="tc-or">or</span><label class="tt-pct-in tt-cnt-in"><span class="tv-sr">Exact number of problems</span><input type="number" min="0" max="999" step="1" class="tc-count" value="" placeholder="${sh && sh.n !== null ? sh.n : ''}"><span class="tt-cnt-l" aria-hidden="true">problems</span></label>`
        + `<span class="tc-or">or</span><label class="tt-pct-in"><span class="tv-sr">Share of the page</span><input type="number" min="0" max="100" step="1" class="tc-pct" value="" placeholder="${sh ? sh.pct : ''}"><span aria-hidden="true">%</span></label>` : '';
    return `<div class="tc-often"><span class="tc-k" id="tcOftenL">How often</span><div class="tt-seg-ctl" role="group" aria-labelledby="tcOftenL">${b(1, 'Less')}${b(2, 'Equal')}${b(3, 'More')}</div>${exact}${[0, 1, 2, 3].includes(w) ? (w === 0 ? '<span class="tc-note">Left out for now</span>' : '') : `<span class="tc-note">Weight ${w}</span>`}</div>${shareLine}`;
}

function html() {
    const [c, s] = S.pairs[0];
    const one = S.mode === 'one';
    const hit = findSkill(c, s);
    const a = (() => { try { return areaOf(c, s); } catch (e) { return 'NOSTD'; } })();
    const defs = one ? defsOf(c, s) : commonDefs(S.pairs);
    const cur = normalizeOptions(c, s, readOpts(c, s));
    const packed = readOpts(c, s);
    const chosen = one && Object.keys(packed || {}).length ? describeOptions(c, s, packed) : '';
    const title = one ? (hit ? hit.label : s) : `${S.pairs.length} skills`;
    const head = one
        ? `<p class="tt-eyebrow tc-eyebrow" data-domain="${a}">Options · <span class="tc-area">${areaIcon(a, 16)}${esc(AREAS[a].short)}</span></p>`
        : '<p class="tt-eyebrow">Options · shared settings</p>';
    const preview = one
        ? `<div class="tc-preview"><div class="tc-preview-head"><span class="tc-k" id="tcPrevL">${chosen ? 'At these settings' : 'At the standard settings'}</span><button type="button" class="tt-btn tt-text" data-tc="example">${icon('reset', 16)}<span>New example</span></button></div><div class="tvp-frame tc-frame" id="tcFrame" aria-labelledby="tcPrevL"></div>${chosen ? `<p class="tc-note">${esc(chosen)}</p>` : ''}</div>`
        : `<p class="tc-note">These are the settings the ${S.pairs.length} selected skills share; a change here is made in each of them.</p>`;
    const body = defs.length ? rowsHTML(defs, cur) : `<p class="tc-note">${one ? 'This skill has no options to set.' : 'These skills share no settings. Open one skill to change its own.'}</p>`;
    return `<div class="tt-scrim" data-tc="close"></div>
    <div class="tt-sheet tc-sheet" role="dialog" aria-modal="true" aria-labelledby="tcTitle">
      <div class="tt-sheet-head">${one ? gbadge(hit ? hit.level : 'M') : ''}<div class="tt-head-text">${head}<h2 id="tcTitle">${esc(title)}</h2></div><button type="button" class="tt-btn tt-icon tt-close" data-tc="close" aria-label="Close the options">${icon('x', 20)}</button></div>
      <div class="tc-body">${preview}${howOftenHTML()}<div class="tc-opts">${body}</div></div>
      <div class="tt-sheet-foot tc-foot">${one && S.ctx.remove ? `<button type="button" class="tt-btn tt-text" data-tc="remove">${icon('trash', 18)}<span>Take out of the tray</span></button>` : ''}${defs.length ? '<button type="button" class="tt-btn" data-tc="reset">Reset to default</button>' : ''}${one && S.ctx.onPrimary ? `<button type="button" class="tt-btn tt-primary" data-tc="primary">${esc(S.ctx.primary || 'Add to tray')}</button>` : '<button type="button" class="tt-btn tt-primary" data-tc="close">Done</button>'}</div>
    </div>`;
}

function render() {
    if (!S) return;
    if (!el || !el.isConnected) {
        el = document.createElement('div');
        el.id = 'tvChipSheet';
        el.className = 'tt-layer tc-layer';
        (document.getElementById('teacherApp') || document.body).appendChild(el);
        el.addEventListener('click', onClick);
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { e.stopPropagation(); closeChipSheet(); return; }
            if (e.key === 'Enter' && e.target.matches('input.tc-count, input.tc-pct')) { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles: true })); }
        });
        el.addEventListener('change', (e) => {
            if (!S) return;
            const t = e.target;
            if (t.matches('input.tc-count') && S.ctx.setCount && t.value !== '') { S.ctx.setCount(t.value); render(); }
            else if (t.matches('input.tc-pct') && S.ctx.setPct && t.value !== '') { S.ctx.setPct(t.value); render(); }
        });
    }
    const body = el.querySelector('.tc-body');
    const scroll = body ? body.scrollTop : 0;
    const FOC = 'input, select, button';
    const at = el.contains(document.activeElement) ? [...el.querySelectorAll(FOC)].indexOf(document.activeElement) : -1;
    el.innerHTML = html();
    el.hidden = false;
    // the shared controls draw the pupil app's inline look: the teacher's select and spacing instead
    el.querySelectorAll('.tc-opts select').forEach((s) => { s.removeAttribute('style'); s.classList.add('tv-select'); });
    const b2 = el.querySelector('.tc-body');
    if (b2) b2.scrollTop = scroll;
    if (at >= 0) { const again = el.querySelectorAll(FOC)[at]; if (again) { try { again.focus({ preventScroll: true }); } catch (e) { /* */ } } }
    if (S.mode === 'one') {
        const [c, s] = S.pairs[0];
        const frame = el.querySelector('#tcFrame');
        mountCropped(frame, c, s, readOpts(c, s), S.example, 'preview');
    }
    revealOverflowingChoices(el);
}

function onClick(e) {
    const b = e.target.closest('[data-tc]');
    if (!b || !S) return;
    switch (b.dataset.tc) {
        case 'close': closeChipSheet(); return;
        case 'primary': { const f = S.ctx.onPrimary; const o = (S.ctx.item && S.ctx.item.opts) || {}; closeChipSheet(); if (f) f(o); return; }
        case 'example': S.example += 1; render(); return;
        case 'weight': if (S.ctx.setWeight) S.ctx.setWeight(Number(b.dataset.arg)); render(); return;
        case 'ask': S.ask = true; render(); el.querySelector('[data-tc="keep"]')?.focus({ preventScroll: true }); return;
        case 'keep': S.ask = false; render(); el.querySelector('[data-tc="ask"]')?.focus({ preventScroll: true }); return;
        case 'release': S.ask = false; if (S.ctx.release) S.ctx.release(); render(); el.querySelector('[data-tc="weight"]')?.focus({ preventScroll: true }); return;
        case 'reset': window.skoReset ? window.skoReset('tvchip', 0) : null; return;
        case 'remove': { const r = S.ctx.remove; closeChipSheet(); if (r) r(); return; }
        default: break;
    }
}

/** Open one skill's options sheet, led by its live preview. */
export function openChipSheet(cat, sk, ctx = {}) {
    if (!findSkill(cat, sk)) return;
    S = { mode: 'one', pairs: [[cat, sk]], ctx, example: 0, opener: ctx.anchor || document.activeElement };
    document.body.classList.add('tt-locked');
    render();
    el.querySelector('.tc-opts input, .tc-opts select, .tc-opts button, .tt-close')?.focus({ preventScroll: true });
}

/** The settings a selection shares (the tray popup's bulk bar › Options…). */
export function openBulkOptions(pairs, ctx = {}) {
    const ok = (pairs || []).filter(([c, s]) => findSkill(c, s));
    if (!ok.length) return;
    S = { mode: 'bulk', pairs: ok, ctx, example: 0, opener: document.activeElement };
    document.body.classList.add('tt-locked');
    render();
    el.querySelector('.tt-close')?.focus({ preventScroll: true });
}

export function closeChipSheet() {
    if (!S) return;
    const back = S.opener;
    S = null;
    if (el) { el.hidden = true; el.innerHTML = ''; }
    if (!document.getElementById('tvTrayPop') || document.getElementById('tvTrayPop').hidden) document.body.classList.remove('tt-locked');
    if (back && back.isConnected) { try { back.focus({ preventScroll: true }); } catch (e) { /* */ } }
}
export function chipSheetOpen() { return !!S; }
