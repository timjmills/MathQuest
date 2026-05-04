// mc-image.js — Single-select multiple-choice widget with image options.
//
// Question contract:
//   q.options:       [{ id, image, label?, alt? }]
//                    image  — URL string for <img src>
//                    label  — optional caption shown below the image
//                    alt    — alt text for the image (falls back to label)
//   q.ans:           string — correct option id
//   q.k2_appropriate: boolean — true → 3 large tiles, vivid border, auto-speak (K-2)
//                               false/undefined → up to 4 tiles, thin outlined border (2-5)
//   q.rit_difficulty: number (optional) — RIT < 141 limits to 2-3 options (K-2 only)
//
// Exports:
//   renderMcImage(q, container) — mounts widget inside container
//   checkMcImage(q, container)  — returns { correct, submitted, feedback }
//
// All per-option audio buttons speak the alt/label text via speakAnswerOption().

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _altText(opt) {
    return opt.alt != null ? opt.alt : (opt.label != null ? opt.label : '');
}

function _safeSpeak(text) {
    if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(text);
    }
}

// ─── render ─────────────────────────────────────────────────────────────────

export function renderMcImage(q, container) {
    if (!container || !q || !Array.isArray(q.options)) return;

    const isK2 = !!q.k2_appropriate;
    const variantClass = isK2 ? 'lq-k2' : 'lq-2-5';

    // Determine effective option count (RIT < 141 → cap at 3 for K-2, 2 if very low)
    let options = q.options;
    if (isK2 && typeof q.rit_difficulty === 'number' && q.rit_difficulty < 141) {
        options = options.slice(0, 3);
    }

    const tileSize = isK2 ? 'lq-mc-image-tile--large' : 'lq-mc-image-tile--medium';
    const gridClass = options.length <= 3
        ? 'lq-mc-grid lq-mc-grid--stacked'
        : 'lq-mc-grid lq-mc-grid--2x2';

    const tilesHtml = options.map(opt => {
        const alt = _altText(opt);
        const caption = opt.label
            ? `<span class="lq-mc-image-label">${opt.label}</span>`
            : '';
        const audioLabel = alt ? `Listen: ${alt}` : 'Listen';
        return `<button type="button"
            class="lq-mc-button lq-mc-image-tile ${variantClass} ${tileSize}"
            data-id="${opt.id}"
            role="radio"
            aria-pressed="false"
            aria-checked="false">
            <img class="lq-mc-image-img" src="${opt.image}" alt="${alt}">
            ${caption}
            <button type="button" class="lq-audio-btn" data-audio-for="${opt.id}"
                aria-label="${audioLabel}"
                tabindex="-1">🔊</button>
        </button>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-mc-grid-wrap">
            <div class="${gridClass}" role="radiogroup" aria-label="Answer choices">
                ${tilesHtml}
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
        </div>`;

    // K-2: auto-speak the question stem on render when TTS is on
    if (isK2 && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }

    const grid = container.querySelector('.lq-mc-grid');
    const feedbackZone = container.querySelector('.lq-feedback-zone');

    // ── event delegation ──────────────────────────────────────────────────
    grid.addEventListener('click', e => {
        // Audio button — speak alt text, do not select option
        const audioBtn = e.target.closest('.lq-audio-btn');
        if (audioBtn) {
            e.stopPropagation();
            const optId = audioBtn.dataset.audioFor;
            const opt = options.find(o => o.id === optId);
            if (opt) _safeSpeak(_altText(opt));
            return;
        }

        // Image tile button
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
        } else {
            btn.classList.add('lq-incorrect');
            btn.classList.add('lq-wrong-persistent');
            feedbackZone.textContent = 'Not quite — try again!';
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

export function checkMcImage(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container' };

    if (container._lqLastResult) {
        const { correct, submitted, firstAttempt } = container._lqLastResult;
        const correctOpt = (q.options || []).find(o => o.id === q.ans);
        const feedback = correct
            ? 'Correct!'
            : `The correct answer was: ${_altText(correctOpt || {})}`;
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
        : `The correct answer was: ${_altText(correctOpt || {})}`;
    return { correct, submitted, feedback };
}
