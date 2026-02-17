import { state } from './state.js';
import { DOMAINS, SKILLS } from './data.js';
import { randInt, shuffle } from './utils.js';
import { generateQuestion } from './generate-question.js';
import { formatProblemForPrint } from './print-generate.js';

// ========== SECTION COLORS ==========
const SECTION_COLORS = ['#0891b2', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899'];

// ========== PRINT SECTIONS STATE ==========
// window.printSections = [{ label, columns, problemCount, skills: [] }]

function initPrintSections(skills) {
    window.printSections = [{
        label: 'Section A',
        columns: 2,
        problemCount: 20,
        skills: skills.map(s => ({ ...s }))
    }];
}

function columnsDropdownHTML(id, selected) {
    const opts = [
        [1, '1 Column'], [2, '2 Columns'], [3, '3 Columns'],
        [4, '4 Col (Facts)'], [5, '5 Col (Facts)'], [6, '6 Col (Facts)'],
        [8, '8 Col (Facts)'], [10, '10 Col (Fast Facts)']
    ];
    return `<select id="${id}" class="dropdown" style="width:100%;padding:8px;font-size:0.85rem;">${opts.map(([v, t]) =>
        `<option value="${v}"${v === selected ? ' selected' : ''}>${t}</option>`
    ).join('')}</select>`;
}

function problemCountDropdownHTML(id, selected) {
    const vals = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100];
    return `<select id="${id}" class="dropdown" style="width:100%;padding:8px;font-size:0.85rem;">${vals.map(v =>
        `<option value="${v}"${v === selected ? ' selected' : ''}>${v}</option>`
    ).join('')}</select>`;
}

export function renderPrintSections() {
    const container = document.getElementById('printSectionsContainer');
    if (!container || !window.printSections) return;

    container.innerHTML = window.printSections.map((sec, sIdx) => {
        const color = SECTION_COLORS[sIdx % SECTION_COLORS.length];
        const skillItems = sec.skills.map((sk, skIdx) =>
            `<div class="ps-skill-item" draggable="true" data-section="${sIdx}" data-skill-idx="${skIdx}"
                  style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--bg-card);border-radius:6px;margin-bottom:4px;border-left:3px solid ${color};cursor:grab;transition:opacity 0.2s;"
                  ondragstart="handlePrintSkillDragStart(event,${sIdx},${skIdx})"
                  ondragend="handlePrintSkillDragEnd(event)">
                <span style="cursor:grab;color:var(--text-dim);font-size:0.8rem;">&#9776;</span>
                <span style="flex:1;font-size:0.85rem;color:var(--text);">${sk.skillLabel || sk.skillId}</span>
                <button onclick="removePrintSectionSkill(${sIdx},${skIdx})" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:1rem;padding:0 4px;" title="Remove">&#10005;</button>
            </div>`
        ).join('');

        return `<div class="ps-section-card" data-section="${sIdx}" style="border:2px solid ${color};border-radius:12px;margin-bottom:12px;overflow:hidden;">
            <div style="background:${color}22;padding:10px 14px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="font-weight:700;color:${color};font-size:0.95rem;min-width:20px;">&#9638;</span>
                <input type="text" value="${sec.label}" onchange="updatePrintSectionLabel(${sIdx},this.value)"
                    style="flex:1;min-width:100px;padding:5px 8px;border:1px solid ${color}66;border-radius:6px;background:var(--bg-card);color:var(--text);font-weight:600;font-size:0.9rem;">
                <div style="display:flex;gap:6px;align-items:center;">
                    <div style="display:flex;flex-direction:column;gap:2px;">
                        <span style="font-size:0.65rem;color:var(--text-dim);font-weight:600;">COLS</span>
                        ${columnsDropdownHTML(`psSectionCols_${sIdx}`, sec.columns)}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:2px;">
                        <span style="font-size:0.65rem;color:var(--text-dim);font-weight:600;">#</span>
                        ${problemCountDropdownHTML(`psSectionCount_${sIdx}`, sec.problemCount)}
                    </div>
                </div>
                ${window.printSections.length > 1 ? `<button onclick="removePrintSection(${sIdx})" style="background:none;border:1px solid #e74c3c88;color:#e74c3c;cursor:pointer;border-radius:6px;padding:4px 8px;font-size:0.8rem;" title="Remove section">&#10005;</button>` : ''}
            </div>
            <div class="ps-skill-list" data-section="${sIdx}"
                 style="padding:10px;min-height:50px;"
                 ondragover="handlePrintSkillDragOver(event)" ondrop="handlePrintSkillDrop(event,${sIdx})" ondragleave="handlePrintSkillDragLeave(event)">
                ${skillItems || '<div style="text-align:center;padding:15px;color:var(--text-dim);font-size:0.85rem;border:2px dashed var(--border);border-radius:8px;">Drag skills here</div>'}
            </div>
        </div>`;
    }).join('');

    // Add change listeners for dropdowns after render
    setTimeout(() => {
        window.printSections.forEach((sec, sIdx) => {
            const colSel = document.getElementById(`psSectionCols_${sIdx}`);
            const cntSel = document.getElementById(`psSectionCount_${sIdx}`);
            if (colSel) colSel.onchange = () => { sec.columns = parseInt(colSel.value); };
            if (cntSel) cntSel.onchange = () => { sec.problemCount = parseInt(cntSel.value); };
        });
    }, 50);
}

// ========== DRAG-AND-DROP HANDLERS ==========
let printDragData = null;

export function handlePrintSkillDragStart(e, sIdx, skIdx) {
    printDragData = { sIdx, skIdx };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${sIdx}:${skIdx}`);
    e.target.style.opacity = '0.4';
}

export function handlePrintSkillDragEnd(e) {
    e.target.style.opacity = '1';
    printDragData = null;
    // Remove all drag-over highlights
    document.querySelectorAll('.ps-skill-list').forEach(el => {
        el.style.background = '';
    });
}

export function handlePrintSkillDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.style.background = 'rgba(8,145,178,0.1)';
}

export function handlePrintSkillDragLeave(e) {
    e.currentTarget.style.background = '';
}

export function handlePrintSkillDrop(e, toSIdx) {
    e.preventDefault();
    e.currentTarget.style.background = '';
    if (!printDragData) return;
    const { sIdx: fromSIdx, skIdx } = printDragData;
    if (fromSIdx === toSIdx) return; // same section

    const [skill] = window.printSections[fromSIdx].skills.splice(skIdx, 1);
    window.printSections[toSIdx].skills.push(skill);
    renderPrintSections();
    printDragData = null;
}

// ========== SECTION MANAGEMENT ==========
export function addPrintSection() {
    if (!window.printSections) return;
    const letter = String.fromCharCode(65 + window.printSections.length);
    window.printSections.push({
        label: `Section ${letter}`,
        columns: 2,
        problemCount: 20,
        skills: []
    });
    renderPrintSections();
}

export function removePrintSection(sIdx) {
    if (!window.printSections || window.printSections.length <= 1) return;
    const sec = window.printSections[sIdx];
    // Move orphan skills to first remaining section
    const remaining = window.printSections.filter((_, i) => i !== sIdx);
    if (sec.skills.length > 0) {
        remaining[0].skills.push(...sec.skills);
    }
    window.printSections = remaining;
    renderPrintSections();
}

export function updatePrintSectionLabel(sIdx, label) {
    if (window.printSections && window.printSections[sIdx]) {
        window.printSections[sIdx].label = label || `Section ${String.fromCharCode(65 + sIdx)}`;
    }
}

export function removePrintSectionSkill(sIdx, skIdx) {
    if (window.printSections && window.printSections[sIdx]) {
        window.printSections[sIdx].skills.splice(skIdx, 1);
        renderPrintSections();
    }
}

// ========== PRINT DIALOG ==========
export function openSimplePrintDialog(skills) {
    let modal = document.getElementById('simplePrintModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'simplePrintModal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
        document.body.appendChild(modal);
    }

    // Initialize sections with all skills in one section
    initPrintSections(skills);
    window.simplePrintSkills = skills;

    modal.innerHTML = `
        <div style="background:var(--bg-card);border-radius:16px;max-width:650px;width:95%;max-height:92vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3);">
            <div style="padding:18px 20px;background:linear-gradient(135deg, var(--accent-green), var(--accent-cyan));border-radius:16px 16px 0 0;color:white;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <h3 style="margin:0;font-size:1.3rem;">Print Worksheet</h3>
                    <button onclick="closeSimplePrintModal()" style="background:rgba(255,255,255,0.2);border:none;color:white;font-size:1.5rem;width:36px;height:36px;border-radius:50%;cursor:pointer;">&#215;</button>
                </div>
            </div>
            <div style="padding:18px;">
                <!-- Title + Sets + Style Row -->
                <div style="display:grid;grid-template-columns:1fr auto auto;gap:10px;margin-bottom:14px;align-items:end;">
                    <div>
                        <label style="display:block;font-weight:600;margin-bottom:4px;color:var(--text-dim);font-size:0.8rem;">TITLE</label>
                        <input type="text" id="simplePrintTitle" placeholder="Math Practice Worksheet" style="width:100%;padding:9px;border:2px solid var(--bg-card-light);border-radius:8px;background:var(--bg-card);color:var(--text-bright);font-size:0.95rem;">
                    </div>
                    <div>
                        <label style="display:block;font-weight:600;margin-bottom:4px;color:var(--text-dim);font-size:0.8rem;">SETS</label>
                        <select id="simplePrintSets" class="dropdown" style="padding:9px;min-width:70px;">
                            <option value="1" selected>1</option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block;font-weight:600;margin-bottom:4px;color:var(--text-dim);font-size:0.8rem;">STYLE</label>
                        <select id="simplePrintStyle" class="dropdown" style="padding:9px;">
                            <option value="color" selected>Color</option>
                            <option value="greyscale">Grey</option>
                        </select>
                    </div>
                </div>

                <!-- Sections -->
                <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                    <label style="font-weight:700;color:var(--text);font-size:0.95rem;">Sections</label>
                    <span style="font-size:0.75rem;color:var(--text-dim);">Drag skills between sections</span>
                </div>
                <div id="printSectionsContainer" style="margin-bottom:10px;"></div>
                <button onclick="addPrintSection()" style="width:100%;padding:10px;background:var(--bg-card-light);border:2px dashed var(--border);border-radius:10px;color:var(--text-dim);font-weight:600;cursor:pointer;font-size:0.9rem;margin-bottom:14px;">
                    + Add Section
                </button>

                <!-- Answer Key Options -->
                <div style="margin-bottom:14px;padding:10px;background:var(--bg-card-light);border-radius:10px;">
                    <label style="display:block;font-weight:600;margin-bottom:6px;color:var(--text-dim);font-size:0.85rem;">Answer Key</label>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <input type="checkbox" id="simplePrintAnswerKey" checked style="width:16px;height:16px;">
                        <label for="simplePrintAnswerKey" style="font-size:0.85rem;color:var(--text);">Include Answer Key</label>
                    </div>
                    <div id="simplePrintAnswerKeyOptions" style="margin-left:24px;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                            <input type="radio" name="simplePrintAnswerType" id="simplePrintAnswersOnly" checked style="width:14px;height:14px;">
                            <label for="simplePrintAnswersOnly" style="font-size:0.82rem;color:var(--text-dim);">Answers Only</label>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                            <input type="radio" name="simplePrintAnswerType" id="simplePrintWorkedSolutions" style="width:14px;height:14px;">
                            <label for="simplePrintWorkedSolutions" style="font-size:0.82rem;color:var(--text-dim);">Worked Solutions</label>
                        </div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <input type="checkbox" id="simplePrintSeparatePage" style="width:14px;height:14px;">
                            <label for="simplePrintSeparatePage" style="font-size:0.82rem;color:var(--text-dim);">Separate page</label>
                        </div>
                    </div>
                </div>

                <button onclick="generateSimplePrint()" style="width:100%;padding:14px;background:linear-gradient(135deg, var(--accent-green), var(--accent-cyan));color:white;border:none;border-radius:10px;font-size:1.1rem;font-weight:700;cursor:pointer;">
                    Generate & Print
                </button>
            </div>
        </div>`;

    modal.style.display = 'flex';

    // Render sections after DOM is ready
    setTimeout(() => {
        renderPrintSections();
        const akCheckbox = document.getElementById('simplePrintAnswerKey');
        const akOptions = document.getElementById('simplePrintAnswerKeyOptions');
        if (akCheckbox && akOptions) {
            akCheckbox.addEventListener('change', function() {
                akOptions.style.opacity = this.checked ? '1' : '0.4';
                akOptions.style.pointerEvents = this.checked ? 'auto' : 'none';
            });
        }
    }, 50);
}

export function closeSimplePrintModal() {
    const modal = document.getElementById('simplePrintModal');
    if (modal) modal.style.display = 'none';
}

export function generateSimplePrint() {
    const sections = window.printSections || [];
    // Check at least one section has skills
    const hasSkills = sections.some(s => s.skills.length > 0);
    if (!hasSkills) {
        if (typeof window.showToast === 'function') window.showToast('Add skills to at least one section', 'error');
        return;
    }

    // Read section settings from the DOM (in case user changed dropdowns)
    sections.forEach((sec, sIdx) => {
        const colSel = document.getElementById(`psSectionCols_${sIdx}`);
        const cntSel = document.getElementById(`psSectionCount_${sIdx}`);
        if (colSel) sec.columns = parseInt(colSel.value) || 2;
        if (cntSel) sec.problemCount = parseInt(cntSel.value) || 20;
    });

    const title = document.getElementById('simplePrintTitle')?.value || '';
    const sets = parseInt(document.getElementById('simplePrintSets')?.value) || 1;
    const style = document.getElementById('simplePrintStyle')?.value || 'color';
    const includeAnswerKey = document.getElementById('simplePrintAnswerKey')?.checked !== false;
    const useWorkedSolutions = document.getElementById('simplePrintWorkedSolutions')?.checked || false;
    const separatePage = document.getElementById('simplePrintSeparatePage')?.checked || false;

    closeSimplePrintModal();

    // Generate using sections
    generateWorksheetFromSections(sections, sets, title, style, includeAnswerKey, useWorkedSolutions, separatePage);
}

// ========== SECTIONS-AWARE WORKSHEET GENERATION ==========
export function generateWorksheetFromSections(sections, numSets, title, printStyle, includeAnswerKey, useWorkedSolutions, separatePage) {
    const range = parseInt(document.getElementById("rangeSelect")?.value) || 100;
    const decimals = parseInt(document.getElementById("decimalSelect")?.value) || 0;
    const greyscaleStyle = printStyle === 'greyscale' ? 'filter: grayscale(100%);' : '';
    const worksheetTitle = title || 'Math Practice Worksheet';
    const getSetLabel = (i) => String.fromCharCode(65 + i);

    // Filter to sections that have skills
    const activeSections = sections.filter(s => s.skills.length > 0);
    if (activeSections.length === 0) return;

    let allSetsHTML = '';

    for (let setNum = 0; setNum < numSets; setNum++) {
        let sectionsHTML = '';
        let globalProblemIdx = 0;
        let allAnswers = [];

        for (const sec of activeSections) {
            const columns = sec.columns || 2;
            const problemCount = sec.problemCount || 20;
            const skillList = sec.skills.map(s => ({
                categoryId: s.categoryId,
                skillId: s.skillId,
                skillLabel: s.skillLabel || s.skillId,
                weight: s.percent || s.weight || 0
            }));

            const hasWeights = skillList.some(s => s.weight > 0);
            const problems = [];

            for (let i = 0; i < problemCount; i++) {
                const skillInfo = hasWeights
                    ? selectSkillByWeightFromList(skillList)
                    : skillList[i % skillList.length];
                const problem = generateProblemForSkillStatic(skillInfo, range, decimals);
                problems.push(problem || generateCategoryFallbackStatic(skillInfo));
            }

            const gridGap = columns >= 10 ? '6px 4px' : columns >= 6 ? '10px 8px' : columns >= 3 ? '15px 12px' : '22px 20px';
            const problemsHTML = problems.map((p, i) => formatProblemForPrint(p, globalProblemIdx + i, columns)).join('');

            // Section label in worksheet (only if more than one section)
            const sectionLabel = activeSections.length > 1
                ? `<div style="font-weight:700;font-size:1.1rem;margin:18px 0 10px;padding-bottom:6px;border-bottom:2px solid #333;">${sec.label}</div>`
                : '';

            sectionsHTML += `${sectionLabel}<div class="worksheet-problems" style="grid-template-columns:repeat(${columns},1fr);gap:${gridGap};">${problemsHTML}</div>`;

            problems.forEach((p, i) => {
                allAnswers.push({ idx: globalProblemIdx + i, ans: p.ans });
            });
            globalProblemIdx += problems.length;
        }

        let answerKeyHTML = '';
        if (includeAnswerKey && !separatePage) {
            const answersHTML = allAnswers.map(a =>
                `<div class="answer-key-item"><span class="answer-key-num">${a.idx + 1}.</span><span class="answer-key-ans">${a.ans}</span></div>`
            ).join('');
            answerKeyHTML = `<div class="answer-key-section"><div class="answer-key-title">Answer Key</div><div class="answer-key-grid">${answersHTML}</div></div>`;
        }

        const pageBreak = setNum > 0 ? 'page-break-before: always;' : '';
        const setLabel = numSets > 1 ? `<div style="text-align:right;font-weight:700;font-size:14px;">Set ${getSetLabel(setNum)}</div>` : '';

        allSetsHTML += `
            <div class="worksheet-set" style="${pageBreak}${greyscaleStyle}">
                ${setLabel}
                <div class="worksheet-header">
                    <div class="worksheet-title">${worksheetTitle}</div>
                    <div class="worksheet-info-row">
                        <div class="worksheet-field"><span class="worksheet-field-label">Name:</span><span class="worksheet-field-line"></span></div>
                        <div class="worksheet-field"><span class="worksheet-field-label">Date:</span><span class="worksheet-field-line"></span></div>
                    </div>
                </div>
                ${sectionsHTML}
                ${answerKeyHTML}
            </div>`;

        if (includeAnswerKey && separatePage) {
            const answersHTML = allAnswers.map(a =>
                `<div class="answer-key-item"><span class="answer-key-num">${a.idx + 1}.</span><span class="answer-key-ans">${a.ans}</span></div>`
            ).join('');
            allSetsHTML += `
                <div class="worksheet-set" style="page-break-before: always;${greyscaleStyle}">
                    <div style="font-weight:700;font-size:1.2rem;margin-bottom:15px;">Answer Key${numSets > 1 ? ` - Set ${getSetLabel(setNum)}` : ''}</div>
                    <div class="answer-key-grid">${answersHTML}</div>
                </div>`;
        }
    }

    const previewContent = document.getElementById('printPreviewContent');
    const previewContainer = document.getElementById('printPreviewContainer');
    if (previewContent && previewContainer) {
        previewContent.innerHTML = allSetsHTML;
        previewContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// ========== STATIC HELPERS (no closure over shared state) ==========
function selectSkillByWeightFromList(skillList) {
    const totalWeight = skillList.reduce((sum, s) => sum + (s.weight || 0), 0);
    if (totalWeight === 0) return skillList[Math.floor(Math.random() * skillList.length)];
    const roll = Math.random() * totalWeight;
    let cumulative = 0;
    for (const skill of skillList) {
        cumulative += (skill.weight || 0);
        if (roll < cumulative) return skill;
    }
    return skillList[skillList.length - 1];
}

function generateProblemForSkillStatic(skillInfo, range, decimals, retryCount = 0) {
    const MAX_RETRIES = 3;
    const savedCategory = state.category;
    const savedSkill = state.skill;
    const savedRange = state.range;
    const savedDecimalPlaces = state.decimalPlaces;
    const savedGameMode = state.gameMode;

    state.category = skillInfo.categoryId;
    state.skill = skillInfo.skillId;
    state.range = range;
    state.decimalPlaces = decimals;
    state.gameMode = 'practice';
    if (!state.selectedNumbers || state.selectedNumbers.length === 0) {
        state.selectedNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
    }

    try {
        const q = generateQuestion();
        state.category = savedCategory;
        state.skill = savedSkill;
        state.range = savedRange;
        state.decimalPlaces = savedDecimalPlaces;
        state.gameMode = savedGameMode;

        if (q && q.text) {
            return {
                text: q.text, ans: q.ans,
                skillLabel: q.skillLabel || skillInfo.skillLabel || '',
                printFormat: q.printFormat || 'horizontal',
                visual: q.visual || '', a: q.a, b: q.b, op: q.op,
                answerType: q.answerType,
                factorPairsData: q.factorPairsData, numberTheoryData: q.numberTheoryData,
                clockData: q.clockData, measurementData: q.measurementData,
                shapeData: q.shapeData, geometryData: q.geometryData,
                dataData: q.dataData, fractionData: q.fractionData,
                decimalData: q.decimalData, integerData: q.integerData,
                algebraData: q.algebraData, patternData: q.patternData,
                tableData: q.tableData, estimationData: q.estimationData,
                areaModelData: q.areaModelData, areaModelDivData: q.areaModelDivData,
                factFamilyData: q.factFamilyData, numberFamilyData: q.numberFamilyData,
                orderData: q.orderData, divisionNotation: q.divisionNotation,
                hint: q.hint, dualAnswers: q.dualAnswers, options: q.options
            };
        }
        if (retryCount < MAX_RETRIES) return generateProblemForSkillStatic(skillInfo, range, decimals, retryCount + 1);
    } catch(e) {
        state.category = savedCategory;
        state.skill = savedSkill;
        state.range = savedRange;
        state.decimalPlaces = savedDecimalPlaces;
        state.gameMode = savedGameMode;
        if (retryCount < MAX_RETRIES) return generateProblemForSkillStatic(skillInfo, range, decimals, retryCount + 1);
    }
    return null;
}

function generateCategoryFallbackStatic(skillInfo) {
    const cat = skillInfo.categoryId || 'addition';
    let a, b, text, ans, op, label;
    if (cat === 'multiplication' || cat === 'mult_facts') {
        a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1;
        op = '\u00D7'; ans = a * b; text = `${a} \u00D7 ${b} = ___`; label = 'Multiply';
    } else if (cat === 'division' || cat === 'div_facts') {
        b = Math.floor(Math.random() * 11) + 2; ans = Math.floor(Math.random() * 12) + 1; a = b * ans;
        op = '\u00F7'; text = `${a} \u00F7 ${b} = ___`; label = 'Divide';
    } else if (cat === 'subtraction' || cat === 'sub_facts') {
        a = Math.floor(Math.random() * 18) + 2; b = Math.floor(Math.random() * a) + 1;
        op = '\u2212'; ans = a - b; text = `${a} \u2212 ${b} = ___`; label = 'Subtract';
    } else {
        a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1;
        op = '+'; ans = a + b; text = `${a} + ${b} = ___`; label = 'Add';
    }
    return { text, ans, skillLabel: label, printFormat: 'horizontal', a, b, op };
}

// Legacy wrapper - creates a single section and delegates to sections-based generation
export function generateWorksheetFromSkills(skills, problemCount, numSets, title, columns = 2, printStyle = 'color', includeAnswerKey = true, useWorkedSolutions = false, separatePage = false) {
    const sections = [{
        label: 'Section A',
        columns: columns,
        problemCount: problemCount,
        skills: skills.map(s => ({ ...s }))
    }];
    generateWorksheetFromSections(sections, numSets, title, printStyle, includeAnswerKey, useWorkedSolutions, separatePage);
}

export function buildQueuedSkillsWeightedSection() {
    if (!window.queuedSkillsFullInfo || window.queuedSkillsFullInfo.length === 0) {
        const container = document.getElementById('queuedSkillsWeightedSection');
        if (container) container.style.display = 'none';
        return;
    }
    
    const container = document.getElementById('queuedSkillsWeightedSection');
    if (!container) return;
    
    // Show the section
    container.style.display = 'block';
    
    // Update the title with skill count
    const titleEl = container.querySelector('.print-section-title');
    if (titleEl) {
        titleEl.innerHTML = `
            <span>📋 Selected Skills</span>
            <span style="font-size:0.75rem;background:var(--accent-purple);color:white;padding:2px 8px;border-radius:10px;">${window.queuedSkillsFullInfo.length} SKILLS</span>
        `;
    }
    
    const listContainer = document.getElementById('queuedSkillsWeightedList');
    if (!listContainer) return;
    
    // Clear and rebuild
    listContainer.innerHTML = '';
    
    // Create weighted skill rows for each queued skill
    window.queuedSkillsFullInfo.forEach((skill, index) => {
        const row = document.createElement('div');
        row.className = 'queued-skill-weight-row';
        row.style.cssText = 'display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 12px;background:var(--bg-card);border-radius:8px;margin-bottom:8px;border-left:3px solid ' + (skill.domainColor || 'var(--accent-cyan)') + ';';
        
        const cleanLabel = skill.skillLabel.replace(/^[🟢🟡🟠🔴🎲🔢🥧📐📊🔤📏🔀🎯🔬🧮📍📈⬜🔷½]+\s*/, '');
        
        row.innerHTML = `
            <div>
                <div style="font-weight:600;color:var(--text);">${skill.categoryIcon} ${cleanLabel}</div>
                <div style="font-size:0.75rem;color:var(--text-dim);">${skill.categoryName}</div>
            </div>
            <div style="display:flex;align-items:center;gap:5px;">
                <input type="number" class="queued-skill-percent" id="queuedSkillPercent_${index}" 
                       data-skill-id="${skill.skillId}" data-category-id="${skill.categoryId}"
                       min="0" max="100" value="0" 
                       style="width:55px;text-align:center;padding:6px 4px;border:2px solid var(--border);border-radius:6px;background:var(--bg-card);color:var(--text);font-size:0.9rem;"
                       onchange="updateQueuedSkillsTotal()" oninput="updateQueuedSkillsTotal()">
                <span style="font-weight:600;color:var(--text-dim);">%</span>
            </div>
            <button onclick="removeQueuedSkillWeight(${index})" style="padding:4px 8px;background:transparent;border:1px solid var(--text-dim);color:var(--text-dim);border-radius:6px;cursor:pointer;font-size:0.9rem;" title="Remove">×</button>
        `;
        listContainer.appendChild(row);
    });
    
    updateQueuedSkillsTotal();
}

export function removeQueuedSkillWeight(index) {
    if (window.queuedSkillsFullInfo) {
        window.queuedSkillsFullInfo.splice(index, 1);
        buildQueuedSkillsWeightedSection();
    }
}

export function updateQueuedSkillsTotal() {
    const inputs = document.querySelectorAll('.queued-skill-percent');
    let total = 0;
    inputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    
    const totalDisplay = document.getElementById('queuedSkillsTotalPercent');
    const remainingDisplay = document.getElementById('queuedSkillsRemainingPercent');
    const warningDisplay = document.getElementById('queuedSkillsWarning');
    
    if (totalDisplay) {
        totalDisplay.textContent = total + '%';
        totalDisplay.style.color = total > 100 ? '#e74c3c' : total > 0 ? 'var(--accent-green)' : 'var(--text-dim)';
    }
    if (remainingDisplay) {
        remainingDisplay.textContent = Math.max(0, 100 - total);
    }
    if (warningDisplay) {
        warningDisplay.style.display = total > 100 ? 'block' : 'none';
    }
}

export function distributeQueuedSkillsEvenly() {
    const inputs = document.querySelectorAll('.queued-skill-percent');
    if (inputs.length === 0) return;
    
    const perSkill = Math.floor(100 / inputs.length);
    inputs.forEach(input => {
        input.value = perSkill;
    });
    updateQueuedSkillsTotal();
}

export function clearQueuedSkillsWeights() {
    const inputs = document.querySelectorAll('.queued-skill-percent');
    inputs.forEach(input => {
        input.value = 0;
    });
    updateQueuedSkillsTotal();
}

export function getQueuedSkillsWeights() {
    // Returns array of {categoryId, skillId, percent} for skills with weight > 0
    const weights = [];
    const inputs = document.querySelectorAll('.queued-skill-percent');
    inputs.forEach(input => {
        const percent = parseInt(input.value) || 0;
        if (percent > 0) {
            weights.push({
                categoryId: input.dataset.categoryId,
                skillId: input.dataset.skillId,
                percent: percent
            });
        }
    });
    return weights;
}

export function applyQueuedSkillsToPrint() {
    if (!window.queuedPrintSkills) return;
    
    // First, deselect all
    deselectAllPrintSkills();
    
    // Then select only queued skills
    for (const [categoryId, skills] of Object.entries(window.queuedPrintSkills)) {
        skills.forEach(skillId => {
            const checkbox = document.getElementById(`printskill_${categoryId}_${skillId}`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        // Update category checkbox state
        updatePrintCategoryCheckbox(categoryId);
    }
    
    // Show notification
    showNotification(`Applied ${window.skillQueue.length} selected skill${window.skillQueue.length > 1 ? 's' : ''} to print settings`, 'success');
    
    // Clear the temporary storage
    delete window.queuedPrintSkills;
}


export function openPrintSettings() {
    // Use the new simple print dialog instead of old complex one
    // Build skills list from current selection
    const skills = window.skillQueue.map(s => ({
        categoryId: s.categoryId,
        skillId: s.skillId,
        skillLabel: s.skillLabel || s.skillId,
        categoryIcon: s.categoryIcon || '📚',
        categoryName: s.categoryName || s.categoryId
    }));
    
    // If no skills in queue, use current game settings
    if (skills.length === 0) {
        const category = document.getElementById("categorySelect")?.value || 'addition';
        const skill = document.getElementById("skillSelect")?.value || 'add_facts';
        const domain = getDomainByCategory(category) || 'number_operations';
        const domainInfo = DOMAINS[domain];
        const categoryInfo = domainInfo?.categories?.find(c => c.id === category);
        
        skills.push({
            categoryId: category,
            skillId: skill,
            skillLabel: skill,
            categoryIcon: categoryInfo?.icon || '📚',
            categoryName: categoryInfo?.name || category
        });
    }
    
    openSimplePrintDialog(skills);
}

export function closePrintSettings() {
    // Close new simple print modal
    closeSimplePrintModal();
}

// ========== GLOBAL SKILLS (Add Skills Modal) ==========
// This is the shared skill list used across game modes and printing
