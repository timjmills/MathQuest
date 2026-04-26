// compose-fraction-tiles widget — student drags unit-fraction tiles into a
// target bar to fill it exactly to a target fractional value.
//
// Question contract:
//   q.answerType = 'compose-fraction-tiles'
//   q.targetNum:  numerator of the target (e.g. 1 for "one whole", 3 for "3/4")
//   q.targetDen:  denominator of the target (e.g. 1 for "one whole", 4 for "3/4")
//   q.palette:    array of unit fraction objects, e.g.
//                 [{ n:1, d:2, count:2 }, { n:1, d:4, count:4 }, ...]
//                 Each entry seeds `count` draggable tiles of value n/d.
//   q.text:       prompt
//   q.hint:       optional hint
//
// Submit becomes enabled the moment placed tiles equal the target. If the
// student presses Submit with a different sum, integration (question-render)
// flashes red and unlocks for retry; placed tiles return to the palette.
//
// Pure module — no globals attached, no DOM mutation outside `container`.

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _gcd(a, b) { return b === 0 ? Math.abs(a) : _gcd(b, Math.abs(a) % b); }
function _lcm(a, b) { return Math.abs(a * b) / _gcd(a, b); }

// Convert a list of {n,d} placements to a single reduced fraction (sumN, sumD).
function _sumFractions(placements) {
    if (!placements.length) return { n: 0, d: 1 };
    let lcd = 1;
    placements.forEach(p => { lcd = _lcm(lcd, p.d); });
    let total = 0;
    placements.forEach(p => { total += (lcd / p.d) * p.n; });
    const g = _gcd(total, lcd) || 1;
    return { n: total / g, d: lcd / g };
}

// Pretty fraction HTML using stacked num/den boxes.
function _fracHtml(n, d, color) {
    if (d === 1) return `<span style="font-weight:800;font-size:1.4rem;color:${color};">${n}</span>`;
    return `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1;font-weight:700;color:${color};vertical-align:middle;">
        <span style="font-size:1.05rem;padding:0 4px;">${n}</span>
        <span style="display:block;width:100%;border-top:2px solid ${color};margin:1px 0;"></span>
        <span style="font-size:1.05rem;padding:0 4px;">${d}</span>
    </span>`;
}

// Color palette per denominator — keeps the same fraction value visually
// consistent (all halves are blue, all fourths are orange, etc.).
const _DEN_COLOR = {
    1: '#37474f', 2: '#1976d2', 3: '#7b1fa2', 4: '#ef6c00',
    5: '#00838f', 6: '#2e7d32', 8: '#c62828', 10: '#5e35b1', 12: '#ad1457'
};
function _colorForDen(d) { return _DEN_COLOR[d] || '#455a64'; }

export function renderComposeFractionTiles(q, container) {
    if (!container || !q) return;

    // Normalize target.
    const tNum = Math.max(1, Math.floor(q.targetNum || 1));
    const tDen = Math.max(1, Math.floor(q.targetDen || 1));
    // Bar is sized to one whole; if target > 1 we still draw a single bar for
    // the whole and grey-out the unused portion. (Generators in this batch
    // only produce target ≤ 1 — keep it simple.)
    const targetFracOfWhole = Math.min(1, tNum / tDen);

    // Build palette tiles with stable ids.
    const palette = Array.isArray(q.palette) ? q.palette : [];
    let _tid = 0;
    const tiles = [];
    palette.forEach(entry => {
        const n = Math.max(1, Math.floor(entry.n || 1));
        const d = Math.max(1, Math.floor(entry.d || 1));
        const count = Math.max(1, Math.floor(entry.count || 1));
        for (let i = 0; i < count; i++) {
            tiles.push({ id: `tile-${_tid++}`, n, d });
        }
    });

    // Bar geometry — width is a fixed virtual unit (1.0 = full bar).
    // Each tile's width is (n/d) * BAR_WIDTH px.
    const BAR_WIDTH = 480;
    const BAR_HEIGHT = 56;

    // Build palette HTML (clickable / draggable cards). Each tile shows its
    // fraction label and is colored by denominator.
    const paletteHtml = tiles.map(t => {
        const color = _colorForDen(t.d);
        const widthPx = Math.max(48, Math.round((t.n / t.d) * BAR_WIDTH * 0.5));
        return `<button type="button" class="cft-tile" draggable="true"
            data-id="${t.id}" data-n="${t.n}" data-d="${t.d}"
            style="background:${color}22;border:2px solid ${color};color:${color};min-width:${widthPx}px;"
            tabindex="0" aria-pressed="false"
            aria-label="Fraction tile ${t.n} over ${t.d}">
            ${_fracHtml(t.n, t.d, color)}
        </button>`;
    }).join('');

    // Target marker line — drawn inside the target bar at (target/whole) * width
    const markerX = Math.round(targetFracOfWhole * BAR_WIDTH);
    const targetLabel = (tDen === 1)
        ? `${tNum} whole`
        : `${tNum}/${tDen}`;

    container.innerHTML = `
        <div class="cft-host" role="application" aria-label="Compose a fraction by dragging tiles into the target bar">
            <div class="cft-prompt">${_esc(q.text || '')}</div>
            <div class="cft-hint">Drag tiles into the bar (or click a tile then click the bar). Make the tiles add up to <strong>${_esc(targetLabel)}</strong>.</div>

            <div class="cft-target-wrap">
                <div class="cft-target-label">Target: <strong>${_esc(targetLabel)}</strong></div>
                <div class="cft-target-bar" data-role="target"
                     style="width:${BAR_WIDTH}px;height:${BAR_HEIGHT}px;"
                     role="button" tabindex="0"
                     aria-label="Target bar, drop tiles here">
                    ${tDen === 1
                        ? ''
                        : `<div class="cft-target-mask" style="left:${markerX}px;width:${BAR_WIDTH - markerX}px;"></div>
                           <div class="cft-target-marker" style="left:${markerX}px;" aria-hidden="true"></div>`}
                    <div class="cft-placed-row" data-role="placed"></div>
                </div>
                <div class="cft-sum-readout" aria-live="polite">Total: <span data-role="sum">0</span> &nbsp;|&nbsp; Need: ${_esc(targetLabel)}</div>
            </div>

            <div class="cft-palette" data-role="palette" aria-label="Fraction tile palette">
                ${paletteHtml}
            </div>

            <div class="cft-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="cft-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const host = container.querySelector('.cft-host');
    const target = host.querySelector('[data-role="target"]');
    const placedRow = host.querySelector('[data-role="placed"]');
    const palette_el = host.querySelector('[data-role="palette"]');
    const sumOut = host.querySelector('[data-role="sum"]');
    const submit = host.querySelector('.cft-submit');
    const live = host.querySelector('.cft-live');
    let locked = false;
    let activeId = null;

    function _announce(msg) { if (live) live.textContent = msg; }

    function _getPlaced() {
        const out = [];
        placedRow.querySelectorAll('.cft-tile').forEach(el => {
            out.push({ id: el.dataset.id, n: parseInt(el.dataset.n, 10), d: parseInt(el.dataset.d, 10) });
        });
        return out;
    }

    function _refresh() {
        const placed = _getPlaced();
        const sum = _sumFractions(placed);
        const sumColor = _colorForDen(sum.d);
        sumOut.innerHTML = (sum.n === 0)
            ? '<span style="color:#888;">0</span>'
            : _fracHtml(sum.n, sum.d, sumColor);
        // Equal if cross-product matches.
        const isEqual = (sum.n * tDen === tNum * sum.d);
        submit.disabled = !isEqual;
        // Light highlight on the bar when complete.
        target.classList.toggle('cft-target-complete', isEqual);
    }

    function _clearActive() {
        if (activeId) {
            const t = host.querySelector(`.cft-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t) { t.classList.remove('cft-tile-active'); t.setAttribute('aria-pressed', 'false'); }
        }
        activeId = null;
    }
    function _setActive(el) {
        _clearActive();
        if (!el) return;
        el.classList.add('cft-tile-active');
        el.setAttribute('aria-pressed', 'true');
        activeId = el.dataset.id;
        _announce(`Picked up tile ${el.dataset.n} over ${el.dataset.d}.`);
    }

    function _placeTileInTarget(tileEl) {
        if (!tileEl) return;
        // Tiles are sized to (n/d * BAR_WIDTH) px when placed so they snap to
        // their proportional width inside the target bar.
        const n = parseInt(tileEl.dataset.n, 10);
        const d = parseInt(tileEl.dataset.d, 10);
        const widthPx = Math.max(28, Math.round((n / d) * BAR_WIDTH));
        tileEl.classList.add('cft-tile-placed');
        tileEl.style.minWidth = '';
        tileEl.style.width = widthPx + 'px';
        tileEl.style.height = (BAR_HEIGHT - 8) + 'px';
        placedRow.appendChild(tileEl);
        _clearActive();
        _announce(`Placed ${n} over ${d} in the bar.`);
        _refresh();
    }

    function _returnTileToPalette(tileEl) {
        if (!tileEl) return;
        tileEl.classList.remove('cft-tile-placed');
        tileEl.style.width = '';
        tileEl.style.height = '';
        const n = parseInt(tileEl.dataset.n, 10);
        const d = parseInt(tileEl.dataset.d, 10);
        const widthPx = Math.max(48, Math.round((n / d) * BAR_WIDTH * 0.5));
        tileEl.style.minWidth = widthPx + 'px';
        palette_el.appendChild(tileEl);
        _clearActive();
        _announce(`Returned tile ${n} over ${d} to the palette.`);
        _refresh();
    }

    // ---- Click-to-pick + click-to-place ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const tile = e.target.closest('.cft-tile');
        if (tile && host.contains(tile)) {
            if (activeId === tile.dataset.id) {
                _clearActive(); _announce('Selection cleared.');
            } else {
                _setActive(tile);
            }
            return;
        }
        const tgt = e.target.closest('[data-role="target"]');
        if (tgt && activeId) {
            const t = host.querySelector(`.cft-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t) _placeTileInTarget(t);
            return;
        }
        const pal = e.target.closest('[data-role="palette"]');
        if (pal && activeId) {
            const t = host.querySelector(`.cft-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t && t.parentNode !== palette_el) _returnTileToPalette(t);
        }
    });

    // Keyboard activation
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tile = e.target.closest('.cft-tile');
        const tgt = e.target.closest('[data-role="target"]');
        if (tile || tgt) { e.preventDefault(); (tile || tgt).click(); }
    });

    // ---- HTML5 drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) return;
        const tile = e.target.closest('.cft-tile');
        if (!tile) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('cft-dragging');
    });
    host.addEventListener('dragend', (e) => {
        const tile = e.target.closest('.cft-tile');
        if (tile) tile.classList.remove('cft-dragging');
        host.querySelectorAll('.cft-target-bar.over, .cft-palette.over')
            .forEach(el => el.classList.remove('over'));
    });
    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const tgt = e.target.closest('[data-role="target"]');
        const pal = e.target.closest('[data-role="palette"]');
        if (tgt || pal) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            (tgt || pal).classList.add('over');
        }
    });
    host.addEventListener('dragleave', (e) => {
        const el = e.target.closest('[data-role="target"], [data-role="palette"]');
        if (el) el.classList.remove('over');
    });
    host.addEventListener('drop', (e) => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tile = host.querySelector(`.cft-tile[data-id="${CSS.escape(id)}"]`);
        if (!tile) return;
        const tgt = e.target.closest('[data-role="target"]');
        const pal = e.target.closest('[data-role="palette"]');
        if (tgt) { e.preventDefault(); tgt.classList.remove('over'); _placeTileInTarget(tile); }
        else if (pal) { e.preventDefault(); pal.classList.remove('over'); _returnTileToPalette(tile); }
    });

    // ---- Lock / unlock for retry ----
    function lockWidget() {
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.cft-tile').forEach(el => el.setAttribute('draggable', 'false'));
    }
    function unlockForRetry() {
        // Wrong submit: pop ALL placed tiles back to the palette so the
        // student can rebuild fresh. Compose problems are short enough that
        // a clean slate is gentler than per-tile feedback.
        host.querySelectorAll('.correct-flash, .wrong-flash')
            .forEach(el => el.classList.remove('correct-flash', 'wrong-flash'));
        const placedTiles = Array.from(placedRow.querySelectorAll('.cft-tile'));
        placedTiles.forEach(t => _returnTileToPalette(t));
        locked = false;
        host.querySelectorAll('.cft-tile').forEach(el => el.setAttribute('draggable', 'true'));
        _refresh();
    }
    function flashCorrect() {
        target.classList.add('correct-flash');
    }
    function flashWrong() {
        target.classList.add('wrong-flash');
    }
    container._cftLock = lockWidget;
    container._cftUnlockForRetry = unlockForRetry;
    container._cftFlashCorrect = flashCorrect;
    container._cftFlashWrong = flashWrong;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        const placed = _getPlaced();
        try { onComposeFractionTilesSubmit(q, placed); }
        catch (err) { console.error('onComposeFractionTilesSubmit failed:', err); }
    });

    _refresh();
}

// Returns true iff sum of placed tile values equals the target fraction.
export function checkComposeFractionTiles(q, placedTiles) {
    if (!q || !Array.isArray(placedTiles)) return false;
    const tNum = Math.max(1, Math.floor(q.targetNum || 1));
    const tDen = Math.max(1, Math.floor(q.targetDen || 1));
    if (placedTiles.length === 0) return false;
    const sum = _sumFractions(placedTiles);
    // Cross-multiply equality (avoids float compare).
    return sum.n * tDen === tNum * sum.d;
}

export let onComposeFractionTilesSubmit = function (_q, _placed) { /* noop */ };
export function setOnComposeFractionTilesSubmit(fn) {
    if (typeof fn === 'function') onComposeFractionTilesSubmit = fn;
}
