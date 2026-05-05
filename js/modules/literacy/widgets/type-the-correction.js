// type-the-correction.js — Scaffolded variant of correct-the-mistake.
//
// The error is pre-marked in red; the student types only the corrected word.
// SPED/ELL friendly because the locate-the-error step is removed.
//
// Question contract:
//   q.stem:               string  — instruction (e.g., "Type the correct spelling.")
//   q.text:               string  — sentence prefix shown before the error word
//   q.error_word:         string  — the misspelled/wrong word, shown in a red box
//   q.text_after?:        string  — optional sentence suffix shown after the error word
//   q.correct_answer:     string  — the canonical correct word
//   q.accepted_answers?:  string[] — extra accepted variants; defaults to [correct_answer]
//   q.case_insensitive?:  boolean — default true
//
// Exports:
//   renderTypeTheCorrection(q, container)
//   checkTypeTheCorrection(q, container)

import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _normalize(s, caseInsensitive) {
    let out = String(s == null ? '' : s).trim().replace(/\s+/g, ' ');
    if (caseInsensitive) out = out.toLowerCase();
    return out;
}

function _matches(input, accepted, caseInsensitive) {
    const norm = _normalize(input, caseInsensitive);
    if (!norm) return false;
    return accepted.some(a => _normalize(a, caseInsensitive) === norm);
}

export function renderTypeTheCorrection(q, container) {
    if (!container || !q) return;

    const stem = q.stem || 'Type the correct spelling.';
    const textBefore = q.text || '';
    const errorWord = q.error_word || '';
    const textAfter = q.text_after || '';
    const caseInsensitive = q.case_insensitive !== false;
    const accepted = Array.isArray(q.accepted_answers) && q.accepted_answers.length
        ? q.accepted_answers
        : [q.correct_answer || ''];

    container.innerHTML = `
        <div class="lq-tc-host">
            <p class="lq-tc-stem">${_esc(stem)}</p>
            <div class="lq-tc-sentence">
                <span class="lq-tc-before">${_esc(textBefore)}</span><span
                    class="lq-tc-error"
                    aria-label="error word: ${_esc(errorWord)}"
                    title="This word has an error">${_esc(errorWord)}</span><span class="lq-tc-after">${_esc(textAfter)}</span>
            </div>
            <div class="lq-tc-input-row">
                <label class="lq-tc-label" for="lq-tc-input">Correction:</label>
                <input id="lq-tc-input" class="lq-tc-input" type="text"
                    autocomplete="off" autocorrect="off"
                    autocapitalize="off" spellcheck="false"
                    aria-label="Type the correct word">
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-tc-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-tc-host');
    const input = host.querySelector('.lq-tc-input');
    const submitBtn = host.querySelector('.lq-tc-submit');
    const feedbackZone = host.querySelector('.lq-feedback-zone');

    function refreshSubmit() {
        submitBtn.disabled = input.disabled || !input.value.trim();
    }

    input.addEventListener('input', refreshSubmit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!submitBtn.disabled) submitBtn.click();
        }
    });

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled) return;
        const value = input.value;
        const correct = _matches(value, accepted, caseInsensitive);
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(correct);

        if (correct) {
            input.classList.add('lq-locked-correct');
            input.classList.remove('lq-wrong-persistent');
            input.disabled = true;
            submitBtn.disabled = true;
            feedbackZone.textContent = 'Correct!';
        } else {
            input.classList.add('lq-wrong-persistent');
            input.classList.remove('lq-locked-correct');
            feedbackZone.textContent = 'Not quite — try again!';
            setTimeout(() => input.classList.remove('lq-wrong-persistent'), 1500);
            input.select();
        }

        container._lqLastResult = {
            correct,
            submitted: value,
            firstAttempt
        };
    });

    setTimeout(() => { try { input.focus(); } catch (_) {} }, 50);
    refreshSubmit();
}

export function checkTypeTheCorrection(q, container) {
    if (!container) return { correct: false, submitted: '', feedback: 'No container' };
    if (container._lqLastResult) {
        const { correct, submitted, firstAttempt } = container._lqLastResult;
        const feedback = correct
            ? 'Correct!'
            : `The correct answer was: ${q.correct_answer || ''}`;
        return { correct, submitted, feedback, firstAttempt };
    }
    const input = container.querySelector('.lq-tc-input');
    if (!input) return { correct: false, submitted: '', feedback: 'No input' };
    const caseInsensitive = q.case_insensitive !== false;
    const accepted = Array.isArray(q.accepted_answers) && q.accepted_answers.length
        ? q.accepted_answers
        : [q.correct_answer || ''];
    const correct = _matches(input.value, accepted, caseInsensitive);
    const feedback = correct
        ? 'Correct!'
        : `The correct answer was: ${q.correct_answer || ''}`;
    return { correct, submitted: input.value, feedback };
}
