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
    10000: 'Ten Thousands', 100000: 'Hundred Thousands', 1000000: 'Millions'
};
const LETTER = { 1: 'O', 10: 'T', 100: 'H', 1000: 'Th', 10000: 'TTh', 100000: 'HTh', 1000000: 'M' };
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
    return Math.floor(num / place) % 10;
}

function _diskHtml(place, idx, px) {
    const label = Number(place).toLocaleString('en-US');
    const fontSize = Math.round(px * (label.length >= 5 ? 0.2 : label.length === 3 ? 0.3 : label.length === 4 ? 0.24 : 0.36));
    return `<button type="button" class="pvb-disk" data-place="${place}" data-disk-idx="${idx}"
        aria-label="${PLACE_LABEL[place]} disk, value ${label}. Tap to take it away."
        style="width:${px}px;height:${px}px;min-width:44px;min-height:44px;border-radius:50%;background:#fff;color:#000;
               font-family:'Andika',sans-serif;font-weight:700;font-size:${fontSize}px;border:2px solid #000;
               box-shadow:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;
               padding:0;margin:0;line-height:1;">${label}</button>`;
}

function _zoneHtml(place, i, px) {
    const side = 3 * px + 4 * GAP_PX;
    return `<div class="pvb-col" data-place="${place}" style="display:flex;flex-direction:column;align-items:stretch;">
        <div class="pvb-zone-label" aria-hidden="true" style="text-align:center;font-family:'Andika',sans-serif;font-weight:700;
             font-size:1.35rem;color:#000;line-height:1.3;">${LETTER[place] || ''}</div>
        <div class="pvb-zone" data-place="${place}" role="button" tabindex="0"
            aria-label="${PLACE_LABEL[place]} zone, empty. Tap to add a ${PLACE_LABEL[place].toLowerCase()} disk."
            style="box-sizing:border-box;width:${side}px;height:${side}px;border:2px solid #000;${i ? 'border-left:none;' : ''}
                   border-radius:0;background:#fff;cursor:pointer;padding:${GAP_PX}px;position:relative;">
            <div class="pvb-zone-stack" data-place="${place}"
                 style="display:grid;grid-template-columns:repeat(3,${px}px);grid-auto-rows:${px}px;gap:${GAP_PX}px;"></div>
        </div>
    </div>`;
}

export function renderPvDisksBuild(q, container) {
    if (!container || !q) return;
    const target = Math.max(0, Math.floor(q.target || 0));
    const places = (Array.isArray(q.places) && q.places.length)
        ? q.places.slice().sort((a, b) => b - a)
        : _placesForTarget(target);
    const large = _largeTargets();
    const px = large ? 56 : DISK_PX;

    container.innerHTML = `
        <div class="pvb-host${large ? ' pvb-large' : ''}" role="application"
             aria-label="Place-value disk mat. Tap a zone to add a disk. Tap a disk to take it away."
             style="background:#fff;color:#000;font-family:'Andika',sans-serif;">
            <div class="pvb-target" style="text-align:center;font-weight:700;font-size:2.4rem;
                 color:#000;margin-bottom:10px;letter-spacing:1px;">${target.toLocaleString('en-US')}</div>
            <div class="pvb-zones" data-role="zones"
                 style="display:flex;justify-content:center;width:100%;overflow-x:auto;">
                ${places.map((p, i) => _zoneHtml(p, i, px)).join('')}
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
        const total = Object.values(getCounts()).reduce((a, b) => a + b, 0);
        submit.disabled = locked || total === 0;
    }

    function addDisk(zoneEl) {
        const place = parseInt(zoneEl.dataset.place, 10);
        const stack = zoneEl.querySelector('.pvb-zone-stack');
        if (!stack) return;
        if (stack.querySelectorAll('.pvb-disk').length >= MAX_PER_ZONE) {
            announce(`The ${PLACE_LABEL[place].toLowerCase()} zone is full: 9 disks.`);
            return;
        }
        diskCounters[place] = (diskCounters[place] || 0) + 1;
        const wrapper = document.createElement('div');
        wrapper.innerHTML = _diskHtml(place, diskCounters[place], px).trim();
        stack.appendChild(wrapper.firstElementChild);
        announce(`${PLACE_LABEL[place]} disk added.`);
        refreshCountsUI();
    }

    function removeDisk(diskEl) {
        const place = parseInt(diskEl.dataset.place, 10);
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
