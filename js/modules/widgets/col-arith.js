// col-arith widget — unified column-arithmetic workmat for word problems.
//
// Branches on q.colMode in {'add','sub','mult','div'} to render one of:
//   - col-add:  vertical addition with carry boxes ABOVE each digit
//   - col-sub:  vertical subtraction with borrow boxes ABOVE each digit
//   - col-mult: vertical multiplication with partial-product rows + final sum
//   - col-div:  long division with quotient on top, multiply/subtract body
//
// All four share the same per-digit GREEN/RED live validation, decimal
// alignment, optional dollar-sign column, Clear/Submit actions, and an
// auto-submit when EVERY answer cell turns green.
//
// Question contract (all colModes):
//   q.colMode:        'add' | 'sub' | 'mult' | 'div'
//   q.decimalPlaces:  integer — typically 0 for whole-number WPs, 2 for money
//   q.dollarSign:     boolean — default false; force true for money problems
//   q.ans:            number — final numeric answer (used for grading)
//   q.answerType:     "col-arith"
//
// Per-mode operand fields:
//   add:  q.operands = [num, num, ...]   (≥2 addends; default 2)
//   sub:  q.minuend, q.subtrahend
//   mult: q.factorTop, q.factorBottom    (top is the multi-digit one usually)
//   div:  q.dividend, q.divisor          (integer division; q.remainder optional)
//
// Pure module — no side effects until renderColArith is invoked. Exposes a
// settable onColArithSubmit hook so question-render.js can wire game-state
// updates without the widget importing answer-check directly.

// ─────────────────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────────────────

function _toDigits(num, dp) {
    const s = Math.abs(Number(num)).toFixed(dp);
    return s.replace('.', '');
}

function _colMaxFromList(nums, dp) {
    return nums.reduce((max, n) => {
        const len = _toDigits(n, dp).length;
        return len > max ? len : max;
    }, 0);
}

function _padDigits(digitStr, totalCols) {
    return digitStr.padStart(totalCols, ' ');
}

// Build one row of digit cells. cells: array of single chars (digit or ' ').
// extraCls applied to each. Optional dollar prefix. Optional decimal point
// inserted between integer/fractional positions.
function _buildDigitRow(cells, dp, extraCls, dollarSign) {
    const intCount = cells.length - dp;
    let html = '';
    if (dollarSign) {
        html += `<div class="ca-cell ca-dollar">$</div>`;
    }
    for (let i = 0; i < cells.length; i++) {
        const ch = cells[i];
        const isDigit = ch !== ' ';
        const display = isDigit ? ch : '';
        html += `<div class="ca-cell ${extraCls} ${isDigit ? '' : 'ca-empty'}">${display}</div>`;
        if (dp > 0 && i === intCount - 1) {
            html += `<div class="ca-decimal">.</div>`;
        }
    }
    return html;
}

// Regroup row — small empty inputs above each digit (carry/borrow scratch).
function _buildRegroupRow(totalCols, dp, dollarSign) {
    let html = '';
    if (dollarSign) {
        html += `<div class="ca-cell ca-dollar-spacer"></div>`;
    }
    const intCount = totalCols - dp;
    for (let i = 0; i < totalCols; i++) {
        html += `<div class="ca-cell ca-regroup">`
            + `<input type="text" inputmode="numeric" maxlength="2" `
            + `class="ca-regroup-input" data-col="${i}" aria-label="Regroup column ${i + 1}" />`
            + `</div>`;
        if (dp > 0 && i === intCount - 1) {
            html += `<div class="ca-decimal-spacer"></div>`;
        }
    }
    return html;
}

// Answer row — input boxes the student types into. data-row is the row's
// purpose (final answer, partial-product index, etc.) so the validator can
// look up the expected digit.
function _buildAnswerRow(totalCols, dp, dollarSign, rowKey) {
    let html = '';
    if (dollarSign) {
        html += `<div class="ca-cell ca-dollar">$</div>`;
    }
    const intCount = totalCols - dp;
    for (let i = 0; i < totalCols; i++) {
        html += `<div class="ca-cell ca-answer">`
            + `<input type="text" inputmode="numeric" maxlength="1" `
            + `class="ca-answer-input" data-row="${rowKey}" data-col="${i}" `
            + `aria-label="Answer column ${i + 1}" />`
            + `</div>`;
        if (dp > 0 && i === intCount - 1) {
            html += `<div class="ca-decimal">.</div>`;
        }
    }
    return html;
}

// ─────────────────────────────────────────────────────────────────────────
//  Layout builders — return { html, expected }
//  expected is an object { rowKey: digitString } where digitString is the
//  zero-padded digit string the answer cells in that row must match.
// ─────────────────────────────────────────────────────────────────────────

function _layoutAdd(q) {
    const dp = Number.isFinite(q.decimalPlaces) ? q.decimalPlaces : 0;
    const dollarSign = !!q.dollarSign;
    const operands = Array.isArray(q.operands) && q.operands.length >= 2
        ? q.operands.map(Number)
        : [Number(q.a || 0), Number(q.b || 0)];
    const sum = Number(q.ans);
    const maxOpDigits = _colMaxFromList(operands, dp);
    const ansDigits = _toDigits(sum, dp);
    const totalCols = Math.max(maxOpDigits, ansDigits.length);
    const ansPadded = ansDigits.padStart(totalCols, '0');

    let rows = '';
    rows += `<div class="ca-row ca-regroup-row">${_buildRegroupRow(totalCols, dp, dollarSign)}</div>`;
    operands.forEach((n, idx) => {
        const padded = _padDigits(_toDigits(n, dp), totalCols);
        const isLast = idx === operands.length - 1;
        if (!isLast) {
            rows += `<div class="ca-row">${_buildDigitRow(padded.split(''), dp, 'ca-operand', dollarSign)}</div>`;
        } else {
            rows += `<div class="ca-row">`
                + `<div class="ca-cell ca-plus">+</div>`
                + `${_buildDigitRow(padded.split(''), dp, 'ca-operand', false)}`
                + `</div>`;
        }
    });
    rows += `<div class="ca-bar"></div>`;
    rows += `<div class="ca-row ca-answer-row">${_buildAnswerRow(totalCols, dp, dollarSign, 'sum')}</div>`;

    return {
        html: `<div class="ca-grid">${rows}</div>`,
        expected: { sum: ansPadded },
        title: 'Add',
    };
}

function _layoutSub(q) {
    const dp = Number.isFinite(q.decimalPlaces) ? q.decimalPlaces : 0;
    const dollarSign = !!q.dollarSign;
    const minuend = Number(q.minuend != null ? q.minuend : q.a);
    const subtrahend = Number(q.subtrahend != null ? q.subtrahend : q.b);
    const diff = Number(q.ans);
    const totalCols = Math.max(
        _toDigits(minuend, dp).length,
        _toDigits(subtrahend, dp).length,
        _toDigits(diff, dp).length
    );
    const minPadded = _padDigits(_toDigits(minuend, dp), totalCols);
    const subPadded = _padDigits(_toDigits(subtrahend, dp), totalCols);
    const ansPadded = _toDigits(diff, dp).padStart(totalCols, '0');

    let rows = '';
    rows += `<div class="ca-row ca-regroup-row">${_buildRegroupRow(totalCols, dp, dollarSign)}</div>`;
    rows += `<div class="ca-row">${_buildDigitRow(minPadded.split(''), dp, 'ca-operand', dollarSign)}</div>`;
    rows += `<div class="ca-row">`
        + `<div class="ca-cell ca-minus">&minus;</div>`
        + `${_buildDigitRow(subPadded.split(''), dp, 'ca-operand', false)}`
        + `</div>`;
    rows += `<div class="ca-bar"></div>`;
    rows += `<div class="ca-row ca-answer-row">${_buildAnswerRow(totalCols, dp, dollarSign, 'diff')}</div>`;

    return {
        html: `<div class="ca-grid">${rows}</div>`,
        expected: { diff: ansPadded },
        title: 'Subtract',
    };
}

function _layoutMult(q) {
    const dp = 0;  // multiplication for word problems is whole-number
    const dollarSign = !!q.dollarSign;
    const top = Math.abs(Math.round(Number(q.factorTop != null ? q.factorTop : q.a)));
    const bot = Math.abs(Math.round(Number(q.factorBottom != null ? q.factorBottom : q.b)));
    const product = Math.abs(Math.round(Number(q.ans)));

    const topStr = String(top);
    const botStr = String(bot);
    const productStr = String(product);

    // Compute partial products — one row per digit of bot (right→left).
    const partials = [];
    const botDigits = botStr.split('').reverse();  // index 0 is units
    for (let i = 0; i < botDigits.length; i++) {
        const d = parseInt(botDigits[i], 10);
        const partial = top * d;
        partials.push({ value: partial, shift: i });
    }

    // Total cols = max of (operand widths, longest partial+shift, product).
    let maxPartialWidth = 0;
    partials.forEach(p => {
        const w = String(p.value).length + p.shift;
        if (w > maxPartialWidth) maxPartialWidth = w;
    });
    const totalCols = Math.max(topStr.length, botStr.length, maxPartialWidth, productStr.length);

    const topPadded = _padDigits(topStr, totalCols);
    const botPadded = _padDigits(botStr, totalCols);

    const expected = {};

    let rows = '';
    rows += `<div class="ca-row">${_buildDigitRow(topPadded.split(''), dp, 'ca-operand', dollarSign)}</div>`;
    rows += `<div class="ca-row">`
        + `<div class="ca-cell ca-times">&times;</div>`
        + `${_buildDigitRow(botPadded.split(''), dp, 'ca-operand', false)}`
        + `</div>`;
    rows += `<div class="ca-bar"></div>`;

    // Partial-product rows. Each row is right-justified with `shift` empty
    // cells on the right (acts as the implicit ×10 / ×100 placeholder).
    // For single-digit multipliers (botStr.length===1), skip the partial
    // rows and the student fills only the final product row.
    const showPartials = botStr.length > 1;
    if (showPartials) {
        partials.forEach((p, idx) => {
            const valStr = String(p.value);
            // Width of this partial's digit cells = totalCols - shift.
            const partialCols = totalCols - p.shift;
            const padded = _padDigits(valStr, partialCols);
            const rowKey = 'partial' + idx;
            expected[rowKey] = padded.replace(/ /g, '0');
            // Build the row: [answer cells × partialCols] + [shift × spacer cells]
            let cells = '';
            const intCount = partialCols;  // dp=0 so no decimal split needed
            for (let i = 0; i < partialCols; i++) {
                cells += `<div class="ca-cell ca-answer">`
                    + `<input type="text" inputmode="numeric" maxlength="1" `
                    + `class="ca-answer-input" data-row="${rowKey}" data-col="${i}" `
                    + `aria-label="Partial product ${idx + 1} column ${i + 1}" />`
                    + `</div>`;
            }
            // Shift placeholder cells on the right (pre-filled 0 OR blank).
            for (let s = 0; s < p.shift; s++) {
                cells += `<div class="ca-cell ca-shift">${idx > 0 ? '0' : ''}</div>`;
            }
            rows += `<div class="ca-row ca-partial-row">${cells}</div>`;
        });
        rows += `<div class="ca-bar"></div>`;
    }

    // Final product row (always present).
    const productPadded = productStr.padStart(totalCols, '0');
    expected['product'] = productPadded;
    rows += `<div class="ca-row ca-answer-row">${_buildAnswerRow(totalCols, dp, dollarSign, 'product')}</div>`;

    return {
        html: `<div class="ca-grid">${rows}</div>`,
        expected,
        title: 'Multiply',
    };
}

function _layoutDiv(q) {
    const dollarSign = false;
    const dividend = Math.abs(Math.round(Number(q.dividend != null ? q.dividend : q.a)));
    const divisor = Math.abs(Math.round(Number(q.divisor != null ? q.divisor : q.b)));
    const quotient = Math.abs(Math.floor(Number(q.ans)));
    const remainder = Number.isFinite(q.remainder) ? Math.abs(Math.round(q.remainder)) : (dividend - quotient * divisor);

    const dividendStr = String(dividend);
    const quotientStr = String(quotient);

    // Build quotient input cells — one per digit, right-aligned over the
    // dividend so each quotient digit sits above the dividend digit it
    // "covers" during the algorithm.
    const quotientPadded = quotientStr.padStart(dividendStr.length, ' ');
    let qCells = '';
    for (let i = 0; i < dividendStr.length; i++) {
        const ch = quotientPadded.charAt(i);
        if (ch === ' ') {
            qCells += `<div class="ca-cell ca-empty"></div>`;
        } else {
            qCells += `<div class="ca-cell ca-answer">`
                + `<input type="text" inputmode="numeric" maxlength="1" `
                + `class="ca-answer-input" data-row="quotient" data-col="${i}" `
                + `aria-label="Quotient column ${i + 1}" />`
                + `</div>`;
        }
    }

    // Dividend cells (display only).
    let divCells = '';
    for (let i = 0; i < dividendStr.length; i++) {
        divCells += `<div class="ca-cell ca-operand">${dividendStr.charAt(i)}</div>`;
    }

    const expected = {};
    // Quotient: digit positions where quotientPadded has a digit.
    const expectedQuotient = quotientPadded.split('').map(c => c === ' ' ? '_' : c).join('');
    expected['quotient'] = expectedQuotient;

    // Optional remainder slot (single-digit fits most cases; allow 2-digit).
    let remHtml = '';
    if (remainder > 0) {
        const remStr = String(remainder);
        let remCells = '';
        for (let i = 0; i < remStr.length; i++) {
            remCells += `<div class="ca-cell ca-answer">`
                + `<input type="text" inputmode="numeric" maxlength="1" `
                + `class="ca-answer-input" data-row="remainder" data-col="${i}" `
                + `aria-label="Remainder column ${i + 1}" />`
                + `</div>`;
        }
        expected['remainder'] = remStr;
        remHtml = `<div class="ca-div-remainder">`
            + `<span class="ca-div-rlabel">R</span>${remCells}`
            + `</div>`;
    }

    const html = `
        <div class="ca-div-tableau">
            <div class="ca-div-quotient-row">
                <div class="ca-div-divisor-spacer"></div>
                <div class="ca-div-cells">${qCells}${remHtml}</div>
            </div>
            <div class="ca-div-dividend-row">
                <div class="ca-div-divisor">${divisor}</div>
                <div class="ca-div-bracket">
                    <div class="ca-div-cells">${divCells}</div>
                </div>
            </div>
        </div>
    `;

    return {
        html,
        expected,
        title: 'Divide',
    };
}

// ─────────────────────────────────────────────────────────────────────────
//  Renderer
// ─────────────────────────────────────────────────────────────────────────

export function renderColArith(q, container) {
    if (!container || !q) return;
    const mode = q.colMode || 'add';
    let layout;
    switch (mode) {
        case 'sub':  layout = _layoutSub(q);  break;
        case 'mult': layout = _layoutMult(q); break;
        case 'div':  layout = _layoutDiv(q);  break;
        case 'add':
        default:     layout = _layoutAdd(q);  break;
    }

    container.innerHTML = `
        <div class="colarith-host ca-mode-${mode}">
            <div class="colarith-title">${layout.title}</div>
            ${layout.html}
            <div class="colarith-actions">
                <button type="button" class="colarith-clear">Clear</button>
                <button type="button" class="colarith-submit primary-btn" disabled>Submit</button>
            </div>
            <div class="colarith-hint">Type each digit. Boxes turn green when correct.</div>
        </div>
    `;

    const answerInputs = Array.from(container.querySelectorAll('.ca-answer-input'));
    const submitBtn = container.querySelector('.colarith-submit');
    const clearBtn = container.querySelector('.colarith-clear');
    let locked = false;
    let autoSubmitFired = false;

    function expectedDigit(input) {
        const row = input.dataset.row;
        const col = parseInt(input.dataset.col, 10);
        const expStr = layout.expected[row];
        if (typeof expStr !== 'string') return null;
        return expStr.charAt(col);
    }

    function validateCell(input) {
        const v = (input.value || '').trim();
        input.classList.remove('colarith-correct', 'colarith-wrong', 'col-correct', 'col-wrong');
        if (!v) return null;
        const exp = expectedDigit(input);
        if (exp == null || exp === '_') return null;
        if (v === exp) {
            input.classList.add('colarith-correct', 'col-correct');
            return true;
        }
        input.classList.add('colarith-wrong', 'col-wrong');
        return false;
    }

    function allFilledAndCorrect() {
        // Every answer input that has an expected digit must be green.
        return answerInputs.every(inp => {
            const exp = expectedDigit(inp);
            if (exp == null || exp === '_') return true;
            return inp.classList.contains('colarith-correct');
        });
    }

    function refreshSubmit() {
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
            inp.value = (inp.value || '').replace(/[^0-9]/g, '').slice(0, 1);
            validateCell(inp);
            refreshSubmit();
            if ((inp.value || '').length >= 1) {
                const next = answerInputs[i + 1];
                if (next && !(next.value || '').trim()) next.focus();
            }
            tryAutoSubmit();
        });
        inp.addEventListener('blur', () => {
            if (locked) return;
            validateCell(inp);
            refreshSubmit();
            tryAutoSubmit();
        });
        inp.addEventListener('keydown', (e) => {
            if (locked) return;
            if (e.key === 'Backspace' && !(inp.value || '').trim() && i > 0) {
                e.preventDefault();
                answerInputs[i - 1].focus();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (!submitBtn.disabled) submit();
            }
        });
    });

    container.querySelectorAll('.ca-regroup-input').forEach(inp => {
        inp.addEventListener('input', () => {
            inp.value = (inp.value || '').replace(/[^0-9]/g, '').slice(0, 2);
        });
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        answerInputs.forEach(i => {
            i.value = '';
            i.classList.remove('colarith-correct', 'colarith-wrong', 'col-correct', 'col-wrong');
        });
        container.querySelectorAll('.ca-regroup-input').forEach(i => { i.value = ''; });
        autoSubmitFired = false;
        refreshSubmit();
        if (answerInputs[0]) answerInputs[0].focus();
    });

    function submit() {
        if (locked) return;
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        answerInputs.forEach(i => { i.readOnly = true; });
        try { onColArithSubmit(q, Number(q.ans), allFilledAndCorrect()); }
        catch (err) { console.error('onColArithSubmit failed:', err); }
    }

    submitBtn.addEventListener('click', submit);

    // Hooks for the question-render retry/lock cycle (mirrors col-subtract).
    container._caForceSubmit = () => { if (!locked) submit(); };
    container._caIsLocked = () => locked;
    container._caHasAnyInput = () => answerInputs.some(i => (i.value || '').trim());
    container._caLock = () => {
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        answerInputs.forEach(i => { i.readOnly = true; });
    };
    container._caUnlockForRetry = () => {
        answerInputs.forEach(i => {
            if (i.classList.contains('colarith-wrong') || i.classList.contains('col-wrong')) {
                i.value = '';
                i.classList.remove('colarith-wrong', 'col-wrong');
            }
            i.readOnly = false;
        });
        locked = false;
        autoSubmitFired = false;
        clearBtn.disabled = false;
        refreshSubmit();
        const target = answerInputs.find(i => !i.classList.contains('colarith-correct'));
        if (target) target.focus();
    };

    setTimeout(() => { if (answerInputs[0]) answerInputs[0].focus(); }, 50);
}

// Submit handler always passes the EXPECTED answer back when allCorrect is
// true (because per-digit validation guarantees correctness). The third arg
// `allCorrect` lets the caller distinguish a manual Submit (with a wrong
// digit still red) from an auto-submit when everything is green.
export function checkColArith(q, _submitted, allCorrect) {
    return !!allCorrect;
}

export let onColArithSubmit = function (_q, _value, _allCorrect) { /* noop */ };
export function setOnColArithSubmit(fn) {
    if (typeof fn === 'function') onColArithSubmit = fn;
}
