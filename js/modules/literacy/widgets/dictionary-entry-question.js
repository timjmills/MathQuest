// dictionary-entry-question.js — Dictionary entry display + single MC question.
//
// Renders a styled dictionary entry block, then asks one multiple-choice
// question about which numbered definition fits a given context sentence
// (or which guide-word page, etc.). Reuses mc-text styling for the options.
//
// Question contract:
//   q.stem:               string — the question prompt
//   q.entry:              {
//                            headword:      string,
//                            pronunciation: string,
//                            pos:           string,        // part of speech
//                            definitions:   [{ num, text, example? }]
//                          }
//   q.context_sentence?:  string — sentence student must match a definition to
//   q.options:            [{ id, label }]   — typically 3-4 numbered options
//   q.ans:                string            — id of correct option
//
// Exports:
//   renderDictionaryEntryQuestion(q, container)
//   checkDictionaryEntryQuestion(q, container)

import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _optionText(opt) {
    return opt.label != null ? opt.label : (opt.text != null ? opt.text : '');
}

export function renderDictionaryEntryQuestion(q, container) {
    if (!container || !q) return;

    const stem = q.stem || '';
    const entry = q.entry || {};
    const headword = entry.headword || '';
    const pron = entry.pronunciation || '';
    const pos = entry.pos || '';
    const defs = Array.isArray(entry.definitions) ? entry.definitions : [];
    const context = q.context_sentence || '';
    const options = Array.isArray(q.options) ? q.options : [];

    const defsHtml = defs.map(d => {
        const num = d.num != null ? d.num : '';
        const example = d.example
            ? `<span class="lq-de-example">"${_esc(d.example)}"</span>`
            : '';
        return `<li class="lq-de-def" value="${_esc(num)}">
            <span class="lq-de-def-text">${_esc(d.text || '')}</span>
            ${example}
        </li>`;
    }).join('');

    const optsHtml = options.map(opt => {
        const text = _optionText(opt);
        return `<button type="button"
            class="lq-de-option"
            data-id="${_esc(opt.id)}"
            role="radio"
            aria-pressed="false"
            aria-checked="false">${_esc(text)}</button>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-de-host">
            ${stem ? `<p class="lq-de-stem">${_esc(stem)}</p>` : ''}
            <div class="lq-de-entry" role="region" aria-label="Dictionary entry">
                <div class="lq-de-headword-row">
                    <span class="lq-de-headword">${_esc(headword)}</span>
                    ${pron ? `<span class="lq-de-pron">${_esc(pron)}</span>` : ''}
                    ${pos  ? `<span class="lq-de-pos">${_esc(pos)}</span>` : ''}
                </div>
                <ol class="lq-de-defs">${defsHtml}</ol>
            </div>
            ${context ? `<div class="lq-de-context">
                <span class="lq-de-context-label">Sentence:</span>
                <span class="lq-de-context-text">${_esc(context)}</span>
            </div>` : ''}
            <div class="lq-de-options" role="radiogroup" aria-label="Answer choices">
                ${optsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
        </div>`;

    const host = container.querySelector('.lq-de-host');
    const optsWrap = host.querySelector('.lq-de-options');
    const feedbackZone = host.querySelector('.lq-feedback-zone');

    optsWrap.addEventListener('click', e => {
        const btn = e.target.closest('.lq-de-option');
        if (!btn || btn.disabled) return;
        const allBtns = optsWrap.querySelectorAll('.lq-de-option');
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
            btn.classList.add('lq-locked-correct');
            feedbackZone.textContent = 'Correct!';
            allBtns.forEach(b => { b.disabled = true; });
        } else {
            btn.classList.add('lq-wrong-persistent');
            feedbackZone.textContent = 'Not quite — try again!';
        }

        container._lqLastResult = { correct, submitted: submittedId, firstAttempt };
    });

    optsWrap.addEventListener('keydown', e => {
        const allBtns = Array.from(optsWrap.querySelectorAll('.lq-de-option:not([disabled])'));
        const current = document.activeElement;
        const idx = allBtns.indexOf(current);
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            if (allBtns.length) allBtns[(idx + 1) % allBtns.length].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (allBtns.length) allBtns[(idx - 1 + allBtns.length) % allBtns.length].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            if (current && current.classList.contains('lq-de-option')) {
                e.preventDefault();
                current.click();
            }
        }
    });
}

export function checkDictionaryEntryQuestion(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container' };
    if (container._lqLastResult) {
        const { correct, submitted, firstAttempt } = container._lqLastResult;
        const feedback = correct
            ? 'Correct!'
            : `The correct answer was: ${_optionText((q.options || []).find(o => o.id === q.ans) || {})}`;
        return { correct, submitted, feedback, firstAttempt };
    }
    const sel = container.querySelector('.lq-de-option.lq-selected');
    if (!sel) return { correct: false, submitted: null, feedback: 'No answer selected.' };
    const submitted = sel.dataset.id;
    const correct = submitted === q.ans;
    const feedback = correct
        ? 'Correct!'
        : `The correct answer was: ${_optionText((q.options || []).find(o => o.id === q.ans) || {})}`;
    return { correct, submitted, feedback };
}
