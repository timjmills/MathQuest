// pv-digit-drag widget — interactive place value digit-tile sorter.
//
// Student is shown a 5- or 6-digit number (e.g. 47,382 or 538,194) and an
// empty place-value table with one labeled column per digit (HTh, TTh, Th,
// H, T, O for a 6-digit number). Below the table sits a palette of digit
// tiles — the digits of the target number, shuffled.
//
// Student drags each digit tile from the palette into the matching column.
// Submit (in-widget) checks that each column holds the digit at that place
// in the target number.
//
// Question contract:
//   q.target:        number to decompose (10000..999999, supports 4-7 digit)
//   q.places:        ordered array of place values exposed, largest first.
//                    e.g. [100000, 10000, 1000, 100, 10, 1] for 6-digit.
//                    Optional — derived from target if absent.
//   q.text:          prompt (default "Place each digit of {target} in the
//                    correct column.")
//   q.hint:          optional hint shown by the global Hint button.
//
// Pure module — no globals attached, no DOM mutation outside `container`.
// Mirrors pv-disks-build.js retry/lock pattern: exposes `_pvddLock` and
// `_pvddUnlockForRetry` on the host element so question-render.js can wire
// into the standard `_handleMultiPlaceSubmit` flow.

const PLACE_LABEL = {
    1:       'O',
    10:      'T',
    100:     'H',
    1000:    'Th',
    10000:   'TTh',
    100000:  'HTh',
    1000000: 'M'
};
const PLACE_LABEL_LONG = {
    1:       'Ones',
    10:      'Tens',
    100:     'Hundreds',
    1000:    'Thousands',
    10000:   'Ten Thousands',
    100000:  'Hundred Thousands',
    1000000: 'Millions'
};
const PLACE_COLOR = {
    1:       'var(--accent-green)',
    10:      '#3b82f6',
    100:     'var(--accent-orange)',
    1000:    'var(--accent-purple)',
    10000:   'var(--accent-pink, #e91e63)',
    100000:  'var(--accent-teal, #009688)',
    1000000: 'var(--accent-yellow, #fbc02d)'
};

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _placesForTarget(target) {
    const t = Math.max(0, Math.floor(target || 0));
    if (t >= 1000000) return [1000000, 100000, 10000, 1000, 100, 10, 1];
    if (t >= 100000)  return [100000, 10000, 1000, 100, 10, 1];
    if (t >= 10000)   return [10000, 1000, 100, 10, 1];
    if (t >= 1000)    return [1000, 100, 10, 1];
    if (t >= 100)     return [100, 10, 1];
    if (t >= 10)      return [10, 1];
    return [1];
}

function _digitAtPlace(num, place) {
    return Math.floor(num / place) % 10;
}

function _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function _tileHtml(digit, idx) {
    return `<button type="button" class="pvdd-tile" data-digit="${digit}" data-tile-idx="${idx}"
        draggable="true"
        aria-label="Digit ${digit}, draggable"
        style="width:54px;height:54px;border-radius:10px;background:#fff;color:#222;
               font-weight:900;font-size:1.8rem;border:3px solid #1565c0;
               box-shadow:0 3px 8px rgba(0,0,0,0.18);cursor:grab;display:inline-flex;
               align-items:center;justify-content:center;padding:0;margin:0;">${digit}</button>`;
}

function _columnHtml(place, totalPlaces) {
    const color = PLACE_COLOR[place];
    const labelShort = PLACE_LABEL[place] || String(place);
    const labelLong = PLACE_LABEL_LONG[place] || String(place);
    const labelSz = totalPlaces >= 6 ? '0.7rem' : totalPlaces >= 5 ? '0.78rem' : '0.85rem';
    return `<div class="pvdd-col" data-place="${place}"
        style="display:flex;flex-direction:column;align-items:center;">
        <div class="pvdd-col-label-long" style="font-size:${labelSz};font-weight:700;color:${color};
             text-transform:uppercase;letter-spacing:0.4px;text-align:center;line-height:1.1;
             margin-bottom:4px;min-height:2.2em;">${labelLong}</div>
        <div class="pvdd-col-label-short" style="font-size:0.95rem;font-weight:800;color:${color};
             margin-bottom:6px;">${labelShort}</div>
        <div class="pvdd-drop" data-place="${place}"
             role="button" tabindex="0"
             aria-label="${labelLong} drop zone, empty"
             style="border:3px dashed ${color};border-radius:12px;width:64px;height:72px;
                    display:flex;align-items:center;justify-content:center;
                    background:rgba(255,255,255,0.04);"></div>
    </div>`;
}

// Module-shared "currently picked up" state for click-and-click fallback /
// keyboard a11y. The active source is always a tile element (palette OR
// already-placed in a column). Picking up moves the tile.
let _activeEl = null;
let _activeHost = null;

export function renderPvDigitDrag(q, container) {
    if (!container || !q) return;
    const target = Math.max(0, Math.floor(q.target || 0));
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice().sort((a, b) => b - a)
        : _placesForTarget(target);

    // Digits in place order (largest first), shuffled for the palette.
    const orderedDigits = places.map(p => _digitAtPlace(target, p));
    // Tag each tile with a unique idx so we can look it up after a drop.
    const tilesData = orderedDigits.map((d, i) => ({ digit: d, idx: i }));
    const shuffled = _shuffle(tilesData);

    const colsHtml = places.map(p => _columnHtml(p, places.length)).join('');
    const tilesHtml = shuffled.map(t => _tileHtml(t.digit, t.idx)).join('');

    const promptText = q.text || `Place each digit of ${target.toLocaleString()} in the correct column.`;

    const colMin = places.length >= 7 ? 78 : places.length >= 6 ? 88 : 100;
    const gridMaxW = Math.min(720, places.length * colMin + 40);

    container.innerHTML = `
        <div class="pvdd-host" role="application"
             aria-label="Place value digit drag table">
            <div class="pvdd-prompt" style="font-weight:800;font-size:1.1rem;text-align:center;
                 margin-bottom:8px;color:var(--text-bright);">${_esc(promptText)}</div>
            <div class="pvdd-target" style="text-align:center;font-weight:900;font-size:2.4rem;
                 color:var(--accent-purple);margin-bottom:14px;letter-spacing:2px;">
                ${target.toLocaleString()}
            </div>
            <div class="pvdd-table" data-role="table"
                 style="display:flex;justify-content:center;gap:10px;
                        max-width:${gridMaxW}px;margin:0 auto;
                        padding:12px;background:rgba(0,0,0,0.04);border-radius:10px;">
                ${colsHtml}
            </div>
            <div class="pvdd-palette-label" style="text-align:center;font-size:0.78rem;
                 color:var(--text-dim);font-weight:700;letter-spacing:0.4px;
                 text-transform:uppercase;margin-top:14px;margin-bottom:6px;">Digit tiles</div>
            <div class="pvdd-palette" data-role="palette"
                 style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;
                        padding:12px;background:rgba(0,0,0,0.06);border-radius:10px;
                        min-height:78px;">
                ${tilesHtml}
            </div>
            <div class="pvdd-toolbar" style="display:flex;justify-content:center;gap:10px;margin-top:14px;">
                <button type="button" class="pvdd-clear secondary-btn">Clear Table</button>
                <button type="button" class="pvdd-submit primary-btn" disabled>Submit</button>
            </div>
            <div class="pvdd-live" aria-live="polite"
                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
        </div>
    `;

    const host = container.querySelector('.pvdd-host');
    const palette = host.querySelector('[data-role="palette"]');
    const submit = host.querySelector('.pvdd-submit');
    const clearBtn = host.querySelector('.pvdd-clear');
    const live = host.querySelector('.pvdd-live');
    let locked = false;

    function announce(msg) { if (live) live.textContent = msg; }

    function placedCount() {
        return host.querySelectorAll('.pvdd-drop .pvdd-tile').length;
    }

    function refreshState() {
        // Update aria labels on drop zones.
        places.forEach(p => {
            const drop = host.querySelector(`.pvdd-drop[data-place="${p}"]`);
            if (!drop) return;
            const tile = drop.querySelector('.pvdd-tile');
            const longLabel = PLACE_LABEL_LONG[p];
            drop.setAttribute('aria-label',
                tile ? `${longLabel} column, holds digit ${tile.dataset.digit}`
                     : `${longLabel} column, empty`);
        });
        // Submit enabled when ALL columns are filled (table fully built).
        submit.disabled = (placedCount() !== places.length);
    }

    function clearActive() {
        if (_activeHost === host && _activeEl) {
            _activeEl.classList.remove('pvdd-tile-active');
        }
        _activeEl = null;
        _activeHost = null;
    }

    function setActive(tileEl) {
        clearActive();
        tileEl.classList.add('pvdd-tile-active');
        _activeEl = tileEl;
        _activeHost = host;
        announce(`Picked up tile ${tileEl.dataset.digit}. Click a column to place it.`);
    }

    function placeTileInDrop(tileEl, dropEl) {
        // If the drop already has a tile, swap them (move existing back to
        // palette so columns hold at most one tile).
        const existing = dropEl.querySelector('.pvdd-tile');
        if (existing && existing !== tileEl) {
            // Send the displaced tile back to the palette.
            existing.classList.remove('pvdd-tile-active', 'correct-flash', 'wrong-flash');
            palette.appendChild(existing);
        }
        dropEl.appendChild(tileEl);
        tileEl.classList.remove('pvdd-tile-active', 'correct-flash', 'wrong-flash');
        announce(`Tile ${tileEl.dataset.digit} placed.`);
        refreshState();
    }

    function returnTileToPalette(tileEl) {
        tileEl.classList.remove('pvdd-tile-active', 'correct-flash', 'wrong-flash');
        palette.appendChild(tileEl);
        announce(`Tile ${tileEl.dataset.digit} returned to palette.`);
        refreshState();
    }

    // ---- Click handling ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const tile = e.target.closest('.pvdd-tile');
        const drop = e.target.closest('.pvdd-drop');
        const paletteBg = e.target.closest('.pvdd-palette');

        // 1) Click a tile (palette OR placed): pick it up.
        if (tile) {
            if (_activeHost === host && _activeEl === tile) {
                clearActive();
                announce('Selection cleared.');
            } else {
                setActive(tile);
            }
            return;
        }

        // 2) Click a drop zone with active tile: place it there.
        if (drop) {
            if (_activeHost !== host || !_activeEl) return;
            placeTileInDrop(_activeEl, drop);
            clearActive();
            return;
        }

        // 3) Click empty palette space while holding a placed tile: send back.
        if (paletteBg && _activeHost === host && _activeEl
            && _activeEl.parentElement && _activeEl.parentElement.classList.contains('pvdd-drop')) {
            returnTileToPalette(_activeEl);
            clearActive();
            return;
        }
    });

    // Keyboard a11y: Enter/Space on tiles/drops acts like a click.
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const target = e.target.closest('.pvdd-tile, .pvdd-drop');
        if (!target) return;
        e.preventDefault();
        target.click();
    });

    // ---- Native HTML5 drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) { e.preventDefault(); return; }
        const tile = e.target.closest('.pvdd-tile');
        if (!tile) { e.preventDefault(); return; }
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain',
            `tile:${tile.dataset.digit}:${tile.dataset.tileIdx}`);
        tile.classList.add('pvdd-dragging');
    });

    host.addEventListener('dragend', () => {
        host.querySelectorAll('.pvdd-dragging').forEach(el => el.classList.remove('pvdd-dragging'));
        host.querySelectorAll('.pvdd-drop.pvdd-drop-over, .pvdd-palette.pvdd-palette-over')
            .forEach(el => el.classList.remove('pvdd-drop-over', 'pvdd-palette-over'));
    });

    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const drop = e.target.closest('.pvdd-drop');
        const paletteBg = e.target.closest('.pvdd-palette');
        if (drop) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            drop.classList.add('pvdd-drop-over');
        } else if (paletteBg) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            paletteBg.classList.add('pvdd-palette-over');
        }
    });

    host.addEventListener('dragleave', (e) => {
        const t = e.target.closest('.pvdd-drop, .pvdd-palette');
        if (t) t.classList.remove('pvdd-drop-over', 'pvdd-palette-over');
    });

    host.addEventListener('drop', (e) => {
        if (locked) return;
        const data = e.dataTransfer.getData('text/plain') || '';
        if (!data.startsWith('tile:')) return;
        const [, digitStr, idxStr] = data.split(':');
        const tileEl = host.querySelector(
            `.pvdd-tile[data-digit="${digitStr}"][data-tile-idx="${idxStr}"]`
        );
        if (!tileEl) return;
        const drop = e.target.closest('.pvdd-drop');
        const paletteBg = e.target.closest('.pvdd-palette');
        if (drop) {
            e.preventDefault();
            drop.classList.remove('pvdd-drop-over');
            placeTileInDrop(tileEl, drop);
        } else if (paletteBg) {
            e.preventDefault();
            paletteBg.classList.remove('pvdd-palette-over');
            // Only return to palette if currently placed; otherwise no-op.
            if (tileEl.parentElement && tileEl.parentElement.classList.contains('pvdd-drop')) {
                returnTileToPalette(tileEl);
            }
        }
    });

    // Clear Table: send every placed tile back to the palette.
    clearBtn.addEventListener('click', () => {
        if (locked) return;
        host.querySelectorAll('.pvdd-drop .pvdd-tile').forEach(t => {
            t.classList.remove('pvdd-tile-active', 'correct-flash', 'wrong-flash');
            palette.appendChild(t);
        });
        clearActive();
        announce('Table cleared.');
        refreshState();
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        clearBtn.disabled = true;
        host.querySelectorAll('.pvdd-tile, .pvdd-drop')
            .forEach(el => el.setAttribute('draggable', 'false'));
    }
    function unlockForRetry() {
        locked = false;
        clearBtn.disabled = false;
        host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        host.querySelectorAll('.pvdd-tile, .pvdd-drop')
            .forEach(el => el.setAttribute('draggable', 'true'));
        refreshState();
    }
    container._pvddLock = lockWidget;
    container._pvddUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        // Build a {place: digit} map of what the student placed.
        const placement = {};
        places.forEach(p => {
            const drop = host.querySelector(`.pvdd-drop[data-place="${p}"]`);
            const tile = drop ? drop.querySelector('.pvdd-tile') : null;
            placement[p] = tile ? parseInt(tile.dataset.digit, 10) : null;
        });
        try { onPvDigitDragSubmit(q, placement); }
        catch (err) { console.error('onPvDigitDragSubmit failed:', err); }
    });

    refreshState();
}

// Returns true iff every place's tile digit matches the digit at that place
// in q.target. Empty columns count as wrong.
export function checkPvDigitDrag(q, placement) {
    if (!q || !placement || typeof placement !== 'object') return false;
    const target = Math.max(0, Math.floor(q.target || 0));
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice()
        : _placesForTarget(target);
    for (const p of places) {
        const expected = _digitAtPlace(target, p);
        const actual = placement[p];
        if (actual == null || actual !== expected) return false;
    }
    return true;
}

// Default no-op; question-render.js replaces this per-mount.
export let onPvDigitDragSubmit = function (_q, _placement) { /* noop */ };

export function setOnPvDigitDragSubmit(fn) {
    if (typeof fn === 'function') onPvDigitDragSubmit = fn;
}
