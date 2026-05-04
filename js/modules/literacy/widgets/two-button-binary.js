// two-button-binary.js — Two-option binary-choice widget (e.g. Capitalize / No Capital).
//
// Question contract:
//   q.subject:        string  — word or phrase being evaluated ("doha", "Tuesday")
//   q.stem:           string  — binary question ("Should this word be capitalized?")
//   q.options:        [{ id, label }, { id, label }]  — exactly 2 options
//   q.ans:            string  — id of the correct option ("yes" | "no")
//   q.audio_text?:    string  — override for TTS (defaults to q.subject)
//   q.k2_appropriate?: boolean — K-2: vivid solid pills + auto-speak
//   q.skillLabel?:    string  — card title (falls back to q.title)
//   q.title?:         string  — card title fallback
//
// Exports:
//   renderTwoButtonBinary(q, container)  — mounts widget inside container
//   checkTwoButtonBinary(q, container)   — returns { correct, submitted, feedback }
//
// Follows the mc-text.js widget pattern.

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _safeSpeak(text) {
    try {
        if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
            window.speakAnswerOption(text);
        }
    } catch (_) { /* TTS not available — silent no-op */ }
}

function _cardTitle(q) {
    return q.skillLabel || q.title || '';
}

// ─── render ─────────────────────────────────────────────────────────────────

export function renderTwoButtonBinary(q, container) {
    if (!container || !q) return;
    if (!Array.isArray(q.options) || q.options.length < 2) return;

    const isK2 = !!q.k2_appropriate;
    const variantClass = isK2 ? 'lq-k2' : 'lq-2-5';

    // K-2 buttons get semantic color modifiers: first option = affirm (green),
    // second option = negate (blue). 2-5 stays outlined neutral per Image 8.
    const btnColorClass = (idx) => {
        if (!isK2) return '';
        return idx === 0 ? ' lq-tbb-affirm' : ' lq-tbb-negate';
    };

    const title = _cardTitle(q);
    const audioText = q.audio_text || q.subject || '';

    const titleHtml = title
        ? `<div class="lq-tbb-title" aria-hidden="true">${title}</div>`
        : '';

    const audioHtml = audioText
        ? `<button type="button"
               class="lq-audio-btn lq-tbb-audio"
               aria-label="Listen to word"
               tabindex="0">&#128266;</button>`
        : '';

    const buttonsHtml = q.options.map((opt, idx) =>
        `<button type="button"
             class="lq-tbb-button ${variantClass}${btnColorClass(idx)}"
             data-id="${opt.id}"
             role="radio"
             aria-pressed="false"
             tabindex="${idx === 0 ? '0' : '-1'}">
             ${opt.label}
         </button>`
    ).join('');

    container.innerHTML = `
        <div class="lq-tbb-card">
            ${titleHtml}
            <div class="lq-tbb-subject-row">
                <span class="lq-tbb-subject" aria-label="Word to evaluate">${q.subject || ''}</span>
                ${audioHtml}
            </div>
            <p class="lq-tbb-stem">${q.stem || ''}</p>
            <div class="lq-tbb-btn-group"
                 role="radiogroup"
                 aria-label="${q.stem || 'Choose one'}">
                ${buttonsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="polite" aria-atomic="true"></div>
        </div>`;

    const btnGroup   = container.querySelector('.lq-tbb-btn-group');
    const allBtns    = () => Array.from(btnGroup.querySelectorAll('.lq-tbb-button'));
    const feedbackEl = container.querySelector('.lq-feedback-zone');

    // K-2: auto-speak subject on mount
    if (isK2 && audioText) {
        setTimeout(() => _safeSpeak(audioText), 80);
    }

    // ── audio button ─────────────────────────────────────────────────────────
    const audioBtn = container.querySelector('.lq-tbb-audio');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => _safeSpeak(audioText));
    }

    // ── selection + check (single click → instant result) ───────────────────
    btnGroup.addEventListener('click', e => {
        const btn = e.target.closest('.lq-tbb-button');
        if (!btn || btn.disabled) return;

        // Mark selected visually
        allBtns().forEach(b => {
            b.classList.remove('lq-selected');
            b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('lq-selected');
        btn.setAttribute('aria-pressed', 'true');

        // Auto-check immediately (fast drill pacing per Image 8)
        const result = checkTwoButtonBinary(q, container);

        // Expose for external check calls
        container._lqLastResult = result;

        if (result.correct) {
            btn.classList.add('lq-correct');
            feedbackEl.textContent = 'Correct!';
            // Lock both buttons
            allBtns().forEach(b => { b.disabled = true; });
        } else {
            btn.classList.add('lq-incorrect', 'lq-wrong-persistent');
            feedbackEl.textContent = 'Not quite — try the other one!';
            // Leave the other button clickable for retry
        }
    });

    // ── keyboard: Left/Right arrow moves between buttons; Enter selects ──────
    btnGroup.addEventListener('keydown', e => {
        const btns = allBtns().filter(b => !b.disabled);
        if (!btns.length) return;
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
            if (focused && focused.classList.contains('lq-tbb-button')) {
                focused.click();
            }
        }
    });
}

// ─── check ──────────────────────────────────────────────────────────────────

export function checkTwoButtonBinary(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container.' };

    // If the click handler already stored a result, return it directly
    // (avoids re-running on external check calls after lock)
    if (container._lqLastResult && container._lqLastResult._checked) {
        return container._lqLastResult;
    }

    const selected = container.querySelector('.lq-tbb-button.lq-selected');
    if (!selected) {
        return { correct: false, submitted: null, feedback: 'No answer selected.' };
    }

    const submitted = selected.dataset.id;
    const correct   = submitted === q.ans;

    // Gate scoring to first attempt
    const firstAttempt = isFirstAttempt();
    markFirstAttempt(correct);

    const correctOpt = Array.isArray(q.options)
        ? q.options.find(o => o.id === q.ans)
        : null;
    const correctLabel = correctOpt ? correctOpt.label : q.ans;
    const feedback = correct
        ? 'Correct!'
        : `The correct answer is: ${correctLabel}`;

    const result = { correct, submitted, feedback, firstAttempt, _checked: true };
    container._lqLastResult = result;
    return result;
}
