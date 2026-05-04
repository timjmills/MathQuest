// map-engine-literacy.js — Literacy Quest MAP adaptive engine.
//
// Ports the Rasch 1PL engine from map-engine.js to literacy. Adds:
//   - Three test variants (reading-k2, reading-2-5, language-usage)
//   - Per-instructional-area balance enforcement
//   - EISA grade-level weighting
//   - 2025 NWEA norms for starting RIT and percentile reporting
//   - 43-item stopping rule + 7% field-test buffer
//   - Item-set passage anchoring hooks for item-set-controller.js
//
// Does NOT import map-engine.js — logic is ported, not delegated.
// Does NOT import from state.js — all session state lives on LiteracyMapSession.

import { atomsForRitWindow, groupByInstructionalArea } from
    '../../../data/literacy-skills/map-quest/filter.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * 2025 NWEA norms (2020 published − 2.0 per NWEA shift documentation).
 * @type {Record<string, Record<"fall"|"winter"|"spring", {mean:number, sd:number}>>}
 */
const NWEA_2025_NORMS = {
    reading: {
        "K":  { fall: { mean: 134.65, sd: 12.22 }, winter: { mean: 144.28, sd: 11.78 }, spring: { mean: 151.09, sd: 12.06 } },
        "1":  { fall: { mean: 153.93, sd: 12.66 }, winter: { mean: 163.85, sd: 13.21 }, spring: { mean: 169.40, sd: 14.19 } },
        "2":  { fall: { mean: 170.35, sd: 15.19 }, winter: { mean: 179.20, sd: 15.05 }, spring: { mean: 183.57, sd: 15.49 } },
        "3":  { fall: { mean: 184.62, sd: 16.65 }, winter: { mean: 191.90, sd: 16.14 }, spring: { mean: 195.12, sd: 16.27 } },
        "4":  { fall: { mean: 194.67, sd: 16.78 }, winter: { mean: 200.50, sd: 16.25 }, spring: { mean: 202.83, sd: 16.31 } },
        "5":  { fall: { mean: 202.48, sd: 16.38 }, winter: { mean: 207.12, sd: 15.88 }, spring: { mean: 208.98, sd: 15.97 } },
        "6":  { fall: { mean: 208.17, sd: 16.46 }, winter: { mean: 211.81, sd: 15.98 }, spring: { mean: 213.36, sd: 16.03 } },
        "8":  { fall: { mean: 216.01, sd: 17.04 }, winter: { mean: 218.52, sd: 16.69 }, spring: { mean: 219.66, sd: 16.87 } },
        "10": { fall: { mean: 219.47, sd: 17.92 }, winter: { mean: 220.91, sd: 17.81 }, spring: { mean: 221.51, sd: 18.20 } },
    },
    language_usage: {
        "2":  { fall: { mean: 171.98, sd: 16.06 }, winter: { mean: 181.83, sd: 15.40 }, spring: { mean: 186.40, sd: 15.89 } },
        "3":  { fall: { mean: 185.71, sd: 15.33 }, winter: { mean: 193.14, sd: 14.64 }, spring: { mean: 196.32, sd: 14.65 } },
        "4":  { fall: { mean: 195.33, sd: 15.10 }, winter: { mean: 200.87, sd: 14.44 }, spring: { mean: 203.00, sd: 14.33 } },
        "5":  { fall: { mean: 202.17, sd: 14.55 }, winter: { mean: 206.45, sd: 13.98 }, spring: { mean: 208.19, sd: 13.90 } },
        "7":  { fall: { mean: 210.65, sd: 14.72 }, winter: { mean: 213.28, sd: 14.39 }, spring: { mean: 214.47, sd: 14.42 } },
        "9":  { fall: { mean: 214.68, sd: 15.52 }, winter: { mean: 216.18, sd: 15.30 }, spring: { mean: 217.00, sd: 15.51 } },
        "11": { fall: { mean: 218.66, sd: 14.94 }, winter: { mean: 219.86, sd: 14.98 }, spring: { mean: 220.33, sd: 15.53 } },
    },
};

/**
 * Target instructional-area proportions per test variant.
 * Keys must match rit_instructional_area prefixes in skill atoms.
 * "cross" is the catch-all for skills that don't fit a named area.
 */
const AREA_PROPORTIONS = {
    'reading-k2': {
        foundational: 0.25,
        language_writing: 0.25,
        lit_info: 0.25,
        vocabulary: 0.25,
    },
    'reading-2-5': {
        literary: 0.30,
        informational: 0.30,
        vocabulary: 0.25,
        cross: 0.15,
    },
    'language-usage': {
        grammar: 0.40,
        mechanics: 0.30,
        writing: 0.30,
    },
};

/** Canonical scoring item target (field-test items are on top of this). */
const TARGET_SCORED_ITEMS = 43;

/** Field-test rate: approximately 7% of administered items are unscored. */
const FIELD_TEST_RATE = 0.07;

/** Rasch update learning rate. Smaller = more stable, larger = faster convergence. */
const LEARNING_RATE = 3.5;

/** RIT window half-width around current ability for item selection. */
const SELECTION_WINDOW = 15;

/** EISA: how many RIT points from ability that grade-level items receive 2:1 priority. */
const EISA_GRADE_BIAS_WINDOW = 5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Standard normal CDF via Abramowitz & Stegun rational approximation.
 * Error < 7.5e-8. Used for percentile reporting.
 * @param {number} z
 * @returns {number} Probability [0, 1]
 */
function normCdf(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const poly = t * (0.319381530
        + t * (-0.356563782
        + t * (1.781477937
        + t * (-1.821255978
        + t * 1.330274429))));
    const p = 1 - (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z) * poly;
    return z >= 0 ? p : 1 - p;
}

/**
 * Rasch 1PL probability: P(correct | theta, b).
 * @param {number} theta - Student ability estimate (RIT)
 * @param {number} b     - Item difficulty (RIT)
 * @returns {number} [0, 1]
 */
function raschP(theta, b) {
    return 1 / (1 + Math.exp(-(theta - b)));
}

/**
 * Rasch 1PL EAP update (simplified gradient step).
 * @param {number} theta   - Current ability estimate
 * @param {number} b       - Item difficulty
 * @param {boolean} correct - Whether response was correct
 * @returns {number} Updated ability estimate
 */
function updateTheta(theta, b, correct) {
    const p = raschP(theta, b);
    const response = correct ? 1 : 0;
    return theta + LEARNING_RATE * (response - p);
}

/**
 * Parse a rit_band string like "181-190" into its midpoint (185.5).
 * Falls back to a default of 185 for unparseable values.
 * @param {string} band
 * @returns {number}
 */
function bandMidpoint(band) {
    const m = /^(\d+)-(\d+)$/.exec(band || '');
    if (!m) return 185;
    return (parseInt(m[1], 10) + parseInt(m[2], 10)) / 2;
}

/**
 * Map a rit_instructional_area string to one of the area keys used in
 * AREA_PROPORTIONS. Case-insensitive prefix match.
 * @param {string} area
 * @param {string} testVariant
 * @returns {string} Normalised area key
 */
function normalizeArea(area, testVariant) {
    const a = (area || '').toLowerCase();
    const props = AREA_PROPORTIONS[testVariant] || {};
    const keys = Object.keys(props);
    // Try prefix match: "Literary Text" → "literary", "Foundational Skills" → "foundational"
    for (const key of keys) {
        if (a.startsWith(key)) return key;
    }
    // Partial word scan
    for (const key of keys) {
        if (a.includes(key)) return key;
    }
    // Fallback: 'cross' for reading-2-5, last key for others
    return keys.includes('cross') ? 'cross' : (keys[keys.length - 1] || 'other');
}

/**
 * Find the closest existing grade key in the norms table (for grades not
 * listed, e.g. grade 7 reading uses grade 6).
 * @param {string} testVariant
 * @param {string|number} grade
 * @returns {string|null}
 */
function resolveNormsGrade(testVariant, grade) {
    const normsKey = testVariant === 'language-usage' ? 'language_usage' : 'reading';
    const normsForVariant = NWEA_2025_NORMS[normsKey] || {};
    const gradeStr = String(grade);
    if (normsForVariant[gradeStr]) return gradeStr;
    // Numeric nearest
    const gradeNum = gradeStr === 'K' ? 0 : parseInt(gradeStr, 10);
    const available = Object.keys(normsForVariant).map(k => ({ k, n: k === 'K' ? 0 : parseInt(k, 10) }));
    available.sort((a, b) => Math.abs(a.n - gradeNum) - Math.abs(b.n - gradeNum));
    return available.length ? available[0].k : null;
}

// ---------------------------------------------------------------------------
// Exported helpers
// ---------------------------------------------------------------------------

/**
 * Recommend a starting RIT for a student given grade, season, and test variant.
 * Uses 2025 norms. Falls back to 180 for unknown grades.
 *
 * @param {string|number} grade  - "K" | 1-12
 * @param {"fall"|"winter"|"spring"} season
 * @param {"reading-k2"|"reading-2-5"|"language-usage"} testVariant
 * @returns {number} Recommended starting RIT
 */
export function recommendStartingRit(grade, season, testVariant) {
    const resolvedGrade = resolveNormsGrade(testVariant, grade);
    if (!resolvedGrade) return 180;
    const normsKey = testVariant === 'language-usage' ? 'language_usage' : 'reading';
    const seasonData = (NWEA_2025_NORMS[normsKey][resolvedGrade] || {})[season || 'fall'];
    return seasonData ? Math.round(seasonData.mean) : 180;
}

/**
 * Resolve the RIT overlap zone (170-200) to the correct test variant.
 * Reads the sticky cookie `mathquest_literacy_settings` if available.
 *
 * @param {number} prevRit - Prior RIT estimate
 * @param {string|number} grade - "K" | 1-5
 * @returns {"reading-k2"|"reading-2-5"} Recommended variant
 */
export function routeOverlapZone(prevRit, grade) {
    // Sticky cookie check: prefer the last variant used if available
    if (typeof window !== 'undefined' && typeof window.getCookie === 'function') {
        try {
            const raw = window.getCookie('mathquest_literacy_settings');
            if (raw) {
                const settings = JSON.parse(raw);
                if (settings && settings.last_test_variant) {
                    return settings.last_test_variant;
                }
            }
        } catch (_) { /* ignore parse errors */ }
    }

    // Grade-based default for the 170-200 overlap zone
    const gradeNum = grade === 'K' ? 0 : parseInt(String(grade), 10);

    // Grade 3+ always use 2-5, grade 1 always k2; grade 2 follows RIT threshold
    if (gradeNum >= 3) return 'reading-2-5';
    if (gradeNum <= 1) return 'reading-k2';
    // Grade 2: use RIT 185 as the crossover midpoint within the overlap zone
    return prevRit >= 185 ? 'reading-2-5' : 'reading-k2';
}

// ---------------------------------------------------------------------------
// LiteracyMapSession class
// ---------------------------------------------------------------------------

/**
 * Manages one MAP adaptive session for a literacy test variant.
 *
 * @example
 * const session = new LiteracyMapSession('reading-2-5', { grade: 3 });
 * const item = session.nextItem();
 * session.recordResponse(item.skill_id, true);
 * console.log(session.getCurrentRit());
 */
export class LiteracyMapSession {

    /**
     * @param {"reading-k2"|"reading-2-5"|"language-usage"} testVariant
     * @param {{ startingRit?: number, grade?: string|number, season?: string, ritOverlap?: boolean }} options
     */
    constructor(testVariant, options = {}) {
        this.testVariant = testVariant;
        this.grade = options.grade || null;
        this.season = options.season || 'fall';

        // Ability estimate (θ)
        if (options.startingRit != null) {
            this._theta = options.startingRit;
        } else if (this.grade) {
            this._theta = recommendStartingRit(this.grade, this.season, testVariant);
        } else {
            this._theta = 180;
        }

        /** @type {Array<{itemId:string, atom:object, correct:boolean|null, isFieldTest:boolean, area:string, b:number}>} */
        this._administered = [];

        /** Count of scored (non-field-test) items completed. */
        this._scoredCount = 0;

        /** Count of field-test items administered. */
        this._fieldTestCount = 0;

        /** Whether the session has reached the stopping rule. */
        this._complete = false;

        /**
         * Area balance tracking.
         * @type {Record<string, number>}
         */
        this.area_balance = _initAreaBalance(testVariant);

        /**
         * Active passage lock: when non-null, force next items from this passageId.
         * @type {{passageId: string, itemsRemaining: number}|null}
         */
        this._passageLock = null;

        /** LRU map: skill_id → last seen index (for variety rotation). */
        this._skillUsage = {};

        /** Items administered in order (public mirror for external consumers). */
        this.items_administered = this._administered;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Select and return the next item from the pool.
     * Returns null when the session is complete.
     *
     * @returns {import('../../../data/literacy-skills/map-quest/filter.js').SkillAtom|null}
     *   The selected atom, augmented with { _isFieldTest, _itemDifficulty, _area }.
     */
    nextItem() {
        if (this._complete) return null;

        // Stopping rule: 43 scored items reached
        if (this._scoredCount >= TARGET_SCORED_ITEMS) {
            this._complete = true;
            return null;
        }

        const atom = this._selectNextAtom();
        if (!atom) {
            this._complete = true;
            return null;
        }

        const b = bandMidpoint(atom.rit_band);
        const area = normalizeArea(atom.rit_instructional_area, this.testVariant);

        // Decide if this is a field-test item (approximately 7% of total administered)
        const totalTarget = TARGET_SCORED_ITEMS * (1 + FIELD_TEST_RATE);
        const fieldTestBudget = Math.round(TARGET_SCORED_ITEMS * FIELD_TEST_RATE);
        const isFieldTest = (this._fieldTestCount < fieldTestBudget) &&
                            (this._fieldTestCount < 3) &&    // cap at 2-3 per spec
                            (Math.random() < FIELD_TEST_RATE);

        const entry = {
            itemId: atom.skill_id,
            atom,
            correct: null,
            isFieldTest,
            area,
            b,
        };
        this._administered.push(entry);

        if (isFieldTest) {
            this._fieldTestCount++;
        }

        // Update area balance (scored and field-test both count for balance)
        this.area_balance[area] = (this.area_balance[area] || 0) + 1;

        // Mark skill in LRU
        this._skillUsage[atom.skill_id] = this._administered.length;

        // Augment atom with session metadata (does not mutate the source atom)
        return Object.assign({}, atom, {
            _isFieldTest: isFieldTest,
            _itemDifficulty: b,
            _area: area,
        });
    }

    /**
     * Record the student's response to the item most recently returned by nextItem().
     * Field-test items do not advance the scored count or update theta.
     *
     * @param {string} itemId  - skill_id of the answered item
     * @param {boolean} correct
     */
    recordResponse(itemId, correct) {
        // Find the matching open entry (correct === null)
        const entry = [...this._administered].reverse().find(
            e => e.itemId === itemId && e.correct === null
        );
        if (!entry) {
            console.warn('[LiteracyMAP] recordResponse: itemId not found or already scored:', itemId);
            return;
        }

        entry.correct = correct;

        if (!entry.isFieldTest) {
            // Update ability estimate via Rasch 1PL
            this._theta = updateTheta(this._theta, entry.b, correct);
            // Clamp to realistic RIT range
            this._theta = Math.max(120, Math.min(270, this._theta));
            this._scoredCount++;
        }
    }

    /**
     * Lock the next N items to a specific passage (item-set anchoring).
     * Called by item-set-controller.js when a passage-anchored set begins.
     *
     * @param {string} passageId
     * @param {number} itemCount - Number of items in this set (2-5)
     */
    lockPassage(passageId, itemCount) {
        this._passageLock = {
            passageId,
            itemsRemaining: Math.max(1, Math.min(5, itemCount)),
        };
    }

    /** Release any active passage lock (called when item set ends). */
    releasePassageLock() {
        this._passageLock = null;
    }

    /** @returns {number} Current RIT estimate (θ), rounded to 1 decimal. */
    getCurrentRit() {
        return Math.round(this._theta * 10) / 10;
    }

    /**
     * @returns {number} Percent of scored items completed (0–100).
     */
    getProgressPercent() {
        return Math.min(100, Math.round((this._scoredCount / TARGET_SCORED_ITEMS) * 100));
    }

    /**
     * @returns {Record<string, number>} Items administered per instructional area.
     */
    getInstructionalAreaBreakdown() {
        return Object.assign({}, this.area_balance);
    }

    /**
     * @returns {number} Percentile rank (1–99) based on 2025 norms.
     *   Returns null if grade or season are not set.
     */
    getPercentile() {
        if (!this.grade) return null;
        const resolvedGrade = resolveNormsGrade(this.testVariant, this.grade);
        if (!resolvedGrade) return null;
        const normsKey = this.testVariant === 'language-usage' ? 'language_usage' : 'reading';
        const seasonData = (NWEA_2025_NORMS[normsKey][resolvedGrade] || {})[this.season];
        if (!seasonData) return null;
        const z = (this._theta - seasonData.mean) / seasonData.sd;
        return Math.max(1, Math.min(99, Math.round(normCdf(z) * 100)));
    }

    /**
     * Compute estimated growth target (RIT points to next season's norm mean).
     * @returns {number|null}
     */
    getGrowthTarget() {
        if (!this.grade) return null;
        const resolvedGrade = resolveNormsGrade(this.testVariant, this.grade);
        if (!resolvedGrade) return null;
        const normsKey = this.testVariant === 'language-usage' ? 'language_usage' : 'reading';
        const norms = NWEA_2025_NORMS[normsKey][resolvedGrade] || {};
        // Compute growth from current season to next
        const order = ['fall', 'winter', 'spring'];
        const idx = order.indexOf(this.season);
        const nextSeason = order[idx + 1] || null;
        if (!nextSeason) return null;
        const cur = norms[this.season];
        const nxt = norms[nextSeason];
        if (!cur || !nxt) return null;
        return Math.round((nxt.mean - cur.mean) * 10) / 10;
    }

    /** @returns {boolean} True when 43 scored items have been administered. */
    isComplete() {
        return this._complete || this._scoredCount >= TARGET_SCORED_ITEMS;
    }

    /**
     * Finalize the session and return a MapResult-shaped object.
     * @returns {object}
     */
    endSession() {
        this._complete = true;
        const scored = this._administered.filter(e => !e.isFieldTest);
        const correct = scored.filter(e => e.correct === true).length;

        // Per-area RIT estimates (simplified: use final theta adjusted by area accuracy)
        const areaBreakdown = {};
        const byArea = {};
        for (const e of scored) {
            if (!byArea[e.area]) byArea[e.area] = { correct: 0, total: 0 };
            byArea[e.area].total++;
            if (e.correct) byArea[e.area].correct++;
        }
        for (const [area, data] of Object.entries(byArea)) {
            // Area-specific RIT: offset from final theta proportional to accuracy difference
            const areaAcc = data.total > 0 ? data.correct / data.total : 0.5;
            const overallAcc = scored.length > 0 ? correct / scored.length : 0.5;
            const offset = (areaAcc - overallAcc) * 10;
            areaBreakdown[area] = Math.round((this._theta + offset) * 10) / 10;
        }

        return {
            test_variant: this.testVariant,
            final_rit: this.getCurrentRit(),
            area_breakdown: areaBreakdown,
            growth_target: this.getGrowthTarget(),
            percentile: this.getPercentile(),
            norms_year: 2025,
            grade: this.grade,
            season: this.season,
            items_correct: correct,
            items_total: scored.length,
            date: new Date().toISOString().slice(0, 10),
        };
    }

    // -----------------------------------------------------------------------
    // Private: item selection
    // -----------------------------------------------------------------------

    /**
     * Select the next atom from the item pool.
     * 1. Determine the ideal RIT window around θ.
     * 2. Filter pool to that window.
     * 3. Apply area-balance enforcement: prefer under-represented areas.
     * 4. Apply EISA grade-level bias: prefer grade-level items 2:1.
     * 5. Break ties by recency (LRU) to avoid repeating.
     *
     * @returns {object|null} Selected SkillAtom or null if pool is empty
     */
    _selectNextAtom() {
        const theta = this._theta;

        // Build candidate window — widen if pool is sparse
        let pool = atomsForRitWindow(this.testVariant, [theta - SELECTION_WINDOW, theta + SELECTION_WINDOW]);
        if (pool.length === 0) {
            // Widen to full test range
            pool = atomsForRitWindow(this.testVariant, [120, 270]);
        }
        if (pool.length === 0) return null;

        // ------------------------------------------------------------------
        // Step 1: Area balance enforcement
        // ------------------------------------------------------------------
        const targetProps = AREA_PROPORTIONS[this.testVariant] || {};
        const areaKeys = Object.keys(targetProps);
        const totalAdministered = this._administered.length;

        // Compute which areas are under-represented vs target proportion
        const areaDeficit = {};
        for (const key of areaKeys) {
            const administered = this.area_balance[key] || 0;
            const target = (targetProps[key] || 0) * (totalAdministered + 1);
            areaDeficit[key] = target - administered;
        }

        // Find the most under-represented area(s)
        const maxDeficit = Math.max(...Object.values(areaDeficit));
        const neededAreas = new Set(
            areaKeys.filter(k => areaDeficit[k] >= maxDeficit - 0.5)
        );

        // Filter pool to atoms in needed areas; fall back if no matches
        const balancedPool = pool.filter(a => {
            const areaKey = normalizeArea(a.rit_instructional_area, this.testVariant);
            return neededAreas.has(areaKey);
        });
        const workingPool = balancedPool.length > 0 ? balancedPool : pool;

        // ------------------------------------------------------------------
        // Step 2: EISA grade-level weighting
        // ------------------------------------------------------------------
        // Items tagged at the student's grade level get 2:1 bias when
        // they fall within EISA_GRADE_BIAS_WINDOW RIT of current theta.
        let candidates = workingPool.slice();

        if (this.grade !== null) {
            const gradeNum = this.grade === 'K' ? 0 : parseInt(String(this.grade), 10);
            const gradeLevel = _ritForGradeLevel(gradeNum, this.testVariant);

            const isGradeLevel = (atom) => {
                const b = bandMidpoint(atom.rit_band);
                return Math.abs(b - gradeLevel) <= 10;
            };
            const isNearTheta = (atom) => {
                const b = bandMidpoint(atom.rit_band);
                return Math.abs(b - theta) <= EISA_GRADE_BIAS_WINDOW;
            };

            // Expand grade-level items that are near ability by duplicating them
            // (frequency bias: 2:1 grade-level preference)
            const expanded = [];
            for (const atom of candidates) {
                expanded.push(atom);
                if (isGradeLevel(atom) && isNearTheta(atom)) {
                    expanded.push(atom); // extra copy = 2:1 weight
                }
            }
            if (expanded.length > 0) candidates = expanded;
        }

        // ------------------------------------------------------------------
        // Step 3: Sort by proximity to θ, then break ties by LRU
        // ------------------------------------------------------------------
        candidates.sort((a, b) => {
            const distA = Math.abs(bandMidpoint(a.rit_band) - theta);
            const distB = Math.abs(bandMidpoint(b.rit_band) - theta);
            if (Math.abs(distA - distB) > 2) return distA - distB;
            // Tie-break: least recently used
            const lruA = this._skillUsage[a.skill_id] || 0;
            const lruB = this._skillUsage[b.skill_id] || 0;
            return lruA - lruB;
        });

        // Pick from the top-N candidates with slight randomness to avoid
        // deterministic selection that always shows the same question
        const topN = Math.min(5, candidates.length);
        return candidates[Math.floor(Math.random() * topN)];
    }
}

// ---------------------------------------------------------------------------
// Private helpers (module-level)
// ---------------------------------------------------------------------------

/**
 * Initialize area_balance record with zero counts for all areas in a variant.
 * @param {string} testVariant
 * @returns {Record<string, number>}
 */
function _initAreaBalance(testVariant) {
    const props = AREA_PROPORTIONS[testVariant] || {};
    const balance = {};
    for (const key of Object.keys(props)) {
        balance[key] = 0;
    }
    return balance;
}

/**
 * Return the expected RIT for a given grade level (spring norm midpoint).
 * Used by EISA weighting to identify "grade-level" items.
 * @param {number} gradeNum - 0=K, 1-12
 * @param {string} testVariant
 * @returns {number}
 */
function _ritForGradeLevel(gradeNum, testVariant) {
    const gradeStr = gradeNum === 0 ? 'K' : String(gradeNum);
    const normsKey = testVariant === 'language-usage' ? 'language_usage' : 'reading';
    const normsForVariant = NWEA_2025_NORMS[normsKey] || {};
    // Find the resolved grade key
    const resolvedKey = resolveNormsGrade(testVariant, gradeStr);
    if (!resolvedKey) return 180;
    const seasonData = (normsForVariant[resolvedKey] || {})['spring'];
    return seasonData ? seasonData.mean : 180;
}
