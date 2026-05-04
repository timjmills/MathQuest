// x-strikethrough-choice.js — ETC Types 5/9: X-strikethrough forced choice.
//
// Two (or more) options shown as large buttons. When the student taps the
// wrong one, an animated SVG X is drawn corner-to-corner across it —
// the ETC signature response mechanic. The correct answer locks green.
//
// Question contract:
//   q.task_text:               string                  — instruction
//   q.image?:                  string                  — optional anchor image (above options)
//   q.image_alt?:              string
//   q.options: [
//       { id: string, label: string, correct: boolean }
//   ]                                                   — typically 2; up to 4
//   q.option_orientation?:     'side-by-side' | 'stacked'
//                                                       — default side-by-side for 2, stacked for 3+
//   q.task_inverted?:          boolean                 — false = circle correct; true = X the wrong one
//   q.k2_appropriate?:         boolean
//
// Exports:
//   renderXStrikethroughChoice(q, container)
//   checkXStrikethroughChoice(q, container)
//     → { correct, submitted: clicked_id, feedback }

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _safeSpeak(text) {
    if (!text) return;
    try {
        if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
            window.speakAnswerOption(text);
        } else if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(String(text));
            u.rate = 0.85;
            window.speechSynthesis.speak(u);
        }
    } catch (_) { /* TTS unavailable */ }
}

function _isEmoji(str) {
    if (!str || str.length > 8) return false;
    return !/[a-zA-Z0-9]/.test(str);
}

function _anchorImageHtml(image, alt) {
    if (!image) return '';
    if (_isEmoji(image)) {
        return `<div class="lq-xsc-anchor-image" role="img"
                     aria-label="${_esc(alt)}">${_esc(image)}</div>`;
    }
    return `<div class="lq-xsc-anchor-image">
        <img src="${_esc(image)}" alt="${_esc(alt)}" class="lq-xsc-anchor-img">
    </div>`;
}

// ── SVG X-strikethrough animation ─────────────────────────────────────────────
//
// Draws two animated <line> elements from corner to corner of the target element.
// Uses stroke-dashoffset trick: dasharray = full diagonal length, offset = same,
// then transition offset to 0 → line "draws" itself over 250 ms.
// Color: red (#e53935), stroke-width 4px, rounded caps.

function _applyXStrike(btn) {
    // Idempotent: remove any existing strike overlay
    const existing = btn.querySelector('.lq-xsc-x-overlay');
    if (existing) existing.remove();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'lq-xsc-x-overlay');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;' +
        'pointer-events:none;overflow:visible;z-index:10;';

    // Diagonal length for a 100×100 viewBox
    const D = 141.4; // √(100²+100²)

    function makeLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(x1));
        line.setAttribute('y1', String(y1));
        line.setAttribute('x2', String(x2));
        line.setAttribute('y2', String(y2));
        line.setAttribute('stroke', '#e53935');
        line.setAttribute('stroke-width', '5');
        line.setAttribute('stroke-linecap', 'round');
        // Start fully hidden; transition reveals it
        line.style.cssText =
            `stroke-dasharray:${D};stroke-dashoffset:${D};` +
            'transition:stroke-dashoffset 250ms ease-in-out;';
        return line;
    }

    const line1 = makeLine(4, 4, 96, 96);   // top-left → bottom-right
    const line2 = makeLine(96, 4, 4, 96);   // top-right → bottom-left
    svg.appendChild(line1);
    svg.appendChild(line2);

    // Ensure button has position context
    const pos = getComputedStyle(btn).position;
    if (pos === 'static') btn.style.position = 'relative';

    btn.appendChild(svg);

    // Two-frame delay to ensure the element is in the DOM before transitioning
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            line1.style.strokeDashoffset = '0';
            line2.style.strokeDashoffset = '0';
        });
    });
}

// ── Remove the X overlay (used for retry when inverted semantics = X the wrong one) ──
function _removeXStrike(btn) {
    const overlay = btn.querySelector('.lq-xsc-x-overlay');
    if (overlay) overlay.remove();
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderXStrikethroughChoice(q, container) {
    if (!container || !q) return;
    if (!Array.isArray(q.options) || q.options.length < 2) return;

    const isK2 = !!q.k2_appropriate;
    const opts = q.options;
    const imageAlt = q.image_alt || q.task_text || '';

    // Orientation: default side-by-side for 2 options, stacked for 3+
    const defaultOrientation = opts.length <= 2 ? 'side-by-side' : 'stacked';
    const orientation = q.option_orientation || defaultOrientation;
    const layoutClass = orientation === 'stacked'
        ? 'lq-xsc-options--stacked'
        : 'lq-xsc-options--side-by-side';
    const variantClass = isK2 ? 'lq-k2' : 'lq-2-5';

    const optionsHtml = opts.map((opt, idx) =>
        `<button type="button"
             class="lq-xsc-option-btn ${variantClass}"
             data-id="${_esc(opt.id)}"
             data-correct="${opt.correct ? '1' : '0'}"
             role="radio"
             aria-pressed="false"
             tabindex="${idx === 0 ? '0' : '-1'}">
             <span class="lq-xsc-option-label">${_esc(opt.label)}</span>
         </button>`
    ).join('');

    container.innerHTML = `
        <div class="lq-xsc-host">
            <div class="lq-xsc-instruction-band">
                <span class="lq-xsc-instruction-icon" aria-hidden="true">✕</span>
                <span class="lq-xsc-instruction-text">${_esc(q.task_text)}</span>
            </div>
            ${q.image ? _anchorImageHtml(q.image, imageAlt) : ''}
            <div class="lq-xsc-options ${layoutClass}"
                 role="radiogroup"
                 aria-label="Answer choices">
                ${optionsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
        </div>`;

    const host = container.querySelector('.lq-xsc-host');
    const optionsEl = host.querySelector('.lq-xsc-options');
    const feedbackEl = host.querySelector('.lq-feedback-zone');

    function allOptionBtns() {
        return Array.from(optionsEl.querySelectorAll('.lq-xsc-option-btn'));
    }

    // K-2: auto-speak instruction on mount
    if (isK2 && q.task_text) {
        setTimeout(() => _safeSpeak(q.task_text), 100);
    }

    // ── Determine semantic interpretation ─────────────────────────────────────
    // task_inverted = false (default): student should pick/circle the CORRECT option.
    //   → Wrong pick gets X'd; correct pick locks green.
    // task_inverted = true: student should X out the WRONG option.
    //   → Clicking the wrong option correctly: it gets X'd and we mark as correct.
    //   → Clicking the correct option (wrong choice): brief mark, then revert.
    //
    // In both cases the UX is identical: click an option, see an X or green lock.
    // The scoring logic differs.

    const inverted = !!q.task_inverted;

    // ── Click handler ─────────────────────────────────────────────────────────
    optionsEl.addEventListener('click', e => {
        const btn = e.target.closest('.lq-xsc-option-btn');
        if (!btn || btn.disabled) return;

        const clickedId  = btn.dataset.id;
        const markedCorr = btn.dataset.correct === '1';

        // In normal semantics: correct answer = clicking the correct option (markedCorr === true)
        // In inverted semantics: correct answer = clicking the WRONG option (markedCorr === false)
        const answerIsCorrect = inverted ? !markedCorr : markedCorr;

        // Deselect all
        allOptionBtns().forEach(b => {
            b.classList.remove('lq-selected');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('lq-selected');
        btn.setAttribute('aria-pressed', 'true');

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(answerIsCorrect);

        if (answerIsCorrect) {
            if (inverted) {
                // Student correctly X'd the wrong option → animate X on it
                _applyXStrike(btn);
                btn.classList.add('lq-correct');
            } else {
                // Student picked the correct option → green lock
                btn.classList.add('lq-correct');
            }
            feedbackEl.textContent = 'Correct!';
            allOptionBtns().forEach(b => { b.disabled = true; });
            container._lqLastResult = {
                correct: true, submitted: clickedId,
                feedback: 'Correct!', firstAttempt, _checked: true
            };
        } else {
            // Wrong: animate X on the wrong-pick button
            _applyXStrike(btn);
            btn.classList.add('lq-incorrect', 'lq-wrong-persistent');
            feedbackEl.textContent = 'Not that one — try again!';
            container._lqLastResult = {
                correct: false, submitted: clickedId,
                feedback: 'Wrong choice.', firstAttempt, _checked: false
            };
        }
    });

    // ── Keyboard navigation ───────────────────────────────────────────────────
    optionsEl.addEventListener('keydown', e => {
        const btns = allOptionBtns().filter(b => !b.disabled);
        const focused = document.activeElement;
        const idx = btns.indexOf(focused);

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            btns[(idx + 1) % btns.length].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            btns[(idx - 1 + btns.length) % btns.length].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (focused && focused.classList.contains('lq-xsc-option-btn')) focused.click();
        }
    });
}

// ─── check ────────────────────────────────────────────────────────────────────

export function checkXStrikethroughChoice(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container.' };

    if (container._lqLastResult && container._lqLastResult._checked) {
        return container._lqLastResult;
    }

    const selected = container.querySelector('.lq-xsc-option-btn.lq-selected');
    if (!selected) {
        return { correct: false, submitted: null, feedback: 'No answer selected.' };
    }

    const submitted    = selected.dataset.id;
    const markedCorr   = selected.dataset.correct === '1';
    const inverted     = !!q.task_inverted;
    const correct      = inverted ? !markedCorr : markedCorr;

    const correctOpt   = (q.options || []).find(o => o.correct);
    const wrongOpt     = (q.options || []).find(o => !o.correct);
    const targetLabel  = inverted
        ? (wrongOpt  ? wrongOpt.label  : '')
        : (correctOpt ? correctOpt.label : '');

    const feedback = correct
        ? 'Correct!'
        : `The answer is: ${targetLabel}`;

    const result = { correct, submitted, feedback };
    container._lqLastResult = result;
    return result;
}
