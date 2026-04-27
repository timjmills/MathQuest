// ten-frame-build widget — drag-to-build ten-frame manipulative for K-2.
//
// Student is shown a target N. They drag dots from a palette into the cells of
// a 5×2 ten-frame (N=1..10) or two stacked 5×2 ten-frames (N=11..20). Each
// cell holds at most one dot. Dragging a placed dot back to the palette (or
// onto another empty cell) moves it. Submit auto-enables once at least one
// dot is placed; correctness is "count placed == target" AND each cell is
// either empty or filled with exactly one dot.
//
// Question contract:
//   q.target:        number to build (1..20)
//   q.maxDots:       10 (single frame) or 20 (two stacked frames)
//   q.text:          prompt (default "Build the number {target}.")
//   q.hint:          optional hint shown by the global Hint button
//
// Pure module — no globals attached, no DOM mutation outside `container`.
// Mirrors the pv-disks-build integration pattern: exposes a settable
// `onTenFrameBuildSubmit` hook + `_tfbLock` / `_tfbUnlockForRetry` on the
// host element so the question-render pipeline can lock or retry.

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

const DOT_COLOR = '#1565c0';

// Module-shared "currently picked up" dot (click-and-click fallback / a11y).
let _activeKind = null;     // 'spawn' | 'move' | null
let _activeEl = null;       // the in-cell dot element (only for 'move')
let _activeHost = null;

export function renderTenFrameBuild(q, container) {
    if (!container || !q) return;
    const target = Math.max(1, Math.min(20, Math.floor(q.target || q.ans || 1)));
    const max = (q.maxDots === 20 || target > 10) ? 20 : 10;
    const large = _largeTargets();
    const cellSize = large ? 64 : 52;
    const dotR = Math.round(cellSize * 0.32);

    // Two frames stacked when max==20: top frame is "10", bottom is "ones >10".
    const numFrames = (max === 20) ? 2 : 1;
    const totalCells = numFrames * 10;

    const promptText = q.text || `Build the number ${target}.`;

    function cellHtml(globalIdx) {
        return `<button type="button" class="tfb-cell" data-cell-idx="${globalIdx}"
            role="gridcell" aria-label="Cell ${globalIdx + 1} of ${totalCells}, empty"
            style="width:${cellSize}px;height:${cellSize}px;border:2px solid #555;
                   background:#fafafa;border-radius:6px;padding:0;display:flex;
                   align-items:center;justify-content:center;cursor:pointer;
                   box-sizing:border-box;"></button>`;
    }

    function frameHtml(frameIdx) {
        let cells = '';
        for (let r = 0; r < 2; r++) {
            for (let c = 0; c < 5; c++) {
                const globalIdx = frameIdx * 10 + r * 5 + c;
                cells += cellHtml(globalIdx);
            }
        }
        return `<div class="tfb-frame" role="grid" aria-label="Ten frame ${frameIdx + 1}"
            style="display:grid;grid-template-columns:repeat(5,${cellSize}px);
                   grid-template-rows:repeat(2,${cellSize}px);gap:4px;
                   padding:6px;background:#fff;border:3px solid #333;border-radius:8px;">
            ${cells}
        </div>`;
    }

    const framesHtml = Array.from({ length: numFrames }, (_, i) => frameHtml(i)).join(
        '<div style="height:8px;"></div>'
    );

    // Palette dot - draggable source. Single visual dot that spawns new dots.
    const paletteDotHtml = `<button type="button" class="tfb-palette-dot"
        draggable="true"
        aria-label="Counter, draggable"
        style="width:${dotR * 2 + 8}px;height:${dotR * 2 + 8}px;border-radius:50%;
               background:${DOT_COLOR};border:3px solid rgba(255,255,255,0.55);
               box-shadow:0 3px 8px rgba(0,0,0,0.20);cursor:grab;padding:0;"></button>`;

    container.innerHTML = `
        <div class="tfb-host${large ? ' tfb-large' : ''}" role="application"
             aria-label="Ten frame build mat">
            <div class="tfb-prompt" style="font-weight:800;font-size:1.15rem;text-align:center;
                 margin-bottom:10px;color:var(--text-bright);">${_esc(promptText)}</div>
            <div class="tfb-target" style="text-align:center;font-weight:900;font-size:2.4rem;
                 color:var(--accent-purple);margin-bottom:14px;letter-spacing:2px;">
                ${target}
            </div>
            <div class="tfb-frames" data-role="frames"
                 style="display:flex;flex-direction:column;align-items:center;gap:0;
                        max-width:100%;overflow-x:auto;">
                ${framesHtml}
            </div>
            <div class="tfb-palette" data-role="palette"
                 style="display:flex;justify-content:center;align-items:center;gap:14px;
                        margin-top:18px;padding:12px;background:rgba(0,0,0,0.06);
                        border-radius:10px;">
                <div style="font-size:0.78rem;font-weight:700;color:var(--text-dim);
                     letter-spacing:0.4px;text-transform:uppercase;">Counters</div>
                ${paletteDotHtml}
                <div style="font-size:0.7rem;color:var(--text-dim);">drag</div>
            </div>
            <div class="tfb-counter" aria-live="polite"
                 style="text-align:center;margin-top:10px;font-weight:600;color:var(--text-dim);">
                0 of ${target} placed.
            </div>
            <div class="tfb-toolbar" style="display:flex;justify-content:center;gap:10px;margin-top:10px;">
                <button type="button" class="tfb-clear secondary-btn">Clear</button>
                <button type="button" class="tfb-submit primary-btn" disabled>Submit</button>
            </div>
            <div class="tfb-live" aria-live="polite"
                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
        </div>
    `;

    const host = container.querySelector('.tfb-host');
    const framesWrap = host.querySelector('[data-role="frames"]');
    const palette = host.querySelector('[data-role="palette"]');
    const submit = host.querySelector('.tfb-submit');
    const clearBtn = host.querySelector('.tfb-clear');
    const counter = host.querySelector('.tfb-counter');
    const live = host.querySelector('.tfb-live');
    let locked = false;

    function announce(msg) { if (live) live.textContent = msg; }

    function getPlacedCount() {
        return host.querySelectorAll('.tfb-cell.tfb-filled').length;
    }

    function refreshUI() {
        const n = getPlacedCount();
        counter.textContent = `${n} of ${target} placed.`;
        submit.disabled = n === 0;
    }

    function clearActive() {
        if (_activeHost === host) {
            if (_activeEl) _activeEl.classList.remove('tfb-dot-active');
            host.querySelectorAll('.tfb-palette-dot.tfb-dot-active')
                .forEach(el => el.classList.remove('tfb-dot-active'));
            _activeKind = null;
            _activeEl = null;
            _activeHost = null;
        }
    }

    function setActiveSpawn(paletteEl) {
        clearActive();
        paletteEl.classList.add('tfb-dot-active');
        _activeKind = 'spawn';
        _activeEl = null;
        _activeHost = host;
        announce('Picked up a counter. Click an empty cell to place it.');
    }

    function setActiveMove(dotEl) {
        clearActive();
        dotEl.classList.add('tfb-dot-active');
        _activeKind = 'move';
        _activeEl = dotEl;
        _activeHost = host;
        announce('Picked up placed counter. Click another empty cell to move it, or click the palette to remove.');
    }

    function placeDotInCell(cellEl) {
        if (cellEl.classList.contains('tfb-filled')) return false;
        cellEl.classList.add('tfb-filled');
        cellEl.style.background = '#fff8e1';
        cellEl.innerHTML = `<span class="tfb-dot" data-place="cell"
            style="width:${dotR * 2}px;height:${dotR * 2}px;border-radius:50%;
                   background:${DOT_COLOR};border:2px solid rgba(255,255,255,0.6);
                   box-shadow:0 2px 4px rgba(0,0,0,0.18);display:inline-block;
                   cursor:grab;" draggable="true"></span>`;
        cellEl.setAttribute('aria-label',
            `Cell ${parseInt(cellEl.dataset.cellIdx, 10) + 1} of ${totalCells}, filled`);
        return true;
    }

    function removeDotFromCell(cellEl) {
        cellEl.classList.remove('tfb-filled');
        cellEl.style.background = '#fafafa';
        cellEl.innerHTML = '';
        cellEl.setAttribute('aria-label',
            `Cell ${parseInt(cellEl.dataset.cellIdx, 10) + 1} of ${totalCells}, empty`);
    }

    // ---- Click handling ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const paletteDot = e.target.closest('.tfb-palette-dot');
        const placedDot = e.target.closest('.tfb-cell.tfb-filled .tfb-dot');
        const cell = e.target.closest('.tfb-cell');
        const paletteBg = e.target.closest('.tfb-palette');

        // 1) Click palette: arm spawn-on-next-click.
        if (paletteDot) {
            if (_activeHost === host && _activeKind === 'spawn') {
                clearActive();
                announce('Selection cleared.');
            } else {
                setActiveSpawn(paletteDot);
            }
            return;
        }

        // 2) Click an in-cell dot: pick it up to move/remove.
        if (placedDot) {
            const owningCell = placedDot.closest('.tfb-cell');
            if (_activeHost === host && _activeEl && _activeEl === placedDot) {
                clearActive();
                announce('Selection cleared.');
            } else {
                // Mark the parent cell as the move source via the dot element.
                placedDot._owningCell = owningCell;
                setActiveMove(placedDot);
            }
            return;
        }

        // 3) Click an empty cell: place spawn or move existing.
        if (cell && !cell.classList.contains('tfb-filled')) {
            if (_activeHost !== host) return;
            if (_activeKind === 'spawn') {
                if (placeDotInCell(cell)) {
                    cell.classList.add('tfb-cell-flash');
                    setTimeout(() => cell.classList.remove('tfb-cell-flash'), 220);
                    announce('Counter placed.');
                    refreshUI();
                }
                clearActive();
            } else if (_activeKind === 'move' && _activeEl) {
                const src = _activeEl._owningCell;
                if (src && src !== cell) {
                    removeDotFromCell(src);
                    placeDotInCell(cell);
                    announce('Counter moved.');
                    refreshUI();
                }
                clearActive();
            }
            return;
        }

        // 4) Click palette while moving a placed dot → remove it.
        if (paletteBg && _activeHost === host && _activeKind === 'move' && _activeEl) {
            const src = _activeEl._owningCell;
            if (src) {
                removeDotFromCell(src);
                announce('Counter removed.');
                refreshUI();
            }
            clearActive();
            return;
        }
    });

    // Keyboard a11y — Enter/Space on cells/dots == click.
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const t = e.target.closest('.tfb-palette-dot, .tfb-dot, .tfb-cell');
        if (!t) return;
        e.preventDefault();
        t.click();
    });

    // ---- Native HTML5 drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) { e.preventDefault(); return; }
        const paletteDot = e.target.closest('.tfb-palette-dot');
        const placedDot = e.target.closest('.tfb-cell.tfb-filled .tfb-dot');
        if (paletteDot) {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', 'spawn');
            paletteDot.classList.add('tfb-dragging');
            return;
        }
        if (placedDot) {
            const owningCell = placedDot.closest('.tfb-cell');
            const idx = owningCell.dataset.cellIdx;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', `move:${idx}`);
            placedDot.classList.add('tfb-dragging');
            return;
        }
        e.preventDefault();
    });

    host.addEventListener('dragend', () => {
        host.querySelectorAll('.tfb-dragging').forEach(el => el.classList.remove('tfb-dragging'));
        host.querySelectorAll('.tfb-cell-over, .tfb-palette-over')
            .forEach(el => el.classList.remove('tfb-cell-over', 'tfb-palette-over'));
    });

    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const cell = e.target.closest('.tfb-cell');
        const paletteBg = e.target.closest('.tfb-palette');
        if (cell && !cell.classList.contains('tfb-filled')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            cell.classList.add('tfb-cell-over');
        } else if (paletteBg) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            paletteBg.classList.add('tfb-palette-over');
        }
    });

    host.addEventListener('dragleave', (e) => {
        const t = e.target.closest('.tfb-cell, .tfb-palette');
        if (t) t.classList.remove('tfb-cell-over', 'tfb-palette-over');
    });

    host.addEventListener('drop', (e) => {
        if (locked) return;
        const data = e.dataTransfer.getData('text/plain') || '';
        if (!data) return;
        const cell = e.target.closest('.tfb-cell');
        const paletteBg = e.target.closest('.tfb-palette');

        if (data === 'spawn') {
            if (cell && !cell.classList.contains('tfb-filled')) {
                e.preventDefault();
                cell.classList.remove('tfb-cell-over');
                if (placeDotInCell(cell)) {
                    cell.classList.add('tfb-cell-flash');
                    setTimeout(() => cell.classList.remove('tfb-cell-flash'), 220);
                    refreshUI();
                }
            }
        } else if (data.startsWith('move:')) {
            const srcIdx = data.split(':')[1];
            const srcCell = host.querySelector(`.tfb-cell[data-cell-idx="${srcIdx}"]`);
            if (!srcCell) return;
            if (cell && !cell.classList.contains('tfb-filled')) {
                e.preventDefault();
                cell.classList.remove('tfb-cell-over');
                removeDotFromCell(srcCell);
                placeDotInCell(cell);
                refreshUI();
            } else if (paletteBg) {
                e.preventDefault();
                paletteBg.classList.remove('tfb-palette-over');
                removeDotFromCell(srcCell);
                refreshUI();
            }
        }
    });

    // ---- TOUCH support (mobile/tablet) ----
    enableHostTouchDrag(host, {
        tileSelector: '.tfb-palette-dot, .tfb-cell.tfb-filled .tfb-dot',
        dropSelector: '.tfb-cell, .tfb-palette',
        isLocked: () => locked,
        activeClass: 'tfb-dragging',
        overClass: 'tfb-cell-over',
        onDrop: (zone, tile) => {
            const isPalette = tile.classList.contains('tfb-palette-dot');
            if (isPalette) {
                if (zone.classList.contains('tfb-cell') && !zone.classList.contains('tfb-filled')) {
                    if (placeDotInCell(zone)) {
                        zone.classList.add('tfb-cell-flash');
                        setTimeout(() => zone.classList.remove('tfb-cell-flash'), 220);
                        refreshUI();
                    }
                }
            } else {
                // Moving an existing placed dot.
                const srcCell = tile.closest('.tfb-cell');
                if (!srcCell) return;
                if (zone.classList.contains('tfb-cell') && !zone.classList.contains('tfb-filled')) {
                    removeDotFromCell(srcCell);
                    placeDotInCell(zone);
                    refreshUI();
                } else if (zone.classList.contains('tfb-palette')) {
                    removeDotFromCell(srcCell);
                    refreshUI();
                }
            }
        },
    });

    // Clear all placed dots.
    clearBtn.addEventListener('click', () => {
        if (locked) return;
        host.querySelectorAll('.tfb-cell.tfb-filled').forEach(removeDotFromCell);
        clearActive();
        announce('Mat cleared.');
        refreshUI();
    });

    // Lock + unlock for retry pattern (mirrors pv-disks-build).
    function lockWidget() {
        locked = true;
        submit.disabled = true;
        clearBtn.disabled = true;
        host.querySelectorAll('.tfb-dot, .tfb-palette-dot, .tfb-cell')
            .forEach(el => el.setAttribute('draggable', 'false'));
    }
    function unlockForRetry() {
        locked = false;
        clearBtn.disabled = false;
        host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        host.querySelectorAll('.tfb-dot, .tfb-palette-dot, .tfb-cell')
            .forEach(el => el.setAttribute('draggable', 'true'));
        refreshUI();
    }
    container._tfbLock = lockWidget;
    container._tfbUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        const placed = getPlacedCount();
        try { onTenFrameBuildSubmit(q, placed); }
        catch (err) { console.error('onTenFrameBuildSubmit failed:', err); }
    });

    refreshUI();
}

// Returns true iff exactly target dots are placed (one per cell).
export function checkTenFrameBuild(q, placed) {
    if (!q || typeof placed !== 'number') return false;
    const target = Math.max(0, Math.floor(q.target || q.ans || 0));
    return (placed | 0) === target;
}

// Default no-op; question-render.js replaces per-mount.
export let onTenFrameBuildSubmit = function (_q, _placed) { /* noop */ };

export function setOnTenFrameBuildSubmit(fn) {
    if (typeof fn === 'function') onTenFrameBuildSubmit = fn;
}
