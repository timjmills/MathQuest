// nl-drag widget — drag draggable marker(s) onto a number line.
//
// Student sees a number line with labeled landmarks. A draggable marker (or
// palette of multiple markers) sits below the line. Student drags each marker
// onto the line; on drop the marker SNAPS to the nearest tick. Submit checks
// each marker against its target value (snap handles "close enough"). Mirrors
// the coord-plot integration pattern (in-widget Submit, _handleMultiPlaceSubmit
// via setOnNlDragSubmit).
//
// Question contract:
//   q.nlData = {
//     min:        number, line minimum (e.g. 0, -10)
//     max:        number, line maximum (e.g. 1, 10, 3)
//     tickStep:   number, distance between ticks (e.g. 1, 0.1, 0.25)
//     labelStep:  number?, distance between labeled major ticks (default = tickStep)
//     mode:       "fraction" | "decimal" | "integer" | "mixed"   (display formatting)
//     denom:      number?, display denominator for fraction/mixed (e.g. 4 for /4)
//     targets: [
//       { value: number, label: string }   // value must coincide with a tick
//     ]
//   }
//   q.ans is unused — targets carry the answer values.
//
// On submit (in-widget):
//   - Each marker compared to its target's value (within tickStep/2).
//   - Correct marker → green; misplaced → red; missing target → amber outline.
//   - onNlDragSubmit(q, results) fires with {placedAll, allCorrect, wrongCount}.
//
// Pure module — exports renderNlDrag, checkNlDrag, setOnNlDragSubmit.

const EPS = 1e-6;

function _largeTargets() {
    try {
        return !!(window.state && window.state.mapFeatures && window.state.mapFeatures.largeTargets);
    } catch (e) { return false; }
}

// Format a numeric value according to mode/denom. Used for marker labels and
// landmark labels on the number line. Always returns a short, screen-ready
// string (no SVG markup).
function _formatValue(value, mode, denom) {
    if (mode === 'integer') return String(Math.round(value));
    if (mode === 'decimal') {
        // Strip trailing zeros; keep at most 2 decimal places.
        const s = (Math.round(value * 100) / 100).toFixed(2);
        return s.replace(/\.?0+$/, '') || '0';
    }
    if (mode === 'fraction' && denom) {
        const num = Math.round(value * denom);
        if (num === 0) return '0';
        if (num === denom) return '1';
        return `${num}/${denom}`;
    }
    if (mode === 'mixed' && denom) {
        const sign = value < 0 ? '-' : '';
        const abs = Math.abs(value);
        const totalNum = Math.round(abs * denom);
        if (totalNum === 0) return '0';
        const whole = Math.floor(totalNum / denom);
        const rem = totalNum - whole * denom;
        if (rem === 0) return `${sign}${whole}`;
        if (whole === 0) return `${sign}${rem}/${denom}`;
        return `${sign}${whole} ${rem}/${denom}`;
    }
    // Fallback
    return String(value);
}

// Snap a numeric value to the nearest tick on [min, max] with step `tickStep`.
function _snapToTick(value, min, max, tickStep) {
    if (value <= min) return min;
    if (value >= max) return max;
    const k = Math.round((value - min) / tickStep);
    const snapped = min + k * tickStep;
    // Round to suppress fp dust (e.g. 0.30000000000004 → 0.3).
    return Math.round(snapped * 1e6) / 1e6;
}

// Two values "match" if they are within half a tickStep (snap means equal in
// practice, but allow tiny tolerance for fp-rounding edge cases).
function _valuesEqual(a, b, tickStep) {
    return Math.abs(a - b) < (tickStep / 2) + EPS;
}

// Build the static SVG (axis line, ticks, labels). Marker layer is appended
// live and updated on each drop.
function _buildLineSVG(min, max, tickStep, labelStep, mode, denom, geom) {
    const { W, H, lineY, leftX, rightX } = geom;
    const span = max - min;
    const usable = rightX - leftX;
    const xFor = (v) => leftX + ((v - min) / span) * usable;

    // Axis line + arrows
    let svg = '';
    svg += `<line x1="${leftX - 8}" y1="${lineY}" x2="${rightX + 8}" y2="${lineY}" stroke="#333" stroke-width="2.5" />`;
    svg += `<polygon points="${leftX - 14},${lineY} ${leftX - 4},${lineY - 5} ${leftX - 4},${lineY + 5}" fill="#333" />`;
    svg += `<polygon points="${rightX + 14},${lineY} ${rightX + 4},${lineY - 5} ${rightX + 4},${lineY + 5}" fill="#333" />`;

    // Ticks + labels. Iterate in integer steps to avoid fp drift.
    const totalTicks = Math.round(span / tickStep);
    for (let i = 0; i <= totalTicks; i++) {
        const v = min + i * tickStep;
        const x = xFor(v);
        // A tick is a "label tick" if its value falls on labelStep
        // (modulo the tick grid). Compare integer multiples to avoid fp.
        const labelMultiplier = Math.round(labelStep / tickStep);
        const isLabelTick = labelMultiplier > 0 && (i % labelMultiplier === 0);
        const tickH = isLabelTick ? 12 : 6;
        const sw = isLabelTick ? 2 : 1.2;
        svg += `<line x1="${x}" y1="${lineY - tickH}" x2="${x}" y2="${lineY + tickH}" stroke="#333" stroke-width="${sw}" />`;
        if (isLabelTick) {
            const txt = _formatValue(v, mode, denom);
            svg += `<text x="${x}" y="${lineY + 30}" text-anchor="middle" fill="#333" font-size="13" font-weight="600">${txt}</text>`;
        }
    }
    return svg;
}

export function renderNlDrag(q, container) {
    if (!container || !q || !q.nlData) return;
    const data = q.nlData;
    const min = Number(data.min);
    const max = Number(data.max);
    const tickStep = Number(data.tickStep);
    const labelStep = Number(data.labelStep || tickStep);
    const mode = data.mode || 'integer';
    const denom = data.denom || null;
    const targets = Array.isArray(data.targets) ? data.targets.slice() : [];
    if (!targets.length || !(max > min) || !(tickStep > 0)) return;

    const large = _largeTargets();

    // SVG geometry — line is wider when range has many ticks.
    const totalTicks = Math.round((max - min) / tickStep);
    const W = Math.max(420, Math.min(640, 60 + totalTicks * 26));
    const H = 150;
    const lineY = 60;
    const leftX = 40;
    const rightX = W - 40;
    const geom = { W, H, lineY, leftX, rightX };

    const lineSVG = _buildLineSVG(min, max, tickStep, labelStep, mode, denom, geom);

    // Build palette (one chip per target). Each chip has its target value and
    // label baked in via dataset; placement state is kept in `placed` map.
    const paletteHTML = targets.map((t, i) => {
        const lbl = t.label || _formatValue(t.value, mode, denom);
        return `<div class="nld-chip"
                     data-idx="${i}"
                     data-target="${t.value}"
                     draggable="true"
                     role="button"
                     tabindex="0"
                     style="touch-action:none;">
                    <span class="nld-chip-label">${lbl}</span>
                </div>`;
    }).join('');

    container.innerHTML = `
        <div class="nld-host">
            <div class="nld-line-wrap">
                <svg class="nld-svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
                     style="display:block;margin:0 auto;max-width:100%;background:#fff;border-radius:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                    <g class="nld-axis">${lineSVG}</g>
                    <g class="nld-markers"></g>
                    <g class="nld-drag-ghost"></g>
                </svg>
            </div>
            <div class="nld-palette-wrap">
                <div class="nld-palette-title">${targets.length > 1 ? 'Drag each label onto the number line:' : 'Drag the label onto the number line:'}</div>
                <div class="nld-palette">${paletteHTML}</div>
            </div>
            <div class="nld-actions">
                <div class="nld-counter" aria-live="polite">0 of ${targets.length} placed</div>
                <button type="button" class="nld-clear">Clear</button>
                <button type="button" class="nld-submit primary-btn">Submit</button>
            </div>
            <div class="nld-hint">Snaps to the nearest tick. Drag a placed marker back to the palette to remove it.</div>
        </div>
    `;

    // Inject minimal CSS once per page. Keeps widget self-contained.
    if (!document.getElementById('nld-style')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'nld-style';
        styleEl.textContent = `
        .nld-host { display:flex; flex-direction:column; gap:10px; align-items:stretch; }
        .nld-line-wrap { width:100%; }
        .nld-palette-wrap { display:flex; flex-direction:column; gap:6px; align-items:center; }
        .nld-palette-title { font-size:0.92rem; color:#555; font-weight:600; }
        .nld-palette { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; min-height:48px;
            padding:8px 10px; background:#f5f5f5; border:2px dashed #bbb; border-radius:10px; }
        .nld-chip { display:inline-flex; align-items:center; justify-content:center;
            min-width:48px; padding:6px 12px; background:#1e88e5; color:#fff; border-radius:8px;
            font-weight:700; font-size:1rem; cursor:grab; user-select:none;
            box-shadow:0 2px 4px rgba(0,0,0,0.15); transition:transform 0.1s, background 0.15s; }
        .nld-chip:hover { transform:translateY(-1px); }
        .nld-chip.nld-chip-placed { opacity:0.45; cursor:default; background:#90a4ae; }
        .nld-chip.nld-chip-dragging { opacity:0.55; background:#fdd835; color:#333; cursor:grabbing; }
        .nld-actions { display:flex; gap:10px; align-items:center; justify-content:center; flex-wrap:wrap; }
        .nld-counter { font-size:0.92rem; color:#555; font-weight:600; }
        .nld-clear { padding:6px 14px; border:2px solid #999; background:#fff; border-radius:8px; cursor:pointer; font-weight:600; }
        .nld-submit { padding:8px 18px; }
        .nld-hint { font-size:0.82rem; color:#777; text-align:center; }
        .nld-marker { cursor:grab; }
        .nld-marker.nld-marker-locked { cursor:default; }
        `;
        document.head.appendChild(styleEl);
    }

    const svg = container.querySelector('.nld-svg');
    const markersLayer = container.querySelector('.nld-markers');
    const palette = container.querySelector('.nld-palette');
    const counter = container.querySelector('.nld-counter');
    const submitBtn = container.querySelector('.nld-submit');
    const clearBtn = container.querySelector('.nld-clear');

    // placed[idx] = snapped value (number) OR null if still in palette.
    const placed = targets.map(() => null);
    let locked = false;

    const span = max - min;
    const usable = rightX - leftX;
    const xFor = (v) => leftX + ((v - min) / span) * usable;
    const valFromClientX = (clientX) => {
        // Convert page X to SVG-local X using the SVG bounding rect.
        const rect = svg.getBoundingClientRect();
        // Account for SVG viewBox scaling.
        const scaleX = W / rect.width;
        const localX = (clientX - rect.left) * scaleX;
        const t = (localX - leftX) / usable;
        const raw = min + t * span;
        return _snapToTick(raw, min, max, tickStep);
    };

    function _markerColor(idx) {
        if (!locked) return '#1e88e5';
        const correct = _valuesEqual(placed[idx], targets[idx].value, tickStep);
        return correct ? '#43a047' : '#e53935';
    }

    function repaint() {
        // Re-render markers from `placed`.
        let html = '';
        const r = large ? 13 : 11;
        placed.forEach((v, idx) => {
            if (v === null) return;
            const cx = xFor(v);
            const cy = lineY;
            const fill = _markerColor(idx);
            const stroke = locked ? (_valuesEqual(v, targets[idx].value, tickStep) ? '#1b5e20' : '#b71c1c') : '#0d47a1';
            const lbl = targets[idx].label || _formatValue(targets[idx].value, mode, denom);
            html += `<g class="nld-marker${locked ? ' nld-marker-locked' : ''}" data-idx="${idx}">
                <line x1="${cx}" y1="${cy - 22}" x2="${cx}" y2="${cy + 22}" stroke="${stroke}" stroke-width="2" />
                <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" />
                <text x="${cx}" y="${cy - 28}" text-anchor="middle" fill="${stroke}" font-size="13" font-weight="700">${lbl}</text>
            </g>`;
        });
        // After submit, draw amber rings at unplaced expected targets.
        if (locked) {
            targets.forEach((t, idx) => {
                const v = placed[idx];
                if (v === null) {
                    const cx = xFor(t.value);
                    html += `<circle class="nld-missing" cx="${cx}" cy="${lineY}" r="${(large ? 13 : 11) + 3}"
                        fill="none" stroke="#ff9800" stroke-width="3" stroke-dasharray="4,3" />`;
                }
            });
        }
        markersLayer.innerHTML = html;

        // Counter + palette state.
        const placedCount = placed.filter(v => v !== null).length;
        counter.textContent = `${placedCount} of ${targets.length} placed`;
        palette.querySelectorAll('.nld-chip').forEach(chip => {
            const idx = Number(chip.dataset.idx);
            const isPlaced = placed[idx] !== null;
            chip.classList.toggle('nld-chip-placed', isPlaced);
            chip.setAttribute('draggable', (!locked && !isPlaced) ? 'true' : 'false');
        });

        // Wire marker pointer-down for re-drag-back-to-palette (pre-submit only).
        if (!locked) {
            markersLayer.querySelectorAll('.nld-marker').forEach(g => {
                g.addEventListener('pointerdown', _onMarkerPointerDown, { passive: true });
            });
        }
    }

    // ---- Drag state (shared between HTML5-drag and pointer fallback) ----
    let dragIdx = null;     // which target idx is being dragged
    let pointerDragging = false;

    function _placeAt(idx, value) {
        if (locked) return;
        const snapped = _snapToTick(value, min, max, tickStep);
        // If another marker already at this tick, push it back to palette
        // (single occupancy per tick). Skip if the same idx is re-placing
        // itself (no-op).
        placed.forEach((v, i) => {
            if (i !== idx && v !== null && _valuesEqual(v, snapped, tickStep)) {
                placed[i] = null;
            }
        });
        placed[idx] = snapped;
        repaint();
    }

    function _removeFromLine(idx) {
        if (locked) return;
        placed[idx] = null;
        repaint();
    }

    // ---- HTML5 drag-and-drop on chips (desktop) ----
    palette.addEventListener('dragstart', (e) => {
        if (locked) { e.preventDefault(); return; }
        const chip = e.target.closest('.nld-chip');
        if (!chip) return;
        const idx = Number(chip.dataset.idx);
        if (placed[idx] !== null) { e.preventDefault(); return; }
        dragIdx = idx;
        chip.classList.add('nld-chip-dragging');
        try { e.dataTransfer.setData('text/plain', String(idx)); } catch (_e) { /* ignore */ }
        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
    });
    palette.addEventListener('dragend', (e) => {
        const chip = e.target.closest('.nld-chip');
        if (chip) chip.classList.remove('nld-chip-dragging');
        dragIdx = null;
    });

    // SVG drop target.
    svg.addEventListener('dragover', (e) => {
        if (locked) return;
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    });
    svg.addEventListener('drop', (e) => {
        if (locked) return;
        e.preventDefault();
        let idx = dragIdx;
        if (idx === null) {
            try {
                const raw = e.dataTransfer && e.dataTransfer.getData('text/plain');
                if (raw !== '') idx = Number(raw);
            } catch (_e) { /* ignore */ }
        }
        if (idx === null || Number.isNaN(idx)) return;
        const v = valFromClientX(e.clientX);
        _placeAt(idx, v);
    });

    // Drop back onto palette = remove from line.
    palette.addEventListener('dragover', (e) => {
        if (!locked && dragIdx !== null) e.preventDefault();
    });
    palette.addEventListener('drop', (e) => {
        if (locked) return;
        e.preventDefault();
        if (dragIdx !== null && placed[dragIdx] !== null) _removeFromLine(dragIdx);
    });

    // ---- Pointer-events fallback (touch / no-DnD environments) ----
    function _onChipPointerDown(e) {
        if (locked) return;
        const chip = e.target.closest('.nld-chip');
        if (!chip) return;
        const idx = Number(chip.dataset.idx);
        if (placed[idx] !== null) return;
        dragIdx = idx;
        pointerDragging = true;
        chip.classList.add('nld-chip-dragging');
        chip.setPointerCapture && chip.setPointerCapture(e.pointerId);
    }
    function _onChipPointerMove(e) {
        if (!pointerDragging || dragIdx === null) return;
        // Live preview: track the pointer along the line as a ghost circle.
        const ghostLayer = container.querySelector('.nld-drag-ghost');
        if (!ghostLayer) return;
        const v = valFromClientX(e.clientX);
        const cx = xFor(v);
        ghostLayer.innerHTML = `<circle cx="${cx}" cy="${lineY}" r="${large ? 13 : 11}"
            fill="#fdd835" stroke="#333" stroke-width="2" opacity="0.85" />`;
    }
    function _onChipPointerUp(e) {
        if (!pointerDragging || dragIdx === null) {
            pointerDragging = false; dragIdx = null;
            return;
        }
        const ghostLayer = container.querySelector('.nld-drag-ghost');
        if (ghostLayer) ghostLayer.innerHTML = '';
        const chip = palette.querySelector(`.nld-chip[data-idx="${dragIdx}"]`);
        if (chip) chip.classList.remove('nld-chip-dragging');
        // Decide drop target: if pointer is over the SVG line area, place; else
        // if over the palette, leave in palette (no-op).
        const svgRect = svg.getBoundingClientRect();
        const overSvg = e.clientX >= svgRect.left && e.clientX <= svgRect.right
                     && e.clientY >= svgRect.top  && e.clientY <= svgRect.bottom;
        if (overSvg) {
            const v = valFromClientX(e.clientX);
            _placeAt(dragIdx, v);
        }
        pointerDragging = false;
        dragIdx = null;
    }
    palette.addEventListener('pointerdown', _onChipPointerDown);
    document.addEventListener('pointermove', _onChipPointerMove);
    document.addEventListener('pointerup', _onChipPointerUp);

    // Drag a placed marker back to the palette to remove it.
    function _onMarkerPointerDown(e) {
        if (locked) return;
        const g = e.target.closest('.nld-marker');
        if (!g) return;
        const idx = Number(g.dataset.idx);
        if (placed[idx] === null) return;
        // Simple "tap on marker = remove" gesture (also serves keyboard/click).
        // For richer drag-along-line UX, the chip-pointer pipeline handles
        // re-positioning by re-dragging from palette.
        _removeFromLine(idx);
    }

    // Keyboard accessibility: Enter/Space on a chip places it at its target
    // value. Shortcut so keyboard-only users have a path forward.
    palette.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const chip = e.target.closest('.nld-chip');
        if (!chip) return;
        const idx = Number(chip.dataset.idx);
        if (placed[idx] !== null) return;
        e.preventDefault();
        _placeAt(idx, targets[idx].value);
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        for (let i = 0; i < placed.length; i++) placed[i] = null;
        repaint();
    });

    function submit() {
        if (locked) return;
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        repaint();
        try {
            const results = placed.map((v, i) => ({
                value: v,
                target: targets[i].value,
                correct: v !== null && _valuesEqual(v, targets[i].value, tickStep),
            }));
            onNlDragSubmit(q, results);
        } catch (err) {
            console.error('onNlDragSubmit failed:', err);
        }
    }

    submitBtn.addEventListener('click', submit);

    // Integration hooks — mirror coord-plot pattern.
    container._nldForceSubmit = () => { if (!locked) submit(); };
    container._nldIsLocked = () => locked;
    container._nldHasAnyPlaced = () => placed.some(v => v !== null);
    container._nldLock = () => {
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        repaint();
    };
    // Unlock for retry: keep correct placements, clear wrong ones.
    container._nldUnlockForRetry = () => {
        for (let i = 0; i < placed.length; i++) {
            if (placed[i] !== null && !_valuesEqual(placed[i], targets[i].value, tickStep)) {
                placed[i] = null;
            }
        }
        locked = false;
        submitBtn.disabled = false;
        clearBtn.disabled = false;
        repaint();
    };

    repaint();
}

// True iff every target has a placement that matches within tolerance.
export function checkNlDrag(q, results) {
    if (!q || !q.nlData || !Array.isArray(results)) return false;
    const targets = q.nlData.targets || [];
    if (results.length !== targets.length) return false;
    return results.every(r => r && r.correct === true);
}

export let onNlDragSubmit = function (_q, _results) { /* noop */ };
export function setOnNlDragSubmit(fn) {
    if (typeof fn === 'function') onNlDragSubmit = fn;
}
