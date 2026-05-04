// sentence-build.js — Drag word tiles into order to build a correct sentence.
//
// Question contract:
//   q.target_sentence:            string    — e.g., "The cat sat on the mat."
//   q.word_tiles:                 string[]  — shuffled words
//   q.task_text?:                 string    — default "Drag the words to build the sentence."
//   q.allow_capitalization_help?: boolean   — default true (highlight initial-cap tile)
//   q.allow_punctuation_help?:    boolean   — default true (highlight terminal-punct tile)
//   q.k2_appropriate?:            boolean   — larger tile style
//
// Interaction:
//   Desktop: HTML5 drag from pool → slot; drag from slot → pool to return.
//   Mobile:  Pointer events for ghost drag.
//   Click:   Click tile to "pick up", click slot to "place".
//   Submit:  Fires automatically when all slots are filled; or manually.
//
// Partial-correct lock: on wrong submit, tiles in correct positions lock green;
// tiles in wrong positions return to pool.
//
// Exports:
//   renderSentenceBuild(q, container)
//   checkSentenceBuild(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _announce(host, msg) {
    const live = host.querySelector('.lq-sb-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
}

/**
 * Derive the canonical correct sequence from q.target_sentence by splitting
 * on whitespace.
 */
function _correctOrder(q) {
    const sent = q.target_sentence || '';
    return sent.trim().split(/\s+/).filter(w => w.length > 0);
}

/**
 * Returns true if word is a tile that starts the sentence (initial capital
 * but not all-caps, not a single letter, and capitalisation help is on).
 */
function _isFirstWordTile(word, correctWords, q) {
    if (!(q.allow_capitalization_help !== false)) return false;
    return word === correctWords[0];
}

/**
 * Returns true if tile ends with sentence-terminal punctuation.
 */
function _isLastWordTile(word, correctWords, q) {
    if (!(q.allow_punctuation_help !== false)) return false;
    return word === correctWords[correctWords.length - 1];
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderSentenceBuild(q, container) {
    if (!container || !q) return;

    const tiles      = Array.isArray(q.word_tiles) ? q.word_tiles : [];
    const taskText   = q.task_text || 'Drag the words to build the sentence.';
    const isK2       = !!q.k2_appropriate;
    const correct    = _correctOrder(q);
    const slotCount  = correct.length;

    if (!tiles.length || !slotCount) {
        container.innerHTML = '<p class="lq-widget-error">sentence-build: missing word_tiles or target_sentence.</p>';
        return;
    }

    // Assign stable id to each tile (index-based since words may repeat)
    const tileData = tiles.map((word, i) => ({ id: `tile-${i}`, word }));

    // Shuffle (already shuffled by content author, but ensure display order
    // doesn't accidentally match correct order by doing a light shuffle).
    const displayTiles = tileData.slice().sort(() => Math.random() - 0.5);

    const tileClass = isK2 ? 'lq-sb-tile lq-sb-tile--k2' : 'lq-sb-tile';

    // Determine hint classes
    const tilesHtml = displayTiles.map(t => {
        let hintClass = '';
        if (_isFirstWordTile(t.word, correct, q)) hintClass = ' lq-sb-tile--first';
        else if (_isLastWordTile(t.word, correct, q)) hintClass = ' lq-sb-tile--last';

        return `<div
            class="${tileClass}${hintClass}"
            draggable="true"
            data-tile-id="${_esc(t.id)}"
            data-word="${_esc(t.word)}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(t.word)}, draggable tile"
            >${_esc(t.word)}</div>`;
    }).join('');

    // Drop slots
    const slotsHtml = Array.from({ length: slotCount }, (_, i) =>
        `<div
            class="lq-sb-slot"
            data-slot-index="${i}"
            role="listbox"
            aria-label="Position ${i + 1}, empty">
        </div>`
    ).join('');

    container.innerHTML = `
        <div class="lq-sb-host${isK2 ? ' lq-sb-host--k2' : ''}"
             role="application"
             aria-label="Sentence builder">

            <p class="lq-sb-task-text">${_esc(taskText)}</p>

            <div class="lq-sb-slot-row" aria-label="Build your sentence here">
                ${slotsHtml}
            </div>

            <div class="lq-sb-pool" data-role="pool" aria-label="Word bank">
                ${tilesHtml}
            </div>

            <div class="lq-sb-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-sb-submit primary-btn" disabled>Submit</button>
        </div>`;

    _attachInteraction(q, container, tileData, correct, isK2);

    if (isK2 && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }
}

// ─── interaction ─────────────────────────────────────────────────────────────

function _attachInteraction(q, container, tileData, correct, isK2) {
    const host        = container.querySelector('.lq-sb-host');
    const pool        = host.querySelector('.lq-sb-pool');
    const slotRow     = host.querySelector('.lq-sb-slot-row');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn   = host.querySelector('.lq-sb-submit');
    if (!host) return;

    let locked    = false;
    let activeId  = null;   // keyboard / click-and-click active tile id

    // ── helpers ──────────────────────────────────────────────────────────────

    function allTiles() {
        return Array.from(host.querySelectorAll('.lq-sb-tile'));
    }

    function allSlots() {
        return Array.from(host.querySelectorAll('.lq-sb-slot'));
    }

    function getTileById(id) {
        return host.querySelector(`.lq-sb-tile[data-tile-id="${CSS.escape(id)}"]`);
    }

    function getSlotEl(index) {
        return host.querySelector(`.lq-sb-slot[data-slot-index="${index}"]`);
    }

    function getTileInSlot(slotEl) {
        return slotEl.querySelector('.lq-sb-tile');
    }

    function slotsFilled() {
        return allSlots().filter(s => getTileInSlot(s) !== null).length;
    }

    function refreshSubmit() {
        submitBtn.disabled = locked || slotsFilled() < correct.length;
    }

    function refreshSlotAria() {
        allSlots().forEach(slot => {
            const tile = getTileInSlot(slot);
            const idx  = slot.dataset.slotIndex;
            slot.setAttribute('aria-label',
                tile
                    ? `Position ${parseInt(idx)+1}: ${tile.dataset.word}`
                    : `Position ${parseInt(idx)+1}, empty`);
        });
    }

    function moveTileToSlot(tile, slotEl) {
        // If slot already occupied, return existing tile to pool first
        const existing = getTileInSlot(slotEl);
        if (existing && existing !== tile) {
            pool.appendChild(existing);
            existing.setAttribute('aria-pressed', 'false');
        }
        slotEl.appendChild(tile);
        tile.setAttribute('aria-pressed', 'false');
        _announce(host, `${tile.dataset.word} placed in position ${parseInt(slotEl.dataset.slotIndex)+1}.`);
        refreshSlotAria();
        refreshSubmit();
        // Auto-submit when all slots filled
        if (!locked && slotsFilled() === correct.length) {
            setTimeout(() => { if (!locked) submitBtn.click(); }, 350);
        }
    }

    function returnTileToPool(tile) {
        pool.appendChild(tile);
        tile.setAttribute('aria-pressed', 'false');
        _announce(host, `${tile.dataset.word} returned to word bank.`);
        refreshSlotAria();
        refreshSubmit();
    }

    function setActive(tile) {
        clearActive();
        if (!tile) return;
        activeId = tile.dataset.tileId;
        tile.classList.add('lq-sb-tile--active');
        tile.setAttribute('aria-pressed', 'true');
        _announce(host, `Picked up ${tile.dataset.word}. Press a slot to place it.`);
    }

    function clearActive() {
        if (activeId) {
            const old = getTileById(activeId);
            if (old) {
                old.classList.remove('lq-sb-tile--active');
                old.setAttribute('aria-pressed', 'false');
            }
        }
        activeId = null;
    }

    // ── click-and-click ───────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;

        const tileEl = e.target.closest('.lq-sb-tile');
        const slotEl = e.target.closest('.lq-sb-slot');

        if (tileEl && host.contains(tileEl)) {
            if (tileEl.dataset.locked === '1') return;

            if (activeId === tileEl.dataset.tileId) {
                clearActive();
            } else if (activeId) {
                // Another tile is active — swap active tile into the slot this tile occupies
                const activeTile = getTileById(activeId);
                if (activeTile) {
                    const tileSlot = tileEl.closest('.lq-sb-slot');
                    if (tileSlot) {
                        // Swap: place active tile in this slot
                        moveTileToSlot(activeTile, tileSlot);
                        clearActive();
                    } else {
                        // Both in pool — just change selection
                        setActive(tileEl);
                    }
                }
            } else {
                setActive(tileEl);
            }
            return;
        }

        if (slotEl && host.contains(slotEl)) {
            if (activeId) {
                const activeTile = getTileById(activeId);
                if (activeTile) {
                    moveTileToSlot(activeTile, slotEl);
                    clearActive();
                }
            } else {
                // Click on occupied slot with no active tile → return tile to pool
                const occupant = getTileInSlot(slotEl);
                if (occupant && occupant.dataset.locked !== '1') {
                    returnTileToPool(occupant);
                }
            }
        }
    });

    // ── keyboard ──────────────────────────────────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key === 'Enter' || e.key === ' ') {
            const tileEl = e.target.closest('.lq-sb-tile');
            const slotEl = e.target.closest('.lq-sb-slot');
            if (tileEl || slotEl) {
                e.preventDefault();
                (tileEl || slotEl).click();
            }
        }
        if (e.key === 'Escape') {
            clearActive();
        }
    });

    // ── HTML5 drag ────────────────────────────────────────────────────────────
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-sb-tile');
        if (!tile || tile.dataset.locked === '1') return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.tileId);
        tile.classList.add('lq-sb-dragging');
    });

    host.addEventListener('dragend', e => {
        const tile = e.target.closest('.lq-sb-tile');
        if (tile) tile.classList.remove('lq-sb-dragging');
        host.querySelectorAll('.lq-sb-over').forEach(el => el.classList.remove('lq-sb-over'));
    });

    host.addEventListener('dragover', e => {
        if (locked) return;
        const slotEl = e.target.closest('.lq-sb-slot');
        const poolEl = e.target.closest('[data-role="pool"]');
        if (slotEl || poolEl) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            (slotEl || poolEl).classList.add('lq-sb-over');
        }
    });

    host.addEventListener('dragleave', e => {
        const el = e.target.closest('.lq-sb-slot, [data-role="pool"]');
        if (el) el.classList.remove('lq-sb-over');
    });

    host.addEventListener('drop', e => {
        if (locked) return;
        const id   = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tile = host.querySelector(`.lq-sb-tile[data-tile-id="${CSS.escape(id)}"]`);
        if (!tile) return;

        const slotEl = e.target.closest('.lq-sb-slot');
        const poolEl = e.target.closest('[data-role="pool"]');

        if (slotEl) {
            e.preventDefault();
            slotEl.classList.remove('lq-sb-over');
            moveTileToSlot(tile, slotEl);
        } else if (poolEl) {
            e.preventDefault();
            poolEl.classList.remove('lq-sb-over');
            returnTileToPool(tile);
        }
    });

    // ── pointer/touch ─────────────────────────────────────────────────────────
    let _ptTile = null, _ptGhost = null;

    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-sb-tile');
        if (!tile || tile.dataset.locked === '1' || e.pointerType === 'mouse') return;
        e.preventDefault();
        _ptTile = tile;
        _ptGhost = tile.cloneNode(true);
        _ptGhost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0.8;
            left:${e.clientX-20}px;top:${e.clientY-20}px;`;
        document.body.appendChild(_ptGhost);
        tile.classList.add('lq-sb-dragging');
    }, { passive: false });

    host.addEventListener('pointermove', e => {
        if (!_ptTile || !_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 20}px`;
        _ptGhost.style.top  = `${e.clientY - 20}px`;
    }, { passive: false });

    host.addEventListener('pointerup', e => {
        if (!_ptTile) return;
        _ptTile.classList.remove('lq-sb-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }

        const els  = document.elementsFromPoint(e.clientX, e.clientY);
        const slot = els.find(el => el.classList.contains('lq-sb-slot') || el.closest('.lq-sb-slot'));
        const pl   = els.find(el => el === pool || el.closest('[data-role="pool"]'));

        if (slot) {
            const slotEl = slot.classList.contains('lq-sb-slot') ? slot : slot.closest('.lq-sb-slot');
            if (slotEl) moveTileToSlot(_ptTile, slotEl);
        } else if (pl) {
            returnTileToPool(_ptTile);
        }
        _ptTile = null;
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        // Build placed order from slots
        const placed = allSlots().map(slot => {
            const tile = getTileInSlot(slot);
            return tile ? tile.dataset.word : null;
        });

        const firstAttempt = isFirstAttempt();
        let wrongCount     = 0;

        allSlots().forEach((slot, i) => {
            const tile = getTileInSlot(slot);
            if (!tile) return;

            if (tile.dataset.word === correct[i]) {
                tile.classList.add('lq-locked-correct');
                tile.dataset.locked = '1';
                tile.setAttribute('draggable', 'false');
            } else {
                wrongCount++;
                tile.classList.add('lq-wrong-persistent');
                returnTileToPool(tile);
                setTimeout(() => tile.classList.remove('lq-wrong-persistent'), 1600);
            }
        });

        const allCorrect = wrongCount === 0;
        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = 'Correct! Great sentence!';
            locked = true;
            submitBtn.disabled = true;
            allTiles().forEach(t => t.setAttribute('draggable', 'false'));
        } else {
            feedbackZone.textContent = `${wrongCount} word${wrongCount === 1 ? '' : 's'} in the wrong spot — try again.`;
            refreshSubmit();
        }

        refreshSlotAria();
        container._lqLastResult = { correct: allCorrect, submitted: placed, firstAttempt };
    });

    refreshSlotAria();
    refreshSubmit();
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkSentenceBuild(q, container) {
    if (!container) return { correct: false, submitted: [] };

    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-sb-host');
    if (!host) return { correct: false, submitted: [] };

    const slots    = Array.from(host.querySelectorAll('.lq-sb-slot'));
    const placed   = slots.map(slot => {
        const tile = slot.querySelector('.lq-sb-tile');
        return tile ? tile.dataset.word : null;
    });

    const correct  = _correctOrder(q);
    const allCorrect = placed.length === correct.length &&
        placed.every((w, i) => w === correct[i]);

    return { correct: allCorrect, submitted: placed };
}
