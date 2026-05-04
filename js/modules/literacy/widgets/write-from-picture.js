// write-from-picture.js — ETC Type 16: picture → type the word.
//
// The picture IS the prompt; there is no sentence frame. The student types
// the word that names the picture. Grading checks q.acceptable_answers[].
// Optional letter-count hint and K-2 auto-speak for the target word.
//
// Question contract:
//   q.image:                  string    — emoji or URL
//   q.image_alt?:             string    — accessibility label
//   q.acceptable_answers:     string[]  — any-of match; first value is canonical
//   q.case_sensitive?:        boolean   — default false
//   q.normalize_whitespace?:  boolean   — default true
//   q.task_text?:             string    — default "Type the word for the picture"
//   q.show_letter_count?:     boolean   — default true; shows underline hint boxes
//   q.audio_prompt?:          boolean   — default true; auto-speak canonical answer
//   q.k2_appropriate?:        boolean
//
// Exports:
//   renderWriteFromPicture(q, container)
//   checkWriteFromPicture(q, container)
//     → { correct, submitted: string, feedback }

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── normalization ────────────────────────────────────────────────────────────

function _normalize(raw, q) {
    let s = String(raw == null ? '' : raw);
    if (q.normalize_whitespace !== false) {
        s = s.trim().replace(/\s+/g, ' ');
    }
    if (!q.case_sensitive) {
        s = s.toLowerCase();
    }
    return s;
}

function _checkAnswer(userValue, q) {
    const answers = Array.isArray(q.acceptable_answers) ? q.acceptable_answers : [];
    const normalized = _normalize(userValue, q);
    return answers.some(a => _normalize(a, q) === normalized);
}

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
            u.rate = 0.75;
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
        return `<div class="lq-wfp-picture" role="img" aria-label="${_esc(alt)}">${_esc(image)}</div>`;
    }
    return `<div class="lq-wfp-picture">
        <img src="${_esc(image)}" alt="${_esc(alt)}" class="lq-wfp-img">
    </div>`;
}

function _letterHintHtml(canonicalWord) {
    // Shows underline boxes for each letter: _ _ _ (ETC-style writing line hint)
    if (!canonicalWord) return '';
    const boxes = canonicalWord.split('').map(() =>
        `<span class="lq-wfp-letter-box" aria-hidden="true"></span>`
    ).join('');
    return `<div class="lq-wfp-letter-hint" aria-label="${canonicalWord.length} letters">
        ${boxes}
    </div>`;
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderWriteFromPicture(q, container) {
    if (!container || !q) return;

    const isK2 = !!q.k2_appropriate;
    const taskText = q.task_text || 'Type the word for the picture';
    const imageAlt = q.image_alt || (Array.isArray(q.acceptable_answers) ? q.acceptable_answers[0] : '');
    const canonicalWord = Array.isArray(q.acceptable_answers) && q.acceptable_answers.length > 0
        ? q.acceptable_answers[0]
        : '';

    const showLetterCount = q.show_letter_count !== false;
    const doAudioPrompt   = q.audio_prompt !== false;

    const inputSizeStyle = isK2
        ? 'height:2.8rem;font-size:1.3rem;min-width:180px;'
        : 'height:2.2rem;font-size:1rem;min-width:140px;';

    const speakLabel = canonicalWord ? `Listen: ${_esc(canonicalWord)}` : 'Listen';

    container.innerHTML = `
        <div class="lq-wfp-host">
            <p class="lq-wfp-task">${_esc(taskText)}</p>
            <div class="lq-wfp-picture-wrap">
                ${_pictureHtml(q.image, imageAlt)}
                <button type="button"
                    class="lq-wfp-speak-btn lq-audio-btn"
                    data-speak="${_esc(canonicalWord)}"
                    aria-label="${speakLabel}">&#128266;</button>
            </div>
            ${showLetterCount && canonicalWord ? _letterHintHtml(canonicalWord) : ''}
            <div class="lq-wfp-input-row">
                <input
                    type="text"
                    class="lq-wfp-input"
                    aria-label="Type the word"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    style="${inputSizeStyle}"
                    placeholder="type here">
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-wfp-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-wfp-host');
    const input = host.querySelector('.lq-wfp-input');
    const feedbackEl = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-wfp-submit');
    const speakBtn = host.querySelector('.lq-wfp-speak-btn');

    let locked = false;

    // K-2 / audio prompt: speak the word on mount
    if (doAudioPrompt && (isK2 || (state && state.ttsEnabled)) && canonicalWord) {
        setTimeout(() => _safeSpeak(canonicalWord), 150);
    }

    // Speaker button
    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            const txt = speakBtn.dataset.speak;
            if (txt) _safeSpeak(txt);
        });
    }

    // Enable submit when input has content
    function refreshSubmit() {
        submitBtn.disabled = locked || input.value.trim().length === 0;
    }

    input.addEventListener('input', refreshSubmit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            e.preventDefault();
            submitBtn.click();
        }
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const submitted = input.value;
        const correct = _checkAnswer(submitted, q);
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(correct);

        if (correct) {
            input.classList.add('lq-locked-correct');
            input.disabled = true;
            feedbackEl.textContent = 'Correct!';
            locked = true;
            submitBtn.disabled = true;
        } else {
            // Red flash, then clear for retry
            input.classList.add('lq-wrong-persistent');
            feedbackEl.textContent = 'Not quite — try again!';
            // Brief flash animation then clear
            setTimeout(() => {
                input.classList.remove('lq-wrong-persistent');
                input.value = '';
                refreshSubmit();
                input.focus();
            }, 600);
        }

        container._lqLastResult = {
            correct,
            submitted,
            firstAttempt,
            feedback: correct
                ? 'Correct!'
                : `The answer is: ${canonicalWord}`
        };
    });

    refreshSubmit();
    // Auto-focus input for keyboard users
    setTimeout(() => { if (!locked) input.focus(); }, 80);
}

// ─── check ────────────────────────────────────────────────────────────────────

export function checkWriteFromPicture(q, container) {
    if (!container) return { correct: false, submitted: '', feedback: 'No container.' };
    if (container._lqLastResult) return container._lqLastResult;

    const input = container.querySelector('.lq-wfp-input');
    if (!input) return { correct: false, submitted: '', feedback: 'No input found.' };

    const submitted = input.value;
    const correct = _checkAnswer(submitted, q);
    const canonicalWord = Array.isArray(q.acceptable_answers) ? q.acceptable_answers[0] : '';
    const feedback = correct ? 'Correct!' : `The answer is: ${canonicalWord}`;

    return { correct, submitted, feedback };
}
