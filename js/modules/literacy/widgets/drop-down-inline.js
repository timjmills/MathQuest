// drop-down-inline.js — Inline dropdown cloze widget for Language Usage grammar editing.
//
// A sentence with one or more inline <select> dropdowns at {{slot:N}} positions.
// Student picks the correct option from each dropdown; Submit checks all slots.
//
// Question contract:
//   q.stem:       string   — sentence text with {{slot:0}}, {{slot:1}}, ... markers
//   q.slots:      [{ id: 'slot:0', options: string[], correct: string }]
//   q.task_text?: string   — default "Choose the correct word for each blank."
//   q.k2_appropriate?: boolean  (not used — this widget is 2-5 only per spec)
//
// Exports:
//   renderDropDownInline(q, container)
//   checkDropDownInline(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Build a slot lookup map: slotId → slot object */
function _slotMap(slots) {
    const m = {};
    (slots || []).forEach(s => { m[s.id] = s; });
    return m;
}

/**
 * Parse q.stem and replace {{slot:N}} markers with <select> elements.
 * Returns an HTML string.
 */
function _buildStemHtml(stem, slots) {
    const slotByN = {};
    (slots || []).forEach(s => {
        // id is expected to be 'slot:0', 'slot:1', etc. — also tolerate bare '0','1'.
        const num = String(s.id).replace(/^slot:?/, '');
        slotByN[num] = s;
    });

    // Replace {{slot:N}} or {{slot:N}} markers
    return stem.replace(/\{\{slot:(\d+)\}\}/g, (match, n) => {
        const slot = slotByN[n];
        if (!slot) return `<span class="lq-ddi-missing-slot">[slot:${n}]</span>`;

        const optionsHtml = slot.options.map(opt =>
            `<option value="${_esc(opt)}">${_esc(opt)}</option>`
        ).join('');

        // Blank "choose…" placeholder as first option
        const placeholder = `<option value="" selected disabled hidden>▾</option>`;

        return `<span class="lq-ddi-slot-wrap">
            <select
                class="lq-ddi-select"
                data-slot-id="${_esc(slot.id)}"
                aria-label="Blank ${n}: choose the correct word"
                >
                ${placeholder}
                ${optionsHtml}
            </select>
        </span>`;
    });
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderDropDownInline(q, container) {
    if (!container || !q) return;

    const slots    = Array.isArray(q.slots) ? q.slots : [];
    const taskText = q.task_text || 'Choose the correct word for each blank.';
    const stemHtml = _buildStemHtml(q.stem || '', slots);

    container.innerHTML = `
        <div class="lq-ddi-host" role="form" aria-label="Dropdown cloze — fill in the blanks">

            <p class="lq-ddi-task-text">${_esc(taskText)}</p>

            <div class="lq-ddi-sentence" aria-label="Sentence with blanks">
                ${stemHtml}
            </div>

            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-ddi-submit primary-btn" disabled>Submit</button>
        </div>`;

    _attachInteraction(q, container, slots);
}

// ─── interaction ─────────────────────────────────────────────────────────────

function _attachInteraction(q, container, slots) {
    const host        = container.querySelector('.lq-ddi-host');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn   = host.querySelector('.lq-ddi-submit');

    if (!host) return;

    const map = _slotMap(slots);

    function getSelects() {
        return Array.from(host.querySelectorAll('.lq-ddi-select'));
    }

    function allFilled() {
        return getSelects().every(sel => sel.value !== '');
    }

    function refreshSubmit() {
        submitBtn.disabled = !allFilled();
    }

    // Monitor changes to enable submit
    host.addEventListener('change', e => {
        if (!e.target.matches('.lq-ddi-select')) return;
        // Remove prior feedback classes on this select
        e.target.classList.remove('lq-correct', 'lq-incorrect', 'lq-wrong-persistent');
        feedbackZone.textContent = '';
        refreshSubmit();
    });

    // Submit
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled) return;

        const sels         = getSelects();
        let wrongCount     = 0;
        let correctCount   = 0;

        const firstAttempt = isFirstAttempt();
        const submitted    = {};

        sels.forEach(sel => {
            const slotId  = sel.dataset.slotId;
            const slot    = map[slotId];
            const chosen  = sel.value;
            submitted[slotId] = chosen;

            if (!slot) return;

            if (chosen === slot.correct) {
                correctCount++;
                sel.classList.add('lq-correct');
                sel.classList.remove('lq-incorrect', 'lq-wrong-persistent');
                sel.disabled = true;     // lock correct selects
            } else {
                wrongCount++;
                sel.classList.add('lq-incorrect', 'lq-wrong-persistent');
                sel.classList.remove('lq-correct');
                // Clear value so student must re-pick
                sel.value = '';
                // Remove wrong styling after animation window
                setTimeout(() => {
                    sel.classList.remove('lq-wrong-persistent');
                }, 1600);
            }
        });

        const allCorrect = wrongCount === 0;
        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = 'All blanks correct!';
            submitBtn.disabled = true;
        } else {
            feedbackZone.textContent =
                `${wrongCount} blank${wrongCount === 1 ? '' : 's'} incorrect — try again.`;
            refreshSubmit();
        }

        container._lqLastResult = { correct: allCorrect, submitted, firstAttempt };
    });

    refreshSubmit();

    // TTS: speak task text on load if enabled (no K-2 auto-speak per spec)
    if (state.ttsEnabled && q.k2_appropriate &&
        typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkDropDownInline(q, container) {
    if (!container) return { correct: false, submitted: {} };

    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-ddi-host');
    if (!host) return { correct: false, submitted: {} };

    const slots   = Array.isArray(q.slots) ? q.slots : [];
    const map     = _slotMap(slots);
    const sels    = Array.from(host.querySelectorAll('.lq-ddi-select'));
    const submitted = {};
    let allCorrect  = sels.length > 0;

    sels.forEach(sel => {
        const slotId = sel.dataset.slotId;
        const slot   = map[slotId];
        submitted[slotId] = sel.value;
        if (!slot || sel.value !== slot.correct) allCorrect = false;
    });

    return { correct: allCorrect, submitted };
}
