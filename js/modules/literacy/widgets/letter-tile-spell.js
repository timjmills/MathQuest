// letter-tile-spell.js — Audio-cued drag-to-spell widget.
//
// Student hears the target word (TTS), then drags lettered tiles into
// ordered spelling slots. Includes a Hint button that highlights the
// first unplaced correct tile.
//
// Derives from the same drag / click-and-click / keyboard pattern as
// dnd-linked and sound-box, but:
//   - tiles are individual letters (a, t, c) not phoneme chips (/æ/, /t/)
//   - slot order is significant (must match target_word letter sequence)
//   - K-2 variant: vowels orange, consonants blue (color-coded tiles)
//
// Question contract:
//   q.target_word:           string   — word to spell (e.g., 'ship', 'flag')
//   q.audio_text?:           string   — TTS text; default = q.target_word
//   q.starting_letters_pool: string[] — tiles shown (correct letters + distractors)
//   q.show_picture?:         string   — optional emoji/image hint above slots
//   q.k2_appropriate?:       boolean  — large tiles + color-coding
//
// Partial-correct lock: correct slots lock green; wrong slots clear + red flash.
//
// Exports:
//   renderLetterTileSpell(q, container)
//   checkLetterTileSpell(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _speak(text) {
    if (!text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = 0.8;
        window.speechSynthesis.speak(u);
    } catch (_) { /* not available */ }
}

function _announce(host, msg) {
    const live = host.querySelector('.lq-lts-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function _tileColorClass(letter, isK2) {
    if (!isK2) return '';
    return VOWELS.has(letter.toLowerCase()) ? ' lq-lts-tile--vowel' : ' lq-lts-tile--consonant';
}

// Module-level active tile state
let _activeId = null;
let _activeHost = null;

function _clearActive(host) {
    if (_activeHost !== host) return;
    if (_activeId) {
        const el = host.querySelector(`.lq-lts-tile[data-id="${CSS.escape(_activeId)}"]`);
        if (el) { el.classList.remove('lq-dnd-tile--active'); el.setAttribute('aria-pressed', 'false'); }
    }
    _activeId = null;
    _activeHost = null;
}

function _setActive(host, tileEl) {
    _clearActive(host);
    if (!tileEl) return;
    tileEl.classList.add('lq-dnd-tile--active');
    tileEl.setAttribute('aria-pressed', 'true');
    _activeId = tileEl.dataset.id;
    _activeHost = host;
    _announce(host, `Picked up tile ${tileEl.dataset.letter}.`);
}

// ─── render ───────────────────────────────────────────────────────────────────

export function renderLetterTileSpell(q, container) {
    if (!container || !q) return;

    const targetWord = (q.target_word || '').toLowerCase();
    const audioText = q.audio_text || q.target_word || '';
    const isK2 = !!q.k2_appropriate;
    const letterCount = targetWord.length;

    // Build tiles: assign stable IDs so duplicates are distinguishable
    const pool = Array.isArray(q.starting_letters_pool) ? q.starting_letters_pool : targetWord.split('');
    const tileObjs = pool.map((letter, i) => ({
        id: `tile_${i}`,
        letter: String(letter).toLowerCase()
    }));
    const shuffled = tileObjs.slice().sort(() => Math.random() - 0.5);

    const tileBaseClass = isK2 ? 'lq-lts-tile lq-dnd-tile lq-dnd-tile--k2' : 'lq-lts-tile lq-dnd-tile';

    const tilesHtml = shuffled.map(t => {
        const colorCls = _tileColorClass(t.letter, isK2);
        return `<div class="${_esc(tileBaseClass + colorCls)}"
            draggable="true"
            data-id="${_esc(t.id)}"
            data-letter="${_esc(t.letter)}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="Letter ${_esc(t.letter.toUpperCase())}, draggable">
            <span class="lq-dnd-tile-label">${_esc(t.letter.toUpperCase())}</span>
        </div>`;
    }).join('');

    const slotsHtml = Array.from({ length: letterCount }, (_, i) =>
        `<div class="lq-lts-slot lq-sound-box"
            data-slot-index="${i}"
            role="cell"
            tabindex="0"
            aria-label="Letter slot ${i + 1}, empty">
        </div>`
    ).join('');

    const pictureHtml = q.show_picture
        ? `<div class="lq-lts-picture" aria-label="Picture hint: ${_esc(q.show_picture)}"
                role="img">${_esc(q.show_picture)}</div>`
        : '';

    container.innerHTML = `
        <div class="lq-lts-host" role="application"
            aria-label="Drag letters to spell the word you hear">
            ${pictureHtml}
            <div class="lq-lts-top-row">
                <button type="button" class="lq-sb-audio-btn lq-audio-btn"
                    aria-label="Play the target word">🔊 Play Word</button>
                <button type="button" class="lq-lts-hint-btn"
                    aria-label="Hint: highlight the first unplaced letter">💡 Hint</button>
            </div>
            <div class="lq-lts-slots-row" role="row" aria-label="Letter slots">
                ${slotsHtml}
            </div>
            <div class="lq-lts-pool lq-dnd-source-zone" data-role="source"
                aria-label="Letter tile bank">
                ${tilesHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-lts-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="lq-lts-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-lts-host');
    const poolEl = host.querySelector('[data-role="source"]');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-lts-submit');
    let locked = false;

    // Auto-speak
    host.querySelector('.lq-sb-audio-btn').addEventListener('click', () => _speak(audioText));
    if (isK2 || (state && state.ttsEnabled)) {
        setTimeout(() => _speak(audioText), 120);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    function allTiles() { return Array.from(host.querySelectorAll('.lq-lts-tile')); }

    function getSlotEl(idx) {
        return host.querySelector(`.lq-lts-slot[data-slot-index="${idx}"]`);
    }

    function getTileSlot(tileEl) {
        const slot = tileEl.closest('.lq-lts-slot');
        return slot ? parseInt(slot.dataset.slotIndex, 10) : null;
    }

    function getPlacements() {
        const result = {};
        allTiles().forEach(t => {
            const si = getTileSlot(t);
            if (si !== null) result[t.dataset.id] = si;
        });
        return result;
    }

    function refreshSubmit() {
        const filled = Object.keys(getPlacements()).length;
        submitBtn.disabled = locked || filled < letterCount;
    }

    function refreshSlotAria() {
        host.querySelectorAll('.lq-lts-slot').forEach(slot => {
            const tile = slot.querySelector('.lq-lts-tile');
            const idx = slot.dataset.slotIndex;
            slot.setAttribute('aria-label',
                tile ? `Letter slot ${parseInt(idx)+1}, contains ${tile.dataset.letter.toUpperCase()}`
                     : `Letter slot ${parseInt(idx)+1}, empty`);
        });
    }

    function moveTileToSlot(tileEl, slotIdx) {
        const slot = getSlotEl(slotIdx);
        if (!slot) return;
        // Displace existing tile back to pool
        const existing = slot.querySelector('.lq-lts-tile');
        if (existing && existing !== tileEl) poolEl.appendChild(existing);
        slot.appendChild(tileEl);
        _announce(host, `${tileEl.dataset.letter.toUpperCase()} placed in slot ${slotIdx + 1}.`);
        refreshSlotAria();
        refreshSubmit();
    }

    function returnTileToPool(tileEl) {
        poolEl.appendChild(tileEl);
        _announce(host, `${tileEl.dataset.letter.toUpperCase()} returned to letter bank.`);
        refreshSlotAria();
        refreshSubmit();
    }

    // ── Hint button ───────────────────────────────────────────────────────────
    host.querySelector('.lq-lts-hint-btn').addEventListener('click', () => {
        if (locked) return;
        const placements = getPlacements();
        // Find first slot that isn't correctly filled
        for (let i = 0; i < letterCount; i++) {
            const expectedLetter = targetWord[i];
            const slot = getSlotEl(i);
            const tile = slot ? slot.querySelector('.lq-lts-tile') : null;
            if (!tile || tile.dataset.letter !== expectedLetter) {
                // Highlight the correct tile in the pool
                const correctTileInPool = allTiles().find(t =>
                    t.dataset.letter === expectedLetter && getTileSlot(t) === null
                );
                if (correctTileInPool) {
                    correctTileInPool.classList.add('lq-lts-hint-highlight');
                    setTimeout(() => correctTileInPool.classList.remove('lq-lts-hint-highlight'), 1500);
                    _announce(host, `Hint: the next letter is ${expectedLetter.toUpperCase()}.`);
                }
                break;
            }
        }
    });

    // ── click-and-click ───────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        const tileEl = e.target.closest('.lq-lts-tile');
        const slotEl = e.target.closest('.lq-lts-slot');

        if (tileEl && host.contains(tileEl)) {
            if (tileEl.dataset.locked === '1') return;
            if (_activeHost === host && _activeId === tileEl.dataset.id) {
                _clearActive(host);
            } else {
                _setActive(host, tileEl);
            }
            return;
        }

        if (slotEl && host.contains(slotEl)) {
            if (_activeHost === host && _activeId) {
                const tile = host.querySelector(`.lq-lts-tile[data-id="${CSS.escape(_activeId)}"]`);
                if (tile) { moveTileToSlot(tile, parseInt(slotEl.dataset.slotIndex, 10)); _clearActive(host); }
            }
        }
    });

    poolEl.addEventListener('click', e => {
        if (locked || e.target !== poolEl) return;
        if (_activeHost === host && _activeId) {
            const tile = host.querySelector(`.lq-lts-tile[data-id="${CSS.escape(_activeId)}"]`);
            if (tile) { returnTileToPool(tile); _clearActive(host); }
        }
    });

    // ── keyboard ──────────────────────────────────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key === 'Enter' || e.key === ' ') {
            const tileEl = e.target.closest('.lq-lts-tile');
            const slotEl = e.target.closest('.lq-lts-slot');
            if (tileEl || slotEl) { e.preventDefault(); (tileEl || slotEl).click(); }
            return;
        }
        if (e.key === 'Escape') {
            if (_activeHost === host && _activeId) {
                const tile = host.querySelector(`.lq-lts-tile[data-id="${CSS.escape(_activeId)}"]`);
                if (tile) returnTileToPool(tile);
                _clearActive(host);
            }
            return;
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && _activeHost === host && _activeId) {
            e.preventDefault();
            const tile = host.querySelector(`.lq-lts-tile[data-id="${CSS.escape(_activeId)}"]`);
            if (!tile) return;
            const curSlot = getTileSlot(tile);
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const next = curSlot === null ? (delta > 0 ? 0 : letterCount - 1)
                : (curSlot + delta + letterCount + 1) % (letterCount + 1);
            if (next === letterCount) { returnTileToPool(tile); } else { moveTileToSlot(tile, next); }
        }
    });

    // ── HTML5 drag ────────────────────────────────────────────────────────────
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-lts-tile');
        if (!tile || tile.dataset.locked === '1') return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('lq-dnd-dragging');
    });
    host.addEventListener('dragend', e => {
        const tile = e.target.closest('.lq-lts-tile');
        if (tile) tile.classList.remove('lq-dnd-dragging');
        host.querySelectorAll('.lq-dnd-over').forEach(el => el.classList.remove('lq-dnd-over'));
    });
    host.addEventListener('dragover', e => {
        if (locked) return;
        const slot = e.target.closest('.lq-lts-slot');
        const src = e.target.closest('[data-role="source"]');
        if (slot || src) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; (slot || src).classList.add('lq-dnd-over'); }
    });
    host.addEventListener('dragleave', e => {
        const el = e.target.closest('.lq-lts-slot, [data-role="source"]');
        if (el) el.classList.remove('lq-dnd-over');
    });
    host.addEventListener('drop', e => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tile = host.querySelector(`.lq-lts-tile[data-id="${CSS.escape(id)}"]`);
        if (!tile) return;
        const slot = e.target.closest('.lq-lts-slot');
        const src = e.target.closest('[data-role="source"]');
        if (slot) { e.preventDefault(); slot.classList.remove('lq-dnd-over'); moveTileToSlot(tile, parseInt(slot.dataset.slotIndex, 10)); }
        else if (src) { e.preventDefault(); src.classList.remove('lq-dnd-over'); returnTileToPool(tile); }
    });

    // ── pointer/touch ─────────────────────────────────────────────────────────
    let _ptTile = null, _ptGhost = null;
    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-lts-tile');
        if (!tile || tile.dataset.locked === '1') return;
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        _ptTile = tile;
        _ptGhost = tile.cloneNode(true);
        _ptGhost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0.8;left:${e.clientX-24}px;top:${e.clientY-24}px;`;
        document.body.appendChild(_ptGhost);
        tile.classList.add('lq-dnd-dragging');
    }, { passive: false });
    host.addEventListener('pointermove', e => {
        if (!_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 24}px`;
        _ptGhost.style.top = `${e.clientY - 24}px`;
    }, { passive: false });
    host.addEventListener('pointerup', e => {
        if (!_ptTile) return;
        _ptTile.classList.remove('lq-dnd-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const slot = els.find(el => el.classList.contains('lq-lts-slot') || el.closest('.lq-lts-slot'));
        const src = els.find(el => el === poolEl || el.closest('[data-role="source"]'));
        if (slot) {
            const slotEl = slot.classList.contains('lq-lts-slot') ? slot : slot.closest('.lq-lts-slot');
            if (slotEl) moveTileToSlot(_ptTile, parseInt(slotEl.dataset.slotIndex, 10));
        } else if (src) {
            returnTileToPool(_ptTile);
        }
        _ptTile = null;
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const placements = getPlacements();
        let allCorrect = true;
        const wrongSlots = [];

        for (let i = 0; i < letterCount; i++) {
            const expectedLetter = targetWord[i];
            const slot = getSlotEl(i);
            const tile = slot ? slot.querySelector('.lq-lts-tile') : null;

            if (tile && tile.dataset.letter === expectedLetter) {
                tile.classList.add('lq-locked-correct');
                tile.classList.remove('lq-wrong-persistent');
                tile.dataset.locked = '1';
                tile.setAttribute('draggable', 'false');
            } else {
                allCorrect = false;
                wrongSlots.push(i);
                if (tile) {
                    tile.classList.add('lq-wrong-persistent');
                    returnTileToPool(tile);
                }
            }
        }

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = `Correct! You spelled "${targetWord}".`;
            locked = true;
            submitBtn.disabled = true;
        } else {
            feedbackZone.textContent = `${wrongSlots.length} letter${wrongSlots.length === 1 ? '' : 's'} wrong — try again!`;
            refreshSubmit();
        }

        // Build submitted snapshot: array of letters in slot order
        const submitted = Array.from({ length: letterCount }, (_, i) => {
            const slot = getSlotEl(i);
            const tile = slot ? slot.querySelector('.lq-lts-tile') : null;
            return tile ? tile.dataset.letter : null;
        });

        container._lqLastResult = { correct: allCorrect, submitted, firstAttempt };
        refreshSlotAria();
    });

    refreshSlotAria();
    refreshSubmit();
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkLetterTileSpell(q, container) {
    if (!container) return { correct: false, submitted: [] };
    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-lts-host');
    if (!host) return { correct: false, submitted: [] };

    const targetWord = (q.target_word || '').toLowerCase();
    const submitted = [];
    let correct = true;

    host.querySelectorAll('.lq-lts-slot').forEach((slot, i) => {
        const tile = slot.querySelector('.lq-lts-tile');
        const placed = tile ? tile.dataset.letter : null;
        submitted.push(placed);
        if (placed !== targetWord[i]) correct = false;
    });

    if (submitted.length !== targetWord.length) correct = false;

    return { correct, submitted };
}
