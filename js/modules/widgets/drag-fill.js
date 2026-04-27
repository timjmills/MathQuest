// drag-fill widget — MAP-style drag-from-palette into labeled slots.
// Used for fraction num/den entry, place-value digit-drop, equation-building,
// expanded form, cloze fill-in.
//
// Question contract:
//   q.slots:        [{ id, label, acceptedValues? }, ...]   — labeled drop targets
//   q.palette:      ['2','3','4',...]                       — draggable string tiles
//   q.ans:          { slotId: 'value', ... }                — expected per-slot value
//   q.layout:       'fraction' | 'inline' | 'grid'          — optional layout hint
//   q.text:         prompt text
//   q.hint:         optional inline hint
//
// Tiles are RE-USABLE — placing a tile snapshots its value into the slot;
// the palette tile remains available. A slot may be cleared by clicking it
// when filled.
//
// Native HTML5 drag (dragstart/dragover/drop) PLUS click-and-click fallback
// for accessibility (WCAG 2.5.7 — Dragging Movements). All styling is INLINE
// pending integration with shared CSS by the parallel agent.
//
// Pure module — no globals attached, no DOM mutation outside `container`.

import { enableHostTouchDrag } from '../drag-touch.js';

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

// Module-shared "currently picked up" tile across all hosts.
let _activeValue = null;
let _activeHost = null;
let _activeTileEl = null;

function _announce(host, msg) {
    const live = host.querySelector('.df-live');
    if (live) live.textContent = msg;
}

// ---- Inline style snippets (kept in one place so a future CSS sweep is easy) ----
const STYLE = {
    host:     'display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;position:relative;',
    prompt:   'font-size:1.05rem;color:#333;text-align:center;font-weight:600;',
    hint:     'font-size:0.85rem;color:#777;text-align:center;',
    slotsRow: 'display:flex;flex-wrap:wrap;align-items:center;gap:12px;font-size:1.6rem;font-weight:700;justify-content:center;',
    slotsGrid: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:12px;justify-items:center;',
    slot: [
        'min-width:60px;min-height:44px;padding:6px 10px;',
        'border:2px dashed #1565c0;border-radius:8px;',
        'display:inline-flex;align-items:center;justify-content:center;',
        'background:#fff;color:#1565c0;font-weight:700;font-size:1.4rem;',
        'cursor:pointer;transition:background 0.15s,border-color 0.15s;',
        'user-select:none;'
    ].join(''),
    slotFilled: 'background:#e3f2fd;border-style:solid;color:#0d47a1;',
    slotOver:   'background:#fff3e0;border-color:#ff9800;',
    slotLabel:  'font-size:0.7rem;color:#666;font-weight:500;margin-top:4px;text-transform:uppercase;letter-spacing:0.5px;',
    slotWrap:   'display:inline-flex;flex-direction:column;align-items:center;gap:2px;',
    fracBox:    'display:inline-flex;flex-direction:column;align-items:center;gap:4px;padding:8px 14px;border:2px solid #1565c0;border-radius:10px;background:#fafafa;',
    fracLine:   'width:80%;height:2px;background:#333;margin:2px 0;',
    fracSlot:   'min-width:60px;min-height:40px;padding:4px 8px;border:2px dashed #999;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;background:#fff;font-weight:700;font-size:1.4rem;cursor:pointer;color:#1565c0;user-select:none;',
    palette:    'display:flex;flex-wrap:wrap;gap:8px;padding:12px;background:#f5f5f5;border-radius:8px;justify-content:center;max-width:520px;',
    tile: [
        'min-width:48px;min-height:48px;padding:8px 14px;',
        'border:2px solid #1565c0;border-radius:8px;',
        'background:#fff;color:#1565c0;font-weight:700;font-size:1.2rem;',
        'cursor:grab;user-select:none;',
        'transition:transform 0.1s,background 0.15s;'
    ].join(''),
    tileLarge:   'min-width:60px;min-height:60px;font-size:1.4rem;padding:10px 18px;',
    tileActive:  'background:#1565c0;color:#fff;transform:scale(1.05);',
    tileDragging:'opacity:0.4;',
    submit:      'padding:12px 28px;background:#1565c0;color:#fff;border:none;border-radius:10px;font-weight:700;cursor:pointer;font-size:1rem;',
    submitDis:   'opacity:0.5;cursor:not-allowed;',
    live:        'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;'
};

function _slotHtml(slot, layout) {
    const id = _esc(slot.id);
    const label = _esc(slot.label || slot.id);
    const ariaLabel = `${slot.label || slot.id}, empty drop zone`;
    if (layout === 'fraction') {
        return `<div class="df-slot df-slot-frac" data-slot-id="${id}"
            role="textbox" aria-label="${_esc(ariaLabel)}" tabindex="0"
            style="${STYLE.fracSlot}"></div>`;
    }
    return `<div class="df-slot-wrap" style="${STYLE.slotWrap}">
        <div class="df-slot" data-slot-id="${id}"
            role="textbox" aria-label="${_esc(ariaLabel)}" tabindex="0"
            style="${STYLE.slot}"></div>
        <div class="df-slot-label" style="${STYLE.slotLabel}">${label}</div>
    </div>`;
}

function _renderSlotsArea(slots, layout) {
    if (layout === 'fraction') {
        // For fractions: stack first slot above second slot with a horizontal line.
        // If only one slot, just render it.
        if (slots.length === 1) {
            return `<div class="df-slots df-slots-fraction" style="${STYLE.slotsRow}">${_slotHtml(slots[0], 'fraction')}</div>`;
        }
        // Build a stacked numerator/denominator presentation. Pairs of slots
        // ([num, den], [num, den], ...) are grouped into fraction boxes.
        const pieces = [];
        for (let i = 0; i < slots.length; i += 2) {
            const top = slots[i];
            const bot = slots[i + 1];
            pieces.push(`<div class="df-fraction-box" style="${STYLE.fracBox}">
                ${_slotHtml(top, 'fraction')}
                <div class="df-fraction-line" style="${STYLE.fracLine}"></div>
                ${bot ? _slotHtml(bot, 'fraction') : ''}
            </div>`);
        }
        return `<div class="df-slots df-slots-fraction" style="${STYLE.slotsRow}">${pieces.join('')}</div>`;
    }
    if (layout === 'grid') {
        return `<div class="df-slots df-slots-grid" style="${STYLE.slotsGrid}">${slots.map(s => _slotHtml(s, 'grid')).join('')}</div>`;
    }
    // inline (default)
    return `<div class="df-slots df-slots-inline" style="${STYLE.slotsRow}">${slots.map(s => _slotHtml(s, 'inline')).join('')}</div>`;
}

export function renderDragFill(q, container) {
    if (!container || !q) return;
    const slots = Array.isArray(q.slots) ? q.slots : [];
    const palette = Array.isArray(q.palette) ? q.palette.slice() : [];
    const layout = q.layout || 'inline';
    const large = _largeTargets();

    const tileBaseStyle = STYLE.tile + (large ? STYLE.tileLarge : '');
    const tilesHtml = palette.map((val, idx) => {
        const v = _esc(val);
        return `<button type="button" class="df-tile" draggable="true"
            data-value="${v}" data-tile-idx="${idx}" tabindex="0"
            role="button" aria-label="Number ${v}" aria-pressed="false"
            style="${tileBaseStyle}">${v}</button>`;
    }).join('');

    const promptHtml = q.text ? `<div class="df-prompt" style="${STYLE.prompt}">${_esc(q.text)}</div>` : '';
    const hintHtml = q.hint ? `<div class="df-hint" style="${STYLE.hint}">${_esc(q.hint)}</div>`
                            : `<div class="df-hint" style="${STYLE.hint}">Drag a tile to a slot, or click a tile then click a slot.</div>`;

    container.innerHTML = `
        <div class="df-host" role="application" aria-label="Drag and drop fill" style="${STYLE.host}">
            ${promptHtml}
            ${hintHtml}
            ${_renderSlotsArea(slots, layout)}
            <div class="df-palette" data-role="palette" aria-label="Number palette" style="${STYLE.palette}">${tilesHtml}</div>
            <div class="df-live" aria-live="polite" style="${STYLE.live}"></div>
            <button type="button" class="df-submit" disabled style="${STYLE.submit}${STYLE.submitDis}">Check</button>
        </div>
    `;

    const host = container.querySelector('.df-host');
    const palEl = host.querySelector('[data-role="palette"]');
    const submit = host.querySelector('.df-submit');
    let locked = false;

    function getCurrentState() {
        const out = {};
        host.querySelectorAll('.df-slot').forEach(s => {
            out[s.dataset.slotId] = s.dataset.value || '';
        });
        return out;
    }

    function refreshSubmit() {
        const st = getCurrentState();
        const allFilled = Object.values(st).every(v => v !== '');
        submit.disabled = !allFilled;
        submit.setAttribute('style', STYLE.submit + (submit.disabled ? STYLE.submitDis : ''));
    }

    function clearActive() {
        if (_activeHost === host && _activeTileEl) {
            try {
                _activeTileEl.setAttribute('style', tileBaseStyle);
                _activeTileEl.setAttribute('aria-pressed', 'false');
            } catch (e) { /* element may have been re-rendered */ }
        }
        if (_activeHost === host) {
            _activeValue = null;
            _activeHost = null;
            _activeTileEl = null;
        }
    }

    function setActive(tileEl) {
        clearActive();
        if (!tileEl) return;
        tileEl.setAttribute('style', tileBaseStyle + STYLE.tileActive);
        tileEl.setAttribute('aria-pressed', 'true');
        _activeValue = tileEl.dataset.value;
        _activeHost = host;
        _activeTileEl = tileEl;
        _announce(host, `Picked up ${_activeValue}.`);
    }

    function fillSlot(slotEl, value) {
        if (!slotEl || value == null) return;
        const isFraction = slotEl.classList.contains('df-slot-frac');
        slotEl.dataset.value = value;
        slotEl.textContent = value;
        // Re-apply style to remove the dashed "empty" appearance
        if (isFraction) {
            slotEl.setAttribute('style', STYLE.fracSlot + 'background:#e3f2fd;border-style:solid;border-color:#1565c0;color:#0d47a1;');
        } else {
            slotEl.setAttribute('style', STYLE.slot + STYLE.slotFilled);
        }
        const labelText = slotEl.getAttribute('aria-label')
            ? slotEl.getAttribute('aria-label').replace(/, empty drop zone$/, '').replace(/, filled with .+$/, '')
            : slotEl.dataset.slotId;
        slotEl.setAttribute('aria-label', `${labelText}, filled with ${value}`);
        clearActive();
        _announce(host, `${value} placed in ${labelText}.`);
        refreshSubmit();
    }

    function clearSlot(slotEl) {
        if (!slotEl) return;
        const wasValue = slotEl.dataset.value;
        if (!wasValue) return;
        const isFraction = slotEl.classList.contains('df-slot-frac');
        delete slotEl.dataset.value;
        slotEl.textContent = '';
        if (isFraction) {
            slotEl.setAttribute('style', STYLE.fracSlot);
        } else {
            slotEl.setAttribute('style', STYLE.slot);
        }
        const labelText = slotEl.getAttribute('aria-label')
            ? slotEl.getAttribute('aria-label').replace(/, filled with .+$/, '').replace(/, empty drop zone$/, '')
            : slotEl.dataset.slotId;
        slotEl.setAttribute('aria-label', `${labelText}, empty drop zone`);
        _announce(host, `${labelText} cleared.`);
        refreshSubmit();
    }

    // ---- Click-and-click fallback (also keyboard via Enter/Space) ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const tile = e.target.closest('.df-tile');
        const slot = e.target.closest('.df-slot');
        if (tile && host.contains(tile)) {
            // Toggle pickup of this tile
            if (_activeHost === host && _activeValue === tile.dataset.value && _activeTileEl === tile) {
                clearActive();
                _announce(host, 'Selection cleared.');
            } else {
                setActive(tile);
            }
            return;
        }
        if (slot && host.contains(slot)) {
            // If a tile is active, place its value into this slot.
            if (_activeHost === host && _activeValue != null) {
                fillSlot(slot, _activeValue);
                return;
            }
            // Otherwise, clicking a filled slot clears it.
            if (slot.dataset.value) {
                clearSlot(slot);
            }
        }
    });

    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tile = e.target.closest('.df-tile');
        const slot = e.target.closest('.df-slot');
        if (tile || slot) {
            e.preventDefault();
            (tile || slot).click();
        }
    });

    // ---- Native HTML5 drag ----
    host.addEventListener('dragstart', (e) => {
        if (locked) return;
        const tile = e.target.closest('.df-tile');
        if (!tile || !host.contains(tile)) return;
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', tile.dataset.value);
        tile.setAttribute('style', tileBaseStyle + STYLE.tileDragging);
    });
    host.addEventListener('dragend', (e) => {
        const tile = e.target.closest('.df-tile');
        if (tile) {
            // restore default style (unless still active)
            const isActive = (_activeHost === host && _activeTileEl === tile);
            tile.setAttribute('style', tileBaseStyle + (isActive ? STYLE.tileActive : ''));
        }
        host.querySelectorAll('.df-slot').forEach(s => {
            if (s.dataset.value) {
                if (s.classList.contains('df-slot-frac')) {
                    s.setAttribute('style', STYLE.fracSlot + 'background:#e3f2fd;border-style:solid;border-color:#1565c0;color:#0d47a1;');
                } else {
                    s.setAttribute('style', STYLE.slot + STYLE.slotFilled);
                }
            } else {
                s.setAttribute('style', s.classList.contains('df-slot-frac') ? STYLE.fracSlot : STYLE.slot);
            }
        });
    });
    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const slot = e.target.closest('.df-slot');
        if (slot) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            const isFraction = slot.classList.contains('df-slot-frac');
            slot.setAttribute('style', (isFraction ? STYLE.fracSlot : STYLE.slot) + STYLE.slotOver);
        }
    });
    host.addEventListener('dragleave', (e) => {
        const slot = e.target.closest('.df-slot');
        if (slot) {
            const isFraction = slot.classList.contains('df-slot-frac');
            if (slot.dataset.value) {
                if (isFraction) {
                    slot.setAttribute('style', STYLE.fracSlot + 'background:#e3f2fd;border-style:solid;border-color:#1565c0;color:#0d47a1;');
                } else {
                    slot.setAttribute('style', STYLE.slot + STYLE.slotFilled);
                }
            } else {
                slot.setAttribute('style', isFraction ? STYLE.fracSlot : STYLE.slot);
            }
        }
    });
    host.addEventListener('drop', (e) => {
        if (locked) return;
        const value = e.dataTransfer.getData('text/plain');
        if (value == null || value === '') return;
        const slot = e.target.closest('.df-slot');
        if (slot) {
            e.preventDefault();
            fillSlot(slot, value);
        }
    });

    // ---- TOUCH support (mobile/tablet) ----
    enableHostTouchDrag(host, {
        tileSelector: '.df-tile',
        dropSelector: '.df-slot',
        isLocked: () => locked,
        onDrop: (zone, tileEl) => {
            if (zone && zone.classList.contains('df-slot')) {
                fillSlot(zone, tileEl.dataset.value);
            }
        },
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        submit.setAttribute('style', STYLE.submit + STYLE.submitDis);
        host.querySelectorAll('.df-tile').forEach(t => { t.setAttribute('draggable', 'false'); });
    }
    function unlockForRetry(wrongSlotIds) {
        locked = false;
        host.querySelectorAll('.df-tile').forEach(t => { t.setAttribute('draggable', 'true'); });
        // Clear wrong slots so the student must re-place them; correct slots
        // stay as-is.
        if (Array.isArray(wrongSlotIds) && wrongSlotIds.length) {
            wrongSlotIds.forEach(sid => {
                const slot = host.querySelector(`.df-slot[data-slot-id="${CSS.escape(String(sid))}"]`);
                if (slot) clearSlot(slot);
            });
        }
        refreshSubmit();
    }
    container._dfLock = lockWidget;
    container._dfUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        // Briefly disable while integration evaluates; integration will
        // re-enable via container._dfUnlockForRetry on a wrong submit.
        submit.disabled = true;
        submit.setAttribute('style', STYLE.submit + STYLE.submitDis);
        const st = getCurrentState();
        try { onDragFillSubmit(q, st); }
        catch (err) { console.error('onDragFillSubmit failed:', err); }
    });

    refreshSubmit();
}

export function checkDragFill(q, st) {
    if (!q || !q.ans || typeof q.ans !== 'object') return false;
    if (!st || typeof st !== 'object') return false;
    const ansKeys = Object.keys(q.ans);
    if (ansKeys.length === 0) return false;
    for (const k of ansKeys) {
        const expected = String(q.ans[k]);
        const actual = String(st[k] != null ? st[k] : '');
        if (expected !== actual) {
            // Allow per-slot acceptedValues override
            const slot = Array.isArray(q.slots) ? q.slots.find(s => s && s.id === k) : null;
            if (slot && Array.isArray(slot.acceptedValues)) {
                const accepted = slot.acceptedValues.map(v => String(v));
                if (!accepted.includes(actual)) return false;
            } else {
                return false;
            }
        }
    }
    return true;
}

// Default no-op stub. The integration glue (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onDragFillSubmit = function (_q, _state) { /* noop */ };

export function setOnDragFillSubmit(fn) {
    if (typeof fn === 'function') onDragFillSubmit = fn;
}
