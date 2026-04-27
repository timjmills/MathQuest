// vocab-match widget — interactive vocabulary matching answer type.
//
// Displays N items on the LEFT and the SAME N items on the RIGHT (with the
// right side shuffled). Student matches each left item to its corresponding
// right item by either:
//   1. Drag the right card onto a left card.
//   2. Click a right card (it becomes "selected") then click a left card,
//      or click a left card first then a right card.
//
// As soon as a pair is correctly matched, BOTH items turn GREEN and lock.
// Wrong matches flash red briefly and the right item returns to the pool.
// When all pairs are correct, the widget auto-submits via the registered
// onVocabMatchSubmit callback (mirrors the tchart-cells live-validation
// pattern).
//
// Question contract:
//   q.text         — prompt (e.g. "Match each word to its definition.")
//   q.answerType   — "vocab-match"
//   q.vocabPairs   — Array<{
//                       id:        string,    // shared id for the matching pair
//                       leftText:  string,    // text on the left card
//                       leftModel: string|null, // optional HTML/SVG snippet
//                       rightText: string,    // text on the right card
//                       rightModel:string|null  // optional HTML/SVG snippet
//                    }>
//
// Validation: each leftId must end up matched to the right item with the
// SAME id. There is no separate q.ans — the id pairing IS the answer.
//
// Pure module — no globals attached, no DOM mutation outside `container`.

import { enableHostTouchDrag } from '../drag-touch.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Per-mount state. Re-initialized on every renderVocabMatch call so a fresh
// question can't see stale matches from the previous mount.
let _state = {
    container: null,
    pairs: [],          // canonical pair list (left order)
    rightOrder: [],     // shuffled right-side ids
    matches: {},        // leftId -> rightId (cleared on lock; persistent for correct pairs)
    locked: false,      // global lock — true after auto-submit
    pickedLeftId: null, // click-then-click: left card selected first
    pickedRightId: null,// click-then-click: right card selected first
};

function _allCorrect() {
    if (!_state.pairs.length) return false;
    for (const p of _state.pairs) {
        if (_state.matches[p.id] !== p.id) return false;
    }
    return true;
}

// Render a card body. `model` may be an HTML/SVG snippet or null.
function _cardBody(text, model) {
    const txtHtml = text ? `<div class="vmh-text">${_esc(text)}</div>` : '';
    const modelHtml = model ? `<div class="vmh-model">${model}</div>` : '';
    return modelHtml + txtHtml;
}

function _renderHost() {
    if (!_state.container) return;
    const pairs = _state.pairs;
    const rightOrder = _state.rightOrder;

    // Left column: pairs in canonical order. Each row has a left card and a
    // drop slot for the matched right card. The right card itself is rendered
    // in-place inside the slot when matched (for correct/locked pairs); for
    // unmatched left cards the slot shows a placeholder.
    const rows = pairs.map((p, idx) => {
        return `
            <div class="vmh-row" data-row-idx="${idx}">
                <div class="vmh-card vmh-left" data-side="left" data-id="${_esc(p.id)}"
                     role="button" tabindex="0" aria-label="Left item: ${_esc(p.leftText)}">
                    ${_cardBody(p.leftText, p.leftModel)}
                </div>
                <div class="vmh-arrow" aria-hidden="true">&harr;</div>
                <div class="vmh-slot" data-left-id="${_esc(p.id)}"
                     role="region" aria-label="Drop a match here">
                    <span class="vmh-slot-hint">drop here</span>
                </div>
            </div>
        `;
    }).join('');

    // Right pool: holds the right cards that haven't been correctly matched
    // yet. Cards in this pool are draggable and clickable.
    const poolItems = rightOrder.map(id => {
        const p = pairs.find(x => x.id === id);
        if (!p) return '';
        return `
            <div class="vmh-card vmh-right" draggable="true"
                 data-side="right" data-id="${_esc(id)}"
                 role="button" tabindex="0"
                 aria-label="Right item: ${_esc(p.rightText)}">
                ${_cardBody(p.rightText, p.rightModel)}
            </div>
        `;
    }).join('');

    _state.container.innerHTML = `
        <div class="vmh-host" role="application" aria-label="Vocabulary matching">
            <div class="vmh-instructions">Drag a right card onto a left card &mdash; or tap one then the other.</div>
            <div class="vmh-grid">
                <div class="vmh-left-col">${rows}</div>
                <div class="vmh-right-col">
                    <div class="vmh-pool" data-pool="1" role="list" aria-label="Right items pool">
                        ${poolItems}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Move a right card (by id) into the slot for the given leftId. If the
// matching is correct, lock both cards green; otherwise flash red and bounce
// the card back to the pool.
function _attemptMatch(leftId, rightId) {
    if (_state.locked) return;
    if (!leftId || !rightId) return;
    const host = _state.container && _state.container.querySelector('.vmh-host');
    if (!host) return;

    const leftCard = host.querySelector(`.vmh-left[data-id="${CSS.escape(leftId)}"]`);
    const slot = host.querySelector(`.vmh-slot[data-left-id="${CSS.escape(leftId)}"]`);
    const rightCard = host.querySelector(`.vmh-right[data-id="${CSS.escape(rightId)}"]`);
    if (!leftCard || !slot || !rightCard) return;

    // If the slot already holds a locked-correct match, refuse.
    if (slot.dataset.locked === '1') return;
    // If the slot already holds a (wrong) right card, return that one to the
    // pool first so we can place the new pick.
    const existing = slot.querySelector('.vmh-right');
    if (existing) _returnToPool(existing);

    // Place the right card into the slot.
    slot.innerHTML = '';
    slot.appendChild(rightCard);
    rightCard.classList.add('vmh-in-slot');

    const correct = (leftId === rightId);
    if (correct) {
        // Lock both cards green.
        leftCard.classList.add('vmh-correct', 'vmh-locked');
        rightCard.classList.add('vmh-correct', 'vmh-locked');
        rightCard.setAttribute('draggable', 'false');
        slot.classList.add('vmh-correct', 'vmh-locked');
        slot.dataset.locked = '1';
        _state.matches[leftId] = rightId;
        _clearSelection(host);

        // If every left item is now correctly matched, auto-submit.
        if (_allCorrect()) {
            _state.locked = true;
            // Defer the callback so the green-paint repaint flushes first.
            setTimeout(() => {
                try { onVocabMatchSubmit(_currentQ, _snapshotMatches()); }
                catch (err) { console.error('onVocabMatchSubmit failed:', err); }
            }, 220);
        }
    } else {
        // Flash red on both, then bounce the right card back to the pool.
        leftCard.classList.add('vmh-wrong-flash');
        rightCard.classList.add('vmh-wrong-flash');
        slot.classList.add('vmh-wrong-flash');
        _clearSelection(host);
        setTimeout(() => {
            leftCard.classList.remove('vmh-wrong-flash');
            rightCard.classList.remove('vmh-wrong-flash');
            slot.classList.remove('vmh-wrong-flash');
            // Only bounce back if the slot still holds THIS card (the
            // student may have picked a different one in the interim).
            if (rightCard.parentNode === slot) _returnToPool(rightCard);
        }, 520);
    }
}

function _returnToPool(rightCard) {
    if (!rightCard) return;
    const host = _state.container && _state.container.querySelector('.vmh-host');
    if (!host) return;
    const pool = host.querySelector('.vmh-pool');
    if (!pool) return;
    rightCard.classList.remove('vmh-in-slot');
    rightCard.removeAttribute('data-selected');
    pool.appendChild(rightCard);
    // Ensure the slot it left behind shows the placeholder again.
    host.querySelectorAll('.vmh-slot').forEach(slot => {
        if (slot.dataset.locked === '1') return;
        if (!slot.querySelector('.vmh-right')) {
            slot.innerHTML = '<span class="vmh-slot-hint">drop here</span>';
        }
    });
}

function _clearSelection(host) {
    if (!host) return;
    host.querySelectorAll('.vmh-card[data-selected="1"]').forEach(el => {
        el.removeAttribute('data-selected');
    });
    _state.pickedLeftId = null;
    _state.pickedRightId = null;
}

// Stash the current question on render so the auto-submit callback can pass
// it back to the integrator without the integrator having to re-bind.
let _currentQ = null;

function _snapshotMatches() {
    return Object.assign({}, _state.matches);
}

function _onClick(e) {
    if (_state.locked) return;
    const host = _state.container && _state.container.querySelector('.vmh-host');
    if (!host) return;
    const card = e.target.closest('.vmh-card');
    if (!card || !host.contains(card)) return;
    if (card.classList.contains('vmh-locked')) return;

    const side = card.dataset.side;
    const id = card.dataset.id;
    if (!side || !id) return;

    if (side === 'right') {
        // Tapping the same right card again deselects it.
        if (_state.pickedRightId === id) {
            _clearSelection(host);
            return;
        }
        // If a left card is already picked, complete the match.
        if (_state.pickedLeftId) {
            const leftId = _state.pickedLeftId;
            _clearSelection(host);
            _attemptMatch(leftId, id);
            return;
        }
        // Otherwise, mark this right card as the active pick.
        _clearSelection(host);
        card.setAttribute('data-selected', '1');
        _state.pickedRightId = id;
        return;
    }

    // side === 'left'
    if (_state.pickedLeftId === id) {
        _clearSelection(host);
        return;
    }
    if (_state.pickedRightId) {
        const rightId = _state.pickedRightId;
        _clearSelection(host);
        _attemptMatch(id, rightId);
        return;
    }
    _clearSelection(host);
    card.setAttribute('data-selected', '1');
    _state.pickedLeftId = id;
}

// Keyboard support: Enter / Space activates a focused card (same as click).
function _onKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest && e.target.closest('.vmh-card');
    if (!card) return;
    e.preventDefault();
    _onClick({ target: card });
}

export function renderVocabMatch(q, container) {
    if (!container || !q) return;
    const pairs = Array.isArray(q.vocabPairs) ? q.vocabPairs.filter(p => p && p.id) : [];
    if (!pairs.length) {
        container.innerHTML = '<div class="vmh-host"><div class="vmh-instructions">No vocabulary pairs available.</div></div>';
        return;
    }

    _currentQ = q;
    _state = {
        container,
        pairs: pairs.slice(),
        rightOrder: _shuffle(pairs.map(p => p.id)),
        matches: {},
        locked: false,
        pickedLeftId: null,
        pickedRightId: null,
    };

    // Avoid the (extremely small) chance the random shuffle produced the
    // identity order — that would let the student win without thinking.
    if (pairs.length > 1) {
        const ids = pairs.map(p => p.id);
        let identical = true;
        for (let i = 0; i < ids.length; i++) {
            if (_state.rightOrder[i] !== ids[i]) { identical = false; break; }
        }
        if (identical) {
            // Rotate by one — guaranteed different from identity for n > 1.
            _state.rightOrder = _state.rightOrder.slice(1).concat(_state.rightOrder.slice(0, 1));
        }
    }

    _renderHost();

    const host = container.querySelector('.vmh-host');
    if (!host) return;

    host.addEventListener('click', _onClick);
    host.addEventListener('keydown', _onKeydown);

    // ---- HTML5 drag-and-drop (desktop) ----
    host.addEventListener('dragstart', (e) => {
        if (_state.locked) return;
        const card = e.target.closest('.vmh-right');
        if (!card || !host.contains(card)) return;
        if (card.classList.contains('vmh-locked')) {
            e.preventDefault();
            return;
        }
        try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.dataset.id);
        } catch (_e) {}
        card.classList.add('vmh-dragging');
    });
    host.addEventListener('dragend', (e) => {
        const card = e.target.closest('.vmh-right');
        if (card) card.classList.remove('vmh-dragging');
        host.querySelectorAll('.vmh-over').forEach(el => el.classList.remove('vmh-over'));
    });
    host.addEventListener('dragover', (e) => {
        if (_state.locked) return;
        const target = e.target.closest('.vmh-slot, .vmh-left, .vmh-pool');
        if (!target) return;
        if (target.dataset && target.dataset.locked === '1') return;
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'move'; } catch (_e) {}
        target.classList.add('vmh-over');
    });
    host.addEventListener('dragleave', (e) => {
        const target = e.target.closest('.vmh-slot, .vmh-left, .vmh-pool');
        if (target) target.classList.remove('vmh-over');
    });
    host.addEventListener('drop', (e) => {
        if (_state.locked) return;
        let rightId = '';
        try { rightId = e.dataTransfer.getData('text/plain') || ''; } catch (_e) {}
        if (!rightId) return;
        const slot = e.target.closest('.vmh-slot');
        const leftCard = e.target.closest('.vmh-left');
        const pool = e.target.closest('.vmh-pool');
        e.preventDefault();
        host.querySelectorAll('.vmh-over').forEach(el => el.classList.remove('vmh-over'));
        if (slot && slot.dataset.locked !== '1') {
            const leftId = slot.dataset.leftId;
            _attemptMatch(leftId, rightId);
        } else if (leftCard && !leftCard.classList.contains('vmh-locked')) {
            _attemptMatch(leftCard.dataset.id, rightId);
        } else if (pool) {
            // Dropping on the pool returns the card (no-op if already there).
            const card = host.querySelector(`.vmh-right[data-id="${CSS.escape(rightId)}"]`);
            if (card && card.parentNode !== pool) _returnToPool(card);
        }
    });

    // ---- Touch support (mobile/tablet) ----
    enableHostTouchDrag(host, {
        tileSelector: '.vmh-right',
        dropSelector: '.vmh-slot, .vmh-left, .vmh-pool',
        isLocked: () => _state.locked,
        activeClass: 'vmh-dragging',
        overClass: 'vmh-over',
        onDrop: (zone, tileEl) => {
            if (!tileEl) return;
            const rightId = tileEl.dataset.id;
            if (!rightId) return;
            if (zone.classList.contains('vmh-slot')) {
                if (zone.dataset.locked === '1') return;
                _attemptMatch(zone.dataset.leftId, rightId);
            } else if (zone.classList.contains('vmh-left')) {
                if (zone.classList.contains('vmh-locked')) return;
                _attemptMatch(zone.dataset.id, rightId);
            } else if (zone.classList.contains('vmh-pool')) {
                if (tileEl.parentNode !== zone) _returnToPool(tileEl);
            }
        },
    });
}

export function getVocabMatchState() {
    return _snapshotMatches();
}

export function checkVocabMatch(q, matches) {
    if (!q || !Array.isArray(q.vocabPairs)) return false;
    if (!matches || typeof matches !== 'object') return false;
    for (const p of q.vocabPairs) {
        if (matches[p.id] !== p.id) return false;
    }
    return true;
}

// Default no-op stub. The integrator (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onVocabMatchSubmit = function (_q, _matches) { /* noop */ };

export function setOnVocabMatchSubmit(fn) {
    if (typeof fn === 'function') onVocabMatchSubmit = fn;
}
