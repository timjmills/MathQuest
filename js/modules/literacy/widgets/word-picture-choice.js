// word-picture-choice.js — ETC Type 5 (picture + two word options).
//
// Large picture in center; two word buttons below. Student picks the word
// that names the picture. On wrong pick: the button gets a strikethrough-X
// animation and the correct button remains available.
//
// Question contract:
//   q.image:            string              — emoji or image URL
//   q.image_alt?:       string              — accessibility label (defaults to q.task_text)
//   q.options: [
//       { id: string, label: string, correct: boolean, audio_text?: string }
//   ]                                       — exactly 2 options
//   q.task_text?:       string              — default "Which word names the picture?"
//   q.k2_appropriate?:  boolean             — vivid pill style + auto-speak
//
// Exports:
//   renderWordPictureChoice(q, container)
//   checkWordPictureChoice(q, container)
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

function _pictureHtml(image, alt) {
    if (!image) return '';
    if (_isEmoji(image)) {
        return `<div class="lq-wpc-picture" role="img" aria-label="${_esc(alt)}">${_esc(image)}</div>`;
    }
    return `<div class="lq-wpc-picture">
        <img src="${_esc(image)}" alt="${_esc(alt)}" class="lq-wpc-img">
    </div>`;
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderWordPictureChoice(q, container) {
    if (!container || !q) return;
    if (!Array.isArray(q.options) || q.options.length < 2) return;

    const isK2 = !!q.k2_appropriate;
    const taskText = q.task_text || 'Which word names the picture?';
    const imageAlt = q.image_alt || taskText;
    const variantClass = isK2 ? 'lq-k2' : 'lq-2-5';

    const buttonsHtml = q.options.map((opt, idx) =>
        `<div class="lq-wpc-btn-wrap">
            <button type="button"
                class="lq-wpc-word-btn ${variantClass}"
                data-id="${_esc(opt.id)}"
                data-correct="${opt.correct ? '1' : '0'}"
                data-audio="${_esc(opt.audio_text || opt.label)}"
                role="radio"
                aria-pressed="false"
                tabindex="${idx === 0 ? '0' : '-1'}">
                <span class="lq-wpc-label">${_esc(opt.label)}</span>
            </button>
            <button type="button"
                class="lq-wpc-audio-btn lq-audio-btn"
                data-speak="${_esc(opt.audio_text || opt.label)}"
                aria-label="Listen: ${_esc(opt.label)}"
                tabindex="-1">&#128266;</button>
        </div>`
    ).join('');

    container.innerHTML = `
        <div class="lq-wpc-card">
            <p class="lq-wpc-prompt">${_esc(taskText)}</p>
            ${_pictureHtml(q.image, imageAlt)}
            <div class="lq-wpc-options" role="radiogroup" aria-label="Word choices">
                ${buttonsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
        </div>`;

    const card = container.querySelector('.lq-wpc-card');
    const optionsEl = card.querySelector('.lq-wpc-options');
    const feedbackEl = card.querySelector('.lq-feedback-zone');

    // K-2: auto-speak the correct word when TTS is on
    if (isK2 && state.ttsEnabled) {
        const correctOpt = q.options.find(o => o.correct);
        if (correctOpt) {
            setTimeout(() => _safeSpeak(correctOpt.audio_text || correctOpt.label), 100);
        }
    }

    // ── Event delegation ──────────────────────────────────────────────────────
    card.addEventListener('click', e => {
        // Audio buttons
        const audioBtn = e.target.closest('.lq-wpc-audio-btn');
        if (audioBtn) {
            e.stopPropagation();
            const txt = audioBtn.dataset.speak;
            if (txt) _safeSpeak(txt);
            return;
        }

        const wordBtn = e.target.closest('.lq-wpc-word-btn');
        if (!wordBtn || wordBtn.disabled) return;

        const allBtns = Array.from(optionsEl.querySelectorAll('.lq-wpc-word-btn'));
        const isCorrect = wordBtn.dataset.correct === '1';
        const clickedId = wordBtn.dataset.id;

        // Deselect all, then mark selected
        allBtns.forEach(b => {
            b.classList.remove('lq-selected');
            b.setAttribute('aria-pressed', 'false');
        });
        wordBtn.classList.add('lq-selected');
        wordBtn.setAttribute('aria-pressed', 'true');

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(isCorrect);

        if (isCorrect) {
            wordBtn.classList.add('lq-correct');
            feedbackEl.textContent = 'Correct!';
            allBtns.forEach(b => { b.disabled = true; });
            container._lqLastResult = {
                correct: true, submitted: clickedId,
                feedback: 'Correct!', firstAttempt, _checked: true
            };
        } else {
            // Animate X strikethrough across the wrong button
            _applyXStrike(wordBtn);
            wordBtn.classList.add('lq-incorrect', 'lq-wrong-persistent');
            feedbackEl.textContent = 'Not that one — try the other word!';
            container._lqLastResult = {
                correct: false, submitted: clickedId,
                feedback: 'Wrong word selected.', firstAttempt, _checked: false
            };
        }
    });

    // ── Keyboard navigation ───────────────────────────────────────────────────
    optionsEl.addEventListener('keydown', e => {
        const btns = Array.from(optionsEl.querySelectorAll('.lq-wpc-word-btn:not([disabled])'));
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
            if (focused && focused.classList.contains('lq-wpc-word-btn')) focused.click();
        }
    });
}

// ── X-strike animation helper ─────────────────────────────────────────────────
// Draws two SVG lines corner-to-corner inside the button, animated via
// stroke-dashoffset from length → 0 over 250 ms.

function _applyXStrike(btn) {
    // Remove any existing strike to avoid duplicates
    const existing = btn.querySelector('.lq-wpc-x-svg');
    if (existing) existing.remove();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'lq-wpc-x-svg');
    svg.setAttribute('aria-hidden', 'true');
    // Position absolute, fills the button
    svg.style.cssText =
        'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:visible;';

    // We'll use a viewBox matching typical button proportions; coords are percentages
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');

    const diagonalLength = Math.sqrt(100 * 100 + 100 * 100); // ~141

    function makeLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1); line.setAttribute('y1', y1);
        line.setAttribute('x2', x2); line.setAttribute('y2', y2);
        line.setAttribute('stroke', '#e53935');
        line.setAttribute('stroke-width', '5');
        line.setAttribute('stroke-linecap', 'round');
        line.style.cssText =
            `stroke-dasharray:${diagonalLength};stroke-dashoffset:${diagonalLength};` +
            'transition:stroke-dashoffset 250ms ease-in-out;';
        return line;
    }

    const line1 = makeLine(5, 5, 95, 95);   // top-left → bottom-right
    const line2 = makeLine(95, 5, 5, 95);   // top-right → bottom-left
    svg.appendChild(line1);
    svg.appendChild(line2);

    // Ensure button is positioned relative so absolute SVG is contained
    const prevPosition = getComputedStyle(btn).position;
    if (prevPosition === 'static') btn.style.position = 'relative';

    btn.appendChild(svg);

    // Trigger animation on next frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            line1.style.strokeDashoffset = '0';
            line2.style.strokeDashoffset = '0';
        });
    });
}

// ─── check ────────────────────────────────────────────────────────────────────

export function checkWordPictureChoice(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container.' };

    if (container._lqLastResult && container._lqLastResult._checked) {
        return container._lqLastResult;
    }

    const selected = container.querySelector('.lq-wpc-word-btn.lq-selected');
    if (!selected) {
        return { correct: false, submitted: null, feedback: 'No answer selected.' };
    }

    const submitted = selected.dataset.id;
    const correct = selected.dataset.correct === '1';
    const correctOpt = (q.options || []).find(o => o.correct);
    const feedback = correct
        ? 'Correct!'
        : `The correct word is: ${correctOpt ? correctOpt.label : ''}`;

    const result = { correct, submitted, feedback };
    container._lqLastResult = result;
    return result;
}
