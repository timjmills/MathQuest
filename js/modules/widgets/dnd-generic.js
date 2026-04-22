// dnd-generic widget — generic drag-and-drop for two MAP modes:
//   q.dndMode === 'order'       → student drags tiles into a sequence
//   q.dndMode === 'categorize'  → student drags tiles into N labeled bins
//
// Question contracts (shared):
//   q.tiles:    [{ id, label }, ...]
//   q.text:     prompt
//   q.hint:     optional inline hint
//
// Order mode adds:
//   q.ans:        array of tile IDs in correct sequence
//   q.orderLabel: optional caption (e.g. "least to greatest")
//
// Categorize mode adds:
//   q.bins: [{ id, label }, ...]
//   q.ans:  { tileId: binId, ... }
//
// Native HTML5 drag events are used (no external libs). Every drag-drop
// interaction has a parallel click-and-click fallback so this satisfies
// WCAG 2.5.7 (Dragging Movements) — a tile can be "picked up" by clicking
// it, then "placed" by clicking a destination slot or bin.
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

// Module-shared "currently picked up" tile ID across all hosts. Only one
// tile may be active at a time globally — picking up a new tile clears
// any prior selection (consistent with the divisibility-sort pattern).
let _activeTileId = null;
let _activeHost = null;

function _announce(host, msg) {
    const live = host.querySelector('.dnd-live');
    if (live) live.textContent = msg;
}

function _renderOrder(q, container) {
    const tiles = Array.isArray(q.tiles) ? q.tiles : [];
    const slots = tiles.length;
    const large = _largeTargets();
    const tilesHtml = tiles.map(t => {
        return `<button type="button" class="dnd-tile${large ? ' large' : ''}"
            draggable="true"
            data-id="${_esc(t.id)}"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(t.label)}, draggable">${_esc(t.label)}</button>`;
    }).join('');

    const slotsHtml = Array.from({ length: slots }, (_, i) => {
        return `<div class="dnd-slot" data-slot="${i}" role="button" tabindex="0"
            aria-label="Slot ${i + 1} of ${slots}, empty">${i + 1}</div>`;
    }).join('');

    const orderCaption = q.orderLabel ? `<div class="dnd-order-caption">${_esc(q.orderLabel)}</div>` : '';

    container.innerHTML = `
        <div class="dnd-host" role="application" aria-label="Drag and drop ordering">
            <div class="dnd-prompt">${_esc(q.text || '')}</div>
            <div class="dnd-hint">Drag tiles or click to select then click destination.</div>
            ${orderCaption}
            <div class="dnd-tiles-tray" data-role="tray" aria-label="Available tiles">${tilesHtml}</div>
            <div class="dnd-slots" data-role="slots" aria-label="Order slots">${slotsHtml}</div>
            <div class="dnd-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="dnd-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const host = container.querySelector('.dnd-host');
    const tray = host.querySelector('[data-role="tray"]');
    const slotRow = host.querySelector('[data-role="slots"]');
    const submit = host.querySelector('.dnd-submit');
    let locked = false;

    function getCurrentOrder() {
        const out = [];
        slotRow.querySelectorAll('.dnd-slot').forEach(slot => {
            const tile = slot.querySelector('.dnd-tile');
            out.push(tile ? tile.dataset.id : null);
        });
        return out;
    }

    function refreshSubmit() {
        const order = getCurrentOrder();
        const allFilled = order.every(id => id != null);
        submit.disabled = !allFilled;
    }

    function clearActive() {
        if (_activeHost === host && _activeTileId) {
            const old = host.querySelector(`.dnd-tile[data-id="${CSS.escape(_activeTileId)}"]`);
            if (old) {
                old.classList.remove('tile-active');
                old.setAttribute('aria-pressed', 'false');
            }
        }
        if (_activeHost === host) {
            _activeTileId = null;
            _activeHost = null;
        }
    }

    function setActive(tileEl) {
        clearActive();
        if (!tileEl) return;
        tileEl.classList.add('tile-active');
        tileEl.setAttribute('aria-pressed', 'true');
        _activeTileId = tileEl.dataset.id;
        _activeHost = host;
        _announce(host, `Picked up ${tileEl.textContent.trim()}.`);
    }

    function placeTileInSlot(tileEl, slotEl) {
        if (!tileEl || !slotEl) return;
        // If slot already has a tile, swap: send displaced tile back to tray.
        const existing = slotEl.querySelector('.dnd-tile');
        if (existing && existing !== tileEl) {
            tray.appendChild(existing);
            existing.classList.remove('tile-active');
            existing.setAttribute('aria-pressed', 'false');
        }
        slotEl.appendChild(tileEl);
        slotEl.classList.add('filled');
        slotEl.setAttribute('aria-label',
            `Slot ${parseInt(slotEl.dataset.slot, 10) + 1}, filled with ${tileEl.textContent.trim()}`);
        // Clean up slots that have lost their tile (e.g. moved away)
        slotRow.querySelectorAll('.dnd-slot').forEach(s => {
            const has = !!s.querySelector('.dnd-tile');
            s.classList.toggle('filled', has);
            if (!has) {
                const idx = parseInt(s.dataset.slot, 10);
                s.setAttribute('aria-label', `Slot ${idx + 1} of ${slots}, empty`);
            }
        });
        clearActive();
        _announce(host, `${tileEl.textContent.trim()} placed in slot ${parseInt(slotEl.dataset.slot, 10) + 1}.`);
        refreshSubmit();
    }

    function returnTileToTray(tileEl) {
        if (!tileEl) return;
        tray.appendChild(tileEl);
        slotRow.querySelectorAll('.dnd-slot').forEach(s => {
            const has = !!s.querySelector('.dnd-tile');
            s.classList.toggle('filled', has);
            if (!has) {
                const idx = parseInt(s.dataset.slot, 10);
                s.setAttribute('aria-label', `Slot ${idx + 1} of ${slots}, empty`);
            }
        });
        clearActive();
        _announce(host, `${tileEl.textContent.trim()} returned to tray.`);
        refreshSubmit();
    }

    // ---- Click-and-click fallback ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const tile = e.target.closest('.dnd-tile');
        const slot = e.target.closest('.dnd-slot');
        if (tile && host.contains(tile)) {
            // Click the tile: pick up (toggle).
            if (_activeHost === host && _activeTileId === tile.dataset.id) {
                clearActive();
                _announce(host, 'Selection cleared.');
            } else {
                setActive(tile);
            }
            return;
        }
        if (slot && host.contains(slot)) {
            if (_activeHost === host && _activeTileId) {
                const tileEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(_activeTileId)}"]`);
                placeTileInSlot(tileEl, slot);
            }
        }
    });

    // Click the tray (empty area) with an active tile = return it.
    tray.addEventListener('click', (e) => {
        if (locked) return;
        if (e.target !== tray) return;
        if (_activeHost === host && _activeTileId) {
            const tileEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(_activeTileId)}"]`);
            returnTileToTray(tileEl);
        }
    });

    // Keyboard: Enter / Space on tiles & slots.
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tile = e.target.closest('.dnd-tile');
        const slot = e.target.closest('.dnd-slot');
        if (tile || slot) {
            e.preventDefault();
            (tile || slot).click();
        }
    });

    // ---- Native drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) return;
        const tile = e.target.closest('.dnd-tile');
        if (!tile || !host.contains(tile)) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('dragging');
    });
    host.addEventListener('dragend', (e) => {
        const tile = e.target.closest('.dnd-tile');
        if (tile) tile.classList.remove('dragging');
        host.querySelectorAll('.dnd-slot.over, .dnd-tiles-tray.over').forEach(el => el.classList.remove('over'));
    });
    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const slot = e.target.closest('.dnd-slot');
        const trayEl = e.target.closest('.dnd-tiles-tray');
        if (slot || trayEl) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            (slot || trayEl).classList.add('over');
        }
    });
    host.addEventListener('dragleave', (e) => {
        const target = e.target.closest('.dnd-slot, .dnd-tiles-tray');
        if (target) target.classList.remove('over');
    });
    host.addEventListener('drop', (e) => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tileEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(id)}"]`);
        if (!tileEl) return;
        const slot = e.target.closest('.dnd-slot');
        const trayEl = e.target.closest('.dnd-tiles-tray');
        if (slot) {
            e.preventDefault();
            slot.classList.remove('over');
            placeTileInSlot(tileEl, slot);
        } else if (trayEl) {
            e.preventDefault();
            trayEl.classList.remove('over');
            returnTileToTray(tileEl);
        }
    });

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.dnd-tile, .dnd-slot').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
        const order = getCurrentOrder();
        try { onDndSubmit(q, order); }
        catch (err) { console.error('onDndSubmit failed:', err); }
    });

    refreshSubmit();
}

function _renderCategorize(q, container) {
    const tiles = Array.isArray(q.tiles) ? q.tiles : [];
    const bins = Array.isArray(q.bins) ? q.bins : [];
    const large = _largeTargets();

    const tilesHtml = tiles.map(t => {
        return `<button type="button" class="dnd-tile${large ? ' large' : ''}"
            draggable="true"
            data-id="${_esc(t.id)}"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(t.label)}, draggable">${_esc(t.label)}</button>`;
    }).join('');

    const binsHtml = bins.map(b => {
        return `<div class="dnd-bin" data-bin="${_esc(b.id)}" role="button" tabindex="0"
                    aria-label="${_esc(b.label)} bin, empty">
            <div class="dnd-bin-label">${_esc(b.label)}</div>
            <div class="dnd-bin-tiles" data-bin-tiles="${_esc(b.id)}"></div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="dnd-host" role="application" aria-label="Drag and drop categorize">
            <div class="dnd-prompt">${_esc(q.text || '')}</div>
            <div class="dnd-hint">Drag tiles or click to select then click destination.</div>
            <div class="dnd-tiles-tray" data-role="tray" aria-label="Available tiles">${tilesHtml}</div>
            <div class="dnd-bins" data-role="bins">${binsHtml}</div>
            <div class="dnd-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="dnd-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const host = container.querySelector('.dnd-host');
    const tray = host.querySelector('[data-role="tray"]');
    const submit = host.querySelector('.dnd-submit');
    let locked = false;
    const totalTiles = tiles.length;

    function getPlacements() {
        const out = {};
        host.querySelectorAll('.dnd-bin').forEach(bin => {
            const binId = bin.dataset.bin;
            bin.querySelectorAll('.dnd-tile').forEach(t => {
                out[t.dataset.id] = binId;
            });
        });
        return out;
    }

    function refreshSubmit() {
        const placed = Object.keys(getPlacements()).length;
        submit.disabled = placed < totalTiles;
    }

    function refreshBinAria() {
        host.querySelectorAll('.dnd-bin').forEach(bin => {
            const binId = bin.dataset.bin;
            const binDef = bins.find(b => b.id === binId);
            const labelText = binDef ? binDef.label : binId;
            const count = bin.querySelectorAll('.dnd-tile').length;
            bin.setAttribute('aria-label',
                `${labelText} bin, ${count === 0 ? 'empty' : count + ' item' + (count === 1 ? '' : 's')}`);
        });
    }

    function clearActive() {
        if (_activeHost === host && _activeTileId) {
            const old = host.querySelector(`.dnd-tile[data-id="${CSS.escape(_activeTileId)}"]`);
            if (old) {
                old.classList.remove('tile-active');
                old.setAttribute('aria-pressed', 'false');
            }
        }
        if (_activeHost === host) {
            _activeTileId = null;
            _activeHost = null;
        }
    }

    function setActive(tileEl) {
        clearActive();
        if (!tileEl) return;
        tileEl.classList.add('tile-active');
        tileEl.setAttribute('aria-pressed', 'true');
        _activeTileId = tileEl.dataset.id;
        _activeHost = host;
        _announce(host, `Picked up ${tileEl.textContent.trim()}.`);
    }

    function placeTileInBin(tileEl, binEl) {
        if (!tileEl || !binEl) return;
        const dropArea = binEl.querySelector('.dnd-bin-tiles') || binEl;
        dropArea.appendChild(tileEl);
        clearActive();
        _announce(host, `${tileEl.textContent.trim()} placed in ${binEl.querySelector('.dnd-bin-label').textContent.trim()}.`);
        refreshBinAria();
        refreshSubmit();
    }

    function returnTileToTray(tileEl) {
        if (!tileEl) return;
        tray.appendChild(tileEl);
        clearActive();
        _announce(host, `${tileEl.textContent.trim()} returned to tray.`);
        refreshBinAria();
        refreshSubmit();
    }

    // ---- Click-and-click fallback ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const tile = e.target.closest('.dnd-tile');
        const bin = e.target.closest('.dnd-bin');
        if (tile && host.contains(tile)) {
            if (_activeHost === host && _activeTileId === tile.dataset.id) {
                clearActive();
                _announce(host, 'Selection cleared.');
            } else {
                setActive(tile);
            }
            return;
        }
        if (bin && host.contains(bin)) {
            if (_activeHost === host && _activeTileId) {
                const tileEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(_activeTileId)}"]`);
                placeTileInBin(tileEl, bin);
            }
        }
    });

    tray.addEventListener('click', (e) => {
        if (locked) return;
        // Only treat clicks on the tray background as "return" actions
        if (e.target !== tray) return;
        if (_activeHost === host && _activeTileId) {
            const tileEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(_activeTileId)}"]`);
            returnTileToTray(tileEl);
        }
    });

    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tile = e.target.closest('.dnd-tile');
        const bin = e.target.closest('.dnd-bin');
        if (tile || bin) {
            e.preventDefault();
            (tile || bin).click();
        }
    });

    // ---- Native drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) return;
        const tile = e.target.closest('.dnd-tile');
        if (!tile || !host.contains(tile)) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('dragging');
    });
    host.addEventListener('dragend', (e) => {
        const tile = e.target.closest('.dnd-tile');
        if (tile) tile.classList.remove('dragging');
        host.querySelectorAll('.dnd-bin.over, .dnd-tiles-tray.over').forEach(el => el.classList.remove('over'));
    });
    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const bin = e.target.closest('.dnd-bin');
        const trayEl = e.target.closest('.dnd-tiles-tray');
        if (bin || trayEl) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            (bin || trayEl).classList.add('over');
        }
    });
    host.addEventListener('dragleave', (e) => {
        const target = e.target.closest('.dnd-bin, .dnd-tiles-tray');
        if (target) target.classList.remove('over');
    });
    host.addEventListener('drop', (e) => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tileEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(id)}"]`);
        if (!tileEl) return;
        const bin = e.target.closest('.dnd-bin');
        const trayEl = e.target.closest('.dnd-tiles-tray');
        if (bin) {
            e.preventDefault();
            bin.classList.remove('over');
            placeTileInBin(tileEl, bin);
        } else if (trayEl) {
            e.preventDefault();
            trayEl.classList.remove('over');
            returnTileToTray(tileEl);
        }
    });

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.dnd-tile, .dnd-bin').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
        const placements = getPlacements();
        try { onDndSubmit(q, placements); }
        catch (err) { console.error('onDndSubmit failed:', err); }
    });

    refreshBinAria();
    refreshSubmit();
}

export function renderDndGeneric(q, container) {
    if (!container || !q) return;
    if (q.dndMode === 'categorize') {
        _renderCategorize(q, container);
    } else {
        // default to order
        _renderOrder(q, container);
    }
}

export function checkDndGeneric(q, st) {
    if (!q) return false;
    if (q.dndMode === 'categorize') {
        if (!st || typeof st !== 'object' || !q.ans || typeof q.ans !== 'object') return false;
        const ansKeys = Object.keys(q.ans);
        if (ansKeys.length === 0) return false;
        for (const k of ansKeys) {
            if (st[k] !== q.ans[k]) return false;
        }
        // No extra/wrong placements should sneak in either
        for (const k of Object.keys(st)) {
            if (!(k in q.ans)) return false;
        }
        return true;
    }
    // order mode
    if (!Array.isArray(st) || !Array.isArray(q.ans)) return false;
    if (st.length !== q.ans.length) return false;
    for (let i = 0; i < q.ans.length; i++) {
        if (st[i] !== q.ans[i]) return false;
    }
    return true;
}

// Default no-op stub. The integration glue (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onDndSubmit = function (_q, _state) { /* noop */ };

export function setOnDndSubmit(fn) {
    if (typeof fn === 'function') onDndSubmit = fn;
}
