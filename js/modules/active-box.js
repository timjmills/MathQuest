// The NEXT answer box pulses yellow (owner, 2026-10-04: "all boxes to put answers should pulse yellow
// when an answer needs to be put"). One rule for every answer box on the three pupil screens — the
// practice card, the online worksheet's current problem and the quiz question — whatever widget drew it.
//
// The active box is the answer input the pupil is in; when focus is elsewhere, it is the first empty
// answer input in reading order. Optional regroup / carry boxes pulse only while the pupil is in them,
// and a box already marked right never pulses. The look lives in css/screen-cell.css (.mq-active-box).
// Screen only: print never runs this.

const HOSTS = '#questionCard, .online-edition .problem-card.mq-active-problem, .qt-question-card';
// The enlarge (zoom) pop-up copies a problem's answer boxes; while it is open it is the ONLY host.
const POPUP = '.zoom-overlay .zoom-content';
const TYPING = 'input, textarea, select, [contenteditable="true"]';
const SKIP_TYPES = new Set(['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color']);
const OPTIONAL = /carry|regroup/i;
const isOptional = (el) => OPTIONAL.test(el.className) || /regroup|carry/i.test((el.closest('[data-mq-kind]') || el).getAttribute('data-mq-kind') || '');
const DIGIT = 'input.mq-digit, input.column-answer-input';

// Column digits are written ones first (SP-20, wireStackEntry): within one row of one stack the
// next box is the RIGHTMOST empty one, so each row's digit boxes are listed right to left.
function entryOrder(boxes) {
    const out = [];
    for (let i = 0; i < boxes.length; i++) {
        const el = boxes[i];
        if (!el.matches(DIGIT) || isOptional(el)) { out.push(el); continue; }
        const stack = el.closest('.ws-stack, .column-problem, [data-mq-cell]') || el.parentElement;
        const top = Math.round(el.getBoundingClientRect().top);
        const run = [el];
        while (i + 1 < boxes.length) {
            const nx = boxes[i + 1];
            if (!nx.matches(DIGIT) || isOptional(nx) || Math.round(nx.getBoundingClientRect().top) !== top
                || (nx.closest('.ws-stack, .column-problem, [data-mq-cell]') || nx.parentElement) !== stack) break;
            run.push(nx); i++;
        }
        out.push(...run.reverse());
    }
    return out;
}

function isAnswerBox(el) {
    if (!el || el.disabled || el.readOnly) return false;
    if (el.closest('.mq-work-area, [data-mq-no-pulse]')) return false;   // scratch work areas are not answers
    if (el.isContentEditable) return el.getAttribute('contenteditable') === 'true';
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag !== 'INPUT') return false;
    if (SKIP_TYPES.has((el.type || 'text').toLowerCase())) return false;
    return !el.closest('.qt-name-row, .qt-header, [data-mq-no-pulse]') && !el.matches('.qt-name-input');
}

function visible(el) {
    const b = el.getBoundingClientRect();
    if (b.width < 4 || b.height < 4) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    // a box hidden under ANOTHER typing box (a widget's twin input drawn on top of it) is not the one
    // the pupil sees: the one on top is
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    if (x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight) {
        const top = document.elementFromPoint(x, y);
        if (top && top !== el && !el.contains(top) && top.matches && top.matches('input, textarea, [contenteditable="true"]')) return false;
    }
    return true;
}

function valueOf(el) { return el.isContentEditable ? (el.textContent || '').trim() : String(el.value || '').trim(); }

function pickActive(host) {
    const boxes = [...host.querySelectorAll('input, textarea, [contenteditable="true"]')].filter(isAnswerBox).filter(visible);
    if (!boxes.length) return { boxes, active: null };
    const ae = document.activeElement;
    if (ae && boxes.includes(ae) && !ae.classList.contains('mq-live-correct')) return { boxes, active: ae };
    // A word-problem box the pupil copies a story number into, where that place holds no digit
    // (data-mq-expect=""), must stay blank — pulsing it would invite a wrong digit (critic D6). Only
    // these copy boxes: skipping blank ANSWER boxes would reveal how many digits the answer has.
    const mustStayBlank = (el) => el.matches('input.mq-wwork') && el.getAttribute('data-mq-expect') === '';
    const next = entryOrder(boxes).find(el => !valueOf(el) && !isOptional(el) && !mustStayBlank(el) && !el.classList.contains('mq-live-correct'));
    return { boxes, active: next || null };
}

let queued = false;
const visibleHost = (h) => h.offsetParent !== null || h.getClientRects().length > 0;

// Nothing else is in the way: the point at the middle of the box is the box itself (no pop-up,
// hint or celebration covers it), and it is on screen.
function onScreen(el) {
    const b = el.getBoundingClientRect();
    const x = b.left + b.width / 2, y = b.top + b.height / 2;
    return x >= 0 && y >= 0 && x <= innerWidth && y <= innerHeight;
}
function uncovered(el) {
    const b = el.getBoundingClientRect();
    const top = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return !!top && (top === el || el.contains(top));
}
// Chromebook fit (css/play-compact.css): on a short screen Check / Next stay pinned to the bottom
// edge (position: sticky) and the worksheet's bar to the top. A box that has scrolled under such a
// bar is not covered by a pop-up: it is off screen in all but name, so it is scrolled to like one.
const PINNED = '#questionCard > .mq-qactions, #questionCard > .next-btn-container, #quizTakeView .qt-nav, #worksheetView > .game-header';
function underPinnedBar(el) {
    const b = el.getBoundingClientRect();
    for (const bar of document.querySelectorAll(PINNED)) {
        if (bar.contains(el) || getComputedStyle(bar).position !== 'sticky') continue;
        const r = bar.getBoundingClientRect();
        if (r.height > 0 && b.bottom > r.top + 1 && b.top < r.bottom - 1 && b.right > r.left && b.left < r.right) return true;
    }
    return false;
}

// The next box is SELECTED, not only lit (owner 2026-10-04): when no typing place has the focus —
// on load, after a re-render, or when the pupil taps a blank part of the screen — the pulsing box
// takes it, so typing always lands there. A pupil who taps a button, another box or a pop-up keeps
// that focus. A count-by row on a phone manages its own focus (it holds back a box the start does
// not show), so its boxes are never auto-focused here.
// The pupil's last tap. A tap on a widget (a tile, a dot, a coin, a drawing) is the pupil working
// THERE: focus is not pulled back into a typing box for it (critic R4-1), and a box off screen is
// never scrolled to after a tap — only on load or a re-render (critic R4-2).
let lastTap = { t: 0, target: null };
let lastInput = { t: 0, el: null };
const swipeOffered = new WeakSet();
function isTapTarget(el) {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
        if (n.matches && n.matches(HOSTS + ', ' + POPUP)) return false;
        if (n.matches && n.matches('[onclick], [draggable="true"], [role="button"], [role="option"], svg, label, button, a[href], select')) return true;
        const c = getComputedStyle(n).cursor;
        if (c === 'pointer' || c === 'grab' || c === 'grabbing' || c === 'move') return true;
    }
    return false;
}

// A box can be selected while it is on screen and then be pushed under a pinned bar or below the
// fold as the page settles (fonts, a late re-fit, a legacy visual scaling itself). For its first 4 s,
// and only while the pupil has not tapped or scrolled, the focused box is kept in view.
let activeEl = null;
let activeSig = '';
let activeSince = 0;
let lastUserScroll = 0;
function revealSettled(active) {
    if (Date.now() - activeSince > 4000) return;
    if (lastTap.t > activeSince || lastUserScroll > activeSince) return;
    if (onScreen(active) && !underPinnedBar(active)) return;
    try { active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ }
}

function selectIfLoose(active) {
    // a new box, or the same box under a new question (#answerInput is reused from item to item)
    const paper = active.closest('#questionPaper, .mq-qtpaper, .mq-wspaper, ' + HOSTS);
    const sig = paper ? paper.textContent : '';
    if (active !== activeEl || sig !== activeSig) { activeEl = active; activeSig = sig; activeSince = Date.now(); }
    if (document.activeElement === active) { revealSettled(active); return; }
    const sinceTap = Date.now() - lastTap.t;
    // a tap on a widget IN the problem keeps the pupil there; a tap on chrome outside it (the quiz's
    // Next, a nav button that re-rendered the question) does not hold the new box back (critic CF-D3)
    const tapIn = lastTap.target && lastTap.target.isConnected && lastTap.target.closest && lastTap.target.closest(HOSTS + ', ' + POPUP);
    if (sinceTap < 800 && tapIn && isTapTarget(lastTap.target)) return;
    const ae = document.activeElement;
    // the box the pupil has just filled RIGHT (it turned green as they typed) hands the caret on to the
    // next box, so the next number goes where it belongs (owner 2026-10-04: "move to the blank box")
    const justRight = ae && ae !== active && ae.classList && ae.classList.contains('mq-live-correct')
        && ae === lastInput.el && Date.now() - lastInput.t < 1500;
    if (justRight) {
        try { active.focus({ preventScroll: !onScreen(active) ? false : true }); } catch (e) { /* ignore */ }
        return;
    }
    if (ae && ae !== document.body && ae !== document.documentElement && ae.matches) {
        if (ae.matches(TYPING) || ae.matches('button, a[href], select')) return;          // the pupil chose that
        // a focusable WRAPPER (a card, a cell) is a blank part of the problem: it does not hold the focus
        const inProblem = ae.closest(HOSTS + ', ' + POPUP) || ae.matches(HOSTS + ', ' + POPUP);
        if (ae.matches('[tabindex]:not([tabindex="-1"]), [role="button"]') && !inProblem) return;
    }
    // A count-by row manages its own focus: it accepts a box its start shows and holds back one it
    // does not (then the first digit typed goes there). Offer each such box the focus ONCE, so the row
    // can make that choice — a refusal must not be retried every frame.
    if (active.closest('[data-mq-swiperow]')) {
        if (swipeOffered.has(active)) return;
        swipeOffered.add(active);
        try { active.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
        return;
    }
    // a box below the fold is scrolled to (gently, to its nearest edge); one on screen must not be covered
    if (onScreen(active) && !underPinnedBar(active)) {
        if (!uncovered(active)) return;
        try { active.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
    } else {
        if (sinceTap < 1500 && tapIn) return;   // the pupil scrolled away and tapped in the problem: leave the page where they put it
        try { active.focus({ preventScroll: true }); active.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ }
    }
}

// A FULL box hands the caret on (critic placevalue-phones D1, "the lost 0"): when the box the pupil
// is typing in holds its whole digit count (its maxlength) after their own keystroke, the caret moves
// to the next empty answer box of the same problem, in entry order (ones first in a column). This is
// on every host and whether the digit is right or wrong: it reveals nothing, it only stops the next
// digit joining a box that cannot take it. Only boxes with a fixed digit count (maxlength) move on;
// a box whose answer may be longer never does, except a count-by box, which carries its number's digit count. A widget
// that has already moved the caret itself is left alone.
function advanceIfFull(el) {
    if (!el || el !== document.activeElement || el.tagName !== 'INPUT' || !isAnswerBox(el)) return;
    // A count-by box knows its own number's digit count (data-mq-full, count-row.js): it is full when that many digits are in it
    // (small fixes item 1: in the quiz "21" then "28" joined as "2128"). Its maxlength stays wider (a pupil may still write more).
    const full = Number(el.dataset.mqFull) || 0;
    const max = full || el.maxLength;
    const len = full ? String(el.value || '').replace(/\D/g, '').length : String(el.value || '').length;
    if (!(max > 0) || len < max) return;
    // other boxes in a count-by row keep the row's own focus rule; a box that knows its count moves on, and the row treats a
    // focus coming from one of its own boxes as the pupil's move (screen-cell.js wireSwipeRows: it scrolls the next box into view)
    if (el.closest('[data-mq-swiperow]') && !full) return;
    const host = el.closest(POPUP) || el.closest(HOSTS);
    if (!host) return;
    const boxes = entryOrder([...host.querySelectorAll('input, textarea, [contenteditable="true"]')].filter(isAnswerBox).filter(visible));
    const i = boxes.indexOf(el);
    if (i < 0) return;
    const ok = (b) => !valueOf(b) && !isOptional(b) && !b.classList.contains('mq-live-correct')
        && !(b.matches('input.mq-wwork') && b.getAttribute('data-mq-expect') === '');
    const next = boxes.slice(i + 1).find(ok) || boxes.slice(0, i).find(ok);
    if (!next) return;
    // the browser scrolls the box into view unless ALL of it is on screen already (a box 1 px under the fold is scrolled to)
    const r = next.getBoundingClientRect();
    const whole = r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight && r.right <= innerWidth;
    try { next.focus({ preventScroll: whole && !underPinnedBar(next) }); } catch (e) { /* ignore */ }
    if (!whole || underPinnedBar(next)) { try { next.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ } }
}

export function refreshActiveBox() {
    if (typeof document === 'undefined') return;
    const popups = [...document.querySelectorAll(POPUP)].filter(visibleHost);
    const hosts = popups.length ? popups.slice(-1) : [...document.querySelectorAll(HOSTS)].filter(visibleHost);
    const keep = new Set();
    for (const host of hosts) {
        const { active } = pickActive(host);
        if (active) keep.add(active);
    }
    // Touch the class only when it changes: re-adding a class the box already has is still a DOM
    // mutation, which would wake the observer every frame (critic D1).
    document.querySelectorAll('.mq-active-box').forEach(el => { if (!keep.has(el)) el.classList.remove('mq-active-box'); });
    keep.forEach(el => { if (!el.classList.contains('mq-active-box')) el.classList.add('mq-active-box'); });
    if (keep.size === 1) selectIfLoose([...keep][0]);
}

function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; refreshActiveBox(); });
}

export function installActiveBox() {
    if (typeof document === 'undefined' || window.__mqActiveBoxInstalled) return;
    window.__mqActiveBoxInstalled = true;
    for (const ev of ['pointerdown', 'mousedown', 'touchstart', 'click']) document.addEventListener(ev, (e) => { lastTap = { t: Date.now(), target: e.target }; }, true);
    for (const ev of ['wheel', 'touchmove']) document.addEventListener(ev, () => { lastUserScroll = Date.now(); }, { capture: true, passive: true });
    document.addEventListener('keydown', (e) => { if (/^(PageUp|PageDown|Home|End|ArrowUp|ArrowDown)$/.test(e.key)) lastUserScroll = Date.now(); }, true);
    // only the box the pupil is typing in (widgets re-fire input on a hidden combined box afterwards)
    document.addEventListener('input', (e) => {
        if (e.target !== document.activeElement) return;
        lastInput = { t: Date.now(), el: e.target };
        // the pupil's own keystroke (not a script's re-fired input): after the widgets have run
        if (e.isTrusted) { const el = e.target; setTimeout(() => advanceIfFull(el), 0); }
    }, true);
    // A key typed while no typing place has the focus (after a hint pop-up closes, after a tap on a
    // button) goes into the pulsing box instead of being lost (critic R4-4). Count-by rows on a phone
    // have their own digit-key rule.
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey || !e.key || e.key.length !== 1 || e.key === ' ') return;
        const ae = document.activeElement;
        if (ae && ae.matches && ae.matches(TYPING)) return;
        // on a button, link or option only a digit or a letter goes to the box: Space, Enter and
        // punctuation keep pressing the control (switch-access and keyboard pupils, critic R5-1)
        if (ae && ae.matches && ae.matches('button, a[href], select, [role="button"], [role="option"]') && !/^[0-9a-z]$/i.test(e.key)) return;
        const box = document.querySelector('.mq-active-box');
        if (!box || box.closest('[data-mq-swiperow]') || !onScreen(box) || !uncovered(box)) return;
        try { box.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
    }, true);
    for (const ev of ['focusin', 'focusout', 'input', 'change', 'click']) document.addEventListener(ev, schedule, true);
    // Questions are re-rendered by many code paths; watch the DOM rather than hooking each one.
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'readonly', 'style'] });
    schedule();
}
