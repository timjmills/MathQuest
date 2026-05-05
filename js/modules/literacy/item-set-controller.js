// item-set-controller.js — Literacy Quest passage-anchored item-set session.
//
// Manages a passage + its associated 3-5 items through the lifecycle of one
// Reading 2-5 item set. Anti-spoiler sequencing, forward/back navigation,
// and completion tracking all live here.
//
// The session state is stored on the PassageSession INSTANCE — NOT in the
// shared state object. However, the active session is mirrored to
// state.passageSession so literacy-question-render.js can read it without
// a direct import of this module.
//
// Exports:
//   class PassageSession

// ---------------------------------------------------------------------------
// Topological sort for anti-spoiler sequencing
// ---------------------------------------------------------------------------

/**
 * Kahn's algorithm topological sort over a dependency graph.
 * Returns a sorted array of ids, or the original order if a cycle is detected.
 *
 * @param {string[]} ids        - All node IDs
 * @param {Map<string, string[]>} edges - adjacency: id → [ids that MUST come AFTER it]
 * @returns {string[]} Sorted ids (nodes with no dependents first)
 */
function topoSort(ids, edges) {
    // Build in-degree map
    const inDegree = new Map(ids.map(id => [id, 0]));
    for (const [src, targets] of edges) {
        for (const tgt of targets) {
            if (inDegree.has(tgt)) {
                inDegree.set(tgt, inDegree.get(tgt) + 1);
            }
        }
    }

    const queue = ids.filter(id => inDegree.get(id) === 0);
    const result = [];
    const visited = new Set();

    while (queue.length > 0) {
        const node = queue.shift();
        if (visited.has(node)) continue;
        visited.add(node);
        result.push(node);
        for (const neighbor of (edges.get(node) || [])) {
            const newDeg = (inDegree.get(neighbor) || 0) - 1;
            inDegree.set(neighbor, newDeg);
            if (newDeg === 0) queue.push(neighbor);
        }
    }

    // Cycle detected or incomplete: fall back to original order
    if (result.length !== ids.length) {
        return ids.slice();
    }
    return result;
}

// ---------------------------------------------------------------------------
// Anti-spoiler sequencing rules
// ---------------------------------------------------------------------------

/**
 * Determine the "weight" of a question type for anti-spoiler ordering.
 * Lower weight = place earlier.
 *
 * Rules:
 *  - Literal recall / detail questions: weight 1 (always first)
 *  - Text-evidence / hot-text / selectable questions: weight 2
 *  - Character motivation, cause/effect: weight 3
 *  - Main idea / author's purpose / theme: weight 4 (always last)
 *
 * @param {object} question - Question object from generateLiteracyQuestion()
 * @returns {number} 1-4
 */
function spoilerWeight(question) {
    const type = (question.question_type || question.answerType || '').toLowerCase();
    const stem = (question.stem || question.text || '').toLowerCase();

    if (type === 'selectable_text' || type === 'tap_hotspot') return 2;
    if (type === 'multi_select') return 2;

    // Stem-based heuristics
    if (/main idea|central idea|author.{0,10}purpose|theme|message|lesson/.test(stem)) return 4;
    if (/motivation|why did|how does.{0,20}feel|character trait/.test(stem)) return 3;
    if (/according to|based on the|which detail|text evidence|quote from/.test(stem)) return 2;

    return 1;
}

/**
 * Build the dependency edge map for anti-spoiler sequencing.
 * Item A depends on item B (B must come BEFORE A) when:
 *  - A's spoilerWeight > B's spoilerWeight, OR
 *  - A.spoilers_for contains B.id (explicit spoiler declaration from item author)
 *
 * Returns a Map: id → [ids that must come AFTER this id].
 *
 * @param {object[]} items
 * @returns {Map<string, string[]>}
 */
function buildSpoilerEdges(items) {
    const edges = new Map(items.map(q => [_itemId(q), []]));

    for (const item of items) {
        const id = _itemId(item);

        // Explicit author-declared spoilers: item must come AFTER the items it spoils
        const declaredSpoilees = item.spoilers_for || [];
        for (const spoiledId of declaredSpoilees) {
            // spoiledId must come BEFORE id → edge: spoiledId → id (id depends on spoiledId)
            if (edges.has(spoiledId)) {
                edges.get(spoiledId).push(id);
            }
        }
    }

    // Weight-based ordering: higher-weight items must come after lower-weight items
    for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
            const wI = spoilerWeight(items[i]);
            const wJ = spoilerWeight(items[j]);
            const idI = _itemId(items[i]);
            const idJ = _itemId(items[j]);
            if (wI < wJ) {
                // i comes before j: edge i → j
                if (!edges.get(idI).includes(idJ)) edges.get(idI).push(idJ);
            } else if (wJ < wI) {
                // j comes before i: edge j → i
                if (!edges.get(idJ).includes(idI)) edges.get(idJ).push(idI);
            }
        }
    }

    return edges;
}

/**
 * Extract a stable string ID from a question object.
 * @param {object} q
 * @returns {string}
 */
function _itemId(q) {
    return q.id || q.skill_id || q.skillLabel || String(Math.random());
}

// ---------------------------------------------------------------------------
// Dual-passage rendering helper
// ---------------------------------------------------------------------------

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _passageInnerHtml(passage, label) {
    if (!passage) return '';
    const title = passage.title || passage.id || label || '';
    const paragraphs = passage.paragraphs || (passage.text ? [passage.text] : []);
    const bodyHtml = paragraphs.map(p => `<p class="lq-dual-passage-paragraph">${_esc(p)}</p>`).join('');
    const labelHtml = label
        ? `<div class="lq-dual-passage-label">Passage ${_esc(label)}</div>`
        : '';
    const titleHtml = title
        ? `<div class="lq-dual-passage-title">${_esc(title)}</div>`
        : '';
    const lexileHtml = passage.lexile != null
        ? `<div class="lq-dual-passage-lexile">Lexile ${_esc(String(passage.lexile))}</div>`
        : '';
    return `${labelHtml}${titleHtml}${lexileHtml}<div class="lq-dual-passage-body">${bodyHtml}</div>`;
}

/**
 * Render two passages side-by-side (or stacked on narrow screens).
 *
 * Each item in a dual-passage item-set may carry an optional `passage_ref`
 * field of `'A' | 'B' | 'both'` that downstream UIs can use to indicate which
 * passage the current item references. This helper just renders the two
 * passages; the per-item annotation is the caller's responsibility.
 *
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Passage} passageA
 * @param {import('../../../docs/literacy-quest/DATA_MODEL').Passage} passageB
 * @param {Element} container - DOM element to render into (cleared first)
 */
export function renderDualPassage(passageA, passageB, container) {
    if (!container) return;
    container.innerHTML = '';

    const wrap = document.createElement('div');
    wrap.className = 'lq-dual-passage';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Two passages for comparison');

    const colA = document.createElement('div');
    colA.className = 'lq-dual-passage-col lq-dual-passage-col--a';
    colA.innerHTML = _passageInnerHtml(passageA, 'A');

    const colB = document.createElement('div');
    colB.className = 'lq-dual-passage-col lq-dual-passage-col--b';
    colB.innerHTML = _passageInnerHtml(passageB, 'B');

    wrap.appendChild(colA);
    wrap.appendChild(colB);
    container.appendChild(wrap);
}

// ---------------------------------------------------------------------------
// PassageSession class
// ---------------------------------------------------------------------------

/**
 * Manages a passage-anchored multi-item session (Reading 2-5 item sets).
 *
 * @example
 * const session = new PassageSession(passage, [q1, q2, q3, q4]);
 * const item = session.getCurrentItem();
 * session.submitAnswer('The character felt curious.');
 * session.nextItem();
 */
export class PassageSession {

    /**
     * @param {import('../../../docs/literacy-quest/DATA_MODEL').Passage} passage
     * @param {object[]} items - Array of Question objects (3-5 typical)
     * @param {object} [opts]
     * @param {import('../../../docs/literacy-quest/DATA_MODEL').Passage} [opts.passageB]
     *        Optional second passage for dual-passage item sets (MAP
     *        dual-passage-compare). When provided, items MAY include a
     *        `passage_ref` field of `'A' | 'B' | 'both'`.
     */
    constructor(passage, items, opts = {}) {
        /** @type {import('../../../docs/literacy-quest/DATA_MODEL').Passage} */
        this.passage = passage;

        /**
         * Optional second passage. Null for single-passage item sets (the
         * legacy/default shape). Existing callers that pass only (passage,
         * items) keep working unchanged.
         * @type {import('../../../docs/literacy-quest/DATA_MODEL').Passage|null}
         */
        this.passageB = opts && opts.passageB ? opts.passageB : null;

        /** Original items before sequencing (kept for reference). */
        this._originalItems = items.slice();

        /**
         * Items reordered by anti-spoiler rules.
         * @type {object[]}
         */
        this.items = this.applyAntiSpoilerOrder(items);

        /** 0-based index into this.items. */
        this.currentItemIndex = 0;

        /**
         * Responses keyed by item ID: { correct: boolean, answer: any, ts: number }
         * @type {Record<string, {correct:boolean, answer:any, ts:number}>}
         */
        this._responses = {};

        /**
         * Set of item IDs that have been answered.
         * @type {Set<string>}
         */
        this.answeredItems = new Set();

        /** True once all items have been answered or the session is explicitly ended. */
        this._complete = false;

        /**
         * Blob URLs created during this session (e.g., for audio assets).
         * Revoked on endSession().
         * @type {string[]}
         */
        this._blobUrls = [];

        // Mirror to state.passageSession for compatibility with literacy-question-render.js
        this._mirrorToState();
    }

    // -----------------------------------------------------------------------
    // Navigation
    // -----------------------------------------------------------------------

    /**
     * @returns {object|null} Current item or null if session is complete.
     */
    getCurrentItem() {
        if (this._complete) return null;
        if (this.currentItemIndex >= this.items.length) return null;
        return this.items[this.currentItemIndex];
    }

    /**
     * Advance to the next item.
     * @returns {object|null} The new current item, or null if session complete.
     */
    nextItem() {
        if (this.currentItemIndex < this.items.length - 1) {
            this.currentItemIndex++;
        } else {
            this._complete = true;
        }
        this._mirrorToState();
        return this.getCurrentItem();
    }

    /**
     * Go back to the previous item (allowed; does not re-score).
     * @returns {object|null} The previous item, or null if already at start.
     */
    prevItem() {
        if (this.currentItemIndex > 0) {
            this.currentItemIndex--;
            this._mirrorToState();
            return this.getCurrentItem();
        }
        return null;
    }

    /**
     * Check if back-navigation is available.
     * @returns {boolean}
     */
    canGoBack() {
        return this.currentItemIndex > 0;
    }

    // -----------------------------------------------------------------------
    // Answering
    // -----------------------------------------------------------------------

    /**
     * Submit an answer for the current item and advance to the next.
     * Returns the correctness result.
     *
     * @param {*} answer - Student's answer value
     * @param {boolean} correct - Whether the answer is correct (checked externally by literacy-answer-check.js)
     * @returns {{ correct: boolean, itemId: string }}
     */
    submitAnswer(answer, correct) {
        const item = this.getCurrentItem();
        if (!item) return { correct: false, itemId: null };

        const itemId = _itemId(item);
        this._responses[itemId] = { correct: !!correct, answer, ts: Date.now() };
        this.answeredItems.add(itemId);
        this._mirrorToState();

        return { correct: !!correct, itemId };
    }

    /**
     * Directly mark an item as answered (for cases where the question render
     * handles the scoring externally and just needs to register completion).
     *
     * @param {string} id - Item ID
     * @param {boolean} correct
     */
    markItemAnswered(id, correct) {
        this._responses[id] = {
            correct: !!correct,
            answer: null,
            ts: Date.now(),
        };
        this.answeredItems.add(id);
        this._mirrorToState();
    }

    // -----------------------------------------------------------------------
    // Progress reporting
    // -----------------------------------------------------------------------

    /**
     * @returns {{ current: number, total: number, percentComplete: number }}
     */
    getProgress() {
        const total = this.items.length;
        const answered = this.answeredItems.size;
        return {
            current: this.currentItemIndex + 1,
            total,
            answered,
            percentComplete: total > 0 ? Math.round((answered / total) * 100) : 0,
        };
    }

    /**
     * @returns {number} Number of correctly answered items.
     */
    getCorrectCount() {
        return Object.values(this._responses).filter(r => r.correct).length;
    }

    /**
     * @returns {boolean} True when all items have been answered.
     */
    isComplete() {
        if (this._complete) return true;
        return this.answeredItems.size >= this.items.length;
    }

    /**
     * Get the response for a specific item ID.
     * @param {string} id
     * @returns {{ correct: boolean, answer: any, ts: number }|null}
     */
    getResponse(id) {
        return this._responses[id] || null;
    }

    /**
     * Get all responses.
     * @returns {object}
     */
    getAllResponses() {
        return Object.assign({}, this._responses);
    }

    // -----------------------------------------------------------------------
    // Dual-passage helpers
    // -----------------------------------------------------------------------

    /**
     * @returns {boolean} True when this session was constructed with a second passage.
     */
    isDualPassage() {
        return !!this.passageB;
    }

    /**
     * Render this session's passage(s) into the given container.
     * Single-passage sessions delegate to the existing renderPassage code path
     * via the parent caller (we don't import passage-render here to avoid a
     * cross-module hard dep). Dual-passage sessions render via renderDualPassage.
     *
     * @param {Element} container
     */
    renderPassagesInto(container) {
        if (!container) return;
        if (this.passageB) {
            renderDualPassage(this.passage, this.passageB, container);
        }
        // Single-passage path is intentionally left to the existing caller —
        // breaking it would regress every existing item-set screen.
    }

    /**
     * Resolve which passage a given item refers to. Items without an explicit
     * `passage_ref` default to 'A' for back-compat.
     *
     * @param {object} item
     * @returns {'A'|'B'|'both'}
     */
    getItemPassageRef(item) {
        if (!item) return 'A';
        const ref = item.passage_ref;
        if (ref === 'B' || ref === 'both') return ref;
        return 'A';
    }

    // -----------------------------------------------------------------------
    // Anti-spoiler ordering
    // -----------------------------------------------------------------------

    /**
     * Reorder items so that later items don't reveal answers to earlier ones.
     * Applied once at construction; never reshuffled mid-session.
     *
     * Algorithm:
     * 1. Assign spoilerWeight to each item (literal < evidence < motivation < main-idea).
     * 2. Build dependency edges (item with higher weight must come after lower weight).
     * 3. Topological sort preserving original order on ties.
     *
     * @param {object[]} items
     * @returns {object[]} Reordered items
     */
    applyAntiSpoilerOrder(items) {
        if (items.length <= 1) return items.slice();

        const ids = items.map(_itemId);
        const idToItem = new Map(items.map(q => [_itemId(q), q]));
        const edges = buildSpoilerEdges(items);
        const sortedIds = topoSort(ids, edges);

        return sortedIds.map(id => idToItem.get(id)).filter(Boolean);
    }

    // -----------------------------------------------------------------------
    // Blob URL management
    // -----------------------------------------------------------------------

    /**
     * Register a blob URL for cleanup on session end.
     * @param {string} url
     */
    registerBlobUrl(url) {
        if (url && url.startsWith('blob:')) {
            this._blobUrls.push(url);
        }
    }

    // -----------------------------------------------------------------------
    // Session teardown
    // -----------------------------------------------------------------------

    /**
     * End the session: clear state.passageSession and revoke any blob URLs.
     * Call this when the item set is complete and control returns to the
     * main session loop.
     */
    endSession() {
        this._complete = true;

        // Revoke any blob URLs created during this session
        for (const url of this._blobUrls) {
            try {
                URL.revokeObjectURL(url);
            } catch (_) { /* ignore */ }
        }
        this._blobUrls = [];

        // Clear the state mirror
        if (typeof state !== 'undefined' && state !== null) {
            state.passageSession = null;
        } else {
            // state may not be in scope; use dynamic lookup via window
            try {
                if (window._lqState) window._lqState.passageSession = null;
            } catch (_) { /* ignore */ }
        }
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    /**
     * Mirror session state to state.passageSession for literacy-question-render.js.
     * Uses a dynamic property-set approach to avoid a hard import of state.js
     * (which would create a circular dependency layer violation).
     */
    _mirrorToState() {
        const mirror = {
            passage: this.passage,
            passageB: this.passageB,
            isDualPassage: !!this.passageB,
            items: this.items,
            currentItemIndex: this.currentItemIndex,
            answeredItems: this.answeredItems,
            antiSpoilerOrder: this.items.map(_itemId),
            passageId: this.passage ? this.passage.id : null,
            passageBId: this.passageB ? this.passageB.id : null,
            lexile: this.passage ? this.passage.lexile : null,
            ritBand: this.passage ? this.passage.recommended_rit_band : null,
            _session: this,  // back-reference so render code can call session methods
        };

        // Prefer direct state import; fall back to window._lqState
        if (typeof state !== 'undefined' && state !== null) {
            state.passageSession = mirror;
        } else {
            try { if (window._lqState) window._lqState.passageSession = mirror; } catch (_) {}
        }
    }
}

// ---------------------------------------------------------------------------
// Module-level state reference
// ---------------------------------------------------------------------------
// state.js is deliberately not imported here to avoid a circular dependency
// (item-set-controller is at L3; state is at L0 and is safe to import — but
// we use a lazy reference via the try/catch pattern above to keep the module
// tree clean). In practice, globals.js attaches state to window._lqState
// before any literacy module runs, so the fallback path in _mirrorToState()
// is the live path at runtime.
//
// If the architecture moves state to a shared import path in a future phase,
// replace the _mirrorToState() dynamic lookup with:
//   import { state } from '../state.js';
//
// No other change is needed.

// Expose a module-level 'state' variable that will be set by the initializer
// if imported directly (for test environments that import this module in isolation).
let state = null;

/**
 * Inject the shared state reference. Called by literacy-init.js after import.
 * @param {object} sharedState - The shared state object from state.js
 */
export function setStateRef(sharedState) {
    state = sharedState;
}
