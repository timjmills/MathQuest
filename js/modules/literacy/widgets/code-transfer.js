// code-transfer.js — Apply a known phonics rule to spell a NEW word.
// Shows a worked example, then prompts the student to apply the rule.
//
// Question contract:
//   q.stem:              string — instructional rule statement
//   q.example:           { base: string, suffix: string, result: string }
//   q.prompt:            { base: string, suffix: string }
//   q.correct_answer:    string — canonical answer
//   q.accepted_answers:  string[] — accepted typed answers
//   q.case_insensitive:  boolean (default true)
//
// Render layout:
//   ┌──────────────────────────────────────────┐
//   │ Rule banner (q.stem)                     │
//   ├──────────────────────────────────────────┤
//   │ Example: hop + -ing = hopping            │
//   ├──────────────────────────────────────────┤
//   │ Apply: sit + -ing = [____]               │
//   └──────────────────────────────────────────┘
//
// Exports:
//   renderCodeTransfer(q, container)
//   checkCodeTransfer(q, container)

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
        : [q.correct_answer].filter(Boolean);
    const norm = _normalize(value, ci);
    return accepted.some(a => _normalize(a, ci) === norm);
}

export function renderCodeTransfer(q, container) {
    if (!container || !q) return;

    const stem = q.stem || 'Apply the rule.';
    const ex = q.example || { base: '', suffix: '', result: '' };
    const pr = q.prompt || { base: '', suffix: '' };

    container.innerHTML = `
        <div class="lq-codetransfer-host">
            <div class="lq-codetransfer-rule">${_esc(stem)}</div>

            <div class="lq-codetransfer-block lq-codetransfer-block--example">
                <div class="lq-codetransfer-block-label">Example</div>
                <div class="lq-codetransfer-equation">
                    <span class="lq-codetransfer-token">${_esc(ex.base)}</span>
                    <span class="lq-codetransfer-op">+</span>
                    <span class="lq-codetransfer-token lq-codetransfer-token--suffix">${_esc(ex.suffix)}</span>
                    <span class="lq-codetransfer-op">=</span>
                    <span class="lq-codetransfer-token lq-codetransfer-token--result">${_esc(ex.result)}</span>
                </div>
            </div>

            <div class="lq-codetransfer-block lq-codetransfer-block--prompt">
                <div class="lq-codetransfer-block-label">Your turn</div>
                <div class="lq-codetransfer-equation">
                    <span class="lq-codetransfer-token">${_esc(pr.base)}</span>
                    <span class="lq-codetransfer-op">+</span>
                    <span class="lq-codetransfer-token lq-codetransfer-token--suffix">${_esc(pr.suffix)}</span>
                    <span class="lq-codetransfer-op">=</span>
                    <input
                        class="lq-codetransfer-input"
                        type="text"
                        autocomplete="off"
                        autocorrect="off"
                        autocapitalize="off"
                        spellcheck="false"
                        aria-label="Type the result of applying the rule">
                </div>
            </div>

            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-codetransfer-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-codetransfer-host');
    const input = host.querySelector('.lq-codetransfer-input');
    const submitBtn = host.querySelector('.lq-codetransfer-submit');
    const feedback = host.querySelector('.lq-feedback-zone');

    function refreshSubmit() {
        submitBtn.disabled = input.value.trim().length === 0;
    }

    input.addEventListener('input', refreshSubmit);
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !submitBtn.disabled) {
            e.preventDefault();
            submitBtn.click();
        }
    });

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled) return;

        const value = input.value;
        const correct = _checkTyped(value, q);
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(correct);

        if (correct) {
            input.classList.add('lq-locked-correct');
            input.classList.remove('lq-wrong-persistent');
            input.disabled = true;
            submitBtn.disabled = true;
            feedback.textContent = 'Correct!';
        } else {
            input.classList.add('lq-wrong-persistent');
            input.classList.remove('lq-locked-correct');
            input.value = '';
            feedback.textContent = 'Not quite — apply the rule and try again.';
            input.focus();
            refreshSubmit();
        }

        container._lqLastResult = {
            correct,
            submitted: value,
            firstAttempt,
        };
    });
}

export function checkCodeTransfer(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container.' };

    if (container._lqLastResult) {
        const r = container._lqLastResult;
        const feedback = r.correct
            ? 'Correct!'
            : `The correct answer was "${q.correct_answer || ''}".`;
        return { correct: r.correct, submitted: r.submitted, feedback, firstAttempt: r.firstAttempt };
    }

    const input = container.querySelector('.lq-codetransfer-input');
    const value = input ? input.value : '';
    const correct = _checkTyped(value, q);
    return {
        correct,
        submitted: value,
        feedback: correct ? 'Correct!' : `The correct answer was "${q.correct_answer || ''}".`,
    };
}
