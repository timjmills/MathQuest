// col-subtract widget — interactive vertical column-subtraction workmat.
//
// Renders the two operands stacked, decimal-aligned, with:
//   - a top "regroup" row of small empty boxes the student may use for
//     borrow notation (one box above each digit, optional input)
//   - the minuend / subtrahend rendered as digit cells
//   - a bottom "answer" row with input boxes the student types digits into
//
// Per-digit live validation: as the student types into an answer cell and
// blurs (or after each input event), the cell turns GREEN if it matches the
// expected digit at that column, RED if not. When ALL answer cells are
// correct, the widget auto-submits via the registered onColSubtractSubmit
// hook.
//
// Question contract:
//   q.minuend:        number — top operand (e.g. 5.00)
//   q.subtrahend:     number — bottom operand (e.g. 4.45)
//   q.decimalPlaces:  integer — typically 2 for money problems
//   q.ans:            number — q.minuend - q.subtrahend (e.g. 0.55)
//   q.dollarSign:     boolean (optional) — if true, prefix "$" column
//   q.answerType:     "col-subtract"
//
// Pure module — no side effects until renderColSubtract is invoked. Exposes
// a settable onColSubtractSubmit hook so question-render.js can wire game-
// state updates without the widget importing answer-check directly.

// Convert a number to a fixed-precision digit string (no decimal point).
// e.g. (5.00, 2) -> "500", (4.45, 2) -> "445", (0.55, 2) -> "055".
function _toDigits(num, dp) {
    const s = Math.abs(Number(num)).toFixed(dp);
    return s.replace('.', '');
}

// Total column count (digits only — decimal point is rendered as its own
// non-digit slot positioned between integer and fractional parts).
function _columnCount(minuend, subtrahend, dp) {
    const a = _toDigits(minuend, dp).length;
    const b = _toDigits(subtrahend, dp).length;
    return Math.max(a, b);
}

// Pad a digit string with leading spaces (rendered as empty cells) so both
// operands align to the same total column width.
function _padDigits(digitStr, totalCols) {
    return digitStr.padStart(totalCols, ' ');
}

// Build one row of digit cells. `cells` is an array of single-character
// strings (digit or ' '). `extraCls` adds a class to each cell. The decimal
// point is inserted between integer and fractional positions.
function _buildDigitRow(cells, dp, extraCls, dollarSign) {
    const intCount = cells.length - dp;
    let html = '';
    if (dollarSign) {
        html += `<div class="col-subtract-cell col-dollar">$</div>`;
    }
    for (let i = 0; i < cells.length; i++) {
        const ch = cells[i];
        const isDigit = ch !== ' ';
        const display = isDigit ? ch : '';
        html += `<div class="col-subtract-cell ${extraCls} ${isDigit ? '' : 'col-empty'}">${display}</div>`;
        // Insert decimal point cell between integer and fractional digits.
        if (dp > 0 && i === intCount - 1) {
            html += `<div class="col-subtract-decimal">.</div>`;
        }
    }
    return html;
}

// Build the regroup (borrow) row — small empty inputs above each digit
// position. Optional for the student; used for the standard regrouping
// algorithm. We render one input per column (no decimal slot).
function _buildRegroupRow(totalCols, dp, dollarSign) {
    let html = '';
    if (dollarSign) {
        html += `<div class="col-subtract-cell col-dollar-spacer"></div>`;
    }
    const intCount = totalCols - dp;
    for (let i = 0; i < totalCols; i++) {
        html += `<div class="col-subtract-cell col-regroup">`
            + `<input type="text" inputmode="numeric" maxlength="2" `
            + `class="col-regroup-input" data-col="${i}" aria-label="Regroup column ${i + 1}" />`
            + `</div>`;
        if (dp > 0 && i === intCount - 1) {
            html += `<div class="col-subtract-decimal-spacer"></div>`;
        }
    }
    return html;
}

// Build the answer row — input cells the student types digits into. Each
// input has data-col identifying its column position so the validator can
// compare against the expected digit.
function _buildAnswerRow(totalCols, dp, dollarSign) {
    let html = '';
    if (dollarSign) {
        html += `<div class="col-subtract-cell col-dollar">$</div>`;
    }
    const intCount = totalCols - dp;
    for (let i = 0; i < totalCols; i++) {
        html += `<div class="col-subtract-cell col-answer">`
            + `<input type="text" inputmode="numeric" maxlength="1" `
            + `class="col-answer-input" data-col="${i}" aria-label="Answer column ${i + 1}" />`
            + `</div>`;
        if (dp > 0 && i === intCount - 1) {
            html += `<div class="col-subtract-decimal">.</div>`;
        }
    }
    return html;
}

export function renderColSubtract(q, container) {
    if (!container || !q) return;
    const dp = Number.isFinite(q.decimalPlaces) ? q.decimalPlaces : 2;
    const minuend = Number(q.minuend);
    const subtrahend = Number(q.subtrahend);
    const dollarSign = q.dollarSign !== false;  // default true for money
    const totalCols = _columnCount(minuend, subtrahend, dp);

    const minDigits = _padDigits(_toDigits(minuend, dp), totalCols);
    const subDigits = _padDigits(_toDigits(subtrahend, dp), totalCols);
    const ansDigits = _toDigits(q.ans, dp).padStart(totalCols, '0');

    container.innerHTML = `
        <div class="col-subtract-host">
            <div class="col-subtract-title">Subtract</div>
            <div class="col-subtract-grid">
                <div class="col-subtract-row col-subtract-regroup-row">${_buildRegroupRow(totalCols, dp, dollarSign)}</div>
                <div class="col-subtract-row col-subtract-minuend-row">${_buildDigitRow(minDigits.split(''), dp, 'col-operand', dollarSign)}</div>
                <div class="col-subtract-row col-subtract-subtrahend-row">
                    <div class="col-subtract-cell col-minus">&minus;</div>
                    ${_buildDigitRow(subDigits.split(''), dp, 'col-operand', false)}
                </div>
                <div class="col-subtract-bar"></div>
                <div class="col-subtract-row col-subtract-answer-row">${_buildAnswerRow(totalCols, dp, dollarSign)}</div>
            </div>
            <div class="col-subtract-actions">
                <button type="button" class="col-subtract-clear">Clear</button>
                <button type="button" class="col-subtract-submit primary-btn" disabled>Submit</button>
            </div>
            <div class="col-subtract-hint">Type each digit. The boxes turn green when correct.</div>
        </div>
    `;

    const answerInputs = Array.from(container.querySelectorAll('.col-answer-input'));
    const submitBtn = container.querySelector('.col-subtract-submit');
    const clearBtn = container.querySelector('.col-subtract-clear');
    let locked = false;
    let autoSubmitFired = false;

    function expectedDigitAt(colIdx) {
        return ansDigits.charAt(colIdx);
    }

    function validateCell(input) {
        const colIdx = parseInt(input.dataset.col, 10);
        const v = (input.value || '').trim();
        input.classList.remove('col-correct', 'col-wrong');
        if (!v) return null;
        if (v === expectedDigitAt(colIdx)) {
            input.classList.add('col-correct');
            return true;
        }
        input.classList.add('col-wrong');
        return false;
    }

    function allFilledAndCorrect() {
        return answerInputs.every(inp => inp.classList.contains('col-correct'));
    }

    function refreshSubmitState() {
        if (locked) return;
        submitBtn.disabled = !allFilledAndCorrect();
    }

    function tryAutoSubmit() {
        if (locked || autoSubmitFired) return;
        if (allFilledAndCorrect()) {
            autoSubmitFired = true;
            submit();
        }
    }

    answerInputs.forEach((inp, i) => {
        inp.addEventListener('input', () => {
            if (locked) return;
            // Strip non-digits.
            inp.value = (inp.value || '').replace(/[^0-9]/g, '').slice(0, 1);
            validateCell(inp);
            refreshSubmitState();
            // Auto-advance to next empty cell.
            if ((inp.value || '').length >= 1) {
                const next = answerInputs[i + 1];
                if (next && !(next.value || '').trim()) next.focus();
            }
            tryAutoSubmit();
        });
        inp.addEventListener('blur', () => {
            if (locked) return;
            validateCell(inp);
            refreshSubmitState();
            tryAutoSubmit();
        });
        inp.addEventListener('keydown', (e) => {
            if (locked) return;
            if (e.key === 'Backspace' && !(inp.value || '').trim() && i > 0) {
                answerInputs[i - 1].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (!submitBtn.disabled) submit();
            }
        });
    });

    // Allow free-form numeric input in the regroup row (no validation —
    // these are the student's scratch boxes for the borrow algorithm).
    container.querySelectorAll('.col-regroup-input').forEach(inp => {
        inp.addEventListener('input', () => {
            inp.value = (inp.value || '').replace(/[^0-9]/g, '').slice(0, 2);
        });
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        answerInputs.forEach(i => {
            i.value = '';
            i.classList.remove('col-correct', 'col-wrong');
        });
        container.querySelectorAll('.col-regroup-input').forEach(i => { i.value = ''; });
        autoSubmitFired = false;
        refreshSubmitState();
        if (answerInputs[0]) answerInputs[0].focus();
    });

    function submit() {
        if (locked) return;
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        answerInputs.forEach(i => { i.readOnly = true; });
        try { onColSubtractSubmit(q, _readAnswer()); }
        catch (err) { console.error('onColSubtractSubmit failed:', err); }
    }

    function _readAnswer() {
        // Reconstruct numeric answer from the cells.
        const intCount = totalCols - dp;
        let intPart = '';
        let fracPart = '';
        answerInputs.forEach((inp, i) => {
            const v = (inp.value || '').trim() || '0';
            if (i < intCount) intPart += v; else fracPart += v;
        });
        const numStr = dp > 0 ? `${intPart || '0'}.${fracPart}` : (intPart || '0');
        return parseFloat(numStr);
    }

    submitBtn.addEventListener('click', submit);

    // Expose hooks for question-render.js retry/lock cycle.
    container._csForceSubmit = () => { if (!locked) submit(); };
    container._csIsLocked = () => locked;
    container._csHasAnyInput = () => answerInputs.some(i => (i.value || '').trim());
    container._csLock = () => {
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        answerInputs.forEach(i => { i.readOnly = true; });
    };
    container._csUnlockForRetry = () => {
        // Clear any wrong cells (red); keep correct cells (green).
        answerInputs.forEach(i => {
            if (i.classList.contains('col-wrong')) {
                i.value = '';
                i.classList.remove('col-wrong');
            }
            i.readOnly = false;
        });
        locked = false;
        autoSubmitFired = false;
        clearBtn.disabled = false;
        refreshSubmitState();
        // Focus first wrong/empty cell.
        const target = answerInputs.find(i => !i.classList.contains('col-correct'));
        if (target) target.focus();
    };

    // Focus first input so student can start typing immediately.
    setTimeout(() => { if (answerInputs[0]) answerInputs[0].focus(); }, 50);
}

// Returns true if the submitted numeric value equals q.ans (within float
// tolerance for decimals).
export function checkColSubtract(q, submittedNum) {
    if (!q) return false;
    const expected = Number(q.ans);
    const got = Number(submittedNum);
    if (!Number.isFinite(expected) || !Number.isFinite(got)) return false;
    const dp = Number.isFinite(q.decimalPlaces) ? q.decimalPlaces : 2;
    const eps = Math.pow(10, -(dp + 2));
    return Math.abs(expected - got) < eps;
}

export let onColSubtractSubmit = function (_q, _value) { /* noop */ };
export function setOnColSubtractSubmit(fn) {
    if (typeof fn === 'function') onColSubtractSubmit = fn;
}
