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

import { planLesson, parseLaunch, launchSearch, chartRequest, PLAYER_PARTS, PART_IDS, partOf, lessonSeedOf, BUILT_MODES } from './plan.js';
import { stopSpeaking } from '../hints-speech.js';
import { stateDrawing, chartLayout } from '../sheet/lesson-pages/chart.js';
import { panelHops } from '../sheet/lesson-arch/fact.js';
import { lessonData } from '../lessons/library.js';
import { stepMarker, stateGroups } from '../sheet/lesson-pages/common.js';
import { resolveCtx } from '../sheet/index.js';
import { SHEET_ENGINE_CSS } from '../sheet/roles/practice.js';
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
        S = null;
        mountShell({ title: 'Lesson', mode: 'board' });
        // (critic r1 F6: the name as typed, as TEXT - stageMessage sets textContent, so it is escaped once, never parsed)
        stageMessage('No such lesson', `There is no lesson called “${(l && l.raw) || ''}”. Check the link.`);
        return lessonPlayerState();
    }
    // (critic r1 F7: pupil mode is not built in this slice - the Board plays, and no Pupil pill shows)
    if (!BUILT_MODES.includes(l.mode)) l.mode = 'board';
    if (l.seed === undefined || l.seed === null) l.seed = lessonSeedOf(l.lesson);
    S = { launch: l, plan: null, part: PART_IDS.includes(l.part) ? l.part : 'ido', pos: {}, visited: new Set(), done: new Set(), ready: false, spoke: '', item: null, fit: null };
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
    r.dataset.mode = BUILT_MODES.includes(mode) ? mode : 'board';
    r.innerHTML = `
<header class="mq-lp-top">
  <h1 class="mq-lp-title">${esc(title)}</h1>
  <span class="mq-lp-mode">Board</span>
  <nav class="mq-lp-rail" aria-label="Lesson parts">${PLAYER_PARTS.map((p) => `<button type="button" class="mq-lp-pill" data-part="${p.id}"${p.built ? '' : ' data-soon'}>${esc(p.name)}</button>`).join('')}</nav>
  <button type="button" class="mq-lp-leave" data-act="leave" aria-label="Leave the lesson">Leave</button>
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
    // (critic r1 F2: the WHOLE engine stylesheet - it carries the lesson rules AND the dot card's place beside its addend,
    // .mq-cuewrap / .mq-cue - so the screen lays the chart's drawing out as the paper does)
    if (!document.getElementById('mqLessonPlayerKitCss')) {
        const css = document.createElement('style');
        css.id = 'mqLessonPlayerKitCss';
        css.textContent = SHEET_ENGINE_CSS;
        document.head.appendChild(css);
    }
    r.querySelector('.mq-lp-top').addEventListener('click', (e) => {
        if (e.target.closest('[data-act="leave"]')) { closeLessonPlayer(); return; }
        const b = e.target.closest('[data-part]');
        if (b && !r.dataset.idle) goPart(b.dataset.part);
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
    st.innerHTML = '<div class="mq-lp-msg"><h2></h2><p></p></div>';
    st.querySelector('h2').textContent = head;
    st.querySelector('p').textContent = body;
    // (critic r1 F1: no part to show - the presenter buttons and the part pills hide (none would do anything); Leave stays)
    rootEl().dataset.idle = '1';
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
    resizeT = setTimeout(() => { if (S && S.ready) { S.fit = null; if (S.part === 'ido') render(); } }, 60);
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
        // (critic r1 F8: the tick only once the part was finished - for I do, its last step reached)
        const tick = !on && S.done.has(id) && def.built;
        b.classList.toggle('is-done', tick);
        b.textContent = def.name + (tick ? ' ✓' : '');
        b.setAttribute('aria-label', `${def.name}${def.built ? '' : ' (coming soon)'}${on ? ', showing' : ''}`);
    });
    const bar = r.querySelector('.mq-lp-bar');
    delete bar.dataset.idle;
    delete r.dataset.idle;
    if (S.part === 'ido' && idoPart().steps.length && (S.pos.ido || 0) >= idoPart().steps.length - 1) S.done.add('ido');
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

/** A step's words, and its note in bold under them as the chart draws it (critic r1 F5: "Same numbers? Start with either."). */
const wordsHtml = (st) => (st ? `<p class="mq-lp-words">${esc(st.words)}</p>${st.note ? `<p class="mq-lp-note">${esc(st.note)}</p>` : ''}` : '');

/**
 * The Say band (P-17): filled after the last step, absent before it - its room kept (blank, no stub) so nothing moves. It
 * closes the words column (critic r1 F4: a full-width strip under the drawing kept a 42 % empty band on step 1 - the answer
 * row's room AND the strip's room in one band).
 */
const sayHtml = (p, last) => (!p.say ? '' : last ? `<div class="mq-lp-say"><b>Say:</b> <span>${esc(p.say)}</span></div>` : '<div class="mq-lp-sayroom" aria-hidden="true"></div>');

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
    // (critic r1 F3 / F4: every box keeps the size of its LARGEST state from step 1 - the drawing, the words, the hops and
    // the Say band's room - so the cell never grows and no mark already drawn moves; fitDrawing sets the sizes)
    st.innerHTML = `
<aside class="mq-lp-steps" aria-label="Steps"><h2>Steps</h2><ol>${stepsHtml}</ol>${chant}</aside>
<section class="mq-lp-cellwrap">
  <div class="mq-scell mq-lp-cell" role="group" aria-label="Worked example, step ${k + 1} of ${n}" data-step="${k + 1}" data-steps="${n}">
    ${instr ? `<div class="mq-lp-instr">${esc(instr)}</div>` : ''}
    <div class="mq-lp-work" data-variant="${pc.variant}">
      <div class="mq-lp-group">
        <div class="mq-lp-draw">${kit(pc.draw)}</div>
        <div class="mq-lp-side"><div class="mq-lp-wordsbox">${wordsHtml(cur)}</div>${pc.variant === 'row' ? `<div class="mq-lp-hops">${pc.hops ? kit(pc.hops) : ''}</div>` : ''}${sayHtml(p, last)}</div>
      </div>
    </div>
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

/* ============================================================== sizing (critic r1 F3 / F4) */

const kOf = (r) => parseFloat(getComputedStyle(r).getPropertyValue('--lp-k')) || 1;
// The signed cell-digit size (card drawing.sizes, D5): board 104 px at 1280 / 1366, x1.5 at 1920 (156 px); the tablet board
// at the player's tablet scale (--lp-k 0.8: 83 px - the card names no tablet figure).
const digitTarget = (r) => 104 * kOf(r);
const basePxOf = () => (resolveCtx({ mode: 'print', size: 'L', look: 'ican' }).metrics.digitPt || 28) * (4 / 3);

/**
 * Size the I do once per viewport: ONE zoom for every state (the digits never jump), the drawing at the signed digit size,
 * and every box at its largest state's size, so the cell is the same from step 1 and no mark moves (F3, F4). When the
 * drawing does not fit at the signed size, the layout gives room first - the Steps strip collapses to chips, the words and
 * hops go under the drawing - and only then does the zoom fall (content never shrinks while room is left, card D5).
 */
function fitDrawing() {
    const r = rootEl();
    if (!r || !S || !r.querySelector('.mq-lp-work')) return;
    const key = `${window.innerWidth}x${window.innerHeight}`;
    if (!S.fit || S.fit.key !== key) S.fit = Object.assign(solveFit(r), { key });
    applyFit(r, S.fit);
}

/** The largest state of every box, measured at zoom 1 (drawing, hops) or at a given width (words). */
function measureStates(r) {
    const p = idoPart();
    const groups = p.steps.length ? [...new Set(p.steps.map((s) => s.group))] : [0];
    const sizer = document.createElement('div');
    sizer.className = 'mq-lp-sizer';
    sizer.setAttribute('aria-hidden', 'true');
    sizer.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;';
    sizer.innerHTML = groups.map((g) => { const pc = statePieces(g); return `<div class="mq-lp-sz">${kit(pc.draw)}<div class="mq-lp-szh">${pc.hops ? kit(pc.hops) : ''}</div></div>`; }).join('');
    r.appendChild(sizer);
    let wD = 1, hD = 1, wH = 0, hH = 0;
    sizer.querySelectorAll('.mq-lp-sz').forEach((el) => {
        const d = el.firstElementChild.getBoundingClientRect();
        // (the drawing's box ends at its lowest INK, not at the template's own bottom padding: that padding is white the
        // cell would carry as a band under the answer row - critic r1 F4, H13)
        let inkB = 0;
        for (const x of el.firstElementChild.querySelectorAll('*')) {
            if (x.children.length && !(x instanceof SVGGraphicsElement && x.tagName !== 'svg' && x.tagName !== 'g')) continue;
            const q = x.getBoundingClientRect();
            if (q.width > 0.5 && q.height > 0.5) inkB = Math.max(inkB, q.bottom - d.top);
        }
        wD = Math.max(wD, d.width); hD = Math.max(hD, inkB > 0 ? Math.min(d.height, inkB + 1) : d.height);
        const hz = el.querySelector('.mq-lp-szh .mq-lp-zoom');
        if (hz) { const q = hz.getBoundingClientRect(); wH = Math.max(wH, q.width); hH = Math.max(hH, q.height); }
    });
    // the words of every step (and its note) at a width: natural one-line width, longest word, height at a width
    const wb = document.createElement('div');
    wb.className = 'mq-lp-wordsbox';
    sizer.innerHTML = '';
    sizer.appendChild(wb);
    const steps = p.steps.length ? p.steps : [null];
    wb.style.width = 'max-content';
    let natW = 0;
    steps.forEach((st) => { wb.innerHTML = wordsHtml(st); natW = Math.max(natW, wb.getBoundingClientRect().width); });
    wb.style.width = 'min-content';
    let minW = 0;
    steps.forEach((st) => { wb.innerHTML = wordsHtml(st); minW = Math.max(minW, wb.getBoundingClientRect().width); });
    const cache = {};
    const wordsH = (w) => {
        const kw = Math.round(w);
        if (cache[kw] !== undefined) return cache[kw];
        wb.style.width = `${kw}px`;
        let h = 0;
        steps.forEach((st) => { wb.innerHTML = wordsHtml(st); h = Math.max(h, wb.getBoundingClientRect().height); });
        cache[kw] = h;
        return h;
    };
    const p2 = idoPart();
    const sb = document.createElement('div');
    sb.className = 'mq-lp-say';
    sb.innerHTML = p2.say ? `<b>Say:</b> <span>${esc(p2.say)}</span>` : '';
    // (measured inside a words column, where its own rules apply)
    const sideBox = document.createElement('div');
    sideBox.className = 'mq-lp-side';
    sideBox.style.width = 'max-content';
    sideBox.appendChild(sb);
    sizer.appendChild(sideBox);
    sb.style.width = 'max-content';
    const sayNat = p2.say ? sb.getBoundingClientRect().width : 0;
    const sayCache = {};
    const sayH = (w) => {
        if (!p2.say) return 0;
        const kw = Math.round(w);
        if (sayCache[kw] === undefined) { sb.style.width = `${kw}px`; sayCache[kw] = sb.getBoundingClientRect().height; }
        return sayCache[kw];
    };
    return { wD, hD, wH, hH, natW: Math.ceil(Math.max(natW, sayNat)) + 2, minW: Math.ceil(minW) + 2, wordsH, sayH, done: () => sizer.remove() };
}

function setLayout(r, { chips, stack }) {
    if (chips) r.dataset.chips = '1'; else delete r.dataset.chips;
    const work = r.querySelector('.mq-lp-work');
    if (stack) work.dataset.stack = '1'; else delete work.dataset.stack;
}

function solveFit(r) {
    const p = idoPart();
    const k = kOf(r);
    const want = digitTarget(r) / basePxOf();
    const m = measureStates(r);
    const cell = r.querySelector('.mq-lp-cell');
    const wrap = r.querySelector('.mq-lp-cellwrap');
    const work = r.querySelector('.mq-lp-work');
    let sayH = 0;
    const row = work.dataset.variant === 'row';
    const gap = 48 * k, gapS = 10 * k;
    const tablet = window.matchMedia('(max-width: 1199px)').matches;
    // (a tablet's tall stage: the drawing may grow past the tablet scale, up to the board's own 104 px, to fill it - H13)
    const cap = tablet ? want * 1.25 : want;
    const layouts = tablet ? [{ chips: 1, stack: 0 }, { chips: 1, stack: 1 }]
        : [{ chips: 0, stack: 0 }, { chips: 1, stack: 0 }, { chips: 0, stack: 1 }, { chips: 1, stack: 1 }];
    const sizeAt = (lay, availW, availH) => {
        for (let z = cap; z >= 0.2; z *= 0.985) {
            const hops = m.hH ? gapS + m.hH * z : 0;
            if (row && !lay.stack) {
                const sideW = Math.max(m.wH * z, Math.min(m.natW, availW - gap - m.wD * z));
                if (m.wD * z + gap + sideW > availW + 0.5 || sideW < m.minW) continue;
                const wh = m.wordsH(sideW);
                const sh = m.sayH(sideW) ? gapS + m.sayH(sideW) : 0;
                const h = Math.max(m.hD * z, wh + hops + sh);
                if (h > availH + 0.5) continue;
                return { z, sideW, wordsH: wh, sayH: m.sayH(sideW), groupW: m.wD * z + gap + sideW, groupH: h };
            }
            const sideW = Math.min(availW, Math.max(m.wH * z, m.natW, m.wD * z));
            if (Math.max(m.wD, m.wH) * z > availW + 0.5) continue;
            const wh = m.wordsH(sideW);
            const sh = m.sayH(sideW) ? gapS + m.sayH(sideW) : 0;
            const h = m.hD * z + gapS * 1.4 + wh + hops + sh;
            if (h > availH + 0.5) continue;
            return { z, sideW, wordsH: wh, sayH: m.sayH(sideW), groupW: Math.max(m.wD * z, sideW), groupH: h };
        }
        return null;
    };
    let best = null;
    for (const lay of layouts) {
        setLayout(r, lay);
        cell.style.height = `${wrap.clientHeight}px`;
        const wcs = getComputedStyle(work);
        const availW = work.clientWidth - parseFloat(wcs.paddingLeft) - parseFloat(wcs.paddingRight);
        const availH = work.clientHeight - parseFloat(wcs.paddingTop) - parseFloat(wcs.paddingBottom);
        const f = sizeAt(lay, availW, availH);
        if (!f) continue;
        const cand = Object.assign({ lay, stageH: wrap.clientHeight, chromeH: cell.offsetHeight - availH }, f);
        if (!best || f.z > best.z + 1e-4) best = cand;
        if (f.z >= cap - 1e-4) break;
    }
    m.done();
    if (!best) best = { lay: layouts[layouts.length - 1], z: 0.2, sideW: 0, wordsH: 0, groupW: 0, groupH: 0, sayH, stageH: wrap.clientHeight, chromeH: 0 };
    best.wD = m.wD; best.hD = m.hD; best.wH = m.wH; best.hH = m.hH;
    // The cell: its content's height (its largest state), centred in the stage column, so the stage's spare room is split
    // above and below it (stage H13) and none of it adds to the step-1 band inside the cell (cell H13); at most the stage.
    const c = best.chromeH + best.groupH;
    best.cellH = Math.min(best.stageH, Math.ceil(c) + 2);
    return best;
}

function applyFit(r, f) {
    setLayout(r, f.lay);
    const z = String(+f.z.toFixed(4));
    r.querySelectorAll('.mq-lp-cell .mq-lp-zoom').forEach((el) => { el.style.zoom = z; });
    const cell = r.querySelector('.mq-lp-cell');
    cell.style.height = `${Math.floor(f.cellH)}px`;
    const draw = r.querySelector('.mq-lp-draw');
    draw.style.width = `${Math.ceil(f.wD * f.z)}px`;
    draw.style.height = `${Math.ceil(f.hD * f.z)}px`;
    const side = r.querySelector('.mq-lp-side');
    side.style.width = `${Math.ceil(f.sideW)}px`;
    r.querySelector('.mq-lp-wordsbox').style.minHeight = `${Math.ceil(f.wordsH)}px`;
    const hops = r.querySelector('.mq-lp-hops');
    if (hops) {
        hops.style.width = `${Math.ceil(f.wH * f.z)}px`;
        hops.style.height = `${Math.ceil(f.hH * f.z)}px`;
        hops.style.display = f.hH ? '' : 'none';
    }
    const room = r.querySelector('.mq-lp-sayroom, .mq-lp-say');
    if (room) room.style.height = `${Math.ceil(f.sayH)}px`;
    r.dataset.digitPx = String(Math.round(basePxOf() * f.z));
    r.dataset.digitTarget = String(Math.round(digitTarget(r)));
}

export default { openLessonPlayer, closeLessonPlayer, lessonPlayerState };
