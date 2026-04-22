import { state } from './state.js';
import { SKILLS } from './data.js';
import { shuffle, normalizeText } from './utils.js';
import { isTimeSkill, timeAnswersMatch } from './answer-check.js';

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

        // Check for facts column visual (read-only vertical format - keeps answer input visible)
        const isFactsColumn = q.visual && q.visual.includes('facts-column-visual');

        // Check for new visual skills where the visual IS the question
        const newVisualSkillFormats = ['arrays-groups', 'mult-properties', 'div-remainders',
            'fraction-of-set', 'equiv-frac-visual', 'area-unit-squares', 'perimeter-grid',
            'reading-ruler', 'money-count', 'line-plot-fractions',
            'tape-diagram', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
            'rounding-visual', 'place-value-disks',
            'fraction-of-set-hard', 'reading-ruler-hard',
            'function-table-easy', 'function-table-hard',
            'nl-add', 'nl-sub', 'nl-mult', 'nl-div',
            'fraction-order', 'fraction-numline-order', 'fraction-benchmark',
            'fraction-compare-lcd', 'fraction-round', 'fraction-estimate',
            'percent-grid', 'percent-of', 'percent-find-whole', 'fdp-order', 'decimal-order',
            'multi-select', 'ten-frame', 'dnd-generic', 'hot-spot'];
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
            'fraction-numline-order', 'dnd-generic', 'hot-spot'];
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
        
        // Check for dual-answer (perimeter+area) questions
        const isDualAnswer = q.answerType === "dual";
        
        // Check for coordinate multi-answer questions
        const isCoordinateMulti = q.answerType === "coordinate-multi";
        
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
        const answerInputStyle = (isVerticalFormat || isFunctionTable || isInteractiveOrdering || isInteractiveExpanded || isTchartDrag || isDualAnswer || isCoordinateMulti || isDivisibilitySort || isNumberFamily) ? 'style="display:none;"' : '';

        // Generate hint content with visual if available
        const hintVisual = q.hintVisual ? `<div class="hint-visual">${q.hintVisual}</div>` : '';
        const hintText = q.hint || 'Think about this problem step by step.';

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

        card.innerHTML = `
            <button class="hint-btn" onclick="toggleHint(${i})" title="Show hint">?</button>
            ${magnifyBtn}
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
            ${questionDisplay}
            <input type="text" class="worksheet-input" id="ws_input_${i}" placeholder="Answer" data-index="${i}" ${answerInputStyle}>
        `;
        grid.appendChild(card);

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

        // Check for facts column visual (read-only vertical format - keeps answer input visible)
        const isFactsColumn = q.visual && q.visual.includes('facts-column-visual');

        // Check for new visual skills where the visual IS the question
        const newVisualSkillFormats = ['arrays-groups', 'mult-properties', 'div-remainders',
            'fraction-of-set', 'equiv-frac-visual', 'area-unit-squares', 'perimeter-grid',
            'reading-ruler', 'money-count', 'line-plot-fractions',
            'tape-diagram', 'multi-step-word', 'skip-count-line', 'skip-count-grid',
            'rounding-visual', 'place-value-disks',
            'fraction-of-set-hard', 'reading-ruler-hard',
            'function-table-easy', 'function-table-hard',
            'nl-add', 'nl-sub', 'nl-mult', 'nl-div',
            'fraction-order', 'fraction-numline-order', 'fraction-benchmark',
            'fraction-compare-lcd', 'fraction-round', 'fraction-estimate',
            'percent-grid', 'percent-of', 'percent-find-whole', 'fdp-order', 'decimal-order',
            'multi-select', 'ten-frame', 'dnd-generic', 'hot-spot'];
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
            'fraction-numline-order', 'dnd-generic', 'hot-spot'];
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
        
        // Check for additional special types
        const isDualAnswer = q.answerType === "dual";
        const isCoordinateMulti = q.answerType === "coordinate-multi";
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

        const answerInputStyle = (isVerticalFormat || isFunctionTable || isInteractiveOrdering || isInteractiveExpanded || isTchartDrag || isDualAnswer || isCoordinateMulti || isDivisibilitySort || isNumberFamily) ? 'style="display:none;"' : '';

        const hintVisual = q.hintVisual ? `<div class="hint-visual">${q.hintVisual}</div>` : '';
        const hintText = q.hint || 'Think about this problem step by step.';

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

        card.innerHTML = `
            <button class="hint-btn" onclick="toggleHint(${i})" title="Show hint">?</button>
            ${magnifyBtn}
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
            ${questionDisplay}
            <input type="text" class="worksheet-input" id="ws_input_${i}" placeholder="Answer" data-index="${i}" ${answerInputStyle}>
        `;
        grid.appendChild(card);

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
    const placeNames = ["ones","tens","hundreds","thousands","ten-thousands","hundred-thousands"];

    return `<div style="text-align:center;">
        <div class="question-line">${q.text}</div>
        <div style="font-size:1.8rem;font-weight:900;color:var(--text-primary);margin:10px 0;">${num.toLocaleString()}</div>
        <div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:10px;">Write the value of each digit:</div>

        <!-- Input boxes for each place value -->
        <div style="display:flex;justify-content:center;align-items:flex-start;gap:6px;flex-wrap:wrap;">
            ${digits.map((d, i) => {
                const placeIndex = digits.length - i - 1;
                const placeName = placeNames[placeIndex] || `10^${placeIndex}`;
                const colors = ['var(--accent-purple)', 'var(--accent-cyan)', 'var(--accent-green)', 'var(--accent-orange)', 'var(--accent-pink)', 'var(--accent-yellow)'];
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
    const total = state.worksheetQs.length;

    state.worksheetQs.forEach((q, idx) => {
        const card = document.getElementById(`ws_card_${idx}`);
        if (!card) return;

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

    // Calculate percentage
    const percentage = Math.round((correct / total) * 100);
    const isPassing = percentage >= 80;

    // Save to session history
    saveWorksheetToHistory(correct, total, isPassing);

    // Show big flashing score
    showWorksheetScore(correct, total, isPassing);

    document.getElementById("worksheetResult").innerHTML = `
        <span style="color:${isPassing ? 'var(--correct)' : 'var(--incorrect)'}; font-size:1.3rem;">
            Score: ${correct}/${total} (${percentage}%)
        </span>
    `;

    if (correct === total) confetti();
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

export function showWorksheetScore(correct, total, isPassing) {
    const percentage = Math.round((correct / total) * 100);
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

