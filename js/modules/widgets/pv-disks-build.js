// pv-disks-build widget — interactive place-value disk workmat.
//
// Student is shown a target number (e.g. "Build 487") and an empty
// hundreds / tens / ones (and optional thousands) workmat with three
// drop zones. They drag colored disks from a palette into the matching
// place-value zone. Disks visibly stack inside each zone.
// Submit (in-widget) checks that each zone holds the correct count of
// disks (counts == digits of target number).
//
// Colors / sizes are consistent with the existing place_value_disks
// "count_disks" visual:
//   ones     = green,  small
//   tens     = blue,   medium
//   hundreds = orange, large
//   thousands = purple, x-large
//
// Question contract:
//   q.target:        number to build (1..9999)
//   q.places:        ordered array of place values to expose, largest first.
//                    e.g. [100, 10, 1] for a 3-digit build.
//                    Optional — derived from target if absent.
//   q.text:          prompt (default "Build the number {target}.")
//   q.hint:          optional hint shown by the global Hint button
//
// Pure module — no globals attached, no DOM mutation outside `container`.
// Mirrors the dnd-generic / coord-plot integration pattern: exposes a
// settable `onPvBuildSubmit` hook that question-render.js wires up.

const PLACE_LABEL = {
    1: 'Ones', 10: 'Tens', 100: 'Hundreds', 1000: 'Thousands',
    10000: 'Ten Thousands', 100000: 'Hundred Thousands', 1000000: 'Millions'
};
const PLACE_COLOR = {
    1:       'var(--accent-green)',
    10:      '#3b82f6',
    100:     'var(--accent-orange)',
    1000:    'var(--accent-purple)',
    10000:   'var(--accent-pink, #e91e63)',
    100000:  'var(--accent-teal, #009688)',
    1000000: 'var(--accent-yellow, #fbc02d)'
};
// Disk render size (px) per place. Larger places get bigger disks so
// students can visually distinguish them at a glance. Capped at 100 so the
// 7-place workmat (millions) still fits without overflowing the card.
const PLACE_SIZE = {
    1: 40, 10: 48, 100: 56, 1000: 64, 10000: 72, 100000: 80, 1000000: 88
};

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

// Derive ordered place list (largest first) from target. Always includes
// every place from the largest non-zero digit down to ones — so a target of
// 405 still shows a Tens zone (which should hold 0 disks). Now supports up
// to 7-digit targets (millions).
function _placesForTarget(target) {
    const t = Math.max(0, Math.floor(target || 0));
    if (t === 0) return [1];
    if (t >= 1000000) return [1000000, 100000, 10000, 1000, 100, 10, 1];
    if (t >= 100000)  return [100000, 10000, 1000, 100, 10, 1];
    if (t >= 10000)   return [10000, 1000, 100, 10, 1];
    if (t >= 1000) return [1000, 100, 10, 1];
    if (t >= 100)  return [100, 10, 1];
    if (t >= 10)   return [10, 1];
    return [1];
}

function _digitAtPlace(num, place) {
    return Math.floor(num / place) % 10;
}

// Compact label so the number on each disk fits inside the disk circle even
// for million-sized places. "1,000,000" would overflow; show "1M" / "100K"
// instead. Caller still uses the numeric `place` for logic.
function _diskLabel(place) {
    if (place >= 1000000) return (place / 1000000) + 'M';
    if (place >= 1000) return (place / 1000) + 'K';
    return String(place);
}

function _diskHtml(place, idx) {
    const sz = PLACE_SIZE[place] || 44;
    const color = PLACE_COLOR[place];
    const label = _diskLabel(place);
    // Smaller font when label is longer (e.g. "100K" vs "1") so 4-char labels
    // still fit cleanly inside the disk.
    const fontSize = Math.max(9, Math.round(sz * (label.length >= 4 ? 0.22 : label.length === 3 ? 0.26 : 0.30)));
    return `<button type="button" class="pvb-disk" data-place="${place}" data-disk-idx="${idx}"
        draggable="true"
        aria-label="${PLACE_LABEL[place]} disk, value ${place}, draggable"
        style="width:${sz}px;height:${sz}px;border-radius:50%;background:${color};color:white;
               font-weight:800;font-size:${fontSize}px;border:3px solid rgba(255,255,255,0.55);
               box-shadow:0 2px 6px rgba(0,0,0,0.18);cursor:grab;display:inline-flex;
               align-items:center;justify-content:center;padding:0;margin:0;">${label}</button>`;
}

// One palette stack per place. Each stack supplies an effectively-unlimited
// pool of disks (we render up to 9 + the target digit, so the student can
// always overshoot to test wrong answers). Picking up a disk from the palette
// just spawns a fresh disk — palette never runs dry.
function _paletteStackHtml(place) {
    const sz = PLACE_SIZE[place] || 44;
    const color = PLACE_COLOR[place];
    const label = _diskLabel(place);
    const fontSize = Math.max(9, Math.round(sz * (label.length >= 4 ? 0.22 : label.length === 3 ? 0.26 : 0.30)));
    return `<div class="pvb-palette-stack" data-place="${place}">
        <div class="pvb-palette-label" style="font-size:0.78rem;font-weight:700;color:var(--text-dim);
             margin-bottom:6px;letter-spacing:0.4px;text-transform:uppercase;white-space:nowrap;">${PLACE_LABEL[place]}</div>
        <button type="button" class="pvb-palette-disk" data-place="${place}"
            draggable="true"
            aria-label="${PLACE_LABEL[place]} disk source, value ${place}, draggable"
            style="width:${sz}px;height:${sz}px;border-radius:50%;background:${color};color:white;
                   font-weight:800;font-size:${fontSize}px;border:3px solid rgba(255,255,255,0.55);
                   box-shadow:0 3px 8px rgba(0,0,0,0.20);cursor:grab;display:inline-flex;
                   align-items:center;justify-content:center;padding:0;margin:0 auto;">${label}</button>
        <div class="pvb-palette-hint" style="font-size:0.7rem;color:var(--text-dim);margin-top:4px;">drag</div>
    </div>`;
}

function _zoneHtml(place, totalPlaces) {
    const color = PLACE_COLOR[place];
    // Tighter zone label/padding when many places shown so 6- and 7-column
    // workmats still fit on a single row.
    const labelSz = totalPlaces >= 6 ? '0.7rem' : totalPlaces >= 5 ? '0.8rem' : '0.95rem';
    const padding = totalPlaces >= 6 ? 6 : 10;
    return `<div class="pvb-zone" data-place="${place}"
        role="button" tabindex="0"
        aria-label="${PLACE_LABEL[place]} drop zone, empty"
        style="border:3px dashed ${color};border-radius:14px;min-height:140px;padding:${padding}px;
               background:rgba(255,255,255,0.04);display:flex;flex-direction:column;
               align-items:center;justify-content:flex-start;gap:6px;">
        <div class="pvb-zone-label" style="font-size:${labelSz};font-weight:800;color:${color};
             letter-spacing:0.4px;text-transform:uppercase;text-align:center;line-height:1.1;">${PLACE_LABEL[place]}</div>
        <div class="pvb-zone-stack" data-place="${place}"
             style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;
                    min-height:60px;width:100%;"></div>
        <div class="pvb-zone-count" data-place="${place}"
             style="font-size:0.78rem;font-weight:700;color:var(--text-dim);margin-top:auto;">0 disks</div>
    </div>`;
}

// Module-shared "currently picked up" disk (for click-and-click fallback /
// keyboard a11y). When set via a palette disk, picking up means "spawn a
// fresh disk on next click in a zone". When set via an in-zone disk,
// picking up means "move this specific disk".
let _activeKind = null;     // 'spawn' | 'move' | null
let _activePlace = null;    // place value of the active source/disk
let _activeEl = null;       // the in-zone disk element (only for 'move')
let _activeHost = null;

export function renderPvDisksBuild(q, container) {
    if (!container || !q) return;
    const target = Math.max(0, Math.floor(q.target || 0));
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice().sort((a, b) => b - a)
        : _placesForTarget(target);
    const large = _largeTargets();

    const paletteHtml = places.map(_paletteStackHtml).join('');
    const zonesHtml = places.map(p => _zoneHtml(p, places.length)).join('');

    const promptText = q.text || `Build the number ${target.toLocaleString()}.`;

    // Per-zone width shrinks as count grows so 6- and 7-column workmats fit.
    const zonePerCol = places.length >= 7 ? 110 : places.length >= 6 ? 120 : places.length >= 5 ? 140 : 200;
    const gridMaxW = Math.min(960, places.length * zonePerCol);
    const palGap = places.length >= 6 ? 10 : 30;

    container.innerHTML = `
        <div class="pvb-host${large ? ' pvb-large' : ''}" role="application"
             aria-label="Place value disks build mat">
            <div class="pvb-prompt" style="font-weight:800;font-size:1.15rem;text-align:center;
                 margin-bottom:10px;color:var(--text-bright);">${_esc(promptText)}</div>
            <div class="pvb-target" style="text-align:center;font-weight:900;font-size:2.4rem;
                 color:var(--accent-purple);margin-bottom:14px;letter-spacing:2px;">
                ${target.toLocaleString()}
            </div>
            <div class="pvb-zones" data-role="zones"
                 style="display:grid;grid-template-columns:repeat(${places.length},1fr);gap:8px;
                        max-width:${gridMaxW}px;margin:0 auto;">
                ${zonesHtml}
            </div>
            <div class="pvb-palette" data-role="palette"
                 style="display:flex;justify-content:center;gap:${palGap}px;margin-top:18px;
                        padding:12px;background:rgba(0,0,0,0.06);border-radius:10px;flex-wrap:wrap;">
                ${paletteHtml}
            </div>
            <div class="pvb-toolbar" style="display:flex;justify-content:center;gap:10px;margin-top:14px;">
                <button type="button" class="pvb-clear secondary-btn">Clear Mat</button>
                <button type="button" class="pvb-submit primary-btn" disabled>Submit</button>
            </div>
            <div class="pvb-live" aria-live="polite"
                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
        </div>
    `;

    const host = container.querySelector('.pvb-host');
    const zones = host.querySelector('[data-role="zones"]');
    const palette = host.querySelector('[data-role="palette"]');
    const submit = host.querySelector('.pvb-submit');
    const clearBtn = host.querySelector('.pvb-clear');
    const live = host.querySelector('.pvb-live');
    let locked = false;
    // Per-zone disk counter (used to assign unique data-disk-idx values).
    const diskCounters = Object.fromEntries(places.map(p => [p, 0]));

    function announce(msg) { if (live) live.textContent = msg; }

    function getCounts() {
        const out = {};
        places.forEach(p => {
            const stack = host.querySelector(`.pvb-zone-stack[data-place="${p}"]`);
            out[p] = stack ? stack.querySelectorAll('.pvb-disk').length : 0;
        });
        return out;
    }

    function refreshCountsUI() {
        places.forEach(p => {
            const stack = host.querySelector(`.pvb-zone-stack[data-place="${p}"]`);
            const counter = host.querySelector(`.pvb-zone-count[data-place="${p}"]`);
            const zoneEl = host.querySelector(`.pvb-zone[data-place="${p}"]`);
            const n = stack ? stack.querySelectorAll('.pvb-disk').length : 0;
            if (counter) counter.textContent = n === 1 ? '1 disk' : `${n} disks`;
            if (zoneEl) {
                zoneEl.setAttribute('aria-label',
                    `${PLACE_LABEL[p]} drop zone, ${n === 0 ? 'empty' : n + (n === 1 ? ' disk' : ' disks')}`);
            }
        });
        // Submit enabled once at least one disk has been placed.
        const counts = getCounts();
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        submit.disabled = total === 0;
    }

    function clearActive() {
        if (_activeHost === host && _activeEl) {
            _activeEl.classList.remove('pvb-disk-active');
        }
        if (_activeHost === host) {
            const activePalette = host.querySelectorAll('.pvb-palette-disk.pvb-disk-active');
            activePalette.forEach(el => el.classList.remove('pvb-disk-active'));
            _activeKind = null;
            _activePlace = null;
            _activeEl = null;
            _activeHost = null;
        }
    }

    function setActiveSpawn(paletteDiskEl) {
        clearActive();
        const place = parseInt(paletteDiskEl.dataset.place, 10);
        paletteDiskEl.classList.add('pvb-disk-active');
        _activeKind = 'spawn';
        _activePlace = place;
        _activeEl = null;
        _activeHost = host;
        announce(`Picked up ${PLACE_LABEL[place]} disk. Click a drop zone to place it.`);
    }

    function setActiveMove(zoneDiskEl) {
        clearActive();
        const place = parseInt(zoneDiskEl.dataset.place, 10);
        zoneDiskEl.classList.add('pvb-disk-active');
        _activeKind = 'move';
        _activePlace = place;
        _activeEl = zoneDiskEl;
        _activeHost = host;
        announce(`Picked up placed ${PLACE_LABEL[place]} disk. Click another zone to move it, or click empty palette area to remove.`);
    }

    function spawnDiskInZone(place, zoneEl) {
        const stack = zoneEl.querySelector('.pvb-zone-stack');
        if (!stack) return;
        diskCounters[place] = (diskCounters[place] || 0) + 1;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = _diskHtml(place, diskCounters[place]).trim();
        const disk = wrapper.firstElementChild;
        stack.appendChild(disk);
        zoneEl.classList.add('pvb-zone-flash');
        setTimeout(() => zoneEl.classList.remove('pvb-zone-flash'), 220);
        announce(`${PLACE_LABEL[place]} disk placed.`);
        refreshCountsUI();
    }

    function moveDiskToZone(diskEl, zoneEl) {
        const stack = zoneEl.querySelector('.pvb-zone-stack');
        if (!stack) return;
        // Same-place enforcement: tens disks may only go in the tens zone, etc.
        // If dropped in the wrong zone, briefly shake and announce, then return.
        const diskPlace = parseInt(diskEl.dataset.place, 10);
        const zonePlace = parseInt(zoneEl.dataset.place, 10);
        if (diskPlace !== zonePlace) {
            zoneEl.classList.add('pvb-zone-reject');
            setTimeout(() => zoneEl.classList.remove('pvb-zone-reject'), 320);
            announce(`That disk does not belong in the ${PLACE_LABEL[zonePlace]} zone.`);
            return;
        }
        stack.appendChild(diskEl);
        diskEl.classList.remove('pvb-disk-active');
        announce(`${PLACE_LABEL[diskPlace]} disk moved.`);
        refreshCountsUI();
    }

    function removeDisk(diskEl) {
        const place = parseInt(diskEl.dataset.place, 10);
        diskEl.parentNode && diskEl.parentNode.removeChild(diskEl);
        announce(`${PLACE_LABEL[place]} disk removed.`);
        refreshCountsUI();
    }

    // ---- Click handling ----
    host.addEventListener('click', (e) => {
        if (locked) return;
        const paletteDisk = e.target.closest('.pvb-palette-disk');
        const zoneDisk = e.target.closest('.pvb-zone-stack .pvb-disk');
        const zone = e.target.closest('.pvb-zone');
        const paletteBg = e.target.closest('.pvb-palette');

        // 1) Click a palette disk: arm "spawn next click" mode.
        if (paletteDisk) {
            if (_activeHost === host && _activeKind === 'spawn'
                && _activePlace === parseInt(paletteDisk.dataset.place, 10)) {
                clearActive();
                announce('Selection cleared.');
            } else {
                setActiveSpawn(paletteDisk);
            }
            return;
        }

        // 2) Click an in-zone disk: pick it up to move/remove.
        if (zoneDisk) {
            if (_activeHost === host && _activeEl === zoneDisk) {
                clearActive();
                announce('Selection cleared.');
            } else {
                setActiveMove(zoneDisk);
            }
            return;
        }

        // 3) Click a zone (empty area): place active disk into zone.
        if (zone) {
            if (_activeHost !== host) return;
            if (_activeKind === 'spawn' && _activePlace != null) {
                const place = _activePlace;
                const zonePlace = parseInt(zone.dataset.place, 10);
                if (place !== zonePlace) {
                    zone.classList.add('pvb-zone-reject');
                    setTimeout(() => zone.classList.remove('pvb-zone-reject'), 320);
                    announce(`That disk does not belong in the ${PLACE_LABEL[zonePlace]} zone.`);
                    return;
                }
                spawnDiskInZone(place, zone);
                clearActive();
            } else if (_activeKind === 'move' && _activeEl) {
                moveDiskToZone(_activeEl, zone);
                clearActive();
            }
            return;
        }

        // 4) Click the palette background while holding a placed disk: remove it.
        if (paletteBg && _activeHost === host && _activeKind === 'move' && _activeEl) {
            removeDisk(_activeEl);
            clearActive();
            return;
        }
    });

    // Keyboard a11y: Enter/Space on disks/zones acts like a click.
    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const target = e.target.closest('.pvb-palette-disk, .pvb-disk, .pvb-zone');
        if (!target) return;
        e.preventDefault();
        target.click();
    });

    // ---- Native HTML5 drag events ----
    host.addEventListener('dragstart', (e) => {
        if (locked) { e.preventDefault(); return; }
        const paletteDisk = e.target.closest('.pvb-palette-disk');
        const zoneDisk = e.target.closest('.pvb-zone-stack .pvb-disk');
        if (paletteDisk) {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain',
                `spawn:${paletteDisk.dataset.place}`);
            paletteDisk.classList.add('pvb-dragging');
            return;
        }
        if (zoneDisk) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain',
                `move:${zoneDisk.dataset.place}:${zoneDisk.dataset.diskIdx}`);
            zoneDisk.classList.add('pvb-dragging');
            return;
        }
        e.preventDefault();
    });

    host.addEventListener('dragend', (e) => {
        host.querySelectorAll('.pvb-dragging').forEach(el => el.classList.remove('pvb-dragging'));
        host.querySelectorAll('.pvb-zone.pvb-zone-over, .pvb-palette.pvb-palette-over')
            .forEach(el => el.classList.remove('pvb-zone-over', 'pvb-palette-over'));
    });

    host.addEventListener('dragover', (e) => {
        if (locked) return;
        const zone = e.target.closest('.pvb-zone');
        const paletteBg = e.target.closest('.pvb-palette');
        if (zone) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            zone.classList.add('pvb-zone-over');
        } else if (paletteBg) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            paletteBg.classList.add('pvb-palette-over');
        }
    });

    host.addEventListener('dragleave', (e) => {
        const target = e.target.closest('.pvb-zone, .pvb-palette');
        if (target) target.classList.remove('pvb-zone-over', 'pvb-palette-over');
    });

    host.addEventListener('drop', (e) => {
        if (locked) return;
        const data = e.dataTransfer.getData('text/plain') || '';
        if (!data) return;
        const zone = e.target.closest('.pvb-zone');
        const paletteBg = e.target.closest('.pvb-palette');

        if (data.startsWith('spawn:')) {
            const place = parseInt(data.split(':')[1], 10);
            if (zone) {
                e.preventDefault();
                zone.classList.remove('pvb-zone-over');
                const zonePlace = parseInt(zone.dataset.place, 10);
                if (zonePlace !== place) {
                    zone.classList.add('pvb-zone-reject');
                    setTimeout(() => zone.classList.remove('pvb-zone-reject'), 320);
                    announce(`That disk does not belong in the ${PLACE_LABEL[zonePlace]} zone.`);
                    return;
                }
                spawnDiskInZone(place, zone);
            }
        } else if (data.startsWith('move:')) {
            const [, placeStr, idxStr] = data.split(':');
            const place = parseInt(placeStr, 10);
            const diskEl = host.querySelector(
                `.pvb-zone-stack .pvb-disk[data-place="${place}"][data-disk-idx="${idxStr}"]`
            );
            if (!diskEl) return;
            if (zone) {
                e.preventDefault();
                zone.classList.remove('pvb-zone-over');
                moveDiskToZone(diskEl, zone);
            } else if (paletteBg) {
                e.preventDefault();
                paletteBg.classList.remove('pvb-palette-over');
                removeDisk(diskEl);
            }
        }
    });

    // Clear Mat: reset all zones (does NOT lock).
    clearBtn.addEventListener('click', () => {
        if (locked) return;
        places.forEach(p => {
            const stack = host.querySelector(`.pvb-zone-stack[data-place="${p}"]`);
            if (stack) stack.innerHTML = '';
        });
        clearActive();
        announce('Mat cleared.');
        refreshCountsUI();
    });

    // Hard-lock: disable submit, disable dragging, prevent further interaction.
    // Used by integrations once the answer is finalized (all-correct OR MAP test).
    function lockWidget() {
        locked = true;
        submit.disabled = true;
        clearBtn.disabled = true;
        host.querySelectorAll('.pvb-disk, .pvb-palette-disk, .pvb-zone')
            .forEach(el => el.setAttribute('draggable', 'false'));
    }
    // Soft-unlock: clear per-disk red/green flash classes and re-enable
    // dragging so the student can fix wrong placements and re-submit.
    function unlockForRetry() {
        locked = false;
        clearBtn.disabled = false;
        host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        host.querySelectorAll('.pvb-disk, .pvb-palette-disk, .pvb-zone')
            .forEach(el => el.setAttribute('draggable', 'true'));
        refreshCountsUI(); // re-evaluates submit.disabled based on disk count
    }
    container._pvLock = lockWidget;
    container._pvUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        // Briefly disable while the integration decides; integration may re-
        // enable via container._pvUnlockForRetry on a wrong (retry) submit, or
        // hard-lock via container._pvLock on all-correct / MAP test mode.
        submit.disabled = true;
        const counts = getCounts();
        try { onPvBuildSubmit(q, counts); }
        catch (err) { console.error('onPvBuildSubmit failed:', err); }
    });

    refreshCountsUI();
}

// Returns true iff every place's disk count equals the digit at that place
// in q.target. Extra places not in q.places must hold zero (impossible since
// we only render places we asked about, but guarded for safety).
export function checkPvDisksBuild(q, counts) {
    if (!q || !counts || typeof counts !== 'object') return false;
    const target = Math.max(0, Math.floor(q.target || 0));
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice()
        : _placesForTarget(target);
    for (const p of places) {
        const expected = _digitAtPlace(target, p);
        const actual = counts[p] | 0;
        if (expected !== actual) return false;
    }
    return true;
}

// Default no-op; question-render.js / worksheet.js replace this per-mount.
export let onPvBuildSubmit = function (_q, _counts) { /* noop */ };

export function setOnPvBuildSubmit(fn) {
    if (typeof fn === 'function') onPvBuildSubmit = fn;
}
