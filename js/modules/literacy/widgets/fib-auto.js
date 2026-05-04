// fib-auto.js — Fill-in-the-blank with auto-grading.
//
// This is the Boom-limitations-resolved widget:
//   - Case-sensitivity is configurable PER BLANK (not deck-level)
//   - "Any one of" matching: student's answer must match ANY value in
//     acceptable_answers (Boom requires ALL of them — we do not)
//
// Question contract:
//   q.stem:              string — may contain {{blank:0}}, {{blank:1}} … markers.
//                                 If no markers, a single input is appended below.
//   q.ans:               array of accept-list objects, one per blank:
//                          [{
//                            acceptable_answers: string[],
//                            case_sensitive?:    boolean  (default false),
//                            normalize_whitespace?: boolean (default true),
//                            normalize_punctuation?: boolean (default false),
//                            label?:             string  — aria-label hint
//                          }]
//   q.partial_credit?:   boolean  (default true) — show per-blank correct feedback
//   q.k2_appropriate?:   boolean  — larger inputs + auto-speak
//
// Per-element audio: speaker button next to each input reads the prompt sentence.
//
// Partial-lock pattern on wrong submit:
//   Correct blanks → disabled (lq-locked-correct), value preserved
//   Wrong blanks   → cleared, .lq-wrong-persistent, retry
//
// Exports:
//   renderFibAuto(q, container)
//   checkFibAuto(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── normalization ────────────────────────────────────────────────────────────

function _normalizeInput(raw, spec) {
    let s = String(raw == null ? '' : raw);

    const doNormWS = spec.normalize_whitespace !== false; // default true
    if (doNormWS) {
        s = s.trim().replace(/\s+/g, ' ');
    }

    const doNormPunct = spec.normalize_punctuation === true; // default false
    if (doNormPunct) {
        // Strip common punctuation from both ends
        s = s.replace(/^[.,;:!?'"()\[\]{}]+|[.,;:!?'"()\[\]{}]+$/g, '');
    }

    if (!spec.case_sensitive) {
        s = s.toLowerCase();
    }

    return s;
}

function _normalizeAnswer(ans, spec) {
    let s = String(ans == null ? '' : ans);

    const doNormWS = spec.normalize_whitespace !== false;
    if (doNormWS) {
        s = s.trim().replace(/\s+/g, ' ');
    }

    const doNormPunct = spec.normalize_punctuation === true;
    if (doNormPunct) {
        s = s.replace(/^[.,;:!?'"()\[\]{}]+|[.,;:!?'"()\[\]{}]+$/g, '');
    }

    if (!spec.case_sensitive) {
        s = s.toLowerCase();
    }

    return s;
}

function _checkBlank(userValue, spec) {
    if (!spec || !Array.isArray(spec.acceptable_answers)) return false;
    const normalized = _normalizeInput(userValue, spec);
    return spec.acceptable_answers.some(a => _normalizeAnswer(a, spec) === normalized);
}

// ─── HTML builder ─────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _buildInput(blankIndex, spec, isK2) {
    const label = (spec && spec.label) ? _esc(spec.label) : `Blank ${blankIndex + 1}`;
    const sizePx = isK2 ? 'height:2.5rem;font-size:1.2rem;' : '';
    const audioBtn = `<button type="button" class="lq-fib-audio-btn"
        data-blank-index="${blankIndex}"
        aria-label="Listen to prompt"
        tabindex="-1">🔊</button>`;
    return `<span class="lq-fib-blank-wrap" data-blank-index="${blankIndex}">
        <input
            class="lq-fib-input"
            type="text"
            data-blank-index="${blankIndex}"
            aria-label="${label}"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            style="${sizePx}">
        ${audioBtn}
    </span>`;
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderFibAuto(q, container) {
    if (!container || !q) return;

    const specs = Array.isArray(q.ans) ? q.ans : [];
    const isK2 = !!q.k2_appropriate;
    const stem = q.stem || '';

    // Build stem HTML, replacing {{blank:N}} markers with inputs
    const BLANK_RE = /\{\{blank:(\d+)\}\}/g;
    let hasMarkers = false;
    const stemHtml = stem.replace(BLANK_RE, (_, idx) => {
        hasMarkers = true;
        const i = parseInt(idx, 10);
        const spec = specs[i] || {};
        return _buildInput(i, spec, isK2);
    });

    // Single-input mode: no markers → render stem then one input below
    let bodyHtml;
    if (!hasMarkers) {
        const spec = specs[0] || {};
        bodyHtml = `
            <div class="lq-fib-stem">${_esc(stem)}</div>
            <div class="lq-fib-single-input-row">
                ${_buildInput(0, spec, isK2)}
            </div>`;
    } else {
        bodyHtml = `<div class="lq-fib-stem lq-fib-stem--inline">${stemHtml}</div>`;
    }

    container.innerHTML = `
        <div class="lq-fib-host">
            ${bodyHtml}
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-fib-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-fib-host');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-fib-submit');

    // ── K-2 auto-speak ────────────────────────────────────────────────────────
    if (isK2 && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }

    // ── Enable submit when at least one non-locked input has content ──────────
    function refreshSubmit() {
        const inputs = Array.from(host.querySelectorAll('.lq-fib-input:not([disabled])'));
        const anyFilled = inputs.some(inp => inp.value.trim().length > 0);
        submitBtn.disabled = !anyFilled;
    }

    host.addEventListener('input', e => {
        if (e.target.classList.contains('lq-fib-input')) {
            refreshSubmit();
        }
    });

    // Enter key in an input submits (if submit is enabled)
    host.addEventListener('keydown', e => {
        if (e.key === 'Enter' && e.target.classList.contains('lq-fib-input')) {
            e.preventDefault();
            if (!submitBtn.disabled) submitBtn.click();
        }
    });

    // ── Audio buttons ─────────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        const btn = e.target.closest('.lq-fib-audio-btn');
        if (!btn) return;
        e.preventDefault();
        // Speak the stem text (stripped of blank markers)
        const speakText = stem.replace(BLANK_RE, '___');
        if (state.ttsEnabled && typeof window.speakQuestion === 'function') {
            window.speakQuestion(speakText);
        } else if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(speakText);
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
        }
    });
    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const btn = e.target.closest('.lq-fib-audio-btn');
        if (!btn) return;
        e.preventDefault();
        btn.click();
    });

    // ── Submit handler ────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled) return;

        const inputs = Array.from(host.querySelectorAll('.lq-fib-input'));
        const blankCount = Math.max(inputs.length, specs.length, 1);

        const results = [];
        let correctCount = 0;

        inputs.forEach(inp => {
            const i = parseInt(inp.dataset.blankIndex, 10);
            const spec = specs[i] || { acceptable_answers: [], normalize_whitespace: true };
            const correct = _checkBlank(inp.value, spec);
            // Capture value NOW before partial-lock loop clears wrong blanks
            results.push({ index: i, correct, input: inp, value: inp.value });
            if (correct) correctCount++;
        });

        const allCorrect = correctCount === inputs.length;
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(allCorrect);

        // Apply partial-lock pattern
        results.forEach(({ correct, input }) => {
            if (correct) {
                input.classList.add('lq-locked-correct');
                input.classList.remove('lq-wrong-persistent');
                input.disabled = true;
            } else {
                input.classList.remove('lq-locked-correct');
                input.classList.add('lq-wrong-persistent');
                input.value = '';
                input.disabled = false;
            }
        });

        if (allCorrect) {
            feedbackZone.textContent = 'Correct!';
            submitBtn.disabled = true;
        } else {
            const wrongCount = inputs.length - correctCount;
            if (q.partial_credit !== false && correctCount > 0) {
                feedbackZone.textContent =
                    `${correctCount} correct, ${wrongCount} to fix — try again!`;
            } else {
                feedbackZone.textContent = 'Not quite — try again!';
            }
            refreshSubmit();
        }

        // Build submitted values snapshot from the pre-clear values stored in results[]
        const submitted = {};
        results.forEach(r => {
            submitted[r.index] = r.value;
        });

        container._lqLastResult = {
            correct: allCorrect,
            submitted,
            perBlank: results.map(r => ({ index: r.index, correct: r.correct })),
            correctCount,
            totalBlanks: blankCount,
            firstAttempt
        };
    });

    refreshSubmit();
}

// ─── check ──────────────────────────────────────────────────────────────────

export function checkFibAuto(q, container) {
    if (!container) return { correct: false, submitted: {}, perBlank: [] };

    if (container._lqLastResult) return container._lqLastResult;

    // Derive from current DOM state (no prior submit)
    const host = container.querySelector('.lq-fib-host');
    if (!host) return { correct: false, submitted: {}, perBlank: [] };

    const specs = Array.isArray(q.ans) ? q.ans : [];
    const inputs = Array.from(host.querySelectorAll('.lq-fib-input'));

    const submitted = {};
    const perBlank = [];
    let correctCount = 0;

    inputs.forEach(inp => {
        const i = parseInt(inp.dataset.blankIndex, 10);
        const spec = specs[i] || { acceptable_answers: [], normalize_whitespace: true };
        const correct = _checkBlank(inp.value, spec);
        submitted[i] = inp.value;
        perBlank.push({ index: i, correct });
        if (correct) correctCount++;
    });

    const correct = inputs.length > 0 && correctCount === inputs.length;
    return { correct, submitted, perBlank, correctCount, totalBlanks: inputs.length };
}
