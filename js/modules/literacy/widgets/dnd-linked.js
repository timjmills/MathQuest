// dnd-linked.js — Drag-and-drop with linked drop zones.
//
// Question contract:
//   q.draggables:  [{ id, label, image?, audio_text? }]
//   q.zones:       [{ id, label, accepts: string[] | "any" | "all" }]
//   q.ans:         { [draggable_id]: zone_id }  — correct placement per draggable
//   q.k2_appropriate?: boolean  — large tile mode
//
// Drop zone accept modes:
//   accepts: "any"         — any tile accepted (sequencing/ordering uses)
//   accepts: "all"         — all tiles accepted (pile uses)
//   accepts: ["id1","id2"] — only these specific draggable IDs accepted
//
// Input methods:
//   1. HTML5 drag-and-drop (desktop)
//   2. Pointer events (touch / mobile)
//   3. Click-and-click fallback
//   4. Keyboard: Tab to tile → arrow keys → Enter to drop (WCAG 2.1 AA)
//
// Partial-correct lock pattern on wrong submit:
//   Tiles in the correct zone → .lq-locked-correct + non-draggable
//   Tiles in wrong zones     → returned to source + .lq-wrong-persistent
//
// Exports:
//   renderDndLinked(q, container)
//   checkDndLinked(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _speakTile(text) {
    if (!text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(String(text));
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
    } catch (_) { /* not available */ }
}

function _announce(host, msg) {
    const live = host.querySelector('.lq-dnd-live');
    if (live) live.textContent = '';
    // Force re-announce by toggling
    requestAnimationFrame(() => {
        if (live) live.textContent = msg;
    });
}

// Module-level "currently active (keyboard-selected) tile" state
let _activeId = null;
let _activeHost = null;

function _clearGlobalActive(host) {
    if (_activeHost !== host) return;
    if (_activeId) {
        const old = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(_activeId)}"]`);
        if (old) {
            old.classList.remove('lq-dnd-tile--active');
            old.setAttribute('aria-pressed', 'false');
        }
    }
    _activeId = null;
    _activeHost = null;
}

function _setGlobalActive(host, tileEl) {
    _clearGlobalActive(host);
    if (!tileEl) return;
    tileEl.classList.add('lq-dnd-tile--active');
    tileEl.setAttribute('aria-pressed', 'true');
    _activeId = tileEl.dataset.id;
    _activeHost = host;
    _announce(host, `Picked up ${tileEl.getAttribute('aria-label') || tileEl.textContent.trim()}.`);
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderDndLinked(q, container) {
    if (!container || !q) return;

    const draggables = Array.isArray(q.draggables) ? q.draggables : [];
    const zones = Array.isArray(q.zones) ? q.zones : [];
    const isK2 = !!q.k2_appropriate;
    const tileClass = isK2 ? 'lq-dnd-tile lq-dnd-tile--k2' : 'lq-dnd-tile';

    // Source zone — all tiles start here (shuffled order, not sorted)
    const shuffled = draggables.slice().sort(() => Math.random() - 0.5);

    const tilesHtml = shuffled.map(d => {
        const label = _esc(d.label || d.id);
        const imgHtml = d.image
            ? `<img class="lq-dnd-tile-image" src="${_esc(d.image)}" alt="${label}">`
            : '';
        const audioBtn = (d.audio_text || d.label)
            ? `<button type="button" class="lq-dnd-audio-btn" data-audio="${_esc(d.audio_text || d.label)}"
                aria-label="Listen" tabindex="-1">🔊</button>`
            : '';
        return `<div class="${tileClass}"
            draggable="true"
            data-id="${_esc(d.id)}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="${label}, draggable">
            ${imgHtml}
            <span class="lq-dnd-tile-label">${label}</span>
            ${audioBtn}
        </div>`;
    }).join('');

    // Drop zones
    const zonesHtml = zones.map(z => {
        const label = _esc(z.label || z.id);
        return `<div class="lq-dnd-drop-zone"
            data-zone-id="${_esc(z.id)}"
            role="listbox"
            aria-label="${label} — drop zone, empty">
            <div class="lq-dnd-drop-zone-label">${label}</div>
            <div class="lq-dnd-drop-zone-well" data-zone-well="${_esc(z.id)}"></div>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div class="lq-dnd-host" role="application" aria-label="Drag and drop items into the correct zones">
            <div class="lq-dnd-source-zone" data-role="source" aria-label="Available tiles">
                ${tilesHtml}
            </div>
            <div class="lq-dnd-zones-row">
                ${zonesHtml}
            </div>
            <div class="lq-dnd-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-dnd-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-dnd-host');
    const source = host.querySelector('[data-role="source"]');
    const submitBtn = host.querySelector('.lq-dnd-submit');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    let locked = false;

    // ── helpers ──────────────────────────────────────────────────────────────

    function allTiles() {
        return Array.from(host.querySelectorAll('.lq-dnd-tile'));
    }

    function getTileZone(tileEl) {
        // Returns zone-id if in a drop zone, or null if in source
        const well = tileEl.closest('[data-zone-well]');
        return well ? well.dataset.zoneWell : null;
    }

    function getZoneWell(zoneId) {
        return host.querySelector(`[data-zone-well="${CSS.escape(zoneId)}"]`);
    }

    function getPlacements() {
        const result = {};
        allTiles().forEach(t => {
            const zone = getTileZone(t);
            if (zone) result[t.dataset.id] = zone;
        });
        return result;
    }

    function totalInZones() {
        return Object.keys(getPlacements()).length;
    }

    function refreshSubmit() {
        submitBtn.disabled = locked || totalInZones() < draggables.length;
    }

    function refreshZoneAria() {
        zones.forEach(z => {
            const well = getZoneWell(z.id);
            const zoneEl = host.querySelector(`[data-zone-id="${CSS.escape(z.id)}"]`);
            if (!zoneEl) return;
            const count = well ? well.querySelectorAll('.lq-dnd-tile').length : 0;
            zoneEl.setAttribute('aria-label',
                `${z.label} — ${count === 0 ? 'empty' : count + ' item' + (count === 1 ? '' : 's')}`);
        });
    }

    function moveTileToZone(tileEl, zoneId) {
        const well = getZoneWell(zoneId);
        if (!well) return false;
        well.appendChild(tileEl);
        _announce(host, `${tileEl.getAttribute('aria-label') || tileEl.dataset.id} placed in ${zoneId}.`);
        refreshZoneAria();
        refreshSubmit();
        return true;
    }

    function returnTileToSource(tileEl) {
        source.appendChild(tileEl);
        _announce(host, `${tileEl.getAttribute('aria-label') || tileEl.dataset.id} returned to source.`);
        refreshZoneAria();
        refreshSubmit();
    }

    // ── audio buttons ────────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        const btn = e.target.closest('.lq-dnd-audio-btn');
        if (!btn) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTile(btn.dataset.audio || '');
    });
    host.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const btn = e.target.closest('.lq-dnd-audio-btn');
        if (!btn) return;
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        _speakTile(btn.dataset.audio || '');
    });
    // Block drag starting on audio button
    host.addEventListener('dragstart', e => {
        if (e.target.closest('.lq-dnd-audio-btn')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    // ── click-and-click interaction ───────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        if (e.target.closest('.lq-dnd-audio-btn')) return;

        const tileEl = e.target.closest('.lq-dnd-tile');
        const zoneEl = e.target.closest('.lq-dnd-drop-zone');

        if (tileEl && host.contains(tileEl)) {
            // Locked-correct tiles: ignore picks
            if (tileEl.dataset.locked === '1') return;
            if (_activeHost === host && _activeId === tileEl.dataset.id) {
                _clearGlobalActive(host);
                _announce(host, 'Selection cleared.');
            } else {
                _setGlobalActive(host, tileEl);
            }
            return;
        }

        if (zoneEl && host.contains(zoneEl)) {
            if (_activeHost === host && _activeId) {
                const t = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(_activeId)}"]`);
                if (t) {
                    moveTileToZone(t, zoneEl.dataset.zoneId);
                    _clearGlobalActive(host);
                }
            }
        }
    });

    // Click on source background returns active tile
    source.addEventListener('click', e => {
        if (locked) return;
        if (e.target !== source) return;
        if (_activeHost === host && _activeId) {
            const t = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(_activeId)}"]`);
            if (t) { returnTileToSource(t); _clearGlobalActive(host); }
        }
    });

    // ── keyboard navigation ───────────────────────────────────────────────────
    // Arrow keys navigate the focused tile between zones; Enter drops it.
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key === 'Enter' || e.key === ' ') {
            const tileEl = e.target.closest('.lq-dnd-tile');
            const zoneEl = e.target.closest('.lq-dnd-drop-zone');
            if (tileEl || zoneEl) {
                e.preventDefault();
                (tileEl || zoneEl).click();
            }
            return;
        }
        if (e.key === 'Escape') {
            if (_activeHost === host) {
                const t = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(_activeId || '')}"]`);
                if (t) returnTileToSource(t);
                _clearGlobalActive(host);
            }
            return;
        }
        // Arrow keys: move focused tile into next/prev zone
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && _activeHost === host && _activeId) {
            e.preventDefault();
            const zoneEls = Array.from(host.querySelectorAll('.lq-dnd-drop-zone'));
            if (zoneEls.length === 0) return;
            const t = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(_activeId)}"]`);
            const currentZone = t ? getTileZone(t) : null;
            const currentIdx = currentZone
                ? zoneEls.findIndex(z => z.dataset.zoneId === currentZone)
                : -1;
            const delta = e.key === 'ArrowRight' ? 1 : -1;
            const nextIdx = (currentIdx + delta + zoneEls.length + 1) % (zoneEls.length + 1);
            if (nextIdx === zoneEls.length) {
                if (t) returnTileToSource(t);
            } else {
                if (t) moveTileToZone(t, zoneEls[nextIdx].dataset.zoneId);
            }
        }
    });

    // ── HTML5 drag ───────────────────────────────────────────────────────────
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-dnd-tile');
        if (!tile || tile.dataset.locked === '1' || !host.contains(tile)) return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tile.dataset.id);
        tile.classList.add('lq-dnd-dragging');
    });
    host.addEventListener('dragend', e => {
        const tile = e.target.closest('.lq-dnd-tile');
        if (tile) tile.classList.remove('lq-dnd-dragging');
        host.querySelectorAll('.lq-dnd-over').forEach(el => el.classList.remove('lq-dnd-over'));
    });
    host.addEventListener('dragover', e => {
        if (locked) return;
        const zone = e.target.closest('.lq-dnd-drop-zone');
        const src = e.target.closest('[data-role="source"]');
        if (zone || src) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            (zone || src).classList.add('lq-dnd-over');
        }
    });
    host.addEventListener('dragleave', e => {
        const el = e.target.closest('.lq-dnd-drop-zone, [data-role="source"]');
        if (el) el.classList.remove('lq-dnd-over');
    });
    host.addEventListener('drop', e => {
        if (locked) return;
        const id = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const tileEl = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(id)}"]`);
        if (!tileEl) return;
        const zone = e.target.closest('.lq-dnd-drop-zone');
        const src = e.target.closest('[data-role="source"]');
        if (zone) {
            e.preventDefault();
            zone.classList.remove('lq-dnd-over');
            moveTileToZone(tileEl, zone.dataset.zoneId);
        } else if (src) {
            e.preventDefault();
            src.classList.remove('lq-dnd-over');
            returnTileToSource(tileEl);
        }
    });

    // ── pointer/touch fallback ─────────────────────────────────────────────
    // Lightweight pointer event touch support (supplements HTML5 drag for mobile).
    let _ptTile = null, _ptGhost = null, _ptStartX = 0, _ptStartY = 0;

    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const tile = e.target.closest('.lq-dnd-tile');
        if (!tile || tile.dataset.locked === '1' || !host.contains(tile)) return;
        if (e.pointerType === 'mouse') return; // handled by HTML5 drag
        e.preventDefault();
        _ptTile = tile;
        _ptStartX = e.clientX;
        _ptStartY = e.clientY;
        // Create ghost
        _ptGhost = tile.cloneNode(true);
        _ptGhost.style.cssText = `
            position:fixed;pointer-events:none;z-index:9999;opacity:0.8;
            left:${e.clientX - 20}px;top:${e.clientY - 20}px;`;
        document.body.appendChild(_ptGhost);
        tile.classList.add('lq-dnd-dragging');
    }, { passive: false });

    host.addEventListener('pointermove', e => {
        if (!_ptTile || !_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 20}px`;
        _ptGhost.style.top = `${e.clientY - 20}px`;
    }, { passive: false });

    host.addEventListener('pointerup', e => {
        if (!_ptTile) return;
        _ptTile.classList.remove('lq-dnd-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }

        // Find element under pointer
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const zone = els.find(el => el.classList.contains('lq-dnd-drop-zone') ||
            el.closest('.lq-dnd-drop-zone'));
        const src = els.find(el => el === source || el.closest('[data-role="source"]'));

        if (zone) {
            const zoneEl = zone.classList.contains('lq-dnd-drop-zone')
                ? zone : zone.closest('.lq-dnd-drop-zone');
            if (zoneEl) moveTileToZone(_ptTile, zoneEl.dataset.zoneId);
        } else if (src) {
            returnTileToSource(_ptTile);
        }
        _ptTile = null;
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const placements = getPlacements();
        const answerMap = (q.ans && typeof q.ans === 'object') ? q.ans : {};
        const firstAttempt = isFirstAttempt();

        let allCorrect = true;
        const wrongIds = [];

        draggables.forEach(d => {
            const placed = placements[d.id];
            const expected = answerMap[d.id];
            if (placed && placed === expected) {
                // Correct placement — lock it
                const tileEl = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(d.id)}"]`);
                if (tileEl) {
                    tileEl.classList.add('lq-locked-correct');
                    tileEl.classList.remove('lq-wrong-persistent');
                    tileEl.dataset.locked = '1';
                    tileEl.setAttribute('draggable', 'false');
                }
            } else {
                allCorrect = false;
                wrongIds.push(d.id);
                const tileEl = host.querySelector(`.lq-dnd-tile[data-id="${CSS.escape(d.id)}"]`);
                if (tileEl) {
                    tileEl.classList.add('lq-wrong-persistent');
                    returnTileToSource(tileEl);
                }
            }
        });

        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = 'Correct! All tiles placed correctly.';
            locked = true;
            submitBtn.disabled = true;
        } else {
            const wrongCount = wrongIds.length;
            feedbackZone.textContent = `${wrongCount} tile${wrongCount === 1 ? '' : 's'} in the wrong zone — try again!`;
            refreshSubmit();
        }

        container._lqLastResult = { correct: allCorrect, submitted: placements, firstAttempt };
        refreshZoneAria();
    });

    refreshZoneAria();
    refreshSubmit();

    // Expose lock helper for integrations
    container._dndLinkedLock = () => {
        locked = true;
        submitBtn.disabled = true;
        allTiles().forEach(t => t.setAttribute('draggable', 'false'));
    };
}

// ─── check ──────────────────────────────────────────────────────────────────

export function checkDndLinked(q, container) {
    if (!container) return { correct: false, submitted: {} };

    if (container._lqLastResult) return container._lqLastResult;

    // Derive from DOM
    const host = container.querySelector('.lq-dnd-host');
    if (!host) return { correct: false, submitted: {} };

    const submitted = {};
    host.querySelectorAll('.lq-dnd-tile').forEach(t => {
        const well = t.closest('[data-zone-well]');
        if (well) submitted[t.dataset.id] = well.dataset.zoneWell;
    });

    const answerMap = (q.ans && typeof q.ans === 'object') ? q.ans : {};
    const draggables = Array.isArray(q.draggables) ? q.draggables : [];
    const correct = draggables.every(d => submitted[d.id] === answerMap[d.id]);

    return { correct, submitted };
}
