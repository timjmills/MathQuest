// literacy-game-control.js — Minimal practice-session loop for Literacy Quest.
//
// Phase 2 vertical slice: wraps the generator dispatcher into a 10-card
// session that reuses Math Quest's `gameView` DOM container.
//
// Integration note (DO NOT modify answer-check.js directly):
// ----------------------------------------------------------
//   answer-check.js's submitAnswer() should check state.subject before
//   calling the math check pipeline. The preferred hook point is:
//
//     if (state.subject !== 'math' && typeof window.checkLiteracyAnswer === 'function') {
//       const result = window.checkLiteracyAnswer(state.currentQ, container);
//       // handle result ...
//       return;
//     }
//
//   This file exposes window.checkLiteracyAnswer for that glue. The actual
//   wiring into answer-check.js is deferred to Phase 2 Stage 2 integration.
//
// Exports:
//   startLiteracyPractice(skillId, options) — build a 10-card deck and show card 1
//   nextLiteracyQuestion()                  — advance to the next card
//   checkLiteracyAnswer(q, container)       — proxy to literacy-question-render.js

import { state } from '../state.js';
import { showView } from '../navigation.js';
import { SKILLS_BY_ID } from '../../../data/literacy-skills/index.js';
import { renderLiteracyQuestion, checkLiteracyAnswer as _checkLiteracyAnswer }
    from './literacy-question-render.js';
import { generatePhonicsQuestion, buildPhonicsDeck } from './gen-phonics.js';
import { generateMechanicsQuestion, buildMechanicsDeck } from './gen-mechanics.js';
import { generateFluencyQuestion, buildFluencyDeck } from './gen-fluency.js';
import { generatePhonemicAwarenessQuestion, buildPhonemicAwarenessDeck } from './gen-phonemic-awareness.js';
import { generateComprehensionQuestion, buildComprehensionDeck } from './gen-comprehension.js';
import { generateSentenceStructureQuestion, buildSentenceStructureDeck } from './gen-sentence-structure.js';
import { generateVocabularyQuestion, buildVocabularyDeck } from './gen-vocabulary.js';
import { generateGrammarQuestion, buildGrammarDeck } from './gen-grammar.js';

// ─── Constants ─────────────────────────────────────────────────────────────────

const DEFAULT_DECK_SIZE = 10;

// Maps strand name to the deck-builder function.
// Phase 2 will add generators for all 10 strands.
const DECK_BUILDERS = {
    'phonics':             buildPhonicsDeck,
    'mechanics':           buildMechanicsDeck,
    'fluency':             buildFluencyDeck,
    'phonemic_awareness':  buildPhonemicAwarenessDeck,
    'comprehension_lit':   buildComprehensionDeck,
    'comprehension_info':  buildComprehensionDeck,
    'sentence_structure':  buildSentenceStructureDeck,
    'vocabulary':          buildVocabularyDeck,
    'grammar':             buildGrammarDeck,
};

// Generator (single-question) fallback per strand.
const SINGLE_GENERATORS = {
    'phonics':            generatePhonicsQuestion,
    'mechanics':          generateMechanicsQuestion,
    'fluency':            generateFluencyQuestion,
    'phonemic_awareness': generatePhonemicAwarenessQuestion,
    'comprehension_lit':  generateComprehensionQuestion,
    'comprehension_info': generateComprehensionQuestion,
    'sentence_structure': generateSentenceStructureQuestion,
    'vocabulary':         generateVocabularyQuestion,
    'grammar':            generateGrammarQuestion,
};

// ─── Session state ─────────────────────────────────────────────────────────────
//
// Stored on state.literacySession so it survives across call boundaries.
// Separate from state.currentQ which Math Quest uses.

function _initLiteracySession(skillAtom, deck) {
    state.literacySession = {
        skillAtom,
        deck,
        index: 0,
        score: 0,
        total: deck.length,
        startTime: Date.now(),
    };
    // Also surface the first question as state.currentQ so the retry helpers work.
    state.currentQ = deck[0] || null;
    state.qCount = 0;
    state.score = 0;
}

// ─── Deck builder ──────────────────────────────────────────────────────────────

/**
 * Build an ordered deck for `skillAtom`, rotating mechanics per the Variety Rule.
 *
 * @param {import('../../../data/literacy-skills/index').SkillAtom} skillAtom
 * @param {number} count
 * @param {object} options
 * @returns {import('../../../docs/literacy-quest/DATA_MODEL').Question[]}
 */
function _buildDeck(skillAtom, count, options) {
    const builder = DECK_BUILDERS[skillAtom.strand];
    if (builder) return builder(skillAtom, count, options);

    // Generic fallback: repeat a single-question generator
    const gen = SINGLE_GENERATORS[skillAtom.strand]
        || ((atom, _, opts) => _fallbackQuestion(atom, opts));

    const deck = [];
    const available = skillAtom.question_types || ['mc-text'];
    const window3 = [];

    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = pool[Math.floor(Math.random() * pool.length)];
        deck.push(gen(skillAtom, mechanic, options));
        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }
    return deck;
}

function _fallbackQuestion(skillAtom) {
    return {
        id: `${skillAtom.skill_id}_fallback_${Date.now()}`,
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        stem: `[${skillAtom.skill_statement}] — generator not yet implemented.`,
        options: [
            { id: 'a', label: 'Coming soon', correct: true },
        ],
        ans: 'a',
        correct_answer: 'a',
        distractor_misconceptions: {},
        hints: [],
        rit_difficulty: 150,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: false,
        k2_appropriate: false,
    };
}

// ─── DOM helpers ───────────────────────────────────────────────────────────────

/**
 * Find or create the container inside gameView where literacy questions render.
 * Reuses the existing questionCard element (Math Quest's game card area) so the
 * standard XP banner, timer, and score chrome are preserved.
 *
 * @returns {HTMLElement|null}
 */
function _getOrCreateLiteracyContainer() {
    // Prefer an explicit literacy container if index.html has one
    let container = document.getElementById('literacyQuestionContainer');
    if (container) return container;

    // Fall back to Math Quest's questionCard
    container = document.getElementById('questionCard');
    if (container) return container;

    // Last resort: create a temporary container in gameView
    const gameView = document.getElementById('gameView');
    if (!gameView) return null;
    container = document.createElement('div');
    container.id = 'literacyQuestionContainer';
    gameView.appendChild(container);
    return container;
}

/**
 * Update the visible card counter (e.g., "Card 3 of 10").
 */
function _updateCardCounter() {
    const session = state.literacySession;
    if (!session) return;
    const el = document.getElementById('questionCounter')
        || document.getElementById('qCounter');
    if (el) {
        el.textContent = `Card ${session.index + 1} of ${session.total}`;
    }
}

/**
 * Show a minimal end-of-session summary inside the game view.
 */
function _showEndSession() {
    const session = state.literacySession;
    if (!session) return;

    const container = _getOrCreateLiteracyContainer();
    if (!container) return;

    const pct = session.total > 0
        ? Math.round((session.score / session.total) * 100)
        : 0;

    container.innerHTML = `
        <div class="lq-session-end">
            <h2>Session Complete!</h2>
            <p class="lq-session-score">${session.score} / ${session.total} correct (${pct}%)</p>
            <p class="lq-session-skill">${session.skillAtom.skill_statement}</p>
            <button type="button" class="primary-btn"
                    onclick="if(typeof goHome==='function') goHome();">
                Back to Home
            </button>
        </div>`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Start a literacy practice session.
 *
 * @param {string} skillId   — SkillAtom.skill_id from SKILLS_BY_ID
 * @param {{ count?: number, rng?: () => number, ellMode?: boolean, spedMode?: boolean }} [options]
 */
export function startLiteracyPractice(skillId, options = {}) {
    const skillAtom = SKILLS_BY_ID[skillId];
    if (!skillAtom) {
        console.error(`[LiteracyQuest] Unknown skill_id: "${skillId}"`);
        return;
    }

    // Set subject discriminator so other modules know we're in literacy mode
    state.subject = skillAtom.subject || 'reading';

    // Apply ELL/SPED scaffolds from options
    if (options.ellMode != null)  state.literacyEllScaffold  = !!options.ellMode;
    if (options.spedMode != null) state.literacySpedScaffold = !!options.spedMode;

    const count = (typeof options.count === 'number' && options.count > 0)
        ? options.count
        : DEFAULT_DECK_SIZE;

    const deck = _buildDeck(skillAtom, count, options);

    // UX short-circuit: if every card in the deck is a coming-soon sentinel,
    // skip the 10-placeholder loop and show a single coming-soon card instead.
    const allComingSoon = deck.length > 0 &&
        deck.every(q => q.question_type === '__coming_soon__');

    if (allComingSoon) {
        // Show game view so the card has somewhere to live, then render once.
        if (typeof showView === 'function') showView('gameView');
        const container = _getOrCreateLiteracyContainer();
        if (container) {
            import('./coming-soon.js').then(m => {
                m.renderComingSoonCard(skillAtom, container);
            });
        }
        return;
    }

    _initLiteracySession(skillAtom, deck);

    // Show the game view
    if (typeof showView === 'function') {
        showView('gameView');
    }

    // Render the first question
    const container = _getOrCreateLiteracyContainer();
    if (container && deck.length > 0) {
        _updateCardCounter();
        renderLiteracyQuestion(deck[0], container);
    }
}

/**
 * Advance to the next card in the session deck.
 * Called after an answer has been confirmed correct (or skipped).
 */
export function nextLiteracyQuestion() {
    const session = state.literacySession;
    if (!session) return;

    session.index++;
    state.qCount = session.index;

    if (session.index >= session.total) {
        _showEndSession();
        return;
    }

    const nextQ = session.deck[session.index];
    state.currentQ = nextQ;

    const container = _getOrCreateLiteracyContainer();
    if (container) {
        _updateCardCounter();
        renderLiteracyQuestion(nextQ, container);
    }
}

/**
 * Record whether the current question was answered correctly and advance.
 * This is the bridge between the answer-check layer and the session loop.
 *
 * @param {boolean} isCorrect
 */
export function recordLiteracyAnswer(isCorrect) {
    const session = state.literacySession;
    if (!session) return;

    if (isCorrect) session.score++;
    state.score = session.score;

    // Auto-advance after a short delay so the student sees the feedback
    setTimeout(() => nextLiteracyQuestion(), 900);
}

/**
 * Proxy for checkLiteracyAnswer — exposed on window so answer-check.js can
 * call `window.checkLiteracyAnswer(q, container)` without importing this module.
 *
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Question} q
 * @param {HTMLElement} container
 * @returns {{ correct: boolean, submitted: any, feedback: string }}
 */
export function checkLiteracyAnswer(q, container) {
    return _checkLiteracyAnswer(q, container);
}

// Attach to window for inline HTML handlers and answer-check.js integration
if (typeof window !== 'undefined') {
    window.startLiteracyPractice   = startLiteracyPractice;
    window.nextLiteracyQuestion    = nextLiteracyQuestion;
    window.recordLiteracyAnswer    = recordLiteracyAnswer;
    window.checkLiteracyAnswer     = checkLiteracyAnswer;
}
