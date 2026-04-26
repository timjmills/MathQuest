// base10-build widget — drag-to-build base-10 blocks workmat for 1-2.
//
// Student is shown a target number. The palette has draggable rod (10) and
// unit (1) blocks (and flat (100) blocks for 3-digit targets). They drag
// blocks into a workmat. Submit auto-enables once at least one block is
// placed; correctness is total value == target.
//
// Regrouping support: a "Decompose 1 ten" button converts one rod into ten
// units (a "Compose 10 ones" button converts ten units into a rod when
// available). Same for hundreds <-> tens when flats are in play.
//
// Question contract:
//   q.target:        number to build (1..999)
//   q.maxPlace:      1 (units only), 10 (units+rods), or 100 (units+rods+flats)
//   q.text:          prompt
//   q.hint:          optional hint
//   q.allowRegroup:  if true, show decompose/compose buttons (default false)
//
// Pure module — mirrors pv-disks-build / ten-frame-build integration pattern:
// exposes settable `onBase10BuildSubmit` + `_b10Lock` / `_b10UnlockForRetry`.

const PLACE_LABEL = { 1: 'Ones', 10: 'Tens', 100: 'Hundreds' };
const PLACE_COLOR = { 1: '#2e7d32', 10: '#1565c0', 100: '#ef6c00' };

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

function _placesFor(target, maxPlace) {
    const t = Math.max(0, Math.floor(target || 0));
    const cap = maxPlace || (t >= 100 ? 100 : t >= 10 ? 10 : 1);
    if (cap >= 100) return [100, 10, 1];
    if (cap >= 10) return [10, 1];
    return [1];
}

// SVG block factories — tiny visual representations of unit/rod/flat blocks.
function _blockSvg(place, size) {
    const color = PLACE_COLOR[place];
    if (place === 1) {
        const s = size;
        return `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
            <rect x="2" y="2" width="${s - 4}" height="${s - 4}" fill="${color}"
                stroke="#fff" stroke-width="2" rx="2"/>
        </svg>`;
    }
    if (place === 10) {
        // Rod = 10 stacked unit segments.
        const w = size, h = size * 2.6;
        const cellH = (h - 4) / 10;
        let cells = '';
        for (let i = 0; i < 10; i++) {
            cells += `<rect x="2" y="${2 + i * cellH}" width="${w - 4}" height="${cellH}"
                fill="${color}" stroke="#fff" stroke-width="1"/>`;
        }
        return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
            <rect x="0" y="0" width="${w}" height="${h}" fill="none" stroke="${color}" stroke-width="2"/>
            ${cells}
        </svg>`;
    }
    // Flat = 10×10 grid.
    const s = size * 2.6;
    const cs = (s - 4) / 10;
    let grid = '';
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            grid += `<rect x="${2 + c * cs}" y="${2 + r * cs}" width="${cs}" height="${cs}"
                fill="${color}" stroke="#fff" stroke-width="0.5"/>`;
        }
    }
    return `<svg viewBox="0 0 ${s} ${s}" width="${s}" height="${s}">
        <rect x="0" y="0" width="${s}" height="${s}" fill="none" stroke="${color}" stroke-width="2"/>
        ${grid}
    </svg>`;
}

// Module-shared "currently picked up" state (click-and-click fallback).
let _activeKind = null;     // 'spawn' | 'move' | null
let _activePlace = null;
let _activeEl = null;
let _activeHost = null;

export function renderBase10Build(q, container) {
    if (!container || !q) return;
    const target = Math.max(0, Math.floor(q.target || q.ans || 0));
    const maxPlace = q.maxPlace || (target >= 100 ? 100 : target >= 10 ? 10 : 1);
    const places = _placesFor(target, maxPlace);
    const allowRegroup = !!q.allowRegroup;
    const large = _largeTargets();
    const unitSize = large ? 22 : 18;

    const promptText = q.text || `Build the number ${target.toLocaleString()}.`;

    function paletteHtml(place) {
        return `<div class="b10-palette-stack" data-place="${place}"
            style="display:flex;flex-direction:column;align-items:center;gap:4px;
                   padding:6px 8px;border-radius:8px;background:rgba(255,255,255,0.04);
                   min-width:70px;">
            <div style="font-size:0.75rem;font-weight:700;color:${PLACE_COLOR[place]};
                 text-transform:uppercase;letter-spacing:0.4px;white-space:nowrap;">
                ${PLACE_LABEL[place]} (${place})
            </div>
            <button type="button" class="b10-palette-block" data-place="${place}"
                draggable="true"
                aria-label="${PLACE_LABEL[place]} block, value ${place}, draggable"
                style="background:transparent;border:2px solid transparent;padding:4px;
                       border-radius:6px;cursor:grab;display:inline-flex;
                       align-items:center;justify-content:center;">
                ${_blockSvg(place, unitSize)}
            </button>
            <div style="font-size:0.65rem;color:var(--text-dim);">drag</div>
        </div>`;
    }

    const paletteBlocks = places.map(paletteHtml).join('');

    // Workmat is one big drop zone (children grouped by place visually).
    const matHtml = `<div class="b10-mat" data-role="mat"
        style="border:3px dashed #888;border-radius:14px;min-height:170px;
               padding:14px;background:rgba(255,255,255,0.04);
               display:flex;flex-direction:row;flex-wrap:wrap;gap:18px;
               align-items:flex-start;justify-content:center;">
        ${places.map(p => `<div class="b10-zone" data-place="${p}"
            style="display:flex;flex-direction:column;align-items:center;
                   min-width:80px;gap:4px;">
            <div class="b10-zone-label" style="font-size:0.75rem;font-weight:800;
                 color:${PLACE_COLOR[p]};text-transform:uppercase;letter-spacing:0.4px;">
                ${PLACE_LABEL[p]}
            </div>
            <div class="b10-zone-stack" data-place="${p}"
                 style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;
                        align-items:flex-start;min-height:60px;min-width:70px;
                        padding:4px;"></div>
        </div>`).join('')}
    </div>`;

    // Regroup buttons. Only shown if allowRegroup AND multiple places exist.
    let regroupHtml = '';
    if (allowRegroup && places.length >= 2) {
        const buttons = [];
        if (places.includes(10) && places.includes(1)) {
            buttons.push(`<button type="button" class="b10-decomp-ten secondary-btn"
                style="font-size:0.85rem;">Decompose 1 ten → 10 ones</button>`);
            buttons.push(`<button type="button" class="b10-comp-ten secondary-btn"
                style="font-size:0.85rem;">Compose 10 ones → 1 ten</button>`);
        }
        if (places.includes(100) && places.includes(10)) {
            buttons.push(`<button type="button" class="b10-decomp-hundred secondary-btn"
                style="font-size:0.85rem;">Decompose 1 hundred → 10 tens</button>`);
            buttons.push(`<button type="button" class="b10-comp-hundred secondary-btn"
                style="font-size:0.85rem;">Compose 10 tens → 1 hundred</button>`);
        }
        regroupHtml = `<div class="b10-regroup" style="display:flex;justify-content:center;
            gap:8px;flex-wrap:wrap;margin-top:10px;">${buttons.join('')}</div>`;
    }

    container.innerHTML = `
        <div class="b10-host${large ? ' b10-large' : ''}" role="application"
             aria-label="Base-10 blocks build mat">
            <div class="b10-prompt" style="font-weight:800;font-size:1.15rem;text-align:center;
                 margin-bottom:10px;color:var(--text-bright);">${_esc(promptText)}</div>
            <div class="b10-target" style="text-align:center;font-weight:900;font-size:2.4rem;
                 color:var(--accent-purple);margin-bottom:14px;letter-spacing:2px;">
                ${target.toLocaleString()}
            </div>
            ${matHtml}
            <div class="b10-palette" data-role="palette"
                 style="display:flex;justify-content:center;gap:14px;margin-top:14px;
                        padding:10px;background:rgba(0,0,0,0.06);border-radius:10px;
                        flex-wrap:wrap;">
                ${paletteBlocks}
            </div>
            ${regroupHtml}
            <div class="b10-counter" aria-live="polite"
                 style="text-align:center;margin-top:10px;font-weight:600;color:var(--text-dim);">
                Total: 0
            </div>
            <div class="b10-toolbar" style="display:flex;justify-content:center;gap:10px;margin-top:10px;">
                <button type="button" class="b10-clear secondary-btn">Clear</button>
                <button type="button" class="b10-submit primary-btn" disabled>Submit</button>
            </div>
            <div class="b10-live" aria-live="polite"
                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
        </div>
    `;

    const host = container.querySelector('.b10-host');
    const mat = host.querySelector('[data-role="mat"]');
    const palette = host.querySelector('[data-role="palette"]');
    const submit = host.querySelector('.b10-submit');
    const clearBtn = host.querySelector('.b10-clear');
    const counter = host.querySelector('.b10-counter');
    const live = host.querySelector('.b10-live');
    let locked = false;
    const blockCounters = Object.fromEntries(places.map(p => [p, 0]));

    function announce(msg) { if (live) live.textContent = msg; }

    function getCounts() {
        const out = {};
        places.forEach(p => {
            const stack = host.querySelector(`.b10-zone-stack[data-place="${p}"]`);
            out[p] = stack ? stack.querySelectorAll('.b10-block').length : 0;
        });
        return out;
    }

    function getTotal() {
        const c = getCounts();
        return places.reduce((sum, p) => sum + (c[p] | 0) * p, 0);
    }

    function refreshUI() {
        const total = getTotal();
        counter.textContent = `Total: ${total.toLocaleString()}`;
        submit.disabled = total === 0;
        // Update regroup buttons enabled state.
        const counts = getCounts();
        const decTen = host.querySelector('.b10-decomp-ten');
        const compTen = host.querySelector('.b10-comp-ten');
        const decHun = host.querySelector('.b10-decomp-hundred');
        const compHun = host.querySelector('.b10-comp-hundred');
        if (decTen) decTen.disabled = (counts[10] | 0) < 1;
        if (compTen) compTen.disabled = (counts[1] | 0) < 10;
        if (decHun) decHun.disabled = (counts[100] | 0) < 1;
        if (compHun) compHun.disabled = (counts[10] | 0) < 10;
    }

    function _newBlockEl(place) {
        blockCounters[place] = (blockCounters[place] || 0) + 1;
        const sz = unitSize;
        const wrapper = document.createElement('span');
        wrapper.className = 'b10-block';
        wrapper.dataset.place = String(place);
        wrapper.dataset.blockIdx = String(blockCounters[place]);
        wrapper.setAttribute('draggable', 'true');
        wrapper.setAttribute('aria-label', `${PLACE_LABEL[place]} block, value ${place}`);
        wrapper.style.cssText = 'display:inline-flex;cursor:grab;padding:0;margin:0;';
        wrapper.innerHTML = _blockSvg(place, sz);
        return wrapper;
    }

    function spawnBlockInZone(place, zoneEl) {
        const stack = zoneEl.querySelector('.b10-zone-stack');
        if (!stack) return;
        stack.appendChild(_newBlockEl(place));
        zoneEl.classList.add('b10-zone-flash');
        setTimeout(() => zoneEl.classList.remove('b10-zone-flash'), 220);
        announce(`${PLACE_LABEL[place]} block placed.`);
        refreshUI();
    }

    function removeBlock(blockEl) {
        const place = parseInt(blockEl.dataset.place, 10);
        blockEl.parentNode && blockEl.parentNode.removeChild(blockEl);
        announce(`${PLACE_LABEL[place]} block removed.`);
        refreshUI();
    }

    function clearActive() {
        if (_activeHost === host) {
            if (_activeEl) _activeEl.classList.remove('b10-block-active');
            host.querySelectorAll('.b10-palette-block.b10-block-active')
                .forEach(el => el.classList.remove('b10-block-active'));
            _activeKind = null;
            _activePlace = null;
            _activeEl = null;
            _activeHost = null;
        }
    }

    function setActiveSpawn(paletteEl) {
        clearActive();
        const place = parseInt(paletteEl.dataset.place, 10);
        paletteEl.classList.add('b10-block-active');
        _activeKind = 'spawn';
        _activePlace = place;
        _activeEl = null;
        _activeHost = host;
        announce(`Picked up ${PLACE_LABEL[place]} block. Click the mat to place it.`);
    }

    function setActiveMove(blockEl) {
        clearActive();
        const place = parseInt(blockEl.dataset.place, 10);
        blockEl.classList.add('b10-block-active');
        _activeKind = 'move';
        _activePlace = place;
        _activeEl = blockEl;
        _activeHost = host;
        announce(`Picked up placed ${PLACE_LABEL[place]} block. Click palette to remove.`);
    }

    // ---- Click handling ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const paletteBlock = e.target.closest('.b10-palette-block');
        const placedBlock = e.target.closest('.b10-zone-stack .b10-block');
        const zone = e.target.closest('.b10-zone');
        const matEl = e.target.closest('.b10-mat');
        const paletteBg = e.target.closest('.b10-palette');

        if (paletteBlock) {
            const place = parseInt(paletteBlock.dataset.place, 10);
            if (_activeHost === host && _activeKind === 'spawn' && _activePlace === place) {
                clearActive();
                announce('Selection cleared.');
            } else {
                setActiveSpawn(paletteBlock);
            }
            return;
        }

        if (placedBlock) {
            if (_activeHost === host && _activeEl === placedBlock) {
                clearActive();
                announce('Selection cleared.');
            } else {
                setActiveMove(placedBlock);
            }
            return;
        }

        // Place into a specific zone (preferred) or anywhere on the mat.
        if (zone) {
            if (_activeHost !== host) return;
            if (_activeKind === 'spawn' && _activePlace != null) {
                const zonePlace = parseInt(zone.dataset.place, 10);
                if (zonePlace !== _activePlace) {
                    zone.classList.add('b10-zone-reject');
                    setTimeout(() => zone.classList.remove('b10-zone-reject'), 320);
                    announce(`That block belongs in the ${PLACE_LABEL[_activePlace]} area.`);
                    return;
                }
                spawnBlockInZone(_activePlace, zone);
                clearActive();
            }
            return;
        }

        // Click mat (between zones) → place into matching place's zone.
        if (matEl && _activeHost === host && _activeKind === 'spawn' && _activePlace != null) {
            const tgtZone = host.querySelector(`.b10-zone[data-place="${_activePlace}"]`);
            if (tgtZone) {
                spawnBlockInZone(_activePlace, tgtZone);
                clearActive();
            }
            return;
        }

        // Click palette while moving a placed block → remove it.
        if (paletteBg && _activeHost === host && _activeKind === 'move' && _activeEl) {
            removeBlock(_activeEl);
            clearActive();
            return;
        }
    });

    // Keyboard a11y.
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const t = e.target.closest('.b10-palette-block, .b10-block, .b10-zone');
        if (!t) return;
        e.preventDefault();
        t.click();
    });

    // ---- Native drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) { e.preventDefault(); return; }
        const paletteBlock = e.target.closest('.b10-palette-block');
        const placedBlock = e.target.closest('.b10-zone-stack .b10-block');
        if (paletteBlock) {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', `spawn:${paletteBlock.dataset.place}`);
            paletteBlock.classList.add('b10-dragging');
            return;
        }
        if (placedBlock) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain',
                `move:${placedBlock.dataset.place}:${placedBlock.dataset.blockIdx}`);
            placedBlock.classList.add('b10-dragging');
            return;
        }
        e.preventDefault();
    });

    host.addEventListener('dragend', () => {
        host.querySelectorAll('.b10-dragging').forEach(el => el.classList.remove('b10-dragging'));
        host.querySelectorAll('.b10-zone-over, .b10-mat-over, .b10-palette-over')
            .forEach(el => el.classList.remove('b10-zone-over', 'b10-mat-over', 'b10-palette-over'));
    });

    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const zone = e.target.closest('.b10-zone');
        const matEl = e.target.closest('.b10-mat');
        const paletteBg = e.target.closest('.b10-palette');
        if (zone) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            zone.classList.add('b10-zone-over');
        } else if (matEl) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            matEl.classList.add('b10-mat-over');
        } else if (paletteBg) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            paletteBg.classList.add('b10-palette-over');
        }
    });

    host.addEventListener('dragleave', (e) => {
        const t = e.target.closest('.b10-zone, .b10-mat, .b10-palette');
        if (t) t.classList.remove('b10-zone-over', 'b10-mat-over', 'b10-palette-over');
    });

    host.addEventListener('drop', (e) => {
        if (locked) return;
        const data = e.dataTransfer.getData('text/plain') || '';
        if (!data) return;
        const zone = e.target.closest('.b10-zone');
        const matEl = e.target.closest('.b10-mat');
        const paletteBg = e.target.closest('.b10-palette');

        if (data.startsWith('spawn:')) {
            const place = parseInt(data.split(':')[1], 10);
            // Always route to the matching zone (so blocks stay grouped).
            const tgtZone = (zone && parseInt(zone.dataset.place, 10) === place)
                ? zone
                : host.querySelector(`.b10-zone[data-place="${place}"]`);
            if (tgtZone && (zone || matEl)) {
                e.preventDefault();
                if (zone) zone.classList.remove('b10-zone-over');
                if (matEl) matEl.classList.remove('b10-mat-over');
                spawnBlockInZone(place, tgtZone);
            }
        } else if (data.startsWith('move:')) {
            const [, placeStr, idxStr] = data.split(':');
            const place = parseInt(placeStr, 10);
            const blockEl = host.querySelector(
                `.b10-zone-stack .b10-block[data-place="${place}"][data-block-idx="${idxStr}"]`
            );
            if (!blockEl) return;
            if (paletteBg) {
                e.preventDefault();
                paletteBg.classList.remove('b10-palette-over');
                removeBlock(blockEl);
            }
        }
    });

    // ---- Regroup buttons ----
    function decompose(fromPlace, toPlace) {
        if (locked) return;
        const stack = host.querySelector(`.b10-zone-stack[data-place="${fromPlace}"]`);
        if (!stack) return;
        const blocks = stack.querySelectorAll('.b10-block');
        if (blocks.length < 1) return;
        // Remove one, add 10 of the smaller.
        const blk = blocks[blocks.length - 1];
        blk.parentNode.removeChild(blk);
        const tgtStack = host.querySelector(`.b10-zone-stack[data-place="${toPlace}"]`);
        if (tgtStack) {
            for (let i = 0; i < 10; i++) tgtStack.appendChild(_newBlockEl(toPlace));
        }
        announce(`1 ${PLACE_LABEL[fromPlace]} decomposed into 10 ${PLACE_LABEL[toPlace]}.`);
        refreshUI();
    }

    function compose(fromPlace, toPlace) {
        if (locked) return;
        const stack = host.querySelector(`.b10-zone-stack[data-place="${fromPlace}"]`);
        if (!stack) return;
        const blocks = stack.querySelectorAll('.b10-block');
        if (blocks.length < 10) return;
        for (let i = 0; i < 10; i++) {
            const b = blocks[blocks.length - 1 - i];
            b.parentNode.removeChild(b);
        }
        const tgtStack = host.querySelector(`.b10-zone-stack[data-place="${toPlace}"]`);
        if (tgtStack) tgtStack.appendChild(_newBlockEl(toPlace));
        announce(`10 ${PLACE_LABEL[fromPlace]} composed into 1 ${PLACE_LABEL[toPlace]}.`);
        refreshUI();
    }

    const decTen = host.querySelector('.b10-decomp-ten');
    const compTen = host.querySelector('.b10-comp-ten');
    const decHun = host.querySelector('.b10-decomp-hundred');
    const compHun = host.querySelector('.b10-comp-hundred');
    if (decTen) decTen.addEventListener('click', () => decompose(10, 1));
    if (compTen) compTen.addEventListener('click', () => compose(1, 10));
    if (decHun) decHun.addEventListener('click', () => decompose(100, 10));
    if (compHun) compHun.addEventListener('click', () => compose(10, 100));

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        places.forEach(p => {
            const stack = host.querySelector(`.b10-zone-stack[data-place="${p}"]`);
            if (stack) stack.innerHTML = '';
        });
        clearActive();
        announce('Mat cleared.');
        refreshUI();
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        clearBtn.disabled = true;
        host.querySelectorAll('.b10-block, .b10-palette-block, .b10-zone, .b10-mat')
            .forEach(el => el.setAttribute('draggable', 'false'));
        host.querySelectorAll('.b10-decomp-ten, .b10-comp-ten, .b10-decomp-hundred, .b10-comp-hundred')
            .forEach(el => { el.disabled = true; });
    }
    function unlockForRetry() {
        locked = false;
        clearBtn.disabled = false;
        host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        host.querySelectorAll('.b10-block, .b10-palette-block, .b10-zone')
            .forEach(el => el.setAttribute('draggable', 'true'));
        refreshUI();
    }
    container._b10Lock = lockWidget;
    container._b10UnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        const counts = getCounts();
        const total = getTotal();
        try { onBase10BuildSubmit(q, { counts, total }); }
        catch (err) { console.error('onBase10BuildSubmit failed:', err); }
    });

    refreshUI();
}

// Returns true iff total value (sum of place * count) equals q.target.
// This is intentionally lenient on regrouping: 23 ones + 0 tens still scores
// as "23" — but for the build skills we want clean place-value modeling, so
// the integration may also enforce that each digit's count matches the
// canonical representation. Here we expose both checks and let the
// integration choose.
export function checkBase10Build(q, st) {
    if (!q || !st || typeof st !== 'object') return false;
    const target = Math.max(0, Math.floor(q.target || q.ans || 0));
    return (st.total | 0) === target;
}

// Stricter check used by the regroup-decompose skills: each zone must hold
// the exact digit count for that place (no over/under counts).
export function checkBase10BuildCanonical(q, st) {
    if (!q || !st || typeof st !== 'object') return false;
    const target = Math.max(0, Math.floor(q.target || q.ans || 0));
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice()
        : _placesFor(target, q.maxPlace);
    for (const p of places) {
        const expected = Math.floor(target / p) % 10;
        const actual = (st.counts && st.counts[p]) | 0;
        if (expected !== actual) return false;
    }
    return true;
}

// Default no-op; question-render.js replaces per-mount.
export let onBase10BuildSubmit = function (_q, _st) { /* noop */ };

export function setOnBase10BuildSubmit(fn) {
    if (typeof fn === 'function') onBase10BuildSubmit = fn;
}
