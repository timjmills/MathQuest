// correct-the-mistake.js — Compound widget: highlight an error in a sentence
// AND type the correction. Both sub-steps must be correct for the item to grade
// correct.
//
// Question contract:
//   q.stem:              string — instructional prompt
//   q.text:              string — the sentence containing the error
//   q.error_index:       number — 0-based word index of the erroneous word
//   q.correct_word:      string — canonical correct word (for feedback)
//   q.accepted_answers:  string[] — accepted typed corrections
//   q.case_insensitive:  boolean (default true)
//
// Render:
//   - Sentence rendered as tappable words.
//   - Below: input field, disabled until a word is selected.
//   - Wrong word selection → red flash, input stays disabled.
//   - Correct word selection → input becomes active.
//   - Submit checks BOTH selected_index === error_index AND typed answer.
//
// Exports:
//   renderCorrectTheMistake(q, container)
//   checkCorrectTheMistake(q, container)

import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _normalize(raw, caseInsensitive) {
    let s = String(raw == null ? '' : raw).trim().replace(/\s+/g, ' ');
    if (caseInsensitive) s = s.toLowerCase();
    return s;
}

function _checkTyped(value, q) {
    const ci = q.case_insensitive !== false;
    const accepted = Array.isArray(q.accepted_answers) && q.accepted_answers.length
        ? q.accepted_answers
        : [q.correct_word].filter(Boolean);
    const norm = _normalize(value, ci);
    return accepted.some(a => _normalize(a, ci) === norm);
}

function _splitWords(text) {
    // Preserve punctuation glued to adjacent words; split on whitespace only.
    return String(text || '').split(/\s+/).filter(Boolean);
}

export function renderCorrectTheMistake(q, container) {
    if (!container || !q) return;

    const stem = q.stem || 'Find the error and type the fix.';
    const text = q.text || '';
    const words = _splitWords(text);

    const wordsHtml = words.map((w, i) => {
        return `<button type="button"
            class="lq-ctm-word"
            data-word-index="${i}"
            aria-label="Word ${i + 1}: ${_esc(w)}">${_esc(w)}</button>`;
    }).join(' ');

    container.innerHTML = `
        <div class="lq-ctm-host">
            <div class="lq-ctm-stem">${_esc(stem)}</div>
            <div class="lq-ctm-sentence" role="group" aria-label="Sentence — tap the word with the error">
                ${wordsHtml}
            </div>
            <div class="lq-ctm-fix-row">
                <label class="lq-ctm-fix-label" for="lq-ctm-fix-input">Type the correction:</label>
                <input
                    id="lq-ctm-fix-input"
                    class="lq-ctm-fix-input"
                    type="text"
                    autocomplete="off"
                    autocorrect="off"
                    autocapitalize="off"
                    spellcheck="false"
                    disabled
                    aria-label="Type the correct word">
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-ctm-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-ctm-host');
    const sentence = host.querySelector('.lq-ctm-sentence');
    const input = host.querySelector('.lq-ctm-fix-input');
    const submitBtn = host.querySelector('.lq-ctm-submit');
    const feedback = host.querySelector('.lq-feedback-zone');

    // Per-attempt state
    let selectedIndex = null;       // chosen word index (only set when correct)
    let wordSelectionLocked = false;

    function refreshSubmit() {
        submitBtn.disabled = !(selectedIndex !== null && input.value.trim().length > 0);
    }

    sentence.addEventListener('click', e => {
        if (wordSelectionLocked) return;
        const btn = e.target.closest('.lq-ctm-word');
        if (!btn) return;

        const idx = parseInt(btn.dataset.wordIndex, 10);
        const isError = idx === q.error_index;

        // Clear any prior visual flashes
        sentence.querySelectorAll('.lq-ctm-word').forEach(b => {
            b.classList.remove('lq-ctm-word--wrong', 'lq-ctm-word--selected');
        });

        if (!isError) {
            btn.classList.add('lq-ctm-word--wrong');
            // Auto-clear flash after a moment so the student can retry
            setTimeout(() => btn.classList.remove('lq-ctm-word--wrong'), 600);
            selectedIndex = null;
            input.disabled = true;
            input.value = '';
            feedback.textContent = 'That word is fine — find the error.';
            refreshSubmit();
            return;
        }

        // Correct word selected — enable the input
        btn.classList.add('lq-ctm-word--selected');
        selectedIndex = idx;
        input.disabled = false;
        feedback.textContent = 'Good — now type the correction.';
        input.focus();
        refreshSubmit();
    });

    input.addEventListener('input', refreshSubmit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            e.preventDefault();
            submitBtn.click();
        }
    });

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled) return;

        const indexCorrect = selectedIndex === q.error_index;
        const typedCorrect = _checkTyped(input.value, q);
        const allCorrect = indexCorrect && typedCorrect;

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(allCorrect);

        if (allCorrect) {
            wordSelectionLocked = true;
            input.disabled = true;
            submitBtn.disabled = true;
            sentence.querySelectorAll('.lq-ctm-word').forEach(b => {
                if (parseInt(b.dataset.wordIndex, 10) === q.error_index) {
                    b.classList.add('lq-ctm-word--correct');
                }
                b.disabled = true;
            });
            input.classList.add('lq-locked-correct');
            feedback.textContent = 'Correct!';
        } else {
            // Partial-lock: keep correct sub-steps marked, ask retry on the wrong one.
            input.classList.add('lq-wrong-persistent');
            input.classList.remove('lq-locked-correct');
            if (!indexCorrect) {
                // Reset word state so student can re-pick
                selectedIndex = null;
                sentence.querySelectorAll('.lq-ctm-word').forEach(b => {
                    b.classList.remove('lq-ctm-word--selected');
                });
                input.disabled = true;
                input.value = '';
                feedback.textContent = 'Not quite — find the error first, then type the fix.';
            } else {
                // Word is right, typed answer wrong — keep word locked-in
                input.value = '';
                feedback.textContent = 'Good word! But the correction is not right yet — try again.';
                input.focus();
            }
            refreshSubmit();
        }

        container._lqLastResult = {
            correct: allCorrect,
            submitted: {
                selected_index: selectedIndex !== null ? selectedIndex : (indexCorrect ? q.error_index : null),
                typed: input.value || (allCorrect ? q.correct_word : ''),
            },
            indexCorrect,
            typedCorrect,
            firstAttempt,
        };
    });
}

export function checkCorrectTheMistake(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container.' };

    if (container._lqLastResult) {
        const r = container._lqLastResult;
        const feedback = r.correct
            ? 'Correct!'
            : `The error was "${q.text ? _splitWords(q.text)[q.error_index] || '' : ''}" — should be "${q.correct_word || ''}".`;
        return { correct: r.correct, submitted: r.submitted, feedback, firstAttempt: r.firstAttempt };
    }

    // Nothing submitted yet — derive partial state for diagnostics.
    const host = container.querySelector('.lq-ctm-host');
    if (!host) return { correct: false, submitted: null, feedback: 'No answer yet.' };

    const selectedBtn = host.querySelector('.lq-ctm-word--selected');
    const input = host.querySelector('.lq-ctm-fix-input');
    const selectedIndex = selectedBtn ? parseInt(selectedBtn.dataset.wordIndex, 10) : null;
    const typed = input ? input.value : '';

    const indexCorrect = selectedIndex === q.error_index;
    const typedCorrect = _checkTyped(typed, q);
    const correct = indexCorrect && typedCorrect;

    return {
        correct,
        submitted: { selected_index: selectedIndex, typed },
        feedback: correct ? 'Correct!' : 'Find the error and type the correction.',
    };
}
