// graph-builder widget — interactive bar graph + pictograph builder for K-3.
//
// Student is shown a target dataset (categories + values) and must adjust each
// category's bar height (or pictograph row length) to match the target value
// using clickable +/- buttons. A live counter shows the current value beside
// each row. Submit auto-enables once at least one bar/icon row is non-zero;
// correctness is "every category's current value === target value".
//
// Question contract:
//   q.graphType:     'bar' | 'pictograph'
//   q.targetData:    [{ label, value, icon? }]   icon used for pictograph rows
//   q.maxValue:      max value the student can build (axis ceiling, default
//                    = ceil(max(targetValues)) + 2, capped to 12 for picto, 20 for bar)
//   q.text:          prompt
//   q.hint:          optional hint
//
// Pure module — no globals attached, no DOM mutation outside `container`.
// Mirrors the ten-frame-build / pv-disks-build integration pattern: exposes a
// settable `onGraphBuilderSubmit` hook + `_gbLock` / `_gbUnlockForRetry` on
// the host element so the question-render pipeline can lock or retry.

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Categorical fill palette (IXL-aligned, gentle & high-contrast).
const BAR_COLORS = ['#1976d2', '#43a047', '#fb8c00', '#8e24aa', '#e53935', '#00897b'];

export function renderGraphBuilder(q, container) {
    if (!container || !q) return;
    const graphType = (q.graphType === 'pictograph') ? 'pictograph' : 'bar';
    const targetData = Array.isArray(q.targetData) ? q.targetData : [];
    if (!targetData.length) {
        container.innerHTML = '<div style="padding:12px;color:#c62828;">Graph builder: no target data.</div>';
        return;
    }
    const maxTarget = targetData.reduce((m, d) => Math.max(m, d.value | 0), 0);
    const cap = (graphType === 'pictograph') ? 12 : 20;
    const maxValue = Math.min(cap, Math.max(q.maxValue | 0, maxTarget + 2));

    const promptText = q.text || (graphType === 'pictograph'
        ? 'Build the pictograph to match the data.'
        : 'Build the bar graph to match the data.');

    // Show the target data table at the top so student knows what to build.
    const targetListHtml = targetData.map(d =>
        `<span style="display:inline-block;background:#e3f2fd;border:2px solid #1565c0;
            border-radius:8px;padding:4px 10px;margin:3px;font-weight:700;color:#0d47a1;
            font-size:0.95rem;">${_esc(d.label)} = ${d.value}</span>`
    ).join(' ');

    // Build category rows: each has -, current value, +, then bar/pictograph view.
    const numCats = targetData.length;

    // Bar graph layout: vertical bars in a single SVG with axis + gridlines.
    // Pictograph layout: horizontal rows of icons (HTML, easier to update).

    let mainHtml = '';
    if (graphType === 'bar') {
        const W = Math.max(360, 90 * numCats + 80);
        const H = 260;
        const padL = 50, padR = 20, padT = 20, padB = 60;
        const usableH = H - padT - padB;
        const usableW = W - padL - padR;
        const barW = Math.min(64, (usableW / numCats) * 0.7);
        const slot = usableW / numCats;
        const yFor = (v) => padT + usableH - (v / maxValue) * usableH;

        // Gridlines + Y-axis labels (every 1 if max <= 10, else every 2).
        const step = maxValue <= 10 ? 1 : 2;
        let gridSvg = '';
        for (let v = 0; v <= maxValue; v += step) {
            const y = yFor(v);
            gridSvg += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}"
                stroke="#ddd" stroke-width="1"/>`;
            gridSvg += `<text x="${padL - 6}" y="${y + 4}" font-size="11"
                text-anchor="end" fill="#333">${v}</text>`;
        }
        // Axes
        gridSvg += `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + usableH}"
            stroke="#333" stroke-width="2"/>`;
        gridSvg += `<line x1="${padL}" y1="${padT + usableH}" x2="${W - padR}" y2="${padT + usableH}"
            stroke="#333" stroke-width="2"/>`;

        // Bars + category labels (initial value = 0)
        let barsSvg = '';
        let labelsSvg = '';
        targetData.forEach((d, i) => {
            const cx = padL + slot * i + slot / 2;
            const x = cx - barW / 2;
            const color = BAR_COLORS[i % BAR_COLORS.length];
            barsSvg += `<rect class="gb-bar" data-cat-idx="${i}" data-current="0"
                x="${x}" y="${padT + usableH}" width="${barW}" height="0"
                fill="${color}" stroke="#000" stroke-width="1.5"
                rx="2" ry="2"></rect>`;
            // Value label above bar
            barsSvg += `<text class="gb-bar-val" data-cat-idx="${i}"
                x="${cx}" y="${padT + usableH - 4}" font-size="13" font-weight="700"
                text-anchor="middle" fill="#222">0</text>`;
            // Category name below axis
            labelsSvg += `<text x="${cx}" y="${padT + usableH + 18}"
                font-size="12" font-weight="600" text-anchor="middle" fill="#333">${_esc(d.label)}</text>`;
        });

        // Y-axis title
        const yTitleSvg = `<text x="${padL - 32}" y="${padT + usableH / 2}"
            font-size="11" font-weight="700" text-anchor="middle" fill="#555"
            transform="rotate(-90 ${padL - 32} ${padT + usableH / 2})">Count</text>`;

        mainHtml = `<svg class="gb-svg" viewBox="0 0 ${W} ${H}" width="100%"
            style="max-width:${W}px;display:block;margin:0 auto;background:#fff;
                   border:2px solid #ccc;border-radius:8px;">
            ${gridSvg}
            ${barsSvg}
            ${labelsSvg}
            ${yTitleSvg}
        </svg>`;
    } else {
        // Pictograph: row per category with icons.
        const rows = targetData.map((d, i) => {
            const icon = d.icon || ['🐱', '🐶', '🐦', '🐰', '🐠', '🐢'][i % 6];
            return `<div class="gb-picto-row" data-cat-idx="${i}" data-current="0"
                style="display:flex;align-items:center;gap:8px;padding:6px 10px;
                       border-bottom:1px solid #eee;">
                <div style="min-width:90px;font-weight:700;color:#0d47a1;
                     font-size:0.95rem;text-align:right;">${_esc(d.label)}</div>
                <div class="gb-picto-icons" data-cat-idx="${i}"
                     style="flex:1;font-size:1.6rem;line-height:1.3;letter-spacing:2px;
                            min-height:32px;color:#333;" data-icon="${_esc(icon)}"></div>
            </div>`;
        }).join('');

        mainHtml = `<div style="background:#fff;border:2px solid #ccc;border-radius:8px;
            padding:6px 0;max-width:520px;margin:0 auto;">
            <div style="text-align:center;font-weight:700;color:#555;font-size:0.85rem;
                 padding:6px;border-bottom:2px solid #ddd;">
                Key: 1 picture = 1 ${graphType === 'pictograph' ? 'item' : ''}
            </div>
            ${rows}
        </div>`;
    }

    // Per-category +/- controls below the chart.
    const controlsHtml = targetData.map((d, i) => {
        return `<div class="gb-ctrl-row" data-cat-idx="${i}"
            style="display:flex;align-items:center;justify-content:space-between;
                   gap:8px;padding:6px 10px;background:#f5f5f5;border-radius:8px;
                   margin:4px 0;">
            <div style="min-width:90px;font-weight:700;color:#222;font-size:0.95rem;">
                ${_esc(d.label)}
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <button type="button" class="gb-minus" data-cat-idx="${i}"
                    aria-label="Decrease ${_esc(d.label)}"
                    style="width:36px;height:36px;border-radius:50%;border:2px solid #c62828;
                           background:#ffebee;color:#c62828;font-weight:900;font-size:1.2rem;
                           cursor:pointer;line-height:1;">−</button>
                <div class="gb-counter" data-cat-idx="${i}"
                    style="min-width:42px;text-align:center;font-weight:800;font-size:1.2rem;
                           color:#1565c0;background:#fff;border:2px solid #1565c0;
                           border-radius:6px;padding:4px 8px;" aria-live="polite">0</div>
                <button type="button" class="gb-plus" data-cat-idx="${i}"
                    aria-label="Increase ${_esc(d.label)}"
                    style="width:36px;height:36px;border-radius:50%;border:2px solid #2e7d32;
                           background:#e8f5e9;color:#2e7d32;font-weight:900;font-size:1.2rem;
                           cursor:pointer;line-height:1;">+</button>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="gb-host" role="application" aria-label="Graph builder">
            <div class="gb-targets" style="text-align:center;margin-bottom:14px;">
                ${targetListHtml}
            </div>
            <div class="gb-chart" data-role="chart" style="margin-bottom:14px;">
                ${mainHtml}
            </div>
            <div class="gb-controls" data-role="controls"
                 style="max-width:380px;margin:0 auto;">
                ${controlsHtml}
            </div>
            <div class="gb-toolbar"
                 style="display:flex;justify-content:center;align-items:center;gap:14px;margin-top:14px;">
                <button type="button" class="gb-clear secondary-btn"
                    style="padding:6px 14px;font-size:0.9rem;font-weight:600;opacity:0.85;">Clear</button>
                <button type="button" class="gb-submit primary-btn" disabled
                    style="padding:16px 36px;font-size:1.35rem;font-weight:800;border-radius:14px;box-shadow:0 4px 12px rgba(21,101,192,0.25);">Submit</button>
            </div>
            <div class="gb-live" aria-live="polite"
                 style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
        </div>
    `;

    const host = container.querySelector('.gb-host');
    const submit = host.querySelector('.gb-submit');
    const clearBtn = host.querySelector('.gb-clear');
    const live = host.querySelector('.gb-live');
    let locked = false;

    // Internal current-value state per category index.
    const current = targetData.map(() => 0);

    function announce(msg) { if (live) live.textContent = msg; }

    function updateCategoryView(idx) {
        const v = current[idx];
        const counter = host.querySelector(`.gb-counter[data-cat-idx="${idx}"]`);
        if (counter) counter.textContent = String(v);

        if (graphType === 'bar') {
            const bar = host.querySelector(`.gb-bar[data-cat-idx="${idx}"]`);
            const valTxt = host.querySelector(`.gb-bar-val[data-cat-idx="${idx}"]`);
            const svg = host.querySelector('.gb-svg');
            if (bar && svg) {
                const W = parseFloat(svg.getAttribute('viewBox').split(' ')[2]);
                const H = parseFloat(svg.getAttribute('viewBox').split(' ')[3]);
                const padT = 20, padB = 60;
                const usableH = H - padT - padB;
                const newH = (v / maxValue) * usableH;
                bar.setAttribute('height', String(newH));
                bar.setAttribute('y', String(padT + usableH - newH));
                bar.setAttribute('data-current', String(v));
                if (valTxt) {
                    valTxt.setAttribute('y', String(padT + usableH - newH - 4));
                    valTxt.textContent = String(v);
                }
            }
        } else {
            const iconsDiv = host.querySelector(`.gb-picto-icons[data-cat-idx="${idx}"]`);
            if (iconsDiv) {
                const icon = iconsDiv.dataset.icon || '●';
                iconsDiv.textContent = icon.repeat(v);
                const row = host.querySelector(`.gb-picto-row[data-cat-idx="${idx}"]`);
                if (row) row.setAttribute('data-current', String(v));
            }
        }
    }

    function refreshSubmit() {
        const totalPlaced = current.reduce((s, v) => s + v, 0);
        submit.disabled = totalPlaced === 0;
    }

    function adjust(idx, delta) {
        if (locked) return;
        const next = current[idx] + delta;
        if (next < 0 || next > maxValue) return;
        current[idx] = next;
        updateCategoryView(idx);
        refreshSubmit();
        announce(`${targetData[idx].label} set to ${next}.`);
    }

    host.addEventListener('click', (e) => {
        if (locked) return;
        const plus = e.target.closest('.gb-plus');
        const minus = e.target.closest('.gb-minus');
        if (plus) {
            const idx = parseInt(plus.dataset.catIdx, 10);
            adjust(idx, +1);
            return;
        }
        if (minus) {
            const idx = parseInt(minus.dataset.catIdx, 10);
            adjust(idx, -1);
            return;
        }
    });

    host.addEventListener('keydown', (e) => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const t = e.target.closest('.gb-plus, .gb-minus');
        if (!t) return;
        e.preventDefault();
        t.click();
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        for (let i = 0; i < current.length; i++) {
            current[i] = 0;
            updateCategoryView(i);
        }
        refreshSubmit();
        announce('Graph cleared.');
    });

    function lockWidget() {
        locked = true;
        submit.disabled = true;
        clearBtn.disabled = true;
        host.querySelectorAll('.gb-plus, .gb-minus').forEach(b => {
            b.disabled = true;
            b.style.cursor = 'not-allowed';
            b.style.opacity = '0.55';
        });
    }
    function unlockForRetry() {
        locked = false;
        clearBtn.disabled = false;
        host.querySelectorAll('.gb-plus, .gb-minus').forEach(b => {
            b.disabled = false;
            b.style.cursor = 'pointer';
            b.style.opacity = '1';
        });
        // Clear any wrong/correct paint applied after a previous submit.
        host.querySelectorAll('.gb-bar, .gb-picto-row, .gb-picto-icons')
            .forEach(el => {
                el.classList.remove('gb-correct', 'gb-wrong');
                el.style.removeProperty('outline');
                el.style.removeProperty('filter');
                if (el.classList.contains('gb-bar')) {
                    el.removeAttribute('stroke-dasharray');
                }
            });
        refreshSubmit();
    }
    container._gbLock = lockWidget;
    container._gbUnlockForRetry = unlockForRetry;

    submit.addEventListener('click', () => {
        if (submit.disabled || locked) return;
        submit.disabled = true;
        try { onGraphBuilderSubmit(q, current.slice()); }
        catch (err) { console.error('onGraphBuilderSubmit failed:', err); }
    });

    refreshSubmit();
}

// Returns { allCorrect, wrongCount, perCategoryOk: [bool] }.
export function checkGraphBuilder(q, current) {
    const targetData = Array.isArray(q && q.targetData) ? q.targetData : [];
    const cur = Array.isArray(current) ? current : [];
    const perCategoryOk = targetData.map((d, i) => (cur[i] | 0) === (d.value | 0));
    const wrongCount = perCategoryOk.filter(ok => !ok).length;
    return { allCorrect: wrongCount === 0, wrongCount, perCategoryOk };
}

// Paint per-category correctness on the host element after a submit.
// host:    container element returned by renderGraphBuilder caller
// q:       the question
// result:  result of checkGraphBuilder
export function paintGraphBuilderResult(host, q, result) {
    if (!host || !q || !result) return;
    const graphType = (q.graphType === 'pictograph') ? 'pictograph' : 'bar';
    const ok = result.perCategoryOk || [];
    if (graphType === 'bar') {
        host.querySelectorAll('.gb-bar').forEach(el => {
            const i = parseInt(el.dataset.catIdx, 10);
            el.style.outline = ok[i] ? '3px solid #2e7d32' : '3px solid #c62828';
            if (!ok[i]) {
                el.setAttribute('stroke-dasharray', '4 3');
                el.setAttribute('fill', '#ef5350');
            }
        });
    } else {
        host.querySelectorAll('.gb-picto-row').forEach(el => {
            const i = parseInt(el.dataset.catIdx, 10);
            el.style.outline = ok[i] ? '3px solid #2e7d32' : '3px solid #c62828';
            el.style.background = ok[i] ? '#e8f5e9' : '#ffebee';
        });
    }
}

// Default no-op; question-render.js replaces per-mount.
export let onGraphBuilderSubmit = function (_q, _current) { /* noop */ };

export function setOnGraphBuilderSubmit(fn) {
    if (typeof fn === 'function') onGraphBuilderSubmit = fn;
}
