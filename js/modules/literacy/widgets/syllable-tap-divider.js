// syllable-tap-divider.js — Tap between letters to insert syllable dividers.
//
// Each letter is shown with a tappable gap between adjacent letters. Tapping a
// gap toggles a `|` divider in that position. Auto-grades against a target
// list of break indices (positions BEFORE which the break appears).
//
// Question contract:
//   q.stem:                   string   — instruction text
//   q.word:                   string   — the word to divide
//   q.correct_break_indices:  number[] — sorted ascending; "after position N" means
//                                        between letters[N-1] and letters[N].
//                                        e.g. 'rabbit' → [3] means rab|bit
//                                        'butterfly' → [3, 6] means but|ter|fly
//
// Exports:
//   renderSyllableTapDivider(q, container)
//   checkSyllableTapDivider(q, container)

import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function renderSyllableTapDivider(q, container) {
    if (!container || !q) return;

    const stem = q.stem || 'Tap between letters to divide the syllables.';
    const word = String(q.word || '');
    const correctSet = new Set(Array.isArray(q.correct_break_indices) ? q.correct_break_indices : []);

    const letters = word.split('');
    const pieces = [];
    letters.forEach((ch, i) => {
        pieces.push(`<span class="lq-std-letter">${_esc(ch)}</span>`);
        if (i < letters.length - 1) {
            const gapIdx = i + 1;
            pieces.push(`<button type="button"
                class="lq-std-gap"
                data-gap-index="${gapIdx}"
                aria-pressed="false"
                aria-label="Tap to insert divider after letter ${i + 1}"></button>`);
        }
    });

    container.innerHTML = `
        <div class="lq-std-host" role="application">
            <p class="lq-std-stem">${_esc(stem)}</p>
            <div class="lq-std-word">${pieces.join('')}</div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-std-controls">
                <button type="button" class="lq-std-clear secondary-btn">Clear</button>
                <button type="button" class="lq-std-submit primary-btn" disabled>Submit</button>
            </div>
        </div>`;

    const host = container.querySelector('.lq-std-host');
    const submitBtn = host.querySelector('.lq-std-submit');
    const clearBtn = host.querySelector('.lq-std-clear');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    let locked = false;

    function getGaps() { return Array.from(host.querySelectorAll('.lq-std-gap')); }
    function getActive() {
        return getGaps()
            .filter(g => g.classList.contains('lq-std-gap--active'))
            .map(g => parseInt(g.dataset.gapIndex, 10))
            .sort((a, b) => a - b);
    }
    function refreshSubmit() {
        if (locked) { submitBtn.disabled = true; return; }
        submitBtn.disabled = getActive().length === 0;
    }

    host.addEventListener('click', e => {
        if (locked) return;
        const gap = e.target.closest('.lq-std-gap');
        if (!gap || gap.dataset.locked === '1') return;
        if (gap.classList.contains('lq-std-gap--active')) {
            gap.classList.remove('lq-std-gap--active');
            gap.setAttribute('aria-pressed', 'false');
        } else {
            gap.classList.add('lq-std-gap--active');
            gap.setAttribute('aria-pressed', 'true');
        }
        refreshSubmit();
    });

    clearBtn.addEventListener('click', () => {
        if (locked) return;
        getGaps().forEach(g => {
            if (g.dataset.locked === '1') return;
            g.classList.remove('lq-std-gap--active', 'lq-wrong-persistent');
            g.setAttribute('aria-pressed', 'false');
        });
        refreshSubmit();
    });

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const active = getActive();
        const allCorrect = active.length === correctSet.size &&
            active.every(i => correctSet.has(i));

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(allCorrect);

        let wrongCount = 0;
        getGaps().forEach(g => {
            const idx = parseInt(g.dataset.gapIndex, 10);
            const isActive = g.classList.contains('lq-std-gap--active');
            const isCorrect = correctSet.has(idx);
            if (isActive && isCorrect) {
                g.classList.add('lq-locked-correct');
                g.dataset.locked = '1';
            } else if (isActive && !isCorrect) {
                wrongCount++;
                g.classList.add('lq-wrong-persistent');
                setTimeout(() => {
                    g.classList.remove('lq-wrong-persistent', 'lq-std-gap--active');
                    g.setAttribute('aria-pressed', 'false');
                    refreshSubmit();
                }, 1500);
            }
        });

        if (allCorrect) {
            feedbackZone.textContent = 'Correct!';
            locked = true;
            submitBtn.disabled = true;
        } else {
            const missing = correctSet.size -
                active.filter(i => correctSet.has(i)).length;
            feedbackZone.textContent = wrongCount > 0
                ? `${wrongCount} extra divider${wrongCount === 1 ? '' : 's'} — try again.`
                : `${missing} divider${missing === 1 ? '' : 's'} missing — try again.`;
        }

        container._lqLastResult = {
            correct: allCorrect,
            submitted: active,
            firstAttempt
        };
    });

    refreshSubmit();
}

export function checkSyllableTapDivider(q, container) {
    if (!container) return { correct: false, submitted: [] };
    if (container._lqLastResult) return container._lqLastResult;
    const host = container.querySelector('.lq-std-host');
    if (!host) return { correct: false, submitted: [] };
    const correctSet = new Set(Array.isArray(q.correct_break_indices) ? q.correct_break_indices : []);
    const active = Array.from(host.querySelectorAll('.lq-std-gap.lq-std-gap--active, .lq-std-gap.lq-locked-correct'))
        .map(g => parseInt(g.dataset.gapIndex, 10))
        .sort((a, b) => a - b);
    const correct = active.length === correctSet.size &&
        active.every(i => correctSet.has(i));
    return { correct, submitted: active };
}
