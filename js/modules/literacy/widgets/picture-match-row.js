// picture-match-row.js — Multi-row image grid for ETC Types 1 and 4.
//
// Each card renders 4–6 sub-rows; every row has 3–4 image option buttons.
// The student taps one image per row → immediate per-row feedback.
// A "Done" button becomes enabled when every row has been answered.
// Overall correctness = all rows answered correctly.
//
// Question contract:
//   q.task_text:       string                    — instruction shown at top
//   q.target_pattern?: string                    — e.g. "/b/" for audio context
//   q.rows: [
//       {
//           id:            string,
//           prompt_audio?: string,               — per-row TTS override
//           options: [{ id, label, image, correct: boolean }]
//       }
//   ]
//   q.layout?:         '3col' | '4col'           — default '3col'
//   q.k2_appropriate?: boolean
//
// Exports:
//   renderPictureMatchRow(q, container)
//   checkPictureMatchRow(q, container)
//     → { correct, submitted: [{row_id, chosen_id, correct}], feedback }

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

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
            u.rate = 0.85;
            window.speechSynthesis.speak(u);
        }
    } catch (_) { /* TTS unavailable */ }
}

function _isEmoji(str) {
    // Heuristic: short string (≤ 4 chars) with no Latin letters is probably emoji
    if (!str || str.length > 8) return false;
    return !/[a-zA-Z0-9]/.test(str);
}

function _imageHtml(src, alt, sizeClass) {
    if (!src) return '';
    if (_isEmoji(src)) {
        return `<span class="lq-pmr-emoji ${sizeClass}" role="img" aria-label="${_esc(alt)}">${_esc(src)}</span>`;
    }
    return `<img class="lq-pmr-img ${sizeClass}" src="${_esc(src)}" alt="${_esc(alt)}" loading="lazy">`;
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderPictureMatchRow(q, container) {
    if (!container || !q) return;
    if (!Array.isArray(q.rows) || q.rows.length === 0) return;

    const isK2 = !!q.k2_appropriate;
    const colClass = (q.layout === '4col') ? 'lq-pmr-row--4col' : 'lq-pmr-row--3col';
    const imgSizeClass = isK2 ? 'lq-pmr-img--large' : 'lq-pmr-img--medium';

    // Build rows HTML
    const rowsHtml = q.rows.map(row => {
        const optionsHtml = row.options.map(opt =>
            `<button type="button"
                 class="lq-pmr-option"
                 data-row-id="${_esc(row.id)}"
                 data-opt-id="${_esc(opt.id)}"
                 data-correct="${opt.correct ? '1' : '0'}"
                 aria-pressed="false"
                 aria-label="${_esc(opt.label || opt.id)}">
                ${_imageHtml(opt.image, opt.label || opt.id, imgSizeClass)}
                ${opt.label ? `<span class="lq-pmr-option-label">${_esc(opt.label)}</span>` : ''}
                <button type="button" class="lq-pmr-audio-btn"
                    data-speak="${_esc(opt.label || opt.id)}"
                    aria-label="Listen: ${_esc(opt.label || opt.id)}"
                    tabindex="-1">&#128266;</button>
            </button>`
        ).join('');

        const rowAudioHtml = row.prompt_audio
            ? `<button type="button"
                   class="lq-pmr-row-audio"
                   data-speak="${_esc(row.prompt_audio)}"
                   aria-label="Listen to row prompt">&#128266;</button>`
            : '';

        return `<div class="lq-pmr-row ${colClass}"
                    data-row-id="${_esc(row.id)}"
                    role="group"
                    aria-label="Row ${_esc(row.id)}">
                    ${rowAudioHtml}
                    <div class="lq-pmr-options-group" role="radiogroup"
                         aria-label="Choose one picture">
                        ${optionsHtml}
                    </div>
                    <div class="lq-pmr-row-feedback" aria-live="polite"
                         aria-atomic="true"></div>
                </div>`;
    }).join('');

    // Global listen-again (speaks task_text or target_pattern)
    const globalAudioText = q.target_pattern || q.task_text || '';
    const globalAudioHtml = globalAudioText
        ? `<button type="button"
               class="lq-pmr-listen-again lq-audio-btn"
               data-speak="${_esc(globalAudioText)}"
               aria-label="Listen again">&#128266; Listen Again</button>`
        : '';

    container.innerHTML = `
        <div class="lq-pmr-host">
            <div class="lq-pmr-header">
                <p class="lq-pmr-task-text">${_esc(q.task_text || '')}</p>
                ${globalAudioHtml}
            </div>
            <div class="lq-pmr-rows-wrap">
                ${rowsHtml}
            </div>
            <div class="lq-pmr-footer">
                <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
                <button type="button" class="lq-pmr-done primary-btn" disabled>Done</button>
            </div>
        </div>`;

    const host = container.querySelector('.lq-pmr-host');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const doneBtn = host.querySelector('.lq-pmr-done');

    // Tracking state: per-row answer
    const rowState = {};   // row_id → { chosenId, correct }
    const totalRows = q.rows.length;

    // K-2: auto-speak task text on mount
    if (isK2 && q.task_text) {
        setTimeout(() => _safeSpeak(q.task_text), 100);
    }

    // ── Refresh Done button ───────────────────────────────────────────────────
    function refreshDone() {
        const answeredCount = Object.keys(rowState).length;
        doneBtn.disabled = answeredCount < totalRows;
    }

    // ── Handle a row being answered ──────────────────────────────────────────
    function handleOptionClick(optBtn, rowId) {
        // Already answered and locked for this row?
        if (optBtn.disabled) return;

        const rowEl = host.querySelector(`.lq-pmr-row[data-row-id="${CSS.escape(rowId)}"]`);
        if (!rowEl) return;
        const allOpts = rowEl.querySelectorAll('.lq-pmr-option');
        const rowFeedback = rowEl.querySelector('.lq-pmr-row-feedback');

        const isCorrect = optBtn.dataset.correct === '1';
        const chosenId = optBtn.dataset.optId;

        // Deselect any previous selection in this row (allow revert on wrong)
        allOpts.forEach(b => {
            b.classList.remove('lq-selected');
            b.setAttribute('aria-pressed', 'false');
        });
        optBtn.classList.add('lq-selected');
        optBtn.setAttribute('aria-pressed', 'true');

        if (isCorrect) {
            // Lock the row: mark correct green, disable all options
            optBtn.classList.add('lq-correct');
            allOpts.forEach(b => { b.disabled = true; });
            if (rowFeedback) rowFeedback.textContent = 'Correct!';
            rowState[rowId] = { chosenId, correct: true };
        } else {
            // Wrong: red mark, revertable — do NOT lock
            optBtn.classList.add('lq-incorrect', 'lq-wrong-persistent');
            if (rowFeedback) rowFeedback.textContent = 'Try again!';
            // Allow the correct option to remain available
            // Update rowState with wrong answer (will be overwritten on correct pick)
            rowState[rowId] = { chosenId, correct: false };
        }

        refreshDone();
    }

    // ── Event delegation on host ─────────────────────────────────────────────
    host.addEventListener('click', e => {
        // Audio buttons
        const audioBtn = e.target.closest('.lq-pmr-audio-btn, .lq-pmr-row-audio, .lq-pmr-listen-again');
        if (audioBtn) {
            e.stopPropagation();
            const txt = audioBtn.dataset.speak;
            if (txt) _safeSpeak(txt);
            return;
        }

        // Option buttons
        const optBtn = e.target.closest('.lq-pmr-option');
        if (optBtn && !optBtn.disabled) {
            const rowId = optBtn.dataset.rowId;
            handleOptionClick(optBtn, rowId);
        }
    });

    // ── Keyboard navigation within each row ──────────────────────────────────
    host.addEventListener('keydown', e => {
        const optBtn = e.target.closest('.lq-pmr-option');
        if (!optBtn) return;
        const rowEl = optBtn.closest('.lq-pmr-row');
        if (!rowEl) return;
        const siblings = Array.from(rowEl.querySelectorAll('.lq-pmr-option:not([disabled])'));
        const idx = siblings.indexOf(optBtn);

        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            siblings[(idx + 1) % siblings.length].focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            siblings[(idx - 1 + siblings.length) % siblings.length].focus();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            optBtn.click();
        }
    });

    // ── Done button ───────────────────────────────────────────────────────────
    doneBtn.addEventListener('click', () => {
        if (doneBtn.disabled) return;

        const submitted = q.rows.map(row => {
            const rs = rowState[row.id];
            return {
                row_id: row.id,
                chosen_id: rs ? rs.chosenId : null,
                correct: rs ? rs.correct : false
            };
        });

        const allCorrect = submitted.every(r => r.correct);
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = 'All rows correct!';
        } else {
            const wrongCount = submitted.filter(r => !r.correct).length;
            feedbackZone.textContent =
                `${wrongCount} row${wrongCount === 1 ? '' : 's'} need${wrongCount === 1 ? 's' : ''} attention.`;
        }

        doneBtn.disabled = true;
        container._lqLastResult = { correct: allCorrect, submitted, firstAttempt,
            feedback: allCorrect ? 'All rows correct!' : 'Some rows were wrong.' };
    });

    refreshDone();
}

// ─── check ────────────────────────────────────────────────────────────────────

export function checkPictureMatchRow(q, container) {
    if (!container) return { correct: false, submitted: [], feedback: 'No container.' };
    if (container._lqLastResult) return container._lqLastResult;

    // Build from current DOM state (Done not yet clicked)
    const host = container.querySelector('.lq-pmr-host');
    if (!host || !Array.isArray(q.rows)) {
        return { correct: false, submitted: [], feedback: 'No answer data.' };
    }

    const submitted = q.rows.map(row => {
        const rowEl = host.querySelector(`.lq-pmr-row[data-row-id="${CSS.escape(row.id)}"]`);
        const selected = rowEl ? rowEl.querySelector('.lq-pmr-option.lq-selected') : null;
        const chosenId = selected ? selected.dataset.optId : null;
        const correct = selected ? selected.dataset.correct === '1' : false;
        return { row_id: row.id, chosen_id: chosenId, correct };
    });

    const allCorrect = submitted.length > 0 && submitted.every(r => r.correct);
    const answeredCount = submitted.filter(r => r.chosen_id !== null).length;

    if (answeredCount < q.rows.length) {
        return { correct: false, submitted,
            feedback: `${q.rows.length - answeredCount} row(s) not yet answered.` };
    }

    return {
        correct: allCorrect,
        submitted,
        feedback: allCorrect ? 'All rows correct!' : 'Some rows were wrong.'
    };
}
