// The NEXT answer box pulses yellow (owner, 2026-10-04: "all boxes to put answers should pulse yellow
// when an answer needs to be put"). One rule for every answer box on the three pupil screens — the
// practice card, the online worksheet's current problem and the quiz question — whatever widget drew it.
//
// The active box is the answer input the pupil is in; when focus is elsewhere, it is the first empty
// answer input in reading order. Optional regroup / carry boxes pulse only while the pupil is in them,
// and a box already marked right never pulses. The look lives in css/screen-cell.css (.mq-active-box).
// Screen only: print never runs this.

const HOSTS = '#questionCard, .online-edition .problem-card.mq-active-problem, .qt-question-card';
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
    return cs.visibility !== 'hidden' && cs.display !== 'none';
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
export function refreshActiveBox() {
    if (typeof document === 'undefined') return;
    const hosts = [...document.querySelectorAll(HOSTS)].filter(h => h.offsetParent !== null || h.getClientRects().length);
    const keep = new Set();
    for (const host of hosts) {
        const { active } = pickActive(host);
        if (active) keep.add(active);
    }
    // Touch the class only when it changes: re-adding a class the box already has is still a DOM
    // mutation, which would wake the observer every frame (critic D1).
    document.querySelectorAll('.mq-active-box').forEach(el => { if (!keep.has(el)) el.classList.remove('mq-active-box'); });
    keep.forEach(el => { if (!el.classList.contains('mq-active-box')) el.classList.add('mq-active-box'); });
}

function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; refreshActiveBox(); });
}

export function installActiveBox() {
    if (typeof document === 'undefined' || window.__mqActiveBoxInstalled) return;
    window.__mqActiveBoxInstalled = true;
    for (const ev of ['focusin', 'focusout', 'input', 'change', 'click']) document.addEventListener(ev, schedule, true);
    // Questions are re-rendered by many code paths; watch the DOM rather than hooking each one.
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'readonly', 'style'] });
    schedule();
}
