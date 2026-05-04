// mc-text.js — Single-select multiple-choice widget with text options.
//
// Question contract:
//   q.options:       [{ id, label, text? }]  (label or text for display)
//   q.ans:           string — correct option id
//   q.k2_appropriate: boolean — true → 3 options stacked vivid-pill (K-2 mode)
//                               false/undefined → 4 options 2×2 outlined (2-5 mode)
//
// Exports:
//   renderMcText(q, container)  — mounts widget inside container
//   checkMcText(q, container)   — returns { correct, submitted, feedback }
//
// Follows the Math Quest widget contract (same pattern as multi-select-check.js).

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _optionText(opt) {
    return opt.label != null ? opt.label : (opt.text != null ? opt.text : '');
}

function _safeSpeak(text) {
    if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(text);
    }
}

function _buildAudioBtn(text, optId) {
    const safe = text.replace(/'/g, '&#39;');
    return `<button type="button" class="lq-audio-btn" data-audio-for="${optId}"
        aria-label="Listen to option"
        tabindex="-1">🔊</button>`;
}

// ─── render ─────────────────────────────────────────────────────────────────

export function renderMcText(q, container) {
    if (!container || !q || !Array.isArray(q.options)) return;

    const isK2 = !!q.k2_appropriate;
    const variantClass = isK2 ? 'lq-k2' : 'lq-2-5';
    const gridClass = isK2 ? 'lq-mc-grid lq-mc-grid--stacked' : 'lq-mc-grid lq-mc-grid--2x2';

    // Auto-speak stem for K-2 when TTS is on
    if (isK2 && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        // Defer slightly so DOM settles first
        setTimeout(() => window.speakQuestion(), 80);
    }

    const buttonsHtml = q.options.map(opt => {
        const text = _optionText(opt);
        return `<button type="button"
            class="lq-mc-button ${variantClass}"
            data-id="${opt.id}"
            role="radio"
            aria-pressed="false"
            aria-checked="false">
            <span class="lq-mc-button-text">${text}</span>
            ${_buildAudioBtn(text, opt.id)}
        </button>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-mc-grid-wrap">
            <div class="${gridClass}" role="radiogroup" aria-label="Answer choices">
                ${buttonsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
        </div>`;

    const grid = container.querySelector('.lq-mc-grid');
    const feedbackZone = container.querySelector('.lq-feedback-zone');

    // ── event delegation: clicks inside the grid ──────────────────────────
    grid.addEventListener('click', e => {
        // Audio button — speak option text, do not select
        const audioBtn = e.target.closest('.lq-audio-btn');
        if (audioBtn) {
            e.stopPropagation();
            const optId = audioBtn.dataset.audioFor;
            const opt = q.options.find(o => o.id === optId);
            if (opt) _safeSpeak(_optionText(opt));
            return;
        }

        // Option button
        const btn = e.target.closest('.lq-mc-button');
        if (!btn || btn.disabled) return;

        const allBtns = grid.querySelectorAll('.lq-mc-button');

        // Deselect all, then select clicked
        allBtns.forEach(b => {
            b.classList.remove('lq-selected');
            b.setAttribute('aria-pressed', 'false');
            b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('lq-selected');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-checked', 'true');

        const submittedId = btn.dataset.id;
        const correct = submittedId === q.ans;

        // Gate scoring to first attempt
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(correct);

        if (correct) {
            btn.classList.add('lq-correct');
            feedbackZone.textContent = 'Correct!';
            // Lock all buttons
            allBtns.forEach(b => { b.disabled = true; });
        } else {
            btn.classList.add('lq-incorrect');
            btn.classList.add('lq-wrong-persistent');
            feedbackZone.textContent = 'Not quite — try again!';
        }

        // Expose last result on container for checkMcText
        container._lqLastResult = { correct, submitted: submittedId, firstAttempt };
    });

    // ── keyboard: arrow keys move focus; Enter selects ────────────────────
    grid.addEventListener('keydown', e => {
        const allBtns = Array.from(grid.querySelectorAll('.lq-mc-button:not([disabled])'));
        const current = document.activeElement;
        const idx = allBtns.indexOf(current);

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            allBtns[(idx + 1) % allBtns.length].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            allBtns[(idx - 1 + allBtns.length) % allBtns.length].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (current && current.classList.contains('lq-mc-button')) {
                current.click();
            }
        }
    });
}

// ─── check ──────────────────────────────────────────────────────────────────

export function checkMcText(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container' };

    // Return the result set by the click handler if available
    if (container._lqLastResult) {
        const { correct, submitted, firstAttempt } = container._lqLastResult;
        const feedback = correct
            ? 'Correct!'
            : `The correct answer was: ${_optionText(q.options.find(o => o.id === q.ans) || {})}`;
        return { correct, submitted, feedback, firstAttempt };
    }

    // Nothing selected yet
    const selected = container.querySelector('.lq-mc-button.lq-selected');
    if (!selected) {
        return { correct: false, submitted: null, feedback: 'No answer selected.' };
    }

    const submitted = selected.dataset.id;
    const correct = submitted === q.ans;
    const feedback = correct
        ? 'Correct!'
        : `The correct answer was: ${_optionText(q.options.find(o => o.id === q.ans) || {})}`;
    return { correct, submitted, feedback };
}
