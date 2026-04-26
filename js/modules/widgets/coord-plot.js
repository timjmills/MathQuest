// coord-plot widget — interactive click-to-place coordinate grid.
//
// Student clicks on intersections (lattice points) to place dots. Clicking
// an existing dot REMOVES it (toggle). The set of placed points is compared
// to q.ans on Submit. After submit, correctly-placed dots turn GREEN, any
// wrong placements turn RED, and any expected-but-missing points turn AMBER.
//
// Question contract:
//   q.ans:           {x, y} (single point) OR [{x, y, label?}, ...] (multi-point)
//   q.coordinateData.quadrantMode: "quadrant1" | "all_quadrants"
//   q.coordinateData.maxCoord:     bound (e.g. 10 for Q1, 5 for all-quadrants)
//   q.coordinateData.targetLabels: optional [labelStr,...] one per expected
//                                  point, shown in the prompt sidebar
//
// Pure module — no side effects until renderCoordPlot is invoked. Exposes a
// settable onCoordPlotSubmit hook so question-render.js can wire game-state
// updates without the widget importing answer-check directly.

const KEY = (x, y) => `${x},${y}`;
const PARSE = (k) => k.split(',').map(Number);

function _largeTargets() {
    try {
        return !!(window.state && window.state.mapFeatures && window.state.mapFeatures.largeTargets);
    } catch (e) { return false; }
}

// Build SVG markup for the empty grid (lines, axes, labels). Returns a string;
// the lattice-click hit targets and dot layer are appended live.
function buildGridSVG(quadrantMode, maxCoord, gridSpacing, gridSize, origin, large) {
    const labelStep = maxCoord > 12 ? 4 : maxCoord > 8 ? 2 : 2;
    const labelFontSize = maxCoord > 12 ? 8 : 10;
    let gridLines = '';
    let axisLabels = '';

    if (quadrantMode === 'quadrant1') {
        for (let i = 0; i <= maxCoord; i++) {
            gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#cfd8dc" stroke-width="0.75"/>`;
            gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#cfd8dc" stroke-width="0.75"/>`;
            if (i % labelStep === 0) {
                axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 15}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize}">${i}</text>`;
                if (i > 0) axisLabels += `<text x="${origin.x - 12}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize}">${i}</text>`;
            }
        }
    } else {
        for (let i = -maxCoord; i <= maxCoord; i++) {
            gridLines += `<line x1="${origin.x + i * gridSpacing}" y1="10" x2="${origin.x + i * gridSpacing}" y2="${gridSize - 10}" stroke="#cfd8dc" stroke-width="0.75"/>`;
            gridLines += `<line x1="10" y1="${origin.y - i * gridSpacing}" x2="${gridSize - 10}" y2="${origin.y - i * gridSpacing}" stroke="#cfd8dc" stroke-width="0.75"/>`;
            if (i % labelStep === 0 || i === 0) {
                axisLabels += `<text x="${origin.x + i * gridSpacing}" y="${origin.y + 15}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize - 1}">${i}</text>`;
                if (i !== 0) axisLabels += `<text x="${origin.x - 12}" y="${origin.y - i * gridSpacing + 4}" text-anchor="middle" fill="currentColor" font-size="${labelFontSize - 1}">${i}</text>`;
            }
        }
    }

    const axes = `
        <line x1="${quadrantMode === 'quadrant1' ? origin.x : 10}" y1="${origin.y}" x2="${gridSize - 10}" y2="${origin.y}" stroke="currentColor" stroke-width="2"/>
        <line x1="${origin.x}" y1="${quadrantMode === 'quadrant1' ? gridSize - 10 : 10}" x2="${origin.x}" y2="10" stroke="currentColor" stroke-width="2"/>
        <text x="${gridSize - 8}" y="${origin.y - 8}" fill="currentColor" font-size="12" font-weight="bold">x</text>
        <text x="${origin.x + 8}" y="18" fill="currentColor" font-size="12" font-weight="bold">y</text>
    `;

    // Build invisible click hit-targets at every lattice intersection.
    // Each <circle> has data-x / data-y; pointer-events:all so clicks register
    // even when the circle has fill:transparent.
    const hitR = large ? 14 : 10;
    let hitTargets = '';
    const lo = quadrantMode === 'quadrant1' ? 0 : -maxCoord;
    for (let x = lo; x <= maxCoord; x++) {
        for (let y = lo; y <= maxCoord; y++) {
            const cx = origin.x + x * gridSpacing;
            const cy = origin.y - y * gridSpacing;
            hitTargets += `<circle class="cp-hit" data-x="${x}" data-y="${y}" cx="${cx}" cy="${cy}" r="${hitR}" fill="transparent" style="cursor:pointer;" />`;
        }
    }

    return `<g class="cp-grid">${gridLines}${axes}${axisLabels}</g><g class="cp-hits">${hitTargets}</g><g class="cp-dots"></g>`;
}

export function renderCoordPlot(q, container) {
    if (!container || !q) return;
    const data = q.coordinateData || {};
    const quadrantMode = data.quadrantMode || 'quadrant1';
    const ansArr = Array.isArray(q.ans)
        ? q.ans.map(p => ({ x: p.x, y: p.y, label: p.label }))
        : [{ x: q.ans.x, y: q.ans.y, label: 'A' }];

    const expectedSet = new Set(ansArr.map(p => KEY(p.x, p.y)));

    const maxCoord = data.maxCoord
        || Math.max(10, Math.max(...ansArr.flatMap(p => [Math.abs(p.x), Math.abs(p.y)])) + 2);
    // Slightly smaller scale than original — was 280, now 220 — so the grid
    // doesn't dominate the viewport.
    const gridSpacing = Math.max(18, Math.floor(220 / maxCoord));
    const gridSize = quadrantMode === 'quadrant1'
        ? maxCoord * gridSpacing + 40
        : maxCoord * 2 * gridSpacing + 40;
    const origin = quadrantMode === 'quadrant1'
        ? { x: 20, y: gridSize - 20 }
        : { x: gridSize / 2, y: gridSize / 2 };

    const large = _largeTargets();
    const inner = buildGridSVG(quadrantMode, maxCoord, gridSpacing, gridSize, origin, large);

    // Prompt sidebar: list of points to plot, with a tally of placed/expected.
    const promptItems = ansArr.map((p, i) => {
        const lbl = p.label || String.fromCharCode(65 + i);
        return `<li class="cp-target" data-target="${KEY(p.x, p.y)}"><span class="cp-target-label">${lbl}</span><span class="cp-target-coord">(${p.x}, ${p.y})</span></li>`;
    }).join('');

    container.innerHTML = `
        <div class="cp-host cp-stacked">
            <div class="cp-side cp-side-top">
                <div class="cp-side-title">Plot these points:</div>
                <ul class="cp-target-list cp-target-list-row">${promptItems}</ul>
            </div>
            <div class="cp-grid-wrap">
                <svg class="cp-svg" width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}" style="-webkit-print-color-adjust:exact;print-color-adjust:exact;">
                    ${inner}
                </svg>
            </div>
            <div class="cp-side cp-side-bottom">
                <div class="cp-counter" aria-live="polite">0 of ${ansArr.length} placed</div>
                <div class="cp-actions">
                    <button type="button" class="cp-clear">Clear</button>
                    <button type="button" class="cp-submit primary-btn">Submit</button>
                </div>
                <div class="cp-hint">Click an intersection to place a point. Click an existing point to remove it.</div>
            </div>
        </div>
    `;

    const svg = container.querySelector('.cp-svg');
    const dotsLayer = container.querySelector('.cp-dots');
    const hitsLayer = container.querySelector('.cp-hits');
    const counter = container.querySelector('.cp-counter');
    const submitBtn = container.querySelector('.cp-submit');
    const clearBtn = container.querySelector('.cp-clear');

    // The set of placed points (keys = "x,y").
    const placed = new Set();
    let locked = false;

    function repaint() {
        // Re-render dots from `placed`. Each dot carries data-x / data-y so
        // it can also be clicked to remove (in addition to lattice hit toggle).
        // Dots stay BELOW the hit layer (dotsLayer is appended first in DOM
        // order — see buildGridSVG) so the hit circles receive the click
        // first; the hit handler reads `placed` and toggles. This keeps a
        // single click path and avoids double-fire.
        let html = '';
        const dotR = large ? 9 : 7;
        placed.forEach(k => {
            const [x, y] = PARSE(k);
            const cx = origin.x + x * gridSpacing;
            const cy = origin.y - y * gridSpacing;
            const isExpected = expectedSet.has(k);
            // Default styling (pre-submit): solid blue.
            // After submit (locked): green if expected, red if not.
            let fill = '#1e88e5';
            let stroke = '#0d47a1';
            if (locked) {
                if (isExpected) { fill = '#43a047'; stroke = '#1b5e20'; }
                else { fill = '#e53935'; stroke = '#b71c1c'; }
            }
            html += `<circle class="cp-dot" data-x="${x}" data-y="${y}" cx="${cx}" cy="${cy}" r="${dotR}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
        });
        // After submit, also render any MISSING expected points as amber rings.
        if (locked) {
            expectedSet.forEach(k => {
                if (!placed.has(k)) {
                    const [x, y] = PARSE(k);
                    const cx = origin.x + x * gridSpacing;
                    const cy = origin.y - y * gridSpacing;
                    html += `<circle class="cp-dot cp-missing" cx="${cx}" cy="${cy}" r="${(large ? 9 : 7) + 3}" fill="none" stroke="#ff9800" stroke-width="3" stroke-dasharray="4,3" />`;
                }
            });
        }
        dotsLayer.innerHTML = html;
        counter.textContent = `${placed.size} of ${ansArr.length} placed`;
        // Highlight target list rows that have been placed.
        container.querySelectorAll('.cp-target').forEach(li => {
            li.classList.toggle('cp-target-placed', placed.has(li.dataset.target));
        });
    }

    // Click any lattice intersection to toggle a dot at (x, y).
    hitsLayer.addEventListener('click', (e) => {
        if (locked) return;
        const hit = e.target.closest('.cp-hit');
        if (!hit) return;
        const x = parseInt(hit.dataset.x, 10);
        const y = parseInt(hit.dataset.y, 10);
        if (Number.isNaN(x) || Number.isNaN(y)) return;
        const k = KEY(x, y);
        if (placed.has(k)) placed.delete(k); else placed.add(k);
        repaint();
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        placed.clear();
        repaint();
    });

    function submit() {
        if (locked) return;
        // Briefly lock during the integration's evaluation. Integration may
        // call container._cpUnlockForRetry to re-enable for in-place correction.
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        repaint();
        try { onCoordPlotSubmit(q, Array.from(placed).map(PARSE).map(([x, y]) => ({ x, y }))); }
        catch (err) { console.error('onCoordPlotSubmit failed:', err); }
    }

    submitBtn.addEventListener('click', submit);

    // Expose a way to FORCE-submit (used by nextQuestion auto-mark-wrong path).
    container._cpForceSubmit = () => {
        if (locked) return;
        submit();
    };
    container._cpIsLocked = () => locked;
    container._cpHasAnyPlaced = () => placed.size > 0;

    // Lock keeps the grid frozen post-success (called by integration).
    container._cpLock = () => {
        locked = true;
        submitBtn.disabled = true;
        clearBtn.disabled = true;
        repaint();
    };
    // Unlock removes wrongly-placed dots and re-enables click input. Correct
    // dots stay; the student fixes the wrong ones and re-submits.
    container._cpUnlockForRetry = () => {
        // Strip placements that are NOT in the expected set (the wrong dots).
        const toRemove = [];
        placed.forEach(k => { if (!expectedSet.has(k)) toRemove.push(k); });
        toRemove.forEach(k => placed.delete(k));
        locked = false;
        submitBtn.disabled = false;
        clearBtn.disabled = false;
        repaint();
    };

    repaint();
}

// Returns true if the placed set EXACTLY matches q.ans (ignores order).
export function checkCoordPlot(q, placedPoints) {
    if (!q) return false;
    const ansArr = Array.isArray(q.ans) ? q.ans : [q.ans];
    const exp = new Set(ansArr.map(p => KEY(p.x, p.y)));
    const got = new Set((placedPoints || []).map(p => KEY(p.x, p.y)));
    if (exp.size !== got.size) return false;
    let allMatch = true;
    exp.forEach(k => { if (!got.has(k)) allMatch = false; });
    return allMatch;
}

export let onCoordPlotSubmit = function (_q, _points) { /* noop */ };
export function setOnCoordPlotSubmit(fn) {
    if (typeof fn === 'function') onCoordPlotSubmit = fn;
}
