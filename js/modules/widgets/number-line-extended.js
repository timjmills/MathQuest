// number-line-extended widget — superset of the existing number-line-place
// answerType. Renders a configurable number line (integers, decimals,
// fractions, negatives) and lets the student place one or many markers via:
//   1. Click anywhere on the axis  → snaps to nearest minorSnap tick (or
//      stays continuous if minorSnap is 0).
//   2. Drag a marker               → continuous-with-snap behaviour.
//   3. Arrow keys on focused marker → ←/→ nudge by minorSnap, Home/End jump
//      to extremes.
//
// Question contract:
//   q.rangeMin, q.rangeMax           required
//   q.majorTickEvery                 spacing of labelled ticks (default 1)
//   q.minorSnap                      finest snap granularity (default same as
//                                    majorTickEvery; set to 0 for continuous)
//   q.numberType                     'integer' | 'decimal' | 'fraction' |
//                                    'negative' (default 'integer'; only
//                                    affects how tick labels are rendered)
//   q.unit                           optional label after each tick value
//   q.tolerance                      acceptable distance from target (default
//                                    minorSnap / 2, or 0.001 if minorSnap = 0)
//   q.ans                            single mode: number
//                                    multi mode: [{id, value, label}, ...]
//
// Pure module — no globals attached, no DOM mutation outside `container`.

const SVG_W = 600;
const SVG_H = 100;
const PAD_X = 30;          // horizontal padding inside the SVG
const AXIS_Y = 60;         // y-coord of the horizontal axis
const TICK_MAJOR_LEN = 16;
const TICK_MINOR_LEN = 8;
const MARKER_R = 12;

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

// gcd / fraction-from-decimal — used for fraction-style tick labels.
function _gcd(a, b) {
    a = Math.abs(a | 0); b = Math.abs(b | 0);
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
}

// Best-effort fraction representation of a numeric value over a denominator
// inferred from the snap spacing. Used to render fraction-style tick labels.
function _fractionLabel(value, snap) {
    if (!Number.isFinite(value)) return String(value);
    if (Math.abs(value - Math.round(value)) < 1e-9) {
        return String(Math.round(value));
    }
    // Pick a denominator from the snap (e.g. snap 0.25 → den 4).
    let den = 1;
    if (snap && snap > 0) {
        const inv = 1 / snap;
        if (Math.abs(inv - Math.round(inv)) < 1e-6) den = Math.round(inv);
    }
    if (den < 2) den = 2;
    let num = Math.round(value * den);
    const sign = num < 0 ? -1 : 1;
    num = Math.abs(num);
    const g = _gcd(num, den);
    num /= g;
    const denR = den / g;
    if (Math.abs(num) >= denR) {
        const whole = Math.trunc(num / denR);
        const rem = num % denR;
        if (rem === 0) return (sign < 0 ? '-' : '') + whole;
        return (sign < 0 ? '-' : '') + `${whole} ${rem}/${denR}`;
    }
    return (sign < 0 ? '-' : '') + `${num}/${denR}`;
}

function _formatTickLabel(value, numberType, snap) {
    if (numberType === 'fraction') {
        return _fractionLabel(value, snap);
    }
    if (numberType === 'decimal') {
        // Trim trailing zeros, but preserve up to 2 decimals
        const fixed = Number(value.toFixed(3));
        return String(fixed);
    }
    // integer / negative — print as integer if it rounds cleanly, otherwise
    // show one decimal so the axis still makes sense for half-tick zoom.
    if (Math.abs(value - Math.round(value)) < 1e-9) return String(Math.round(value));
    return String(Number(value.toFixed(2)));
}

// Linearly map a domain value to an SVG x coordinate.
function _xFor(value, rangeMin, rangeMax) {
    if (rangeMax === rangeMin) return PAD_X;
    const t = (value - rangeMin) / (rangeMax - rangeMin);
    return PAD_X + t * (SVG_W - 2 * PAD_X);
}

function _valueForX(x, rangeMin, rangeMax) {
    const t = (x - PAD_X) / (SVG_W - 2 * PAD_X);
    return rangeMin + t * (rangeMax - rangeMin);
}

function _snapValue(value, rangeMin, rangeMax, snap) {
    let v = value;
    if (snap && snap > 0) {
        const k = Math.round((v - rangeMin) / snap);
        v = rangeMin + k * snap;
    }
    if (v < rangeMin) v = rangeMin;
    if (v > rangeMax) v = rangeMax;
    // Defeat float drift so equality checks against q.ans behave.
    return Number(v.toFixed(6));
}

function _isMultiMarker(q) {
    return Array.isArray(q && q.ans) && q.ans.length > 0
        && typeof q.ans[0] === 'object' && q.ans[0] !== null;
}

function _defaultMarkers(q) {
    if (_isMultiMarker(q)) {
        return q.ans.map((m, i) => ({
            id: m.id || `m${i}`,
            label: m.label || '',
            value: null,             // unplaced
            target: m.value,
        }));
    }
    return [{
        id: 'm0',
        label: '',
        value: null,
        target: typeof q.ans === 'number' ? q.ans : 0,
    }];
}

function _normaliseQ(q) {
    const rangeMin = (typeof q.rangeMin === 'number') ? q.rangeMin : 0;
    const rangeMax = (typeof q.rangeMax === 'number') ? q.rangeMax : 10;
    const majorTickEvery = (typeof q.majorTickEvery === 'number' && q.majorTickEvery > 0)
        ? q.majorTickEvery : 1;
    const minorSnap = (typeof q.minorSnap === 'number' && q.minorSnap >= 0)
        ? q.minorSnap : majorTickEvery;
    const numberType = q.numberType || 'integer';
    const tolerance = (typeof q.tolerance === 'number' && q.tolerance >= 0)
        ? q.tolerance
        : (minorSnap > 0 ? minorSnap / 2 : 0.001);
    return { rangeMin, rangeMax, majorTickEvery, minorSnap, numberType, tolerance };
}

export function renderNumberLineExtended(q, container) {
    if (!container || !q) return;
    const cfg = _normaliseQ(q);
    const large = _largeTargets();
    const markers = _defaultMarkers(q);
    const multi = _isMultiMarker(q);

    // ---- Build static SVG content (axis, ticks, labels) ----
    const ticks = [];
    // Major ticks
    for (let v = cfg.rangeMin; v <= cfg.rangeMax + 1e-9; v += cfg.majorTickEvery) {
        const x = _xFor(v, cfg.rangeMin, cfg.rangeMax);
        ticks.push(
            `<line class="nle-tick-major" x1="${x}" y1="${AXIS_Y - TICK_MAJOR_LEN / 2}" x2="${x}" y2="${AXIS_Y + TICK_MAJOR_LEN / 2}"/>`
        );
        const label = _formatTickLabel(v, cfg.numberType, cfg.minorSnap);
        ticks.push(
            `<text class="nle-tick-label" x="${x}" y="${AXIS_Y + TICK_MAJOR_LEN / 2 + 16}">${_esc(label)}${q.unit ? _esc(q.unit) : ''}</text>`
        );
    }
    // Minor ticks (between majors), only when minorSnap is a finer division
    if (cfg.minorSnap > 0 && cfg.minorSnap < cfg.majorTickEvery) {
        for (let v = cfg.rangeMin; v <= cfg.rangeMax + 1e-9; v += cfg.minorSnap) {
            // Skip values that coincide with a major tick.
            const r = (v - cfg.rangeMin) / cfg.majorTickEvery;
            if (Math.abs(r - Math.round(r)) < 1e-6) continue;
            const x = _xFor(v, cfg.rangeMin, cfg.rangeMax);
            ticks.push(
                `<line class="nle-tick-minor" x1="${x}" y1="${AXIS_Y - TICK_MINOR_LEN / 2}" x2="${x}" y2="${AXIS_Y + TICK_MINOR_LEN / 2}"/>`
            );
        }
    }

    // ---- Tray of placeable markers (multi mode) ----
    let trayHtml = '';
    if (multi) {
        const items = markers.map(m =>
            `<button type="button" class="nle-tray-item" data-id="${_esc(m.id)}">${_esc(m.label || m.id)}</button>`
        ).join('');
        trayHtml = `<div class="nle-tray" role="group" aria-label="Markers to place">${items}</div>
            <div class="nle-instr">Click a marker, then click the number line to place it.</div>`;
    } else {
        trayHtml = `<div class="nle-instr">Click on the number line, drag the marker, or use the arrow keys to place it.</div>`;
    }

    container.innerHTML = `
        <div class="nle-host${large ? ' large' : ''}" role="application" aria-label="Number line placement">
            ${trayHtml}
            <svg class="nle-svg" viewBox="0 0 ${SVG_W} ${SVG_H}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <line class="nle-axis" x1="${PAD_X}" y1="${AXIS_Y}" x2="${SVG_W - PAD_X}" y2="${AXIS_Y}"/>
                ${ticks.join('')}
                <g data-role="markers"></g>
            </svg>
            <div class="nle-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="nle-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const host = container.querySelector('.nle-host');
    const svg = container.querySelector('.nle-svg');
    const markerLayer = svg.querySelector('[data-role="markers"]');
    const tray = container.querySelector('.nle-tray');
    const submit = container.querySelector('.nle-submit');
    const live = container.querySelector('.nle-live');

    let activeTrayId = null;            // multi mode: id picked up from the tray
    let dragging = null;                // { id, pointerId } during a drag
    let locked = false;

    function announce(msg) { if (live) live.textContent = msg; }

    function valueText(v) { return _formatTickLabel(v, cfg.numberType, cfg.minorSnap); }

    function refreshSubmit() {
        const allPlaced = markers.every(m => m.value !== null);
        submit.disabled = !allPlaced || locked;
    }

    function refreshTray() {
        if (!tray) return;
        tray.querySelectorAll('.nle-tray-item').forEach(btn => {
            const m = markers.find(mm => mm.id === btn.dataset.id);
            if (!m) return;
            btn.classList.toggle('placed', m.value !== null);
            btn.classList.toggle('selected', activeTrayId === m.id);
            btn.setAttribute('aria-pressed', activeTrayId === m.id ? 'true' : 'false');
            btn.disabled = locked || m.value !== null;
        });
    }

    function _markerEl(id) {
        return markerLayer.querySelector(`g[data-marker-id="${CSS.escape(id)}"]`);
    }

    function _renderMarker(m) {
        // Remove any prior render
        const old = _markerEl(m.id);
        if (old) old.remove();
        if (m.value === null) return;
        const x = _xFor(m.value, cfg.rangeMin, cfg.rangeMax);
        const labelTxt = m.label || (multi ? m.id : '');
        const valueTxt = valueText(m.value);
        const ariaText = `${labelTxt ? labelTxt + ' marker, ' : ''}placed at ${valueTxt}`;
        const r = large ? MARKER_R + 4 : MARKER_R;
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('data-marker-id', m.id);
        g.setAttribute('class', 'nle-marker-group');
        g.innerHTML = `
            <circle class="nle-marker" cx="${x}" cy="${AXIS_Y}" r="${r}"
                tabindex="0" role="slider"
                aria-valuemin="${cfg.rangeMin}" aria-valuemax="${cfg.rangeMax}"
                aria-valuenow="${m.value}" aria-valuetext="${_esc(valueTxt)}"
                aria-label="${_esc(ariaText)}"></circle>
            ${labelTxt ? `<text class="nle-marker-label" x="${x}" y="${AXIS_Y + 4}">${_esc(labelTxt)}</text>` : ''}
        `;
        markerLayer.appendChild(g);
    }

    function placeMarker(id, value) {
        const m = markers.find(mm => mm.id === id);
        if (!m) return;
        m.value = _snapValue(value, cfg.rangeMin, cfg.rangeMax, cfg.minorSnap);
        _renderMarker(m);
        announce(`${m.label ? m.label + ' p' : 'P'}laced at ${valueText(m.value)}.`);
        refreshTray();
        refreshSubmit();
    }

    // Translate a pointer event to an SVG x-coordinate (viewBox units).
    function pointerSvgX(evt) {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return PAD_X;
        const inv = ctm.inverse();
        const local = pt.matrixTransform(inv);
        return local.x;
    }

    // ---- Click on the SVG: place / move ----
    svg.addEventListener('click', (e) => {
        if (locked) return;
        // Clicks on a marker bubble here too — let the dedicated drag/keyboard
        // handlers manage those and only treat clicks on the axis area as
        // placement requests.
        if (e.target.closest('.nle-marker')) return;
        const x = pointerSvgX(e);
        if (x < PAD_X - 8 || x > SVG_W - PAD_X + 8) return;
        const v = _valueForX(x, cfg.rangeMin, cfg.rangeMax);
        let targetId;
        if (multi) {
            if (!activeTrayId) {
                announce('Pick a marker from the tray first.');
                return;
            }
            targetId = activeTrayId;
            activeTrayId = null;
        } else {
            targetId = markers[0].id;
        }
        placeMarker(targetId, v);
    });

    // ---- Tray click: pick up or drop ----
    if (tray) {
        tray.addEventListener('click', (e) => {
            if (locked) return;
            const btn = e.target.closest('.nle-tray-item');
            if (!btn || !tray.contains(btn)) return;
            const id = btn.dataset.id;
            const m = markers.find(mm => mm.id === id);
            if (!m || m.value !== null) return;
            activeTrayId = (activeTrayId === id) ? null : id;
            announce(activeTrayId ? `Picked up ${m.label || id}.` : 'Selection cleared.');
            refreshTray();
        });
    }

    // ---- Pointer drag on a marker (continuous w/ snap) ----
    function onPointerMove(e) {
        if (!dragging) return;
        const x = pointerSvgX(e);
        const v = _valueForX(x, cfg.rangeMin, cfg.rangeMax);
        const snapped = _snapValue(v, cfg.rangeMin, cfg.rangeMax, cfg.minorSnap);
        const m = markers.find(mm => mm.id === dragging.id);
        if (!m) return;
        if (m.value === snapped) return;
        m.value = snapped;
        _renderMarker(m);
        // Keep focus on the redrawn marker so arrow keys keep working.
        const newCircle = _markerEl(m.id)?.querySelector('.nle-marker');
        if (newCircle) newCircle.focus();
    }
    function onPointerUp(e) {
        if (!dragging) return;
        try { svg.releasePointerCapture(dragging.pointerId); } catch (_) { /* */ }
        const m = markers.find(mm => mm.id === dragging.id);
        if (m) announce(`${m.label ? m.label + ' moved' : 'Marker moved'} to ${valueText(m.value)}.`);
        dragging = null;
        refreshSubmit();
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    }
    svg.addEventListener('pointerdown', (e) => {
        if (locked) return;
        const circle = e.target.closest('.nle-marker');
        if (!circle) return;
        const g = circle.parentNode;
        if (!g) return;
        const id = g.getAttribute('data-marker-id');
        if (!id) return;
        e.preventDefault();
        circle.focus();
        dragging = { id, pointerId: e.pointerId };
        try { svg.setPointerCapture(e.pointerId); } catch (_) { /* */ }
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    });

    // ---- Arrow-key nudge ----
    svg.addEventListener('keydown', (e) => {
        if (locked) return;
        const circle = e.target.closest('.nle-marker');
        if (!circle) return;
        const g = circle.parentNode;
        if (!g) return;
        const id = g.getAttribute('data-marker-id');
        const m = markers.find(mm => mm.id === id);
        if (!m || m.value == null) return;
        const step = cfg.minorSnap > 0 ? cfg.minorSnap : (cfg.majorTickEvery || 1);
        let nv = m.value;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nv = m.value - step;
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') nv = m.value + step;
        else if (e.key === 'Home') nv = cfg.rangeMin;
        else if (e.key === 'End') nv = cfg.rangeMax;
        else return;
        e.preventDefault();
        const snapped = _snapValue(nv, cfg.rangeMin, cfg.rangeMax, cfg.minorSnap);
        if (snapped === m.value) return;
        m.value = snapped;
        _renderMarker(m);
        const fresh = _markerEl(m.id)?.querySelector('.nle-marker');
        if (fresh) fresh.focus();
        announce(`${m.label ? m.label + ' moved' : 'Marker moved'} to ${valueText(m.value)}.`);
        refreshSubmit();
    });

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        locked = true;
        submit.disabled = true;
        // Lock further interaction
        markerLayer.querySelectorAll('.nle-marker').forEach(el => {
            el.style.pointerEvents = 'none';
            el.setAttribute('tabindex', '-1');
        });
        if (tray) tray.querySelectorAll('.nle-tray-item').forEach(b => { b.disabled = true; });
        // Build state per the contract
        let st;
        if (multi) {
            st = {};
            markers.forEach(m => { st[m.id] = m.value; });
        } else {
            st = markers[0].value;
        }
        try { onNumberLineSubmit(q, st); }
        catch (err) { console.error('onNumberLineSubmit failed:', err); }
    });

    // Initial paint
    markers.forEach(_renderMarker);
    refreshTray();
    refreshSubmit();

    // Expose a flash helper for integrators.
    host._nleFlash = function (correctMap) {
        // correctMap: id → boolean OR (single mode) just a boolean
        markerLayer.querySelectorAll('.nle-marker-group').forEach(g => {
            const id = g.getAttribute('data-marker-id');
            const ok = (typeof correctMap === 'object' && correctMap !== null)
                ? !!correctMap[id]
                : !!correctMap;
            const c = g.querySelector('.nle-marker');
            if (c) c.classList.add(ok ? 'correct-flash' : 'wrong-flash');
        });
    };
}

export function checkNumberLineExtended(q, st) {
    if (!q) return false;
    const cfg = _normaliseQ(q);
    if (_isMultiMarker(q)) {
        if (!st || typeof st !== 'object') return false;
        for (const m of q.ans) {
            const v = st[m.id];
            if (v == null || !Number.isFinite(v)) return false;
            if (Math.abs(v - m.value) > cfg.tolerance + 1e-9) return false;
        }
        return true;
    }
    // Single
    if (st == null || !Number.isFinite(st)) return false;
    return Math.abs(st - q.ans) <= cfg.tolerance + 1e-9;
}

// Default no-op stub. The integration glue (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onNumberLineSubmit = function (_q, _state) { /* noop */ };

export function setOnNumberLineSubmit(fn) {
    if (typeof fn === 'function') onNumberLineSubmit = fn;
}
