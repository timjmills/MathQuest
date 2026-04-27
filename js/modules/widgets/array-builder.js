// array-builder widget — interactive manipulative for "rows of N" word
// problems. Renders a blank rows×cols grid; each cell click toggles an
// icon. A live counter shows "X of Y placed". Below the grid, a single
// numeric input lets the student type the total. Submit unlocks once the
// placed-count equals the product (rows × cols) AND the typed total is
// correct.
//
// Question contract:
//   q.useArrayBuilder: true       — flag; question-render dispatches here
//   q.arrayDims:       { rows, cols }
//   q.arrayIcon:       string (single char/emoji; default '●')
//   q.ans:             number — product == rows × cols
//   q.answerType:      "array-builder"
//
// Pure module — no globals attached, no DOM mutation outside `container`.

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function renderArrayBuilder(q, container) {
    if (!container || !q || !q.arrayDims) return;
    const rows = Math.max(1, Math.min(12, parseInt(q.arrayDims.rows, 10) || 0));
    const cols = Math.max(1, Math.min(12, parseInt(q.arrayDims.cols, 10) || 0));
    const total = rows * cols;
    const icon = (q.arrayIcon && String(q.arrayIcon).length > 0)
        ? String(q.arrayIcon)
        : '●';
    const expected = Number(q.ans);

    // Cell sizing: scale down for larger grids so it always fits.
    const maxDim = Math.max(rows, cols);
    let cellPx = 44;
    if (maxDim > 6) cellPx = 38;
    if (maxDim > 8) cellPx = 32;

    let cellsHtml = '';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            cellsHtml += `<button type="button" class="ab-cell" `
                + `data-idx="${idx}" data-r="${r}" data-c="${c}" `
                + `aria-label="Row ${r + 1} column ${c + 1}" aria-pressed="false">`
                + `<span class="ab-icon" aria-hidden="true"></span>`
                + `</button>`;
        }
    }

    container.innerHTML = `
        <div class="array-builder-host" role="application" aria-label="Build the array">
            <div class="ab-instr">Click a cell to place ${_esc(icon)}. Build a ${rows} × ${cols} array.</div>
            <div class="ab-grid" style="grid-template-columns: repeat(${cols}, ${cellPx}px); grid-auto-rows: ${cellPx}px;">
                ${cellsHtml}
            </div>
            <div class="ab-counter" aria-live="polite">
                <span class="ab-count-num">0</span> of <span class="ab-count-target">${total}</span> placed
            </div>
            <div class="ab-total-row">
                <label for="abTotalInput" class="ab-total-label">Total:</label>
                <input id="abTotalInput" type="text" inputmode="numeric" maxlength="6"
                    class="ab-total-input" disabled aria-label="Type the total" />
            </div>
            <div class="ab-actions">
                <button type="button" class="ab-clear">Clear</button>
                <button type="button" class="ab-submit primary-btn" disabled>Submit</button>
            </div>
            <div class="ab-hint">Place ${total} icons (${rows} rows of ${cols}), then type the total.</div>
        </div>
    `;

    const grid = container.querySelector('.ab-grid');
    const cells = Array.from(container.querySelectorAll('.ab-cell'));
    const countNum = container.querySelector('.ab-count-num');
    const totalInput = container.querySelector('.ab-total-input');
    const clearBtn = container.querySelector('.ab-clear');
    const submitBtn = container.querySelector('.ab-submit');
    let locked = false;

    function placedCount() {
        return cells.filter(c => c.classList.contains('placed')).length;
    }

    function refresh() {
        const n = placedCount();
        countNum.textContent = String(n);
        const reachedTarget = (n === total);
        totalInput.disabled = !reachedTarget || locked;
        if (!reachedTarget) {
            totalInput.value = '';
            totalInput.classList.remove('ab-correct', 'ab-wrong');
        }
        const typedOk = (parseInt(totalInput.value, 10) === expected);
        submitBtn.disabled = !(reachedTarget && typedOk) || locked;
    }

    function toggleCell(cellEl) {
        if (locked) return;
        const isOn = cellEl.classList.toggle('placed');
        cellEl.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        const iconSpan = cellEl.querySelector('.ab-icon');
        if (iconSpan) iconSpan.textContent = isOn ? icon : '';
        refresh();
    }

    grid.addEventListener('click', (e) => {
        const cell = e.target.closest('.ab-cell');
        if (!cell || !grid.contains(cell)) return;
        toggleCell(cell);
    });
    grid.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const cell = e.target.closest('.ab-cell');
        if (!cell || !grid.contains(cell)) return;
        e.preventDefault();
        toggleCell(cell);
    });

    totalInput.addEventListener('input', () => {
        if (locked) return;
        totalInput.value = (totalInput.value || '').replace(/[^0-9]/g, '').slice(0, 6);
        const v = parseInt(totalInput.value, 10);
        totalInput.classList.remove('ab-correct', 'ab-wrong');
        if (totalInput.value && Number.isFinite(v)) {
            if (v === expected) totalInput.classList.add('ab-correct');
            else totalInput.classList.add('ab-wrong');
        }
        refresh();
    });
    totalInput.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key === 'Enter' && !submitBtn.disabled) {
            e.preventDefault();
            submit();
        }
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        cells.forEach(c => {
            c.classList.remove('placed');
            c.setAttribute('aria-pressed', 'false');
            const iconSpan = c.querySelector('.ab-icon');
            if (iconSpan) iconSpan.textContent = '';
        });
        totalInput.value = '';
        totalInput.classList.remove('ab-correct', 'ab-wrong');
        refresh();
    });

    function submit() {
        if (locked) return;
        const n = placedCount();
        const typed = parseInt(totalInput.value, 10);
        const allCorrect = (n === total) && (typed === expected);
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        totalInput.readOnly = true;
        try { onArrayBuilderSubmit(q, typed, allCorrect); }
        catch (err) { console.error('onArrayBuilderSubmit failed:', err); }
    }
    submitBtn.addEventListener('click', submit);

    // Hooks for question-render retry/lock cycle.
    container._abForceSubmit = () => { if (!locked) submit(); };
    container._abIsLocked = () => locked;
    container._abLock = () => {
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        totalInput.readOnly = true;
    };
    container._abUnlockForRetry = () => {
        locked = false;
        clearBtn.disabled = false;
        totalInput.readOnly = false;
        if (totalInput.classList.contains('ab-wrong')) {
            totalInput.value = '';
            totalInput.classList.remove('ab-wrong');
        }
        refresh();
        const n = placedCount();
        if (n === total) totalInput.focus();
    };

    refresh();
}

export function checkArrayBuilder(q, typedValue) {
    if (!q) return false;
    return Number(typedValue) === Number(q.ans);
}

export let onArrayBuilderSubmit = function (_q, _value, _allCorrect) { /* noop */ };
export function setOnArrayBuilderSubmit(fn) {
    if (typeof fn === 'function') onArrayBuilderSubmit = fn;
}
