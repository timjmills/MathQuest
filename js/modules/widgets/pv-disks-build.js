// pv-disks-build widget — the screen twin of the paper disk mat (P9, place-value-rounding.md §13.4).
//
// The pupil sees the number to build and the SAME mat the printed sheet draws
// (sheet/cells/pv.js diskMatSVG): one square-cornered zone per place, left to right largest
// first, SOLID shared borders (a dash means "cut", LS-3), the place letter above each zone, and
// room for nine disks in a 3 x 3 grid. A disk is a black OUTLINE circle with its value printed
// inside, never a filled colour: a disk is told from another by the value in it and the zone it
// sits in (INK-1). The owner's regrade found the old widget's zones had no border on screen and
// its disks were solid colour blobs — neither matched the paper.
//
// TAP TO ADD (RM-19): tap a zone to add one disk to it; tap a disk to take it away. No palette,
// no drag: every target is at least 44 px (a zone is ~170 px square, a disk 48 px). Keyboard:
// Enter / Space on a zone adds, on a disk removes. An empty zone stays empty (RP-32).
//
// Question contract (unchanged):
//   q.target   number to build (1..9999)
//   q.places   ordered place values, largest first (derived from target if absent)
//   q.text     prompt
//
// Integration hooks (unchanged): `.pvb-zone-stack[data-place]` holds the `.pvb-disk` buttons,
// `container._pvLock` / `container._pvUnlockForRetry`, and `setOnPvBuildSubmit(fn)`.
//
// Pure module — no globals attached, no DOM mutation outside `container`.

const PLACE_LABEL = {
    1: 'Ones', 10: 'Tens', 100: 'Hundreds', 1000: 'Thousands',
    10000: 'Ten Thousands', 100000: 'Hundred Thousands', 1000000: 'Millions',
    0.1: 'Tenths', 0.01: 'Hundredths', 0.001: 'Thousandths'
};
const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 1000000: 'M',
    0.1: 'Tth', 0.01: 'Hth', 0.001: 'Thth' };
// vis_pv_decimal_places: a mat may carry tenths / hundredths / thousandths zones (q.places holds
// 0.1, 0.01, 0.001). Values are then worked in whole thousandths, never in floats.
const _dp = (places) => Math.max(0, ...places.map((p) => (p < 1 ? Math.round(-Math.log10(p)) : 0)));
const _fix = (v, d) => Number(Number(v).toFixed(d));
const MAX_PER_ZONE = 9;
const DISK_PX = 48;          // >= 44 px touch target (WCAG 2.5.5), and room for "1,000"
const GAP_PX = 6;

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

function _placesForTarget(target) {
    const t = Math.max(0, Math.floor(target || 0));
    if (t === 0) return [1];
    const out = [];
    for (let p = 10 ** (String(t).length - 1); p >= 1; p /= 10) out.push(p);
    return out;
}

function _digitAtPlace(num, place) {
    return Math.floor(Math.round(num * 1000) / Math.round(place * 1000)) % 10;
}

/** The digit q.target holds in `place` (decimal places included) - the hosts' checker uses it. */
export function pvDigitAt(q, place) {
    return _digitAtPlace(Math.max(0, Number(q && q.target) || 0), place);
}

function _diskHtml(place, idx, px, fraction = false) {
    let label = place < 1 ? String(place) : Number(place).toLocaleString('en-US');
    let fontSize = Math.round(px * (label.length >= 5 ? 0.2 : label.length === 3 ? 0.3 : label.length === 4 ? 0.24 : 0.36));
    if (fraction && place < 1) {
        // R61: the counter named as a fraction (1 over 10 / 100 / 1000), as the paper draws it.
        const den = String(Math.round(1 / place));
        fontSize = Math.round(px * (den.length >= 4 ? 0.2 : 0.24));
        label = `<span style="display:inline-flex;flex-direction:column;align-items:center;line-height:1;">`
            + `<span>1</span><span style="border-top:1.5px solid #000;padding-top:1px;">${den}</span></span>`;
    }
    return `<button type="button" class="pvb-disk" data-place="${place}" data-disk-idx="${idx}"
        aria-label="${PLACE_LABEL[place]} disk, value ${place < 1 ? String(place) : Number(place).toLocaleString('en-US')}. Tap to take it away."
        style="width:${px}px;height:${px}px;min-width:44px;min-height:44px;border-radius:50%;background:#fff;color:#000;
               font-family:'Andika',sans-serif;font-weight:700;font-size:${fontSize}px;border:2px solid #000;
               box-shadow:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
               padding:0;margin:0;line-height:1;">${label}</button>`;
}

function _zoneHtml(place, i, px, cols = 3, width = 0, point = false) {
    // Round 3 (H2 / H6 at 390 px): the three zones must fit the cell side by side. A narrow cell
    // gives each zone its share of the width and fewer disks per row (the zone grows down),
    // never smaller disks than a touch target.
    const side = width || (cols * px + (cols + 1) * GAP_PX);
    const tall = Math.max(side, Math.ceil(9 / cols) * (px + GAP_PX) + GAP_PX);
    return `<div class="pvb-col" data-place="${place}" style="display:flex;flex-direction:column;align-items:stretch;">
        <div class="pvb-zone-label" aria-hidden="true" style="text-align:center;font-family:'Andika',sans-serif;font-weight:700;
             font-size:1.35rem;color:#000;line-height:1.3;">${LETTER[place] || ''}</div>
        <div class="pvb-zone" data-place="${place}" role="button" tabindex="0"
            aria-label="${PLACE_LABEL[place]} zone, empty. Tap to add a ${PLACE_LABEL[place].toLowerCase()} disk."
            style="box-sizing:border-box;width:${side}px;height:${cols === 3 ? side : tall}px;border:2px solid #000;${i ? 'border-left:none;' : ''}
                   border-radius:0;background:#fff;cursor:pointer;padding:${GAP_PX}px;position:relative;">
            ${point ? `<span class="pvb-point" aria-hidden="true" style="position:absolute;left:-8px;bottom:-8px;width:14px;height:14px;border-radius:50%;background:#000;"></span>` : ''}
            <div class="pvb-zone-stack" data-place="${place}"
                 style="display:grid;grid-template-columns:repeat(${cols},${px}px);grid-auto-rows:${px}px;gap:${GAP_PX}px;justify-content:center;"></div>
        </div>
    </div>`;
}

export function renderPvDisksBuild(q, container) {
    if (!container || !q) return;
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice().sort((a, b) => b - a)
        : _placesForTarget(Math.floor(q.target || 0));
    const dp = _dp(places);
    const target = dp ? _fix(Math.max(0, Number(q.target) || 0), dp) : Math.max(0, Math.floor(q.target || 0));
    const targetText = dp ? ((q.pv && q.pv.s) || target.toFixed(dp)) : target.toLocaleString('en-US');
    const large = _largeTargets();
    let px = large ? 56 : DISK_PX;
    // the width the mat may take (the cell's content box); three disks a row when they fit
    const avail = Math.max(0, (container.clientWidth || (container.parentElement && container.parentElement.clientWidth) || 0) - 4);
    let cols = 3;
    let zoneW = 0;
    if (avail > 0 && places.length) {
        const per = Math.floor(avail / places.length);
        if (per < 3 * px + 4 * GAP_PX) {
            zoneW = per;
            cols = Math.max(1, Math.min(3, Math.floor((per - GAP_PX) / (44 + GAP_PX))));
            px = Math.max(44, Math.min(px, Math.floor((per - (cols + 1) * GAP_PX - 4) / cols)));
        }
    }

    container.innerHTML = `
        <div class="pvb-host${large ? ' pvb-large' : ''}" role="application"
             aria-label="Place-value disk mat. Tap a zone to add a disk. Tap a disk to take it away."
             style="background:#fff;color:#000;font-family:'Andika',sans-serif;">
            <div class="pvb-target" style="text-align:center;font-weight:700;font-size:2.4rem;
                 color:#000;margin-bottom:10px;letter-spacing:1px;">${_esc(targetText)}</div>
            <div class="pvb-zones" data-role="zones"
                 style="display:flex;flex-wrap:nowrap;justify-content:center;width:100%;overflow-x:auto;">
                ${places.map((p, i) => _zoneHtml(p, i, px, cols, zoneW, p < 1 && places[i - 1] === 1)).join('')}
            </div>
            <div class="pvb-howto" style="text-align:center;font-size:0.95rem;color:#000;margin-top:8px;">
                Tap a zone to add a disk. Tap a disk to take it away.</div>
            <div class="pvb-toolbar" style="display:flex;justify-content:center;gap:10px;margin-top:12px;">
                <button type="button" class="pvb-clear secondary-btn" style="min-height:44px;">Clear Mat</button>
                <button type="button" class="pvb-submit primary-btn" style="min-height:44px;" disabled>Submit</button>
            </div>
            <div class="pvb-live" aria-live="polite"
                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
        </div>
    `;

    const host = container.querySelector('.pvb-host');
    const submit = host.querySelector('.pvb-submit');
    const clearBtn = host.querySelector('.pvb-clear');
    const live = host.querySelector('.pvb-live');
    let locked = false;
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
            const zoneEl = host.querySelector(`.pvb-zone[data-place="${p}"]`);
            const n = stack ? stack.querySelectorAll('.pvb-disk').length : 0;
            if (zoneEl) {
                zoneEl.setAttribute('aria-label',
                    `${PLACE_LABEL[p]} zone, ${n === 0 ? 'empty' : n + (n === 1 ? ' disk' : ' disks')}. Tap to add a ${PLACE_LABEL[p].toLowerCase()} disk.`);
            }
        });
        const counts = getCounts();
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        submit.disabled = locked || total === 0;
        // The grid hosts' twin (screen-cell.js mountBuild): the mat IS the answer - its value is
        // written into the host's input as the pupil builds (no Submit on those hosts).
        if (typeof container._pvOnChange === 'function') {
            const v = Object.keys(counts).reduce((t, pl) => t + (counts[pl] | 0) * Math.round(Number(pl) * 1000), 0) / 1000;
            try { container._pvOnChange(dp ? _fix(v, dp) : v); } catch (e) { /* host's */ }
        }
    }

    function addDisk(zoneEl) {
        const place = Number(zoneEl.dataset.place);
        const stack = zoneEl.querySelector('.pvb-zone-stack');
        if (!stack) return;
        if (stack.querySelectorAll('.pvb-disk').length >= MAX_PER_ZONE) {
            announce(`The ${PLACE_LABEL[place].toLowerCase()} zone is full: 9 disks.`);
            return;
        }
        diskCounters[place] = (diskCounters[place] || 0) + 1;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = _diskHtml(place, diskCounters[place], px, !!(q.pv && q.pv.fraction)).trim();
        stack.appendChild(wrapper.firstElementChild);
        announce(`${PLACE_LABEL[place]} disk added.`);
        refreshCountsUI();
    }

    function removeDisk(diskEl) {
        const place = Number(diskEl.dataset.place);
        if (diskEl.parentNode) diskEl.parentNode.removeChild(diskEl);
        announce(`${PLACE_LABEL[place]} disk taken away.`);
        refreshCountsUI();
    }

    host.addEventListener('click', (e) => {
        if (locked) return;
        const disk = e.target.closest('.pvb-zone-stack .pvb-disk');
        if (disk) { e.stopPropagation(); removeDisk(disk); return; }
        const zone = e.target.closest('.pvb-zone');
        if (zone) addDisk(zone);
    });

    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const t = e.target.closest('.pvb-disk, .pvb-zone');
        if (!t) return;
        e.preventDefault();
        if (t.classList.contains('pvb-disk')) removeDisk(t); else addDisk(t);
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        places.forEach(p => {
            const stack = host.querySelector(`.pvb-zone-stack[data-place="${p}"]`);
            if (stack) stack.innerHTML = '';
        });
        announce('Mat cleared.');
        refreshCountsUI();
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        clearBtn.disabled = true;
    }
    function unlockForRetry() {
        locked = false;
        clearBtn.disabled = false;
        host.querySelectorAll('.correct-flash, .wrong-flash').forEach(el => {
            el.classList.remove('correct-flash', 'wrong-flash');
        });
        refreshCountsUI();
    }
    container._pvLock = lockWidget;
    container._pvUnlockForRetry = unlockForRetry;

    if (container.dataset.pvbNoSubmit === '1') submit.remove();
    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
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
    const target = Math.max(0, Number(q.target) || 0);
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice()
        : _placesForTarget(Math.floor(target));
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
