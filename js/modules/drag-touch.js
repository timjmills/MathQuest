// drag-touch.js — shared touch-event helper for HTML5-drag widgets.
//
// PROBLEM: HTML5 drag-and-drop (dragstart/dragover/drop) does NOT fire on
// mobile/tablet touch devices. Most MathQuest interactive widgets use HTML5
// D&D for desktop with event delegation on a "host" element, so they are
// completely unusable on touch screens.
//
// SOLUTION: This helper attaches touchstart/touchmove/touchend/touchcancel
// listeners on the host. On touchstart it captures the tile being touched,
// builds a floating "ghost" clone that follows the finger, and on touchend
// uses document.elementFromPoint() to find the drop target and routes
// through the SAME drop-handler logic the mouse path uses. The widget owns
// the "what does it mean to drop on X" logic via the onDrop callback.
//
// USAGE
//   import { enableHostTouchDrag } from '../drag-touch.js';
//   enableHostTouchDrag(host, {
//       tileSelector: '.dnd-tile',          // draggable items
//       dropSelector: '.dnd-slot, .dnd-bin, .dnd-tiles-tray',  // accepts drops
//       isLocked: () => locked,             // optional gate; if true, ignored
//       onDragStart: (tileEl) => {},        // optional bookkeeping
//       onDragEnd:   (tileEl) => {},        // optional cleanup (always runs)
//       onDragOver:  (zoneEl, tileEl) => {},// optional visual highlight
//       onDragLeave: (zoneEl, tileEl) => {},// optional un-highlight
//       onDrop:      (zoneEl, tileEl, ev) => {}, // REQUIRED — perform the move
//       activeClass: 'dragging',            // class added to the tile mid-drag
//       overClass: 'over',                  // class added to the hovered zone
//       ghostClassName: '',                 // optional extra class on the ghost
//   });
//
// The helper guards against double-attachment via host.dataset._touchDragInit.

const _ATTACHED_FLAG = '_touchDragInit';

export function enableHostTouchDrag(host, opts) {
    if (!host || host.dataset[_ATTACHED_FLAG] === '1') return;
    host.dataset[_ATTACHED_FLAG] = '1';

    const tileSelector = opts.tileSelector;
    const dropSelector = opts.dropSelector;
    const isLocked = opts.isLocked || (() => false);
    const onDragStart = opts.onDragStart || (() => {});
    const onDragEnd = opts.onDragEnd || (() => {});
    const onDragOver = opts.onDragOver || (() => {});
    const onDragLeave = opts.onDragLeave || (() => {});
    const onDrop = opts.onDrop;
    const activeClass = opts.activeClass || 'dragging';
    const overClass = opts.overClass || 'over';
    const ghostClassName = opts.ghostClassName || '';

    if (typeof onDrop !== 'function') {
        // Without an onDrop the helper does nothing useful.
        return;
    }

    // Per-host drag state (one finger at a time — multi-touch ignored).
    let activeTile = null;
    let ghost = null;
    let lastZone = null;
    let touchId = null;
    let offsetX = 0, offsetY = 0;

    function clearAll() {
        if (activeTile) {
            activeTile.classList.remove(activeClass);
            try { onDragEnd(activeTile); } catch (_e) {}
        }
        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (lastZone) {
            lastZone.classList.remove(overClass);
            try { onDragLeave(lastZone, activeTile); } catch (_e) {}
        }
        activeTile = null;
        ghost = null;
        lastZone = null;
        touchId = null;
    }

    host.addEventListener('touchstart', (e) => {
        if (isLocked()) return;
        if (activeTile) return; // already dragging another finger
        const t = e.touches && e.touches[0];
        if (!t) return;
        // elementFromPoint is more reliable than e.target when fingers
        // start on TTS icon overlays etc.
        const startEl = document.elementFromPoint(t.clientX, t.clientY) || e.target;
        if (!startEl) return;
        // Don't hijack TTS button taps.
        if (startEl.closest && startEl.closest('.dnd-tts-btn')) return;
        const tile = startEl.closest && startEl.closest(tileSelector);
        if (!tile || !host.contains(tile)) return;

        activeTile = tile;
        touchId = t.identifier;
        const rect = tile.getBoundingClientRect();
        offsetX = t.clientX - rect.left;
        offsetY = t.clientY - rect.top;
        tile.classList.add(activeClass);

        ghost = tile.cloneNode(true);
        ghost.style.position = 'fixed';
        ghost.style.pointerEvents = 'none';
        ghost.style.opacity = '0.85';
        ghost.style.zIndex = '9999';
        ghost.style.left = (t.clientX - offsetX) + 'px';
        ghost.style.top = (t.clientY - offsetY) + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.margin = '0';
        if (ghostClassName) ghost.classList.add(ghostClassName);
        document.body.appendChild(ghost);

        try { onDragStart(tile); } catch (_e) {}
    }, { passive: true });

    host.addEventListener('touchmove', (e) => {
        if (!activeTile) return;
        // Find the finger we started with.
        let t = null;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchId) { t = e.touches[i]; break; }
        }
        if (!t) return;
        // preventDefault blocks the page from scrolling under the finger.
        try { e.preventDefault(); } catch (_e) {}

        ghost.style.left = (t.clientX - offsetX) + 'px';
        ghost.style.top = (t.clientY - offsetY) + 'px';

        // Highlight whatever drop zone is under the finger.
        const elBelow = document.elementFromPoint(t.clientX, t.clientY);
        const zone = elBelow && elBelow.closest && elBelow.closest(dropSelector);
        if (zone !== lastZone) {
            if (lastZone) {
                lastZone.classList.remove(overClass);
                try { onDragLeave(lastZone, activeTile); } catch (_e) {}
            }
            lastZone = (zone && host.contains(zone)) ? zone : null;
            if (lastZone) {
                lastZone.classList.add(overClass);
                try { onDragOver(lastZone, activeTile); } catch (_e) {}
            }
        }
    }, { passive: false });

    host.addEventListener('touchend', (e) => {
        if (!activeTile) return;
        // Find the matching finger in changedTouches.
        let t = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) { t = e.changedTouches[i]; break; }
        }
        const tile = activeTile;
        const zone = lastZone;
        // Stash a final lookup at release point (lastZone may be stale if
        // touchmove hasn't fired between move and release).
        let dropTarget = zone;
        if (t) {
            const elBelow = document.elementFromPoint(t.clientX, t.clientY);
            const z2 = elBelow && elBelow.closest && elBelow.closest(dropSelector);
            if (z2 && host.contains(z2)) dropTarget = z2;
        }
        // Clean up visuals first so onDrop can re-render freely.
        clearAll();
        if (!dropTarget || isLocked()) return;
        try { onDrop(dropTarget, tile, e); } catch (err) {
            console.warn('[drag-touch] onDrop threw:', err);
        }
    });

    host.addEventListener('touchcancel', () => {
        clearAll();
    });
}

// Convenience wrapper: attach touch drag to a single element (no host
// delegation). Useful for nl-drag.js style palette chips that aren't inside
// a single delegated host or where the drop target is OUTSIDE the chip's
// container (e.g. an SVG sibling).
export function enableElementTouchDrag(el, opts) {
    if (!el || el.dataset[_ATTACHED_FLAG] === '1') return;
    el.dataset[_ATTACHED_FLAG] = '1';

    const dropSelector = opts.dropSelector;
    const isLocked = opts.isLocked || (() => false);
    const onDragStart = opts.onDragStart || (() => {});
    const onDragEnd = opts.onDragEnd || (() => {});
    const onDragOver = opts.onDragOver || (() => {});
    const onDragLeave = opts.onDragLeave || (() => {});
    const onDrop = opts.onDrop;
    const activeClass = opts.activeClass || 'dragging';
    const overClass = opts.overClass || 'over';
    const ghostClassName = opts.ghostClassName || '';
    if (typeof onDrop !== 'function') return;

    let ghost = null;
    let lastZone = null;
    let touchId = null;
    let offsetX = 0, offsetY = 0;
    let active = false;

    function clearAll() {
        el.classList.remove(activeClass);
        try { onDragEnd(el); } catch (_e) {}
        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (lastZone) {
            lastZone.classList.remove(overClass);
            try { onDragLeave(lastZone, el); } catch (_e) {}
        }
        ghost = null;
        lastZone = null;
        touchId = null;
        active = false;
    }

    el.addEventListener('touchstart', (e) => {
        if (isLocked()) return;
        if (active) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        if (e.target && e.target.closest && e.target.closest('.dnd-tts-btn')) return;
        active = true;
        touchId = t.identifier;
        const rect = el.getBoundingClientRect();
        offsetX = t.clientX - rect.left;
        offsetY = t.clientY - rect.top;
        el.classList.add(activeClass);
        ghost = el.cloneNode(true);
        ghost.style.position = 'fixed';
        ghost.style.pointerEvents = 'none';
        ghost.style.opacity = '0.85';
        ghost.style.zIndex = '9999';
        ghost.style.left = (t.clientX - offsetX) + 'px';
        ghost.style.top = (t.clientY - offsetY) + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.margin = '0';
        if (ghostClassName) ghost.classList.add(ghostClassName);
        document.body.appendChild(ghost);
        try { onDragStart(el); } catch (_e) {}
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
        if (!active) return;
        let t = null;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchId) { t = e.touches[i]; break; }
        }
        if (!t) return;
        try { e.preventDefault(); } catch (_e) {}
        ghost.style.left = (t.clientX - offsetX) + 'px';
        ghost.style.top = (t.clientY - offsetY) + 'px';
        const elBelow = document.elementFromPoint(t.clientX, t.clientY);
        const zone = elBelow && elBelow.closest && elBelow.closest(dropSelector);
        if (zone !== lastZone) {
            if (lastZone) {
                lastZone.classList.remove(overClass);
                try { onDragLeave(lastZone, el); } catch (_e) {}
            }
            lastZone = zone || null;
            if (lastZone) {
                lastZone.classList.add(overClass);
                try { onDragOver(lastZone, el); } catch (_e) {}
            }
        }
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
        if (!active) return;
        let t = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) { t = e.changedTouches[i]; break; }
        }
        let dropTarget = lastZone;
        if (t) {
            const elBelow = document.elementFromPoint(t.clientX, t.clientY);
            const z2 = elBelow && elBelow.closest && elBelow.closest(dropSelector);
            if (z2) dropTarget = z2;
        }
        clearAll();
        if (!dropTarget || isLocked()) return;
        try { onDrop(dropTarget, el, e); } catch (err) {
            console.warn('[drag-touch] onDrop threw:', err);
        }
    });

    el.addEventListener('touchcancel', clearAll);
}
