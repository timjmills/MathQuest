// sound-box.js — Elkonin sound-box segmenting widget.
//
// Implements the OG/Wilson "say-it-and-move-it" routine digitally.
// Required for K-2 phonics / phonemic awareness per ELL/SPED scaffolds.
//
// Question contract:
//   q.word:           string   — target word (e.g., 'cat', 'fish', 'split')
//   q.phoneme_count:  number   — total phoneme boxes to show
//   q.phoneme_chips?: string[] — explicit chip labels (override auto-decomposition)
//   q.audio_text?:    string   — TTS text; default = q.word
//   q.task:           'segment_to_chips' | 'count_phonemes'
//   q.k2_appropriate?: boolean — large chip mode
//
// For 'segment_to_chips': student drags/taps chips into boxes.
// For 'count_phonemes':   student selects the number of sounds (button-pick).
//
// Partial-correct lock pattern (same as dnd-linked):
//   Correct placements → .lq-locked-correct, non-draggable
//   Wrong placements   → returned to pool + .lq-wrong-persistent
//
// Exports:
//   renderSoundBox(q, container)
//   checkSoundBox(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

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
        u.rate = 0.85;
        window.speechSynthesis.speak(u);
    } catch (_) { /* not available */ }
}

function _announce(host, msg) {
    const live = host.querySelector('.lq-sb-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
}

/** Build default phoneme chips from a word: one chip per letter, padded with distractors. */
function _buildDefaultChips(word, phonemeCount) {
    // Use letter-level decomposition as a sensible default when no explicit chips provided.
    const letters = word.toLowerCase().split('');
    // Unique letters from word (maintain order, drop duplicates beyond first occurrence)
    const wordChips = [];
    const seen = new Set();
    for (const l of letters) {
        if (!seen.has(l)) { wordChips.push(l); seen.add(l); }
    }
    // Pad with distractors (letters NOT in the word, typical CVC distractors)
    const distractorPool = 'bdfgjklmnprstvwyz'.split('').filter(c => !seen.has(c));
    const needed = Math.max(0, phonemeCount + 2 - wordChips.length);
    const distractors = distractorPool.slice(0, needed);
    return [...wordChips, ...distractors].map(c => ({ id: c + '_' + Math.random().toString(36).slice(2, 6), label: c }));
}

// Module-level active (keyboard-selected) chip state
let _activeChipId = null;
let _activeHost = null;

function _clearActive(host) {
    if (_activeHost !== host) return;
    if (_activeChipId) {
        const el = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(_activeChipId)}"]`);
        if (el) { el.classList.remove('lq-dnd-tile--active'); el.setAttribute('aria-pressed', 'false'); }
    }
    _activeChipId = null;
    _activeHost = null;
}

function _setActive(host, chipEl) {
    _clearActive(host);
    if (!chipEl) return;
    chipEl.classList.add('lq-dnd-tile--active');
    chipEl.setAttribute('aria-pressed', 'true');
    _activeChipId = chipEl.dataset.id;
    _activeHost = host;
    _announce(host, `Picked up chip ${chipEl.textContent.trim()}.`);
}

// ─── render — count_phonemes variant ────────────────────────────────────────

function _renderCountPhonemes(q, container) {
    const word = q.word || '';
    const phonemeCount = q.phoneme_count || 3;
    const audioText = q.audio_text || word;
    const isK2 = !!q.k2_appropriate;

    // Build number options: phonemeCount ± 2, but keep 1..8 range
    const min = Math.max(1, phonemeCount - 2);
    const max = Math.min(8, phonemeCount + 2);
    const options = [];
    for (let i = min; i <= max; i++) options.push(i);
    if (!options.includes(phonemeCount)) options.push(phonemeCount);
    options.sort((a, b) => a - b);

    const optHtml = options.map(n =>
        `<button type="button" class="lq-sb-count-btn${isK2 ? ' lq-sb-count-btn--k2' : ''}"
            data-value="${n}" role="radio" aria-checked="false">${n}</button>`
    ).join('');

    container.innerHTML = `
        <div class="lq-sb-host lq-sb-host--count" role="application"
            aria-label="Count the phonemes in the word">
            <div class="lq-sb-top-row">
                <button type="button" class="lq-sb-audio-btn lq-audio-btn"
                    aria-label="Play word: ${_esc(word)}">🔊 Play Word</button>
                <span class="lq-sb-word-display">${_esc(word)}</span>
            </div>
            <p class="lq-sb-prompt">How many sounds do you hear in
                <strong>${_esc(word)}</strong>?</p>
            <div class="lq-sb-boxes-row" aria-label="${phonemeCount} empty sound boxes" role="group">
                ${Array.from({ length: phonemeCount }, (_, i) =>
                    `<div class="lq-sound-box" aria-label="Sound box ${i + 1}"></div>`).join('')}
            </div>
            <div class="lq-sb-count-options" role="radiogroup"
                aria-label="Choose the number of sounds">
                ${optHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-sb-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
        </div>`;

    const host = container.querySelector('.lq-sb-host');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    let chosen = null;
    let locked = false;

    // Audio button
    host.querySelector('.lq-sb-audio-btn').addEventListener('click', () => _speak(audioText));

    // Auto-speak in K-2 / TTS enabled
    if (isK2 || (state && state.ttsEnabled)) {
        setTimeout(() => _speak(audioText), 120);
    }

    // Option buttons
    host.querySelectorAll('.lq-sb-count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (locked) return;
            host.querySelectorAll('.lq-sb-count-btn').forEach(b => {
                b.classList.remove('lq-sb-selected');
                b.setAttribute('aria-checked', 'false');
            });
            btn.classList.add('lq-sb-selected');
            btn.setAttribute('aria-checked', 'true');
            chosen = parseInt(btn.dataset.value, 10);

            // Auto-submit on selection for count variant
            const correct = chosen === phonemeCount;
            const firstAttempt = isFirstAttempt();
            markFirstAttempt(correct);

            if (correct) {
                feedbackZone.textContent = `Yes! "${word}" has ${phonemeCount} sound${phonemeCount === 1 ? '' : 's'}.`;
                btn.classList.add('lq-locked-correct');
                locked = true;
            } else {
                feedbackZone.textContent = `Try again — listen carefully to each sound.`;
                btn.classList.add('lq-wrong-persistent');
                setTimeout(() => {
                    btn.classList.remove('lq-wrong-persistent', 'lq-sb-selected');
                    btn.setAttribute('aria-checked', 'false');
                    chosen = null;
                }, 900);
            }
            container._lqLastResult = { correct, submitted: chosen, firstAttempt };
        });

        // Keyboard
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
        });
    });
}

// ─── render — segment_to_chips variant ───────────────────────────────────────

function _renderSegmentToChips(q, container) {
    const word = q.word || '';
    const phonemeCount = q.phoneme_count || 3;
    const audioText = q.audio_text || word;
    const isK2 = !!q.k2_appropriate;
    const tileClass = isK2 ? 'lq-sb-chip lq-dnd-tile lq-dnd-tile--k2' : 'lq-sb-chip lq-dnd-tile';

    // Build chip objects
    let chipObjects;
    if (Array.isArray(q.phoneme_chips) && q.phoneme_chips.length > 0) {
        chipObjects = q.phoneme_chips.map((label, i) => ({ id: `chip_${i}`, label }));
        // Add 2 distractors if not already more than phonemeCount
        if (chipObjects.length <= phonemeCount) {
            const distractorPool = ['b', 's', 'n', 'g', 'f', 'r', 'w', 'p'];
            const existing = new Set(chipObjects.map(c => c.label.toLowerCase()));
            for (const d of distractorPool) {
                if (!existing.has(d) && chipObjects.length < phonemeCount + 2) {
                    chipObjects.push({ id: `dist_${d}`, label: d });
                }
            }
        }
    } else {
        chipObjects = _buildDefaultChips(word, phonemeCount);
    }

    // Shuffle chips
    const shuffled = chipObjects.slice().sort(() => Math.random() - 0.5);

    const chipsHtml = shuffled.map(c =>
        `<div class="${_esc(tileClass)}"
            draggable="true"
            data-id="${_esc(c.id)}"
            data-label="${_esc(c.label)}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(c.label)}, chip">
            <span class="lq-dnd-tile-label">${_esc(c.label)}</span>
        </div>`
    ).join('');

    const boxesHtml = Array.from({ length: phonemeCount }, (_, i) =>
        `<div class="lq-sound-box lq-sb-drop-box"
            data-box-index="${i}"
            role="cell"
            tabindex="0"
            aria-label="Sound box ${i + 1}, empty">
        </div>`
    ).join('');

    container.innerHTML = `
        <div class="lq-sb-host" role="application"
            aria-label="Drag phoneme chips into the sound boxes for the word ${_esc(word)}">
            <div class="lq-sb-top-row">
                <button type="button" class="lq-sb-audio-btn lq-audio-btn"
                    aria-label="Play word: ${_esc(word)}">🔊 Play Word</button>
                <span class="lq-sb-word-display">${_esc(word)}</span>
            </div>
            <div class="lq-sb-boxes-row" aria-label="Sound boxes" role="row">
                ${boxesHtml}
            </div>
            <div class="lq-sb-chip-pool lq-dnd-source-zone" data-role="source"
                aria-label="Phoneme chips">
                ${chipsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-sb-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="lq-sb-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-sb-host');
    const pool = host.querySelector('[data-role="source"]');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-sb-submit');
    let locked = false;

    // Audio
    host.querySelector('.lq-sb-audio-btn').addEventListener('click', () => _speak(audioText));
    if (isK2 || (state && state.ttsEnabled)) {
        setTimeout(() => _speak(audioText), 120);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    function allChips() { return Array.from(host.querySelectorAll('.lq-sb-chip')); }

    function getChipBox(chipEl) {
        const box = chipEl.closest('.lq-sb-drop-box');
        return box ? parseInt(box.dataset.boxIndex, 10) : null;
    }

    function getBoxEl(idx) {
        return host.querySelector(`.lq-sb-drop-box[data-box-index="${idx}"]`);
    }

    function getPlacements() {
        const result = {};
        allChips().forEach(c => {
            const bi = getChipBox(c);
            if (bi !== null) result[c.dataset.id] = bi;
        });
        return result;
    }

    function refreshSubmit() {
        const filled = Object.keys(getPlacements()).length;
        submitBtn.disabled = locked || filled < phonemeCount;
    }

    function refreshBoxAria() {
        host.querySelectorAll('.lq-sb-drop-box').forEach(box => {
            const chip = box.querySelector('.lq-sb-chip');
            const idx = box.dataset.boxIndex;
            box.setAttribute('aria-label',
                chip ? `Sound box ${parseInt(idx)+1}, contains ${chip.dataset.label}` : `Sound box ${parseInt(idx)+1}, empty`);
        });
    }

    function moveChipToBox(chipEl, boxIdx) {
        const box = getBoxEl(boxIdx);
        if (!box) return;
        // Displace existing chip back to pool
        const existing = box.querySelector('.lq-sb-chip');
        if (existing && existing !== chipEl) pool.appendChild(existing);
        box.appendChild(chipEl);
        _announce(host, `${chipEl.dataset.label} placed in box ${boxIdx + 1}.`);
        refreshBoxAria();
        refreshSubmit();
    }

    function returnChipToPool(chipEl) {
        pool.appendChild(chipEl);
        _announce(host, `${chipEl.dataset.label} returned to chip pool.`);
        refreshBoxAria();
        refreshSubmit();
    }

    // ── click-and-click interaction ───────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        const chipEl = e.target.closest('.lq-sb-chip');
        const boxEl = e.target.closest('.lq-sb-drop-box');

        if (chipEl && host.contains(chipEl)) {
            if (chipEl.dataset.locked === '1') return;
            if (_activeHost === host && _activeChipId === chipEl.dataset.id) {
                _clearActive(host);
            } else {
                _setActive(host, chipEl);
            }
            return;
        }

        if (boxEl && host.contains(boxEl)) {
            if (_activeHost === host && _activeChipId) {
                const chip = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(_activeChipId)}"]`);
                if (chip) { moveChipToBox(chip, parseInt(boxEl.dataset.boxIndex, 10)); _clearActive(host); }
            }
        }
    });

    // Click pool background to return active chip
    pool.addEventListener('click', e => {
        if (locked || e.target !== pool) return;
        if (_activeHost === host && _activeChipId) {
            const chip = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(_activeChipId)}"]`);
            if (chip) { returnChipToPool(chip); _clearActive(host); }
        }
    });

    // ── keyboard navigation ───────────────────────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key === 'Enter' || e.key === ' ') {
            const chipEl = e.target.closest('.lq-sb-chip');
            const boxEl = e.target.closest('.lq-sb-drop-box');
            if (chipEl || boxEl) { e.preventDefault(); (chipEl || boxEl).click(); }
            return;
        }
        if (e.key === 'Escape') {
            if (_activeHost === host && _activeChipId) {
                const chip = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(_activeChipId)}"]`);
                if (chip) returnChipToPool(chip);
                _clearActive(host);
            }
            return;
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && _activeHost === host && _activeChipId) {
            e.preventDefault();
            const chip = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(_activeChipId)}"]`);
            if (!chip) return;
            const currentBox = getChipBox(chip);
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const nextBox = currentBox === null ? (delta > 0 ? 0 : phonemeCount - 1)
                : (currentBox + delta + phonemeCount + 1) % (phonemeCount + 1);
            if (nextBox === phonemeCount) {
                returnChipToPool(chip);
            } else {
                moveChipToBox(chip, nextBox);
            }
        }
    });

    // ── HTML5 drag ────────────────────────────────────────────────────────────
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const chip = e.target.closest('.lq-sb-chip');
        if (!chip || chip.dataset.locked === '1') return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', chip.dataset.id);
        chip.classList.add('lq-dnd-dragging');
    });
    host.addEventListener('dragend', e => {
        const chip = e.target.closest('.lq-sb-chip');
        if (chip) chip.classList.remove('lq-dnd-dragging');
        host.querySelectorAll('.lq-dnd-over').forEach(el => el.classList.remove('lq-dnd-over'));
    });
    host.addEventListener('dragover', e => {
        if (locked) return;
        const box = e.target.closest('.lq-sb-drop-box');
        const src = e.target.closest('[data-role="source"]');
        if (box || src) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; (box || src).classList.add('lq-dnd-over'); }
    });
    host.addEventListener('dragleave', e => {
        const el = e.target.closest('.lq-sb-drop-box, [data-role="source"]');
        if (el) el.classList.remove('lq-dnd-over');
    });
    host.addEventListener('drop', e => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const chip = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(id)}"]`);
        if (!chip) return;
        const box = e.target.closest('.lq-sb-drop-box');
        const src = e.target.closest('[data-role="source"]');
        if (box) { e.preventDefault(); box.classList.remove('lq-dnd-over'); moveChipToBox(chip, parseInt(box.dataset.boxIndex, 10)); }
        else if (src) { e.preventDefault(); src.classList.remove('lq-dnd-over'); returnChipToPool(chip); }
    });

    // ── pointer/touch fallback ─────────────────────────────────────────────
    let _ptChip = null, _ptGhost = null;
    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const chip = e.target.closest('.lq-sb-chip');
        if (!chip || chip.dataset.locked === '1') return;
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        _ptChip = chip;
        _ptGhost = chip.cloneNode(true);
        _ptGhost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0.8;left:${e.clientX-20}px;top:${e.clientY-20}px;`;
        document.body.appendChild(_ptGhost);
        chip.classList.add('lq-dnd-dragging');
    }, { passive: false });
    host.addEventListener('pointermove', e => {
        if (!_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 20}px`;
        _ptGhost.style.top = `${e.clientY - 20}px`;
    }, { passive: false });
    host.addEventListener('pointerup', e => {
        if (!_ptChip) return;
        _ptChip.classList.remove('lq-dnd-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const box = els.find(el => el.classList.contains('lq-sb-drop-box') || el.closest('.lq-sb-drop-box'));
        const src = els.find(el => el === pool || el.closest('[data-role="source"]'));
        if (box) {
            const boxEl = box.classList.contains('lq-sb-drop-box') ? box : box.closest('.lq-sb-drop-box');
            if (boxEl) moveChipToBox(_ptChip, parseInt(boxEl.dataset.boxIndex, 10));
        } else if (src) {
            returnChipToPool(_ptChip);
        }
        _ptChip = null;
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const placements = getPlacements();
        // Build expected: for explicit chips, match by label to expected phoneme sequence
        // The check: each box[0..N-1] must have exactly one chip; chips in correct boxes are correct.
        // Since phoneme segmentation allows any chip in any box (all correct chips accepted in any order),
        // we check that ALL chips placed are from the correct phoneme set (not distractors).
        const correctLabels = Array.isArray(q.phoneme_chips)
            ? q.phoneme_chips.map(s => s.toLowerCase())
            : word.toLowerCase().split('').filter((v, i, a) => a.indexOf(v) === i);

        let allCorrect = true;
        const wrongIds = [];

        Object.entries(placements).forEach(([chipId, boxIdx]) => {
            const chipEl = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(chipId)}"]`);
            if (!chipEl) return;
            const label = (chipEl.dataset.label || '').toLowerCase();
            if (correctLabels.includes(label)) {
                chipEl.classList.add('lq-locked-correct');
                chipEl.classList.remove('lq-wrong-persistent');
                chipEl.dataset.locked = '1';
                chipEl.setAttribute('draggable', 'false');
            } else {
                allCorrect = false;
                wrongIds.push(chipId);
                chipEl.classList.add('lq-wrong-persistent');
                returnChipToPool(chipEl);
            }
        });

        // Also fail if fewer boxes filled than phoneme count
        if (Object.keys(placements).length < phonemeCount) allCorrect = false;

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = `Great! "${word}" has ${phonemeCount} sound${phonemeCount === 1 ? '' : 's'}.`;
            locked = true;
            submitBtn.disabled = true;
        } else {
            feedbackZone.textContent = 'Some chips are wrong — try again!';
            refreshSubmit();
        }

        container._lqLastResult = { correct: allCorrect, submitted: placements, firstAttempt };
        refreshBoxAria();
    });

    refreshBoxAria();
    refreshSubmit();
}

// ─── render (dispatcher) ──────────────────────────────────────────────────────

export function renderSoundBox(q, container) {
    if (!container || !q) return;
    if (q.task === 'count_phonemes') {
        _renderCountPhonemes(q, container);
    } else {
        _renderSegmentToChips(q, container);
    }
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkSoundBox(q, container) {
    if (!container) return { correct: false, submitted: {} };
    if (container._lqLastResult) return container._lqLastResult;

    if (q.task === 'count_phonemes') {
        const host = container.querySelector('.lq-sb-host--count');
        if (!host) return { correct: false, submitted: null };
        const chosen = host.querySelector('.lq-sb-count-btn.lq-sb-selected');
        const val = chosen ? parseInt(chosen.dataset.value, 10) : null;
        return { correct: val === q.phoneme_count, submitted: val };
    }

    // segment_to_chips: derive placements from DOM
    const host = container.querySelector('.lq-sb-host');
    if (!host) return { correct: false, submitted: {} };
    const submitted = {};
    host.querySelectorAll('.lq-sb-chip').forEach(c => {
        const box = c.closest('.lq-sb-drop-box');
        if (box) submitted[c.dataset.id] = parseInt(box.dataset.boxIndex, 10);
    });
    const phonemeCount = q.phoneme_count || 3;
    const correctLabels = Array.isArray(q.phoneme_chips)
        ? q.phoneme_chips.map(s => s.toLowerCase())
        : (q.word || '').toLowerCase().split('').filter((v, i, a) => a.indexOf(v) === i);
    const placedChips = Object.keys(submitted);
    const correct = placedChips.length >= phonemeCount &&
        placedChips.every(id => {
            const el = host.querySelector(`.lq-sb-chip[data-id="${CSS.escape(id)}"]`);
            return el && correctLabels.includes((el.dataset.label || '').toLowerCase());
        });
    return { correct, submitted };
}
