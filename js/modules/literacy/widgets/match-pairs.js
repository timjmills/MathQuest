// match-pairs.js — Two-column click-to-match (or drag-to-match) widget.
//
// Student connects left-column items to right-column items. Visual feedback
// is drawn as SVG bezier arcs between matched pairs, one color per match.
// Clicking a matched item again unmatches it (clears that arc).
//
// Question contract:
//   q.task_text:   string — instruction (e.g., "Match each word to its synonym")
//   q.left_column: [{ id, label, image?, audio_text? }]
//   q.right_column:[{ id, label, image?, audio_text? }]
//   q.pairs:       [[left_id, right_id], ...]   — correct matches
//   q.k2_appropriate?: boolean — large items, audio per-item mandatory
//
// Interaction model:
//   1. Click a left item  → highlights it (selected state)
//   2. Click a right item → draws a connection arc; or if already matched, unmatch
//   3. Click a matched item again → unmatch (remove arc)
//   Submit button activates once all left items are matched.
//
// Partial-correct lock on wrong submit:
//   Correct pairs  → .lq-locked-correct + non-interactive
//   Wrong pairs    → unmatched + .lq-mp-wrong-flash on both endpoints
//
// Keyboard:
//   Tab through left column → Enter selects; Tab to right column → Enter matches.
//   Tab to a matched item → Enter unmatches.
//
// Exports:
//   renderMatchPairs(q, container)
//   checkMatchPairs(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ──────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _speak(text) {
    if (!text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
    } catch (_) { /* not available */ }
}

function _announce(host, msg) {
    const live = host.querySelector('.lq-mp-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
}

// Arc color palette — one color per pair slot
const _ARC_COLORS = [
    '#1565c0', '#c62828', '#2e7d32', '#6a1b9a',
    '#f57f17', '#00838f', '#ad1457', '#37474f'
];

// ─── SVG arc drawing ──────────────────────────────────────────────────────────

/**
 * Return the center coordinates of an element relative to a reference element.
 * @param {Element} el
 * @param {Element} refEl
 * @returns {{ x: number, y: number }}
 */
function _centerOf(el, refEl) {
    const rect = el.getBoundingClientRect();
    const ref = refEl.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2 - ref.left,
        y: rect.top + rect.height / 2 - ref.top
    };
}

/**
 * Draw or update an SVG bezier arc from leftEl to rightEl inside the SVG overlay.
 * @param {SVGElement} svg
 * @param {Element} refEl  — coordinate origin (the host div)
 * @param {Element} leftEl
 * @param {Element} rightEl
 * @param {string} color
 * @param {string} pairKey  — unique key for data-pair attribute
 */
function _drawArc(svg, refEl, leftEl, rightEl, color, pairKey) {
    // Remove any existing arc for this pair
    const existing = svg.querySelector(`[data-pair="${CSS.escape(pairKey)}"]`);
    if (existing) existing.remove();

    const L = _centerOf(leftEl, refEl);
    const R = _centerOf(rightEl, refEl);

    // Bezier control points: curve horizontally between the two columns
    const cpX = (L.x + R.x) / 2;
    const d = `M ${L.x} ${L.y} C ${cpX} ${L.y}, ${cpX} ${R.y}, ${R.x} ${R.y}`;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('data-pair', pairKey);
    svg.appendChild(path);
}

function _removeArc(svg, pairKey) {
    const el = svg.querySelector(`[data-pair="${CSS.escape(pairKey)}"]`);
    if (el) el.remove();
}

// ─── render ───────────────────────────────────────────────────────────────────

export function renderMatchPairs(q, container) {
    if (!container || !q) return;

    const leftCol = Array.isArray(q.left_column) ? q.left_column : [];
    const rightCol = Array.isArray(q.right_column) ? q.right_column : [];
    const correctPairs = Array.isArray(q.pairs) ? q.pairs : [];
    const isK2 = !!q.k2_appropriate;
    const taskText = q.task_text || '';

    const itemClass = isK2 ? 'lq-mp-item lq-mp-item--k2' : 'lq-mp-item';

    function _itemHtml(item, side) {
        const label = _esc(item.label || item.id);
        const imgHtml = item.image
            ? `<img class="lq-mp-item-image" src="${_esc(item.image)}" alt="${label}">`
            : '';
        const audioBtn = isK2 && (item.audio_text || item.label)
            ? `<button type="button" class="lq-mp-audio-btn"
                data-audio="${_esc(item.audio_text || item.label)}"
                aria-label="Listen to ${label}" tabindex="-1">🔊</button>`
            : '';
        return `<div class="${_esc(itemClass)}"
            data-id="${_esc(item.id)}"
            data-side="${side}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="${label}">
            ${imgHtml}
            <span class="lq-mp-item-label">${label}</span>
            ${audioBtn}
        </div>`;
    }

    const leftHtml = leftCol.map(item => _itemHtml(item, 'left')).join('');
    const rightHtml = rightCol.map(item => _itemHtml(item, 'right')).join('');

    container.innerHTML = `
        <div class="lq-mp-host" role="application"
            aria-label="Match pairs by clicking one item from each column">
            ${taskText ? `<p class="lq-mp-task-text">${_esc(taskText)}</p>` : ''}
            <div class="lq-mp-columns-wrapper">
                <div class="lq-mp-column lq-mp-column--left" role="group"
                    aria-label="Left column items">
                    ${leftHtml}
                </div>
                <div class="lq-mp-arc-overlay-wrap" aria-hidden="true">
                    <svg class="lq-mp-arc-svg" xmlns="http://www.w3.org/2000/svg"
                        style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;">
                    </svg>
                </div>
                <div class="lq-mp-column lq-mp-column--right" role="group"
                    aria-label="Right column items">
                    ${rightHtml}
                </div>
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-mp-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="lq-mp-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-mp-host');
    const svg = host.querySelector('.lq-mp-arc-svg');
    const arcWrap = host.querySelector('.lq-mp-arc-overlay-wrap');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-mp-submit');

    // ── state ─────────────────────────────────────────────────────────────────
    // matches: Map<left_id, right_id>
    const matches = new Map();
    // colorMap: Map<left_id, color>
    const colorMap = new Map();
    let colorIdx = 0;
    let selectedLeft = null;  // id of currently highlighted left item
    let locked = false;

    // Build correct-pair lookup
    const correctMap = new Map(correctPairs.map(([l, r]) => [l, r]));

    // ── helpers ───────────────────────────────────────────────────────────────

    function getItemEl(id) {
        return host.querySelector(`.lq-mp-item[data-id="${CSS.escape(id)}"]`);
    }

    function refreshSubmit() {
        // Enable submit when all left items are matched
        submitBtn.disabled = locked || matches.size < leftCol.length;
    }

    function refreshArcOverlay() {
        // Resize the arc overlay wrapper to match the columns wrapper
        const wrapper = host.querySelector('.lq-mp-columns-wrapper');
        if (!wrapper || !arcWrap) return;
        const wRect = wrapper.getBoundingClientRect();
        arcWrap.style.cssText = `
            position:absolute;
            top:${wrapper.offsetTop}px;
            left:0;
            width:100%;
            height:${wrapper.offsetHeight}px;
            pointer-events:none;`;
    }

    function redrawAllArcs() {
        // Clear and redraw all arcs (called after layout changes)
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        matches.forEach((rightId, leftId) => {
            const leftEl = getItemEl(leftId);
            const rightEl = getItemEl(rightId);
            const color = colorMap.get(leftId) || _ARC_COLORS[0];
            if (leftEl && rightEl) {
                const refEl = arcWrap;
                _drawArc(svg, refEl, leftEl, rightEl, color, leftId);
            }
        });
    }

    function addMatch(leftId, rightId) {
        // Remove any existing match involving rightId or leftId
        matches.forEach((rId, lId) => {
            if (rId === rightId || lId === leftId) {
                removeMatch(lId);
            }
        });
        if (!colorMap.has(leftId)) {
            colorMap.set(leftId, _ARC_COLORS[colorIdx % _ARC_COLORS.length]);
            colorIdx++;
        }
        matches.set(leftId, rightId);

        const leftEl = getItemEl(leftId);
        const rightEl = getItemEl(rightId);
        const color = colorMap.get(leftId);

        if (leftEl) { leftEl.classList.add('lq-mp-matched'); leftEl.style.borderColor = color; }
        if (rightEl) { rightEl.classList.add('lq-mp-matched'); rightEl.style.borderColor = color; }

        refreshArcOverlay();
        _drawArc(svg, arcWrap, leftEl, rightEl, color, leftId);

        const leftLabel = leftEl ? leftEl.querySelector('.lq-mp-item-label').textContent : leftId;
        const rightLabel = rightEl ? rightEl.querySelector('.lq-mp-item-label').textContent : rightId;
        _announce(host, `Matched: ${leftLabel} with ${rightLabel}.`);
        refreshSubmit();
    }

    function removeMatch(leftId) {
        const rightId = matches.get(leftId);
        if (rightId === undefined) return;

        const leftEl = getItemEl(leftId);
        const rightEl = getItemEl(rightId);
        if (leftEl) { leftEl.classList.remove('lq-mp-matched', 'lq-locked-correct'); leftEl.style.borderColor = ''; }
        if (rightEl) { rightEl.classList.remove('lq-mp-matched', 'lq-locked-correct'); rightEl.style.borderColor = ''; }

        matches.delete(leftId);
        _removeArc(svg, leftId);

        const leftLabel = leftEl ? leftEl.querySelector('.lq-mp-item-label').textContent : leftId;
        _announce(host, `Unmatched ${leftLabel}.`);
        refreshSubmit();
    }

    function setSelectedLeft(id) {
        // Clear previous
        if (selectedLeft) {
            const prev = getItemEl(selectedLeft);
            if (prev) { prev.classList.remove('lq-mp-selected'); prev.setAttribute('aria-pressed', 'false'); }
        }
        selectedLeft = id;
        if (id) {
            const el = getItemEl(id);
            if (el) { el.classList.add('lq-mp-selected'); el.setAttribute('aria-pressed', 'true'); }
        }
    }

    // ── audio buttons ─────────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        const btn = e.target.closest('.lq-mp-audio-btn');
        if (!btn) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speak(btn.dataset.audio || '');
    });
    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const btn = e.target.closest('.lq-mp-audio-btn');
        if (!btn) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speak(btn.dataset.audio || '');
    });

    // K-2 auto-speak stems
    if (isK2 || (state && state.ttsEnabled)) {
        setTimeout(() => _speak(taskText), 200);
    }

    // ── click interaction ─────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        if (e.target.closest('.lq-mp-audio-btn')) return;

        const itemEl = e.target.closest('.lq-mp-item');
        if (!itemEl || !host.contains(itemEl)) return;
        if (itemEl.dataset.locked === '1') return;

        const clickedId = itemEl.dataset.id;
        const side = itemEl.dataset.side;

        if (side === 'left') {
            // Toggle left selection; if already matched, unmatch first
            if (matches.has(clickedId)) {
                removeMatch(clickedId);
                setSelectedLeft(null);
            } else if (selectedLeft === clickedId) {
                setSelectedLeft(null);
            } else {
                setSelectedLeft(clickedId);
            }
            return;
        }

        if (side === 'right') {
            // If this right item is already matched, unmatch its left partner
            let existingLeft = null;
            matches.forEach((rId, lId) => { if (rId === clickedId) existingLeft = lId; });

            if (existingLeft && !selectedLeft) {
                removeMatch(existingLeft);
                return;
            }

            if (selectedLeft) {
                addMatch(selectedLeft, clickedId);
                setSelectedLeft(null);
            }
        }
    });

    // ── keyboard navigation ───────────────────────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        const itemEl = e.target.closest('.lq-mp-item');
        if (!itemEl) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            itemEl.click();
            return;
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setSelectedLeft(null);
            return;
        }

        // Arrow up/down navigate within the same column
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const side = itemEl.dataset.side;
            const colItems = Array.from(host.querySelectorAll(`.lq-mp-item[data-side="${side}"]`));
            const idx = colItems.indexOf(itemEl);
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            const next = colItems[(idx + delta + colItems.length) % colItems.length];
            if (next) next.focus();
        }
    });

    // ── resize observer — redraw arcs when layout shifts ─────────────────────
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => { refreshArcOverlay(); redrawAllArcs(); });
        ro.observe(host);
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const firstAttempt = isFirstAttempt();
        let allCorrect = true;
        const wrongLeftIds = [];

        leftCol.forEach(item => {
            const matchedRight = matches.get(item.id);
            const expectedRight = correctMap.get(item.id);
            const leftEl = getItemEl(item.id);
            const rightEl = matchedRight ? getItemEl(matchedRight) : null;

            if (matchedRight && matchedRight === expectedRight) {
                // Correct — lock both sides
                if (leftEl) { leftEl.dataset.locked = '1'; leftEl.classList.add('lq-locked-correct'); leftEl.classList.remove('lq-wrong-persistent'); }
                if (rightEl) { rightEl.dataset.locked = '1'; rightEl.classList.add('lq-locked-correct'); rightEl.classList.remove('lq-wrong-persistent'); }
            } else {
                allCorrect = false;
                wrongLeftIds.push(item.id);
                // Flash wrong on both sides then unmatch
                if (leftEl) { leftEl.classList.add('lq-wrong-persistent'); }
                if (rightEl) { rightEl.classList.add('lq-wrong-persistent'); }
            }
        });

        markFirstAttempt(allCorrect);

        if (!allCorrect) {
            // Remove wrong matches
            wrongLeftIds.forEach(leftId => {
                removeMatch(leftId);
                const leftEl = getItemEl(leftId);
                if (leftEl) { leftEl.classList.add('lq-wrong-persistent'); }
            });
        }

        if (allCorrect) {
            feedbackZone.textContent = 'All pairs matched correctly!';
            locked = true;
            submitBtn.disabled = true;
        } else {
            const wrongCount = wrongLeftIds.length;
            feedbackZone.textContent = `${wrongCount} pair${wrongCount === 1 ? '' : 's'} wrong — try again!`;
            refreshSubmit();
        }

        // Build submitted snapshot: { left_id: right_id }
        const submitted = {};
        matches.forEach((rightId, leftId) => { submitted[leftId] = rightId; });

        container._lqLastResult = { correct: allCorrect, submitted, firstAttempt };
    });

    // ── drag-to-match (left to right) ─────────────────────────────────────────
    // Allow dragging left items onto right items as an alternative interaction.
    let _dragLeftId = null;
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const item = e.target.closest('.lq-mp-item[data-side="left"]');
        if (!item || item.dataset.locked === '1') return;
        e.dataTransfer.effectAllowed = 'link';
        e.dataTransfer.setData('text/plain', item.dataset.id);
        _dragLeftId = item.dataset.id;
        item.classList.add('lq-dnd-dragging');
    });
    host.addEventListener('dragend', e => {
        const item = e.target.closest('.lq-mp-item');
        if (item) item.classList.remove('lq-dnd-dragging');
        host.querySelectorAll('.lq-dnd-over').forEach(el => el.classList.remove('lq-dnd-over'));
        _dragLeftId = null;
    });
    host.addEventListener('dragover', e => {
        if (locked) return;
        const rightItem = e.target.closest('.lq-mp-item[data-side="right"]');
        if (rightItem) { e.preventDefault(); e.dataTransfer.dropEffect = 'link'; rightItem.classList.add('lq-dnd-over'); }
    });
    host.addEventListener('dragleave', e => {
        const rightItem = e.target.closest('.lq-mp-item[data-side="right"]');
        if (rightItem) rightItem.classList.remove('lq-dnd-over');
    });
    host.addEventListener('drop', e => {
        if (locked) return;
        const rightItem = e.target.closest('.lq-mp-item[data-side="right"]');
        if (!rightItem) return;
        rightItem.classList.remove('lq-dnd-over');
        const leftId = e.dataTransfer.getData('text/plain');
        if (leftId) {
            e.preventDefault();
            addMatch(leftId, rightItem.dataset.id);
            setSelectedLeft(null);
        }
    });

    // pointer/touch drag for left→right matching
    let _ptLeftId = null, _ptGhost = null;
    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const item = e.target.closest('.lq-mp-item[data-side="left"]');
        if (!item || item.dataset.locked === '1') return;
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        _ptLeftId = item.dataset.id;
        _ptGhost = item.cloneNode(true);
        _ptGhost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0.75;left:${e.clientX-20}px;top:${e.clientY-20}px;`;
        document.body.appendChild(_ptGhost);
        item.classList.add('lq-dnd-dragging');
    }, { passive: false });
    host.addEventListener('pointermove', e => {
        if (!_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 20}px`;
        _ptGhost.style.top = `${e.clientY - 20}px`;
    }, { passive: false });
    host.addEventListener('pointerup', e => {
        if (!_ptLeftId) return;
        const draggingEl = getItemEl(_ptLeftId);
        if (draggingEl) draggingEl.classList.remove('lq-dnd-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const rightItem = els.find(el => el.classList.contains('lq-mp-item') && el.dataset.side === 'right')
            || els.find(el => el.closest('.lq-mp-item[data-side="right"]'));
        if (rightItem) {
            const target = rightItem.classList.contains('lq-mp-item') ? rightItem : rightItem.closest('.lq-mp-item');
            if (target) addMatch(_ptLeftId, target.dataset.id);
        }
        _ptLeftId = null;
        setSelectedLeft(null);
    });

    refreshSubmit();
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkMatchPairs(q, container) {
    if (!container) return { correct: false, submitted: {} };
    if (container._lqLastResult) return container._lqLastResult;

    // Derive from DOM — look at lq-mp-matched items and their color border match
    // Since we can't re-derive matches from DOM without internal state, return unanswered.
    return { correct: false, submitted: {} };
}
