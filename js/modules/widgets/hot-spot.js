// hot-spot widget — invisible polygon/rect/circle overlays on a background
// SVG (or image). Student clicks one or more regions to select them.
//
// Question contract:
//   q.backgroundSvg:   inline SVG markup (preferred); viewBox defines coords
//   q.backgroundImage: optional raster URL/data-URL (used if no backgroundSvg)
//   q.viewBox:         optional "minX minY w h" string when image is used
//   q.hotSpots:        [{ id, shape, ...geom, label }]
//                      shape ∈ 'rect' | 'circle' | 'polygon'
//                      rect:    {x, y, w, h}
//                      circle:  {cx, cy, r}
//                      polygon: {points: "x1,y1 x2,y2 ..."}
//   q.selectMode:      'single' | 'multi'  (default 'multi')
//   q.ans:             array of correct hot-spot IDs (multi)  OR  string ID (single)
//
// Pure module — no globals attached, no DOM mutation outside `container`.

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

// Pull the viewBox attribute out of inline SVG markup so we can mirror it in
// the overlay. Falls back to "0 0 400 300".
function _extractViewBox(svgMarkup) {
    if (!svgMarkup || typeof svgMarkup !== 'string') return '0 0 400 300';
    const m = svgMarkup.match(/<svg\b[^>]*\bviewBox\s*=\s*"([^"]+)"/i)
        || svgMarkup.match(/<svg\b[^>]*\bviewBox\s*=\s*'([^']+)'/i);
    if (m && m[1]) return m[1].trim();
    // Try to fall back to width/height attributes
    const w = svgMarkup.match(/<svg\b[^>]*\bwidth\s*=\s*"?(\d+)"?/i);
    const h = svgMarkup.match(/<svg\b[^>]*\bheight\s*=\s*"?(\d+)"?/i);
    if (w && h) return `0 0 ${w[1]} ${h[1]}`;
    return '0 0 400 300';
}

function _renderRegion(spot) {
    if (!spot || !spot.id || !spot.shape) return '';
    const id = _esc(spot.id);
    const label = _esc(spot.label || `Region ${spot.id}`);
    const common = `class="hs-region" data-id="${id}" tabindex="0" role="button" aria-label="${label}" aria-pressed="false" fill="rgba(255, 235, 59, 0)" stroke="transparent" stroke-width="3"`;

    if (spot.shape === 'rect') {
        const x = +spot.x || 0, y = +spot.y || 0, w = +spot.w || 0, h = +spot.h || 0;
        return `<rect ${common} x="${x}" y="${y}" width="${w}" height="${h}"></rect>`;
    }
    if (spot.shape === 'circle') {
        const cx = +spot.cx || 0, cy = +spot.cy || 0, r = +spot.r || 0;
        return `<circle ${common} cx="${cx}" cy="${cy}" r="${r}"></circle>`;
    }
    if (spot.shape === 'polygon') {
        const points = _esc(spot.points || '');
        return `<polygon ${common} points="${points}"></polygon>`;
    }
    return '';
}

export function renderHotSpot(q, container) {
    if (!container || !q || !Array.isArray(q.hotSpots)) return;

    const mode = (q.selectMode === 'single') ? 'single' : 'multi';
    const total = q.hotSpots.length;
    const large = _largeTargets();
    const hostClass = large ? 'hs-host large' : 'hs-host';

    const viewBox = q.backgroundSvg
        ? _extractViewBox(q.backgroundSvg)
        : (q.viewBox || '0 0 400 300');

    const bgHtml = q.backgroundSvg
        ? `<div class="hs-bg-wrap">${q.backgroundSvg}</div>`
        : (q.backgroundImage
            ? `<img class="hs-bg" src="${_esc(q.backgroundImage)}" alt="" draggable="false">`
            : '');

    const regionsHtml = q.hotSpots.map(_renderRegion).join('');

    const counterHtml = (mode === 'multi')
        ? `<div class="hs-counter" aria-live="polite">0 of ${total} selected</div>`
        : `<div class="hs-counter" aria-live="polite">No region selected.</div>`;

    container.innerHTML = `
        <div class="${hostClass}" role="application" aria-label="Click hot spots to select">
            <div class="hs-stage">
                ${bgHtml}
                <svg class="hs-overlay" viewBox="${_esc(viewBox)}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                    ${regionsHtml}
                </svg>
            </div>
            ${counterHtml}
            <button type="button" class="hs-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const host = container.querySelector('.hs-host');
    const overlay = container.querySelector('.hs-overlay');
    const counter = container.querySelector('.hs-counter');
    const submit = container.querySelector('.hs-submit');
    let locked = false;

    function getSelected() {
        return Array.from(overlay.querySelectorAll('.hs-region.selected')).map(el => el.dataset.id);
    }

    function refresh() {
        const sel = getSelected();
        if (mode === 'multi') {
            counter.textContent = `${sel.length} of ${total} selected`;
            submit.disabled = sel.length < 1;
        } else {
            counter.textContent = sel.length === 1
                ? `Region selected.`
                : `No region selected.`;
            submit.disabled = sel.length !== 1;
        }
    }

    function clearAllSelections() {
        overlay.querySelectorAll('.hs-region.selected').forEach(el => {
            el.classList.remove('selected');
            el.setAttribute('aria-pressed', 'false');
        });
    }

    function spotLabel(el) {
        return el.getAttribute('aria-label') || el.dataset.id || '';
    }

    function announce(msg) {
        // The counter has aria-live=polite; mutate it to push the message out.
        counter.textContent = msg;
    }

    function toggleRegion(el) {
        if (locked) return;
        if (mode === 'single') {
            const wasSelected = el.classList.contains('selected');
            clearAllSelections();
            if (!wasSelected) {
                el.classList.add('selected');
                el.setAttribute('aria-pressed', 'true');
                announce(`${spotLabel(el)} selected.`);
            } else {
                announce('Selection cleared.');
            }
        } else {
            const isOn = el.classList.toggle('selected');
            el.setAttribute('aria-pressed', isOn ? 'true' : 'false');
            announce(`${spotLabel(el)} ${isOn ? 'selected' : 'deselected'}.`);
        }
        // After announce, restore the canonical counter readout shortly.
        // (Browsers re-announce aria-live on text mutations.)
        setTimeout(refresh, 50);
    }

    overlay.addEventListener('click', (e) => {
        const region = e.target.closest('.hs-region');
        if (!region || !overlay.contains(region)) return;
        toggleRegion(region);
    });

    overlay.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const region = e.target.closest('.hs-region');
        if (!region || !overlay.contains(region)) return;
        e.preventDefault();
        toggleRegion(region);
    });

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        const sel = getSelected();
        locked = true;
        submit.disabled = true;
        // Lock further interaction
        overlay.querySelectorAll('.hs-region').forEach(el => {
            el.style.pointerEvents = 'none';
            el.setAttribute('tabindex', '-1');
        });
        try { onHotSpotSubmit(q, sel); }
        catch (err) { console.error('onHotSpotSubmit failed:', err); }
    });

    refresh();
}

export function checkHotSpot(q, selectedIds) {
    if (!q) return false;
    const mode = (q.selectMode === 'single') ? 'single' : 'multi';
    if (mode === 'single') {
        // Either ans is a string ID or single-element array
        const ansId = Array.isArray(q.ans) ? q.ans[0] : q.ans;
        if (!Array.isArray(selectedIds) || selectedIds.length !== 1) return false;
        return selectedIds[0] === ansId;
    }
    // multi: set equality
    if (!Array.isArray(selectedIds) || !Array.isArray(q.ans)) return false;
    if (selectedIds.length !== q.ans.length) return false;
    const setA = new Set(selectedIds);
    for (const id of q.ans) if (!setA.has(id)) return false;
    return true;
}

// Default no-op stub. The integration glue (question-render.js) replaces this
// per-mount with a handler that flashes feedback and routes the result.
export let onHotSpotSubmit = function (_q, _selectedIds) { /* noop */ };

export function setOnHotSpotSubmit(fn) {
    if (typeof fn === 'function') onHotSpotSubmit = fn;
}
