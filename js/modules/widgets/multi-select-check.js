// multi-select-check widget — generic checkbox grid for "click ALL that apply"
// items. All-or-nothing scoring (set equality vs q.ans).
//
// Question contract:
//   q.options:    [{ id, label, correct, image?, svg? }]
//   q.ans:        array of correct option IDs
//   q.minCorrect: optional number (default 1)
//
// Pure module — no globals attached, no DOM mutation outside `container`.

function _largeTargets() {
    try {
        return !!(window.state && window.state.mapFeatures && window.state.mapFeatures.largeTargets);
    } catch (e) { return false; }
}

function _renderInner(opt) {
    if (opt.svg) {
        return `<span class="msc-visual">${opt.svg}</span><span class="msc-label">${opt.label || ''}</span>`;
    }
    if (opt.image) {
        const safeLabel = opt.label ? `<span class="msc-label">${opt.label}</span>` : '';
        return `<img class="msc-image" src="${opt.image}" alt="${opt.label || ''}">${safeLabel}`;
    }
    return `<span class="msc-label">${opt.label != null ? opt.label : ''}</span>`;
}

export function renderMultiSelectCheck(q, container) {
    if (!container || !q || !Array.isArray(q.options)) return;
    const large = _largeTargets();
    const optClass = large ? 'msc-opt large' : 'msc-opt';
    const total = q.options.length;

    const optsHtml = q.options.map(opt => {
        const id = opt.id;
        return `<button type="button" class="${optClass}" data-id="${id}" aria-pressed="false">
            <span class="msc-mark" aria-hidden="true"></span>
            ${_renderInner(opt)}
        </button>`;
    }).join('');

    container.innerHTML = `
        <div class="msc-counter" aria-live="polite">0 of ${total} selected</div>
        <div class="msc-grid" role="group" aria-label="Select all that apply">${optsHtml}</div>
        <button type="button" class="msc-submit primary-btn" disabled>Submit</button>
    `;

    const grid = container.querySelector('.msc-grid');
    const counter = container.querySelector('.msc-counter');
    const submit = container.querySelector('.msc-submit');
    const minCorrect = (typeof q.minCorrect === 'number' && q.minCorrect > 0) ? q.minCorrect : 1;

    function getSelected() {
        return Array.from(grid.querySelectorAll('.msc-opt.selected')).map(el => el.dataset.id);
    }

    function refresh() {
        const sel = getSelected();
        counter.textContent = `${sel.length} of ${total} selected`;
        submit.disabled = sel.length < minCorrect;
    }

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.msc-opt');
        if (!btn || !grid.contains(btn)) return;
        if (btn.disabled) return;
        const isOn = btn.classList.toggle('selected');
        btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        refresh();
    });

    function lockWidget() {
        submit.disabled = true;
        grid.querySelectorAll('.msc-opt').forEach(el => { el.disabled = true; });
    }
    function unlockForRetry() {
        // Re-enable interaction for in-place correction. Wrong/right flash
        // classes are cleared so the student can re-evaluate cleanly.
        grid.querySelectorAll('.msc-opt').forEach(el => {
            el.disabled = false;
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        refresh();
    }
    container._mscLock = lockWidget;
    container._mscUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled) return;
        const sel = getSelected();
        // Briefly disable while the integration decides; the integration
        // re-enables via container._mscUnlockForRetry on a wrong submit.
        submit.disabled = true;
        // Delegate result handling to caller-overridden hook
        try { onMultiSelectSubmit(q, sel); }
        catch (err) { console.error('onMultiSelectSubmit failed:', err); }
    });

    refresh();
}

export function checkMultiSelectCheck(q, selectedIds) {
    if (!Array.isArray(selectedIds) || !Array.isArray(q.ans)) return false;
    if (selectedIds.length !== q.ans.length) return false;
    const setA = new Set(selectedIds);
    for (const id of q.ans) if (!setA.has(id)) return false;
    return true;
}

// Default no-op stub. The integration glue (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onMultiSelectSubmit = function (_q, _selectedIds) { /* noop */ };

// Allow integrators to swap the handler. Re-exporting via module binding only
// works for `let`; expose a setter as well for clarity.
export function setOnMultiSelectSubmit(fn) {
    if (typeof fn === 'function') onMultiSelectSubmit = fn;
}
