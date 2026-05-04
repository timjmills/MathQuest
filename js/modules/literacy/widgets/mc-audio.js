// mc-audio.js — Multiple-choice widget driven by an audio prompt.
//
// The question stem is primarily spoken, not read. A prominent "🔊 Listen"
// button at the top replays the prompt. Answer choices are text buttons
// (or image+text if option.image is present). For phonemic-awareness skills,
// options often combine an emoji/image with a letter (e.g., "🍎 a").
//
// Question contract:
//   q.stem / q.text:  question text (also used as TTS input if no q.audio_text)
//   q.audio_text:     optional — override text spoken by TTS (e.g., phoneme only)
//   q.options:        [{ id, label, text?, image? }]
//                     label — display text; image — optional URL or emoji
//   q.ans:            string — correct option id
//   q.k2_appropriate: boolean — K-2 variant rules (auto-speak, large targets, 3 options)
//
// Exports:
//   renderMcAudio(q, container) — mounts widget inside container
//   checkMcAudio(q, container)  — returns { correct, submitted, feedback }
//
// ALWAYS auto-triggers audio on render if state.ttsEnabled.

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _speakPrompt(q) {
    if (!state.ttsEnabled) return;
    const text = q.audio_text || q.stem || q.text || '';
    if (!text) return;
    if (typeof window.speakQuestion === 'function') {
        window.speakQuestion();
    } else if (typeof window.speakText === 'function') {
        window.speakText(text);
    }
}

function _safeSpeak(text) {
    if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(text);
    }
}

function _optionText(opt) {
    return opt.label != null ? opt.label : (opt.text != null ? opt.text : '');
}

function _renderOptionInner(opt) {
    const label = _optionText(opt);
    if (opt.image) {
        // image may be a URL or an emoji string — render as <img> or inline text
        const isUrl = /^https?:\/\/|^\/|^\.\//i.test(opt.image);
        const visual = isUrl
            ? `<img class="lq-mc-audio-opt-img" src="${opt.image}" alt="">`
            : `<span class="lq-mc-audio-opt-emoji" aria-hidden="true">${opt.image}</span>`;
        return `${visual}<span class="lq-mc-audio-opt-label">${label}</span>`;
    }
    return `<span class="lq-mc-audio-opt-label">${label}</span>`;
}

// ─── render ─────────────────────────────────────────────────────────────────

export function renderMcAudio(q, container) {
    if (!container || !q || !Array.isArray(q.options)) return;

    const isK2 = !!q.k2_appropriate;
    const variantClass = isK2 ? 'lq-k2' : 'lq-2-5';
    const gridClass = (isK2 || q.options.length <= 3)
        ? 'lq-mc-grid lq-mc-grid--stacked'
        : 'lq-mc-grid lq-mc-grid--2x2';

    const listenBtnClass = isK2
        ? 'lq-audio-listen-btn lq-audio-listen-btn--k2'
        : 'lq-audio-listen-btn';

    const optionsHtml = q.options.map(opt => {
        const label = _optionText(opt);
        const audioLabel = label ? `Listen: ${label}` : 'Listen to option';
        return `<button type="button"
            class="lq-mc-button lq-mc-audio-opt ${variantClass}"
            data-id="${opt.id}"
            role="radio"
            aria-pressed="false"
            aria-checked="false">
            ${_renderOptionInner(opt)}
            <button type="button" class="lq-audio-btn" data-audio-for="${opt.id}"
                aria-label="${audioLabel}"
                tabindex="-1">🔊</button>
        </button>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-mc-audio-wrap">
            <button type="button" class="${listenBtnClass}" id="lq-listen-btn">
                🔊 Listen
            </button>
            <div class="${gridClass}" role="radiogroup" aria-label="Answer choices">
                ${optionsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
        </div>`;

    const grid = container.querySelector('.lq-mc-grid');
    const feedbackZone = container.querySelector('.lq-feedback-zone');
    const listenBtn = container.querySelector('.lq-audio-listen-btn');

    // ── Always auto-trigger audio on render when TTS is on ────────────────
    if (state.ttsEnabled) {
        setTimeout(() => _speakPrompt(q), 80);
    }

    // ── Listen button replays prompt ──────────────────────────────────────
    listenBtn.addEventListener('click', () => _speakPrompt(q));

    // ── event delegation: clicks inside grid ──────────────────────────────
    grid.addEventListener('click', e => {
        // Audio button on option
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

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(correct);

        if (correct) {
            btn.classList.add('lq-correct');
            feedbackZone.textContent = 'Correct!';
            allBtns.forEach(b => { b.disabled = true; });
            listenBtn.disabled = true;
        } else {
            btn.classList.add('lq-incorrect');
            btn.classList.add('lq-wrong-persistent');
            feedbackZone.textContent = 'Not quite — listen again and try!';
        }

        container._lqLastResult = { correct, submitted: submittedId, firstAttempt };
    });

    // ── keyboard: arrow keys move focus; Enter/Space selects ─────────────
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

export function checkMcAudio(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container' };

    if (container._lqLastResult) {
        const { correct, submitted, firstAttempt } = container._lqLastResult;
        const correctOpt = (q.options || []).find(o => o.id === q.ans);
        const feedback = correct
            ? 'Correct!'
            : `The correct answer was: ${_optionText(correctOpt || {})}`;
        return { correct, submitted, feedback, firstAttempt };
    }

    const selected = container.querySelector('.lq-mc-button.lq-selected');
    if (!selected) {
        return { correct: false, submitted: null, feedback: 'No answer selected.' };
    }

    const submitted = selected.dataset.id;
    const correct = submitted === q.ans;
    const correctOpt = (q.options || []).find(o => o.id === q.ans);
    const feedback = correct
        ? 'Correct!'
        : `The correct answer was: ${_optionText(correctOpt || {})}`;
    return { correct, submitted, feedback };
}
