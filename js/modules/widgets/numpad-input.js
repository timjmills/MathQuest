// numpad-input widget — on-screen 4×4 numeric keypad for K-2/SPED students
// and tablet users. A decorator on the existing `number` answerType.
//
// Layout (16 buttons):
//   [7] [8] [9] [⌫]
//   [4] [5] [6] [/]
//   [1] [2] [3] [-]
//   [.] [0] [Clr] [Submit]
//
// Question contract:
//   q.ans:           number (preferred) — accepts int, decimal, or fraction string
//   q.acceptedForms: optional [string] — alternate exact-string matches
//   q.tolerance:     optional number — numeric tolerance (default 0)
//   q.unit:          optional string — shown after the input
//   q.text:          shown via the surrounding card; the input has aria-label = q.text
//
// The display uses inputmode="numeric" so the OS keyboard works on tablets.
//
// Pure module — no globals attached, no DOM mutation outside `container`.

function _largeTargets() {
    try {
        return !!(window.state && window.state.mapFeatures && window.state.mapFeatures.largeTargets);
    } catch (e) { return false; }
}

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Inline copy of the fraction parser in answer-check.js so this widget can be
// loaded standalone without dragging in the full check module.
// Accepts: "3/4", "2 3/4", "2-3/4", "11/4", "3", "-3", "-1/2", whole numbers.
function _parseFractionLike(str) {
    if (str == null) return null;
    str = String(str).trim();
    if (str === '') return null;

    // Mixed number: "2 3/4" or "2-3/4"
    let m = str.match(/^(-?\d+)\s*[\s-]\s*(\d+)\s*\/\s*(\d+)$/);
    if (m) {
        const whole = parseInt(m[1], 10);
        const num = parseInt(m[2], 10);
        const den = parseInt(m[3], 10);
        if (den === 0) return null;
        const sign = whole < 0 ? -1 : 1;
        return { num: sign * (Math.abs(whole) * den + num), den };
    }

    // Simple fraction: "3/4" or "-3/4"
    m = str.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (m) {
        const num = parseInt(m[1], 10);
        const den = parseInt(m[2], 10);
        if (den === 0) return null;
        return { num, den };
    }

    // Decimal or integer: "3", "-3", "0.5", ".5", "-.5"
    if (/^-?\d*\.?\d+$/.test(str) || /^-?\d+\.$/.test(str)) {
        const v = parseFloat(str);
        if (Number.isFinite(v)) {
            // Represent as best-effort fraction for cross-mult; downstream just
            // wants a numeric value, so we keep both forms.
            return { num: v, den: 1, _isFloat: true, _value: v };
        }
    }

    return null;
}

// Convert a parsed fraction to its numeric value.
function _fracToNumber(f) {
    if (!f) return NaN;
    if (f._isFloat) return f._value;
    if (f.den === 0) return NaN;
    return f.num / f.den;
}

export function renderNumpadInput(q, container) {
    if (!container || !q) return;
    const large = _largeTargets();
    const padClass = large ? 'np-pad large' : 'np-pad';
    const btnClass = large ? 'np-btn large' : 'np-btn';
    const ariaLabel = _esc(q.text || 'Enter your answer');
    const unitHtml = q.unit
        ? `<span class="np-unit">${_esc(q.unit)}</span>`
        : '';

    // 4x4 button matrix. Each entry: { label, key (data-key), class, ariaLabel }
    const buttons = [
        { label: '7', key: '7', cls: '', a11y: 'digit 7' },
        { label: '8', key: '8', cls: '', a11y: 'digit 8' },
        { label: '9', key: '9', cls: '', a11y: 'digit 9' },
        { label: '⌫', key: 'back', cls: 'np-action', a11y: 'backspace' },
        { label: '4', key: '4', cls: '', a11y: 'digit 4' },
        { label: '5', key: '5', cls: '', a11y: 'digit 5' },
        { label: '6', key: '6', cls: '', a11y: 'digit 6' },
        { label: '/', key: '/', cls: 'np-action', a11y: 'fraction bar' },
        { label: '1', key: '1', cls: '', a11y: 'digit 1' },
        { label: '2', key: '2', cls: '', a11y: 'digit 2' },
        { label: '3', key: '3', cls: '', a11y: 'digit 3' },
        { label: '-', key: '-', cls: 'np-action', a11y: 'minus' },
        { label: '.', key: '.', cls: '', a11y: 'decimal point' },
        { label: '0', key: '0', cls: '', a11y: 'digit 0' },
        { label: 'Clr', key: 'clear', cls: 'np-clear', a11y: 'clear' },
        { label: 'Submit', key: 'submit', cls: 'np-submit', a11y: 'submit' },
    ];

    const padHtml = buttons.map(b =>
        `<button type="button" class="${btnClass} ${b.cls}" data-key="${_esc(b.key)}" aria-label="${_esc(b.a11y)}">${_esc(b.label)}</button>`
    ).join('');

    container.innerHTML = `
        <div class="np-host" role="group" aria-label="On-screen number pad">
            <div class="np-display">
                <input type="text" class="np-input" inputmode="numeric"
                       pattern="[0-9./-]*" autocomplete="off"
                       aria-label="${ariaLabel}" />
                ${unitHtml}
            </div>
            <div class="${padClass}" role="group" aria-label="Number pad keys">${padHtml}</div>
        </div>
    `;

    const host = container.querySelector('.np-host');
    const display = container.querySelector('.np-display');
    const input = container.querySelector('.np-input');
    const pad = container.querySelector('.np-pad');
    let locked = false;

    function getValue() { return input.value; }
    function setValue(v) { input.value = v; }

    function appendDigit(d) {
        if (locked) return;
        // Insert at end (we don't track caret position — simpler & matches tablet UX)
        setValue(getValue() + d);
    }

    function appendDecimal() {
        if (locked) return;
        const v = getValue();
        if (v.indexOf('.') !== -1) return; // Only one decimal
        // If there's a slash, only allow . if the segment after the slash has no .
        if (v.indexOf('/') !== -1) {
            const seg = v.slice(v.lastIndexOf('/') + 1);
            if (seg.indexOf('.') !== -1) return;
        }
        setValue(v + '.');
    }

    function appendSlash() {
        if (locked) return;
        const v = getValue();
        if (v.indexOf('/') !== -1) return; // Only one fraction bar
        if (v === '' || v === '-') return; // Need a numerator first
        setValue(v + '/');
    }

    function toggleMinus() {
        if (locked) return;
        const v = getValue();
        if (v.startsWith('-')) {
            setValue(v.slice(1));
        } else {
            setValue('-' + v);
        }
    }

    function backspace() {
        if (locked) return;
        const v = getValue();
        if (v.length === 0) return;
        setValue(v.slice(0, -1));
    }

    function clearAll() {
        if (locked) return;
        setValue('');
        display.classList.remove('flash-correct', 'flash-wrong');
    }

    function doSubmit() {
        if (locked) return;
        const v = getValue().trim();
        if (v === '' || v === '-' || v === '.') return; // Nothing meaningful to submit
        locked = true;
        // Disable all pad buttons; keep input read-only for visual continuity.
        pad.querySelectorAll('.np-btn').forEach(b => { b.disabled = true; });
        input.readOnly = true;
        try { onNumpadSubmit(q, v); }
        catch (err) { console.error('onNumpadSubmit failed:', err); }
    }

    pad.addEventListener('click', (e) => {
        const btn = e.target.closest('.np-btn');
        if (!btn || !pad.contains(btn) || btn.disabled) return;
        const key = btn.dataset.key;
        if (key == null) return;
        if (/^[0-9]$/.test(key)) appendDigit(key);
        else if (key === '.') appendDecimal();
        else if (key === '/') appendSlash();
        else if (key === '-') toggleMinus();
        else if (key === 'back') backspace();
        else if (key === 'clear') clearAll();
        else if (key === 'submit') doSubmit();
    });

    // Allow OS keyboard / tablet text input. Submit on Enter.
    input.addEventListener('keydown', (e) => {
        if (locked) { e.preventDefault(); return; }
        if (e.key === 'Enter') {
            e.preventDefault();
            doSubmit();
        }
    });

    // Provide a flash-feedback API for integrators.
    // (question-render.js can call this after scoring.)
    host._numpadFlash = function (correct) {
        display.classList.remove('flash-correct', 'flash-wrong');
        display.classList.add(correct ? 'flash-correct' : 'flash-wrong');
    };
}

export function checkNumpadInput(q, value) {
    if (!q || value == null) return false;
    const v = String(value).trim();
    if (v === '') return false;

    // 1. acceptedForms: exact-string matches (case-insensitive, whitespace-stripped)
    if (Array.isArray(q.acceptedForms)) {
        const norm = v.replace(/\s+/g, '').toLowerCase();
        for (const f of q.acceptedForms) {
            if (String(f).replace(/\s+/g, '').toLowerCase() === norm) return true;
        }
    }

    // 2. Numeric / fraction equivalence
    const userF = _parseFractionLike(v);
    if (userF == null) return false;

    // q.ans may itself be a number, a string number, or a fraction string.
    const ansF = _parseFractionLike(q.ans);
    if (ansF == null) return false;

    // If both sides are simple fractions (no float), use cross-multiply for
    // exact equivalence ("6/8" === "3/4").
    if (!userF._isFloat && !ansF._isFloat) {
        if (userF.num * ansF.den === userF.den * ansF.num) return true;
        // Fall through to numeric compare in case one was a whole number with
        // tolerance specified (rare but harmless).
    }

    const userV = _fracToNumber(userF);
    const ansV = _fracToNumber(ansF);
    if (!Number.isFinite(userV) || !Number.isFinite(ansV)) return false;

    const tol = (typeof q.tolerance === 'number' && q.tolerance >= 0) ? q.tolerance : 0;
    if (tol === 0) {
        // Use 3-decimal rounding to match answer-check.js's number compare.
        return Number(userV.toFixed(3)) === Number(ansV.toFixed(3));
    }
    return Math.abs(userV - ansV) <= tol;
}

// Default no-op stub. The integration glue (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onNumpadSubmit = function (_q, _value) { /* noop */ };

export function setOnNumpadSubmit(fn) {
    if (typeof fn === 'function') onNumpadSubmit = fn;
}
