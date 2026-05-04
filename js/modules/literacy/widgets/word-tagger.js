// word-tagger.js — Color-coded part-of-speech labeling widget (Image 4, "Grammar Detective").
//
// Question contract:
//   q.sentence:        string          — e.g., "The big cat sleeps quietly."
//   q.tokens:          [{ id, word, correct_category: string }]
//                      pre-tokenized; one entry per word; id must be unique
//   q.categories:      [{ id, label, color }]
//                      e.g., [{ id:'noun', label:'Noun', color:'#1e88e5' }, ...]
//   q.task_text?:      string          — default "Tag each word."
//   q.k2_appropriate?: boolean         — simplify to 2 categories, larger tiles
//
// Interaction:
//   1. Click a category button → it becomes the active category.
//   2. Click a token → token gets the active category's color.
//   3. Click a token with the same active category → un-tags it.
//   4. All tokens tagged → auto-check fires.
//
// Exports:
//   renderWordTagger(q, container)
//   checkWordTagger(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _safeSpeak(text) {
    if (state.ttsEnabled && typeof window.speakAnswerOption === 'function') {
        window.speakAnswerOption(String(text));
    }
}

// Compute a readable contrasting text color for a given hex background.
function _contrastColor(hex) {
    // Parse hex (#rrggbb or #rgb)
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const r = parseInt(h.substring(0,2), 16);
    const g = parseInt(h.substring(2,4), 16);
    const b = parseInt(h.substring(4,6), 16);
    // Relative luminance (WCAG formula)
    const lum = 0.2126*r/255 + 0.7152*g/255 + 0.0722*b/255;
    return lum > 0.45 ? '#1a1a1a' : '#ffffff';
}

// Build a CSS color that is 60% lighter (for border/glow) than the given color.
function _lightenHex(hex, amount) {
    let h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    const r = Math.min(255, parseInt(h.substring(0,2), 16) + amount);
    const g = Math.min(255, parseInt(h.substring(2,4), 16) + amount);
    const b = Math.min(255, parseInt(h.substring(4,6), 16) + amount);
    return `rgb(${r},${g},${b})`;
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderWordTagger(q, container) {
    if (!container || !q) return;

    const tokens     = Array.isArray(q.tokens)     ? q.tokens     : [];
    const categories = Array.isArray(q.categories) ? q.categories : [];
    const taskText   = q.task_text || 'Tag each word with its part of speech.';
    const isK2       = !!q.k2_appropriate;

    if (!tokens.length || !categories.length) {
        container.innerHTML = '<p class="lq-widget-error">word-tagger: missing tokens or categories.</p>';
        return;
    }

    // ── token spans ──────────────────────────────────────────────────────────
    const tokensHtml = tokens.map(tok => {
        const word = _esc(tok.word || tok.id || '?');
        return `<span
            class="lq-wt-token${isK2 ? ' lq-wt-token--k2' : ''}"
            role="button"
            tabindex="0"
            data-token-id="${_esc(tok.id)}"
            aria-pressed="false"
            aria-label="${word}, untagged"
            >${word}</span>`;
    }).join(' '); // non-breaking space between tokens

    // ── category buttons ─────────────────────────────────────────────────────
    const catHtml = categories.map(cat => {
        const txtColor = _contrastColor(cat.color || '#888888');
        return `<button
            type="button"
            class="lq-wt-cat-btn${isK2 ? ' lq-wt-cat-btn--k2' : ''}"
            data-cat-id="${_esc(cat.id)}"
            aria-pressed="false"
            style="background:${_esc(cat.color || '#888')};color:${txtColor};border:2px solid transparent;"
            >${_esc(cat.label || cat.id)}</button>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-wt-host${isK2 ? ' lq-wt-host--k2' : ''}"
             role="application"
             aria-label="Grammar Detective — tag each word">

            <p class="lq-wt-task-text">${_esc(taskText)}</p>

            <div class="lq-wt-sentence-area" aria-label="Sentence to tag">
                ${tokensHtml}
            </div>

            <div class="lq-wt-cat-row" role="group" aria-label="Part of speech categories">
                ${catHtml}
            </div>

            <div class="lq-wt-score-bar" aria-live="polite" aria-atomic="true"></div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>

            <div class="lq-wt-legend" aria-label="Color legend">
                ${categories.map(cat => {
                    const txtColor = _contrastColor(cat.color || '#888');
                    return `<span class="lq-wt-legend-chip"
                        style="background:${_esc(cat.color || '#888')};color:${txtColor};">
                        ${_esc(cat.label || cat.id)}
                    </span>`;
                }).join('')}
            </div>
        </div>`;

    _attachInteraction(q, container, tokens, categories, isK2);

    // K-2: auto-speak task
    if (isK2 && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }
}

// ─── interaction ──────────────────────────────────────────────────────────────

function _attachInteraction(q, container, tokens, categories, isK2) {
    const host        = container.querySelector('.lq-wt-host');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const scoreBar     = host.querySelector('.lq-wt-score-bar');

    if (!host) return;

    // Build category map for fast lookups
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c; });

    // Build correct-answer map: token id → correct_category id
    const correctMap = {};
    tokens.forEach(tok => { correctMap[tok.id] = tok.correct_category; });

    // Mutable per-instance state
    let activeCatId = null;    // currently selected category button id
    let tagState = {};         // tokenId → categoryId (or null)
    let locked = false;        // true after all correct on final submit

    // ── helpers ──────────────────────────────────────────────────────────────

    function getTokenEl(tokenId) {
        return host.querySelector(`.lq-wt-token[data-token-id="${CSS.escape(tokenId)}"]`);
    }

    function getCatBtn(catId) {
        return host.querySelector(`.lq-wt-cat-btn[data-cat-id="${CSS.escape(catId)}"]`);
    }

    function applyTokenColor(tokenId, catId) {
        const el = getTokenEl(tokenId);
        if (!el) return;
        if (catId) {
            const cat = catMap[catId];
            const bg  = (cat && cat.color) ? cat.color : '#888';
            const fg  = _contrastColor(bg);
            el.style.background   = bg;
            el.style.color        = fg;
            el.style.borderColor  = _lightenHex(bg, 40);
            el.setAttribute('aria-label', `${el.textContent.trim()}, tagged as ${cat ? cat.label : catId}`);
            el.setAttribute('aria-pressed', 'true');
            el.classList.add('lq-wt-token--tagged');
        } else {
            el.style.background  = '';
            el.style.color       = '';
            el.style.borderColor = '';
            el.setAttribute('aria-label', `${el.textContent.trim()}, untagged`);
            el.setAttribute('aria-pressed', 'false');
            el.classList.remove('lq-wt-token--tagged');
        }
    }

    function setActiveCategory(catId) {
        // Deselect old
        if (activeCatId) {
            const old = getCatBtn(activeCatId);
            if (old) {
                old.setAttribute('aria-pressed', 'false');
                old.style.outline = '';
                old.classList.remove('lq-wt-cat-btn--active');
            }
        }
        activeCatId = catId;
        if (catId) {
            const btn = getCatBtn(catId);
            if (btn) {
                btn.setAttribute('aria-pressed', 'true');
                btn.style.outline = '3px solid #333';
                btn.classList.add('lq-wt-cat-btn--active');
            }
            _safeSpeak((catMap[catId] && catMap[catId].label) || catId);
        }
    }

    function countTagged() {
        return Object.values(tagState).filter(v => v != null).length;
    }

    function updateScoreBar() {
        const tagged = countTagged();
        const total  = tokens.length;
        scoreBar.textContent = `Tagged: ${tagged} / ${total}`;
    }

    function runCheck() {
        if (locked) return;

        const firstAttempt = isFirstAttempt();
        let correctCount = 0;
        const wrongIds = [];

        tokens.forEach(tok => {
            const el = getTokenEl(tok.id);
            if (!el) return;
            const assigned = tagState[tok.id];
            if (assigned === tok.correct_category) {
                correctCount++;
                el.classList.add('lq-wt-token--correct');
                el.classList.remove('lq-wt-token--wrong');
                el.dataset.locked = '1';
            } else {
                wrongIds.push(tok.id);
                el.classList.add('lq-wt-token--wrong', 'lq-wrong-persistent');
                el.classList.remove('lq-wt-token--correct');
            }
        });

        const allCorrect = wrongIds.length === 0;
        markFirstAttempt(allCorrect);

        scoreBar.textContent = `Score: ${correctCount} / ${tokens.length} tagged correctly`;

        if (allCorrect) {
            feedbackZone.textContent = 'All words tagged correctly!';
            locked = true;
            // Lock all category buttons
            host.querySelectorAll('.lq-wt-cat-btn').forEach(b => {
                b.disabled = true;
                b.setAttribute('aria-disabled', 'true');
            });
            container._lqLastResult = { correct: true, submitted: { ...tagState }, firstAttempt };
        } else {
            feedbackZone.textContent = `${wrongIds.length} word${wrongIds.length === 1 ? '' : 's'} tagged incorrectly — fix and try again.`;
            // Revert wrong tokens to untagged
            wrongIds.forEach(id => {
                tagState[id] = null;
                applyTokenColor(id, null);
                const el = getTokenEl(id);
                if (el) {
                    // Flash wrong, then clear after brief delay
                    setTimeout(() => {
                        if (el) el.classList.remove('lq-wrong-persistent');
                    }, 1800);
                }
            });
            container._lqLastResult = { correct: false, submitted: { ...tagState }, firstAttempt };
        }
    }

    // ── click delegation ──────────────────────────────────────────────────────

    host.addEventListener('click', e => {
        if (locked) return;

        // Category button click
        const catBtn = e.target.closest('.lq-wt-cat-btn');
        if (catBtn && host.contains(catBtn)) {
            const catId = catBtn.dataset.catId;
            if (activeCatId === catId) {
                setActiveCategory(null); // deselect same
            } else {
                setActiveCategory(catId);
            }
            return;
        }

        // Token click
        const tokenEl = e.target.closest('.lq-wt-token');
        if (tokenEl && host.contains(tokenEl)) {
            if (tokenEl.dataset.locked === '1') return;

            const tokenId = tokenEl.dataset.tokenId;
            if (!activeCatId) {
                feedbackZone.textContent = 'Select a category first, then tap a word.';
                return;
            }

            // Toggle: if already tagged with active category → un-tag
            if (tagState[tokenId] === activeCatId) {
                tagState[tokenId] = null;
                applyTokenColor(tokenId, null);
            } else {
                tagState[tokenId] = activeCatId;
                applyTokenColor(tokenId, activeCatId);
                // Announce
                const catLabel = (catMap[activeCatId] && catMap[activeCatId].label) || activeCatId;
                const word     = tokenEl.textContent.trim();
                const liveEl   = host.querySelector('.lq-wt-score-bar');
                if (liveEl) liveEl.textContent = `${word} tagged as ${catLabel}`;
            }

            updateScoreBar();
            feedbackZone.textContent = '';

            // Auto-check when all tokens are tagged
            if (countTagged() === tokens.length) {
                // Brief pause so student sees all tokens colored
                setTimeout(runCheck, 400);
            }
        }
    });

    // ── keyboard support ──────────────────────────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;

        const catBtn  = e.target.closest('.lq-wt-cat-btn');
        const tokenEl = e.target.closest('.lq-wt-token');

        if (catBtn || tokenEl) {
            e.preventDefault();
            (catBtn || tokenEl).click();
        }
    });

    // Initialize tag state
    tokens.forEach(tok => { tagState[tok.id] = null; });
    updateScoreBar();
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkWordTagger(q, container) {
    if (!container) return { correct: false, submitted: {} };

    if (container._lqLastResult) return container._lqLastResult;

    // Derive from DOM
    const host = container.querySelector('.lq-wt-host');
    if (!host) return { correct: false, submitted: {} };

    const tokens     = Array.isArray(q.tokens) ? q.tokens : [];
    const submitted  = {};
    tokens.forEach(tok => {
        const el = host.querySelector(`.lq-wt-token[data-token-id="${CSS.escape(tok.id)}"]`);
        if (el && el.classList.contains('lq-wt-token--correct')) {
            submitted[tok.id] = tok.correct_category;
        } else {
            submitted[tok.id] = null;
        }
    });

    const correct = tokens.every(tok => submitted[tok.id] === tok.correct_category);
    return { correct, submitted };
}
