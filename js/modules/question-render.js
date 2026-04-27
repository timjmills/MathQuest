import { state } from './state.js';
import { getSkillGrade, gradeCircleHTML } from './data.js';
import { trackSkillAnswer, resetAttemptTracking } from './answer-check.js';
import {
    isMapTestMode,
    isFirstAttempt,
    markFirstAttempt,
    hasAllCorrectFired,
    markAllCorrectFired,
    resetRetryState,
    buildRetryMessage,
} from './widget-retry.js';

// Escape HTML-significant characters so q.text strings (which may contain
// literal "<", ">", "&") render as plain text when inserted via innerHTML.
function _escapeHtmlForQuestion(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Convert q.text (plain text) into safe HTML, replacing literal ___ runs
// with a styled inline answer-blank span. Preserves &lt;, &gt;, &amp;.
function formatQuestionTextForScreen(text) {
    if (text == null) return '';
    const escaped = _escapeHtmlForQuestion(text);
    // Match runs of 3 or more underscores so "_____ is composite" also
    // becomes a blank.
    return escaped.replace(/_{3,}/g, '<span class="answer-blank-inline"></span>');
}

// For answerType === "inline-cloze": replace each ___ run with a real
// <select class="cloze-cell"> dropdown the student picks from. The choices
// for blank N come from q.clozeOptions[N] (Array<string>). This is a
// reusable primitive — any skill that wants "pick the right value for each
// blank in the sentence" can use it.
function formatQuestionTextForInlineCloze(text, clozeOptions) {
    if (text == null) return '';
    const escaped = _escapeHtmlForQuestion(text);
    let i = 0;
    return escaped.replace(/_{3,}/g, () => {
        const idx = i++;
        const opts = (Array.isArray(clozeOptions) && Array.isArray(clozeOptions[idx]))
            ? clozeOptions[idx]
            : [];
        // Lead with a blank "Pick…" so a select isn't pre-committed to its
        // first option.
        const optionTags = ['<option value="">Pick…</option>']
            .concat(opts.map(v => `<option value="${_escapeHtmlForQuestion(String(v))}">${_escapeHtmlForQuestion(String(v))}</option>`))
            .join('');
        return `<select class="cloze-cell" data-cloze-idx="${idx}" `
            + `style="display:inline-block;height:36px;border:none;border-bottom:3px solid #1565c0;`
            + `background:transparent;font:inherit;font-weight:700;color:#1565c0;text-align:center;`
            + `margin:0 6px;padding:0 6px;outline:none;vertical-align:baseline;cursor:pointer;" `
            + `autocomplete="off">${optionTags}</select>`;
    });
}

// For answerType === "inline-blanks": replace each ___ run with a real
// <input class="ib-cell"> element so the student can type DIRECTLY into
// the question text. Each input gets a 0-based data-i index used by the
// answer checker. cellWidths (optional) sets per-cell maxlength sizing.
function formatQuestionTextForInlineBlanks(text, cellWidths) {
    if (text == null) return '';
    const escaped = _escapeHtmlForQuestion(text);
    let i = 0;
    return escaped.replace(/_{3,}/g, () => {
        const idx = i++;
        const w = (cellWidths && cellWidths[idx]) || 4;
        // Width sized to roughly fit w chars; maxlength is generous so larger
        // intermediate products fit too.
        const px = Math.max(48, w * 16);
        return `<input type="text" class="ib-cell" data-i="${idx}" maxlength="${Math.max(3, w + 2)}" `
            + `style="display:inline-block;width:${px}px;height:34px;border:none;border-bottom:3px solid #1565c0;`
            + `background:transparent;font:inherit;font-weight:700;color:#1565c0;text-align:center;`
            + `margin:0 4px;padding:0 2px;outline:none;vertical-align:baseline;" autocomplete="off" inputmode="numeric">`;
    });
}

// ===== Click-to-enlarge zoom modal helpers =====

// Walk a container's descendants and compute the smallest bounding rect
// that contains all VISIBLE leaf elements (text/img/svg/canvas/input/etc.).
// This is used by the zoom modal to size text-based visuals based on
// what's actually visible (not the wide empty source container).
//
// Strategy: for elements that have direct text node children, use the
// Range API to measure the rendered TEXT GLYPHS (not the surrounding
// block-level box). A `<div>` with `display:block` + `text-align:center`
// has a bounding rect that spans its full parent width even though only
// a small centered string is actually painted — using the Range rect
// gives us the true painted-content rect. Container divs with no text
// of their own contribute nothing (their children are walked instead).
//
// Returns { left, top, right, bottom, width, height } in viewport coords,
// or null if no visible content was found.
function measureContentRect(root, fallbackRect) {
    if (!root) return null;
    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    let found = false;
    // Tags that always count as "content" regardless of text children.
    // Compared in LOWER case — HTMLElement.tagName is upper, but SVG
    // elements (in HTML documents) report lower-case, so normalize.
    const RASTER = new Set(['svg', 'img', 'canvas', 'input', 'button', 'textarea', 'select']);
    const win = root.ownerDocument && root.ownerDocument.defaultView;
    const doc = root.ownerDocument;
    // Walk manually (not querySelectorAll) so we can prune at SVG/img/canvas
    // boundaries — children of an <svg> already contribute via the parent's
    // rect; recursing into them only produces noisy duplicate measurements.
    const stack = [root];
    while (stack.length) {
        const el = stack.pop();
        if (!el || el.nodeType !== 1) continue;
        if (el.id && typeof el.id === 'string' && el.id.endsWith('Host')) continue;
        const hasContains = el.classList && typeof el.classList.contains === 'function';
        if (hasContains && (el.classList.contains('zoom-icon-btn') || el.classList.contains('zoom-close'))) continue;
        const cs = win ? win.getComputedStyle(el) : null;
        if (cs && (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0)) continue;
        const tag = (el.tagName || '').toLowerCase();
        const isRaster = RASTER.has(tag);
        // Collect non-empty direct text node children (used both for the
        // hasOwnText check and for the Range API measurement below).
        const ownTextNodes = [];
        for (let n = el.firstChild; n; n = n.nextSibling) {
            if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) ownTextNodes.push(n);
        }
        if (isRaster) {
            // Raster nodes paint their full rect — use it directly.
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
                if (r.left < minL) minL = r.left;
                if (r.top < minT) minT = r.top;
                if (r.right > maxR) maxR = r.right;
                if (r.bottom > maxB) maxB = r.bottom;
                found = true;
            }
        } else if (ownTextNodes.length && doc && typeof doc.createRange === 'function') {
            // Measure the actual painted glyphs via the Range API. This
            // ignores the surrounding block-level empty space (e.g. a
            // full-width centered <div> reports its narrow text rect, not
            // its wide block rect).
            try {
                const range = doc.createRange();
                for (const tn of ownTextNodes) {
                    range.selectNodeContents(tn);
                    const r = range.getBoundingClientRect();
                    if (r.width > 0 && r.height > 0) {
                        if (r.left < minL) minL = r.left;
                        if (r.top < minT) minT = r.top;
                        if (r.right > maxR) maxR = r.right;
                        if (r.bottom > maxB) maxB = r.bottom;
                        found = true;
                    }
                }
                range.detach && range.detach();
            } catch (_e) {
                // Defensive: if Range fails for any reason, fall back to
                // the element's own rect so we still record SOMETHING.
                const r = el.getBoundingClientRect();
                if (r.width > 0 && r.height > 0) {
                    if (r.left < minL) minL = r.left;
                    if (r.top < minT) minT = r.top;
                    if (r.right > maxR) maxR = r.right;
                    if (r.bottom > maxB) maxB = r.bottom;
                    found = true;
                }
            }
        }
        // Pure container divs (no own text, not raster) contribute nothing
        // directly — their painted content is measured via descendants.
        // Don't recurse INTO an SVG/img/canvas — the parent rect already
        // covers all its visible content.
        if (isRaster) continue;
        for (let i = el.children.length - 1; i >= 0; i--) stack.push(el.children[i]);
    }
    if (!found) return null;
    // Clamp the content rect to lie WITHIN the source rect (defensive — if
    // a child element overflows, we still scale based on what's actually
    // inside the source's own area).
    if (fallbackRect) {
        if (minL < fallbackRect.left) minL = fallbackRect.left;
        if (minT < fallbackRect.top) minT = fallbackRect.top;
        if (maxR > fallbackRect.right) maxR = fallbackRect.right;
        if (maxB > fallbackRect.bottom) maxB = fallbackRect.bottom;
    }
    const width = Math.max(0, maxR - minL);
    const height = Math.max(0, maxB - minT);
    if (width <= 0 || height <= 0) return null;
    return { left: minL, top: minT, right: maxR, bottom: maxB, width, height };
}

// Shared list of answer types where clicking the visual IS the answer
// mechanism (so we should NOT hijack clicks for zoom on the whole visual —
// instead a small magnifier icon button is added). Exported so worksheet
// mode can reuse the same classification.
export const ZOOM_CLICK_IS_ANSWER_TYPES = [
    'hot-spot',
    'place-symmetry-lines',
    'multi-select-check',
    'multi-select',
    'fraction-bar-shade',
    'shade-parts',
    'ten-frame',
    'clock-set',
    'clock-choice',
    'coord-plot',
    'coord-input',
    'coordinate-multi',
    'dnd-generic',
    'dnd-categorize',
    'shape-match',
    'pv-build',
    'pv-digit-drag',
    'ten-frame-build',
    'base10-build',
    'graph-builder',
    'drag-fill',
    'grid-fill',
    'col-subtract',
    'col-arith',
    'array-builder',
    'nl-drag',
    'tchart-drag',
    't-chart',
    'divisibility-sort',
    'compose-fraction-tiles',
    'compose-shape-blocks',
    'factor-pairs',
    'factor-links',
    'number-line-place',
    'number-line-extended',
    'odd-even-select',
    'classification',
    'inline-cloze',
    'image-hotspot',
    'build-expr',
    'box-division'
];

// Opens an overlay containing a copy of the supplied innerHTML and scales
// it to 2× the original visual's rendered size (capped at 90% viewport so
// it always fits). Click outside the content or press Esc to close.
// Exported so worksheet mode can reuse the same modal.
//
// `opts.interactive` (default false): when true, clicking the dim backdrop
// does NOT close the modal — only the explicit ✕ button or Esc do. This
// protects interactive widgets (coord-plot, hot-spot, ten-frame, etc.)
// from accidental closes when the student clicks just outside the SVG.
export function openZoomModal(content, sourceEl, opts) {
    const options = opts || {};
    const isInteractive = !!options.interactive;
    // Don't stack overlays — close any existing one first.
    document.querySelectorAll('.zoom-overlay').forEach(o => o.remove());

    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay' + (isInteractive ? ' zoom-interactive' : '');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'zoom-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    // Always show the ✕ glyph prominently; interactive mode adds an extra-
    // strong style hint via CSS so kids see the only-way-out clearly.
    closeBtn.textContent = '✕';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'zoom-content';
    contentDiv.innerHTML = content;

    // Track source-side listeners so we can detach them on dispose (clone-
    // side listeners are GC'd automatically when the overlay is removed).
    const sourceListeners = [];

    overlay.appendChild(closeBtn);
    overlay.appendChild(contentDiv);

    function dispose() {
        document.removeEventListener('keydown', escClose);
        // Detach source-side sync listeners (clone-side listeners are GC'd
        // automatically when the overlay node is removed from the DOM).
        sourceListeners.forEach(({ el, type, fn }) => {
            try { el.removeEventListener(type, fn); } catch (_e) {}
        });
        sourceListeners.length = 0;
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    function escClose(e) {
        if (e.key === 'Escape') dispose();
    }

    closeBtn.addEventListener('click', dispose);
    if (!isInteractive) {
        overlay.addEventListener('click', e => {
            // Close when clicking the backdrop (not the white content card).
            // SKIPPED for interactive modals (coord-plot etc.) so a stray
            // click outside the SVG doesn't lose the student's progress —
            // they must use the ✕ button or Esc.
            if (e.target === overlay) dispose();
        });
    }
    document.addEventListener('keydown', escClose);

    document.body.appendChild(overlay);

    // Scale to 2× the source's rendered size, capped at 90% viewport.
    // Strategy:
    //   (a) If source contains an SVG/img/canvas, scale THAT element (best
    //       result — preserves crispness, no nested-transform layout issues).
    //   (b) Otherwise (div-only visuals like factor grids, pill rows),
    //       wrap the cloned content in a CSS transform: scale(N) so the
    //       whole structure scales together.
    if (sourceEl) {
        // (a) Measure every raster/svg candidate. We scale ALL of them by the
        // SAME factor so side-by-side visuals (e.g. two fraction circles in
        // equiv_frac_visual) retain their original size ratio in the zoom
        // modal. Previously only the "biggest" element was resized, leaving
        // sibling SVGs at 1× and making the comparison look lopsided.
        const candidates = Array.from(sourceEl.querySelectorAll('svg, img, canvas'));
        const sourceRects = candidates.map(el => el.getBoundingClientRect());
        let biggestArea = 0;
        let biggestRect = null;
        sourceRects.forEach(r => {
            const area = r.width * r.height;
            if (area > biggestArea) { biggestArea = area; biggestRect = r; }
        });

        if (biggestRect) {
            // SVG / img / canvas path: target 2×, capped at viewport-fit so
            // the WHOLE visual stays visible inside the modal (no scroll,
            // no clipping). SVG visuals (clocks, fraction circles, geometry
            // diagrams, coordinate planes) are already rendered at an
            // intentional display size in the source, so 2× is plenty —
            // going larger just clips the bottom (e.g. a 240px clock × 4 =
            // 960px overflows 90vh on a 720p viewport).
            //
            // Path B (div-only) uses an UNLIMITED fitScale because its
            // contentRect from the Range API often measures only ~120px,
            // so a 2× cap there leaves the modal looking unchanged. The
            // two paths diverge by design.
            //
            // Padding allowance covers: modal padding (32px), close-button
            // offset (~50px), title or skill label above the visual, plus
            // breathing room so square SVGs (clock, fraction circle) aren't
            // kissing the modal edges. Setting this too low caused the
            // clock zoom to clip + show a scrollbar on shorter viewports.
            const padding = 180;
            const maxW = window.innerWidth * 0.90 - padding;
            const maxH = window.innerHeight * 0.90 - padding;
            const fitScale = Math.min(
                maxW / Math.max(1, biggestRect.width),
                maxH / Math.max(1, biggestRect.height)
            );
            const scale = Math.min(2, Math.max(1, fitScale));
            // Scale every cloned candidate by the SAME factor, keyed by
            // position in DOM order so the mapping source→clone is stable.
            const cloneCandidates = Array.from(contentDiv.querySelectorAll('svg, img, canvas'));
            candidates.forEach((_src, i) => {
                const cloneTarget = cloneCandidates[i];
                if (!cloneTarget) return;
                const r = sourceRects[i];
                const tw = Math.round(r.width * scale);
                const th = Math.round(r.height * scale);
                cloneTarget.style.setProperty('width', tw + 'px', 'important');
                cloneTarget.style.setProperty('height', th + 'px', 'important');
                cloneTarget.style.setProperty('max-width', 'none', 'important');
                cloneTarget.style.setProperty('max-height', 'none', 'important');
                if (cloneTarget.tagName.toLowerCase() === 'svg') {
                    cloneTarget.setAttribute('width', String(tw));
                    cloneTarget.setAttribute('height', String(th));
                }
                let p = cloneTarget.parentElement;
                while (p && p !== contentDiv) {
                    p.style.setProperty('max-width', 'none', 'important');
                    p.style.setProperty('max-height', 'none', 'important');
                    p.style.setProperty('width', 'auto', 'important');
                    p = p.parentElement;
                }
            });
        } else {
            // (b) Div-only visual (text columns, fact-family grids, expanded
            // pills, etc.). The source element is often a WIDE container
            // (e.g. visualAid is a full-width card) with the actual visible
            // content centered inside as a narrow inline-block. Scaling the
            // wide-but-mostly-empty source produces a giant card with tiny
            // centered content — looks like no zoom happened.
            //
            // Fix: measure the SMALLEST bounding rect that contains all
            // visible TEXT/leaf elements ("content rect") and scale based
            // on THAT, not the source rect. The popup card auto-sizes to
            // the scaled content.
            const sourceRect = sourceEl.getBoundingClientRect();
            const contentRect = measureContentRect(sourceEl, sourceRect);
            const useRect = (contentRect && contentRect.width > 0 && contentRect.height > 0)
                ? contentRect : sourceRect;
            if (useRect.width > 0 && useRect.height > 0) {
                // Fill the viewport — same rule as path A above. Tight
                // contentRect (via Range API) means small visuals like
                // Column Subtraction (~120×140) scale up generously
                // (~4-5×), while wide visuals (already-big number lines)
                // scale just enough to fit. Never shrink below 1×.
                const padding = 80;
                const maxW = window.innerWidth * 0.90 - padding;
                const maxH = window.innerHeight * 0.90 - padding;
                const fitScale = Math.min(
                    maxW / Math.max(1, useRect.width),
                    maxH / Math.max(1, useRect.height)
                );
                const scale = Math.max(1, fitScale);
                const scaledW = Math.round(useRect.width * scale);
                const scaledH = Math.round(useRect.height * scale);
                // How far into the source the content starts (used to
                // translate the inner clone so the visible content lands
                // inside the outer's measured area instead of being
                // pushed out by the source's empty padding).
                const offsetX = useRect.left - sourceRect.left;
                const offsetY = useRect.top - sourceRect.top;
                // Outer reserves the SCALED CONTENT dimensions (so the card
                // grows to the visible-content size, not the wide source).
                const outer = document.createElement('div');
                outer.style.cssText =
                    `width:${scaledW}px;height:${scaledH}px;` +
                    `position:relative;overflow:visible;`;
                // Inner is the original SOURCE-sized box, scaled visually,
                // and translated so the content rect lands at outer's 0,0.
                const inner = document.createElement('div');
                inner.style.cssText =
                    `width:${sourceRect.width}px;height:${sourceRect.height}px;` +
                    `transform:translate(${-offsetX * scale}px,${-offsetY * scale}px) scale(${scale});` +
                    `transform-origin:top left;` +
                    `position:absolute;top:0;left:0;`;
                // MOVE existing child nodes (don't re-parse innerHTML — that
                // would clone-by-string and destroy the live element refs we
                // bind sync listeners to below). appendChild moves nodes.
                while (contentDiv.firstChild) inner.appendChild(contentDiv.firstChild);
                outer.appendChild(inner);
                contentDiv.appendChild(outer);
            }
        }
    }

    // ── Two-way sync between modal clones and source page inputs ──
    // Run AFTER scaling so we operate on the final clone DOM. The modal
    // contains a CLONE of the visual, so its inputs/buttons share the same
    // `id` attributes as the source. Submit/check logic reads by id from
    // the document and may grab the wrong element. Strip ids from clones,
    // map clone↔source by old-id (DOM-order fallback), and bind listeners
    // so user edits in the modal flow back to the source-of-truth elements
    // before window.submitAnswer() / etc. read them.
    if (sourceEl) {
        const sourceInteractives = Array.from(
            sourceEl.querySelectorAll('input, textarea, select, button')
        );
        const idToSource = new Map();
        sourceInteractives.forEach(s => {
            if (s.id && !idToSource.has(s.id)) idToSource.set(s.id, s);
        });
        const cloneInteractives = Array.from(
            contentDiv.querySelectorAll('input, textarea, select, button')
        );
        cloneInteractives.forEach((clone, i) => {
            const oldId = clone.id || '';
            const src = (oldId && idToSource.get(oldId)) || sourceInteractives[i];
            if (!src) return;
            // Stash old id then strip it so document.getElementById continues
            // to return the source (the source-of-truth for submit logic).
            if (oldId) {
                clone.setAttribute('data-zoom-src-id', oldId);
                clone.removeAttribute('id');
            }
            clone.setAttribute('data-zoom-clone', '1');

            const tag = clone.tagName.toLowerCase();
            const type = (clone.type || '').toLowerCase();

            if (tag === 'button') {
                // Buttons keep their inline onclick (e.g. submitAnswer()) which
                // calls a window.* function that reads the SOURCE inputs —
                // now in sync. Nothing else to wire.
                return;
            }

            // Initial value: copy current source value/checked into clone.
            if (type === 'checkbox' || type === 'radio') {
                clone.checked = !!src.checked;
            } else {
                clone.value = src.value != null ? src.value : '';
            }

            // Sync validation classes (.box-correct / .box-wrong) from the
            // source (where wireBoxValidation listens) to the visible clone
            // in the modal. Without this mirror, the user types into the
            // clone, the source gets the green/red class, but the clone they
            // SEE never updates.
            const syncClonClasses = () => {
                clone.classList.toggle('box-correct', src.classList.contains('box-correct'));
                clone.classList.toggle('box-wrong',   src.classList.contains('box-wrong'));
            };

            // Clone → source (the critical path that fixes the bug).
            const cloneToSrc = () => {
                if (type === 'checkbox' || type === 'radio') {
                    src.checked = clone.checked;
                } else {
                    src.value = clone.value;
                }
                // Fire matching events on the source so any live listeners
                // (area-model running totals, validation, etc.) react.
                // wireBoxValidation's input listener is synchronous, so by
                // the time these dispatchEvent calls return the source has
                // its updated .box-correct / .box-wrong class — copy it.
                try { src.dispatchEvent(new Event('input', { bubbles: true })); } catch (_e) {}
                try { src.dispatchEvent(new Event('change', { bubbles: true })); } catch (_e) {}
                syncClonClasses();
            };
            // Source → clone (in case external code mutates source while open).
            const srcToClone = () => {
                if (type === 'checkbox' || type === 'radio') {
                    clone.checked = !!src.checked;
                } else if (document.activeElement !== clone) {
                    clone.value = src.value != null ? src.value : '';
                }
                syncClonClasses();
            };

            // Initial sync — if the source already has a class set (e.g.
            // user typed before opening modal), reflect it now.
            syncClonClasses();

            clone.addEventListener('input', cloneToSrc);
            clone.addEventListener('change', cloneToSrc);
            src.addEventListener('input', srcToClone);
            src.addEventListener('change', srcToClone);
            sourceListeners.push({ el: src, type: 'input', fn: srcToClone });
            sourceListeners.push({ el: src, type: 'change', fn: srcToClone });
        });
    }
}

// Live-zoom variant for INTERACTIVE widgets (coord-plot, hot-spot, ten-frame,
// dnd-generic, etc.). Instead of cloning the visual into the modal — which
// requires re-binding every event listener and re-syncing widget state — we
// physically MOVE the live `visualAid` element into the modal, scale its
// inner SVG/host, and on close move it back to its original parent in the
// page DOM. All listeners stay live; widget state (placed dots, selected
// items, etc.) survives intact.
//
// The interactive flag on the modal disables backdrop-close so a stray click
// just outside the SVG doesn't dispose the modal mid-interaction. The ✕
// button is the only way out (plus Esc).
export function openLiveZoomModal(visualAidEl) {
    if (!visualAidEl) return;
    document.querySelectorAll('.zoom-overlay').forEach(o => o.remove());

    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay zoom-interactive zoom-live';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'zoom-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '✕';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'zoom-content';

    overlay.appendChild(closeBtn);
    overlay.appendChild(contentDiv);

    // Stash the original parent + next-sibling so we can restore on close.
    const origParent = visualAidEl.parentNode;
    const origNextSibling = visualAidEl.nextSibling;
    // Snapshot inline styles we mutate, so we can restore them.
    const origInlineStyle = visualAidEl.getAttribute('style') || '';
    // Strip the magnifier button from the live element while it's in the
    // modal — the modal already has its own ✕ close button.
    const magnifier = visualAidEl.querySelector(':scope > .zoom-icon-btn');
    if (magnifier) magnifier.style.display = 'none';

    // MOVE (not clone) the live visualAid into the modal.
    contentDiv.appendChild(visualAidEl);
    // Override any width/display constraints from the page layout so the
    // visual gets to expand inside the modal.
    visualAidEl.style.setProperty('width', 'auto', 'important');
    visualAidEl.style.setProperty('max-width', 'none', 'important');
    visualAidEl.style.setProperty('display', 'block', 'important');

    function dispose() {
        document.removeEventListener('keydown', escClose);
        // Restore the magnifier
        if (magnifier) magnifier.style.display = '';
        // Restore original inline styles
        if (origInlineStyle) {
            visualAidEl.setAttribute('style', origInlineStyle);
        } else {
            visualAidEl.removeAttribute('style');
        }
        // Move the live visualAid back to its original spot in page DOM.
        if (origParent) {
            if (origNextSibling && origNextSibling.parentNode === origParent) {
                origParent.insertBefore(visualAidEl, origNextSibling);
            } else {
                origParent.appendChild(visualAidEl);
            }
        }
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    function escClose(e) {
        if (e.key === 'Escape') dispose();
    }

    closeBtn.addEventListener('click', dispose);
    // No backdrop-close — interactive widgets use the ✕ only.
    document.addEventListener('keydown', escClose);

    document.body.appendChild(overlay);

    // Scale the largest internal SVG to ~2× capped to viewport. The widget's
    // own SVG is the click surface; scaling the SVG element resizes both the
    // visible grid AND the lattice hit-targets together (SVG viewBox preserves
    // hit geometry). We intentionally do NOT use CSS transform: scale() —
    // that breaks pointer-event hit-testing on some browsers when nested.
    const svgEls = Array.from(visualAidEl.querySelectorAll('svg'));
    if (svgEls.length > 0) {
        // Pick the biggest by area as reference; scale all by the same factor
        // so multi-svg layouts (rare for interactive widgets) stay aligned.
        let biggestArea = 0;
        let biggestRect = null;
        const rects = svgEls.map(el => el.getBoundingClientRect());
        rects.forEach(r => {
            const area = r.width * r.height;
            if (area > biggestArea) { biggestArea = area; biggestRect = r; }
        });
        if (biggestRect) {
            const padding = 180;
            const maxW = window.innerWidth * 0.90 - padding;
            const maxH = window.innerHeight * 0.90 - padding;
            const fitScale = Math.min(
                maxW / Math.max(1, biggestRect.width),
                maxH / Math.max(1, biggestRect.height)
            );
            const scale = Math.min(2, Math.max(1, fitScale));
            svgEls.forEach((svg, i) => {
                const r = rects[i];
                const tw = Math.round(r.width * scale);
                const th = Math.round(r.height * scale);
                svg.style.setProperty('width', tw + 'px', 'important');
                svg.style.setProperty('height', th + 'px', 'important');
                svg.style.setProperty('max-width', 'none', 'important');
                svg.style.setProperty('max-height', 'none', 'important');
                svg.setAttribute('width', String(tw));
                svg.setAttribute('height', String(th));
                // Walk up and clear width/max-width on wrappers so the SVG
                // can actually grow inside its containers.
                let p = svg.parentElement;
                while (p && p !== contentDiv) {
                    p.style.setProperty('max-width', 'none', 'important');
                    p.style.setProperty('max-height', 'none', 'important');
                    p.style.setProperty('width', 'auto', 'important');
                    p = p.parentElement;
                }
            });
        }
    }
}

// Attach click-to-enlarge or magnifier-icon behavior to #visualAid based
// on whether clicking the visual is part of the answer mechanism.
// - Click-is-answer types (hot-spot, multi-select-check, fraction-bar-shade,
//   ten-frame, clock-set, coord-plot, coord-input, dnd-generic): inject a
//   small 🔍 button in the top-right; clicking it opens the modal.
// - Otherwise: the whole #visualAid becomes a click-to-zoom trigger.
function attachZoomBehavior(visualAidEl, q) {
    if (!visualAidEl) return;
    if (visualAidEl.style.display === 'none') return;
    if (!visualAidEl.innerHTML || !visualAidEl.innerHTML.trim()) return;

    // Strip any leftover triggers/buttons from prior questions so we don't
    // double-attach.
    visualAidEl.classList.remove('zoom-trigger');
    visualAidEl.querySelectorAll(':scope > .zoom-icon-btn').forEach(b => b.remove());
    visualAidEl.onclick = null;

    const clickIsAnswer = q && q.answerType && (
        ZOOM_CLICK_IS_ANSWER_TYPES.includes(q.answerType)
        || (q.answerType === 'interactive' && (q.interactiveType === 'ordering' || q.interactiveType === 'expanded'))
    );

    // Build the inner HTML to enlarge — exclude any widget host(s) (which
    // re-render their own interactive UI) and the magnifier button itself.
    function buildZoomHTML() {
        const clone = visualAidEl.cloneNode(true);
        clone.querySelectorAll('[id$="Host"]').forEach(h => h.remove());
        clone.querySelectorAll('.zoom-icon-btn').forEach(b => b.remove());
        return clone.innerHTML;
    }

    // If there's nothing enlargeable (e.g. ten-frame with no q.visual — only
    // the widget host), skip attaching any zoom behavior.
    if (!buildZoomHTML().trim()) return;

    if (clickIsAnswer) {
        // Don't override clicks on the widget — show a magnifier icon instead.
        const cs = window.getComputedStyle(visualAidEl);
        if (cs.position === 'static') visualAidEl.style.position = 'relative';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'zoom-icon-btn';
        btn.title = 'Enlarge visual';
        btn.setAttribute('aria-label', 'Enlarge visual');
        btn.textContent = '🔍';
        btn.addEventListener('click', e => {
            e.stopPropagation();
            e.preventDefault();
            // For widget-bound interactive types we MOVE the live visualAid
            // into the modal (preserving listeners + widget state) instead
            // of cloning. This guarantees clicks inside the modal still
            // work — the widget's hit-target listeners are the SAME nodes
            // we wired during render. On close we move the visualAid back.
            openLiveZoomModal(visualAidEl);
        });
        visualAidEl.appendChild(btn);
    } else {
        visualAidEl.classList.add('zoom-trigger');
        visualAidEl.onclick = (e) => {
            // Ignore clicks on interactive controls inside the visual
            // (inputs/buttons/links from area-model, number-family, etc.)
            const t = e.target;
            if (t && t.closest && t.closest('input, button, select, textarea, a, [contenteditable="true"]')) return;
            const html = buildZoomHTML();
            if (html && html.trim()) openZoomModal(html, visualAidEl);
        };
    }
}

// ===== LIVE PER-BOX VALIDATION + AUTO-ADVANCE =====
//
// Wires every "boxes-inside-q.visual" answer system (column add/sub/mult,
// long-division quotient, box-method division, area-model, number/fact-family,
// factor-links, dual perimeter+area, inline-blanks) so that on every keystroke
// the box turns green when its value matches the expected answer for that
// slot, red when non-empty and wrong, neutral when empty. Once EVERY required
// slot is correct, we hide #answerInputArea and (after a 400ms debounce to
// avoid double-submitting on rapid typing) call the existing transition path
// — preferring window.transitionToNextQuestion(), falling back to
// window.submitAnswer().
//
// All system-specific listeners that already exist in the per-answerType
// branches below remain in place — this helper is additive: it only attaches
// the live coloring + auto-advance and skips any input that already has
// `data-_boxValAttached === '1'`. The trigger function is window-exposed via
// globals.js so panel-injected inputs can call it after late-mount.
//
// Public surface (also attached to window in globals.js):
//   wireBoxValidation(visualAidEl, q)
export function wireBoxValidation(visualAidEl, q) {
    if (!visualAidEl || !q) return;

    // Detect which box system(s) are present.
    const colInputs = Array.from(visualAidEl.querySelectorAll('.column-answer-input'));
    const bxInputs = Array.from(visualAidEl.querySelectorAll('.bx-roof, .bx-sub, .bx-rem'));
    const amInputs = Array.from(visualAidEl.querySelectorAll('.area-model-input, .area-model-total'));
    const nfInputs = Array.from(visualAidEl.querySelectorAll('.number-family-input, .fact-family-input'));
    const lkInputs = Array.from(visualAidEl.querySelectorAll('.links-input'));
    const ibCells  = Array.from(document.querySelectorAll('.ib-cell'));
    const perimeterInput = document.getElementById('perimeterInput');
    const areaInput = document.getElementById('areaInput');
    const hasDual = !!(perimeterInput || areaInput) && q.answerType === 'dual' && q.dualAnswers;
    // Coordinate-input cells (.ci-x / .ci-y) — each pair represents one
    // labeled point. Live validation against q.geometryData.points[idx].x / .y.
    const ciInputs = q.answerType === 'coord-input'
        ? Array.from(document.querySelectorAll('.ci-x, .ci-y'))
        : [];
    // grid-fill widget cells — each blank input carries data-row / data-col
    // and the expected value lives in q.gridFill.cells.
    const gfCells = Array.from(visualAidEl.querySelectorAll('.gf-cell'));
    // number-pattern blanks — each input carries data-answer with its expected
    // term value. Used by the number_pattern skill (gen-algebraic.js).
    const npInputs = Array.from(visualAidEl.querySelectorAll('.np-cell'));
    // fraction-input pair (.fi-num / .fi-den) — expected values are the two
    // halves of q.ans split on "/".
    const fiNumEl = (q.answerType === 'fraction-input') ? document.getElementById('fiNum') : null;
    const fiDenEl = (q.answerType === 'fraction-input') ? document.getElementById('fiDen') : null;
    const hasFi = !!(fiNumEl && fiDenEl) && q.answerType === 'fraction-input'
        && typeof q.ans === 'string' && /^-?\d+\s*\/\s*-?\d+$/.test(q.ans);

    const anyBoxes = colInputs.length > 0 || bxInputs.length > 0 || amInputs.length > 0
        || nfInputs.length > 0 || lkInputs.length > 0 || ibCells.length > 0 || hasDual
        || ciInputs.length > 0 || gfCells.length > 0 || npInputs.length > 0 || hasFi;
    if (!anyBoxes) return;

    // Hide #answerInputArea + global Check button — student types only into the boxes.
    // Exception: fraction-input lives INSIDE #answerInputArea (it owns the host),
    // so keep the area visible when that's the active answer type.
    // Exception: coord-input MOVES its .ci-host (X/Y boxes + Check button) into
    // #answerInputArea — hiding the area would hide every coordinate input,
    // leaving the student with a grid + dots and no place to answer.
    const ai = document.getElementById('answerInputArea');
    const _hostsCoordInput = !!(ai && ai.querySelector('.ci-host'));
    if (ai && !hasFi && !_hostsCoordInput) ai.style.display = 'none';

    // Build a list of "slots". Each slot has:
    //   el      — the input element
    //   expect  — the expected normalized string ("" allowed for leading-pad column boxes)
    //   norm    — function that normalizes a raw value for comparison
    //   required — false only when expected is "" (leading column padding); these slots
    //              must be empty to be "correct" but they don't BLOCK auto-advance even
    //              if blank — the all-correct check requires every slot to be in correct state.
    const slots = [];
    const numNorm = v => String(v || '').trim().replace(/,/g, '');
    const looseEq = (a, b) => {
        const sa = numNorm(a), sb = numNorm(b);
        if (sa === '' && sb === '') return true;
        if (sa === '' || sb === '') return false;
        const na = Number(sa), nb = Number(sb);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb;
        return sa.toLowerCase() === sb.toLowerCase();
    };

    // 1) column-answer-input: expected = digits of q.ans, right-aligned across N boxes.
    if (colInputs.length > 0 && (q.ans !== undefined && q.ans !== null)) {
        const ansStr = String(q.ans);
        const N = colInputs.length;
        // Per-cell expected: leading boxes blank, trailing boxes hold each digit.
        // If maxlength > 1 (rare: 2-digit one-shot quotient), put full ans in last box.
        if (N === 1) {
            slots.push({ el: colInputs[0], expect: ansStr, norm: numNorm });
        } else if (ansStr.length <= N) {
            const pad = N - ansStr.length;
            for (let i = 0; i < N; i++) {
                const ch = i < pad ? '' : ansStr.charAt(i - pad);
                slots.push({ el: colInputs[i], expect: ch, norm: numNorm });
            }
        } else {
            // ans longer than box count — fall back to per-box data-correct or skip.
            for (let i = 0; i < N; i++) slots.push({ el: colInputs[i], expect: ansStr.charAt(i) || '', norm: numNorm });
        }
    }

    // 2) box-method division: each input has data-answer.
    bxInputs.forEach(el => {
        if (el.dataset && 'answer' in el.dataset) slots.push({ el, expect: el.dataset.answer, norm: numNorm });
    });

    // 3) area-model: each input has data-answer.
    amInputs.forEach(el => {
        if (el.dataset && 'answer' in el.dataset) slots.push({ el, expect: el.dataset.answer, norm: numNorm });
    });

    // 4) number-family / fact-family: each input has data-answer.
    nfInputs.forEach(el => {
        if (el.dataset && 'answer' in el.dataset) slots.push({ el, expect: el.dataset.answer, norm: numNorm });
    });

    // 5) factor-links: each input has data-answer.
    lkInputs.forEach(el => {
        if (el.dataset && 'answer' in el.dataset) slots.push({ el, expect: el.dataset.answer, norm: numNorm });
    });

    // 6) inline-blanks: cell index i must match q.inlineBlanksData.acceptedSets[?][i] OR q.ans[i].
    if (ibCells.length > 0) {
        let acceptedSets = (q.inlineBlanksData && Array.isArray(q.inlineBlanksData.acceptedSets))
            ? q.inlineBlanksData.acceptedSets
            : null;
        if (!acceptedSets && Array.isArray(q.ans)) acceptedSets = [q.ans.map(String)];
        // For per-cell live feedback, accept if the typed value matches ANY accepted-set's value at that index.
        ibCells.forEach((cell, idx) => {
            const accepted = acceptedSets ? acceptedSets.map(s => (s && s[idx] !== undefined) ? String(s[idx]) : '') : [];
            slots.push({
                el: cell,
                expect: accepted[0] || '',
                norm: v => String(v || '').trim().replace(/,/g, ''),
                multi: accepted.length > 0 ? accepted : null,
            });
        });
    }

    // 7) dual perimeter + area.
    if (hasDual) {
        if (perimeterInput) slots.push({ el: perimeterInput, expect: String(q.dualAnswers.perimeter), norm: numNorm });
        if (areaInput) slots.push({ el: areaInput, expect: String(q.dualAnswers.area), norm: numNorm });
    }

    // 8) coord-input cells. Each cell carries data-point="<idx>" and
    // data-axis="x|y"; expected values come from q.geometryData.points[idx].
    if (ciInputs.length > 0 && q.geometryData && Array.isArray(q.geometryData.points)) {
        ciInputs.forEach(el => {
            const idx = parseInt(el.dataset.point, 10);
            const axis = el.dataset.axis;
            if (Number.isNaN(idx) || !q.geometryData.points[idx]) return;
            const expected = q.geometryData.points[idx][axis];
            if (expected == null) return;
            slots.push({ el, expect: String(expected), norm: numNorm });
        });
    }

    // 9) grid-fill cells. Each blank input carries data-row / data-col;
    // the expected value lives in q.gridFill.cells (matched on row+col+blank).
    if (gfCells.length > 0 && q.gridFill && Array.isArray(q.gridFill.cells)) {
        gfCells.forEach(el => {
            const r = parseInt(el.dataset.row, 10);
            const c = parseInt(el.dataset.col, 10);
            if (Number.isNaN(r) || Number.isNaN(c)) return;
            const cell = q.gridFill.cells.find(x => x.row === r && x.col === c && x.blank);
            if (!cell) return;
            slots.push({ el, expect: String(cell.value), norm: numNorm });
        });
    }

    // 9b) number-pattern blanks. Each input has data-answer with the expected
    // term value (number_pattern skill in gen-algebraic.js).
    // ALSO supports data-multi-answer (comma-separated) for skills like
    // mult_chart where any of N values can go in any of N boxes (order-free).
    // For multi-answer cells: per-cell match accepts any value in the set,
    // and a group-set-equality check below ensures all values are covered.
    npInputs.forEach(el => {
        if (el.dataset && 'multiAnswer' in el.dataset) {
            const multi = String(el.dataset.multiAnswer).split(',').map(s => s.trim()).filter(Boolean);
            if (multi.length) slots.push({ el, expect: multi[0], norm: numNorm, multi, multiKey: el.dataset.multiAnswer });
        } else if (el.dataset && 'answer' in el.dataset) {
            slots.push({ el, expect: el.dataset.answer, norm: numNorm });
        }
    });

    // 10) fraction-input numerator + denominator. q.ans is "<num>/<den>".
    // We DON'T want naïve per-cell green if the student types an unsimplified
    // equivalent (e.g. "2/4" for a "1/2" answer), so the slot match is custom:
    // the slot reports "correct" when typing matches its OWN half exactly OR
    // when both halves together form an equivalent fraction (handled via the
    // multi/loose match below — we just expose the literal halves here).
    if (hasFi) {
        const parts = String(q.ans).split('/').map(s => s.trim());
        if (parts.length === 2) {
            const [expN, expD] = parts;
            // Custom slot match: each slot is "correct" if (a) its own half
            // matches literally OR (b) the OTHER half is also filled and the
            // pair as a whole is an equivalent fraction. This lets students
            // submit "2/4" for a "1/2" answer and see both cells turn green.
            const fiPairCorrect = () => {
                const u = (fiNumEl.value || '').trim();
                const v = (fiDenEl.value || '').trim();
                if (!u || !v) return false;
                if (!/^-?\d+$/.test(u) || !/^-?\d+$/.test(v)) return false;
                const un = parseInt(u, 10), ud = parseInt(v, 10);
                const en = parseInt(expN, 10), ed = parseInt(expD, 10);
                if (ud === 0 || ed === 0) return false;
                // Cross-multiply equivalence: un/ud === en/ed iff un*ed === ud*en
                return un * ed === ud * en;
            };
            slots.push({
                el: fiNumEl,
                expect: expN,
                norm: numNorm,
                customMatch: fiPairCorrect,
            });
            slots.push({
                el: fiDenEl,
                expect: expD,
                norm: numNorm,
                customMatch: fiPairCorrect,
            });
        }
    }

    if (slots.length === 0) return;

    // Per-slot match check (handles inline-blanks "multi" accepted values
    // and fraction-input cross-multiplied equivalence via customMatch).
    const slotMatches = (s) => {
        const v = s.norm(s.el.value);
        if (typeof s.customMatch === 'function' && s.customMatch()) return true;
        if (s.multi && s.multi.length) return s.multi.some(exp => looseEq(v, exp));
        return looseEq(v, s.expect);
    };

    // Apply visual class for a slot's current value.
    const paintSlot = (s) => {
        const raw = (s.el.value || '').trim();
        s.el.classList.remove('box-correct', 'box-wrong');
        if (raw === '') return; // neutral when empty
        if (slotMatches(s)) {
            s.el.classList.add('box-correct');
            return;
        }
        // For fraction-input pairs, hold the wrong-paint until BOTH halves
        // are filled — otherwise typing the numerator (e.g. "2" en route to
        // "2/4") flashes red while the denominator is still empty. The
        // pair-equivalence customMatch can only succeed once both are filled.
        if (hasFi && (s.el === fiNumEl || s.el === fiDenEl)) {
            const other = (s.el === fiNumEl) ? fiDenEl : fiNumEl;
            if (!other || !(other.value || '').trim()) return; // stay neutral
        }
        s.el.classList.add('box-wrong');
    };

    // All-correct?
    const allCorrect = () => {
        if (!slots.every(slotMatches)) return false;
        // Group-set-equality for multi-answer slots: when several np-cells
        // share the same multi set (mult_chart "fill any answer in any box"),
        // the multiset of typed values must equal the expected multiset —
        // otherwise three boxes all containing "12" would slip through.
        const groups = new Map();
        for (const s of slots) {
            if (!s.multi || !s.multiKey) continue;
            const arr = groups.get(s.multiKey) || [];
            arr.push(s);
            groups.set(s.multiKey, arr);
        }
        for (const [, group] of groups) {
            if (group.length < 2) continue; // single multi-slot — already covered by per-slot check
            const expected = group[0].multi.slice().sort();
            const actual = group.map(s => s.norm(s.el.value)).sort();
            if (actual.length !== expected.length) return false;
            for (let i = 0; i < expected.length; i++) {
                if (!looseEq(actual[i], expected[i])) return false;
            }
        }
        return true;
    };

    let advanceTimer = null;
    let advanced = false;
    const tryAdvance = () => {
        if (advanced) return;
        if (state.hasAnswered) return;
        if (!allCorrect()) {
            if (advanceTimer) { clearTimeout(advanceTimer); advanceTimer = null; }
            return;
        }
        if (advanceTimer) return; // already scheduled
        advanceTimer = setTimeout(() => {
            advanceTimer = null;
            if (advanced || state.hasAnswered) return;
            // Re-check at fire time in case the user erased a cell during the debounce.
            if (!allCorrect()) return;
            advanced = true;
            // Disable inputs to prevent keystrokes during transition.
            slots.forEach(s => { try { s.el.disabled = true; } catch (_) {} });
            // MAP mode hand-off: record the correct answer through the MAP
            // engine instead of the standard transition path so the world
            // map progresses. Non-MAP flow uses transitionToNextQuestion.
            if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: true });
            } else if (hasFi && typeof window.submitAnswer === 'function') {
                // fraction-input: route through submitAnswer so score / XP /
                // gamification all fire (transitionToNextQuestion alone does
                // NOT bump score because state.lastAnswerCorrect is still false).
                window.submitAnswer();
            } else if (typeof window.transitionToNextQuestion === 'function') {
                window.transitionToNextQuestion();
            } else if (typeof window.submitAnswer === 'function') {
                window.submitAnswer();
            }
        }, 400);
    };

    slots.forEach(s => {
        if (s.el.dataset._boxValAttached === '1') {
            // Already wired — still re-paint in case a re-render reused the element.
            paintSlot(s);
            return;
        }
        s.el.dataset._boxValAttached = '1';
        s.el.addEventListener('input', () => {
            paintSlot(s);
            tryAdvance();
        });
        // Initial paint (in case the input arrives pre-filled, e.g. retry).
        paintSlot(s);
    });

    // Initial advance check (covers fully-prefilled edge case).
    tryAdvance();
}

// =============================================================================
// In-place correction UX shared handler for multi-place interactive widgets
// (shape-match, categorize, ordering, multi-select, drag-fill, coord-plot,
// place-symmetry-lines, hot-spot). On the FIRST submit:
//   - records first-attempt scoring once (XP, streak, banner, MAP, practice log)
//   - paints per-placement red/green
// If allCorrect: fires confetti + correct-bg + advance pipeline.
// If wrongCount > 0 AND not in MAP test/simulation mode:
//   - shows "X correct, Y to fix — try again!" inline
//   - calls onRetry() to unlock the widget for re-submit
//   - keeps state.hasAnswered = false so the question stays open
// In MAP test/simulation mode: locks immediately and advances on first submit
// regardless of correctness (no in-place correction in test mode).
// =============================================================================
function _handleMultiPlaceSubmit(opts) {
    const { qq, allCorrect, wrongCount, totalScored,
        correctXP = 10, correctMessage = "🎉 Correct!",
        onRetry, onLockOnAllCorrect, onLockOnMapTest } = opts;

    const mapTest = isMapTestMode();
    const firstSubmit = isFirstAttempt();
    const firstAttemptCorrect = markFirstAttempt(allCorrect);

    const feedback = document.getElementById("feedbackArea");
    const card = document.getElementById("questionCard");

    // ------------ FIRST SUBMIT: scoring side effects (once per question) ----
    if (firstSubmit) {
        if (firstAttemptCorrect) {
            state.score++;
            state.sessionStreak++;
            const gs = document.getElementById("gameScore");
            if (gs) gs.innerText = `${state.score} Correct`;
            if (typeof window.awardXP === 'function') window.awardXP(correctXP, 'correct');
            if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
            if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
        } else {
            state.sessionStreak = 0;
            if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
        }
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(firstAttemptCorrect);
        trackSkillAnswer(firstAttemptCorrect);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (qq && qq.skillId) || (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, firstAttemptCorrect, tm);
        }
        // Set lastAnswerCorrect to the first-attempt verdict for downstream
        // consumers (boss/race/etc.) — keep this on first submit only.
        state.lastAnswerCorrect = firstAttemptCorrect;
    }

    // ------------ MAP TEST MODE: lock + advance on first submit, no retry ----
    if (mapTest) {
        if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
        if (typeof onLockOnMapTest === 'function') onLockOnMapTest();
        if (feedback) {
            feedback.style.display = "block";
            feedback.className = "feedback-area " + (allCorrect ? "correct" : "incorrect");
            feedback.innerHTML = allCorrect ? correctMessage : "Submitted.";
        }
        if (allCorrect && card) card.classList.add("correct-bg");
        else if (card) card.classList.add("incorrect-bg");
        state.hasAnswered = true;
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: allCorrect });
        }
        return;
    }

    // ------------ ALL CORRECT (any submit): fire advance pipeline once ------
    if (allCorrect) {
        if (hasAllCorrectFired()) return;  // safety against double-click
        markAllCorrectFired();
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        if (card) card.classList.add("correct-bg");
        if (typeof window.confetti === 'function') window.confetti();
        if (feedback) {
            feedback.style.display = "block";
            feedback.className = "feedback-area correct";
            feedback.innerHTML = firstAttemptCorrect
                ? correctMessage
                : `${correctMessage} (Got it on a retry — keep practicing!)`;
        }
        if (typeof onLockOnAllCorrect === 'function') onLockOnAllCorrect();
        if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();

        // MAP practice/worksheet hand-off
        if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
            // Use the first-attempt verdict so the engine's RIT update reflects
            // the student's actual first-shot ability (not their corrected work).
            window.recordMapAnswer({ correct: firstAttemptCorrect });
            return;
        }
        if (typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
            setTimeout(() => {
                if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
            }, 800);
        }
        return;
    }

    // ------------ WRONG (in-place correction): keep widget interactive ------
    if (feedback) {
        feedback.style.display = "block";
        feedback.className = "feedback-area incorrect";
        feedback.innerHTML = buildRetryMessage(totalScored, wrongCount);
    }
    if (card) {
        card.classList.add("incorrect-bg");
        setTimeout(() => card.classList.remove("incorrect-bg"), 700);
    }
    // Keep the question open: do NOT mark answered, do NOT advance.
    state.hasAnswered = false;
    if (typeof onRetry === 'function') onRetry();
}

export function renderQuestion() {
    const q = state.currentQ;

    // Safety check for invalid question
    if (!q || !q.text) {
        console.error("Invalid question generated, creating fallback");
        state.currentQ = {
            text: "5 + 5 = ?",
            ans: 10,
            hint: "Count up from 5",
            options: [8, 10, 12, 15],
            answerType: "number"
        };
        renderQuestion();
        return;
    }

    // MAP-mode numpad-only feature: re-route plain `number` items through the
    // on-screen numpad widget. Multiple-choice (q.options.length > 0) and any
    // explicit interactive answerType pass through unchanged.
    if (q.answerType === "number"
        && (!q.options || q.options.length === 0)
        && state.mapFeatures && state.mapFeatures.numpadOnly === true) {
        q._originalAnswerType = "number";
        q.answerType = "numpad-input";
    }

    const card = document.getElementById("questionCard");
    card.classList.remove("correct-bg", "incorrect-bg", "q-slide-out", "q-slide-in", "show-perim-hint");

    // Wrong-answer retry: clear any cross-outs / Skip button / attempt chips
    // from the previous question (Practice + MAP Practice modes use this).
    resetAttemptTracking();

    // Hide leftover inline-blanks Submit button from a prior question.
    // The inline-blanks branch will re-show it when the current question is
    // also inline-blanks.
    const _staleIbBtn = document.getElementById('ibSubmitBtn');
    if (_staleIbBtn) _staleIbBtn.style.display = 'none';

    // Hide leftover inline-cloze Submit button from a prior question.
    const _staleClozeBtn = document.getElementById('clozeSubmitBtn');
    if (_staleClozeBtn) _staleClozeBtn.style.display = 'none';

    // Hide leftover image-hotspot Submit button from a prior question.
    const _staleHotspotBtn = document.getElementById('imgHotspotSubmitBtn');
    if (_staleHotspotBtn) _staleHotspotBtn.style.display = 'none';

    // Auto-close the floating calculator when a new problem starts. Stays
    // closed unless the student opens it again on the new question (the
    // 🧮 Calculator button is conditionally shown based on q.calculatorAllowed).
    if (typeof window !== 'undefined' && typeof window.hideCalculator === 'function') {
        try { window.hideCalculator(); } catch (_) { /* non-fatal */ }
    }

    // Reset #answerInputArea to its default content. Some answer-type
    // branches (coord-input, drag-fill, multi-select-check, etc.) replace
    // its innerHTML with a custom widget host. If the next question is a
    // plain `number` / `text` type, those branches don't run, leaving the
    // stale widget host on screen alongside the new question text. Cache
    // the original markup once and restore on every render.
    const _aia = document.getElementById('answerInputArea');
    if (_aia) {
        if (typeof window !== 'undefined' && !window._defaultAnswerInputAreaHTML) {
            window._defaultAnswerInputAreaHTML = _aia.innerHTML;
        }
        const _cachedHTML = (typeof window !== 'undefined') ? window._defaultAnswerInputAreaHTML : null;
        // Only restore if the area was mutated by a previous custom branch.
        // Detect by missing the canonical `#answerInput` id.
        if (_cachedHTML && !_aia.querySelector('#answerInput')) {
            _aia.innerHTML = _cachedHTML;
        }
        // Reset any inline display/flex/style overrides applied by custom
        // branches (coord-input set display:flex, drag-fill set display:none).
        _aia.style.cssText = '';
    }

    // When reviewing a past question (back-navigation), show that question's
    // 1-indexed position instead of the live qCount.
    const _reviewIdx = (typeof state._reviewingQIndex === 'number') ? state._reviewingQIndex : -1;
    const _qDisplay = _reviewIdx >= 0 ? (_reviewIdx + 1) : state.qCount;
    document.getElementById("qNum").innerText = `Q${_qDisplay}`;

    // Display skill label — merge with question number as a pill
    const skillLabelEl = document.getElementById("skillLabel");
    if (skillLabelEl) {
        const label = q.skillLabel || (typeof window !== 'undefined' && window.getSkillLabelForQuestion ? window.getSkillLabelForQuestion(state.skill) : '');
        if (label) {
            const gc = gradeCircleHTML(getSkillGrade(state.skill, state.category));
            skillLabelEl.innerHTML = gc ? gc + ' ' + label : label;
        } else {
            skillLabelEl.textContent = '';
        }
    }

    // Adaptive Mode level chip — placed near the top so EVERY answer-type
    // branch (and there are many early-return paths below) gets the chip.
    // The helper hides itself when adaptive mode is OFF.
    if (typeof window !== 'undefined' && typeof window.renderAdaptiveLevelChip === 'function') {
        try { window.renderAdaptiveLevelChip(state.skill); } catch (_e) { /* render-only, ignore */ }
    }

    // Floating Calculator visibility — show the in-card button only when the
    // current question opted in via q.calculatorAllowed (typically hard
    // PEMDAS/exponent/large-number problems). Placed before the early-return
    // branches so every answerType honours the flag.
    const _calcBtn = document.getElementById('calcBtn');
    if (_calcBtn) _calcBtn.style.display = q.calculatorAllowed ? 'inline-block' : 'none';
    // If the current question doesn't permit a calculator, dismiss any open
    // panel left over from the previous question. We intentionally DO NOT
    // clear the calculator's expression state — kids may want to keep
    // chaining calculations across questions when calc is allowed.
    if (!q.calculatorAllowed && typeof window !== 'undefined' && typeof window.hideCalculator === 'function') {
        try { window.hideCalculator(); } catch (_e) { /* ignore */ }
    }
    // AUTO-OPEN the calculator when the current question opts in. Per user
    // spec: "the calculator should automatically come up for those problems".
    // Fire immediately AND defer once — the immediate call covers the common
    // path; the deferred call is a backup in case any widget render path
    // toggles calc visibility synchronously after this point.
    if (q.calculatorAllowed && typeof window !== 'undefined' && typeof window.showCalculator === 'function') {
        try { window.showCalculator(); } catch (_e) { /* ignore */ }
        setTimeout(() => { try { window.showCalculator(); } catch (_e) { /* ignore */ } }, 50);
    }

    // Check if this is a facts-column-visual (vertical format replaces horizontal text)
    const isFactsColumnVisual = q.visual && q.visual.includes('facts-column-visual');
    const questionTextEl = document.getElementById("questionText");

    if (isFactsColumnVisual) {
        // For vertical facts format, the visual IS the question on-screen, but
        // we still surface q.text in the questionText element for screen
        // readers and automated test signals (visually hidden via inline
        // styles so layout is unchanged). Without this, headless test runners
        // and assistive tech see an empty questionText element and can't
        // confirm the question rendered. Use textContent (NOT innerText) so
        // the value is set even when the element is layout-clipped — innerText
        // returns '' for non-rendered nodes and would defeat the test signal.
        questionTextEl.textContent = q.text || '';
        questionTextEl.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;';
        questionTextEl.setAttribute('aria-hidden', 'false');
    } else if (q.answerType === "inline-blanks") {
        // For inline-blanks, the ___ placeholders become real <input> cells
        // the student types into directly. The right-side Type-answer box
        // is hidden later in this function.
        const widths = (q.inlineBlanksData && q.inlineBlanksData.cellWidths) || null;
        questionTextEl.innerHTML = formatQuestionTextForInlineBlanks(q.text, widths);
        questionTextEl.style.cssText = '';
        questionTextEl.style.display = '';
        questionTextEl.style.fontSize = '1.2rem';
        questionTextEl.style.lineHeight = '1.8';
    } else if (q.answerType === "inline-cloze") {
        // For inline-cloze, each ___ placeholder becomes an inline <select>
        // dropdown populated from q.clozeOptions[i].
        questionTextEl.innerHTML = formatQuestionTextForInlineCloze(q.text, q.clozeOptions);
        questionTextEl.style.cssText = '';
        questionTextEl.style.display = '';
        questionTextEl.style.fontSize = '1.2rem';
        questionTextEl.style.lineHeight = '1.8';
    } else {
        // Render q.text as HTML so we can transform literal ___ placeholders
        // into a styled inline answer blank. Question text is generated by our
        // own code (not user input), so this is XSS-safe.
        questionTextEl.innerHTML = formatQuestionTextForScreen(q.text);
        // Clear any visually-hidden styling that the facts-column-visual
        // branch above may have applied on a previous question. Setting
        // cssText to '' removes inline style entirely so CSS rules (like
        // .question-text) can take over again.
        questionTextEl.style.cssText = '';
        questionTextEl.style.display = '';
    }

    const visualAid = document.getElementById("visualAid");

    // Defensive reset: clear stale innerHTML from any prior question BEFORE
    // any branch decides what to render. Without this, a text-only question
    // (e.g. unit_conversion_word with q.visual === "") that follows a visual
    // question (e.g. equiv_frac_visual) would leave the prior SVG/hint in the
    // DOM. The branch below sets `display:none`, which normally hides it —
    // but in MAP immersive layout the CSS rule
    //   `body.map-immersive #visualAid { display: contents !important; }`
    // overrides the inline `display:none`, causing the stale prior visual to
    // bleed into the current question's left grid column. Clearing innerHTML
    // up-front guarantees nothing leaks regardless of which downstream
    // branch runs (and regardless of immersive vs. compact CSS).
    if (visualAid) visualAid.innerHTML = "";

    // Determine if this question type REQUIRES visual display (regardless of difficulty)
    const requiresVisual = q.visual && (
        q.answerType === "area-model" ||
        q.answerType === "tchart-drag" ||
        q.answerType === "number-family" ||
        q.answerType === "fact-family" ||
        q.answerType === "factor-pairs" ||
        q.answerType === "inline-blanks" ||
        q.answerType === "dual" ||
        q.answerType === "dual-fraction" ||
        q.answerType === "coordinate-multi" ||
        q.answerType === "coord-input" ||
        q.answerType === "coord-plot" ||
        q.answerType === "col-subtract" ||
        q.answerType === "col-arith" ||
        q.answerType === "array-builder" ||
        q.answerType === "drag-fill" ||
        q.answerType === "divisibility-sort" ||
        q.answerType === "number-line-place" ||
        q.answerType === "odd-even-select" ||
        q.answerType === "multi-select-check" ||
        q.answerType === "ten-frame" ||
        q.answerType === "ten-frame-build" ||
        q.answerType === "base10-build" ||
        q.answerType === "graph-builder" ||
        q.answerType === "dnd-generic" ||
        q.answerType === "pv-build" ||
        q.answerType === "hot-spot" ||
        q.answerType === "image-hotspot" ||
        q.answerType === "place-symmetry-lines" ||
        q.answerType === "numpad-input" ||
        q.answerType === "number-line-extended" ||
        q.answerType === "nl-drag" ||
        q.answerType === "clock-set" ||
        q.answerType === "box-division" ||
        (q.answerType === "interactive" && (q.interactiveType === "ordering" || q.interactiveType === "expanded")) ||
        (q.visual && q.visual.includes('Column Addition')) ||
        (q.visual && q.visual.includes('Column Subtraction')) ||
        (q.visual && q.visual.includes('Column Multiplication')) ||
        (q.visual && q.visual.includes('Long Division')) ||
        (q.visual && q.visual.includes('column-answer-input')) ||
        (q.visual && q.visual.includes('area-model-input')) ||
        isFactsColumnVisual ||
        // New visual skills where the visual IS the question
        (q.printFormat && ['arrays-groups', 'mult-properties', 'div-remainders',
            'fraction-of-set', 'equiv-frac-visual', 'area-unit-squares', 'perimeter-grid',
            'reading-ruler', 'money-count', 'line-plot-fractions',
            'tape-diagram', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
        'shape-pattern', 'number-pattern',
            'rounding-visual', 'place-value-disks',
            'fraction-of-set-hard', 'reading-ruler-hard',
            'function-table-easy', 'function-table-hard'].includes(q.printFormat))
    );

    if (requiresVisual || q.visual) {
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        // Auto-advance focus on column-answer-input boxes (long division
        // quotient, column add/sub/mult result). When the student fills a
        // 1-character box, focus jumps to the next empty input. Enter
        // submits via the global handler in init.js (which now harvests
        // these boxes via answer-check.js).
        const colInputs = visualAid.querySelectorAll('.column-answer-input');
        if (colInputs.length > 1) {
            colInputs.forEach((inp, i) => {
                if (inp.dataset._colAdvAttached === '1') return;
                inp.dataset._colAdvAttached = '1';
                inp.addEventListener('input', () => {
                    if ((inp.value || '').length >= 1) {
                        const next = colInputs[i + 1];
                        if (next && !(next.value || '').trim()) next.focus();
                    }
                });
                // Backspace on empty cell jumps focus back to prior cell.
                inp.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && !(inp.value || '').trim() && i > 0) {
                        colInputs[i - 1].focus();
                    }
                });
            });
        }
        // Live per-box validation + auto-advance for every "box-system" answer
        // type. Idempotent — safe to invoke from multiple deferred timers and
        // from per-answerType branches that re-set visualAid.innerHTML below.
        // Deferred via setTimeout so it fires AFTER renderQuestion's own
        // tail logic toggles #answerInputArea (line ~2176). Without the defer
        // the standard text-answer flow would reshow the answer area we just
        // hid for column-answer-input visuals.
        setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 0);
        setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 80);
        setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 220);
    } else {
        visualAid.style.display = "none";
        // Belt-and-suspenders: also clear innerHTML in case any later async
        // path (CSS `display: contents` override, widget host re-mount,
        // adaptive engine swap) flips display back to block.
        visualAid.innerHTML = "";
    }

    // Layout opt-out: dual / dual-fraction / area-model / number-family / fact-family
    // / tchart-drag / divisibility-sort all bundle their inputs INSIDE q.visual,
    // so the side-by-side grid would trap the inputs in the left column. Force
    // the question card to single-column layout for these types.
    const _qCard = document.getElementById("questionCard");
    if (_qCard) {
        const fullWidthTypes = ['dual', 'dual-fraction', 'area-model',
            'number-family', 'fact-family', 'factor-pairs', 'tchart-drag',
            'divisibility-sort', 'coordinate-multi'];
        if (fullWidthTypes.includes(q.answerType)) {
            _qCard.classList.add('full-width-answer');
        } else {
            _qCard.classList.remove('full-width-answer');
        }

        // Visual-left layout — DEFAULT for every problem with a non-empty
        // q.visual. The visual fills the full-height LEFT column and the
        // question prompt + answer input/options stack on the RIGHT.
        //
        // Opt-outs:
        //   1. Widget-bound answer types whose host needs single-column flex
        //      (they bundle their own input UI inside q.visual or rely on
        //      `.full-width-answer` single-column behavior).
        //   2. Full-width answer types whose inputs are bundled INSIDE
        //      q.visual (dual / area-model / fact-family / etc.) — already
        //      handled by `.full-width-answer`.
        //   3. Worksheet mode (state.gameMode === 'worksheet') and Quiz mode
        //      (state.quizMode === true) — those views own their own card
        //      layout.
        //
        // The legacy aliases .layout-pv-disks (place-value-disks) and
        // .layout-fnl (fraction-number-line) remain comma-aliased to
        // .layout-visual-left in css/ui-components.css and are kept on the
        // card for backward compat (probes, external selectors, tests).
        const _layoutOptOutAnswerTypes = new Set([
            // Widget-host answer types that bundle their input UI INSIDE
            // q.visual (and hide #answerInputArea / #answerOptions). These
            // need single-column flex so the host can claim full card width.
            'drag-fill', 'clock-set', 'hot-spot', 'image-hotspot', 'number-line-extended',
            'ten-frame', 'ten-frame-build', 'base10-build', 'graph-builder',
            'multi-select', 'multi-select-check', 'numpad-input',
            'dnd-generic', 'coord-plot', 'coord-input', 'fraction-bar-shade',
            'odd-even-select', 'number-line-place', 'box-division', 'grid-fill',
            'nl-drag',
            // Full-width-answer types (already get .full-width-answer; same
            // reasoning — inputs bundled inside q.visual).
            'dual', 'dual-fraction', 'area-model', 'number-family', 'fact-family',
            'factor-pairs', 'tchart-drag', 'divisibility-sort', 'coordinate-multi',
        ]);
        // Interactive ordering/expanded ALSO use the visual-left layout
        // — even though their answer mechanism (digit tiles + input boxes)
        // is bundled inside q.visual. Putting the visual on the left and
        // the question prompt ("Write the expanded form of 49") on the
        // right lets the student read the prompt without the visual
        // pushing it off-screen on a tall MAP card. The bundled inputs
        // stay where they are inside the visual on the left.
        const _hasVisual = !!(q.visual && String(q.visual).trim());
        const _shouldUseVisualLeft = _hasVisual
            && !_layoutOptOutAnswerTypes.has(q.answerType)
            && state.gameMode !== 'worksheet'
            && state.quizMode !== true;
        if (_shouldUseVisualLeft) {
            _qCard.classList.add('layout-visual-left');
        } else {
            _qCard.classList.remove('layout-visual-left');
        }
        // Keep legacy aliases for backward compat (CSS comma-aliases them to
        // .layout-visual-left so visual output is identical).
        _qCard.classList.toggle('layout-pv-disks',
            q.printFormat === 'place-value-disks' && _shouldUseVisualLeft);
        _qCard.classList.toggle('layout-fnl',
            q.printFormat === 'fraction-number-line' && _shouldUseVisualLeft);
    }

    // Schedule click-to-enlarge / magnifier-icon attachment AFTER all sync
    // answer-type branches below run (some re-set visualAid.innerHTML) AND
    // after async widget host renders (multi-select, ten-frame, hot-spot,
    // numpad, dnd-generic, clock-set) finish mounting their content via
    // dynamic import().then(). 200ms is enough headroom for the imports.
    setTimeout(() => attachZoomBehavior(visualAid, q), 200);

    // ===== BOX METHOD DIVISION =====
    // Per-digit division scaffold. Inputs: .bx-roof, .bx-sub, .bx-rem inside q.visual.
    // Auto-advance focus when each cell is filled, Enter submits.
    if (q.answerType === "box-division") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const attachBoxDivListeners = () => {
            // Logical fill order: roof[0], sub[0], rem[0], roof[1], sub[1], rem[1], ...
            const numBoxes = visualAid.querySelectorAll('.bx-box-wrap').length;
            const ordered = [];
            for (let i = 0; i < numBoxes; i++) {
                const r = visualAid.querySelector(`.bx-roof[data-i="${i}"]`);
                const s = visualAid.querySelector(`.bx-sub[data-i="${i}"]`);
                const m = visualAid.querySelector(`.bx-rem[data-i="${i}"]`);
                if (r) ordered.push(r);
                if (s) ordered.push(s);
                if (m) ordered.push(m);
            }
            ordered.forEach((inp, idx) => {
                if (inp.dataset._bxAttached === '1') return;
                inp.dataset._bxAttached = '1';
                // Restrict to digits.
                inp.addEventListener('input', () => {
                    inp.value = (inp.value || '').replace(/[^0-9]/g, '').slice(0, parseInt(inp.maxLength, 10) || 3);
                    // Reset visual styling on edit.
                    inp.style.borderColor = '#1e88e5';
                    inp.style.background = '#fff';
                    // Auto-advance when this cell matches its expected answer.
                    const userVal = (inp.value || '').trim();
                    const expected = (inp.dataset.answer || '').trim();
                    if (userVal !== '' && Number(userVal) === Number(expected)) {
                        const next = ordered.slice(idx + 1).find(el => !(el.value || '').trim());
                        if (next) next.focus();
                    }
                });
                inp.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof window.submitAnswer === 'function') window.submitAnswer();
                    } else if (e.key === 'Backspace' && !(inp.value || '').trim() && idx > 0) {
                        ordered[idx - 1].focus();
                    } else if (e.key === 'Tab') {
                        // default tab behavior is fine
                    }
                });
            });
            // Focus the first empty input.
            const firstEmpty = ordered.find(el => !(el.value || '').trim());
            if (firstEmpty) {
                try { firstEmpty.focus(); } catch(_) {}
            }
        };
        attachBoxDivListeners();
        Promise.resolve().then(attachBoxDivListeners);
        setTimeout(attachBoxDivListeners, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for T-Chart drag-drop mode - always show visual regardless of difficulty
    if (q.answerType === "tchart-drag") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Per-question first-attempt + all-correct retry tracking reset.
        resetRetryState();
        if (state.ttsEnabled) speakQuestion();
        return;
    }
    
    // Check for area model mode - show visual and hide standard input
    if (q.answerType === "area-model") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // First-attempt + all-correct retry tracking is per-question; reset here.
        resetRetryState();

        // Add listeners to area model inputs
        setTimeout(() => {
            const areaInputs = visualAid.querySelectorAll('.area-model-input, .area-model-total');
            areaInputs.forEach(input => {
                input.addEventListener('input', () => checkAreaModelAnswer(input));
            });
        }, 50);
        
        if (state.ttsEnabled) speakQuestion();
        return;
    }
    
    // Check for number family / fact family mode
    if (q.answerType === "number-family" || q.answerType === "fact-family") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // First-attempt + all-correct retry tracking is per-question; reset here.
        resetRetryState();

        // Attach completion listeners to number-family / fact-family inputs.
        // Listen on `input` (every keystroke), `change` (final commit) and
        // `blur` (focus loss) so completion is detected reliably even when
        // the user pastes, uses autofill, or defocuses the last cell without
        // typing a final keystroke that fires `input`.
        const attachNFListeners = () => {
            const nfInputs = visualAid.querySelectorAll('.number-family-input, .fact-family-input');
            nfInputs.forEach((input, idx) => {
                if (input.dataset._nfListenerAttached === '1') return;
                input.dataset._nfListenerAttached = '1';
                input.addEventListener('change', () => checkNumberFamilyAnswer());
                input.addEventListener('blur', () => checkNumberFamilyAnswer());
                // On every keystroke: if this cell now matches its data-answer,
                // advance focus to the next empty input. Always run the global
                // completion check too so the green/red borders update live.
                input.addEventListener('input', () => {
                    const userVal = (input.value || '').trim();
                    const correctVal = input.dataset.answer || '';
                    if (userVal !== '' && userVal === correctVal) {
                        const all = Array.from(visualAid.querySelectorAll('.number-family-input, .fact-family-input'));
                        // Pick the next input (in DOM order, wrapping past this one) that is still empty.
                        const nextEmpty = [...all.slice(all.indexOf(input) + 1), ...all.slice(0, all.indexOf(input))]
                            .find(el => !(el.value || '').trim());
                        if (nextEmpty) nextEmpty.focus();
                    }
                    checkNumberFamilyAnswer();
                });
            });
        };
        // Attach immediately AND on a microtask + 50ms safety, so we don't
        // miss the case where the user starts typing before the deferred
        // setTimeout fires.
        attachNFListeners();
        Promise.resolve().then(attachNFListeners);
        setTimeout(attachNFListeners, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== FACTOR PAIRS (fill-in-the-blank rainbow style) =====
    // Visual contains .fp-input cells. Auto-advance focus when each cell
    // matches its data-answer; Enter submits via window.submitFactorPairs.
    if (q.answerType === "factor-pairs") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const attachFPListeners = () => {
            const fpInputs = Array.from(visualAid.querySelectorAll('.fp-input'));
            fpInputs.forEach((input, idx) => {
                if (input.dataset._fpAttached === '1') return;
                input.dataset._fpAttached = '1';
                input.addEventListener('input', () => {
                    // Restrict to digits.
                    const cleaned = (input.value || '').replace(/[^0-9]/g, '');
                    if (cleaned !== input.value) input.value = cleaned;
                    // Reset visual styling on edit.
                    input.classList.remove('correct', 'wrong');
                    const userVal = (input.value || '').trim();
                    const expected = String(input.dataset.answer || '').trim();
                    if (userVal !== '' && userVal === expected) {
                        // Auto-advance to next empty input (in DOM order; wrap).
                        const all = Array.from(visualAid.querySelectorAll('.fp-input'));
                        const here = all.indexOf(input);
                        const next = [...all.slice(here + 1), ...all.slice(0, here)]
                            .find(el => !(el.value || '').trim());
                        if (next) {
                            try { next.focus(); } catch (_) {}
                        }
                    }
                });
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof window.submitFactorPairs === 'function') {
                            window.submitFactorPairs();
                        } else if (typeof window.submitAnswer === 'function') {
                            window.submitAnswer();
                        }
                    } else if (e.key === 'Backspace' && !(input.value || '').trim() && idx > 0) {
                        const prev = fpInputs[idx - 1];
                        if (prev) prev.focus();
                    }
                });
            });
            const firstEmpty = fpInputs.find(el => !(el.value || '').trim());
            if (firstEmpty) {
                try { firstEmpty.focus(); } catch (_) {}
            }
        };
        attachFPListeners();
        Promise.resolve().then(attachFPListeners);
        setTimeout(attachFPListeners, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== INLINE BLANKS =====
    // ___ markers in q.text become real <input class="ib-cell"> boxes the
    // student types directly into. Right-side answer box is hidden — the
    // question text IS the input. Submit button injected below the question.
    if (q.answerType === "inline-blanks") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        // Visual (q.visual) is rendered via the requiresVisual block above.
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        const hintBtn = document.getElementById("hintBtn");
        if (hintBtn) hintBtn.style.display = "inline-block";
        hideNextButton();

        // Inject (or reuse) a Submit button right below the question text.
        const questionTextEl = document.getElementById("questionText");
        let ibSubmit = document.getElementById('ibSubmitBtn');
        if (!ibSubmit) {
            ibSubmit = document.createElement('button');
            ibSubmit.id = 'ibSubmitBtn';
            ibSubmit.type = 'button';
            ibSubmit.className = 'btn btn-primary';
            ibSubmit.textContent = 'Check';
            ibSubmit.style.cssText = 'margin-top:14px;padding:10px 28px;font-size:1.05rem;font-weight:700;cursor:pointer;';
            ibSubmit.onclick = () => {
                if (typeof window.submitInlineBlanks === 'function') {
                    window.submitInlineBlanks();
                } else if (typeof window.submitAnswer === 'function') {
                    window.submitAnswer();
                }
            };
        }
        // Mount just after the question text element (re-mount on every render
        // so it stays visible when prior questions hid it).
        if (questionTextEl && questionTextEl.parentNode) {
            if (ibSubmit.parentNode) ibSubmit.parentNode.removeChild(ibSubmit);
            questionTextEl.parentNode.insertBefore(ibSubmit, questionTextEl.nextSibling);
            ibSubmit.style.display = 'inline-block';
        }

        // Attach listeners to ib-cell inputs.
        const attachIBListeners = () => {
            const cells = Array.from(document.querySelectorAll('.ib-cell'));
            if (cells.length === 0) return;
            cells.forEach((cell, idx) => {
                if (cell.dataset._ibAttached === '1') return;
                cell.dataset._ibAttached = '1';
                cell.addEventListener('input', () => {
                    // Reset visual styling on edit.
                    cell.style.borderBottomColor = '#1565c0';
                    cell.style.color = '#1565c0';
                    // Auto-advance focus when this cell hits its maxlength.
                    const maxLen = parseInt(cell.maxLength, 10) || 4;
                    if ((cell.value || '').length >= maxLen) {
                        const next = cells[idx + 1];
                        if (next && !(next.value || '').trim()) {
                            try { next.focus(); } catch (_) {}
                        }
                    }
                });
                cell.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof window.submitInlineBlanks === 'function') {
                            window.submitInlineBlanks();
                        }
                    } else if (e.key === 'Backspace' && !(cell.value || '').trim() && idx > 0) {
                        try { cells[idx - 1].focus(); } catch (_) {}
                    }
                });
            });
            // Focus the first empty cell.
            const firstEmpty = cells.find(el => !(el.value || '').trim());
            if (firstEmpty) {
                try { firstEmpty.focus(); } catch (_) {}
            }
        };
        attachIBListeners();
        Promise.resolve().then(attachIBListeners);
        setTimeout(attachIBListeners, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== INLINE CLOZE (reusable primitive) =====
    // ___ markers in q.text become inline <select> dropdowns. Choices for
    // blank N come from q.clozeOptions[N]. q.ans is an array of accepted
    // values per blank. Submit checks each select against its expected
    // value and routes through the multi-place retry pipeline.
    if (q.answerType === "inline-cloze") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        // Visual (q.visual) is rendered via the requiresVisual block above
        // when set; otherwise visualAid is hidden by the else-branch.
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        const hintBtnCz = document.getElementById("hintBtn");
        if (hintBtnCz) hintBtnCz.style.display = "inline-block";
        hideNextButton();
        resetRetryState();

        // Inject (or reuse) a Submit button right below the question text.
        const questionTextElCz = document.getElementById("questionText");
        let clozeBtn = document.getElementById('clozeSubmitBtn');
        if (!clozeBtn) {
            clozeBtn = document.createElement('button');
            clozeBtn.id = 'clozeSubmitBtn';
            clozeBtn.type = 'button';
            clozeBtn.className = 'btn btn-primary';
            clozeBtn.textContent = 'Check';
            clozeBtn.style.cssText = 'margin-top:14px;padding:10px 28px;font-size:1.05rem;font-weight:700;cursor:pointer;';
        }
        // Re-mount on every render so it stays visible.
        if (questionTextElCz && questionTextElCz.parentNode) {
            if (clozeBtn.parentNode) clozeBtn.parentNode.removeChild(clozeBtn);
            questionTextElCz.parentNode.insertBefore(clozeBtn, questionTextElCz.nextSibling);
            clozeBtn.style.display = 'inline-block';
        }

        const _normalizeClozeVal = (v) => String(v == null ? '' : v).trim().toLowerCase().replace(/\s+/g, '');

        clozeBtn.onclick = () => {
            const qq = state.currentQ;
            if (!qq || qq.answerType !== 'inline-cloze') return;
            const cells = Array.from(document.querySelectorAll('.cloze-cell'));
            if (cells.length === 0) return;
            const ansArr = Array.isArray(qq.ans) ? qq.ans : [qq.ans];

            // Require every dropdown to have a non-empty pick before scoring.
            const allFilled = cells.every(c => String(c.value || '').trim().length > 0);
            const fb = document.getElementById('feedbackArea');
            if (!allFilled) {
                if (fb) {
                    fb.style.display = 'block';
                    fb.className = 'feedback-area hint';
                    fb.innerHTML = 'Pick a value for every blank.';
                }
                return;
            }

            // Per-cell paint + wrong count.
            let wrongCount = 0;
            cells.forEach((cell, i) => {
                const want = _normalizeClozeVal(ansArr[i]);
                const got = _normalizeClozeVal(cell.value);
                if (want === got) {
                    cell.style.borderBottomColor = '#2e7d32';
                    cell.style.color = '#2e7d32';
                } else {
                    cell.style.borderBottomColor = '#c62828';
                    cell.style.color = '#c62828';
                    wrongCount++;
                }
            });
            const allCorrect = wrongCount === 0;

            _handleMultiPlaceSubmit({
                qq,
                allCorrect,
                wrongCount,
                totalScored: cells.length,
                correctXP: 10,
                correctMessage: '🎉 Correct!',
                onRetry: () => {
                    // Re-enable selects so the student can change wrong picks.
                    cells.forEach(c => { c.disabled = false; });
                },
                onLockOnAllCorrect: () => {
                    cells.forEach(c => { c.disabled = true; });
                },
                onLockOnMapTest: () => {
                    cells.forEach(c => { c.disabled = true; });
                },
            });
        };

        // Reset paint on change (lets the student see fresh feedback after
        // editing a wrong pick).
        document.querySelectorAll('.cloze-cell').forEach(cell => {
            if (cell.dataset._clozeAttached === '1') return;
            cell.dataset._clozeAttached = '1';
            cell.addEventListener('change', () => {
                cell.style.borderBottomColor = '#1565c0';
                cell.style.color = '#1565c0';
            });
        });

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== IMAGE-HOTSPOT (reusable primitive) =====
    // q.hotspotSvg is an SVG string containing one or more <g class="hot"
    // data-id="x">…</g> groups. Student clicks groups to toggle selection;
    // Submit checks the selected set against q.ans (array of correct ids).
    if (q.answerType === "image-hotspot") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        // q.visual may be set (rendered above by requiresVisual block).
        // Mount the hotspot SVG into a dedicated host inside visualAid so
        // any prior q.visual content is preserved above.
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        const hintBtnHs = document.getElementById("hintBtn");
        if (hintBtnHs) hintBtnHs.style.display = "inline-block";
        hideNextButton();
        resetRetryState();

        // If q.hotspotSvg is set and the existing visualAid doesn't already
        // contain it, render it now into a dedicated host.
        let host = document.getElementById("imgHotspotHost");
        if (!host) {
            host = document.createElement('div');
            host.id = 'imgHotspotHost';
            host.style.cssText = 'text-align:center;margin:10px auto;';
            visualAid.appendChild(host);
        }
        host.innerHTML = q.hotspotSvg || '';

        // Wire click handlers on each .hot group: toggle data-selected,
        // paint a blue outline. Idempotent — safe to re-call.
        const wireHotspots = () => {
            const groups = host.querySelectorAll('g.hot, .hot');
            groups.forEach(g => {
                if (g.dataset._hotAttached === '1') return;
                g.dataset._hotAttached = '1';
                g.style.cursor = 'pointer';
                g.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const sel = g.dataset.selected === '1';
                    if (sel) {
                        g.dataset.selected = '0';
                        // Remove the selection rect we may have added.
                        const ring = g.querySelector('.hot-ring');
                        if (ring) ring.remove();
                    } else {
                        g.dataset.selected = '1';
                        // Add a selection ring sized to the group's bbox.
                        try {
                            const bb = g.getBBox();
                            const pad = 4;
                            const ring = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                            ring.setAttribute('x', bb.x - pad);
                            ring.setAttribute('y', bb.y - pad);
                            ring.setAttribute('width', bb.width + pad * 2);
                            ring.setAttribute('height', bb.height + pad * 2);
                            ring.setAttribute('fill', 'none');
                            ring.setAttribute('stroke', '#1565c0');
                            ring.setAttribute('stroke-width', '3');
                            ring.setAttribute('stroke-dasharray', '5,3');
                            ring.setAttribute('rx', '4');
                            ring.setAttribute('class', 'hot-ring');
                            g.appendChild(ring);
                        } catch (_) {
                            // Non-fatal: getBBox can throw for not-yet-rendered SVG.
                        }
                    }
                });
            });
        };
        wireHotspots();
        Promise.resolve().then(wireHotspots);
        setTimeout(wireHotspots, 50);

        // Inject (or reuse) a Submit button below the SVG.
        let hsBtn = document.getElementById('imgHotspotSubmitBtn');
        if (!hsBtn) {
            hsBtn = document.createElement('button');
            hsBtn.id = 'imgHotspotSubmitBtn';
            hsBtn.type = 'button';
            hsBtn.className = 'btn btn-primary';
            hsBtn.textContent = 'Check';
            hsBtn.style.cssText = 'margin:14px auto 0;display:block;padding:10px 28px;font-size:1.05rem;font-weight:700;cursor:pointer;';
        }
        if (hsBtn.parentNode) hsBtn.parentNode.removeChild(hsBtn);
        host.appendChild(hsBtn);
        hsBtn.style.display = 'block';

        hsBtn.onclick = () => {
            const qq = state.currentQ;
            if (!qq || qq.answerType !== 'image-hotspot') return;
            const groups = Array.from(host.querySelectorAll('g.hot, .hot'));
            const selectedIds = groups
                .filter(g => g.dataset.selected === '1')
                .map(g => g.dataset.id);
            const correctSet = new Set((Array.isArray(qq.ans) ? qq.ans : [qq.ans]).map(String));
            const selectedSet = new Set(selectedIds.map(String));

            const fb = document.getElementById('feedbackArea');
            if (selectedSet.size === 0) {
                if (fb) {
                    fb.style.display = 'block';
                    fb.className = 'feedback-area hint';
                    fb.innerHTML = 'Click at least one shape before checking.';
                }
                return;
            }

            // Per-group paint + count of incorrect picks (false positives +
            // missed correct picks).
            let wrongCount = 0;
            groups.forEach(g => {
                const id = String(g.dataset.id);
                const isAnswer = correctSet.has(id);
                const sel = selectedSet.has(id);
                // Clear any existing feedback ring.
                const ring = g.querySelector('.hot-ring');
                if (sel && isAnswer) {
                    if (ring) {
                        ring.setAttribute('stroke', '#2e7d32');
                        ring.setAttribute('stroke-dasharray', '');
                    }
                } else if (sel && !isAnswer) {
                    if (ring) {
                        ring.setAttribute('stroke', '#c62828');
                        ring.setAttribute('stroke-dasharray', '');
                    }
                    wrongCount++;
                } else if (!sel && isAnswer) {
                    // Missed answer — paint a faint dashed grey hint ring.
                    try {
                        const existing = g.querySelector('.hot-ring');
                        if (existing) existing.remove();
                        const bb = g.getBBox();
                        const pad = 4;
                        const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        r.setAttribute('x', bb.x - pad);
                        r.setAttribute('y', bb.y - pad);
                        r.setAttribute('width', bb.width + pad * 2);
                        r.setAttribute('height', bb.height + pad * 2);
                        r.setAttribute('fill', 'none');
                        r.setAttribute('stroke', '#90a4ae');
                        r.setAttribute('stroke-width', '2');
                        r.setAttribute('stroke-dasharray', '6,4');
                        r.setAttribute('rx', '4');
                        r.setAttribute('class', 'hot-ring');
                        g.appendChild(r);
                    } catch (_) {}
                    wrongCount++;
                }
            });
            const allCorrect = wrongCount === 0;

            _handleMultiPlaceSubmit({
                qq,
                allCorrect,
                wrongCount,
                totalScored: correctSet.size,
                correctXP: 10,
                correctMessage: '🎉 Correct!',
                onRetry: () => {
                    // Allow the student to keep clicking to fix wrong picks.
                    // (No lock — handler is already attached, click toggles selection.)
                },
                onLockOnAllCorrect: () => {
                    groups.forEach(g => { g.style.pointerEvents = 'none'; });
                },
                onLockOnMapTest: () => {
                    groups.forEach(g => { g.style.pointerEvents = 'none'; });
                },
            });
        };

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for dual mode (perimeter + area inputs in q.visual)
    if (q.answerType === "dual") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        // Wire Enter key on either input to submit, and add a submit button
        // if the visual didn't include one (legacy dual visuals just have
        // the two inputs and rely on the global Check button which is now
        // hidden — so inject a Check button into the visual).
        setTimeout(() => {
            const perimeterInput = document.getElementById("perimeterInput");
            const areaInput = document.getElementById("areaInput");
            const submitOnEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (typeof window.submitAnswer === 'function') window.submitAnswer();
                }
            };
            if (perimeterInput) perimeterInput.addEventListener('keydown', submitOnEnter);
            if (areaInput) areaInput.addEventListener('keydown', submitOnEnter);
            // Inject a Check button into visualAid if one isn't already there.
            if (!visualAid.querySelector('.dual-check-btn') && (perimeterInput || areaInput)) {
                const btnWrap = document.createElement('div');
                btnWrap.style.cssText = 'text-align:center;margin-top:15px;';
                btnWrap.innerHTML = `<button class="btn btn-primary dual-check-btn" type="button" onclick="submitAnswer()">Check</button>`;
                visualAid.appendChild(btnWrap);
            }
            if (perimeterInput) perimeterInput.focus();
        }, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for coordinate-multi mode (legacy plot mode — instructional only).
    // The coord-input branch below is preferred; this is just a safety net for
    // any legacy generators still emitting "coordinate-multi".
    if (q.answerType === "coordinate-multi") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for divisibility-sort mode (drag numbers into divisible/not-divisible boxes)
    if (q.answerType === "divisibility-sort") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Per-question first-attempt + all-correct retry tracking reset.
        resetRetryState();
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for dual-fraction mode (mixed + improper inputs)
    if (q.answerType === "dual-fraction") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        // Add listeners to dual-fraction inputs and enable check button
        setTimeout(() => {
            const mixedInput = document.getElementById("mixedInput");
            const improperInput = document.getElementById("improperInput");
            const checkBtn = document.getElementById("checkDualFracBtn");
            function updateDualFracBtn() {
                const bothFilled = mixedInput && mixedInput.value.trim() && improperInput && improperInput.value.trim();
                if (checkBtn) {
                    checkBtn.style.opacity = bothFilled ? '1' : '0.5';
                    checkBtn.style.pointerEvents = bothFilled ? 'auto' : 'none';
                }
            }
            if (mixedInput) mixedInput.addEventListener('input', updateDualFracBtn);
            if (improperInput) improperInput.addEventListener('input', updateDualFracBtn);
        }, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Plain "multi-select" answerType (legacy click-the-numbers grids like
    // factor identification). The visual contains its own clickable items
    // with .selected class toggled inline. We just need to hide the default
    // text-input + add a Submit button that reads the selected items.
    if (q.answerType === "multi-select") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual || "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Inject a Submit button into the visual.
        if (!visualAid.querySelector('.ms-submit-btn')) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ms-submit-btn primary-btn';
            btn.textContent = 'Submit';
            btn.style.cssText = 'margin:14px auto 0;display:block;padding:10px 24px;font-size:1rem;';
            btn.onclick = () => {
                if (typeof window.submitAnswer === 'function') window.submitAnswer();
            };
            visualAid.appendChild(btn);
        }
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for multi-select-check mode (generic checkbox grid, MAP-style)
    if (q.answerType === "multi-select-check") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        // The widget renders its own visual; suppress the generic visualAid block.
        if (q.visual) {
            visualAid.style.display = "block";
            visualAid.innerHTML = q.visual;
        } else {
            visualAid.style.display = "none";
            visualAid.innerHTML = "";
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        // Mount the widget into a dedicated container inside the visual area
        // (so it lives below any visual the question chose to render).
        const host = document.getElementById("multiSelectHost") || (() => {
            const h = document.createElement("div");
            h.id = "multiSelectHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/multi-select-check.js').then(mod => {
            resetRetryState();
            mod.renderMultiSelectCheck(q, host);
            mod.setOnMultiSelectSubmit((qq, selectedIds) => {
                const allCorrect = mod.checkMultiSelectCheck(qq, selectedIds);
                // Per-placement correctness paint + count of incorrect items
                const correctSet = new Set(qq.ans || []);
                const selectedSet = new Set(selectedIds);
                let wrongCount = 0;
                host.querySelectorAll('.msc-opt').forEach(el => {
                    el.classList.remove('correct-flash', 'wrong-flash');
                    const id = el.dataset.id;
                    const sel = selectedSet.has(id);
                    const isAnswer = correctSet.has(id);
                    if (sel && isAnswer) el.classList.add('correct-flash');
                    else if (sel && !isAnswer) { el.classList.add('wrong-flash'); wrongCount++; }
                    else if (!sel && isAnswer) { el.classList.add('wrong-flash'); wrongCount++; }
                });

                // Total scored placements = every option (each is either
                // correctly-on or correctly-off). Using correctSet.size here
                // produced misleading messages like "Not quite — 5 to fix"
                // when the student had selected the correct items but there
                // were extras still flagged as wrong.
                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount,
                    totalScored: (qq.options && qq.options.length) || correctSet.size,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._mscUnlockForRetry) host._mscUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._mscLock) host._mscLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._mscLock) host._mscLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load multi-select-check widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for ten-frame mode (K-2 manipulative — student fills cells)
    if (q.answerType === "ten-frame") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        if (q.visual) {
            visualAid.style.display = "block";
            visualAid.innerHTML = q.visual;
        } else {
            visualAid.style.display = "block";
            visualAid.innerHTML = "";
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("tenFrameHost") || (() => {
            const h = document.createElement("div");
            h.id = "tenFrameHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/ten-frame.js').then(mod => {
            mod.renderTenFrame(q, host);
            mod.setOnTenFrameSubmit((qq, count) => {
                const correct = mod.checkTenFrame(qq, count);

                // Visual feedback: flash all currently-filled cells green or red
                const cells = host.querySelectorAll('.tf-cell.filled');
                cells.forEach(el => el.classList.add(correct ? 'correct-flash' : 'wrong-flash'));

                const feedback = document.getElementById("feedbackArea");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area " + (correct ? "correct" : "incorrect");
                    feedback.innerHTML = correct
                        ? "🎉 Correct!"
                        : `Not quite. The answer is ${qq.ans}.`;
                }

                // Route through the existing pipeline
                state.lastAnswerCorrect = correct;
                state.hasAnswered = true;
                if (correct) {
                    state.score++;
                    state.sessionStreak++;
                    document.getElementById("gameScore") && (document.getElementById("gameScore").innerText = `${state.score} Correct`);
                    document.getElementById("questionCard").classList.add("correct-bg");
                    if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
                    if (typeof window.confetti === 'function') window.confetti();
                    if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
                    if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
                } else {
                    document.getElementById("questionCard").classList.add("incorrect-bg");
                    state.sessionStreak = 0;
                    if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
                }
                if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(correct);
                trackSkillAnswer(correct);
                if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, correct, tm);
                }

                // MAP mode hand-off
                if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct });
                    return;
                }

                if (correct && typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
                    setTimeout(() => {
                        if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    }, 800);
                }
            });
        }).catch(err => console.error('Failed to load ten-frame widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for dnd-generic mode (drag-and-drop: order or categorize)
    if (q.answerType === "dnd-generic") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        if (q.visual) {
            visualAid.style.display = "block";
            visualAid.innerHTML = q.visual;
        } else {
            visualAid.style.display = "block";
            visualAid.innerHTML = "";
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("dndGenericHost") || (() => {
            const h = document.createElement("div");
            h.id = "dndGenericHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/dnd-generic.js').then(mod => {
            resetRetryState();
            mod.renderDndGeneric(q, host);
            mod.setOnDndSubmit((qq, st) => {
                const allCorrect = mod.checkDndGeneric(qq, st);

                // Per-placement correctness + the wrong-tile id list (so the
                // widget can move them back to the tray for retry).
                const wrongTileIds = [];
                let totalScored = 0;
                if (qq.dndMode === 'categorize' || qq.dndMode === 'shape-match') {
                    const ans = qq.ans || {};
                    totalScored = Object.keys(ans).length;
                    host.querySelectorAll('.dnd-bin .dnd-tile').forEach(el => {
                        el.classList.remove('correct-flash', 'wrong-flash');
                        const tid = el.dataset.id;
                        const placedBin = el.closest('.dnd-bin')?.dataset.bin;
                        const goodBin = ans[tid];
                        if (goodBin == null) {
                            // Distractor placed somewhere — treat as wrong placement
                            el.classList.add('wrong-flash');
                            wrongTileIds.push(tid);
                        } else if (placedBin === goodBin) {
                            el.classList.add('correct-flash');
                        } else {
                            el.classList.add('wrong-flash');
                            wrongTileIds.push(tid);
                        }
                    });
                } else {
                    // order
                    const ansArr = Array.isArray(qq.ans) ? qq.ans : [];
                    totalScored = ansArr.length;
                    host.querySelectorAll('.dnd-slot').forEach((slot, i) => {
                        const tile = slot.querySelector('.dnd-tile');
                        if (!tile) return;
                        tile.classList.remove('correct-flash', 'wrong-flash');
                        if (tile.dataset.id === ansArr[i]) {
                            tile.classList.add('correct-flash');
                        } else {
                            tile.classList.add('wrong-flash');
                            wrongTileIds.push(tile.dataset.id);
                        }
                    });
                }

                _handleMultiPlaceSubmit({
                    qq, host,
                    allCorrect,
                    wrongCount: wrongTileIds.length,
                    totalScored,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._dndUnlockForRetry) host._dndUnlockForRetry(wrongTileIds);
                    },
                    onLockOnAllCorrect: () => {
                        if (host._dndLock) host._dndLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._dndLock) host._dndLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load dnd-generic widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for pv-build mode (place value disks workmat — drag colored
    // disks from a palette into hundreds/tens/ones zones to build a target
    // number). Self-submits via in-widget Submit; widget owns its DOM.
    if (q.answerType === "pv-build") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("pvBuildHost") || (() => {
            const h = document.createElement("div");
            h.id = "pvBuildHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/pv-disks-build.js').then(mod => {
            resetRetryState();
            mod.renderPvDisksBuild(q, host);
            mod.setOnPvBuildSubmit((qq, counts) => {
                const allCorrect = mod.checkPvDisksBuild(qq, counts);

                // Per-zone correctness paint + count of wrong zones.
                const target = Math.max(0, Math.floor(qq.target || 0));
                const places = (Array.isArray(qq.places) && qq.places.length)
                    ? qq.places.slice()
                    : [];
                let wrongCount = 0;
                places.forEach(p => {
                    const expected = Math.floor(target / p) % 10;
                    const stack = host.querySelector(`.pvb-zone-stack[data-place="${p}"]`);
                    if (!stack) return;
                    const disks = stack.querySelectorAll('.pvb-disk');
                    // Clear any prior submit's flash classes before re-painting.
                    disks.forEach(d => d.classList.remove('correct-flash', 'wrong-flash'));
                    const ok = (disks.length === expected);
                    if (ok) {
                        disks.forEach(d => d.classList.add('correct-flash'));
                    } else {
                        disks.forEach(d => d.classList.add('wrong-flash'));
                        wrongCount++;
                    }
                });

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount,
                    totalScored: places.length,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._pvUnlockForRetry) host._pvUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._pvLock) host._pvLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._pvLock) host._pvLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load pv-disks-build widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for pv-digit-drag mode (drag the digits of a 5- or 6-digit number
    // into the matching place value column). Self-submits via in-widget Submit.
    if (q.answerType === "pv-digit-drag") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("pvDigitDragHost") || (() => {
            const h = document.createElement("div");
            h.id = "pvDigitDragHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/pv-digit-drag.js').then(mod => {
            resetRetryState();
            mod.renderPvDigitDrag(q, host);
            mod.setOnPvDigitDragSubmit((qq, placement) => {
                const allCorrect = mod.checkPvDigitDrag(qq, placement);

                // Per-column correctness paint + count of wrong columns.
                const target = Math.max(0, Math.floor(qq.target || 0));
                const places = (Array.isArray(qq.places) && qq.places.length)
                    ? qq.places.slice()
                    : [];
                let wrongCount = 0;
                places.forEach(p => {
                    const expected = Math.floor(target / p) % 10;
                    const drop = host.querySelector(`.pvdd-drop[data-place="${p}"]`);
                    if (!drop) return;
                    const tile = drop.querySelector('.pvdd-tile');
                    // Clear any prior submit's flash classes before re-painting.
                    if (tile) tile.classList.remove('correct-flash', 'wrong-flash');
                    const actual = tile ? parseInt(tile.dataset.digit, 10) : null;
                    const ok = (actual === expected);
                    if (tile) {
                        tile.classList.add(ok ? 'correct-flash' : 'wrong-flash');
                    }
                    if (!ok) wrongCount++;
                });

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount,
                    totalScored: places.length,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._pvddUnlockForRetry) host._pvddUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._pvddLock) host._pvddLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._pvddLock) host._pvddLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load pv-digit-drag widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for ten-frame-build mode (drag dots into a 5×2 frame to match target)
    if (q.answerType === "ten-frame-build") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("tenFrameBuildHost") || (() => {
            const h = document.createElement("div");
            h.id = "tenFrameBuildHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/ten-frame-build.js').then(mod => {
            resetRetryState();
            mod.renderTenFrameBuild(q, host);
            mod.setOnTenFrameBuildSubmit((qq, placed) => {
                const allCorrect = mod.checkTenFrameBuild(qq, placed);

                // Per-cell paint: green for filled cells when correct, red when wrong.
                const filledCells = host.querySelectorAll('.tfb-cell.tfb-filled');
                filledCells.forEach(c => c.classList.remove('correct-flash', 'wrong-flash'));
                if (allCorrect) {
                    filledCells.forEach(c => c.classList.add('correct-flash'));
                } else {
                    filledCells.forEach(c => c.classList.add('wrong-flash'));
                }

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount: allCorrect ? 0 : 1,
                    totalScored: 1,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._tfbUnlockForRetry) host._tfbUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._tfbLock) host._tfbLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._tfbLock) host._tfbLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load ten-frame-build widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for graph-builder mode (interactive bar graph or pictograph builder)
    if (q.answerType === "graph-builder") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("graphBuilderHost") || (() => {
            const h = document.createElement("div");
            h.id = "graphBuilderHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/graph-builder.js').then(mod => {
            resetRetryState();
            mod.renderGraphBuilder(q, host);
            mod.setOnGraphBuilderSubmit((qq, current) => {
                const result = mod.checkGraphBuilder(qq, current);
                mod.paintGraphBuilderResult(host, qq, result);

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect: result.allCorrect,
                    wrongCount: result.wrongCount,
                    totalScored: (qq.targetData || []).length,
                    correctXP: 12,
                    correctMessage: "🎉 Graph built correctly!",
                    onRetry: () => {
                        if (host._gbUnlockForRetry) host._gbUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._gbLock) host._gbLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._gbLock) host._gbLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load graph-builder widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for base10-build mode (drag rod/unit/flat blocks to model a number)
    if (q.answerType === "base10-build") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("base10BuildHost") || (() => {
            const h = document.createElement("div");
            h.id = "base10BuildHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/base10-build.js').then(mod => {
            resetRetryState();
            mod.renderBase10Build(q, host);
            mod.setOnBase10BuildSubmit((qq, st) => {
                // Total-value check (any combo of blocks summing to target counts).
                const allCorrect = mod.checkBase10Build(qq, st);

                // Paint per-zone correctness based on whether each zone's blocks
                // contribute correctly toward the canonical digit OR the running
                // total works out. We use the simple rule: if total matches,
                // everything green; if not, paint zones that have blocks red.
                const places = (Array.isArray(qq.places) && qq.places.length)
                    ? qq.places.slice() : [];
                let wrongCount = 0;
                places.forEach(p => {
                    const stack = host.querySelector(`.b10-zone-stack[data-place="${p}"]`);
                    if (!stack) return;
                    const blocks = stack.querySelectorAll('.b10-block');
                    blocks.forEach(b => b.classList.remove('correct-flash', 'wrong-flash'));
                    if (allCorrect) {
                        blocks.forEach(b => b.classList.add('correct-flash'));
                    } else if (blocks.length > 0) {
                        blocks.forEach(b => b.classList.add('wrong-flash'));
                        wrongCount++;
                    }
                });

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount: allCorrect ? 0 : Math.max(1, wrongCount),
                    totalScored: Math.max(1, places.length),
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._b10UnlockForRetry) host._b10UnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._b10Lock) host._b10Lock();
                    },
                    onLockOnMapTest: () => {
                        if (host._b10Lock) host._b10Lock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load base10-build widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for drag-fill mode (drag values from palette into slots)
    if (q.answerType === "drag-fill") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual || "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const dfHost = document.getElementById("dragFillHost") || (() => {
            const h = document.createElement("div");
            h.id = "dragFillHost";
            visualAid.appendChild(h);
            return h;
        })();
        dfHost.innerHTML = "";

        import('./widgets/drag-fill.js').then(mod => {
            resetRetryState();
            mod.renderDragFill(q, dfHost);
            mod.setOnDragFillSubmit((qq, st) => {
                const allCorrect = mod.checkDragFill(qq, st);
                // Compute per-slot correctness and the wrong-slot ids list.
                const ans = (qq && qq.ans) || {};
                const wrongSlotIds = [];
                let totalScored = 0;
                Object.keys(ans).forEach(sid => {
                    totalScored++;
                    const slotEl = dfHost.querySelector(`.df-slot[data-slot-id="${CSS.escape(String(sid))}"]`);
                    if (!slotEl) return;
                    slotEl.classList.remove('correct-flash', 'wrong-flash');
                    const userVal = String(st && st[sid] != null ? st[sid] : '');
                    const expected = String(ans[sid]);
                    let ok = (userVal === expected);
                    if (!ok && qq.slots) {
                        const sdef = qq.slots.find(s => s && s.id === sid);
                        if (sdef && Array.isArray(sdef.acceptedValues)) {
                            const accepted = sdef.acceptedValues.map(v => String(v));
                            ok = accepted.includes(userVal);
                        }
                    }
                    if (ok) slotEl.classList.add('correct-flash');
                    else { slotEl.classList.add('wrong-flash'); wrongSlotIds.push(sid); }
                });

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount: wrongSlotIds.length,
                    totalScored,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (dfHost._dfUnlockForRetry) dfHost._dfUnlockForRetry(wrongSlotIds);
                    },
                    onLockOnAllCorrect: () => {
                        if (dfHost._dfLock) dfHost._dfLock();
                    },
                    onLockOnMapTest: () => {
                        if (dfHost._dfLock) dfHost._dfLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load drag-fill widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for hot-spot mode (click invisible polygon/rect/circle overlays)
    if (q.answerType === "hot-spot") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        // The widget renders its own background+overlay; suppress generic visualAid usage.
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("hotSpotHost") || (() => {
            const h = document.createElement("div");
            h.id = "hotSpotHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/hot-spot.js').then(mod => {
            mod.renderHotSpot(q, host);
            mod.setOnHotSpotSubmit((qq, selectedIds) => {
                const correct = mod.checkHotSpot(qq, selectedIds);

                // Visual feedback: paint each region per its truth/selection
                const ansArr = Array.isArray(qq.ans) ? qq.ans : [qq.ans];
                const correctSet = new Set(ansArr);
                const selectedSet = new Set(selectedIds);
                host.querySelectorAll('.hs-region').forEach(el => {
                    const id = el.dataset.id;
                    const sel = selectedSet.has(id);
                    const isAnswer = correctSet.has(id);
                    if (sel && isAnswer) el.classList.add('correct-flash');
                    else if (sel && !isAnswer) el.classList.add('wrong-flash');
                    else if (!sel && isAnswer) el.classList.add('wrong-flash');
                });

                const feedback = document.getElementById("feedbackArea");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area " + (correct ? "correct" : "incorrect");
                    feedback.innerHTML = correct
                        ? "🎉 Correct!"
                        : "Not quite. Correct regions are highlighted.";
                }

                // Route through the existing pipeline
                state.lastAnswerCorrect = correct;
                state.hasAnswered = true;
                if (correct) {
                    state.score++;
                    state.sessionStreak++;
                    document.getElementById("gameScore") && (document.getElementById("gameScore").innerText = `${state.score} Correct`);
                    document.getElementById("questionCard").classList.add("correct-bg");
                    if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
                    if (typeof window.confetti === 'function') window.confetti();
                    if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
                    if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
                } else {
                    document.getElementById("questionCard").classList.add("incorrect-bg");
                    state.sessionStreak = 0;
                    if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
                }
                if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(correct);
                trackSkillAnswer(correct);
                if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, correct, tm);
                }

                // MAP mode hand-off
                if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct });
                    return;
                }

                if (correct && typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
                    setTimeout(() => {
                        if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    }, 800);
                }
            });
        }).catch(err => console.error('Failed to load hot-spot widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for place-symmetry-lines mode (click candidate lines to mark
    // lines of symmetry on a single shape).
    if (q.answerType === "place-symmetry-lines") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("pslHost") || (() => {
            const h = document.createElement("div");
            h.id = "pslHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/place-symmetry-lines.js').then(mod => {
            resetRetryState();
            mod.renderPlaceSymmetryLines(q, host);
            mod.setOnPlaceSymmetryLinesSubmit((qq, selectedAngles) => {
                const allCorrect = mod.checkPlaceSymmetryLines(qq, selectedAngles);

                // Per-line correctness paint + count of wrong selections (and
                // missed answers).
                const ansArr = Array.isArray(qq.ans) ? qq.ans.map(a => Math.round(Number(a))) : [];
                const correctSet = new Set(ansArr);
                const selectedSet = new Set(selectedAngles.map(a => Math.round(Number(a))));
                const wrongAngles = [];
                let wrongCount = 0;
                host.querySelectorAll('.psl-cand').forEach(g => {
                    const a = Math.round(Number(g.dataset.angle));
                    const sel = selectedSet.has(a);
                    const isAnswer = correctSet.has(a);
                    const line = g.querySelector('.psl-line');
                    if (!line) return;
                    if (sel && isAnswer) {
                        line.setAttribute('stroke', '#2e7d32');
                        line.setAttribute('stroke-width', '4');
                        line.removeAttribute('stroke-dasharray');
                    } else if (sel && !isAnswer) {
                        line.setAttribute('stroke', '#c62828');
                        line.setAttribute('stroke-width', '4');
                        line.removeAttribute('stroke-dasharray');
                        wrongAngles.push(a);
                        wrongCount++;
                    } else if (!sel && isAnswer) {
                        // Missed correct line — counts as wrong but no toggle to undo.
                        line.setAttribute('stroke', '#90a4ae');
                        line.setAttribute('stroke-width', '1.5');
                        line.setAttribute('stroke-dasharray', '6,4');
                        wrongCount++;
                    }
                });

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount,
                    totalScored: correctSet.size,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._pslUnlockForRetry) host._pslUnlockForRetry(wrongAngles);
                    },
                    onLockOnAllCorrect: () => {
                        if (host._pslLock) host._pslLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._pslLock) host._pslLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load place-symmetry-lines widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for compose-fraction-tiles mode (drag unit-fraction tiles into a
    // target bar so their sum equals the target fraction).
    if (q.answerType === "compose-fraction-tiles") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("composeFracHost") || (() => {
            const h = document.createElement("div");
            h.id = "composeFracHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/compose-fraction-tiles.js').then(mod => {
            resetRetryState();
            mod.renderComposeFractionTiles(q, host);
            mod.setOnComposeFractionTilesSubmit((qq, placed) => {
                const allCorrect = mod.checkComposeFractionTiles(qq, placed);
                // Single "tile group" judgement — 1 wrong if not equal.
                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount: allCorrect ? 0 : 1,
                    totalScored: 1,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._cftFlashWrong) host._cftFlashWrong();
                        if (host._cftUnlockForRetry) host._cftUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._cftFlashCorrect) host._cftFlashCorrect();
                        if (host._cftLock) host._cftLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._cftLock) host._cftLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load compose-fraction-tiles widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for build-expr mode (drag number/operator tiles into ordered
    // slots to construct the expression that solves a word problem).
    if (q.answerType === "build-expr") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("buildExprHost") || (() => {
            const h = document.createElement("div");
            h.id = "buildExprHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/build-expression.js').then(mod => {
            resetRetryState();
            mod.renderBuildExpression(q, host);
            mod.setOnBuildExpressionSubmit((qq, tokens) => {
                const allCorrect = mod.checkBuildExpression(qq, tokens);
                const wrongIdxs = mod.wrongSlotIndexes(qq, tokens);
                const totalSlots = Array.isArray(qq.targetExpression) ? qq.targetExpression.length : 0;
                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount: wrongIdxs.length,
                    totalScored: totalSlots,
                    correctXP: 12,
                    correctMessage: "🎉 You built the expression!",
                    onRetry: () => {
                        if (host._bePaintFeedback) host._bePaintFeedback(wrongIdxs);
                        // Brief flash, then return wrong tiles to the palette.
                        setTimeout(() => {
                            if (host._beUnlockForRetry) host._beUnlockForRetry(wrongIdxs);
                        }, 700);
                    },
                    onLockOnAllCorrect: () => {
                        if (host._bePaintFeedback) host._bePaintFeedback([]);
                        if (host._beLock) host._beLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._beLock) host._beLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load build-expression widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for compose-shape-blocks mode (drag pattern blocks into snap-
    // points on a target outline; submit when every slot is filled with the
    // correct shape).
    if (q.answerType === "compose-shape-blocks") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("composeShapeHost") || (() => {
            const h = document.createElement("div");
            h.id = "composeShapeHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/compose-shape-blocks.js').then(mod => {
            resetRetryState();
            mod.renderComposeShapeBlocks(q, host);
            mod.setOnComposeShapeBlocksSubmit((qq, placement) => {
                const allCorrect = mod.checkComposeShapeBlocks(qq, placement);
                // Score per snap-point.
                const snapPoints = Array.isArray(qq.snapPoints) ? qq.snapPoints : [];
                let wrongCount = 0;
                for (const sp of snapPoints) {
                    if (placement[sp.id] !== sp.shape) wrongCount++;
                }
                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount,
                    totalScored: snapPoints.length,
                    correctXP: 10,
                    correctMessage: "🎉 Correct!",
                    onRetry: () => {
                        if (host._csbUnlockForRetry) host._csbUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._csbLock) host._csbLock();
                    },
                    onLockOnMapTest: () => {
                        if (host._csbLock) host._csbLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load compose-shape-blocks widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for numpad-input mode (on-screen numeric keypad — K-2 / SPED / tablet)
    if (q.answerType === "numpad-input") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        // The widget renders its own display+pad. Let the question render any
        // q.visual *above* the pad (visualAid is already populated by the
        // requiresVisual block above when q.visual is set).
        if (q.visual) {
            visualAid.style.display = "block";
        } else {
            visualAid.style.display = "block";
            visualAid.innerHTML = "";
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("numpadInputHost") || (() => {
            const h = document.createElement("div");
            h.id = "numpadInputHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/numpad-input.js').then(mod => {
            mod.renderNumpadInput(q, host);
            mod.setOnNumpadSubmit((qq, value) => {
                const correct = mod.checkNumpadInput(qq, value);

                // Visual feedback: flash the display green/red
                const npHost = host.querySelector('.np-host');
                if (npHost && typeof npHost._numpadFlash === 'function') {
                    npHost._numpadFlash(correct);
                }

                const feedback = document.getElementById("feedbackArea");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area " + (correct ? "correct" : "incorrect");
                    const displayAns = (typeof qq.ans === "number" && Number.isInteger(qq.ans))
                        ? qq.ans.toLocaleString()
                        : qq.ans;
                    feedback.innerHTML = correct
                        ? "🎉 Correct!"
                        : `Not quite. The answer is ${displayAns}.`;
                }

                // Route through the existing pipeline
                state.lastAnswerCorrect = correct;
                state.hasAnswered = true;
                if (correct) {
                    state.score++;
                    state.sessionStreak++;
                    document.getElementById("gameScore") && (document.getElementById("gameScore").innerText = `${state.score} Correct`);
                    document.getElementById("questionCard").classList.add("correct-bg");
                    if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
                    if (typeof window.confetti === 'function') window.confetti();
                    if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
                    if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
                } else {
                    document.getElementById("questionCard").classList.add("incorrect-bg");
                    state.sessionStreak = 0;
                    if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
                }
                if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(correct);
                trackSkillAnswer(correct);
                if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, correct, tm);
                }

                // MAP mode hand-off
                if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct });
                    return;
                }

                if (correct && typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
                    setTimeout(() => {
                        if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    }, 800);
                }
            });
        }).catch(err => console.error('Failed to load numpad-input widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for odd-even-select mode (click to select odd/even numbers)
    if (q.answerType === "odd-even-select") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Reset selection state
        oddEvenSelectState.selected = new Set();
        oddEvenSelectState.answered = false;
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for number-line-extended mode (MAP-style superset of
    // number-line-place: integers, decimals, fractions, negatives, drag,
    // arrow-key nudge, single or multi marker).
    if (q.answerType === "number-line-extended") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        if (q.visual) {
            visualAid.style.display = "block";
            visualAid.innerHTML = q.visual;
        } else {
            visualAid.style.display = "block";
            visualAid.innerHTML = "";
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("numberLineExtendedHost") || (() => {
            const h = document.createElement("div");
            h.id = "numberLineExtendedHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/number-line-extended.js').then(mod => {
            mod.renderNumberLineExtended(q, host);
            mod.setOnNumberLineSubmit((qq, st) => {
                const correct = mod.checkNumberLineExtended(qq, st);

                // Visual feedback: per-marker correctness flash
                const isMulti = Array.isArray(qq.ans) && qq.ans.length > 0
                    && typeof qq.ans[0] === 'object' && qq.ans[0] !== null;
                const nleHost = host.querySelector('.nle-host');
                if (nleHost && typeof nleHost._nleFlash === 'function') {
                    if (isMulti) {
                        const tol = (typeof qq.tolerance === 'number' && qq.tolerance >= 0)
                            ? qq.tolerance
                            : (typeof qq.minorSnap === 'number' && qq.minorSnap > 0
                                ? qq.minorSnap / 2 : 0.001);
                        const map = {};
                        qq.ans.forEach(m => {
                            const v = (st && typeof st === 'object') ? st[m.id] : null;
                            map[m.id] = (v != null && Math.abs(v - m.value) <= tol + 1e-9);
                        });
                        nleHost._nleFlash(map);
                    } else {
                        nleHost._nleFlash(correct);
                    }
                }

                const feedback = document.getElementById("feedbackArea");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area " + (correct ? "correct" : "incorrect");
                    let displayAns;
                    if (isMulti) {
                        displayAns = qq.ans.map(m => `${m.label || m.id} = ${m.value}`).join(', ');
                    } else {
                        displayAns = qq.ans;
                    }
                    feedback.innerHTML = correct
                        ? "🎉 Correct!"
                        : `Not quite. The answer is ${displayAns}.`;
                }

                // Route through the existing pipeline
                state.lastAnswerCorrect = correct;
                state.hasAnswered = true;
                if (correct) {
                    state.score++;
                    state.sessionStreak++;
                    document.getElementById("gameScore") && (document.getElementById("gameScore").innerText = `${state.score} Correct`);
                    document.getElementById("questionCard").classList.add("correct-bg");
                    if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
                    if (typeof window.confetti === 'function') window.confetti();
                    if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
                    if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
                } else {
                    document.getElementById("questionCard").classList.add("incorrect-bg");
                    state.sessionStreak = 0;
                    if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
                }
                if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(correct);
                trackSkillAnswer(correct);
                if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, correct, tm);
                }

                // MAP mode hand-off
                if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct });
                    return;
                }

                if (correct && typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
                    setTimeout(() => {
                        if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    }, 800);
                }
            });
        }).catch(err => console.error('Failed to load number-line-extended widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for clock-set mode (Phase 6 P1 #1 — interactive analog clock).
    // Student drags hour/minute hands or uses +/- buttons to set the time.
    if (q.answerType === "clock-set") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        if (q.visual) {
            visualAid.style.display = "block";
            visualAid.innerHTML = q.visual;
        } else {
            visualAid.style.display = "block";
            visualAid.innerHTML = "";
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.getElementById("clockSetHost") || (() => {
            const h = document.createElement("div");
            h.id = "clockSetHost";
            visualAid.appendChild(h);
            visualAid.style.display = "block";
            return h;
        })();
        host.innerHTML = "";

        import('./widgets/clock-set.js').then(mod => {
            mod.renderClockSet(q, host);
            mod.setOnClockSetSubmit((qq, st) => {
                const correct = mod.checkClockSet(qq, st);

                // Visual feedback: flash the clock face.
                const csHost = host.querySelector('.cs-host');
                if (csHost && typeof csHost._csFlash === 'function') {
                    csHost._csFlash(correct);
                }

                const feedback = document.getElementById("feedbackArea");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area " + (correct ? "correct" : "incorrect");
                    const dh = ((qq.ans.hour % 12) + 12) % 12;
                    const display = (dh === 0 ? 12 : dh) + ':' + String(qq.ans.minute).padStart(2, '0');
                    feedback.innerHTML = correct
                        ? "🎉 Correct!"
                        : `Not quite. The answer is ${display}.`;
                }

                // Route through the existing pipeline
                state.lastAnswerCorrect = correct;
                state.hasAnswered = true;
                if (correct) {
                    state.score++;
                    state.sessionStreak++;
                    document.getElementById("gameScore") && (document.getElementById("gameScore").innerText = `${state.score} Correct`);
                    document.getElementById("questionCard").classList.add("correct-bg");
                    if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
                    if (typeof window.confetti === 'function') window.confetti();
                    if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
                    if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
                } else {
                    document.getElementById("questionCard").classList.add("incorrect-bg");
                    state.sessionStreak = 0;
                    if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
                }
                if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(correct);
                trackSkillAnswer(correct);
                if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, correct, tm);
                }

                // MAP mode hand-off
                if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct });
                    return;
                }

                if (correct && typeof window.shouldShowNextButton === 'function' && window.shouldShowNextButton()) {
                    setTimeout(() => {
                        if (typeof window.transitionToNextQuestion === 'function') window.transitionToNextQuestion();
                    }, 800);
                }
            });
        }).catch(err => console.error('Failed to load clock-set widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for fraction-input mode (stacked numerator / denominator boxes).
    // Replaces the single "Type answer" box for any fraction-shaped answer
    // (q.ans matches "<int>/<int>") so students enter the numerator on top
    // and denominator on bottom — visual matches a written fraction.
    if (q.answerType === "fraction-input") {
        document.getElementById("answerOptions").style.display = "none";
        const inputArea = document.getElementById("answerInputArea");
        if (inputArea) {
            inputArea.innerHTML = `
                <div class="fi-host">
                    <div class="fi-stack">
                        <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="fi-num" id="fiNum" maxlength="4" autocomplete="off" placeholder="?" aria-label="numerator"/>
                        <div class="fi-bar"></div>
                        <input type="text" inputmode="numeric" pattern="-?[0-9]*" class="fi-den" id="fiDen" maxlength="4" autocomplete="off" placeholder="?" aria-label="denominator"/>
                    </div>
                    <button class="fi-submit" type="button" onclick="submitAnswer()">Check</button>
                </div>
            `;
            inputArea.style.display = "flex";
            inputArea.style.flexDirection = "column";
            inputArea.style.alignItems = "center";
        }
        if (q.visual) {
            visualAid.style.display = "block";
            visualAid.innerHTML = q.visual;
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        setTimeout(() => {
            const numEl = document.getElementById("fiNum");
            const denEl = document.getElementById("fiDen");
            if (numEl) numEl.focus();
            // Enter on either input submits; Tab from numerator → denominator
            // happens automatically via DOM order.
            [numEl, denEl].forEach(inp => {
                if (!inp) return;
                inp.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof window.submitAnswer === 'function') window.submitAnswer();
                    }
                });
            });
            // Wire live per-box green/red validation against q.ans ("a/b").
            try { wireBoxValidation(visualAid, q); } catch (_) {}
            try { wireBoxValidation(visualAid, q); } catch (_) {}
        }, 50);
        setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 220);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== COORD-PLOT (interactive click-to-place coordinate grid) =====
    // Plot-mode coordinate problems use the coord-plot widget — student
    // clicks lattice intersections to drop dots, click again to remove.
    // Submit reveals correct (green) / wrong (red) / missing (amber ring).
    if (q.answerType === "coord-plot") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.createElement('div');
        host.id = 'coordPlotHost';
        visualAid.appendChild(host);

        import('./widgets/coord-plot.js').then(mod => {
            resetRetryState();
            mod.renderCoordPlot(q, host);
            mod.setOnCoordPlotSubmit((qq, points) => {
                const allCorrect = mod.checkCoordPlot(qq, points);

                // Compute per-point correctness for wrong-count messaging.
                const ansArr = Array.isArray(qq.ans) ? qq.ans : [qq.ans];
                const expSet = new Set(ansArr.map(p => `${p.x},${p.y}`));
                const placedSet = new Set((points || []).map(p => `${p.x},${p.y}`));
                let wrongCount = 0;
                placedSet.forEach(k => { if (!expSet.has(k)) wrongCount++; }); // misplaced
                expSet.forEach(k => { if (!placedSet.has(k)) wrongCount++; }); // missing

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount,
                    totalScored: expSet.size,
                    correctXP: 15,
                    correctMessage: "🎉 Correct! All points placed correctly.",
                    onRetry: () => {
                        if (host._cpUnlockForRetry) host._cpUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._cpLock) host._cpLock();
                        if (typeof window.saveState === 'function') window.saveState();
                        resetAttemptTracking();
                    },
                    onLockOnMapTest: () => {
                        if (host._cpLock) host._cpLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load coord-plot widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== NL-DRAG (drag marker(s) onto a number line) =====
    // Cross-cutting drag-onto-tick widget: fractions, decimals, integers,
    // mixed numbers. Marker snaps to the nearest tick on drop. Submit reveals
    // green/red per marker plus amber rings for any expected-but-missing.
    if (q.answerType === "nl-drag") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.createElement('div');
        host.id = 'nlDragHost';
        visualAid.appendChild(host);

        import('./widgets/nl-drag.js').then(mod => {
            resetRetryState();
            mod.renderNlDrag(q, host);
            mod.setOnNlDragSubmit((qq, results) => {
                const allCorrect = mod.checkNlDrag(qq, results);
                const totalScored = (qq.nlData && qq.nlData.targets) ? qq.nlData.targets.length : results.length;
                let wrongCount = 0;
                results.forEach(r => { if (!r || !r.correct) wrongCount++; });

                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount,
                    totalScored,
                    correctXP: 12,
                    correctMessage: "🎉 Correct! Marker(s) placed at the right tick(s).",
                    onRetry: () => {
                        if (host._nldUnlockForRetry) host._nldUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._nldLock) host._nldLock();
                        if (typeof window.saveState === 'function') window.saveState();
                        resetAttemptTracking();
                    },
                    onLockOnMapTest: () => {
                        if (host._nldLock) host._nldLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load nl-drag widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== COL-SUBTRACT (vertical column-subtraction workmat) =====
    // Money "make-change" word problems and similar decimal subtraction
    // questions render the operands as a vertical, decimal-aligned grid
    // with per-digit answer cells. Each cell live-validates GREEN/RED on
    // input. When all digits are correct, the widget auto-submits.
    if (q.answerType === "col-subtract") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.createElement('div');
        host.id = 'colSubtractHost';
        visualAid.appendChild(host);

        import('./widgets/col-subtract.js').then(mod => {
            resetRetryState();
            mod.renderColSubtract(q, host);
            mod.setOnColSubtractSubmit((qq, value) => {
                const allCorrect = mod.checkColSubtract(qq, value);
                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect,
                    wrongCount: allCorrect ? 0 : 1,
                    totalScored: 1,
                    correctXP: 12,
                    correctMessage: "🎉 Correct! You worked through the subtraction.",
                    onRetry: () => {
                        if (host._csUnlockForRetry) host._csUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._csLock) host._csLock();
                        if (typeof window.saveState === 'function') window.saveState();
                        resetAttemptTracking();
                    },
                    onLockOnMapTest: () => {
                        if (host._csLock) host._csLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load col-subtract widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== ARRAY-BUILDER (rows×cols manipulative for "rows of N" word problems) =====
    // Renders a blank grid; click cells to place icons. Counter shows
    // X of Y placed. Single number input below grid for the typed total.
    // When q.useArrayBuilder is set the col-arith workmat is SKIPPED.
    if (q.answerType === "array-builder") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        // Don't show the auto-generated array visual when we're already
        // showing an interactive grid below — but do show any equation
        // builder / word-problem helper if present (separate piece).
        // Simplest: clear visualAid, then attach widget host.
        visualAid.innerHTML = '';
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.createElement('div');
        host.id = 'arrayBuilderHost';
        visualAid.appendChild(host);

        import('./widgets/array-builder.js').then(mod => {
            resetRetryState();
            mod.renderArrayBuilder(q, host);
            mod.setOnArrayBuilderSubmit((qq, _value, allCorrect) => {
                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect: !!allCorrect,
                    wrongCount: allCorrect ? 0 : 1,
                    totalScored: 1,
                    correctXP: 12,
                    correctMessage: "🎉 Correct! Nice array building.",
                    onRetry: () => {
                        if (host._abUnlockForRetry) host._abUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._abLock) host._abLock();
                        if (typeof window.saveState === 'function') window.saveState();
                        resetAttemptTracking();
                    },
                    onLockOnMapTest: () => {
                        if (host._abLock) host._abLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load array-builder widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // ===== COL-ARITH (unified column-arithmetic workmat) =====
    // Word problems for ALL operations route through this widget. Branches
    // on q.colMode in {'add','sub','mult','div'} and renders the matching
    // vertical layout with per-digit GREEN/RED live validation. Auto-submits
    // when all answer cells are correct.
    if (q.answerType === "col-arith") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        // Preserve the question's pre-set visual (e.g. an icon/array/bar
        // model) and APPEND the workmat below it, so kids see both the
        // word-problem visual aid AND the column workmat.
        const preexistingVisual = q.visual || '';
        visualAid.innerHTML = preexistingVisual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        const host = document.createElement('div');
        host.id = 'colArithHost';
        host.style.marginTop = preexistingVisual ? '14px' : '0';
        visualAid.appendChild(host);

        import('./widgets/col-arith.js').then(mod => {
            resetRetryState();
            mod.renderColArith(q, host);
            mod.setOnColArithSubmit((qq, _value, allCorrect) => {
                _handleMultiPlaceSubmit({
                    qq,
                    allCorrect: !!allCorrect,
                    wrongCount: allCorrect ? 0 : 1,
                    totalScored: 1,
                    correctXP: 12,
                    correctMessage: "🎉 Correct! Great work in the column workmat.",
                    onRetry: () => {
                        if (host._caUnlockForRetry) host._caUnlockForRetry();
                    },
                    onLockOnAllCorrect: () => {
                        if (host._caLock) host._caLock();
                        if (typeof window.saveState === 'function') window.saveState();
                        resetAttemptTracking();
                    },
                    onLockOnMapTest: () => {
                        if (host._caLock) host._caLock();
                    },
                });
            });
        }).catch(err => console.error('Failed to load col-arith widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for shade-parts mode (interactive click-to-toggle on SVG groups).
    // Each <g class="shade-target" data-idx data-shaded="0"> in q.visual flips
    // its child fill on click. Submit counts shaded targets vs q.shadeTarget.
    if (q.answerType === "shade-parts") {
        document.getElementById("answerOptions").style.display = "none";
        const inputArea = document.getElementById("answerInputArea");
        if (inputArea) {
            inputArea.innerHTML = `<button class="sp-submit" type="button" style="padding:12px 32px;font-size:1.1rem;font-weight:600;background:var(--accent-cyan);color:#fff;border:none;border-radius:8px;cursor:pointer;" onclick="submitAnswer()">Submit</button>`;
            inputArea.style.display = "flex";
            inputArea.style.flexDirection = "column";
            inputArea.style.alignItems = "center";
        }
        if (q.visual) {
            visualAid.style.display = "block";
            visualAid.innerHTML = q.visual;
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Per-question first-attempt + all-correct retry tracking reset.
        resetRetryState();

        // Wire click-to-toggle on every .shade-target group
        setTimeout(() => {
            const targets = visualAid.querySelectorAll('.shade-target');
            targets.forEach(g => {
                g.addEventListener('click', () => {
                    if (state.hasAnswered) return;
                    const fillEl = g.querySelector('[data-fill-color]') || g.querySelector('rect, path, circle');
                    if (!fillEl) return;
                    const isShaded = g.getAttribute('data-shaded') === '1';
                    const fillColor = fillEl.getAttribute('data-fill-color') || '#1e88e5';
                    if (isShaded) {
                        g.setAttribute('data-shaded', '0');
                        fillEl.setAttribute('fill', '#ffffff');
                    } else {
                        g.setAttribute('data-shaded', '1');
                        fillEl.setAttribute('fill', fillColor);
                    }
                });
            });
        }, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for coord-input mode (separate X/Y boxes with pre-rendered parens+comma).
    // The visual already contains the inputs + a Check button (built in gen-geometry.js).
    // Hide the standard answer input area; the in-visual button calls submitAnswer().
    if (q.answerType === "coord-input") {
        document.getElementById("answerOptions").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        // Move the X/Y input host (.ci-host) from visualAid (left column) to
        // answerInputArea (right column) so the coord plane stays on the left
        // and the answer boxes sit on the right in side-by-side layout.
        const _ciHost = visualAid.querySelector('.ci-host');
        const _inputArea = document.getElementById('answerInputArea');
        if (_ciHost && _inputArea) {
            _inputArea.style.display = 'flex';
            _inputArea.style.flexDirection = 'column';
            _inputArea.style.alignItems = 'center';
            _inputArea.innerHTML = '';
            _inputArea.appendChild(_ciHost);
        } else {
            document.getElementById("answerInputArea").style.display = "none";
        }
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        // Auto-focus the first x input and wire Enter-key submit / cross-input arrow nav
        setTimeout(() => {
            const firstX = (_ciHost || visualAid).querySelector('.ci-x');
            if (firstX) firstX.focus();
            const ciInputs = (_ciHost || visualAid).querySelectorAll('.ci-x, .ci-y');
            ciInputs.forEach((inp) => {
                inp.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (typeof window.submitAnswer === 'function') window.submitAnswer();
                    }
                });
            });
        }, 50);

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for grid-fill mode (generic interactive grid where blank cells
    // become per-cell numeric inputs). The widget builds the grid into a
    // host inside #visualAid; wireBoxValidation handles green/red coloring
    // and auto-advance once every blank is correct.
    if (q.answerType === "grid-fill") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = "";

        // Optional title from q.text — rendered above the grid host.
        if (q.text) {
            const titleEl = document.createElement('div');
            titleEl.className = 'gf-question-title';
            titleEl.textContent = q.text;
            visualAid.appendChild(titleEl);
        }

        const host = document.createElement('div');
        host.id = 'gridFillHost';
        visualAid.appendChild(host);

        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        import('./widgets/grid-fill.js').then(mod => {
            mod.renderGridFill(q, host);
            // Trigger live validation now that the inputs exist. Same triple-
            // defer pattern used by the column-input wiring above to survive
            // any late-mount layout reshuffles.
            setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 0);
            setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 80);
            setTimeout(() => { try { wireBoxValidation(visualAid, q); } catch (_) {} }, 220);
        }).catch(err => console.error('Failed to load grid-fill widget:', err));

        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for number-line-place mode (interactive fraction placement)
    if (q.answerType === "number-line-place") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Reset placement state
        numberLinePlaceState.selectedIndex = null;
        numberLinePlaceState.answered = false;
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for interactive ordering mode
    if (q.answerType === "interactive" && q.interactiveType === "ordering") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = renderInteractiveOrdering(q);
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Per-question first-attempt + all-correct retry tracking reset.
        resetRetryState();
        // Wire HTML5 drag-and-drop on the freshly-rendered tiles (click mode only).
        if ((q.orderMode || "input") === "click") {
            setupOrderingDragHandlers();
        }
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    // Check for interactive expanded form mode
    if (q.answerType === "interactive" && q.interactiveType === "expanded") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = renderInteractiveExpanded(q);
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();
        // Per-question first-attempt + all-correct retry tracking reset.
        resetRetryState();
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    const useMultipleChoice = q.options.length > 0;
    const isClockChoice = q.answerType === "clock-choice";
    const hideInput = useMultipleChoice || isClockChoice;
    document.getElementById("answerOptions").style.display = useMultipleChoice ? "grid" : "none";
    document.getElementById("answerInputArea").style.display = hideInput ? "none" : "flex";
    // #answerInput can be missing if a previous widget render replaced
    // #answerInputArea contents (multi-select-check, dnd-generic, etc.).
    // Guard so the dispatcher's default text-input path doesn't throw —
    // widget answer types handle their own input below.
    const answerInput = document.getElementById("answerInput");
    if (answerInput) {
        answerInput.value = "";
        answerInput.disabled = false;
        answerInput.style.borderColor = "transparent";
        answerInput.style.background = "";
        if (!hideInput) answerInput.focus();
    }
    document.getElementById("feedbackArea").style.display = "none";
    document.getElementById("feedbackArea").className = "feedback-area";
    document.getElementById("hintBtn").style.display = "inline-block";
    // Hide solution button until answer is submitted
    const solutionBtn = document.getElementById("solutionBtn");
    if (solutionBtn) solutionBtn.style.display = "none";
    hideNextButton();

    if (useMultipleChoice) {
        const container = document.getElementById("answerOptions");
        container.innerHTML = "";
        q.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "answer-btn";
            // Display numbers with commas, but pass the raw value for checking
            btn.textContent = typeof opt === "number" && Number.isInteger(opt) ? opt.toLocaleString() : opt;
            btn.onclick = () => checkAnswer(opt, btn);

            // TTS on hover - speak when mouse enters, stop when mouse leaves
            btn.onmouseenter = () => speakAnswerOption(opt);
            btn.onmouseleave = () => stopSpeaking();

            container.appendChild(btn);
        });
    }

    if (state.ttsEnabled) speakQuestion();
}

// Interactive ordering state for click mode
let orderingState = { available: [], selected: [] };

// Interactive ordering - supports both input and click modes
export function renderInteractiveOrdering(q) {
    const direction = q.orderIcon || (q.orderDirection === "asc" ? "🔼 Smallest → Largest" : "🔽 Largest → Smallest");
    const numBoxes = q.numbers.length;
    const mode = q.orderMode || "input";

    if (mode === "click") {
        // Click-to-order mode
        orderingState = { available: [...q.numbers], selected: [] };

        return `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:18px;color:var(--text-dim);font-size:1.1rem;">${direction}</div>

            <!-- Selected numbers (answer area) -->
            <div style="margin-bottom:24px;">
                <div style="font-size:1.1rem;color:var(--text-dim);margin-bottom:10px;">Your order (click or drop to place; click a placed tile to remove):</div>
                <div id="selectedNumbers" class="ordering-target" style="display:flex;justify-content:center;gap:14px;flex-wrap:wrap;min-height:72px;padding:20px;background:var(--bg-card-light);border-radius:14px;border:3px dashed var(--accent-green);">
                    <span style="color:var(--text-dim);font-style:italic;font-size:1.05rem;" id="orderPlaceholder">Click or drag numbers below to place them here...</span>
                </div>
            </div>

            <!-- Available numbers -->
            <div>
                <div style="font-size:1.1rem;color:var(--text-dim);margin-bottom:10px;">Available numbers:</div>
                <div id="availableNumbers" style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
                    ${q.numbers.map(n => `<div class="order-num-btn ordering-tile" data-order-value="${n}" data-order-source="available" draggable="true" onclick="selectOrderNumber(${n})" style="background:var(--accent-cyan);color:white;padding:20px 28px;border-radius:14px;font-weight:800;font-size:1.7rem;cursor:grab;transition:transform 0.2s,box-shadow 0.2s,opacity 0.1s;box-shadow:0 4px 12px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">${n.toLocaleString()}</div>`).join("")}
                </div>
            </div>

            <!-- Check button -->
            <button class="btn btn-primary" id="checkOrderBtn" onclick="checkOrderingAnswer()" style="margin-top:20px;opacity:0.5;pointer-events:none;">Check Order</button>
        </div>`;
    } else {
        // Input boxes mode
        return `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:18px;color:var(--text-dim);font-size:1.1rem;">${direction}</div>

            <!-- Show the numbers to order -->
            <div style="margin-bottom:24px;">
                <div style="font-size:1.1rem;color:var(--text-dim);margin-bottom:12px;">Numbers to order:</div>
                <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">
                    ${q.numbers.map(n => `<div style="background:var(--accent-cyan);color:white;padding:20px 28px;border-radius:14px;font-weight:800;font-size:1.7rem;box-shadow:0 4px 12px rgba(0,0,0,0.15);">${n.toLocaleString()}</div>`).join("")}
                </div>
            </div>

            <!-- Input boxes for ordering -->
            <div style="margin-top:24px;">
                <div style="font-size:1.1rem;color:var(--text-dim);margin-bottom:12px;">Write each number in order:</div>
                <div id="orderInputBoxes" style="display:flex;justify-content:center;align-items:center;gap:10px;flex-wrap:wrap;">
                    ${Array.from({length: numBoxes}, (_, i) => `
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="background:var(--accent-orange);color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.05rem;font-weight:700;">${i + 1}</span>
                            <input type="text" class="order-input-box" data-order-idx="${i}"
                                style="width:115px;height:62px;text-align:center;font-size:1.5rem;font-weight:700;border:4px solid var(--accent-cyan);border-radius:12px;background:var(--bg-card);color:var(--text-primary);outline:none;"
                                oninput="checkOrderInputsFilled()" placeholder="">
                            ${i < numBoxes - 1 ? '<span style="color:var(--accent-orange);font-size:2rem;margin:0 6px;">→</span>' : ''}
                        </div>
                    `).join("")}
                </div>
            </div>

            <!-- Check button -->
            <button class="btn btn-primary" id="checkOrderBtn" onclick="checkOrderingAnswer()" style="margin-top:20px;opacity:0.5;pointer-events:none;">Check Order</button>
        </div>`;
    }
}

// Click mode functions
// NOTE: orderingState arrays may hold EITHER numbers (whole-number ordering
// from gen-algebraic.js) OR strings (decimal ordering from gen-fractions.js,
// where odNums.map(String) produces "5.08", "8.61", etc.). The inline
// onclick="selectOrderNumber(5.08)" passes a number argument, so a strict
// indexOf would fail to match string "5.08" — and the tile would appear
// to "bounce back" (silent click / failed drop). Normalize via String().
function _orderIndexOf(arr, val) {
    const target = String(val);
    for (let i = 0; i < arr.length; i++) {
        if (String(arr[i]) === target) return i;
    }
    return -1;
}

export function selectOrderNumber(num) {
    if (state.hasAnswered) return;

    const idx = _orderIndexOf(orderingState.available, num);
    if (idx > -1) {
        // Preserve the ORIGINAL value (string vs number) so q.ans matching
        // (which compares against odCorrect = odAnswer.map(String)) works.
        const original = orderingState.available[idx];
        orderingState.available.splice(idx, 1);
        orderingState.selected.push(original);
    }
    updateOrderingUI();
}

export function removeOrderNumber(num) {
    if (state.hasAnswered) return;

    const idx = _orderIndexOf(orderingState.selected, num);
    if (idx > -1) {
        const original = orderingState.selected[idx];
        orderingState.selected.splice(idx, 1);
        orderingState.available.push(original);
    }
    updateOrderingUI();
}

export function updateOrderingUI() {
    const availableContainer = document.getElementById("availableNumbers");
    const selectedContainer = document.getElementById("selectedNumbers");
    const checkBtn = document.getElementById("checkOrderBtn");

    if (!availableContainer || !selectedContainer) return;

    availableContainer.innerHTML = orderingState.available.map(n =>
        `<div class="order-num-btn ordering-tile" data-order-value="${n}" data-order-source="available" draggable="true" onclick="selectOrderNumber(${n})" style="background:var(--accent-cyan);color:white;padding:20px 28px;border-radius:14px;font-weight:800;font-size:1.7rem;cursor:grab;transition:transform 0.2s,box-shadow 0.2s,opacity 0.1s;box-shadow:0 4px 12px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">${n.toLocaleString()}</div>`
    ).join("");

    if (orderingState.selected.length === 0) {
        selectedContainer.innerHTML = '<span style="color:var(--text-dim);font-style:italic;font-size:1.05rem;" id="orderPlaceholder">Click or drag numbers below to place them here...</span>';
    } else {
        selectedContainer.innerHTML = orderingState.selected.map((n, i) =>
            `<div class="ordering-tile ordering-tile-placed" data-order-value="${n}" data-order-source="selected" data-order-index="${i}" draggable="true" onclick="removeOrderNumber(${n})" style="background:var(--accent-green);color:white;padding:20px 28px;border-radius:14px;font-weight:800;font-size:1.7rem;cursor:grab;transition:transform 0.2s,opacity 0.1s;position:relative;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="position:absolute;top:-10px;left:-10px;background:var(--accent-orange);width:30px;height:30px;border-radius:50%;font-size:1rem;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
                ${n.toLocaleString()}
            </div>`
        ).join('<span style="color:var(--accent-orange);font-size:2rem;">→</span>');
    }

    if (checkBtn) {
        const allSelected = orderingState.available.length === 0 && orderingState.selected.length > 0;
        checkBtn.style.opacity = allSelected ? "1" : "0.5";
        checkBtn.style.pointerEvents = allSelected ? "auto" : "none";
    }

    // Re-attach drag handlers after re-render (innerHTML replaces nodes).
    setupOrderingDragHandlers();
}

// Re-order helper: insert `num` (already in selected) at position `targetIndex`
// in orderingState.selected. Used when a student drags a placed tile next to
// another placed tile to swap/reorder positions.
export function reorderSelectedNumber(num, targetIndex) {
    if (state.hasAnswered) return;
    const fromIdx = _orderIndexOf(orderingState.selected, num);
    if (fromIdx === -1) return;
    const original = orderingState.selected[fromIdx];
    orderingState.selected.splice(fromIdx, 1);
    // Account for the removed item shifting indices.
    let insertAt = targetIndex;
    if (fromIdx < insertAt) insertAt -= 1;
    insertAt = Math.max(0, Math.min(orderingState.selected.length, insertAt));
    orderingState.selected.splice(insertAt, 0, original);
    updateOrderingUI();
}

// Wire HTML5 drag-and-drop on every .ordering-tile and the .ordering-target
// container. Click-to-place still works (the click handler is inline). Called
// after every re-render of either the available or selected list.
export function setupOrderingDragHandlers() {
    if (state.hasAnswered) return;
    const tiles = document.querySelectorAll('.ordering-tile');
    tiles.forEach(tile => {
        if (tile.dataset._dndAttached === '1') return;
        tile.dataset._dndAttached = '1';
        tile.addEventListener('dragstart', e => {
            const val = tile.getAttribute('data-order-value');
            const src = tile.getAttribute('data-order-source') || 'available';
            try {
                e.dataTransfer.setData('text/plain', String(val));
                e.dataTransfer.setData('application/x-mathquest-order',
                    JSON.stringify({ value: val, source: src }));
                e.dataTransfer.effectAllowed = 'move';
            } catch (_e) {}
            tile.classList.add('drag-active');
        });
        tile.addEventListener('dragend', () => {
            tile.classList.remove('drag-active');
            document.querySelectorAll('.ordering-target.drag-over')
                .forEach(t => t.classList.remove('drag-over'));
            document.querySelectorAll('.ordering-tile-placed.drag-over')
                .forEach(t => t.classList.remove('drag-over'));
        });

        // ===== TOUCH support =====
        // HTML5 drag-and-drop doesn't fire on mobile. Add pointer-event-based
        // touch handlers that simulate the same drop semantics: long-press to
        // pick up, drag to reposition, release over drop zone to place.
        let touchActive = false;
        let ghost = null;
        let startX = 0, startY = 0;
        tile.addEventListener('touchstart', e => {
            if (state.hasAnswered) return;
            const t = e.touches && e.touches[0];
            if (!t) return;
            touchActive = true;
            startX = t.clientX;
            startY = t.clientY;
            tile.classList.add('drag-active');
            // Build a ghost clone that follows the finger.
            ghost = tile.cloneNode(true);
            ghost.style.position = 'fixed';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '0.85';
            ghost.style.zIndex = '9999';
            ghost.style.left = (t.clientX - 40) + 'px';
            ghost.style.top = (t.clientY - 30) + 'px';
            document.body.appendChild(ghost);
        }, { passive: true });
        tile.addEventListener('touchmove', e => {
            if (!touchActive || !ghost) return;
            const t = e.touches && e.touches[0];
            if (!t) return;
            // preventDefault here blocks page scroll while dragging.
            try { e.preventDefault(); } catch (_e) {}
            ghost.style.left = (t.clientX - 40) + 'px';
            ghost.style.top = (t.clientY - 30) + 'px';
            // Highlight drop zone under finger.
            const elBelow = document.elementFromPoint(t.clientX, t.clientY);
            document.querySelectorAll('.ordering-target.drag-over, .ordering-tile-placed.drag-over')
                .forEach(el => el.classList.remove('drag-over'));
            if (elBelow) {
                const zone = elBelow.closest('#selectedNumbers, .ordering-tile-placed');
                if (zone) zone.classList.add('drag-over');
            }
        }, { passive: false });
        tile.addEventListener('touchend', e => {
            if (!touchActive) return;
            touchActive = false;
            tile.classList.remove('drag-active');
            const t = (e.changedTouches && e.changedTouches[0]) || null;
            if (ghost) { ghost.remove(); ghost = null; }
            document.querySelectorAll('.ordering-target.drag-over, .ordering-tile-placed.drag-over')
                .forEach(el => el.classList.remove('drag-over'));
            if (!t || state.hasAnswered) return;
            const elBelow = document.elementFromPoint(t.clientX, t.clientY);
            const dropTarget = elBelow && elBelow.closest('#selectedNumbers, .ordering-tile-placed');
            if (!dropTarget) return;
            // Mirror the mouse-drop logic.
            const val = tile.getAttribute('data-order-value');
            const src = tile.getAttribute('data-order-source') || 'available';
            const numVal = Number(val);
            if (Number.isNaN(numVal)) return;
            const onPlaced = dropTarget.classList.contains('ordering-tile-placed') ? dropTarget : null;
            if (src === 'selected') {
                const targetIdx = onPlaced
                    ? Number(onPlaced.getAttribute('data-order-index'))
                    : orderingState.selected.length;
                reorderSelectedNumber(numVal, isNaN(targetIdx) ? orderingState.selected.length : targetIdx);
            } else {
                selectOrderNumber(numVal);
                if (onPlaced) {
                    const targetIdx = Number(onPlaced.getAttribute('data-order-index'));
                    if (!isNaN(targetIdx)) reorderSelectedNumber(numVal, targetIdx);
                }
            }
        });
        tile.addEventListener('touchcancel', () => {
            touchActive = false;
            tile.classList.remove('drag-active');
            if (ghost) { ghost.remove(); ghost = null; }
            document.querySelectorAll('.ordering-target.drag-over, .ordering-tile-placed.drag-over')
                .forEach(el => el.classList.remove('drag-over'));
        });
    });

    // Drop zone: the "Your order" target.
    const target = document.getElementById('selectedNumbers');
    if (target && target.dataset._dndAttached !== '1') {
        target.dataset._dndAttached = '1';
        target.addEventListener('dragover', e => {
            e.preventDefault();
            try { e.dataTransfer.dropEffect = 'move'; } catch (_e) {}
            target.classList.add('drag-over');
        });
        target.addEventListener('dragleave', e => {
            // Only clear when truly leaving the target (not a child).
            if (e.target === target) target.classList.remove('drag-over');
        });
        target.addEventListener('drop', e => {
            e.preventDefault();
            target.classList.remove('drag-over');
            if (state.hasAnswered) return;
            const raw = e.dataTransfer.getData('application/x-mathquest-order')
                || e.dataTransfer.getData('text/plain');
            if (!raw) return;
            let payload;
            try { payload = JSON.parse(raw); } catch (_e) { payload = { value: raw, source: 'available' }; }
            const numVal = Number(payload.value);
            if (Number.isNaN(numVal)) return;
            // If dropped on a placed tile, re-order/insert at that position.
            const onPlaced = e.target && e.target.closest && e.target.closest('.ordering-tile-placed');
            if (payload.source === 'selected') {
                const targetIdx = onPlaced
                    ? Number(onPlaced.getAttribute('data-order-index'))
                    : orderingState.selected.length;
                reorderSelectedNumber(numVal, isNaN(targetIdx) ? orderingState.selected.length : targetIdx);
            } else {
                // Available → selected: same as click.
                selectOrderNumber(numVal);
                if (onPlaced) {
                    const targetIdx = Number(onPlaced.getAttribute('data-order-index'));
                    if (!isNaN(targetIdx)) reorderSelectedNumber(numVal, targetIdx);
                }
            }
        });
    }

    // Make every placed tile a sub-drop-zone so dropping ON a placed tile
    // inserts at that position (handled in the target's drop via closest()).
    document.querySelectorAll('.ordering-tile-placed').forEach(placed => {
        if (placed.dataset._dndOverAttached === '1') return;
        placed.dataset._dndOverAttached = '1';
        placed.addEventListener('dragover', e => {
            e.preventDefault();
            placed.classList.add('drag-over');
        });
        placed.addEventListener('dragleave', () => placed.classList.remove('drag-over'));
    });
}

export function checkOrderInputsFilled() {
    const inputs = document.querySelectorAll('.order-input-box');
    const checkBtn = document.getElementById('checkOrderBtn');
    if (!checkBtn) return;

    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) allFilled = false;
    });

    checkBtn.style.opacity = allFilled ? "1" : "0.5";
    checkBtn.style.pointerEvents = allFilled ? "auto" : "none";
}

export function checkOrderingAnswer() {
    if (state.hasAnswered) return;
    const q = state.currentQ;
    const mode = q.orderMode || "input";

    let userAnswer;
    if (mode === "click") {
        userAnswer = orderingState.selected.join(",");
    } else {
        const inputs = document.querySelectorAll('.order-input-box');
        const userValues = [];
        inputs.forEach(input => {
            const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
            userValues.push(parseInt(val, 10) || 0);
        });
        userAnswer = userValues.join(",");
    }

    const isCorrect = userAnswer === q.ans;

    // Track FIRST-attempt correctness for scoring/streak/MAP/practice-log.
    // Subsequent attempts in this question are NOT counted (the student is
    // learning) but still allowed to fix and re-submit.
    const firstSubmit = isFirstAttempt();
    const firstAttemptCorrect = markFirstAttempt(isCorrect);

    // MAP test mode locks on first submit (no in-place retry in test mode).
    const mapTest = isMapTestMode();

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        if (hasAllCorrectFired()) return;
        markAllCorrectFired();
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        feedback.className = "feedback-area correct";
        feedback.innerHTML = firstAttemptCorrect
            ? "🎉 Correct! Perfect order!"
            : "🎉 Correct! Perfect order! (Got it on a retry — keep practicing!)";
        if (firstSubmit) {
            state.score++;
            state.sessionStreak++;
            awardXP(10, 'correct');
        }
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        checkStreakBonus();
        checkSurpriseBonus();

        if (state.gameMode === "boss") {
            const pushbackAmount = 15;
            state.monsterPos = Math.max(0, state.monsterPos - pushbackAmount);
            updateBossVisuals();
        }
        if (state.gameMode === "race") {
            const playerSpeed = getPlayerRaceSpeed();
            state.racePos = Math.min(100, state.racePos + playerSpeed);
            updateRaceVisuals();
        }

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 2500);
        }

        if (firstSubmit) {
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(firstAttemptCorrect);
            }
            trackSkillAnswer(firstAttemptCorrect);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, firstAttemptCorrect, tm);
            }
        }
        // MAP advance with first-attempt verdict (engine adapts to true ability)
        if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: firstAttemptCorrect });
        }

        // Disable further interaction
        const checkBtn = document.getElementById("checkOrderBtn");
        if (checkBtn) checkBtn.style.display = "none";
        document.querySelectorAll('.order-input-box').forEach(input => input.disabled = true);
    } else {
        document.getElementById("questionCard").classList.add("incorrect-bg");
        feedback.className = "feedback-area incorrect";
        feedback.innerHTML = "Not the right order yet — try again!";

        if (firstSubmit) {
            state.sessionStreak = 0;
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(false);
            }
            trackSkillAnswer(false);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, false, tm);
            }
            state.lastAnswerCorrect = false;
        }

        // MAP TEST MODE: lock + advance even on wrong (no in-place retry)
        if (mapTest) {
            state.hasAnswered = true;
            const checkBtn = document.getElementById("checkOrderBtn");
            if (checkBtn) checkBtn.style.display = "none";
            document.querySelectorAll('.order-input-box').forEach(input => input.disabled = true);
            if (typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: false });
            }
            return;
        }

        // Re-enable for retry after brief delay (in-place correction)
        state.hasAnswered = true;
        setTimeout(() => {
            document.getElementById("questionCard").classList.remove("incorrect-bg");
            feedback.style.display = "none";
            if (mode === "click") {
                // Reset click ordering state
                orderingState.selected = [];
                const selectedContainer = document.getElementById("selectedNumbers");
                if (selectedContainer) {
                    selectedContainer.innerHTML = '<p style="color:var(--text-dim);font-style:italic;">Click numbers in order...</p>';
                    selectedContainer.style.borderColor = "";
                }
                // Re-show available numbers
                const availableContainer = document.getElementById("availableNumbers");
                if (availableContainer && q.options) {
                    const nums = q.options;
                    orderingState.available = [...nums];
                    availableContainer.innerHTML = nums.map(n =>
                        `<div class="ordering-number ordering-tile" data-order-value="${n}" data-order-source="available" draggable="true" onclick="selectOrderNumber(${n})" style="background:var(--accent-purple);color:white;padding:20px 28px;border-radius:14px;font-weight:800;font-size:1.7rem;cursor:grab;transition:opacity 0.1s,transform 0.2s;">${n.toLocaleString()}</div>`
                    ).join('');
                    setupOrderingDragHandlers();
                }
            } else {
                // Reset input boxes
                const inputs = document.querySelectorAll('.order-input-box');
                inputs.forEach(input => {
                    input.value = "";
                    input.style.borderColor = "";
                    input.style.background = "";
                    input.disabled = false;
                });
                const checkBtn = document.getElementById("checkOrderBtn");
                if (checkBtn) {
                    checkBtn.style.display = "";
                    checkBtn.style.opacity = "0.5";
                    checkBtn.style.pointerEvents = "none";
                }
            }
            state.hasAnswered = false;
        }, 1500);
    }
}

// Interactive expanded form with input boxes
export function renderInteractiveExpanded(q) {
    const num = q.expandedNumber;
    const digits = q.expandedDigits;
    // Supports up to 7-digit numbers (millions). For numbers with zero digits
    // in the middle (e.g. 4,073,500), q.expandedPlaceIdx tells us which
    // place-value position each non-zero digit lives in — without it we'd
    // assume every digit was contiguous and mislabel everything.
    const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands","millions"];
    const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-orange)', 'var(--accent-pink)', 'var(--accent-yellow)', 'var(--accent-teal, #009688)'];

    // Use expandedPlaceIdx if generator provided it (skips zero positions);
    // fall back to dense indexing for legacy callers.
    const placeIdxs = (Array.isArray(q.expandedPlaceIdx) && q.expandedPlaceIdx.length === digits.length)
        ? q.expandedPlaceIdx
        : digits.map((_, i) => digits.length - i - 1);

    // Build columns and "+" separators as PEER flex items so every column has
    // identical structure (digit tile + place label + input). Previously the
    // "+" lived INSIDE non-last columns, which made those columns taller and
    // the parent's align-items:center pushed their tiles upward — visually
    // misaligning the row.
    const items = [];
    digits.forEach((d, i) => {
        const placeIndex = placeIdxs[i];
        const placeName = placeNames[placeIndex] || `10^${placeIndex}`;
        const color = colors[placeIndex] || colors[0];
        const expected = parseInt(d, 10) * Math.pow(10, placeIndex);
        // Tighter sizing when many boxes (millions = up to 7 boxes) so the
        // row still fits without horizontal scroll.
        const wide = digits.length >= 6;
        const inputW = wide ? 92 : 120;
        const inputH = wide ? 56 : 64;
        const fontSz = wide ? 1.15 : 1.45;
        items.push(`
            <div class="exp-col" style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                <div style="background:${color};color:white;padding:10px 20px;border-radius:10px;font-weight:700;font-size:1.7rem;line-height:1;">${d}</div>
                <div style="font-size:0.95rem;color:var(--text-dim);text-transform:lowercase;letter-spacing:0.4px;">${placeName}</div>
                <input type="text" inputmode="numeric" class="expanded-input-box" data-expanded-idx="${i}" data-expected="${expected}"
                    style="width:${inputW}px;height:${inputH}px;text-align:center;font-size:${fontSz}rem;font-weight:700;border:4px solid ${color};border-radius:12px;background:var(--bg-card);color:var(--text-primary);outline:none;"
                    oninput="checkExpandedInputsFilled();liveValidateExpanded(this)" placeholder="">
            </div>`);
        if (i < digits.length - 1) {
            items.push(`<span class="exp-plus" style="font-size:2.1rem;font-weight:800;color:var(--text-dim);align-self:center;padding-top:38px;">+</span>`);
        }
    });

    return `<div style="text-align:center;">
        <div style="margin-bottom:20px;">
            <div style="font-size:3.4rem;font-weight:900;color:var(--text-primary);">${num.toLocaleString()}</div>
            <div style="font-size:1.05rem;color:var(--text-dim);margin-top:8px;">Write the value of each digit:</div>
        </div>
        <div id="expandedInputBoxes" style="display:flex;justify-content:center;align-items:flex-start;gap:10px;flex-wrap:wrap;">
            ${items.join('')}
        </div>
        <button class="btn btn-primary" id="checkExpandedBtn" onclick="checkExpandedAnswer()" style="margin-top:20px;display:none;">Check Answer</button>
    </div>`;
}

// Live per-input validation: as the student types, mark each box green/red
// against its data-expected. When ALL boxes are correct, fire the same
// success path that the Check button used to (debounced 400ms).
let _expandedAdvanceTimer = null;
export function liveValidateExpanded(inputEl) {
    if (!inputEl) return;
    const expectedRaw = inputEl.getAttribute('data-expected');
    const expected = expectedRaw == null ? null : Number(expectedRaw);
    const raw = (inputEl.value || '').trim().replace(/,/g, '').replace(/\s/g, '');
    inputEl.classList.remove('box-correct', 'box-wrong');
    if (raw === '') { /* neutral */ }
    else if (expected != null && Number(raw) === expected) inputEl.classList.add('box-correct');
    else inputEl.classList.add('box-wrong');

    const inputs = Array.from(document.querySelectorAll('.expanded-input-box'));
    const allCorrect = inputs.length > 0 && inputs.every(x => x.classList.contains('box-correct'));
    if (allCorrect) {
        if (_expandedAdvanceTimer) return;
        _expandedAdvanceTimer = setTimeout(() => {
            _expandedAdvanceTimer = null;
            try { checkExpandedAnswer(); } catch (e) { /* fall through */ }
        }, 400);
    } else if (_expandedAdvanceTimer) {
        clearTimeout(_expandedAdvanceTimer);
        _expandedAdvanceTimer = null;
    }
}

export function checkExpandedInputsFilled() {
    const inputs = document.querySelectorAll('.expanded-input-box');
    const checkBtn = document.getElementById('checkExpandedBtn');
    if (!checkBtn) return;

    let allFilled = true;
    inputs.forEach(input => {
        if (!input.value.trim()) allFilled = false;
    });

    checkBtn.style.opacity = allFilled ? "1" : "0.5";
    checkBtn.style.pointerEvents = allFilled ? "auto" : "none";
}

export function checkExpandedAnswer() {
    if (state.hasAnswered) return;
    const q = state.currentQ;

    // Get user answers from input boxes
    const inputs = document.querySelectorAll('.expanded-input-box');
    const userValues = [];
    inputs.forEach(input => {
        const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
        userValues.push(parseInt(val, 10) || 0);
    });
    const userAnswer = userValues.join(",");
    const isCorrect = userAnswer === q.ans;

    // First-attempt scoring tracking — only the first submit counts toward
    // streak/XP/banner/MAP. Subsequent submits in this question may be retries
    // toward all-correct (which still advance once allCorrect).
    const firstSubmit = isFirstAttempt();
    const firstAttemptCorrect = markFirstAttempt(isCorrect);
    const mapTest = isMapTestMode();

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        if (hasAllCorrectFired()) return;
        markAllCorrectFired();
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        feedback.className = "feedback-area correct";
        feedback.innerHTML = firstAttemptCorrect
            ? "🎉 Correct! Perfect expanded form!"
            : "🎉 Correct! Perfect expanded form! (Got it on a retry — keep practicing!)";
        if (firstSubmit) {
            state.score++;
            state.sessionStreak++;
            awardXP(10, 'correct');
        }
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        saveState();
        checkStreakBonus();
        checkSurpriseBonus();

        // Mark inputs as correct
        inputs.forEach(input => {
            input.style.borderColor = "var(--correct)";
            input.style.background = "rgba(34,197,94,0.1)";
        });

        if (state.gameMode === "boss") {
            const pushbackAmount = 15;
            state.monsterPos = Math.max(0, state.monsterPos - pushbackAmount);
            updateBossVisuals();
        }
        if (state.gameMode === "race") {
            const playerSpeed = getPlayerRaceSpeed();
            state.racePos = Math.min(100, state.racePos + playerSpeed);
            updateRaceVisuals();
        }

        // First-submit-only telemetry: bannerRecordAnswer / trackSkillAnswer /
        // recordPracticeLog should reflect first-attempt truth, not retry truth.
        if (firstSubmit) {
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(firstAttemptCorrect);
            }
            trackSkillAnswer(firstAttemptCorrect);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, firstAttemptCorrect, tm);
            }
        }

        // MAP mode is engine-driven — pass the FIRST-attempt verdict so the
        // RIT estimate reflects first-shot ability.
        if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: firstAttemptCorrect });
        } else if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 2500);
        }

        // Disable further interaction
        const checkBtn = document.getElementById("checkExpandedBtn");
        if (checkBtn) checkBtn.style.display = "none";
        document.querySelectorAll('.expanded-input-box').forEach(input => input.disabled = true);
    } else {
        // Wrong path — first-attempt scoring fires once, then we keep the
        // widget open for in-place correction.
        document.getElementById("questionCard").classList.add("incorrect-bg");
        feedback.className = "feedback-area incorrect";
        // Mark wrong inputs (per-cell red/green)
        const correctValues = q.expandedValues;
        let wrongCount = 0;
        inputs.forEach((input, i) => {
            const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
            const userVal = parseInt(val, 10) || 0;
            if (userVal === correctValues[i]) {
                input.style.borderColor = "var(--correct)";
                input.style.background = "rgba(34,197,94,0.1)";
            } else {
                input.style.borderColor = "var(--incorrect)";
                input.style.background = "rgba(239,68,68,0.1)";
                wrongCount++;
            }
        });
        feedback.innerHTML = buildRetryMessage(correctValues.length, wrongCount);

        if (firstSubmit) {
            state.sessionStreak = 0;
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(false);
            }
            trackSkillAnswer(false);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, false, tm);
            }
            state.lastAnswerCorrect = false;
        }

        // MAP TEST MODE: lock + advance on first submit even if wrong.
        if (mapTest) {
            state.hasAnswered = true;
            inputs.forEach(input => { input.disabled = true; });
            const checkBtn = document.getElementById("checkExpandedBtn");
            if (checkBtn) checkBtn.style.display = "none";
            if (typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: false });
            }
            return;
        }

        // Re-enable wrong inputs for in-place correction. Correct inputs
        // stay green/disabled-look but actually remain editable so the
        // student can compare/adjust if needed. After 1s, clear the wrong
        // boxes' values so the student can retype.
        state.hasAnswered = false;
        setTimeout(() => {
            document.getElementById("questionCard").classList.remove("incorrect-bg");
            inputs.forEach((input, i) => {
                const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
                const userVal = parseInt(val, 10) || 0;
                if (userVal !== correctValues[i]) {
                    input.value = "";
                    input.style.borderColor = "";
                    input.style.background = "";
                }
            });
            const checkBtn = document.getElementById("checkExpandedBtn");
            if (checkBtn) {
                checkBtn.style.display = "";
                checkBtn.style.opacity = "0.5";
                checkBtn.style.pointerEvents = "none";
            }
        }, 800);
    }
}

// Number Family validation function
// Check area model answer in single question mode
export function checkAreaModelAnswer(input) {
    if (state.hasAnswered) return;
    
    const q = state.currentQ;
    if (!q.areaModelData) return;
    
    const userVal = input.value.trim().replace(/,/g, '');
    const correctVal = input.dataset.answer;
    
    if (userVal === '') {
        // Reset to default
        input.style.borderColor = input.classList.contains('area-model-total') ? 'var(--accent-green)' : '#fff';
        input.style.background = input.classList.contains('area-model-total') ? 'var(--bg-card-light)' : 'rgba(255,255,255,0.9)';
        input.style.color = '';
        return;
    }
    
    // Check this individual input
    const isCorrect = userVal === correctVal;
    
    if (isCorrect) {
        input.style.borderColor = 'var(--correct)';
        input.style.background = 'rgba(6,214,160,0.3)';
        input.style.color = '#065f46';
    } else {
        input.style.borderColor = 'var(--incorrect)';
        input.style.background = 'rgba(239,71,111,0.2)';
        input.style.color = '#991b1b';
    }
    
    // Check if ALL inputs are correct
    const visualAid = document.getElementById("visualAid");
    const allInputs = visualAid.querySelectorAll('.area-model-input, .area-model-total');
    let allCorrectOverall = true;
    let allFilled = true;
    
    allInputs.forEach(inp => {
        const val = inp.value.trim().replace(/,/g, '');
        const correct = inp.dataset.answer;
        if (val === '') {
            allFilled = false;
            allCorrectOverall = false;
        } else if (val !== correct) {
            allCorrectOverall = false;
        }
    });
    
    // The "first submit" for area-model fires the FIRST time every cell is
    // filled (regardless of correctness). If wrong cells exist, scoring locks
    // in as wrong but the widget stays open so the student can correct in
    // place. When everything finally reads green, the all-correct pipeline
    // fires once.
    if (allFilled) {
        const mapTest = isMapTestMode();
        const firstSubmit = isFirstAttempt();
        const firstAttemptCorrect = markFirstAttempt(allCorrectOverall);

        // First-submit-only scoring side effects.
        if (firstSubmit) {
            if (firstAttemptCorrect) {
                state.score++;
                state.sessionStreak++;
                awardXP(20, 'correct_area');
                if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                    window.bannerRecordAnswer(true);
                }
                trackSkillAnswer(true);
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, true, tm);
                }
            } else {
                state.sessionStreak = 0;
                if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
                if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                    window.bannerRecordAnswer(false);
                }
                trackSkillAnswer(false);
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, false, tm);
                }
            }
            state.lastAnswerCorrect = firstAttemptCorrect;
        }

        // MAP TEST MODE: lock + advance on first submit regardless of correctness
        if (mapTest) {
            state.hasAnswered = true;
            allInputs.forEach(inp => inp.disabled = true);
            if (typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: firstAttemptCorrect });
            }
            return;
        }

        // ALL CORRECT (any submit): fire advance pipeline once.
        if (allCorrectOverall) {
            if (hasAllCorrectFired()) return;
            markAllCorrectFired();
            state.hasAnswered = true;
            state.lastAnswerCorrect = true;
            document.getElementById("gameScore").innerText = `${state.score} Correct`;
            document.getElementById("questionCard").classList.add("correct-bg");
            confetti();
            checkStreakBonus();
            checkSurpriseBonus();
            state.totalQuestions++;
            updateDailyGoalProgress(true);
            allInputs.forEach(inp => inp.disabled = true);

            // MAP practice/worksheet hand-off: pass first-attempt verdict.
            if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: firstAttemptCorrect });
                return;
            }

            if (shouldShowNextButton()) {
                setTimeout(() => transitionToNextQuestion(), 2500);
            }
        }
        // else: some wrong, keep widget open (per-cell red is already painted)
    }
}

// Check number family answer in single question mode
export function checkNumberFamilyAnswer() {
    if (state.hasAnswered) return;
    
    const q = state.currentQ;
    if (!q.numberFamilyData && !q.factFamilyData) return;
    
    const visualAid = document.getElementById("visualAid");
    const inputs = visualAid.querySelectorAll('.number-family-input, .fact-family-input');
    let allCorrect = true;
    let allFilled = true;
    
    inputs.forEach(input => {
        const userVal = input.value.trim();
        const correctVal = input.dataset.answer;
        
        if (userVal === '') {
            allFilled = false;
            allCorrect = false;
        } else if (userVal === correctVal) {
            input.style.borderColor = 'var(--correct)';
            input.style.background = 'rgba(6,214,160,0.2)';
        } else {
            allCorrect = false;
            input.style.borderColor = 'var(--incorrect)';
            input.style.background = 'rgba(239,71,111,0.15)';
        }
    });
    
    // First-attempt scoring + in-place correction (parallels area-model).
    if (allFilled) {
        const mapTest = isMapTestMode();
        const firstSubmit = isFirstAttempt();
        const firstAttemptCorrect = markFirstAttempt(allCorrect);

        if (firstSubmit) {
            if (firstAttemptCorrect) {
                state.score++;
                state.sessionStreak++;
                awardXP(15, 'correct_family');
                if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                    window.bannerRecordAnswer(true);
                }
                trackSkillAnswer(true);
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, true, tm);
                }
            } else {
                state.sessionStreak = 0;
                if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
                if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                    window.bannerRecordAnswer(false);
                }
                trackSkillAnswer(false);
                if (typeof window.recordPracticeLog === 'function') {
                    const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                    const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                    window.recordPracticeLog(sk, false, tm);
                }
            }
            state.lastAnswerCorrect = firstAttemptCorrect;
        }

        // MAP TEST MODE: lock + advance on first submit regardless of correctness
        if (mapTest) {
            state.hasAnswered = true;
            inputs.forEach(inp => inp.disabled = true);
            if (typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: firstAttemptCorrect });
            }
            return;
        }

        if (allCorrect) {
            if (hasAllCorrectFired()) return;
            markAllCorrectFired();
            state.hasAnswered = true;
            state.lastAnswerCorrect = true;
            document.getElementById("gameScore").innerText = `${state.score} Correct`;
            document.getElementById("questionCard").classList.add("correct-bg");
            confetti();
            checkStreakBonus();
            checkSurpriseBonus();
            state.totalQuestions++;
            updateDailyGoalProgress(true);
            inputs.forEach(inp => inp.disabled = true);

            // MAP practice/worksheet hand-off (use first-attempt verdict).
            if (state.mapMode && typeof window.recordMapAnswer === 'function') {
                setTimeout(() => {
                    try { window.recordMapAnswer({ correct: firstAttemptCorrect }); }
                    catch (e) { /* engine handles its own errors */ }
                }, 800);
                return;
            }

            // Standard practice / boss / race auto-advance. Also surface the manual
            // Next button as a backup so the student is never stuck if the
            // auto-advance setTimeout is interrupted.
            try {
                if (typeof showNextButton === 'function') showNextButton();
                else if (typeof window.showNextButton === 'function') window.showNextButton();
            } catch (e) { /* never let UI helper failures block advancement */ }
            if (shouldShowNextButton()) {
                setTimeout(() => {
                    try { transitionToNextQuestion(); }
                    catch (e) {
                        // Last-resort fallback: try the bare nextQuestion call.
                        try { if (typeof window.nextQuestion === 'function') window.nextQuestion(); } catch {}
                    }
                }, 800);
            }
        }
        // else: some wrong, keep widget open (per-cell red is already painted)
    }
}

export function checkNumberFamily() {
    if (state.hasAnswered) return;
    
    const q = state.currentQ;
    if (!q.numberFamilyData) return;
    
    const inputs = document.querySelectorAll('.number-family-input');
    let allCorrect = true;
    let allFilled = true;
    let correctCount = 0;
    let totalInputs = inputs.length;
    
    inputs.forEach(input => {
        const userVal = input.value.trim();
        const correctVal = input.dataset.answer;
        
        if (userVal === '') {
            allFilled = false;
            input.style.borderColor = 'var(--accent-orange)';
            input.style.background = 'rgba(255, 152, 0, 0.1)';
        } else if (userVal === correctVal) {
            correctCount++;
            input.style.borderColor = 'var(--accent-green)';
            input.style.background = 'rgba(76, 175, 80, 0.15)';
            input.disabled = true;
        } else {
            allCorrect = false;
            input.style.borderColor = '#e53935';
            input.style.background = 'rgba(229, 57, 53, 0.1)';
            // Shake animation
            input.style.animation = 'shake 0.5s';
            setTimeout(() => { input.style.animation = ''; }, 500);
        }
    });
    
    const feedbackDiv = document.getElementById('numberFamilyFeedback');
    
    if (!allFilled) {
        feedbackDiv.innerHTML = `<span style="color:var(--accent-orange);">⚠️ Please fill in all the boxes!</span>`;
        return;
    }
    
    // First-attempt scoring + in-place correction. Wrong rows turn red and
    // stay editable; correct rows lock green. On the FIRST submit the verdict
    // is recorded for scoring/streak/MAP/banner; subsequent retries are not
    // re-scored but DO trigger the all-correct advance once everything turns green.
    const mapTest = isMapTestMode();
    const firstSubmit = isFirstAttempt();
    const firstAttemptCorrect = markFirstAttempt(allCorrect);

    if (firstSubmit) {
        if (firstAttemptCorrect) {
            state.score++;
            state.sessionStreak++;
            awardXP(15, 'correct_family');
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(true);
            }
            trackSkillAnswer(true);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, true, tm);
            }
        } else {
            state.sessionStreak = 0;
            if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(false);
            }
            trackSkillAnswer(false);
            if (typeof window.recordPracticeLog === 'function') {
                const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
                const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
                window.recordPracticeLog(sk, false, tm);
            }
        }
        state.lastAnswerCorrect = firstAttemptCorrect;
    }

    // MAP TEST MODE: lock + advance on first submit regardless of correctness
    if (mapTest) {
        state.hasAnswered = true;
        inputs.forEach(inp => inp.disabled = true);
        if (typeof window.recordMapAnswer === 'function') {
            window.recordMapAnswer({ correct: firstAttemptCorrect });
        }
        return;
    }

    if (allCorrect) {
        if (hasAllCorrectFired()) return;
        markAllCorrectFired();
        feedbackDiv.innerHTML = firstAttemptCorrect
            ? `<span style="color:var(--accent-green);">🎉 Perfect! All answers correct!</span>`
            : `<span style="color:var(--accent-green);">🎉 All correct! (Got it on a retry — keep practicing!)</span>`;
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        checkStreakBonus();
        checkSurpriseBonus();
        state.totalQuestions++;
        updateDailyGoalProgress(true);

        // MAP practice/worksheet hand-off (use first-attempt verdict).
        if (state.mapMode && typeof window.recordMapAnswer === 'function') {
            setTimeout(() => {
                try { window.recordMapAnswer({ correct: firstAttemptCorrect }); }
                catch (e) { /* engine handles its own errors */ }
            }, 800);
            return;
        }

        try {
            if (typeof showNextButton === 'function') showNextButton();
            else if (typeof window.showNextButton === 'function') window.showNextButton();
        } catch (e) { /* never let UI helper failures block advancement */ }
        if (shouldShowNextButton()) {
            setTimeout(() => {
                try { transitionToNextQuestion(); }
                catch (e) {
                    try { if (typeof window.nextQuestion === 'function') window.nextQuestion(); } catch {}
                }
            }, 800);
        }
    } else {
        feedbackDiv.innerHTML = `<span style="color:#e53935;">${correctCount}/${totalInputs} correct. Fix the red boxes and try again!</span>`;

        // Re-enable wrong rows for in-place correction. Correct rows stay
        // disabled+green. After 2s, clear the red highlight from the editable
        // rows so they look neutral again.
        state.hasAnswered = false;
        setTimeout(() => {
            inputs.forEach(input => {
                if (!input.disabled) {
                    input.style.borderColor = 'var(--accent-cyan)';
                    input.style.background = 'var(--bg-card-light)';
                }
            });
        }, 2000);
    }
}

// ===== Number Line Placement (Type C) =====
let numberLinePlaceState = { selectedIndex: null, answered: false };

export function selectNumberLineTick(lineId, tickIndex, totalParts) {
    if (numberLinePlaceState.answered) return;
    numberLinePlaceState.selectedIndex = tickIndex;

    // Remove previous selection highlights and dots
    const svg = document.getElementById(lineId + '_svg');
    if (!svg) return;
    svg.querySelectorAll('.fnl-tick-selected').forEach(el => el.classList.remove('fnl-tick-selected'));
    svg.querySelectorAll('.fnl-placed-dot').forEach(el => el.remove());

    // Highlight clicked tick target
    const targets = svg.querySelectorAll('.fnl-tick-target');
    targets.forEach(t => {
        if (parseInt(t.dataset.tick) === tickIndex) t.classList.add('fnl-tick-selected');
    });

    // Add green dot at selected position
    const W = 440, lineY = 55, leftX = 30, rightX = W - 30;
    const span = rightX - leftX;
    const cx = leftX + (tickIndex / totalParts) * span;
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', lineY);
    dot.setAttribute('r', '7');
    dot.setAttribute('fill', 'var(--accent-green)');
    dot.setAttribute('stroke', '#fff');
    dot.setAttribute('stroke-width', '2');
    dot.classList.add('fnl-placed-dot');
    svg.appendChild(dot);

    // Enable check button
    const btn = document.getElementById('checkPlacementBtn');
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
}

export function checkNumberLinePlacement() {
    if (numberLinePlaceState.answered || numberLinePlaceState.selectedIndex === null) return;
    numberLinePlaceState.answered = true;

    const q = state.currentQ;
    const correctTick = q.nlpCorrectTick;
    const isCorrect = numberLinePlaceState.selectedIndex === correctTick;

    const feedbackDiv = document.getElementById("feedbackArea");
    feedbackDiv.style.display = "block";

    // Disable further clicks
    const svg = document.querySelector('#fnlC_svg');
    if (svg) {
        svg.querySelectorAll('.fnl-tick-target').forEach(t => { t.style.pointerEvents = 'none'; });
    }

    // Hide check button
    const checkBtn = document.getElementById('checkPlacementBtn');
    if (checkBtn) checkBtn.style.display = 'none';

    if (isCorrect) {
        feedbackDiv.className = "feedback-area correct";
        feedbackDiv.innerHTML = `<span style="color:var(--accent-green);">Correct!</span>`;
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(true);
        trackSkillAnswer(true);
        if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
        state.totalQuestions++;
        if (typeof window.updateSkillProgress === 'function') window.updateSkillProgress(state.skill, true);
        if (typeof window.trackPerformance === 'function') window.trackPerformance(true);
        // Auto-advance to next question — was missing, leaving the student
        // stuck on the "Correct!" screen with no way forward. MAP mode handles
        // its own advance via recordMapAnswer; everything else uses transition.
        if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
            setTimeout(() => window.recordMapAnswer({ correct: true }), 900);
        } else if (typeof window.transitionToNextQuestion === 'function') {
            setTimeout(() => window.transitionToNextQuestion(), 2500);
        } else if (typeof window.nextQuestion === 'function') {
            setTimeout(() => window.nextQuestion(), 2500);
        }
    } else {
        feedbackDiv.className = "feedback-area incorrect";
        feedbackDiv.innerHTML = `<span style="color:#e53935;">Not quite. Try again!</span>`;
        state.sessionStreak = 0;
        if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(false);
        trackSkillAnswer(false);

        // Re-enable for retry after brief delay
        setTimeout(() => {
            feedbackDiv.style.display = "none";
            // Remove placed dot
            if (svg) {
                svg.querySelectorAll('.fnl-placed-dot').forEach(el => el.remove());
                svg.querySelectorAll('.fnl-tick-selected').forEach(el => el.classList.remove('fnl-tick-selected'));
                svg.querySelectorAll('.fnl-tick-target').forEach(t => { t.style.pointerEvents = 'auto'; });
            }
            const btn = document.getElementById('checkPlacementBtn');
            if (btn) {
                btn.style.display = '';
                btn.style.opacity = '0.5';
                btn.style.pointerEvents = 'none';
            }
            numberLinePlaceState.answered = false;
            numberLinePlaceState.selectedIndex = null;
        }, 1500);
    }
}

// ===== Odd/Even Select (Type 2) =====
let oddEvenSelectState = { selected: new Set(), answered: false };

export function selectOddEvenNumber(index) {
    if (oddEvenSelectState.answered) return;
    const box = document.getElementById(`oeBox${index}`);
    if (!box) return;

    if (oddEvenSelectState.selected.has(index)) {
        oddEvenSelectState.selected.delete(index);
        box.style.background = 'var(--bg-card)';
        box.style.borderColor = 'var(--text-dim)';
        box.style.color = 'var(--text-bright)';
    } else {
        oddEvenSelectState.selected.add(index);
        box.style.background = 'var(--accent-cyan)';
        box.style.borderColor = 'var(--accent-cyan)';
        box.style.color = '#fff';
    }
}

export function checkOddEvenSelection() {
    if (oddEvenSelectState.answered) return;
    oddEvenSelectState.answered = true;

    const q = state.currentQ;
    const correctSet = new Set(q.oeCorrectIndices);
    const userSet = oddEvenSelectState.selected;
    const isCorrect = correctSet.size === userSet.size && [...correctSet].every(i => userSet.has(i));

    const feedbackDiv = document.getElementById("feedbackArea");
    feedbackDiv.style.display = "block";

    // Disable further clicks
    const btn = document.getElementById('checkOddEvenBtn');
    if (btn) btn.style.display = 'none';

    // Color all boxes: green for correct selections, red for wrong, orange for missed
    for (let i = 0; i < q.oeNumbers.length; i++) {
        const box = document.getElementById(`oeBox${i}`);
        if (!box) continue;
        box.style.cursor = 'default';
        const shouldBeSelected = correctSet.has(i);
        const wasSelected = userSet.has(i);

        if (shouldBeSelected && wasSelected) {
            box.style.background = 'var(--accent-green)';
            box.style.borderColor = 'var(--accent-green)';
            box.style.color = '#fff';
        } else if (shouldBeSelected && !wasSelected) {
            box.style.background = 'var(--accent-orange)';
            box.style.borderColor = 'var(--accent-orange)';
            box.style.color = '#fff';
        } else if (!shouldBeSelected && wasSelected) {
            box.style.background = '#e53935';
            box.style.borderColor = '#e53935';
            box.style.color = '#fff';
        } else {
            box.style.background = 'var(--bg-card)';
            box.style.borderColor = 'var(--text-dim)';
            box.style.opacity = '0.5';
        }
    }

    if (isCorrect) {
        feedbackDiv.className = "feedback-area correct";
        feedbackDiv.innerHTML = `<span style="color:var(--accent-green);">Correct! You found all the ${q.oeTarget} numbers!</span>`;
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        if (typeof window.awardXP === 'function') window.awardXP(10, 'correct');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        if (typeof window.confetti === 'function') window.confetti();
        if (typeof window.checkStreakBonus === 'function') window.checkStreakBonus();
        if (typeof window.checkSurpriseBonus === 'function') window.checkSurpriseBonus();
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(true);
        trackSkillAnswer(true);
        if (typeof window.clearQuestionTimer === 'function') window.clearQuestionTimer();
        state.totalQuestions++;
        if (typeof window.updateSkillProgress === 'function') window.updateSkillProgress(state.skill, true);
        if (typeof window.trackPerformance === 'function') window.trackPerformance(true);
    } else {
        feedbackDiv.className = "feedback-area incorrect";
        feedbackDiv.innerHTML = `<span style="color:#e53935;">Not quite. Try again!</span>`;
        state.sessionStreak = 0;
        if (typeof window.awardXP === 'function') window.awardXP(2, 'attempt');
        if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(false);
        trackSkillAnswer(false);

        // Re-enable for retry after brief delay
        setTimeout(() => {
            feedbackDiv.style.display = "none";
            oddEvenSelectState.answered = false;
            oddEvenSelectState.selected = new Set();
            // Reset all boxes to default state
            for (let i = 0; i < q.oeNumbers.length; i++) {
                const box = document.getElementById(`oeBox${i}`);
                if (!box) continue;
                box.style.background = 'var(--bg-card)';
                box.style.borderColor = 'var(--text-dim)';
                box.style.color = 'var(--text-bright)';
                box.style.opacity = '1';
                box.style.cursor = 'pointer';
            }
            const btn = document.getElementById('checkOddEvenBtn');
            if (btn) btn.style.display = '';
        }, 1500);
    }
}

