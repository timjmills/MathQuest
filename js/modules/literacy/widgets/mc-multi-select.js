// mc-multi-select.js — Multi-select multiple-choice widget with Submit gate.
//
// Students toggle multiple options; a Submit button is enabled once at least
// one option is selected (or q.minCorrect is met). Grading is set equality —
// all correct IDs selected and no incorrect IDs selected = full credit.
//
// Partial-correct feedback (mirrors multi-select-check.js):
//   - Selected & correct   → locked green (.lq-locked-correct, data-locked="1")
//   - Selected & incorrect → red persistent (.lq-wrong-persistent), deselected
//   - Missed correct       → amber highlight (.lq-missed-correct)
//   Widget re-enables for retry. Locked-correct tiles cannot be deselected.
//
// Question contract:
//   q.options:    [{ id, label, correct?, image?, audio_text? }]
//   q.ans:        string[] — array of correct option ids
//   q.minCorrect: optional number (default 1) — minimum selections to enable Submit
//   q.k2_appropriate: boolean — K-2 variant (stacked layout, helper banner)
//
// Exports:
//   renderMcMultiSelect(q, container) — mounts widget inside container
//   checkMcMultiSelect(q, container)  — returns { correct, submitted, feedback }

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _optionText(opt) {
    return opt.label != null ? opt.label : '';
}

function _safeSpeak(text) {
    if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(text);
    }
}

function _renderOptionInner(opt) {
    const label = _optionText(opt);
    if (opt.image) {
        const isUrl = /^https?:\/\/|^\/|^\.\//i.test(opt.image);
        const visual = isUrl
            ? `<img class="lq-mc-image-img" src="${opt.image}" alt="${label}">`
            : `<span class="lq-mc-audio-opt-emoji" aria-hidden="true">${opt.image}</span>`;
        return `${visual}<span class="lq-mc-button-text">${label}</span>`;
    }
    return `<span class="lq-mc-button-text">${label}</span>`;
}

// ─── render ─────────────────────────────────────────────────────────────────

export function renderMcMultiSelect(q, container) {
    if (!container || !q || !Array.isArray(q.options)) return;

    const isK2 = !!q.k2_appropriate;
    const variantClass = isK2 ? 'lq-k2' : 'lq-2-5';
    // K-2: always stack; 2-5: grid based on count
    const gridClass = isK2 || q.options.length <= 4
        ? 'lq-mc-grid lq-mc-grid--stacked'
        : 'lq-mc-grid lq-mc-grid--2x3';

    const minCorrect = (typeof q.minCorrect === 'number' && q.minCorrect > 0)
        ? q.minCorrect : 1;

    const helperBanner = isK2
        ? `<div class="lq-multi-helper-banner" aria-live="polite">Pick ALL the right answers</div>`
        : '';

    const counterLabel = `0 of ${q.options.length} selected`;

    const optionsHtml = q.options.map(opt => {
        const label = _optionText(opt);
        const audioLabel = label ? `Listen: ${label}` : 'Listen to option';
        return `<button type="button"
            class="lq-mc-button lq-mms-opt ${variantClass}"
            data-id="${opt.id}"
            role="checkbox"
            aria-pressed="false"
            aria-checked="false">
            <span class="lq-mms-mark" aria-hidden="true"></span>
            ${_renderOptionInner(opt)}
            <button type="button" class="lq-audio-btn" data-audio-for="${opt.id}"
                aria-label="${audioLabel}"
                tabindex="-1">🔊</button>
        </button>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-mms-wrap">
            ${helperBanner}
            <div class="lq-mms-counter" aria-live="polite">${counterLabel}</div>
            <div class="${gridClass}" role="group" aria-label="Select all that apply">
                ${optionsHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-mms-submit primary-btn" disabled>Submit</button>
        </div>`;

    const grid = container.querySelector('.lq-mc-grid');
    const feedbackZone = container.querySelector('.lq-feedback-zone');
    const submitBtn = container.querySelector('.lq-mms-submit');
    const counter = container.querySelector('.lq-mms-counter');

    // ── helpers ────────────────────────────────────────────────────────────

    function getSelected() {
        return Array.from(grid.querySelectorAll('.lq-mms-opt.lq-selected'))
            .map(el => el.dataset.id);
    }

    function refreshCounter() {
        const sel = getSelected();
        counter.textContent = `${sel.length} of ${q.options.length} selected`;
        submitBtn.disabled = sel.length < minCorrect;
    }

    function lockWidget() {
        submitBtn.disabled = true;
        grid.querySelectorAll('.lq-mms-opt').forEach(el => { el.disabled = true; });
    }

    // applyPartialCorrectAndUnlock: mirrors multi-select-check.js exactly
    function applyPartialCorrectAndUnlock(correctIds) {
        const correctSet = new Set(Array.isArray(correctIds) ? correctIds : []);
        grid.querySelectorAll('.lq-mms-opt').forEach(el => {
            el.classList.remove('lq-correct-flash', 'lq-wrong-flash');
            const id = el.dataset.id;
            const isSelected = el.classList.contains('lq-selected');
            const isCorrect = correctSet.has(id);

            if (isSelected && isCorrect) {
                // Lock green — cannot be deselected
                el.classList.add('lq-selected', 'lq-locked-correct');
                el.classList.remove('lq-wrong-persistent', 'lq-missed-correct');
                el.dataset.locked = '1';
                el.setAttribute('aria-pressed', 'true');
                el.setAttribute('aria-checked', 'true');
                el.disabled = false;
            } else if (isSelected && !isCorrect) {
                // Wrong pick — remove selection, mark red
                el.classList.remove('lq-selected', 'lq-missed-correct');
                el.classList.add('lq-wrong-persistent');
                el.setAttribute('aria-pressed', 'false');
                el.setAttribute('aria-checked', 'false');
                el.disabled = false;
            } else if (!isSelected && isCorrect) {
                // Missed correct — amber hint
                el.classList.remove('lq-wrong-persistent');
                el.classList.add('lq-missed-correct');
                el.disabled = false;
            } else {
                // Neutral incorrect, untouched
                el.classList.remove('lq-wrong-persistent', 'lq-missed-correct');
                el.disabled = false;
            }
        });
        refreshCounter();
    }

    // Expose internal helpers for external integration (mirrors multi-select-check.js pattern)
    container._lqLock = lockWidget;
    container._lqApplyPartialCorrect = applyPartialCorrectAndUnlock;

    // ── event delegation: option clicks ──────────────────────────────────

    grid.addEventListener('click', e => {
        // Audio button
        const audioBtn = e.target.closest('.lq-audio-btn');
        if (audioBtn) {
            e.stopPropagation();
            const optId = audioBtn.dataset.audioFor;
            const opt = q.options.find(o => o.id === optId);
            if (opt) {
                const text = opt.audio_text || _optionText(opt);
                _safeSpeak(text);
            }
            return;
        }

        // Option tile
        const btn = e.target.closest('.lq-mms-opt');
        if (!btn || btn.disabled) return;
        // Locked-correct tiles cannot be deselected
        if (btn.dataset.locked === '1') return;

        // Clear persistent hint marks on re-interaction (student is re-evaluating)
        btn.classList.remove('lq-wrong-persistent', 'lq-missed-correct');

        const isOn = btn.classList.toggle('lq-selected');
        btn.setAttribute('aria-pressed', isOn ? 'true' : 'false');
        btn.setAttribute('aria-checked', isOn ? 'true' : 'false');
        refreshCounter();
    });

    // ── Submit click ──────────────────────────────────────────────────────

    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled) return;
        submitBtn.disabled = true;

        const selectedIds = getSelected();
        const correctIds = Array.isArray(q.ans) ? q.ans : [];

        // Set equality check
        const correct = _setsEqual(selectedIds, correctIds);

        const firstAttempt = isFirstAttempt();
        markFirstAttempt(correct);

        if (correct) {
            // Full credit — lock everything green
            grid.querySelectorAll('.lq-mms-opt').forEach(el => {
                if (el.classList.contains('lq-selected')) {
                    el.classList.add('lq-correct');
                }
            });
            feedbackZone.textContent = 'Correct! All answers selected.';
            lockWidget();
            container._lqLastResult = { correct: true, submitted: selectedIds, firstAttempt };
        } else {
            // Partial / wrong — apply color hints and re-enable for retry
            applyPartialCorrectAndUnlock(correctIds);
            const missed = correctIds.filter(id => !selectedIds.includes(id)).length;
            const wrong = selectedIds.filter(id => !correctIds.includes(id)).length;
            let msg = 'Not quite — ';
            if (wrong > 0 && missed > 0) msg += `${wrong} wrong, ${missed} missed.`;
            else if (wrong > 0) msg += `${wrong} incorrect selection${wrong > 1 ? 's' : ''}.`;
            else msg += `${missed} answer${missed > 1 ? 's' : ''} still missing.`;
            msg += ' Try again!';
            feedbackZone.textContent = msg;
            container._lqLastResult = { correct: false, submitted: selectedIds, firstAttempt };
        }
    });

    // ── keyboard: Tab/Shift-Tab between options; Space toggles; Enter submits ──

    container.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Spacebar') {
            const btn = e.target.closest('.lq-mms-opt');
            if (btn) {
                e.preventDefault();
                btn.click();
            }
        } else if (e.key === 'Enter') {
            if (e.target === submitBtn || e.target.closest('.lq-mms-submit')) {
                e.preventDefault();
                submitBtn.click();
            }
        }
    });

    refreshCounter();
}

// ─── set equality ─────────────────────────────────────────────────────────

function _setsEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    const setA = new Set(a);
    for (const id of b) if (!setA.has(id)) return false;
    return true;
}

// ─── check ──────────────────────────────────────────────────────────────────

export function checkMcMultiSelect(q, container) {
    if (!container) return { correct: false, submitted: [], feedback: 'No container' };

    if (container._lqLastResult) {
        const { correct, submitted, firstAttempt } = container._lqLastResult;
        const correctIds = Array.isArray(q.ans) ? q.ans : [];
        const feedback = correct
            ? 'Correct! All answers selected.'
            : `Correct answers: ${correctIds.join(', ')}`;
        return { correct, submitted, feedback, firstAttempt };
    }

    // No submit yet — gather currently selected
    const selected = Array.from(
        (container.querySelector('.lq-mc-grid') || container)
            .querySelectorAll('.lq-mms-opt.lq-selected')
    ).map(el => el.dataset.id);

    const correctIds = Array.isArray(q.ans) ? q.ans : [];
    const correct = _setsEqual(selected, correctIds);
    const feedback = correct
        ? 'Correct!'
        : `Correct answers: ${correctIds.join(', ')}`;
    return { correct, submitted: selected, feedback };
}
