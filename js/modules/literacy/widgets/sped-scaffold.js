// sped-scaffold.js — SPED differentiation layer for Literacy Quest items.
//
// Exports a single function:
//   applySpedScaffold(q, container)
//
// When state.literacySpedScaffold === true, this function:
//   1. Sets state.spedSessionCap = 8 (consumed by literacy-game-control)
//   2. Enables 3-attempt corrective feedback override
//   3. Doubles the response-time window
//   4. Auto-renders Elkonin sound boxes for phonics items
//   5. Shows a 3-second multisensory warm-up overlay before each phonics card

import { state } from '../../state.js';

// ─── Phonics skill ID prefix list ─────────────────────────────────────────────
// Any skill whose ID starts with one of these tokens is treated as a phonics
// item and gets the sound-box / warm-up treatment.
const PHONICS_PREFIXES = [
    'phonics_',
    'phonemic_',
    'reading_phonics_',
    'reading_phonemic_',
    'reading_pa_',
];

function _isPhonicsSkill(skillId) {
    if (!skillId) return false;
    const id = String(skillId).toLowerCase();
    return PHONICS_PREFIXES.some(p => id.startsWith(p));
}

// ─── Sound-box lazy loader ────────────────────────────────────────────────────
// Dynamically imports sound-box.js so this module never hard-depends on it
// (sped-scaffold is used even when sound-box hasn't rendered yet).

async function _tryRenderSoundBox(q, container) {
    try {
        const { renderSoundBox } = await import('./sound-box.js');
        // Only inject if no sound-box is already present.
        if (!container.querySelector('.lq-sound-box-wrapper')) {
            const sbTarget = document.createElement('div');
            sbTarget.className = 'lq-sped-soundbox-inject';
            container.appendChild(sbTarget);
            renderSoundBox(q, sbTarget);
        }
    } catch (err) {
        // sound-box.js unavailable in current phase — silently skip.
        console.warn('[sped-scaffold] sound-box.js not available:', err.message);
    }
}

// ─── Warm-up overlay ──────────────────────────────────────────────────────────

/**
 * Shows a 3-second "trace – say – write" multisensory warm-up overlay.
 * Resolves after the overlay auto-dismisses or the student taps it.
 *
 * @param {string} targetWord — the word to trace/say/write
 * @returns {Promise<void>}
 */
function _showWarmUpOverlay(targetWord) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'lq-sped-warmup-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-live', 'polite');
        overlay.setAttribute('aria-label', 'Multisensory warm-up');

        const steps = ['Trace it', 'Say it', 'Write it'];
        let step = 0;
        const STEP_MS = 900;  // 3 steps × 900 ms ≈ 2.7 s + fade

        overlay.innerHTML = `
          <div class="lq-sped-warmup-card">
            <p class="lq-sped-warmup-word">${_esc(targetWord)}</p>
            <p class="lq-sped-warmup-step" id="lqWarmupStep">${steps[0]}</p>
            <div class="lq-sped-warmup-bar">
              <div class="lq-sped-warmup-bar-fill" id="lqWarmupBar"></div>
            </div>
            <button class="lq-sped-warmup-skip" aria-label="Skip warm-up">Skip</button>
          </div>
        `;

        document.body.appendChild(overlay);

        // Trigger entrance animation after paint.
        requestAnimationFrame(() => overlay.classList.add('lq-sped-warmup-visible'));

        const stepEl = overlay.querySelector('#lqWarmupStep');
        const barEl  = overlay.querySelector('#lqWarmupBar');
        const skipBtn = overlay.querySelector('.lq-sped-warmup-skip');

        function _dismiss() {
            clearInterval(ticker);
            overlay.classList.remove('lq-sped-warmup-visible');
            overlay.classList.add('lq-sped-warmup-exit');
            setTimeout(() => {
                overlay.remove();
                resolve();
            }, 250);
        }

        skipBtn.addEventListener('click', _dismiss);

        const ticker = setInterval(() => {
            step += 1;
            if (step >= steps.length) {
                _dismiss();
                return;
            }
            if (stepEl) stepEl.textContent = steps[step];
            // Advance progress bar.
            if (barEl) barEl.style.width = ((step / steps.length) * 100) + '%';
        }, STEP_MS);
    });
}

function _esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Applies SPED scaffold layer to a rendered literacy item.
 *
 * @param {object} q          — question object from the literacy generator
 * @param {HTMLElement} container — the DOM node containing the rendered item
 * @returns {Promise<void>}   — resolves after any async overlays complete
 */
export async function applySpedScaffold(q, container) {
    if (!state.literacySpedScaffold) return;

    // 1. Session cap — consumed by literacy-game-control.js.
    state.spedSessionCap = 8;

    // 2. Attempt override: allow 3 wrong answers before auto-advance.
    //    literacy-game-control reads state.spedMaxAttempts.
    state.spedMaxAttempts = 3;

    // 3. Double response time — literacy-game-control reads state.spedTimerMultiplier.
    state.spedTimerMultiplier = 2;

    // 4 & 5. Phonics-specific: warm-up overlay + Elkonin boxes.
    if (_isPhonicsSkill(q.skill_id)) {
        const targetWord = q.word || q.target_word || (q.stem ? q.stem.split(' ')[0] : null);

        // 5. Multisensory warm-up overlay (3-second animation).
        if (targetWord) {
            await _showWarmUpOverlay(targetWord);
        }

        // 4. Elkonin sound boxes — delegate to sound-box.js widget.
        if (targetWord && q.phoneme_count) {
            await _tryRenderSoundBox(q, container);
        } else if (targetWord) {
            // Build a minimal proxy question if the generator didn't include phoneme_count.
            const proxyQ = {
                word: targetWord,
                phoneme_count: q.phoneme_count || targetWord.length,
                task: 'segment_to_chips',
                k2_appropriate: true,
                ...q,
            };
            await _tryRenderSoundBox(proxyQ, container);
        }
    }
}
