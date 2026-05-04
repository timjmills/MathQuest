// sort-into-bins.js — N-column drag-to-categorize widget.
//
// Dedicated sort widget with a named-bin model (simpler API than dnd-linked's
// zone-acceptance rules). Used for word-family sorts, phonics pattern sorts,
// vocabulary categorization, parts-of-speech sorts.
//
// Question contract:
//   q.task_text:  string   — instruction shown above (e.g., "Sort words by short vowel sound")
//   q.items:      [{ id, label, image?, audio_text?, correct_bin: string }]
//   q.bins:       [{ id, label, color?, icon? }]   — 2-4 bins typical
//   q.k2_appropriate?: boolean — large tile mode, bin labels auto-spoken on load
//
// Partial-correct lock pattern on wrong submit:
//   Items in correct bin → .lq-locked-correct + non-draggable
//   Items in wrong bin   → returned to source + .lq-wrong-persistent
//
// Exports:
//   renderSortIntoBins(q, container)
//   checkSortIntoBins(q, container)

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
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
    } catch (_) { /* not available */ }
}

function _announce(host, msg) {
    const live = host.querySelector('.lq-sib-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
}

// Default bin colors (used when q.bins[N].color is not provided)
const _BIN_COLORS = ['#e3f2fd', '#fff3e0', '#f3e5f5', '#e8f5e9'];
const _BIN_BORDER_COLORS = ['#1565c0', '#e65100', '#6a1b9a', '#2e7d32'];

// Module-level active tile state
let _activeItemId = null;
let _activeHost = null;

function _clearActive(host) {
    if (_activeHost !== host) return;
    if (_activeItemId) {
        const el = host.querySelector(`.lq-sib-tile[data-id="${CSS.escape(_activeItemId)}"]`);
        if (el) { el.classList.remove('lq-dnd-tile--active'); el.setAttribute('aria-pressed', 'false'); }
    }
    _activeItemId = null;
    _activeHost = null;
}

function _setActive(host, tileEl) {
    _clearActive(host);
    if (!tileEl) return;
    tileEl.classList.add('lq-dnd-tile--active');
    tileEl.setAttribute('aria-pressed', 'true');
    _activeItemId = tileEl.dataset.id;
    _activeHost = host;
    _announce(host, `Picked up ${tileEl.querySelector('.lq-dnd-tile-label').textContent.trim()}.`);
}

// ─── render ───────────────────────────────────────────────────────────────────

export function renderSortIntoBins(q, container) {
    if (!container || !q) return;

    const items = Array.isArray(q.items) ? q.items : [];
    const bins = Array.isArray(q.bins) ? q.bins : [];
    const isK2 = !!q.k2_appropriate;
    const tileBaseClass = isK2 ? 'lq-sib-tile lq-dnd-tile lq-dnd-tile--k2' : 'lq-sib-tile lq-dnd-tile';
    const taskText = q.task_text || '';

    // Shuffle items for source display
    const shuffled = items.slice().sort(() => Math.random() - 0.5);

    const tilesHtml = shuffled.map(item => {
        const label = _esc(item.label || item.id);
        const imgHtml = item.image
            ? `<img class="lq-dnd-tile-image" src="${_esc(item.image)}" alt="${label}">`
            : '';
        const audioBtn = (item.audio_text || item.label)
            ? `<button type="button" class="lq-sib-audio-btn" data-audio="${_esc(item.audio_text || item.label)}"
                aria-label="Listen to ${label}" tabindex="-1">🔊</button>`
            : '';
        return `<div class="${_esc(tileBaseClass)}"
            draggable="true"
            data-id="${_esc(item.id)}"
            data-correct-bin="${_esc(item.correct_bin)}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="${label}, draggable">
            ${imgHtml}
            <span class="lq-dnd-tile-label">${label}</span>
            ${audioBtn}
        </div>`;
    }).join('');

    const binsHtml = bins.map((bin, binIdx) => {
        const bgColor = bin.color || _BIN_COLORS[binIdx % _BIN_COLORS.length];
        const borderColor = _BIN_BORDER_COLORS[binIdx % _BIN_BORDER_COLORS.length];
        const icon = bin.icon ? `<span class="lq-sib-bin-icon">${_esc(bin.icon)}</span>` : '';
        return `<div class="lq-sib-bin lq-dnd-drop-zone"
            data-bin-id="${_esc(bin.id)}"
            role="listbox"
            aria-label="${_esc(bin.label)}, empty"
            style="background:${_esc(bgColor)};border-color:${_esc(borderColor)};">
            <div class="lq-sib-bin-header">
                ${icon}<span class="lq-dnd-drop-zone-label">${_esc(bin.label)}</span>
            </div>
            <div class="lq-sib-bin-well" data-bin-well="${_esc(bin.id)}"></div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-sib-host" role="application"
            aria-label="Sort items into the correct bins">
            ${taskText ? `<p class="lq-sib-task-text">${_esc(taskText)}</p>` : ''}
            <div class="lq-sib-source lq-dnd-source-zone" data-role="source"
                aria-label="Items to sort">
                ${tilesHtml}
            </div>
            <div class="lq-sib-bins-row">
                ${binsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-sib-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="lq-sib-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-sib-host');
    const source = host.querySelector('[data-role="source"]');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-sib-submit');
    let locked = false;

    // K-2: read bin labels aloud on load
    if (isK2 && (state && state.ttsEnabled || isK2)) {
        const labels = bins.map(b => b.label).join(', ');
        setTimeout(() => _speak(`Sort into: ${labels}`), 300);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    function allTiles() { return Array.from(host.querySelectorAll('.lq-sib-tile')); }

    function getTileBin(tileEl) {
        const well = tileEl.closest('[data-bin-well]');
        return well ? well.dataset.binWell : null;
    }

    function getBinWell(binId) {
        return host.querySelector(`[data-bin-well="${CSS.escape(binId)}"]`);
    }

    function getPlacements() {
        const result = {};
        allTiles().forEach(t => {
            const binId = getTileBin(t);
            if (binId) result[t.dataset.id] = binId;
        });
        return result;
    }

    function totalPlaced() { return Object.keys(getPlacements()).length; }

    function refreshSubmit() {
        submitBtn.disabled = locked || totalPlaced() < items.length;
    }

    function refreshBinAria() {
        bins.forEach(bin => {
            const well = getBinWell(bin.id);
            const binEl = host.querySelector(`[data-bin-id="${CSS.escape(bin.id)}"]`);
            if (!binEl) return;
            const count = well ? well.querySelectorAll('.lq-sib-tile').length : 0;
            binEl.setAttribute('aria-label',
                `${bin.label} — ${count === 0 ? 'empty' : count + ' item' + (count === 1 ? '' : 's')}`);
        });
    }

    function moveTileToBin(tileEl, binId) {
        const well = getBinWell(binId);
        if (!well) return;
        well.appendChild(tileEl);
        const binLabel = bins.find(b => b.id === binId);
        _announce(host, `${tileEl.querySelector('.lq-dnd-tile-label').textContent.trim()} placed in ${binLabel ? binLabel.label : binId}.`);
        refreshBinAria();
        refreshSubmit();
    }

    function returnTileToSource(tileEl) {
        source.appendChild(tileEl);
        _announce(host, `${tileEl.querySelector('.lq-dnd-tile-label').textContent.trim()} returned to source.`);
        refreshBinAria();
        refreshSubmit();
    }

    // ── audio buttons ─────────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        const btn = e.target.closest('.lq-sib-audio-btn');
        if (!btn) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speak(btn.dataset.audio || '');
    });
    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const btn = e.target.closest('.lq-sib-audio-btn');
        if (!btn) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speak(btn.dataset.audio || '');
    });
    host.addEventListener('dragstart', e => {
        if (e.target.closest('.lq-sib-audio-btn')) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    // ── click-and-click interaction ───────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        if (e.target.closest('.lq-sib-audio-btn')) return;

        const tileEl = e.target.closest('.lq-sib-tile');
        const binEl = e.target.closest('.lq-sib-bin');

        if (tileEl && host.contains(tileEl)) {
            if (tileEl.dataset.locked === '1') return;
            if (_activeHost === host && _activeItemId === tileEl.dataset.id) {
                _clearActive(host);
            } else {
                _setActive(host, tileEl);
            }
            return;
        }

        if (binEl && host.contains(binEl)) {
            if (_activeHost === host && _activeItemId) {
                const tile = host.querySelector(`.lq-sib-tile[data-id="${CSS.escape(_activeItemId)}"]`);
                if (tile) { moveTileToBin(tile, binEl.dataset.binId); _clearActive(host); }
            }
        }
    });

    source.addEventListener('click', e => {
        if (locked || e.target !== source) return;
        if (_activeHost === host && _activeItemId) {
            const tile = host.querySelector(`.lq-sib-tile[data-id="${CSS.escape(_activeItemId)}"]`);
            if (tile) { returnTileToSource(tile); _clearActive(host); }
        }
    });

    // ── keyboard ──────────────────────────────────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key === 'Enter' || e.key === ' ') {
            const tileEl = e.target.closest('.lq-sib-tile');
            const binEl = e.target.closest('.lq-sib-bin');
            if (tileEl || binEl) { e.preventDefault(); (tileEl || binEl).click(); }
            return;
        }
        if (e.key === 'Escape') {
            if (_activeHost === host) {
                const tile = host.querySelector(`.lq-sib-tile[data-id="${CSS.escape(_activeItemId || '')}"]`);
                if (tile) returnTileToSource(tile);
                _clearActive(host);
            }
            return;
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && _activeHost === host && _activeItemId) {
            e.preventDefault();
            const binEls = Array.from(host.querySelectorAll('.lq-sib-bin'));
            if (binEls.length === 0) return;
            const tile = host.querySelector(`.lq-sib-tile[data-id="${CSS.escape(_activeItemId)}"]`);
            const curBin = tile ? getTileBin(tile) : null;
            const curIdx = curBin ? binEls.findIndex(b => b.dataset.binId === curBin) : -1;
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const nextIdx = (curIdx + delta + binEls.length + 1) % (binEls.length + 1);
            if (nextIdx === binEls.length) { if (tile) returnTileToSource(tile); }
            else { if (tile) moveTileToBin(tile, binEls[nextIdx].dataset.binId); }
        }
    });

    // ── HTML5 drag ────────────────────────────────────────────────────────────
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-sib-tile');
        if (!tile || tile.dataset.locked === '1' || !host.contains(tile)) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('lq-dnd-dragging');
    });
    host.addEventListener('dragend', e => {
        const tile = e.target.closest('.lq-sib-tile');
        if (tile) tile.classList.remove('lq-dnd-dragging');
        host.querySelectorAll('.lq-dnd-over').forEach(el => el.classList.remove('lq-dnd-over'));
    });
    host.addEventListener('dragover', e => {
        if (locked) return;
        const bin = e.target.closest('.lq-sib-bin');
        const src = e.target.closest('[data-role="source"]');
        if (bin || src) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; (bin || src).classList.add('lq-dnd-over'); }
    });
    host.addEventListener('dragleave', e => {
        const el = e.target.closest('.lq-sib-bin, [data-role="source"]');
        if (el) el.classList.remove('lq-dnd-over');
    });
    host.addEventListener('drop', e => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tile = host.querySelector(`.lq-sib-tile[data-id="${CSS.escape(id)}"]`);
        if (!tile) return;
        const bin = e.target.closest('.lq-sib-bin');
        const src = e.target.closest('[data-role="source"]');
        if (bin) { e.preventDefault(); bin.classList.remove('lq-dnd-over'); moveTileToBin(tile, bin.dataset.binId); }
        else if (src) { e.preventDefault(); src.classList.remove('lq-dnd-over'); returnTileToSource(tile); }
    });

    // ── pointer/touch ─────────────────────────────────────────────────────────
    let _ptTile = null, _ptGhost = null;
    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-sib-tile');
        if (!tile || tile.dataset.locked === '1') return;
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        _ptTile = tile;
        _ptGhost = tile.cloneNode(true);
        _ptGhost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0.8;left:${e.clientX-20}px;top:${e.clientY-20}px;`;
        document.body.appendChild(_ptGhost);
        tile.classList.add('lq-dnd-dragging');
    }, { passive: false });
    host.addEventListener('pointermove', e => {
        if (!_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 20}px`;
        _ptGhost.style.top = `${e.clientY - 20}px`;
    }, { passive: false });
    host.addEventListener('pointerup', e => {
        if (!_ptTile) return;
        _ptTile.classList.remove('lq-dnd-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const bin = els.find(el => el.classList.contains('lq-sib-bin') || el.closest('.lq-sib-bin'));
        const src = els.find(el => el === source || el.closest('[data-role="source"]'));
        if (bin) {
            const binEl = bin.classList.contains('lq-sib-bin') ? bin : bin.closest('.lq-sib-bin');
            if (binEl) moveTileToBin(_ptTile, binEl.dataset.binId);
        } else if (src) {
            returnTileToSource(_ptTile);
        }
        _ptTile = null;
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const placements = getPlacements();
        const firstAttempt = isFirstAttempt();
        let allCorrect = true;

        items.forEach(item => {
            const placed = placements[item.id];
            const tileEl = host.querySelector(`.lq-sib-tile[data-id="${CSS.escape(item.id)}"]`);
            if (!tileEl) return;

            if (placed && placed === item.correct_bin) {
                tileEl.classList.add('lq-locked-correct');
                tileEl.classList.remove('lq-wrong-persistent');
                tileEl.dataset.locked = '1';
                tileEl.setAttribute('draggable', 'false');
            } else {
                allCorrect = false;
                tileEl.classList.add('lq-wrong-persistent');
                returnTileToSource(tileEl);
            }
        });

        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = 'All sorted correctly!';
            locked = true;
            submitBtn.disabled = true;
        } else {
            const wrongCount = items.filter(item => {
                const placed = placements[item.id];
                return !placed || placed !== item.correct_bin;
            }).length;
            feedbackZone.textContent = `${wrongCount} item${wrongCount === 1 ? '' : 's'} in the wrong bin — try again!`;
            refreshSubmit();
        }

        container._lqLastResult = { correct: allCorrect, submitted: placements, firstAttempt };
        refreshBinAria();
    });

    refreshBinAria();
    refreshSubmit();

    container._sibLock = () => {
        locked = true;
        submitBtn.disabled = true;
        allTiles().forEach(t => t.setAttribute('draggable', 'false'));
    };
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkSortIntoBins(q, container) {
    if (!container) return { correct: false, submitted: {} };
    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-sib-host');
    if (!host) return { correct: false, submitted: {} };

    const submitted = {};
    host.querySelectorAll('.lq-sib-tile').forEach(t => {
        const well = t.closest('[data-bin-well]');
        if (well) submitted[t.dataset.id] = well.dataset.binWell;
    });

    const items = Array.isArray(q.items) ? q.items : [];
    const correct = items.every(item => submitted[item.id] === item.correct_bin);

    return { correct, submitted };
}
