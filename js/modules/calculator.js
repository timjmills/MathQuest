// calculator.js — Floating, toggleable calculator widget for K-6 students.
//
// The widget is a single fixed-position panel anchored bottom-right of the
// viewport. It's lazy-built on first toggle, then reused. Stays open across
// questions until the student dismisses it.
//
// Public API (all attached to window via globals.js):
//   toggleCalculator()  — show/hide the widget
//   showCalculator()    — explicit show
//   hideCalculator()    — explicit hide
//
// Expression evaluation uses a *narrow* allowlist (digits, + - * / ( ) . space)
// + the Function constructor — same approach as built-in calculators in many
// online math tools. Any character outside the allowlist short-circuits to
// "Error" so a stray paste can't execute arbitrary code.

let _calcEl = null;
let _calcExpr = '';

function _calcSetDisplay(s) {
    if (!_calcEl) return;
    const d = _calcEl.querySelector('.mq-calc-display');
    if (d) d.textContent = s || '0';
}

function _calcEvaluate() {
    const raw = _calcExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
    if (!raw.trim()) { _calcSetDisplay(''); return; }
    if (!/^[\d+\-*/().\s]*$/.test(raw)) {
        _calcSetDisplay('Error');
        _calcExpr = '';
        return;
    }
    try {
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict"; return (' + raw + ')')();
        if (Number.isFinite(result)) {
            // Round to 6 decimals to avoid 0.1+0.2 floating-point noise; trim trailing zeros.
            const rounded = Math.round(result * 1e6) / 1e6;
            _calcExpr = String(rounded);
            _calcSetDisplay(_calcExpr);
        } else {
            _calcSetDisplay('Error');
            _calcExpr = '';
        }
    } catch (_e) {
        _calcSetDisplay('Error');
        _calcExpr = '';
    }
}

function _calcKey(key) {
    if (key === 'C') {
        _calcExpr = '';
        _calcSetDisplay('');
        return;
    }
    if (key === 'BACK') {
        _calcExpr = _calcExpr.slice(0, -1);
        _calcSetDisplay(_calcExpr);
        return;
    }
    if (key === '=') {
        _calcEvaluate();
        return;
    }
    _calcExpr += key;
    _calcSetDisplay(_calcExpr);
}

function _ensureCalculator() {
    if (_calcEl) return _calcEl;
    const el = document.createElement('div');
    el.id = 'mqCalcWidget';
    el.className = 'mq-calc';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Calculator');
    // The grid layout is intentional: 4 columns × 5 rows. The 0-key spans
    // 2 columns on the bottom row to give thumbs a generous target.
    el.innerHTML = `
        <div class="mq-calc-header">
            <span class="mq-calc-title">🧮 Calculator</span>
            <button type="button" class="mq-calc-close" aria-label="Close calculator">✕</button>
        </div>
        <div class="mq-calc-display" aria-live="polite">0</div>
        <div class="mq-calc-grid">
            <button type="button" class="mq-calc-key mq-calc-fn"  data-key="C">C</button>
            <button type="button" class="mq-calc-key mq-calc-fn"  data-key="(">(</button>
            <button type="button" class="mq-calc-key mq-calc-fn"  data-key=")">)</button>
            <button type="button" class="mq-calc-key mq-calc-op"  data-key="÷">÷</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="7">7</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="8">8</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="9">9</button>
            <button type="button" class="mq-calc-key mq-calc-op"  data-key="×">×</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="4">4</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="5">5</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="6">6</button>
            <button type="button" class="mq-calc-key mq-calc-op"  data-key="−">−</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="1">1</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="2">2</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key="3">3</button>
            <button type="button" class="mq-calc-key mq-calc-op"  data-key="+">+</button>
            <button type="button" class="mq-calc-key mq-calc-num mq-calc-zero" data-key="0">0</button>
            <button type="button" class="mq-calc-key mq-calc-num" data-key=".">.</button>
            <button type="button" class="mq-calc-key mq-calc-fn"  data-key="BACK" aria-label="Backspace">⌫</button>
            <button type="button" class="mq-calc-key mq-calc-eq"  data-key="=">=</button>
        </div>
    `;
    el.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('.mq-calc-close');
        if (closeBtn) {
            hideCalculator();
            return;
        }
        const keyBtn = e.target.closest('.mq-calc-key');
        if (!keyBtn) return;
        const key = keyBtn.dataset.key;
        if (typeof key === 'string') _calcKey(key);
    });
    document.body.appendChild(el);
    _calcEl = el;
    return el;
}

export function showCalculator() {
    const el = _ensureCalculator();
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
}

export function hideCalculator() {
    if (!_calcEl) return;
    _calcEl.classList.remove('open');
    _calcEl.setAttribute('aria-hidden', 'true');
}

export function toggleCalculator() {
    const el = _ensureCalculator();
    if (el.classList.contains('open')) {
        hideCalculator();
    } else {
        showCalculator();
    }
}
