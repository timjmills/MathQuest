// word-work-screen.js — the screen behaviour of the word-work cell (sheet/cells/word-work.js).
//
// The cell's screen twin carries plain markup: the four sign boxes are <button class="mq-wwop">,
// the column boxes and the sign box are <input class="mq-wwork"> (scratch: never graded, the
// host's own input in the "Answer:" box is the scored place) and the unit bank words are
// <button class="mq-wwword">. One delegated listener per document makes them work on every host
// (the practice card, the online worksheet, the quiz), however often a host redraws the cell:
//
//   tap a sign        it is ringed (aria-pressed), the others are cleared
//   type in a box     digits only (a sign box takes + − × ÷, a regroup box two digits)
//   tap a unit word   it is written on the unit line
//
// Every place carries `data-mq-expect`; each one filled gets `data-mq-ok="1"` or `"0"`, and a
// place that holds its right value turns green at once (the owner's rule, 2026-09-25): an input
// takes the hosts' own `mq-live-correct` mark (css/screen-cell.css), a tapped sign or unit word
// the same green. A wrong value stays neutral while the pupil works (only Check marks wrong).
// Nothing here changes the host's verdict: the scored place is the host's input in "Answer:".
//
// Layer 4 (DOM only; no state).

const SIGN = (v) => {
    const m = String(v).replace(/[*xX]/g, '×').replace(/[/:]/g, '÷').replace(/[-–]/g, '−').match(/[+−×÷]/g);
    return m ? m[m.length - 1] : '';
};

const GREEN_BORDER = '#1B7A43', GREEN_FILL = '#E3F4EA';   // the hosts' live-correct feedback (SP-30)

function paint(el, ok) {
    // the class is the hosts' feedback mark, which their mono pass leaves alone (SP-30)
    el.classList.toggle('mq-live-correct', ok);
    if (el.tagName === 'INPUT') return;
    el.style.borderColor = ok ? GREEN_BORDER : '';
    el.style.background = ok ? GREEN_FILL : '';
}

function mark(el, value) {
    const want = el.getAttribute('data-mq-expect');
    if (value === '' || want === null) { el.removeAttribute('data-mq-ok'); paint(el, false); return; }
    // an empty expectation (a regroup box that stays empty) is never marked either way
    const ok = want !== '' && String(value).trim().toLowerCase() === String(want).trim().toLowerCase();
    el.setAttribute('data-mq-ok', ok ? '1' : '0');
    paint(el, ok);
}

function onClick(e) {
    const op = e.target.closest && e.target.closest('button.mq-wwop');
    if (op) {
        e.preventDefault();
        const group = op.closest('.mq-wwsigns');
        if (!group) return;
        group.querySelectorAll('button.mq-wwop').forEach((b) => {
            const on = b === op;
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
            b.style.outline = on ? '3px solid #000' : '';
            b.style.outlineOffset = on ? '3px' : '';
            b.style.borderRadius = on ? '50%' : '';
            if (!on) { b.removeAttribute('data-mq-ok'); paint(b, false); }
        });
        const right = op.getAttribute('data-mq-expect') === '1';
        op.setAttribute('data-mq-ok', right ? '1' : '0');
        paint(op, right);
        group.setAttribute('data-mq-picked', op.getAttribute('data-mq-op') || '');
        group.setAttribute('data-mq-ok', op.getAttribute('data-mq-ok'));
        return;
    }
    const word = e.target.closest && e.target.closest('button.mq-wwword');
    if (word) {
        e.preventDefault();
        const cell = word.closest('.mq-wwanswer');
        const line = cell && cell.querySelector('.mq-wwunit');
        if (!line) return;
        line.textContent = word.getAttribute('data-mq-word') || word.textContent;
        mark(line, line.textContent);
        cell.querySelectorAll('button.mq-wwword').forEach((b) => b.setAttribute('aria-pressed', b === word ? 'true' : 'false'));
    }
}

function onInput(e) {
    const el = e.target;
    if (!el || !el.classList || !el.classList.contains('mq-wwork')) return;
    const kind = el.getAttribute('data-mq-kind');
    const v = kind === 'sign' ? SIGN(el.value) : String(el.value).replace(/[^0-9]/g, '').slice(kind === 'regroup' ? -2 : kind === 'number' ? -8 : -1);
    if (v !== el.value) el.value = v;
    mark(el, v);
}

/** Install the listeners once per document. Idempotent. */
export function installWordWorkScreen(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mqWordWork) return false;
    doc.__mqWordWork = true;
    doc.addEventListener('click', onClick, true);
    doc.addEventListener('input', onInput, true);
    return true;
}

installWordWorkScreen();
