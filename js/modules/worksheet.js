import { state } from './state.js';
import { SKILLS } from './data.js';
import { shuffle, normalizeText } from './utils.js';
import { isTimeSkill, timeAnswersMatch } from './answer-check.js';
import { openZoomModal, ZOOM_CLICK_IS_ANSWER_TYPES } from './question-render.js';

// Build a static (non-interactive) visual for a grid-fill question so that
// worksheet/print modes can show the grid without the live widget. Blank
// cells render as underlined boxes; filled cells show their value.
// Used by worksheet mode (initial render + Load More) when q.answerType
// is "grid-fill" and q.visual is empty.
function _buildGridFillStaticVisual(q) {
    const gf = q && q.gridFill;
    if (!gf || !Array.isArray(gf.cells) || !gf.rows || !gf.cols) return "";
    const rows = gf.rows, cols = gf.cols;
    const cellW = (gf.cellWidth && gf.cellWidth > 0) ? gf.cellWidth : 80;
    const cellH = (gf.cellHeight && gf.cellHeight > 0) ? gf.cellHeight : 70;
    const labelHTML = gf.label
        ? `<div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.1rem;text-align:center;">${gf.label}</div>`
        : "";
    const byKey = new Map();
    gf.cells.forEach(c => byKey.set(`${c.row},${c.col}`, c));
    let cellsHTML = "";
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = byKey.get(`${r},${c}`);
            if (!cell) {
                cellsHTML += `<div style="width:${cellW}px;height:${cellH}px;"></div>`;
            } else if (cell.blank) {
                cellsHTML += `<div class="gf-cell" data-row="${r}" data-col="${c}" style="width:${cellW}px;height:${cellH}px;display:flex;align-items:center;justify-content:center;border:2px solid var(--text-dim);border-radius:8px;background:var(--bg-card-light);"><span style="display:inline-block;width:60%;border-bottom:3px solid var(--text-dim);">&nbsp;</span></div>`;
            } else {
                const val = (typeof cell.value === 'number') ? cell.value.toLocaleString() : String(cell.value);
                cellsHTML += `<div style="width:${cellW}px;height:${cellH}px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:var(--accent-cyan);color:white;font-weight:700;font-size:1.1rem;">${val}</div>`;
            }
        }
    }
    return `<div style="text-align:center;">
        ${labelHTML}
        <div style="display:grid;grid-template-columns:repeat(${cols}, ${cellW}px);grid-auto-rows:${cellH}px;gap:8px;justify-content:center;margin:6px auto;">
            ${cellsHTML}
        </div>
    </div>`;
}

// Operation-aware hint prefix for word-problem skills.
// Inspects q.skillId (and falls back to q.printFormat) to detect which
// arithmetic operation the student should use, and returns a short
// statement to prepend to the existing hint. Returns "" if not a
// word-problem skill we recognize.
function _wsOpHint(q) {
    if (!q) return "";
    const sid = (q.skillId || "").toLowerCase();
    const pf = (q.printFormat || "").toLowerCase();

    // Multi-step word problems: two operations
    if (sid === "multi_step_word" || sid === "multi_step_word_plain"
        || pf === "multi-step-word") {
        return "💡 This problem has <b>two steps</b>: do the first operation, then use the result in the second.";
    }

    // Multiplicative comparison ("times as many")
    if (sid.startsWith("mult_comparison")) {
        return "💡 Use <b>multiplication or division</b> — compare the two amounts using “times as many.”";
    }

    // Addition word problems: add_word_problems, add_wp_*, add_word_problems_plain
    if (sid === "add_word_problems" || sid === "add_word_problems_plain"
        || sid.startsWith("add_wp_") || pf === "word-add") {
        return "💡 Use <b>addition</b> — combine both numbers.";
    }

    // Subtraction word problems
    if (sid === "sub_word_problems" || sid === "sub_word_problems_plain"
        || sid.startsWith("sub_wp_") || pf === "word-sub") {
        return "💡 Use <b>subtraction</b> — find the difference between the two numbers.";
    }

    // Multiplication word problems
    if (sid === "mult_word_problems" || sid === "mult_word_problems_plain") {
        return "💡 Use <b>multiplication</b> — find the total of equal groups.";
    }

    // Division word problems
    if (sid === "div_word_problems" || sid === "div_word_problems_plain") {
        return "💡 Use <b>division</b> — split the total into equal groups.";
    }

    return "";
}

// Speak a worksheet problem aloud using TTS
export function wsSpeak(idx) {
    if (!("speechSynthesis" in window)) return;
    const q = state.worksheetQs[idx];
    if (!q) return;

    const btn = document.querySelector(`#ws_card_${idx} .ws-tts-btn`);

    // Strip HTML tags, KaTeX notation, and math symbols for speech
    let text = (q.text || '')
        .replace(/<[^>]*>/g, '')
        .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1 over $2')
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}]/g, '')
        .replace(/×/g, ' times ')
        .replace(/÷/g, ' divided by ')
        .replace(/−/g, ' minus ')
        .replace(/\+/g, ' plus ')
        .replace(/=/g, ' equals ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!text) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;

    if (btn) btn.textContent = '\u{1F507}'; // muted speaker while playing
    utterance.onend = () => { if (btn) btn.textContent = '\u{1F50A}'; };
    utterance.onerror = () => { if (btn) btn.textContent = '\u{1F50A}'; };

    window.speechSynthesis.speak(utterance);
}

// Magnify a worksheet card's visual content in a full-screen overlay
export function wsMagnifyCard(index) {
    const card = document.getElementById(`ws_card_${index}`);
    if (!card) return;

    // Clone the card's visual content (skip hint popup, magnify btn, and input)
    const clone = card.cloneNode(true);
    // Remove elements we don't want in the magnified view
    clone.querySelectorAll('.hint-btn, .hint-popup, .ws-magnify-btn, .ws-tts-btn, .worksheet-input, .question-number').forEach(el => el.remove());

    const overlay = document.createElement('div');
    overlay.className = 'ws-magnify-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const content = document.createElement('div');
    content.className = 'ws-magnify-content';
    content.innerHTML = `<button class="ws-magnify-close" onclick="this.closest('.ws-magnify-overlay').remove()">&times;</button>`;
    content.appendChild(clone);

    // Reset the clone's card styling so it renders at full size
    clone.style.cssText = 'overflow:visible;max-width:none;box-shadow:none;padding:10px;';
    clone.classList.remove('problem-card');

    overlay.appendChild(content);
    document.body.appendChild(overlay);

    // Close on Escape key
    const onKey = (e) => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
}

// Attach click-to-zoom behavior to a worksheet problem card's visual area.
// Mirrors the single-question MAP zoom: clicking a non-interactive visual
// opens the shared zoom modal at ~2× size. Skips skills whose answerType
// uses clicks for answering (those rely on the magnifier-icon flow). Inputs
// and buttons inside the visual remain clickable — only "background" clicks
// on the visual itself trigger zoom.
export function attachWorksheetZoom(cardEl, problem) {
    if (!cardEl || !problem) return;
    // Skip click-is-answer types — their clicks ARE the answer mechanism.
    if (problem.answerType && ZOOM_CLICK_IS_ANSWER_TYPES.includes(problem.answerType)) return;

    const visual = cardEl.querySelector('.ws-card-visual');
    if (!visual) return;
    if (!visual.innerHTML || !visual.innerHTML.trim()) return;

    // Avoid double-attaching if the card is re-rendered.
    if (visual.dataset.zoomAttached === '1') return;
    visual.dataset.zoomAttached = '1';

    visual.classList.add('zoom-trigger');
    visual.addEventListener('click', (e) => {
        // Don't hijack clicks on form controls, buttons, links, or anything
        // explicitly marked interactive (T-chart drag, divisibility sort,
        // area-model inputs, etc.).
        const t = e.target;
        if (t && t.closest && t.closest(
            'input, button, select, textarea, a, [contenteditable="true"], ' +
            '.ws-magnify-btn, .hint-btn, .ws-tts-btn, .hint-popup, ' +
            '.tchart-cell, .div-sort-number, .div-sort-box, .draggable, .drop-zone'
        )) return;
        // Build clean clone HTML — strip helper buttons that shouldn't appear
        // in the zoom modal.
        const clone = visual.cloneNode(true);
        clone.querySelectorAll('.ws-magnify-btn, .hint-btn, .ws-tts-btn, .hint-popup, .zoom-icon-btn').forEach(el => el.remove());
        const html = clone.innerHTML;
        if (html && html.trim()) openZoomModal(html, visual);
    });
}

// Escape HTML so option labels containing markup render as text in attributes.
function _wsEscAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Normalize the shape of q.options. Generators emit either a string array
// (`['Acute','Right','Obtuse']`) or an object array (`[{label, correct}]`).
// Returns an array of `{label, correct}` where label is a display string.
function _wsNormalizeOptions(options, correctAns) {
    if (!Array.isArray(options)) return [];
    const correctNorm = correctAns != null ? normalizeText(correctAns) : null;
    return options.map(o => {
        if (o && typeof o === 'object') {
            const label = (o.label != null ? o.label : o.text != null ? o.text : o.value != null ? o.value : '');
            const isCorrect = (typeof o.correct === 'boolean')
                ? o.correct
                : (correctNorm != null && normalizeText(label) === correctNorm);
            return { label: String(label), correct: isCorrect };
        }
        const label = String(o);
        const isCorrect = correctNorm != null && normalizeText(label) === correctNorm;
        return { label, correct: isCorrect };
    });
}

// Build the HTML block for a multiple-choice / choice problem in worksheet mode.
// The click handler is wired inline via `onclick` so it works for both
// initial render and the addMoreProblems path without extra delegation.
function renderWorksheetMC(q, idx) {
    const opts = _wsNormalizeOptions(q.options, q.ans);
    const text = q.text || '';
    const buttons = opts.map(o => {
        const safeLabel = _wsEscAttr(o.label);
        return `<button type="button" class="ws-mc-option" data-label="${safeLabel}" onclick="checkWorksheetMC(${idx}, this)">${o.label}</button>`;
    }).join('');
    return `
        <div class="question-line">${text}</div>
        <div class="ws-mc-options" data-problem-idx="${idx}" role="group" aria-label="Answer choices">
            ${buttons}
        </div>
    `;
}

// Click handler for worksheet multiple-choice options. First click locks the
// answer for that problem and grades it; subsequent clicks are ignored.
export function checkWorksheetMC(idx, btnEl) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    if (!q || !card || !btnEl) return;

    const optsWrap = btnEl.closest('.ws-mc-options');
    if (!optsWrap) return;

    // Already graded? Ignore further clicks.
    if (optsWrap.dataset.graded === '1') return;

    const allButtons = Array.from(optsWrap.querySelectorAll('.ws-mc-option'));
    const chosenLabel = btnEl.dataset.label || btnEl.textContent || '';

    // Determine correctness: prefer normalized text match against q.ans;
    // fall back to {label, correct} object shape if present.
    const opts = _wsNormalizeOptions(q.options, q.ans);
    const matched = opts.find(o => normalizeText(o.label) === normalizeText(chosenLabel));
    const isCorrect = !!(matched && matched.correct);

    optsWrap.dataset.graded = '1';

    // Style the chosen button.
    btnEl.classList.add('selected');
    btnEl.classList.add(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
        // Disable everything once correct.
        allButtons.forEach(b => { b.disabled = true; });
        card.style.background = "linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))";
        card.style.border = "3px solid var(--correct)";
        card.style.boxShadow = "0 6px 20px rgba(6,214,160,0.3)";
        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            if (typeof confetti === 'function') confetti(15);
            else if (typeof window !== 'undefined' && window.confetti) window.confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // Wrong: highlight the correct one, disable everything.
        const correctBtn = allButtons.find(b => {
            const lbl = b.dataset.label || b.textContent || '';
            const m = opts.find(o => normalizeText(o.label) === normalizeText(lbl));
            return m && m.correct;
        });
        if (correctBtn) correctBtn.classList.add('correct-answer');
        allButtons.forEach(b => { b.disabled = true; });
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        wsRecordAnswer(idx, false);
    }
}

// Per-card score state for multi-select-check worksheet cards. Keyed by
// problem idx → { submitted: bool, isCorrect: bool, selectedIds: string[] }.
// Lives at module scope so checkAllWorksheet can read the most recent verdict.
const worksheetMscState = new Map();

// Mount the multi-select-check widget into a worksheet card's host element.
// IMPORTANT: the widget exposes a single module-level `onMultiSelectSubmit`
// slot — the LAST `setOnMultiSelectSubmit` call wins. Across N mounted cards,
// only the most recently bound callback fires for ANY card's submit click.
// To make per-card binding work, we install a SHARED dispatcher once and
// recover the actual idx at click-time by matching `qq` (the question object
// the widget passes back) against `state.worksheetQs`. This is reliable
// because each problem holds a unique question reference.
let _wsMscDispatcherInstalled = false;
function mountWorksheetMsc(q, idx, host) {
    if (!host || !q) return;
    import('./widgets/multi-select-check.js').then(mod => {
        if (!_wsMscDispatcherInstalled) {
            mod.setOnMultiSelectSubmit((qq, selectedIds) => {
                // Recover idx by reference-matching qq against state.worksheetQs.
                let targetIdx = -1;
                if (Array.isArray(state.worksheetQs)) {
                    for (let k = 0; k < state.worksheetQs.length; k++) {
                        if (state.worksheetQs[k] === qq) { targetIdx = k; break; }
                    }
                }
                if (targetIdx < 0) return;
                handleWorksheetMscSubmit(targetIdx, qq, selectedIds, mod);
            });
            _wsMscDispatcherInstalled = true;
        }
        host.dataset.mscIdx = String(idx);
        mod.renderMultiSelectCheck(q, host);
    }).catch(err => console.error('Failed to load multi-select-check widget for worksheet:', err));
}

// Submit-callback adapter. Updates the per-card score state, paints option
// feedback (correct = green flash, wrong/missed = red flash), styles the card
// background, and records the answer in the banner stats (once per card).
function handleWorksheetMscSubmit(idx, qq, selectedIds, mod) {
    const card = document.getElementById(`ws_card_${idx}`);
    const host = document.getElementById(`wsMscHost_${idx}`);
    if (!card || !host) return;
    const correct = mod.checkMultiSelectCheck(qq, selectedIds);
    worksheetMscState.set(idx, { submitted: true, isCorrect: !!correct, selectedIds: Array.isArray(selectedIds) ? selectedIds.slice() : [] });

    // Per-option visual feedback (green/red borders via flash classes).
    const correctSet = new Set(qq.ans || []);
    const selectedSet = new Set(selectedIds || []);
    host.querySelectorAll('.msc-opt').forEach(el => {
        const id = el.dataset.id;
        const sel = selectedSet.has(id);
        const isAnswer = correctSet.has(id);
        if (sel && isAnswer) el.classList.add('correct-flash');
        else if (sel && !isAnswer) el.classList.add('wrong-flash');
        else if (!sel && isAnswer) el.classList.add('wrong-flash');
    });

    // Inline feedback line under the widget.
    let fb = host.querySelector('.ws-msc-feedback');
    if (!fb) {
        fb = document.createElement('div');
        fb.className = 'ws-msc-feedback';
        host.appendChild(fb);
    }
    fb.style.cssText = 'margin-top:8px;font-weight:600;text-align:center;';
    fb.style.color = correct ? 'var(--correct)' : 'var(--incorrect)';
    fb.textContent = correct ? 'Correct!' : 'Not quite — selected items are highlighted.';

    // Card-level styling.
    if (correct) {
        card.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))';
        card.style.border = '3px solid var(--correct)';
        card.style.boxShadow = '0 6px 20px rgba(6,214,160,0.3)';
        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            if (typeof confetti === 'function') confetti(15);
            else if (typeof window !== 'undefined' && window.confetti) window.confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 600);
        }
    } else {
        card.style.background = 'rgba(239,71,111,0.08)';
        card.style.border = '2px solid var(--incorrect)';
        card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
        wsRecordAnswer(idx, false);
    }
}

// Per-card score state for clock-set worksheet cards. Keyed by problem idx →
// { submitted: bool, isCorrect: bool, time: { hour, minute } }. Lives at module
// scope so checkAllWorksheet can read the most recent verdict.
const worksheetClockSetState = new Map();

// Mount the clock-set widget into a worksheet card's host element.
// IMPORTANT: the widget exposes a single module-level `onClockSetSubmit` slot —
// the LAST `setOnClockSetSubmit` call wins. Across N mounted cards, only the
// most recently bound callback fires for ANY card's submit click. To make
// per-card binding work, we install a SHARED dispatcher once and recover the
// actual idx at click-time by matching `qq` (the question object the widget
// passes back) against `state.worksheetQs`. This is reliable because each
// problem holds a unique question reference.
let _wsCsDispatcherInstalled = false;
function mountWorksheetClockSet(q, idx, host) {
    if (!host || !q) return;
    import('./widgets/clock-set.js').then(mod => {
        if (!_wsCsDispatcherInstalled) {
            mod.setOnClockSetSubmit((qq, timeObj) => {
                // Recover idx by reference-matching qq against state.worksheetQs.
                let targetIdx = -1;
                if (Array.isArray(state.worksheetQs)) {
                    for (let k = 0; k < state.worksheetQs.length; k++) {
                        if (state.worksheetQs[k] === qq) { targetIdx = k; break; }
                    }
                }
                if (targetIdx < 0) return;
                handleWorksheetClockSetSubmit(targetIdx, qq, timeObj, mod);
            });
            _wsCsDispatcherInstalled = true;
        }
        host.dataset.csIdx = String(idx);
        mod.renderClockSet(q, host);
    }).catch(err => console.error('Failed to load clock-set widget for worksheet:', err));
}

// Submit-callback adapter. Updates the per-card score state, paints feedback
// on the clock face (green flash / red flash), styles the card background,
// and records the answer in the banner stats (once per card).
function handleWorksheetClockSetSubmit(idx, qq, timeObj, mod) {
    const card = document.getElementById(`ws_card_${idx}`);
    const host = document.getElementById(`wsCsHost_${idx}`);
    if (!card || !host) return;
    const correct = mod.checkClockSet(qq, timeObj);
    worksheetClockSetState.set(idx, {
        submitted: true,
        isCorrect: !!correct,
        time: timeObj && typeof timeObj === 'object' ? { hour: timeObj.hour, minute: timeObj.minute } : null,
    });

    // Flash the clock face (green/red).
    const csHost = host.querySelector('.cs-host');
    if (csHost && typeof csHost._csFlash === 'function') {
        csHost._csFlash(!!correct);
    }

    // Inline feedback line under the widget.
    let fb = host.querySelector('.ws-cs-feedback');
    if (!fb) {
        fb = document.createElement('div');
        fb.className = 'ws-cs-feedback';
        host.appendChild(fb);
    }
    fb.style.cssText = 'margin-top:8px;font-weight:600;text-align:center;';
    fb.style.color = correct ? 'var(--correct)' : 'var(--incorrect)';
    if (correct) {
        fb.textContent = 'Correct!';
    } else {
        const want = qq.ans || { hour: 0, minute: 0 };
        const dh = ((want.hour % 12) + 12) % 12;
        const display = (dh === 0 ? 12 : dh) + ':' + String(want.minute).padStart(2, '0');
        fb.textContent = `Not quite — the correct time is ${display}.`;
    }

    // Card-level styling.
    if (correct) {
        card.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))';
        card.style.border = '3px solid var(--correct)';
        card.style.boxShadow = '0 6px 20px rgba(6,214,160,0.3)';
        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            if (typeof confetti === 'function') confetti(15);
            else if (typeof window !== 'undefined' && window.confetti) window.confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 600);
        }
    } else {
        card.style.background = 'rgba(239,71,111,0.08)';
        card.style.border = '2px solid var(--incorrect)';
        card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
        wsRecordAnswer(idx, false);
    }
}

// Per-card score state for dnd-generic (drag-and-drop categorize/order)
// worksheet cards. Keyed by problem idx →
//   { submitted: bool, isCorrect: bool, placement: object|array }.
// Lives at module scope so checkAllWorksheet can read the most recent verdict.
const worksheetDndState = new Map();

// Resolve a `qq` reference (passed by the dnd widget) back to its worksheet
// idx via reference equality against `state.worksheetQs`. Mirrors the
// multi-select-check / clock-set patterns: the widget exposes a single
// module-level onDndSubmit slot, so we install a SHARED dispatcher and
// disambiguate at click-time. Returns -1 if no match.
function _wsDndPickIdx(qq) {
    if (!Array.isArray(state.worksheetQs)) return -1;
    for (let k = 0; k < state.worksheetQs.length; k++) {
        if (state.worksheetQs[k] === qq) return k;
    }
    return -1;
}

// Mount the dnd-generic widget into a worksheet card's host. Same shared-
// dispatcher pattern as multi-select-check / clock-set (see above).
let _wsDndDispatcherInstalled = false;
function mountWorksheetDnd(q, idx, host) {
    if (!host || !q) return;
    import('./widgets/dnd-generic.js').then(mod => {
        if (!_wsDndDispatcherInstalled) {
            mod.setOnDndSubmit((qq, placement) => {
                const targetIdx = _wsDndPickIdx(qq);
                if (targetIdx < 0) return;
                handleWorksheetDndSubmit(targetIdx, qq, placement, mod);
            });
            _wsDndDispatcherInstalled = true;
        }
        host.dataset.dndIdx = String(idx);
        mod.renderDndGeneric(q, host);
    }).catch(err => console.error('Failed to load dnd-generic widget for worksheet:', err));
}

// Submit-callback adapter for dnd-generic. Stores the per-card verdict and
// paints feedback (green/red highlights on tiles, inline message, card frame).
function handleWorksheetDndSubmit(idx, qq, placement, mod) {
    const card = document.getElementById(`ws_card_${idx}`);
    const host = document.getElementById(`wsDndHost_${idx}`);
    if (!card || !host) return;
    const correct = mod.checkDndGeneric(qq, placement);
    let placementCopy;
    if (Array.isArray(placement)) placementCopy = placement.slice();
    else if (placement && typeof placement === 'object') placementCopy = Object.assign({}, placement);
    else placementCopy = placement;
    worksheetDndState.set(idx, { submitted: true, isCorrect: !!correct, placement: placementCopy });

    // Per-tile visual feedback.
    if (qq.dndMode === 'categorize' && qq.ans && typeof qq.ans === 'object' && placement && typeof placement === 'object') {
        host.querySelectorAll('.dnd-tile').forEach(tileEl => {
            const tid = tileEl.dataset.id;
            const placedIn = placement[tid];
            const expectedIn = qq.ans[tid];
            tileEl.classList.remove('correct-flash', 'wrong-flash');
            if (placedIn && expectedIn && placedIn === expectedIn) tileEl.classList.add('correct-flash');
            else if (placedIn && expectedIn && placedIn !== expectedIn) tileEl.classList.add('wrong-flash');
        });
    } else if (Array.isArray(qq.ans) && Array.isArray(placement)) {
        // Order mode: highlight slots whose contents match the expected sequence.
        host.querySelectorAll('.dnd-slot').forEach(slotEl => {
            const slotIdx = parseInt(slotEl.dataset.slot, 10);
            const tile = slotEl.querySelector('.dnd-tile');
            if (!tile || isNaN(slotIdx)) return;
            const ok = tile.dataset.id === qq.ans[slotIdx];
            tile.classList.remove('correct-flash', 'wrong-flash');
            tile.classList.add(ok ? 'correct-flash' : 'wrong-flash');
        });
    }

    // Inline feedback under the widget.
    let fb = host.querySelector('.ws-dnd-feedback');
    if (!fb) {
        fb = document.createElement('div');
        fb.className = 'ws-dnd-feedback';
        host.appendChild(fb);
    }
    fb.style.cssText = 'margin-top:8px;font-weight:600;text-align:center;';
    fb.style.color = correct ? 'var(--correct)' : 'var(--incorrect)';
    fb.textContent = correct ? 'Correct!' : 'Not quite — placements are highlighted.';

    if (correct) {
        card.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))';
        card.style.border = '3px solid var(--correct)';
        card.style.boxShadow = '0 6px 20px rgba(6,214,160,0.3)';
        wsRecordAnswer(idx, true);
        // Worksheet items are one-shot per card — explicitly lock the widget
        // since the dnd-generic widget no longer self-locks on submit.
        if (host._dndLock) host._dndLock();
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            if (typeof confetti === 'function') confetti(15);
            else if (typeof window !== 'undefined' && window.confetti) window.confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 600);
        }
    } else {
        card.style.background = 'rgba(239,71,111,0.08)';
        card.style.border = '2px solid var(--incorrect)';
        card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
        wsRecordAnswer(idx, false);
        // Worksheet is batch-graded — pin the verdict by locking the widget.
        if (host._dndLock) host._dndLock();
    }
}

// Reveal the correct dnd grouping for an ungraded card during checkAll.
// Snaps each tile into its expected bin (or slot in order mode), disables
// submit + drag handles, and flashes the correct positions green.
function _wsDndReveal(q, host) {
    if (!host || !q) return;
    const submit = host.querySelector('.dnd-submit');
    if (submit) submit.disabled = true;
    host.querySelectorAll('.dnd-tile, .dnd-slot, .dnd-bin').forEach(el => {
        el.setAttribute('draggable', 'false');
        if (el.tagName === 'BUTTON') el.disabled = true;
    });
    if (q.dndMode === 'categorize' && q.ans && typeof q.ans === 'object') {
        host.querySelectorAll('.dnd-tile').forEach(tileEl => {
            const tid = tileEl.dataset.id;
            const expectedBin = q.ans[tid];
            if (!expectedBin) return;
            const binEl = host.querySelector(`.dnd-bin[data-bin="${CSS.escape(expectedBin)}"]`);
            if (!binEl) return;
            const dropArea = binEl.querySelector('.dnd-bin-tiles') || binEl;
            tileEl.classList.remove('wrong-flash');
            tileEl.classList.add('correct-flash');
            dropArea.appendChild(tileEl);
        });
    } else if (Array.isArray(q.ans)) {
        const slots = host.querySelectorAll('.dnd-slot');
        q.ans.forEach((tid, sidx) => {
            const slot = slots[sidx];
            const tileEl = host.querySelector(`.dnd-tile[data-id="${CSS.escape(tid)}"]`);
            if (slot && tileEl) {
                slot.appendChild(tileEl);
                tileEl.classList.remove('wrong-flash');
                tileEl.classList.add('correct-flash');
                slot.classList.add('filled');
            }
        });
    }
}

// Per-card score state for drag-fill worksheet cards. Keyed by problem
// idx → { submitted: bool, isCorrect: bool, slotState: { slotId: value } }.
// Lives at module scope so checkAllWorksheet can read the latest verdict.
const worksheetDragFillState = new Map();

// Mount the drag-fill widget into a worksheet card's host element.
// The widget exposes a single module-level `onDragFillSubmit` slot — the
// LAST `setOnDragFillSubmit` call wins. Across N mounted cards, we install
// a SHARED dispatcher once and recover the actual idx at submit-time by
// matching `qq` (the question reference the widget passes back) against
// `state.worksheetQs`.
let _wsDfDispatcherInstalled = false;
function mountWorksheetDragFill(q, idx, host) {
    if (!host || !q) return;
    import('./widgets/drag-fill.js').then(mod => {
        if (!_wsDfDispatcherInstalled) {
            mod.setOnDragFillSubmit((qq, slotState) => {
                let targetIdx = -1;
                if (Array.isArray(state.worksheetQs)) {
                    for (let k = 0; k < state.worksheetQs.length; k++) {
                        if (state.worksheetQs[k] === qq) { targetIdx = k; break; }
                    }
                }
                if (targetIdx < 0) return;
                handleWorksheetDragFillSubmit(targetIdx, qq, slotState, mod);
            });
            _wsDfDispatcherInstalled = true;
        }
        host.dataset.dfIdx = String(idx);
        mod.renderDragFill(q, host);
    }).catch(err => console.error('Failed to load drag-fill widget for worksheet:', err));
}

// Submit-callback adapter. Updates per-card score state, paints feedback on
// the slots/host, styles the card background, and records the answer in the
// banner stats (once per card). Wrong slots are flashed red, correct ones
// green. The widget locks tiles after submit, so further drags are blocked.
function handleWorksheetDragFillSubmit(idx, qq, slotState, mod) {
    const card = document.getElementById(`ws_card_${idx}`);
    const host = document.getElementById(`wsDfHost_${idx}`);
    if (!card || !host) return;
    const correct = mod.checkDragFill(qq, slotState);
    worksheetDragFillState.set(idx, {
        submitted: true,
        isCorrect: !!correct,
        slotState: (slotState && typeof slotState === 'object') ? Object.assign({}, slotState) : {}
    });

    // Per-slot visual feedback (green/red flash).
    const ansMap = (qq && qq.ans && typeof qq.ans === 'object') ? qq.ans : {};
    host.querySelectorAll('.df-slot').forEach(el => {
        const id = el.dataset.slotId;
        const expected = ansMap[id];
        const actual = el.dataset.value;
        let slotOk = String(expected) === String(actual);
        if (!slotOk && Array.isArray(qq.slots)) {
            const slotDef = qq.slots.find(s => s && s.id === id);
            if (slotDef && Array.isArray(slotDef.acceptedValues)) {
                slotOk = slotDef.acceptedValues.map(v => String(v)).includes(String(actual));
            }
        }
        el.classList.remove('correct-flash', 'wrong-flash');
        if (slotOk) el.classList.add('correct-flash');
        else el.classList.add('wrong-flash');
    });

    // Inline feedback line.
    let fb = host.querySelector('.ws-df-feedback');
    if (!fb) {
        fb = document.createElement('div');
        fb.className = 'ws-df-feedback';
        host.appendChild(fb);
    }
    fb.style.cssText = 'margin-top:8px;font-weight:600;text-align:center;';
    fb.style.color = correct ? 'var(--correct)' : 'var(--incorrect)';
    fb.textContent = correct ? 'Correct!' : 'Not quite — incorrect slots are highlighted.';

    // Card-level styling.
    if (correct) {
        card.style.background = 'linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))';
        card.style.border = '3px solid var(--correct)';
        card.style.boxShadow = '0 6px 20px rgba(6,214,160,0.3)';
        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            if (typeof confetti === 'function') confetti(15);
            else if (typeof window !== 'undefined' && window.confetti) window.confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 600);
        }
    } else {
        card.style.background = 'rgba(239,71,111,0.08)';
        card.style.border = '2px solid var(--incorrect)';
        card.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
        wsRecordAnswer(idx, false);
    }
}

// Reveal the correct slot fills for an ungraded drag-fill card during
// checkAll. Writes each expected value into its slot using the same DOM
// shape the widget uses (dataset.value + textContent + filled style class),
// then locks the submit button and disables tiles.
function _wsDfReveal(q, host) {
    if (!host || !q) return;
    const submit = host.querySelector('.df-submit');
    if (submit) submit.disabled = true;
    host.querySelectorAll('.df-tile').forEach(t => {
        t.setAttribute('draggable', 'false');
        t.disabled = true;
    });
    const ansMap = (q.ans && typeof q.ans === 'object') ? q.ans : {};
    host.querySelectorAll('.df-slot').forEach(el => {
        const id = el.dataset.slotId;
        const expected = ansMap[id];
        if (expected == null) return;
        // Only fill empty slots; preserve any value the student already placed.
        if (!el.dataset.value) {
            el.dataset.value = String(expected);
            el.textContent = String(expected);
        }
        el.classList.add('correct-flash');
    });
}

export function initWorksheet() {
    showView("worksheetView");
    // Scroll to top so the worksheet starts at the beginning
    window.scrollTo(0, 0);
    const view = document.getElementById("worksheetView");
    if (view) view.scrollTop = 0;
    // Banner timer, session timer, tab detection, and idle detection are now
    // initialized in startGame() before the worksheet path.
    newWorksheet();
}

export function newWorksheet() {
    // Scroll to top when starting a new worksheet
    window.scrollTo(0, 0);
    const view = document.getElementById("worksheetView");
    if (view) view.scrollTop = 0;
    let grid = document.getElementById("worksheetGrid");
    if (grid) grid.scrollTop = 0;

    state.worksheetQs = [];
    worksheetConfettiTriggered.clear(); // Reset confetti tracking
    worksheetBannerRecorded.clear(); // Reset banner stats tracking
    worksheetMscState.clear(); // Reset multi-select-check per-card verdicts
    worksheetClockSetState.clear(); // Reset clock-set per-card verdicts
    worksheetDndState.clear(); // Reset dnd-generic per-card verdicts
    worksheetDragFillState.clear(); // Reset drag-fill per-card verdicts
    // Clear any pending wrong-answer timers
    worksheetWrongTimers.forEach(timer => clearTimeout(timer));
    worksheetWrongTimers.clear();
    state.problemCount = state.problemCount || parseInt(document.getElementById('problemCountSelect')?.value || '20', 10);
    const isUnlimited = state.problemCount === 0;
    // Safety cap: worksheet mode should never generate more than 50 problems at once
    // to prevent browser freeze. For unlimited mode, start with 10 and use "Load More".
    const total = isUnlimited ? 10 : Math.min(state.problemCount, 50);

    console.log(`newWorksheet: problemCount=${state.problemCount}, total=${total}, isUnlimited=${isUnlimited}`);
    console.log(`newWorksheet: category=${state.category}, skill=${state.skill}`);

    grid = document.getElementById("worksheetGrid");
    grid.innerHTML = "";

    // Show/hide unlimited controls
    const unlimitedControls = document.getElementById("worksheetUnlimitedControls");
    if (unlimitedControls) {
        unlimitedControls.style.display = isUnlimited ? "flex" : "none";
    }

    // Generate questions based on the user's selected category and skill
    for (let i = 0; i < total; i++) {
        const q = generateQuestion();
        console.log(`Generated worksheet problem ${i+1}/${total}: ${q?.text?.substring(0, 50)}`);
        // Synthesize a static visual for grid-fill skills (number_seq_fill,
        // count_by_step_*, count_by_powers_of_10) so worksheet mode can show
        // the grid without mounting the live widget.
        if (q && q.answerType === 'grid-fill' && (!q.visual || !String(q.visual).trim())) {
            q.visual = _buildGridFillStaticVisual(q);
        }
        state.worksheetQs.push(q);
        const card = document.createElement("div");
        card.className = "problem-card";
        card.id = `ws_card_${i}`;

        // Check if this is a column/vertical format question (addition, subtraction, multiplication, or long division)
        const isVerticalFormat = q.visual && (
            q.visual.includes('Column Addition') ||
            q.visual.includes('Column Subtraction') ||
            q.visual.includes('Column Multiplication') ||
            q.visual.includes('Long Division')
        );

        // Check for long division specifically (needs extra width)
        const isLongDivision = q.visual && q.visual.includes('Long Division');

        // Check if this is a function table (needs to show the visual table with inputs)
        const isFunctionTable = q.visual && q.visual.includes('Function Table');

        // Check if this is an interactive ordering question
        const isInteractiveOrdering = q.answerType === "interactive" && q.interactiveType === "ordering";

        // Check if this is an interactive expanded form question
        const isInteractiveExpanded = q.answerType === "interactive" && q.interactiveType === "expanded";

        // Check if this is a T-Chart drag-drop question
        const isTchartDrag = q.answerType === "tchart-drag";

        // Check if this is a fraction question
        const isFraction = q.visual && (q.visual.includes('frac{') || q.visual.includes('fraction'));

        // Check if this is a geometry question with visual (contains SVG or geometry keywords)
        const isGeometryWithVisual = q.visual && (
            q.visual.includes('<svg') ||
            q.visual.includes('Perimeter') ||
            q.visual.includes('Area') ||
            q.visual.includes('Volume') ||
            q.visual.includes('📐') ||
            q.visual.includes('Angle') ||
            q.visual.includes('Triangle') ||
            q.visual.includes('Quadrilateral') ||
            q.visual.includes('Symmetry') ||
            q.visual.includes('coordinate') ||
            (q.printFormat && q.printFormat.startsWith('geometry-'))
        );
        
        // Check for divisibility sort
        const isDivisibilitySortEarly = q.answerType === "divisibility-sort";
        
        // Check for number families and fact families
        const isNumberFamily = q.answerType === "number-family" || q.answerType === "fact-family";

        // Check for multiple-choice / choice answer types — render as button grid
        const isMultipleChoice = (q.answerType === "multiple-choice" || q.answerType === "choice")
            && Array.isArray(q.options) && q.options.length > 0;

        // Check for multi-select-check (click-all-that-apply, MAP-style)
        const isMultiSelectCheck = q.answerType === "multi-select-check"
            && Array.isArray(q.options) && q.options.length > 0;

        // Check for clock-set (Phase 6 P1 — interactive analog clock)
        const isClockSet = q.answerType === "clock-set";

        // Check for dnd-generic (drag-and-drop categorize/order, MAP-style)
        const isDndGeneric = q.answerType === "dnd-generic";

        // Check for drag-fill (drag tokens from palette into labeled slots).
        const isDragFill = q.answerType === "drag-fill"
            && Array.isArray(q.slots) && q.slots.length > 0
            && Array.isArray(q.palette) && q.palette.length > 0;

        // Check for facts column visual (read-only vertical format - keeps answer input visible)
        const isFactsColumn = q.visual && q.visual.includes('facts-column-visual');

        // Check for new visual skills where the visual IS the question
        const newVisualSkillFormats = ['arrays-groups', 'mult-properties', 'div-remainders',
            'fraction-of-set', 'equiv-frac-visual', 'area-unit-squares', 'perimeter-grid',
            'reading-ruler', 'money-count', 'line-plot-fractions',
            'tape-diagram', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
            // Grid-fill counting/sequencing skills (number_seq_fill, count_by_step_*, count_by_powers_of_10)
            'grid-fill',
            'rounding-visual', 'place-value-disks', 'pv-disks-build',
            'fraction-of-set-hard', 'reading-ruler-hard',
            'function-table-easy', 'function-table-hard',
            'nl-add', 'nl-sub', 'nl-mult', 'nl-div',
            'fraction-order', 'fraction-numline-order', 'fraction-benchmark',
            'fraction-compare-lcd', 'fraction-round', 'fraction-estimate',
            'write-fraction', 'shade-fraction',
            'percent-grid', 'percent-of', 'percent-find-whole', 'fdp-order', 'decimal-order',
            'multi-select', 'ten-frame', 'dnd-generic', 'drag-fill', 'hot-spot', 'place-symmetry-lines', 'numpad-input',
            'number-line-extended',
            // Phase 6 P1
            'clock-set',
            // Phase 5 batch 1: K-2 MAP early-band
            'add-5-pictures', 'sub-5-pictures', 'heavier-lighter', 'pictograph-intro',
            'tens-foundation', 'bar-graph-intro', 'shape-corners',
            // Phase 5 batch 2: mid-band MAP skills
            'hundreds-chart-fill', 'unknown-start-wp', 'count-efv', 'count-2d-attrs', 'coord-distance',
            // Phase 5 batch 3: mid-to-high band MAP skills
            'perimeter-intro', 'unit-conversion-word', 'box-plot-intro', 'histogram-read',
            'ratio-intro', 'unit-rate-intro', 'double-num-line',
            // Phase 5 batch 4: geometry-heavy MAP skills
            'area-distributive', 'area-triangle', 'area-polygon-decompose',
            'coord-polygon', 'net-surface-area',
            // Shape name match (drag names onto 2D / 3D shape figures)
            'shape-name-match',
            // Coord-input (X/Y boxes with parens+comma)
            'coord-input',
            // Box method division (per-digit guided long division)
            'box-division',
            // factors_identify fill-in-the-blanks (vertical pair list)
            'factor-pairs'];
        const isNewVisualSkill = q.visual && q.printFormat && newVisualSkillFormats.includes(q.printFormat);

        // Check for data/stats with visuals
        const isDataStatsWithVisualEarly = q.visual && (
            q.dataData ||
            q.visual.includes('📊') ||
            q.visual.includes('🎲') ||
            (q.printFormat && q.printFormat.startsWith('data-'))
        );

        // Wide visual formats that need full-width cards on worksheet grid
        const wideVisualFormats = ['tape-diagram', 'line-plot-fractions', 'area-unit-squares',
            'perimeter-grid', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
            // Grid-fill counting/sequencing skills are full-width
            'grid-fill',
            'fraction-numline-order', 'dnd-generic', 'pv-disks-build', 'hot-spot', 'number-line-extended',
            // Phase 5 batch 1
            'bar-graph-intro',
            // Phase 5 batch 2: wide visual cards (coord grid is wide)
            'coord-distance',
            // Phase 5 batch 3: wide visual cards (plots, double number line)
            'box-plot-intro', 'histogram-read', 'double-num-line',
            // Phase 5 batch 4: wide visual cards (decompose grid, coord polygon, nets)
            'area-polygon-decompose', 'coord-polygon', 'net-surface-area',
            // Shape name match — table of shapes is full-row width
            'shape-name-match',
            // Coord-input is a full-width SVG grid card
            'coord-input',
            // Box method division is wide (multiple boxes side-by-side)
            'box-division'];
        const isWideVisual = isNewVisualSkill && wideVisualFormats.includes(q.printFormat);
        const isMediumVisual = isNewVisualSkill && !isWideVisual;

        // Add appropriate card size class based on problem type
        if (isLongDivision) {
            card.classList.add('card-division');
        } else if (isVerticalFormat) {
            card.classList.add('card-column');
        } else if (isFunctionTable) {
            card.classList.add('card-table');
        } else if (isInteractiveOrdering) {
            card.classList.add('card-ordering');
        } else if (isTchartDrag) {
            card.classList.add('card-tchart');
        } else if (isDndGeneric) {
            card.classList.add('card-dnd');
        } else if (isMultiSelectCheck) {
            card.classList.add('card-msc');
        } else if (isClockSet) {
            card.classList.add('card-cs');
        } else if (isDragFill) {
            card.classList.add('card-df');
        } else if (isDivisibilitySortEarly) {
            card.classList.add('card-divisibility');
        } else if (isNumberFamily) {
            card.classList.add('card-number-family');
        } else if (isDataStatsWithVisualEarly) {
            card.classList.add('card-data-stats');
        } else if (isWideVisual) {
            card.classList.add('card-wide-visual');
        } else if (isMediumVisual) {
            card.classList.add('card-medium-visual');
        } else if (isFraction) {
            card.classList.add('card-fraction');
        } else if (isGeometryWithVisual) {
            card.classList.add('card-geometry');
        } else {
            card.classList.add('card-simple');
        }

        // Mark the question types for validation
        q.isVerticalFormat = isVerticalFormat;
        q.isFunctionTable = isFunctionTable;
        q.isInteractiveOrdering = isInteractiveOrdering;
        q.isInteractiveExpanded = isInteractiveExpanded;
        q.isTchartDrag = isTchartDrag;
        q.isGeometryWithVisual = isGeometryWithVisual;
        q.isMultipleChoice = isMultipleChoice;
        q.isMultiSelectCheck = isMultiSelectCheck;
        q.isClockSet = isClockSet;
        q.isDragFill = isDragFill;
        q.isDndGeneric = isDndGeneric;

        // Check for dual-answer (perimeter+area) questions
        const isDualAnswer = q.answerType === "dual";

        // Check for coordinate multi-answer questions
        const isCoordinateMulti = q.answerType === "coordinate-multi";
        // Check for coord-input (new X/Y boxes with parens+comma)
        const isCoordInput = q.answerType === "coord-input";

        // Check for divisibility sorting questions
        const isDivisibilitySort = q.answerType === "divisibility-sort";

        // Check for data/stats questions with visuals
        const isDataStatsWithVisual = q.visual && (
            q.dataData ||
            q.visual.includes('📊') ||
            q.visual.includes('🎲') ||
            q.visual.includes('<svg') ||
            q.printFormat?.startsWith('data-')
        );

        // Show visual for vertical formats and function tables, otherwise show text
        let questionDisplay;
        if (isVerticalFormat) {
            questionDisplay = q.visual;
        } else if (isFunctionTable) {
            questionDisplay = q.visual; // Show the IN/OUT table with input fields
        } else if (isInteractiveOrdering) {
            questionDisplay = renderWorksheetOrdering(q, i);
        } else if (isInteractiveExpanded) {
            questionDisplay = renderWorksheetExpanded(q, i);
        } else if (isTchartDrag) {
            questionDisplay = q.visual; // Show the interactive T-Chart
        } else if (isDualAnswer) {
            // For dual-answer, modify IDs to be unique per problem
            let modifiedVisual = q.visual
                .replace(/id="perimeterInput"/g, `id="ws_perimeter_${i}"`)
                .replace(/id="areaInput"/g, `id="ws_area_${i}"`);
            questionDisplay = `${modifiedVisual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isCoordInput) {
            // For coord-input, rewrite ciX_/ciY_ IDs to be unique per problem; remove in-visual submit button
            let modifiedVisual = q.visual;
            const points = (q.coordinateData && q.coordinateData.points) || [];
            points.forEach((p, idx) => {
                modifiedVisual = modifiedVisual
                    .replace(new RegExp(`id="ciX_${idx}"`, 'g'), `id="ws_ciX_${i}_${idx}"`)
                    .replace(new RegExp(`id="ciY_${idx}"`, 'g'), `id="ws_ciY_${i}_${idx}"`);
            });
            // Strip the per-question Check button (worksheet uses a global submit)
            modifiedVisual = modifiedVisual.replace(/<button[^>]*id="ciSubmitBtn"[^>]*>.*?<\/button>/g, '');
            questionDisplay = `<div class="question-line" style="margin-bottom:10px;">${q.text}</div>${modifiedVisual}`;
        } else if (isCoordinateMulti) {
            // For coordinate questions, modify IDs to be unique per problem
            let modifiedVisual = q.visual;
            if (q.coordinateData && q.coordinateData.points) {
                q.coordinateData.points.forEach((p, idx) => {
                    modifiedVisual = modifiedVisual.replace(
                        new RegExp(`id="coordInput_${idx}"`, 'g'),
                        `id="ws_coord_${i}_${idx}"`
                    );
                });
            }
            questionDisplay = `${modifiedVisual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isDivisibilitySort) {
            // For divisibility sorting, modify IDs to be unique per problem
            let modifiedVisual = q.visual
                .replace(/id="divSortNumbers"/g, `id="ws_divSortNumbers_${i}"`)
                .replace(/id="divSortYes"/g, `id="ws_divSortYes_${i}"`)
                .replace(/id="divSortNo"/g, `id="ws_divSortNo_${i}"`);
            questionDisplay = modifiedVisual;
        } else if (isNumberFamily) {
            // For number families, modify input IDs to be unique per problem
            let modifiedVisual = q.visual
                .replace(/class="number-family-input"/g, `class="number-family-input ws-number-family-input"`)
                .replace(/class="fact-family-input"/g, `class="fact-family-input ws-fact-family-input"`)
                .replace(/onclick="checkNumberFamily\(\)"/g, `onclick="checkWorksheetNumberFamily(${i})"`)
                .replace(/<div id="numberFamilyFeedback"/g, `<div id="ws_numberFamilyFeedback_${i}"`);
            // Add data-problem-index to all inputs
            modifiedVisual = modifiedVisual.replace(/data-eq="(\d+)"/g, `data-problem="${i}" data-eq="$1"`);
            questionDisplay = modifiedVisual;
        } else if (isMultipleChoice) {
            // Render answer options as a clickable button grid.
            // Show the visual (if any) above the question text + buttons.
            const visualHtml = (q.visual && !q.visual.includes(q.text || '__no_match__'))
                ? `<div class="ws-mc-visual">${q.visual}</div>`
                : '';
            questionDisplay = `${visualHtml}${renderWorksheetMC(q, i)}`;
        } else if (isMultiSelectCheck) {
            // Render the multi-select-check widget into a per-card host.
            // Show the question's visual (if any) above the widget, plus the
            // question text. The widget itself is mounted after the card is
            // appended to the DOM (see post-append loop below).
            const visualHtml = (q.visual && !q.visual.includes(q.text || '__no_match__'))
                ? `<div class="ws-msc-visual">${q.visual}</div>`
                : '';
            const textHtml = q.text ? `<div class="question-line">${q.text}</div>` : '';
            questionDisplay = `${visualHtml}${textHtml}<div class="ws-msc-host" id="wsMscHost_${i}" data-msc-idx="${i}"></div>`;
        } else if (isClockSet) {
            // Render the clock-set widget into a per-card host. The widget is
            // mounted after the card is appended to the DOM (see post-append
            // loop below). Show question text above the clock.
            const textHtml = q.text ? `<div class="question-line">${q.text}</div>` : '';
            questionDisplay = `${textHtml}<div class="ws-cs-host" id="wsCsHost_${i}" data-cs-idx="${i}"></div>`;
        } else if (isDndGeneric) {
            // Render the dnd-generic widget (categorize/order) into a per-card
            // host. The widget owns its own prompt/tiles/bins; we mount after
            // the card is appended to the DOM (see post-append loop below).
            questionDisplay = `<div class="ws-dnd-host" id="wsDndHost_${i}" data-dnd-idx="${i}"></div>`;
        } else if (isDragFill) {
            // Render the drag-fill widget into a per-card host. The widget
            // ships its own prompt + slots + palette + Check button, so we
            // only show q.visual (if any) above the host. The widget mounts
            // after the card is appended (see post-append loop below).
            const visualHtml = (q.visual && !q.visual.includes(q.text || '__no_match__'))
                ? `<div class="ws-df-visual">${q.visual}</div>`
                : '';
            questionDisplay = `${visualHtml}<div class="ws-df-host" id="wsDfHost_${i}" data-df-idx="${i}"></div>`;
        } else if (isFactsColumn) {
            // Show vertical visual for facts - answer input stays visible
            questionDisplay = q.visual;
        } else if (isNewVisualSkill) {
            // Show both visual and text for new visual skills
            questionDisplay = `${q.visual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isDataStatsWithVisual) {
            // Show both the visual AND text for data/stats questions
            questionDisplay = `${q.visual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isGeometryWithVisual) {
            // Show both the visual AND text for geometry questions
            questionDisplay = `${q.visual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else {
            questionDisplay = `<div class="question-line">${q.text}</div>`;
        }

        // For vertical format, function tables, interactive types, dual answer, coordinate types, and number families - hide the main answer input
        const answerInputStyle = (isVerticalFormat || isFunctionTable || isInteractiveOrdering || isInteractiveExpanded || isTchartDrag || isDualAnswer || isCoordinateMulti || isCoordInput || isDivisibilitySort || isNumberFamily || isMultipleChoice || isMultiSelectCheck || isClockSet || isDndGeneric || isDragFill) ? 'style="display:none;"' : '';

        // Generate hint content with visual if available
        const hintVisual = q.hintVisual ? `<div class="hint-visual">${q.hintVisual}</div>` : '';
        const baseHint = q.hint || 'Think about this problem step by step.';
        const opHint = _wsOpHint(q);
        const hintText = opHint
            ? `${opHint}<div style="margin-top:6px;">${baseHint}</div>`
            : baseHint;

        // Determine if this card has visual content that may need magnification
        const hasVisualContent = !!(q.visual && (
            q.visual.includes('<svg') ||
            q.visual.includes('frac-bar') ||
            q.visual.includes('fraction') ||
            isNewVisualSkill ||
            isGeometryWithVisual ||
            isDataStatsWithVisualEarly ||
            isFraction
        ));

        const magnifyBtn = hasVisualContent
            ? `<button class="ws-magnify-btn" onclick="wsMagnifyCard(${i})" title="Tap to zoom">&#128269;</button>`
            : '';

        // Per-card Skip: grays out the card, marks q._skipped = true,
        // excluded from total in checkAllWorksheet. Universal across all
        // worksheet skills, all answer types.
        const skipBtnHtml = `<button class="ws-skip-btn" type="button" onclick="wsSkipCard(${i})" title="Skip this problem (no penalty)">⏭ Skip</button>`;

        card.innerHTML = `
            ${magnifyBtn}
            ${skipBtnHtml}
            <button class="ws-tts-btn" onclick="wsSpeak(${i})" title="Read problem aloud">&#x1F50A;</button>
            <div class="hint-popup" id="hint_popup_${i}">
                <button class="hint-close" onclick="closeHint(${i})">×</button>
                <div class="hint-content">
                    <div class="hint-title">💡 Hint</div>
                    <div>${hintText}</div>
                    ${hintVisual}
                </div>
            </div>
            <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
                <div class="question-number">Q${i + 1}</div>
                ${q.skillLabel ? `<span class="mq-skill-pill">${q.skillLabel}</span>` : ''}
            </div>
            <div class="ws-card-visual">${questionDisplay}</div>
            <input type="text" class="worksheet-input" id="ws_input_${i}" placeholder="Answer" data-index="${i}" ${answerInputStyle}>
            <button class="hint-btn" onclick="toggleHint(${i})" title="Show hint">?</button>
        `;
        grid.appendChild(card);

        // Wire click-to-zoom on the visual area (skips click-is-answer types).
        attachWorksheetZoom(card, q);

        // Mount the multi-select-check widget into its host (per-card binding,
        // see mountWorksheetMsc — `i` is captured by closure to disambiguate
        // the shared widget submit slot across cards).
        if (isMultiSelectCheck) {
            const mscHost = document.getElementById(`wsMscHost_${i}`);
            if (mscHost) mountWorksheetMsc(q, i, mscHost);
        }

        // Mount the clock-set widget into its host (per-card binding,
        // see mountWorksheetClockSet — qq reference identity disambiguates
        // the shared widget submit slot across cards).
        if (isClockSet) {
            const csHost = document.getElementById(`wsCsHost_${i}`);
            if (csHost) mountWorksheetClockSet(q, i, csHost);
        }

        // Mount the drag-fill widget into its host (per-card binding,
        // see mountWorksheetDragFill — qq reference identity disambiguates
        // the shared widget submit slot across cards).
        if (isDragFill) {
            const dfHost = document.getElementById(`wsDfHost_${i}`);
            if (dfHost) mountWorksheetDragFill(q, i, dfHost);
        }

        // Mount the dnd-generic widget into its host (per-card binding,
        // see mountWorksheetDnd — qq reference identity disambiguates the
        // shared widget submit slot across cards).
        if (isDndGeneric) {
            const dndHost = document.getElementById(`wsDndHost_${i}`);
            if (dndHost) mountWorksheetDnd(q, i, dndHost);
        }

        // Add real-time validation listener for regular input
        const input = document.getElementById(`ws_input_${i}`);
        input.addEventListener("input", () => checkWorksheetAnswer(i));

        // For vertical format, add listeners to column answer inputs
        if (isVerticalFormat) {
            const columnInputs = card.querySelectorAll('.column-answer-input');
            columnInputs.forEach(colInput => {
                colInput.addEventListener("input", () => checkWorksheetAnswerFromColumns(i));
            });
        }

        // For function tables, add listeners to the table inputs
        if (isFunctionTable) {
            const funcInputs = card.querySelectorAll('.func-table-input');
            funcInputs.forEach(funcInput => {
                funcInput.addEventListener("input", () => checkWorksheetAnswerFromFuncTable(i));
            });
        }

        // For dual-answer (perimeter+area), add listeners to both inputs
        if (isDualAnswer) {
            const perimeterInput = document.getElementById(`ws_perimeter_${i}`);
            const areaInput = document.getElementById(`ws_area_${i}`);
            if (perimeterInput) {
                perimeterInput.addEventListener("input", () => checkWorksheetDualAnswer(i));
            }
            if (areaInput) {
                areaInput.addEventListener("input", () => checkWorksheetDualAnswer(i));
            }
        }

        // For coordinate multi-answer, add listeners to each coordinate input
        if (isCoordinateMulti && q.coordinateData && q.coordinateData.points) {
            q.coordinateData.points.forEach((p, idx) => {
                const coordInput = document.getElementById(`ws_coord_${i}_${idx}`);
                if (coordInput) {
                    coordInput.addEventListener("input", () => checkWorksheetCoordinateAnswer(i));
                }
            });
        }

        // For divisibility sorting, set up the drag-and-drop handlers
        if (isDivisibilitySort && q.divisibilitySortData) {
            setupWorksheetDivisibilitySort(i, q.divisibilitySortData.divisor);
        }

        // For interactive ordering, add listeners to the order input boxes
        if (isInteractiveOrdering) {
            const orderInputs = card.querySelectorAll('.ws-order-input');
            orderInputs.forEach(orderInput => {
                orderInput.addEventListener("input", () => checkWorksheetOrderingAnswer(i));
            });
        }

        // For interactive expanded form, add listeners to the expanded input boxes
        if (isInteractiveExpanded) {
            const expandedInputs = card.querySelectorAll('.ws-expanded-input');
            expandedInputs.forEach(expInput => {
                expInput.addEventListener("input", () => checkWorksheetExpandedAnswer(i));
            });
        }
        
        // For number families, add listeners to all inputs
        if (isNumberFamily) {
            const numFamilyInputs = card.querySelectorAll('.ws-number-family-input, .ws-fact-family-input');
            numFamilyInputs.forEach(nfInput => {
                nfInput.addEventListener("input", () => checkWorksheetNumberFamily(i));
            });
        }
        
        // For area model multiplication, add listeners to check each cell
        const isAreaModel = q.answerType === "area-model";
        if (isAreaModel) {
            const areaInputs = card.querySelectorAll('.area-model-input, .area-model-total');
            areaInputs.forEach(areaInput => {
                areaInput.addEventListener("input", () => checkAreaModelInput(areaInput, i));
            });
        }
    }

    document.getElementById("worksheetResult").innerText = "";
}

// Add more problems for unlimited mode
export function addMoreProblems() {
    const grid = document.getElementById("worksheetGrid");
    const startIndex = state.worksheetQs.length;

    for (let j = 0; j < 10; j++) {
        const i = startIndex + j;
        const q = generateQuestion();
        // Synthesize a static visual for grid-fill skills (number_seq_fill,
        // count_by_step_*, count_by_powers_of_10) so worksheet mode can show
        // the grid without mounting the live widget.
        if (q && q.answerType === 'grid-fill' && (!q.visual || !String(q.visual).trim())) {
            q.visual = _buildGridFillStaticVisual(q);
        }
        state.worksheetQs.push(q);
        const card = document.createElement("div");
        card.className = "problem-card";
        card.id = `ws_card_${i}`;

        // Check if this is a column/vertical format question
        const isVerticalFormat = q.visual && (
            q.visual.includes('Column Addition') ||
            q.visual.includes('Column Subtraction') ||
            q.visual.includes('Column Multiplication') ||
            q.visual.includes('Long Division')
        );

        // Check for long division specifically
        const isLongDivision = q.visual && q.visual.includes('Long Division');

        // Check if this is a function table
        const isFunctionTable = q.visual && q.visual.includes('Function Table');

        // Check if this is an interactive ordering question
        const isInteractiveOrdering = q.answerType === "interactive" && q.interactiveType === "ordering";

        // Check if this is an interactive expanded form question
        const isInteractiveExpanded = q.answerType === "interactive" && q.interactiveType === "expanded";

        // Check if this is a T-Chart drag-drop question
        const isTchartDrag = q.answerType === "tchart-drag";

        // Check if this is a fraction question
        const isFraction = q.visual && (q.visual.includes('frac{') || q.visual.includes('fraction'));

        // Check if this is a geometry question with visual
        const isGeometryWithVisual = q.visual && (
            q.visual.includes('<svg') ||
            q.visual.includes('Perimeter') ||
            q.visual.includes('Area') ||
            q.visual.includes('Volume') ||
            q.visual.includes('📐') ||
            q.visual.includes('Angle') ||
            q.visual.includes('Triangle') ||
            q.visual.includes('Quadrilateral') ||
            q.visual.includes('Symmetry') ||
            q.visual.includes('coordinate') ||
            (q.printFormat && q.printFormat.startsWith('geometry-'))
        );
        
        // Check for divisibility sort
        const isDivisibilitySortEarly = q.answerType === "divisibility-sort";
        
        // Check for number families and fact families
        const isNumberFamily = q.answerType === "number-family" || q.answerType === "fact-family";

        // Check for multiple-choice / choice answer types — render as button grid
        const isMultipleChoice = (q.answerType === "multiple-choice" || q.answerType === "choice")
            && Array.isArray(q.options) && q.options.length > 0;

        // Check for multi-select-check (click-all-that-apply, MAP-style)
        const isMultiSelectCheck = q.answerType === "multi-select-check"
            && Array.isArray(q.options) && q.options.length > 0;

        // Check for clock-set (Phase 6 P1 — interactive analog clock)
        const isClockSet = q.answerType === "clock-set";

        // Check for drag-fill (drag tokens from palette into labeled slots).
        const isDragFill = q.answerType === "drag-fill"
            && Array.isArray(q.slots) && q.slots.length > 0
            && Array.isArray(q.palette) && q.palette.length > 0;

        // Check for dnd-generic (drag-and-drop categorize/order, MAP-style)
        const isDndGeneric = q.answerType === "dnd-generic";

        // Check for facts column visual (read-only vertical format - keeps answer input visible)
        const isFactsColumn = q.visual && q.visual.includes('facts-column-visual');

        // Check for new visual skills where the visual IS the question
        const newVisualSkillFormats = ['arrays-groups', 'mult-properties', 'div-remainders',
            'fraction-of-set', 'equiv-frac-visual', 'area-unit-squares', 'perimeter-grid',
            'reading-ruler', 'money-count', 'line-plot-fractions',
            'tape-diagram', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
            // Grid-fill counting/sequencing skills (number_seq_fill, count_by_step_*, count_by_powers_of_10)
            'grid-fill',
            'rounding-visual', 'place-value-disks', 'pv-disks-build',
            'fraction-of-set-hard', 'reading-ruler-hard',
            'function-table-easy', 'function-table-hard',
            'nl-add', 'nl-sub', 'nl-mult', 'nl-div',
            'fraction-order', 'fraction-numline-order', 'fraction-benchmark',
            'fraction-compare-lcd', 'fraction-round', 'fraction-estimate',
            'write-fraction', 'shade-fraction',
            'percent-grid', 'percent-of', 'percent-find-whole', 'fdp-order', 'decimal-order',
            'multi-select', 'ten-frame', 'dnd-generic', 'drag-fill', 'hot-spot', 'place-symmetry-lines', 'numpad-input',
            'number-line-extended',
            // Phase 6 P1
            'clock-set',
            // Phase 5 batch 1: K-2 MAP early-band
            'add-5-pictures', 'sub-5-pictures', 'heavier-lighter', 'pictograph-intro',
            'tens-foundation', 'bar-graph-intro', 'shape-corners',
            // Phase 5 batch 2: mid-band MAP skills
            'hundreds-chart-fill', 'unknown-start-wp', 'count-efv', 'count-2d-attrs', 'coord-distance',
            // Phase 5 batch 3: mid-to-high band MAP skills
            'perimeter-intro', 'unit-conversion-word', 'box-plot-intro', 'histogram-read',
            'ratio-intro', 'unit-rate-intro', 'double-num-line',
            // Phase 5 batch 4: geometry-heavy MAP skills
            'area-distributive', 'area-triangle', 'area-polygon-decompose',
            'coord-polygon', 'net-surface-area',
            // Shape name match (drag names onto 2D / 3D shape figures)
            'shape-name-match',
            // Coord-input (X/Y boxes with parens+comma)
            'coord-input',
            // Box method division (per-digit guided long division)
            'box-division',
            // factors_identify fill-in-the-blanks (vertical pair list)
            'factor-pairs'];
        const isNewVisualSkill = q.visual && q.printFormat && newVisualSkillFormats.includes(q.printFormat);

        // Check for data/stats with visuals
        const isDataStatsWithVisualEarly = q.visual && (
            q.dataData ||
            q.visual.includes('📊') ||
            q.visual.includes('🎲') ||
            (q.printFormat && q.printFormat.startsWith('data-'))
        );

        // Wide visual formats that need full-width cards on worksheet grid
        const wideVisualFormats = ['tape-diagram', 'line-plot-fractions', 'area-unit-squares',
            'perimeter-grid', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
            // Grid-fill counting/sequencing skills are full-width
            'grid-fill',
            'fraction-numline-order', 'dnd-generic', 'pv-disks-build', 'hot-spot', 'number-line-extended',
            // Phase 5 batch 1
            'bar-graph-intro',
            // Phase 5 batch 2: wide visual cards (coord grid is wide)
            'coord-distance',
            // Phase 5 batch 3: wide visual cards (plots, double number line)
            'box-plot-intro', 'histogram-read', 'double-num-line',
            // Phase 5 batch 4: wide visual cards (decompose grid, coord polygon, nets)
            'area-polygon-decompose', 'coord-polygon', 'net-surface-area',
            // Shape name match — table of shapes is full-row width
            'shape-name-match',
            // Coord-input is a full-width SVG grid card
            'coord-input',
            // Box method division is wide (multiple boxes side-by-side)
            'box-division'];
        const isWideVisual = isNewVisualSkill && wideVisualFormats.includes(q.printFormat);
        const isMediumVisual = isNewVisualSkill && !isWideVisual;

        // Add appropriate card size class based on problem type
        if (isLongDivision) {
            card.classList.add('card-division');
        } else if (isVerticalFormat) {
            card.classList.add('card-column');
        } else if (isFunctionTable) {
            card.classList.add('card-table');
        } else if (isInteractiveOrdering) {
            card.classList.add('card-ordering');
        } else if (isTchartDrag) {
            card.classList.add('card-tchart');
        } else if (isDndGeneric) {
            card.classList.add('card-dnd');
        } else if (isMultiSelectCheck) {
            card.classList.add('card-msc');
        } else if (isClockSet) {
            card.classList.add('card-cs');
        } else if (isDragFill) {
            card.classList.add('card-df');
        } else if (isDivisibilitySortEarly) {
            card.classList.add('card-divisibility');
        } else if (isNumberFamily) {
            card.classList.add('card-number-family');
        } else if (isDataStatsWithVisualEarly) {
            card.classList.add('card-data-stats');
        } else if (isWideVisual) {
            card.classList.add('card-wide-visual');
        } else if (isMediumVisual) {
            card.classList.add('card-medium-visual');
        } else if (isFraction) {
            card.classList.add('card-fraction');
        } else if (isGeometryWithVisual) {
            card.classList.add('card-geometry');
        } else {
            card.classList.add('card-simple');
        }

        // Mark the question types for validation
        q.isVerticalFormat = isVerticalFormat;
        q.isFunctionTable = isFunctionTable;
        q.isInteractiveOrdering = isInteractiveOrdering;
        q.isInteractiveExpanded = isInteractiveExpanded;
        q.isTchartDrag = isTchartDrag;
        q.isGeometryWithVisual = isGeometryWithVisual;
        q.isMultipleChoice = isMultipleChoice;
        q.isMultiSelectCheck = isMultiSelectCheck;
        q.isClockSet = isClockSet;
        q.isDragFill = isDragFill;
        q.isDndGeneric = isDndGeneric;

        // Check for additional special types
        const isDualAnswer = q.answerType === "dual";
        const isCoordinateMulti = q.answerType === "coordinate-multi";
        const isCoordInput = q.answerType === "coord-input";
        const isDivisibilitySort = q.answerType === "divisibility-sort";
        const isDataStatsWithVisual = q.visual && (
            q.dataData ||
            q.visual.includes('📊') ||
            q.visual.includes('🎲') ||
            q.visual.includes('<svg') ||
            q.printFormat?.startsWith('data-')
        );

        // Show visual for vertical formats and function tables, otherwise show text
        let questionDisplay;
        if (isVerticalFormat) {
            questionDisplay = q.visual;
        } else if (isFunctionTable) {
            questionDisplay = q.visual;
        } else if (isInteractiveOrdering) {
            questionDisplay = renderWorksheetOrdering(q, i);
        } else if (isInteractiveExpanded) {
            questionDisplay = renderWorksheetExpanded(q, i);
        } else if (isTchartDrag) {
            questionDisplay = q.visual;
        } else if (isDualAnswer) {
            let modifiedVisual = q.visual
                .replace(/id="perimeterInput"/g, `id="ws_perimeter_${i}"`)
                .replace(/id="areaInput"/g, `id="ws_area_${i}"`);
            questionDisplay = `${modifiedVisual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isCoordInput) {
            // For coord-input, rewrite ciX_/ciY_ IDs to be unique per problem; remove in-visual submit button
            let modifiedVisual = q.visual;
            const points = (q.coordinateData && q.coordinateData.points) || [];
            points.forEach((p, idx) => {
                modifiedVisual = modifiedVisual
                    .replace(new RegExp(`id="ciX_${idx}"`, 'g'), `id="ws_ciX_${i}_${idx}"`)
                    .replace(new RegExp(`id="ciY_${idx}"`, 'g'), `id="ws_ciY_${i}_${idx}"`);
            });
            modifiedVisual = modifiedVisual.replace(/<button[^>]*id="ciSubmitBtn"[^>]*>.*?<\/button>/g, '');
            questionDisplay = `<div class="question-line" style="margin-bottom:10px;">${q.text}</div>${modifiedVisual}`;
        } else if (isCoordinateMulti) {
            let modifiedVisual = q.visual;
            if (q.coordinateData && q.coordinateData.points) {
                q.coordinateData.points.forEach((p, idx) => {
                    modifiedVisual = modifiedVisual.replace(
                        new RegExp(`id="coordInput_${idx}"`, 'g'), 
                        `id="ws_coord_${i}_${idx}"`
                    );
                });
            }
            questionDisplay = `${modifiedVisual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isDivisibilitySort) {
            let modifiedVisual = q.visual
                .replace(/id="divSortNumbers"/g, `id="ws_divSortNumbers_${i}"`)
                .replace(/id="divSortYes"/g, `id="ws_divSortYes_${i}"`)
                .replace(/id="divSortNo"/g, `id="ws_divSortNo_${i}"`);
            questionDisplay = modifiedVisual;
        } else if (isNumberFamily) {
            // For number families, modify input IDs to be unique per problem
            let modifiedVisual = q.visual
                .replace(/class="number-family-input"/g, `class="number-family-input ws-number-family-input"`)
                .replace(/class="fact-family-input"/g, `class="fact-family-input ws-fact-family-input"`)
                .replace(/onclick="checkNumberFamily\(\)"/g, `onclick="checkWorksheetNumberFamily(${i})"`)
                .replace(/<div id="numberFamilyFeedback"/g, `<div id="ws_numberFamilyFeedback_${i}"`);
            modifiedVisual = modifiedVisual.replace(/data-eq="(\d+)"/g, `data-problem="${i}" data-eq="$1"`);
            questionDisplay = modifiedVisual;
        } else if (isMultipleChoice) {
            // Render answer options as a clickable button grid.
            // Show the visual (if any) above the question text + buttons.
            const visualHtml = (q.visual && !q.visual.includes(q.text || '__no_match__'))
                ? `<div class="ws-mc-visual">${q.visual}</div>`
                : '';
            questionDisplay = `${visualHtml}${renderWorksheetMC(q, i)}`;
        } else if (isMultiSelectCheck) {
            // Render the multi-select-check widget into a per-card host.
            // Show the question's visual (if any) above the widget, plus the
            // question text. The widget itself is mounted after the card is
            // appended to the DOM (see post-append loop below).
            const visualHtml = (q.visual && !q.visual.includes(q.text || '__no_match__'))
                ? `<div class="ws-msc-visual">${q.visual}</div>`
                : '';
            const textHtml = q.text ? `<div class="question-line">${q.text}</div>` : '';
            questionDisplay = `${visualHtml}${textHtml}<div class="ws-msc-host" id="wsMscHost_${i}" data-msc-idx="${i}"></div>`;
        } else if (isClockSet) {
            // Render the clock-set widget into a per-card host. The widget is
            // mounted after the card is appended to the DOM (see post-append
            // loop below). Show question text above the clock.
            const textHtml = q.text ? `<div class="question-line">${q.text}</div>` : '';
            questionDisplay = `${textHtml}<div class="ws-cs-host" id="wsCsHost_${i}" data-cs-idx="${i}"></div>`;
        } else if (isDndGeneric) {
            // Render the dnd-generic widget (categorize/order) into a per-card
            // host. The widget owns its own prompt/tiles/bins; we mount after
            // the card is appended to the DOM (see post-append loop below).
            questionDisplay = `<div class="ws-dnd-host" id="wsDndHost_${i}" data-dnd-idx="${i}"></div>`;
        } else if (isDragFill) {
            // Render the drag-fill widget into a per-card host. The widget
            // ships its own prompt + slots + palette + Check button, so we
            // only show q.visual (if any) above the host. The widget mounts
            // after the card is appended (see post-append loop below).
            const visualHtml = (q.visual && !q.visual.includes(q.text || '__no_match__'))
                ? `<div class="ws-df-visual">${q.visual}</div>`
                : '';
            questionDisplay = `${visualHtml}<div class="ws-df-host" id="wsDfHost_${i}" data-df-idx="${i}"></div>`;
        } else if (isFactsColumn) {
            // Show vertical visual for facts - answer input stays visible
            questionDisplay = q.visual;
        } else if (isNewVisualSkill) {
            // Show both visual and text for new visual skills
            questionDisplay = `${q.visual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isDataStatsWithVisual) {
            questionDisplay = `${q.visual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else if (isGeometryWithVisual) {
            // Show both the visual AND text for geometry questions
            questionDisplay = `${q.visual}<div class="question-line" style="margin-top:10px;">${q.text}</div>`;
        } else {
            questionDisplay = `<div class="question-line">${q.text}</div>`;
        }

        const answerInputStyle = (isVerticalFormat || isFunctionTable || isInteractiveOrdering || isInteractiveExpanded || isTchartDrag || isDualAnswer || isCoordinateMulti || isCoordInput || isDivisibilitySort || isNumberFamily || isMultipleChoice || isMultiSelectCheck || isClockSet || isDragFill || isDndGeneric) ? 'style="display:none;"' : '';

        const hintVisual = q.hintVisual ? `<div class="hint-visual">${q.hintVisual}</div>` : '';
        const baseHint = q.hint || 'Think about this problem step by step.';
        const opHint = _wsOpHint(q);
        const hintText = opHint
            ? `${opHint}<div style="margin-top:6px;">${baseHint}</div>`
            : baseHint;

        // Determine if this card has visual content that may need magnification
        const hasVisualContent = !!(q.visual && (
            q.visual.includes('<svg') ||
            q.visual.includes('frac-bar') ||
            q.visual.includes('fraction') ||
            isNewVisualSkill ||
            isGeometryWithVisual ||
            isDataStatsWithVisualEarly ||
            isFraction
        ));

        const magnifyBtn = hasVisualContent
            ? `<button class="ws-magnify-btn" onclick="wsMagnifyCard(${i})" title="Tap to zoom">&#128269;</button>`
            : '';

        // Per-card Skip: grays out the card, marks q._skipped = true,
        // excluded from total in checkAllWorksheet. Universal across all
        // worksheet skills, all answer types.
        const skipBtnHtml = `<button class="ws-skip-btn" type="button" onclick="wsSkipCard(${i})" title="Skip this problem (no penalty)">⏭ Skip</button>`;

        card.innerHTML = `
            ${magnifyBtn}
            ${skipBtnHtml}
            <button class="ws-tts-btn" onclick="wsSpeak(${i})" title="Read problem aloud">&#x1F50A;</button>
            <div class="hint-popup" id="hint_popup_${i}">
                <button class="hint-close" onclick="closeHint(${i})">×</button>
                <div class="hint-content">
                    <div class="hint-title">💡 Hint</div>
                    <div>${hintText}</div>
                    ${hintVisual}
                </div>
            </div>
            <div style="display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;">
                <div class="question-number">Q${i + 1}</div>
                ${q.skillLabel ? `<span class="mq-skill-pill">${q.skillLabel}</span>` : ''}
            </div>
            <div class="ws-card-visual">${questionDisplay}</div>
            <input type="text" class="worksheet-input" id="ws_input_${i}" placeholder="Answer" data-index="${i}" ${answerInputStyle}>
            <button class="hint-btn" onclick="toggleHint(${i})" title="Show hint">?</button>
        `;
        grid.appendChild(card);

        // Wire click-to-zoom on the visual area (skips click-is-answer types).
        attachWorksheetZoom(card, q);

        // Mount the multi-select-check widget into its host (per-card binding,
        // see mountWorksheetMsc — `i` is captured by closure to disambiguate
        // the shared widget submit slot across cards).
        if (isMultiSelectCheck) {
            const mscHost = document.getElementById(`wsMscHost_${i}`);
            if (mscHost) mountWorksheetMsc(q, i, mscHost);
        }

        // Mount the clock-set widget into its host (per-card binding,
        // see mountWorksheetClockSet — qq reference identity disambiguates
        // the shared widget submit slot across cards).
        if (isClockSet) {
            const csHost = document.getElementById(`wsCsHost_${i}`);
            if (csHost) mountWorksheetClockSet(q, i, csHost);
        }

        // Mount the drag-fill widget into its host (per-card binding,
        // see mountWorksheetDragFill — qq reference identity disambiguates
        // the shared widget submit slot across cards).
        if (isDragFill) {
            const dfHost = document.getElementById(`wsDfHost_${i}`);
            if (dfHost) mountWorksheetDragFill(q, i, dfHost);
        }

        // Mount the dnd-generic widget into its host (per-card binding,
        // see mountWorksheetDnd — qq reference identity disambiguates the
        // shared widget submit slot across cards).
        if (isDndGeneric) {
            const dndHost = document.getElementById(`wsDndHost_${i}`);
            if (dndHost) mountWorksheetDnd(q, i, dndHost);
        }

        // Add event listeners
        const input = document.getElementById(`ws_input_${i}`);
        input.addEventListener("input", () => checkWorksheetAnswer(i));

        if (isVerticalFormat) {
            const columnInputs = card.querySelectorAll('.column-answer-input');
            columnInputs.forEach(colInput => {
                colInput.addEventListener("input", () => checkWorksheetAnswerFromColumns(i));
            });
        }

        // For number families, add listeners to all inputs
        if (isNumberFamily) {
            const numFamilyInputs = card.querySelectorAll('.ws-number-family-input, .ws-fact-family-input');
            numFamilyInputs.forEach(nfInput => {
                nfInput.addEventListener("input", () => checkWorksheetNumberFamily(i));
            });
        }

        if (isFunctionTable) {
            const funcInputs = card.querySelectorAll('.func-table-input');
            funcInputs.forEach(funcInput => {
                funcInput.addEventListener("input", () => checkWorksheetAnswerFromFuncTable(i));
            });
        }

        if (isInteractiveOrdering) {
            const orderInputs = card.querySelectorAll('.ws-order-input');
            orderInputs.forEach(orderInput => {
                orderInput.addEventListener("input", () => checkWorksheetOrderingAnswer(i));
            });
        }

        if (isInteractiveExpanded) {
            const expandedInputs = card.querySelectorAll('.ws-expanded-input');
            expandedInputs.forEach(expInput => {
                expInput.addEventListener("input", () => checkWorksheetExpandedAnswer(i));
            });
        }
        
        // For dual-answer, add listeners to both inputs
        if (isDualAnswer) {
            const perimeterInput = document.getElementById(`ws_perimeter_${i}`);
            const areaInput = document.getElementById(`ws_area_${i}`);
            if (perimeterInput) {
                perimeterInput.addEventListener("input", () => checkWorksheetDualAnswer(i));
            }
            if (areaInput) {
                areaInput.addEventListener("input", () => checkWorksheetDualAnswer(i));
            }
        }
        
        // For coordinate multi-answer
        if (isCoordinateMulti && q.coordinateData && q.coordinateData.points) {
            q.coordinateData.points.forEach((p, idx) => {
                const coordInput = document.getElementById(`ws_coord_${i}_${idx}`);
                if (coordInput) {
                    coordInput.addEventListener("input", () => checkWorksheetCoordinateAnswer(i));
                }
            });
        }
        
        // For area model multiplication
        const isAreaModel = q.answerType === "area-model";
        if (isAreaModel) {
            const areaInputs = card.querySelectorAll('.area-model-input, .area-model-total');
            areaInputs.forEach(areaInput => {
                areaInput.addEventListener("input", () => checkAreaModelInput(areaInput, i));
            });
        }
        
        // For divisibility sorting
        if (isDivisibilitySort && q.divisibilitySortData) {
            setupWorksheetDivisibilitySort(i, q.divisibilitySortData.divisor);
        }
    }

    // Scroll to the new problems
    const firstNewCard = document.getElementById(`ws_card_${startIndex}`);
    if (firstNewCard) {
        firstNewCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Finish unlimited worksheet and check all answers
export function finishUnlimitedWorksheet() {
    checkAllWorksheet();
    // Hide the unlimited controls after finishing
    const unlimitedControls = document.getElementById("worksheetUnlimitedControls");
    if (unlimitedControls) {
        unlimitedControls.style.display = "none";
    }
}

// Toggle hint popup visibility
export function toggleHint(idx) {
    const popup = document.getElementById(`hint_popup_${idx}`);
    if (popup) {
        // Close all other popups first
        document.querySelectorAll('.hint-popup.active').forEach(p => {
            if (p.id !== `hint_popup_${idx}`) {
                p.classList.remove('active');
            }
        });
        popup.classList.toggle('active');
    }
}

// Close hint popup
export function closeHint(idx) {
    const popup = document.getElementById(`hint_popup_${idx}`);
    if (popup) {
        popup.classList.remove('active');
    }
}

// Check answer from column format inputs (digit boxes)
export function checkWorksheetAnswerFromColumns(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    if (!card) return;

    const columnInputs = card.querySelectorAll('.column-answer-input');

    // Count filled inputs
    let filledCount = 0;
    columnInputs.forEach(input => {
        if (input.value.trim() !== '') filledCount++;
    });

    if (filledCount === 0) {
        // Reset to default if empty
        card.style.background = "var(--bg-card)";
        card.style.border = "none";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        columnInputs.forEach(input => {
            input.style.borderColor = "";
            input.style.background = "var(--bg-card-light)";
        });
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // Wait until enough digits are filled (matching expected answer length)
    const expectedAnswer = q.ans.toString().replace(/,/g, '');
    if (filledCount < expectedAnswer.length) return;

    // Get concatenated value
    let enteredValue = '';
    let hasAnyInput = false;
    columnInputs.forEach(input => {
        const val = input.value.trim();
        if (val !== '' || hasAnyInput) {
            enteredValue += val || ' ';
            if (val !== '') hasAnyInput = true;
        }
    });
    enteredValue = enteredValue.trim().replace(/\s+/g, '');

    const isCorrect = enteredValue === expectedAnswer;

    if (isCorrect) {
        card.style.background = "linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))";
        card.style.border = "3px solid var(--correct)";
        card.style.boxShadow = "0 6px 20px rgba(6,214,160,0.3)";
        columnInputs.forEach(input => {
            input.style.borderColor = "var(--correct)";
            input.style.background = "rgba(6,214,160,0.3)";
        });
        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // All filled but wrong - show incorrect styling
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        columnInputs.forEach(input => {
            input.style.borderColor = "var(--incorrect)";
            input.style.background = "rgba(239,71,111,0.15)";
        });
        wsRecordAnswer(idx, false);
    }
}

// Check answer from function table inputs
export function checkWorksheetAnswerFromFuncTable(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    if (!card) return;

    const funcInputs = card.querySelectorAll('.func-table-input');
    if (!funcInputs.length) return;

    // Get all entered values (in row order)
    const enteredValues = [];
    let hasAnyInput = false;
    funcInputs.forEach(input => {
        const val = input.value.trim();
        enteredValues.push(val);
        if (val !== '') hasAnyInput = true;
    });

    if (!hasAnyInput) {
        // Reset to default if all empty
        card.style.background = "var(--bg-card)";
        card.style.border = "none";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        funcInputs.forEach(input => {
            input.style.borderColor = "var(--accent-cyan)";
            input.style.background = "var(--bg-card-light)";
        });
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // Wait until all inputs are filled before grading
    const allFilled = enteredValues.every(val => val !== '');
    if (!allFilled) return;

    // Check if all values are correct
    const expectedAnswers = q.functionTableAnswers || [];
    let allCorrect = enteredValues.length === expectedAnswers.length;

    enteredValues.forEach((val, i) => {
        if (val === '' || Number(val) !== expectedAnswers[i]) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        // All correct - turn green!
        card.style.background = "linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))";
        card.style.border = "3px solid var(--correct)";
        card.style.boxShadow = "0 6px 20px rgba(6,214,160,0.3)";

        funcInputs.forEach(input => {
            input.style.borderColor = "var(--correct)";
            input.style.background = "rgba(6,214,160,0.3)";
        });

        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // All filled but not all correct - show wrong styling
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";

        wsRecordAnswer(idx, false);
        // Color individual inputs based on correctness
        funcInputs.forEach((input, i) => {
            const val = input.value.trim();
            if (val !== '' && Number(val) === expectedAnswers[i]) {
                input.style.borderColor = "var(--correct)";
                input.style.background = "rgba(6,214,160,0.2)";
            } else {
                input.style.borderColor = "var(--incorrect)";
                input.style.background = "rgba(239,71,111,0.15)";
            }
        });
    }
}

// Render ordering question for worksheet mode
export function renderWorksheetOrdering(q, idx) {
    const direction = q.orderIcon || (q.orderDirection === "asc" ? "🔼 Smallest → Largest" : "🔽 Largest → Smallest");
    const numBoxes = q.numbers.length;

    return `<div style="text-align:center;">
        <div class="question-line">${q.text}</div>
        <div style="font-weight:600;margin:10px 0;color:var(--text-dim);font-size:0.85rem;">${direction}</div>

        <!-- Show the numbers to order -->
        <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
            ${q.numbers.map(n => `<div style="background:var(--accent-cyan);color:white;padding:8px 12px;border-radius:8px;font-weight:700;font-size:1rem;">${n.toLocaleString()}</div>`).join("")}
        </div>

        <!-- Input boxes for ordering -->
        <div style="display:flex;justify-content:center;align-items:center;gap:6px;flex-wrap:wrap;">
            ${Array.from({length: numBoxes}, (_, i) => `
                <div style="display:flex;align-items:center;gap:4px;">
                    <span style="background:var(--accent-orange);color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;">${i + 1}</span>
                    <input type="text" class="ws-order-input" data-ws-idx="${idx}" data-order-idx="${i}"
                        style="width:65px;height:36px;text-align:center;font-size:1rem;font-weight:700;border:2px solid var(--accent-cyan);border-radius:8px;background:var(--bg-card-light);color:var(--text-primary);outline:none;"
                        placeholder="">
                    ${i < numBoxes - 1 ? '<span style="color:var(--accent-orange);font-size:1rem;margin:0 2px;">→</span>' : ''}
                </div>
            `).join("")}
        </div>
    </div>`;
}

// Render expanded form question for worksheet mode
export function renderWorksheetExpanded(q, idx) {
    const num = q.expandedNumber;
    const digits = q.expandedDigits;
    // Supports up to 7-digit numbers (millions). q.expandedPlaceIdx maps each
    // non-zero digit to its real place position (zero positions skipped).
    const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands","millions"];
    const placeIdxs = (Array.isArray(q.expandedPlaceIdx) && q.expandedPlaceIdx.length === digits.length)
        ? q.expandedPlaceIdx
        : digits.map((_, i) => digits.length - i - 1);

    return `<div style="text-align:center;">
        <div class="question-line">${q.text}</div>
        <div style="font-size:1.8rem;font-weight:900;color:var(--text-primary);margin:10px 0;">${num.toLocaleString()}</div>
        <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:10px;">Write the value of each digit:</div>

        <!-- Input boxes for each place value -->
        <div style="display:flex;justify-content:center;align-items:flex-start;gap:6px;flex-wrap:wrap;">
            ${digits.map((d, i) => {
                const placeIndex = placeIdxs[i];
                const placeName = placeNames[placeIndex] || `10^${placeIndex}`;
                const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-orange)', 'var(--accent-pink)', 'var(--accent-yellow)', 'var(--accent-teal, #009688)'];
                const color = colors[placeIndex] || colors[0];
                return `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                        <div style="background:${color};color:white;padding:4px 10px;border-radius:6px;font-weight:700;font-size:1.1rem;">${d}</div>
                        <div style="font-size:0.6rem;color:var(--text-dim);">${placeName}</div>
                        <input type="text" class="ws-expanded-input" data-ws-idx="${idx}" data-expanded-idx="${i}"
                            style="width:65px;height:36px;text-align:center;font-size:0.9rem;font-weight:700;border:2px solid ${color};border-radius:8px;background:var(--bg-card-light);color:var(--text-primary);outline:none;"
                            placeholder="">
                        ${i < digits.length - 1 ? '<span style="color:var(--text-dim);font-size:1rem;margin-top:4px;">+</span>' : ''}
                    </div>
                `;
            }).join("")}
        </div>
    </div>`;
}

// Check ordering answer in worksheet mode
export function checkWorksheetOrderingAnswer(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    if (!card) return;

    const orderInputs = card.querySelectorAll('.ws-order-input');
    if (!orderInputs.length) return;

    // Get all entered values
    const enteredValues = [];
    let hasAnyInput = false;
    orderInputs.forEach(input => {
        const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
        enteredValues.push(val);
        if (val !== '') hasAnyInput = true;
    });

    if (!hasAnyInput) {
        // Reset to default if all empty
        card.style.background = "var(--bg-card)";
        card.style.border = "none";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        orderInputs.forEach(input => {
            input.style.borderColor = "var(--accent-cyan)";
            input.style.background = "var(--bg-card-light)";
        });
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // Wait until all inputs are filled before grading
    const allFilled = enteredValues.every(val => val !== '');
    if (!allFilled) return;

    // Check if all values are correct
    const expectedAnswers = q.sortedNumbers || q.ans.split(",").map(Number);
    let allCorrect = true;

    enteredValues.forEach((val, i) => {
        if (parseInt(val, 10) !== expectedAnswers[i]) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        // All correct - turn green!
        card.style.background = "linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))";
        card.style.border = "3px solid var(--correct)";
        card.style.boxShadow = "0 6px 20px rgba(6,214,160,0.3)";

        orderInputs.forEach(input => {
            input.style.borderColor = "var(--correct)";
            input.style.background = "rgba(6,214,160,0.3)";
        });

        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // All filled but not all correct - show wrong styling
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";

        wsRecordAnswer(idx, false);
        orderInputs.forEach((input, i) => {
            const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
            if (parseInt(val, 10) === expectedAnswers[i]) {
                input.style.borderColor = "var(--correct)";
                input.style.background = "rgba(6,214,160,0.2)";
            } else {
                input.style.borderColor = "var(--incorrect)";
                input.style.background = "rgba(239,71,111,0.15)";
            }
        });
    }
}

// Check expanded form answer in worksheet mode
export function checkWorksheetExpandedAnswer(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    if (!card) return;

    const expandedInputs = card.querySelectorAll('.ws-expanded-input');
    if (!expandedInputs.length) return;

    // Get all entered values
    const enteredValues = [];
    let hasAnyInput = false;
    expandedInputs.forEach(input => {
        const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
        enteredValues.push(val);
        if (val !== '') hasAnyInput = true;
    });

    if (!hasAnyInput) {
        // Reset to default if all empty
        card.style.background = "var(--bg-card)";
        card.style.border = "none";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        expandedInputs.forEach(input => {
            input.style.background = "var(--bg-card-light)";
        });
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // Wait until all inputs are filled before grading
    const allFilled = enteredValues.every(val => val !== '');
    if (!allFilled) return;

    // Check if all values are correct
    const expectedAnswers = q.expandedValues || [];
    let allCorrect = true;

    enteredValues.forEach((val, i) => {
        if (parseInt(val, 10) !== expectedAnswers[i]) {
            allCorrect = false;
        }
    });

    if (allCorrect) {
        // All correct - turn green!
        card.style.background = "linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))";
        card.style.border = "3px solid var(--correct)";
        card.style.boxShadow = "0 6px 20px rgba(6,214,160,0.3)";

        expandedInputs.forEach(input => {
            input.style.borderColor = "var(--correct)";
            input.style.background = "rgba(6,214,160,0.3)";
        });

        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // All filled but not all correct - show wrong styling
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";

        wsRecordAnswer(idx, false);
        expandedInputs.forEach((input, i) => {
            const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
            if (parseInt(val, 10) === expectedAnswers[i]) {
                input.style.borderColor = "var(--correct)";
                input.style.background = "rgba(6,214,160,0.2)";
            } else {
                input.style.borderColor = "var(--incorrect)";
                input.style.background = "rgba(239,71,111,0.15)";
            }
        });
    }
}

// Advance to the next worksheet problem
export function advanceToNextProblem(currentIdx) {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= state.worksheetQs.length) return; // No more problems

    const nextCard = document.getElementById(`ws_card_${nextIdx}`);
    if (!nextCard) return;

    const nextQ = state.worksheetQs[nextIdx];

    // Scroll the next card into view smoothly
    nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus on the appropriate input after scroll completes
    setTimeout(() => {
        if (nextQ.isVerticalFormat) {
            // Focus on the first column answer input
            const firstColInput = nextCard.querySelector('.column-answer-input');
            if (firstColInput) firstColInput.focus();
        } else if (nextQ.isFunctionTable) {
            // Focus on the first function table input
            const firstFuncInput = nextCard.querySelector('.func-table-input');
            if (firstFuncInput) firstFuncInput.focus();
        } else {
            // Focus on the regular answer input
            const nextInput = document.getElementById(`ws_input_${nextIdx}`);
            if (nextInput) nextInput.focus();
        }
    }, 350);
}

// Track which worksheet questions have already triggered confetti
const worksheetConfettiTriggered = new Set();
// Track which worksheet questions have been recorded in the banner stats (prevents double-counting)
const worksheetBannerRecorded = new Set();
// Track debounce timers for single-input wrong-answer delay (2 seconds)
const worksheetWrongTimers = new Map();

// Record a worksheet answer in the game stats banner (once per problem)
function wsRecordAnswer(idx, isCorrect) {
    if (worksheetBannerRecorded.has(idx)) return;
    worksheetBannerRecorded.add(idx);
    if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
        window.bannerRecordAnswer(isCorrect);
    }
}

// Per-card Skip — grays the card, marks q._skipped, excludes from scoring.
// No penalty: not correct, not incorrect, just removed from the total.
// Toggleable so a student who skipped can come back and answer.
export function wsSkipCard(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    if (!q || !card) return;
    if (q._skipped) {
        // Toggle off — un-skip and let the student answer.
        q._skipped = false;
        card.classList.remove('ws-skipped');
        const btn = card.querySelector('.ws-skip-btn');
        if (btn) btn.textContent = '⏭ Skip';
        // Re-enable inputs.
        card.querySelectorAll('input').forEach(el => { el.disabled = false; });
        return;
    }
    q._skipped = true;
    card.classList.add('ws-skipped');
    const btn = card.querySelector('.ws-skip-btn');
    if (btn) btn.textContent = '↩ Undo Skip';
    // Disable inputs (CSS pointer-events also blocks, but disable is belt+braces).
    card.querySelectorAll('input').forEach(el => { el.disabled = true; });
}

export function checkWorksheetAnswer(idx) {
    const q = state.worksheetQs[idx];
    const input = document.getElementById(`ws_input_${idx}`);
    const card = document.getElementById(`ws_card_${idx}`);
    if (!input || !card) return;

    // Clear any pending wrong-answer timer for this problem
    if (worksheetWrongTimers.has(idx)) {
        clearTimeout(worksheetWrongTimers.get(idx));
        worksheetWrongTimers.delete(idx);
    }

    const value = input.value.trim();
    if (value === "") {
        // Reset to default if empty — allows retry after wrong
        input.style.borderColor = "transparent";
        input.style.background = "var(--bg-card-light)";
        card.style.background = "var(--bg-card)";
        card.style.border = "none";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // For numeric answers, use digit-count auto-check
    const isNumeric = q.answerType === "number" || typeof q.ans === "number";
    if (isNumeric) {
        const expectedDigits = String(q.ans).replace(/[^0-9]/g, '').length;
        const userDigits = value.replace(/[^0-9]/g, '').length;

        if (userDigits < expectedDigits || expectedDigits === 0) {
            // Still typing — reset any wrong styling so student can retry
            input.style.borderColor = "var(--accent-cyan)";
            input.style.background = "var(--bg-card-light)";
            card.style.background = "var(--bg-card)";
            card.style.border = "2px solid transparent";
            card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
            return;
        }
    }

    // Strip commas from user input before comparing
    const cleanedValue = value.replace(/,/g, "");
    let isCorrect;
    if (isNumeric) {
        isCorrect = Number(cleanedValue) === Number(q.ans);
    } else if (isTimeSkill(state.skill)) {
        isCorrect = timeAnswersMatch(value, q.ans, state.skill);
    } else {
        isCorrect = normalizeText(value) === normalizeText(q.ans);
    }

    if (isCorrect) {
        // Correct — turn green immediately
        input.style.borderColor = "var(--correct)";
        input.style.background = "rgba(6,214,160,0.3)";
        card.style.background = "linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))";
        card.style.border = "3px solid var(--correct)";
        card.style.boxShadow = "0 6px 20px rgba(6,214,160,0.3)";
        input.disabled = true;
        wsRecordAnswer(idx, true);

        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // Wrong — show red immediately, student can erase and retry
        input.style.borderColor = "var(--incorrect)";
        input.style.background = "rgba(239,71,111,0.15)";
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        wsRecordAnswer(idx, false);
    }
}

export function checkAllWorksheet() {
    let correct = 0;
    let skipped = 0;
    const totalAll = state.worksheetQs.length;

    state.worksheetQs.forEach((q, idx) => {
        const card = document.getElementById(`ws_card_${idx}`);
        if (!card) return;
        // Skipped problems: do NOT grade, do NOT count in the total. Just
        // tally for the score-card breakdown.
        if (q && q._skipped) { skipped++; return; }

        let value = '';
        let isCorrect = false;

        // Check if this is a vertical format question
        if (q.isVerticalFormat) {
            // Get answer from column inputs
            const columnInputs = card.querySelectorAll('.column-answer-input');
            let enteredValue = '';
            let hasAnyInput = false;
            columnInputs.forEach(input => {
                const val = input.value.trim();
                if (val !== '' || hasAnyInput) {
                    enteredValue += val || ' ';
                    if (val !== '') hasAnyInput = true;
                }
            });
            value = enteredValue.trim().replace(/\s+/g, '');
            const expectedAnswer = q.ans.toString().replace(/,/g, '');
            isCorrect = value === expectedAnswer;

            // Style the column inputs
            columnInputs.forEach(input => {
                input.style.borderColor = isCorrect ? "var(--correct)" : "var(--incorrect)";
                input.style.background = isCorrect ? "rgba(6,214,160,0.3)" : "rgba(239,71,111,0.15)";
            });

            // If wrong, show correct answer in column inputs
            if (!isCorrect) {
                const correctDigits = q.ans.toString().split('');
                const inputArray = Array.from(columnInputs);
                // Fill from right to left
                for (let i = inputArray.length - 1, j = correctDigits.length - 1; i >= 0 && j >= 0; i--, j--) {
                    inputArray[i].value = correctDigits[j];
                }
            }
        } else if (q.isFunctionTable) {
            // Get answers from function table inputs
            const funcInputs = card.querySelectorAll('.func-table-input');
            const expectedAnswers = q.functionTableAnswers || [];
            let allCorrect = funcInputs.length === expectedAnswers.length;

            funcInputs.forEach((input, i) => {
                const val = input.value.trim();
                const expected = expectedAnswers[i];
                const inputCorrect = val !== '' && Number(val) === expected;

                if (!inputCorrect) allCorrect = false;

                // Style each input
                input.style.borderColor = inputCorrect ? "var(--correct)" : "var(--incorrect)";
                input.style.background = inputCorrect ? "rgba(6,214,160,0.3)" : "rgba(239,71,111,0.15)";

                // If wrong, show correct answer
                if (!inputCorrect) {
                    input.value = expected;
                }
            });

            isCorrect = allCorrect;
        } else if (q.isInteractiveOrdering) {
            // Get answers from ordering input boxes
            const orderInputs = card.querySelectorAll('.ws-order-input');
            const expectedAnswers = q.sortedNumbers || q.ans.split(",").map(Number);
            let allCorrect = orderInputs.length === expectedAnswers.length;

            orderInputs.forEach((input, i) => {
                const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
                const expected = expectedAnswers[i];
                const inputCorrect = val !== '' && parseInt(val, 10) === expected;

                if (!inputCorrect) allCorrect = false;

                // Style each input
                input.style.borderColor = inputCorrect ? "var(--correct)" : "var(--incorrect)";
                input.style.background = inputCorrect ? "rgba(6,214,160,0.3)" : "rgba(239,71,111,0.15)";

                // If wrong, show correct answer
                if (!inputCorrect) {
                    input.value = expected.toLocaleString();
                }
            });

            isCorrect = allCorrect;
        } else if (q.isInteractiveExpanded) {
            // Get answers from expanded form input boxes
            const expandedInputs = card.querySelectorAll('.ws-expanded-input');
            const expectedAnswers = q.expandedValues || [];
            let allCorrect = expandedInputs.length === expectedAnswers.length;

            expandedInputs.forEach((input, i) => {
                const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
                const expected = expectedAnswers[i];
                const inputCorrect = val !== '' && parseInt(val, 10) === expected;

                if (!inputCorrect) allCorrect = false;

                // Style each input
                input.style.borderColor = inputCorrect ? "var(--correct)" : "var(--incorrect)";
                input.style.background = inputCorrect ? "rgba(6,214,160,0.3)" : "rgba(239,71,111,0.15)";

                // If wrong, show correct answer
                if (!inputCorrect) {
                    input.value = expected.toLocaleString();
                }
            });

            isCorrect = allCorrect;
        } else if (q.answerType === "dual" && q.dualAnswers) {
            // Dual-answer (perimeter + area) questions
            const perimeterInput = document.getElementById(`ws_perimeter_${idx}`);
            const areaInput = document.getElementById(`ws_area_${idx}`);
            
            if (perimeterInput && areaInput) {
                const userPerimeter = parseFloat(perimeterInput.value);
                const userArea = parseFloat(areaInput.value);
                const correctPerimeter = q.dualAnswers.perimeter;
                const correctArea = q.dualAnswers.area;
                
                const perimeterCorrect = !isNaN(userPerimeter) && userPerimeter === correctPerimeter;
                const areaCorrect = !isNaN(userArea) && userArea === correctArea;
                
                isCorrect = perimeterCorrect && areaCorrect;
                
                // Style inputs
                perimeterInput.style.borderColor = perimeterCorrect ? "var(--correct)" : "var(--incorrect)";
                perimeterInput.style.background = perimeterCorrect ? "rgba(6,214,160,0.3)" : "rgba(239,71,111,0.15)";
                areaInput.style.borderColor = areaCorrect ? "var(--correct)" : "var(--incorrect)";
                areaInput.style.background = areaCorrect ? "rgba(6,214,160,0.3)" : "rgba(239,71,111,0.15)";
                
                // Show correct answers if wrong
                if (!perimeterCorrect) perimeterInput.value = correctPerimeter;
                if (!areaCorrect) areaInput.value = correctArea;
            }
        } else if (q.answerType === "coordinate-multi" && q.coordinateData && q.coordinateData.points) {
            // Coordinate multi-answer questions
            const points = q.coordinateData.points;
            let allCorrect = true;

            points.forEach((point, pidx) => {
                const input = document.getElementById(`ws_coord_${idx}_${pidx}`);
                if (!input) return;

                const userValue = input.value.trim().replace(/\s/g, '');
                const match = userValue.match(/\(?(-?\d+)[,\s]+(-?\d+)\)?/);
                let pointCorrect = false;

                if (match) {
                    const userX = parseInt(match[1]);
                    const userY = parseInt(match[2]);
                    pointCorrect = userX === point.x && userY === point.y;
                }

                // Style the input
                input.style.borderColor = pointCorrect ? "var(--correct)" : "var(--incorrect)";
                input.style.background = pointCorrect ? "rgba(6,214,160,0.3)" : "rgba(239,71,111,0.15)";

                // Show correct answer if wrong
                if (!pointCorrect) {
                    input.value = `(${point.x}, ${point.y})`;
                }

                if (!pointCorrect) allCorrect = false;
            });

            isCorrect = allCorrect;
        } else if (q.answerType === "coord-input" && q.coordinateData && q.coordinateData.points) {
            // Coord-input: separate X/Y boxes per point
            const points = q.coordinateData.points;
            let allCorrect = true;
            points.forEach((point, pidx) => {
                const xIn = document.getElementById(`ws_ciX_${idx}_${pidx}`);
                const yIn = document.getElementById(`ws_ciY_${idx}_${pidx}`);
                if (!xIn || !yIn) return;
                const ux = xIn.value.trim();
                const uy = yIn.value.trim();
                const ucX = /^-?\d+$/.test(ux) ? parseInt(ux, 10) : NaN;
                const ucY = /^-?\d+$/.test(uy) ? parseInt(uy, 10) : NaN;
                const xCorrect = !isNaN(ucX) && ucX === point.x;
                const yCorrect = !isNaN(ucY) && ucY === point.y;
                xIn.classList.remove('flash-correct', 'flash-wrong');
                yIn.classList.remove('flash-correct', 'flash-wrong');
                xIn.classList.add(xCorrect ? 'flash-correct' : 'flash-wrong');
                yIn.classList.add(yCorrect ? 'flash-correct' : 'flash-wrong');
                if (!xCorrect) xIn.value = String(point.x);
                if (!yCorrect) yIn.value = String(point.y);
                if (!xCorrect || !yCorrect) allCorrect = false;
            });
            isCorrect = allCorrect;
        } else if (q.isDndGeneric || q.answerType === "dnd-generic") {
            // Dnd-generic: card already records grade-on-submit (the widget's
            // Submit button). For ungraded cards reveal the correct grouping
            // via _wsDndReveal and append a "no answer submitted" note.
            // Graded cards return their stored verdict.
            const stored = worksheetDndState.get(idx);
            const host = document.getElementById(`wsDndHost_${idx}`);
            if (stored && stored.submitted) {
                isCorrect = !!stored.isCorrect;
            } else {
                isCorrect = false;
                if (host) {
                    _wsDndReveal(q, host);
                    if (!host.querySelector('.ws-dnd-ungraded-note')) {
                        const note = document.createElement('div');
                        note.className = 'ws-dnd-ungraded-note';
                        note.style.cssText = 'margin-top:6px;font-size:0.85rem;color:var(--text-dim);font-style:italic;text-align:center;';
                        note.textContent = 'No answer submitted.';
                        host.appendChild(note);
                    }
                }
            }
        } else if (q.isDragFill || q.answerType === "drag-fill") {
            // Drag-fill: card already records grade-on-submit (the widget's
            // Check button). For ungraded cards reveal the correct fills via
            // _wsDfReveal and append a "no answer submitted" note. Graded
            // cards return their stored verdict.
            const stored = worksheetDragFillState.get(idx);
            const host = document.getElementById(`wsDfHost_${idx}`);
            if (stored && stored.submitted) {
                isCorrect = !!stored.isCorrect;
            } else {
                isCorrect = false;
                if (host) {
                    _wsDfReveal(q, host);
                    if (!host.querySelector('.ws-df-ungraded-note')) {
                        const note = document.createElement('div');
                        note.className = 'ws-df-ungraded-note';
                        note.style.cssText = 'margin-top:6px;font-size:0.85rem;color:var(--text-dim);font-style:italic;text-align:center;';
                        note.textContent = 'No answer submitted.';
                        host.appendChild(note);
                    }
                }
            }
        } else if (q.isClockSet || q.answerType === "clock-set") {
            // Clock-set: card records grade-on-submit when student clicks the
            // widget's Submit button. For ungraded cards (student never clicked
            // Submit) auto-set the clock to the correct time, lock interaction,
            // flash red, and append a "no answer submitted" note. Graded cards
            // return their stored verdict.
            const stored = worksheetClockSetState.get(idx);
            const host = document.getElementById(`wsCsHost_${idx}`);
            if (stored && stored.submitted) {
                isCorrect = !!stored.isCorrect;
            } else {
                isCorrect = false;
                if (host) {
                    // Set the widget's hands and readouts to the correct time
                    // by directly mutating the rendered SVG. The widget exposes
                    // no public setter, so we recompute hand endpoints inline
                    // (matches widget constants: SVG_SIZE 240, RADIUS 110,
                    // HOUR_HAND_LEN 55, MIN_HAND_LEN 88).
                    const want = (q && q.ans && typeof q.ans === 'object') ? q.ans : { hour: 0, minute: 0 };
                    const wantH = ((want.hour | 0) % 12 + 12) % 12;
                    const wantM = ((want.minute | 0) % 60 + 60) % 60;
                    const SVG_CENTER = 120;
                    const HOUR_LEN = 55;
                    const MIN_LEN = 88;
                    const hAngle = (wantH % 12) * 30 + (wantM / 60) * 30;
                    const mAngle = wantM * 6;
                    const hRad = (hAngle - 90) * Math.PI / 180;
                    const mRad = (mAngle - 90) * Math.PI / 180;
                    const hourHand = host.querySelector('.cs-hand.cs-hour');
                    const minuteHand = host.querySelector('.cs-hand.cs-minute');
                    if (hourHand) {
                        hourHand.setAttribute('x2', SVG_CENTER + HOUR_LEN * Math.cos(hRad));
                        hourHand.setAttribute('y2', SVG_CENTER + HOUR_LEN * Math.sin(hRad));
                        hourHand.setAttribute('aria-valuenow', String(wantH));
                        hourHand.style.pointerEvents = 'none';
                        hourHand.setAttribute('tabindex', '-1');
                    }
                    if (minuteHand) {
                        minuteHand.setAttribute('x2', SVG_CENTER + MIN_LEN * Math.cos(mRad));
                        minuteHand.setAttribute('y2', SVG_CENTER + MIN_LEN * Math.sin(mRad));
                        minuteHand.setAttribute('aria-valuenow', String(wantM));
                        minuteHand.style.pointerEvents = 'none';
                        minuteHand.setAttribute('tabindex', '-1');
                    }
                    const dh = wantH % 12 === 0 ? 12 : wantH % 12;
                    const hourReadout = host.querySelector('[data-role="hour-readout"]');
                    const minuteReadout = host.querySelector('[data-role="minute-readout"]');
                    const digitalEl = host.querySelector('[data-role="digital"]');
                    if (hourReadout) hourReadout.textContent = String(dh);
                    if (minuteReadout) minuteReadout.textContent = wantM.toString().padStart(2, '0');
                    if (digitalEl) digitalEl.textContent = `${dh}:${wantM.toString().padStart(2, '0')}`;

                    // Disable submit + +/- controls so the now-revealed time
                    // can't be altered.
                    const submitBtn = host.querySelector('.cs-submit');
                    if (submitBtn) submitBtn.disabled = true;
                    host.querySelectorAll('.cs-btn').forEach(b => { b.disabled = true; });

                    // Red flash on the clock face to mark this card wrong.
                    const csHost = host.querySelector('.cs-host');
                    if (csHost && typeof csHost._csFlash === 'function') {
                        csHost._csFlash(false);
                    } else {
                        const clock = host.querySelector('.cs-clock');
                        if (clock) clock.classList.add('flash-wrong');
                    }

                    // Inline note explaining the lockout.
                    if (!host.querySelector('.ws-cs-ungraded-note')) {
                        const note = document.createElement('div');
                        note.className = 'ws-cs-ungraded-note';
                        note.style.cssText = 'margin-top:6px;font-size:0.85rem;color:var(--text-dim);font-style:italic;text-align:center;';
                        note.textContent = `No answer submitted — correct time was ${dh}:${wantM.toString().padStart(2, '0')}.`;
                        host.appendChild(note);
                    }
                }
            }
        } else if (q.isMultiSelectCheck || q.answerType === "multi-select-check") {
            // Multi-select-check: card already records grade-on-submit. For
            // ungraded cards (student never clicked Submit) reveal the correct
            // set via flash classes and append a "no answer" note. Graded
            // cards return their stored verdict.
            const stored = worksheetMscState.get(idx);
            const host = document.getElementById(`wsMscHost_${idx}`);
            if (stored && stored.submitted) {
                isCorrect = !!stored.isCorrect;
            } else {
                isCorrect = false;
                if (host) {
                    const correctSet = new Set(q.ans || []);
                    host.querySelectorAll('.msc-opt').forEach(el => {
                        const id = el.dataset.id;
                        if (correctSet.has(id)) el.classList.add('correct-flash');
                        el.disabled = true;
                    });
                    const submit = host.querySelector('.msc-submit');
                    if (submit) submit.disabled = true;
                    if (!host.querySelector('.ws-msc-ungraded-note')) {
                        const note = document.createElement('div');
                        note.className = 'ws-msc-ungraded-note';
                        note.style.cssText = 'margin-top:6px;font-size:0.85rem;color:var(--text-dim);font-style:italic;text-align:center;';
                        note.textContent = 'No answer submitted.';
                        host.appendChild(note);
                    }
                }
            }
        } else if (q.isMultipleChoice || q.answerType === "multiple-choice" || q.answerType === "choice") {
            // Multiple-choice: card already records grade-on-click. For ungraded
            // cards (student left blank) reveal the correct option; for graded
            // cards count whichever button was selected.
            const optsWrap = card.querySelector('.ws-mc-options');
            if (optsWrap) {
                const allButtons = Array.from(optsWrap.querySelectorAll('.ws-mc-option'));
                const opts = _wsNormalizeOptions(q.options, q.ans);
                const chosenCorrect = optsWrap.querySelector('.ws-mc-option.selected.correct');
                const chosenIncorrect = optsWrap.querySelector('.ws-mc-option.selected.incorrect');

                if (chosenCorrect) {
                    isCorrect = true;
                } else {
                    isCorrect = false;
                    // Highlight correct answer if not already shown.
                    if (!optsWrap.querySelector('.ws-mc-option.correct, .ws-mc-option.correct-answer')) {
                        const correctBtn = allButtons.find(b => {
                            const lbl = b.dataset.label || b.textContent || '';
                            const m = opts.find(o => normalizeText(o.label) === normalizeText(lbl));
                            return m && m.correct;
                        });
                        if (correctBtn) correctBtn.classList.add('correct-answer');
                    }
                    // Lock buttons so post-grading clicks don't change state.
                    allButtons.forEach(b => { b.disabled = true; });
                    optsWrap.dataset.graded = '1';
                    if (!chosenIncorrect) {
                        // Append explanatory note for ungraded cards.
                        if (!card.querySelector('.ws-mc-ungraded-note')) {
                            const note = document.createElement('div');
                            note.className = 'ws-mc-ungraded-note';
                            note.style.cssText = 'margin-top:6px;font-size:0.85rem;color:var(--text-dim);font-style:italic;';
                            note.textContent = 'No answer selected.';
                            optsWrap.appendChild(note);
                        }
                    }
                }
            }
        } else {
            // Regular input
            const input = document.getElementById(`ws_input_${idx}`);
            if (!input) return;
            value = input.value;
            // Strip commas from user input before comparing
            const cleanedValue = value.replace(/,/g, "");
            if (q.answerType === "number" || typeof q.ans === "number") {
                isCorrect = Number(cleanedValue) === Number(q.ans);
            } else if (isTimeSkill(state.skill)) {
                isCorrect = timeAnswersMatch(value, q.ans, state.skill);
            } else {
                isCorrect = normalizeText(value) === normalizeText(q.ans);
            }

            // Style the input
            input.style.borderColor = isCorrect ? "var(--correct)" : "var(--incorrect)";
            input.style.background = isCorrect ? "rgba(6,214,160,0.25)" : "rgba(239,71,111,0.15)";

            // If wrong, show correct answer in the input box
            if (!isCorrect) {
                const displayAnswer = typeof q.ans === "number" && Number.isInteger(q.ans) ? q.ans.toLocaleString() : q.ans;
                input.value = displayAnswer;
            }
        }

        // Style the entire card
        if (isCorrect) {
            card.style.background = "rgba(6,214,160,0.15)";
            card.style.borderColor = "var(--correct)";
            card.style.border = "2px solid var(--correct)";
        } else {
            card.style.background = "rgba(239,71,111,0.08)";
            card.style.border = "2px solid var(--incorrect)";
        }

        if (isCorrect) correct++;
    });

    // Skipped problems are excluded from the denominator so percent reflects
    // only attempted answers. They're surfaced separately as "Skipped: N".
    const total = totalAll - skipped;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const isPassing = percentage >= 80;

    // Save to session history
    saveWorksheetToHistory(correct, total, isPassing);

    // Show big flashing score (pass skipped count for breakdown).
    showWorksheetScore(correct, total, isPassing, skipped);

    const skipNote = skipped > 0
        ? ` <span style="color:var(--accent-cyan); font-size:1rem;">• Skipped: ${skipped}</span>`
        : '';
    document.getElementById("worksheetResult").innerHTML = `
        <span style="color:${isPassing ? 'var(--correct)' : 'var(--incorrect)'}; font-size:1.3rem;">
            Score: ${correct}/${total} (${percentage}%)
        </span>${skipNote}
    `;

    if (total > 0 && correct === total) confetti();
}

// Check dual-answer worksheet problems (perimeter + area)
export function checkWorksheetDualAnswer(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    const perimeterInput = document.getElementById(`ws_perimeter_${idx}`);
    const areaInput = document.getElementById(`ws_area_${idx}`);
    
    if (!card || !perimeterInput || !areaInput || !q.dualAnswers) return;

    const pVal = perimeterInput.value.trim();
    const aVal = areaInput.value.trim();

    if (pVal === '' && aVal === '') {
        // Reset if both empty
        card.style.background = "var(--bg-card)";
        card.style.border = "2px solid transparent";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        perimeterInput.style.borderColor = "";
        perimeterInput.style.background = "";
        areaInput.style.borderColor = "";
        areaInput.style.background = "";
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // Wait until both inputs are filled before grading
    if (pVal === '' || aVal === '') return;

    const userPerimeter = parseFloat(pVal);
    const userArea = parseFloat(aVal);
    const correctPerimeter = q.dualAnswers.perimeter;
    const correctArea = q.dualAnswers.area;

    const perimeterCorrect = !isNaN(userPerimeter) && userPerimeter === correctPerimeter;
    const areaCorrect = !isNaN(userArea) && userArea === correctArea;

    if (perimeterCorrect && areaCorrect) {
        card.style.background = "rgba(6,214,160,0.15)";
        card.style.border = "2px solid var(--correct)";
        card.style.boxShadow = "0 0 15px rgba(6,214,160,0.4)";
        perimeterInput.style.borderColor = "var(--correct)";
        perimeterInput.style.background = "rgba(6,214,160,0.2)";
        areaInput.style.borderColor = "var(--correct)";
        areaInput.style.background = "rgba(6,214,160,0.2)";

        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // Both filled but not both correct - show wrong styling
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        perimeterInput.style.borderColor = perimeterCorrect ? "var(--correct)" : "var(--incorrect)";
        perimeterInput.style.background = perimeterCorrect ? "rgba(6,214,160,0.2)" : "rgba(239,71,111,0.15)";
        areaInput.style.borderColor = areaCorrect ? "var(--correct)" : "var(--incorrect)";
        areaInput.style.background = areaCorrect ? "rgba(6,214,160,0.2)" : "rgba(239,71,111,0.15)";
        wsRecordAnswer(idx, false);
    }
}

// Check coordinate multi-answer worksheet problems
export function checkWorksheetCoordinateAnswer(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    
    if (!card || !q.coordinateData || !q.coordinateData.points) return;

    const points = q.coordinateData.points;
    let anyFilled = false;

    // Check if all coordinate inputs are filled
    const allFilled = points.every((point, pidx) => {
        const input = document.getElementById(`ws_coord_${idx}_${pidx}`);
        if (input && input.value.trim() !== '') anyFilled = true;
        return input && input.value.trim() !== '';
    });

    if (!anyFilled) {
        // Reset if all empty
        card.style.background = "var(--bg-card)";
        card.style.border = "2px solid transparent";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        points.forEach((point, pidx) => {
            const input = document.getElementById(`ws_coord_${idx}_${pidx}`);
            if (input) { input.style.borderColor = ""; input.style.background = ""; }
        });
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // Wait until all inputs are filled before grading
    if (!allFilled) return;

    let allCorrect = true;
    points.forEach((point, pidx) => {
        const input = document.getElementById(`ws_coord_${idx}_${pidx}`);
        if (!input) return;

        const userValue = input.value.trim().replace(/\s/g, '');
        const match = userValue.match(/\(?(-?\d+)[,\s]+(-?\d+)\)?/);
        let isCorrect = false;

        if (match) {
            const userX = parseInt(match[1]);
            const userY = parseInt(match[2]);
            isCorrect = userX === point.x && userY === point.y;
        }

        input.style.borderColor = isCorrect ? "var(--correct)" : "var(--incorrect)";
        input.style.background = isCorrect ? "rgba(6,214,160,0.2)" : "rgba(239,71,111,0.15)";

        if (!isCorrect) allCorrect = false;
    });

    if (allCorrect) {
        card.style.background = "rgba(6,214,160,0.15)";
        card.style.border = "2px solid var(--correct)";
        card.style.boxShadow = "0 0 15px rgba(6,214,160,0.4)";

        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        wsRecordAnswer(idx, false);
    }
}

// Check area model multiplication inputs (each cell turns green when correct)
export function checkAreaModelInput(input, idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    
    if (!card || !input) return;
    
    const userVal = input.value.trim().replace(/,/g, '');
    const correctVal = input.dataset.answer;
    
    if (userVal === '') {
        // Reset this input to default
        input.style.borderColor = input.classList.contains('area-model-total') ? 'var(--accent-green)' : '#fff';
        input.style.background = input.classList.contains('area-model-total') ? 'var(--bg-card-light)' : 'rgba(255,255,255,0.9)';
        input.style.color = '';
    } else if (userVal === correctVal) {
        // Individual cell correct — turn green immediately
        input.style.borderColor = 'var(--correct)';
        input.style.background = 'rgba(6,214,160,0.3)';
        input.style.color = '#065f46';
    } else {
        // Individual cell wrong — reset to default (no red until all filled)
        input.style.borderColor = input.classList.contains('area-model-total') ? 'var(--accent-green)' : '#fff';
        input.style.background = input.classList.contains('area-model-total') ? 'var(--bg-card-light)' : 'rgba(255,255,255,0.9)';
        input.style.color = '';
    }

    // Check if ALL inputs in this card are filled
    const allInputs = card.querySelectorAll('.area-model-input, .area-model-total');
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

    // Wait until all inputs are filled before grading
    if (!allFilled) {
        card.style.background = "var(--bg-card)";
        card.style.border = "none";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    if (allCorrectOverall) {
        // All correct - celebrate!
        card.style.background = "linear-gradient(135deg, rgba(6,214,160,0.25), rgba(0,191,165,0.15))";
        card.style.border = "3px solid var(--correct)";
        card.style.boxShadow = "0 6px 20px rgba(6,214,160,0.3)";

        allInputs.forEach(inp => {
            inp.style.borderColor = 'var(--correct)';
            inp.style.background = 'rgba(6,214,160,0.3)';
            inp.style.color = '#065f46';
        });

        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        // All filled but not all correct - show wrong styling
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";

        wsRecordAnswer(idx, false);
        allInputs.forEach(inp => {
            const val = inp.value.trim().replace(/,/g, '');
            const correct = inp.dataset.answer;
            if (val === correct) {
                inp.style.borderColor = 'var(--correct)';
                inp.style.background = 'rgba(6,214,160,0.3)';
                inp.style.color = '#065f46';
            } else {
                inp.style.borderColor = 'var(--incorrect)';
                inp.style.background = 'rgba(239,71,111,0.2)';
                inp.style.color = '#991b1b';
            }
        });
    }
}

// Check number family worksheet problems
export function checkWorksheetNumberFamily(idx) {
    const q = state.worksheetQs[idx];
    const card = document.getElementById(`ws_card_${idx}`);
    
    if (!card) return;
    
    // Find all number family inputs in this card
    const inputs = card.querySelectorAll('.ws-number-family-input, .ws-fact-family-input');
    if (inputs.length === 0) return;
    
    let anyFilled = false;
    let allFilled = true;

    inputs.forEach(input => {
        if (input.value.trim() !== '') anyFilled = true;
        else allFilled = false;
    });

    // Update feedback div if it exists
    const feedbackDiv = card.querySelector(`[id^="ws_numberFamilyFeedback"]`);

    // Give per-cell green feedback immediately for correct answers
    inputs.forEach(input => {
        const val = input.value.trim();
        const correct = input.dataset.answer;
        if (val === '') {
            input.style.borderColor = 'var(--accent-cyan)';
            input.style.background = 'var(--bg-card-light)';
        } else if (val === correct) {
            input.style.borderColor = 'var(--correct)';
            input.style.background = 'rgba(6,214,160,0.2)';
        } else {
            // Wrong but not all filled yet — keep neutral
            input.style.borderColor = 'var(--accent-cyan)';
            input.style.background = 'var(--bg-card-light)';
        }
    });

    if (!anyFilled) {
        // Reset card if all empty
        card.style.background = "var(--bg-card)";
        card.style.border = "2px solid transparent";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        if (feedbackDiv) feedbackDiv.innerHTML = '';
        worksheetConfettiTriggered.delete(idx);
        return;
    }

    // Wait until all inputs are filled before full grading
    if (!allFilled) return;

    let allCorrect = true;
    let correctCount = 0;

    inputs.forEach(input => {
        const userVal = input.value.trim();
        const correctVal = input.dataset.answer;

        if (userVal === correctVal) {
            correctCount++;
            input.style.borderColor = 'var(--correct)';
            input.style.background = 'rgba(6,214,160,0.2)';
        } else {
            allCorrect = false;
            input.style.borderColor = 'var(--incorrect)';
            input.style.background = 'rgba(239,71,111,0.15)';
        }
    });

    if (feedbackDiv) {
        if (allCorrect) {
            feedbackDiv.innerHTML = `<span style="color:var(--correct);">Perfect! All answers correct!</span>`;
        } else {
            feedbackDiv.innerHTML = `<span style="color:var(--accent-orange);">${correctCount}/${inputs.length} correct</span>`;
        }
    }

    if (allCorrect) {
        card.style.background = "rgba(6,214,160,0.15)";
        card.style.border = "2px solid var(--correct)";
        card.style.boxShadow = "0 0 15px rgba(6,214,160,0.4)";

        wsRecordAnswer(idx, true);
        if (!worksheetConfettiTriggered.has(idx)) {
            worksheetConfettiTriggered.add(idx);
            confetti(15);
            setTimeout(() => advanceToNextProblem(idx), 400);
        }
    } else {
        card.style.background = "rgba(239,71,111,0.08)";
        card.style.border = "2px solid var(--incorrect)";
        card.style.boxShadow = "0 6px 16px rgba(0,0,0,0.08)";
        wsRecordAnswer(idx, false);
    }
}

export function showWorksheetScore(correct, total, isPassing, skipped = 0) {
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const gameDescription = getGameDescriptionText();
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;

    const bannerColor = isPassing
        ? "linear-gradient(135deg, #06D6A0, #00BFA5)"
        : "linear-gradient(135deg, #EF476F, #C1121F)";

    const emoji = isPassing ? "🎉" : "📚";
    const message = isPassing ? "Great Job!" : "Keep Practicing!";
    const bannerText = isPassing ? "🏆 PASSED! 🏆" : "📝 TRY AGAIN 📝";

    overlay.innerHTML = `
        <div style="
            background: var(--bg-card);
            padding: 32px 40px;
            border-radius: 24px;
            text-align: center;
            max-width: 420px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            animation: scorePopIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        ">
            <div style="background:${bannerColor};color:white;padding:14px 20px;border-radius:14px;margin-bottom:16px;font-size:1.5rem;font-weight:900;text-shadow:2px 2px 4px rgba(0,0,0,0.3);">
                ${bannerText}
            </div>
            <div style="font-size: 3rem; margin-bottom: 8px;">${emoji}</div>
            <div style="font-size: 3.5rem; font-weight: 900; color: var(--text-bright); margin-bottom: 8px;">
                ${correct}/${total}
            </div>
            <div style="font-size: 1.8rem; font-weight: 800; color: ${isPassing ? 'var(--correct)' : 'var(--incorrect)'}; margin-bottom: 12px;">
                ${percentage}%
            </div>
            ${skipped > 0 ? `<div style="font-size:1rem;font-weight:700;color:var(--accent-cyan);margin-bottom:8px;">⏭ Skipped: ${skipped}</div>` : ''}
            <div style="background:var(--bg-card-light);padding:12px 20px;border-radius:12px;margin-bottom:16px;">
                <p style="font-size:0.85rem;font-weight:700;color:var(--text-dim);margin-bottom:4px;">Challenge</p>
                <p style="font-size:1rem;font-weight:800;color:var(--accent-cyan);">${gameDescription}</p>
            </div>
            <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-dim); margin-bottom: 20px;">
                ${message}
            </div>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
                <button class="btn btn-primary" id="wsPlayAgainBtn" style="padding:14px 28px;font-size:1rem;">🔄 New Worksheet</button>
                <button class="btn btn-secondary" id="wsHomeBtn" style="padding:14px 28px;font-size:1rem;">🏠 Home</button>
            </div>
        </div>
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scorePopIn {
                0% { transform: scale(0.5); opacity: 0; }
                70% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
        </style>
    `;

    document.body.appendChild(overlay);

    // Button handlers
    overlay.querySelector("#wsPlayAgainBtn").onclick = () => {
        overlay.remove();
        newWorksheet();
    };

    overlay.querySelector("#wsHomeBtn").onclick = () => {
        overlay.remove();
        showView("homeView");
    };
}

