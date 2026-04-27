// compose-shape-blocks widget — student fills a target outline by dragging
// pattern blocks from a palette into predefined snap-points on the target.
//
// Question contract:
//   q.answerType    = 'compose-shape-blocks'
//   q.targetSvg:    inline SVG markup of the target outline (must include
//                   viewBox; should be a single closed shape, no fill).
//   q.snapPoints:   array of snap-point definitions:
//                   [{ id, shape, cx, cy, rotation? }, ...]
//                     - id        : unique slot identifier
//                     - shape     : one of 'triangle' | 'square' | 'rhombus'
//                                  | 'trapezoid' | 'hexagon'
//                     - cx, cy    : center position (in SVG userSpace)
//                     - rotation  : optional integer degrees (default 0)
//                   Every snap-point MUST be filled with the right shape for
//                   submit to succeed.
//   q.palette:      array of available block entries:
//                   [{ shape: 'triangle', count: 6 }, ...]
//   q.text:         prompt
//   q.hint:         optional hint
//
// Submit becomes enabled when every snap-point has a tile placed in it AND
// each placed tile's shape matches the snap-point's required shape. Multiple
// valid solutions can exist (e.g. a hexagon outline can have a single
// snap-point for a hexagon block, or three snap-points for rhombi). The
// generator decides which solution(s) to permit.
//
// Pure module — no globals attached, no DOM mutation outside `container`.

import { enableHostTouchDrag } from '../drag-touch.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Pattern-block colors match standard physical-manipulative colors used in
// elementary classrooms (yellow hexagon, red trapezoid, blue rhombus, etc.).
const _BLOCK_STYLE = {
    triangle:  { fill: '#4caf50', stroke: '#2e7d32', label: 'Triangle' },
    square:    { fill: '#fb8c00', stroke: '#e65100', label: 'Square' },
    rhombus:   { fill: '#1e88e5', stroke: '#0d47a1', label: 'Rhombus' },
    trapezoid: { fill: '#e53935', stroke: '#b71c1c', label: 'Trapezoid' },
    hexagon:   { fill: '#fdd835', stroke: '#f9a825', label: 'Hexagon' }
};

// Generate a polygon-points string for a given shape, scaled to fit a
// nominal "unit" of 28px (snap-points should match this size budget).
// Coordinates are returned RELATIVE to (0,0) for easy translate transforms.
function _shapePoints(shape, unit) {
    unit = unit || 28;
    switch (shape) {
        case 'triangle': {
            // Equilateral triangle, side = unit*2
            const side = unit * 2;
            const h = side * Math.sqrt(3) / 2;
            return [
                [0, -h * 2 / 3],
                [side / 2, h / 3],
                [-side / 2, h / 3]
            ].map(p => p.join(',')).join(' ');
        }
        case 'square': {
            const s = unit * 2;
            return [
                [-s / 2, -s / 2], [s / 2, -s / 2],
                [s / 2, s / 2], [-s / 2, s / 2]
            ].map(p => p.join(',')).join(' ');
        }
        case 'rhombus': {
            // 60°/120° blue rhombus — long diagonal vertical
            const a = unit;        // half short diag
            const b = unit * Math.sqrt(3); // half long diag
            return [
                [0, -b], [a, 0], [0, b], [-a, 0]
            ].map(p => p.map(v => v.toFixed(2)).join(',')).join(' ');
        }
        case 'trapezoid': {
            // Isosceles trapezoid (red pattern block) — 3 unit edges + 1 unit*2 top? Actually pattern-block trapezoid: half-hexagon — bottom = 2u, top = u, height = u*sqrt(3)/2 * something. Simpler: top=2u, bottom=4u, height=2u
            const u = unit;
            return [
                [-u, -u], [u, -u], [2 * u, u], [-2 * u, u]
            ].map(p => p.join(',')).join(' ');
        }
        case 'hexagon': {
            const r = unit * 2;
            const pts = [];
            for (let i = 0; i < 6; i++) {
                const ang = Math.PI / 3 * i - Math.PI / 2;
                pts.push([r * Math.cos(ang), r * Math.sin(ang)].map(v => v.toFixed(2)).join(','));
            }
            return pts.join(' ');
        }
        default:
            return '0,0';
    }
}

// Render a single pattern block as an inline-SVG button (palette tile).
function _paletteTileSvg(shape, id, n, unit) {
    const style = _BLOCK_STYLE[shape] || _BLOCK_STYLE.square;
    const pts = _shapePoints(shape, unit);
    const box = unit * 5;
    return `<button type="button" class="csb-tile" draggable="true"
        data-id="${id}" data-shape="${shape}"
        tabindex="0" aria-pressed="false"
        aria-label="${style.label} block, draggable">
        <svg width="${box}" height="${box}" viewBox="${-box / 2} ${-box / 2} ${box} ${box}"
             style="display:block;pointer-events:none;">
            <polygon points="${pts}"
                fill="${style.fill}" stroke="${style.stroke}" stroke-width="2"
                stroke-linejoin="round"/>
        </svg>
        <span class="csb-tile-label">${style.label}</span>
    </button>`;
}

export function renderComposeShapeBlocks(q, container) {
    if (!container || !q) return;

    // Normalize inputs.
    const targetSvg = q.targetSvg || '<svg viewBox="0 0 240 200"></svg>';
    const snapPoints = Array.isArray(q.snapPoints) ? q.snapPoints : [];
    const palette = Array.isArray(q.palette) ? q.palette : [];
    const unit = q.unit || 28;

    // Build a stable list of palette tile IDs.
    let _id = 0;
    const tiles = [];
    palette.forEach(p => {
        const shape = p.shape || 'square';
        const count = Math.max(1, Math.floor(p.count || 1));
        for (let i = 0; i < count; i++) {
            tiles.push({ id: `csb-${_id++}`, shape });
        }
    });
    const paletteHtml = tiles.map(t => _paletteTileSvg(t.shape, t.id, 1, unit)).join('');

    // Extract the inner contents of the target SVG so we can compose snap-
    // point overlays + dropped polygon shapes alongside the outline.
    const viewBoxMatch = targetSvg.match(/<svg\b[^>]*\bviewBox\s*=\s*"([^"]+)"/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 240 200';
    const innerSvg = targetSvg
        .replace(/^[\s\S]*?<svg[^>]*>/i, '')
        .replace(/<\/svg>\s*$/i, '');

    // Render snap-points as faint dashed shape outlines in the same shape
    // they accept — gives the student a visual hint of what fits where.
    const snapHtml = snapPoints.map(sp => {
        const style = _BLOCK_STYLE[sp.shape] || _BLOCK_STYLE.square;
        const pts = _shapePoints(sp.shape, unit);
        const rot = sp.rotation || 0;
        return `<g class="csb-snap" data-snap="${_esc(sp.id)}" data-shape="${sp.shape}"
                   data-cx="${sp.cx}" data-cy="${sp.cy}" data-rot="${rot}"
                   transform="translate(${sp.cx},${sp.cy}) rotate(${rot})"
                   tabindex="0" role="button"
                   aria-label="${style.label} slot, empty">
            <polygon class="csb-snap-outline" points="${pts}"
                fill="rgba(0,0,0,0.04)" stroke="#90a4ae" stroke-width="1.5"
                stroke-dasharray="6,4" stroke-linejoin="round"/>
        </g>`;
    }).join('');

    container.innerHTML = `
        <div class="csb-host" role="application" aria-label="Compose shape by dragging blocks into target">
            <div class="csb-prompt">${_esc(q.text || '')}</div>
            <div class="csb-hint">Drag pattern blocks into the dashed slots, or click a block then click a slot.</div>

            <div class="csb-stage">
                <svg class="csb-target-svg" viewBox="${_esc(viewBox)}"
                     preserveAspectRatio="xMidYMid meet"
                     xmlns="http://www.w3.org/2000/svg"
                     role="img"
                     aria-label="Target outline">
                    ${innerSvg}
                    <g class="csb-snaps-layer" data-role="snaps">${snapHtml}</g>
                </svg>
            </div>

            <div class="csb-counter" aria-live="polite">
                <span data-role="filled">0</span> of ${snapPoints.length} slots filled
            </div>

            <div class="csb-palette" data-role="palette" aria-label="Pattern block palette">
                ${paletteHtml}
            </div>

            <div class="csb-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="csb-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const host = container.querySelector('.csb-host');
    const svg = host.querySelector('.csb-target-svg');
    const palette_el = host.querySelector('[data-role="palette"]');
    const counter = host.querySelector('[data-role="filled"]');
    const submit = host.querySelector('.csb-submit');
    const live = host.querySelector('.csb-live');
    let locked = false;
    let activeId = null;

    // Map snap-id -> tile-id currently placed there.
    const placement = new Map();

    function _announce(msg) { if (live) live.textContent = msg; }

    function _refresh() {
        const filled = placement.size;
        counter.textContent = String(filled);
        // Submit only when ALL snap-points are filled with the right shape.
        let ok = (filled === snapPoints.length && filled > 0);
        if (ok) {
            for (const sp of snapPoints) {
                const tileId = placement.get(sp.id);
                if (!tileId) { ok = false; break; }
                const tileEl = host.querySelector(`.csb-tile[data-id="${CSS.escape(tileId)}"]`);
                if (!tileEl || tileEl.dataset.shape !== sp.shape) { ok = false; break; }
            }
        }
        submit.disabled = !ok;
    }

    function _clearActive() {
        if (activeId) {
            const t = host.querySelector(`.csb-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t) { t.classList.remove('csb-tile-active'); t.setAttribute('aria-pressed', 'false'); }
        }
        activeId = null;
    }
    function _setActive(el) {
        _clearActive();
        if (!el) return;
        el.classList.add('csb-tile-active');
        el.setAttribute('aria-pressed', 'true');
        activeId = el.dataset.id;
        _announce(`Picked up ${el.dataset.shape}.`);
    }

    // Place a palette tile into a specific snap-point. Visual: hide the
    // palette tile and inject a colored polygon at the snap location.
    function _placeTileInSnap(tileEl, snapEl) {
        if (!tileEl || !snapEl) return;
        const shape = tileEl.dataset.shape;
        const snapShape = snapEl.dataset.shape;
        if (shape !== snapShape) {
            // Reject — wrong shape for this slot.
            snapEl.classList.add('csb-snap-reject');
            setTimeout(() => snapEl.classList.remove('csb-snap-reject'), 320);
            _announce(`That ${shape} doesn't fit a ${snapShape} slot.`);
            return;
        }
        const snapId = snapEl.dataset.snap;
        // If the snap is already filled, return its current tile to the palette.
        const existing = placement.get(snapId);
        if (existing && existing !== tileEl.dataset.id) {
            _returnToPalette(existing);
        }
        // If THIS tile was previously placed in another snap, vacate that one.
        for (const [k, v] of placement.entries()) {
            if (v === tileEl.dataset.id) {
                placement.delete(k);
                _redrawSnap(k);
            }
        }
        placement.set(snapId, tileEl.dataset.id);
        // Hide the palette tile.
        tileEl.classList.add('csb-tile-placed');
        tileEl.setAttribute('aria-pressed', 'false');
        tileEl.style.display = 'none';
        _redrawSnap(snapId);
        _clearActive();
        _announce(`Placed ${shape} in slot.`);
        _refresh();
    }

    // Return a placed tile (by id) to the palette and clear its snap.
    function _returnToPalette(tileId) {
        const tileEl = host.querySelector(`.csb-tile[data-id="${CSS.escape(tileId)}"]`);
        if (tileEl) {
            tileEl.classList.remove('csb-tile-placed');
            tileEl.style.display = '';
        }
        for (const [k, v] of placement.entries()) {
            if (v === tileId) {
                placement.delete(k);
                _redrawSnap(k);
            }
        }
        _refresh();
    }

    // Re-render the polygon overlay inside a snap-point based on its current
    // placed/empty state.
    function _redrawSnap(snapId) {
        const g = svg.querySelector(`.csb-snap[data-snap="${CSS.escape(snapId)}"]`);
        if (!g) return;
        const shape = g.dataset.shape;
        const style = _BLOCK_STYLE[shape] || _BLOCK_STYLE.square;
        const pts = _shapePoints(shape, unit);
        const tileId = placement.get(snapId);
        // Remove any prior polygons inside the group (including outline + fill).
        Array.from(g.querySelectorAll('polygon')).forEach(el => el.remove());
        if (tileId) {
            const fillPoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            fillPoly.setAttribute('class', 'csb-snap-fill');
            fillPoly.setAttribute('points', pts);
            fillPoly.setAttribute('fill', style.fill);
            fillPoly.setAttribute('stroke', style.stroke);
            fillPoly.setAttribute('stroke-width', '2');
            fillPoly.setAttribute('stroke-linejoin', 'round');
            g.appendChild(fillPoly);
            g.setAttribute('aria-label', `${style.label} slot, filled`);
        } else {
            const outlinePoly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            outlinePoly.setAttribute('class', 'csb-snap-outline');
            outlinePoly.setAttribute('points', pts);
            outlinePoly.setAttribute('fill', 'rgba(0,0,0,0.04)');
            outlinePoly.setAttribute('stroke', '#90a4ae');
            outlinePoly.setAttribute('stroke-width', '1.5');
            outlinePoly.setAttribute('stroke-dasharray', '6,4');
            outlinePoly.setAttribute('stroke-linejoin', 'round');
            g.appendChild(outlinePoly);
            g.setAttribute('aria-label', `${style.label} slot, empty`);
        }
    }

    // ---- Click-to-pick + click-to-place ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const tile = e.target.closest('.csb-tile');
        if (tile && host.contains(tile)) {
            if (tile.classList.contains('csb-tile-placed')) return;
            if (activeId === tile.dataset.id) {
                _clearActive(); _announce('Selection cleared.');
            } else {
                _setActive(tile);
            }
            return;
        }
        const snap = e.target.closest('.csb-snap');
        if (snap && activeId) {
            const t = host.querySelector(`.csb-tile[data-id="${CSS.escape(activeId)}"]`);
            if (t) _placeTileInSnap(t, snap);
            return;
        }
        // Click on a snap with no active tile = vacate it.
        if (snap && !activeId) {
            const tileId = placement.get(snap.dataset.snap);
            if (tileId) {
                _returnToPalette(tileId);
                _announce('Slot cleared.');
            }
        }
    });

    // Keyboard activation
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const tile = e.target.closest('.csb-tile');
        const snap = e.target.closest('.csb-snap');
        if (tile || snap) { e.preventDefault(); (tile || snap).click(); }
    });

    // ---- HTML5 drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) return;
        const tile = e.target.closest('.csb-tile');
        if (!tile || tile.classList.contains('csb-tile-placed')) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('csb-dragging');
    });
    host.addEventListener('dragend', (e) => {
        const tile = e.target.closest('.csb-tile');
        if (tile) tile.classList.remove('csb-dragging');
        host.querySelectorAll('.csb-snap.over').forEach(el => el.classList.remove('over'));
    });
    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const snap = e.target.closest('.csb-snap');
        if (snap) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            snap.classList.add('over');
        }
    });
    host.addEventListener('dragleave', (e) => {
        const snap = e.target.closest('.csb-snap');
        if (snap) snap.classList.remove('over');
    });
    host.addEventListener('drop', (e) => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tile = host.querySelector(`.csb-tile[data-id="${CSS.escape(id)}"]`);
        if (!tile) return;
        const snap = e.target.closest('.csb-snap');
        if (snap) { e.preventDefault(); snap.classList.remove('over'); _placeTileInSnap(tile, snap); }
    });

    // ---- TOUCH support (mobile/tablet) ----
    enableHostTouchDrag(host, {
        tileSelector: '.csb-tile',
        dropSelector: '.csb-snap',
        isLocked: () => locked,
        activeClass: 'csb-dragging',
        onDrop: (snap, tile) => {
            if (tile.classList.contains('csb-tile-placed')) return;
            _placeTileInSnap(tile, snap);
        },
    });

    // ---- Lock / unlock for retry ----
    function lockWidget() {
        locked = true;
        submit.disabled = true;
        host.querySelectorAll('.csb-tile').forEach(el => el.setAttribute('draggable', 'false'));
        host.querySelectorAll('.csb-snap').forEach(el => el.setAttribute('tabindex', '-1'));
    }
    function unlockForRetry() {
        host.querySelectorAll('.correct-flash, .wrong-flash')
            .forEach(el => el.classList.remove('correct-flash', 'wrong-flash'));
        locked = false;
        host.querySelectorAll('.csb-tile').forEach(el => el.setAttribute('draggable', 'true'));
        host.querySelectorAll('.csb-snap').forEach(el => el.setAttribute('tabindex', '0'));
        _refresh();
    }
    container._csbLock = lockWidget;
    container._csbUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        // Build a serializable placement map: { snapId: shape }
        const out = {};
        for (const sp of snapPoints) {
            const tileId = placement.get(sp.id);
            if (!tileId) continue;
            const tileEl = host.querySelector(`.csb-tile[data-id="${CSS.escape(tileId)}"]`);
            out[sp.id] = tileEl ? tileEl.dataset.shape : null;
        }
        try { onComposeShapeBlocksSubmit(q, out); }
        catch (err) { console.error('onComposeShapeBlocksSubmit failed:', err); }
    });

    _refresh();
}

// Returns true iff every snap-point in q.snapPoints is filled with a tile of
// the correct shape.
export function checkComposeShapeBlocks(q, placement) {
    if (!q || !placement || typeof placement !== 'object') return false;
    const snapPoints = Array.isArray(q.snapPoints) ? q.snapPoints : [];
    if (snapPoints.length === 0) return false;
    for (const sp of snapPoints) {
        if (placement[sp.id] !== sp.shape) return false;
    }
    // No extras
    for (const k of Object.keys(placement)) {
        if (!snapPoints.find(sp => sp.id === k)) return false;
    }
    return true;
}

export let onComposeShapeBlocksSubmit = function (_q, _placement) { /* noop */ };
export function setOnComposeShapeBlocksSubmit(fn) {
    if (typeof fn === 'function') onComposeShapeBlocksSubmit = fn;
}
