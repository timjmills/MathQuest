// js/modules/lesson-player/player.js
// THE LESSON PLAYER SCREEN, slice 1 (design/cards/lesson-player/lesson-player.md D8 with D11 built in; lane lf-hosts):
// I do on the board for a library lesson, opened by URL (?lesson=<id or slug>&part=<part>&s=<seed>&mode=board).
//
//   - The plan comes from plan.js (pure); the I do example is the ANCHOR CHART's own example, taken from the chart's own
//     build (print-sheet.js buildSheet, chartRequest) - the screen and the printed packet show the same problem (D2).
//   - Each state is the chart's own state drawing (sheet/lesson-pages/chart.js stateDrawing: the newest marks grey, the
//     earlier ones black, P-LC-9) inside the black-and-white Andika screen cell (.mq-scell, SP-1/SP-2); every coloured
//     thing is chrome outside it (SP-30; INK-30 for the step numerals only).
//   - Steps reveal one at a time (Next / Back, Right / Space / PageDown, Left / PageUp - what clickers send); the Say band
//     appears, filled, only after the last step (P-17, BD-8) and is absent before it (no grey stub).
//   - Read aloud is on demand on the board (D6): the button or R reads the current step's words (and the Say line on the
//     last step); speech stops on every navigation.
//   - The part bar (D11) jumps to any part; a part this slice does not play opens a navigable "coming soon" stage.
//     Each part's place is kept for the session; the URL follows the part (?part=), so a link opens that part.
//
// Later slices add their parts' renderers to RENDER (warmup, wedo, youdo, exit) and their plans to plan.js.

import { planLesson, parseLaunch, launchSearch, chartRequest, PLAYER_PARTS, PART_IDS, partOf, lessonSeedOf } from './plan.js';
import { stopSpeaking } from '../hints-speech.js';
import { stateDrawing, chartLayout } from '../sheet/lesson-pages/chart.js';
import { panelHops } from '../sheet/lesson-arch/fact.js';
import { lessonData } from '../lessons/library.js';
import { stepMarker, stateGroups } from '../sheet/lesson-pages/common.js';
import { resolveCtx } from '../sheet/index.js';
import { LESSON_CSS } from '../sheet/lesson-css.js';
import { workedStepsOf } from '../sheet/anchors.js';

const ROOT_ID = 'mqLessonPlayer';
// (drawn triangles, not the arrow characters, which a tablet may draw as emoji)
const TRI_LEFT = '<svg class="mq-lp-tri" viewBox="0 0 10 12" width="0.8em" height="0.9em" aria-hidden="true"><path d="M10 0 L0 6 L10 12 Z" fill="currentColor"/></svg>';
const TRI_RIGHT = '<svg class="mq-lp-tri" viewBox="0 0 10 12" width="0.8em" height="0.9em" aria-hidden="true"><path d="M0 0 L10 6 L0 12 Z" fill="currentColor"/></svg>';
const esc = (s) => String(s === undefined || s === null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The player's session state (one player at a time). Exposed read-only through lessonPlayerState() for the gates. */
let S = null;

function rootEl() { return document.getElementById(ROOT_ID); }

/* ============================================================== open / close */

/**
 * Open the player. `launch`: a query string ('?lesson=...') or {lesson, part, seed, mode}. Resolves once the first part
 * is drawn (the lesson build takes a few seconds; a "Getting the lesson ready" stage shows meanwhile).
 */
export async function openLessonPlayer(launch = (typeof location !== 'undefined' ? location.search : '')) {
    const l = typeof launch === 'string' ? parseLaunch(launch) : Object.assign({ part: 'ido', mode: 'board' }, launch || {});
    if (!l || !l.lesson) {
        mountShell({ title: 'Lesson', mode: 'board' });
        stageMessage('No such lesson', `There is no lesson called “${esc((l && l.raw) || '')}”. Check the link.`);
        return lessonPlayerState();
    }
    if (l.seed === undefined || l.seed === null) l.seed = lessonSeedOf(l.lesson);
    S = { launch: l, plan: null, part: PART_IDS.includes(l.part) ? l.part : 'ido', pos: {}, visited: new Set(), ready: false, spoke: '', item: null };
    mountShell({ title: 'Lesson', mode: l.mode });
    stageMessage('Getting the lesson ready…', 'The worked example is being made from the lesson.');
    try {
        const ps = await import('../print-sheet.js');
        const res = await ps.buildSheet(chartRequest(l.lesson, l.seed));
        const exQ = res && res.lesson && res.lesson.chart && (res.lesson.chart.exampleQs || [])[0];
        S.plan = planLesson(l.lesson, { seed: l.seed, mode: l.mode, example: exQ || null, title: (res && res.title) || '' });
        S.chartExample = (res && res.lesson && res.lesson.example) || '';
        S.item = exQ ? ps.lessonPlayerItem(exQ) : null;
        S.ready = true;
    } catch (e) {
        console.warn('[lesson-player] the lesson did not build', e);
        stageMessage('The lesson did not load', 'Reload the page to try again.');
        return lessonPlayerState();
    }
    setTitle(S.plan.title || 'Lesson');
    goPart(S.part);
    return lessonPlayerState();
}

export function closeLessonPlayer() {
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    const r = rootEl();
    if (r) r.remove();
    document.removeEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
    document.body.classList.remove('mq-lp-open');
    S = null;
    try {
        const p = new URLSearchParams(location.search);
        ['lesson', 'part', 's', 'mode'].forEach((k) => p.delete(k));
        const q = p.toString();
        history.replaceState({}, document.title, location.pathname + (q ? `?${q}` : '') + location.hash);
    } catch (e) { /* no history */ }
}

/** What the gates read: the part, the step, the plan's I do, the last spoken text. */
export function lessonPlayerState() {
    if (!S) return { open: !!rootEl(), ready: false };
    const ido = S.plan ? S.plan.parts.find((p) => p.part === 'ido') : null;
    return {
        open: !!rootEl(), ready: S.ready, lesson: S.launch.lesson, seed: S.launch.seed, mode: S.launch.mode, part: S.part,
        step: S.pos.ido || 0, steps: ido ? ido.steps.length : 0, say: ido ? ido.say : '', example: ido && ido.example ? ido.example.text : '',
        chartExample: S.chartExample || '', spoke: S.spoke, visited: [...S.visited], title: S.plan ? S.plan.title : '',
        parts: S.plan ? S.plan.parts.map((p) => ({ part: p.part, built: !!p.built })) : [],
    };
}

/* ============================================================== the shell */

function mountShell({ title, mode }) {
    let r = rootEl();
    if (r) r.remove();
    r = document.createElement('div');
    r.id = ROOT_ID;
    r.className = 'mq-lp';
    r.setAttribute('role', 'dialog');
    r.setAttribute('aria-modal', 'true');
    r.setAttribute('aria-label', 'Lesson player');
    r.dataset.mode = mode || 'board';
    r.innerHTML = `
<header class="mq-lp-top">
  <h1 class="mq-lp-title">${esc(title)}</h1>
  <span class="mq-lp-mode">${mode === 'pupil' ? 'Pupil' : 'Board'}</span>
  <nav class="mq-lp-rail" aria-label="Lesson parts">${PLAYER_PARTS.map((p) => `<button type="button" class="mq-lp-pill" data-part="${p.id}"${p.built ? '' : ' data-soon'}>${esc(p.name)}</button>`).join('')}</nav>
</header>
<main class="mq-lp-stage" aria-live="polite"></main>
<footer class="mq-lp-bar">
  <button type="button" class="mq-lp-btn" data-act="back" aria-label="Back one step">${TRI_LEFT} Back</button>
  <button type="button" class="mq-lp-btn" data-act="read" aria-label="Read this step aloud">Read aloud</button>
  <span class="mq-lp-count" aria-live="polite"></span>
  <div class="mq-lp-keys" aria-hidden="true">→ / Space / clicker: next · ← back<br>R read again · Esc leave</div>
  <button type="button" class="mq-lp-btn mq-lp-next" data-act="next"></button>
</footer>`;
    document.body.appendChild(r);
    document.body.classList.add('mq-lp-open');
    // the chart's own drawing rules (sheet/lesson-css.js, scoped to the kit's .ws-sheet), once per page
    if (!document.getElementById('mqLessonPlayerKitCss')) {
        const css = document.createElement('style');
        css.id = 'mqLessonPlayerKitCss';
        css.textContent = LESSON_CSS;
        document.head.appendChild(css);
    }
    r.querySelector('.mq-lp-rail').addEventListener('click', (e) => {
        const b = e.target.closest('[data-part]');
        if (b) goPart(b.dataset.part);
    });
    r.querySelector('.mq-lp-bar').addEventListener('click', (e) => {
        const b = e.target.closest('[data-act]');
        if (!b) return;
        if (b.dataset.act === 'next') next();
        else if (b.dataset.act === 'back') back();
        else if (b.dataset.act === 'read') readAloud();
    });
    document.removeEventListener('keydown', onKey, true);
    document.addEventListener('keydown', onKey, true);
    window.removeEventListener('resize', onResize);
    window.addEventListener('resize', onResize);
    return r;
}

function setTitle(t) {
    const h = rootEl() && rootEl().querySelector('.mq-lp-title');
    if (h) h.textContent = t;
}

function stageMessage(head, body) {
    const st = rootEl() && rootEl().querySelector('.mq-lp-stage');
    if (!st) return;
    st.className = 'mq-lp-stage mq-lp-stage-msg';
    st.innerHTML = `<div class="mq-lp-msg"><h2>${esc(head)}</h2><p>${esc(body)}</p></div>`;
    const bar = rootEl().querySelector('.mq-lp-bar');
    if (bar) bar.dataset.idle = '1';
}

/* ============================================================== navigation */

function partIndex(id) { return PART_IDS.indexOf(id); }

function goPart(id, { at = null } = {}) {
    if (!S || !S.ready || !PART_IDS.includes(id)) return;
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    if (S.part && S.part !== id) S.visited.add(S.part);
    S.part = id;
    if (at === 'end' && id === 'ido') S.pos.ido = Math.max(0, idoPart().steps.length - 1);
    else if (at === 'start' && id === 'ido') S.pos.ido = 0;
    if (S.pos[id] === undefined) S.pos[id] = 0;
    // (the URL follows the part, D11: a copied link opens this part; replaceState, so Back in the browser leaves the player)
    try { history.replaceState({}, document.title, location.pathname + launchSearch(Object.assign({}, S.launch, { part: id })) + location.hash); } catch (e) { /* no history */ }
    S.launch.part = id;
    render();
}

function next() {
    if (!S || !S.ready) return;
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    if (S.part === 'ido') {
        const n = idoPart().steps.length;
        if ((S.pos.ido || 0) < n - 1) { S.pos.ido = (S.pos.ido || 0) + 1; render(); return; }
    }
    const i = partIndex(S.part);
    if (i < PART_IDS.length - 1) goPart(PART_IDS[i + 1], { at: 'start' });
}

function back() {
    if (!S || !S.ready) return;
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    if (S.part === 'ido' && (S.pos.ido || 0) > 0) { S.pos.ido -= 1; render(); return; }
    const i = partIndex(S.part);
    if (i > 0) goPart(PART_IDS[i - 1], { at: 'end' });
}

function onKey(e) {
    if (!rootEl()) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) && !['Enter', 'Tab'].includes(e.key)) return;
    const k = e.key;
    let done = true;
    if (k === 'ArrowRight' || k === ' ' || k === 'Spacebar' || k === 'PageDown') next();
    else if (k === 'ArrowLeft' || k === 'PageUp') back();
    else if (k === 'r' || k === 'R') readAloud();
    else if (k === 'Escape') closeLessonPlayer();
    else done = false;
    if (done) { e.preventDefault(); e.stopPropagation(); }
}

let resizeT = 0;
function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (S && S.ready && S.part === 'ido') { S.zoom = 0; fitDrawing(); } }, 60);
}

/* ============================================================== read aloud (D6: on demand on the board) */

function currentSpeech() {
    if (!S || !S.ready) return '';
    if (S.part !== 'ido') return `${(partOf(S.part) || {}).name || ''}. Coming soon.`;
    const p = idoPart();
    const k = S.pos.ido || 0;
    const st = p.steps[k];
    if (!st) return '';
    const last = k === p.steps.length - 1;
    return [st.words, last && p.say ? `Say: ${p.say}` : ''].filter(Boolean).join(' ');
}

function readAloud() {
    const text = currentSpeech();
    if (!text) return;
    S.spoke = text;
    const r = rootEl();
    if (r) r.dataset.spoke = text;
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    // On the board the teacher's press IS the request (D6: on demand): spoken through the app's one voice path.
    try { if (typeof window.speak === 'function') window.speak(text); } catch (e) { /* no voice */ }
}

/* ============================================================== rendering */

function idoPart() { return S.plan.parts.find((p) => p.part === 'ido'); }

function render() {
    const r = rootEl();
    if (!r || !S || !S.ready) return;
    r.dataset.part = S.part;
    // the part bar: the current part, the parts already visited this session, the parts this slice does not play yet
    r.querySelectorAll('.mq-lp-pill').forEach((b) => {
        const id = b.dataset.part;
        const def = partOf(id);
        const on = id === S.part;
        if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        b.classList.toggle('is-on', on);
        b.classList.toggle('is-done', !on && S.visited.has(id) && def.built);
        b.textContent = def.name + (!on && S.visited.has(id) && def.built ? ' ✓' : '');
        b.setAttribute('aria-label', `${def.name}${def.built ? '' : ' (coming soon)'}${on ? ', showing' : ''}`);
    });
    const bar = r.querySelector('.mq-lp-bar');
    delete bar.dataset.idle;
    if (S.part === 'ido') renderIdo(r);
    else renderSoon(r, S.part);
}

function nextLabel() {
    const i = partIndex(S.part);
    const p = idoPart();
    if (S.part === 'ido' && (S.pos.ido || 0) < p.steps.length - 1) return 'Next step';
    return i < PART_IDS.length - 1 ? `Next: ${partOf(PART_IDS[i + 1]).name}` : 'End of lesson';
}

function setBar(count) {
    const r = rootEl();
    const i = partIndex(S.part);
    const atStart = i === 0 && !(S.part === 'ido' && (S.pos.ido || 0) > 0);
    const atEnd = i === PART_IDS.length - 1;
    r.querySelector('.mq-lp-count').innerHTML = count;
    const nb = r.querySelector('.mq-lp-next');
    const lbl = nextLabel();
    nb.innerHTML = `${esc(lbl)} ${TRI_RIGHT}`;
    nb.setAttribute('aria-label', lbl);
    nb.disabled = atEnd;
    r.querySelector('[data-act="back"]').disabled = atStart;
}

function drawCtx() {
    return Object.assign(resolveCtx({ mode: 'print', size: 'L', look: 'ican', state: 'blank' }), { cellLiveMm: 170 });
}

/**
 * State k as the anchor chart draws its panel (sheet/lesson-pages/chart.js stateItems): the chart's own state drawing of
 * the chart's own example item, and - in a 'row' chart (2-3 states) - the count-on hops beside the words, not inside the
 * drawing (the chart's panelHops), so the screen shows the printed panel.
 */
function statePieces(group) {
    const it = S.item;
    if (!it) return { draw: '', hops: '', variant: 'col' };
    const steps = workedStepsOf(it);
    if (!steps.length) {
        let html = '';
        try { html = it.render(drawCtx(), { cols: 2, shown: it.q && it.q.ans !== undefined ? String(it.q.ans) : undefined, ink: 'trace' }); } catch (e) { html = ''; }
        return { draw: html, hops: '', variant: 'col' };
    }
    const groups = stateGroups(steps);
    const { variant } = chartLayout(groups.length, lessonData(S.plan.id));
    const ctx = Object.assign(drawCtx(), variant === 'row' ? {} : { hops: true });
    let draw = '';
    try { draw = stateDrawing(it, steps, groups, group, ctx); } catch (e) { console.warn('[lesson-player] state', e); }
    let hops = '';
    if (variant === 'row') { try { hops = panelHops(it, steps, groups, group); } catch (e) { hops = ''; } }
    return { draw, hops, variant };
}

const kit = (html) => `<div class="mq-lp-zoom"><div class="ws-sheet ws-L ws-ican mq-lp-kit"><div class="mq-cdraw">${html}</div></div></div>`;

function renderIdo(r) {
    const st = r.querySelector('.mq-lp-stage');
    const p = idoPart();
    const n = p.steps.length;
    const k = Math.min(S.pos.ido || 0, Math.max(0, n - 1));
    const cur = p.steps[k];
    const last = k === n - 1;
    st.className = 'mq-lp-stage mq-lp-stage-ido';
    const instr = (S.item && S.item.cellPrompt) || '';
    const pc = statePieces(cur ? cur.group : 0);
    const stepsHtml = p.steps.map((s, i) => {
        const cls = i === k ? 'is-now' : i > k ? 'is-later' : 'is-done';
        return `<li class="mq-lp-step ${cls}"${i === k ? ' aria-current="step"' : ''}><span class="mq-lp-n">${stepMarker(i + 1)}</span><span class="mq-lp-t">${esc(s.name)}</span></li>`;
    }).join('');
    const chant = p.chant ? `<p class="mq-lp-chant"><b>Rule:</b> ${esc(p.chant)}</p>` : '';
    st.innerHTML = `
<aside class="mq-lp-steps" aria-label="Steps"><h2>Steps</h2><ol>${stepsHtml}</ol>${chant}</aside>
<section class="mq-lp-cellwrap">
  <div class="mq-scell mq-lp-cell" role="group" aria-label="Worked example, step ${k + 1} of ${n}" data-step="${k + 1}" data-steps="${n}">
    ${instr ? `<div class="mq-lp-instr">${esc(instr)}</div>` : ''}
    <div class="mq-lp-work" data-variant="${pc.variant}">
      <div class="mq-lp-draw">${kit(pc.draw)}</div>
      <div class="mq-lp-side">${cur ? `<p class="mq-lp-words">${esc(cur.words)}</p>` : ''}${pc.hops ? `<div class="mq-lp-hops">${kit(pc.hops)}</div>` : ''}</div>
    </div>
    ${last && p.say ? `<div class="mq-lp-say"><b>Say:</b> <span>${esc(p.say)}</span></div>` : ''}
  </div>
</section>`;
    setBar(n ? `Step ${k + 1} of ${n}${last && p.say ? ' <span class="mq-lp-together">· Say it together</span>' : ''}` : 'Worked example');
    fitDrawing();
}

function renderSoon(r, id) {
    const st = r.querySelector('.mq-lp-stage');
    const def = partOf(id);
    st.className = 'mq-lp-stage mq-lp-stage-soon';
    st.innerHTML = `<div class="mq-lp-msg mq-lp-soon" data-soon="${esc(id)}"><h2>${esc(def.name)}: coming soon</h2>`
        + `<p>This part of the lesson is being built.</p><p>Use the part bar, or Back and Next, to move to another part.</p></div>`;
    setBar(esc(def.name));
}

/**
 * Size the drawing: ONE zoom for every state of the I do (the digits never jump between steps), the digits at the host's
 * target (--lp-digit: the board's 104 px at 1280, x1.5 at 1920 - card drawing.sizes) unless the largest state, with the
 * Say band under it, would pass the stage; the whole drawing (hops too) scales as one, so its geometry is the printed
 * chart's. The zoom is measured on every state (a hidden sizer) and kept per viewport size.
 */
function fitDrawing() {
    const r = rootEl();
    const work = r && r.querySelector('.mq-lp-work');
    if (!work || !S) return;
    const zooms = [...r.querySelectorAll('.mq-lp-zoom')];
    // (the board's 104 px at --lp-k 1: the custom property's calc() is not resolved by getPropertyValue, so the scale is read)
    const target = 104 * (parseFloat(getComputedStyle(r).getPropertyValue('--lp-k')) || 1);
    const basePx = (resolveCtx({ mode: 'print', size: 'L', look: 'ican' }).metrics.digitPt || 28) * (4 / 3);
    const key = `${window.innerWidth}x${window.innerHeight}`;
    if (!S.zoom || S.zoomKey !== key) {
        S.zoomKey = key;
        S.zoom = measureZoom(r, work, target / basePx);
    }
    zooms.forEach((z) => { z.style.zoom = String(S.zoom); });
    r.dataset.digitPx = String(Math.round(basePx * S.zoom));
    r.dataset.digitTarget = String(Math.round(target));
}

function measureZoom(r, work, want) {
    const p = idoPart();
    const sizer = document.createElement('div');
    sizer.className = 'mq-lp-sizer';
    sizer.setAttribute('aria-hidden', 'true');
    sizer.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;';
    const states = p.steps.length ? [...new Set(p.steps.map((s) => s.group))] : [0];
    sizer.innerHTML = states.map((g) => { const pc = statePieces(g); return `<div class="mq-lp-sz" data-g="${g}">${kit(pc.draw)}<div class="mq-lp-szh">${pc.hops ? kit(pc.hops) : ''}</div></div>`; }).join('')
        + (p.say ? `<div class="mq-lp-say">${esc(`Say: ${p.say}`)}</div>` : '');
    r.appendChild(sizer);
    let wD = 1, hD = 1, wH = 0, hH = 0;
    sizer.querySelectorAll('.mq-lp-sz').forEach((el) => {
        const d = el.firstElementChild;
        const h = el.querySelector('.mq-lp-szh .mq-lp-zoom');
        wD = Math.max(wD, d.scrollWidth); hD = Math.max(hD, d.scrollHeight);
        if (h) { wH = Math.max(wH, h.scrollWidth); hH = Math.max(hH, h.scrollHeight); }
    });
    const say = sizer.querySelector('.mq-lp-say');
    const sayH = say && !work.parentElement.querySelector('.mq-lp-say') ? say.offsetHeight : 0;
    sizer.remove();
    const words = work.querySelector('.mq-lp-words');
    const wordsH = words ? words.offsetHeight : 0;
    const wordsW = words ? Math.min(words.scrollWidth, work.clientWidth * 0.45) : 0;
    const row = work.dataset.variant === 'row';
    const gap = 56 * (parseFloat(getComputedStyle(r).getPropertyValue("--lp-k")) || 1);
    // (the cell is sized to its content - H13: no empty band inside it at any step - so the room is the stage's: the cell's
    // column less the cell's other bands, with the Say band's room kept for the last step)
    const cell = work.closest('.mq-lp-cell');
    const wrap = work.closest('.mq-lp-cellwrap');
    const wcs = getComputedStyle(work);
    const padV = parseFloat(wcs.paddingTop) + parseFloat(wcs.paddingBottom);
    const availH = wrap.clientHeight - (cell.offsetHeight - work.offsetHeight) - sayH - padV - 6;
    const availW = work.clientWidth - 24;
    let z;
    if (row) {
        // the drawing beside the side column (words over hops)
        z = Math.min(want, (availW - gap) / (wD + Math.max(wH, wordsW / Math.max(want, 0.01))), availH / hD, hH ? (availH - wordsH - 8) / hH : Infinity);
    } else {
        z = Math.min(want, availW / Math.max(wD, wH || 0), (availH - wordsH - 14) / (hD + hH));
    }
    return Math.max(0.2, +z.toFixed(4));
}

export default { openLessonPlayer, closeLessonPlayer, lessonPlayerState };
