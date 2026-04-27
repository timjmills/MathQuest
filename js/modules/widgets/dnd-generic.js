// dnd-generic widget — generic drag-and-drop for three MAP modes:
//   q.dndMode === 'order'        → student drags tiles into a sequence
//   q.dndMode === 'categorize'   → student drags tiles into N labeled bins
//   q.dndMode === 'shape-match'  → student drags name tiles into shape bins
//                                  (one tile per bin; distractor tiles allowed)
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
// Shape-match mode adds:
//   q.bins: [{ id, htmlLabel, ariaLabel }, ...]   bins display rich SVG/HTML
//                                                 above a single drop slot
//   q.ans:  { tileId: binId, ... }                only the matching tiles
//                                                 appear here; tray may also
//                                                 contain distractor tiles
//                                                 that do NOT belong in any bin
//
// Native HTML5 drag events are used (no external libs). Every drag-drop
// interaction has a parallel click-and-click fallback so this satisfies
// WCAG 2.5.7 (Dragging Movements) — a tile can be "picked up" by clicking
// it, then "placed" by clicking a destination slot or bin.
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

// Tiny inline TTS helper for the per-tile / per-bin 🔊 buttons. Unlike
// hints-speech.js (which gates on state.ttsEnabled because it auto-reads),
// these buttons are explicit user actions and should always speak when
// clicked, regardless of the global TTS toggle.
function _speakTileText(text) {
    if (!text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = 0.9;
        u.pitch = 1.05;
        window.speechSynthesis.speak(u);
    } catch (_) { /* speech not available */ }
}

// Reusable TTS button HTML. Lives inside .dnd-tile and .dnd-bin-label.
// data-tts holds the text to speak (already escaped).
function _ttsBtnHtml(text) {
    const safe = _esc(text || '');
    return `<span class="dnd-tts-btn" data-tts="${safe}" role="button" aria-label="Read aloud" tabindex="0">🔊</span>`;
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

// Tile description used in screen-reader announcements. Prefers the aria-label
// (which is set explicitly for both text and html tile modes) and falls back
// to textContent so legacy callers still work.
function _tileName(tileEl) {
    if (!tileEl) return 'tile';
    const aria = tileEl.getAttribute('aria-label') || '';
    if (aria) {
        // aria is "<label>, draggable" — strip the trailing role hint.
        return aria.replace(/,\s*draggable$/, '').trim() || 'tile';
    }
    return (tileEl.textContent || 'tile').trim();
}

function _renderOrder(q, container) {
    const tiles = Array.isArray(q.tiles) ? q.tiles : [];
    const slots = tiles.length;
    const large = _largeTargets();
    // Tiles support either:
    //   - text mode: { id, label }                → rendered as escaped text
    //   - html mode: { id, html, label?, ariaLabel? } → rendered as raw HTML
    //                                                    (used for SVG/clock content)
    const tilesHtml = tiles.map(t => {
        const useHtml = (t && typeof t.html === 'string' && t.html.length > 0);
        const aria = (t && t.ariaLabel) || (t && t.label) || 'tile';
        const inner = useHtml
            ? t.html
            : `<span class="dnd-tile-label">${_esc(t.label)}</span>`;
        const richClass = useHtml ? ' rich' : '';
        // For rich (SVG) tiles, prefer ariaLabel for the spoken text; otherwise label.
        const ttsText = useHtml ? (t.ariaLabel || t.label || '') : (t.label || '');
        return `<button type="button" class="dnd-tile${large ? ' large' : ''}${richClass}"
            draggable="true"
            data-id="${_esc(t.id)}"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(aria)}, draggable">${inner}${_ttsBtnHtml(ttsText)}</button>`;
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

    // ---- TTS icon handler (registered FIRST so it can stopImmediatePropagation
    //      and prevent the pick-up handler from firing on the same click). ----
    host.addEventListener('click', (e) => {
        const tts = e.target.closest('.dnd-tts-btn');
        if (!tts) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTileText(tts.dataset.tts || '');
    });
    host.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tts = e.target.closest('.dnd-tts-btn');
        if (!tts) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTileText(tts.dataset.tts || '');
    });
    // Block native drag from starting on the TTS icon itself.
    host.addEventListener('dragstart', (e) => {
        if (e.target.closest && e.target.closest('.dnd-tts-btn')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

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
        _announce(host, `Picked up ${_tileName(tileEl)}.`);
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
            `Slot ${parseInt(slotEl.dataset.slot, 10) + 1}, filled with ${_tileName(tileEl)}`);
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
        _announce(host, `${_tileName(tileEl)} placed in slot ${parseInt(slotEl.dataset.slot, 10) + 1}.`);
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
        _announce(host, `${_tileName(tileEl)} returned to tray.`);
        refreshSubmit();
    }

    // ---- Click-and-click fallback ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        // TTS icon clicks are handled separately and must not select/place tiles.
        if (e.target.closest && e.target.closest('.dnd-tts-btn')) return;
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

    // ---- TOUCH support (mobile/tablet) ----
    enableHostTouchDrag(host, {
        tileSelector: '.dnd-tile',
        dropSelector: '.dnd-slot, .dnd-tiles-tray',
        isLocked: () => locked,
        onDrop: (zone, tileEl) => {
            if (zone.classList.contains('dnd-slot')) {
                placeTileInSlot(tileEl, zone);
            } else if (zone.classList.contains('dnd-tiles-tray')) {
                returnTileToTray(tileEl);
            }
        },
    });

    // Lock helper used by integrations that have decided the widget should stop
    // accepting input (e.g. MAP test mode, or after the student finally got it
    // all right). Exposed via container._dndLock so question-render can call it.
    function lockWidget() {
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.dnd-tile, .dnd-slot').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
    }
    // Unlock helper used to clear per-tile feedback classes and re-enable
    // dragging for the in-place correction UX. Wrong tiles return to the tray.
    function unlockForRetry(wrongTileIds) {
        if (!locked) {
            // Even if not locked, clean up stale flash classes from a prior submit
            host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
                el.classList.remove('correct-flash', 'wrong-flash');
            });
        }
        locked = false;
        host.querySelectorAll('.dnd-tile').forEach(el => {
            el.setAttribute('draggable', 'true');
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        // Move wrong tiles back to the tray so the student can re-place them.
        if (Array.isArray(wrongTileIds) && wrongTileIds.length) {
            wrongTileIds.forEach(tid => {
                const tEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(String(tid))}"]`);
                if (tEl && tEl.parentNode !== tray) tray.appendChild(tEl);
            });
            // Clean up emptied slots' aria/filled state
            slotRow.querySelectorAll('.dnd-slot').forEach(s => {
                const has = !!s.querySelector('.dnd-tile');
                s.classList.toggle('filled', has);
                if (!has) {
                    const idx = parseInt(s.dataset.slot, 10);
                    s.setAttribute('aria-label', `Slot ${idx + 1} of ${slots}, empty`);
                }
            });
        }
        refreshSubmit();
    }
    container._dndLock = lockWidget;
    container._dndUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        // Briefly disable while the integration decides; integration may re-
        // enable via container._dndUnlockForRetry on a wrong submit.
        submit.disabled = true;
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
        const useHtml = (t && typeof t.html === 'string' && t.html.length > 0);
        const aria = (t && t.ariaLabel) || (t && t.label) || 'tile';
        const inner = useHtml
            ? t.html
            : `<span class="dnd-tile-label">${_esc(t.label)}</span>`;
        const richClass = useHtml ? ' rich' : '';
        const ttsText = useHtml ? (t.ariaLabel || t.label || '') : (t.label || '');
        return `<button type="button" class="dnd-tile${large ? ' large' : ''}${richClass}"
            draggable="true"
            data-id="${_esc(t.id)}"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(aria)}, draggable">${inner}${_ttsBtnHtml(ttsText)}</button>`;
    }).join('');

    const binsHtml = bins.map(b => {
        return `<div class="dnd-bin" data-bin="${_esc(b.id)}" role="button" tabindex="0"
                    aria-label="${_esc(b.label)} bin, empty">
            <div class="dnd-bin-label"><span>${_esc(b.label)}</span>${_ttsBtnHtml(b.label)}</div>
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

    // ---- TTS icon handler (registered FIRST so it can stopImmediatePropagation
    //      and prevent the pick-up handler from firing on the same click). ----
    host.addEventListener('click', (e) => {
        const tts = e.target.closest('.dnd-tts-btn');
        if (!tts) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTileText(tts.dataset.tts || '');
    });
    host.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tts = e.target.closest('.dnd-tts-btn');
        if (!tts) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTileText(tts.dataset.tts || '');
    });
    host.addEventListener('dragstart', (e) => {
        if (e.target.closest && e.target.closest('.dnd-tts-btn')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

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
        _announce(host, `Picked up ${_tileName(tileEl)}.`);
    }

    function placeTileInBin(tileEl, binEl) {
        if (!tileEl || !binEl) return;
        const dropArea = binEl.querySelector('.dnd-bin-tiles') || binEl;
        dropArea.appendChild(tileEl);
        clearActive();
        // Read from the inner <span> (not the whole label container) so the
        // 🔊 TTS icon text isn't included in the screen-reader announcement.
        const labelEl = binEl.querySelector('.dnd-bin-label > span') || binEl.querySelector('.dnd-bin-label');
        _announce(host, `${_tileName(tileEl)} placed in ${(labelEl ? labelEl.textContent : '').trim()}.`);
        refreshBinAria();
        refreshSubmit();
    }

    function returnTileToTray(tileEl) {
        if (!tileEl) return;
        tray.appendChild(tileEl);
        clearActive();
        _announce(host, `${_tileName(tileEl)} returned to tray.`);
        refreshBinAria();
        refreshSubmit();
    }

    // ---- Click-and-click fallback ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        // TTS icon clicks are handled separately and must not select/place tiles.
        if (e.target.closest && e.target.closest('.dnd-tts-btn')) return;
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

    // ---- TOUCH support (mobile/tablet) ----
    enableHostTouchDrag(host, {
        tileSelector: '.dnd-tile',
        dropSelector: '.dnd-bin, .dnd-tiles-tray',
        isLocked: () => locked,
        onDrop: (zone, tileEl) => {
            if (zone.classList.contains('dnd-bin')) {
                placeTileInBin(tileEl, zone);
            } else if (zone.classList.contains('dnd-tiles-tray')) {
                returnTileToTray(tileEl);
            }
        },
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.dnd-tile, .dnd-bin').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
    }
    function unlockForRetry(wrongTileIds) {
        if (!locked) {
            host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
                el.classList.remove('correct-flash', 'wrong-flash');
            });
        }
        locked = false;
        host.querySelectorAll('.dnd-tile').forEach(el => {
            el.setAttribute('draggable', 'true');
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        if (Array.isArray(wrongTileIds) && wrongTileIds.length) {
            wrongTileIds.forEach(tid => {
                const tEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(String(tid))}"]`);
                if (tEl && tEl.parentNode !== tray) tray.appendChild(tEl);
            });
        }
        refreshBinAria();
        refreshSubmit();
    }
    container._dndLock = lockWidget;
    container._dndUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        const placements = getPlacements();
        try { onDndSubmit(q, placements); }
        catch (err) { console.error('onDndSubmit failed:', err); }
    });

    refreshBinAria();
    refreshSubmit();
}

// Shape-match mode: bins host rich HTML (SVG shape figures); each bin holds
// a single name tile dragged from the palette. Distractor tiles in the tray
// are allowed to remain unplaced — submit becomes enabled when all bins
// are filled, regardless of how many distractor tiles linger in the tray.
function _renderShapeMatch(q, container) {
    const tiles = Array.isArray(q.tiles) ? q.tiles : [];
    const bins = Array.isArray(q.bins) ? q.bins : [];
    const large = _largeTargets();

    const tilesHtml = tiles.map(t => {
        const aria = (t && t.ariaLabel) || (t && t.label) || 'tile';
        const inner = `<span class="dnd-tile-label">${_esc(t.label)}</span>`;
        const ttsText = t.label || '';
        return `<button type="button" class="dnd-tile${large ? ' large' : ''}"
            draggable="true"
            data-id="${_esc(t.id)}"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(aria)}, draggable">${inner}${_ttsBtnHtml(ttsText)}</button>`;
    }).join('');

    const binsHtml = bins.map(b => {
        const figureHtml = (b && typeof b.htmlLabel === 'string') ? b.htmlLabel : '';
        const aria = (b && b.ariaLabel) || 'shape';
        return `<div class="dnd-bin dnd-shape-bin" data-bin="${_esc(b.id)}" role="button" tabindex="0"
                    aria-label="${_esc(aria)} drop zone, empty">
            <div class="dnd-shape-figure">${figureHtml}</div>
            <div class="dnd-bin-tiles dnd-shape-slot" data-bin-tiles="${_esc(b.id)}"
                 aria-label="Drop a name here">
                <span class="dnd-shape-placeholder">drop name here</span>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="dnd-host dnd-shape-match-host" role="application" aria-label="Match names to shapes">
            <div class="dnd-prompt">${_esc(q.text || '')}</div>
            <div class="dnd-hint">Drag each name onto the matching shape, or click a name then click a shape.</div>
            <div class="dnd-bins dnd-shape-bins" data-role="bins">${binsHtml}</div>
            <div class="dnd-tiles-tray dnd-shape-tray" data-role="tray" aria-label="Available names">${tilesHtml}</div>
            <div class="dnd-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="dnd-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const host = container.querySelector('.dnd-host');
    const tray = host.querySelector('[data-role="tray"]');
    const submit = host.querySelector('.dnd-submit');
    let locked = false;

    // ---- TTS handlers (registered first so they short-circuit pick-up). ----
    host.addEventListener('click', (e) => {
        const tts = e.target.closest('.dnd-tts-btn');
        if (!tts) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTileText(tts.dataset.tts || '');
    });
    host.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tts = e.target.closest('.dnd-tts-btn');
        if (!tts) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTileText(tts.dataset.tts || '');
    });
    host.addEventListener('dragstart', (e) => {
        if (e.target.closest && e.target.closest('.dnd-tts-btn')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    function getPlacements() {
        const out = {};
        host.querySelectorAll('.dnd-bin').forEach(bin => {
            const binId = bin.dataset.bin;
            const tile = bin.querySelector('.dnd-tile');
            if (tile) out[tile.dataset.id] = binId;
        });
        return out;
    }

    function refreshSubmit() {
        // Submit enabled when every bin holds exactly one tile.
        const allFilled = bins.every(b => {
            const binEl = host.querySelector(`.dnd-bin[data-bin="${CSS.escape(b.id)}"]`);
            return !!(binEl && binEl.querySelector('.dnd-tile'));
        });
        submit.disabled = !allFilled;
    }

    function refreshBinAria() {
        host.querySelectorAll('.dnd-bin').forEach(bin => {
            const binDef = bins.find(b => b.id === bin.dataset.bin);
            const aria = (binDef && binDef.ariaLabel) || 'shape';
            const tile = bin.querySelector('.dnd-tile');
            bin.setAttribute('aria-label',
                `${aria} drop zone, ${tile ? 'filled with ' + _tileName(tile) : 'empty'}`);
            // Hide the placeholder text when a tile is present.
            const ph = bin.querySelector('.dnd-shape-placeholder');
            if (ph) ph.style.display = tile ? 'none' : '';
        });
    }

    function clearActive() {
        if (_activeHost === host && _activeTileId) {
            const old = host.querySelector(`.dnd-tile[data-id="${CSS.escape(_activeTileId)}"]`);
            if (old) {
                old.classList.remove('tile-active');
                old.removeAttribute('data-selected');
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
        // Clear any sibling selection markers in this host (defensive — should
        // already be cleared by clearActive, but covers edge cases where the
        // attribute was set directly).
        host.querySelectorAll('.dnd-tile[data-selected]').forEach(el => {
            if (el !== tileEl) el.removeAttribute('data-selected');
        });
        tileEl.classList.add('tile-active');
        tileEl.setAttribute('data-selected', '1');
        tileEl.setAttribute('aria-pressed', 'true');
        _activeTileId = tileEl.dataset.id;
        _activeHost = host;
        _announce(host, `Picked up ${_tileName(tileEl)}.`);
    }

    function placeTileInBin(tileEl, binEl) {
        if (!tileEl || !binEl) return;
        // Each shape bin holds at most ONE tile — displace any existing tile
        // back to the tray before placing the new one.
        const existing = binEl.querySelector('.dnd-tile');
        if (existing && existing !== tileEl) {
            tray.appendChild(existing);
        }
        const dropArea = binEl.querySelector('.dnd-bin-tiles') || binEl;
        dropArea.appendChild(tileEl);
        clearActive();
        const binDef = bins.find(b => b.id === binEl.dataset.bin);
        const binName = (binDef && binDef.ariaLabel) || 'shape';
        _announce(host, `${_tileName(tileEl)} placed on ${binName}.`);
        refreshBinAria();
        refreshSubmit();
    }

    function returnTileToTray(tileEl) {
        if (!tileEl) return;
        tray.appendChild(tileEl);
        clearActive();
        _announce(host, `${_tileName(tileEl)} returned to tray.`);
        refreshBinAria();
        refreshSubmit();
    }

    // True when the tile is sitting in the tray (un-placed). Tiles inside a
    // .dnd-bin are considered placed and should not be re-selectable via the
    // click-then-click flow.
    function _isTilePlaced(tileEl) {
        return !!(tileEl && tileEl.closest('.dnd-bin'));
    }

    // ---- Click-and-click fallback ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        if (e.target.closest && e.target.closest('.dnd-tts-btn')) return;
        const tile = e.target.closest('.dnd-tile');
        const bin = e.target.closest('.dnd-bin');
        if (tile && host.contains(tile)) {
            // Ignore clicks on tiles already placed in a bin — only un-placed
            // tray tiles can be picked up via the click-then-click flow.
            if (_isTilePlaced(tile)) return;
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

    // ---- TOUCH support (mobile/tablet) ----
    enableHostTouchDrag(host, {
        tileSelector: '.dnd-tile',
        dropSelector: '.dnd-bin, .dnd-tiles-tray',
        isLocked: () => locked,
        onDrop: (zone, tileEl) => {
            if (zone.classList.contains('dnd-bin')) {
                placeTileInBin(tileEl, zone);
            } else if (zone.classList.contains('dnd-tiles-tray')) {
                returnTileToTray(tileEl);
            }
        },
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.dnd-tile, .dnd-bin').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
    }
    function unlockForRetry(wrongTileIds) {
        if (!locked) {
            host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
                el.classList.remove('correct-flash', 'wrong-flash');
            });
        }
        locked = false;
        host.querySelectorAll('.dnd-tile').forEach(el => {
            el.setAttribute('draggable', 'true');
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        if (Array.isArray(wrongTileIds) && wrongTileIds.length) {
            wrongTileIds.forEach(tid => {
                const tEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(String(tid))}"]`);
                if (tEl && tEl.parentNode !== tray) tray.appendChild(tEl);
            });
        }
        refreshBinAria();
        refreshSubmit();
    }
    container._dndLock = lockWidget;
    container._dndUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        const placements = getPlacements();
        try { onDndSubmit(q, placements); }
        catch (err) { console.error('onDndSubmit failed:', err); }
    });

    refreshBinAria();
    refreshSubmit();
}

export function renderDndGeneric(q, container) {
    if (!container || !q) return;
    if (q.dndMode === 'shape-match') {
        _renderShapeMatch(q, container);
    } else if (q.dndMode === 'categorize') {
        _renderCategorize(q, container);
    } else {
        // default to order
        _renderOrder(q, container);
    }
}

export function checkDndGeneric(q, st) {
    if (!q) return false;
    if (q.dndMode === 'shape-match') {
        // Each bin must hold a single tile whose label is in that bin's
        // acceptedNames chain (inclusive hierarchy: e.g., a square bin accepts
        // "square", "rectangle", "rhombus", "parallelogram", "trapezoid",
        // "quadrilateral"). Distractor tiles may remain unplaced. If a bin
        // exposes no acceptedNames (legacy data), fall back to the strict
        // tileId === q.ans[tileId] mapping for backward compatibility.
        if (!st || typeof st !== 'object' || !q.ans || typeof q.ans !== 'object') return false;
        const bins = Array.isArray(q.bins) ? q.bins : [];
        const tiles = Array.isArray(q.tiles) ? q.tiles : [];
        const hasHierarchy = bins.length > 0 && bins.every(b => Array.isArray(b && b.acceptedNames) && b.acceptedNames.length > 0);
        if (!hasHierarchy) {
            // Legacy strict check: tileId must land in the answer-key's binId.
            const ansKeys = Object.keys(q.ans);
            if (ansKeys.length === 0) return false;
            for (const k of ansKeys) {
                if (st[k] !== q.ans[k]) return false;
            }
            for (const k of Object.keys(st)) {
                if (!(k in q.ans)) return false;
            }
            return true;
        }
        // Hierarchy-aware check.
        const tileById = {};
        for (const t of tiles) {
            if (t && t.id != null) tileById[t.id] = t;
        }
        // Build placements grouped by binId — each bin must end up with exactly
        // one placed tile (the UI also enforces this via the submit-enabled gate).
        const placedByBin = {};
        for (const tileId of Object.keys(st)) {
            const binId = st[tileId];
            if (!binId) continue;
            if (placedByBin[binId]) return false;        // two tiles in one bin
            placedByBin[binId] = tileId;
        }
        for (const bin of bins) {
            const placedTileId = placedByBin[bin.id];
            if (!placedTileId) return false;             // empty bin
            const tile = tileById[placedTileId];
            const label = tile && typeof tile.label === 'string'
                ? tile.label.trim().toLowerCase()
                : '';
            if (!label) return false;
            const accepted = bin.acceptedNames.map(n => String(n).trim().toLowerCase());
            if (!accepted.includes(label)) return false;  // wrong name for this shape
        }
        return true;
    }
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
