// ten-frame widget — 5×2 (or 5×4 for max=20) manipulative grid for K-2.
// Student fills cells with counters left-to-right top-to-bottom by clicking
// any cell, or uses +/- keyboard buttons (SPED-friendly), or "Clear" reset.
//
// Question contract:
//   q.ans:           target count (number 0..maxDots)
//   q.initialDots:   optional starting fill (default 0)
//   q.maxDots:       10 (default) or 20
//
// Pure module — no globals attached, no DOM mutation outside `container`.

function _largeTargets() {
    try {
        return !!(window.state && window.state.mapFeatures && window.state.mapFeatures.largeTargets);
    } catch (e) { return false; }
}

export function renderTenFrame(q, container) {
    if (!container || !q) return;
    const max = (q.maxDots === 20) ? 20 : 10;
    const initial = Math.max(0, Math.min(max, q.initialDots | 0));
    const sizeClass = (max === 20) ? 'tf-20' : 'tf-10';
    const large = _largeTargets();
    const frameClass = large ? `tf-frame ${sizeClass} large` : `tf-frame ${sizeClass}`;

    // Build cells (data-index 0..max-1)
    let cellsHtml = '';
    for (let i = 0; i < max; i++) {
        cellsHtml += `<button type="button" class="tf-cell" role="gridcell" data-index="${i}" aria-label="Cell ${i + 1} of ${max}, empty"></button>`;
    }

    container.innerHTML = `
        <div class="${frameClass}" role="grid" aria-label="Ten frame, ${max} cells">${cellsHtml}</div>
        <div class="tf-controls">
            <button type="button" class="tf-btn tf-minus" aria-label="Remove one counter">&minus;</button>
            <button type="button" class="tf-btn tf-clear" aria-label="Clear all counters">Clear</button>
            <button type="button" class="tf-btn tf-plus" aria-label="Add one counter">+</button>
        </div>
        <div class="tf-counter" aria-live="polite">${initial} of ${max} filled.</div>
        <button type="button" class="tf-submit primary-btn">Submit</button>
    `;

    const frame = container.querySelector('.tf-frame');
    const counter = container.querySelector('.tf-counter');
    const plusBtn = container.querySelector('.tf-plus');
    const minusBtn = container.querySelector('.tf-minus');
    const clearBtn = container.querySelector('.tf-clear');
    const submit = container.querySelector('.tf-submit');

    let count = initial;
    let locked = false;

    function paint() {
        const cells = frame.querySelectorAll('.tf-cell');
        cells.forEach((cell, i) => {
            const isFilled = i < count;
            cell.classList.toggle('filled', isFilled);
            const idx = i + 1;
            cell.setAttribute('aria-label',
                `Cell ${idx} of ${max}, ${isFilled ? 'filled' : 'empty'}`);
        });
        counter.textContent = `${count} of ${max} filled.`;
    }

    function setCount(n) {
        if (locked) return;
        const clamped = Math.max(0, Math.min(max, n | 0));
        if (clamped === count) return;
        count = clamped;
        paint();
    }

    // Click a cell: if cell is empty → fill up to that index+1 (i.e. set count
    // to index+1). If cell is already filled → clear back to that index (set
    // count to index). This keeps the left-to-right top-to-bottom invariant.
    frame.addEventListener('click', (e) => {
        if (locked) return;
        const cell = e.target.closest('.tf-cell');
        if (!cell || !frame.contains(cell)) return;
        const idx = parseInt(cell.dataset.index, 10);
        if (Number.isNaN(idx)) return;
        if (idx < count) {
            // Cell is filled — clicking it clears back to before this cell
            setCount(idx);
        } else {
            // Cell is empty — fill through this cell
            setCount(idx + 1);
        }
    });

    plusBtn.addEventListener('click', () => setCount(count + 1));
    minusBtn.addEventListener('click', () => setCount(count - 1));
    clearBtn.addEventListener('click', () => setCount(0));

    submit.addEventListener('click', () => {
        if (locked) return;
        locked = true;
        submit.disabled = true;
        plusBtn.disabled = true;
        minusBtn.disabled = true;
        clearBtn.disabled = true;
        try { onTenFrameSubmit(q, count); }
        catch (err) { console.error('onTenFrameSubmit failed:', err); }
    });

    // Initial paint
    paint();
}

export function checkTenFrame(q, count) {
    return (count | 0) === (q && q.ans | 0);
}

// Default no-op stub — replaced per-mount by question-render.js.
export let onTenFrameSubmit = function (_q, _count) { /* noop */ };

export function setOnTenFrameSubmit(fn) {
    if (typeof fn === 'function') onTenFrameSubmit = fn;
}
