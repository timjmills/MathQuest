// sequence-events.js — Drag events into chronological or logical order.
//
// Question contract:
//   q.events:      [{ id, label, image?, audio_text? }]
//                  shuffled in source; correct order is by id ascending (numeric or lexical)
//   q.task_text:   string   — e.g., "Put the story events in order."
//   q.use_arrows?: boolean  — default true (show connectors 1→2→3 between slots)
//   q.k2_appropriate?: boolean  — large card mode (≤3 events)
//
// Layout:
//   ≤4 events  → horizontal slot row
//   >4 events  → vertical slot row (numbered, stacked)
//
// Partial-correct lock on wrong submit:
//   Events in correct slots → .lq-locked-correct + non-draggable
//   Events in wrong slots   → returned to source pool + .lq-wrong-persistent
//
// Exports:
//   renderSequenceEvents(q, container)
//   checkSequenceEvents(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _announce(host, msg) {
    const live = host.querySelector('.lq-se-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
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

/**
 * Derive the correct order from event ids. The spec says correct order is by id
 * ascending — numeric if ids look numeric, lexical otherwise.
 */
function _correctOrder(events) {
    const sorted = events.slice().sort((a, b) => {
        const na = Number(a.id), nb = Number(b.id);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return String(a.id).localeCompare(String(b.id));
    });
    return sorted.map(e => e.id);
}

// ─── render ──────────────────────────────────────────────────────────────────

export function renderSequenceEvents(q, container) {
    if (!container || !q) return;

    const events    = Array.isArray(q.events) ? q.events : [];
    const taskText  = q.task_text || 'Put the events in the correct order.';
    const useArrows = q.use_arrows !== false;
    const isK2      = !!q.k2_appropriate;
    const isVertical = events.length > 4;

    if (!events.length) {
        container.innerHTML = '<p class="lq-widget-error">sequence-events: no events provided.</p>';
        return;
    }

    // Shuffle display order of events in the source pool
    const shuffled = events.slice().sort(() => Math.random() - 0.5);

    const cardClass = isK2 ? 'lq-se-card lq-se-card--k2' : 'lq-se-card';

    // Source pool tiles
    const poolTilesHtml = shuffled.map(ev => {
        const label    = _esc(ev.label || ev.id);
        const imgHtml  = ev.image
            ? `<img class="lq-se-card-img" src="${_esc(ev.image)}" alt="${label}">`
            : '';
        const audioBtn = (ev.audio_text || ev.label)
            ? `<button type="button" class="lq-se-audio-btn"
                data-audio="${_esc(ev.audio_text || ev.label)}"
                aria-label="Listen" tabindex="-1">🔊</button>`
            : '';
        return `<div
            class="${cardClass}"
            draggable="true"
            data-event-id="${_esc(ev.id)}"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="${label}, drag to place in sequence"
            >
            ${imgHtml}
            <span class="lq-se-card-label">${label}</span>
            ${audioBtn}
        </div>`;
    }).join('');

    // Numbered slots
    const correctIds = _correctOrder(events);
    const slotClass  = isVertical
        ? 'lq-se-slot lq-se-slot--vertical'
        : 'lq-se-slot';

    const slotsHtml = correctIds.map((_, i) => {
        const arrow = (useArrows && !isVertical && i < correctIds.length - 1)
            ? `<span class="lq-se-arrow" aria-hidden="true">→</span>`
            : '';
        return `<div
            class="${slotClass}"
            data-slot-pos="${i}"
            role="listbox"
            aria-label="Step ${i + 1}, empty">
            <span class="lq-se-slot-num" aria-hidden="true">${i + 1}</span>
            <div class="lq-se-slot-well" data-well="${i}"></div>
        </div>${arrow}`;
    }).join('');

    const layoutClass = isVertical ? 'lq-se-slots--vertical' : 'lq-se-slots--horizontal';

    container.innerHTML = `
        <div class="lq-se-host${isK2 ? ' lq-se-host--k2' : ''}"
             role="application"
             aria-label="Sequence events">

            <p class="lq-se-task-text">${_esc(taskText)}</p>

            <div class="lq-se-slots ${layoutClass}" aria-label="Sequence slots">
                ${slotsHtml}
            </div>

            <div class="lq-se-pool" data-role="pool" aria-label="Event cards">
                ${poolTilesHtml}
            </div>

            <div class="lq-se-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <button type="button" class="lq-se-submit primary-btn" disabled>Submit</button>
        </div>`;

    _attachInteraction(q, container, events, correctIds, isK2);

    if (isK2 && state.ttsEnabled && typeof window.speakQuestion === 'function') {
        setTimeout(() => window.speakQuestion(), 80);
    }
}

// ─── interaction ─────────────────────────────────────────────────────────────

function _attachInteraction(q, container, events, correctIds, isK2) {
    const host        = container.querySelector('.lq-se-host');
    const pool        = host.querySelector('.lq-se-pool');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn   = host.querySelector('.lq-se-submit');
    if (!host) return;

    let locked   = false;
    let activeId = null;   // keyboard / click-and-click

    // ── helpers ──────────────────────────────────────────────────────────────

    function getCard(eventId) {
        return host.querySelector(`.lq-se-card[data-event-id="${CSS.escape(eventId)}"]`);
    }

    function getWell(pos) {
        return host.querySelector(`.lq-se-slot-well[data-well="${pos}"]`);
    }

    function getSlotEl(pos) {
        return host.querySelector(`.lq-se-slot[data-slot-pos="${pos}"]`);
    }

    function getCardInWell(wellEl) {
        return wellEl ? wellEl.querySelector('.lq-se-card') : null;
    }

    function getCardPos(card) {
        const well = card.closest('[data-well]');
        return well ? parseInt(well.dataset.well, 10) : null;
    }

    function filledCount() {
        return Array.from(host.querySelectorAll('[data-well]'))
            .filter(w => w.querySelector('.lq-se-card') !== null).length;
    }

    function allCards() {
        return Array.from(host.querySelectorAll('.lq-se-card'));
    }

    function refreshSubmit() {
        submitBtn.disabled = locked || filledCount() < events.length;
    }

    function refreshSlotAria() {
        events.forEach((_, i) => {
            const slotEl = getSlotEl(i);
            if (!slotEl) return;
            const card = getCardInWell(getWell(i));
            slotEl.setAttribute('aria-label',
                card
                    ? `Step ${i+1}: ${card.dataset.eventId}`
                    : `Step ${i+1}, empty`);
        });
    }

    function placeCardInSlot(card, pos) {
        const well = getWell(pos);
        if (!well) return;
        // If well occupied, return existing to pool
        const existing = getCardInWell(well);
        if (existing && existing !== card) {
            pool.appendChild(existing);
            existing.setAttribute('aria-pressed', 'false');
        }
        well.appendChild(card);
        card.setAttribute('aria-pressed', 'false');
        _announce(host, `${card.dataset.eventId} placed in step ${pos + 1}.`);
        refreshSlotAria();
        refreshSubmit();
        if (!locked && filledCount() === events.length) {
            setTimeout(() => { if (!locked) submitBtn.click(); }, 350);
        }
    }

    function returnCardToPool(card) {
        pool.appendChild(card);
        card.setAttribute('aria-pressed', 'false');
        _announce(host, `${card.dataset.eventId} returned to pool.`);
        refreshSlotAria();
        refreshSubmit();
    }

    function setActive(card) {
        clearActive();
        if (!card) return;
        activeId = card.dataset.eventId;
        card.classList.add('lq-se-card--active');
        card.setAttribute('aria-pressed', 'true');
        _announce(host, `Picked up: ${card.querySelector('.lq-se-card-label').textContent.trim()}. Select a slot.`);
    }

    function clearActive() {
        if (activeId) {
            const old = getCard(activeId);
            if (old) {
                old.classList.remove('lq-se-card--active');
                old.setAttribute('aria-pressed', 'false');
            }
        }
        activeId = null;
    }

    // ── audio buttons ────────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        const btn = e.target.closest('.lq-se-audio-btn');
        if (!btn) return;
        e.stopPropagation();
        e.preventDefault();
        _speakTile(btn.dataset.audio || '');
    });

    // Block drag on audio buttons
    host.addEventListener('dragstart', e => {
        if (e.target.closest('.lq-se-audio-btn')) {
            e.preventDefault(); e.stopPropagation();
        }
    }, true);

    // ── click-and-click ───────────────────────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        if (e.target.closest('.lq-se-audio-btn')) return;

        const card   = e.target.closest('.lq-se-card');
        const slotEl = e.target.closest('.lq-se-slot');

        if (card && host.contains(card)) {
            if (card.dataset.locked === '1') return;
            if (activeId === card.dataset.eventId) {
                clearActive();
            } else {
                setActive(card);
            }
            return;
        }

        if (slotEl && host.contains(slotEl)) {
            const pos = parseInt(slotEl.dataset.slotPos, 10);
            if (activeId) {
                const active = getCard(activeId);
                if (active) {
                    placeCardInSlot(active, pos);
                    clearActive();
                }
            } else {
                // Click occupied slot without active → return card to pool
                const well = getWell(pos);
                const occ  = getCardInWell(well);
                if (occ && occ.dataset.locked !== '1') {
                    returnCardToPool(occ);
                }
            }
        }
    });

    // ── keyboard ──────────────────────────────────────────────────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key === 'Enter' || e.key === ' ') {
            const card   = e.target.closest('.lq-se-card');
            const slotEl = e.target.closest('.lq-se-slot');
            if (card || slotEl) {
                e.preventDefault();
                (card || slotEl).click();
            }
        }
        if (e.key === 'Escape') clearActive();
    });

    // ── HTML5 drag ────────────────────────────────────────────────────────────
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const card = e.target.closest('.lq-se-card');
        if (!card || card.dataset.locked === '1') return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', card.dataset.eventId);
        card.classList.add('lq-se-dragging');
    });

    host.addEventListener('dragend', e => {
        const card = e.target.closest('.lq-se-card');
        if (card) card.classList.remove('lq-se-dragging');
        host.querySelectorAll('.lq-se-over').forEach(el => el.classList.remove('lq-se-over'));
    });

    host.addEventListener('dragover', e => {
        if (locked) return;
        const slotEl = e.target.closest('.lq-se-slot');
        const pl     = e.target.closest('[data-role="pool"]');
        if (slotEl || pl) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            (slotEl || pl).classList.add('lq-se-over');
        }
    });

    host.addEventListener('dragleave', e => {
        const el = e.target.closest('.lq-se-slot, [data-role="pool"]');
        if (el) el.classList.remove('lq-se-over');
    });

    host.addEventListener('drop', e => {
        if (locked) return;
        const id   = e.dataTransfer.getData('text/plain');
        if (!id) return;
        const card = host.querySelector(`.lq-se-card[data-event-id="${CSS.escape(id)}"]`);
        if (!card) return;

        const slotEl = e.target.closest('.lq-se-slot');
        const pl     = e.target.closest('[data-role="pool"]');
        if (slotEl) {
            e.preventDefault();
            slotEl.classList.remove('lq-se-over');
            placeCardInSlot(card, parseInt(slotEl.dataset.slotPos, 10));
        } else if (pl) {
            e.preventDefault();
            pl.classList.remove('lq-se-over');
            returnCardToPool(card);
        }
    });

    // ── pointer/touch ─────────────────────────────────────────────────────────
    let _ptCard = null, _ptGhost = null;

    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const card = e.target.closest('.lq-se-card');
        if (!card || card.dataset.locked === '1' || e.pointerType === 'mouse') return;
        e.preventDefault();
        _ptCard  = card;
        _ptGhost = card.cloneNode(true);
        _ptGhost.style.cssText = `position:fixed;pointer-events:none;z-index:9999;opacity:0.8;
            left:${e.clientX-20}px;top:${e.clientY-20}px;`;
        document.body.appendChild(_ptGhost);
        card.classList.add('lq-se-dragging');
    }, { passive: false });

    host.addEventListener('pointermove', e => {
        if (!_ptCard || !_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 20}px`;
        _ptGhost.style.top  = `${e.clientY - 20}px`;
    }, { passive: false });

    host.addEventListener('pointerup', e => {
        if (!_ptCard) return;
        _ptCard.classList.remove('lq-se-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }

        const els  = document.elementsFromPoint(e.clientX, e.clientY);
        const slot = els.find(el => el.classList.contains('lq-se-slot') || el.closest('.lq-se-slot'));
        const pl   = els.find(el => el === pool || el.closest('[data-role="pool"]'));

        if (slot) {
            const slotEl = slot.classList.contains('lq-se-slot') ? slot : slot.closest('.lq-se-slot');
            if (slotEl) placeCardInSlot(_ptCard, parseInt(slotEl.dataset.slotPos, 10));
        } else if (pl) {
            returnCardToPool(_ptCard);
        }
        _ptCard = null;
    });

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const placed = events.map((_, i) => {
            const well = getWell(i);
            const card = getCardInWell(well);
            return card ? card.dataset.eventId : null;
        });

        const firstAttempt = isFirstAttempt();
        let wrongCount     = 0;

        events.forEach((_, i) => {
            const well = getWell(i);
            const card = getCardInWell(well);
            if (!card) return;

            if (card.dataset.eventId === correctIds[i]) {
                card.classList.add('lq-locked-correct');
                card.dataset.locked = '1';
                card.setAttribute('draggable', 'false');
            } else {
                wrongCount++;
                card.classList.add('lq-wrong-persistent');
                returnCardToPool(card);
                setTimeout(() => card.classList.remove('lq-wrong-persistent'), 1600);
            }
        });

        const allCorrect = wrongCount === 0;
        markFirstAttempt(allCorrect);

        if (allCorrect) {
            feedbackZone.textContent = 'Correct! Perfect sequence!';
            locked = true;
            submitBtn.disabled = true;
            allCards().forEach(c => c.setAttribute('draggable', 'false'));
        } else {
            feedbackZone.textContent = `${wrongCount} event${wrongCount === 1 ? '' : 's'} out of order — try again.`;
            refreshSubmit();
        }

        refreshSlotAria();
        container._lqLastResult = { correct: allCorrect, submitted: placed, firstAttempt };
    });

    refreshSlotAria();
    refreshSubmit();
}

// ─── check ───────────────────────────────────────────────────────────────────

export function checkSequenceEvents(q, container) {
    if (!container) return { correct: false, submitted: [] };

    if (container._lqLastResult) return container._lqLastResult;

    const host = container.querySelector('.lq-se-host');
    if (!host) return { correct: false, submitted: [] };

    const events     = Array.isArray(q.events) ? q.events : [];
    const correctIds = _correctOrder(events);
    const placed     = events.map((_, i) => {
        const well = host.querySelector(`[data-well="${i}"]`);
        const card = well ? well.querySelector('.lq-se-card') : null;
        return card ? card.dataset.eventId : null;
    });

    const correct = placed.every((id, i) => id === correctIds[i]);
    return { correct, submitted: placed };
}
