// variant-cycler.js — centralized least-recently-used picker for problem-type
// rotation across the gen-*.js generators.
//
// PROBLEM SOLVED: Each skill in MathQuest has multiple sub-types selected by
// `Math.random() < threshold` chains inside its generator. Pure independent
// random rolls cluster — students see the same sub-type three or four times
// in a row. This helper tracks recent picks per-skill and prefers the
// least-recently-used variant so the rotation feels fair.
//
// ADAPTIVE INTERACTION: When `state.adaptiveModeEnabled === true` AND the
// helper has recorded wrong answers for specific variants of this skill, the
// picker biases toward those variants so the student gets more practice on
// the types they're struggling with. With adaptive OFF, behaviour is pure
// LRU rotation.
//
// USAGE:
//   import { pickVariant, recordVariantWrong, recordVariantRight } from './variant-cycler.js';
//   const v = pickVariant('add_word_problems', ['compare', 'change', 'partpart']);
//   // ...generate question for variant v...
//   // After answer is checked:
//   if (correct) recordVariantRight(skillId, v); else recordVariantWrong(skillId, v);
//
// Weighted variant: pass an array of weights (parallel to variants). When
// weights are provided the picker becomes weighted-LRU — recent picks are
// penalized but rare variants still get more time on the bench.

import { state } from './state.js';

// History capacity per skill. Larger = stronger anti-repeat. We use 6 so even
// a 6-variant skill never repeats consecutively unless it has to.
const HISTORY_LIMIT = 6;
// How many most-recent picks contribute to the LRU score. The most-recent
// pick gets the harshest penalty, decaying linearly. This keeps the queue
// honest without forcing strict round-robin.
const RECENCY_WINDOW = 4;
// Adaptive bias multiplier — variants flagged "wrong" multiply their score
// by this much, making them ~2x as likely after the LRU penalty.
const ADAPTIVE_WRONG_BOOST = 2.2;
// Decay per-correct-answer for the wrong-variant memory. After 3 correct
// answers in a row on a variant, its boost is cleared back to 1.0.
const WRONG_DECAY_PER_CORRECT = 1;

function ensureBuckets() {
    if (typeof window === 'undefined') return null;
    if (!window.__variantHistory || typeof window.__variantHistory !== 'object') {
        window.__variantHistory = {};
    }
    if (!window.__variantWrongCounts || typeof window.__variantWrongCounts !== 'object') {
        window.__variantWrongCounts = {};
    }
    return window;
}

function historyFor(skillId) {
    const w = ensureBuckets();
    if (!w) return [];
    if (!Array.isArray(w.__variantHistory[skillId])) {
        w.__variantHistory[skillId] = [];
    }
    return w.__variantHistory[skillId];
}

function wrongMapFor(skillId) {
    const w = ensureBuckets();
    if (!w) return {};
    if (!w.__variantWrongCounts[skillId] || typeof w.__variantWrongCounts[skillId] !== 'object') {
        w.__variantWrongCounts[skillId] = {};
    }
    return w.__variantWrongCounts[skillId];
}

function pushHistory(skillId, variant) {
    const hist = historyFor(skillId);
    hist.push(String(variant));
    while (hist.length > HISTORY_LIMIT) hist.shift();
}

// Score a variant: lower score = more likely to be picked. Combines LRU
// recency penalty with optional weight (low weight = lower score = picked
// more often, mirroring weighted random) and adaptive wrong-answer boost.
function scoreVariant(skillId, variant, idx, weight, hist, wrongMap, adaptiveOn) {
    // Base LRU penalty: most-recent pick gets +RECENCY_WINDOW, second-most
    // +(RECENCY_WINDOW-1), etc. Picks older than RECENCY_WINDOW don't count.
    let score = 1.0;
    const lastIdx = hist.length - 1;
    for (let i = lastIdx; i >= 0 && i > lastIdx - RECENCY_WINDOW; i--) {
        if (hist[i] === String(variant)) {
            const distance = lastIdx - i; // 0 = most recent
            score += (RECENCY_WINDOW - distance);
        }
    }
    // Apply caller-supplied weight AFTER LRU so it scales the entire penalty:
    // a higher weight divides the score, making the variant more attractive
    // even when it was picked recently. Default weight 1.0 = no change.
    if (typeof weight === 'number' && weight > 0) {
        score = score / weight;
    }
    // Adaptive bias: if this variant has unresolved wrong answers, divide
    // the score (making it more likely) so the student practices it again.
    if (adaptiveOn) {
        const wrongCount = wrongMap[String(variant)] || 0;
        if (wrongCount > 0) {
            const boost = 1 + Math.min(wrongCount, 3) * (ADAPTIVE_WRONG_BOOST - 1) / 3;
            score = score / boost;
        }
    }
    // Tiny per-call jitter so ties break randomly instead of always-leftmost.
    score += Math.random() * 0.01;
    return score;
}

/**
 * Pick a variant for `skillId` from the `variants` array.
 *
 * @param {string} skillId   - The skill ID this variant belongs to.
 * @param {Array}  variants  - Array of variant identifiers (strings or any
 *                             stringifiable value). Must have length >= 1.
 * @param {Array}  [weights] - Optional parallel array of numeric weights.
 *                             Higher weight = more likely. Pass null/omit for
 *                             equal-weight LRU rotation.
 * @returns {*} One element of `variants`. Returns `variants[0]` when
 *              variants is empty/invalid (caller should pass a real array).
 */
export function pickVariant(skillId, variants, weights = null) {
    if (!Array.isArray(variants) || variants.length === 0) return null;
    if (variants.length === 1) {
        pushHistory(skillId, variants[0]);
        return variants[0];
    }
    const hist = historyFor(skillId);
    const wrongMap = wrongMapFor(skillId);
    const adaptiveOn = !!(state && state.adaptiveModeEnabled);

    let bestIdx = 0;
    let bestScore = Infinity;
    for (let i = 0; i < variants.length; i++) {
        const w = (Array.isArray(weights) && typeof weights[i] === 'number') ? weights[i] : 1.0;
        const s = scoreVariant(skillId, variants[i], i, w, hist, wrongMap, adaptiveOn);
        if (s < bestScore) {
            bestScore = s;
            bestIdx = i;
        }
    }
    const chosen = variants[bestIdx];
    pushHistory(skillId, chosen);
    return chosen;
}

/**
 * Record that the student got a question of `variant` WRONG. Increases the
 * variant's adaptive-bias boost so it surfaces sooner.
 */
export function recordVariantWrong(skillId, variant) {
    if (!skillId || variant == null) return;
    const wrongMap = wrongMapFor(skillId);
    const key = String(variant);
    wrongMap[key] = (wrongMap[key] || 0) + 1;
    // Cap to prevent runaway boost from a stuck student.
    if (wrongMap[key] > 5) wrongMap[key] = 5;
}

/**
 * Record that the student got a question of `variant` RIGHT. Decays the
 * variant's wrong-answer boost so eventually it returns to baseline.
 */
export function recordVariantRight(skillId, variant) {
    if (!skillId || variant == null) return;
    const wrongMap = wrongMapFor(skillId);
    const key = String(variant);
    if (wrongMap[key]) {
        wrongMap[key] -= WRONG_DECAY_PER_CORRECT;
        if (wrongMap[key] <= 0) delete wrongMap[key];
    }
}

// Expose on window so gen-*.js modules can call without importing — keeps
// the conversion churn minimal across 8 large generator files.
if (typeof window !== 'undefined') {
    window.pickVariant = pickVariant;
    window.recordVariantWrong = recordVariantWrong;
    window.recordVariantRight = recordVariantRight;
}
