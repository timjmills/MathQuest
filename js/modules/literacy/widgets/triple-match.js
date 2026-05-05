// triple-match.js — 3-column bijective match widget.
//
// Student links one item from each of three columns to form a triple, e.g.,
// word ↔ definition ↔ example sentence. The match is bijective: each item is
// used in exactly one triple, and triples sizes are |col1| == |col2| == |col3|.
//
// Question contract:
//   q.stem:             string
//   q.columns:          [
//                          { id: 'word',    items: [{ id, text }] },
//                          { id: 'def',     items: [{ id, text }] },
//                          { id: 'example', items: [{ id, text }] }
//                       ]
//   q.correct_triples:  [[col1_id, col2_id, col3_id], ...]
//
// Interaction model (click-to-link, drag also supported left→middle, middle→right):
//   1. Click a column-1 item → highlights it (selected).
//   2. Click a column-2 item → starts a partial triple (col1 + col2 highlighted same color).
//   3. Click a column-3 item → completes the triple. SVG arcs span col1→col2→col3.
//   Click any item already in a triple → unmatch the entire triple.
//   Submit when all three columns are fully matched (count === |column 1|).
//
// Partial-correct lock on wrong submit (widget-retry pattern):
//   Correct triples → all three items locked + .lq-locked-correct
//   Wrong triples   → unmatched + .lq-wrong-persistent flash on all three
//
// Exports:
//   renderTripleMatch(q, container)
//   checkTripleMatch(q, container)

import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const _ARC_COLORS = [
    '#1565c0', '#c62828', '#2e7d32', '#6a1b9a',
    '#f57f17', '#00838f', '#ad1457', '#37474f'
];

function _centerOf(el, refEl) {
    const rect = el.getBoundingClientRect();
    const ref = refEl.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2 - ref.left,
        y: rect.top + rect.height / 2 - ref.top
    };
}

function _drawSegment(svg, refEl, fromEl, toEl, color, key) {
    const F = _centerOf(fromEl, refEl);
    const T = _centerOf(toEl, refEl);
    const cpX = (F.x + T.x) / 2;
    const d = `M ${F.x} ${F.y} C ${cpX} ${F.y}, ${cpX} ${T.y}, ${T.x} ${T.y}`;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('data-triple-key', key);
    svg.appendChild(path);
}

export function renderTripleMatch(q, container) {
    if (!container || !q) return;

    const stem = q.stem || '';
    const columns = Array.isArray(q.columns) ? q.columns.slice(0, 3) : [];
    const correctTriples = Array.isArray(q.correct_triples) ? q.correct_triples : [];
    const colCount = columns.length;
    if (colCount < 3) {
        container.innerHTML = '<div class="lq-error">triple-match requires 3 columns</div>';
        return;
    }

    function _itemHtml(item, colIdx) {
        const text = _esc(item.text || item.id);
        return `<div class="lq-tm-item"
            data-id="${_esc(item.id)}"
            data-col="${colIdx}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="${text}">${text}</div>`;
    }

    const colsHtml = columns.map((col, ci) => {
        const items = Array.isArray(col.items) ? col.items : [];
        const itemsHtml = items.map(it => _itemHtml(it, ci)).join('');
        return `<div class="lq-tm-column" data-col-id="${_esc(col.id || ('col' + ci))}"
            role="group" aria-label="Column ${ci + 1}">
            ${itemsHtml}
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-tm-host" role="application"
            aria-label="Triple match — click one item from each column to form a triple">
            ${stem ? `<p class="lq-tm-stem">${_esc(stem)}</p>` : ''}
            <div class="lq-tm-board">
                ${colsHtml}
                <svg class="lq-tm-arc-svg" xmlns="http://www.w3.org/2000/svg"
                    style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;"></svg>
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-tm-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="lq-tm-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-tm-host');
    const board = host.querySelector('.lq-tm-board');
    const svg = host.querySelector('.lq-tm-arc-svg');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-tm-submit');
    const live = host.querySelector('.lq-tm-live');

    const triples = [];
    const tripleColors = new Map();
    let colorIdx = 0;
    const pending = { 0: null, 1: null, 2: null };
    let locked = false;

    const correctMap = new Map();
    correctTriples.forEach(t => {
        if (Array.isArray(t) && t.length === 3) correctMap.set(t[0], [t[1], t[2]]);
    });

    const totalRows = (Array.isArray(columns[0].items) ? columns[0].items.length : 0);

    function getItemEl(colIdx, id) {
        return host.querySelector(`.lq-tm-item[data-col="${colIdx}"][data-id="${CSS.escape(id)}"]`);
    }

    function announce(msg) {
        if (!live) return;
        live.textContent = '';
        requestAnimationFrame(() => { live.textContent = msg; });
    }

    function refreshSubmit() {
        submitBtn.disabled = locked || triples.length < totalRows;
    }

    function clearPending() {
        for (let c = 0; c < 3; c++) {
            if (pending[c]) {
                const el = getItemEl(c, pending[c]);
                if (el) {
                    el.classList.remove('lq-tm-pending');
                    el.setAttribute('aria-pressed', 'false');
                }
                pending[c] = null;
            }
        }
    }

    function isItemInTriple(colIdx, id) {
        return triples.some(t => t[colIdx] === id);
    }

    function findTripleIndex(colIdx, id) {
        return triples.findIndex(t => t[colIdx] === id);
    }

    function redrawArcs() {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        triples.forEach((t, i) => {
            const key = `tm-${i}`;
            const color = tripleColors.get(key) || _ARC_COLORS[0];
            const a = getItemEl(0, t[0]);
            const b = getItemEl(1, t[1]);
            const c = getItemEl(2, t[2]);
            if (a && b) _drawSegment(svg, board, a, b, color, key);
            if (b && c) _drawSegment(svg, board, b, c, color, key);
        });
    }

    function commitTriple(id0, id1, id2) {
        const key = `tm-${triples.length}`;
        const color = _ARC_COLORS[colorIdx % _ARC_COLORS.length];
        colorIdx++;
        tripleColors.set(key, color);
        triples.push([id0, id1, id2]);

        [id0, id1, id2].forEach((id, c) => {
            const el = getItemEl(c, id);
            if (!el) return;
            el.classList.remove('lq-tm-pending');
            el.classList.add('lq-tm-matched');
            el.style.borderColor = color;
        });

        clearPending();
        redrawArcs();
        announce('Triple linked.');
        refreshSubmit();
    }

    function removeTriple(tripleIdx) {
        if (tripleIdx < 0 || tripleIdx >= triples.length) return;
        const [a, b, c] = triples[tripleIdx];
        [a, b, c].forEach((id, ci) => {
            const el = getItemEl(ci, id);
            if (el) {
                el.classList.remove('lq-tm-matched', 'lq-locked-correct');
                el.style.borderColor = '';
            }
        });
        triples.splice(tripleIdx, 1);
        tripleColors.clear();
        triples.forEach((_t, i) => {
            tripleColors.set(`tm-${i}`, _ARC_COLORS[i % _ARC_COLORS.length]);
        });
        redrawArcs();
        refreshSubmit();
    }

    function handleClick(el) {
        if (locked) return;
        if (el.dataset.locked === '1') return;
        const colIdx = parseInt(el.dataset.col, 10);
        const id = el.dataset.id;

        if (isItemInTriple(colIdx, id)) {
            const ti = findTripleIndex(colIdx, id);
            removeTriple(ti);
            announce('Triple removed.');
            return;
        }

        if (pending[colIdx] === id) {
            el.classList.remove('lq-tm-pending');
            el.setAttribute('aria-pressed', 'false');
            pending[colIdx] = null;
            return;
        }
        if (pending[colIdx]) {
            const old = getItemEl(colIdx, pending[colIdx]);
            if (old) {
                old.classList.remove('lq-tm-pending');
                old.setAttribute('aria-pressed', 'false');
            }
        }
        pending[colIdx] = id;
        el.classList.add('lq-tm-pending');
        el.setAttribute('aria-pressed', 'true');

        if (pending[0] && pending[1] && pending[2]) {
            commitTriple(pending[0], pending[1], pending[2]);
        }
    }

    host.addEventListener('click', e => {
        const el = e.target.closest('.lq-tm-item');
        if (!el || !host.contains(el)) return;
        handleClick(el);
    });

    host.addEventListener('keydown', e => {
        const el = e.target.closest('.lq-tm-item');
        if (!el) return;
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(el);
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            clearPending();
            return;
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const col = el.dataset.col;
            const items = Array.from(host.querySelectorAll(`.lq-tm-item[data-col="${col}"]`));
            const i = items.indexOf(el);
            const next = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
            if (next) next.focus();
            return;
        }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const col = parseInt(el.dataset.col, 10);
            const next = col + (e.key === 'ArrowRight' ? 1 : -1);
            if (next < 0 || next > 2) return;
            const items = Array.from(host.querySelectorAll(`.lq-tm-item[data-col="${next}"]`));
            if (items[0]) items[0].focus();
        }
    });

    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => redrawArcs());
        ro.observe(host);
    }

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const firstAttempt = isFirstAttempt();
        let allCorrect = true;
        const wrongIndices = [];

        triples.forEach((t, i) => {
            const expected = correctMap.get(t[0]);
            if (expected && expected[0] === t[1] && expected[1] === t[2]) {
                t.forEach((id, ci) => {
                    const el = getItemEl(ci, id);
                    if (el) {
                        el.dataset.locked = '1';
                        el.classList.add('lq-locked-correct');
                        el.classList.remove('lq-wrong-persistent');
                    }
                });
            } else {
                allCorrect = false;
                wrongIndices.push(i);
                t.forEach((id, ci) => {
                    const el = getItemEl(ci, id);
                    if (el) el.classList.add('lq-wrong-persistent');
                });
            }
        });

        markFirstAttempt(allCorrect);

        if (!allCorrect) {
            // Remove wrong triples (highest index first to preserve indices)
            wrongIndices.sort((a, b) => b - a).forEach(idx => {
                const t = triples[idx];
                if (!t) return;
                t.forEach((id, ci) => {
                    const el = getItemEl(ci, id);
                    if (el) {
                        el.classList.remove('lq-tm-matched');
                        el.style.borderColor = '';
                    }
                });
                triples.splice(idx, 1);
            });
            // Reset color map
            tripleColors.clear();
            triples.forEach((_t, i) => {
                tripleColors.set(`tm-${i}`, _ARC_COLORS[i % _ARC_COLORS.length]);
            });
            redrawArcs();
        }

        if (allCorrect) {
            feedbackZone.textContent = 'All triples matched correctly!';
            locked = true;
            submitBtn.disabled = true;
        } else {
            const wc = wrongIndices.length;
            feedbackZone.textContent =
                `${wc} triple${wc === 1 ? '' : 's'} wrong — try again!`;
            refreshSubmit();
        }

        const submitted = triples.map(t => t.slice());
        container._lqLastResult = { correct: allCorrect, submitted, firstAttempt };
    });

    refreshSubmit();
}

export function checkTripleMatch(q, container) {
    if (!container) return { correct: false, submitted: [], feedback: '' };
    if (container._lqLastResult) return container._lqLastResult;
    return { correct: false, submitted: [], feedback: '' };
}
