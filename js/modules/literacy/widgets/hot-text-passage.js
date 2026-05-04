// hot-text-passage.js — Selectable-text widget covering word, sentence, and paragraph
// granularity. Implements NWEA hot-text item type 3.
//
// Question contract:
//   q.passage:          string          — multi-paragraph text (paragraphs separated by \n\n)
//   q.granularity:      'word' | 'sentence' | 'paragraph'
//   q.task_text:        string          — e.g., "Highlight the sentence that states the main idea."
//   q.correct_indices:  number[]        — 0-based indices of correct tokens
//   q.multi_select?:    boolean         — default false
//   q.show_line_numbers?: boolean       — default true for paragraph granularity
//   q.k2_appropriate?:  boolean
//
// Exports:
//   renderHotTextPassage(q, container)
//   checkHotTextPassage(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ─── tokenizers ──────────────────────────────────────────────────────────────

/**
 * Split text into word tokens preserving surrounding whitespace as separate
 * pieces so we can reconstruct the passage faithfully.
 * Returns [{type:'token'|'space', text}]
 */
function _tokenizeWords(passage) {
    const result = [];
    let tokenIndex = 0;
    // Split on whitespace boundaries, keep the whitespace chunks
    const parts = passage.split(/(\s+)/);
    parts.forEach(part => {
        if (/^\s+$/.test(part)) {
            result.push({ type: 'space', text: part });
        } else if (part.length > 0) {
            result.push({ type: 'token', text: part, index: tokenIndex++ });
        }
    });
    return result;
}

/**
 * Split text into sentence tokens.
 * Sentence boundaries: end of [.!?] optionally followed by quotes/parens and whitespace.
 * Returns array of sentence strings, with their 0-based index.
 */
function _tokenizeSentences(passage) {
    // A sentence ends at [.!?]['"]? followed by \s+ (or end of string).
    const raw = passage.replace(/\n\n/g, ' ').replace(/\n/g, ' ');
    const sentenceRegex = /[^.!?]*[.!?]['")\]]*(?:\s+|$)/g;
    const sentences = [];
    let match;
    let lastIndex = 0;

    while ((match = sentenceRegex.exec(raw)) !== null) {
        sentences.push({ text: match[0].trimEnd(), index: sentences.length });
        lastIndex = match.index + match[0].length;
    }

    // Capture any trailing text not ending in sentence punctuation
    if (lastIndex < raw.length) {
        const tail = raw.slice(lastIndex).trim();
        if (tail.length > 0) {
            sentences.push({ text: tail, index: sentences.length });
        }
    }

    return sentences;
}

/**
 * Split passage into paragraph tokens (split on \n\n).
 */
function _tokenizeParagraphs(passage) {
    return passage
        .split(/\n\n+/)
        .map((p, i) => ({ text: p.trim(), index: i }))
        .filter(p => p.text.length > 0);
}

// ─── build passage HTML ───────────────────────────────────────────────────────

function _buildPassageHtml(q) {
    const passage    = q.passage  || '';
    const gran       = q.granularity || 'word';
    const showLines  = q.show_line_numbers != null
        ? !!q.show_line_numbers
        : gran === 'paragraph';

    let html = '';

    if (gran === 'word') {
        const parts = _tokenizeWords(passage);
        const pieces = parts.map(part => {
            if (part.type === 'space') {
                // Replace literal newlines with <br> and spaces with space
                return part.text.replace(/\n/g, '<br>');
            }
            return `<span
                class="lq-htp-token lq-htp-word"
                role="button"
                tabindex="0"
                data-token-index="${part.index}"
                aria-pressed="false"
                aria-label="${_esc(part.text)}"
                >${_esc(part.text)}</span>`;
        });
        html = `<div class="lq-htp-passage lq-htp-passage--word">${pieces.join('')}</div>`;

    } else if (gran === 'sentence') {
        const sentences = _tokenizeSentences(passage);
        const sentHtml  = sentences.map(s =>
            `<span
                class="lq-htp-token lq-htp-sentence"
                role="button"
                tabindex="0"
                data-token-index="${s.index}"
                aria-pressed="false"
                aria-label="${_esc(s.text)}"
                >${_esc(s.text)}</span> `
        ).join('');
        html = `<div class="lq-htp-passage lq-htp-passage--sentence">${sentHtml}</div>`;

    } else { // paragraph
        const paragraphs = _tokenizeParagraphs(passage);
        const paraHtml   = paragraphs.map((p, i) => {
            const lineNum = showLines
                ? `<span class="lq-htp-line-num" aria-hidden="true">${i + 1}</span>`
                : '';
            return `<div
                class="lq-htp-para-row"
                >
                ${lineNum}
                <span
                    class="lq-htp-token lq-htp-paragraph"
                    role="button"
                    tabindex="0"
                    data-token-index="${p.index}"
                    aria-pressed="false"
                    aria-label="Paragraph ${i + 1}: ${_esc(p.text)}"
                    >${_esc(p.text)}</span>
            </div>`;
        }).join('');
        html = `<div class="lq-htp-passage lq-htp-passage--paragraph">${paraHtml}</div>`;
    }

    return html;
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderHotTextPassage(q, container) {
    if (!container || !q) return;

    const taskText  = _esc(q.task_text || 'Select the correct text.');
    const isMulti   = !!q.multi_select;
    const isK2      = !!q.k2_appropriate;
    const gran      = q.granularity || 'word';

    const passageHtml = _buildPassageHtml(q);

    const granLabel = gran === 'word' ? 'word' : gran === 'sentence' ? 'sentence' : 'paragraph';

    container.innerHTML = `
        <div class="lq-htp-host${isK2 ? ' lq-htp-host--k2' : ''}"
             role="application"
             aria-label="Hot-text — select the correct ${granLabel}">

            <p class="lq-htp-task-text">${taskText}</p>

            ${passageHtml}

            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            ${isMulti
                ? `<button type="button" class="lq-htp-submit primary-btn" disabled>Submit</button>`
                : ''}
        </div>`;

    _attachInteraction(q, container, isMulti, isK2);

    // K-2: auto-speak task
    if (isK2 && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }
}

// ─── interaction ─────────────────────────────────────────────────────────────

function _attachInteraction(q, container, isMulti, isK2) {
    const host        = container.querySelector('.lq-htp-host');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn   = host.querySelector('.lq-htp-submit');

    if (!host) return;

    const correctSet = new Set(Array.isArray(q.correct_indices) ? q.correct_indices : []);
    let locked = false;

    function getTokens() {
        return Array.from(host.querySelectorAll('.lq-htp-token'));
    }

    function getSelected() {
        return getTokens().filter(el => el.classList.contains('lq-htp-selected'));
    }

    function refreshSubmit() {
        if (submitBtn) submitBtn.disabled = locked || getSelected().length === 0;
    }

    function lockToken(el, isCorrect) {
        el.dataset.locked = '1';
        el.setAttribute('tabindex', '-1');
        if (isCorrect) {
            el.classList.add('lq-htp-locked-correct', 'lq-correct');
        } else {
            el.classList.add('lq-htp-locked-wrong');
        }
    }

    function handleTap(el) {
        if (locked || el.dataset.locked === '1') return;

        const idx       = parseInt(el.dataset.tokenIndex, 10);
        const isCorrect = correctSet.has(idx);

        if (!isMulti) {
            // Single-select: immediate feedback
            const firstAttempt = isFirstAttempt();
            markFirstAttempt(isCorrect);

            if (isCorrect) {
                el.classList.add('lq-htp-selected');
                el.setAttribute('aria-pressed', 'true');
                lockToken(el, true);
                feedbackZone.textContent = 'Correct!';
                // Lock all other tokens
                getTokens().forEach(t => {
                    if (t !== el && !t.dataset.locked) {
                        t.setAttribute('tabindex', '-1');
                        t.dataset.locked = 'soft';
                    }
                });
                locked = true;
            } else {
                el.classList.add('lq-htp-wrong', 'lq-wrong-persistent');
                el.setAttribute('aria-pressed', 'true');
                feedbackZone.textContent = 'Not quite — try again!';
                // Allow retry: remove wrong class after animation
                setTimeout(() => {
                    el.classList.remove('lq-htp-wrong', 'lq-wrong-persistent');
                    el.setAttribute('aria-pressed', 'false');
                }, 1500);
            }

            container._lqLastResult = {
                correct: isCorrect,
                submitted: [idx],
                firstAttempt
            };
        } else {
            // Multi-select: toggle
            if (el.classList.contains('lq-htp-selected')) {
                el.classList.remove('lq-htp-selected');
                el.setAttribute('aria-pressed', 'false');
            } else {
                el.classList.add('lq-htp-selected');
                el.setAttribute('aria-pressed', 'true');
            }
            refreshSubmit();
        }
    }

    // Delegated click
    host.addEventListener('click', e => {
        if (locked) return;
        const el = e.target.closest('.lq-htp-token');
        if (!el || !host.contains(el)) return;
        handleTap(el);
    });

    // Keyboard
    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const el = e.target.closest('.lq-htp-token');
        if (el) {
            e.preventDefault();
            handleTap(el);
        }
    });

    // Multi-select Submit
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (submitBtn.disabled || locked) return;

            const selectedEls  = getSelected();
            const selectedIdxs = selectedEls.map(el => parseInt(el.dataset.tokenIndex, 10));
            const allCorrect   = selectedIdxs.length === correctSet.size &&
                selectedIdxs.every(i => correctSet.has(i));

            const firstAttempt = isFirstAttempt();
            markFirstAttempt(allCorrect);

            let wrongCount = 0;
            getTokens().forEach(el => {
                const idx       = parseInt(el.dataset.tokenIndex, 10);
                const isSelected = el.classList.contains('lq-htp-selected');
                const isCorrect  = correctSet.has(idx);

                if (isSelected && isCorrect) {
                    lockToken(el, true);
                } else if (isSelected && !isCorrect) {
                    el.classList.remove('lq-htp-selected');
                    el.classList.add('lq-htp-wrong', 'lq-wrong-persistent');
                    el.setAttribute('aria-pressed', 'false');
                    wrongCount++;
                    setTimeout(() => {
                        el.classList.remove('lq-htp-wrong', 'lq-wrong-persistent');
                    }, 1600);
                }
            });

            if (allCorrect) {
                feedbackZone.textContent = 'Correct!';
                locked = true;
                submitBtn.disabled = true;
            } else {
                feedbackZone.textContent = `${wrongCount} incorrect — adjust and try again.`;
                refreshSubmit();
            }

            container._lqLastResult = {
                correct: allCorrect,
                submitted: selectedIdxs,
                firstAttempt
            };
        });
    }

    refreshSubmit();
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkHotTextPassage(q, container) {
    if (!container) return { correct: false, submitted: [] };

    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-htp-host');
    if (!host) return { correct: false, submitted: [] };

    const selected     = Array.from(host.querySelectorAll('.lq-htp-token.lq-htp-selected, .lq-htp-token.lq-htp-locked-correct'))
        .map(el => parseInt(el.dataset.tokenIndex, 10));
    const correctSet   = new Set(Array.isArray(q.correct_indices) ? q.correct_indices : []);
    const correct      = selected.length === correctSet.size &&
        selected.every(i => correctSet.has(i));

    return { correct, submitted: selected };
}
