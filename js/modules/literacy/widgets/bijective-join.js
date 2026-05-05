// bijective-join.js — Two-column bijective drag-and-drop join widget.
//
// Used by `syllable-join` and `compound-builder` mechanics. Every left item
// must pair with EXACTLY ONE right item, and every right item can hold AT
// MOST ONE left item. This bijectivity differentiates it from match-pairs.
//
// Question contract:
//   q.stem:           string
//   q.left_items:     [{ id, text }]
//   q.right_items:    [{ id, text }]
//   q.correct_pairs:  [[left_id, right_id], ...]   bijective, |left|==|right|
//   q.k2_appropriate?: boolean
//
// Interaction:
//   - Left items are draggable chips. Right items are drop slots that can
//     hold one chip. Dropping on an occupied slot displaces its chip back
//     to the left tray. Clicking a placed chip returns it to the tray.
//   - Submit enables when every left item is placed (one per right slot).
//
// Partial-correct lock on wrong submit (widget-retry pattern):
//   Correct pairs  → locked, .lq-locked-correct
//   Wrong pairs    → returned to tray with .lq-wrong-persistent flash
//
// Exports:
//   renderBijectiveJoin(q, container)
//   checkBijectiveJoin(q, container)

import { state } from '../../state.js';
import { isFirstAttempt, markFirstAttempt } from '../../widget-retry.js';

function _esc(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function _speak(text) {
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
    const live = host.querySelector('.lq-bj-live');
    if (!live) return;
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = msg; });
}

export function renderBijectiveJoin(q, container) {
    if (!container || !q) return;

    const leftItems = Array.isArray(q.left_items) ? q.left_items : [];
    const rightItems = Array.isArray(q.right_items) ? q.right_items : [];
    const correctPairs = Array.isArray(q.correct_pairs) ? q.correct_pairs : [];
    const isK2 = !!q.k2_appropriate;
    const stem = q.stem || '';

    const k2Class = isK2 ? ' lq-bj--k2' : '';

    function _chipHtml(item) {
        const text = _esc(item.text || item.id);
        return `<div class="lq-bj-chip"
            data-id="${_esc(item.id)}"
            draggable="true"
            role="button"
            tabindex="0"
            aria-label="${text}, draggable">${text}</div>`;
    }

    function _slotHtml(item) {
        const text = _esc(item.text || item.id);
        return `<div class="lq-bj-row">
            <div class="lq-bj-slot"
                data-right-id="${_esc(item.id)}"
                role="region"
                aria-label="Drop a chip to pair with ${text}"></div>
            <div class="lq-bj-right" aria-hidden="true">${text}</div>
        </div>`;
    }

    const trayHtml = leftItems.map(_chipHtml).join('');
    const slotsHtml = rightItems.map(_slotHtml).join('');

    container.innerHTML = `
        <div class="lq-bijective-join${k2Class}" role="application"
            aria-label="Drag each left chip to a right slot to make a pair">
            ${stem ? `<p class="lq-bj-stem">${_esc(stem)}</p>` : ''}
            <div class="lq-bj-board">
                <div class="lq-bj-tray" role="group" aria-label="Available chips">
                    ${trayHtml}
                </div>
                <div class="lq-bj-slots" role="group" aria-label="Pairing slots">
                    ${slotsHtml}
                </div>
            </div>
            <div class="lq-feedback-zone" aria-live="assertive" aria-atomic="true"></div>
            <div class="lq-bj-live" aria-live="polite"
                style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;"></div>
            <button type="button" class="lq-bj-submit primary-btn" disabled>Submit</button>
        </div>`;

    const host = container.querySelector('.lq-bijective-join');
    const tray = host.querySelector('.lq-bj-tray');
    const feedbackZone = host.querySelector('.lq-feedback-zone');
    const submitBtn = host.querySelector('.lq-bj-submit');

    // placements: Map<right_id, left_id>
    const placements = new Map();
    let locked = false;
    const correctMap = new Map(correctPairs.map(([l, r]) => [l, r]));

    function getChipEl(leftId) {
        return host.querySelector(`.lq-bj-chip[data-id="${CSS.escape(leftId)}"]`);
    }
    function getSlotEl(rightId) {
        return host.querySelector(`.lq-bj-slot[data-right-id="${CSS.escape(rightId)}"]`);
    }

    function refreshSubmit() {
        submitBtn.disabled = locked || placements.size < leftItems.length;
    }

    function placeChip(leftId, rightId) {
        const chip = getChipEl(leftId);
        const slot = getSlotEl(rightId);
        if (!chip || !slot) return;
        if (chip.dataset.locked === '1' || slot.dataset.locked === '1') return;

        // If this slot is occupied, return its current chip to the tray.
        const existingLeft = placements.get(rightId);
        if (existingLeft && existingLeft !== leftId) {
            returnChip(existingLeft, /*silent*/ true);
        }
        // If this chip is placed elsewhere, free that slot.
        placements.forEach((lId, rId) => {
            if (lId === leftId && rId !== rightId) placements.delete(rId);
        });

        slot.appendChild(chip);
        chip.classList.add('lq-bj-chip--placed');
        slot.classList.add('lq-bj-slot--filled');
        placements.set(rightId, leftId);

        const rEl = getSlotEl(rightId);
        const rLabel = rEl ? rEl.parentElement.querySelector('.lq-bj-right').textContent : rightId;
        _announce(host, `Paired ${chip.textContent} with ${rLabel}.`);
        refreshSubmit();
    }

    function returnChip(leftId, silent) {
        const chip = getChipEl(leftId);
        if (!chip) return;
        if (chip.dataset.locked === '1') return;

        let freedRight = null;
        placements.forEach((lId, rId) => {
            if (lId === leftId) freedRight = rId;
        });
        if (freedRight) {
            placements.delete(freedRight);
            const slot = getSlotEl(freedRight);
            if (slot) slot.classList.remove('lq-bj-slot--filled');
        }
        chip.classList.remove('lq-bj-chip--placed', 'lq-wrong-persistent');
        tray.appendChild(chip);
        if (!silent) _announce(host, `Returned ${chip.textContent} to tray.`);
        refreshSubmit();
    }

    // ── Click-to-return for placed chips ──────────────────────────────────────
    host.addEventListener('click', e => {
        if (locked) return;
        const chip = e.target.closest('.lq-bj-chip');
        if (!chip || chip.dataset.locked === '1') return;
        if (chip.classList.contains('lq-bj-chip--placed')) {
            returnChip(chip.dataset.id);
        }
    });

    // ── Keyboard: Enter/Space on chip cycles to next free slot ────────────────
    host.addEventListener('keydown', e => {
        if (locked) return;
        if (e.key !== 'Enter' && e.key !== ' ') return;
        const chip = e.target.closest('.lq-bj-chip');
        if (!chip) return;
        e.preventDefault();
        if (chip.classList.contains('lq-bj-chip--placed')) {
            returnChip(chip.dataset.id);
            return;
        }
        // Find first empty slot
        const emptySlot = rightItems.find(it => !placements.has(it.id));
        if (emptySlot) placeChip(chip.dataset.id, emptySlot.id);
    });

    // ── HTML5 drag-and-drop ───────────────────────────────────────────────────
    host.addEventListener('dragstart', e => {
        if (locked) return;
        const chip = e.target.closest('.lq-bj-chip');
        if (!chip || chip.dataset.locked === '1') return;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', chip.dataset.id);
        chip.classList.add('lq-bj-dragging');
    });
    host.addEventListener('dragend', e => {
        const chip = e.target.closest('.lq-bj-chip');
        if (chip) chip.classList.remove('lq-bj-dragging');
        host.querySelectorAll('.lq-bj-slot--over, .lq-bj-tray--over')
            .forEach(el => el.classList.remove('lq-bj-slot--over', 'lq-bj-tray--over'));
    });
    host.addEventListener('dragover', e => {
        if (locked) return;
        const slot = e.target.closest('.lq-bj-slot');
        const trayDrop = e.target.closest('.lq-bj-tray');
        if (slot) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            slot.classList.add('lq-bj-slot--over');
        } else if (trayDrop) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            trayDrop.classList.add('lq-bj-tray--over');
        }
    });
    host.addEventListener('dragleave', e => {
        const slot = e.target.closest('.lq-bj-slot');
        const trayDrop = e.target.closest('.lq-bj-tray');
        if (slot) slot.classList.remove('lq-bj-slot--over');
        if (trayDrop) trayDrop.classList.remove('lq-bj-tray--over');
    });
    host.addEventListener('drop', e => {
        if (locked) return;
        const leftId = e.dataTransfer.getData('text/plain');
        if (!leftId) return;
        const slot = e.target.closest('.lq-bj-slot');
        const trayDrop = e.target.closest('.lq-bj-tray');
        if (slot) {
            e.preventDefault();
            slot.classList.remove('lq-bj-slot--over');
            placeChip(leftId, slot.dataset.rightId);
        } else if (trayDrop) {
            e.preventDefault();
            trayDrop.classList.remove('lq-bj-tray--over');
            returnChip(leftId);
        }
    });

    // ── Pointer/touch fallback ────────────────────────────────────────────────
    let _ptLeftId = null, _ptGhost = null;
    host.addEventListener('pointerdown', e => {
        if (locked) return;
        const chip = e.target.closest('.lq-bj-chip');
        if (!chip || chip.dataset.locked === '1') return;
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        _ptLeftId = chip.dataset.id;
        _ptGhost = chip.cloneNode(true);
        _ptGhost.style.cssText =
            `position:fixed;pointer-events:none;z-index:9999;opacity:0.8;` +
            `left:${e.clientX-30}px;top:${e.clientY-20}px;`;
        document.body.appendChild(_ptGhost);
        chip.classList.add('lq-bj-dragging');
    }, { passive: false });
    host.addEventListener('pointermove', e => {
        if (!_ptGhost) return;
        e.preventDefault();
        _ptGhost.style.left = `${e.clientX - 30}px`;
        _ptGhost.style.top = `${e.clientY - 20}px`;
    }, { passive: false });
    host.addEventListener('pointerup', e => {
        if (!_ptLeftId) return;
        const chipEl = getChipEl(_ptLeftId);
        if (chipEl) chipEl.classList.remove('lq-bj-dragging');
        if (_ptGhost) { _ptGhost.remove(); _ptGhost = null; }
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        const slot = els.find(el => el.classList && el.classList.contains('lq-bj-slot'))
            || (els.find(el => el.closest && el.closest('.lq-bj-slot')) || {}).closest?.('.lq-bj-slot');
        const trayDrop = els.find(el => el.classList && el.classList.contains('lq-bj-tray'))
            || (els.find(el => el.closest && el.closest('.lq-bj-tray')) || {}).closest?.('.lq-bj-tray');
        if (slot) placeChip(_ptLeftId, slot.dataset.rightId);
        else if (trayDrop) returnChip(_ptLeftId);
        _ptLeftId = null;
    });

    if (isK2 || (state && state.ttsEnabled)) {
        setTimeout(() => _speak(stem), 200);
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    submitBtn.addEventListener('click', () => {
        if (submitBtn.disabled || locked) return;

        const firstAttempt = isFirstAttempt();
        let allCorrect = true;
        const wrongLeftIds = [];

        // Build current pair map keyed by left id → right id.
        const currentByLeft = new Map();
        placements.forEach((lId, rId) => { currentByLeft.set(lId, rId); });

        leftItems.forEach(item => {
            const got = currentByLeft.get(item.id);
            const expected = correctMap.get(item.id);
            const chip = getChipEl(item.id);
            const slot = got ? getSlotEl(got) : null;

            if (got && got === expected) {
                if (chip) { chip.dataset.locked = '1'; chip.classList.add('lq-locked-correct'); chip.draggable = false; }
                if (slot) { slot.dataset.locked = '1'; slot.classList.add('lq-locked-correct'); }
            } else {
                allCorrect = false;
                wrongLeftIds.push(item.id);
                if (chip) chip.classList.add('lq-wrong-persistent');
                if (slot) slot.classList.add('lq-wrong-persistent');
            }
        });

        markFirstAttempt(allCorrect);

        if (!allCorrect) {
            wrongLeftIds.forEach(leftId => {
                const chip = getChipEl(leftId);
                returnChip(leftId, /*silent*/ true);
                if (chip) chip.classList.add('lq-wrong-persistent');
            });
        }

        if (allCorrect) {
            feedbackZone.textContent = 'All pairs correct!';
            locked = true;
            submitBtn.disabled = true;
        } else {
            const wc = wrongLeftIds.length;
            feedbackZone.textContent = `${wc} pair${wc === 1 ? '' : 's'} wrong — try again!`;
            refreshSubmit();
        }

        const submitted = {};
        placements.forEach((lId, rId) => { submitted[lId] = rId; });
        container._lqLastResult = { correct: allCorrect, submitted, firstAttempt };
    });

    refreshSubmit();
}

export function checkBijectiveJoin(q, container) {
    if (!container) return { correct: false, submitted: {}, feedback: '' };
    if (container._lqLastResult) return container._lqLastResult;
    return { correct: false, submitted: {}, feedback: '' };
}
