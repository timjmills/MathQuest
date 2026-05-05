// identify-errors.js — Hot-text-style multi-select on errors.
//
// Student taps every word in a sentence/passage that contains an error.
// No correction step — just identification. Tapped words turn red.
//
// Question contract:
//   q.stem:           string   — instruction (e.g., "Tap every word with an error.")
//   q.text:           string   — sentence/passage text
//   q.error_indices:  number[] — 0-based word indices that contain errors
//   q.multi_select?:  boolean  — default true; set false if only one error
//
// Exports:
//   renderIdentifyErrors(q, container)
//   checkIdentifyErrors(q, container)

import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _tokenizeWords(text) {
    const result = [];
    let tokenIndex = 0;
    const parts = String(text || '').split(/(\s+)/);
    parts.forEach(part => {
        if (/^\s+$/.test(part)) {
            result.push({ type: 'space', text: part });
        } else if (part.length > 0) {
            result.push({ type: 'token', text: part, index: tokenIndex++ });
        }
    });
    return result;
}

export function renderIdentifyErrors(q, container) {
    if (!container || !q) return;

    const stem = q.stem || 'Tap every word that has an error.';
    const errorSet = new Set(Array.isArray(q.error_indices) ? q.error_indices : []);
    const isMulti = q.multi_select !== false;

    const tokens = _tokenizeWords(q.text || '');
    const tokenHtml = tokens.map(part => {
        if (part.type === 'space') {
            return part.text.replace(/\n/g, '<br>');
        }
        return `<span class="lq-ie-word"
            role="button"
            tabindex="0"
            data-index="${part.index}"
            aria-pressed="false"
            aria-label="${_esc(part.text)}">${_esc(part.text)}</span>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-ie-host" role="application"
            aria-label="Identify errors by tapping the wrong words">
            <p class="lq-ie-stem">${_esc(stem)}</p>
            <div class="lq-ie-text">${tokenHtml}</div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            ${isMulti
                ? '<button type="button" class="lq-ie-submit primary-btn" disabled>Submit</button>'
                : ''}
        </div>`;

    const host = container.querySelector('.lq-ie-host');
    const submitBtn = host.querySelector('.lq-ie-submit');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    let locked = false;

    function getWords() {
        return Array.from(host.querySelectorAll('.lq-ie-word'));
    }
    function getSelected() {
        return getWords().filter(el => el.classList.contains('lq-ie-selected'));
    }
    function refreshSubmit() {
        if (submitBtn) submitBtn.disabled = locked || getSelected().length === 0;
    }

    function singleSelectFinalize(el, isCorrect) {
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(isCorrect);

        if (isCorrect) {
            el.classList.add('lq-ie-selected', 'lq-locked-correct');
            el.setAttribute('aria-pressed', 'true');
            getWords().forEach(t => { if (t !== el) t.setAttribute('tabindex', '-1'); });
            feedbackZone.textContent = 'Correct!';
            locked = true;
        } else {
            el.classList.add('lq-ie-wrong', 'lq-wrong-persistent');
            el.setAttribute('aria-pressed', 'true');
            feedbackZone.textContent = 'Not quite — try again!';
            setTimeout(() => {
                el.classList.remove('lq-ie-wrong', 'lq-wrong-persistent');
                el.setAttribute('aria-pressed', 'false');
            }, 1500);
        }

        const idx = parseInt(el.dataset.index, 10);
        container._lqLastResult = {
            correct: isCorrect,
            submitted: [idx],
            firstAttempt
        };
    }

    function handleTap(el) {
        if (locked) return;
        const idx = parseInt(el.dataset.index, 10);
        const isErr = errorSet.has(idx);

        if (!isMulti) {
            singleSelectFinalize(el, isErr);
            return;
        }

        if (el.classList.contains('lq-ie-selected')) {
            el.classList.remove('lq-ie-selected');
            el.setAttribute('aria-pressed', 'false');
        } else {
            el.classList.add('lq-ie-selected');
            el.setAttribute('aria-pressed', 'true');
        }
        refreshSubmit();
    }

    host.addEventListener('click', e => {
        const el = e.target.closest('.lq-ie-word');
        if (!el || !host.contains(el)) return;
        handleTap(el);
    });
    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const el = e.target.closest('.lq-ie-word');
        if (!el) return;
        e.preventDefault();
        handleTap(el);
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (submitBtn.disabled || locked) return;

            const selected = getSelected().map(el => parseInt(el.dataset.index, 10));
            const allCorrect = selected.length === errorSet.size &&
                selected.every(i => errorSet.has(i));

            const firstAttempt = isFirstAttempt();
            markFirstAttempt(allCorrect);

            let wrongCount = 0;
            getWords().forEach(el => {
                const idx = parseInt(el.dataset.index, 10);
                const isSel = el.classList.contains('lq-ie-selected');
                const isErr = errorSet.has(idx);
                if (isSel && isErr) {
                    el.classList.add('lq-locked-correct');
                } else if (isSel && !isErr) {
                    el.classList.remove('lq-ie-selected');
                    el.classList.add('lq-ie-wrong', 'lq-wrong-persistent');
                    el.setAttribute('aria-pressed', 'false');
                    wrongCount++;
                    setTimeout(() => {
                        el.classList.remove('lq-ie-wrong', 'lq-wrong-persistent');
                    }, 1600);
                }
            });

            if (allCorrect) {
                feedbackZone.textContent = 'All errors found!';
                locked = true;
                submitBtn.disabled = true;
            } else {
                const missing = errorSet.size - selected.filter(i => errorSet.has(i)).length;
                feedbackZone.textContent =
                    `${wrongCount} wrong tap${wrongCount === 1 ? '' : 's'}, ${missing} missed — try again.`;
                refreshSubmit();
            }

            container._lqLastResult = {
                correct: allCorrect,
                submitted: selected,
                firstAttempt
            };
        });
    }

    refreshSubmit();
}

export function checkIdentifyErrors(q, container) {
    if (!container) return { correct: false, submitted: [] };
    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-ie-host');
    if (!host) return { correct: false, submitted: [] };
    const errorSet = new Set(Array.isArray(q.error_indices) ? q.error_indices : []);
    const selected = Array.from(host.querySelectorAll('.lq-ie-word.lq-ie-selected, .lq-ie-word.lq-locked-correct'))
        .map(el => parseInt(el.dataset.index, 10));
    const correct = selected.length === errorSet.size &&
        selected.every(i => errorSet.has(i));
    return { correct, submitted: selected };
}
