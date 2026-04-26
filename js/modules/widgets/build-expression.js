// build-expression widget — student reads a word problem and drags symbol/
// number tiles into a row of empty slots to construct the expression that
// solves the problem.
//
// Question contract:
//   q.answerType        = 'build-expr'
//   q.text              = word problem prompt
//   q.targetExpression  = ['8', '-', '3', '=', '5']  // ordered tokens
//   q.palette           = ['8', '3', '5', '-', '=', '+', '2']  // tokens to render
//                          as draggable tiles (target tokens + 2-4 distractors,
//                          shuffled). One tile per array entry — duplicates OK.
//   q.hint              = optional hint string
//
// Behavior:
//   - Renders N empty slots where N = q.targetExpression.length.
//   - Renders palette tiles (operators visually distinct from numbers).
//   - Drag tile → slot, OR click tile then click slot (a11y fallback).
//   - Slot drop swaps any existing tile back to the palette.
//   - Submit becomes enabled when every slot is filled.
//   - On submit: per-slot correctness compared to q.targetExpression.
//   - Wrong slots flash red, correct slots flash green; wrong tiles return
//     to the palette via _beUnlockForRetry for in-place correction.
//
// Pure module — no globals attached, no DOM mutation outside `container`.

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _isOperator(tok) {
    return tok === '+' || tok === '-' || tok === '×' || tok === 'x'
        || tok === '*' || tok === '÷' || tok === '/' || tok === '=';
}

// Display normalization: prefer the typographically correct glyph.
function _displayToken(tok) {
    if (tok === '*' || tok === 'x') return '×';
    if (tok === '/') return '÷';
    return tok;
}

// ARIA-friendly spoken description.
function _spokenToken(tok) {
    const t = _displayToken(tok);
    if (t === '+') return 'plus';
    if (t === '-') return 'minus';
    if (t === '×') return 'times';
    if (t === '÷') return 'divided by';
    if (t === '=') return 'equals';
    return t;
}

export function renderBuildExpression(q, container) {
    if (!container || !q) return;

    const target = Array.isArray(q.targetExpression) ? q.targetExpression.map(String) : [];
    const palette = Array.isArray(q.palette) ? q.palette.map(String) : target.slice();
    const slots = target.length;

    // Build palette tiles with stable ids (one per palette entry — duplicates OK).
    const tiles = palette.map((tok, i) => ({
        id: `betile-${i}`,
        token: tok,
        display: _displayToken(tok),
        isOp: _isOperator(tok),
    }));

    const tilesHtml = tiles.map(t => {
        const cls = t.isOp ? 'be-tile be-op' : 'be-tile be-num';
        return `<button type="button" class="${cls}"
            draggable="true"
            data-id="${_esc(t.id)}"
            data-token="${_esc(t.token)}"
            tabindex="0"
            aria-pressed="false"
            aria-label="${_esc(_spokenToken(t.token))} tile, draggable">${_esc(t.display)}</button>`;
    }).join('');

    const slotsHtml = Array.from({ length: slots }, (_, i) =>
        `<div class="be-slot" data-slot="${i}" role="button" tabindex="0"
            aria-label="Slot ${i + 1} of ${slots}, empty"></div>`
    ).join('');

    container.innerHTML = `
        <div class="be-host" role="application" aria-label="Build the expression by dragging tiles into the slots">
            <div class="be-prompt">${_esc(q.text || '')}</div>
            <div class="be-hint">Drag tiles into the slots, or click a tile then click a slot.</div>
            <div class="be-slots-row" data-role="slots" aria-label="Expression slots">${slotsHtml}</div>
            <div class="be-palette" data-role="palette" aria-label="Available tiles">${tilesHtml}</div>
            <div class="be-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="be-submit primary-btn" disabled>Submit</button>
        </div>
        <style>
            .be-host { padding: 8px 0; position: relative; }
            .be-prompt { font-size: 1.05rem; font-weight: 600; margin-bottom: 6px; }
            .be-hint { font-size: 0.85rem; color: #666; margin-bottom: 12px; font-style: italic; }
            .be-slots-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; padding: 14px 8px; background: #f5f7fa; border: 2px dashed #b0bec5; border-radius: 10px; margin-bottom: 14px; min-height: 70px; }
            .be-slot { min-width: 64px; height: 56px; border: 2px dashed #90a4ae; border-radius: 8px; background: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.4rem; cursor: pointer; transition: all 0.15s; }
            .be-slot.over { background: #e3f2fd; border-color: #1565c0; }
            .be-slot.filled { border-style: solid; border-color: #455a64; background: #fff; }
            .be-slot:focus { outline: 3px solid #ffd54f; outline-offset: 2px; }
            .be-slot.correct-flash { background: #c8e6c9 !important; border-color: #2e7d32 !important; color: #1b5e20; }
            .be-slot.wrong-flash { background: #ffcdd2 !important; border-color: #c62828 !important; color: #b71c1c; animation: be-shake 0.4s; }
            @keyframes be-shake { 0%,100%{transform:translateX(0);} 25%{transform:translateX(-4px);} 75%{transform:translateX(4px);} }
            .be-slot .be-tile { margin: 0; min-width: 0; padding: 6px 10px; font-size: 1.3rem; }
            .be-palette { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 12px; background: #fafafa; border: 1px solid #e0e0e0; border-radius: 10px; min-height: 50px; }
            .be-palette.over { background: #fff3e0; border-color: #ef6c00; }
            .be-tile { display: inline-flex; align-items: center; justify-content: center; min-width: 56px; height: 48px; padding: 6px 14px; border: 2px solid #1565c0; border-radius: 8px; background: #e3f2fd; color: #0d47a1; font-weight: 800; font-size: 1.3rem; cursor: grab; user-select: none; transition: transform 0.12s, box-shadow 0.12s; font-family: inherit; }
            .be-tile.be-op { background: #fff3e0; color: #e65100; border-color: #ef6c00; font-size: 1.5rem; }
            .be-tile:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .be-tile:focus { outline: 3px solid #ffd54f; outline-offset: 2px; }
            .be-tile.tile-active { background: #ffeb3b; border-color: #f9a825; color: #6d4c00; }
            .be-tile.dragging { opacity: 0.5; }
            .be-submit { margin-top: 14px; }
        </style>
    `;

    const host = container.querySelector('.be-host');
    const slotsRow = host.querySelector('[data-role="slots"]');
    const palette_el = host.querySelector('[data-role="palette"]');
    const submit = host.querySelector('.be-submit');
    const live = host.querySelector('.be-live');
    let locked = false;
    let activeId = null;

    function _announce(msg) { if (live) live.textContent = msg; }

    function _getCurrentTokens() {
        const out = [];
        slotsRow.querySelectorAll('.be-slot').forEach(slot => {
            const tile = slot.querySelector('.be-tile');
            out.push(tile ? tile.dataset.token : null);
        });
        return out;
    }

    function _refresh() {
        const tokens = _getCurrentTokens();
        submit.disabled = !tokens.every(t => t != null);
    }

    function _refreshSlotAria() {
        slotsRow.querySelectorAll('.be-slot').forEach(s => {
            const idx = parseInt(s.dataset.slot, 10);
            const tile = s.querySelector('.be-tile');
            s.classList.toggle('filled', !!tile);
            if (tile) {
                s.setAttribute('aria-label',
                    `Slot ${idx + 1}, filled with ${_spokenToken(tile.dataset.token)}`);
            } else {
                s.setAttribute('aria-label', `Slot ${idx + 1} of ${slots}, empty`);
            }
        });
    }

    function _clearActive() {
        if (activeId) {
            const t = host.querySelector(`.be-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t) { t.classList.remove('tile-active'); t.setAttribute('aria-pressed', 'false'); }
        }
        activeId = null;
    }

    function _setActive(el) {
        _clearActive();
        if (!el) return;
        el.classList.add('tile-active');
        el.setAttribute('aria-pressed', 'true');
        activeId = el.dataset.id;
        _announce(`Picked up ${_spokenToken(el.dataset.token)}.`);
    }

    function _placeTileInSlot(tileEl, slotEl) {
        if (!tileEl || !slotEl) return;
        // Displace existing tile in the slot back to the palette.
        const existing = slotEl.querySelector('.be-tile');
        if (existing && existing !== tileEl) {
            palette_el.appendChild(existing);
            existing.classList.remove('tile-active');
            existing.setAttribute('aria-pressed', 'false');
        }
        slotEl.appendChild(tileEl);
        _clearActive();
        _announce(`${_spokenToken(tileEl.dataset.token)} placed in slot ${parseInt(slotEl.dataset.slot, 10) + 1}.`);
        _refreshSlotAria();
        _refresh();
    }

    function _returnTileToPalette(tileEl) {
        if (!tileEl) return;
        palette_el.appendChild(tileEl);
        _clearActive();
        _announce(`${_spokenToken(tileEl.dataset.token)} returned to palette.`);
        _refreshSlotAria();
        _refresh();
    }

    // ---- Click-to-pick + click-to-place ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const tile = e.target.closest('.be-tile');
        const slot = e.target.closest('.be-slot');
        if (tile && host.contains(tile)) {
            if (activeId === tile.dataset.id) {
                _clearActive(); _announce('Selection cleared.');
            } else {
                _setActive(tile);
            }
            return;
        }
        if (slot && host.contains(slot) && activeId) {
            const t = host.querySelector(`.be-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t) _placeTileInSlot(t, slot);
            return;
        }
        // Click empty palette area to return active tile.
        if (e.target === palette_el && activeId) {
            const t = host.querySelector(`.be-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t && t.parentNode !== palette_el) _returnTileToPalette(t);
        }
    });

    // Keyboard activation
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tile = e.target.closest('.be-tile');
        const slot = e.target.closest('.be-slot');
        if (tile || slot) { e.preventDefault(); (tile || slot).click(); }
    });

    // ---- HTML5 native drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) return;
        const tile = e.target.closest('.be-tile');
        if (!tile) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('dragging');
    });
    host.addEventListener('dragend', (e) => {
        const tile = e.target.closest('.be-tile');
        if (tile) tile.classList.remove('dragging');
        host.querySelectorAll('.be-slot.over, .be-palette.over')
            .forEach(el => el.classList.remove('over'));
    });
    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const slot = e.target.closest('.be-slot');
        const pal = e.target.closest('.be-palette');
        if (slot || pal) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            (slot || pal).classList.add('over');
        }
    });
    host.addEventListener('dragleave', (e) => {
        const el = e.target.closest('.be-slot, .be-palette');
        if (el) el.classList.remove('over');
    });
    host.addEventListener('drop', (e) => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tile = host.querySelector(`.be-tile[data-id="${CSS.escape(id)}"]`);
        if (!tile) return;
        const slot = e.target.closest('.be-slot');
        const pal = e.target.closest('.be-palette');
        if (slot) { e.preventDefault(); slot.classList.remove('over'); _placeTileInSlot(tile, slot); }
        else if (pal) { e.preventDefault(); pal.classList.remove('over'); _returnTileToPalette(tile); }
    });

    // ---- Lock / unlock for retry ----
    function lockWidget() {
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.be-tile, .be-slot').forEach(el => {
            el.setAttribute('draggable', 'false');
        });
    }

    // Per-slot feedback paint. wrongSlotIdxs is an array of slot indices that
    // are wrong; correct slots get a green flash.
    function paintFeedback(wrongSlotIdxs) {
        const wrongSet = new Set((wrongSlotIdxs || []).map(Number));
        slotsRow.querySelectorAll('.be-slot').forEach(s => {
            const idx = parseInt(s.dataset.slot, 10);
            const tile = s.querySelector('.be-tile');
            if (!tile) return;
            if (wrongSet.has(idx)) s.classList.add('wrong-flash');
            else s.classList.add('correct-flash');
        });
    }

    function unlockForRetry(wrongSlotIdxs) {
        // Clear flash classes & put wrong tiles back to the palette.
        host.querySelectorAll('.correct-flash, .wrong-flash')
            .forEach(el => el.classList.remove('correct-flash', 'wrong-flash'));
        const wrongSet = new Set((wrongSlotIdxs || []).map(Number));
        wrongSet.forEach(idx => {
            const slot = slotsRow.querySelector(`.be-slot[data-slot="${idx}"]`);
            if (!slot) return;
            const tile = slot.querySelector('.be-tile');
            if (tile) palette_el.appendChild(tile);
        });
        locked = false;
        host.querySelectorAll('.be-tile').forEach(el => el.setAttribute('draggable', 'true'));
        _refreshSlotAria();
        _refresh();
    }

    container._beLock = lockWidget;
    container._beUnlockForRetry = unlockForRetry;
    container._bePaintFeedback = paintFeedback;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        const tokens = _getCurrentTokens();
        try { onBuildExpressionSubmit(q, tokens); }
        catch (err) { console.error('onBuildExpressionSubmit failed:', err); }
    });

    _refreshSlotAria();
    _refresh();
}

// Returns true iff every slot's token equals the corresponding target token.
// Tokens are normalized so "x"/"*" both match "×" and "/" matches "÷".
export function checkBuildExpression(q, tokens) {
    if (!q || !Array.isArray(q.targetExpression) || !Array.isArray(tokens)) return false;
    if (q.targetExpression.length !== tokens.length) return false;
    for (let i = 0; i < q.targetExpression.length; i++) {
        if (_displayToken(String(tokens[i])) !== _displayToken(String(q.targetExpression[i]))) {
            return false;
        }
    }
    return true;
}

// Returns array of slot indices that are wrong (or empty).
export function wrongSlotIndexes(q, tokens) {
    const out = [];
    if (!q || !Array.isArray(q.targetExpression)) return out;
    const tgt = q.targetExpression;
    for (let i = 0; i < tgt.length; i++) {
        const placed = (tokens && tokens[i] != null) ? String(tokens[i]) : null;
        if (placed == null || _displayToken(placed) !== _displayToken(String(tgt[i]))) {
            out.push(i);
        }
    }
    return out;
}

export let onBuildExpressionSubmit = function (_q, _tokens) { /* noop */ };
export function setOnBuildExpressionSubmit(fn) {
    if (typeof fn === 'function') onBuildExpressionSubmit = fn;
}
