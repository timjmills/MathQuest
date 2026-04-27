// gen-vocabulary.js — Vocabulary question generator (multi-variant)
//
// Produces a variety of vocab question types so students learn the words,
// not just the format. Variants:
//
//   match           - the original "vocab-match" pairing widget (~30%)
//   mc-def-to-word  - "Which word matches this definition?" (~20%)
//   mc-word-to-def  - "What does X mean?" (~20%)
//   true-false      - "True or False: 'X' means 'Y'." (~10%)
//   picture-to-word - "Which word does this picture show?" (~10%, when models exist)
//   sort-category   - "Click ALL words that ___" (~10%, grade 2+)
//
// Skill IDs handled:
//   - vocab_grade_K, vocab_grade_1 … vocab_grade_6
//   - vocab_grade_3_geometry (etc.) — grade + domain
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

// Small inline speaker button for vocab cards/visuals. The actual TTS
// dispatch is wired via a global delegated click listener in globals.js
// (looks for .vocab-speak / .vmh-speak and calls window.speak).
function _speakerHtml(text) {
    const safe = String(text == null ? '' : text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    return `<button class="vmh-speak vocab-speak" type="button" data-speak="${safe}" title="Read aloud" aria-label="Read aloud" style="margin-left:8px;vertical-align:middle;background:#f5f5f5;border:1px solid #ccc;border-radius:50%;width:28px;height:28px;padding:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;color:#555;flex:0 0 auto;"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg></button>`;
}

// ---------- CATEGORY_SETS (sort-category variant) ----------
// Hand-coded "click ALL that match" prompts. correctIds/wrongIds reference
// vocab card IDs from data-vocabulary.js; the runtime intersects with the
// actual pool, so missing IDs are silently skipped.
const CATEGORY_SETS = [
    {
        text: 'Click ALL words that name a polygon.',
        correctIds: ['triangle-k', 'square-k', 'rectangle-k', 'pentagon-1', 'hexagon-1',
                     'square-3', 'rectangle-3', 'pentagon-3', 'hexagon-3', 'octagon-3', 'polygon-2', 'polygon-3'],
        wrongIds: ['circle-k', 'sphere-k', 'cube-k', 'cylinder-k', 'cone-k',
                   'sphere-2', 'cube-2', 'cylinder-2', 'cone-2', 'point-4', 'line-4'],
        minGrade: 2
    },
    {
        text: 'Click ALL words about 3D shapes.',
        correctIds: ['sphere-k', 'cube-k', 'cylinder-k', 'cone-k', 'solid',
                     'sphere-2', 'cube-2', 'cylinder-2', 'cone-2'],
        wrongIds: ['circle-k', 'square-k', 'triangle-k', 'rectangle-k',
                   'pentagon-1', 'hexagon-1', 'square-3', 'rectangle-3', 'flat'],
        minGrade: 2
    },
    {
        text: 'Click ALL words that mean addition or its parts.',
        correctIds: ['add-k', 'plus', 'plus-sign', 'sum', 'sum-2', 'addend-1',
                     'addition-1', 'total', 'altogether', 'in-all'],
        wrongIds: ['subtract-k', 'minus', 'minus-sign', 'difference-1', 'subtraction-1',
                   'product-3', 'product-4', 'product-5', 'quotient-3', 'quotient-4',
                   'factor-3', 'factor-4'],
        minGrade: 2
    },
    {
        text: 'Click ALL words about fractions.',
        correctIds: ['numerator-3', 'denominator-3', 'equivalent-fractions-3',
                     'equivalent-fractions-4', 'mixed-number-4', 'mixed-number-5'],
        wrongIds: ['sum', 'sum-2', 'product-3', 'product-4', 'factor-3', 'factor-4',
                   'quotient-3', 'addend-1', 'difference-1'],
        minGrade: 3
    },
    {
        text: 'Click ALL angle types.',
        correctIds: ['acute-angle-4', 'obtuse-angle-4', 'right-angle-4',
                     'right-angle-2', 'straight-angle', 'angle-2', 'angle-3'],
        wrongIds: ['circle-k', 'square-k', 'triangle-k', 'sphere-k', 'cube-k',
                   'pentagon-1', 'hexagon-1', 'point-4', 'line-4', 'line-segment-4'],
        minGrade: 4
    },
    {
        text: 'Click ALL measurement units.',
        correctIds: ['inch-1', 'foot-1', 'meter-2', 'liter-3', 'gram-3', 'kilogram-3',
                     'square-unit'],
        wrongIds: ['sum', 'product-3', 'factor-3', 'numerator-3', 'denominator-3',
                   'circle-k', 'square-k', 'triangle-k'],
        minGrade: 2
    },
    {
        text: 'Click ALL words about multiplication or division.',
        correctIds: ['product-3', 'product-4', 'product-5', 'quotient-3', 'quotient-4',
                     'quotient-5', 'factor-3', 'factor-4', 'factor-pair-4', 'prime-number-4'],
        wrongIds: ['sum', 'sum-2', 'addend-1', 'difference-1', 'addition-1',
                   'subtraction-1', 'plus', 'minus'],
        minGrade: 3
    },
    {
        text: 'Click ALL even-related words.',
        correctIds: ['even-2'],
        wrongIds: ['odd-2', 'prime-number-4', 'sum', 'product-3'],
        minGrade: 2
    }
];

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

    // Variant dispatcher — weighted random pick. Variants whose `requires`
    // returns false are dropped (e.g., picture-to-word needs cards with models).
    const gradeNum = (grade === 'K' || grade === 'k') ? 0 : parseInt(grade, 10);
    const variants = [
        { id: 'match', weight: 30, fn: _genMatch },
        { id: 'mc-def-to-word', weight: 20, fn: _genMcDefToWord, requires: (p) => p.length >= 4 },
        { id: 'mc-word-to-def', weight: 20, fn: _genMcWordToDef, requires: (p) => p.length >= 4 },
        { id: 'true-false', weight: 10, fn: _genTrueFalse, requires: (p) => p.length >= 2 },
        {
            id: 'picture-to-word',
            weight: 10,
            fn: _genPictureToWord,
            requires: (p) => p.filter(c => c.modelType && c.modelType !== 'text-example').length >= 4
        },
        {
            id: 'sort-category',
            weight: 10,
            fn: _genSortCategory,
            requires: (p, g) => g >= 2 && _availableCategorySets(p, g).length > 0
        }
    ];

    const applicable = variants.filter(v => !v.requires || v.requires(pool, gradeNum));
    const total = applicable.reduce((s, v) => s + v.weight, 0);
    let r = Math.random() * total;
    let chosen = applicable[0];
    for (const v of applicable) {
        r -= v.weight;
        if (r <= 0) { chosen = v; break; }
    }

    chosen.fn(q, pool, grade, domain);

    // Common metadata — variant fns may override but these are sane defaults.
    if (!q.skillLabel) q.skillLabel = 'Math Vocabulary';
    if (!q.printFormat) q.printFormat = 'vocab-match';
}

// ---------- variant: match (existing widget) ----------

function _genMatch(q, pool, grade, domain) {
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
        return { text: c.definition, model: null };
    };
    const rightField = (c) => {
        if (mode === 'word-to-def') return { text: c.definition, model: renderModel(c) };
        if (mode === 'def-to-word') return { text: c.word, model: renderModel(c) };
        return { text: c.word, model: renderModel(c) };
    };

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
    q.ans = chosen.reduce((acc, c) => { acc[c.id] = c.id; return acc; }, {});
    q.options = [];
    q.hint = 'Read each carefully and find what fits.';
    q.skillLabel = 'Math Vocabulary';
    q.printFormat = 'vocab-match';
    q.vocabMode = mode;
}

// ---------- variant: multiple choice — definition shown, pick the word ----------

function _genMcDefToWord(q, pool, grade, domain) {
    const correct = pick(pool);
    const distractorPool = pool.filter(c => c.id !== correct.id && c.word !== correct.word);
    const wrongs = shuffle(distractorPool).slice(0, 3);
    if (wrongs.length < 3) { _genMatch(q, pool, grade, domain); return; }

    const options = shuffle([correct.word, ...wrongs.map(c => c.word)]);

    q.text = 'Which word matches this definition?';
    q.visual = `<div class="vocab-def-prompt" style="background:#e3f2fd;padding:14px 18px;border-radius:8px;border-left:4px solid #1565c0;font-size:1.05rem;color:#0d47a1;line-height:1.5;margin:8px auto;max-width:560px;display:flex;align-items:flex-start;gap:8px;"><span style="flex:1;">${escapeHTML(correct.definition)}</span>${_speakerHtml(correct.definition)}</div>`;
    q.options = options;
    q.ans = correct.word;
    q.answerType = 'multiple-choice';
    q.hint = 'Read the definition carefully and pick the word that fits.';
    q.skillLabel = 'Math Vocabulary';
    q.printFormat = 'vocab-mc';
}

// ---------- variant: multiple choice — word shown, pick the definition ----------

function _genMcWordToDef(q, pool, grade, domain) {
    const correct = pick(pool);
    const distractorPool = pool.filter(c =>
        c.id !== correct.id &&
        c.definition !== correct.definition
    );
    const wrongs = shuffle(distractorPool).slice(0, 3);
    if (wrongs.length < 3) { _genMatch(q, pool, grade, domain); return; }

    const options = shuffle([correct.definition, ...wrongs.map(c => c.definition)]);

    q.text = `What does "${correct.word}" mean?`;
    q.visual = `<div class="vocab-word-prompt" style="background:#fff3e0;padding:14px 18px;border-radius:8px;border-left:4px solid #ff9800;font-size:1.25rem;font-weight:700;color:#5d4037;line-height:1.4;margin:8px auto;max-width:560px;display:flex;align-items:center;justify-content:center;gap:10px;"><span>${escapeHTML(correct.word)}</span>${_speakerHtml(correct.word)}</div>`;
    q.options = options;
    q.ans = correct.definition;
    q.answerType = 'multiple-choice';
    q.hint = `Think about how "${correct.word}" is used in math.`;
    q.skillLabel = 'Math Vocabulary';
    q.printFormat = 'vocab-mc';
}

// ---------- variant: true / false ----------

function _genTrueFalse(q, pool, grade, domain) {
    const card = pick(pool);
    const isTrue = Math.random() < 0.5;
    let shownDef;

    if (isTrue) {
        shownDef = card.definition;
    } else {
        // Pick a different card's definition (must actually differ in text).
        const others = pool.filter(c =>
            c.id !== card.id &&
            c.definition !== card.definition
        );
        if (others.length === 0) {
            // No usable wrong definition → fall back to "true" case.
            shownDef = card.definition;
        } else {
            shownDef = pick(others).definition;
        }
    }

    const actuallyTrue = (shownDef === card.definition);

    q.text = `True or False: "${card.word}" means "${shownDef}"`;
    q.visual = `<div class="vocab-tf-prompt" style="background:#f5f5f5;padding:14px 18px;border-radius:8px;border-left:4px solid #7b1fa2;color:#333;line-height:1.5;margin:8px auto;max-width:560px;display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:center;gap:10px;"><strong style="font-size:1.15rem;color:#4a148c;">${escapeHTML(card.word)}</strong>${_speakerHtml(card.word)}</div>
        <div style="display:flex;align-items:flex-start;gap:8px;font-size:1rem;"><span style="flex:1;"><em>means</em> &ldquo;${escapeHTML(shownDef)}&rdquo;</span>${_speakerHtml(shownDef)}</div>
    </div>`;
    q.ans = actuallyTrue ? 'True' : 'False';
    q.options = ['True', 'False'];
    q.answerType = 'choice';
    q.hint = `Does that definition really describe "${card.word}"?`;
    q.skillLabel = 'Math Vocabulary';
    q.printFormat = 'vocab-tf';
}

// ---------- variant: picture-to-word ----------

function _genPictureToWord(q, pool, grade, domain) {
    const visualPool = pool.filter(c => c.modelType && c.modelType !== 'text-example');
    if (visualPool.length < 4) { _genMatch(q, pool, grade, domain); return; }

    const correct = pick(visualPool);
    const visualHtml = renderModel(correct);
    if (!visualHtml) { _genMatch(q, pool, grade, domain); return; }

    const distractorPool = pool.filter(c => c.id !== correct.id && c.word !== correct.word);
    const wrongs = shuffle(distractorPool).slice(0, 3);
    if (wrongs.length < 3) { _genMatch(q, pool, grade, domain); return; }

    const options = shuffle([correct.word, ...wrongs.map(c => c.word)]);

    q.text = 'Which word does this picture show?';
    q.visual = `<div style="display:flex;justify-content:center;align-items:center;padding:12px;margin:8px auto;background:#fff;border:2px solid #e0e0e0;border-radius:10px;max-width:320px;">${visualHtml}</div>`;
    q.options = options;
    q.ans = correct.word;
    q.answerType = 'multiple-choice';
    q.hint = 'Look at the picture and pick the math word that names it.';
    q.skillLabel = 'Math Vocabulary';
    q.printFormat = 'vocab-mc';
}

// ---------- variant: sort into category ----------

function _availableCategorySets(pool, gradeNum) {
    const idsInPool = new Set(pool.map(c => c.id));
    return CATEGORY_SETS.filter(set => {
        if (set.minGrade && gradeNum < set.minGrade) return false;
        const correctAvail = set.correctIds.filter(id => idsInPool.has(id));
        const wrongAvail = set.wrongIds.filter(id => idsInPool.has(id));
        // Need at least 2 correct + 2 wrong for a meaningful sort.
        return correctAvail.length >= 2 && wrongAvail.length >= 2;
    });
}

function _genSortCategory(q, pool, grade, domain) {
    const gradeNum = (grade === 'K' || grade === 'k') ? 0 : parseInt(grade, 10);
    const candidateSets = _availableCategorySets(pool, gradeNum);
    if (candidateSets.length === 0) { _genMatch(q, pool, grade, domain); return; }

    const set = pick(candidateSets);
    const idsInPool = new Map(pool.map(c => [c.id, c]));

    const correctCards = shuffle(set.correctIds.filter(id => idsInPool.has(id)))
        .map(id => idsInPool.get(id));
    const wrongCards = shuffle(set.wrongIds.filter(id => idsInPool.has(id)))
        .map(id => idsInPool.get(id));

    // Aim for ~6 total: 3 correct + 3 wrong, but flex if pool is tight.
    const numCorrect = Math.min(3, correctCards.length);
    const numWrong = Math.min(3, wrongCards.length);
    const totalNeeded = numCorrect + numWrong;
    if (totalNeeded < 4) { _genMatch(q, pool, grade, domain); return; }

    const picked = [
        ...correctCards.slice(0, numCorrect).map(c => ({ card: c, correct: true })),
        ...wrongCards.slice(0, numWrong).map(c => ({ card: c, correct: false }))
    ];
    const shuffled = shuffle(picked);

    const opts = shuffled.map((entry, i) => ({
        id: 'opt' + i,
        label: entry.card.word,
        correct: entry.correct
    }));
    const ans = opts.filter(o => o.correct).map(o => o.id);

    q.text = set.text;
    q.ans = ans;
    q.options = opts;
    q.answerType = 'multi-select-check';
    q.minCorrect = ans.length;
    q.hint = 'Read each word — pick only the ones that fit the question.';
    q.skillLabel = 'Math Vocabulary';
    q.printFormat = 'multi-select';
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
            case 'base10-blocks':
            case 'svg-base10': {
                const n = numOr(data.number, (numOr(data.hundreds, 0) * 100) + (numOr(data.tens, 0) * 10) + numOr(data.ones, 0));
                return wrapInline(createBase10Blocks(n || 12));
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
