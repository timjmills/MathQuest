import { state } from './state.js';
import { getSkillGrade, gradeCircleHTML } from './data.js';
import { trackSkillAnswer, resetAttemptTracking } from './answer-check.js';

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

// ===== Click-to-enlarge zoom modal helpers =====
// Opens an overlay containing a copy of the supplied innerHTML at ~90%
// viewport. Click outside the content or press Esc to close.
function openZoomModal(content) {
    // Don't stack overlays — close any existing one first.
    document.querySelectorAll('.zoom-overlay').forEach(o => o.remove());

    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'zoom-close';
    closeBtn.type = 'button';
    closeBtn.textContent = '✕ Close';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'zoom-content';
    contentDiv.innerHTML = content;

    overlay.appendChild(closeBtn);
    overlay.appendChild(contentDiv);

    function dispose() {
        document.removeEventListener('keydown', escClose);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }
    function escClose(e) {
        if (e.key === 'Escape') dispose();
    }

    closeBtn.addEventListener('click', dispose);
    overlay.addEventListener('click', e => {
        // Close when clicking the backdrop (not the white content card).
        if (e.target === overlay) dispose();
    });
    document.addEventListener('keydown', escClose);

    document.body.appendChild(overlay);
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

    const clickIsAnswerTypes = [
        'hot-spot',
        'multi-select-check',
        'fraction-bar-shade',
        'ten-frame',
        'clock-set',
        'coord-plot',
        'coord-input',
        'dnd-generic'
    ];
    const clickIsAnswer = q && q.answerType && clickIsAnswerTypes.includes(q.answerType);

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
            const html = buildZoomHTML();
            if (html && html.trim()) openZoomModal(html);
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
            if (html && html.trim()) openZoomModal(html);
        };
    }
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
    card.classList.remove("correct-bg", "incorrect-bg", "q-slide-out", "q-slide-in");

    // Wrong-answer retry: clear any cross-outs / Skip button / attempt chips
    // from the previous question (Practice + MAP Practice modes use this).
    resetAttemptTracking();

    document.getElementById("qNum").innerText = `Q${state.qCount}`;

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
    
    // Check if this is a facts-column-visual (vertical format replaces horizontal text)
    const isFactsColumnVisual = q.visual && q.visual.includes('facts-column-visual');
    const questionTextEl = document.getElementById("questionText");

    if (isFactsColumnVisual) {
        // For vertical facts format, hide the horizontal text - the visual IS the question
        questionTextEl.innerText = '';
        questionTextEl.style.display = 'none';
    } else {
        // Render q.text as HTML so we can transform literal ___ placeholders
        // into a styled inline answer blank. Question text is generated by our
        // own code (not user input), so this is XSS-safe.
        questionTextEl.innerHTML = formatQuestionTextForScreen(q.text);
        questionTextEl.style.display = '';
    }

    const visualAid = document.getElementById("visualAid");

    // Determine if this question type REQUIRES visual display (regardless of difficulty)
    const requiresVisual = q.visual && (
        q.answerType === "area-model" ||
        q.answerType === "tchart-drag" ||
        q.answerType === "number-family" ||
        q.answerType === "fact-family" ||
        q.answerType === "dual" ||
        q.answerType === "dual-fraction" ||
        q.answerType === "coordinate-multi" ||
        q.answerType === "coord-input" ||
        q.answerType === "divisibility-sort" ||
        q.answerType === "number-line-place" ||
        q.answerType === "odd-even-select" ||
        q.answerType === "multi-select-check" ||
        q.answerType === "ten-frame" ||
        q.answerType === "dnd-generic" ||
        q.answerType === "hot-spot" ||
        q.answerType === "numpad-input" ||
        q.answerType === "number-line-extended" ||
        q.answerType === "clock-set" ||
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
    } else {
        visualAid.style.display = "none";
    }

    // Layout opt-out: dual / dual-fraction / area-model / number-family / fact-family
    // / tchart-drag / divisibility-sort all bundle their inputs INSIDE q.visual,
    // so the side-by-side grid would trap the inputs in the left column. Force
    // the question card to single-column layout for these types.
    const _qCard = document.getElementById("questionCard");
    if (_qCard) {
        const fullWidthTypes = ['dual', 'dual-fraction', 'area-model',
            'number-family', 'fact-family', 'tchart-drag',
            'divisibility-sort', 'coordinate-multi'];
        if (fullWidthTypes.includes(q.answerType)) {
            _qCard.classList.add('full-width-answer');
        } else {
            _qCard.classList.remove('full-width-answer');
        }
    }

    // Schedule click-to-enlarge / magnifier-icon attachment AFTER all sync
    // answer-type branches below run (some re-set visualAid.innerHTML) AND
    // after async widget host renders (multi-select, ten-frame, hot-spot,
    // numpad, dnd-generic, clock-set) finish mounting their content via
    // dynamic import().then(). 200ms is enough headroom for the imports.
    setTimeout(() => attachZoomBehavior(visualAid, q), 200);

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

        // Attach completion listeners to number-family / fact-family inputs.
        // Listen on `input` (every keystroke), `change` (final commit) and
        // `blur` (focus loss) so completion is detected reliably even when
        // the user pastes, uses autofill, or defocuses the last cell without
        // typing a final keystroke that fires `input`.
        const attachNFListeners = () => {
            const nfInputs = visualAid.querySelectorAll('.number-family-input, .fact-family-input');
            nfInputs.forEach(input => {
                if (input.dataset._nfListenerAttached === '1') return;
                input.dataset._nfListenerAttached = '1';
                const handler = () => checkNumberFamilyAnswer();
                input.addEventListener('input', handler);
                input.addEventListener('change', handler);
                input.addEventListener('blur', handler);
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
            mod.renderMultiSelectCheck(q, host);
            mod.setOnMultiSelectSubmit((qq, selectedIds) => {
                const correct = mod.checkMultiSelectCheck(qq, selectedIds);
                // Visual feedback: paint each option per its truth/selection
                const correctSet = new Set(qq.ans || []);
                const selectedSet = new Set(selectedIds);
                host.querySelectorAll('.msc-opt').forEach(el => {
                    const id = el.dataset.id;
                    const sel = selectedSet.has(id);
                    const isAnswer = correctSet.has(id);
                    if (sel && isAnswer) el.classList.add('correct-flash');
                    else if (sel && !isAnswer) el.classList.add('wrong-flash');
                    else if (!sel && isAnswer) el.classList.add('wrong-flash');
                });

                // Surface result via feedbackArea
                const feedback = document.getElementById("feedbackArea");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area " + (correct ? "correct" : "incorrect");
                    feedback.innerHTML = correct
                        ? "🎉 Correct!"
                        : "Not quite. Selected items are highlighted.";
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
            mod.renderDndGeneric(q, host);
            mod.setOnDndSubmit((qq, st) => {
                const correct = mod.checkDndGeneric(qq, st);

                // Visual feedback: paint each placed tile per its truth
                if (qq.dndMode === 'categorize') {
                    const ans = qq.ans || {};
                    host.querySelectorAll('.dnd-bin .dnd-tile').forEach(el => {
                        const tid = el.dataset.id;
                        const placedBin = el.closest('.dnd-bin')?.dataset.bin;
                        const goodBin = ans[tid];
                        if (placedBin === goodBin) el.classList.add('correct-flash');
                        else el.classList.add('wrong-flash');
                    });
                } else {
                    // order
                    const ansArr = Array.isArray(qq.ans) ? qq.ans : [];
                    host.querySelectorAll('.dnd-slot').forEach((slot, i) => {
                        const tile = slot.querySelector('.dnd-tile');
                        if (!tile) return;
                        if (tile.dataset.id === ansArr[i]) tile.classList.add('correct-flash');
                        else tile.classList.add('wrong-flash');
                    });
                }

                const feedback = document.getElementById("feedbackArea");
                if (feedback) {
                    feedback.style.display = "block";
                    feedback.className = "feedback-area " + (correct ? "correct" : "incorrect");
                    feedback.innerHTML = correct
                        ? "🎉 Correct!"
                        : "Not quite. Tiles in the wrong place are highlighted.";
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
        }).catch(err => console.error('Failed to load dnd-generic widget:', err));

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

    // Check for coord-input mode (separate X/Y boxes with pre-rendered parens+comma).
    // The visual already contains the inputs + a Check button (built in gen-geometry.js).
    // Hide the standard answer input area; the in-visual button calls submitAnswer().
    if (q.answerType === "coord-input") {
        document.getElementById("answerOptions").style.display = "none";
        document.getElementById("answerInputArea").style.display = "none";
        visualAid.style.display = "block";
        visualAid.innerHTML = q.visual;
        document.getElementById("feedbackArea").style.display = "none";
        document.getElementById("feedbackArea").className = "feedback-area";
        document.getElementById("hintBtn").style.display = "inline-block";
        hideNextButton();

        // Auto-focus the first x input and wire Enter-key submit / cross-input arrow nav
        setTimeout(() => {
            const firstX = visualAid.querySelector('.ci-x');
            if (firstX) firstX.focus();
            const ciInputs = visualAid.querySelectorAll('.ci-x, .ci-y');
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
        if (state.ttsEnabled) speakQuestion();
        return;
    }

    const useMultipleChoice = q.options.length > 0;
    const isClockChoice = q.answerType === "clock-choice";
    const hideInput = useMultipleChoice || isClockChoice;
    document.getElementById("answerOptions").style.display = useMultipleChoice ? "grid" : "none";
    document.getElementById("answerInputArea").style.display = hideInput ? "none" : "flex";
    const answerInput = document.getElementById("answerInput");
    answerInput.value = "";
    answerInput.disabled = false;
    answerInput.style.borderColor = "transparent";
    answerInput.style.background = "";
    if (!hideInput) answerInput.focus();
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
            <div style="font-weight:700;margin-bottom:15px;color:var(--text-dim);">${direction}</div>

            <!-- Selected numbers (answer area) -->
            <div style="margin-bottom:20px;">
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:8px;">Your order (click to remove):</div>
                <div id="selectedNumbers" style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;min-height:50px;padding:15px;background:var(--bg-card-light);border-radius:12px;border:2px dashed var(--accent-green);">
                    <span style="color:var(--text-dim);font-style:italic;" id="orderPlaceholder">Click numbers below to place them here...</span>
                </div>
            </div>

            <!-- Available numbers -->
            <div>
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:8px;">Available numbers:</div>
                <div id="availableNumbers" style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                    ${q.numbers.map(n => `<div class="order-num-btn" onclick="selectOrderNumber(${n})" style="background:var(--accent-cyan);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">${n.toLocaleString()}</div>`).join("")}
                </div>
            </div>

            <!-- Check button -->
            <button class="btn btn-primary" id="checkOrderBtn" onclick="checkOrderingAnswer()" style="margin-top:20px;opacity:0.5;pointer-events:none;">Check Order</button>
        </div>`;
    } else {
        // Input boxes mode
        return `<div style="text-align:center;">
            <div style="font-weight:700;margin-bottom:15px;color:var(--text-dim);">${direction}</div>

            <!-- Show the numbers to order -->
            <div style="margin-bottom:20px;">
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Numbers to order:</div>
                <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">
                    ${q.numbers.map(n => `<div style="background:var(--accent-cyan);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;box-shadow:0 4px 12px rgba(0,0,0,0.15);">${n.toLocaleString()}</div>`).join("")}
                </div>
            </div>

            <!-- Input boxes for ordering -->
            <div style="margin-top:20px;">
                <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:10px;">Write each number in order:</div>
                <div id="orderInputBoxes" style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;">
                    ${Array.from({length: numBoxes}, (_, i) => `
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="background:var(--accent-orange);color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;">${i + 1}</span>
                            <input type="text" class="order-input-box" data-order-idx="${i}"
                                style="width:80px;height:44px;text-align:center;font-size:1.1rem;font-weight:700;border:3px solid var(--accent-cyan);border-radius:10px;background:var(--bg-card);color:var(--text-primary);outline:none;"
                                oninput="checkOrderInputsFilled()" placeholder="">
                            ${i < numBoxes - 1 ? '<span style="color:var(--accent-orange);font-size:1.5rem;margin:0 4px;">→</span>' : ''}
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
export function selectOrderNumber(num) {
    if (state.hasAnswered) return;

    const idx = orderingState.available.indexOf(num);
    if (idx > -1) {
        orderingState.available.splice(idx, 1);
        orderingState.selected.push(num);
    }
    updateOrderingUI();
}

export function removeOrderNumber(num) {
    if (state.hasAnswered) return;

    const idx = orderingState.selected.indexOf(num);
    if (idx > -1) {
        orderingState.selected.splice(idx, 1);
        orderingState.available.push(num);
    }
    updateOrderingUI();
}

export function updateOrderingUI() {
    const availableContainer = document.getElementById("availableNumbers");
    const selectedContainer = document.getElementById("selectedNumbers");
    const checkBtn = document.getElementById("checkOrderBtn");

    if (!availableContainer || !selectedContainer) return;

    availableContainer.innerHTML = orderingState.available.map(n =>
        `<div class="order-num-btn" onclick="selectOrderNumber(${n})" style="background:var(--accent-cyan);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 12px rgba(0,0,0,0.15);" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">${n.toLocaleString()}</div>`
    ).join("");

    if (orderingState.selected.length === 0) {
        selectedContainer.innerHTML = '<span style="color:var(--text-dim);font-style:italic;" id="orderPlaceholder">Click numbers below to place them here...</span>';
    } else {
        selectedContainer.innerHTML = orderingState.selected.map((n, i) =>
            `<div onclick="removeOrderNumber(${n})" style="background:var(--accent-green);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;transition:transform 0.2s;position:relative;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <span style="position:absolute;top:-8px;left:-8px;background:var(--accent-orange);width:22px;height:22px;border-radius:50%;font-size:0.75rem;display:flex;align-items:center;justify-content:center;">${i + 1}</span>
                ${n.toLocaleString()}
            </div>`
        ).join('<span style="color:var(--accent-orange);font-size:1.5rem;">→</span>');
    }

    if (checkBtn) {
        const allSelected = orderingState.available.length === 0 && orderingState.selected.length > 0;
        checkBtn.style.opacity = allSelected ? "1" : "0.5";
        checkBtn.style.pointerEvents = allSelected ? "auto" : "none";
    }
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

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        feedback.className = "feedback-area correct";
        feedback.innerHTML = "🎉 Correct! Perfect order!";
        state.score++;
        state.sessionStreak++;
        awardXP(10, 'correct');
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
            setTimeout(() => transitionToNextQuestion(), 750);
        }

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }
        trackSkillAnswer(true);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, true, tm);
        }

        // Disable further interaction
        const checkBtn = document.getElementById("checkOrderBtn");
        if (checkBtn) checkBtn.style.display = "none";
        document.querySelectorAll('.order-input-box').forEach(input => input.disabled = true);
    } else {
        document.getElementById("questionCard").classList.add("incorrect-bg");
        feedback.className = "feedback-area incorrect";
        feedback.innerHTML = "❌ That's not the right order. Try again!";

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }
        trackSkillAnswer(false);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, false, tm);
        }

        // Re-enable for retry after brief delay
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
                        `<div class="ordering-number" onclick="selectOrderNumber(${n})" style="background:var(--accent-purple);color:white;padding:14px 20px;border-radius:12px;font-weight:800;font-size:1.2rem;cursor:pointer;">${n.toLocaleString()}</div>`
                    ).join('');
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
    const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

    return `<div style="text-align:center;">
        <!-- Show the number to expand -->
        <div style="margin-bottom:20px;">
            <div style="font-size:2.5rem;font-weight:900;color:var(--text-primary);">${num.toLocaleString()}</div>
            <div style="font-size:0.9rem;color:var(--text-dim);margin-top:8px;">Write the value of each digit:</div>
        </div>

        <!-- Input boxes for each place value -->
        <div id="expandedInputBoxes" style="display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;">
            ${digits.map((d, i) => {
                const placeIndex = digits.length - i - 1;
                const placeName = placeNames[placeIndex] || `10^${placeIndex}`;
                const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-orange)', 'var(--accent-pink)', 'var(--accent-yellow)'];
                const color = colors[placeIndex] || colors[0];
                return `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;">
                        <div style="background:${color};color:white;padding:6px 12px;border-radius:8px;font-weight:700;font-size:1.3rem;">${d}</div>
                        <div style="font-size:0.7rem;color:var(--text-dim);">${placeName}</div>
                        <input type="text" class="expanded-input-box" data-expanded-idx="${i}"
                            style="width:80px;height:44px;text-align:center;font-size:1rem;font-weight:700;border:3px solid ${color};border-radius:10px;background:var(--bg-card);color:var(--text-primary);outline:none;"
                            oninput="checkExpandedInputsFilled()" placeholder="">
                        ${i < digits.length - 1 ? '<span style="color:var(--text-dim);font-size:1.3rem;margin-top:8px;">+</span>' : ''}
                    </div>
                `;
            }).join("")}
        </div>

        <!-- Check button -->
        <button class="btn btn-primary" id="checkExpandedBtn" onclick="checkExpandedAnswer()" style="margin-top:20px;opacity:0.5;pointer-events:none;">Check Answer</button>
    </div>`;
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

    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";

    if (isCorrect) {
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        feedback.className = "feedback-area correct";
        feedback.innerHTML = "🎉 Correct! Perfect expanded form!";
        state.score++;
        state.sessionStreak++;
        awardXP(10, 'correct');
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

        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 750);
        }

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }
        trackSkillAnswer(true);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, true, tm);
        }

        // Disable further interaction
        const checkBtn = document.getElementById("checkExpandedBtn");
        if (checkBtn) checkBtn.style.display = "none";
        document.querySelectorAll('.expanded-input-box').forEach(input => input.disabled = true);
    } else {
        document.getElementById("questionCard").classList.add("incorrect-bg");
        feedback.className = "feedback-area incorrect";
        feedback.innerHTML = "❌ That's not correct. Try again!";

        // Mark wrong inputs
        const correctValues = q.expandedValues;
        inputs.forEach((input, i) => {
            const val = input.value.trim().replace(/,/g, '').replace(/\s/g, '');
            const userVal = parseInt(val, 10) || 0;
            if (userVal === correctValues[i]) {
                input.style.borderColor = "var(--correct)";
                input.style.background = "rgba(34,197,94,0.1)";
            } else {
                input.style.borderColor = "var(--incorrect)";
                input.style.background = "rgba(239,68,68,0.1)";
            }
        });

        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(false);
        }
        trackSkillAnswer(false);
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, false, tm);
        }

        // Re-enable for retry after brief delay
        state.hasAnswered = true;
        setTimeout(() => {
            document.getElementById("questionCard").classList.remove("incorrect-bg");
            feedback.style.display = "none";
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
            state.hasAnswered = false;
        }, 1500);
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
    
    if (allFilled && allCorrectOverall) {
        // All correct - celebrate!
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        awardXP(20, 'correct_area');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        checkStreakBonus();
        checkSurpriseBonus();
        
        // Update goal progress
        state.totalQuestions++;
        updateDailyGoalProgress(true);
        
        // Disable all inputs
        allInputs.forEach(inp => inp.disabled = true);
        
        // Update game stats banner (area model)
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }
        trackSkillAnswer(true);
        // Record to practice log
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, true, tm);
        }

        // Auto-advance to next question
        if (shouldShowNextButton()) {
            setTimeout(() => transitionToNextQuestion(), 800);
        }
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
    
    if (allFilled && allCorrect) {
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        awardXP(15, 'correct_family');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        checkStreakBonus();
        checkSurpriseBonus();

        // Update game stats banner (number family)
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }
        trackSkillAnswer(true);
        // Record to practice log
        if (typeof window.recordPracticeLog === 'function') {
            const sk = (state.currentQ && state.currentQ.skillId) || state.skill || 'unknown';
            const tm = state.questionStartTime ? Date.now() - state.questionStartTime : 0;
            window.recordPracticeLog(sk, true, tm);
        }

        state.totalQuestions++;
        updateDailyGoalProgress(true);

        inputs.forEach(inp => inp.disabled = true);

        // Auto-advance to next question. Also surface the manual Next button
        // as a backup so the student is never stuck if the auto-advance
        // setTimeout is interrupted (e.g. by a focus event, modal, or stray
        // listener that touches state.lastAnswerCorrect during the 800ms
        // window). Practice / Boss / Race all have a Next button container.
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
    
    if (allCorrect) {
        feedbackDiv.innerHTML = `<span style="color:var(--accent-green);">🎉 Perfect! All answers correct!</span>`;
        state.hasAnswered = true;
        state.lastAnswerCorrect = true;
        state.score++;
        state.sessionStreak++;
        awardXP(15, 'correct_family');
        document.getElementById("gameScore").innerText = `${state.score} Correct`;
        document.getElementById("questionCard").classList.add("correct-bg");
        confetti();
        checkStreakBonus();
        checkSurpriseBonus();

        // Update game stats banner (number family 2)
        if (typeof window !== 'undefined' && window.bannerRecordAnswer) {
            window.bannerRecordAnswer(true);
        }
        trackSkillAnswer(true);

        // Update goal progress
        state.totalQuestions++;
        updateDailyGoalProgress(true);

        // Auto-advance to next question. Also surface the manual Next button
        // as a backup so the student is never stuck if the auto-advance
        // setTimeout is interrupted.
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
        feedbackDiv.innerHTML = `<span style="color:#e53935;">❌ ${correctCount}/${totalInputs} correct. Check the red boxes and try again!</span>`;
        
        // Allow retry - don't mark as answered yet
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

