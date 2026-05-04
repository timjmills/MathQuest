// word-chain.js — UFLI "say-spell-change" orthographic mapping widget.
//
// Per PHASE_0_DECISIONS.md "UFLI Foundations integration" section.
// Student hears an audio prompt, drags (or clicks) letter tiles into Elkonin-style
// boxes to spell the current word, then sees the chain grow step by step.
//
// Question contract:
//   q.chain: Array<{ word: string, audio_prompt: string, position: number }>
//     — ordered list of chain steps (each step is one word to build)
//   q.starting_letters_pool: string[]
//     — letter tiles shown in the pool (e.g. ['a','e','i','o','u','b','c','p','t','s','l'])
//   q.box_count_max?: number
//     — upper bound on Elkonin box row width; default = max word length in chain
//
// Exports:
//   renderWordChain(q, container)  — mounts widget
//   checkWordChain(q, container)   — returns { correct, submitted, feedback }
//
// Container state:
//   container._wordChainState  — private mutable state object

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ─────────────────────────────────────────────────────────────────

function _safeSpeak(text) {
    try {
        if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
            window.speakAnswerOption(text);
        }
    } catch (_) { /* no-op */ }
}

function _letterCount(word) {
    return word.length;
}

function _maxChainLetterCount(chain) {
    return chain.reduce((max, step) => Math.max(max, _letterCount(step.word)), 0);
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderWordChain(q, container) {
    if (!container || !q || !Array.isArray(q.chain) || q.chain.length === 0) return;
    if (!Array.isArray(q.starting_letters_pool) || q.starting_letters_pool.length === 0) return;

    const chain       = q.chain;
    const pool        = q.starting_letters_pool.map(l => l.toLowerCase());
    const boxCountMax = q.box_count_max || _maxChainLetterCount(chain);

    // Private mutable state
    const wcs = {
        stepIndex:       0,          // current chain step (0-based)
        boxContents:     [],         // string | null per box (length = currentWord.length)
        dragTile:        null,       // { letter, tileEl, fromPool } — active drag
        clickSelectedTile: null,     // el currently highlighted for click-to-place
        doneFired:       false,
    };
    container._wordChainState = wcs;

    // ── DOM scaffold ──────────────────────────────────────────────────────────

    container.innerHTML = `
        <div class="lq-wc-card" role="application" aria-label="Word chain spelling activity">

            <!-- step header -->
            <div class="lq-wc-header">
                <span class="lq-wc-step-label" id="lq-wc-step-label" aria-live="polite" aria-atomic="true"></span>
            </div>

            <!-- breadcrumb: completed chain words lock here -->
            <div class="lq-wc-breadcrumb" id="lq-wc-breadcrumb" aria-label="Words spelled so far"></div>

            <!-- audio prompt -->
            <div class="lq-wc-prompt-row">
                <button type="button" class="lq-wc-audio-btn" id="lq-wc-audio-btn"
                        aria-label="Hear the instruction">
                    &#128266; <span id="lq-wc-prompt-text"></span>
                </button>
            </div>

            <!-- Elkonin boxes -->
            <div class="lq-wc-boxes-wrap">
                <div class="lq-wc-boxes" id="lq-wc-boxes"
                     role="group" aria-label="Spelling boxes"></div>
            </div>

            <!-- letter tile pool -->
            <div class="lq-wc-pool-wrap">
                <div class="lq-wc-pool" id="lq-wc-pool"
                     role="group" aria-label="Letter tiles"></div>
            </div>

            <!-- feedback banner -->
            <div class="lq-wc-feedback" id="lq-wc-feedback"
                 aria-live="assertive" aria-atomic="true"></div>

            <!-- celebration overlay (hidden until chain done) -->
            <div class="lq-wc-celebration" id="lq-wc-celebration" hidden
                 role="status" aria-live="polite">
                <div class="lq-wc-celebration-box">
                    <div class="lq-wc-celebration-emoji">&#127881;</div>
                    <div class="lq-wc-celebration-msg" id="lq-wc-celebration-msg"></div>
                </div>
            </div>

            <!-- SR-only live region for step transitions -->
            <div id="lq-wc-sr" aria-live="polite" aria-atomic="true"
                 style="position:absolute;left:-9999px;height:1px;overflow:hidden;"></div>
        </div>`;

    _injectStyles();

    // ── element refs ──────────────────────────────────────────────────────────

    const stepLabel      = container.querySelector('#lq-wc-step-label');
    const breadcrumb     = container.querySelector('#lq-wc-breadcrumb');
    const audioBtn       = container.querySelector('#lq-wc-audio-btn');
    const promptText     = container.querySelector('#lq-wc-prompt-text');
    const boxesEl        = container.querySelector('#lq-wc-boxes');
    const poolEl         = container.querySelector('#lq-wc-pool');
    const feedbackEl     = container.querySelector('#lq-wc-feedback');
    const celebrationEl  = container.querySelector('#lq-wc-celebration');
    const celebMsgEl     = container.querySelector('#lq-wc-celebration-msg');
    const srEl           = container.querySelector('#lq-wc-sr');

    function _srAnnounce(msg) {
        srEl.textContent = '';
        requestAnimationFrame(() => { srEl.textContent = msg; });
    }

    // ── step renderer ─────────────────────────────────────────────────────────

    function _renderStep(idx, flashCorrect = false) {
        const step       = chain[idx];
        const word       = step.word.toLowerCase();
        const numBoxes   = _letterCount(word);

        wcs.stepIndex        = idx;
        wcs.boxContents      = Array(numBoxes).fill(null);
        wcs.clickSelectedTile = null;

        // Step label
        stepLabel.textContent = `Step ${idx + 1} of ${chain.length}`;

        // Audio prompt text
        promptText.textContent = step.audio_prompt || `Spell "${word}"`;

        // Feedback cleared
        feedbackEl.textContent = '';
        feedbackEl.className   = 'lq-wc-feedback';

        // Breadcrumb: render locked words (steps 0..idx-1)
        _renderBreadcrumb(idx);

        // Boxes
        _renderBoxes(numBoxes, flashCorrect);

        // Pool — fresh tiles each step
        _renderPool();

        // Auto-speak prompt
        if (state.ttsEnabled) {
            setTimeout(() => _safeSpeak(step.audio_prompt || `Spell ${word}`), 150);
        }

        _srAnnounce(`Step ${idx + 1} of ${chain.length}. ${step.audio_prompt || 'Spell ' + word}`);
    }

    function _renderBreadcrumb(upToStepExclusive) {
        breadcrumb.innerHTML = '';
        for (let i = 0; i < upToStepExclusive; i++) {
            const chip = document.createElement('div');
            chip.className = 'lq-wc-crumb';
            chip.textContent = chain[i].word.toUpperCase();
            chip.setAttribute('aria-label', `Completed: ${chain[i].word}`);
            breadcrumb.appendChild(chip);
            if (i < upToStepExclusive - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'lq-wc-crumb-arrow';
                arrow.setAttribute('aria-hidden', 'true');
                arrow.textContent = '→';
                breadcrumb.appendChild(arrow);
            }
        }
    }

    function _renderBoxes(numBoxes, flashCorrect = false) {
        boxesEl.innerHTML = '';
        // Center the boxes within the max-width row
        const boxCount = Math.max(numBoxes, 1);
        for (let i = 0; i < boxCount; i++) {
            const box = document.createElement('div');
            box.className = 'lq-wc-box';
            box.dataset.index = i;
            box.setAttribute('role', 'cell');
            box.setAttribute('aria-label', `Box ${i + 1}`);
            box.setAttribute('tabindex', '0');

            if (wcs.boxContents[i]) {
                box.textContent = wcs.boxContents[i];
                box.classList.add('lq-wc-box-filled');
            }
            if (flashCorrect) {
                box.classList.add('lq-wc-box-correct');
            }

            // Drop zone event listeners
            box.addEventListener('dragover',  _onBoxDragOver);
            box.addEventListener('dragleave', _onBoxDragLeave);
            box.addEventListener('drop',      _onBoxDrop);
            box.addEventListener('click',     _onBoxClick);
            box.addEventListener('keydown',   _onBoxKeydown);

            boxesEl.appendChild(box);
        }
    }

    function _renderPool() {
        poolEl.innerHTML = '';

        // Use the provided pool; show each letter once as a tile
        // (duplicates are intentional if the pool contains them)
        pool.forEach((letter, poolIdx) => {
            const tile = _makeTile(letter, poolIdx);
            poolEl.appendChild(tile);
        });
    }

    function _makeTile(letter, poolIdx) {
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = 'lq-wc-tile';
        tile.textContent = letter.toUpperCase();
        tile.dataset.letter = letter;
        tile.dataset.poolIdx = poolIdx;
        tile.setAttribute('draggable', 'true');
        tile.setAttribute('aria-label', `Letter tile ${letter.toUpperCase()}`);
        tile.setAttribute('tabindex', '0');

        tile.addEventListener('dragstart', _onTileDragStart);
        tile.addEventListener('dragend',   _onTileDragEnd);
        tile.addEventListener('click',     _onTileClick);
        tile.addEventListener('keydown',   _onTileKeydown);

        return tile;
    }

    // ── drag-and-drop ─────────────────────────────────────────────────────────

    function _onTileDragStart(e) {
        wcs.dragTile = { letter: this.dataset.letter, tileEl: this };
        this.classList.add('lq-wc-tile-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.letter);
    }

    function _onTileDragEnd() {
        this.classList.remove('lq-wc-tile-dragging');
        wcs.dragTile = null;
    }

    function _onBoxDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('lq-wc-box-hover');
    }

    function _onBoxDragLeave() {
        this.classList.remove('lq-wc-box-hover');
    }

    function _onBoxDrop(e) {
        e.preventDefault();
        this.classList.remove('lq-wc-box-hover');
        const letter = e.dataTransfer.getData('text/plain') || (wcs.dragTile && wcs.dragTile.letter);
        if (!letter) return;
        _placeLetterInBox(this, letter.toLowerCase());
    }

    // ── click-to-place ────────────────────────────────────────────────────────
    // Click a tile → it highlights; then click a box → letter placed.

    function _onTileClick(e) {
        e.stopPropagation();
        // Deselect any previous tile
        _clearTileSelection();
        wcs.clickSelectedTile = this;
        this.classList.add('lq-wc-tile-selected');
        this.setAttribute('aria-pressed', 'true');
        _srAnnounce(`Selected letter ${this.dataset.letter.toUpperCase()}. Now click a box to place it.`);
    }

    function _onBoxClick() {
        if (!wcs.clickSelectedTile) return;
        const letter = wcs.clickSelectedTile.dataset.letter.toLowerCase();
        _placeLetterInBox(this, letter);
        _clearTileSelection();
    }

    function _clearTileSelection() {
        if (wcs.clickSelectedTile) {
            wcs.clickSelectedTile.classList.remove('lq-wc-tile-selected');
            wcs.clickSelectedTile.setAttribute('aria-pressed', 'false');
            wcs.clickSelectedTile = null;
        }
    }

    // ── keyboard navigation ───────────────────────────────────────────────────

    function _onTileKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
        }
        // Arrow keys move focus to sibling tiles
        const tiles = Array.from(poolEl.querySelectorAll('.lq-wc-tile:not(:disabled)'));
        const idx   = tiles.indexOf(this);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            tiles[(idx + 1) % tiles.length]?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            tiles[(idx - 1 + tiles.length) % tiles.length]?.focus();
        }
        // Tab from last tile moves to first box
        if (e.key === 'Tab' && !e.shiftKey && idx === tiles.length - 1) {
            e.preventDefault();
            boxesEl.querySelector('.lq-wc-box')?.focus();
        }
    }

    function _onBoxKeydown(e) {
        const boxes = Array.from(boxesEl.querySelectorAll('.lq-wc-box'));
        const idx   = boxes.indexOf(this);

        if ((e.key === 'Enter' || e.key === ' ') && wcs.clickSelectedTile) {
            e.preventDefault();
            _onBoxClick.call(this);
        }
        // Arrow keys move focus between boxes
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            boxes[(idx + 1) % boxes.length]?.focus();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            boxes[(idx - 1 + boxes.length) % boxes.length]?.focus();
        }
        // Backspace removes letter from focused box
        if (e.key === 'Backspace') {
            e.preventDefault();
            _removeLetterFromBox(this);
        }
    }

    // ── place / remove letter ─────────────────────────────────────────────────

    function _placeLetterInBox(boxEl, letter) {
        const boxIdx = parseInt(boxEl.dataset.index, 10);

        // If box is already filled, swap back the old letter to pool (visually no-op
        // since the pool always shows all available tiles; just update state)
        wcs.boxContents[boxIdx] = letter;

        // Update box display
        boxEl.textContent = letter.toUpperCase();
        boxEl.classList.add('lq-wc-box-filled');
        boxEl.classList.remove('lq-wc-box-wrong');
        boxEl.setAttribute('aria-label', `Box ${boxIdx + 1}: ${letter.toUpperCase()}`);

        // Clear feedback when student is actively filling
        feedbackEl.textContent = '';
        feedbackEl.className = 'lq-wc-feedback';

        // Auto-check when all boxes are filled
        const currentWord = chain[wcs.stepIndex].word.toLowerCase();
        if (wcs.boxContents.every(c => c !== null) &&
                wcs.boxContents.length === currentWord.length) {
            _checkCurrentWord();
        }
    }

    function _removeLetterFromBox(boxEl) {
        const boxIdx = parseInt(boxEl.dataset.index, 10);
        if (wcs.boxContents[boxIdx] === null) return;
        wcs.boxContents[boxIdx] = null;
        boxEl.textContent = '';
        boxEl.classList.remove('lq-wc-box-filled', 'lq-wc-box-wrong', 'lq-wc-box-correct');
        boxEl.setAttribute('aria-label', `Box ${boxIdx + 1}`);
        feedbackEl.textContent = '';
    }

    // ── word check ────────────────────────────────────────────────────────────

    function _checkCurrentWord() {
        const currentWord = chain[wcs.stepIndex].word.toLowerCase();
        const spelled     = wcs.boxContents.join('').toLowerCase();

        if (spelled === currentWord) {
            _onStepCorrect(currentWord);
        } else {
            _onStepWrong();
        }
    }

    function _onStepCorrect(word) {
        // Flash boxes green
        const boxes = Array.from(boxesEl.querySelectorAll('.lq-wc-box'));
        boxes.forEach(b => b.classList.add('lq-wc-box-correct'));

        feedbackEl.textContent = 'Correct! ✓';
        feedbackEl.className   = 'lq-wc-feedback lq-wc-feedback-correct';
        _srAnnounce(`Correct! ${word}`);
        _safeSpeak('Correct!');

        const nextIdx = wcs.stepIndex + 1;

        setTimeout(() => {
            if (nextIdx < chain.length) {
                _renderStep(nextIdx);
            } else {
                _onChainComplete();
            }
        }, 700);
    }

    function _onStepWrong() {
        // Red flash on boxes
        const boxes = Array.from(boxesEl.querySelectorAll('.lq-wc-box'));
        boxes.forEach(b => b.classList.add('lq-wc-box-wrong'));
        feedbackEl.textContent = 'Not quite — try again!';
        feedbackEl.className   = 'lq-wc-feedback lq-wc-feedback-wrong';
        _srAnnounce('Not quite. Try again.');

        // Record first-attempt miss
        isFirstAttempt() && markFirstAttempt(false);

        // Clear boxes after brief pause so student can retry
        setTimeout(() => {
            wcs.boxContents.fill(null);
            const redrawnBoxes = Array.from(boxesEl.querySelectorAll('.lq-wc-box'));
            redrawnBoxes.forEach(b => {
                b.textContent = '';
                b.classList.remove('lq-wc-box-filled', 'lq-wc-box-wrong', 'lq-wc-box-correct');
                const bIdx = parseInt(b.dataset.index, 10);
                b.setAttribute('aria-label', `Box ${bIdx + 1}`);
            });
            feedbackEl.textContent = '';
            feedbackEl.className = 'lq-wc-feedback';
        }, 900);
    }

    // ── chain completion ──────────────────────────────────────────────────────

    function _onChainComplete() {
        if (wcs.doneFired) return;
        wcs.doneFired = true;

        markFirstAttempt(true);

        // Render all crumbs
        _renderBreadcrumb(chain.length);

        const fullChain = chain.map(s => s.word).join(' → ');
        celebMsgEl.textContent = `You spelled the whole chain! ${fullChain}`;
        celebrationEl.hidden   = false;
        _safeSpeak('You completed the chain! Amazing!');

        // Store result for checkWordChain
        container._wordChainResult = {
            correct:  true,
            submitted: fullChain,
            feedback: 'You completed the chain!',
        };
    }

    // ── audio button ──────────────────────────────────────────────────────────

    audioBtn.addEventListener('click', () => {
        const step = chain[wcs.stepIndex];
        _safeSpeak(step.audio_prompt || `Spell ${step.word}`);
    });

    // ── init first step ───────────────────────────────────────────────────────

    _renderStep(0);
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkWordChain(q, container) {
    if (!container) return { correct: false, submitted: null, feedback: 'No container.' };

    if (container._wordChainResult) {
        return container._wordChainResult;
    }

    // Chain not completed yet — return incomplete
    const wcs = container._wordChainState;
    const stepIdx = wcs ? wcs.stepIndex : 0;
    return {
        correct:   false,
        submitted: null,
        feedback:  `Chain not complete — on step ${stepIdx + 1} of ${(q.chain || []).length}.`,
    };
}

// ─── scoped inline styles ────────────────────────────────────────────────────

let _stylesInjected = false;

function _injectStyles() {
    if (_stylesInjected) return;
    _stylesInjected = true;

    const css = `
/* word-chain widget */
.lq-wc-card {
    position: relative;
    max-width: 700px;
    margin: 0 auto;
    padding: 0 8px 24px;
    font-family: Arial, sans-serif;
    box-sizing: border-box;
}
.lq-wc-header {
    text-align: center;
    margin-bottom: 8px;
}
.lq-wc-step-label {
    font-size: 0.9rem;
    font-weight: 700;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}
/* breadcrumb */
.lq-wc-breadcrumb {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    justify-content: center;
    min-height: 36px;
    margin-bottom: 12px;
}
.lq-wc-crumb {
    background: #e8f5e9;
    border: 2px solid #4caf50;
    color: #2e7d32;
    border-radius: 8px;
    padding: 4px 12px;
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.08em;
}
.lq-wc-crumb-arrow {
    color: #999;
    font-size: 1.1rem;
}
/* audio prompt */
.lq-wc-prompt-row {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
}
.lq-wc-audio-btn {
    background: #e65100;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 90%;
    text-align: left;
    line-height: 1.4;
}
.lq-wc-audio-btn:hover { background: #bf360c; }
/* Elkonin boxes */
.lq-wc-boxes-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}
.lq-wc-boxes {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
}
.lq-wc-box {
    width: 60px;
    height: 60px;
    border: 2px dashed #999;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    font-weight: 700;
    cursor: pointer;
    background: #fafafa;
    transition: border-color 0.15s, background 0.15s, transform 0.1s;
    outline: none;
    color: #1a237e;
}
.lq-wc-box:focus {
    border-color: #1565c0;
    box-shadow: 0 0 0 3px rgba(21,101,192,0.3);
}
.lq-wc-box-hover {
    border-color: #1565c0;
    background: #e3f2fd;
    transform: scale(1.05);
}
.lq-wc-box-filled {
    border-style: solid;
    border-color: #1565c0;
    background: #e8eaf6;
}
@keyframes lq-wc-flash-green {
    0%   { background: #c8e6c9; border-color: #4caf50; }
    100% { background: #e8f5e9; border-color: #4caf50; }
}
.lq-wc-box-correct {
    border-color: #4caf50 !important;
    background: #e8f5e9 !important;
    animation: lq-wc-flash-green 0.4s ease-in-out;
    color: #2e7d32;
}
@keyframes lq-wc-flash-red {
    0%   { background: #ffcdd2; border-color: #e53935; }
    100% { background: #fafafa; border-color: #999; }
}
.lq-wc-box-wrong {
    border-color: #e53935 !important;
    background: #ffebee !important;
    animation: lq-wc-flash-red 0.5s ease-in-out;
    color: #c62828;
}
/* letter tile pool */
.lq-wc-pool-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
}
.lq-wc-pool {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    max-width: 560px;
}
.lq-wc-tile {
    width: 50px;
    height: 50px;
    border: 2px solid #1565c0;
    border-radius: 8px;
    background: #fff;
    color: #1565c0;
    font-size: 1.3rem;
    font-weight: 700;
    cursor: grab;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.12s, transform 0.1s, box-shadow 0.1s;
    outline: none;
    touch-action: none;
}
.lq-wc-tile:focus {
    box-shadow: 0 0 0 3px rgba(21,101,192,0.35);
}
.lq-wc-tile:hover:not(:disabled) {
    background: #e3f2fd;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(21,101,192,0.2);
}
.lq-wc-tile-dragging {
    opacity: 0.5;
    cursor: grabbing;
}
.lq-wc-tile-selected {
    background: #1565c0;
    color: #fff;
    box-shadow: 0 4px 12px rgba(21,101,192,0.45);
    transform: translateY(-3px);
}
.lq-wc-tile:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    border-color: #ccc;
    color: #aaa;
}
/* feedback */
.lq-wc-feedback {
    min-height: 1.6em;
    text-align: center;
    font-size: 1.05rem;
    font-weight: 600;
    margin-bottom: 8px;
}
.lq-wc-feedback-correct { color: #2e7d32; }
.lq-wc-feedback-wrong   { color: #c62828; }
/* celebration overlay */
.lq-wc-celebration {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    z-index: 100;
}
.lq-wc-celebration[hidden] { display: none; }
.lq-wc-celebration-box {
    background: #fff;
    border-radius: 16px;
    padding: 32px 36px;
    max-width: 380px;
    text-align: center;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
}
.lq-wc-celebration-emoji { font-size: 3rem; margin-bottom: 12px; }
.lq-wc-celebration-msg {
    font-size: 1.15rem;
    font-weight: 700;
    color: #1b5e20;
    line-height: 1.5;
}
`;

    const style = document.createElement('style');
    style.id = 'lq-wc-styles';
    style.textContent = css;
    document.head.appendChild(style);
}
