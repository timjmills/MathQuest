// place-symmetry-lines widget — student is shown ONE shape with a set of
// faint dashed CANDIDATE lines through its center. Clicking any candidate
// toggles it ON (solid + colored) / OFF (faint dashed). The student must
// select EXACTLY the correct N lines of symmetry, then press Submit.
//
// Question contract:
//   q.shapeSvg:        inline SVG markup of the shape (fill + outline only,
//                      no symmetry lines). MUST include a viewBox.
//   q.candidateAngles: array of angles (deg) for ALL candidate lines drawn
//                      across the shape's center (e.g. [0, 30, 45, 60, 90, ...]).
//   q.center:          { cx, cy } center of rotation for the candidate lines.
//   q.lineLength:      half-length of each candidate line (drawn from center
//                      outward in BOTH directions). Pick large enough to
//                      span the shape's bounding box plus a small overhang.
//   q.ans:             array of correct angles (deg). Must be a subset of
//                      q.candidateAngles. Order doesn't matter for checking.
//   q.symLines:        N — the number of correct lines (so we can show
//                      "X of N selected" to the student).
//
// Pure module — no globals attached, no DOM mutation outside `container`.

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _extractViewBox(svgMarkup) {
    if (!svgMarkup || typeof svgMarkup !== 'string') return '0 0 240 200';
    const m = svgMarkup.match(/<svg\b[^>]*\bviewBox\s*=\s*"([^"]+)"/i)
        || svgMarkup.match(/<svg\b[^>]*\bviewBox\s*=\s*'([^']+)'/i);
    if (m && m[1]) return m[1].trim();
    return '0 0 240 200';
}

function _angleEndpoints(cx, cy, angleDeg, halfLen) {
    // angle measured from horizontal (0 = right), CSS-y convention (down +).
    // We negate sin so the line "rotates the way you expect" visually.
    const rad = angleDeg * Math.PI / 180;
    const dx = Math.cos(rad) * halfLen;
    const dy = -Math.sin(rad) * halfLen;
    return { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy };
}

function _renderCandidate(angle, cx, cy, halfLen) {
    const { x1, y1, x2, y2 } = _angleEndpoints(cx, cy, angle, halfLen);
    const id = `a${Math.round(angle)}`;
    // Two stacked lines: a wide invisible click target underneath, then the
    // visible faint dashed line on top. Both inside a <g class="psl-cand">
    // so the whole pair toggles together.
    return `<g class="psl-cand" data-id="${id}" data-angle="${angle}" tabindex="0" role="button" aria-label="Symmetry line at ${Math.round(angle)} degrees" aria-pressed="false">
        <line class="psl-hit" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="rgba(0,0,0,0.001)" stroke-width="22" stroke-linecap="round"></line>
        <line class="psl-line" x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="#90a4ae" stroke-width="1.5" stroke-dasharray="6,4" stroke-linecap="round"></line>
    </g>`;
}

export function renderPlaceSymmetryLines(q, container) {
    if (!container || !q || !Array.isArray(q.candidateAngles)) return;

    const total = q.symLines || (Array.isArray(q.ans) ? q.ans.length : 1);
    const cx = (q.center && q.center.cx) != null ? q.center.cx : 120;
    const cy = (q.center && q.center.cy) != null ? q.center.cy : 100;
    const halfLen = q.lineLength || 100;
    const viewBox = _extractViewBox(q.shapeSvg);

    const shapeInner = (q.shapeSvg || '').replace(/^[\s\S]*?<svg[^>]*>/i, '').replace(/<\/svg>\s*$/i, '');
    const candidatesHtml = q.candidateAngles.map(a => _renderCandidate(a, cx, cy, halfLen)).join('');

    container.innerHTML = `
        <div class="psl-host" role="application" aria-label="Click candidate lines to mark the lines of symmetry">
            <div class="psl-stage">
                <svg class="psl-svg" viewBox="${_esc(viewBox)}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
                    ${shapeInner}
                    ${candidatesHtml}
                </svg>
            </div>
            <div class="psl-counter" aria-live="polite">0 of ${total} lines drawn</div>
            <button type="button" class="psl-submit primary-btn" disabled>Submit</button>
        </div>
    `;

    const svg = container.querySelector('.psl-svg');
    const counter = container.querySelector('.psl-counter');
    const submit = container.querySelector('.psl-submit');
    let locked = false;

    function getSelectedAngles() {
        return Array.from(svg.querySelectorAll('.psl-cand.selected'))
            .map(el => Number(el.dataset.angle));
    }

    function refresh() {
        const sel = getSelectedAngles();
        counter.textContent = `${sel.length} of ${total} lines drawn`;
        // Allow submit when EXACTLY N are selected.
        submit.disabled = sel.length !== total;
    }

    function toggleCandidate(g) {
        if (locked) return;
        const isOn = g.classList.toggle('selected');
        g.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        // Recolor the visible line.
        const line = g.querySelector('.psl-line');
        if (line) {
            if (isOn) {
                line.setAttribute('stroke', '#e53935');
                line.setAttribute('stroke-width', '3');
                line.removeAttribute('stroke-dasharray');
            } else {
                line.setAttribute('stroke', '#90a4ae');
                line.setAttribute('stroke-width', '1.5');
                line.setAttribute('stroke-dasharray', '6,4');
            }
        }
        refresh();
    }

    svg.addEventListener('click', (e) => {
        const g = e.target.closest('.psl-cand');
        if (!g || !svg.contains(g)) return;
        toggleCandidate(g);
    });

    svg.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const g = e.target.closest('.psl-cand');
        if (!g || !svg.contains(g)) return;
        e.preventDefault();
        toggleCandidate(g);
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        svg.querySelectorAll('.psl-cand').forEach(g => {
            g.style.pointerEvents = 'none';
            g.setAttribute('tabindex', '-1');
        });
    }
    function unlockForRetry(wrongAngles) {
        locked = false;
        svg.querySelectorAll('.psl-cand').forEach(g => {
            g.style.pointerEvents = '';
            g.setAttribute('tabindex', '0');
        });
        // Reset ONLY the wrongly-selected lines back to dashed/unselected so
        // the student can re-evaluate. Correctly-selected lines stay solid.
        if (Array.isArray(wrongAngles) && wrongAngles.length) {
            const wrongSet = new Set(wrongAngles.map(a => Math.round(Number(a))));
            svg.querySelectorAll('.psl-cand.selected').forEach(g => {
                const a = Math.round(Number(g.dataset.angle));
                if (wrongSet.has(a)) {
                    g.classList.remove('selected');
                    g.setAttribute('aria-pressed', 'false');
                    const line = g.querySelector('.psl-line');
                    if (line) {
                        line.setAttribute('stroke', '#90a4ae');
                        line.setAttribute('stroke-width', '1.5');
                        line.setAttribute('stroke-dasharray', '6,4');
                    }
                }
            });
        }
        refresh();
    }
    container._pslLock = lockWidget;
    container._pslUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        const selected = getSelectedAngles();
        // Briefly disable while integration evaluates; integration may
        // re-enable via container._pslUnlockForRetry on a wrong submit.
        submit.disabled = true;
        try { onPlaceSymmetryLinesSubmit(q, selected); }
        catch (err) { console.error('onPlaceSymmetryLinesSubmit failed:', err); }
    });

    refresh();
}

export function checkPlaceSymmetryLines(q, selectedAngles) {
    if (!q || !Array.isArray(q.ans) || !Array.isArray(selectedAngles)) return false;
    if (selectedAngles.length !== q.ans.length) return false;
    // Compare as sets, normalized to integers (avoid float jitter).
    const setSel = new Set(selectedAngles.map(a => Math.round(Number(a))));
    for (const a of q.ans) {
        if (!setSel.has(Math.round(Number(a)))) return false;
    }
    return true;
}

export let onPlaceSymmetryLinesSubmit = function (_q, _selectedAngles) { /* noop */ };

export function setOnPlaceSymmetryLinesSubmit(fn) {
    if (typeof fn === 'function') onPlaceSymmetryLinesSubmit = fn;
}
