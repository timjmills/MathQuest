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
    const next = boxes.find(el => !valueOf(el) && !OPTIONAL.test(el.className) && !el.classList.contains('mq-live-correct'));
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
    document.querySelectorAll('.mq-active-box').forEach(el => { if (!keep.has(el)) el.classList.remove('mq-active-box'); });
    keep.forEach(el => el.classList.add('mq-active-box'));
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
