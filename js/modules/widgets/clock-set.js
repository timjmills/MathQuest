// clock-set widget — interactive analog clock face. Student sets the time
// by dragging the hour/minute hands, clicking +/- buttons, or using the
// arrow keys when a hand is focused.
//
// Question contract:
//   q.answerType:    'clock-set'
//   q.ans:           { hour: 0..11, minute: 0..59 }   exact target time
//   q.initialHour:   optional starting hour (default 12 → stored as 0)
//   q.initialMinute: optional starting minute (default 0)
//   q.minuteSnap:    1 | 5 | 15  (default 5)
//   q.showDigital:   optional bool — render digital readout below the clock
//
// Pure module — no globals attached, no DOM mutation outside `container`.

const SVG_SIZE = 240;
const CENTER = SVG_SIZE / 2;          // 120
const RADIUS = 110;
const HOUR_HAND_LEN = 55;
const MIN_HAND_LEN = 88;

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

function _normHour(h) {
    h = ((h | 0) % 12 + 12) % 12;
    return h;
}

function _normMinute(m) {
    m = ((m | 0) % 60 + 60) % 60;
    return m;
}

function _displayHour(h) {
    // 12-hour clock; 0 is shown as 12.
    const d = h % 12;
    return d === 0 ? 12 : d;
}

function _formatTime(h, m) {
    const dh = _displayHour(h);
    return `${dh}:${m.toString().padStart(2, '0')}`;
}

function _hourAngleDeg(hour, minute) {
    // 0 deg = 12 o'clock, increasing clockwise.
    return (hour % 12) * 30 + (minute / 60) * 30;
}

function _minuteAngleDeg(minute) {
    return minute * 6;
}

// Build a hand line from center to (cx + len*cos(theta), cy + len*sin(theta))
// where theta is measured from 12 o'clock going clockwise.
function _handEnd(angleDeg, len) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
        x: CENTER + len * Math.cos(rad),
        y: CENTER + len * Math.sin(rad),
    };
}

// Convert a pointer position (relative to clock center, in SVG units) into a
// degree value [0, 360) measured from 12 o'clock going clockwise.
function _pointerAngle(dx, dy) {
    // atan2 returns radians from +x axis CCW. Convert to clockwise-from-north.
    let a = Math.atan2(dy, dx) * 180 / Math.PI; // -180..180, 0 = +x
    a = a + 90; // shift so 0 = +y down, no wait: 0 = -y means +y is +90, but we want 0 = up (-y)
    // Actually: in SVG, +y is DOWN. "12 o'clock" is at -y direction.
    // If dx=0, dy=-1 (straight up), atan2(-1, 0) = -90 deg. We want angle=0 there.
    // So angle = atan2(dy, dx) in deg + 90 → 0 at top, increases clockwise (since +x = right gives 90).
    a = (a % 360 + 360) % 360;
    return a;
}

function _snapMinute(angleDeg, snap) {
    // 360 deg = 60 min → 6 deg per min
    let m = angleDeg / 6;
    if (snap > 0) m = Math.round(m / snap) * snap;
    m = ((m % 60) + 60) % 60;
    if (m === 60) m = 0;
    return m;
}

function _hourFromAngle(angleDeg) {
    // 360 / 12 = 30 deg per hour. Round to nearest hour for the dial,
    // since hour-hand drag UX is "pick an hour".
    let h = Math.round(angleDeg / 30) % 12;
    if (h < 0) h += 12;
    return h;
}

export function renderClockSet(q, container) {
    if (!container || !q) return;
    const ans = (q.ans && typeof q.ans === 'object') ? q.ans : { hour: 0, minute: 0 };
    const minuteSnap = (q.minuteSnap === 1 || q.minuteSnap === 15) ? q.minuteSnap : 5;
    const showDigital = !!q.showDigital;
    const large = _largeTargets();

    let hour = (typeof q.initialHour === 'number') ? _normHour(q.initialHour) : 0;
    let minute = (typeof q.initialMinute === 'number') ? _normMinute(q.initialMinute) : 0;
    // Snap initial minute to the configured grain so +/- starts aligned.
    if (minuteSnap > 0) minute = _snapMinute(_minuteAngleDeg(minute), minuteSnap);

    // Build static clock face: outer circle, hour numerals, minute ticks.
    const numerals = [];
    for (let i = 1; i <= 12; i++) {
        const a = (i * 30 - 90) * Math.PI / 180;
        const r = RADIUS - 22;
        const x = CENTER + r * Math.cos(a);
        const y = CENTER + r * Math.sin(a);
        numerals.push(`<text class="cs-numeral" x="${x}" y="${y}">${i}</text>`);
    }
    const ticks = [];
    for (let i = 0; i < 60; i++) {
        const a = (i * 6 - 90) * Math.PI / 180;
        const isMajor = (i % 5 === 0);
        const r1 = isMajor ? RADIUS - 12 : RADIUS - 6;
        const r2 = RADIUS - 2;
        const x1 = CENTER + r1 * Math.cos(a);
        const y1 = CENTER + r1 * Math.sin(a);
        const x2 = CENTER + r2 * Math.cos(a);
        const y2 = CENTER + r2 * Math.sin(a);
        ticks.push(`<line class="cs-tick ${isMajor ? 'cs-tick-major' : 'cs-tick-minor'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`);
    }

    const digitalHtml = showDigital
        ? `<div class="cs-digital" data-role="digital">${_formatTime(hour, minute)}</div>`
        : '';

    container.innerHTML = `
        <div class="cs-host${large ? ' large' : ''}" role="application" aria-label="Set the clock to the target time">
            <svg class="cs-clock" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                <circle class="cs-face" cx="${CENTER}" cy="${CENTER}" r="${RADIUS}"/>
                ${ticks.join('')}
                ${numerals.join('')}
                <line data-hand="hour" class="cs-hand cs-hour"
                    x1="${CENTER}" y1="${CENTER}" x2="${CENTER}" y2="${CENTER - HOUR_HAND_LEN}"
                    tabindex="0" role="slider"
                    aria-label="Hour hand"
                    aria-valuemin="0" aria-valuemax="11"
                    aria-valuenow="${hour}" aria-valuetext="${_displayHour(hour)} o'clock"/>
                <line data-hand="minute" class="cs-hand cs-minute"
                    x1="${CENTER}" y1="${CENTER}" x2="${CENTER}" y2="${CENTER - MIN_HAND_LEN}"
                    tabindex="0" role="slider"
                    aria-label="Minute hand"
                    aria-valuemin="0" aria-valuemax="59"
                    aria-valuenow="${minute}" aria-valuetext="${minute} minutes"/>
                <circle class="cs-pivot" cx="${CENTER}" cy="${CENTER}" r="5"/>
            </svg>
            ${digitalHtml}
            <div class="cs-controls">
                <div class="cs-row" data-role="hour-row">
                    <span>Hour</span>
                    <button type="button" class="cs-btn" data-act="hour-down" aria-label="Decrease hour">&minus;</button>
                    <span class="cs-readout" data-role="hour-readout">${_displayHour(hour)}</span>
                    <button type="button" class="cs-btn" data-act="hour-up" aria-label="Increase hour">+</button>
                </div>
                <div class="cs-row" data-role="minute-row">
                    <span>Minute</span>
                    <button type="button" class="cs-btn" data-act="min-down" aria-label="Decrease minute">&minus;</button>
                    <span class="cs-readout" data-role="minute-readout">${minute.toString().padStart(2, '0')}</span>
                    <button type="button" class="cs-btn" data-act="min-up" aria-label="Increase minute">+</button>
                </div>
            </div>
            <div class="cs-live" aria-live="polite" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="cs-submit primary-btn">Submit</button>
        </div>
    `;

    const host = container.querySelector('.cs-host');
    const svg = container.querySelector('.cs-clock');
    const hourHand = container.querySelector('.cs-hand.cs-hour');
    const minuteHand = container.querySelector('.cs-hand.cs-minute');
    const hourReadout = container.querySelector('[data-role="hour-readout"]');
    const minuteReadout = container.querySelector('[data-role="minute-readout"]');
    const digitalEl = container.querySelector('[data-role="digital"]');
    const submit = container.querySelector('.cs-submit');
    const live = container.querySelector('.cs-live');
    const controls = container.querySelector('.cs-controls');

    let dragging = null;        // { hand: 'hour'|'minute', pointerId }
    let locked = false;

    function announce(msg) { if (live) live.textContent = msg; }

    function repaint() {
        const hAngle = _hourAngleDeg(hour, minute);
        const mAngle = _minuteAngleDeg(minute);
        const hEnd = _handEnd(hAngle, HOUR_HAND_LEN);
        const mEnd = _handEnd(mAngle, MIN_HAND_LEN);
        hourHand.setAttribute('x2', hEnd.x);
        hourHand.setAttribute('y2', hEnd.y);
        minuteHand.setAttribute('x2', mEnd.x);
        minuteHand.setAttribute('y2', mEnd.y);

        hourHand.setAttribute('aria-valuenow', String(hour));
        hourHand.setAttribute('aria-valuetext', `${_displayHour(hour)} o'clock`);
        minuteHand.setAttribute('aria-valuenow', String(minute));
        minuteHand.setAttribute('aria-valuetext', `${minute} minutes`);

        if (hourReadout) hourReadout.textContent = String(_displayHour(hour));
        if (minuteReadout) minuteReadout.textContent = minute.toString().padStart(2, '0');
        if (digitalEl) digitalEl.textContent = _formatTime(hour, minute);
    }

    function setHour(newHour, opts) {
        const prev = hour;
        hour = _normHour(newHour);
        repaint();
        if (!opts || !opts.silent) announce(`Hour set to ${_displayHour(hour)}.`);
        if (prev !== hour) { /* no-op */ }
    }

    function setMinute(newMinute, opts) {
        const prev = minute;
        minute = _normMinute(newMinute);
        repaint();
        if (!opts || !opts.silent) announce(`Minute set to ${minute}.`);
        if (prev !== minute) { /* no-op */ }
    }

    // Pointer → SVG coordinate mapping (handles responsive scaling).
    function pointerSvgPoint(evt) {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: CENTER, y: CENTER };
        const inv = ctm.inverse();
        const local = pt.matrixTransform(inv);
        return { x: local.x, y: local.y };
    }

    function onPointerMove(e) {
        if (!dragging) return;
        const p = pointerSvgPoint(e);
        const dx = p.x - CENTER;
        const dy = p.y - CENTER;
        if (dx === 0 && dy === 0) return;
        const angle = _pointerAngle(dx, dy);
        if (dragging.hand === 'hour') {
            const newHour = _hourFromAngle(angle);
            if (newHour !== hour) setHour(newHour, { silent: true });
        } else {
            const newMin = _snapMinute(angle, minuteSnap);
            if (newMin !== minute) setMinute(newMin, { silent: true });
        }
    }
    function onPointerUp(e) {
        if (!dragging) return;
        try { svg.releasePointerCapture(dragging.pointerId); } catch (_) { /* */ }
        const wasHour = dragging.hand === 'hour';
        dragging = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        announce(wasHour ? `Hour set to ${_displayHour(hour)}.` : `Minute set to ${minute}.`);
    }

    svg.addEventListener('pointerdown', (e) => {
        if (locked) return;
        const handEl = e.target.closest('.cs-hand');
        if (!handEl) return;
        e.preventDefault();
        handEl.focus();
        const which = handEl.dataset.hand === 'hour' ? 'hour' : 'minute';
        dragging = { hand: which, pointerId: e.pointerId };
        try { svg.setPointerCapture(e.pointerId); } catch (_) { /* */ }
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    });

    // Arrow keys on focused hand.
    svg.addEventListener('keydown', (e) => {
        if (locked) return;
        const handEl = e.target.closest('.cs-hand');
        if (!handEl) return;
        const isHour = handEl.dataset.hand === 'hour';
        let handled = true;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
            if (isHour) setHour(hour - 1); else setMinute(minute - minuteSnap);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
            if (isHour) setHour(hour + 1); else setMinute(minute + minuteSnap);
        } else if (e.key === 'Home') {
            if (isHour) setHour(0); else setMinute(0);
        } else if (e.key === 'End') {
            if (isHour) setHour(11); else setMinute(60 - minuteSnap);
        } else {
            handled = false;
        }
        if (handled) e.preventDefault();
    });

    // +/- buttons.
    controls.addEventListener('click', (e) => {
        if (locked) return;
        const btn = e.target.closest('.cs-btn');
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === 'hour-up') setHour(hour + 1);
        else if (act === 'hour-down') setHour(hour - 1);
        else if (act === 'min-up') setMinute(minute + minuteSnap);
        else if (act === 'min-down') setMinute(minute - minuteSnap);
    });

    submit.addEventListener('click', () => {
        if (locked) return;
        locked = true;
        submit.disabled = true;
        // Lock further interaction.
        hourHand.style.pointerEvents = 'none';
        minuteHand.style.pointerEvents = 'none';
        hourHand.setAttribute('tabindex', '-1');
        minuteHand.setAttribute('tabindex', '-1');
        controls.querySelectorAll('.cs-btn').forEach(b => { b.disabled = true; });
        const st = { hour, minute };
        try { onClockSetSubmit(q, st); }
        catch (err) { console.error('onClockSetSubmit failed:', err); }
    });

    // Initial paint
    repaint();

    // Expose a flash helper for integrators.
    host._csFlash = function (correct) {
        const clock = container.querySelector('.cs-clock');
        if (!clock) return;
        clock.classList.add(correct ? 'flash-correct' : 'flash-wrong');
    };
}

export function checkClockSet(q, st) {
    if (!q || !q.ans || !st || typeof st !== 'object') return false;
    const want = q.ans;
    const wantH = _normHour(want.hour);
    const wantM = _normMinute(want.minute);
    const gotH = _normHour(st.hour);
    const gotM = _normMinute(st.minute);
    return wantH === gotH && wantM === gotM;
}

// Default no-op stub. The integration glue (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onClockSetSubmit = function (_q, _state) { /* noop */ };

export function setOnClockSetSubmit(fn) {
    if (typeof fn === 'function') onClockSetSubmit = fn;
}
