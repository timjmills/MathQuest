// tap-hotspot.js — Tap the correct hotspot widget.
//
// Two visual modes:
//   image mode  — q.image_src + q.hotspots with (x, y, width, height) bbox overlays
//   text mode   — q.passage string; addressable tokens are each wrapped in a span
//
// Question contract:
//   q.image_src?:   string  — URL for image mode
//   q.passage?:     string  — passage text for text mode
//   q.hotspots:     [{ id, label, correct, x?, y?, width?, height? }]
//                   In text mode, id and label are used; x/y/w/h ignored.
//   q.ans:          string | string[]  — correct hotspot id(s)
//   q.multi_select?: boolean  — if true, allow selecting multiple (Submit-gated)
//   q.k2_appropriate?: boolean
//
// Exports:
//   renderTapHotspot(q, container)
//   checkTapHotspot(q, container)
//
// Follows the Literacy Quest widget contract (same pattern as mc-text.js).

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _correctSet(q) {
    if (Array.isArray(q.ans)) return new Set(q.ans);
    return new Set(q.ans != null ? [q.ans] : []);
}

function _safeSpeak(text) {
    if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(text);
    }
}

// ─── image mode ─────────────────────────────────────────────────────────────

function _renderImage(q, container) {
    const hotspots = Array.isArray(q.hotspots) ? q.hotspots : [];

    // Overlay regions are absolute-positioned percentages so they scale with
    // the image's rendered size. x/y/width/height are expected as 0–100 (%).
    const regionsHtml = hotspots.map(hs => {
        const x = (hs.x != null) ? hs.x : 0;
        const y = (hs.y != null) ? hs.y : 0;
        const w = (hs.width != null) ? hs.width : 10;
        const h = (hs.height != null) ? hs.height : 10;
        const label = _esc(hs.label || hs.id || '');
        return `<div
            class="lq-tap-hotspot-region"
            role="button"
            tabindex="0"
            data-id="${_esc(hs.id)}"
            aria-pressed="false"
            aria-label="${label}"
            style="left:${x}%;top:${y}%;width:${w}%;height:${h}%">
            <span class="lq-tap-hotspot-region-label">${label}</span>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-tap-hotspot-host" role="application" aria-label="Tap the correct region">
            <div class="lq-tap-hotspot-image-wrap" style="position:relative;display:inline-block;">
                <img class="lq-tap-hotspot-image" src="${_esc(q.image_src || '')}"
                    alt="${_esc(q.imageAlt || 'Question image')}" style="display:block;max-width:100%;">
                <div class="lq-tap-hotspot-overlay" style="position:absolute;inset:0;">
                    ${regionsHtml}
                </div>
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            ${q.multi_select ? `<button type="button" class="lq-tap-hotspot-submit primary-btn" disabled>Submit</button>` : ''}
        </div>`;
}

// ─── text mode ───────────────────────────────────────────────────────────────

function _renderText(q, container) {
    const hotspots = Array.isArray(q.hotspots) ? q.hotspots : [];
    const hotspotMap = {};
    hotspots.forEach(hs => { hotspotMap[hs.id] = hs; });

    // Build passage HTML: wrap each hotspot token in a button-like span.
    // Non-hotspot words render as plain text spans.
    // We split the passage on whitespace and match tokens by label.
    const passage = q.passage || '';
    const words = passage.split(/(\s+)/);

    let tokenIndex = 0;
    const passageHtml = words.map(chunk => {
        // Preserve whitespace chunks
        if (/^\s+$/.test(chunk)) return `<span class="lq-tap-hotspot-space">${chunk}</span>`;
        // Normalize chunk for matching (strip leading/trailing punctuation for lookup)
        const normalized = chunk.replace(/^[^\w]+|[^\w]+$/g, '');
        const hs = hotspots.find(h => h.label === normalized || h.label === chunk || h.id === normalized);
        if (hs) {
            const id = `lq-ths-token-${tokenIndex++}`;
            return `<span
                class="lq-tap-hotspot-token"
                role="button"
                tabindex="0"
                id="${_esc(id)}"
                data-id="${_esc(hs.id)}"
                aria-pressed="false"
                aria-label="${_esc(hs.label || chunk)}">${_esc(chunk)}</span>`;
        }
        return `<span class="lq-tap-hotspot-word">${_esc(chunk)}</span>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-tap-hotspot-host" role="application" aria-label="Tap the correct word">
            <div class="lq-tap-hotspot-passage">${passageHtml}</div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            ${q.multi_select ? `<button type="button" class="lq-tap-hotspot-submit primary-btn" disabled>Submit</button>` : ''}
        </div>`;
}

// ─── shared interaction logic ─────────────────────────────────────────────────

function _attachInteraction(q, container) {
    const host = container.querySelector('.lq-tap-hotspot-host');
    if (!host) return;

    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-tap-hotspot-submit');
    const correct = _correctSet(q);
    const isMulti = !!q.multi_select;

    function getInteractiveEls() {
        return Array.from(host.querySelectorAll('.lq-tap-hotspot-region, .lq-tap-hotspot-token'));
    }

    function getSelected() {
        return getInteractiveEls().filter(el => el.classList.contains('lq-selected'));
    }

    function refreshSubmit() {
        if (submitBtn) submitBtn.disabled = getSelected().length === 0;
    }

    function handleTap(el) {
        if (el.disabled) return;
        if (el.dataset.locked === '1') return;

        const id = el.dataset.id;
        const isCorrect = correct.has(id);

        if (!isMulti) {
            // Single-select: immediate feedback
            const firstAttempt = isFirstAttempt();
            markFirstAttempt(isCorrect);

            if (isCorrect) {
                el.classList.add('lq-correct', 'lq-locked-correct');
                el.setAttribute('aria-pressed', 'true');
                el.dataset.locked = '1';
                feedbackZone.textContent = 'Correct!';
                // Lock everything
                getInteractiveEls().forEach(e => { if (e !== el) e.setAttribute('disabled', ''); });
            } else {
                // Mark red but keep interactive (retry)
                el.classList.add('lq-incorrect', 'lq-wrong-persistent');
                el.setAttribute('aria-pressed', 'true');
                feedbackZone.textContent = 'Not quite — try again!';
            }

            container._lqLastResult = { correct: isCorrect, submitted: id, firstAttempt };
        } else {
            // Multi-select: toggle
            if (el.classList.contains('lq-selected')) {
                el.classList.remove('lq-selected', 'lq-wrong-persistent');
                el.setAttribute('aria-pressed', 'false');
            } else {
                el.classList.add('lq-selected');
                el.setAttribute('aria-pressed', 'true');
            }
            refreshSubmit();
        }
    }

    // Delegated click handler
    host.addEventListener('click', e => {
        const el = e.target.closest('.lq-tap-hotspot-region, .lq-tap-hotspot-token');
        if (!el || !host.contains(el)) return;
        handleTap(el);
    });

    // Keyboard handler
    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const el = e.target.closest('.lq-tap-hotspot-region, .lq-tap-hotspot-token');
        if (el) {
            e.preventDefault();
            handleTap(el);
        }
    });

    // K-2 auto-speak on render
    if (q.k2_appropriate && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }

    // Multi-select Submit
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (submitBtn.disabled) return;

            const selectedIds = getSelected().map(el => el.dataset.id);
            const ansSet = _correctSet(q);
            const allCorrect = selectedIds.length === ansSet.size &&
                selectedIds.every(id => ansSet.has(id));

            const firstAttempt = isFirstAttempt();
            markFirstAttempt(allCorrect);

            const els = getInteractiveEls();
            let wrongCount = 0;
            els.forEach(el => {
                const id = el.dataset.id;
                const isSelected = el.classList.contains('lq-selected');
                const isCorrectEl = ansSet.has(id);

                if (isSelected && isCorrectEl) {
                    el.classList.add('lq-locked-correct');
                    el.classList.remove('lq-wrong-persistent');
                    el.dataset.locked = '1';
                } else if (isSelected && !isCorrectEl) {
                    el.classList.remove('lq-selected');
                    el.classList.add('lq-wrong-persistent');
                    el.setAttribute('aria-pressed', 'false');
                    wrongCount++;
                }
            });

            if (allCorrect) {
                feedbackZone.textContent = 'Correct!';
                submitBtn.disabled = true;
                els.forEach(el => { el.setAttribute('tabindex', '-1'); });
            } else {
                feedbackZone.textContent = `${wrongCount} wrong — try again!`;
                refreshSubmit();
            }

            container._lqLastResult = { correct: allCorrect, submitted: selectedIds, firstAttempt };
        });
    }

    refreshSubmit();
}

// ─── public render ────────────────────────────────────────────────────────────

export function renderTapHotspot(q, container) {
    if (!container || !q || !Array.isArray(q.hotspots)) return;

    const mode = q.image_src ? 'image' : 'text';
    if (mode === 'image') {
        _renderImage(q, container);
    } else {
        _renderText(q, container);
    }

    _attachInteraction(q, container);
}

// ─── check ──────────────────────────────────────────────────────────────────

export function checkTapHotspot(q, container) {
    if (!container) return { correct: false, submitted: null };

    if (container._lqLastResult) {
        return container._lqLastResult;
    }

    // Derive from DOM state
    const host = container.querySelector('.lq-tap-hotspot-host');
    if (!host) return { correct: false, submitted: null };

    const selected = Array.from(
        host.querySelectorAll('.lq-tap-hotspot-region.lq-selected, .lq-tap-hotspot-token.lq-selected,\
 .lq-tap-hotspot-region.lq-locked-correct, .lq-tap-hotspot-token.lq-locked-correct')
    ).map(el => el.dataset.id);

    const ansSet = _correctSet(q);
    const submitted = q.multi_select ? selected : (selected[0] || null);
    const correct = q.multi_select
        ? (selected.length === ansSet.size && selected.every(id => ansSet.has(id)))
        : (submitted != null && ansSet.has(submitted));

    return { correct, submitted };
}
