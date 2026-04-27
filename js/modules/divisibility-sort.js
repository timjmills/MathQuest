import { state } from './state.js';
import {
    isMapTestMode,
    isFirstAttempt,
    markFirstAttempt,
    hasAllCorrectFired,
    markAllCorrectFired,
} from './widget-retry.js';

// Track selected number for tap-to-sort
let selectedDivSortNumber = null;

// Divisibility rules data for help popup
const divisibilityRules = {
    1: { rule: "All integers are divisible by 1", example: "123, 500, 7 — any number works!", color: "#888" },
    2: { rule: "Last digit is even (0, 2, 4, 6, or 8)", example: "128 ends in 8 → divisible", color: "#e53935" },
    3: { rule: "Sum of all digits is divisible by 3", example: "375 → 3+7+5=15 → 15÷3=5 ✓", color: "#fb8c00" },
    4: { rule: "Last TWO digits form a number divisible by 4", example: "528 → 28÷4=7 ✓", color: "#fdd835" },
    5: { rule: "Last digit is 0 or 5", example: "345 ends in 5 ✓ | 910 ends in 0 ✓", color: "#43a047" },
    6: { rule: "Divisible by BOTH 2 AND 3", example: "756 → even AND 7+5+6=18 ✓", color: "#00acc1" },
    7: { rule: "Double the last digit, subtract from the rest", example: "161 → 16 - (2×1) = 14 → 14÷7=2 ✓", color: "#1e88e5" },
    8: { rule: "Last THREE digits form a number divisible by 8", example: "5128 → 128÷8=16 ✓", color: "#5e35b1" },
    9: { rule: "Sum of all digits is divisible by 9", example: "126 → 1+2+6=9 → 9÷9=1 ✓", color: "#d81b60" },
    10: { rule: "Last digit is 0", example: "680 ends in 0 ✓ | 200 ends in 0 ✓", color: "#6d4c41" },
    11: { rule: "Alternating sum of digits divisible by 11 (or = 0)", example: "121 → 1-2+1=0 ✓ | 2728 → 2-7+2-8=-11 ✓", color: "#546e7a" },
    12: { rule: "Divisible by BOTH 3 AND 4", example: "144 → sum=9 (÷3✓) & 44÷4=11 ✓", color: "#8e24aa" }
};

export function showDivisibilityHelp(currentDivisor) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'divHelpOverlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
        animation: fadeIn 0.2s ease;
    `;
    
    // Build rules table
    let rulesHTML = '';
    for (let i = 1; i <= 12; i++) {
        const r = divisibilityRules[i];
        const isHighlighted = i === currentDivisor;
        rulesHTML += `
            <div style="display:grid;grid-template-columns:50px 1fr 1fr;gap:10px;padding:10px;border-bottom:1px solid var(--border-light);${isHighlighted ? 'background:rgba(74,158,255,0.15);border-radius:8px;' : ''}">
                <div style="background:${r.color};color:white;font-size:1.2rem;font-weight:700;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:8px;">${i}</div>
                <div style="font-size:0.9rem;"><strong>${i} can go into:</strong><br/>${r.rule}</div>
                <div style="font-size:0.85rem;color:var(--text-dim);">${r.example}</div>
            </div>
        `;
    }
    
    overlay.innerHTML = `
        <div style="
            background: var(--bg-card);
            padding: 24px;
            border-radius: 16px;
            max-width: 700px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        ">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h2 style="margin:0;font-size:1.4rem;color:var(--accent-purple);">📖 Divisibility Rules 1-12</h2>
                <button onclick="document.getElementById('divHelpOverlay').remove()" 
                    style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-dim);">✕</button>
            </div>
            <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:16px;">
                ${currentDivisor ? `Currently sorting by: <strong style="color:var(--accent-cyan);font-size:1.1rem;">${currentDivisor}</strong>` : 'Learn the rules for numbers 1-12'}
            </div>
            <div style="display:flex;flex-direction:column;gap:2px;">
                ${rulesHTML}
            </div>
            <button onclick="document.getElementById('divHelpOverlay').remove()" 
                class="btn btn-primary" style="width:100%;margin-top:16px;padding:12px;">
                Got it! ✓
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close on background click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });
}

// Toggle selection of a number (tap-to-sort mode)
export function toggleDivSortNumber(el, divisor) {
    const allNumbers = document.querySelectorAll('.div-sort-number');
    
    if (selectedDivSortNumber === el) {
        // Deselect
        el.style.transform = '';
        el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        selectedDivSortNumber = null;
    } else {
        // Deselect previous
        allNumbers.forEach(n => {
            n.style.transform = '';
            n.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        });
        
        // Select this one
        el.style.transform = 'scale(1.1)';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35), 0 0 0 3px var(--accent-cyan)';
        selectedDivSortNumber = el;
    }
}

// Handle click on sort boxes (tap-to-sort)
document.addEventListener('click', function(e) {
    const sortBox = e.target.closest('.div-sort-box');
    if (sortBox && selectedDivSortNumber) {
        const type = sortBox.dataset.type;
        const num = parseInt(selectedDivSortNumber.dataset.num);
        const divisor = state.currentQ?.divisibilitySortData?.divisor;
        
        if (divisor) {
            moveNumberToBox(selectedDivSortNumber, type, divisor);
            selectedDivSortNumber = null;
        }
    }
});

// Drag start handler
document.addEventListener('dragstart', function(e) {
    if (e.target.classList.contains('div-sort-number')) {
        e.dataTransfer.setData('text/plain', e.target.dataset.num);
        e.target.style.opacity = '0.5';
    }
});

document.addEventListener('dragend', function(e) {
    if (e.target.classList.contains('div-sort-number')) {
        e.target.style.opacity = '1';
    }
});

// ---- TOUCH support (mobile/tablet) ----
// HTML5 drag does not fire on touch. Wire document-level touch handlers that
// mirror the dragstart/drop flow with a floating ghost. The existing
// tap-to-sort fallback (toggleDivSortNumber + click handler) still works for
// pure tap users, but actual drag-to-sort now works on touch screens too.
(function _initDivSortTouch() {
    if (typeof document === 'undefined') return;
    let activeNum = null;
    let ghost = null;
    let touchId = null;
    let lastBox = null;
    let offsetX = 0, offsetY = 0;

    function clearAll() {
        if (activeNum) activeNum.style.opacity = '1';
        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
        if (lastBox) {
            const type = lastBox.dataset.type;
            lastBox.style.background = type === 'yes'
                ? 'rgba(6,214,160,0.1)' : 'rgba(239,71,111,0.1)';
        }
        activeNum = null;
        ghost = null;
        touchId = null;
        lastBox = null;
    }

    document.addEventListener('touchstart', (e) => {
        if (activeNum) return;
        const t = e.touches && e.touches[0];
        if (!t) return;
        const startEl = document.elementFromPoint(t.clientX, t.clientY);
        if (!startEl) return;
        const num = startEl.closest && startEl.closest('.div-sort-number');
        if (!num) return;
        activeNum = num;
        touchId = t.identifier;
        const rect = num.getBoundingClientRect();
        offsetX = t.clientX - rect.left;
        offsetY = t.clientY - rect.top;
        num.style.opacity = '0.5';
        ghost = num.cloneNode(true);
        ghost.style.position = 'fixed';
        ghost.style.pointerEvents = 'none';
        ghost.style.opacity = '0.85';
        ghost.style.zIndex = '9999';
        ghost.style.left = (t.clientX - offsetX) + 'px';
        ghost.style.top = (t.clientY - offsetY) + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.margin = '0';
        document.body.appendChild(ghost);
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!activeNum) return;
        let t = null;
        for (let i = 0; i < e.touches.length; i++) {
            if (e.touches[i].identifier === touchId) { t = e.touches[i]; break; }
        }
        if (!t) return;
        try { e.preventDefault(); } catch (_e) {}
        ghost.style.left = (t.clientX - offsetX) + 'px';
        ghost.style.top = (t.clientY - offsetY) + 'px';
        const elBelow = document.elementFromPoint(t.clientX, t.clientY);
        const box = elBelow && elBelow.closest && elBelow.closest('.div-sort-box');
        if (box !== lastBox) {
            if (lastBox) {
                const type = lastBox.dataset.type;
                lastBox.style.background = type === 'yes'
                    ? 'rgba(6,214,160,0.1)' : 'rgba(239,71,111,0.1)';
            }
            lastBox = box || null;
            if (lastBox) {
                lastBox.style.background = lastBox.dataset.type === 'yes'
                    ? 'rgba(6,214,160,0.3)' : 'rgba(239,71,111,0.3)';
            }
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (!activeNum) return;
        let t = null;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) { t = e.changedTouches[i]; break; }
        }
        const numberEl = activeNum;
        let box = lastBox;
        if (t) {
            const elBelow = document.elementFromPoint(t.clientX, t.clientY);
            const b2 = elBelow && elBelow.closest && elBelow.closest('.div-sort-box');
            if (b2) box = b2;
        }
        clearAll();
        if (!box) return;
        const boxType = box.dataset.type;
        const divisor = state.currentQ?.divisibilitySortData?.divisor;
        if (!boxType || !divisor) return;
        try { moveNumberToBox(numberEl, boxType, divisor); }
        catch (err) { console.warn('div-sort touch drop failed:', err); }
    });

    document.addEventListener('touchcancel', clearAll);
})();

// Drop handler for divisibility sorting
export function dropDivSortNumber(event, boxType, divisor) {
    event.preventDefault();
    const num = event.dataTransfer.getData('text/plain');
    const numberEl = document.querySelector(`.div-sort-number[data-num="${num}"]`);
    
    if (numberEl) {
        moveNumberToBox(numberEl, boxType, divisor);
    }
    
    // Reset box background
    event.target.closest('.div-sort-box').style.background = 
        boxType === 'yes' ? 'rgba(6,214,160,0.1)' : 'rgba(239,71,111,0.1)';
}

// Move number to a sorting box and check correctness
export function moveNumberToBox(numberEl, boxType, divisor) {
    const num = parseInt(numberEl.dataset.num);
    const isDivisible = num % divisor === 0;
    const isCorrect = (boxType === 'yes' && isDivisible) || (boxType === 'no' && !isDivisible);
    
    // Get the drop zone
    const dropZone = document.getElementById(boxType === 'yes' ? 'divSortYes' : 'divSortNo')
        .querySelector('.div-sort-dropped');
    
    // Clone and style the number
    const clone = numberEl.cloneNode(true);
    clone.draggable = false;
    clone.onclick = null;
    clone.style.cursor = 'default';
    clone.style.transform = '';
    clone.style.boxShadow = '';
    clone.style.padding = '8px 14px';
    clone.style.fontSize = '1.1rem';
    
    if (isCorrect) {
        clone.style.background = 'linear-gradient(135deg, var(--correct), #00c896)';
        clone.style.border = '2px solid var(--correct)';
        // Small confetti for correct
        confetti(8);
    } else {
        clone.style.background = 'linear-gradient(135deg, var(--incorrect), #d63031)';
        clone.style.border = '2px solid var(--incorrect)';
        // Shake animation
        clone.style.animation = 'shake 0.3s ease';
    }
    
    // Add to drop zone
    dropZone.appendChild(clone);
    
    // Remove original
    numberEl.remove();
    
    // Check if all numbers sorted
    checkDivisibilitySortComplete(divisor);
}

// Check if sorting is complete
export function checkDivisibilitySortComplete(divisor) {
    const remaining = document.querySelectorAll('#divSortNumbers .div-sort-number');

    if (remaining.length === 0) {
        // All sorted - check results
        const yesBox = document.getElementById('divSortYes').querySelector('.div-sort-dropped');
        const noBox = document.getElementById('divSortNo').querySelector('.div-sort-dropped');

        const yesNums = Array.from(yesBox.querySelectorAll('.div-sort-number')).map(el => parseInt(el.dataset.num));
        const noNums = Array.from(noBox.querySelectorAll('.div-sort-number')).map(el => parseInt(el.dataset.num));

        const yesCorrect = yesNums.every(n => n % divisor === 0);
        const noCorrect = noNums.every(n => n % divisor !== 0);
        const allOk = yesCorrect && noCorrect;

        const feedback = document.getElementById('feedbackArea');

        // First-attempt scoring tracking. Per-tile red/green is already painted
        // by moveNumberToBox; we only branch here on overall verdict.
        const firstSubmit = isFirstAttempt();
        const firstAttemptCorrect = markFirstAttempt(allOk);
        const mapTest = isMapTestMode();

        if (allOk) {
            if (hasAllCorrectFired()) return;
            markAllCorrectFired();
            feedback.style.display = 'block';
            feedback.className = 'feedback-area correct';
            feedback.innerHTML = firstAttemptCorrect
                ? `🎉 Perfect! All numbers sorted correctly!`
                : `🎉 All sorted correctly! (Got it on a retry — keep practicing!)`;
            confetti(30);

            // Update score (count this question once)
            state.lastAnswerCorrect = true;
            state.correct = (state.correct || 0) + 1;
            state.qCount = (state.qCount || 0) + 1;
            if (firstSubmit && firstAttemptCorrect) {
                state.streak = (state.streak || 0) + 1;
            }
            if (typeof window.bannerRecordAnswer === 'function' && firstSubmit) {
                window.bannerRecordAnswer(firstAttemptCorrect);
            }
            try { if (typeof updateGameUI === 'function') updateGameUI(); } catch (_) {}
            if (typeof window.updateGameUI === 'function') window.updateGameUI();

            // MAP test mode: hand off immediately (already locked, advances)
            if (state.mapMode === true && typeof window.recordMapAnswer === 'function') {
                window.recordMapAnswer({ correct: firstAttemptCorrect });
                return;
            }
            // Auto-advance
            setTimeout(() => { window.transitionToNextQuestion(); }, 750);
        } else {
            // Some wrong — must retry
            const wrongCount = yesNums.filter(n => n % divisor !== 0).length +
                              noNums.filter(n => n % divisor === 0).length;

            feedback.style.display = 'block';
            feedback.className = 'feedback-area incorrect';
            feedback.innerHTML = `Not quite! ${wrongCount} number${wrongCount > 1 ? 's were' : ' was'} in the wrong box. Try again!`;
            document.getElementById("questionCard").classList.add("incorrect-bg");

            // First-submit scoring side effects (only once per question).
            if (firstSubmit) {
                state.streak = 0;
                if (typeof window.bannerRecordAnswer === 'function') window.bannerRecordAnswer(false);
                state.lastAnswerCorrect = false;
            }

            // MAP test mode: lock + advance even on wrong (no retry in test).
            if (mapTest) {
                state.hasAnswered = true;
                if (typeof window.recordMapAnswer === 'function') {
                    window.recordMapAnswer({ correct: false });
                }
                return;
            }

            // Re-enable for retry: move wrongly placed numbers back
            setTimeout(() => {
                document.getElementById("questionCard").classList.remove("incorrect-bg");
                feedback.style.display = 'none';

                // Move wrong numbers back to the source area
                const numbersContainer = document.getElementById('divSortNumbers');
                const wrongYes = yesNums.filter(n => n % divisor !== 0);
                const wrongNo = noNums.filter(n => n % divisor === 0);

                // Remove wrong clones from yes/no boxes
                [yesBox, noBox].forEach(box => {
                    const clones = box.querySelectorAll('.div-sort-number');
                    clones.forEach(clone => {
                        const num = parseInt(clone.dataset.num);
                        if (wrongYes.includes(num) || wrongNo.includes(num)) {
                            clone.remove();
                        }
                    });
                });

                // Re-create wrong numbers in the source
                const allWrong = [...wrongYes, ...wrongNo];
                allWrong.forEach(num => {
                    const el = document.createElement('div');
                    el.className = 'div-sort-number';
                    el.draggable = true;
                    el.dataset.num = num;
                    el.textContent = num;
                    el.style.cssText = 'background:linear-gradient(135deg,var(--accent-purple),var(--accent-cyan));color:white;padding:12px 18px;border-radius:12px;font-weight:800;font-size:1.3rem;cursor:grab;box-shadow:0 3px 10px rgba(0,0,0,0.2);';
                    el.onclick = function() { window.toggleDivSortNumber(el, divisor); };
                    numbersContainer.appendChild(el);
                });
            }, 1500);
        }
    }
}

// ============================================
// WORKSHEET MODE DIVISIBILITY SORTING
// ============================================

// Setup divisibility sort for worksheet mode
export function setupWorksheetDivisibilitySort(idx, divisor) {
    const numbersContainer = document.getElementById(`ws_divSortNumbers_${idx}`);
    const yesBox = document.getElementById(`ws_divSortYes_${idx}`);
    const noBox = document.getElementById(`ws_divSortNo_${idx}`);
    
    if (!numbersContainer || !yesBox || !noBox) return;
    
    // Setup drag events for the numbers
    const numbers = numbersContainer.querySelectorAll('.div-sort-number');
    numbers.forEach(num => {
        num.setAttribute('data-ws-idx', idx);
        
        // Drag events
        num.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                num: num.dataset.num,
                idx: idx
            }));
            num.style.opacity = '0.5';
        });
        
        num.addEventListener('dragend', (e) => {
            num.style.opacity = '1';
        });
        
        // Click to select for tap-sort
        num.addEventListener('click', () => {
            wsToggleDivSortNumber(num, idx, divisor);
        });
    });
    
    // Setup drop zones
    [yesBox, noBox].forEach(box => {
        const boxType = box.id.includes('Yes') ? 'yes' : 'no';
        
        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            box.style.background = boxType === 'yes' ? 'rgba(6,214,160,0.25)' : 'rgba(239,71,111,0.25)';
        });
        
        box.addEventListener('dragleave', () => {
            box.style.background = boxType === 'yes' ? 'rgba(6,214,160,0.1)' : 'rgba(239,71,111,0.1)';
        });
        
        box.addEventListener('drop', (e) => {
            e.preventDefault();
            try {
                const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (data.idx === idx) {
                    const numberEl = numbersContainer.querySelector(`.div-sort-number[data-num="${data.num}"]`);
                    if (numberEl) {
                        wsMoveNumberToBox(numberEl, boxType, divisor, idx);
                    }
                }
            } catch (err) {}
            box.style.background = boxType === 'yes' ? 'rgba(6,214,160,0.1)' : 'rgba(239,71,111,0.1)';
        });
        
        // Click to place selected number
        box.addEventListener('click', () => {
            if (wsSelectedDivNumber && wsSelectedDivNumber.getAttribute('data-ws-idx') == idx) {
                const boxType = box.id.includes('Yes') ? 'yes' : 'no';
                wsMoveNumberToBox(wsSelectedDivNumber, boxType, divisor, idx);
                wsSelectedDivNumber = null;
            }
        });
    });
}

// Track selected number in worksheet mode
let wsSelectedDivNumber = null;

// Toggle selection for tap-sort in worksheet mode
export function wsToggleDivSortNumber(el, idx, divisor) {
    const numbersContainer = document.getElementById(`ws_divSortNumbers_${idx}`);
    const allNumbers = numbersContainer.querySelectorAll('.div-sort-number');
    
    if (wsSelectedDivNumber === el) {
        el.style.transform = '';
        el.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        wsSelectedDivNumber = null;
    } else {
        allNumbers.forEach(n => {
            n.style.transform = '';
            n.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        });
        el.style.transform = 'scale(1.1)';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35), 0 0 0 3px var(--accent-cyan)';
        wsSelectedDivNumber = el;
    }
}

// Move number to box in worksheet mode
export function wsMoveNumberToBox(numberEl, boxType, divisor, idx) {
    const num = parseInt(numberEl.dataset.num);
    const isDivisible = num % divisor === 0;
    const isCorrect = (boxType === 'yes' && isDivisible) || (boxType === 'no' && !isDivisible);
    
    const dropZone = document.getElementById(`ws_divSort${boxType === 'yes' ? 'Yes' : 'No'}_${idx}`)
        .querySelector('.div-sort-dropped');
    
    const clone = numberEl.cloneNode(true);
    clone.draggable = false;
    clone.onclick = null;
    clone.style.cursor = 'default';
    clone.style.transform = '';
    clone.style.boxShadow = '';
    clone.style.padding = '8px 14px';
    clone.style.fontSize = '1.1rem';
    
    if (isCorrect) {
        clone.style.background = 'linear-gradient(135deg, var(--correct), #00c896)';
        clone.style.border = '2px solid var(--correct)';
        confetti(8);
    } else {
        clone.style.background = 'linear-gradient(135deg, var(--incorrect), #d63031)';
        clone.style.border = '2px solid var(--incorrect)';
        clone.style.animation = 'shake 0.3s ease';
    }
    
    dropZone.appendChild(clone);
    numberEl.remove();
    
    wsCheckDivisibilitySortComplete(idx, divisor);
}

// Check if worksheet sorting is complete
export function wsCheckDivisibilitySortComplete(idx, divisor) {
    const numbersContainer = document.getElementById(`ws_divSortNumbers_${idx}`);
    const remaining = numbersContainer.querySelectorAll('.div-sort-number');
    
    if (remaining.length === 0) {
        const yesBox = document.getElementById(`ws_divSortYes_${idx}`).querySelector('.div-sort-dropped');
        const noBox = document.getElementById(`ws_divSortNo_${idx}`).querySelector('.div-sort-dropped');
        
        const yesNums = Array.from(yesBox.querySelectorAll('.div-sort-number')).map(el => parseInt(el.dataset.num));
        const noNums = Array.from(noBox.querySelectorAll('.div-sort-number')).map(el => parseInt(el.dataset.num));
        
        const yesCorrect = yesNums.every(n => n % divisor === 0);
        const noCorrect = noNums.every(n => n % divisor !== 0);
        
        const card = document.getElementById(`ws_card_${idx}`);
        
        if (yesCorrect && noCorrect) {
            card.style.borderColor = 'var(--correct)';
            card.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.1), rgba(6,214,160,0.05))';
            confetti(20);
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(true);
            }
        } else {
            card.style.borderColor = 'var(--incorrect)';
            card.style.background = 'linear-gradient(135deg, rgba(239,71,111,0.1), rgba(239,71,111,0.05))';
            if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
                window.bannerRecordAnswer(false);
            }
        }
    }
}

// ============================================
// END DIVISIBILITY SORTING FUNCTIONS
// ============================================

// Show word problem hint
