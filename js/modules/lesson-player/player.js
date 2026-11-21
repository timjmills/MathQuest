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
//
// Slice 2 (lane lf-hosts): Warm-up and We do, in BOTH modes, one cell at a time (D11: a part steps on the board with the
// same Next / Back / clicker keys). Their items are the printed lesson sheet's own Warm-up and Guided items for the seed
// (res.lesson.teach.warmQs / weDoQs, P-ON-5); the player deals its own (generateQuestionFor at D2's S+100+i / S+200+i) only
// where the packet prints no such band. Each answer slot of the kit drawing becomes an input in place (one per digit where
// the paper slot has digit places), with live per-digit marks (SP-31, chrome: data-ws-feedback, SP-30). We do runs the hint
// fade (P-ON-7): item i opens at rung i+1 - board: the teacher drives the rung with Hint / Next; pupil: a right Check moves
// the next item down a rung, a wrong one keeps it - and no hint ever writes into a box (P-ON-8). Pupil mode is the card
// scale (D5), saves only the part reached and resumes there (D4); its I do reads itself, only while sound is on (D6, A17).
// Later slices add their parts' renderers (youdo, exit) beside renderItem and their plans to plan.js.

import { planLesson, parseLaunch, launchSearch, chartRequest, PLAYER_PARTS, PART_IDS, partOf, lessonSeedOf, BUILT_MODES, partSeed, RUNG3_WORDS, WARM_MAX, WEDO_MAX } from './plan.js';
import { stopSpeaking, speakExplanation } from '../hints-speech.js';
import { weDoRender } from '../sheet/lesson-pages/we-do.js';
import { state as appState } from '../state.js';
import { savePersistentData } from '../storage.js';
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
    if (!BUILT_MODES.includes(l.mode)) l.mode = 'board';
    if (l.seed === undefined || l.seed === null) l.seed = lessonSeedOf(l.lesson);
    // (D4: a pupil link with no ?part= resumes at the last part reached)
    if (l.mode === 'pupil' && !l.partGiven) { const back = reachedOf(l.lesson); if (back && PART_IDS.includes(back)) l.part = back; }
    S = { launch: l, plan: null, part: PART_IDS.includes(l.part) ? l.part : 'ido', pos: {}, visited: new Set(), done: new Set(), ready: false, spoke: '', autoSpoke: '', item: null, fit: null,
        hosts: { warmup: [], wedo: [] }, vals: {}, checked: {}, wrongs: {}, rungs: {}, starts: {}, shown: {} };
    mountShell({ title: 'Lesson', mode: l.mode });
    stageMessage('Getting the lesson ready…', 'The worked example is being made from the lesson.');
    try {
        const ps = await import('../print-sheet.js');
        const res = await ps.buildSheet(chartRequest(l.lesson, l.seed));
        const exQ = res && res.lesson && res.lesson.chart && (res.lesson.chart.exampleQs || [])[0];
        // (slice 2: the lesson sheet's own Warm-up and Guided items - built with the chart by the same request)
        const teach = (res && res.lesson && res.lesson.teach) || {};
        let warmQs = (teach.warmQs || []).filter((x) => x && x.length);
        let weDoQs = (teach.weDoQs || []).filter(Boolean);
        if (!warmQs.length || !weDoQs.length) ({ warmQs, weDoQs } = await dealOwn(l, warmQs, weDoQs));
        S.plan = planLesson(l.lesson, { seed: l.seed, mode: l.mode, example: exQ || null, title: (res && res.title) || '', warmQs, weDoQs, warmInstr: teach.warmInstr || [], weDoInstr: teach.weDoInstr || '' });
        S.chartExample = (res && res.lesson && res.lesson.example) || '';
        S.item = exQ ? ps.lessonPlayerItem(exQ) : null;
        S.hosts.warmup = warmQs.slice(0, WARM_MAX).map((list) => ps.lessonPlayerItem(list[0]));
        S.hosts.wedo = weDoQs.slice(0, WEDO_MAX).map((q) => ps.lessonPlayerItem(q));
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
        autoSpoke: S.autoSpoke || '',
        practice: (S.plan && S.plan.practice && S.plan.practice.skillId) || '',
        plan: S.plan ? { warmup: partPlan('warmup').items.map((x) => ({ text: x.text, ans: x.ans, seed: x.seed })), wedo: partPlan('wedo').items.map((x) => ({ text: x.text, ans: x.ans, seed: x.seed, rung: x.rung })) } : null,
        ...itemState(),
    };
}

/** The open item part's state (Warm-up / We do), for the gates. */
function itemState() {
    if (!S || !S.plan || !isItemPart(S.part)) return {};
    const p = partPlan(S.part);
    const i = S.pos[S.part] || 0;
    const it = p.items[i] || {};
    const k = `${S.part}:${i}`;
    return { item: i, items: p.items.length, rung: S.part === 'wedo' ? rungOf(i) : 0, itemAns: it.ans, itemText: it.text, checked: S.checked[k] || '',
        wrongChecks: S.wrongs[k] || 0, words: S.part === 'wedo' ? wordsOf(i) : '', nextSentence: S.part === 'wedo' ? it.sentence || '' : '', ifMissed: S.part === 'warmup' ? it.ifMissed || null : null };
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
  <span class="mq-lp-mode">${mode === 'pupil' ? 'Pupil' : 'Board'}</span>
  <nav class="mq-lp-rail" aria-label="Lesson parts">${PLAYER_PARTS.map((p) => `<button type="button" class="mq-lp-pill" data-part="${p.id}"${p.built ? '' : ' data-soon'}>${esc(p.name)}</button>`).join('')}</nav>
  <button type="button" class="mq-lp-leave" data-act="leave" aria-label="Leave the lesson">Leave</button>
</header>
<main class="mq-lp-stage" aria-live="polite"></main>
<footer class="mq-lp-bar">
  <button type="button" class="mq-lp-btn" data-act="back" aria-label="Back one step">${TRI_LEFT} Back</button>
  <button type="button" class="mq-lp-btn" data-act="read" aria-label="Read this step aloud">Read aloud</button>
  <button type="button" class="mq-lp-btn" data-act="hint" aria-label="Hint" hidden>Hint</button>
  <button type="button" class="mq-lp-btn mq-lp-check" data-act="check" aria-label="Check the answer" hidden>Check</button>
  <button type="button" class="mq-lp-btn" data-act="show" aria-label="Show the answer" hidden>Answer</button>
  <span class="mq-lp-count" aria-live="polite"></span>
  <div class="mq-lp-keys" aria-hidden="true">→ / Space / clicker: next · ← back<br>R read · H hint${mode === 'pupil' ? '' : ' · A answer'} · Esc leave</div>
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
        else if (b.dataset.act === 'hint') hint();
        else if (b.dataset.act === 'check') checkItem();
        else if (b.dataset.act === 'show') showAnswer();
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
    else if (at === 'end' && isItemPart(id)) S.pos[id] = Math.max(0, partPlan(id).items.length - 1);
    else if (at === 'start' && isItemPart(id)) S.pos[id] = 0;
    if (S.pos[id] === undefined) S.pos[id] = 0;
    // (the URL follows the part, D11: a copied link opens this part; replaceState, so Back in the browser leaves the player)
    try { history.replaceState({}, document.title, location.pathname + launchSearch(Object.assign({}, S.launch, { part: id })) + location.hash); } catch (e) { /* no history */ }
    S.launch.part = id;
    if (S.launch.mode === 'pupil') saveReached(S.launch.lesson, id);
    render();
}

function next() {
    if (!S || !S.ready) return;
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    if (S.part === 'ido') {
        const n = idoPart().steps.length;
        if ((S.pos.ido || 0) < n - 1) { S.pos.ido = (S.pos.ido || 0) + 1; render(); return; }
    }
    if (isItemPart(S.part)) {
        const n = partPlan(S.part).items.length;
        if ((S.pos[S.part] || 0) < n - 1) { S.pos[S.part] = (S.pos[S.part] || 0) + 1; render(); return; }
    }
    const i = partIndex(S.part);
    if (i < PART_IDS.length - 1) goPart(PART_IDS[i + 1], { at: 'start' });
}

function back() {
    if (!S || !S.ready) return;
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    if (S.part === 'ido' && (S.pos.ido || 0) > 0) { S.pos.ido -= 1; render(); return; }
    if (isItemPart(S.part) && (S.pos[S.part] || 0) > 0) { S.pos[S.part] -= 1; render(); return; }
    const i = partIndex(S.part);
    if (i > 0) goPart(PART_IDS[i - 1], { at: 'end' });
}

function onKey(e) {
    if (!rootEl()) return;
    const t = e.target;
    const inInput = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    if (inInput && !['Enter', 'Tab'].includes(e.key)) return;
    const k = e.key;
    if (k === 'Tab') return;
    let done = true;
    if (k === 'Enter') { if (isItemPart(S && S.part)) checkItem(); else if (!inInput) next(); else done = false; }
    else if (k === 'ArrowRight' || k === ' ' || k === 'Spacebar' || k === 'PageDown') next();
    else if ((k === 'h' || k === 'H') && isItemPart(S && S.part)) hint();
    else if ((k === 'a' || k === 'A') && isItemPart(S && S.part) && S.launch.mode === 'board') showAnswer();
    else if (k === 'ArrowLeft' || k === 'PageUp') back();
    else if (k === 'r' || k === 'R') readAloud();
    else if (k === 'Escape') closeLessonPlayer();
    else done = false;
    if (done) { e.preventDefault(); e.stopPropagation(); }
}

let resizeT = 0;
function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(() => { if (S && S.ready) { S.fit = null; if (S.part === 'ido' || isItemPart(S.part)) render(); } }, 60);
}

/* ============================================================== read aloud (D6: on demand on the board) */

function currentSpeech() {
    if (!S || !S.ready) return '';
    if (isItemPart(S.part)) {
        const i = S.pos[S.part] || 0;
        const it = partPlan(S.part).items[i] || {};
        return S.part === 'wedo' ? wordsOf(i) : [it.instr, plainQ(it.text)].filter(Boolean).join(' ');
    }
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
    r.querySelectorAll('.mq-lp-fb-bar').forEach((e) => e.remove());
    syncButtons(r);
    if (S.part === 'ido') renderIdo(r);
    else if (isItemPart(S.part)) renderItem(r, S.part);
    else renderSoon(r, S.part);
}

function nextLabel() {
    const i = partIndex(S.part);
    const p = idoPart();
    if (S.part === 'ido' && (S.pos.ido || 0) < p.steps.length - 1) return 'Next step';
    if (isItemPart(S.part) && (S.pos[S.part] || 0) < partPlan(S.part).items.length - 1) return 'Next item';
    return i < PART_IDS.length - 1 ? `Next: ${partOf(PART_IDS[i + 1]).name}` : 'End of lesson';
}

function setBar(count) {
    const r = rootEl();
    const i = partIndex(S.part);
    const atStart = i === 0 && !(S.part === 'ido' && (S.pos.ido || 0) > 0) && !(isItemPart(S.part) && (S.pos[S.part] || 0) > 0);
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
 * The Say band (P-17, BD-8): the FULL-WIDTH strip under the drawing that closes the cell, as on the card and the printed
 * chart (lead ruling A22, 2026-11-20). Its frame and "Say:" label show from step 1 with the line empty; the line fills after
 * the last step. Its height is the filled line's from step 1 (fitDrawing), so nothing moves when it fills.
 */
const sayHtml = (p, last) => (!p.say ? '' : `<div class="mq-lp-say"><b>Say:</b> <span class="mq-lp-say-line"${last ? '' : ' aria-hidden="true"'}>${last ? esc(p.say) : ''}</span></div>`);

function renderIdo(r) {
    const st = r.querySelector('.mq-lp-stage');
    const p = idoPart();
    const n = p.steps.length;
    const k = Math.min(S.pos.ido || 0, Math.max(0, n - 1));
    const cur = p.steps[k];
    const last = k === n - 1;
    st.className = 'mq-lp-stage mq-lp-stage-ido';
    fullStage(r);
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
        <div class="mq-lp-side"><div class="mq-lp-wordsbox">${wordsHtml(cur)}</div>${pc.variant === 'row' ? `<div class="mq-lp-hops">${pc.hops ? kit(pc.hops) : ''}</div>` : ''}</div>
      </div>
    </div>
    ${sayHtml(p, last)}
  </div>
</section>`;
    setBar(n ? `Step ${k + 1} of ${n}${last && p.say ? ' <span class="mq-lp-together">· Say it together</span>' : ''}` : 'Worked example');
    fitDrawing();
    // (critic s2 r1 F7: the grown pupil card trimmed once per viewport to H13's limit on the state it opens at, then kept, so
    // the cell never changes height between steps)
    if (S.launch.mode === 'pupil' && pupilDesk() && S.fit && n) {
        const cell = r.querySelector('.mq-lp-cell');
        if (S.fit.trimH) cell.style.height = `${S.fit.trimH}px`;
        else if (cell) { trimBand(cell); S.fit.trimH = Math.floor(cell.getBoundingClientRect().height); }
    }
    if (S.launch.mode === 'pupil') { fitPupilStage(r); autoRead(); }
}

/** D6 + A17: pupil I do reads each step itself through the sound toggle (speakExplanation: nothing while sound is off). */
function autoRead() {
    const text = currentSpeech();
    S.autoSpoke = '';
    if (!text) return;
    try { if (speakExplanation(text)) S.autoSpoke = text; } catch (e) { /* no voice */ }
}

function renderSoon(r, id) {
    const st = r.querySelector('.mq-lp-stage');
    const def = partOf(id);
    st.className = 'mq-lp-stage mq-lp-stage-soon';
    st.style.height = '';
    st.innerHTML = `<div class="mq-lp-msg mq-lp-soon" data-soon="${esc(id)}"><h2>${esc(def.name)}: coming soon</h2>`
        + `<p>This part of the lesson is being built.</p><p>Use the part bar, or Back and Next, to move to another part.</p></div>`;
    setBar(esc(def.name));
}

/* ============================================================== sizing (critic r1 F3 / F4) */

const kOf = (r) => parseFloat(getComputedStyle(r).getPropertyValue('--lp-k')) || 1;
// The signed cell-digit size (card drawing.sizes, D5): board 104 px at 1280 / 1366, x1.5 at 1920 (156 px); the tablet board
// at the player's tablet scale (--lp-k 0.8: 83 px - the card names no tablet figure).
const digitTarget = (r) => (r.dataset.mode === 'pupil' ? pupilDigit() : 104 * kOf(r));
// D5: pupil mode is the card scale of .mq-scell (RUBRIC C3: 56 px on a computer, 48 px on a tablet)
const pupilDigit = () => (window.innerWidth >= 1200 ? 56 : 48);
/** Pupil mode on a computer (critic s2 r1 F7): the card fills the stage as the board does (A22b). */
const pupilDesk = () => window.innerWidth >= 1200;
// (the I do card's growth over its content: its states keep room for words, hops and the Say line, so it grows less)
const IDO_GROW = 1.8;

/**
 * Critic s2 r1 F7 with H13: a pupil card grown into the stage keeps every empty band of its height under 28 % - the
 * largest band between its ink (borders, text, drawn shapes, answer boxes) is measured and the cell trimmed (its content
 * is centred, so a trim takes from the bands above and below alike).
 */
function bandOf(cell) {
    const cq = cell.getBoundingClientRect();
    const bw = parseFloat(getComputedStyle(cell).borderTopWidth) || 0;
    const top = cq.top + bw, bottom = cq.bottom - bw;
    const ys = [];
    const add = (a, b) => { if (b > a) ys.push([Math.max(a, top), Math.min(b, bottom)]); };
    for (const el of cell.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[data-ws-feedback]')) continue;
        const q = el.getBoundingClientRect();
        if (!(q.width > 0.5 && q.height > 0.5)) continue;
        if (el instanceof SVGElement) { if (['path', 'text', 'rect', 'circle', 'ellipse', 'line', 'polygon', 'polyline'].includes(el.tagName)) add(q.top, q.bottom); continue; }
        if (el.tagName === 'INPUT') add(q.top, q.bottom);
        if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') add(q.top, q.top + 1);
        if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none') add(q.bottom - 1, q.bottom);
        if (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none') add(q.top, q.bottom);
        for (const c of el.childNodes) if (c.nodeType === 3 && c.nodeValue.trim()) { const rg = document.createRange(); rg.selectNodeContents(c); const t = rg.getBoundingClientRect(); add(t.top, t.bottom); }
    }
    ys.sort((a, b) => a[0] - b[0]);
    let cur = top, gap = 0;
    for (const [a, b] of ys) { gap = Math.max(gap, a - cur); cur = Math.max(cur, b); }
    gap = Math.max(gap, bottom - cur);
    return { gap, h: bottom - top };
}
function trimBand(cell, limit = 0.28) {
    for (let n = 0; n < 4; n++) {
        const { gap, h } = bandOf(cell);
        if (!(h > 0) || gap <= limit * h) return;
        const d = Math.ceil((gap - limit * h) / (0.5 - limit)) + 2;
        cell.style.height = `${Math.max(40, Math.floor(cell.getBoundingClientRect().height - d))}px`;
    }
}
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
    sb.innerHTML = p2.say ? `<b>Say:</b> <span class="mq-lp-say-line">${esc(p2.say)}</span>` : '';
    // (the filled band, full width at the cell's inner width - A22)
    sizer.appendChild(sb);
    const sayCache = {};
    const sayH = (w) => {
        if (!p2.say) return 0;
        const kw = Math.round(w);
        if (sayCache[kw] === undefined) { sb.style.width = `${kw}px`; sayCache[kw] = sb.getBoundingClientRect().height; }
        return sayCache[kw];
    };
    return { wD, hD, wH, hH, natW: Math.ceil(natW) + 2, minW: Math.ceil(minW) + 2, wordsH, sayH, done: () => sizer.remove() };
}

function setLayout(r, { chips, stack }) {
    if (chips) r.dataset.chips = '1'; else delete r.dataset.chips;
    const work = r.querySelector('.mq-lp-work');
    if (stack) work.dataset.stack = '1'; else delete work.dataset.stack;
}

// A26 (lead ruling 2026-11-20; critic r3 F1): stacked, the hops' top margin under the drawing - with the group's gap,
// 0.6 of a drawn digit, so they read as the count-on under the sum's answer, never as a row of the sum.
const hopsDrop = (z, k) => Math.max(0, 0.6 * basePxOf() * z - 14 * k);

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
    const gap = 32 * k, gapS = 10 * k;
    const tablet = window.matchMedia('(max-width: 1199px)').matches;
    // (A22: the zoom may grow ABOVE the signed size by up to +25 %, only to fill free stage room; never below it)
    const cap = want * 1.25;
    const layouts = tablet ? [{ chips: 1, stack: 0 }, { chips: 1, stack: 1 }]
        : [{ chips: 0, stack: 0 }, { chips: 1, stack: 0 }, { chips: 0, stack: 1 }, { chips: 1, stack: 1 }];
    const sizeAt = (lay, availW, availH) => {
        for (let z = cap; z >= 0.2; z *= 0.985) {
            const hops = m.hH ? gapS + m.hH * z : 0;
            if (row && !lay.stack) {
                const sideW = Math.max(m.wH * z, Math.min(m.natW, availW - gap - m.wD * z));
                if (m.wD * z + gap + sideW > availW + 0.5 || sideW < m.minW) continue;
                const wh = m.wordsH(sideW);
                const h = Math.max(m.hD * z, wh + hops);
                if (h > availH + 0.5) continue;
                return { z, sideW, wordsH: wh, groupW: m.wD * z + gap + sideW, groupH: h };
            }
            const sideW = Math.min(availW, Math.max(m.wH * z, m.natW, m.wD * z));
            if (Math.max(m.wD, m.wH) * z > availW + 0.5) continue;
            const wh = m.wordsH(sideW);
            // (A26: stacked, the hops sit under the answer row, a group gap plus hopsDrop(z) below the drawing's foot)
            const h = m.hD * z + gapS * 1.4 + wh + (m.hH ? gapS * 1.4 + hopsDrop(z, k) + m.hH * z : 0);
            if (h > availH + 0.5) continue;
            return { z, sideW, wordsH: wh, groupW: Math.max(m.wD * z, sideW), groupH: h };
        }
        return null;
    };
    let best = null;
    let atSigned = null;
    const say = cell.querySelector('.mq-lp-say');
    for (const lay of layouts) {
        setLayout(r, lay);
        cell.style.height = `${wrap.clientHeight}px`;
        // the Say band's room: the filled line's height at the cell's inner width (A22: full width, from step 1)
        sayH = say ? m.sayH(cell.clientWidth) : 0;
        if (say) say.style.height = `${Math.ceil(sayH)}px`;
        const wcs = getComputedStyle(work);
        const availW = work.clientWidth - parseFloat(wcs.paddingLeft) - parseFloat(wcs.paddingRight);
        const availH = work.clientHeight - parseFloat(wcs.paddingTop) - parseFloat(wcs.paddingBottom);
        const f = sizeAt(lay, availW, availH);
        if (!f) continue;
        const cand = Object.assign({ lay, sayH, stageH: wrap.clientHeight, chromeH: cell.offsetHeight - availH }, f);
        if (!best || f.z > best.z + 1e-4) best = cand;
        // (the Steps stay beside the cell while a layout with them there holds the signed size; among those, the one whose
        // zoom grows furthest into the free room, up to the cap, wins - A22)
        if (f.z >= want - 1e-4 && (!lay.chips || tablet) && (!atSigned || f.z > atSigned.z + 1e-4)) atSigned = cand;
    }
    if (atSigned) best = atSigned;
    m.done();
    if (!best) best = { lay: layouts[layouts.length - 1], z: 0.2, sideW: 0, wordsH: 0, groupW: 0, groupH: 0, sayH, stageH: wrap.clientHeight, chromeH: 0 };
    best.wD = m.wD; best.hD = m.hD; best.wH = m.wH; best.hH = m.hH;
    // The cell: its content's height (its largest state), top-aligned with the Steps (A22), so none of the stage's spare
    // room adds to the step-1 band inside the cell (cell H13); at most the stage.
    const c = best.chromeH + best.groupH;
    best.cellH = Math.min(best.stageH, Math.ceil(c) + 2);
    // (critic s2 r1 F7, as A22b: pupil mode on a computer - the card grows into the stage, up to 2.2 x its content, the
    // content centred in it, so each band around it stays under H13's 30 %)
    if (r.dataset.mode === 'pupil' && pupilDesk()) best.cellH = Math.min(best.stageH, Math.max(best.cellH, Math.ceil(c * IDO_GROW)));
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
    const wbx = r.querySelector('.mq-lp-wordsbox');
    wbx.style.minHeight = `${Math.ceil(f.wordsH)}px`;
    // (A26: stacked, the side box dissolves (display: contents), so the words carry its width and the hops their drop)
    wbx.style.width = f.lay.stack ? `${Math.ceil(f.sideW)}px` : '';
    const hops = r.querySelector('.mq-lp-hops');
    if (hops) {
        hops.style.marginTop = f.lay.stack ? `${Math.ceil(hopsDrop(f.z, kOf(r)))}px` : '';
        hops.style.width = `${Math.ceil(f.wH * f.z)}px`;
        hops.style.height = `${Math.ceil(f.hH * f.z)}px`;
        hops.style.display = f.hH ? '' : 'none';
    }
    const room = r.querySelector('.mq-lp-cell .mq-lp-say');
    if (room) room.style.height = `${Math.ceil(f.sayH)}px`;
    r.dataset.digitPx = String(Math.round(basePxOf() * f.z));
    r.dataset.digitTarget = String(Math.round(digitTarget(r)));
}


/* ============================================================== slice 2: Warm-up and We do (item parts) */

const ITEM_PARTS = ['warmup', 'wedo'];
function isItemPart(id) { return ITEM_PARTS.includes(id); }
function partPlan(id) { return (S && S.plan && S.plan.parts.find((p) => p.part === id)) || { items: [] }; }
const plainQ = (t) => String(t || '').replace(/<[^>]*>/g, '').replace(/\?(?=\s*$)/, '?').trim();

/** D4 / D7: the part a pupil reached, kept on the lesson's practice-skill progress record (no new store). */
function reachedRec(lesson, make) {
    const ref = S && S.plan ? S.plan.practice : null;
    const sk = (ref && ref.skillId) || '';
    if (!sk || !appState.skillProgress) return null;
    if (!appState.skillProgress[sk] && make) appState.skillProgress[sk] = { correct: 0, total: 0, streak: 0, bestStreak: 0, mastery: 0, lastPracticed: null, history: [] };
    return appState.skillProgress[sk] || null;
}
function reachedOf(lesson) {
    try {
        for (const rec of Object.values(appState.skillProgress || {})) if (rec && rec.lessonReached && rec.lessonReached[lesson]) return rec.lessonReached[lesson];
    } catch (e) { /* no progress */ }
    return null;
}
function saveReached(lesson, part) {
    try {
        // lead ruling A30-5: store only on a record the pupil already has; never create a 0-attempt record
        const rec = reachedRec(lesson, false);
        if (!rec) return;
        rec.lessonReached = Object.assign({}, rec.lessonReached || {}, { [lesson]: part });
        savePersistentData();
    } catch (e) { /* not saved */ }
}

/**
 * The player's own deal, ONLY where the printed packet has no Warm-up or Guided band (D2 seeds: Warm-up S+100+i, We do
 * S+200+i): one item per prerequisite skill, and three of the practice skill.
 */
async function dealOwn(l, warmQs, weDoQs) {
    let gen = null;
    try { gen = (await import('../generate-question.js')).generateQuestionFor; } catch (e) { gen = null; }
    const { lessonData: ld, practiceRef } = await import('../lessons/library.js');
    const deal = (ref, seed) => { try { const [category, skill] = String(ref.key || `${ref.categoryId}:${ref.skillId}`).split(':'); const q = gen({ category, skill, opts: ref.opts || {}, seed }); return q ? Object.assign(q, { categoryId: q.categoryId || category, skillId: q.skillId || skill, seed: q.seed !== undefined ? q.seed : seed }) : null; } catch (e) { return null; } };
    const data = ld(l.lesson) || {};
    if (gen && !warmQs.length) warmQs = (data.skills || []).slice(0, WARM_MAX).map((ref, i) => [deal(ref, partSeed(l.seed, 'warmup', i))]).filter((x) => x[0]);
    const pr = practiceRef(l.lesson);
    if (gen && !weDoQs.length && pr) weDoQs = [0, 1, 2].map((i) => deal(pr, partSeed(l.seed, 'wedo', i))).filter(Boolean);
    return { warmQs, weDoQs };
}

/** We do: the item's rung now (P-ON-7). Board: the plan's (item i at i+1); pupil: one down per item answered right. */
function startRung(i) {
    if (S.starts[i] !== undefined) return S.starts[i];
    const plan = partPlan('wedo').items;
    let r = (plan[i] && plan[i].rung) || 1;
    if (S.launch.mode === 'pupil') r = i === 0 ? 1 : Math.max(1, Math.min(3, startRung(i - 1) + (S.checked[`wedo:${i - 1}`] === 'right' ? 1 : 0)));
    S.starts[i] = r;
    return r;
}
function rungOf(i) { return S.rungs[i] !== undefined ? S.rungs[i] : startRung(i); }
function wordsOf(i) { const it = partPlan('wedo').items[i] || {}; return rungOf(i) >= 3 ? RUNG3_WORDS : (it.sentence || ''); }

function syncButtons(r) {
    const item = isItemPart(S.part);
    const show = (a, on) => { const b = r.querySelector(`.mq-lp-bar [data-act="${a}"]`); if (b) b.hidden = !on; };
    show('hint', S.part === 'wedo');
    show('check', item);
    show('show', item && S.launch.mode === 'board');
    if (S.part === 'wedo') {
        const i = S.pos.wedo || 0;
        const hb = r.querySelector('.mq-lp-bar [data-act="hint"]');
        // (P-ON-7: after two wrong Checks the app offers "Show me" - rung 1 for that item)
        hb.textContent = (S.wrongs[`wedo:${i}`] || 0) >= 2 && rungOf(i) > 1 ? 'Show me' : 'Hint';
        hb.disabled = rungOf(i) <= 1;
    }
}

/** Hint (H; the board's rung control): one rung more help on this item; never writes into a box (P-ON-8). */
function hint() {
    if (!S || S.part !== 'wedo') return;
    try { stopSpeaking(); } catch (e) { /* no speech */ }
    const i = S.pos.wedo || 0;
    if (rungOf(i) <= 1) return;
    keepVals();
    // (P-ON-7, critic s2 r1 F3: after two wrong Checks the control is "Show me" - rung 1 for that item, not one rung down)
    S.rungs[i] = (S.wrongs[`wedo:${i}`] || 0) >= 2 ? 1 : rungOf(i) - 1;
    render();
    if (S.launch.mode === 'pupil') { const t = wordsOf(i); try { speakExplanation(t); } catch (e) { /* no voice */ } }
}

function cellInputs() { const r = rootEl(); return r ? [...r.querySelectorAll('.mq-lp-cell input.mq-lp-in')] : []; }
function keepVals() { if (S && isItemPart(S.part)) S.vals[`${S.part}:${S.pos[S.part] || 0}`] = cellInputs().map((x) => x.value); }
const valueOf = () => cellInputs().map((x) => x.value.trim()).join('');
// (the digit boxes of an answer slot, right-aligned: the right-most is the ones box)
const PLACE_NAMES = ['ones', 'tens', 'hundreds', 'thousands', 'ten thousands'];
const digitBoxes = () => { const ins = cellInputs(); return ins.length > 1 && ins.every((x) => x.dataset.digit === '1') ? ins : null; };

/**
 * Critic s2 r1 F1: an answer in digit boxes is judged PER COLUMN - each box against its own place (a ones digit typed into
 * the tens box is wrong, and a box the answer does not use is right only when blank); one box judges the whole value.
 * Returns {right, wrongs: [{place, why}]} (why: 'empty' | 'extra' | 'digit').
 */
function judge(ans) {
    const dig = digitBoxes();
    if (!dig) { const v = valueOf(); return { right: String(ans).trim() === v || (v !== '' && Number(v) === Number(ans)), wrongs: [] }; }
    const wrongs = [];
    dig.forEach((x, j) => {
        const want = String(x.dataset.want || ''), v = x.value.trim();
        if (v === want) return;
        wrongs.push({ place: PLACE_NAMES[dig.length - 1 - j] || 'digit', why: !v ? 'empty' : !want ? 'extra' : 'digit' });
    });
    return { right: !wrongs.length, wrongs };
}

/** Critic s2 r1 F6: the wrong answer told in words (never by colour), naming each box by its place. */
function wrongWords(wrongs) {
    if (!wrongs.length) return '';
    const say = (w) => (w.why === 'empty' ? `the ${w.place} box is empty` : w.why === 'extra' ? `the ${w.place} box should be empty` : `the ${w.place} digit is not right`);
    const parts = wrongs.slice().reverse().map(say);
    const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
    return `${list.charAt(0).toUpperCase()}${list.slice(1)}.`;
}

/** The whole wrong-answer message of an item (words only; the strip adds the drawn cross). */
function wrongMsg(wrongs, part, it) {
    // (short enough for one line on the board: the strip's height is reserved from the start, fitItem)
    const miss = part === 'warmup' && it && it.ifMissed ? ` If missed: lesson ${it.ifMissed.lesson}, “${it.ifMissed.title || it.ifMissed.lesson}”.` : '';
    return `Not yet. ${[wrongWords(wrongs), `Fix the box with the cross${part === 'wedo' ? ', or ask for a hint' : ''}.`].filter(Boolean).join(' ')}${miss}`;
}

/** SP-32: the caret's box - after a wrong Check the right-most wrong box, else the ones box (the right-most). */
function caretBox() {
    const ins = cellInputs();
    if (!ins.length) return null;
    const byRight = ins.slice().sort((a, b) => a.getBoundingClientRect().right - b.getBoundingClientRect().right);
    const wrong = byRight.filter((x) => x.dataset.mqLp === 'bad');
    return wrong.length ? wrong[wrong.length - 1] : byRight[byRight.length - 1];
}
function focusCaret(select) {
    const b = caretBox();
    if (!b) return;
    try { b.focus({ preventScroll: true }); if (select) b.select(); } catch (e) { /* no focus */ }
}

/** Check (Enter): the whole answer judged; right / wrong in chrome (SP-33); a wrong one keeps the rung (P-ON-7). */
function checkItem() {
    if (!S || !isItemPart(S.part)) return;
    const i = S.pos[S.part] || 0;
    const it = partPlan(S.part).items[i] || {};
    const k = `${S.part}:${i}`;
    const v = valueOf();
    if (!v) { feedback('Type your answer first.', ''); focusCaret(false); return; }
    const jd = judge(it.ans);
    const right = jd.right;
    S.checked[k] = right ? 'right' : 'wrong';
    if (!right) S.wrongs[k] = (S.wrongs[k] || 0) + 1;
    keepVals();
    cellInputs().forEach((x) => markInput(x, true));
    const cell = rootEl().querySelector('.mq-lp-cell');
    if (cell) cell.closest('.mq-lp-cellwrap').dataset.verdict = S.checked[k];
    feedback(right ? 'Right!' : wrongMsg(jd.wrongs, S.part, it), right ? 'right' : 'wrong');
    syncButtons(rootEl());
    if (!right && S.launch.mode === 'pupil') focusCaret(true);
}

/** Show answer (A, board only): the teacher's reveal - the answer written in the boxes, marked as shown. */
function showAnswer() {
    if (!S || !isItemPart(S.part) || S.launch.mode !== 'board') return;
    const i = S.pos[S.part] || 0;
    const it = partPlan(S.part).items[i] || {};
    fillBoxes(cellInputs(), String(it.ans));
    S.shown[`${S.part}:${i}`] = true;
    keepVals();
    cellInputs().forEach((x) => { x.dataset.mqShown = '1'; markInput(x, false); });
    feedback(`The answer is ${it.ans}.`, 'shown');
}

function fillBoxes(ins, val) {
    if (ins.length === 1) { ins[0].value = val; return; }
    const pad = ins.length - val.length;
    ins.forEach((e, j) => { e.value = j >= pad ? val.charAt(j - pad) : ''; });
}

function feedback(text, kind) {
    const fb = rootEl() && rootEl().querySelector('.mq-lp-fb');
    if (!fb) return;
    fb.hidden = false;
    // (critic s2 r1 F6: a right / wrong verdict carries a drawn tick / cross beside its words - never colour alone)
    const mark = kind === 'right' ? BADGE_OK : kind === 'wrong' ? BADGE_BAD : '';
    fb.innerHTML = mark ? `<span class="mq-lp-fbmark" data-fb-mark="${kind}" aria-hidden="true">${mark}</span>` : '';
    const sp = document.createElement('span');
    sp.className = 'mq-lp-fbtext';
    sp.textContent = text;
    fb.appendChild(sp);
    fb.dataset.kind = kind || '';
    if (S && isItemPart(S.part)) S.fb = Object.assign(S.fb || {}, { [`${S.part}:${S.pos[S.part] || 0}`]: { text, kind } });
}

const BADGE_OK = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10.5l4.2 4.2L16.5 5.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const BADGE_BAD = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

/**
 * The live mark of one box (SP-31, Guided items: as typed). A digit box judges its own place (the answer right-aligned in
 * the boxes); a whole-answer box judges a finished value, and a prefix still being typed stays unmarked. `final`: the
 * Check's judgement (a prefix is then wrong). The mark is chrome: an outline and a badge outside the box (SP-30).
 */
function markInput(el, final) {
    const want = String(el.dataset.want || '');
    const v = el.value.trim();
    let m = '';
    if (v) {
        if (el.dataset.digit === '1') m = v === want ? 'ok' : 'bad';
        else m = v === want ? 'ok' : (!final && want.startsWith(v)) ? '' : 'bad';
    } else if (final && want) m = 'bad';
    el.dataset.mqLp = m;
    const host = el.parentElement;
    let b = host && host.querySelector(`[data-ws-feedback][data-for="${el.id}"]`);
    if (!m) { if (b) b.remove(); return; }
    if (!b && host) { b = document.createElement('span'); b.className = 'mq-lp-badge'; b.setAttribute('data-ws-feedback', ''); b.dataset.for = el.id; b.setAttribute('aria-hidden', 'true'); host.appendChild(b); }
    if (b) { b.dataset.mark = m; b.innerHTML = m === 'ok' ? BADGE_OK : BADGE_BAD; }
}

/** The answer slot of a kit drawing becomes the pupil's input(s) in place: one per digit place where the slot has them. */
function adoptSlots(root, want, part, i) {
    const slots = [...root.querySelectorAll('[data-ws-slot]')].filter((e) => /^(ans|answer)$/.test(e.getAttribute('data-ws-slot')));
    const slot = slots[0];
    if (!slot) return 0;
    const places = [...slot.children].filter((c) => c.tagName === 'SPAN' && !c.children.length && !c.textContent.trim());
    const mk = (id, label, digit, wantV, max) => {
        const inp = document.createElement('input');
        inp.type = 'text'; inp.className = 'mq-lp-in'; inp.id = id;
        inp.setAttribute('inputmode', 'numeric'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('maxlength', String(max));
        inp.setAttribute('aria-label', label);
        inp.dataset.want = wantV; if (digit) inp.dataset.digit = '1';
        inp.addEventListener('input', () => {
            inp.value = inp.value.replace(/[^0-9]/g, '').slice(0, max); markInput(inp, false); keepVals();
            // (column entry, ones first: a digit typed moves the caret to the next place on the left, if any)
            if (digit && inp.value && inp.isConnected) { const ins = cellInputs(); const j = ins.indexOf(inp); if (j > 0) { try { ins[j - 1].focus({ preventScroll: true }); ins[j - 1].select(); } catch (e) { /* no focus */ } } }
        });
        return inp;
    };
    const w = String(want);
    slot.classList.add('mq-lp-slot');
    if (places.length >= w.length && places.length > 1) {
        slot.classList.add('mq-lp-slot-digits');
        const pad = places.length - w.length;
        places.forEach((sp, j) => { sp.classList.add('mq-lp-place'); sp.appendChild(mk(`mqlp-${part}-${i}-${j}`, `answer, digit ${j + 1} of ${places.length}`, true, j >= pad ? w.charAt(j - pad) : '', 1)); });
        return places.length;
    }
    slot.textContent = '';
    slot.classList.add('mq-lp-slot-one');
    slot.appendChild(mk(`mqlp-${part}-${i}-0`, 'answer', false, w, Math.max(2, w.length)));
    return 1;
}

/** The drawing of an item at its rung (We do: the printed Guided cell - rung 1 its cell 1, step 1's marks grey). */
function itemDrawing(part, i, rung) {
    const it = S.hosts[part][i];
    if (!it) return '';
    const ctx = drawCtx();
    let html = '';
    try { html = part === 'wedo' ? weDoRender(it, rung <= 1 ? 0 : 1, 170)(ctx, { cols: 2 }) : it.render(ctx, { cols: 2 }); } catch (e) { console.warn('[lesson-player] item', e); return ''; }
    // (critic s2 r1 F4: rung 1 = the chart's state 1 - step 1's marks only; the dot card is step 2's cue, so it keeps its
    // room (no black mark moves between rungs) but is not drawn)
    if (part === 'wedo' && rung <= 1) html = html.replace(/class="mq-cue(?=[ "])/g, 'class="mq-cue mq-lp-cue-off');
    return screenBond(html);
}

/**
 * Critic s2 r1 F5: a number bond on the board, compact - the part boxes 0.35 of a box under the whole (paper 0.9) and the
 * digits 0.75 of a box (paper 0.52; RP-60 fixes neither), so the bond reaches the signed board digit with room under it
 * at 1366 x 768. Screen only: the printed bond is untouched.
 */
function screenBond(html) {
    if (!/viewBox="0 0 4\.2 2\.9"/.test(html)) return html;
    const U = '([0-9.]+mm|var\\(--mq-bond, [0-9.]+mm\\))';
    return html.replace(/viewBox="0 0 4\.2 2\.9"/g, 'viewBox="0 0 4.2 2.35"')
        .replace(/ y2="1\.9"/g, ' y2="1.35"')
        .replace(new RegExp(`height:calc\\(${U} \\* 2\\.9\\)`, 'g'), 'height:calc($1 * 2.35)')
        .replace(new RegExp(`top:calc\\(${U} \\* 1\\.9\\)`, 'g'), 'top:calc($1 * 1.35)')
        .replace(new RegExp(`font-size:calc\\(${U} \\* 0\\.52\\)`, 'g'), 'font-size:calc($1 * 0.75)');
}

function renderItem(r, part) {
    const st = r.querySelector('.mq-lp-stage');
    const pp = partPlan(part);
    const n = pp.items.length;
    const i = Math.min(S.pos[part] || 0, Math.max(0, n - 1));
    S.pos[part] = i;
    const it = pp.items[i] || {};
    st.className = `mq-lp-stage mq-lp-stage-item mq-lp-stage-${part}`;
    if (!n) { st.innerHTML = '<div class="mq-lp-msg"><h2>No items</h2><p>This lesson deals nothing for this part.</p></div>'; setBar(''); return; }
    const rung = part === 'wedo' ? rungOf(i) : 0;
    const instr = part === 'wedo' ? (pp.instr || '') : (it.instr || plainQ(it.text));
    const ido = idoPart();
    const stepsHtml = part === 'wedo' && ido.steps.length ? `<aside class="mq-lp-steps" aria-label="Steps"><h2>Steps</h2><ol>${ido.steps.map((s0, j) => {
        const now = rung >= 3 && j === (it.hintStep || 0);
        return `<li class="mq-lp-step${now ? ' is-now' : ''}"${now ? ' aria-current="step"' : ''}><span class="mq-lp-n">${stepMarker(j + 1)}</span><span class="mq-lp-t">${esc(s0.name)}</span></li>`;
    }).join('')}</ol>${ido.chant ? `<p class="mq-lp-chant"><b>Rule:</b> ${esc(ido.chant)}</p>` : ''}</aside>` : '';
    const words = part === 'wedo' ? `<div class="mq-lp-side"><div class="mq-lp-wordsbox"><p class="mq-lp-words">${esc(wordsOf(i))}</p></div></div>` : '';
    const k = `${part}:${i}`;
    st.innerHTML = `${stepsHtml}
<section class="mq-lp-cellwrap"${S.checked[k] ? ` data-verdict="${S.checked[k]}"` : ''}>
  <div class="mq-scell mq-lp-cell mq-lp-qcell" role="group" aria-label="${esc(part === 'wedo' ? 'We do' : 'Warm-up')}, item ${i + 1} of ${n}" data-item="${i + 1}" data-rung="${rung}">
    ${instr ? `<div class="mq-lp-instr">${esc(instr)}</div>` : ''}
    <div class="mq-lp-work" data-variant="${part === 'wedo' ? 'row' : 'col'}">
      <div class="mq-lp-group"><div class="mq-lp-draw">${kit(itemDrawing(part, i, rung))}</div>${words}</div>
    </div>
  </div>
  <div class="mq-lp-fb" aria-live="polite"></div>
</section>`;
    const draw = st.querySelector('.mq-lp-draw');
    adoptSlots(draw, it.ans, part, i);
    const saved = S.vals[k];
    if (saved) cellInputs().forEach((x, j) => { if (saved[j] !== undefined) x.value = saved[j]; });
    if (S.shown[k]) cellInputs().forEach((x) => { x.dataset.mqShown = '1'; });
    cellInputs().forEach((x) => markInput(x, !!S.checked[k]));
    const fbs = S.fb && S.fb[k];
    if (fbs) feedback(fbs.text, fbs.kind);
    else feedback(S.launch.mode === 'pupil' ? 'Type your answer, then press Check.' : (part === 'wedo' ? 'Work it together. Hint gives more help.' : 'Answer together, then Check.'), '');
    const label0 = `Item ${i + 1} of ${n}`;
    setBar(esc(label0));
    syncButtons(r);
    fullStage(r);
    fitItem(r, part, i);
    if (S.launch.mode === 'pupil' && pupilDesk()) { const c = r.querySelector('.mq-lp-cell'); if (c) trimBand(c); }
    if (S.launch.mode === 'pupil') fitPupilStage(r);
    // (pupil: the caret waits in the ONES box - the right-most (SP-32; critic s2 r1 F1), or the right-most wrong box after a
    // wrong Check; the board is the teacher's clicker - nothing takes the keys from it)
    if (S.launch.mode === 'pupil') focusCaret(S.checked[k] === 'wrong');
}

/**
 * Size an item part (one zoom for every rung of the item, so no mark moves and the cell never jumps): the drawing at the
 * signed digit size, up to +25 % to fill free room (A22), the words beside it where they fit, else under it. Board: the
 * cell takes the stage's height, its content centred; pupil: the cell is its content's height (the card).
 */
function fitItem(r, part, i) {
    const cell = r.querySelector('.mq-lp-cell');
    const wrap = r.querySelector('.mq-lp-cellwrap');
    const work = r.querySelector('.mq-lp-work');
    const zoomEl = r.querySelector('.mq-lp-draw > .mq-lp-zoom');
    if (!cell || !work || !zoomEl) return;
    const k = kOf(r);
    // the drawing's box and digit size at zoom 1, over every rung's drawing of this item (they keep one size)
    const sizer = document.createElement('div');
    sizer.className = 'mq-lp-sizer';
    sizer.style.cssText = 'position:absolute;left:-99999px;top:0;visibility:hidden;';
    const variants = part === 'wedo' ? [1, 2] : [0];
    sizer.innerHTML = variants.map((v) => `<div class="mq-lp-sz">${kit(itemDrawing(part, i, v))}</div>`).join('');
    r.appendChild(sizer);
    sizer.querySelectorAll('.mq-lp-sz').forEach((el) => adoptSlots(el, '0', 'sz', 0));
    let wD = 1, hD = 1, base = 0;
    sizer.querySelectorAll('.mq-lp-sz > .mq-lp-zoom').forEach((el) => { const q = el.getBoundingClientRect(); wD = Math.max(wD, q.width); hD = Math.max(hD, q.height); });
    for (const el of sizer.querySelectorAll('*')) {
        const own = el.tagName === 'INPUT' || [...el.childNodes].some((c) => c.nodeType === 3 && /\d/.test(c.nodeValue));
        if (own) base = Math.max(base, parseFloat(getComputedStyle(el).fontSize) || 0);
    }
    if (!(base > 0)) base = basePxOf();
    const want = digitTarget(r) / base;
    // (D5 targets: a digit box is >= 48 px wide at the least zoom the item may take - the digit tracks of the drawing widen on
    // screen where 0.72 em would be narrower; the sum's columns stay lined up, SP-12a spacing may differ)
    const minW = (r.dataset.mode === 'pupil' ? 48 : 64) / want;
    sizer.querySelectorAll('.mq-lp-sz').forEach((el) => widenPlaces(el, minW));
    widenPlaces(r.querySelector('.mq-lp-draw'), minW);
    // (a tall stage - a tablet held upright - puts a counting picture's answer box under the picture, not beside it)
    // (critic s2 r1 F7: pupil mode on a computer too - the card fills the stage, so the box under the picture fills it best)
    const portrait = wrap.clientHeight > wrap.clientWidth * 1.1 || (S.launch.mode === 'pupil' && pupilDesk());
    r.querySelectorAll('.mq-lp-draw, .mq-lp-sizer').forEach((el) => { if (portrait) el.dataset.portrait = '1'; else delete el.dataset.portrait; });
    wD = 1; hD = 1;
    sizer.querySelectorAll('.mq-lp-sz > .mq-lp-zoom').forEach((el) => { const q = el.getBoundingClientRect(); wD = Math.max(wD, q.width); hD = Math.max(hD, q.height); });
    sizer.remove();
    // (critic s2 r1 F5: a Warm-up drawing keeps 0.3 of a digit clear under its lowest ink - the bond's part boxes sat on the
    // cell's border)
    if (part === 'warmup') hD += 0.3 * base;
    const cap = want * 1.25;
    const fb = r.querySelector('.mq-lp-fb');
    // (critic s2 r1 F2: the feedback strip keeps the height of the LONGEST message this item can show from the start, so a
    // wrong Check's longer words never shrink the cell - no black mark moves on Check, Hint or Show me)
    let fbH = 0;
    if (fb) {
        const keep = { html: fb.innerHTML, kind: fb.dataset.kind || '' };
        fb.style.minHeight = '';
        let hm = fb.getBoundingClientRect().height;
        const n = cellInputs().length;
        const worst = Array.from({ length: Math.max(1, n) }, (x, j) => ({ place: PLACE_NAMES[j] || 'digit', why: 'extra' }));
        const it = partPlan(part).items[i] || {};
        for (const t of [wrongMsg(n > 1 ? worst : [], part, it), wrongMsg([], part, it)]) {
            fb.dataset.kind = 'wrong';
            fb.innerHTML = `<span class="mq-lp-fbmark">${BADGE_BAD}</span><span class="mq-lp-fbtext"></span>`;
            fb.lastChild.textContent = t;
            hm = Math.max(hm, fb.getBoundingClientRect().height);
        }
        fb.innerHTML = keep.html; fb.dataset.kind = keep.kind;
        fb.style.minHeight = `${Math.ceil(hm)}px`;
        fbH = Math.ceil(hm) + parseFloat(getComputedStyle(wrap).rowGap || 0);
    }
    cell.style.height = '';
    const instrEl = cell.querySelector('.mq-lp-instr');
    const instrH = instrEl ? instrEl.getBoundingClientRect().height : 0;
    const wcs = getComputedStyle(work);
    const padX = parseFloat(wcs.paddingLeft) + parseFloat(wcs.paddingRight), padY = parseFloat(wcs.paddingTop) + parseFloat(wcs.paddingBottom);
    const bw = 2 * (parseFloat(getComputedStyle(cell).borderTopWidth) || 0);
    const availW = cell.clientWidth - padX;
    const stageH = wrap.clientHeight;
    const availH = stageH - fbH - instrH - padY - bw;
    const side = r.querySelector('.mq-lp-side');
    const wb = r.querySelector('.mq-lp-wordsbox');
    const gap = 32 * k;
    // (critic s2 r1 F2: the words column is sized for EVERY rung's words of the item - the sentence and "What comes next?" -
    // so its width, and the centred group with it, never change when the rung does: no black mark moves)
    const wordsNow = wb ? wb.innerHTML : '';
    const pi = part === 'wedo' ? (partPlan('wedo').items[i] || {}) : {};
    const wordSets = wb ? [...new Set([pi.sentence || '', RUNG3_WORDS, wordsOf(i)].filter(Boolean))].map((t) => `<p class="mq-lp-words">${esc(t)}</p>`) : [];
    const wordsAt = (w) => { if (!wb) return 0; wb.style.width = `${Math.max(40, Math.floor(w))}px`; let hh = 0; wordSets.forEach((x) => { wb.innerHTML = x; hh = Math.max(hh, wb.getBoundingClientRect().height); }); wb.innerHTML = wordsNow; return hh; };
    let natW = 0;
    if (wb) { wb.style.width = 'max-content'; wordSets.forEach((x) => { wb.innerHTML = x; natW = Math.max(natW, wb.getBoundingClientRect().width + 2); }); wb.innerHTML = wordsNow; }
    let best = null;
    for (let z = cap; z >= 0.2; z *= 0.985) {
        const dw = wD * z, dh = hD * z;
        if (dw > availW + 0.5) continue;
        if (wb) {
            const sw = Math.min(natW, availW - gap - dw);
            if (sw >= Math.min(natW, 220 * k)) { const h = Math.max(dh, wordsAt(sw)); if (h <= availH + 0.5) { best = { z, stack: false, sw, h }; break; } }
            const sh = wordsAt(Math.min(availW, Math.max(dw, natW)));
            if (dh + 14 * k + sh <= availH + 0.5) { best = { z, stack: true, sw: Math.min(availW, Math.max(dw, natW)), h: dh + 14 * k + sh }; break; }
            continue;
        }
        if (dh <= availH + 0.5) { best = { z, stack: false, sw: 0, h: dh }; break; }
    }
    if (!best) best = { z: 0.2, stack: true, sw: availW, h: hD * 0.2 };
    if (best.stack) work.dataset.stack = '1'; else delete work.dataset.stack;
    zoomEl.style.zoom = String(+best.z.toFixed(4));
    const draw = r.querySelector('.mq-lp-draw');
    draw.style.width = `${Math.ceil(wD * best.z)}px`;
    draw.style.height = `${Math.ceil(hD * best.z)}px`;
    if (side && wb) { side.style.width = `${Math.ceil(best.sw)}px`; wb.style.width = `${Math.ceil(best.sw)}px`; wb.style.minHeight = `${Math.ceil(wordsAt(best.sw))}px`; }
    const contentH = Math.ceil(best.h + instrH + padY + bw) + 2;
    // board: the cell fills the stage (its content centred); pupil: the card, its content's height - on a computer (critic s2
    // r1 F7, as A22b) the card grows into the stage too, up to 2.2 x its content (each band around the centred content < 30 %)
    const full = stageH - fbH;
    cell.style.height = `${Math.floor(S.launch.mode !== 'pupil' ? full : pupilDesk() ? Math.min(full, Math.max(contentH, contentH * 2.2)) : Math.min(contentH, full))}px`;
    r.dataset.digitPx = String(Math.round(base * best.z));
    r.dataset.digitTarget = String(Math.round(digitTarget(r)));
}

/** Pupil mode is the card (D5): the stage holds its content's height, centred on the page - no stage of empty room. */
/** Widen a fact's digit tracks so each digit box is at least `minPx` wide at zoom 1 (0.72 em on paper). */
function widenPlaces(root, minPx) {
    if (!root) return;
    root.querySelectorAll('.ws-fact').forEach((f) => {
        const fd = parseFloat(getComputedStyle(f).fontSize) || 0;
        if (!(fd > 0) || 0.72 * fd >= minPx) return;
        const em = (minPx / fd + 0.02).toFixed(3);
        const fix = (el) => { const g = el.style.gridTemplateColumns; if (g && /0\.72em/.test(g)) el.style.gridTemplateColumns = g.replace(/0\.72em/g, `${em}em`); };
        fix(f);
        f.querySelectorAll('[style*="grid-template-columns"]').forEach(fix);
    });
}

/** Pupil mode sizes against the whole stage row first (the card then shrinks to its content: fitPupilStage). */
function fullStage(r) {
    const st = r.querySelector('.mq-lp-stage');
    if (!st) return;
    if (r.dataset.mode !== 'pupil') { st.style.height = ''; return; }
    const top = r.querySelector('.mq-lp-top'), bar = r.querySelector('.mq-lp-bar');
    st.style.height = `${Math.max(200, r.clientHeight - (top ? top.offsetHeight : 0) - (bar ? bar.offsetHeight : 0))}px`;
}

function fitPupilStage(r) {
    const st = r.querySelector('.mq-lp-stage');
    if (!st) return;
    const cs = getComputedStyle(st);
    const top = st.getBoundingClientRect().top + parseFloat(cs.paddingTop);
    let bottom = top;
    st.querySelectorAll('.mq-lp-steps, .mq-lp-cell, .mq-lp-fb').forEach((el) => { bottom = Math.max(bottom, el.getBoundingClientRect().bottom); });
    st.style.height = `${Math.ceil(bottom - top + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom))}px`;
}

export default { openLessonPlayer, closeLessonPlayer, lessonPlayerState };
