// gen-vocabulary.js — Vocabulary matching question generator
//
// Produces a "vocab-match" question consisting of a small set of vocabulary
// pairs (word ↔ definition, optionally word ↔ visual model). The matching
// widget (vocab-match.js) renders the pairs and grades the student's
// matching attempts.
//
// Skill IDs:
//   - vocab_grade_K, vocab_grade_1 … vocab_grade_6 — pull cards by grade
//   - vocab_grade_3_geometry (etc.) — grade + domain (optional, future)
//   - vocab_match — generic, falls back to state.vocabGrade / state.vocabDomain

import { state } from './state.js';
import { shuffle, pick } from './utils.js';
import {
    VOCABULARY_CARDS,
    getVocabByGrade,
    getVocabByGradeAndDomain
} from './data-vocabulary.js';

// SVG/visual helper imports — used by _renderModelInline to inline-render
// model previews. Kept lazy in spirit (only invoked from the helper) so
// missing helpers fail soft rather than at module load.
import { fracCircleSVG, fracBarHTML } from './svg-fractions.js';
import { createDotArray, createNumberLine, createBase10Blocks } from './svg-base10.js';
import {
    createRectangleSVG,
    createSquareSVG,
    createTriangleSVG,
    createShapeSVG,
    create3DBoxSVG,
    createAngleSVG
} from './svg-geometry.js';
import { createAnalogClockSVG, createDigitalClockHTML } from './svg-clock.js';

export function generateVocabularyQuestion(q, mappedSkill, helpers) {
    const { grade, domain } = parseVocabSkillId(mappedSkill);

    let pool = domain
        ? (typeof getVocabByGradeAndDomain === 'function'
            ? getVocabByGradeAndDomain(grade, domain)
            : [])
        : (typeof getVocabByGrade === 'function'
            ? getVocabByGrade(grade)
            : []);

    // Fallback: pool too small → broaden to grade only, then to all cards.
    if (!Array.isArray(pool) || pool.length < 3) {
        pool = (typeof getVocabByGrade === 'function') ? getVocabByGrade(grade) : [];
        if (!Array.isArray(pool) || pool.length < 3) {
            pool = Array.isArray(VOCABULARY_CARDS) ? VOCABULARY_CARDS : [];
        }
    }

    if (pool.length === 0) {
        // Safety: emit a no-op MC fallback so the dispatcher doesn't crash.
        q.text = "Math vocabulary content is not yet loaded.";
        q.ans = 'ok';
        q.options = ['ok'];
        q.answerType = 'multiple-choice';
        q.skillLabel = 'Math Vocabulary';
        q.printFormat = 'vocab-match';
        return;
    }

    // Decide pair count (3 by default; configurable via state.vocabPairCount).
    const requested = Number.isInteger(state.vocabPairCount) && state.vocabPairCount > 0
        ? state.vocabPairCount : 3;
    const numPairs = Math.max(2, Math.min(requested, pool.length));

    const chosen = shuffle([...pool]).slice(0, numPairs);

    // Decide match mode based on what the cards support.
    const haveModels = chosen.every(c => c && c.modelType && c.modelType !== 'text-example');
    const modes = ['word-to-def', 'def-to-word'];
    if (haveModels) modes.push('model-to-word');
    const mode = pick(modes);

    const leftField = (c) => {
        if (mode === 'word-to-def' || mode === 'model-to-word') {
            return { text: c.word, model: null };
        }
        // 'def-to-word'
        return { text: c.definition, model: null };
    };
    const rightField = (c) => {
        if (mode === 'word-to-def') return { text: c.definition, model: renderModel(c) };
        if (mode === 'def-to-word') return { text: c.word, model: renderModel(c) };
        // 'model-to-word' → left is the word, right is the visual
        return { text: c.word, model: renderModel(c) };
    };

    // Prompt text varies with mode.
    if (mode === 'def-to-word') {
        q.text = 'Match each definition to the correct word.';
    } else if (mode === 'model-to-word') {
        q.text = 'Match each picture to the correct word.';
    } else {
        q.text = 'Match each word to its definition.';
    }

    q.vocabPairs = chosen.map(c => {
        const lf = leftField(c);
        const rf = rightField(c);
        return {
            id: c.id,
            leftText: lf.text,
            leftModel: lf.model,
            rightText: rf.text,
            rightModel: rf.model
        };
    });

    q.answerType = 'vocab-match';
    // Correct mapping: each card id matches itself (widget shuffles columns).
    q.ans = chosen.reduce((acc, c) => { acc[c.id] = c.id; return acc; }, {});
    q.options = [];
    q.hint = 'Read each carefully and find what fits.';
    q.skillLabel = 'Math Vocabulary';
    q.printFormat = 'vocab-match';
    q.vocabMode = mode;
}

// ---------- helpers (module-private) ----------

function parseVocabSkillId(id) {
    if (typeof id !== 'string') id = '';
    // 'vocab_grade_k' / 'vocab_grade_3' / 'vocab_grade_3_geometry'
    const m = id.match(/^vocab_grade_(k|\d)(?:_(\w+))?$/i);
    if (m) {
        const g = m[1].toUpperCase();
        return { grade: g, domain: m[2] || null };
    }
    // Generic fallback: use state.vocabGrade / state.vocabDomain or default '3'
    return {
        grade: state.vocabGrade || '3',
        domain: state.vocabDomain || null
    };
}

function renderModel(card) {
    if (!card || !card.modelType) return null;
    const data = card.modelData || {};

    if (card.modelType === 'text-example') {
        const ex = (data.example != null ? String(data.example) : '');
        return `<div style="background:#f5f5f5;padding:8px;border-radius:6px;font-family:monospace;font-size:0.95rem;color:#333;">${escapeHTML(ex)}</div>`;
    }

    return _renderModelInline(card.modelType, data);
}

function _renderModelInline(type, data) {
    try {
        switch (type) {
            // ---- Fractions ----
            case 'svg-fraction':
            case 'fraction-circle': {
                const num = numOr(data.num, 1);
                const den = numOr(data.den, 2);
                const size = numOr(data.size, 80);
                return wrapInline(fracCircleSVG(num, den, size));
            }
            case 'fraction-bar': {
                const num = numOr(data.num, 1);
                const den = numOr(data.den, 2);
                return wrapInline(fracBarHTML(num, den));
            }

            // ---- Arrays / dot arrays / base-10 ----
            case 'svg-array':
            case 'dot-array':
            case 'array': {
                const rows = numOr(data.rows, 2);
                const cols = numOr(data.cols, 3);
                const label = data.label || '';
                return wrapInline(createDotArray(rows, cols, label));
            }
            case 'base10':
            case 'base10-blocks': {
                const n = numOr(data.number, 12);
                return wrapInline(createBase10Blocks(n));
            }
            case 'number-line': {
                const min = numOr(data.min, 0);
                const max = numOr(data.max, 10);
                const highlight = data.highlight != null ? data.highlight : null;
                return wrapInline(createNumberLine(min, max, highlight));
            }

            // ---- Geometry ----
            case 'svg-shape':
            case 'shape': {
                const name = data.name || data.shape || 'circle';
                return wrapInline(createShapeSVG(name, false));
            }
            case 'rectangle': {
                const length = numOr(data.length, 5);
                const width = numOr(data.width, 3);
                return wrapInline(createRectangleSVG(length, width, !!data.showDimensions, false));
            }
            case 'square': {
                const side = numOr(data.side, 4);
                return wrapInline(createSquareSVG(side, !!data.showDimensions, false));
            }
            case 'triangle': {
                const tType = data.type || 'equilateral';
                const base = numOr(data.base, 0);
                const height = numOr(data.height, 0);
                return wrapInline(createTriangleSVG(tType, base, height, !!data.showDimensions, false));
            }
            case 'box-3d':
            case '3d-box': {
                const l = numOr(data.length, 4);
                const w = numOr(data.width, 3);
                const h = numOr(data.height, 2);
                return wrapInline(create3DBoxSVG(l, w, h, false));
            }
            case 'angle': {
                const deg = numOr(data.degrees, 90);
                const size = numOr(data.size, 100);
                return wrapInline(createAngleSVG(deg, size, !!data.showLabel, false));
            }

            // ---- Clocks ----
            case 'svg-clock':
            case 'analog-clock': {
                const hour = numOr(data.hour, 3);
                const minute = numOr(data.minute, 0);
                return wrapInline(createAnalogClockSVG(hour, minute, data.options || {}));
            }
            case 'digital-clock': {
                const hour = numOr(data.hour, 3);
                const minute = numOr(data.minute, 0);
                return wrapInline(createDigitalClockHTML(hour, minute, data.options || {}));
            }

            // ---- Coin / money — simple text fallback (no dedicated helper) ----
            case 'svg-coin':
            case 'coin':
            case 'money': {
                const label = data.label || data.value || '¢';
                return `<div style="display:inline-block;padding:6px 10px;border-radius:50%;background:#fff8d6;border:2px solid #c8a85b;color:#5a4a14;font-weight:600;">${escapeHTML(String(label))}</div>`;
            }

            default:
                // Unknown model type — render the raw label/example if present.
                if (data.label) {
                    return `<div style="background:#f5f5f5;padding:6px 8px;border-radius:6px;font-size:0.9rem;color:#333;">${escapeHTML(String(data.label))}</div>`;
                }
                return null;
        }
    } catch (err) {
        console.warn('vocab renderModel failed for type', type, err);
        return null;
    }
}

function wrapInline(svgOrHtml) {
    if (svgOrHtml == null) return null;
    return `<div style="display:flex;align-items:center;justify-content:center;min-height:60px;">${svgOrHtml}</div>`;
}

function numOr(v, fallback) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
}

function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
