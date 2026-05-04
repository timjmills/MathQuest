// column-letter-build.js — ETC Type 7: 3-column letter picker.
//
// Three (or more) columns of letter tiles arranged vertically; the student
// taps exactly one letter per column. Chosen letters appear in an assembly
// row in phoneme-position order. Auto-checks when all columns are filled.
//
// Question contract:
//   q.target_word:     string                 — e.g. "cat"
//   q.audio_text?:     string                 — TTS text (defaults to q.target_word)
//   q.columns: [
//       { position: number, letters: string[], correct: string }
//   ]                                          — one entry per phoneme position
//   q.show_picture?:   string                 — optional emoji/image hint
//   q.task_text?:      string                 — default "Pick one letter from each column to build the word"
//   q.k2_appropriate?: boolean
//
// Exports:
//   renderColumnLetterBuild(q, container)
//   checkColumnLetterBuild(q, container)
//     → { correct, submitted: string[] (picked letters per position), feedback }

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
            u.rate = 0.8;
            window.speechSynthesis.speak(u);
        }
    } catch (_) { /* TTS unavailable */ }
}

function _isEmoji(str) {
    if (!str || str.length > 8) return false;
    return !/[a-zA-Z0-9]/.test(str);
}

function _pictureHtml(image) {
    if (!image) return '';
    if (_isEmoji(image)) {
        return `<div class="lq-clb-picture" role="img" aria-label="picture hint">${_esc(image)}</div>`;
    }
    return `<div class="lq-clb-picture">
        <img src="${_esc(image)}" alt="picture hint" class="lq-clb-img">
    </div>`;
}

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function _tileColorClass(letter, isK2) {
    if (!isK2) return '';
    return VOWELS.has(letter.toLowerCase()) ? ' lq-clb-tile--vowel' : ' lq-clb-tile--consonant';
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderColumnLetterBuild(q, container) {
    if (!container || !q) return;
    if (!Array.isArray(q.columns) || q.columns.length === 0) return;

    const isK2 = !!q.k2_appropriate;
    const targetWord = (q.target_word || '').toLowerCase();
    const audioText = q.audio_text || q.target_word || '';
    const taskText = q.task_text || 'Pick one letter from each column to build the word.';
    const cols = q.columns.slice().sort((a, b) => a.position - b.position);
    const wordLen = cols.length;

    // Build columns HTML
    const colsHtml = cols.map((col, colIdx) => {
        const tilesHtml = col.letters.map(letter => {
            const colorCls = _tileColorClass(letter, isK2);
            return `<button type="button"
                class="lq-clb-tile${colorCls}"
                data-col="${colIdx}"
                data-letter="${_esc(letter.toLowerCase())}"
                data-correct="${letter.toLowerCase() === col.correct.toLowerCase() ? '1' : '0'}"
                aria-pressed="false"
                aria-label="Letter ${_esc(letter.toUpperCase())}">
                ${_esc(letter.toUpperCase())}
            </button>`;
        }).join('');

        return `<div class="lq-clb-col"
                    data-col-index="${colIdx}"
                    role="group"
                    aria-label="Position ${colIdx + 1}">
                    ${tilesHtml}
                </div>`;
    }).join('');

    // Assembly row: one slot per column position
    const assemblySlots = cols.map((_, i) =>
        `<div class="lq-clb-assembly-slot"
             data-slot="${i}"
             aria-label="Position ${i + 1}, empty">&nbsp;</div>`
    ).join('');

    const pictureHtml = q.show_picture ? _pictureHtml(q.show_picture) : '';

    container.innerHTML = `
        <div class="lq-clb-host">
            <p class="lq-clb-task">${_esc(taskText)}</p>
            <div class="lq-clb-top-row">
                ${pictureHtml}
                <button type="button"
                    class="lq-clb-audio-btn lq-audio-btn"
                    aria-label="Listen to the word">&#128266; Listen</button>
            </div>
            <div class="lq-clb-columns-wrap">
                ${colsHtml}
            </div>
            <div class="lq-clb-assembly-wrap" aria-label="Your word so far">
                <div class="lq-clb-assembly-row">
                    ${assemblySlots}
                </div>
                <div class="lq-clb-assembly-feedback" aria-live="polite"
                     aria-atomic="true"></div>
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
        </div>`;

    const host = container.querySelector('.lq-clb-host');
    const feedbackEl = host.querySelector('.lq-feedback-zone');
    const assemblyFeedback = host.querySelector('.lq-clb-assembly-feedback');

    // Tracks picked letter per column: colIdx → letter string (or null)
    const picks = new Array(wordLen).fill(null);
    let locked = false;

    // K-2 / auto-speak
    host.querySelector('.lq-clb-audio-btn').addEventListener('click', () => _safeSpeak(audioText));
    if (isK2 || (state && state.ttsEnabled)) {
        setTimeout(() => _safeSpeak(audioText), 120);
    }

    // ── Update assembly row display ───────────────────────────────────────────
    function refreshAssembly() {
        cols.forEach((_, i) => {
            const slot = host.querySelector(`.lq-clb-assembly-slot[data-slot="${i}"]`);
            if (!slot) return;
            if (picks[i]) {
                slot.textContent = picks[i].toUpperCase();
                slot.setAttribute('aria-label', `Position ${i + 1}: ${picks[i].toUpperCase()}`);
                slot.classList.add('lq-clb-slot--filled');
            } else {
                slot.innerHTML = '&nbsp;';
                slot.setAttribute('aria-label', `Position ${i + 1}, empty`);
                slot.classList.remove('lq-clb-slot--filled');
            }
        });
    }

    // ── Auto-check when all columns filled ───────────────────────────────────
    function tryAutoCheck() {
        if (locked) return;
        const allFilled = picks.every(p => p !== null);
        if (!allFilled) return;

        const builtWord = picks.join('').toLowerCase();
        const correct = builtWord === targetWord;
        const firstAttempt = isFirstAttempt();
        markFirstAttempt(correct);

        if (correct) {
            // Lock green
            host.querySelectorAll('.lq-clb-tile').forEach(t => {
                t.disabled = true;
            });
            host.querySelectorAll('.lq-clb-assembly-slot').forEach(s => {
                s.classList.add('lq-correct');
            });
            feedbackEl.textContent = `Correct! "${targetWord}"`;
            locked = true;
            container._lqLastResult = {
                correct: true,
                submitted: picks.slice(),
                feedback: `Correct! The word is "${targetWord}".`,
                firstAttempt
            };
        } else {
            // Red flash on assembly row, clear all picks
            host.querySelectorAll('.lq-clb-assembly-slot').forEach(s => {
                s.classList.add('lq-clb-flash-wrong');
            });
            feedbackEl.textContent = 'Not quite — try again!';
            setTimeout(() => {
                host.querySelectorAll('.lq-clb-assembly-slot').forEach(s => {
                    s.classList.remove('lq-clb-flash-wrong');
                });
                // Clear all picks
                for (let i = 0; i < wordLen; i++) picks[i] = null;
                // Deselect all tiles
                host.querySelectorAll('.lq-clb-tile').forEach(t => {
                    t.classList.remove('lq-selected', 'lq-incorrect');
                    t.setAttribute('aria-pressed', 'false');
                });
                refreshAssembly();
                feedbackEl.textContent = '';
            }, 700);
            container._lqLastResult = {
                correct: false,
                submitted: picks.slice(),
                feedback: 'Wrong word — try again.',
                firstAttempt
            };
        }
    }

    // ── Click handler ─────────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-clb-tile');
        if (!tile || tile.disabled) return;

        const colIdx = parseInt(tile.dataset.col, 10);
        const letter = tile.dataset.letter;

        // Deselect previously picked tile in same column
        const colEl = host.querySelector(`.lq-clb-col[data-col-index="${colIdx}"]`);
        if (colEl) {
            colEl.querySelectorAll('.lq-clb-tile').forEach(t => {
                t.classList.remove('lq-selected');
                t.setAttribute('aria-pressed', 'false');
            });
        }

        // Select new tile
        tile.classList.add('lq-selected');
        tile.setAttribute('aria-pressed', 'true');
        picks[colIdx] = letter;

        refreshAssembly();
        tryAutoCheck();
    });

    // ── Keyboard navigation within each column ────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-clb-tile');
        if (!tile) return;
        const colIdx = parseInt(tile.dataset.col, 10);
        const colEl = host.querySelector(`.lq-clb-col[data-col-index="${colIdx}"]`);
        if (!colEl) return;
        const siblings = Array.from(colEl.querySelectorAll('.lq-clb-tile:not([disabled])'));
        const idx = siblings.indexOf(tile);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            siblings[(idx + 1) % siblings.length].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            siblings[(idx - 1 + siblings.length) % siblings.length].focus();
        } else if (e.key === 'ArrowRight') {
            // Move to next column
            e.preventDefault();
            const nextColEl = host.querySelector(`.lq-clb-col[data-col-index="${colIdx + 1}"]`);
            if (nextColEl) {
                const first = nextColEl.querySelector('.lq-clb-tile:not([disabled])');
                if (first) first.focus();
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevColEl = host.querySelector(`.lq-clb-col[data-col-index="${colIdx - 1}"]`);
            if (prevColEl) {
                const first = prevColEl.querySelector('.lq-clb-tile:not([disabled])');
                if (first) first.focus();
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            tile.click();
        }
    });

    refreshAssembly();
}

// ─── check ────────────────────────────────────────────────────────────────────

export function checkColumnLetterBuild(q, container) {
    if (!container) return { correct: false, submitted: [], feedback: 'No container.' };
    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-clb-host');
    if (!host) return { correct: false, submitted: [], feedback: 'Not rendered.' };

    const cols = Array.isArray(q.columns)
        ? q.columns.slice().sort((a, b) => a.position - b.position)
        : [];
    const targetWord = (q.target_word || '').toLowerCase();

    const submitted = cols.map((_, i) => {
        const slot = host.querySelector(`.lq-clb-assembly-slot[data-slot="${i}"]`);
        const text = slot ? slot.textContent.trim().toLowerCase() : null;
        return (text && text !== ' ') ? text : null;
    });

    const allFilled = submitted.every(s => s !== null);
    const builtWord = submitted.join('').toLowerCase();
    const correct = allFilled && builtWord === targetWord;

    return {
        correct,
        submitted,
        feedback: correct
            ? `Correct! The word is "${targetWord}".`
            : allFilled
                ? `Built "${builtWord}", expected "${targetWord}".`
                : 'Not all columns filled.'
    };
}
